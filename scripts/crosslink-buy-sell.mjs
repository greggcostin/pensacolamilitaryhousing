// Add descriptive-anchor "Buy a Home" / "Sell Your Home" links to the top of the
// "Planning & Compare" column of the Explore block on every page (anchor variety
// + contextual footer link equity beyond the nav tabs). Idempotent.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
const BLOCK = `<span class="subhead">Buy or Sell</span>\n<a href="/buy">Buy a Home</a>\n<a href="/sell">Sell Your Home</a>\n`;
const RE = /(<h3 class="explore-title">Planning &amp; Compare<\/h3>\s*<div class="related">\s*)/;
function walk(d, o = []) { for (const f of readdirSync(d, { withFileTypes: true })) { const p = `${d}/${f.name}`; if (f.isDirectory()) walk(p, o); else if (f.name.endsWith(".html")) o.push(p); } return o; }
let n = 0, skip = 0;
for (const p of walk("public")) {
  let c = readFileSync(p, "utf8");
  if (!RE.test(c)) continue;
  if (c.includes('<a href="/buy">Buy a Home</a>')) { skip++; continue; }
  c = c.replace(RE, `$1${BLOCK}`);
  writeFileSync(p, c); n++;
}
console.log(`Crosslinks added to ${n} pages (skipped ${skip}).`);
