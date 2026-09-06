import { assessOutcomes } from "../blog-outcomes.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { parseCsv, numberOrNull, gscPages, canonicalPath, wilson, assessSearch, compareWindows, eligibleLesson, normalizeSnapshot } from "../search-evidence.mjs";
import { ROOT, contentRegion, contextualLinks, bingDate, windowize } from "../blog-lib.mjs";
import { scorePost } from "../score-post.mjs";
import { calculate, externalSources, validatePack } from "../article-evidence.mjs";
import { articleRuntime, journeyHtml, wireJourney } from "../blog-journey.mjs";

const today = "2026-09-05", property = "https://pensacolamilitaryhousing.com";
const before = { source: "gsc-pages", kind: "page", property, url: "/blog/example", date: "2026-08-01", status: "observed", clicks: 30, impressions: 1000, position: 5,
  window: { start: "2026-07-01", end: "2026-07-28", searchType: "web", dimensions: ["page"], filters: {}, complete: true } };
const after = { ...before, date: today, clicks: 40, impressions: 1500, window: { ...before.window, start: "2026-08-01", end: "2026-08-28" } };
const options = { today, site: "pmh", url: "/blog/example", published: "2026-01-01" };

test("quoted CSV cells preserve commas, newlines, empty cells and escaped quotes", () => {
  assert.deepEqual(parseCsv('\uFEFFquery,clicks,notes\r\n"why, here?",0,"first\n""second"""\r\nlast,1,\r\n'), [["query", "clicks", "notes"], ["why, here?", "0", 'first\n"second"'], ["last", "1", ""]]);
  assert.throws(() => parseCsv('a,b\n"unfinished'));
  assert.equal(numberOrNull(""), null); assert.equal(numberOrNull("-"), null); assert.equal(numberOrNull("0"), 0);
});
test("query strings and .html variants canonicalize without crossing properties", () => {
  assert.equal(canonicalPath(property + "/blog/example.html?email=private", property), "/blog/example");
  assert.equal(canonicalPath("https://elsewhere.example/blog/example", property), null);
});
test("export date cannot silently become a measured monthly window", () => {
  const rows = gscPages(ROOT, "gsc-pages-2026-09-04.csv", property);
  const r = rows.find((x) => x.url === "/bah-rates");
  assert.equal(r.impressions, 9117); assert.equal(r.ctr, 48 / 9117);
  assert.equal(r.window.start, null); assert.equal(r.window.complete, false);
  assert.ok(assessSearch([r], options).flags.includes("MEASUREMENT-INCOMPLETE"));
});
test("missing data never classifies an old post as stalled or decayed", () => {
  assert.deepEqual(assessSearch([], options).flags, ["DATA-UNAVAILABLE"]);
  const oldZero = { ...before, source: "bing-api", clicks: 0, impressions: 0, note: "no Bing rows for this URL" };
  assert.equal(normalizeSnapshot(oldZero).impressions, null);
  assert.deepEqual(assessSearch([oldZero], options).flags, ["DATA-UNAVAILABLE"]);
});
test("a missing current export row does not revive an older observation", () => {
  const missing = { ...after, status: "not-observed", clicks: null, impressions: null };
  assert.ok(assessSearch([before, missing], options).flags.includes("DATA-UNAVAILABLE"));
});
test("0 clicks in 41 or 53 impressions is too uncertain for a snippet verdict", () => {
  for (const n of [41, 53]) {
    const r = assessSearch([{ ...after, clicks: 0, impressions: n, position: 4.4 }], options);
    assert.ok(r.flags.includes("LOW-SAMPLE"));
    assert.ok(!r.flags.includes("SNIPPET-REVIEW"));
    assert.ok(r.interval.high > 0.06);
  }
});
test("Wilson intervals distinguish real zero clicks from unavailable observations", () => {
  assert.equal(wilson(null, 10), null); assert.equal(wilson(1, 0), null);
  assert.ok(wilson(0, 53).high > 0.067 && wilson(0, 53).high < 0.068);
  const ci = wilson(48, 9117); assert.ok(ci.low < 48 / 9117 && ci.high > 48 / 9117);
});
test("incompatible, overlapping and stale windows cannot create a trend", () => {
  assert.equal(compareWindows(before, after, today).comparable, true);
  for (const b of [
    { ...after, source: "bing-api" }, { ...after, property: "https://greggcostin.com" },
    { ...after, window: { ...after.window, start: "2026-07-15", end: "2026-08-11" } },
    { ...after, window: { ...after.window, start: "2026-08-02" } },
    { ...after, window: { ...after.window, filters: { device: "mobile" } } },
    { ...after, window: { ...after.window, complete: false } },
    { ...after, window: null },
  ]) assert.equal(compareWindows(before, b, today).comparable, false);
  assert.equal(compareWindows(before, after, "2026-12-01").comparable, false);
});
test("valid large changes are observable while small-source noise remains unclassified", () => {
  assert.ok(assessSearch([before, { ...after, impressions: 2000 }], options).flags.includes("GROWTH-OBSERVED"));
  assert.ok(assessSearch([before, { ...after, clicks: 1, impressions: 200 }], options).flags.includes("DECAY-REVIEW"));
  assert.ok(!assessSearch([{ ...before, clicks: 0, impressions: 2 }, { ...after, clicks: 0, impressions: 8 }], options).flags.includes("GROWTH-OBSERVED"));
});
test("the Sep 4 snippet changes are not eligible for an immediate second rewrite", () => {
  const r = assessSearch([{ ...after, clicks: 0, impressions: 10000 }], { ...options, experiments: [{ site: "pmh", page: "/blog/example", date: "2026-09-04" }] });
  assert.ok(r.flags.includes("EXPERIMENT-RUNNING")); assert.ok(!r.flags.includes("SNIPPET-REVIEW"));
});
test("performance lessons cannot be promoted by an active label or one experiment", () => {
  assert.equal(eligibleLesson({ status: "active", rule: "numbers cause clicks", evidence: "one page" }, []), false);
  const l = { status: "active", type: "performance", scope: "local-buyers", expires: "2026-12-01", experimentIds: ["a", "b"] };
  const e = { id: "a", status: "reviewed", outcome: "supported", reviewedBy: "independent-reviewer", comparison: { comparable: true } };
  assert.equal(eligibleLesson(l, [e]), false);
});
test("source-like words without source links earn no evidence points", () => {
  const body = "<h2>Sources</h2><p>County data reported 12 homes in Pensacola in 2026. The department survey says 25 in Navarre in 2026. The bureau study estimated 30 in Milton in 2026.</p>";
  const s = scorePost({ title: "Pensacola housing", h1: "Pensacola housing", slug: "example", targetKeywords: ["Pensacola housing"], datePublished: "2026-01-01" }, body, "pmh");
  assert.equal(s.components.evidence, 0);
  assert.deepEqual(externalSources(body), []);
  assert.equal(externalSources('<a href="https://county.example/report">Report</a><a href="https://county.example/report">Again</a>').length, 1);
});
test("the link graph excludes nav, footer, index furniture and script strings", () => {
  const h = '<nav><a href="/blog/nav">N</a></nav><main><p><a href="/blog/relevant">A</a><a href="' + property + '/blog/relevant.html">Again</a></p><!-- EXPLORE_V2 --><a href="/blog/global">G</a><!-- /EXPLORE_V2 --><script>var a=\'<a href="/blog/script">x</a>\'</script></main><footer><a href="/blog/footer">F</a></footer>';
  assert.deepEqual(contextualLinks(h, property), ["/blog/relevant"]);
  assert.ok(!contentRegion(h).includes("/blog/global"));
});
test("calculation checks reject arithmetic errors, division by zero and code evaluation", () => {
  assert.equal(calculate({ operation: "sum", inputs: [5.359, 8.0445] }), 13.4035);
  assert.throws(() => calculate({ operation: "quotient", inputs: [10, 0] }));
  assert.throws(() => calculate({ operation: "eval", inputs: [2] }));
});
const pack = () => ({ schemaVersion: 2, article: { slug: "example", site: "pmh" }, models: { research: "recorded-research-model", write: "recorded-writing-model" }, uncertainFacts: [], readerTask: "Compare a property cost", originalValue: "A reproducible calculation", claims: [{ id: "tax", claim: "The components sum to 13.4035.", kind: "calculation", status: "verified", sourceUrl: "https://county.example/report", accessed: today, asOf: "2025 certified", locator: "Table 1", loadBearing: true, independentCheck: { reviewer: "second-reviewer", date: today, finding: "Components checked" }, calculation: { operation: "sum", inputs: [5.359, 8.0445], result: 13.4035, units: "mills", inputSources: ["Table 1"] } }] });
const body = '<p data-claim="tax">Components sum to 13.4035. <a href="https://county.example/report">Source</a></p>';
test("a pack records lineage and refuses uncertainty, false math and absent citations", () => {
  const opt = { slug: "example", site: "pmh", today, body };
  assert.equal(validatePack(pack(), opt).errors.length, 0);
  let p = pack(); p.claims[0].calculation.result = 19.008;
  assert.ok(validatePack(p, opt).errors.some((e) => e.includes("arithmetic")));
  p = pack(); p.claims[0].status = "uncertain";
  assert.ok(validatePack(p, opt).errors.some((e) => e.includes("uncertain")));
  assert.ok(validatePack(pack(), { ...opt, body: '<p data-claim="tax">13.4035</p>' }).errors.some((e) => e.includes("source link")));
});
test("the inquiry event is inserted only in the confirmed-success branch and is idempotent", () => {
  const spec = { slug: "example", h1: "Useful guide" };
  const html = '<html><head></head><body><script>if(res.ok&&res.j.success){done();}else{error();}</script></body></html>';
  const rendered = wireJourney(html, spec, "pmh");
  assert.ok(rendered.includes("if(res.ok&&res.j.success){document.dispatchEvent"));
  assert.equal(wireJourney(rendered, spec, "pmh"), rendered);
  assert.ok(!rendered.includes("ga_client_id"));
});
function browser({ privacy = false, shareError = false, hidden = false } = {}) {
  const events = [], handlers = {}, controls = {};
  for (const key of ["[data-blog-share]", "[data-blog-copy]", "[data-blog-share-status]"]) controls[key] = { hidden: true, textContent: "", addEventListener: (name, fn) => { controls[key][name] = fn; } };
  const panel = { querySelector: (s) => controls[s] };
  const document = { visibilityState: hidden ? "hidden" : "visible", querySelector: (s) => s === "main" ? { getBoundingClientRect: () => ({ top: -500, height: 1500 }) } : panel, addEventListener: (n, f) => { handlers[n] = f; } };
  const navigator = { globalPrivacyControl: privacy, share: async () => { if (shareError) throw { name: "AbortError" }; }, clipboard: { writeText: async (url) => { handlers.copied = url; } } };
  const window = { innerHeight: 700, gtag: (...a) => events.push(a), setInterval: (fn) => { handlers.tick = fn; return 1; }, clearInterval: () => {}, addEventListener: () => {} };
  runInNewContext("(" + articleRuntime.toString() + ")(config)", { window, document, navigator, config: { slug: "example", site: "pmh", goal: "budget", url: property + "/blog/example", title: "Guide" } });
  return { events, handlers, controls };
}
test("copy is not a share and canceled native sharing sends no share event", async () => {
  const b = browser({ shareError: true });
  await b.controls["[data-blog-share]"].click();
  assert.equal(b.events.length, 0);
  await b.controls["[data-blog-copy]"].click();
  assert.equal(b.handlers.copied, property + "/blog/example");
  assert.equal(b.events[0][1], "blog_link_copy");
});
test("successful inquiry is counted once; no click or form contents are accepted as a lead", () => {
  const b = browser();
  assert.equal(b.events.length, 0);
  b.handlers["costin:lead-success"](); b.handlers["costin:lead-success"]();
  assert.equal(b.events.length, 1); assert.equal(b.events[0][1], "blog_inquiry_success");
  assert.deepEqual(Object.keys(b.events[0][2]).sort(), ["article_goal", "article_site", "content_id", "content_type", "method"]);
});
test("privacy signals suppress analytics and hidden tabs cannot earn read engagement", () => {
  const a = browser({ privacy: true }); a.handlers["costin:lead-success"](); assert.equal(a.events.length, 0);
  const b = browser({ hidden: true }); for (let i = 0; i < 12; i++) b.handlers.tick(); assert.equal(b.events.length, 0);
  const c = browser(); for (let i = 0; i < 6; i++) c.handlers.tick(); assert.equal(c.events[0][1], "blog_read");
});
test("every existing article gets verified first-party next steps with clean share URLs", () => {
  for (const [site, dir] of [["pmh", "content/blog"], ["gc", "content/civilian-blog"]]) {
    const spec = { slug: site === "pmh" ? "bah-2026-pensacola-what-can-you-afford" : "closing-costs-florida-buyers" };
    const h = journeyHtml(spec, site, ROOT);
    assert.ok(h.includes("data-blog-next")); assert.ok(h.includes("General Question"));
  }
});

