// The learning step for BOTH blog engines: turns measurement into decisions and evidence.
// Runs at the end of every engine run (and any time by hand). Reads ledger search/metric
// snapshots (blog-measure.mjs), the quality score of every post (score-post.mjs), inbound
// internal links, declared perishables, and writes:
//   content/blog/refresh-queue.json      ranked refresh candidates for BOTH sites with reasons + actions
//   content/blog/inbound-link-plan.json  where each under-linked post should be linked from
//   content/blog/retro-latest.md         the evidence digest + proposed lessons (STEP 7 promotes
//                                        the ones that hold into learnings.json)
//
//   node scripts/blog-retro.mjs                 # both sites
//   node scripts/blog-retro.mjs --site gc       # one site
//   node scripts/blog-retro.mjs --apply-links 3 # insert up to 3 planned inbound links into
//                                               # military hub Related Guides blocks (pmh only)
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { ROOT, TODAY, SITES, loadLedger, ledgerPosts, listFragments, inboundLinks, coverageIndex, overlap, tokens, strip, readJson, writeJson } from "./blog-lib.mjs";
import { scorePost } from "./score-post.mjs";
import { assessSearch, normalizeSnapshot } from "./search-evidence.mjs";

const args = process.argv.slice(2);
const siteArg = args.includes("--site") ? args[args.indexOf("--site") + 1] : "both";
const APPLY = args.includes("--apply-links") ? +args[args.indexOf("--apply-links") + 1] : 0;
const siteKeys = siteArg === "both" ? ["pmh", "gc"] : [siteArg];
const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);
const PERISHABLE_CUE = /\b(rate|rates|median|average|inventory|premium|deadline|expires|effective|as of|this (week|month|year))\b/gi;

const cov = coverageIndex();
const experiments = readJson("content/measure/ctr-applied.json").applied || [];
const all = [];
const refresh = [];
const linkPlan = [];
const digest = [`# Blog retro, ${TODAY}`, ""];

