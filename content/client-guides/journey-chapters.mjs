import {p,note,list,table,worksheet,page} from './schema.mjs';
import {flow,handoff,decision,diagram,waterfall,routes} from './journey-blocks.mjs';
const chapter=(key,title,deck,blocks,sources=[])=>({...page(title,deck,blocks,sources),key,kind:'journey',reviewed:'2026-09-08'});
export const preapproval=()=>chapter('prepare','First: preapproval. Then: the home search.','Before we book tours, turn a possible purchase into a budget that works in real life.',[
 flow('The order that protects your options',[
 ['1. Set a comfortable payment','Include taxes after purchase, insurance, association dues, maintenance and the reserve you will keep.'],
 ['2. Ask the lender to verify the file','Use a secure application and complete income, asset and credit documents. Ask what has actually been reviewed.'],
 ['3. Agree on the search brief','Match price, property type, closing cash and timing to the lender’s conditions and your household budget.'],
 ['4. Begin searching and touring','Look at homes you can realistically pursue, then refresh the property-specific figures before each offer.']]),
 handoff('What happens before the first tour',[
 ['You','Explain your move, income changes and source of closing money. Choose your comfort limit, even if approval is higher.'],
 ['Loan officer + lender','Review documentation, identify conditions and discuss eligible products. Only the lender decides whether it can approve the loan.'],
 ['Your agent','Turn the agreed payment and cash limits into a property brief. Flag condos, leaseholds, major repairs or an assumption for lender review.']
 ],'Ready to search: a conditional letter, a written payment/cash scenario, an expiration date and a list of outstanding requirements.'),
 note('Why this is critical','Early review exposes documentation problems while time is flexible, prevents tours above your comfortable payment, tests whether your chosen property type fits the loan, and makes an offer’s financing terms more credible. It does not guarantee approval or reserve an interest rate.')
 ],['jPreapproval','jProducts']);

export const productPaths=()=>chapter('prepare','Choose the route your financing requires','Use this decision map with your loan officer before choosing which homes to tour.',[
 flow('Start with the money and the intended use',[
 ['Financing a purchase?','Get product-specific preapproval first. Tell the lender whether this is your home, a second home or an investment.'],
 ['Taking over an existing loan?','Ask the servicer for its assumption process and borrower review. Confirm the equity gap and seller protections before committing.'],
 ['Buying with cash?','Verify accessible funds, ownership of the money and settlement timing before touring. Keep independent property and title reviews.']]),
 table('The route changes the work',['Route','Add this checkpoint to the timeline'],[
 ['Conventional / jumbo','Confirm the intended occupancy, reserve and documentation rules, mortgage insurance if applicable, and property or condo eligibility. Jumbo requirements vary by lender.'],
 ['FHA','Ask about mortgage insurance, FHA property requirements and whether repairs must be completed before funding. A purchase appraisal does not replace an inspection.'],
 ['VA','Confirm COE and entitlement, lender qualification, funding-fee treatment, occupancy and VA property review. Include the required VA contract protection.'],
 ['USDA','Screen household income and the address for program eligibility early. This program is for an eligible primary residence; coordinate lender and USDA review.']
 ]),
 note('Program choice is not a promise of speed','Your actual lender supplies the document list and achievable dates. A financing switch can change cash needs, property requirements, disclosures and the signed contract. Reconfirm those effects before agreeing to a change.')
 ],['jProducts','jVa','jUsda']);

