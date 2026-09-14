# Mortgage-rate guide refresh, September 14, 2026 (scheduled Monday run)

Published September 14, 2026 at 1:20 p.m. Central: [What Moves Mortgage Rates? A Gulf Coast Buyer's Guide](https://greggcostin.com/blog/what-moves-mortgage-rates). Cloudflare deployment `b8e49fe1-bf6e-4b3b-a236-5250e4fe1009` (previous production `1e42f109-4804-4dd3-9901-6ae680f4dc30`). Source commit `fb1f5c3c` on main plus the retro/record commit that follows it.

Provider: Claude (primary), model `claude-opus-5[1m]`, in-session research and writing; no fallback. Lease `cf6086b3-7c13-4bd1-bf64-4090bf116b24`. Run `civilian-blog-engine-2026-09-14`. `autoPublish=true` (Gregg, September 12) authorized publication after the gates below; no schedule was created or changed.

## Decision

The planner selected the owner-requested refresh (`what-moves-mortgage-rates`, requestedOrder 2, notBefore 2026-09-14). Current-events check (web, September 14): no Gulf tropical threat (NHC: one low-chance Atlantic disturbance far from the U.S.); the Fed decision is Wednesday September 16, after this run; Florida insurance coverage repeated the already published Citizens 2026 filing. No override. Refresh queue: empty. Topic radar: September 5, within 30 days. Dedup (`--site gc`, three keywords): INTENT-REVIEW hits were this article, the Fed article and the blog hub, so the existing URL stays the intent owner and was refreshed in place.

## Article and evidence

- Existing canonical URL kept; `datePublished` 2026-08-24 unchanged; `dateModified` 2026-09-14 matches the visible date, BlogPosting schema and sitemap lastmod.
- Substantive change: new H2 "What is the federal funds rate, and does it set your mortgage rate?" with the July 29, 2026 target range (3.50% to 3.75%), the Fed's overnight-rate definition, the expectations passage from the Fed policy explainer and the September 15-16 meeting; a dated three-benchmark table (policy range, 10-year Treasury 4.96% on September 11, PMMS 6.76% as of September 10) with an explicit instruction not to subtract rows for a spread; a pre-meeting quote-comparison paragraph linking the Fed guide; updated quick answer, description, target keywords, takeaways and the Fed FAQ. Body 2,194 words, 10 question H2s, 3 tables, 7 FAQs, 10 links.
- Eleven primary sources opened this session (PMMS, FOMC statement, FOMC calendar, Fed policy explainer, Treasury daily par yield CSV, FEDS 2021-048 III.A read from the PDF text, four CFPB pages, Fannie Mae B2-1.1-01). Seventeen claims; the five-plus load-bearing checks and the amortization, points and ownership-total recomputations are in `source-checks.json` and the research pack.
- Perishables: policy range and meeting review by September 16; PMMS by September 17; Treasury yield by September 21; occupancy by October 14. The article does not predict the September 16 decision.
- Read-aloud pass corrected three passages before sealing (PMMS "as of the September 10 weekly release", removed "barely react", named the meeting dates instead of "this week"). Score 100/100 (was 100 before; the first unsealed pass scored 75 on review-hash findings only). Formatting 100. These are editorial checks, not ranking or factual-verification scores.
- Image: `mortgage-benchmarks-20260914.jpg`, Wikimedia Commons, Infrogmation of New Orleans, CC BY-SA 3.0. First query returned no licensed candidates; second returned three, all viewed: two 1968 HABS scans rejected, the color Pensacola Victorian exterior selected. Resized to 1400px, WebP and 480/768/1200 AVIF/WebP/JPEG variants generated; OG card viewed.

Share hook: **Before you pay for a lower mortgage rate, calculate how long it takes to earn the money back. A practical guide for Gulf Coast buyers and rental owners.**

## Delivery gates and verification

Isolated worktree `artifacts/civilian-blog-engine/2026-09-14/source` at origin/main `ef03c52b` (the shared checkout carried 1,186 unrelated dirty files and sat behind origin/main). Baseline `../2026-09-12-autopilot/release/gc` verified against production `1e42f109`: 2,582 of 2,582 provider files exact (`production-before.json`). Candidate built from that baseline: article, hub, credits page, discovery files, OG card, new image set and the Pagefind index (322 pages) changed; 320 unowned pages restored byte-for-byte; no removals (`candidate-inventory.json`, `candidate.json`).

Gates on the sealed candidate (`quality-gates.json`): rendered parity, civilian audit 0 findings across 322 pages, entity audit clean (698 pages with the retained PMH root), score 100, formatting 100, em-dash scan clean. Fingerprint `e4caee0de1fc3d7fb92e6047ef5aaa0332fa3763eb5defe1e7435ff295994624`.

Browser QA on the static-served candidate: desktop DOM checks passed (quick answer first in main, canonical, "Updated September 14, 2026", AVIF hero 760x543 loaded, three tables inside the 760px column, no horizontal overflow, 7 FAQ details). Mobile: the 480px AVIF variant was selected, an FAQ toggled open, and the benchmark table sits in an `overflow-x:auto` wrapper; pixel-level mobile layout is unverified because the pane reported `visibilityState` hidden with `innerWidth` 0 in this unattended session (screenshots timed out; `preview_start` refused). The layout and wrappers are identical to the Fed article verified on September 12.

Deployment under the shared publication lock via `publish-isolated-release.mjs` (wrangler 4.87.0): 61 files uploaded, 2,573 already present, provider stage success. `provider-verification.json`: 2,634 of 2,634 files match the candidate. `public-verification.json`: 12 public checks passed (article with rendered-parity, canonical and the 3.50% to 3.75% passage; hub; sitemap; llms; llms-full; robots; photo credits; pagefind; three image files; OG card) after reversing only Cloudflare's observed email protection.

IndexNow and Bing each accepted exactly two URLs (article and /blog) once: receipt `content/measure/submissions/2026-09-14T18-21-13-798Z-gc-cfd21c22.json`. Acceptance is not indexing.

## Measurement (verified this run)

- Bing API (`blog-measure.mjs --site gc`, live): 2 page rows (/schools/pensacola-christian-academy 20 impressions; / 5 impressions, 2 clicks), 6 query rows, 19 traffic days through September 12, site 43 impressions / 2 clicks in the trailing 28-day bin. No /blog/* rows: unknown, not zero.
- Bing GetUrlInfo: HTTP 400 UnknownError for the article, the Fed article and /blog (`bing-url-info.json`).
- Bing URL Inspection (signed-in browser, read-only, no request-indexing click): this article is **Discovered but not crawled**, discovered August 26, 2026, "URL cannot appear on Bing", unnamed issues. The refreshed URL was therefore not in Bing's index before this run.
- Clarity: the connector is bound to the military project (an unfiltered query returned pensacolamilitaryhousing.com URLs; the greggcostin.com filter returned nothing). Civilian project `ydd39cyp64` opened in the signed-in browser for September 7-13 UTC: 145 sessions (40 bot sessions excluded), 89 unique users, 2.52 pages per session; no /blog/* URL in the top 12 pages; internal referrers (127.0.0.1, greggcostin.pages.dev) not excluded. Native CSV retained at `analytics/clarity-gc-2026-09-07_2026-09-13.csv`.
- GSC: the September 12 native workbook remains the retained source (selected August 14-September 10, chart August 23-September 10, article absent). No new export requested. Article performance in Google unknown.
- `content/measure/client-questions.json` is not in the committed tree; no verified recurring client questions were available. Qualified inquiries unavailable.
- Weekly plan `outcomeStatus` unavailable; 31 active lessons, 2 experiment records. No live effect is inferred from publication.

## Retro and records

`blog-retro.mjs --site gc` and `blog-weekly-plan.mjs` ran after publication; the PMH generation date (2026-09-09) in the shared queue and plan files is preserved. The refresh queue is empty and the inbound-link plan names no post; the refreshed article already has three contextual inbound links (/buy, /resources/mortgage-preapproval, /blog/fed-rate-hike-what-it-means), all unchanged. Ledger run and post entries record the hypothesis (dated federal-funds versus mortgage section and pre-meeting comparison step; outcome measured as accepted inquiries from this URL over at least 28 complete days with comparable cohorts). Queue item marked completed with the deployment id.

Lessons added with evidence from this run: L033 (never restore generated pages by a bare `.html` suffix; `*.fragment.html` is source) and L034 (unattended browser QA limits and the static-server fallback).

Next planner selection: `coastal-alabama-vs-panhandle` (queued refresh of /resources/coastal-ownership-costs, ownership clear). Perishable review dates for this article fall on September 16 and 17; the Thursday run should recheck the policy range, meeting outcome and PMMS.
