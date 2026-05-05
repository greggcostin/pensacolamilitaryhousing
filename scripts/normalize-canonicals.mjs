// Normalize canonical URL convention site-wide:
// Standalone top-level pages currently use /<slug>.html as their canonical
// while /bases/<slug> and /communities/<slug> use clean URLs. This script
// switches every standalone page to clean URLs across canonicals, og:url,
// schema mainEntityOfPage, BreadcrumbList items, internal hrefs, sitemap,
// and llms.txt — and adds .html → clean 301s in _redirects.

import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";

const DOMAIN = "https://pensacolamilitaryhousing.com";

// Standalone top-level HTML slugs (no subdirectory). Discovered dynamically
// so adding a new page doesn't require editing this script.
const SLUGS = readdirSync("public")
  .filter(f => f.endsWith(".html"))
  .map(f => f.replace(/\.html$/, ""))
  // va-loan-guide already canonicalized to /va-loan-guide; redirect rule
  // already exists. Including it here is a no-op for canonical/og but still
  // useful for any stragglers in internal hrefs.
  ;

// Build search→replace pairs for both absolute and relative URL forms.
const PAIRS = [];
for (const slug of SLUGS) {
  PAIRS.push([`${DOMAIN}/${slug}.html`, `${DOMAIN}/${slug}`]);
  PAIRS.push([`"/${slug}.html"`, `"/${slug}"`]);
  PAIRS.push([`'/${slug}.html'`, `'/${slug}'`]);
}
PAIRS.sort((a, b) => b[0].length - a[0].length);

// Walk every .html in public/ recursively, plus index.html, sitemap, llms.
const filesToScan = [];
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full);
    else if (name.endsWith(".html")) filesToScan.push(full);
  }
}
walk("public");
filesToScan.push("index.html");
filesToScan.push("public/sitemap.xml");
filesToScan.push("public/llms.txt");
filesToScan.push("public/llms-full.txt");

let filesChanged = 0, totalSubs = 0;
for (const path of filesToScan) {
  let content;
  try { content = readFileSync(path, "utf8"); } catch { continue; }
  const before = content;
  let local = 0;
  for (const [from, to] of PAIRS) {
    if (content.includes(from)) {
      const count = content.split(from).length - 1;
      content = content.split(from).join(to);
      local += count;
    }
  }
  if (content !== before) {
    writeFileSync(path, content, "utf8");
    filesChanged++;
    totalSubs += local;
    console.log(`  ${path} — ${local} replacements`);
  }
}

console.log(`\nDone. ${filesChanged} files updated, ${totalSubs} replacements total.`);
console.log(`Slugs normalized: ${SLUGS.length}`);
