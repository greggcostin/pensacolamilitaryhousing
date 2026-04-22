import { readFileSync, writeFileSync } from "node:fs";
import { pages } from "./page-data.mjs";

const TODAY = "2026-04-22";
const path = "public/sitemap.xml";
let xml = readFileSync(path, "utf8");

// Build new entries
const entries = pages.map(p => {
  // Priority scheme: resource pages get .85, homes-for-sale .9 (commercial intent), comparison .8, on-base-vs .75
  let priority = "0.8";
  let changefreq = "monthly";
  if (p.slug.startsWith("homes-for-sale-")) { priority = "0.9"; changefreq = "weekly"; }
  else if (p.slug === "va-loan-pensacola" || p.slug === "fl064-bah-rates") { priority = "0.95"; changefreq = "monthly"; }
  else if (p.slug === "pcs-checklist" || p.slug === "school-zones-military-families") { priority = "0.9"; changefreq = "monthly"; }
  else if (p.slug.startsWith("on-base-vs-off-base-")) { priority = "0.75"; changefreq = "monthly"; }
  return `  <url>
    <loc>https://pensacolamilitaryhousing.com/${p.slug}.html</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}).join("\n");

// Insert before </urlset>
xml = xml.replace("</urlset>", `${entries}\n</urlset>`);
writeFileSync(path, xml, "utf8");
console.log(`Added ${pages.length} URLs to sitemap`);
