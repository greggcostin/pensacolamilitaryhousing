import test from 'node:test';
import assert from 'node:assert/strict';
import {monthlyPrincipalInterest,amortize,fhaTerms,fhaMonthlyPremiums,loanScenario,ownershipPeriod,affordablePrice,rentalScenario,rentalDownside} from '../mortgage-math.mjs';
import {loanDefaults,defaultState,renderCalculatorSuite,exportRows,validateState} from '../civilian-calculator-ui.mjs';
const near=(a,b,t=.01)=>assert.ok(Math.abs(a-b)<t,`${a} differs from ${b}`);
const loan=overrides=>({...loanDefaults(),...overrides});
test('standard fixed-rate payment agrees with independent payment fixture',()=>{
 near(monthlyPrincipalInterest(280000,6.5,360),1769.7904657803);
 near(monthlyPrincipalInterest(100000,6,360),599.55052515);
});
test('zero interest and near-zero interest remain finite and consistent',()=>{
 near(monthlyPrincipalInterest(120000,0,120),1000);
 near(monthlyPrincipalInterest(120000,1e-9,120),1000,.0001);
 assert.equal(monthlyPrincipalInterest(0,6.5,360),0);
});
test('amortization conserves principal and caps a very large extra payment',()=>{
 const s=amortize(280000,6.5,360,{monthly:250});
 near(s.totalPrincipal,280000);near(s.rows.at(-1).balance,0);
 assert.ok(s.months<360);assert.ok(s.totalInterest<amortize(280000,6.5,360).totalInterest);
 const fast=amortize(1000,12,12,{lump:1e8,lumpMonth:1});
 assert.equal(fast.months,1);near(fast.totalPaid,1010);near(fast.rows[0].extra,1000-(amortize(1000,12,12).payment-10));
});
test('annual and one-time extras occur in the selected months only',()=>{
 const s=amortize(100000,5,360,{annual:1000,lump:2000,lumpMonth:7});
 assert.equal(s.rows[6].extra,2000);assert.equal(s.rows[11].extra,1000);assert.equal(s.rows[23].extra,1000);assert.equal(s.rows[0].extra,0);
});
test('HUD historical premium example independently validates rounding and financing adjustment',()=>{
 const p=fhaMonthlyPremiums(106605,7.5,360,.5,.0225,745.4);
 assert.equal(p[0],43.26);assert.equal(p[1],42.85);
});
test('FHA table boundaries depend on base amount, original LTV and term',()=>{
 assert.deepEqual(fhaTerms(726200,.95,360),{annualPercent:.5,duration:360,upfrontPercent:1.75});
 assert.equal(fhaTerms(726200,.950001,360).annualPercent,.55);
 assert.equal(fhaTerms(726201,.95,360).annualPercent,.7);
 assert.equal(fhaTerms(726201,.950001,360).annualPercent,.75);
 assert.equal(fhaTerms(300000,.90,360).duration,132);
 assert.equal(fhaTerms(300000,.90001,360).duration,360);
 assert.equal(fhaTerms(300000,.90,180).annualPercent,.15);
 assert.equal(fhaTerms(300000,.90001,180).annualPercent,.4);
 assert.equal(fhaTerms(750000,.78,180).annualPercent,.15);
 assert.equal(fhaTerms(750000,.78001,180).annualPercent,.4);
 assert.equal(fhaTerms(750000,.90001,180).annualPercent,.65);
});
test('FHA premiums decline by scheduled year and end at the supported duration',()=>{
 const x=loanScenario(loan({type:'fha',downPct:10}));
 assert.ok(x.actual.rows[12].mi<x.actual.rows[0].mi);
 assert.ok(x.actual.rows[131].mi>0);assert.equal(x.actual.rows[132].mi,0);
});
test('VA first use, subsequent use, down bands and exemption use base-loan fee',()=>{
 const x=loanScenario(loan({type:'va',downPct:0,price:350000}));
 assert.equal(x.upfrontFee,7525);assert.equal(x.principal,357525);assert.equal(x.initialMI,0);
 assert.equal(loanScenario(loan({type:'va',downPct:0,vaUse:'subsequent'})).feePercent,3.3);
 assert.equal(loanScenario(loan({type:'va',downPct:5})).feePercent,1.5);
 assert.equal(loanScenario(loan({type:'va',downPct:10})).feePercent,1.25);
 assert.equal(loanScenario(loan({type:'va',downPct:0,vaExempt:'yes'})).upfrontFee,0);
});
test('financing a program fee changes principal and cash exactly once',()=>{
 const a=loanScenario(loan({type:'va',downPct:0,financeFee:'yes'})),b=loanScenario(loan({type:'va',downPct:0,financeFee:'no'}));
 near(a.principal-b.principal,a.upfrontFee);near(b.transactionCash-a.transactionCash,a.upfrontFee);
 near(ownershipPeriod(a,5).cost-ownershipPeriod(b,5).cost,ownershipPeriod(a,5).interest-ownershipPeriod(b,5).interest);
});
test('conventional PMI automatic termination does not move with extra payments',()=>{
 const a=loanScenario(loan({downPct:10})),b=loanScenario(loan({downPct:10}),{monthly:100});
 assert.equal(a.pmiStopMonth,b.pmiStopMonth);assert.equal(a.actual.rows[a.pmiStopMonth-1].mi,0);assert.ok(a.actual.rows[a.pmiStopMonth-2].mi>0);
 assert.equal(loanScenario(loan({downPct:20})).initialMI,0);
});
test('all-in payment includes separate flood and HOA exactly once',()=>{
 const a=loanScenario(loan({downPct:20,price:350000,tax:3500,insurance:3000,flood:1000,hoa:100}));
 near(a.totalMonthly,2494.7904657803);
});
test('cash to close subtracts credits and earnest deposit, reserves remain separate',()=>{
 const a=loanScenario(loan({price:300000,downPct:20,points:1,lenderFees:1000,otherClosing:2000,prepaid:500,escrow:1500,credits:1000,deposit:5000,reserves:6000,moving:2000}));
 assert.equal(a.pointsCost,2400);assert.equal(a.closingBeforeCredits,7400);assert.equal(a.transactionCash,66400);assert.equal(a.cashToClose,61400);assert.equal(a.allCashNeeded,74400);
});
test('starting escrow changes cash plan without double-counting period expense',()=>{
 const a=loanScenario(loan({escrow:0,prepaid:0})),b=loanScenario(loan({escrow:5000,prepaid:2000}));
 near(ownershipPeriod(a,5).cost,ownershipPeriod(b,5).cost);near(b.transactionCash-a.transactionCash,7000);
});
test('ownership cost is distinct from equity; remaining balance reaches zero after term',()=>{
 const a=loanScenario(loan({years:10})),p=ownershipPeriod(a,15);
 assert.equal(p.balance,0);near(p.equity,a.input.price);near(p.principalPaid,a.principal);
 near(p.cost,p.interest+p.mi+a.borrowingFees+a.input.otherClosing-a.input.credits+a.ownershipMonthly*180);
});
test('payment-target solver finds a price that reproduces the target',()=>{
 const x=loan({downPct:10}),price=affordablePrice(x,2500);
 near(loanScenario({...x,price}).totalMonthly,2500,.02);
 assert.equal(affordablePrice(x,100),null);assert.equal(affordablePrice({...x,downPct:100},2500),null);
});
test('invalid, negative, NaN and unsupported down-payment inputs cannot produce estimates',()=>{
 for(const x of [loan({rate:NaN}),loan({price:-1}),loan({type:'fha',downPct:0}),loan({type:'conv',downPct:0}),loan({downPct:101}),loan({credits:1e8}),loan({deposit:1e8})])assert.throws(()=>loanScenario(x));
 assert.throws(()=>monthlyPrincipalInterest(100000,5,0));assert.throws(()=>amortize(100000,5,360,{monthly:-5}));
});
test('rental NOI excludes debt and replacement reserve; cash flow subtracts both',()=>{
 const x={...defaultState().rentals.long,price:300000,downPct:100,rent:2000,occupancy:100,personalNights:0,management:10,platform:0,maintenance:5,replacement:5,tax:2400,insurance:1200,flood:0,hoa:0,utilities:0,licenses:0,other:0,turnovers:0,closing:0,setup:0,reserve:0};
 const r=rentalScenario(x);
 assert.equal(r.rentRevenue,24000);assert.equal(r.operating,7200);assert.equal(r.noi,16800);assert.equal(r.replacement,1200);assert.equal(r.cashFlow,15600);assert.equal(r.debt,0);assert.equal(r.dscr,null);near(r.capRate,5.6);near(r.cashOnCash,5.2);
});
test('vacation rental availability, turnover, cleaning collection and platform fees reconcile',()=>{
 const x={...defaultState().rentals.short,rent:200,occupancy:50,personalNights:65,averageStay:5,cleaningCharged:100,cleaningCost:150,management:20,platform:3};
 const r=rentalScenario(x);
 assert.equal(r.availableNights,300);assert.equal(r.rentRevenue,30000);assert.equal(r.stays,30);assert.equal(r.cleaningRevenue,3000);assert.equal(r.cleaningCost,4500);assert.equal(r.fees,6990);
});
test('rental break-even reproduces zero cash flow for each strategy',()=>{
 for(const x of Object.values(defaultState().rentals)){
  const r=rentalScenario({...x,downPct:100});
  assert.ok(r.breakEvenOccupancy>0&&r.breakEvenOccupancy<100);
  near(rentalScenario({...x,downPct:100,occupancy:r.breakEvenOccupancy}).cashFlow,0,.02);
 }
});
test('zero occupancy, no available nights, all-cash and negative returns remain honest',()=>{
 const x=defaultState().rentals.short;
 assert.ok(rentalScenario({...x,occupancy:0}).cashFlow<0);
 assert.equal(rentalScenario({...x,personalNights:365}).breakEvenOccupancy,null);
 assert.equal(rentalScenario({...x,downPct:100,monthlyMI:200}).debt,0);
 assert.throws(()=>rentalScenario({...x,occupancy:101}));assert.throws(()=>rentalScenario({...x,rent:undefined}));
 assert.ok(rentalDownside(x).cashFlow<rentalScenario(x).cashFlow);
});
test('rendered initial experience has five panels, labels and a native first estimate',()=>{
 const html=renderCalculatorSuite();
 assert.equal((html.match(/role="tabpanel"/g)||[]).length,5);
 assert.ok(html.includes('Estimated total monthly cost'));
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length);
 for(const m of html.matchAll(/<input\b[^>]*id="([^"]+)"/g))assert.ok(html.includes(`for="${m[1]}"`));
});
test('CSV export contains inputs and finite financial results',()=>{
 const csv=exportRows();assert.ok(csv.includes('"price","350000"'));assert.ok(csv.includes('"Full monthly cost","2690.18"'));assert.ok(!csv.includes('NaN'));assert.ok(!csv.includes('Infinity'));
});
test('extras after the loan term and fractional ownership periods are rejected',()=>{
 assert.throws(()=>amortize(100000,5,120,{lump:5000,lumpMonth:121}));
 assert.throws(()=>ownershipPeriod(loanScenario(loan({})),2.5));
});

test('saved estimates validate budget, extra payments and comparison horizon before writing',()=>{
 assert.ok(validateState(defaultState()));
 for(const update of [s=>s.budget.target=NaN,s=>s.extra.monthly=-5,s=>s.horizon=2.5]){const s=defaultState();update(s);assert.throws(()=>validateState(s));}
});
