// Owner-requested refresh of the evergreen mortgage-rate guide (queue requestedOrder 2, notBefore 2026-09-14).
// Research brief is updated before prose; every dated figure was opened at its primary source in this session.
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {contentHash,evidenceHash} from './source/scripts/civilian-editorial-lib.mjs';
const root=new URL('./source/',import.meta.url);
const slug='what-moves-mortgage-rates',date='2026-09-14',reviewer='Claude / claude-opus-5[1m] / in-session';
const f=new URL('content/civilian-blog/'+slug+'.fragment.html',root);
const text=readFileSync(f,'utf8'),match=text.match(/<!--PAGE\s+([\s\S]*?)\s+PAGE-->/);
const spec=JSON.parse(match[1]);
let body=text.slice(match[0].length).trim().replace(/\r\n/g,'\n');
const researchFile=new URL('content/civilian-blog/research/'+slug+'.json',root);
const research=JSON.parse(readFileSync(researchFile,'utf8'));
research.reviewHistory=research.reviewHistory||[];research.reviewHistory.push({...research.review});delete research.review;
research.sessionDate=date;
research.changeReason='Gregg requested this refresh on September 12 (queue requestedOrder 2, notBefore September 14): update with current official sources and clearly separate the federal funds rate from mortgage pricing. Substantive change: a new federal-funds section with the current policy target, the Fed definition of the overnight rate, the expectations channel, a dated three-benchmark comparison table (policy rate, 10-year Treasury, weekly mortgage average) and a pre-meeting checklist; all other figures re-verified.';
research.models={research:reviewer,write:reviewer};
research.reader='Gulf Coast buyer or rental owner comparing a loan; secondary seller application';
research.decision='Compare written financing offers and decide whether points, a rate lock and the total property budget fit the intended use.';
research.readerTask=research.decision;
research.originalValue='Connect national rate reporting to a real comparison method: separate the overnight federal funds rate from 30-year mortgage pricing with dated official figures, explain what a spread includes, avoid mismatched survey/daily claims, provide reproducible payment and points math, show what changes for sellers and rental owners, and require property-specific carrying costs.';
const notes={
 pmms:'Opened September 14: the live page still shows the September 10, 2026 release, 30-year 6.76%, prior week (September 3) 6.71%, 15-year 6.09%. Methodology text: averages of loan applications submitted through Loan Product Advisor, weekly conventional conforming single-family originations, rates offered the prior Thursday through Wednesday. Next release expected Thursday September 17.',
 'fed-spread':'Re-read section III.A (Decomposing the Mortgage-Treasury Spread) in the PDF text this session: equation (1) splits the mortgage-Treasury spread into the primary-secondary spread and the MBS yield spread; equation (2) splits the MBS yield spread into duration adjustment, option cost and OAS. Front matter states the opinions are the authors\' and do not represent the Federal Reserve Board or System.',
 credit:'Reopened September 14 (page last reviewed December 31, 2024): credit score and report information determine whether you can get a mortgage and the rate you pay; higher scores make lower rates available; lenders also weigh debt, savings, assets and income.',
 points:'Reopened September 14 (last reviewed October 19, 2023): one point equals one percent of the loan amount; the rate reduction depends on the lender, loan kind and market; points appear on page 2, Section A of the Loan Estimate and Closing Disclosure.',
 lock:'Reopened September 14 (last reviewed May 2, 2023): locks are typically 30, 45 or 60 days and sometimes longer; extending can be expensive; a locked rate can still change if the loan amount, credit score or verified income change.',
 estimate:'Reopened September 14: request Loan Estimates for the same kind of loan from different lenders; interest rate and estimated total monthly payment on page 1; closing costs and cash to close on page 2; APR is one measure of loan cost and differs from the interest rate.',
 occupancy:'Reopened September 14 (effective October 5, 2022): second home must be occupied by the borrower for some portion of the year, one unit, exclusive control, not rental property and not subject to a management-firm occupancy agreement; investment property is owned but not occupied by the borrower.'
};
for(const s of research.sources){s.checkedAt=date;s.geography=s.geography||'United States';s.propertyType=s.propertyType||'Residential mortgage, with stated source scope';if(notes[s.id])s.evidenceNote=notes[s.id];}
research.sources.find(s=>s.id==='pmms').reportingDate='2026-09-10';
const fedUrl='https://www.federalreserve.gov/newsevents/pressreleases/monetary20260729a.htm',calUrl='https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm',policyUrl='https://www.federalreserve.gov/monetarypolicy/monetary-policy-what-are-its-goals-how-does-it-work.htm',tsyUrl='https://home.treasury.gov/resource-center/data-chart-center/interest-rates/TextView?type=daily_treasury_yield_curve&field_tdr_date_value=2026';
research.sources.push(
 {id:'fed',publisher:'Federal Reserve Board',title:'Federal Reserve issues FOMC statement, July 29, 2026',url:fedUrl,primary:true,checkedAt:date,reportingDate:'2026-07-29',geography:'United States',propertyType:'Monetary policy; not a mortgage product',evidenceNote:'Opened September 14: statement released July 29, 2026 says the Committee decided to maintain the target range for the federal funds rate at 3-1/2 to 3-3/4 percent; three dissents preferred an increase. No newer statement exists yet.'},
 {id:'calendar',publisher:'Federal Reserve Board',title:'FOMC meeting calendars and information',url:calUrl,primary:true,checkedAt:date,reportingDate:date,geography:'United States',propertyType:'Policy calendar',evidenceNote:'Opened September 14: 2026 calendar lists September 15-16 (with a Summary of Economic Projections), then October 27-28 and December 8-9; no September statement released yet. Each date is tentative until confirmed at the preceding meeting.'},
 {id:'transmission',publisher:'Federal Reserve Board',title:'Monetary Policy: What Are Its Goals? How Does It Work?',url:policyUrl,primary:true,checkedAt:date,reportingDate:'undated explanatory page reviewed this session',geography:'United States',propertyType:'Policy and long-term credit generally',evidenceNote:'Opened September 14: defines the federal funds rate as the interest rate banks pay to borrow reserve balances overnight, and states that rates on longer-term loans relate to expectations of how policy and the economy will evolve over the life of the loan, not just the current federal funds rate.'},
 {id:'treasury',publisher:'U.S. Department of the Treasury',title:'Daily Treasury Par Yield Curve Rates, 2026',url:tsyUrl,primary:true,checkedAt:date,reportingDate:'2026-09-11',geography:'United States',propertyType:'Government securities; not a mortgage product',evidenceNote:'Downloaded the 2026 daily par yield curve CSV September 14: 10-year par yield 4.96% on September 11, 2026 (4.95% on September 10, 4.83% on September 9). Single-day closes, not a weekly average.'}
);
const check=(finding)=>({reviewer,date,finding});
for(const c of research.claims){c.accessed=date;if(c.independentCheck)c.independentCheck={reviewer,date,finding:c.independentCheck.finding};}
const fact=(id,text,sourceIds,scope,asOf,extra={})=>({id,kind:'fact',text,claim:text,sourceIds,scope,asOf,perishable:false,loadBearing:true,status:'verified',accessed:date,sourceUrl:research.sources.find(s=>s.id===sourceIds[0]).url,verification:'Read directly at the primary source this session.',independentCheck:check('Read directly at the primary source this session.'),...extra});
research.claims.push(
 fact('fed-target','the Federal Reserve held the federal funds target range at 3.50% to 3.75% in its July 29, 2026 statement',['fed'],'Federal funds target range; policy rate, not a mortgage rate',
  '2026-07-29',{perishable:true,expires:'2026-09-16',locator:'Statement paragraph beginning "the Committee decided to maintain the target range"',verification:'Opened the July 29 press release and read the target-range sentence; the calendar shows no later statement.',independentCheck:check('Opened the July 29 press release and confirmed 3-1/2 to 3-3/4 percent maintained; calendar shows no later statement as of September 14.')}),
 fact('fed-definition','The federal funds rate is the interest rate banks pay to borrow reserve balances overnight',['transmission'],'Definition of the policy rate','2026-09-14',{locator:'Section "The federal funds rate"',verification:'Read the definition sentence on the Federal Reserve policy explainer.',independentCheck:check('Read the definition sentence directly; matches the article wording.')}),
 fact('long-term-expectations','longer-term loan rates relate to expectations of how policy and the economy will evolve over the life of the loan, not just the current federal funds rate',['transmission'],'General long-term credit transmission; not an individual quote','2026-09-14',{locator:'Section "How changes in the federal funds rate affect the broader economy"',verification:'Read the expectations passage on the Federal Reserve policy explainer.',independentCheck:check('Read the passage; the article paraphrases it without implying a one-for-one mortgage response.')}),
 fact('meeting','The Fed calendar lists September 15 and 16, 2026 for the next meeting',['calendar'],'FOMC schedule; tentative until confirmed at the preceding meeting','2026-09-14',{perishable:true,expires:'2026-09-16',locator:'2026 table row for September',verification:'Read the 2026 FOMC calendar table.',independentCheck:check('Calendar row shows September 15-16 with SEP; no statement yet.')}),
 fact('treasury-10y','4.96% par yield on September 11, 2026',['treasury'],'Single-day par yield from the Treasury daily curve; not a mortgage rate and not a weekly average','2026-09-11',{perishable:true,expires:'2026-09-21',locator:'Daily Treasury Par Yield Curve Rates CSV, row 09/11/2026, column 10 Yr',verification:'Downloaded the Treasury CSV and read the 09/11/2026 row.',independentCheck:check('CSV row 09/11/2026 shows 10 Yr 4.96; September 10 row 4.95.')})
);
// Load-bearing calculation rechecks recorded from this session's independent recomputation.
const pay=(P,a,n)=>{const r=a/1200;return P*r/(1-Math.pow(1+r,-n));};
research.independentVerification={date,provider:'claude',model:'claude-opus-5[1m]',method:'Direct primary-source reading plus separate Node amortization recomputation',checks:[
 {item:'PMMS current',result:'September 10, 2026 release 30-year 6.76%; page unchanged September 14; next release September 17.'},
 {item:'PMMS prior',result:'6.71% labeled as the prior week (September 3).'},
 {item:'Federal funds target',result:'July 29, 2026 statement maintained 3-1/2 to 3-3/4 percent; no later statement.'},
 {item:'Next FOMC meeting',result:'September 15-16, 2026 in the Federal Reserve calendar.'},
 {item:'10-year Treasury',result:'4.96% par yield September 11, 2026 from the Treasury daily CSV.'},
 {item:'Payment at 6.25% / 6.75% / 7.25%',result:[pay(400000,6.25,360),pay(400000,6.75,360),pay(400000,7.25,360)],display:[2462.87,2594.39,2728.71]},
 {item:'Points break-even',result:4000/65,display:'about 61.5 months'},
 {item:'Ownership total',result:2594.39+400+250+75+100+200+225,display:3844.39}
]};
research.measurementDecision={selection:'owner-requested-refresh (queue requestedOrder 2, notBefore 2026-09-14)',verifiedOverride:false,newsReview:'September 14 web review: NHC shows no Gulf threat (only a low-chance Atlantic disturbance far from the U.S.); the Fed decision is scheduled September 16, after this run; Florida insurance coverage repeats the already published Citizens 2026 rate filing; no verified consequential event displaced the owner request.',bing:'Live September 14 collection: 2 page rows (a school page and the homepage), 6 query rows, 19 traffic days through September 12, site 43 impressions and 2 clicks trailing 28 days; no /blog/* rows (unknown). GetUrlInfo returned HTTP 400 for three URLs. Signed-in URL Inspection: this article is Discovered but not crawled, discovered August 26, 2026, not in the Bing index.',clarity:'Civilian project ydd39cyp64 opened in the signed-in browser for September 7-13 UTC: 145 sessions (40 bot sessions excluded), 89 unique users; no /blog/* URL among the top 12 pages; internal referrers present. CSV retained. Connector remains bound to the military project.',gsc:'Retained September 12 workbook (selected August 14-September 10, chart August 23-September 10, article absent); no new export requested. Article performance in Google unknown.',clientQuestions:'content/measure/client-questions.json is not present in the committed tree used for this run; no verified recurring client questions were available.'};
research.searchLandscape={checkedAt:date,status:'Reviewed primary-source pages and this week\'s rate coverage. Observed Bing query rows for greggcostin.com were school and team-name queries; no mortgage demand was observed, so every question below is labeled by its actual origin.',
 results:research.sources.map(s=>({url:s.url,title:s.title,observation:s.evidenceNote})),
 informationGain:'Current top results for mortgage-rate questions report daily quotes and a weekly average without saying which window they come from, and they treat a Fed meeting as if it set the mortgage rate. This guide separates the overnight policy rate, the 10-year Treasury and the weekly mortgage average with dated official figures, shows why a spread cannot be added twice, and turns the comparison into a reproducible payment, points and lock decision for a Gulf Coast property with its own taxes, insurance and rental rules.',
 questions:[
  ['What moves mortgage rates?','editorial',null,'Title intent of the existing guide.'],
  ['What is the current mortgage-rate benchmark?','source','pmms','Freddie Mac weekly survey wording.'],
  ['What is the federal funds rate, and does it set your mortgage rate?','source','transmission','Federal Reserve policy explainer defines the overnight rate; owner request asked for this separation.'],
  ['Does a Fed rate hike raise mortgage rates by the same amount?','source','transmission','Expectations passage on the Federal Reserve explainer.'],
  ['Why is my mortgage quote higher than the national average?','editorial',null,'Editorial hypothesis from the PMMS scope note.'],
  ['What does a rate change actually do to the payment?','editorial',null,'Hypothetical amortization sensitivity.'],
  ['When are discount points worth paying?','source','points','CFPB points guidance wording.'],
  ['When should you lock a mortgage rate?','source','lock','CFPB rate-lock guidance wording.'],
  ['Can my rate change after I lock it?','source','lock','CFPB lists application changes that alter a locked rate.'],
  ['How do I compare Loan Estimates from different lenders?','source','estimate','CFPB Loan Estimate explainer wording.'],
  ['Should a seller offer a rate buydown or reduce the price?','editorial',null,'Seller application of the same math.'],
  ['Can I use a second-home mortgage for a vacation rental?','source','occupancy','Fannie Mae occupancy definitions.'],
  ['Does the 10-year Treasury yield predict my mortgage rate?','source','fed-spread','Spread decomposition in FEDS 2021-048.'],
  ['What should I do before the September Fed meeting?','source','calendar','Meeting date from the Fed calendar; editorial framing of the buyer step.']
 ].map(([question,origin,id,provenance])=>({question,origin,...(id?{source:research.sources.find(s=>s.id===id).url,sourceUrl:research.sources.find(s=>s.id===id).url}:{}),checkedAt:date,provenance})),
 provenanceNote:'Primary-source wording and explicitly labeled editorial questions. Not People Also Ask, not measured volume and not observed reader demand: Bing rows for this domain contained no mortgage queries this run.'};
