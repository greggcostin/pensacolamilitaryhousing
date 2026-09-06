// Snippet review candidates, with uncertainty and a real measurement window.
// No generic position curve, recoverable-click forecast, or automatic rewrite.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { ROOT, TODAY, SITES, writeJson } from "./blog-lib.mjs";
import { gscPages, assessSearch } from "./search-evidence.mjs";

const args = process.argv.slice(2);
const site = args.includes("--site") ? args[args.indexOf("--site") + 1] : "pmh";
if (!SITES[site]) throw new Error("Use --site pmh or gc");
const config = SITES[site], pattern = site === "gc" ? /^gsc-pages-gc-\d{4}-\d{2}-\d{2}\.csv$/ : /^gsc-pages-\d{4}-\d{2}-\d{2}\.csv$/;
const files = readdirSync(ROOT + "docs/seo-baselines").filter((f) => pattern.test(f)).sort();
if (!files.length) { console.error("No GSC Pages export for " + site); process.exit(2); }
const file = files.at(-1);
const experiments = JSON.parse(readFileSync(ROOT + "content/measure/ctr-applied.json", "utf8")).applied || [];
const rows = gscPages(ROOT, file, config.origin);
const pages = rows.filter((r) => r.status === "observed" && r.impressions >= 30 && r.position != null && r.position <= 15).map((r) => {
  const a = assessSearch([r], { today: TODAY, url: r.url, site, experiments });
  const local = ROOT + config.siteDir + (r.url === "/" ? "/index" : r.url) + ".html";
  const html = existsSync(local) ? readFileSync(local, "utf8") : "";
  return { ...r, ...a, latest: undefined, priority: 0, automaticRewrite: false,
    title: /<title>([^<]*)<\/title>/.exec(html)?.[1] || "(SPA or missing)",
    desc: /name="description" content="([^"]*)"/.exec(html)?.[1] || "",
    nextAction: a.flags.includes("EXPERIMENT-RUNNING") ? "Leave the current variant in place; measure a separate post-change window." :
      a.flags.includes("LOW-SAMPLE") ? "Collect more observations; inspect query intent without claiming a snippet failure." :
      "Review page/query, country and device cohorts and search-result intent before proposing one test." };
}).sort((a, b) => b.impressions - a.impressions);
console.log("Snippet review, " + site + ", export " + file + ". Counts are per selected export period, never monthly estimates.");
console.log("No traffic lift or causal title diagnosis is inferred from average position.");
for (const r of pages) console.log(r.url + ": " + r.clicks + "/" + r.impressions + ", CTR " + (100 * r.ctr).toFixed(2) + "%, 95% interval " + (100 * r.interval.low).toFixed(2) + "-" + (100 * r.interval.high).toFixed(2) + "%; " + r.flags.join(", "));
if (args.includes("--json")) writeJson("content/measure/ctr-" + site + ".json", {
  schemaVersion: 2, source: file, generated: TODAY, window: rows[0]?.window,
  note: "Review candidates only. Uncertainty intervals do not control for query mix or prove a title caused clicks. Exact dates, filters and comparable post-change data are required to evaluate experiments.",
  pages,
});
