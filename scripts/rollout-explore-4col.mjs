// Roll out the unified 4-column "Explore Other Bases & Areas" footer block
// to every static HTML page that currently has an <h2>Explore...</h2> +
// <div class="explore"> structure. Replaces both the HTML block and the
// associated CSS rules. Idempotent via the EXPLORE_V2 marker comment so
// re-runs only refresh contents, never duplicate.

import { readdirSync, readFileSync, writeFileSync } from "node:fs";

// ─── Single source of truth for the 4 columns ─────────────────────────────
const BASES = [
  ["NAS Pensacola",        "/bases/nas-pensacola"],
  ["Corry Station",        "/bases/corry-station"],
  ["Saufley Field",        "/bases/saufley-field"],
  ["NAS Whiting Field",    "/bases/whiting-field"],
  ["Hurlburt Field",       "/bases/hurlburt-field"],
  ["Eglin AFB",            "/bases/eglin-afb"],
  ["Duke Field",           "/bases/duke-field"],
];

const PCS_GUIDES = [
  ["PCS Guide",                   "/pcs-guide"],
  ["PCS Checklist",               "/pcs-checklist.html"],
  ["PCS Schools by Base",         "/pcs-schools-by-base.html"],
  ["2026 BAH Rates",              "/bah-rates.html"],
  ["FL Homestead (Military)",     "/florida-homestead-exemption-military.html"],
];

const COMMUNITIES = [
  ["Gulf Breeze",                          "/communities/gulf-breeze"],
  ["Navarre",                              "/communities/navarre"],
  ["Pace",                                 "/communities/pace"],
  ["Milton",                               "/communities/milton"],
  ["Cantonment",                           "/communities/cantonment"],
  ["Perdido Key",                          "/communities/perdido-key"],
  ["East Pensacola Heights",               "/communities/east-pensacola-heights"],
  ["East Hill",                            "/communities/east-hill"],
  ["Cordova Park",                         "/communities/cordova-park"],
  ["Ferry Pass",                           "/communities/ferry-pass"],
  ["Bellview/Myrtle Grove",                "/communities/bellview-myrtle-grove"],
  ["Navy Point/Warrington",                "/communities/navy-point-warrington"],
  ["Niceville/Valparaiso/Bluewater Bay",   "/communities/niceville"],
  ["Fort Walton Beach/Shalimar",           "/communities/fort-walton-beach"],
  ["Destin",                               "/communities/destin"],
  ["Crestview",                            "/communities/crestview"],
];

const FINANCING = [
  ["VA Loan Guide",              "/va-loan-guide"],
  ["BAH to Mortgage Guide",      "/bah-to-mortgage-guide.html"],
  ["VA IRRRL Refi Guide",        "/va-irrrl-guide.html"],
  ["VA Funding Fee 2026",        "/va-funding-fee-2026.html"],
  ["Assumable VA Loans",         "/assumable-va-loans-pensacola.html"],
  ["Zero-Down Loans Compared",   "/zero-down-home-loans.html"],
];

const RESOURCES = [
  ["First-Time Military Homebuyer",      "/first-time-military-homebuyer.html"],
  ["Dual-Military Homes",                "/dual-military-homes.html"],
  ["Military Divorce Housing",           "/military-divorce-housing.html"],
  ["Military Rental Property",           "/military-rental-property-management.html"],
  ["Military PCS Tax Deductions",        "/military-pcs-tax-deductions.html"],
  ["Disabled Veteran Benefits (FL)",     "/disabled-veteran-benefits-florida.html"],
  ["VA Disability Tax (FL)",             "/va-disability-property-tax-florida.html"],
  ["Military School Zones",              "/school-zones-military-families.html"],
  ["NAS Pensacola vs Hurlburt",          "/nas-pensacola-vs-hurlburt-field.html"],
  ["Gulf Breeze vs Navarre",             "/gulf-breeze-vs-navarre.html"],
  ["Niceville vs Crestview",             "/niceville-vs-crestview.html"],
  ["On vs Off-Base — NAS Pensacola",     "/on-base-vs-off-base-nas-pensacola.html"],
  ["On vs Off-Base — Corry Station",     "/on-base-vs-off-base-corry-station.html"],
  ["On vs Off-Base — Saufley Field",     "/on-base-vs-off-base-saufley-field.html"],
  ["On vs Off-Base — Whiting Field",     "/on-base-vs-off-base-nas-whiting-field.html"],
  ["On vs Off-Base — Hurlburt Field",    "/on-base-vs-off-base-hurlburt-field.html"],
  ["On vs Off-Base — Eglin AFB",         "/on-base-vs-off-base-eglin-afb.html"],
  ["On vs Off-Base — Duke Field",        "/on-base-vs-off-base-duke-field.html"],
  ["FAQ",                                "/faq.html"],
  ["Reviews",                            "/reviews.html"],
];

// ─── HTML block ────────────────────────────────────────────────────────────
const a = ([label, href]) => `<a href="${href}">${label}</a>`;
const items = (arr) => arr.map(a).join("\n");