research.scopeChecks={...research.scopeChecks,professionalReview:'Agent editorial review only; no lender, attorney, tax adviser or Gregg sign-off claimed.',numbers:'PMMS, policy target, meeting date and Treasury yield opened at their sources September 14. Hypothetical loan inputs remain invented illustrations. No forecast of the September 16 decision, no local rate and no spread computed from mismatched windows.',counterargument:'Waiting for the meeting can be right when the budget or reserves do not fit; a lock can exclude later lower pricing and carries lender-specific conditions. A national average can move without your quote moving.',currentEvents:'No override. Owner-requested refresh executed on its notBefore date.'};
writeFileSync(researchFile,JSON.stringify(research,null,2)+'\n'); // research brief precedes prose changes

// PAGE header
spec.dateModified=date;
spec.description='What moves mortgage rates, how the federal funds rate differs from your quote, and how Gulf Coast buyers and rental owners compare points, payments and rate locks.';
spec.keywords='what moves mortgage rates, federal funds rate vs mortgage rates, mortgage rate lock, discount points break even';
spec.targetKeywords=['what moves mortgage rates','federal funds rate vs mortgage rates','when should I lock my mortgage rate','are discount points worth it'];
spec.quickAnswer='As of September 14, 2026, the latest Freddie Mac weekly survey (September 10) put the 30-year fixed average at 6.76%, and the Federal Reserve held its federal funds target at 3.50% to 3.75% on July 29. Neither number is your quote. The property, borrower, loan structure and fees set the rate a lender offers, so compare written offers on the same assumptions before locking or paying points.';
spec.takeaways=['A national rate average is a reference point, not a quote for your property.','The federal funds rate is an overnight bank rate; a 30-year mortgage is priced on longer-term expectations, so the two do not move one-for-one.','Compare the rate, points, total payment and cash to close together.','Use your expected loan holding period when evaluating upfront fees.','Test rental cash flow at the actual financing terms, without relying on a future refinance.'];
spec.perishables=[
 {claimId:'pmms-current',claim:'Freddie Mac 30-year average 6.76% as of September 10, 2026',expires:'2026-09-17',source:'https://www.freddiemac.com/pmms'},
 {claimId:'pmms-prior',claim:'Prior weekly average 6.71% for September 3, 2026',expires:'2026-09-17',source:'https://www.freddiemac.com/pmms'},
 {claimId:'fed-target',claim:'Federal funds target range 3.50% to 3.75%, maintained July 29, 2026',expires:'2026-09-16',source:fedUrl},
 {claimId:'meeting',claim:'Next FOMC meeting September 15-16, 2026',expires:'2026-09-16',source:calUrl},
 {claimId:'treasury-10y',claim:'10-year Treasury par yield 4.96% on September 11, 2026',expires:'2026-09-21',source:tsyUrl},
 {claimId:'occupancy',claim:'Fannie Mae second-home and investment occupancy requirements checked September 14, 2026',expires:'2026-10-14',source:'https://guide-selling.fanniemae.com/sel/b2-1.1-01/occupancy-types'}
];
spec.editorial.originalValue=research.originalValue;
spec.faqs=spec.faqs.map(x=>x.q==='Does the Federal Reserve set my mortgage rate?'?{q:x.q,a:'No. The Fed sets a target for the federal funds rate, which is what banks pay to borrow reserves overnight. Your lender prices a 30-year mortgage on longer-term expectations, funding costs and your loan details, so a policy move does not carry over one-for-one. Treat a Fed headline as context, then ask for a fresh written quote before changing your budget or financing plan.'}:x);
spec.excerpt=spec.lead;

