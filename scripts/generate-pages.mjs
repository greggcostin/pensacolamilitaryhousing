import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { renderPage } from "./page-template.mjs";
import { pages } from "./page-data.mjs";
import { GUIDES } from "../content/geo/core-guide-data.mjs";
import { FINANCIAL_GUIDES } from "../content/geo/financial-guide-data.mjs";

const OUT = "public";
let count = 0;
for (const p of pages) {
  if (GUIDES[p.slug] || FINANCIAL_GUIDES[p.slug]) { console.log(`preserved source-reviewed core guide: ${p.slug}`); continue; }
  const html = renderPage(p);
  const path = join(OUT, `${p.slug}.html`);
  writeFileSync(path, html, "utf8");
  count++;
  console.log(`generated: ${p.slug}.html (${Math.round(html.length / 1024)} KB)`);
}
console.log(`\nTotal: ${count} pages`);
