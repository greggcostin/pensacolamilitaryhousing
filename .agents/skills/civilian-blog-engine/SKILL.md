---
name: civilian-blog-engine
description: The twice-weekly (Mon + Thu 6:04am) civilian blog routine for greggcostin.com. It learns from the shared lessons file, measures every post through the Bing Webmaster API, decides refresh-vs-new from the refresh queue, the topic radar and the week's news, researches with cited sources, writes to the civilian blog contract, scores 80+ on the quality scorer, fetches and eye-tests a new image, builds through the factory and audit gates, stages a draft for approval (or auto-publishes if engine-config allows), then runs the retro so the next run starts smarter. Use on "/civilian-blog-engine", "run the civilian blog engine", or the scheduled run.
---

# Civilian Blog Engine (greggcostin.com/blog): learn > measure > decide > research > write > score > build > stage > retro

Repo: `C:\Users\gregg\pensacolamilitaryhousing`. Read `content/civilian-blog/BLOG-CONTRACT.md`
first, then `content/civilian-blog/EDITORIAL-PLAYBOOK.md` and `editorial-policy.json`.
Their version 2 evidence and human-voice rules apply to new posts AND substantive refreshes.
Sister routine: the military blog-engine (Tue). Never duplicate its
topics: this blog is CIVILIAN (rates, economy, finance, Florida + coastal Alabama
homeownership, taxes, insurance, market news, selling, rental underwriting, STR/vacation homes
and MTR/furnished rental operations). Define one reader and one decision. No BAH/PCS/VA framing. Work autonomously;
never ask questions mid-run. One run = one post or one refresh, never both.

## Files you own
- `content/civilian-blog/*.fragment.html`, `topic-queue.json`, `ledger.json`, `engine-config.json`
- `content/civilian-blog/research/*.json`, `reports/*`, `news-radar.json` when an event is actually verified
- `content/blog/learnings.json` (SHARED with the military engine: read first, append last)
- `content/blog/refresh-queue.json`, `inbound-link-plan.json`, `retro-latest.md` (written by
  `scripts/blog-retro.mjs`, both sites), `content/measure/*-gc.json` (by `blog-measure.mjs`)
- `docs/topic-radar.md` + `content/topic-candidates.json` (by `scripts/topic-miner.mjs`)
- `civilian-site/blog/`, `civilian-site/images/` (post imagery + variants), `civilian-site/og/`,
  `civilian-site/blog.html`, `sitemap.xml`, `llms.txt` (all factory-maintained)

## Evidence interpretation (read before historical lessons)
Read `content/civilian-blog/MEASUREMENT.md` and the committed shared evidence policy in `scripts/search-evidence.mjs`. Its source availability, comparable-window, privacy and no-fabrication requirements govern every measurement and learning decision. Historical correlations cannot override them. Editorial scores do not predict rankings.

## STEP 0 — LEARN (always first)
Read `content/blog/learnings.json`. Every `active` lesson whose `appliesTo` is not exclusively
military (BAH, base pages) is binding here too: research lessons go into the research brief,
write lessons into the writing brief, decide/measure lessons shape STEP 1-2. If a lesson
contradicts a measurement state or the evidence contract, preserve the verified evidence and record the conflict. Other valid lessons inform the work; inferred correlations are not binding rules.
Also `git status --short` and `git branch --no-merged main`: a parallel session may be working
this repo. Stay inside the files you own; never `git add -A`.

## STEP 1 — MEASURE (every run, even if publishing nothing)
1. `node scripts/blog-measure.mjs --site gc` pulls the Bing Webmaster API live (greggcostin.com
   is verified in the same account as the military site) and writes per-post `search[]`
   snapshots plus `content/measure/opportunities-gc.json`. Inspect each endpoint status and actual reporting dates. Missing page rows are unknown page performance, not zero and not proof of exclusion. Use Search Console/Bing inspection for indexing. Submit only new or materially changed deployed URLs, and record the submission; do not repeatedly submit every URL because performance rows are absent.
