// Print presentation is deliberately separate from reviewed factual copy.
// Every selected image was eye-tested. Accessible descriptions follow the source.
// Client guides use only imagery that does not require a visible credit.
import {covers,coverImages} from './covers.mjs';
export const DESIGN_VERSION='editorial-6';
export const brandLogos={team:{path:'public/images/logo-08.png',asset:'costin-team-logo.png',alt:'The Costin Team'},brokerage:{path:'civilian-site/images/logo-lrr.png',asset:'levin-rinke-realty-logo.png',alt:'Levin Rinke Realty'}};
export const images={
 ...coverImages,
 oaks:{path:'civilian-site/images/cordova-park.jpg',caption:'Oak canopy in Cordova Park, Pensacola.',credit:'The Costin Team',license:'Owner photography',creditRequired:false},
 house:{path:'civilian-site/images/guide-beachfront-home.jpg',caption:'A beachfront home with broad balconies and palms. Illustrative coastal architecture, not a local listing.',ledger:'civilian-site/images/guide-beachfront-home.jpg'},
 alys:{path:'civilian-site/images/guide-alys-architecture.jpg',caption:'White coastal architecture in Alys Beach, Florida. Area photograph, not a current listing.',ledger:'civilian-site/images/guide-alys-architecture.jpg'},
 waves:{path:'civilian-site/images/guide-pensacola-surf.jpg',caption:'Waves washing onto white sand in Pensacola, Florida.',ledger:'civilian-site/images/guide-pensacola-surf.jpg'},
 bridge:{path:'civilian-site/images/three-mile-bridge.jpg',caption:'Pensacola Bay Bridge, looking north. Archival area photograph.',ledger:'civilian-site/images/three-mile-bridge.jpg'},
 shutters:{path:'civilian-site/images/storm-shutters.jpg',caption:'Storm shutters on a Texas home. An illustration of storm preparation.',ledger:'civilian-site/images/storm-shutters.jpg'},
 keys:{path:'civilian-site/images/guide-door-keys.jpg',caption:'Keys in an open door. An illustrative detail, not a client transaction.',ledger:'civilian-site/images/guide-door-keys.jpg'},
 panama:{path:'content/client-guides/photography/guide-panama-city.jpg',caption:'St. Andrews Bay harbor entrance, Panama City. Archival area photograph.',ledger:'content/client-guides/photography/guide-panama-city.jpg'},
 nas:{path:'public/images/bases/nas-pensacola.jpg',caption:'The Blue Angels over NAS Pensacola.',credit:'U.S. Navy',license:'Public domain',creditRequired:false,url:'https://pensacolamilitaryhousing.com/bases/nas-pensacola'},
 corry:{path:'public/images/bases/corry-station.jpg',caption:'Information-warfare training at Corry Station.',credit:'U.S. Navy',license:'Public domain',creditRequired:false,url:'https://pensacolamilitaryhousing.com/bases/corry-station'},
 saufley:{path:'public/images/bases/saufley-field.jpg',caption:'Information-warfare training in the NAS Pensacola complex. U.S. Navy archive; not a Saufley building photograph.',credit:'U.S. Navy',license:'Public domain',creditRequired:false,url:'https://pensacolamilitaryhousing.com/bases/saufley-field'},
 whiting:{path:'public/images/bases/nas-whiting-field.jpg',caption:'NAS Whiting Field from above.',credit:'U.S. Navy',license:'Public domain',creditRequired:false,url:'https://cnrse.cnic.navy.mil/Installations/NAS-Jacksonville/About/History/Aircraft-Photos/1950s/igphoto/2003012726/'},
 eglin:{path:'public/images/bases/eglin-afb.jpg',caption:'F-15EX Eagle IIs associated with Eglin AFB.',credit:'U.S. Air Force',license:'Public domain',creditRequired:false,url:'https://www.af.mil/News/Photos/?igtag=Eglin+AFB'},
 hurlburt:{path:'public/images/bases/hurlburt-field.jpg',caption:'An aircraft at Hurlburt Field.',credit:'U.S. Air Force',license:'Public domain',creditRequired:false,url:'https://pensacolamilitaryhousing.com/bases/hurlburt-field'},
 duke:{path:'public/images/bases/duke-field.jpg',caption:'C-145A aircraft at Duke Field.',credit:'U.S. Air Force',license:'Public domain',creditRequired:false,url:'https://pensacolamilitaryhousing.com/bases/duke-field'},
 osprey:{path:'public/images/blog/hurlburt-mv22-coast.jpg',caption:'An MV-22 over the coast near Hurlburt Field. Archival photograph.',ledger:'/images/blog/hurlburt-mv22-coast.jpg'},
 portrait:{path:'civilian-site/images/gregg-courthouse.jpg',caption:'Gregg Costin on the Escambia County Courthouse steps in Pensacola.',credit:'The Costin Team',license:'Owner photography',creditRequired:false}
};
const profile=(cover,title,deck,takeaways,palette='coast')=>({cover,title,deck,takeaways,palette});
export const profiles={
 'preapproval-first':profile('house','Preapproval.\nThen the house hunt.','Know your payment. Prepare the file. Shop with a plan.',[['Budget','Choose the payment that works for your household.'],['Evidence','Find out what the lender has actually reviewed.'],['Conditions','Know what still needs to happen before closing.']]),
 'buyer-transaction-roadmap':profile('oaks','Your path\nto the keys.','The buyer transaction, from the first conversation to possession.',[['Prepare','Budget, lender review and your search plan.'],['Investigate','Contract dates, property condition and the numbers.'],['Close','Final checks, funding, possession and your records.']]),
 'mortgage-preapproval-to-closing':profile('bridge','The mortgage,\nstep by step.','What your lender needs, when it matters, and what comes next.',[['Apply','Compare lenders using consistent assumptions.'],['Document','Keep income, assets and property evidence complete.'],['Confirm','Review the final terms before signing and funding.']]),
 'seller-transaction-roadmap':profile('house','Your home sale,\nstep by step.','Preparation, offers, negotiations and the closing handoff.',[['Prepare','Set the timing, price strategy and property plan.'],['Compare','Read each offer as a complete package.'],['Deliver','Track obligations through proceeds and possession.']],'clay'),
 'seller-net-proceeds':profile('keys','What will\nyou keep?','A seller’s working guide to proceeds and next-move cash.',[['Start','Use the sale price and a current payoff.'],['Subtract','Account for negotiated charges, credits and repairs.'],['Plan','Keep closing proceeds separate from next-move costs.']],'clay'),
 'florida-property-tax-after-purchase':profile('alys','The tax bill\nafter you buy.','A Florida buyer’s guide to reassessment, exemptions and escrow.',[['Reset','The seller’s assessed value may not be your value.'],['Estimate','Use the parcel, tax year and buyer circumstances.'],['Apply','Confirm homestead, portability and deadlines.']]),
 'alabama-florida-ownership-costs':profile('waves','Two states.\nThe whole cost.','Compare coastal Alabama and Florida one property at a time.',[['Normalize','Use the same financing and ownership assumptions.'],['Price','Include taxes, coverage, dues and maintenance.'],['Stress-test','Compare reserves, future costs and the exit.']]),
 'pensacola-beach-leasehold-due-diligence':profile('waves','The home, the land.\nThe lease.','What to review before a Pensacola Beach leasehold purchase.',[['Read','Obtain the lease and every amendment.'],['Confirm','Resolve the transfer, lender and title requirements.'],['Price','Count fees, obligations and the remaining term.']]),
 'gulf-coast-condo-due-diligence':profile('alys','Beyond\nthe front door.','A Gulf Coast buyer’s guide to the building behind the condo.',[['Building','Read inspections, budgets and reserve information.'],['Obligations','Price assessments, coverage and restrictions.'],['Decision','Match the building, lender and your intended use.']]),
 'coastal-insurance-and-flood':profile('shutters','Know your\ncoverage.','Premiums, deductibles and flood protection for a coastal home.',[['Quote','Start with the actual address and property condition.'],['Read','Compare limits, exclusions and deductible bases.'],['Prepare','Know the cash needed after a covered loss.']],'clay'),
 'inspection-to-repair-decision':profile('house','From findings\nto a decision.','A practical guide to inspections, repair requests and follow-through.',[['Investigate','Order the reviews the property calls for.'],['Prioritize','Separate safety, cost, timing and uncertainty.'],['Resolve','Document the agreement and verify completion.']]),
 'investment-property-roadmap':profile('house','The property.\nThe business.','A coastal investment purchase, from capital and use checks to operations.',[['Finance','Verify the actual investment product before tours.'],['Investigate','Test permitted use, income, expenses and reserves.'],['Operate','Close with a documented handoff and review real results.']]),
 'va-loan-insider-guide':profile('oaks','Your VA benefit,\nunderstood.','Eligibility, funding fees, cash to close and the numbers behind the loan.',[['Qualify','Separate eligibility, entitlement and lender approval.'],['Calculate','Understand the fee, payment and remaining income.'],['Protect','Review the property, cash plan and future use.']],'navy'),
 'va-loan-assumption-guide':profile('bridge','The rate is\nonly the start.','The equity gap, remaining term and approvals behind a VA assumption.',[['Compare','Use the remaining balance and remaining term.'],['Fund','Identify the equity gap and closing funds.'],['Protect','Resolve liability and entitlement separately.']],'navy')
};
const pcsCovers={'nas-pensacola':'nas','corry-station':'corry','saufley-field':'oaks','nas-whiting-field':'whiting','eglin-afb':'eglin','hurlburt-field':'hurlburt','duke-field':'duke','tyndall-afb':'panama','nsa-panama-city':'panama'};
export function artFor(g){
 if(!covers[g.slug])throw new Error('Choose and review a distinct cover for '+g.slug);
 if(profiles[g.slug])return {...profiles[g.slug],cover:covers[g.slug]};
 const base=g.slug.replace(/^pcs-/,'');
 return profile(covers[g.slug],g.shortTitle.replace(' PCS','')+'\nYour PCS guide.','Housing, official BAH, moving-day logistics and the first month.',[['Confirm','Orders, sponsor, reporting location and housing eligibility.'],['Compare','Actual work routes and complete housing costs.'],['Arrive','Keep documents, cash and your fallback plan ready.']],'navy');
}
export function chapterPhoto(g,p,i){
 const title=p.title.toLowerCase();
 if(/bah:|worksheet|workbook|conversation sheet|control sheet|decision record|readiness sheet|deadline and proceeds|funding-fee table|fee changes|turn a price|worked proceeds|lower price|remaining payment|equity gap|debt ratio|percentage deductible/.test(title))return null;
 if(/storm|insurance|flood|coverage|deductible/.test(title))return 'shutters';
 if(/calendar|arrival|goods|travel/.test(title))return 'bridge';
 if(/route|places/.test(title))return g.slug.includes('panama')||g.slug.includes('tyndall')?'panama':'bridge';
 if(/lease/.test(title))return 'waves';
 if(/tax|homestead|portability|disclosure/.test(title))return 'alys';
 if(/proceeds|closing day|handoff|after closing/.test(title))return 'keys';
 if(/installation brief/.test(title))return g.slug.includes('whiting')?'whiting':g.slug.includes('eglin')?'eglin':g.slug.includes('hurlburt')?'osprey':'nas';
 return ['oaks','alys','bridge','house','waves'][i%5];
}
