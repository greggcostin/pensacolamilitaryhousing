# PensacolaMilitaryHousing.com — Full Site Audit (July 2026)

Prepared for Gregg Costin (Levin Rinke Realty). Scope: all 59 static pages in `public/`, the SPA shell (`index.html` + `src/App.jsx`), schema, analytics, performance, accessibility, internal architecture, imagery, and content strategy. This report is written to be actioned, not admired. Fix the credibility errors first; everything else is upside.

---

## 1. Executive Summary

This is one of the most complete military-relocation content maps a solo agent has ever put online: 7 base guides, 17 community pages, 7 on-base-vs-off-base decision pages, 3 head-to-head comparisons, a deep VA-loan cluster, BAH tools, a Florida tax cluster, and school guides, almost all carrying Article/FAQ/Person/Breadcrumb schema with clean extensionless URLs and a flawless link graph (zero broken links, zero legacy `.html` links, sitemap matches disk 100%). The technical SEO chassis and the analytics baseline (GA4 + Clarity + Follow Up Boss on every page) are genuinely strong.

The problem is not structure. It is that the content the site's own audience can check is wrong in enough places to threaten the whole authority pitch. Service members who know their base, their BAH, and their commute will catch fabricated on-base wait times, a wrong Hurlburt MHA rule baked into schema, a "5-10 minutes to NAS Pensacola" claim that is geographically impossible, VA-loan rules that were repealed in 2020, two wrong county-appraiser filing addresses, and an invented Florida tax benefit. Several of these wrong answers are the ones baked into FAQ JSON-LD, so Google and AI answer engines can surface them directly.

The second-largest gap is that this is a text-wall site. All 59 static pages render only two banner logos while 45 real, pre-optimized photos (including a genuine USAF career library) sit unused, and `gregg-portrait.jpg` is declared 154 times in schema without a single visible appearance — an E-E-A-T mismatch on YMYL money pages. Conversion is throttled too: on most guides the only CTA sits at the very bottom below the FAQ, and on all 7 on-base pages the strongest mid-page phone CTA is plain text, untappable on mobile and invisible to analytics.

There is also a compliance exposure that needs same-day attention: a post-NAR-settlement "buyer's agent costs you nothing" claim, plus unsubstantiated "#1"/"largest"/"hundreds" superlatives and an invented "90%" statistic. None of this is hard to fix. The content errors are edits, the imagery infrastructure already exists in the repo, and the schema/analytics fixes are largely build-script work. Ship the Week 1 credibility fixes and this site jumps a full grade.

### Overall Site Grade: **C+**

The technical foundation is A-tier; the factual accuracy and presentation drag it down. A site that publishes this many checkable errors to an expert audience cannot grade higher until the criticals are cleared — but the ceiling here is genuinely A-.

### Scores by Dimension (averages across all audited pages, 1-10)

| Dimension | Avg | Read |
|---|---|---|
| Content | 6.8 | Deep and differentiated, but pockmarked with verifiable factual errors and internal contradictions |
| SEO | 7.8 | Excellent plumbing; drift between schema and visible copy, plus Course/HowTo/self-review misuse |
| Code | 7.3 | Clean output; dead/duplicated CSS and a live 768-900px layout bug across the template family |
| Design | 5.9 | The weak link: zero photography, buried CTAs, unstyled tables, one illegible section |
| Analytics | 9.0 | Best-in-class baseline coverage; blind on the highest-value conversions |

---

## Verification Log (ground-truthed 2026-07-03)

The adversarial verification pass was interrupted by a transient rate limit, so most clusters below were labeled "PARTIALLY VERIFIED." The following items were then independently re-checked against the live files by hand, with exact evidence. Skepticism was applied in both directions: some auditor claims were confirmed, some were narrowed, and a couple could not be reproduced.

**CONFIRMED (hard file:line evidence):**
- **On-base housing fabrication** and **local geography errors** — confirmed by the workflow's own verifiers. Geography example nailed down: East Pensacola Heights claims "5-10 minutes to NAS Pensacola" in the meta description, the Article headline ("5 Minutes to NAS Pensacola"), the Place schema, the FAQPage schema, the H1, the facts box, and the body (`communities/east-pensacola-heights.html:8,19,35,41,300,306,331`). NAS is across town to the southwest; real drive is ~20-25 min. The wrong figure is baked into three schema blocks, so Google/AI can surface it directly.
- **Published draft artifact + typo** — `school-zones-military-families.html:262` literally reads "Gulf Breeze Elementary (wait — this is Santa Rosa)"; line 273 reads "Destin Hight".
- **Illegible white-on-cream section** — `gulf-breeze-vs-navarre.html` and `niceville-vs-crestview.html` both contain the `#faf7ed` cream background (the third "vs" page does not).
- **Unsubstantiated superlatives** — `index.html:533` "Pensacola's #1 military relocation Realtor"; `sell.html:278` "Pensacola's largest military relocation agent"; `buy.html:266` "Helped Hundreds of Clients".
- **Conflicting county-appraiser filing address** — `va-disability-property-tax-florida.html:254` says "221 Palafox Place Suite 300" (correct ESCPA address); `disabled-veteran-benefits-florida.html:256` and `florida-homestead-exemption-military.html:247` both say "213 Palafox Place" (wrong). Same office, two addresses across the site.
- **Copy-pasted WebPage schema** — `va-coe-guide.html:152` and `florida-home-insurance-military.html:152` both declare `@id`/`url` = `.../va-irrrl-guide#webpage`, mis-attributing each page to the wrong URL.
- **Self-serving + placeholder reviews still on the homepage** — `index.html:191-204` carries `aggregateRating` (reviewCount 42) plus six `Review` objects, four with the placeholder names ("Military Family Client", "Veteran Client", "Gulf Breeze Buyer", "First-Time VA Buyer") that were removed from reviews.html in July but never removed here. Google ignores self-serving star markup and this is manual-action-adjacent.
- **BAH figures contradict within a single page** — `bah-to-mortgage-guide.html`'s visible affordability table (lines 238-243) uses E-6 $1,983 / O-3 $2,373, while that same page's FAQ schema (line 37) says O-3 $2,271, and the canonical `bah-rates.html:244,264` says E-6 $2,235 / O-3 $2,271. Three different O-3 numbers; the visible table is on stale figures.

**NARROWED / NOT REPRODUCED (treat with care — the auditor may have overreached):**
- **"Free buyer agent" claim** — the superlatives are real, but a literal "your agent costs you nothing / seller pays" passage was NOT found on buy.html in this pass. Confirm the exact wording before rewriting a compensation clause; do not assume it exists.
- **"Hurlburt MHA rule is stated wrong"** — the BAH dollar contradictions are real, but the on/off-base Hurlburt page actually states the duty-station rule correctly ("Hurlburt pays FL023 BAH... Navarre prices are FL064 range," `on-base-vs-off-base-hurlburt-field.html:305`). Find the auditor's exact citation before "fixing" a rule that reads correct here.
- **"Wrong IB school (should be Pensacola High)"** — the page consistently names Washington High (Escambia) as the IB Diploma school. Whether the correction is Pensacola High needs a primary-source check against the Escambia district / IBO before editing; do not swap on the auditor's say-so.
- **VA loan math (funding-fee %, assumable payment, IRRRL break-even)** — NOT independently recomputed in this pass. Note the 2023 fee schedule already lowered subsequent-use to 3.3%, so the auditor's specific "3.3% is wrong" flag may itself be stale. This cluster needs a dedicated, source-backed math pass before any edit.

Net: the audit's critical findings are overwhelmingly real, but three of the scariest-sounding specifics (free-agent claim, Hurlburt rule, IB school) need a source check before you touch them, and the VA-math cluster needs its own verification pass rather than trusting either the site or the auditor.

### Corrections applied (2026-07-04, source-backed)

All YMYL clusters were re-verified against primary sources and fixed. Commits on `main`:

