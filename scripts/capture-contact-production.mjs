// Read-only worker evidence. Secret values are never printed or saved.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
const dir = process.argv[2] || 'docs/seo-geo-2026-09-06/projects/02-inquiries/before';
mkdirSync(dir, { recursive: true });
const token = process.env.CLOUDFLARE_API_TOKEN || process.env.CF_API_TOKEN;
if (!token) throw Error('Cloudflare token unavailable');
const account = JSON.parse(readFileSync('node_modules/.cache/wrangler/pages.json', 'utf8')).account_id;
const base = `https://api.cloudflare.com/client/v4/accounts/${account}/workers/scripts/costin-contact`;
const report = { checkedAt: new Date().toISOString(), readOnly: true, modules: [] };
for (const route of ['/deployments', '/settings', '']) {
  const r = await fetch(base + route, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(25000) });
  if (!r.ok) throw Error(`Cloudflare ${route || 'code'} read HTTP ${r.status}`);
  if (route) {
    const data = (await r.json()).result;
    if (route === '/settings') {
      report.settings = { compatibility_date: data.compatibility_date, compatibility_flags: data.compatibility_flags, bindings: (data.bindings || []).map(({ name, type, namespace_id, class_name }) => ({ name, type, namespace_id, class_name })) };
    } else report.deployment = data.deployments[0];
    continue;
  }
  const contentType = r.headers.get('content-type');
  const bytes = Buffer.from(await r.arrayBuffer());
  writeFileSync(`${dir}/production-content.bin`, bytes);
  writeFileSync(`${dir}/production-content-type.txt`, contentType);
  if (contentType.includes('multipart')) {
    const form = await new Response(bytes, { headers: { 'content-type': contentType } }).formData();
    for (const [name, file] of form.entries()) {
      if (!/\.m?js$/.test(name)) continue;
      const filename = name.replaceAll(/[^a-zA-Z0-9_.-]/g, '_');
      const body = typeof file === 'string' ? file : await file.text();
      writeFileSync(`${dir}/${filename}`, body);
      report.modules.push({ name, file: filename, bytes: Buffer.byteLength(body), sha256: createHash('sha256').update(body).digest('hex') });
    }
  } else {
    writeFileSync(`${dir}/worker.js`, bytes);
    report.modules.push({ name: 'worker.js', file: 'worker.js', bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') });
  }
}
if (!report.modules.length) throw Error('No JavaScript worker modules found');
writeFileSync(`${dir}/production.json`, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
