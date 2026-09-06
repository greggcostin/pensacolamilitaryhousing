// Pull Chrome UX Report field data (real-user LCP, INP, CLS, FCP, TTFB) for both sites through
// the PageSpeed Insights API, plus the Lighthouse lab scores from the same call.
//
//   node --env-file-if-exists=.env.local scripts/psi-field-data.mjs            # both sites, mobile + desktop
//   node --env-file-if-exists=.env.local scripts/psi-field-data.mjs --mobile   # one strategy only
//
// Needs PSI_API_KEY in .env.local (free key: Google Cloud Console > APIs & Services > enable
// "PageSpeed Insights API" > Credentials > Create API key). The anonymous quota is shared by
// everyone using the API without a key and is exhausted most days, which is why the key exists.
// Writes docs/seo-baselines/crux-<date>.json and prints a table. Field data appears only for
// URLs and origins with enough Chrome traffic; "no field data" is a real answer, not an error.
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const KEY = process.env.PSI_API_KEY;
if (!KEY) {
  console.error("PSI_API_KEY is not set. Add PSI_API_KEY=<your key> to .env.local (gitignored) and re-run.");
  process.exit(1);
}
const args = process.argv.slice(2);
const strategies = args.includes("--mobile") ? ["mobile"] : args.includes("--desktop") ? ["desktop"] : ["mobile", "desktop"];
const ALL_URLS = [
  "https://pensacolamilitaryhousing.com/",
  "https://pensacolamilitaryhousing.com/pcs-guide",
  "https://pensacolamilitaryhousing.com/bah-rates",
  "https://pensacolamilitaryhousing.com/bases/nas-pensacola",
  "https://pensacolamilitaryhousing.com/va-disability-property-tax-florida",
  "https://greggcostin.com/",
  "https://greggcostin.com/buy",
  "https://greggcostin.com/neighborhoods",
  "https://greggcostin.com/schools",
];
const siteIndex = args.indexOf("--site");
const selectedSite = siteIndex < 0 ? "both" : args[siteIndex + 1];
if (!["both", "gc", "pmh"].includes(selectedSite)) throw new Error("--site must be gc, pmh, or both");
const urlIndex = args.indexOf("--url");
const selectedUrl = urlIndex < 0 ? null : args[urlIndex + 1];
if (selectedUrl && !ALL_URLS.includes(selectedUrl)) throw new Error("--url must be one of the configured site URLs");
const URLS = ALL_URLS.filter(url => (!selectedUrl || selectedUrl === url) && (selectedSite === "both" || url.includes(selectedSite === "gc" ? "greggcostin.com" : "pensacolamilitaryhousing.com")));

const fmt = (m, k) => {
  const x = m && m[k];
  if (!x) return "no data";
  const v = k === "CUMULATIVE_LAYOUT_SHIFT_SCORE" ? (x.percentile / 100).toFixed(2) : `${x.percentile} ms`;
  return `${v} (${x.category})`;
};
const pct = (c) => (c && c.score != null ? Math.round(c.score * 100) : "n/a");

const results = [];
for (const strategy of strategies) {
  for (const url of URLS) {
    const api = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${strategy}&category=performance&key=${KEY}`;
    let j;
    try {
      const r = await fetch(api, { signal: AbortSignal.timeout(90000) });
      j = await r.json();
      if (j.error) throw new Error(j.error.message);
    } catch (e) {
      console.error(`${strategy} ${url}: ${e.message}`);
      results.push({ url, strategy, error: e.message });
      continue;
    }
    const page = j.loadingExperience || {};
    const origin = j.originLoadingExperience || {};
    const lab = j.lighthouseResult || {};
    const row = {
      url, strategy,
      pageOverall: page.overall_category || "no field data",
      pageLCP: fmt(page.metrics, "LARGEST_CONTENTFUL_PAINT_MS"),
      pageINP: fmt(page.metrics, "INTERACTION_TO_NEXT_PAINT"),
      pageCLS: fmt(page.metrics, "CUMULATIVE_LAYOUT_SHIFT_SCORE"),
      pageTTFB: fmt(page.metrics, "EXPERIMENTAL_TIME_TO_FIRST_BYTE"),
      originOverall: origin.overall_category || "no field data",
      originLCP: fmt(origin.metrics, "LARGEST_CONTENTFUL_PAINT_MS"),
      originINP: fmt(origin.metrics, "INTERACTION_TO_NEXT_PAINT"),
      originCLS: fmt(origin.metrics, "CUMULATIVE_LAYOUT_SHIFT_SCORE"),
      labPerf: pct(lab.categories && lab.categories.performance),
      labLCP: lab.audits && lab.audits["largest-contentful-paint"] ? lab.audits["largest-contentful-paint"].displayValue : "n/a",
      labCLS: lab.audits && lab.audits["cumulative-layout-shift"] ? lab.audits["cumulative-layout-shift"].displayValue : "n/a",
    };
    results.push(row);
    if (args.includes("--diagnostics")) row.diagnostics = Object.fromEntries(Object.entries(lab.audits || {}).filter(([id]) => /image|font|layout|lcp|render-block|third-party|long-tasks|unused|cls-culprits/.test(id)).map(([id,audit]) => [id, { title: audit.title, score: audit.score, displayValue: audit.displayValue, details: audit.details }]));
    console.log(`\n${strategy.toUpperCase()}  ${url}`);
    console.log(`  page  : ${row.pageOverall} | LCP ${row.pageLCP} | INP ${row.pageINP} | CLS ${row.pageCLS} | TTFB ${row.pageTTFB}`);
    console.log(`  origin: ${row.originOverall} | LCP ${row.originLCP} | INP ${row.originINP} | CLS ${row.originCLS}`);
    console.log(`  lab   : perf ${row.labPerf} | LCP ${row.labLCP} | CLS ${row.labCLS}`);
  }
}
const date = new Date().toISOString().slice(0, 10);
mkdirSync("docs/seo-baselines", { recursive: true });
const outputIndex = args.indexOf("--output");
const out = outputIndex < 0 ? `docs/seo-baselines/crux-${date}.json` : args[outputIndex + 1];
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify({ date, results }, null, 2));
console.log(`\nSaved ${out}`);
