// Report drift between sitemap.xml (the canonical URL inventory) and llms.txt
// (the curated AI content map). Run after adding/renaming pages:
//   node scripts/check-llms-sync.mjs
// Exit 0 always (report-only — llms.txt is curated, not exhaustive), but any
// "MISSING" line means an indexable page is invisible to AI crawlers' map.
import { readFileSync } from "node:fs";

const sitemap = readFileSync("public/sitemap.xml", "utf8");
const llms = readFileSync("public/llms.txt", "utf8");

const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(/\/$/, "") || "https://pensacolamilitaryhousing.com");
const EXEMPT = ["https://pensacolamilitaryhousing.com", "https://pensacolamilitaryhousing.com/llms.txt", "https://pensacolamilitaryhousing.com/llms-full.txt"];
let missing = 0;
for (const u of urls) {
  if (EXEMPT.includes(u)) continue; // homepage described throughout; llms files are the map itself
  if (!llms.includes(u)) { console.log("MISSING from llms.txt:", u); missing++; }
}
// Only count llms URLs that appear as section headers ("### Title — URL"), not prose substrings.
const llmsUrls = [...llms.matchAll(/^### .+ — (https:\/\/pensacolamilitaryhousing\.com\/[a-z0-9/-]+)$/gm)].map((m) => m[1]);
let stale = 0;
for (const u of new Set(llmsUrls)) {
  if (!sitemap.includes(`<loc>${u}</loc>`) && !sitemap.includes(`<loc>${u}/</loc>`)) { console.log("IN llms.txt but NOT sitemap (stale or unindexed):", u); stale++; }
}
console.log(`\nsitemap URLs: ${urls.length} | missing from llms.txt: ${missing} | llms-only: ${stale}`);
