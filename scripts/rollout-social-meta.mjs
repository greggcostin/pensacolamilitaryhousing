// Adds the share-card tags the military audit requires and most PMH pages lacked (audit og-02 /
// mob-audit Sep 2026): og:locale, twitter:title, twitter:description, twitter:url. Values mirror
// og:title / og:description / canonical so nothing can drift. Idempotent; skips a page that has them.
//   node scripts/rollout-social-meta.mjs [--dry]
import { readdirSync, readFileSync, writeFileSync } from "node:fs";

const DRY = process.argv.includes("--dry");
function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = `${dir}/${e.name}`;
    if (e.isDirectory()) { if (!["og", "images", "pagefind"].includes(e.name)) walk(p, out); }
    else if (e.name.endsWith(".html")) out.push(p);
  }
  return out;
}
const meta = (html, key) => (html.match(new RegExp(`<meta\\b[^>]*\\b(?:property|name)\\s*=\\s*"${key.replace(/[:]/g, "\\:")}"[^>]*>`, "i")) || [])[0];
const content = (tag) => (tag && tag.match(/\bcontent\s*=\s*"([^"]*)"/i) || [])[1];

let changed = 0, skipped = 0;
for (const file of ["index.html", ...walk("public")]) {
  let h = readFileSync(file, "utf8");
  const eol = h.includes("\r\n") ? "\r\n" : "\n";
  const anchor = meta(h, "twitter:card");
  if (!anchor) { skipped++; continue; }
  const ogTitle = content(meta(h, "og:title")), ogDesc = content(meta(h, "og:description"));
  const canonical = (h.match(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/i) || h.match(/<link\b[^>]*href="([^"]+)"[^>]*rel="canonical"/i) || [])[1];
  const add = [];
  if (!meta(h, "og:locale")) add.push(`<meta property="og:locale" content="en_US">`);
  if (!meta(h, "twitter:title") && ogTitle) add.push(`<meta name="twitter:title" content="${ogTitle}">`);
  if (!meta(h, "twitter:description") && ogDesc) add.push(`<meta name="twitter:description" content="${ogDesc}">`);
  if (!meta(h, "twitter:url") && canonical) add.push(`<meta name="twitter:url" content="${canonical}">`);
  if (!add.length) { skipped++; continue; }
  const indent = (h.slice(0, h.indexOf(anchor)).match(/([ \t]*)$/) || ["", ""])[1];
  h = h.replace(anchor, anchor + add.map((t) => eol + indent + t).join(""));
  changed++;
  if (!DRY) writeFileSync(file, h);
}
console.log(`social meta${DRY ? " (dry)" : ""}: ${changed} pages updated, ${skipped} already complete or without a twitter:card anchor`);
