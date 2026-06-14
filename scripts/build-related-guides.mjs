// Inject a page-specific "Related Guides" block on every base, community,
// and on-base-vs-off-base page in public/. Sits ABOVE the generic
// "Explore Other Bases" grid so wire-crosslinks.mjs won't overwrite it.
//
// Idempotent: looks for an existing <!-- RELATED_GUIDES --> marker and
// replaces it. Otherwise injects before the "Explore Other Bases" h2.

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const MARK_START = "<!-- RELATED_GUIDES_START -->";
const MARK_END = "<!-- RELATED_GUIDES_END -->";

// ─── Per-base contextual mapping ────────────────────────────────────────────
// communities: ordered closest → farthest by commute
// comparison: optional same-tier head-to-head page
const BASE_MAP = {
  "nas-pensacola": {
    name: "NAS Pensacola",
    onOff: "/on-base-vs-off-base-nas-pensacola",
    comparison: { href: "/nas-pensacola-vs-hurlburt-field", label: "NAS Pensacola vs Hurlburt Field — Side-by-Side" },
    communities: [
      { href: "/communities/gulf-breeze", label: "Gulf Breeze, FL (15-min commute, top-rated schools)" },
      { href: "/communities/pace", label: "Pace, FL (best BAH-per-square-foot value)" },
      { href: "/communities/navy-point-warrington", label: "Navy Point / Warrington (5 minutes from the main gate)" },
    ],
  },
  "corry-station": {
    name: "Corry Station",
    onOff: "/on-base-vs-off-base-corry-station",
    comparison: null,
    communities: [
      { href: "/communities/cantonment", label: "Cantonment (North Escambia, 20-25 min)" },
      { href: "/communities/bellview-myrtle-grove", label: "Bellview / Myrtle Grove (10-15 min)" },
      { href: "/communities/ferry-pass", label: "Ferry Pass (E-3/E-4 starter-home market)" },
    ],
  },
  "saufley-field": {
    name: "Saufley Field",
    onOff: "/on-base-vs-off-base-saufley-field",
    comparison: null,
    communities: [
      { href: "/communities/bellview-myrtle-grove", label: "Bellview / Myrtle Grove (5-10 min)" },
      { href: "/communities/cantonment", label: "Cantonment (15-20 min)" },
      { href: "/communities/ferry-pass", label: "Ferry Pass (20 min)" },
    ],
  },
  "whiting-field": {
    name: "NAS Whiting Field",
    onOff: "/on-base-vs-off-base-nas-whiting-field",
    comparison: null,
    communities: [
      { href: "/communities/milton", label: "Milton, FL (10 minutes to the field)" },
      { href: "/communities/pace", label: "Pace, FL (best BAH value for student aviators)" },
      { href: "/communities/navarre", label: "Navarre, FL (beach community option)" },
    ],
  },
  "hurlburt-field": {
    name: "Hurlburt Field",
    onOff: "/on-base-vs-off-base-hurlburt-field",
    comparison: { href: "/nas-pensacola-vs-hurlburt-field", label: "NAS Pensacola vs Hurlburt Field — Side-by-Side" },
    communities: [
      { href: "/communities/navarre", label: "Navarre, FL (#1 pick for AFSOC families)" },
      { href: "/communities/fort-walton-beach", label: "Fort Walton Beach / Shalimar (10-15 min)" },
      { href: "/communities/niceville", label: "Niceville / Bluewater Bay (Eglin-Hurlburt families)" },
    ],
  },
  "eglin-afb": {
    name: "Eglin AFB",
    onOff: "/on-base-vs-off-base-eglin-afb",
    comparison: { href: "/niceville-vs-crestview", label: "Niceville vs Crestview — Okaloosa Showdown" },
    communities: [
      { href: "/communities/niceville", label: "Niceville / Valparaiso / Bluewater Bay (East Gate, 10 min)" },
      { href: "/communities/fort-walton-beach", label: "Fort Walton Beach / Shalimar (West Gate, 5-15 min)" },
      { href: "/communities/destin", label: "Destin (premium beach market, 20 min)" },
    ],
  },
  "duke-field": {
    name: "Duke Field",
    onOff: "/on-base-vs-off-base-duke-field",
    comparison: { href: "/niceville-vs-crestview", label: "Niceville vs Crestview — Okaloosa Showdown" },
    communities: [
      { href: "/communities/crestview", label: "Crestview, FL (10-15 min, strongest BAH value)" },
      { href: "/communities/niceville", label: "Niceville / Bluewater Bay (East Gate, 30 min)" },
    ],
  },
};

