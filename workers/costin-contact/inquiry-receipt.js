import { fubPayload, json } from './contact-contract.js';
import { notificationPayload, confirmationPayload } from './email-payloads.js';

const DAY = 86400000, RETENTION = 30 * DAY, RETRY_WINDOW = 23 * 3600000;
const RETRIES = [60000, 300000, 1800000, 10800000];
const accepted = r => r.crm?.state === 'accepted' || r.notification?.state === 'accepted';
const publicResult = (r, duplicate) => accepted(r)
  ? { status: 200, body: { success: true, accepted: true, duplicate, receiptId: r.id, captureStatus: r.crm.state === 'accepted' ? 'crm_accepted' : 'email_fallback', message: 'Thanks! Your message was received.' } }
  : { status: 503, body: { success: false, accepted: false, receiptId: r.id, error: 'We could not confirm delivery. Please call (850) 266-5005 or try again shortly.', message: 'We could not confirm delivery. Please call (850) 266-5005 or try again shortly.' } };

// Injectable dependencies support local, network-isolated failure tests.
export class ReceiptProcessor {
  constructor(storage, env, { fetcher = (...args) => fetch(...args), now = () => Date.now(), log = (level, value) => console[level](JSON.stringify(value)) } = {}) {
    this.storage = storage; this.env = env; this.fetcher = fetcher; this.now = now; this.log = log;
    this.queue = Promise.resolve();
  }
  serial(work) { const next = this.queue.then(work); this.queue = next.catch(() => {}); return next; }
  submit(inquiry) { return this.serial(async () => {
    let r = await this.storage.get('receipt');
    let duplicate = Boolean(r);
    if (!r || (accepted(r) && this.now() - r.createdAt >= DAY)) {
      duplicate = false;
      r = { id: crypto.randomUUID(), createdAt: this.now(), inquiry, crm: { state: 'pending' }, notification: { state: 'pending' }, confirmation: { state: 'pending' }, task: { state: 'pending' }, retryCount: 0 };
      await this.storage.put('receipt', r); // Never call a provider if persistence fails.
      await this.storage.setAlarm(this.now() + RETRIES[0]);
    } else if (accepted(r) || this.now() < (r.nextAttemptAt || 0)) return publicResult(r, true);
    await this.deliver(r);
    return publicResult(r, duplicate);
  }); }
  alarm() { return this.serial(async () => {
    const r = await this.storage.get('receipt'); if (!r) return;
    if (this.now() - r.createdAt >= RETENTION) {
      if (!accepted(r)) this.emit('error', r, 'uncaptured_receipt_retention_expired');
      await this.storage.deleteAll(); await this.storage.deleteAlarm(); return;
    }
    if (r.retryCount >= RETRIES.length || this.now() - r.createdAt >= RETRY_WINDOW) {
      await this.storage.setAlarm(r.createdAt + RETENTION); return;
    }
    r.retryCount += 1;
    await this.deliver(r);
  }); }
  emit(level, r, event) {
    this.log(level, { event, receiptId: r.id, site: r.inquiry.attribution.site, channel: r.inquiry.attribution.channel, platform: r.inquiry.attribution.platform, crm: r.crm.state, notification: r.notification.state, confirmation: r.confirmation.state, task: r.task.state, retryCount: r.retryCount });
  }
  async save(r) { await this.storage.put('receipt', r); }
  async request(url, options, timeout) {
    try {
      const response = await this.fetcher(url, { ...options, signal: AbortSignal.timeout(timeout) });
      let body = null; try { body = await response.json(); } catch {}
      return { status: response.status, body };
    } catch { return { status: null, body: null }; }
  }
  async deliver(r) {
    const auth = { Authorization: 'Basic ' + btoa(this.env.FUB_API_KEY + ':'), 'Content-Type': 'application/json', 'X-System': 'GreggCostin.com Contact Form', 'X-System-Key': 'costin-contact-form' };
    // A persisted "sending" may have reached FUB before an isolate stopped.
    // Never blindly replay a non-idempotent CRM event or task after uncertainty.
    if (r.crm.state === 'sending') r.crm.state = 'unknown';
    if (r.task.state === 'sending') r.task.state = 'unknown';
    if (['pending', 'rate_limited'].includes(r.crm.state)) {
      if (!this.env.FUB_API_KEY) r.crm = { state: 'not_configured' };
      else {
        r.crm = { state: 'sending' }; await this.save(r);
        const result = await this.request('https://api.followupboss.com/v1/events', { method: 'POST', headers: auth, body: JSON.stringify(fubPayload(r)) }, 8000);
        const id = result.body?.id;
        r.crm = [200, 201].includes(result.status) && Number.isInteger(id) && id > 0
          ? { state: 'accepted', status: result.status, personId: id }
          : { state: result.status === 204 ? 'ignored' : result.status === 429 ? 'rate_limited' : result.status && result.status >= 400 && result.status < 500 ? 'rejected' : 'unknown', status: result.status };
        await this.save(r);
      }
    }
    // Owner notification independently preserves the inquiry when CRM ingest fails.
    // Success requires an accepted CRM record or an accepted owner notification ID.
    await this.email(r, 'notification', notificationPayload);
    if (accepted(r)) await this.email(r, 'confirmation', confirmationPayload);
    if (r.crm.state === 'accepted' && r.task.state === 'pending') {
      r.task = { state: 'sending' }; await this.save(r);
      const result = await this.request('https://api.followupboss.com/v1/tasks', { method: 'POST', headers: auth, body: JSON.stringify({ personId: r.crm.personId, name: `Follow up with ${r.inquiry.name} - ${r.inquiry.inquiryType}`, dueDate: new Date(this.now() + 7200000).toISOString().slice(0, 10), assignedUserId: 1 }) }, 5000);
      r.task = [200, 201].includes(result.status) && Number.isInteger(result.body?.id) && result.body.id > 0 ? { state: 'accepted', id: result.body.id } : { state: 'unknown', status: result.status };
    }
    const incomplete = r.crm.state !== 'accepted' || r.notification.state !== 'accepted' || (accepted(r) && r.confirmation.state !== 'accepted') || (r.crm.state === 'accepted' && r.task.state !== 'accepted');
    this.emit(incomplete ? 'warn' : 'info', r, accepted(r) ? (incomplete ? 'inquiry_captured_with_delivery_gap' : 'inquiry_captured') : 'inquiry_not_confirmed');
    r.nextAttemptAt = this.now() + (RETRIES[r.retryCount] || RETRY_WINDOW);
    await this.save(r);
    await this.storage.setAlarm(incomplete && r.retryCount < RETRIES.length && this.now() - r.createdAt < RETRY_WINDOW ? r.nextAttemptAt : r.createdAt + RETENTION);
  }
  async email(r, key, buildPayload) {
    if (r[key].state === 'accepted' || this.now() - r.createdAt >= RETRY_WINDOW) return;
    if (!this.env.RESEND_API_KEY || !this.env.NOTIFICATION_FROM || (key === 'notification' && !this.env.GREGG_EMAIL)) { r[key] = { state: 'not_configured' }; await this.save(r); return; }
    // Freeze bytes across retries/configuration changes. Resend's same-key
    // protection lasts 24h; retries stop before that window closes.
    r[key].payload ||= buildPayload(this.env, r);
    r[key].state = 'sending'; await this.save(r);
    const result = await this.request('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: 'Bearer ' + this.env.RESEND_API_KEY, 'Content-Type': 'application/json', 'Idempotency-Key': `costin-contact/${r.id}/${key}` }, body: JSON.stringify(r[key].payload) }, 6000);
    r[key].state = [200, 201].includes(result.status) && typeof result.body?.id === 'string' && result.body.id.length > 0 ? 'accepted' : 'unconfirmed';
    r[key].status = result.status;
    if (r[key].state === 'accepted') r[key].id = result.body.id;
    await this.save(r);
  }
}

// Fetch-based Durable Object interface. Persistent state survives deployments.
export class InquiryReceipt {
  constructor(ctx, env) { this.processor = new ReceiptProcessor(ctx.storage, env); }
  async fetch(request) { const r = await this.processor.submit(await request.json()); return json(r.body, r.status); }
  alarm() { return this.processor.alarm(); }
}
