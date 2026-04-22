// Hide the "Homes ▾" dropdown from users on all 49 static pages.
// Crawlers still parse the dropdown HTML in the DOM, so links still flow
// SEO link equity to the 7 homes-for-sale-*.html pages. Sitemap and
// llms.txt references remain unchanged.

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PUB = "public";
const files = readdirSync(PUB).filter(f => f.endsWith(".html"));

const OLD = '<div class="dropdown"><button type="button">Homes ▾</button>';
const NEW = '<div class="dropdown homes-hidden" aria-hidden="true"><button type="button" tabindex="-1">Homes ▾</button>';
const HIDE_RULE = ".homes-hidden{display:none!important}";

let count = 0;
for (const f of files) {
  const path = join(PUB, f);
  let html = readFileSync(path, "utf8");
  if (!html.includes(OLD)) continue;
  html = html.replace(OLD, NEW);

  // Add CSS rule inside the first <style> block if not present
  if (!html.includes(HIDE_RULE)) {
    html = html.replace(/<\/style>/, `${HIDE_RULE}\n</style>`);
  }

  writeFileSync(path, html, "utf8");
  count++;
}

console.log(`Hid Homes dropdown on ${count} pages.`);
