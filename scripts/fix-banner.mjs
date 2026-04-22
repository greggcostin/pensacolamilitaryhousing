// Fix two banner issues to match the SPA (PCS Guide) look:
// 1. .banner-email: mixed case, gold color, tighter letter-spacing
// 2. Remove the standalone "Reviews" tab from banner-tabs (it lives in Resources ▾)

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PUB = "public";

const OLD_EMAIL_CSS = ".banner-email{color:var(--muted)!important;font-size:12px;letter-spacing:1px;text-transform:uppercase;display:block;margin-top:2px}";
const NEW_EMAIL_CSS = ".banner-email{color:var(--gold)!important;font-size:13px;font-weight:500;letter-spacing:.3px;display:block;margin-top:2px;font-family:inherit}";

const REVIEWS_TAB = `<a href="/reviews.html">Reviews</a>\n`;

const files = readdirSync(PUB).filter(f => f.endsWith(".html"));
let count = 0;

for (const f of files) {
  const path = join(PUB, f);
  let html = readFileSync(path, "utf8");
  const before = html;

  // Fix email CSS
  html = html.replace(OLD_EMAIL_CSS, NEW_EMAIL_CSS);

  // Remove standalone Reviews tab (keeping it in Resources dropdown)
  html = html.replace(REVIEWS_TAB, "");

  if (html !== before) {
    writeFileSync(path, html, "utf8");
    count++;
    console.log(`fixed: ${f}`);
  }
}

console.log(`\nTotal fixed: ${count} pages`);
