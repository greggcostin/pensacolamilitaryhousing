# Fed rate article refresh, September 12, 2026

Completed the owner-requested refresh of the existing Fed article. It is staged for publication approval, not deployed. The next requested article, `what-moves-mortgage-rates`, remains queued with `notBefore: 2026-09-14`. A planner evaluation for that date selects it using the current source and intent gates. A verified material current event may still override normal selection.

## Creation and publication timing

Civilian articles run Monday and Thursday at 6:04 a.m. America/Chicago. The retained scheduler snapshot, captured September 11 at 12:05:22 UTC, lists the routine enabled and the next run at September 14, 11:05:20 UTC (6:05:20 a.m. CDT), including jitter. This is a retained schedule record, not a fresh health probe. Military articles run Tuesday around 6 a.m. Central; their separate snapshot has 6:00 cron plus jitter. No schedule was changed or created.

`content/civilian-blog/engine-config.json` still has `autoPublish: false`. Scheduled creation prepares and pushes a reviewed draft. Deployment requires Gregg's publication approval. The user's timing question was not treated as authorization to enable permanent automatic publication.

## Article and evidence

- Title: Fed Rate Hike: What It Means for Gulf Coast Homebuyers.
- Existing canonical: https://greggcostin.com/blog/fed-rate-hike-what-it-means
- Body: 1,502 words, nine question headings, six FAQs, one payment table, checklists and a worked example.
- Before score 98; first revised pass 75 exposed incomplete question provenance and source-section labeling. Those issues and scan aids were corrected. Final editorial score 100/100 and actual preview formatting 100/100. These are content checks, not ranking or factual-verification scores.
- The July 29 Federal Reserve statement, FOMC calendar, September 10 Freddie Mac PMMS, Federal Reserve policy explanation, CFPB Loan Estimate guidance and CFPB rate-lock guidance were opened during this run. Five load-bearing figures were independently checked. A separate amortization calculation checked the hypothetical payment example. See source-checks.json and the research pack.
- The policy range and next-meeting references require review by September 16; the PMMS observation by September 17. Verify them again at publication if those dates have arrived. This article does not predict a rate hike or promise refinancing.
- A new public-domain Federal Reserve building photograph was selected after viewing all six candidates across two searches. An image with a corner watermark and a dated scan were rejected. JPEG/WebP and responsive AVIF/WebP/JPEG variants are present; the actual OG card was viewed.
- Existing contextual inbound links from /buy, /sell and /resources/mortgage-preapproval were verified. They already link to this existing intent owner; no unrelated hub edits were needed.

Share hook: **Before changing your homebuying plan over a Fed headline, check the payment you can carry and the date your rate lock expires.**

## Preview and delivery gates

Complete preview: `C:/Users/gregg/pensacolamilitaryhousing/artifacts/civilian-blog-engine/2026-09-12-fed/preview`.

Article preview: http://127.0.0.1:4186/blog/fed-rate-hike-what-it-means (while the local preview server is running).

The full preview was based on GC production deployment `f4e8544d-02aa-43f2-9751-ccf68f59321d`. Its fingerprint is `e6845f55f8e1575bc193381477313997f01b1fe085c221b420c81649947e054b`. The civilian audit passed with zero findings over 322 pages. Paired entity checks passed; the retained PMH pair was used only for consistency checks. Desktop and 390-pixel mobile checks verified the image, first-child quick answer, payment table, section anchors and FAQ controls. No forms were submitted. Search indexed all 322 candidate pages.

The generic delivery preparer rejected the already transformed production contact page. Its invariant was preserved; no contact changes or gate bypass were introduced. The standard delivery libraries were applied only to the three owned HTML pages, with all unrelated production files restored byte-for-byte. The full audit then passed. Candidate changes are listed in candidate-inventory.json. This is a complete review artifact, not a publication receipt.

The main Git source and deployed generated asset sets have existing differences. The editable source changes preserve source identities and are committed separately from the complete production-based preview. Before any future deployment, reconcile with the then-current production baseline, run the delivery gates and verify the actual release. Do not deploy the shared dirty checkout wholesale. Integration.json records the narrow canonical merge and backups; unrelated shared rendered pages were preserved.

## Measurement and remaining evidence limits

The live Bing measurement run returned zero page-performance rows, six query rows and 17 traffic days, ending September 11. The trailing data contained 25 impressions and two clicks. An absent article row remains unknown and cannot establish indexing. No duplicate observation was fabricated.

The read-only Bing GetUrlInfo call for the Fed URL returned HTTP 200 with a year-one last-crawl sentinel, zero document size and no usable crawl timestamp. The homepage request returned HTTP 400 UnknownError. Earlier September 12 browser URL inspection showed the Fed URL discovered but not crawled and the domain explorer showed five indexed URLs. Current article indexing is unconfirmed; no IndexNow submission was made for this undeployed draft.

Civilian Clarity project `ydd39cyp64` was accessible in the browser. The September 5-11 cohort filtered for visits to this Fed URL contained one session and one user. Its 40 pages/session and other values are session aggregates, with internal traffic not excluded. They do not establish article-only engagement or content effectiveness. The native CSV is retained here. A dedicated callable Clarity connector was unavailable in this runtime, but no new access grant was needed for the browser check.

The verified native GSC workbook from earlier September 12 remains at `docs/civilian-blog-engine/2026-09-12/analytics/gsc-gc-2026-09-12.xlsx`. Property: https://greggcostin.com/; search type Web; selected August 14-September 10. Actual Chart rows covered August 23-September 10, with no query rows; the homepage had five impressions and zero clicks. Missing dates and article rows remain unknown. Property/window metadata and the original export are retained; a replacement export is not requested solely because the earlier report had listed it as missing.

## Retro and execution record

The ledger records the refreshed article as staged, leaves its prior publication history intact and appends this run's measurement limits. Shared retro and weekly planning were run. Outcome status remains unavailable; the undeployed revision has no measured live effect. The hypothesis is that clearer policy-versus-quote guidance and a comparable-offer checklist can support better-informed buyer inquiries. Evaluation needs at least 28 complete days after an actual deployment, comparable cohorts and reliable inquiry definitions.

Lesson L032 records the stale prior-period label caught in the research notes and the direct primary-source correction. No unsupported performance lesson was added.

Provider: Codex; model: gpt-6-astra; effort: max; selection: explicit user request, not a claimed Claude outage. Lease: ef169858-e54b-43d0-96ff-4d22dc22f4f9. Run ID: civilian-blog-engine-2026-09-12-fed. No deployment, client sending or new schedule occurred. Say **publish it** to authorize publication of the reviewed Fed refresh.