test("outcome learning distinguishes missing clients, unique sessions and non-comparable windows", () => {
  assert.equal(assessOutcomes({ windows: [] }, today).status, "unavailable");
  const row = { ...after, site: "pmh", slug: "example", source: "ga4", sourceReference: "reviewed-export.csv", attribution: "landing-page-session", landingSessions: 100, sessionsWithAcceptedInquiry: 2 };
  const bad = assessOutcomes({ windows: [{ ...row, sessionsWithAcceptedInquiry: 101 }] }, today);
  assert.equal(bad.status, "unavailable"); assert.equal(bad.errors.length, 1);
  const current = assessOutcomes({ windows: [row] }, today);
  assert.equal(current.comparisons[0].comparable, false);
  assert.equal(current.comparisons[0].current.rate, 0.02);
  const prior = { ...row, window: before.window };
  assert.match(assessOutcomes({ windows: [prior, row] }, today).comparisons[0].reading, /sample too small/);
});

test("Bing ISO dates and epoch dates share one anchor; empty and future rows do not create traffic", () => {
  assert.equal(bingDate("2026-08-28"), "2026-08-28");
  assert.equal(bingDate("/Date(1787875200000)/"), "2026-08-28");
  assert.equal(bingDate("invalid"), null);
  assert.equal(windowize([], "Query").asOf, null);
  const r = windowize([{ Query: "/a", Date: "2026-08-27", Impressions: 5, Clicks: 1 }, { Query: "/a", Date: "2026-09-10", Impressions: 100, Clicks: 1 }], "Query", "2026-08-28");
  assert.equal(r.rows[0].imp28, 5);
});
test("a claimed observed snapshot with invalid counts cannot support a decision", () => {
  const r = assessSearch([{ ...after, impressions: -10 }], options);
  assert.ok(r.flags.includes("MEASUREMENT-INCOMPLETE"));
  assert.ok(!r.flags.includes("DECAY-REVIEW"));
});
