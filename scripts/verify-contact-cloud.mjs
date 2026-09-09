// Calls only the isolated verification worker, whose providers are hard-coded stubs.
import { readFileSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const dir = 'docs/seo-geo-2026-09-06/projects/02-inquiries';
const config = JSON.parse(readFileSync(dir + '/verification-wrangler.json', 'utf8'));
const base = `https://${config.name}.gregg-costin.workers.dev`;
const resume = process.argv.includes('--resume');
const scenarios = [];
async function send(body, { site = 'greggcostin.com', inspect = false, method = 'POST' } = {}) {
  const r = await fetch(`${base}${inspect ? '/inspect' : '/'}?run=${config.vars.TEST_RUN_ID}`, { method, headers: { 'Content-Type': 'application/json', Origin: `https://${site}` }, body: method === 'POST' ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(25000) });
  let data; try { data = await r.json(); } catch {}
  return { status: r.status, data };
}
const lead = { name: 'Cloud Runtime Test', email: 'test@example.invalid', inquiryType: 'Selling My Home', message: 'Persistence check ' + config.vars.TEST_RUN_ID, referrer: 'https://chatgpt.com/', page_path: '/sell' };
if (resume) {
  const before = JSON.parse(readFileSync(dir + '/cloud-runtime-verification.json', 'utf8'));
  const result = await send(lead), receipt = await send(lead, { inspect: true });
  assert.equal(result.status, 200); assert.equal(result.data.receiptId, before.persistenceReceipt);
  assert.equal(receipt.data.calls.length, 4); assert.equal(result.data.duplicate, true);
  before.redeploymentPersistence = { checkedAt: new Date().toISOString(), ok: true, providerCallsUnchanged: 4 };
  writeFileSync(dir + '/cloud-runtime-verification.json', JSON.stringify(before, null, 2) + '\n');
  console.log(JSON.stringify(before.redeploymentPersistence));
} else {
  const batch = await Promise.all(Array.from({ length: 8 }, () => send(lead)));
  assert.ok(batch.every(r => r.status === 200));
  assert.equal(new Set(batch.map(r => r.data.receiptId)).size, 1);
  const receipt = await send(lead, { inspect: true });
  assert.equal(receipt.data.calls.length, 4); assert.equal(receipt.data.crm, 'accepted');
  scenarios.push({ name: 'Eight concurrent civilian inquiries create one receipt and four stub provider calls', ok: true });
  const failed = { ...lead, email: 'failure@example.invalid', message: 'FAIL_ALL ' + config.vars.TEST_RUN_ID };
  const failure = await send(failed, { site: 'pensacolamilitaryhousing.com' });
  assert.equal(failure.status, 503); assert.equal(failure.data.success, false);
  const failedReceipt = await send(failed, { site: 'pensacolamilitaryhousing.com', inspect: true });
  assert.equal(failedReceipt.data.calls.length, 2);
  assert.equal(failedReceipt.data.confirmation, 'pending');
  scenarios.push({ name: 'Military all-provider outage returns 503 and saves the receipt without a customer confirmation', ok: true });
  const ignored = { ...lead, email: 'ignored@example.invalid', message: 'CRM_IGNORED ' + config.vars.TEST_RUN_ID };
  const fallback = await send(ignored); assert.equal(fallback.status, 200); assert.equal(fallback.data.captureStatus, 'email_fallback');
  const ignoredReceipt = await send(ignored, { inspect: true }); assert.equal(ignoredReceipt.data.crm, 'ignored'); assert.equal(ignoredReceipt.data.calls.length, 3);
  scenarios.push({ name: 'CRM 204 is identified as ignored; owner-notification fallback is labeled separately', ok: true });
  for (const payload of [{ name: 'invalid' }, { ...lead, email: '<script>@bad' }]) assert.equal((await send(payload)).status, 400);
  assert.equal((await send({ ...lead, _gotcha: 'bot' })).data.accepted, false);
  scenarios.push({ name: 'Invalid data and honeypot handling run before provider access', ok: true });
  for (const [site, type, referrer] of [['greggcostin.com','First-Time Home Buyer','https://www.perplexity.ai/'],['greggcostin.com','Investment Property','https://www.google.com/'],['pensacolamilitaryhousing.com','PCS / Relocation — Buying','https://claude.ai/'],['pensacolamilitaryhousing.com','PCS / Relocation — Selling','https://copilot.microsoft.com/']]) {
    const r = await send({ ...lead, inquiryType: type, referrer, message: type + ' ' + config.vars.TEST_RUN_ID }, { site }); assert.equal(r.status, 200);
  }
  scenarios.push({ name: 'Civilian buyer, investor, military buyer and military seller contracts succeed through actual Cloudflare routing', ok: true });
  const report = { checkedAt: new Date().toISOString(), ok: true, verificationWorker: base, verificationVersion: '4a684a58-6b17-401a-becd-f031f9574032', runtime: 'Cloudflare Workers and SQLite Durable Objects', realCrmWrites: 0, realEmailsSent: 0, providerMode: 'hard-coded test stubs, fake credentials, reserved example.invalid addresses', persistenceReceipt: batch[0].data.receiptId, scenarios };
  writeFileSync(dir + '/cloud-runtime-verification.json', JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
}
