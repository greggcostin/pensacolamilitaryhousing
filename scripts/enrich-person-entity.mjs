// Enrich the Person (#person-gregg) JSON-LD entity site-wide with three
// E-E-A-T-strengthening fields that the audit flagged as missing:
//
//   award         — Forbes Global Properties Rookie of the Year 2025
//   memberOf      — National Association of Realtors, Florida Realtors
//                   (implicit from his MRP/ABR/SRS/RENE/FMS designations
//                   already in hasCredential, but Google can't infer
//                   memberOf from credential names)
//   knowsLanguage — en-US (explicit > inferred)
//
// Two formatting variants exist: indented multiline on index.html, and
// compact single-line on the 61 subpages. Both anchor on the unique
// jobTitle string "Realtor, Military Relocation Specialist" which only
// the Person entity uses (the homepage RealEstateAgent uses "Realtor").
// Idempotent: skips files that already contain the new "award" field.

import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ENRICHMENT_MARKER = '"award":["Forbes Global Properties Rookie of the Year 2025"]';

const COMPACT_FROM = '"jobTitle":"Realtor, Military Relocation Specialist",';
const COMPACT_TO = '"jobTitle":"Realtor, Military Relocation Specialist","award":["Forbes Global Properties Rookie of the Year 2025"],"memberOf":[{"@type":"Organization","name":"National Association of Realtors","url":"https://www.nar.realtor/"},{"@type":"Organization","name":"Florida Realtors","url":"https://www.floridarealtors.org/"}],"knowsLanguage":["en-US"],';

const INDENT = "                ";
const MULTILINE_FROM = `${INDENT}"jobTitle": "Realtor, Military Relocation Specialist",`;
const MULTILINE_TO = `${INDENT}"jobTitle": "Realtor, Military Relocation Specialist",
${INDENT}"award": ["Forbes Global Properties Rookie of the Year 2025"],
${INDENT}"memberOf": [
${INDENT}  {"@type": "Organization", "name": "National Association of Realtors", "url": "https://www.nar.realtor/"},
${INDENT}  {"@type": "Organization", "name": "Florida Realtors", "url": "https://www.floridarealtors.org/"}
${INDENT}],
${INDENT}"knowsLanguage": ["en-US"],`;

const files = ["index.html"];
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full);
    else if (name.endsWith(".html")) files.push(full);
  }
}
walk("public");

let updated = 0, skipped = 0, noAnchor = 0;
for (const path of files) {
  let html = readFileSync(path, "utf8");
  if (html.includes(ENRICHMENT_MARKER)) { skipped++; continue; }
  let matched = false;
  if (html.includes(MULTILINE_FROM)) {
    html = html.replace(MULTILINE_FROM, MULTILINE_TO);
    matched = true;
  }
  if (html.includes(COMPACT_FROM)) {
    html = html.split(COMPACT_FROM).join(COMPACT_TO);
    matched = true;
  }
  if (!matched) { noAnchor++; continue; }
  writeFileSync(path, html, "utf8");
  updated++;
}

console.log(`${updated} pages enriched. ${skipped} already enriched. ${noAnchor} had no Person anchor.`);
