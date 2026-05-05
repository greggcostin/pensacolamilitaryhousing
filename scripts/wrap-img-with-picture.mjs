// Wrap every <img src="/images/foo.{jpg,png}"> in prerendered HTML with
// a <picture> element that exposes AVIF + WebP variants. Idempotent —
// already-wrapped <img>s (preceded by a <source>) are skipped.

import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";

// Match <img …> with src="/images/<name>.<jpg|jpeg|png>" — captures
// the full tag and the basename so we can build the avif/webp paths.
const IMG_RE = /<img\b([^>]*?)src="(\/images\/([^"]+?)\.(jpe?g|png))"([^>]*)>/gi;

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

let filesChanged = 0, totalWrapped = 0;
for (const path of files) {
  const before = readFileSync(path, "utf8");
  let count = 0;
  const after = before.replace(IMG_RE, (match, attrsBefore, src, baseName, ext, attrsAfter, offset, full) => {
    // Skip if this <img> is already inside a <picture> (a <source> tag
    // appears within the preceding ~200 chars and no </picture> closes
    // between them).
    const lookback = full.slice(Math.max(0, offset - 250), offset);
    if (/<source[^>]+>\s*$/.test(lookback)) return match;
    count++;
    const avif = `/images/${baseName}.avif`;
    const webp = `/images/${baseName}.webp`;
    return `<picture><source srcset="${avif}" type="image/avif"><source srcset="${webp}" type="image/webp"><img${attrsBefore}src="${src}"${attrsAfter}></picture>`;
  });
  if (count > 0) {
    writeFileSync(path, after, "utf8");
    filesChanged++;
    totalWrapped += count;
  }
}
console.log(`${filesChanged} files updated, ${totalWrapped} <img> tags wrapped in <picture>.`);
