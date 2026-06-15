// Add the machine-readable "Last updated" stamp to the 14 pillar pages that
// have a "Content last verified" line but lack the data-last-updated "Last
// updated" line (the other 43 public/*.html pages already have both).
// Inserts the Last-updated <p> immediately BEFORE the existing verified line.
// Leaves "Content last verified: April 2026" untouched — we are only stamping,
// not re-verifying page content. Idempotent: skips files already stamped.

import { readFileSync, writeFileSync } from "node:fs";

const PAGES = [
  "bah-to-mortgage-guide", "disabled-veteran-benefits-florida", "dual-military-homes",
  "first-time-military-homebuyer", "florida-home-insurance-military",
  "florida-homestead-exemption-military", "military-divorce-housing",
  "military-pcs-tax-deductions", "military-rental-property-management",
  "pcs-schools-by-base", "va-coe-guide", "va-funding-fee-2026",
  "va-irrrl-guide", "zero-down-home-loans",
];

const LAST_UPDATED =
  `<p data-last-updated="true" style="text-align:center;font-size:.75rem;color:var(--mutedD,#6B7280);margin:.5rem auto 0;letter-spacing:.5px;text-transform:uppercase">Last updated: June 14, 2026</p>\n`;

const ANCHOR = '<p style="text-align:center;color:var(--mutedD,#6f6e65);font-size:.75rem;margin:.5rem 0 0;letter-spacing:.5px;text-transform:uppercase">Content last verified: April 2026</p>';

let done = 0, skipped = 0, failed = 0;
for (const name of PAGES) {
  const path = `public/${name}.html`;
  let c = readFileSync(path, "utf8");
  if (c.includes("data-last-updated")) { skipped++; console.log(`skip (already stamped): ${name}`); continue; }
  const i = c.indexOf(ANCHOR);
  if (i === -1) { failed++; console.log(`FAIL (no verified-line anchor): ${name}`); continue; }
  c = c.slice(0, i) + LAST_UPDATED + c.slice(i);
  writeFileSync(path, c);
  done++;
}
console.log(`Last-updated stamps added: ${done}, skipped: ${skipped}, failed: ${failed}`);