// Body: replace the Fed section with the expanded federal-funds section and benchmark table.
const oldFed=body.slice(body.indexOf('<h2>Why do mortgage rates move differently from the Fed?</h2>'),body.indexOf('<h2>Why does your quote differ from someone else\'s?</h2>'));
if(!oldFed)throw Error('Fed section not found');
const newFed=`<h2>What is the federal funds rate, and does it set your mortgage rate?</h2>
<p data-claim="fed-definition fed-target">No. The federal funds rate is the interest rate banks pay to borrow reserve balances overnight, and the Federal Reserve held the federal funds target range at 3.50% to 3.75% in its <a href="${fedUrl}">July 29, 2026 statement</a>. A 30-year mortgage is a different instrument with its own pricing, so a policy change does not carry over to your quote one-for-one.</p>
<p data-claim="long-term-expectations meeting">The Fed's own <a href="${policyUrl}">policy explainer</a> makes the distinction: longer-term loan rates relate to expectations of how policy and the economy will evolve over the life of the loan, not just the current federal funds rate. The <a href="${calUrl}">Fed calendar lists September 15 and 16, 2026 for the next meeting</a>. Markets price what they expect from that meeting before it happens, which is why a mortgage quote can move ahead of an announcement and barely react afterward.</p>
<div class="blog-table-scroll" role="region" aria-label="Three interest-rate benchmarks compared" tabindex="0">
<table>
<caption>Three benchmarks, three different windows, checked September 14, 2026</caption>
<thead><tr><th scope="col">Benchmark</th><th scope="col">Latest figure and window</th><th scope="col">What it is</th><th scope="col">What it means for your quote</th></tr></thead>
<tbody>
<tr><th scope="row">Federal funds target range</th><td>3.50% to 3.75%, maintained July 29, 2026</td><td>Overnight bank-to-bank borrowing rate set by the FOMC</td><td>Background for financing conditions; not a mortgage price</td></tr>
<tr data-claim="treasury-10y"><th scope="row">10-year Treasury yield</th><td>4.96% par yield on September 11, 2026, a single-day close from the <a href="${tsyUrl}">Treasury daily curve</a></td><td>Market yield on a government note investors compare with mortgage bonds</td><td>Useful context for a changing quote; there is no fixed spread that turns it into your rate</td></tr>
<tr><th scope="row">30-year mortgage average</th><td>6.76% for the week ending September 10, 2026, per Freddie Mac</td><td>Weekly average of conventional purchase applications, Thursday through Wednesday</td><td>A national reference point; your written offer is the number to decide on</td></tr>
</tbody>
</table>
</div>
<p>Do not subtract one row from another to get a spread. The three figures come from different days and different windows, and the difference between a mortgage rate and a Treasury yield already includes costs a headline does not show.</p>
<p data-claim="spread">Federal Reserve researchers <a href="https://www.federalreserve.gov/econres/feds/files/2021048pap.pdf">separate mortgage pricing into the yield on mortgage-backed securities and the additional costs between investors and borrowers</a>. The difference between a mortgage rate and a Treasury yield includes both. Adding a lender margin again after using that full difference would double-count part of the cost.</p>
<p>Mortgages can also be paid off early, so their effective duration changes, and mortgage investors price that prepayment risk. Inflation, growth, market volatility and the demand for mortgage investments all feed into the quote before your own loan details do.</p>
<ul>
<li><strong>A policy decision:</strong> useful background for financing conditions.</li>
<li><strong>A bond-market move:</strong> useful context for a changing quote.</li>
<li><strong>A written lender offer:</strong> the number to use for your actual decision.</li>
</ul>

`;
body=body.replace(oldFed,newFed);
// Pre-meeting step in the closing section, linking the sibling Fed guide.
body=body.replace('<p>Ask lenders to price the same property use, loan amount, term, lock period and points. Keep the offers together with your ownership budget. Review the assumptions whenever a material detail changes, including your expected holding period.</p>',
'<p>Ask lenders to price the same property use, loan amount, term, lock period and points. Keep the offers together with your ownership budget. Review the assumptions whenever a material detail changes, including your expected holding period.</p>\n<p>With a Fed meeting on the calendar this week, the useful preparation is small: save the current written quote, note the lock expiration and confirm which application changes could alter locked terms. After the announcement, compare a fresh quote against the saved one on identical assumptions. Our <a href="/blog/fed-rate-hike-what-it-means">Fed decision guide for buyers</a> walks through that comparison.</p>');
body=body.replace('<p>Sources were checked September 10, 2026. Market figures retain their reporting dates.','<p>Sources were checked September 14, 2026. Market figures retain their reporting dates.');
body=body.replace('<li><a href="https://www.freddiemac.com/pmms">Freddie Mac: Primary Mortgage Market Survey</a></li>',
`<li><a href="https://www.freddiemac.com/pmms">Freddie Mac: Primary Mortgage Market Survey</a></li>
<li><a href="${fedUrl}">Federal Reserve Board: FOMC statement, July 29, 2026</a></li>
<li><a href="${calUrl}">Federal Reserve Board: FOMC meeting calendars</a></li>
<li><a href="${policyUrl}">Federal Reserve Board: Monetary Policy: What Are Its Goals? How Does It Work?</a></li>
<li><a href="${tsyUrl}">U.S. Treasury: Daily Treasury Par Yield Curve Rates</a></li>`);
if(!body.includes(newFed.trim())||!body.includes('Fed decision guide for buyers')||!body.includes('checked September 14, 2026'))throw Error('body edits did not apply');
writeFileSync(f,'<!--PAGE '+JSON.stringify(spec,null,2)+' PAGE-->\n\n'+body+'\n');
const words=body.replace(/<[^>]+>/g,' ').trim().split(/\s+/).length;
const report=new URL('docs/civilian-blog-engine/2026-09-14/',root);mkdirSync(report,{recursive:true});
writeFileSync(new URL('source-checks.json',report),JSON.stringify({reviewDate:date,provider:'claude',model:'claude-opus-5[1m]',selectionReason:'Scheduled run; Claude primary provider available',sources:research.sources,verification:research.independentVerification,measurement:research.measurementDecision},null,2)+'\n');
console.log(JSON.stringify({slug,descriptionLength:spec.description.length,bodyWords:words,sources:research.sources.length,claims:research.claims.length,quickAnswerWords:spec.quickAnswer.split(/\s+/).length}));