2. Clarity: greggcostin.com has its own project, `ydd39cyp64` (created Sep 4 2026, tag on all
   pages). It lives under Gregg's Microsoft sign-in while the military project `wm7ddbciup`
   lives under a different Clarity identity, so the Clarity MCP may only see one of them: try
   a per-URL query for `greggcostin.com`; verify the selected project, domain, dates and permissions. An empty response is not proof of the wrong identity. Record the observed result and any access limitation without inventing the cause.
3. `node scripts/analyze-formatting.mjs` (now covers civilian pages; rows read `gc:/...`).
4. Append one line per post to `ledger.json` posts[].metrics as before; the Bing snapshot lives
   in posts[].search.

## STEP 2 — DECIDE
Read, in this order, and pick ONE work item:
Run `node scripts/civilian-blog-plan.mjs` to produce `reports/plan-latest.json`.
Read the actual sources behind its decision; it is an editorial packet, not a demand forecast.
Refreshes use their existing canonical URL. Low editorial scores alone are not observed decline.
1. **Current-events override.** WebSearch this week's real-estate / rates / Florida insurance /
   coastal Alabama news. Something big (Fed decision, major insurance-market news, hurricane
   impact, a notable data release, a deadline inside 30 days) wins the run: write the
   reaction/explainer using the `current-events` templates in the queue. Two overrides in a
   row is fine when the news is real; three is a sign the queue needs re-ranking, not another
   override.
2. **Refresh queue.** `content/blog/refresh-queue.json` (run `node scripts/blog-retro.mjs --site
   gc` if it is older than 7 days). A gc entry with priority 60+ (DECLINE-REVIEW, EXPIRED perishable,
   CTR-REVIEW) outranks a new topic. A refresh re-verifies every figure, adds the
   quick answer + takeaways + a table if missing, fixes the scorer's fix list, and bumps
   dateModified only on real change.
3. **Topic radar.** `docs/topic-radar.md` (regenerate with `node scripts/topic-miner.mjs` when
   older than 30 days). Observed demand (a cluster with site impressions or Bing volume, novelty
   0.5+, audience civilian/both) outranks a guessed queue item; `--append-queue 3` adds the
   winners to the queue with evidence. Then take the top runnable queue item.
4. **Dedup gate (L003/L011):** before writing anything NEW, `node scripts/blog-dedup-check.mjs
   --site gc --kw "<primary keyword>" --kw "<secondary>"` (both sites and unpublished fragments).
   Run `node scripts/blog-dedup-check.mjs --site gc` over the whole queue at re-ranking. On INTENT-REVIEW,
   inspect the candidate pages and either refresh the intent owner or record the distinct reader task and comparison URLs in intentReview. Token overlap is not proof of harmful duplication. Run --strict for the selected new topic before writing. Log the decision and why.
Remove the chosen item only after the work is completed; retain held items with specific reasons.

