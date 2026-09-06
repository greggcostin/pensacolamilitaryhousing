// Shared helpers for the two blog engines (pensacolamilitaryhousing.com + greggcostin.com).
// Used by blog-measure.mjs, score-post.mjs, topic-miner.mjs and blog-retro.mjs so both
// engines measure, score and learn with one set of definitions.
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { canonicalPath, operatingDate, isoDay } from "./search-evidence.mjs";

export const ROOT = fileURLToPath(new URL("..", import.meta.url)).replace(/\\/g, "/");
export const TODAY = operatingDate();

/** Load .env.local into process.env without overwriting values already set. */
export function loadEnv() {
  const p = ROOT + ".env.local";
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
    if (m && process.env[m[1]] == null) process.env[m[1]] = m[2];
  }
}

export const SITES = {
  pmh: {
    key: "pmh", name: "pensacolamilitaryhousing.com", origin: "https://pensacolamilitaryhousing.com",
    siteDir: "public", blogDir: "public/blog", contentDir: "content/blog",
    ledger: "content/blog/ledger.json", queue: "content/blog/topic-queue.json",
    hubDirs: ["public", "public/bases", "public/communities"], minLinks: 6, audience: "military",
  },
  gc: {
    key: "gc", name: "greggcostin.com", origin: "https://greggcostin.com",
    siteDir: "civilian-site", blogDir: "civilian-site/blog", contentDir: "content/civilian-blog",
    ledger: "content/civilian-blog/ledger.json", queue: "content/civilian-blog/topic-queue.json",
    hubDirs: ["civilian-site", "civilian-site/resources", "civilian-site/neighborhoods"], minLinks: 4, audience: "civilian",
  },
};
export const siteOf = (k) => { const s = SITES[k]; if (!s) throw new Error(`unknown site "${k}" (pmh|gc)`); return s; };

export const readJson = (p) => JSON.parse(readFileSync(ROOT + p, "utf8"));
export const writeJson = (p, o, indent = 2) => { mkdirSync(join(ROOT + p, ".."), { recursive: true }); writeFileSync(ROOT + p, JSON.stringify(o, null, indent) + "\n"); };

/** Parse a fragment file: the <!--PAGE {json} PAGE--> header plus the body HTML. */
export function parseFragment(path) {
  const raw = readFileSync(path.startsWith(ROOT) ? path : ROOT + path, "utf8");
  const m = /<!--PAGE\s*([\s\S]*?)\s*PAGE-->/m.exec(raw);
  if (!m) throw new Error(`${path}: no PAGE header`);
  const spec = JSON.parse(m[1]);
  const body = raw.slice(m.index + m[0].length).trim();
  return { spec, body };
}

export function listFragments(siteKey) {
  const s = siteOf(siteKey);
  const dir = ROOT + s.contentDir;
  return readdirSync(dir).filter((f) => f.endsWith(".fragment.html")).map((f) => {
    const { spec, body } = parseFragment(`${s.contentDir}/${f}`);
    const slug = spec.slug || f.replace(".fragment.html", "");
    return { site: s.key, slug, path: `${s.contentDir}/${f}`, spec, body, url: `${s.origin}/blog/${slug}` };
  });
}

/** Ledger posts normalized to [{slug, entry}] for either shape (pmh: object by slug, gc: array). */
export function ledgerPosts(ledger) {
  if (Array.isArray(ledger.posts)) return ledger.posts.map((e) => ({ slug: e.slug, entry: e }));
  return Object.entries(ledger.posts || {}).map(([slug, entry]) => ({ slug, entry }));
}
export const loadLedger = (siteKey) => readJson(siteOf(siteKey).ledger);
export const saveLedger = (siteKey, ledger) => writeJson(siteOf(siteKey).ledger, ledger, siteKey === "gc" ? 1 : 2);

