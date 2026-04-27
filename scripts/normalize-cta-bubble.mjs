// Normalize the "Ready to make your move" CTA bubble across all static pages
// to the canonical transparent-gold styling used on /bases/nas-pensacola.
// 12 pages currently use a solid-gold variant — convert them to the
// transparent variant so the look-and-feel is uniform.

import { readdirSync, readFileSync, writeFileSync } from "node:fs";

// What "wrong" pages currently have (solid gold gradient + ink text)
const OLD_CTA = `.cta{background:linear-gradient(135deg,var(--gold),var(--gold-soft));color:var(--ink);padding:1.75rem;border-radius:10px;margin:2rem auto;text-align:center;font-weight:500}
.cta a{color:var(--ink);font-weight:700}`;

// What canonical pages have (transparent gold + gold border + gold links)
const NEW_CTA = `.cta{background:linear-gradient(135deg,rgba(201,168,76,0.08),rgba(201,168,76,0.02));border:1px solid var(--gold-line);border-radius:10px;padding:1.75rem;margin:2.5rem 0;text-align:center}
.cta strong{color:#fff}
.cta a{color:var(--gold);font-weight:700}
.cta a:hover{color:var(--gold-soft)}`;

function walk(dir, out = []) {
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    const p = `${dir}/${f.name}`;
    if (f.isDirectory()) walk(p, out);
    else if (f.isFile() && /\.html$/.test(f.name)) out.push(p);
  }
  return out;
}

let touched = 0;
for (const path of walk("public")) {
  const c = readFileSync(path, "utf8");
  if (!c.includes(OLD_CTA)) continue;
  writeFileSync(path, c.replace(OLD_CTA, NEW_CTA), "utf8");
  touched++;
}
console.log(`CTA bubble normalized on ${touched} pages.`);