export const specialistPaths=()=>chapter('prepare','When the standard purchase path changes','Renovations, investment use and a second transaction add decisions before the normal closing sequence.',[
 flow('Renovation loan: add a construction track',[
 ['Before the offer','Ask a lender that offers the product whether the property and proposed work fit.'],
 ['Before loan approval','Develop the scope, contractor documents, bids and required contingency or consultant review with the lender.'],
 ['At purchase closing','Confirm the approved repair escrow and the rules for access, draws and occupancy.'],
 ['After purchase','Complete work, inspections and draw documentation under the loan agreement. Purchase closing is not the end of this route.']]),
 handoff('Investment financing: declare the use first',[
 ['You + property manager','Provide a realistic rental plan, documented rent evidence, expenses, vacancy assumptions and reserves. Verify that the intended use is permitted.'],
 ['Lender','Confirm investment occupancy, personal or rental-income underwriting, title/entity rules, cash requirements and any prepayment terms.'],
 ['Agent + closing attorney','Coordinate contract protections and ownership documents. Do not promise that a later entity transfer or rental plan is permitted by the loan.']
 ],'Ask a DSCR lender for its actual rent, expense, payment and coverage calculation. A lender’s rental test is not the same as your household cash-flow analysis.'),
 note('Selling before buying, or building new?','A sale contingency adds a second contract and proceeds handoff. New construction adds builder deadlines, selections, completion and inspection milestones. Put those dependencies on both calendars before committing to a closing date.')
 ],['jRenovation','jProducts']);

export const productFlows=()=>chapter('prepare','Your loan product changes the route','Read each row from left to right. All financed routes start with preapproval before property searches or tours.',[
 routes('Four purchase-loan paths',[
 ['Conventional / jumbo','Lender preapproval + occupancy/reserve review','Property and any condo review + insurance','Lender conditions + disclosures + closing'],
 ['FHA','FHA lender preapproval + mortgage-insurance budget','FHA property review + any required repairs','Lender conditions + disclosures + closing'],
 ['VA','COE + lender preapproval + cash/fee plan','VA contract clause + appraisal + independent inspection','Borrower/property conditions + closing'],
 ['USDA','Income screen + lender preapproval','Eligible address + property review','Lender and agency process + closing']
 ],'Program and lender requirements control. The actual contract, underwriting and disclosure calendar must be confirmed for your file.'),
 routes('Routes with different decision-makers',[
 ['Renovation','Preapproval + work eligibility','Scope, bids, contractor and required consultant review','Purchase closing → approved repair draws → completion'],
 ['Investment / DSCR','Product-specific preapproval + capital','Permitted use, rental evidence and lender property review','Loan closing → management handoff → operating review'],
 ['Assumption','Servicer borrower review + cash capacity','Existing loan, equity gap, liability and entitlement decisions','Servicer approval → transfer → payment handoff'],
 ['Cash','Verify accessible funds before tours','Inspect + insure + review title and intended use','Settlement → possession → ownership handoff']
 ],'A second transaction, new construction, assistance program or unusual property may add more steps. Ask who approves each addition and what evidence it needs.')
 ],['jProducts','jRenovation','jUsda','jVa','jAssume']);

export const buyerSearch=()=>chapter('search','Search with a purpose; offer with evidence','Preapproval is complete enough to guide the search. Each actual property still needs its own review.',[
 diagram('What a tour can and cannot tell you','house',[
 ['Condition','Observe roof, moisture, systems and maintenance clues. An inspector or specialist investigates them.'],
 ['Ownership cost','Obtain address-specific insurance, tax and association figures. An attractive list price is only one input.'],
 ['Fit and use','Test your route, layout and intended use. Confirm restrictions and financing compatibility.']
 ],'Conceptual illustration. It does not diagnose defects or represent a particular property.'),
 handoff('From a shortlist to an offer',[
 ['You','Record must-haves, concerns and the total cost you can carry. Choose acceptable tradeoffs before the offer conversation.'],
 ['Agent','Research comparable sales and competition, clarify included items and prepare price, protections, deposit and timing options.'],
 ['Lender + insurance professional','Check the property, quoted payment, cash need and coverage constraints. Update the letter when the offer calls for it.']
 ],'You approve the complete proposed terms. A signed agreement starts the actual deadline calendar; touring itself does not approve the property.'),
 worksheet('Bring to the offer conversation',['Price / payment / closing cash for this address:','Inspection, financing and appraisal protections requested:','Deposit / closing / possession dates proposed:','Unresolved question / person responsible / answer due:'])
 ],['jPreapproval','jCma']);

