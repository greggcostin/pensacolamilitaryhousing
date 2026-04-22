// Restore the Reviews tab to the banner-tabs across all pages that lost it.

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PUB = "public";

const OLD = `<a href="/mortgage-calculators">Calculators</a>
<a href="/contact">Contact</a>`;

const NEW = `<a href="/mortgage-calculators">Calculators</a>
<a href="/reviews.html">Reviews</a>
<a href="/contact">Contact</a>`;

const files = readdirSync(PUB).filter(f => f.endsWith(".html"));
let count = 0;

for (const f of files) {
  const path = join(PUB, f);
  let html = readFileSync(path, "utf8");
  if (!html.includes(OLD)) continue;
  html = html.replace(OLD, NEW);
  writeFileSync(path, html, "utf8");
  count++;
  console.log(`restored Reviews tab: ${f}`);
}

console.log(`\nTotal: ${count}`);
