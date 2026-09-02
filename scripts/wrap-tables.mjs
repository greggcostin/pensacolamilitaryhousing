// mob-03 (audit 2026-09-02): bare <table> elements on the static pages get clipped at 320-360px
// because the page CSS sets table{overflow:hidden}. Wraps every table that is not already inside a
// scrolling container in <div class="tbl-scroll"> and adds the one CSS rule the wrapper needs.
// Idempotent. --only <file> to preview one page, --dry to count.
//   node scripts/wrap-tables.mjs [--only public/first-time-military-homebuyer.html] [--dry]
import { readdirSync, readFileSync, writeFileSync } from "node:fs";

const DRY = process.argv.includes("--dry");
const onlyIdx = process.argv.indexOf("--only");
const ONLY = onlyIdx > -1 ? process.argv[onlyIdx + 1].split("\\").join("/") : null;
const CSS = `.tbl-scroll{overflow-x:auto;max-width:100%;-webkit-overflow-scrolling:touch;margin:0 0 1rem}.tbl-scroll>table{margin:0;min-width:100%}`;
const WRAPPED = /class="(?:bah-wrap|tbl-scroll|table-wrap|calc-table-wrap|rate-table-wrap)[^"]*"[^<]*$|overflow(?:-x)?:\s*auto[^<]*$/;

function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = `${dir}/${e.name}`;
    if (e.isDirectory()) { if (!["og", "images", "pagefind"].includes(e.name)) walk(p, out); }
    else if (e.name.endsWith(".html") && e.name !== "404.html") out.push(p);
  }
  return out;
}
const files = ONLY ? [ONLY] : [...walk("public"), ...walk("civilian-site")];
let pages = 0, wrapped = 0;
for (const file of files) {
  let h = readFileSync(file, "utf8");
  const before = h;
  let out = "", last = 0, changed = 0;
  const re = /<table\b[\s\S]*?<\/table>/g;
  let m;
  while ((m = re.exec(h))) {
    const prefix = h.slice(Math.max(0, m.index - 140), m.index);
    out += h.slice(last, m.index);
    if (WRAPPED.test(prefix)) out += m[0];
    else { out += `<div class="tbl-scroll">${m[0]}</div>`; changed++; }
    last = m.index + m[0].length;
  }
  out += h.slice(last);
  h = out;
  if (changed && !h.includes(".tbl-scroll{")) h = h.replace(/<\/style>/, `${CSS}</style>`);
  if (h !== before) { pages++; wrapped += changed; if (!DRY) writeFileSync(file, h); }
}
console.log(`wrap-tables${DRY ? " (dry)" : ""}: ${wrapped} tables wrapped on ${pages} pages`);
