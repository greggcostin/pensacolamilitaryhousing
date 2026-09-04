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

const args = process.argv.slice(2);
const siteArg = args.includes("--site") ? args[args.indexOf("--site") + 1] : "both";
const APPLY = args.includes("--apply-links") ? +args[args.indexOf("--apply-links") + 1] : 0;
const siteKeys = siteArg === "both" ? ["pmh", "gc"] : [siteArg];
const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);
const PERISHABLE_CUE = /\b(rate|rates|median|average|inventory|premium|deadline|expires|effective|as of|this (week|month|year))\b/i;

const cov = coverageIndex();
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
    const search = (e.search || []).filter((s) => s.kind === "page");
    const last = search[search.length - 1] || null;
    const q = scorePost(f.spec, f.body, key);
    const inb = inbound.get(`/blog/${f.slug}`) || 0;
    const perish = f.spec.perishables || [];
    const expired = perish.filter((p) => p.expires && p.expires <= TODAY);
    const cues = (strip(f.body).match(PERISHABLE_CUE) || []).length;
    // pmh ledgers keep metrics[] snapshot objects; the gc ledger carries a metrics string, so guard the shape
    const clarity = (Array.isArray(e.metrics) ? e.metrics : []).filter((m) => m && typeof m === "object" && m.claritySessions != null).slice(-1)[0] || null;

    const flags = [];
    if (age != null && age < 42) flags.push("NEW");
    if (last) {
      if (last.impressionsPrior28 >= 10 && last.impressions < 0.6 * last.impressionsPrior28) flags.push("DECAYED");
      else if (last.impressions >= 4 && last.impressions >= 2 * Math.max(1, last.impressionsPrior28)) flags.push("WINNER");
      if (last.position != null && last.position <= 6 && last.impressions >= 8 && last.clicks === 0) flags.push("CTR-PROBLEM");
      if (age != null && age >= 56 && (last.impressions90 ?? last.impressions) < 5 && !flags.includes("NEW")) flags.push("STALLED");
    } else if (age != null && age >= 56) flags.push("STALLED");
    if (expired.length) flags.push("EXPIRED");
    if (sinceMod != null && sinceMod > 120 && cues >= 8) flags.push("STALE-CUES");
    if (inb < 3) flags.push("ORPHAN");
    if (q.score < 80) flags.push("LOW-SCORE");

    let priority = 0, why = [], actions = [];
    if (flags.includes("DECAYED")) { priority += 100; why.push(`impressions fell from ${last.impressionsPrior28} to ${last.impressions} (28d vs prior 28d)`); actions.push("re-verify every figure, add the newest data, a quick answer and 2+ new FAQs; bump dateModified only on real change"); }
    if (flags.includes("EXPIRED")) { priority += 90; why.push(`${expired.length} declared perishable(s) expired: ${expired.map((p) => `"${p.claim}" (${p.expires})`).join("; ")}`); actions.push("replace each expired claim with the current figure and its source, then update perishables[]"); }
    if (flags.includes("CTR-PROBLEM")) { priority += 80; why.push(`ranks ${last.position} with ${last.impressions} impressions and 0 clicks`); actions.push("rewrite title and description around the exact query (number, year, place); keep the slug"); }
    if (flags.includes("STALLED")) { priority += 60; why.push(`${age} days old, ${last ? `${last.impressions90 ?? last.impressions} Bing impressions in 90d` : "no search data"}`); actions.push("check demand in docs/topic-radar.md; if the query space is real, deepen (table, worked example, question H2s, inbound hub links); if not, merge into a stronger page"); }
    if (flags.includes("STALE-CUES")) { priority += 40; why.push(`last modified ${sinceMod} days ago with ${cues} perishable cues in the body`); actions.push("re-verify the dated figures against primary sources"); }
    if (flags.includes("ORPHAN")) { priority += 40; why.push(`${inb} inbound internal link(s)`); actions.push("add links from the hubs in inbound-link-plan.json"); }
    if (flags.includes("LOW-SCORE")) { priority += 30 + (80 - q.score); why.push(`quality score ${q.score}/100`); actions.push(...q.fails.slice(0, 4).map((x) => "fix: " + x)); }
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

    const row = { site: key, slug: f.slug, published, modified, ageDays: age, score: q.score, grade: q.grade, inbound: inb, bing: last ? { date: last.date, imp28: last.impressions, clk28: last.clicks, pos28: last.position, impPrior28: last.impressionsPrior28, imp90: last.impressions90 } : null, clarity: clarity ? { sessions: clarity.claritySessions, scroll: clarity.avgScroll, date: clarity.date } : null, perishables: perish.length, expired: expired.length, flags, priority, why, actions, facts: q.facts };
    rows.push(row); all.push(row);
    if (priority > 0 && !flags.every((x) => x === "NEW")) refresh.push({ site: key, slug: f.slug, url: `${site.origin}/blog/${f.slug}`, priority, flags, why, actions, score: q.score, inbound: inb });
  }

  rows.sort((a, b) => b.priority - a.priority);
  digest.push(`## ${site.name}`, "", `| Post | Age | Score | Inbound | Bing 28d imp/clk/pos | Flags | Priority |`, `|---|---|---|---|---|---|---|`,
    ...rows.map((r) => `| ${r.slug} | ${r.ageDays ?? "-"} | ${r.score} ${r.grade} | ${r.inbound} | ${r.bing ? `${r.bing.imp28}/${r.bing.clk28}/${r.bing.pos28 ?? "-"}` : "none"} | ${r.flags.join(" ") || "-"} | ${r.priority} |`), "");

  // site-level evidence from the opportunities file
  if (opp) {
    digest.push(`Site (Bing, data through ${opp.asOf}): ${opp.site28.imp} impressions / ${opp.site28.clk} clicks in 28d. Top pages by 28d impressions: ${opp.topPages.slice(0, 6).map((p) => `${p.page} (${p.imp28}, pos ${p.pos28 ?? "-"})`).join("; ")}.`, "");
    if (opp.strikingDistance.length) digest.push(`Striking-distance queries (pos 4-20, 90d): ${opp.strikingDistance.slice(0, 12).map((q) => `"${q.query}" (${q.imp90} imp, pos ${q.pos90})`).join("; ")}.`, "");
    if (opp.ctrProblems.length) digest.push(`CTR problems (top positions, zero clicks): ${opp.ctrProblems.slice(0, 8).map((q) => q.query ? `"${q.query}" (${q.imp28} imp, pos ${q.pos28})` : `${q.page} (${q.imp28} imp, pos ${q.pos28})`).join("; ")}.`, "");
    if (opp.declining.length) digest.push(`Declining pages: ${opp.declining.map((p) => `${p.page} (${p.impPrior28} -> ${p.imp28})`).join("; ")}.`, "");
    if (opp.uncoveredDemand.length) digest.push(`Uncovered demand (queries earning impressions with no matching target keyword): ${opp.uncoveredDemand.slice(0, 12).map((q) => `"${q.query}" (${q.imp90})`).join("; ")}.`, "");
  } else digest.push("No Bing opportunities file for this site yet (run blog-measure.mjs).", "");
}

