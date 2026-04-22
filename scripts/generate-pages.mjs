import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { renderPage } from "./page-template.mjs";
import { pages } from "./page-data.mjs";

const OUT = "public";
let count = 0;
for (const p of pages) {
  const html = renderPage(p);
  const path = join(OUT, `${p.slug}.html`);
  writeFileSync(path, html, "utf8");
  count++;
  console.log(`generated: ${p.slug}.html (${Math.round(html.length / 1024)} KB)`);
}
console.log(`\nTotal: ${count} pages`);
