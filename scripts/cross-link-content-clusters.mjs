// Deepen internal linking across non-base/non-community content clusters:
// finance pages (VA loan, IRRRL, COE, funding fee, assumable, etc.),
// tax/benefits pages, the Florida insurance page, and the
// on-base-vs-off-base series.
//
// Same mechanism as deepen-internal-links.mjs: find first natural-prose
// occurrence of a target name in the body region (between <main> and
// the EXPLORE_V2 footer marker), skip if already inside an <a>, wrap.
// Idempotent: targets whose href already appears in body are skipped.

import { readFileSync, writeFileSync } from "node:fs";

// Each entry: { href, names: [primary, …fallbacks] }. The script tries
// each candidate name in order; first match wins. Use specific multi-
// word phrases so we don't accidentally wrap generic words.
const TARGETS = {
  vaLoanGuide:           { href: "/va-loan-guide",                       names: ["VA Loan Guide", "VA loan guide"] },
  vaCoeGuide:            { href: "/va-coe-guide",                        names: ["Certificate of Eligibility", "VA COE", " COE "] },
  vaIrrrlGuide:          { href: "/va-irrrl-guide",                      names: ["VA IRRRL", "IRRRL"] },
  vaFundingFee:          { href: "/va-funding-fee-2026",                 names: ["VA funding fee", "funding fee schedule", "2026 VA funding fee", "funding fee"] },
  assumable:             { href: "/assumable-va-loans-pensacola",        names: ["assumable VA loan", "VA loan assumption", "assumable VA"] },
  zeroDown:              { href: "/zero-down-home-loans",                names: ["zero-down loan", "zero-down home loan", "zero down loan"] },
  bahToMortgage:         { href: "/bah-to-mortgage-guide",               names: ["BAH to mortgage", "BAH-to-mortgage"] },
  bahRates:              { href: "/bah-rates",                           names: ["2026 BAH rate", "BAH rates"] },
  firstTimeBuyer:        { href: "/first-time-military-homebuyer",       names: ["first-time military homebuyer", "first-time homebuyer"] },
  homesteadExemption:    { href: "/florida-homestead-exemption-military", names: ["Florida homestead exemption", "homestead exemption"] },
  vaDisabilityTax:       { href: "/va-disability-property-tax-florida",  names: ["VA disability property tax", "disability property tax exemption"] },
  disabledVeteran:       { href: "/disabled-veteran-benefits-florida",   names: ["disabled veteran benefits", "Florida disabled veteran"] },
  pcsTaxDeductions:      { href: "/military-pcs-tax-deductions",         names: ["PCS tax deductions", "PCS moving deduction"] },
  pcsChecklist:          { href: "/pcs-checklist",                       names: ["PCS checklist", "PCS timeline"] },
  schoolZones:           { href: "/school-zones-military-families",      names: ["school zones for military families", "military school zones"] },
  pcsSchools:            { href: "/pcs-schools-by-base",                 names: ["PCS schools by base", "schools by base"] },
  insurance:             { href: "/florida-home-insurance-military",     names: ["Florida home insurance", "homeowners insurance", "hurricane insurance"] },
  rentalProperty:        { href: "/military-rental-property-management", names: ["rental property management", "rental property"] },
  divorce:               { href: "/military-divorce-housing",            names: ["military divorce housing", "divorce"] },
  dualMilitary:          { href: "/dual-military-homes",                 names: ["dual-military", "dual military"] },
};

