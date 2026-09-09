// Synchronize sitemap dates from actual page dates. A build is not a content review.
// Preserve existing dates when a route has no documented page modification date.
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

// 1) Sitemap: honest per-URL <lastmod> (audit 2026-09-02, idx-03 / geo-04). Each static page
// reports its own JSON-LD dateModified (or datePublished); only the SPA routes, the homepage
// and text files retain their existing dates unless an editor explicitly updates them.
const sitemapPath = "public/sitemap.xml";
let sitemap = readFileSync(sitemapPath, "utf8");
const before = sitemap;
const SPA_ROUTES = new Set(["/", "/about", "/contact", "/pcs-guide", "/communities", "/mortgage-calculators"]);
let honest = 0, preserved = 0;
sitemap = sitemap.replace(/<loc>https:\/\/pensacolamilitaryhousing\.com(\/[^<]*)?<\/loc>(\s*)<lastmod>([^<]+)<\/lastmod>/g, (m, path, ws, existingDate) => {
  const p = path || "/";
  let d = existingDate;
  if (!SPA_ROUTES.has(p) && !/\.(txt|xml|json)$/.test(p)) {
    try {
      const html = readFileSync("public" + p + ".html", "utf8");
      const hit = html.match(/"dateModified":\s*"(\d{4}-\d{2}-\d{2})/) || html.match(/"datePublished":\s*"(\d{4}-\d{2}-\d{2})/);
      if (hit) { d = hit[1]; honest++; } else preserved++;
    } catch { preserved++; }
  } else preserved++;
  return "<loc>https://pensacolamilitaryhousing.com" + (path || "") + "</loc>" + ws + "<lastmod>" + d + "</lastmod>";
});
if (sitemap !== before) writeFileSync(sitemapPath, sitemap);
console.log("sitemap lastmod: " + honest + " URLs from their page dateModified, " + preserved + " existing dates preserved");

// Discovery text is edited separately. Rebuilding assets must not imply its text was reviewed.
console.log('Discovery-file review dates preserved.');

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
