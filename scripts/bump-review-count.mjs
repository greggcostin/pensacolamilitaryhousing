// Bump review count to reflect the current 35 verified Google reviews on Gregg's
// Google Business Profile. Updates visible prose, schema, and llms.txt.
// Also raises reviews.html AggregateRating reviewCount back from 8 to 35 —
// the 8 was a conservative placeholder matching the count of reviews
// enumerated on the page; 35 is the truthful GBP total.

import { readdirSync, readFileSync, writeFileSync } from "node:fs";

const REPLACEMENTS = [
  // Visible prose on base pages and llms.txt
  { from: "34 five-star Google reviews", to: "35 five-star Google reviews" },
  { from: "34 Google reviews", to: "35 Google reviews" },
  { from: "Verified 5.0 stars across 34", to: "Verified 5.0 stars across 35" },
  // reviews.html AggregateRating reviewCount — was 8 (enumerated count),
  // bump to 35 (actual GBP count). The Review[] array of 8 cherry-picked
  // testimonials remains; AggregateRating summarizes all 35 on GBP.
  { from: '"reviewCount": "8",', to: '"reviewCount": "35",' },
  // reviews.html visible meta label
  { from: "34 Google Reviews &middot;", to: "35 Google Reviews &middot;" },
];

function walk(dir, out = []) {
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    const p = `${dir}/${f.name}`;
    if (f.isDirectory()) walk(p, out);
    else if (f.isFile() && /\.(html|txt|md)$/.test(f.name)) out.push(p);
  }
  return out;
}

const files = [...walk("public"), "index.html", "MARKETING_KIT.md"];
let touched = 0, subs = 0;

for (const path of files) {
  let c;
  try { c = readFileSync(path, "utf8"); } catch { continue; }
  const before = c;
  for (const { from, to } of REPLACEMENTS) {
    while (c.includes(from)) { c = c.replace(from, to); subs++; }
  }
  if (c !== before) { writeFileSync(path, c, "utf8"); touched++; }
}

console.log(`Review-count bump: ${subs} replacements across ${touched} files.`);
