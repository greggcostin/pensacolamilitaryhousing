# Civilian blog engine upgrade, September 8, 2026

Prepared a stronger editorial system and one complete substantive refresh of **What Moves Mortgage Rates? A Gulf Coast Buyer's Guide**. The source, built page, blog hub, discovery files, imagery and records are ready for the authorized scoped main commit. Publication remains approval-only: `autoPublish=false`; this run did not deploy or submit URLs for indexing.

Preview: http://127.0.0.1:43792/blog/what-moves-mortgage-rates

Complete release checkout: `artifacts/civilian-blog-engine/2026-09-08/release-checkout`. Run the preview with `CIVILIAN_PREVIEW_PORT=43792 node scripts/preview-civilian.mjs` from that checkout. The Windows environment variable must be set through PowerShell, for example `$env:CIVILIAN_PREVIEW_PORT='43792'` before the Node command. An earlier preview on port 43791 reflects the separate unfinished redesign, not this release artifact.

## What changed

The policy and 21-item queue cover eight editorial areas: financing and macroeconomics, local market conditions, buying, selling, insurance/taxes/resilience, rental underwriting, STR/vacation ownership and MTR/furnished rental operations. Each proposal has a reader, a decision, keyword intent and evidence status. Coverage gaps only break ties; verified consequential news, urgent refreshes and actual observed demand take priority.

The planner checks both sites and unpublished fragments. Existing intent owners become refresh destinations; proposals that depend on unfinished guides are held until those guides are integrated. Token overlap prompts review rather than automatically proving duplication. Actual query windows and verified recurring questions can establish demand; editorial ideas and autocomplete cannot invent volume. Both committed and newer Bing snapshot formats are handled without treating incomplete reporting as a trend.

The writer follows a concrete subject-review matrix. Rental articles must distinguish gross revenue, NOI, debt service and after-debt cash flow, account for reserves, and examine downside assumptions. STR and MTR material must verify the jurisdiction, intended use, association restrictions, financing, operating costs and relevant legal sources. Longer stays do not automatically establish an exemption. Macro stories must identify the actual release, vintage and local decision without inventing causal explanations.

Two evidence validators now work together. Consequential claims have exact passages, source IDs, access/reporting dates and scope. Numeric examples are recalculated from recorded inputs. At least five load-bearing checks are required. The final content and evidence hashes invalidate an old review when either changes. These controls verify consistency and arithmetic; they still require real source reading and editorial judgment.

The voice rules prohibit em dashes, en dashes, emojis, invented clients, fake experience, unsupported guarantees and stock introductions. Local relevance comes from useful decisions, not town-name repetition. Titles no longer need an arbitrary number to earn a point. The factory preserves accurate article/entity metadata, actual publication and revision dates, visible citations, readable answers, responsive images, a section index and matching FAQ content. The existing privacy-aware journey and accepted-inquiry tracking remain in place.

## The refreshed article

- 1,635 body words, nine question-shaped H2s, seven FAQs, four takeaways and seven primary-source references.
- Eleven claim records, including independently checked amortization, displayed payment differences and the points break-even.
- A new visually reviewed Pensacola house photograph, credited to Ebyabe under CC BY-SA 3.0. It is explicitly archival, not a listing or a comparable sale. Ten original/variant files are included.
- A readable 1,200 by 630 share card, personally inspected, without fabricated ratings or awards.
- Corrected double-counting of lender margin after the full mortgage/Treasury spread. Removed unsupported local and macro claims. Kept the weekly PMMS observation separate from daily Treasury movements.
- Two new contextual links: `/buy` in the financing discussion, and `/gulf-shores-orange-beach` in the ownership comparison. The retro now counts four contextual inbound links, excluding the blog index and sitewide navigation.

Share hook: **Before you pay for a lower mortgage rate, calculate how long it takes to earn the money back. A practical guide for Gulf Coast buyers and rental owners.**

