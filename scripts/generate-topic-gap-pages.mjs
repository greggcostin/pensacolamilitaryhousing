// Generates the 6 topic-gap content pages recommended by the SEO audit.
// Same template as the prior 6 guides — SPA-consistent banner, schema blocks,
// meta tags, sitemap-ready URLs. Each page is a substantial standalone guide
// written from Gregg's retired-USAF-Captain + Panhandle-Realtor perspective.

import { writeFileSync } from "node:fs";
import { renderPage } from "./content-page-template.mjs";

const PAGES = [
  // ─────────────────────────────────────────────────────────────────
  // 1. First-Time Military Homebuyer
  // ─────────────────────────────────────────────────────────────────
  {
    slug: "first-time-military-homebuyer",
    title: "First-Time Military Homebuyer Guide Pensacola | Gregg Costin",
    description: "VA loan, USDA, FHA, pre-approval, credit prep, and the full PCS-to-Pensacola first-time buyer playbook for E-3/E-4 and junior officers.",
    keywords: "first time military homebuyer Pensacola, first time VA loan, VA loan E-4, VA loan junior enlisted, military first home Florida, pre-approval military, first time veteran buyer Pensacola, USDA loan military, PCS first home",
    h1: "First-Time Military Homebuyer — A Step-by-Step Playbook for Your First Pensacola Purchase",
    breadcrumbName: "First-Time Military Homebuyer",
    areaServed: "Pensacola",
    knowsAbout: ["First-Time Homebuyer", "VA Home Loans", "USDA Rural Loans", "FHA Loans", "Military Credit Preparation", "VA Pre-Approval", "Junior Enlisted Homebuying", "Pensacola First-Time Buyer", "BAH to Mortgage"],
    lead: "Buying your first home while active duty is different. The VA loan is a superpower — but only if you use it right. This is the complete sequence I walk every E-3, E-4, and junior officer through before they sign anything.",
    faqs: [
      { q: "Can an E-3 or E-4 actually afford to buy in Pensacola?", a: "Yes, in most neighborhoods. An E-4 with dependents draws $1,794 BAH in MHA FL064, which supports a purchase price of roughly $240,000-$275,000 with zero down at 2026 rates. Pace, Cantonment, and parts of NE Pensacola have good inventory in that band. Budget for closing costs (3-5% of price) in cash or seller concessions." },
      { q: "How long before my PCS date should I start the buying process?", a: "90 days out is ideal; 60 days is doable; 30 days is a scramble but I have closed in 21. Start with lender pre-approval 90+ days before your report date so you have time to fix credit issues if any appear. I have written PCS offers that close the week the family arrives." },
      { q: "What credit score do I need for a first VA loan?", a: "VA itself sets no minimum. Lenders commonly require 580-620, depending on the institution. Scores of 640+ unlock the best rates. If your score is under 600, I will connect you with a VA-specialist lender who works with lower scores and compensating factors (stable income, low DTI, disability income)." },
      { q: "Should I get pre-qualified or pre-approved?", a: "Pre-approval, always. Pre-qualification is a rough estimate based on what you tell the lender. Pre-approval is an actual credit pull, income verification, and written lender commitment. Sellers take pre-approval seriously; pre-qualification often gets ignored in a multi-offer situation." },
      { q: "What if my spouse is not on the deed — can I still use VA?", a: "Yes. VA loans can be in your name only, with only your income on the file. In a community-property state (Florida is not), spouse debt may still show on credit. In Florida, only the service member's credit and income typically apply. Spouses can be added later via a title transfer after closing if needed." },
      { q: "What happens on the VA appraisal?", a: "A VA-assigned appraiser inspects the home against Minimum Property Requirements (MPRs) — roof, electrical, plumbing, HVAC, heat, water, no lead paint, no major defects. They also issue a Notice of Value (NOV). If the NOV comes in below contract price, you have three options: seller lowers to NOV, you bring cash difference, or renegotiate. Plan for this." },
      { q: "Can I put any money down and still use VA?", a: "Yes. A down payment is optional on VA up to the Tier 1 county limit. Putting 5% down drops the funding fee from 2.15% to 1.50% and gives you immediate equity. Above $832,750 you need 25% down on the portion over the limit. Most first-time buyers in Pensacola stay below that anyway." },
    ],
    body: `
<p>Your first home purchase as an active-duty service member is a one-way door. Choose wrong and you are renting that mistake to tenants for five years while you PCS. Choose right and you build $30,000-$80,000 in equity before your next orders drop. Most first-timers I work with do not know what they do not know — that is what this guide fixes.</p>

<h2>Step 1 — Pull Your Credit 120 Days Before You Need It</h2>
<p>The single biggest variable you control is your credit score. A 720 score gets you a noticeably better rate than a 640 score — on a $300,000 loan, that is $30-$60/month for 30 years ($12,000-$22,000 over the life of the loan). Pull your credit free at <strong>annualcreditreport.com</strong> (the only FCRA-authorized free source). Check for:</p>
<ul>
<li><strong>Derogatory items</strong> (collections, late payments, charge-offs) — dispute if inaccurate, negotiate "pay-for-delete" on accurate ones.</li>
<li><strong>Credit utilization</strong> — pay down revolving balances below 30% of limit; under 10% is ideal for score boost.</li>
<li><strong>Inquiries</strong> — avoid any new credit pulls in the 90 days leading up to loan application.</li>
<li><strong>Identity theft</strong> — common with frequent PCS moves; freeze your credit if you spot anything off.</li>
</ul>
<p>Military members also have access to <strong>free credit monitoring</strong> under the SCRA at all three bureaus. Use it.</p>

<h2>Step 2 — Get Pre-Approved With a VA-Specialist Lender</h2>
<p>Not every lender is good at VA. Retail national lenders often do VA loans as an afterthought and treat them like FHA with different paperwork — slow, error-prone, and riddled with lender overlays that add cost for no reason. A VA-specialist lender:</p>
<ul>
<li>Closes VA purchases in 21-35 days, not 50-60.</li>
<li>Knows the Pamphlet 26-7 rules cold — especially seller concessions and non-allowable fees.</li>
<li>Structures the funding fee correctly (financed vs paid, exemption applied).</li>
<li>Will push back on weak VA appraisals if warranted.</li>
</ul>
<p>I work with three VA-specialist lenders in Pensacola and will introduce you to the one who fits your timeline and credit profile. Not a referral fee arrangement — I just know who closes and who does not.</p>

<h2>Step 3 — Compare VA, USDA, and FHA for Your Situation</h2>
<p>VA is the default for eligible military members, but not always the best tool.</p>
<table>
<thead><tr><th>Scenario</th><th>Best Loan</th><th>Why</th></tr></thead>
<tbody>
<tr><td>E-4 with dependents, zero disability, Pace purchase $250K</td><td>VA</td><td>Zero down, no PMI, 2.15% funding fee financed</td></tr>
<tr><td>Same buyer but 10%+ disability rated</td><td>VA</td><td>Same, but funding fee waived → $5,375 back</td></tr>
<tr><td>E-4 looking at rural Milton or Baker</td><td>USDA RD</td><td>Also zero down, possibly lower rate, no funding fee (1% upfront guarantee + 0.35% annual)</td></tr>
<tr><td>Separating soon, weak credit (590 score)</td><td>FHA</td><td>580 minimum, 3.5% down, but permanent MIP</td></tr>
<tr><td>E-7+ with 20%+ down saved</td><td>Conventional</td><td>No PMI above 80% LTV, no funding fee, lowest long-run cost</td></tr>
</tbody>
</table>
<p>For most military buyers in the $200-$400K range in Pensacola, <strong>VA wins</strong>. USDA is the underused tool for rural Santa Rosa / north Okaloosa purchases and it sometimes beats VA on total cost.</p>

<h2>Step 4 — Pick Your Target Neighborhoods Before You Tour</h2>
<p>First-timers often do this backwards — they see a house, fall in love, then figure out whether the commute, schools, and BAH math work. Inverse the order:</p>
<ol>
<li>Confirm your max purchase price (I help with this — we model your BAH, DTI, and residual income in 15 minutes over the phone).</li>
<li>List your non-negotiables: commute time, school zone, bedrooms, yard, flood zone.</li>
<li>Pick 2-3 target neighborhoods that fit — not 10.</li>
<li>THEN tour. Three homes in two target neighborhoods beats ten homes scattered all over.</li>
</ol>
<p>Most common first-time picks in the Pensacola MHA:</p>
<ul>
<li><strong>E-4 / E-5 / junior officer:</strong> <a href="/communities/pace">Pace</a>, <a href="/communities/cantonment">Cantonment</a>, Ferry Pass, Bellview.</li>
<li><strong>E-6 / E-7 / O-3:</strong> <a href="/communities/gulf-breeze">Gulf Breeze</a>, <a href="/communities/navarre">Navarre</a>, <a href="/communities/milton">Milton</a>, <a href="/communities/perdido-key">Perdido Key</a>.</li>
</ul>
<p>For a full per-rank breakdown, see <a href="/bah-to-mortgage-guide.html">BAH to Mortgage Guide</a>.</p>

<h2>Step 5 — Write an Offer That Wins</h2>
<p>The Pensacola market ranges from balanced (3 months of inventory) to slightly seller-leaning at peak season. A first-time VA offer that wins has:</p>
<ul>
<li><strong>Clean contingencies</strong> — standard inspection + financing + VA appraisal NOV contingency. No over-engineering.</li>
<li><strong>Realistic price</strong> — I pull comparable sales before you write.</li>
<li><strong>Seller concessions structured correctly</strong> — ask for 3-4% concessions AND separate "seller-paid closing costs" (title, recording, lender fees). See the <a href="/va-loan-guide">VA Loan Guide</a> Seller Concessions section for the Pamphlet 26-7 rule most agents miss.</li>
<li><strong>Solid pre-approval letter</strong> attached (not pre-qual).</li>
<li><strong>Earnest money</strong> of at least 1% of price — shows you are serious without exposing you unnecessarily.</li>
<li><strong>Military PCS flex</strong> — if your closing date hinges on orders, address it upfront in writing; most Pensacola sellers understand and accommodate.</li>
</ul>

<h2>Step 6 — Survive the VA Appraisal + Underwriting</h2>
<p>The two most common places a first-time VA deal falls apart:</p>
<h3>VA appraisal comes in low</h3>
<p>If the NOV is under contract price: seller lowers price (most common), you bring cash difference, or you walk. Built into every offer I write is an NOV addendum that protects you on this. Budget for the possibility.</p>
<h3>Underwriting finds credit issues</h3>
<p>New credit card opened, big deposit unexplained, recent co-signing — all can derail underwriting 14 days from closing. Rule: between pre-approval and closing, <strong>change nothing financially</strong>. No new credit, no job change, no large deposits you cannot explain, no moving money between accounts.</p>

<h2>Step 7 — Close and Start Building</h2>
<p>VA closings in Pensacola typically use mobile notaries — you can close at your kitchen table or at the title company. Bring:</p>
<ul>
<li>Government ID (military ID is fine).</li>
<li>Certified funds for your portion (closing disclosure shows the amount 3 days before closing — there should be no surprises).</li>
<li>Wire instructions verified by phone with the title company (NEVER trust emailed wire instructions without phone verification — wire fraud hits military buyers hard).</li>
</ul>
<p>Post-close:</p>
<ol>
<li><strong>File Florida homestead exemption</strong> — by March 1 of the year following close. See <a href="/florida-homestead-exemption-military.html">Florida Homestead Guide</a>.</li>
<li><strong>File disabled-veteran exemption</strong> if 10%+ rated.</li>
<li><strong>Set up auto-pay</strong> on your mortgage from your military pay account.</li>
<li><strong>Save for IRRRL opportunity</strong> — if rates drop 0.5%+ below yours after 6+ months, <a href="/va-irrrl-guide.html">streamline refi</a> the gain.</li>
</ol>

<h2>Common First-Time Mistakes I See Every Year</h2>
<h3>Treating BAH as the absolute ceiling</h3>
<p>BAH is a foundation. Most military families spend $200-$500/month above BAH to buy in a better school district or closer to base. Model your total PITI (principal, interest, taxes, insurance), not just BAH against mortgage.</p>
<h3>Skipping the inspection</h3>
<p>A $400 home inspection has saved my clients $5,000-$40,000 in negotiated repairs or price reductions. Always inspect. VA appraisal is not an inspection.</p>
<h3>Using the listing agent as "your" agent</h3>
<p>The listing agent represents the seller. Their fiduciary duty is to the seller. Always have your own buyer's agent (costs you nothing — seller pays the commission). I am MRP + ABR certified for exactly this.</p>
<h3>Closing just before PCS</h3>
<p>Closing within 30 days of orders drop is a timing stress. If possible, close 60+ days before your report date so you can move in, fix any issues, and settle before the next chapter of military life kicks in.</p>

<h2>Related Pages</h2>
<ul>
<li><a href="/va-loan-guide">VA Loan Guide</a></li>
<li><a href="/bah-to-mortgage-guide.html">BAH to Mortgage Guide</a></li>
<li><a href="/va-funding-fee-2026.html">VA Funding Fee 2026</a></li>
<li><a href="/pcs-checklist.html">PCS Checklist</a></li>
<li><a href="/florida-homestead-exemption-military.html">Florida Homestead Exemption</a></li>
<li><a href="/zero-down-home-loans.html">Zero-Down Home Loans Compared</a></li>
</ul>
`,
  },

  // ─────────────────────────────────────────────────────────────────
  // 2. Co-Buying Military Homes
  // ─────────────────────────────────────────────────────────────────
  {
    slug: "co-buying-military-homes",
    title: "Co-Buying Military Homes Pensacola | Dual-BAH & Joint VA | Gregg Costin",
    description: "Dual-military, friend co-buying, and joint VA loan strategies for Pensacola military families. Entitlement, title, exit planning, divorce risk.",
    keywords: "dual military home Pensacola, joint VA loan, co-buying military, dual BAH home, friends buy house military, VA loan two veterans, dual income military home, shared military mortgage",
    h1: "Co-Buying a Home in the Military — Dual-BAH, Joint VA, and the Exit Planning Nobody Mentions",
    breadcrumbName: "Co-Buying Military Homes",
    areaServed: "Pensacola",
    knowsAbout: ["Dual Military Home Purchase", "Joint VA Loan", "Co-Buying Real Estate", "Dual BAH", "Tenancy in Common", "Joint Tenancy Florida", "Military Exit Strategy"],
    lead: "Dual-military couples and military-and-civilian couples buy differently than single-earner households. So do two friends co-buying a rental. This is the complete playbook for joint purchases in the Pensacola market — and the exit plan most agents do not discuss.",
    faqs: [
      { q: "Can two service members use VA entitlement on the same loan?", a: "Yes. A joint VA loan uses both service members' entitlement proportionally. Each buyer's portion of the entitlement covers their share of the loan. This is especially powerful when one buyer has full entitlement and the other has reduced entitlement — the full-entitlement buyer can carry more of the guarantee, keeping the loan fully backed." },
      { q: "Do both of us need to qualify individually?", a: "Yes. Each co-borrower's credit, income, and DTI are individually underwritten. The loan uses the higher-risk borrower's credit score in most lender overlays. Both LES, both tax returns, both credit pulls. Plan accordingly." },
      { q: "What happens if we PCS to different bases?", a: "One spouse stays in the home (if possible) or it becomes a rental. VA allows you to keep the loan if either co-borrower continues to occupy as primary residence. If both PCS out, the home must either be refinanced to non-VA or sold within a reasonable timeframe. Plan this at purchase, not at orders." },
      { q: "Can a military member co-buy with a civilian?", a: "Yes, but there are rules. The VA requires the military member to occupy the home. The civilian co-borrower's entitlement is not needed — only VA eligibility belongs to the service member. The civilian's credit, income, and DTI count toward qualification. Risk: the VA loan portion corresponds only to the service member's share; the civilian's share requires 25% down on that portion unless the military member's entitlement covers it fully." },
      { q: "What if two friends want to buy together?", a: "Can be done but adds risk. Both must qualify. Title structure matters: tenancy in common (individual ownership shares, passes to own estate), or joint tenancy with right of survivorship (passes to other co-owner). Always have a written agreement addressing: exit, sale process, buyout terms, and dispute resolution. A simple co-ownership agreement costs $300-$800 through a Florida real estate attorney and prevents six-figure disasters." },
      { q: "What happens in a divorce?", a: "One of the most common military real estate crises. Options: one spouse buys the other out (requires refinancing to remove the departing spouse), sell the home and split proceeds, or one spouse assumes the VA loan (possible only if they meet VA occupancy and qualification rules). Plan exits before problems arise. Pre-nuptial and post-nuptial agreements can address this." },
      { q: "Can we use both of our VA entitlements on separate loans at the same time?", a: "Yes. Each eligible service member has their own entitlement. A dual-military couple could own a home in Pensacola (spouse A's VA loan) and a rental in Virginia (spouse B's VA loan). Each entitlement is separately tracked and used. This is how some dual-military families build a small rental portfolio before separation." },
    ],
    body: `
<p>Dual-military couples are the most underserved buyer profile in the Panhandle market. Most agents treat you like a single-income household and never ask the question that actually matters: are you stacking VA entitlement, or is only one of you using your benefit? That question alone has changed $50,000+ of purchasing power for clients I have worked with. Let us walk through all the joint-purchase structures and what each one unlocks.</p>

<h2>The Three Kinds of Military Joint Purchases</h2>

<h3>1. Dual-Military Couple (both VA-eligible)</h3>
<p>The most powerful combination. Both spouses are service members, both have full or partial VA entitlement. Structures:</p>
<ul>
<li><strong>Joint VA loan (single home):</strong> Both entitlements on one property. Both occupy. Both qualify.</li>
<li><strong>Two separate VA loans (two properties):</strong> Each spouse uses their own entitlement on a different home. Requires each to meet occupancy rules on their respective property.</li>
<li><strong>One uses VA, one holds entitlement for later:</strong> First home on spouse A's VA. Keep spouse B's entitlement for a future home (rental portfolio play).</li>
</ul>

<h3>2. Military + Civilian Couple</h3>
<p>One spouse is VA-eligible, the other is not. The VA portion applies only to the service member's ownership share. The civilian's share requires 25% down on that portion unless the service member's entitlement covers the entire loan. In practice, most lenders structure this as a "joint VA loan with non-veteran co-borrower" — the military spouse's entitlement guarantees their proportional share, and the civilian's share is structured as conventional-style 25% down.</p>
<p>Net effect: you still benefit from VA (lower rate, no PMI on the military portion), but you bring more down than a dual-military couple.</p>

<h3>3. Two Friends or Family Members (both or one military)</h3>
<p>Less common, higher risk, requires more structure. Common scenarios:</p>
<ul>
<li>Two deployed friends buying a home together as a pre-deployment rental.</li>
<li>Adult child and parent co-buying for post-retirement setup.</li>
<li>Siblings pooling resources.</li>
</ul>
<p>These require written co-ownership agreements. I always recommend working with a Florida real estate attorney before signing.</p>

<h2>Joint VA Loan Entitlement Math</h2>
<p>Two service members with full entitlement buying a $600,000 home in Gulf Breeze. How does this work?</p>
<ul>
<li><strong>Total loan:</strong> $600,000 (zero down on VA).</li>
<li><strong>VA guarantee:</strong> 25% of the loan = $150,000.</li>
<li><strong>Each spouse's entitlement:</strong> 50% of the VA guarantee = $75,000 each. Both well under the 2026 Tier 1 loan limit of $832,750, so full entitlement covers it.</li>
<li><strong>Funding fee:</strong> Shared proportionally. First use, 0% down, regular military = 2.15% → $12,900 total, split per the ownership agreement.</li>
<li><strong>Disability waiver:</strong> If EITHER spouse has 10%+ disability, their portion of the funding fee is waived. If both have disability, full waiver.</li>
</ul>

<h2>Title Structure — This Matters More Than People Think</h2>
<p>Florida recognizes three main ownership structures for married and unmarried co-owners:</p>
<h3>Tenancy by the Entireties (married couples only)</h3>
<p>Strongest Florida protection. Both spouses own the entire property jointly. On death of one spouse, the surviving spouse automatically owns. Creditor protection: a judgment against only one spouse cannot force sale. This is the default and recommended structure for married Florida couples.</p>
<h3>Joint Tenancy With Right of Survivorship (JTWROS)</h3>
<p>Each co-owner owns an equal undivided share. On death, the other co-owner inherits. No probate. Common for unmarried co-buyers who want survivorship.</p>
<h3>Tenancy in Common (TIC)</h3>
<p>Each co-owner owns a specified percentage (not necessarily equal). On death, that share passes to their estate, not the other co-owner. Best for friends co-buying where each wants to control their inheritance path.</p>

<h2>The Exit Plan Nobody Discusses</h2>
<p>PCS is the default exit for military. Plan before you buy.</p>
<h3>Scenario A: Both PCS to the same new base</h3>
<p>Easiest. Sell or convert to rental. If converting to rental: at least one spouse's primary-residence occupancy period (12 months) must be satisfied before PCS. After that, VA allows you to keep the loan and rent out.</p>
<h3>Scenario B: One PCSs away, one stays</h3>
<p>The staying spouse continues to occupy = VA loan continues normally. Geo-bachelor / geo-bachelorette arrangements work here.</p>
<h3>Scenario C: Both PCS to different bases</h3>
<p>If neither can realistically occupy: rent out the home (both signed the primary-residence certification, so occupancy history satisfies VA), or sell. If renting: both spouses share rental income, mortgage, tax treatment. Requires a written operating agreement.</p>
<h3>Scenario D: Divorce (unfortunately common)</h3>
<p>Most painful exit. Three outcomes:</p>
<ul>
<li>One spouse buys the other out: refinances to remove the departing spouse. Cash-out or IRRRL-with-removal is NOT generally allowed; a full VA refinance or conventional refi is needed.</li>
<li>Sell and split proceeds: cleanest but requires market timing.</li>
<li>One spouse assumes the loan: only works if that spouse alone qualifies for the VA loan and occupies the property.</li>
</ul>
<p>I always recommend a pre-purchase discussion of all four scenarios. Expensive surprises come from not having them.</p>

<h2>Dual-Military Commute Optimization</h2>
<p>A common dual-military scenario in the Panhandle: one spouse at NAS Pensacola, one at Eglin or Hurlburt. 60+ miles apart.</p>
<p>Options:</p>
<ul>
<li><strong>Live near one, commute the other:</strong> Navarre is the sweet spot — 35 min to NAS Pensacola, 25 min to Hurlburt, 40 min to Eglin. BAH comes from the higher-BAH spouse's assignment (FL023 if assigned to Eglin/Hurlburt).</li>
<li><strong>Geo-bachelor / geo-bachelorette:</strong> Spouse A lives near their base full-time, spouse B commutes home weekends. Common for short duty rotations. Requires a rental at the second base.</li>
<li><strong>Bluewater Bay or Niceville:</strong> Best Okaloosa schools, works for Eglin and Hurlburt, further from NAS Pensacola (60-75 min).</li>
</ul>

<h2>Dual-BAH Strategy — A Real Math Example</h2>
<p>E-5 + E-5 dual-military at Hurlburt Field. Each draws BAH independently per JTR Chapter 10.</p>
<ul>
<li>E-5 with dependents FL023 BAH: $2,235</li>
<li>E-5 without dependents FL023 BAH: $2,007 (when the other spouse is the dependent-claiming one)</li>
<li>Some dual-military couples can structure as both "without dependents" if they have no children — each draws the single rate.</li>
<li>Combined FL023 BAH: $4,242 with kids, $4,014 without.</li>
<li>Combined base pay E-5 + E-5: $6,300/mo</li>
<li>Combined gross income (125% BAH gross-up + base): $11,603/mo</li>
<li>41% DTI ceiling: $4,757/mo for all debts and PITI</li>
<li>Less $600 in car payments / student loans: $4,157 available for PITI</li>
<li><strong>Realistic purchase price: $600,000-$650,000</strong> in Navarre or FWB-area with VA loan, zero down.</li>
</ul>

<h2>When Joint Ownership Is NOT Right</h2>
<ul>
<li><strong>If one spouse has substantially worse credit:</strong> their score drags the loan pricing. Sometimes cleaner to put only the stronger credit on the loan (still valid VA loan if they are the VA-eligible spouse), keep joint title.</li>
<li><strong>If one co-buyer is weeks from separation or a major life change:</strong> wait until stable.</li>
<li><strong>If you have not had an honest conversation about exit scenarios:</strong> have it. Today. Before signing anything.</li>
</ul>

<h2>Related Pages</h2>
<ul>
<li><a href="/va-loan-guide">VA Loan Guide</a></li>
<li><a href="/first-time-military-homebuyer.html">First-Time Military Homebuyer</a></li>
<li><a href="/bah-to-mortgage-guide.html">BAH to Mortgage Guide</a></li>
<li><a href="/military-divorce-housing.html">Military Divorce Housing</a></li>
<li><a href="/military-rental-property-management.html">Military Rental Property Management</a></li>
</ul>

<h2>Sources</h2>
<ul>
<li>VA Pamphlet 26-7, Chapter 4 (Joint Loans) and Chapter 7 (Multiple Use of Entitlement) — <a href="https://www.benefits.va.gov/WARMS/pam26_7.asp" target="_blank" rel="noopener">benefits.va.gov</a></li>
<li>Joint Travel Regulations (JTR) Chapter 10 — Basic Allowance for Housing</li>
<li>Florida Statute 689.115 (tenancy by the entireties)</li>
</ul>
`,
  },

  // ─────────────────────────────────────────────────────────────────
  // 3. Military Divorce Housing
  // ─────────────────────────────────────────────────────────────────
  {
    slug: "military-divorce-housing",
    title: "Military Divorce Housing Pensacola | VA Loan Division | Gregg Costin",
    description: "Splitting equity, removing a spouse from VA loan, BAH-with-dependents changes, Florida equitable distribution, and sale vs buyout math for military divorce in Pensacola.",
    keywords: "military divorce Pensacola, VA loan divorce, remove spouse VA loan, military house split divorce, Florida equitable distribution military, divorce sell or buyout house, military divorce BAH, divorce military housing",
    h1: "Military Divorce and the House — The Playbook Nobody Gives You",
    breadcrumbName: "Military Divorce Housing",
    areaServed: "Pensacola",
    knowsAbout: ["Military Divorce Real Estate", "VA Loan Division", "Spouse Removal VA Loan", "Florida Equitable Distribution", "BAH with Dependents Changes", "Military Divorce Housing", "Divorce Buyout", "Divorce Sale"],
    lead: "Military divorce is the hardest real-estate conversation I have. There is no clean playbook. But there are four decision paths with known tradeoffs — and an agent who has sat with families through all four is worth talking to before anyone hires a divorce attorney.",
    faqs: [
      { q: "What happens to the VA loan in a divorce?", a: "The VA loan continues as long as one original borrower still qualifies and occupies the home. If the VA-eligible spouse keeps the home, the loan can usually stay intact. If the non-veteran spouse keeps the home, they must refinance to non-VA because VA loans require the VA-eligible borrower on the title and occupancy. Either way, the departing spouse needs to be legally and financially removed." },
      { q: "Can I remove my spouse from the VA loan without refinancing?", a: "Usually no. VA loans do not allow simple name removal. Options are: (1) Full VA refinance with just the remaining spouse (they must qualify alone and occupy), (2) IRRRL with co-borrower removal (rarely allowed — requires specific VA approval and the departing borrower's consent), or (3) conventional refinance out of VA. The third is most common." },
      { q: "Who pays the mortgage during the divorce?", a: "Governed by the divorce agreement. Florida courts can order temporary possession and support pending finalization. Whoever occupies typically pays the mortgage. Falling behind damages both parties' credit — both names are on the loan until refinance or sale closes. Florida domestic-relations attorneys handle this, but real estate choices influence the outcome." },
      { q: "Can I assume my ex-spouse's VA loan?", a: "Only if you are VA-eligible yourself (service member, veteran, qualifying spouse). A civilian ex-spouse cannot assume a VA loan. If you can assume, VA approval takes 30-60 days, you must occupy as primary residence, and the servicer underwrites your credit and income. Substitution of entitlement applies if you use your own VA entitlement." },
      { q: "What happens to BAH when we divorce?", a: "BAH with-dependents changes when the dependent relationship changes. The service member's BAH drops to 'without dependents' rate unless they still have qualifying dependents (typically children they have custody of). This can reduce monthly income by $200-$500/month in the Pensacola MHA — material when running affordability math on a buyout." },
      { q: "Is the house marital property in Florida?", a: "Florida is an equitable-distribution state (F.S. 61.075). Property acquired during marriage is generally marital and divided equitably (not necessarily 50/50). A home purchased pre-marriage with one spouse's VA loan, without using marital funds for mortgage payments, may remain non-marital. A home bought during marriage, even in one name, is generally marital. Premarital agreements override." },
      { q: "Should we sell or should one of us keep the house?", a: "The buyout math usually favors selling unless one spouse has strong income independent of the marital household, good credit, and emotional attachment to the home. Selling is cleaner, splits the equity fairly, and removes both names from the loan. Keeping requires refinance, often at higher current rates than the existing loan, eroding the equity split." },
    ],
    body: `
<p>I am not a divorce attorney. I do not represent either spouse in a divorce — that is your lawyer's job. What I do is sit at the other end of the table: you need to sell, buy, or refinance a home, and divorce is the reason. I have worked with dozens of military families through divorce transactions since my enlistment days. Here is what I wish every couple knew before the lawyers start their billable hours.</p>

<h2>The Four Decision Paths</h2>
<p>Every military divorce real-estate question reduces to one of four paths. Your attorney, your spouse's attorney, and the court's jurisdiction shape which path works. Before anyone files, understand the economics of each.</p>

<h3>Path 1 — Sell the Home and Split the Proceeds</h3>
<p>Simplest and often cleanest.</p>
<ul>
<li>Both names come off the loan at closing.</li>
<li>Net proceeds (sale price minus mortgage payoff minus closing costs) split per the divorce agreement.</li>
<li>Both spouses start fresh financially.</li>
<li>Market timing risk: if you sell in a soft market, equity shrinks. Pensacola has been generally balanced, not soft.</li>
</ul>
<p><strong>When to choose:</strong> Neither spouse can afford the monthly PITI alone. Market is favorable. Neither spouse has strong emotional attachment. Equity is the main asset in the marriage.</p>

<h3>Path 2 — One Spouse Buys the Other Out</h3>
<p>One spouse refinances into a solo mortgage, paying the other spouse their share of equity.</p>
<ul>
<li>Refinancing needed to remove departing spouse from loan. Usually at current market rates (often higher than the original loan rate — this is the hidden cost most couples miss).</li>
<li>Remaining spouse must qualify alone on the new loan: income, DTI, credit.</li>
<li>Equity buyout amount calculated in the divorce agreement. Typically: (current market value - mortgage balance) × departing spouse's share.</li>
<li>Costs: refinance closing costs (~$4,000-$7,000), loss of VA loan if non-VA spouse keeps the home, higher monthly payment at current rates.</li>
</ul>
<p><strong>When to choose:</strong> One spouse has kids and school-zone attachment, strong independent income, and the original loan rate vs current market is not catastrophically worse.</p>

<h3>Path 3 — VA Loan Assumption by VA-Eligible Ex-Spouse</h3>
<p>Rare but valuable when it works.</p>
<ul>
<li>Assuming spouse must be VA-eligible (their own service record or qualifying surviving spouse).</li>
<li>Servicer underwrites the assumption: credit, income, DTI.</li>
<li>Substitution of entitlement: the assuming spouse uses their own VA entitlement, releasing the departing spouse's entitlement for future VA use.</li>
<li>Original loan rate and terms preserved — if you have a 3.0% rate from 2021, this is the biggest benefit.</li>
<li>Timeline: 60-90 days typical, longer than a conventional refi.</li>
</ul>
<p><strong>When to choose:</strong> Both ex-spouses were military or one-and-a-veteran, and the original VA loan rate is meaningfully below current market.</p>

<h3>Path 4 — Continue Joint Ownership Temporarily</h3>
<p>Sometimes the right answer is "not yet."</p>
<ul>
<li>Divorce finalized, both spouses remain on title and loan.</li>
<li>Written post-divorce agreement governs: occupancy, mortgage payment, maintenance, and trigger for future sale.</li>
<li>Common triggers: youngest child turns 18, market rises 15%, one spouse remarries.</li>
</ul>
<p><strong>When to choose:</strong> Kids in school, both spouses want to avoid disruption, short-term financial alignment. Requires ongoing cooperation — do not choose this if you cannot cooperate.</p>

<h2>Florida Specifics</h2>
<h3>Equitable distribution (F.S. 61.075)</h3>
<p>Florida divides marital property equitably, not necessarily equally. Factors the court weighs:</p>
<ul>
<li>Duration of marriage.</li>
<li>Each spouse's economic circumstances.</li>
<li>Contribution to the marriage (financial and non-financial).</li>
<li>Intentional dissipation of marital assets.</li>
<li>Desirability of retaining the home (often for the parent with primary custody).</li>
</ul>
<h3>Homestead in divorce</h3>
<p>Florida homestead protection survives divorce for the spouse who continues to occupy. Save Our Homes benefit transfers with occupancy. Portability applies if that spouse buys another Florida homestead later.</p>
<h3>Alimony + child support impact on mortgage</h3>
<p>Alimony and child support received count as income toward DTI for the receiving spouse's refinance. Child support paid counts as a monthly debt. This significantly affects buyout feasibility.</p>

<h2>BAH Changes That Affect Your Math</h2>
<p>The moment you lose dependent status, your BAH drops. For an E-7 in Pensacola (MHA FL064), the gap is about $354/month ($2,145 with-dep vs $1,791 without-dep). For an O-3, $276/month. Over a year that is $3,300-$4,200 less income.</p>
<p>If the service member loses custody, they also lose with-dep BAH. Plan refinance math around the <strong>post-divorce</strong> BAH rate, not the current rate.</p>

<h2>Pre-Divorce Steps to Take Before You File</h2>
<ol>
<li><strong>Get a current market valuation of the home.</strong> I provide these free — a CMA (Comparative Market Analysis) with recent Pensacola-area comps. Your attorney will need this for equitable distribution.</li>
<li><strong>Pull a current mortgage balance statement.</strong> Know the payoff.</li>
<li><strong>Calculate net equity:</strong> market value - mortgage payoff - estimated 7% selling costs = net if sold.</li>
<li><strong>Model the buyout scenario:</strong> can either spouse afford the solo refinance at current market rates?</li>
<li><strong>Check rates:</strong> if your current rate is 3.5% and current market is 6.5%, a refinance means a 40-50% larger mortgage payment on the same balance.</li>
<li><strong>Decide path BEFORE the lawyers bill for strategizing.</strong> This alone saves $5,000-$15,000 in legal fees.</li>
</ol>

<h2>Common Military-Divorce Mistakes</h2>
<h3>Waiting too long to sell</h3>
<p>If the decision is sale-and-split, time is working against you. Legal fees, missed mortgage payments, and market fluctuation all reduce net equity. The longer the house sits in limbo, the less both parties receive.</p>
<h3>Assuming you can just take your name off</h3>
<p>You cannot. The mortgage bank has no obligation to release a co-signer. Only refinance or sale releases liability.</p>
<h3>Forgetting about VA entitlement tied up</h3>
<p>Until the VA loan is paid off or entitlement is substituted, the departing VA-eligible spouse has reduced entitlement. If they want to buy their next home with VA, their entitlement might be capped. Restore entitlement by selling the home, or by having the remaining spouse refinance to non-VA.</p>
<h3>Signing a quit-claim deed without understanding implications</h3>
<p>A quit-claim transfers your ownership but does NOT remove you from the mortgage. You can be off title and still liable on the loan. Never sign a quit-claim without simultaneous mortgage resolution.</p>

<h2>Working With Me During Divorce</h2>
<p>I do not represent both spouses — that is a conflict. In practice I usually work with one spouse, and the other uses their own agent or the divorce attorney recommends one. What I bring:</p>
<ul>
<li>Honest valuation that stands up in court.</li>
<li>Market timing assessment — sell now vs hold 6 months.</li>
<li>Connection to VA-experienced refinance lenders for buyout paths.</li>
<li>Introduction to military-family divorce attorneys in the Pensacola area.</li>
<li>Calm perspective — I have seen how these end. I can tell you what works and what does not.</li>
</ul>
<p>Call <a href="tel:+18502665005">(850) 266-5005</a> before anyone files. An honest 30-minute conversation now saves thousands in legal fees later.</p>

<h2>Related Pages</h2>
<ul>
<li><a href="/va-loan-guide">VA Loan Guide</a></li>
<li><a href="/va-irrrl-guide.html">VA IRRRL Refi Guide</a></li>
<li><a href="/co-buying-military-homes.html">Co-Buying Military Homes</a></li>
<li><a href="/bah-to-mortgage-guide.html">BAH to Mortgage Guide</a></li>
</ul>

<h2>Sources</h2>
<ul>
<li>Florida Statute 61.075 (Equitable Distribution)</li>
<li>Florida Statute 689.115 (Tenancy by the Entireties)</li>
<li>VA Pamphlet 26-7, Chapter 5 (Assumption of VA Loans), Chapter 7 (Entitlement Substitution)</li>
<li>Uniformed Services Former Spouses' Protection Act (USFSPA) — 10 USC §1408</li>
</ul>
`,
  },

  // ─────────────────────────────────────────────────────────────────
  // 4. Military PCS Tax Deductions
  // ─────────────────────────────────────────────────────────────────
  {
    slug: "military-pcs-tax-deductions",
    title: "Military PCS Tax Deductions 2026 | Moving Expenses & HHG | Gregg Costin",
    description: "Active-duty PCS moving expense tax deduction (Form 3903), DITY / PPM gain treatment, Florida residency advantages, TSP and housing impacts for 2026 returns.",
    keywords: "military PCS tax deduction, Form 3903 moving expenses, DITY tax, PPM gain, military moving deduction, PCS mileage 2026, military tax Florida, TCJA moving deduction, active duty moving expenses",
    h1: "Military PCS Tax Deductions — What You Can Actually Claim in 2026",
    breadcrumbName: "Military PCS Tax Deductions",
    areaServed: "Pensacola",
    knowsAbout: ["Military PCS Tax Deductions", "Form 3903", "DITY Move Tax", "Personally Procured Move", "Military Moving Expenses", "Military Florida Residency", "TCJA Military Exception"],
    lead: "The 2017 Tax Cuts and Jobs Act wiped out the moving-expense deduction for most Americans — but carved out an exception for active-duty military PCS. Here is what that means in plain English for your 2026 return, and what Florida residency gets you that no other PCS destination does.",
    faqs: [
      { q: "Can active-duty military still deduct moving expenses?", a: "Yes. The Tax Cuts and Jobs Act suspended moving-expense deductions 2018-2025 for most taxpayers, but active-duty members of the Armed Forces moving on official military orders are explicitly excepted (IRC §217(g)). You file Form 3903 to claim it. The TCJA sunset is currently extended — confirm with a tax professional for your specific tax year." },
      { q: "What PCS expenses are deductible?", a: "Allowable: transportation and storage of household goods, travel (lodging and mileage) from old home to new home, reasonable costs of moving personal effects. NOT deductible: meals during the move, temporary lodging beyond what the government reimbursed, pre-move house-hunting trips. Keep every receipt." },
      { q: "How does DITY / PPM income work for tax purposes?", a: "The DITY (Do-It-Yourself) move, now called PPM (Personally Procured Move), pays you the government's estimated cost of the move. If your actual expenses were less, you keep the difference — BUT that difference is taxable income (reported on a W-2 with code). You then deduct actual expenses via Form 3903. Net effect: only your true profit is taxed." },
      { q: "What mileage rate applies to military PCS?", a: "For PCS moves in 2026 the IRS moving mileage rate is set each year (2025 was 21 cents/mile). Confirm 2026 on IRS Publication 3 (Armed Forces' Tax Guide) each January. Use actual mileage from your departure to your new permanent duty station." },
      { q: "Is Florida a good PCS tax state?", a: "Yes, among the best. Florida has no state income tax, no estate tax, and favorable homestead property tax rules. Military members PCSing to Pensacola can change their State of Legal Residence (SLR) to Florida via DD Form 2058 and pay zero state income tax on their military pay while stationed in Florida. Savings are material — an O-3 moving from California saves ~$4,500/year." },
      { q: "Can I deduct TLE / TLA reimbursements?", a: "No. Temporary Lodging Expense (TLE, CONUS) and Temporary Lodging Allowance (TLA, OCONUS) reimbursements are non-taxable — they are not income, so there is nothing to deduct or report. Your PCS travel voucher W-2 generally excludes these." },
      { q: "What about my spouse's trailing expenses?", a: "The deduction applies to the service member and their household. Spouse's commute costs between the old and new locations during transition are generally covered under the household-moving deduction if documented. Spouse career-change costs (new job search, license fees) are not deductible under §217(g)." },
    ],
    body: `
<p>The one tax benefit every active-duty service member has that their civilian neighbors do not: you can still deduct moving expenses on PCS. Everyone else lost that deduction in 2018. Use it correctly and it offsets $1,500-$4,000 of federal tax liability on the year you PCS. Use it wrong and you either leave money on the table or draw an IRS notice.</p>

<h2>The §217(g) Military Exception</h2>
<p>Internal Revenue Code §217 allows taxpayers to deduct certain moving expenses from taxable income. The Tax Cuts and Jobs Act (TCJA) of 2017 suspended §217 for most taxpayers from 2018 through 2025 (currently extended; confirm status for your year). §217(g) preserved the deduction for one group: <strong>active-duty members of the Armed Forces who move due to a military order and incident to a permanent change of station.</strong></p>
<p>In plain English: if you are active duty, receive PCS orders, and move because of those orders, you can deduct qualified moving expenses on your federal return.</p>

<h2>What Counts as a Qualified PCS Move</h2>
<ul>
<li>Active-duty status at the time of the move.</li>
<li>Move is ordered by competent military authority (PCS orders — not leave, not TDY).</li>
<li>Move is incident to the PCS (before, during, or shortly after report date).</li>
<li>Includes moves from home to first duty station, between duty stations, and from last duty station upon retirement or discharge.</li>
</ul>
<p>Not covered: voluntary geographic moves not ordered, deployments, temporary duty (TDY) moves, dependent-only moves (they are covered within the service member's household move).</p>

<h2>Deductible Expenses (Form 3903)</h2>
<h3>Transportation and storage of household goods</h3>
<ul>
<li>Moving company charges (if you hired movers above government reimbursement).</li>
<li>Truck rental and packing materials (DITY/PPM).</li>
<li>Storage for up to 30 consecutive days in transit.</li>
<li>Shipping of a personally owned vehicle (POV) if not reimbursed by the government.</li>
</ul>
<h3>Travel to new home</h3>
<ul>
<li>Mileage for personal vehicles — current IRS moving rate (check IRS Publication 3 for your tax year).</li>
<li>Lodging during the trip (one night at departure, one at arrival, plus en route — be reasonable).</li>
<li>Tolls, parking, and other reasonable transportation costs.</li>
</ul>
<h3>Items NOT deductible</h3>
<ul>
<li>Meals during the move.</li>
<li>Pre-move house-hunting trips (not deductible even for military).</li>
<li>Temporary living expenses in the new location (use government TLE/TLA instead).</li>
<li>Cost of breaking a lease or losing a security deposit.</li>
<li>Expenses reimbursed by the government (no double-dipping).</li>
</ul>

<h2>How the DITY / PPM Tax Works</h2>
<p>The DITY move, now called Personally Procured Move (PPM), pays you 100% of what the government would have paid a commercial carrier. If you do the move cheaper than that, you pocket the difference. The tax treatment:</p>
<ol>
<li><strong>The full PPM payment is taxable income</strong> when you receive it. Finance reports it on a W-2 supplemental statement.</li>
<li><strong>You deduct actual moving expenses via Form 3903</strong> against that income.</li>
<li><strong>Net tax liability</strong> is on the profit (payment minus actual expenses) — which is what you actually earned.</li>
</ol>
<p>Example: Government paid you $4,200 for the PPM. Actual U-Haul + fuel + packing materials + lodging came to $2,400. Your Form 3903 deducts $2,400. Your taxable income from the PPM is $1,800 (the profit). Taxed at your marginal rate (22% for most enlisted, 24% for most officers), that is $396-$432 in federal tax. You keep the rest.</p>

<h2>Form 3903 Step-by-Step</h2>
<ol>
<li>Download Form 3903 from IRS.gov (or use tax software — TurboTax, H&R Block, Military OneSource's MilTax free filing all handle it).</li>
<li>Line 1: transportation and storage of household goods (actual expenses, excluding government reimbursements).</li>
<li>Line 2: travel (lodging + mileage, excluding reimbursements).</li>
<li>Line 3: total moving expenses.</li>
<li>Line 4: government reimbursements that are NOT on your W-2 as income. (PPM gross payments are typically on the W-2 as income, so do not subtract again.)</li>
<li>Line 5: deductible moving expenses = Line 3 minus Line 4.</li>
<li>Line 5 flows to Schedule 1 line 14 (adjustments to income).</li>
</ol>

<h2>Florida Residency — The Long-Term Tax Play</h2>
<p>PCSing to Florida is a chance to make a permanent-tax change that pays dividends for the rest of your career. Florida has:</p>
<ul>
<li><strong>Zero state income tax.</strong> Military pay is not taxed by Florida.</li>
<li><strong>No estate tax.</strong></li>
<li><strong>Homestead protections.</strong> $50,000 homestead exemption plus 3% Save Our Homes cap.</li>
<li><strong>Disabled veteran property tax exemptions.</strong> See <a href="/disabled-veteran-benefits-florida.html">Disabled Veteran Benefits</a>.</li>
<li><strong>SCRA protections from your prior state's taxation.</strong> Service members retain their State of Legal Residence regardless of where they are stationed — but you can affirmatively change it.</li>
</ul>
<p>To change your SLR to Florida:</p>
<ol>
<li>Update DD Form 2058 (State of Legal Residence Certificate) with finance to declare Florida as your SLR.</li>
<li>Take physical residence actions: Florida driver license, voter registration, vehicle registration, declare intent to make Florida your permanent home.</li>
<li>File Florida homestead exemption on your home (if you own).</li>
<li>Stop filing state income tax returns for the prior state (if you owed one). Confirm with a tax professional for partial-year rules.</li>
</ol>
<p>Estimated first-year savings for a family moving from a high-tax state: $3,000-$8,000. Career savings over 10 years: $30,000-$80,000.</p>

<h2>Recordkeeping Checklist</h2>
<p>Keep for 7 years (IRS statute of limitations):</p>
<ul>
<li>PCS orders (original + all amendments).</li>
<li>All moving receipts: truck rental, packing materials, fuel, lodging, tolls.</li>
<li>Mileage log: starting odometer, ending odometer, date, destination.</li>
<li>PPM voucher and W-2 showing PPM payment.</li>
<li>DD Form 1351-2 (Travel Voucher) if you used commercial travel.</li>
<li>Household goods shipment documents (GBL / DPS records).</li>
</ul>

<h2>Common PCS Tax Mistakes</h2>
<h3>Forgetting to file Form 3903</h3>
<p>If you took a PPM payment, you received taxable income. If you do not file Form 3903 to offset it with actual expenses, you pay tax on the full PPM amount instead of just the profit. Standard software prompts for this, but people skip it. Do not.</p>
<h3>Claiming reimbursed expenses</h3>
<p>Double-dipping: if the government reimbursed a cost directly (not through PPM), you cannot also deduct it. Straightforward on W-2 reporting — stay organized.</p>
<h3>Missing the state tax residency change</h3>
<p>A 15-minute DD Form 2058 submission saves thousands per year. Too many mid-career military stay on their old state's tax rolls out of inertia.</p>
<h3>Missing the deadline for prior-year state filings</h3>
<p>If you owed state tax the year you PCSd, file that return correctly — even if you are now a Florida resident. Prior-state obligations do not vanish just because you moved.</p>

<h2>Free Military Tax Resources</h2>
<ul>
<li><strong>MilTax</strong> (Military OneSource): free federal + state filing with military-specific logic. militaryonesource.mil</li>
<li><strong>VITA</strong>: Volunteer Income Tax Assistance on most bases during tax season.</li>
<li><strong>IRS Publication 3</strong>: "Armed Forces' Tax Guide" — updated annually. Free at irs.gov.</li>
<li><strong>IRS Publication 521</strong>: "Moving Expenses" — describes Form 3903 in detail.</li>
</ul>

<h2>Related Pages</h2>
<ul>
<li><a href="/pcs-checklist.html">PCS Checklist</a></li>
<li><a href="/florida-homestead-exemption-military.html">Florida Homestead Exemption</a></li>
<li><a href="/disabled-veteran-benefits-florida.html">Disabled Veteran Benefits</a></li>
<li><a href="/first-time-military-homebuyer.html">First-Time Military Homebuyer</a></li>
</ul>

<h2>Sources</h2>
<ul>
<li>Internal Revenue Code §217(g) — moving expense deduction for Armed Forces</li>
<li>IRS Publication 3 — Armed Forces' Tax Guide (updated annually)</li>
<li>IRS Publication 521 — Moving Expenses</li>
<li>Form 3903 instructions — <a href="https://www.irs.gov/forms-pubs/about-form-3903" target="_blank" rel="noopener">irs.gov</a></li>
<li>Servicemembers Civil Relief Act (SCRA) — 50 USC §3901 et seq., state tax residency protections</li>
<li>MilTax — <a href="https://www.militaryonesource.mil/" target="_blank" rel="noopener">militaryonesource.mil</a></li>
</ul>

<p style="color:#888;font-size:13px;margin-top:32px"><em>I am a Realtor, not a CPA. The information here is general education, not tax advice for your specific situation. Consult a qualified tax professional before filing — MilTax is free and military-aware.</em></p>
`,
  },

  // ─────────────────────────────────────────────────────────────────
  // 5. Zero Down Home Loans
  // ─────────────────────────────────────────────────────────────────
  {
    slug: "zero-down-home-loans",
    title: "Zero-Down Home Loans 2026 Pensacola | VA vs USDA vs FHA | Gregg Costin",
    description: "VA, USDA Rural Development, FHA, and conventional 3% down compared head-to-head for Pensacola 2026. Rates, PMI, funding fees, credit minimums, Panhandle-specific examples.",
    keywords: "zero down home loan Pensacola, zero down VA USDA, no money down mortgage, USDA RD loan Florida, FHA vs VA, 0 down loans 2026, first time home buyer loan compare, low down payment mortgage Pensacola",
    h1: "Zero-Down Home Loans in 2026 — VA, USDA, FHA, and the Low-Down Paths Compared",
    breadcrumbName: "Zero-Down Home Loans",
    areaServed: "Pensacola",
    knowsAbout: ["VA Loan", "USDA Rural Development Loan", "FHA Loan", "Conventional 3% Down", "Zero Down Mortgage", "First-Time Homebuyer Programs", "Florida Bond Loan", "Pensacola Mortgage Programs"],
    lead: "Zero-down is not only a VA thing. USDA gets you in with nothing down in Santa Rosa and north Okaloosa. FHA with 3.5% down is often better than a weak VA case. Conventional 3% is available if you have the credit. Pick the right tool and save five figures.",
    faqs: [
      { q: "Which 2026 zero-down loan has the lowest true cost?", a: "For eligible military, VA almost always wins total-cost-over-5-years: zero down, no PMI, lowest rates, funding fee often waived with disability. USDA is second for eligible rural areas. Conventional 3% can beat FHA total cost for strong-credit buyers because FHA MIP is permanent on most loans today." },
      { q: "Who qualifies for USDA in the Pensacola area?", a: "USDA Rural Development loans apply to specific geographic areas. In the Pensacola area, much of Pace, Milton, Cantonment north of I-10, northern Santa Rosa County, Baker, and parts of north Okaloosa are USDA-eligible. Urban Pensacola, Gulf Breeze, Navarre beachside, and most of Niceville/FWB are not. Check eligibility at eligibility.sc.egov.usda.gov." },
      { q: "Income limits for USDA?", a: "Yes, USDA has income caps that scale by family size and county. 2026 Escambia/Santa Rosa/Okaloosa single-earner cap is roughly $110,650 for a family of 1-4, $146,050 for 5-8. Most E-4 through O-3 households qualify. Higher-rank households often exceed USDA limits." },
      { q: "Can a veteran use USDA instead of VA?", a: "Yes. Some veterans prefer USDA in rural areas because: no funding fee (USDA has a 1% upfront guarantee + 0.35% annual, typically lower total cost than VA funding fee for non-exempt veterans), USDA is sometimes faster, and USDA rates are competitive. VA is usually better for 10%+ disabled veterans because their funding fee is waived." },
      { q: "What's the FHA MIP rule I keep hearing about?", a: "FHA requires upfront Mortgage Insurance Premium (MIP) of 1.75% of loan amount at closing (financed into loan), PLUS annual MIP of 0.55% of loan balance (paid monthly). Unlike conventional PMI, FHA MIP is permanent for the life of the loan on most 30-year loans. Only way to remove it: refinance to conventional or VA once you have equity." },
      { q: "Can I use conventional 3% down as a veteran?", a: "Yes, and sometimes you should. Conventional 3% down with strong credit (720+) can beat VA total cost if: (1) you are not exempt from VA funding fee and (2) you will sell the home within 3 years (funding fee cost not amortized over enough years). For long holds and disabled veterans, VA usually wins." },
      { q: "What's the Florida Hometown Heroes program?", a: "Florida's state program for military, teachers, healthcare workers, law enforcement, and firefighters. Provides up to $35,000 in down-payment and closing-cost assistance as a second mortgage on the primary residence. Stacks with VA, FHA, or conventional. Income and purchase-price limits apply; as of 2026, Pensacola area cap is around $460,000 purchase price. floridahousing.org" },
    ],
    body: `
<p>Every year I watch military and first-time buyers pick the wrong loan product. Not from bad intent — from bad information. VA is the default for eligible service members, but "default" and "best" are not synonyms in every scenario. This page runs the four zero-down or low-down options head-to-head with real Pensacola numbers.</p>

<h2>The Four Zero-Down / Low-Down Paths</h2>
<ol>
<li><strong>VA loan</strong> — zero down, no PMI, eligible military/veterans only</li>
<li><strong>USDA Rural Development</strong> — zero down, income-capped, geography-restricted</li>
<li><strong>FHA</strong> — 3.5% down, lenient credit, permanent MIP</li>
<li><strong>Conventional 3% down</strong> — 3% down, strong credit needed, PMI removable at 80% LTV</li>
</ol>
<p>Plus the Florida Hometown Heroes program which stacks on top of any of these.</p>

<h2>Head-to-Head Comparison — $325,000 Pensacola Purchase (2026 Rates)</h2>
<table>
<thead><tr><th>Feature</th><th>VA</th><th>USDA</th><th>FHA</th><th>Conventional 3%</th></tr></thead>
<tbody>
<tr><td>Down payment</td><td>$0</td><td>$0</td><td>$11,375</td><td>$9,750</td></tr>
<tr><td>Loan amount</td><td>$325,000</td><td>$325,000</td><td>$313,625</td><td>$315,250</td></tr>
<tr><td>Rate (approx. 2026)</td><td>6.25%</td><td>6.35%</td><td>6.50%</td><td>6.75%</td></tr>
<tr><td>Upfront fee</td><td>2.15% = $6,988 (financed)</td><td>1.00% = $3,250 (financed)</td><td>1.75% MIP = $5,488 (financed)</td><td>$0</td></tr>
<tr><td>Monthly P&I</td><td>$2,043</td><td>$2,033</td><td>$2,013</td><td>$2,044</td></tr>
<tr><td>Monthly PMI/MIP</td><td>$0</td><td>$95 annual guarantee</td><td>$143</td><td>$158 (removes at 80% LTV)</td></tr>
<tr><td>Est. monthly PITI (incl. $2,500/yr insurance, 0.85% tax)</td><td>$2,497</td><td>$2,582</td><td>$2,610</td><td>$2,655</td></tr>
<tr><td>Credit score min</td><td>580-620 (lender)</td><td>640+</td><td>580+</td><td>620+ (best at 720+)</td></tr>
<tr><td>5-year total cost</td><td>~$158,000</td><td>~$164,000</td><td>~$175,000</td><td>~$177,000</td></tr>
</tbody>
</table>
<p><em>Numbers are approximate for illustration. Actual rates, fees, and PMI vary by lender, credit score, and geography. VA numbers assume non-exempt (no disability waiver); if exempt, VA drops by ~$7,000 over 5 years.</em></p>

<h2>VA Loan — The Default for Eligible Military</h2>
<p><strong>Who qualifies:</strong> Active duty (90+ days wartime / 181 days peacetime), veterans with honorable/general discharge, Guard/Reserve with 6+ years, surviving spouses.</p>
<p><strong>Strengths:</strong></p>
<ul>
<li>Zero down, no PMI.</li>
<li>Lowest rates of any program.</li>
<li>Funding fee waived for 10%+ service-connected disability, active-duty Purple Heart, surviving spouses.</li>
<li>Assumable (valuable if you sell when rates rise).</li>
<li>No structural loan limit with full entitlement.</li>
</ul>
<p><strong>Weaknesses:</strong></p>
<ul>
<li>Funding fee 2.15%-3.30% if not exempt.</li>
<li>Minimum Property Requirements (MPRs) can block fixer-uppers.</li>
<li>Some sellers wrongly perceive VA offers as harder.</li>
</ul>
<p>See the <a href="/va-loan-guide">VA Loan Guide</a>.</p>

<h2>USDA Rural Development — The Underused Panhandle Tool</h2>
<p><strong>Who qualifies:</strong> Any income-qualified buyer (veteran or civilian) purchasing in a USDA-designated rural area. Income cap applies.</p>
<p><strong>USDA-eligible Pensacola-area communities (partial list — verify at USDA map):</strong></p>
<ul>
<li>Most of Pace beyond the I-10 corridor</li>
<li>Milton</li>
<li>Parts of Cantonment north of I-10</li>
<li>Baker, Crestview outskirts, Holt</li>
<li>Rural Santa Rosa and Okaloosa Counties</li>
</ul>
<p><strong>NOT eligible:</strong> Most of Pensacola proper, Gulf Breeze, urban Navarre, central Niceville/FWB.</p>
<p><strong>Strengths:</strong></p>
<ul>
<li>Zero down.</li>
<li>No PMI (has annual guarantee fee instead — usually cheaper).</li>
<li>Competitive rates, often close to VA.</li>
<li>No funding fee like VA has — instead 1.00% upfront guarantee + 0.35%/year.</li>
</ul>
<p><strong>Weaknesses:</strong></p>
<ul>
<li>Income limits. Roughly $110K for family of 1-4 in 2026 Pensacola counties.</li>
<li>Geographic restriction — limits neighborhood choice.</li>
<li>Credit typically 640+.</li>
</ul>

<h2>FHA — The Low-Credit Fallback</h2>
<p><strong>Who qualifies:</strong> Anyone meeting FHA guidelines (580+ score, 3.5% down; 500-579 with 10% down).</p>
<p><strong>Strengths:</strong></p>
<ul>
<li>Most lenient credit (580+).</li>
<li>Flexible with gift funds for down payment.</li>
<li>Assumable (like VA).</li>
</ul>
<p><strong>Weaknesses:</strong></p>
<ul>
<li>Permanent MIP on most 30-year loans. You cannot remove it without refinancing to conventional or VA.</li>
<li>1.75% upfront MIP + 0.55%/year annual = higher ongoing cost than VA or conventional.</li>
<li>FHA appraisal standards similar to VA's MPRs — can block fixer-uppers.</li>
</ul>

<h2>Conventional 3% Down — The Strong-Credit Alternative</h2>
<p><strong>Who qualifies:</strong> 620+ credit score, stable income, reasonable DTI. Programs: Fannie Mae HomeReady, Freddie Mac Home Possible, or standard conventional.</p>
<p><strong>Strengths:</strong></p>
<ul>
<li>PMI removable automatically at 78% LTV (automatic) or requestable at 80% LTV (borrower request).</li>
<li>No loan-level funding fee.</li>
<li>Best long-run cost for strong-credit buyers holding 5+ years.</li>
</ul>
<p><strong>Weaknesses:</strong></p>
<ul>
<li>PMI is credit-score-based — poor credit makes PMI expensive.</li>
<li>Higher rates than VA.</li>
<li>Not assumable.</li>
</ul>

<h2>Florida Hometown Heroes Program (Stacks on Top)</h2>
<p>Florida's state-level down-payment assistance for military, teachers, healthcare workers, law enforcement, and firefighters. As of 2026:</p>
<ul>
<li>Up to $35,000 in down-payment and closing-cost assistance as a second mortgage.</li>
<li>Purchase price cap: around $460,000 in Pensacola-area counties (verify at floridahousing.org).</li>
<li>Income caps apply.</li>
<li>Stacks with VA, USDA, FHA, or conventional. The second mortgage is forgiven or deferred depending on program version.</li>
</ul>
<p>Worth applying if you qualify — even for VA buyers who don't need down payment, the closing-cost portion can save $5,000+.</p>

<h2>How to Pick for Your Situation</h2>
<h3>You are 10%+ service-connected disabled</h3>
<p>Take VA. Funding fee waived. Unbeatable total cost.</p>
<h3>You are non-disabled veteran buying in rural Santa Rosa / Milton / Pace</h3>
<p>Compare VA vs USDA carefully. USDA often wins on total cost because of no funding fee. VA wins on max loan amount.</p>
<h3>You are active-duty veteran with 5-year expected hold</h3>
<p>VA wins. The funding fee is a fixed upfront cost amortized over your years of ownership — with disability waiver or long holds, VA is the math winner.</p>
<h3>You are veteran with 580-620 credit and little savings</h3>
<p>VA still wins. VA has no VA-side credit minimum; lenders vary. FHA is a fallback if lender overlays reject you on VA.</p>
<h3>You are civilian first-time buyer, 720+ credit, 3% saved</h3>
<p>Conventional 3% down wins. PMI removes at 80% LTV. Lowest long-run cost.</p>
<h3>You are civilian first-time buyer, 600 credit, 3.5% saved</h3>
<p>FHA. You do not qualify for conventional at that score; VA is not available; USDA requires 640+. FHA's 580 minimum is the path.</p>
<h3>You are buying in a USDA-eligible area and make under USDA income caps</h3>
<p>USDA is often overlooked. Run the numbers — USDA frequently beats VA for non-disabled veterans.</p>

<h2>Common Low-Down Mistakes</h2>
<h3>Taking FHA when VA is available</h3>
<p>Eligible veterans sometimes end up with FHA because their lender is not VA-specialist. Always ask: "am I eligible for VA?"</p>
<h3>Not checking USDA eligibility</h3>
<p>A Pace or Milton home might qualify for USDA even if you are a veteran. Compare both.</p>
<h3>Skipping Hometown Heroes</h3>
<p>Free $35K in closing-cost help going unclaimed every year. Apply if you are in any eligible profession.</p>
<h3>Assuming "zero down = best deal"</h3>
<p>Zero down saves upfront cash but costs more over time in financed fees and higher interest on a larger balance. If you have the down payment, putting it down usually wins long-run math.</p>

<h2>Related Pages</h2>
<ul>
<li><a href="/va-loan-guide">VA Loan Guide</a></li>
<li><a href="/va-funding-fee-2026.html">VA Funding Fee 2026</a></li>
<li><a href="/va-irrrl-guide.html">VA IRRRL Streamline Refi</a></li>
<li><a href="/bah-to-mortgage-guide.html">BAH to Mortgage Guide</a></li>
<li><a href="/first-time-military-homebuyer.html">First-Time Military Homebuyer</a></li>
<li><a href="/disabled-veteran-benefits-florida.html">Disabled Veteran Benefits</a></li>
</ul>

<h2>Sources</h2>
<ul>
<li>VA Pamphlet 26-7 (Lender Handbook) — <a href="https://www.benefits.va.gov/WARMS/pam26_7.asp" target="_blank" rel="noopener">benefits.va.gov</a></li>
<li>USDA Rural Development Single Family Housing Programs — <a href="https://www.rd.usda.gov/programs-services/single-family-housing-programs" target="_blank" rel="noopener">rd.usda.gov</a></li>
<li>USDA eligibility map — eligibility.sc.egov.usda.gov</li>
<li>FHA Single Family Housing Policy Handbook 4000.1 — <a href="https://www.hud.gov" target="_blank" rel="noopener">hud.gov</a></li>
<li>Florida Housing Finance Corporation — Hometown Heroes — <a href="https://www.floridahousing.org" target="_blank" rel="noopener">floridahousing.org</a></li>
</ul>
`,
  },

  // ─────────────────────────────────────────────────────────────────
  // 6. Military Rental Property Management
  // ─────────────────────────────────────────────────────────────────
  {
    slug: "military-rental-property-management",
    title: "Military Rental Property Management Pensacola | PCS Rental | Gregg Costin",
    description: "Converting your PCS home into a rental: VA loan rules, property management vs self-managing, SCRA tenant protections, Florida landlord basics, numbers by neighborhood.",
    keywords: "military rental property Pensacola, PCS rental home, convert home to rental military, VA loan rental, military landlord Florida, Pensacola property management military, self manage PCS rental, SCRA rental",
    h1: "Turning Your Pensacola Home Into a Rental After PCS — The Full Playbook",
    breadcrumbName: "Military Rental Property Management",
    areaServed: "Pensacola",
    knowsAbout: ["Military Landlord", "PCS Rental Property", "VA Loan Rental Conversion", "Property Management Pensacola", "Self-Managing Rental", "SCRA Tenant", "Florida Landlord Law", "Rental Income Qualifying"],
    lead: "You PCS'd, you kept the Pensacola home, and now the mortgage payment clock is ticking. Here is the complete decision tree — property management vs self-managing, VA loan rules after you move out, Florida landlord law in 15 minutes, and the real numbers by neighborhood.",
    faqs: [
      { q: "Can I keep my VA loan after PCSing and renting out the home?", a: "Yes, if you occupied it as primary residence for at least 12 months. VA occupancy certification at purchase carries forward. After you have satisfied the occupancy requirement and PCS, you can convert to rental and keep the VA loan indefinitely. The VA loan stays in place; you just become a landlord." },
      { q: "Do I need to notify the VA or my lender before renting out?", a: "You do not need VA permission. Notify your lender (as a courtesy — required by some servicing agreements) and your homeowners insurance company (required — you need a landlord / dwelling policy, not a homeowner's policy). Do not skip the insurance change — your homeowner's policy will not cover losses when tenants occupy." },
      { q: "Property management or self-manage from out of state?", a: "Property management costs 8-10% of monthly rent in Pensacola. For a $2,200/month rental, that is $176-$220/month. It buys you tenant screening, rent collection, maintenance coordination, lease enforcement, and a local point of contact. For most PCSing families, worth it — especially if you are 1,000+ miles away. Self-managing works if you have local family, a strong maintenance network, and time." },
      { q: "What rent can I charge for my Pensacola home?", a: "Depends on neighborhood, size, and condition. Rough 2026 Pensacola metro guidance: 3 bed / 2 bath newer construction in Pace or Gulf Breeze: $2,100-$2,700. Same in Niceville/Bluewater Bay: $2,400-$3,200. East Pensacola or Cantonment: $1,800-$2,400. I provide a free rental CMA for clients — same comps process as a sales CMA, focused on leased properties." },
      { q: "Can I use rental income to qualify for another VA loan later?", a: "Yes, with limitations. Once you have 12 months of documented rental history on the property, lenders count 75% of gross rental income as qualifying income (the 25% haircut covers vacancy and management). Before 12 months, lenders typically exclude it. This matters when you want to use your remaining VA entitlement on a new home at your next duty station." },
      { q: "Do I have to pay Florida sales tax on rental income?", a: "Florida does not tax rental income on residential long-term leases (6+ months). Short-term rentals (under 6 months, vacation / Airbnb) ARE subject to Florida sales tax and county tourist development taxes — different rules. Most PCS-converted rentals go long-term." },
      { q: "What are the Florida landlord basics I need to know?", a: "Chapter 83 of Florida Statutes governs residential landlord-tenant law. Highlights: security deposits must be held in a Florida banking institution (or posted bond), tenant has right to quiet enjoyment, landlord has 3 days to give notice for non-payment before filing eviction, 7 days for material lease breach. Evictions are fast in Florida compared to other states (2-4 weeks from filing to lockout typically)." },
      { q: "What about SCRA protections for military tenants?", a: "The Servicemembers Civil Relief Act protects active-duty tenants from early lease termination penalties when they receive PCS orders or deploy for 90+ days. As a landlord, if your tenant is active military and provides orders, they can terminate the lease 30 days after next rent cycle with no penalty. Florida Statute 83.682 mirrors these protections. Plan for it." },
    ],
    body: `
<p>The moment your PCS orders drop, you have a decision to make about the Pensacola home. Sell it and take the equity. Rent it and build a small portfolio. Or the middle path — rent temporarily and sell later. Most families I work with default to selling because they have never been landlords. That is often the wrong answer. Here is the full landlord playbook for military families converting a primary residence into a rental.</p>

<h2>The Three-Decision Framework</h2>
<ol>
<li><strong>Is your current home RENTABLE?</strong> Price-to-rent ratio, location, condition, HOA rules.</li>
<li><strong>Can you MANAGE it from afar?</strong> Distance, time, self-manage vs property management.</li>
<li><strong>Does the MATH work?</strong> Cash flow, mortgage payoff, tax depreciation, equity build.</li>
</ol>

<h2>Decision 1 — Is Your Home Rentable?</h2>
<h3>Price-to-rent ratio</h3>
<p>The fastest rent check: divide annual rent by home value. For cash flow, you want above 0.8% (annual rent ÷ value). Pensacola metro 2026:</p>
<ul>
<li>Pace 3/2 worth $325K, rents $2,200/mo ($26,400/yr) → 8.1% annual = very strong cash flow neighborhood.</li>
<li>Gulf Breeze 3/2 worth $475K, rents $2,600/mo ($31,200/yr) → 6.6% annual = decent cash flow, but tighter.</li>
<li>Destin beachside 3/2 worth $750K, rents $3,400/mo long-term ($40,800/yr) → 5.4% = rental math is weaker; short-term rentals (VRBO) are the play in Destin if you can handle it.</li>
</ul>
<h3>Location matters</h3>
<p>Military tenants are a premium segment in Pensacola:</p>
<ul>
<li>Close to base (within 15-25 min commute) = easier to lease.</li>
<li>Gulf Breeze, Pace, Milton for NAS Pensacola families.</li>
<li>Niceville / Bluewater Bay / FWB for Eglin and Hurlburt families.</li>
<li>Crestview for Duke Field.</li>
</ul>
<h3>HOA / deed restrictions</h3>
<p>Some Pensacola-area HOAs restrict rentals — minimum lease terms, annual caps on rented units, or outright bans. Check YOUR HOA bylaws before assuming you can rent. This is the single most commonly missed issue.</p>

<h2>Decision 2 — Management Approach</h2>

<h3>Property Management (the default for most PCS families)</h3>
<p><strong>Cost:</strong> 8-10% of gross monthly rent in Pensacola. Some managers add leasing fees (half to full month's rent when they place a new tenant) and maintenance coordination fees.</p>
<p><strong>What you get:</strong></p>
<ul>
<li>Tenant screening (credit, rental history, employment, criminal background).</li>
<li>Lease signing and enforcement.</li>
<li>Rent collection, direct deposit to your account.</li>
<li>Maintenance coordination — vetted contractors, emergency repairs without your involvement.</li>
<li>Move-in and move-out inspections, security deposit handling per FL law.</li>
<li>Eviction handling if needed.</li>
<li>Year-end 1099s and expense statements for your taxes.</li>
</ul>
<p><strong>When it makes sense:</strong> You are PCSing more than 500 miles away, no local family, no time bandwidth, first-time landlord. For nearly all military PCS families, this is the right call.</p>

<h3>Self-Management</h3>
<p><strong>Cost:</strong> Your time + software ($30-$60/mo for tools like AppFolio, Buildium, or free options like Avail and Zillow Rental Manager).</p>
<p><strong>What you handle:</strong> Listing, showings, screening, lease, rent collection, maintenance calls, tenant communication, eviction if necessary.</p>
<p><strong>When it makes sense:</strong> You are still local (in-state PCS or short commute), have a strong local contractor network, have time, and the rental is simple (single-family home with reasonable tenant quality).</p>

<h3>Hybrid: Tenant-Find Only</h3>
<p>Some Pensacola property managers offer "lease-up only" — they find the tenant, handle screening and lease, then hand off to you for ongoing management. Costs roughly a half-month rent one-time fee. Useful if you are confident managing but want vetted tenants.</p>

<h2>Decision 3 — Does the Math Work?</h2>
<h3>Cash flow math (monthly)</h3>
<pre style="background:var(--panel);border:1px solid var(--hair);padding:1rem;border-radius:6px;color:var(--text);font-size:13px;overflow-x:auto">
Gross rent:              $2,200
- Property mgmt (9%):      -$198
- Vacancy reserve (5%):    -$110
- Maintenance reserve:     -$150
= Net operating income:  $1,742

- PITI payment:          -$1,800  (VA at 5.5% from 2022 on $275K balance)
= Monthly cash flow:       -$58   (slight negative)
</pre>
<p>Many PCS-converted rentals run slightly negative on cash flow in year 1, <strong>AND STILL MAKE MONEY</strong> because:</p>
<ul>
<li>Mortgage principal is paid down by the tenant (~$4,000/year builds equity).</li>
<li>Property appreciates (~3-5%/year historical Pensacola).</li>
<li>Tax depreciation ($8,000-$12,000/year deductible paper loss).</li>
<li>Rent increases over time while PITI stays fixed.</li>
</ul>
<p>Real total return on a $50,000 down-payment equivalent: 10-20%/year when all factors are counted. Even on a negative-cash-flow rental.</p>

<h3>Sell now vs rent 5 years then sell?</h3>
<p>Back-of-napkin comparison on a $325K Pace home with $275K mortgage balance, 5% annual appreciation:</p>
<table>
<thead><tr><th>Action</th><th>5-year outcome</th></tr></thead>
<tbody>
<tr><td>Sell now at $325K</td><td>Net ~$28K in pocket after 7% selling costs (agent, title, concessions). That money grows at market rates — 7% index ≈ $39K after 5 years.</td></tr>
<tr><td>Rent 5 years then sell</td><td>Home appreciates to ~$415K. Mortgage balance down to ~$252K. Net at sale: ~$135K ($163K equity minus 7% selling costs on $415K). Plus 5 years of rental math (depreciation + principal paydown + some cash flow). Far higher total return.</td></tr>
</tbody>
</table>
<p>The rental-then-sell path usually wins by $80,000-$120,000 over 5 years in the current Pensacola market — IF you have the temperament and infrastructure to be a landlord.</p>

<h2>Florida Landlord Law in 15 Minutes</h2>
<p>Florida Chapter 83 (Part II) governs residential tenancies. What you need to know:</p>
<ul>
<li><strong>Security deposits:</strong> No statutory cap in Florida. Typically 1-2 months' rent. Must be held in Florida bank (separate account, non-commingled) or posted surety bond. Return within 15 days if no claim; 30 days with notice if you are making deduction claims.</li>
<li><strong>Lease length:</strong> No minimum. Most rentals are 12-month leases.</li>
<li><strong>Rent increases:</strong> Florida has no statewide rent control. You can raise rent at lease renewal to any amount. Mid-lease increases only per lease terms.</li>
<li><strong>Non-payment eviction:</strong> Serve 3-day notice (F.S. 83.56). If not cured, file eviction complaint. Florida evictions are typically 2-4 weeks from filing to court order to lockout — among the fastest in the country.</li>
<li><strong>Other breach eviction:</strong> 7-day cure notice for material breach (pets, damage, unauthorized occupants).</li>
<li><strong>Notice to terminate at end of term:</strong> Landlord must give 60-day notice to non-renew under month-to-month; 15 days on week-to-week. Lease controls longer-term notice.</li>
<li><strong>Disclosures:</strong> Lead-based paint disclosure (federal, pre-1978 homes). Florida homestead/not-homestead property disclosure in lease.</li>
<li><strong>Military tenant protection (SCRA + F.S. 83.682):</strong> Active-duty tenant with PCS orders or 90+ day deployment can terminate early with 30-day notice after next rent cycle. You cannot waive this in a lease.</li>
</ul>

<h2>Military Tenant Considerations</h2>
<p>If you are renting to a military family (which is common in Pensacola), know:</p>
<ul>
<li>BAH pays reliably. Housing allowance is a separate line item on LES, typically deposited alongside pay. Tenant default rates among military renters are lower than civilian average.</li>
<li>PCS is a routine disruption. Build a "PCS termination" clause that matches SCRA — it is not a negotiation item, it is law.</li>
<li>Deployment may affect lease compliance. A deployed tenant cannot attend walk-through, answer maintenance calls immediately, etc. Accommodate with property management.</li>
<li>Military families often stay 2-3 years (the length of a PCS rotation), better than average civilian tenancy of 18-24 months. Lower turnover = higher total return.</li>
</ul>

<h2>Recordkeeping + Tax Treatment</h2>
<p>Once the home converts to rental:</p>
<ul>
<li>File Schedule E on your 1040 for rental income and expenses.</li>
<li>Depreciate the building portion (not land) over 27.5 years straight-line — roughly $8,000-$12,000/year in deductions on typical Pensacola homes.</li>
<li>Deduct: mortgage interest, property tax, insurance, repairs, depreciation, property management fees, travel to inspect property (1-2 trips/year deductible).</li>
<li>Track: every receipt, mileage to and from the property, property management statements.</li>
<li>At sale: depreciation recapture applies (taxed at 25% max on the depreciated amount), plus regular capital gains on appreciation. Section 121 primary-residence exclusion may still apply if you lived in the home 2 of the last 5 years before sale.</li>
</ul>

<h2>Recommended Pensacola Property Managers</h2>
<p>I do not take referral fees from property managers. These are the ones my clients have used and been satisfied with:</p>
<ul>
<li>Levin Rinke Realty Property Management division (my brokerage — 9% rate, deep Pensacola inventory).</li>
<li>Several independent firms in Gulf Breeze and Pensacola I will introduce you to depending on your property and preferences.</li>
</ul>
<p>Always interview 2-3 managers before signing. Ask about: tenant screening criteria, average days on market, maintenance markup, communication frequency, eviction record.</p>

<h2>When to Sell Instead of Rent</h2>
<ul>
<li>HOA prohibits rentals.</li>
<li>You need the equity for a down payment at your next duty station.</li>
<li>Home has negative cash flow deeply AND no appreciation cushion.</li>
<li>You absolutely do not want to be a landlord (valid — this is a multi-year commitment).</li>
<li>You are separating military service and need to simplify.</li>
</ul>

<h2>Related Pages</h2>
<ul>
<li><a href="/va-loan-guide">VA Loan Guide</a></li>
<li><a href="/va-irrrl-guide.html">VA IRRRL — Refi Your Rental</a></li>
<li><a href="/bah-to-mortgage-guide.html">BAH to Mortgage Guide</a></li>
<li><a href="/pcs-checklist.html">PCS Checklist</a></li>
<li><a href="/co-buying-military-homes.html">Co-Buying Military Homes</a></li>
</ul>

<h2>Sources</h2>
<ul>
<li>Florida Statutes Chapter 83, Part II — Residential Tenancies — <a href="http://www.leg.state.fl.us/statutes/" target="_blank" rel="noopener">leg.state.fl.us</a></li>
<li>Servicemembers Civil Relief Act — 50 USC §3901 et seq.</li>
<li>Florida Statute 83.682 — military tenant lease termination rights</li>
<li>VA Pamphlet 26-7, Chapter 3 — Occupancy Requirements</li>
<li>IRS Publication 527 — Residential Rental Property</li>
</ul>
`,
  },
];

let count = 0;
for (const p of PAGES) {
  const html = renderPage(p);
  writeFileSync(`public/${p.slug}.html`, html, "utf8");
  count++;
  console.log(`wrote public/${p.slug}.html (${Math.round(html.length / 1024)} KB)`);
}
console.log(`\nTotal new topic-gap pages: ${count}`);