## STEP 3 — RESEARCH (mandatory for anything with numbers)
WebSearch/WebFetch primary sources. Every perishable number (rates, medians, inventory,
premiums, deadlines) carries an in-text named source found THIS session, with a vintage. Build
the **search landscape** before writing: 10-15 useful questions with documented provenance (the radar
cluster's observed questions plus source wording, autosuggest and editorial hypotheses labeled as such), and one paragraph on what the
current top results MISS (the information-gain gap). Those questions become the H2s and FAQs.
Verify the five load-bearing figures against their primary source yourself (L001/L002). If
solid sourcing is not found, pivot the post to mechanics (no numbers) rather than fabricate.
Facts that overlap the military site's verified guides must agree with them.
Model policy: `engine-config.json → models` ({research, write}); default is in-session. If it
names "opus"/"fable", spawn those subagents as the military skill does, with the same retry.
Build `content/civilian-blog/research/<slug>.json` before prose using the playbook.
Keep the shared schemaVersion/article/models/uncertainFacts fields and PAGE.editorial fields from the playbook. Mark the actual claim paragraph, list item or table row with data-claim. Both evidence gates must pass.
Keep primary-source reading notes, exact claim passages, dates/scope, hypothetical assumptions,
five independent checks, question provenance and actual local applications. Read the applicable
subject-review row for finance, local reporting, taxes, insurance or STR/MTR operations.

## STEP 4 — WRITE to contract
`content/civilian-blog/<slug>.fragment.html` with the full PAGE header: title, description,
slug, h1, lead, keywords, `targetKeywords`, datePublished, figure, 6+ faqs, `quickAnswer`
(2-4 dated sentences, under 85 words, one figure), `takeaways` (3-5), `shareHook`,
`perishables` for every dated figure. Voice: plain-English expert, team voice. NO em dashes,
ever; no en dashes or emojis either. No invented stories, stock intros or forced town lists.
Question-shaped H2s with the answer in the first sentence; one table; one checklist;
one useful worked example with sourced facts or explicitly hypothetical assumptions. Only use firsthand client outcomes with documented permission and evidence; never invent experience to earn a point. 8+ links:
civilian money pages (/buy /sell /search /contact /resources/* /neighborhoods/*), a sibling
post, and at most one pensacolamilitaryhousing.com guide where genuinely relevant.

## STEP 4.5 — SCORE (never skip)
Perform the factual, calculation, scope, source, counterargument and read-aloud voice passes.
Record actual provider/model and findings, then seal `review.contentHash` using
`contentHash(spec, body)` and `review.evidenceHash` using `evidenceHash(research)` from
`scripts/civilian-editorial-lib.mjs`. An agent pass does not mean
Gregg or a licensed specialist approved the piece. Any changed content invalidates the review.
`node scripts/score-post.mjs <slug> --site gc --gate` must report 80+. This is editorial QA, not a ranking score or factual verification. Below 80, fix the
printed list (structure first: question H2s, direct answers, table, takeaways) and re-score.
Then `node scripts/analyze-formatting.mjs` and confirm the post's row reads 90+ (L004). A
preview build for eye tests without touching the site tree:
`node scripts/civilian-blog-factory.mjs <slug> --out <scratch dir>`.
Add `--bundle` to generate the blog hub, sitemap/llms and OG cards in an isolated complete site copy.
Use `node scripts/analyze-formatting.mjs --file <preview>/blog/<slug>.html --gate` for the actual
preview's formatting gate. Do not hand-calculate a proxy score or validate the old deployed page.

## STEP 5 — IMAGE (fetch-new-first standing order)
`node scripts/fetch-stock-image.mjs "<query>" <slug-img> --candidates 3 --dir civilian-site/images`.
VIEW every candidate with Read (eye test). Reject recognizable private people, disasters,
dated/sepia scans, watermarks. After 2-3 failed queries, fall back to an existing library image
and log the fallback. `--finalize`, downsize to max 1400w jpg quality 78, generate the .webp
(sharp, quality 75), then `node scripts/generate-responsive-images.mjs --only <image.jpg>`
and `node scripts/apply-responsive-images.mjs --only <built-page.html>`.

## STEP 6 — BUILD + GATE
`node scripts/civilian-blog-factory.mjs <slug>` (throws on any gate failure; fix, never
bypass), then `node scripts/audit-civilian.mjs` (0 findings), `node scripts/audit-entity.mjs`,
`node scripts/check-em-dashes.mjs`. Eye-check the OG card with Read.
For a complete isolated output, use `audit-civilian.mjs --root <preview-root>` and the entity
audit's paired root options. Inspect desktop/mobile, image, table, FAQ/schema and section links.
Do not overwrite or commit another task's unfinished site changes. Use a clean worktree based on current origin/main when the shared checkout is dirty. Merge the owned code changes with any newer evidence/privacy/journey code before building. Keep a complete isolated build and an explicit integration report rather than stopping at an unbuilt fragment.

## STEP 7 — SHIP
- `engine-config.json → autoPublish` false (default): `git pull --rebase`, commit ONLY the
  files you own (fragment, built page, index, sitemap, llms, images, OG, ledger, queue), push
  main, do NOT deploy. Report the draft with the score, the shareHook and the preview path, and
  tell Gregg to say "publish it".
- autoPublish true, or Gregg says publish: run the existing deployment gates, deploy with
  `npx wrangler pages deploy civilian-site --project-name greggcostin --branch main --commit-dirty=true`,
  then verify the actual live post and changed hub. Submit those exact URLs once with
  `node --env-file-if-exists=.env.local scripts/submit-indexnow.mjs --site gc --urls https://greggcostin.com/blog/<slug>,https://greggcostin.com/blog`.
  Replace <slug> with the published slug. This performs one IndexNow notification and the
  optional configured Bing submission, checks live HTTP/canonical/indexability first, and
  records per-engine receipts in content/measure/submissions/. Do not add a separate ping,
  repeatedly submit unchanged content, or silently expand to the whole sitemap. A dry run
  uses --dry-run. Received is not indexed; HTTP 202 means key validation is pending. An
  unknown receipt requires dashboard review before another attempt. Report partial failures.

## STEP 8 — RETRO + RECORD (every run)
1. `node scripts/blog-retro.mjs --site gc` (refresh queue, inbound-link plan, retro digest). Preserve PMH queue/plan entries and their previous generation date when reconciling these shared files. Then run the civilian planner again for the next work item.
2. Inbound links: every new post gets 2-3 inbound links from the hub pages the plan names
   (civilian hubs have no Related Guides block, so add one sentence-level link in the matching
   resource or neighborhood page and rebuild it with its factory if it is generated). Itemize
   them in the report.
3. Append the ledger entry (slug, date, type, words, score, image, sources, decisions, actual provider/model,
   metrics or "unavailable", staged|published).
4. Append 1-3 lessons to `content/blog/learnings.json` ONLY when this run produced evidence (a
   figure the sourcing caught, a gate that fired, demand the radar surfaced, a structure that
   scored badly). Never an opinion. A run that learned nothing writes nothing.
5. Report: what the data said (Bing pages/impressions for the domain, top post), what you did
   and why (override / refresh / radar / queue), the score and fix list before and after, the
   shareHook and who it is for, what is queued next, and what needs Gregg (query access to the existing Clarity project, a verified Bing indexing report, and a GSC export with exact property/window metadata).

## Standing rules
- Draft-first unless config says otherwise. Never invent statistics, people, or reviews.
- Never bump dateModified without substantive change. Never bypass a gate.
- Max one post or refresh per run. Cadence: Monday and Thursday 6:04am via the
  `civilian-blog-engine` scheduled task.

## Outcome learning after every run
Run `node scripts/blog-weekly-plan.mjs` after measurement and retro. Read its outcomeStatus, active/excluded lessons and experiment records. It invokes the committed shared blog-outcomes.mjs assessment against content/measure/article-outcomes.json. If a deliberately preserved older checkout does not yet contain blog-weekly-plan.mjs, run its existing blog-learning.mjs compatibility path and record which implementation was available; do not replace other unfinished shared code to manufacture parity. A prepared or undeployed change has no measured live effect. Unknown inquiry outcomes remain unknown. Use at least a full 28-day follow-up window, comparable source segments and the documented evidence thresholds; record inconclusive when evidence is inadequate. Never call a before/after change causal without an appropriate design.

Record a specific hypothesis and deployment date/status for each meaningful content or measurement change. Select topics from observed queries and verified recurring questions in `content/measure/client-questions.json`; autocomplete is a wording signal, not volume. Keep the best existing URL when refreshing the same intent. Preserve all existing factual, image, audit and publication gates, including `autoPublish=false`.