export const buyerContract=()=>chapter('contract','Accepted offer: three workstreams begin','This is the busiest handoff. The signed terms, not a generic day count, start the clocks.',[
 diagram('Work that runs in parallel','parallel',[
 ['Property','Inspection, specialist bids, insurance, association and use restrictions. You decide before your contract rights expire.'],
 ['Loan','Processor assembles evidence; appraisal and underwriting determine outstanding borrower and property conditions.'],
 ['Ownership + closing','Title or closing attorney checks ownership, exceptions, survey, payoffs, signing authority and settlement requirements.']
 ],'These tracks converge before closing. Finishing an inspection does not clear underwriting or title.'),
 handoff('Who owns the first handoff',[
 ['You + agent','Confirm the effective date, deposit instructions and receipt. Book inspections with enough time for estimates and a decision.'],
 ['Loan officer + processor','Receive the complete contract and addenda. Explain the formal application, disclosures, appraisal order and condition deadlines.'],
 ['Closing professional','Open the file and identify title, association, survey and signing items. Confirm who orders each document.']
 ],'One shared deadline sheet identifies each task, owner, due date and written completion evidence. Silence is not evidence that a task is complete.'),
 note('A realistic timeline','Ask what currently prevents the next milestone and when that person expects an answer. Inspection rights, disclosure waiting periods, rate locks and movers follow different clocks. Request a written amendment when contractual dates must change.')
 ],['jDisclosure','documents']);

export const conditionDecision=()=>chapter('review','A finding is a decision, not just a report','Work from the evidence to the remedy, then check the loan and contract before choosing it.',[
 decision('Inspection or appraisal issue','Does the evidence change safety, coverage, value, financing or your willingness to proceed?',
 'Yes: obtain the relevant specialist opinion or written estimate. Ask the lender and insurer whether the proposed remedy is acceptable.',
 'No material change: record why you accept the condition and include future maintenance in your ownership plan.',
 'Before the deadline: accept, document a negotiated solution, or exercise an available contract right with professional guidance.'),
 handoff('Different professionals answer different questions',[
 ['Inspector / contractor','Describe the condition, scope, exclusions, cost and availability. The appraiser addresses lender value and property requirements.'],
 ['Loan officer / insurer','Confirm whether a credit, repair, reinspection or coverage change can satisfy their requirements. A credit cannot cure every issue.'],
 ['You + agent / attorney','Choose a response, negotiate precise terms and deliver required notices. Preserve the signed repair agreement and completion evidence.']
 ],'A resolved issue has an accepted scope, payer, completion date and verification method. “Seller will fix it” leaves too much unsettled.')
 ],['jVa','documents']);

export const underwriting=()=>chapter('finance','Inside underwriting: how a file moves','The processor organizes the evidence. The underwriter decides whether it meets the program and lender requirements.',[
 {...decision('The approval loop','Has the lender accepted all required borrower and property evidence?',
 'Yes: the lender authorizes the next closing steps. Confirm any remaining conditions before documents, signing and funding.',
 'Not yet: identify the exact condition, document or correction. The responsible person supplies it; the lender reviews the response again.',
 'If requirements cannot be met: discuss permitted alternatives, timing and contract rights with the lender and your agent or attorney.'),loop:true},
 handoff('Make the next request the last incomplete upload',[
 ['You','Send complete, current records through the secure portal. Explain financial changes before acting, including gifts, debt and job changes.'],
 ['Processor + loan officer','Reconcile documents, track requests and tell you which unresolved item prevents approval. Coordinate lock and closing dates.'],
 ['Underwriter + property reviewers','Evaluate the evidence, appraisal, insurance and applicable project review. A condition is not automatically a denial.']
 ],'Keep a condition log with the request, owner, due date and acceptance confirmation. Uploading a document and having it accepted are separate events.'),
 note('Common timing dependencies','An appraisal correction, condominium document, insurance binding restriction or current-home sale may take longer than a pay-stub upload. Ask about dependencies early; a promised signing appointment is not lender approval.')
 ],['jPreapproval','jVa']);