// ---- text utilities --------------------------------------------------------------------
export const strip = (h) => String(h || "").replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&[a-z#0-9]+;/g, " ").replace(/\s+/g, " ").trim();
export const words = (t) => (strip(t) ? strip(t).split(" ").length : 0);
export const sentences = (t) => strip(t).split(/(?<=[.!?])\s+(?=[A-Z0-9"'(])/).map((x) => x.trim()).filter((x) => x.length > 12);
export const STOP = new Set("the a an and or of to in for on at by with vs versus is are your you what how why when where which who guide 2025 2026 2027 fl florida area near me best top real estate home homes house does do can should it its this that from into about".split(" "));
export const tokens = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9 ]+/g, " ").split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w));
export const overlap = (a, b) => { const A = new Set(tokens(a)), B = new Set(tokens(b)); if (!A.size || !B.size) return 0; let n = 0; for (const t of A) if (B.has(t)) n++; return n / Math.min(A.size, B.size); };

/** Gulf Coast entities: the local-specificity signal both scorers count. */
export const PLACES = /\b(pensacola|gulf breeze|navarre|pace|milton|cantonment|perdido|orange beach|gulf shores|foley|fairhope|daphne|spanish fort|lillian|baldwin|escambia|santa rosa|okaloosa|walton|destin|fort walton|fwb|crestview|niceville|shalimar|mary esther|valparaiso|bluewater bay|east hill|cordova park|ferry pass|beulah|warrington|navy point|myrtle grove|bellview|tiger point|holley|pea ridge|nas pensacola|corry|whiting field|saufley|eglin|hurlburt|duke field|tyndall|palafox|bayou|pensacola beach|32\d{3}|365\d{2})\b/gi;

/** Named-source cues: a number that sits next to one of these reads as attributed. */
export const SOURCE_CUE = /(according to|per |reported|reports|report|says|said|published|data|survey|study|estimate|statute|stat\.|county|department|association|bureau|office of|fema|dod\b|dtmo|bls\b|bea\b|freddie mac|fannie|realtors|zillow|redfin|\bmls\b|census|noaa|\.gov|\.org|tax collector|property appraiser|citizens|\boir\b|apcia|\bnar\b|\bhud\b|\bva\b|fldoe|school grades|insurance journal|bloomberg|cme|fedwatch|federal reserve|fomc)/i;
export const VINTAGE = /\b(20\d{2}|january|february|march|april|may|june|july|august|september|october|november|december|as of|this week|this month|last week|last month|q[1-4]\b)\b/i;
export const QWORDS = /^\s*(what|why|how|is|are|do|does|can|could|should|when|where|which|who|will|did)\b/i;

// ---- Bing Webmaster Tools API -----------------------------------------------------------
// Free with the site's existing key (BING_WEBMASTER_API_KEY in .env.local). Query and page
// stats arrive as dated rows, so 28-day and 90-day windows are computed client side.
export function bingClient(key = process.env.BING_WEBMASTER_API_KEY) {
  if (!key) return null;
  const base = "https://ssl.bing.com/webmaster/api.svc/json/";
  const call = async (method, params) => {
    const qs = Object.entries(params).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&");
    const r = await fetch(`${base}${method}?${qs}&apikey=${key}`);
    if (!r.ok) throw new Error(`Bing ${method}: HTTP ${r.status}`);
    const j = await r.json();
    return j.d;
  };
  return {
    userSites: () => call("GetUserSites", {}),
    queryStats: (siteUrl) => call("GetQueryStats", { siteUrl }),
    pageStats: (siteUrl) => call("GetPageStats", { siteUrl }),
    rankTraffic: (siteUrl) => call("GetRankAndTrafficStats", { siteUrl }),
    pageQueryStats: (siteUrl, pageUrl) => call("GetPageQueryStats", { siteUrl, pageUrl }),
    relatedKeywords: (siteUrl, q, startDate, endDate, country = "us", language = "en-US") => call("GetRelatedKeywords", { siteUrl, q, country, language, startDate, endDate }),
    keywordStats: (siteUrl, q, country = "us", language = "en-US") => call("GetKeywordStats", { siteUrl, q, country, language }),
  };
}
export const bingDate = (value) => {
  const s = String(value), match = /^\/Date\((-?\d+)(?:[+-]\d{4})?\)\/$/.exec(s);
  if (match) { const d = new Date(Number(match[1])); return Number.isFinite(d.getTime()) ? d.toISOString().slice(0, 10) : null; }
  if (isoDay(s.slice(0, 10))) return s.slice(0, 10);
  return null;
};

