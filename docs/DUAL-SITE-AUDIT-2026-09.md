# Dual-Site Forensic Audit: greggcostin.com and pensacolamilitaryhousing.com

Prepared for Gregg Costin, The Costin Team at Levin Rinke Realty. Audit date: September 2, 2026. Scope: every page of both properties (101 URLs on pensacolamilitaryhousing.com, 102 on greggcostin.com), the React SPA and its prerendered shells, the build scripts and factories, the contact worker, the live edge configuration on Cloudflare, and 30 days of Microsoft Clarity behavior data.

## 0. How this audit was run, and how to read it

**Method.** Thirteen specialist auditors each covered one dimension across both sites (performance, mobile, AI readiness, schema, indexation, visual and CRO, media, military content, civilian content, E-E-A-T and compliance, cross-domain synergy, analytics, keywords). Every finding each auditor produced was handed to an independent adversarial verifier whose job was to refute it by reproducing the evidence with its own tools. A completeness critic then compared coverage against the brief and commissioned six gap probes (blog route integrity, the PCS checklist lead magnet, listing-shaped surfaces, the OG card and canonical gate, live-versus-local JSON-LD parsing, and URL variants and redirect chains), each with its own verifier. In total 43 agents ran 1,049 tool calls. 186 findings were produced; 185 survived verification, 1 was refuted by its verifier, and 1 more was overturned by the orchestrator after reading the deployed worker source (see the note under item 5 of the fix list and Appendix B).

**Evidence standard.** Every finding cites a file and line in the repository or a live URL with the observed value. "Confirmed" means the verifier reproduced it exactly. "Narrowed" means the core is real but the verifier reduced its scope, severity, or wording, and the corrected version is what appears here.

**What was not available.** The PageSpeed Insights API quota was exhausted for the day, so the audit itself ran without Lighthouse or Chrome UX Report numbers; local Lighthouse runs were added afterwards (section 0.1) and field data still needs an API key. Semrush API units were at zero. Keyword difficulty is judged from live SERP shape plus the Bing Webmaster export in the repository. Nothing below is estimated where it could not be measured.

**What changed since the August 24 audit.** The July and August fixes hold: the factual corrections to BAH tables, geography, VA rules and on-base housing, the removal of self-serving review markup, the em-dash purge, the curated explore blocks, the CTA strips, the per-route SPA shells, and the cross-link rule are all still in place and are not re-reported. This audit goes deeper in five places the earlier passes did not reach: the live entity graph (a deleted Wikidata item and 187 conflicting definitions of one business node), the no-JavaScript view of the SPA routes, the OG card generator, the civilian site's content model, and the analytics and lead-attribution pipeline.

**Finding ids.** Bracketed ids such as [idx-01] refer to Appendix A, which lists all 185 verified findings with their evidence and fix. Ids ending in "v" (for example [schema-01v]) come from the JSON-LD validity probe and are distinct from the schema-architecture findings with the same number.

### 0.1 Lighthouse lab results (added after the audit, same day)

Local Lighthouse 12 runs in headless Chrome against the live sites on September 2, 2026 (mobile emulation unless noted, throttled defaults). These are lab numbers on one machine, not Chrome UX Report field data; field data still needs a PageSpeed Insights API key (see Appendix B).

| Page | Perf | SEO | A11y | Best practices | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| PMH home (mobile) | 98 | 100 | 95 | 57 | 2.2 s | 0.006 | 50 ms |
| PMH home (desktop) | 98 | 100 | 95 | 59 | 1.1 s | 0.011 | 0 ms |
| PMH /bah-rates | 99 | 100 | 93 | 61 | 1.8 s | 0.03 | 40 ms |
| PMH /bases/nas-pensacola | 98 | 100 | 92 | 61 | 1.8 s | 0.035 | 160 ms |
| PMH /pcs-guide | 100 | 100 | 95 | 61 | 1.3 s | 0.018 | 30 ms |
| GC home (mobile) | 82 | 100 | 96 | 100 | 2.6 s | **0.294** | 20 ms |
| GC home (desktop) | 98 | 100 | 96 | 100 | 1.2 s | 0.003 | 0 ms |
| GC /buy | 96 | 100 | 89 | 100 | 1.6 s | 0.10 | 30 ms |
| GC /neighborhoods | 99 | 100 | 90 | 100 | 2.0 s | 0.01 | 20 ms |

What the lab data changes. Load performance is stronger than the byte-based grading implied: eight of nine runs score 96 to 100, and every LCP is under 2.6 s on a throttled phone profile. The measurable problems are narrower than "performance" and match findings already in the report:

- **greggcostin.com mobile homepage fails Core Web Vitals on layout shift** (CLS 0.294 against a 0.1 threshold; /buy sits at the 0.10 line). Three shifts are logged on each. This is the hero overlay and trust band behavior described in [cro-04] and [mob-04], and the fix in section 4.1 (buttons back into the flow, portrait sized, four trust tiles on phones) is now a Core Web Vitals repair, not only a conversion one.
- **Responsive images are the largest byte waste**: 1,889 KiB of savings on /neighborhoods (total page 3,060 KiB), 648 KiB on the PMH desktop home, 85 to 178 KiB on the mobile pages [perf-03, media-01, media-02].
- **Best practices 57 to 61 on every PMH page** comes from third-party cookies set by the Clarity and Follow Up Boss tags, deprecation warnings, and DevTools issues; greggcostin.com, which has no Clarity, scores 100. This is a vendor-tag cost, not a code defect [analytics-09, perf-07].
- **Accessibility fails repeat the mobile findings**: target-size on six of nine runs, link-in-text-block on four, color-contrast on /buy and /pcs-guide, heading-order on /neighborhoods and /pcs-guide [mob-08, cro-11, idx-12].
- **Unused JavaScript of 446 to 504 KiB per page is almost entirely third-party** (Follow Up Boss widget 527 KiB, Google Tag Manager 191 KiB); first-party code is small on both sites. Loading the widget on first interaction [analytics-09] is the lever.
- /pcs-guide shows 430 ms of render-blocking resources and the PMH desktop home 160 ms, consistent with the font discovery finding [perf-01].

Scorecard revision. With lab data in hand, Performance is regraded: pensacolamilitaryhousing.com B- (80), greggcostin.com C+ (77, held down by the failing mobile CLS and the 3 MB neighborhoods page). Overall grades move to C- (70) and D+ (66). The tables below carry the revised numbers.

## 1. Executive scorecard

Grading scale: A 90 to 100, B 80 to 89, C 70 to 79, D 60 to 69, F below 60. Rules applied consistently: a dimension carrying several verified high-severity findings is capped at 75; a dimension with only low-severity findings and multiple top-1% strengths scores 85 or above.

### Scorecard

| Dimension | pensacolamilitaryhousing.com | greggcostin.com |
|---|---|---|
| Performance | **B-** (80) | **C+** (77) |
| GEO / AI readiness | **C** (74) | **D** (62) |
| Technical SEO | **D** (60) | **B-** (80) |
| Visual design and UX | **D** (62) | **D** (60) |
| Content authority | **C** (74) | **F** (55) |
| **Overall** | **C- (70)** | **D+ (66)** |

### Why each score lands where it does

**pensacolamilitaryhousing.com**

| Dimension | Basis |
|---|---|
| Performance B- | Lighthouse lab scores 98 to 100 on every page tested (section 0.1). The delivery layer is elite: Brotli on every text response, HTTP/3, 41 to 130 ms TTFB, a 99 KB compressed React bundle, sub-350 ms lab load. Two highs hold it down: not one `srcset` width descriptor on 324 images, so 300 to 378 KB heroes ship to phones [perf-03, media-01], and a 4 MB JPEG grid on /communities [media-02]. Fonts are discovered only after the JS bundle runs [perf-01], the bundle carries dead components [perf-02], and three images per page claim `fetchpriority=high` [perf-04, media-03]. |
| GEO / AI readiness C | Best-in-class crawler policy, refreshed llms.txt files, and 351 Copilot citations per 90 days. But the canonical PCS destination is 164 words to any crawler that does not execute JavaScript [geo-01, idx-04], the pages.dev twin is fully crawlable by AI bots [geo-02], the quotable figure on answer pages sits 600 to 1,700 words below the H1 [geo-03], and freshness signals contradict each other [geo-04]. |
| Technical SEO D | Canonicals, hreflang, sitemap parity and single-hop redirects are perfect. One critical drags the grade: every unknown URL returns a 200 copy of the homepage [idx-01, url-01]. Then a run of highs: an indexable duplicate host [idx-02], bulk-stamped lastmod on 101 of 101 URLs [idx-03], 71 of 93 OG share cards rendering raw entities or stuttered words [og-01], no audit gate for the 101 PMH URLs [og-02], 187 conflicting definitions of one RealEstateAgent @id [schema-03], and an invalid schema type on all 7 SPA routes [schema-04]. |
| Visual design and UX D | Text contrast and the sticky Call/Text/Email bar are top-tier. Seven highs converge on phones: 4 to 6 rows of 9 to 10 px nav chips with no hamburger [mob-01], a 161 px fixed header [mob-02], horizontal overflow at 320 px [mob-03], 1,529 px of stats and partner logos before any service content [cro-01], a lead-gated primary CTA duplicating an ungated ghost button [cro-02], an on-load modal on /pcs-guide [cro-03], and 216 dead clicks on an unlinked FEMA date [cro-05]. |
| Content authority C | BAH tables are correct and single-sourced, base pages are command-specific at 2,300 to 3,700 words, and the VA disability tax cluster leads Copilot with 119 citations. Held down by school letter grades that the sister site's own FLDOE data contradicts [mil-01], a fabricated 14-month housing wait in the Eglin meta description [mil-02], E-5 affordability ceilings that differ by $115,000 across pages [mil-03], a pre-settlement "costs you nothing" sentence on /pcs-guide [eeat-09], and no privacy policy [eeat-01]. |

**greggcostin.com**

| Dimension | Basis |
|---|---|
| Performance C+ | Lab scores 96 to 99 except the mobile homepage at 82, which fails Core Web Vitals on layout shift (CLS 0.294, section 0.1). Same elite edge (Brotli, HTTP/3, 286 DOM nodes, 12 requests) and width/height on 230 of 230 images. But no `srcset` anywhere, a 788 KB WebP heavier than its own JPEG, zero AVIF in the civilian pipeline [perf-03, media-01, media-08], LCP heroes lazy-loaded on /sell, four blog posts and one guide [media-04], and hot-linked cross-origin logos marked high priority with no preconnect [perf-04, media-11]. |
| GEO / AI readiness D | Crawler policy and the pages.dev noindex are correct. But llms-full.txt covers 6 of 102 pages and disagrees with PMH on the review count [geo-05], blog posts reference an author @id defined on only 2 pages [geo-06], no civilian local-intent pages exist for the cities the schema claims to serve [geo-11], the name domain is absent from the "gregg costin realtor" link set [synergy-06], and every page cites a Wikidata item deleted on 2026-07-07 [schema-01, synergy-01]. |
| Technical SEO B- | Real 404s with noindex, honest sitemap lastmod on 98 of 102 URLs, a 0-finding audit gate, clean canonicals and single-hop redirects. What remains is medium or low: 82 school pages with one inbound link each [idx-07], School nodes that say the page is about the sales team [schema-10], templated descriptions over 155 characters on 93 pages [idx-09], and the shared entity split with PMH [schema-02]. |
| Visual design and UX D | Palette, contrast and the sticky bar match PMH. But the header is sticky at 147 to 173 px on phones, 25 to 31% of the screen [mob-02], the nav wraps into 3 to 4 rows of 9 px chips [mob-01], the homepage hero CTAs render 28 px tall over the portrait below the fold because of an inherited `line-height:0` [mob-04, cro-04], 320 px layouts overflow to 360 px [mob-03], and an eight-tile trust band pushes the first service card to 1,868 px [cro-04]. |
| Content authority F | The FAQ page, the 82 FLDOE school reports and the two 2,700 to 3,000 word resource guides are genuinely strong. But the civilian brand owns zero neighborhood pages and routes every "deep guide" click to military-framed PMH URLs [gc-content-01, synergy-04, kw-02], has no waterfront, luxury or relocation coverage [gc-content-02, gc-content-07], no market data on a site that sells data-driven pricing [gc-content-03, kw-05], no pricing or net-sheet page [gc-content-04], anonymous YMYL blog posts [gc-content-05, eeat-07], and resource guides that cite zero primary sources [eeat-08]. |

### What is already top-1% (do not touch)

The delivery layer on both hosts is as good as a static site gets: Brotli on every text response, HTTP/3, 41 to 130 ms TTFB, cache hits on assets, a correct tiered cache policy, and pages that weigh 10 to 24 KB compressed with a 99 KB React bundle. The PMH image pipeline already has AVIF and WebP for every one of 113 originals, every image wrapped in `<picture>` with `decoding=async`, and alt text averaging 67 to 69 characters with zero empties on either site. Crawler policy is exemplary: both robots.txt files name 20+ AI crawlers and were live-verified to admit all of them, the PMH llms.txt and llms-full.txt are refreshed and linked from 100 of 101 pages, and the site already sits in Google's grounding set for its core BAH and neighborhood queries. Canonical discipline is complete on 202 of 202 pages (self-canonical, og:url match, hreflang, zero duplicate titles or descriptions, one H1 each), sitemaps are in perfect parity with disk, redirects are single-hop everywhere that matters, and 826 JSON-LD blocks across 197 files all parse with no self-serving review markup. FAQPage markup mirrors visible text on all 104 FAQ pages (753 questions), the BAH dollar tables are correct and single-sourced, the VA disability property-tax cluster owns 63 Bing queries, and the seven base pages are command-specific with only 9 to 26% sibling overlap. The sticky mobile Call/Text/Email bar, the accessible inquiry modal, the success-gated GA4 lead events on the static surfaces, and the contact worker's stage-mapped pipeline with 2-hour follow-up tasks are above the standard of any competing agent site in this market. On greggcostin.com, the 82 FLDOE school reports, the 22-question FAQ, the 0-finding audit gate, real 404 handling and the dated, third-party-verifiable trust band are the assets everything else in this report should be built on top of.

## 2. Fix immediately: the top five across both domains

Ranked by the product of impact and certainty. All five are low or medium effort and four are pure code changes.

### 1. pensacolamilitaryhousing.com returns a 200 copy of the homepage for every unknown URL

[idx-01, url-01, geo-08, analytics-11]. The last rule in `public/_redirects` is `/* /index.html 200` and there is no `public/404.html`. Live-verified on 15+ variants: `/BAH-Rates`, `/bases`, `/bases/nas-pensacola/index.html`, `/niceville`, `/privacy`, `/wp-admin` and every typo return the 54,812-byte homepage shell with canonical "/" and `robots index,follow`. Every SPA route already has its own prerendered shell file, so the wildcard protects nothing.

Why it matters: an unbounded duplicate-URL surface, crawl budget spent on phantom pages, Search Console unable to report real broken links, AI engines that reconstruct URLs storing homepage copies under wrong paths, and 404s invisible in GA4.

Fix (low effort, code): delete the wildcard line and its stale comment block; add `public/404.html` cloned by hand from the page template with `noindex`, no canonical or Article JSON-LD, links to /pcs-guide, /bah-rates, /va-loan-guide, /communities and /contact, and a `page_not_found` GA4 event. Add the six missing community and base alias redirects while in the file [url-04]. Verify that `curl -sI /BAH-Rates` returns 404 and `/about` still returns 200. The complete 404 page and the router patch are in section 3.4, patch P1.

### 2. pensacolamilitaryhousing.pages.dev is a fully indexable, AI-crawlable duplicate of all 101 pages

[idx-02, geo-02]. The twin returns HTTP 200 with no `x-robots-tag` and the same allow-all robots.txt. The civilian twin already sends `noindex` because `civilian-site/_headers` declares it; `public/_headers` has no equivalent block.

Why it matters: AI crawlers ignore `rel=canonical` and the JavaScript redirect, so the pages that lead Copilot citations (the VA disability tax page at 119, /bah-rates at 54) can be ingested and cited under the wrong host, and Bing sees an indexable mirror.

Fix (two lines, code): append to `public/_headers` exactly what the civilian file has (section 3.2.3), redeploy, and confirm with `curl -sI https://pensacolamilitaryhousing.pages.dev/bah-rates | grep -i x-robots-tag`.

### 3. Every page on both sites cites a Wikidata item that Wikidata deleted, and the homepage ships an invalid entity type on all 7 SPA routes

[schema-01, synergy-01, schema-04, schema-01v, schema-03]. Q140446886 returns `missing` from the Wikidata API and 404 from EntityData; the public log shows it was deleted on 2026-07-07 for notability. It sits in the identifier and sameAs of 94 PMH Person nodes, in `index.html` three times, in the civilian index and team pages, in both llms.txt files, and `scripts/audit-civilian.mjs` fails the civilian deploy if it is absent. Separately, `index.html` lines 117, 272 and 381 use `RealEstateOrganization`, which is not a schema.org type; it is copied into every SPA shell and gives validator.schema.org 11 errors on the homepage. The same string lives in `scripts/page-template.mjs` and `scripts/content-page-template.mjs`, so it will come back with the next generated page.

Why it matters: the strongest entity-reconciliation signal on both domains now resolves to a deleted item (a negative signal, not a neutral one), the audit gate actively blocks the fix, and parsers drop the brokerage relation on the highest-authority URLs. This is also the precondition for the entity consolidation the brand-query gap depends on [schema-02, synergy-06].

Fix (low effort, code): write `scripts/remove-wikidata-entity.mjs` as the inverse of the add script (strip the identifier entry, filter the Wikidata and g.co/kgs URLs out of every sameAs, delete `<link rel="me">` at `index.html:62`), hand-edit `index.html`, delete the llms.txt lines, invert the civilian audit check to fail on presence, and retire the add script and the Wikidata playbook. Replace `RealEstateOrganization` with `Organization` in `index.html` and the two template scripts, rebuild, and re-validate. The reconciled homepage graphs for both sites are in section 3.1.

### 4. The canonical PCS landing page opens a five-field modal on arrival, carries a settlement-noncompliant sentence, and is 164 words to AI crawlers

[cro-03, eeat-09, geo-01, idx-04]. `src/App.jsx:942` initializes the PCSPage gate to open unless the visitor has already submitted; `src/App.jsx:1049` reads "Having your own representation costs you nothing (the builder pays the commission)", and `public/crestview-military-relocation.html:369` repeats it. /pcs-guide is the owner-designated PCS destination and the third-ranked page by sessions. The same route renders 164 words, 2 H2s and 16 links to any crawler that does not execute JavaScript, with no FAQPage markup for its six FAQs.

Why it matters: an on-load interstitial on the search-entry page is the pattern Google's mobile interstitial guidance penalizes, and it asks for five fields before one sentence is read. The "costs you nothing" representation has been prohibited for NAR MLS participants since August 2024 and sits on the page most likely to be quoted. And the hydrated page's 1,300 words of tables and FAQs are invisible to every AI engine except Google's.

Fix (low effort for the gate and wording, medium for the shell): change line 942 to `useState(false)` and keep the in-body "Get My PCS Plan" strip as the only opener; rewrite both sentences using the compliant wording already on `public/military-realtor-pensacola.html:404`, and add the "How is my buyer's agent paid on a VA loan?" FAQ to /buy, /faq and /pcs-home-search. Then extract the installations table, neighborhood rows, BAH data and the six FAQs into `src/pcsGuideData.js` so `scripts/postbuild-spa-routes.mjs` can render tables, FAQ details and FAQPage JSON-LD into the shell, and assert more than 800 words per shell in the build.

### 5. The SPA never records a successful lead, no form passes attribution to Follow Up Boss, and the only listing site files every inquiry as a Prospect

[analytics-01, analytics-02, list-01]. The homepage, /pcs-guide and /contact fire a generic `form_submit` on every submit attempt (`index.html:46-50`) and never a success-gated `inquiry_submit`, so spam and failed submits count as conversions on the highest-traffic entry page. No form on either site sends utm parameters, landing page or the GA client id to the worker, even though the worker reads them. The 825 Bayshore listing subdomain's five dropdown options carry no `value` attribute and none matches the worker's stage map, so every showing request from the only listing page files in FUB as Prospect and the 2-hour follow-up task never fires.

Correction to the workflow's finding: the auditors also flagged `public/pcs-checklist.html` for sending the key `honeypot` instead of `_gotcha` and the inquiryType "PCS Checklist Download" [pcs-01]. That is not a defect. The deployed worker source in `workers/costin-contact/worker.js` accepts either key (lines 24 to 26) and maps "PCS Checklist Download" to Lead (line 49), both fixed on 2026-08-12. Aligning the key name is optional hygiene. The 825 Bayshore option mapping is the real breach.

Fix (low effort for events, medium for attribution): delete the document submit listener in `index.html`, add `inquiry_submit` in the two SPA success branches and `inquiry_open` on modal mount, mark `inquiry_submit` as the GA4 key event, add the first-touch capture snippet and merge stored attribution plus `ga_client_id` into every payload, and give each 825 Bayshore option a stage-map value (section 3.4, patches P10 and B1). Gregg must locate the 825 Bayshore source, which is not in the repository.

### Next in line, cheap and visible

71 of 93 PMH OG share cards render `&amp;`, em dashes or a stuttered last line because the generator never decodes entities and its wrap loop never advances [og-01]. School letter grades on 14 PMH pages disagree with the FLDOE 2026 data that powers greggcostin.com/schools [mil-01]. The Eglin on-base page's meta description, OG description and Article schema advertise "2026 waits up to 14 months" while its own body says wait times are not published [mil-02]. The FEMA effective date on the flood-zones page draws 216 dead and 72 rage clicks because it is not a link [cro-05]. Neither site has a privacy policy, accessibility statement or SMS consent language [eeat-01, eeat-02].

---

## 3. Turnkey code snippets

Every JSON block below was written to a scratch file and parsed with `node -e 'JSON.parse(...)'` on 2026-09-02 (files under `scratchpad/s3/`: `pmh-home.json`, `pmh-guide.json`, `gc-home.json`, `gc-neighborhood.json`, `video.json`, `listing.json`, `breadcrumb.json`; all parse, zero em dashes, zero dangling `@id` references other than the intentional `isPartOf` pointer to each site's `#website` node, which the homepage defines). Title and description lengths in 3.3 were checked by script (all titles 43 to 60 characters, all descriptions 139 to 155). Placeholders are ALL_CAPS and must be filled or deleted before deploy; nothing else in the blocks is invented.

### 3.1 JSON-LD templates

### 3.1.0 Entity decisions the templates encode

These reconcile the schema findings [schema-02] [schema-03] [schema-04] [schema-06] with the synergy dimension [synergy-01] [synergy-02] [synergy-07] and the NAP audit [eeat-11]. One value each, used verbatim on both domains.

| Item | Canonical value | Why |
|---|---|---|
| Person `@id` | `https://greggcostin.com/#gregg` | Person lives on the name domain; PMH references the same string [schema-02] [synergy-02] |
| Business `@id` | `https://greggcostin.com/#team` (RealEstateAgent, absorbs the PMH `#localbusiness` node) | One business, one NAP [schema-04] |
| Brokerage `@id` | `https://greggcostin.com/#brokerage` (Organization, never RealEstateOrganization) | Invalid type removed [schema-04] [schema-01] |
| WebSite `@id` | `https://pensacolamilitaryhousing.com/#website` and `https://greggcostin.com/#website` | One per domain |
| Email | `greggcostin@gmail.com` | GBP master; Gmail ignores dots and case [eeat-11] |
| Street | `220 W Garden St` | GBP canonical form [eeat-11] |
| jobTitle | `Realtor` (specialty carried by hasCredential MRP/FMS and knowsAbout) | [schema-02] |
| priceRange | `$$` | [schema-02] |
| Awards | The 3 dated GC awards on both sites | [schema-02] |
| sameAs | Google Maps place, Zillow, Homes.com, LinkedIn, Facebook `greggcostin`, Instagram `greggcostinrealtor`, Linktree `Greggcostin` (one casing), brokerage profile, plus the sister site's profile page | Wikidata Q140446886 and g.co/kgs removed (both dead) [schema-01] [synergy-07] |
| Business relation | `parentOrganization` on the agent, never `worksFor` | Property domain fix [schema-03] [schema-06] |
| License fields | `FL_LICENSE_NUMBER`, `AL_LICENSE_NUMBER`, `GBP_PLACE_ID` placeholders | Delete these `identifier` entries and the two license `hasCredential` entries until the numbers are recorded in AGGREGATOR_PROFILES.md [eeat-04] [schema-05] |
| Hours | `GBP_OPENS_HH_MM` / `GBP_CLOSES_HH_MM` | Must match the Google Business Profile, not 00:00 to 23:59 by default [schema-04] |

Rollout rule: the full Person, RealEstateAgent and Organization nodes appear only in the two homepage graphs (3.1.1 and 3.1.3), which the PMH postbuild copies into `/about` and the other SPA shells; every other page carries the compact reference nodes shown in 3.1.2 and 3.1.4 [schema-03] [schema-05]. Save the templates under `scripts/schema-templates/` and `JSON.parse` them in a prebuild check.

### 3.1.1 PMH homepage `@graph` (replaces the eight blocks at `index.html:91-428`)

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://pensacolamilitaryhousing.com/#website",
      "url": "https://pensacolamilitaryhousing.com/",
      "name": "Pensacola Military Housing",
      "alternateName": "Gregg Costin, Pensacola Military Realtor",
      "description": "PCS, VA loan, and BAH guidance for military families buying and selling homes across the Florida Panhandle.",
      "inLanguage": "en-US",
      "publisher": { "@id": "https://greggcostin.com/#team" },
      "about": { "@id": "https://greggcostin.com/#team" }
    },
    {
      "@type": "WebPage",
      "@id": "https://pensacolamilitaryhousing.com/#webpage",
      "url": "https://pensacolamilitaryhousing.com/",
      "name": "Pensacola Military Realtor | PCS, VA Loan & BAH Guides",
      "description": "Military relocation Realtor for NAS Pensacola, Whiting, Corry, Eglin and Hurlburt: 2026 BAH tables, VA loan guides, and base-by-base housing reports.",
      "isPartOf": { "@id": "https://pensacolamilitaryhousing.com/#website" },
      "about": { "@id": "https://greggcostin.com/#team" },
      "primaryImageOfPage": { "@id": "https://pensacolamilitaryhousing.com/#portrait" },
      "inLanguage": "en-US",
      "speakable": { "@type": "SpeakableSpecification", "cssSelector": ["h1", "h2"] }
    },
    {
      "@type": "ImageObject",
      "@id": "https://pensacolamilitaryhousing.com/#portrait",
      "url": "https://pensacolamilitaryhousing.com/images/gregg-portrait.jpg",
      "contentUrl": "https://pensacolamilitaryhousing.com/images/gregg-portrait.jpg",
      "width": 1200,
      "height": 1200,
      "caption": "Gregg Costin, Realtor with Levin Rinke Realty, Pensacola, Florida"
    },
    {
      "@type": "ImageObject",
      "@id": "https://pensacolamilitaryhousing.com/#logo",
      "url": "https://pensacolamilitaryhousing.com/images/logo-08-sm.png",
      "contentUrl": "https://pensacolamilitaryhousing.com/images/logo-08-sm.png",
      "width": 480,
      "height": 196,
      "caption": "The Costin Team at Levin Rinke Realty"
    },
    {
      "@type": "Service",
      "@id": "https://pensacolamilitaryhousing.com/#service-pcs",
      "name": "PCS Relocation Planning",
      "serviceType": "Military relocation consultation",
      "description": "Neighborhood, school-zone, commute, and BAH-to-mortgage planning for military families PCSing to the Florida Panhandle, timed to the report-no-later-than date.",
      "provider": { "@id": "https://greggcostin.com/#team" },
      "areaServed": { "@type": "AdministrativeArea", "name": "Florida Panhandle" },
      "audience": { "@type": "Audience", "audienceType": "Active-duty military families on PCS orders" },
      "url": "https://pensacolamilitaryhousing.com/pcs-guide",
      "offers": { "@type": "Offer", "availability": "https://schema.org/InStock", "url": "https://pensacolamilitaryhousing.com/contact" }
    },
    {
      "@type": "Service",
      "@id": "https://pensacolamilitaryhousing.com/#service-va",
      "name": "VA Loan Homebuyer Guidance",
      "serviceType": "Real estate buyer representation",
      "description": "Buyer representation for service members, veterans, and surviving spouses using a VA loan: entitlement, COE, funding fee, appraisal, and seller concessions.",
      "provider": { "@id": "https://greggcostin.com/#team" },
      "areaServed": { "@type": "AdministrativeArea", "name": "Florida Panhandle" },
      "audience": { "@type": "Audience", "audienceType": "Military service members, veterans, and surviving spouses" },
      "url": "https://pensacolamilitaryhousing.com/va-loan-guide",
      "offers": { "@type": "Offer", "availability": "https://schema.org/InStock", "url": "https://pensacolamilitaryhousing.com/contact" }
    },
    {
      "@type": "Service",
      "@id": "https://pensacolamilitaryhousing.com/#service-sell",
      "name": "Military Home Seller Representation",
      "serviceType": "Real estate seller representation",
      "description": "Listing and sale of homes for military owners on outbound PCS orders, including rent-versus-sell analysis and remote closings.",
      "provider": { "@id": "https://greggcostin.com/#team" },
      "areaServed": { "@type": "AdministrativeArea", "name": "Florida Panhandle" },
      "audience": { "@type": "Audience", "audienceType": "Military homeowners with outbound PCS orders" },
      "url": "https://pensacolamilitaryhousing.com/sell",
      "offers": { "@type": "Offer", "availability": "https://schema.org/InStock", "url": "https://pensacolamilitaryhousing.com/whats-my-home-worth" }
    },
    {
      "@type": "RealEstateAgent",
      "@id": "https://greggcostin.com/#team",
      "name": "Gregg Costin - The Costin Team",
      "alternateName": ["The Costin Team", "Gregg Costin Pensacola Realtor - Levin Rinke Realty"],
      "description": "Pensacola real estate team led by Gregg Costin at Levin Rinke Realty: buyer and seller representation across Escambia, Santa Rosa, and Okaloosa counties and coastal Alabama, with a military relocation, VA loan, and PCS specialty for NAS Pensacola, Corry Station, NAS Whiting Field, Eglin AFB, and Hurlburt Field.",
      "url": "https://greggcostin.com",
      "telephone": "+1-850-266-5005",
      "email": "greggcostin@gmail.com",
      "image": { "@id": "https://pensacolamilitaryhousing.com/#portrait" },
      "logo": { "@id": "https://pensacolamilitaryhousing.com/#logo" },
      "priceRange": "$$",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "220 W Garden St",
        "addressLocality": "Pensacola",
        "addressRegion": "FL",
        "postalCode": "32502",
        "addressCountry": "US"
      },
      "geo": { "@type": "GeoCoordinates", "latitude": 30.4129639, "longitude": -87.2188735 },
      "hasMap": "https://www.google.com/maps/place/Gregg+Costin+Pensacola+Realtor+-+Levin+Rinke+Realty/@30.4129639,-87.2188735,17z/data=!4m6!3m5!1s0x8890c1a04a17d29b:0xaaa3b223c50fa5fc!8m2!3d30.4129639!4d-87.2188735!16s%2Fg%2F11mdg2zjxd",
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          "opens": "GBP_OPENS_HH_MM",
          "closes": "GBP_CLOSES_HH_MM"
        }
      ],
      "areaServed": [
        { "@type": "City", "name": "Pensacola" },
        { "@type": "City", "name": "Gulf Breeze" },
        { "@type": "City", "name": "Pace" },
        { "@type": "City", "name": "Milton" },
        { "@type": "City", "name": "Navarre" },
        { "@type": "City", "name": "Cantonment" },
        { "@type": "City", "name": "Perdido Key" },
        { "@type": "City", "name": "Niceville" },
        { "@type": "City", "name": "Fort Walton Beach" },
        { "@type": "City", "name": "Crestview" },
        { "@type": "City", "name": "Orange Beach" },
        { "@type": "City", "name": "Gulf Shores" },
        { "@type": "AdministrativeArea", "name": "Escambia County, FL" },
        { "@type": "AdministrativeArea", "name": "Santa Rosa County, FL" },
        { "@type": "AdministrativeArea", "name": "Okaloosa County, FL" },
        { "@type": "AdministrativeArea", "name": "Baldwin County, AL" }
      ],
      "identifier": [
        { "@type": "PropertyValue", "propertyID": "Florida DBPR real estate license", "value": "FL_LICENSE_NUMBER" },
        { "@type": "PropertyValue", "propertyID": "Alabama Real Estate Commission license", "value": "AL_LICENSE_NUMBER" },
        { "@type": "PropertyValue", "propertyID": "Google Business Profile place ID", "value": "GBP_PLACE_ID" }
      ],
      "parentOrganization": { "@id": "https://greggcostin.com/#brokerage" },
      "founder": { "@id": "https://greggcostin.com/#gregg" },
      "employee": [{ "@id": "https://greggcostin.com/#gregg" }],
      "memberOf": [
        { "@type": "Organization", "name": "National Association of Realtors", "url": "https://www.nar.realtor/" },
        { "@type": "Organization", "name": "Florida Realtors", "url": "https://www.floridarealtors.org/" }
      ],
      "knowsAbout": [
        "Pensacola real estate market",
        "Gulf Breeze real estate",
        "Pace and Milton real estate",
        "Navarre real estate",
        "Perdido Key and Pensacola Beach waterfront homes",
        "New construction",
        "VA home loans",
        "PCS relocation",
        "Basic Allowance for Housing (BAH)",
        "Florida homestead exemption",
        "Florida home insurance and flood zones"
      ],
      "sameAs": [
        "https://pensacolamilitaryhousing.com/",
        "https://www.google.com/maps/place/Gregg+Costin+Pensacola+Realtor+-+Levin+Rinke+Realty/@30.4129639,-87.2188735,17z/data=!4m6!3m5!1s0x8890c1a04a17d29b:0xaaa3b223c50fa5fc!8m2!3d30.4129639!4d-87.2188735!16s%2Fg%2F11mdg2zjxd",
        "https://www.zillow.com/profile/GreggCostin",
        "https://www.homes.com/real-estate-agents/gregg-costin/864f0f3/",
        "https://www.facebook.com/greggcostin/",
        "https://www.instagram.com/greggcostinrealtor/",
        "https://linktr.ee/Greggcostin",
        "https://greggc.levinrinkerealty.com"
      ]
    },
    {
      "@type": "Person",
      "@id": "https://greggcostin.com/#gregg",
      "name": "Gregg Costin",
      "givenName": "Gregg",
      "familyName": "Costin",
      "alternateName": "Gregg Costin, Realtor",
      "honorificSuffix": "MRP, ABR, SRS, RENE, FMS",
      "jobTitle": "Realtor",
      "description": "Retired USAF Captain and E-3 AWACS Combat Systems Officer with 20 years of service and 11 PCS moves. Realtor with Levin Rinke Realty, licensed in Florida and Alabama, leading The Costin Team for civilian buyers and sellers and specializing in military relocation, VA loans, and PCS moves across the Florida Panhandle.",
      "url": "https://greggcostin.com/team",
      "image": [
        { "@id": "https://pensacolamilitaryhousing.com/#portrait" },
        {
          "@type": "ImageObject",
          "url": "https://greggcostin.com/images/gregg-courthouse.jpg",
          "width": 928,
          "height": 1152,
          "caption": "Gregg Costin at the Escambia County Courthouse, Pensacola"
        }
      ],
      "email": "greggcostin@gmail.com",
      "telephone": "+1-850-266-5005",
      "worksFor": { "@id": "https://greggcostin.com/#brokerage" },
      "memberOf": [
        { "@id": "https://greggcostin.com/#team" },
        { "@type": "Organization", "name": "National Association of Realtors", "url": "https://www.nar.realtor/" },
        { "@type": "Organization", "name": "Florida Realtors", "url": "https://www.floridarealtors.org/" }
      ],
      "alumniOf": [{ "@type": "Organization", "name": "United States Air Force" },{ "@type": "CollegeOrUniversity", "name": "University of Tampa" }],
      "award": [
        "Forbes Global Properties Rookie of the Year 2025",
        "Ranked number 3, number 4, and number 10 agent out of more than 450 agents on the Levin Rinke Realty leaderboard, Summer 2026",
        "Ranked number 34 Realtor of more than 4,100 agents in the Pensacola MLS by volume and transactions, as of August 1, 2026"
      ],
      "hasCredential": [
        {
          "@type": "EducationalOccupationalCredential",
          "name": "Florida Real Estate Sales Associate License",
          "credentialCategory": "license",
          "identifier": "FL_LICENSE_NUMBER",
          "recognizedBy": { "@type": "GovernmentOrganization", "name": "Florida Department of Business and Professional Regulation", "url": "https://www.myfloridalicense.com/" }
        },
        {
          "@type": "EducationalOccupationalCredential",
          "name": "Alabama Real Estate Salesperson License",
          "credentialCategory": "license",
          "identifier": "AL_LICENSE_NUMBER",
          "recognizedBy": { "@type": "GovernmentOrganization", "name": "Alabama Real Estate Commission", "url": "https://arec.alabama.gov/" }
        },
        {
          "@type": "EducationalOccupationalCredential",
          "name": "Military Relocation Professional (MRP)",
          "credentialCategory": "certification",
          "recognizedBy": { "@type": "Organization", "name": "National Association of Realtors" }
        },
        {
          "@type": "EducationalOccupationalCredential",
          "name": "Accredited Buyer's Representative (ABR)",
          "credentialCategory": "certification",
          "recognizedBy": { "@type": "Organization", "name": "National Association of Realtors" }
        },
        {
          "@type": "EducationalOccupationalCredential",
          "name": "Seller Representative Specialist (SRS)",
          "credentialCategory": "certification",
          "recognizedBy": { "@type": "Organization", "name": "National Association of Realtors" }
        },
        {
          "@type": "EducationalOccupationalCredential",
          "name": "Real Estate Negotiation Expert (RENE)",
          "credentialCategory": "certification",
          "recognizedBy": { "@type": "Organization", "name": "National Association of Realtors" }
        },
        {
          "@type": "EducationalOccupationalCredential",
          "name": "Florida Military Specialist (FMS)",
          "credentialCategory": "certification",
          "recognizedBy": { "@type": "Organization", "name": "Florida Realtors" }
        }
      ],
      "identifier": [
        { "@type": "PropertyValue", "propertyID": "Florida DBPR real estate license", "value": "FL_LICENSE_NUMBER" },
        { "@type": "PropertyValue", "propertyID": "Alabama Real Estate Commission license", "value": "AL_LICENSE_NUMBER" }
      ],
      "knowsAbout": [
        "Pensacola real estate market",
        "VA home loans",
        "PCS relocation",
        "Basic Allowance for Housing (BAH)",
        "Florida homestead exemption",
        "NAS Pensacola",
        "NAS Whiting Field",
        "Corry Station",
        "Saufley Field",
        "Hurlburt Field",
        "Eglin AFB",
        "Duke Field",
        "E-3 AWACS Combat Systems Officer"
      ],
      "knowsLanguage": "en-US",
      "sameAs": [
        "https://pensacolamilitaryhousing.com/about",
        "https://www.google.com/maps/place/Gregg+Costin+Pensacola+Realtor+-+Levin+Rinke+Realty/@30.4129639,-87.2188735,17z/data=!4m6!3m5!1s0x8890c1a04a17d29b:0xaaa3b223c50fa5fc!8m2!3d30.4129639!4d-87.2188735!16s%2Fg%2F11mdg2zjxd",
        "https://www.zillow.com/profile/GreggCostin",
        "https://www.homes.com/real-estate-agents/gregg-costin/864f0f3/",
        "https://www.linkedin.com/in/greggcostin/",
        "https://www.facebook.com/greggcostin/",
        "https://www.instagram.com/greggcostinrealtor/",
        "https://linktr.ee/Greggcostin",
        "https://greggc.levinrinkerealty.com"
      ]
    },
    {
      "@type": "Organization",
      "@id": "https://greggcostin.com/#brokerage",
      "name": "Levin Rinke Realty",
      "url": "https://www.levinrinkerealty.com/",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "220 W Garden St",
        "addressLocality": "Pensacola",
        "addressRegion": "FL",
        "postalCode": "32502",
        "addressCountry": "US"
      },
      "subOrganization": { "@id": "https://greggcostin.com/#team" },
      "employee": { "@id": "https://greggcostin.com/#gregg" }
    }
  ]
}
```

Notes: this merges the old `#localbusiness` node into `#team` (one NAP, hours on the agent) [schema-04], removes the 14 empty `makesOffer` shells and the three `price: 0` offers [list-06], and replaces `worksFor`/`jobTitle`/`alumniOf` on the business with `parentOrganization`/`founder` [schema-03]. `scripts/postbuild-spa-routes.mjs` continues to add per-route WebPage + BreadcrumbList unchanged. After `npm run build`: `grep -c RealEstateOrganization index.html dist/*.html` must be 0 [schema-01].

### 3.1.2 PMH static guide / base / community / blog page template (page-factory and blog-factory)

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      "@id": "PAGE_URL#article",
      "headline": "ARTICLE_HEADLINE_UNDER_110_CHARS",
      "description": "META_DESCRIPTION",
      "url": "PAGE_URL",
      "mainEntityOfPage": { "@id": "PAGE_URL#webpage" },
      "author": { "@id": "https://greggcostin.com/#gregg" },
      "publisher": { "@id": "https://greggcostin.com/#team" },
      "datePublished": "YYYY-MM-DDT08:00:00-05:00",
      "dateModified": "YYYY-MM-DDT08:00:00-05:00",
      "image": [
        { "@id": "PAGE_URL#primaryimage" },
        { "@id": "https://pensacolamilitaryhousing.com/#portrait" }
      ],
      "articleSection": "SECTION_NAME_E_G_VA_LOANS",
      "keywords": ["PRIMARY_KEYWORD", "SECONDARY_KEYWORD"],
      "about": [
        { "@type": "Thing", "name": "TOPIC_ENTITY_E_G_VA_FUNDING_FEE" },
        { "@type": "Place", "name": "TOPIC_PLACE_E_G_NAS_PENSACOLA" }
      ],
      "inLanguage": "en-US"
    },
    {
      "@type": "WebPage",
      "@id": "PAGE_URL#webpage",
      "url": "PAGE_URL",
      "name": "PAGE_TITLE_TAG_TEXT",
      "description": "META_DESCRIPTION",
      "isPartOf": { "@id": "https://pensacolamilitaryhousing.com/#website" },
      "breadcrumb": { "@id": "PAGE_URL#breadcrumb" },
      "primaryImageOfPage": { "@id": "PAGE_URL#primaryimage" },
      "about": { "@type": "Thing", "name": "TOPIC_ENTITY_E_G_VA_FUNDING_FEE" },
      "datePublished": "YYYY-MM-DDT08:00:00-05:00",
      "dateModified": "YYYY-MM-DDT08:00:00-05:00",
      "inLanguage": "en-US",
      "speakable": { "@type": "SpeakableSpecification", "cssSelector": [".quick-answer", "details > p"] }
    },
    {
      "@type": "ImageObject",
      "@id": "PAGE_URL#primaryimage",
      "url": "HERO_IMAGE_URL_1600x900",
      "contentUrl": "HERO_IMAGE_URL_1600x900",
      "width": 1600,
      "height": 900,
      "caption": "IMAGE_CAPTION_SAME_AS_ALT_TEXT",
      "creditText": "PHOTO_CREDIT_E_G_U_S_NAVY_PUBLIC_DOMAIN",
      "license": "LICENSE_URL_OR_DELETE_THIS_KEY"
    },
    {
      "@type": "ImageObject",
      "@id": "https://pensacolamilitaryhousing.com/#portrait",
      "url": "https://pensacolamilitaryhousing.com/images/gregg-portrait.jpg",
      "width": 1200,
      "height": 1200,
      "caption": "Gregg Costin, Realtor with Levin Rinke Realty, Pensacola, Florida"
    },
    {
      "@type": "BreadcrumbList",
      "@id": "PAGE_URL#breadcrumb",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://pensacolamilitaryhousing.com/" },
        { "@type": "ListItem", "position": 2, "name": "HUB_NAME_E_G_Guides", "item": "HUB_URL_MUST_BE_A_REAL_PAGE_E_G_https://pensacolamilitaryhousing.com/guides" },
        { "@type": "ListItem", "position": 3, "name": "PAGE_SHORT_TITLE", "item": "PAGE_URL" }
      ]
    },
    {
      "@type": "FAQPage",
      "@id": "PAGE_URL#faq",
      "mainEntity": [
        { "@type": "Question", "name": "QUESTION_1_EXACTLY_AS_VISIBLE_IN_SUMMARY", "acceptedAnswer": { "@type": "Answer", "text": "ANSWER_1_EXACTLY_AS_VISIBLE" } },
        { "@type": "Question", "name": "QUESTION_2_EXACTLY_AS_VISIBLE_IN_SUMMARY", "acceptedAnswer": { "@type": "Answer", "text": "ANSWER_2_EXACTLY_AS_VISIBLE" } }
      ]
    },
    {
      "@type": "Person",
      "@id": "https://greggcostin.com/#gregg",
      "name": "Gregg Costin",
      "jobTitle": "Realtor",
      "honorificSuffix": "MRP, ABR, SRS, RENE, FMS",
      "description": "Retired USAF Combat Systems Officer, Realtor with Levin Rinke Realty, licensed in Florida and Alabama.",
      "url": "https://greggcostin.com/team",
      "image": { "@id": "https://pensacolamilitaryhousing.com/#portrait" },
      "worksFor": { "@id": "https://greggcostin.com/#brokerage" },
      "memberOf": { "@id": "https://greggcostin.com/#team" },
      "sameAs": ["https://pensacolamilitaryhousing.com/about", "https://www.zillow.com/profile/GreggCostin", "https://www.linkedin.com/in/greggcostin/"]
    },
    {
      "@type": "RealEstateAgent",
      "@id": "https://greggcostin.com/#team",
      "name": "Gregg Costin - The Costin Team",
      "url": "https://greggcostin.com",
      "telephone": "+1-850-266-5005",
      "logo": { "@type": "ImageObject", "url": "https://pensacolamilitaryhousing.com/images/logo-08-sm.png", "width": 480, "height": 196 },
      "parentOrganization": { "@id": "https://greggcostin.com/#brokerage" },
      "founder": { "@id": "https://greggcostin.com/#gregg" }
    },
    {
      "@type": "Organization",
      "@id": "https://greggcostin.com/#brokerage",
      "name": "Levin Rinke Realty",
      "url": "https://www.levinrinkerealty.com/"
    }
  ]
}
```

Notes: the compact `#team` node replaces the 187 full redefinitions (31 different coordinates) [schema-03]; page geography stays on the existing Place node of base and community pages. `HUB_URL` must be `/communities`, `/blog`, `/bases` or `/guides`, never a `/#fragment` [schema-08] [idx-05]. Article.image is the hero plus the portrait, not the portrait alone [schema-07] [media-06]. The speakable selectors resolve only once the `.quick-answer` block from 3.4 exists; until then use `["h1","h2"]` [geo-09] [schema-02 (parse probe)]. Use `BlogPosting` instead of `Article` on blog posts; the blog index should carry one `Blog` node with `blogPost` rather than 11 image-less BlogPosting stubs [schema-06 (parse probe)]. Preview on `public/va-loan-guide.html` and run the Rich Results Test before the sitewide pass.

### 3.1.3 GC homepage `@graph` (replaces the blocks at `civilian-site/index.html:38-50`)

The three entity nodes are byte-identical to 3.1.1 so both domains reconcile to one graph [synergy-02].

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://greggcostin.com/#website",
      "url": "https://greggcostin.com/",
      "name": "Gregg Costin | The Costin Team",
      "alternateName": ["The Costin Team", "GreggCostin.com"],
      "description": "Pensacola, Florida real estate: buy or sell with Gregg Costin and The Costin Team at Levin Rinke Realty.",
      "inLanguage": "en-US",
      "publisher": { "@id": "https://greggcostin.com/#team" },
      "about": { "@id": "https://greggcostin.com/#team" }
    },
    {
      "@type": "WebPage",
      "@id": "https://greggcostin.com/#webpage",
      "url": "https://greggcostin.com/",
      "name": "Pensacola Realtor Gregg Costin | The Costin Team, 5.0 Stars",
      "description": "Pensacola Realtor with 80 five-star reviews. Gregg Costin and The Costin Team at Levin Rinke Realty help you buy or sell in Pensacola and Gulf Breeze.",
      "isPartOf": { "@id": "https://greggcostin.com/#website" },
      "about": { "@id": "https://greggcostin.com/#team" },
      "primaryImageOfPage": { "@id": "https://greggcostin.com/#courthouse-portrait" },
      "inLanguage": "en-US",
      "speakable": { "@type": "SpeakableSpecification", "cssSelector": ["h1", "h2"] }
    },
    {
      "@type": "ImageObject",
      "@id": "https://greggcostin.com/#courthouse-portrait",
      "url": "https://greggcostin.com/images/gregg-courthouse.jpg",
      "contentUrl": "https://greggcostin.com/images/gregg-courthouse.jpg",
      "width": 928,
      "height": 1152,
      "caption": "Gregg Costin at the Escambia County Courthouse, Pensacola"
    },
    {
      "@type": "ImageObject",
      "@id": "https://pensacolamilitaryhousing.com/#portrait",
      "url": "https://pensacolamilitaryhousing.com/images/gregg-portrait.jpg",
      "contentUrl": "https://pensacolamilitaryhousing.com/images/gregg-portrait.jpg",
      "width": 1200,
      "height": 1200,
      "caption": "Gregg Costin, Realtor with Levin Rinke Realty, Pensacola, Florida"
    },
    {
      "@type": "ImageObject",
      "@id": "https://pensacolamilitaryhousing.com/#logo",
      "url": "https://pensacolamilitaryhousing.com/images/logo-08-sm.png",
      "contentUrl": "https://pensacolamilitaryhousing.com/images/logo-08-sm.png",
      "width": 480,
      "height": 196,
      "caption": "The Costin Team at Levin Rinke Realty"
    },
    {
      "@type": "Service",
      "@id": "https://greggcostin.com/#service-buy",
      "name": "Buyer Representation",
      "serviceType": "Real estate buyer representation",
      "description": "Accredited Buyer's Representative (ABR) service for buyers in Pensacola, Gulf Breeze, Pace, Navarre, Perdido Key, and coastal Alabama: live MLS search, offer strategy, inspections, and closing.",
      "provider": { "@id": "https://greggcostin.com/#team" },
      "areaServed": [
        { "@type": "AdministrativeArea", "name": "Escambia County, FL" },
        { "@type": "AdministrativeArea", "name": "Santa Rosa County, FL" },
        { "@type": "AdministrativeArea", "name": "Baldwin County, AL" }
      ],
      "url": "https://greggcostin.com/buy",
      "offers": { "@type": "Offer", "availability": "https://schema.org/InStock", "url": "https://greggcostin.com/contact" }
    },
    {
      "@type": "Service",
      "@id": "https://greggcostin.com/#service-sell",
      "name": "Listing and Seller Representation",
      "serviceType": "Real estate seller representation",
      "description": "Seller Representative Specialist (SRS) listing service: comp-based pricing, professional photo and drone marketing, dedicated property websites, and RENE-certified negotiation.",
      "provider": { "@id": "https://greggcostin.com/#team" },
      "areaServed": [{ "@type": "AdministrativeArea", "name": "Escambia County, FL" },{ "@type": "AdministrativeArea", "name": "Santa Rosa County, FL" }],
      "url": "https://greggcostin.com/sell",
      "offers": { "@type": "Offer", "availability": "https://schema.org/InStock", "url": "https://greggcostin.com/sell" }
    },
    {
      "@type": "RealEstateAgent",
      "@id": "https://greggcostin.com/#team",
      "name": "Gregg Costin - The Costin Team",
      "alternateName": ["The Costin Team", "Gregg Costin Pensacola Realtor - Levin Rinke Realty"],
      "description": "Pensacola real estate team led by Gregg Costin at Levin Rinke Realty: buyer and seller representation across Escambia, Santa Rosa, and Okaloosa counties and coastal Alabama, with a military relocation, VA loan, and PCS specialty for NAS Pensacola, Corry Station, NAS Whiting Field, Eglin AFB, and Hurlburt Field.",
      "url": "https://greggcostin.com",
      "telephone": "+1-850-266-5005",
      "email": "greggcostin@gmail.com",
      "image": { "@id": "https://pensacolamilitaryhousing.com/#portrait" },
      "logo": { "@id": "https://pensacolamilitaryhousing.com/#logo" },
      "priceRange": "$$",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "220 W Garden St",
        "addressLocality": "Pensacola",
        "addressRegion": "FL",
        "postalCode": "32502",
        "addressCountry": "US"
      },
      "geo": { "@type": "GeoCoordinates", "latitude": 30.4129639, "longitude": -87.2188735 },
      "hasMap": "https://www.google.com/maps/place/Gregg+Costin+Pensacola+Realtor+-+Levin+Rinke+Realty/@30.4129639,-87.2188735,17z/data=!4m6!3m5!1s0x8890c1a04a17d29b:0xaaa3b223c50fa5fc!8m2!3d30.4129639!4d-87.2188735!16s%2Fg%2F11mdg2zjxd",
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          "opens": "GBP_OPENS_HH_MM",
          "closes": "GBP_CLOSES_HH_MM"
        }
      ],
      "areaServed": [
        { "@type": "City", "name": "Pensacola" },
        { "@type": "City", "name": "Gulf Breeze" },
        { "@type": "City", "name": "Pace" },
        { "@type": "City", "name": "Milton" },
        { "@type": "City", "name": "Navarre" },
        { "@type": "City", "name": "Cantonment" },
        { "@type": "City", "name": "Perdido Key" },
        { "@type": "City", "name": "Niceville" },
        { "@type": "City", "name": "Fort Walton Beach" },
        { "@type": "City", "name": "Crestview" },
        { "@type": "City", "name": "Orange Beach" },
        { "@type": "City", "name": "Gulf Shores" },
        { "@type": "AdministrativeArea", "name": "Escambia County, FL" },
        { "@type": "AdministrativeArea", "name": "Santa Rosa County, FL" },
        { "@type": "AdministrativeArea", "name": "Okaloosa County, FL" },
        { "@type": "AdministrativeArea", "name": "Baldwin County, AL" }
      ],
      "identifier": [
        { "@type": "PropertyValue", "propertyID": "Florida DBPR real estate license", "value": "FL_LICENSE_NUMBER" },
        { "@type": "PropertyValue", "propertyID": "Alabama Real Estate Commission license", "value": "AL_LICENSE_NUMBER" },
        { "@type": "PropertyValue", "propertyID": "Google Business Profile place ID", "value": "GBP_PLACE_ID" }
      ],
      "parentOrganization": { "@id": "https://greggcostin.com/#brokerage" },
      "founder": { "@id": "https://greggcostin.com/#gregg" },
      "employee": [{ "@id": "https://greggcostin.com/#gregg" }],
      "memberOf": [
        { "@type": "Organization", "name": "National Association of Realtors", "url": "https://www.nar.realtor/" },
        { "@type": "Organization", "name": "Florida Realtors", "url": "https://www.floridarealtors.org/" }
      ],
      "knowsAbout": [
        "Pensacola real estate market",
        "Gulf Breeze real estate",
        "Pace and Milton real estate",
        "Navarre real estate",
        "Perdido Key and Pensacola Beach waterfront homes",
        "New construction",
        "VA home loans",
        "PCS relocation",
        "Basic Allowance for Housing (BAH)",
        "Florida homestead exemption",
        "Florida home insurance and flood zones"
      ],
      "sameAs": [
        "https://pensacolamilitaryhousing.com/",
        "https://www.google.com/maps/place/Gregg+Costin+Pensacola+Realtor+-+Levin+Rinke+Realty/@30.4129639,-87.2188735,17z/data=!4m6!3m5!1s0x8890c1a04a17d29b:0xaaa3b223c50fa5fc!8m2!3d30.4129639!4d-87.2188735!16s%2Fg%2F11mdg2zjxd",
        "https://www.zillow.com/profile/GreggCostin",
        "https://www.homes.com/real-estate-agents/gregg-costin/864f0f3/",
        "https://www.facebook.com/greggcostin/",
        "https://www.instagram.com/greggcostinrealtor/",
        "https://linktr.ee/Greggcostin",
        "https://greggc.levinrinkerealty.com"
      ]
    },
    {
      "@type": "Person",
      "@id": "https://greggcostin.com/#gregg",
      "name": "Gregg Costin",
      "givenName": "Gregg",
      "familyName": "Costin",
      "alternateName": "Gregg Costin, Realtor",
      "honorificSuffix": "MRP, ABR, SRS, RENE, FMS",
      "jobTitle": "Realtor",
      "description": "Retired USAF Captain and E-3 AWACS Combat Systems Officer with 20 years of service and 11 PCS moves. Realtor with Levin Rinke Realty, licensed in Florida and Alabama, leading The Costin Team for civilian buyers and sellers and specializing in military relocation, VA loans, and PCS moves across the Florida Panhandle.",
      "url": "https://greggcostin.com/team",
      "image": [
        { "@id": "https://pensacolamilitaryhousing.com/#portrait" },
        {
          "@type": "ImageObject",
          "url": "https://greggcostin.com/images/gregg-courthouse.jpg",
          "width": 928,
          "height": 1152,
          "caption": "Gregg Costin at the Escambia County Courthouse, Pensacola"
        }
      ],
      "email": "greggcostin@gmail.com",
      "telephone": "+1-850-266-5005",
      "worksFor": { "@id": "https://greggcostin.com/#brokerage" },
      "memberOf": [
        { "@id": "https://greggcostin.com/#team" },
        { "@type": "Organization", "name": "National Association of Realtors", "url": "https://www.nar.realtor/" },
        { "@type": "Organization", "name": "Florida Realtors", "url": "https://www.floridarealtors.org/" }
      ],
      "alumniOf": [{ "@type": "Organization", "name": "United States Air Force" },{ "@type": "CollegeOrUniversity", "name": "University of Tampa" }],
      "award": [
        "Forbes Global Properties Rookie of the Year 2025",
        "Ranked number 3, number 4, and number 10 agent out of more than 450 agents on the Levin Rinke Realty leaderboard, Summer 2026",
        "Ranked number 34 Realtor of more than 4,100 agents in the Pensacola MLS by volume and transactions, as of August 1, 2026"
      ],
      "hasCredential": [
        {
          "@type": "EducationalOccupationalCredential",
          "name": "Florida Real Estate Sales Associate License",
          "credentialCategory": "license",
          "identifier": "FL_LICENSE_NUMBER",
          "recognizedBy": { "@type": "GovernmentOrganization", "name": "Florida Department of Business and Professional Regulation", "url": "https://www.myfloridalicense.com/" }
        },
        {
          "@type": "EducationalOccupationalCredential",
          "name": "Alabama Real Estate Salesperson License",
          "credentialCategory": "license",
          "identifier": "AL_LICENSE_NUMBER",
          "recognizedBy": { "@type": "GovernmentOrganization", "name": "Alabama Real Estate Commission", "url": "https://arec.alabama.gov/" }
        },
        {
          "@type": "EducationalOccupationalCredential",
          "name": "Military Relocation Professional (MRP)",
          "credentialCategory": "certification",
          "recognizedBy": { "@type": "Organization", "name": "National Association of Realtors" }
        },
        {
          "@type": "EducationalOccupationalCredential",
          "name": "Accredited Buyer's Representative (ABR)",
          "credentialCategory": "certification",
          "recognizedBy": { "@type": "Organization", "name": "National Association of Realtors" }
        },
        {
          "@type": "EducationalOccupationalCredential",
          "name": "Seller Representative Specialist (SRS)",
          "credentialCategory": "certification",
          "recognizedBy": { "@type": "Organization", "name": "National Association of Realtors" }
        },
        {
          "@type": "EducationalOccupationalCredential",
          "name": "Real Estate Negotiation Expert (RENE)",
          "credentialCategory": "certification",
          "recognizedBy": { "@type": "Organization", "name": "National Association of Realtors" }
        },
        {
          "@type": "EducationalOccupationalCredential",
          "name": "Florida Military Specialist (FMS)",
          "credentialCategory": "certification",
          "recognizedBy": { "@type": "Organization", "name": "Florida Realtors" }
        }
      ],
      "identifier": [
        { "@type": "PropertyValue", "propertyID": "Florida DBPR real estate license", "value": "FL_LICENSE_NUMBER" },
        { "@type": "PropertyValue", "propertyID": "Alabama Real Estate Commission license", "value": "AL_LICENSE_NUMBER" }
      ],
      "knowsAbout": [
        "Pensacola real estate market",
        "VA home loans",
        "PCS relocation",
        "Basic Allowance for Housing (BAH)",
        "Florida homestead exemption",
        "NAS Pensacola",
        "NAS Whiting Field",
        "Corry Station",
        "Saufley Field",
        "Hurlburt Field",
        "Eglin AFB",
        "Duke Field",
        "E-3 AWACS Combat Systems Officer"
      ],
      "knowsLanguage": "en-US",
      "sameAs": [
        "https://pensacolamilitaryhousing.com/about",
        "https://www.google.com/maps/place/Gregg+Costin+Pensacola+Realtor+-+Levin+Rinke+Realty/@30.4129639,-87.2188735,17z/data=!4m6!3m5!1s0x8890c1a04a17d29b:0xaaa3b223c50fa5fc!8m2!3d30.4129639!4d-87.2188735!16s%2Fg%2F11mdg2zjxd",
        "https://www.zillow.com/profile/GreggCostin",
        "https://www.homes.com/real-estate-agents/gregg-costin/864f0f3/",
        "https://www.linkedin.com/in/greggcostin/",
        "https://www.facebook.com/greggcostin/",
        "https://www.instagram.com/greggcostinrealtor/",
        "https://linktr.ee/Greggcostin",
        "https://greggc.levinrinkerealty.com"
      ]
    },
    {
      "@type": "Organization",
      "@id": "https://greggcostin.com/#brokerage",
      "name": "Levin Rinke Realty",
      "url": "https://www.levinrinkerealty.com/",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "220 W Garden St",
        "addressLocality": "Pensacola",
        "addressRegion": "FL",
        "postalCode": "32502",
        "addressCountry": "US"
      },
      "subOrganization": { "@id": "https://greggcostin.com/#team" },
      "employee": { "@id": "https://greggcostin.com/#gregg" }
    }
  ]
}
```

Note: the review figure "80" is 55 Google + 25 Zillow as of 2026-08-31; the live GC pages still say 54 and `public/llms.txt:340` says 79, so sync `content/reviews.json` first [eeat-05] [geo-05] [synergy-03]. Store the three entity nodes once in `content/entity/person.json` and have `page-factory.mjs`, `civilian-page-lib.mjs`, `civilian-blog-factory.mjs` and `index.html` read them; add a diff step to `audit-civilian.mjs` and a new `scripts/audit-entity.mjs` that fails when `#gregg`, `#team` or `#brokerage` is defined with conflicting values anywhere [schema-02].

### 3.1.4 GC neighborhood page template (`civilian-site/neighborhoods/<slug>.html`)

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://greggcostin.com/neighborhoods/NEIGHBORHOOD_SLUG#webpage",
      "url": "https://greggcostin.com/neighborhoods/NEIGHBORHOOD_SLUG",
      "name": "PAGE_TITLE_TAG_TEXT",
      "description": "META_DESCRIPTION",
      "isPartOf": { "@id": "https://greggcostin.com/#website" },
      "breadcrumb": { "@id": "https://greggcostin.com/neighborhoods/NEIGHBORHOOD_SLUG#breadcrumb" },
      "about": { "@id": "https://greggcostin.com/neighborhoods/NEIGHBORHOOD_SLUG#place" },
      "mainEntity": { "@id": "https://greggcostin.com/neighborhoods/NEIGHBORHOOD_SLUG#place" },
      "primaryImageOfPage": { "@id": "https://greggcostin.com/neighborhoods/NEIGHBORHOOD_SLUG#primaryimage" },
      "author": { "@id": "https://greggcostin.com/#gregg" },
      "publisher": { "@id": "https://greggcostin.com/#team" },
      "datePublished": "YYYY-MM-DDT08:00:00-05:00",
      "dateModified": "YYYY-MM-DDT08:00:00-05:00",
      "inLanguage": "en-US",
      "speakable": { "@type": "SpeakableSpecification", "cssSelector": [".quick-answer", "details > p"] }
    },
    {
      "@type": "Place",
      "@id": "https://greggcostin.com/neighborhoods/NEIGHBORHOOD_SLUG#place",
      "name": "NEIGHBORHOOD_NAME",
      "description": "ONE_PARAGRAPH_SUMMARY_THAT_ALSO_APPEARS_IN_VISIBLE_TEXT",
      "url": "https://greggcostin.com/neighborhoods/NEIGHBORHOOD_SLUG",
      "address": { "@type": "PostalAddress", "addressLocality": "CITY_NAME", "addressRegion": "FL", "postalCode": "PRIMARY_ZIP_CODE", "addressCountry": "US" },
      "geo": { "@type": "GeoCoordinates", "latitude": 30.4213, "longitude": -87.2169 },
      "containedInPlace": [
        { "@type": "City", "name": "CITY_NAME", "address": { "@type": "PostalAddress", "addressRegion": "FL", "addressCountry": "US" } },
        { "@type": "AdministrativeArea", "name": "COUNTY_NAME County, FL" }
      ],
      "hasMap": "https://www.google.com/maps/place/NEIGHBORHOOD_NAME,+CITY_NAME,+FL",
      "image": { "@id": "https://greggcostin.com/neighborhoods/NEIGHBORHOOD_SLUG#primaryimage" },
      "sameAs": ["WIKIPEDIA_OR_CITY_PAGE_URL_FOR_THIS_NEIGHBORHOOD_OR_DELETE_THIS_KEY"],
      "amenityFeature": [
        { "@type": "LocationFeatureSpecification", "name": "Zoned public schools", "value": "SCHOOL_ZONE_SUMMARY_E_G_A_K_SUTER_ELEMENTARY_WORKMAN_MIDDLE_PENSACOLA_HIGH" },
        { "@type": "LocationFeatureSpecification", "name": "Commute to downtown Pensacola", "value": "COMMUTE_MINUTES_SUMMARY" },
        { "@type": "LocationFeatureSpecification", "name": "Typical price band", "value": "PRICE_BAND_WITH_AS_OF_DATE_AND_SOURCE" },
        { "@type": "LocationFeatureSpecification", "name": "FEMA flood zone mix", "value": "FLOOD_NOTE_E_G_MOSTLY_X_AE_POCKETS_NEAR_BAYOU_TEXAR" }
      ]
    },
    {
      "@type": "ImageObject",
      "@id": "https://greggcostin.com/neighborhoods/NEIGHBORHOOD_SLUG#primaryimage",
      "url": "HERO_IMAGE_URL_1600_WIDE",
      "contentUrl": "HERO_IMAGE_URL_1600_WIDE",
      "width": 1600,
      "height": 1067,
      "caption": "IMAGE_CAPTION_WITH_PLACE_NAME",
      "creditText": "PHOTO_CREDIT_E_G_GREGG_COSTIN_THE_COSTIN_TEAM",
      "license": "LICENSE_URL_OR_DELETE_THIS_KEY"
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://greggcostin.com/neighborhoods/NEIGHBORHOOD_SLUG#breadcrumb",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://greggcostin.com/" },
        { "@type": "ListItem", "position": 2, "name": "Neighborhoods", "item": "https://greggcostin.com/neighborhoods" },
        { "@type": "ListItem", "position": 3, "name": "NEIGHBORHOOD_NAME", "item": "https://greggcostin.com/neighborhoods/NEIGHBORHOOD_SLUG" }
      ]
    },
    {
      "@type": "ItemList",
      "@id": "https://greggcostin.com/neighborhoods/NEIGHBORHOOD_SLUG#schools",
      "name": "Public schools zoned for NEIGHBORHOOD_NAME (verify with the district)",
      "itemListOrder": "https://schema.org/ItemListUnordered",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "SCHOOL_1_NAME", "url": "https://greggcostin.com/schools/SCHOOL_1_SLUG" },
        { "@type": "ListItem", "position": 2, "name": "SCHOOL_2_NAME", "url": "https://greggcostin.com/schools/SCHOOL_2_SLUG" },
        { "@type": "ListItem", "position": 3, "name": "SCHOOL_3_NAME", "url": "https://greggcostin.com/schools/SCHOOL_3_SLUG" }
      ]
    },
    {
      "@type": "FAQPage",
      "@id": "https://greggcostin.com/neighborhoods/NEIGHBORHOOD_SLUG#faq",
      "mainEntity": [
        { "@type": "Question", "name": "QUESTION_1_EXACTLY_AS_VISIBLE_IN_SUMMARY", "acceptedAnswer": { "@type": "Answer", "text": "ANSWER_1_EXACTLY_AS_VISIBLE" } },
        { "@type": "Question", "name": "QUESTION_2_EXACTLY_AS_VISIBLE_IN_SUMMARY", "acceptedAnswer": { "@type": "Answer", "text": "ANSWER_2_EXACTLY_AS_VISIBLE" } }
      ]
    },
    {
      "@type": "Person",
      "@id": "https://greggcostin.com/#gregg",
      "name": "Gregg Costin",
      "jobTitle": "Realtor",
      "honorificSuffix": "ABR, SRS, RENE, MRP, FMS",
      "description": "Realtor with Levin Rinke Realty, licensed in Florida and Alabama; retired USAF Combat Systems Officer.",
      "url": "https://greggcostin.com/team",
      "image": "https://greggcostin.com/images/gregg-courthouse.jpg",
      "worksFor": { "@id": "https://greggcostin.com/#brokerage" },
      "memberOf": { "@id": "https://greggcostin.com/#team" },
      "sameAs": ["https://pensacolamilitaryhousing.com/about", "https://www.zillow.com/profile/GreggCostin", "https://www.linkedin.com/in/greggcostin/"]
    },
    {
      "@type": "RealEstateAgent",
      "@id": "https://greggcostin.com/#team",
      "name": "Gregg Costin - The Costin Team",
      "url": "https://greggcostin.com",
      "telephone": "+1-850-266-5005",
      "logo": { "@type": "ImageObject", "url": "https://pensacolamilitaryhousing.com/images/logo-08-sm.png", "width": 480, "height": 196 },
      "areaServed": { "@id": "https://greggcostin.com/neighborhoods/NEIGHBORHOOD_SLUG#place" },
      "parentOrganization": { "@id": "https://greggcostin.com/#brokerage" },
      "founder": { "@id": "https://greggcostin.com/#gregg" }
    },
    {
      "@type": "Organization",
      "@id": "https://greggcostin.com/#brokerage",
      "name": "Levin Rinke Realty",
      "url": "https://www.levinrinkerealty.com/"
    }
  ]
}
```

Notes: `WebPage.about` and `mainEntity` point at the Place, not at `#team` (the same correction the 82 school pages need, where School should also carry `parentOrganization` instead of `isPartOf`) [schema-10] [schema-04 (parse probe)]. `containedInPlace.City` carries region inside a PostalAddress rather than bare `addressRegion`, which is the fix for the 19 PMH community pages too [schema-05 (parse probe)]. The compact Person node with `honorificSuffix` is the same one the civilian blog factory should inline in every post [geo-06] [gc-content-05].

### 3.1.5 VideoObject template (either site)

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "VideoObject",
      "@id": "PAGE_URL#video",
      "name": "VIDEO_TITLE_E_G_NAVY_POINT_TO_NAS_PENSACOLA_MAIN_GATE_COMMUTE",
      "description": "VIDEO_DESCRIPTION_ONE_OR_TWO_SENTENCES",
      "thumbnailUrl": [
        "https://pensacolamilitaryhousing.com/images/video/VIDEO_SLUG-1600.jpg",
        "https://pensacolamilitaryhousing.com/images/video/VIDEO_SLUG-4x3.jpg",
        "https://pensacolamilitaryhousing.com/images/video/VIDEO_SLUG-1x1.jpg"
      ],
      "uploadDate": "YYYY-MM-DDT08:00:00-05:00",
      "duration": "PT2M41S",
      "contentUrl": "https://customer-CLOUDFLARE_STREAM_CODE.cloudflarestream.com/STREAM_UID/downloads/default.mp4",
      "embedUrl": "https://www.youtube-nocookie.com/embed/YOUTUBE_VIDEO_ID",
      "url": "PAGE_URL",
      "inLanguage": "en-US",
      "isFamilyFriendly": true,
      "author": { "@id": "https://greggcostin.com/#gregg" },
      "creator": { "@id": "https://greggcostin.com/#gregg" },
      "publisher": { "@id": "https://greggcostin.com/#team" },
      "about": { "@type": "Place", "name": "SUBJECT_PLACE_NAME_E_G_NAVY_POINT_PENSACOLA_FL" },
      "contentLocation": {
        "@type": "Place",
        "name": "FILMING_LOCATION_NAME",
        "address": { "@type": "PostalAddress", "addressLocality": "CITY_NAME", "addressRegion": "FL", "addressCountry": "US" },
        "geo": { "@type": "GeoCoordinates", "latitude": 30.4213, "longitude": -87.2169 }
      },
      "keywords": ["KEYWORD_1", "KEYWORD_2"],
      "transcript": "FULL_TRANSCRIPT_TEXT_ALSO_RENDERED_IN_A_VISIBLE_DETAILS_BLOCK",
      "hasPart": [
        { "@type": "Clip", "name": "CHAPTER_1_NAME", "startOffset": 0, "endOffset": 45, "url": "PAGE_URL#t=0" },
        { "@type": "Clip", "name": "CHAPTER_2_NAME", "startOffset": 45, "endOffset": 120, "url": "PAGE_URL#t=45" }
      ]
    },
    {
      "@type": "WebPage",
      "@id": "PAGE_URL#webpage",
      "url": "PAGE_URL",
      "name": "PAGE_TITLE_TAG_TEXT",
      "isPartOf": { "@id": "SITE_WEBSITE_ID_E_G_https://pensacolamilitaryhousing.com/#website" },
      "video": { "@id": "PAGE_URL#video" },
      "primaryImageOfPage": { "@type": "ImageObject", "url": "https://pensacolamilitaryhousing.com/images/video/VIDEO_SLUG-1600.jpg", "width": 1600, "height": 900 },
      "inLanguage": "en-US"
    },
    {
      "@type": "Person",
      "@id": "https://greggcostin.com/#gregg",
      "name": "Gregg Costin",
      "jobTitle": "Realtor",
      "url": "https://greggcostin.com/team",
      "worksFor": { "@id": "https://greggcostin.com/#brokerage" }
    },
    {
      "@type": "RealEstateAgent",
      "@id": "https://greggcostin.com/#team",
      "name": "Gregg Costin - The Costin Team",
      "url": "https://greggcostin.com",
      "logo": { "@type": "ImageObject", "url": "https://pensacolamilitaryhousing.com/images/logo-08-sm.png", "width": 480, "height": 196 },
      "parentOrganization": { "@id": "https://greggcostin.com/#brokerage" }
    },
    {
      "@type": "Organization",
      "@id": "https://greggcostin.com/#brokerage",
      "name": "Levin Rinke Realty",
      "url": "https://www.levinrinkerealty.com/"
    }
  ]
}
```

Pairs with the lite embed in 3.4; keep either `contentUrl` (Cloudflare Stream) or `embedUrl` (YouTube), both is fine. Add a `<video:video>` entry to the sitemap for each video [media-05] [schema-11].

### 3.1.6 RealEstateListing + SingleFamilyResidence template (`greggcostin.com/listings/<slug>` or a listing subdomain)

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "RealEstateListing",
      "@id": "LISTING_PAGE_URL#listing",
      "url": "LISTING_PAGE_URL",
      "name": "STREET_ADDRESS, CITY_NAME, FL ZIP_CODE",
      "description": "PUBLIC_REMARKS_AS_SHOWN_ON_PAGE",
      "datePosted": "YYYY-MM-DDT08:00:00-05:00",
      "dateModified": "YYYY-MM-DDT08:00:00-05:00",
      "isPartOf": { "@id": "https://greggcostin.com/#website" },
      "breadcrumb": { "@id": "LISTING_PAGE_URL#breadcrumb" },
      "primaryImageOfPage": { "@id": "LISTING_PAGE_URL#photo1" },
      "mainEntity": { "@id": "LISTING_PAGE_URL#home" },
      "about": { "@id": "LISTING_PAGE_URL#home" },
      "author": { "@id": "https://greggcostin.com/#gregg" },
      "publisher": { "@id": "https://greggcostin.com/#team" },
      "inLanguage": "en-US"
    },
    {
      "@type": "SingleFamilyResidence",
      "@id": "LISTING_PAGE_URL#home",
      "name": "STREET_ADDRESS",
      "description": "SHORT_PROPERTY_SUMMARY",
      "url": "LISTING_PAGE_URL",
      "address": { "@type": "PostalAddress", "streetAddress": "STREET_ADDRESS", "addressLocality": "CITY_NAME", "addressRegion": "FL", "postalCode": "ZIP_CODE", "addressCountry": "US" },
      "geo": { "@type": "GeoCoordinates", "latitude": 30.4213, "longitude": -87.2169 },
      "containedInPlace": { "@type": "City", "name": "CITY_NAME" },
      "numberOfBedrooms": 3,
      "numberOfBathroomsTotal": 2,
      "numberOfFullBathrooms": 2,
      "numberOfPartialBathrooms": 0,
      "numberOfRooms": 7,
      "floorSize": { "@type": "QuantitativeValue", "value": 1850, "unitCode": "FTK", "unitText": "square feet" },
      "yearBuilt": 2004,
      "amenityFeature": [
        { "@type": "LocationFeatureSpecification", "name": "Garage", "value": "GARAGE_DESCRIPTION_E_G_2_CAR_ATTACHED" },
        { "@type": "LocationFeatureSpecification", "name": "FEMA flood zone", "value": "FLOOD_ZONE_E_G_X" },
        { "@type": "LocationFeatureSpecification", "name": "Roof", "value": "ROOF_TYPE_AND_YEAR" }
      ],
      "additionalProperty": [
        { "@type": "PropertyValue", "propertyID": "MLS number", "value": "MLS_NUMBER" },
        { "@type": "PropertyValue", "name": "Lot size", "value": "LOT_SIZE_ACRES", "unitText": "acres" },
        { "@type": "PropertyValue", "name": "HOA fee", "value": "HOA_FEE_PER_MONTH_OR_NONE" },
        { "@type": "PropertyValue", "name": "Listing brokerage", "value": "Levin Rinke Realty" }
      ],
      "photo": [
        { "@id": "LISTING_PAGE_URL#photo1" },
        { "@type": "ImageObject", "url": "PHOTO_2_URL", "width": 1600, "height": 1067, "caption": "PHOTO_2_CAPTION" }
      ],
      "hasMap": "https://www.google.com/maps/place/STREET_ADDRESS,+CITY_NAME,+FL+ZIP_CODE",
      "tourBookingPage": "https://greggcostin.com/contact",
      "offers": { "@id": "LISTING_PAGE_URL#offer" }
    },
    {
      "@type": "Offer",
      "@id": "LISTING_PAGE_URL#offer",
      "itemOffered": { "@id": "LISTING_PAGE_URL#home" },
      "price": 425000,
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "businessFunction": "http://purl.org/goodrelations/v1#Sell",
      "offeredBy": { "@id": "https://greggcostin.com/#team" },
      "url": "LISTING_PAGE_URL",
      "validFrom": "YYYY-MM-DDT08:00:00-05:00"
    },
    {
      "@type": "ImageObject",
      "@id": "LISTING_PAGE_URL#photo1",
      "url": "PHOTO_1_URL",
      "contentUrl": "PHOTO_1_URL",
      "width": 1600,
      "height": 1067,
      "caption": "Front exterior of STREET_ADDRESS, CITY_NAME, FL",
      "creditText": "Gregg Costin / The Costin Team"
    },
    {
      "@type": "BreadcrumbList",
      "@id": "LISTING_PAGE_URL#breadcrumb",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://greggcostin.com/" },
        { "@type": "ListItem", "position": 2, "name": "Featured Listings", "item": "https://greggcostin.com/listings" },
        { "@type": "ListItem", "position": 3, "name": "STREET_ADDRESS", "item": "LISTING_PAGE_URL" }
      ]
    },
    {
      "@type": "Person",
      "@id": "https://greggcostin.com/#gregg",
      "name": "Gregg Costin",
      "jobTitle": "Realtor",
      "url": "https://greggcostin.com/team",
      "telephone": "+1-850-266-5005",
      "worksFor": { "@id": "https://greggcostin.com/#brokerage" }
    },
    {
      "@type": "RealEstateAgent",
      "@id": "https://greggcostin.com/#team",
      "name": "Gregg Costin - The Costin Team",
      "url": "https://greggcostin.com",
      "telephone": "+1-850-266-5005",
      "logo": { "@type": "ImageObject", "url": "https://pensacolamilitaryhousing.com/images/logo-08-sm.png", "width": 480, "height": 196 },
      "parentOrganization": { "@id": "https://greggcostin.com/#brokerage" }
    },
    {
      "@type": "Organization",
      "@id": "https://greggcostin.com/#brokerage",
      "name": "Levin Rinke Realty",
      "url": "https://www.levinrinkerealty.com/"
    }
  ]
}
```

Notes: for a condominium such as 825 Bayshore #803 change the second node's `@type` to `Apartment` and set `floorLevel` to `"8"`; use `offeredBy`, never `seller`, and never a top-level `broker` key; `datePosted` is the real MLS list date; every brand URL is the apex `https://greggcostin.com`, not `www.` [list-02] [list-04]. Wrap several of these in an `ItemList` on `/buy` and `/sell` for the featured-listings row [list-05].

### 3.1.7 BreadcrumbList example (community page, hub is a real URL)

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "@id": "https://pensacolamilitaryhousing.com/communities/gulf-breeze#breadcrumb",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://pensacolamilitaryhousing.com/" },
    { "@type": "ListItem", "position": 2, "name": "Communities", "item": "https://pensacolamilitaryhousing.com/communities" },
    { "@type": "ListItem", "position": 3, "name": "Gulf Breeze" }
  ]
}
```

One-line migration for the 19 community pages (the 7 base crumbs get `/bases` once `public/bases.html` exists, the 53 guide crumbs get `/guides` or a two-level trail) [schema-08] [idx-05]:

```bash
sed -i 's|"name":"Neighborhoods","item":"https://pensacolamilitaryhousing.com/#neighborhoods"|"name":"Communities","item":"https://pensacolamilitaryhousing.com/communities"|' public/communities/*.html
```

### 3.2 robots.txt and _headers

Both live robots.txt files already do what the owner wants (UA smoke test 2026-09-02: all AI agents HTTP 200) [geo-07]. The versions below keep every existing Disallow, collapse 28 duplicated groups into 4 (RFC 9309 allows several `User-agent` lines per group), drop the `Crawl-delay` that only ever applied to unnamed bots, name the newer fetchers, and add the `Content-Signal` convention (unknown lines are ignored by crawlers that do not read it). After deploy re-run the UA smoke test and `diff <(curl -s https://pensacolamilitaryhousing.com/robots.txt) public/robots.txt`.

### 3.2.1 `public/robots.txt` (PMH, complete file)

```text
# robots.txt for pensacolamilitaryhousing.com
# Authoritative Pensacola military real estate hub, run by Gregg Costin, Retired USAF Combat Systems Officer.
# RFC 9309: a crawler obeys only the first group that names it, so /downloads/ (lead-magnet PDFs) and
# /cdn-cgi/ (Cloudflare internals) are repeated in every group. All well-behaved crawlers, including
# AI search and training crawlers, are welcome: we want to be the source assistants cite for
# Pensacola military housing, PCS, VA loan, and BAH questions.

User-agent: *
Allow: /
Disallow: /downloads/
Disallow: /cdn-cgi/
Content-Signal: search=yes, ai-input=yes, ai-train=yes

# Search engines
User-agent: Googlebot
User-agent: Googlebot-Image
User-agent: Google-Extended
User-agent: Google-CloudVertexBot
User-agent: Bingbot
User-agent: DuckDuckBot
User-agent: DuckAssistBot
User-agent: YandexBot
User-agent: Applebot
User-agent: Applebot-Extended
User-agent: PetalBot
Allow: /
Disallow: /downloads/
Disallow: /cdn-cgi/
Content-Signal: search=yes, ai-input=yes, ai-train=yes

# AI answer engines and assistants (OpenAI, Anthropic, Perplexity, Mistral)
User-agent: GPTBot
User-agent: OAI-SearchBot
User-agent: ChatGPT-User
User-agent: ClaudeBot
User-agent: Claude-SearchBot
User-agent: Claude-User
User-agent: Claude-Web
User-agent: anthropic-ai
User-agent: PerplexityBot
User-agent: Perplexity-User
User-agent: MistralAI-User
Allow: /
Disallow: /downloads/
Disallow: /cdn-cgi/
Content-Signal: search=yes, ai-input=yes, ai-train=yes

# Meta, Amazon, Common Crawl, and other AI or index crawlers
User-agent: Meta-ExternalAgent
User-agent: Meta-ExternalFetcher
User-agent: FacebookBot
User-agent: Amazonbot
User-agent: Bytespider
User-agent: CCBot
User-agent: cohere-ai
User-agent: YouBot
User-agent: Diffbot
User-agent: ImagesiftBot
Allow: /
Disallow: /downloads/
Disallow: /cdn-cgi/
Content-Signal: search=yes, ai-input=yes, ai-train=yes

Sitemap: https://pensacolamilitaryhousing.com/sitemap.xml

# AI content maps
# See: https://pensacolamilitaryhousing.com/llms.txt
# See: https://pensacolamilitaryhousing.com/llms-full.txt
```

### 3.2.2 `civilian-site/robots.txt` (GC, complete file)

```text
# robots.txt for greggcostin.com
# Gregg Costin | The Costin Team at Levin Rinke Realty, Pensacola, FL real estate.
# All well-behaved crawlers welcome, including AI assistants, answer engines, and training crawlers.
# RFC 9309: a crawler obeys only the first group that names it, so /cdn-cgi/ is repeated per group.

User-agent: *
Allow: /
Disallow: /cdn-cgi/
Content-Signal: search=yes, ai-input=yes, ai-train=yes

# Search engines
User-agent: Googlebot
User-agent: Googlebot-Image
User-agent: Google-Extended
User-agent: Google-CloudVertexBot
User-agent: Bingbot
User-agent: DuckDuckBot
User-agent: DuckAssistBot
User-agent: YandexBot
User-agent: Applebot
User-agent: Applebot-Extended
User-agent: PetalBot
Allow: /
Disallow: /cdn-cgi/
Content-Signal: search=yes, ai-input=yes, ai-train=yes

# AI answer engines and assistants (OpenAI, Anthropic, Perplexity, Mistral)
User-agent: GPTBot
User-agent: OAI-SearchBot
User-agent: ChatGPT-User
User-agent: ClaudeBot
User-agent: Claude-SearchBot
User-agent: Claude-User
User-agent: Claude-Web
User-agent: anthropic-ai
User-agent: PerplexityBot
User-agent: Perplexity-User
User-agent: MistralAI-User
Allow: /
Disallow: /cdn-cgi/
Content-Signal: search=yes, ai-input=yes, ai-train=yes

# Meta, Amazon, Common Crawl, and other AI or index crawlers
User-agent: Meta-ExternalAgent
User-agent: Meta-ExternalFetcher
User-agent: FacebookBot
User-agent: Amazonbot
User-agent: Bytespider
User-agent: CCBot
User-agent: cohere-ai
User-agent: YouBot
User-agent: Diffbot
User-agent: ImagesiftBot
Allow: /
Disallow: /cdn-cgi/
Content-Signal: search=yes, ai-input=yes, ai-train=yes

Sitemap: https://greggcostin.com/sitemap.xml

# AI content maps
# See: https://greggcostin.com/llms.txt
# See: https://greggcostin.com/llms-full.txt
```

The two `# See:` lines are the discoverability fix for the civilian llms files [geo-05]; add the footer `<a href="/llms.txt">` to the civilian template in the same pass.

### 3.2.3 `public/_headers` additions (PMH; append to the existing file)

```text
# De-index the *.pages.dev twin (canonical + JS redirect alone do not stop crawlers)
https://pensacolamilitaryhousing.pages.dev/*
  X-Robots-Tag: noindex

# Self-hosted fonts (once perf-05 lands): content never changes without a rename
/fonts/*
  Cache-Control: public, max-age=31536000, immutable

# Early Hints for the home page: hero LCP image + font origins
/
  Link: </images/hero-window.avif>; rel=preload; as=image; type=image/avif; fetchpriority=high, <https://fonts.googleapis.com>; rel=preconnect, <https://fonts.gstatic.com>; rel=preconnect; crossorigin
```

Verify: `curl -sI https://pensacolamilitaryhousing.pages.dev/bah-rates | grep -i x-robots-tag` [geo-02] [idx-02]; swap the hero path to `/images/hero-window-1200.avif` once the width variants exist [url-03] [perf-08]. The pages.dev block is the exact form already proven live on greggcostin.pages.dev.

### 3.2.4 `civilian-site/_headers` additions (GC; append)

```text
# Extracted shared CSS/JS (perf-10) and self-hosted fonts (perf-05): hashed or renamed on change
/assets/*
  Cache-Control: public, max-age=31536000, immutable
/fonts/*
  Cache-Control: public, max-age=31536000, immutable

# Early Hints for the home page: hero portrait + font origin
/
  Link: </images/gregg-courthouse.webp>; rel=preload; as=image; type=image/webp; fetchpriority=high, <https://fonts.gstatic.com>; rel=preconnect; crossorigin
```

Do not put a site-wide `Link:` under `/*`; it would attach to images and PDFs [url-03].

### 3.3 Title, description, OG and Twitter blocks for the core pages

All titles are 60 characters or fewer and all descriptions are 120 to 155 characters (script-checked). Each block also adds the tags PMH is missing on 88 pages (`og:locale`, `og:image:alt`, `twitter:title`, `twitter:description`, `twitter:url`) so the two sites share one head contract [og-04]. `twitter:site` is omitted because no X handle is recorded in the repo; add `<meta name="twitter:site" content="@HANDLE">` only if one exists [idx-09]. OG image paths keep the existing `/og/<slug>.png` filenames; regenerate them with the fixed generator (or emit `-v2` names) before re-scraping, because 71 of 93 current cards render entities and repeated words [og-01]. Lead-capture pages use `og:type` `website`, not `article` [og-05].

### PMH (pensacolamilitaryhousing.com)

**Home** (`index.html`, replaces the title at line 44 and description at line 45) [idx-09]

```html
<title>Pensacola Military Realtor | PCS, VA Loan & BAH Guides</title>
<meta name="description" content="Military relocation Realtor for NAS Pensacola, Whiting, Corry, Eglin and Hurlburt: 2026 BAH tables, VA loan guides, and base-by-base housing reports.">
<link rel="canonical" href="https://pensacolamilitaryhousing.com/">
<meta property="og:type" content="website">
<meta property="og:locale" content="en_US">
<meta property="og:site_name" content="Pensacola Military Housing">
<meta property="og:url" content="https://pensacolamilitaryhousing.com/">
<meta property="og:title" content="Pensacola Military Realtor | PCS, VA Loan & BAH Guides">
<meta property="og:description" content="Military relocation Realtor for NAS Pensacola, Whiting, Corry, Eglin and Hurlburt: 2026 BAH tables, VA loan guides, and base-by-base housing reports.">
<meta property="og:image" content="https://pensacolamilitaryhousing.com/og/home.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Pensacola Military Housing: Gregg Costin, Realtor, Levin Rinke Realty">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:url" content="https://pensacolamilitaryhousing.com/">
<meta name="twitter:title" content="Pensacola Military Realtor | PCS, VA Loan & BAH Guides">
<meta name="twitter:description" content="Military relocation Realtor for NAS Pensacola, Whiting, Corry, Eglin and Hurlburt: 2026 BAH tables, VA loan guides, and base-by-base housing reports.">
<meta name="twitter:image" content="https://pensacolamilitaryhousing.com/og/home.png">
```

**PCS Guide** (`src/routeMeta.js`, the `pcs` entry; the shell and runtime head sync both read it, so this is a JS edit, and it removes the em dash that ships in the live description today [idx-08] [og-03] [kw-07])

```js
{
  page: "pcs", file: "pcs-guide", slug: "/pcs-guide", shell: true, crumb: "PCS Guide",
  title: "PCS to Pensacola Guide 2026 | BAH, Housing, Schools",
  description: "PCS to Pensacola guide: 2026 BAH by base, on-base vs off-base housing, VA loan steps, school zones, and a 60/30/7-day timeline from a retired USAF officer.",
  heading: "PCS to Pensacola & the Emerald Coast",
  intro: "Everything a military family needs to plan a PCS to NAS Pensacola, Whiting Field, Corry Station, Hurlburt Field, Eglin AFB, or Duke Field: BAH, on-base vs off-base housing, VA loans, schools, and a 60/30/7-day timeline.",
},
```

Rendered head (what `scripts/postbuild-spa-routes.mjs` should emit for `/pcs-guide`):

```html
<title>PCS to Pensacola Guide 2026 | BAH, Housing, Schools</title>
<meta name="description" content="PCS to Pensacola guide: 2026 BAH by base, on-base vs off-base housing, VA loan steps, school zones, and a 60/30/7-day timeline from a retired USAF officer.">
<link rel="canonical" href="https://pensacolamilitaryhousing.com/pcs-guide">
<meta property="og:type" content="website">
<meta property="og:locale" content="en_US">
<meta property="og:site_name" content="Pensacola Military Housing">
<meta property="og:url" content="https://pensacolamilitaryhousing.com/pcs-guide">
<meta property="og:title" content="PCS to Pensacola Guide 2026 | BAH, Housing, Schools">
<meta property="og:description" content="PCS to Pensacola guide: 2026 BAH by base, on-base vs off-base housing, VA loan steps, school zones, and a 60/30/7-day timeline from a retired USAF officer.">
<meta property="og:image" content="https://pensacolamilitaryhousing.com/og/pcs-guide.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="PCS to Pensacola guide by Gregg Costin, retired USAF officer and Realtor">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:url" content="https://pensacolamilitaryhousing.com/pcs-guide">
<meta name="twitter:title" content="PCS to Pensacola Guide 2026 | BAH, Housing, Schools">
<meta name="twitter:description" content="PCS to Pensacola guide: 2026 BAH by base, on-base vs off-base housing, VA loan steps, school zones, and a 60/30/7-day timeline from a retired USAF officer.">
<meta name="twitter:image" content="https://pensacolamilitaryhousing.com/og/pcs-guide.png">
```

**VA Loan Guide** (`public/va-loan-guide.html`)

```html
<title>VA Loan Guide Pensacola 2026 | Funding Fee, Limits, COE</title>
<meta name="description" content="Pensacola VA loan guide for 2026: entitlement and COE, funding fee tiers, county loan limits, assumable VA loans, seller concessions, and closing costs.">
<link rel="canonical" href="https://pensacolamilitaryhousing.com/va-loan-guide">
<meta property="og:type" content="article">
<meta property="og:locale" content="en_US">
<meta property="og:site_name" content="Pensacola Military Housing">
<meta property="og:url" content="https://pensacolamilitaryhousing.com/va-loan-guide">
<meta property="og:title" content="VA Loan Guide Pensacola 2026 | Funding Fee, Limits, COE">
<meta property="og:description" content="Pensacola VA loan guide for 2026: entitlement and COE, funding fee tiers, county loan limits, assumable VA loans, seller concessions, and closing costs.">
<meta property="og:image" content="https://pensacolamilitaryhousing.com/og/va-loan-guide.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Pensacola VA loan guide 2026 by Gregg Costin, Realtor">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:url" content="https://pensacolamilitaryhousing.com/va-loan-guide">
<meta name="twitter:title" content="VA Loan Guide Pensacola 2026 | Funding Fee, Limits, COE">
<meta name="twitter:description" content="Pensacola VA loan guide for 2026: entitlement and COE, funding fee tiers, county loan limits, assumable VA loans, seller concessions, and closing costs.">
<meta name="twitter:image" content="https://pensacolamilitaryhousing.com/og/va-loan-guide.png">
```

**BAH Rates** (`public/bah-rates.html`; title moves to the query phrasing the Bing cluster uses, 60 characters exactly) [kw-04] [idx-09]

```html
<title>Pensacola BAH Rates 2026 (FL064) + Fort Walton Beach (FL023)</title>
<meta name="description" content="2026 BAH rates for Pensacola (FL064) and Fort Walton Beach (FL023) by rank, with and without dependents, plus a calculator that turns BAH into a VA budget.">
<link rel="canonical" href="https://pensacolamilitaryhousing.com/bah-rates">
<meta property="og:type" content="article">
<meta property="og:locale" content="en_US">
<meta property="og:site_name" content="Pensacola Military Housing">
<meta property="og:url" content="https://pensacolamilitaryhousing.com/bah-rates">
<meta property="og:title" content="Pensacola BAH Rates 2026 (FL064) + Fort Walton Beach (FL023)">
<meta property="og:description" content="2026 BAH rates for Pensacola (FL064) and Fort Walton Beach (FL023) by rank, with and without dependents, plus a calculator that turns BAH into a VA budget.">
<meta property="og:image" content="https://pensacolamilitaryhousing.com/og/bah-rates.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="2026 BAH rates for Pensacola FL064 and Fort Walton Beach FL023">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:url" content="https://pensacolamilitaryhousing.com/bah-rates">
<meta name="twitter:title" content="Pensacola BAH Rates 2026 (FL064) + Fort Walton Beach (FL023)">
<meta name="twitter:description" content="2026 BAH rates for Pensacola (FL064) and Fort Walton Beach (FL023) by rank, with and without dependents, plus a calculator that turns BAH into a VA budget.">
<meta name="twitter:image" content="https://pensacolamilitaryhousing.com/og/bah-rates.png">
```

**NAS Pensacola** (`public/bases/nas-pensacola.html`)

```html
<title>NAS Pensacola Housing Guide 2026 | BAH, Neighborhoods</title>
<meta name="description" content="NAS Pensacola housing guide: 2026 BAH (E-5 with dependents $1,863), NASC and NATTC student options, best neighborhoods by gate, commutes, and schools.">
<link rel="canonical" href="https://pensacolamilitaryhousing.com/bases/nas-pensacola">
<meta property="og:type" content="article">
<meta property="og:locale" content="en_US">
<meta property="og:site_name" content="Pensacola Military Housing">
<meta property="og:url" content="https://pensacolamilitaryhousing.com/bases/nas-pensacola">
<meta property="og:title" content="NAS Pensacola Housing Guide 2026 | BAH, Neighborhoods">
<meta property="og:description" content="NAS Pensacola housing guide: 2026 BAH (E-5 with dependents $1,863), NASC and NATTC student options, best neighborhoods by gate, commutes, and schools.">
<meta property="og:image" content="https://pensacolamilitaryhousing.com/og/bases-nas-pensacola.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="NAS Pensacola housing guide 2026 by Gregg Costin, Realtor">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:url" content="https://pensacolamilitaryhousing.com/bases/nas-pensacola">
<meta name="twitter:title" content="NAS Pensacola Housing Guide 2026 | BAH, Neighborhoods">
<meta name="twitter:description" content="NAS Pensacola housing guide: 2026 BAH (E-5 with dependents $1,863), NASC and NATTC student options, best neighborhoods by gate, commutes, and schools.">
<meta name="twitter:image" content="https://pensacolamilitaryhousing.com/og/bases-nas-pensacola.png">
```

**Communities** (`src/routeMeta.js` `neighborhoods` entry: `title` and `description` below, and rewrite the `intro` without its em dash [idx-08])

```html
<title>Pensacola Communities for Military Families | By Base</title>
<meta name="description" content="Compare 19 Pensacola and Emerald Coast communities for military families by base commute, 2026 BAH fit, schools, and flood risk: Gulf Breeze to Niceville.">
<link rel="canonical" href="https://pensacolamilitaryhousing.com/communities">
<meta property="og:type" content="website">
<meta property="og:locale" content="en_US">
<meta property="og:site_name" content="Pensacola Military Housing">
<meta property="og:url" content="https://pensacolamilitaryhousing.com/communities">
<meta property="og:title" content="Pensacola Communities for Military Families | By Base">
<meta property="og:description" content="Compare 19 Pensacola and Emerald Coast communities for military families by base commute, 2026 BAH fit, schools, and flood risk: Gulf Breeze to Niceville.">
<meta property="og:image" content="https://pensacolamilitaryhousing.com/og/communities.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Pensacola area communities for military families, compared by base">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:url" content="https://pensacolamilitaryhousing.com/communities">
<meta name="twitter:title" content="Pensacola Communities for Military Families | By Base">
<meta name="twitter:description" content="Compare 19 Pensacola and Emerald Coast communities for military families by base commute, 2026 BAH fit, schools, and flood risk: Gulf Breeze to Niceville.">
<meta name="twitter:image" content="https://pensacolamilitaryhousing.com/og/communities.png">
```

**Reviews** (`public/reviews.html`; title kept, description rewritten, `og:type` becomes `website` and the two `article:*` timestamps are removed [og-05])

```html
<title>Gregg Costin Reviews | Pensacola Military Realtor, 5.0 Stars</title>
<meta name="description" content="Gregg Costin reviews: 55 Google and 25 Zillow reviews, all 5.0 stars, from military families who bought or sold in Pensacola with a retired USAF Captain.">
<link rel="canonical" href="https://pensacolamilitaryhousing.com/reviews">
<meta property="og:type" content="website">
<meta property="og:locale" content="en_US">
<meta property="og:site_name" content="Pensacola Military Housing">
<meta property="og:url" content="https://pensacolamilitaryhousing.com/reviews">
<meta property="og:title" content="Gregg Costin Reviews | Pensacola Military Realtor, 5.0 Stars">
<meta property="og:description" content="Gregg Costin reviews: 55 Google and 25 Zillow reviews, all 5.0 stars, from military families who bought or sold in Pensacola with a retired USAF Captain.">
<meta property="og:image" content="https://pensacolamilitaryhousing.com/og/reviews.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Gregg Costin reviews: 5.0 stars on Google and Zillow">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:url" content="https://pensacolamilitaryhousing.com/reviews">
<meta name="twitter:title" content="Gregg Costin Reviews | Pensacola Military Realtor, 5.0 Stars">
<meta name="twitter:description" content="Gregg Costin reviews: 55 Google and 25 Zillow reviews, all 5.0 stars, from military families who bought or sold in Pensacola with a retired USAF Captain.">
<meta name="twitter:image" content="https://pensacolamilitaryhousing.com/og/reviews.png">
```

**Buy** (`public/buy.html`; title kept, description trimmed from 157 to 153, `og:type` to `website`)

```html
<title>Buy a Home in Pensacola | Military &amp; VA Buyer Guide</title>
<meta name="description" content="Buy a home in Pensacola with a military-savvy Realtor: PCS-timed search, VA loan strategy, base commute and school guidance, and remote tours for buyers.">
<link rel="canonical" href="https://pensacolamilitaryhousing.com/buy">
<meta property="og:type" content="website">
<meta property="og:locale" content="en_US">
<meta property="og:site_name" content="Pensacola Military Housing">
<meta property="og:url" content="https://pensacolamilitaryhousing.com/buy">
<meta property="og:title" content="Buy a Home in Pensacola | Military &amp; VA Buyer Guide">
<meta property="og:description" content="Buy a home in Pensacola with a military-savvy Realtor: PCS-timed search, VA loan strategy, base commute and school guidance, and remote tours for buyers.">
<meta property="og:image" content="https://pensacolamilitaryhousing.com/og/buy.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Buy a home in Pensacola with military and VA buyer guidance from Gregg Costin">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:url" content="https://pensacolamilitaryhousing.com/buy">
<meta name="twitter:title" content="Buy a Home in Pensacola | Military &amp; VA Buyer Guide">
<meta name="twitter:description" content="Buy a home in Pensacola with a military-savvy Realtor: PCS-timed search, VA loan strategy, base commute and school guidance, and remote tours for buyers.">
<meta name="twitter:image" content="https://pensacolamilitaryhousing.com/og/buy.png">
```

**Sell** (`public/sell.html`; title kept, description trimmed, `og:type` to `website`)

```html
<title>Sell Your Home in Pensacola | Zillow Premier Agent</title>
<meta name="description" content="Sell your Pensacola home with a Zillow Premier Agent: Showcase listings, drone video, a licensed transaction coordinator, and a ready pool of PCS buyers.">
<link rel="canonical" href="https://pensacolamilitaryhousing.com/sell">
<meta property="og:type" content="website">
<meta property="og:locale" content="en_US">
<meta property="og:site_name" content="Pensacola Military Housing">
<meta property="og:url" content="https://pensacolamilitaryhousing.com/sell">
<meta property="og:title" content="Sell Your Home in Pensacola | Zillow Premier Agent">
<meta property="og:description" content="Sell your Pensacola home with a Zillow Premier Agent: Showcase listings, drone video, a licensed transaction coordinator, and a ready pool of PCS buyers.">
<meta property="og:image" content="https://pensacolamilitaryhousing.com/og/sell.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Sell your Pensacola home with Gregg Costin, Zillow Premier Agent">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:url" content="https://pensacolamilitaryhousing.com/sell">
<meta name="twitter:title" content="Sell Your Home in Pensacola | Zillow Premier Agent">
<meta name="twitter:description" content="Sell your Pensacola home with a Zillow Premier Agent: Showcase listings, drone video, a licensed transaction coordinator, and a ready pool of PCS buyers.">
<meta name="twitter:image" content="https://pensacolamilitaryhousing.com/og/sell.png">
```

**Military Realtor Pensacola** (`public/military-realtor-pensacola.html`; both kept, review count corrected from 79 to 80 once `content/reviews.json` says 55 + 25)

```html
<title>Military Realtor Pensacola FL | Gregg Costin, Retired USAF</title>
<meta name="description" content="Pensacola military realtor who has lived it: retired USAF officer, 11 PCS moves, 5.0 stars across 80 reviews, VA loan and BAH expertise for every base.">
<link rel="canonical" href="https://pensacolamilitaryhousing.com/military-realtor-pensacola">
<meta property="og:type" content="article">
<meta property="og:locale" content="en_US">
<meta property="og:site_name" content="Pensacola Military Housing">
<meta property="og:url" content="https://pensacolamilitaryhousing.com/military-realtor-pensacola">
<meta property="og:title" content="Military Realtor Pensacola FL | Gregg Costin, Retired USAF">
<meta property="og:description" content="Pensacola military realtor who has lived it: retired USAF officer, 11 PCS moves, 5.0 stars across 80 reviews, VA loan and BAH expertise for every base.">
<meta property="og:image" content="https://pensacolamilitaryhousing.com/og/military-realtor-pensacola.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Gregg Costin, military Realtor in Pensacola FL, retired USAF">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:url" content="https://pensacolamilitaryhousing.com/military-realtor-pensacola">
<meta name="twitter:title" content="Military Realtor Pensacola FL | Gregg Costin, Retired USAF">
<meta name="twitter:description" content="Pensacola military realtor who has lived it: retired USAF officer, 11 PCS moves, 5.0 stars across 80 reviews, VA loan and BAH expertise for every base.">
<meta name="twitter:image" content="https://pensacolamilitaryhousing.com/og/military-realtor-pensacola.png">
```

### GC (greggcostin.com)

**Home** (`civilian-site/index.html`; the name now leads the title so the entity string is above the fold in the SERP [synergy-06] [idx-09])

```html
<title>Pensacola Realtor Gregg Costin | The Costin Team, 5.0 Stars</title>
<meta name="description" content="Pensacola Realtor with 80 five-star reviews. Gregg Costin and The Costin Team at Levin Rinke Realty help you buy or sell in Pensacola and Gulf Breeze.">
<link rel="canonical" href="https://greggcostin.com/">
<meta property="og:type" content="website">
<meta property="og:locale" content="en_US">
<meta property="og:site_name" content="Gregg Costin | The Costin Team">
<meta property="og:url" content="https://greggcostin.com/">
<meta property="og:title" content="Pensacola Realtor Gregg Costin | The Costin Team, 5.0 Stars">
<meta property="og:description" content="Pensacola Realtor with 80 five-star reviews. Gregg Costin and The Costin Team at Levin Rinke Realty help you buy or sell in Pensacola and Gulf Breeze.">
<meta property="og:image" content="https://greggcostin.com/og/home.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Gregg Costin, Pensacola Realtor, The Costin Team at Levin Rinke Realty">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:url" content="https://greggcostin.com/">
<meta name="twitter:title" content="Pensacola Realtor Gregg Costin | The Costin Team, 5.0 Stars">
<meta name="twitter:description" content="Pensacola Realtor with 80 five-star reviews. Gregg Costin and The Costin Team at Levin Rinke Realty help you buy or sell in Pensacola and Gulf Breeze.">
<meta name="twitter:image" content="https://greggcostin.com/og/home.png">
```

**Buy** (`civilian-site/buy.html`; title kept)

```html
<title>Buy a Home in Pensacola, FL | The Costin Team</title>
<meta name="description" content="Buy a home in Pensacola, Gulf Breeze, Pace, Navarre, or Perdido Key with an ABR-certified buyer agent: live MLS search, offer strategy, and inspections.">
<link rel="canonical" href="https://greggcostin.com/buy">
<meta property="og:type" content="website">
<meta property="og:locale" content="en_US">
<meta property="og:site_name" content="Gregg Costin | The Costin Team">
<meta property="og:url" content="https://greggcostin.com/buy">
<meta property="og:title" content="Buy a Home in Pensacola, FL | The Costin Team">
<meta property="og:description" content="Buy a home in Pensacola, Gulf Breeze, Pace, Navarre, or Perdido Key with an ABR-certified buyer agent: live MLS search, offer strategy, and inspections.">
<meta property="og:image" content="https://greggcostin.com/og/buy.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Buy a home in Pensacola with The Costin Team">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:url" content="https://greggcostin.com/buy">
<meta name="twitter:title" content="Buy a Home in Pensacola, FL | The Costin Team">
<meta name="twitter:description" content="Buy a home in Pensacola, Gulf Breeze, Pace, Navarre, or Perdido Key with an ABR-certified buyer agent: live MLS search, offer strategy, and inspections.">
<meta name="twitter:image" content="https://greggcostin.com/og/buy.png">
```

**Sell** (`civilian-site/sell.html`; title kept)

```html
<title>Sell Your Home in Pensacola, FL | The Costin Team</title>
<meta name="description" content="Sell your Pensacola home with an SRS-certified listing agent: comp-based pricing, professional photo and drone marketing, and RENE-certified negotiation.">
<link rel="canonical" href="https://greggcostin.com/sell">
<meta property="og:type" content="website">
<meta property="og:locale" content="en_US">
<meta property="og:site_name" content="Gregg Costin | The Costin Team">
<meta property="og:url" content="https://greggcostin.com/sell">
<meta property="og:title" content="Sell Your Home in Pensacola, FL | The Costin Team">
<meta property="og:description" content="Sell your Pensacola home with an SRS-certified listing agent: comp-based pricing, professional photo and drone marketing, and RENE-certified negotiation.">
<meta property="og:image" content="https://greggcostin.com/og/sell.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Sell your Pensacola home with The Costin Team">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:url" content="https://greggcostin.com/sell">
<meta name="twitter:title" content="Sell Your Home in Pensacola, FL | The Costin Team">
<meta name="twitter:description" content="Sell your Pensacola home with an SRS-certified listing agent: comp-based pricing, professional photo and drone marketing, and RENE-certified negotiation.">
<meta name="twitter:image" content="https://greggcostin.com/og/sell.png">
```

**Neighborhoods** (`civilian-site/neighborhoods.html`)

```html
<title>Best Pensacola Neighborhoods | Where to Live Guide 2026</title>
<meta name="description" content="Where to live in Pensacola: East Hill, Gulf Breeze, Navarre, Pace, Perdido Key, Pensacola Beach, plus Orange Beach and Gulf Shores, from a local Realtor.">
<link rel="canonical" href="https://greggcostin.com/neighborhoods">
<meta property="og:type" content="website">
<meta property="og:locale" content="en_US">
<meta property="og:site_name" content="Gregg Costin | The Costin Team">
<meta property="og:url" content="https://greggcostin.com/neighborhoods">
<meta property="og:title" content="Best Pensacola Neighborhoods | Where to Live Guide 2026">
<meta property="og:description" content="Where to live in Pensacola: East Hill, Gulf Breeze, Navarre, Pace, Perdido Key, Pensacola Beach, plus Orange Beach and Gulf Shores, from a local Realtor.">
<meta property="og:image" content="https://greggcostin.com/og/neighborhoods.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Pensacola neighborhoods guide by The Costin Team">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:url" content="https://greggcostin.com/neighborhoods">
<meta name="twitter:title" content="Best Pensacola Neighborhoods | Where to Live Guide 2026">
<meta name="twitter:description" content="Where to live in Pensacola: East Hill, Gulf Breeze, Navarre, Pace, Perdido Key, Pensacola Beach, plus Orange Beach and Gulf Shores, from a local Realtor.">
<meta name="twitter:image" content="https://greggcostin.com/og/neighborhoods.png">
```

**Search** (`civilian-site/search.html`; both kept)

```html
<title>Search Homes for Sale | The Costin Team, Pensacola</title>
<meta name="description" content="Search live MLS listings across Pensacola, Gulf Breeze, Pace, Navarre, and the Emerald Coast. Set up instant alerts or browse the map by city.">
<link rel="canonical" href="https://greggcostin.com/search">
<meta property="og:type" content="website">
<meta property="og:locale" content="en_US">
<meta property="og:site_name" content="Gregg Costin | The Costin Team">
<meta property="og:url" content="https://greggcostin.com/search">
<meta property="og:title" content="Search Homes for Sale | The Costin Team, Pensacola">
<meta property="og:description" content="Search live MLS listings across Pensacola, Gulf Breeze, Pace, Navarre, and the Emerald Coast. Set up instant alerts or browse the map by city.">
<meta property="og:image" content="https://greggcostin.com/og/search.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Search Pensacola homes for sale with The Costin Team">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:url" content="https://greggcostin.com/search">
<meta name="twitter:title" content="Search Homes for Sale | The Costin Team, Pensacola">
<meta name="twitter:description" content="Search live MLS listings across Pensacola, Gulf Breeze, Pace, Navarre, and the Emerald Coast. Set up instant alerts or browse the map by city.">
<meta name="twitter:image" content="https://greggcostin.com/og/search.png">
```

**Schools** (`civilian-site/schools.html`; description kept)

```html
<title>Pensacola School Grades &amp; Reports | Escambia, Santa Rosa</title>
<meta name="description" content="Official Florida DOE grades for all 82 graded public and charter schools in Escambia and Santa Rosa County, with a data report page for every school.">
<link rel="canonical" href="https://greggcostin.com/schools">
<meta property="og:type" content="website">
<meta property="og:locale" content="en_US">
<meta property="og:site_name" content="Gregg Costin | The Costin Team">
<meta property="og:url" content="https://greggcostin.com/schools">
<meta property="og:title" content="Pensacola School Grades &amp; Reports | Escambia, Santa Rosa">
<meta property="og:description" content="Official Florida DOE grades for all 82 graded public and charter schools in Escambia and Santa Rosa County, with a data report page for every school.">
<meta property="og:image" content="https://greggcostin.com/og/schools.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Florida DOE school grades for Escambia and Santa Rosa County">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:url" content="https://greggcostin.com/schools">
<meta name="twitter:title" content="Pensacola School Grades &amp; Reports | Escambia, Santa Rosa">
<meta name="twitter:description" content="Official Florida DOE grades for all 82 graded public and charter schools in Escambia and Santa Rosa County, with a data report page for every school.">
<meta name="twitter:image" content="https://greggcostin.com/og/schools.png">
```

**Team** (`civilian-site/team.html`; title kept)

```html
<title>Meet The Costin Team | Gregg Costin, Pensacola Realtor</title>
<meta name="description" content="Meet The Costin Team at Levin Rinke Realty: Gregg Costin, Forbes Global Properties Rookie of the Year 2025, with Realtors Rachel Ley and Nichole Sims.">
<link rel="canonical" href="https://greggcostin.com/team">
<meta property="og:type" content="profile">
<meta property="og:locale" content="en_US">
<meta property="og:site_name" content="Gregg Costin | The Costin Team">
<meta property="og:url" content="https://greggcostin.com/team">
<meta property="og:title" content="Meet The Costin Team | Gregg Costin, Pensacola Realtor">
<meta property="og:description" content="Meet The Costin Team at Levin Rinke Realty: Gregg Costin, Forbes Global Properties Rookie of the Year 2025, with Realtors Rachel Ley and Nichole Sims.">
<meta property="og:image" content="https://greggcostin.com/og/team.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="The Costin Team at Levin Rinke Realty, Pensacola">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:url" content="https://greggcostin.com/team">
<meta name="twitter:title" content="Meet The Costin Team | Gregg Costin, Pensacola Realtor">
<meta name="twitter:description" content="Meet The Costin Team at Levin Rinke Realty: Gregg Costin, Forbes Global Properties Rookie of the Year 2025, with Realtors Rachel Ley and Nichole Sims.">
<meta name="twitter:image" content="https://greggcostin.com/og/team.png">
```

**Reviews** (`civilian-site/reviews.html`; the name-led title makes GC the canonical brand-review page, count synced to 55 [synergy-03] [eeat-05])

```html
<title>Gregg Costin Reviews | 5.0 Stars, Pensacola Realtor</title>
<meta name="description" content="55 Google reviews and 25 Zillow reviews, all 5.0 stars, from Pensacola buyers and sellers who worked with Gregg Costin and The Costin Team.">
<link rel="canonical" href="https://greggcostin.com/reviews">
<meta property="og:type" content="website">
<meta property="og:locale" content="en_US">
<meta property="og:site_name" content="Gregg Costin | The Costin Team">
<meta property="og:url" content="https://greggcostin.com/reviews">
<meta property="og:title" content="Gregg Costin Reviews | 5.0 Stars, Pensacola Realtor">
<meta property="og:description" content="55 Google reviews and 25 Zillow reviews, all 5.0 stars, from Pensacola buyers and sellers who worked with Gregg Costin and The Costin Team.">
<meta property="og:image" content="https://greggcostin.com/og/reviews.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Gregg Costin reviews: 5.0 stars on Google and Zillow">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:url" content="https://greggcostin.com/reviews">
<meta name="twitter:title" content="Gregg Costin Reviews | 5.0 Stars, Pensacola Realtor">
<meta name="twitter:description" content="55 Google reviews and 25 Zillow reviews, all 5.0 stars, from Pensacola buyers and sellers who worked with Gregg Costin and The Costin Team.">
<meta name="twitter:image" content="https://greggcostin.com/og/reviews.png">
```

**FAQ** (`civilian-site/faq.html`; title kept)

```html
<title>Pensacola Real Estate FAQ | The Costin Team</title>
<meta name="description" content="Pensacola real estate FAQ: choosing an agent, buyer costs after the NAR settlement, selling costs, pricing, insurance, and neighborhoods, answered plainly.">
<link rel="canonical" href="https://greggcostin.com/faq">
<meta property="og:type" content="website">
<meta property="og:locale" content="en_US">
<meta property="og:site_name" content="Gregg Costin | The Costin Team">
<meta property="og:url" content="https://greggcostin.com/faq">
<meta property="og:title" content="Pensacola Real Estate FAQ | The Costin Team">
<meta property="og:description" content="Pensacola real estate FAQ: choosing an agent, buyer costs after the NAR settlement, selling costs, pricing, insurance, and neighborhoods, answered plainly.">
<meta property="og:image" content="https://greggcostin.com/og/faq.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Pensacola real estate FAQ from The Costin Team">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:url" content="https://greggcostin.com/faq">
<meta name="twitter:title" content="Pensacola Real Estate FAQ | The Costin Team">
<meta name="twitter:description" content="Pensacola real estate FAQ: choosing an agent, buyer costs after the NAR settlement, selling costs, pricing, insurance, and neighborhoods, answered plainly.">
<meta name="twitter:image" content="https://greggcostin.com/og/faq.png">
```

**Contact** (`civilian-site/contact.html`; title kept, email normalized to the GBP spelling [eeat-11])

```html
<title>Contact Gregg Costin | The Costin Team, Pensacola</title>
<meta name="description" content="Call or text (850) 266-5005, email greggcostin@gmail.com, or send a message online. The Costin Team responds within 2 hours during business hours.">
<link rel="canonical" href="https://greggcostin.com/contact">
<meta property="og:type" content="website">
<meta property="og:locale" content="en_US">
<meta property="og:site_name" content="Gregg Costin | The Costin Team">
<meta property="og:url" content="https://greggcostin.com/contact">
<meta property="og:title" content="Contact Gregg Costin | The Costin Team, Pensacola">
<meta property="og:description" content="Call or text (850) 266-5005, email greggcostin@gmail.com, or send a message online. The Costin Team responds within 2 hours during business hours.">
<meta property="og:image" content="https://greggcostin.com/og/contact.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Contact Gregg Costin and The Costin Team in Pensacola">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:url" content="https://greggcostin.com/contact">
<meta name="twitter:title" content="Contact Gregg Costin | The Costin Team, Pensacola">
<meta name="twitter:description" content="Call or text (850) 266-5005, email greggcostin@gmail.com, or send a message online. The Costin Team responds within 2 hours during business hours.">
<meta name="twitter:image" content="https://greggcostin.com/og/contact.png">
```

Keep the existing `hreflang` pair and `robots` meta on every page; normalize robots to `index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1` on PMH [og-04]. Add a title (60) and description (120 to 155) length assertion to `scripts/audit-civilian.mjs` and the new `scripts/audit-military.mjs` so the lengths stay fixed [idx-09] [og-02].

### 3.4 Short code patches

Standing rule: any patch that touches the static templates must be previewed on one page (`public/first-time-military-homebuyer.html` or `civilian-site/index.html`), then rolled out by sed with the audit gate at 0 findings.

### PMH

**P1. Real 404 instead of the soft-404 catch-all** [idx-01] [geo-08] [url-01] [analytics-11]

`public/_redirects`: delete the last rule `/* /index.html 200` and its comment block (lines 134 to 141). Every SPA route already has its own `dist/<route>.html` shell, so nothing else changes. Then create `public/404.html` (cloned by hand, never through page-factory, which would append a sitemap entry):

```html
<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Page Not Found | Pensacola Military Housing</title>
<meta name="robots" content="noindex">
<script async src="https://www.googletagmanager.com/gtag/js?id=G-W29GHBK38M"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());
gtag('config','G-W29GHBK38M');gtag('event','page_not_found',{page_path:location.pathname,page_referrer:document.referrer});</script>
<style>body{font-family:'Inter',system-ui,sans-serif;background:#0A0F1A;color:#E8E6DF;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;text-align:center;padding:24px}
h1{font-size:56px;color:#C9A84C;margin:0 0 8px;font-weight:600}p{color:#A5A496;line-height:1.7;max-width:460px;margin:0 auto 24px}
a{display:inline-block;background:#C9A84C;color:#0A0F1A;padding:13px 24px;border-radius:8px;font-weight:700;text-decoration:none;margin:0 6px 8px}
a.ghost{background:transparent;border:1px solid rgba(201,168,76,.35);color:#C9A84C}</style></head>
<body><div><h1>404</h1><p>That page does not exist here. The pages military families use most are one tap away.</p>
<a href="/">Home</a><a class="ghost" href="/pcs-guide">PCS Guide</a><a class="ghost" href="/bah-rates">2026 BAH Rates</a>
<a class="ghost" href="/va-loan-guide">VA Loan Guide</a><a class="ghost" href="/communities">Communities</a><a class="ghost" href="/contact">Contact</a></div></body></html>
```

`src/App.jsx`, `resolvePageFromPath` (line 2702), so client-side navigation to an unknown path is also flagged:

```js
const resolvePageFromPath = (pathname) => {
  const clean = pathname.replace(/\/$/, "") || "/";
  if (SLUG_TO_PAGE[clean]) return SLUG_TO_PAGE[clean];
  if (clean !== "/") {
    document.title = "Page not found | Pensacola Military Housing";
    if (typeof gtag === "function") gtag("event", "page_not_found", { page_path: clean, page_referrer: document.referrer });
    return "notfound";
  }
  return "home";
};
```

Verify: `curl -sI https://pensacolamilitaryhousing.com/nonexistent-page-xyz | head -1` returns 404; `/about`, `/pcs-guide`, `/communities`, `/mortgage-calculators`, `/contact`, `/blog` stay 200.

**P2. Missing short-form community and base redirects** (`public/_redirects`, insert after line 56) [url-04]

```text
/beulah                  /communities/beulah             301
/beulah.html             /communities/beulah             301
/fort-walton-beach       /communities/fort-walton-beach  301
/fort-walton-beach.html  /communities/fort-walton-beach  301
/mary-esther             /communities/mary-esther        301
/mary-esther.html        /communities/mary-esther        301
/niceville               /communities/niceville          301
/niceville.html          /communities/niceville          301
/shalimar                /communities/shalimar           301
/shalimar.html           /communities/shalimar           301
/whiting-field           /bases/whiting-field            301
/whiting-field.html      /bases/whiting-field            301
```

**P3. SPA fonts discovered in the head, not after React runs** (`index.html`, insert above the gtag script at line 19; delete the `@import` at `src/App.jsx:2789`) [perf-01] [perf-05]

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" onload="this.onload=null;this.rel='stylesheet'" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap"></noscript>
```

Also drop `;800` from the Inter weights in the two static templates (`public/first-time-military-homebuyer.html:55-56`, `civilian-site/index.html:74-75`) and the existing pages via sed; Inter 800 is never used.

**P4. Homepage hero as a responsive `<img>` instead of a 2000x2000 CSS background** [perf-08] [media-09]

Replace the `div` at `src/App.jsx:422`:

```jsx
<img className="hero-bg-image" alt="" decoding="async" fetchPriority="high"
  src="/images/hero-window-1200.jpg"
  srcSet="/images/hero-window-640.avif 640w, /images/hero-window-1200.avif 1200w, /images/hero-window-2000.avif 2000w"
  sizes="(max-width: 900px) 100vw, 60vw" width={2000} height={2000}
  style={{ position: "absolute", top: 180, right: 0, height: "calc(100% - 180px)", width: "auto", objectFit: "cover", objectPosition: "right top" }} />
```

`index.html:13` becomes:

```html
<link rel="preload" as="image" fetchpriority="high"
  imagesrcset="/images/hero-window-640.avif 640w, /images/hero-window-1200.avif 1200w, /images/hero-window-2000.avif 2000w"
  imagesizes="(max-width: 900px) 100vw, 60vw">
```

In the `<=900px` block at `index.html:460` change `background-size:cover!important;background-position:center 25%!important` to `object-fit:cover!important;object-position:center 25%!important` (same for the 640 and 480 rules), and delete the `.hero-bg-image` rule at `src/index.css:11-17`. The 640/1200/2000 files come from the resize pass in P5. `scripts/postbuild-spa-routes.mjs:92` already strips the home preload from the other shells.

**P5. Responsive `<picture>` with srcset for every static hero and card** (template `public/first-time-military-homebuyer.html`, then sed over `public/**` and `civilian-site/**`) [perf-03] [media-01]

```html
<picture>
  <source type="image/avif" sizes="(max-width: 640px) 100vw, (max-width: 1100px) 92vw, 1000px"
    srcset="/images/communities/cantonment-480.avif 480w, /images/communities/cantonment-768.avif 768w, /images/communities/cantonment-1200.avif 1200w, /images/communities/cantonment-1600.avif 1600w">
  <source type="image/webp" sizes="(max-width: 640px) 100vw, (max-width: 1100px) 92vw, 1000px"
    srcset="/images/communities/cantonment-480.webp 480w, /images/communities/cantonment-768.webp 768w, /images/communities/cantonment-1200.webp 1200w, /images/communities/cantonment-1600.webp 1600w">
  <img src="/images/communities/cantonment-1200.jpg"
    srcset="/images/communities/cantonment-480.jpg 480w, /images/communities/cantonment-768.jpg 768w, /images/communities/cantonment-1200.jpg 1200w, /images/communities/cantonment-1600.jpg 1600w"
    sizes="(max-width: 640px) 100vw, (max-width: 1100px) 92vw, 1000px"
    width="1600" height="900" alt="Cantonment, Florida: single-family homes north of NAS Pensacola"
    loading="eager" fetchpriority="high" decoding="async">
</picture>
```

Card preset: `sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 340px"`; author avatar: `sizes="60px"` with a 120w file. The variants come from a `scripts/generate-responsive-images.mjs` extension of the existing pipeline:

```js
// add to scripts/generate-modern-images.mjs: width variants, better encoders, never upscale
const WIDTHS = [480, 768, 1200, 1600];
const ENC = { avif: { quality: 50, effort: 6 }, webp: { quality: 74, effort: 6 }, jpeg: { quality: 78, mozjpeg: true, progressive: true } };
for (const w of WIDTHS.filter(w => w <= meta.width)) {
  for (const [fmt, opt] of Object.entries(ENC)) {
    const ext = fmt === "jpeg" ? "jpg" : fmt;
    await sharp(src).resize({ width: w, withoutEnlargement: true }).toFormat(fmt, opt).toFile(`${base}-${w}.${ext}`);
  }
}
// after encoding: delete any avif/webp variant whose size >= 95% of the jpg (restore-grown-images.mjs rule)
```

Run it over `civilian-site/images` too (currently 0 AVIF files) and replace or re-encode `pace-milton.webp` (788 KB, larger than its JPEG) [media-08].

**P6. Header logos: correct intrinsic dimensions, no fetchpriority, eager in the SPA** [perf-04] [perf-06] [media-03]

```bash
# template first (public/first-time-military-homebuyer.html:263-264), preview, then:
sed -i -E 's#<img fetchpriority="high" src="/images/logo-lrr.png" alt="Levin Rinke Realty"( width="240" height="108")?>#<img src="/images/logo-lrr.png" alt="Levin Rinke Realty" width="834" height="472" decoding="async">#g; s#<img fetchpriority="high" src="/images/logo-08-sm.png" alt="The Costin Team"( width="[0-9]+" height="[0-9]+")?>#<img src="/images/logo-08-sm.png" alt="The Costin Team" width="480" height="196" decoding="async">#g' public/*.html public/bases/*.html public/communities/*.html public/blog/*.html
```

`src/App.jsx:233` and `:236`:

```jsx
<Pic loading="eager" width={834} height={472} src={IMG.logoLrr} alt="Levin Rinke Realty" style={{ height: 108, objectFit: "contain" }} />
<Pic loading="eager" width={480} height={196} src={IMG.logo08} alt="The Costin Team" style={{ height: 108, objectFit: "contain" }} />
```

Also fix `scripts/blog-factory.mjs:308` so new posts inherit the dimensions.

**P7. SPA card grids that clip at 320px** (`src/App.jsx` lines 562, 580, 612, 756, 816, 1882, 2113, 2286, 2479) [mob-03]

```bash
sed -i 's/minmax(300px,1fr)/minmax(min(300px,100%),1fr)/g; s/minmax(320px,1fr)/minmax(min(320px,100%),1fr)/g' src/App.jsx
```

And in the static template `@media(max-width:640px)` block: `table{display:block;overflow-x:auto;-webkit-overflow-scrolling:touch}` for the 3 pages with bare tables.

**P8. FEMA date link fix and address-check action box** (`public/pensacola-flood-zones-homebuyers.html`) [cro-05]

Line 353 and line 388: wrap both dates.

```html
<a href="https://msc.fema.gov/portal/home" target="_blank" rel="noopener"><strong>August 19, 2025</strong></a>
```

Line 387 becomes `<h2 id="new-maps">New Flood Maps Took Effect August 19, 2025: What Changed</h2>` and this box goes directly under it:

```html
<div class="cta-strip">
  <p class="cs-txt"><strong>Check any address on the new maps</strong> (free, 60 seconds).</p>
  <div class="cs-actions">
    <a class="cs-btn" href="https://escambiacountyfl.withforerunner.com" target="_blank" rel="noopener">Escambia County map</a>
    <a class="cs-btn cs-ghost" href="https://pensacolafl.withforerunner.com" target="_blank" rel="noopener">City of Pensacola map</a>
    <a class="cs-btn cs-ghost" href="https://msc.fema.gov/portal/home" target="_blank" rel="noopener">FEMA Map Service Center</a>
  </div>
</div>
```

Gate for `scripts/audit-links.mjs`: any `<strong>` matching `(January|...|December) \d{1,2}, \d{4}` that is not inside an `<a>` is a finding.

**P9. PCS checklist form: align with the other forms (optional)** (`public/pcs-checklist.html:364-366`) [pcs-01]. Orchestrator note: the deployed worker in `workers/costin-contact/worker.js` already accepts the `honeypot` key (lines 24 to 26) and maps "PCS Checklist Download" to Lead (line 49), so this patch is hygiene, not a bug fix. The `r.ok` check is the useful part.

```js
var data = {
  name: name || '(not given)', email: email, phone: '',
  inquiryType: 'PCS / Relocation \u2014 Buying',   // the worker's exact stage-map string (its em dash is the documented sole exception)
  message: 'Requested the free PCS checklist + BAH cheat sheet PDF from ' + location.pathname + ' (lead magnet)',
  _gotcha: (f.querySelector('[name=website]').value || '')
};
fetch('https://costin-contact.gregg-costin.workers.dev', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
  .then(function (r) { if (!r.ok) throw new Error('worker ' + r.status); return r.json(); })
```

Change the offline GA label so a 400 is visible in GA4. The 825bayshore subdomain form is the one that actually misfiles: give its five options stage-map `value` attributes [list-01].

**P10. Success-gated lead events in the SPA and no on-load gate on /pcs-guide** [analytics-01] [cro-03]

Delete the document `submit` listener at `index.html:46-50`. In `src/App.jsx`, after `setStatus("success")` at about line 881 and 2569:

```js
track("inquiry_submit", { inquiry_type: formData.inquiryType, cta_location: "spa-modal", page_path: window.location.pathname });
```

In InquiryModal's mount effect (about line 491): `track("inquiry_open", { cta_location: "spa-modal" });`. Line 942: `const [gateOpen, setGateOpen] = useState(false);`. Mark `inquiry_submit` (never `form_submit`) as the GA4 key event.

**P11. Sitemap lastmod from the page, not the build date** (`scripts/bump-dates.mjs` step 1) [idx-03] [geo-04]

```js
import { readFileSync } from "fs";
const SPA = { "/about": 1, "/contact": 1, "/pcs-guide": 1, "/communities": 1, "/mortgage-calculators": 1 };
sitemap = sitemap.replace(/<loc>https:\/\/pensacolamilitaryhousing\.com(\/[^<]*)<\/loc>(\s*)<lastmod>[^<]+<\/lastmod>/g, (m, p, ws) => {
  let d = TODAY;
  if (!SPA[p] && !p.endsWith(".txt")) {
    const file = p === "/" ? "index.html" : "public" + p + ".html";
    const html = readFileSync(file, "utf8");
    const hit = html.match(/"dateModified":"(\d{4}-\d{2}-\d{2})/) || html.match(/"datePublished":"(\d{4}-\d{2}-\d{2})/);
    if (hit) d = hit[1];
  }
  return `<loc>https://pensacolamilitaryhousing.com${p}</loc>${ws}<lastmod>${d}</lastmod>`;
});
```

Make `--html` imply `--changed` (line 27: `const onlyChanged = !args.includes('--all')`) so a blanket dateModified stamp cannot happen by accident [og-05].

### GC

**G1. Mobile touch-target, hero CTA and modal patch** (append to the shared `<style>` in `civilian-site/index.html`, then sed to the other 101 pages; delete the `@480px` `!important` shrink rules at lines 208 to 217 first or they override this) [mob-04] [mob-05] [mob-06] [mob-08]

```css
@media (max-width: 900px) {
  .main-banner { position: relative }                                             /* unstick the 147-173px header (mob-02) */
  body { padding-bottom: calc(76px + env(safe-area-inset-bottom)) }               /* sticky bar no longer covers the footer */
  .sticky-mobile-cta { bottom: calc(12px + env(safe-area-inset-bottom)) }
  .hero .btn-row { display: flex; flex-direction: column; gap: 10px; margin: 0 0 20px }
  .hero-cta-overlay { display: none }                                             /* delete the overlay markup at line 269 after preview */
  .hero .btn-p, .hero .btn-g { min-height: 48px; line-height: 1.2 }
  .hero-portrait { max-width: 300px }
  .mil-band .btn-p { white-space: normal; overflow-wrap: anywhere; max-width: 100% }
  footer a { display: inline-block; padding: 10px 6px; min-height: 44px; line-height: 24px }
  .chips a { min-height: 44px; display: inline-flex; align-items: center }
  .banner-phone { display: inline-flex; align-items: center; min-height: 44px; padding: 0 8px; font-size: 15px }
  .banner-search { min-width: 44px; min-height: 44px; justify-content: center }
  .banner-tabs > a { min-height: 44px; padding: 10px 12px; font-size: 12px }
}
@media (max-width: 700px) { .tb-tile:nth-child(n+5) { display: none } }          /* 4 trust tiles on phones (cro-04) */
@media (max-width: 640px) {
  .imodal-overlay { padding: 16px 12px calc(24px + env(safe-area-inset-bottom)); align-items: flex-start }
  .imodal { padding: 44px 18px 22px; border-radius: 12px }
  .imodal-close { width: 44px; height: 44px; top: 6px; right: 6px; padding: 0; display: flex; align-items: center; justify-content: center }
  .imodal input, .imodal select, .imodal textarea { font-size: 16px; padding: 12px 14px }   /* stops iOS zoom */
  .imodal .isubmit { width: 100%; min-height: 48px }
}
@media (max-width: 480px) { .banner-email { display: none } .banner-row { gap: 8px; padding: 8px 10px 0 } }   /* 320px overflow (mob-03) */
```

The same modal block, `body` padding and touch-target rules go into the PMH template and the `App.jsx` style block (the PMH header is already relative on phones). The full hamburger drawer in [mob-01] supersedes the nav rules here once built.

**G2. Local logos, no cross-origin handshake in the first paint** [perf-04] [media-11]

```bash
cp public/images/logo-lrr.{png,avif,webp} public/images/logo-08-sm.{png,avif,webp} civilian-site/images/
sed -i 's#https://pensacolamilitaryhousing.com/images/logo-#/images/logo-#g; s#<img fetchpriority="high" src="/images/logo-#<img src="/images/logo-#g' civilian-site/*.html civilian-site/*/*.html
node scripts/audit-civilian.mjs   # must report 0 findings
```

**G3. Retired /about variants** (`civilian-site/_redirects`) [url-06]

```text
/about       /team 301
/about/      /team 301
/about.html  /team 301
```

**G4. Lazy LCP hero on sell, blog and resource pages** [media-04]

```bash
# first figure-band image on each affected page becomes eager + high priority; later figures stay lazy
for f in civilian-site/sell.html civilian-site/blog/*.html civilian-site/resources/florida-home-insurance.html; do
  perl -0pi -e 's/(<figure class="figure-band">.*?<img[^>]*?)loading="lazy"/$1loading="eager" fetchpriority="high"/s' "$f"
done
```

Bake the same rule into `scripts/civilian-blog-factory.mjs` and add an audit-civilian check that fails when the first `figure-band` img is lazy.

**G5. Clarity on greggcostin.com** (after the gtag block in `civilian-site/index.html`, then sed to all pages; create a separate Clarity project so heatmaps do not mix with PMH) [analytics-07]

```html
<script>(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window,document,"clarity","script","GC_CLARITY_PROJECT_ID");
try{if(localStorage.getItem('costin_internal')==='1'){clarity('set','internal','1');}clarity('set','site','civilian');}catch(e){}</script>
```

Add `clarity('event','inquiry_submit')` next to the GA4 call at `civilian-site/index.html:450` and in the PMH template line 634.

**G6. Visible byline on civilian blog posts** (template in `scripts/civilian-blog-factory.mjs`, rendered under the H1; the matching Person node is the compact one in 3.1.4) [geo-06] [eeat-07] [gc-content-05]

```html
<p class="byline">By <a href="/team#gregg">Gregg Costin</a>, Realtor (ABR, SRS, RENE), Levin Rinke Realty
  &middot; Published <time datetime="2026-08-31">August 31, 2026</time>
  &middot; Reviewed <time datetime="REVIEW_DATE_ISO">REVIEW_DATE_TEXT</time></p>
```

Give `civilian-site/team.html` the `id="gregg"` anchor and add a gate: at least 2 primary-source external links per post.

### BOTH

**B1. One gtag block for both domains** (replaces `index.html:20-26`, the static template line 47 to 50, and `civilian-site/index.html:55-57`; the click handler that follows stays, minus its `form_submit` listener) [analytics-02] [analytics-03] [analytics-04] [analytics-08] [analytics-12] [synergy-10]

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-W29GHBK38M"></script>
<script>
window.dataLayer = window.dataLayer || []; function gtag(){ dataLayer.push(arguments); }
gtag('js', new Date());
gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'granted', wait_for_update: 0 });
try {
  if (location.search.indexOf('internal=1') > -1) localStorage.setItem('costin_internal', '1');
  if (localStorage.getItem('costin_internal') === '1') gtag('set', { traffic_type: 'internal' });
} catch (e) {}
gtag('config', 'G-W29GHBK38M', { linker: { domains: ['pensacolamilitaryhousing.com', 'greggcostin.com'], accept_incoming: true } });
/* first-touch attribution, read back into every lead payload */
(function () { try {
  var p = new URLSearchParams(location.search), keys = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'];
  var a = JSON.parse(localStorage.getItem('costin_attr') || '{}'), hit = false;
  keys.forEach(function (k) { if (p.get(k)) { a[k] = p.get(k); hit = true; } });
  if (!a.landing_page || hit) { a.landing_page = location.pathname + location.search; a.referrer = document.referrer || ''; a.first_seen = new Date().toISOString(); }
  localStorage.setItem('costin_attr', JSON.stringify(a));
} catch (e) {} })();
/* cross-site click, added as the first branch of the existing click handler */
document.addEventListener('click', function (e) {
  var a = e.target.closest('a'); if (!a) return; var h = a.getAttribute('href') || '';
  if (h.indexOf('greggcostin.com') > -1 && location.hostname.indexOf('greggcostin') < 0) gtag('event', 'cross_site_click', { to_site: 'civilian', cta_location: location.pathname });
  else if (h.indexOf('pensacolamilitaryhousing.com') > -1 && location.hostname.indexOf('pensacolamilitary') < 0) gtag('event', 'cross_site_click', { to_site: 'military', cta_location: location.pathname });
});
</script>
```

Remove `gtag('config','GT-WVGM66XS')` only after confirming a single `page_view` per load in DebugView (`grep -rl "GT-WVGM66XS" public civilian-site` finds every copy). Register `cta_location`, `inquiry_type`, `link_domain`, `to_site` as event-scoped custom dimensions. In each submit handler build the payload as:

```js
var attr = {}; try { attr = JSON.parse(localStorage.getItem('costin_attr') || '{}'); } catch (e) {}
var data = Object.assign({ name: name, email: email, phone: phone, inquiryType: type, message: msg, _gotcha: gotcha }, attr, { page_path: location.pathname, sourceUrl: location.href });
function send() { fetch(WORKER, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(/* existing success path */); }
var sent = false; function once() { if (!sent) { sent = true; send(); } }
if (typeof gtag === 'function') { gtag('get', 'G-W29GHBK38M', 'client_id', function (id) { data.ga_client_id = id; once(); }); setTimeout(once, 300); } else { once(); }
```

If `workers/costin-contact/worker.js` is the deployed source, after line 72 push tags `'utm:' + utm_source + '/' + utm_medium` and `'landing:' + landing_page`, set `X-System` per `siteSource`, and append `Page | Landing | Referrer | GA cid` to the description at line 100.

**B2. Quick-answer block** (after the H1 lead, before the CTA strip; add to page-factory, blog-factory and civilian-blog-factory, then hand-edit the 10 Copilot-leading PMH pages and the 3 live GC posts) [geo-03] [geo-09]

```html
<div class="quick-answer" style="border-left:3px solid var(--gold);background:var(--gold-tint);padding:14px 18px;margin:0 0 24px;border-radius:0 10px 10px 0">
  <p style="margin:0 0 6px"><strong>Quick answer (September 2026):</strong> In MHA FL064 (Pensacola), an E-5 with dependents draws $1,863 per month in 2026 BAH and $1,644 without; the same rank in FL023 (Fort Walton Beach) draws $2,433 and $2,157.</p>
  <p style="margin:0;font-size:13px;color:var(--muted)">Gregg Costin, Realtor, Levin Rinke Realty. Source: DoD 2026 BAH tables, effective January 1, 2026.</p>
</div>
```

Two to four dated declarative sentences with the figure; the speakable selector `.quick-answer` in 3.1.2 and 3.1.4 then resolves.

**B3. Consent and disclosure text under every lead form** (replaces the footnote at `src/App.jsx:934` and `:2675`, `civilian-site/contact.html:270` and `:337`, and both static modals) [eeat-02]

```html
<p class="ifine">By submitting you agree that The Costin Team at Levin Rinke Realty may contact you by phone, email, and text message about your inquiry. Consent is not a condition of purchase; message and data rates may apply; reply STOP to opt out. See our <a href="/privacy">Privacy Policy</a>.</p>
```

Because the worker drops unknown keys, append the consent record to the message before POST: `data.message += ' | Consent: contact by phone/email/text, ' + new Date().toISOString() + ' via ' + location.pathname;`. Raise `.ifine` to `color:var(--muted);font-size:12px` and field borders to `1px solid rgba(255,255,255,.40)` so both pass WCAG contrast [cro-11]. The `/privacy` and `/accessibility` pages themselves are new static files on both sites [eeat-01].

**B4. Lite video embed (facade, no JS until click, CLS-safe)** [media-05] [schema-11]

```html
<figure class="vid" style="aspect-ratio:16/9;position:relative;background:#0A0F1A;margin:0 0 24px">
  <picture>
    <source type="image/avif" srcset="/images/video/nas-pensacola-commute-768.avif 768w, /images/video/nas-pensacola-commute-1200.avif 1200w" sizes="(max-width:640px) 100vw, 900px">
    <img src="/images/video/nas-pensacola-commute-1200.jpg" width="1600" height="900" alt="Navy Point to NAS Pensacola Main Gate commute, dashcam and aerial" loading="lazy" decoding="async" style="width:100%;height:100%;object-fit:cover;display:block">
  </picture>
  <button type="button" class="vid-play" data-yt="YOUTUBE_VIDEO_ID" aria-label="Play video: Navy Point to NAS Pensacola commute"
    style="position:absolute;inset:0;margin:auto;width:72px;height:72px;border-radius:50%;border:0;background:#C9A84C;color:#0A0F1A;font-weight:700;cursor:pointer">Play</button>
  <figcaption style="font-size:13px;color:var(--muted);padding:8px 0">2 min 41 s. Filmed September 2026.</figcaption>
</figure>
<details class="transcript"><summary>Read the transcript</summary><p>FULL_TRANSCRIPT_TEXT</p></details>
<script>
document.querySelectorAll('.vid-play').forEach(function (b) {
  b.addEventListener('click', function () {
    var f = document.createElement('iframe');
    f.src = 'https://www.youtube-nocookie.com/embed/' + b.dataset.yt + '?autoplay=1&rel=0&modestbranding=1';
    f.title = b.getAttribute('aria-label').replace('Play video: ', '');
    f.allow = 'autoplay; encrypted-media; picture-in-picture'; f.allowFullscreen = true; f.loading = 'lazy';
    f.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:0';
    b.parentElement.replaceChildren(f);
    if (typeof gtag === 'function') gtag('event', 'video_play', { video_id: b.dataset.yt, cta_location: location.pathname });
  });
});
</script>
```

For Cloudflare Stream swap the src for `https://customer-CODE.cloudflarestream.com/UID/iframe?poster=...` and `allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"`. Pair with 3.1.5 and the `<video:video>` sitemap entry.

**B5. FollowUpBoss on first interaction instead of idle** (replaces the `requestIdleCallback` line in all three templates) [analytics-09] [perf-07]

```js
['pointerdown', 'keydown', 'scroll', 'touchstart'].forEach(function (ev) { addEventListener(ev, loadFUB, { once: true, passive: true }); });
setTimeout(loadFUB, 8000);
```

### Dashboard-only (no repo change; owner actions, verify with curl afterwards)

| Setting | Where | Verify |
|---|---|---|
| Email Address Obfuscation: Off (both zones) | Cloudflare > Scrape Shield | `curl -s https://greggcostin.com/contact \| grep -c cdn-cgi/l/email-protection` = 0 [idx-11] [int-01] [perf-07] |
| Bot Fight Mode JS detection: Off (PMH zone) | Cloudflare > Security > Bots | no `/cdn-cgi/challenge-platform/` script in the PMH HTML [perf-07] |
| Speed Brain: On (GC zone, to match PMH) | Cloudflare > Speed > Content Optimization | `Speculation-Rules` header present on greggcostin.com [url-03] |
| Cross-domain measurement: both apex domains; unwanted referrals: both apex, both pages.dev twins, greggc.levinrinkerealty.com, greggcostin.realscout.com, calendly.com | GA4 Admin > Data streams > Configure tag settings | `_gl=` parameter on cross-site links [analytics-03] |
| Enhanced measurement: uncheck "Page changes based on browser history events" | GA4 Admin > Data streams | one `page_view` per SPA navigation in DebugView [analytics-05] |
| Internal traffic filter active (`traffic_type=internal`) | GA4 Admin > Data settings > Data filters | Gregg visits `/?internal=1` once per browser [analytics-08] |
| GBP website field, Zillow, Homes.com, LinkedIn, Realtor.com, Facebook, Instagram, Linktree: website = `https://greggcostin.com` | Each profile | brand SERP re-check next market-engine run [synergy-06] |

---

## 4. Media and visual redesign roadmap

This section turns the visual, media, mobile and performance findings into a build plan one developer can execute in order. Every spec below traces to a verified finding; nothing here depends on Lighthouse or CrUX numbers, which were not available this run. Sequencing rule throughout: patch the template file both factories clone (`public/first-time-military-homebuyer.html` for PMH, the civilian template for GC), preview on one page, then roll out with a scripted pass and the audit gates.

### 4.1 Hero banners

#### What the heroes do today

| Site | Measured state (375x812 unless noted) | Finding |
|---|---|---|
| PMH home (SPA) | Nav 161 px fixed; H1 at y=220; first CTA at y=641; three buttons plus five chips plus four one-column stats; third button sits under the sticky bar; hero photo crops to torso at 280 px; service content starts at 2,994 px | [cro-01] [cro-02] [mob-02] |
| PMH home hero image | 2000x2000 CSS background (98 KB AVIF, 277 KB JPEG fallback) painted into a 280 to 340 px box, no alt, no srcset, no mobile media condition, created only after React renders | [perf-08] [media-09] |
| GC home | Header 147 px sticky; H1 "Pensacola real estate, done with precision." has no service or proof word; CTAs hidden on mobile and replaced by an overlay inside `.hero-portrait` that inherits `line-height:0`, so buttons render 28 to 30 px tall at y=909; eight-tile trust band pushes the first service card to 1,868 px | [cro-04] [mob-04] |
| GC hero portrait | `gregg-courthouse.webp` 928x1152, 130 KB, `fetchpriority=high`, renders in a 380 px box, sits 1,100 to 1,600 px down on phones | [perf-03] |
| Both | Header logos also carry `fetchpriority=high`, so the LCP hero competes with two decorative PNGs for first bytes | [perf-04] [media-03] |

#### PMH hero spec (owner's H1 retained)

Copy candidates:

| Element | Candidate |
|---|---|
| Eyebrow | `Retired USAF CSO · 11 PCS moves · MRP certified` |
| H1 | Unchanged: `Pensacola's #1 military relocation REALTOR®` |
| Subhead A (82 chars) | `Homes that fit your BAH, a VA loan done right, and a plan before your report date.` |
| Subhead B (113 chars) | `VA loans, BAH-fit homes and sight-unseen buying for NAS Pensacola, Whiting, Corry, Eglin and Hurlburt families.` |
| Primary CTA (gold) | `Search Homes by Base` -> `/pcs-home-search` (ungated; today the gold button interposes a 5-field form while the ghost goes straight there) [cro-02] |
| Secondary CTA (ghost) | `Get My PCS Plan` -> opens inquiry modal with `inquiryType` prefilled to the PCS Buying string |
| Deleted | The `tel:` hero button (the sticky bar and nav phone already cover it) |
| Substantiation line (optional, once, under the eyebrow) | `55 five-star Google reviews · 25 Zillow · MRP, ABR, SRS, RENE, FMS` gives AI crawlers and skeptical readers something checkable next to the superlative [geo notes] [eeat-06] |

Layout:

- Mobile (<=900 px): header collapses to 56 px (spec in 4.2), eyebrow, H1, subhead, two stacked 48 px buttons, then a three-tile proof row (`5.0 ★ 79 reviews` linking `/reviews`, `Top X% Pensacola agents` with a dated basis, `11 PCS moves`), then a base-picker row of six links (NAS Pensacola, Whiting, Corry, Eglin, Hurlburt, `Not sure yet` -> `/pcs-guide`) so a base card is visible by roughly 900 px. The five designation chips collapse into one muted line inside the proof row. Hero image hidden under 900 px (the gradient already covers it; today the phone pays 98 KB for an image it never sees) [media-09] [cro-01].
- Desktop (>=901 px): two-column grid, copy left at max-width 560 px, portrait right as a real `<img>` with `object-fit:cover; object-position:right top`. Primary CTA must sit above 620 px on a 1366x768 viewport (today it is at 674 to 722 px, the bottom 6% of the fold) [cro-02].
- Stats row: `.hero-stats` becomes `repeat(2,1fr)` on phones with 22 px numerals instead of a 383 px one-column stack [cro-01].

LCP-safe implementation (replaces `src/App.jsx:422` div and `src/index.css:11-17`):

```jsx
<img className="hero-img" alt="Gregg Costin, military relocation Realtor, at a window overlooking downtown Pensacola"
  decoding="async" fetchPriority="high"
  src="/images/hero-window-1200.jpg"
  srcSet="/images/hero-window-640.avif 640w, /images/hero-window-1200.avif 1200w, /images/hero-window-2000.avif 2000w"
  sizes="(max-width:900px) 0px, 50vw"
  width={2000} height={2000}
  style={{position:'absolute',top:180,right:0,height:'calc(100% - 180px)',width:'auto',objectFit:'cover',objectPosition:'right top'}} />
```

```html
<!-- index.html:13 replaces the single-file preload -->
<link rel="preload" as="image" fetchpriority="high" media="(min-width:900px)"
  imagesrcset="/images/hero-window-640.avif 640w, /images/hero-window-1200.avif 1200w, /images/hero-window-2000.avif 2000w"
  imagesizes="50vw">
```

Plus `@media (max-width:899px){.hero-img{display:none}}` in the App style block, the same `<picture>` emitted into the prerendered shell by `scripts/postbuild-spa-routes.mjs` so non-JS crawlers and the LCP path see it, and the Google Fonts preconnect + preload lines copied from `public/first-time-military-homebuyer.html:53-56` into `index.html` so the H1 face stops waiting on the 99 KB bundle [perf-01] [perf-08] [media-09].

#### GC hero spec

Copy candidates:

| Element | Candidate |
|---|---|
| Eyebrow | `The Costin Team · Levin Rinke Realty · Pensacola` (carries the entity name above the fold, which the brand SERP currently lacks) [synergy-06] |
| H1 A | `Buy or sell a Pensacola home with a certified negotiator.` |
| H1 B | `Pensacola's 5.0-rated Realtor for buying and selling on the Gulf Coast.` |
| H1 C (keeps the current line) | `Pensacola real estate, done with precision: buy, sell, invest.` |
| Subhead | `55 Google and 25 Zillow reviews, all five stars. ABR, SRS and RENE certified. Escambia, Santa Rosa and the Emerald Coast.` (count sourced from `content/reviews.json`, see 4.2) [cro-12] [eeat-05] |
| Primary CTA (gold) | `Start My Home Search` -> RealScout onboarding |
| Secondary CTA (ghost) | `What's My Home Worth?` -> `/home-value` once built, RealScout HVA until then |
| Proof strip | Three tiles directly under the buttons: `5.0 Google · 55`, `5.0 Zillow · 25`, `#34 of 4,100+ (Aug 1, 2026)` |

Layout and CSS (inside the existing `@media(max-width:900px)` block of `civilian-site/index.html`):

```css
.hero .btn-row{display:flex;flex-direction:column;gap:10px;margin:0 0 20px}   /* replaces display:none at :190 */
.hero-cta-overlay{display:none}                                                 /* delete markup at :269 after preview */
.hero .btn-p,.hero .btn-g{min-height:48px;line-height:1.2}
.hero .lead{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.hero-portrait{max-width:300px}
.tb-tile:nth-child(n+5){display:none}                                           /* keep Google, Zillow, MLS #34, Forbes on phones */
```

Order on phones: eyebrow, H1, lead (3 lines), two 48 px buttons, proof strip, portrait, then the four-tile trust band and the service cards. The portrait moves below the fold, so it drops `fetchpriority=high` and gains `loading="lazy"`; the first visible service card should land near 1,100 px instead of 1,868 px [cro-04] [mob-04]. On desktop keep the two-column hero but move the trust band above the 823 px fold by trimming to four tiles.

Trust strip contents, both sites: rename PMH's "Preferred Agent" logo bar to "Affiliations and Partner Networks", link VeteranPCS, Tier 1 PCS and M.O.R.E. Network to Gregg's public profile on each partner site (third-party proof), leave Levin Rinke and Forbes unlinked, render logos in 120x56 boxes inside a horizontally scrolling strip (about 110 px tall on phones instead of 1,146 px) [cro-01] [cro-12].

### 4.2 Visual layout adjustments

#### Mobile header and hamburger

Both sites wrap 13 to 15 tabs into 3 to 6 rows of 9 to 10 px uppercase chips (GC 375 px: 3 rows, 147 px, sticky; PMH static 375 px: 5 rows, 165 px; SPA: 5 rows, 161 px fixed). Reading area on GC phones is 58 to 74% of the screen [mob-01] [mob-02]. Spec for <=900 px, shared by both static templates and mirrored in the SPA `Nav`:

```html
<div class="banner-row">
  <a class="banner-logo" href="/"><img src="/images/logo-08-sm.png" width="480" height="196" alt="The Costin Team"></a>
  <a class="banner-phone" href="tel:8502665005">850-266-5005</a>
  <button class="nav-toggle" aria-controls="site-drawer" aria-expanded="false" aria-label="Open menu"><!-- 3-bar SVG --></button>
</div>
<div id="site-drawer" class="site-drawer"> <!-- wraps the existing .banner-tabs --> </div>
```

```css
@media(max-width:900px){
  .main-banner{position:sticky;top:0}                 /* acceptable once it is 56px, under 10% of the viewport */
  .banner-row{grid-template-columns:auto 1fr auto;padding:8px 12px;gap:10px;min-height:56px}
  .banner-lrr,.banner-email{display:none}             /* removes the 118px unbreakable email that overflows at 320px */
  .banner-logo img{height:40px!important}
  .banner-phone{display:inline-flex;align-items:center;min-width:44px;min-height:44px;padding:0 10px;font-size:15px!important}
  .nav-toggle{display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;border:1px solid var(--gold-line);border-radius:8px;background:transparent;color:var(--gold)}
  .site-drawer{display:none;position:fixed;inset:56px 0 0 0;background:var(--ink);overflow-y:auto;padding:8px 12px calc(88px + env(safe-area-inset-bottom));z-index:1001}
  .site-drawer.open{display:block}
  .banner-tabs{flex-direction:column;align-items:stretch;gap:0;padding:0}
  .banner-tabs>a,.banner-tabs .dropdown>button{display:flex;align-items:center;min-height:48px;padding:0 12px;font-size:15px;letter-spacing:.3px;border-bottom:1px solid var(--hair);border-radius:0;width:100%;text-align:left}
  .dropdown-menu{position:static;display:none;box-shadow:none;border:0;padding:0 0 0 12px;max-height:none}
  .dropdown.open .dropdown-menu{display:block}
  .dropdown-menu a{min-height:44px;display:flex;align-items:center;font-size:14px}
}
@media(min-width:901px){.nav-toggle{display:none}}
```

Rules that ride with it: delete the `@480px` `!important` shrink block (`civilian-site/index.html:208-217` and the PMH equivalent) or it overrides the patch; a 12-line script toggles `.open` and `aria-expanded`, locks `body.overflow` while open, closes on Escape and on link click; dropdown buttons get `aria-expanded` and toggle on tap under `(hover:none)` instead of navigating, with the hub link as the first item in each menu; the `PCS Guide` and `VA Loan Guide` inline `onclick` navigations are removed [mob-07]. In the SPA add `menuOpen` state, call `setMenuOpen(false)` inside `go()`, and until the drawer ships set `.spa-nav{position:relative!important}` under 900 px with `[id]{scroll-margin-top:170px}` for the hash routes [mob-02] [mob-09]. Then, once the drawer is live, scroll-margin drops to 64 px.

Body compensation for the sticky bar, all three style sources: `body{padding-bottom:calc(76px + env(safe-area-inset-bottom))}` and `.sticky-mobile-cta{bottom:calc(12px + env(safe-area-inset-bottom))}` so the footer family line and disclaimer are reachable [mob-06].

#### CTA hierarchy and label set

Today PMH uses 24 distinct primary-button labels and GC 17, and GC styles an off-site exit (`Visit PensacolaMilitaryHousing.com`) as a gold primary [cro-08]. Fixed three-tier system, enforced by a factory check that fails a page with more than one `.btn-p/.ip` before the first `<h2>` or a primary label outside the set:

| Tier | Style | PMH labels | GC labels |
|---|---|---|---|
| 1, gold, exactly one above the first H2 | `.btn-p` / `.ip` | Search-intent pages `Search Homes by Base`; guides `Get My PCS Plan`; sell pages `Get My Home Value` | Buy/search `Start My Home Search`; sell `Get My Home Value`; other `Send a Message` |
| 2, ghost | `.btn-g` / `.il` | `Text (850) 266-5005` | `Text (850) 266-5005` |
| 3, text link | plain link | `Free PCS Checklist`, `Book a 15-minute call` | `Book a 15-minute call` |

Every guide gets the `cta-strip` after the author card (today only 15 of 93 PMH pages have one, and the page-header hero on every static page contains no button) with a per-type line: PCS pages `Orders to Pensacola? Text me your rank and report date`; VA pages `VA loan question? Text me, I answer within 2 hours`; tax and insurance pages `Buying in Escambia or Santa Rosa? Get the numbers for your address`; community pages `Want a shortlist in {community}? Text me your BAH`. GC `buy`, `sell`, `search` and `neighborhoods` get one `btn-p` inside `<header>` directly after `.lead` [cro-09]. The `/pcs-guide` on-load modal becomes opt-in (`useState(false)`), armed only at 60% scroll and suppressed for 30 days after display [cro-03].

Two content-level dead-click fixes belong in the same pass: on the flood-zones page wrap both `August 19, 2025` strings in a link to `https://msc.fema.gov/portal/home` and insert an action box under the H2 with the Escambia and City of Pensacola Forerunner map buttons (216 dead and 72 rage clicks on that date string) [cro-05]; on `/pcs-home-search` move the stock figure below the first base picker or wrap it in `<a href="#phs-bases">` (28 dead clicks) [cro-07].

#### Section rhythm

Every SPA section uses ink `#0A0F1A` or panel `#121823`; the light tokens `CREAM #F5F1E8` and `LIGHT #F2F0EA` are declared and never used; there are 0 SVG icons on the GC home, 1 on the PMH template, 3 in the SPA [cro-10]. Rhythm rules:

1. Alternate `Section bg` between `C.ink` and `C.panel` on the SPA home so boundaries read; keep the dark palette.
2. Add one gold hairline (`1px solid var(--gold-line)`) at the top of every panel-bg section and a 64 px vertical rhythm on desktop, 48 px on phones.
3. Add a 6-glyph inline SVG sprite (base, house, dollar, checklist, phone, star) at 20 px gold stroke for the Services cards, explore columns and the cta-strip.
4. Treat a cream "reading band" for long guides as an A/B previewed on `/va-loan-guide` only, with owner sign-off.

#### Card grid and typography tokens

| Token | Current | Target |
|---|---|---|
| Card grid | `repeat(auto-fit,minmax(300px,1fr))` and `minmax(320px,1fr)` in 9 SPA locations, clipping 13 to 32 px at 320 px | `repeat(auto-fit,minmax(min(300px,100%),1fr))` [mob-03] |
| Guide measure (PMH) | `main{max-width:900px}` with 15.5 px Inter, about 105 characters per line | `main p,main li{max-width:68ch}` [cro-10] |
| Guide measure (GC) | 17 px, 760 px, about 85 cpl | `max-width:68ch` |
| Body / H2 on phones | 16.5 px / 25 px at <=640 px (keep) | unchanged |
| Nav tabs on phones | 9 to 10 px | 15 px in the drawer |
| Tables on phones | 3 bare `<table>` elements with no wrapper; BAH tables scroll silently at 320 px with 10 px `thead` | `table{display:block;overflow-x:auto}` under 640 px; `.bah-table thead th{font-size:11px}` and sticky first column under 480 px with a `Swipe for more` caption when `scrollWidth > clientWidth` [mob-03] [mob-10] |
| GC neighborhood cards | 13 `h3` cards under no `h2`; 33 to 47 words each | Comparison table above the cards, `h2` section heading, cards promoted to `h2` [idx-12] [gc-content-06] |
| Fonts | 10 Google faces requested including unused Inter 800 | Drop `;800`; later self-host the two latin variable woff2 files under `/fonts/` with a 1-year immutable header and preload only the Playfair file used by the H1 [perf-05] |

#### Contrast fixes (WCAG formula, computed)

| Element | Colors | Ratio | Status | Fix |
|---|---|---|---|---|
| Body text | `#E8E6DF` on ink | 15.3:1 | pass | keep |
| Muted text | `#A5A496` on ink | 7.6:1 | pass | keep |
| Gold on ink / ink on gold buttons | `#C9A84C` | 8.4:1 | pass | keep |
| Nav tabs | | 12.3:1 | pass | keep |
| Form labels | `#999` | 6.24:1 | pass | keep |
| Input border (SPA) | `#444` on `#2A2A2A` | 1.47:1 | fails 3:1 non-text | `border:1px solid rgba(255,255,255,.40)` = 3.4:1, or `#8A8F99` = 4.4:1 [cro-11] |
| Input border (static modal) | `#444` on `#1A2332` | 1.83:1 | fails | same rule = 3.5:1 / 4.9:1 |
| Form fine print | `#666` 11 px on `#121823` | 3.10:1 | fails 4.5:1 | `color:var(--muted);font-size:12px` (`#A5A496` passes) |

Focus state on every field: `border-color:var(--gold)`.

#### Touch-target rules

Measured under-44 px counts: GC 46 of 57, PMH static 53 of 78, SPA 64 of 111 [mob-08]. One appended patch on both templates and the SPA style block:

```css
@media(max-width:900px){
  footer a{display:inline-block;padding:10px 6px;min-height:44px;line-height:24px}
  .chips a{min-height:44px;display:inline-flex;align-items:center}
  .banner-phone{display:inline-flex;align-items:center;min-height:44px;padding:0 8px}
  .banner-search,.spa-nav button[aria-label="Search the site"]{min-width:44px;min-height:44px;justify-content:center}
}
@media(max-width:640px){
  .imodal-overlay{padding:16px 12px calc(24px + env(safe-area-inset-bottom));align-items:flex-start}
  .imodal{padding:44px 18px 22px;border-radius:12px}
  .imodal-close{width:44px;height:44px;top:6px;right:6px;padding:0;display:flex;align-items:center;justify-content:center}
  .imodal input,.imodal select,.imodal textarea{font-size:16px;padding:12px 14px}   /* 14px triggers iOS zoom */
  .imodal .isubmit{width:100%;min-height:48px}
}
```

Rules: no interactive control under 44x44 CSS px on phones; inputs never under 16 px; the modal becomes two steps (Name + Phone + intent, then Email + optional Message) and the success panel offers `Book a 15-minute call` and `Text me now` instead of only `Send Another Message` [mob-05] [cro-11]. SPA input `fontSize` 14 becomes 16 at `src/App.jsx:902-924` and the three calculator `inputStyle` objects.

### 4.3 Photo compression pipeline

#### The problem in numbers

Neither site emits a single `srcset` width descriptor or `sizes` attribute (376 PMH and 242 GC `<img>` tags), so every hero and card ships its 1600 px rendition to 375 px phones [perf-03] [media-01]. Measured waste:

| Asset | Served today | Re-encoded from repo originals | Saving |
|---|---|---|---|
| `/images/communities/cantonment.avif` (eager LCP) | 352,139 B at 1600x900 | 768w AVIF q50 = 86 KB; 480w = 36 KB | -76% to -90% |
| `/images/topics/va-loan-guide.avif` (3 pages) | 377,768 B | 768w AVIF = 76 KB | -80% |
| GC `/images/pace-milton.webp` | 788,698 B (larger than its 767 KB JPEG) | 768w AVIF = 148 KB; replace the frame, sensor grain keeps it at 566 KB even at 1600w AVIF | -81% |
| SPA `/communities` grid | 19 bare JPEGs, 4,225,527 B into 158 px cards (the `?v=2` query defeats `Pic`) | 480w AVIF per card ~36 KB | ~-95% |
| GC `/neighborhoods` | 14 WebP files, 3.6 to 3.8 MB | card variants | ~-85% |
| Author avatar on 93 PMH pages | `gregg-portrait.jpg` 1200x1200 (106 KB JPEG / 43 KB AVIF) into a 60 px circle | 120w AVIF | ~-95% |
| PMH home hero | 2000x2000 AVIF 98 KB into a 280 px box on phones | 640w AVIF ~15 to 20 KB, or hidden under 900 px | -80% to -100% |

The encoder also under-delivers: 22 of 126 modern variants save under 15%, `navarre.webp` equals its JPEG, and GC has 0 AVIF files, because `generate-modern-images.mjs` encodes AVIF q55 effort 4 and WebP q78 effort 5 from the already-compressed q82 mozjpeg output [media-08].

#### Build script: `scripts/generate-responsive-images.mjs`

Extends `generate-modern-images.mjs` (sharp 0.34.5 is already installed):

```js
const WIDTHS = [480, 768, 1200, 1600];
const ENC = {
  avif: { quality: 50, effort: 6 },
  webp: { quality: 74, effort: 6 },
  jpeg: { quality: 78, mozjpeg: true, progressive: true }
};
// for each public/images/**/*.{jpg,png} and civilian-site/images/*.jpg
// skip logo-*, favicon*, og/*; read from content/originals/ when a higher-quality source exists
for (const w of WIDTHS.filter(w => w <= meta.width)) {          // withoutEnlargement
  for (const [fmt, opt] of Object.entries(ENC)) {
    await sharp(src).resize({ width: w }).toFormat(fmt, opt)
      .toFile(`${base}-${w}.${fmt === 'jpeg' ? 'jpg' : fmt}`);
  }
}
// extras: 120w avatar for .author-card; 1200x900 (4:3) and 1200x1200 (1:1) crops of each hero for Article.image
// guard: delete any avif/webp variant >= 95% of the same-width jpg so the <source> falls through
```

Rules baked into the script and the audit gates: encode from `content/originals/` (a non-deployed folder that `fetch-stock-image.mjs` already populates at 1600 px), never re-encode the optimized JPEG; add the webp-larger-than-jpg guard to `restore-grown-images.mjs` and `audit-civilian.mjs`; run the pass over `civilian-site/images` and emit AVIF there for the first time [media-08] [perf-03].

#### Markup pattern

`wrap-img-with-picture.mjs` and the SPA `Pic` component (extended to accept `srcSet`/`sizes` and tolerate a query string) emit:

```html
<picture>
  <source type="image/avif" sizes="(max-width:640px) 100vw, (max-width:1100px) 92vw, 1000px"
    srcset="/images/communities/cantonment-480.avif 480w, /images/communities/cantonment-768.avif 768w, /images/communities/cantonment-1200.avif 1200w, /images/communities/cantonment-1600.avif 1600w">
  <source type="image/webp" sizes="(max-width:640px) 100vw, (max-width:1100px) 92vw, 1000px"
    srcset="/images/communities/cantonment-480.webp 480w, /images/communities/cantonment-768.webp 768w, /images/communities/cantonment-1200.webp 1200w, /images/communities/cantonment-1600.webp 1600w">
  <img src="/images/communities/cantonment-1200.jpg"
    srcset="/images/communities/cantonment-480.jpg 480w, /images/communities/cantonment-768.jpg 768w, /images/communities/cantonment-1200.jpg 1200w, /images/communities/cantonment-1600.jpg 1600w"
    sizes="(max-width:640px) 100vw, (max-width:1100px) 92vw, 1000px"
    width="1600" height="900" alt="Cantonment, Florida: tree-lined subdivision street 20 minutes north of NAS Pensacola"
    loading="eager" fetchpriority="high" decoding="async">
</picture>
```

`sizes` presets: hero `(max-width:640px) 100vw, (max-width:1100px) 92vw, 1000px`; cards (GC `.nb-photo`, SPA community grid, explore and blog cards) `(max-width:640px) 100vw, (max-width:1100px) 50vw, 360px`; author avatar `60px` with the 120w file. Hero pages add `<link rel="preload" as="image" imagesrcset="…avif list" imagesizes="…" type="image/avif" fetchpriority="high">`.

Loading rules, enforced by a check in `audit-civilian.mjs` and the new PMH gate: the first `figure-band`/`hero-band` image is `loading="eager" fetchpriority="high" decoding="async"` (GC currently lazy-loads its LCP on `/sell`, four blog posts and one resource page) [media-04]; every later figure is `loading="lazy"`; logos carry intrinsic `width="834" height="472"` and `width="480" height="196"`, never `fetchpriority=high` (62 PMH pages declare a wrong 240x108 ratio, 31 declare none) [perf-06] [media-03]; GC copies `logo-lrr.*` and `logo-08-sm.*` into `civilian-site/images/` instead of hot-linking a second origin on all 102 pages [perf-04] [media-11]; SPA nav logos become `loading="eager"` with dimensions.

#### Alt-text convention

Alt quality is already top-tier (0 empty, averages 67 to 69 chars, real descriptions). Keep the rule set explicit so the factories enforce it: 40 to 120 characters; lead with the subject, then the place, then the base or landmark relationship (`Navarre Beach fishing pier at sunrise, 25 minutes from Hurlburt Field`); one place name per alt where true; no `image of`, no keyword lists; decorative logos keep their brand name; the same string feeds `ImageObject.caption` and the image sitemap. CC-BY credits stay in the visible `figcaption` as the audit already requires.

#### Article image and image sitemap

80 of 93 PMH Article/BlogPosting nodes use the headshot as `image`, and neither site has `primaryImageOfPage` or an image sitemap [media-06] [media-07] [schema-07]. The factories set:

```json
"image": ["…/images/topics/bah-rates-1600.jpg", "…/images/topics/bah-rates-4x3.jpg", "…/images/topics/bah-rates-1x1.jpg"],
"primaryImageOfPage": {"@type":"ImageObject","@id":"<canonical>#primaryimage","url":"…-1600.jpg","width":1600,"height":900,"caption":"<alt>","creditText":"U.S. Navy, public domain","license":"<CC URL when applicable>"}
```

with a one-off backfill that reads each page's first hero `src`. Both sitemap writers declare `xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"` and emit `<image:image><image:loc>` for the hero and every figure-band image; this ranks after the responsive and LCP work because the images are already crawlable.

#### Cleanup list

Delete the five `about-*` duplicates of `mil-*` photos and `logo-horizontal.png` (18 redundant files), update the `IMG` map, and set the true `width="2200" height="880"` on the two `mil-family-awacs.jpg` figures or crop the file to 16:9 through the new script [media-12]. Replace `pace-milton.jpg` with a cleaner frame from the drone shot list below.

Rollout order: template edit, one-page preview (`/communities/cantonment` for PMH, `/neighborhoods` for GC), scripted rewrite of hero sources across `public/**/*.html` and `civilian-site/**/*.html`, `Pic` upgrade for the SPA grid, `node scripts/audit-civilian.mjs` to 0 findings, then the PMH gate.

### 4.4 Video embed architecture

Neither site hosts a single video, tour or aerial clip, and there are 0 `VideoObject` nodes, while `public/buy.html:368` promises 6K drones and 8K 360 cameras and `public/sell.html:362` promises Zillow Showcase 3D, drone footage and 360 tours [media-05] [media-10] [schema-11].

#### Hosting

| Media type | Host | Why | Cost |
|---|---|---|---|
| Evergreen explainers: base commutes, neighborhood tours, BAH walkthroughs, Gregg intro | YouTube (existing `@Pensacola` channel), embedded via `youtube-nocookie.com` | Video SERP and carousel indexing, transcript ingestion, zero hosting cost | $0 |
| Listing walkthroughs (4K/6K), 360 tours, drone reels tied to a listing | Cloudflare Stream | Adaptive HLS up to 4K, no recommendations, downloadable `contentUrl` for schema, same account as Pages | $5 per 1,000 minutes stored + $1 per 1,000 minutes delivered; 30 listings x 3 minutes is under $1 per month storage |
| 360 tours | Matterport or CloudPano behind the same facade | Interactive tour; consent-gated iframe with `allow="xr-spatial-tracking; fullscreen"` | Vendor plan, existing |

#### Facade pattern (CLS-safe, no third-party JS until click)

```html
<figure class="vid" style="aspect-ratio:16/9;position:relative;background:#0A0F1A">
  <picture><!-- poster via the 4.3 variants, 480/768/1200w --></picture>
  <button type="button" class="vid-play" data-yt="VIDEO_ID"
    aria-label="Play video: Navy Point to NAS Pensacola Main Gate commute">Play</button>
  <figcaption>Navy Point to the NAS Pensacola Main Gate, dashcam and aerial, 07:10 on a Tuesday. 2 min 41 s.</figcaption>
</figure>
<details class="transcript"><summary>Read the transcript</summary><p>…full transcript…</p></details>
```

One 12-line script per page: on click create `<iframe src="https://www.youtube-nocookie.com/embed/ID?autoplay=1&rel=0&modestbranding=1" title="…" allow="autoplay; encrypted-media; picture-in-picture" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;border:0">` and `replaceChildren()`. For Stream the iframe is `https://customer-<code>.cloudflarestream.com/<uid>/iframe?poster=…` with `allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture" allowfullscreen`. The `aspect-ratio` box reserves height before the poster loads, so CLS stays at the measured 0. The poster image follows every rule in 4.3 (responsive variants, `loading="lazy"` unless it is the page's first figure).

#### Schema and sitemap

Per video, appended to the page `@graph` and referenced from the `WebPage` node via `"video":{"@id":"<canonical>#video"}`:

```json
{"@type":"VideoObject","@id":"<canonical>#video","name":"…","description":"…",
 "thumbnailUrl":["https://pensacolamilitaryhousing.com/images/video/nas-pensacola-commute-1200.jpg"],
 "uploadDate":"2026-09-15T08:00:00-05:00","duration":"PT2M41S",
 "contentUrl":"https://customer-<code>.cloudflarestream.com/<uid>/downloads/default.mp4",
 "embedUrl":"https://www.youtube-nocookie.com/embed/ID",
 "publisher":{"@id":"https://greggcostin.com/#brokerage"},"creator":{"@id":"https://greggcostin.com/#gregg"},
 "locationCreated":{"@type":"Place","name":"Navy Point, Pensacola, FL"},"transcript":"…"}
```

Use whichever canonical entity @ids the schema consolidation lands on. The transcript lives in visible HTML (`<details>`) for AI extraction; `max-video-preview:-1` is already in the robots meta. Each video is added to the sitemap as `<video:video>` with `thumbnail_loc`, `title`, `description`, `content_loc` or `player_loc`, `duration`. `scripts/page-factory.mjs` gains an optional `video` block in the fragment header so the markup, schema and sitemap entry are emitted together.

#### Drone footage and credential disclosure

Publish the FAA Part 107 line on `public/sell.html` and `civilian-site/sell.html` only after the certificate number is confirmed with the owner (`I am an FAA Part 107 certificated remote pilot; aerial footage near NAS Pensacola, Whiting, Eglin and Hurlburt is flown with LAANC authorization where required`). Do not publish an airspace disclaimer that is not true for every asset. Owned photos and clips get `ImageObject`/`VideoObject` nodes with `creditText "Gregg Costin / The Costin Team"` and a license URL [media-10].

#### Where each media type lives

| Media | PMH | GC |
|---|---|---|
| Base commute explainers (dashcam + aerial) | `/bases/<base>` under a new `See the commute` H2; `/homes-for-sale-near-<base>` when built | not duplicated; one line linking the PMH clip |
| Neighborhood drone tours (60 to 90 s) | `/communities/<slug>` (military framing in the caption: gate, minutes, BAH fit) | `/neighborhoods/<slug>` once built (lifestyle framing); same clip, different caption and transcript emphasis |
| Gregg intro (90 s) | `/about` | `/team` and `/gregg-costin` |
| Listing walkthroughs, 360 tours, 3D | linked only from `/sell` proof block | `/listings/<slug>` showcase pages (4.5) and one proof block on `/sell` |
| BAH and calculator walkthroughs | `/bah-rates`, `/pcs-guide` | none |
| Market report explainer (quarterly) | none | `/market` |

First three productions, chosen by existing engagement: NAS Pensacola gate-to-neighborhood commute (`/bases/nas-pensacola`), Whiting Field to Pace and Milton commute (`/bases/whiting-field`, 49% scroll), and the Gregg intro for GC `/team` and PMH `/about` [media-05]. Then `/communities/niceville` and `/pcs-guide`.

#### Per-neighborhood shot list (one session each, 60 to 90 s cut plus 6 to 10 stills)

| Area | Aerial (Part 107) | Ground / dashcam | Still frames to replace |
|---|---|---|---|
| Gulf Breeze | Bob Sikes Bridge approach, Tiger Point canals, sound-side shoreline | 3-Mile Bridge to West Gate drive with elapsed time | none (existing OK) |
| Navy Point / Warrington | Bayou Grande waterfront, Main Gate approach | gate-to-street commute | hero |
| Cantonment | US-29 corridor, Kingsfield subdivisions, Escambia River edge | Nine Mile Rd to Blue Angel Pkwy | `cantonment` hero (current LCP 352 KB) |
| Pace / Milton | Whiting Field North perimeter (outside restricted airspace), Pace Blvd, Blackwater River | Whiting South Gate to Pace Publix | `pace-milton.jpg` (grain) |
| Navarre | Navarre Beach bridge and pier, Holley-by-the-Sea | US-98 to Hurlburt main gate | none |
| East Hill | Bayou Texar, 12th Ave bungalow streets, Bayview Park | Cervantes to Palafox | GC hero for the new guide |
| Perdido Key | Old River canals, Johnson Beach | Back Gate to Perdido Key Dr | none |
| Niceville / Bluewater Bay | Rocky Bayou, Bluewater marina | Eglin East Gate to Niceville | none |
| Fort Walton Beach / Mary Esther | Okaloosa Island bridge, Santa Rosa Sound | Hurlburt to FWB | none |
| Cordova Park | Bayou Texar north bank, Cordova Mall corridor | Airport to NAS via I-110 | none |
| Downtown Pensacola | Palafox, Plaza de Luna, Maritime Park | Garden St office to Main Gate | GC hero option |

Each session also captures a 4:3 and 1:1 crop of the hero frame for `Article.image`.

### 4.5 Listing showcase page spec for greggcostin.com

The only listing surface today is `825bayshore.greggcostin.com`, a sold $109,900 1BR condo site outside the repo with a bare `Apartment` node, an invalid `RealEstateOrganization`, a form that ignores the worker contract, 19 em dashes, one inbound link and no cross-link to either brand [list-01] [list-02] [list-04] [list-07] [gc-content-04]. The replacement is `civilian-site/listings/<slug>.html`, generated by a small factory from `content/listings.json`, plus a `/listings` index.

#### Page structure (mobile-first, one column under 900 px)

1. **Header**: the shared civilian banner (drawer spec from 4.2), so the page is inside the entity graph and the cross-link rule.
2. **Hero gallery**: first frame is the eager LCP `<picture>` (4.3 variants, `fetchpriority="high"`); a 6-tile grid on desktop, a horizontal snap scroller on phones; every tile lazy after the first; tap opens a native `<dialog>` lightbox (same pattern as the Pagefind dialog).
3. **Fact strip** (sticky under the header on phones, 56 px): price, beds, baths, sq ft, status badge (Active / Under Contract / Sold, driven by `availability`).
4. **CTA row**: Tier 1 `Schedule a Showing` (opens the inquiry modal with a stage-map `inquiryType` and the address prepended to `message`), Tier 2 `Text (850) 266-5005` with a prefilled `sms:` body naming the address.
5. **Media row**: 4K walkthrough facade (Stream), 360 tour facade (Matterport/CloudPano), drone reel facade, each in an `aspect-ratio:16/9` box with poster and transcript `<details>`.
6. **Description and features**: 300 to 600 words in the house voice; `amenityFeature` list rendered as a two-column `<dl>`.
7. **Neighborhood and schools**: three sentences linking `/neighborhoods/<slug>`, the zoned `/schools/*` reports with FLDOE grade badges, and the PMH community page for PCS readers.
8. **Cost reality box**: taxes (with the homestead reset note), insurance band, HOA or condo fees, flood zone, all dated.
9. **Map**: static image with `alt`, linking to Google Maps.
10. **Agent card**: portrait, `Gregg Costin, Realtor (ABR, SRS, RENE), Levin Rinke Realty`, phone, review count from `content/reviews.json`.
11. **Footer**: standard civilian footer with the `data-costin-sites` family line and EHO statement.

#### Data file and schema

`content/listings.json` entry shape: `slug, address {street, unit, city, state, zip}, geo, mls, price, status, beds, baths, sqft, yearBuilt, type (SingleFamilyResidence | Apartment | Condominium), listDate, media {hero, gallery[], stream, tour, drone}, features[], neighborhoodSlug, schoolSlugs[], description`. The factory emits, in one `@graph`:

```json
{"@type":"RealEstateListing","@id":"https://greggcostin.com/listings/<slug>#listing",
 "name":"<street>, <city> FL: <beds>BR <type> for sale","url":"…","datePosted":"<listDate>",
 "about":{"@type":"SingleFamilyResidence","@id":"…#home","address":{"@type":"PostalAddress",…},
   "geo":{"@type":"GeoCoordinates","latitude":30.40,"longitude":-87.21},
   "numberOfRooms":3,"floorSize":{"@type":"QuantitativeValue","value":1850,"unitCode":"FTK"},
   "amenityFeature":[…],"yearBuilt":2004},
 "offers":{"@type":"Offer","price":425000,"priceCurrency":"USD","availability":"https://schema.org/InStock",
   "offeredBy":{"@id":"https://greggcostin.com/#gregg"}},
 "image":["…-1600.jpg","…-4x3.jpg","…-1x1.jpg"],
 "video":{"@id":"…#video"},
 "provider":{"@id":"https://greggcostin.com/#team"}}
```

Rules from the probe: `Apartment` for condos, `SingleFamilyResidence` for detached homes; `floorLevel` is a number, not prose; no top-level `broker` key; the listing agent is `offeredBy`, never `seller`; no `RealEstateOrganization` anywhere; URLs use the apex, not `www`; the listing URL is never added to the agent's `sameAs` [list-02] [list-04]. `/listings` carries an `ItemList` of `RealEstateListing` items; `/buy` (after the city links at `civilian-site/buy.html:268`) and `/sell` (replacing the `825bayshore` bullet at `:258`) each render a dofollow `Featured listings` row from the same JSON [list-05]. Sold listings keep their page with `availability: SoldOut`, the status badge, and a `Sold in N days at X% of list` line, which feeds the `/sold` gallery the seller side lacks [gc-content-04].

#### Form contract and gates

The inquiry form posts `{name, email, phone, inquiryType, message, _gotcha}` with `inquiryType` from the worker stage map (`First-Time Home Buyer` for showings and questions, `VA Loan Questions`, `Selling My Home` for `I have a home to sell too`) and the selected label prepended to `message` so the showing intent survives the stage mapping [list-01]. The factory output runs through `scripts/audit-civilian.mjs` (0 findings), `check-em-dashes.mjs` with `civilian-site/listings/` added to its path list, the new first-figure-eager check, and the title length rule (`825 Bayshore #803, Pensacola FL: $109,900 Waterfront 1BR`, 56 chars, as the migration example) [list-07]. Bring the existing subdomain source into the repo under this factory, 301 `825bayshore.greggcostin.com` to `/listings/825-bayshore-803`, and retire the separate Pages project.

### 4.6 Build order for one developer

| Week | Work | Findings closed |
|---|---|---|
| 1 | Mobile header drawer on one PMH page and one GC page, then rollout; sticky-bar body padding; modal and touch-target CSS patch; overflow fixes at 320 px; index.html font preconnect | mob-01 to mob-09, perf-01 |
| 2 | `generate-responsive-images.mjs`, encoder settings, GC AVIF, `<picture>` srcset rollout, logo dimensions and priority, GC local logos, SPA `Pic` grid, hero `<img>` conversion | perf-03, perf-04, perf-06, perf-08, media-01 to media-04, media-08, media-09, media-11, media-12 |
| 3 | Hero copy and layout on both homes, trust strips, CTA label system and cta-strip rollout, `/pcs-guide` gate change, flood-zones and pcs-home-search dead-click fixes, contrast and two-step form | cro-01 to cro-12 |
| 4 | Article image arrays, `primaryImageOfPage`, image sitemap, section rhythm and icon sprite, `68ch` measure | media-06, media-07, schema-07, cro-10 |
| 5 to 6 | Video facade component, `VideoObject` and sitemap emitters in page-factory, first three shoots (NAS Pensacola commute, Whiting commute, Gregg intro), Part 107 line after confirmation | media-05, media-10, schema-11 |
| 7 to 8 | `content/listings.json`, listings factory, `/listings` index, featured rows on `/buy` and `/sell`, 825 Bayshore migration and 301 | list-01 to list-07, gc-content-04 |

Standing checks that keep it fixed: the PMH audit gate mirroring `audit-civilian.mjs` (first figure eager, logos with intrinsic dimensions and no high priority, `srcset` on every non-logo image, one Tier 1 button before the first H2, no input under 16 px, no em dash in any generated markup or PDF), and the webp-larger-than-jpg guard in both image pipelines.

---

## 5. Content and keyword blueprints

Data note: Semrush volumes and Lighthouse/CrUX were not available this run. Difficulty ratings below are judgments from live SERP shape (WebSearch 2026-09-02) plus the Bing export in docs/seo-baselines (334 queries, 538 impressions, 30 clicks). Finding ids from the JSON-LD validity probe reuse the schema-NN numbering; they are cited here with a "v" suffix (schema-01v) to keep them distinct from the schema-architecture findings.

### 5.1 Swimlane charter

The split is already real at the text level (no GC/PMH pair outside /reviews exceeds 3% 5-gram overlap) and the cross-link rule is enforced in code [synergy-08, synergy-10]. What is missing is the written rule, the GC pages that should exist, and the equity flow from PMH to GC [synergy-05, gc-content-01, kw-02]. This table is the charter.

| Topic family | Owner domain | Rule for the other domain |
|---|---|---|
| Base guides, on-base vs off-base, gates, lodging, DBIDS, arrival logistics | PMH | GC never builds base pages; school pages link "housing guide for <nearest base> families" [synergy-09] |
| BAH (rates, per-base pages, calculator, BAH-to-mortgage, renting on BAH) | PMH | GC links to /bah-rates and /mortgage-calculators only; never restates rate tables |
| VA products (COE, funding fee, IRRRL, assumable, VA condos, VA closing costs) | PMH | GC /buy links assumable and va-loan-guide; GC rate posts link /va-irrrl-guide |
| Veteran and disabled-veteran tax exemptions, PCS timeline, PCS checklist, sight-unseen, rent-vs-sell on orders | PMH | GC tax and sell content links the PMH twin in its first 300 words |
| "Military realtor Pensacola" and every query carrying military/PCS/VA/BAH/base/veteran | PMH | GC titles, H1s and H2s never use those tokens [synergy-08] |
| Brand and person queries (Gregg Costin, Costin Team, reviews) | GC | PMH /reviews shows a non-overlapping military subset and links the full set on GC; PMH /about links GC /team [synergy-03, synergy-06, synergy-11] |
| Neighborhood lifestyle guides (price bands, streets, trade-offs, daily life) | GC | PMH community pages stay base-commute and BAH framed; one line each way ("Not military? Read the civilian guide" / "PCSing here? Read the military version") [gc-content-01] |
| School data (82 FLDOE reports) | GC | PMH pcs-schools-by-base and base pages link specific school reports; PMH never rebuilds school data [mil-01, idx-07] |
| Market data, home value, net sheet, cash-offer-vs-listing, sold portfolio | GC | PMH quotes /market with a link and keeps only the PCS-framed cash-offer twin [kw-05, kw-06] |
| Florida homeowner mechanics (homestead, insurance, property tax, closing costs, first-time programs) | GC (canonical general version) | PMH holds a military-delta page carrying the modifier in title and H1, links GC for mechanics, adds only what changes for service members [synergy-08] |
| Relocation without orders (moving to Pensacola, cost of living, retiring, remote work) | GC | PMH /pcs-guide covers orders-driven moves only; the PMH moving guide is re-scoped to "on military orders" [kw-07, gc-content-07] |
| Waterfront, luxury, new construction, coastal Alabama | GC | PMH links out; no twin pages [gc-content-02, kw-11] |
| Blog: rates, Fed, taxes, closing costs, appraisals, HOA, new construction | GC blog | PMH blog covers BAH, VA, PCS, base news; both factories gate at 5-gram Jaccard >= 5% against the sister site [synergy-12, kw-01] |
| Calculators | PMH | GC links (already 7 links to /mortgage-calculators); no duplicates |
| Testimonials | GC is the complete hub | A quote appears on exactly one site [synergy-03] |
| Listings and IDX deep links | Both, per audience | Same greggc.levinrinkerealty.com /results/ template, city plus price band filters; the 825bayshore subdomain joins the repo and cross-links both sites [list-03, list-04, gc-content-08] |

### 5.2 High-intent keyword table: PMH

| Keyword | Intent | SERP shape / difficulty | Current page or GAP | Priority |
|---|---|---|---|---|
| military realtor pensacola | commercial | agent authority pages; medium; PMH holds 3 of 10 slots | /military-realtor-pensacola, /, /about | P1 maintain |
| military friendly realtor pensacola fl | commercial | same set; Bing pos 5.3 | same | P1 maintain |
| homes for sale near nas pensacola | transactional | Zillow, Movoto plus 6 local IDX pages; medium; Bing pos 4-5, 0 clicks | GAP (base page only) | P1 build [kw-03] |
| bah pensacola 2026 / nas pensacola bah / pensacola bah rates | informational | 6 BAH aggregators; medium; Google slot 7, Bing 4-10 | /bah-rates (title mismatch, table 490 lines down) | P1 restructure [kw-04, geo-03] |
| hurlburt field bah / bah hurlburt field 2026 | informational | aggregators; medium; Bing 6.9-9.2 | /bah-rates, /bases/hurlburt-field (10th H2) | P1 per-base page [kw-04] |
| va assumable loans pensacola (list/listing) | transactional | 4 lenders then PMH /faq; low; Bing pos 1-2 with 33% CTR | /assumable-va-loans-pensacola (no list) | P1 add weekly list [kw-09] |
| navarre fl military homes | commercial | Redfin, MBO, AHRN; low; PMH slot 4 | /communities/navarre | P1 maintain |
| gulf breeze military families nas pensacola | informational | PMH holds 3 slots; low | /communities/gulf-breeze, /bases/nas-pensacola | P1 maintain, move neighborhoods H2 up [geo-03] |
| florida property tax 100% disabled veteran (+county) | informational | low-medium; 63 Bing queries at pos 5.8; 119 Copilot citations | /va-disability-property-tax-florida, county blog | P1 annual refresh, quick-answer block |
| pcs to pensacola / moving to pensacola military | informational | FB group, Realty Masters, pcspensacola; low-medium | / and /blog rank; /pcs-guide and two posts collide on titles | P1 consolidate [kw-07] |
| pensacola fl military home buyer va | commercial | Bing pos 2.1, 19 impressions, 0 clicks | unknown URL (snippet mismatch) | P2 title/snippet fix in Bing WMT |
| houses for rent military fwb / military rentals fort walton beach | transactional | apartments.com x7, AHRN; medium; Bing 3-7 | GAP (Pensacola renter page ranks by accident) | P2 build [kw-10] |
| eglin afb homes for sale / homes for sale near hurlburt field | transactional | portals plus panhandlepcs; medium-high | /bases/eglin-afb title only; Hurlburt H2 with no listings | P2 listing pages [kw-03, list-03] |
| training air wing five / whiting field flight school housing | informational | low; #2 Bing query by impressions (15, pos 9.7) | /bases/whiting-field, /flight-school-housing-pensacola (no TW-5 H2) | P2 expand [kw-08] |
| corry station / hurlburt / eglin dorms | informational | high (official AF, MBO); Bing 4 queries | GAP (no dorm section anywhere) | P2 build [mil-07] |
| duke field housing | informational | low; Bing pos 6 | /bases/duke-field (no housing section) | P2 add section [mil-06] |
| va loan pensacola | commercial | 7 lenders plus Yelp; high | /va-loan-guide (absent) | P3 defend long-tail only |
| whiting field housing | navigational | 9 of 9 Whiting Field Homes; unwinnable | /bases/whiting-field | P3 re-aim to TW-5 [kw-08] |

### 5.3 High-intent keyword table: GC

| Keyword | Intent | SERP shape / difficulty | Current page or GAP | Priority |
|---|---|---|---|---|
| east hill pensacola homes for sale / living in east hill | transactional | portals plus 3 niche agent sites; medium | GAP (51-word card linking to a military PMH page) | P1 [kw-02, gc-content-01] |
| gulf breeze realtor | commercial | Zillow, Trulia, Levin Rinke, KW microsite; medium-high | GAP | P1 area page [geo-11] |
| perdido key condos for sale / waterfront homes pensacola | transactional | portals plus perdidogirl, gibbons; medium | GAP | P1 /waterfront and Perdido Key guide [gc-content-02] |
| sell my house pensacola / cash offer pensacola | transactional | Opendoor, HomeLight, Houzeo, cash buyers, one agent cash-offer page; medium | /sell (no cash-offer content; twin lives on PMH) | P1 [kw-06, gc-content-04] |
| pensacola home values / what is my home worth pensacola | transactional | Zillow, Redfin, Gibbons, Momentum, Ave Realty; high | none (RealScout redirect) | P1 /home-value [kw-05] |
| pensacola real estate market 2026 / pensacola housing market | informational | Zillow, syndicated news, Gibbons living page; medium | GAP (queued as a PMH blog post) | P1 /market [gc-content-03] |
| moving to pensacola fl / relocating to pensacola | informational | movers, movingtopensacola.com, uphomes; medium | GAP (military version on PMH) | P1 [gc-content-07, kw-07] |
| best neighborhoods in pensacola / where to live in pensacola | informational | blog-shaped, 2023 Levin Rinke post ranks; low-medium | /neighborhoods (2,015 words, no data) | P1 rebuild hub [gc-content-06] |
| gregg costin realtor | brand | 10 profile links; GC absent from link set | / (no name in H1), /team | P1 person page plus profile website fields [synergy-06] |
| pensacola beach homes for sale / pace fl homes for sale / cantonment homes | transactional | 7-8 portals plus Gibbons/Levin Rinke; high | GAP | P2 area pages plus filtered IDX [gc-content-08] |
| milton fl new construction | transactional | portals, NewHomeSource, builders; medium | GAP (PMH page is military-framed) | P2 /new-construction [gc-content-02] |
| orange beach realtor / gulf shores realtor | commercial | 4 of 9 slots are agent sites; medium | GAP (card only) | P2 [kw-11] |
| retiring in pensacola / pensacola cost of living | informational | aggregators plus one agent site; low-medium / high | GAP (queued on PMH) | P2 fold into moving guide [kw-01] |
| first time home buyer pensacola | informational | City of Pensacola, SHIP, Hansen Team; medium | /resources/first-time-home-buyer (Florida-generic, names no program) | P2 refresh [kw-12] |
| florida homestead exemption pensacola / pensacola home insurance cost | informational | county, law firms, realtor blogs, insurers; medium | /resources guides (0 primary-source links) | P2 retitle to the cost/portability angle, add sources [synergy-08, eeat-08] |
| pensacola realtor | commercial | directory-dominated; high | / (title only) | P2 brand plus modifiers, not the head term |
| best realtor pensacola fl | commercial | directories only | none by owner decision | n/a (directory occupation is the lever) |
| homes for sale pensacola fl | transactional | 8 portals; very high | /search | P3 IDX only |

### 5.4 PMH cornerstones (5)

**P1. /homes-for-sale-near-nas-pensacola (template for hurlburt-field, eglin-afb, whiting-field)** [kw-03, list-03, mil-07]
- Title: Homes for Sale Near NAS Pensacola: Live Listings, Gate-by-Gate Commutes, and BAH Fit
- Targets: homes for sale near nas pensacola, houses near nas pensacola, property for sale near nas pensacola, va qualified homes for sale pensacola
- Angle: the only page pairing live inventory with commute minutes and the FL064 table; competitors are portals or IDX-only agent pages
- H2s: What is on the market near NAS Pensacola this week; Homes by gate (Main/Warrington, Back gate/Perdido Bay, Blue Angel corridor); Price bands vs 2026 BAH by rank; Flood zone check before you offer; Schools by zone (GC reports); Newest listings; FAQ
- Words: 1,800-2,200 plus the listing block. Tools/media: 3-4 pre-filtered IDX /results/ deep links (city plus pricemax), BAH-fit table from content/affordability-2026.json, one original map image
- Schema: WebPage, ItemList, FAQPage, BreadcrumbList; compact #team reference node
- CTA: Tier 1 "Search Homes by Base"; Tier 2 sms "text me rank and report date for a listing alert"
- Links in: /bases/nas-pensacola "Homes for Sale Near" H2, /pcs-home-search, /communities/navy-point-warrington, /bah-rates, homepage base row. Links out: /pensacola-flood-zones-homebuyers, /va-loan-guide, community pages, greggcostin.com/schools reports
- Refresh: weekly listing block (dated), quarterly text

**P2. /bah/<base> (nas-pensacola, corry-station, whiting-field, eglin-afb, hurlburt-field, duke-field)** [kw-04, mil-07, mil-08]
- Title: Hurlburt Field BAH Rates 2026 (FL023): Every Rank, With and Without Dependents
- Targets: hurlburt field bah, bah hurlburt field 2026, e-5 bah hurlburt field, nas pensacola bah, nas corry station bah
- Angle: exact query phrasing, direct answer in the first sentence, rendered from content/bah/2026.json so December rollover is a data change
- H2s: What is <base> BAH in 2026 (60-80 word answer); Full table; With vs without dependents; What that rents nearby; What it buys (full PITI band, dated); How BAH changes January 1; FAQ
- Words: 1,200-1,500. Tools/media: table, calculator link, 2025 delta column
- Schema: WebPage, Dataset, FAQPage; speakable on .quick-answer
- CTA: /bah-to-mortgage-guide plus sms
- Links in: /bah-rates per-base jump list, each base page's BAH H2, /military-realtor-hurlburt-field. Links out: /renting-on-bah-*, /bah-to-mortgage-guide, P1 pages
- Refresh: every January plus the queued 2027 BAH news post

**P3. /renting-on-bah-fort-walton-beach** [kw-10, mil-07, mil-11]
- Title: Renting on BAH in Fort Walton Beach, Navarre and Niceville (FL023): 2026 Rent Bands by Rank
- Targets: houses for rent military fwb, military rentals fort walton beach, military housing website fort walton beach, destin military rentals
- Angle: the renter pipeline competitors are built on (navytonavy, pensacolarealtymasters), with sourced rent data PMH currently lacks
- H2s: What does FL023 BAH rent in 2026; Rent bands by town (HUD FY2026 FMR, Zillow ZORI, dated); Lease clauses every PCS renter needs (SCRA); On-base wait vs off-base; When renting beats buying for a 2-3 year tour; Where to search; FAQ
- Words: 2,000. Tools/media: rent-vs-BAH table, rentals search link
- Schema: Article, FAQPage
- CTA: sms for PCS-clause rentals; Tier 3 link to /military-rental-property-management for landlords
- Links in: bases/hurlburt-field, bases/eglin-afb, communities/fort-walton-beach, /renting-on-bah-pensacola. Links out: /rent-vs-buy-military-pensacola, /military-rental-property-management
- Refresh: semi-annual rents, January BAH

**P4. /assumable-va-loans-pensacola upgrade: This Week's List** [kw-09]
- Title: Assumable VA Loans in Pensacola: This Week's List (updated <date>)
- Targets: va assumable loan list pensacola, va assumable loans pensacola beach, va assumable mortgages pensacola, how to search assumable on florida mls
- Angle: the inventory itself is the information gain; three of six ranking queries ask for a list and the page answers "how assumption works"
- New H2s near the top: This week's assumable VA listings; How to read the list; Pensacola Beach and Gulf Breeze assumables (the beach query converts at 33% CTR)
- Words: existing page plus 300. Tools/media: ItemList table (area, price band, note rate, status; no addresses unless MLS rules permit)
- Schema: ItemList added to Article and FAQPage; dateModified bumps only when the list changes
- CTA: existing sms ASSUMABLE CTA (data-cta assumable-list-text)
- Links in: /faq (3 already), /va-loan-guide, /blog/va-loan-assumption-buyers-guide. Links out: /va-loan-guide, P1 pages
- Refresh: weekly (Gregg, 10 minutes, already budgeted in GROWTH-PLAN item 7)

**P5. /flight-school-housing-pensacola expansion plus TW-5 landing** [kw-08, mil-07]
- Title: NAS Whiting Field Flight Student Guide: TRAWING-5, Where Students Live, and the 6-18 Month Housing Math
- Targets: training air wing five, trawing 5, nas whiting field helicopter training, best place to live flight school milton, whiting field primary
- Angle: the student-pilot cohort holds 12-18 months then sells or rents at winging (a repeat-transaction client); nobody writes for them
- H2s: What is Training Air Wing Five (60-100 word answer, squadron list verified); Where primary and advanced students actually live; Milton vs Pace vs East Milton commute; Rent vs buy for a 12-month student; What happens to the house at winging (sell, rent, assumable); Roommates and BAH math; FAQ
- Words: 2,500. Tools/media: commute table from content/commutes.json, 12-month rent-vs-buy table
- Schema: Article, FAQPage
- CTA: Tier 1 "Get My PCS Plan"; Tier 2 sms
- Links in: bases/whiting-field (retitled to TRAWING-5), nas-whiting-field-off-base-housing, communities/milton, communities/pace. Links out: /rent-vs-buy-military-pensacola, /military-rental-property-management, /assumable-va-loans-pensacola
- Refresh: annual plus January BAH

### 5.5 GC cornerstones (5)

**A. /neighborhoods/east-hill (flagship of the neighborhood set: then gulf-breeze, perdido-key, pensacola-beach, pace-milton, navarre, cordova-park, cantonment)** [gc-content-01, gc-content-06, kw-02, synergy-04]
- Title: East Hill, Pensacola: Homes, Prices, and What It Is Really Like to Live Here (2026)
- Targets: east hill pensacola homes for sale, east hill pensacola real estate, living in east hill pensacola, east hill bungalows
- Angle: block-level price bands by home era, 1920s-bungalow insurance and 4-point realities, Bayou Texar flood edge, zoned schools from the 82 FLDOE reports; every praise sentence paired with its cost
- H2s: East Hill at a glance (data strip); Who it is for, who should skip it; The streets (Bayou Texar side, 12th Avenue corridor, north of Cervantes, Cordova edge); Housing stock and price bands; Honest trade-offs (4+ bullets); Schools zoned (linked reports with grade badges); Walk, dine, park; Commutes with minutes; Insurance and flood reality; Recent sales snapshot; Homes for sale in East Hill now; FAQ (6); Related guides; "PCSing here? Read the military version"
- Words: 1,800-2,500. Tools/media: 8-12 original photos, one 60-90 second drone-plus-walk video (VideoObject), static map, price and school tables, filtered IDX /results/ link
- Schema: WebPage, Place (geo, containedInPlace), BreadcrumbList, FAQPage, ItemList (schools), VideoObject, Person author inline, ImageObject
- CTA: Tier 1 "Start My Home Search" (RealScout: "East Hill listings before Zillow"); /home-value for sellers
- Links in: /neighborhoods card, index "Where we work", /buy targeted-search block, /search city grid, 3 zoned school pages, blog posts naming East Hill, /moving-to-pensacola matrix. Links out: /schools/<id>, /search, /sell, /market, PMH /communities/east-hill
- Refresh: quarterly prices, annual text. Gates added to audit-civilian.mjs: data strip present, 4+ trade-off bullets, 2+ school links, dated price band, 1,500+ words

**B. /waterfront** [gc-content-02, kw-02]
- Title: Pensacola Waterfront Homes: Gulf, Bay, Sound, Bayou and Canal, and What the Water Really Costs
- Targets: pensacola waterfront homes for sale, perdido key waterfront homes, gulf breeze waterfront homes, bayfront homes pensacola, pensacola beach condos
- Angle: segmentation by water type and price band (the format every ranking competitor uses) plus the insurance and inspection checklist none of them publish
- H2s: The five kinds of water; Where each lives (Perdido Key and Old River, Pensacola Beach, Gulf Breeze and Tiger Point, the bayous, Navarre sound side, Orange Beach back-bay under the Alabama license); Price bands by water type; What the water costs you (V vs AE zones, wind mitigation, seawall and dock age, elevation certificates, Citizens); Boaters: depth, bridge clearance, lifts; Pensacola Beach leasehold (SRIA) explained; Condo vs house on the water (reserves, milestone inspections after SB 4-D); The insurance checklist we run before you fall for the view; FAQ; Homes on the water now (IDX links per water type)
- Words: 2,500-3,500. Tools/media: drone reel per water type, water-type map, comparison table
- Schema: Article, FAQPage, ItemList, VideoObject
- CTA: Tier 1 "Start My Home Search"; Tier 3 "Send a Message"
- Links in: Perdido Key, Pensacola Beach, Gulf Breeze, Navarre and Orange Beach guides, insurance guide, /buy, /sell, /moving-to-pensacola. Links out: /resources/florida-home-insurance, PMH /pensacola-flood-zones-homebuyers, /search
- Refresh: quarterly price bands, annual text

**C. /market (living page plus quarterly changelog posts)** [gc-content-03, kw-05]
- Title: Pensacola Housing Market Report (updated <Month Year>)
- Targets: pensacola housing market, pensacola real estate market 2026, pensacola home prices 2026, is the pensacola housing market slowing, days on market pensacola
- Angle: one refreshed URL with sourced numbers by sub-area (PAR/Florida Realtors, county appraisers, Zillow ZHVI with vintages) plus Gregg's read; the hub every neighborhood guide cites for its price band
- H2s: This month in one paragraph; Median price and year-over-year (Escambia, Santa Rosa, by city); Inventory and months of supply; Days on market and list-to-sale ratio; Price bands: what is moving, what is sitting; New construction share; Rates and insurance context; If you are buying; If you are selling; Method and sources; FAQ
- Words: 1,500 on the living page plus 1,200-1,800 per quarterly post. Tools/media: 4-6 script-generated SVG charts, one table
- Schema: Article, Dataset (license, temporalCoverage), FAQPage; true dateModified
- CTA: Tier 1 "Get My Home Value" (/home-value); Tier 2 /search
- Links in: /sell, /home-value, /buy timing FAQ, faq.html "Is now a good time", every neighborhood guide price band, blog rate posts, PMH /bah-vs-cost-of-owning-pensacola. Links out: /home-value, neighborhood guides
- Refresh: monthly numbers, quarterly post; the civilian "market-check-monthly" queue item becomes the changelog post

**D. /home-value plus /sell/cash-offer-vs-listing (pricing, net sheet, cash-offer rebuttal, sold gallery)** [gc-content-04, kw-05, kw-06]
- Title: What Is My Pensacola Home Worth, and Should You Take a Cash Offer?
- Targets: how much is my house worth pensacola, pensacola home values, cost to sell a house in florida, seller closing costs florida, sell my house pensacola, cash offer pensacola
- Angle: on-site valuation explainer with an embedded RealScout HVA (not an off-site redirect), a worked $350,000 net sheet, and the cash-buyer discount ranges with sources
- H2s: Why the Zestimate misses here (flood, roof, condition, street); How we build the CMA; Three pricing strategies and what each does to days on market (data from /market); What it costs to sell: a worked $350K net sheet (doc stamps $0.70 per $100, owner's title policy, prorations, payoff, negotiable commission); What cash buyers actually pay; Net sheet side by side at three price points; When a cash offer makes sense; Prep that pays and prep that does not; Timeline; Get the real number
- Words: 1,800-2,200. Tools/media: net-sheet table, timeline graphic, RealScout HVA iframe (pattern from search.html:243), sold gallery from content/civilian-sold.json (city, price band, DOM, list-to-sale ratio)
- Schema: WebPage, Service, HowTo, FAQPage, ItemList for the sold gallery, Person author
- CTA: Tier 1 "Get My Home Value" (valuation form, inquiryType "Selling My Home")
- Links in: /sell hero (repointed from realscout.com), index valuation CTA, faq selling group, /market, closing-costs blog post, PMH /rent-or-sell-pcs-pensacola and /cash-offer-pensacola. Links out: /market, /sell, PMH cash-offer twin (PCS sellers)
- Refresh: quarterly numbers; sold gallery as closings land

**E. /moving-to-pensacola** [gc-content-07, kw-07, kw-01]
- Title: Moving to Pensacola, FL (2026): Cost of Living, Neighborhoods, Taxes, Insurance, and the Honest Downsides
- Targets: moving to pensacola fl, relocating to pensacola, is pensacola a good place to live, pensacola cost of living, retiring in pensacola, pros and cons of living in pensacola
- Angle: civilian (retiree, remote worker, healthcare and Navy Federal hires) with sourced numbers (BLS, Zillow, PAR, Citizens) and no PCS framing; the PMH moving guide is re-scoped to "on military orders"
- H2s (question-shaped, 15-18): Pensacola in 90 seconds; Cost of living table; Home prices by area (matrix linking the guides); Property tax and the reset at purchase; Insurance reality; Flood and hurricanes, honestly (evacuation zones); Jobs, commutes and remote connectivity; Schools (link /schools); Healthcare; Retiring here (55+, homestead and senior exemptions); Remote workers and second homes; Beaches and lifestyle; The move itself (homestead by March 1, license, registration, utilities); Pros and cons; First 90 days; FAQ
- Words: 3,000-4,500. Tools/media: cost-of-living table, neighborhood match table, photos, map, one video later for the carousel slot
- Schema: Article, FAQPage, ItemList, Person author
- CTA: "Which neighborhood fits you" plus RealScout onboarding
- Links in: index secondary CTA, /buy "Relocating?" block, /neighborhoods, /resources hub, /market. Links out: neighborhood guides, /schools, /resources/florida-home-insurance, /resources/florida-homestead-exemption, PMH /pcs-guide (orders-driven moves)
- Refresh: annual text, quarterly numbers

### 5.6 Bidirectional link map (20 links)

Each is a body-copy anchor, not boilerplate, so Google does not collapse it into the sitewide footer signal [synergy-10]. Preview one page first per the standing rule.

| # | From | To | Anchor text |
|---|---|---|---|
| 1 | PMH /about (SPA AboutPage, plus the prerender shell) | GC /team | The Costin Team, Gregg's full-service civilian practice |
| 2 | PMH /reviews | GC /reviews | all 55 Google and 25 Zillow reviews, civilian and military |
| 3 | PMH /florida-home-insurance-military | GC /resources/florida-home-insurance | the general Florida home insurance guide: roof age, 4-point and wind mitigation inspections |
| 4 | PMH /florida-homestead-exemption-military | GC /resources/florida-homestead-exemption | homestead exemption for non-military Pensacola homeowners, with portability |
| 5 | PMH /first-time-military-homebuyer | GC /resources/first-time-home-buyer | first-time buyer guide for civilian and separated-veteran buyers, including SHIP assistance |
| 6 | PMH /pcs-schools-by-base and /school-zones-military-families | GC /schools | FLDOE grade report for every Escambia and Santa Rosa school |
| 7 | PMH /bases/<base> (each of 7) | GC /schools/<school> (3 nearest) | <School name> school report |
| 8 | PMH /communities/<slug> (each of 19) | GC /neighborhoods/<slug> (card anchor until the page exists) | <Area> for civilian buyers: lifestyle, schools and price bands |
| 9 | PMH /va-loan-closing-costs-florida | GC /blog/closing-costs-florida-buyers | every non-VA closing line item explained |
| 10 | PMH /va-disability-property-tax-florida and /blog/florida-veteran-property-tax-county-guide | GC /blog/property-taxes-escambia-santa-rosa | how Escambia and Santa Rosa tax bills are calculated: millage, TRIM, appeals |
| 11 | PMH /faq | GC /faq | civilian buyer and seller FAQ: NAR settlement, commissions, pricing |
| 12 | PMH /whats-my-home-worth and /cash-offer-pensacola | GC /home-value | selling without PCS orders: the civilian valuation and listing process |
| 13 | PMH /bah-vs-cost-of-owning-pensacola | GC /market | the Pensacola Housing Market Report (monthly numbers by city) |
| 14 | PMH /military-realtor-pensacola | GC /gregg-costin (new person page) | Gregg Costin's civilian profile and awards |
| 15 | PMH /communities (SPA hub, plus shell) | GC /neighborhoods | civilian neighborhood lifestyle guides on GreggCostin.com |
| 16 | GC /team | PMH /military-realtor-pensacola | Gregg's military relocation practice: 11 PCS moves, VA loans, every Panhandle base |
| 17 | GC /buy | PMH /assumable-va-loans-pensacola | assumable VA loans, which any qualified buyer can assume |
| 18 | GC /resources/florida-home-insurance and /waterfront | PMH /pensacola-flood-zones-homebuyers | Pensacola flood zone map for homebuyers (the new August 2025 FEMA maps) |
| 19 | GC /blog/what-moves-mortgage-rates and /blog/fed-rate-hike-what-it-means | PMH /va-irrrl-guide | VA streamline refinance when rates fall |
| 20 | GC /schools/<school> (each of 82, replacing the second homepage link) | PMH /bases/<nearest base> | housing guide for <base> families |

## 6. Prioritized 30-60-90 day action matrix

Every verified finding and every cornerstone is placed once. Rows are grouped where one code change closes several findings. Quadrants: HI/LE = High Impact/Low Effort, HI/HE = High Impact/High Effort, LI/LE = Low Impact/Low Effort, LI/HE = Low Impact/High Effort. Owner: code (implementable in the repo or build), Gregg (dashboard, profile, data or approval), vendor (video production). Quick wins first inside each window.

| Window | Quadrant | Item | Site | Finding ids | Owner | Success metric |
|---|---|---|---|---|---|---|
| Day 1-30 | HI/LE | Real 404: add public/404.html, delete the `/* /index.html 200` wildcard, add the 6 missing community/base alias redirects and the GC /about/ and /about.html rules, fire page_not_found on both 404 pages | BOTH | idx-01, geo-08, url-01, url-04, url-06, analytics-11 | code | `curl -sI /BAH-Rates` returns 404 on PMH; /about, /pcs-guide, /communities stay 200; GC /about/ returns 301; page_not_found visible in GA4 |
| Day 1-30 | HI/LE | Noindex the pensacolamilitaryhousing.pages.dev twin in public/_headers (mirror civilian-site/_headers:8-10) | PMH | geo-02, idx-02 | code | `curl -sI https://pensacolamilitaryhousing.pages.dev/bah-rates` shows x-robots-tag: noindex |
| Day 1-30 | HI/LE | Purge deleted Wikidata Q140446886 and the dead g.co/kgs link from all JSON-LD, llms files and the `<link rel="me">`; invert the audit-civilian gate to fail on its presence; archive add-wikidata-entity.mjs | BOTH | schema-01, synergy-01 | code | grep Q140446886 across public/, civilian-site/, index.html, llms files = 0; audit-civilian = 0 findings |
| Day 1-30 | HI/LE | index.html entity repair: RealEstateOrganization to a valid type, merge the second LocalBusiness, Person-only properties off the agent node, OfferCatalog instead of 17 empty Offers, speakable selectors that resolve; fix the two stale templates (page-template.mjs, content-page-template.mjs) | PMH | schema-04, schema-01v, schema-02v, schema-03v, list-06, geo-09 | code | validator.schema.org on live / = 0 errors; /bah-rates = 0 warnings; grep RealEstateOrganization in dist/ = 0 |
| Day 1-30 | HI/LE | Lead-form repair: give the 825bayshore form's five options stage-map `value` attributes (the PCS checklist form's `honeypot` key and "PCS Checklist Download" type are already accepted by the deployed worker, so aligning it to `_gotcha` is optional hygiene) | GC | list-01, pcs-01 | code + Gregg (locate source) | a test showing request files in FUB as stage Lead with the 2-hour follow-up task |
| Day 1-30 | HI/LE | SPA conversion tracking and GA4 admin: success-gated inquiry_submit and inquiry_open in App.jsx, delete the document submit listener, cross-domain linker plus unwanted-referral list, Enhanced Measurement history page views off, verify then remove the GT- config line, internal-traffic flag via ?internal=1 | BOTH | analytics-01, analytics-03, analytics-04, analytics-05, analytics-08 | code + Gregg (GA4 admin) | DebugView from /pcs-guide shows inquiry_submit and no form_submit; one page_view per SPA navigation; a GC-to-PMH click keeps its client_id |
| Day 1-30 | HI/LE | Compliance set: /privacy and /accessibility on both sites, TCPA-grade consent sentence on every form, rewrite "costs you nothing" and add the buyer-agent compensation FAQ on /buy, /faq, /pcs-home-search, EHO plus disclaimer in the 7 SPA shells and GC 404, remove "safest" and crime-grade language | BOTH | eeat-01, eeat-02, eeat-09, eeat-03, eeat-10 | code | /privacy returns 200 on both hosts; grep "costs you nothing" = 0; curl of /pcs-guide contains Equal Housing Opportunity; grep AreaVibes = 0 |
| Day 1-30 | HI/LE | YMYL corrections: Eglin meta/OG/schema wait-time string, BAH 2026 change wording (+4.2% DoD average) on bah-rates and the two yoyChange strings, one dated Zillow percentile on the hero and About page plus a basis line for the #1 claim | PMH | mil-02, mil-04, eeat-06 | code + Gregg (basis wording) | grep "waits up to" = 0; /bah-rates shows the DoD figure; hero stat and About page state one percentile with a date |
| Day 1-30 | HI/LE | /pcs-guide: gate opens on intent, not on load; flood-zones page: link both August 19, 2025 dates and add the Forerunner/FEMA action box under the H2; /pcs-home-search: search controls above the stock photo | PMH | cro-03, cro-05, cro-07 | code | Clarity 30-day dead and rage clicks on "August 19, 2025" fall from 216/72 toward 0; /pcs-guide mobile scroll depth rises from 20% |
| Day 1-30 | HI/LE | Mobile CSS patch pack (preview one page first): GC header relative on <=900px, 320px overflow fixes, GC hero CTA line-height and un-hidden button row, 16px modal inputs with 44px close, body padding under the sticky bar, 44px secondary targets, scroll-margin, BAH table sticky column | BOTH | mob-02, mob-03, mob-04, mob-05, mob-06, mob-08, mob-09, mob-10 | code | documentElement.scrollWidth = 320 at 320px on GC home and the PMH template; GC hero CTA height >= 48px; modal inputs computed 16px; footer disclaimer visible above the bar |
| Day 1-30 | HI/LE | Critical-path assets: Google Fonts preconnect and preload in index.html (delete the @import), fetchpriority only on the hero, logo width/height on all 93 PMH pages and eager SPA logos, copy logos into civilian-site/images, GC first figure eager with preload, SPA hero-window as a responsive `<img>` | BOTH | perf-01, perf-04, perf-06, media-03, media-11, media-04, perf-08, media-09 | code | fonts CSS request starts before the JS bundle's responseEnd; exactly one fetchpriority=high per page; GC blog first figure has no loading=lazy; 0 dimensionless logos |
| Day 1-30 | HI/LE | OG cards: decode entities, fix the wrap loop, regenerate all 93 plus SPA cards, purge orphan PNGs; rewrite the 4 em-dash strings in src/routeMeta.js and the 8 in the PDF generator; add routeMeta.js and the generator to check-em-dashes.mjs | PMH | og-01, og-03, idx-08, pcs-04 | code | 0 of 93 cards with `&amp;`, em dashes or repeated words; curl /pcs-guide description has no U+2014; pdftotext em-dash count = 0 |
| Day 1-30 | HI/LE | Answer-first BAH: retitle /bah-rates to the query form, move the FL064 table and the $1,863 sentence above the calculator, rename per-base BAH H2s with anchors and 40-80 word answers; start the weekly assumable list block | PMH | kw-04, kw-09 | code + Gregg (weekly list) | Bing avg position for "bah hurlburt field" (6.9) and "nas pensacola bah" (6.3) improves in the next export; assumable page carries a dated ItemList refreshed weekly |
| Day 1-30 | HI/LE | Cloudflare dashboard: Email Address Obfuscation off on both zones, review Bot Fight Mode JS detection, Speed Brain on for greggcostin.com, add Link preload headers for the two hero images | BOTH | perf-07, idx-11, int-01, url-03 | Gregg + code (_headers) | `curl -s https://greggcostin.com/contact \| grep -c email-protection` = 0; h2 probe of PMH / returns a 103 with the hero preload |
| Day 1-30 | HI/LE | Review counts from one source (content/reviews.json), sync GC 54 to 55 and public/reviews.html:462, rename "Preferred Agent" strip and link partner profiles, add platform plus date to quote cards, GC links reviews.greggcostin.com, PMH featured reviews become a non-overlapping military subset | BOTH | eeat-05, cro-12, synergy-03 | code | grep "54 Google" across civilian-site = 0; both /reviews pages say 55; 0 shared 12-word review sentences between the two reviews pages |
| Day 1-30 | HI/LE | Retire the dual-surface SPA routes: `<a href>` for reviews, homestead and blog, delete ReviewsPage, HomesteadPage, VALoanPage, BlogPage, STARTER_POSTS and their PAGE_TO_SLUG entries; correct CLAUDE.md (dead blog worker, honeypot name, line count) | PMH | idx-06, blog-01, blog-02, blog-03, blog-05, url-02 | code | `grep -nE 'go\("(reviews\|blog\|va-loan\|homestead)"\)' src/App.jsx` = 0; footer Homestead click performs a full navigation to /florida-homestead-exemption-military |
| Day 1-30 | HI/LE | Contextual cross-domain links and identity: About and Communities SPA pages (and shells) link GC /team and /neighborhoods, PMH school pages and 7 base pages link GC school reports, GC school template links the nearest base page, one sameAs list (content/entity/sameAs.json) adding Homes.com, LinkedIn, Forbes, one Linktree casing, civilian_site_click event on PMH | BOTH | synergy-07, synergy-09, synergy-10, synergy-11 | code | curl PMH /about shows an anchor to greggcostin.com/team; 7 base pages link greggcostin.com/schools/*; cross_site_click events flow both ways in GA4 |
| Day 1-30 | HI/LE | Civilian E-E-A-T: visible byline plus author card, inline Person node in every post's @graph, 2-source minimum gate in civilian-blog-factory, Sources and References blocks on the three resource guides | GC | geo-06, gc-content-05, eeat-07, eeat-08 | code | every civilian post defines the #gregg Person; each post has >= 2 primary-source links; homestead and insurance guides carry a Sources block |
| Day 1-30 | HI/LE | Content queue and title hygiene: move the 6 civilian topics from the PMH queue to the civilian queue with target keywords, localize the civilian evergreen topics, swap the /pcs-guide and blog titles so each owns its keyword, refresh the first-time-buyer guide with SHIP, City HOME and Hometown Heroes | BOTH | kw-01, kw-07, kw-12 | code | civilian topic-queue.json holds place-named topics with targetKeywords; routeMeta /pcs-guide title carries "PCS to Pensacola"; first-time guide names three programs with caps and sources |
| Day 1-30 | HI/LE | Titles and descriptions: apply the rewrite table (<=60 / 120-155), trim the schools-factory description template, add twitter:title/description/url, og:locale and max-video-preview to the 93 PMH pages, set og:type=website on the 7 utility pages, make bump-dates --html changed-only by default | BOTH | idx-09, og-04, og-05 | code | audit script reports 0 titles > 60 and 0 descriptions > 155; 94 of 94 PMH pages carry twitter:title |
| Day 1-30 | HI/LE | Honest freshness: sitemap lastmod derived from each page's dateModified (both sites), IndexNow host-aware and diff-based, Bing verification for greggcostin.com | BOTH | geo-04, idx-03, analytics-10 | code + Gregg (Bing WMT) | no sitemap lastmod exceeds its page dateModified; submit-indexnow.mjs submits only changed URLs; GC verified in Bing WMT |
| Day 1-30 | HI/LE | IDX deep links: two-button search row under every "Homes for Sale Near <base>" H2 (create the section on Saufley), same row on the assumable page, using the greggc /results/ template with city and price cap | PMH | geo-12, list-03 | code | 7 of 7 base pages contain >= 2 greggc.levinrinkerealty.com anchors; idx_search_click events recorded from base pages |
| Day 1-30 | HI/LE | Link equity to orphans and posts: link veteran-realtor-destin, military-realtor-hurlburt-field and crestview-military-relocation from their base and community pages, trim the duplicated Hurlburt sections, 2-3 in-body links to each blog post from its parent guide, Related-reading insertion in blog-factory | PMH | mil-09, idx-10 | code | audit-links.mjs reports 0 orphans; every /blog/* post has >= 3 distinct inbound sources |
| Day 1-30 | HI/LE | Behavior data and vendor load: separate Clarity project on greggcostin.com with Smart Events and inquiry_submit mirror, FUB widget loads on first interaction (8 s fallback) on both sites | BOTH | analytics-07, analytics-09 | code + Gregg (Clarity project) | GC recordings and heatmaps present within 7 days; widgetbe.com requests absent until pointerdown/scroll or 8 s |
| Day 1-30 | HI/LE | Contact surfaces: desktop header email opens the inquiry modal and copies the address, form borders >= 3:1 and fine print >= 4.5:1, two-step form, success panel offers "Book a 15-minute call" and "Text me now" | BOTH | cro-06, cro-11 | code | Clarity dead clicks on the banner email (84 in 30 days) drop; computed input border contrast >= 3:1 on both templates |
| Day 1-30 | HI/LE | Bring 825bayshore into the repo, replace its 19 em dashes, emit RealEstateListing tied to #gregg, add the family cross-link line and apex URLs, add it to check-em-dashes and a slim form/cross-link check; add a featured-listing card on GC /buy | GC | list-02, list-04, list-07 | code + Gregg (locate source) | subdomain em-dash count = 0; validator shows a RealEstateListing with offeredBy #gregg; `<p data-costin-sites>` present |
| Day 1-30 | LI/LE | Schema hygiene pass: school parentOrganization instead of isPartOf, community containedInPlace addresses, blog-index BlogPosting images and @ids, faq.html publisher to #team, Article.image arrays plus primaryImageOfPage, logo ImageObject dimensions | BOTH | schema-04v, schema-05v, schema-06v, schema-09, schema-07, media-06 | code | validator warnings = 0 on /communities/niceville and a school page; grep gregg-portrait.jpg in Article.image = 0 |
| Day 1-30 | LI/LE | robots.txt consolidation on both sites (grouped UAs, /downloads/ per group, Crawl-delay removed, newer AI fetchers named) | BOTH | geo-07 | code | live robots.txt matches repo; 8-UA smoke test returns 200 on both hosts after deploy |
| Day 1-30 | LI/LE | Outline and NAP tidy: H2 before card grids on buy/sell/neighborhoods/blog/contact/resources, generic lowercase "a realtor" rewrites plus NAR mark line, one email spelling and "220 W Garden St" on both sites, FL and AL license numbers in footers and Person identifiers once confirmed | BOTH | idx-12, eeat-12, eeat-11, eeat-04 | code + Gregg (license lookups) | heading-skip check passes in both audits; one email string sitewide; footer shows the DBPR license number |
| Day 1-30 | LI/LE | PDF housekeeping: add Saufley Field, correct the driver's-license bullet, EHO and address in the footer, `npm run lead-magnet` script reading shared BAH data with a generated date | PMH | pcs-05, pcs-07, pcs-08 | code | pdftotext shows 4 FL064 installations, "Equal Housing Opportunity" and a rates-effective date |
| Day 1-30 | LI/LE | Small code cleanups: hoist Tab/ExtTab/DropItem and delete unused scroll state, remove duplicate about-* images and fix the awacs dimensions, retitle Whiting Field to TRAWING-5 with a direct-answer H2, blog headline helper strips the brand suffix, ads-side Consent Mode default, blog cadence back to weekly | BOTH | perf-09, media-12, kw-08, blog-04, analytics-12, mil-12 | code | Tab components defined at module scope; 18 redundant image files removed; 0 card headlines ending in "\| Gregg Costin" |
| Day 1-30 | LI/LE | Two-hop legacy redirects: either a wildcard_replace rule in the zone redirect or record as accepted risk | BOTH | url-05 | Gregg (Cloudflare rule) | http .html forms resolve in 1 hop, or the decision is logged in docs |
| Day 31-60 | HI/HE | Responsive image pipeline: 480/768/1200/1600 variants, srcset and sizes on every hero and card, Pic for the SPA community grid, better AVIF/WebP encoder settings with a grow guard, AVIF for civilian-site, replace pace-milton | BOTH | perf-03, media-01, media-02, media-08 | code | /communities/cantonment hero on a 375px viewport <= 90 KB (from 352 KB); GC /neighborhoods image bytes under 1 MB (from 3.8 MB); 0 WebP files larger than their JPG |
| Day 31-60 | HI/HE | 56px two-tier mobile header with drawer on both static templates and the SPA, touch-aware dropdown toggles with aria-expanded | BOTH | mob-01, mob-07 | code | header <= 60px at 375px on all three surfaces; small-target share below 20%; every dropdown trigger toggles on touch |
| Day 31-60 | HI/HE | SPA shells with real content: extract INSTALLATIONS, NEIGHBORHOOD_ROWS, BAH_DATA, PCS_FAQS and COMMUNITIES to data modules shared by App.jsx and postbuild, render tables, FAQ details and FAQPage JSON-LD into the fallback, community and base links in the /communities shell, >800-word assertion | PMH | geo-01, idx-04 | code | `curl -sA GPTBot/1.2 /pcs-guide` yields > 1,000 words; /communities shell contains >= 19 /communities/ links |
| Day 31-60 | HI/HE | Hero and CTA system: PMH home (2-column stats, scrolling affiliations strip, base-picker row, two-button hero, no hero tel button), GC home (H1 with a service word, buttons above the portrait, 4-tile trust band), three-tier CTA label set enforced by the factories, cta-strip on all 93 PMH guides and a header button on GC buy/sell/search/neighborhoods | BOTH | cro-01, cro-02, cro-04, cro-08, cro-09 | code + Gregg (headline and subhead approval) | PMH home mobile scroll depth above 30% and exits below 82% in Clarity; GC first CTA inside the first 375x812 screen; grep cta-strip = 93 files |
| Day 31-60 | HI/HE | Entity consolidation: one canonical @id set (#gregg, #team, #brokerage on greggcostin.com) referenced verbatim from PMH, full nodes only on the two homepages plus /about and /team, compact reference nodes everywhere else (ending the 69 conflicting #agent definitions and 31 geo points), hasMap, hours, parentOrganization, explicit founder/employee/memberOf edges, one Person block in content/entity/person.json, new audit-entity.mjs | BOTH | schema-02, schema-03, schema-05, schema-06, synergy-02 | code | audit-entity reports 0 conflicting definitions; grep worksFor inside RealEstateAgent = 0; both sites' Person sameAs include the other site's profile page |
| Day 31-60 | HI/HE | Quick-answer blocks (2-4 dated sentences with the figure and attribution) after the H1 on the 10 Copilot-leading PMH pages and the 3 GC posts, templated into all three factories; "Best Off-Base Neighborhoods" becomes H2 #1 on nas-pensacola; percent range plus dollar example on the closing-costs post | BOTH | geo-03 | code | first 150 words of /bah-rates contain $1,863; closing-costs post lead contains a percent range and a $350,000 example |
| Day 31-60 | HI/HE | School data integrity and linking: sweep-school-grades.mjs from the FLDOE json (strip plus/minus grades, link every mention to the GC report, extend to Okaloosa), School nodes with @id, address, identifiers and correct WebPage.about, feeder and nearby-school links plus neighborhood block on 82 school pages, per-school OG cards | BOTH | mil-01, idx-07, gc-content-09, schema-10 | code | grep "(A-)" and "(A+)" in public/ = 0; every school page has >= 6 internal links and a unique OG image; PMH school mentions resolve to greggcostin.com/schools/* |
| Day 31-60 | HI/HE | Data spines: content/affordability-2026.json (one E-5 band), content/commutes.json rendered as a commute matrix on 7 base pages and rows on 19 community pages, sweep-bah.mjs with data-bah tokens including JSON-LD, comparison tables on the "vs" pages, delete the hedge sentences on the Whiting off-base page | PMH | mil-03, mil-05, mil-08, mil-11 | code | one purchase-price band per grade sitewide; commute matrix on 7 of 7 base pages; `npm run check:bah` passes; ANNUAL-UPDATE lists all 40 BAH files |
| Day 31-60 | HI/HE | On-base cluster: merge Saufley into the NAS Pensacola on-base page (301), rewrite Corry around Corry Village, base-specific detail replacing the shared 56-sentence block, Eglin and Duke housing H2s, arrival-logistics module (gate/DBIDS, lodging, FFSC or M&FRC, EFMP, MSEP) on every base page, stamps that advance only on body change | PMH | mil-06, mil-10 | code | duplicate sentence share on remaining on-base pages < 30%; DBIDS and lodging present on 7 of 7 base pages |
| Day 31-60 | HI/HE | Cornerstone P1: /homes-for-sale-near-nas-pensacola (then hurlburt-field, eglin-afb, whiting-field) via page-factory | PMH | kw-03, mil-07 | code + Gregg (IDX filter verification) | pages indexed; Bing "homes for sale near nas pensacola" cluster records clicks (currently 1 of 30 impressions) |
| Day 31-60 | HI/HE | Cornerstone P2: /bah/<base> pages rendered from content/bah/2026.json, linked from /bah-rates jump list and base BAH H2s | PMH | kw-04, mil-07 | code | 6 pages live and in sitemap; "hurlburt field bah" position improves in the next Bing export |
| Day 31-60 | HI/HE | Cornerstone A: civilian-neighborhood-factory plus the first 8 guides, hub rebuilt around a comparison table with Place nodes, hub cards and index "Where we work" repointed on-site, filtered IDX "homes for sale now" blocks | GC | gc-content-01, gc-content-06, gc-content-08, synergy-04, kw-02 | code + Gregg (photos, street-level knowledge) | 8 /neighborhoods/<slug> pages live; neighborhoods.html deep links to PMH = 0 (one secondary PCS line each); audit-civilian = 0 findings |
| Day 31-60 | HI/HE | Cornerstones C and D: /market living page from content/civilian-market/<quarter>.json with charts and Dataset schema; /home-value with embedded HVA, worked net sheet, cash-offer-vs-listing and a /sold gallery; sell.html and index CTAs repointed on-site; Q3 market post moved to the civilian queue | GC | gc-content-03, gc-content-04, kw-05, kw-06 | code + Gregg (PAR monthly data) | /market live with a dated table and source URLs; 0 direct greggcostin.realscout.com valuation links on sell.html; /sold ItemList validates |
| Day 31-60 | HI/HE | Cornerstone E: /moving-to-pensacola on GC; PMH moving guide re-scoped to "on Military Orders" with reciprocal links | BOTH | gc-content-07, kw-07 | code | GC page indexed; the two guides carry distinct titles and link each other |
| Day 31-60 | HI/HE | Brand entity home: GC /gregg-costin ProfilePage, name in the GC hero eyebrow, profile website fields (Zillow, Homes.com, LinkedIn, Realtor.com, Facebook, Instagram, Linktree) set to greggcostin.com, civilian llms-full generator covering all pages, llms links in robots and footer | GC | synergy-06, geo-05 | code + Gregg (profile edits, GBP decision) | greggcostin.com appears in the link set for "gregg costin realtor"; llms-full.txt lists every civilian URL; audit-civilian asserts llms URLs exist |
| Day 31-60 | HI/HE | Cross-domain equity rollout: data-civilian-xlink callouts on the 15 PMH target pages, GC guide retitles to the SERP angle (cost, portability, assistance), reciprocal money-post links, 5-gram Jaccard gate in all three factories | BOTH | synergy-05, synergy-08, synergy-12 | code | PMH pages with data-civilian-xlink >= 25 (audit-links warns below); factories fail on Jaccard >= 5% |
| Day 31-60 | HI/HE | Lead magnet rebuilt from the page (40 items, matching 60/30/7 timeline), PDF CTA block on /pcs-guide, /bah-rates and the PCS blog post, SPA checklist re-bucketed to 60/30/7 | PMH | pcs-02, pcs-03 | code | PDF checklist item count = page count; lead_magnet_download events originate from /pcs-guide |
| Day 31-60 | HI/HE | Analytics taxonomy: one event spec on all three surfaces, cta_location/inquiry_type/link_domain/to_site as custom dimensions, first-touch attribution in localStorage sent with every lead plus GA client_id, worker tags and X-System per site | BOTH | analytics-02, analytics-06 | code | test lead in FUB carries utm and landing tags; GA4 key events limited to the spec list; end-to-end test plan steps 1-7 pass |
| Day 31-60 | HI/HE | PMH audit gate: scripts/audit-military.mjs in prebuild, factories generate the OG PNG in the same run; real hub pages /bases and /guides and breadcrumb crumbs repointed off homepage fragments | PMH | og-02, schema-08, idx-05 | code | prebuild fails on a missing OG image or canonical; grep "#resources" and "#neighborhoods" in BreadcrumbList = 0; /bases returns 200 with 7 cards |
| Day 31-60 | HI/HE | Bundle split: React manual chunk, lazy calculators via React.lazy and Suspense | PMH | perf-02 | code | main app chunk under 60 KB brotli; React chunk hash unchanged across content deploys |
| Day 31-60 | HI/HE | Six civilian service-area pages (Gulf Breeze, Pace, Navarre, Milton, Cantonment, Perdido Key) with Service schema and named reviews; areaServed substantiated | GC | geo-11 | code | 6 pages live; every areaServed City has a matching URL |
| Day 31-60 | LI/LE | Image sitemap entries (xmlns:image, hero and figure images) in both sitemap writers | BOTH | media-07 | code | grep image:image in both sitemaps > 0 |
| Day 31-60 | LI/LE | PDF gate: worker returns the (tokenized) PDF path on success instead of the literal in page source; bare /downloads/ handled | PMH | pcs-06 | code | /downloads/pensacola-pcs-checklist.pdf path absent from the page source |
| Day 61-90 | HI/HE | Video program: three first videos (NAS Pensacola commute, Whiting to Pace/Milton commute, 90-second intro), facade embeds, VideoObject with visible transcripts, video sitemap entries, proof-of-media block on both sell pages, Part 107 line once confirmed | BOTH | media-05, media-10, schema-11 | Gregg + vendor + code | 3 VideoObject nodes live with transcripts; sell pages show one real listing gallery or tour |
| Day 61-90 | HI/HE | Cornerstone B: /waterfront plus /new-construction; Person knowsAbout extended | GC | gc-content-02 | code + Gregg (drone footage) | both pages live and linked from 5 neighborhood guides and the insurance guide |
| Day 61-90 | HI/HE | Cornerstone P3: /renting-on-bah-fort-walton-beach with HUD FMR and ZORI data; Pensacola renter page becomes the rental cornerstone | PMH | kw-10, mil-07 | code | page live; Bing FWB rental queries land on it instead of the Pensacola page |
| Day 61-90 | HI/HE | Cornerstone P5: flight-student guide expansion plus the unaccompanied-housing/dorms page | PMH | kw-08, mil-07 | code | "training air wing five" (15 impressions, pos 9.7) gains clicks; dorm page indexed |
| Day 61-90 | HI/HE | Orange Beach and Gulf Shores dual-license page with Baldwin County areaServed on both entities | GC | kw-11 | code + Gregg (Baldwin MLS coverage check) | page live; areaServed on #team and #agent both list Baldwin County |
| Day 61-90 | LI/HE | Featured-listings JSON block with RealEstateListing ItemList on GC /buy and /sell | BOTH | list-05 | code | ItemList validates; each listing card links a live property page |
| Day 61-90 | LI/HE | Self-hosted variable fonts with immutable caching, shared site.js/site.css extracted from the templates, lazy Pagefind CSS | BOTH | perf-05, perf-10 | code | 0 requests to fonts.googleapis.com; template change touches one file |
| Day 61-90 | LI/HE | Reading rhythm: 68ch measure, alternating section backgrounds on the SPA home, 6-glyph icon sprite, optional cream reading band A/B on one guide | BOTH | cro-10 | code + Gregg (sign-off on the A/B) | measure <= 75 characters per line on both templates |

### If you only do ten things

1. Ship the real 404 and the pages.dev noindex on PMH [idx-01, geo-08, url-01, idx-02, geo-02].
2. Purge the deleted Wikidata item and repair index.html's invalid entity blocks [schema-01, synergy-01, schema-04, schema-01v].
3. Fix the 825 Bayshore lead form and add success-gated SPA conversion events with FUB attribution [list-01, analytics-01, analytics-02].
4. Post privacy and accessibility pages, TCPA-grade consent text, and the buyer-representation rewrite [eeat-01, eeat-02, eeat-09].
5. Turn off the /pcs-guide on-load modal and link the flood-map dates that draw 288 dead and rage clicks [cro-03, cro-05].
6. Apply the mobile CSS patch pack, then build the 56px header with a drawer [mob-02 through mob-10, mob-01].
7. Regenerate the 71 defective OG cards and purge the em dashes in routeMeta and the PDF [og-01, og-03, pcs-04].
8. Correct the school grades sitewide from the FLDOE json and link every mention to the GC report [mil-01, idx-07].
9. Make /bah-rates answer first and build the per-base BAH and homes-near-base cornerstones [kw-04, geo-03, kw-03].
10. Give greggcostin.com its own neighborhood guides, /market and /home-value, and repoint the hub off the military site [gc-content-01, gc-content-03, gc-content-04, synergy-04].

---

## Appendix A. All verified findings by dimension

185 findings across 19 dimensions (13 primary dimensions plus 6 gap probes). Each entry shows site, severity, effort, and the verifier's verdict, then the evidence and fix as recorded. Evidence and fix text are trimmed for length; the full workflow record is retained in the audit working files.

### Performance & asset efficiency

10 findings (1 high, 6 medium, 3 low). Strengths noted: Delivery layer is already top-tier on both hosts: Brotli on every text response, HTTP/3 advertised (alt-svc h3), TTFB 41-130 ms from a US client, cf-cache-status HIT on assets, and a correct tiered cache policy in public/_headers (/assets/* immutable 1 y, /images/* and /og/* 30 d, /pagefind/* 7 d) mirrored in civilian-site/_headers. | Modern image formats are complete on PMH: 113 AVIF + 113 WebP variants cover every JPEG/PNG (0 missing), all 324 static &lt;img&gt; are wrapped in &lt;picture&gt; with decoding="async", below-fold images are lazy, and GC has explicit width/height on 230 of 230 images. | Third-party discipline that most agent sites lack: the FollowUpBoss widget is deferred with requestIdleCallback (5 s timeout) on both sites, Pagefind UI JS is only fetched when the search modal opens, Clarity and gtag are async, static pages preconnect and preload the Google Fonts CSS, and Cloudflare Speculation Rules prefetch the next navigation. | Pages are genuinely light: static HTML 10-24 KB brotli, the SPA home is 12 KB of HTML with 493 DOM nodes and 20 requests, GC home 286 nodes and 12 requests, and even the unsplit React bundle is only 99 KB brotli. | Every SPA route ships a prerendered shell with its own title, canonical and a real H1 plus fallback content (scripts/postbuild-spa-routes.mjs; live home #root fallback = 12,317 B with the H1), so crawlers and no-JS agents get content without executing the bundle. | Zero measured layout shift on repeat views of the PMH home, PMH /reviews and GC home (buffered layout-shift entries = 0), and the sticky mobile CTA bars use fixed 48 px min-height so they never push content.

Auditor notes: Data limits: no Lighthouse or CrUX numbers exist for this run (PSI quota exhausted); do not attribute any score. Browser-pane measurements were taken on cached repeat views in a hidden tab at a 320 px emulated viewport, so the LCP entries it emitted (about 4.0 s, attributed to the CtaBanner background) reflect the hidden-tab paint deferral, not real user timing, and are deliberately not reported; CLS 0 applies to cached views only. Transfer sizes come from curl with Accept-Encoding br and from the Performance API encodedBodySize; the esbuild attribution in perf-02 externalizes React and stubs removed components, so treat it as accurate to within a few percent. Judgment calls: (1) the hero (...)

#### [perf-03] No responsive images: every hero and grid photo is served at 1600 px to 375 px phones (0 srcset widths, 0 sizes on ~200 pages and in the SPA)

- meta: BOTH | high | effort medium | confirmed
- Evidence: Repo scan: PMH public/** 324 &lt;img&gt;, 0 srcset width descriptors, 0 sizes attrs; GC civilian-site/** 230 &lt;img&gt;, 0 srcset, 0 sizes; SPA Pic component (src/App.jsx:170-181) emits single-URL &lt;source srcSet&gt;. scripts/generate-modern-images.mjs only transcodes at source dimensions (sharp(srcPath).avif()/.webp(), no resize). PMH: 88 fetchpriority="high" hero &lt;img&gt; across static pages, all width="1600"; AVIF median 97,622 B, mean 134,915 B, 25 heroes &gt; 200 KB, max (...)
- Impact: Mobile visitors (124 of 407 Clarity sessions, and the majority of Google organic per the evidence file) download 3-8x more image bytes than their viewport can show. LCP images of 300-378 KB on community/VA pages are the dominant LCP cost on those templates; (...)
- Fix: As proposed (width variants 480/800/1200 from generate-modern-images.mjs with withoutEnlargement, srcset+sizes on hero &lt;picture&gt; sources, Pic for the SPA community grid, re-encode or delete pace-milton.webp, add a webp-larger-than-jpg guard to audit-civilian.mjs), with these adjustments: make the template edit in public/first-time-military-homebuyer.html (the file both factories clone) and civilian-blog-factory's template, then run a one-off script over public/**/*.html and civilian-site/**/*.html to (...)
- Verifier: Every number reproduced (my &lt;img&gt; totals are slightly higher than the finder's because I counted all HTML files). High severity is justified: these are the LCP images on the community/VA templates and the largest byte cost on both sites. One fix (...)

#### [perf-01] SPA fonts are discovered only after the JS bundle runs (@import inside a React-rendered &lt;style&gt;, no preconnect), causing a late font swap and H1 reflow on every SPA route

- meta: PMH | medium | effort low | narrowed
- Evidence: src/App.jsx:2788-2789 renders &lt;style&gt;{@import url('https://fonts.googleapis.com/css2?family=Inter...&family=Playfair+Display...')} inside App(); index.html has 0 matches for rel="preconnect" or dns-prefetch. Live (in-pane Performance API, cached view): assets/index-RLypSHbL.js responseEnd 87 ms, fonts.googleapis.com/css2 request startTime 119 ms (i.e. only after bundle execution), then fonts.gstatic woff2; 8 font faces loaded on the home page (Inter 300/400/500/600, Playfair 400i/500i/500/600). H1 computed (...)
- Impact: On a cold mobile load the hero H1 (the LCP text candidate at phone widths) waits on HTML -&gt; 99 KB brotli JS -&gt; React render -&gt; cross-origin CSS (new connection) -&gt; woff2 (second new connection) before it can swap into Playfair; every hop is (...)
- Fix: In index.html &lt;head&gt; (above the gtag script) copy the exact four-line pattern from public/first-time-military-homebuyer.html:53-56 (preconnect fonts.googleapis.com, preconnect fonts.gstatic.com crossorigin, &lt;link rel=preload as=style onload="this.rel='stylesheet'"&gt;, &lt;noscript&gt; stylesheet) using the URL family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap (adds the Inter 700 and Playfair 700 the SPA actually uses at App.jsx (...)
- Verifier: Core is real, but 'high' overstates it: the URL uses display=swap, so the hero H1 paints in the fallback serif immediately and that fallback paint is the LCP candidate; the fonts are not on the LCP critical chain. The user-visible cost is a late FOUT swap (...)

#### [perf-02] One unsplit 340 KB / 99 KB-brotli bundle ships the calculators plus three dead components (VALoanPage, BAHGrid, BaseGuide) to every SPA visitor

- meta: PMH | medium | effort medium | narrowed
- Evidence: vite.config.js: build:{outDir:'dist'} only, no rollupOptions.output.manualChunks; 0 matches for React.lazy/lazy( in src/. dist/assets/index-RLypSHbL.js = 340,695 B raw, 99,147 B brotli (live curl, cf-cache-status HIT). esbuild attribution (React externalized, minify): App.jsx app code 193,657 B min / 43,035 B br; calculators AmortizationAnalyzer+LoanComparison+LoanCalculator (src/App.jsx:1427-2278) = 47,309 B min / 8,862 B br; unreachable components VALoanPage (1056), HomesteadPage (1138), BAHTable (1221), (...)
- Impact: 78,988 B minified / 15,721 B brotli (41% of the app code) is parsed and compiled on every visit for routes the visitor cannot reach or rarely opens (calculators = 1 route of 7). Every App.jsx edit also invalidates the whole 99 KB file including React (~147 (...)
- Fix: 1) Convert go("reviews") at src/App.jsx:634 and :718 to &lt;a href="/reviews"&gt; (static public/reviews.html) and go("homestead") at :718 and :1031 to &lt;a href="/florida-homestead-exemption-military"&gt;; then delete VALoanPage, HomesteadPage, BAHGrid, BaseGuide, ReviewsPage and the branches at :2841,:2843-2848,:2851, and remove 'va-loan','homestead','reviews' from PAGE_TO_SLUG (:2693,:2695,:2697). Keep BAHTable (used by PCSPage). 2) Move AmortizationAnalyzer/LoanComparison/LoanCalculator (1427-2278) to (...)
- Verifier: The single unsplit bundle is real and the calculator split is worthwhile, but 'unreachable' applies to about half the listed components, and the '0.3-0.5 s on 4G' figure is an estimate (no field or lab timing exists this run). Realistic saving is roughly (...)

#### [perf-04] GC header logos are hot-linked cross-origin with no preconnect on all 102 pages; both sites also mark the decorative logos fetchpriority=high alongside the hero

- meta: BOTH | medium | effort low | narrowed
- Evidence: PMH: 241 fetchpriority="high" &lt;img&gt; across 82 static pages (every page has 2-3: public/first-time-military-homebuyer.html:263-264 both logos + the hero). GC: 197 across 99 pages, 98 pages with &gt;= 2; civilian-site/index.html: &lt;img fetchpriority="high" src="https://pensacolamilitaryhousing.com/images/logo-lrr.png" width="834" height="472"&gt; and logo-08-sm.png (480x196), plus the hero portrait; 0 matches for preconnect href="https://pensacolamilitaryhousing.com" in civilian-site/. The logos render at (...)
- Impact: Chrome gives all three images the same top priority, so the actual LCP hero competes with two decorative logos and the fonts CSS for the first bytes. On greggcostin.com (including all 82 school pages) the two header images additionally require a DNS + TCP + (...)
- Fix: GC (main win): copy logo-lrr.{png,avif,webp} and logo-08-sm.{png,avif,webp} into civilian-site/images/, rewrite the two absolute URLs in all civilian-site pages to /images/logo-*.{avif,webp,png} (sed over the two hostnames), keep the width/height attrs, run node scripts/audit-civilian.mjs to 0 findings; if hot-linking must remain, add &lt;link rel="preconnect" href="https://pensacolamilitaryhousing.com" crossorigin&gt; to every civilian head. Both sites: drop fetchpriority="high" from the two logo &lt;img&gt; (...)
- Verifier: Real on both sites, but the PMH half is low impact: the two logo AVIFs total ~40 KB, sit inside the first viewport, and are cached for 30 days across all pages, so the priority overlap costs little. The GC half (a second origin's DNS+TCP+TLS inside the (...)

#### [perf-06] Header CLS risk on all 93 PMH static pages: 31 logos have no width/height and 62 declare a wrong 240x108 ratio; the SPA lazy-loads its fixed-header logos

- meta: PMH | medium | effort low | confirmed
- Evidence: 31 PMH pages contain exactly &lt;img fetchpriority="high" src="/images/logo-lrr.png" alt="Levin Rinke Realty"&gt; with no width/height (e.g. public/first-time-military-homebuyer.html:263-264, public/reviews.html, public/pcs-home-search.html, public/whats-my-home-worth.html, public/blog/pcs-to-pensacola-2026-complete-guide.html and the other 10 blog posts) while CSS is .banner-logo img{height:108px;width:auto} (56px/44px at breakpoints), so the 3-column banner grid cannot reserve the center logo width until the (...)
- Impact: On a cold load the banner's phone/email column and the tab bar can shift horizontally/vertically when the logo PNG arrives, on the pages that carry the site's blog content and the reviews page. In the SPA, loading="lazy" on an always-visible fixed-header (...)
- Fix: Scripted sed over public/**/*.html replacing both variants: logo-lrr.png tags -&gt; width="834" height="472", logo-08-sm.png tags -&gt; width="480" height="196" (replacing width="240" height="108" where present and inserting where absent), starting with the template public/first-time-military-homebuyer.html:263-264 so page-factory and blog-factory inherit it; preview one page first. In src/App.jsx:233 and :236 change to &lt;Pic loading="eager" width={834} height={472} .../&gt; and &lt;Pic loading="eager" (...)
- Verifier: Confirmed and actually wider than stated: all 93 PMH static pages either omit dimensions (31) or declare a wrong aspect ratio (62). The fix must target the shared template file (not a blog-factory header block) and both attribute variants.

#### [perf-07] Third-party and Cloudflare-injected JS is about 3x the first-party payload; two Cloudflare features (Email Obfuscation, Bot Fight JS detection) add scripts and a POST to every page

- meta: BOTH | medium | effort low | confirmed
- Evidence: Live curl with Accept-Encoding br (2026-09-02): googletagmanager gtag/js?id=G-W29GHBK38M 195,026 B; widgetbe.com/agent (FollowUpBoss) 79,453 B plus XHRs /config and /pages and 2 injected iframes (10 'iframe sandbox' console warnings on the PMH home); scripts.clarity.ms/0.8.69/clarity.js 25,397 B (PMH only); static.cloudflareinsights.com/beacon.min.js 9,509 B; /cdn-cgi/challenge-platform/h/b/scripts/jsd/.../main.js 9,540 B + POST /cdn-cgi/challenge-platform/.../oneshot per page view (PMH only, 0 on GC); (...)
- Impact: Main-thread work after load on phones is dominated by scripts the site does not control; the obfuscation script must run before any mailto: link (sticky Email CTA, banner email) has a real href, and Clarity already logs 84 dead clicks on the banner email (...)
- Fix: As proposed, plus: verify GT-WVGM66XS belongs to the G-W29GHBK38M Google tag before removing the line from index.html:26 and the static template (grep -rl "GT-WVGM66XS" public civilian-site to find every copy).
- Verifier: The injected Cloudflare scripts and the third-party ratio are real and the dashboard fixes are correct (Scrape Shield &gt; Email Address Obfuscation; Security &gt; Bots &gt; Bot Fight Mode / JavaScript Detections). One caution on the GT- line: confirm in GA4 (...)

#### [perf-08] Homepage hero is a CSS background of a 2000x2000 asset painted in a 280-340 px box on phones

- meta: PMH | medium | effort low | confirmed
- Evidence: src/index.css:12-17: .hero-bg-image{background-image:url(/images/hero-window.jpg);background-image:image-set(url(/images/hero-window.avif) type("image/avif"), ...)}; public/images/hero-window.avif = 98,211 B at 2000x2000, hero-window.jpg fallback 277,605 B. index.html:460-473 sizes .hero-bg-image to height 340/300/280 px at phone breakpoints (live: 280 px box at 320 px width, computed background-image resolves to hero-window.avif). index.html:13 preloads the AVIF with fetchpriority="high" (live: fetched at 82 ms, (...)
- Impact: A CSS background cannot use srcset/sizes, so phones receive the full 98 KB (277 KB where AVIF is unsupported) for a 375x280 render, and the element is only created after React renders. A 640-px AVIF for that box would be roughly 15-20 KB; the difference is (...)
- Fix: Replace the div at src/App.jsx:422 with &lt;img className="hero-bg-image" alt="" decoding="async" fetchPriority="high" src="/images/hero-window-1200.jpg" srcSet="/images/hero-window-640.avif 640w, /images/hero-window-1200.avif 1200w, /images/hero-window-2000.avif 2000w" sizes="(max-width:900px) 100vw, 60vw" style={{position:'absolute',top:180,right:0,height:'100%',width:'auto',objectFit:'cover',objectPosition:'right top'}} /&gt; (the &lt;=900px rules at index.html:460-473 already override to (...)
- Verifier: Confirmed. The fix is workable but the desktop composition relies on background-size 'auto 100%' anchored right, so the replacement &lt;img&gt; should use height:100%, width:auto, right:0 rather than object-fit cover across the full width; the (...)

#### [perf-05] Google Fonts adds two third-party origins and one CSS round trip per page and requests an unused face (Inter 800); self-hosting is a modest, mostly-SPA win

- meta: BOTH | low | effort medium | narrowed
- Evidence: Static templates on both sites request family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700;800 (10 faces; public/first-time-military-homebuyer.html and civilian-site/index.html head); inline CSS font-weight values used on both templates: 300,400,500,600,700 (Inter 800 never used). Live: 7 faces loaded on pensacolamilitaryhousing.com/reviews and greggcostin.com/. Google now serves variable woff2 (Chrome UA): Inter latin 48,256 B, Playfair latin 38,404 B (one file each, deduped), so (...)
- Impact: Every page view on both domains pays two extra TLS connections and one blocking cross-origin CSS fetch before text can use the brand fonts; on the SPA this is the tail of the chain in perf-01. Self-hosting also removes the Google Fonts dependency from the (...)
- Fix: Short term: drop ;800 from the Inter weights in the two static templates (public/first-time-military-homebuyer.html:55-56, civilian-site/index.html:74-75) and the existing pages via sed. Optional: self-host the latin variable woff2 files under public/fonts/ and civilian-site/fonts/ with the @font-face + unicode-range block the finder gave, add /fonts/* Cache-Control: public, max-age=31536000, immutable to both _headers files, and preload only the Playfair file used by the H1. Apply the same block to index.html to (...)
- Verifier: The dependency and the unused Inter 800 are real, but on ~200 of the ~210 pages the Google Fonts CSS is already loaded non-blocking with preconnects in place, so the per-page cost is one extra CSS round trip and one extra connection, not blocking time. (...)

#### [perf-09] INP hazard in the SPA nav: components defined inside render remount the whole tab bar on every hover/scroll state change; unused scroll state

- meta: PMH | low | effort low | confirmed
- Evidence: src/App.jsx:210-222 define const Tab, ExtTab, DropItem inside the Nav function body, so each Nav render creates new component types and React unmounts/remounts every tab. Nav re-renders on setPcsOpen/setBasesOpen/setCommsOpen/... (onMouseEnter at :244-245 and siblings) and on the scroll listener at :190-194 that sets scrolled, a state variable that is never read (only occurrence at :184). 10 onMouseEnter / 12 onMouseLeave handlers mutate element.style directly across App.jsx (e.g. :2295-2296).
- Impact: Opening any nav dropdown or crossing 20 px of scroll rebuilds ~20 buttons and their inline style objects; on low-end phones this is avoidable main-thread work during the first interaction (INP). Minor today (493 DOM nodes) but it scales with every nav item (...)
- Fix: As proposed: hoist Tab/ExtTab/DropItem to module scope taking {current, go}, delete :184 and :190-194, and move hover styling into :hover rules inside the existing &lt;style&gt; block.
- Verifier: Confirmed as code-verified, low severity as stated; every Nav render creates new component identities so React remounts each tab. Fix is correct and safe.

#### [perf-10] Template CSS/JS is inlined into every static page, so repeat views re-download it (HTML is max-age=0) and a template change is a 100-file edit

- meta: BOTH | low | effort medium | confirmed
- Evidence: public/first-time-military-homebuyer.html: 3 &lt;style&gt; blocks = 18,061 B raw (3,839 B brotli) + 8,017 B inline JS (2,386 B brotli) + 5 JSON-LD blocks (8,055 B); whole page 67,593 B raw / 17,004 B brotli. civilian-site/buy.html: 13,183 B CSS (2,784 B br) + 7,641 B JS (1,821 B br); page 45,613 B raw / 10,004 B brotli. Live HTML headers on both hosts: Cache-Control: public, max-age=0, must-revalidate; cf-cache-status DYNAMIC. Multiplied over 101 PMH and 102 GC pages. /pagefind/pagefind-ui.css (2,651 B br) is (...)
- Impact: Small per-page cost (about 6 KB brotli per navigation) and no first-paint penalty, because inline critical CSS is the right choice for these page sizes. The real cost is maintenance drift (perf-06 shows 31 pages already diverged from the template) and the (...)
- Fix: As proposed; add /assets/* Cache-Control: public, max-age=31536000, immutable to civilian-site/_headers when creating civilian-site/assets/site.js, and lazy-inject /pagefind/pagefind-ui.css alongside pagefind-ui.js on first search open.
- Verifier: Confirmed, low. The finder's own framing is fair: inline critical CSS is right for these page sizes; the real cost is template drift (perf-06 shows two logo-attribute variants across 93 pages). The fix works on Cloudflare Pages: a ?v= query on (...)

Verifier-noted items outside the numbered list: PMH (code-verified): the hero preload is unconditional on phones. index.html:13 preloads /images/hero-window.avif (98,211 B) with fetchpriority="high" and no media attribute, but at &lt;=900px index.html:459-460 moves (...) | PMH (code-verified): the SPA never loads the bold weights it uses. src/App.jsx:2789 requests Inter:wght@300;400;500;600 and Playfair 0,400;0,500;0,600 only, while App.jsx uses fontWeight: 700 56 times and fontWeight: (...) | GC (code-verified): the civilian site ships no AVIF at all and its WebPs are near-JPEG size. civilian-site/images contains 24 .webp and 0 .avif; scripts/generate-modern-images.mjs only walks public/images. (...) | PMH (code+live-verified): several AVIF heroes barely beat their JPEG/WebP siblings, which signals the encoding step rather than the format is the problem. 10 of 113 public/images AVIFs exceed 250 KB: (...)

### Mobile-first responsiveness & touch UX

10 findings (4 high, 4 medium, 2 low). Strengths noted: Sticky mobile Call/Text/Email bar (both sites + SPA): 48-52px min-height, three equal thumb-zone targets, sms: link with a prefilled body, per-link aria-labels and data-cta attributes, focus-visible outline, and it suppresses the FollowUpBoss bubble on phones (iframe[name=widgetCta]{display:none}) so only one floating element competes for the bottom edge. | PMH static pages already unstick the header on &lt;=900px (ddfix-css on 93/93 pages) and turn dropdowns into full-width 55vh scroll panels with 43px-tall link rows; live at 320px the Resources panel measured 296px wide with 43px rows. This is the pattern GC and the SPA should copy (mob-02). | Inquiry modal fundamentals are right on both sites: role=dialog + aria-modal, body scroll lock on open (body.style.overflow='hidden'), overlay scrolls internally (overflow-y:auto), honeypot input offscreen, 42-45px inputs and a 45px submit; only the font size and padding need the phone patch. | Viewport hygiene: width=device-width, initial-scale=1 on every page checked, no user-scalable=no or maximum-scale (pinch-zoom preserved), no horizontal scroll at 375px on any tested page (GC home, PMH static guide, PMH SPA home), and reading typography holds up on phones (16.5px body, 25px H2 at &lt;=640px, overflow-wrap:anywhere on headings, EXPLORE_V2 collapses to one column with ~38px link rows). | Pagefind search dialog on PMH uses a native &lt;dialog&gt; with ::backdrop, 92vw width, 88vh max-height, a 36px close control and a 16.8px input, so it opens without iOS zoom and is fully usable on a phone. | BAH tables are 3-column, wrapped in an overflow-x container with a 320px min-width, so the core PCS data (54 Copilot citations on /bah-rates) reads without sideways scrolling on 360-430px phones; 51 of 54 table-bearing pages reuse the same wrapper.

Auditor notes: Measurement method: Chromium viewport emulation in the in-app Browser pane at 320x568 and 375x812 (CSS px) on the live sites 2026-09-02, plus static reading of the deployed HTML fetched with curl (deployed CSS matched the repo byte-for-byte for every rule cited: GC 9px tab rule, sticky banner, hero overlay; PMH ddfix-css; SPA bundle index-RLypSHbL.js). No Lighthouse, CrUX or real-device iOS data was available this run; iOS input-zoom and Safari hover-emulation behavior are stated from platform behavior, not observed on a device. The shared browser tab was navigated by another specialist mid-run, so I re-ran all measurements in a dedicated tab; one early number set (SPA 320px overflow) came (...)

#### [mob-01] No hamburger: 13-15 nav tabs wrap into 3-6 rows of 9-10px type with 22-26px tap targets on every page

- meta: BOTH | high | effort medium | confirmed
- Evidence: Code: civilian-site/index.html:90 (.banner-tabs&gt;a padding 6px 10px, font 11px) and :216 (@480px: padding 4px 6px!important; font-size 9px!important); same rule in all 93 PMH static pages (public/first-time-military-homebuyer.html:88 and :216); SPA src/App.jsx:200-201 (padding 6px 10px, fontSize 11) and :2801 (&lt;=900px: padding 5px 7px, font 10px; no 480px rule at all). Live (Chromium emulation, 2026-09-02): GC 375px = 3 rows, tabs 24px tall, 9px font, header 147px; GC 320px = 4 rows, header 173px; PMH static (...)
- Impact: Phones (30% of PMH sessions per Clarity; mobile engagement 46s vs 78s PC) load into 147-191px of 9-10px uppercase chips before any content; a 24px-tall row-packed link grid is the classic mis-tap surface, and 9px text is below the 12px legibility floor and (...)
- Fix: Replace the wrapped bar with a 56px 2-tier compact header + drawer on &lt;=900px (one shared patch for both static templates, mirrored in the SPA Nav). HTML: add &lt;button class="nav-toggle" aria-controls="site-drawer" aria-expanded="false" aria-label="Open menu"&gt; (3-bar SVG) to .banner-row and wrap the existing .banner-tabs in &lt;div id="site-drawer" class="site-drawer"&gt;. CSS: @media(max-width:900px){.banner-row{grid-template-columns:auto 1fr auto auto;padding:8px (...)
- Verifier: Reproduced everything material; only row counts differ by one (GC 375 is 4 rows not 3, PMH static 375 is 4 rows not 5). Fix is implementable: a stylesheet !important beats the SPA inline styles, and the @480 block must go or its !important wins. Hiding (...)

#### [mob-02] GC header is position:sticky at every width (147-173px) and the SPA nav is position:fixed (161px): 25-31% of a phone screen is permanently chrome; PMH static pages already solved this

- meta: BOTH | high | effort low | confirmed
- Evidence: Code: civilian-site/index.html:82 .main-banner{...position:sticky;top:0} with no mobile override (0 of 102 civilian pages contain 'main-banner{position:relative}'; 102/102 contain position:sticky). src/App.jsx:230 &lt;nav className="spa-nav" style={{ position: "fixed" ...}} with no mobile override. Contrast: public/first-time-military-homebuyer.html:254-255 &lt;style id="ddfix-css"&gt;@media(max-width:900px){.main-banner{position:relative}} present on 93/93 PMH static pages. Live: GC 320x568 header 173px sticky + (...)
- Impact: On GC every scroll position on a phone shows 3-4 rows of 9px nav chips pinned at the top and Call/Text/Email pinned at the bottom; reading area is 58-74% of the screen. On the SPA home the same 161px is fixed. Clarity homepage avg scroll depth 21% and 94 (...)
- Fix: Until mob-01 ships: civilian-site/index.html (and the other 101 pages via the shared style block): add @media(max-width:900px){.main-banner{position:relative}} exactly as the PMH ddfix-css does. SPA: in src/App.jsx:2795 style block add @media(max-width:900px){.spa-nav{position:relative!important}.hero-section{padding-top:0!important}.hero-bg-image,.hero-gradient-h,.hero-gradient-v{top:0!important}} and drop the paddingTop:180 assumption on mobile. After mob-01 ships, a 56px sticky bar is acceptable (keep sticky, (...)
- Verifier: Numbers match within 1px (GC 320 is 174 not 173). Fix works: an !important rule in the App &lt;style&gt; overrides the inline position. Add one item: SPA subpages use PageWrapper paddingTop 200 (src/App.jsx:400) and the home hero paddingTop 150/180 (:421, (...)

#### [mob-03] Horizontal overflow at 320px on both static templates and clipped cards on the SPA: phone/email column runs to x=352, GC mil-band button to x=360, SPA minmax(300px) grids to x=333-352, 3 PMH pages have unwrapped tables

- meta: BOTH | high | effort low | confirmed
- Evidence: Live 320px: GC documentElement.scrollWidth 360 vs clientWidth 320; overflowing elements .banner-contact (x233 w118 right 352), .banner-email (9px font, right 352), a.btn-p 'Visit PensacolaMilitaryHousing.com' (w317, right 360; civilian-site/index.html:373, 2 pages). PMH static /first-time-military-homebuyer: scrollWidth 352, .banner-contact right 352, &lt;table&gt; 'Scenario/Best Loan/Why' right 325 (public/first-time-military-homebuyer.html:325 bare &lt;table&gt;, CSS :110 table{...overflow:hidden} with no (...)
- Impact: iPhone SE/8-class and small Android (320-360px CSS width) users get a page that pans sideways (GC, PMH static) or has card text cut off on the right (SPA home: 'PCS Relocation', 'VA Home Loans', 'Sell Your Home', story section). Google's mobile usability (...)
- Fix: 1) Static templates, both sites, inside the existing @media(max-width:480px) block: .banner-email{display:none} (the sticky bar already carries Email) and .banner-row{gap:8px;padding:8px 10px 0} ; or ship mob-01 which removes the second logo. 2) civilian-site/index.html:373 and the other page: shorten the label to 'Visit the Military & PCS site' or add .mil-band .btn-p{white-space:normal;overflow-wrap:anywhere;max-width:100%}. 3) PMH template public/*: add (...)
- Verifier: Core is fully reproduced. Two corrections to the fix text: (1) src/App.jsx:1224 already wraps the :1225 table in a div with overflowX:'auto', so drop item 4's table clause; (2) the MilitaryStory padding citations are App.jsx:641 ('100px 32px') and :667 (...)

#### [mob-04] Homepage hero CTAs on phones inherit line-height:0 from .hero-portrait and render 28-30px tall, floating over the portrait below the fold

- meta: GC | high | effort low | confirmed
- Evidence: Code: civilian-site/index.html:124 .hero-portrait{...line-height:0} ; :190 .hero .btn-row{display:none} ; :191 .hero-cta-overlay{display:flex;...position:absolute;...bottom:16px} is a child of .hero-portrait (markup line 269) so it inherits line-height 0; .btn-p has padding 14px 26px and no explicit line-height. Live: getComputedStyle(.hero-cta-overlay).lineHeight = '0px', .btn-p lineHeight '0px', button height 28px (btn-g 30px) at both 320 and 375; first CTA top at y=909 on a 375x812 viewport (portrait begins at (...)
- Impact: The two primary conversion buttons on the civilian homepage ('Start Your Home Search', "What's My Home Worth?") are the smallest tap targets in the hero on mobile (28px vs 48px guideline), sit on a gradient over a photo, and are not in the first screen. (...)
- Fix: civilian-site/index.html inside @media(max-width:900px): .hero-cta-overlay{line-height:1.2} (or .hero-cta-overlay .btn-p,.hero-cta-overlay .btn-g{line-height:1.2;min-height:48px}). Better: un-hide .hero .btn-row on mobile (remove :190, set .hero .btn-row{flex-direction:column;align-items:stretch;margin:0 0 20px}) so both CTAs appear directly under the lead paragraph and before the 365px-tall portrait, and lazy-load the portrait (loading="lazy" on the img at :269) since it is now below the fold on phones.
- Verifier: Exactly as described. The 48px desktop buttons become 28-30px tap targets 1.1-1.6 screens down on phones. Fix is correct; the lazy-load suggestion is compatible with the existing &lt;picture&gt; at :269 (drop fetchpriority=high on the img if it moves below (...)

#### [mob-05] Inquiry modal on phones: 14px inputs (below Safari's 16px no-zoom threshold), 80px top padding, 255px-wide fields at 320px, 28x40px close button

- meta: BOTH | medium | effort low | narrowed
- Evidence: Code: civilian-site/index.html:171 .imodal-overlay{...padding:80px 20px 40px;overflow-y:auto} :173 .imodal{padding:40px 32px 32px;width:100%;max-width:560px} :174 .imodal-close{...font-size:28px;padding:6px} :179 .imodal input,.imodal select,.imodal textarea{...font-size:14px}; identical in PMH template public/first-time-military-homebuyer.html:185-193; SPA contact inputs src/App.jsx:902 fontSize 14 and calculator inputStyle :1484/:1752/:2099 fontSize 14. No @media rule touches .imodal on either site. Live GC (...)
- Impact: Safari iOS zooms the page when focusing any input under 16px, which throws the fixed overlay off-center and often hides the Submit button; users then pinch-out to finish. A 28px-wide close control next to the viewport edge is a mis-tap risk; 80px of top (...)
- Fix: Both static templates + SPA style block: @media(max-width:640px){.imodal-overlay{padding:16px 12px calc(24px + env(safe-area-inset-bottom));align-items:flex-start}.imodal{padding:44px 18px 22px;border-radius:12px}.imodal-close{width:44px;height:44px;top:6px;right:6px;padding:0;display:flex;align-items:center;justify-content:center}.imodal input,.imodal select,.imodal textarea{font-size:16px;padding:12px 14px}.imodal .isubmit{width:100%;min-height:48px}} ; SPA: change fontSize 14 to 16 at src/App.jsx:902-924 and (...)
- Verifier: All measurements reproduce. The claim should state that the zoom effect is inferred from Safari's documented threshold rather than observed; the 14px value and the absent maximum-scale make it applicable. Medium severity stands. Fix is correct and safe (16px (...)

#### [mob-06] Sticky Call/Text/Email bar has no body padding compensation: covers the last 64px of every page (footer family line, disclaimer) and the third hero CTA on the SPA home

- meta: BOTH | medium | effort low | narrowed
- Evidence: Code: civilian-site/index.html:163 .sticky-mobile-cta{position:fixed;left:12px;right:12px;bottom:12px;z-index:9999} and PMH template :167 (identical), SPA src/App.jsx:2813; no body/main/footer padding-bottom rule exists in any of the three (grep for padding-bottom on body/main/footer = 0 matches). Live: GC 320px scrolled to bottom, sticky bar top y=491, footer disclaimer &lt;p&gt; (y412 h179) overlapped; body paddingBottom '0px'; PMH static 375px body paddingBottom '0px', bar at y=748 h52. Evidence file: on the (...)
- Impact: The footer family cross-link line (standing rule) and disclaimer are unreachable on phones without the bar covering them; on the SPA home the bar competes with the hero CTA. Clarity captured 0 tel:/sms: clicks on mobile across the top 15 PMH pages in 30 days (...)
- Fix: All three style sources inside the existing @media(max-width:800px) block: body{padding-bottom:calc(76px + env(safe-area-inset-bottom))} .sticky-mobile-cta{bottom:calc(12px + env(safe-area-inset-bottom))}; at &lt;=480 add .banner-email{display:none}. No new GA4 wiring is needed (phone_call_click/email_click/sms events already fire from the global click listener at PMH template line 51 and GC index line 58); optionally add Clarity Smart Events for tel:/sms: on PMH.
- Verifier: Keep the padding-bottom and safe-area fix; delete the 'add GA4 events on the three bar links' part of the fix because tel/mailto/sms clicks are already tracked sitewide. Clarity Smart Events for tel:/sms: remain optional. Header email hide at &lt;=480 is (...)

#### [mob-07] Static dropdowns are hover/focus-within only with no aria-expanded, and 2 of 5 static triggers plus 3 of 5 SPA triggers navigate on tap, so sub-menus are inconsistent on touch (OS-specific behavior inferred from documented Safari/Chrome semantics, not device-tested)

- meta: BOTH | medium | effort low | narrowed
- Evidence: Static (93 PMH pages): public/first-time-military-homebuyer.html:92 .dropdown:hover .dropdown-menu,.dropdown:focus-within .dropdown-menu{display:block}; buttons 'PCS Guide' and 'VA Loan Guide' carry onclick="location.href=..." on 93/93 pages, 'Bases/Communities/Resources' have no handler; no aria-expanded on any (live: ddHasAriaExpanded=false). Live 320px: programmatic focus opens the Resources menu as a 296px-wide panel with 43px link rows (ddfix-css :254-258 works well once open). iOS Safari does not focus (...)
- Impact: On PMH phones the 19-item Communities menu, 6-item PCS menu and VA sub-guides are either one hover-emulation away or unreachable from the nav; behavior differs by OS, which reads as a broken menu. Screen-reader users get aria-haspopup without state on static (...)
- Fix: Static template: replace the hover rule with @media(hover:hover){.dropdown:hover .dropdown-menu{display:block}} and add .dropdown.open .dropdown-menu{display:block}; give every dropdown button aria-expanded="false" and a 10-line script: document.querySelectorAll('.dropdown&gt;button').forEach(b=&gt;b.addEventListener('click',e=&gt;{if(matchMedia('(hover:none)').matches||!b.onclick){e.preventDefault();const d=b.parentElement,o=d.classList.toggle('open');b.setAttribute('aria-expanded',o);}})) and close others on (...)
- Verifier: The structural facts and the Android-Chrome consequence (tap on PCS Guide/VA Loan Guide navigates immediately) are verified from code. The iOS-specific narrative is consistent with documented Safari behavior but should be labeled as such. Fix is sound; (...)

#### [mob-08] Secondary tap targets under 44px: footer links 16px (GC and PMH static) / 26px (SPA), header phone 16-23px, search button 32x26 / 79x26, chips and designation pills 32-35px

- meta: BOTH | medium | effort low | narrowed
- Evidence: Live: GC footer links height 17px (civilian-site/index.html:111 footer font-size .85rem, :113 footer a with no padding); PMH footer links 26px (evidence file + :129 footer a{color}); banner phone 23px tall on static (civilian :87 font 20px, 13px at &lt;=480), 16px tall on SPA (App.jsx:2799 font-size 15px); .banner-search 32x26 at 320 (public/*:515-518 padding 5px 8px, label hidden) and 79x26 on SPA (App.jsx:313); .chips a 8px 16px padding = ~35px (civilian :148); designation chips 32px (evidence). Totals under (...)
- Impact: Footer is where the cross-site family line, reviews, and community links live; 17px rows with 0 spacing are the least tappable elements on the site. WCAG 2.5.8 (24px minimum) is met by most, but the 44-48px comfortable target is missed by 70-80% of controls.
- Fix: One CSS patch appended to both static templates and the SPA style block: @media(max-width:900px){footer a{display:inline-block;padding:10px 6px;min-height:44px;line-height:24px}.chips a{min-height:44px;display:inline-flex;align-items:center}.banner-phone{display:inline-flex;align-items:center;min-height:44px;padding:0 8px}.banner-search,.spa-nav button[aria-label="Search the site"]{min-width:44px;min-height:44px;justify-content:center}.banner-tabs&gt;a,.banner-tabs .dropdown&gt;button{min-height:44px;padding:10px (...)
- Verifier: Everything reproduces except the PMH static footer height, which is 16px (worse than claimed); 26px belongs to the SPA. Fix CSS is correct and must be placed after or with more specificity than the @480 !important shrink (or delete that block). Medium is (...)

#### [mob-09] SPA scroll-margin-top (100px) is smaller than the 161px fixed phone nav, but no page links to the affected /# anchors and the hero is not overlapped

- meta: PMH | low | effort low | narrowed
- Evidence: Code: src/App.jsx:2792 [id]{scroll-margin-top:100px}; :2805 @media(max-width:900px) .hero-section{padding-top:150px!important} ; :421 hero paddingTop 180 (desktop). Live SPA 375: nav height 161px fixed; .hero-content top y=150 (11px under the nav); hash routes #calculator / #bah-calculator / #contact / #services map to ids that scroll into view with 100px margin, i.e. 61px under the fixed bar. The route-hash handler at App.jsx ~2760-2783 uses scrollIntoView so the CSS margin is what positions the target.
- Impact: Deep links such as /#bah-calculator (linked from BAH pages and used in 'Free PCS Checklist' CTAs) land with the section heading hidden behind the nav on phones; the hero eyebrow is partly covered until the first scroll.
- Fix: src/App.jsx:2795 style block: @media(max-width:900px){[id]{scroll-margin-top:170px}} until mob-02/mob-01 make the nav relative or 56px tall (then 64px). No change to hero padding is needed for overlap; hero padding only shrinks once mob-02 lands.
- Verifier: The measured facts are right but both stated impacts are wrong: no BAH page or checklist CTA links to these hashes, and the eyebrow is not under the nav. Residual is a theoretical offset on unused anchors. Downgrade to low and fold the one-line CSS into (...)

#### [mob-10] BAH tables are handled well at 375px but scroll silently at 320px with 10px header type and no scroll affordance or sticky first column

- meta: PMH | low | effort low | confirmed
- Evidence: Code: public/bah-rates.html .bah-wrap{border:1px solid var(--hair);border-radius:10px;overflow:hidden;overflow-x:auto}; .bah-table{width:100%;min-width:500px;font-size:14px} then phone overrides .bah-table{font-size:12px!important;min-width:320px!important} .bah-table thead th{font-size:10px!important;padding:8px 8px!important}; 6 tables x 3 columns (Pay Grade / With Dependents / Without Dependents). Same .bah-wrap wraps tables on 51 of 54 table-bearing static pages. At 375px content width 347px &gt;= 320px (...)
- Impact: Low: the primary phone widths are fine. On 320px devices the third column (Without Dependents) is cut with no hint it scrolls; 10px thead text is below the legibility floor.
- Fix: public/bah-rates.html (and the shared .bah-wrap rule on the other 50 pages): @media(max-width:480px){.bah-table{min-width:0!important}.bah-table thead th{font-size:11px!important}.bah-table th:first-child,.bah-table td:first-child{position:sticky;left:0;background:var(--panel);z-index:1}.bah-wrap{background:linear-gradient(90deg,transparent 85%,rgba(0,0,0,.35));scroll-snap-type:x proximity}} plus a one-line caption 'Swipe for more' visible only when .bah-wrap scrollWidth &gt; clientWidth.
- Verifier: Accurate and correctly rated low. Fix is implementable: position:sticky on the first column works inside an overflow-x:auto wrapper; the gradient scroll hint needs to be on a wrapper pseudo-element rather than a background on .bah-wrap itself (a background (...)

Verifier-noted items outside the numbered list: PMH (SPA /pcs-guide and /about): plain-text items that phone users tap as if they were links. Clarity mobile-only dead clicks last 30 days: 'Hurlburt Field' 6 and 'Air Force' 3 on /pcs-guide, 'Forbes Global Properties' (...) | BOTH: inquiry-modal and SPA contact inputs carry no autocomplete attributes, so phones cannot one-tap fill name/email/phone. grep 'autocomplete=' = 1 hit in civilian-site/index.html and 1 in (...) | GC homepage: the 130KB courthouse portrait is fetched eagerly with fetchpriority="high" (civilian-site/index.html:269, &lt;img fetchpriority="high" src="/images/gregg-courthouse.jpg" width=928 height=1152&gt;) although (...) | PMH static pages (93/93) have no &lt;meta name="theme-color"&gt; and no apple-touch-icon while both civilian-site/index.html and the SPA index.html carry both (grep counts: PMH static theme-color 1/93 which is a (...) | PMH SPA header logos are lazy-loaded inside the always-visible fixed nav: src/App.jsx:233 and :236 use &lt;Pic loading="lazy" src={IMG.logoLrr|logo08}&gt; (Pic defaults to lazy at :170), so the two images in the first (...)

### Generative Engine Optimization / AI readiness

11 findings (3 high, 5 medium, 3 low). Strengths noted: AI crawler access is genuinely open and live-verified: both robots.txt files name 20+ AI crawlers (GPTBot, OAI-SearchBot, ClaudeBot, Claude-SearchBot, PerplexityBot, Perplexity-User, Google-Extended, Applebot-Extended, Meta-ExternalAgent, CCBot, Bytespider, Amazonbot), the live files match the repo byte-for-byte with no Cloudflare managed injection, and a user-agent smoke test on 2026-09-02 returned HTTP 200 for all 8 AI UAs on both domains. | PMH llms.txt (42 KB) and llms-full.txt (46 KB), refreshed 2026-09-01, are top-tier: per-base and per-community data blocks, the 2026 BAH quick reference, verbatim FAQ prose, an explicit attribution license, the Wikidata author entity (Q140446886), and a footer link from 100 of 101 static pages plus robots.txt pointers. | Author-entity discipline on the military site: 94 static pages carry a Person node with Wikidata and greggcostin.com sameAs, a visible author card with credentials (Retired USAF CSO, MRP, ABR, RENE) and a 'Reviewed & updated' stamp, FAQPage on 91 pages with self-contained answers (e.g. 'Pensacola MHA (FL064) 2026 monthly BAH with dependents ranges from $1,794 to $2,631'), and robots meta max-snippet:-1 / max-image-preview:large on every page so engines are never snippet-throttled. | The site is already in AI grounding link sets for its core queries: WebSearch 2026-09-02 placed /bases/nas-pensacola #2 and /faq #5 for 'best neighborhoods near NAS Pensacola', and /faq #5 plus /bah-rates #7 for 'BAH NAS Pensacola 2026 E-5 with dependents'; Copilot cites 31 PMH pages 351 times per 90 days. | Per-route SPA shells are correctly built (unique title, description, self-canonical, hreflang, OG image, WebPage + BreadcrumbList JSON-LD, anti-drift assertions in scripts/postbuild-spa-routes.mjs), IndexNow is wired on both sites (key files present, scripts/submit-indexnow.mjs), and the greggcostin.pages.dev twin is correctly noindexed via _headers. | /va-loan-guide is a model answer page: the first paragraph is a dated, self-contained definition with the 2.15% / 3.30% funding fee figures, the $832,750 Tier 1 county limit appears in the opening section, and H2s are phrased as the questions people ask.

Auditor notes: Data limits: no Lighthouse/CrUX numbers were available or used. WebSearch is a Google-style raw result set, not Perplexity/ChatGPT/Copilot output; I used it only for presence/absence in the link set and to observe which pages' answer shape the tool's own synthesis quoted. The AI user-agent test spoofs UAs, so a 200 proves the UA-based Cloudflare AI block is off, not that verified-bot IP rules are configured (none appear to be). Hydrated word counts for SPA routes were captured from the live page in a browser on 2026-09-02; the ~1,300-word figure for /pcs-guide is an estimate from the captured text, the tables and FAQs are exact. Judgment calls: geo-01 and geo-03 are the two findings that (...)

#### [geo-01] SPA routes (/pcs-guide, /communities, /about, /mortgage-calculators) are near-empty to AI crawlers that do not execute JavaScript

- meta: PMH | high | effort medium | confirmed
- Evidence: Live curl 2026-09-02 (no JS): https://pensacolamilitaryhousing.com/pcs-guide body = 164 words, 2 H2s, 16 links; /communities = 108 words; /about = 115 words; /mortgage-calculators = 120 words (homepage 554, /blog 1,355). Hydrated /pcs-guide captured in a browser the same day contains the 7-installation table, the 8-row neighborhood comparison table, the full FL064 2026 BAH table (24 rows incl. E-5 $1,863 / $1,644), the 90/60/30-day checklist, VA basics, Florida benefits and 6 FAQs (roughly 1,300 words). (...)
- Impact: GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot and Meta-ExternalAgent fetch raw HTML and do not render JavaScript, so the owner-designated canonical PCS destination (/pcs-guide, Clarity #3 page, 48% scroll) and the communities hub cannot be cited for BAH, (...)
- Fix: Same as proposed, data-extraction variant only: (1) create src/pcsGuideData.js exporting INSTALLATIONS, NEIGHBORHOOD_ROWS, BAH_DATA, PCS_FAQS (the 6 q/a strings at App.jsx 1044-1049), import from both src/App.jsx and scripts/postbuild-spa-routes.mjs; (2) in makeFallback render &lt;table&gt; rows, a &lt;details&gt; per FAQ and a FAQPage JSON-LD block; do the same for /communities (COMMUNITIES array) and /about (bio); (3) assert #root text &gt; 800 words per shell in postbuild; (4) add src/routeMeta.js and the new (...)
- Verifier: Reproduced exactly. Fix check: the data-extraction path is the right one for this codebase; src/routeMeta.js already follows the 'plain ESM data, no JSX, imports cleanly in node' pattern the postbuild script needs, so src/pcsGuideData.js fits. Avoid the (...)

#### [geo-02] pensacolamilitaryhousing.pages.dev is a fully indexable and AI-crawlable duplicate host (GC twin is correctly noindexed)

- meta: PMH | high | effort low | confirmed
- Evidence: Live curl -I https://pensacolamilitaryhousing.pages.dev/ 2026-09-02: HTTP 200, headers HSTS/nosniff/X-Frame-Options/Referrer-Policy/Permissions-Policy, NO x-robots-tag. https://pensacolamilitaryhousing.pages.dev/robots.txt serves the same allow-all file including every AI group (ETag dd7d693483501dde4c9616a8cd0b0b15, identical to apex). By contrast https://greggcostin.pages.dev/ returns x-robots-tag: noindex because civilian-site/_headers lines 8-10 declare https://greggcostin.pages.dev/* X-Robots-Tag: noindex; (...)
- Impact: AI crawlers largely ignore rel=canonical and the JS location.replace snippet, so every one of the ~101 pages can be ingested and cited under the pages.dev host, splitting entity and citation signals for the exact pages that lead Copilot citations (...)
- Fix: Append to public/_headers (mirrors the civilian file): # De-index the *.pages.dev twin (canonical + JS redirect alone do not stop crawlers) https://pensacolamilitaryhousing.pages.dev/* X-Robots-Tag: noindex Then redeploy and verify: curl -sI https://pensacolamilitaryhousing.pages.dev/bah-rates | grep -i x-robots-tag. Optional belt-and-braces: a Cloudflare Bulk Redirect rule 301 pensacolamilitaryhousing.pages.dev/* -&gt; https://pensacolamilitaryhousing.com/$1 (preserve path).
- Verifier: Fix is correct and proven: the identical absolute-host pattern in civilian-site/_headers is what produces the header on greggcostin.pages.dev today. Requires a redeploy of the military site (npm run build + Pages deploy) to take effect.

#### [geo-03] Answer pages put the quotable figure 600-1,700 words below the H1 (behind CTA strip, author card, calculator); the quotable sentence exists but is not first

- meta: BOTH | high | effort medium | narrowed
- Evidence: PMH /bah-rates (live 2026-09-02): first 150 words = CTA strip + author card + calculator form; 610 words precede the first table; the first per-grade sentence is public/bah-rates.html line 488 ('an E-5 with dependents draws $1,863 in FL064 versus $2,433 in FL023'); the FAQ 'How much is BAH for Pensacola in 2026?' answers only the range $1,794-$2,631. WebSearch 2026-09-02 'BAH NAS Pensacola 2026 E-5 with dependents': PMH /faq at position 5 and /bah-rates at 7, while the synthesized $1,863 answer was drawn from (...)
- Impact: AI engines extract the first self-contained, dated statement that matches the question; pages that make the reader (or parser) scroll past 600+ words of chrome lose the citation to thinner competitor pages even when they outrank them in the raw link set. (...)
- Fix: Add a .quick-answer block (2-4 dated declarative sentences with the figure and 'Gregg Costin, Realtor, Levin Rinke Realty' attribution) immediately after the H1 lead, before the CTA strip. Add it to the templates in scripts/page-factory.mjs, scripts/blog-factory.mjs and scripts/civilian-blog-factory.mjs for new pages, then hand-edit the 10 Copilot-leading PMH pages and the 3 live GC posts (preview one page first per the standing rule). On nas-pensacola move 'Best Off-Base Neighborhoods' to H2 #1 with a ranked (...)
- Verifier: The on-page structure claims are all real; the competitor-citation half of the evidence is finder-reported only, so treat the impact statement as plausible rather than measured. One fix correction: scripts/page-factory.mjs only clones the template for NEW (...)

#### [geo-04] Freshness signals contradict each other: sitemap lastmod is bulk-stamped 2026-08-23 while 60 pages declare dateModified 2026-07-06 and show 'Reviewed & updated July 2026'

- meta: PMH | medium | effort low | confirmed
- Evidence: public/sitemap.xml lastmod distribution: 97 x 2026-08-23, 4 x 2026-08-24. grep dateModified across public/**/*.html: 60 x 2026-07-06, 25 x 2026-08-12, 11 x 2026-08-24. /bah-rates, /va-loan-guide, /faq, /bases/nas-pensacola, /communities/gulf-breeze, /pensacola-flood-zones-homebuyers and /va-disability-property-tax-florida each show sitemap lastmod 2026-08-23 vs "dateModified":"2026-07-06" vs visible 'Reviewed & updated · July 2026'. scripts/bump-dates.mjs step 1 rewrites EVERY &lt;lastmod&gt; to today's date on (...)
- Impact: Google documents that consistently inaccurate lastmod is ignored, so the one honest signal (a real content pass) will also be discounted. Perplexity and ChatGPT Search surface visible dates; the top Copilot-cited pages now read as two months old in (...)
- Fix: In scripts/bump-dates.mjs step 1: for each &lt;url&gt;, map &lt;loc&gt; to its public/*.html file, read its "dateModified" (fallback datePublished), and write that as &lt;lastmod&gt;; do not use git in the Pages build (shallow clone). Step 2: only bump the llms 'Last updated' header when --html --changed is passed. Add a postbuild assertion that no sitemap lastmod exceeds its page's dateModified. Run the opt-in node scripts/bump-dates.mjs &lt;date&gt; --html --changed only after a real verification pass of the (...)
- Verifier: Live is worse than the repo snapshot: every URL now says lastmod 2026-09-01 while 60 pages say dateModified 2026-07-06. Fix is sound; git log -1 --format=%cs -- &lt;file&gt; works in Git Bash and in the Cloudflare Pages build only if the build clones with (...)

#### [geo-05] greggcostin.com llms-full.txt covers 6 of 102 pages, is undiscoverable (no robots.txt or footer reference), and states 54 Google reviews while PMH states 55

- meta: BOTH | medium | effort medium | narrowed
- Evidence: Live https://greggcostin.com/llms-full.txt (22,265 bytes, header 'Last updated: 2026-08-24') contains exactly 6 'URL:' entries: /, /buy, /sell, /reviews, /team, /contact; nothing for /faq (22 answers), /neighborhoods, /schools (82 pages), /resources/* (4 guides), /blog (3 live posts). Live llms.txt (3,338 bytes) states '54 Google' reviews; public/llms.txt line 45 states '55 five-star Google reviews' and line 340 states '79 Google/Zillow reviews' (55+25=80), and PMH /reviews moved to 55 on 2026-08-31. Repo (...)
- Impact: The civilian brand's AI-facing description of itself omits the pages most likely to be cited (FAQ, schools, resources, blog) and gives engines two different review counts for one entity, which is exactly the kind of inconsistency that lowers confidence when (...)
- Fix: (1) scripts/civilian-llms.mjs generating civilian-site/llms-full.txt from every civilian HTML file (## title, URL, Updated from dateModified, first ~300 words of &lt;main&gt;, FAQ Q/A verbatim), wired into the deploy checklist before scripts/audit-civilian.mjs. (2) content/reviews.json {google:55, zillow:25, asOf:'2026-08-31'} read by both factories, both llms generators and the GC homepage trust band; fix public/llms.txt line 340 to 80. (3) civilian-site/robots.txt: add '# AI content maps' comment lines for (...)
- Verifier: Core is real: llms-full covers 6 of 102 pages, no discoverability from robots or footer, and the two sites disagree on review count. Drop the 404/draft sub-claim and fix (4) as written; a build-output check is unnecessary because the civilian site has no (...)

#### [geo-06] Civilian blog posts reference the author Person by @id only; the Person node is defined on just 2 of 102 pages, so per-page parsers cannot resolve author credentials

- meta: GC | medium | effort low | confirmed
- Evidence: All 4 civilian-site/blog/*.html carry "author":{"@id":"https://greggcostin.com/#gregg"} (e.g. closing-costs-florida-buyers.html Article block). grep '"@type":"Person","@id":"https://greggcostin.com/#gregg"' matches only civilian-site/index.html and civilian-site/team.html; 0 of 4 blog posts define a Person node; only 2 civilian pages reference Wikidata Q140446886 vs 94 PMH pages. Visible top byline on the post is 'August 31, 2026 · The Costin Team Blog'; 'Gregg Costin, Realtor · The Costin Team at Levin Rinke (...)
- Impact: Google and AI engines evaluate author entity per URL; a dangling @id resolves to nothing on the page being cited, so the closing-costs, property-tax and mortgage-rate posts (the civilian site's most citable content) carry no machine-readable author name, (...)
- Fix: In scripts/civilian-blog-factory.mjs include a compact Person node in every post's @graph: {"@type":"Person","@id":"https://greggcostin.com/#gregg","name":"Gregg Costin","jobTitle":"Realtor","honorificSuffix":"ABR, SRS, RENE","url":"https://greggcostin.com/team","worksFor":{"@id":"https://greggcostin.com/#team"},"sameAs":["https://www.wikidata.org/wiki/Q140446886","https://pensacolamilitaryhousing.com/about","&lt;Google Business Profile URL&gt;","&lt;Zillow profile URL&gt;"]} and render a visible top byline: 'By (...)
- Verifier: Fix is correct. Keep honorificSuffix in sync with team.html (ABR, SRS, RENE per the live llms.txt) and reuse the sameAs list from team.html verbatim; add the audit-civilian check so a dangling @id fails the deploy gate.

#### [geo-08] Soft 404: every unknown path returns HTTP 200 with the homepage title, body and canonical '/'

- meta: PMH | medium | effort low | confirmed
- Evidence: Live 2026-09-02: curl -I https://pensacolamilitaryhousing.com/this-page-does-not-exist-audit -&gt; HTTP 200, cf-cache-status DYNAMIC; body &lt;title&gt; 'Pensacola Military Housing | Gregg Costin, Realtor® | PCS & VA Loan' and &lt;link rel="canonical" href="https://pensacolamilitaryhousing.com/"&gt;; hydrated in a browser it renders the full homepage ('Pensacola's #1 military relocation REALTOR®'). src/App.jsx resolvePageFromPath (line 2702) has no not-found branch; public/_redirects ends with the /* /index.html (...)
- Impact: AI engines frequently reconstruct or hallucinate URLs (/bah-rates-2026, /nas-pensacola-housing) and legacy links persist in third-party citations; each such fetch returns a 'valid' 200 page, so crawlers store duplicate homepage copies under wrong URLs, (...)
- Fix: (1) Create public/404.html (dark theme, noindex meta, links to /, /pcs-guide, /bah-rates, /va-loan-guide, /faq) - this is the switch that turns off Pages SPA mode. (2) Remove '/* /index.html 200' from public/_redirects (shells for the 7 SPA routes already exist in dist/). (3) App.jsx: resolvePageFromPath returns 'notfound' for unknown paths and a NotFound component sets document.title and a noindex meta for client-side navigation. Verify: curl -sI https://pensacolamilitaryhousing.com/zzz | head -1 -&gt; 404.
- Verifier: Fix needs one correction: Cloudflare Pages serves index.html with HTTP 200 for every unmatched path whenever the project has no root 404.html (its built-in SPA mode), so deleting the '/* /index.html 200' line alone changes nothing. public/404.html is (...)

#### [geo-11] No civilian local-intent answer pages: 'best realtor Gulf Breeze' (and Pace, Navarre, Milton, Cantonment, Perdido Key) has no greggcostin.com page; the neighborhoods hub deep-links every area to a military-framed PMH page

- meta: GC | medium | effort medium | confirmed
- Evidence: civilian-site/ has 13 top-level pages (index, buy, sell, search, neighborhoods, schools, resources, blog, reviews, faq, team, contact, 404) plus 82 school reports and 4 guides; no city or neighborhood landing page. civilian-site/neighborhoods.html Gulf Breeze card links only to https://pensacolamilitaryhousing.com/communities/gulf-breeze, whose H1 is 'Gulf Breeze, FL: The #1 Choice for NAS Pensacola Military Families'. civilian-site/index.html RealEstateAgent areaServed lists City entities Pensacola, Gulf Breeze, (...)
- Impact: When a civilian buyer or seller asks an assistant for a realtor in Gulf Breeze or Pace, there is no greggcostin.com page to ground on; the engine either cites directories or routes the person to a PCS/BAH-framed page that reads as the wrong audience. The (...)
- Fix: Six civilian service-area pages (/gulf-breeze-realtor, /pace-realtor, /navarre-realtor, /milton-realtor, /cantonment-realtor, /perdido-key-realtor) cloned from an existing civilian page: H1 'Gulf Breeze Realtor: Gregg Costin, The Costin Team', quick-answer block sourced from reviews.json, 3 named reviews from that city, dated market line refreshed by market-engine, FAQ linking the matching /schools reports and /resources guides, JSON-LD Service with areaServed City + provider @id https://greggcostin.com/#team, (...)
- Verifier: Reproduced. Fix caveats: civilian pages are not built by scripts/page-factory.mjs (that is the PMH factory); clone an existing civilian page and pass scripts/audit-civilian.mjs. Do not print 'N closed transactions in Gulf Breeze' unless the number is (...)

#### [geo-07] robots.txt on both sites is correct but 28-group duplicated; Crawl-delay lands only on unnamed bots and newer AI fetchers (Meta-ExternalFetcher, DuckAssistBot, MistralAI-User) are not named

- meta: BOTH | low | effort low | narrowed
- Evidence: Live 2026-09-02: https://pensacolamilitaryhousing.com/robots.txt (ETag dd7d693483501dde4c9616a8cd0b0b15) and https://greggcostin.com/robots.txt (1,756 bytes) are byte-identical to public/robots.txt and civilian-site/robots.txt; no Cloudflare managed block injected; no Content-Signal line and no Content-Signal response header on /bah-rates or /faq. grep 'Meta-ExternalFetcher|DuckAssistBot|MistralAI|Content-Signal' = 0 in both files; also absent: Google-CloudVertexBot, PetalBot. Crawl-delay: 1 is in the User-agent: (...)
- Impact: Functionally the files already do what the owner wants; the gaps are (a) no machine-readable statement of intent for engines adopting the Content Signals convention, (b) Meta AI, DuckDuckGo AI and Mistral fetchers fall into the generic group with a crawl (...)
- Fix: As proposed (grouped User-agent lists, /downloads/ disallow repeated per group, Crawl-delay removed, Content-Signal optional). After deploy re-run the UA smoke test and diff live vs repo.
- Verifier: Facts hold but this is housekeeping, not a citation blocker: every AI fetcher that matters already gets 200 and the generic group still allows /. Content-Signal is a Cloudflare-led convention with limited engine adoption; treat it as optional. Keep severity (...)

#### [geo-09] Speakable on 9 PMH guide pages targets headings and FAQ questions rather than answers; '.facts strong' resolves on only 2 of them (faq.html and index.html already use better selectors)

- meta: PMH | low | effort low | narrowed
- Evidence: 9 pages (bah-rates, bah-to-mortgage-guide, disabled-veteran-benefits-florida, florida-home-insurance-military, pcs-checklist, va-coe-guide, va-funding-fee-2026, va-irrrl-guide, va-loan-guide) carry "speakable":{"@type":"SpeakableSpecification","cssSelector":["h1","h2","h3","summary",".lead",".facts strong"]} (public/bah-rates.html line 261); grep shows a .facts element on only bah-rates and va-loan-guide (0 on the other 7); 'summary' matches FAQ question text only, never the answers; index.html and all 102 GC (...)
- Impact: Harmless but misleading: it signals answer-ready sections that resolve to headings and FAQ questions rather than answers, and it invites effort (adding it to GC) that would not move any AI citation metric.
- Fix: Do not add speakable to greggcostin.com. On the 9 guide pages change cssSelector to ['.quick-answer','details &gt; p'] once the quick-answer block exists (or drop '.facts strong' where no .facts element exists); leave faq.html as is.
- Verifier: Only the '.facts strong' selector fails on 7 pages; the other five selectors resolve, so 'selectors that do not exist on 7 of 9 pages' overstates it. The substantive point (selectors target headings and FAQ questions, not answers) stands and is low impact.

#### [geo-12] 'Homes for Sale Near Hurlburt Field' (and the same H2 on other base pages) contains no listings, inventory data or IDX deep link, so the transactional query cannot be answered from the page

- meta: PMH | low | effort low | confirmed
- Evidence: public/bases/hurlburt-field.html section under H2 'Homes for Sale Near Hurlburt Field' contains a ranked town list (Navarre, Mary Esther, Niceville/Bluewater Bay, FWB/Shalimar, Crestview) and 'Send me your rank, squadron assignment ... and I'll return a filtered MLS shortlist'; the only links in the section are /communities/navarre, /communities/fort-walton-beach, /communities/niceville; no MLS/IDX/RealScout link, no listing count, no date. The identical pattern exists on /bases/nas-pensacola ('Homes for Sale (...)
- Impact: 'homes for sale near Hurlburt Field' is a listings-intent query; engines answer it with Zillow/Redfin/Realtor.com counts and prices and will not cite a section that only names towns. The H2 promises what the section does not deliver, which also reads as a (...)
- Fix: Now: under each 'Homes for Sale Near &lt;base&gt;' H2 add a descriptive deep link to the greggc.levinrinkerealty.com /results/ saved search for that base radius (the template that attributes leads to Gregg) plus links to the named community pages. Later: add the dated inventory line from content/inventory.json once the market-engine has an MLS/RealScout export.
- Verifier: Even thinner than described (no links at all on Hurlburt). Fix depends on a data source the market-engine does not yet have (an MLS or RealScout inventory export); ship part (b) immediately and part (a) when the export exists.

Verifier-noted items outside the numbered list: BOTH, live-verified: Cloudflare Email Address Obfuscation is ON for both zones, so any fetcher that does not run JS sees the visible email as '[email protected]'. curl -A GPTBot (...) | PMH, live-verified: the SPA homepage still emits the invalid schema type 'RealEstateOrganization' 3 times (curl https://pensacolamilitaryhousing.com/ | grep -c RealEstateOrganization = 3; index.html = 3). The July 2026 (...) | PMH, code + live-verified: em dashes in src/routeMeta.js lines 31, 43, 45 and 52 ship into the live meta description and no-JS body text of /pcs-guide, /about and /communities (live /pcs-guide description: '...PCS (...) | PMH, live-verified: bump-dates.mjs re-stamps the llms.txt and llms-full.txt 'Last updated' header on every build (live llms-full.txt header 2026-09-01) even when no content changed, the same dishonest-freshness pattern (...) | GC, live-verified entity drift the finder folded into geo-05 but which stands on its own for 'who is Gregg Costin' queries: greggcostin.com homepage says '54 Google Reviews' in 4 places (live and (...)

### Schema.org structured data architecture

11 findings (4 high, 5 medium, 2 low). Strengths noted: Zero invalid JSON-LD across 203 HTML files and roughly 640 script blocks on both sites (only 1 file, civilian-site/404.html, has none, which is correct); the only unknown type left anywhere is the 3-instance RealEstateOrganization in index.html. | No self-serving AggregateRating or Review markup on either site (0 nodes), which is fully compliant with Google's review-snippet policy; most local agent sites still violate this. | FAQPage integrity is real: 753 Question nodes across both sites and every question string and answer opening is present in the visible HTML (the July 2026 mirror fix held; the 4 mismatches my checker flagged were anchor-tag artifacts). | Authorship linkage is consistent: 108 of 108 Article and BlogPosting nodes reference the author Person by @id, 97 carry a publisher with logo, and every one has datePublished and dateModified. | Breadcrumb coverage is near-total: 101 of 102 GC pages (3-level trails on all 82 school pages) and 93 of 101 PMH static pages plus every SPA route shell (scripts/postbuild-spa-routes.mjs injects WebPage + BreadcrumbList per route). | The GC Person node is a strong E-E-A-T profile (alumniOf USAF and University of Tampa, three dated and quantified awards, five designations as EducationalOccupationalCredential, NAR and Florida Realtors membership) and the GC RealEstateAgent already carries geo, priceRange, areaServed, founder and parentOrganization; base and community pages on PMH carry Place nodes with real coordinates (7 bases, 19 communities) and Speakable selectors on 11 pages.

Auditor notes: Method: a node scanner (scratchpad/ldscan.mjs) parsed every &lt;script type=application/ld+json&gt; in index.html, public/**, civilian-site/** (203 files) and produced the type inventory, @id inventory, per-property distinct values, dangling refs, author/publisher shapes and FAQ mirror check; variants.mjs quantified conflicts per @id; live curl (2026-09-02) confirmed the deployed markup on / , /about, /pcs-guide, /communities, /mortgage-calculators, /va-loan-guide, /reviews, /bases/nas-pensacola (PMH) and /, /team, /neighborhoods, /reviews, /contact (GC) matches the repo, including the 3 RealEstateOrganization on every SPA route. Wikidata was checked through two endpoints (wbgetentities (...)

#### [schema-01] Both sites still cite a Wikidata item that Wikidata deleted on 2026-07-07 (plus a dead g.co/kgs link); the civilian audit gate enforces its presence

- meta: BOTH | high | effort low | narrowed
- Evidence: Live: https://www.wikidata.org/w/api.php?action=wbgetentities&ids=Q140446886 returns {"entities":{"Q140446886":{"id":"Q140446886","missing":""}}}; https://www.wikidata.org/wiki/Special:EntityData/Q140446886.json returns 'No entity with ID Q140446886 was found'; wbsearchentities search='Gregg Costin' returns an empty result set; https://g.co/kgs/gregg-costin returns HTTP 404. Code: index.html:358-427 Person block carries identifier PropertyValue propertyID 'Wikidata' value 'Q140446886' plus sameAs (...)
- Impact: The identifier and sameAs values are the strongest entity-reconciliation signals on the sites, and both resolve to nothing. Any search engine, LLM crawler, or journalist that checks the QID finds a false claim on 100 percent of pages of both properties and (...)
- Fix: Write scripts/remove-wikidata-entity.mjs as the inverse of scripts/add-wikidata-entity.mjs: for every .html under public/ and civilian-site/ parse each ld+json block, delete identifier entries with propertyID 'Wikidata' (drop the identifier property entirely when the array becomes empty), filter 'https://www.wikidata.org/wiki/Q140446886' and 'https://g.co/kgs/gregg-costin' out of every sameAs array, re-serialize compact blocks unchanged in style. Hand-edit the pretty-printed index.html at lines 175, 177, 231, (...)
- Verifier: Core is real and worth fixing, but two claims are overstated: (1) the anchors were not 'fabricated'; the item was created and then deleted by Wikidata for notability, which changes the narrative from dishonesty to stale data and is important for the owner to (...)

#### [schema-02] Two disconnected entity graphs for one person and one business: different @ids on each domain, no cross-reference, drifting properties

- meta: BOTH | high | effort medium | confirmed
- Evidence: PMH Person @id https://pensacolamilitaryhousing.com/#person-gregg (94 files, e.g. public/va-loan-guide.html:265) vs GC Person @id https://greggcostin.com/#gregg (civilian-site/index.html:43, team.html:39). PMH RealEstateAgent @id https://pensacolamilitaryhousing.com/#agent (187 nodes) vs GC RealEstateAgent @id https://greggcostin.com/#team (5 nodes, civilian-site/index.html:40). Brokerage: PMH https://pensacolamilitaryhousing.com/#brokerage typed RealEstateOrganization (index.html:269-298) vs GC (...)
- Impact: Google and LLM knowledge graphs reconcile entities by @id, sameAs and matching properties. Today they see two agents, two persons and two brokerages that partly contradict each other (price range, job title, awards, email), so neither domain's authority (...)
- Fix: Adopt ONE canonical @id set and reference it from both domains: Person https://greggcostin.com/#gregg, RealEstateAgent https://greggcostin.com/#team, Organization https://greggcostin.com/#brokerage, with one WebSite node per domain (https://pensacolamilitaryhousing.com/#website and https://greggcostin.com/#website). Rationale: greggcostin.com is the designated personal-brand flagship (memory: domain portfolio), so the person and the team live there; the alternative (keep the PMH ids and point GC at them) is (...)
- Verifier: Fully reproduced. One correction to the fix: AGGREGATOR_PROFILES.md:18 records the NAP/GBP Website as https://pensacolamilitaryhousing.com, so the merged RealEstateAgent's url must be whatever the Google Business Profile Website field says (likely PMH), even (...)

#### [schema-03] The single RealEstateAgent @id is fully redefined 187 times with 69 conflicting definitions, including 31 different business coordinates

- meta: PMH | high | effort medium | confirmed
- Evidence: Scratch scan of all public/**/*.html + index.html (script: scratchpad/ldscan.mjs and variants.mjs): @id https://pensacolamilitaryhousing.com/#agent is defined with properties 187 times across 94 files; 69 distinct full definitions. Per property: geo present in 92 definitions with 31 distinct coordinate pairs (public/communities/perdido-key.html:38 sets the agent's geo to 30.3090,-87.4608; public/bases/duke-field.html:38 to 30.6470,-86.5219; public/communities/crestview.html:38 to 30.7621,-86.5703; 55 use (...)
- Impact: A consumer merging nodes by @id sees one business whose location moves across 31 points from Perdido Key to Crestview and whose credential list changes page to page. Conflicting values lower confidence in every value, including the correct ones, and the (...)
- Fix: Define the full #team node once (homepage and /about, template 1 in schema-05) and on all other pages emit only the compact reference node from template 2: {"@type":"RealEstateAgent","@id":"https://greggcostin.com/#team","name":"Gregg Costin - The Costin Team","url":"https://greggcostin.com","telephone":"+1-850-266-5005","logo":{"@type":"ImageObject","url":"https://pensacolamilitaryhousing.com/images/logo-08-sm.png","width":480,"height":196},"parentOrganization":{"@id":"https://greggcostin.com/#brokerage"}}. Move (...)
- Verifier: Every number reproduced within one (geo distinct 30 vs 31 depending on whether string and numeric coordinate forms are merged). Fix is sound for this codebase: the compact node approach works with the page-factory template (...)

#### [schema-04] index.html still ships the invalid type RealEstateOrganization three times plus a second, differently named LocalBusiness, and the SPA shells copy it to every SPA route

- meta: PMH | high | effort low | confirmed
- Evidence: index.html:117 (#agent.worksFor @type RealEstateOrganization), index.html:272 (#brokerage @type RealEstateOrganization), index.html:381 (#person-gregg.worksFor @type RealEstateOrganization); RealEstateOrganization is not a schema.org type (scan: the only unknown type across 203 files). Live: https://pensacolamilitaryhousing.com/ serves 3 RealEstateOrganization, and because scripts/postbuild-spa-routes.mjs:94-108 injects WebPage + BreadcrumbList into a copy of the index head, /about, /contact, /pcs-guide, /blog, (...)
- Impact: RealEstateAgent is a valid LocalBusiness subtype; RealEstateOrganization is silently dropped by parsers, which leaves the brokerage node typeless on the homepage and every SPA route. Two LocalBusiness entities with different names at one NAP create a (...)
- Fix: Replace the eight JSON-LD blocks in index.html lines 91-428 with the single @graph in template 1 (schema-05): it merges LocalBusiness into the RealEstateAgent (one node, with openingHoursSpecification, hasMap, geo, priceRange), types the brokerage as Organization, and points Service.provider at #team. Set GBP_OPENS_HH_MM / GBP_CLOSES_HH_MM to the hours shown on the Google Business Profile (if GBP says 'Open 24 hours' keep opens 00:00 closes 23:59, otherwise use the real hours). Keep the postbuild WebPage + (...)
- Verifier: Fully reproduced. Fix is implementable: replacing the eight blocks between lines 91 and 428 with one @graph leaves the postbuild swap anchors (the hero preload link and &lt;/head&gt;) intact. Note that the comment at index.html:253 says 'WebSite with (...)

#### [schema-05] Target entity model and drop-in JSON-LD templates (recommendation; severities carried by schema-02/03/04)

- meta: BOTH | medium | effort medium | narrowed
- Evidence: Design target derived from the inventory above: PMH types today = RealEstateAgent 189, Organization 465, Person 95, Article 82, BlogPosting 22, FAQPage 92, BreadcrumbList 93, WebPage 102, Place 126, LocalBusiness 1, WebSite 1, RealEstateOrganization 3, VideoObject 0; GC types = WebSite 97, WebPage 95, BreadcrumbList 101, Organization 94, School 82, FAQPage 12, RealEstateAgent 5, Person 4, Article 4, Service 2, VideoObject 0. Live dimensions used in the templates: gregg-portrait.jpg 1200x1200 (108,614 bytes), (...)
- Impact: Gives both domains one reconciled identity so that authority, reviews, credentials and citations accrue to a single Person and a single business node, and gives the content generators a consistent per-page pattern (Article + WebPage + BreadcrumbList + (...)
- Fix: Adopt the templates with these edits: set RealEstateAgent.url in Templates 1 and 3 to the exact GBP Website value (AGGREGATOR_PROFILES.md:18 says https://pensacolamilitaryhousing.com; change only if GBP is changed); remove the 'public/about' rollout step because dist/about.html inherits index.html's entity blocks via scripts/postbuild-spa-routes.mjs; strip the identifier and license hasCredential entries until the DBPR and AREC numbers are recorded in AGGREGATOR_PROFILES.md:19-20; save each template as a file (...)
- Verifier: This is a design deliverable, not a defect; its 'high' severity duplicates the defects already scored in schema-02/03/04. The model is sound for Cloudflare Pages static HTML plus the SPA shells, and the compact reference node pattern fits page-factory and (...)

#### [schema-06] LocalBusiness profile is missing hasMap, license identifiers, hours on the agent node and @id-linked parentOrganization; PMH misuses the Person property worksFor on the business

- meta: BOTH | medium | effort low | confirmed
- Evidence: Scan of both sites: hasMap 0 occurrences; identifier on RealEstateAgent 0; openingHoursSpecification only on the orphan #localbusiness at index.html:225 (never on #agent or GC #team); GC #team has no hours at all (civilian-site/index.html:40). PMH #agent uses 'worksFor' (schema.org domain: Person) on a RealEstateAgent in 94 files (e.g. public/va-loan-guide.html:35) and never sets parentOrganization; GC #team sets parentOrganization as an inline Organization with no @id (civilian-site/index.html:40) while a (...)
- Impact: For a LocalBusiness/RealEstateAgent Google lists address, phone, hours, map and price range as the properties it uses; license identifiers are the single most verifiable trust signal a Realtor can publish and are what directory-grounded queries ('best (...)
- Fix: Templates 1 and 3 already carry hasMap (the Maps place URL), openingHoursSpecification, identifier PropertyValue x3 (FL license, AL license, GBP place ID), parentOrganization {"@id":"https://greggcostin.com/#brokerage"} and Person.hasCredential license entries with recognizedBy DBPR / AREC. Get the numbers: FL from https://www.myfloridalicense.com/wl11.asp (Licensee Search, name Costin, board Real Estate), AL from the AREC licensee lookup at https://arec.alabama.gov; record both in AGGREGATOR_PROFILES.md:19-20 (...)
- Verifier: Reproduced; only the file count differs (90 files with worksFor on the agent node, not 94). Fix is correct and low effort; the numbers must come from the DBPR and AREC lookups, which this audit cannot perform. Note that GC also emits geo latitude/longitude (...)

#### [schema-07] 81 of 104 Article/BlogPosting nodes use the headshot as the article image, 98 logo ImageObjects lack dimensions, and the 11 blog-index BlogPosting nodes have neither publisher nor image

- meta: PMH | medium | effort low | narrowed
- Evidence: 93 of 104 Article/BlogPosting nodes set image to https://pensacolamilitaryhousing.com/images/gregg-portrait.jpg (grep count 93; live 1200x1200, 108,614 bytes) while the same pages declare a distinct og:image (public/va-loan-guide.html:20 image = portrait vs line 25 og:image = https://pensacolamilitaryhousing.com/og/va-loan-guide.png, live HTTP 200 image/png). All 98 ImageObject nodes on both sites are publisher logos with url only and no width/height (scan: 'ImageObject total 98 without width/height 98'). (...)
- Impact: Google's Article guidance asks for images representative of the article, at least 1200 px wide, ideally in 16x9, 4x3 and 1x1; a portrait of the author on a BAH-rates guide is not representative, so the Article rich result and Discover eligibility are (...)
- Fix: As proposed: Article.image = [OG ImageObject 1200x630, portrait ImageObject 1200x1200]; add width 480 / height 196 to every logo ImageObject via the one-line sed across public/ and civilian-site/; in scripts/blog-factory.mjs either add publisher {"@id": agent id} and image to each blog-index BlogPosting summary or replace the 11 summaries with an ItemList of ListItem url entries and keep BlogPosting only on post pages.
- Verifier: Core reproduced; the headline count is 81 of 104, not 93, and the blog index BlogPosting nodes are missing image as well as publisher. Fix is sound; the sed for logo dimensions works on the compact single-line blocks in public/ and civilian-site/ (pattern (...)

#### [schema-08] 79 breadcrumb trails point their hub crumb at homepage hash fragments that are not pages

- meta: PMH | medium | effort low | confirmed
- Evidence: grep over public/: 53 BreadcrumbList items use "item":"https://pensacolamilitaryhousing.com/#resources" (e.g. public/va-loan-guide.html:41, public/faq.html:809, public/reviews.html:40), 19 use /#neighborhoods (e.g. public/communities/gulf-breeze.html:44) and 7 use /#bases (e.g. public/bases/nas-pensacola.html:37); 79 files affected. The SPA route /communities exists (src/routeMeta.js:49 'Pensacola Military Community Guide by Base') and is the natural hub for community and base pages; the (...)
- Impact: Breadcrumb rich results render the item URLs; a fragment on the homepage is the homepage, so the middle crumb is a mislabeled link to '/', and the site-structure signal ('this guide lives under Resources') is not backed by a real hub page. The hub pages that (...)
- Fix: Rewrite the middle crumb to a real URL: community pages -&gt; https://pensacolamilitaryhousing.com/communities ('Communities'); base pages -&gt; https://pensacolamilitaryhousing.com/communities as well until a /bases hub exists (or create public/bases.html with the page factory and point there); blog posts already use /blog; for the 53 guide pages either drop to a 2-level trail (Home &gt; Page) or create a real /guides hub page (page-factory) listing the 56 guides and point the crumb there. Implement with sed (...)
- Verifier: Reproduced and slightly worse than stated: the /#resources target is not even an anchor on the homepage. One fix correction: the finder says 'make the visible breadcrumb nav match', but no visible breadcrumb exists on any PMH static page, so this step means (...)

#### [schema-10] The 82 FLDOE school pages carry a thin School node and declare the page is 'about' the sales team instead of the school

- meta: GC | medium | effort medium | confirmed
- Evidence: civilian-site/schools/a-k-suter-elementary-school.html:37-39 (generated by scripts/schools-factory.mjs): WebPage.about = {"@id":"https://greggcostin.com/#team"} and no mainEntity; School node has no @id, no url, address = {addressRegion FL, addressCountry US} only, no geo, no identifier (FLDOE school number / NCES ID), no telephone, and isPartOf district Organization without @id. The same 'about: #team' pattern is on all 95 GC WebPage nodes including resources, blog and contact (scan: WebPage 95, about #team on (...)
- Impact: The school reports are GC's largest content asset (82 of 102 pages) and the one place the civilian site can win entity queries a Realtor site normally cannot (school name + grade). A School node without identifier, address or url cannot be reconciled with (...)
- Fix: In scripts/schools-factory.mjs emit: School {"@id":PAGE_URL#school, name, url: PAGE_URL, address with streetAddress/addressLocality/postalCode from the FLDOE master file, geo if available, telephone, identifier:[{PropertyValue propertyID 'FLDOE school number' value ...},{PropertyValue propertyID 'NCES school ID' value ...}], isPartOf:{Organization @id https://greggcostin.com/#district-escambia or #district-santa-rosa}, sameAs: [official school website, FLDOE report card URL]} and set WebPage.about and (...)
- Verifier: Reproduced. One fix correction: the finder assumes address and NCES id can be pulled 'from the FLDOE master file' in the repo; the repo dataset only carries the FLDOE district and school number. Emit identifier now from existing data (PropertyValue (...)

#### [schema-09] faq.html (4th most-linked page) publishes a third business identity inside its FAQPage, and FAQPage rich results are advisory only

- meta: PMH | low | effort low | confirmed
- Evidence: public/faq.html:33-60: FAQPage.publisher is an inline RealEstateAgent named 'Gregg Costin, Realtor' (no @id, email gregg.costin@gmail.com) whose worksFor is ANOTHER RealEstateAgent named 'Levin Rinke Realty' (brokerage typed as an agent, no @id), so this page alone carries three RealEstateAgent identities (plus #agent at line 812 and Article.publisher at line 17). scripts/audit-links.mjs (evidence file) ranks /faq at 279 inbound links. FAQPage is present on 92/101 PMH and 12/102 GC pages; Google restricted FAQ (...)
- Impact: Low direct impact: the FAQ markup still helps AI answer extraction (753 Q/A pairs mirror visible text on both sites) but earns no Google rich result, and the inline third identity on the most-linked FAQ page dilutes the entity graph the other findings are (...)
- Fix: In public/faq.html replace the whole publisher object at lines 51-60 with {"@id":"https://greggcostin.com/#team"} and add "author":{"@id":"https://greggcostin.com/#gregg"}; keep the speakable block. Keep FAQPage sitewide for AI extraction but stop treating it as a rich-result lever in docs/content-strategy.md; leave the single HowTo in place (harmless) or convert it to an ordered list in prose.
- Verifier: Reproduced. Low severity is right; the fix (publisher {@id agent} + author {@id person}) is a two-line edit inside the pretty-printed block at lines 51-60.

#### [schema-11] No VideoObject or video embed anywhere on either site

- meta: BOTH | low | effort high | confirmed
- Evidence: Scan of 203 HTML files: VideoObject nodes 0 (both sites); evidence file confirms 0 matches for video/iframe/VideoObject sitewide. Competitors in the evidence set (panhandlepcs.com, bemoregroup.net) are not audited here; this is an absence, not a defect.
- Impact: Drone and walkthrough video is the format Google surfaces in video carousels for '&lt;neighborhood&gt; tour' and 'living in &lt;city&gt;' queries and the format LLM search cites for place descriptions when a transcript exists. Zero video means zero (...)
- Fix: When the first drone or walkthrough video is produced, host the mp4 on the site (public/videos/) or embed YouTube on the matching community page, add template 5 from schema-05 to that page's @graph with a full transcript, and reference it from the community page's WebPage node via "video":{"@id":"PAGE_URL#video"}. Start with the three pages that already have the most engaged traffic per Clarity: /communities/niceville, /pcs-guide, /bases/whiting-field.
- Verifier: An absence, correctly scored low. Template 5 is only useful once a video exists; the fix is fine as a future step.

Verifier-noted items outside the numbered list: BOTH: BreadcrumbList markup ships on 93 PMH pages and 101 GC pages with no visible breadcrumb trail anywhere on either site. Evidence: grep -li 'aria-label="breadcrumb"|class="crumb|class="breadcrumb' over (...) | PMH: the SPA route shells repeat the same 'about = the agent' mis-subject the finder only flagged on GC. Evidence: scripts/postbuild-spa-routes.mjs:98 emits WebPage about: {"@id": (...) | PMH: the Wikidata deletion is still unrecorded in the repo, so the automation forms a loop that would re-create the problem. Evidence: Wikidata log shows Q140446886 deleted 2026-07-07 (RfD, notability); (...) | GC: entity properties are typed inconsistently against PMH in ways that hinder merge: civilian-site/index.html:41 emits geo latitude/longitude as strings ("30.4213", "-87.2169") while index.html:113-114 emits numbers; (...) | PMH: public/blog.html's 11 BlogPosting summaries are missing image as well as publisher (scan: 11 nodes, 11 without publisher, 11 without image), and the Blog node has no @id linking it to the WebSite. Evidence: (...)

### Indexation & site architecture

12 findings (1 critical, 3 high, 4 medium, 4 low). Strengths noted: Canonical discipline is complete on both sites: 202 of 202 HTML pages carry a self-referential canonical, og:url equals canonical on 100% of pages, hreflang en-US + x-default self-reference on every indexable page, 0 duplicate titles and 0 duplicate descriptions across both properties, and exactly one H1 on every page (audit-arch.mjs, code-verified). | Redirect hygiene is single-hop everywhere it matters: http and www 301 straight to the https apex on both domains, trailing-slash variants 308 to the canonical form, legacy .html paths 308 to clean URLs, public/_redirects maps 60+ retired paths (base, community, VA-loan and homestead renames) with no chains, and greggcostin.com/about 301s to /team (live-verified). | greggcostin.com handles the edge cases correctly: unknown paths, case variants and directory paths return a real 404 (1,002-byte branded page with noindex), the greggcostin.pages.dev twin sends X-Robots-Tag: noindex, and the JS redirect plus canonical are layered under it (live-verified). | Sitemap and filesystem are in perfect parity on both sites: 0 pages on disk missing from a sitemap and 0 sitemap URLs without a file (the only non-HTML entries are llms.txt and llms-full.txt), and the GC sitemap's lastmod matches the file's git commit date on 98 of 102 URLs, so its freshness signal is honest. | Crawler policy is top-tier: robots.txt on both sites names 27 crawler groups (Google, Bing, Apple, OpenAI, Anthropic, Perplexity, Meta, Amazon, CCBot and more) with RFC 9309-correct per-group rules, both sites publish llms.txt (PMH also llms-full.txt), and the IndexNow key file ships in the deploy. | Internal link hygiene is clean: 0 broken internal links, 0 internal links with a .html suffix, 0 links to a pages.dev host, per-page OG cards exist on disk for 99/99 PMH and 102/102 GC pages with twitter:card summary_large_image everywhere, and the tandem cross-link rule is satisfied on 93/93 PMH static pages and 102/102 GC pages.

Auditor notes: Data limits: no Lighthouse or CrUX numbers were available this run (PSI quota exhausted per the evidence file); nothing in these findings relies on them. All live checks were curl against the owner's own domains on 2026-09-02 from a US client; the audit script is at C:\Users\gregg\AppData\Local\Temp\claude\C--Users-gregg-pensacolamilitaryhousing\80b8df17-57ab-405d-b719-a03c84393d71\scratchpad\audit-arch.mjs with full per-page output in arch-report.json in the same folder (SPA routes were audited from the live-fetched shells spa_*.html because they have no file in public/). Judgment calls: (1) URL architecture: I recommend NOT migrating PMH's 56 flat top-level guides into /guides/ or (...)

#### [idx-01] Every unknown URL on PMH returns HTTP 200 with the homepage (soft 404 catch-all), no 404.html exists

- meta: PMH | critical | effort low | confirmed
- Evidence: public/_redirects last rule: /* /index.html 200 (no public/404.html, dist/404.html absent). Live 2026-09-02: /nonexistent-page-xyz, /BAH-Rates, /Bases/NAS-Pensacola, /bases, /bases/, /blog/nonexistent-post, /communities/nonexistent, /images/, /og/, /downloads/, /wp-admin, /.env, /404, /404.html, /blog/index.html, /calculator ALL return status=200, size=54812 bytes (the SPA index.html) with &lt;link rel="canonical" href="https://pensacolamilitaryhousing.com/"&gt; and &lt;meta name="robots" content="index, follow, (...)
- Impact: Google classifies these as soft 404s (crawl waste, 'Duplicate, Google chose different canonical' clusters pointing at the homepage), case-typo and scanner URLs (/wp-admin, /.env) get crawled as homepage copies, and any external link to a mistyped PMH URL (...)
- Fix: (1) Create public/404.html (clone civilian-site/404.html; noindex meta; links to /, /pcs-guide, /communities, /bah-rates, /va-loan-guide, /contact). (2) Delete /* /index.html 200 and replace the stale comment block in public/_redirects. (3) Deploy, then verify curl -sI https://pensacolamilitaryhousing.com/nonexistent-page-xyz | head -1 = 404 and /about, /contact, /pcs-guide, /communities, /mortgage-calculators, /blog stay 200. Skip the /calculator 301s unless GSC shows hits on those paths.
- Verifier: Fix is correct but the load-bearing step is public/404.html, not the wildcard deletion: Cloudflare Pages docs (developers.cloudflare.com/pages/configuration/serving-pages) state that without a top-level 404.html Pages assumes an SPA and serves index.html for (...)

#### [idx-02] pensacolamilitaryhousing.pages.dev is a fully indexable duplicate host (GC twin is already noindexed)

- meta: PMH | high | effort low | confirmed
- Evidence: Live: curl -I https://pensacolamilitaryhousing.pages.dev/bah-rates = HTTP 200 with NO x-robots-tag; body carries &lt;meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1"&gt; plus the JS location.replace('https://pensacolamilitaryhousing.com'+location.pathname...). public/_headers (33 lines) has no pages.dev rule. Contrast civilian-site/_headers lines 8-10: https://greggcostin.pages.dev/* / X-Robots-Tag: noindex, confirmed live (greggcostin.pages.dev/buy returns x-robots-tag: noindex).
- Impact: 101 URLs exist twice on the open web; the canonical tag mitigates for Google, but Bing, AI crawlers (which do not run the JS redirect) and any backlink that lands on the .pages.dev host split signals, and the twin can surface in Copilot/Perplexity citations (...)
- Fix: Append to public/_headers exactly what the civilian site already has: # De-index the *.pages.dev twin (canonical + JS redirect alone do not stop crawlers) https://pensacolamilitaryhousing.pages.dev/* X-Robots-Tag: noindex Redeploy and verify curl -sI https://pensacolamilitaryhousing.pages.dev/ | grep -i x-robots-tag. Optionally also block the pages.dev host in robots.txt is NOT possible (same file), so the header is the correct lever.
- Verifier: Fix is correct and proven by the GC twin. One addition: preview deployments live on &lt;hash&gt;.pensacolamilitaryhousing.pages.dev, which a literal-host rule does not match; Cloudflare's documented placeholder form https://:project.pages.dev/* (and (...)

#### [idx-03] Sitemap lastmod is bulk-stamped to the build date on every deploy (101 of 101 URLs claim the same date)

- meta: PMH | high | effort low | confirmed
- Evidence: scripts/bump-dates.mjs lines 35-40: sitemap.replace(/&lt;lastmod&gt;[^&lt;]+&lt;\/lastmod&gt;/g, '&lt;lastmod&gt;' + TODAY + '&lt;/lastmod&gt;') runs from package.json prebuild on every npm run build. Live sitemap.xml 2026-09-02: 101 x &lt;lastmod&gt;2026-09-01. Repo snapshot: 97 x 2026-08-23, 4 x 2026-08-24, versus git log -1 --format=%cs per file: only 3 of 101 lastmods match the file's last commit; the 5 SPA routes (/about, /contact, /pcs-guide, /communities, /mortgage-calculators) claim 2026-08-23 while (...)
- Impact: Google states it ignores lastmod when it is consistently wrong; the site forfeits the one sitemap signal that would prioritise recrawl of genuinely refreshed pages (BAH tables, review counts, new blog posts) and every deploy tells Bing/IndexNow that all 101 (...)
- Fix: Replace step 1 of scripts/bump-dates.mjs with a per-URL derivation and keep today's date only for files that are actually changed in the working tree: const changed = new Set(execSync('git status --porcelain -- public index.html src/routeMeta.js', {encoding:'utf8'}).split('\n').map(l =&gt; l.slice(3).trim().replace(/\\/g,'/'))); const SPA = {'/about':1,'/contact':1,'/pcs-guide':1,'/communities':1,'/mortgage-calculators':1}; sitemap = (...)
- Verifier: Fully reproduced. The script's own header comment already calls blanket-bumping 'a dishonest freshness signal' for HTML, yet does exactly that to the sitemap. Fix code is sound; the simplest robust variant is to mirror each static page's "dateModified" value (...)

#### [idx-04] The SPA hub routes (/communities, /pcs-guide, /about, /mortgage-calculators) are 100-160 word shells with 9-14 links for any crawler that does not execute React

- meta: PMH | high | effort medium | confirmed
- Evidence: Live raw HTML measured 2026-09-02 (scripts and styles stripped): /communities = 108 body words, 9 internal links, 0 links to any of the 19 /communities/* pages or 7 /bases/* pages; /pcs-guide = 164 words, 14 links, 0 base or community links; /about = 115 words, 9 links; /mortgage-calculators = 120 words, 9 links; / = 554 words, 38 links. A static twin for comparison: public/communities/gulf-breeze.html = 2,009 words, 80 unique internal links. Source: scripts/postbuild-spa-routes.mjs makeFallback() renders only (...)
- Impact: The canonical PCS destination (28 sessions/30d, 48% scroll) and the community hub, which is the only structural parent of 19 community pages, present as thin pages to Bing and every AI crawler that drives the Copilot citation strategy (351 citations/90d are (...)
- Fix: Short term (postbuild only): in scripts/postbuild-spa-routes.mjs extend SHELL_LINKS: communities: readdirSync('public/communities').map(f =&gt; ['/communities/' + f.replace('.html',''), label]) grouped by base, plus the 7 /bases/* links; pcs-guide: 7 base links + 5 existing tools + /pcs-checklist + /school-zones-military-families; add a sections: [{h2, text}] array per route in src/routeMeta.js (3-5 sections, 300-500 words, mirroring the H2s React renders) and have makeFallback() emit them so the shell carries (...)
- Verifier: Word counts differ from the finder's by 10-15 (tokenizer difference), conclusion unchanged. The claim 'zero Copilot citations on SPA routes' is consistent with the evidence file (31 cited pages, all static) but I could not independently verify the per-URL (...)

#### [idx-05] BreadcrumbList hub crumbs on 79 of 93 static pages point at homepage fragments (/#bases, /#neighborhoods, /#resources); no /bases hub exists and /bases is a soft 404

- meta: PMH | medium | effort medium | confirmed
- Evidence: grep across public/: 53 pages carry "item":"https://pensacolamilitaryhousing.com/#resources", 19 community pages .../#neighborhoods, 7 base pages .../#bases (e.g. public/bases/nas-pensacola.html BreadcrumbList item 2; public/communities/gulf-breeze.html item 2). The anchors are empty placeholder divs at src/App.jsx:668-669 (&lt;div id="bases"&gt;&lt;/div&gt;&lt;div id="neighborhoods"&gt;&lt;/div&gt;). Live: https://pensacolamilitaryhousing.com/bases returns the homepage shell (200, canonical /); no page links to (...)
- Impact: Search engines drop URL fragments, so the crumb trail collapses to Home &gt; Home &gt; Page on 79 pages: no hub entity for the base cluster in rich results, no crawl path or equity flow from a bases hub to the 7 base guides (the highest-converting cluster: (...)
- Fix: (1) Communities: sed -i 's|"name":"Neighborhoods","item":"https://pensacolamilitaryhousing.com/#neighborhoods"|"name":"Communities","item":"https://pensacolamilitaryhousing.com/communities"|' public/communities/*.html (pipe delimiter). (2) Bases: build public/bases.html via scripts/page-factory.mjs (7 cards, CollectionPage schema), add to nav, sitemap.xml, llms.txt, then point the 7 base crumbs at /bases. (3) Resources: build public/guides.html (56 guides grouped by VA loan / BAH / taxes / PCS logistics / (...)
- Verifier: Reproduced exactly. The fix's sed command is broken: it uses # as the s/// delimiter while the pattern itself contains /#neighborhoods, so sed will error on 'unknown option'. Also rename the crumb label from 'Neighborhoods' to 'Communities' so it matches the (...)

#### [idx-06] SPA client-side navigation renders a second, different page at /reviews and pushes the 301-retired /homestead URL

- meta: PMH | medium | effort low | confirmed
- Evidence: src/App.jsx:634 &lt;BtnG onClick={() =&gt; go("reviews")}&gt;Read All Reviews&lt;/BtnG&gt; and App.jsx:2851 {page === "reviews" && &lt;ReviewsPage /&gt;}: go() does history.pushState to /reviews (PAGE_TO_SLUG App.jsx:2688-2699) and renders the React ReviewsPage, while a direct hit on /reviews serves public/reviews.html (title 'Gregg Costin Reviews | Pensacola Military Realtor, 5.0 Stars') and routeMeta.js sets document.title 'Client Reviews | Gregg Costin, Pensacola Realtor'. App.jsx:1031 go("homestead") pushes (...)
- Impact: Two implementations of /reviews (different copy, no static schema, different title) share one URL, so GA4/Clarity page_view and FUB pageview data for /reviews mix two pages, users who share the URL from the SPA state get a different page on reload, and (...)
- Fix: Replace go("reviews") with &lt;a href="/reviews"&gt; (the nav already does this via ExtTab at App.jsx:308) and go("homestead") with &lt;a href="/florida-homestead-exemption-military"&gt;; remove reviews, blog, va-loan, homestead from PAGE_TO_SLUG and the corresponding {page === ...} renders at App.jsx:2841-2851; delete ReviewsPage, BlogPage, VALoanPage, HomesteadPage and the BLOG_API fetch; trim ROUTE_META to shell routes only. Grep gate: grep -nE 'go\("(reviews|blog|va-loan|homestead)"\)' src/App.jsx must return (...)
- Verifier: Reproduced in full. Scope is larger than stated: App.jsx:2844-2848 also render BaseGuide for pages nas/whiting/corry/eglin/hurlburt, none of which exist in PAGE_TO_SLUG, and go() (App.jsx:2714) silently maps any unmapped id to slug "/", so those 5 base (...)

#### [idx-07] 82 school pages (80% of the GC URL inventory) each have exactly one inbound link and zero sibling or neighborhood links

- meta: GC | medium | effort medium | confirmed
- Evidence: audit-arch.mjs (civilian-site/): 86 URLs with fewer than 3 inbound links, 82 of them /schools/*, each with inbound = 1 (from /schools only; /schools carries 94 unique links). civilian-site/schools/pace-high-school.html: 0 links to other /schools/* pages, 3 links to /neighborhoods (nav/footer), 1 link to pensacolamilitaryhousing.com/. civilian-site/neighborhoods.html: 0 links to /schools/*. public/ (PMH): 0 pages link to greggcostin.com/schools (cross-site links are 93 x apex, 3 x /sell, 2 x /buy). All 82 also (...)
- Impact: Crawl depth is fine (2 clicks) but PageRank to each school page is a 1/94 slice of one hub, and no contextual signal ties a school to a neighborhood or base, so the pages are unlikely to rank for 'schools near &lt;neighborhood&gt;' or to be chosen over (...)
- Fix: In scripts/schools-factory.mjs add two blocks per school page: 'Feeder pattern' (elementary -&gt; middle -&gt; high in the same zone, 2-4 links) and 'Nearby schools in &lt;city&gt;' (4-6 links, same district + city); add a 'Neighborhoods zoned for this school' paragraph linking to the matching /neighborhoods card anchor (#gulf-breeze, #pace, etc.). In civilian-site/neighborhoods.html give each of the 13 cards a 'Schools' line with 2-3 links to the zoned /schools/* pages. Tandem rule: on the 19 PMH community pages (...)
- Verifier: Reproduced exactly (code-verified). One caution on the fix: 'Neighborhoods zoned for this school' asserts attendance-zone facts; the schools pages were built to be fair-housing-safe on FLDOE data only, so unless district attendance-zone data is loaded, label (...)

#### [idx-09] Titles over 60 chars (PMH home 67, 11 PMH pages, 2 GC) and 120 descriptions over 155 chars (PMH /bah-rates 206, /pcs-home-search 234; all 82 GC school pages 164-165)

- meta: BOTH | medium | effort low | confirmed
- Evidence: audit-arch.mjs: PMH titles &gt; 60 = 11 (/ = 67 'Pensacola Military Housing | Gregg Costin, Realtor® | PCS & VA Loan', /pcs-home-search 63, /blog 61, 4 community pages 61-62, /whats-my-home-worth 61); PMH descriptions &gt; 155 = 27 (/bah-rates 206, /pcs-home-search 234, /book-pcs-call 187, /whats-my-home-worth 187, /buy 157, /sell 157). GC descriptions &gt; 155 = 93 (82 school pages at 164-165 from the schools-factory template; /, /neighborhoods, /team, /reviews, /faq 158-160); GC /schools/central-school title 29 (...)
- Impact: Truncated titles lose the differentiator (the ® and 'PCS & VA Loan' on the PMH home title), truncated descriptions cut the CTA phrase on the two highest-citation pages, and 82 templated school descriptions read as boilerplate to Google, which then rewrites (...)
- Fix: Rewrite table (title &lt;= 60, description 120-155, keyword-led, no em dashes; lengths verified by script): PMH /: T 'Pensacola Military Realtor | PCS, VA Loan & BAH Guides' (54) | D 'Military relocation Realtor for NAS Pensacola, Whiting, Corry, Eglin and Hurlburt: 2026 BAH tables, VA loan guides, and base-by-base housing reports.' (149) PMH /pcs-guide: T 'PCS to Pensacola Guide 2026 | BAH, Housing, Schools' (51) | D 'PCS to Pensacola guide: 2026 BAH by base, on-base vs off-base housing, VA loan steps, school (...)
- Verifier: Counts reproduce within 2 (finder 27 vs my 25 PMH descriptions, a decoding difference). Rewrite table lengths spot-checked with node: 54/51/59/51 for titles and 149/155/155/139 for descriptions, all as claimed, and NAS Pensacola's 'E-5 with dependents (...)

#### [idx-08] Em dashes ship in the /pcs-guide meta description and three SPA shell intros because check-em-dashes.mjs never scans src/routeMeta.js

- meta: PMH | low | effort low | narrowed
- Evidence: src/routeMeta.js lines 31, 43, 45, 52 contain U+2014 in shipped strings: line 43 is the /pcs-guide meta description ('...A retired USAF officer's PCS guide [em dash] BAH by base...'), lines 31/45/52 are the about, pcs-guide and communities shell intros. Live https://pensacolamilitaryhousing.com/pcs-guide 2026-09-02: 16 em dashes in &lt;head&gt;, 18 in the document; /about 12/14; /communities 12/14; / 12/13 (JSON-LD and meta). scripts/check-em-dashes.mjs line 22 scans only public, public/bases, public/communities, (...)
- Impact: Violates the owner's standing no-em-dash rule on the highest-priority SPA routes (the canonical PCS destination included) and the SERP snippet for /pcs-guide shows the dash; the gate that is supposed to make the rule mechanical has a blind spot exactly where (...)
- Fix: Add src/routeMeta.js to scripts/check-em-dashes.mjs (scan string literals like the App.jsx pass) and rewrite routeMeta.js lines 31, 43, 45, 52 with commas or colons; optionally add a post-build pass over dist/{about,contact,pcs-guide,communities,mortgage-calculators}.html so generated shells are gated too. Leave index.html's comment-only dashes alone or strip them for tidiness.
- Verifier: Core is real (routeMeta.js is the blind spot and the /pcs-guide SERP description ships a dash) but the evidence overstates it: the finder says the gate 'skips index.html' (it does not, line 24) and that the home page has 12 dashes 'in JSON-LD and meta' (they (...)

#### [idx-10] Blog posts get 1-3 inbound links while every guide gets 94-98; one live page is a true orphan; the link graph is flat

- meta: PMH | low | effort low | confirmed
- Evidence: audit-arch.mjs (public/): inbound distinct-source counts for the 11 /blog/* posts: best-neighborhoods-eglin-afb-families 1, florida-veteran-property-tax-county-guide 1, living-in-gulf-breeze-pros-cons 1, va-loan-assumption-buyers-guide 1, five posts at 2, two at 3. /veteran-realtor-destin: 0 inbound (live 200, 84,314 bytes, in sitemap). Sitewide: average 76 unique internal links per page, top-10 inbound all 94-98 (nav + footer + 19-link explore block), so 90 of 99 URLs are linked from nearly every page and the (...)
- Impact: The freshest content (blog engine output) receives the least equity, so posts index slowly and rank below the static guides they support; a fully connected graph gives Google no signal about which pages are hubs.
- Fix: Add 2-3 contextual in-body links per post from the guide it extends: /assumable-va-loans-pensacola -&gt; /blog/va-loan-assumption-buyers-guide; /communities/gulf-breeze and /gulf-breeze-vs-navarre -&gt; /blog/living-in-gulf-breeze-pros-cons; /va-disability-property-tax-florida and /disabled-veteran-benefits-florida -&gt; /blog/florida-veteran-property-tax-county-guide; /bases/eglin-afb and /niceville-vs-crestview -&gt; /blog/best-neighborhoods-eglin-afb-families; /bah-rates -&gt; (...)
- Verifier: Reproduced. The fix's list of parent guides exists (all named public/*.html files are present) and adding a related-reading link from the parent guide is trivial with the page-factory pattern. The 'topical explore block per cluster' suggestion touches every (...)

#### [idx-11] Cloudflare Email Address Obfuscation rewrites every mailto on both zones into /cdn-cgi/l/email-protection links

- meta: BOTH | low | effort low | confirmed
- Evidence: Live 2026-09-02: https://pensacolamilitaryhousing.com/bah-rates contains 3 href="/cdn-cgi/l/email-protection#..." links; https://greggcostin.com/contact contains 3; the SPA home carries 2 data-cfemail= spans. The visible address is replaced by '[email protected]' for any fetcher that does not run Cloudflare's decoder script; /cdn-cgi/ is Disallowed in both robots.txt files. JSON-LD "email":"gregg.costin@gmail.com" survives (2 occurrences intact on /bah-rates). audit-arch.mjs flags /cdn-cgi/l/email-protection as (...)
- Impact: Non-rendering crawlers and AI answer engines see a broken NAP element (no email text) on every page of both sites, each page carries 2-3 links into a robots-blocked path, and the mailto target the Clarity data already shows as dead clicks gains an extra (...)
- Fix: Cloudflare dashboard, both zones (pensacolamilitaryhousing.com and greggcostin.com): Scrape Shield -&gt; Email Address Obfuscation -&gt; Off. The contact forms are honeypot-protected and the address is already public on GBP, Zillow and the schema, so obfuscation buys nothing. Verify with curl -s https://greggcostin.com/contact | grep -c cdn-cgi/l/email-protection = 0. While there, settle the email casing across sites (gregg.costin@gmail.com in PMH LocalBusiness vs Gregg.Costin@gmail.com on GC) to one form.
- Verifier: Reproduced live on both zones. Fix is the correct lever (Scrape Shield &gt; Email Address Obfuscation is a per-zone dashboard toggle, not something the repo controls). Severity low is right: the JSON-LD email survives and the effect is mainly on (...)

#### [idx-12] Heading level skips (H1 -&gt; H3) on the buy/sell and hub pages of both sites

- meta: BOTH | low | effort low | confirmed
- Evidence: audit-arch.mjs: PMH public/buy.html line 330 &lt;h1&gt; then line 361 &lt;h3&gt;Personalized Home Search&lt;/h3&gt; (card grid, first h2 at line 365); public/sell.html same pattern (h1 -&gt; h3 'Strategic Pricing Guidance'). GC civilian-site/neighborhoods.html line 212 &lt;h1&gt; then line 225 &lt;h3&gt;East Hill & Downtown&lt;/h3&gt; (all 13 neighborhood cards are h3 with no h2 parent); civilian-site/blog.html h1 -&gt; h3 'Military or PCSing?'; contact.html h1 -&gt; h3 'Call or Text'; resources.html h1 -&gt; h3 (...)
- Impact: Minor outline defect: the 13 GC neighborhood names, the strongest local-intent keywords on that page, sit at H3 under no H2, and screen-reader heading navigation skips a level; low ranking impact but cheap to fix and it blocks a clean audit-civilian.mjs (...)
- Fix: Wrap card grids with an H2 section heading: GC neighborhoods.html insert &lt;h2&gt;Pensacola Neighborhoods Compared&lt;/h2&gt; before the first card (and consider promoting the 13 card titles to h2 since they are the page's primary entities); PMH buy.html/sell.html add &lt;h2&gt;How I Work With Buyers&lt;/h2&gt; / &lt;h2&gt;How I Sell Your Home&lt;/h2&gt; before the first card row; GC blog.html, contact.html, resources.html promote the first h3 to h2. Add a heading-skip check to scripts/audit-civilian.mjs and (...)
- Verifier: Reproduced exactly (code-verified). Low severity is appropriate; the fix is a handful of one-line inserts plus a regex gate in the two audit scripts.

Verifier-noted items outside the numbered list: BOTH, medium: cross-domain duplicate review content. 7 of the 11 long review paragraphs on civilian-site/reviews.html appear verbatim in public/reviews.html (8-word shingle overlap 65.8% of the smaller page; GC main (...) | GC, medium: the civilian neighborhoods hub has no children of its own and exports all its location equity off-domain. civilian-site/neighborhoods.html links to 10 distinct pensacolamilitaryhousing.com/communities/* (...) | PMH, low: the SPA router silently rewrites unknown page ids to '/'. src/App.jsx:2714 const slug = PAGE_TO_SLUG[id] || "/" combined with renders for nas/whiting/corry/eglin/hurlburt (App.jsx:2844-2848) that have no slug (...) | PMH, low: three independent 'last modified' dates disagree for the same page. For public/bah-rates.html: git commit 2026-08-24, on-page Article dateModified 2026-07-06, sitemap lastmod 2026-09-01 (live). The opt-in (...) | PMH, low: public/sitemap.xml lists two plain-text files as pages: /llms.txt and /llms-full.txt (sitemap loc entries with no matching .html, verified by diffing loc list against public/). Google can index text files as (...)

### Visual hierarchy, UI/UX, conversion (CRO)

12 findings (5 high, 5 medium, 2 low). Strengths noted: Sticky mobile Call/Text/Email bar on both sites is top-tier: 48px minimum height, gold primary for Call, prefilled sms: body, and the FUB chat iframe is hidden under 800px so there is never a double bubble (App.jsx:2812-2820; civilian index.html:162-169; verified live at 375px). | Text contrast is excellent across the shared palette: body #E8E6DF on ink 15.3:1, muted #A5A496 7.6:1, mutedD #8f8e83 5.8:1, gold #C9A84C on ink 8.4:1, ink-on-gold buttons 8.4:1, nav tabs 12.3:1 (all computed with the WCAG formula; only fine print and field borders miss, see cro-11). | The cta-strip pattern on 15 PMH pages is a genuinely strong first-screen conversion unit: gold-tint panel with a one-line offer, Text/Call/Free PCS Checklist, visible inside the first mobile screen on /bah-rates; the fix is rollout, not redesign. | The inquiry modal is accessible to a standard most agent sites miss: focus trap, Escape to close, aria-modal and labelled fields, honeypot, worker-contract-safe payload, and a clear success state (App.jsx:488-527, 863-935). | GC's trust band content is specific, dated and third-party-verifiable (54 Google and 25 Zillow reviews linked to their sources, #34 of 4,100+ as of Aug 1 2026, Forbes Rookie of the Year 2025, rankings out of 450+ agents), which is top-1% substantiation quality for a personal-brand site. | Both sites fire a typed GA4 conversion event for every CTA class (phone_call_click, text_message_click, home_valuation_click, inquiry_open/inquiry_submit, idx_search_click, calendly_click; buy.html:47, military-realtor-pensacola.html:51), and the two domains share one design system so cross-site movement feels seamless.

Auditor notes: Data limits: no Lighthouse or CrUX this run (PSI quota exhausted); Clarity covers PMH only, with small mobile n on inner pages (pcs-guide mobile n=3) and no captured tel:/sms:/form events on mobile, so 'no mobile conversion signal' means not captured, not zero. Clarity device split for the homepage was pulled live via the Clarity MCP (mobile scroll 30.1% / 32s, PC 23.6% / 40s, last 30 days). Live measurements were taken with getBoundingClientRect in the in-app Chromium at 375x812, 1366x768 and 1920x1080 after a 3s settle; my first-CTA offset on the PMH mobile home (641px) is lower than the orchestrator's screenshot estimate (~1,280px), both agree the primary sits in the bottom band of the (...)

#### [cro-01] Mobile homepage screens 2-4 are 1,529px of one-column stats and stacked partner logos; service content starts at 2,994px

- meta: PMH | high | effort medium | narrowed
- Evidence: Live 375x812 (getBoundingClientRect, 2026-09-02): nav.spa-nav h=161 fixed; h1 top=220; first CTA top=641 (h=48); .hero-bg-image 1003-1283 (280px, index.html:473 background-position:center 15% at 280px height crops the face out: screenshot shows torso and hands only); .hero-stats 1283-1666 (383px, App.jsx:467-482 renders 4 stats in a 1-column auto-fit grid, no mobile rule anywhere: grep trust-grid|hero-stats index.html = hero-stats only at :461); TrustBar 'Preferred Agent' 1666-2812 (1,146px: App.jsx:533 (...)
- Impact: The second thing a phone visitor sees after the headline is a cropped torso, then four oversized stat blocks, then ~1,150px of logos. Nothing in the 640-2,994px band answers 'what do I do next', which matches the 82% homepage exit and 21-30% scroll depth. (...)
- Fix: 1) index.html &lt;=900px block: .hero-stats&gt;div{grid-template-columns:repeat(2,1fr)!important;gap:14px 20px!important;padding:16px 20px!important} and .hero-stats [style*='font-size: 32px']{font-size:22px!important} (React emits font-size: 32px in the style attribute, so the selector matches). 2) TrustBar (App.jsx:529-551): drop the per-logo caption div, set the logo box to 120x56 with objectFit contain, and in the index.html &lt;=640px block add (...)
- Verifier: The band measurements and the code citations reproduce exactly, and the stats+logos block (1,529px between 1283 and 2812) is real. The 'headless hero crop' claim is wrong (face visible), so fix item 3 (a new mobile crop image) is unnecessary. The first CTA (...)

#### [cro-02] Hero CTA architecture: three buttons plus five chips plus four stats, the gold primary is lead-gated while the ghost goes ungated to the same URL, and the 'Call' button hides under the sticky bar

- meta: PMH | high | effort medium | confirmed
- Evidence: src/App.jsx:441 BtnP onClick={... hasSubmittedInquiry() ? location.href='/pcs-home-search' : setInquiryOpen(true)} 'Start Your PCS Search'; :442 BtnG href='/pcs-home-search' 'Browse Live MLS Listings'; :443 BtnG href='tel:8502665005' 'Call 850-266-5005' while the sticky bar (App.jsx:2855-2858) already renders Call/Text/Email on &lt;=800px; :446-461 five designation chips; :467-482 four stats. Live 375x812 screenshot: third hero button is partly covered by the sticky bar. Live 1366x768: nav 165px, primary CTA at y (...)
- Impact: Visitors get two differently styled buttons that lead to the same page, with the more prominent one interposing a 5-field form. On phones the primary lands in the bottom band of the first screen under a 161px permanent header, and the third button duplicates (...)
- Fix: Hero spec (mobile-first, owner's H1 retained): header collapses to ~60px on &lt;=900px (logo + phone + hamburger opening the existing dropdown groups as an accordion sheet; the mega-nav trim is already on the known-open list, this is the CRO reason to do it). Eyebrow: 'Retired USAF CSO · 11 PCS moves · MRP'. H1 unchanged. Subhead candidates (&lt;=120 chars, 2 lines): A) 'Homes that fit your BAH, a VA loan done right, and a plan before your report date.' B) 'VA loans, BAH-fit homes and sight-unseen buying for NAS (...)
- Verifier: Every number reproduces. The fix is a spec rather than code, but it is coherent: the primary/secondary swap (ungated search as primary, form as secondary) and deleting the hero tel: button are safe since the sticky bar and nav phone remain. The header (...)

#### [cro-03] /pcs-guide (the canonical PCS landing page) opens a full-screen inquiry modal on arrival

- meta: PMH | high | effort low | confirmed
- Evidence: src/App.jsx:942 const [gateOpen, setGateOpen] = useState(() =&gt; !hasSubmittedInquiry()); and :945 {gateOpen && &lt;InquiryModal onClose={() =&gt; setGateOpen(false)} /&gt;} inside PCSPage. Live 375x812 screenshot of https://pensacolamilitaryhousing.com/pcs-guide: the 'Start Your PCS Search' dialog with Name/Email/Phone/Select/Message covers the page before any content is visible. Clarity 30d: /pcs-guide PC 25 sessions scroll 49.6%, mobile 3 sessions scroll 20.3% (mobile n is too small to be conclusive).
- Impact: An on-load interstitial on a search-entry page is the pattern Google's mobile interstitial guidance penalises and it asks for five fields before the visitor has read one sentence. The page's own in-body strip ('Get My PCS Plan', App.jsx:951) already provides (...)
- Fix: Change App.jsx:942 to useState(false) and keep the strip button as the only opener. If a proactive prompt is wanted, arm it on intent instead: useEffect(()=&gt;{ if (hasSubmittedInquiry()) return; const last=+localStorage.getItem('pmh-gate-seen')||0; if (Date.now()-last &lt; 30*864e5) return; const fn=()=&gt;{ if (window.scrollY &gt; document.body.scrollHeight*0.6) { setGateOpen(true); localStorage.setItem('pmh-gate-seen', Date.now()); window.removeEventListener('scroll', fn);} }; (...)
- Verifier: Reproduced exactly. Fix is correct: useState(false) at :942 leaves the in-body strip and 'Text Gregg' sms link as openers; the optional scroll-intent effect is valid React and respects hasSubmittedInquiry(). This is the canonical PCS destination per the (...)

#### [cro-04] GC hero: H1 has no service or proof word, mobile CTAs sit below the fold on the portrait and collapse to 28px tall, and an eight-tile trust band pushes the first service card to 1,868px

- meta: GC | high | effort medium | confirmed
- Evidence: civilian-site/index.html:262 &lt;h1&gt;Pensacola real estate, done with precision.&lt;/h1&gt;; :263 lead is 7 lines (208px) on mobile; :124 .hero-portrait{...line-height:0}; :191 .hero-cta-overlay{...position:absolute;...bottom:16px} rendered inside .hero-portrait at :269; :190 .hero .btn-row{display:none} on &lt;=900px. Live 375x812: .main-banner 147px; h1 top 218; .hero-portrait 559-993; first overlay .btn-p top=909, offsetHeight=28 (desktop 1366px: same button 55px tall); .trust-band 1029-1746 (717px, 8 tiles (...)
- Impact: A visitor from a 'Pensacola realtor' or 'sell my house Pensacola' query sees a tagline with no buy/sell/Realtor word and, on a phone, no button in the first screen; when the buttons appear they are 28px tap targets (the line-height:0 inheritance) on top of a (...)
- Fix: Hero spec (mobile-first): eyebrow 'The Costin Team · Levin Rinke Realty · Pensacola'. H1 candidates: A) 'Buy or sell a Pensacola home with a certified negotiator.' B) 'Pensacola's 5.0-rated Realtor for buying and selling on the Gulf Coast.' C) 'Pensacola real estate, done with precision: buy, sell, invest.' Subhead (2 lines): '54 Google and 25 Zillow reviews, all five stars. ABR, SRS and RENE certified. Escambia, Santa Rosa and the Emerald Coast.' CTA pair: primary 'Start My Home Search' (RealScout onboarding), (...)
- Verifier: All measurements reproduce; the 28px buttons are the inherited line-height:0 from .hero-portrait. The CSS fix works; the simplest root fix is .hero-cta-overlay{line-height:1.2} plus min-height:48px on the overlay buttons if the overlay is kept. Moving the (...)

#### [cro-05] Flood-zones page: the bold FEMA effective date and the section H2 are the site's top dead-click and rage-click targets because the first FEMA link is several screens later

- meta: PMH | high | effort low | confirmed
- Evidence: public/pensacola-flood-zones-homebuyers.html:353 &lt;li&gt;New FEMA Flood Insurance Rate Maps became effective &lt;strong&gt;August 19, 2025&lt;/strong&gt;...; :387 &lt;h2&gt;New Flood Maps Took Effect August 19, 2025: What Changed&lt;/h2&gt;; :388 &lt;p&gt;This is the part most 2026 buyers have not caught up with ... &lt;strong&gt;August 19, 2025&lt;/strong&gt;; first link to https://msc.fema.gov/portal/home is at :421 and the Forerunner tools are only named in prose/FAQ. Live page (curl 2026-09-02) has the same (...)
- Impact: Readers who are highly engaged (168s) try three times to act on the date and get nothing; rage clicks on a page with 20 sessions means most readers hit it. Each of those clicks is a visitor ready to check an address, i.e. a buyer at decision stage.
- Fix: 1) Link both dates: &lt;a href="https://msc.fema.gov/portal/home" target="_blank" rel="noopener"&gt;August 19, 2025&lt;/a&gt; at :353 and :388. 2) Directly under the H2 at :387 insert an action box: &lt;div class="cta-strip"&gt;&lt;p class="cs-txt"&gt;&lt;strong&gt;Check any address on the new maps&lt;/strong&gt; (free, 60 seconds).&lt;/p&gt;&lt;div class="cs-actions"&gt;&lt;a class="cs-btn" href="https://escambiacountyfl.withforerunner.com" target="_blank" rel="noopener"&gt;Escambia County map&lt;/a&gt;&lt;a (...)
- Verifier: Reproduced. The fix is correct and low effort; the H2 id and the action box under it are the right pattern. scripts/audit-links.mjs exists, so the regex check can be added there.

#### [cro-06] Header email is a bare mailto: on both sites (three address spellings in use); desktop clicks register as dead in Clarity

- meta: BOTH | medium | effort low | narrowed
- Evidence: public/military-realtor-pensacola.html:299 &lt;a href="mailto:Gregg.Costin@gmail.com" class="banner-email"&gt;Gregg.Costin@gmail.com&lt;/a&gt; (same banner in all ~93 static pages via the factory template); src/App.jsx:233 same anchor in the SPA nav; civilian-site/index.html banner (.banner-email :88) identical. Clarity 30d: 'Gregg.Costin@gmail.com' 84 dead clicks on /military-realtor-pensacola (PC). The mailto is also the only email path in the header; the inquiry modal exists on every page but is not wired to (...)
- Impact: The header is the highest-visibility contact surface on both sites and its email affordance silently fails for a large share of desktop users, on a page that ranks for 'military friendly realtor pensacola'.
- Fix: Static + civilian templates: add data-email-link to the banner anchor and a click handler that, on (min-width:801px), prevents default, calls open() on the existing inquiry modal (the same function bound to [data-inquiry-open]) and copies the address via navigator.clipboard with a 2s toast. SPA: in Nav (App.jsx:233) add an onClick that calls setInquiryOpen(true) on desktop (lift inquiryOpen state to App so Nav and Hero share it). Keep mailto on phones. Normalise every mailto, sticky bar, schema email and NAP (...)
- Verifier: The bare mailto is real on both sites and the 84 dead clicks are in the orchestrator's Clarity data. Two corrections: (1) the proposed script depends on #inquiry-modal and [data-inquiry-open], which do not exist in the React SPA, so the SPA nav needs (...)

#### [cro-07] /pcs-home-search opens with an unlinked stock photo above the search controls (28 dead clicks on the image)

- meta: PMH | medium | effort low | narrowed
- Evidence: public/pcs-home-search.html:304 h1 'Start Your PCS Home Search: Live MLS Listings by Base'; :308 author card; :309 &lt;figure class="figure-band"&gt;...&lt;img src="/images/topics/buy.jpg" width="1600" height="900" ... fetchpriority="high"&gt; with figcaption 'Every search below opens live MLS inventory'; the base pickers (.phs-base, .phs-links) and the RealScout block (.phs-rs) follow. Clarity 30d: hero figure image 28 dead clicks. Page is the #6 entry page (13 sessions).
- Impact: The page's one job is to hand the visitor a live search; the first screen is a photo of someone else searching. Visitors click the photo, nothing happens, and the intent decays before they reach the pickers.
- Fix: Move the figure at :309 below the first .phs-base block (or delete it); make .phs-rs and a base chip row the first content after the author card. If the image stays, wrap it in &lt;a href="#phs-bases" aria-label="Jump to live search by base"&gt; and add id="phs-bases" to the first .phs-base. Add a NEW always-visible strip element (e.g. .phs-text) under the lead with the sms: button; leave #phs-strip and its JS at :412-418 untouched.
- Verifier: The unlinked hero figure ahead of the search controls is real. The finder's claim that .phs-strip is 'currently display:none and empty' misreads it: it is a conditional BAH-budget banner populated by JS, so the fix must not repurpose #phs-strip. Severity (...)

#### [cro-08] CTA taxonomy sprawl: 24 distinct primary-button labels on PMH and 17 on GC, with off-site exits styled as primaries

- meta: BOTH | medium | effort medium | confirmed
- Evidence: Label census (grep of .ip/.btn-p text, 2026-09-02): PMH static pages = 59x 'Start Your Pensacola Home Search' plus 23 one-off primaries ('Map My Rank to Neighborhoods', 'Text me the building name', 'Get My Whiting Housing Brief', 'Check My Building', ...); SPA hero 'Start Your PCS Search' (App.jsx:441), nav 'Search Homes' (:242), cta-strips 'Text (850) 266-5005 / Call / Free PCS Checklist' (military-realtor-pensacola.html strip), CtaBanner 'Call 850-266-5005 / Book a 15-Min Strategy Call / Send a Message' (...)
- Impact: Visitors moving between pages (1.8 pages/session) never see the same ask twice, so no CTA accumulates recognition, and the clever one-offs cannot be measured as one funnel step in GA4. Off-site primaries compete with the on-site lead path.
- Fix: Adopt a three-tier system and a fixed label set, enforced by the factories. Tier 1 gold (exactly one above the first H2 per page): PMH search-intent pages 'Search Homes by Base'; PMH guides 'Get My PCS Plan'; PMH sell pages 'Get My Home Value'; GC buy/search 'Start My Home Search'; GC sell 'Get My Home Value'; GC other 'Send a Message'. Tier 2 ghost (.btn-g/.il): 'Text (850) 266-5005'. Tier 3 text link: 'Free PCS Checklist' or 'Book a 15-minute call'. Restyle index.html:373 to btn-g. Implementation: add (...)
- Verifier: Core reproduced (24 PMH, 16 GC). Fix is implementable, but note the factory currently has no cta-strip hook, so the 'ctaVariant' work is new code, and GC primaries use two classes (.btn-p and .ip) that the audit rule must cover. Restyling index.html:373 to (...)

#### [cro-09] Only 15 of 93 PMH static pages have a first-screen CTA strip; the page-header hero on every static page (both sites) contains no button, and GC /buy puts its first CTA at 1,829px

- meta: BOTH | medium | effort medium | confirmed
- Evidence: grep -l cta-strip public/**/*.html = 15 files (assumable-va-loans, bah-rates, buy, military-realtor-pensacola, flood-zones, rent-vs-buy, renting-on-bah, va-loan-guide, corry-station, eglin-afb, nas-pensacola, fort-walton-beach, navarre, niceville, perdido-key). The top AI-cited page public/va-disability-property-tax-florida.html (119 Copilot citations) opens &lt;main&gt; at :320 and its first CTA is at :388 after the author card, figure and body paragraphs. Static &lt;header&gt; = h1 + .lead only (template (...)
- Impact: The most-cited and most-linked guides monetise attention only after the reader has scrolled past the point where 70-80% of sessions end (homepage scroll 21-30%, niceville 8%, bah-rates 17%). The strip pattern already exists and is visible in the first screen (...)
- Fix: Extend scripts/page-factory.mjs to inject the cta-strip after the author card on every guide with a per-type variant: PCS pages ('Orders to Pensacola? Text me your rank and report date'), VA pages ('VA loan question? Text me, I answer within 2 hours'), tax/insurance pages ('Buying in Escambia or Santa Rosa? Get the numbers for your address'), community pages ('Want a shortlist in {community}? Text me your BAH'). Run the same injection on the 78 missing pages via a one-off script. GC: add one btn-p inside (...)
- Verifier: All reproduced. Fix stands; add that scripts/page-factory.mjs must gain the injection hook (no cta-strip code exists in it today) and that /bah-rates and /communities/niceville show the strip in the first mobile screen, proving the pattern.

#### [cro-11] Inquiry form: five visible fields in one step, 1.5-1.6:1 field borders, 3.1:1 fine print, and a success state with no next action

- meta: BOTH | medium | effort low | narrowed
- Evidence: src/App.jsx:895-925 renders name, email, phone, select, textarea in one step; identical static markup public/first-time-military-homebuyer.html:600-612 and civilian-site/index.html:412-425. Computed ratios (WCAG formula): input border #444 on #2A2A2A (App.jsx:899) = 1.47:1 and on #1A2332 (.imodal input template :193) = 1.83:1, both below the 3:1 non-text minimum (WCAG 1.4.11); fine print #666 11px on #121823 (App.jsx:928, .imodal .ifine :196) = 3.10:1, below 4.5:1; labels #999 = 6.24:1 pass. Success panel (...)
- Impact: Every lead path on both sites ends in this form; each unnecessary field and each low-contrast border costs completions, and the success state discards a hot lead's next 30 seconds instead of converting it into a booked call or text.
- Fix: Borders: border:1px solid rgba(255,255,255,.40) (3.5:1 on #1A2332, 3.4:1 on #2A2A2A) or solid #8A8F99 (4.9:1 / 4.4:1), :focus{border-color:var(--gold)}; fine print color:var(--muted);font-size:12px (#A5A496 on #121823 passes 4.5:1). Two-step form: step 1 Full Name + Phone + 'What can I help with?' (button 'Next'), step 2 Email (worker-required) + optional Message with inquiryType prefilled from the page. Success panel (App.jsx:880-885, template :634, civilian :450): add &lt;a class="btn-p" (...)
- Verifier: Field count, contrast failures and the dead-end success state are all real. Two corrections: the fine-print line number and the fix's border value (0.30 alpha fails; 0.40 alpha passes at about 3.6-3.7:1 on both input backgrounds). Two-step form is fine since (...)

#### [cro-10] Desktop guide measure of about 105 characters per line on PMH, no light section rhythm on the SPA home, and near-zero iconography

- meta: BOTH | low | effort medium | narrowed
- Evidence: Icon count (grep -o '&lt;svg'): civilian-site/index.html 0; public template 1 (search icon); src/App.jsx 3. Every section uses ink #0A0F1A or panel #121823 (Section default App.jsx:352; MilitaryStory/Bases use C.panel); light tokens CREAM #F5F1E8 and LIGHT #F2F0EA are declared at App.jsx:16-18 and never used (1 match each = the declaration). Static template: main{max-width:900px;padding:48px 24px} + main p{font-size:15.5px;line-height:1.85} with no max-width (public/first-time-military-homebuyer.html:102-103) = (...)
- Impact: Long guides (many over 2,000 words) are a single unbroken dark column with 100+ character lines; that is the format most associated with 'text wall' abandonment on phones and it hides section boundaries, so scroll depth stays low even when content quality is (...)
- Fix: 1) Both templates: main p,main li{max-width:68ch} (PMH template :103, GC :98 already 760px; tighten to 68ch). 2) SPA home: alternate Section bg between C.ink and C.panel (both already exist) so section boundaries read; keep dark palette. 3) Add a 6-glyph inline SVG sprite (base, house, dollar, checklist, phone, star) at 20px gold stroke for Services cards (App.jsx:566), explore columns and the cta-strip. 4) Treat the cream 'reading band' as an optional A/B, previewed on /va-loan-guide only, with the owner's (...)
- Verifier: Code facts are correct, but the impact is misattributed: the 105-cpl measure exists only on desktop; at 375px the column is 327px wide (about 42 cpl), so 'text wall abandonment on phones' is about paragraph length and section rhythm, not measure. The light (...)

#### [cro-12] Trust presentation: 'Preferred Agent' logo bar links every partner to /about, review counts drift between sites, and quotes carry no platform link or date

- meta: BOTH | low | effort low | confirmed
- Evidence: src/App.jsx:531 heading 'Preferred Agent' over VeteranPCS, TIER 1 PCS, M.O.R.E. Network, Levin Rinke Realty, Forbes Global Properties; :541 every logo href="/about" (Levin Rinke is the brokerage and Forbes Global Properties its network, not preferred-agent programs). civilian-site/index.html:278 and :341 '54 Google Reviews', reviews.html:8 '54 Google reviews' while PMH /reviews and llms.txt report 55 (evidence file). Homepage quotes on both sites are static text with name only (App.jsx:614-631 SocialProof; (...)
- Impact: Trust blocks are the main reason a stranger picks a Realtor from a search result; a heading that overstates the relationship and counts that disagree between the two branded sites are the kind of detail a careful buyer (or a competitor) notices. Noted once, (...)
- Fix: Rename the strip 'Affiliations and Partner Networks' (or 'Member and Preferred Agent Networks' if VeteranPCS, Tier 1 and MORE list Gregg as a preferred agent; link those three to Gregg's public profile on each partner site with rel="noopener", which is third-party proof), leave Levin Rinke and Forbes as non-links. Reviews: create content/reviews.json {google:55, zillow:25, updatedAt} and have both factories and audit-civilian.mjs read it, failing the civilian audit when index/reviews/llms disagree. Quote cards: (...)
- Verifier: Reproduced. Fix correction: rather than a new content/reviews.json, extend the existing scripts/bump-review-count.mjs to walk civilian-site/ too (and merge or replace the unmerged civilian/review-sync-20260901 branch), then add the cross-file equality check (...)

Verifier-noted items outside the numbered list: PMH /reviews (the most-linked page on the site, 359 inbound links per audit-links; Clarity 10 sessions, 9.6s engagement) buries its first review quote at 1,832px on 375x812: header lead, author card (...) | GC /neighborhoods puts its only CTA at 10,403px of an 11,048px page on mobile (civilian-site/neighborhoods.html:377 'Get My Short List' button; first h2 at :352 renders at 8,247px), while all 11 neighborhood card links (...) | GC /buy on mobile: first CTA 'Set Up My Home Search' at 2,440px live (375x812), 3 screens down, on the page whose intent is highest; cro-09 only recorded the desktop 1,829px figure. Fix as in cro-09 (header button (...) | Sticky mobile Call/Text/Email bar has no page-bottom clearance on either site: template first-time-military-homebuyer.html:167 .sticky-mobile-cta{position:fixed;bottom:12px} and live greggcostin.com computed body (...) | GC nav hierarchy: the only visually emphasised tab is the off-site 'Military & PCS' pill (civilian-site/index.html:92 .banner-tabs&gt;a.mil-link{color:var(--gold);border:1px solid var(--gold-line)}, rendered as its own (...)

### Photography, media, video & rich interactive features

12 findings (4 high, 5 medium, 3 low). Strengths noted: Format adoption is complete and scripted: 376 of 376 PMH img tags and 240 of 242 GC img tags sit inside &lt;picture&gt;; every JPG/PNG in public/images has both an AVIF and a WebP sibling (0 missing), generated by an idempotent pipeline (generate-modern-images.mjs, wrap-img-with-picture.mjs, unwrap-picture.mjs, restore-grown-images.mjs) with sharp 0.34.5 in node_modules. | Alt text is top-tier on both sites: 0 missing or empty alts, 0 alts under 20 characters, averages of 69 (PMH) and 67 (GC) characters, and the 32-alt sample reads as genuine description (aircraft types, named piers, courthouse details) with local place names on 45 of 190 PMH and 24 of 38 GC alts and no keyword stuffing. | Licensing discipline is script-verified: content/blog/image-credits.json records 36 sourced images with license and creditRequired flags; all 21 published CC-BY/CC-BY-SA images carry the artist's name in a visible figcaption on every page that uses them (22nd is the unpublished milton draft), and scripts/audit-civilian.mjs lines 116-129 enforce alt, width/height and credit presence before deploy. | Social cards are unique per page: 106 PMH and 20 GC branded 1200x630 OG PNGs at 20-70 KB generated by generate-og-images.mjs, og:image:width/height declared, live 200 with correct image/png content type. | PMH hero coverage and loading discipline: 88 of 93 static pages open with a hero-band or figure-band photo, and every PMH guide, base, community and blog hero is loading="eager" fetchpriority="high" decoding="async" with width/height, the pattern GC should copy. | Cache and preload policy is deliberate and documented: public/_headers lines 25-33 explain the 30-day image TTL versus immutable hashed assets, postbuild-spa-routes.mjs line 92 strips the homepage hero preload from other route shells, and max-image-preview:large is set on 93 of 93 PMH and 102 of 103 GC pages.

Auditor notes: No Lighthouse or CrUX numbers were available (PageSpeed quota exhausted per the evidence file); all byte figures are measured from the repo, from live Content-Length headers fetched 2026-09-02, or from sharp re-encodes of the repo files run in the scratchpad (cantonment, pace-milton, va-loan-guide at 480/768/1200/1600 widths, AVIF q50 effort 6, WebP q75, mozjpeg q78). Live verification covered image headers on both domains, the GC blog lazy hero, the PMH blog hero attributes, the PMH sell drone-pilot claim, and OG cards; logo markup and the SPA /communities grid were verified in the repo and built bundle rather than by executing the SPA. Cloudflare Polish is not active (no cf-polished (...)

#### [media-01] No responsive srcset/sizes anywhere: one 1600px rendition is served to every viewport

- meta: BOTH | high | effort medium | confirmed
- Evidence: Repo scan across 93 PMH + 103 GC HTML files: 0 srcset entries with a width descriptor, 0 sizes attributes (376 PMH img tags, 242 GC). Live 2026-09-02: GET https://pensacolamilitaryhousing.com/images/communities/cantonment.avif = Content-Length 352139 (1600x900), https://greggcostin.com/images/pace-milton.webp = 788698 (1600x1200, larger than its 749 KB JPG). civilian-site/neighborhoods.html references 14 webp files = 3.63 MB for cards whose slot is .nb-grid minmax(300px,1fr) (300-500px wide). public/*.html (...)
- Impact: Mobile is 30% of Clarity sessions and the majority of Google organic (MobileSafari 25 + ChromeMobile 18 of 59). Every hero, community card and blog figure pays 4-8x the bytes it needs on phones, which directly inflates LCP on the pages with the most organic (...)
- Fix: Add scripts/generate-responsive-images.mjs (extend generate-modern-images.mjs): const WIDTHS=[480,768,1200,1600]; const ENC={avif:{quality:50,effort:6},webp:{quality:75,effort:6},jpeg:{quality:78,mozjpeg:true,progressive:true}}; for each public/images/**/*.{jpg,png} and civilian-site/images/*.jpg (skip logo-*, favicon, og): for (const w of WIDTHS.filter(w=&gt;w&lt;=meta.width)) for (const [fmt,opt] of Object.entries(ENC)) await (...)
- Verifier: Every number reproduced within 2-3 KB. Two additions to the fix so it works here: (1) all PMH static pages crop heroes to 4:3 under 640px (bah-rates.html line 78: @media(max-width:640px){.hero-band img,.figure-band img{aspect-ratio:4/3}}), so the 480w/768w (...)

#### [media-02] SPA /communities grid ships 19 bare 1600x900 JPGs (4.03 MB) into 158px cards, bypassing the Pic component

- meta: PMH | high | effort low | confirmed
- Evidence: src/App.jsx line 2299: &lt;img src={/images/communities/${slug}.jpg?v=2} ... loading="lazy"&gt; inside a 158px-tall card; the ?v=2 query defeats the Pic regex at line 171 (/^\/images\/.+\.(jpe?g|png)$/) so no AVIF/WebP source is emitted. Built bundle dist/assets/index-*.js contains the string images/communities/${i}.jpg?v=2. public/images/communities/*.jpg = 19 files, 4.03 MB total (cantonment 395 KB, cordova-park 355 KB, navarre 323 KB). AVIF siblings exist for all 19 but are never used on this route.
- Impact: /communities is one of only seven SPA routes and the hub for 19 community pages; a visitor who scrolls the grid on a phone downloads ~4 MB of JPEG for thumbnails that render at roughly 300x158.
- Fix: Replace line 2299 with &lt;Pic src={/images/communities/${slug}.jpg} alt={${n.label}, Florida: community near Pensacola} loading="lazy" decoding="async" width={1600} height={900} sizes="(max-width:640px) 100vw, (max-width:1100px) 50vw, 360px" style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}} onError={...} /&gt; and make Pic tolerate a query string (/^\/images\/.+\.(jpe?g|png)(\?.*)?$/) if cache-busting must stay. Once media-01 variants exist, Pic should emit the 480w/768w descriptors so each (...)
- Verifier: Fix is correct as written. Keep the existing onError handler (it hides the img when a slug has no photo). Making the regex tolerate (\?.*)?$ also requires stripping the query before building the .avif/.webp paths at line 173, otherwise the sources would be (...)

#### [media-04] GC lazy-loads its LCP hero figure on sell, four blog posts and one resource page (PMH does this correctly)

- meta: GC | high | effort low | confirmed
- Evidence: civilian-site/sell.html line 240 (&lt;figure class="figure-band"&gt; six lines after the h1 at 235), blog/closing-costs-florida-buyers.html, fed-rate-hike-what-it-means.html, property-taxes-escambia-santa-rosa.html, what-moves-mortgage-rates.html (figure line 252, h1 line 246), resources/florida-home-insurance.html line 239 (h1 234): the first figure-band img carries loading="lazy" decoding="async" and no fetchpriority. Live 2026-09-02: curl https://greggcostin.com/blog/closing-costs-florida-buyers first (...)
- Impact: The browser defers the largest above-the-fold element until layout completes, so LCP on every GC blog post and the sell page is pushed behind fonts, GA4 and the FUB widget. These are the pages the civilian blog engine publishes twice weekly and that IndexNow (...)
- Fix: In scripts/civilian-blog-factory.mjs and the sell/resources page templates, the first figure-band img must be &lt;img ... loading="eager" fetchpriority="high" decoding="async"&gt;; keep loading="lazy" only for figures after the first. Add to those heads: &lt;link rel="preload" as="image" href="/images/closing-costs.webp" type="image/webp" fetchpriority="high"&gt; (switch to imagesrcset/imagesizes once media-01 variants exist). Add a check to scripts/audit-civilian.mjs: fail if the first &lt;figure (...)
- Verifier: Scope is 8 pages, not 6: buy.html and resources/florida-homestead-exemption.html were missed. Corrected fix: add an eager option to figureBand() in scripts/civilian-page-lib.mjs line 35 (e.g. first=true emits loading="eager" fetchpriority="high") and have (...)

#### [media-05] Site copy promises 6K drones, 8K 360 cameras and Zillow Showcase 3D tours, but neither site hosts a single video, tour or aerial clip and there is no VideoObject anywhere

- meta: BOTH | high | effort high | confirmed
- Evidence: public/buy.html line 368: "I carry professional gear most agents do not: cinematic drones that shoot 6K at 60fps with 100MP stills, 8K 360-degree cameras, and professional 6K mirrorless cameras". public/sell.html line 360 (live-verified 2026-09-02): "I am a licensed commercial drone pilot, and every listing is produced with full-time professional photographers and cinematic equipment"; line 362: "Zillow Showcase listings ... 3D mapping, interactive floorplans, drone footage, and 360 degree virtual tours". (...)
- Impact: The strongest differentiator on the sell and remote-buyer pages is asserted with no proof, and Google/Bing/Copilot cannot index or cite media that does not exist. Remote PCS buyers (the stated audience) are the exact segment that converts on video (...)
- Fix: Video architecture, both sites. Hosting: evergreen explainers (base commute, neighborhood tours, BAH walkthroughs) on the existing YouTube channel for video SERP indexing; listing walk-throughs on Cloudflare Stream (adaptive HLS up to 4K, no recommendations, $5 per 1,000 minutes stored + $1 per 1,000 minutes delivered; 30 listings x 3 min = under $1/month storage). Embed pattern (CLS-safe, privacy-enhanced facade, no JS until click): &lt;figure class="vid" (...)
- Verifier: Confirmed as a media gap and, stated once neutrally, a substantiation risk: the strongest media claims on the buy and sell pages have no example on either site. Fix corrections: (1) treat this as a production project, not a code change; the site side is a (...)

#### [media-03] Three fetchpriority=high images per page on both sites; SPA nav logos lazy-loaded with no dimensions; 31 PMH pages (11 blog + 20 guides, all cloned from the page-factory template) ship dimensionless logos

- meta: BOTH | medium | effort low | narrowed
- Evidence: public/bases/nas-pensacola.html lines 362-363 (&lt;img fetchpriority="high" src="/images/logo-lrr.png" ...&gt; and logo-08-sm.png) plus line 413 (hero img fetchpriority="high"); civilian-site/index.html lines 234-235 + 269 (portrait). Distribution: 88 of 93 PMH pages carry 3 high-priority images, 101 of 103 GC pages carry 2. scripts/blog-factory.mjs line 308 template: &lt;img fetchpriority="high" src="/images/logo-lrr.png" alt="Levin Rinke Realty"&gt; with no width/height, producing 31 PMH pages (all (...)
- Impact: Three images marked high dilute the browser's priority signal so the real LCP hero no longer wins the queue; the SPA's lazy nav logos delay the first paint of the header and shift layout when their width resolves (CLS), the exact smell named in the brief. (...)
- Fix: 1) Patch the template first: public/first-time-military-homebuyer.html lines 263-264 become &lt;img src="/images/logo-lrr.png" alt="Levin Rinke Realty" width="834" height="472" decoding="async"&gt; and &lt;img src="/images/logo-08-sm.png" alt="The Costin Team" width="480" height="196" decoding="async"&gt; (intrinsic ratios; the banner CSS sets height and width:auto so only the ratio matters). Then sed the same two tags across public/**/*.html and civilian-site/**/*.html, removing fetchpriority from logos (...)
- Verifier: Core is real and the counts are exact; the template/source attribution was wrong and would have sent the fix to the wrong file.

#### [media-06] Article/BlogPosting image is the headshot on 80 of 93 PMH pages; no primaryImageOfPage on either site

- meta: PMH | medium | effort low | confirmed
- Evidence: Script over public/**/*.html: 93 pages carry Article or BlogPosting; 80 set "image":"https://pensacolamilitaryhousing.com/images/gregg-portrait.jpg" (1200x1200 headshot), 12 point at a page image, 1 has none. Example public/bah-rates.html Article.image = gregg-portrait.jpg while the page's own figure is /images/topics/bah-rates.jpg. The 93 ImageObject nodes are all the Organization logo (logo-08-sm.png). primaryImageOfPage: 0 pages on PMH, 0 on GC. GC blog does it right: (...)
- Impact: Google Discover, Bing/Copilot cards and AI answer thumbnails pick Article.image; 80 topic pages currently present the same headshot instead of the Blue Angels, base or neighborhood photo, wasting the strong photo library on the pages that already earn 351 (...)
- Fix: In scripts/page-factory.mjs and scripts/blog-factory.mjs set Article.image to an array of the hero in the three ratios Google asks for: "image":["https://pensacolamilitaryhousing.com/images/topics/bah-rates-1600.jpg","https://pensacolamilitaryhousing.com/images/topics/bah-rates-4x3.jpg","https://pensacolamilitaryhousing.com/images/topics/bah-rates-1x1.jpg"] (add the 4:3 and 1:1 crops to the media-01 script via sharp .resize({width:1200,height:900,fit:'cover'})), and add to WebPage: (...)
- Verifier: Fix is sound. Two practical notes: the 4:3 and 1:1 crops depend on the media-01 script existing first, so ship the backfill in two steps (step 1: point Article.image at the existing 1600x900 hero, step 2: add the crops); the backfill loop should take the src (...)

#### [media-08] Modern-format variants barely beat the JPG (22 of 126 save under 15%; one GC WebP is larger than its JPG; GC has no AVIF at all)

- meta: BOTH | medium | effort low | confirmed
- Evidence: Sharp inventory: navarre.webp 323 KB = 100% of navarre.jpg; cordova-park.webp 99%; va-loan-guide.webp 409 KB = 101% of its 405 KB jpg; civilian-site/images/pace-milton.webp 770 KB = 103% of the 749 KB jpg (live Content-Length 788698). civilian-site/images: 24 jpg + 24 webp + 0 avif. Cause in scripts/generate-modern-images.mjs lines 24-25 and 55-56: AVIF quality 55 effort 4, WebP quality 78 effort 5, encoded from the already-compressed q82 mozjpeg output of scripts/optimize-images.mjs (line 7), so noise is (...)
- Impact: The picture pipeline exists but delivers little of its promised saving; on GC the best format available is a WebP that is sometimes heavier than the JPG, so Safari and Chrome users alike get 300-800 KB heroes.
- Fix: In scripts/generate-modern-images.mjs set AVIF quality 48-50 with effort 6 and WebP quality 74 effort 6; after encoding, delete any variant whose size is &gt;= 95% of the JPG so the &lt;source&gt; falls through (add this rule to restore-grown-images.mjs). Encode from the original camera/stock file when available (fetch-stock-image.mjs already downloads 1600px originals; keep them in a non-deployed content/originals/ folder rather than re-encoding the optimized JPG). Add AVIF to the civilian pipeline: run (...)
- Verifier: Counts differ from the finder (32 of 250 variants under 15%, 5 larger than source) but the diagnosis holds. Fix corrections: there is no originals folder to encode from, so 'encode from the original' means re-downloading via the pageUrl stored in (...)

#### [media-09] SPA homepage hero is a 2000x2000 CSS background with no img, no alt, no mobile media condition; the 98 KB preload runs on phones where gradients hide it

- meta: PMH | medium | effort medium | confirmed
- Evidence: src/index.css lines 11-18: .hero-bg-image uses image-set(hero-window.avif/webp/jpg); src/App.jsx line 422: &lt;div className="hero-bg-image" style={{position:"absolute",top:180,...,backgroundSize:"auto 100%",backgroundPosition:"right top"}}&gt; with no &lt;img&gt;; line 2806 only adjusts top on mobile, nothing hides it under 900px. index.html line 13: &lt;link rel="preload" as="image" href="/images/hero-window.avif" fetchpriority="high"&gt; with no media attribute. public/images/hero-window.avif = 2000x2000, 96 (...)
- Impact: On mobile the highest-priority request on the homepage is an image the user never sees, competing with fonts and the 99 KB JS bundle; on desktop the LCP candidate cannot be an &lt;img&gt; and only paints after React renders, and the portrait has no alt text (...)
- Fix: Convert the hero to markup: inside the hero grid render &lt;Pic src="/images/hero-window.jpg" alt="Gregg Costin, military relocation Realtor, standing at a window overlooking downtown Pensacola" loading="eager" fetchPriority="high" decoding="async" width={2000} height={2000} sizes="(max-width:899px) 0px, 50vw" style={{position:"absolute",top:180,right:0,height:"calc(100% - 180px)",width:"auto",objectFit:"cover"}} className="hero-img"/&gt; and add to the App style block @media (...)
- Verifier: Fix is workable with two adjustments: React 18.3.1 is installed, so pass the attribute as lowercase fetchpriority="high" in JSX (camelCase fetchPriority is only recognized from React 19); and the alt text should describe what the photo shows without the '#1' (...)

#### [media-10] GC sell page and PMH sell/buy pages assert drone, 3D and 360 deliverables with no example, no credential disclosure and no ImageObject licensing on owned photos

- meta: BOTH | medium | effort high | narrowed
- Evidence: civilian-site/sell.html meta description promises "professional marketing, dedicated property websites" but the page body has 0 matches for gallery, virtual tour, 3D, drone, aerial or video; civilian-site has 0 iframes other than the RealScout onboarding embed (search.html line 243). PMH public/sell.html line 362 lists 3D mapping, interactive floorplans, drone footage and 360 tours as included, with no example on either site. "Part 107" appears 0 times site-wide; the only aerial photos in the library are U.S. (...)
- Impact: Sellers comparing GC against Zillow-directory agents cannot see the deliverable; PMH commute explainers (the top-cited base and BAH pages) have no aerial context; the Part 107 credential, a real trust signal near four military airfields, is unstated.
- Fix: Merge with media-05 and cut the plan to three shippable items: (1) one proof-of-media block on civilian-site/sell.html and public/sell.html: a consent-gated Matterport or CloudPano facade (poster &lt;picture&gt; plus a button that injects the iframe on click, allow="xr-spatial-tracking; fullscreen") and a 6-tile gallery from one real listing, built through page-factory so both sites share it; (2) a one-line credential sentence next to the existing 'licensed commercial drone pilot' copy on public/sell.html line (...)
- Verifier: Evidence is solid but the finding duplicates media-05 and the fix reads as a media production plan (shot lists, listing page architecture) rather than an audit fix; the Part 107 disclosure copy also asserts facts nobody has verified.

#### [media-07] No image sitemap entries on either site (0 image:image, no xmlns:image); 81 distinct PMH and 38 GC photo alts are discoverable only by crawl

- meta: BOTH | low | effort low | narrowed
- Evidence: grep -c 'image:image' public/sitemap.xml = 0, civilian-site/sitemap.xml = 0; neither sitemap declares xmlns:image. 190 unique descriptive alts on PMH and 38 on GC (avg 67-69 chars, 0 empty). scripts/page-factory.mjs appends plain &lt;url&gt; entries only.
- Impact: Google Images and Bing image search rely on image sitemaps for images that are lazy-loaded or inside &lt;picture&gt;; local-intent image queries ("Navarre Beach fishing pier", "NAS Whiting Field aerial") could surface the pages that already host these photos (...)
- Fix: Same implementation as proposed (declare xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" on &lt;urlset&gt;, emit &lt;image:image&gt;&lt;image:loc&gt;...&lt;/image:loc&gt;&lt;/image:image&gt; under each &lt;url&gt; for the hero and every figure-band image, add to the page-factory sitemap append and to the civilian sitemap writer), but rank it after media-01/04/06: Google treats image sitemaps as a discovery aid for images it cannot reach by crawling, and these images are reachable today.
- Verifier: Real gap, overstated impact and an unreproducible alt count.

#### [media-11] Nav logos are hot-linked cross-origin from pensacolamilitaryhousing.com with fetchpriority=high and no preconnect

- meta: GC | low | effort low | confirmed
- Evidence: civilian-site/index.html lines 234-235: &lt;source srcset="https://pensacolamilitaryhousing.com/images/logo-lrr.avif"&gt; ... &lt;img fetchpriority="high" src="https://pensacolamilitaryhousing.com/images/logo-lrr.png"&gt;; grep for preconnect or dns-prefetch to pensacolamilitaryhousing.com in civilian-site/index.html and buy.html = 0. Orchestrator lab: GC homepage 12 requests, so two of them open a second origin (DNS + TLS) on the critical path for every page.
- Impact: Every GC page pays a cross-origin connection before the header can paint, and the site's brand assets depend on the other property's cache policy and uptime.
- Fix: Copy logo-lrr.{avif,webp,png} and logo-08-sm.{avif,webp,png} into civilian-site/images/ and rewrite the six srcset/src URLs to local paths (sitewide sed over civilian-site/**/*.html, then re-run scripts/audit-civilian.mjs). If hot-linking must stay, add &lt;link rel="preconnect" href="https://pensacolamilitaryhousing.com" crossorigin&gt; to the head template. Pair with media-03 (drop fetchpriority from logos).
- Verifier: Fix works; two details: copy the files into civilian-site/images/ BEFORE the sed, because scripts/audit-civilian.mjs lines 118-119 fail any local /images path that does not exist on disk; and the JSON-LD logo URL in scripts/civilian-blog-factory.mjs line 42 (...)

#### [media-12] Duplicate-byte photo pairs and a declared-dimension mismatch inflate the library without adding assets

- meta: PMH | low | effort low | confirmed
- Evidence: md5 over public/images: about-deployed-crew.jpg == mil-deployed-crew.jpg (283,674 B), about-promotion.jpg == mil-promotion.jpg, about-flightsuit-awacs.jpg == mil-flightsuit-awacs.jpg, about-flightline-ocps.jpg == mil-flightline-ocps.jpg (275,592 B), about-awacs-flightline.jpg == mil-awacs-flightline.jpg, logo-horizontal.png == logo-stacked.png (1532x1416, 115 KB); each pair also carries duplicate avif/webp siblings (18 redundant files). public/rent-vs-buy-military-pensacola.html line 329 and public/reviews.html (...)
- Impact: Housekeeping rather than user-facing: wasted deploy bytes and a wrong intrinsic ratio that CSS aspect-ratio currently masks; it becomes a real CLS bug the moment that CSS rule changes.
- Fix: Delete the about-* duplicates and logo-horizontal.png, update the IMG map in src/App.jsx (lines 122-163) to the mil-* keys, and set width="2200" height="880" on the two awacs figures (or crop the file to 1600x900 through the media-01 script so the 16:9 declaration is true).
- Verifier: Fix needs one correction: the about-* keys are actively referenced in AboutPage (IMG.aboutDeployedCrew, aboutPromotion, aboutFlightsuitAwacs, aboutFlightlineOCPs, aboutAwacsFlightline; 12 usages in src/App.jsx), so repoint those five values in the IMG map (...)

Verifier-noted items outside the numbered list: PMH: none of the 93 static SEO pages declares a favicon or touch icon, and /favicon.ico serves HTML. grep for rel="icon"|rel="shortcut icon"|apple-touch-icon across public/**/*.html = 0 files (only index.html for the (...) | PMH SPA: /about ships 11 full-resolution 2000px-class photos with no dimensions on any of them. AboutPage (src/App.jsx from line 753) references 11 unique IMG keys whose files total 1,948,075 bytes as JPEG and 896,449 (...) | PMH static pages crop every 16:9 hero to 4:3 on phones while still downloading the full frame. public/bah-rates.html line 78 (same rule on all 93 pages): @media(max-width:640px){.hero-band img,.figure-band (...) | GC: the only AVIF on greggcostin.com is the two hot-linked logos. grep 'srcset="/images/[^"]*\.avif"' across civilian-site/*.html and civilian-site/*/*.html = 0 pages; civilian-site/images holds 25 jpg + 24 webp + 0 (...) | BOTH: restore-grown-images.mjs, the only guard against variants that are larger than their source, is currently a no-op. It reads public/images/_originals (scripts/restore-grown-images.mjs line 5) and that folder does (...)

### Military hub content depth & hyper-local authority (PMH)

12 findings (3 high, 6 medium, 3 low). Strengths noted: BAH dollar tables are correct and internally consistent: every spot-checked 2026 figure (FL064 E-5 $1,863/$1,644, E-6 $2,235, O-3 $2,271; FL023 E-5 $2,433, E-7 $2,841, O-3 $3,399) matches DFAS-sourced mirrors (vetcalc.org, garrisonledger.com) and is identical across all 40 files that quote it, with a single BAH_DATA object in src/App.jsx as the source of truth. | On-base housing copy names the right operators and refuses to invent numbers: Balfour Beatty 'NAS Pensacola Homes' and 'Whiting Field Homes' for the Navy bases, Corvias for Eglin and Hurlburt with the correct 'partner since 2013' (verified against Corvias/Military.com: 729 Eglin homes built since 2013), and body FAQs consistently say waits are not published and to apply the day orders arrive. | public/nas-pensacola-gates.html is a model reference page: source-dated ('verified against official Navy sources as of August 2026'), distinguishes official from unofficial claims (Corry gate 'listed 24 hours by an unofficial directory, but I couldn't confirm'), and accurately records the March 23 to May 1, 2026 weekends-only public-access episode and its resumption, matching Fox10/WEAR reporting. | Base pages are genuinely command-specific rather than generic: 350th Spectrum Warfare Wing, 33rd FW F-35A and 7th SFG sections on Eglin; 24th SOW and 492nd SOW on Hurlburt; CIWT/JCAC rating-by-rating housing on Corry; North vs South Whiting and TW-5 pipeline on Whiting; 919th SOW ART/AGR status on Duke. Body length runs 2,300-3,700 words per base with sentence overlap between siblings of only 9-26%. | The BAH vs cost-of-owning ZIP study is a real data asset: 26 ZIPs, Zillow ZHVI July 2026 vintage, explicit methodology and 'Citing this study' section, dated 2026-08-24, with a refresh queued in the blog topic queue. | The FAQ hub is broad and correctly mirrored: 60 visible &lt;summary&gt; questions matching 60 FAQPage Question objects, covering EFMP, MSEP/spouse work, Purple Star schools, Interstate Compact, TLE/TLA and PPA, plus a docs/ANNUAL-UPDATE.md runbook with primary-source URLs and a refresh calendar that most agent sites never write.

Auditor notes: Data limits: cnrse.cnic.navy.mil and travel.dod.mil returned HTTP 403 to WebFetch, so gate hours and BAH were verified against secondary DFAS-sourced mirrors (vetcalc.org, garrisonledger.com) and news reporting (Fox10, WEAR, NorthEscambia) rather than the official pages; the site's gate-hour claims showed no drift against that reporting. Corvias at Eglin/Hurlburt verified via Military.com and Corvias press releases (partner since 2013). The DoD 2026 average BAH increase of 4.2% is from the Dec 12, 2025 Military.com report of the DoD release; the AETC.af.mil article also 403'd. No Lighthouse/CrUX numbers were used. School-grade comparison used content/schools/school-grades-2026.json (...)

#### [mil-01] School letter grades on base, on-base-vs-off-base, community and schools pages are stale or wrong versus FLDOE 2026 (and versus GC /schools)

- meta: PMH | high | effort medium | confirmed
- Evidence: content/schools/school-grades-2026.json (FLDOE, retrieved 2026-08-24) vs page copy: public/pcs-schools-by-base.html:332 'Hellen Caro Elementary (A)' (FLDOE 2026 = B, was A in 2025); :322 'Cordova Park Elementary (A)' (2026 = B); :344 and :358 'Holley-Navarre Intermediate (A)' (2026 = B); public/on-base-vs-off-base-nas-pensacola.html:389 and public/bases/nas-pensacola.html:497 same Hellen Caro A; public/communities/navarre.html:419 'Holley-Navarre Intermediate, Holley-Navarre Middle, Navarre High School) are all (...)
- Impact: School quality is the number one off-base decision driver for families with orders; the site's own sister property now contradicts it, and 'A-rated' claims that FLDOE downgraded in July 2026 are the kind of YMYL error a reader (or an AI answer engine) can (...)
- Fix: 1) Write scripts/sweep-school-grades.mjs that loads content/schools/school-grades-2026.json, matches '&lt;School Name&gt; (X)' and '&lt;School Name&gt; ... A-rated' tokens across public/**/*.html, rewrites the letter to g2026, and strips every '+' or '-' suffix (FLDOE grades are A to F only). 2) Wrap each school mention as &lt;a href="https://greggcostin.com/schools/&lt;slug&gt;"&gt;Hellen Caro Elementary&lt;/a&gt; &lt;span data-fldoe="2026"&gt;(B)&lt;/span&gt; so future sweeps are token-based and the tandem (...)
- Verifier: Understated rather than overstated. My own token sweep against the JSON found the mismatch is bigger than the finder's list: 'Pine Forest High (B+)' on 4 pages (pcs-schools-by-base, on-base nas-pensacola, corry, saufley) while FLDOE has it C in 2024, 2025 (...)

#### [mil-02] Eglin on-base page still advertises a fabricated '2026 waits up to 14 months' in its meta description, OG description and Article schema while the body says wait times are not published

- meta: PMH | high | effort low | confirmed
- Evidence: public/on-base-vs-off-base-eglin-afb.html:9 &lt;meta name="description" content="Eglin AFB on-base housing is Corvias-run Eglin Family Housing with 2026 waits up to 14 months..."&gt;; :20 Article JSON-LD 'description' same string; :23 og:description same string; :431 body FAQ: 'Wait times are not published and move month to month with bedroom size, pay grade, and season.' Live: curl https://pensacolamilitaryhousing.com/on-base-vs-off-base-eglin-afb returns both 'waits up to 14 months' and 'Wait times are not (...)
- Impact: The SERP snippet and every social share state a specific number the page itself disclaims; the July 2026 fabricated-wait-time cleanup missed the head. Corvias (verified: Eglin/Hurlburt partner since 2013) does not publish waits, so this is unverifiable and (...)
- Fix: Replace the three strings in public/on-base-vs-off-base-eglin-afb.html (lines 9, 20, 23) with: 'Eglin AFB on-base housing is Corvias-run Eglin Family Housing (partner since 2013). Waits are not published and swing by season and bedroom count. Compare the BAH forfeit against Niceville or Valparaiso, 8-15 minutes out.' Then re-run the JSON-LD parse check and add a repo grep to scripts/audit-links.mjs (or a new scripts/check-claims.mjs) that fails on /waits? up to \d+ months/ anywhere in public/.
- Verifier: One scope extension: the finder's claim that no other page carries a numeric wait is wrong. public/bases/nas-pensacola.html:460 says 'Waitlists vary by rank and bedroom count: typically 3-12 months for E-5 to E-7, longer for flag officer quarters' and the (...)

#### [mil-03] Same E-5 BAH ($1,863) is translated into purchase-price ceilings that differ by up to $115,000 across pages

- meta: PMH | high | effort medium | confirmed
- Evidence: public/bah-rates.html:570 'FL064 E-5 w/ dependents ($1,863) -&gt; ~$280,000-$315,000 home' (rule at :569: multiply BAH by 150-170, principal and interest only); public/blog/bah-2026-pensacola-what-can-you-afford.html:451 'covers full PITI on roughly a $200,000-$225,000 home with zero down'; public/blog/best-pensacola-neighborhoods-by-rank-bah.html:390 'An E-5 at $1,863 clears about $225,000 to $235,000'; public/communities/milton.html:434 'supports $275K-$320K in Milton'; public/communities/perdido-key.html:453 (...)
- Impact: /bah-rates is the site's second most cited page in Copilot (54 citations) and the top Bing landing page for 'nas pensacola bah'; an E-5 who reads two pages gets two answers that differ by more than one third of the lower figure, which undercuts the whole (...)
- Fix: Create content/affordability-2026.json with one documented model (rate 6.5%, taxes 1.0% of price, insurance $2,400/yr, zero down, funding fee financed) and a computed band per grade for FL064 and FL023 (e.g. E-5 FL064 full PITI -&gt; $235K-$250K at those inputs). Render it once as a table in public/bah-to-mortgage-guide.html (the 'Rank-by-Rank 2026 Reality' H2s) and make every other page quote that band verbatim with a link, or link to the ZIP study instead of stating a number. Rewrite bah-rates.html:569-575 so (...)
- Verifier: Stronger than the finder states: the /bah-rates band is arithmetically impossible on the page's own inputs. At 6.5% over 30 years the P&I factor is 0.00632/month, so $280,000 costs $1,770 in P&I alone and $315,000 costs $1,991, i.e. the top of the band (...)

#### [mil-04] BAH year-over-year claims are wrong: '+0.5% national average over 2025' vs DoD's announced 4.2% average; per-MHA '+0.5%/+0.4%' unsupported

- meta: PMH | medium | effort low | confirmed
- Evidence: public/bah-rates.html:584 '2026 change: +0.5% national average over 2025 rates' (live: same text on https://pensacolamilitaryhousing.com/bah-rates). src/App.jsx:1186 yoyChange: '+0.5% from 2025' (FL064) and :1202 '+0.4% from 2025' (FL023), rendered at App.jsx:1021 and :1256 on /pcs-guide. Primary-source check: DoD released 2026 rates 11 Dec 2025 with an average 4.2% increase (military.com, 12 Dec 2025: 'Military households will receive an average 4.2% increase in their Basic Allowance for Housing in 2026'); (...)
- Impact: A wrong national figure on the most-linked BAH page (298 inbound links) is an easy credibility hit for anyone who saw the December headlines, and the FAQ dodges the question the query literally asks.
- Fix: Change bah-rates.html:584 to '2026 change: DoD average +4.2% nationally (released 11 Dec 2025, effective 1 Jan 2026); FL064 and FL023 moved less than the average and vary by grade (E-5 with dependents FL064 +1.6%).' Replace the two yoyChange strings in src/App.jsx with the same wording or compute them from a bah-2025.json you add alongside bah-2026.json (per-grade delta shown in the table). Rewrite the FAQ answer to state the E-5/E-6/O-3 2025 vs 2026 figures and link /bah-rates.
- Verifier: Fix is correct. Suggested wording is fine; the per-MHA '+0.5%/+0.4%' strings have no source in the repo and should be replaced by per-grade deltas computed from a bah-2025.json, not a single MHA-wide percentage (DoD does not publish an MHA average).

#### [mil-05] Commute times contradict each other across pages and there is no commute tool, only prose (some of it with hedging language left in)

- meta: PMH | medium | effort medium | confirmed
- Evidence: Gulf Breeze to NAS Pensacola: public/bases/nas-pensacola.html:35, :551 'Gulf Breeze is the top choice - 15-minute commute' and :561 '15-min commute'; public/faq.html:115 '15 min to NAS Pensacola'; public/on-base-vs-off-base-nas-pensacola.html:443 '15-min commute'; src/App.jsx:978 '15-20 min'; versus public/communities/gulf-breeze.html:42, :393, :434 'Plan on 20-30 minutes to the West Gate' and public/bases/saufley-field.html:42 'Gulf Breeze is 25-30 minutes east'. Navarre to Hurlburt ranges 15-20 / 20-25 / 25 / (...)
- Impact: Commute is the second decision axis after schools; a reader comparing the base page with the community page sees a 2x disagreement. The hedging sentences read as unedited AI drafting on a page positioned as expert local knowledge.
- Fix: Add content/commutes.json: {origin: 'Gulf Breeze', base: 'NAS Pensacola', gate: 'West Gate', miles: 14, offPeakMin: 22, peakMin: 30, source: 'Google Maps typical traffic, 07:00 Tue, verified 2026-09'} for every community x base pair. Render one 'Commute matrix' table on each base page and a per-community row on each community page from that file (extend scripts/page-data.mjs), and add a 30-line select-origin/select-base widget to public/pcs-home-search.html that reads the same JSON. Sweep prose numbers to match (...)
- Verifier: Core reproduced exactly for Gulf Breeze (2x disagreement, live on both pages) and the shipped hedge sentences. The Navarre spread is narrower than the finder's '15-20 / 20-25 / 25 / 20-30' (I found only 25 and 20-30). Fix is implementable: (...)

#### [mil-06] Seven on-base pages share a 56-sentence template (59-64% duplicate) and the Eglin and Duke Field base pages have no on-base housing section

- meta: PMH | medium | effort medium | narrowed
- Evidence: Sentence-level scan (sentences of 8+ words inside &lt;main&gt;): on-base-vs-off-base-corry-station.html 64% of 87 sentences appear verbatim on a sibling page; saufley-field 64% of 88; hurlburt-field 62% of 91; nas-pensacola 62% of 90; duke-field 60% of 93; eglin-afb 60% of 93; nas-whiting-field 60% of 94. Body length 1,572-1,676 words each. Corry Station and Saufley Field have no family housing of their own (both point to Balfour Beatty NAS Pensacola Homes, on-base-vs-off-base-saufley-field.html:427). (...)
- Impact: Seven near-identical pages dilute the on-base topic and invite Google to pick one as canonical; meanwhile the two base pages where readers actually ask 'is there housing?' say nothing, so the 'duke field housing' query lands on a generic template.
- Fix: 1) Add an 'On-base housing at Eglin (Corvias Eglin Family Housing)' H2 to public/bases/eglin-afb.html and a 'Where 919th SOW members live and lodge' H2 to public/bases/duke-field.html using only sourced facts (operator, application office, eligibility for Duke Field and 7th SFG); do not add unit counts without a citation. 2) Merge on-base-vs-off-base-saufley-field into on-base-vs-off-base-nas-pensacola (Saufley has no housing of its own) with a 301 in public/_redirects; for Corry, either keep the page and rewrite (...)
- Verifier: Two corrections. (1) The premise that Corry Station 'has no family housing of its own' is wrong: on-base-vs-off-base-corry-station.html states Corry Village is the on-station neighborhood, and Balfour Beatty's own site lists Corry Village and Lighthouse (...)

#### [mil-07] Five missing cornerstone assets that Bing query data already shows demand for

- meta: PMH | medium | effort high | confirmed
- Evidence: docs/seo-baselines/bing-keywords-2026-08-22.csv (Aug 2026, 335 rows): (a) 'buying a home near nas pensacola' 5 impr pos 4.8, 'property for sale near nas pensacola' 4 pos 4, 'homes for sale near nas pensacola' 2+2+2, 'va qualified homes for sale in pensacola' 2, while the only listing page public/pcs-home-search.html has 949 body words and no base-radius framing; (b) per-base BAH queries 'bah hurlburt field' 8 pos 6.9, 'hurlburt field bah' 6, 'hurlburt field bah rates' 4, 'nas pensacola bah' 7 pos 6.3, 'nas corry (...)
- Impact: These are the queries where the site already appears on page one without a dedicated page; a purpose-built page for each is the cheapest ranking gain on the domain and fills real gaps in the hub (unaccompanied members and per-base BAH are two of the largest (...)
- Fix: Build with scripts/page-factory.mjs, in this order: 1) /homes-for-sale-near-nas-pensacola (and /homes-for-sale-near-eglin-afb): radius framing (5/15/30 minutes from the gate), the ZIP rows from the data study, IDX deep links per ZIP using the greggc.levinrinkerealty.com /results/ template, VA-condo note. 2) /bah/nas-pensacola, /bah/corry-station, /bah/whiting-field, /bah/eglin-afb, /bah/hurlburt-field, /bah/duke-field: each an H1-level page rendered from BAH_DATA (move it to content/bah-2026.json) with the full (...)
- Verifier: Confirmed. Two fix corrections: (a) scripts/page-factory.mjs assembles public/&lt;slug&gt;.html from a fragment; nested slugs like /bah/nas-pensacola are not a proven path through the factory, so either use flat slugs (/bah-rates-nas-pensacola, (...)

#### [mil-08] December 2026 BAH rollover is a 40-file manual sweep; the runbook lists only a fraction of the locations and no sweep script exists

- meta: PMH | medium | effort medium | confirmed
- Evidence: grep for the 2026 E-5 figures ($1,863 or $2,433) = 40 files: 7 bases, 7 blog posts, 11 community pages, 13 guides, src/App.jsx; the phrase '2026 BAH' appears in 93 public HTML files. docs/ANNUAL-UPDATE.md section 1 lists src/App.jsx, public/bah-rates.html, public/faq.html, public/bases/*.html, perdido-key 'and other community pages', bah-to-mortgage-guide, and omits public/blog/*.html (7 posts), bah-vs-cost-of-owning-pensacola.html, all on-base-vs-off-base-*.html, renting-on-bah, rent-vs-buy-military, (...)
- Impact: On roughly 15 December 2026 every one of these pages becomes wrong at once, and given the number of locations the realistic outcome is a partial update that leaves 2026 numbers in blog schema and community pages for months, which is exactly the stale-YMYL (...)
- Fix: 1) Move BAH_DATA out of src/App.jsx into content/bah/2026.json (same [grade, withDeps, withoutDeps] shape) and import it in App.jsx. 2) Add scripts/sweep-bah.mjs that reads content/bah/&lt;year&gt;.json and rewrites tokens marked &lt;span data-bah="FL064|E-5|with"&gt;$1,863&lt;/span&gt; across public/**/*.html, including inside JSON-LD strings, then rewrites '2026 BAH' -&gt; '2027 BAH' where a data-bah-year attribute is present. 3) Add a check step (npm run check:bah) that fails the build if any prior-year figure (...)
- Verifier: Confirmed at 39 files (finder said 40; the difference is immaterial). Fix is sound: Vite imports JSON natively, so moving BAH_DATA to content/bah/2026.json and importing it in src/App.jsx works without config; the data-bah token approach also handles JSON-LD (...)

#### [mil-09] Base-adjacent service pages are orphaned or nearly so, and overlap the base pages they should feed

- meta: PMH | medium | effort low | confirmed
- Evidence: Inbound internal links (grep across public/, index.html, App.jsx): public/veteran-realtor-destin.html 0, public/military-realtor-hurlburt-field.html 1, public/crestview-military-relocation.html 2, versus public/military-realtor-pensacola.html 92. veteran-realtor-destin has 3,378 body words and its own Destin STR/condo research but no link from public/communities/destin.html, bases/eglin-afb.html or bases/hurlburt-field.html. military-realtor-hurlburt-field.html H2s 'What 2026 BAH Buys at Hurlburt (MHA FL023)' and (...)
- Impact: A 3,400-word page with zero inbound links cannot rank or pass authority, and three Hurlburt pages repeating the same BAH and neighborhood sections split what should be one strong Hurlburt cluster.
- Fix: 1) Add links: communities/destin.html and bases/eglin-afb.html and bases/hurlburt-field.html -&gt; /veteran-realtor-destin; bases/hurlburt-field.html 'Related Guides' and the Explore block 'Bases' column -&gt; /military-realtor-hurlburt-field; communities/crestview.html and bases/duke-field.html -&gt; /crestview-military-relocation (extend scripts/build-related-guides.mjs mapping). 2) Trim the duplicated BAH table and neighborhood list out of military-realtor-hurlburt-field.html and replace with two-sentence (...)
- Verifier: Confirmed exactly. scripts/build-related-guides.mjs exists, so extending its mapping is the right mechanism. The optional re-slug should also update sitemap.xml, llms.txt and the on-page canonical, and keep the 301 in public/_redirects.

#### [mil-10] Base pages lack a standard arrival-logistics module (DBIDS, lodging, FFSC/M&FRC, EFMP, spouse employment) and carry bulk freshness stamps

- meta: PMH | low | effort medium | confirmed
- Evidence: Across all 7 public/bases/*.html: 'DBIDS' 0 mentions, 'EFMP|Exceptional Family' 0, 'Navy Lodge|Navy Gateway|Air Force Inn' 0, 'Fleet and Family|M&FRC|MFRC|FFSC' 0, 'spouse' 0-5 (only hurlburt-field 5). Sitewide DBIDS appears in 4 files, EFMP in 1 (faq.html), MSEP/spouse employment in 4, Fisher House in 0. Freshness: every base page shows 'Reviewed & updated · July 2026' with dateModified 2026-07-06, while public/sitemap.xml lastmod for all 7 is 2026-08-23 (bulk stamp). Contrast: public/nas-pensacola-gates.html (...)
- Impact: A PCSing family's first-week questions (which gate, where to sleep, where to register EFMP, spouse job resources) are answered only on the FAQ or not at all, so the base pages read as strong on neighborhoods and weak on arrival; and July stamps on pages (...)
- Fix: Add an 'Arrival logistics' component to scripts/page-data.mjs rendered on each base page: gate + DBIDS link (to /nas-pensacola-gates for the Navy bases, to the Eglin/Hurlburt VCC pages), first-night lodging by name (Navy Gateway Inns & Suites NAS Pensacola, Navy Lodge Pensacola, Eglin Inns, Commando Inn) linking /military-lodging-pensacola, FFSC (Navy) or M&FRC (Air Force) office name, the EFMP liaison office, and MSEP/MyCAA links. Keep the module short (120-180 words) and source-dated separately from the (...)
- Verifier: Confirmed. Low severity is right. Fix is implementable through scripts/page-data.mjs; keep lodging names sourced (Navy Gateway Inns & Suites and Navy Lodge Pensacola are real, Eglin Inns and Commando Inn are real) and link the existing (...)

#### [mil-11] Comparison and rent pages are thin (860-1,400 body words) and the rent trio overlaps without a data spine

- meta: PMH | low | effort medium | confirmed
- Evidence: Body words inside &lt;main&gt; excluding Related/Explore blocks: nas-pensacola-vs-hurlburt-field.html 864, niceville-vs-crestview.html 944, pcs-home-search.html 949, renting-on-bah-pensacola.html 1,052, rent-vs-buy-military-pensacola.html 1,140, gulf-breeze-vs-navarre.html 1,176, bah-vs-cost-of-owning-pensacola.html 1,381 (raw counts of 2,600-3,300 are inflated by about 1,670 words of nav/footer boilerplate). renting-on-bah repeats the FL064/FL023 BAH table (rows at :td&gt;$1,794 ... $1,863) that already lives on (...)
- Impact: The 'vs' pages target high-intent comparison queries but offer less than the community pages they summarize, so they neither rank nor convert; the rent cluster is three medium pages instead of one authoritative one.
- Fix: Give each comparison page a data table generated from the shared JSON files (BAH band from mil-03, commute from mil-05, FLDOE grades from mil-01, ZIP cost from the data study, flood zone share) so the page carries unique structured comparison data, then 300-500 words of judgment. Make renting-on-bah the rental cornerstone (mil-07 item 6), drop its duplicate BAH table for a link, and keep rent-vs-buy as the decision page with a 'tour length' calculator that reuses the rent-or-sell calculator code in (...)
- Verifier: Confirmed; low is appropriate. Fix depends on the shared JSON files proposed in mil-01/03/05, so sequence it after those.

#### [mil-12] Blog cadence is bursty and every neighborhood/BAH post hard-codes 2026 figures inside FAQPage schema

- meta: PMH | low | effort low | confirmed
- Evidence: public/blog/index.json publish dates: 2026-03-20, 03-28, 04-05, 04-10, 04-15, 06-10, then 08-12 x2, 08-13, 08-22, 08-23: zero posts in May and July, five in twelve August days. Body length is strong (2,567-5,109 words in &lt;main&gt;), each with BlogPosting + FAQPage schema. 7 of 11 posts contain $1,863 or $2,433 (see mil-08), e.g. best-pensacola-neighborhoods-by-rank-bah.html:38 inside JSON-LD. dateModified was bulk-set to 2026-08-12 on six older posts.
- Impact: Mega-guide quality is already there; the risk is freshness signals (bulk dateModified) and rate rollover inside schema, not depth.
- Fix: Keep the Tuesday engine on a real weekly rhythm (draft-first is fine) and pull two of the mil-07 cornerstones into it as posts that later get promoted to guides. Mark BAH tokens in posts with data-bah attributes so scripts/sweep-bah.mjs covers blog schema. Stop bulk dateModified stamps on posts unless body text changed.
- Verifier: Confirmed. Low severity is right; this is a process note that rides on the mil-08 sweep.

Verifier-noted items outside the numbered list: mil-01 is larger and reaches the SPA: beyond the finder's list, 'Pine Forest High (B+)' appears on 4 pages (public/pcs-schools-by-base.html, on-base-vs-off-base-nas-pensacola.html, -corry-station.html, (...) | The /bah-rates buying-power shortcut is arithmetically impossible on its own inputs, not merely inconsistent with other pages: public/bah-rates.html:569-570 says BAH covers P&I at 6.5% 'plus taxes and insurance', then (...) | A second unsourced numeric wait claim sits on the flagship base page: public/bases/nas-pensacola.html:460 'Waitlists vary by rank and bedroom count: typically 3-12 months for E-5 to E-7, longer for flag officer (...) | The school-grade fix cannot be a pure name-token sweep: pages use names that do not exist in the FLDOE file ('Warrington Middle' is now WARRINGTON PREPARATORY ACADEMY, 'Central School K-8' vs CENTRAL SCHOOL, 'Bailey (...) | The freshness stamp problem also applies to the on-base cluster and community pages, not only the 7 base pages: every public/on-base-vs-off-base-*.html and community page that carries school grades was last stamped (...)

### Civilian brand content, neighborhood guides & luxury positioning (GC)

9 findings (1 critical, 3 high, 4 medium, 1 low). Strengths noted: FAQ page is top-tier: 22 questions in four intent groups (choosing an agent, buying, selling, market/area, working with us), 3,473 words, direct answers that name trade-offs and costs (all-in selling cost range, property-tax reset after purchase, insurance variance by roof age and flood zone), mirrored into FAQPage schema (civilian-site/faq.html:217-247). | Schools asset is a genuine moat: 82 FLDOE-data pages with three-year grade history, per-subject achievement percentages, graduation rate, retrieval date, district links, and a fair-housing-safe 'we do not rate, rank, or recommend schools' disclaimer (civilian-site/schools/gulf-breeze-high-school.html). | Resource guides have real depth: florida-home-insurance.html 3,073 words and florida-homestead-exemption.html 2,776 words, each with county-specific filing steps, deadlines, FORTIFIED/Citizens/portability sections and FAQs; the insurance page already earns Copilot citations on non-military queries per docs/ai-search-strategy.md. | Blog production discipline is enforced in code: BLOG-CONTRACT.md requires 1,100+ words, 4+ FAQs, short paragraphs, no perishable numbers without a session-found source; the property-tax post cites five primary sources (escpa.org, srcpa.gov, county tax collector, clerk) and every post carries Article + FAQPage + BreadcrumbList + ImageObject with CC-credited imagery. | The 'honest trade-offs' voice is already right and distinctive: every neighborhood card names a cost ('character homes come with character-home maintenance', 'the growth is outpacing the roads'), and the 'Which neighborhood fits you' section sorts by buyer type (walkable, schools, value, water, retiring, investing, Alabama side). The depth is missing, not the voice. | Entity groundwork for E-E-A-T is strong: Person #gregg carries hasCredential (ABR, SRS, RENE, MRP, FMS), award, areaServed (7 cities), knowsAbout, sameAs, a Wikidata QID in llms.txt, and the PMH footer already prints the swimlane ('PensacolaMilitaryHousing.com for military & PCS families · GreggCostin.com for civilian buying & selling').

Auditor notes: DATA LIMITS: No Lighthouse/CrUX or Semrush volumes this run; keyword targets below are from live SERP shape (WebSearch 2026-09-02) and Bing/Copilot context in evidence.md, not measured volumes. Live checks used curl against the owner's own domains. No repo files were modified. Prior-audit fixes (em-dash purge on repo copy, FAQ mirrors, review-count drift) were not re-reported; the em dash on the 825bayshore subdomain title is new because that page is outside the repo and outside check-em-dashes.mjs. FIVE MUST-BUILD CORNERSTONES FOR GC (build in this order): A. /neighborhoods/east-hill (flagship, proves the template). Targets: 'East Hill Pensacola homes for sale', 'East Hill Pensacola real (...)

#### [gc-content-01] GC owns zero neighborhood pages; every 'deep guide' link sends civilian buyers to military-framed PMH pages

- meta: GC | critical | effort high | confirmed
- Evidence: civilian-site/neighborhoods.html:227,237,247,257,267,277,287,297,307,317,327 = 11 nb-link anchors, all href=https://pensacolamilitaryhousing.com/communities/*; civilian-site/index.html:356-370 'Where we work' = 10 more links to PMH community pages; live curl https://greggcostin.com/neighborhoods confirms the same 11 PMH hrefs and https://greggcostin.com/east-hill, /neighborhoods/east-hill, /gulf-breeze all return 404; live sitemap has 101 URLs, none is a neighborhood page. Destination pages: (...)
- Impact: The civilian site cannot rank for any 'homes for sale' / 'living in' neighborhood query because it has no URL to rank; SERP for 'East Hill Pensacola homes for sale' is Zillow, Redfin, RE/MAX, Levin Rinke (Gregg's own brokerage), gibbons-realty and (...)
- Fix: Create scripts/civilian-neighborhood-factory.mjs that clones civilian-site/resources/first-time-home-buyer.html (head, banner, modal, footer) and injects a per-area fragment from content/civilian-neighborhoods/&lt;slug&gt;.fragment.html plus data JSON (price band, commute minutes to downtown/airport/NAS, zoned schools linked to /schools/&lt;slug&gt;, flood note, housing stock era, 4-6 FAQ pairs). Emit Place + WebPage + FAQPage + BreadcrumbList JSON-LD. Output civilian-site/neighborhoods/&lt;slug&gt;.html for (...)
- Verifier: Fully reproduced code + live. Fix is directionally right but references a 'template spec in notes' that an implementer will not have; make it self-contained: clone a proven civilian page (civilian-site/resources/first-time-home-buyer.html) as the template (...)

#### [gc-content-02] Zero luxury, waterfront, new-construction, retiree or remote-worker coverage despite the Forbes Global Properties award in the entity

- meta: GC | high | effort high | confirmed
- Evidence: grep -il across civilian-site/*.html, resources/*.html, blog/*.html: 'luxury' 0 files, 'vacation rental' 0, 'remote work' 0, '55+' 0, 'golf' 0, 'gated' 1 file, 'waterfront' 2 files (7 occurrences, all passing mentions), 'new construction' 1 file (4 occurrences), 'condo' 4 files; civilian-site/index.html:41 Person award 'Forbes Global Properties Rookie of the Year 2025' and knowsAbout limited to 6 generic items; live sitemap: no /waterfront, /luxury, /new-construction, /relocation URL (all 404). SERP 'Perdido Key (...)
- Impact: The premium lane that justifies a separate civilian brand has no landing page; buyers searching waterfront, new construction, retirement or relocation intent cannot find Gregg on greggcostin.com and instead meet competitors whose pages segment by water type (...)
- Fix: Build /waterfront (cornerstone B in notes: five water types, price bands, flood V vs AE, seawall/dock/elevation certificate, SRIA leasehold on Pensacola Beach, post-SB 4-D condo reserves, IDX deep links per water type), /new-construction (builders by corridor: Pace, Milton, Beulah, Navarre; builder contract vs FAR/BAR, inspection rights, closing cost credits, warranty), and fold retiree and remote-worker sections into /moving-to-pensacola (cornerstone E). Expand index.html Person knowsAbout to include 'Waterfront (...)
- Verifier: Reproduced. Two citation corrections: knowsAbout lives on the RealEstateAgent at line 41 and the award on the Person at line 44 (finder merged them). I did not re-run the 'Perdido Key waterfront homes' SERP, but the East Hill SERP shows (...)

#### [gc-content-03] No market data on the site that sells 'data-driven pricing'

- meta: GC | high | effort medium | confirmed
- Evidence: grep across civilian-site: 'market report' 0 files; 'median' 1 file (blog only, 9 occurrences); 'days on market' 1 occurrence (faq.html line 233 says 'ask for the current days-on-market picture'); civilian-site/index.html:327 'Data-driven pricing'; sell.html:250 'Pricing strategy, not a guess' with no numbers on the page; live https://greggcostin.com/market-report and /pensacola-market-report 404. The quarterly report is queued in content/blog/topic-queue.json as 'pensacola-housing-market-q3-2026' (audience (...)
- Impact: Sellers and AI answer engines have nothing on GC to cite for 'Pensacola home prices', 'is the market slowing', 'days on market Pensacola'; the site's central seller promise (CMA over Zestimate) is asserted, not demonstrated. A living market page is also the (...)
- Fix: Create civilian-site/market.html as a living 'Pensacola Housing Market Report' page (cornerstone C in notes) refreshed quarterly by a script that reads a hand-maintained content/civilian-market/&lt;quarter&gt;.json (median price, closed sales, months of supply, DOM, list-to-sale ratio for Escambia, Santa Rosa, and by city) sourced from Pensacola Association of Realtors / Florida Realtors monthly releases with the source URL and retrieval date printed. Emit Article + Dataset + FAQPage schema, 4-6 static SVG (...)
- Verifier: Reproduced; off-by-one line citation only. Fix is implementable on Cloudflare Pages static HTML. Practical caveats to add: the JSON must be hand-entered from PAR/Florida Realtors releases (no API), the page must print source URL + retrieval date (...)

#### [gc-content-04] Seller side has no pricing guide, net-sheet page or sold portfolio; the only marketing showcase is a $109,900 1BR condo site

- meta: GC | high | effort medium | narrowed
- Evidence: civilian-site/sell.html:258 'A dedicated single-property website for qualifying listings. See a live example: 825bayshore.greggcostin.com'; live curl https://825bayshore.greggcostin.com &lt;title&gt;825 Bayshore Dr #803, Pensacola FL 32507 - $109,900 Waterfront 1BR&lt;/title&gt; (em dash in title, page marked sold, not in repo). sell.html external links: valuation = 2x https://greggcostin.realscout.com/whats-my-home-worth only; no /sold, /sell/pricing, /sell/costs page in sitemap; grep 'net sheet' 1 file (2 (...)
- Impact: A premium seller evaluating Gregg sees a process page, a third-party AVM link and, as proof of marketing, a sub-$110K sold condo. There is no page for 'how much is my house worth Pensacola', 'cost to sell a house in Florida', or a sold gallery with (...)
- Fix: Build civilian-site/sell/what-your-home-is-worth.html (worked $350K net sheet: doc stamps $0.70 per $100, owner's title policy at promulgated rate, prorations, payoff, negotiable commission; pricing strategy; prep that pays) and civilian-site/sold.html generated from content/civilian-sold.json (city, price band, DOM, list-to-sale ratio, photo with credit; ItemList schema). Replace the sell.html:258 example with a mid or upper-band listing site when one exists; separately edit the 825bayshore site (outside the (...)
- Verifier: Core gap (no pricing guide, no net-sheet page, no sold gallery, sub-$110K showcase) is real. The 'page marked sold' detail is not reproducible; drop it. The listing site is not in the repo, so its em dashes cannot be fixed by the repo's check-em-dashes.mjs; (...)

#### [gc-content-05] Blog E-E-A-T: no visible author byline, Article author @id unresolved on the page, half the posts cite no external source

- meta: GC | medium | effort low | confirmed
- Evidence: civilian-site/blog/closing-costs-florida-buyers.html:251 visible byline is 'August 31, 2026 · The Costin Team Blog' (no author name, credentials, or reviewed date); same file JSON-LD Article "author":{"@id":"https://greggcostin.com/#gregg"} but grep '"@type":"Person"' in that file = 0 (the #gregg Person node exists only in index.html and team.html); external source links: closing-costs 0, what-moves-mortgage-rates 0, fed-rate-hike 0 (has a prose 'Sources:' line), property-taxes 5 (escpa.org, srcpa.gov, tax (...)
- Impact: Per-page structured-data validators see an author reference with no resolvable Person on the page, and readers see an anonymous house blog; both weaken the 'who wrote this and why trust them' signal that answer engines weight for YMYL money topics, and two (...)
- Fix: In scripts/civilian-blog-factory.mjs: (1) render a byline block under the H1: 'By Gregg Costin, Realtor (ABR, SRS, RENE), Levin Rinke Realty · Published &lt;date&gt; · Updated &lt;date&gt;' linking to /team; (2) inline the full Person node ({@type:Person,@id:#gregg,name,jobTitle,hasCredential,sameAs,url:/team}) into every post's @graph instead of a bare @id reference; (3) add a gate: at least 2 external links to primary sources (gov, Freddie Mac, FL Statutes, county appraiser) per post, failing the build (...)
- Verifier: Reproduced exactly. Actually 3 of 4 posts (not half) have zero external links; fed-rate-hike has a prose 'Sources' line only. Fix works: change civilian-blog-factory.mjs line 41 to inline the full Person object (or add it to the @graph), render a byline (...)

#### [gc-content-06] The neighborhoods hub is a card list with no price, commute or school data and opens with a text wall on mobile

- meta: GC | medium | effort medium | narrowed
- Evidence: civilian-site/neighborhoods.html: intro 74 words; 13 cards at 33-47 words each (node count); 0 dollar figures in &lt;main&gt;; 8 commute/minute mentions; only 3 H2s in 2,015 words; JSON-LD = ItemList + FAQPage + WebPage (no Place nodes); &lt;title&gt;Pensacola Neighborhoods Guide | The Costin Team&lt;/title&gt;. evidence.md screenshot note: first card sits ~1,500px down on a 375px phone.
- Impact: Even after guides exist, the hub is the page that must rank for 'best neighborhoods in Pensacola' and 'where to live in Pensacola'; today it offers a reader no price band, no commute number, no school grade, no flood note, and no way to compare areas, so it (...)
- Fix: Rebuild civilian-site/neighborhoods.html around a comparison table (price band from the market page, commute minutes to downtown / NAS / airport, zoned high school + FLDOE grade linked to /schools/&lt;slug&gt;, flood note, stock era, vibe tags) placed above the intro on mobile, an inline SVG map, then the 13 cards linking to on-site guides; add Place nodes (name, geo, containedInPlace) inside the ItemList items; retitle to &lt;=65 chars, e.g. 'Where to Live in Pensacola: Neighborhoods, Prices, Commutes' (58 (...)
- Verifier: Substance holds (no price bands, no comparison, no Place nodes, text-first mobile). Word count overstated. The proposed retitle 'Pensacola Neighborhoods Guide: Where to Live and What It Costs | The Costin Team' is ~80 chars and would FAIL (...)

#### [gc-content-07] 'Moving to Pensacola' relocation intent is unowned; a military-housing competitor and movers own the SERP

- meta: GC | medium | effort medium | confirmed
- Evidence: grep 'relocat' = 33 passing occurrences across 20 files but no page targets it; live /moving-to-pensacola 404; SERP 'moving to Pensacola FL guide' #1 = pensacolarealtymasters.com (also listed in evidence.md as a new military-housing competitor), then movingtofloridaguide, bfhappymovers, movingtopensacola.com, uphomes.com (2,800-3,000 words, byline 'Ryan Fitzgerald, May 15, 2023', cost-of-living table, pros/cons, FAQ). PMH /pcs-guide covers only the orders-driven version.
- Impact: Retirees, remote workers, healthcare and Navy Federal hires arriving without orders are the exact civilian audience GC exists for, and the query that catches them earliest has no GC answer; the top result belongs to a firm that also competes for military (...)
- Fix: Build /moving-to-pensacola (cornerstone E in notes, 3,000-4,000 words): cost of living with insurance and property-tax reset explained, neighborhood matrix linking to the new guides, jobs and commutes, hurricanes honestly (evacuation zones, insurance), schools, retiring here (homestead + senior exemptions, healthcare), remote workers and second homes, the move checklist (homestead by March 1, DL, registration), pros and cons, FAQ. Link from index hero secondary CTA, /buy 'Relocating?' block, /neighborhoods, (...)
- Verifier: Reproduced code + live + SERP. One fix correction: buy.html has no 'Relocating?' block today (relocation appears only in the inquiry select), so the fix must ADD that block rather than link from it. Page must pass audit-civilian (title &lt;=65, 120-165 (...)

#### [gc-content-08] Listing surface is an iframe plus city-level IDX links; no price-band, property-type or neighborhood-level deep links

- meta: GC | medium | effort medium | narrowed
- Evidence: civilian-site/search.html:243 &lt;iframe src=https://greggcostin.realscout.com/onboarding ...&gt;; 13 greggc.levinrinkerealty.com/map/ links filtered only by city[] (Pensacola, Gulf Breeze, Pace, Cantonment, Navarre, Perdido Key, Fort Walton Beach, Milton, Destin, Niceville, Crestview, Mary Esther); no waterfront, condo, new-construction or price-band filters; buy.html:262-276 repeats the same city links; no /listings or featured-listings page in sitemap.
- Impact: Every high-intent click leaves greggcostin.com at the city level, so a buyer wanting East Hill bungalows or Gulf-front condos gets a whole-city map; the site captures no listing-level engagement and the future guides have no matching 'homes for sale now' link.
- Fix: On each new neighborhood guide and /waterfront, add a 'Homes for sale in &lt;area&gt; right now' block using the verified template https://greggc.levinrinkerealty.com/results/?newsearch=1&newsearchresults=1&state=12&condition=or&status_types%5B%5D=sale&property_category%5B%5D=residential&sort_by=1&pagenum=1&city%5B%5D=&lt;City&gt;&pricemax=&lt;N&gt;&bedrooms=&lt;n&gt;&bedmore=1 (city + price band + beds are verified); test any subdivision or zip parameter in a browser before shipping it. Add (...)
- Verifier: City-level-only deep links and no on-site listing surface are real. Two corrections: (1) the existing /map/ links already sit on the greggc subdomain, so leads from them ARE attributed; /results/ is preferable because it is the verified server-rendered (...)

#### [gc-content-09] 82 school pages link only to the neighborhoods hub, not to the areas they serve

- meta: GC | low | effort low | confirmed
- Evidence: civilian-site/schools/gulf-breeze-high-school.html: 3 links, all href=/neighborhoods (hub); text 'the neighborhood guide for where each community sits'; no school-to-neighborhood mapping exists in schools.html (sections: Elementary, Middle, High, Combination, Charter, Private).
- Impact: The strongest owned asset on GC (82 FLDOE data pages) passes all its internal equity to one thin hub instead of to the neighborhood pages families actually shop, and gives school-first buyers no path to 'homes zoned for this school'.
- Fix: Add a separate overlay file content/schools/school-neighborhoods.json keyed by district+num (e.g. "57-0211": ["gulf-breeze","navarre"]) that scripts/schools-factory.mjs merges at build time; render a 'Neighborhoods this school typically serves (verify zoning with the district)' block on each school page linking /neighborhoods/&lt;slug&gt;, and mirror 'Schools zoned for this area' with the FLDOE grade badge on each guide. Keep the existing fair-housing wording.
- Verifier: Reproduced. Fix needs one correction: the school JSON is regenerated from the FLDOE spreadsheet each July (memory: annual refresh), so a hand-maintained zonedNeighborhoods array added to that file would be wiped on refresh.

Verifier-noted items outside the numbered list: Alabama and Okaloosa coverage is claimed in copy but absent from the entity: civilian-site/index.html:308/396 'Licensed in Florida & Alabama', index.html:44 Person 'licensed in Florida and Alabama', (...) | Investor lane is promised by the entity and the form but has no content: index.html:41 knowsAbout 'Investment property', every page's inquiry select offers 'Investment Property' (buy.html:315,382), faq.html has 'Do you (...) | The coverage map disagrees across the three GC surfaces: index.html chips (358-367) list 10 areas including Destin and Niceville; neighborhoods.html has 13 cards with no Destin or Niceville but with Orange Beach/Gulf (...) | The 825bayshore.greggcostin.com listing subdomain violates the house style on a Gregg-branded domain: live HTML contains 19 em dashes including the &lt;title&gt;, and it is outside the repo so (...) | GC blog posts carry dateModified identical to datePublished on all 4 posts (closing-costs 2026-08-31, fed-rate-hike 2026-09-01, property-taxes 2026-08-27, what-moves-mortgage-rates 2026-08-24) and no visible 'Updated' (...)

### E-E-A-T, credentials, reviews, disclosures & Fair Housing compliance

12 findings (2 high, 7 medium, 3 low). Strengths noted: Brokerage-name compliance under Florida 61J2-10.025 is complete: 'Levin Rinke Realty' appears on 94 of 94 PMH HTML files (index.html plus every public/ page) and on 102 of 103 GC pages (only 404.html lacks it), in the banner logo, the footer address block and the JSON-LD worksFor/memberOf; the office address and 'Licensed in Florida & Alabama' ride with it everywhere. | Every static page on both sites carries a full plain-language disclaimer (not legal/tax/mortgage advice, not affiliated with DoD or VA, agency relationship begins only with a signed brokerage agreement, Equal Housing Opportunity) at public/faq.html:1318 footer and the civilian footer; the self-serving Review/AggregateRating schema was correctly removed in July 2026 and has not crept back (0 matches on both reviews pages). | PMH YMYL pages have top-1% citation discipline for an agent site: 'Sources and References' blocks with primary sources such as travel.dod.mil BAH lookup, VA Pamphlet 26-7, floridarevenue.com, escpa.org, srcpa.gov, msc.fema.gov, floodsmart.gov and floir.gov (7 to 11 authority links on va-disability-property-tax-florida, pensacola-flood-zones-homebuyers, bah-rates, va-loan-guide). | Freshness and authorship signals on PMH are real, not decorative: 93 of 93 static pages show a visible 'Last updated: &lt;date&gt;' stamp plus dateModified in schema, and all 11 blog posts carry an author card with the military and Realtor credentials and a 'Reviewed & updated' month. | GC substantiates its ranking claims the right way: '#34 of 4,100+ Realtors by volume & transactions as of Aug 1, 2026' and '#3 . #4 . #10 out of 450+ Summer 2026' are dated and scoped in visible text (civilian-site/index.html:293-300) and repeated verbatim in the Person award array, and the GC buy/faq/index pages already carry NAR-settlement-compliant buyer-agent compensation language. | The GC /schools hub is built fair-housing-safe (FLDOE data only, explicit 'attendance zones change, verify with the district' disclaimer) and a dedicated review-request funnel (reviews.greggcostin.com, live 200) exists and is linked from the PMH reviews page and FAQ.

Auditor notes: Data limits: no Lighthouse/CrUX/PageSpeed data this run (quota exhausted per evidence file), none used. Legal framing is a compliance-audit observation, not legal advice: Florida 61J2-10.025 requires the brokerage name (present) but not the license number, so eeat-04 is a trust-signal gap rather than a violation; the FCC's 2024 one-to-one TCPA consent rule was vacated by the Eleventh Circuit in January 2025, but prior express written consent for marketing texts and CTIA/10DLC opt-in expectations still make the missing checkbox in eeat-02 material. Confirm the exact FL license prefix (SL vs another) and the Alabama license number on the DBPR and AREC lookups before publishing them; (...)

#### [eeat-01] No privacy policy, terms, or accessibility statement exists on either site; PMH /privacy is a soft-404 SPA shell

- meta: BOTH | high | effort low | confirmed
- Evidence: Repo: find public civilian-site -iname '*privacy*' -o -iname '*terms*' -o -iname '*accessib*' returns nothing; grep for href to privacy/terms/accessibility across index.html, src/App.jsx, public/, civilian-site/ = 0 matches. Live 2026-09-02: https://greggcostin.com/privacy 404, /privacy-policy 404, /accessibility 404, /terms 404; https://pensacolamilitaryhousing.com/privacy returns 200 with the identical 54,811-byte homepage shell and title 'Pensacola Military Housing | Gregg Costin, Realtor(R) | PCS & VA Loan' (...)
- Impact: Google Analytics Terms of Service and the FollowUpBoss/GA4 data-sharing require a posted privacy policy; a site that captures phone numbers for FUB texting with no policy is exposed under TCPA/CTIA scrutiny and reads as untrustworthy to Google's YMYL quality (...)
- Fix: Create public/privacy.html and civilian-site/privacy.html (plus /accessibility on each) from the existing page templates; Cloudflare Pages serves the static file ahead of the SPA fallback, so no _redirects edit is required. Add a footer link in src/App.jsx Footer (~line 746), scripts/postbuild-spa-routes.mjs line 65 shell footer, the page-factory footer, and the civilian footer; append both URLs to each sitemap.xml and llms.txt, then run scripts/audit-civilian.mjs before the GC deploy.
- Verifier: Reproduced in full, code and live. Fix wording needs one correction: Cloudflare Pages serves a real file at public/privacy.html before evaluating the /* fallback, so creating public/privacy.html (via scripts/page-factory.mjs) is sufficient, no _redirects (...)

#### [eeat-09] Pre-settlement 'buyer representation costs you nothing' language on the PCS Guide, and no buyer-agent compensation disclosure on /buy or /faq

- meta: PMH | high | effort low | confirmed
- Evidence: src/App.jsx:1049 (PCSPage FAQ, rendered on the SPA route /pcs-guide, the canonical PCS destination): Having your own representation costs you nothing (the builder pays the commission). public/buy.html: 0 matches for 'compensation' or 'commission'; public/faq.html: 4 'compensation' matches, all VA disability compensation (lines 275, 395), 0 buyer-agent compensation; public/pcs-home-search.html: 0. Only 3 PMH pages mention the settlement (public/first-time-military-homebuyer.html:393, (...)
- Impact: Since August 2024 NAR MLS participants may not represent buyer-broker services as free; the sentence is exactly that representation and sits on the highest-engagement PMH page (Clarity: /pcs-guide 28 sessions, 48% scroll). The military buyer pages also never (...)
- Fix: Rewrite src/App.jsx:1049 and public/crestview-military-relocation.html:369 using the wording already on public/military-realtor-pensacola.html:404, then add the same FAQ (question 'How is my buyer's agent paid on a VA loan?') to public/buy.html, public/faq.html and public/pcs-home-search.html, both visible and in each FAQPage JSON-LD, with the line 'VA Circular 26-24-14 (as extended) allows a veteran to pay reasonable buyer-broker compensation when the seller does not; we always try to have the seller cover it.'
- Verifier: Reproduced. Scope is two live instances, not one: the SPA PCS Guide FAQ (highest-engagement PMH page) and the Crestview static page at line 369. The existing compliant paragraph on public/military-realtor-pensacola.html:404 can be copied verbatim into (...)

#### [eeat-02] Lead forms lack SMS/call disclosure language and any consent capture that FUB texting or 10DLC registration would expect

- meta: BOTH | medium | effort low | narrowed
- Evidence: src/App.jsx:934 and :2675, civilian-site/contact.html:270 and :337, and 91 PMH + 105 GC static pages: &lt;p&gt;By submitting, you agree to be contacted by The Costin Team. Your information is never sold or shared.&lt;/p&gt; is the entire consent text. grep -rl 'type="checkbox"' across public/ and civilian-site/ = 0 files. No occurrence of 'text message', 'msg & data', 'STOP', 'automated', 'consent is not a condition' on either site (grep = 0). Phone field is optional and the string does not mention texting, (...)
- Impact: Marketing texts to a consumer-provided mobile number require prior express written consent that names the sender and discloses that texts (including automated ones) will be sent and that consent is not a condition of purchase; carrier 10DLC registration for (...)
- Fix: Replace the footnote in src/App.jsx:934/:2675, civilian-site/contact.html:270/:337 and the static inquiry modal with: 'By submitting you agree that The Costin Team at Levin Rinke Realty may contact you by phone, email, and text message about your inquiry. Consent is not a condition of purchase; message and data rates may apply; reply STOP to opt out. See our Privacy Policy.' Add an optional checkbox 'Yes, text me updates' (name smsOptIn) only if FUB automated texts are used. Because the costin-contact worker (...)
- Verifier: Gap is real but 'high' and the framing overstate it. A consumer who submits an inquiry with a phone number gives prior express consent for manual, inquiry-related calls and texts; the written-consent (PEWC) bar applies to autodialed or marketing texts, which (...)

#### [eeat-03] EHO statement and disclaimer absent from the prerendered HTML of 6 of 7 PMH SPA routes and from index.html; GC 404 page has no footer

- meta: PMH | medium | effort low | narrowed
- Evidence: Live 2026-09-02 (curl, pre-JS HTML): https://pensacolamilitaryhousing.com/ EHO=0, /about 0, /pcs-guide 0, /contact 0, /communities 0, /mortgage-calculators 0 (only /blog has 1). Repo: index.html has 0 'Equal Housing' matches; dist/about.html, dist/pcs-guide.html, dist/contact.html, dist/communities.html, dist/mortgage-calculators.html all EHO=0; the EHO text exists only inside the React Footer disclaimer at src/App.jsx:746 and is injected after hydration. The prerender shell footer in (...)
- Impact: The seven SPA routes include the homepage, About, Contact and the canonical PCS Guide, which is where crawlers, AI engines, no-JS clients and HUD-style compliance reviews read the page. Fair Housing advertising guidance expects the EHO statement or logo on (...)
- Fix: 1) In scripts/postbuild-spa-routes.mjs line 65 append ' . Equal Housing Opportunity' and a second &lt;p&gt; with the same Disclaimer paragraph used at src/App.jsx:746 so the shell matches the hydrated footer. 2) Add the same static footer block to index.html so / matches. 3) Give civilian-site/404.html the standard civilian footer (brokerage, EHO, family cross-link). 4) Optional: add a small inline EHO SVG (fill currentColor) beside the words in one preview page first per the standing rule, then roll out through (...)
- Verifier: Facts reproduced, but severity is overstated. Every human visitor with JS sees the EHO statement and full disclaimer once React hydrates, so the exposure is limited to crawlers, no-JS clients and AI engines reading raw HTML, which is a trust-signal and (...)

#### [eeat-05] Google review count drifts across sites and within the PMH reviews page (54 vs 55); reviews are hand-pasted with no sync and GC never links the review funnel

- meta: BOTH | medium | effort medium | confirmed
- Evidence: Live 2026-09-02: greggcostin.com/ '54 Google reviews' x3, /reviews x5, /faq x2, /llms.txt line 5 '54 Google'; pensacolamilitaryhousing.com/ '55 Google reviews', /reviews '55 Google reviews' x3 AND '54 reviews' x2 on the same page (public/reviews.html:38 and :462 'Google Business Profile (54 reviews) and Zillow agent profile (25 reviews)' vs line 38 intro '5.0 rating across 55 Google reviews'). Repo: GC 54 in civilian-site/index.html, reviews.html, faq.html, llms.txt, llms-full.txt; PMH 55 in index.html:539. (...)
- Impact: A reader who opens both sites, or the PMH reviews page alone, sees two different counts for the same Google profile, which is exactly the inconsistency AI engines and quality raters treat as a freshness/accuracy signal. GC, the site meant to win civilian (...)
- Fix: 1) Extend scripts/review-counts.mjs line 91 to include walk('civilian-site') and add the '(NN reviews)' lowercase pattern to its replacement set, then run --set-google 55 --set-zillow 25 so both sites match public/reviews.html; fix public/reviews.html:38 and :462 by hand first. 2) Merge or delete branch civilian/review-sync-20260901. 3) Add the reviews.greggcostin.com button to civilian-site/reviews.html and a 'Leave a review' footer link on GC. 4) If automating, resolve the real place_id via Places Find Place (...)
- Verifier: Reproduced live and in repo. Two fix corrections: (1) the repo already has a deterministic sync tool, scripts/review-counts.mjs; the gap is that it excludes civilian-site and the lowercase parenthetical pattern, so extend it rather than inventing a new JSON (...)

#### [eeat-06] Hero stat 'Top 0.8% Pensacola Agents' has no substantiation and contradicts the About page's 'top 5%'; '#1' H1 carries no basis note

- meta: PMH | medium | effort low | confirmed
- Evidence: src/App.jsx:469 hero stat ["Top 0.8%", "Pensacola Agents", "/reviews"] links to /reviews, where grep '0\.8' public/reviews.html matches only CSS (rgba 0.8), no substantiation. index.html:581 prerender text 'Zillow Premier Agent . Top 0.8% Pensacola Area'. src/App.jsx:825 (AboutPage) 'recognized as a Zillow Premier Agent in the top 5% of Pensacola-area Realtors' vs src/App.jsx:840 'Zillow Premier Agent . Top 0.8%' on the same page. src/App.jsx:430 H1 'Pensacola's #1 military relocation REALTOR(R)' with no (...)
- Impact: Florida Rule 61J2-10.025 and NAR Code of Ethics Article 12 both require advertising to present a true picture; an unsourced percentile that contradicts itself on the About page is the kind of claim a competitor complaint or a brokerage review targets, and AI (...)
- Fix: Use one Zillow figure with a dated basis in src/App.jsx:469, :825, :840 and index.html:581 ('Zillow Premier Agent, top X% of Pensacola-area agents by reviews and sales, as of Sept 2026'), and add a one-line basis for the #1 claim under the hero eyebrow or as the stat-card title attribute, mirrored in the RealEstateAgent description in index.html.
- Verifier: Reproduced exactly; the same About page says top 5% in prose and top 0.8% in the credentials grid. Fix is sound and respects the owner's decision to keep the #1 headline (basis note only). Medium stands.

#### [eeat-07] GC blog posts have no visible author byline or author box; only schema names the author

- meta: GC | medium | effort low | confirmed
- Evidence: civilian-site/blog/closing-costs-florida-buyers.html:246-250 visible header = H1, lead, then 'August 31, 2026 . The Costin Team Blog' and the photo credit; grep for 'written by|by gregg costin|about the author|author-card' = 0 in all 4 GC posts (closing-costs, fed-rate-hike, property-taxes, what-moves-mortgage-rates); the only visible 'Gregg Costin, Realtor' is the footer at line 336. JSON-LD "author":{"@id":"https://greggcostin.com/#gregg"} resolves on-page. PMH posts do it right: public/blog/*.html author-card (...)
- Impact: YMYL money posts (closing costs, property taxes, Fed rate) with no named human author read as anonymous content to Google's helpful-content and E-E-A-T systems and to AI engines summarizing them; the civilian blog engine is producing two posts a week into (...)
- Fix: Add the byline and end-of-article author card to the civilian-blog-factory template exactly as proposed, but source the Google review count from scripts/review-counts.mjs output (or public/reviews.html) instead of hard-coding it, add id="gregg" to civilian-site/team.html, and rebuild the four posts through the factory, then run scripts/audit-civilian.mjs.
- Verifier: Reproduced. The visible byline is the brand ('The Costin Team Blog'), not a person; only schema names Gregg. Fix spec is implementable in scripts/civilian-blog-factory.mjs; note the credential line should reuse the review count from the sync script so it (...)

#### [eeat-08] GC YMYL resource guides cite zero primary sources while the PMH equivalents cite 7 to 11

- meta: GC | medium | effort low | confirmed
- Evidence: Outbound authority links (gov/mil/official, excluding social and vendor hosts): civilian-site/resources/florida-homestead-exemption.html = 0 external, 0 authority; civilian-site/resources/florida-home-insurance.html = 0, 0; civilian-site/resources/first-time-home-buyer.html = 1 (msc.fema.gov); civilian-site/blog/property-taxes-escambia-santa-rosa.html = 2 (escpa.org, srcpa.gov). PMH: public/va-disability-property-tax-florida.html 11 authority links, public/pensacola-flood-zones-homebuyers.html 7 (floir.gov, (...)
- Impact: Homestead exemption and Florida home insurance are tax and insurance YMYL topics; guides with no citations to Florida DOR, the county appraisers, Citizens or FLOIR are the weakest E-E-A-T pages on the civilian site and directly compete with the PMH twins (...)
- Fix: Add a 'Sources and References' block (pattern from public/bah-rates.html:612-621) to the three GC guides with floridarevenue.com Taxpayers_Exemptions, escpa.org, srcpa.gov, leg.state.fl.us Fla. Stat. 196.031 (homestead); citizensfla.com, floir.com, floodsmart.gov, msc.fema.gov, myfloridacfo.com and mysafeflhome.com (insurance); consumerfinance.gov, hud.gov counseling, floridahousing.org (first-time buyer); link each block to /resources/useful-links; bake the block into the civilian resource template; also add (...)
- Verifier: Reproduced. One nuance the finder missed: the authority links already exist on GC's useful-links page, so the cheapest fix is a Sources block per guide plus a link to /resources/useful-links. The 'PMH florida-homestead-exemption-military' twin only cites (...)

#### [eeat-10] Neighborhood safety characterizations ('safest', 'very low crime') on base and blog pages are Fair Housing steering risk

- meta: PMH | medium | effort low | confirmed
- Evidence: public/bases/hurlburt-field.html:443 &lt;p&gt;&lt;strong&gt;Navarre (Santa Rosa County): the safest default for families; public/blog/living-in-gulf-breeze-pros-cons.html:38 (FAQ schema) and :360-361, :472, :477: 'very low crime for the region', 'low crime is one of the few claims about Gulf Breeze that every source', 'Aggregators consistently place it among the safest communities in the area, and AreaVibes grades its crime an A+'; public FAQ text 'I pull neighborhood-level crime data for every showing' (2 (...)
- Impact: HUD and NAR fair-housing guidance tell licensees not to characterize an area as safe or low-crime because those labels function as proxies for protected classes; the agent's own claim that he pulls crime data for every showing makes it a practice, not a (...)
- Fix: Edit public/bases/hurlburt-field.html:443, public/blog/living-in-gulf-breeze-pros-cons.html:38/360-361/472/477 and public/communities/cantonment.html:35/407 as the finder proposed (sourced pointers to FDLE UCR and the local police annual report, delete the AreaVibes A+ line, replace 'I pull neighborhood-level crime data for every showing' with 'I will point you to the official FDLE and local police data sources for any address'), regenerate the two FAQPage JSON-LD blocks, and add a short Fair Housing statement to (...)
- Verifier: Reproduced, and the finder under-counted: the cantonment community page carries the 'Is Cantonment safe' FAQ (in schema and visible) and the 'crime data for every showing' line, so three pages need edits, two of them with FAQPage JSON-LD that must be (...)

#### [eeat-04] License numbers absent from both sites and from Person schema (only the Wikidata identifier is present); the recorded FL number needs verification before use

- meta: BOTH | low | effort low | narrowed
- Evidence: grep -rn -i '171694|SL[0-9]{5,7}|license #|lic\. #' across index.html, src/App.jsx, public/, civilian-site/ = 0 matches; live https://greggcostin.com/team license#=0. NAP-MASTER-SHEET.md records 'FL license (yours): #171694 (as shown on realtor.com)'. Person schema on 93 PMH pages lists hasCredential (MRP, FMS, ABR, SRS, RENE) but no identifier PropertyValue; GC Person #gregg (civilian-site/team.html) has award and hasCredential but no license identifier. Footers say only 'Licensed in Florida & Alabama'.
- Impact: Florida does not mandate the license number in advertising (brokerage name is the requirement and is present), so this is a trust signal gap rather than a violation: the license number is the one credential a consumer or an AI engine can verify against DBPR (...)
- Fix: Confirm the exact FL sales-associate number (SL-prefixed) on myfloridalicense.com and the Alabama number on arec.alabama.gov, then add 'FL Lic. SLxxxxxxx . AL Lic. xxxxx' to the footer compliance block on both sites and the SPA shells, and append PropertyValue identifiers (propertyID 'Florida DBPR Real Estate License' / 'Alabama Real Estate Commission License') to the existing identifier array in the Person JSON-LD of the page-factory template, civilian template and index.html.
- Verifier: Core is true: no license number anywhere on either site. But Florida Rule 61J2-10.025 requires the brokerage name (present on every footer), not the license number, so this is a verifiability nicety, and the number in NAP-MASTER-SHEET ('#171694', six digits) (...)

#### [eeat-11] NAP strings differ from the GBP canonical and between the two sites (email in three forms, address punctuation, two RealEstateAgent entities)

- meta: BOTH | low | effort low | confirmed
- Evidence: Email: PMH uses gregg.costin@gmail.com in 95 files (570 occurrences, incl. index.html:101,212,378,540 and App.jsx:2614,2858 sticky bar) AND Gregg.Costin@gmail.com in 35 files (147, incl. App.jsx:240 banner and :738); GC uses Gregg.Costin@gmail.com only (104 files, 320); GBP canonical per NAP-MASTER-SHEET.md is greggcostin@gmail.com (0 occurrences on either site). Address: both sites print '220 W. Garden Street' (PMH 379, GC 210) while the GBP canonical is '220 W Garden St, Pensacola, FL 32502'; Suite 125 (...)
- Impact: Gmail treats the three email spellings as one mailbox, so deliverability is fine; the cost is entity-resolution noise for Google's knowledge graph and AI engines that string-match NAP across the site, GBP, realtor.com and LinkedIn, on a brand query where (...)
- Fix: Normalize to one email spelling by scripted replace on both sites (including src/App.jsx:240 and :738 and the civilian banner), set schema streetAddress to '220 W Garden St' on both templates, add reciprocal sameAs between https://greggcostin.com/#team and https://pensacolamilitaryhousing.com/#agent, and align Person jobTitle to one string.
- Verifier: Reproduced; low is correct (same Gmail mailbox, no deliverability impact, minor entity-resolution noise). Fix is fine.

#### [eeat-12] A handful of generic lowercase 'a realtor' uses in FAQ/prose (not testimonials or keyword phrases) and no NAR trademark attribution line

- meta: BOTH | low | effort low | narrowed
- Evidence: Visible-text counts after stripping scripts: PMH 'a realtor' 9, 'realtors' 4, 'military realtor' 13, 'Realtors' 18, plain 'Realtor' 395, with the registered form only in the SPA H1 (index.html/App.jsx:432 'REALTOR&reg;') and 4 'Realtor(R)' occurrences; GC 'a realtor' 15, 'realtors' 2, 'Realtors' 13, 0 uses of the (R) form. Titles: 'Military Realtor Pensacola FL | Gregg Costin, Retired USAF', 'Gregg Costin, Pensacola Realtor | The Costin Team'. Owner's NAP sheet deliberately uses 'Realtor' plain (no symbol) for (...)
- Impact: NAR's Membership Marks rules allow the term only as a member identifier, capitalized, ideally with (R), and never as a synonym for real estate agent; local association enforcement is rare but brokerage compliance reviews do cite it, and the fix costs nothing.
- Fix: Rewrite only the generic non-testimonial uses (e.g. public/military-realtor-pensacola.html:38/404 'work with a realtor' -&gt; 'work with a buyer's agent', 'Do I need a realtor to rent' -&gt; 'Do I need an agent to rent', and the equivalent GC FAQ lines), leave client quotes, URLs, titles and the 'military realtor' keyword phrase untouched, and add one footer line on both sites: 'REALTOR is a registered trademark of the National Association of REALTORS.' Add a lowercase-'a realtor' check to (...)
- Verifier: Core is real but small and partly untouchable: several 'a realtor' hits are inside verbatim client testimonials that must not be edited, 'realtors' plural appears 0 times in visible HTML, and 'military realtor' (133 PMH uses) is the target keyword the site (...)

Verifier-noted items outside the numbered list: Wikidata entity Q140446886, used as the primary identifier and sameAs on BOTH sites, does not exist: curl https://www.wikidata.org/wiki/Q140446886 = HTTP 404 and the API (action=wbgetentities&ids=Q140446886) returns (...) | Client review cards on both sites carry no date: public/reviews.html:399-404 pattern is stars, quote, name, 'Verified Google Review'; civilian-site/reviews.html:267 pattern is stars, quote, name, 'Local Guide . (...) | The PMH About page contradicts itself in two adjacent blocks (src/App.jsx:825 'top 5% of Pensacola-area Realtors' vs :840 'Top 0.8%'); the finder folded this into eeat-06 but it deserves its own line in any fix list (...)

### Cross-domain synergy, cannibalization & internal-link equity map

12 findings (5 high, 6 medium, 1 low). Strengths noted: The swimlane split is already real at the text level: outside /reviews, no GC/PMH pair exceeds 3% 5-gram Jaccard (homestead 2.7%, insurance 2.8%, sell 2.2%, first-time 1.6%, buy 1.5%, FAQ 0.2%), and every PMH twin carries the military modifier in both title and H1 (18 of 19 community H1s name a base; homestead/insurance/first-time titles say 'Military'). This is top-tier discipline for a two-domain operation. | The standing cross-link rule is fully enforced in code: 102 of 103 GC pages carry the nav pill and footer family line, 93 of 93 PMH static pages carry &lt;p data-costin-sites&gt;, the SPA footer matches (App.jsx:742), and both llms.txt files describe the sister site in plain language (public/llms.txt:191, civilian-site/llms.txt:31). No nofollow leakage in either direction. | GC already deep-links the right way on the paired guides with descriptive anchors: resources/florida-home-insurance -&gt; /florida-home-insurance-military ('Florida home insurance guide for military families'), resources/florida-homestead-exemption -&gt; /florida-homestead-exemption-military, schools -&gt; /pcs-schools-by-base, blog property-tax -&gt; /va-disability-property-tax-florida, buy -&gt; /va-loan-guide and /zero-down-home-loans, sell -&gt; /rent-or-sell-pcs-pensacola and /cash-offer-pensacola, plus 7 links to the shared /mortgage-calculators. | PMH's five data-civilian-xlink callouts (buy.html:388 'Buying without a military affiliation?', sell.html:379, cash-offer, rental-management, rent-or-sell) are the correct pattern: intent-qualified, in body copy, deep-linked to GC /buy and /sell. The fix for synergy-05 is to scale this pattern, not invent a new one. | Core NAP and profile signals agree on 100+ pages per site: one address (220 W. Garden Street), one phone (+1-850-266-5005), one brokerage URL, one Zillow profile URL and one Google Maps place URL appear identically in sameAs on both domains, so the entity foundation is sound once the dead Wikidata pointer is removed. | Both domains already surface for the quoted brand query ('"gregg costin" pensacola' shows PMH /, PMH /about and greggcostin.com/ in slots 7-9), and GC's /team page already has AboutPage schema with mainEntity #gregg, so the brand-gap fix is a page and a few profile-field edits rather than a rebuild.

Auditor notes: DATA LIMITS: No Lighthouse/CrUX/Semrush volumes this run (quota and API units exhausted per evidence.md). GBP 'website' field, Zillow/LinkedIn/Homes.com website fields are not verifiable from code or curl; recommendations on those are owner actions. Wikidata deletion verified three ways (EntityData 404, wbgetentities 'missing', logevents delete record 2026-07-07). Similarity numbers come from scratchpad sim.mjs (5-word shingles on visible text with header/nav/footer/dialog stripped; word-bag cosine on words &gt;3 chars). OVERLAP MATRIX, top 10 pairs by shingle Jaccard (19 GC pages x 93 PMH pages): 1) GC /reviews &lt;-&gt; PMH /reviews 29.69% (cosine 82%); 2) GC / &lt;-&gt; PMH /reviews (...)

#### [synergy-01] Both sites still cite a Wikidata item (Q140446886) deleted 2026-07-07; 100 files, ~204 occurrences plus a &lt;link rel="me"&gt;, all live-served

- meta: BOTH | high | effort medium | narrowed
- Evidence: Wikidata API wbgetentities?ids=Q140446886 returns {"Q140446886":{"id":"Q140446886","missing":""}}; Special:EntityData/Q140446886.json = HTTP 404 'No entity with ID Q140446886 was found'; logevents: type=delete by user WikiBayer 2026-07-07T18:49:48Z, comment 'RfD: Does not meet the notability policy. Wikidata is not LinkedIn.'; wbsearchentities 'Gregg Costin' = 0 results. Repo: PMH 96 files / 191 occurrences (index.html:175,231,420 sameAs + identifier; public/military-realtor-pensacola.html:43 identifier (...)
- Impact: The one 'identifier' that was supposed to reconcile the Person across two domains now resolves to a 404 on every page of both sites. Entity reconciliation for the knowledge panel and AI grounding gets a dead pointer, and the audit gate may be enforcing its (...)
- Fix: 1) Remove the URL from every sameAs and the identifier PropertyValue in public/**/*.html, index.html (also delete index.html:62 &lt;link rel="me"&gt;), civilian-site/**/*.html and civilian-site/llms.txt; 2) delete the check at scripts/audit-civilian.mjs:168 (otherwise the gate fails), retire scripts/add-wikidata-entity.mjs, update docs/PRESS-RESPONSE-TEMPLATES.md; 3) fixing the template page public/first-time-military-homebuyer.html is enough for page-factory.mjs, but verify civilian-page-lib.mjs and (...)
- Verifier: Core finding is fully real and live-verified, but 'critical' overstates it: a dead sameAs/identifier is a wasted and mildly negative entity signal, not a ranking or indexing break. Counts corrected (PMH 195 not 191, GC 9 not 5) and the fix as written would (...)

#### [synergy-02] One person, two Person @ids and two RealEstateAgent entities with drifting attributes and no @id cross-reference

- meta: BOTH | high | effort medium | confirmed
- Evidence: GC: civilian-site/index.html:41 RealEstateAgent @id https://greggcostin.com/#team; :44 Person @id https://greggcostin.com/#gregg, jobTitle 'Realtor', 3 awards, 9 sameAs. PMH: index.html:95 RealEstateAgent @id https://pensacolamilitaryhousing.com/#agent, :207 LocalBusiness #localbusiness, :362 Person @id https://pensacolamilitaryhousing.com/#person-gregg jobTitle 'Realtor, Military Relocation Specialist'; public/military-realtor-pensacola.html:43 Person with 1 award and sameAs of only 2 URLs (wikidata + (...)
- Impact: Google and LLM entity resolvers see two distinct Person nodes and two distinct business nodes that merely link to each other's homepages. Awards, credentials and review counts earned on one domain do not accrue to the other, which is exactly the brand-query (...)
- Fix: Adopt one canonical Person node: keep https://greggcostin.com/#gregg as THE @id (name domain = person domain) and make every PMH Person block use that same @id string (a JSON-LD @id may live on another host); keep PMH's #agent/#localbusiness but set their founder/employee to {"@id":"https://greggcostin.com/#gregg"} and add "sameAs":["https://greggcostin.com/#team"] on #agent while GC #team gets "sameAs":["https://pensacolamilitaryhousing.com/#agent"]. Unify jobTitle to 'Realtor' everywhere and carry the military (...)
- Verifier: Code-verified in full. Cross-host @id references are valid JSON-LD, so the proposed single-Person approach works. Add: also collapse the two Person nodes inside PMH index.html (:172 nested and :362) and fix the three remaining RealEstateOrganization types (...)

#### [synergy-04] GC /neighborhoods has no neighborhood pages of its own; its 11 'deep guide' links send civilian readers to PMH community pages whose H1s are military-framed on 18 of 19

- meta: GC | high | effort high | narrowed
- Evidence: civilian-site/neighborhoods.html:237 'Gulf Breeze deep guide' -&gt; https://pensacolamilitaryhousing.com/communities/gulf-breeze; 13 such links on the page (hub outlinks to PMH: 13, the most of any GC page). Live: greggcostin.com/neighborhoods deep-guide anchors resolve to pensacolamilitaryhousing.com 9/9; greggcostin.com/neighborhoods/gulf-breeze = HTTP 404. PMH community H1s: 'Gulf Breeze, FL: The #1 Choice for NAS Pensacola Military Families', 'Cantonment, FL: Maximum Home for Minimum BAH Near NAS Pensacola', (...)
- Impact: greggcostin.com cannot rank for any civilian neighborhood query ('living in Gulf Breeze FL', 'East Hill Pensacola homes') because it has no page to rank; the click it does earn drops a civilian buyer onto an NAS-Pensacola-framed page, an intent mismatch that (...)
- Fix: Build civilian-site/neighborhoods/&lt;slug&gt;.html for the 8 highest-demand areas using scripts/civilian-page-lib.mjs (same head/nav/footer/JSON-LD/FAQ-mirror contract audit-civilian.mjs enforces), add them to civilian-site/sitemap.xml and llms.txt, run node scripts/audit-civilian.mjs to 0, then repoint the nb-link anchors. Keep one intent-qualified link per page to the PMH twin and add the reciprocal &lt;p data-civilian-xlink&gt; on each public/communities/*.html (preview on one page first per the standing (...)
- Verifier: Substance confirmed and severity high stands; only the link count was off (11 deep-guide anchors, not 13). The fix needs adjusting to this codebase: there is no civilian neighborhood factory, but scripts/civilian-page-lib.mjs and schools-factory.mjs already (...)

#### [synergy-05] PMH passes almost no contextual link equity to GC: 94 of 99 outbound anchors are the identical footer homepage link; 0 links to any GC guide, school, neighborhood, review or blog page

- meta: PMH | high | effort medium | narrowed
- Evidence: Repo grep: PMH hrefs to greggcostin.com = 195 (190 x 'https://greggcostin.com' in the &lt;p data-costin-sites&gt; footer line, anchor 'GreggCostin.com', on 93/93 static pages + App.jsx:742; 3 x /sell, 2 x /buy). Only 5 pages carry a contextual data-civilian-xlink: public/buy.html:388, sell.html:379, cash-offer-pensacola.html, military-rental-property-management.html, rent-or-sell-pcs-pensacola.html. Live: pensacolamilitaryhousing.com/florida-home-insurance-military -&gt; only 'GreggCostin.com -&gt; (...)
- Impact: PMH is the authority domain (Copilot 351 citations/90d, Bing impressions, 101 indexed pages) and it passes almost nothing to GC beyond a sitewide footer anchor that Google treats as navigation. The 'grow in tandem' rule is satisfied in form but not in (...)
- Fix: Same target list as the finder (insurance, homestead, first-time, schools x2, 7 base pages -&gt; GC school reports, reviews, faq, closing-costs post, property-tax post, whats-my-home-worth -&gt; /sell, SPA AboutPage -&gt; /team), each as a &lt;p data-civilian-xlink&gt; in body copy with the target page title as anchor. Preview on one page (e.g. public/florida-home-insurance-military.html) before rolling out; then extend scripts/audit-links.mjs to count data-civilian-xlink pages and warn below 25.
- Verifier: The asymmetry is real and live-verified; only the magnitudes were inflated (99 PMH-&gt;GC anchors, 94 of them the boilerplate footer). Fix is sound and matches the existing data-civilian-xlink pattern; add the standing preview-one-page-first rule before (...)

#### [synergy-06] Brand query gap reconfirmed live: greggcostin.com is absent from the 10-link set for 'gregg costin realtor' while PMH, LinkedIn, Homes.com, Zillow, two Facebook pages and Linktree all appear

- meta: GC | high | effort medium | confirmed
- Evidence: WebSearch 2026-09-02 'gregg costin realtor' links: homes.com agent profile, zillow.com/profile/GreggCostin, facebook.com/greggcostin, facebook.com/greggcostinrealtor, baldwinrealtors.com/agents/gregg-costin, levinrinkerealty.com agent list, greggc.levinrinkerealty.com, pensacolamilitaryhousing.com/, linkedin.com/in/greggcostin, linktr.ee/Greggcostin; greggcostin.com not present. Quoted '"gregg costin" pensacola': PMH / at slot 7, PMH /about at slot 8, greggcostin.com/ at slot 9. On-page: GC H1 'Pensacola real (...)
- Impact: The name domain does not rank for the name. Every profile that could pass brand equity (Zillow, Homes.com, LinkedIn, Linktree, the brokerage page) currently points at or reinforces PMH or a directory, so the civilian site never becomes the entity home and (...)
- Fix: 1) Add a person page on GC at /gregg-costin (H1 'Gregg Costin, Pensacola Realtor', ProfilePage schema with mainEntity {"@id":"https://greggcostin.com/#gregg"}, bio, awards, credentials, review counts, links to /team and to PMH /about for the military story); keep /about 301 but point it here. 2) Set the website field on Zillow, Homes.com, LinkedIn, Realtor.com, Facebook business page, Instagram bio and Linktree to https://greggcostin.com (owner action; GBP choice in notes). 3) PMH /about (src/App.jsx:753 (...)
- Verifier: Live-reproduced. The person-page fix (ProfilePage with mainEntity @id https://greggcostin.com/#gregg) is valid and does not conflict with team.html's AboutPage; the profile 'website' field updates are owner actions. Keep the homepage H1 (owner decision) and (...)

#### [synergy-03] GC and PMH /reviews reuse the same five testimonials verbatim (29.7% shingle Jaccard) and disagree on the Google count (54 vs 55)

- meta: BOTH | medium | effort medium | narrowed
- Evidence: sim.mjs (5-word shingles, header/nav/footer/dialog stripped): civilian-site/reviews.html (475w) vs public/reviews.html (881w) Jaccard 29.69%, cosine 82%, GC containment 65.2%; highest of 19x93 pairs by a factor of 2.6. Identical review sentences at civilian-site/reviews.html:267 &lt;-&gt; public/reviews.html:407, :268 &lt;-&gt; :425, :270 &lt;-&gt; :401, :272 &lt;-&gt; :419 (8 duplicated sentences of 12+ words). Live: 'consummate professional and very dedicated' served on both https://greggcostin.com/reviews and (...)
- Impact: Google will show one of them for 'gregg costin reviews' and today it is the PMH page (the domain that already ranks for the name). The civilian domain, which needs brand-review equity most, is filtered as the duplicate. Copying testimonials word-for-word (...)
- Fix: Merge civilian/review-sync-20260901 so both pages say 55. Make GC /reviews the complete hub (all Google + Zillow reviews, civilian/military/seller filters) and swap PMH's featured six for military-family reviews not shown on GC, adding a first-screen 'Read all 55 Google and 25 Zillow reviews on GreggCostin.com' link. Add a shared-sentence check (12+ word exact matches) between the two reviews files to scripts/audit-civilian.mjs. No cross-domain canonical.
- Verifier: Duplication and count drift are real and live. But 'near-duplicate filtered' is inference: the GC homepage does rank (slot 9) for the brand reviews query and the GC /reviews page's absence is at least as consistent with low authority as with duplicate (...)

#### [synergy-07] sameAs omits the two strongest-ranking profiles (Homes.com, LinkedIn) and a second Facebook page; Linktree URL casing is split 202 vs 2

- meta: BOTH | medium | effort low | narrowed
- Evidence: grep -il linkedin across civilian-site/, public/, index.html, src/App.jsx = 0 files, yet linkedin.com/in/greggcostin ranks in the brand SERP; homes.com/real-estate-agents/gregg-costin/864f0f3/ ranks #1 for 'gregg costin realtor' and is in no sameAs. sameAs corpus counts: facebook.com/greggcostin/ 108, instagram.com/greggcostinrealtor/ 106 (+2 without trailing slash in index.html:180,235), linktr.ee/Greggcostin 4 vs linktr.ee/greggcostin 2 (index.html:181,236 vs :424 region and civilian-site). SERP shows (...)
- Impact: Entity resolvers weigh the intersection of profiles that all point back to one website. Two Facebook and two Instagram identities with only one listed, and the two strongest-ranking profiles (Homes.com, LinkedIn) unlisted, dilute the reconciliation signal (...)
- Fix: Create content/entity/sameAs.json (levinrinke, zillow, homes.com agent profile 864f0f3, linkedin.com/in/greggcostin/, Google Maps place, g.co/kgs, one Facebook page, instagram.com/greggcostinrealtor/, linktr.ee/Greggcostin in one casing, forbesglobalproperties.com/agents/gregg-costin which also ranks, plus the sister site) and have page-factory.mjs, civilian-page-lib.mjs and index.html read it; replace index.html:175-181, 231-236, 420-424 by hand. Make the gtag linktree check case-insensitive. Owner decides which (...)
- Verifier: LinkedIn/Homes.com omission, the second Facebook page and the Linktree casing split are verified; the Instagram duplicate is unproven and the Linktree counts were wrong. Medium stands.

#### [synergy-08] Homestead, insurance and first-time-buyer pairs are correctly split by the military modifier (shingle overlap under 3%), but neither site appears for any of the three civilian test queries

- meta: BOTH | medium | effort medium | confirmed
- Evidence: sim.mjs: homestead pair Jaccard 2.74% / cosine 85% (GC 2106w vs PMH 1892w); insurance pair 2.78% / 88% (2397w vs 4620w); first-time pair 1.62% / 68% (881w vs 2207w); shared 5-grams are shared facts only ('the save our homes cap', 'premium is divided by 12', 'buyer agent compensation is negotiable'). Titles: GC 'Florida Homestead Exemption Guide for Pensacola Homeowners' vs PMH 'Florida Homestead Exemption for Military 2026'; GC 'Florida Home Insurance Guide: Costs, Inspections, Flood Zones' vs PMH 'Florida Home (...)
- Impact: No cannibalization today: the pairs would not compete because the military versions carry the modifier in title and H1. The real cost is that the civilian versions are the only shot at these high-intent local queries and they are being beaten by competing (...)
- Fix: Keep the military/civilian split. Retitle the three GC guides to the SERP's dominant angle within 60 characters, add the portability worked example, a cost-led premium table, and the $45,000 SHIP / $10,000 HOME program section; add a first-300-words reciprocal callout on each PMH twin; add a 5-gram Jaccard gate (fail at &gt;= 5% against the sister site) to blog-factory.mjs, civilian-blog-factory.mjs and page-factory.mjs.
- Verifier: Fully reproduced. One fix correction: the proposed titles are 80-95 characters and would trip the &gt;60-char title check already flagged in evidence.md; shorten them (e.g. 'Florida Homestead Exemption: Escambia & Santa Rosa Filing and Portability', (...)

#### [synergy-09] GC /schools (82 FLDOE school report pages, the site's only unique data asset) receives zero deep links from PMH; the 82 school pages return 164 links to the PMH homepage instead of to base pages

- meta: BOTH | medium | effort low | confirmed
- Evidence: grep 'greggcostin.com/schools' across public/ = 0 (distinct PMH-&gt;GC targets are only /, /buy, /sell). Live: pensacolamilitaryhousing.com/pcs-schools-by-base -&gt; only 'GreggCostin.com -&gt; https://greggcostin.com'; public/school-zones-military-families.html:472 is the footer line only. GC side: civilian-site/schools.html links 'PCS Schools by Base' -&gt; /pcs-schools-by-base (good); each of 82 civilian-site/schools/*.html carries 2 x href to https://pensacolamilitaryhousing.com/ (pill + footer) and no deep (...)
- Impact: PMH's school pages are the pages military parents read (school-zones, pcs-schools-by-base) and they could hand those readers, and their link equity, to the 82 report pages that answer 'is this school any good'. Instead the reports are orphaned from the (...)
- Fix: PMH: in public/pcs-schools-by-base.html and public/school-zones-military-families.html add an intro callout 'Official FLDOE grade, test scores and enrollment for &lt;a href="https://greggcostin.com/schools"&gt;all 82 graded Escambia and Santa Rosa schools&lt;/a&gt;'; in each of the 7 public/bases/*.html add a 'Nearest A-rated schools' list of 3 anchors to the specific GC report pages (e.g. bases/nas-pensacola.html -&gt; /schools/gulf-breeze-high-school, /schools/a-k-suter-elementary-school, (...)
- Verifier: Code- and live-verified; fix is correct for this codebase (schools-factory.mjs regenerates the 82 pages; run audit-civilian.mjs after). The 7 base-page additions on PMH should be previewed on one base page first per the standing rule.

#### [synergy-10] Cross-domain links are almost entirely sitewide boilerplate with one anchor text each way; PMH does not measure clicks to GC (GC already fires military_site_click)

- meta: BOTH | medium | effort low | narrowed
- Evidence: GC: 102/103 pages carry class="mil-link" 'Military & PCS →' (civilian-site/index.html:254) and 102 carry the footer 'Military & PCS Division' (index.html:398), both to https://pensacolamilitaryhousing.com/ = 204 identical-anchor homepage links; PMH: 93/93 static pages + App.jsx:742 carry &lt;p data-costin-sites&gt; with anchor 'GreggCostin.com'. No rel=nofollow on any cross-domain link (GC nofollow is used only on 13 Wikimedia Commons credit links). index.html:38-39 fires gtag events for instagram/facebook (...)
- Impact: Google collapses repeated sitewide links with the same anchor into one weak signal, so the 'tandem' rule contributes almost no ranking benefit in either direction, and with 21% average scroll depth few humans ever see the footer line. There is also no data (...)
- Fix: Keep the pill and footer line. Add the per-page contextual callouts from synergy-05/09 so anchors are descriptive and above the fold. In index.html's click handler add: else if(href.indexOf('greggcostin.com')&gt;-1){gtag('event','civilian_site_click',{event_category:'cross_site',event_label:location.pathname});} and mirror it into the shared head of the static page template (public/first-time-military-homebuyer.html) so page-factory.mjs propagates it; both sites report into the same GA4 property (G-W29GHBK38M), (...)
- Verifier: Boilerplate-only cross-linking and the missing PMH-side event are real; the civilian side already tracks outbound clicks to PMH. Severity medium stands.

#### [synergy-11] The two SPA routes civilians are most likely to hit (/about, /communities) link to GC only in the JS-rendered footer; prerendered shells contain no anchor to greggcostin.com and PMH /about never returns GC /team's contextual link

- meta: PMH | medium | effort low | confirmed
- Evidence: Live: curl https://pensacolamilitaryhousing.com/about contains 'greggcostin.com' 3x, all inside JSON-LD sameAs; grep for '&lt;a ...greggcostin' = 0 anchors; same for /communities (3 refs, 0 anchors). src/App.jsx: the only greggcostin.com anchor is the footer line at :742; AboutPage (:753) and NeighborhoodsPage (:2279) contain no civilian mention (grep -i civilian = 1 hit, the footer). GC side already links contextually: civilian-site/team.html 'read it at PensacolaMilitaryHousing.com' -&gt; /about (...)
- Impact: The page Google currently uses as Gregg's person page (PMH /about) hands nothing to the civilian person/team page, and a civilian who lands on /about or /communities finds no path to the civilian site until the JS footer renders, which the Clarity scroll (...)
- Fix: In src/App.jsx AboutPage (:753) add, above the credentials block, a Body paragraph: 'Not moving on orders? The civilian side of the practice is &lt;a href="https://greggcostin.com/team"&gt;The Costin Team at GreggCostin.com&lt;/a&gt;: buyer and seller representation across Escambia and Santa Rosa County.' In NeighborhoodsPage (:2279) add a card: 'Civilian buyers: &lt;a href="https://greggcostin.com/neighborhoods"&gt;neighborhood lifestyle guides on GreggCostin.com&lt;/a&gt;'. Add both anchors to the per-route (...)
- Verifier: Confirmed by code and live. Fix is implementable: add a per-route field (e.g. civilianLink) in src/routeMeta.js and render it in postbuild-spa-routes.mjs next to the intro, plus the React AboutPage/NeighborhoodsPage paragraphs; also add PMH /about and GC (...)

#### [synergy-12] Blog swimlanes are clean (no PMH twin for rate/Fed posts, VA modifier on PMH money posts) but the money-topic pairs have no reciprocal links and no factory-level overlap gate

- meta: BOTH | low | effort low | confirmed
- Evidence: sim.mjs: civilian-site/blog/closing-costs-florida-buyers.html vs public/va-loan-closing-costs-florida.html cosine 72% / Jaccard 0.78%; blog/property-taxes-escambia-santa-rosa.html vs public/blog/florida-veteran-property-tax-county-guide.html 66% / 0.57% and vs public/blog/florida-homestead-exemption-military.html 70% / 0.80%. Links: GC property-tax post -&gt; PMH /va-disability-property-tax-florida (1 contextual link); GC closing-costs post -&gt; PMH: 2 boilerplate links only; PMH (...)
- Impact: Low today because overlap is under 1%, but both blog engines run unattended twice a week (civilian Mon+Thu, military Tue) and nothing stops the next civilian post from being a lightly edited military post or vice versa; the pairs also miss an easy, (...)
- Fix: Add the three reciprocal contextual links as proposed. Add a pre-publish gate to both blog factories that shingle-compares the new fragment against every sister-site page (fail at Jaccard &gt;= 5%) and warns when no sister-site deep link exists. Differentiate the two FAQ questions rather than deleting one.
- Verifier: Confirmed; low severity is right. One fix correction: do not strip the 'best realtor' answer from PMH /faq, because PMH has WON 'best military realtor Pensacola' (evidence.md) and that FAQ entry supports it. Instead differentiate the question wording: PMH (...)

Verifier-noted items outside the numbered list: BOTH: both domains report into the same GA4 property (G-W29GHBK38M appears 2x in civilian-site/index.html and 2x in index.html) with no linker/cross-domain configuration in code (grep 'linker|cookie_domain' = 0 in both (...) | GC: reviews.greggcostin.com is served with &lt;meta name="robots" content="noindex, nofollow"&gt; yet appears at slot 7 for 'gregg costin reviews' (WebSearch 2026-09-02), two slots ABOVE greggcostin.com/ and while (...) | GC: the civilian brand's entity assets live on the military host: civilian-site/index.html:41 RealEstateAgent logo = https://pensacolamilitaryhousing.com/images/logo-08-sm.png and both header logos are hot-linked from (...) | PMH: index.html:62 &lt;link rel="me" href="https://www.wikidata.org/wiki/Q140446886"&gt; is the only rel="me" identity link on either site, and it now points at a deleted item; neither domain declares rel="me" to the (...) | BOTH: the two FAQ pages share only 0.16% shingle overlap (my check), but the single shared question 'who is the best realtor' is answered differently on each domain and both answers are eligible for the same (...)

### Analytics, tracking & measurement integrity

12 findings (2 high, 4 medium, 6 low). Strengths noted: Tag coverage is complete and clean: one gtag loader per page, G-W29GHBK38M + FUB on 93/93 PMH pages and 102/103 GC pages, Clarity on 93/93 PMH pages, and 0 files with duplicate gtag/js script tags (repo scan + live curl of 5 URLs). | Success-gated lead events on the static surfaces: inquiry_open and inquiry_submit fire only after the worker returns success on 91 PMH pages and all 102 GC pages, with a consistent _gotcha honeypot and a worker that answers 200 to spam without creating a lead (worker.js:26-30). | The contact worker is a genuine lead pipeline, not a mailer: Origin-based site attribution, an inquiryType-to-stage map with lead-magnet catch, a follow-up task due in 2 hours, and Resend notification + confirmation emails, all in Promise.allSettled so one vendor failure cannot lose the lead (worker.js:56-139). | FUB is deferred on both sites via requestIdleCallback (keeps ~536 KB of vendor JS off the critical path) and the SPA fires the FUB pageview on every route change including popstate (src/App.jsx:368-372, 2723, 2734), so the CRM visitor timeline sees SPA navigation. | A rich, mostly consistent click taxonomy already exists (15 events on PMH static pages, 14 on GC: phone/text/email, reviews, IDX, RealScout, authority outbound links, FAQ expands, calculator use) plus Calendly booking captured via postMessage on both surfaces (strategy_call_booked). | Clarity Smart Events are live on PMH (OutboundClick 40, ContactUs 21, Search 12, SeeReviews 7, SubmitForm 2 in the last 30 days), IndexNow key files resolve on both hosts (HTTP 200), PMH is Bing-verified (meta + BingSiteAuth.xml), and Cloudflare Web Analytics is edge-injected on both hosts, giving free real-user Web Vitals.

Auditor notes: DATA LIMITS: No Lighthouse or CrUX numbers this run. GA4 property settings (Enhanced Measurement toggles, key events, custom dimensions, cross-domain list, internal-traffic filter, Google signals) are not readable from code or curl; findings 04, 05 and 06 describe what the code makes likely and name the DebugView/admin check to confirm. Bing Webmaster quota and greggcostin.com's Bing verification status are unverified (no meta, /BingSiteAuth.xml 404; DNS verification is possible). FUB chat-bubble usage is unknown. The evidence file said Clarity Smart Events may not be configured; the Clarity dashboard query on 2026-09-02 shows five active Smart Events, so mobile 'zero conversions' in (...)

#### [analytics-01] SPA lead conversions are attempt-based and name-collide with GA4; no success-gated inquiry event on the homepage funnel

- meta: PMH | high | effort low | confirmed
- Evidence: index.html:46-50 fires gtag('event','form_submit') on every document 'submit' (before validation and before the worker responds). src/App.jsx:880-883 (InlineInquiry) and :2568-2570 (ContactPage) succeed with only markInquirySubmitted()/setStatus, no gtag call. InquiryModal src/App.jsx:488-560 contains no gtag/track call (no inquiry_open). Hero CTA src/App.jsx:441 renders a &lt;button&gt; (BtnP without href, :344), so the document click listener (anchors only) never sees it. Static pages by contrast fire (...)
- Impact: The 7 SPA routes (home, /pcs-guide, /contact, /communities, /mortgage-calculators, /about, /blog) report leads under a different name than the other 93 pages, count failed/spam/duplicate submits as conversions, and the custom form_submit merges with GA4 (...)
- Fix: 1) Delete the document 'submit' listener in index.html:46-50. 2) In src/App.jsx add inside both success branches (after setStatus('success') at ~881 and ~2569): track('inquiry_submit',{inquiry_type: formData.inquiryType, cta_location: 'spa-modal' | 'contact-page', page_path: window.location.pathname}). 3) In InquiryModal's mount useEffect (~491) add track('inquiry_open',{cta_location:'spa-modal'}). 4) In the hero BtnP onClick (:441) add track('cta_click',{cta_location:'hero', cta_text:'start-pcs-search'}) before (...)
- Verifier: Fully reproduced in code and live. Fix is sound for this codebase: React onSubmit handlers at :870/:2558 are the right insertion points; InquiryModal mount effect at :491 exists; deleting index.html:46-50 also stops the Pagefind search-form pollution. Only (...)

#### [analytics-02] Capture-time attribution never reaches Follow Up Boss: worker reads utm_* but no form sends them, and no GA client_id or landing page is attached to a lead

- meta: BOTH | high | effort medium | confirmed
- Evidence: workers/costin-contact/worker.js:63-72 resolves fub_source from body.utm_source/utm_campaign/sourceUrl and only falls back to Origin hostname. Every client payload is name/email/phone/inquiryType/message/_gotcha only: src/App.jsx:877 and :2565, public/first-time-military-homebuyer.html:628, civilian-site/index.html:444. Repo scan: 'utm_' appears in 0 of 196 HTML files, 0 files under src/ and scripts/. docs/marketing-ops.md section 1 asks Gregg to tag every profile link with utm_source (zillow, gbp, facebook, fub, (...)
- Impact: FUB shows every web lead as either 'PensacolaMilitaryHousing.com' or 'GreggCostin.com Contact Form' with no channel, landing page, or session id, so the one question that matters (which channel produced closed business) cannot be answered, and a FUB lead can (...)
- Fix: Add a first-touch capture snippet right after gtag('js') in all three templates (index.html, public template, civilian template): (function(){try{var p=new URLSearchParams(location.search),k=['utm_source','utm_medium','utm_campaign','utm_content','utm_term'],a=JSON.parse(localStorage.getItem('costin_attr')||'{}'),hit=false;k.forEach(function(x){if(p.get(x)){a[x]=p.get(x);hit=true;}});if(!a.landing_page||hit){a.landing_page=location.pathname+location.search;a.referrer=document.referrer||'';a.first_seen=new (...)
- Verifier: Code-verified only; the deployed worker version cannot be confirmed (see missed item on worker provenance). gtag('get','G-W29GHBK38M','client_id',cb) is a valid gtag API and the 300 ms fallback is appropriate. The worker fix must be deployed with wrangler (...)

#### [analytics-03] Shared GA4 property across two domains has no cross-domain linker or unwanted-referral list; user splitting will start as soon as the tandem cross-links get traffic

- meta: BOTH | medium | effort low | narrowed
- Evidence: Live: https://pensacolamilitaryhousing.com/ and https://greggcostin.com/ both call gtag('config','G-W29GHBK38M'). Repo: 'linker' appears in 0 of 196 HTML files and 0 in index.html. Cross links: 246 hrefs from civilian-site to pensacolamilitaryhousing.com and 98 from public/+index.html to greggcostin.com, 0 of them carry a utm parameter. GA4 default cookie_domain 'auto' scopes _ga per registrable domain.
- Impact: Every click across the family line (the standing tandem cross-link rule) starts a new client_id on the other domain: users inflated, the original organic/GBP source overwritten by 'greggcostin.com / referral' (or the reverse), and any PMH conversion from a (...)
- Fix: Prefer the no-code route first: GA4 Admin &gt; Data streams &gt; web stream &gt; Configure tag settings &gt; Configure your domains: add pensacolamilitaryhousing.com and greggcostin.com (the loaded Google tag then auto-decorates links with _gl on both sites, no template edits needed). Then List unwanted referrals: both apex domains, both .pages.dev twins, greggc.levinrinkerealty.com, greggcostin.realscout.com, calendly.com. Optionally mirror it in code by changing the config line in index.html:25, the public (...)
- Verifier: Gap is real and cheap to close, but 'high' overstates it: today the cross-site path carries no measurable sessions in Clarity, and the self-referral evidence cited is a same-host artifact, not a linker problem.

#### [analytics-05] SPA route changes likely produce two page_views (manual + Enhanced Measurement history tracking) and fire page_view on same-page clicks

- meta: PMH | medium | effort low | confirmed
- Evidence: src/App.jsx:2715-2722: history.pushState is guarded by pathname !== slug but trackPageView(slug) at :2722 runs unconditionally; :2733 repeats it on popstate. trackPageView (:361-365) sends gtag('event','page_view',...). gtag('config') at index.html:25 uses the default send_page_view:true for the initial load (correct). GA4 Enhanced Measurement 'Page changes based on browser history events' is on by default and also emits page_view on pushState; its state in the property could not be verified from code.
- Impact: Each in-app navigation on /, /pcs-guide, /communities, /mortgage-calculators, /contact can count twice, and clicking the current nav tab counts a fresh view; pages/session and route popularity for the flagship PCS Guide are unreliable.
- Fix: Keep the manual page_view (it sets document.title first) and in GA4 Admin &gt; Data streams &gt; Enhanced measurement &gt; Page views (gear) uncheck 'Page changes based on browser history events'. In go() wrap: if (window.location.pathname !== slug) { history.pushState(...); trackPageView(slug); trackFUBPageView(); } and keep the popstate branch. Also call trackPageView('/mortgage-calculators') in handleHash (:2760-2767) when HASH_TO_PAGE resolves, since that path currently swaps the page with no view.
- Verifier: Code-verified. Fix is correct for this router; the GA4 admin toggle step must be done in the property UI and confirmed in DebugView. Severity medium is appropriate given the 7 SPA routes include the flagship /pcs-guide.

#### [analytics-06] Event taxonomy diverges between the two sites and three surfaces, and UA-style event_category/event_label params are invisible in GA4 unless registered

- meta: BOTH | medium | effort medium | confirmed
- Evidence: PMH template line 51 (86 identical pages): greggc.levinrinkerealty.com links fire brokerage_profile_click (social_proof), including the 7 IDX /results search links; civilian-site/index.html:58 fires idx_search_click (conversion) for the same host. RealScout onboarding: public/pcs-home-search.html realscout_signup_click vs GC home_search_signup_click. Cross-site: GC fires military_site_click for its 246 links to PMH; PMH has no counterpart for its 98 greggcostin.com links (0 files). Lead events: static (...)
- Impact: Cross-site reports cannot be summed (the same action has two names), IDX searches on PMH are hidden inside a social-proof bucket, and GA4 reports show only event counts with no location/label breakdown, so the 15-event taxonomy delivers far less than it costs.
- Fix: Adopt one spec on both sites (rename in the three templates and the factories): inquiry_open{cta_location,inquiry_type}; inquiry_submit{inquiry_type,cta_location,page_path} (success-gated); phone_call_click / text_message_click / email_click{cta_location}; calendly_click{cta_location}; strategy_call_booked; home_valuation_click (realscout whats-my-home-worth); home_search_signup_click (realscout onboarding; rename PMH realscout_signup_click); idx_search_click (host greggc.levinrinkerealty.com AND path contains (...)
- Verifier: Three surfaces, three vocabularies, verified. The proposed spec is implementable in the three templates plus one sed across public/ and civilian-site/; the SPA click listener lives only in index.html so the SPA is one edit. Keep 'never mark form_submit as (...)

#### [analytics-07] No Microsoft Clarity on greggcostin.com, while the PMH project already runs Smart Events that would show whether the civilian funnel converts

- meta: GC | medium | effort low | confirmed
- Evidence: Repo: 'clarity.ms' in 0 of 103 civilian-site HTML files vs 93/93 PMH files. Live https://greggcostin.com/ and /buy: clarity=0. PMH Clarity project wm7ddbciup has active Smart Events in the last 30 days (OutboundClick 40, ContactUs 21, Search 12, SeeReviews 7, SubmitForm 2 per the Clarity dashboard query on 2026-09-02). No page on either site calls clarity('event',...) or clarity('set',...) to mirror GA4 conversions.
- Impact: The civilian site (46 of 57 mobile tap targets under 44px, CTAs overlaid on the hero portrait per the orchestrator's lab notes) has zero behavioral data: no scroll depth, dead/rage clicks, or recordings to validate the mobile layout, and no way to filter PMH (...)
- Fix: Create a separate Clarity project for greggcostin.com (separate so heatmaps and URLs do not mix), add the standard tag after the gtag block in civilian-site/index.html and the other 102 pages (one sed pass plus the civilian factory template), then in Clarity add Smart Events: ContactUs = clicks on a[href^='tel:'],a[href^='sms:'],a[href^='mailto:']; SubmitForm = .isubmit; OutboundClick = realscout.com and levinrinkerealty.com. On both sites add clarity('event','inquiry_submit') next to the GA4 call (template :634 (...)
- Verifier: Reproduced live and in the dashboard. Fix is correct: a separate project keeps heatmap URLs clean; the tag goes after the gtag block in civilian-site/index.html and one sed across the other 102 pages (the civilian factory clones existing pages, so it (...)

#### [analytics-04] Redundant second gtag('config') for the GT- container ID on every page; duplicate page_view possible but not demonstrated

- meta: BOTH | low | effort low | narrowed
- Evidence: index.html:25-26, public template (first-time-military-homebuyer.html:50) and civilian-site/index.html:57 all call gtag('config','G-W29GHBK38M') followed by gtag('config','GT-WVGM66XS'); repo scan: 93/93 PMH and 102/103 GC pages. Live fetch of https://www.googletagmanager.com/gtag/js?id=GT-WVGM66XS lists destination G-W29GHBK38M (2 mentions) and the G- script references GT-WVGM66XS, i.e. GT-WVGM66XS is the container for this same measurement ID. Live on all 5 sampled URLs.
- Impact: Two config calls against one destination can emit two page_view events per load (and double any settings applied), inflating views, deflating engagement rate and bounce metrics sitewide. Cannot be proven without DebugView, but the second line is redundant in (...)
- Fix: Before removing anything, open GA4 DebugView on one page and count page_view events per load. If two appear, remove gtag('config','GT-WVGM66XS') from index.html:26, run a sed over public/**/*.html and civilian-site/**/*.html (the factories clone existing pages, so no factory edit is needed; delete or retire scripts/add-google-tag-gt.mjs so it is not re-run). If only one appears, leave it and note it as intentional in docs/marketing-ops.md.
- Verifier: Redundancy is confirmed; the 'documented source of duplicate page_view hits' claim is not documented by Google for a GT- container that resolves to the same G- destination, and the finder admits it cannot be proven. Severity lowered to low pending DebugView.

#### [analytics-08] Owner traffic still pollutes both properties; the IP-based exclusion in marketing-ops has never been applied and cannot cover cellular or the Electron app

- meta: BOTH | low | effort low | confirmed
- Evidence: docs/marketing-ops.md section 2 (GA4 internal-traffic rule + Clarity IP block) is still listed as unexecuted (evidence.md, Aug known-open). Clarity last 30 days: 11 sessions from source 'https://Electron' with hundreds of dead/rage clicks (evidence.md); last 7 days source list shows pensacolamilitaryhousing.pages.dev (1 session) and 16 self-referral sessions. No page sets traffic_type: 'gtag(\'set\'' appears in 0 files.
- Impact: Direct/Other already dominates (66% of sessions); Gregg's own laptop, phone and the FUB/Electron embed inflate sessions and dead-click counts on exactly the pages he edits most, which distorts the market-engine's monthly diffs.
- Fix: Device-based flag that does not depend on IP: in all three gtag blocks, before config, add try{if(location.search.indexOf('internal=1')&gt;-1){localStorage.setItem('costin_internal','1');} if(localStorage.getItem('costin_internal')==='1'){gtag('set',{traffic_type:'internal'});}}catch(e){} and, after the Clarity tag, clarity('set','internal','1') under the same condition. Then GA4 Admin &gt; Data settings &gt; Data filters: activate the Internal Traffic filter (traffic_type=internal) and in Clarity create a (...)
- Verifier: Confirmed. The fix is technically right: gtag('set',{traffic_type:'internal'}) must run before gtag('config') so the initial page_view carries the parameter, and GA4's Internal Traffic data filter keys on that parameter, so no IP rule is needed. Clarity (...)

#### [analytics-09] Follow Up Boss widget is 536 KB of JS plus iframes on every page of both sites; Cloudflare Insights makes a fourth vendor but is the only RUM Web Vitals source

- meta: BOTH | low | effort low | confirmed
- Evidence: Live curl 2026-09-02: https://widgetbe.com/agent = 79,453 B, https://widgetbe.com/widget = 456,984 B (application/javascript, no compression negotiated), widget creates iframes (6 'iframe' references, 10 'isMobile' branches). Loaded on 93/93 PMH and 102/103 GC pages via requestIdleCallback(loadFUB,{timeout:5000}) (index.html:519-527, template :243-250, GC :62-69). Orchestrator lab: 3 widgetbe requests ~337-339 ms on both homepages. Cloudflare Insights beacon is edge-injected on both hosts (data-cf-beacon tokens (...)
- Impact: On a phone the widget fires shortly after idle on a fast page, competing with fonts and the hero; FUB's value is the visitor timeline for known leads (email-link clicks) and the chat bubble, and chat volume is unknown. The CF beacon is small and should stay: (...)
- Fix: Load FUB on first interaction instead of idle: ['pointerdown','keydown','scroll','touchstart'].forEach(function(ev){addEventListener(ev,loadFUB,{once:true,passive:true});}); setTimeout(loadFUB,8000); (replace the requestIdleCallback line in the three templates). In FUB &gt; Admin &gt; Website Widget check chat conversations for the last 90 days; if near zero, disable the chat bubble and keep only the tracker (the pageview timeline still works). Keep Cloudflare Web Analytics and read its Core Web Vitals panel (...)
- Verifier: Confirmed. The interaction-triggered loader plus an 8 s fallback is safe for the FUB visitor timeline (email-link visitors who scroll or tap still get a pageview; the fallback catches passive readers). Note the SPA's trackFUBPageView (src/App.jsx:368) (...)

#### [analytics-10] IndexNow/Bing submission is PMH-only, resubmits all 101 unchanged URLs every run, and both sitemaps carry bulk-stamped lastmod

- meta: BOTH | low | effort medium | confirmed
- Evidence: scripts/submit-indexnow.mjs:10 HOST hardcoded to pensacolamilitaryhousing.com; :17-20 loads every &lt;loc&gt; in public/sitemap.xml; :30 and :48 submit the full list (comment at :44 asserts a 10,000/day Bing quota, which is per-site and not verifiable here). GC key file civilian-site/0b7ab9f744b3fe4bdf786411b9cd0866.txt is live (HTTP 200) but no script submits GC URLs; .claude/skills/civilian-blog-engine/SKILL.md:52-54 hand-builds a POST for new posts only. lastmod: PMH 97 of 101 URLs = 2026-08-23; GC 97 of 102 = (...)
- Impact: IndexNow's own guidance is to submit changed URLs only; blanket resubmission wastes any Bing URL-submission quota and erodes trust in the key, while greggcostin.com's 100 evergreen pages have never been batch-submitted and its lastmod values give crawlers no (...)
- Fix: Make the script host-aware and diff-based: node scripts/submit-indexnow.mjs --site pmh|gc [--all]; without --all derive URLs from git diff --name-only &lt;last-deploy-tag&gt;..HEAD filtered to public/**/*.html or civilian-site/**/*.html and mapped to clean URLs (plus the sitemap URL); tag each deploy (git tag deploy-pmh-YYYYMMDD). Set per-page lastmod from git log -1 --format=%cs &lt;file&gt; in the sitemap generators/bump-dates step. Confirm greggcostin.com in Bing Webmaster Tools (import from GSC) and add its (...)
- Verifier: All facts reproduced. 'Never been batch-submitted' for GC is an inference (no script or log exists; a manual submission cannot be excluded). The git-diff-since-deploy-tag design is workable; per-page lastmod from git log -1 --format=%cs is correct but must (...)

#### [analytics-11] 404s are invisible: greggcostin.com's 404 page has no GA4 tag and PMH's soft-404 records bad URLs as normal homepage-shell views

- meta: BOTH | low | effort low | confirmed
- Evidence: civilian-site/404.html contains 0 occurrences of G-W29GHBK38M (the only one of 103 civilian pages without it). PMH: any unknown path returns HTTP 200 from the /* /index.html fallback (evidence.md live test) and src/App.jsx:2702-2705 resolvePageFromPath silently maps unknown paths to 'home', so the page_view is sent with the homepage title and no 404 signal.
- Impact: Broken inbound links (directory profiles, old blog URLs, the 26 forwarded military domains) cannot be found in GA4 for either site; on PMH they also inflate homepage views.
- Fix: Add the standard gtag block to civilian-site/404.html plus gtag('event','page_not_found',{page_path:location.pathname,page_referrer:document.referrer}). In src/App.jsx resolvePageFromPath, when SLUG_TO_PAGE misses and pathname !== '/', set document.title='Page not found | Pensacola Military Housing', render a small NotFound block, and fire the same page_not_found event; then build a GA4 exploration on page_not_found by page_path and page_referrer. (A true 404 status for PMH belongs to the indexation dimension.)
- Verifier: Confirmed live and in code. Fix works: adding the gtag block to 404.html is a static edit (re-run scripts/audit-civilian.mjs afterwards); the SPA NotFound branch must also be reflected in the per-route head-sync effect (:2740-2757) so the canonical is not (...)

#### [analytics-12] No Consent Mode defaults; low risk today, but the proposed EEA-denied default would silently drop all analytics for overseas military readers

- meta: BOTH | low | effort low | narrowed
- Evidence: 'consent' appears in 0 GA4 blocks (the single PMH match is prose in public/military-divorce-housing.html). src/App.jsx:2582 invites bookings 'from Ramstein or Yokosuka'; Clarity/GA4 geography for those sessions was not sampled this run. No cookie banner on either site.
- Impact: Low risk for a US real-estate practice, but if Google signals or ads features are ever enabled on G-W29GHBK38M, EEA-located sessions (Ramstein, Aviano, Rota) would collect without a consent default and Google may drop or model them.
- Fix: Add only the ads-side default before gtag('config') in the three templates: gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'granted',wait_for_update:0}); and keep Google signals and ads linking off in the property. Do not region-deny analytics_storage without a banner, because with no consent update call those Ramstein/Aviano/Rota/UK sessions (exactly the audience the contact page courts) would never be measured; if a region default is wanted (...)
- Verifier: Core observation stands and is low severity. The second gtag('consent') line in the original fix is self-defeating for a site that explicitly targets overseas-based service members: it denies analytics_storage for EEA/UK/CH with no mechanism to grant it.

Verifier-noted items outside the numbered list: Contact worker provenance is undocumented, which blocks every attribution fix: CLAUDE.md:29 and :38 state the costin-contact worker source is 'not in repo' / 'Neither worker's source lives in this repo', yet (...) | The pages.dev twins leak into analytics as referrers and as duplicate-host hits: index.html:4, public template :4 and civilian-site/index.html:4 use a client-side location.replace() to bounce .pages.dev to the apex, (...) | Site search submissions are counted as lead conversions on the SPA: dist/pagefind/pagefind-ui.js renders &lt;form class="pagefind-ui__form" role="search" action="javascript:void(0);"&gt; and the live PMH homepage loads (...) | The SPA's manual page_view drops the query string on every route change: src/App.jsx:363 builds page_location as window.location.origin + path (path from PAGE_TO_SLUG) and the popstate branch (:2733) passes only (...)

### Keyword research & cornerstone content blueprint (both sites)

12 findings (5 high, 5 medium, 2 low). Strengths noted: VA disability property-tax cluster is top-1% coverage: 63 distinct Bing queries (17% of all impressions, avg position 5.8) across Escambia, Santa Rosa, and Okaloosa phrasings map to /va-disability-property-tax-florida (119 Copilot citations, the site leader) plus the county-by-county blog guide; competitors have nothing comparable. | Entity-set completeness is real: 7 base pages, 19 community pages, and 7 on-base-vs-off-base pages, each 3,000-4,700 words with question-shaped H2s and per-base BAH tables. Live checks show /communities/navarre in slot 4 for "Navarre FL military homes" and /bases/nas-pensacola, /faq, and /bases/saufley-field all ranking for the Gulf Breeze / NAS Pensacola family query. | The moat query is won and was moved deliberately: /military-realtor-pensacola shipped 2026-08-24 and within 8 days pensacolamilitaryhousing.com entered the raw link set (three PMH URLs appear in my 2026-09-02 run) with the AI summary naming Gregg first; the bellwether panel and market-engine log document the causal chain. | Assumable VA is a genuine commercial foothold: Bing positions 1-2 with real clicks on five list-shaped queries, a dedicated page with an sms list CTA already wired (data-cta assumable-list-text), and /faq reinforcing it with three internal links. | Content operations are disciplined: both queues rerank on market data with logged reasons, the civilian BLOG-CONTRACT forbids unsourced perishable numbers and enforces 4+ FAQs and internal links, and the ledger records source-by-source verification (millage rates re-derived, closing-cost math recomputed). | greggcostin.com/schools (82 FLDOE school report pages) is a unique civilian asset ready to power neighborhood pages: every neighborhood brief in this blueprint can link school-by-school data no portal or competitor agent site offers.

Auditor notes: DATA LIMITS: Semrush API units exhausted (no volumes, no keyword difficulty scores); PageSpeed quota exhausted (no Lighthouse/CrUX). Difficulty ratings below are judgments from SERP shape only. WebSearch is US-generic, not Pensacola-geolocated, returns 8-10 links per query, and its summaries are the tool's own, so \"AI Overview present\" could not be observed directly; I logged only link-set shape and which Costin domain appears. The Bing export (docs/seo-baselines/bing-keywords-2026-08-22.csv) totals 334 queries, 538 impressions, 30 clicks; its date window is not stated in the file. One delta vs the 09-01 bellwether: in my 2026-09-02 run greggcostin.com DID appear (slot 10) for \"Gregg (...)

#### [kw-01] PMH blog queue still carries 7 civilian-audience mega-guides written before greggcostin.com launched; the civilian queue holds generic evergreen topics with no keyword targets

- meta: BOTH | high | effort low | narrowed
- Evidence: content/blog/topic-queue.json (the PMH engine queue) holds 7 entries tagged "audience": "civilian" (florida-insurance-survival-guide-2026, pensacola-cost-of-living-2026, retiring-in-pensacola-guide, pensacola-first-time-homebuyer-2026, pensacola-vs-destin-vs-fort-walton, remote-workers-moving-to-pensacola, pensacola-investment-property-2026) plus "both" items (pensacola-housing-market-q3-2026, moving-to-navarre/pace/milton/crestview). content/civilian-blog/topic-queue.json instead queues (...)
- Impact: The civilian flagship (which the ai-search-strategy names as the entity-broadening surface) will publish twice a week into the one archetype the strategy says loses, while the local civilian queries that could rank on greggcostin.com get published on (...)
- Fix: (1) Edit content/blog/topic-queue.json: remove the 6 clearly civilian entries (cost-of-living, retiring, first-time-homebuyer, vs-destin, remote-workers, investment-property) and re-create them in content/civilian-blog/topic-queue.json in that file's shape ({slug, topic, type}) plus a new optional targetKeywords array the civilian-blog-factory can read; keep florida-insurance-survival-guide as a refresh of the existing civilian-site/resources/florida-home-insurance.html rather than a new post. (2) Rewrite the PMH (...)
- Verifier: Core is real and worth fixing, but two details are overstated: only 2 of 5 civilian evergreen topics are placeless (3 carry Florida/Gulf Coast scoping), and the PMH queue's civilian tagging is a documented, intentional design (the queue note) written before (...)

#### [kw-02] greggcostin.com has no neighborhood or area pages; every place-name keyword in the civilian lane is a GAP and the hub sends its equity to the military domain

- meta: GC | high | effort high | confirmed
- Evidence: civilian-site/neighborhoods.html: 13 cards at 46-58 words each (East Hill 51, Gulf Breeze 58, Pensacola Beach 49, Perdido Key 50, Pace & Milton 51, Navarre 46, Cantonment 48, Orange Beach 55); 12 deep links go to pensacolamilitaryhousing.com/communities/* and only 1 link each to /schools, /search, and the IDX. civilian-site/index.html "Where we work" block: 10 of 11 links point at pensacolamilitaryhousing.com/communities/*. civilian-site/sitemap.xml lists 20 non-school URLs and zero neighborhood URLs. Live SERPs (...)
- Impact: The GC keyword table (east hill pensacola homes, gulf breeze realtor, perdido key condos for sale, pensacola beach homes, pace fl homes for sale, cantonment homes, waterfront homes pensacola, luxury homes pensacola) maps to GAP on every row. The only (...)
- Fix: Build /neighborhoods/&lt;slug&gt; pages on GC using the page-factory pattern (clone civilian-site/resources/florida-home-insurance.html head/JSON-LD), 8 to start in this order: east-hill, gulf-breeze, perdido-key, pensacola-beach, pace-milton, navarre, cordova-park, cantonment. Each: 1,800-2,500 words, price bands by home era, insurance/4-point notes, flood zone, a school table linking the matching /schools/&lt;id&gt; reports, one pre-filtered IDX deep link (...)
- Verifier: Fix needs one correction: scripts/page-factory.mjs is the PMH factory (clones public/first-time-military-homebuyer.html with military chrome). For greggcostin.com use scripts/civilian-page-lib.mjs chrome() the way scripts/schools-factory.mjs does, register (...)

#### [kw-03] "Homes for sale near [base]" intent has no listing-shaped page: Bing ranks PMH at position 4-5 with zero clicks while local agents with IDX pages win on Google

- meta: PMH | high | effort medium | confirmed
- Evidence: docs/seo-baselines/bing-keywords-2026-08-22.csv: "buying a home near nas pensacola" 5 impr pos 4.8; "property for sale near nas pensacola" 4 impr pos 4.0; "homes for sale near nas pensacola" 2 impr pos 4.0; "houses near nas pensacola for sale" 2 impr pos 5.0; "va qualified homes for sale in pensacola" 2 impr pos 5.0; cluster total 16 queries, 30 impressions, 1 click. Live SERP "homes for sale near NAS Pensacola": Zillow, Movoto, then chuckbarnes.com, gibbons-realty.com, pensacolanavalhousing.com, (...)
- Impact: This is the most transactional cluster on the site (buyer with orders looking at inventory) and the competitor that leads the moat query (panhandlepcs) already owns the page shape. Position 4-5 with 0% CTR on Bing means the snippet promises a guide when the (...)
- Fix: Create /homes-for-sale-near-nas-pensacola (then hurlburt-field, eglin-afb, whiting-field) via scripts/page-factory.mjs: a weekly-dated "what is on the market" block, gate-by-gate commute table, price bands vs the 2026 FL064 table by rank, and 3-4 pre-filtered IDX deep links per page (add &city%5B%5D=Pensacola / Gulf+Breeze / Navarre etc. to the /map/ URL as civilian-site/search.html already does). Retitle bases/eglin-afb back to a guide title and let the new page carry the transactional title. Add ItemList (...)
- Verifier: Confirmed. Two fix refinements: do not retitle bases/eglin-afb until the new /homes-for-sale-near-eglin-afb page is indexed, because Bing already shows the eglin page at position 2 for "creatview housing for sale eglin florida"; and because PMH returns 200 (...)

#### [kw-04] BAH is the largest demand cluster (21% of Bing impressions) but per-base BAH queries land on a two-MHA calculator page whose first rate table sits below the fold and whose title does not match the query phrasing

- meta: PMH | high | effort low | confirmed
- Evidence: Bing export cluster: 62 BAH queries, 114 impressions, 6 clicks, avg position 6.3. Per-base rows: "bah hurlburt field" 8 impr pos 6.9; "nas pensacola bah" 7 impr pos 6.3; "hurlburt field bah" 6 impr pos 9.2; "nas corry station bah" 4 impr pos 4.5; "usaf bah fort walton beach fl" 4 impr pos 4.25; "bah pensacola" 4 impr pos 9.0; "pensacola bah 2026" 2 impr pos 6.5. public/bah-rates.html: title "BAH Calculator & 2026 Rates: Pensacola & Fort Walton Beach"; the first H2 is the calculator (line 380), the direct-answer (...)
- Impact: The cluster that already generates most impressions and the most Copilot citations after property tax (54 for /bah-rates per the evidence file) is stuck at position 6-9 on Bing and slot 7 on Google against thin aggregator pages, because the query shape is (...)
- Fix: (1) Retitle public/bah-rates.html to "Pensacola BAH Rates 2026 (FL064) and Fort Walton Beach (FL023): Tables + Calculator" and move the line-491 headline-number paragraph and the FL064 table above the calculator H2. (2) On each public/bases/*.html, rename the BAH H2 to the exact query form ("Hurlburt Field BAH 2026: Rates by Rank, With and Without Dependents"), add a 40-80 word direct answer under it, and give it an id so /bah-rates can link #hurlburt-field anchors from a per-base jump list near the top. (3) Add (...)
- Verifier: Confirmed in full. Fix is implementable as written; the line-487 H2 is already question-shaped, so the change is mostly moving the 487-530 block above the line-380 calculator and retitling.

#### [kw-05] No living market or home-value page on the civilian site: "pensacola real estate market", "pensacola home values", and "what's my home worth" have no on-site target and the valuation CTA is an off-site redirect

- meta: GC | high | effort medium | confirmed
- Evidence: civilian-site/sell.html and civilian-site/index.html: the "What's my home worth?" buttons link straight to https://greggcostin.realscout.com/whats-my-home-worth (2 links each); no GC page exists for valuation or market data (sitemap.xml has 20 non-school URLs, none market-shaped). content/blog/topic-queue.json #2 "pensacola-housing-market-q3-2026" (audience both) is scheduled for the PMH blog; content/civilian-blog/topic-queue.json has "market-check-monthly" as a recurring blog post only. Live SERPs 2026-09-02: (...)
- Impact: Seller-side demand (the listing side of GCI) is handed to RealScout with no indexable page in between, and the quarterly market franchise the strategy calls a "living stats page" will publish as dated posts on the military domain instead of one refreshed URL (...)
- Fix: Add two GC pages: /market (a monthly-refreshed dashboard: median price, DOM, inventory, months of supply by Pensacola, Gulf Breeze, Pace, Navarre, Milton, Cantonment, sourced from PAR/MLS + Zillow ZHVI + Redfin with named vintages; Dataset + WebPage + FAQPage JSON-LD; visible "Updated Month Year"; the civilian "market-check-monthly" queue item becomes the changelog post that links here) and /home-value (on-page valuation explainer + embedded RealScout HVA or the contact-worker form with inquiryType "Selling My (...)
- Verifier: Confirmed. One addition to the fix: when /home-value ships on GC, add a civilian cross-link from public/whats-my-home-worth.html and keep that PMH page scoped to PCS sellers so the two do not collide. The RealScout HVA embed must be checked against the (...)

#### [kw-06] GC /sell hands the cash-offer question to the military domain by a single link; no civilian cash-offer-vs-listing page exists

- meta: GC | medium | effort medium | narrowed
- Evidence: Live SERP "sell my house Pensacola" (2026-09-02): opendoor.com, homelight.com/blog/we-buy-houses-pensacola, houzeo.com x2, listwithclever.com cash-home-buyers, floridacashhomebuyers.com, debuyshouses.com, takeflighthomebuyers.com, sandysellspensacola.com/cash-offer (an agent's cash-offer page). civilian-site/sell.html: 1,581 words; H2s are pricing, marketing, negotiation, costs, military move, FAQ; zero occurrences of "cash offer". public/cash-offer-pensacola.html on PMH: 4,679 words, meta description is (...)
- Impact: The highest-intent seller query in the civilian lane is answered by iBuyers and investor sites quoting 30-70% of value; Gregg's net-sheet rebuttal exists but on a domain whose framing repels civilian sellers, so the civilian site cannot rank or convert on it.
- Fix: Build civilian-site/sell/cash-offer-vs-listing.html (net sheet at 3 price points, Pensacola cash-buyer discount ranges with sources, timeline comparison, FAQPage, CTA to the future /home-value), then change sell.html line 270 to link internally first with the PMH page as the 'on PCS orders' sibling. Do NOT re-scope the PMH page's title/H1 to PCS until the GC page is indexed; then narrow the PMH H1 to the orders-driven seller and cross-link both ways.
- Verifier: Core holds (GC has no cash-offer content of its own; the only Costin page for that intent is on PMH and its body is military-heavy), but the finder's "zero occurrences of cash offer" on /sell is wrong (there is one, a link out to PMH) and the PMH page's (...)

#### [kw-07] "Moving to Pensacola" and "PCS to Pensacola" are split across three PMH URLs with overlapping titles and zero GC URL; the civilian head term is on the military domain

- meta: BOTH | medium | effort medium | confirmed
- Evidence: src/routeMeta.js: /pcs-guide title "Moving to Pensacola: Military PCS Guide", heading "PCS to Pensacola & the Emerald Coast". public/blog/pcs-to-pensacola-2026-complete-guide.html title "PCS to Pensacola 2026: Military Housing Guide". public/blog/moving-to-pensacola-2026-guide.html title "Moving to Pensacola, FL: The Complete 2026 Guide" (7,546 words, 164 military/PCS/BAH mentions, closing CTA "Start Your PCS Search"). content/blog/ledger.json target keywords: pcs post = "PCS to Pensacola, moving to Pensacola (...)
- Impact: The canonical PCS destination (/pcs-guide, per owner decision) carries a "Moving to Pensacola" title while the blog post carries the "PCS to Pensacola" title, so the two swap each other's primary keyword; meanwhile the civilian mega-guide archetype (...)
- Fix: (1) Swap titles: routeMeta.js /pcs-guide -&gt; "PCS to Pensacola: Military Housing Guide by Base (2026)"; keep the blog post as the long-form "orders-in-hand 90-day playbook" with primary "PCS orders Pensacola timeline". (2) Re-scope public/blog/moving-to-pensacola-2026-guide.html H1/title to "Moving to Pensacola on Military Orders: The 2026 Guide". (3) Publish the civilian "Moving to Pensacola, FL (2026): Cost of Living, Neighborhoods, Taxes, Insurance" on GC (brief in notes) with no PCS framing, linking both (...)
- Verifier: Confirmed. Fix is sound; note /pcs-guide is the owner-designated canonical PCS destination so the title swap strengthens rather than contradicts that decision. Also see missed item on em dashes in the same routeMeta entries.

#### [kw-09] Assumable VA is the site's best-converting commercial cluster (Bing position 1-2 with clicks) and searchers ask for a list, but the page offers only a text-for-list CTA and Google surfaces /faq instead of the dedicated page

- meta: PMH | medium | effort low | confirmed
- Evidence: Bing export: "va assumable loans in pensacola beach florida" pos 1.0, 33% CTR; "va assumable loan listing, pensacola, fl" pos 2; "va assumable loan list, pensacola, fl" pos 2; "where do you search for va assumable on florida mls" pos 1; "va assumable mortgages in pensacola" pos 2 (cluster avg pos 1.7, the best on the site). Live SERP "VA assumable loans Pensacola" (2026-09-02): lenders in slots 1-4, then pensacolamilitaryhousing.com/faq (slot 5) and the homepage (slot 6), then a single vrihomes.com listing; (...)
- Impact: Three of six ranking queries contain "list" or "listing"; the page that ranks answers "how assumption works". The inventory itself is the information gain competitors cannot fake and the reason to return weekly.
- Fix: Add a dated block near the top of public/assumable-va-loans-pensacola.html: "Assumable VA listings in the Pensacola MLS, updated &lt;date&gt;" as a table of area, price band, note rate, status (no addresses unless MLS/broker rules permit), refreshed weekly from the MLS sweep Gregg already runs (GROWTH-PLAN item 7 budgeted 10 min/week). Mark it up as ItemList and bump dateModified only when the list changes. Add "Pensacola Beach" and "Gulf Breeze" as named sub-sections since the beach query converts at 33%.
- Verifier: Confirmed. Fix caveat: note rate and assumability usually live in confidential MLS remarks; publish only area, price band, property type, and status (fields permitted under the local IDX display rules), never the note rate or address, and keep the (...)

#### [kw-10] No Fort Walton Beach / FL023 renter page: Bing ranks PMH 3-7 on FWB military-rental queries from a Pensacola-titled page

- meta: PMH | medium | effort medium | narrowed
- Evidence: Bing export: "houses for rent military in fwb florida" 4 impr pos 7; "military housing website fort walton beach fl" pos 3; "ft. walton beach rentals properties for military members living" pos 7 and "...military members" pos 5; "houses for military in fwb florida" pos 3; "destin fl military.base rentals" pos 4; "military housing in destin fl" pos 2; rentals cluster 9 queries, 14 impressions, 2 clicks. public/renting-on-bah-pensacola.html: title "Renting on BAH in Pensacola: 2026 Rates & Lease Guide", only 10 (...)
- Impact: Renters are the pipeline the two fastest-growing local competitors are built on; PMH has a Pensacola renter page and a landlord page (/military-rental-property-management) but nothing for the Eglin/Hurlburt side where Bing already ranks it without a matching (...)
- Fix: Create public/renting-on-bah-fort-walton-beach.html via scripts/page-factory.mjs (FL023 2026 rates E-1 to O-6, dated MLS rent bands for Mary Esther, FWB, Navarre, Niceville, Crestview, SCRA/PCS lease clauses, on-base wait vs off-base, AHRN/MilitaryByOwner/MLS search paths), add it to public/sitemap.xml and llms.txt, and link it from bases/hurlburt-field, bases/eglin-afb, communities/fort-walton-beach, the Pensacola renting page, and /military-rental-property-management. Retitle the Pensacola page's FL023 (...)
- Verifier: Core holds (no FL023-scoped renter page; Bing already positions PMH 3-7 on FWB rental queries), but the finder understated the Pensacola renting page's FWB coverage by nearly 3x. Severity medium is still fair given the 14-impression cluster is small.

#### [kw-11] Coastal Alabama (Orange Beach / Gulf Shores) is a dual-license differentiator with no GC page behind the two hub cards

- meta: GC | medium | effort medium | narrowed
- Evidence: Live SERP "Orange Beach realtor" (2026-09-02): Zillow x2, Trulia, gobellator.com, Yelp, U.S. News, brettrobinsonrealestate.com, remax-orangebeach-al.com x2; brokerage/agent sites hold 4 of 9 slots (versus 0 agent sites on "Pensacola realtor"). civilian-site/neighborhoods.html has Orange Beach, AL and Gulf Shores, AL cards (55 words) with no page behind them; civilian-site/llms.txt notes "Gregg is licensed in both states". content/civilian-blog/topic-queue.json #1 is "coastal-alabama-vs-panhandle" as an evergreen (...)
- Impact: Cross-state buyers comparing Perdido Key with Orange Beach are a civilian-lane audience with lower SERP competition than any Pensacola head term, and a dual-license framing is a claim competitors cannot copy.
- Fix: Ship /orange-beach-gulf-shores on GC via scripts/civilian-page-lib.mjs with a sourced Perdido Key vs Orange Beach comparison table (price bands, Baldwin vs Escambia millage, insurance, STR rules, condo assessments), Place JSON-LD for both towns, and FAQPage. Extend areaServed to Baldwin County AL in BOTH RealEstateAgent entities (civilian-site/index.html #team and pensacolamilitaryhousing.com index.html #agent) so the two entity graphs stay consistent. Only add IDX links after confirming (...)
- Verifier: Repo side is fully reproduced; the SERP-competitiveness claim that drives the severity is unverified here, so the finding is kept at medium on code evidence alone.

#### [kw-08] Two Whiting pages lead with 'housing' (a navigational term owned by Whiting Field Homes) while the site's #2 Bing query 'training air wing five' has no direct-answer block

- meta: PMH | low | effort low | narrowed
- Evidence: Live SERP "Whiting Field housing Milton FL" (2026-09-02): 9 of 9 results are Whiting Field Homes (rentcafe.com, apartments.com, zillow.com/apartments, facebook.com/WhitingFieldHomes, apartmentfinder.com, apartmentsearch.com, whitingfieldhomes.com x3). PMH targets it with public/bases/whiting-field.html ("NAS Whiting Field Housing & 2026 BAH | TRAWING-5 Guide") and public/nas-whiting-field-off-base-housing.html. Bing export: "training air wing five" is the #2 query on the whole site (15 impressions, pos 9.7, 0 (...)
- Impact: Two pages chase a query whose searcher wants a leasing office, while the student-pilot cohort (the buyer who holds for 12-18 months then sells or rents at winging, a repeat-transaction client) is already impressing at position 3-10 with no page written for (...)
- Fix: Retitle public/bases/whiting-field.html to "NAS Whiting Field PCS Guide: TRAWING-5, Where Students Live & 2026 BAH" and add an early H2 "What is Training Air Wing Five (TRAWING-5)?" with a 60-100 word answer, squadron list (HT-8, HT-18, HT-28, VT-2, VT-3, VT-6; verify current), and a link to /flight-school-housing-pensacola. On the flight-school page, add TRAWING-5 to the H1/lead and cross-link the base page. Leave public/nas-whiting-field-off-base-housing.html as the on-base-vs-off-base explainer but link to (...)
- Verifier: The finder's claim that the student-pilot cohort has 'no page written for them' is refuted: the flight-school page already answers three of the four proposed H2s. What remains is (a) two Whiting pages titled around 'housing', a token the privatized-housing (...)

#### [kw-12] GC first-time-buyer guide is Florida-generic on a SERP won by Pensacola program content (SHIP, City HOME, Hometown Heroes)

- meta: GC | low | effort low | confirmed
- Evidence: civilian-site/resources/first-time-home-buyer.html title "First-Time Home Buyer Guide for Florida | The Costin Team", H1 "Your first home, step by step"; grep finds 0 occurrences of "Hometown Heroes" or "down payment assistance" (only generic "Pensacola" mentions). Live SERP "first time home buyer Pensacola FL" (2026-09-02): cityofpensacola.com/183/Home-Buyers-Programs, choosecornerstone.com, hansenteampensacola.com/buyers/first-time-buyers, homewise-edu.com, homefinancialgroup.net, fha.com SHIP page ("loans up (...)
- Impact: A queue already identifies the winning long-tail (program names and dollar caps) but aims it at the wrong domain, while the civilian page that exists cannot rank because it names no program.
- Fix: Refresh civilian-site/resources/first-time-home-buyer.html into "First-Time Home Buyer in Pensacola (2026): SHIP, City HOME, Hometown Heroes, FHA Limits" with a program table (eligibility, cap, source URL, date checked), a link to the closing-costs blog post, and FAQPage entries phrased as the SERP questions. Retire the PMH queue item or keep it as the military twin pointing here (VA + Hometown Heroes stacking).
- Verifier: Confirmed on code evidence. Low severity is right. Fix works as written; after retitling, re-run node scripts/audit-civilian.mjs (title length and FAQ mirror gates) and keep the PMH /first-time-military-homebuyer page as the VA + Hometown Heroes twin so the (...)

Verifier-noted items outside the numbered list: PMH's single largest Bing query has 0% CTR at position 2 and no page title answers it. docs/seo-baselines/bing-keywords-2026-08-22.csv line 2: "pensacola fl military home buyer va" 19 impressions, 0 clicks, avg (...) | The em-dash standing rule is violated in the live /pcs-guide meta description and the scanner cannot see it. src/routeMeta.js lines 31, 43 and 45 contain em dashes ("A retired USAF officer's PCS guide - BAH by base…"), (...) | greggcostin.com is already publishing the archetype the strategy says loses, not just queuing it: civilian-site/blog/what-moves-mortgage-rates.html ("What Actually Moves Mortgage Rates") and (...) | The #2 landing page on PMH by Clarity sessions is a keyword-intent mismatch of the same shape as kw-03 and the finder did not flag it. evidence.md (Clarity, 2026-08-03..09-02): /communities/niceville 31 sessions, avg (...) | Neither queue nor page set targets the property-tax long tail that Bing already sends impressions to, even though public/va-disability-property-tax-florida.html is the site's most-cited page (119 Copilot citations per (...)

### Gap probe: PMH SPA /blog route: dead worker, STARTER_POSTS drift vs static public/blog.html

5 findings (2 medium, 3 low). Strengths noted: Crawlers can never see the SPA blog: a direct hit on https://pensacolamilitaryhousing.com/blog returns the static public/blog.html (identical &lt;title&gt;, 0 id="root", canonical self-referencing), src/routeMeta.js:66 marks blog shell: false so scripts/postbuild-spa-routes.mjs never emits a competing shell, and dist/blog.html is the copied static file with the static title (verified in dist/). | Post inventory is consistent everywhere it is declared: 11 files in public/blog/*.html match public/blog/index.json 1:1, public/sitemap.xml lists /blog plus 11 /blog/ URLs, public/llms.txt:47-48 documents the manifest URL for agents, and all six fallback slugs resolve HTTP 200 to real posts (no soft-404s). | The worker retirement in 0b2238a was clean: the live bundle has zero references to costin-blog or /api/posts, so there is no dead fetch, no 404 console noise, and no user-facing dependency on the missing service. | BlogPage already prefers the real manifest (App.jsx:2372-2380 fetches /blog/index.json first), so under normal conditions the SPA render lists the same 11 posts as the static page; the stale fallback is only reached on fetch failure. | Legacy blog paths are handled at the edge: /blog.html 301 -&gt; /blog (public/_redirects:95) and /blog/ 308 -&gt; /blog, both live-verified. | The static blog index carries a full entity graph (Blog + 11 BlogPosting with author @id and dateModified, BreadcrumbList, WebPage, Person, RealEstateAgent), which is the right shape for a Copilot-cited content hub. | The fix pattern already exists in the codebase: ExtTab (App.jsx:217-219) was applied to /reviews at :308 on 2026-08-12, so retiring the blog route is a one-line swap plus deletions, with no new abstraction needed.

Auditor notes: Data limits: Lighthouse/CrUX numbers were not available this run; none are cited. Clarity cannot distinguish SPA-rendered from static-rendered views of /blog (same URL), so the 5-session/7-view figure sizes total exposure, not the SPA share; /blog is a very low-traffic page (top post: florida-veteran-property-tax-county-guide, 3 views, 86% scroll). Verification split: worker status, direct-hit /blog, per-slug 200s, manifest, and live bundle contents are live-verified by curl on 2026-09-02; the client-side navigation behaviour (Tab -&gt; go -&gt; pushState -&gt; BlogPage) is code-verified from App.jsx and was not exercised in a browser. Judgment calls: the orchestrator's premise that the (...)

#### [blog-01] Two different /blog pages at one URL: nav Tab renders SPA BlogPage, direct hits serve public/blog.html

- meta: PMH | medium | effort low | confirmed
- Evidence: src/App.jsx:307 &lt;Tab id="blog" label="Blog" /&gt; -&gt; :213-215 Tab calls go(id) -&gt; :2714-2716 pushState("/blog") -&gt; :2850 {page === "blog" && &lt;BlogPage go={go} /&gt;}. Head is then rewritten by :2742-2758 from src/routeMeta.js:66 (title "Military Real Estate Blog | Pensacola", og:image forced to /og/home.png at :2755). Live direct hit: curl https://pensacolamilitaryhousing.com/blog -&gt; HTTP 200, &lt;title&gt;Military Real Estate Blog | PCS, VA Loans, BAH | Gregg Costin&lt;/title&gt;, 0 occurrences (...)
- Impact: Users who click Blog from any of the 7 SPA routes get a schema-less, filter-only listing with a different title/description/OG than the canonical static page; share/back/reload swaps documents; GA4 and Clarity split one URL into two titles. Crawler impact is (...)
- Fix: src/App.jsx:307 change to &lt;ExtTab href="/blog" label="Blog" /&gt; (ExtTab already defined at :217-219). Delete blog: "/blog" from PAGE_TO_SLUG (:2697), delete the render line :2850, delete the BlogPage component and STARTER_POSTS block (:2323-2432). Remove the blog entry from src/routeMeta.js:66 (META_BY_PAGE lookups fall back to home at :2743, and /blog can never reach the SPA because Cloudflare serves blog.html first). Update CLAUDE.md:16 component list accordingly.
- Verifier: Reproduced end to end in code and live. Fix is valid on this stack: scripts/postbuild-spa-routes.mjs:73 iterates only ROUTE_META.filter(e =&gt; e.shell), so deleting the shell:false blog entry from routeMeta.js:66 breaks nothing. One addition: also remove { (...)

#### [blog-02] CLAUDE.md documents a Blog API worker that is dead on the network and has had no callers since 2026-08-12

- meta: PMH | medium | effort low | confirmed
- Evidence: Live: curl -sI https://costin-blog.gregg-costin.workers.dev/api/posts -&gt; HTTP/1.1 404 Not Found, Content-Length 17, body error code: 1042 (Cloudflare worker-not-found); root / also 404. Code: grep -n 'BLOG_API\|/api/posts\|costin-blog' src/App.jsx = 0 matches; live bundle /assets/index-RLypSHbL.js (340,695 B) contains 0 matches for costin-blog and api/posts and 1 match for blog/index.json. git log -S BLOG_API -- src/App.jsx shows removal in 0b2238a (2026-08-12). CLAUDE.md:35 still reads: "Blog API (...)
- Impact: No runtime or visitor impact (the fetch was removed cleanly; no 404 console noise). The risk is operational: the standing instruction file tells every future agent/dev session that a remote CMS worker feeds the blog, so someone will debug or rebuild a (...)
- Fix: Rewrite CLAUDE.md:35 to: "Blog: posts are static pages in public/blog/&lt;slug&gt;.html generated by scripts/blog-factory.mjs, which also writes the manifest public/blog/index.json (blog-factory.mjs:337). The SPA has no blog API; the former costin-blog worker was retired 2026-08-12 (0b2238a) and returns Cloudflare error 1042." If blog-01 is applied, drop the BlogPage/STARTER_POSTS mention entirely and fix the ~1200-lines figure at CLAUDE.md:16. Nothing to decommission in Cloudflare: the worker already resolves as (...)
- Verifier: Fully reproduced. The current BlogPage at src/App.jsx:2372-2381 fetches the same-origin /blog/index.json (live 200, 5,931 B, application/json), so the proposed rewrite of CLAUDE.md:35 is accurate. Same CLAUDE.md block has a second stale line the finding did (...)

#### [blog-03] STARTER_POSTS fallback is stale (6 of 11 posts, old titles/readTimes) and ships 8.5 KB of never-rendered prose in every SPA load

- meta: PMH | low | effort low | confirmed
- Evidence: Scripted diff of src/App.jsx:2323-2367 vs public/blog/index.json: fallback has 6 posts, manifest has 11; missing from fallback: va-loan-assumption-buyers-guide (2026-08-23), florida-veteran-property-tax-county-guide (2026-08-22), living-in-gulf-breeze-pros-cons, best-pensacola-neighborhoods-by-rank-bah, moving-to-pensacola-2026-guide (all 2026-08-12/13). All 6 shared slugs drift: e.g. personal-property-activity-pcs-2026 title "What the New Personal Property Activity (PPA) Means for Your 2026 PCS to Pensacola" vs (...)
- Impact: Only surfaces when /blog/index.json fails to load (App.jsx:2375-2380), in which case users see 6 stale cards with superseded headlines and read times and miss the two newest Copilot-leading topics. Every SPA visitor pays roughly 3-4 KB compressed for prose (...)
- Fix: If blog-01 is applied this block is deleted outright. If BlogPage is kept, replace the array with a build-time import so it cannot drift: import STARTER_POSTS from "../public/blog/index.json"; (Vite bundles JSON natively) and delete the body fields; the runtime fetch at :2375 then only refreshes what the build already baked in.
- Verifier: Reproduced. The "3-4 KB compressed" figure is an estimate the finding did not measure; treat as unmeasured. Fix is valid: Vite 5 imports JSON natively and ../public/blog/index.json is inside the project root, so import STARTER_POSTS from (...)

#### [blog-04] Blog cards and manifest use the &lt;title&gt; tag, so two visible card headlines carry the "| Gregg Costin" brand suffix

- meta: PMH | low | effort low | confirmed
- Evidence: scripts/blog-factory.mjs:298 and :331 write title: s.title into the card HTML and index.json even though the spec contract at :8 also carries an h1 field. Result on public/blog.html:493 &lt;h2&gt;&lt;a href="/blog/pcs-to-pensacola-2026-complete-guide"&gt;PCS to Pensacola 2026: Military Housing Guide | Gregg Costin&lt;/a&gt;&lt;/h2&gt; and :525 2026 BAH Pensacola: What Can You Afford? | Gregg Costin, and the same string in the BlogPosting headline JSON-LD on that page. The posts' own H1s read "PCS to Pensacola in (...)
- Impact: Card headlines read like SERP snippets rather than article titles, and BlogPosting.headline disagrees with the article's H1 on 2 of 11 posts, a small consistency signal for both users and structured-data validators.
- Fix: In scripts/blog-factory.mjs add a helper const headline = s =&gt; (s.h1 || s.title).replace(/\s*\|\s*Gregg Costin$/, "") and use it in four places: :267 (card &lt;h2&gt;), :252 (blog-index BlogPosting list headline), :183 (post page BlogPosting headline, use spec), :331 (manifest title). Leave :298 (ledger) and the &lt;title&gt; tag on s.title. Re-run the factory so public/blog.html, public/blog/index.json, and the 11 post pages regenerate; strip the suffix from the two fragment title fields (...)
- Verifier: Substance confirmed; line references corrected (:267 not :268, :298 is the ledger). The finding understated scope: the post pages' own BlogPosting.headline (factory :183) carries the suffix as well, not just the index page, so the fix needs :183 and :252 (...)

#### [blog-05] Same dual-surface shape survives for /homestead (and an unreachable VALoanPage) via PAGE_TO_SLUG

- meta: PMH | low | effort low | confirmed
- Evidence: src/App.jsx:2695 homestead: "/homestead" and :2694 "va-loan": "/va-loans" remain in PAGE_TO_SLUG. Triggers: PCSPage button :1031 onClick={() =&gt; go("homestead")} and the footer Quick Links loop :719-721 ["pcs","homestead","neighborhoods","reviews","contact"].map(id =&gt; &lt;button onClick={() =&gt; go(id)}&gt; render HomesteadPage client-side at :2843. A direct hit or reload on /homestead 301s to /florida-homestead-exemption-military (public/_redirects:77); /va-loans 301s to /va-loan-guide (_redirects:69). (...)
- Impact: A user who reaches /homestead inside the SPA and reloads or shares the link lands on a different page than the one they saw; GA4 logs page_views for a URL that is a redirect for everyone else; VALoanPage is dead weight in the bundle. Same root cause as (...)
- Fix: In the same edit as blog-01: change :1031 to &lt;a href="/florida-homestead-exemption-military"&gt;Read the Homestead Exemption Guide&lt;/a&gt;; in the footer loop :719-721 drop "homestead" and "reviews" from the go() list and add &lt;a href="/florida-homestead-exemption-military"&gt; and &lt;a href="/reviews"&gt; anchors; delete homestead and va-loan from PAGE_TO_SLUG, delete render lines :2841 and :2843, delete VALoanPage and HomesteadPage, and remove their entries from src/routeMeta.js:62-63. PAGE_TO_SLUG then (...)
- Verifier: Reproduced in code and live. Fix is valid: the footer loop reads labels via pages.find (:719), so removing ids from the loop array and adding plain anchors is safe; postbuild only iterates shell:true routes so deleting routeMeta.js:62-63 is safe. Extend the (...)

Verifier-noted items outside the numbered list: PMH, same root cause as blog-05: five more unreachable render branches. src/App.jsx:2844-2848 render &lt;BaseGuide base="nas|whiting|corry|eglin|hurlburt" /&gt; for page ids that are NOT in PAGE_TO_SLUG (:2689-2699) (...) | PMH CLAUDE.md doc drift beyond blog-02: CLAUDE.md:36 says the contact form "POSTs JSON including a honeypot field named website", but src/App.jsx:876-877 and :2564-2565 send _gotcha: formData.honeypot (and the comment (...)

### Gap probe: PCS checklist deliverable: gate bypass, PDF content quality, and brief coverage of Corry/Saufley/Whiting

8 findings (3 high, 2 medium, 3 low). Strengths noted: Indexation of the lead-magnet PDF is handled at three layers and verified live: X-Robots-Tag noindex, nofollow is present on the apex and on the pages.dev twin, robots.txt repeats Disallow: /downloads/ inside every named user-agent group (RFC 9309 aware, public/robots.txt:5-8), and neither sitemap.xml nor llms.txt references the file. | All 16 BAH figures in the PDF match public/bah-rates.html (lines 496-551) and BAH_DATA in src/App.jsx exactly (E-5 FL064 $1,863 with / $1,644 without dependents; E-5 FL023 $2,433 / $2,157), and the PDF was generated on 2026-07-06, after the July 4 BAH corrections, so it carries verified DoD values. | Internal linking to the deliverable page is exemplary: all six base pages (NAS Pensacola, Corry Station, Saufley Field, Whiting Field, Eglin AFB, Hurlburt Field) link to /pcs-checklist 3-4 times each, 15 'Free PCS Checklist' CTA buttons sitewide point at it, the pcs-to-pensacola blog post links it 3 times, and the checklist links back to all seven base pages from the Bases nav plus body links to NAS Pensacola, Whiting, Eglin and Hurlburt. | The on-page checklist itself is top-tier PCS content: 40 timeline items plus 4 local mistakes and 8 FAQs, with correct local nuance (FL064 vs FL023 MHA split, parcel-level Escambia school zones, homestead March 1 deadline, DPS 75-day claim window, POA remote closings, the military driver's-license exemption) and a Sources block citing DTMO, VA Pamphlet 26-7, FDOR, FLDOE and the three county appraisers. | The capture flow instruments outcomes well: success stores pmh-inquiry-submitted in localStorage to suppress repeat prompts and fires a GA4 lead_magnet_download event with a distinct offline label (public/pcs-checklist.html:358), so once the payload is fixed the funnel is measurable without new tagging. | The PDF is engineered for print and speed: Letter size, white background with navy/gold brand, standard Helvetica (no embedded fonts), 2 pages at 6,549 bytes, served with a 4-hour public cache and ETag revalidation.

Auditor notes: Live checks were done with curl on 2026-09-02 (headers quoted verbatim). The contact worker source is not in the repo and no Cloudflare workers tool was available in this session; its contract (name+email+message required, honeypot read only from _gotcha, exact inquiryType stage map) comes from the project memory file and docs/marketing-ops.md, and I did NOT POST to the live worker because that would create a real FUB person and send real emails. No Lighthouse or CrUX data exists for this run and none is cited. Clarity traffic for /pcs-checklist (2 sessions / 30 days) comes from a small total sample (~407 sessions) so treat it as directional; it is still an order of magnitude below (...)

#### [pcs-01] Lead-magnet form breaks the contact-worker contract: wrong honeypot key and an inquiryType outside the stage map, so every checklist lead files as Prospect with no bot filter

- meta: PMH | high | effort low | confirmed | ORCHESTRATOR OVERRIDE: downgraded to low
- Evidence: public/pcs-checklist.html:364 sends {name, email, phone:'', inquiryType:'PCS Checklist Download', message:'Requested the free PCS checklist...', honeypot:(f.querySelector('[name=website]').value)} to https://costin-contact.gregg-costin.workers.dev (line 365). Live page source confirms the same strings (curl of /pcs-checklist: inquiryType:'PCS Checklist Download', honeypot:(f.querySelector('[name=website]'), name="website" x2, no _gotcha). Worker contract (memory project_contact_worker_contract.md, (...)
- Impact: The one form on the site built to capture early-stage PCS families (the highest-intent segment) drops them into FUB as Prospect instead of Lead, so the 2-hour follow-up task and Lead-stage automations never fire, and because the worker ignores the 'honeypot' (...)
- Fix: In public/pcs-checklist.html line 364 change the payload to: var data={name:name||'(not given)',email:email,phone:'',inquiryType:'PCS / Relocation - Buying',message:'Requested the free PCS checklist + BAH cheat sheet PDF from '+location.pathname+' (lead magnet)',_gotcha:(f.querySelector('[name=website]').value||'')}; (that inquiryType is the literal worker string and is the one permitted em dash). Keep 'PCS checklist' in the message so FUB still shows the source. Add .then(function(r){if(!r.ok)throw new (...)
- Verifier: Reproduced exactly as described; the only file that still uses the pre-Aug-12 payload. Fix is correct for this stack and mirrors the whats-my-home-worth.html pattern; the em dash in 'PCS / Relocation - Buying' is inside an inline &lt;script&gt;, which (...)
- Override: the deployed worker (workers/costin-contact/worker.js lines 24-26 and 49) accepts the honeypot key and maps "PCS Checklist Download" to Lead, both fixed 2026-08-12. The finder and verifier relied on the memory note instead of the worker source. Not a defect; key alignment is optional.

#### [pcs-02] The PDF is not the checklist the page promises: 17 generic items on a 90-60/30/move-week/first-30 timeline versus 40 Pensacola-specific items on the page's 60/30/7/arrival timeline, and the 'Email me the PDF' promise is never fulfilled by email

- meta: PMH | high | effort medium | narrowed
- Evidence: public/pcs-checklist.html:345 lm-head 'Free download: the printable Pensacola PCS Checklist + 2026 BAH Cheat Sheet' and :346 'Get this entire checklist plus a one-page 2026 BAH-by-base cheat sheet'. Button :351 'Email me the PDF', fine print :353 'I'll send the PDF'. The PDF (public/downloads/pensacola-pcs-checklist.pdf, 2 pages, 6,549 bytes, PDFKit, created 2026-07-06; pdftotext output) has 4+5+4+4 = 17 checklist items under '90-60 Days Out', '30 Days Out', 'Move Week', 'First 30 Days in Florida' (...)
- Impact: A reader who trades an email for 'this entire checklist' receives a shorter, less specific list than the free page, which undercuts trust at the exact moment the lead is created, and anyone who closes the tab expecting an email never receives the PDF. The (...)
- Fix: Make public/pcs-checklist.html the single source: in scripts/generate-lead-magnet-pdf.mjs, read the page, parse the H2/H3/&lt;li&gt; nodes between id=day-60 and 'Common Pensacola-Area PCS Mistakes' (strip &lt;a&gt; tags), and render them as the checklist pages (3 pages plus the BAH sheet is fine at this file size). Fix the subtitle to match the real sections. Change the button to 'Get the printable PDF' and the fine print to 'The download link appears here instantly; I may follow up personally about your PCS', (...)
- Verifier: Core claim holds: 17 generic items vs 40 page items, a subtitle that promises a 7-day section the PDF lacks, and an email promise that nothing fulfils. The finder's list of page specifics is partly invented (no parcel-level school zones, no POA closings on (...)

#### [pcs-03] The deliverable is offered only on a page that gets 2 sessions a month; /pcs-guide (14x the traffic, the canonical PCS destination) carries a third, different checklist and no PDF offer

- meta: PMH | high | effort medium | confirmed
- Evidence: Clarity 2026-08-03..09-02 non-bot: URL contains /pcs-checklist = 2 sessions, 2 page views, 37.5% scroll, 85s engagement; evidence.md lists /pcs-guide at 28 sessions (48% scroll) and /bah-rates at 27. src/App.jsx PCSPage (line 941 onward) links to /pcs-checklist or the PDF 0 times in its body (grep of lines 941-1120 finds only go('calculator') and go('homestead')); the only /pcs-checklist reference in the SPA is the PCS_LINKS dropdown entry at App.jsx:51. PCSPage's own 'Your PCS Timeline Checklist' (App.jsx (...)
- Impact: Four PCS timelines under one brand (60/30/7, 90/60/30, 90-60/30/move week, 90 days out through first 90) read as four different opinions, and the page with real PCS traffic never surfaces the lead magnet, so the capture mechanism has essentially no exposure (...)
- Fix: 1) In src/App.jsx PCSPage, directly after the 'Your PCS Timeline Checklist' section, add a compact CTA block: 'Want the printable 60/30/7 checklist and the 2026 BAH cheat sheet? &lt;a href="/pcs-checklist#lm-form"&gt;Get the free PDF&lt;/a&gt;' (or port the lm-box as a small component posting the same corrected payload). 2) Retitle the SPA section 'The short version (full 60/30/7 checklist here)' and re-bucket its 14 items into 60/30/7 so it matches the static page and the regenerated PDF. 3) Add the same (...)
- Verifier: All four timeline framings reproduced (60/30/7/arrival, 90/60/30, 90-60/30/move week/first 30, 90 before/first 90). The proposed CTA on PCSPage is a plain anchor to a static route, which works with the custom router (static pages are served by Cloudflare (...)

#### [pcs-04] Ten em dashes ship in the PDF (nine in body text, one in Author metadata); the em-dash gate never scans the generator or the PDF

- meta: PMH | medium | effort low | confirmed
- Evidence: scripts/generate-lead-magnet-pdf.mjs contains 8 U+2014 characters (grep -c): line 14 Author 'Gregg Costin, Realtor - Levin Rinke Realty' (visible in pdfinfo Author field), line 52 '90–60 Days Out - Set the Foundation', line 69 'funds-to-close - verify wire instructions', line 72 'Get your keys - welcome to the Gulf Coast', line 122 '130–150 times your monthly BAH - but ... different budget - because', line 127 'homes that fit - no pressure. - Gregg'. pdftotext -enc UTF-8 of (...)
- Impact: The standing house rule (no em dashes in any copy, enforced in the blog factory and the sitewide check) is violated in the one artifact readers keep and print, and the gate cannot catch it, so it will recur on every regeneration.
- Fix: In scripts/generate-lead-magnet-pdf.mjs replace each em dash with a colon or comma (e.g. '90 to 60 Days Out: Set the Foundation', 'Get your keys. Welcome to the Gulf Coast.', Author 'Gregg Costin, Realtor, Levin Rinke Realty'). Extend scripts/check-em-dashes.mjs to also scan scripts/generate-lead-magnet-pdf.mjs, or add a post-generation step: pdftotext public/downloads/pensacola-pcs-checklist.pdf - | grep -c $'\xe2\x80\x94' must return 0.
- Verifier: Confirmed, with the count corrected to 10 in source (9 rendered + 1 metadata); the finder missed lines 59 and 67. Fix correction: do not rely on pdftotext in the gate (present locally under mingw64 but not a project dependency); instead add (...)

#### [pcs-05] PDF names three of the four Pensacola installations (Saufley Field missing) and its driver's-license bullet contradicts the page's own correct military-exemption wording

- meta: PMH | medium | effort low | narrowed
- Evidence: scripts/generate-lead-magnet-pdf.mjs:87 FL064 inst line 'NAS Pensacola · Corry Station · NAS Whiting Field' (rendered on page 2 of the PDF); 'Saufley' appears 0 times in pdftotext output while the page mentions it 4 times and links /bases/saufley-field from the Bases nav (public/pcs-checklist.html:305). Eglin AFB and Hurlburt Field are present (line 91). PDF line 77: 'Get your Florida driver's license and vehicle registration.' The page at public/pcs-checklist.html:433 says 'Register for Florida driver's license (...)
- Impact: Saufley Field families (the page targets all seven bases and every base page links to this checklist 3-4 times) do not see themselves in the cheat sheet, and the flat license instruction tells active-duty readers to do something Florida does not require of (...)
- Fix: Line 87: 'NAS Pensacola · Corry Station · Saufley Field · NAS Whiting Field' and the same in src/App.jsx BAH_DATA.FL064.installations. Line 77: 'Decide on Florida residency. Active-duty members on current orders may keep an out-of-state license and registration (F.S. 322.031); switching often pays off for homestead and tax reasons.' Regenerate the PDF.
- Verifier: Saufley omission is real and also lives in App.jsx BAH_DATA (fix both). The license bullet is incomplete rather than false: members who elect Florida residency (which the page itself recommends) do need the license, so this is a nuance gap, not a factual (...)

#### [pcs-06] Gate bypass is real but low-risk: the PDF is served at the static path that is printed in the page source, while indexation is correctly blocked at three layers

- meta: PMH | low | effort medium | confirmed
- Evidence: Live curl -sI https://pensacolamilitaryhousing.com/downloads/pensacola-pcs-checklist.pdf: HTTP/1.1 200, Content-Type application/pdf, Content-Length 6549, Cache-Control public, max-age=14400, must-revalidate, x-robots-tag: noindex, nofollow, cf-cache-status REVALIDATED, ETag c1b58aa4...; a plain GET with no form submission downloads all 6,549 bytes. Path is a literal in public/pcs-checklist.html:357 (var PDF='/downloads/pensacola-pcs-checklist.pdf'). public/_headers:14-15 sets X-Robots-Tag on /downloads/*; (...)
- Impact: Anyone reading source or sharing the link gets the PDF without an email, so the 'gate' is advisory only. Given the PDF's current thinness this is not a meaningful leak, and search engines cannot index it; the decision is whether the deliverable is worth (...)
- Fix: Recommended: keep the soft gate (it costs nothing and email friction already suppresses traffic), but stop exposing the raw path before submit by moving the literal out of the inline script: have the worker return {pdf:'/downloads/pensacola-pcs-checklist.pdf?t=&lt;hmac&gt;'} in its JSON on success and render that. If a hard gate is wanted, serve the PDF from a route on the costin-contact worker that validates a short-lived HMAC token issued by the POST response, and remove public/downloads/ from the Pages build. (...)
- Verifier: Reproduced. Fix correction: Cloudflare Pages _redirects does NOT support a 404 status (developers.cloudflare.com/pages/configuration/redirects lists only 301/302/303/307/308 plus 200 rewrites and shows '/blog/* /blog/404.html 404' under unsupported), so the (...)

#### [pcs-07] No regeneration workflow: the PDF's BAH table is a hand-copied duplicate of BAH_DATA and the generator is not wired into any script or annual checklist

- meta: PMH | low | effort low | confirmed
- Evidence: scripts/generate-lead-magnet-pdf.mjs:87-94 hard-codes 16 BAH values; src/App.jsx:1184-1196 BAH_DATA and public/bah-rates.html:496-551 hold the same numbers (all 16 verified equal today, e.g. E-5 FL064 $1,863/$1,644, E-5 FL023 $2,433/$2,157). package.json references pdfkit (line 26) but no npm script runs the generator; git log shows the PDF committed once (d335431, 2026-07-06) two days after the BAH corrections (c5fc3a8, 681a400 on 2026-07-04); docs/*.md mention the lead magnet only as a July audit to-do (...)
- Impact: Figures are correct now, but the 2027 BAH release (mid-December) will update App.jsx and bah-rates.html through the documented annual edit while the PDF silently keeps 2026 numbers under a '2026 BAH Cheat Sheet' title that readers keep on their fridge.
- Fix: Add to package.json: "lead-magnet": "node scripts/generate-lead-magnet-pdf.mjs" and run it inside the build (or at least in the annual BAH procedure). Move the FL064/FL023 tables into a shared data module (e.g. src/data/bah.json imported by App.jsx and the generator) so the PDF cannot drift, and print 'BAH rates effective 1 Jan 2026 · generated &lt;date&gt;' in the page-2 footnote (line 130).
- Verifier: Confirmed. Fix note for this stack: App.jsx is bundled by Vite and the generator runs under plain Node, so a shared src/data/bah.js (ESM export) is safer than a .json import, which needs an import attribute in Node.

#### [pcs-08] PDF footer carries phone, brokerage and dual-state line but no Equal Housing Opportunity notice, no email, no brokerage address, and no license identifier, unlike the page's own footer

- meta: PMH | low | effort low | confirmed
- Evidence: scripts/generate-lead-magnet-pdf.mjs:25-26 footer text: 'Gregg Costin, Realtor® · Retired USAF Combat Systems Officer · Levin Rinke Realty · Licensed FL & AL' and '(850) 266-5005 · pensacolamilitaryhousing.com'. pdftotext of both pages: 0 occurrences of 'Equal Housing', '@', '220 W. Garden' or any license number. The HTML page footer (public/pcs-checklist.html:564, 570) prints 'Levin Rinke Realty · 220 W. Garden Street, Pensacola, FL 32502 · Licensed FL & AL' and the disclaimer ends with 'Equal Housing (...)
- Impact: A printable handout that circulates off-site is advertising; it should carry the same fair-housing notice and identifying details as the page so the brand signals (and any compliance review) stay consistent. Minor today, but cheap to fix before the PDF is (...)
- Fix: In footer() add a third line: 'Levin Rinke Realty · 220 W. Garden Street, Pensacola, FL 32502 · gregg.costin@gmail.com · Equal Housing Opportunity' (use whichever email the NAP master sheet designates; evidence.md notes three variants in use) and, if Gregg wants it, his FL license number as used on other print collateral.
- Verifier: Reproduced as stated; low severity is right. Pick one email variant (evidence.md notes three in use) before adding it to the footer.

Verifier-noted items outside the numbered list: src/App.jsx BAH_DATA.FL064.installations (line ~1187) reads 'NAS Pensacola • NTTC Corry Station • NAS Whiting Field', so the SPA /pcs-guide BAH grid also omits Saufley Field, not just the PDF; public/bah-rates.html (...) | PDF page-1 subtitle (scripts/generate-lead-magnet-pdf.mjs:51) calls Pensacola 'the Emerald Coast'; the site otherwise brands Pensacola as Gulf Coast (the PDF's own line 72 says 'welcome to the Gulf Coast'). Minor (...) | The lead-magnet script sets localStorage 'pmh-inquiry-submitted' and fires the GA4 conversion even on the offline/catch path (public/pcs-checklist.html:358), so a failed POST both suppresses later inquiry prompts and (...)

### Gap probe: RealEstateListing / SingleFamilyResidence coverage and the 825bayshore listing subdomain

7 findings (3 high, 2 medium, 2 low). Strengths noted: 825bayshore is a well-built single-property page at the technical level: HTTP 200 with no redirect chain, self-canonical (line 9), robots index/follow with no x-robots-tag, its own robots.txt and an image sitemap listing five captioned photos, descriptive alt text with width/height on every image, fetchpriority=high on the hero and lazy loading on the rest, geo coordinates, MLS identifier, seven amenityFeature entries and an Offer that already carries price, priceCurrency and availability. | IDX attribution hygiene is clean across both sites: 140 greggc.levinrinkerealty.com references in 98 files and zero www.levinrinkerealty.com links anywhere, so no outbound inventory click can land in the brokerage pool. | Outbound conversion tracking is uniform: the shared GA4 click handler (property_page_click, idx_search_click, realscout_signup_click, home_valuation_click) is present on every page of both sites, the subdomain fires its own inquiry event, and all three hosts report into one GA4 property (G-W29GHBK38M), so a listing-page-to-lead funnel can be read end to end. | greggcostin.com already exposes stable entity anchors (#gregg, #team, #brokerage, #website at civilian-site/index.html:38-50 and team.html:37-43), which is exactly what listing markup needs to point at; no entity refactor is required before adding RealEstateListing. | civilian-site/search.html pairs the RealScout onboarding iframe (line 243) with 12 city-filtered IDX cards and clean WebPage/BreadcrumbList schema, and /buy carries a Service node with serviceType and @id (buy.html:40); the transactional surfaces are structurally sound and only lack listing entities. | The civilian audit gate (scripts/audit-civilian.mjs, 0 findings on 102 pages) and the em-dash checker already exist, so extending coverage to the listing subdomain is a path-list change rather than new tooling.

Auditor notes: Data limits and judgment calls. (1) The subdomain source is not in the repo (find -iname '*bayshore*' returns nothing), so subdomain citations use line numbers from the served HTML fetched by curl on 2026-09-02 (439 lines, saved to the scratchpad as 825.html); fixes there must be applied wherever that Pages project is sourced. (2) The 2026-09-02 spot check claiming zero @type strings on the subdomain was wrong; one JSON-LD block with 15 @type values is present. The em-dash count of 19 reproduced exactly. (3) greggc.levinrinkerealty.com and Zillow both return 302-to-proof-of-work then 403 for curl, so two things stay unverified: whether the /map/ view carries Gregg's aid-bearing forms, and (...)

#### [list-01] 825bayshore inquiry form runs the dead-honeypot and misfiled-lead pattern fixed elsewhere on Aug 12

- meta: GC | high | effort low | confirmed
- Evidence: Live https://825bayshore.greggcostin.com/ (served HTML, 439 lines, fetched 2026-09-02): line 425 builds the payload as {name, email, phone, inquiryType:get('inquiryType'), message:..., honeypot:get('website')} and POSTs to https://costin-contact.gregg-costin.workers.dev; lines 395-399 offer options 'Schedule a Showing (em dash) 825 Bayshore #803', 'Question About This Condo', 'VA Loan / Financing Questions', 'I Have a Home to Sell Too', 'General Buyer Inquiry' with no value attributes. The worker reads only (...)
- Impact: Every showing request from the only live listing page files in FUB as Prospect instead of Lead (no Lead-stage automations fire) and bot submissions pass because the honeypot key is ignored server-side. The message field is always non-empty (the page appends (...)
- Fix: In the subdomain source (not in this repo): change honeypot:get('website') to _gotcha:get('website'); give each option a stage-map value and keep the label as display text: &lt;option value="First-Time Home Buyer"&gt;Schedule a Showing: 825 Bayshore #803&lt;/option&gt;, &lt;option value="First-Time Home Buyer"&gt;Question About This Condo&lt;/option&gt;, &lt;option value="VA Loan Questions"&gt;VA Loan / Financing Questions&lt;/option&gt;, &lt;option value="Selling My Home"&gt;I Have a Home to Sell (...)
- Verifier: Reproduced exactly as stated. None of the five labels matches a stage-map string, so every submission from this page files as Prospect, and the honeypot key is one the worker ignores. The source tag appended to message guarantees the form never 400s, which (...)

#### [list-02] 825bayshore JSON-LD is a bare Apartment node with semantic errors, not a RealEstateListing

- meta: GC | high | effort low | confirmed
- Evidence: Live served HTML lines 49-92: single block, root "@type":"Apartment" (line 52); no @id, no datePosted; line 82 offers.seller is RealEstateAgent 'Gregg Costin' (the listing agent is not the seller); line 83 'broker' property (schema.org defines broker on Offer/Demand/Order, not Apartment); line 60 floorLevel holds prose 'Full-service waterfront condominium'; line 89 worksFor @type 'RealEstateOrganization' (not a schema.org type; the same bug converted on 114 static pages in July 2026); broker.url is (...)
- Impact: The one listing-shaped page on either brand does not emit a listing entity, is not tied to the Person or RealEstateAgent entities on greggcostin.com, and carries an invalid type plus two off-domain properties that validators will flag. AI answer engines (...)
- Fix: As proposed, with: floorLevel "8" (page line 280 already says eighth floor); datePosted taken from the real MLS list date rather than 2026-07-02; delete the top-level broker key (broker is only valid on Invoice/Order/Reservation/Service); keep offers but replace seller with offeredBy {"@id":"https://greggcostin.com/#gregg"}; broker.url / Person.url must be https://greggcostin.com (apex), not www.
- Verifier: All observations reproduce. Two corrections: (1) schema.org defines broker on Invoice, Order, Reservation and Service, not on Offer/Demand/Order as the finding says; the conclusion (invalid on Apartment) still holds. (2) The page itself states the unit is on (...)

#### [list-03] 'Homes for Sale Near &lt;base&gt;' H2 sections on six base pages contain no search CTA at all

- meta: PMH | high | effort medium | narrowed
- Evidence: public/bases/nas-pensacola.html:479 (section links only /communities/gulf-breeze, pace, navarre, cordova-park, cantonment), corry-station.html:440 (3 community links), hurlburt-field.html:430 (1 community link), whiting-field.html:480 (only /bah-rates), duke-field.html:435-444 and eglin-afb.html:461-468 (zero anchors of any kind); saufley-field.html has no such section. Zero &lt;a href="https://greggc.levinrinkerealty.com..."&gt; anchors exist in any base page: the only occurrences are the GA click handler (line (...)
- Impact: The highest-intent heading on the base pages (matching Bing top-impression queries such as 'Eglin AFB homes for sale') dead-ends into prose and an email ask. Clarity shows /bases/whiting-field average scroll depth 49%, so readers do reach these sections. The (...)
- Fix: Add the two-button .rs-btn row (pcs-home-search.html:337 markup) to each 'Homes for Sale Near' H2 section and create the section on saufley-field.html. Cheapest on-site variant that keeps users on PMH first: link the secondary button to /pcs-home-search?max={E-5 with-dependents price cap from /bah-to-mortgage-guide line 344, e.g. 285000} because pcs-home-search.html:404-412 already reads ?max= and applies pricemax to all 13 IDX links; or link straight to the greggc /map/ template with city[] and pricemax (...)
- Verifier: The core claim holds and is if anything understated: the 'Homes for Sale Near' sections on six base pages contain no search CTA, and the community-link counts cited in the evidence were too generous (nas-pensacola has one community link inside the section, (...)

#### [list-04] The listing subdomain is orphaned from both entity graphs and breaks the tandem cross-link rule

- meta: GC | medium | effort low | confirmed
- Evidence: Repo: the only anchor to the subdomain on either property is civilian-site/sell.html:258 (a bullet inside 'what you get', target=_blank); every other repo match is the GA click-handler branch (civilian-site/sell.html:47 property_page_click) replicated on 100+ pages, plus docs/SITE-AUDIT-2026-07.md and scripts/add-outbound-tracking.mjs. Live: greggcostin.com/sitemap.xml 0 matches, pensacolamilitaryhousing.com/sitemap.xml 0 matches, no sameAs on either site references it, greggcostin.com/, /buy, /team, /search (...)
- Impact: A fully built, indexable page (200, index/follow, self-canonical, own robots.txt and image sitemap) receives one deep-list link, so crawlers and AI engines cannot connect the listing to the Person entity or the military brand; the standing rule that every (...)
- Fix: (1) Subdomain footer: add the family line used on both sites, with apex URLs: &lt;p data-costin-sites&gt;Part of the Costin Team family: &lt;a href="https://greggcostin.com"&gt;GreggCostin.com&lt;/a&gt; and &lt;a href="https://pensacolamilitaryhousing.com"&gt;PensacolaMilitaryHousing.com&lt;/a&gt;&lt;/p&gt;, and change the two www.greggcostin.com hrefs (lines 232, 378) to https://greggcostin.com and https://greggcostin.com/team. (2) GC: add a dofollow 'Featured listing' card on /buy next to the city links (...)
- Verifier: Reproduced in full. Fix is correct for this stack: family line with apex URLs on the subdomain footer, a dofollow card on civilian-site/buy.html near line 268, remove target=_blank at sell.html:258, and keep the listing out of sameAs.

#### [list-07] 825bayshore has 19 em dashes and sits outside every repo quality gate

- meta: GC | medium | effort low | confirmed
- Evidence: Live served HTML: 19 U+2014 characters (count reproduced), including &lt;title&gt; line 7 '825 Bayshore Dr #803, Pensacola FL 32507 (em dash) $109,900 Waterfront 1BR' (69 chars), og:title line 34, twitter:title line 40, JSON-LD name line 53, logo alt text line 238, lead prose line 247, and a CSS comment line 215. Repo: find -iname '*bayshore*' returns nothing outside node_modules/dist, so scripts/check-em-dashes.mjs and scripts/audit-civilian.mjs never run against it; its GA id is the shared G-W29GHBK38M.
- Impact: The standing no-em-dash rule is broken on a public page carrying the civilian brand, and none of the gates that keep the other 203 pages clean (em dashes, form contract, schema validity, cross-links) can catch regressions there.
- Fix: Bring the subdomain source into the repo (e.g. civilian-listings/825bayshore/), add that directory to the list at scripts/check-em-dashes.mjs:22, run a slim form-contract and cross-link check against it, and replace all 19 em dashes; &lt;title&gt; '825 Bayshore #803, Pensacola FL: $109,900 Waterfront 1BR' (56 chars), og/twitter 'The Bayshore #803: 1BR Waterfront Condo, $109,900', JSON-LD name 'The Bayshore Unit 803, One-Bedroom Waterfront Residence', alt 'The Costin Team, Gregg Costin, Realtor'.
- Verifier: Reproduced in full. One correction to the fix: the proposed replacement &lt;title&gt; '825 Bayshore Dr #803, Pensacola FL 32507: $109,900 Waterfront 1BR Condo' is 71 characters, not 58; use something like '825 Bayshore #803, Pensacola FL: $109,900 Waterfront (...)

#### [list-05] No RealEstateListing, SingleFamilyResidence or listing ItemList anywhere; a JSON-driven featured-listings block is the cheap, worthwhile version

- meta: BOTH | low | effort medium | narrowed
- Evidence: grep across index.html, public/, civilian-site/, src/: RealEstateListing 0, SingleFamilyResidence 0, "@type":"ItemList" 1 (civilian-site/neighborhoods.html:39, a neighborhood list, not listings), "@type":"Offer" in public/ 1 (public/bah-rates.html:45, WebApplication price 0, appropriate). civilian-site/search.html schema is WebSite, WebPage, BreadcrumbList only although it holds 12 city IDX cards (lines 260-271) and a RealScout iframe (line 243, the only iframe on either site); civilian-site/buy.html has 8 city (...)
- Impact: Neither brand ever emits a listing entity from its own domain, so 'Gregg Costin listings' has nothing to ground on except the orphaned subdomain. Google has no rich result for RealEstateListing, so the payoff is entity completeness, AI-answer grounding, and (...)
- Fix: As proposed (content/listings.json + a small civilian factory step rendering a Featured listings row on /buy after line 275 and /sell near line 258 with an ItemList of RealEstateListing items), but only after list-02 and list-04 are done; those two deliver most of the entity value on their own.
- Verifier: Every factual claim reproduces (line range for search.html cards is 260-275, not 260-271). Severity is overstated: the finding itself concedes there is no rich result for RealEstateListing, and once list-02 is applied the one real listing already emits a (...)

#### [list-06] index.html carries 17 Offer nodes that are empty shells or assert a $0 service price

- meta: PMH | low | effort low | confirmed
- Evidence: index.html:184-197: 14 makesOffer entries on the RealEstateAgent #agent node (index.html:94-95), each only {"@type":"Offer","itemOffered":{"@type":"Service","name":...}} with no price, priceCurrency, availability, areaServed or url. index.html:324, :338, :352: three Service nodes (VA Loan Homebuyer Consultation, PCS Relocation Planning, First-Time Military Homebuyer Coaching) with "offers":{"@type":"Offer","price":"0","priceCurrency":"USD"} and no availability or itemOffered. The Offer field audit script parsed (...)
- Impact: Validator noise on the SPA home without any added fact, and a literal price of 0 USD on brokerage services is a false price signal that a knowledge graph may surface as 'service price: $0' rather than 'free consultation'.
- Fix: Replace the makesOffer array with one hasOfferCatalog: {"@type":"OfferCatalog","name":"Military relocation services","itemListElement":[{"@type":"Offer","itemOffered":{"@type":"Service","name":"PCS Relocation Consultation","serviceType":"Military Relocation Consultation","provider":{"@id":"https://pensacolamilitaryhousing.com/#person-gregg"},"areaServed":{"@type":"AdministrativeArea","name":"Florida Panhandle"}}}, ...]} and dedupe against the three standalone Service blocks; delete the price 0 offers (keep at (...)
- Verifier: Reproduced exactly. Low severity is right: validator noise plus a literal $0 service price. Fix (single hasOfferCatalog, drop price 0, keep bah-rates.html:45 as is) is implementable in index.html without touching App.jsx.

Verifier-noted items outside the numbered list: Cheap on-site alternative for list-03 that the finder did not use: public/pcs-home-search.html:404-412 already accepts ?max=N and applies pricemax to all 13 IDX links, so base pages can link to (...) | 825bayshore JSON-LD internal inconsistency not called out: line 60 floorLevel is prose while the visible copy at line 280 states 'Eighth-floor'; and numberOfRooms: 1 (line 57) for a unit with a bedroom, bath, kitchen (...) | The 825bayshore page's inquiry &lt;select&gt; default option (line 395, selected) means the most common submission ('Schedule a Showing') is precisely the one that never matches a stage string; when list-01 is applied, (...)

### Gap probe: PMH OG/Twitter/canonical completeness (no audit gate exists on the military side)

5 findings (2 high, 1 medium, 2 low). Strengths noted: Structural canonical and social layer is complete on every static page: 94 of 94 files have exactly one self-referential canonical equal to the sitemap loc, og:url equal to canonical, hreflang en-US and x-default equal to canonical, zero .html canonicals and zero duplicate tags (scratch script audit-pmh-og.mjs, 0 structural problems); live-verified with curl on /va-loan-guide, /bases/nas-pensacola, /communities/niceville, /blog/pcs-to-pensacola-2026-complete-guide, /about and /pcs-guide, all matching the repo byte for byte. | A branded, page-specific 1200x630 OG card exists for every URL: 106 of 106 PNGs in public/og measure exactly 1200x630 (sharp metadata), 20-73 KB each, with og:image:width/height declared and twitter:card=summary_large_image on 100% of pages; live HEAD requests return image/png with the explicit 30-day cache policy from public/_headers:32-33. | SPA shells are drift-proof by construction: scripts/postbuild-spa-routes.mjs asserts every head anchor before replacing it (lines 27-33) and re-asserts after the transform (lines 117-121) so an index.html head edit fails the build; src/routeMeta.js is the single source for the build-time shells, scripts/generate-spa-og-images.mjs, and the runtime head sync in src/App.jsx:2740-2758; live /about and /pcs-guide carry their own title, canonical, hreflang, og:url and a per-route og:image (og/about.png, og/pcs-guide.png), not a generic one. | Blog posts carry correct per-post article:published_time and article:modified_time on 11 of 11 posts, written by scripts/blog-factory.mjs:186-187 from the fragment spec and mirrored in BlogPosting JSON-LD, with real spread (2026-03-20 through 2026-08-23) rather than bulk stamps. | The pages.dev twin serves apex canonicals and og:url (live: pensacolamilitaryhousing.pages.dev/bases/nas-pensacola returns canonical https://pensacolamilitaryhousing.com/bases/nas-pensacola), so the missing x-robots-tag noted in the evidence file is mitigated at the canonical layer. | Legacy URL hygiene is thorough: public/_redirects lines 9-132 301 every .html twin and renamed slug directly to its clean canonical with no chains, and scripts/normalize-canonicals.mjs discovers slugs dynamically so new pages cannot regress to .html canonicals.

Auditor notes: Scope and method: read-only; no repo files modified. Scratch scripts: audit-pmh-og.mjs (tag extraction, sitemap and og-file cross-check, sharp dimension check on all 106 PNGs), og-staleness.mjs (current H1 vs H1 at each PNG's last-written commit via git show), og-card-defects.mjs (re-runs the generator's own extractTitle and wrap on the historical H1 to classify card text), all under the session scratchpad. Code-verified: 94 files (index.html + 56 public + 7 bases + 19 communities + 11 blog) plus the 5 SPA shells via src/routeMeta.js, scripts/postbuild-spa-routes.mjs and dist/. Live-verified (curl, 2026-09-02): /va-loan-guide, /bases/nas-pensacola, /communities/niceville, (...)

#### [og-01] 71 of 93 live OG share cards render raw HTML entities, em dashes, or a stuttering repeated-word last line

- meta: PMH | high | effort low | confirmed
- Evidence: scripts/generate-og-images.mjs:71-74 extractTitle() strips tags but never decodes entities, then line 91 escapeXml() re-escapes, so an H1 containing &amp; or &mdash; is painted literally; lines 38-45 wrap() packs the last line with words[words.indexOf(w)+1] in a while loop whose index never advances, so it appends the same next word until maxChars. Cards were last written 2026-04-27 / 2026-08-12 (git log per PNG) from H1s that still carried em dashes; the em-dash purge later changed 58 H1s (git show at each PNG's (...)
- Impact: Every base, community, guide and blog URL shared to Facebook, LinkedIn, iMessage, Slack, Teams or X shows a card with visible markup garbage and a house-rule em dash, including the pages that lead Copilot citations and organic entries (flood zones, (...)
- Fix: In scripts/generate-og-images.mjs: decode entities inside extractTitle() before returning (replace &amp;, &mdash;/&ndash;, &rsquo;/&#39;, &nbsp;); rewrite wrap() as an index loop that advances i while packing the last line and appends an ellipsis when words remain; allow a 4th line or drop font-size to 56 for H1s over ~90 chars; move the shared SVG template into one module used by both generate-og-images.mjs and generate-spa-og-images.mjs so SPA cards get the agent/phone footer; change ogPath() (lines 149-152) to (...)
- Verifier: Reproduced exactly (71/93, 58 changed H1s). Two corrections to the fix: (a) simply re-running npm run og-images without the code change does not solve it (45/93 still defective), so steps 1-2 are mandatory; (b) filename versioning must be done in ogPath() at (...)

#### [og-02] No audit gate on the 101 PMH URLs; OG image creation for new pages is a manual step the factories do not perform

- meta: PMH | high | effort medium | confirmed
- Evidence: scripts/audit-civilian.mjs:8 ROOT='civilian-site' (GC only); package.json scripts (dev, prebuild=check-em-dashes+bump-dates, build, og-images, blog, indexnow) contain no PMH audit; no script under scripts/ walks public/ for canonical or OG checks. scripts/blog-factory.mjs:176 and scripts/page-factory.mjs:86 only string-replace '/og/first-time-military-homebuyer.png' with '/og/&lt;slug&gt;.png'; the PNG is created only by a separate manual 'npm run og-images' (.claude/skills/blog-engine/SKILL.md:152, (...)
- Impact: With no gate, a skipped og-images step ships a new blog post whose og:image 404s, a head edit can silently drop hreflang or canonical on one of 94 hand-maintained files, and defects like og-01 persist for months unseen. GC has had this protection since its (...)
- Fix: Add scripts/audit-military.mjs mirroring audit-civilian.mjs (walk index.html + public/*.html + bases + communities + blog; exit 1 on any finding) and call it in package.json prebuild after check-em-dashes and in blog-engine STEP 5. Keep checks 1-9 and 11-14 as proposed. For check 6 also require that every public/og/*.png is referenced. For check 10, verify every page is in sitemap.xml and every &lt;loc&gt; maps to a file or a shell:true routeMeta entry, but do NOT require lastmod == article:modified_time until (...)
- Verifier: Current state is clean; the gap is the absence of a gate, which is real. One item in the proposed gate would fail every build as written: check 10 'sitemap lastmod equals article:modified_time' conflicts with scripts/bump-dates.mjs:39, which blanket-rewrites (...)

#### [og-03] Em dash served in the live description, og:description, twitter:description and JSON-LD of /pcs-guide and in the about/communities shell intros; check-em-dashes.mjs never scans src/routeMeta.js

- meta: PMH | medium | effort low | narrowed
- Evidence: src/routeMeta.js:43 description string contains an em dash between 'PCS guide' and 'BAH by base'; intro strings at lines 31, 45, 52 also carry em dashes and are rendered into the no-JS shell paragraph by scripts/postbuild-spa-routes.mjs:62. postbuild-spa-routes.mjs:79 writes the description three times (name, og, twitter). LIVE: curl https://pensacolamilitaryhousing.com/pcs-guide returns og:description, twitter:description and meta description each containing the em dash. scripts/check-em-dashes.mjs:21-23 scans (...)
- Impact: /pcs-guide is the owner-designated canonical PCS destination (28 sessions per 30 days, 48% scroll) and the description is the exact string Google, Bing and AI engines quote; the one editorial rule enforced everywhere else is broken on the flagship SPA route (...)
- Fix: Rewrite src/routeMeta.js lines 31, 43, 45 and 52 with a colon or comma; add join(ROOT, 'src/routeMeta.js') to the source scan in scripts/check-em-dashes.mjs next to line 58 (same comment-stripping treatment as App.jsx); npm run build and redeploy so dist/about.html, dist/pcs-guide.html and dist/communities.html pick up the new strings.
- Verifier: Confirmed on /pcs-guide (description in all three metas + JSON-LD + intro) and on the about/communities intros, but 'all five shells' fallback copy' is overstated: 3 of 5 shells carry the em dash, and only /pcs-guide has it in the crawler-quoted description. (...)

#### [og-04] 88 static pages omit twitter:title, twitter:description, twitter:url and og:locale; 93 lack max-video-preview in robots, diverging from the GC head contract

- meta: PMH | low | effort low | confirmed
- Evidence: Scratch scan: twitter:title present on 6 of 94 files only (index.html, public/blog.html, public/pensacola-flood-zones-homebuyers.html, public/va-approved-condos-pensacola.html, public/communities/mary-esther.html, public/communities/shalimar.html); og:locale on 1 of 94 (index.html:74); grep -L max-video-preview over public/**/*.html = 93 files (index.html:58 has it). LIVE: curl of /va-loan-guide, /bases/nas-pensacola, /communities/niceville and /blog/pcs-to-pensacola-2026-complete-guide each show only og:title, (...)
- Impact: Limited today because X falls back to og:* and Google ignores og:locale, but the two brands now carry different head contracts, and any PMH gate modelled on the civilian one will flag 88 pages on day one. Cheapest to close before the gate lands.
- Fix: One idempotent script in the style of scripts/add-hreflang.mjs over the 93 public pages: insert after the twitter:card tag &lt;meta name="twitter:title" content="{og:title}"&gt;, &lt;meta name="twitter:description" content="{og:description}"&gt;, &lt;meta name="twitter:url" content="{canonical}"&gt; and &lt;meta property="og:locale" content="en_US"&gt;; normalise robots to index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1; then add the same tags to the page-factory/blog-factory template so (...)
- Verifier: Counts reproduce exactly. Impact is correctly rated low: X/Twitter falls back to og:title/og:description, and twitter:url is not part of X's documented card properties (harmless but cosmetic parity with the GC contract). Fix is implementable as an idempotent (...)

#### [og-05] og:type=article with article:* timestamps on 7 lead-capture/utility pages; bump-dates --html can still blanket-stamp when run without --changed

- meta: PMH | low | effort low | narrowed
- Evidence: public/reviews.html, faq.html, buy.html, sell.html, whats-my-home-worth.html, book-pcs-call.html, pcs-home-search.html all carry &lt;meta property="og:type" content="article"&gt; plus article:published_time / article:modified_time (92 of 94 pages are article; only index.html and public/blog.html are website). Distribution of article:modified_time across the 94 files: 60 pages share 2026-07-06T00:00:00Z, 17 share 2026-08-12, 11 share 2026-08-24. scripts/bump-dates.mjs:77 rewrites every page's article:modified_time (...)
- Impact: Minor: a reviews or home-value capture page typed as an article is semantically wrong for scrapers, and a modified_time that moves on 60 pages at once tells Bing and AI crawlers the content changed when it did not, the same false-freshness pattern the (...)
- Fix: Set og:type to website and remove article:published_time/article:modified_time on public/reviews.html, faq.html, buy.html, sell.html, whats-my-home-worth.html, book-pcs-call.html and pcs-home-search.html (keep WebPage dateModified in JSON-LD). In scripts/bump-dates.mjs make --html imply --changed by default and require an explicit --all flag for a blanket pass (change line 27 to const onlyChanged = !args.includes('--all')), so an accidental sitewide stamp cannot happen. Add gate check 8 (published &lt;= modified, (...)
- Verifier: The og:type=article half is confirmed. The 'bulk-stamped rather than content-driven' half is overstated: the tool already has the content-driven mode the finder proposes to add (--html --changed, git-status based), and the shared 2026-07-06 date reflects (...)

Verifier-noted items outside the numbered list: BOTH, low: og:image:alt is absent on every page of both sites. grep 'og:image:alt' returns 0 of 94 PMH files (index.html + public/**) and 0 of 103 civilian-site HTML files; scripts/audit-civilian.mjs does not require (...) | PMH, low (extends og-01 fix 4): scripts/generate-spa-og-images.mjs:23-36 carries its own wrap() defect: when a heading needs more than 3 lines it breaks at line 32 after pushing the 3rd line, then drops the remainder (...)

### Gap probe: Parse-level JSON-LD validity on both sites and local-vs-live block integrity

7 findings (1 high, 1 medium, 5 low). Strengths noted: Parse-level integrity is perfect: 826 JSON-LD blocks across 197 files (index.html, public/**, civilian-site/**) all JSON.parse cleanly, 0 unknown properties against the full schema.org vocabulary, 0 @id values defined with conflicting @type on any page, and the only unknown @type anywhere is the already-known RealEstateOrganization in index.html. | Local equals live: 199 of 203 sitemap URLs on both sites serve JSON-LD blocks canonically identical to the repo (the other 4 are two llms.txt entries, the uncommitted GC draft URL, and /blog which matches public/blog.html exactly); Cloudflare transforms, Brotli and the build pipeline leave every block byte-equivalent, and no Rocket Loader is injected. | FAQPage is mirrored 1:1 on all 104 FAQ pages: every Question.name in the schema appears as a visible &lt;details&gt;&lt;summary&gt; on the same page (the one count mismatch on bah-rates is a non-FAQ calculator disclosure at line 398, not a schema gap), and no page carries more than one FAQPage, so the manual-action risk for hidden FAQ markup is zero. | All 194 BreadcrumbList pages across both sites have exact 1..n position sequences with name and item on every non-terminal crumb; 0 skips, 0 repeats. | The civilian entity graph validates clean at the source: validator.schema.org returns 0 errors and 0 warnings on live greggcostin.com/, /reviews and /team, with consistent #team, #brokerage and #website @id references. | PMH @id discipline holds: on all 93 pages that define #agent twice, the Article.publisher reference is a strict subset (same @type, adds only logo) of the full #agent block, so there is no entity ambiguity; the Google Article required properties (headline, image, datePublished, author) are present on every standalone Article and BlogPosting page, and no self-serving Review or AggregateRating markup exists anywhere.

Auditor notes: Method: scratch scripts under the session scratchpad (analyze-jsonld.mjs, required-props.mjs, speakable-check.mjs, livediff.mjs, compare-all.mjs, parse-validator.mjs) using the live schema.org vocabulary file (schemaorg-current-https.jsonld) for type and property-domain checks; all 203 sitemap URLs on both sites were fetched with curl and compared after JSON canonicalization. validator.schema.org accepted the html form field (11 live pages posted); its url mode returned fetchError NOT_FOUND, so URL mode was not usable. Counts quoted are that validator's own top-level totalNumErrors/totalNumWarnings, not Rich Results Test or Search Console numbers; no Lighthouse or CrUX data this run. (...)

#### [schema-01] Invalid type RealEstateOrganization is served on all 7 SPA routes and fails validator.schema.org with 11 errors on the homepage

- meta: PMH | high | effort low | confirmed
- Evidence: C:/Users/gregg/pensacolamilitaryhousing/index.html:117 (inside RealEstateAgent.worksFor at line 116), :272 (standalone @id #brokerage block) and :381 (Person.worksFor) each read "@type": "RealEstateOrganization", which is not in the schema.org vocabulary (schemaorg-current-https.jsonld has no such class). The block set is copied into every prerendered shell: live https://pensacolamilitaryhousing.com/ serves 8 JSON-LD blocks including it, and https://pensacolamilitaryhousing.com/about and /pcs-guide serve 10 (...)
- Impact: The brokerage entity and every worksFor relation on the 7 highest-authority URLs (home, about, pcs-guide, contact, blog, calculators, communities) are dropped by validators, so the homepage graph has no valid link from Gregg to Levin Rinke Realty. This is (...)
- Fix: In index.html replace all three "@type": "RealEstateOrganization" with "@type": "RealEstateAgent" (a brokerage is itself a RealEstateAgent; "Organization" also validates), keeping "@id": "https://pensacolamilitaryhousing.com/#brokerage". Apply the same one-word replacement in scripts/page-template.mjs:14 and scripts/content-page-template.mjs. Run npm run build so all 7 dist shells refresh, deploy, then re-POST the live homepage to validator.schema.org and confirm totalNumErrors=0.
- Verifier: Reproduced exactly. Fix is sound on this stack (RealEstateAgent is a LocalBusiness, hence Organization, so worksFor/@id #brokerage validate; plain Organization also works). Extend the one-word replacement to all four template lines (page-template.mjs:14 and (...)

#### [schema-03] Person-only properties (worksFor, jobTitle, alumniOf) sit on the RealEstateAgent business node on 90 pages, a validator WARNING on every static page

- meta: PMH | medium | effort low | confirmed
- Evidence: public/bah-rates.html:35 RealEstateAgent @id #agent carries "worksFor":{"@type":"Organization","name":"Levin Rinke Realty",...}; the same pattern is in 89 public/*.html pages plus index.html:116, and index.html:168 (alumniOf) and :172 (jobTitle) also sit on the RealEstateAgent. schema.org domainIncludes for worksFor, jobTitle and alumniOf is Person only (confirmed from schemaorg-current-https.jsonld). validator.schema.org on the live HTML: UNKNOWN_FIELD worksFor on RealEstateAgent (WARNING) on /bah-rates, (...)
- Impact: Every static PMH page reports at least one structured-data warning, and the business-to-brokerage relation on the #agent node is ignored by consumers that enforce property domains; the entity that Copilot and Google cite (351 citations across 31 pages) is (...)
- Fix: On the #agent RealEstateAgent replace "worksFor":{...} with "parentOrganization":{"@type":"Organization","@id":"https://pensacolamilitaryhousing.com/#brokerage","name":"Levin Rinke Realty","url":"https://greggc.levinrinkerealty.com"} and add "founder":{"@id":"https://pensacolamilitaryhousing.com/#person-gregg"}; delete jobTitle and alumniOf from index.html block 0 (lines 168-172, they remain on the Person block at lines 368-393). One regex pass over public/**/*.html (the worksFor object is identical on all 89 (...)
- Verifier: Reproduced on every page checked. One correction: the worksFor object is NOT identical on all 89 pages; there are 3 shapes (with url+address, address only, name only), so the regex pass needs three patterns or a JSON-aware rewrite. parentOrganization is (...)

#### [int-01] Cloudflare Email Address Obfuscation rewrites every mailto link and visible email on both live sites; JSON-LD survives, but non-JS crawlers see [email protected]

- meta: BOTH | low | effort low | confirmed
- Evidence: Live https://pensacolamilitaryhousing.com/bah-rates: 0 href="mailto:" (repo public/bah-rates.html has 3), 3 href="/cdn-cgi/l/email-protection#...", 2 &lt;span class="__cf_email__" data-cfemail=...&gt;[email&#160;protected]&lt;/span&gt; replacing the visible address, decoded only by /cdn-cgi/scripts/.../email-decode.min.js. Live https://greggcostin.com/: 1 obfuscated span, 2 protection hrefs. Live https://pensacolamilitaryhousing.com/military-realtor-pensacola (the page with 84 Clarity dead clicks on the email (...)
- Impact: AI crawlers that do not execute JavaScript (GPTBot, ClaudeBot, PerplexityBot, Bing's raw HTML pass) read the visible NAP email as [email protected] and the contact link as a /cdn-cgi/ URL on every page of both sites, while the JSON-LD says (...)
- Fix: Cloudflare dashboard for both zones (pensacolamilitaryhousing.com and greggcostin.com): Scrape Shield, Email Address Obfuscation: Off. This is an account setting, so it is a user action. Afterwards curl https://pensacolamilitaryhousing.com/bah-rates and confirm href="mailto:gregg.costin@gmail.com" is present and data-cfemail is absent.
- Verifier: Reproduced on both sites. The fix is correct for this stack: Email Address Obfuscation is a zone-level Scrape Shield setting applied to the proxied custom domains, not something in public/_headers or the Pages build, so it is a dashboard action for the (...)

#### [schema-02] Speakable cssSelectors miss on 14 of 17 pages that declare them (7 static .facts strong, 7 SPA shells .lead), one validator ERROR each

- meta: PMH | low | effort low | narrowed
- Evidence: index.html:264 declares "cssSelector": ["h1", "h2", ".lead"] on the WebSite node; src/App.jsx contains 0 occurrences of a lead className and dist/index.html plus dist/about.html contain 0 class="lead", so the selector never matches on any of the 7 SPA shells. validator.schema.org on live https://pensacolamilitaryhousing.com/ and /about: NO_MATCHES_FOUND ".lead" (severity ERROR). scripts/add-speakable.mjs:22 writes ["h1","h2","h3","summary",".lead",".facts strong"] into 33 static pages, but only 4 of them (...)
- Impact: Every affected page reports a structured-data ERROR in validator.schema.org and Rich Results style tooling for a feature (Speakable) that only pays off when the selector resolves; the errors also make future audits noisy and hide real regressions. No ranking (...)
- Fix: index.html:255-265: move speakable off the WebSite node onto a WebPage node (@id https://pensacolamilitaryhousing.com/#webpage, isPartOf #website) with cssSelector ["h1","h2"], or drop it; rebuild so all 7 dist shells refresh. scripts/add-speakable.mjs:22: build the list per page, e.g. const sels=['h1','h2','h3']; if(/&lt;summary/.test(html)) sels.push('summary'); if(/class="[^"]*\blead\b/.test(html)) sels.push('.lead'); if(/class="[^"]*\bfacts\b/.test(html)) sels.push('.facts strong'); then rewrite only the 7 (...)
- Verifier: The mechanism is real but the scale is overstated by more than 2x: 7 static pages and 7 SPA shells, one error each. The grep the finder used (facts strong / .lead) matches CSS rules in the style block on 70 and 92 pages, which explains the inflated counts. (...)

#### [schema-04] All 82 school pages attach the district with isPartOf, a CreativeWork-only property, so the School node draws a validator warning and an INVALID_OBJECT on every page

- meta: GC | low | effort low | confirmed
- Evidence: scripts/schools-factory.mjs:123 emits isPartOf: { "@type": "Organization", name: ${county} School District, url: ... } on the School node; civilian-site/schools/a-k-suter-elementary-school.html:39 shows the rendered block and the same block is on all 82 civilian-site/schools/*.html files (82 hits in the parse report). schema.org domainIncludes for isPartOf is CreativeWork only. validator.schema.org on live https://greggcostin.com/schools/a-k-suter-elementary-school: totalNumErrors=0, totalNumWarnings=1 (...)
- Impact: 80 percent of the civilian site (82 of 102 pages) carries an ignored relation, so the school-to-district link that gives the reports their authority signal is not consumed; no rich result is at stake, so the ranking impact is nil, but the audit gate (...)
- Fix: scripts/schools-factory.mjs:123: rename isPartOf to parentOrganization and type the district as {"@type":"EducationalOrganization","name":"Escambia County School District","url":...}; regenerate the 82 pages with the factory; add an assertion in scripts/audit-civilian.mjs that a School node never carries isPartOf; redeploy after the gate reports 0 findings.
- Verifier: Reproduced. parentOrganization is valid on School (EducationalOrganization is an Organization subtype) and EducationalOrganization is a valid type for the district, so the fix validates. Severity low is right; no rich result depends on it.

#### [schema-05] 19 community pages put addressRegion/addressCountry directly on a City or AdministrativeArea inside containedInPlace (2 validator warnings per page)

- meta: PMH | low | effort low | confirmed
- Evidence: public/communities/bellview-myrtle-grove.html:36 "containedInPlace":{"@type":"City","name":"Pensacola Metro Area","addressRegion":"FL","addressCountry":"US"}; public/communities/mary-esther.html:33 same shape on AdministrativeArea (Okaloosa County); parse report: 38 misapplied-property hits across all 19 public/communities/*.html files (addressRegion and addressCountry are PostalAddress/DefinedRegion properties). validator.schema.org on live https://pensacolamilitaryhousing.com/communities/niceville: (...)
- Impact: The Place nodes on the community pages (the pages with the weakest engagement per Clarity: /communities/niceville 31 sessions, 8 percent scroll) lose their region context in validators; low impact but it is a clean, one-pass fix that removes the last (...)
- Fix: Regex pass over public/communities/*.html: replace "containedInPlace":{"@type":"City","name":"X","addressRegion":"FL","addressCountry":"US"} with "containedInPlace":{"@type":"City","name":"X","address":{"@type":"PostalAddress","addressRegion":"FL","addressCountry":"US"}} (same for the two AdministrativeArea variants), then re-POST /communities/niceville to the validator.
- Verifier: Reproduced. Place accepts address (PostalAddress), so the proposed wrap validates. Add to the same pass: the 4 pages that type Okaloosa County as City (crestview, destin, fort-walton-beach, niceville family) should use AdministrativeArea like mary-esther (...)

#### [schema-06] /blog index emits 11 BlogPosting nodes without image and without a Blog.blogPost link (non-critical GSC items, 0 validator errors); insurance headline 113 chars

- meta: PMH | low | effort low | narrowed
- Evidence: public/blog.html:42 Blog node has only name, url, author, publisher (no blogPost); from line 48 there are 11 separate BlogPosting blocks with headline, description, url, datePublished, dateModified, author, mainEntityOfPage and no image (required-props scratch check: 11 x BlogPosting missing image, all on public/blog.html). Live https://pensacolamilitaryhousing.com/blog serves 15 blocks canonically identical to public/blog.html. public/florida-home-insurance-military.html:32 headline is 113 characters (Google (...)
- Impact: Search Console will list 11 Article items with a missing required field on /blog, and the listing page duplicates each post's entity without connecting it to the Blog container; the individual post pages are correct, so the cost is GSC noise and a missed (...)
- Fix: Change the emitter, not the page: in scripts/blog-factory.mjs:252 add "image":&lt;hero&gt; and "@id":"${SITE}/blog/${s.slug}#article" to each generated block, and add an image field to public/blog/index.json (or read it from each post's og:image) since the manifest has none today; optionally collapse the 11 blocks into one Blog node with blogPost:[...] in the same function. Consider a real hero image per post instead of gregg-portrait.jpg for the Article image. Trim public/florida-home-insurance-military.html:32 (...)
- Verifier: The structure is as described, but the impact is overstated: schema.org does not require image on BlogPosting (0 errors, 0 warnings live), and Google's current Article documentation lists image as recommended, not required, so Search Console shows a (...)

Verifier-noted items outside the numbered list: PMH: speakable is declared on the WebSite node (index.html:264) but schema.org limits speakable to Article and WebPage; validator.schema.org on live / and /about reports UNKNOWN_FIELD speakable WebSite on all 7 SPA (...) | PMH: 4 community pages type 'Okaloosa County' as @type City inside containedInPlace (grep public/communities/*.html shows 4 x {"@type":"City","name":"Okaloosa County"} versus 2 x AdministrativeArea on mary-esther and (...) | PMH: the blog index emitter scripts/blog-factory.mjs:250-253 regenerates every BlogPosting block on public/blog.html from a template that has no image and no @id, and public/blog/index.json carries no image field; any (...) | Process note for the remediation step: validator.schema.org's HTML POST endpoint began returning HTTP 405 after about 10 requests in a few minutes, so batch verification must be spaced out or use the url= mode; the (...)

### Gap probe: Duplicate URL variants and redirect chains on both hosts (trailing slash, index.html, case, query strings, hop count)

6 findings (1 high, 1 medium, 4 low). Strengths noted: Scheme and host normalization is single-hop on both sites, including deep paths: http://, http://www. and https://www. each 301 straight to the final https apex URL (http://www.pensacolamilitaryhousing.com/bah-rates and http://www.greggcostin.com/buy both resolve in 1 hop), with no intermediate https://www step. | Trailing-slash, .html and index forms of every real page resolve to the clean URL in one hop on both hosts: /bah-rates/, /bases/nas-pensacola/, /bases/nas-pensacola.html, /communities/gulf-breeze/, /blog/&lt;slug&gt;/ and .html, /index.html, /index, /about/, /pcs-guide/, /blog/ on PMH; /buy/, /buy.html, /schools/, /schools/gulf-breeze-high-school/ and .html, /team/, /team.html, /resources/florida-homestead-exemption/, /search/, /404.html on GC. Explicit .html to clean rules (public/_redirects:92-132) and the Pages auto-308 never chain on https. | Query strings never create duplicates: /bah-rates?utm_source=test, /communities/gulf-breeze?v=2, /?q=va+loan (PMH) and /buy?utm_source=test, /neighborhoods?v=2, /?q=va+loan (GC) all serve the clean self-referencing canonical, and cf-cache-status stays DYNAMIC (no cache fragmentation). | Both sitemaps are pristine: 101 PMH + 101 GC URLs, all https apex, lowercase, slash-free and extension-free, and all 202 entries returned HTTP 200 on 2026-09-02 (zero redirecting or missing entries). | The internal link graph never touches a variant form: across public/ (101 pages), index.html, src/App.jsx and civilian-site/ (102 pages) there are 0 trailing-slash links, 0 .html links, 0 uppercase paths, 0 www or http self-links and 0 links to any of the 102 _redirects source paths; all 34 GC-to-PMH and 3 PMH-to-GC cross-site targets return 200 with no redirect, so the tandem cross-link rule costs no hops. | greggcostin.com is the reference implementation for not-found handling: civilian-site/404.html plus no wildcard yields real 404 + noindex for case variants (/Buy, /SCHOOLS), dir/index.html forms and unknown paths, and civilian-site/_headers:9-10 noindexes the pages.dev twin (live x-robots-tag: noindex on greggcostin.pages.dev/buy).

Auditor notes: Data limits: no Lighthouse or CrUX numbers this run (PSI quota exhausted); hop counts and headers measured live with curl 8.x from a US client on 2026-09-02; the 103 Early Hints probe used Node's built-in http2 client (three requests per URL, ALPN h2) because neither curl build on this machine supports HTTP/2. Backlink data (to judge how many external links use legacy forms) was unavailable (Semrush units exhausted). Overlap with other specialists: url-01 shares its root cause with the indexation soft-404 finding; I am supplying the variant enumeration and the two-step file fix (remove _redirects:141 AND add public/404.html, because Pages falls back to SPA mode without a 404.html). The (...)

#### [url-01] SPA wildcard fallback turns every unmatched URL variant into a 200 copy of the home page, even though every SPA route already has its own shell file

- meta: PMH | high | effort low | narrowed
- Evidence: public/_redirects:141 /* /index.html 200; no public/404.html exists (ls confirms). Live 2026-09-02, all HTTP 200 with the identical 54,812-byte home shell, canonical https://pensacolamilitaryhousing.com/ and meta robots index,follow: /BAH-Rates, /Bases/NAS-Pensacola, /bah-rates/index.html, /bases/nas-pensacola/index.html, /communities/index.html, /bases, /bases/, /pagefind/, /downloads/, /homestead/ (while /homestead itself 301s), /search, /search/, /niceville.html, /nonexistent.html, /nonexistent-page-xyz/. (...)
- Impact: Unbounded duplicate-URL surface: any typo, case variant, directory root, index.html suffix or slash variant is a crawlable, indexable 200 clone of the home page. Crawl budget is spent on phantom URLs, GSC reports them as Duplicate without user-selected (...)
- Fix: (1) Delete public/_redirects line 141 /* /index.html 200 and the stale comment block at lines 134-140. (2) Add public/404.html: clone public/first-time-military-homebuyer.html by hand (do NOT run scripts/page-factory.mjs on it, it appends a sitemap entry at scripts/page-factory.mjs:155-160), set &lt;title&gt;Page Not Found | Gregg Costin&lt;/title&gt;, &lt;meta name="robots" content="noindex"&gt;, remove canonical/hreflang/JSON-LD Article and FAQPage blocks, keep nav, Pagefind search box and footer, add links to (...)
- Verifier: Core finding stands and is live-reproduced. Drop the sentence claiming the /downloads/ root is unprotected. The fix is correct for Cloudflare Pages (with a root 404.html and no wildcard rule, unmatched paths get 404.html with a 404 status; the SPA routes are (...)

#### [url-02] SPA footer and PCS-guide buttons client-navigate to /homestead (a URL the server 301s away) and to an in-app /reviews that is a different document from the static /reviews page

- meta: PMH | medium | effort medium | confirmed
- Evidence: src/App.jsx:718-721 Footer Quick Links: ["pcs","homestead","neighborhoods","reviews","contact"].map(id =&gt; &lt;button onClick={() =&gt; go(id)}&gt;...); App.jsx:1031 &lt;button onClick={() =&gt; go("homestead")}&gt;Read the Homestead Exemption Guide&lt;/button&gt;; App.jsx:634 &lt;BtnG onClick={() =&gt; go("reviews")}&gt;Read All Reviews; App.jsx:2693-2699 PAGE_TO_SLUG still maps homestead: "/homestead", "va-loan": "/va-loans", reviews: "/reviews"; App.jsx:2841/2843/2851 still render VALoanPage, HomesteadPage, (...)
- Impact: Two different documents exist at /reviews depending on how the visitor arrived, and /homestead exists only client-side: a reload, bookmark, share or back-button lands users on a different page than the one they read. go() calls trackPageView("/homestead") so (...)
- Fix: In src/App.jsx: (a) lines 718-721, replace the button map with &lt;a href="/pcs-guide" style={footerLinkStyle}&gt;PCS Guide&lt;/a&gt;&lt;a href="/florida-homestead-exemption-military" style={footerLinkStyle}&gt;Homestead&lt;/a&gt;&lt;a href="/communities" style={footerLinkStyle}&gt;Neighborhoods&lt;/a&gt;&lt;a href="/reviews" style={footerLinkStyle}&gt;Reviews&lt;/a&gt;&lt;a href="/contact" style={footerLinkStyle}&gt;Contact&lt;/a&gt; (footerLinkStyle at line 707 already sets textDecoration none and display (...)
- Verifier: Fully reproduced both in code and by a live click. One correction to the proposed fix: BtnG (src/App.jsx:346) is ({ children, onClick, href }) and renders an &lt;a&gt; when href is passed; it has no as prop, so use &lt;BtnG href="/reviews"&gt;. Because the (...)

#### [url-03] PMH home page sends no Link header and no 103 hint, and every other page hints only the fonts.googleapis preconnect (not fonts.gstatic or the hero image)

- meta: BOTH | low | effort low | narrowed
- Evidence: Node http2 probe 2026-09-02, 3 requests each, ALPN h2: pensacolamilitaryhousing.com/ status=200 1xx=[] Link=null; /bah-rates 1xx=[] Link=&lt;https://fonts.googleapis.com&gt;; rel="preconnect"; greggcostin.com/ and /buy 1xx=[] Link=&lt;https://fonts.googleapis.com&gt;; rel="preconnect". index.html:13 has &lt;link rel="preload" as="image" href="/images/hero-window.avif" fetchpriority="high"&gt; yet the / response has no Link header; public/bah-rates.html:55-57 and civilian-site/index.html:72-74 have preconnect (...)
- Impact: The LCP image on both home pages (hero-window.avif 98 KB on PMH, gregg-courthouse.webp 130 KB on GC) cannot start before the HTML body is parsed, and on PMH it is further gated on React (evidence.md). Early Hints would let the browser fetch the hero and open (...)
- Fix: (1) public/_headers, add a block: / Link: &lt;/images/hero-window.avif&gt;; rel=preload; as=image; type=image/avif, &lt;https://fonts.googleapis.com&gt;; rel=preconnect, &lt;https://fonts.gstatic.com&gt;; rel=preconnect; crossorigin and a /*-scoped Link: &lt;https://fonts.gstatic.com&gt;; rel=preconnect; crossorigin line is NOT safe site-wide (it would attach to images and downloads), so add it per HTML route or accept the one-hint state. (2) civilian-site/_headers, add: / Link: (...)
- Verifier: The headline claim 'No 103 Early Hints on either zone' is refuted: Early Hints is already enabled and firing on both zones for pages whose head has a preconnect tag. What survives is narrower: the PMH home page (the LCP-critical one) gets no hint at all (...)

#### [url-04] Six bare community and base slugs have no _redirects rule and serve the home shell while every sibling slug 301s to its /communities or /bases page

- meta: PMH | low | effort low | confirmed
- Evidence: public/_redirects:25-56 covers /gulf-breeze, /navarre, /pace, /milton, /cantonment, /perdido-key, /east-pensacola-heights, /east-hill, /cordova-park, /ferry-pass, /bellview-myrtle-grove, /navy-point-warrington, /destin, /crestview (plus .html forms) and :9-22 covers all base slugs except /whiting-field. Not covered although the target pages exist in public/communities and public/bases: /beulah, /fort-walton-beach, /mary-esther, /niceville, /shalimar, /whiting-field. Live 2026-09-02: each returns 200 with the (...)
- Impact: Any short-domain forward, old link or typed guess for these six names lands on the home page instead of the community page (after url-01 is fixed they would become 404s instead). Low traffic, but it breaks the pattern the file promises and wastes the (...)
- Fix: Append to public/_redirects directly after line 56 (before the # Community aliases for sub-community short domains block): /beulah /communities/beulah 301 /beulah.html /communities/beulah 301 /fort-walton-beach /communities/fort-walton-beach 301 /fort-walton-beach.html /communities/fort-walton-beach 301 /mary-esther /communities/mary-esther 301 /mary-esther.html /communities/mary-esther 301 /niceville /communities/niceville 301 /niceville.html /communities/niceville 301 /shalimar /communities/shalimar 301 (...)
- Verifier: Reproduced exactly. The _redirects syntax in the proposed fix matches the working rules at lines 9-56, so it will work as written. After url-01 is applied these would 404 instead of serving the home shell, which is why the rules are worth adding in the same (...)

#### [url-05] Legacy .html, trailing-slash and retired-slug forms take two redirect hops when entered over http:// or www. because the zone-level scheme/host redirect preserves the path verbatim

- meta: BOTH | low | effort low | confirmed
- Evidence: Live 2026-09-02 (curl -sIL): http://pensacolamilitaryhousing.com/bah-rates.html -&gt; 301 https://pensacolamilitaryhousing.com/bah-rates.html -&gt; 301 /bah-rates (hops=2); http://www.pensacolamilitaryhousing.com/nas-pensacola.html -&gt; 301 -&gt; 301 /bases/nas-pensacola (2); http://www.pensacolamilitaryhousing.com/homestead -&gt; 301 -&gt; 301 /florida-homestead-exemption-military (2); http://pensacolamilitaryhousing.com/bah-rates/ -&gt; 301 -&gt; 308 /bah-rates (2); http://greggcostin.com/buy.html -&gt; 301 (...)
- Impact: Only affects visitors or crawlers arriving on an old http/www link that also carries a legacy form; neither site links to any such form internally (0 .html, 0 trailing-slash, 0 www self-links across 203 pages) and the two hops stay far inside Google's follow (...)
- Fix: Optional. In each zone's Redirect Rule that handles (not ssl) or (http.host eq "www.&lt;host&gt;"), switch the target to a dynamic expression that strips .html in the same hop, e.g. for PMH: concat("https://pensacolamilitaryhousing.com", wildcard_replace(http.request.uri.path, "*.html", "${1}")) with status 301 and preserve query string; wildcard_replace is available on all Cloudflare plans. Renamed slugs (/homestead, /about on GC) will still need the second hop, which is acceptable. Otherwise leave as is and (...)
- Verifier: Reproduced exactly, including the zero-legacy-internal-link claim. The severity and 'optional' framing are appropriate; two hops with query strings preserved is inside every crawler's tolerance. wildcard_replace() in a Redirect Rule dynamic expression is (...)

#### [url-06] The /about retirement rule matches only the exact path, so /about/ and /about.html return 404 instead of 301 to /team

- meta: GC | low | effort low | confirmed
- Evidence: civilian-site/_redirects:2 /about /team 301 (the file's only rule). Live 2026-09-02: https://greggcostin.com/about -&gt; 301 /team (1 hop, good); https://greggcostin.com/about/ -&gt; 404; https://greggcostin.com/about.html -&gt; 404; http://www.greggcostin.com/about/ -&gt; 301 https://greggcostin.com/about/ -&gt; 404. Every other trailing-slash and .html variant on GC 308s correctly (/buy/, /buy.html, /schools/, /schools/gulf-breeze-high-school/, /team.html, /blog/, /resources/, /search/).
- Impact: Any external link, social bio or old email signature that used the slash or .html form of the retired About page hits a 404 and loses the link equity that the rule was written to preserve. Low volume, but the fix is two lines.
- Fix: civilian-site/_redirects, add: /about/ /team 301 /about.html /team 301 (.html sources are honored by Pages; PMH relies on the same syntax at public/_redirects:93). Redeploy with the wrangler command and confirm curl -sI https://greggcostin.com/about/ returns 301 with Location: /team.
- Verifier: Reproduced exactly. The two-line fix is correct for this stack; the trailing-slash source /about/ is matched literally by Pages _redirects, and the .html source form is proven to work on the PMH project. Redeploy via the wrangler command and re-run (...)

Verifier-noted items outside the numbered list: PMH: the pensacolamilitaryhousing.pages.dev twin host is an indexable duplicate of every URL. Live 2026-09-02: curl -sI https://pensacolamilitaryhousing.pages.dev/ = HTTP 200 with NO x-robots-tag, while curl -sI (...)

---

## Appendix B. Method, data sources, and exclusions

**Orchestration.** 13 dimension finders ran in parallel, each chained to one adversarial verifier (prompted to refute by reproduction; default verdict "refuted" when evidence could not be reproduced). A completeness critic reviewed all verified findings against the brief and commissioned 6 gap probes: blog-route-integrity, pcs-checklist-lead-magnet, listing-schema-surfaces, pmh-og-canonical-gate, jsonld-parse-live-vs-local, url-variants-redirect-chains. Each gap probe had its own verifier. 4 synthesis writers then produced the scorecard, code snippets, media roadmap, and content plus action matrix from the verified set only. The orchestrator gathered the baseline evidence beforehand (live HTTP headers, browser lab measurements at 375 and 320 px, Microsoft Clarity behavior data, repository scans, screenshots) and spot-verified the top findings before publication.

**Agents and effort.** 43 agents, 1,049 tool calls, about 69 minutes of wall-clock time.

**Refuted by verification.** [list-08] All 23 IDX deep links use the /map/ view, not the verified /results/ template; attribution on /map/ is unverified: The hypothesised risk does not exist: the /map/ view on the greggc subdomain renders Gregg's agent id (aid=213600758) in its forms exactly like /results/, so no sed swap is needed and the 'unverified attribution' framing should be dropped. Only the incidental counts were off (27 map hrefs / 20 (...)

**Overturned by the orchestrator.** [pcs-01] "Lead-magnet form breaks the contact-worker contract" was demoted from high to low. The deployed worker source in the repository (workers/costin-contact/worker.js) accepts the honeypot key the checklist form sends and maps its inquiryType to Lead. The related 825 Bayshore finding [list-01] stands for its option-value mapping, not for the honeypot key.

**Data sources.** Repository at commit 37dc795 plus the working tree; live responses from both hosts on 2026-09-02; Microsoft Clarity project wm7ddbciup (pensacolamilitaryhousing.com only; greggcostin.com has no Clarity project); docs/seo-baselines (bellwether panels of 2026-08-24 and 2026-09-01, Bing keyword export of 2026-08-22, competitor snapshot of 2026-08-24, market-engine log); Wikidata API and public log; validator.schema.org; live web searches for SERP shape on 2026-09-02.

**Not available this run.** PageSpeed Insights (quota exhausted) so no Lighthouse or Chrome UX Report numbers; Semrush (API units at zero) so no search volumes; the source of the 825 Bayshore listing subdomain, which is not in the repository.

**Standing rules honored.** No em dashes in any text written for this report; the owner's decisions to keep the "#1 military relocation Realtor" headline, to build no on-site "best realtor in Pensacola" page, to register no new domains, and to keep the military brand were treated as fixed; the cross-link rule between the two sites and the one-page-preview rule for visual changes are assumed in every rollout note.
