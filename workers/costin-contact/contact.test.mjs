import test from 'node:test';
import assert from 'node:assert/strict';
import worker from './worker.js';
import { ReceiptProcessor } from './inquiry-receipt.js';
import { normalize, attribution, fingerprint, fubPayload } from './contact-contract.js';
const env = { FUB_API_KEY: 'offline-fub', RESEND_API_KEY: 'offline-resend', GREGG_EMAIL: 'owner@example.invalid', NOTIFICATION_FROM: 'forms@example.invalid' };
const body = { name: 'Offline Example', email: 'test@example.invalid', phone: '5550000000', inquiryType: 'Selling My Home', message: 'Local-only reliability test', page_path: '/sell', utm_source: 'chatgpt.com' };
const req = (data = body, origin = 'https://greggcostin.com') => new Request('https://local.invalid/', { method: 'POST', headers: { 'content-type': 'application/json', Origin: origin }, body: typeof data === 'string' ? data : JSON.stringify(data) });
const inquiry = normalize(body, req());
class Store {
  constructor() { this.data = new Map(); this.alarmAt = null; }
  async get(k) { return structuredClone(this.data.get(k)); }
  async put(k, v) { this.data.set(k, structuredClone(v)); }
  async setAlarm(t) { this.alarmAt = t; }
  async deleteAll() { this.data.clear(); }
  async deleteAlarm() { this.alarmAt = null; }
}
const response = (status, data) => new Response(status === 204 ? null : JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });
function harness(handler, store = new Store()) {
  const calls = [], logs = []; let now = Date.parse('2026-09-07T12:00:00Z');
  const fetcher = async (url, options) => {
    const call = { url, options, body: JSON.parse(options.body) }; calls.push(call);
    if (handler) return handler(call, calls);
    return response(201, { id: url.includes('/events') ? 123 : url.includes('/tasks') ? 456 : 'email-' + calls.length });
  };
  const deps = { fetcher, now: () => now, log: (level, value) => logs.push({ level, ...value }) };
  return { processor: new ReceiptProcessor(store, env, deps), store, calls, logs, deps, advance(ms) { now += ms; } };
}

