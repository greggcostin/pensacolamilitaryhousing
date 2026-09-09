# Shared source integration, September 9, 2026

The shared working directory was thirteen commits behind GitHub while also containing completed, published website work. This change reconciles the latest school and blog commits with that published work in an isolated checkout based on `c6391c174b932f5130b9ef9ecad21819b8ec4352`. It makes the combined implementation reproducible without resetting the active working directory.

## Preserved work

| Area | Source and behavior retained |
| --- | --- |
| Schools | All 274 directory identities and 271 individual guides per domain; Florida and Alabama grades with their own reporting years; private and Christian categories; automatic map display; category cards before long directories; enrollment resources; distinct page canonicals and one shared Dataset identity. |
| Blog engines | The newer evidence, answer-passage, applicability, date, duplicate-intent, review-seal and ownership checks; draft-first automation; isolated preview behavior; fixed-header spacing. The approved mortgage-rate article remains present. |
| Financial resources | The existing 26-ZIP study URL, archived public source data, shared complete-cost model, reviewed named guides and scoped PDF editions. The study remains an illustrative comparison using dated source observations, with its actual Florida geography documented. |
| Identity | One canonical professional record and entity graph, synchronized contact details, the existing number-one military positioning and published review counts. Contact hours remain 6 a.m. to midnight Central; the separate Google Business Profile availability setting is unchanged. |
| Inquiry handling | Durable accepted receipts are required before browser lead conversions. Plain success responses, forged events and duplicate receipts do not create additional conversions. |
| Regional content | The distinct Perdido and Navarre editions, newer civilian regional guides, ownership/document tools and task-completion instrumentation. |
| Discovery | All six military application routes, server-rendered page content, 19 shared community summaries, cross-domain links, structured data, social assets and an explicitly English search index. |

The source includes the full public static surface from the verified two-site release. Military application shells, hashed application bundles and Pagefind files rebuild from source. Local deployment copies, authenticated browser evidence, private audit records, operational configuration and credentials are excluded.

## Integration fixes

- Added the existing production-host analytics guard to twelve civilian pages that lacked it.
- Reconciled deferred conversion-script loading across 370 military HTML sources with the current template contract.
- Linked the existing Whiting Field off-base housing guide from the installation guide and retained that link in the related-guide generator.
- Preserved the school hub's head-block position during regeneration so shared identity, conversion and preload tags keep their order.
- Added a school-hub consistency check that can run after a normal build without private deployment receipts. The original release mode still checks its saved baseline separately.
- Updated regression coverage to exercise the actual accepted-receipt runtime, current school identity graph, public BAH source paths and newline-independent regeneration. Superseded local prototype tests were not substituted for the newer committed blog-engine suite.

## Validation

- `npm run build`: passed all prebuild gates and indexed 374 military pages in English.
- All fourteen Node test files: 145 tests passed, zero failed or skipped, including 25 contact-worker tests.
- Built military audit: 374 pages, zero findings.
- Civilian audit: 319 pages, zero findings.
- Built entity audit: 693 pages, zero findings.
- Military school check: twelve of twelve groups passed.
- `node scripts/check-school-hub-seo.mjs --source`: 37 checks passed. Run after `npm run build`; it reads `dist/` and `civilian-site/`.
- `node scripts/check-integrated-browser.mjs`: 34 checks passed, covering mobile layout, both school maps, result selection after typing, four receipt-based form paths and the 26-row study without JavaScript. All external requests are blocked or served from the checkout; synthetic contact responses stay inside the browser.
- Internal-link audit: zero broken links and zero orphan pages.
- Independent comparison with the saved production baseline: all 542 individual school guides retain their visible text and publication/review dates. The approved mortgage-rate article, funding-fee guide and ownership-study text are also preserved.
- Shared affordability check, 26-ZIP study regeneration and all 96 published BAH values pass their source checks.

Browser checks need Playwright and Chromium/Edge. Set `BROWSER_EXECUTABLE` if Edge is not at the default Windows path. The script can use a locally installed Playwright package or the bundled desktop runtime.

## Source versus production

This is a source integration. Its tests do not establish improved rankings, AI referrals, qualified consultations or field performance. A Git push is not a two-site deployment. The military Cloudflare project currently has automatic production deployments disabled, and the civilian project is deployed separately. Refresh both production identities and compare complete inventories before a subsequent release.

Use the latest complete two-site baseline, not an older partial release directory. Keep review dates unchanged unless the corresponding content receives a substantive review. Keep recommendation, citation, accepted inquiry and qualified-outcome measurements distinct.
