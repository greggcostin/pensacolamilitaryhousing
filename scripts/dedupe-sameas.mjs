// Strip the duplicated `sameAs` arrays from subpage JSON-LD blocks.
// The canonical Person/RealEstateAgent/LocalBusiness sameAs arrays live on
// index.html. Subpages reference those entities via @id (e.g. #person-gregg,
// #agent), so the inline sameAs array is redundant ~3 KB on every page.
// Keeps schema valid: @id linkage handles entity disambiguation.

import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";

// Match  ,"sameAs":[ ... ]   on a single line (subpage JSON-LD is minified).
// sameAs values are flat strings — no nested arrays — so the next `]` closes.
const RE = /,?"sameAs":\[[^\]]+\]/g;

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
// NB: do not touch index.html — that's where sameAs is canonically defined.

let filesChanged = 0, totalRemoved = 0, bytesSaved = 0;
for (const path of files) {
  const before = readFileSync(path, "utf8");
  const matches = before.match(RE);
  if (!matches) continue;
  const after = before.replace(RE, "");
  writeFileSync(path, after, "utf8");
  filesChanged++;
  totalRemoved += matches.length;
  bytesSaved += before.length - after.length;
  console.log(`  ${path} — ${matches.length} sameAs arrays removed`);
}

console.log(`\n${filesChanged} files updated, ${totalRemoved} arrays stripped, ${(bytesSaved / 1024).toFixed(1)} KB total.`);
