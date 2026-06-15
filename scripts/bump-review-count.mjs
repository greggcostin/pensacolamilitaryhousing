// Bump Google review count to the current verified Google Business Profile
// total. As of 2026-06-14 Gregg's GBP shows 42 five-star reviews (was 38).
// Updates visible prose, AggregateRating schema, llms.txt/llms-full.txt, and
// the SPA (src/App.jsx). Zillow's count (19) is tracked separately and is not
// touched here. The reviewCount in AggregateRating reflects the Google GBP
// total; the page's enumerated Review[] testimonials are a curated subset.

import { readdirSync, readFileSync, writeFileSync } from "node:fs";

const REPLACEMENTS = [
  { from: "38 five-star Google reviews", to: "42 five-star Google reviews" },
  { from: "38 Google reviews", to: "42 Google reviews" },
  { from: "38 Google Reviews", to: "42 Google Reviews" },
  { from: "Read All 38 Reviews on Google", to: "Read All 42 Reviews on Google" },
  { from: '"reviewCount": "38"', to: '"reviewCount": "42"' },
  { from: "5.0 stars from 38 reviews", to: "5.0 stars from 42 reviews" },
  { from: "5.0-star Google rating from 38 verified reviews", to: "5.0-star Google rating from 42 verified reviews" },
];

function walk(dir, out = []) {
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    const p = `${dir}/${f.name}`;
    if (f.isDirectory()) walk(p, out);
    else if (f.isFile() && /\.(html|txt|md)$/.test(f.name)) out.push(p);
  }
  return out;
}

const files = [...walk("public"), "index.html", "MARKETING_KIT.md", "src/App.jsx"];
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

console.log(`Review-count bump 38->42: ${subs} replacements across ${touched} files.`);
