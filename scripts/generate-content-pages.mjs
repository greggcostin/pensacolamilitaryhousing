// Generates the 6 new content-gap pages uncovered by the SEO audit.
// Writes directly to public/ using the shared content-page-template.

import { writeFileSync } from "node:fs";
import { renderPage } from "./content-page-template.mjs";

const PAGES = [
  // ─────────────────────────────────────────────────────────────────
  // 1. VA IRRRL Guide (Interest Rate Reduction Refinance Loan)
  // ─────────────────────────────────────────────────────────────────
  {
    slug: "va-irrrl-guide",
    title: "VA IRRRL Guide 2026 | Streamline Refi for Pensacola Veterans | Gregg Costin",
    description: "VA IRRRL walkthrough for Florida Panhandle veterans: eligibility, break-even math, 0.5% rule, no appraisal, no income re-verification, closing in 10-14 days.",
    keywords: "VA IRRRL, VA streamline refinance, VA IRRRL Pensacola, VA refi 2026, IRRRL no appraisal, VA streamline rate reduction, VA refinance Florida Panhandle, Gregg Costin VA refi",
    h1: "VA IRRRL — The Streamline Refi That Most Veterans Leave on the Table",
    breadcrumbName: "VA IRRRL Guide",
    areaServed: "Pensacola",
    knowsAbout: ["VA IRRRL", "VA Streamline Refinance", "VA Pamphlet 26-7", "Interest Rate Reduction Refinance Loan", "VA Funding Fee", "Pensacola VA Refinance", "Florida Panhandle VA Refinance"],
    lead: "If you took out a VA loan in 2022-2024 at 6.5%-7.5% and rates have dropped, the IRRRL is how you take the new rate without re-qualifying. No appraisal, no income verification, no termites — just a lower payment in 10-14 days.",
    faqs: [
      { q: "What is a VA IRRRL?", a: "The VA Interest Rate Reduction Refinance Loan (IRRRL, pronounced \"Earl\") is a streamline refinance available only to existing VA loan holders. It refinances one VA loan into another at a lower rate or from ARM to fixed. No appraisal, no income re-verification, no credit re-pull in most cases. It exists so veterans can capture rate drops without re-running the full VA loan gauntlet." },
      { q: "Who qualifies for a VA IRRRL?", a: "Anyone currently holding a VA loan on a property they either still own as a primary residence or once occupied as a primary residence. You do not have to still live there. You must be current on payments, have no more than one 30-day late in the past 12 months, and meet the \"net tangible benefit\" test — typically a 0.5% rate reduction or moving from ARM to fixed." },
      { q: "Do I need a new appraisal for an IRRRL?", a: "Almost never. The VA waives the appraisal requirement for IRRRLs because you are refinancing a loan they already guaranteed. Some lenders will pull an AVM (automated valuation) for their own risk management, but you do not pay for it and the loan does not hinge on the value." },
      { q: "How much does an IRRRL cost out of pocket?", a: "Usually zero. All fees — the 0.5% IRRRL funding fee (waived if you are 10%+ service-connected disabled), lender fees, title updates, escrow setup — are rolled into the new loan balance or absorbed via a slightly higher rate. The trade-off is a small increase in loan balance or a slightly higher rate than a no-cost refi; your lender should show you both scenarios." },
      { q: "How long does a VA IRRRL take to close?", a: "10-14 days with a lender who has done IRRRLs before. I have closed them in 8 days in the Pensacola market. The delay is usually title or payoff letter from the existing servicer — not the VA side." },
      { q: "When does an IRRRL NOT make sense?", a: "When your rate drop is under 0.5% (you will not break even), when you plan to sell within 18 months (the small closing cost wash will not pay back), or when you want to pull cash out (use a cash-out refinance instead, which requires full appraisal and income docs)." },
      { q: "Can I use an IRRRL on a rental property?", a: "Yes, as long as you previously occupied the property as your primary residence. This is one of the most underused features of the VA loan. If you PCS'd from a Pensacola house you bought with a VA loan, you can IRRRL it into a lower rate even though you are now renting it out — the original occupancy certification carries forward." },
    ],
    body: `
<p>I will not lie — when rates dropped from 7% to 5.5% in the 2019 window, I had three military clients who could have saved <strong>$400-700 a month</strong> on their Pensacola homes with a 10-day IRRRL. None of them did. Their lender did not call them. Their Realtor (not me, at the time) did not call them. They found out on Reddit 18 months later and had missed the window. This page is so that never happens to you.</p>

<h2>What an IRRRL Actually Is</h2>
<p>The Interest Rate Reduction Refinance Loan — IRRRL, rhymes with "girl" — is a VA-guaranteed streamline refinance. It only refinances one VA loan into another VA loan. You cannot use it to refinance a conventional loan into a VA loan (use a regular VA refi for that), and you cannot pull cash out with it (use a VA cash-out refi for that).</p>
<p>What makes it a <strong>streamline</strong> is what the VA skips:</p>
<ul>
<li><strong>No new appraisal.</strong> The VA already has a valuation on file from your original loan.</li>
<li><strong>No income re-verification.</strong> You do not have to provide current LES, tax returns, or pay stubs.</li>
<li><strong>No credit re-qualification in most cases.</strong> Some lenders will pull a soft credit check; others skip it entirely.</li>
<li><strong>No termite inspection, no well/septic test, no VA Notice of Value.</strong></li>
</ul>
<p>What you do need: a current VA loan you are paying on time, proof that you either still own the home or once lived there as your primary residence, and a new rate that passes the net-tangible-benefit test.</p>

<h2>The 0.5% Rule (and When to Break It)</h2>
<p>The VA requires that every IRRRL produce a "net tangible benefit" — essentially, that you come out ahead. In practice that means:</p>
<ul>
<li><strong>Fixed-to-fixed:</strong> new rate must be at least 0.5% below the old rate.</li>
<li><strong>ARM-to-fixed:</strong> any rate improvement qualifies, because you are reducing risk.</li>
<li><strong>Lowering the term</strong> (30-year to 15-year) also counts as a benefit even if the rate does not drop.</li>
</ul>
<p>The 0.5% rule is the floor, not the ceiling. Here is how to think about whether an IRRRL makes sense even when the rate drop is technically close to 0.5%:</p>
<p><strong>Break-even math you can do on a napkin:</strong> Take the closing costs rolled into the new loan — typically $2,500-$4,500 in the Pensacola market — and divide by the monthly savings. That is your break-even in months. If you plan to own the home longer than the break-even, IRRRL. If shorter, do not.</p>
<p><strong>Example:</strong> $350,000 VA loan at 6.75% → IRRRL to 6.15%. Monthly savings: $143. Rolled closing costs: $3,400. Break-even: 24 months. If you plan to live there (or hold it as a rental) for more than 2 years, the IRRRL pays off. For 99% of military families with PCS cycles of 3-4 years, this is a no-brainer.</p>

<h2>The One-Time IRRRL Funding Fee</h2>
<p>The IRRRL has its own funding fee — <strong>0.5%</strong> of the new loan amount — and it is one of the lowest in the VA system. For comparison:</p>
<table>
<thead><tr><th>Loan Type</th><th>Funding Fee (First Use)</th><th>Funding Fee (Subsequent Use)</th></tr></thead>
<tbody>
<tr><td>VA Purchase (regular)</td><td>2.15%</td><td>3.30%</td></tr>
<tr><td>VA Cash-Out Refi</td><td>2.15%</td><td>3.30%</td></tr>
<tr><td>VA IRRRL</td><td>0.50%</td><td>0.50%</td></tr>
</tbody>
</table>
<p>On a $350,000 IRRRL that is $1,750 in funding fee — usually rolled into the loan balance, not paid out of pocket. If you are 10% or more service-connected disabled, <strong>the funding fee is waived entirely</strong>. Surviving spouses receiving DIC are also exempt. For a full breakdown see the <a href="/va-funding-fee-2026.html">2026 VA Funding Fee guide</a>.</p>

<h2>The IRRRL Timeline (What Actually Happens)</h2>
<ol>
<li><strong>Day 0 — Call a VA-experienced lender.</strong> Not your original lender necessarily. Get a rate quote with all costs rolled in and with costs paid separately. Compare to one other lender. Rate shopping on the same day does not hurt your credit (it counts as one inquiry under FICO rules).</li>
<li><strong>Day 1 — Sign the initial application.</strong> Lender orders the payoff from your current servicer, pulls a soft credit check, generates the Loan Estimate. You lock the rate.</li>
<li><strong>Days 2-7 — Lender underwrites.</strong> Title search runs, payoff letter arrives, loan docs are prepared. You sign nothing during this window unless they ask.</li>
<li><strong>Days 8-12 — Close.</strong> Mobile notary comes to your kitchen table (or you go to the title company), you sign the new note, the title company pays off the old VA loan and records the new one. You skip three days of right-to-rescind (IRRRLs trigger a 3-day cooling-off period on primary residences).</li>
<li><strong>Day 12-14 — New payment starts.</strong> Typically you skip one month (the one your old loan would have billed for), which is not free money — the interest on that month is built into the new balance — but it does give you a cash flow cushion.</li>
</ol>

<h2>Common Mistakes That Cost Money</h2>
<h3>Letting your lender default to a "no-cost" rate</h3>
<p>"No cost" means the closing costs are absorbed by a rate bump — typically 0.125%-0.25% higher than the par rate. Over a 30-year mortgage on $350,000 that is $13,000-$27,000 in extra interest. If you plan to keep the loan more than 3 years, pay the closing costs (roll them in) and take the lower rate. Run the numbers both ways and make the lender show you.</p>
<h3>Missing the rental-property opportunity</h3>
<p>If you PCS'd from a Pensacola home you bought VA and now rent it out, you can still IRRRL — as long as you once occupied it as your primary residence. Most veterans do not realize this and leave 0.5-1.0% of rate on the table for years.</p>
<h3>Rolling too much in</h3>
<p>The VA allows you to roll closing costs into the balance, but some lenders will also let you roll in <strong>a couple months of skipped payments and prepaid escrow</strong>. That can add $5,000-$8,000 to your balance for what feels like "no money out of pocket." It is not free — it is financed at your new rate over 30 years. Know what you are rolling in.</p>
<h3>Not comparing IRRRL vs loan assumption vs cash-out</h3>
<p>If you have significant equity and need cash (renovation, debt consolidation), a VA cash-out refi or even selling via an <a href="/assumable-va-loans-pensacola.html">assumable VA loan</a> may serve you better. The IRRRL is the right tool for rate-reduction only.</p>

<h2>IRRRL vs VA Cash-Out vs Assumption — Quick Decision Table</h2>
<table>
<thead><tr><th>Your Goal</th><th>Best Tool</th><th>Why</th></tr></thead>
<tbody>
<tr><td>Lower my rate, no cash out</td><td>IRRRL</td><td>Fastest, cheapest, no appraisal</td></tr>
<tr><td>Pull equity for renovation or debt</td><td>VA Cash-Out Refi</td><td>Appraisal required, higher funding fee, but gets you cash</td></tr>
<tr><td>Sell without losing my 2.75% rate</td><td>Let buyer <a href="/assumable-va-loans-pensacola.html">assume</a> my VA loan</td><td>Buyer inherits the rate; you substitute entitlement</td></tr>
<tr><td>Switch ARM to fixed</td><td>IRRRL</td><td>Any rate improvement counts as a tangible benefit</td></tr>
<tr><td>Refinance a rental I used to live in</td><td>IRRRL</td><td>Prior occupancy qualifies; you do not need to live there now</td></tr>
</tbody>
</table>

<h2>Panhandle-Specific Notes</h2>
<p>A few things that come up only in the Pensacola/Okaloosa/Santa Rosa market:</p>
<ul>
<li><strong>Hurricane timing.</strong> If you are IRRRL'ing during June-November and a named storm enters the Gulf, many lenders freeze closings until the storm passes. Schedule outside that window if you can.</li>
<li><strong>Flood zone changes.</strong> If FEMA redrew your flood zone after your original purchase (happens often along Escambia Bay and Santa Rosa Sound), your flood insurance requirement may have changed. The IRRRL underwriting will verify this and may require new flood insurance even though you otherwise skip appraisal.</li>
<li><strong>Mobile notaries are standard.</strong> Almost every Pensacola title company offers mobile close — you do not have to go downtown. Useful if you are deployed or on TDY when the close falls.</li>
</ul>

<h2>When You Should Ignore the IRRRL Entirely</h2>
<ul>
<li>Rate drop is under 0.5% and you plan to move within 2 years.</li>
<li>You are planning to sell and your current rate is below market — the <a href="/assumable-va-loans-pensacola.html">assumable VA loan</a> angle is worth more to you as a seller than the IRRRL is to you as a holder.</li>
<li>You are 12+ months behind on payments — the VA will deny the net-tangible-benefit case. Fix the underlying issue first.</li>
<li>You want to remove a co-borrower (ex-spouse, divorced partner) — IRRRL does not allow removing a borrower in most cases. You need a full VA refi.</li>
</ul>

<h2>Sources and References</h2>
<ul>
<li>VA Pamphlet 26-7, Chapter 6: Refinancing Loans — <a href="https://www.benefits.va.gov/WARMS/pam26_7.asp" target="_blank" rel="noopener">benefits.va.gov</a></li>
<li>VA IRRRL borrower fact sheet — <a href="https://www.va.gov/housing-assistance/home-loans/loan-types/interest-rate-reduction-loan/" target="_blank" rel="noopener">va.gov</a></li>
<li>2026 VA Funding Fee schedule (my breakdown) — <a href="/va-funding-fee-2026.html">VA Funding Fee 2026</a></li>
</ul>
`,
  },

  // ─────────────────────────────────────────────────────────────────
  // 2. VA Funding Fee 2026 Breakdown
  // ─────────────────────────────────────────────────────────────────
  {
    slug: "va-funding-fee-2026",
    title: "VA Funding Fee 2026 | Tier Tables + Disability Waiver | Gregg Costin",
    description: "2026 VA funding fee tables by loan type, down payment tier, regular vs reserve, subsequent use. Disability exemption walkthrough. FL Panhandle examples.",
    keywords: "VA funding fee 2026, VA funding fee Pensacola, VA funding fee waiver, VA funding fee disabled veteran, VA funding fee table 2026, VA loan tier 1 Escambia Santa Rosa Okaloosa",
    h1: "VA Funding Fee 2026 — Tables, Waivers, and the Numbers That Actually Hit Your Closing",
    breadcrumbName: "VA Funding Fee 2026",
    areaServed: "Pensacola",
    knowsAbout: ["VA Funding Fee", "VA Funding Fee 2026", "VA Funding Fee Waiver", "Disabled Veteran VA Loan", "VA Pamphlet 26-7", "Tier 1 Loan Limit 2026", "Pensacola VA Loan"],
    lead: "The VA funding fee is the single biggest line item most buyers miss when they first run their numbers. Here is every 2026 tier, every waiver, and the math for the three Panhandle counties I work in.",
    faqs: [
      { q: "What is the VA funding fee?", a: "A one-time fee charged by the VA on every VA loan (purchase, cash-out refi, IRRRL) to keep the program self-funding. It is not insurance, not PMI, and does not recur. It is typically rolled into the loan balance and financed over the life of the loan." },
      { q: "What is the 2026 VA funding fee for a first-time buyer?", a: "2.15% of the loan amount for regular military with less than 5% down payment. 1.50% with 5-10% down. 1.25% with 10%+ down. National Guard and Reserve pay the same 2026 rates as regular military beginning October 1, 2022 — the old 2.40%/1.75%/1.50% tier for reservists was eliminated by the Honoring Our PACT Act." },
      { q: "What is the funding fee on subsequent use?", a: "3.30% of the loan amount for regular military, Guard, and Reserve with less than 5% down. 1.50% with 5-10% down. 1.25% with 10%+ down. The subsequent-use fee only kicks in after you have fully paid off or restored entitlement on a prior VA loan and are using VA benefits again." },
      { q: "Am I exempt from the VA funding fee?", a: "Yes if you are (1) service-connected disabled at 10% or higher, (2) receive VA compensation for a service-connected disability, (3) would receive VA compensation except for retirement pay, (4) are a surviving spouse receiving Dependency and Indemnity Compensation (DIC), or (5) are the surviving spouse of a veteran who died in service or from a service-connected disability. Active-duty Purple Heart recipients are also exempt." },
      { q: "Can I get the funding fee refunded after I get my disability rating?", a: "Yes. If you paid a funding fee at closing and later receive an effective disability rating that would have made you exempt (retroactive to a date on or before closing), you can file for a refund through your VA loan servicer. Typical refund: $5,000-$12,000 on a first-time purchase. The paperwork is unglamorous but the money is real." },
      { q: "Is the funding fee tax-deductible?", a: "Generally yes, the VA funding fee is treated as mortgage insurance premium and is deductible in the year paid if you itemize. Rules change each tax year — confirm with a tax professional." },
      { q: "What is the 2026 Tier 1 loan limit for Escambia, Santa Rosa, and Okaloosa Counties?", a: "$832,750. This is the conforming loan limit that defines the 'zero down' ceiling. You can still go above this with a VA loan, but you will need a down payment of 25% of the difference between the purchase price and the county limit on the portion above $832,750." },
    ],
    body: `
<p>The VA funding fee is the single line item I see buyers forget to budget for — and it is the biggest one after the down payment. On a $400,000 zero-down VA purchase as a first-time buyer, the funding fee is <strong>$8,600</strong>. That is not a rounding error. This page gives you every 2026 rate, the waivers that can zero it out, and the math for real Pensacola-area loans.</p>

<h2>2026 VA Funding Fee Tables</h2>

<h3>Purchase Loan — First-Time Use</h3>
<table>
<thead><tr><th>Down Payment</th><th>Regular Military</th><th>National Guard / Reserve</th></tr></thead>
<tbody>
<tr><td>Less than 5%</td><td>2.15%</td><td>2.15%</td></tr>
<tr><td>5% to 9.99%</td><td>1.50%</td><td>1.50%</td></tr>
<tr><td>10% or more</td><td>1.25%</td><td>1.25%</td></tr>
</tbody>
</table>

<h3>Purchase Loan — Subsequent Use</h3>
<table>
<thead><tr><th>Down Payment</th><th>Regular Military</th><th>National Guard / Reserve</th></tr></thead>
<tbody>
<tr><td>Less than 5%</td><td>3.30%</td><td>3.30%</td></tr>
<tr><td>5% to 9.99%</td><td>1.50%</td><td>1.50%</td></tr>
<tr><td>10% or more</td><td>1.25%</td><td>1.25%</td></tr>
</tbody>
</table>

<h3>VA IRRRL and VA Cash-Out Refinance</h3>
<table>
<thead><tr><th>Loan Type</th><th>Funding Fee</th></tr></thead>
<tbody>
<tr><td>VA IRRRL (streamline)</td><td>0.50%</td></tr>
<tr><td>VA Cash-Out Refi — First Use</td><td>2.15%</td></tr>
<tr><td>VA Cash-Out Refi — Subsequent Use</td><td>3.30%</td></tr>
</tbody>
</table>

<p><em>Source: Department of Veterans Affairs, 2026 funding fee schedule. Reservist rates merged with active-duty rates effective April 7, 2023, and have not been adjusted since.</em></p>

<h2>Who Pays Zero — the Full Exemption List</h2>
<p>The funding fee is waived entirely if you fall into any of these categories:</p>
<ul>
<li><strong>10%+ service-connected disability rating</strong> — the most common exemption. Even if you are receiving concurrent retirement pay, if your rating is 10% or higher you pay zero.</li>
<li><strong>Currently receiving VA compensation</strong> for a service-connected disability.</li>
<li><strong>Would receive compensation except for receipt of retirement or active-duty pay</strong> — this covers the CRDP/CRSC recipients.</li>
<li><strong>Surviving spouse receiving DIC</strong> (Dependency and Indemnity Compensation) — not just any surviving spouse; must be DIC-receiving.</li>
<li><strong>Surviving spouse of a veteran who died in service or from service-connected causes</strong>, not receiving DIC but entitled.</li>
<li><strong>Active-duty service member with a Purple Heart</strong> — this was added by the Blue Water Navy Vietnam Veterans Act in 2020. You must be on active duty at closing and have received the Purple Heart.</li>
<li><strong>Pre-discharge Claim</strong> — if you have a pending VA claim and a medical examination memorandum or preliminary rating memorandum shows you will be rated 10%+, the VA may accept that as a basis for exemption at closing.</li>
</ul>

<h2>Pensacola-Area Dollar Examples</h2>
<p>Numbers using real Panhandle price points, first-time buyers, zero down (the default for most junior enlisted and mid-career):</p>
<table>
<thead><tr><th>Scenario</th><th>Price</th><th>Loan Amount</th><th>Funding Fee</th><th>After Disability Waiver</th></tr></thead>
<tbody>
<tr><td>E-5 first home, Milton</td><td>$265,000</td><td>$265,000</td><td>$5,697</td><td>$0</td></tr>
<tr><td>E-7 NAS Pensacola, Gulf Breeze</td><td>$425,000</td><td>$425,000</td><td>$9,137</td><td>$0</td></tr>
<tr><td>O-3 Eglin, Niceville</td><td>$525,000</td><td>$525,000</td><td>$11,287</td><td>$0</td></tr>
<tr><td>O-5 Hurlburt, Destin</td><td>$700,000</td><td>$700,000</td><td>$15,050</td><td>$0</td></tr>
<tr><td>Retired USAF Captain, 30% disability, $600K home</td><td>$600,000</td><td>$600,000</td><td>Would be $12,900</td><td>$0</td></tr>
</tbody>
</table>

<h2>Tier 1 Loan Limits — 2026</h2>
<p>The "Tier 1" loan limit is the conforming loan limit set by the FHFA each year. It defines how much you can borrow with <strong>zero down</strong> using full VA entitlement. Above the Tier 1 limit you can still use VA, but you will need a 25% down payment on the portion above the limit.</p>
<table>
<thead><tr><th>County (Panhandle)</th><th>2026 Tier 1 Limit</th><th>What This Means</th></tr></thead>
<tbody>
<tr><td>Escambia</td><td>$832,750</td><td>Zero down up to $832,750</td></tr>
<tr><td>Santa Rosa</td><td>$832,750</td><td>Zero down up to $832,750</td></tr>
<tr><td>Okaloosa</td><td>$832,750</td><td>Zero down up to $832,750</td></tr>
<tr><td>Walton</td><td>$832,750</td><td>Zero down up to $832,750</td></tr>
</tbody>
</table>
<p><strong>Above $832,750:</strong> Say you want a $900,000 home in Destin with zero other VA loans outstanding. The VA will guarantee 25% of the Tier 1 limit ($208,187.50 of guaranty). Your lender will require the 25% gap on the amount above $832,750 — so $900,000 - $832,750 = $67,250 over, and you need 25% of that = <strong>$16,812.50 down</strong> plus closing costs. Rare to hit this in the Pensacola MHA, common in Destin/30A.</p>

<h2>Rolling the Funding Fee Into the Loan</h2>
<p>Almost nobody pays the funding fee out of pocket. Standard practice: <strong>roll it into the loan balance</strong>. On a $400,000 purchase with a 2.15% funding fee ($8,600), your actual loan balance at closing becomes $408,600. You pay interest on the $8,600 over 30 years — about $8,000 in extra interest at 6% over the life of the loan, assuming you keep it that long.</p>
<p>Most military families PCS within 3-5 years. Rolling the funding fee in typically costs $800-$1,500 in extra interest over a 4-year hold — cheaper than the opportunity cost of $8,600 sitting in your closing account.</p>

<h2>Refunds for Retroactive Disability Ratings</h2>
<p>Here is the thing most brokerages do not tell you: if you pay the funding fee at closing and <strong>later</strong> receive a disability rating effective on or before your closing date, you can get a <strong>refund of the entire funding fee</strong>.</p>
<ol>
<li>File your VA disability claim (if not already filed).</li>
<li>Receive your rating decision letter with an effective date.</li>
<li>If the effective date is on or before your VA loan closing date, contact your loan servicer (whoever holds the loan today) and request a funding fee refund application.</li>
<li>Submit the application with your rating letter. The servicer forwards it to the VA.</li>
<li>VA processes refund to your loan servicer, who credits it to your loan balance or sends a check depending on the servicer's policy.</li>
</ol>
<p>Refunds in the Pensacola market typically land between $5,000 and $12,000. I have seen an O-4 client receive $14,400 back 18 months after closing.</p>

<h2>Common Funding Fee Mistakes</h2>
<h3>Assuming "VA = no costs"</h3>
<p>Zero down does not mean zero closing costs. You still pay title, escrow, taxes, insurance prepay, and the funding fee. Budget 3-5% of purchase price in cash or seller concessions. VA caps seller concessions at 4% of contract price — use them aggressively.</p>
<h3>Not checking if you qualify for the 5%+ down rate</h3>
<p>If you have $20,000 saved, using $15,000 as a 5% down payment on a $300,000 home drops your funding fee from 2.15% ($6,450) to 1.50% ($4,275). You save $2,175 on fee + reduce your loan balance by $15,000 + cut your principal+interest payment by ~$90/month. Often worth it.</p>
<h3>Missing the reservist exemption change</h3>
<p>If you were told the funding fee was 2.40% for Reserve/Guard, that rate is out of date (it was eliminated in 2022). Every Reserve/Guard buyer in 2026 pays the same rate as active-duty.</p>
<h3>Pre-discharge claims not filed in time</h3>
<p>If you are separating and expect a disability rating, file your disability claim through BDD (Benefits Delivery at Discharge) <strong>180-90 days before separation</strong>. If your rating comes through before closing, you avoid the funding fee entirely. If it arrives after closing, you file for a refund.</p>

<h2>Related Pages</h2>
<ul>
<li><a href="/va-loan-guide">VA Loan Guide</a> — the full walkthrough</li>
<li><a href="/va-irrrl-guide.html">VA IRRRL Guide</a> — streamline refi details</li>
<li><a href="/disabled-veteran-benefits-florida.html">Disabled Veteran Benefits (Florida)</a> — stacking federal + FL exemptions</li>
<li><a href="/assumable-va-loans-pensacola.html">Assumable VA Loans</a> — taking over a lower rate</li>
<li><a href="/bah-rates.html">2026 BAH Rates</a> — sizing your budget</li>
</ul>

<h2>Sources</h2>
<ul>
<li>VA Pamphlet 26-7, Chapter 8: Borrower Fees and Charges — <a href="https://www.benefits.va.gov/WARMS/pam26_7.asp" target="_blank" rel="noopener">benefits.va.gov</a></li>
<li>VA Funding Fee page — <a href="https://www.va.gov/housing-assistance/home-loans/funding-fee-and-closing-costs/" target="_blank" rel="noopener">va.gov</a></li>
<li>FHFA 2026 Conforming Loan Limits — <a href="https://www.fhfa.gov/DataTools/Tools/Pages/Conforming-Loan-Limit-(CLL)-Values.aspx" target="_blank" rel="noopener">fhfa.gov</a></li>
</ul>
`,
  },

  // ─────────────────────────────────────────────────────────────────
  // 3. Disabled Veteran VA Benefits (Florida Panhandle)
  // ─────────────────────────────────────────────────────────────────
  {
    slug: "disabled-veteran-benefits-florida",
    title: "Disabled Veteran Benefits Florida | VA Loan + Property Tax Stack | Gregg Costin",
    description: "How disabled veterans in Pensacola, Gulf Breeze, Niceville, and the Florida Panhandle stack federal VA + FL state benefits: funding fee waiver, $5K and total property tax exemption, homestead, surviving spouse rules.",
    keywords: "disabled veteran Florida, VA disability Pensacola, 100% P&T Florida property tax, disabled veteran VA loan, veteran homestead Florida, Florida veteran benefits stack, Gregg Costin disabled veteran realtor",
    h1: "Disabled Veteran Benefits in Florida — How to Stack Federal + State Savings",
    breadcrumbName: "Disabled Veteran Benefits (FL)",
    areaServed: "Pensacola",
    knowsAbout: ["Disabled Veteran Benefits", "VA Funding Fee Waiver", "Florida Disabled Veteran Property Tax", "100% P&T Property Tax Exemption", "Combat-Related Special Compensation", "Surviving Spouse Benefits", "Florida Homestead Exemption"],
    lead: "If you are 10% or more service-connected in Florida, the savings stack in ways most lenders and agents will not explain. This is the full picture: VA side, Florida state side, and how they compound on a Pensacola-area purchase.",
    faqs: [
      { q: "What is the VA funding fee waiver for disabled veterans?", a: "Any service-connected disability rating of 10% or higher waives the entire VA funding fee on every VA loan you ever take. Not reduced — waived. On a $400,000 zero-down first-time VA purchase, this is $8,600 back in your pocket at closing, rolled or otherwise." },
      { q: "What is the Florida $5,000 disabled veteran property tax exemption?", a: "Florida Statute 196.24 provides a $5,000 reduction in the taxable assessed value of your homestead property if you are a 10%+ service-connected disabled veteran. You must have been an Alabama or Florida resident at the time of entering service OR a Florida resident for at least 1 year prior to filing. File with your county Property Appraiser by March 1 each year with VA Form 20-5455 or equivalent." },
      { q: "What is the 100% P&T total property tax exemption in Florida?", a: "Florida Statute 196.081 provides complete property tax exemption on your homestead for veterans rated 100% Permanent and Total (P&T) due to service-connected disability. Zero Florida property tax. This also applies to surviving spouses in most cases — the exemption can transfer to the surviving spouse if certain conditions are met." },
      { q: "Do I have to file separately for the VA exemption and homestead exemption?", a: "Yes. The $50,000 (approximate) Florida homestead exemption is separate from the disabled veteran $5,000 or total exemption. You file both with the county Property Appraiser, usually in one appointment. Homestead is filed once per property; the veteran exemption is filed annually in most Panhandle counties." },
      { q: "Can a disabled veteran use a VA loan on a second home?", a: "No. The VA loan requires primary-residence occupancy within 60 days of closing and for at least 12 months after closing. However, you can buy a second home with VA entitlement if you have sufficient remaining entitlement — just not both simultaneously as primary residences. PCS orders are a recognized exception to the 60-day occupancy rule." },
      { q: "What happens to the disabled veteran exemption if I PCS out of Florida?", a: "You lose the Florida homestead and veteran exemptions when the property is no longer your primary residence. However, if you retain the Pensacola home as a rental during a PCS and move back later, you can re-file homestead upon returning. The key is the primary-residence requirement." },
      { q: "Do Guard and Reserve members qualify for Florida disabled veteran exemptions?", a: "Yes, for service-connected disabilities. Guard and Reserve members with service-connected ratings qualify for the same Florida exemptions as regular military. The rating — not the component — determines eligibility." },
    ],
    body: `
<p>If you have a service-connected disability rating and you are buying in Florida, your dollar goes further than a civilian's by a meaningful margin — and further still than a non-disabled veteran's. The question is not whether you qualify for benefits; the question is whether your agent, lender, and Property Appraiser's office stacked them correctly. I have seen 100% P&T veterans pay $4,200 a year in Florida property tax they legally owed zero on, because nobody at the closing table raised their hand. This page is the stack.</p>

<h2>The Federal Stack — VA Loan Benefits with Disability Rating</h2>
<h3>1. VA Funding Fee — Completely Waived</h3>
<p>Any service-connected rating of <strong>10% or higher</strong> waives the VA funding fee entirely on every VA loan, including purchase, cash-out refinance, and <a href="/va-irrrl-guide.html">IRRRL streamline refi</a>. On a $400,000 zero-down first-use loan that is <strong>$8,600 back</strong>. Over a military career with 2-3 VA loans it can stack to $25,000+ in waived fees.</p>
<h3>2. Retroactive Refund if Rating Effective Before Closing</h3>
<p>If you paid the funding fee at closing and later receive a rating letter with an effective date on or before the closing date, you can file for a refund. Typical refunds in the Pensacola market: $5,000-$14,000.</p>
<h3>3. Specially Adapted Housing (SAH) Grants</h3>
<p>Veterans with certain disabilities (loss/loss-of-use of extremities, specific disability categories) may qualify for SAH grants up to $117,014 (2026 figure) or SHA grants up to $23,444 for home modifications or to build a suitable home. Grants are separate from VA loan entitlement — they do not reduce your loan eligibility.</p>

<h2>The Florida State Stack — Property Tax Exemptions</h2>
<h3>1. Florida Homestead Exemption (Base)</h3>
<p>Every Florida primary residence is eligible for the standard Florida homestead exemption. The first $25,000 of assessed value is exempt from all taxing authorities, and an additional $25,000 is exempt from non-school taxing authorities, for up to <strong>$50,000 in assessed value exemption</strong>. On a $400,000 home with a typical millage of ~14 mills, that is <strong>$700/year</strong> in tax savings.</p>
<p>Beyond savings, homestead also locks in the <strong>Save Our Homes cap</strong> — assessed value increases capped at 3% per year as long as you own the home. In a market like Gulf Breeze where values rose 8-12% annually from 2020-2024, this is worth substantially more than the exemption itself over a 5-year hold.</p>
<p>Full walkthrough and filing steps: <a href="/florida-homestead-exemption-military.html">Florida Homestead Exemption for Military Families</a>.</p>
<h3>2. Florida $5,000 Veteran Disability Exemption (10-99%)</h3>
<p>Florida Statute 196.24 provides an additional <strong>$5,000 assessed value reduction</strong> for veterans with any service-connected rating from 10% to 99%. It stacks on top of homestead. On a $400,000 home with 14 mills that is <strong>$70/year</strong> — modest on its own but meaningful over a 20-year hold, and requires zero effort to file with homestead.</p>
<h3>3. Florida 100% P&T Total Exemption (Florida Statute 196.081)</h3>
<p>For veterans rated 100% Permanent and Total (P&T) due to service-connected disability, the <strong>entire homestead is exempt from Florida property tax</strong>. On a $400,000 home with 14 mills that is <strong>$5,600/year</strong> — $56,000 over 10 years, $112,000 over 20. This is the single largest state benefit in the stack.</p>
<p>Requirements:</p>
<ul>
<li>100% P&T service-connected rating (not temporary 100%; must be permanent).</li>
<li>Florida homestead on the property.</li>
<li>File with the county Property Appraiser with a VA rating letter showing P&T status.</li>
</ul>
<h3>4. Surviving Spouse Continuation</h3>
<p>If a veteran was 100% P&T and passes away, the surviving spouse can typically continue the total property tax exemption as long as they continue to own and occupy the homestead. Similar rules apply to DIC-receiving surviving spouses.</p>
<h3>5. Combat-Related Disability Discount (65+)</h3>
<p>Florida Statute 196.082: veterans 65 or older with a combat-related disability receive a <strong>homestead property tax discount equal to their disability rating percentage</strong>. A 65-year-old with a 70% combat-related rating gets 70% off their Florida property tax bill.</p>

<h2>How the Stack Looks on a Real Pensacola Purchase</h2>
<h3>Scenario A: E-7 with 30% rating, buying $375K home in Navarre</h3>
<ul>
<li>Purchase price: $375,000</li>
<li>VA funding fee: <strong>$0</strong> (would have been $8,062 without rating) — <strong>savings: $8,062</strong></li>
<li>Florida homestead: $50,000 off assessed value → ~$700/year</li>
<li>Florida $5,000 veteran exemption: $5,000 off assessed value → ~$70/year</li>
<li><strong>Total first-year benefit: $8,832</strong>. Over a 5-year hold: $11,912.</li>
</ul>
<h3>Scenario B: Retired O-5 with 100% P&T, buying $625K home in Gulf Breeze</h3>
<ul>
<li>Purchase price: $625,000</li>
<li>VA funding fee: <strong>$0</strong> (would have been $13,437 as subsequent-use without rating) — <strong>savings: $13,437</strong></li>
<li>Florida 100% P&T total exemption: <strong>zero Florida property tax on homestead</strong> — savings: ~$8,750/year (Santa Rosa County millage on $625K)</li>
<li><strong>Total first-year benefit: $22,187.</strong> Over a 10-year hold: $100,937.</li>
</ul>
<h3>Scenario C: Widowed surviving spouse of 100% P&T veteran, continuing to own the home</h3>
<ul>
<li>Florida 100% P&T total exemption <strong>continues</strong> for the surviving spouse as long as they hold the homestead.</li>
<li>If the veteran held the VA loan, the spouse may be eligible for <strong>VA loan assumption as a surviving spouse</strong> with VA approval — the loan continues without refinance, preserving the original rate.</li>
<li>For VA benefits claims, surviving spouses may qualify for Dependency and Indemnity Compensation (DIC).</li>
</ul>

<h2>Filing Your Benefits — Pensacola-Area Specifics</h2>
<h3>Escambia County Property Appraiser</h3>
<p>File homestead + disabled veteran exemptions in person at 213 Palafox Place, Pensacola, or online via escpa.org. Deadline: <strong>March 1</strong> of the tax year. If you close on April 15, you file for the following tax year's benefits.</p>
<h3>Santa Rosa County Property Appraiser</h3>
<p>File at 6495 Caroline Street, Milton, or online via srcpa.gov. Same March 1 deadline. Santa Rosa is generally faster to process than Escambia.</p>
<h3>Okaloosa County Property Appraiser</h3>
<p>File at 73 Eglin Parkway NE, Fort Walton Beach, or online via okaloosapa.com. Same March 1 deadline.</p>

<h2>What to Bring When You File</h2>
<ul>
<li><strong>Homestead:</strong> Driver license showing Florida address, voter registration (optional but helpful), recorded deed, Social Security number.</li>
<li><strong>Disabled veteran exemption:</strong> VA rating decision letter showing percentage and effective date. For 100% P&T, the letter must explicitly state "Permanent and Total." If it says "Total and Permanent," same thing.</li>
<li><strong>Surviving spouse continuation:</strong> Death certificate, marriage certificate, veteran's original rating letter.</li>
<li><strong>Combat-related 65+ discount:</strong> Rating letter specifying combat-related injury (verify with VA if rating is ambiguous).</li>
</ul>

<h2>Common Mistakes I See</h2>
<h3>Filing only homestead, not veteran exemption</h3>
<p>The Property Appraiser will not automatically add the veteran exemption when you file homestead — they are separate forms. Every year I see rated veterans pay an extra $70-$5,600 because no one filed Form 196.24 or 196.081.</p>
<h3>Not re-filing after PCS return</h3>
<p>If you left Pensacola on PCS and kept the home as a rental, you lose homestead and veteran exemptions while renting. When you return and re-homestead, you must re-file. The benefits do not automatically reactivate.</p>
<h3>Thinking "Permanent" and "Total and Permanent" are different</h3>
<p>They are not. Any VA rating letter showing 100% P&T — whether phrased "100% Permanent and Total," "Total and Permanent," or "P&T with no future exams" — qualifies for Florida 196.081 total exemption.</p>
<h3>Missing the retroactive refund window</h3>
<p>If you paid a VA funding fee at closing and later received a retroactive rating effective on or before closing, you have the right to a full refund. File through your loan servicer. I have seen refunds process as long as 5 years after closing.</p>

<h2>Related Pages</h2>
<ul>
<li><a href="/va-loan-guide">VA Loan Guide</a></li>
<li><a href="/va-funding-fee-2026.html">VA Funding Fee 2026 Breakdown</a></li>
<li><a href="/va-irrrl-guide.html">VA IRRRL Streamline Refi</a></li>
<li><a href="/florida-homestead-exemption-military.html">Florida Homestead Exemption (Military)</a></li>
<li><a href="/va-disability-property-tax-florida.html">VA Disability Property Tax (Details)</a></li>
</ul>

<h2>Sources</h2>
<ul>
<li>Florida Statute 196.081 (Total exemption, 100% P&T) — <a href="http://www.leg.state.fl.us/Statutes/" target="_blank" rel="noopener">leg.state.fl.us</a></li>
<li>Florida Statute 196.24 ($5,000 veteran exemption)</li>
<li>Florida Statute 196.082 (Combat-related 65+ discount)</li>
<li>VA Funding Fee rules — <a href="https://www.va.gov/housing-assistance/home-loans/funding-fee-and-closing-costs/" target="_blank" rel="noopener">va.gov</a></li>
<li>Escambia County Property Appraiser — escpa.org</li>
<li>Santa Rosa County Property Appraiser — srcpa.gov</li>
<li>Okaloosa County Property Appraiser — okaloosapa.com</li>
</ul>
`,
  },

  // ─────────────────────────────────────────────────────────────────
  // 4. Florida Homestead Exemption for Military Families
  // ─────────────────────────────────────────────────────────────────
  {
    slug: "florida-homestead-exemption-military",
    title: "Florida Homestead Exemption for Military | $50K Off Assessed Value | Gregg Costin",
    description: "How military families file Florida homestead exemption in Escambia, Santa Rosa, and Okaloosa Counties. Save Our Homes cap, PCS rules, deadlines, filing checklist.",
    keywords: "Florida homestead exemption military, homestead exemption Pensacola, military homestead Florida, Save Our Homes military, Escambia homestead, Santa Rosa homestead, Okaloosa homestead, military Florida property tax",
    h1: "Florida Homestead Exemption for Military Families — Filing, Stacking, PCS Rules",
    breadcrumbName: "Florida Homestead (Military)",
    areaServed: "Pensacola",
    knowsAbout: ["Florida Homestead Exemption", "Save Our Homes Cap", "Military Homestead Florida", "Escambia County Property Tax", "Santa Rosa County Property Tax", "Okaloosa County Property Tax", "Florida Portability"],
    lead: "Florida homestead exemption is the single most underused property tax benefit in Pensacola, and military families — who move in and out — qualify in cases civilians do not. This is the filing playbook.",
    faqs: [
      { q: "Can military members claim Florida homestead exemption?", a: "Yes, if Florida is your primary residence. Active-duty members stationed in Florida with Florida as their state of legal residence (SLR) on their LES qualify straight away. Members with a different SLR can still qualify if they can demonstrate intent to make Florida their permanent home — typically by changing voter registration, driver license, and vehicle registration to Florida." },
      { q: "What is the deadline to file Florida homestead exemption?", a: "March 1 of the tax year. If you close on a home in June 2026, you file by March 1, 2027 to claim the exemption for the 2027 tax year. You cannot file retroactively for prior years." },
      { q: "What is the Save Our Homes cap?", a: "Florida Statute 193.155 caps annual assessed value increases on homesteaded properties at the lower of 3% or the Consumer Price Index. Over a 5-year hold in a rising market, this cap often saves more than the exemption itself. Assessed value can rise faster when the property changes hands." },
      { q: "Does a PCS break Florida homestead exemption?", a: "Usually yes. If you PCS out of state and rent out the Pensacola home, you are no longer occupying it as your primary residence — the homestead exemption is lost. You must re-file when you return. However, certain military absences (for active-duty orders) may preserve homestead in specific cases — consult with the Property Appraiser if your situation is ambiguous." },
      { q: "Can I file homestead with a Power of Attorney while deployed?", a: "Yes, most Florida counties accept a properly executed POA for homestead filing. Bring the POA, the service member's Florida driver license (or evidence of Florida residence), and the deed. Escambia, Santa Rosa, and Okaloosa all accept military POA." },
      { q: "What is Florida portability?", a: "Florida Statute 193.155(8) lets you transfer up to $500,000 of your Save Our Homes 'savings' (the difference between market and assessed value) to a new Florida homestead within 2 years. Critical for military members who sell in one FL county and buy in another during a PCS that keeps them in-state. File Form DR-501T with the new county." },
    ],
    body: `
<p>I have watched retired E-8s lose $3,000 a year for 5 years in a row by not filing Florida homestead on their Gulf Breeze home after closing. Meanwhile I have had junior enlisted buyers file homestead + veteran exemption on day one and save $800/year before their second LES landed. The rules are simple, the deadline is hard, and the paperwork takes 20 minutes.</p>

<h2>What Florida Homestead Exemption Actually Does</h2>
<p>Three things:</p>
<ol>
<li><strong>Reduces your assessed value</strong> by up to $50,000 (the first $25,000 from all taxing authorities, the second $25,000 from non-school authorities).</li>
<li><strong>Caps annual assessed value increases</strong> at 3% (or CPI if lower) under Save Our Homes.</li>
<li><strong>Enables portability</strong> — you can carry Save Our Homes savings between Florida homesteads.</li>
</ol>

<h3>Dollar example — $400K home in Gulf Breeze</h3>
<ul>
<li>Market value: $400,000</li>
<li>Assessed value at purchase: $400,000 (pre-homestead)</li>
<li>Homestead exemption: minus $50,000 → $350,000 taxable</li>
<li>Santa Rosa County millage ~14 → savings: <strong>$700/year</strong></li>
<li>Save Our Homes cap (3%/year): after 5 years in a market rising 8%/year, your assessed value can only rise 3% → protection worth <strong>~$1,200/year</strong> by year 5, cumulative savings over 5 years ≈ <strong>$3,500+</strong></li>
</ul>
<p>Combined 5-year savings with homestead alone: <strong>$7,000+</strong> on a $400K home. Plus any disabled veteran exemption stacking (see <a href="/disabled-veteran-benefits-florida.html">Disabled Veteran Benefits</a>).</p>

<h2>Who Qualifies (Military-Specific Rules)</h2>
<h3>Florida is your State of Legal Residence (SLR)</h3>
<p>Check your LES — the "State" code on the top right. If it says FL, you are a Florida legal resident for tax purposes and can file homestead as soon as you occupy the property. No additional steps.</p>
<h3>Florida is NOT your SLR but you want to homestead</h3>
<p>You can still qualify if you demonstrate <strong>intent</strong> to make Florida your permanent home. Standard evidence:</p>
<ul>
<li>Change voter registration to Florida.</li>
<li>Change driver license to Florida (required within 30 days of establishing residency anyway).</li>
<li>Change vehicle registration to Florida.</li>
<li>Change state on LES via DD Form 2058.</li>
<li>Declare Florida as domicile for tax purposes.</li>
</ul>
<p>Once filed, you should update your SLR to Florida. Several Florida Property Appraisers will flag a homestead filing where the LES still shows an out-of-state SLR and ask follow-up questions.</p>
<h3>Edge case: dual-military couples</h3>
<p>Only one person owns the homestead for exemption purposes; the exemption applies to the household, not the individual. If both spouses are on the deed and both want homestead treatment, file jointly. You cannot homestead two separate properties as one household.</p>

<h2>How to File — Step by Step</h2>
<ol>
<li><strong>Close on your home.</strong> Homestead applies to property you own and occupy as primary residence as of January 1 of the tax year you are filing for.</li>
<li><strong>Update your Florida driver license</strong> to show the new address. This is the #1 document the Property Appraiser will ask for. Do this within 10-14 days of closing; you have 30 days by law.</li>
<li><strong>Gather documents:</strong> driver license, voter registration (optional but helpful), recorded deed or closing disclosure, Social Security number for each owner, last LES if military.</li>
<li><strong>File in person or online</strong> with the Property Appraiser's office in your county. Most Panhandle counties allow online filing now.</li>
<li><strong>Deadline: March 1</strong> of the tax year. Late filings are accepted up to the 25th day after the Trim Notice (August) with late-filing documentation, but do not rely on this — file by March 1.</li>
<li><strong>Confirm via Trim Notice</strong> in August. The Trim Notice shows your assessed value, exemptions applied, and estimated tax. If homestead is not reflected, call the Property Appraiser immediately.</li>
</ol>

<h2>Pensacola-Area County Filing Details</h2>
<h3>Escambia County</h3>
<ul>
<li><strong>Address:</strong> 213 Palafox Place, Pensacola, FL 32502</li>
<li><strong>Phone:</strong> (850) 434-2735</li>
<li><strong>Online filing:</strong> escpa.org</li>
<li><strong>Typical walk-in wait:</strong> 30-45 minutes in March (peak season); 10-15 minutes off-season.</li>
</ul>
<h3>Santa Rosa County</h3>
<ul>
<li><strong>Address:</strong> 6495 Caroline Street, Milton, FL 32570</li>
<li><strong>Phone:</strong> (850) 983-1880</li>
<li><strong>Online filing:</strong> srcpa.gov</li>
<li><strong>Typical walk-in wait:</strong> 15-25 minutes.</li>
</ul>
<h3>Okaloosa County</h3>
<ul>
<li><strong>Address:</strong> 73 Eglin Parkway NE, Fort Walton Beach, FL 32548</li>
<li><strong>Phone:</strong> (850) 651-7300</li>
<li><strong>Online filing:</strong> okaloosapa.com</li>
<li><strong>Satellite offices:</strong> Crestview and Destin also accept filings.</li>
</ul>

<h2>Portability — Military-Specific Value</h2>
<p>Portability lets you transfer up to <strong>$500,000 of Save Our Homes savings</strong> (the gap between market and assessed value, accumulated over your hold period) to a new Florida homestead. Critical for:</p>
<ul>
<li>PCS from NAS Pensacola to Eglin — you sell the Gulf Breeze home and buy in Niceville. If your Gulf Breeze home had $180,000 of Save Our Homes savings, you transfer that to the Niceville property, reducing your assessed value by $180,000 on day one.</li>
<li>Downsizing at retirement — sell the family home in Gulf Breeze, buy a smaller place in Pace. Portability preserves the assessed value discount.</li>
</ul>
<p><strong>File Form DR-501T with the new county Property Appraiser within 2 years</strong> of abandoning the old homestead. Military moves often meet the "compelling circumstances" waiver for the 2-year window, but do not rely on it — file within the deadline.</p>

<h2>What Breaks Your Homestead</h2>
<ul>
<li><strong>Renting the property full-time.</strong> If you PCS and convert to a rental, homestead is lost. Re-file when you return.</li>
<li><strong>Declaring another state as your domicile</strong> — e.g., registering to vote elsewhere, filing state income tax elsewhere. Florida has no income tax, so this rarely happens by accident, but watch for it.</li>
<li><strong>Ownership change.</strong> Transferring to an LLC, trust, or corporate entity breaks homestead. Certain revocable living trusts may preserve it; consult the Property Appraiser before transferring.</li>
<li><strong>Absent more than 2 consecutive years</strong> in most counties, though military absences for active-duty orders often get a carve-out. Document your orders.</li>
</ul>

<h2>Stacking with Other Exemptions</h2>
<p>Florida homestead is the foundation. Stack with:</p>
<ul>
<li><strong>Disabled veteran $5,000 exemption</strong> (10-99% rating) — additional $5,000 off assessed.</li>
<li><strong>Disabled veteran total exemption</strong> (100% P&T) — zero Florida property tax on homestead.</li>
<li><strong>Senior 65+ exemption</strong> (income-qualified) — up to $50,000 additional.</li>
<li><strong>Combat-related 65+ disability discount</strong> — percentage discount equal to rating.</li>
<li><strong>Widow/widower $500 exemption</strong> — modest but stackable.</li>
</ul>
<p>See the full stack walkthrough: <a href="/disabled-veteran-benefits-florida.html">Disabled Veteran Benefits (Florida)</a>.</p>

<h2>Most Common Military Mistakes</h2>
<h3>Filing too late</h3>
<p>Buyers who close in June-December often "plan to file next year" and forget. The March 1 deadline is unforgiving. Calendar reminder on February 1 every year, even after you first file, so you catch any followup forms (veteran exemption, portability).</p>
<h3>Not updating SLR with LES</h3>
<p>Filing Florida homestead while your LES still shows "AL" or "TX" as SLR creates a paper-trail conflict. Submit DD Form 2058 with finance to change SLR to FL before or immediately after filing.</p>
<h3>Letting PCS tenancy break homestead unchecked</h3>
<p>If you PCS from Pensacola to Norfolk and rent out the Gulf Breeze house, notify the Property Appraiser. Failing to do so while collecting the exemption can result in back taxes + 50% penalty + 15% interest under Florida Statute 196.161.</p>
<h3>Missing portability on intra-state PCS</h3>
<p>A move from Navarre to Niceville is a PCS that stays in Florida. If you do not file DR-501T, you lose the Save Our Homes transfer and start over at market assessment on the new property.</p>

<h2>Related Pages</h2>
<ul>
<li><a href="/disabled-veteran-benefits-florida.html">Disabled Veteran Benefits (Florida Stack)</a></li>
<li><a href="/va-disability-property-tax-florida.html">VA Disability Property Tax Detail</a></li>
<li><a href="/va-loan-guide">VA Loan Guide</a></li>
<li><a href="/pcs-checklist.html">PCS Checklist</a> (includes homestead filing step)</li>
</ul>

<h2>Sources</h2>
<ul>
<li>Florida Statute 196.031 (Homestead Exemption)</li>
<li>Florida Statute 193.155 (Save Our Homes)</li>
<li>Florida Statute 193.155(8) (Portability)</li>
<li>Florida Statute 196.161 (Penalties for improper claim)</li>
<li>Florida Department of Revenue — <a href="https://floridarevenue.com/property/Pages/Taxpayers_Exemptions.aspx" target="_blank" rel="noopener">floridarevenue.com</a></li>
</ul>
`,
  },

  // ─────────────────────────────────────────────────────────────────
  // 5. BAH to Mortgage — What Can You Actually Afford
  // ─────────────────────────────────────────────────────────────────
  {
    slug: "bah-to-mortgage-guide",
    title: "BAH to Mortgage Guide | What Your BAH Actually Buys in 2026 | Gregg Costin",
    description: "Translate 2026 BAH for Pensacola, Eglin, and Hurlburt into a realistic home price. Debt-to-income limits, PITI, VA loan math, rank-by-rank examples.",
    keywords: "BAH to mortgage, BAH Pensacola, BAH Eglin, BAH Hurlburt, military home affordability, VA loan DTI, E-5 BAH mortgage, O-3 BAH home price, military house budget calculator",
    h1: "What Your BAH Actually Buys in 2026 — Military Home Affordability by Rank",
    breadcrumbName: "BAH to Mortgage",
    areaServed: "Pensacola",
    knowsAbout: ["BAH", "Military Home Affordability", "Debt to Income Ratio", "VA Loan DTI", "PITI", "BAH Pensacola", "BAH Eglin", "BAH Hurlburt", "Military Housing Budget"],
    lead: "BAH is a gross number. Your mortgage budget is a net number. Here is how to get from one to the other without being surprised at the closing table.",
    faqs: [
      { q: "Does BAH count as income for a VA mortgage?", a: "Yes. Lenders gross up BAH because it is tax-free, typically treating $1,800 BAH as equivalent to $2,250 pre-tax income. This boosts your debt-to-income capacity meaningfully." },
      { q: "What is the VA loan maximum DTI ratio?", a: "The VA itself does not cap DTI, but most lenders cap at 41% — and VA has residual income requirements that effectively cap it. Some lenders will go to 50% DTI with strong residual income and compensating factors (high credit, assets, low housing ratio)." },
      { q: "What is residual income and why does it matter?", a: "Residual income is the monthly cash left over after all debts including mortgage, taxes, insurance, and estimated household expenses. The VA requires minimums by family size and region. For a family of 4 in the South region (where Pensacola falls), the minimum is $1,003/month. This is why some VA loans with 45% DTI pass and some 38% DTI loans fail." },
      { q: "Should I spend all my BAH on housing?", a: "No. Typical rule of thumb: keep PITI (principal, interest, taxes, insurance) within 90-100% of BAH for single-income households. If your BAH is $2,000 and PITI is $2,000, you are breaking even — but you still have HOA, maintenance, utilities, and saving goals coming out of other pay. Dual-income households can stretch further." },
      { q: "What is the 2026 BAH for Pensacola?", a: "For MHA FL064 (Pensacola area, covers NAS Pensacola, Corry Station, Saufley Field, Whiting Field) in 2026: E-1 through E-4 without dependents $1,455; with dependents $1,794. E-5 with dependents $1,863. E-7 with dependents $2,145. O-3 with dependents $2,373. O-5 with dependents $2,619. See the full table on the BAH Rates page." },
      { q: "Can I buy above my BAH?", a: "Yes, as long as your DTI and residual income still qualify. Many military buyers extend beyond BAH using non-housing income, dual BAH (dual military), or housing budget flexibility. Just plan for the out-of-pocket monthly premium over BAH as a real cost." },
    ],
    body: `
<p>When a buyer calls me and says "I make $3,000 BAH, how much house can I afford?" my answer is never a single number. It is a two-minute conversation about four numbers: <strong>gross-up, DTI, residual, and out-of-pocket</strong>. When we get through them, the number is usually $30,000-$75,000 higher than the buyer thought — or $40,000 lower. Either way, no one should be guessing.</p>

<h2>The Four Numbers Every Military Buyer Needs</h2>
<h3>1. Grossed-Up BAH</h3>
<p>BAH is tax-free. Lenders know this, so they "gross up" BAH for underwriting purposes. Standard gross-up: <strong>125%</strong> (though some conventional lenders use 115%).</p>
<p>Example: $1,800 BAH → $2,250 grossed-up income equivalent. This is the number that goes on your loan application's income side.</p>
<h3>2. Debt-to-Income (DTI) Ratio</h3>
<p>All your monthly debts (mortgage PITI, car payments, student loans, credit card minimums, child support) divided by your total monthly income including grossed-up BAH. VA loans have <strong>no hard DTI cap</strong>, but most lenders cap at 41%, and DTI over 50% is very hard to get approved even with compensating factors.</p>
<h3>3. Residual Income</h3>
<p>What is left over after all debts, estimated utilities, maintenance, and taxes. VA sets minimums by region and family size. The minimum for the South region (where Pensacola falls) for a family of 4 is <strong>$1,003/month</strong>. Below that, loan denial.</p>
<h3>4. Out-of-Pocket Delta</h3>
<p>The difference between your full PITI and your BAH. If PITI is $2,400 and BAH is $2,000, your out-of-pocket is $400/month. Every buyer needs to stress-test $0, $300, $600, and $1,000 out-of-pocket scenarios before committing.</p>

<h2>Starter Calculation Formula</h2>
<p>Rough upper-end purchase price you can afford:</p>
<pre style="background:var(--panel);border:1px solid var(--hair);padding:1rem;border-radius:6px;color:var(--text);font-size:13px;overflow-x:auto">
Grossed-up BAH × 12 × (DTI cap minus existing debts %) × multiplier_for_rate
≈ Max Purchase Price

For 6.5% 30-year rate, 41% DTI cap, and ~1% annual tax+ins:
  Max Loan ≈ (Grossed-up monthly income × 41% − other monthly debts) × 165

Max Purchase Price = Max Loan (zero-down VA)
</pre>
<p><strong>Example:</strong> E-7 with dependents at NAS Pensacola. BAH $2,145 → grossed up $2,681. Base pay ~$4,900. Total gross ≈ $7,581. 41% = $3,108 max total debts. Assume $500/month in car + student loans. $3,108 − $500 = $2,608 available for PITI. At 6.5% 30-year + ~1% tax/ins, that supports roughly <strong>$380,000-$400,000</strong> purchase price, zero down.</p>

<h2>Rank-by-Rank 2026 Reality (Pensacola MHA FL064)</h2>
<table>
<thead><tr><th>Rank (w/dep)</th><th>BAH</th><th>Base Pay</th><th>Target PITI @ 100% BAH</th><th>Realistic VA Purchase Price</th></tr></thead>
<tbody>
<tr><td>E-4</td><td>$1,794</td><td>$2,850</td><td>$1,794</td><td>$240,000 - $270,000</td></tr>
<tr><td>E-5</td><td>$1,863</td><td>$3,150</td><td>$1,863</td><td>$250,000 - $285,000</td></tr>
<tr><td>E-6</td><td>$1,983</td><td>$3,530</td><td>$1,983</td><td>$270,000 - $310,000</td></tr>
<tr><td>E-7</td><td>$2,145</td><td>$4,900</td><td>$2,145</td><td>$310,000 - $365,000</td></tr>
<tr><td>E-8</td><td>$2,292</td><td>$5,550</td><td>$2,292</td><td>$340,000 - $400,000</td></tr>
<tr><td>O-1/W-1</td><td>$1,728</td><td>$3,700</td><td>$1,728</td><td>$240,000 - $285,000</td></tr>
<tr><td>O-2</td><td>$2,100</td><td>$4,400</td><td>$2,100</td><td>$290,000 - $335,000</td></tr>
<tr><td>O-3</td><td>$2,373</td><td>$5,900</td><td>$2,373</td><td>$340,000 - $400,000</td></tr>
<tr><td>O-4</td><td>$2,517</td><td>$7,500</td><td>$2,517</td><td>$370,000 - $450,000</td></tr>
<tr><td>O-5</td><td>$2,619</td><td>$8,900</td><td>$2,619</td><td>$390,000 - $490,000</td></tr>
</tbody>
</table>
<p>Full BAH tables: <a href="/bah-rates.html">FL064 BAH Rates</a>. Note E-6/E-7 have wider ranges because pay scales widely with time-in-service; the lower end assumes new to rank, the upper end assumes time-in-service.</p>
<p><strong>Caveat:</strong> "Realistic purchase price" assumes zero down, 6.5% 30-year rate, modest other debts. With 5% down, 100% disability waiver, or an IRRRL-refinanceable rate, numbers flex up 5-15%.</p>

<h2>Same BAH, Three Different Affordability Outcomes</h2>
<p>Three E-5s at Whiting Field, all with $1,863 BAH + dependents:</p>
<h3>Scenario A: Single income, high debt</h3>
<ul>
<li>Car loan $425/mo, student loans $325/mo, credit card min $125/mo = $875 existing debt</li>
<li>Gross income ~$5,479 (base + grossed BAH)</li>
<li>41% DTI cap = $2,246 total debt, minus $875 existing = $1,371 available for PITI</li>
<li><strong>Realistic: $190,000-$220,000</strong> — needs to be in Milton or Pace, not Navarre.</li>
</ul>
<h3>Scenario B: Single income, clean balance sheet</h3>
<ul>
<li>Zero other debt</li>
<li>41% DTI cap = $2,246 available for PITI</li>
<li><strong>Realistic: $300,000-$335,000</strong> — Pace, Milton, or entry-level Navarre.</li>
</ul>
<h3>Scenario C: Dual military, spouse E-5 at same base</h3>
<ul>
<li>Both draw $1,863 BAH (dual BAH rules) — combined grossed housing ~$4,650</li>
<li>Combined base pay ~$6,300, combined gross ~$10,950</li>
<li>41% DTI = $4,489 available for PITI and all debts</li>
<li><strong>Realistic: $580,000-$625,000</strong> — access to nearly any Panhandle market except Destin waterfront.</li>
</ul>

<h2>Common BAH-to-Mortgage Mistakes</h2>
<h3>Treating BAH as "free money"</h3>
<p>BAH is taxable-equivalent compensation the moment you convert it to a mortgage. If your mortgage is $400 over BAH, that $400 is coming out of your base pay, which IS taxed. Real-cost of going $400 over BAH on a 30-year loan: $400/month × 12 × 30 = $144,000 in principal, plus interest.</p>
<h3>Forgetting HOA and flood insurance</h3>
<p>Gulf Breeze HOAs can run $400-900/year. Flood insurance in Zone AE runs $1,500-$3,500/year. These eat into the "100% of BAH" budget fast. Build them in before signing.</p>
<h3>Not modeling post-promotion BAH</h3>
<p>E-4 buying at the top of E-4 BAH and expecting E-5 promotion within 12 months: model both scenarios. E-4 to E-5 BAH bump in Pensacola is only $69/month (less than 4%). Do not count on a big pay raise to bail out a stretched budget.</p>
<h3>Not accounting for PCS risk</h3>
<p>If you buy at top-of-BAH and PCS in year 2, can you rent the home at a rate that covers PITI? In Pensacola most E-5+ price points rent well; in Destin most homes do not cover PITI as rentals. Check comparable rents before buying.</p>
<h3>Skipping the residual income check</h3>
<p>Even if DTI passes, if your residual income is under $1,003/month (family of 4, South region), VA will deny. Lenders often do not flag this until underwriting — get a pre-qual letter that confirms residual, not just DTI.</p>

<h2>Related Pages</h2>
<ul>
<li><a href="/bah-rates.html">2026 BAH Rates — FL064 + FL023</a></li>
<li><a href="/va-loan-guide">VA Loan Guide</a></li>
<li><a href="/va-funding-fee-2026.html">VA Funding Fee 2026</a></li>
<li><a href="/disabled-veteran-benefits-florida.html">Disabled Veteran Benefits</a></li>
<li><a href="/pcs-checklist.html">PCS Checklist</a></li>
</ul>

<h2>Sources</h2>
<ul>
<li>DoD BAH Calculator — <a href="https://www.travel.dod.mil/Allowances/Basic-Allowance-for-Housing/" target="_blank" rel="noopener">travel.dod.mil</a></li>
<li>VA Pamphlet 26-7, Chapter 4: Credit Underwriting — <a href="https://www.benefits.va.gov/WARMS/pam26_7.asp" target="_blank" rel="noopener">benefits.va.gov</a></li>
<li>VA Residual Income Tables (current year) — VA Circular 26-xx-xx</li>
</ul>
`,
  },

  // ─────────────────────────────────────────────────────────────────
  // 6. PCS Schools by Base — Panhandle School Decisions
  // ─────────────────────────────────────────────────────────────────
  {
    slug: "pcs-schools-by-base",
    title: "PCS Schools by Base | Panhandle School Guide for Military Families | Gregg Costin",
    description: "Which schools are best for military kids depending on your base: NAS Pensacola, Eglin, Hurlburt, Whiting, Duke, Corry, Saufley. IB, AP, feeder patterns, Interstate Compact.",
    keywords: "military schools Pensacola, Eglin AFB schools, Hurlburt Field schools, NAS Pensacola schools, Niceville schools, Gulf Breeze schools, military Interstate Compact Florida, military family school transfer",
    h1: "PCS School Guide by Base — Panhandle School Decisions for Military Families",
    breadcrumbName: "Schools by Base",
    areaServed: "Florida Panhandle",
    knowsAbout: ["Military School Interstate Compact", "Pensacola Military Schools", "Eglin AFB Schools", "Hurlburt Field Schools", "Gulf Breeze Schools", "Niceville Schools", "Santa Rosa County Schools", "Escambia County Schools", "Okaloosa County Schools"],
    lead: "Where you buy determines where your kids attend school, and that is a bigger decision than the house. Here is which schools feed where, by base, with actual ratings and IB/AP/JROTC detail.",
    faqs: [
      { q: "What is the Interstate Compact on Educational Opportunity for Military Children?", a: "A 50-state agreement (including Florida) that protects military kids in transitions: guaranteed course credit transfer, ability to enroll based on orders before physical arrival, extra excused absences for deployment events, and accommodation for graduation requirements. Enforce it by presenting PCS orders to the school district enrollment office." },
      { q: "Which Panhandle school district is best for military families?", a: "It depends on your base and your kid's needs. Santa Rosa County (Gulf Breeze, Navarre, Milton, Pace) has the most consistent district-wide school quality. Okaloosa County has the single strongest cluster (Niceville/Destin). Escambia County is bimodal — some excellent magnet/IB programs, some weaker zoned schools. The right answer depends on what you are optimizing for." },
      { q: "Can my child stay at a specific school if we move within district?", a: "In most Panhandle counties yes, via 'school choice' or 'hardship transfer' requests for military families mid-year. Present orders and request continuation. This is separate from Interstate Compact, which applies only to transitions between districts/states." },
      { q: "What is the IB (International Baccalaureate) program in the Panhandle?", a: "Gulf Breeze High School has a well-regarded IB Diploma Programme. Niceville High School also has IB. Pensacola High School has IB. If IB is a priority, school zoning into one of these three is the priority." },
      { q: "Can I enroll my child in a Pensacola-area school before we physically arrive on PCS?", a: "Yes, under the Interstate Compact. Present your PCS orders (or TDY-to-PCS orders), proof of intended address (signed lease or purchase contract), and the child's prior school records. Schools cannot refuse enrollment on the basis that you are not physically at the new residence yet." },
      { q: "What about homeschooling military families?", a: "Florida has robust homeschool protections — file a letter of intent with the county superintendent within 30 days of establishing residency. Annual evaluation required. Military families often use homeschool during PCS transitions and re-enroll in traditional school once settled." },
    ],
    body: `
<p>On every PCS consultation I start by asking three questions: what is your budget, how many bedrooms, and how old are your kids. The third answer often drives the first two. A Gulf Breeze family with a rising 6th grader has different options than the same family with a 2nd grader — and buying the "perfect house" in a C-rated feeder zone is how military families end up with expensive private school tuition on top of a stretched mortgage. Here is the school map, by base.</p>

<h2>The Three Districts and What They Optimize For</h2>
<h3>Santa Rosa County — Consistent Quality, Military-Friendly</h3>
<ul>
<li><strong>Communities:</strong> Gulf Breeze, Navarre, Pace, Milton.</li>
<li><strong>Strengths:</strong> District-wide consistency. Even the "weakest" Santa Rosa schools outperform the median in most Panhandle counties. High military family concentration at every school — teachers are used to PCS timelines, Interstate Compact requests, and deployment-disrupted kids.</li>
<li><strong>Weaknesses:</strong> Growing fast — Navarre and Pace are seeing rapid enrollment growth, which stresses older facilities.</li>
<li><strong>Top schools:</strong> Gulf Breeze High (A, IB), Gulf Breeze Middle (A), Navarre High (A-), Pace High (B+), Central School/Milton K-8 (B).</li>
</ul>
<h3>Okaloosa County — The Single Strongest Cluster</h3>
<ul>
<li><strong>Communities:</strong> Niceville, Valparaiso, Bluewater Bay, Destin, Fort Walton Beach, Shalimar, Crestview.</li>
<li><strong>Strengths:</strong> The Niceville/Bluewater Bay cluster is the single strongest academic feeder in the Panhandle. Niceville High rivals any Florida public high for AP/IB options, merit scholarship outcomes, and college placement.</li>
<li><strong>Weaknesses:</strong> Housing around top-rated feeders is priced accordingly. Crestview and some parts of Fort Walton Beach have weaker feeder patterns.</li>
<li><strong>Top schools:</strong> Niceville High (A+, IB, strong AP), Bluewater Elementary (A+), Ruckel Middle (A), Destin Elementary (A), Choctawhatchee High (B+, FWB).</li>
</ul>
<h3>Escambia County — Bimodal, Magnet-Dependent</h3>
<ul>
<li><strong>Communities:</strong> Pensacola, Cantonment, Perdido Key, East Hill, Cordova Park, Ferry Pass, Bellview, Navy Point.</li>
<li><strong>Strengths:</strong> Several excellent magnet and IB programs (Pensacola High IB, Washington High JROTC, Pine Forest arts). Strong East Hill / Cordova Park feeder cluster.</li>
<li><strong>Weaknesses:</strong> Some zoned schools are C-rated. Zoning can shift with reassignment plans. If you buy in Bellview or Ferry Pass, magnet/choice applications are often the play rather than zoned school.</li>
<li><strong>Top schools:</strong> Pensacola High (B+, IB), AK Suter Elementary (A, East Hill), Cordova Park Elementary (A), Brown Barge Middle (A, magnet — application required), Booker T. Washington High (B+, JROTC).</li>
</ul>

<h2>By Base — Where Your Kids Will Attend</h2>

<h3>NAS Pensacola</h3>
<p><strong>Best neighborhoods for schools:</strong> Gulf Breeze (Santa Rosa County), East Hill / Cordova Park (Escambia), Perdido Key (Escambia).</p>
<p><strong>Gulf Breeze feeder:</strong> Gulf Breeze Elementary (A) → Gulf Breeze Middle (A) → Gulf Breeze High (A, IB).</p>
<p><strong>East Hill feeder (Escambia):</strong> AK Suter Elementary (A) → Workman Middle (B+) → Washington High (B+, JROTC) OR Pensacola High (B+, IB) via choice.</p>
<p><strong>Navy Point / Warrington feeder:</strong> Navy Point Elementary (B) → Warrington Middle (B) → Pensacola High (B+, IB) via choice. Closer to base but weaker feeder than East Hill.</p>
<p><strong>Perdido Key:</strong> Hellen Caro Elementary (A) → Bailey Middle (A-) → Pine Forest High (B+, arts magnet). Long commute to NAS Pensacola (25-35 min), but outstanding schools for families prioritizing school over commute.</p>

<h3>Corry Station</h3>
<p>Same school feeders as NAS Pensacola since Corry is on the west side of Pensacola. East Hill, Cordova Park, and Bellview feeders are all viable. <strong>Best:</strong> East Hill / Cordova Park for magnet access and shorter commute than Gulf Breeze.</p>

<h3>Saufley Field</h3>
<p>Saufley is in northwest Pensacola. <strong>Best neighborhoods:</strong> Cantonment (Escambia — new schools, B+ feeders), Pace (Santa Rosa — A-rated feeders, slightly longer commute), or Bellview with magnet choice for Brown Barge Middle or Pensacola High IB.</p>

<h3>NAS Whiting Field (Milton)</h3>
<p><strong>Closest communities:</strong> Milton, Pace, Navarre (for those willing to commute east).</p>
<p><strong>Milton feeder:</strong> Central School K-8 (B) or Berryhill Elementary (B) → Milton High (B+).</p>
<p><strong>Pace feeder:</strong> S.S. Dixon Intermediate (A-) → Pace High (B+). Pace is the school-quality upgrade for Whiting-assigned families willing to commute 12-18 minutes.</p>
<p><strong>Navarre feeder (longer commute but top schools):</strong> Navarre Elementary (A) → Holley-Navarre Intermediate (A) → Navarre High (A-).</p>

<h3>Eglin AFB (Niceville/Valparaiso/Bluewater Bay)</h3>
<p><strong>Primary recommendation:</strong> Niceville / Bluewater Bay. The Niceville High feeder is the best in the Panhandle.</p>
<p><strong>Niceville/Bluewater Bay feeder:</strong> Bluewater Elementary (A+) → Ruckel Middle (A) → Niceville High (A+, IB).</p>
<p><strong>Valparaiso:</strong> Lewis School K-8 (A) → Niceville High. Sometimes priced below Niceville proper for the same feeder.</p>
<p><strong>Destin (for O-3+ or dual-income with beach priority):</strong> Destin Elementary (A) → Destin Middle (A-) → Fort Walton Beach High (B). Feeder weaker than Niceville but Destin has its own charter options.</p>
<p><strong>Crestview (budget play):</strong> Feeders vary — Shoal River Middle, Crestview High (B). Recommended only if budget forces the move or if Duke Field assignment.</p>

<h3>Hurlburt Field</h3>
<p><strong>Closest communities:</strong> Mary Esther, Fort Walton Beach, Shalimar, Navarre (Santa Rosa side).</p>
<p><strong>Fort Walton Beach feeder:</strong> Elliott Point Elementary (B) → Bruner Middle (B) → Choctawhatchee High (B+). Strong band/ROTC programs at Choctaw.</p>
<p><strong>Mary Esther:</strong> Mary Esther Elementary (B+) → Bruner Middle → Choctawhatchee High. Convenient to Hurlburt gate.</p>
<p><strong>Shalimar:</strong> Meigs Middle (A-), Choctawhatchee High. Shalimar homes often priced similar to Fort Walton Beach with better middle-school feeder.</p>
<p><strong>Navarre option:</strong> BAH arbitrage for Hurlburt-assigned families (higher FL023 BAH, Santa Rosa schools). Navarre Elementary (A) → Holley-Navarre Intermediate (A) → Navarre High (A-). Commute: 25-35 min to Hurlburt.</p>

<h3>Duke Field</h3>
<p><strong>Closest communities:</strong> Crestview, Baker, Holt. Crestview is the primary commute market.</p>
<p><strong>Crestview feeder:</strong> Varies by address — Southside Elementary, Shoal River Middle, Crestview High (B). Research specific home address before buying; Crestview has multiple elementary zones with wide quality range.</p>
<p><strong>Niceville alternative:</strong> For 919 SOW reservists willing to commute 25-30 min, Niceville feeder is worth the drive. Bluewater Elementary (A+) → Ruckel Middle (A) → Niceville High (A+, IB).</p>

<h2>Interstate Compact — What It Protects</h2>
<p>The Compact on Educational Opportunity for Military Children (signed by all 50 states including Florida) gives military families specific rights when transitioning schools:</p>
<ul>
<li><strong>Enrollment:</strong> Schools must enroll military kids based on PCS orders and signed lease/contract, even before physical arrival.</li>
<li><strong>Course credit:</strong> Courses from the sending school must be accepted at the receiving school without requiring retakes.</li>
<li><strong>Graduation requirements:</strong> Sending-state graduation requirements may be substituted for receiving-state requirements if the student graduates within the year.</li>
<li><strong>Placement:</strong> Gifted, AP, IB, and honors placements transfer with records; the receiving school cannot require retesting.</li>
<li><strong>Extracurriculars:</strong> Students cannot be held out of teams or clubs due to transfer timing.</li>
<li><strong>Attendance:</strong> Up to 5 excused absences for deployment-related activities (pre-deployment, mid-deployment leave, return).</li>
</ul>
<p><strong>How to invoke:</strong> When you enroll the child, present PCS orders, prior school records, and any relevant documentation (IEP, 504, gifted placement). Ask to speak with the District Liaison for Military Families if the school balks — every Florida district has one designated.</p>

<h2>IB vs AP vs JROTC — Which Matters for Your Family</h2>
<p><strong>IB (International Baccalaureate):</strong> Full diploma program with mandatory extended essay, CAS hours, and exam sequence. Best for self-motivated, college-bound kids targeting selective schools. Available at Gulf Breeze, Niceville, Pensacola High.</p>
<p><strong>AP (Advanced Placement):</strong> Course-by-course college-credit option. Most Panhandle high schools offer 8-15+ AP courses. Niceville, Gulf Breeze, and Navarre have the deepest menus.</p>
<p><strong>JROTC:</strong> Military science + leadership, valuable for military-connected kids and for scholarship pipelines. Strongest local programs: Washington High (Navy), Pine Forest High (AF), Choctawhatchee High (AF).</p>

<h2>Common School-Decision Mistakes</h2>
<h3>Buying based on the listing's "school district" line</h3>
<p>Zoning is by address, not by ZIP code or school district. Two homes on the same street can feed into different schools. Always verify with the district's school locator tool using the exact address.</p>
<h3>Assuming Florida schools are uniform</h3>
<p>Florida has wide school quality variance even within a single county. Niceville High (A+) and Crestview High (B) are both Okaloosa — but academically quite different.</p>
<h3>Not considering the middle/high feeder</h3>
<p>Buying into an A-rated elementary that feeds a B middle and C+ high is short-sighted if you are buying for a kindergartner who will be in the feeder for 12 years. Map all three levels.</p>
<h3>Underestimating Magnet/IB competition</h3>
<p>Brown Barge Middle (Escambia) and Pensacola High IB are magnet programs requiring applications. Slots are competitive. If your kid is magnet-bound, research application windows and test prep before PCS.</p>

<h2>Related Pages</h2>
<ul>
<li><a href="/school-zones-military-families.html">Military School Zones — County-Level Deep Dive</a></li>
<li><a href="/pcs-checklist.html">PCS Checklist</a> (school enrollment is in the 30-day step)</li>
<li><a href="/communities/gulf-breeze">Gulf Breeze</a>, <a href="/communities/niceville">Niceville</a>, <a href="/communities/navarre">Navarre</a> — community deep-dives with school detail</li>
<li><a href="/faq.html">PCS FAQ</a></li>
</ul>

<h2>Sources</h2>
<ul>
<li>Interstate Compact Commission — <a href="https://mic3.net" target="_blank" rel="noopener">mic3.net</a></li>
<li>Escambia County School District — <a href="https://www.escambiaschools.org" target="_blank" rel="noopener">escambiaschools.org</a></li>
<li>Santa Rosa County School District — <a href="https://www.santarosa.k12.fl.us" target="_blank" rel="noopener">santarosa.k12.fl.us</a></li>
<li>Okaloosa County School District — <a href="https://www.okaloosaschools.com" target="_blank" rel="noopener">okaloosaschools.com</a></li>
<li>Florida DOE School Grades — <a href="https://www.fldoe.org" target="_blank" rel="noopener">fldoe.org</a></li>
</ul>
`,
  },
];

// ─── Render and write ─────────────────────────────────────────────
let count = 0;
for (const p of PAGES) {
  const html = renderPage(p);
  writeFileSync(`public/${p.slug}.html`, html, "utf8");
  count++;
  console.log(`wrote public/${p.slug}.html (${Math.round(html.length / 1024)} KB)`);
}
console.log(`\nTotal new content pages: ${count}`);
