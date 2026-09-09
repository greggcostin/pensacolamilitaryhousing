import {p,note,list,table,worksheet,page} from './schema.mjs';
import {preapproval,productPaths,productFlows,specialistPaths,buyerContract,conditionDecision,underwriting,closing} from './journey-chapters.mjs';
import {flow,handoff,decision,waterfall} from './journey-blocks.mjs';
const part=(key,title,deck,blocks,sources=[])=>({...page(title,deck,blocks,sources),key,kind:'journey',reviewed:'2026-09-08'});
export const guides=[{slug:'investment-property-roadmap',category:'Investing',audience:'civilian',shortTitle:'The investment transaction',title:'Buy the property. Understand the business.',subtitle:'A coastal investment purchase, from financing and use checks to the first operating review.',answer:'Start with investment-specific preapproval or verified cash before searching and touring. Test permitted use, documented revenue, all operating costs and reserves before an offer; then coordinate inspections, financing, title, closing and management.',pages:[
 preapproval(),productPaths(),productFlows(),specialistPaths(),
 part('search','Choose the investment before the address','Define the business you are willing to operate, then search for a property that can support it.',[
 flow('Write the investment brief',[
 ['Use and ownership','Long-term rental, short-term rental, owner-occupied multifamily or another strategy. Tell the lender the real intended use.'],
 ['Capital and liquidity','Set purchase cash, operating reserves, initial work and the amount you can carry during vacancy.'],
 ['Evidence threshold','Decide which documents must support rent, use permission, insurance, condition and expenses before an offer.'],
 ['Exit and management','Plan who operates the property and how you would sell or hold it if the original strategy fails.']]),
 handoff('Before the first tour',[
 ['You + lender','Confirm the investment product, ownership/title structure, qualifying income approach, down payment, reserves and payment terms.'],
 ['Agent + property manager','Narrow the search using property facts and a realistic operating brief. Request comparable rent evidence and management terms.'],
 ['Attorney + tax adviser','Discuss ownership, leases, intended use, liability, reporting and tax treatment for your situation.']
 ],'A second-home loan is not permission to run an unrestricted rental business. Confirm occupancy, insurance and rental terms before selecting a product.')
 ],['jProducts','jRental']),
 part('review','Verify the right to earn the projected income','A rental projection is useful only if the use is permitted and the supporting evidence holds up.',[
 table('The investment evidence file',['Question','What to obtain'],[
 ['Is the use permitted?','Written zoning/licensing guidance for the address, association and lease restrictions, minimum stays and any transfer conditions.'],
 ['Is the revenue credible?','Existing leases, rent roll, actual collections and expense records when available, plus comparable market evidence with dates.'],
 ['What changes at purchase?','Taxes after transfer, insurance for the actual rental use, management fees, permits, association charges and planned work.'],
 ['What obligations transfer?','Leases, deposits, advance bookings, service agreements, equipment obligations and possession terms reviewed by the closing attorney.'],
 ['What is still uncertain?','Seasonality, vacancy, owner use, future assessments, major systems and unavailable records. Model those uncertainties explicitly.']
 ]),
 decision('The rental-use decision','Is your planned use supported by written property-specific evidence?',
 'Yes: proceed to the operating model and contract protections while tracking any remaining approval or transfer requirement.',
 'No or uncertain: get the authority’s or association’s answer. Test a permitted alternative use before relying on rental income.',
 'Do not make the purchase depend on an assumed exception, future rule change or an unsupported promise of bookings.'),
 note('Owner use changes the analysis','Personal use can affect rental economics and tax treatment. Bring the actual intended calendar and ownership arrangement to your tax adviser; this guide does not calculate your tax return.')
 ],['jRental']),
 part('review','Follow the money through a rental','This annual example separates the property’s operations from financing and cash reserves.',[
 waterfall('A hypothetical long-term rental',[
 ['Scheduled annual rent','$36,000'],['Vacancy / collection allowance','− $1,800'],['Operating expenses','− $12,600'],['Net operating income','$21,600'],['Annual debt service','− $18,000'],['Capital reserve contribution','− $2,400'],['Cash remaining before tax','$1,200']
 ],'Teaching inputs only. Operating expenses include assumed taxes, insurance, management, ordinary maintenance and owner-paid charges. No appreciation or tax benefit is assumed.'),
 table('Know which measure answers which question',['Measure','This example'],[
 ['NOI','Effective income less operating expenses: $34,200 − $12,600 = $21,600. Excludes financing and the separately shown capital reserve.'],
 ['Cash before tax','NOI less debt service and capital reserve contribution: $21,600 − $18,000 − $2,400 = $1,200.'],
 ['Coverage ratio, this definition','NOI divided by debt service: $21,600 / $18,000 = 1.20. A DSCR lender may use different definitions and inputs.'],
 ['Cash-on-cash, illustrative','If total invested cash is $100,000, $1,200 / $100,000 = 1.2% before tax under these assumptions.']
 ]),
 note('Avoid counting escrow twice','If you record taxes and insurance in operating expenses, use principal and interest in debt service for this model. Do not subtract a full PITI payment again. Major replacements and depreciation also need separate treatment.')
 ]),
 part('review','Stress-test the deal before the offer','Ask whether you can keep the property through a weaker year without an emergency sale.',[
 table('One change at a time',['Hypothetical change','Annual cash before tax'],[
 ['Original example','$1,200'],['Vacancy allowance rises from $1,800 to $3,600','− $600'],['Operating expenses rise by $2,400','− $1,200'],['Both changes together','− $3,000']
 ],'All other inputs stay fixed. These are calculated scenarios, not probabilities or market forecasts.'),
 handoff('Underwrite the business separately from the loan',[
 ['You','Decide how much negative cash flow, vacancy and a major repair you can fund without depending on appreciation.'],
 ['Manager + specialists','Supply property-specific estimates, leasing assumptions, maintenance scope and an operational startup plan.'],
 ['Lender + tax adviser','Confirm financing terms and the separate tax consequences. Loan approval alone does not establish that an investment is attractive.']
 ],'Choose whether to offer, change the terms, investigate further or walk away based on evidence before the contractual decision deadline.'),
 worksheet('Your investment decision record',['Revenue evidence / date / conservative assumption:','Operating costs / debt service / reserve:','Cash required to buy, repair and operate:','Downside case / acceptable loss / exit plan:'])
 ]),
 buyerContract(),{...conditionDecision(),key:'contract'},underwriting(),closing(),
 part('own','Closing begins the operating chapter','The transaction is complete only when the property can be managed with usable records and clear responsibility.',[
 flow('From possession to an operating review',[
 ['At handoff','Reconcile leases, deposits, booked stays where applicable, keys, meters, insurance, utilities and vendor access.'],
 ['Before occupancy or leasing','Complete required work, permissions and property condition records. Confirm the management agreement and emergency procedure.'],
 ['At the first reporting cycle','Compare actual collections, vacancy and expenses with the original model. Keep personal and property records organized.'],
 ['At each planned review','Refresh reserves, major-system needs, financing and the hold/sell plan using actual performance.']]),
 note('Use qualified advice for the operating rules','Tenant rights, security deposits, short-term-rental permissions, accessibility, licensing and tax reporting depend on the property and use. Assign those questions to the responsible local professional rather than relying on a generic checklist.'),
 worksheet('Your operating handoff',['Manager / emergency contact / reporting date:','Leases and deposits reconciled by:','Initial work / reserve / insurance confirmed:','First actual-versus-budget review / exit review date:'])
 ],['jRental'])]}];
