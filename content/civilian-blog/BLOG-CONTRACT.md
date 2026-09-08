# Civilian Blog Contract (greggcostin.com/blog)

Version 2 applies to every new post or substantive refresh dated September 8, 2026 or later. Read `EDITORIAL-PLAYBOOK.md`, `editorial-policy.json` and `MEASUREMENT.md`. The audience is civilian buyers, sellers, owners and investors in the Florida Panhandle and coastal Alabama. Define one primary reader and one useful decision for each article. Keep the existing canonical URL when refreshing the same intent.

A post is `content/civilian-blog/<slug>.fragment.html`: a `<!--PAGE {json} PAGE-->` header followed by body HTML. The factory builds the page, blog index, sitemap entry, llms section and OG card. Draft-first remains binding: `autoPublish=false` means stage the built work for Gregg's approval, with no deployment.

## PAGE fields

- `title`: accurate SEO title, at most 65 characters. Use the primary phrase naturally. Include a number only when useful and supported.
- `description`: 120-165 characters, describing the actual answer. Also include `slug`, `h1`, `lead`, `keywords` and `targetKeywords` (2-5 phrases, primary first).
- `datePublished`: immutable after publication. `dateModified` changes only with substantive content changes. Dates must not be in the future.
- `editorialVersion:2`, a useful `category`, and `editorial:{version:2,evidenceFile,pillar,readerTask,originalValue,conversionGoal}`. Use the policy's pillar identifiers.
- `figure:{src,webp,alt,caption,width,height}`: a newly fetched, visually reviewed and licensed image under `/images/`, with the file in `civilian-site/images/`. Record the source and credit. Generate responsive variants with the existing scripts.
- `quickAnswer`: 2-4 dated sentences, fewer than 85 words, restating a supported figure from the page and its named source. It must work as a useful answer without promising the reader a quote or outcome.
- `takeaways`: 3-5 distinct practical takeaways. `shareHook`: one natural sentence a reader could use when forwarding the piece.
- `faqs`: at least 6 useful reader questions, with 40-95 word answers. Visible answers and FAQPage schema must match. Questions need honest provenance in the research brief; do not label invented questions People Also Ask.
- `perishables:[{claim,expires,source}]`: every time-sensitive figure or consequential dated rule. Mirror the claim ID, actual source URL and review deadline in the research record. Review deadlines are not automatically renewed.
- Optional `ogTitleLines`: one or two short lines. Optional `journey:{goal,prompt,tool,toolLabel,bridge,bridgeLabel}`: useful first-party next steps with valid existing destinations. Use one primary inquiry path.

## Research and calculation record

Create `research/<slug>.json` before writing and complete it with the final review afterward. It must satisfy both the shared article-evidence gate and the civilian editorial validator. Follow the version 2 mortgage article's metadata structure, not its market figures.

Open primary sources this session. Record actual publisher, title, URL, checked date, reporting/effective date, geography, property type and scope. Exact article passages identify their source IDs. Mark consequential paragraphs, list items and table rows with `data-claim="<id>"`. A search snippet, source-like phrase or domain name is not verification.

Independently verify at least five load-bearing claims or calculations. Calculations record numeric inputs, source or hypothetical provenance, operation, output, units and tolerance. Clearly label illustrative offers and scenarios. A method source does not make hypothetical inputs an available lender offer. Reconcile conflicting figures and identify exceptions. Hold unsupported legal or tax interpretations for an appropriate professional; do not invent professional approval.

The final review covers facts, calculations, source reading, scope, counterarguments and human voice. Record the actual provider/model and concrete findings. Seal the content and evidence hashes only after review. Any later change requires review again. The hashes protect consistency; they cannot prove source truth.

## Writing and hard gates

- No em dashes, en dashes or emojis in prose, metadata or FAQs. No invented clients, experience, reviews, urgency or guaranteed results. Correct a third party's error without naming the party unless Gregg authorizes otherwise.
- At least 1,100 body words, usually no more than the configured 1,800-word target. Do not pad a topic to meet the floor. Prefer paragraphs under 80 words; never exceed 110.
- Question-shaped H2s with a direct answer first. One useful table, one checklist and one worked example. Use varied sentences and natural team judgment rather than canned introductions or repetitive summaries.
- At least 8 unique useful links across primary sources, civilian buying/selling/resource pages and at least one sibling article. At most one relevant military guide; no BAH, PCS or VA framing in the article. Preserve the existing cross-site navigation/footer.
- At least two real local applications documented against actual passages. Repeated town names do not count. National figures need a supported local decision, not an invented local statistic.
- Accurate title, description, canonical, social metadata, BlogPosting and entity references. Match visible publication/modification dates to structured data and the changed URL's sitemap lastmod. Do not fabricate stars, awards, reviews or special AI schema.
- All evidence and voice findings must be resolved. An old publication date does not exempt a newly refreshed article from current requirements.

## Verification and staging

`node scripts/score-post.mjs <slug> --site gc --gate` must pass at 80 or higher; aim for 90 without changing facts to earn points. The six scored areas are structure, evidence, local application, SEO, answer clarity and useful shareable material. Version 2 evidence is based on the claim/source record, not town density or source-cue counting. This is editorial QA, not a ranking forecast.

Build with `node scripts/civilian-blog-factory.mjs <slug>`. For an isolated complete preview, use `--out <preview-root> --bundle` with a complete site copy. Run `node scripts/analyze-formatting.mjs --file <built-page> --gate` and require 90 or higher. The full formatting report remains part of the routine.

`node scripts/audit-civilian.mjs` must report zero findings. Run the entity audit and em-dash check. Inspect the actual desktop/mobile page, FAQ behavior, source and section links, responsive table, imagery and OG card. Preview serving omits production analytics and blocks submissions. Preserve existing inquiry acceptance, privacy and analytics protections.

Add 2-3 contextual inbound links from relevant existing hubs when needed, using the retro's plan and real reader relevance. An index or footer link does not replace a useful contextual link.

Use an isolated checkout when the shared checkout contains other unfinished work. Reconcile against current main, keep other work intact, commit only owned files, and push the staged work without deploying. Do not bypass a gate or stop at an unbuilt fragment when an isolated build can complete it. Publication requires Gregg's approval under the current setting. Submit exact changed live URLs only after deployment and retain submission receipts.

## Scheduled loop

One article or substantive refresh per run, Monday and Thursday at 6:04am. Read active lessons and repository status first. Measure live. A verified consequential current event outranks a refresh with priority 60+, which outranks observed demand and then a runnable editorial proposal. Check the radar and both domains' existing and unpublished content before writing.

After the work, run `node scripts/blog-retro.mjs --site gc` and `node scripts/blog-weekly-plan.mjs`. Preserve the other site's shared queue entries during a single-site run. Record sources, actual model, decisions, scores, image review, publication state, one specific hypothesis and measurement gaps in the ledger. Add only 1-3 evidenced operational lessons; performance conclusions need comparable observations and the shared evidence thresholds. Prepared work has no measured live effect.
