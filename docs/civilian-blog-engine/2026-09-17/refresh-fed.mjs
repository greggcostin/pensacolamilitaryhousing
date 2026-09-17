// Substantive refresh of the Fed article after the verified September 16, 2026 FOMC decision.
// Rewrites the PAGE header, replaces the body from body.html and rebuilds the research record.
// The review seal is applied separately (seal-review.mjs) after the editorial passes.
import fs from 'node:fs';import path from 'node:path';
import {loadFragment} from './source/scripts/civilian-blog-factory.mjs';
import {calculate} from './source/scripts/article-evidence.mjs';
const root=path.join(import.meta.dirname,'source'),slug='fed-rate-hike-what-it-means',date='2026-09-17',photo='fed-hike-20260917';
const fp=path.join(root,'content/civilian-blog',slug+'.fragment.html'),rp=path.join(root,'content/civilian-blog/research',slug+'.json');
const old=loadFragment(fp);const {body:oldBody,...spec}=old;
const body=fs.readFileSync(path.join(import.meta.dirname,'body.html'),'utf8').replace(/\r\n/g,'\n').trim();
const research=JSON.parse(fs.readFileSync(rp,'utf8'));
const credits=JSON.parse(fs.readFileSync(path.join(root,'content/blog/image-credits.json'),'utf8')).images['civilian-site/images/'+photo+'.jpg'];
if(!credits)throw Error('image credit missing');
const meta={width:1400,height:1050};

const URLS={
 fed:'https://www.federalreserve.gov/newsevents/pressreleases/monetary20260916a.htm',
 july:'https://www.federalreserve.gov/newsevents/pressreleases/monetary20260729a.htm',
 sep:'https://www.federalreserve.gov/monetarypolicy/fomcprojtabl20260916.htm',
 calendar:'https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm',
 treasury:'https://home.treasury.gov/resource-center/data-chart-center/interest-rates/TextView?type=daily_treasury_yield_curve&field_tdr_date_value=2026',
 pmms:'https://www.freddiemac.com/pmms',
 lock:'https://www.consumerfinance.gov/ask-cfpb/whats-a-lock-in-or-a-rate-lock-en-143/',
 estimate:'https://www.consumerfinance.gov/owning-a-home/loan-estimate/',
 transmission:'https://www.federalreserve.gov/monetarypolicy/monetary-policy-what-are-its-goals-how-does-it-work.htm'
};

