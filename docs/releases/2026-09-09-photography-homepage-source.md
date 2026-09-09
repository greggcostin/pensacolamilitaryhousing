# Photography, homepage and blog source reconciliation

The latest approved photography treatment, homepage credentials and review proof, responsive hero preload, and direct Google/Zillow review links now live in the same maintained source as the school, blog and GEO work. The integration starts from GitHub main `55704ee99aa4a6e2ec8f24e38767334e30761e76` and merges the later civilian Search and Calculator header release `7e3201c0e98b83878dff172f0dd4f707821f1f63`. It preserves the newer source safeguards instead of replacing them with the older shared working checkout.

The initial production reference was verified on September 9, 2026 against all 4,981 Cloudflare asset hashes: military `e912159d-0e14-497d-a5eb-5264623575c6` and civilian `85dd2370-90c8-4548-a677-cd5d0aca3967`. The new header release was detected before the source push. A fresh complete comparison at 16:08 UTC verified all 4,983 hashes against civilian `b4d65423-598b-482b-93d2-d574dbb8ae64` and the unchanged military deployment. All 319 civilian header controls are retained, including the search dialog, real Pagefind results, resource fallback and cross-domain calculator link. The photography and homepage implementations came from **Audit and elevate greggcostin.com**, task `01a074bb-41ca-7342-a229-cbf774e1dfa5`. The preceding [catalog source handoff](../blog-catalog-refresh-2026-09-09.md), [school/source integration](2026-09-09-cross-site-integration.md) and [homepage preload](2026-09-09-homepage-image-preload.md) remain part of this source.

## Maintained build paths

- `npm run build`: finalizes military photography, checks reviewed military blog source, runs the existing identity, school, analytics and SEO gates, then builds the React application, six HTML routes and English Pagefind index.
- `npm run build:civilian`: checks civilian blog source, finalizes photography, header controls and delivery, rebuilds the complete English search index and runs the civilian audit.
- `npm run build:civilian:home`: restores editable CSS, regenerates the homepage, reapplies responsive pictures and runs the civilian build.
- `npm run audit:blog:sources`: checks the current draft/evidence contracts across both engines. These checks do not establish the truth of an external claim without editorial review.

The shared photography catalog owns attribution on both domains. Keep the original image ledger, recovered legacy credits and both per-site catalogs. The homepage generator no longer replaces the 40-image civilian catalog with a smaller homepage-only list. The military source scan includes `index.html` outside `public/`, retaining all 37 credits, including the cross-domain portrait. Native React and no-JavaScript footer links survive rebuilding.

## Integration defects corrected

Full homepage regeneration exposed three stale Florida ZIP values which were no longer supported by the updated destination guides. Those rows now read the maintained, archived ownership-study dataset: ZIP 32570 rounds to $278,380, 32503 to $297,280 and 32563 to $406,683, all dated July 31, 2026. They link to the existing Florida study. Foley's separately dated $306,621 guide quotation remains distinct; the Florida study does not cover Alabama. These are historical Zillow home-value indexes, not current asking prices, closed-sale medians, appraisals or property-cost quotes. See the [Zillow ZHVI methodology](https://www.zillow.com/research/zhvi-methodology/). The homepage's substantive content date becomes September 9; actual review-observation dates stay unchanged.

Windows CRLF conversion could invalidate unchanged reviewed articles. Content hashing now normalizes CRLF to LF only, and article fragments have explicit LF checkout rules. One mortgage article originally had mixed line endings. Its original seal was verified against the original draft, its metadata and normalized body were proven identical, and only the hash representation was migrated with provenance recorded in its review. No new fact-check or review date was asserted. All 17 current draft/evidence gates now pass; edits to prose, links or images still invalidate a seal.

Stylesheet restoration and rebuilding no longer accumulate blank lines. After the header merge, the complete civilian homepage pipeline was run again across 1,613 local delivery files with zero changed files, zero new files and unchanged review observations. Existing analytics guards and deferred receipt loading were retained, including restoring missing generated-page guards. The existing Whiting guide link remains; a contextual link from the Crestview community page restores discovery of the existing military relocation guide.

## Verification

| Check | Result |
| --- | --- |
| Approved production baseline | All 4,983 provider hashes matched, including the later header release |
| Images and responsive sources | Preserved across all 696 HTML pages |
| School article bodies | All 542 preserved, 271 per domain |
| Blog article bodies | All 17 preserved, 5 civilian and 12 military |
| Attribution | All 40 civilian and 37 military records retained |
| Node regression tests | 163 passed |
| Integrated browser checks | 34 passed, including automatic maps and accepted-receipt conversion handling |
| Photography/homepage/header browser checks | 32 passed, including phone/desktop review proof, links, search results, keyboard dismissal and no-JavaScript fallbacks |
| School preservation | 12 military groups and 37 shared hub checks passed |
| Complete built-site audits | 375 military pages, 319 civilian pages and 694 shared-entity pages; zero findings |
| Internal links | Zero broken links and zero orphan pages |
| Financial source/model checks | 26-ZIP model, affordability canon and 96 official BAH values matched |

Browser verification blocks external requests; it does not submit an actual lead. The #1 military positioning, 6 a.m. to midnight contact hours, separate 24-hour GBP setting, automatic school maps, shared identity, financial review dates, inquiry receipt checks and cross-domain links are preserved. The only page-level content date changed in the comparison is the substantively corrected civilian homepage. No new photography or image replacement was required.

## Publication boundary

The initial source reconciliation did not deploy either site. Following the owner's subsequent instruction, both complete builds were [published and verified on September 9](2026-09-09-reconciled-source-publication.md), including the homepage-data and discovery corrections. The approved design was preserved. Military automatic Git deployment remains disabled, and civilian publication is separate. Before a later publication, refresh both current production identities and compare the complete built candidate with the latest complete release. Do not deploy the older dirty shared checkout or mistake source publication for indexing, recommendation or referral evidence.
