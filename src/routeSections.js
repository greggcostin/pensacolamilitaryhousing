// Crawler-visible body copy for the SPA hub shells (audit 2026-09-02, idx-04: /about, /contact,
// /communities and /mortgage-calculators were 110-135 word shells to any crawler that does not run
// React). Each route gets 3-5 sections that mirror the H2s the React page renders, plus a link
// block. Rendered by scripts/postbuild-spa-routes.mjs into dist/<file>.html. Plain data, no JSX.
// Keep facts in sync with src/App.jsx (AboutPage, ContactPage, LoanCalculator, NeighborhoodsPage).
import { IDENTITY as I } from './entityData.js';
import { BIOGRAPHY } from './biography.js';

export const ROUTE_SECTIONS = {
  about: [
    { h2: "Education and relocation experience", text: [BIOGRAPHY.qualifications, BIOGRAPHY.militaryPurpose,
      "PensacolaMilitaryHousing.com focuses on military relocation resources. Gregg's primary professional website, GreggCostin.com, serves buyers and sellers throughout Pensacola, the Emerald Coast and coastal Alabama.",
    ] },
    { h2: "My Story: From Global Strategy to Local Real Estate Excellence", text: [
      "I completed a full U.S. Air Force career, starting as a prior-enlisted Staff Sergeant and retiring as a Captain and E-3 AWACS Combat Systems Officer. Along the way my family and I made 11 PCS moves, so I know what it is like to house-hunt from a different time zone, sign on a home you have seen only on video, and report for duty two days after the moving truck leaves.",
      `Today I am a Florida- and Alabama-licensed Realtor with ${I.brokerage.name} at ${I.addressLine}. Military families are the reason this site exists: every guide, calculator and community page here is written for someone holding orders to NAS Pensacola, Corry Station, Saufley Field, NAS Whiting Field, Hurlburt Field, Eglin AFB or Duke Field.`,
    ] },
    { h2: "Forged by Military Discipline", text: [
      "Mission planning translates directly to a home search. You get a written plan tied to your report date, a short list built around commute, BAH fit, schools and flood risk, and a negotiation run on data rather than emotion. I answer texts and calls, I show up on time, and I tell you when a house is wrong for you even when it would be an easy sale.",
    ] },
    { h2: "The Gregg Costin Team Promise", text: [
      "Response within two hours during business hours. Video walk-throughs for buyers who cannot fly in. A VA loan lender bench that closes on time. A written PCS timeline with 60-, 30- and 7-day milestones. And no pressure: if the right move is to rent for a year or to keep your current house and lease it out, that is what I will tell you.",
    ] },
    { h2: "Credentials and Recognition", text: [
      "Military Relocation Professional (MRP), Accredited Buyer's Representative (ABR) and Real Estate Negotiation Expert (RENE) designations. Licensed in Florida and Alabama, which matters on the western edge of our market where Perdido Key runs into Orange Beach and Gulf Shores. Reviews from military clients are collected on the reviews page, and the civilian side of the practice, The Costin Team, is at greggcostin.com.",
    ] },
  ],
  contact: [
    { h2: "Send a Message", text: [
      "Tell me your duty station, your report date, whether you are buying, selling or renting, and your pay grade if you want a BAH-based price band. That is enough for me to send back a first plan. Text is the fastest channel; email works for documents and longer questions.",
    ] },
    { h2: "Response Time", text: [
      "I respond to every inquiry within two hours during business hours. If you are calling from an overseas time zone, send a text with a good window and I will schedule around it.",
    ] },
    { h2: "Office", text: [
      `${I.brokerage.name}, ${I.addressLine}, in downtown Pensacola near the county courthouse. Meetings in person, by phone or by video call. Licensed in Florida and Alabama. Contact hours: ${I.contactHours.label}.`,
    ] },
    { h2: "Before You Reach Out", text: [
      "The PCS guide, the 2026 BAH tables and the VA loan guide answer the questions I hear most on a first call. Reading them first is not required, but it usually turns the first conversation into a plan rather than an overview.",
    ] },
  ],
  communities: [
    { h2: "How to Choose a Community on Military Orders", text: [
      "Compare the installation and gate you will use, your total monthly budget, school attendance boundaries and the property's flood and insurance information. The community guides help you build a shortlist. Published area estimates do not replace an address-specific route check, school assignment confirmation or insurance quote.",
      "The Pensacola MHA (FL064) covers NAS Pensacola, Corry Station, Saufley Field and NAS Whiting Field. The Eglin AFB MHA (FL056) covers Eglin AFB, Hurlburt Field and Duke Field. Check the official duty ZIP, pay grade and dependency status before using the BAH tables to plan your budget.",
    ] },
    { h2: "Need Help Choosing?", text: [
      "Send me your duty station, report date and pay grade and I will narrow the list to three communities and explain the trade-offs in plain language. Call or text (850) 266-5005.",
    ] },
  ],
  "mortgage-calculators": [
    { h2: "Loan Calculator: VA, FHA and Conventional", text: [
      "The calculator on this page models a VA loan with zero down, an FHA loan with 3.5% down and a conventional loan with 5% to 20% down, using 2026 Pensacola-area defaults for price, rate, taxes and insurance. Every input is editable. The VA line includes the funding fee, financed into the loan, so the payments compare honestly.",
    ] },
    { h2: "How the VA Funding Fee Changes the Payment", text: [
      "The VA funding fee is 2.15% of the loan on first use with less than 5% down and 3.30% on subsequent use. It is waived entirely for veterans receiving VA disability compensation, for surviving spouses receiving DIC, and for Purple Heart recipients on active duty. On a $250,000 loan the first-use fee is $5,375, or about $34 a month over 30 years, so the waiver is worth checking before you assume the conventional loan is cheaper.",
    ] },
    { h2: "Matching a Price to Your 2026 BAH", text: [
      "Use your actual duty location, pay grade and dependency status to look up BAH, then compare it with the estimated loan payment, property taxes, insurance and association costs. Change the calculator inputs for the property and financing you are considering. A BAH amount by itself does not establish a purchase price or loan approval. The BAH-to-mortgage guide compares actual-income scenarios, and the BAH rates page includes a property-cost worksheet.",
    ] },
    { h2: "Estimates Only: Confirm With a Lender", text: [
      "These calculators do not pull credit, verify income or price your insurance. A lender's pre-approval and an insurance quote on the specific address are the two documents that turn an estimate into a budget. I can introduce you to VA-experienced lenders who close on the Emerald Coast every week.",
    ] },
  ],
};

