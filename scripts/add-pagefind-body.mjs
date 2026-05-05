// Add data-pagefind-body to the <main> element on every prerendered page
// so the Pagefind index excludes nav, top banner, and EXPLORE_V2 footer.
// Search results become content-relevant instead of "every page mentions
// 'VA Loan Guide' because it's in the nav."
//
// Idempotent — pages that already have the attribute are skipped.
// Pages without a <main> (currently just reviews.html) fall back to
// default body indexing.

import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";

const FROM = "<main>";
const TO = "<main data-pagefind-body>";

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

let added = 0, skipped = 0, noMain = 0;
for (const path of files) {
  let html = readFileSync(path, "utf8");
  if (html.includes("data-pagefind-body")) { skipped++; continue; }
  if (!html.includes(FROM)) {
    noMain++;
    console.log(`  ${path} — no <main>, skipped`);
    continue;
  }
  // Replace only the FIRST <main> (the page's main content wrapper).
  html = html.replace(FROM, TO);
  writeFileSync(path, html, "utf8");
  added++;
}

console.log(`\n${added} pages tagged. ${skipped} already tagged. ${noMain} had no <main>.`);
