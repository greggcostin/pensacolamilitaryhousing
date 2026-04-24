// Audit round-2 fixes:
// 1. worksFor schema typed as "RealEstateAgent" where it should be "RealEstateOrganization"
//    (Levin Rinke Realty is a brokerage entity, not a single agent)
// 2. Add article:modified_time + article:published_time OG meta tags
// 3. Cross-link orphan pages (pages with 0 inbound internal links)

import { readdirSync, readFileSync, writeFileSync } from "node:fs";

function walk(dir, out = []) {
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    const p = `${dir}/${f.name}`;
    if (f.isDirectory()) walk(p, out);
    else if (/\.html$/.test(f.name)) out.push(p);
  }
  return out;
}

const files = walk("public");
let subs = 0, touched = 0;

// === 1. worksFor: RealEstateAgent → RealEstateOrganization ===
const BROKERAGE_FIXES = [
  [`"worksFor":{"@type":"RealEstateAgent","name":"Levin Rinke Realty"`, `"worksFor":{"@type":"RealEstateOrganization","name":"Levin Rinke Realty"`],
];

// === 2. OG article:modified_time / article:published_time ===
// Extract datePublished/dateModified from each page's Article schema and insert matching OG tags.
function insertArticleOg(content) {
  // Skip if already present
  if (content.includes('article:modified_time')) return content;
  // Find Article schema dates
  const pubM = content.match(/"datePublished":"(\d{4}-\d{2}-\d{2})"/);
  const modM = content.match(/"dateModified":"(\d{4}-\d{2}-\d{2})"/);
  if (!pubM || !modM) return content;
  const pub = pubM[1] + 'T00:00:00Z';
  const mod = modM[1] + 'T00:00:00Z';
  const tags = `<meta property="article:published_time" content="${pub}" />\n<meta property="article:modified_time" content="${mod}" />\n`;
  // Insert right after og:type line if present
  if (content.includes('property="og:type"')) {
    return content.replace(/(<meta property="og:type"[^>]*>\n?)/, `$1${tags}`);
  }
  return content;
}

for (const path of files) {
  let c;
  try { c = readFileSync(path, "utf8"); } catch { continue; }
  const before = c;
  // Fix worksFor type
  for (const [from, to] of BROKERAGE_FIXES) {
    while (c.includes(from)) { c = c.replace(from, to); subs++; }
  }
  // Add OG article dates
  c = insertArticleOg(c);
  if (c !== before) { writeFileSync(path, c, "utf8"); touched++; }
}
console.log(`worksFor + OG article-time fixes: ${subs} worksFor replacements across ${touched} touched files.`);

// === 3. Cross-link orphan pages ===
// (a) Base pages → their on-base-vs-off-base counterparts
const ORPHAN_LINKS = [
  {
    file: "public/bases/corry-station.html",
    find: "<h2>Frequently Asked Questions</h2>",
    insert: `<h2>Should You Live On-Base or Off-Base?</h2>\n<p>Running the 2026 math on Corry Station housing — on-base wait times, BAH forfeit, school access, off-base commute ranges — is a separate decision from picking a neighborhood. See the full breakdown: <a href="/on-base-vs-off-base-corry-station.html">On-Base vs Off-Base at Corry Station</a>.</p>\n`,
  },
  {
    file: "public/bases/duke-field.html",
    find: "<h2>Frequently Asked Questions</h2>",
    insert: `<h2>Should You Live On-Base or Off-Base?</h2>\n<p>Duke Field's on-base footprint is minimal; most 919 SOW reservists and ART/AGR personnel go off-base in Crestview. See the full breakdown: <a href="/on-base-vs-off-base-duke-field.html">On-Base vs Off-Base at Duke Field</a>.</p>\n`,
  },
  {
    file: "public/bases/whiting-field.html",
    find: "<h2>Frequently Asked Questions</h2>",
    insert: `<h2>Should You Live On-Base or Off-Base?</h2>\n<p>Whiting Field's on-base inventory is limited; most student aviators and instructor pilots buy or rent in Milton, Pace, or Navarre. Math and tradeoffs: <a href="/on-base-vs-off-base-nas-whiting-field.html">On-Base vs Off-Base at NAS Whiting Field</a>.</p>\n`,
  },
  {
    file: "public/bases/saufley-field.html",
    find: "<h2>Frequently Asked Questions</h2>",
    insert: `<h2>Should You Live On-Base or Off-Base?</h2>\n<p>Saufley is a tenant installation with no primary on-base housing; permanent-party personnel live in Bellview, Myrtle Grove, Cantonment, or across 3-Mile Bridge. See the analysis: <a href="/on-base-vs-off-base-saufley-field.html">On-Base vs Off-Base at Saufley Field</a>.</p>\n`,
  },
];

for (const { file, find, insert } of ORPHAN_LINKS) {
  let c;
  try { c = readFileSync(file, "utf8"); } catch { continue; }
  if (!c.includes(find)) { console.log(`  SKIP ${file} (marker not found)`); continue; }
  if (c.includes(insert.split("\n")[0])) { console.log(`  ALREADY ${file}`); continue; }
  c = c.replace(find, insert + find);
  writeFileSync(file, c, "utf8");
  console.log(`  linked ${file}`);
}

// (b) Cross-link /military-pcs-tax-deductions from related pages
const PCS_TAX_INSERTIONS = [
  {
    file: "public/pcs-checklist.html",
    find: `<a href="/va-disability-property-tax-florida.html">`,
    replaceAddBefore: `<a href="/military-pcs-tax-deductions.html">Military PCS Tax Deductions</a> · `,
  },
];

for (const { file, find, replaceAddBefore } of PCS_TAX_INSERTIONS) {
  let c;
  try { c = readFileSync(file, "utf8"); } catch { continue; }
  if (!c.includes(find)) { console.log(`  SKIP ${file} (marker not found for pcs-tax link)`); continue; }
  if (c.includes("/military-pcs-tax-deductions.html")) { console.log(`  ALREADY ${file}`); continue; }
  c = c.replace(find, replaceAddBefore + find);
  writeFileSync(file, c, "utf8");
  console.log(`  added pcs-tax link to ${file}`);
}
