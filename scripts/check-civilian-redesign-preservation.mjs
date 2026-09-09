// Read-only preservation gate for the September 2026 civilian-site redesign.
// node scripts/check-civilian-redesign-preservation.mjs [--self-test]
// The source snapshot was captured before presentation edits. Never refresh it to
// make a failed check pass: investigate the loss or document an intentional change.
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { parse } from '@babel/parser';

const directory = 'docs/site-audit-2026-09-06-redesign';
const baselinePath = `${directory}/baseline-source.json`;
const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'));
// Approved factual correction: the source platforms include feedback before a
// transaction closes, so the former blanket closed-transaction claim was false.
// This exception is one exact replacement, not a page-wide content exemption.
const copyCorrections = {
  'civilian-site/reviews.html': {
    before: 'Every review below is a real, verbatim Google review from a closed transaction. No filtering and no cherry-picking: this is simply what clients say.',
    after: 'Read feedback shared on Google and Zillow, from first conversations to closing day. Explore the experiences behind our five-star ratings.'
  }
};
// September 6 school-finder feature: two exact local search forms are allowed
// on the school hub. These frozen semantic signatures include every field, option,
// action and constraint; it is not an exemption for forms sharing the same ID.
// All baseline forms still have to occur unchanged, including duplicate counts.
const additionalForms = {
  'civilian-site/schools.html': [
    // User-requested address origin, any-distance option and nearest/name sorting.
    { id: 'sf-filters', semanticSha256: 'dcda66d13fe3dfe1547265884bc95216bb503e294e2228823ef4351c4a67cb00' },
    { id: 'sf-address-form', semanticSha256: 'ccd7ab617e9260551ce3d0ed9b269954189f1dd211338aaa7ff2fdffae227c30' }
  ]
};
const hash = value => createHash('sha256').update(value).digest('hex');
// Requested client library: exact additive discovery entries only. The captured
// baseline remains immutable, including every existing URL and modification date.
const guideDiscovery = [
  ['/resources/mortgage-preapproval','Mortgage Preapproval Guide for Gulf Coast Buyers'],
  ['/resources/buyer-transaction-timeline','Home Buyer Transaction Timeline and Checklist | Pensacola'],
  ['/resources/seller-transaction-timeline','Home Seller Transaction Timeline and Checklist | Pensacola'],
  ['/resources/client-guides','Client Guide Library | Buying, Selling and Coastal Ownership'],
  ['/resources/seller-net-proceeds','Pensacola Seller Net Proceeds Calculator and Guide'],
  ['/resources/coastal-ownership-costs','Alabama vs Florida Coastal Ownership Cost Guide and Worksheet'],
  ['/resources/pensacola-beach-leasehold','Pensacola Beach Leasehold Due Diligence Guide'],
  ['/resources/condo-due-diligence','Gulf Coast Condo Due Diligence Guide and Checklist']
];
function withoutGuideDiscovery(file, text) {
  for (const [path,title] of guideDiscovery) {
    const line = file === 'civilian-site/sitemap.xml' ? `  <url><loc>https://greggcostin.com${path}</loc><lastmod>2026-09-06</lastmod></url>\n`
      : file === 'civilian-site/llms.txt' ? `- [${title}](https://greggcostin.com${path}): printable, sourced client guidance.\n` : null;
    if (line) text = text.replace(line, '');
  }
  return text;
}
const unique = values => [...new Set(values)].sort();
const entities = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ', ndash: '–', mdash: '—', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', middot: '·', bull: '•', hellip: '…', rarr: '→', larr: '←', times: '×', copy: '©', reg: '®', trade: '™', deg: '°', ensp: ' ', emsp: ' ', thinsp: ' ', shy: '' };
const decode = value => String(value).replace(/&#(?:x([a-f0-9]+)|(\d+));?/gi, (_, hex, decimal) => {
  const n = parseInt(hex || decimal, hex ? 16 : 10);
  return n <= 0x10ffff ? String.fromCodePoint(n) : '�';
}).replace(/&([a-z]+);/gi, (all, name) => entities[name.toLowerCase()] ?? all);
const clean = value => decode(value).normalize('NFC').replace(/\s+/g, ' ').trim();
const visible = html => clean(html.replace(/<!--[\s\S]*?-->/g, '').replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '').replace(/<[^>]*>/g, ' '));
function attrs(tag) {
  const result = {};
  for (const m of tag.replace(/^<\/?[\w:-]+/, '').matchAll(/([^\s=<>/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) result[m[1].toLowerCase()] = decode(m[2] ?? m[3] ?? m[4] ?? '');
  return result;
}
function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])]));
  return value;
}
const stable = value => JSON.stringify(canonical(value));
function scriptSemantic(source) {
  // Parse scripts so whitespace, quote style, and comments do not change a hash.
  // String contents and executable statements remain protected.
  const ast = parse(source, { sourceType: 'unambiguous', allowReturnOutsideFunction: true });
  const strip = value => {
    if (Array.isArray(value)) return value.map(strip);
    if (!value || typeof value !== 'object') return value;
    return Object.fromEntries(Object.entries(value).filter(([key]) => !['start','end','loc','extra','comments','leadingComments','trailingComments','innerComments','tokens','errors'].includes(key)).map(([key, child]) => [key, strip(child)]));
  };
  return hash(stable(strip(ast)));
}
function extract(html) {
  const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1] || '';
  const body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] || html;
  const bodyMarkup = body.replace(/<!--[\s\S]*?-->/g, '').replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '');
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].map(m => ({ attributes: attrs(`<script${m[1]}>`), source: m[2] }));
  const ld = scripts.filter(s => s.attributes.type === 'application/ld+json').map(s => stable(JSON.parse(s.source))).sort();
  const meta = [...head.matchAll(/<meta\b[^>]*>/gi)].map(m => stable(attrs(m[0]))).sort();
  const identityLinks = [...head.matchAll(/<link\b[^>]*>/gi)].map(m => attrs(m[0])).filter(a => ['canonical','alternate'].includes(a.rel)).map(stable).sort();
  const links = unique([...bodyMarkup.matchAll(/<(?:a|area)\b[^>]*>/gi)].map(m => attrs(m[0]).href).filter(Boolean));
  const allIds = [...bodyMarkup.matchAll(/<[^/!][^>]*>/g)].map(m => attrs(m[0]).id).filter(Boolean);
  const ids = unique(allIds);
  const duplicateIds = unique(allIds.filter((id, index) => allIds.indexOf(id) !== index));
  const headings = [...bodyMarkup.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi)].map(m => `${m[1]}:${visible(m[2])}`);
  // Protect complete substantive blocks, wherever layout moves them in the body.
  // Tables and definition lists keep even short numeric values. Repeated boilerplate
  // is protected once; removing duplicate CTAs does not constitute factual loss.
  const copy = unique([...bodyMarkup.matchAll(/<(p|li|td|th|dt|dd|figcaption|summary)\b[^>]*>([\s\S]*?)<\/\1>/gi)].map(m => ({ tag: m[1].toLowerCase(), text: visible(m[2]) })).filter(v => v.text && (['td','th','dt','dd','summary'].includes(v.tag) || v.text.split(' ').length >= 7)).map(v => v.text));
  const forms = [...bodyMarkup.matchAll(/<form\b([^>]*)>([\s\S]*?)<\/form>/gi)].map(m => {
    const a = attrs(`<form${m[1]}>`);
    const contract = Object.fromEntries(['id','name','action','method','enctype','novalidate'].filter(k => k in a).map(k => [k,a[k]]));
    const fields = [...m[2].matchAll(/<(input|textarea|select|button)\b[^>]*>/gi)].map(field => {
      const f = attrs(field[0]);
      return { tag: field[1].toLowerCase(), ...Object.fromEntries(['id','name','type','value','required','disabled','min','max','minlength','maxlength','pattern','multiple','checked','formaction','formmethod','formenctype'].filter(k => k in f).map(k => [k,f[k]])) };
    }).sort((a,b) => stable(a).localeCompare(stable(b)));
    const options = [...m[2].matchAll(/<option\b([^>]*)>([\s\S]*?)<\/option>/gi)].map(option => {
      const a = attrs(`<option${option[1]}>`);
      return { value: a.value ?? visible(option[2]), text: visible(option[2]), selected: 'selected' in a, disabled: 'disabled' in a };
    });
    return stable({ contract, fields, options });
  }).sort();
  const protectedScripts = scripts.filter(s => s.attributes.type !== 'application/ld+json' && /googletagmanager|\bgtag\s*\(|clarity\.ms|widgetTracker|costin-contact\.|costin:lead-success|costin-meta(?:-config)?\.js|pages\.dev/.test(`${s.attributes.src || ''}\n${s.source}`)).map(s => stable({ src: s.attributes.src || '', type: s.attributes.type || '', async: 'async' in s.attributes, defer: 'defer' in s.attributes, semantic: scriptSemantic(s.source) })).sort();
  const trackerIds = [...html.matchAll(/\b(?:G|GT|GTM|WT)-[A-Z0-9]+\b/g)].map(m => m[0]).sort();
  return { title: visible(head.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] || ''), meta, identityLinks, ld, links, ids, duplicateIds, headings, copy, forms, protectedScripts, trackerIds, visibleText: visible(bodyMarkup) };
}
function comparePage(file, before, after) {
  const findings = [];
  const fail = (category, detail) => findings.push({ file, category, detail });
  for (const key of ['title','meta','identityLinks','ld','protectedScripts','trackerIds']) if (stable(before[key]) !== stable(after[key])) fail(key, 'Original semantic values, contract, or loader count changed');
  const unmatchedForms = [...after.forms];
  for (const original of before.forms) {
    const index = unmatchedForms.indexOf(original);
    if (index < 0) fail('forms', 'An original form contract was removed or changed');
    else unmatchedForms.splice(index, 1);
  }
  const permittedForms = additionalForms[file] || [];
  const remaining = [...permittedForms];
  for (const form of unmatchedForms) {
    const index=remaining.findIndex(allowed=>JSON.parse(form).contract.id===allowed.id&&hash(form)===allowed.semanticSha256);
    if(index<0)fail('forms','Unapproved additional form or changed school-search contract');
    else remaining.splice(index,1);
  }
  if(remaining.length)fail('forms','An approved school-search form is missing');
  for (const heading of unique(before.headings)) if (!after.headings.includes(heading)) fail('heading', heading);
  for (const link of before.links) if (!after.links.includes(link)) fail('destination', link);
  for (const text of before.copy) if (!after.visibleText.includes(text)) {
    const correction = copyCorrections[file];
    if (!(correction?.before === text && after.visibleText.includes(correction.after))) fail('substantive-copy', text);
  }
  for (const id of after.duplicateIds) fail('duplicate-id', id);
  for (const link of before.links.filter(href => href.startsWith('#') && href !== '#')) if (!after.ids.includes(decodeURIComponent(link.slice(1)))) fail('fragment-target', link);
  return findings;
}

