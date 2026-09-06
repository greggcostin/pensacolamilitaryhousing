# Blog scoring, live SEO and tracking follow-up

> Historical baseline from before the fixes. See [the completed website, article and Meta release review](../site-growth-2026-09-06/report.md) for current changes and remaining publication checks. The observations below retain their original scope and timing.

Checked September 6, 2026. This report separates the internal writing rubric, the published website code, observed dashboard data, and unpublished work. The accompanying evidence.json contains the measured results and limitations.

## What the two scoring changes actually mean

Some articles received more internal points before the rubric changed. This does not establish that they had better search rankings, engagement, inquiries, or revenue. The score is a checklist implemented in the repository, not a score assigned by Google or a measured conversion rate.

The earlier evidence component gave credit for source-like phrases, dates, and a Sources heading. A sentence could mention a government agency without linking to its evidence and still earn points. The revised component checks real external links. New/substantively refreshed content also has a separate claim-pack gate, with claim/source traceability, uncertainty handling and calculation checks.

| Civilian article | Earlier evidence points /20 | External source domains in article | Revised evidence points /20 | Earlier total /100 | Revised total /100 |
|---|---:|---:|---:|---:|---:|
| Closing costs | 9.9 | 0 | 0 | 63 | 53 |
| Fed rate hike | 16.4 | 0 | 0 | 68 | 56 |
| Insurance relief | 19.0 | 0 | 0 | 74 | 59 |

The article fragments were unchanged in this replay. Multiple rubric definitions changed, so the total-score differences cannot all be attributed to the evidence rule. The military articles' average went from 81.3 to 85.1 and the civilian average from 67.6 to 61.2 under the new definitions. Neither is a measured performance change.

The earlier table's phrase "First-person anecdotes" was too broad. The detector awarded ONE point simply for phrases such as "we would," "we have," or "We walk." Three civilian articles matched; no military fragment matched. In the property-tax guide, the phrase was "We walk through eligibility..." pointing to another guide, not a first-hand anecdote. The feedback removes this automatic bonus; it does not remove genuine experience from articles or establish that experience hurts SEO.

Real case studies, documented observations and useful original calculations remain valuable editorial material. No invented anecdote is needed to earn a grade. The revised linked-domain count is also only a heuristic: several irrelevant links cannot establish truth. The important gate is whether each important claim is supported by the linked source and independently checked. None of the 17 legacy articles has yet been certified by the new claim-pack process.

## Which site is stronger

The military site is the stronger current search-content property: it has substantially deeper BAH, VA-loan, PCS, base and relocation coverage, 12 blog articles, and more source-linked blog material. The civilian site has a cleaner, more consistent static HTML structure and is the appropriate broader team/brand hub. Its 121 sitemap pages include 82 school pages, so the larger URL count does not represent 121 distinct buyer/seller guides.

The saved September 4 Search Console exports contained 179 clicks and 27,118 page impressions on military page rows, versus zero clicks and two impressions on the single civilian home-page row. The exact export windows/filters are unverified. These files support historical visibility differences; they are not a controlled current-period comparison, a complete current indexing inventory, or proof of higher conversion.

| Live check | Military | Civilian/team |
|---|---:|---:|
| Sitemap HTML pages fetched successfully | 102 / 102 | 121 / 121 |
| Blog articles | 12 | 5 |
| Unique titles and descriptions | All checked pages | All checked pages |
| One H1 | All checked pages | All checked pages |
| Matching self-canonical | All checked pages | All checked pages |
| Parseable JSON-LD | All checked pages | All checked pages |
| Required inspected OG/Twitter fields present | All checked pages | All checked pages |
| Content-image alt attributes present | All checked pages | All checked pages |
| Explicit main element in returned HTML | 96 / 102 | 121 / 121 |
| Link to the other site in returned HTML | 97 / 102 | 121 / 121 |
| FUB, GA4 and Clarity code present | All checked pages | All checked pages |
| Live Meta pixel or new local Meta loader found | None | None |

