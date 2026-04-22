// Remove the 7 SPA anchor URLs from sitemap.xml — these are hash-based SPA
// routes, not crawlable pages. Keeps only real .html / .txt / .xml URLs.

import { readFileSync, writeFileSync } from "node:fs";

const path = "public/sitemap.xml";
let xml = readFileSync(path, "utf8");
const before = (xml.match(/<url>/g) || []).length;

// Remove <url>...</url> blocks whose <loc> contains a hash fragment
xml = xml.replace(/\s*<url>\s*<loc>[^<]*#[^<]*<\/loc>[\s\S]*?<\/url>/g, "");

const after = (xml.match(/<url>/g) || []).length;
writeFileSync(path, xml, "utf8");
console.log(`Sitemap URLs: ${before} → ${after} (removed ${before - after} anchor URLs)`);