function selfTest() {
  const original = '<html><head><title>Example</title><meta name="description" content="Original description"><link rel="canonical" href="https://example.com/a"><script type="application/ld+json">{"@type":"WebPage","name":"Original"}</script><script>gtag("config","G-ABC123");</script></head><body><header><h1>Original title</h1></header><main><p>These eight factual words must all remain available here.</p><a href="/buy">Buy</a><form id="contact"><input name="email" type="email" required><select name="inquiryType"><option>General Question</option></select></form></main></body></html>';
  const before = extract(original);
  const fixtures = [
    ['title', original.replace('<title>Example', '<title>Changed')],
    ['meta', original.replace('Original description', 'Changed description')],
    ['identityLinks', original.replace('https://example.com/a', 'https://example.com/b')],
    ['ld', original.replace('"name":"Original"', '"name":"Changed"')],
    ['forms', original.replace('name="email"', 'name="missing"')],
    ['protectedScripts', original.replace('gtag("config",', 'gtag("event",')],
    ['protectedScripts', original.replace('</head>', '<script>gtag("config","G-ABC123");</script></head>')],
    ['heading', original.replace('Original title', 'Different title')],
    ['destination', original.replace('href="/buy"', 'href="/sell"')],
    ['substantive-copy', original.replace('must all remain', 'can be removed')]
  ];
  for (const [category, changed] of fixtures) assert(comparePage('fixture', before, extract(changed)).some(f => f.category === category), `${category} regression was not detected`);
  const layout = original.replace('<main>', '<main><div class="new-layout">').replace('</main>', '</div><a href="/contact">New CTA</a></main>').replace('<h1>Original title</h1>', '<h1><span>Original title</span></h1>').replace('gtag("config","G-ABC123");', "/* formatting only */ gtag('config', 'G-ABC123');");
  assert.deepEqual(comparePage('fixture', before, extract(layout)), [], 'Presentation wrappers or additional CTA unexpectedly changed semantics');
  const finder = [...readFileSync('civilian-site/schools.html','utf8').matchAll(/<form\b[^>]*\bid="sf-(?:filters|address-form)"[^>]*>[\s\S]*?<\/form>/g)].map(m=>m[0]).join('');
  assert(finder, 'Approved school search fixture was not found');
  const withFinder = original.replace('</main>', `${finder}</main>`);
  const schoolFile = 'civilian-site/schools.html';
  assert.deepEqual(comparePage(schoolFile, before, extract(withFinder)), [], 'Exact approved school search form was rejected');
  const formMutations = [
    ['fixture', withFinder],
    [schoolFile, withFinder.replace('name="email"', 'name="missing"')],
    [schoolFile, withFinder.replace('id="sf-filters"', 'id="sf-filters" action="https://example.com/collect"')],
    [schoolFile, withFinder.replace('name="q"', 'name="message"')],
    [schoolFile, withFinder.replace('type="reset"', 'type="reset" formaction="https://example.com/collect"')],
    [schoolFile, withFinder.replace('</main>', `${finder}</main>`)],
    [schoolFile, withFinder.replace(/<form id="contact">[\s\S]*?<\/form>/, '')]
  ];
  for (const [file, changed] of formMutations) assert(comparePage(file, before, extract(changed)).some(f => f.category === 'forms'), 'Additional-search-form exception hid a form regression');
  console.log('Preservation self-test: 17 destructive mutations detected; presentation/CTA/JavaScript formatting and exact school-search addition passed.');
}
if (process.argv.includes('--print-search-form-signatures')) {
  console.log(JSON.stringify(extract(readFileSync('civilian-site/schools.html','utf8')).forms.filter(f=>JSON.parse(f).contract.id?.startsWith('sf-')).map(f=>({id:JSON.parse(f).contract.id,semanticSha256:hash(f)})),null,2));
  process.exit(0);
}
if (process.argv.includes('--self-test')) selfTest();
const findings = [];
const currentPages = new Map();
let htmlPages = 0, protectedFiles = 0;
for (const [file, source] of Object.entries(baseline.files)) {
  if (!existsSync(file)) { findings.push({ file, category: 'missing-file', detail: 'Baseline file no longer exists' }); continue; }
  const current = readFileSync(file, 'utf8');
  if (file.endsWith('.html')) {
    htmlPages++;
    try {
      const after = extract(current);
      currentPages.set(file, after);
      const before = extract(source);
      if (file === 'civilian-site/photo-credits.html') {
        // The canonical entity builder added the missing compact graph. Permit
        // this exact addition only; keep every preexisting schema block intact.
        const extra = after.ld.filter(x => !before.ld.includes(x));
        if (extra.length === 1 && hash(extra[0]) === '12ec70bc3f9a5eca2df91f2b7ff654bb821fc71512a033a37e1f9dec14bb8591') before.ld = [...before.ld,extra[0]].sort();
      }
      findings.push(...comparePage(file, before, after));
    }
    catch (error) { findings.push({ file, category: 'parse-error', detail: error.message }); }
  } else {
    protectedFiles++;
    const original = source.replaceAll('\r\n','\n');
    const actual = current.replaceAll('\r\n','\n');
    const correction = copyCorrections['civilian-site/reviews.html'];
    const permitted = file === 'civilian-site/llms-full.txt' ? original.replace(correction.before, correction.after) : original;
    if (hash(original) !== hash(actual) && hash(permitted) !== hash(actual) && hash(permitted) !== hash(withoutGuideDiscovery(file,actual))) findings.push({ file, category: 'crawler-or-verification-file', detail: 'Original contents changed beyond the documented exact reviews correction and client-library additions' });
  }
}
// Validate both original and newly added fragment links after section wrapping.
const slugFor = file => file === 'civilian-site/index.html' ? '/' : file.replace(/^civilian-site/, '').replace(/\.html$/, '');
const pageBySlug = new Map([...currentPages].map(([file, page]) => [slugFor(file), page]));
for (const [file, page] of currentPages) for (const href of page.links) {
  if (!href.includes('#') || href === '#') continue;
  try {
    const url = new URL(href, `https://greggcostin.com${slugFor(file)}`);
    if (url.hostname !== 'greggcostin.com' || !url.hash) continue;
    const target = pageBySlug.get(url.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/');
    if (target && !target.ids.includes(decodeURIComponent(url.hash.slice(1)))) findings.push({ file, category: 'local-fragment', detail: href });
  } catch (error) { findings.push({ file, category: 'local-fragment', detail: `${href}: ${error.message}` }); }
}
for (const [file, source] of Object.entries(baseline.protectedAssets || {})) {
  protectedFiles++;
  if (!existsSync(file) || scriptSemantic(source) !== scriptSemantic(readFileSync(file,'utf8'))) findings.push({ file, category: 'meta-consent-configuration', detail: 'Original Meta consent logic or disabled configuration changed' });
}
const report = { checkedAt: new Date().toISOString(), capturedAt: baseline.capturedAt, baselineSha256: hash(readFileSync(baselinePath)), htmlPages, protectedFiles, permittedCopyCorrections: copyCorrections, permittedAdditionalForms: additionalForms, findings };
writeFileSync(`${directory}/preservation-report.json`, JSON.stringify(report, null, 2) + '\n');
console.log(`REDESIGN PRESERVATION: ${htmlPages} HTML pages, ${protectedFiles} crawler/config/verification files, ${findings.length} findings.`);
for (const finding of findings.slice(0, 40)) console.log(`  ${finding.file} [${finding.category}] ${finding.detail.slice(0,200)}`);
if (findings.length > 40) console.log(`  Full findings: ${directory}/preservation-report.json`);
if (findings.length) process.exitCode = 1;