for (const key of siteKeys) {
  const site = SITES[key];
  const ledger = loadLedger(key);
  const entries = new Map(ledgerPosts(ledger).map((p) => [p.slug, p.entry]));
  const inbound = inboundLinks(key);
  const opp = existsSync(`${ROOT}content/measure/opportunities-${key}.json`) ? readJson(`content/measure/opportunities-${key}.json`) : null;
  const rows = [];
  for (const f of listFragments(key)) {
    const e = entries.get(f.slug) || {};
    const published = f.spec.datePublished || e.datePublished;
    const modified = f.spec.dateModified || published;
    const age = published ? daysBetween(published, TODAY) : null;
    const sinceMod = modified ? daysBetween(modified, TODAY) : null;
    // Legacy snapshots are normalized before decisions. Two page-level sources: Bing (live API, 28d windows with a prior-28 trend) and Google Search
    // Console page exports. Unknown date ranges remain unknown; source shares are not assumed.
    const search = (e.search || []).filter((s) => s.kind === "page").map(normalizeSnapshot);
    const last = search.filter((s) => s.source === "bing-api").slice(-1)[0] || search[search.length - 1] || null;
    const gsc = search.filter((s) => /^gsc-pages/.test(s.source)).slice(-1)[0] || null;
    const q = scorePost(f.spec, f.body, key);
    const inb = inbound.get(`/blog/${f.slug}`) || 0;
    const perish = f.spec.perishables || [];
    const expired = perish.filter((p) => p.expires && p.expires <= TODAY);
    const cues = (strip(f.body).match(PERISHABLE_CUE) || []).length;
    // pmh ledgers keep metrics[] snapshot objects; the gc ledger carries a metrics string, so guard the shape
    const clarity = (Array.isArray(e.metrics) ? e.metrics : []).filter((m) => m && typeof m === "object" && m.claritySessions != null).slice(-1)[0] || null;

    const searchReview = assessSearch(search, { today: TODAY, published, url: `/blog/${f.slug}`, site: key, experiments });
    const flags = [...searchReview.flags];
    if (age != null && age < 42) flags.push("NEW");
    if (expired.length) flags.push("EXPIRED");
    if (sinceMod != null && sinceMod > 120 && cues >= 8) flags.push("STALE-CUES");
    if (inb === 0) flags.push("ORPHAN");
    else if (inb < 3) flags.push("UNDER-LINKED");
    if (q.score < 80) flags.push("LOW-SCORE");

    let priority = 0, why = [], actions = [];
    if (flags.includes("DECAY-REVIEW")) { priority += 50; why.push("comparable search windows show lower visibility; cause is unconfirmed"); actions.push("check indexing, query mix, seasonality and competitors before choosing a substantive refresh"); }
    if (flags.includes("EXPIRED")) { priority += 90; why.push(`${expired.length} declared perishable(s) passed their review date`); actions.push("verify primary sources; change the article date only if the content changes substantively"); }
    if (flags.includes("SNIPPET-REVIEW")) { priority += 30; why.push("sufficient sample below the configured CTR review threshold, without causal attribution"); actions.push("review page/query and device/country cohorts; register one snippet experiment with a comparable baseline"); }
    if (flags.includes("LOW-VISIBILITY-REVIEW")) { priority += 20; why.push("low observed visibility across two comparable windows"); actions.push("inspect index coverage and whether an existing page already answers the query"); }
    if (flags.includes("STALE-CUES")) { priority += 40; why.push(`last modified ${sinceMod} days ago with ${cues} perishable cues in the body`); actions.push("re-verify the dated figures against primary sources"); }
    if (flags.includes("ORPHAN") || flags.includes("UNDER-LINKED")) { priority += 25; why.push(`${inb} contextual inbound internal link(s)`); actions.push("add links from the hubs in inbound-link-plan.json"); }
    if (flags.includes("LOW-SCORE")) { priority += 10; why.push(`quality score ${q.score}/100`); actions.push(...q.fails.slice(0, 4).map((x) => "fix: " + x)); }
    if (flags.includes("NEW")) priority = Math.round(priority * 0.5);

    // inbound link plan for under-linked posts
    let plan = [];
    if (inb < 3) {
      const blob = `${f.spec.title} ${f.spec.h1} ${(f.spec.targetKeywords || []).join(" ")} ${f.spec.keywords || ""}`;
      plan = cov.filter((p) => p.site === key && !p.path.startsWith("/blog/") && !["/", "/blog", "/contact", "/privacy", "/accessibility", "/404", "/thanks", "/search"].includes(p.path))
        .map((p) => ({ path: p.path, score: +overlap(blob, `${p.title} ${p.h1} ${p.h2s.join(" ")} ${p.keywords}`).toFixed(2), title: p.h1 || p.title }))
        .filter((p) => p.score >= 0.25).sort((a, b) => b.score - a.score).slice(0, 4);
      linkPlan.push({ site: key, post: `/blog/${f.slug}`, label: f.spec.h1, inbound: inb, from: plan.map((p) => ({ hub: p.path, hubTitle: p.title, match: p.score, anchor: `<a href="/blog/${f.slug}">${f.spec.h1.replace(/"/g, "&quot;")}</a>` })) });
    }

    const row = { site: key, slug: f.slug, published, modified, ageDays: age, score: q.score, grade: q.grade, inbound: inb, bing: last && last.source === "bing-api" ? { date: last.date, imp28: last.impressions, clk28: last.clicks, pos28: last.position, impPrior28: last.impressionsPrior28, imp90: last.impressions90 } : null, gsc: gsc ? { date: gsc.date, impressions: gsc.impressions, clicks: gsc.clicks, position: gsc.position } : null, clarity: clarity ? { sessions: clarity.claritySessions, scroll: clarity.avgScroll, date: clarity.date } : null, perishables: perish.length, expired: expired.length, flags, priority, why, actions, facts: q.facts, measurement: searchReview };
    rows.push(row); all.push(row);
    if (priority > 0 && !flags.every((x) => x === "NEW")) refresh.push({ site: key, slug: f.slug, url: `${site.origin}/blog/${f.slug}`, priority, flags, why, actions, score: q.score, inbound: inb });
  }

  rows.sort((a, b) => b.priority - a.priority);
  digest.push(`## ${site.name}`, "", `| Post | Age | Score | Inbound | Google export imp/clk/pos | Bing 28d imp/clk/pos | Flags | Priority |`, `|---|---|---|---|---|---|---|---|`,
    ...rows.map((r) => `| ${r.slug} | ${r.ageDays ?? "-"} | ${r.score} ${r.grade} | ${r.inbound} | ${r.gsc ? `${r.gsc.impressions}/${r.gsc.clicks}/${r.gsc.position ?? "-"}` : "none"} | ${r.bing ? `${r.bing.imp28}/${r.bing.clk28}/${r.bing.pos28 ?? "-"}` : "none"} | ${r.flags.join(" ") || "-"} | ${r.priority} |`), "");

  // site-level evidence from the opportunities file
  if (opp) {
    digest.push(`Site (Bing, data through ${opp.asOf}): ${opp.site28.imp} impressions / ${opp.site28.clk} clicks in 28d. Top pages by 28d impressions: ${opp.topPages.slice(0, 6).map((p) => `${p.page} (${p.imp28}, pos ${p.pos28 ?? "-"})`).join("; ")}.`, "");
    if (opp.strikingDistance.length) digest.push(`Striking-distance queries (pos 4-20, 90d): ${opp.strikingDistance.slice(0, 12).map((q) => `"${q.query}" (${q.imp90} imp, pos ${q.pos90})`).join("; ")}.`, "");
    if (opp.ctrProblems.length) digest.push(`CTR problems (top positions, zero clicks): ${opp.ctrProblems.slice(0, 8).map((q) => q.query ? `"${q.query}" (${q.imp28} imp, pos ${q.pos28})` : `${q.page} (${q.imp28} imp, pos ${q.pos28})`).join("; ")}.`, "");
    if (opp.declining.length) digest.push(`Declining pages: ${opp.declining.map((p) => `${p.page} (${p.impPrior28} -> ${p.imp28})`).join("; ")}.`, "");
    if (opp.uncoveredDemand.length) digest.push(`Uncovered demand (queries earning impressions with no matching target keyword): ${opp.uncoveredDemand.slice(0, 12).map((q) => `"${q.query}" (${q.imp90})`).join("; ")}.`, "");
  } else digest.push("No Bing opportunities file for this site yet (run blog-measure.mjs).", "");
}

