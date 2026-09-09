// Separate, temporary Cloudflare verification worker. NEVER the production entry.
// No real provider credentials, no external fetch implementation, .invalid test data only.
import worker from './worker.js';
import { ReceiptProcessor } from './inquiry-receipt.js';
import { json, normalize, fingerprint } from './contact-contract.js';
const fake = { FUB_API_KEY: 'offline', RESEND_API_KEY: 'offline', GREGG_EMAIL: 'owner@example.invalid', NOTIFICATION_FROM: 'forms@example.invalid' };
export class VerificationReceipt {
  constructor(ctx) {
    this.storage = ctx.storage;
    this.processor = new ReceiptProcessor(ctx.storage, fake, { fetcher: async (url, options) => {
      const body = JSON.parse(options.body), serialized = JSON.stringify(body);
      const call = { path: new URL(url).pathname, recipient: body.to?.[0], key: options.headers['Idempotency-Key'] };
      const calls = (await ctx.storage.get('providerCalls')) || []; calls.push(call); await ctx.storage.put('providerCalls', calls);
      if (serialized.includes('FAIL_ALL')) return Response.json({ error: 'simulated outage' }, { status: 503 });
      if (call.path === '/v1/events' && serialized.includes('CRM_IGNORED')) return new Response(null, { status: 204 });
      if (call.path === '/v1/events') return Response.json({ id: 321 }, { status: 201 });
      if (call.path === '/v1/tasks') return Response.json({ id: 654 }, { status: 201 });
      if (new URL(url).hostname === 'api.resend.com' && call.path === '/emails') return Response.json({ id: 'stub-email-id' }, { status: 201 });
      throw Error('Unexpected provider request in verification worker');
    } });
  }
  async fetch(request) {
    if (request.method === 'GET') {
      const r = await this.storage.get('receipt');
      return json({ id: r?.id, crm: r?.crm.state, notification: r?.notification.state, confirmation: r?.confirmation.state, task: r?.task.state, calls: await this.storage.get('providerCalls') || [] });
    }
    const r = await this.processor.submit(await request.json()); return json(r.body, r.status);
  }
  alarm() { return this.processor.alarm(); }
}
export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return worker.fetch(request, env);
    if (new URL(request.url).searchParams.get('run') !== env.TEST_RUN_ID) return json({ error: 'Verification run required' }, 403);
    if (request.method === 'POST') {
      let data; try { data = await request.clone().json(); } catch { return worker.fetch(request, env); }
      if (data?.email && !String(data.email).endsWith('@example.invalid')) return json({ error: 'Only reserved test addresses are permitted' }, 400);
      if (new URL(request.url).pathname === '/inspect') {
        const id = env.INQUIRY_RECEIPTS.idFromName(await fingerprint(normalize(data, request)));
        return env.INQUIRY_RECEIPTS.get(id).fetch('https://internal/receipt');
      }
    }
    return worker.fetch(request, env);
  },
};