Both sites returned their robots.txt, sitemap and llms.txt successfully, and both returned an actual 404 for the deliberately missing URL. No inspected sitemap HTML page had noindex, duplicate title/description, malformed JSON-LD or duplicate HTML IDs. This is a source-level check, not complete HTML conformance validation, Google's Rich Results Test, or proof that Google indexed every page.

The six military exceptions are the SPA routes: home, about, communities, contact, mortgage-calculators and pcs-guide. Their returned HTML has useful pre-rendered text and an H1 but wraps it in divs without a main landmark. Five also lack the civilian link in that returned HTML; React can add a link later. These are concrete semantic and crawlable-link opportunities, not evidence of an indexing penalty.

## JSON-LD and remaining technical issues

JSON-LD is the JSON block inside the HTML that describes the page's entities and content. Both sites share stable Person, RealEstateAgent and brokerage identifiers. The civilian site also uses Article for its blogs, AboutPage for the team, ContactPage, BreadcrumbList and School on all 82 school pages. This is a substantial existing foundation. More schema types or fields are not automatically better; accurate visible content and the appropriate entity relationships matter. [Google's structured-data introduction](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)

Specific findings:

1. **All 82 civilian school meta descriptions are mechanically cut at 165 characters.** Several end mid-word, including the Gulf Breeze High page ending "how to eva". The same cut text appears in that page's WebPage schema description. The source is scripts/schools-factory.mjs:57. Replace character slicing with a complete, concise description.
2. **All 12 military BlogPosting image fields point to Gregg's portrait.** The pages already have relevant article figures; for example, the Navarre article has pier and sound photographs. Keep the portrait attached to the author entity and use the representative article image in BlogPosting.image. The five civilian articles already reference distinct article images, all of which returned HTTP 200. [Google's Article guidance](https://developers.google.com/search/docs/appearance/structured-data/article)
3. **Military SPA shells need a main landmark and consistent server-returned cross-site links.** Preserve their current useful pre-rendered copy and add these improvements in the shared route generator.
4. **FAQ markup must not be treated as a current Google rich-result advantage.** Google's current changelog says FAQ rich results stopped appearing May 7, 2026, and their documentation was removed in June. Keep useful reader questions; do not justify mandatory FAQ counts with promised FAQ rich results. Google also states that llms.txt does not affect its visibility/rankings. It can remain useful for other systems. [Google Search documentation updates](https://developers.google.com/search/updates)
5. **Check mobile speed independently of writing quality.** The latest runs below show remaining performance work. Adding more tracking should be evaluated for loading cost as well as usefulness.

| Fresh mobile PageSpeed run | Lab performance /100 | Largest Contentful Paint | Layout shift |
|---|---:|---:|---:|
| Military home | 65 | 6.7 seconds | 0 |
| Military BAH rates | 92 | 2.7 seconds | 0.01 |
| Civilian home | 60 | 4.4 seconds | 0 |
| Civilian Buy | 79 | 2.7 seconds | 0.217 |

These are individual synthetic runs, separate from the writing score. They vary between runs. None of these URLs/origins returned sufficient Chrome field data, so this does not establish a sitewide Core Web Vitals winner or an improvement from an unpublished redesign.

## Clarity: live access and the effect of preview traffic

Chrome was already signed in to Clarity. Its accessible project list contains only greggcostin.com. The military project's dashboard has not been read in this follow-up; a request to open that project in the appropriate login is pending.

The civilian dashboard's "Last 30 days" view had only six tracked sessions. The project was added recently; selecting 30 days does not create 30 days of history. Its exact start/end/timezone were not displayed/verified.

| Civilian Clarity metric | Unfiltered | Visited URL starts with https://greggcostin.com/ |
|---|---:|---:|
| Sessions | 6 | 5 |
| Pages per session | 3.83 | 1 |
| Average scroll depth | 58.04% | 18% |
| Average active time | About 4 minutes | 14 seconds |
| Dead-click sessions | 1 | 0 |
| Quick-back sessions | 1 | 0 |

The unfiltered view included http://127.0.0.1 pages, including a local blog article and local Buy, FAQ, neighborhood, resources and schools pages. A single local-preview session substantially changed the apparent engagement picture. The filtered view showed only the published homepage; smart events had no data and no funnel was configured.

Five production-hostname sessions are too few to judge content or conversion. They may still include owner/testing visits. They must not be called five independent prospective clients. The Clarity observations were captured before this follow-up's PageSpeed runs.

Priority: prevent local/preview pages from sending production analytics, and report production hostname and relevant traffic cohorts consistently. Use one confirmed-inquiry event for the primary conversion total, then connect it to qualified appointments/clients through actual downstream evidence.

## FUB: already installed, with a configuration issue to review

The live crawl found the same WT-ZZMZHBMI tracker on all 223 checked pages. The authenticated FUB Pixel Tracking settings independently confirmed installed activity on greggcostin.com, pensacolamilitaryhousing.com and 127.0.0.1.

**Enable form capture and creating new leads in FUB is currently ON.** The site forms already POST to the contact worker. FUB's settings and documentation recommend disabling pixel form capture when leads already arrive through an API or email integration. This is a concrete risk of duplicate or inconsistent intake, not proof that a duplicate record has occurred. [FUB installation guidance](https://help.followupboss.com/hc/en-us/articles/360049188574-Installing-the-Pixel)

Recommended sequence: verify the worker remains the intended primary intake path with an approved controlled delivery check, confirm one CRM record/source/stage, then turn off redundant pixel form capture while preserving activity tracking. Review the call-to-action widget separately. No settings were changed and no test inquiry was sent in this audit.

FUB can use one team pixel across multiple domains. Identifying a lead depends on an eligible identification event, such as registration or a tracked FUB email click; it is not a way to identify every anonymous visitor. [FUB Pixel overview](https://help.followupboss.com/hc/en-us/articles/360037775174-Follow-Up-Boss-Pixel-overview)

## Facebook and Instagram

Use the Meta Pixel website integration for Facebook/Instagram advertising measurement. Separate Facebook and Instagram website snippets are not required. A pixel measures and helps optimize advertising/eligible remarketing; installing it does not itself create organic search traffic or reveal every visitor's identity. [Meta's pixel and Conversions API training](https://www.facebookblueprint.com/student/catalog/list?category_ids%255B4522%255D=4522&locale=en&page=13)

The separate civilian-site work already contains a local integration in civilian-site/assets/costin-meta.js and a config with enabled:false and an empty pixelId. Neither the new loader nor a Meta base pixel appeared on any live sitemap page checked. This follow-up did not independently verify whether a Meta business portfolio or dataset already exists.

Finish the existing integration with the actual owner-controlled website Pixel ID, its consent and policy configuration, and Events Manager verification. PageView is a visit; Contact is contact intent; Lead should fire once only on accepted inquiry. Keep account settings, advanced matching, automated event capture and any later server-side events consistent with the approved data flow. No ad account, audience, campaign, budget, pixel or external permission was created or changed here.

## Recommended order

1. Clean up production-vs-preview measurement and verify the FUB intake/capture configuration.
2. Review and release the already-prepared blog and civilian-site work as their respective changes; neither is currently live.
3. Refresh the three civilian articles' source support, starting with closing costs; retain the stronger military topic coverage.
4. Repair school descriptions, military article-image schema and SPA shell links/landmarks, and address measured mobile performance.
5. Activate the existing Meta integration with the real account details and verify accepted-inquiry tracking. Use observed qualified-client outcomes to decide what content deserves more investment.

This follow-up changed only local audit artifacts. It did not deploy either site, alter tracking settings, edit article prose, or send messages to clients.
