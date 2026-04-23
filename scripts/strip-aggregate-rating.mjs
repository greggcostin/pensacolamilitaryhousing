// Strip hard-coded AggregateRating blocks from every HTML file.
// Reason: unverified 5.0/34-review claims on every page = Google "misleading rating"
// penalty risk. Until we wire up real verified reviews (GBP / Zillow API), safer
// to not emit the claim in structured data. The credential is still made in prose;
// it's just not falsely attested to Google as schema.

import { readdirSync, readFileSync, writeFileSync } from "node:fs";

// All variations observed; longest first to avoid partial-match collisions.
const PATTERNS = [
  ',"aggregateRating":{"@type":"AggregateRating","ratingValue":"5.0","reviewCount":"34","bestRating":"5","worstRating":"1"}',
  ',"aggregateRating":{"@type":"AggregateRating","ratingValue":"5","reviewCount":"34","bestRating":"5","worstRating":"1"}',
];

function walk(dir, out = []) {
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    const p = `${dir}/${f.name}`;
    if (f.isDirectory()) walk(p, out);
    else if (f.isFile() && /\.html$/.test(f.name)) out.push(p);
  }
  return out;
}

const files = [...walk("public"), "index.html"];
let touched = 0, subs = 0;

for (const path of files) {
  let content;
  try { content = readFileSync(path, "utf8"); } catch { continue; }
  const before = content;
  for (const pat of PATTERNS) {
    while (content.includes(pat)) {
      content = content.replace(pat, "");
      subs++;
    }
  }
  if (content !== before) {
    writeFileSync(path, content, "utf8");
    touched++;
  }
}

console.log(`Stripped ${subs} AggregateRating blocks across ${touched} files.`);
