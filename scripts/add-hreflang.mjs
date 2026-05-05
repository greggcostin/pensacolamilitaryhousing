// Add self-referencing hreflang declarations to every page that has a
// canonical tag but no hreflang. The site is English-only, so we declare
// en-US (the page's own language) and x-default (the fallback for any
// other locale). This eliminates Search Console "no hreflang" warnings
// and gives search engines an explicit language signal.
//
// Idempotent — pages that already contain a hreflang link are skipped.

import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";

const CANONICAL_RE = /<link\s+rel="canonical"\s+href="([^"]+)"[^>]*>/;

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

let added = 0, skipped = 0, noCanonical = 0;
for (const path of files) {
  let html = readFileSync(path, "utf8");
  if (/<link\s+rel="alternate"\s+hreflang=/i.test(html)) { skipped++; continue; }
  const match = html.match(CANONICAL_RE);
  if (!match) {
    noCanonical++;
    console.log(`  ${path} — no canonical tag, skipped`);
    continue;
  }
  const canonical = match[1];
  const original = match[0];
  // Pair after the canonical line, preserving its formatting context.
  const hreflang =
    `${original}\n` +
    `<link rel="alternate" hreflang="en-US" href="${canonical}">\n` +
    `<link rel="alternate" hreflang="x-default" href="${canonical}">`;
  html = html.replace(original, hreflang);
  writeFileSync(path, html, "utf8");
  added++;
}

console.log(`\n${added} pages got hreflang. ${skipped} already had it. ${noCanonical} had no canonical.`);
