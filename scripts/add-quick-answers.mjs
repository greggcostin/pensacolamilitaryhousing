// geo-03 rollout: hand-written quick-answer blocks for the pages AI engines cite most. Every
// sentence restates a figure already on that page (its FAQ schema or body), so the block can never
// disagree with the page. Idempotent (re-running replaces the block). Edit the text here, not in
// the HTML. --only <file> previews one page.
//   node scripts/add-quick-answers.mjs [--only public/bah-rates.html]
import { readFileSync, writeFileSync } from "node:fs";
import { placeQuickAnswer } from "./quick-answer-lib.mjs";

const DATE = "September 2026";
const GC_BY = "Gregg Costin, Realtor, The Costin Team at Levin Rinke Realty";
export const QUICK_ANSWERS = {
  "public/bah-rates.html": "2026 BAH for the Pensacola MHA (FL064) with dependents runs from $1,794 for E-1 through E-4 to $2,631 for O-6: an E-5 draws $1,863, an E-6 $2,235 and an O-3 $2,271 a month. The Fort Walton Beach MHA (FL023, covering Eglin AFB, Hurlburt Field and Duke Field) runs $2,340 to $3,642 with dependents, and an E-5 there draws $2,433. DoD sets the rates each December and they took effect January 1, 2026.",
  "public/va-disability-property-tax-florida.html": "A Florida veteran rated 100% permanent and total pays zero ad valorem property tax on a homestead under F.S. 196.081, with no income test. Any service-connected rating of 10% or higher earns a $5,000 assessed-value exemption under F.S. 196.24 on top of the standard homestead exemption. File the VA rating letter with the county property appraiser by March 1 for that tax year.",
  "public/florida-homestead-exemption-military.html": "Active-duty members with Florida as their state of legal residence qualify for the Florida homestead exemption: the first $25,000 off every levy plus up to $25,000 more off non-school levies, and the Save Our Homes cap then holds assessed-value growth to 3% a year or CPI, whichever is lower. The filing deadline is March 1 of the tax year, and there are no retroactive claims.",
  "public/florida-home-insurance-military.html": "Homeowners insurance in Pensacola can run $200 to $750 a month depending on roof age, wind mitigation and flood zone, while a new FORTIFIED home with full mitigation can be as low as $750 a year. Standard HO-3 policies exclude flooding from any source, so most Pensacola buyers carry a separate flood policy, and most carriers require a 4-point inspection on homes 25 years or older.",
  "public/va-funding-fee-2026.html": "The 2026 VA funding fee is 2.15% of the loan on first use with less than 5% down, 1.50% with 5 to 10% down and 1.25% with 10% or more down; subsequent use is 3.30% with less than 5% down. National Guard and Reserve pay the same rates as regular military. The fee is waived entirely for veterans receiving VA disability compensation and is usually financed into the loan.",
  "public/bah-to-mortgage-guide.html": "Lenders count BAH as income and gross it up 1.25 times because it is tax-free, then cap total monthly debts near 41% of that gross with VA residual-income minimums on top, so a 2026 E-5 with dependents at NAS Pensacola ($1,863 BAH) is typically approved for $185,000 to $205,000 with zero down, or about $320,000 to $355,000 with a spouse earning $3,000 a month. Holding the whole payment inside BAH alone is the more conservative anchor, roughly $200,000 to $220,000 on this site's model (6.66% rate, zero down, funding fee financed, Escambia County taxes and inland insurance). An approval is a ceiling, not a target.",
  "public/va-loan-guide.html": "A VA loan in Pensacola needs no down payment and carries no PMI, which saves $150 to $350 a month against a conventional loan, and 2026 VA rates run below conventional rates. The trade-offs are the funding fee of 2.15% to 3.30% unless you are disability-exempt, a VA appraisal that takes 10 to 14 days and enforces Minimum Property Requirements, and a primary-residence requirement.",
  "public/faq.html": "Gregg Costin is a retired USAF Captain and E-3 AWACS Combat Systems Officer with 11 personal PCS moves, licensed in Florida and Alabama with Levin Rinke Realty in Pensacola. The area's installations are NAS Pensacola, NAS Whiting Field, Corry Station and Saufley Field, with Hurlburt Field and Eglin AFB to the east. 2026 BAH with dependents at NAS Pensacola (MHA FL064) is $1,863 for an E-5, $2,235 for an E-6 and $2,271 for an O-3.",
  "public/pensacola-flood-zones-homebuyers.html": "New FEMA flood maps for Escambia County and the City of Pensacola took effect August 19, 2025 and placed some homes in Special Flood Hazard Areas for the first time. Flood insurance is mandatory only when the home sits in a zone starting with A or V and the loan is government-backed, which includes VA loans; in Zone X it is optional, but standard homeowners policies exclude flooding, so many buyers carry it anyway.",
  "public/disabled-veteran-benefits-florida.html": "A service-connected rating of 10% or higher waives the entire VA funding fee, worth $8,600 on a $400,000 zero-down first-use purchase, and earns a $5,000 assessed-value property tax exemption under F.S. 196.24. A 100% permanent and total rating removes Florida property tax on the homestead entirely under F.S. 196.081, and that benefit extends to qualifying surviving spouses.",
  "civilian-site/blog/closing-costs-florida-buyers.html": "Florida buyer closing costs are not one percentage: state documentary stamp tax on the note runs 35 cents per $100 of the loan, and the rest is lender, title and prepaid charges that scale with price. In Escambia, Santa Rosa, Okaloosa and Walton counties the buyer customarily pays for the owner's title policy, the reverse of most of Florida.",
  "civilian-site/blog/fed-rate-hike-what-it-means.html": "The Federal Reserve does not set mortgage rates: a 30-year mortgage is priced off the 10-year Treasury yield and mortgage-backed securities, so mortgage rates can move before the Fed does. As of September 1, 2026, CME FedWatch put the odds of a hike at the next meeting near two thirds, up from about 40 percent in late August.",
  "civilian-site/blog/property-taxes-escambia-santa-rosa.html": "A Florida TRIM notice is a proposal, not a bill: it lists market value, assessed value, exemptions and each taxing authority's proposed millage. Your bill will not match the seller's because the county reassesses at market value on the January 1 after your purchase, which resets the previous owner's Save Our Homes savings. File for homestead by March 1 to start your own 3% cap.",
  "civilian-site/blog/what-moves-mortgage-rates.html": "Mortgage rates are set in the bond market, chiefly by the 10-year Treasury yield and mortgage-backed securities, not by the Federal Reserve's overnight rate. Most buyers lock once they are under contract, choosing a 30- to 60-day lock that covers the closing date with a few days of cushion.",
};

const onlyIdx = process.argv.indexOf("--only");
const ONLY = onlyIdx > -1 ? process.argv[onlyIdx + 1].split("\\").join("/") : null;
let done = 0;
for (const [file, text] of Object.entries(QUICK_ANSWERS)) {
  if (ONLY && file !== ONLY) continue;
  if (/[\u2014]/.test(text)) throw new Error(`em dash in quick answer for ${file}`);
  const html = readFileSync(file, "utf8");
  const out = placeQuickAnswer(html, { text, date: DATE, by: file.startsWith("civilian-site") ? GC_BY : undefined });
  if (!out) { console.log(`${file}: no insertion point`); continue; }
  if (out !== html) { writeFileSync(file, out); done++; }
}
console.log(`quick answers: ${done} pages written${ONLY ? " (only)" : ""}`);
