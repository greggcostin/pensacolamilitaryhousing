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

The operational review baseline points to this complete release. Gregg's review verification and sync schedule is weekly, Sunday at 9 a.m. America/Chicago. Review observations are dated separately from site releases.

The preceding identity release and rollback deployments remain recorded in the private release receipts. External profile edits, independent ranking proof, real CRM receipt reconciliation and permission-limited Cloudflare account settings remain separate follow-ups.
