// Runs the actual bundled worker and SQLite Durable Objects locally.
// Every outbound request is intercepted. No CRM records or emails are created.
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
const require = createRequire('C:/Users/gregg/AppData/Local/npm-cache/_npx/d77349f55c2be1c0/package.json');
const { Miniflare, convertV4MiniflareOptions } = require('miniflare');
const output = 'docs/seo-geo-2026-09-06/projects/02-inquiries';
mkdirSync(output, { recursive: true });
const storage = resolve('.coast-release/contact-runtime-' + Date.now());
const scenarios = [], calls = [];
const fake = { FUB_API_KEY: 'offline', RESEND_API_KEY: 'offline', GREGG_EMAIL: 'owner@example.invalid', NOTIFICATION_FROM: 'forms@example.invalid' };
const options = {
  name: 'costin-contact', scriptPath: resolve('.coast-release/contact-2026-09-07/worker.js'), modules: true,
  compatibilityDate: '2026-04-16', bindings: fake,
  durableObjects: { INQUIRY_RECEIPTS: { className: 'InquiryReceipt', useSQLite: true } },
  outboundService: async request => {
    const url = new URL(request.url); const body = await request.json();
    assert.ok(['api.followupboss.com', 'api.resend.com'].includes(url.hostname), 'Unexpected outbound target');
    calls.push({ path: url.pathname, recipient: body.to?.[0], key: request.headers.get('Idempotency-Key') });
    if (JSON.stringify(body).includes('FAIL_ALL')) return Response.json({ error: 'simulated outage' }, { status: 503 });
    return Response.json({ id: url.pathname === '/v1/events' ? 321 : url.pathname === '/v1/tasks' ? 654 : 'offline-email-id' }, { status: 201 });
  },
};
const runtimeOptions = convertV4MiniflareOptions({ durableObjectsPersist: storage, workers: [options] });
const send = (runtime, data, origin = 'https://greggcostin.com') => runtime.dispatchFetch('https://local.invalid/', { method: 'POST', headers: { 'content-type': 'application/json', Origin: origin }, body: JSON.stringify(data) });
const lead = { name: 'Local Runtime Test', email: 'test@example.invalid', message: 'Runtime-only success case', inquiryType: 'Selling My Home', referrer: 'https://chatgpt.com/' };
let mf;
try {
  mf = new Miniflare(runtimeOptions);
  const responses = await Promise.all(Array.from({ length: 5 }, () => send(mf, lead)));
  const results = await Promise.all(responses.map(r => r.json()));
  assert.ok(responses.every(r => r.status === 200)); assert.equal(calls.length, 4);
  assert.equal(new Set(results.map(r => r.receiptId)).size, 1);
  scenarios.push({ name: 'Five concurrent submissions through real worker and SQLite receipt storage', ok: true, simulatedProviderCalls: 4, receipts: 1 });
  const receiptId = results[0].receiptId;
  await mf.dispose(); mf = new Miniflare(runtimeOptions);
  const replay = await (await send(mf, lead)).json();
  assert.equal(replay.receiptId, receiptId); assert.equal(calls.length, 4);
  scenarios.push({ name: 'Runtime restart preserves receipt and suppresses repeat provider calls', ok: true });
  const before = calls.length;
  const failed = await send(mf, { ...lead, message: 'FAIL_ALL', email: 'failure@example.invalid' }, 'https://pensacolamilitaryhousing.com');
  assert.equal(failed.status, 503); assert.equal((await failed.json()).success, false);
  assert.equal(calls.length - before, 2);
  assert.ok(calls.slice(before).every(c => !c.recipient || c.recipient === fake.GREGG_EMAIL));
  scenarios.push({ name: 'Military form all-provider outage returns 503 without customer confirmation', ok: true, simulatedProviderCalls: 2 });
  const invalid = await send(mf, { name: 'invalid' }); assert.equal(invalid.status, 400);
  const trap = await send(mf, { ...lead, _gotcha: 'bot' }); assert.equal((await trap.json()).accepted, false);
  assert.equal(calls.length, before + 2);
  scenarios.push({ name: 'Invalid and honeypot requests produce no provider calls', ok: true });
  const report = { checkedAt: new Date().toISOString(), ok: true, runtime: 'Cloudflare workerd via Miniflare with SQLite Durable Objects', externalNetworkCalls: 0, simulatedProviderCalls: calls.length, scenarios };
  writeFileSync(output + '/runtime-verification.json', JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
} finally { if (mf) await mf.dispose(); }
