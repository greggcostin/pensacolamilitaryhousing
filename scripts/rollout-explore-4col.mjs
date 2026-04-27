// Roll out the unified 4-column "Explore Other Bases & Areas" footer block
// to every static HTML page that has an <h2>Explore...</h2> + .explore wrapper.
//
// Layout: journey-based, 4 columns, balanced via subheads.
//   1. Bases               (7, no subheads)
//   2. Where to Live       (16, split FL064 / FL023)
//   3. Money & Financing   (11, VA Loans / Budget & BAH / Tax & Benefits)
//   4. Planning & Compare  (20, PCS / Buyer Profiles / Compare / On vs Off / Ref)
//
// Idempotent via the EXPLORE_V2 marker comment so re-runs swap content
// instead of duplicating it.

import { readdirSync, readFileSync, writeFileSync } from "node:fs";

// ─── Column data ───────────────────────────────────────────────────────────
const BASES = [
  ["NAS Pensacola",        "/bases/nas-pensacola"],
  ["Corry Station",        "/bases/corry-station"],
  ["Saufley Field",        "/bases/saufley-field"],
  ["NAS Whiting Field",    "/bases/whiting-field"],
  ["Hurlburt Field",       "/bases/hurlburt-field"],
  ["Eglin AFB",            "/bases/eglin-afb"],
  ["Duke Field",           "/bases/duke-field"],
];

const COMMUNITIES_FL064 = [
  ["Gulf Breeze",                     "/communities/gulf-breeze"],
  ["Navarre",                         "/communities/navarre"],
  ["Pace",                            "/communities/pace"],
  ["Milton",                          "/communities/milton"],
  ["Cantonment",                      "/communities/cantonment"],
  ["Perdido Key",                     "/communities/perdido-key"],
  ["East Pensacola Heights",          "/communities/east-pensacola-heights"],
  ["East Hill",                       "/communities/east-hill"],
  ["Cordova Park",                    "/communities/cordova-park"],
  ["Ferry Pass",                      "/communities/ferry-pass"],
  ["Bellview/Myrtle Grove",           "/communities/bellview-myrtle-grove"],
  ["Navy Point/Warrington",           "/communities/navy-point-warrington"],
];
const COMMUNITIES_FL023 = [
  ["Niceville/Valparaiso/Bluewater Bay", "/communities/niceville"],
  ["Fort Walton Beach/Shalimar",         "/communities/fort-walton-beach"],
  ["Destin",                             "/communities/destin"],
  ["Crestview",                          "/communities/crestview"],
];

const VA_LOANS = [
  ["VA Loan Guide",              "/va-loan-guide"],
  ["VA IRRRL Refi Guide",        "/va-irrrl-guide.html"],
  ["VA Funding Fee 2026",        "/va-funding-fee-2026.html"],
  ["Assumable VA Loans",         "/assumable-va-loans-pensacola.html"],
  ["Zero-Down Loans Compared",   "/zero-down-home-loans.html"],
];
const BUDGET_BAH = [
  ["BAH to Mortgage Guide",      "/bah-to-mortgage-guide.html"],
  ["2026 BAH Rates",             "/bah-rates.html"],
];
const TAX_BENEFITS = [
  ["FL Homestead (Military)",         "/florida-homestead-exemption-military.html"],
  ["VA Disability Tax (FL)",          "/va-disability-property-tax-florida.html"],
  ["Military PCS Tax Deductions",     "/military-pcs-tax-deductions.html"],
  ["Disabled Veteran Benefits (FL)",  "/disabled-veteran-benefits-florida.html"],
];

const PCS_PLANNING = [
  ["PCS Guide",                  "/pcs-guide"],
  ["PCS Checklist",              "/pcs-checklist.html"],
  ["PCS Schools by Base",        "/pcs-schools-by-base.html"],
  ["Military School Zones",      "/school-zones-military-families.html"],
];
const BUYER_PROFILES = [
  ["First-Time Military Homebuyer",  "/first-time-military-homebuyer.html"],
  ["Dual-Military Homes",            "/dual-military-homes.html"],
  ["Military Divorce Housing",       "/military-divorce-housing.html"],
  ["Military Rental Property",       "/military-rental-property-management.html"],
];
const COMPARE = [
  ["NAS Pensacola vs Hurlburt",  "/nas-pensacola-vs-hurlburt-field.html"],
  ["Gulf Breeze vs Navarre",     "/gulf-breeze-vs-navarre.html"],
  ["Niceville vs Crestview",     "/niceville-vs-crestview.html"],
];
const ON_OFF_BASE = [
  ["NAS Pensacola",     "/on-base-vs-off-base-nas-pensacola.html"],
  ["Corry Station",     "/on-base-vs-off-base-corry-station.html"],
  ["Saufley Field",     "/on-base-vs-off-base-saufley-field.html"],
  ["Whiting Field",     "/on-base-vs-off-base-nas-whiting-field.html"],
  ["Hurlburt Field",    "/on-base-vs-off-base-hurlburt-field.html"],
  ["Eglin AFB",         "/on-base-vs-off-base-eglin-afb.html"],
  ["Duke Field",        "/on-base-vs-off-base-duke-field.html"],
];
const REFERENCE = [
  ["FAQ",      "/faq.html"],
  ["Reviews",  "/reviews.html"],
];

