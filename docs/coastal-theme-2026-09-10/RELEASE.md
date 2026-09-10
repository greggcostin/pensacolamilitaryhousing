# GreggCostin.com coastal theme release

Gregg approved publication and the source push on September 10, 2026. The refreshed civilian site is live at https://greggcostin.com/.

## Delivered design

- A consistent coastal palette, readable typography, generous spacing and responsive layouts across all 320 public content pages and the 404 page.
- Individual Search Homes photo cards for Milton, Destin, Niceville, Crestview and Mary Esther, bringing the page to 13 city cards.
- Bold titles on all 15 Neighborhoods cards.
- Prominent, centered Google Reviews and Zillow Reviews headings inside their badges.
- A warm-white header search field with dark text, a visible placeholder and gold focus treatment.
- A vibrant Palafox Street night photograph on Contact, with responsive image variants and Todd Van Hoosear's CC BY-SA 2.0 attribution.

Canonical URLs, metadata, structured data, dated answers, forms, original content, tracking scripts and cross-site links remain preserved. The school map still loads automatically on page load.

## Published release and verification

- Deployment: `2c692b4b-9b38-44cc-906f-5fde440975e3`.
- Immutable deployment URL: https://2c692b4b.greggcostin.pages.dev.
- Published: September 10, 2026, 19:56:40 UTC; provider verification completed at 19:56:42 UTC.
- Candidate SHA-256: `652a3ecd58da32409e90efa6df7c8c892e64bf5603b9d8edc124e7eb0b6316bb`.
- Theme version: `7ba0ce283ad2`.
- All 1,829 public assets match the sealed provider-hash inventory.
- The civilian candidate audit passed with 320 pages and zero findings; all 1,278 original JSON-LD blocks and 327 form instances were preserved.
- Public HTTP verification passed for 320 content pages and nine selected assets. All pages retained their expected canonical and theme, and JSON-LD parsed. An unknown path returned HTTP 404. Exact HTML comparisons reverse only the observed Cloudflare email-protection transformation.
- Nine public browser checks passed, including mobile review badges, all requested city cards, readable search with results, contact imagery and automatic school-map initialization at scroll position zero.
- Previous civilian deployment for rollback: `91710993-cfea-4208-baa2-df0742a0ba25`.
- Military deployment `8ba5563f-e951-4dcd-99ec-e9882077027c` and its provider inventory are unchanged.

The checked-in JSON receipts document the sealed candidate and public verification. Search ranking, AI citation and conversion improvements are not inferred from these checks.

## Source integration

The source changes were prepared in an isolated checkout based on GitHub main commit `4d88e2c2949534fe9cc151f046f9781fc6e53c73`. The shared delivery script reapplies the theme and requested refinements on future builds. Theme and header-search CSS templates now explicitly use LF line endings so generated asset hashes remain stable on Windows.

GitHub main already contained a newer, unpublished appraisal article and related assets. Those source files are preserved and receive the shared theme, but they were not added to this approved production release. Consequently the integrated source audit covers 321 content pages and passed with zero findings, while the published release covers 320. Unrelated changes in the original working directory were not staged.

`node scripts/prepare-civilian-delivery.mjs --root civilian-site` completed, and `node scripts/audit-civilian.mjs --root civilian-site` passed after integration. The separate full `npm run build:civilian` command stops in its existing source-freshness gate: the `pmms` claim in `fed-rate-hike-what-it-means` and the `pmms-current` and `pmms-prior` claims in `what-moves-mortgage-rates` have expired review deadlines. This design release does not change those financial claims or extend their review dates. They require substantive source review before a future full editorial build.