export const closing=()=>chapter('close','The last handoffs: figures, funds and keys','Closing is several coordinated events. Confirm the order for this contract and jurisdiction.',[
 flow('Follow the handoff all the way to possession',[
 ['Review the figures','Compare the Closing Disclosure with the Loan Estimate and explain changes. Covered mortgages require receipt at least three business days before consummation.'],
 ['Walk through the property','Check agreed repairs, included items and condition. Escalate a new issue before signing; ask about any timeline effect.'],
 ['Sign and satisfy funding conditions','Use the approved signing method and independently verified payment instructions.'],
 ['Confirm disbursement, recording and possession','The closing professional explains what has occurred and what remains. Receive keys when the agreement allows it.']]),
 handoff('What each person confirms',[
 ['You + agent','Review walkthrough results, possession terms and the household move. Keep any change in writing.'],
 ['Lender + closing professional','Coordinate disclosures, final figures, funding authorization, payoffs, recording and distribution as applicable.'],
 ['Seller / listing agent','Deliver agreed condition, access items and documents. Confirm possession requirements before turning over access.']
 ],'Save the final signed package, settlement statement, insurance evidence and repair records. Verify servicing and first-payment instructions from reliable documents.')
 ],['jDisclosure','documents']);

export const sellerWalk=()=>chapter('prepare','Walk the property before choosing the price','The first appointment establishes goals, condition and uncertainty. It is not a substitute for a professional inspection.',[
 diagram('The walkthrough: observe, document, investigate','house',[
 ['Outside + structure','Roof age and documentation, drainage, visible moisture, exterior condition, windows, decks and storm protection.'],
 ['Inside + systems','Visible leaks, finishes, HVAC, electrical and plumbing concerns, layout, accessibility and deferred maintenance.'],
 ['The property file','Permits, additions, survey, insurance claims, leases, equipment contracts, association documents and known assessments.']
 ],'Observations identify questions. Licensed inspectors, contractors, insurers and legal professionals resolve the questions within their expertise.'),
 handoff('A useful first meeting produces a written brief',[
 ['You','Explain the move, desired timing, known condition, loan obligations and any funds needed for your next purchase. Share records without guessing.'],
 ['Your agent','Photograph and record concerns with permission, compare presentation with competing homes, and separate marketability issues from specialist questions.'],
 ['Inspector / contractor / insurer','Investigate material concerns and explain scope, pricing, coverage eligibility or further work needed.']
 ],'Deliverable: an issues list with the evidence needed, person responsible, estimated lead time and decision date, plus a target launch and possession plan.'),
 note('Sequence matters','Schedule the walkthrough and material estimates before finalizing the CMA, list price and marketing promise. A previously unknown condition can change all three.')
 ],['jCma']);

export const sellerRepairs=()=>chapter('prepare','Choose repairs with a written scope','The question is what each option costs, delays and resolves. Spending more does not guarantee an equal price increase.',[
 decision('Repair, credit, or sell in current condition?','Does the issue block safety, insurability, financing or the intended buyer’s use?',
 'Yes or uncertain: get specialist evidence and ask about financeable solutions before advertising a remedy.',
 'No: compare selective preparation with an as-is price strategy and a negotiated credit where permitted.',
 'Choose after comparing the scope, cost, completion timing, likely market response and estimated net for each option.'),
 table('A bid we can actually compare',['Written item','Why we need it'],[
 ['Scope and exclusions','Same work, materials and disposal assumptions across bids; distinguish repair from replacement.'],
 ['Permits and documentation','Confirm who obtains permits, which trade is responsible and what completion records will be delivered.'],
 ['Schedule and payment','Availability, lead time, payment milestones and contingencies for hidden damage.'],
 ['Verification and warranty','Who checks completion; identify transferable warranty terms without promising coverage.']
 ]),
 note('The timeline has dependencies','Set launch after necessary work and photography are ready. Allow room for estimates and permit or material delays. A credit may help a buyer’s cash position but does not make an uninsurable roof or lender-required repair disappear.'),
 worksheet('Preparation decision',['Issue / specialist / written estimate date:','As-is option / selective repair / broader preparation:','Chosen scope / cost range / uncertainty reserve:','Completion proof / photography date / launch target:'])
 ],['jCma','jVa']);