// Crawlable link blocks per shell. Labels are what the reader sees; keep them descriptive.
export const ROUTE_LINKS = {
  about: [
    ["Client reviews from military families", "/reviews"],
    ["Book a PCS strategy call", "/book-pcs-call"],
    ["Frequently asked questions", "/faq"],
    ["Why a military relocation Realtor in Pensacola", "/military-realtor-pensacola"],
    ["The Costin Team civilian site (greggcostin.com)", "https://greggcostin.com/"],
  ],
  contact: [
    ["Book a PCS strategy call on the calendar", "/book-pcs-call"],
    ["PCS guide: bases, BAH, timeline", "/pcs-guide"],
    ["2026 BAH rates: Pensacola and Fort Walton Beach", "/bah-rates"],
    ["VA loan guide", "/va-loan-guide"],
    ["Frequently asked questions", "/faq"],
  ],
  communities: [
    ["Best neighborhoods by rank and BAH", "/blog/best-pensacola-neighborhoods-by-rank-bah"],
    ["School finder: map, private schools and individual guides", "/schools"],
    ["School zones for military families", "/school-zones-military-families"],
    ["Pensacola flood zones for homebuyers", "/pensacola-flood-zones-homebuyers"],
    ["BAH vs. the cost of owning, by ZIP", "/bah-vs-cost-of-owning-pensacola"],
    ["Gulf Breeze vs. Navarre", "/gulf-breeze-vs-navarre"],
    ["Niceville vs. Crestview", "/niceville-vs-crestview"],
  ],
  "mortgage-calculators": [
    ["2026 BAH rates: Pensacola and Fort Walton Beach", "/bah-rates"],
    ["BAH-to-mortgage guide: rank-by-rank price bands", "/bah-to-mortgage-guide"],
    ["VA funding fee 2026", "/va-funding-fee-2026"],
    ["VA loan guide", "/va-loan-guide"],
    ["Zero-down home loans", "/zero-down-home-loans"],
    ["Assumable VA loans in Pensacola", "/assumable-va-loans-pensacola"],
  ],
  "pcs-guide": [
    ["School finder: compare schools near your next home", "/schools"],
    ["Selling your house before a PCS (rent-or-sell calculator)", "/rent-or-sell-pcs-pensacola"],
    ["Got a cash offer? What investors really pay", "/cash-offer-pensacola"],
    ["PCS checklist: 60 / 30 / 7-day timeline", "/pcs-checklist"],
    ["2026 BAH rates: Pensacola and Fort Walton Beach", "/bah-rates"],
    ["Assumable VA loans in Pensacola", "/assumable-va-loans-pensacola"],
    ["School zones for military families", "/school-zones-military-families"],
    ["PCS schools by base", "/pcs-schools-by-base"],
  ],
};

export const BASE_LINKS = [
  ["NAS Pensacola", "/bases/nas-pensacola"],
  ["NTTC Corry Station", "/bases/corry-station"],
  ["Saufley Field", "/bases/saufley-field"],
  ["NAS Whiting Field", "/bases/whiting-field"],
  ["Hurlburt Field", "/bases/hurlburt-field"],
  ["Eglin AFB", "/bases/eglin-afb"],
  ["Duke Field", "/bases/duke-field"],
];
