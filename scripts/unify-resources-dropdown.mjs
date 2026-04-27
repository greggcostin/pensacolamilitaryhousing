// Unify the PCS Guide / VA Loan Guide / Resources dropdowns across all static
// HTML pages so they match the SPA's canonical link arrays. Older pages were
// built with simple <a> links for PCS Guide and VA Loan Guide; we convert them
// into dropdowns (clickable parent + sub-menu) so the static nav matches the
// SPA. Single source of truth must mirror src/App.jsx PCS_LINKS / VA_LINKS /
// RESOURCE_LINKS.
//
// Parent elements use <button type="button" onclick="location.href='...'">
// so existing static-page CSS (.dropdown>button) styles them correctly and
// they stay clickable without needing a separate JS file.

import { readdirSync, readFileSync, writeFileSync } from "node:fs";

const PCS = [
  ["PCS Guide",                        "/pcs-guide"],
  ["PCS Checklist",                    "/pcs-checklist.html"],
  ["PCS Schools by Base",              "/pcs-schools-by-base.html"],
  ["2026 BAH Rates",                   "/bah-rates.html"],
  ["FL Homestead (Military)",          "/florida-homestead-exemption-military.html"],
];

const VA = [
  ["VA Loan Guide",                    "/va-loan-guide"],
  ["BAH to Mortgage Guide",            "/bah-to-mortgage-guide.html"],
  ["VA IRRRL Refi Guide",              "/va-irrrl-guide.html"],
  ["VA Funding Fee 2026",              "/va-funding-fee-2026.html"],
  ["Assumable VA Loans",               "/assumable-va-loans-pensacola.html"],
  ["Zero-Down Loans Compared",         "/zero-down-home-loans.html"],
];

const RESOURCES = [
  ["First-Time Military Homebuyer",    "/first-time-military-homebuyer.html"],
  ["Dual-Military Homes",              "/dual-military-homes.html"],
  ["Military Divorce Housing",         "/military-divorce-housing.html"],
  ["Military Rental Property",         "/military-rental-property-management.html"],
  ["Military PCS Tax Deductions",      "/military-pcs-tax-deductions.html"],
  ["Disabled Veteran Benefits (FL)",   "/disabled-veteran-benefits-florida.html"],
  ["VA Disability Tax (FL)",           "/va-disability-property-tax-florida.html"],
  ["Military School Zones",            "/school-zones-military-families.html"],
  ["NAS Pensacola vs Hurlburt",        "/nas-pensacola-vs-hurlburt-field.html"],
  ["Gulf Breeze vs Navarre",           "/gulf-breeze-vs-navarre.html"],
  ["Niceville vs Crestview",           "/niceville-vs-crestview.html"],
  ["On vs Off-Base — NAS Pensacola",   "/on-base-vs-off-base-nas-pensacola.html"],
  ["On vs Off-Base — Corry Station",   "/on-base-vs-off-base-corry-station.html"],
  ["On vs Off-Base — Saufley Field",   "/on-base-vs-off-base-saufley-field.html"],
  ["On vs Off-Base — Whiting Field",   "/on-base-vs-off-base-nas-whiting-field.html"],
  ["On vs Off-Base — Hurlburt Field",  "/on-base-vs-off-base-hurlburt-field.html"],
  ["On vs Off-Base — Eglin AFB",       "/on-base-vs-off-base-eglin-afb.html"],
  ["On vs Off-Base — Duke Field",      "/on-base-vs-off-base-duke-field.html"],
  ["FAQ",                              "/faq.html"],
  ["Reviews",                          "/reviews.html"],
];

const buildItems = (arr) => arr.map(([label, href]) => `<a href="${href}">${label}</a>`).join("");
const PCS_HTML = buildItems(PCS);
const VA_HTML = buildItems(VA);
const RESOURCES_HTML = buildItems(RESOURCES);

