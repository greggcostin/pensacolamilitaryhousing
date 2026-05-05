// Add the GT-WVGM66XS Google Tag config call alongside the existing
// G-W29GHBK38M GA4 config. Reuses the already-loaded gtag.js library
// — no second async script needed — so the additional payload is one
// line per page. Idempotent: pages that already have the GT- ID are
// skipped.

import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";

const NEW_TAG_ID = "GT-WVGM66XS";
const EXISTING_TAG_ID = "G-W29GHBK38M";

// Two formatting variants exist across the codebase:
//   index.html (spaces):   gtag('config', 'G-W29GHBK38M');
//   prerendered (compact): gtag('config','G-W29GHBK38M');
const PAIRS = [
  [
    `gtag('config', '${EXISTING_TAG_ID}');`,
    `gtag('config', '${EXISTING_TAG_ID}');\n          gtag('config', '${NEW_TAG_ID}');`,
  ],
  [
    `gtag('config','${EXISTING_TAG_ID}');`,
    `gtag('config','${EXISTING_TAG_ID}');gtag('config','${NEW_TAG_ID}');`,
  ],
];

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

let added = 0, skipped = 0, noConfig = 0;
for (const path of files) {
  let html = readFileSync(path, "utf8");
  if (html.includes(NEW_TAG_ID)) { skipped++; continue; }
  let matched = false;
  for (const [from, to] of PAIRS) {
    if (html.includes(from)) {
      html = html.replace(from, to);
      matched = true;
      break;
    }
  }
  if (!matched) {
    noConfig++;
    console.log(`  ${path} — no existing gtag config call, skipped`);
    continue;
  }
  writeFileSync(path, html, "utf8");
  added++;
}

console.log(`\n${added} pages updated. ${skipped} already had ${NEW_TAG_ID}. ${noConfig} had no anchor.`);