The existing canonical URL and August 24 publication date are preserved. September 8 is the substantive revision date. The PMMS figure requires review on September 10, before publication if approval comes then or later. Recheck the primary source, update only changed facts, review and reseal the record, and rebuild through the gates.

## Validation and integration

The final editorial and formatting scores are both **100/100**. They are quality-control scores, not ranking or conversion forecasts. The focused suite passes **42 tests**, including the shared source/measurement/privacy tests. Civilian audit: **310 pages, zero findings**. Entity audit: **679 pages, zero findings**. The em-dash audit is clean, and a rendered-text check found no em dashes, en dashes or emojis in the article.

Desktop and 390px mobile checks found no horizontal page overflow or broken images. The payment table fits, the contents links resolve, the points FAQ expands and the copy-link control confirms success. No console errors were observed. The viewport override was restored.

An earlier expanded suite had 45 passes and four failures in unchanged broader-site tests: a CRLF/LF comparison, a stale 82-school count against the current 271-page school set, and two military checks requiring an absent `dist/index.html`. These are recorded in `2026-09-08-verification.json`; the whole repository suite is not claimed clean. The required civilian gates pass without weakening those tests.

The release was integrated on origin/main `5dc3822e` in a separate worktree. Newer shared evidence, privacy, school and article-journey changes were preserved. The factory updates only the changed article/hub sitemap dates and preserves the school generator's llms marker. A live single-site retro regression check confirmed that PMH queue/plan entries and their prior generation dates survive a civilian run. Unrelated shared-checkout changes were not staged.

The September 7 fragment's ledger had claimed a commit that git history did not substantiate. That historical text is retained as `originalStatus` and reconciled as interrupted fragment-only work. This run records the actual provider **Codex, gpt-6-astra, max**, lease `4471c1fc-77b5-4dfe-8588-44875bf48507`, and Gregg's explicit request to resume and improve the work. The former duplicate lesson IDs were reconciled without discarding the historical rules; three evidenced operational lessons were added.

## Measurement and the next run

Live Bing collection at `2026-09-08T06:21:25.553Z` returned no page rows and no query rows. Thirteen reported traffic days within August 10 through September 6 contained zero impressions and clicks. This does **not** establish zero indexed pages or complete 28-day coverage. The first failed request and later successful retry remain distinguishable.

Clarity project `ydd39cyp64` is installed for greggcostin.com; query access was unavailable in this runtime. A new project is not needed. A currently verified GSC reporting window and qualified-inquiry outcome data remain unavailable. No ranking improvement, AI recommendation, inquiry gain or revenue gain is claimed for an undeployed change.

The run's hypothesis is that a sourced, understandable financing comparison with useful property-specific next steps will support better-qualified inquiries. Primary outcome: separately verified qualified conversations attributed to the article. Secondary observations: unique landing sessions with accepted inquiries, organic clicks, reading engagement, real sharing and provider-reported AI citations when available. Observe at least 28 complete days after actual deployment with comparable production-host cohorts; record inconclusive when sources or samples are insufficient.

The final civilian planner selects **price-cut-or-seller-concession** as an editorial proposal, with 13 runnable and eight held entries. It does not claim measured demand. The shared weekly learning assessment discovers the new prepared experiment and reports aggregate inquiry outcomes as unavailable. The preserved older shared checkout also ran its existing blog-learning.mjs compatibility path, which reports the mortgage experiment as awaiting deployment. The property-tax article remains a low editorial-score review candidate, with no evidence of a performance decline. The existing unmerged `civilian/review-sync-20260901` branch, dated September 1, was identified and left for its own review; it was not merged as part of this article.

Gregg's remaining inputs are publication approval, query access to the existing Clarity project, a Bing URL-inspection/indexing report, and civilian GSC Pages/Queries exports with exact property, dates and filters. Approval does not remove source-expiry or deployment gates. No new schedule, paid API call, message, ad or deployment was created by this upgrade.