export const sellerCma=()=>chapter('price','Inside a full comparative market analysis','We build a supported range from the property outward. A list price is a strategy within that evidence.',[
 flow('The CMA evidence pipeline',[
 ['1. Verify the subject','Confirm the legal interest, size source, layout, condition, location, improvements, waterfront or flood factors and ownership costs.'],
 ['2. Select the relevant market','Find properties a reasonable buyer would actually consider. Explain location boundaries, dates, type and exclusions.'],
 ['3. Separate the evidence','Closed sales show achieved prices. Pending listings indicate activity, often without a public final price. Active listings show competition.'],
 ['4. Explain differences','Review condition, size, utility, site, amenities, concessions and timing. Use market support for adjustments; avoid a universal dollar rule.'],
 ['5. Reconcile a range','Weight the most relevant evidence, identify limitations and show which facts could change the conclusion.']]),
 note('An agent’s CMA is different from an appraisal','The CMA supports the listing and negotiation strategy. A lender’s appraisal is a separate assignment for its lending decision. An automated estimate cannot inspect the home or resolve missing facts.'),
 p('Price per square foot is a cross-check, not the entire method. A small updated home, a larger home needing work and a waterfront property may attract different buyers. Explain unusual sales, seller concessions, outdated comparables and unverified measurements rather than averaging them into false precision.')
 ],['jCma']);

export const sellerCmaWorkbook=()=>chapter('price','What you should see in the CMA presentation','A detailed analysis should make the recommendation understandable enough for you to question it.',[
 table('Your CMA review file',['Evidence','What the presentation should show'],[
 ['Subject record','Property facts, source dates, condition observations, relevant repairs and unresolved questions.'],
 ['Comparable selection','Photos, map, sale or listing status, dates, size/condition differences and why each property belongs in the comparison.'],
 ['Market context','Current alternatives, recent buyer response, time on market where verified, and relevant expired or withdrawn competition.'],
 ['Adjustment reasoning','Supported explanations for material differences; no automatic dollar-per-square-foot or renovation reimbursement assumption.'],
 ['Reconciliation','A supported range, strongest comparables, limitations and the reasoning behind the recommended list price.'],
 ['Three preparation cases','Current condition, targeted work and more extensive preparation, with documented costs and plausible pricing scenarios.']
 ]),
 worksheet('Questions for our pricing meeting',['Which closed sales best support the range, and why?','What facts remain unverified or unusual?','What does a buyer get from our closest active competitor?','What evidence would make us revise this recommendation?']),
 note('Property-specific, not invented','This guide teaches the method. Your actual CMA must use your address, current comparable records, a walkthrough and the facts of your property. No sample in this collection is a completed valuation of your home.')
 ],['jCma']);

