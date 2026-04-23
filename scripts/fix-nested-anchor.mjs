// 22 files contain an invalid nested anchor tag introduced by a prior
// cross-linking script:  <a href="/pcs-checklist.html"><a href="/pcs-checklist.html">PCS Checklist</a></a>
// Browsers tolerate it but validators flag and some parsers treat the inner
// anchor as text. Collapse to a single anchor.

import { readdirSync, readFileSync, writeFileSync } from "node:fs";

const BROKEN = '<a href="/pcs-checklist.html"><a href="/pcs-checklist.html">PCS Checklist</a></a>';
const FIXED  = '<a href="/pcs-checklist.html">PCS Checklist</a>';

function walk(dir, out = []) {
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    const p = `${dir}/${f.name}`;
    if (f.isDirectory()) walk(p, out);
    else if (f.isFile() && /\.html$/.test(f.name)) out.push(p);
  }
  return out;
}

let touched = 0, subs = 0;
for (const path of walk("public")) {
  let c;
  try { c = readFileSync(path, "utf8"); } catch { continue; }
  const before = c;
  while (c.includes(BROKEN)) { c = c.replace(BROKEN, FIXED); subs++; }
  if (c !== before) { writeFileSync(path, c, "utf8"); touched++; }
}
console.log(`Fixed ${subs} nested anchors across ${touched} files.`);