Object.assign(spec,{
 title:'Fed Rate Hike to 3.75%-4%: What It Means for Gulf Coast Buyers',
 description:'The Fed raised its target range to 3.75% to 4.00% on September 16, 2026. What that changes for Gulf Coast buyers, rate locks, sellers and rental owners.',
 h1:'What does the September 2026 Fed rate hike mean for Gulf Coast homebuyers?',
 lead:'The Fed raised its policy rate a quarter point on September 16, 2026. Your next move still depends on the mortgage terms, closing deadline and property costs you can verify.',
 keywords:'Fed rate hike, Federal Reserve mortgage rates, September 2026 Fed meeting, mortgage rate lock, federal funds rate 3.75% to 4%',
 targetKeywords:['Fed rate hike','Federal Reserve mortgage rates','September 2026 Fed meeting','mortgage rate lock'],
 ogTitleLines:['The Fed raised rates','What it means for buyers'],
 figure:{src:'/images/'+photo+'.jpg',webp:'/images/'+photo+'.webp',alt:'Two-story Victorian house with a wraparound porch, pink siding and a stone wall in the North Hill district of Pensacola, Florida',caption:'A Victorian house in the North Hill Preservation District of Pensacola, Florida. Not a current listing, a comparable sale or a financed property.',width:meta.width,height:meta.height},
 quickAnswer:'On September 16, 2026 the Federal Reserve raised the federal funds target range by a quarter point to 3.75% to 4.00% by a 12 to 0 vote, according to the FOMC statement. The 10-year Treasury par yield was 5.00% the day before and 5.01% the day of the vote. A policy change does not set your mortgage quote; compare written loan terms and the full property budget.',
 takeaways:[
  'The Fed raised its target range to 3.75% to 4.00% on September 16, and most participants project a higher rate by year end, not a reversal.',
  'A quarter-point policy move is not a quarter-point change in your mortgage quote; the 10-year Treasury moved one basis point on decision day.',
  'Compare the full payment, lock deadline and closing cash using the same loan assumptions, before and after the announcement.',
  'Keep enough reserves to own the property without relying on a future refinance or a rate cut.'
 ],
 shareHook:'The Fed raised rates and projects more. Before changing your homebuying plan, check the payment you can carry and the date your rate lock expires.',
 perishables:[
  {claimId:'fed-target',claim:'The Federal Reserve raised its target range for the federal funds rate by a quarter point to 3.75% to 4.00% on September 16, 2026.',expires:'2026-10-28',source:URLS.fed},
  {claimId:'meeting',claim:'The next scheduled FOMC meeting is October 27 and 28, 2026',expires:'2026-10-28',source:URLS.calendar},
  {claimId:'sep-median',claim:'the median projection for the federal funds rate at the end of 2026 is 4.1%',expires:'2026-12-09',source:URLS.sep},
  {claimId:'sep-dots',claim:'Sixteen of the 18 participants placed their end-of-2026 midpoint above the current range\'s midpoint',expires:'2026-12-09',source:URLS.sep},
  {claimId:'treasury-10y',claim:'The 10-year Treasury par yield was 5.00% on September 15 and 5.01% on September 16, 2026',expires:'2026-10-28',source:URLS.treasury},
  {claimId:'pmms',claim:'Freddie Mac\'s September 10, 2026 survey reported a 6.76% national average for a 30-year fixed mortgage, up from 6.71% the week before.',expires:'2026-09-24',source:URLS.pmms},
  {claimId:'lock-conditions',claim:'A mortgage rate lock depends on closing within the agreed period and keeping the application terms consistent.',expires:'2026-10-17',source:URLS.lock}
 ],
 editorial:{...spec.editorial,readerTask:'Use the published September 16 decision, a written lender quote and a complete property budget to decide whether locking, renegotiating or waiting fits.',originalValue:'Records the actual September 16 decision and vote beside the July hold, reads the participants\' projections from the source, shows the one-day Treasury observation, separates the weekly survey window from the vote, and keeps the recomputed payment sensitivity and the seller and rental stress tests with local decisions.'},
 dateModified:date,
 readTime:'8 min read',
 faqs:[
  {q:'Does the September Fed hike increase every existing mortgage payment?',a:'No. Review your note and loan type. A fixed-rate loan does not become adjustable because the Fed changes policy, while variable debt follows its own index and adjustment terms. Read the documents for a home equity line or adjustable loan to see when and how it resets. Taxes, insurance and escrow changes can still affect the amount collected even when the note rate stays fixed.'},
  {q:'The September meeting is over. Should I still wait to buy?',a:'Decide with your payment, reserves, property condition and expected holding period, not with the calendar. The projections published on September 16 point to a higher policy rate by year end rather than a cut, so waiting for a reversal is a weak reason on its own. Waiting makes sense when you can name what needs to improve before the purchase fits.'},
  {q:'Will the Fed raise rates again at the October 27 and 28 meeting?',a:'Nobody can promise that. The September projections show most participants expect a higher rate by the end of 2026, but those are individual judgments that change with the data, not a commitment. Plan the purchase so it works at the written terms available today, then recheck the statement after the October meeting before changing anything.'},
  {q:'Is the national mortgage average available to every borrower?',a:'No. It represents a defined set of applications over a reporting period. Your credit, down payment, occupancy, property and loan terms may differ. Request a current written quote for the actual transaction, and compare fees and total costs before deciding whether one offer is more attractive.'},
  {q:'Is a seller credit always better than a lower price?',a:'No. It depends on the buyer\'s cash and payment constraints, loan-program limits and the seller\'s net proceeds. Have the lender show the eligible use of the proposed credit, including any rate buydown. Compare the complete terms of each offer instead of assuming the structure with the higher headline price wins.'},
  {q:'Should I plan to refinance if I buy now?',a:'A future refinance can be an option, but it should not be required to make the purchase affordable. After a meeting where most participants projected further increases, counting on a near-term cut is speculation. Future rates, property value, income, credit and closing costs are uncertain. Build a plan that works with the current loan and evaluate a later refinance on its own terms.'},
  {q:'What should a vacation-rental investor do after a rate increase?',a:'Update the financing quote and test the property with lower occupied time, realistic operating expenses and a repair reserve. Check quiet-season cash needs as well as the annual total. A favorable rate forecast does not establish rental permission, reliable revenue or the ability to absorb an unexpected expense.'}
 ],
 excerpt:'The Fed raised its policy rate a quarter point on September 16, 2026. Your next move still depends on the mortgage terms, closing deadline and property costs you can verify.'
});
fs.writeFileSync(fp,'<!--PAGE '+JSON.stringify(spec,null,2)+' PAGE-->\n\n'+body+'\n');

