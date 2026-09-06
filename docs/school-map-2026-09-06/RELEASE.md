# School finder and complete school guide release

Prepared September 6, 2026 from production Git baseline `dd8bc6152dbe49c4375b7a86854304233f6f808b`.

## Content and behavior

- 274 original/supplemental directory records, 264 recorded map points, 64 ZIP reference points.
- 271 canonical school pages: 208 public-school guides and 63 private-school guides. Three verified duplicate NCES pairs share a page while retaining both source records.
- 82 existing Florida report URLs retain official results and receive sourced school-specific editorial. All 66 private source identities have dated school-specific perspectives. The other public profiles interpret available directory facts, locations and state results without claiming campus visits or unsupported program expertise.
- Automatic map display, address-origin red flag, straight-line radius sorting, optional explicit shortest-road routing, separate road miles/time, and Google Maps directions.
- Unknown/virtual campuses remain list-only. Private schools do not receive invented Florida grades. Alabama public profiles point to Alabama's separate report-card system.
- All 271 pages have static hub links, canonical URLs, appropriate school/entity markup, sitemap entries and AI discovery links.

## Regeneration

Run from the release checkout or an up-to-date checkout containing this release:

```powershell
node scripts/build-school-finder.mjs
node scripts/build-all-school-pages.mjs
node scripts/build-school-report-guides.mjs
node scripts/apply-responsive-images.mjs --schools
node scripts/build-entity-graph.mjs
node scripts/audit-civilian.mjs
node scripts/audit-entity.mjs
node scripts/rollout-analytics-guard.mjs --check
```

The persistent page registry must retain published URLs. Add new identities explicitly. Research lives in the public school JSON files under `content/schools`, with record-level dates and sources. `schools-factory.mjs` remains the older 82-accountability-report factory; use the full pipeline above after changes to that factory.

## Verification

105 school check groups passed across all-page coverage, original report preservation, editorial validity, filter/data joins, private affiliation evidence, address lookup, route transport and actual client routing behavior. Civilian audit: 310 pages, zero findings. Entity and production analytics hostname checks also passed.

Browser checks include automatic map rendering, private-school filtering, Census lookup of a public school address, red comparison flag, and a real optional route showing 7.0 straight-line miles versus 7.5 road miles/about 15 minutes to Little Flower. These are test-origin results, not a commute promise. Private guide checked at 375px with no horizontal overflow.

## Production and rollback

Deploy only the committed `civilian-site` from this release. The previous successful Cloudflare production deployment is `d5f54bab-bad4-4997-8e40-8bffcc8932e7`. Its 487 deployed assets were independently checked against the Git baseline; 132 text files differed only by line-ending normalization and all other assets matched. Existing tracking configuration, homepage, contact handling and unrelated shared assets are preserved.

The earlier original blue-and-gold backup remains outside this public deploy under the main workspace's `backups/greggcostin/2026-09-06-recovery/`. It is separate from the immediate pre-release production rollback above.

Routing and tile-provider operating limits and privacy details are documented in `production-maintenance.md`.
