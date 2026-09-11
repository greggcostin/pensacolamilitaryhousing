# Earlier school loading and canonical hosting aliases

The military navigation received its Search-button styles late in the document, so the button could resize after the first paint. Some school pages also requested Google fonts despite already containing the licensed local fonts. This release makes the existing styles and assets available earlier and removes redundant font hints.

## Published changes

- Move the existing military Pagefind stylesheet and its complete theme rules together into the head on 369 pages. Their CSS contents remain unchanged.
- Remove redundant Google font loading on 272 military school pages only after verifying both local font files and the local font declarations. Unrelated Google font families are retained by the build helper.
- Preload the military school hub's existing scene and local fonts. The scene comes from the page's current body declaration and must exist locally.
- Remove 612 duplicate font preload tags across 306 civilian pages. This is HTML cleanup; browsers may already have combined the duplicate requests.
- Retain the latest approved compact military header, active-page underline, civilian mobile contact controls, photographs, complete school directory and automatic maps.

The helper is part of both military build phases and civilian delivery preparation. The complete production candidate was constructed from verified production snapshots, not from the editable checkout.

## Deployment evidence

| Site | Previous deployment | New deployment | Assets |
|---|---|---|---:|
| PensacolaMilitaryHousing.com | `37e23d10-368d-4ff0-bb40-0206c2f69538` | `fb6e9544-292f-40f5-a2a9-77736d79d5e6` | 3,570 |
| GreggCostin.com | `33d15c1e-707a-46c5-9225-981af913803c` | `358612c7-5e2c-4e8b-a870-97f0358e80f7` | 2,300 |

All 5,870 provider asset hashes matched the sealed candidate. Ten selected live routes returned 200 with their own canonicals. The scope comparison covered all 697 HTML pages: 675 changed, no asset was removed, and 11,905 script blocks, 2,222 image/picture records and 1,793 style blocks were retained. Visible page content and controls were preserved.

Civilian, military, shared-entity and article-source audits passed. All 53,779 checked internal links resolved. Browser checks passed: 39 integration, 32 photography/search, 20 consent/Meta, and three controlled loading traces. Both maps started automatically. Synthetic form checks never contacted a CRM or advertising provider. The review-count rehearsal ran entirely in memory.

`npm run build` passed. The civilian build hit a filesystem write error on the existing source stylesheet manifest; that file's permissions were not changed. The full civilian delivery and search build then passed in a fresh writable copy, followed by a clean 321-page audit. The maintained source received only the intended loading transformation, and both source audits passed after incidental build output was removed.

## Measured scope

In the same isolated mobile fixture (390px, 150ms latency, 1.6Mbps, 4x CPU slowdown), military school-hub LCP moved from 2.732 seconds to 2.240 seconds. The remaining Search-button layout shift moved from 0.00011 to zero. The separately published compact header had already eliminated the earlier larger page shift. Civilian school and team fixtures had zero shifts before and after. External services were blocked, so these are controlled development measurements, not field data.

A post-publication Google PageSpeed run reported military school-hub mobile performance 60, LCP 6.3 seconds and CLS 0; desktop performance 93, LCP 0.9 seconds and CLS 0. No CrUX field data were available. Mobile LCP remains an improvement opportunity; these results do not establish ranking or lead gains.

## Canonical aliases and crawler settings

Cloudflare account Bulk Redirects now contain exactly two enabled 301 redirects:

- `greggcostin.pages.dev` to `https://greggcostin.com`
- `pensacolamilitaryhousing.pages.dev` to `https://pensacolamilitaryhousing.com`

Both preserve paths and query strings and exclude subdomains. Live HTTP readback confirmed both redirects and confirmed that individual deployment previews still returned 200. The list is `costin_stable_pages_aliases`; the rule is `Costin stable Pages aliases`.

Authenticated AI Crawl Control inspection found all 32 individual crawler-block switches off on each domain, including the search and user agents for OpenAI, Google, Bing, Perplexity and Anthropic. No crawler setting was changed. This inspection does not cover every WAF, rate-limit or bot-management rule.

## Continued operation

The complete shared snapshot is `C:/Users/gregg/pensacolamilitaryhousing/.coast-release/geo-loading-20260910`. Its inventory and current provider deployment IDs were verified before advancing the review job's baseline. Review verification and synchronization remain weekly on Sunday at 9 a.m. America/Chicago. Counts and the actual September 9 review observation dates were preserved.

Detailed receipts, comparisons, browser traces and provider manifests are in the private `docs/geo-execution-2026-09-10/enhancement-pass/` directory. The prior snapshots remain available for rollback.

## External professional profile

The existing Google session also enabled the authorized Linktree updates. The public profile now leads with GreggCostin.com, uses Contact Gregg for the civilian contact page, and labels the retained specialist link Military PCS and housing guides. Its bio, search metadata and public About this account text explain the broader Gulf Coast business and each site's purpose. The website icon was updated through its editor. Existing social identities, booking, contact-card and review links were retained. Public rendering confirmed the new text and three website buttons; Linktree search-result propagation is not claimed.