// ─── Per-community contextual mapping ───────────────────────────────────────
// primaryBase: the base the community is best for
// extraBases: other bases the community serves
// comparison: optional head-to-head page
const COMMUNITY_MAP = {
  "gulf-breeze": {
    name: "Gulf Breeze",
    primaryBase: { href: "/bases/nas-pensacola", label: "NAS Pensacola PCS Guide (15-min commute)" },
    onOff: { href: "/on-base-vs-off-base-nas-pensacola", label: "On-Base vs Off-Base at NAS Pensacola" },
    comparison: { href: "/gulf-breeze-vs-navarre", label: "Gulf Breeze vs Navarre — Santa Rosa Head-to-Head" },
  },
  "navarre": {
    name: "Navarre",
    primaryBase: { href: "/bases/hurlburt-field", label: "Hurlburt Field PCS Guide (25-min commute)" },
    onOff: { href: "/on-base-vs-off-base-hurlburt-field", label: "On-Base vs Off-Base at Hurlburt Field" },
    comparison: { href: "/gulf-breeze-vs-navarre", label: "Gulf Breeze vs Navarre — Santa Rosa Head-to-Head" },
  },
  "pace": {
    name: "Pace",
    primaryBase: { href: "/bases/whiting-field", label: "NAS Whiting Field PCS Guide" },
    onOff: { href: "/on-base-vs-off-base-nas-whiting-field", label: "On-Base vs Off-Base at NAS Whiting Field" },
    comparison: null,
  },
  "milton": {
    name: "Milton",
    primaryBase: { href: "/bases/whiting-field", label: "NAS Whiting Field PCS Guide (10-min commute)" },
    onOff: { href: "/on-base-vs-off-base-nas-whiting-field", label: "On-Base vs Off-Base at NAS Whiting Field" },
    comparison: null,
  },
  "cantonment": {
    name: "Cantonment",
    primaryBase: { href: "/bases/nas-pensacola", label: "NAS Pensacola PCS Guide (20-25 min)" },
    onOff: { href: "/on-base-vs-off-base-nas-pensacola", label: "On-Base vs Off-Base at NAS Pensacola" },
    comparison: null,
  },
  "beulah": {
    name: "Beulah",
    primaryBase: { href: "/bases/nas-pensacola", label: "NAS Pensacola PCS Guide (18-22 min)" },
    onOff: { href: "/on-base-vs-off-base-nas-pensacola", label: "On-Base vs Off-Base at NAS Pensacola" },
    comparison: null,
  },
  "perdido-key": {
    name: "Perdido Key",
    primaryBase: { href: "/bases/nas-pensacola", label: "NAS Pensacola PCS Guide (15-min commute)" },
    onOff: { href: "/on-base-vs-off-base-nas-pensacola", label: "On-Base vs Off-Base at NAS Pensacola" },
    comparison: null,
  },
  "east-pensacola-heights": {
    name: "East Pensacola Heights",
    primaryBase: { href: "/bases/nas-pensacola", label: "NAS Pensacola PCS Guide (5-10 min)" },
    onOff: { href: "/on-base-vs-off-base-nas-pensacola", label: "On-Base vs Off-Base at NAS Pensacola" },
    comparison: null,
  },
  "east-hill": {
    name: "East Hill",
    primaryBase: { href: "/bases/nas-pensacola", label: "NAS Pensacola PCS Guide (10-15 min)" },
    onOff: { href: "/on-base-vs-off-base-nas-pensacola", label: "On-Base vs Off-Base at NAS Pensacola" },
    comparison: null,
  },
  "cordova-park": {
    name: "Cordova Park",
    primaryBase: { href: "/bases/nas-pensacola", label: "NAS Pensacola PCS Guide (15-20 min)" },
    onOff: { href: "/on-base-vs-off-base-nas-pensacola", label: "On-Base vs Off-Base at NAS Pensacola" },
    comparison: null,
  },
  "ferry-pass": {
    name: "Ferry Pass",
    primaryBase: { href: "/bases/corry-station", label: "Corry Station PCS Guide" },
    onOff: { href: "/on-base-vs-off-base-corry-station", label: "On-Base vs Off-Base at Corry Station" },
    comparison: null,
  },
  "bellview-myrtle-grove": {
    name: "Bellview / Myrtle Grove",
    primaryBase: { href: "/bases/saufley-field", label: "Saufley Field PCS Guide (5-10 min)" },
    onOff: { href: "/on-base-vs-off-base-saufley-field", label: "On-Base vs Off-Base at Saufley Field" },
    comparison: null,
  },
  "navy-point-warrington": {
    name: "Navy Point / Warrington",
    primaryBase: { href: "/bases/nas-pensacola", label: "NAS Pensacola PCS Guide (5-min commute)" },
    onOff: { href: "/on-base-vs-off-base-nas-pensacola", label: "On-Base vs Off-Base at NAS Pensacola" },
    comparison: null,
  },
  "niceville": {
    name: "Niceville / Valparaiso / Bluewater Bay",
    primaryBase: { href: "/bases/eglin-afb", label: "Eglin AFB PCS Guide (East Gate, 10 min)" },
    onOff: { href: "/on-base-vs-off-base-eglin-afb", label: "On-Base vs Off-Base at Eglin AFB" },
    comparison: { href: "/niceville-vs-crestview", label: "Niceville vs Crestview — Okaloosa Showdown" },
  },
  "fort-walton-beach": {
    name: "Fort Walton Beach / Shalimar",
    primaryBase: { href: "/bases/eglin-afb", label: "Eglin AFB PCS Guide (West Gate, 5-15 min)" },
    onOff: { href: "/on-base-vs-off-base-eglin-afb", label: "On-Base vs Off-Base at Eglin AFB" },
    comparison: null,
  },
  "destin": {
    name: "Destin",
    primaryBase: { href: "/bases/hurlburt-field", label: "Hurlburt Field PCS Guide (10-min commute)" },
    onOff: { href: "/on-base-vs-off-base-hurlburt-field", label: "On-Base vs Off-Base at Hurlburt Field" },
    comparison: null,
  },
  "crestview": {
    name: "Crestview",
    primaryBase: { href: "/bases/duke-field", label: "Duke Field PCS Guide (10-15 min)" },
    onOff: { href: "/on-base-vs-off-base-duke-field", label: "On-Base vs Off-Base at Duke Field" },
    comparison: { href: "/niceville-vs-crestview", label: "Niceville vs Crestview — Okaloosa Showdown" },
  },
};

