// Add a standalone "VA Loan Guide" tab between Resources ▾ and Calculators
// in the banner on all 49 static pages.

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PUB = "public";
const files = readdirSync(PUB).filter(f => f.endsWith(".html"));

const ANCHOR = '<a href="/mortgage-calculators">Calculators</a>';
const NEW_BLOCK = '<a href="/va-loan-pensacola.html">VA Loan Guide</a>\n<a href="/mortgage-calculators">Calculators</a>';

let count = 0;
for (const f of files) {
  const path = join(PUB, f);
  let html = readFileSync(path, "utf8");
  if (!html.includes(ANCHOR)) continue;
  // Skip if already present
  if (html.includes('<a href="/va-loan-pensacola.html">VA Loan Guide</a>')) continue;
  html = html.replace(ANCHOR, NEW_BLOCK);
  writeFileSync(path, html, "utf8");
  count++;
}

console.log(`Added VA Loan Guide tab to ${count} pages.`);
