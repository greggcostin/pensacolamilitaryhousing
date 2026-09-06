// Per-post search signal for BOTH blog engines (lesson L008, 2026-09-04; live API added 2026-09-04).
//
// Two sources, joined to the ledger posts of each site:
//   1. Bing Webmaster Tools API (live, free, keyed by BING_WEBMASTER_API_KEY in .env.local):
//      GetPageStats gives per-URL impressions/clicks/position by date, GetQueryStats the
//      query log, GetRankAndTrafficStats the daily series. Windows (28d, prior 28d, 90d) are
//      computed here. Both sites are verified in the same Bing account.
//   2. Exports Gregg drops into docs/seo-baselines/ (GSC has no free API without OAuth):
//        gsc-pages-YYYY-MM-DD.csv        GSC > Performance > Pages (Top pages,Clicks,Impressions,CTR,Position)
//        gsc-pages-gc-YYYY-MM-DD.csv     same for greggcostin.com
//        *keywords-YYYY-MM-DD.csv        keyword-only exports, matched to each post's targetKeywords
//
// Writes, per site: ledger post.search[] snapshots (idempotent per source+date+kind),
// content/measure/latest-<site>.json (page + query windows, traffic series) and
// content/measure/opportunities-<site>.json (striking-distance queries, CTR problems, rising
// queries, uncovered demand) for DECIDE and the topic miner. Once a month it also drops a
// dated page + query CSV into docs/seo-baselines/ so the baseline directory maintains itself.
//
//   node scripts/blog-measure.mjs                 # both sites, API + exports, write everything
//   node scripts/blog-measure.mjs --site pmh      # one site
//   node scripts/blog-measure.mjs --dry           # print only
//   node scripts/blog-measure.mjs --no-api        # exports only (offline)
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "node:fs";
import { ROOT, TODAY, SITES, loadEnv, bingClient, windowize, bingDate, loadLedger, saveLedger, ledgerPosts, listFragments, tokens } from "./blog-lib.mjs";
import { parseCsv, gscPages, sourceWindow, canonicalPath, assessSearch } from "./search-evidence.mjs";

loadEnv();
const args = process.argv.slice(2);
const DRY = args.includes("--dry");
const NO_API = args.includes("--no-api");
const siteArg = args.includes("--site") ? args[args.indexOf("--site") + 1] : "both";
const siteKeys = siteArg === "both" ? ["pmh", "gc"] : [siteArg];