export const sellerStrategy=()=>chapter('launch','Turn the evidence into the launch plan','Price, preparation, presentation and access work together. Approve them together.',[
 diagram('From analysis to a market decision','parallel',[
 ['Pricing','Choose a supported list price and explain the tradeoff among timing, condition and competition.'],
 ['Presentation','Approve factual copy, accurate photography, floor-plan information and documentation that answers buyer questions.'],
 ['Distribution + access','Agree on listing channels, showing rules, launch timing, inquiry handling and a feedback meeting.']
 ],'This is a proposed service plan to agree with your agent. Availability, agreements and property needs determine the final marketing package.'),
 flow('Use feedback as evidence',[
 ['Before launch','Confirm repairs, disclosures, photo readiness, price rationale and the current net scenarios.'],
 ['After launch','Review inquiries, qualified showings, specific objections and changes in competing inventory.'],
 ['At the agreed review','Identify whether price, access, presentation, condition or the market explains the response.'],
 ['If the plan changes','Approve the change, update the marketing and recalculate the expected net.']]),
 note('Choose a review date, not an automatic discount','A scheduled conversation keeps the listing active. It does not require a fixed percentage reduction. The next recommendation should show the evidence and its effect on your objective.')
 ],['jCma']);

export const sellerNet=()=>chapter('net','From sale price to spendable proceeds','The net sheet is a dated estimate with traceable inputs. Unresolved charges must stay visible.',[
 waterfall('An illustrative closing waterfall',[
 ['Sale price','$450,000'],['Mortgage payoff','− $285,000'],['Negotiated compensation','− $18,000'],['Closing / legal charges','− $3,200'],['Buyer credit','− $6,000'],['Prorations / other charges','− $2,400'],['Repairs from proceeds','− $1,500'],['Estimated proceeds','$133,900']
 ],'Hypothetical arithmetic, not a quote or a standard fee schedule. Compensation is negotiable. Every line needs property-specific evidence.'),
 handoff('How a reliable estimate gets assembled',[
 ['Agent + seller','Supply proposed price, signed compensation terms, credits, repair agreements and the closing date for each scenario.'],
 ['Closing professional','Obtain payoff and title information; quote closing charges and calculate contract-specific taxes, dues, assessments and other allocations.'],
 ['You + tax adviser','Plan moving costs, replacement housing, reserves and potential tax obligations outside the sale’s settlement calculation.']
 ],'Show an as-of date and mark each input documented, estimated or unresolved. A blank or unknown line is not zero.'),
 note('Expected net versus final proceeds','A signed price does not fix every deduction. Payoff interest, prorations, credits, liens and holdbacks can change. The final settlement and actual disbursement establish what is available, and when.')
 ]);

export const sellerNetDetail=()=>chapter('net','Account for the charges before relying on the net','Not every line applies to every sale. Ask the closing professional to mark not applicable with a reason.',[
 table('The proceeds completeness check',['Category','Include or resolve'],[
 ['Debt and ownership','First and second mortgage payoffs, HELOC, per-diem interest, release charges, recorded liens, judgments and equipment or solar obligations.'],
 ['Representation','Negotiated listing and other brokerage compensation under applicable agreements. Check that no obligation is counted twice.'],
 ['Settlement services','Title/search/policy, escrow or settlement, attorney, recording, transfer-related taxes and survey charges as allocated by the contract and local rules.'],
 ['Property and association','Tax and dues prorations, estoppel or resale documents, transfer/application charges, assessments and required association payoffs.'],
 ['Negotiated promises','Buyer credits, repair payments, warranty, included-item agreements, occupancy charges and agreed holdbacks.'],
 ['Outside closing','Identify prepaid expenses separately. Do not deduct a repair again if it was already paid from other funds. Keep moving and tax reserves outside the settlement subtotal.']
 ]),
 note('A mortgage escrow refund is a separate event','Ask the servicer whether a refund is expected and when. Do not add a possible later refund to the proceeds available at settlement. Confirm the payoff through-date and what a delay costs.'),
 worksheet('Resolve every unknown',['Charge / allocation / amount or range:','Source document / as-of date / person confirming:','Already paid, paid at closing, or paid later:','Unresolved item / answer due before offer acceptance or closing:'])
 ]);