// ─── Pillar links used everywhere ───────────────────────────────────────────
const PILLAR_BAH = { href: "/bah-rates", label: "2026 BAH Rates (FL064 + FL023)" };
const PILLAR_VA = { href: "/va-loan-guide", label: "VA Loan Guide — Field Manual" };
const PILLAR_PCS = { href: "/pcs-checklist", label: "PCS Checklist — 60 / 30 / 7-Day Timeline" };
const PILLAR_FIRST = { href: "/first-time-military-homebuyer", label: "First-Time Military Homebuyer Playbook" };
const PILLAR_ASSUMABLE = { href: "/assumable-va-loans-pensacola", label: "Assumable VA Loans in Pensacola" };
const PILLAR_INSURANCE = { href: "/florida-home-insurance-military", label: "Florida Home Insurance for Military Buyers" };

// ─── Block builders ─────────────────────────────────────────────────────────
function relatedBlock(links) {
  return `${MARK_START}
<h2>Related Guides for This Page</h2>
<div class="related">
${links.map(l => `<a href="${l.href}">${l.label}</a>`).join("\n")}
</div>
${MARK_END}
`;
}

function blockForBase(slug) {
  const b = BASE_MAP[slug];
  if (!b) return null;
  const links = [
    { href: b.onOff, label: `Should You Live On-Base or Off-Base at ${b.name}?` },
    ...(b.comparison ? [b.comparison] : []),
    ...b.communities,
    PILLAR_BAH,
    PILLAR_VA,
    PILLAR_PCS,
  ];
  return relatedBlock(links);
}

function blockForCommunity(slug) {
  const c = COMMUNITY_MAP[slug];
  if (!c) return null;
  const links = [
    c.primaryBase,
    c.onOff,
    ...(c.comparison ? [c.comparison] : []),
    PILLAR_BAH,
    PILLAR_VA,
    PILLAR_FIRST,
    PILLAR_INSURANCE,
  ];
  return relatedBlock(links);
}

function blockForOnOff(slug) {
  // slug looks like "on-base-vs-off-base-nas-pensacola"
  const baseSlug = slug.replace(/^on-base-vs-off-base-/, "").replace(/^nas-whiting-field$/, "whiting-field");
  const b = BASE_MAP[baseSlug];
  if (!b) return null;
  const links = [
    { href: `/bases/${baseSlug}`, label: `${b.name} — Full PCS Guide` },
    ...b.communities,
    PILLAR_BAH,
    PILLAR_VA,
    PILLAR_ASSUMABLE,
    PILLAR_FIRST,
  ];
  return relatedBlock(links);
}

