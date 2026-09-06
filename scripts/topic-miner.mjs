// Real-demand topic radar for BOTH blog engines (lesson L009 made systematic, 2026-09-04).
//
// Instead of guessing topics, mine what people actually type: Google and Bing autosuggest
// fan-out from content/topic-seeds.json (seed x prefix, seed x suffix), Bing's related-keyword
// report (search demand per query), and the site's own Bing query log from
// content/measure/latest-<site>.json (queries already earning impressions). Every candidate
// is scored on demand x intent x local specificity x NOVELTY against every live title, H1
// and H2 on both sites, then clustered into topics with a question skeleton (the H2/FAQ plan).
//
//   node scripts/topic-miner.mjs                       # full mine, writes radar + candidates
//   node scripts/topic-miner.mjs --no-suggest          # skip autosuggest (fast: Bing data only)
//   node scripts/topic-miner.mjs --append-queue 5      # add the top 5 novel clusters to the queues
//   node scripts/topic-miner.mjs --limit 60            # radar size (default 40)
// Outputs: docs/topic-radar.md (human), content/topic-candidates.json (machine).
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { ROOT, TODAY, SITES, loadEnv, bingClient, coverageIndex, tokens, overlap, PLACES, QWORDS, readJson, writeJson } from "./blog-lib.mjs";

import { parseCsv, numberOrNull, sourceWindow } from "./search-evidence.mjs";

loadEnv();
const args = process.argv.slice(2);
const NO_SUGGEST = args.includes("--no-suggest");
const FROM_CACHE = args.includes("--from-cache"); // reuse the last autosuggest pull (content/measure/suggest-cache.json) for fast re-scoring
const NO_BING = args.includes("--no-bing");
const LIMIT = args.includes("--limit") ? +args[args.indexOf("--limit") + 1] : 40;
const APPEND = args.includes("--append-queue") ? +args[args.indexOf("--append-queue") + 1] : 0;
const cfg = readJson("content/topic-seeds.json");
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) costin-topic-radar/1.0";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---- 1. candidates ------------------------------------------------------------------------
const cands = new Map(); // q -> {q, sources:Set, imp:0, pos:null, vol:0, seeds:Set}
const add = (q, source, extra = {}) => {
  q = String(q || "").toLowerCase().replace(/\s+/g, " ").trim();
  if (q.length < 8 || q.length > 90) return;
  if (cfg.ignore.some((w) => q.includes(w))) return;
  const c = cands.get(q) || (cands.set(q, { q, sources: new Set(), imp: 0, pos: null, vol: 0, seeds: new Set() }), cands.get(q));
  c.sources.add(source);
  if (extra.imp) c.imp = Math.max(c.imp, extra.imp); // ranking proxy only; never add Google/Bing or overlapping windows
  if (extra.pos != null) c.pos = c.pos == null ? extra.pos : Math.min(c.pos, extra.pos);
  if (extra.vol) c.vol = Math.max(c.vol, extra.vol);
  if (extra.seed) c.seeds.add(extra.seed);
};

const allSeeds = [...cfg.seeds.military.map((s) => ({ s, a: "military" })), ...cfg.seeds.civilian.map((s) => ({ s, a: "civilian" }))];
const seedAudience = new Map(allSeeds.map(({ s, a }) => [s, a]));

async function gsuggest(q) { try { const r = await fetch(`https://suggestqueries.google.com/complete/search?client=firefox&hl=en&gl=us&q=${encodeURIComponent(q)}`, { headers: { "User-Agent": UA } }); const j = await r.json(); return j[1] || []; } catch { return []; } }
async function bsuggest(q) { try { const r = await fetch(`https://api.bing.com/osjson.aspx?query=${encodeURIComponent(q)}&market=en-US`, { headers: { "User-Agent": UA } }); const j = await r.json(); return j[1] || []; } catch { return []; } }