/** Aggregate dated Bing rows into trailing windows ending at the newest row date. */
export function windowize(rows, keyField, anchor = null) {
  const dated = rows.map((r) => ({ key: r[keyField], date: bingDate(r.Date), imp: r.Impressions || 0, clk: r.Clicks || 0, pos: r.AvgImpressionPosition || 0 })).filter((r) => r.date);
  const asOf = anchor || dated.map((r) => r.date).sort().at(-1) || null;
  const day = (iso) => Math.round((new Date(asOf) - new Date(iso)) / 86400000);
  const out = new Map();
  for (const r of dated) {
    const d = day(r.date);
    if (d < 0) continue;
    const a = out.get(r.key) || (out.set(r.key, { key: r.key, imp28: 0, clk28: 0, posW28: 0, impPrior28: 0, clkPrior28: 0, imp90: 0, clk90: 0, posW90: 0, first: r.date, last: r.date }), out.get(r.key));
    if (d <= 27) { a.imp28 += r.imp; a.clk28 += r.clk; a.posW28 += r.pos * r.imp; }
    else if (d <= 55) { a.impPrior28 += r.imp; a.clkPrior28 += r.clk; }
    if (d <= 89) { a.imp90 += r.imp; a.clk90 += r.clk; a.posW90 += r.pos * r.imp; }
    if (r.date < a.first) a.first = r.date;
    if (r.date > a.last) a.last = r.date;
  }
  const rowsOut = [...out.values()].map((a) => ({ ...a, pos28: a.imp28 ? +(a.posW28 / a.imp28).toFixed(1) : null, pos90: a.imp90 ? +(a.posW90 / a.imp90).toFixed(1) : null }));
  for (const r of rowsOut) { delete r.posW28; delete r.posW90; }
  return { asOf, rows: rowsOut.sort((a, b) => b.imp90 - a.imp90) };
}

// ---- site inventories -------------------------------------------------------------------
export function walkHtml(dirs) {
  const out = [];
  for (const d of dirs) {
    const abs = ROOT + d;
    if (!existsSync(abs)) continue;
    for (const f of readdirSync(abs)) {
      const p = join(abs, f);
      if (statSync(p).isFile() && f.endsWith(".html")) out.push(p.replace(/\\/g, "/"));
    }
  }
  return out;
}

/** Article-context links exclude page furniture and the directory index. */
export function contentRegion(html) {
  return (/<main\b[^>]*>([\s\S]*?)<\/main>/i.exec(html)?.[1] || "")
    .replace(/<!-- EXPLORE_V2 -->[\s\S]*?<!-- \/EXPLORE_V2 -->/g, "")
    .replace(/<(nav|footer|header|script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, "");
}
export function contextualLinks(html, origin) {
  return [...new Set([...contentRegion(html).matchAll(/<a\b[^>]*href=["']([^"']+)["']/gi)]
    .map((m) => canonicalPath(m[1], origin)).filter(Boolean))];
}
export function inboundLinks(siteKey) {
  const s = siteOf(siteKey), counts = new Map();
  for (const p of walkHtml([...s.hubDirs, s.blogDir])) {
    if (p === ROOT + s.siteDir + "/blog.html") continue;
    const self = p.replace(ROOT + s.siteDir, "").replace(/\.html$/, "");
    for (const path of contextualLinks(readFileSync(p, "utf8"), s.origin)) {
      if (!path.startsWith("/blog/") || path === self) continue;
      counts.set(path, (counts.get(path) || 0) + 1);
    }
  }
  return counts;
}

/** Every title/h1/h2/keyword on both sites, for novelty and cannibalization checks. */
export function coverageIndex() {
  const idx = [];
  for (const s of Object.values(SITES)) {
    for (const p of walkHtml([...s.hubDirs, s.blogDir])) {
      const h = readFileSync(p, "utf8");
      const title = strip((/<title>([\s\S]*?)<\/title>/.exec(h) || [])[1] || "");
      const h1 = strip((/<h1[^>]*>([\s\S]*?)<\/h1>/.exec(h) || [])[1] || "");
      const h2s = [...h.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].map((m) => strip(m[1]));
      const kw = (/<meta name="keywords" content="([^"]*)"/.exec(h) || [])[1] || "";
      const rel = p.replace(ROOT, "").replace(s.siteDir, "").replace(".html", "");
      idx.push({ site: s.key, path: rel === "/index" ? "/" : rel, title, h1, h2s, keywords: kw });
    }
  }
  return idx;
}
