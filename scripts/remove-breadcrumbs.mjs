// Remove the visible <nav class="crumbs">…</nav> element above the H1 on
// every static page. The BreadcrumbList JSON-LD schema stays for SEO; only
// the visible breadcrumb is stripped per design preference.

import { readdirSync, readFileSync, writeFileSync } from "node:fs";

function walk(dir, out = []) {
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    const p = `${dir}/${f.name}`;
    if (f.isDirectory()) walk(p, out);
    else if (f.isFile() && /\.html$/.test(f.name)) out.push(p);
  }
  return out;
}

const RE = /<nav class="crumbs">[\s\S]*?<\/nav>\s*/g;

let touched = 0, removed = 0;
for (const path of walk("public")) {
  const c = readFileSync(path, "utf8");
  const matches = c.match(RE);
  if (!matches) continue;
  writeFileSync(path, c.replace(RE, ""), "utf8");
  touched++;
  removed += matches.length;
}
console.log(`Removed ${removed} <nav class="crumbs"> element(s) across ${touched} pages.`);
