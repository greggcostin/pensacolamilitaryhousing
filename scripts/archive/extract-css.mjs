// Extract the shared <style> block from a canonical page (pcs-checklist.html)
// to public/site.css, and replace the inline <style> block in all static pages
// (except faq.html and reviews.html which the user reverted to custom inline
// styles) with a <link rel="stylesheet" href="/site.css"> reference.

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PUB = "public";
const CANONICAL = "pcs-checklist.html";
const KEEP_INLINE = new Set(["faq.html", "reviews.html"]);

// Extract CSS from canonical page's <style> block
const canonicalHtml = readFileSync(join(PUB, CANONICAL), "utf8");
const styleMatch = canonicalHtml.match(/<style>([\s\S]*?)<\/style>/);
if (!styleMatch) throw new Error("No <style> block in " + CANONICAL);
const cssContent = styleMatch[1].trim();

const cssFile = `/* Pensacola Military Housing — unified site stylesheet.
 * Served once, cached for 1 year. Replaces inline <style> blocks on 47
 * static pages. faq.html and reviews.html retain custom inline styles.
 * Last updated: 2026-04-22
 */

${cssContent}
`;

writeFileSync(join(PUB, "site.css"), cssFile, "utf8");
console.log(`Wrote public/site.css (${Math.round(cssFile.length / 1024)} KB)`);

// Replace inline <style> blocks in eligible pages
const LINK_TAG = '<link rel="stylesheet" href="/site.css">';
const files = readdirSync(PUB).filter(f => f.endsWith(".html") && !KEEP_INLINE.has(f));
let count = 0;
let savedTotal = 0;

for (const f of files) {
  const path = join(PUB, f);
  let html = readFileSync(path, "utf8");
  const before = html.length;
  html = html.replace(/<style>[\s\S]*?<\/style>/, LINK_TAG);
  if (html.length < before) {
    writeFileSync(path, html, "utf8");
    count++;
    savedTotal += before - html.length;
  }
}

console.log(`Replaced inline <style> in ${count} pages.`);
console.log(`Saved ${Math.round(savedTotal / 1024)} KB total across those pages.`);
console.log(`Skipped: ${[...KEEP_INLINE].join(", ")}`);
