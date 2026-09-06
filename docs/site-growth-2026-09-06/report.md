# Website, blog and Meta release review

Prepared September 6, 2026. Review branch: codex/blog-engine-evidence-loop. [Draft PR #1](https://github.com/greggcostin/pensacolamilitaryhousing/pull/1). Website changes are staged for review, not deployed. Meta settings explicitly identified as saved below were changed and verified in the live account. No ads were published and no new paid delivery was activated.

## The personal Facebook profile and the shared Pixel

Gregg's existing [personal Facebook profile](https://www.facebook.com/greggcostin/) already has professional mode enabled and displays 5.7K followers. Its Advertise flow offers new ads, boosted content and a website-visitors goal. I selected business ad account 467811675743449 in that flow; the live preview continued to identify the advertiser as Gregg Costin and recognized the shared website Pixel.

Use one business-owned dataset, **The Costin Team | Website Leads (960230270427179)**, for both websites and the relevant Facebook/Instagram campaigns. A Meta Pixel measures website actions, rather than being installed on a social profile. Distinguish the destination domain, source, placement and campaign in reporting and tagged links. Separate profile-specific Pixels are unnecessary for this setup. [Meta's website-measurement training](https://www.facebookblueprint.com/student/path/211547-set-up-and-use-conversions-api-and-pixel-ad-campaigns)

The personal profile can be the principal public Facebook presence. Keep the business Page connected for Instagram business tools and existing integrations. This does not merge the Page's followers into the profile, transfer followers or prove that all full Ads Manager campaign types can use a personal profile as their identity.

Housing was selected in the personal-profile preview. The interface then removed the follower-only and similar-to-followers options. Gender was fixed to all, age to 18-65+, and location controls required at least a 15-mile radius. The preview uses Pensacola +15 miles with no detailed interests or exclusions. No military-affiliation flag or client-list audience was used. The existing followers remain useful for organic content and familiarity; they are not a guaranteed paid audience. These restrictions were verified in the current account, alongside [Meta's explanation of Housing advertising restrictions](https://about.fb.com/news/2022/06/expanding-our-work-on-ads-fairness/).

## What is already saved in Meta

- The Page **Gregg Costin - Gulf Coast Realtor** is now connected to **@greggcostinrealtor**. Meta explicitly confirmed the connection. The connected Instagram account displayed 933 followers; the business Page displayed 247. Those figures are separate from the personal profile.
- The business Page's incorrect office ZIP **32053** was corrected to **32502**. Its bio now includes Levin Rinke Realty, both websites, the personal Facebook profile and the correct Hurlburt Field name.
- Existing website links were upgraded to HTTPS and labeled for their purpose. The brokerage property-search link was preserved.
- The Page's primary **Contact us** action now opens the tagged GreggCostin.com contact page. Its saved URL was verified by reopening the editor.
- Business information was saved as **Gregg Costin, REALTOR®**, 220 W Garden St, Pensacola, FL 32502, +1 850-266-5005 and GreggCostin.com. Legal business verification remains **Unverified**. An existing profile/Page badge does not establish business verification.
- The shared dataset is owned by the business portfolio and connected to its ad account. Gregg has **Use events dataset** access. No additional people, partners, management access, advanced matching, automatic event capture or Conversions API feed was granted.
- Both website domains were added to Meta and their verification tags were prepared in the correct homepage files. Domain verification remains pending publication.
- Meta confirmed allowlist additions for both domains. The website code further limits analytics to exact production hostnames.
- Follow Up Boss's existing Facebook Business Integration was verified active with the business Page selected for lead access. Existing publishing integrations were retained.

The old personal Pixel 2880952858970800 was not installed on either site and has no received events. Do not deploy it alongside the business dataset.

## Prepared advertising and distribution

The personal-profile PCS preview has a valid tagged destination, the headline **Pensacola PCS checklist**, useful guide-focused copy, **Learn more**, Housing classification, Pensacola +15 miles, Facebook placement and the shared Pixel. Its proposed budget is **$10 per day for 14 days, $140 displayed total**, with an end date. It remains unpublished. Dates must be refreshed before any approved launch.

The guide's existing 1200x630 card was visually inspected. Uploading it to replace the profile-cover placeholder was blocked by Chrome's file-access setting. The extension reported **Not allowed** while setting the file chooser. Enable **Allow access to file URLs** in the ChatGPT browser extension's Details, then retry the upload and inspect the placement crops. Some Reels previews also reported unsupported formats. This preview is **not launch-ready**.

The business Ads Manager contains an alternative **DRAFT | PMH PCS planning | Approval required** campaign: Leads objective, Housing category, $140 lifetime proposal, Website conversion location and the shared dataset. Its campaign and ad set are off. **Lead** is selected but inactive, because the website has not sent events. This draft still needs a final regional audience and ad creative. It is an alternative to the personal-profile test, not an additional spending authorization.

The [distribution plan](social-plan.md) contains two complete creative concepts with Facebook copy, Instagram captions, Story links and short original-video scripts: a PCS checklist and a Florida cash-to-close worksheet. Proposed tests are sequential, $140 each and $280 total only if both are later approved. Review the first test's delivery and inquiry quality before funding the second. Nothing is automatically posted, boosted or increased.

## Website fixes ready for release

- **82 school descriptions** are now complete sentences with matching social and schema descriptions. The generator no longer mechanically slices them at 165 characters.
- **12 military article schemas** now use their article photograph, while the author's portrait remains attached to the author. I also corrected template keywords inherited by BlogPosting and added a gate against recurrence. Metadata consistency does not itself imply ranking gains.
- All **six military SPA routes** have a main landmark and civilian-site cross-link in their initially returned HTML.
- The prepared civilian redesign is integrated with responsive navigation, clear buyer/seller/PCS paths, accessible inquiry dialogs, valid email checks, readable guide navigation, self-hosted fonts and stable image space.
- Both sites block GA4, Clarity, FUB and Meta on localhost, 127.0.0.1, preview hosts and other non-production origins. The civilian preview also strips production analytics loaders. Historical preview records were not deleted; the production-host filter excludes them from the inspected Clarity view.
- Optional Meta tracking is configured on the civilian site and on the military **PCS checklist** and **call-request** pages. The military privacy page exposes preferences without recording a PageView; benefits, disability, tax and divorce guides do not contain the Meta loader.
- Meta requires affirmative consent, respects Global Privacy Control, expires consent after 180 days and stops events after withdrawal, including withdrawal in another tab. The loader rejects unsafe URL parameters and, for the limited military integration, sensitive internal referrers. No form contact details are sent as Meta event parameters.
- Accepted inquiries produce one Lead event. Downloads, call/text clicks and requests for appointments remain distinct actions. A request is not reported as a confirmed appointment.
- The PCS checklist now retains the free PDF when the contact service fails and explicitly says the contact request was not delivered. HTTP errors, a success:false body and network failures no longer earn lead credit. The call page accurately describes a request that Gregg must confirm.
- The link audit now recognizes real CSS/assets instead of flagging existing files as broken and fails when a genuine broken link exists. A relevant Destin guide link resolves the remaining orphan page.

## Three substantive civilian refreshes

| Article | What the reader gets | Internal score before → after |
|---|---|---:|
| Florida closing costs | A reproducible $350,000 hypothetical purchase and $36,957.50 cash-to-close example; state charges separated from provider quotes and negotiated contract terms | 53 → 95 |
| Fed rate hike and homebuying | Dated Fed/Freddie Mac context, lender comparison and rate-lock questions, and a checked payment sensitivity table | 56 → 100 |
| Florida insurance relief | Aggregate industry estimates separated from personal quotes, newer Citizens information, and premium/deductible comparisons | 59 → 96 |

Each refresh has a version 2 claim pack with primary links, uncertainty notes and checked calculations. Research and writing used **gpt-6-astra**, as permitted by the civilian engine's self/self configuration. Original publication dates were preserved; the three substantive modifications are dated September 6. Existing licensed imagery was retained for these refreshes. Military prose and article dates were preserved during schema repairs.

These are internal editorial grades, not Google scores, rankings, traffic or conversion results. Fourteen other legacy articles have not been certified by the new claim-pack process. Source counts and passing structural checks do not certify every legacy claim.

## How the weekly routine improves

The shared planner now reads each site's actual model configuration; it does not accidentally apply the military Opus/Fable policy to civilian work. The military policy remains Opus research/Fable prose. Configured and actually used models are recorded separately.

It prioritizes sourced reader tasks, checks existing topic ownership across the two sites, preserves calculation and uncertainty evidence, connects each article to a relevant tool and inquiry path, and prepares a distinct social distribution draft. It separates search, organic social and paid social outcomes, and it does not turn internal quality grades into supposed performance wins.

Operational fixes can become active rules immediately. Performance hypotheses need comparable, reviewed experiments before becoming lessons. Missing data stays unknown, source periods must match, and recent snippet experiments retain their 28-day collection period. The new social outcomes file is empty by design because no qualified-inquiry or client cohort has been verified.

The next shared brief is **full-payment** for the military site: an existing-page refresh around BAH, mortgage payment, taxes, insurance and other ownership costs. It must verify the existing BAH affordability topic owner before writing a new URL. The three zero-source civilian gaps are resolved; this does not imply a fresh traffic opportunity was measured.

## What the data actually says

The inspected civilian Clarity view had **6 sessions unfiltered versus 5 with the production URL filter**. One preview session materially changed apparent engagement. The filtered view showed one page per session, 18% scroll depth and approximately 14 seconds active time. Its label was Last 30 days, but exact boundaries and time zone were not verified. Five sessions may include owner visits and are insufficient to judge conversion.

Only the civilian Clarity project was accessible in the inspected login. Military Clarity remains unavailable here. Semrush previously returned insufficient API units; no current keyword-growth claim was fabricated. Saved search exports inform investigation, but unverified date windows cannot establish a current controlled comparison.

Business Page Insights, August 9–September 5, showed **160 views, 22 viewers, 20 Page visits, zero content interactions and zero conversations started**. These are business-Page metrics, not personal-profile or Instagram performance. The existing old campaign was off and showed $0 spent in the selected August 7–September 5 window. Meta's setup scores and delivery forecasts are not proven returns.

## Validation

- Military production build passed.
- 31 automated checks passed for the engine/site behavior.
- 19 civilian browser checks passed, including all 121 content pages at mobile and desktop widths.
- 10 military campaign checks passed, including consent, attribution, invalid form input, network failures, accepted leads and referrer handling.
- The earlier two blog journey browser checks passed.
- Civilian audit: **121 pages, 0 findings**. Military audit: **97 source pages, 104 sitemap URLs, 103 share cards, 0 findings**. Shared entity audit: **218 pages, 0 findings**.
- Internal link audit: **0 broken links, 0 orphan pages**.
- Fresh local Lighthouse observations: military home **93, LCP 3.24s, CLS 0**; civilian home **93, LCP 3.15s, CLS 0**; civilian Buy **98, LCP 2.40s, CLS 0**.

Local Lighthouse used simulated mobile conditions and disabled production trackers. These observations are not directly comparable to the earlier live Google lab runs, and do not establish deployed improvements or field-data gains. Browser checks intercepted the contact service and Meta SDK; they created no CRM contacts, messages or genuine analytics events.

## Release and first-live checks

1. Publish the reviewed website changes, verify the homepage domain tags and finish Meta domain verification.
2. Inspect actual Meta events after consent on an ordinary production visit. Confirm no events on local previews or excluded military routes. Do not mix test activity into the conversion baseline.
3. Confirm one controlled production inquiry reaches FUB once with the correct source and stage. FUB pixel form capture was last observed ON while the forms also use the contact worker. After primary delivery is verified, disable redundant pixel form capture while preserving activity tracking. This global FUB setting was not changed in this work.
4. Complete the image upload/crop review, verify the final advertising identity, audience, Pixel, payment summary and new dates. Paid launch requires the specific budget approval; website publication does not approve advertising spend.
5. Record exact production cohorts and genuinely qualified inquiries/confirmed appointments. Review at an appropriate collection interval before treating an article or campaign as a winner.

The release hold follows civilian-blog-engine STEP 7: the default autoPublish false flow says **do NOT deploy** and instructs Gregg to say **publish it**. This combined change is kept in the existing isolated review branch so independent work in the main checkout remains untouched.