const CACHE = `${ROOT}content/measure/suggest-cache.json`;
if (FROM_CACHE && existsSync(CACHE)) {
  const j = JSON.parse(readFileSync(CACHE, "utf8"));
  for (const e of j.entries) for (const src of e.sources) add(e.q, src, { seed: e.seeds[0] });
  for (const e of j.entries) for (const s of e.seeds) { const c = cands.get(e.q); if (c) c.seeds.add(s); }
  console.log(`autosuggest (cache ${j.generated}): ${cands.size} candidates`);
} else if (!NO_SUGGEST) {
  const queries = [];
  for (const { s } of allSeeds) {
    for (const p of cfg.prefixes) queries.push({ q: (p + s).trim(), seed: s });
    for (const x of cfg.suffixes) if (x) queries.push({ q: (s + x).trim(), seed: s });
  }
  let n = 0;
  for (const { q, seed } of queries) {
    const [g, b] = await Promise.all([gsuggest(q), bsuggest(q)]);
    for (const s of g) add(s, "google", { seed });
    for (const s of b) add(s, "bing", { seed });
    if (++n % 100 === 0) process.stderr.write(`autosuggest ${n}/${queries.length}\n`);
    await sleep(110);
  }
  console.log(`autosuggest: ${queries.length} queries -> ${cands.size} candidates`);
  writeFileSync(CACHE, JSON.stringify({ generated: TODAY, entries: [...cands.values()].map((c) => ({ q: c.q, sources: [...c.sources], seeds: [...c.seeds] })) }) + "\n");
}

// site query logs (queries already earning impressions) from blog-measure.mjs
for (const key of ["pmh", "gc"]) {
  const p = `${ROOT}content/measure/latest-${key}.json`;
  if (!existsSync(p)) continue;
  const j = JSON.parse(readFileSync(p, "utf8"));
  for (const q of j.queries || []) if (q.imp90 >= 2) add(q.key, `wmt-${key}`, { imp: q.imp90, pos: q.pos90 });
}

// The latest query export is observed discovery evidence. It is not a page attribution
// or monthly search-volume estimate; anonymized/omitted queries remain unavailable.
const exportSources = [];
for (const site of ["pmh", "gc"]) {
  const pattern = site === "gc" ? /^gsc-queries-gc-\d{4}-\d{2}-\d{2}\.csv$/ : /^gsc-queries-\d{4}-\d{2}-\d{2}\.csv$/;
  const file = readdirSync(ROOT + "docs/seo-baselines").filter((f) => pattern.test(f)).sort().at(-1);
  if (!file) continue;
  let parsed;
  try { parsed = parseCsv(readFileSync(ROOT + "docs/seo-baselines/" + file, "utf8")); } catch (e) { console.warn(file + ": unavailable: " + e.message); continue; }
  const [hdr, ...rows] = parsed;
  const idx = (word) => hdr.findIndex((h) => h.toLowerCase().includes(word));
  const iq = idx("quer"), ii = idx("impression"), ip = idx("position");
  if (iq < 0 || ii < 0) continue;
  for (const r of rows) if (numberOrNull(r[ii]) > 0) add(r[iq], "gsc-" + site, { imp: numberOrNull(r[ii]), pos: numberOrNull(r[ip]) });
  exportSources.push({ site, file, window: sourceWindow(ROOT, file, SITES[site].origin) });
}

// Bing related keywords: real search demand per seed (one call per seed)
const bing = NO_BING ? null : bingClient();
if (bing) {
  const end = TODAY, start = new Date(Date.now() - 90 * 86400000).toISOString().slice(0, 10);
  let got = 0;
  for (const { s } of allSeeds) {
    try {
      const rows = await bing.relatedKeywords(SITES.pmh.origin, s, start, end);
      for (const r of rows || []) { add(r.Query, "bing-related", { vol: r.Impressions || 0, seed: s }); got++; }
    } catch (e) { /* quota or transient: skip this seed */ }
    await sleep(80);
  }
  console.log(`bing related keywords: ${got} rows`);
}

// ---- 2. scoring -----------------------------------------------------------------------------
const cov = coverageIndex();
const covText = cov.map((c) => ({ ...c, blob: `${c.title} ${c.h1} ${c.h2s.join(" ")} ${c.keywords}` }));
const bothQueues = ["pmh", "gc"].map((k) => readJson(SITES[k].queue)).flatMap((q) => q.queue || []);
const queueBlob = bothQueues.map((t) => `${t.slug.replace(/-/g, " ")} ${t.title || ""} ${(t.targetKeywords || []).join(" ")} ${t.topic || ""}`);

