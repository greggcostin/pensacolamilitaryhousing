# Military article desk

Start with the decision, not a keyword list. A service member comparing a home purchase before flight training has different constraints from a veteran buying a long-term primary home or an owner deciding whether to rent after PCS orders. Name that situation before choosing sources or a structure.

## What transfers from the civilian desk

Both engines use `scripts/blog-editorial-lib.mjs` for source dates, claim support, repeatable calculations, useful local applications, natural language and final content/evidence hashes. `scripts/blog-plan-lib.mjs` handles demand, date gates, overlap review and refresh priority separately for each site. Civilian entry points remain compatible.

Military work adds `scripts/military-editorial-lib.mjs`: audience and duty context, official benefit-source checks, numeric BAH dimensions and archived-rate comparison, documented answer passages, student-order caveats and rental downside checks. These are traceability checks. A reviewer must still read the source, resolve its meaning and check the actual final prose.

## Research for a useful answer

1. Run `node scripts/military-blog-plan.mjs`. Read the recorded measurement dates, holds, owners and coverage gaps. This command reads prior measurements; it does not refresh Bing or prove demand by itself.
2. Check both sites and unpublished fragments before writing. Use `node scripts/blog-dedup-check.mjs --site pmh --kw "the actual question" --strict`. A flagged overlap requires a scoped refresh or documented distinct intent. Autocomplete is wording evidence, not search volume.
3. Read the official primary source this session. Record publisher, URL, section, source/effective dates, population, geography and uncertainty. For BAH, use DoD/DTMO; for VA benefits use VA guidance and current circulars; for moving entitlements use the current JTR and installation instructions. Include lenders, insurers, county officials or a specialist where the individual decision depends on their determination.
4. Independently verify five load-bearing claims or calculations. Preserve source qualifications. A search snippet, a previous article, an archive timestamp and an AI research summary do not replace that read.
5. Save one research file at `content/blog/research/<slug>.json`. It carries both evidence schema version 2 and editorial version 2 fields, plus military context. Do not create competing evidence files.

For BAH work, run `node scripts/verify-bah-source.mjs` in the checkout with the current source files. The annual JSON and archive must exist for numeric BAH validation. Missing source files block those claims; integrate the verified source work rather than substituting old article figures. The reviewed core guides in `content/geo/` belong to `scripts/geo-core-lib.mjs`. Never overwrite them with the legacy purchase-price generator. Use actual LES pay and retain substantive-review dates.

## Write something worth keeping

Open with the answer, the condition that matters, and the next decision. Use question headings where they help readers find answers. The house standard includes a short quick answer, 3-5 takeaways, a comparison table, a checklist, a reproducible worked example and at least six useful FAQs. The existing length and formatting thresholds are editorial checks, not a claim that Google prefers a word count.

Register two actual opening answer paragraphs or FAQ answers in `answerPassages`. Keep the important caveat in the paragraph itself. Each claim ID must occur in that answer. Record `quickAnswerClaimIds` for the exact claim restated in the quick answer. A precise answer that loses its eligibility condition when quoted is not ready.

Make local details change the advice: a reporting location, gate route, parcel jurisdiction, bridge crossing, documented insurance question or a rental-exit constraint. Record two such decisions and their actual passages in `localApplications`. Repeating Pensacola, Eglin and Navarre does not establish local expertise.

For the worked example, identify all assumptions, units and input sources. Separate a hypothetical household from an actual client. Include full housing cost, not just principal and interest. For sell-or-rent decisions, show what a vacancy or repair changes. Describe which costs are excluded. Do not infer a loan approval, tax exemption or entitlement from a simplified calculation.

Read the article aloud. Vary sentence length. Remove generic introductions, stock transitions, repeated conclusions, invented experiences, unsupported superlatives and forced keyword variations. No em dashes, en dashes or emojis in reader-facing copy. The contact worker's exact `data-inquiry-type` value is a technical exception, not a license to use dash punctuation in prose.

## Build, check and learn

Use `node scripts/blog-factory.mjs <slug> --out artifacts/military-preview` for a scoped article preview. This mode writes the selected HTML only; it leaves canonical pages, the ledger, the blog index, sitemap and llms file alone. The normal build updates only selected ledger entries and sitemap dates and does not enroll unrelated unpublished drafts in the index.

The generated article gets a stable contents list, matching FAQ text, article-specific BlogPosting metadata, actual publication/update dates, its real image and verified-source citations. It keeps the site's canonical author/publisher identity and existing consent and accepted-inquiry behavior. The contents list is for navigation and accessibility, not an AI ranking trick.

Pass score 80+, formatting 90+, military/entity/link/dash audits and the relevant source checks before staging. Generate and inspect the OG card and responsive images. A code-only generator update can be tested with existing articles without presenting their old claims as freshly verified. A new or refreshed article must meet the current evidence standard.

Plan two or three contextual inbound links from the topic's owning guide and relevant base/community pages. Check the actual destination exists. Add them only to the staged article's release, and list every change. Generic finance and investment questions usually belong on greggcostin.com; bridge there instead of creating a military-labelled duplicate.

Preserve `ledger.config.autoPublish`. With false, stage on a branch and report for approval. A commit, preview, sitemap submission or high editorial score is not a deployment or an outcome. Measure production search and AI citations where available, useful next-step visits, accepted inquiries and separately confirmed qualified inquiries. Compare equivalent windows after deployment. Keep insufficient data unknown; a coverage gap is an editorial hypothesis, not demand.

## Current search guidance

Checked September 8, 2026 against [Google's generative AI guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide), [AI features documentation](https://developers.google.com/search/docs/appearance/ai-features), [helpful-content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content), [Article documentation](https://developers.google.com/search/docs/appearance/structured-data/article) and [the documentation changelog](https://developers.google.com/search/updates).

Google says its AI search experiences depend on Search fundamentals and useful original content. Special AI text files, formulaic rewriting and extra schema are not required. Keep llms.txt accurate for systems that use it, without reporting it as a Google ranking lever. Google also reports that FAQ rich results stopped appearing starting May 7, 2026. Keep the useful FAQs and accurate semantic markup; do not count FAQ markup as a rich-result opportunity for this site.

Search Console capabilities can change. Inspect the available performance reports and actual filters, and record any AI-specific report separately from ordinary web search where available. Do not assume that missing access means no citations or traffic.

The builder also checks `content/geo/financial-guide-data.mjs` when present. An article owned by that reviewed financial-guide source must use `scripts/financial-guide-lib.mjs` and its checks, rather than a legacy blog fragment. A mixed legacy checkout is not permission to overwrite a reviewed financial page.
