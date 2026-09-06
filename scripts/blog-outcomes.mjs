// Optional, aggregate-only outcome exports. Event counts are not unique sessions.
import { compareWindows, wilson } from "./search-evidence.mjs";
export function assessOutcomes(input, today) {
  const rows = input?.windows || [], observations = [], errors = [];
  for (const r of rows) {
    const n = r.landingSessions, k = r.sessionsWithAcceptedInquiry;
    const keys = Object.keys(r);
    if (keys.some((x) => /email|phone|clientName|personId|contactId/i.test(x))) { errors.push("Personal/contact fields are not permitted in the outcome export"); continue; }
    if (!r.site || !r.slug || !r.source || !r.property || !r.sourceReference || r.attribution !== "landing-page-session" ||
      !Number.isInteger(n) || n < 0 || !Number.isInteger(k) || k < 0 || k > n) {
      errors.push((r.slug || "unknown article") + ": require a sourced cohort of landing sessions and sessions with an accepted inquiry, not raw event counts");
      continue;
    }
    observations.push({ ...r, kind: "page", url: "/blog/" + r.slug, status: "observed", impressions: n, clicks: k, rate: n ? k / n : null, interval: wilson(k, n) });
  }
  const comparisons = [];
  for (const id of new Set(observations.map((r) => r.site + ":" + r.slug))) {
    const list = observations.filter((r) => r.site + ":" + r.slug === id).sort((a, b) => String(a.window?.end).localeCompare(String(b.window?.end)));
    const latest = list.at(-1), previous = list.at(-2), c = compareWindows(previous, latest, today);
    let reading = "collect comparable windows";
    if (c.comparable) {
      if (Math.min(previous.landingSessions, latest.landingSessions) < 200) reading = "sample too small for an outcome conclusion";
      else if (latest.interval.low > previous.interval.high) reading = "higher observed inquiry rate; investigate confounds before attributing causality";
      else if (latest.interval.high < previous.interval.low) reading = "lower observed inquiry rate; inspect the reader path and acquisition mix";
      else reading = "uncertainty intervals overlap; no clear rate change";
    }
    comparisons.push({ article: id, current: latest, previous: previous || null, ...c, reading });
  }
  return { status: observations.length ? "aggregate-exports-loaded" : "unavailable", comparisons, errors,
    note: "No client count, revenue or conversion lift is inferred from clicks. Cross-domain assisted journeys and qualified clients require separately matched analytics/CRM evidence. Do not double-count legacy inquiry_submit and blog_inquiry_success." };
}
