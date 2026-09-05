# The blog engine loop (both sites), Sep 2026

One machine, two audiences. The military engine (`blog-engine`, Tue) and the civilian engine
(`civilian-blog-engine`, Mon + Thu) share one lessons file, one measurement pipe, one scorer, one
retro. This page is the map; the skills are the law.

```
LEARN ─▶ MEASURE ─▶ DECIDE ─▶ RESEARCH ─▶ WRITE ─▶ SCORE ─▶ BUILD ─▶ STAGE ─▶ RETRO ─┐
  ▲      Bing API    refresh    sourced     contract  80+ gate  factory   draft     lessons │
  │      + exports   queue +    landscape   + lessons + format  + audits  branch    + refresh│
  └──────────────────radar──────────────────────────────────────────────────────────queue───┘
```

## The scripts

| Script | Does | Writes |
|---|---|---|
| `scripts/blog-lib.mjs` | shared definitions: sites, ledgers, fragments, Bing client, text metrics, coverage index, inbound links | (library) |
| `scripts/blog-measure.mjs [--site pmh|gc]` | Bing Webmaster API live (page + query stats, 28/prior-28/90-day windows) plus any GSC/Bing exports in `docs/seo-baselines/`; per-post `search[]` snapshots | ledger `search[]`, `content/measure/latest-<site>.json`, `opportunities-<site>.json`, monthly `docs/seo-baselines/bing-api-*.csv` |
| `scripts/score-post.mjs <slug> --site x [--gate]` | 0-100 quality score: structure 25, evidence 20, local 10, SEO 20, GEO 15, shareability 10; prints the fix list | (stdout / `--json`) |
| `scripts/topic-miner.mjs [--append-queue N]` | real demand: Google + Bing autosuggest fan-out of `content/topic-seeds.json`, Bing related keywords, the sites' own query logs; novelty vs every live title/H1/H2 | `docs/topic-radar.md`, `content/topic-candidates.json`, queue items with evidence |
| `scripts/blog-retro.mjs [--apply-links N]` | flags every post (DECAYED, EXPIRED, CTR-PROBLEM, STALLED, STALE-CUES, ORPHAN, LOW-SCORE), ranks refreshes, plans inbound links, proposes lessons only when n supports it | `content/blog/refresh-queue.json`, `inbound-link-plan.json`, `retro-latest.md` |
| `scripts/blog-dedup-check.mjs` | cannibalization gate before any new post (L003/L011) | (stdout) |
| `scripts/ctr-opportunities.mjs [--json]` | UNDERCLICKED pages from the newest GSC Pages export: on page one, converting under the position benchmark, lost clicks per month, current title and description inline (L014) | `content/measure/ctr-pmh.json`, proposals in `docs/ctr-proposals-<YYYY-MM>.md` |
| `scripts/analyze-formatting.mjs` | scannability score per page, both sites (90+ before staging, L004) | `docs/formatting-audit.md` |
| `scripts/submit-indexnow.mjs [--site gc] [--urls a,b]` | IndexNow + Bing URL Submission API for either site | (network) |
| `scripts/blog-factory.mjs`, `scripts/civilian-blog-factory.mjs [slug] [--out DIR]` | fragment to page; hard gates; `--out` builds a preview without touching the site tree (civilian) | site pages, index, sitemap, llms, OG cards |

## What "self-improving" means here, concretely

1. **Every run measures before it writes.** Bing page-level data is free and live for both
   domains; GSC exports drop in by file name. Clarity covers the military site only (the
   civilian domain needs its own Clarity project).
2. **Refreshes outrank new posts when the data says so.** `refresh-queue.json` ranks by
   priority: DECAYED 100, EXPIRED perishable 90, CTR-PROBLEM 80, STALLED 60, STALE-CUES 40,
   ORPHAN 40, LOW-SCORE 30+. A 60+ entry is the run's work item. Declared `perishables`
   (`[{claim, expires, source}]`) make freshness deterministic: the day a deadline passes,
   the post is flagged.
3. **Topics come from demand, not guesses.** The radar scores demand x intent x local x
   novelty, clusters queries into topics, and hands the writer the question skeleton (the
   H2/FAQ plan). Queue items carry an `evidence` field; the dedup gate stops cannibalization.
4. **Quality is scored, not felt.** `score-post.mjs` gates new posts at 80. It rewards exactly
   what ranks and gets cited in 2026: question-shaped H2s answered in the first sentence,
   figures with a named source and a vintage in the same sentence, Gulf Coast specificity, a
   dated quick answer, key takeaways, a table, a checklist, a worked example, and something
   only this team can say. Scores are recorded so the retro can correlate them with results.
5. **Lessons are rules with evidence.** `content/blog/learnings.json` is read at STEP 0 and
   appended at the end of every run, both engines. The retro proposes attribute lessons only
   when at least six mature posts exist with three on each side of an attribute; until then it
   says "insufficient data" instead of inventing a pattern.
6. **Clicks before content.** The first GSC export (Sep 4 2026) showed about 20,000
   impressions a month converting at 0.7%, with `/bah-rates` alone leaving about 182 clicks a
   month below benchmark. A CTR-PROBLEM from either source (Bing flag, or 5+ lost clicks in
   `ctr-pmh.json`) sits at priority 80 and outranks a new post. Titles carry one concrete figure
   the page states; the assumable-VA page converts 25.9% with "2.75%" in its title.
7. **No orphans.** Every new post gets inbound links from the hub pages the plan names
   (military hubs via the `RELATED_GUIDES` block, civilian hubs by a sentence-level link).

## Thresholds worth knowing
- Factory hard gates: no em dashes; 1,100+ words; 4+ (gc) / 6+ (pmh) links; 4+ FAQs; no
  paragraph over 110 words; figure on disk; for posts dated 2026-09-07+ (gc) or modified
  2026-09-04+ (pmh): quickAnswer 2-4 sentences under 85 words with a figure; gc also
  targetKeywords + takeaways.
- Engine gates: score-post 80+, analyze-formatting 90+, audit-civilian / audit-military 0
  findings, dedup gate clean.
- Retro: NEW = under 42 days (Bing indexing lag), half-weighted. STALLED = 56+ days with under
  5 Bing impressions in 90 days. DECAYED = 28-day impressions under 60% of the prior 28 with
  10+ before. CTR-PROBLEM = position 6 or better, 8+ impressions, 0 clicks.

## What only Gregg can do
- Clarity for greggcostin.com is live (project `ydd39cyp64`, tagged Sep 4 2026 via
  `scripts/rollout-clarity-civilian.mjs`). It sits under the Microsoft sign-in; the military
  project `wm7ddbciup` sits under another Clarity identity. To see both in one login and
  through the MCP connector, invite the other identity as a team member on the new project
  (Clarity > Settings > Team), or re-authorize the connector for the account that should own both.
- Drop a GSC Pages export monthly: `docs/seo-baselines/gsc-pages-YYYY-MM-DD.csv` (military)
  and `gsc-pages-gc-YYYY-MM-DD.csv` (civilian). Google is 90%+ of real traffic; Bing is the
  free proxy the engine can pull itself.
- greggcostin.com indexing (checked Sep 4 2026): Bing has the sitemap since Aug 24 (116 URLs,
  no crawl issues, 100-URL/day submission quota, pushed daily by the engine). Google had last
  read the sitemap on Aug 24 when it held 6 URLs; resubmitted Sep 4 (121 discovered) and
  indexing requested for /, /buy, /blog and the insurance guide. Expect Google impressions to
  appear over the following weeks; the engine reports the count each run.
- Tune `content/topic-seeds.json` when a new place, base or money topic enters the strategy.
