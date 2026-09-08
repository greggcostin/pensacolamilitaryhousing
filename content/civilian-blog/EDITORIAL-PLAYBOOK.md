# The Costin Team editorial standard

The reader should leave with a better decision, a usable calculation or a question they know how to resolve. A search ranking, a word count and an impressive headline are not the editorial objective.

## Choose a reader and a decision

Read `editorial-policy.json`, `MEASUREMENT.md` and the shared evidence policy and active lessons. Use `node scripts/civilian-blog-plan.mjs` for the decision packet. It examines both domains and unpublished fragments before proposing a topic. Its coverage counts are a tie-breaker, not a production quota. A timely, verified development or a consequential correction can interrupt the mix.

Cover financing and macroeconomics, local markets, buying, selling, insurance and taxes, rental underwriting, short-term vacation rentals and mid-term rental operations. Do not write every article for every audience. Identify the primary reader and the decision first. Connect a national story to a local financing, ownership or transaction decision only when that connection is supported.

An existing guide owns its core intent. Link to it or improve it; a different keyword does not justify another version of the same article. Keep queued entries until their work is actually completed, and record a refresh URL when the intent already has an owner.

## Build a research brief before prose

Create `research/<slug>.json` using the mortgage article as the version 2 reference. Required fields: version, slug, sessionDate, reader, decision, pillar, changeReason, sources, claims, searchLandscape and localApplications. Add review only after the final editorial pass.

The same JSON also satisfies the existing shared research-pack gate. Keep `schemaVersion:2`, `article:{slug,site:"gc"}`, actual research/write `models`, `uncertainFacts`, `readerTask` and `originalValue`. PAGE keeps `editorial:{version:2,evidenceFile,pillar,readerTask,originalValue,conversionGoal}` alongside `editorialVersion:2`. Every claim includes the shared `claim`, `status`, `accessed`, `asOf`, `locator`, `sourceUrl` and independent-check fields, plus the civilian source IDs and exact `text` passage. Mark its actual paragraph, list item or table row with `data-claim="<id>"`. Both validators must pass; do not replace either with a self-awarded score.

Calculations carry numeric inputs, operation, result, units, input provenance and tolerance. Supported operations include sum, product, difference, quotient and amortization (principal, annual percentage, monthly-payment count). Use `additionalCalculations` for displayed differences or conversions. For an illustration, clearly separate a source explaining the method from hypothetical inputs supplied by the article. A link is not evidence that a hypothetical loan is available.

Each source needs its actual URL, title, publisher, primary-source status, check date and a specific evidence note. A search-result summary is not a source reading. Read the table headers, definitions, exceptions and actual reporting dates. Record conflicting values and resolve the difference instead of quietly choosing the most useful number.

Each consequential claim needs the passage it supports. Facts identify source IDs, scope and data vintage. Perishable facts also carry a review deadline mirrored in PAGE.perishables, with the source URL. Calculations identify assumptions, method and output. Hypothetical scenarios must say so visibly. Independently verify at least five load-bearing items, including mathematical outputs. Keep calculations reproducible.

Inspect the search results and collect 10-15 useful reader questions. Mark each as an observed query with dated evidence, source wording, autocomplete discovery, or an editorial proposal. Never turn autocomplete or old queue prose into search volume. Explain what the existing results leave unresolved. Do not falsely call an editorial question People Also Ask.

## Apply the right subject review

| Subject | Required distinctions |
|---|---|
| Market reporting | Location, property type, closing period, sample, source and revisions. Median price changes are not automatically appreciation of the same houses. Separate list prices from sold prices. |
| Macro and rates | Actual release versus forecast; weekly average versus daily quote; nominal rate versus APR; principal and interest versus total ownership cost. Avoid attributing a market move to a headline without evidence. |
| Buying and selling | Gross price versus net proceeds; temporary subsidy versus permanent financing terms; inspection and financing conditions; property-specific information rather than generic guarantees. |
| Insurance and taxes | Quote versus binder; premium versus deductible; flood versus wind; seller's bill versus buyer's assessment; exact parcel jurisdiction; proposed law versus effective law. |
| Rental investing | Revenue, NOI, debt service, cash flow and cash-on-cash return are different measures. Include vacancy, repairs, replacement reserves, management, taxes, insurance and acquisition costs. |
| STR and vacation homes | Verify address-level zoning, state/local licensing, lodging taxes, association restrictions, management control, owner use, insurance and financing. Model seasonality and downtime. |
| MTR and furnished rentals | Define stay lengths for the actual source. Verify local and state treatment separately. Include utilities, furnishings, turnover, occupancy gaps and documented demand. Longer stays do not automatically exempt a property from every rule. |

