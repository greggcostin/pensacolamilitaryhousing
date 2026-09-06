// The weekly handoff: one work item, evidence gaps, useful briefs, and bounded learning.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { ROOT, TODAY, SITES, readJson, writeJson, listFragments, loadLedger, inboundLinks } from "./blog-lib.mjs";
import { parseCsv, sourceWindow, numberOrNull, eligibleLesson, recentExperiment } from "./search-evidence.mjs";
import { externalSources } from "./article-evidence.mjs";
import { assessOutcomes } from "./blog-outcomes.mjs";
import { journeyFor } from "./blog-journey.mjs";

const files = readdirSync(ROOT + "docs/seo-baselines");
const experiments = readJson("content/measure/ctr-applied.json").applied || [];
const lessons = readJson("content/blog/learnings.json").lessons || [];
const queryEvidence = [];
for (const site of ["pmh", "gc"]) {
  for (const type of ["gsc-queries", "bing-keywords"]) {
    const prefix = type + (site === "gc" ? "-gc-" : "-");
    const file = files.filter((f) => f.startsWith(prefix) && /\d{4}-\d{2}-\d{2}\.csv$/.test(f) && (site === "gc" || !f.includes("-gc-"))).sort().at(-1);
    if (!file) continue;
    let parsed;
    try { parsed = parseCsv(readFileSync(ROOT + "docs/seo-baselines/" + file, "utf8")); } catch (e) { console.warn(file + ": unavailable: " + e.message); continue; }
    const [header, ...rows] = parsed;
    const q = header.findIndex((h) => /quer|keyword/i.test(h)), i = header.findIndex((h) => /impression/i.test(h));
    const c = header.findIndex((h) => /click/i.test(h)), p = header.findIndex((h) => /position/i.test(h));
    if (q < 0 || i < 0) continue;
    for (const r of rows) queryEvidence.push({ site, query: r[q], impressions: numberOrNull(r[i]), clicks: numberOrNull(r[c]), position: numberOrNull(r[p]), sourceFile: file, window: sourceWindow(ROOT, file, SITES[site].origin) });
  }
}
const briefs = readJson("content/blog/growth-briefs.json").briefs.map((b) => {
  const evidence = queryEvidence.filter((r) => r.site === b.site && b.queryContains.some((term) => r.query.toLowerCase().includes(term)));
  const groups = [...new Set(evidence.map((r) => r.sourceFile))].map((file) => ({ sourceFile: file, observedQueryImpressions: evidence.filter((r) => r.sourceFile === file).reduce((n, r) => n + (r.impressions || 0), 0), window: evidence.find((r) => r.sourceFile === file).window }));
  return { ...b, evidenceTier: evidence.length ? "observed-query-intent-unconfirmed" : "editorial-hypothesis", evidenceGroups: groups, evidence: evidence.sort((a, b) => b.impressions - a.impressions).slice(0, 12),
    note: "Query totals describe these exported rows, not a page's traffic or market search volume. Groups from different sources are never added together." };
});
const articles = [];
for (const site of ["pmh", "gc"]) {
  const links = inboundLinks(site);
  for (const f of listFragments(site)) {
    const sources = externalSources(f.body);
    articles.push({ site, slug: f.slug, url: f.url, linkedSourceDomains: new Set(sources.map((u) => new URL(u).hostname)).size, sourceUrls: sources,
      contextualInbound: links.get("/blog/" + f.slug) || 0, evidencePack: f.spec.editorial?.evidenceFile || null,
      readerTask: f.spec.editorial?.readerTask || null, nextStep: journeyFor(f.spec, site) });
  }
}
const refresh = existsSync(ROOT + "content/blog/refresh-queue.json") ? readJson("content/blog/refresh-queue.json").queue : [];
const sourceGap = articles.filter((a) => a.linkedSourceDomains === 0);
const urgent = refresh.find((r) => r.flags.includes("EXPIRED"));
const next = urgent ? { kind: "verify-expired-facts", site: urgent.site, target: urgent.url } :
  sourceGap.length ? { kind: "source-and-usefulness-refresh", site: sourceGap[0].site, target: sourceGap[0].url,
    readerTask: "Give the reader a reproducible, sourced cost or decision checklist.", reason: "Existing financial guide has no external source links. Research before rewriting; a score alone is not verification." } :
    { kind: "research-intent-gap", site: briefs.find((b) => b.evidence.length)?.site || "pmh", brief: briefs.find((b) => b.evidence.length)?.id || briefs[0]?.id };
const state = {
  schemaVersion: 2, generated: TODAY, mode: "reviewable-plan", maximumArticleChanges: 1,
  next, models: loadLedger("pmh").config.models, publication: { autoPublish: loadLedger("pmh").config.autoPublish, default: "stage branch, test, then report" },
  activeLessons: lessons.filter((l) => eligibleLesson(l, experiments)),
  excludedLessons: lessons.filter((l) => l.status === "active" && !eligibleLesson(l, experiments)).map((l) => ({ id: l.id, reason: "Unreviewed performance hypothesis or missing evidence metadata." })),
  experiments: experiments.map((e) => ({ id: e.id, page: e.page, outcome: e.outcome || "unknown", cooldown: !!recentExperiment([e], e.page, e.site || "pmh", TODAY), comparison: e.comparison })),
  sourceGaps: sourceGap.map((a) => ({ site: a.site, slug: a.slug })),
  outcomeStatus: assessOutcomes(readJson("content/measure/article-outcomes.json"), TODAY),
  articles, briefs,
  runChecklist: [
    "Read this plan and current source-availability records. Complete at most one article or substantive refresh.",
    "Resolve actual intent ownership against both sites; a token match is not proof of duplication or a content gap.",
    "Persist the configured research model's sourced pack and uncertain facts. Independently verify load-bearing claims before writing.",
    "The configured writer answers the reader task, provides a reusable checklist/table/calculation, and follows BLOG-CONTRACT.md. Never invent personal experience.",
    "New imagery follows the existing fetch, view, license and responsive-variant workflow.",
    "Factory evidence gate, score gate, formatting and site audits must pass. Keep article dates tied to substantive changes.",
    "Use the article journey's first-party tool, relevant companion guide and one inquiry path. Plan two relevant inbound links; exclude sitewide furniture.",
    "Record actual models, exceptions, sources, revisions, one hypothesis and deployment status. Do not self-promote performance rules.",
    "At 28+ days evaluate comparable page/query cohorts and accepted inquiry outcomes. If evidence is insufficient, keep collecting instead of rewriting again."
  ]
};
writeJson("content/blog/weekly-plan.json", state);
console.log(JSON.stringify({ next: state.next, sourceGaps: state.sourceGaps, experiments: state.experiments, articles: articles.length, briefs: briefs.map((b) => ({ id: b.id, evidence: b.evidenceTier, owner: b.owner })) }, null, 2));
