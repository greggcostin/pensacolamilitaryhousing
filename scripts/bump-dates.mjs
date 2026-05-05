// Refresh `<lastmod>` in sitemap.xml and the "Last updated" stamps in
// llms.txt / llms-full.txt to today's date. Wired into `npm run build`
// so dates track deploys without manual edits.
//
// Override the date with: node scripts/bump-dates.mjs 2026-04-22

import { readFileSync, writeFileSync } from "node:fs";

const arg = process.argv[2];
const TODAY = arg && /^\d{4}-\d{2}-\d{2}$/.test(arg)
  ? arg
  : new Date().toISOString().slice(0, 10);

// 1) Sitemap: bump every <lastmod> to today.
const sitemapPath = "public/sitemap.xml";
let sitemap = readFileSync(sitemapPath, "utf8");
const before = sitemap;
sitemap = sitemap.replace(/<lastmod>[^<]+<\/lastmod>/g, `<lastmod>${TODAY}</lastmod>`);
if (sitemap !== before) writeFileSync(sitemapPath, sitemap);

// 2) llms.txt + llms-full.txt: refresh "Last updated:" header.
for (const path of ["public/llms.txt", "public/llms-full.txt"]) {
  let txt;
  try { txt = readFileSync(path, "utf8"); } catch { continue; }
  const updated = txt.replace(/^# Last updated:.*$/m, `# Last updated: ${TODAY}`);
  if (updated !== txt) writeFileSync(path, updated);
}

console.log(`Bumped lastmod / Last updated to ${TODAY}`);
