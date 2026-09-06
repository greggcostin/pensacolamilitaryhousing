// Search evidence is observational. Export dates are not measurement windows.
import { existsSync, readFileSync } from "node:fs";

export const operatingDate = (date = new Date()) => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
export const POLICY = Object.freeze({ version: 2, minDays: 28, minImpressions: 200, minTrendImpressions: 100, maxAgeDays: 45, snippetReviewCtr: 0.01, cooldownDays: 28 });
export const dayDiff = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 86400000);
export const isoDay = (s) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && Number.isFinite(Date.parse(s)) && new Date(s).toISOString().slice(0, 10) === s;
export const numberOrNull = (v) => {
  if (v == null || String(v).trim() === "") return null;
  const t = String(v).replace(/,/g, "").trim();
  return /^\d+(?:\.\d+)?%?$/.test(t) ? Number(t.replace(/%$/, "")) : null;
};

/** RFC-style quoted fields, including embedded commas, quotes and newlines. */
export function parseCsv(text) {
  const rows = [], row = [];
  let cell = "", quoted = false;
  const input = String(text).replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (ch === '"') {
      if (quoted && input[i + 1] === '"') { cell += '"'; i++; }
      else if (quoted || cell === "") quoted = !quoted;
      else throw new Error("CSV quote inside an unquoted field at line " + (input.slice(0, i).split("\n").length));
    } else if (!quoted && (ch === "," || ch === "\n")) {
      row.push(cell); cell = "";
      if (ch === "\n") { if (row.some(Boolean)) rows.push(row.splice(0)); else row.length = 0; }
    } else cell += ch;
  }
  if (quoted) throw new Error("CSV has an unterminated quoted field");
  if (cell || row.length) { row.push(cell); if (row.some(Boolean)) rows.push(row); }
  return rows;
}

export function sourceWindow(root, file, property) {
  const path = root + "content/measure/source-windows.json";
  const entries = existsSync(path) ? JSON.parse(readFileSync(path, "utf8")).exports || {} : {};
  const e = entries[file];
  if (e?.property && e.property !== property) throw new Error(file + ": property metadata mismatch");
  return {
    start: e?.start || null, end: e?.end || null,
    searchType: e?.searchType ?? null, dimensions: e?.dimensions ?? null, filters: e?.filters ?? null,
    complete: e?.complete === true, description: e?.description || "Selected date range and filters were not saved with this export.",
  };
}

export function canonicalPath(value, origin) {
  try {
    const u = new URL(value, origin);
    if (u.origin !== origin || !["http:", "https:"].includes(u.protocol)) return null;
    return u.pathname.replace(/\.html$/, "").replace(/\/$/, "") || "/";
  } catch { return null; }
}

export function gscPages(root, file, origin) {
  const [header, ...rows] = parseCsv(readFileSync(root + "docs/seo-baselines/" + file, "utf8"));
  if (!header) throw new Error(file + ": empty export");
  const at = (...names) => header.findIndex((h) => names.includes(h.trim().toLowerCase()));
  const [u, c, i, p] = [at("top pages", "page", "url"), at("clicks"), at("impressions"), at("position")];
  if (u < 0 || c < 0 || i < 0) throw new Error(file + ": page, clicks and impressions columns required");
  const window = sourceWindow(root, file, origin);
  return rows.map((r) => {
    const clicks = numberOrNull(r[c]), impressions = numberOrNull(r[i]), rawPosition = numberOrNull(r[p]);
    if (clicks != null && impressions != null && clicks > impressions) throw new Error(file + ": clicks exceed impressions");
    return { url: canonicalPath(r[u], origin), source: "gsc-pages", sourceFile: file, property: origin, kind: "page",
      date: file.match(/\d{4}-\d{2}-\d{2}/)?.[0], status: clicks == null || impressions == null ? "unavailable" : "observed",
      clicks, impressions, ctr: impressions ? clicks / impressions : null, position: rawPosition > 0 ? rawPosition : null, window };
  }).filter((r) => r.url);
}

export function normalizeSnapshot(s) {
  if (!s) return null;
  const missing = s.status === "not-observed" || /no Bing rows/i.test(s.note || "");
  return { ...s, status: missing ? "not-observed" : s.status || (s.impressions == null || s.clicks == null ? "unavailable" : "observed"),
    clicks: missing ? null : s.clicks, impressions: missing ? null : s.impressions,
    impressions90: missing ? null : s.impressions90, clicks90: missing ? null : s.clicks90,
    impressionsPrior28: missing ? null : s.impressionsPrior28, clicksPrior28: missing ? null : s.clicksPrior28,
    position: s.position > 0 ? s.position : null };
}

/** Wilson 95% interval. Useful for sample uncertainty, not a causal SEO forecast. */
export function wilson(clicks, impressions) {
  if (!Number.isInteger(impressions) || impressions <= 0 || !Number.isInteger(clicks) || clicks < 0 || clicks > impressions) return null;
  const z2 = 1.96 ** 2, p = clicks / impressions, denom = 1 + z2 / impressions;
  const mid = (p + z2 / (2 * impressions)) / denom;
  const half = 1.96 * Math.sqrt((p * (1 - p) + z2 / (4 * impressions)) / impressions) / denom;
  return { low: Math.max(0, mid - half), high: Math.min(1, mid + half), level: 0.95 };
}

