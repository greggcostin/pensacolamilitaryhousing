# School and coastal guidance release

The school libraries shared too much surrounding prose, Gulf Shores campus locations needed current-year corrections, and the two domains needed clearer ownership of local versus PCS guidance. This release adds distinct practical material while retaining the common school facts, automatic maps, source records and approved design.

## Published behavior

- Each school hub now has its own home-search or PCS workflow. Six campus-specific pilot pairs span Escambia, Santa Rosa, Okaloosa and Baldwin counties, including public, charter, private and Christian schools.
- Gulf Shores High and Middle use their current published campus addresses. The high school's obsolete coordinates were removed because a replacement was not verified. All 274 records and 271 guides per domain remain; 263 records currently have mapped coordinates.
- The civilian Navarre guide owns a utility illustration based on the official residential Class I schedule, with tier tests, exclusions and a visible fallback. The military guide points to it and focuses on military household planning.
- The Gulf Breeze/Tiger Point civilian guide adds property comparison checks and current Soundside school-year context. Its military companion covers reporting routes, transfer timing and complete PCS costs without unsupported commute promises.
- Two existing mortgage articles received a substantive September 10 source review. Their original publication dates and approved archival photography remain. The published civilian inventory stays at five blog articles.
- The About page scopes brokerage recognition and separates the dated owner-reported MLS standing from Zillow status. Both primary domains are excluded from the legacy short-domain redirect script.
- The civilian homepage review note now matches the prior verified source date. No new public review observation or count was created for this release.

## Source ownership

Edit school pilot copy in `content/schools/audience-guidance-2026-09.json` and apply `build-school-audience.mjs`. Campus corrections are recorded in `map-public-location-updates.json`; `refresh-school-campuses.mjs` updates affected facts and comparison links. `build-gulf-breeze-guides.mjs` owns the reviewed Gulf Breeze editions and retains their approved hero pictures. The generic neighborhood factory preserves those editions.

Navarre rates and methodology live in `content/communities/navarre-cost-evidence.json`. The pure calculator module validates the schedule before enabling calculation. Inputs stay local and are not included in inquiry payloads.

## Release and validation

Source commit: `230fca998ed7beb4c2d9a9ef569c0678c530c853`.

| Site | Deployment | Assets |
|---|---|---:|
| GreggCostin.com | `3fb6d02e-7d01-4eae-990e-5f0782a4e214` | 1,932 |
| PensacolaMilitaryHousing.com | `d2da6bc9-e8d8-4e9e-81fc-384c8833932f` | 3,567 |

The complete candidate was based on freshly verified provider manifests, not the editable checkout. All 5,499 published hashes match. No existing asset was removed. Civilian, military, entity, source and school gates pass; 53,780 internal links resolve. The browser suites passed 39 integration, 32 photography/search and 20 consent/Meta checks. An in-memory review-count round trip passed without writing simulated counts to any public or source file.

`npm run build` passed. Tests covered identity contracts and all utility tiers; source review covered the refreshed articles and their calculations. Isolated browser fixtures never contacted the CRM or advertising providers.

IndexNow and Bing accepted the updated guidance URL batches. Acceptance is not indexing or ranking proof. Current mobile PageSpeed measurements establish a baseline with no available CrUX field data; further loading and military-school hero layout-shift work is identified in the private execution report.

The operational review baseline follows the latest verified complete release. Gregg's review verification and sync schedule is weekly, Sunday at 9 a.m. America/Chicago. Review observations are dated separately from site releases.

The preceding identity release and rollback deployments remain recorded in the private release receipts. External profile edits, independent ranking proof, real CRM receipt reconciliation and permission-limited Cloudflare account settings remain separate follow-ups.

## Continuity after the photo and mobile-header releases

Two separately authorized tasks subsequently published the supplied Pensacola Bay Bridge photograph and tighter mobile headers. At September 11, 03:20 UTC, independent verification matched all 5,868 current deployment assets to their complete saved snapshots. All 26 guidance URLs returned 200 with their own canonicals and retained the published main content.

| Site | Current deployment at verification | Assets |
|---|---|---:|
| GreggCostin.com | `5f782b1d-bd2a-4c19-a833-1b1e90a7c19e` | 2,300 |
| PensacolaMilitaryHousing.com | `cc286e59-3bb6-4064-ad10-2cc89b13b90e` | 3,568 |

The weekly review job now uses the complete `mobile-header-20260910` snapshot. Its configuration was read back after checking both current provider deployment IDs; verified review counts and observation dates were preserved. The automation resolves the current configured baseline and reconciles later releases before staging any count change.

Public responses include Cloudflare edge transformations, including email protection. Asset-manifest equality and public content/canonical verification are recorded separately; raw HTML response equality is not claimed. The earlier PageSpeed figures describe the exact guidance release before these subsequent photo/header changes and remain a historical baseline.