// ─── Inject (or replace) the block before the Explore grid ──────────────────
const EXPLORE_MARKER = "<h2>Explore Other Bases";

function inject(html, block) {
  const existing = new RegExp(`${MARK_START}[\\s\\S]*?${MARK_END}\\s*`);
  if (existing.test(html)) {
    return html.replace(existing, block);
  }
  const idx = html.indexOf(EXPLORE_MARKER);
  if (idx < 0) return null; // page lacks the expected anchor
  return html.slice(0, idx) + block + html.slice(idx);
}

let touched = 0;
function process(path, slug, block) {
  if (!block) return;
  let html = readFileSync(path, "utf8");
  const out = inject(html, block);
  if (out && out !== html) {
    writeFileSync(path, out, "utf8");
    touched++;
    console.log(`injected: ${path}`);
  }
}

// ─── Comparison pages ──────────────────────────────────────────────────────
const COMPARISON_MAP = {
  "nas-pensacola-vs-hurlburt-field": [
    { href: "/bases/nas-pensacola", label: "NAS Pensacola — Full PCS Guide" },
    { href: "/bases/hurlburt-field", label: "Hurlburt Field — Full PCS Guide" },
    { href: "/on-base-vs-off-base-nas-pensacola", label: "On-Base vs Off-Base at NAS Pensacola" },
    { href: "/on-base-vs-off-base-hurlburt-field", label: "On-Base vs Off-Base at Hurlburt Field" },
    { href: "/communities/gulf-breeze", label: "Gulf Breeze (the NAS family favorite)" },
    { href: "/communities/navarre", label: "Navarre (Hurlburt's #1 community)" },
    PILLAR_BAH,
    PILLAR_VA,
    PILLAR_PCS,
  ],
  "gulf-breeze-vs-navarre": [
    { href: "/communities/gulf-breeze", label: "Gulf Breeze — Community Profile" },
    { href: "/communities/navarre", label: "Navarre — Community Profile" },
    { href: "/bases/nas-pensacola", label: "NAS Pensacola PCS Guide" },
    { href: "/bases/hurlburt-field", label: "Hurlburt Field PCS Guide" },
    { href: "/on-base-vs-off-base-nas-pensacola", label: "On-Base vs Off-Base at NAS Pensacola" },
    PILLAR_BAH,
    PILLAR_VA,
    PILLAR_INSURANCE,
  ],
  "niceville-vs-crestview": [
    { href: "/communities/niceville", label: "Niceville / Valparaiso / Bluewater Bay" },
    { href: "/communities/crestview", label: "Crestview — Community Profile" },
    { href: "/bases/eglin-afb", label: "Eglin AFB PCS Guide" },
    { href: "/bases/duke-field", label: "Duke Field PCS Guide" },
    { href: "/on-base-vs-off-base-eglin-afb", label: "On-Base vs Off-Base at Eglin AFB" },
    { href: "/on-base-vs-off-base-duke-field", label: "On-Base vs Off-Base at Duke Field" },
    PILLAR_BAH,
    PILLAR_VA,
  ],
};

// Comparison pages
for (const [slug, links] of Object.entries(COMPARISON_MAP)) {
  process(join("public", `${slug}.html`), slug, relatedBlock(links));
}

