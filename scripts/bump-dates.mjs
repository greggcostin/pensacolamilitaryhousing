import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const TODAY_ISO = "2026-04-21";
const TODAY_HUMAN = "April 21, 2026";

// Update sitemap
const sitemapPath = "public/sitemap.xml";
const bases = ["nas-pensacola", "nas-whiting-field", "corry-station", "hurlburt-field", "eglin-afb", "duke-field"];
let sitemap = readFileSync(sitemapPath, "utf8");
for (const b of bases) {
  const re = new RegExp(`(<loc>https://pensacolamilitaryhousing\\.com/${b}\\.html</loc>\\s*<lastmod>)[^<]+(</lastmod>)`);
  sitemap = sitemap.replace(re, `$1${TODAY_ISO}$2`);
}
writeFileSync(sitemapPath, sitemap);
console.log("Sitemap bumped");

// Update "Last updated" stamps in the 6 expanded base pages
for (const b of bases) {
  const path = `public/${b}.html`;
  let html = readFileSync(path, "utf8");
  html = html.replace(/Last updated: April 20, 2026/g, `Last updated: ${TODAY_HUMAN}`);
  writeFileSync(path, html);
  console.log(`Stamped: ${b}.html`);
}
