// Quick integrity audit — broken internal links + orphan pages.
import { readdirSync, readFileSync } from "node:fs";

function walk(dir, out = []) {
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    const p = `${dir}/${f.name}`;
    if (f.isDirectory()) walk(p, out);
    else if (/\.html$/.test(f.name)) out.push(p);
  }
  return out;
}

const files = walk("public");
const existingPages = new Set();
for (const f of files) {
  const rel = "/" + f.replace("public/", "").replace(/\\/g, "/");
  existingPages.add(rel);
  existingPages.add(rel.replace(/\.html$/, ""));
}
// SPA routes + redirects
["/", "/about", "/contact", "/pcs-guide", "/neighborhoods", "/va-loans", "/mortgage-calculators", "/homestead", "/reviews", "/blog",
 "/va-loan-guide", "/va-loans.html", "/va-loan", "/va-loan.html", "/va-loan-pensacola", "/va-loan-pensacola.html",
 "/co-buying-military-homes", "/co-buying-military-homes.html",
 "/sitemap.xml", "/llms.txt", "/llms-full.txt", "/robots.txt", "/site.webmanifest", "/_redirects",
].forEach(r => existingPages.add(r));

const linkRe = /href="(\/[^"#?]+)[\"#?]/g;
const inbound = {};
const hrefs = {};

for (const f of files) {
  const c = readFileSync(f, "utf8");
  let m;
  while ((m = linkRe.exec(c)) !== null) {
    let href = m[1];
    if (href !== "/" && href.endsWith("/")) href = href.slice(0, -1);
    inbound[href] = (inbound[href] || 0) + 1;
    hrefs[href] = hrefs[href] || [];
    hrefs[href].push(f.replace("public/", ""));
  }
}

const broken = Object.keys(hrefs).filter(h => !existingPages.has(h) && !existingPages.has(h + ".html"));
console.log("=== BROKEN INTERNAL LINKS ===");
broken.slice(0, 40).forEach(h => {
  console.log(`  ${h}  ← ${hrefs[h].length} refs, e.g. ${hrefs[h][0]}`);
});
console.log(`Total broken: ${broken.length}`);

console.log("\n=== ORPHAN PAGES (0 inbound internal links) ===");
let orphans = 0;
for (const f of files) {
  const rel = "/" + f.replace("public/", "").replace(/\\/g, "/");
  const relNoHtml = rel.replace(/\.html$/, "");
  if (!inbound[rel] && !inbound[relNoHtml]) {
    console.log("  -", rel);
    orphans++;
  }
}
console.log(`Total orphans: ${orphans}`);

console.log("\n=== TOP 10 MOST-LINKED PAGES ===");
const top = Object.entries(inbound)
  .filter(([h]) => existingPages.has(h) || existingPages.has(h + ".html"))
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10);
top.forEach(([h, n]) => console.log(`  ${n.toString().padStart(3)}  ${h}`));
