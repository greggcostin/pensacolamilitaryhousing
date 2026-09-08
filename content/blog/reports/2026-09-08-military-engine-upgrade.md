# Military blog engine carryover, September 8, 2026

Implemented and tested on `codex/military-blog-geo-upgrade`, based on the completed civilian upgrade at `2ecb6e99`. This is a generator-maintenance change. No article was newly written, fact-refreshed or published, and no live measurement or indexing submission was performed.

## What changed

- Both sites now share the editorial validator and topic-planning logic. Existing civilian imports/commands remain compatible. Military records stay in `content/blog/research/`; civilian records cannot satisfy the military gate by sharing a slug.
- New and refreshed military articles receive the source/date/calculation checks, exact final-review hashes, useful local-application checks, voice restrictions and mandatory editorial elements from the civilian engine. A high score cannot compensate for a failed evidence check.
- Military records add audience status, duty locations, official benefit-source requirements, eligibility limitations, actual-LES guidance and structured BAH comparisons. Numeric BAH records must match their year, MHA, grade, dependency status and archived source record.
- The quick answer identifies the claim it restates. Two registered answers must match their actual question and opening paragraph or FAQ; their material caveat stays in the visible answer. This makes answers easier to use accurately without making a claim about guaranteed AI citations.
- The planner evaluates both domains and unpublished fragments, keeps source and site cohorts separate, and records editorial hypotheses distinctly from observed demand. It holds old FL023/Eglin assumptions and routes general civilian topics to the civilian desk.
- Timing restrictions previously buried in queue notes are now executable policy: the Q3 report waits until October and actual completed-quarter data; a 2027 BAH article needs the official release, not just a calendar date.
- The military builder has scoped previews, selected-article validation, stable contents links, article-specific BlogPosting fields, source citations, matching FAQ output, honest dates and scoped sitemap updates. Unrelated unpublished drafts do not enter the blog index from a selected build. Modern image sources are emitted only when the files exist.
- Military next steps support an explicit reader journey, including student housing and PCS sell-or-rent plans, while preserving first-party destinations, consent behavior and confirmed-inquiry measurement.
- A mobile browser check found the fixed header covering the section heading after a contents-link click. Anchor spacing now follows the actual header height.
- Claude and Codex military skills use the same updated contract and workflow. Source-reviewed core/financial guides keep their owning generators. The blog builder refuses to overwrite a financial-guide-owned article from a legacy fragment.

## Verification

The focused military, civilian and shared evidence suite passed **60/60 tests**. Tests exercise wrong source/site identity, unqualified VA claims, incorrect BAH dimensions/values/provenance, stale reviews, unrelated or unqualified answer passages, fabricated demand, future-data gates, valid journeys, sitemap scope, source ownership and real CLI preview isolation.

Military audit: **369 pages, 0 findings**. Shared entity audit: **679 pages, 0 findings**. Dash audit: **372 pages plus App.jsx, clean**. Link audit: **0 broken**.

The existing `personal-property-activity-pcs-2026` article was rebuilt for compatibility testing in the isolated checkout, including its normal index/manifest/discovery path, responsive image pass and OG card. Its formatting score was **100**. Desktop at 1280 pixels and mobile at 390 pixels showed no broken images or horizontal overflow. Eight contents links resolved, FAQ expansion worked and no console errors were observed. The final mobile heading started at 172.14 pixels, below the 155.23-pixel banner. The OG card was visually checked. Original publication/update dates were preserved. Its older claims were not newly verified or released.

Generated test pages, index, sitemap, llms and ledger output are excluded from this code release. The reviewed core source files and concurrent work in the shared checkout are unchanged.

## What the planner recommends next

The current queue yields a **scoped refresh of `/flight-school-housing-pensacola`** for the student-housing question. This is an editorial proposal requiring current official-source research and intent review, not a newly measured traffic opportunity. The plan holds 13 of 17 queue items for source, date, ownership or audience reasons.

The 12 existing blog articles map to two BAH, two VA, two PCS, two ownership-cost and four local-market articles. Student housing and PCS sell-or-rent are coverage gaps within this blog inventory, not proof that the site lacks all such guides. The existing guide owners are recorded in policy so the engine can refresh or link to them before proposing a duplicate.

The legacy article lint baseline ranges from 78 to 95, averaging 85.1. These old scores do not certify the articles against the new evidence standard and are not ranking predictions. Existing articles should move through researched, substantive refreshes with honest dates.

## Current guidance and limits

The policy was checked against [Google's current AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide), [AI features guidance](https://developers.google.com/search/docs/appearance/ai-features), [helpful-content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content), [Article documentation](https://developers.google.com/search/docs/appearance/structured-data/article) and [the documentation changelog](https://developers.google.com/search/updates).

The changes prioritize useful original answers, evidence, accurate entities, visible/schema consistency, internal links and readable pages. They make no special-markup, llms.txt, fixed-word-count or guaranteed-ranking claims. Useful FAQs remain, while the retired Google FAQ rich-result feature is no longer presented as an opportunity.

Official-source routing was also checked against [DoD BAH guidance](https://www.travel.dod.mil/Allowances/Basic-Allowance-for-Housing/), [VA eligibility guidance](https://www.va.gov/housing-assistance/home-loans/eligibility/) and [the JTR source page](https://www.travel.dod.mil/Policy-Regulations/Joint-Travel-Regulations/). Automated validation checks recorded support and arithmetic, not the truth of every source or professional approval.

The shared checkout is behind current main and received concurrent changes to the financial-guide branch of the blog builder during this task. This tested release remains isolated for review, preserving that work and the military `autoPublish:false` rule. Integration must preserve the financial-guide owner and the current main analytics/entity behavior. No military deployment is included.

Machine-readable verification is in `2026-09-08-military-engine-verification.json`; the reproducible planning packet is `plan-latest.json`. Search/AI citation gains and qualified inquiries remain unmeasured for this code change. Evaluate them after an approved article release using actual comparable data.
