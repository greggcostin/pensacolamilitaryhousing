// Refresh `<lastmod>` in sitemap.xml and the "Last updated" stamps in
// llms.txt / llms-full.txt to today's date. Wired into `npm run build`
// so dates track deploys without manual edits.
//
// Override the date with:      node scripts/bump-dates.mjs 2026-07-06
//
// OPT-IN page-stamp sync (NOT part of the default build — run it by hand only
// after a real content pass, so we never blanket-bump untouched pages to a
// fresh date, which is a dishonest freshness signal to Google):
//
//   node scripts/bump-dates.mjs 2026-07-06 --html            (all public HTML)
//   node scripts/bump-dates.mjs 2026-07-06 --html --changed  (only git-changed HTML)
//
// --html updates each page's Article `dateModified`, the `article:modified_time`
// OG meta, the visible "Last updated: <Month> <day>, <year>" line, and the author
// card's "Reviewed & updated · <Month> <year>". It deliberately does NOT touch
// "Content last verified" (that asserts a re-verification we did not necessarily do)
// or datePublished / article:published_time (original publish dates are immutable).

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { execSync } from "node:child_process";
import { join } from "node:path";

const args = process.argv.slice(2);
const dateArg = args.find((a) => /^\d{4}-\d{2}-\d{2}$/.test(a));
const doHtml = args.includes("--html");
const onlyChanged = args.includes("--changed");

const TODAY = dateArg || new Date().toISOString().slice(0, 10);
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const [Y, M, D] = TODAY.split("-").map(Number);
const LONG = `${MONTHS[M - 1]} ${D}, ${Y}`; // "July 6, 2026"
const MONTH_YEAR = `${MONTHS[M - 1]} ${Y}`;  // "July 2026"

// 1) Sitemap: bump every <lastmod> to today.
const sitemapPath = "public/sitemap.xml";
let sitemap = readFileSync(sitemapPath, "utf8");
const before = sitemap;
sitemap = sitemap.replace(/<lastmod>[^<]+<\/lastmod>/g, `<lastmod>${TODAY}</lastmod>`);
if (sitemap !== before) writeFileSync(sitemapPath, sitemap);

// 2) llms.txt + llms-full.txt: refresh "Last updated:" header.
for (const path of ["public/llms.txt", "public/llms-full.txt"]) {
  let txt;
  try { txt = readFileSync(path, "utf8"); } catch { continue; }
  const updated = txt.replace(/^# Last updated:.*$/m, `# Last updated: ${TODAY}`);
  if (updated !== txt) writeFileSync(path, updated);
}

console.log(`Bumped lastmod / Last updated to ${TODAY}`);

// 3) Opt-in: sync per-page dateModified + visible stamps.
if (doHtml) {
  function walk(dir) {
    const out = [];
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) out.push(...walk(p));
      else if (name.endsWith(".html")) out.push(p);
    }
    return out;
  }
  let files = walk("public");
  if (onlyChanged) {
    const changed = new Set(
      execSync("git status --porcelain -- public", { encoding: "utf8" })
        .split("\n").map((l) => l.slice(3).trim()).filter(Boolean)
        .map((p) => p.replace(/\\/g, "/"))
    );
    files = files.filter((f) => changed.has(f.replace(/\\/g, "/")));
  }
  let touched = 0;
  for (const f of files) {
    let s = readFileSync(f, "utf8");
    const orig = s;
    s = s.replace(/"dateModified":"\d{4}-\d{2}-\d{2}"/g, `"dateModified":"${TODAY}"`);
    s = s.replace(/(<meta[^>]*property="article:modified_time"[^>]*content=")[^"]*(")/g, `$1${TODAY}T00:00:00Z$2`);
    s = s.replace(/Last updated: [A-Z][a-z]+ \d{1,2}, \d{4}/g, `Last updated: ${LONG}`);
    s = s.replace(/(Reviewed &amp; updated &middot; )[A-Z][a-z]+ \d{4}/g, `$1${MONTH_YEAR}`);
    if (s !== orig) { writeFileSync(f, s); touched++; }
  }
  console.log(`--html: synced dateModified + visible stamps on ${touched} page(s) to ${TODAY}`);
}