export const sellerOptions=()=>chapter('net','Compare the available paths on the same basis','Build separate net sheets for current condition, selected repairs and broader preparation; then for each real offer.',[
 table('Hypothetical strategy meeting',['Scenario','As-is sale','Targeted preparation','Larger project'],[
 ['Assumed sale price','$430,000','$445,000','$460,000'],['Payoff, fixed for example','$285,000','$285,000','$285,000'],['Other sale obligations, assumed','$28,000','$28,000','$28,000'],['Preparation paid before closing','$0','$8,000','$22,000'],['Extra carrying costs assumed','$0','$2,000','$5,000'],['Cash after all shown costs','$117,000','$122,000','$120,000']
 ],'Entirely invented scenarios for teaching the calculation. These are not forecasts, bids, local averages or recommendations. Real fees and payoffs may change with price and timing.'),
 p('The targeted-work case yields $5,000 more cash than the current-condition case under these assumptions. The larger project has the highest price but less cash left than targeted work. A contractor delay, lower sale price or different negotiated fee changes the comparison. Show a conservative case as well as the hoped-for result.'),
 handoff('When a real offer arrives',[
 ['Agent','Recalculate its price, credits, compensation, timing and obligations, then compare contingencies and closing evidence alongside net.'],
 ['Closing professional','Refresh the payoff and property-specific estimates for the proposed date. Identify unresolved charges and any funds held back.'],
 ['Seller','Choose based on spendable cash, timing, preparation effort and contractual exposure. A higher estimated net is not a guaranteed closing.']
 ],'Keep a separate column for costs already paid so the offer comparison and whole-move budget remain consistent.')
 ]);

export const sellerUnderContract=()=>chapter('contract','After acceptance: manage the remaining risks','The price is agreed. Inspection, valuation, financing and ownership questions still need to be resolved.',[
 diagram('Three parallel tracks after acceptance','parallel',[
 ['Property + repairs','Provide access; review findings and written bids. Document any repair, credit, completion date and verification requirement.'],
 ['Buyer financing','Coordinate appraisal access and any required property work. The buyer’s lender handles approval; ask about material timing changes.'],
 ['Title + proceeds','Resolve ownership, liens, payoffs, association requirements, signing authority and the updated net estimate.']
 ],'Your agent coordinates the calendar. Inspectors, the buyer’s lender and closing professionals retain their separate responsibilities.'),
 decision('An issue changes the agreed plan','Can the proposed solution satisfy the contract, buyer, lender and applicable insurer?',
 'Yes: sign the precise amendment, update deadlines and the net sheet, then track completion evidence.',
 'Unclear or no: obtain the missing professional answer and review the actual contract rights before promising a remedy.',
 'Before possession: retain invoices, verify agreed work and resolve new walkthrough concerns through the documented closing process.'),
 note('Keep the move flexible until the key dependencies clear','Discuss backup lodging or replacement-home arrangements if the sale delays. Maintain required utilities, condition and insurance through the agreed transfer, and confirm disbursement before relying on proceeds.')
 ],['documents','jVa']);

export const assumptionStart=()=>chapter('prepare','An assumption begins with approval and cash','Before searching or touring for an assumable loan, establish your financing capacity and the servicer’s process.',[
 flow('Two approvals and two money questions',[
 ['Borrower readiness first','If comparing a new loan, get preapproved. For an assumption, ask the servicer about its borrower qualification and required evidence.'],
 ['Identify the actual existing loan','Obtain authorized current balance, rate, remaining term, status and written assumption requirements. A listing remark is not approval.'],
 ['Fund the equity gap','Compare the agreed price with the balance expected at assumption. Add applicable fees and other cash costs.'],
 ['Protect the seller before commitment','Resolve release of liability and the separate VA entitlement question with the servicer and VA as appropriate.']]),
 handoff('A different decision-maker controls the pace',[
 ['Buyer','Provide credit/income documents and evidence of funds through the servicer’s verified channel. Ask about any additional financing.'],
 ['Seller + agent','Authorize permitted loan-information sharing and set terms that address approval, timing and seller protections.'],
 ['Servicer + closing professional','Explain eligibility, document review, closing instructions, title work and who confirms the loan transfer.']
 ],'Get the required steps and current status in writing. Do not substitute a new-loan preapproval for servicer approval of the assumption.')
 ],['jAssume','jPreapproval']);