const stable = (v) => JSON.stringify(v, (k, x) => x && !Array.isArray(x) && typeof x === "object" ? Object.fromEntries(Object.entries(x).sort(([a], [b]) => a.localeCompare(b))) : x);
export function windowProblems(s, today) {
  const w = s?.window, reasons = [];
  if (s?.status !== "observed") reasons.push("page counts are not observed");
  if (!Number.isSafeInteger(s?.impressions) || !Number.isSafeInteger(s?.clicks) || s.impressions < 0 || s.clicks < 0 || s.clicks > s.impressions) reasons.push("invalid or missing count values");
  if (!w || !isoDay(w.start) || !isoDay(w.end) || w.start > w.end) reasons.push("exact measurement dates unknown or invalid");
  else {
    if (dayDiff(w.start, w.end) + 1 < POLICY.minDays) reasons.push("window shorter than 28 days");
    if (today && (w.end > today || dayDiff(w.end, today) > POLICY.maxAgeDays)) reasons.push("window is future-dated or stale");
  }
  if (w?.complete !== true) reasons.push("window coverage not confirmed");
  if (!w?.searchType || !Array.isArray(w?.dimensions) || !w.dimensions.length || !w.filters || typeof w.filters !== "object") reasons.push("search type, dimensions or filters unknown");
  if (!s?.property) reasons.push("property unknown");
  return reasons;
}

export function compareWindows(a, b, today) {
  a = normalizeSnapshot(a); b = normalizeSnapshot(b);
  const reasons = [...windowProblems(a, null), ...windowProblems(b, today)];
  if (!a || !b) return { comparable: false, reasons: ["two observed page windows required"] };
  if (a.source !== b.source || a.kind !== b.kind || a.property !== b.property || (a.url || a.slug) !== (b.url || b.slug)) reasons.push("source, property, page or aggregation differs");
  if (a.window && b.window) {
    if (a.window.end >= b.window.start) reasons.push("measurement windows overlap or are reversed");
    if (dayDiff(a.window.start, a.window.end) !== dayDiff(b.window.start, b.window.end)) reasons.push("window durations differ");
    if (stable([a.window.searchType, a.window.dimensions, a.window.filters]) !== stable([b.window.searchType, b.window.dimensions, b.window.filters])) reasons.push("search filters or dimensions differ");
  }
  return { comparable: reasons.length === 0, reasons: [...new Set(reasons)] };
}

export function recentExperiment(experiments, url, site, today) {
  return (experiments || []).filter((e) => e.page === url && (e.site || "pmh") === site && isoDay(e.date) && dayDiff(e.date, today) >= 0 && dayDiff(e.date, today) < (e.cooldownDays || POLICY.cooldownDays)).at(-1) || null;
}

export function assessSearch(history, { today, published, url, site, experiments = [] } = {}) {
  const rows = (history || []).filter((s) => s.kind === "page").map(normalizeSnapshot).sort((a, b) => String(a.date).localeCompare(String(b.date)));
  const latestBySource = [...new Set(rows.map((r) => r.source))].map((src) => rows.filter((r) => r.source === src).at(-1));
  const observed = latestBySource.filter((s) => s.status === "observed");
  const latest = observed.filter((s) => /^gsc-pages/.test(s.source)).at(-1) || observed.at(-1);
  const active = recentExperiment(experiments, url, site, today);
  const flags = [], reasons = [];
  if (active) { flags.push("EXPERIMENT-RUNNING"); reasons.push("snippet changed " + active.date + "; collect a separate post-change window"); }
  if (!latest) return { flags: [...flags, "DATA-UNAVAILABLE"], reasons: [...reasons, "No observed page-level search data; missing rows are not zero."], latest: null, interval: null };
  const interval = wilson(latest.clicks, latest.impressions);
  if (latest.impressions < POLICY.minImpressions) flags.push("LOW-SAMPLE");
  const problems = windowProblems(latest, today);
  if (problems.length) { flags.push("MEASUREMENT-INCOMPLETE"); reasons.push(...problems); }
  if (!problems.length && !active) {
    // Configured review threshold, not an expected CTR curve or proof of a bad title.
    if (latest.impressions >= POLICY.minImpressions && latest.position != null && latest.position <= 15 && interval?.high < POLICY.snippetReviewCtr) flags.push("SNIPPET-REVIEW");
    const previous = rows.filter((s) => s.source === latest.source && s !== latest).at(-1);
    const comparable = compareWindows(previous, latest, today);
    if (comparable.comparable && previous.impressions >= POLICY.minTrendImpressions) {
      const z = (latest.impressions - previous.impressions) / Math.sqrt(latest.impressions + previous.impressions || 1);
      if (latest.impressions < 0.6 * previous.impressions && z < -1.96) flags.push("DECAY-REVIEW");
      if (latest.impressions > 1.5 * previous.impressions && z > 1.96) flags.push("GROWTH-OBSERVED");
      if (published && dayDiff(published, today) >= 56 && previous.impressions < POLICY.minImpressions && latest.impressions < POLICY.minImpressions) flags.push("LOW-VISIBILITY-REVIEW");
    } else reasons.push(...comparable.reasons);
  }
  return { flags, reasons: [...new Set(reasons)], latest, interval };
}

export function eligibleLesson(lesson, experiments, today = operatingDate()) {
  if (lesson.status !== "active") return false;
  if (lesson.type === "operational") return Boolean(lesson.evidence);
  if (lesson.type !== "performance" || !lesson.scope || !isoDay(lesson.expires) || lesson.expires < today) return false;
  const ids = new Set(lesson.experimentIds || []);
  return [...ids].filter((id) => experiments.some((e) => e.id === id && e.scope === lesson.scope && e.status === "reviewed" && e.outcome === "supported" && e.reviewedBy && e.comparison?.comparable === true)).length >= 2;
}
