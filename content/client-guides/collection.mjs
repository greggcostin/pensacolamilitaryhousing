// Chronological edition. Preserve the original reference blocks and contact data;
// use explicit stages and explanatory visuals to make the sequence usable.
import {guides as core} from './core.mjs';
import {guides as seller} from './seller.mjs';
import {guides as coastal} from './coastal.mjs';
import {guides as military} from './military.mjs';
import {guides as pcs} from './pcs.mjs';
import {guides as investment} from './investment.mjs';
import * as J from './journey-chapters.mjs';
import {p,note,worksheet,page} from './schema.mjs';
import {flow,handoff} from './journey-blocks.mjs';

const stages=(items)=>items.map(([key,title,text])=>({key,title,text}));
const buy=stages([
 ['prepare','Preapproval + the money plan','Verify borrowing capacity before searching or touring. Select the product, payment, cash and reserve plan. Cash buyers verify funds.'],
 ['search','Search + property-specific offer','Compare suitable homes and real ownership costs. Agree on price, protections, deposit, dates and possession.'],
 ['contract','Accepted contract + calendar','Deliver the signed contract, confirm the deposit and open the lender and closing files. Calendar every actual deadline.'],
 ['review','Investigate + decide','Inspection, specialist estimates, insurance, title and association review run alongside the loan. Decide before rights expire.'],
 ['finance','Underwriting + final conditions','The lender reviews the borrower and property, clears conditions and coordinates disclosures and funding.'],
 ['close','Review + close + receive possession','Review final figures, verify funds, walk through, sign and confirm the contractual conditions for keys.'],
 ['own','Own + maintain + keep records','Complete the servicing, tax, insurance and maintenance handoff. Plan for future costs and the eventual sale.']
]);
const sell=stages([
 ['prepare','Goals + walkthrough + estimates','Set the move and proceeds goals. Identify condition concerns, obtain written scopes and choose preparation options.'],
 ['price','Full CMA + pricing recommendation','Verify property facts, compare sales and competition, explain adjustments and reconcile a supported price range.'],
 ['net','Net sheets + scenario comparison','Calculate current-condition, repair and pricing scenarios with itemized costs, payoff dates and visible unknowns.'],
 ['launch','Approve strategy + launch','Agree on list price, repairs, photography, marketing, showing access and an evidence-based review date.'],
 ['offer','Compare offers + negotiate','Review net, cash and financing evidence, protections, timing and possession as one package.'],
 ['contract','Manage inspection, appraisal + title','Track access, repairs, buyer financing, ownership and closing requirements. Update the agreement and net as terms change.'],
 ['close','Final walkthrough + settlement + proceeds','Verify repair evidence, final figures and payoff. Confirm disbursement and possession before the final handoff.']
]);
const assume=stages([
 ['prepare','Borrower readiness + servicer contact','Get the servicer’s qualification process and establish available funds before searching and touring for an assumption.'],
 ['search','Loan facts + property selection','Verify the loan is assumable, its current terms and status. Investigate the home, coverage and ownership costs.'],
 ['cash','Equity gap + total closing cash','Reconcile purchase price, remaining balance, fee treatment and other costs. Confirm any proposed additional financing.'],
 ['review','Seller liability + VA entitlement','Resolve written release of liability separately from any substitution or restoration of entitlement.'],
 ['contract','Agreement + complete assumption file','Document terms, contingencies and realistic milestones. Submit and track the servicer’s complete package.'],
 ['finance','Servicer review + conditions','Coordinate borrower, title and property conditions. Get written status; do not assume a universal turnaround time.'],
 ['close','Transfer + funds + payment handoff','Complete approved documents and closing instructions. Confirm servicing, insurance, possession and seller protection records.']
]);
const move=stages([
 ['orders','Orders + sponsor + reporting route','Confirm the gaining unit, training pipeline, required arrival and actual reporting desk.'],
 ['prepare','Housing decision + preapproval if buying','Compare authorized housing options. Get preapproved before a purchase search or tours; build payment, closing cash and move reserves.'],
 ['search','Compare the actual commute + property','Use the real gate and workplace. Investigate insurance, condition, schools and housing costs at the address.'],
 ['contract','Commit + coordinate the move','If buying, calendar the signed terms and run inspections, lender and title work. If renting, review the lease and arrival plan.'],
 ['travel','Travel + household continuity','Coordinate lodging, household goods, documents, healthcare, school records and cash timing with the responsible offices.'],
 ['arrival','Report + receive housing + settle in','Follow orders and the sponsor’s verified instructions. Confirm occupancy, utilities and the local support offices.'],
 ['own','Maintain records + plan the next PCS','Track expenses, home maintenance and your eventual rent/sell decision before the next assignment.']
]);
const invest=stages([
 ['prepare','Investment preapproval + capital','Confirm real occupancy, product, ownership structure and liquid reserves before searching or touring.'],
 ['search','Strategy + suitable properties','Define the rental business, property criteria, management approach and exit assumptions.'],
 ['review','Use permission + operating model','Verify restrictions and revenue evidence, price expenses, and stress-test cash flow and reserves before commitment.'],
 ['contract','Offer + contract + due diligence','Negotiate evidence-based terms and protections. Coordinate inspection, leases, lender, title and any management transfer.'],
 ['finance','Loan + property conditions','Resolve borrower, rental, insurance, appraisal, ownership and other lender-specific requirements.'],
 ['close','Final figures + closing + handoff','Verify funds, property condition, leases/deposits as applicable, approved signing and possession.'],
 ['own','Operate + compare results + plan exit','Reconcile income and expenses, maintain reserves and review the hold/sell plan with actual results.']
]);
const tag=(pg,key)=>({...structuredClone(pg),key});
const ref=(pg,key='own')=>({...tag(pg,key),reference:true});
const added=(key,title,deck,blocks,sources=[])=>({...page(title,deck,blocks,sources),key,kind:'journey',reviewed:'2026-09-08'});
function make(g){
 const old=g.pages;let pages,journey=buy,focus='The complete purchase, with a deeper look at this guide’s subject.';
 const at=(i,k)=>tag(old[i],k);
 switch(g.slug){
 case 'preapproval-first':
  focus='Start here before searching or touring. This guide develops the first stage of the full purchase path below.';
  pages=[J.preapproval(),at(0,'prepare'),at(1,'prepare'),at(2,'prepare'),J.productPaths(),J.productFlows(),J.specialistPaths(),at(3,'prepare'),at(4,'prepare'),at(5,'prepare'),J.buyerSearch()];break;
 case 'buyer-transaction-roadmap':
  pages=[J.preapproval(),at(1,'prepare'),J.productPaths(),J.productFlows(),J.specialistPaths(),J.buyerSearch(),at(2,'contract'),J.buyerContract(),at(3,'review'),J.conditionDecision(),J.underwriting(),at(4,'close'),J.closing(),at(5,'own'),ref(old[0])];break;
 case 'mortgage-preapproval-to-closing':
  pages=[J.preapproval(),J.productPaths(),J.productFlows(),J.specialistPaths(),at(0,'prepare'),J.buyerSearch(),at(1,'contract'),at(2,'finance'),J.underwriting(),at(3,'finance'),at(4,'close'),J.closing(),ref(old[5])];break;
 case 'seller-transaction-roadmap':
  journey=sell;focus='Walkthrough and estimates first; evidence-based pricing, net scenarios and marketing follow.';
  pages=[at(0,'prepare'),J.sellerWalk(),at(1,'prepare'),J.sellerRepairs(),J.sellerCma(),J.sellerCmaWorkbook(),J.sellerNet(),J.sellerNetDetail(),J.sellerOptions(),J.sellerStrategy(),at(2,'launch'),at(3,'offer'),at(4,'contract'),J.sellerUnderContract(),at(5,'close'),ref(old[6],'close')];break;
 case 'seller-net-proceeds':
  journey=sell;focus='The entire sale is below. This workbook develops the costs and choices that turn a price into usable proceeds.';
  pages=[J.sellerWalk(),J.sellerCma(),J.sellerNet(),at(0,'net'),J.sellerNetDetail(),at(1,'net'),J.sellerOptions(),at(2,'offer'),at(3,'offer'),at(4,'close')];break;
 case 'va-loan-insider-guide':
  pages=[J.preapproval(),J.vaStart(),at(0,'prepare'),at(4,'prepare'),at(3,'prepare'),at(1,'prepare'),at(2,'prepare'),J.buyerSearch(),J.buyerContract(),at(5,'review'),J.conditionDecision(),J.underwriting(),at(6,'close'),J.closing(),at(7,'own')];break;
 case 'va-loan-assumption-guide':
  journey=assume;focus='The servicer controls assumption approval. A low rate does not replace cash planning or seller protections.';
  pages=[J.assumptionStart(),at(0,'search'),at(1,'cash'),at(2,'cash'),J.assumptionDecision(),at(3,'review'),at(4,'contract'),at(5,'finance'),J.assumptionClose()];break;
 default:
  if(g.slug.startsWith('pcs-')){
   journey=move;focus='Your orders and reporting route come first. Buying follows preapproval; the contact desk remains available at the back.';
   const plain=old.filter(p=>p.kind!=='directory'),directory=old.filter(p=>p.kind==='directory'),find=t=>plain.find(p=>p.title===t);
   const picked=new Set();const take=(title,key)=>{const pg=find(title);if(!pg)throw new Error('Missing PCS chapter '+title);picked.add(pg);return tag(pg,key);};
   pages=[take('Your installation brief','orders'),take('A workable PCS calendar','orders'),take('Choose the housing path first','prepare'),J.preapproval(),take('2026 BAH: enlisted grades','prepare'),take('2026 BAH: officer and warrant grades','prepare'),take('Translate BAH into a housing budget','prepare'),take('Cash for the move and for the home','prepare'),take('Compare places by your actual route','search'),take('Coastal condition and storm planning','search'),
   added('contract','Buying during a PCS: the housing handoffs','Preapproval precedes purchase tours. Coordinate a flexible move around the real contract and lender milestones.',[
    flow('If you choose to buy',[
     ['Before an offer','Confirm the property, occupancy plan, insurance, complete payment and cash to close with your lender.'],
     ['Once under contract','Start the deposit, inspection, insurance, title and financing tracks together. Record owners and exact deadlines.'],
     ['Before arrival','Confirm approved remote-signing or power-of-attorney needs. Keep temporary lodging available if the home is not ready.'],
     ['Before keys','Review figures, verify funds, finish the walkthrough and confirm funding and contractual possession.']]),
    handoff('Keep the housing and duty calendars connected',[
     ['You + sponsor','Confirm required reporting and household timing. A purchase delay does not change military orders.'],
     ['Agent + lender','Coordinate contract dates, loan conditions, appraisal and coverage; escalate a delay before the move becomes irreversible.'],
     ['Closing professional','Confirm signing authority, final figures, funds and possession requirements.']
    ],'Renting or assigned housing follows its own lease or housing-office process. Do not import a purchase-loan timeline into those arrangements.')
   ],['jPreapproval','jDisclosure']),take('Household goods and travel records','travel'),take('Schools, healthcare and household continuity','travel'),take('Arrival and the next PCS','arrival')];
   for(const pg of plain)if(!picked.has(pg)){if(/training route/i.test(pg.title))pages.splice(1,0,tag(pg,'orders'));else pages.push(tag(pg,'arrival'));}
   pages.push(...directory.map(pg=>({...tag(pg,'arrival'),reference:true})));break;
  }
  // Focused property guides follow the purchase order without burying the specialty.
  focus='The full purchase path comes first. This guide concentrates on the property decisions to resolve before the relevant contract deadlines.';
  pages=[J.preapproval(),added('search','Where this review fits in the purchase','Start investigating as soon as you have a serious address. Finish the required decisions within the actual contract dates.',[
   flow('Use the specialist chapters in this order',[
    ['Before committing','Get the property documents and initial cost assumptions. Identify questions that could make the home or intended use unsuitable.'],
    ['During due diligence','The relevant professional reviews the records, investigates gaps and prices the consequences. Coordinate findings with the lender.'],
    ['Before protections expire','Choose to accept, negotiate a documented solution or use an available contract right.'],
    ['Before and after closing','Confirm the promised documents or work, final costs and any ownership follow-up. Keep the evidence in your property file.']]),
   handoff('The handoff for this subject',[
    ['You + agent','Request the right evidence and decide how the findings affect the offer and your willingness to proceed.'],
    ['Subject professional','The county, insurer, inspector, association or attorney answers the specific question within its authority.'],
    ['Lender + closing professional','Confirm any effect on financing, coverage, title, required cash or closing conditions.']
   ],'Record the question, source, answer date, responsible person and the contract deadline it affects.')
  ],['jPreapproval']),...old.map((pg,i)=>tag(pg,i===old.length-1?'close':'review'))];
 }
 return {...g,pages,journey,focus};
}
export const guides=[...core,...seller,...coastal,...military,...pcs].map(make).concat(investment.map(g=>({...g,journey:invest,focus:'Treat the home purchase and the rental business as connected decisions, with separate evidence for each.'})));