export const assumptionDecision=()=>chapter('review','The seller’s two separate protection checks','An approved borrower, a liability release and restored entitlement are different outcomes.',[
 decision('Check 1: liability','Has the seller received the required written release from personal liability?',
 'Yes: retain the release and verify that it applies to the completed assumption.',
 'Not confirmed: ask the servicer what is missing and have the unresolved exposure reviewed before proceeding.',
 'Then check entitlement separately. Do not infer restoration merely because the buyer is making the payments.'),
 decision('Check 2: VA entitlement','Is an eligible assuming veteran substituting sufficient entitlement with the required occupancy certification?',
 'Yes: obtain the accepted substitution and supporting documentation through the appropriate process.',
 'No or uncertain: the seller’s entitlement may remain tied to this loan. Review the effect on a future VA purchase with VA and the lender.',
 'Close only after the parties understand the documented result. A qualified non-veteran may assume, but cannot substitute VA entitlement.')
 ],['jAssume','jEntitlement']);

export const assumptionClose=()=>chapter('close','From servicer approval to a completed transfer','Use milestones controlled by the actual servicer. There is no universal assumption closing schedule.',[
 flow('The final assumption sequence',[
 ['Submit and track','Provide the complete package, pay verified required fees and keep a dated log of requests and responses.'],
 ['Resolve conditions','Buyer evidence, property/title issues, liability release and any entitlement substitution must reach the required status.'],
 ['Reconcile the money','Confirm the balance through the transfer date, equity payment, fees, escrow treatment and all other closing charges.'],
 ['Execute and confirm','Sign approved documents, fund and record as applicable, then confirm transfer and possession under the agreement.'],
 ['Verify the servicing handoff','Buyer confirms first payment and insurance/escrow arrangements. Seller retains liability and entitlement records.']]),
 worksheet('Your servicer milestone log',['Servicer / verified assumption department / file number:','Complete package accepted / outstanding conditions:','Equity gap / fees / approved source of funds:','Written liability release / entitlement decision:','Signing / disbursement / recording / possession:','First payment / escrow reconciliation / final confirmation:'])
 ],['jAssume']);

export const vaStart=()=>chapter('prepare','VA financing: put the gates in order','Start with lender preapproval before searching or touring. Your benefit and your borrowing approval are separate checks.',[
 diagram('Three checks before a VA loan can close','parallel',[
 ['Eligibility + entitlement','Obtain the COE and clarify available entitlement and any prior VA use. The COE does not approve your income or property.'],
 ['Borrower qualification','The lender reviews income, debts, residual income, credit, funds and applicable occupancy requirements.'],
 ['Property + contract','Use the required VA contract clause, obtain the lender’s VA appraisal/property review and arrange your own inspection.']
 ],'Complete the initial borrower review first. The property-specific track begins once a property and contract are identified.'),
 flow('Your VA sequence',[
 ['Before tours','Discuss the COE, preapproval, total payment, funding-fee treatment and cash needed.'],
 ['Before committing','Review the actual property, contract protection, insurance and closing assumptions with your team.'],
 ['Under contract','Complete appraisal, inspection and lender conditions in parallel with title and insurance work.'],
 ['At closing','Confirm final fee treatment, disclosures, funds and possession. Save the benefit and servicing records.']]),
 note('Zero down does not mean zero cash','Your transaction can still include closing costs, prepaid items, escrow, inspections and any value gap. Identify what is permitted, financed, credited or paid separately before making an offer.')
 ],['jVa','vaFees']);