// Per-source: list of TARGETS keys this page should outbound-link to.
// Skip pages already well-linked (per audit). Focus on real gaps.
const SOURCE_MAP = {
  // Finance cluster gaps
  "va-coe-guide":                   ["bahToMortgage", "firstTimeBuyer", "insurance"],
  "va-irrrl-guide":                 ["vaCoeGuide", "firstTimeBuyer"],
  "va-funding-fee-2026":            ["vaCoeGuide", "bahToMortgage", "firstTimeBuyer"],
  "assumable-va-loans-pensacola":   ["vaLoanGuide", "vaIrrrlGuide", "vaCoeGuide", "vaFundingFee", "firstTimeBuyer"],
  "bah-to-mortgage-guide":          ["vaCoeGuide", "insurance"],
  "first-time-military-homebuyer":  ["vaCoeGuide", "insurance"],
  "zero-down-home-loans":           ["vaCoeGuide", "insurance"],
  "va-loan-guide":                  ["insurance"],

  // Tax/benefits gaps
  "va-disability-property-tax-florida": ["homesteadExemption", "disabledVeteran", "vaFundingFee"],
  "disabled-veteran-benefits-florida":  ["vaCoeGuide", "insurance"],
  "florida-homestead-exemption-military": ["pcsTaxDeductions", "insurance"],
  "military-pcs-tax-deductions":    ["vaLoanGuide", "homesteadExemption"],

  // Insurance page outbound (in addition to its existing Sources section)
  "florida-home-insurance-military": ["vaLoanGuide", "homesteadExemption", "bahToMortgage", "firstTimeBuyer", "pcsChecklist"],

  // PCS planning gaps
  "pcs-checklist":                  ["insurance", "schoolZones", "pcsSchools"],
  "school-zones-military-families": ["pcsSchools", "pcsChecklist"],
  "pcs-schools-by-base":            ["schoolZones", "pcsChecklist"],

  // Buyer-profile gaps
  "dual-military-homes":            ["vaLoanGuide", "bahToMortgage", "firstTimeBuyer"],
  "military-divorce-housing":       ["vaLoanGuide", "assumable", "rentalProperty"],
  "military-rental-property-management": ["vaIrrrlGuide", "vaLoanGuide", "assumable"],

  // FAQ surfaces
  "faq":                            ["insurance", "vaCoeGuide", "vaFundingFee"],
};

// ─── Helpers (same as deepen-internal-links.mjs) ─────────────────────────

function bodyBounds(html) {
  const start = html.indexOf("<main");
  const end = html.indexOf("<!-- EXPLORE_V2");
  if (start < 0 || end < 0 || end <= start) return null;
  return { start, end };
}

function insideAnchor(html, offset) {
  const lookback = html.slice(Math.max(0, offset - 300), offset);
  const lastOpen = lookback.lastIndexOf("<a ");
  const lastClose = lookback.lastIndexOf("</a>");
  return lastOpen > lastClose;
}

function patternsFor(name) {
  // Variants that bracket a natural-prose mention. Multi-word names
  // don't need the leading-space form because they're rarely at the
  // very start of a substring.
  return [
    ` ${name},`, ` ${name}.`, ` ${name} `, ` ${name};`, ` ${name}:`, ` ${name})`, ` ${name}?`,
    `(${name},`, `(${name})`,
    `>${name},`, `>${name}.`, `>${name} `,
  ];
}

function wrapFirstMention(html, names, href) {
  const bounds = bodyBounds(html);
  if (!bounds) return { html, hit: false, used: null };
  const { start, end } = bounds;

  for (const name of names) {
    for (const pat of patternsFor(name)) {
      let from = start;
      while (from < end) {
        const idx = html.indexOf(pat, from);
        if (idx < 0 || idx >= end) break;
        if (insideAnchor(html, idx + 1)) { from = idx + 1; continue; }
        const prefix = pat[0];
        const suffix = pat.slice(1 + name.length);
        const replacement = `${prefix}<a href="${href}">${name.trim()}</a>${suffix}`;
        return {
          html: html.slice(0, idx) + replacement + html.slice(idx + pat.length),
          hit: true,
          used: name,
        };
      }
    }
  }
  return { html, hit: false, used: null };
}

// ─── Main ─────────────────────────────────────────────────────────────────

let totalAdded = 0;
for (const [slug, targetKeys] of Object.entries(SOURCE_MAP)) {
  const path = `public/${slug}.html`;
  let html;
  try { html = readFileSync(path, "utf8"); }
  catch { console.log(`  ${path} — not found, skipped`); continue; }
  const bounds = bodyBounds(html);
  if (!bounds) { console.log(`  ${path} — no body bounds, skipped`); continue; }
  let hits = 0;
  const usedTargets = [];
  for (const key of targetKeys) {
    const target = TARGETS[key];
    if (!target) { console.log(`  ${path} — unknown target key "${key}"`); continue; }
    const body = html.slice(bounds.start, bounds.end);
    if (body.includes(`href="${target.href}"`)) continue; // already linked
    const result = wrapFirstMention(html, target.names, target.href);
    if (result.hit) { html = result.html; hits++; usedTargets.push(key); }
  }
  if (hits > 0) {
    writeFileSync(path, html, "utf8");
    totalAdded += hits;
    console.log(`  ${path} — ${hits} link(s): ${usedTargets.join(", ")}`);
  } else {
    console.log(`  ${path} — 0 (all targets already linked or no natural mentions)`);
  }
}
console.log(`\nTotal new contextual cross-links: ${totalAdded}`);
