// Integrates the full 41-domain owned portfolio into the site:
//   1. Replaces the existing 23-domain sameAs arrays in JSON-LD with the
//      full 41-domain sameAs across every static HTML page.
//   2. Updates llms.txt and llms-full.txt entity-graph sections.
//   3. Updates the page-template generator + SPA Person/RealEstateAgent sameAs.

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { DOMAIN_MAP, SAMEAS_DOMAIN_URLS } from "./domain-funnel.mjs";

// The previous 23-domain sameAs string that shows up in compact JSON-LD.
// Replace this exact string with the new 41-domain version.
const OLD_DOMAINS = [
  "https://greggc.levinrinkerealty.com",
  "https://naspensacolamilitaryhousing.com",
  "https://corrystationmilitaryhousing.com",
  "https://whitingfieldmilitaryhousing.com",
  "https://naswhitingfieldmilitaryhousing.com",
  "https://hurlburtmilitaryhousing.com",
  "https://hurlburtfieldmilitaryhousing.com",
  "https://eglinmilitaryhousing.com",
  "https://eglinafbmilitaryhousing.com",
  "https://dukefieldmilitaryhousing.com",
  "https://saufleyfieldmilitaryhousing.com",
  "https://navarremilitaryhousing.com",
  "https://gulfbreezemilitaryhousing.com",
  "https://nicevillemilitaryhousing.com",
  "https://fortwaltonbeachmilitaryhousing.com",
  "https://fwbmilitaryhousing.com",
  "https://destinmilitaryhousing.com",
  "https://crestviewmilitaryhousing.com",
  "https://miltonmilitaryhousing.com",
  "https://pacemilitaryhousing.com",
  "https://maryesthermilitaryhousing.com",
  "https://valparaisomilitaryhousing.com",
  "https://shalimarmilitaryhousing.com",
  "https://perdidokeymilitaryhousing.com",
];

// Final ordering: brokerage profile first, then all 41 owned domains.
const NEW_DOMAINS = [
  "https://greggc.levinrinkerealty.com",
  ...SAMEAS_DOMAIN_URLS,
];

// Build the exact compact-JSON substring (most pages use this in minified
// JSON-LD). The script does literal text replacement.
const OLD_COMPACT = OLD_DOMAINS.map(u => `"${u}"`).join(",");
const NEW_COMPACT = NEW_DOMAINS.map(u => `"${u}"`).join(",");

function walk(dir, out = []) {
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    const p = `${dir}/${f.name}`;
    if (f.isDirectory()) walk(p, out);
    else if (f.isFile()) out.push(p);
  }
  return out;
}

const candidates = [
  ...walk("public").filter(f => /\.html$/.test(f)),
  ...walk("scripts").filter(f => /\.(mjs|js)$/.test(f)),
  "index.html",
  "src/App.jsx",
];

let touched = 0, subs = 0;
for (const path of candidates) {
  let c;
  try { c = readFileSync(path, "utf8"); } catch { continue; }
  const before = c;
  while (c.includes(OLD_COMPACT)) {
    c = c.replace(OLD_COMPACT, NEW_COMPACT);
    subs++;
  }
  if (c !== before) {
    writeFileSync(path, c, "utf8");
    touched++;
  }
}
console.log(`sameAs arrays updated: ${subs} replacements across ${touched} files.`);

// ── Update llms.txt owned-domains section ──
const LLMS_OLD_BASES =
  "Bases: naspensacolamilitaryhousing.com, corrystationmilitaryhousing.com, whitingfieldmilitaryhousing.com, naswhitingfieldmilitaryhousing.com, hurlburtmilitaryhousing.com, hurlburtfieldmilitaryhousing.com, eglinmilitaryhousing.com, eglinafbmilitaryhousing.com, dukefieldmilitaryhousing.com, saufleyfieldmilitaryhousing.com";
const LLMS_OLD_COMMS =
  "Communities: navarremilitaryhousing.com, gulfbreezemilitaryhousing.com, nicevillemilitaryhousing.com, fortwaltonbeachmilitaryhousing.com, fwbmilitaryhousing.com, destinmilitaryhousing.com, crestviewmilitaryhousing.com, miltonmilitaryhousing.com, pacemilitaryhousing.com, maryesthermilitaryhousing.com, valparaisomilitaryhousing.com, shalimarmilitaryhousing.com, perdidokeymilitaryhousing.com";

const LLMS_NEW_BLOCK = `Brand / personal (all 301 to homepage): costinteam.com, costinteamrealtors.com, thecostinteam.com, thegreggcostinteam.com, greggcostin.com, greggcostin.net, greggcostinrealtor.com

Topical / authority (Pensacola-area broad keywords, 301 to homepage or topic page): pensacolamilitary.com, pensacolamilitaryexpert.com, panhandlemilitary.com, pensacolabah.com (→ /bah-rates), pensacolavaloan.com (→ /va-loan-guide), pensacolapcsguide.com (→ /pcs-checklist), pensacolapcsexpert.com (→ /pcs-checklist), pensacolapcsagent.com (→ /pcs-checklist), pensacolamilitaryguide.com (→ /pcs-checklist)

Bases (10 → 7 base pages): naspensacolamilitaryhousing.com, corrystationmilitaryhousing.com, whitingfieldmilitaryhousing.com, naswhitingfieldmilitaryhousing.com, hurlburtmilitaryhousing.com, hurlburtfieldmilitaryhousing.com, eglinmilitaryhousing.com, eglinafbmilitaryhousing.com, dukefieldmilitaryhousing.com, saufleyfieldmilitaryhousing.com

Communities (13 → 8 community pages, sub-communities folded to nearest hub): navarremilitaryhousing.com, gulfbreezemilitaryhousing.com, nicevillemilitaryhousing.com, valparaisomilitaryhousing.com (→ Niceville), fortwaltonbeachmilitaryhousing.com, fwbmilitaryhousing.com, maryesthermilitaryhousing.com (→ Fort Walton Beach), shalimarmilitaryhousing.com (→ Fort Walton Beach), destinmilitaryhousing.com, crestviewmilitaryhousing.com, miltonmilitaryhousing.com, pacemilitaryhousing.com, perdidokeymilitaryhousing.com

Alabama Gulf Coast (no FL community page; closest geo redirect): gulfshoresmilitaryhousing.com (→ /communities/perdido-key), orangebeachmilitaryhousing.com (→ /communities/perdido-key)`;

let llms = readFileSync("public/llms.txt", "utf8");
if (llms.includes(LLMS_OLD_BASES) && llms.includes(LLMS_OLD_COMMS)) {
  // Update the lead-in count from 23 to 41
  llms = llms.replace(
    "23 exact-match military-housing short domains are owned",
    "41 exact-match military-housing, brand, and topical Pensacola short domains are owned",
  );
  llms = llms.replace(LLMS_OLD_BASES + "\n\n" + LLMS_OLD_COMMS, LLMS_NEW_BLOCK);
  writeFileSync("public/llms.txt", llms, "utf8");
  console.log("llms.txt updated.");
}
