// Publish discovery paths for the PMH school collection without replacing existing
// resource pages, navigation, forms, or trackers. Safe after each school build.
// Usage: node scripts/link-military-schools.mjs [--check]
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const NAV_LINK = '<a href="/schools" data-pmh-school-nav>School Finder</a>';
const RESOURCE_PAGES = new Set(['pcs-schools-by-base.html', 'school-zones-military-families.html']);
const CALLOUT = `<!-- PMH_SCHOOL_FINDER_CALLOUT_START -->
<aside aria-label="Explore the school finder" style="max-width:900px;margin:0 auto 28px;padding:22px 24px;border:1px solid rgba(201,168,76,.4);border-left:4px solid #C9A84C;border-radius:10px;background:#121823;color:#E8E6DF">
<p style="margin:0 0 8px;color:#C9A84C;font-weight:700">Explore schools before your PCS move.</p>
<p style="margin:0 0 16px">Compare public, private and Christian schools on our interactive map. Search near a home address, compare straight-line and driving distances, and open individual school guides with available data and local planning considerations.</p>
<a href="/schools#school-finder" style="display:inline-block;padding:12px 18px;background:#C9A84C;color:#0A0F1A;border-radius:6px;font-weight:700;text-decoration:none">Open the school finder &rarr;</a>
</aside>
<!-- PMH_SCHOOL_FINDER_CALLOUT_END -->`;

export function withMilitarySchoolNav(html) {
  return html.replace(/<nav\b[^>]*class="[^"]*\bmain-banner\b[^"]*"[^>]*>[\s\S]*?<\/nav>/g, nav => {
    if (/href="\/schools(?:#school-finder)?"/.test(nav)) return nav;
    const search = /<a\b[^>]*href="\/pcs-home-search"[^>]*>[\s\S]*?<\/a>/;
    if (search.test(nav)) return nav.replace(search, match => match + '\n' + NAV_LINK);
    const tabs = /<div\b[^>]*class="[^"]*\bbanner-tabs\b[^"]*"[^>]*>/;
    if (!tabs.test(nav)) throw new Error('PMH navigation has no school-link insertion point');
    return nav.replace(tabs, match => match + '\n' + NAV_LINK);
  });
}

export function withMilitarySchoolCallout(html) {
  const block = /<!-- PMH_SCHOOL_FINDER_CALLOUT_START -->[\s\S]*?<!-- PMH_SCHOOL_FINDER_CALLOUT_END -->/;
  if (block.test(html)) return html.replace(block, CALLOUT);
  if (!/<main\b[^>]*>/.test(html)) throw new Error('School resource page is missing main');
  return html.replace(/<main\b[^>]*>/, match => match + '\n' + CALLOUT);
}

export function withSchoolMapPrivacy(html, sourceHtml) {
  const block = /<!-- SCHOOL_MAP_PRIVACY_START -->[\s\S]*?<!-- SCHOOL_MAP_PRIVACY_END -->/;
  const source = sourceHtml.match(block)?.[0];
  if (!source) throw new Error('Civilian privacy page has no school-map disclosure');
  if (block.test(html)) return html.replace(block, source);
  const anchor = '<h2>How long we keep information</h2>';
  if (!html.includes(anchor)) throw new Error('PMH privacy page has no disclosure insertion point');
  return html.replace(anchor, source + '\n\n' + anchor);
}

function htmlFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? htmlFiles(path) : entry.name.endsWith('.html') ? [path] : [];
  });
}

export function linkMilitarySchools({ check = false } = {}) {
  const sourcePrivacy = readFileSync(join(ROOT, 'civilian-site/privacy.html'), 'utf8');
  const changes = [];
  let navigationPages = 0;
  for (const path of htmlFiles(join(ROOT, 'public'))) {
    const original = readFileSync(path, 'utf8');
    let html = withMilitarySchoolNav(original);
    if (/<nav\b[^>]*class="[^"]*\bmain-banner\b/.test(html)) navigationPages++;
    if (RESOURCE_PAGES.has(path.slice(join(ROOT, 'public').length + 1))) html = withMilitarySchoolCallout(html);
    if (path === join(ROOT, 'public/privacy.html')) html = withSchoolMapPrivacy(html, sourcePrivacy);
    if (html !== original) {
      changes.push(path.slice(ROOT.length).replaceAll('\\', '/'));
      if (!check) writeFileSync(path, html);
    }
  }
  console.log(JSON.stringify({ mode: check ? 'check' : 'write', navigationPages, changed: changes.length, files: changes }, null, 2));
  return changes;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const changes = linkMilitarySchools({ check: process.argv.includes('--check') });
  if (process.argv.includes('--check') && changes.length) process.exitCode = 1;
}
