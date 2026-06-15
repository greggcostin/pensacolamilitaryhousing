// Add "Buy" and "Sell" top-level tabs to the banner on every static page,
// and add /buy and /sell to sitemap.xml. SPA nav (App.jsx) is edited separately.
// Idempotent: skips files that already have the Buy tab in the banner.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";

const ANCHOR = '<a href="/about">About Me</a>';
const INSERT = ANCHOR + '\n<a href="/buy">Buy</a>\n<a href="/sell">Sell</a>';

function walk(dir, out = []) {
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    const p = `${dir}/${f.name}`;
    if (f.isDirectory()) walk(p, out);
    else if (f.isFile() && f.name.endsWith(".html")) out.push(p);
  }
  return out;
}

let touched = 0, skipped = 0;
for (const path of walk("public")) {
  let c = readFileSync(path, "utf8");
  if (!c.includes(ANCHOR)) { continue; }
  if (c.includes('<a href="/buy">Buy</a>')) { skipped++; continue; }
  c = c.replace(ANCHOR, INSERT);
  writeFileSync(path, c);
  touched++;
}
console.log(`Banner Buy/Sell tabs added to ${touched} pages (skipped ${skipped} already-done).`);

// sitemap.xml
const sp = "public/sitemap.xml";
let sm = readFileSync(sp, "utf8");
if (!sm.includes("<loc>https://pensacolamilitaryhousing.com/buy</loc>")) {
  const block =
`  <url>
    <loc>https://pensacolamilitaryhousing.com/buy</loc>
    <lastmod>2026-06-14</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://pensacolamilitaryhousing.com/sell</loc>
    <lastmod>2026-06-14</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
`;
  sm = sm.replace("</urlset>", block + "</urlset>");
  writeFileSync(sp, sm);
  console.log("Added /buy and /sell to sitemap.xml");
} else {
  console.log("sitemap already has /buy");
}
