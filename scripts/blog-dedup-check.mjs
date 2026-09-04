// Cannibalization gate for the blog engine (lesson L003, 2026-09-03).
// Before a topic-queue item is written as a NEW post, check whether a live page already
// owns the topic. Compares the item's targetKeywords + title against every static page's
// <title>, <h1>, <h2>s and meta keywords (the SEO surface), plus every blog fragment's
// PAGE block. Reports the closest pages with a score; --strict exits 1 on any DUPLICATE.
//
//   node scripts/blog-dedup-check.mjs                 # every queue item
//   node scripts/blog-dedup-check.mjs <queue-slug>    # one item
//   node scripts/blog-dedup-check.mjs --kw "assume a va loan" --kw "va loan assumption"
//   add --strict to fail the build on a DUPLICATE verdict
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const STOP = new Set("the a an and or of to in for on at by with vs versus is are your you what how why when where which who guide 2025 2026 2027 fl florida pensacola area near me best top real estate home homes house".split(" "));
const tok = (s) => (s || "").toLowerCase().replace(/[^a-z0-9 ]+/g, " ").split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w));
const strip = (h) => h.replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/g, " ").replace(/\s+/g, " ").trim();

function walk(dir, out = []) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) { if (!/^(og|images|pagefind|fonts)$/.test(f)) walk(p, out); }
    else if (f.endsWith(".html") && !/^(404|blog|index|search|reviews|privacy|terms|accessibility|thank-you)\.html$/.test(f)) out.push(p);
  }
  return out;
}
const corpus = walk("public").map((p) => {
  const h = readFileSync(p, "utf8");
  const title = strip((/<title>([\s\S]*?)<\/title>/.exec(h) || [])[1] || "");
  const h1 = strip((/<h1[^>]*>([\s\S]*?)<\/h1>/.exec(h) || [])[1] || "");
  const h2 = [...h.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].map((m) => strip(m[1])).join(" ");
  const kw = (/<meta name="keywords" content="([^"]*)"/.exec(h) || [])[1] || "";
  const url = "/" + p.split(String.fromCharCode(92)).join("/").replace(/^public\//, "").replace(/\.html$/, "").replace(/\/index$/, "");
  return { url, title, h1, head: `${title} ${h1} ${kw}`.toLowerCase(), body: `${title} ${h1} ${kw} ${h2}`.toLowerCase() };
});

function score(item) {
  const phrases = (item.targetKeywords || []).map((k) => k.toLowerCase());
  const itemTok = new Set(tok([item.title, ...(item.targetKeywords || [])].join(" ")));
  const hits = corpus.map((pg) => {
    const headPhrase = phrases.filter((ph) => pg.head.includes(ph)).length;
    const bodyPhrase = phrases.filter((ph) => pg.body.includes(ph)).length;
    const pgTok = new Set(tok(pg.body));
    let overlap = 0; for (const t of itemTok) if (pgTok.has(t)) overlap++;
    const jac = itemTok.size ? overlap / itemTok.size : 0;
    const s = headPhrase * 3 + bodyPhrase * 1 + jac * 4;
    let verdict = "ok";
    if (headPhrase >= 1 || (bodyPhrase >= 2 && jac >= 0.5)) verdict = "DUPLICATE";
    else if (bodyPhrase >= 1 || jac >= 0.5) verdict = "overlap";
    return { url: pg.url, title: pg.title, s: +s.toFixed(2), headPhrase, bodyPhrase, jac: +jac.toFixed(2), verdict };
  }).filter((x) => x.s > 0).sort((a, b) => b.s - a.s).slice(0, 4);
  const worst = hits.find((h) => h.verdict === "DUPLICATE") ? "DUPLICATE" : hits.find((h) => h.verdict === "overlap") ? "overlap" : "clear";
  return { hits, worst };
}

const args = process.argv.slice(2);
const strict = args.includes("--strict");
let items;
if (args.includes("--kw")) {
  const kws = args.flatMap((a, i) => (a === "--kw" ? [args[i + 1]] : []));
  items = [{ slug: "(ad hoc)", title: kws.join(" "), targetKeywords: kws }];
} else {
  const q = JSON.parse(readFileSync("content/blog/topic-queue.json", "utf8")).queue;
  const one = args.find((a) => !a.startsWith("--"));
  items = one ? q.filter((t) => t.slug === one) : q;
  if (!items.length) { console.error("no queue item matches", one); process.exit(2); }
}
let dupes = 0;
for (const it of items) {
  if (it.isRefresh || String(it.slug).startsWith("REFRESH:")) { console.log(`\n${it.slug}: refresh item, skipped`); continue; }
  const { hits, worst } = score(it);
  if (worst === "DUPLICATE") dupes++;
  console.log(`\n${it.slug}  [${worst}]  kws: ${(it.targetKeywords || []).join(" | ")}`);
  for (const h of hits) console.log(`   ${h.verdict.padEnd(9)} ${String(h.s).padStart(5)}  ${h.url}  (${h.headPhrase} head, ${h.bodyPhrase} body, jac ${h.jac})  ${h.title.slice(0, 60)}`);
  if (!hits.length) console.log("   (no related pages)");
}
console.log(`\n${items.length} item(s) checked, ${dupes} DUPLICATE`);
if (strict && dupes) process.exit(1);
