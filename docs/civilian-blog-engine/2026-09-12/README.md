# Civilian blog publication follow-up, September 12, 2026

Provider: Codex, gpt-6-astra, max. Reason: explicit owner follow-up. Routine lease: 43d33660-4068-4835-b6f2-112c81635e4c. Prior September 10 research and staging history is retained; this follow-up rechecked the article and addresses publication, analytics evidence and the next queue items.

## Release scope

The proposed live article is /blog/home-appraisals-explained. Its source was reviewed September 12: 96/100 quality score, 99 formatting, 1,765 body words, seven FAQs, a table, checklist and worked cash-gap example. The unchanged staged photograph and newly dated OG card were visually checked. Three contextual inbound links connect the buyer transaction timeline, selling page and condo due-diligence guide.

Share hook: "If an appraisal comes in low, the useful move is not arguing about the value. It is reading the comparable sales the appraiser actually used."

The source checkout is isolated from the heavily dirty shared workspace. The delivery candidate starts from complete production copies whose provider file hashes were all verified, including the newer military flood-map release. Only the civilian files listed in candidate-inventory.json change; no files are removed and the military site is byte-preserved. A full current-source delivery pass was rejected because its older contact-page preparation did not match the newer live layout. Its partial shared-asset changes were restored, and preparation was limited to the article and blog hub. No gate was bypassed.

## Generator fixes and verification

- A genuinely missing output destination is used even with --out, so a canonical draft cannot mask a first-build failure. Quick answer is the first child of main exactly once, and first build equals rebuild byte for byte.
- Template extraction restores bundle tokens and retains styles before the first tracker. The visual check exposed missing base navigation CSS even after the fonts and experience links were restored. Both the base reset and navigation grid are now covered by the regression test.
- Discovery updates preserve destination-only routes. CreativeWork citations serialize as their actual URLs in llms-full.txt.
- All 28 targeted tests passed. The prepared candidate passed audit-civilian with zero findings on 322 pages and audit-entity on 698 pages. The standard em-dash checker passed. Desktop and 390px mobile previews showed correct type, header, responsive image and quick answer with no horizontal overflow. FAQ expansion and keyboard section-link activation worked.
- Final seal and provider/public results are recorded in quality-gates.json, deployment.json, production-verified/ and public-verification.json when publication completes. Those receipts determine publication status.

## Analytics evidence

Civilian Clarity is available in the existing signed-in browser under project ydd39cyp64. The military-bound connector was not rebound and no permissions or credentials were expanded. The retained CSV covers September 5-11 in America/Chicago, filtered to sessions with a visited URL starting https://greggcostin.com/: 129 sessions, 48 bot sessions excluded, 86 unique users, 2.6 pages per session and 34.06% average scroll depth. Internal traffic exclusion was not verified, and local referrers appeared; these are not organic-only or qualified-conversion counts.

Bing Site Explorer's Indexed URLs filter reports five indexed URLs. URL inspection confirms the homepage is indexed, fetch succeeded, and crawling/indexing are allowed. The blog hub and the two rate articles are discovered but not crawled. Their API year-one date sentinel is missing crawl data, not a historical crawl date. URL inspection and Site Explorer show different crawl timestamps; both surfaces are retained. The two-row Site Explorer CSV contains top-level folders, not a five-URL enumeration. Zero page-performance rows are not evidence that the domain is unindexed. The separate Bing traffic API returned 25 impressions and two clicks in its trailing bin through September 11; completeness is not established.

The full native GSC workbook is retained as analytics/gsc-gc-2026-09-12.xlsx, with the original [Google Sheets export](https://docs.google.com/spreadsheets/d/1uLBVx1mQCyGL1KntoUx1bFp77EnsdSq3OYtlfht8JV8/edit). Property: https://greggcostin.com/ (URL prefix). Web search; selected August 14-September 10, 2026, no added query/page/country/device filters. The workbook contains five impressions, zero clicks, 0% CTR and average position 6.6, with one homepage row and no disclosed query rows. Chart contains only August 23-September 10 (19 days). Source-window metadata therefore marks the selected 28-day window incomplete. Missing dates and queries remain unknown. Direct Chrome CSV/XLSX downloads were blocked; the authorized native Google Sheets export and Drive connector supplied the workbook.

See analytics/verified-access.json, the three raw exports, normalized GSC Pages/Queries under docs/seo-baselines, and content/measure/source-windows.json. These replace the old blanket request for Clarity access, indexing proof and a GSC export. Future runs should use the verified browser fallback if the connector still selects the military project.

## Next work

1. fed-rate-hike-what-it-means: refresh the existing URL first. Verify the latest official FOMC and Freddie Mac releases; the historical slug is not evidence of a current hike.
2. what-moves-mortgage-rates: refresh its existing URL second, focused on mortgage pricing drivers, like-for-like quote comparison and rate locks.

Both are explicit owner requests, not inferred search demand. Planner priority now honors requestedOrder ahead of generated refresh scores while preserving source/timing/hold/intent gates and material verified current-event overrides. The mortgage article's overlap with the blog listing is documented as a listing relationship, and the Fed/current-decision distinction is recorded. Normal draft and publication gates remain in force for both future refreshes.

Operational lessons L030 and L031 record the reproduced CSS extraction defect and the difference between selected GSC dates and actual export coverage. They make no ranking or conversion claim.
