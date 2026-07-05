# Annual Update Checklist — Perishable Figures

**Purpose.** This site states specific dollar figures, rates, statute numbers, and program
terms that change on a predictable calendar. Search engines and AI answer engines treat this
as a YMYL (Your Money or Your Life) resource, so stale numbers hurt both trust and rankings.
This file is the single place to see **every figure that expires**, its **authoritative
source**, **where it appears in the repo**, and **when to refresh it**.

There is no build-time data injection — each figure is hard-coded in the files listed below.
When a value changes, update it in **every** listed location and re-run the JSON-LD validator
(figures often appear in both visible copy and structured data on the same page).

All values below were verified against primary sources during the **2026-07 audit round**.
Last reviewed: **2026-07-05**.

---

## Update calendar at a glance

| When | What refreshes | Trigger source |
|------|----------------|----------------|
| **Mid-December** | Next-year **BAH** rates (all pay grades, FL064 + FL023) | DoD BAH tables publish for the coming year |
| **Late November** | **VA / conforming loan limit** baseline | FHFA announces next-year conforming limit |
| **October 1 (fiscal year)** | **SAH / SHA** adaptive-housing grant maximums | VA fiscal-year adjustment |
| **January 1** | **VA funding fee** table (only if VA revises it) | VA.gov funding fee page |
| **January** | **Florida legislative/insurance** items (Citizens cap, statute changes) | New FL statutes / OIR rate orders effective Jan 1 |
| **As sold** | **Review count / testimonials** | Closings + new Google/Zillow reviews |
| **Anytime terms change** | **Hometown Heroes** program terms / funding status | FL Housing Finance Corp |

---

## Figures, sources, and locations

### 1. BAH (Basic Allowance for Housing) — HIGHEST churn
- **Current basis:** 2026 rates. `FL064` = Pensacola MHA, `FL023` = Fort Walton Beach MHA.
- **Authoritative source:** DoD BAH calculator — https://www.travel.dod.mil/Allowances/Basic-Allowance-for-Housing/BAH-Rate-Lookup/ (rates publish mid-December for the following calendar year).
- **Canonical copy in repo:** `src/App.jsx` → the `BAH_DATA` object (format `[grade, withDeps, withoutDeps]`). This is the source of truth for the SPA calculators and grids.
- **Also hard-coded in:**
  - `src/App.jsx` — PCS affordability table + PCS FAQ answers (E-5/E-6/O-1 example figures)
  - `public/bah-rates.html` — headline ranges and tables
  - `public/faq.html` — E-6 example figure
  - `public/bases/*.html` — per-base BAH callouts (Hurlburt uses FL023 by duty station, not Pensacola MHA)
  - `public/communities/perdido-key.html` and other community pages — E-5 range examples
  - `public/bah-to-mortgage-guide.html`
- **Gotcha:** Hurlburt Field members draw the **higher** FL023 (Fort Walton) rate by duty station. Do not "correct" Hurlburt to the Pensacola MHA.

### 2. VA funding fee
- **Current basis:** 2026. First use, 0% down = **2.15%**; subsequent use = **3.30%**; exempt with 10%+ VA disability or Purple Heart. Guard/Reserve funding fees are **equalized** with active duty (Blue Water Navy Act of 2019 — *not* the PACT Act).
- **Source:** https://www.va.gov/housing-assistance/home-loans/funding-fee-and-closing-costs/
- **Locations:** `public/va-funding-fee-2026.html`, `public/va-coe-guide.html`, `public/first-time-military-homebuyer.html`, `public/disabled-veteran-benefits-florida.html` (the $13,437 example is labeled 2.15% first-use), and the funding-fee logic in `src/App.jsx` calculators.

### 3. VA loan limit / conforming baseline
- **Current basis:** 2026 baseline **$832,750**. With **full entitlement** there is **no VA loan limit and no 25% down** above any figure — the baseline binds only borrowers with **reduced/partial** entitlement (Blue Water Navy Act removed limits for full-entitlement borrowers effective 2020-01-01).
- **Source:** FHFA conforming loan limits — https://www.fhfa.gov/ (announced late November for the next year).
- **Locations:** `public/va-coe-guide.html`, `public/first-time-military-homebuyer.html`.
- **Gotcha:** never write the literal phrase with the old "25% down above the county limit" rule as applying to full entitlement — it does not. (This previously broke FAQPage JSON when quoted; keep it out of schema strings.)

