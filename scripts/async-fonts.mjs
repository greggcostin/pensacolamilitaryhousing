// Convert the render-blocking Google Fonts <link rel="stylesheet"> on
// every prerendered page into an async preload + onload swap. The fonts
// already declare display=swap so fallback text renders immediately;
// this change just stops the stylesheet request from blocking the
// initial render. Mild Core Web Vitals win (LCP / FCP) at zero
// behavioral cost. Includes a <noscript> fallback for crawlers/UAs
// that don't run JS.
//
// Idempotent — pages already converted (containing rel="preload" with
// the fonts URL) are skipped.

import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";

const FONTS_URL = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700;800&display=swap";

const FROM = `<link rel="stylesheet" href="${FONTS_URL}">`;
const TO =
  `<link rel="preload" href="${FONTS_URL}" as="style" onload="this.onload=null;this.rel='stylesheet'">\n` +
  `<noscript><link rel="stylesheet" href="${FONTS_URL}"></noscript>`;

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

let converted = 0, skipped = 0, missing = 0;
for (const path of files) {
  let html = readFileSync(path, "utf8");
  if (html.includes(`rel="preload" href="${FONTS_URL}"`)) { skipped++; continue; }
  if (!html.includes(FROM)) { missing++; continue; }
  html = html.replace(FROM, TO);
  writeFileSync(path, html, "utf8");
  converted++;
}

console.log(`${converted} pages converted to async font loading. ${skipped} already async. ${missing} had no Google Fonts link.`);