// Cross-sectional attributes are confounded by age, topic, site and exposure.
// Do not turn their means into rules, even with six posts. Experiments carry the evidence.
digest.push("## Learning status", "", "Attribute correlations are hypotheses only. A numeric quality score is a lint signal, not a ranking model. Performance rules require two reviewed, comparable experiments in the same scope; no automatic lesson promotion.", "");
digest.push("", "## Refresh queue (both sites, ranked)", "", ...refresh.sort((a, b) => b.priority - a.priority).slice(0, 15).map((r) => `${r.priority}  ${r.site}:${r.slug}  [${r.flags.join(" ")}]  ${r.why.join("; ")}`), "");
digest.push("## Inbound link plan (posts with fewer than 3 inbound links)", "", ...linkPlan.map((p) => `- ${p.site}:${p.post} (${p.inbound} inbound) <- ${p.from.map((f) => `${f.hub} (${f.match})`).join(", ") || "no hub with enough overlap; link from the blog index and the nearest sibling post"}`), "");

refresh.sort((a, b) => b.priority - a.priority);
writeJson("content/blog/refresh-queue.json", { generated: TODAY, note: "Evidence policy v2. Missing data and small samples never trigger a rewrite. Expired declared facts take priority; search reviews require valid comparable windows. Contextual links exclude navigation, footer and the global Explore grid. Quality scores flag editorial review, not ranking outcomes.", queue: refresh }, 1);
writeJson("content/blog/inbound-link-plan.json", { generated: TODAY, note: "Every post with fewer than 3 inbound internal links, with the hub pages whose titles/H2s overlap it most. Military hubs carry a RELATED_GUIDES block the retro can insert into (--apply-links N); civilian hubs need a sentence-level link placed by the engine.", plan: linkPlan }, 1);
writeFileSync(ROOT + "content/blog/retro-latest.md", digest.join("\n") + "\n");
console.log(digest.join("\n"));

// ---- optional: apply inbound links into military hub Related Guides blocks ------------------
if (APPLY) {
  let done = 0;
  const applied = [];
  for (const p of linkPlan.filter((p) => p.site === "pmh")) {
    for (const f of p.from) {
      if (done >= APPLY) break;
      const file = `${ROOT}public${f.hub === "/" ? "/index" : f.hub}.html`;
      if (!existsSync(file)) continue;
      let h = readFileSync(file, "utf8");
      if (h.includes(`href="${p.post}"`)) continue;
      const m = /(<!-- RELATED_GUIDES_START -->[\s\S]*?<div class="related">)([\s\S]*?)(<\/div>\s*<!-- RELATED_GUIDES_END -->)/.exec(h);
      if (!m) continue;
      h = h.replace(m[0], `${m[1]}${m[2]}${f.anchor}\n${m[3]}`);
      writeFileSync(file, h);
      applied.push(`${f.hub} -> ${p.post}`); done++;
    }
  }
  console.log(`\napplied ${applied.length} inbound link(s): ${applied.join("; ") || "none (no hub with a RELATED_GUIDES block matched)"}`);
}
