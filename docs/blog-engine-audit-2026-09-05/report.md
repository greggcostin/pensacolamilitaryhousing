# Blog engine computational audit

> This records the initial computational audit. The [subsequent release review](../site-growth-2026-09-06/report.md) documents the three completed sourced refreshes, website repairs and live Meta setup. Initial statements about missing claim packs describe the earlier baseline.

Started September 5; completed September 6, 2026. Baseline: repository commit a621c4c, containing the earlier Fable audit. Scope: 12 military blog articles, 5 civilian articles, their generators, measurement and learning scripts, topic queues and connected reader paths.

## Finding

The highest-value improvement is more reliable decisions about what to write and change. The previous engine had useful formatting, image, build and research rules, but parts of its feedback loop treated weak signals as conclusions. The revised implementation makes those distinctions explicit and connects articles to useful guides, tools and inquiries.

This is a comparison of a baseline implementation and the Astra audit's implementation using repository replay, targeted regression cases and browser checks. Fable 5.1 was not rerun blind on the same task. No model-version advantage, ranking lift, citation lift or new clients has been experimentally demonstrated. The tests show that specific failure cases are handled better; they are not an unbiased general model benchmark. No claim is made that a model effort setting was independently verified.

## What the saved data supports

The Sep 4 Google Pages CSV contains 110 rows totaling **27,118 page impressions and 179 clicks**, about 0.66% CTR over its selected period. Ten blog rows account for **588 impressions and 4 clicks**. These are sums of saved page rows, not verified live dashboard totals. The prior audit described a three-month window; exact dates and filters were not retained. They must not be called monthly traffic. Google also documents differences between page-table and property totals. [Search Console definitions](https://support.google.com/webmasters/answer/7576553)

The BAH page recorded 48 clicks from 9,117 impressions, a 0.53% rate. This makes it worth investigating, but it does not establish 182 recoverable clicks per month. That number came from an uncalibrated position curve. The Gulf Breeze article recorded 0/53; its illustrative 95% Wilson interval extends from 0% to about 6.76%. That sample cannot establish that its description is defective. Page/query and device/country cohorts are needed before interpretation.

The content audit found zero external source links in the closing-cost, Fed-rate-hike and Florida-insurance-relief civilian fragments. The previous evidence score gave those articles 9.9, 16.4 and 19 points out of 20 respectively. The revised source component gives them zero. This is a concrete detector improvement, not proof the articles' claims are false. They need source verification and links.

No article currently has the new version 2 claim pack. Existing linked sources, author labels and passing site audits are not retroactive certification of factual accuracy.

Semrush returned insufficient API units. No callable Clarity connector was available in this audit, and no live GA4 or CRM outcome cohort was read. The audit used saved search exports; it did not fabricate current sessions, leads or qualified clients.

## Baseline versus implemented behavior

| Case | Earlier behavior | Revised behavior |
|---|---|---|
| Missing Bing URL | Stored zero impressions/clicks | Unknown coverage; no stalled/winner verdict |
| Old article without search data | Could become STALLED | DATA-UNAVAILABLE |
| 0/41 or 0/53 clicks | Could trigger priority-80 snippet work | Small sample; uncertainty shown |
| Snapshot comparison | Same source was sufficient | Exact property, cohort, dates, filters, coverage and equal non-overlapping windows required |
| Average position | Generic expected CTR and lost/month forecast | Review evidence, no recoverable-click forecast |
| Yesterday's snippet change | Could be selected again | 28-day collection period; factual corrections remain allowed |
| Source-like prose | Earned evidence points without links | Actual linked domains and a separate claim-pack gate |
| First-person anecdotes | Earned quality credit | No automatic credit; documented original contribution preferred |
| Topic discovery | Ignored Google query export; suggestions weighted as demand | Google queries included; sources and periods distinguished; suggestions are wording evidence |
| Duplicate check | Examined only military HTML | Both sites plus unbuilt fragments, with explicit intent review |
| Inbound link count | Included global site furniture | Contextual links measured separately |
| Learning | Small article-group means proposed rules | Operational fixes distinguished from performance hypotheses; reviewed experiments required |
| Conversion | Generic calls to action and broad events | Relevant next steps, sharing and confirmed-inquiry event labels |

The current numerical content score uses changed definitions and is not directly comparable as a quality or ranking improvement. Use its findings to inspect an article, not to claim the model made an article a certain percentage better.

## Changes readers can use

Both blog generators now provide a topic-specific next-step panel. A BAH or assumption article connects a purchase-budget tool with the civilian closing-cost guide. Insurance articles connect the insurance resource with the flood-zone guide. Tax articles connect the relevant veteran and homestead resources. Every panel provides one inquiry path through the existing form.

Native sharing and copying use the clean canonical URL. Copying a link is counted separately from completing native sharing. Neither is counted as a referred visit. No visitor is required to submit a form to read an article.

Six manually matched hub links give the Eglin neighborhood comparison, Navarre guide and VA-assumption buyer guide two additional contextual entry points each. The changes are recorded in links-applied.json. No mechanical reciprocal-link quota was applied to unrelated pages.

The form code and worker contract remain intact. The new event occurs only after the existing form receives explicit success. The browser tests simulated both rejection and success with all external requests intercepted, so no real contact, analytics event or test lead was sent.

The events measure article reading, next-step clicks, native sharing, link copying and accepted inquiries. Qualified clients require matched downstream evidence. The weekly planner can consume aggregate session cohorts from article-outcomes.json; missing data remains unavailable.

## Stronger next topics

The first proposed article task is a source-and-usefulness refresh of the existing civilian closing-cost guide. Supply primary citations and a reusable cash-to-close checklist before treating it as a strong referral destination.

The next research briefs focus on practical decisions:

| Brief | Useful original contribution | Ownership and limits |
|---|---|---|
| BAH after insurance, taxes and cash to close | Property comparison worksheet and sensitivity examples | Refresh existing BAH article; keep snippet experiment separate |
| Pensacola/Whiting student housing | Status-based decision tree and housing-office question sheet | Existing flight-school housing page is the first intent owner to inspect |
| Rent or buy for a short tour | Two-, three- and five-year scenarios with explicit assumptions | Review existing Eglin housing coverage; no universal three-year rule |
| Before-offer insurance documents | Roof, inspection, flood and quote checklist | Refresh civilian insurance resource; do not promise personal premiums |
| Veteran homestead with two homes | Eligibility questions and appraiser-document checklist | Refresh county guide; months in a state alone do not decide residency |

These are editorial hypotheses supported where applicable by recorded query rows. The generated plan preserves each source period and never adds Google and Bing counts into a monthly-demand claim. It also records cases without observed demand.

## What self-improvement now means

The workflow reads the new weekly plan, checks evidence, selects one useful task, uses the configured research and writing models, gates the result, stages it, and evaluates comparable outcomes later. New work requires a persisted claim pack, uncertainty list, verified calculation inputs where relevant, reader task and original contribution.

A reproducible operational defect can justify a tested safeguard immediately. A performance rule needs two distinct, comparable, reviewed experiments in its stated scope, with expiry and source evidence. Unsupported correlations are not injected as binding writing instructions. The existing Opus/Fable model policy and autoPublish=false remain unchanged; this audit did not commission a new article.

Google's current guidance supports useful original material, precise sources, crawlable links and schema consistent with visible text. It does not establish a preferred word count or special AI markup as a route to citations. Those limits are reflected in the revised contract. [Helpful content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content), [AI search features](https://developers.google.com/search/docs/appearance/ai-features)

## Validation and next checks

- 23 focused regression tests passed.
- Both sites passed mobile browser checks at 390px with no horizontal overflow.
- Rejected form response: zero successful-inquiry events. Accepted simulated response: exactly one.
- Military audit: 97 pages, zero findings. Civilian audit: 121 pages, zero findings. Entity audit: 218 pages, zero findings.
- General internal-link audit: zero broken links. It also reports one pre-existing orphan outside the blog scope.
- Em-dash check and affordability check passed. The affordability checker also reported four generated pages would change; this audit did not regenerate financial facts.
- Production build passed. Existing legacy content-score warnings remain documented.

After deployment, verify article event labels in the analytics debug view and choose one accepted-inquiry key event to avoid double-counting. Preserve exact Search Console export windows and filters. Measure comparable page/query cohorts after the snippet experiments have sufficient exposure. Then connect accepted inquiries to aggregate qualified-client outcomes. Cross-domain attribution settings and actual CRM outcomes still need verification; no improvement in traffic or clients is claimed yet.

The implementation is staged on a separate audit branch. It has not been deployed by this audit. Public pages include generated reader-path changes, while article facts and their publication/modification dates were preserved.
