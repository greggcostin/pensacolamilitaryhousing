// Repeatable whole-site inventory and optional public HTTP crawl. Read-only on the site.
// node scripts/audit-civilian-experience.mjs [--live] [--output docs/site-audit-2026-09-05/baseline.json]
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
const root = 'civilian-site';
const arg = name => { const i = process.argv.indexOf(name); return i < 0 ? null : process.argv[i + 1]; };
const output = arg('--output') || 'docs/site-audit-2026-09-05/experience.json';
const files = [];
function walk(dir) { for (const entry of readdirSync(dir, { withFileTypes: true })) { const file = join(dir, entry.name).replaceAll('\\', '/'); if (entry.isDirectory()) walk(file); else if (file.endsWith('.html')) files.push(file); } }
walk(root);
const text = html => html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const slug = file => file === root + '/index.html' ? '/' : file.slice(root.length).replace(/\.html$/, '');
const pages = files.map(file => {
  const html = readFileSync(file, 'utf8');
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  const anchors = [...html.matchAll(/href="([^"]+)"/g)].map(m => m[1].replaceAll('&amp;', '&'));
  const forms = [...html.matchAll(/<form\b[\s\S]*?<\/form>/g)].map(m => ({ id: (m[0].match(/\bid="([^"]+)"/) || [])[1] || null, novalidate: m[0].includes('novalidate'), fields: [...m[0].matchAll(/name="([^"]+)"/g)].map(m => m[1]) }));
  return { file, path: slug(file), title: (html.match(/<title>([^<]*)/) || [])[1], bytes: Buffer.byteLength(html), words: text(html).split(' ').length, headings: [...html.matchAll(/<h([1-3])\b[^>]*>([\s\S]*?)<\/h[1-3]>/g)].map(m => ({ level: Number(m[1]), text: text(m[2]) })), forms, images: [...html.matchAll(/<img\b[^>]*>/g)].map(m => ({ src: (m[0].match(/src="([^"]+)"/) || [])[1], lazy: m[0].includes('loading="lazy"'), priority: m[0].includes('fetchpriority="high"') })), inlineScriptBytes: [...html.matchAll(/<script(?![^>]*application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/g)].reduce((n,m) => n + Buffer.byteLength(m[1]), 0), hasSkipLink: /class="[^"]*skip-link/.test(html), hasSharedExperience: html.includes('/assets/costin-experience.js'), hasMetaControls: html.includes('/assets/costin-meta.js'), duplicateIds: [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))], brokenLocalFragments: anchors.filter(a => a.startsWith('#') && a !== '#' && !ids.includes(a.slice(1))), internalLinks: anchors.filter(a => a.startsWith('/') && !a.startsWith('//')), externalLinks: anchors.filter(a => a.startsWith('https:')) };
});
const inbound = new Map(pages.map(p => [p.path, new Set()]));
for (const page of pages) for (const link of page.internalLinks) { const path = link.split(/[?#]/)[0].replace(/\.html$/, ''); if (path !== page.path) inbound.get(path)?.add(page.path); }
const report = { generated: new Date().toISOString(), scope: 'All local civilian HTML, including 404; public crawl only when --live is passed', summary: { htmlPages: pages.length, indexableContentPages: pages.filter(p => p.path !== '/404').length, contentGroups: Object.fromEntries(['blog','resources','schools','neighborhoods'].map(dir => [dir, pages.filter(p => p.path.startsWith('/' + dir + '/')).length])), skipLinks: pages.filter(p => p.hasSkipLink).length, metaControls: pages.filter(p => p.hasMetaControls).length, duplicateIdPages: pages.filter(p => p.duplicateIds.length).length, brokenLocalFragmentPages: pages.filter(p => p.brokenLocalFragments.length).length, orphanPages: pages.filter(p => p.path !== '/404' && !inbound.get(p.path).size).map(p => p.path) }, pages };
if (process.argv.includes('--live')) {
  const urls = [...new Set([...pages.filter(p => p.path !== '/404').map(p => 'https://greggcostin.com' + p.path), 'https://greggcostin.com/robots.txt', 'https://greggcostin.com/sitemap.xml', 'https://greggcostin.com/llms.txt', 'https://greggcostin.com/__costin_audit_missing_20260905', 'https://pensacolamilitaryhousing.com/', 'https://pensacolamilitaryhousing.com/sitemap.xml', 'https://pensacolamilitaryhousing.com/mortgage-calculators'])];
  report.live = []; let cursor = 0;
  await Promise.all(Array.from({ length: 5 }, async () => { while (cursor < urls.length) { const url = urls[cursor++]; const started = Date.now(); try { const response = await fetch(url, { signal: AbortSignal.timeout(20000), headers: { 'User-Agent': 'CostinSiteAudit/1.0' } }); const body = await response.text(); report.live.push({ url, finalUrl: response.url, status: response.status, ms: Date.now() - started, bytes: Buffer.byteLength(body), canonical: (body.match(/rel="canonical" href="([^"]+)"/) || [])[1] || null, robotsHeader: response.headers.get('x-robots-tag'), title: (body.match(/<title>([^<]*)/) || [])[1] || null }); } catch (e) { report.live.push({ url, error: e.message }); } } }));
  report.live.sort((a,b) => a.url.localeCompare(b.url));
}
mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ output, ...report.summary, live: report.live ? { urls: report.live.length, http200: report.live.filter(r => r.status === 200).length, errors: report.live.filter(r => r.error || r.status >= 400) } : undefined }, null, 2));
if (report.summary.duplicateIdPages || report.summary.brokenLocalFragmentPages) process.exitCode = 1;