const PCS_DROPDOWN = `<div class="dropdown"><button type="button" onclick="location.href='/pcs-guide'">PCS Guide ▾</button><div class="dropdown-menu">${PCS_HTML}</div></div>`;
const VA_DROPDOWN = `<div class="dropdown"><button type="button" onclick="location.href='/va-loan-guide'">VA Loan Guide ▾</button><div class="dropdown-menu">${VA_HTML}</div></div>`;
const RESOURCES_DROPDOWN = `<div class="dropdown"><button type="button">Resources ▾</button><div class="dropdown-menu">${RESOURCES_HTML}</div></div>`;

function walk(dir, out = []) {
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    const p = `${dir}/${f.name}`;
    if (f.isDirectory()) walk(p, out);
    else if (f.isFile() && /\.html$/.test(f.name)) out.push(p);
  }
  return out;
}

// Refresh existing Resources dropdown contents.
const RESOURCES_RE = /<div class="dropdown"><button type="button">Resources\s*▾<\/button><div class="dropdown-menu">[\s\S]*?<\/div><\/div>/g;
// Refresh existing PCS Guide dropdown contents.
const PCS_DROPDOWN_RE = /<div class="dropdown"><button type="button"[^>]*onclick="location\.href='\/pcs-guide'"[^>]*>PCS Guide\s*▾<\/button><div class="dropdown-menu">[\s\S]*?<\/div><\/div>/g;
// Refresh existing VA Loan Guide dropdown contents.
const VA_DROPDOWN_RE = /<div class="dropdown"><button type="button"[^>]*onclick="location\.href='\/va-loan-guide'"[^>]*>VA Loan Guide\s*▾<\/button><div class="dropdown-menu">[\s\S]*?<\/div><\/div>/g;

let touched = 0;
const stats = { resources: 0, pcs: 0, va: 0 };

for (const path of walk("public")) {
  let c = readFileSync(path, "utf8");
  const before = c;

  // Resources: refresh contents
  if (RESOURCES_RE.test(c)) { c = c.replace(RESOURCES_RE, RESOURCES_DROPDOWN); stats.resources++; }

  // PCS Guide: refresh existing dropdown OR convert simple link to dropdown
  // (only when it's in the nav banner, identified by being adjacent to the
  // Bases or Resources dropdown on the same line).
  if (PCS_DROPDOWN_RE.test(c)) {
    c = c.replace(PCS_DROPDOWN_RE, PCS_DROPDOWN);
    stats.pcs++;
  } else if (/<a href="\/pcs-guide"[^>]*>PCS Guide<\/a>(?=\s*<div class="dropdown")/.test(c)) {
    c = c.replace(/<a href="\/pcs-guide"[^>]*>PCS Guide<\/a>(?=\s*<div class="dropdown")/g, PCS_DROPDOWN);
    stats.pcs++;
  }

  // VA Loan Guide: refresh existing dropdown OR convert simple banner link.
  // Banner instance is identified by appearing right after the Resources
  // dropdown closes — that scopes the replace to the nav, not body content.
  if (VA_DROPDOWN_RE.test(c)) {
    c = c.replace(VA_DROPDOWN_RE, VA_DROPDOWN);
    stats.va++;
  } else if (/(<\/div><\/div>)\s*<a href="\/va-loan-guide"[^>]*>VA Loan Guide<\/a>/.test(c)) {
    c = c.replace(/(<\/div><\/div>)\s*<a href="\/va-loan-guide"[^>]*>VA Loan Guide<\/a>/g, `$1${VA_DROPDOWN}`);
    stats.va++;
  }

  if (c !== before) {
    writeFileSync(path, c, "utf8");
    touched++;
  }
}

console.log(`Unified nav dropdowns across ${touched} files.`);
console.log(`  Resources: ${stats.resources} pages (${RESOURCES.length} items each)`);
console.log(`  PCS Guide: ${stats.pcs} pages (${PCS.length} sub-items each)`);
console.log(`  VA Loan Guide: ${stats.va} pages (${VA.length} sub-items each)`);
