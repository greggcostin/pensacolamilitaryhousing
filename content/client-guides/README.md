# Costin Team client guide library

September 8, 2026 chronological edition: 23 illustrated guides, 457 PDF pages. The full collection includes printable PDFs, portable HTML companions and three editable financial worksheets. Original factual review dates and the September 7 base-directory dates remain attached to their sources; this edition does not claim every source was rereviewed.

The editorial-6 presentation assigns a different luxury beachfront home to each of the 12 civilian guides and a distinct local military photograph to each of the 11 VA/PCS guides. Titles sit below the clean photographs. Every guide ends with a personal brand advertisement built around Gregg's preferred courthouse-steps portrait, verified public-profile credentials and recognition, military background, both websites and clickable social destinations. Original high-resolution Costin Team and Levin Rinke Realty logos appear on every cover/final page. No photo credits appear in the client documents; all selected imagery permits use without a visible credit. The internal license ledger and `qa/media-manifest.json` preserve provenance; neither is part of the client download. The portable collection and standalone worksheets also carry the actual logos. Educational sources, dates, tables, calculations and checklists are preserved.

The first interior page shows the complete transaction roadmap. Chapters follow explicit stages, explain client and professional responsibilities, and use actual decision branches, loan-product routes, handoff diagrams, a conceptual house illustration and monetary waterfalls. The seller path develops walkthroughs, estimates, a full CMA methodology, net scenarios and marketing before negotiation and closing.

## Content and evidence

- `collection.mjs`: authoritative ordered collection for PDF/portable HTML generation; original reference modules remain unchanged.
- `journey-chapters.mjs`, `journey-blocks.mjs`, `journey-sources.mjs`: stage explanations, semantic visual formats and new dated references.
- `investment.mjs`: dedicated investment purchase and operating guide.
- `core.mjs`: preapproval, buyer transaction, mortgage process.
- `seller.mjs`: seller transaction and seller net proceeds.
- `coastal.mjs`: property taxes, Florida/Alabama ownership costs, beach leasehold, condos, insurance/flood, inspections.
- `military.mjs`: VA loan insider reference and VA assumptions.
- `pcs.mjs`: nine installation-specific relocation guides.
- `sources.mjs`: primary URLs and actual review dates.
- `art-direction.mjs`, `covers.mjs` and `DESIGN-CONTRACT.md`: real photography, distinct reviewed cover assignments, licensing and the illustrated editorial standard. Cover uniqueness, appropriate subjects and clean framing are build/check requirements. No guide borrows another guide's cover or repeats a photograph within its own pages.
- `scripts/client-guide-layout.mjs` and `scripts/client-guide-design.css`: reproducible photo, chart, timeline, table and worksheet layouts.
- `bah-2026.json`: official DTMO data, source URL and checksum. FL056 is Eglin AFB, FL064 is Pensacola, FL063 is Panama City. Do not restore the obsolete FL023 label.
- `editorial-priorities.md`: proposed distribution and refresh work. Suggestions are not measured search demand.

Examples are hypothetical and labeled. Current mortgage quotes, property-specific premiums, market statistics, client outcomes and live gate travel times are not fabricated. Review a source before changing its review date. A working link alone does not verify its claims. Check consequential policy changes whenever relevant, even before the scheduled review date.

## Rebuild and verify

Run from the repository root:

```powershell
node scripts/client-guide-freshness.mjs
node scripts/build-client-guides.mjs
node scripts/build-client-worksheets.mjs
node scripts/check-client-guide-design.mjs
node scripts/check-client-guide-journeys.mjs
node scripts/check-client-guide-directories.mjs
& 'C:/Users/gregg/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe' scripts/check-client-guide-directory-pdfs.py
& 'C:/Users/gregg/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe' scripts/audit-client-guides.py
```

After inspecting every current PDF contact sheet and representative full-size/mobile layouts, record the actual visual-review hashes and run the package gate. PDF staging alone uses `node scripts/stage-client-guide-pdfs.mjs`. The following commands also change website HTML and belong to a separately scoped site release:

```powershell
node scripts/stage-client-guide-pages.mjs
node scripts/generate-responsive-images.mjs
node scripts/apply-responsive-images.mjs
node scripts/build-entity-graph.mjs
node scripts/audit-civilian.mjs
node scripts/audit-military.mjs
node scripts/audit-entity.mjs
node scripts/audit-links.mjs
node scripts/check-civilian-redesign-preservation.mjs
```

The full build writes `artifacts/client-library/index.html`, `pdf/`, `html/`, `assets/` and `build-report.json`. A build limited with --only writes a separate preview report and preserves the full catalog. Finish with a full build when the shared design or facts change. The PDF audit creates every guide's page contact sheet in `qa/`. Inspect every sheet after a content/layout change. The build rejects overflow, missing images, mismatched table headings, and loss of any source string or table value. The PDF audit checks page counts, selectable text, tags, empty pages and prohibited punctuation. The design check verifies all 23 guides at 375px and the actual contents-page numbers. Tagged output is not a claim of complete PDF/UA certification.

The PDF-only staging script copies the current 12 civilian PDFs into `civilian-site/downloads/guides/` and 11 military PDFs into `public/downloads/guides/`, verifying each against its reviewed hash. The older `stage-client-guide-pages.mjs` generates the original website companion pages from the reference modules; it does not yet use the chronological collection. Update that site generator to consume the new collection before a future HTML release. The current portable HTML companions already contain the complete chronological edition. Military PDFs use the military domain in the civilian website collection; coordinate both deployments and verify destinations before public sharing.

After running the local worksheet browser check (`node scripts/check-client-guide-tools.mjs`, preview default 4180), inspect every PDF contact sheet and record the exact PDF hashes in `qa/visual-review.json`. Run `scripts/package-client-guides.py` with Python. It checks the review hashes and ZIP integrity.

The collection ZIP contains the index, HTML, PDF, worksheets and the exact assets listed in the current build report. Old photo assets left from prior editions are excluded. It can be unzipped and used without publishing. Review/outreach drafts and the case-study workbook are separate internal documents, not invented client success stories.

## Publication and learning

Preserve existing redesign work and publication approvals. Do not stage or commit unrelated changes from the shared working tree. After authorized publication, run `node scripts/verify-client-guide-launch.mjs`, check sitemap entries, actual contact acceptance and hostname-filtered analytics. The verifier checks public HTML and the published PDF destinations. Submit only exact new/changed deployed HTML URLs through `submit-indexnow.mjs --site gc --urls ...`; --dry-run does not submit. The submission tool records separate engine receipts and avoids resubmitting unchanged accepted content. Receipt is not proof of indexing. Record the real deployment date in `content/measure/experiments.json`; never backdate it to the preparation date.

`content/measure/MEASUREMENT-CONTRACT.md` defines comparable observations, source states and inquiry qualification. `scripts/client-guide-freshness.mjs` produces a due-source review queue without changing review dates. The blog routine reads that queue and the editorial briefs. Evidence can justify a focused refresh; word count or an editorial score alone cannot establish search success.