Use a conservative, base and upside scenario when it helps a consequential investment comparison. Identify what would reverse the recommendation. Never count future appreciation, refinancing or a promotional occupancy estimate as required rescue financing. If legal or tax interpretation remains unresolved, hold that claim for the appropriate professional; do not invent specialist approval.

## Write and edit in a human voice

Open with the problem and useful answer. Avoid announcing that the article will explain something the reader already asked to understand. Prefer ordinary words, specific examples and varied sentence lengths. Use team judgment where it is actually judgment, and cite reported facts beside the claim.

No em dashes, en dashes, emojis, artificial urgency, invented client stories or canned introductions. Remove stock phrases, duplicate takeaways and unnecessary town lists. Every place name should change the advice or explain a real jurisdiction. A national financing concept does not need eight repetitions of Pensacola to become relevant.

Keep question headings when they match intent, answer them immediately, and use tables and checklists because they are useful. Retain the existing 1,100-word floor and six-FAQ gate, but do not pad. FAQs should resolve remaining decisions or exceptions, not repeat the opening in seven ways. One relevant contact step is enough.

## Review the exact final draft

Perform distinct factual, calculation, scope, counterargument and voice passes. Record actual provider/model and specific findings. An agent review is not a claim that Gregg, a lender, an attorney or a tax professional reviewed the article.

Set `review.contentHash` with `contentHash(spec, body)` and `review.evidenceHash` with `evidenceHash(research)` from `scripts/civilian-editorial-lib.mjs` only after those passes. Record the six review checks and notes. Any content or evidence change requires another review. The validator checks the record and its consistency; it cannot prove a source is true or replace reading it.

Use `node scripts/score-post.mjs <slug> --site gc --gate`. The floor remains 80; aim for 90 or better without changing facts to earn points. Version 2 hard findings block even a high score. The factory independently applies the same evidence and voice gate to new posts and refreshed older posts.

## Build, inspect and stage

Use a new licensed image and inspect every candidate. Record credit, visible context and any rejection. Generate responsive assets with `node scripts/generate-responsive-images.mjs --only civilian-site/images/<image>.jpg`; apply generated markup with the existing responsive-image script. Never hand-maintain srcset lists.

`node scripts/civilian-blog-factory.mjs <slug> --out <preview-root> --bundle` writes the article, blog index, sitemap, llms section and OG cards into an isolated output root. A complete preview root must also have the site's shared files and images. This avoids overwriting another task's unfinished design. `--out` by itself writes the selected article and its OG card.

Run `node scripts/audit-civilian.mjs --root <preview-root>` for a complete staged copy, the entity audit, and `node scripts/analyze-formatting.mjs --file <preview-root>/blog/<slug>.html --gate`. The single-page formatting check does not replace the sitewide report. Check desktop and mobile rendering, source links, FAQ/schema parity, table overflow, section links, image and OG card. Preview serving must omit production trackers and block form submission.

Preserve immutable publication dates. Update visible modification dates, structured data and the changed URL's sitemap lastmod together after a substantive revision. No date bump merely to look fresh. Keep standard BlogPosting, BreadcrumbList and matching FAQ markup; no invented ratings or special AI schema. Sources and answers must remain visible without JavaScript.

`autoPublish=false` remains binding. Stage source and generated changes only when ownership and deployment behavior are clear; never commit another task's work. Do not deploy until Gregg approves. IndexNow accepts exact materially changed live URLs after deployment, with receipts; a submission is not indexing.

## Measure what actually happens

Record Bing, Google, analytics and qualified inquiry outcomes separately. Missing rows are unknown, not zero. Do not infer search failure or indexing from an empty performance endpoint. Keep the failed request and successful retry distinguishable.

Run `node scripts/blog-retro.mjs --site gc` and `node scripts/blog-weekly-plan.mjs`; the latter uses the committed shared `blog-outcomes.mjs` assessment. A prepared change has no live effect. Once approved and deployed, record its exact date and compare matching windows and host filters over at least a full 28 days. Track qualified inquiries and accepted inquiries separately. AI citations, when accessible in a provider's report, are a separate visibility measure, not a qualified lead. Keep conclusions inconclusive when evidence is insufficient.

Current basis checked September 8, 2026: [Google AI features](https://developers.google.com/search/docs/appearance/ai-features), [helpful content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content), [Article structured data](https://developers.google.com/search/docs/appearance/structured-data/article), and [Bing AI Performance](https://www.bing.com/webmasters/help/ai-performance-9f8e7d6c). Google describes ordinary SEO practices as the foundation for AI Search, without special AI markup requirements. These practices improve eligibility and usefulness; they do not guarantee inclusion or ranking.