const intentOf = (q) => {
  if (/\b(zillow|redfin|realtor\.com|trulia|login|phone number|address|hours|map|craigslist|facebook)\b/.test(q)) return "navigational";
  if (QWORDS.test(q) || q.endsWith("?")) return "question";
  if (/\b(vs|versus|compared|or)\b/.test(q)) return "comparison";
  if (/\b(cost|how much|price|prices|rate|rates|fee|fees|average|cheapest|expensive|afford)\b/.test(q)) return "cost";
  if (/\b(best|should i|worth it|pros and cons|good place|safe|safest|top)\b/.test(q)) return "decision";
  if (/\b(how to|requirements|apply|calculator|checklist|guide|steps)\b/.test(q)) return "howto";
  return "informational";
};
const audienceOf = (c) => {
  const q = c.q;
  const m = cfg.audienceCues.military.filter((w) => q.includes(w)).length, v = cfg.audienceCues.civilian.filter((w) => q.includes(w)).length;
  if (m && !v) return "military";
  if (v && !m) return "civilian";
  if (m && v) return "both";
  const seeds = [...c.seeds];
  if (seeds.length && seeds.every((s) => seedAudience.get(s) === "military")) return "military";
  if (seeds.length && seeds.every((s) => seedAudience.get(s) === "civilian")) return "civilian";
  return "both";
};
const hubsFor = (q) => Object.entries(cfg.hubMap).filter(([k]) => q.includes(k)).flatMap(([, v]) => v).slice(0, 3);

// Coverage of the QUERY by a page: shared tokens / query tokens (not min-size overlap, which
// lets any two-word query "match" a long page blob). A query is covered when 80%+ of its
// content tokens already appear in one page's title/H1/H2s/keywords.
const covTokens = covText.map((p) => ({ p, set: new Set(tokens(p.blob)) }));
const queueTokens = bothQueues.map((t) => new Set(tokens(`${t.slug.replace(/-/g, " ")} ${t.title || ""} ${(t.targetKeywords || []).join(" ")}`)));
const coverage = (qTokens, set) => qTokens.filter((w) => set.has(w)).length / qTokens.length;
const PLACE_ONLY = (t) => t.every((w) => PLACES.test(w) && !PLACES.lastIndex-- || /^(fl|al|florida|alabama|county|beach|city|area)$/.test(w));

const GENERIC = new Set(["cost", "much", "how", "best", "good", "place", "live", "living", "moving", "move", "average", "worth", "pros", "cons", "requirements", "calculator", "2026", "guide", "near", "families", "retirees", "reddit", "many", "top", "really", "actually", "still", "new"]);
const inDomain = (q) => cfg.domain.some((w) => q.includes(w));
const offRegion = (q) => (cfg.offRegion || []).some((w) => q.includes(w));
const STATEWIDE = /\b(florida|alabama|fl\b|al\b|panhandle|gulf coast|emerald coast)/;

const scored = [];
for (const c of cands.values()) {
  const t = tokens(c.q);
  if (t.length < 2) continue;
  if (!inDomain(c.q)) continue; // not a homeownership question (resorts, banks, shopping)
  const hasPlace = PLACES.test(c.q); PLACES.lastIndex = 0;
  // geography gate: a Gulf Coast place, or a statewide Florida/Alabama topic with no off-region place
  if (!hasPlace && (offRegion(c.q) || !STATEWIDE.test(c.q))) continue;
  if (hasPlace && offRegion(c.q)) continue;
  const contentTokens = t.filter((w) => { const m = PLACES.test(w); PLACES.lastIndex = 0; return !m && !/^(fl|al|florida|alabama|county|beach|city|area)$/.test(w); });
  if (!contentTokens.length) continue; // a bare place name is a hub, not a post
  const intent = intentOf(c.q);
  if (intent === "navigational") continue;
  // novelty on the query's specific tokens only: "is pace florida a good place to live" resolves to the Pace page
  const specific = t.filter((w) => !GENERIC.has(w));
  const covQ = specific.length ? specific : t;
  let best = 0, coveredBy = null;
  for (const { p, set } of covTokens) { const o = coverage(covQ, set); if (o > best) { best = o; coveredBy = `${p.site}:${p.path}`; } }
  const novelty = 1 - best;
  const engines = (c.sources.has("google") ? 1 : 0) + (c.sources.has("bing") ? 1 : 0);
  const demand = 0.25 * engines + 2 * Math.log1p(c.imp) + 0.5 * Math.log1p(c.vol); // suggestions are phrasing evidence, not measured demand
  // national generic queries (no place) are the failed archetype in content-strategy.md §2: heavy penalty unless Florida/Alabama is named
  const placeFactor = hasPlace ? 1.5 : /\b(florida|alabama|fl|al|panhandle|gulf coast|emerald coast)\b/.test(c.q) ? 1.0 : 0.45;
  const score = demand * (cfg.intentWeights[intent] || 1) * placeFactor * (0.4 + 0.6 * novelty);
  scored.push({ q: c.q, score: +score.toFixed(2), demand: +demand.toFixed(2), intent, audience: audienceOf(c), hasPlace, novelty: +novelty.toFixed(2), coveredBy: best >= 0.6 ? coveredBy : null, imp: c.imp, pos: c.pos, vol: c.vol, sources: [...c.sources], hubs: hubsFor(c.q) });
}
scored.sort((a, b) => b.score - a.score);