// ---- lessons: attribute vs. performance, only where the sample supports it -------------------
const mature = all.filter((r) => r.ageDays != null && r.ageDays >= 42 && r.bing);
const proposed = [];
if (mature.length >= 6) {
  const attrs = { table: (r) => r.facts.table, quickAnswer: (r) => r.facts.quickAnswer, questionH2s: (r) => r.facts.h2s && r.facts.questionH2s / r.facts.h2s >= 0.6, ownVoice: (r) => r.facts.ownVoice, checklist: (r) => r.facts.checklist, wellLinked: (r) => r.inbound >= 3, longForm: (r) => r.facts.words >= 2500 };
  for (const [name, fn] of Object.entries(attrs)) {
    const yes = mature.filter(fn), no = mature.filter((r) => !fn(r));
    if (yes.length < 3 || no.length < 3) continue;
    const mean = (xs) => xs.reduce((a, r) => a + (r.bing.imp90 ?? r.bing.imp28 ?? 0), 0) / xs.length;
    const my = mean(yes), mn = mean(no);
    if (Math.max(my, mn) >= 5 && (my >= 2 * Math.max(0.5, mn) || mn >= 2 * Math.max(0.5, my))) proposed.push({ attribute: name, withMean: +my.toFixed(1), withoutMean: +mn.toFixed(1), n: [yes.length, no.length], reading: my > mn ? `posts with ${name} average ${my.toFixed(1)} Bing impressions/90d vs ${mn.toFixed(1)} without (n=${yes.length}/${no.length})` : `posts WITHOUT ${name} average ${mn.toFixed(1)} vs ${my.toFixed(1)} with (n=${no.length}/${yes.length}); check for confounds before acting` });
  }
}
digest.push("## Proposed lessons (evidence, not opinion)", "");
if (proposed.length) for (const p of proposed) digest.push(`- ${p.reading}`);
else digest.push(`- Insufficient data for attribute lessons: ${mature.length} post(s) are 42+ days old with Bing page data (need 6+, with 3+ on each side of an attribute). The loop is recording; it will speak when it can.`);
digest.push("", "## Refresh queue (both sites, ranked)", "", ...refresh.sort((a, b) => b.priority - a.priority).slice(0, 15).map((r) => `${r.priority}  ${r.site}:${r.slug}  [${r.flags.join(" ")}]  ${r.why.join("; ")}`), "");
digest.push("## Inbound link plan (posts with fewer than 3 inbound links)", "", ...linkPlan.map((p) => `- ${p.site}:${p.post} (${p.inbound} inbound) <- ${p.from.map((f) => `${f.hub} (${f.match})`).join(", ") || "no hub with enough overlap; link from the blog index and the nearest sibling post"}`), "");

refresh.sort((a, b) => b.priority - a.priority);
writeJson("content/blog/refresh-queue.json", { generated: TODAY, note: "Ranked refresh candidates for BOTH sites from scripts/blog-retro.mjs. DECIDE reads the top entry before taking a new topic. Flags: DECAYED (Bing impressions fell 40%+), EXPIRED (a declared perishable passed its date), CTR-PROBLEM (top-6 position, zero clicks), STALLED (8+ weeks, under 5 impressions in 90d), STALE-CUES (120+ days unmodified with many dated figures), ORPHAN (under 3 inbound links), LOW-SCORE (score-post under 80). NEW posts (under 42 days) are half-weighted because Bing indexing lags.", queue: refresh }, 1);
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
