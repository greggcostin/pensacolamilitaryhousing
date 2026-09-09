// Shared reader-facing answers and navigation. React and static HTML use the same copy.
// Preserve Gregg's #1 positioning. Planning guidance never promises a lender approval or benefit.
import { IDENTITY as I } from './entityData.js';
export const PCS_HERO = {
  title: I.positioning.slice(0, I.positioning.indexOf(' military')),
  emphasis: I.positioning.slice(I.positioning.indexOf(' military') + 1),
  intro: `I'm ${I.name}, a retired ${I.military.branch} ${I.military.rank}, ${I.military.role} and Realtor licensed in Florida and Alabama. After ${I.military.personalPcsMoves} personal PCS moves, I help you compare your base, housing allowance, commute and total monthly cost before choosing where to live.`,
};

export const PCS_DECISIONS = {
  id: 'pcs-decisions', title: 'Where should your PCS home search start?',
  intro: 'Start with the installation on your orders, then work through the housing decision. Each guide below answers a different part of the move.',
  cards: [
    { title: 'Which installation are you reporting to?',
      text: 'Use the guide for your actual duty station. NAS Pensacola, Corry Station, Saufley Field and Whiting Field are in the Pensacola housing area. Eglin AFB, Hurlburt Field and Duke Field use the Eglin housing area. Verify your duty ZIP and eligibility with the official BAH lookup.',
      links: [['NAS Pensacola', '/bases/nas-pensacola'], ['Corry Station', '/bases/corry-station'], ['Saufley Field', '/bases/saufley-field'], ['Whiting Field', '/bases/whiting-field'], ['Eglin AFB', '/bases/eglin-afb'], ['Hurlburt Field', '/bases/hurlburt-field'], ['Duke Field', '/bases/duke-field'], ['Official BAH lookup', 'https://www.travel.dod.mil/Allowances/Basic-Allowance-for-Housing/BAH-Rate-Lookup/']] },
    { title: 'How much home fits your monthly budget?',
      text: 'Start with your 2026 allowance, then include principal, interest, taxes, insurance, association costs and a maintenance reserve. A BAH-based scenario is a planning estimate. Your lender evaluates income, debts, entitlement and the property before approving a loan.',
      links: [['2026 BAH tables', '/bah-rates'], ['Compare mortgage payments', '/mortgage-calculators'], ['BAH-to-price assumptions', '/bah-to-mortgage-guide']] },
    { title: 'Can you buy before arriving?',
      text: 'A remote purchase may be possible with video tours, independent inspections and a closing process approved by your lender and title company. Confirm occupancy requirements and any power of attorney early. Keep a lodging backup if the closing or household-goods delivery moves.',
      links: [['Remote homebuying guide', '/buying-sight-unseen-pcs-pensacola'], ['VA loan guide', '/va-loan-guide'], ['PCS timeline', '/pcs-checklist']] },
    { title: 'How long will temporary lodging be reimbursed?',
      text: 'TLE may cover up to 21 days for an eligible move to a CONUS duty station, subject to the Joint Travel Regulations. TLA concerns eligible temporary lodging outside CONUS; TLF describes lodging facilities. Confirm your entitlement with finance. A reservation or delayed home closing does not establish reimbursement eligibility.',
      links: [['Official TLE rules and exceptions', 'https://www.travel.dod.mil/Support/ALL-FAQs/Article/3174593/temporary-lodging-expenses/'], ['Official TLA guidance', 'https://www.travel.dod.mil/Allowances/Temporary-Lodging-Allowance/']] },
    { title: 'Should you rent, buy, or sell before the next move?',
      text: 'Compare the length of your assignment, cash reserves, transaction costs and the work of owning a home from a distance. If you already own, model both net sale proceeds and rental cash flow, including vacancy, repairs and management.',
      links: [['Rent or sell when you PCS', '/rent-or-sell-pcs-pensacola'], ['Renting on BAH', '/renting-on-bah-pensacola'], ['Plan your PCS with Gregg', '/contact']] },
  ],
};

export const CIVILIAN_BUY_DECISIONS = {
  id: 'coast-buyer-decisions', title: 'Buying along the coast: the decisions to make first',
  intro: 'A home in Pensacola, Navarre, Destin or coastal Alabama calls for an address-specific plan. Use these guides to compare the full cost and the purchase process.',
  cards: [
    { title: 'What will this home cost each month?', text: 'Compare the loan payment with property taxes after purchase, homeowners and flood insurance, association fees and maintenance. Florida and Alabama properties can have different tax and ownership considerations. Use quotes and documents for the specific home.', links: [['Compare total ownership costs', '/resources/coastal-ownership-costs'], ['Florida buyer property taxes', '/resources/florida-homestead-exemption#buyer-tax-after-purchase'], ['Florida home insurance', '/resources/florida-home-insurance']] },
    { title: 'Which part of the coast should you explore?', text: 'Start with the places that fit your destinations and property needs, then verify the daily drive and school assignment for each address. These area guides help you compare housing, costs and practical questions across the state line.', links: [['Pensacola', '/neighborhoods/east-hill-downtown'], ['Pace and Milton', '/neighborhoods/pace-milton'], ['Navarre', '/neighborhoods/navarre'], ['Fort Walton Beach', '/neighborhoods/fort-walton-beach'], ['Destin', '/neighborhoods/destin'], ['Gulf Shores and Orange Beach', '/gulf-shores-orange-beach']] },
    { title: 'What changes for a condo, beach home or remote purchase?', text: 'Review association documents, insurance, assessments and use restrictions before committing. A Pensacola Beach property also needs a review of its actual title and lease documents. For a remote purchase, agree on tours, inspections and signing arrangements before choosing a closing date.', links: [['Condo due diligence', '/resources/condo-due-diligence'], ['Pensacola Beach ownership', '/resources/pensacola-beach-leasehold'], ['Buyer transaction timeline', '/resources/buyer-transaction-timeline'], ['Start your buying plan', '/contact']] },
  ],
};

export const CIVILIAN_SELL_DECISIONS = {
  id: 'coast-seller-decisions', title: 'Selling along the coast: price, preparation and proceeds',
  intro: 'Build the sale around the property, the current competition and what you need for your next move.',
  cards: [
    { title: 'How much will you keep after the sale?', text: 'Compare possible sale prices after loan payoff, negotiated transaction costs, taxes, concessions and preparation expenses. The result is a planning estimate; your title company provides the transaction-specific settlement figures.', links: [['Seller net proceeds worksheet', '/resources/seller-net-proceeds'], ['Seller transaction timeline', '/resources/seller-transaction-timeline']] },
    { title: 'What makes a coastal listing ready to market?', text: 'Gather roof, repair, insurance and association records early. Pair the property condition with recent comparable sales and competing listings. Buyers need clear information about costs and restrictions alongside strong photography and a showing plan.', links: [['Condo document checklist', '/resources/condo-due-diligence'], ['Ownership-cost worksheet', '/resources/coastal-ownership-costs'], ['Printable seller guides', '/resources/client-guides']] },
    { title: 'Are you selling because of military orders?', text: 'Plan backward from your move date and compare selling with holding the property. If you are considering an assumption, have the servicer confirm the process and your entitlement implications before you rely on it in the sale plan.', links: [['PCS rent-or-sell guide', 'https://pensacolamilitaryhousing.com/rent-or-sell-pcs-pensacola'], ['VA assumption guide', 'https://pensacolamilitaryhousing.com/assumable-va-loans-pensacola'], ['Discuss your selling plan', '/contact']] },
  ],
};