// ─── Pillar pages — cross-link DOWN to base/community geography ─────────────
const PILLAR_MAP = {
  "va-loan-guide": [
    { href: "/va-coe-guide", label: "VA Certificate of Eligibility Walkthrough" },
    { href: "/va-funding-fee-2026", label: "2026 VA Funding Fee Schedule" },
    { href: "/assumable-va-loans-pensacola", label: "Assumable VA Loans in Pensacola" },
    { href: "/va-irrrl-guide", label: "VA IRRRL Streamline Refi" },
    { href: "/first-time-military-homebuyer", label: "First-Time Military Homebuyer Playbook" },
    { href: "/bases/nas-pensacola", label: "Use This VA Loan: NAS Pensacola Guide" },
    { href: "/bases/eglin-afb", label: "Use This VA Loan: Eglin AFB Guide" },
    { href: "/bases/hurlburt-field", label: "Use This VA Loan: Hurlburt Field Guide" },
    PILLAR_BAH,
  ],
  "bah-rates": [
    { href: "/bah-to-mortgage-guide", label: "Turn BAH Into a Mortgage — The Math" },
    { href: "/bases/nas-pensacola", label: "FL064: NAS Pensacola Housing Guide" },
    { href: "/bases/corry-station", label: "FL064: Corry Station Housing Guide" },
    { href: "/bases/whiting-field", label: "FL064: NAS Whiting Field Housing Guide" },
    { href: "/bases/eglin-afb", label: "FL023: Eglin AFB Housing Guide" },
    { href: "/bases/hurlburt-field", label: "FL023: Hurlburt Field Housing Guide" },
    { href: "/bases/duke-field", label: "FL023: Duke Field Housing Guide" },
    PILLAR_VA,
  ],
  "pcs-checklist": [
    { href: "/pcs-schools-by-base", label: "PCS Schools by Base — Feeder Map" },
    { href: "/school-zones-military-families", label: "Military Family School Zones" },
    { href: "/florida-homestead-exemption-military", label: "Florida Homestead Exemption (File by March 1)" },
    { href: "/florida-home-insurance-military", label: "Florida Home Insurance for Military Buyers" },
    { href: "/bases/nas-pensacola", label: "PCSing to NAS Pensacola" },
    { href: "/bases/eglin-afb", label: "PCSing to Eglin AFB" },
    { href: "/bases/hurlburt-field", label: "PCSing to Hurlburt Field" },
    PILLAR_BAH,
    PILLAR_VA,
  ],
  "first-time-military-homebuyer": [
    { href: "/va-coe-guide", label: "VA Certificate of Eligibility Walkthrough" },
    { href: "/va-funding-fee-2026", label: "2026 VA Funding Fee Schedule" },
    { href: "/zero-down-home-loans", label: "Zero-Down Loans Compared (VA / USDA / FHA / Conv)" },
    { href: "/bah-to-mortgage-guide", label: "Turn BAH Into a Mortgage — The Math" },
    { href: "/communities/pace", label: "Pace, FL — Best Starter-Home Value" },
    { href: "/communities/cantonment", label: "Cantonment — Larger Lots, New Construction" },
    { href: "/communities/bellview-myrtle-grove", label: "Bellview / Myrtle Grove — E-3 to E-5 Market" },
    PILLAR_BAH,
    PILLAR_VA,
  ],
  "florida-home-insurance-military": [
    { href: "/florida-homestead-exemption-military", label: "Florida Homestead Exemption (Military)" },
    { href: "/va-disability-property-tax-florida", label: "VA Disability Property Tax Exemption (FL)" },
    { href: "/communities/perdido-key", label: "Perdido Key Insurance Reality (Coastal)" },
    { href: "/communities/gulf-breeze", label: "Gulf Breeze Flood Zones" },
    { href: "/communities/navarre", label: "Navarre Beach Coastal Coverage" },
    PILLAR_VA,
    PILLAR_PCS,
  ],
  "assumable-va-loans-pensacola": [
    { href: "/va-loan-guide", label: "VA Loan Guide — Field Manual" },
    { href: "/va-irrrl-guide", label: "VA IRRRL Streamline Refi" },
    { href: "/va-coe-guide", label: "VA Certificate of Eligibility Walkthrough" },
    { href: "/bases/nas-pensacola", label: "NAS Pensacola PCS Guide" },
    { href: "/bases/eglin-afb", label: "Eglin AFB PCS Guide" },
    PILLAR_BAH,
    PILLAR_FIRST,
  ],
};

// Pillar pages
for (const [slug, links] of Object.entries(PILLAR_MAP)) {
  process(join("public", `${slug}.html`), slug, relatedBlock(links));
}

// Bases
for (const f of readdirSync("public/bases")) {
  if (!f.endsWith(".html")) continue;
  const slug = f.replace(".html", "");
  process(join("public/bases", f), slug, blockForBase(slug));
}

// Communities
for (const f of readdirSync("public/communities")) {
  if (!f.endsWith(".html")) continue;
  const slug = f.replace(".html", "");
  process(join("public/communities", f), slug, blockForCommunity(slug));
}

// On-base-vs-off-base
for (const f of readdirSync("public")) {
  if (!f.startsWith("on-base-vs-off-base-") || !f.endsWith(".html")) continue;
  const slug = f.replace(".html", "");
  process(join("public", f), slug, blockForOnOff(slug));
}

console.log(`\nTotal pages updated: ${touched}`);
