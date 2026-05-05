// Standardize the RealEstateAgent entity across all subpage JSON-LD.
// Three problems being fixed in one pass:
//   1. Most subpage RealEstateAgent blocks lack @id, so Google sees ~60
//      anonymous instances rather than one consolidated entity.
//   2. Two name variants are used: "Gregg Costin, Realtor" and
//      "Gregg Costin, Realtor — The Costin Team" — neither matches the
//      homepage canonical "Gregg Costin - The Costin Team".
//   3. Two pages (blog.html, reviews.html) use a third variant
//      "Gregg Costin - Pensacola Military Realtor".
//
// All RealEstateAgent blocks now reference @id="#agent" and use the
// canonical name. Inline attributes (logo, address, etc.) are kept so
// Article schema's publisher.logo requirement still validates.

import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";

const AGENT_ID = "https://pensacolamilitaryhousing.com/#agent";
const CANONICAL_NAME = "Gregg Costin - The Costin Team";

// Order matters: do the more specific (@id-already-present) patterns
// before the less specific ones, so we don't double-add @id.
const PAIRS = [
  // 1. Already has @id, just rename
  [
    `"@type":"RealEstateAgent","@id":"${AGENT_ID}","name":"Gregg Costin, Realtor"`,
    `"@type":"RealEstateAgent","@id":"${AGENT_ID}","name":"${CANONICAL_NAME}"`,
  ],
  [
    `"@type":"RealEstateAgent","@id":"${AGENT_ID}","name":"Gregg Costin, Realtor — The Costin Team"`,
    `"@type":"RealEstateAgent","@id":"${AGENT_ID}","name":"${CANONICAL_NAME}"`,
  ],
  [
    `"@type":"RealEstateAgent","@id":"${AGENT_ID}","name":"Gregg Costin - Pensacola Military Realtor"`,
    `"@type":"RealEstateAgent","@id":"${AGENT_ID}","name":"${CANONICAL_NAME}"`,
  ],
  // 2. No @id, add it and rename
  [
    `"@type":"RealEstateAgent","name":"Gregg Costin, Realtor"`,
    `"@type":"RealEstateAgent","@id":"${AGENT_ID}","name":"${CANONICAL_NAME}"`,
  ],
  [
    `"@type":"RealEstateAgent","name":"Gregg Costin, Realtor — The Costin Team"`,
    `"@type":"RealEstateAgent","@id":"${AGENT_ID}","name":"${CANONICAL_NAME}"`,
  ],
  [
    `"@type":"RealEstateAgent","name":"Gregg Costin - Pensacola Military Realtor"`,
    `"@type":"RealEstateAgent","@id":"${AGENT_ID}","name":"${CANONICAL_NAME}"`,
  ],
];

const files = [];
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full);
    else if (name.endsWith(".html")) files.push(full);
  }
}
walk("public");
// Skip index.html — homepage is the canonical definition; its name
// "Gregg Costin - The Costin Team" is already the target value.

let filesChanged = 0, totalSubs = 0;
for (const path of files) {
  const before = readFileSync(path, "utf8");
  let content = before;
  let local = 0;
  for (const [from, to] of PAIRS) {
    const occ = content.split(from).length - 1;
    if (occ > 0) {
      content = content.split(from).join(to);
      local += occ;
    }
  }
  if (content !== before) {
    writeFileSync(path, content, "utf8");
    filesChanged++;
    totalSubs += local;
    console.log(`  ${path} — ${local} replacements`);
  }
}

console.log(`\n${filesChanged} files updated, ${totalSubs} replacements total.`);
