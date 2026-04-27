// Fix text overflow in the "Explore Other Bases & Areas" section. Long
// slash-separated community names (e.g. "Niceville/Valparaiso/Bluewater Bay",
// "Bellview/Myrtle Grove") don't break at slashes by default and overflow
// their .explore-col containers. Add overflow-wrap:anywhere to the link
// rule plus min-width:0 to the column to let grid items shrink correctly.

import { readdirSync, readFileSync, writeFileSync } from "node:fs";

function walk(dir, out = []) {
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    const p = `${dir}/${f.name}`;
    if (f.isDirectory()) walk(p, out);
    else if (f.isFile() && /\.html$/.test(f.name)) out.push(p);
  }
  return out;
}

// Idempotent edits: only patch rules that don't already contain overflow-wrap.
const RULES = [
  {
    name: ".explore-col",
    re: /\.explore-col\{([^}]*?)\}/g,
    patch: (full, body) => body.includes("overflow-wrap")
      ? full
      : `.explore-col{${body};min-width:0;overflow-wrap:anywhere}`,
  },
  {
    name: ".explore .related a",
    re: /\.explore \.related a\{([^}]*?)\}/g,
    patch: (full, body) => body.includes("overflow-wrap")
      ? full
      : `.explore .related a{${body};overflow-wrap:anywhere}`,
  },
];

let touched = 0;
for (const path of walk("public")) {
  let c = readFileSync(path, "utf8");
  const before = c;
  for (const r of RULES) c = c.replace(r.re, r.patch);
  if (c !== before) { writeFileSync(path, c, "utf8"); touched++; }
}
console.log(`Explore-section overflow fix applied to ${touched} pages.`);