const csv = (t) => t.replace(/^﻿/, "").trim().split(/\r?\n/).map((l) => (l.match(/("([^"]|"")*"|[^,]*)(,|$)/g) || []).map((c) => c.replace(/,$/, "").replace(/^"|"$/g, "").replace(/""/g, '"')).filter((_, i, a) => i < a.length - 1 || a[i] !== ""));
const num = (s) => { const v = parseFloat(String(s).replace(/[%,]/g, "")); return Number.isFinite(v) ? v : null; };
const dateOf = (f) => (f.match(/(\d{4}-\d{2}-\d{2})/) || [])[1] || "unknown";
const col = (hdr, ...names) => hdr.findIndex((h) => names.some((n) => h.toLowerCase().includes(n)));
const csvCell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

const importStatus = [];
const bing = NO_API ? null : bingClient();
if (!NO_API && !bing) console.warn("BING_WEBMASTER_API_KEY not set: running exports-only (add it to .env.local for live data)");

for (const key of siteKeys) {
  const site = SITES[key];
  const ledger = loadLedger(key);
  const posts = ledgerPosts(ledger);
  const bySlug = new Map(posts.map((p) => [p.slug, p.entry]));
  // fragments that exist but are not in the ledger yet (gc registers posts through the engine, not the factory)
  for (const f of listFragments(key)) if (!bySlug.has(f.slug)) bySlug.set(f.slug, null);
  const snaps = [];
  console.log(`\n=== ${site.name} ===`);

  // ---- 1. exports in docs/seo-baselines ------------------------------------------------
  const files = readdirSync(ROOT + "docs/seo-baselines").filter((f) => f.endsWith(".csv") && !f.startsWith("bing-api-"));
  for (const f of files) {
    const forGc = /-gc-|greggcostin/i.test(f);
    if (forGc !== (key === "gc")) continue;
    let rows;
    try { rows = parseCsv(readFileSync(`${ROOT}docs/seo-baselines/${f}`, "utf8")); }
    catch (e) { importStatus.push({ site: key, file: f, status: "unavailable", reason: e.message }); console.warn(f + ": unavailable: " + e.message); continue; }
    importStatus.push({ site: key, file: f, status: "parsed", rows: Math.max(0, rows.length - 1) });
    if (!rows.length) continue;
    const hdr = rows[0].map((h) => h.toLowerCase());
    const date = dateOf(f), source = f.replace(/-\d{4}-\d{2}-\d{2}\.csv$/, "");
    const iUrl = col(hdr, "page", "url"), iKw = col(hdr, "keyword", "query"), iClk = col(hdr, "click"), iImp = col(hdr, "impression"), iPos = col(hdr, "position");
    if (iUrl >= 0) {
      if (/^gsc-pages/.test(f)) {
        const observed = gscPages(ROOT, f, site.origin);
        for (const [slug] of bySlug) {
          const hit = observed.find((r) => r.url === `/blog/${slug}`);
          snaps.push(hit ? { ...hit, slug } : { slug, url: `/blog/${slug}`, source: "gsc-pages", sourceFile: f, date, property: site.origin, kind: "page", status: "not-observed", impressions: null, clicks: null, position: null, window: sourceWindow(ROOT, f, site.origin), note: "URL not present in this export; this is not proof of zero traffic or non-indexing." });
        }
        continue;
      }
      for (const r of rows.slice(1)) {
        const url = canonicalPath(r[iUrl] || "", site.origin);
        const m = /^\/blog\/([a-z0-9-]+)$/.exec(url || ""); if (!m || !bySlug.has(m[1])) continue;
        snaps.push({ slug: m[1], url, source, sourceFile: f, property: site.origin, window: sourceWindow(ROOT, f, site.origin), date, kind: "page", status: "observed", clicks: num(r[iClk]), impressions: num(r[iImp]), position: num(r[iPos]) });
      }
    } else if (iKw >= 0) {
      for (const [slug, entry] of bySlug) {
        const kws = ((entry && entry.targetKeywords) || []).map((k) => k.toLowerCase());
        if (!kws.length) continue;
        const hits = rows.slice(1).filter((r) => { const q = (r[iKw] || "").toLowerCase(); return q.trim() && kws.some((k) => q.includes(k) || k.includes(q)); });
        if (!hits.length) continue;
        const imp = hits.reduce((a, r) => a + (num(r[iImp]) || 0), 0), clk = hits.reduce((a, r) => a + (num(r[iClk]) || 0), 0);
        const pos = hits.map((r) => num(r[iPos])).filter((v) => v != null);
        snaps.push({ slug, source, date, kind: "keywordDemand", property: site.origin, sourceFile: f, window: sourceWindow(ROOT, f, site.origin), queries: hits.length, impressions: imp, clicks: clk, position: pos.length ? +(pos.reduce((a, b) => a + b, 0) / pos.length).toFixed(1) : null, sample: hits.slice(0, 3).map((r) => r[iKw]) });
      }
    }
  }

  // ---- 2. Bing Webmaster API (live) ----------------------------------------------------
  let opp = null;
  if (bing) {
    try {
      const [pageRows, queryRows, traffic] = await Promise.all([bing.pageStats(site.origin), bing.queryStats(site.origin), bing.rankTraffic(site.origin)]);
      const sharedAsOf = [...(pageRows || []), ...(queryRows || []), ...(traffic || [])].map((r) => bingDate(r.Date)).filter(Boolean).sort().at(-1) || TODAY;
      const pages = windowize(pageRows || [], "Query", sharedAsOf);
      const queries = windowize(queryRows || [], "Query", sharedAsOf);
      const series = (traffic || []).map((r) => ({ date: bingDate(r.Date), impressions: r.Impressions || 0, clicks: r.Clicks || 0 })).filter((r) => r.date).sort((a, b) => a.date.localeCompare(b.date));
      const asOf = sharedAsOf;
      const site28 = series.filter((r) => r.date <= asOf && (new Date(asOf) - new Date(r.date)) / 86400000 <= 27).reduce((a, r) => ({ imp: a.imp + r.impressions, clk: a.clk + r.clicks }), { imp: 0, clk: 0 });
      console.log(`Bing API: ${pages.rows.length} pages, ${queries.rows.length} queries, ${series.length} traffic days, data through ${asOf}; site 28d ${site28.imp} imp / ${site28.clk} clicks`);
      for (const p of pages.rows) {
        const m = /\/blog\/([a-z0-9-]+)/.exec(p.key); if (!m || !bySlug.has(m[1])) continue;
        snaps.push({ slug: m[1], url: `/blog/${m[1]}`, property: site.origin, status: "observed", source: "bing-api", date: asOf, kind: "page", window: { start: new Date(Date.parse(asOf) - 27 * 86400000).toISOString().slice(0, 10), end: asOf, searchType: "web", dimensions: ["page"], filters: {}, complete: false, description: "Trailing bins from returned API rows; report completeness and row aggregation must be confirmed before trend claims." }, clicks: p.clk28, impressions: p.imp28, position: p.pos28, impressionsPrior28: p.impPrior28, clicksPrior28: p.clkPrior28, impressions90: p.imp90, clicks90: p.clk90, position90: p.pos90 });
      }
      // No row is unknown coverage, never a measured zero or evidence of non-indexing.
      for (const [slug, entry] of bySlug) {
        if (snaps.some((s) => s.slug === slug && s.source === "bing-api")) continue;
        const published = entry && (entry.datePublished || entry.published);
        if (published && published <= asOf) snaps.push({ slug, property: site.origin, source: "bing-api", date: asOf, kind: "page", status: "not-observed", clicks: null, impressions: null, position: null, note: "no Bing rows for this URL; coverage unknown" });
      }
      // opportunities for DECIDE + the topic miner
      const rel = (u) => u.replace(site.origin, "") || "/";
      const striking = queries.rows.filter((q) => q.pos90 != null && q.pos90 >= 4 && q.pos90 <= 20 && q.imp90 >= 4).map((q) => ({ query: q.key, imp90: q.imp90, clk90: q.clk90, pos90: q.pos90, imp28: q.imp28 }));
      const ctrProblems = [...pages.rows.filter((p) => p.pos28 != null && p.pos28 <= 6 && p.imp28 >= 8 && p.clk28 === 0).map((p) => ({ page: rel(p.key), imp28: p.imp28, pos28: p.pos28 })), ...queries.rows.filter((q) => q.pos28 != null && q.pos28 <= 4 && q.imp28 >= 6 && q.clk28 === 0).map((q) => ({ query: q.key, imp28: q.imp28, pos28: q.pos28 }))];
      const rising = queries.rows.filter((q) => q.imp28 >= 4 && q.imp28 >= 2 * Math.max(1, q.impPrior28)).map((q) => ({ query: q.key, imp28: q.imp28, impPrior28: q.impPrior28, pos28: q.pos28 }));
      const declining = pages.rows.filter((p) => p.impPrior28 >= 10 && p.imp28 < 0.6 * p.impPrior28).map((p) => ({ page: rel(p.key), imp28: p.imp28, impPrior28: p.impPrior28, pos28: p.pos28 }));
      // uncovered demand: queries with impressions whose tokens do not appear in any post's targetKeywords
      const kwTokens = new Set([...bySlug.values()].flatMap((e) => (e && e.targetKeywords) || []).flatMap(tokens));
      const uncovered = queries.rows.filter((q) => q.imp90 >= 3).filter((q) => { const t = tokens(q.key); return t.length && t.filter((w) => kwTokens.has(w)).length / t.length < 0.5; }).slice(0, 60).map((q) => ({ query: q.key, imp90: q.imp90, pos90: q.pos90 }));
      opp = { site: key, asOf, generated: TODAY, site28, topPages: pages.rows.slice(0, 30).map((p) => ({ page: rel(p.key), imp28: p.imp28, clk28: p.clk28, pos28: p.pos28, imp90: p.imp90, clk90: p.clk90, pos90: p.pos90 })), strikingDistance: striking.slice(0, 60), ctrProblems: [], rising: [], declining: [], exploratory: { ctrCandidates: ctrProblems, risingCandidates: rising.slice(0, 40), decliningCandidates: declining, note: "Unvalidated report windows; inspect before decisions." }, uncoveredDemand: uncovered };
      if (!DRY) {
        mkdirSync(ROOT + "content/measure", { recursive: true });
        writeFileSync(`${ROOT}content/measure/latest-${key}.json`, JSON.stringify({ site: key, asOf, generated: TODAY, pages: pages.rows.map((p) => ({ ...p, key: rel(p.key) })), queries: queries.rows, traffic: series }, null, 1) + "\n");
        writeFileSync(`${ROOT}content/measure/opportunities-${key}.json`, JSON.stringify(opp, null, 1) + "\n");
        // monthly self-maintained baseline exports (one per site per month)
        const month = TODAY.slice(0, 7);
        const have = readdirSync(ROOT + "docs/seo-baselines").some((f) => f.startsWith(`bing-api-pages-${key}-${month}`));
        if (!have && pages.rows.length) {
          writeFileSync(`${ROOT}docs/seo-baselines/bing-api-pages-${key}-${TODAY}.csv`, ["Page,Impressions28,Clicks28,Position28,Impressions90,Clicks90,Position90", ...pages.rows.map((p) => [rel(p.key), p.imp28, p.clk28, p.pos28 ?? "", p.imp90, p.clk90, p.pos90 ?? ""].map(csvCell).join(","))].join("\n") + "\n");
          writeFileSync(`${ROOT}docs/seo-baselines/bing-api-queries-${key}-${TODAY}.csv`, ["Query,Impressions28,Clicks28,Position28,Impressions90,Clicks90,Position90", ...queries.rows.map((q) => [q.key, q.imp28, q.clk28, q.pos28 ?? "", q.imp90, q.clk90, q.pos90 ?? ""].map(csvCell).join(","))].join("\n") + "\n");
          console.log(`baseline exports written for ${month}`);
        }
      }
      console.log(`opportunities: ${striking.length} striking-distance queries, ${ctrProblems.length} CTR problems, ${rising.length} rising, ${declining.length} declining pages, ${uncovered.length} uncovered-demand queries`);
    } catch (e) {
      console.warn(`Bing API unavailable for ${site.name}: ${e.message}`);
    }
  }

  // ---- 3. write snapshots to the ledger -------------------------------------------------
  let added = 0;
  for (const s of snaps) {
    const entry = bySlug.get(s.slug);
    if (!entry) continue; // fragment without a ledger entry: reported, not written
    entry.search = entry.search || [];
    const ix = entry.search.findIndex((x) => x.source === s.source && x.date === s.date && x.kind === s.kind);
    if (ix >= 0) { entry.search[ix] = { ...entry.search[ix], ...s }; continue; }
    entry.search.push(s); added++;
  }
  for (const [, entry] of bySlug) if (entry && entry.search) entry.search.sort((a, b) => a.date.localeCompare(b.date));

  const experiments = JSON.parse(readFileSync(ROOT + "content/measure/ctr-applied.json", "utf8")).applied || [];
  const classify = (entry) => assessSearch(entry?.search, { today: TODAY, published: entry?.datePublished || entry?.published, url: entry?.url ? canonicalPath(entry.url, site.origin) : null, site: key, experiments }).flags.join(", ") || "OBSERVED";
  console.log("post".padEnd(46), "snaps", "latest".padEnd(40), "classification");
  for (const [slug, entry] of bySlug) {
    const last = ((entry && entry.search) || []).slice(-1)[0];
    const lt = last ? `${last.source}@${last.date} ${last.kind === "page" ? `${last.clicks}c/${last.impressions}i pos ${last.position ?? "-"}` : `${last.queries}q ${last.impressions}i/${last.clicks}c`}` : (entry ? "-" : "fragment not in ledger");
    console.log(slug.padEnd(46), String(((entry && entry.search) || []).length).padStart(3).padEnd(6), lt.padEnd(40), classify(entry));
  }
  if (!DRY) { saveLedger(key, ledger); console.log(`${added} snapshot(s) added to ${site.ledger}`); }
  else console.log(`(dry) ${added} snapshot(s) would be added`);
}

if (!DRY) writeFileSync(ROOT + "content/measure/import-status.json", JSON.stringify({ generated: TODAY, bingAttempt: NO_API ? "not attempted (offline)" : bing ? "see per-site output" : "unavailable (key missing)", exports: importStatus }, null, 2) + "\n");
