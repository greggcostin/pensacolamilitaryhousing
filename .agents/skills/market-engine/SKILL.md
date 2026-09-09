---
name: market-engine
description: The monthly self-improving market-dominance routine for BOTH properties (pensacolamilitaryhousing.com + greggcostin.com) — re-runs the bellwether prompt panel, diffs the seo-baselines, snapshots competitors and refreshes the data study on their quarterly gates, audits and improves the civilian site (one item per run, draft-first), and reports what moved and what Gregg should do next. Use on "/market-engine", "run the market engine", or the monthly scheduled run.
---

# Market Engine — measure → diff → gate → improve → report

You are running Gregg Costin's monthly market-position routine. One run = one full loop.
Work autonomously; never ask questions mid-run. Repo: `C:\Users\gregg\pensacolamilitaryhousing`.
The weekly blog-engine owns PMH content; this engine owns MEASUREMENT, COMPETITORS, the
DATA STUDY, and the CIVILIAN SITE (greggcostin.com, source in `civilian-site/`).

## Files you own
- `docs/seo-baselines/bellwether-YYYY-MM-DD.md` — monthly prompt-panel logs (newest = current)
- `docs/seo-baselines/competitors-YYYY-MM-DD.md` — quarterly competitor snapshots
- `docs/seo-baselines/market-engine-log.json` — run log + config (create on first run:
  `{"config":{"autoPublishCivilian":false},"runs":[]}`)
- `civilian-site/**` — the greggcostin.com source (draft-first unless config says otherwise)
- `content/pages/bah-vs-cost-of-owning-pensacola.fragment.html` — the data study source

## STEP 1 — MEASURE (always)
1. **Bellwether prompt panel**: WebSearch verbatim: `best realtor in Pensacola FL`,
   `best military realtor Pensacola`, `gregg costin realtor`. Record top-10 link sets and
   any names an AI summary surfaces. Write `docs/seo-baselines/bellwether-<today>.md`
   following the previous file's format, with an explicit DELTA section vs the newest
   prior file (names entering/leaving, Gregg's presence, new competitor URLs).
2. **Clarity** (MCP): last-28-day sessions, sources (watch the chatgpt.com/AI referrers),
   pages, and conversions (SubmitForm etc.) for pensacolamilitaryhousing.com. If the
   civilian site has its own Clarity project by then, measure it too.
3. **Semrush** (MCP, cheap endpoints): `domain_rank` + `backlinks_overview` for
   pensacolamilitaryhousing.com — log rank/keywords/traffic/AS/refdomains in the run log.
   If keyword-API units are available, also pull `resource_organic` top movers. If units
   are exhausted, record "units exhausted" honestly.
4. **Live sanity**: curl both homepages (200?), both sitemaps, and one deep page each;
   run `node scripts/audit-civilian.mjs` (must be 0 findings) and
   `node scripts/check-em-dashes.mjs` (must pass). A failure here becomes THIS run's
   work item, overriding everything else.

## STEP 2 — QUARTERLY GATES (check the calendar, act only when due)
- **Competitor snapshot** (due ~Nov 24, Feb 24, May 24, Aug 24): Semrush `domain_rank` +
  `backlinks_overview` for panhandlepcs.com, bemoregroup.net, navytonavy.com; WebFetch
  each homepage for review-count claims; write `docs/seo-baselines/competitors-<today>.md`
  diffing the prior snapshot. Escalate in the report if panhandlepcs AS or traffic jumps,
  or BE MORE's review claim passes Gregg's Google count.
- **Data study refresh** (due Jan / Apr / Jul / Oct): run
  `node scripts/build-bah-zip-study.mjs`, update the fragment's table + findings + data
  vintage month, rebuild via `node scripts/page-factory.mjs content/pages/bah-vs-cost-of-owning-pensacola.fragment.html`,
  verify with the em-dash lint, and note the deltas (which ZIPs changed coverage bands).
  January is also the BAH re-baseline: new rates land in `src/App.jsx BAH_DATA` first
  (ANNUAL-UPDATE.md owns that), THEN refresh the study.
- **December only**: flag the BAH-2027 rollover checklist (ANNUAL-UPDATE.md) and the
  "2026"-titled pages in the report; do not perform the rollover inside this engine.

## STEP 3 — IMPROVE THE CIVILIAN SITE (max ONE item per run, draft-first)
greggcostin.com is a 6-page brand/conversion site, not a content farm — improvements are
surgical. Pick the highest-value single item from, in priority order:
1. Anything `audit-civilian.mjs` or the live-drift check flagged (gate failures first).
2. Stale facts: review counts (canonical numbers live on the PMH reviews page — keep the
   two sites in lockstep), sold-volume claims, team roster, phone/address.
3. Conversion: missing event tracking parity, broken funnels (RealScout / Calendly /
   contact-worker contract strings — NEVER alter "PCS / Relocation — Buying/Selling").
4. Entity: Person schema sameAs completeness BOTH ways (greggcostin.com ↔
   pensacolamilitaryhousing.com ↔ GBP/Zillow profiles), and the
   civilian-first jobTitle/knowsAbout positioning per docs/ai-search-strategy.md.
5. One content refresh (testimonial rotation, seasonal copy, a new FAQ) — only with a
   sourced reason, never churn.
Then: run `node scripts/audit-civilian.mjs` (must stay 0), and per
`market-engine-log.json → config.autoPublishCivilian`:
- **false (default):** commit to branch `civilian/<item>-<YYYYMMDD>`, push the branch,
  put the diff summary in the report. Gregg approves with "ship it" in any session.
- **true:** commit to main, deploy with
  `npx wrangler pages deploy civilian-site --project-name greggcostin --branch main --commit-dirty=true`,
  verify live, and note it.

## STEP 4 — REPORT
Append to `market-engine-log.json → runs[]`:
`{date, bellwetherDelta, pmhSnapshot, gatesRun, civilianItem, staged|shipped}`.
Then the human report, in this order: (1) did Gregg's name move on the bellwether
queries, (2) PMH trend vs last month, (3) competitor alerts if any, (4) what was
improved/staged on greggcostin.com, (5) the standing Gregg-side checklist with anything
still unexecuted (Yelp claim, U.S. News / HomeLight / FastExpert / EffectiveAgents /
Clever profiles, Bing Places, Apple Business Connect, GA4 AI channel, Clarity/GA4 IP
blocking, review velocity + civilian voice share, Post Housing / VeteranPCS / chambers
backlinks, PNJ pitch with the data study attached). Nudge, do not nag: list only what is
still open, with the single next action for each.

## Guardrails
- Draft-first for anything user-visible on either site unless the config flag says
  otherwise; measurement files under docs/seo-baselines/ commit straight to main.
- NEVER modify the contact-worker contract strings, the em-dash lint, or blog-engine
  files. Never fabricate metrics — "unavailable" is a valid value.
- Writable scope: `docs/seo-baselines/`, `civilian-site/`, the data-study fragment +
  its built page, and nothing else. If the working tree is dirty with another session's
  work, stay inside scope and note it in the report.
- One civilian improvement per run. Compounding beats churning.