### 4. SAH / SHA adaptive-housing grants
- **Current basis:** FY2026 **SAH $126,526**, **SHA $25,350**.
- **Source:** https://www.va.gov/housing-assistance/disability-housing-grants/ (adjusts each federal fiscal year, Oct 1).
- **Locations:** `public/disabled-veteran-benefits-florida.html`.

### 5. Florida homestead / Save Our Homes
- **Current basis:** $50,000 homestead exemption; **Save Our Homes 3% assessment cap**; **portability window 3 years** (Amendment 5, 2021 — was 2 years).
- **Source:** FL Dept. of Revenue / county property appraisers; F.S. 193.155, Art. VII FL Constitution.
- **Locations:** `public/florida-homestead-exemption-military.html`.

### 6. Florida veteran property-tax benefits
- **Current basis:** $5,000 disabled-veteran exemption (F.S. 196.24) ≈ **$85–110/yr** in real tax savings; full exemption for 100% permanent & total; combat-related disability discount; deployment exemption.
- **Source:** F.S. 196.24, 196.081, 196.082; county appraisers.
- **Locations:** `public/va-disability-property-tax-florida.html`, `public/disabled-veteran-benefits-florida.html`.

### 7. Florida home insurance / Citizens
- **Current basis:** Citizens rate glide path — **15% cap for 2026**; hurricane-deductible trigger per **F.S. 627.4025**; SB 76 reforms.
- **Source:** FL Office of Insurance Regulation; Citizens Property Insurance; F.S. 627.4025 / 627.351.
- **Locations:** `public/florida-home-insurance-military.html`.

### 8. Rental / capital-gains (military)
- **Current basis:** F.S. **83.57** month-to-month termination = **30 days'** written notice (post-HB 1417); IRC **Section 121** $250k/$500k exclusion with the **10-year military suspension** of the 2-of-5-year use test (SCRA-qualifying).
- **Source:** F.S. 83.57; IRS Pub 523 / IRC §121(d)(9).
- **Locations:** `public/military-rental-property-management.html`.

### 9. SCRA foreclosure protection
- **Current basis:** **1 year (12 months)** post-service foreclosure protection under **50 U.S.C. §3953**.
- **Locations:** `public/faq.html` and any SCRA references.

### 10. Hometown Heroes (FL first-time buyer)
- **Current basis:** described as a **deferred, 0% second mortgage** (not a "free"/forgiven grant). Terms, caps, and funding availability change per program year.
- **Source:** https://www.floridahousing.org/programs/homebuyer-overview-page/hometown-heroes
- **Locations:** `public/zero-down-home-loans.html`.

### 11. Review count / testimonials
- **Current basis:** ~42 five-star reviews (visible copy only). **Self-serving `aggregateRating`/`Review` JSON-LD was removed** from `index.html` and `public/reviews.html` in the 2026-07 round (ineligible for rich results + manual-action risk). Do **not** re-add review structured data to the site's own entity — display reviews as visible content only.
- **Helper:** `scripts/bump-review-count.mjs` updates visible counts.

---

## December refresh — step by step

1. **BAH (do first, highest impact).** Pull FL064 and FL023 tables from the DoD BAH lookup for the new year. Update `BAH_DATA` in `src/App.jsx`, then sweep every location in §1 above. Re-check the Hurlburt = FL023 rule.
2. **Loan limit.** Update the $832,750 baseline in §3 files to the new FHFA figure. Confirm the "full entitlement = no limit" framing is intact.
3. **Funding fee.** Only if VA revised the table (usually stable). Update §2 files + calculator logic together.
4. **SAH/SHA.** Update §4 to the new fiscal-year maximums.
5. **Florida items.** Check the Citizens cap for the new year, any new statute numbers, and homestead figures (§5–§8).
6. **Dates.** Run `npm run build` (its `prebuild` runs `scripts/bump-dates.mjs`) so `dateModified` / "Last updated" stamps advance. Update `public/llms.txt` "Last updated" line.
7. **Validate.** Re-run a JSON-LD validation pass over all pages (every `application/ld+json` block must `JSON.parse`) — figures live in both visible copy and schema, and a mismatch is both an SEO and a trust problem.
8. **Sitemap/llms.** If pages were added or removed, update `public/sitemap.xml` and `public/llms.txt`.

---

*Keep this file in sync with reality. If you change a figure and it is not listed here, add its
location so next year's update is complete.*