// Research record
const S=(id,publisher,title,url,evidenceNote,reportingDate,extra={})=>({id,publisher,title,url,evidenceNote,primary:true,checkedAt:date,geography:'United States',propertyType:'Residential mortgage, with stated source scope',reportingDate,...extra});
research.sessionDate=date;
research.reader='Gulf Coast homebuyer deciding whether to lock, renegotiate or wait after the September 16, 2026 Fed rate increase, with sellers and rental owners as secondary readers';
research.decision=spec.editorial.readerTask;research.readerTask=spec.editorial.readerTask;
research.changeReason='Verified current event: the FOMC raised the target range on September 16, 2026. The article\'s policy and meeting perishables expired on that date and its opening framed the decision as pending. The existing URL owns the intent (dedup INTENT-REVIEW pointed at this article, the mortgage guide and the hub), so it is refreshed in place rather than duplicated.';
research.originalValue=spec.editorial.originalValue;
research.models={research:'Claude / claude-opus-5[1m] / in-session',write:'Claude / claude-opus-5[1m] / in-session'};
research.uncertainFacts=[{item:'Freddie Mac September 17, 2026 release',note:'Scheduled for noon Eastern on the publication day, after this run. The article cites the September 10 figure as the most recent release before the update and explains the survey window; review by September 24.'}];
research.sources=[
 S('fed','Federal Reserve Board','September 16, 2026 FOMC statement',URLS.fed,'Read the full statement: target range raised by 1/4 percentage point to 3-3/4 to 4 percent, approved by a 12 to 0 vote; "Inflation remains elevated"; "Today\'s policy action will support a timelier return to the Committee\'s 2 percent goal." Implementation Note issued the same day.','2026-09-16'),
 S('july','Federal Reserve Board','July 29, 2026 FOMC statement',URLS.july,'Read the statement: range maintained at 3-1/2 to 3-3/4 percent by a 9 to 3 vote; Hammack, Kashkari and Logan preferred a quarter-point increase at that meeting.','2026-07-29'),
 S('sep','Federal Reserve Board','Summary of Economic Projections, September 16, 2026 (accessible version)',URLS.sep,'Read Table 1: federal funds rate median 4.1 (2026), 4.1 (2027), 3.9 (2028), 3.6 (2029), 3.2 longer run; June medians 3.8, 3.6, 3.4, 3.1. Read Figure 2 for 2026: 4 participants at 4.375, 12 at 4.125, 2 at 3.875, total 18. Projections are participants\' individual judgments of appropriate policy, midpoint of target range.','2026-09-16'),
 S('calendar','Federal Reserve Board','FOMC meeting calendar',URLS.calendar,'Read the 2026 list: September 15-16 now carries statement, implementation note and projection materials; remaining meetings are October 27-28 and December 8-9 (December marked as a projection meeting).','2026-09-17'),
 S('treasury','U.S. Department of the Treasury','Daily Treasury Par Yield Curve Rates, 2026',URLS.treasury,'Downloaded the 2026 CSV this session: 10 Yr column reads 5.00 on 09/15/2026 and 5.01 on 09/16/2026 (4.97 on 09/14, 4.96 on 09/11); 2 Yr 4.67 and 4.74 on the same two days. Par yields, not mortgage rates; no causal attribution made.','2026-09-16'),
 S('pmms','Freddie Mac','Primary Mortgage Market Survey',URLS.pmms,'Opened this session: "U.S. weekly mortgage rate averages as of 09/10/2026", 30-year 6.76% (prior week 6.71%, year ago 6.35%), 15-year 6.09%. Page states results are released Thursdays at 12 p.m. ET and average rates offered the prior Thursday through Wednesday. No newer release was posted at run time.','2026-09-10'),
 S('lock','Consumer Financial Protection Bureau','What\'s a lock-in or a rate lock on a mortgage?',URLS.lock,'Read this session: a lock holds the rate between offer and closing if you close within the time frame and the application does not change; rate can still change with loan type, down payment, appraisal, credit or undocumented income; extending can be expensive; a lock can lock you out of a lower rate. Page dated May 2, 2023.','2023-05-02'),
 S('estimate','Consumer Financial Protection Bureau','Loan Estimate explainer',URLS.estimate,'Read this session: projected payments section states the total monthly payment will typically be more than principal and interest because of taxes and insurance; estimated cash to close and APR comparison sections reviewed.','2026-09-17'),
 S('transmission','Federal Reserve Board','Monetary Policy: What Are Its Goals? How Does It Work?',URLS.transmission,'Read this session: "The federal funds rate is the interest rate that banks pay to borrow reserve balances overnight." Longer-term loan rates "are related to expectations of how monetary policy and the broader economy will evolve over the duration of the loans, not just to the current level of the federal funds rate."','2026-09-17')
];
const F=(id,text,sourceIds,scope,asOf,opts={})=>({id,kind:'fact',text,claim:text,sourceIds,scope,asOf,accessed:date,status:'verified',sourceUrl:URLS[sourceIds[0]],loadBearing:!!opts.loadBearing,perishable:!!opts.expires,...(opts.expires?{expires:opts.expires}:{}),verification:opts.verification,locator:opts.locator||opts.verification,independentCheck:{reviewer:'Claude / claude-opus-5[1m]',date,finding:opts.verification}});
const calc=(id,text,operation,inputs,assumptions,units='USD per month')=>{const calculation={operation,inputs,result:0,units,tolerance:0.005,inputSources:[assumptions]};calculation.result=Math.round(calculate(calculation)*100)/100;return {id,kind:'calculation',text,claim:text,status:'verified',accessed:date,asOf:date,sourceUrl:URLS.estimate,locator:'Article illustration; the CFPB page supplies payment-component context, not the invented inputs. '+operation+'('+inputs.join(', ')+') = '+calculation.result+' '+units+'.',loadBearing:true,assumptions,method:operation+'('+inputs.join(', ')+') = '+calculation.result+' '+units+'.',verification:'Recomputed in Node from the stated inputs with the shared calculate() helper and a separate closed-form amortization check; no rate quote or actual property is implied.',independentCheck:{reviewer:'Claude / claude-opus-5[1m]',date,finding:'Recomputed with the shared evidence calculator and an independent closed-form formula; printed cents match. The difference row subtracts the displayed rounded payments.'},calculation};};
research.claims=[
 F('fed-target','The Federal Reserve raised its target range for the federal funds rate by a quarter point to 3.75% to 4.00% on September 16, 2026.',['fed'],'Federal funds policy target, not a mortgage rate','2026-09-16',{loadBearing:true,expires:'2026-10-28',verification:'Read the September 16 statement directly: "raise the target range for the federal funds rate by 1/4 percentage point to 3-3/4 to 4 percent". Confirmed the prior range from the July 29 statement so the size of the move is consistent.'}),
 F('fed-vote','The vote in the FOMC statement was 12 to 0.',['fed'],'FOMC vote on the September 16, 2026 policy action','2026-09-16',{verification:'Statement header: "approved the following statement for release by a 12 - 0 vote"; no dissents listed.'}),
 F('july-hold','At the previous meeting on July 29, 2026, the Committee held the range at 3.50% to 3.75% by a 9 to 3 vote, with the three dissenters preferring a quarter-point increase',['july'],'Prior FOMC decision, for the comparison table','2026-07-29',{verification:'Read the July 29 statement: maintain at 3-1/2 to 3-3/4 percent, 9 to 3, three named dissenters preferring a 1/4 point increase.'}),
 F('meeting','The next scheduled FOMC meeting is October 27 and 28, 2026',['calendar'],'Scheduled FOMC meeting, subject to change','2026-09-17',{expires:'2026-10-28',verification:'Checked the 2026 calendar entry after September 15-16; October 27-28 is the next listed meeting.'}),
 F('sep-median','the median projection for the federal funds rate at the end of 2026 is 4.1%',['sep'],'Median of participants\' projected appropriate federal funds rate, end of 2026, midpoint of target range; not a Committee commitment','2026-09-16',{loadBearing:true,expires:'2026-12-09',verification:'Read Table 1 memo row: federal funds rate median 4.1 for 2026 (June projection 3.8). Compared with the midpoint of 3.75 to 4.00, which is 3.875.'}),
 F('sep-dots','Sixteen of the 18 participants placed their end-of-2026 midpoint above the current range\'s midpoint, twelve at 4.125% and four at 4.375%, while two placed it at 3.875%.',['sep'],'Figure 2 distribution of participants\' 2026 projections','2026-09-16',{loadBearing:true,expires:'2026-12-09',verification:'Read Figure 2, 2026 column: 4.375 has 4 participants, 4.125 has 12, 3.875 has 2; 4+12+2 = 18. Sixteen are above 3.875.'}),
 F('treasury-10y','The 10-year Treasury par yield was 5.00% on September 15 and 5.01% on September 16, 2026',['treasury'],'Daily par yield curve, 10-year column; a benchmark observation, not a mortgage rate and not a causal claim','2026-09-16',{loadBearing:true,expires:'2026-10-28',verification:'Downloaded the Treasury 2026 daily par yield CSV and read the 09/15/2026 and 09/16/2026 rows: 10 Yr 5.00 and 5.01.'}),
 F('overnight-policy','defines the federal funds rate as the rate banks pay to borrow reserve balances overnight',['transmission'],'Definition of the policy rate','2026-09-17',{verification:'Quoted from the explainer\'s federal funds rate definition.'}),
 F('long-term-policy','the rates charged on longer-term loans are related to expectations of how monetary policy and the broader economy will evolve over the duration of the loans, not just to the current level of the federal funds rate',['transmission'],'Transmission to longer-term rates','2026-09-17',{verification:'Quoted from the explainer\'s section on how changes affect the broader economy.'}),
 F('pmms','Freddie Mac\'s September 10, 2026 survey reported a 6.76% national average for a 30-year fixed mortgage, up from 6.71% the week before.',['pmms'],'US conventional weekly mortgage application average; not a daily, local or individual quote','2026-09-10',{loadBearing:true,expires:'2026-09-24',verification:'Opened the PMMS page this session: 6.76% as of 09/10/2026, prior week 6.71%; release timing and survey window read from the page text.'}),
 F('lock-conditions','A mortgage rate lock depends on closing within the agreed period and keeping the application terms consistent.',['lock'],'Consumer mortgage rate lock with lender-specific terms','2023-05-02',{loadBearing:true,expires:'2026-10-17',verification:'Read the CFPB definition and the list of application changes that can alter a locked rate, the extension cost note and the lock-out sentence.'}),
 calc('payment-low','6.75% $2,205.23 Starting scenario','amortization',[340000,6.75,360],'Hypothetical $340,000 principal, fixed annual 6.75%, 360 payments; P&I only.'),
 calc('payment-high','7.00% $2,262.03 Higher-rate scenario','amortization',[340000,7,360],'Hypothetical $340,000 principal, fixed annual 7%, 360 payments; P&I only.'),
 calc('payment-gap','Difference $56.80 Using the displayed rounded payments','difference',[2262.03,2205.23],'Subtract displayed payments, $2262.03 less $2205.23; precise unrounded gap is $56.794955.')
];
research.searchLandscape={
 checkedAt:date,
 results:[
  {url:URLS.fed,title:'September 16, 2026 FOMC statement',reviewed:'Raise by 1/4 point to 3-3/4 to 4 percent, 12 to 0; inflation remains elevated; timelier return to 2 percent goal.'},
  {url:URLS.sep,title:'Summary of Economic Projections, September 2026',reviewed:'Median federal funds 4.1 for 2026 and 2027; Figure 2 2026 distribution 4/12/2 at 4.375/4.125/3.875.'},
  {url:URLS.july,title:'July 29, 2026 FOMC statement',reviewed:'Held at 3-1/2 to 3-3/4, 9 to 3 with three dissents for a hike.'},
  {url:URLS.calendar,title:'FOMC meeting calendar',reviewed:'Next meeting October 27-28, then December 8-9.'},
  {url:URLS.treasury,title:'Daily Treasury Par Yield Curve Rates',reviewed:'10-year 5.00 on September 15, 5.01 on September 16.'},
  {url:URLS.pmms,title:'Primary Mortgage Market Survey',reviewed:'6.76% as of September 10, prior 6.71%; Thursday noon release; prior Thursday through Wednesday window.'},
  {url:URLS.lock,title:'Mortgage rate locks (CFPB)',reviewed:'Lock conditions, application-change exceptions, extension cost, lock-out of lower rates.'},
  {url:URLS.estimate,title:'Loan Estimate explainer (CFPB)',reviewed:'Total monthly payment typically exceeds principal and interest because of taxes and insurance.'},
  {url:URLS.transmission,title:'Monetary Policy: What Are Its Goals? How Does It Work?',reviewed:'Federal funds definition; longer-term rates depend on expectations.'},
  {url:'https://www.cnbc.com/2026/09/16/fed-rate-decision-september-2026.html',title:'Fed rate decision September 2026 (CNBC, from search results)',reviewed:'Search-result discovery only, not opened as evidence: national coverage of the hike and the projections; cites a daily rate index rather than the weekly survey.'},
  {url:'https://www.housingwire.com/articles/fed-rate-hike-inflation-geopolitics-housing-impact/',title:'Fed hikes rates, housing faces higher-for-longer mortgage rate risk (HousingWire, from search results)',reviewed:'Search-result discovery only: national framing of affordability pressure; no local budget workflow.'}
 ],
 informationGain:'The official releases establish the decision, the vote, the participants\' projections, the next meeting, the Treasury observation, the weekly survey and the lock conditions separately. National coverage found in search results explains the hike and repeats a daily rate index, but none of it gives a Gulf Coast buyer a post-decision workflow that keeps the same loan assumptions before and after the announcement, separates the weekly survey window from the vote, reads the projection distribution from the source, includes taxes and insurance, and compares seller credit versus price reduction and rental stress tests. This refresh supplies that workflow without assigning a cause to any one-day move or predicting the October meeting.',
 questions:[
  {question:'What did the Fed decide on September 16, 2026?',origin:'source',source:URLS.fed,sourceUrl:URLS.fed,checkedAt:date,provenance:'Statement wording: the decision, size and vote.'},
  {question:'Does the Fed expect to raise rates again this year?',origin:'source',source:URLS.sep,sourceUrl:URLS.sep,checkedAt:date,provenance:'Summary of Economic Projections Table 1 and Figure 2.'},
  {question:'Did mortgage rates jump the day the Fed raised?',origin:'editorial',sourceUrl:URLS.treasury,checkedAt:date,provenance:'Editorial hypothesis answered with the Treasury daily observation and the PMMS window; not observed search volume.'},
  {question:'How much would a quarter-point mortgage change cost?',origin:'editorial',sourceUrl:URLS.estimate,checkedAt:date,provenance:'Retained hypothetical illustration.'},
  {question:'When should you lock rather than wait?',origin:'source',source:URLS.lock,sourceUrl:URLS.lock,checkedAt:date,provenance:'CFPB lock guidance and its suggested lender questions.'},
  {question:'Should a seller offer a credit or reduce the price?',origin:'editorial',checkedAt:date,provenance:'Editorial; local seller decision.'},
  {question:'What should an owner or rental investor stress-test?',origin:'editorial',checkedAt:date,provenance:'Editorial; rental underwriting policy.'},
  {question:'What would make waiting the better choice?',origin:'editorial',checkedAt:date,provenance:'Editorial counterargument section.'},
  {question:'What should you recheck now that the Fed has moved?',origin:'editorial',checkedAt:date,provenance:'Editorial post-decision workflow.'},
  {question:'Does the September Fed hike increase every existing mortgage payment?',origin:'editorial',checkedAt:date,provenance:'Editorial FAQ; fixed versus variable distinction.'},
  {question:'The September meeting is over. Should I still wait to buy?',origin:'editorial',checkedAt:date,provenance:'Editorial FAQ.'},
  {question:'Will the Fed raise rates again at the October 27 and 28 meeting?',origin:'source',source:URLS.calendar,sourceUrl:URLS.calendar,checkedAt:date,provenance:'Calendar entry plus the projection distribution; answered as uncertainty.'},
  {question:'Is the national mortgage average available to every borrower?',origin:'source',source:URLS.pmms,sourceUrl:URLS.pmms,checkedAt:date,provenance:'PMMS methodology text.'},
  {question:'Is a seller credit always better than a lower price?',origin:'editorial',checkedAt:date,provenance:'Editorial FAQ.'},
  {question:'Should I plan to refinance if I buy now?',origin:'editorial',checkedAt:date,provenance:'Editorial FAQ; counterargument to speculative refinance plans.'},
  {question:'What should a vacation-rental investor do after a rate increase?',origin:'editorial',checkedAt:date,provenance:'Editorial FAQ; STR policy row.'}
 ],
 provenanceNote:'Bing API rows for greggcostin.com this run (2 pages, 6 queries, through September 15) contain no rate or Fed queries; the only observed demand is unrelated school and brand queries. No question here is labeled People Also Ask. Editorial questions are not observed demand.'
};
research.localApplications=[
 {place:'Pensacola',decision:'Obtain the buyer-based tax estimate and insurance quote before setting a maximum offer.',passage:'For a Pensacola buyer, request the buyer-based tax estimate and insurance quote before choosing a maximum offer.'},
 {place:'Gulf Breeze',decision:'Compare a price reduction against a permitted closing-cost contribution using seller net proceeds.',passage:'For a Gulf Breeze seller, compare the same offer with a price reduction and with a permitted closing-cost contribution.'},
 {place:'Orange Beach',decision:'Underwrite a vacation rental with separated seasonal receipts, vacancy, reserves and debt service at current written terms.',passage:'For an Orange Beach vacation rental, keep seasonal receipts, vacancy, management, repairs, reserves, taxes, insurance and debt service separate.'}
];
research.scopeChecks={
 professionalReview:'Agent editorial review only; no lender, attorney, tax adviser or Gregg sign-off claimed.',
 numbers:'All policy, projection, Treasury and PMMS figures read from their primary sources this session. Hypothetical loan inputs remain invented illustrations. No forecast of the October decision, no daily-versus-weekly spread, no causal story for the one-day Treasury move, no refinance guarantee.',
 counterargument:'Waiting can be right when costs or reserves do not fit; a lock can exclude later lower pricing and has lender-specific conditions; projections are judgments that change with the data.'
};
research.image={...credits,selected:photo+'.jpg',query:'Pensacola Florida historic district house',eyeTest:'Nine candidates viewed across three queries. Query 1 (Pensacola Florida neighborhood houses street): three black-and-white HABS scans of naval station officers\' quarters with survey numbers on the negatives, rejected. Query 2 (Gulf Breeze Florida home): two Hurricane Ivan flood photographs and a FEMA photographer portrait, rejected as disaster imagery and a recognizable person. Query 3 (Pensacola Florida historic district house): a historical marker rejected, a house with a readable third-party law-firm sign rejected, and the pink Victorian in the North Hill Preservation District selected: clear color exterior, no people, no watermark, no business signage. CC BY-SA 3.0, credit Ebyabe recorded for the photography credits page.',width:meta.width,height:meta.height,processing:'Resized to maximum 1400 pixels, JPEG quality 78, WebP quality 75; responsive pipeline follows.'};
if(research.review)research.reviewHistory=[...(research.reviewHistory||[]),research.review];
delete research.review;
const amort=(P,r,n)=>{const i=r/100/12;return P*i/(1-Math.pow(1+i,-n));};
research.independentVerification={date,provider:'claude',model:'claude-opus-5[1m]',method:'Direct primary-source reads (statement HTML, SEP accessible tables, Treasury CSV, PMMS page, CFPB and Fed explainer pages) plus separate Node calculations',checks:[
 {item:'Policy range and vote',result:'September 16 statement: 3-3/4 to 4 percent, 12 to 0; July 29: 3-1/2 to 3-3/4, 9 to 3.'},
 {item:'Projection distribution',result:'Figure 2, 2026: 4 at 4.375, 12 at 4.125, 2 at 3.875 (sum 18); Table 1 median 4.1.'},
 {item:'Treasury 10-year',result:'CSV rows 09/15/2026 5.00 and 09/16/2026 5.01.'},
 {item:'PMMS',result:'6.76% as of 09/10/2026, prior 6.71%; no newer release posted at run time.'},
 {item:'Payment at 6.75%',result:amort(340000,6.75,360),display:2205.23},
 {item:'Payment at 7.00%',result:amort(340000,7,360),display:2262.03},
 {item:'Displayed difference',result:Math.round((2262.03-2205.23)*100)/100,note:'Unrounded gap '+(amort(340000,7,360)-amort(340000,6.75,360))}
]};
research.measurementDecision={
 selection:'current-events-override-refresh',verifiedOverride:true,
 newsReview:'FOMC statement September 16, 2026 read at the source: target range raised to 3.75% to 4.00%, 12 to 0. The article\'s fed-target and meeting perishables expired that day. Planner had selected the coastal-ownership-costs refresh (priority 49.98); a verified consequential current event outranks it under the policy selection order. One refresh only; the mortgage guide\'s stale policy-range table is queued for the next run.',
 bing:'Live September 17 collection: 2 page rows, 6 query rows, 22 traffic days through September 15, 64 impressions and 2 clicks in the producer trailing bin; no /blog/* rows (unknown). URL Inspection in the signed-in browser: this article Discovered but not crawled (discovered September 4), Live URL test "URL can be indexed by Bing", no SEO/GEO issues; Request indexing not clicked.',
 clarity:'Connector bound to the military project (greggcostin.com filter empty; unfiltered query returned a pensacolamilitaryhousing.com URL). Project ydd39cyp64 opened in the signed-in Chrome for September 10 00:00 to September 16 23:59 UTC: 105 sessions (30 bot sessions excluded), 64 unique users, 2.56 pages per session; no /blog/* URL in the top 12 pages; CSV retained.',
 gsc:'Retained September 12 workbook (selected August 14 to September 10, chart August 23 to September 10, article absent). No new export requested this run; Google performance unknown.'
};
fs.writeFileSync(rp,JSON.stringify(research,null,2)+'\n');
console.log(JSON.stringify({title:spec.title,titleLength:spec.title.length,descriptionLength:spec.description.length,words:body.replace(/<[^>]+>/g,' ').trim().split(/\s+/).length,claims:research.claims.length,sources:research.sources.length}));
