---
name: blog-engine
description: Evidence-led military housing articles and refreshes, with official source checks, military context, natural writing, GEO/SEO validation and approval before publication.
---

# Military blog engine

Repo: `C:\Users\gregg\pensacolamilitaryhousing`. Read `content/blog/BLOG-CONTRACT.md`, `EDITORIAL-PLAYBOOK.md` and `editorial-policy.json`. Their version 2 rules apply to every new article and substantive refresh from September 8, 2026. One routine run completes at most one article or refresh. Work autonomously. An explicit generator-maintenance request authorizes scoped code/contract improvements and regression checks without manufacturing an article or a measurement run.

Read `C:\Users\gregg\costin-ea\ROUTINE-RUNTIMES.md`. Honor the actual approved provider, including an explicit Codex choice. On Codex use gpt-6-astra at max; record actual research/writing models. Keep all evidence, specialist, voice and approval rules. No paid API fallback or sending authority is added. For scheduled work honor its one claim/release lifecycle; never claim again when a launcher or earlier step owns the lease.

## Scope and concurrency

Begin with `git status --short`. Do not overwrite or stash parallel work or use `git add -A`. Isolate the release when needed. Routine ownership covers the selected fragment/research, reports, military queue/ledger, licensed blog imagery, selected blog/OG output, blog discovery files, and planned contextual inbound links. Preserve the civilian entries in shared lessons, refresh and inbound-plan files. Explicit maintenance requests also authorize narrowly scoped skills, contracts, generators and tests.

The reviewed core guides belong to `content/geo/` and `scripts/geo-core-lib.mjs`; BAH data lives in `src/bahData.js`. Never overwrite them using the legacy purchase-price generator. Verified corrections use the owning source/generator and are itemized in the report.

## Step 0: Learn

Read applicable active lessons in `content/blog/learnings.json`; carry source and writing rules into the briefs. Read shared evidence policy before historical performance claims. An active label or a small correlation cannot override current evidence. List unmerged `blog/*`, `fix/*` and `codex/*` article branches and their ages. Flag staged article drafts older than seven days without merging automatically.

## Step 1: Measure

Run `node scripts/analyze-formatting.mjs`, then `node scripts/blog-measure.mjs --site pmh` with live Bing access. Read actual source/window coverage. Preserve unavailable, empty, stale, incomplete and measured-zero states separately. Read dated GSC/Bing exports with their window metadata; run the CTR opportunity report only against valid evidence.

Probe available Clarity, Semrush and Bing AI Performance access. Request article URL-level data where supported. Sitewide counts do not become article results. Record tool and API-unit limits; do not infer winners or declines. Inspect available GSC/GA4 capabilities this session and report access gaps honestly.

Run `node scripts/blog-weekly-plan.mjs` when available. Use its comparable-window and outcome policy. Track accepted submissions separately from qualified inquiries and appointments, with separate military/civilian and search/social/paid cohorts. No small-sample or incomparable-window rewrites. Record actual snapshots and unavailable sources in the ledger/report. A timestamp alone does not establish successful measurement.

## Step 2: Decide

Read the military generation date in the shared refresh queue. If older than seven days, run `node scripts/blog-retro.mjs --site pmh`. If the topic radar is older than 30 days, regenerate with `node scripts/topic-miner.mjs`. Run `node scripts/military-blog-plan.mjs` and review the entire queue's overlap/source/date holds.

Priority: a verified consequential current event with a known owner; then a military refresh priority 60+; then dated observed military search or documented client questions; then a runnable editorial queue item, with coverage gaps as tie-breakers. Scan current DoD/VA/PCS developments, local market/insurance news and mortgage conditions. Open official sources before overriding the plan; syndicated headlines do not establish a rate move. Unreleased BAH and unopened date gates remain held.

Before a new article run `node scripts/blog-dedup-check.mjs --site pmh --kw "primary question" --strict`. Review both sites and unpublished fragments. An overlap flag requires a scoped refresh or documented distinct intent with compared URLs; it is not automatic proof of duplication. Route general civilian questions to the civilian engine. Never carry old FL023/Eglin assumptions into the brief.

## Step 3: Research

Use the approved configured research model and retain its official-source pack at `content/blog/research/<slug>.json`. If the specified specialist tool is unavailable under the approved runtime, research in-session and record the gap; never claim an unperformed subagent or professional review.

Define one reader, decision and military situation. Open primary sources this session. Record actual search questions with provenance, reviewed results, keyword variants, information gain, uncertain facts and five load-bearing claims/calculations. Check relevant live/core pages for verified inconsistencies. Site figures are claims to re-verify, not fixed truth.