- **BAH figures (`c5fc3a8`)** — Rebuilt the drifted FL023 tables in `bah-rates.html` (enlisted/warrant/officer) and corrected the stale FL064 affordability tables in `bah-to-mortgage-guide.html` and `va-loan-guide.html` to the canonical `App.jsx` `BAH_DATA` values (e.g. E-6 $1,983→$2,235, O-3 $2,373→$2,271). Worked example recomputed. FL023 without-dependents FAQ range corrected to $2,007–$3,393.
- **Geography (`3efc81e`)** — Corrected implausibly short NAS Pensacola drive times on `communities/east-pensacola-heights.html` (5 min → ~20-25 min via Navy Blvd; repositioned the page's proximity hook around downtown, which is genuinely ~5 min), `perdido-key.html` (15 → ~20-25 min), and `cordova-park.html` (15-20 → ~20-25 min), across visible copy and all three schema blocks each.
- **On-base housing (`7852e79`)** — Verified every installation's privatized partner against official CNIC / AF Housing / operator sites. NAS Pensacola, Corry Station (Corry Village), and NAS Whiting Field = **Balfour Beatty Communities**; Eglin AFB, Hurlburt Field, Duke Field = **Corvias**. Dropped the "Balfour Beatty, Lendlease, or similar" hedge. Fixed the Corry "has no on-base housing" error (it has Corry Village). Clarified Saufley and Duke have no family housing of their own. **Removed all fabricated "typical 2026 wait times"** from prose, visible FAQs, and FAQPage JSON-LD on all 7 pages, replaced with honest "the housing office holds the only current list" guidance.

Resolutions to the "NARROWED / NOT REPRODUCED" items above: the **IB school** was confirmed = Pensacola High (IBO code 000442), and only IB attributions were switched (JROTC left intact) in an earlier commit; the **VA-math cluster** was recomputed against the 2023+ fee schedule (the auditor's "3.30% is wrong" flag was itself stale — 3.30% is correct and was left unchanged), with the genuine errors (invented reserve fee %, wrong loan limit, non-homestead §196.082 fabrication, millage direction) fixed in earlier commits.

### Round 2 (2026-07-05, source-backed)

Imagery (2.9) fully shipped — author cards on all 58 template pages, 24 sourced area/base heroes, topical bands, Buy/Sell/Insurance/Homestead heroes, `/communities` card cache-bust. Then four more CRITICAL clusters:

- **Advertising compliance (2.8, `172123b`)** — first-time-buyer "buyer's agent costs you nothing / seller pays" rewritten to post-NAR-settlement-accurate language; invented "90% of families" stat dropped. Per Gregg's explicit instruction, the homepage "#1 military relocation Realtor" headline and the "largest" (sell) / "hundreds" (buy) claims were LEFT AS-IS.
- **BAH (2.5, `681a400`/`5e19786`)** — the Hurlburt "live in Navarre and still get Pensacola MHA BAH" self-contradiction fixed (BAH follows duty station → Hurlburt member keeps the HIGHER FL023 rate); stale figures corrected on faq (E-6), whiting (O-1), perdido (E-5 with-deps), bah-rates H2, and the SPA PCS table/FAQ.
- **VA rules (2.3, `3bd07fa`+`b39d8b3`)** — full-entitlement borrowers no longer told county limits/25%-down apply (Blue Water Navy Act removed limits for full entitlement; $832,750 is the 2026 BASELINE, not "Tier 1 high-cost"); civilian-can't-assume error fixed; veteran+spouse zero-down (not 25%); funding-fee Guard/Reserve equalization re-attributed to the Blue Water Navy Act (Jan 1 2020, not the PACT Act); disabled-vet fee relabeled first-use; SCRA foreclosure window 9mo → 1 year.
- **FL statute/tax (2.4, `af1b7fb`)** — $5K-exemption savings 10x overstatement fixed; SAH/SHA to real FY2026 caps; homestead portability 2yr → 3yr (Amendment 5); Citizens cap 14% → 15% (2026) + F.S. 627.4025 hurricane trigger; F.S. 83.57 notice 60/15 → 30/7 (HB 1417) + Section 121 military 10-yr suspension added; Hometown Heroes "free/forgiven" → deferred 0% second mortgage.

### Round 3 (2026-07-05) — geography, schools, and the tractable technical items

- **Geography (2.2, `c0deaf0`)** — verified via a fact-check workflow: Blue Angel Pkwy removed from the Gulf Breeze and Cordova NAS routes (it's the West Gate road); Perdido Old River moved to the WEST end; Destin→Hurlburt corrected to ~25 min; Saufley I-110 removed; Crestview "Garnier Beach Lake/Live Oak Plantation" (neither real) → Shoal River Landing/Patriot Ridge and Baker is NW not south; the 2nd SOS is a 919th SOW squadron but physically at Hurlburt, not Duke.
- **Schools (2.6, `c0deaf0`)** — Corry page: Cantonment feeds Ransom Middle (Escambia), not Jay Middle (Santa Rosa); Duke "Ruckel-style Baker School" → Baker School is a separate PK-12; Cantonment body now delivers the Tate HS feeder its meta promised.
- **Schema integrity (2.10, `d78115c`)** — invalid `RealEstateOrganization` → `Organization` (114×, 59 pages); decoded 23 HTML entities sitting inside JSON-LD; Course/HowTo already absent. All 334 blocks validate.
- **FAQPage (2.11, `c0deaf0`/`ed0184e`)** — buy.html + sell.html had FAQPage schema with zero visible FAQ (manual-action risk) → rendered the Q&A as visible accordions; faq schema COE via retired "eBenefits" → VA.gov.
- **CTAs/tables/metadata (2.12/2.13/2.19, `ed0184e`)** — 7 on-base plain-text phone CTAs → `tel:` links, 60 tel: hrefs normalized to one format; 8 bare tables wrapped in `.bah-wrap`/`.bah-table`; og:type website → article on 43 Article pages.
- **Accessibility (2.16 partial, `77ab4a0`)** — `--mutedD` lightened to AA (~5.7:1) and a global `:focus-visible` outline added, both across 58 pages.

### Round 4 (2026-07-05) — accessibility remainder, self-review schema, data file, preview fix

- **Homepage + reviews self-review schema (`34d2678`)** — removed the self-serving `aggregateRating` (5.0/42) and `Review` JSON-LD from `index.html` **and** `public/reviews.html`. Self-hosted reviews about the business itself are ineligible for review rich results and manual-action-adjacent; visible review content on reviews.html is retained, only the markup is gone. All JSON-LD revalidated. *(Gregg explicitly approved fixing the homepage this round.)*
- **Accessibility 2.16 remainder (`91839e7`, `5b22ed8`)** — form label associations via `useId` on `InquiryForm` + `ContactPage`; buy/sell static popups given `for`/`id`; `InquiryModal` now `role=dialog` + `aria-modal` + `aria-labelledby` + focus-on-open + Tab focus-trap + focus restore; skip-to-content link + `<main>` landmark; five Nav dropdown triggers expose `aria-haspopup`/`aria-expanded`; SPA `mutedD` token lifted to the AA value. **Verified live** in the Vite preview (dialog opens/traps/closes, all five labels resolve) and production build passes.
- **Annual-update data file 2.17 (`cb2c3ad`)** — `docs/ANNUAL-UPDATE.md`: every perishable figure with source, repo locations, refresh cadence, and a December checklist. (A true build-time data injection into all 58 static pages was judged too high-risk for the "low-risk" bucket; this centralizes the knowledge instead.)
- **2.18 safe parts** — breadcrumb position-2 fragments audited: **none found** (already clean). `llms.txt` is a hand-curated page map and no pages were added/removed, so no regeneration needed.
- **Preview tooling** — root-caused the "wrong project" preview: the Claude preview MCP reads the **home** `~/.claude/launch.json`, which only defined `palmier-app`. Added a `pmh-dev` config there (`npm --prefix pensacolamilitaryhousing run dev`, port 5173); the preview now serves this project and was used to verify the a11y work live.

**Still open (larger / higher-regression-risk — awaiting go-ahead):** 2.14 analytics rewiring (SPA `page_view` in `go()`, findbuyers/calendly/825bayshore click events, calculator/FAQ events); 2.15 SPA architecture (per-route prerender shells for `/pcs-guide` `/mortgage-calculators` `/about` `/contact`, blog pipeline decision, `hydrateRoot`, fonts to `<link>`); and the **2.18 mega-footer trim** (~140 boilerplate links → ~20 curated) — deferred because trimming site-wide internal links is opinionated and reversible only with care; recommend confirming before touching. These three genuinely touch the live SPA build / analytics / site-wide linking, so they're held pending explicit go-ahead. The preview is now fixed, so 2.14/2.15 can be verified before deploy when approved.

---

## 2. Systemic Findings

Findings are ordered by severity and marked **CONFIRMED** (verified against the served files) or **PARTIALLY VERIFIED** (asserted from the audit data, not independently re-checked in this pass — treat as high-confidence but verify each rule against primary sources before editing). See the Verification Log above for items hardened to CONFIRMED on 2026-07-03. A short "ruled out" list follows.

### 2.1 CRITICAL — On-base housing content is fabricated boilerplate that contradicts itself (7 pages) — CONFIRMED

**What:** One template was token-swapped across all 7 on-base-vs-off-base pages without localization. The identical sentence "sees 4-9 months for 3-bedroom enlisted units and 6-14 months for 4-bedroom enlisted" appears verbatim at line 240 of all 7 files, and the generic manager hedge "managed by Balfour Beatty Communities, Lendlease, or similar private partners depending on the base" appears verbatim at line 237 of all 7 — nonsensical on a single-base page. On Corry Station, Saufley Field, and Duke Field the page gives specific privatized-housing wait times up top, then later states the truth: these are tenant installations with essentially no family housing. The wrong wait-time answer is baked into FAQPage JSON-LD (line 38 of each). Eglin, Whiting, and Hurlburt carry duplicate FAQ questions with conflicting wait numbers. Eglin's actual manager is likely Corvias (named nowhere; schema asserts Balfour Beatty). All 7 promise a "break-even analysis" in title/meta/lead that exists on none of them.

**Why it matters:** The exact audience — service members who know their own base — will spot self-contradiction and a wrong property manager instantly. This is the single worst credibility threat on the site, and the wrong answers are machine-readable for rich results.

**Fix:** Rewrite the housing section per base. On Corry/Saufley/Duke, delete the wait-list and BAH-forfeit boilerplate and lead with "no on-base family housing here — you compete for the NAS Pensacola/Eglin pool or go off-base." On NASP/Whiting/Eglin/Hurlburt, name the verified property manager (Corvias at Eglin, Balfour Beatty at the Navy bases — verify each) and source or remove the wait times. Dedupe the double FAQ questions, regenerate FAQPage JSON-LD from all 9 visible FAQs, and either add a real break-even calculation or strip "break-even" from meta and lead on all 7.

**Pages affected:** `/on-base-vs-off-base-corry-station`, `-saufley-field`, `-duke-field`, `-nas-pensacola`, `-nas-whiting-field`, `-eglin-afb`, `-hurlburt-field`

### 2.2 CRITICAL — Local geography and commute errors locals will catch (~14 pages) — CONFIRMED

**What:** `/communities/east-pensacola-heights` builds its entire value prop on "5-10 minutes to NAS Pensacola via Scenic Highway" — geographically impossible (EPH is a peninsula east of downtown; NAS is ~9-10 miles SW), internally contradicted by its own facts box (closer Corry Station listed at 10-15 min), and baked into H1, meta, FAQ, and multiple JSON-LD blocks. Other confirmed errors: Blue Angel Parkway named on the Gulf Breeze→NASP route (it serves the west side) on `/gulf-breeze-vs-navarre` and `/communities/cordova-park`; the NAS Pensacola West Gate (a west-side road) credited with east-side traffic; Destin claiming 10-15 min to Hurlburt (~15 miles west through FWB); the 2nd SOS placed at Duke Field on multiple pages (it is a Hurlburt GSU); Perdido Key's Old River put on the east end (it is west, at the AL line); Saufley routed via I-110/Ashton Brosnaham (wrong side of town); a garbled "Garnier Beach Lake ... south toward Baker" Crestview entry (Baker is northwest); Cordova Park's boundaries garbled with a double geo pin.

**Why it matters:** A wrong drive time or a squadron in the wrong place is exactly what a PCSing family gut-checks against Google Maps in week one. Every wrong figure usually lives in the facts box, body, FAQ, and schema at once.

**Fix:** Run a map-verification pass: every commute claim (route + minutes) at peak against Google Maps, every boundary/subdivision name against county GIS, every unit-to-base assignment against official wing pages. Correct facts box, body, FAQ, and JSON-LD together. Rewrite East Pensacola Heights around its real strengths (walkability, bayou, downtown proximity), not a false NAS commute.

**Pages affected:** `/communities/east-pensacola-heights`, `/communities/cordova-park`, `/communities/destin`, `/communities/perdido-key`, `/communities/crestview`, `/bases/saufley-field`, `/bases/nas-pensacola`, `/bases/duke-field`, `/gulf-breeze-vs-navarre`, `/niceville-vs-crestview`, `/nas-pensacola-vs-hurlburt-field`, `/bases/whiting-field`, `/communities/fort-walton-beach`, `/communities/beulah`

### 2.3 CRITICAL — Wrong VA loan rules and math on ~10 YMYL money pages — PARTIALLY VERIFIED

**What:** Core VA lending rules are misstated across the loan cluster. Full-entitlement borrowers are told county loan limits and 25%-down-above-limit apply (repealed by the 2020 Blue Water Navy Act; appears on `/va-coe-guide` and `/first-time-military-homebuyer` in both visible FAQ and JSON-LD). `/military-divorce-housing` says a civilian ex-spouse cannot assume a VA loan (they can, per VA Pamphlet 26-7 which the page itself cites). `/dual-military-homes` tells veteran+civilian-spouse couples they need 25% down on the civilian share (spouse co-borrowers get full guarantee, zero down). `/va-funding-fee-2026` gives three contradictory Guard/Reserve equalization dates, one in schema. `/va-loan-guide`'s quick-facts box shows a 1.25% "reserve" rate its own table contradicts. `/disabled-veteran-benefits-florida` labels the 2.15% first-use fee as subsequent-use ($13,437 vs correct $20,625). `/va-irrrl-guide` omits the statutory 210-day/6-payment seasoning and 36-month recoupment gates. `/assumable-va-loans-pensacola` computes the flagship payment on 360 months instead of the stated 301 remaining, overstating savings ~12% and contradicting its own calculator. `/faq` understates the SCRA foreclosure window as 9 months (1 year since 2018).

**Why it matters:** YMYL money content quoting repealed rules deters real, qualified buyers and creates lender-handoff friction. These are the site's highest-intent pages.

**Fix:** One verification pass against VA Pamphlet 26-7, the Blue Water Navy Act, and 50 U.S.C. 3953. Correct each rule in body, visible FAQ, and FAQPage JSON-LD together (they currently drift). Recompute the four bad dollar examples (assumable payment at 301 months, subsequent-use fee at 3.3%, IRRRL break-even, dual-military affordability). Move the funding-fee table, entitlement rules, and loan-limit figures into one shared facts source so every page quotes the same numbers.

**Pages affected:** `/va-coe-guide`, `/first-time-military-homebuyer`, `/military-divorce-housing`, `/dual-military-homes`, `/va-funding-fee-2026`, `/va-loan-guide`, `/disabled-veteran-benefits-florida`, `/va-irrrl-guide`, `/assumable-va-loans-pensacola`, `/faq`

### 2.4 CRITICAL — Florida statute and tax misinformation, incl. an invented benefit and two wrong filing addresses (6 pages) — PARTIALLY VERIFIED

**What:** `/va-disability-property-tax-florida` publishes a non-existent benefit (claims F.S. 196.082 gives 65+ combat-disabled veterans a discount on non-homestead property; the statute is homestead-only), states Escambia millage is lower than Santa Rosa (it is materially higher), and implies the $5K exemption saves $900-1,100/yr (10x the real $85-110). `/disabled-veteran-benefits-florida` misstates F.S. 196.24 eligibility in FAQ+schema and mislabels FY2024 SAH/SHA caps as "2026 figures." `/florida-homestead-exemption-military` states the portability window as 2 years (3 tax years since Amendment 5, 2021). **Both filing pages send veterans to 213 Palafox Place; the Escambia appraiser is at 221 Palafox Place, Suite 300.** `/florida-home-insurance-military` has the Citizens cap stale at 14% (15% in 2026) and misdescribes the F.S. 627.4025 hurricane-deductible trigger. `/military-rental-property-management` gets F.S. 83.57 termination notices wrong post-HB 1417 (says 60/15 days; actual 30/7) and omits the military Section 121 suspension — the biggest tax swing in its own sell-vs-rent math. `/zero-down-home-loans` calls Hometown Heroes "free $35K" (it is a deferred 0% second mortgage).

**Why it matters:** Sending disabled veterans to the wrong door and publishing an invented tax benefit directly undercuts the "military-insider" promise, and the wrong statute answers feed rich results.

**Fix:** Verify every statute citation against leg.state.fl.us and county sources, then correct body, FAQ, and JSON-LD in the same edit. Fix the address to 221 Palafox Place Suite 300 on both filing pages and hyperlink the county e-file portals. Consolidate the two overlapping disabled-veteran tax pages (they publish conflicting savings for the same exemptions).

**Pages affected:** `/va-disability-property-tax-florida`, `/disabled-veteran-benefits-florida`, `/florida-homestead-exemption-military`, `/florida-home-insurance-military`, `/military-rental-property-management`, `/zero-down-home-loans`

### 2.5 CRITICAL — BAH figures contradict the site's own 2026 data on ~12 pages, incl. a wrong MHA rule in schema — PARTIALLY VERIFIED

**What:** There is no single source of truth for BAH, so hand-typed figures drift. `/bah-to-mortgage-guide`'s FL064 table is wrong on 8 of 10 rows vs `/bah-rates` and its own FAQ. `/bah-rates`' H2 says "$600-900 difference" above bullets showing $570-$1,128, and the "$570-1,128" delta contradicts `BAH_DATA` in `src/App.jsx` (actual $291-$1,143). `/faq` uses a stale E-6 $2,050. `/bases/whiting-field`'s FAQ says O-1 ~$2,100 vs its own table's $1,914. `/communities/perdido-key` gives E-5 $1,644 (the without-dependents rate). The SPA PCS Guide FAQ says E-6 $1,950 while the tables above it say $2,235. **Worst: `/bases/hurlburt-field` states in FAQ and FAQPage JSON-LD that a Hurlburt member living in Navarre "still receives Pensacola MHA BAH"** — factually wrong (duty-station ZIP controls) on the exact point the page calls "the single most expensive mistake."

**Why it matters:** BAH accuracy is the site's core value proposition. A member drawing the wrong rate off this page is a direct trust failure, and the Hurlburt error is self-contradicting on its own flagship claim.

**Fix:** Make `BAH_DATA` (2026 FL064/FL023) the canonical source. Add a build-time consistency check that greps static HTML for BAH dollar figures and diffs them against the data file, failing the build on mismatch. Correct the Hurlburt MHA rule (duty-station ZIP determines the rate) in body, FAQ, and schema; recompute the FL023-FL064 delta from data; fix the 8 wrong `bah-to-mortgage` rows and every FAQ figure.

**Pages affected:** `/bah-to-mortgage-guide`, `/bases/hurlburt-field`, `/bah-rates`, `/nas-pensacola-vs-hurlburt-field`, `/faq`, `/bases/whiting-field`, `/communities/perdido-key`, plus the SPA PCS Guide and the dead SPA VALoanPage (pre-2022 table), and ~4 more community/comparison pages.

### 2.6 CRITICAL — School-zone factual errors incl. a wrong IB school and a published draft artifact (6 pages) — PARTIALLY VERIFIED

**What:** `/school-zones-military-families` says Washington High hosts Escambia's IB Diploma Programme — wrong (Pensacola High is the county's only IB DP school, IBO registry #000442) — repeated in body, Special Programs, visible FAQ, and FAQPage JSON-LD. **The same page ships a raw editing note in body copy: "Gulf Breeze Elementary (wait — this is Santa Rosa)"**, plus "Destin Hight" and a Gulf Breeze High IB self-contradiction. `/on-base-vs-off-base-corry-station` zones Cantonment (Escambia) to Jay Middle (a Santa Rosa school). `/pcs-schools-by-base` asserts ~30 letter grades with no school-year label and omits middle schools from the Whiting chains. `/communities/cantonment`'s meta promises "Tate HS feeder" but Tate is never mentioned. `/bases/duke-field` garbles "Ruckel-style Baker School."

**Why it matters:** School zoning is a top-3 PCS decision factor; a wrong IB school can surface as a rich result, and a published "(wait — this is Santa Rosa)" artifact is a visible AI-tell that destroys credibility.

**Fix:** Correct IB to Pensacola High everywhere including schema; delete the draft artifact and fix the typos; rebuild the Cantonment and Whiting feeder chains from district locators; stamp every letter grade with "2024-25 FDOE grade"; add the promised Tate HS section to cantonment.

**Pages affected:** `/school-zones-military-families`, `/pcs-schools-by-base`, `/on-base-vs-off-base-corry-station`, `/communities/cantonment`, `/bases/duke-field`, `/communities/ferry-pass`

### 2.7 CRITICAL — Illegible white-on-cream conversion section on both "vs" pages (2 pages) — PARTIALLY VERIFIED

**What:** On `/gulf-breeze-vs-navarre` and `/niceville-vs-crestview`, the "Your Next Step Depends On Which Side Wins" section hardcodes `background:#faf7ed` while inheriting the dark theme's white H2 and `#E8E6DF` paragraph color — roughly 1.05:1 contrast. The primary segmentation CTA block ("Leaning Gulf Breeze?" / "Leaning Navarre?") is effectively invisible except for faint gold links (themselves failing AA at ~2.1:1 on cream).

**Why it matters:** This is the richest internal-link routing/conversion block on each comparison page, and it is unreadable.

**Fix:** Either delete the inline `background:#faf7ed` so the section inherits the dark theme, or scope explicit colors inside it (H2/p `color:#0A0F1A`, links a darker gold like `#8a6d1f` meeting 4.5:1 on cream). Apply the identical edit to both files and eyeball at 375px and desktop.

**Pages affected:** `/gulf-breeze-vs-navarre`, `/niceville-vs-crestview`

### 2.8 CRITICAL — Advertising-compliance exposure: post-settlement "free buyer agent" claim + unsubstantiated superlatives (5 pages) — PARTIALLY VERIFIED

**What:** `/first-time-military-homebuyer` states a buyer's agent "costs you nothing — seller pays the commission," which since the Aug 2024 NAR settlement is both outdated and a prohibited representation for a licensed Realtor. Related substantiation risks under NAR Article 12 / FREC rules: homepage H1 "Pensacola's #1 military relocation Realtor"; `/sell`'s "As Pensacola's largest military relocation agent," "No cost is spared," and an implied commission-savings claim; `/buy`'s "Helped Hundreds of Clients"; `/gulf-breeze-vs-navarre`'s invented "Ninety percent of military families..." statistic.

**Why it matters:** Real regulatory exposure for a licensed agent, and a ~1-2 hour edit removes it.

**Fix:** Rewrite the compensation passage to post-settlement-accurate language (buyer-broker compensation is negotiable and may be paid by the seller, the buyer, or via concessions — not guaranteed free). Replace "#1", "largest", "hundreds", and the 90% stat with verifiable proof the site already has (review counts, transactions closed, "retired USAF officer, 11 PCS moves").

**Pages affected:** `/first-time-military-homebuyer`, `/sell`, `/` (homepage), `/buy`, `/gulf-breeze-vs-navarre`

### 2.9 HIGH — Zero body imagery on all 59 pages while 45 optimized photos sit unused — PARTIALLY VERIFIED

**What:** Every audited static page — including 3,000-4,300-word money guides — renders only the two banner logos. `public/images` holds 45 real photos (`gregg-*`, `mil-*`, hero, office) with avif/webp siblings already generated. The SPA communities page points photo slots at `/images/communities/<slug>.jpg` that all 404 into gradient fallbacks. Every page's Person/RealEstateAgent schema declares `gregg-portrait.jpg` as author image with no visible counterpart — an E-E-A-T mismatch on YMYL finance content.

**Why it matters:** This is the single largest gap vs competing agent sites, and Gregg has explicitly asked for tasteful image insertion. See Section 4 for the concrete placement map.

**Fix:** Three-step rollout — (1) create `public/images/communities/<slug>.jpg` for the 17 SPA cards (kills the 404s); (2) add a visible author byline block (portrait + credential + reviewed date) under every article H1, matching the schema; (3) place 2-3 contextual photos per money page from the existing library using `<picture>` with avif/webp, width/height, and `loading=lazy` below the fold. Prioritize the 10 highest-traffic guides first.

**Pages affected:** all 59 static pages + SPA.

### 2.10 HIGH — Structured-data integrity: self-serving reviews, invalid types, Course/HowTo misuse, entity drift (59 pages) — PARTIALLY VERIFIED

**What:** `index.html` attaches aggregateRating + six reviews (four pseudonymous) to the site's own RealEstateAgent — self-serving and ineligible since 2019, with no visible reviews on the page. Course+CourseInstance markup sits on 6 plain guide articles; HowTo markup targets a rich result Google removed in 2023. `RealEstateOrganization` (not a schema.org type) is used on ~35 pages. Two pages (`va-coe-guide`, `florida-home-insurance-military`) copy-pasted the `va-irrrl-guide` WebPage `@id`. `reviews.html` declares two conflicting `#agent` nodes and two BreadcrumbLists. `#agent` is redeclared in 9 shapes with 2 names sitewide; 9 pages ship literal `&amp;`/`&mdash;` inside JSON-LD headlines.

**Fix:** Generate JSON-LD from one shared build-time template: declare `#agent`/`#person-gregg` once (homepage) and reference by `@id` everywhere; type the brokerage as a plain `Organization`; delete the homepage aggregateRating/review block, all six Course blocks, and the HowTo; fix the two wrong WebPage `@id`s; strip duplicate blocks from `reviews.html`; emit real characters instead of HTML entities. Validate in Rich Results Test.

### 2.11 HIGH — FAQPage schema invisible or out of sync with on-page FAQs (~12 pages) — PARTIALLY VERIFIED

**What:** `buy.html` and `sell.html` declare 5-question FAQPage schema with **zero visible FAQ content** — a direct violation of Google's visible-content requirement and manual-action risk. All 7 on-base pages put only 5 of 9 visible FAQs in schema, omitting the accurate base-specific answers. `/faq`'s schema still says COE via "eBenefits" after the visible answer was corrected to VA.gov. `/va-loan-guide`'s schema has 11 of 14 questions plus a near-duplicate. `/bah-to-mortgage-guide`'s schema dollar range differs from the visible answer.

**Fix:** Write a build script that extracts every visible `<details><summary>` pair and regenerates FAQPage JSON-LD from it. For buy/sell, either reinstate the five FAQ accordions (content already written) or delete the schema — do not ship orphaned markup.

### 2.12 HIGH — Conversion path broken: single bottom-buried CTA, plain-text phones, off-tone copy (~35 pages) — PARTIALLY VERIFIED

**What:** On nearly every guide the ONLY CTA sits at the absolute bottom, below the FAQ and often below Sources. On all 7 on-base pages the strongest mid-page CTA ("Call or text (850) 266-5005 with your rank...") is plain text, not a `tel:` link — untappable on mobile and invisible to the `phone_call_click` GA event. CTA copy is often mismatched (the divorce page uses upbeat buy/sell boilerplate; the IRRRL page pitches buying; sell.html's modal is headed "Start Your PCS Search"). Two `tel:` formats split the phone metric into two GA labels on ~6 pages.

**Fix:** Add a reusable mid-page CTA component after each page's highest-intent section (BAH table, rank recommendations, break-even math). Wrap every phone mention in `tel:+18502665005` (one canonical format). Rewrite CTA copy per page intent. Give `/pcs-checklist` its namesake printable/downloadable checklist as lead capture.

### 2.13 HIGH — Tabular data mishandled: bare unstyled tables and decision data buried in prose (~25 pages) — PARTIALLY VERIFIED

**What:** The commute matrix on all 7 on-base pages plus `va-loan-guide`'s "What Your BAH Actually Buys" table are bare `<table>` elements with no class — page CSS only targets `.bah-table`/`.va-table` — so they render with browser defaults on the dark theme and risk overflow at 375px. Meanwhile all 17 community pages cram BAH-to-price data into dense prose while shipping the unused `.bah-table` CSS. The three comparison pages have zero comparison tables — the strongest featured-snippet asset for "X vs Y" queries. `zero-down`'s 5-column table lacks a scroll wrapper.

**Fix:** Wrap the 9 bare tables in the existing `.bah-wrap`/`.bah-table` classes (adds styling + `overflow-x:auto`), add `<caption>` and `th scope`. Convert community-page BAH prose into small tables. Build one side-by-side matrix (schools/commute/price/insurance/best-fit) for each comparison page. Add an overflow wrapper to zero-down's table.

### 2.14 HIGH — Analytics blind spots on the highest-value conversions — PARTIALLY VERIFIED

**What:** The seller funnel's #1 CTA (sell.html's "Request a Home Valuation" → findbuyers.com, 3 placements) fires zero events; same for the Calendly link on `/reviews` and the 825bayshore click on `/buy`. Outbound authority-link tracking covers only `travel.dod.mil`, so va.gov, county appraiser, FEMA, IRS, and school-district clicks (~30 pages) are invisible. Calculators fire nothing. FAQ opens are untracked. In the SPA, `go()` never fires `page_view` (GA and FUB both lose `/pcs-guide`, `/mortgage-calculators`, `/contact` navigations); `form_submit` fires on attempt and collides with Enhanced Measurement + Pagefind's form; the dual `gtag` config may double-count.

**Fix:** Extend the shared click handler with branches for findbuyers.com, calendly.com, 825bayshore, and a generic outbound-domain event; add a details-toggle listener; normalize `tel:` hrefs. In the SPA: fire `page_view` (and FUB pageview) inside `go()`, gate `inquiry_submit` on webhook success, track modal open/close and calculator use. In GA4 admin: register custom dimensions and verify `GT-WVGM66XS` is an alias, not a second destination.

### 2.15 HIGH — SPA architecture: hub routes are non-indexable homepage clones, blog pipeline dead, bundle ships wrong data — PARTIALLY VERIFIED

**What:** `/pcs-guide`, `/communities`, `/mortgage-calculators`, `/about`, and `/contact` all serve the homepage shell with the homepage title and `canonical=/`, so the flagship PCS Guide and the calculator suite cannot rank; ~295 internal links consolidate to the homepage and none are in sitemap.xml. The blog pipeline is broken end-to-end (static `blog.html` shadows the SPA route; nothing calls `go("blog")`; worker-backed `BlogPage` + ~12KB `STARTER_POSTS` are dead code). `go("homestead")`/`go("reviews")` render SPA pages at URLs whose server responses are different static pages. Dead `VALoanPage` ships a pre-2022 funding-fee table. Hydration uses `createRoot().render()` over the prerendered shell (near-1.0 CLS, delayed LCP); fonts load via `@import` inside a React style tag.

**Fix:** Extend `postbuild-spa-routes.mjs` to emit per-route shells with unique title/description/canonical for all five SPA routes and add them to sitemap.xml. Delete dead code and decide the blog (wire it to the worker or retire it). Fix `go("homestead")`/`go("reviews")` to navigate to the static URLs. Switch to `hydrateRoot` with a matching prerender; move fonts to a `<link>` in `index.html`.

### 2.16 HIGH — Template-wide accessibility failures — PARTIALLY VERIFIED

**What:** No form control has a programmatic label (bare `<label>` siblings, no `for`/`id`) — the lead-gen modal announces five unlabeled fields. Focus indicators are removed (`outline:none`, 121 occurrences, no `:focus-visible` anywhere). Nav dropdowns have zero ARIA and open on hover/`:focus-within` only, so on touch the "PCS Guide"/"VA Loan Guide" submenus can never open. The `--mutedD` `#6F6E65` token fails AA (~3.5-3.9:1) on footer disclaimer, dates, and 11px fine print sitewide. 60 FAQ headings are nested inside `<summary>` (heading semantics stripped). Mobile tab-bar targets collapse to ~17-22px; no skip link; modals lack focus traps.

**Fix:** One template pass fixes most pages: add `htmlFor`/`id` to every field; add a global `:focus-visible` outline; give dropdown triggers `aria-haspopup`/`aria-expanded` plus a click toggle; lighten `--mutedD` to a ≥4.5:1 value (e.g. `#8f8e83`); restructure FAQ summaries; add a skip link and 24px+ tap targets; port the native `<dialog>` pattern to the inquiry modals.

### 2.17 HIGH — No annual-update process for perishable figures — PARTIALLY VERIFIED

**What:** Year-sensitive numbers are hardcoded across ~40 pages with no refresh cycle: 2026 BAH tables, funding-fee tiers, the loan limit (already self-contradicting on `va-coe-guide`), SAH/SHA caps (already stale), Hometown Heroes $35K, 6.5% ambient-rate assumptions, tolls, MALT rate, ~30 FDOE grades, insurance ranges, the buy-page listing price/MLS#. The year is baked into `/va-funding-fee-2026` and ~10 titles. Three conflicting freshness signals (schema `dateModified` April vs footer "June 14" vs sitemap) appear on ~15 pages.

**Fix:** Create one data file (BAH, fee tiers, loan limit, caps, tolls, rate assumption) injected at build time, plus a December-January update checklist. Stamp every volatile figure with an as-of label. Inject one build-time modified date into footer, `dateModified`, and `article:modified_time`. 301 `/va-funding-fee-2026` to `/va-funding-fee` and keep the year in the title only.

### 2.18 MEDIUM — Internal architecture: flat 140-link boilerplate graph, fragment breadcrumbs, orphaned blog

**What:** Every page links to virtually every other page (57-59 unique inbound sources for all 59 pages; median 142 links per page), so internal PageRank is flat and money pages get no priority. All 59 BreadcrumbLists point position 2 at homepage hash fragments (`/#bases`, `/#resources` — which doesn't exist) with no visible breadcrumb anywhere. Body prose has almost zero contextual links. `/blog` gets only 2 internal links yet sitemap priority 0.85; its six posts live as unindexable `#fragments`. `llms-full.txt` omits 27 of 59 pages including top money pages.

**Fix:** Cut the Explore/Related boilerplate to one curated ~20-link block weighted toward money pages; add 3-5 contextual in-body links per page. Fix breadcrumb position 2 to real hubs (or drop BreadcrumbList) and render a visible breadcrumb if kept. Split blog posts into real URLs with BlogPosting schema, add `/blog` to nav. Regenerate `llms.txt`/`llms-full.txt` from the sitemap at build time.

### 2.19 MEDIUM — Head-metadata hygiene: og:type/article mismatch (~40 pages), conflicting dates, overlong titles

**What:** Nearly every guide emits `article:published_time`/`article:modified_time` with `og:type='website'` — the `article:*` namespace only parses with `og:type=article`, so scrapers ignore the dates. ~15 pages have `dateModified` frozen at April while the footer claims June 14. ~12 titles exceed 60 chars (worst: `florida-home-insurance` at 116 chars with a 327-char description; `va-coe-guide` at 90/317). Several base/on-base pages carry Pensacola `geo.placename`/`geo.position` contradicting their own JSON-LD. `bases/whiting` has a stray `</a>` that drops the Milton link.

**Fix:** Scripted sweep: set `og:type=article` on guide pages; source footer date, `dateModified`, and `article:modified_time` from one build value; trim overlong titles to ≤60 and descriptions to ≤155; correct `geo.*` per page from the JSON-LD coordinates; fix the stray `</a>`.

### 2.20 MEDIUM — Dead/conflicting template CSS, incl. a live 768-900px layout bug (~35 pages)

**What:** Every static page ships two or three generations of `.explore` CSS; the legacy `@media(max-width:900px){.explore{grid-template-columns:1fr!important}}` beats EXPLORE_V2's non-`!important` 767px rules, so tablets between 768-900px collapse the explore grid to a single column — a real visible defect. ~1/3 of each inline stylesheet is dead (unused `.rating-box`/`.reviews-grid`/`.blog-card`/`.bah-table`/`.topnav`/`.crumbs`). `index.html`'s two mobile section-padding rules can never match (escaped quotes in attribute selectors). ~922KB of inline CSS across 59 pages makes every style edit a 59-file change.

**Fix:** Scripted cleanup: delete the legacy `.explore` blocks and the 900px override, keep only EXPLORE_V2; strip unused component rules; fix `index.html`'s escaped-quote selectors. Longer term, extract shared CSS into one cached external stylesheet.

### 2.21 MEDIUM — Performance: no cache headers, oversized top-priority logos, eager Pagefind

**What:** `public/_headers` doesn't exist, so the hashed Vite bundle, all photos, logos, and Pagefind assets revalidate on every repeat view. `logo-08.png` is 1560x638 (195KB PNG / 83KB AVIF) displayed at 240x108 with `fetchpriority=high` on all 59 pages, competing with the text LCP. Pagefind's ~30KB gzip JS loads eagerly for a modal most visitors never open. The homepage preloads a 2000x2000 hero AVIF on every SPA shell and paints a 196KB JPEG CSS background whose 92KB AVIF sibling goes unused. `faq.html` carries 45.7KB of JSON-LD in `<head>`; 12 logo imgs on 6 root pages lack width/height (CLS).

**Fix:** Add `public/_headers` (`/assets/*` and `/images/*` immutable; HTML no-cache). Export logos at ~480px AVIF and drop `fetchpriority`. Lazy-load Pagefind on first search click. Add a responsive hero and scope the hero preload to the homepage; add width/height to the 12 unsized logos.

### 2.22 MEDIUM — Design-system fragmentation: stranded reviews template, off-brand greens, oversized banner

**What:** `reviews.html` is a first-generation template on a different color system (amber `#F59E0B` + Tailwind grays) colliding with the injected gold banner, excluded from search (no `data-pagefind-body`), with its own footer. Family B pages disagree on content width (760 vs 900px), related-links treatment, and accordion typography; `faq.html` is a third variant. Three unrelated green systems dilute the ink+gold brand; border radii are 4/6/10/12/14px with no token. The sticky banner consumes ~170-190px of every viewport. `index.html`'s no-JS shell uses off-palette gold `#C4A75A`, so crawlers see a different brand than hydrated users. Footers exist in at least four variants.

**Fix:** Rebuild `reviews.html` on the Family A template with the gold tokens and `data-pagefind-body`. Define tokens (radius 4/10px, one gold `#C9A84C`, retire the greens) and normalize Family B to the 760px/chip-links/4-col standard. Slim the sticky banner to ~64-80px. Align the prerendered shell's palette with the real brand and unify the footer.

### 2.23 MEDIUM — Content-strategy gaps: cannibalizing duplicates, unmet SERP promises, zero renter-track coverage

**What:** Several metas promise content the page never delivers (`/military-pcs-tax-deductions` advertises TSP with zero TSP content; `/communities/ferry-pass` promises a Washington High IB feeder; `/communities/cantonment` promises Tate HS). Page pairs cannibalize (the two disabled-veteran tax pages; blog posts shadowing `bah-to-mortgage-guide` and `niceville-vs-crestview`; `school-zones` vs `pcs-schools-by-base`). Boilerplate "Sources" sections list irrelevant links. Strategically, the rent side is completely uncovered — the site tells 12-18-month student aviators to rent, then offers no renting-on-BAH content, losing the pipeline 18 months early.

**Fix:** Fix each promise/content mismatch. Merge or sharply differentiate the two disabled-vet tax pages and the two schools pages; convert shadowing blog stubs into teasers linking their full guides. Replace boilerplate Sources with page-relevant citations. Add two renter-track pages (renting on BAH; rent-vs-buy for E-4/E-5 students) with lead capture.

### 2.24 LOW — Em-dash density in body copy sitewide (55 pages)

**What:** Nearly every static page and the SPA carry heavy em-dash use in reader-facing prose (up to 86 on `florida-home-insurance`, 59 on `va-coe-guide`, 43 on `assumable-va-loans`), including in H1s and FAQ answers that mirror into schema — Gregg's flagged AI tell. Several pages also carry double-space typos ("Pace or  Milton").

**Fix:** Scripted sweep over `public/*.html` and `src/App.jsx` body prose: replace em-dashes with periods, commas, colons, or parentheses (manual review on H1s); fix double-spaces; add a pre-deploy lint that fails on em-dashes inside `<main>` prose.

### Ruled Out / Verified Clean (do not spend time here)

- **Broken links:** none. Across ~8,500 internal hrefs, zero broken, zero legacy `.html`, zero redirect-hopping. Sitemap matches disk 100% both directions (62 URLs). Every static page has a clean extensionless self-canonical.
- **Tracking coverage gaps:** none at the baseline. GA4 (G-W29GHBK38M + GT-WVGM66XS), Clarity (wm7ddbciup), and the FUB widget (WT-ZZMZHBMI) are present on all 59 static pages + the SPA shell with zero omissions.
- **JSON-LD parse errors:** none. All 336 JSON-LD blocks parse cleanly; per-page FAQ schema content matches visible content except the specific drift cases listed in 2.11.
- **Core calculator math:** verified correct. SPA amortization, VA funding-fee tiers, FHA MIP, and PMI-removal logic all check out (the errors are in hand-typed prose examples, not the calculators).
- **The "tenant installation / no family housing" self-contradiction** correctly scopes to Corry, Saufley, and Duke only — Eglin genuinely has on-base family housing, so the claim is precise, not overstated.

---

## 3. Specialist Deep-Dives

### 3.1 Design System

**Summary:** Strong brand identity (ink `#0A0F1A` + gold `#C9A84C`, Playfair Display/Inter) executed by at least four drifted template generations: the bases/communities family (most polished, 760px measure, pill chips, right-aligned BAH tables); the root-guide family (900px, dotted-list related links, serif accordions, an off-brand green table theme, unstyled tables); `faq.html` (a hybrid); and `reviews.html`, a stranded first-generation page on an amber/Tailwind palette clashing with the gold banner. The biggest aesthetic gap vs Compass/Sotheby's-tier sites is not the dark theme (keep it) but the total absence of photography, plus a ~180px double-logo sticky banner on every page.

**Top recommendations:** (1) Extract one shared `/assets/site.css` holding tokens, banner, footer, buttons, tables, accordion, `.related` pills, CTA, and EXPLORE_V2; strip each page's inline `<style>` to page-specific rules (ends drift, cuts ~15-20KB/page). (2) Rebuild `/reviews` first — weakest template on the highest-trust page. (3) Fix the two classless tables now (Eglin commute matrix, va-loan BAH-buys) and audit the other six on-base pages. (4) Put photography on every template using the 45 existing images. (5) Slim the header to a single 56-72px row with shrink-on-scroll. (6) Normalize scale: 760-820px measure, one accordion style, 4px/10px/12px radii, one green. (7) Unify conversion (generalize buy.html's modal sitewide, add a mobile sticky call/text bar). (8) Re-token the `index.html` no-JS shell to the real brand.

### 3.2 Imagery Plan

**Summary:** A genuinely rare asset library (a real USAF career: AWACS flightlines, T-6 cockpit, deployed crew, dress blues, vet handshake, portraits, all pre-optimized with webp/avif) sits entirely unused — the only visible images are two banner logos, and `gregg-portrait.jpg` appears 154 times in schema without one visible use. The infrastructure to fix this already exists (the banner uses the correct `<picture>` pattern; `wrap-img-with-picture.mjs` automates wrapping; SPA community cards are already wired for `/images/communities/<slug>.jpg`).

**Top recommendations:** (1) Ship the pattern first — add `.figure-band`, `.figure-inline`, `.author-card` CSS and a `scripts/rollout-imagery.mjs` that injects a band after `<header>` and an author-card before the footer. (2) Pilot on the 7 base guides + `va-loan-guide` with contextual assignments (whiting → T-6 cockpit; AF bases → AWACS/flightline; Navy bases → flightline walk; VA guides → flightsuit-AWACS credibility band). Caption every military photo as Gregg's own service. (3) Add the visible author-card sitewide using the exact `gregg-portrait.jpg` schema already declares — the cheapest E-E-A-T win. (4) Book one drone/photo day for 17 slug-named community aerials (also lights up the SPA cards, zero code change). (5) Cap at 2 lazy-loaded photos/page with explicit width/height; never touch cheesy military stock.

### 3.3 IA / Internal Linking

**Summary:** Link hygiene is excellent (zero broken, zero legacy links, sitemap 100% matched, clean self-canonicals). The structural problems are architectural: the graph is a near-complete graph (median 142 internal links/page), so money pages win only by duplicate-link counts. Worse, the three most-promoted hub URLs — `/pcs-guide` (176 inbound), `/communities` (60), `/mortgage-calculators` (59) — are SPA routes with `canonical=/`, so ~300 links funnel into non-indexable homepage aliases and the flagship "PCS Guide" topic has no indexable page.

**Top recommendations:** (1) Prerender real, self-canonical static pages for `/pcs-guide`, `/communities`, `/mortgage-calculators`; add to sitemap and both LLM files — 295 links instantly gain an indexable target. (2) Break the complete-graph pattern: trim the mega-nav to ~20 destinations, relocate exhaustive link lists onto hub pages, cap contextual body links at 5-10/page aimed within each cluster and at money pages. (3) Add `/blog` to nav or lower its 0.85/weekly billing. (4) Refresh both LLM files (add `florida-home-insurance`, backfill the 27 missing pages, reconcile the domain-count discrepancy). (5) Repair breadcrumb schema after hubs exist. (6) Add the 4 missing `.html`→clean 301s and delete the dead `/homestead` and `/va-loans` SPA routes.

### 3.4 SPA Audit

**Summary:** A well-built 2,718-line single-file app with correct core mortgage math and a 2026 `BAH_DATA` table matching its static twins, but the routing layer has drifted badly: ~500+ lines of components (`VALoanPage`, five `BaseGuide` pages, `BlogPage`) are dead code still shipping in the unsplit bundle. The blog pipeline is broken end-to-end. Every live SPA-only route serves the homepage shell with the homepage title/canonical, so the PCS Guide and calculator suite are invisible to Google and absent from sitemap.

**Top recommendations:** (1) Fix the SPA-route SEO shells (per-route title/description/og/canonical) and add to sitemap — unlocks ranking for the two most valuable assets. (2) Repair or retire the blog pipeline. (3) Correct the live `/pcs-guide` FAQ BAH contradiction (E-6 $1,950 → $2,235 from `BAH_DATA`). (4) Delete dead components and `React.lazy` the calculator suite. (5) Make nav dropdowns touch/keyboard operable and patch modal a11y. (6) Move Google Fonts out of the in-JS `@import` into `index.html`. (7) Refresh stale `CLAUDE.md`.

### 3.5 Analytics

**Summary:** Baseline coverage is excellent (GA4 + Clarity + FUB on all pages, a consistent 10-event click taxonomy). The problems are at the conversion layer: the two surfaces speak different dialects (static buy/sell fires success-gated `inquiry_submit`; the SPA fires only attempt-based `form_submit` that name-collides with Enhanced Measurement and Pagefind), and the highest-value CTAs are dark (sell.html's valuation link ×3, reviews.html's Calendly, every SPA modal open, all calculator use). End-to-end measurement works cleanly only on `/buy` and `/sell`.

**Top recommendations:** (1) Unify on success-gated `inquiry_open`/`inquiry_submit` across both surfaces with `page_surface` + `cta_location` params. (2) Mark as GA4 key events: `inquiry_submit`, `phone_call_click`, `email_click`, `calendly_click`, `valuation_request_click` — not `form_submit`. (3) Close the two dark money CTAs (findbuyers.com, calendly). (4) Fire FUB `pageview` inside `go()` so the CRM sees SPA navigation. (5) Verify in GA4 admin (GT alias, Enhanced Measurement toggles, one page_view/form_submit per action). (6) Instrument calculator engagement. (7) Register `event_category`/`event_label` as custom dimensions.

### 3.6 Performance

**Summary:** Decent CWV shape for a 59-page static surface (non-blocking fonts, async trackers, deferred modules, text LCP on the dark background). The two heaviest problems are the 1560x638 logo fetched at `fetchpriority=high` into a 240x108 slot on every page, and the home-page hydration swap (`createRoot().render()` wipes a prerendered SEO block, producing a large CLS and delayed LCP behind a 95KB-gzip bundle with fonts discovered via `@import`).

**Top recommendations:** (1) Shrink/de-prioritize the banner logos (biggest sitewide LCP win). (2) Fix the home-page hydration swap (async fonts in `index.html`, reserve above-fold geometry). (3) Add `public/_headers` with immutable caching for `/assets/*` and `/images/*`. (4) Lazy-load Pagefind on first search open. (5) Right-size the home-page hero (~800px mobile variant) and switch the story background to the existing AVIF sibling. Secondary: extract shared CSS, slim duplicated JSON-LD, add width/height to the 12 unsized logos.

### 3.7 Schema / Entity

**Summary:** All 336 JSON-LD blocks parse cleanly and the Article/FAQPage/BreadcrumbList/Person template is wired consistently, but the entity graph suffers copy-everywhere drift: `#agent` redeclared on every page in 9 shapes with 2 conflicting names, the homepage split across `#agent`/`#localbusiness`/`#brokerage`, and two pages carrying the wrong WebPage `@id`. Six guide pages carry Course markup with no rich-result upside; `reviews.html` has two conflicting BreadcrumbLists and two `#agent` nodes; the homepage marks up aggregateRating + review bodies not visible anywhere.

**Top recommendations:** (1) Fix the two copy-pasted WebPage blocks (`florida-home-insurance-military`, `va-coe-guide`). (2) Remove Course blocks from the 6 guide pages. (3) De-duplicate `reviews.html`. (4) Centralize the entity graph (declare `#agent`/`#person-gregg`/`#brokerage` once, reference by `@id`). (5) Merge `#localbusiness` into `#agent`; remove the dead `g.co/kgs` sameAs (404). (6) Move review/aggregateRating markup off the homepage. (7) Fix `&amp;` double-encoding on 9 pages. (8) Set expectations: Breadcrumb + Article are the realistic Google wins; FAQPage is AI-surface-only since Aug 2023; HowTo/Course are display-inert — do not invest further there.

### 3.8 Accessibility

**Summary:** The core palette is largely AA-safe on the dark navy (body `#E8E6DF` = 15.3:1, muted `#A5A496` = 7.1-7.6:1, gold `#C9A84C` = 7.8-8.4:1). The systemic failures are interaction-layer: no form label is programmatically associated with its input anywhere; focus indicators are stripped (`outline:none` ×121) with no `:focus-visible` replacement; nav dropdowns have no ARIA and are unreachable on touch for two menus; the mobile tab bar shrinks to ~9px text with sub-24px targets. One token fails contrast: `--mutedD` `#6F6E65` (3.47:1 on panel) on footer/date/fine-print.

**Top recommendations:** (1) Two one-line edits first — bump `--mutedD` to `#8A897E` and add a global `:focus-visible{outline:2px solid var(--gold)}`. (2) Associate every label (`for`/`id`) and add `role="alert"` to the inquiry error box. (3) Fix ≤480px nav sizing (24px+ targets, larger font). (4) Make navigation real links; add `aria-expanded`/`aria-haspopup` + click toggle to dropdowns. (5) Migrate the inquiry modal to the native `<dialog>` pattern already proven in search. (6) Restructure FAQ summaries and add a skip link. (7) Spot-verify with axe/Lighthouse on `/faq`, `/buy`, `/bases/eglin-afb`, and the SPA home.

### 3.9 Content Strategy

**Summary:** One of the most complete military-relocation topical maps for a local agent (59 pages, full schema, `dateModified`, llms.txt AI guidance). The two structural weaknesses are freshness risk (1,052 "2026" occurrences across 63 files, all hardcoded with no refresh cycle) and an entirely missing rent-side funnel even though NAS Pensacola/Whiting's core population is 12-18-month student aviators the site itself tells to rent. Two genuine cannibalization clusters (the two disabled-veteran tax pages with conflicting figures; the homestead blog post vs the homestead page with a mis-anchored link). E-E-A-T is strong in schema but weak on-page (no visible byline/reviewed-date; visible source citations on only ~6 of 59 pages).

**Top recommendations:** (1) Build 5 new pages in order: rent-vs-buy + military-rentals; VA appraisal guide (Tidewater/NOV/MPR/WDO); sell-on-PCS-orders timeline (with the IRC 121(d)(9) military suspension); new-construction-near-bases; and a quarterly market-update page that doubles as the freshness engine. (2) Institute the annual figure-refresh checklist with calendar triggers (mid-Dec BAH, late-Nov FHFA, January fees/caps). (3) Migrate `/va-funding-fee-2026` to an evergreen slug with a 301. (4) De-duplicate the disabled-veteran tax cluster. (5) Fix the blog homestead post's mis-anchored link and convert shadowing posts to teasers. (6) Add on-page byline + Sources chrome to every finance/tax page. (7) Stop batch-stamping `dateModified`.

---

## 4. Imagery Plan — Per-Template Photo Placement Map

This is the concrete map Gregg asked for. All assets exist in `public/images/` with `.avif`/`.webp` siblings unless marked **NEW SHOT**. Use `<picture>` with avif→webp→jpg sources, explicit `width`/`height`, `loading="lazy"` and `decoding="async"` below the banner. Cap at 2 content photos per page. Caption every military photo as Gregg's own service ("From Gregg's USAF career") so an AWACS shot on a Navy page reads as author credibility, not wrong-base stock.

### Author-card (every article page — highest-value, cheapest)
- **Under each H1:** `.author-card` with `gregg-portrait.jpg` (96-128px) + "Gregg Costin, Retired USAF officer · MRP · Licensed FL/AL" + visible "Updated `<date>`" bound to the JSON-LD `dateModified`. This is the exact image the schema already declares — no schema edits, resolves the E-E-A-T mismatch sitewide.

### Base guides (`/bases/*`) — 7 pages
- **Hero band after `<header>`:** aviation shot matched to the base. `whiting-field` → `mil-t6-cockpit.jpg` (the T-6B is its actual trainer). Air Force bases (`hurlburt`, `eglin`, `duke`) → `mil-awacs-refuel.jpg` or `mil-flightline-ocps.jpg`. Navy bases (`nas-pensacola`, `corry`, `saufley`) → `mil-flightline-walk.jpg`.
- **Beside the closing CTA:** `mil-vet-handshake.jpg` (`.figure-inline`), alt "Gregg Costin welcoming a veteran client."

### VA / money guides (`va-loan-guide`, `va-coe-guide`, `va-irrrl-guide`, `va-funding-fee-2026`, `assumable-va-loans`, `zero-down`, `bah-to-mortgage-guide`, `bah-rates`) — ~8 pages
- **Credibility band after header:** `mil-flightsuit-awacs.jpg`, alt "Gregg Costin in flight suit beside the E-3 AWACS during his Air Force career."
- **Author-card above the Sources block** (per above).

### PCS / planning + buyer-profile (`pcs-checklist`, `pcs-schools-by-base`, `first-time-military-homebuyer`, `school-zones`, `dual-military-homes`)
- **Band:** `mil-family-awacs.jpg` (2200x880, the best natural banner in the library). School/family pages → `mil-kids-cockpit.jpg`. `dual-military-homes` → `about-flightsuit-mom.jpg`.
- **`military-divorce-housing`: keep neutral** — `office.jpg` or no photo. Celebratory family imagery is tonally wrong here.

### Comparison + on-vs-off-base pages
- **Single hero band only** (`hero-window.jpg` or the future community drone shot). Priority on these pages is the missing comparison *table* (see 2.13), not a second photo.

### Community pages (`/communities/*`) — 17 pages
- **Hero band:** slug-named `1600x900` aerial from **one drone day** (**NEW SHOT**). This simultaneously fills the empty SPA card slots at `/images/communities/<slug>.jpg` (SPA already looks for them, zero code change) and provides each static community hero. Add Blue Angels over Pensacola Beach as a signature NAS Pensacola / homepage asset.
- **Beside CTA:** `gregg-portrait.jpg` author thumbnail.

### Buy / sell / reviews
- **`/reviews`:** `gregg-portrait.jpg` beside the rating stack; partner-badge strip.
- **`/buy`:** `mil-flightline-walk.jpg` on the remote-tour card; a real 825 Bayshore listing thumbnail on the featured-listing block; `mil-vet-handshake.jpg` by the testimonials.
- **`/sell`:** `gregg-portrait.jpg` beside the valuation CTA; Zillow Premier badge under the Zillow cards.

### Homepage no-JS block
- `gregg-portrait.jpg` after the intro (also strengthens the entity match); `mil-t6-cockpit.jpg` above the base list; `mil-vet-handshake.jpg` at the final CTA.

### Do NOT
Buy generic military stock (saluting silhouettes, flag-draped handshakes, staged model-home families); wallpaper the same AWACS shot on every page; place text over photos without an overlay contrast check; rename/delete existing files (og/ and schema URLs reference them); exceed 2 photos/page.

---

## 5. Page-by-Page Appendix

Scores are C = Content, S = SEO, Co = Code, D = Design, A = Analytics (1-10). Grouped by template family. The verdict line is the auditor's one-line summary.

### Homepage / SPA Shell

| Page | C / S / Co / D / A | Verdict |
|---|---|---|
| `/` (index.html — SPA shell + static SEO block) | 8 / 7 / 7 / 7 / 9 | A dense, flawlessly-linked SEO shell with excellent tracking, undermined by risky self-serving review schema, an invalid brokerage type, a duplicate business entity, and a silently broken mobile-padding CSS fix. |

**`/`** — Top findings: [HIGH] self-serving + pseudonymous review markup on the site's own RealEstateAgent (manual-action risk); [MED] `RealEstateOrganization` is not a schema.org type (×3); [MED] duplicate business entity (`#agent` vs `#localbusiness`, two names); [MED] two dead mobile CSS rules (escaped quotes, so SPA sections keep 100-140px phone padding); [MED] H1 "#1" superlative + perishable "6.5% market" anchor text. Images: portrait after intro; T-6 above base list; vet-handshake at CTA; badge strip in Designations. Quick wins: delete the homepage review array/aggregateRating; replace the three `RealEstateOrganization`; fix the escaped-quote selectors; trim title to ~58 chars; reword the "#1" claim; underline static-block links; register `event_category`/`event_label` dimensions.

### Content Guides (VA / BAH / tax / buyer-profile)

| Page | C / S / Co / D / A | Verdict |
|---|---|---|
| `/assumable-va-loans-pensacola` | 7 / 8 / 8 / 7 / 7 | Best-in-class niche money page with a killer calculator, undermined by one confirmed math error at the heart of its savings pitch. |
| `/bah-rates` | 7 / 8 / 8 / 6 / 8 | The Panhandle's definitive BAH data page, undercut by a comparison heading that contradicts its own math and a CTA buried below citations. |
| `/bah-to-mortgage-guide` | 5 / 7 / 7 / 6 / 8 | Best-in-class content sabotaged by an FL064 table whose numbers contradict the site's own BAH page in 8 of 10 rows. |
| `/disabled-veteran-benefits-florida` | 6 / 8 / 8 / 6 / 8 | Excellent SEO scaffolding and differentiated benefit-stacking content, but four externally verified factual errors. |
| `/dual-military-homes` | 7 / 8 / 8 / 5 / 9 | Differentiated dual-military content held back by a material VA spouse-co-borrower misstatement and optimistic affordability math. |
| `/first-time-military-homebuyer` | 7 / 8 / 8 / 6 / 9 | A deep first-buyer playbook with flawless technical SEO, held back by two outdated money claims (incl. the NAR "free agent" line). |
| `/florida-home-insurance-military` | 8 / 6.5 / 8.5 / 5 / 8 | Best-in-class insurance content undermined by a copy-pasted schema identity bug, one stale 2026 figure, and a 4,300-word text wall. |
| `/florida-homestead-exemption-military` | 7 / 8 / 8 / 6 / 8 | Authoritative homestead guide undermined by two verified errors — the pre-2021 "2-year" portability window and a wrong Escambia address. |
| `/military-divorce-housing` | 6 / 8 / 8 / 6 / 9 | Expert divorce playbook undercut by a real VA-assumption error baked into its FAQ schema and a tone-deaf boilerplate CTA. |
| `/military-pcs-tax-deductions` | 8 / 8 / 8 / 5 / 7 | Authoritative, schema-rich PCS tax guide held back by a meta description promising TSP content the page doesn't have. |
| `/military-rental-property-management` | 7 / 8 / 8 / 6 / 9 | A superbly schema'd landlord playbook undercut by a broken price-to-rent rule, likely-outdated FL notice periods, and a missed military capital-gains rule. |
| `/pcs-checklist` | 8 / 8 / 7 / 5 / 7 | SEO-hardened, authoritative content that never behaves like the checklist it promises (no checkboxes, no printable, no lead-capture PDF). |
| `/pcs-schools-by-base` | 8 / 8 / 8 / 5 / 7 | Best-in-class content and near-flawless SEO undermined by a zero-image text wall and annually-perishable grades with no as-of date. |
| `/school-zones-military-families` | 5 / 7 / 8 / 6 / 8 | Best-in-class strategy content undermined by a wrong IB-school claim, a leftover draft note in published copy, and a text wall. |
| `/va-coe-guide` | 6 / 7 / 8 / 5 / 7 | A deep COE guide undercut by a wrong-page WebPage schema block and an entitlement section whose 2026 figures contradict themselves. |
| `/va-disability-property-tax-florida` | 5 / 8 / 7 / 5 / 7 | Deep, well-linked guide undercut by three verifiable factual errors incl. an invented "non-homestead" exemption. |
| `/va-funding-fee-2026` | 7 / 8 / 8 / 6 / 8 | Math-perfect funding-fee reference held back by a self-contradicting Guard/Reserve history claim repeated inside its FAQ schema. |
| `/va-irrrl-guide` | 7.5 / 8 / 8.5 / 6.5 / 9 | Best-in-class IRRRL copy held back by a missing seasoning/recoupment rule (the one eligibility fact that matters) and a few muddled facts. |
| `/va-loan-guide` | 7 / 7 / 7 / 6 / 9 | A deep money page undermined by a self-contradicting funding-fee facts box, an unstyled BAH table, and a title that never says Pensacola. |
| `/zero-down-home-loans` | 8 / 8 / 7 / 5 / 8 | Schema-complete loan comparison whose one bottom-buried CTA, zero imagery, and mobile-hostile table leave leads on the table. |

**Highlights (guide family):**

- **`/assumable-va-loans-pensacola`** — [HIGH] payment computed on 360 months not the stated 301 (savings overstated ~12%, contradicts its own calculator); [MED] muddled cash-to-close; [MED] duplicate/off-topic Sources; [MED] calculator fires no analytics; [MED] zero imagery. Images: flightline band; portrait at CTA; 6-step process timeline. Quick wins: fix the payment math (line 247-248); `og:type=article`; delete the duplicate Sources block; trim title; add a `calculator_used` event.
- **`/bah-rates`** — [HIGH] H2 "$600-900 difference" contradicts its own bullets ($546-$1,128); [HIGH] buying-power ×150-170 multiplier overstates affordability at hardcoded 6.5%; [MED] zero imagery; [MED] CTA below the citations; [MED] tables lack captions/scope. Images: AWACS band; second flightline at the FL064/FL023 break; portrait in CTA. Quick wins: retitle to "$550-$1,130"; fix "nearly $7,000"→"just over"; hyperlink the VA-loan/BAH links; `&amp;`→`&`; outbound_click branch; delete legacy `.explore`.
- **`/bah-to-mortgage-guide`** — [CRITICAL] FL064 table wrong on 8/10 rows vs `bah-rates`; [HIGH] FAQPage schema range out of sync; [HIGH] zero imagery; [MED] "VA Circular 26-xx-xx" placeholder shipped; [MED] date conflict. Images: flightline after intro; portrait at CTA. Quick wins: copy correct FL064 figures from `bah-rates.html`; sync FAQ schema; replace the placeholder; sync dates; remove Course block.
- **`/florida-home-insurance-military`** — [HIGH] WebPage `@id` points at `va-irrrl-guide`; [HIGH] zero imagery; [HIGH] single buried CTA; [MED] Citizens cap stale at 14%; [MED] hurricane-deductible trigger inaccurate; [MED] title 116 chars / desc 327. Quick wins: fix the WebPage `@id` (2 min); update Citizens cap to 15%; sync dates; delete Course block; trim title/desc; add outbound-click branch.
- **`/va-coe-guide`** — [HIGH] WebPage `@id` copy-pasted from `va-irrrl-guide`; [HIGH] contradictory 2026 loan-limit ($836,750 vs $832,750, "Tier 1 high-cost" mislabel); [HIGH] wrong full-entitlement 25%-down rule; [MED] title 90 / desc 317; [MED] single buried CTA; [MED] zero imagery. Quick wins: fix WebPage `@id`; pick one loan limit everywhere and recompute the $209,187 figure; trim title/desc; add va.gov/archives.gov outbound branches; drop portrait at CTA.

### On-Base-vs-Off-Base Family (7 pages)

| Page | C / S / Co / D / A | Verdict |
|---|---|---|
| `/on-base-vs-off-base-corry-station` | 5 / 7 / 7 / 6 / 9 | Well-built template torpedoed by its own bottom half: sells Corry-specific wait-list math for on-base housing the page later admits Corry doesn't have. |
| `/on-base-vs-off-base-duke-field` | 4 / 6 / 6 / 5 / 8 | Accurate Duke back half undermined by a templated front that invents Balfour Beatty wait lists for a base with essentially no family housing. |
| `/on-base-vs-off-base-eglin-afb` | 6 / 8 / 7 / 5 / 9 | Strong bones undermined by a self-contradicting duplicate FAQ, a missing break-even, a likely-wrong housing manager, and an untappable phone. |
| `/on-base-vs-off-base-hurlburt-field` | 6 / 7 / 7 / 5 / 9 | Genuinely expert Hurlburt guide undercut by an unstyled table, an untappable mid-page phone CTA, a missing break-even, and zero imagery. |
| `/on-base-vs-off-base-nas-pensacola` | 7 / 8 / 7 / 6 / 9 | Authoritative guide undermined by a missing promised break-even, an untappable phone CTA, an unstyled commute table, and zero photos. |
| `/on-base-vs-off-base-nas-whiting-field` | 7 / 8 / 7 / 6 / 9 | Strong Whiting depth undercut by a self-contradicting duplicate FAQ, an unstyled table, un-localized hedges, and zero imagery. |
| `/on-base-vs-off-base-saufley-field` | 4 / 6 / 6 / 5 / 8 | Well-linked page sabotaged by its own premise: quotes precise wait times for Saufley on-base housing its own FAQ says does not exist. |

**Shared pattern (all 7):** [CRITICAL] fabricated privatized-housing wait times contradicting the page's own tenant-installation truth (see 2.1); [HIGH] commute matrix is a bare unstyled `<table>` — wrap in `.bah-wrap`/`.bah-table` (CSS already present); [HIGH] mid-page phone is plain text, not `tel:` — untappable + untracked; [HIGH/MED] "break-even" promised in meta/lead, delivered nowhere; [MED] FAQPage schema carries only 5 of 9 visible FAQs; [MED] duplicate FAQ questions with conflicting wait numbers (Eglin/Whiting/Hurlburt); [LOW] `og:type=website` with `article:*` metas; [LOW] geo meta points at Pensacola on non-Pensacola bases; [LOW] em-dashes + double-space typos. Images: base-matched flightline band; portrait at CTA; family/vet shot mid-page. Universal quick wins: wrap the commute table; wrap the mid-page phone in `tel:+18502665005`; regenerate FAQPage schema from all 9 visible FAQs; strip "depending on the base"; add the break-even section or drop the promise; fix geo meta; `og:type=article`.

### Base Guides (7 pages)

| Page | C / S / Co / D / A | Verdict |
|---|---|---|
| `/bases/corry-station` | 8 / 8 / 7 / 6 / 9 | Audience-exact content with airtight analytics and schema, but a 2,400-word imageless wall with two commute/gate facts to correct. |
| `/bases/duke-field` | 7 / 9 / 8 / 6 / 9 | Authority-grade AFRC content held back by a likely 2nd SOS location error, local slips, and an image-free wall. |
| `/bases/eglin-afb` | 8 / 8 / 8 / 6 / 9 | Deeply authoritative guide whose two real problems are credibility (the overstated "every F-35A pilot" claim) and conversion (zero imagery, lone CTA). |
| `/bases/hurlburt-field` | 6 / 7 / 7 / 6 / 9 | The deepest AFSOC guide in its market, undermined by the page arguing with itself about which MHA pays a Navarre-living member's BAH. |
| `/bases/nas-pensacola` | 6 / 9 / 7 / 6 / 9 | The most authoritative CSO/NFO PCS page in existence on paper, but its flagship T-1A claim went stale in July 2025 and it argues both sides of rent-vs-buy. |
| `/bases/saufley-field` | 7 / 8 / 7 / 6 / 9 | Deep, schema-rich guide undermined by an unverified Gates paragraph, a wrong ZIP, an incomplete tenant list, and a text wall. |
| `/bases/whiting-field` | 7 / 8 / 7 / 6 / 9 | Authoritative guide undercut by three accuracy errors (O-1 BAH vs its own table, "E-4/E-5 student naval aviator", "FL064 shared with itself") and a broken Milton link. |

**Highlights (base family):**

- **`/bases/nas-pensacola`** — [HIGH] 451st FTS "T-1A" training claim retired July 2025 (all-simulator now), repeated in body, FAQ, facts box, keywords, and 3 JSON-LD blocks; [HIGH] rent-vs-buy self-contradiction (line 331 says buy >12mo, line 338 says students overwhelmingly rent); [MED] gate info geographically implausible; [MED] dead `defensetravel.dod.mil` URL; [MED] zero imagery in 3,400 words. Images: T-6 cockpit after pipelines H2; AWACS band; portrait at CTA. Quick wins: swap the DTMO URL; fix the B-2/pipeline error; patch the T-1A facts-box line; `og:type=article`; drop T-6 photo.
- **`/bases/hurlburt-field`** — [CRITICAL] the page contradicts itself on which MHA pays a Navarre-living Hurlburt member's BAH (in body, FAQ, and FAQPage JSON-LD) on the exact point it calls "the single most expensive mistake"; [HIGH] zero imagery; [HIGH] single bottom CTA; [MED] redundant neighborhood sections; [MED] dropdown submenus unreachable on touch. Quick wins: fix the Navarre BAH answer in all three places (FL023 controls); copy the CTA block above the FAQ; normalize `tel:` format; remove onclick from dropdown triggers.
- **`/bases/whiting-field`** — [HIGH] FAQ O-1 "~$2,100" contradicts its own table ($1,914); [HIGH] stray `</a>` drops the Milton internal link; [HIGH] "E-4 or E-5 student naval aviator" (SNAs are O-1/O-2); [MED] "FL064 shared with NAS Whiting Field" (self-reference); [MED] zero imagery. Quick wins: fix line 333 Milton `<a>`; correct O-1 BAH in FAQ + schema; fix the FL064 co-tenant list; change "student naval aviator" to "support sailor"; add a visible breadcrumb.

### Comparison Pages (3)

| Page | C / S / Co / D / A | Verdict |
|---|---|---|
| `/gulf-breeze-vs-navarre` | 7 / 8 / 7 / 4 / 9 | Sharp BAH-arbitrage angle undercut by an illegible cream-on-dark CTA box, a Blue Angel Parkway geography slip, and no comparison table. |
| `/niceville-vs-crestview` | 8 / 8 / 7 / 4 / 9 | Excellent rank-aware content on a near-flawless chassis, but the "Your Next Step" box renders white-on-white (invisible) and there is no comparison table. |
| `/nas-pensacola-vs-hurlburt-field` | 7 / 8 / 7 / 6 / 9 | Tightly targeted, schema-complete page undermined by a headline BAH range that contradicts the site's own data and no comparison table. |

**Shared pattern:** [CRITICAL] the `.next-steps` cream box is illegible on two of three (see 2.7); [HIGH] no comparison table on a comparison page (strongest featured-snippet asset); [HIGH] geography/BAH errors (Blue Angel Pkwy on the GB route; `$570-1,128` contradicting `BAH_DATA`'s $291-$1,143); [MED] `og:type` mismatch. Quick wins: swap `background:#faf7ed` for the dark callout pattern (also fixes readability); build one side-by-side matrix per page; correct the BAH range; fix the Blue Angel Parkway route.

### Hub Pages (buy / sell / faq / blog / reviews)

| Page | C / S / Co / D / A | Verdict |
|---|---|---|
| `/buy` | 7 / 6 / 7 / 6 / 8 | Conversion-solid, well-tracked buy hub held back by an invisible FAQ schema violating Google's visibility rule, a garbled stale-risk listing line, and zero photography. |
| `/sell` | 6 / 6 / 7 / 6 / 7 | Polished seller page whose biggest leaks are an orphaned FAQ schema, an untracked primary valuation CTA, buyer-only testimonials, and an imageless body. |
| `/faq` | 7 / 8 / 7 / 5 / 8 | SEO-complete 60-question hub with verified schema parity, held back by a 60-accordion text wall and three stale facts (9-month SCRA, dead DTMO URL, $2,050 E-6). |
| `/blog` | 7 / 6.5 / 7 / 6 / 7 | An authoritative, fresh blog trapped in a single-URL accordion — give each post its own page, fix the mislinked title and empty summaries, add photos. |
| `/reviews` | 6 / 6 / 7 / 6 / 8 | A well-tracked trust hub that undercuts itself with conflicting duplicate schema, self-serving review markup, only 6 of 62 reviews shown, and zero photography. |

**Highlights (hub family):**

- **`/buy`** — [HIGH] FAQPage schema declares 5 Q&As with zero visible FAQ (visibility violation); [HIGH] "in 32507 minutes from NAS Pensacola" garble + hardcoded stale $119,990/MLS#; [HIGH] zero imagery; [MED] title 77 / desc 198; [MED] featured-listing outbound untracked. Quick wins: fix the "32507 minutes" line; add a `featured_listing_click` branch; trim title/desc; paste the 5 FAQ Q&As into a visible `<details>` section (CSS already present); label the form fields.
- **`/sell`** — [HIGH] orphaned 5-question FAQPage schema (no visible FAQ); [HIGH] valuation CTA (findbuyers.com ×3) fires zero events; [MED] title/desc over length; [MED] `RealEstateOrganization` invalid type; [MED] buyer-only testimonials on a sell page; [MED] compliance superlatives ("largest," commission-savings). Quick wins: add findbuyers.com to the click handler; reinstate or delete the FAQ schema; retitle the modal; label form fields; swap in seller testimonials.
- **`/reviews`** — [HIGH] two conflicting `#agent` nodes + two BreadcrumbLists; [HIGH] self-serving aggregateRating+reviews on own domain; [HIGH] only 6 of 62 reviews shown, no Zillow text; [MED] Calendly untracked; [MED] irrelevant "Sources" block; [MED] no `<main>` landmark. Quick wins: delete the duplicate BreadcrumbList/`#agent`; add a `calendly.com` branch; remove the boilerplate Sources; wrap body in `<main>`; add star `aria-label`s.
- **`/faq`** — [HIGH] SCRA foreclosure window stated as 9 months (1 year since 2018), in visible + schema; [HIGH] 60-accordion text wall, zero imagery, bottom CTA; [MED] dead `defensetravel.dod.mil`; [MED] E-6 $2,050 contradicts its own $2,235; [MED] schema still says "eBenefits". Quick wins: 9-month→one-year; swap DTMO URL; E-6 $2,050→$2,235; "eBenefits"→"VA.gov" in schema; normalize banner `tel:`.

### Community Pages (17)

| Page | C / S / Co / D / A | Verdict |
|---|---|---|
| `/communities/bellview-myrtle-grove` | 8 / 8 / 7 / 6 / 9 | Accurate starter-home page whose main sins are a meta description that contradicts its own commute numbers and a zero-image wall. |
| `/communities/beulah` | 7 / 8 / 7 / 6 / 9 | Expert, schema-rich guide held back by a repeated "Navy Federal world headquarters" error, all-text presentation, and a buried CTA. |
| `/communities/cantonment` | 7 / 8 / 7 / 6 / 9 | Technically excellent page that never mentions Tate High School — the exact keyword its own meta description promises. |
| `/communities/cordova-park` | 6 / 7 / 6 / 5 / 9 | Well-wired page with useful BAH content, undermined by garbled neighborhood geography, three disagreeing price ranges, and no imagery. |
| `/communities/crestview` | 7 / 7 / 7 / 6 / 9 | Tightly targeted BAH-value page needing verified sub-neighborhood facts, its BAH data in the ready-made table styling, and photos. |
| `/communities/destin` | 6 / 8 / 7 / 6 / 9 | Honestly written page whose credibility is undercut by a copy-pasted Hurlburt commute claim in five places (incl. schema) and no images. |
| `/communities/east-hill` | 7 / 7 / 7 / 5 / 9 | Accurate, tracked page that undersells East Hill's whole value — character — with zero photos and a one-clause treatment of old-home VA due diligence. |
| `/communities/east-pensacola-heights` | 5 / 8 / 7 / 6 / 9 | Well-engineered page whose headline claim — 5-10 min to NAS Pensacola — is geographically wrong and contradicts the site's own sibling pages. |
| `/communities/ferry-pass` | 7 / 8 / 8 / 6 / 9 | Data-accurate budget-buyer page whose weak spots are zero imagery, one lonely CTA, duplicated schools copy, and a meta promising an IB feeder it never mentions. |
| `/communities/fort-walton-beach` | 7 / 8 / 7 / 6 / 9 | Schema-rich page whose SEO plumbing outclasses its presentation; fix the Shalimar gate contradiction and the JSON-LD entity bug. |
| `/communities/gulf-breeze` | 7 / 8 / 7 / 6 / 9 | Expert, schema-rich guide undermined by a self-contradicting E-6 price claim, one garbled key sentence, and an image-free wall. |
| `/communities/milton` | 8 / 8 / 7 / 6 / 9 | Insider-grade Whiting content with clean SEO, undercut by a zero-image wall and BAH data buried in prose despite ready-made table styles. |
| `/communities/navarre` | 7 / 8 / 7 / 6 / 9 | Technically sharp page that needs its E-5 BAH affordability contradiction fixed, real imagery, and template CSS debt trimmed. |
| `/communities/navy-point-warrington` | 8 / 8 / 7 / 6 / 9 | Technically excellent, data-consistent page capped by an imageless body, one three-way price-range contradiction, and schema blemishes. |
| `/communities/niceville` | 8 / 9 / 7 / 6 / 9.5 | Excellent SEO/analytics with sharp Eglin content, undercut by an imageless wall, a single buried text-link CTA, and insider gaps (Mid-Bay toll, Deer Moss Creek). |
| `/communities/pace` | 7 / 8 / 8 / 5 / 9 | Technically excellent and analytics-complete, but a text-only body with no comparison table undersells its own best argument. |
| `/communities/perdido-key` | 7 / 9 / 7 / 6 / 9 | Deeply expert, schema-rich page held back by an on-page E-5 BAH contradiction, two local-geography slips, and a 1,700-word text wall. |

**Shared pattern (all 17):** [HIGH] zero body imagery + SPA card slots 404; [MED] BAH-to-price data buried in prose while `.bah-table` CSS ships unused; [MED] BreadcrumbList position 2 points at `/#neighborhoods` fragment instead of `/communities`; [MED] `&amp;`/`&mdash;` entities inside JSON-LD headlines; [LOW] `og:type=website` with `article:*`; [LOW] footer disclaimer sub-AA contrast; [LOW] "Median home price" labeling a range. Universal quick wins: build the SPA community drone-photo set (fixes 404s + supplies heroes); convert BAH prose to `.bah-table`; fix breadcrumb item 2 to `/communities`; replace JSON-LD entities with literal characters; add a portrait at each CTA.

**Community highlights:**

- **`/communities/east-pensacola-heights`** — [CRITICAL] "5-10 min to NAS Pensacola" impossible + contradicts its own Corry figure, baked into H1/meta/FAQ/schema/related-anchor; [HIGH] "Median home price" labels a $190K range; [MED] `RealEstateOrganization` invalid type; [MED] `&mdash;` in JSON-LD headline. Quick wins: verify the real drive time and correct all 9 occurrences; relabel the median; fix the entity type; replace the headline entity.
- **`/communities/destin`** — [HIGH] Hurlburt "10-15 min" copy-pasted from the FWB page, in 5 places incl. schema (realistically ~25-35 min); [HIGH] zero imagery; [MED] fake `<p>&bull;` BAH bullets; [MED] breadcrumb fragment. Quick wins: fix the Hurlburt commute in all 5 spots; convert the bullets to a real list; `og:type=article`; point breadcrumb at `/communities`.
- **`/communities/beulah`** — [HIGH] "Navy Federal Credit Union's world headquarters" (HQ is Vienna, VA; Pensacola is the largest operations campus), repeated in lead, meta, Place schema, and FAQ+schema; [MED] BAH prose vs unused table CSS; [MED] zero imagery. Quick wins: standardize on "Pensacola Operations Campus (Navy Federal's largest)" in all four places; convert BAH to a table; portrait at CTA.
- **`/communities/perdido-key`** — [HIGH] E-5 BAH "$1,644" (without-dependents rate) contradicts the site's $1,863, in visible FAQ + schema; [HIGH] zero imagery; [MED] Old River placed at the "east end" (it is west, at the AL line); [MED] "Villa Sabine" likely a Pensacola Beach community. Quick wins: fix $1,644→$1,863 in FAQ + schema; verify and correct Old River to "west end"; verify Villa Sabine; `og:type=article`.

---

## 6. Prioritized Roadmap

Effort key: **S** ≤2 hrs, **M** a half-day to a day, **L** multi-day. Impact reflects credibility, conversion, or ranking lift.

### Week 1 — Quick Wins (credibility + compliance + one-line fixes)

| # | Action | Effort | Expected impact |
|---|---|---|---|
| 1 | Rewrite the NAR "buyer's agent costs you nothing" line on `/first-time-military-homebuyer` and remove the "#1"/"largest"/"hundreds"/"90%" superlatives across home/`/sell`/`/buy`/`gulf-breeze-vs-navarre` | S | Removes real FREC/NAR regulatory exposure |
| 2 | Fix the illegible `.next-steps` cream box on both comparison pages (`background:#faf7ed` → dark callout) | S | Restores each comparison page's primary conversion block |
| 3 | Correct the two wrong Escambia appraiser addresses (213 → 221 Palafox Place, Suite 300) on both filing pages | S | Stops sending disabled veterans to the wrong door |
| 4 | Delete the "(wait — this is Santa Rosa)" draft artifact + fix "Destin Hight" on `/school-zones` | S | Removes a visible AI-tell on a key page |
| 5 | Fix the Hurlburt MHA rule (Navarre-living member draws FL023) in body, FAQ, and FAQPage JSON-LD on `/bases/hurlburt-field` | S | Corrects the page's own "most expensive mistake" claim |
| 6 | Fix `/communities/east-pensacola-heights` "5-10 min to NAS Pensacola" everywhere (H1/meta/FAQ/schema) after verifying the real time | S | Kills the most obvious geography error |
| 7 | Delete the homepage self-serving review array/aggregateRating; fix the two copy-pasted WebPage `@id`s | S | Removes manual-action risk + entity corruption |
| 8 | Wrap the 9 bare tables (7 on-base commute matrices + `va-loan-guide` BAH-buys) in `.bah-wrap`/`.bah-table` | S | Fixes the most "unfinished" visual element sitewide |
| 9 | Wrap every mid-page phone in `tel:+18502665005`; add findbuyers.com + calendly + 825bayshore branches to the click handler | S | Recovers untappable phone CTAs + dark money conversions |
| 10 | Fix the `bah-to-mortgage-guide` FL064 table (copy from `bah-rates.html`) and the `bases/whiting-field` O-1 BAH + stray `</a>` | S | Removes two self-contradicting BAH errors |

### Month 1 — Systemic content + template fixes

| Action | Effort | Expected impact |
|---|---|---|
| Rewrite all 7 on-base housing sections per base (delete boilerplate wait times, name verified managers, dedupe FAQs, regenerate FAQPage schema, add or drop "break-even") | M | Clears the #1 credibility threat |
| One VA-rule verification pass (Pamphlet 26-7, Blue Water Navy Act, 50 U.S.C. 3953); correct body/FAQ/schema together on all ~10 money pages; recompute the 4 bad dollar examples | M | Fixes YMYL accuracy on highest-intent pages |
| Verify + correct the Florida statute/tax cluster (invented 196.082 benefit, millage direction, SAH/SHA caps, portability window, 83.57 notices, Section 121 suspension, Hometown Heroes framing) | M | Restores tax-authority credibility |
| Roll out the imagery system: `.figure-band`/`.author-card` CSS + `rollout-imagery.mjs`; author-card sitewide; 2 photos on the top 10 guides; fill the 17 SPA community 404s | M | Biggest single lift vs competing agent sites + E-E-A-T |
| Accessibility template pass: `for`/`id` labels, global `:focus-visible`, `--mutedD`→`#8A897E`, dropdown ARIA + click toggle, skip link, mobile tap targets | M | Fixes most WCAG failures across all 60 pages at once |
| Prerender real `/pcs-guide`, `/communities`, `/mortgage-calculators` shells with unique meta/canonical; add to sitemap + LLM files; delete SPA dead code | M | ~295 links gain an indexable target; flagship topics can rank |
| Add mid-page CTA component after each high-intent section; rewrite off-tone CTA copy; give `/pcs-checklist` a printable checklist lead magnet | M | Recovers mid-page conversion sitewide |
| Add `public/_headers`, shrink/de-prioritize logos, lazy-load Pagefind | S | Faster repeat views + mobile LCP |
| Correct the school-zone facts (IB → Pensacola High everywhere incl. schema; Cantonment/Whiting feeder chains; grade year stamps; add Tate section) | S | Fixes rich-result and credibility risk |

### Quarter — Strategic + infrastructure

| Action | Effort | Expected impact |
|---|---|---|
| Build the single canonical data file (BAH/fees/loan limit/caps/tolls/rate) injected at build time + a build-time BAH consistency check that fails on mismatch + a Dec-Jan refresh checklist | L | Ends figure drift permanently; protects the site's core value prop |
| Extract one shared `/assets/site.css`, delete dead/duplicate CSS (incl. the 768-900px `.explore` bug), rebuild `reviews.html` on the Family A template, slim the banner to ~64px | L | Ends generational drift; one style edit instead of 59-file changes |
| Break the complete-graph link pattern: trim mega-nav to ~20, move exhaustive lists to hub pages, add 3-5 contextual body links per page weighted to money pages; fix breadcrumbs | M | Real internal-PageRank differentiation for money pages |
| Centralize the JSON-LD entity graph at build time (one `#agent`/`#person-gregg`, plain `Organization` brokerage, remove Course/HowTo/self-reviews, fix entity double-encoding); validate in Rich Results Test | M | Removes manual-action exposure; coherent entity |
| Build the 5 new content pages (rent-vs-buy + military-rentals; VA appraisal guide; sell-on-PCS-orders; new-construction; quarterly market-update) | L | Captures the renter pipeline 18 months early + completes clusters |
| Fix SPA hydration (`hydrateRoot` + matching prerender, fonts in `index.html`), repair or retire the blog pipeline, `React.lazy` the calculators | M | Better CWV on the money route; unblocks blog publishing |
| Unify the analytics conversion taxonomy across both surfaces (success-gated events, SPA `page_view` + FUB pageview in `go()`, calculator instrumentation, custom dimensions) | M | End-to-end attribution on every conversion, not just buy/sell |
| Migrate `/va-funding-fee-2026` to evergreen `/va-funding-fee` with 301; sweep em-dashes from body prose with a pre-deploy lint | S | Stops annual URL rot; removes the AI tell |

---

*End of audit. The fastest path to a materially better site is the Week 1 list — every item is a short, high-credibility edit, and clearing the criticals is what moves the grade.*
