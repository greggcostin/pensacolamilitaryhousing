// Idempotent sitewide nav update for the 7 new pages (2026-07):
//   Communities dropdown: relabel "Fort Walton Beach/Shalimar" -> "Fort Walton Beach",
//     insert Mary Esther + Shalimar entries after it.
//   Resources dropdown: insert the 5 new guide links after First-Time Military Homebuyer.
// Anchors on the exact chrome strings shared by all static pages. Safe to re-run.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";

const FWB_OLD = '<a href="/communities/fort-walton-beach">Fort Walton Beach/Shalimar</a>';
const FWB_NEW = '<a href="/communities/fort-walton-beach">Fort Walton Beach</a><a href="/communities/mary-esther">Mary Esther</a><a href="/communities/shalimar">Shalimar</a>';

const RES_ANCHOR = '<a href="/first-time-military-homebuyer">First-Time Military Homebuyer</a>';
const RES_INSERT = '<a href="/flight-school-housing-pensacola">Flight School Housing</a>' +
  '<a href="/rent-or-sell-pcs-pensacola">Rent or Sell When You PCS</a>' +
  '<a href="/buying-sight-unseen-pcs-pensacola">Buying Sight-Unseen</a>' +
  '<a href="/pensacola-flood-zones-homebuyers">Pensacola Flood Zones</a>' +
  '<a href="/va-approved-condos-pensacola">VA Loans for Condos</a>';

function walk(dir, out = []) {
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    if (f.name === "node_modules" || f.name === ".git" || f.name === "dist") continue;
    const p = `${dir}/${f.name}`;
    if (f.isDirectory()) walk(p, out);
    else if (f.name.endsWith(".html")) out.push(p);
  }
  return out;
}

let comm = 0, res = 0, skipped = 0;
for (const file of walk("public")) {
  let text = readFileSync(file, "utf8");
  let changed = false;
  if (text.includes(FWB_OLD)) { text = text.split(FWB_OLD).join(FWB_NEW); comm++; changed = true; }
  if (text.includes(RES_ANCHOR) && !text.includes("/flight-school-housing-pensacola\">Flight School Housing")) {
    text = text.split(RES_ANCHOR).join(RES_ANCHOR + RES_INSERT); res++; changed = true;
  }
  if (!changed) skipped++;
  if (changed) writeFileSync(file, text);
}
console.log(`nav update: communities-dropdown patched in ${comm} file(s), resources-dropdown in ${res}, untouched ${skipped}`);