// ---- 3. clustering -------------------------------------------------------------------------
const clusterKey = (q) => { const t = tokens(q).filter((w) => !GENERIC.has(w)).sort(); return t.slice(0, 3).join(" ") || tokens(q).sort().slice(0, 2).join(" "); };
const clusters = new Map();
for (const s of scored) {
  const k = clusterKey(s.q);
  const c = clusters.get(k) || (clusters.set(k, { key: k, score: 0, members: [], questions: [], imp: 0, vol: 0, audiences: {} }), clusters.get(k));
  c.score += s.score; c.imp = Math.max(c.imp, s.imp); c.vol = Math.max(c.vol, s.vol); c.members.push(s);
  if (s.intent === "question") c.questions.push(s.q);
  c.audiences[s.audience] = (c.audiences[s.audience] || 0) + 1;
}
const ranked = [...clusters.values()].map((c) => {
  c.members.sort((a, b) => b.score - a.score);
  const rep = c.members[0];
  const aud = Object.entries(c.audiences).sort((a, b) => b[1] - a[1])[0][0];
  const novelty = Math.max(...c.members.map((m) => m.novelty));
  const covered = c.members.filter((m) => m.coveredBy).map((m) => m.coveredBy);
  const coveredBy = covered.length ? [...new Set(covered)].slice(0, 2) : [];
  const repTokens = tokens(rep.q).filter((w) => !GENERIC.has(w));
  const inQueue = queueTokens.some((set) => coverage(repTokens.length ? repTokens : tokens(rep.q), set) >= 0.8);
  const archetype = /\b(moving to|living in|relocat)/.test(rep.q) ? "mega-guide" : ["decision", "comparison", "question"].includes(rep.intent) ? "decision" : rep.intent === "cost" ? "data-study" : "decision";
  return { key: c.key, score: +c.score.toFixed(1), representative: rep.q, intent: rep.intent, audience: aud, archetype, novelty: +novelty.toFixed(2), coveredBy, inQueue, impressions: c.imp, bingVolume: c.vol, hubs: [...new Set(c.members.flatMap((m) => m.hubs))].slice(0, 3), members: c.members.slice(0, 12).map((m) => m.q), questions: [...new Set(c.questions)].slice(0, 12) };
}).sort((a, b) => b.score - a.score);

// one-member clusters that exist only because Bing's related feed carries a volume number are brand/venue noise, not topics
const radar = ranked.filter((c) => c.novelty >= 0.35 && !c.inQueue && (c.members.length >= 2 || c.impressions > 0)).slice(0, LIMIT);
const covered = ranked.filter((c) => c.coveredBy.length && c.novelty < 0.35).slice(0, 25);
writeJson("content/topic-candidates.json", { generated: TODAY, schemaVersion: 2, collection: { suggestions: FROM_CACHE ? "cache" : NO_SUGGEST ? "not collected" : "attempted", bingRelated: NO_BING ? "not collected" : "attempted if configured" }, exportSources, scoringNote: "Editorial ranking proxy, not traffic or volume. Exposure is the maximum observed row across sources in the cluster, never summed overlapping windows. Suggestions supply wording only. Token overlap is a candidate match requiring intent review.", candidates: scored.length, clusters: ranked.length, radar, covered, queued: ranked.filter((c) => c.inQueue).slice(0, 25) }, 1);

const md = [`# Topic radar, ${TODAY}`, "",
  `Generated by scripts/topic-miner.mjs from ${scored.length} scored queries (${cands.size} raw) in ${ranked.length} clusters. Observed source labels: ${[...new Set(scored.flatMap((r) => r.sources))].join(", ")}. Suggestions: ${NO_SUGGEST ? "not collected" : FROM_CACHE ? "cached" : "requested"}. Counts retain their own source periods. Score = demand x intent x local x novelty; novelty is measured against every live title, H1 and H2 on both sites, so a high score suggests a cluster to investigate; inspect actual page coverage and reader intent before a new article.`, "",
  "## Top clusters not yet covered or queued", "",
  "| # | Score | Aud | Archetype | Representative query | Demand evidence | Members | Hubs |", "|---|---|---|---|---|---|---|---|",
  ...radar.map((c, i) => `| ${i + 1} | ${c.score} | ${c.audience} | ${c.archetype} | ${c.representative} | ${c.impressions ? `${c.impressions} max observed row imp` : ""}${c.bingVolume ? ` ${c.bingVolume} bing vol` : ""}${!c.impressions && !c.bingVolume ? "autosuggest" : ""} | ${c.members.length} | ${c.hubs.join(" ") || ""} |`),
  "", "## Question skeletons for the top 15 (H2 / FAQ plans)", ""];