// ─── HTML block ────────────────────────────────────────────────────────────
const a = ([label, href]) => `<a href="${href}">${label}</a>`;
const items = (arr) => arr.map(a).join("\n");
const sub = (label) => `<span class="subhead">${label}</span>`;

const HTML_BLOCK = `<!-- EXPLORE_V2 -->
<h2>Explore Other Bases &amp; Areas</h2>
<div class="explore">
<div class="explore-col">
<h3 class="explore-title">Bases</h3>
<div class="related">
${items(BASES)}
</div>
</div>
<div class="explore-col">
<h3 class="explore-title">Where to Live</h3>
<div class="related">
${sub("Pensacola Area (FL064)")}
${items(COMMUNITIES_FL064)}
${sub("Fort Walton Beach Area (FL023)")}
${items(COMMUNITIES_FL023)}
</div>
</div>
<div class="explore-col">
<h3 class="explore-title">Money &amp; Financing</h3>
<div class="related">
${sub("VA Loans")}
${items(VA_LOANS)}
${sub("Budget &amp; BAH")}
${items(BUDGET_BAH)}
${sub("Tax &amp; Benefits")}
${items(TAX_BENEFITS)}
</div>
</div>
<div class="explore-col">
<h3 class="explore-title">Planning &amp; Compare</h3>
<div class="related">
${sub("PCS Planning")}
${items(PCS_PLANNING)}
${sub("Buyer Profiles")}
${items(BUYER_PROFILES)}
${sub("Compare Bases &amp; Areas")}
${items(COMPARE)}
${sub("On vs Off-Base")}
${items(ON_OFF_BASE)}
${sub("Reference")}
${items(REFERENCE)}
</div>
</div>
</div>
<!-- /EXPLORE_V2 -->`;

// ─── CSS rules ─────────────────────────────────────────────────────────────
const CSS_BLOCK = `/* EXPLORE_V2_CSS_START */
.explore{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;margin:2rem 0 3rem}
.explore-col{background:var(--panel);border:1px solid var(--hair);border-radius:10px;padding:1.25rem 1rem;min-width:0;overflow-wrap:anywhere}
.explore-title{color:var(--gold)!important;font-size:.78rem;margin:0 0 .85rem;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;font-family:var(--sans);border:none;padding:0;display:block}
.explore-title::before{display:none}
.explore .related{display:flex;flex-direction:column;gap:0;margin:0}
.explore .related a{display:block;background:transparent;color:var(--text);padding:.45rem 0;border:none;border-bottom:1px solid var(--hair);border-radius:0;font-size:.86rem;font-weight:400;letter-spacing:normal;text-transform:none;text-decoration:none;line-height:1.4;overflow-wrap:anywhere}
.explore .related a:last-child{border-bottom:none}
.explore .related a:hover{background:transparent;color:var(--gold)}
.explore .related .subhead{color:var(--gold);font-size:.66rem;letter-spacing:1.5px;text-transform:uppercase;font-weight:700;border:none;margin:1.4rem 0 .25rem}
.explore .related .subhead:first-child{margin:0 0 .25rem}
@media(max-width:767px){
  .explore{grid-template-columns:1fr;gap:12px;margin:1.5rem 0 2rem}
  .explore-col{padding:1.4rem 1.2rem}
  .explore-title{font-size:.85rem;margin:0 0 1rem}
  .explore .related a{padding:.7rem 0;font-size:.95rem}
  .explore .related .subhead{margin:1.4rem 0 .35rem;font-size:.72rem}
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

const V2_BLOCK_RE = /<!-- EXPLORE_V2 -->[\s\S]*?<!-- \/EXPLORE_V2 -->/;
const ORIG_BLOCK_RE = /<h2[^>]*>Explore Other[^<]*<\/h2>\s*<div class="explore">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;
const V2_CSS_RE = /\/\* EXPLORE_V2_CSS_START \*\/[\s\S]*?\/\* EXPLORE_V2_CSS_END \*\//;

let touched = 0, skipped = 0;
for (const path of walk("public")) {
  let c = readFileSync(path, "utf8");
  const before = c;

  if (!ORIG_BLOCK_RE.test(c) && !V2_BLOCK_RE.test(c)) { skipped++; continue; }

  if (V2_BLOCK_RE.test(c)) {
    c = c.replace(V2_BLOCK_RE, HTML_BLOCK);
  } else {
    c = c.replace(ORIG_BLOCK_RE, HTML_BLOCK);
  }

  if (V2_CSS_RE.test(c)) {
    c = c.replace(V2_CSS_RE, CSS_BLOCK);
  } else {
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
