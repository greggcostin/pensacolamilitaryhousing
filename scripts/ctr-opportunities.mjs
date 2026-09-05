// UNDERCLICKED pages from the newest GSC Pages export (lesson L014, 2026-09-04).
// Google is where the impressions are; the Bing-API opportunities file cannot see them.
// A page that already ranks on page one but converts under 1.5% of impressions is the
// cheapest fix on the site: the title and description are the only variables.
//
//   node scripts/ctr-opportunities.mjs            # sitewide table, blog rows marked
//   node scripts/ctr-opportunities.mjs --json     # write content/measure/ctr-pmh.json
import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";

const files = readdirSync("docs/seo-baselines").filter((f) => /^gsc-pages-\d{4}-\d{2}-\d{2}\.csv$/.test(f)).sort();
if (!files.length) { console.error("no gsc-pages-YYYY-MM-DD.csv in docs/seo-baselines"); process.exit(2); }
const file = files.at(-1), date = file.match(/\d{4}-\d{2}-\d{2}/)[0];
const rows = readFileSync(`docs/seo-baselines/${file}`, "utf8").replace(/^\uFEFF/, "").trim().split(/\r?\n/).slice(1)
  .map((l) => (l.match(/("([^"]|"")*"|[^,]*)(,|$)/g) || []).map((c) => c.replace(/,$/, "").replace(/^"|"$/g, "")))
  .map((c) => ({ url: c[0].replace(/^https?:\/\/[^/]+/, "") || "/", clicks: +c[1], imp: +c[2], ctr: parseFloat(c[3]) / 100, pos: +c[4] }))
  .filter((r) => r.url && Number.isFinite(r.imp));

// Expected CTR by position is a rough public-benchmark curve; the point is the gap, not the decimals.
const expect = (pos) => pos <= 1 ? 0.28 : pos <= 2 ? 0.15 : pos <= 3 ? 0.10 : pos <= 5 ? 0.06 : pos <= 8 ? 0.035 : pos <= 10 ? 0.025 : pos <= 15 ? 0.015 : 0.008;
const meta = (url) => {
  const f = "public" + (url === "/" ? "/index" : url) + ".html";
  if (!existsSync(f)) return { title: "(spa or missing)", desc: "" };
  const h = readFileSync(f, "utf8");
  return { title: ((/<title>([^<]*)<\/title>/.exec(h) || [])[1] || "").trim(), desc: ((/name="description" content="([^"]*)"/.exec(h) || [])[1] || "").trim() };
};
const out = rows
  .filter((r) => r.imp >= 30 && r.pos <= 15)
  .map((r) => { const e = expect(r.pos); const lost = Math.round(r.imp * Math.max(0, e - r.ctr)); return { ...r, expected: e, lostClicks: lost, ...meta(r.url) }; })
  .filter((r) => r.lostClicks >= 5 || (r.clicks === 0 && r.imp >= 30))
  .sort((a, b) => b.lostClicks - a.lostClicks);

console.log(`UNDERCLICKED (GSC ${date}): impressions >= 30, position <= 15, CTR below the position benchmark\n`);
console.log("lost/mo".padStart(7), "clk".padStart(4), "imp".padStart(6), "ctr".padStart(6), "pos".padStart(5), " url");
for (const r of out) console.log(String(r.lostClicks).padStart(7), String(r.clicks).padStart(4), String(r.imp).padStart(6), (r.ctr * 100).toFixed(1).padStart(5) + "%", r.pos.toFixed(1).padStart(5), (r.url.startsWith("/blog/") ? " [blog] " : " ") + r.url);
console.log(`\n${out.length} pages; ${out.reduce((a, r) => a + r.lostClicks, 0)} clicks/period left on the table vs benchmark`);
if (process.argv.includes("--json")) {
  writeFileSync("content/measure/ctr-pmh.json", JSON.stringify({ source: file, date, benchmark: "expected CTR by position, public curve", pages: out }, null, 2) + "\n");
  console.log("wrote content/measure/ctr-pmh.json");
}