for (const c of radar.slice(0, 15)) {
  md.push(`### ${c.representative}`, `Audience ${c.audience}, ${c.archetype}, novelty ${c.novelty}${c.coveredBy.length ? `, nearest live page ${c.coveredBy.join(", ")}` : ""}.`, "");
  for (const q of (c.questions.length ? c.questions : c.members).slice(0, 10)) md.push(`- ${q}`);
  md.push("");
}
md.push("## Demand the sites already answer (refresh candidates, not new posts)", "", ...covered.map((c) => `- ${c.representative} -> ${c.coveredBy.join(", ")}`), "");
writeFileSync(ROOT + "docs/topic-radar.md", md.join("\n") + "\n");
console.log(`radar: ${radar.length} novel clusters, ${covered.length} covered, ${ranked.filter((c) => c.inQueue).length} already queued -> docs/topic-radar.md`);
for (const c of radar.slice(0, 15)) console.log(`  ${String(c.score).padStart(6)}  ${c.audience.padEnd(8)} ${c.archetype.padEnd(10)} ${c.representative}${c.impressions ? `  [${c.impressions} imp]` : ""}`);

// ---- 4. optional: append to the queues ------------------------------------------------------
if (APPEND) {
  const slugify = (s) => s.replace(/[^a-z0-9 ]/g, "").trim().split(/\s+/).slice(0, 7).join("-");
  const cap = (s) => s.replace(/\b[a-z]/g, (m) => m.toUpperCase()).replace(/\bFl\b/g, "FL").replace(/\bAl\b/g, "AL").replace(/\bNas\b/g, "NAS").replace(/\bAfb\b/g, "AFB").replace(/\bBah\b/g, "BAH").replace(/\bVa\b/g, "VA").replace(/\bHoa\b/g, "HOA");
  const added = { pmh: 0, gc: 0 };
  for (const c of radar.filter((c) => c.novelty >= 0.5).slice(0, APPEND)) {
    const key = c.audience === "civilian" ? "gc" : "pmh";
    const queue = readJson(SITES[key].queue);
    const slug = slugify(c.representative);
    if ((queue.queue || []).some((t) => t.slug === slug || coverage(tokens(c.representative), new Set(tokens(`${t.slug.replace(/-/g, " ")} ${t.title || t.topic || ""} ${(t.targetKeywords || []).join(" ")}`))) >= 0.8)) continue;
    const item = key === "gc"
      ? { slug, topic: `${cap(c.representative)}: ${c.questions.slice(0, 3).join("; ") || c.members.slice(1, 4).join("; ")}`, type: "evergreen", targetKeywords: c.members.slice(0, 4), source: `topic-miner ${TODAY}`, evidence: `Real-demand mining: ${c.members.length} related queries from autosuggest${c.impressions ? `, ${c.impressions} max observed row impressions in Bing WMT` : ""}${c.bingVolume ? `, Bing related-keyword demand ${c.bingVolume}` : ""}; novelty ${c.novelty} against every live title/H1/H2 on both sites.` }
      : { slug, archetype: c.archetype, audience: c.audience, title: cap(c.representative), targetKeywords: c.members.slice(0, 4), evidence: `Real-demand mining (topic-miner ${TODAY}): ${c.members.length} related queries from autosuggest${c.impressions ? `, ${c.impressions} max observed row impressions in Bing WMT` : ""}${c.bingVolume ? `, Bing related-keyword demand ${c.bingVolume}` : ""}; novelty ${c.novelty}. Question skeleton: ${c.questions.slice(0, 5).join(" | ")}`, rerank: `ADDED ${TODAY} by scripts/topic-miner.mjs; run blog-dedup-check before writing.` };
    item.evidenceTier = c.impressions ? "observed-query" : "suggestion-only";
    item.workflowStatus = "needs-intent-review";
    item.requiredBrief = ["existing intent owner", "reader decision", "original practical asset", "primary source plan", "relevant tool and inquiry path"];
    queue.queue.push(item);
    writeJson(SITES[key].queue, queue, key === "gc" ? 1 : 2);
    added[key]++;
  }
  console.log(`appended ${added.pmh} item(s) to the military queue, ${added.gc} to the civilian queue`);
}
