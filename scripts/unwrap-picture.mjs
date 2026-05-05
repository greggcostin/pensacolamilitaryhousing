// Reverse the changes from wrap-img-with-picture.mjs: strip the
// <picture><source><source>...<img>...</picture> wrappers and leave
// the bare <img> tag exactly as it was before.

import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";

// Match a <picture> wrapper that contains exactly two <source> elements
// (avif then webp) and one <img>. Capture the inner <img> tag.
const RE = /<picture><source srcset="\/images\/[^"]+\.avif" type="image\/avif"><source srcset="\/images\/[^"]+\.webp" type="image\/webp">(<img\b[^>]*>)<\/picture>/g;

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

let touched = 0, totalUnwrapped = 0;
for (const path of files) {
  const before = readFileSync(path, "utf8");
  let count = 0;
  const after = before.replace(RE, (_match, imgTag) => {
    count++;
    return imgTag;
  });
  if (count > 0) {
    writeFileSync(path, after, "utf8");
    touched++;
    totalUnwrapped += count;
  }
}
console.log(`${touched} files reverted, ${totalUnwrapped} <picture> wrappers stripped.`);
