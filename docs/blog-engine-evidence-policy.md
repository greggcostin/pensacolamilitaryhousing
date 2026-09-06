# Blog engine evidence policy, version 2

This policy governs measured learning for both sites. It supplements the project skills and preserves the configured models, one-article limit, image workflow and publication permissions. The implementation lives in the repository, independently of a particular conversation.

## Run and decide

Run node scripts/blog-weekly.mjs before selecting work. Use --offline to replay saved exports. Add --refresh-suggestions to refresh discovery queries. The command measures, checks snippets, mines query evidence, evaluates articles and writes content/blog/weekly-plan.json. It does not write articles, submit leads, deploy or merge.

Read weekly-plan.json before the old queue. Verify expired claims first, then repair missing source support. Search reviews need evidence, not a score alone. The plan names one candidate; writing still follows the site's configured research/writing models and BLOG-CONTRACT. A source repair does not automatically justify a new date or complete rewrite.

Every research brief must state the reader's decision, the current intent owner on either site, the useful original contribution, the primary source plan, unresolved facts, two relevant inbound links and an appropriate next step. Use growth-briefs.json as a starting point. A new article must have a distinct reader task.

The strict dedup check examines both sites and unbuilt fragments. An unresolved collision blocks a new article. To document distinct intent, the queue item needs intentReview with decision "distinct-intent", reviewedBy, readerTask, distinctValue and comparedTo containing the flagged full URLs. Otherwise refresh the actual owner. Lexical overlap is only a prompt for review, not proof of search cannibalization.

## Measurement and uncertainty

The filename is a capture date, not a measurement interval. Save exact start/end dates, search type, dimensions, filters and coverage in content/measure/source-windows.json. Unknown fields stay null. The Sep 4 exports have no saved exact bounds or filters; prior notes describe three months. Do not call those totals monthly traffic.

Compare equal, non-overlapping, confirmed windows for the same property, source, page or query cohort and filters. Default minimum: 28 days; current windows older than 45 days are stale. Missing URL rows remain unknown. Keyword-only exports cannot attribute traffic to an article. The Bing adapter retains returned counts but does not certify API coverage or date aggregation.

The 200-impression minimum, 1% snippet-review threshold and 28-day cooldown are conservative editorial settings, not Google rules or a calibrated ranking model. Wilson intervals express sampling uncertainty only; query mix, device, country, seasonality and repeated users remain possible confounders. Average position is an aggregate, not proof every impression was on page one. [Performance report definitions](https://support.google.com/webmasters/answer/7576553)

The Sep 4 BAH-title and Gulf Breeze-description changes remain unproven experiments in ctr-applied.json. Record deployment date, baseline window, audience, primary outcome, guardrails and simultaneous changes. An overlapping rolling export cannot establish lift. After the minimum window, insufficient data means keep collecting. Correct factual errors immediately and record the interruption.

## Research and content gates

New or substantively refreshed articles dated September 6, 2026 onward, or fragments opting into editorial.version 2, require a version 2 pack in both factories. Copy content/blog/research-pack.template.json into the matching site's content directory. Record actual models. Research packs are not article prose.

Load-bearing claims need ids, source URLs, access dates, data vintages, precise locators and independent checks. Bind prose with data-claim ids and include visible source links. Uncertain or omitted claims cannot be marked for publication. Supported simple calculations are recalculated from numeric inputs, operation, result, units and input sources without executing arbitrary formulas. Complex calculations need a separately tested model and documented assumptions.

The validator establishes traceability and arithmetic, not truth. Independent review must check source meaning, eligibility, population, geography, vintage, scope and units. A ZIP aggregate is not a property quote. Illustrative scenarios are not client stories.

The score is editorial lint. Linked source domains replace source-like words. Repeating a place name or inventing first-person experience earns no extra credit. Answer-first headings, checklists and tables are useful when they fit the task; they do not guarantee ranking or citations. A nonnumeric question can receive a nonnumeric answer. Existing length floors remain house standards; Google states no preferred word count. [Helpful-content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)

Keep precise definitions, primary sources, crawlable text and schema consistent with visible content. Dates follow substantive changes. Google says its AI features require no special AI files, markup or additional optimization rules. Existing llms files are optional discovery aids, not a claimed ranking factor. [AI features and websites](https://developers.google.com/search/docs/appearance/ai-features)

## Reader paths and outcomes

Both factories render a topic-specific next-step panel: a useful tool, a relevant companion guide on the other site, and the existing inquiry form. Count contextual inbound links separately from the index, Explore grid, footer and navigation. Links should advance the reader's task. [Link guidance](https://developers.google.com/search/docs/crawling-indexing/links-crawlable)

The runtime uses the existing analytics setup. It creates no new cookies or identifiers and transmits no form values. Browser privacy signals suppress its analytics calls.

| Event | What it records | What it cannot establish |
|---|---|---|
| blog_read | 30 visible seconds and 50% article depth | Satisfaction or understanding |
| blog_next_step | A tool, companion-guide or inquiry link click | A captured client |
| share | Native sharing completed | A recipient visit |
| blog_link_copy | Canonical URL copied | Completed sharing |
| blog_inquiry_success | Explicit success from the existing form | Qualification or a closed client |

Do not count legacy inquiry_submit and blog_inquiry_success twice. Register article id, site, goal and step type as appropriate analytics dimensions. Use landing sessions and sessions with an accepted inquiry; raw event counts are not unique-session conversions. Accepted inquiries, qualified leads and converted clients are different stages. [GA4 lead definitions](https://developers.google.com/analytics/devguides/collection/ga4/reference/events#generate_lead)

The loop reads aggregate exports in content/measure/article-outcomes.json. Each row needs site, slug, source, property, sourceReference, attribution "landing-page-session", exact window metadata, landingSessions and sessionsWithAcceptedInquiry. Empty means unavailable. No contact details belong in this public repository. Cross-domain attribution and downstream clients require matched analytics/CRM evidence; a cross-link alone proves neither.

## Bounded learning

Operational safeguards can become active after a reproduced defect and regression check. Performance ideas remain hypotheses. Promotion requires two distinct, comparable, reviewed experiments in the same scope, an explicit reviewer, outcome, expiry and source evidence. The weekly planner filters unsupported active lessons. Do not promote correlations between six articles into universal writing rules.

Retain observation, proposed explanation, change, comparison and outcome separately. Record failed and inconclusive tests. Performance hypotheses cannot alter permissions, model policy, factual canon or publication settings.

## Checks

Run the Node tests in scripts/tests/blog-evidence.test.mjs, the offline weekly replay, the article score/evidence gate, both relevant factories and the existing image, link, site and entity audits. Run the production build. The optional browser check in scripts/tests/blog-browser-check.mjs requires installed Playwright and a browser; it blocks external requests and simulates form responses.

The whole-library score gate currently reports legacy editorial debt. Rebuilding those pages does not certify them under the new research-pack requirement. Gate each new or refreshed article before staging.