Use DoD/DTMO/FMR and the annual archive for BAH, current VA guidance/circulars for VA benefits, current JTR and official reporting instructions for moving/student entitlements, and county/state sources for taxes. Keep orders, status, dependency, geography, vintage and exceptions distinct. Never infer base pay from rank.

## Step 3.5: Independently verify

Independently open every load-bearing primary source and recompute calculations. Verify population, time, place and exceptions. For BAH run `node scripts/verify-bah-source.mjs` against the integrated source files; missing files block numeric BAH claims. Refreshes re-verify retained figures. Omit or hedge unresolved claims and record the limitation. Source snippets and prior articles cannot replace verification.

## Step 4: Write and review

Use the approved configured writer and record the actual provider/model. Write only from the verified pack. Follow the contract's quick answer, takeaways, six useful FAQs, direct answers, table, checklist, worked example, links, shareHook and perishables rules. Cover the full question without padding. No em/en dashes, emojis, fabricated client/service experience or canned language.

Register exact answer passages, their claims and visible caveats. Document two concrete local implications. Retain the military reader's eligibility context. Include a realistic downside case. Seal the final content/evidence hashes only after reviewing facts, calculations, voice, scope, sources and counterarguments. Later content or evidence changes require a renewed review.

## Step 4.3: Score and formatting

Run `node scripts/score-post.mjs <slug> --site pmh --gate`, fix every hard failure and require 80+. Build with `node scripts/blog-factory.mjs <slug> --out artifacts/military-preview`, then run `node scripts/analyze-formatting.mjs --file artifacts/military-preview/blog/<slug>.html --gate` and require 90+. Use printed findings for specific revisions and re-review changed evidence. Do not bypass gates or present lint scores as ranking/citation predictions.

## Step 4.5: Verified canonical corrections

When primary-source verification proves a live-page inconsistency, correct through its owning source/generator and itemize page, old claim, correction and source. Honor `ledger.config.canonFixes`; unresolved changes stay report-only. Coordinate concurrent work. Preserve substantive review dates. Never run `build-affordability.mjs` over the reviewed `content/geo/` guides as a shortcut.

## Step 4.7: Images

Fetch new candidates with `node scripts/fetch-stock-image.mjs "query" <slug>-hero --candidates 3 --dir public/images/blog`. View every candidate, verify the real subject/place and commercial reuse/attribution, then finalize. Generate modern formats and responsive variants and apply responsive markup. Library reuse requires a recorded fallback after 2-3 unsuccessful query variants. Long guides get relevant inline imagery at natural breaks. Inspect the final crop.

## Step 5: Build and validate

Build the selected slug normally. Generate its page-specific OG card and inspect it and the desktop/mobile article. Verify stable anchors, FAQ behavior, overflow, dates, canonical, BlogPosting, FAQ mirror, actual image variants and relevant journey links. Preserve canonical entities, privacy and accepted-inquiry behavior.

Run `node scripts/audit-military.mjs`, `node scripts/audit-entity.mjs`, `node scripts/audit-links.mjs`, `node scripts/check-em-dashes.mjs`, relevant source verification and `npm run build` for the staged military release. Fix owned defects. Report unrelated baseline failures precisely without weakening gates or calling a failed release ready.

## Step 6: Stage or publish

Read `content/blog/ledger.json` configuration. With `autoPublish:false`, commit only owned changes to a review branch (Codex uses `codex/`), push it, and report the preview, score, shareHook and gaps. Do not touch main or deploy without publication authorization. If publication is explicitly authorized or approved configuration enables it, reconcile latest main, pass all release gates, publish, verify the actual live result and then submit IndexNow. A push is not deployment evidence.

## Step 7: Retro and report

Run `node scripts/blog-retro.mjs --site pmh`, preserving civilian entries. Add two or three planned contextual inbound links from named hubs to the staged article. Exclude nav/footer/index furniture from counts. Record actual models, source coverage, action, score, canonical corrections, inbound links, branch/commit, preview and deployment status.

Append operational lessons only when this run supplies evidence; performance changes remain hypotheses until supported by comparable reviewed outcomes. Do not invent lessons to fill a quota. Report any required dashboard access or approval and actual indexing/citation/GSC/Clarity uncertainty. Do not send the report or distribution messages without explicit authorization.

The builder also checks `content/geo/financial-guide-data.mjs` when present. An article owned by that reviewed financial-guide source must use `scripts/financial-guide-lib.mjs` and its checks, rather than a legacy blog fragment. A mixed legacy checkout is not permission to overwrite a reviewed financial page.
