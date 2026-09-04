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

loadEnv();
const args = process.argv.slice(2);
const DRY = args.includes("--dry");
const NO_API = args.includes("--no-api");
const siteArg = (args[args.indexOf("--site") + 1] || "both");
const siteKeys = siteArg === "both" ? ["pmh", "gc"] : [siteArg];

const csv = (t) => t.replace(/^﻿/, "").trim().split(/\r?\n/).map((l) => (l.match(/("([^"]|"")*"|[^,]*)(,|$)/g) || []).map((c) => c.replace(/,$/, "").replace(/^"|"$/g, "").replace(/""/g, '"')).filter((_, i, a) => i < a.length - 1 || a[i] !== ""));
const num = (s) => { const v = parseFloat(String(s).replace(/[%,]/g, "")); return Number.isFinite(v) ? v : null; };
const dateOf = (f) => (f.match(/(\d{4}-\d{2}-\d{2})/) || [])[1] || "unknown";
const col = (hdr, ...names) => hdr.findIndex((h) => names.some((n) => h.toLowerCase().includes(n)));
const csvCell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

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
    const rows = csv(readFileSync(`${ROOT}docs/seo-baselines/${f}`, "utf8"));
    const hdr = rows[0].map((h) => h.toLowerCase());
    const date = dateOf(f), source = f.replace(/-\d{4}-\d{2}-\d{2}\.csv$/, "");
    const iUrl = col(hdr, "page", "url"), iKw = col(hdr, "keyword", "query"), iClk = col(hdr, "click"), iImp = col(hdr, "impression"), iPos = col(hdr, "position");
    if (iUrl >= 0) {
      for (const r of rows.slice(1)) {
        const m = /\/blog\/([a-z0-9-]+)/.exec(r[iUrl] || ""); if (!m || !bySlug.has(m[1])) continue;
        snaps.push({ slug: m[1], source, date, kind: "page", clicks: num(r[iClk]), impressions: num(r[iImp]), position: num(r[iPos]) });
      }
    } else if (iKw >= 0) {
      for (const [slug, entry] of bySlug) {
        const kws = ((entry && entry.targetKeywords) || []).map((k) => k.toLowerCase());
        if (!kws.length) continue;
        const hits = rows.slice(1).filter((r) => { const q = (r[iKw] || "").toLowerCase(); return kws.some((k) => q.includes(k) || k.includes(q)); });
        if (!hits.length) continue;
        const imp = hits.reduce((a, r) => a + (num(r[iImp]) || 0), 0), clk = hits.reduce((a, r) => a + (num(r[iClk]) || 0), 0);
        const pos = hits.map((r) => num(r[iPos])).filter((v) => v != null);
        snaps.push({ slug, source, date, kind: "keywordDemand", queries: hits.length, impressions: imp, clicks: clk, position: pos.length ? +(pos.reduce((a, b) => a + b, 0) / pos.length).toFixed(1) : null, sample: hits.slice(0, 3).map((r) => r[iKw]) });
      }
    }
  }

  // ---- 2. Bing Webmaster API (live) ----------------------------------------------------
  let opp = null;
  if (bing) {
    try {
      const [pageRows, queryRows, traffic] = await Promise.all([bing.pageStats(site.origin), bing.queryStats(site.origin), bing.rankTraffic(site.origin)]);
      const pages = windowize(pageRows || [], "Query");
      const queries = windowize(queryRows || [], "Query");
      const series = (traffic || []).map((r) => ({ date: bingDate(r.Date), impressions: r.Impressions || 0, clicks: r.Clicks || 0 })).filter((r) => r.date).sort((a, b) => a.date.localeCompare(b.date));
      const asOf = pages.asOf > "0000" ? pages.asOf : (queries.asOf > "0000" ? queries.asOf : TODAY);
      const site28 = series.filter((r) => (new Date(asOf) - new Date(r.date)) / 86400000 <= 27).reduce((a, r) => ({ imp: a.imp + r.impressions, clk: a.clk + r.clicks }), { imp: 0, clk: 0 });
      console.log(`Bing API: ${pages.rows.length} pages, ${queries.rows.length} queries, ${series.length} traffic days, data through ${asOf}; site 28d ${site28.imp} imp / ${site28.clk} clicks`);
      for (const p of pages.rows) {
        const m = /\/blog\/([a-z0-9-]+)/.exec(p.key); if (!m || !bySlug.has(m[1])) continue;
        snaps.push({ slug: m[1], source: "bing-api", date: asOf, kind: "page", clicks: p.clk28, impressions: p.imp28, position: p.pos28, impressionsPrior28: p.impPrior28, clicksPrior28: p.clkPrior28, impressions90: p.imp90, clicks90: p.clk90, position90: p.pos90 });
      }
      // posts with a live URL but no Bing rows at all: record an explicit zero so DECIDE can see it
      for (const [slug, entry] of bySlug) {
        if (snaps.some((s) => s.slug === slug && s.source === "bing-api")) continue;
        const published = entry && (entry.datePublished || entry.published);
        if (published && published <= asOf) snaps.push({ slug, source: "bing-api", date: asOf, kind: "page", clicks: 0, impressions: 0, position: null, impressionsPrior28: 0, clicksPrior28: 0, impressions90: 0, clicks90: 0, position90: null, note: "no Bing rows for this URL" });
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
      opp = { site: key, asOf, generated: TODAY, site28, topPages: pages.rows.slice(0, 30).map((p) => ({ page: rel(p.key), imp28: p.imp28, clk28: p.clk28, pos28: p.pos28, imp90: p.imp90, clk90: p.clk90, pos90: p.pos90 })), strikingDistance: striking.slice(0, 60), ctrProblems, rising: rising.slice(0, 40), declining, uncoveredDemand: uncovered };
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
    if (entry.search.some((x) => x.source === s.source && x.date === s.date && x.kind === s.kind)) continue;
    entry.search.push(s); added++;
  }
  for (const [, entry] of bySlug) if (entry && entry.search) entry.search.sort((a, b) => a.date.localeCompare(b.date));

  const classify = (entry) => {
    const pg = ((entry && entry.search) || []).filter((s) => s.kind === "page");
    if (!pg.length) return "no search data";
    const b = pg[pg.length - 1];
    if (b.source === "bing-api" && b.impressionsPrior28 != null) {
      if (b.impressions === 0 && b.impressionsPrior28 === 0) return "zero (not yet ranking)";
      if (b.impressions >= 2 * Math.max(1, b.impressionsPrior28) && b.impressions >= 4) return "WINNER (rising)";
      if (b.impressionsPrior28 >= 10 && b.impressions < 0.6 * b.impressionsPrior28) return "DECAYED";
      if (b.position != null && b.position <= 6 && b.impressions >= 8 && b.clicks === 0) return "CTR PROBLEM";
      return "flat";
    }
    if (pg.length < 2) return "one snapshot";
    const [a, c] = pg.slice(-2);
    const up = (c.clicks ?? 0) > (a.clicks ?? 0) || ((c.position ?? 99) < (a.position ?? 99) - 1);
    const down = (c.impressions ?? 0) < (a.impressions ?? 0) * 0.6 || ((c.position ?? 99) > (a.position ?? 99) + 3);
    return up ? "WINNER" : down ? "DECAYED" : "flat";
  };
  console.log("post".padEnd(46), "snaps", "latest".padEnd(40), "classification");
  for (const [slug, entry] of bySlug) {
    const last = ((entry && entry.search) || []).slice(-1)[0];
    const lt = last ? `${last.source}@${last.date} ${last.kind === "page" ? `${last.clicks}c/${last.impressions}i pos ${last.position ?? "-"}` : `${last.queries}q ${last.impressions}i/${last.clicks}c`}` : (entry ? "-" : "fragment not in ledger");
    console.log(slug.padEnd(46), String(((entry && entry.search) || []).length).padStart(3).padEnd(6), lt.padEnd(40), classify(entry));
  }
  if (!DRY) { saveLedger(key, ledger); console.log(`${added} snapshot(s) added to ${site.ledger}`); }
  else console.log(`(dry) ${added} snapshot(s) would be added`);
}
