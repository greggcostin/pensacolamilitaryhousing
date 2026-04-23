// Append the 23 owned short domains to every sameAs array on the site.
// Schema.org sameAs accepts owned URLs that unambiguously identify the entity —
// exactly what these short domains do (they 301 to the canonical target).

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SHORT_DOMAINS = [
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

// The anchor we splice BEFORE: the final item in the current sameAs array
// (the Levin Rinke brokerage URL). We append the 23 short domains after it,
// skipping any that are already present (idempotent).
const ANCHOR = '"https://greggc.levinrinkerealty.com"';

function buildReplacement(existingContent) {
  const missing = SHORT_DOMAINS.filter(d => !existingContent.includes(`"${d}"`));
  if (missing.length === 0) return null;
  return ANCHOR + "," + missing.map(d => `"${d}"`).join(",");
}

const FILES = [
  ...readdirSync("public").filter(f => f.endsWith(".html")).map(f => `public/${f}`),
  ...readdirSync("public/bases").filter(f => f.endsWith(".html")).map(f => `public/bases/${f}`),
  ...readdirSync("public/communities").filter(f => f.endsWith(".html")).map(f => `public/communities/${f}`),
  "index.html",
  "src/App.jsx",
  "scripts/page-template.mjs",
];

let filesChanged = 0, totalInsertions = 0;
for (const path of FILES) {
  let content;
  try { content = readFileSync(path, "utf8"); } catch { continue; }
  const before = content;

  const replacement = buildReplacement(content);
  if (!replacement) continue;

  // Replace every occurrence of the ANCHOR with ANCHOR + short domains
  // (only needed once per sameAs array, but each file may have multiple schema blocks)
  const count = content.split(ANCHOR).length - 1;
  if (count === 0) continue;
  content = content.split(ANCHOR).join(replacement);

  if (content !== before) {
    writeFileSync(path, content, "utf8");
    filesChanged++;
    totalInsertions += count;
  }
}

console.log(`Extended sameAs arrays across ${filesChanged} files (${totalInsertions} schema blocks updated).`);
