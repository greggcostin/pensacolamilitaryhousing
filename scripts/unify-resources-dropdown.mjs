// Unify the Resources dropdown across all static HTML pages so it matches the
// SPA's canonical RESOURCE_LINKS. The dropdown was generated at different
// times across page batches, so older pages are missing the newer guides.

import { readdirSync, readFileSync, writeFileSync } from "node:fs";

// Single source of truth — must match RESOURCE_LINKS in src/App.jsx.
const RESOURCES = [
  ["PCS Checklist",                    "/pcs-checklist.html"],
  ["PCS Schools by Base",              "/pcs-schools-by-base.html"],
  ["First-Time Military Homebuyer",    "/first-time-military-homebuyer.html"],
  ["2026 BAH Rates",                   "/bah-rates.html"],
  ["BAH to Mortgage Guide",            "/bah-to-mortgage-guide.html"],
  ["VA Loan Guide",                    "/va-loan-guide"],
  ["VA IRRRL Refi Guide",              "/va-irrrl-guide.html"],
  ["VA Funding Fee 2026",              "/va-funding-fee-2026.html"],
  ["Assumable VA Loans",               "/assumable-va-loans-pensacola.html"],
  ["Zero-Down Loans Compared",         "/zero-down-home-loans.html"],
  ["Dual-Military Homes",              "/dual-military-homes.html"],
  ["Military Divorce Housing",         "/military-divorce-housing.html"],
  ["Military Rental Property",         "/military-rental-property-management.html"],
  ["Military PCS Tax Deductions",      "/military-pcs-tax-deductions.html"],
  ["Disabled Veteran Benefits (FL)",   "/disabled-veteran-benefits-florida.html"],
  ["VA Disability Tax (FL)",           "/va-disability-property-tax-florida.html"],
  ["FL Homestead (Military)",          "/florida-homestead-exemption-military.html"],
  ["Military School Zones",            "/school-zones-military-families.html"],
  ["NAS Pensacola vs Hurlburt",        "/nas-pensacola-vs-hurlburt-field.html"],
  ["Gulf Breeze vs Navarre",           "/gulf-breeze-vs-navarre.html"],
  ["Niceville vs Crestview",           "/niceville-vs-crestview.html"],
  ["FAQ",                              "/faq.html"],
  ["Reviews",                          "/reviews.html"],
];

const RESOURCES_HTML = RESOURCES.map(([label, href]) => `<a href="${href}">${label}</a>`).join("");

function walk(dir, out = []) {
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    const p = `${dir}/${f.name}`;
    if (f.isDirectory()) walk(p, out);
    else if (f.isFile() && /\.html$/.test(f.name)) out.push(p);
  }
  return out;
}

// Match the entire Resources dropdown block and replace its inner items.
// The pattern: <div class="dropdown"><button type="button">Resources ▾</button><div class="dropdown-menu">...</div></div>
const RESOURCES_DROPDOWN_RE = /(<div class="dropdown"><button type="button">Resources\s*▾<\/button><div class="dropdown-menu">)[\s\S]*?(<\/div><\/div>)/g;

let touched = 0, subs = 0;
for (const path of walk("public")) {
  let c = readFileSync(path, "utf8");
  const before = c;
  c = c.replace(RESOURCES_DROPDOWN_RE, `$1${RESOURCES_HTML}$2`);
  if (c !== before) {
    writeFileSync(path, c, "utf8");
    touched++;
    // Count substitutions by counting matches in the original
    subs += (before.match(RESOURCES_DROPDOWN_RE) || []).length;
  }
}
console.log(`Unified Resources dropdown: ${subs} replacements across ${touched} files. Each page now lists all ${RESOURCES.length} resources.`);