const HTML_BLOCK = `<!-- EXPLORE_V2 -->
<h2>Explore Other Bases &amp; Areas</h2>
<div class="explore">
<div class="explore-col">
<h3 class="explore-title">Bases &amp; PCS Guides</h3>
<div class="related">
<span class="subhead">Bases</span>
${items(BASES)}
<span class="subhead">PCS Guides</span>
${items(PCS_GUIDES)}
</div>
</div>
<div class="explore-col">
<h3 class="explore-title">Communities</h3>
<div class="related">
${items(COMMUNITIES)}
</div>
</div>
<div class="explore-col">
<h3 class="explore-title">Financing</h3>
<div class="related">
${items(FINANCING)}
</div>
</div>
<div class="explore-col">
<h3 class="explore-title">Resources</h3>
<div class="related">
${items(RESOURCES)}
</div>
</div>
</div>
<!-- /EXPLORE_V2 -->`;

// ─── CSS rules ─────────────────────────────────────────────────────────────
// Appended at end of <style> with sentinel so re-runs swap instead of dup.
const CSS_BLOCK = `/* EXPLORE_V2_CSS_START */
.explore{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;margin:2rem 0 3rem}
.explore-col{background:var(--panel);border:1px solid var(--hair);border-radius:10px;padding:1.25rem 1rem;min-width:0;overflow-wrap:anywhere}
.explore-title{color:var(--gold)!important;font-size:.78rem;margin:0 0 .85rem;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;font-family:var(--sans);border:none;padding:0;display:block}
.explore-title::before{display:none}
.explore .related{display:flex;flex-direction:column;gap:0;margin:0}
.explore .related a{display:block;background:transparent;color:var(--text);padding:.45rem 0;border:none;border-bottom:1px solid var(--hair);border-radius:0;font-size:.86rem;font-weight:400;letter-spacing:normal;text-transform:none;text-decoration:none;line-height:1.4;overflow-wrap:anywhere}
.explore .related a:last-child{border-bottom:none}
.explore .related a:hover{background:transparent;color:var(--gold)}
.explore .related .subhead{color:var(--gold);font-size:.68rem;letter-spacing:1.5px;text-transform:uppercase;font-weight:700;border:none;margin:1.4rem 0 .25rem}
.explore .related .subhead:first-child{margin:0 0 .25rem}
@media(max-width:767px){
  .explore{grid-template-columns:1fr;gap:12px;margin:1.5rem 0 2rem}
  .explore-col{padding:1.4rem 1.2rem}
  .explore-title{font-size:.85rem;margin:0 0 1rem}
  .explore .related a{padding:.7rem 0;font-size:.95rem}
  .explore .related .subhead{margin:1.4rem 0 .35rem;font-size:.74rem}
}
/* EXPLORE_V2_CSS_END */`;

// ─── Walk public/ ──────────────────────────────────────────────────────────
function walk(dir, out = []) {
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    const p = `${dir}/${f.name}`;
    if (f.isDirectory()) walk(p, out);
    else if (f.isFile() && /\.html$/.test(f.name)) out.push(p);
  }
  return out;
}

// HTML: replace prior V2 block, OR replace original H2+explore block.
const V2_BLOCK_RE = /<!-- EXPLORE_V2 -->[\s\S]*?<!-- \/EXPLORE_V2 -->/;
// Original block: H2 with "Explore Other..." + the explore wrapper.
// Three consecutive </div> separated only by whitespace appear ONLY at the
// end of the explore block (per-col closes have a sibling <div> after them).
const ORIG_BLOCK_RE = /<h2[^>]*>Explore Other[^<]*<\/h2>\s*<div class="explore">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;

// CSS: replace prior V2 CSS, OR append before </style>.
const V2_CSS_RE = /\/\* EXPLORE_V2_CSS_START \*\/[\s\S]*?\/\* EXPLORE_V2_CSS_END \*\//;

let touched = 0, skipped = 0;
for (const path of walk("public")) {
  let c = readFileSync(path, "utf8");
  const before = c;

  // Skip files with no explore section at all.
  if (!ORIG_BLOCK_RE.test(c) && !V2_BLOCK_RE.test(c)) { skipped++; continue; }

  // 1) Replace HTML block (V2 first, then original).
  if (V2_BLOCK_RE.test(c)) {
    c = c.replace(V2_BLOCK_RE, HTML_BLOCK);
  } else {
    c = c.replace(ORIG_BLOCK_RE, HTML_BLOCK);
  }

  // 2) Replace or append CSS.
  if (V2_CSS_RE.test(c)) {
    c = c.replace(V2_CSS_RE, CSS_BLOCK);
  } else {
    // Append before the LAST </style> (header style block).
    const lastStyleClose = c.lastIndexOf("</style>");
    if (lastStyleClose !== -1) {
      c = c.slice(0, lastStyleClose) + "\n" + CSS_BLOCK + "\n" + c.slice(lastStyleClose);
    }
  }

  if (c !== before) {
    writeFileSync(path, c, "utf8");
    touched++;
  }
}

console.log(`Rolled out 4-col Explore section to ${touched} pages. Skipped ${skipped} files (no explore block).`);