test('all providers fail: truthful 503, saved inquiry, no customer confirmation or CRM task', async () => {
  const h = harness(() => response(503, { error: 'unavailable' }));
  const r = await h.processor.submit(inquiry);
  assert.equal(r.status, 503); assert.equal(r.body.success, false);
  assert.equal(h.calls.length, 2); assert.equal(h.calls[1].body.to[0], env.GREGG_EMAIL);
  assert.equal((await h.store.get('receipt')).inquiry.email, body.email);
  assert.ok(h.store.alarmAt); assert.equal(h.logs.at(-1).event, 'inquiry_not_confirmed');
});
test('FUB 204 is ignored, not accepted; successful owner notification is explicitly an email fallback', async () => {
  const h = harness(c => response(c.url.includes('/events') ? 204 : 201, { id: 'mail-id' }));
  const r = await h.processor.submit(inquiry);
  assert.equal(r.body.captureStatus, 'email_fallback'); assert.equal((await h.store.get('receipt')).crm.state, 'ignored');
  assert.equal(h.calls.filter(c => c.url.includes('/tasks')).length, 0);
  assert.match(h.calls[1].body.html, /Not confirmed \(ignored\)/);
});
test('ignored CRM plus failed email does not confirm receipt', async () => {
  const h = harness(c => response(c.url.includes('/events') ? 204 : 503, {}));
  assert.equal((await h.processor.submit(inquiry)).status, 503);
});
test('200 CRM response without a person ID is not acceptance', async () => {
  const h = harness(c => response(c.url.includes('/events') ? 200 : 503, {}));
  assert.equal((await h.processor.submit(inquiry)).status, 503);
  assert.equal((await h.store.get('receipt')).crm.state, 'unknown');
});
test('valid CRM receipt remains accepted when optional emails and task fail', async () => {
  const h = harness(c => c.url.includes('/events') ? response(201, { id: 987 }) : response(503, {}));
  const r = await h.processor.submit(inquiry);
  assert.equal(r.status, 200); assert.equal(r.body.captureStatus, 'crm_accepted');
  assert.equal(h.calls.find(c => c.url.includes('/tasks')).body.personId, 987);
  assert.ok(h.logs.some(l => l.event === 'inquiry_captured_with_delivery_gap'));
});
test('concurrent identical submissions produce one CRM event, one task and one email per recipient', async () => {
  const h = harness(); const results = await Promise.all(Array.from({ length: 8 }, () => h.processor.submit(inquiry)));
  assert.equal(h.calls.length, 4); assert.equal(new Set(results.map(r => r.body.receiptId)).size, 1);
  assert.equal(results.filter(r => r.body.duplicate).length, 7);
});
test('a new processor with the same durable storage does not resend after an isolate restart', async () => {
  const h = harness(); const first = await h.processor.submit(inquiry);
  const second = await new ReceiptProcessor(h.store, env, h.deps).submit(inquiry);
  assert.equal(second.body.receiptId, first.body.receiptId); assert.equal(h.calls.length, 4);
});
test('an uncertain CRM call is not replayed when owner email retries after restart', async () => {
  let emailWorks = false;
  const h = harness(c => c.url.includes('/events') ? Promise.reject(Error('timeout')) : response(emailWorks ? 201 : 503, { id: 'mail' }));
  await h.processor.submit(inquiry); emailWorks = true; h.advance(61000);
  await new ReceiptProcessor(h.store, env, h.deps).alarm();
  assert.equal(h.calls.filter(c => c.url.includes('/events')).length, 1);
  assert.equal((await h.store.get('receipt')).notification.state, 'accepted');
});
test('persisted sending state is treated as uncertain and does not cause a blind event replay', async () => {
  const h = harness(); await h.store.put('receipt', { id: 'fixed', createdAt: h.deps.now(), inquiry, crm: { state: 'sending' }, notification: { state: 'pending' }, confirmation: { state: 'pending' }, task: { state: 'sending' }, retryCount: 0 });
  const r = await h.processor.submit(inquiry);
  assert.equal(r.body.captureStatus, 'email_fallback'); assert.ok(h.calls.every(c => c.url.includes('resend.com')));
});
test('email retries keep the same idempotency key and exact payload across config changes', async () => {
  const h = harness(() => response(503, {})); await h.processor.submit(inquiry);
  h.advance(61000); await new ReceiptProcessor(h.store, { ...env, GREGG_EMAIL: 'new-owner@example.invalid' }, h.deps).alarm();
  const mails = h.calls.filter(c => c.url.includes('resend.com'));
  assert.equal(mails.length, 2); assert.equal(mails[0].options.headers['Idempotency-Key'], mails[1].options.headers['Idempotency-Key']);
  assert.equal(mails[0].options.body, mails[1].options.body);
});
test('CRM 429 retries safely with the same website receipt and creates task from returned person', async () => {
  let attempts = 0; const h = harness(c => c.url.includes('/events') ? response(++attempts === 1 ? 429 : 201, { id: 123 }) : response(201, { id: c.url.includes('/tasks') ? 456 : 'email' }));
  await h.processor.submit(inquiry); h.advance(61000); await h.processor.alarm();
  const events = h.calls.filter(c => c.url.includes('/events'));
  assert.equal(events.length, 2); assert.equal(events[0].options.body, events[1].options.body);
  assert.equal((await h.store.get('receipt')).crm.state, 'accepted');
});
test('email retry stops before the provider 24h idempotency window expires', async () => {
  const h = harness(() => response(503, {})); await h.processor.submit(inquiry); h.advance(24 * 3600000);
  await h.processor.alarm(); assert.equal(h.calls.length, 2);
});
test('an intentional repeat after a day receives a new receipt', async () => {
  const h = harness(); const a = await h.processor.submit(inquiry); h.advance(25 * 3600000); const b = await h.processor.submit(inquiry);
  assert.notEqual(a.body.receiptId, b.body.receiptId); assert.equal(h.calls.length, 8); assert.equal(b.body.duplicate, false);
});
test('storage failure prevents all provider calls', async () => {
  const store = new Store(); store.put = async () => { throw Error('disk failure'); }; const h = harness(null, store);
  await assert.rejects(h.processor.submit(inquiry), /disk failure/); assert.equal(h.calls.length, 0);
});
test('expired receipts are removed without replaying providers', async () => {
  const h = harness(); await h.processor.submit(inquiry); h.advance(31 * 86400000); await h.processor.alarm();
  assert.equal(await h.store.get('receipt'), undefined); assert.equal(h.calls.length, 4);
});
test('logs contain receipt and channel, no lead name, email, phone, message or secrets', async () => {
  const h = harness(); await h.processor.submit(inquiry); const logs = JSON.stringify(h.logs);
  for (const value of [body.name, body.email, body.phone, body.message, env.FUB_API_KEY, env.RESEND_API_KEY]) assert.ok(!logs.includes(value));
  assert.match(logs, /ai_referral/); assert.match(logs, /ChatGPT/);
});
test('source and stage are preserved for civilian, military, social, and future guide inquiries', () => {
  for (const type of ['Selling My Home', 'First-Time Home Buyer', 'PCS / Relocation — Buying', 'PCS / Relocation — Selling', 'PCS / Relocation — Both', 'Coastal Guide Download']) assert.equal(normalize({ ...body, inquiryType: type }, req()).stage, 'Lead');
  assert.equal(normalize({ ...body, inquiryType: 'General Question' }, req()).stage, 'Prospect');
  assert.equal(attribution({ ...body, utm_source: 'facebook' }, req()).fubSource, 'Social');
  assert.equal(normalize(body, req(body, 'https://pensacolamilitaryhousing.com')).attribution.fubSource, 'PensacolaMilitaryHousing.com');
});
test('all five identifiable AI referrers are classified; Google and Bing search are not assumed to be AI', () => {
  for (const [host, platform] of [['chatgpt.com','ChatGPT'],['www.perplexity.ai','Perplexity'],['claude.ai','Claude'],['gemini.google.com','Gemini'],['copilot.microsoft.com','Copilot']]) assert.equal(attribution({ referrer: 'https://' + host + '/answer' }, req()).platform, platform);
  for (const host of ['www.google.com','www.bing.com']) { const a = attribution({ referrer: 'https://' + host + '/search' }, req()); assert.equal(a.channel, 'organic_search'); assert.equal(a.platform, null); }
  assert.equal(attribution({ referrer: 'https://chatgpt.com.evil.invalid/' }, req()).platform, null);
  assert.equal(attribution({}, req()).channel, 'direct_or_unavailable');
});
test('paid campaign attribution is not mislabeled organic AI traffic', () => assert.equal(attribution({ utm_source: 'chatgpt', utm_medium: 'cpc' }, req()).channel, 'paid'));
test('fingerprint deduplicates equivalent requests but distinguishes intent and site', async () => {
  assert.equal(await fingerprint(inquiry), await fingerprint(normalize({ ...body, name: '  Offline   Example ', email: 'TEST@EXAMPLE.INVALID', utm_source: 'different' }, req())));
  assert.notEqual(await fingerprint(inquiry), await fingerprint(normalize({ ...body, message: 'A different question' }, req())));
  assert.notEqual(await fingerprint(inquiry), await fingerprint(normalize(body, req(body, 'https://pensacolamilitaryhousing.com'))));
});
test('FUB payload retains the question and a receipt marker without asserting qualification', () => {
  const p = fubPayload({ id: 'receipt-test', inquiry }); assert.ok(p.description.startsWith(body.message)); assert.match(p.description, /receipt-test/); assert.ok(p.person.tags.includes('AI: ChatGPT')); assert.equal(p.source, 'GreggCostin.com Contact Form');
});
test('invalid inputs fail with 400 before storage or providers', async () => {
  for (const data of ['{', null, [], { ...body, name: ' ' }, { ...body, email: '<script>@bad' }, { ...body, message: { bad: true } }]) assert.equal((await worker.fetch(req(data), {})).status, 400);
});
test('all existing honeypots return quietly without accepting a conversion', async () => {
  for (const key of ['_gotcha', 'honeypot', 'website']) { const r = await worker.fetch(req({ ...body, [key]: 'bot' }), {}); assert.equal(r.status, 200); assert.equal((await r.json()).accepted, false); }
});
test('OPTIONS, health and unsupported methods do not touch providers', async () => {
  assert.equal((await worker.fetch(new Request('https://local.invalid', { method: 'OPTIONS' }), {})).status, 204);
  const h = await (await worker.fetch(new Request('https://local.invalid/health'), {})).json(); assert.equal(h.providerDeliveryTested, false);
  assert.equal((await worker.fetch(new Request('https://local.invalid'), {})).status, 405);
});
test('oversized request and missing durable binding fail safely', async () => {
  assert.equal((await worker.fetch(req({ ...body, message: 'x'.repeat(18000) }), {})).status, 413);
  assert.equal((await worker.fetch(req(), {})).status, 503);
});
