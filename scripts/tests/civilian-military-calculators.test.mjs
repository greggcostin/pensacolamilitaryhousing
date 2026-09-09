import test from 'node:test';
import assert from 'node:assert/strict';
import {amortize,MODEL_VERSION} from '../mortgage-math.mjs';
import {defaultState,restoreSavedEstimate,renderCalculatorSuite} from '../civilian-calculator-ui.mjs';
import {computeLoanProduct,toMilitaryLoan,fromMilitaryLoan,runAmortSchedule,comparisonPeriod} from '../military-calculator-adapter.mjs';
import {renderPortedCalculatorPanels} from '../build-civilian-calculators.mjs';
const near=(a,b,t=.00001)=>assert.ok(Math.abs(a-b)<t,`${a} != ${b}`);

test('accelerated frequency is exactly 13 monthly-equivalent payments per year',()=>{
 const monthly=amortize(120000,0,120),biweekly=amortize(120000,0,120,{freq:'biweekly'}),weekly=amortize(120000,0,120,{freq:'weekly'});
 near(monthly.payment,1000);near(biweekly.rows[0].extra,1000/12);
 near(biweekly.rows.slice(0,12).reduce((sum,r)=>sum+r.payment,0),13000);
 assert.deepEqual(weekly,biweekly);near(weekly.totalPrincipal,120000);assert.equal(weekly.months,111);
});
test('custom recurring payments begin in the requested month and follow their cadence',()=>{
 const schedule=frequency=>amortize(120000,0,360,{customAmt:120,customStart:7,customFreq:frequency});
 for(const frequency of ['weekly','monthly','quarterly','annual','onetime']){
  const s=schedule(frequency);assert.ok(s.rows.slice(0,6).every(r=>r.extra===0));
  near(s.rows[6].extra,frequency==='weekly'?520:120);near(s.totalPrincipal,120000);near(s.rows.at(-1).balance,0);
 }
 assert.equal(schedule('quarterly').rows[7].extra,0);assert.equal(schedule('quarterly').rows[9].extra,120);
 assert.equal(schedule('annual').rows[17].extra,0);assert.equal(schedule('annual').rows[18].extra,120);
 assert.equal(schedule('onetime').rows[7].extra,0);assert.equal(schedule('monthly').rows[7].extra,120);
});
test('annual, regular and custom payments combine once and final principal is capped',()=>{
 const s=amortize(120000,0,360,{monthly:100,annual:1000,customAmt:500,customStart:12,customFreq:'annual'});
 assert.equal(s.rows[0].extra,100);assert.equal(s.rows[11].extra,1600);assert.equal(s.rows[23].extra,1600);
 const fast=amortize(1000,0,12,{freq:'weekly',monthly:100,customAmt:1e7,customStart:2});
 assert.equal(fast.months,2);near(fast.totalPrincipal,1000);near(fast.rows.at(-1).balance,0);
});
test('invalid recurring settings never generate apparently valid estimates',()=>{
 for(const extras of [{freq:'daily'},{customFreq:'daily'},{customAmt:-1},{customStart:1.5},{customStart:0},{customAmt:100,customStart:121},{customAmt:NaN}])assert.throws(()=>amortize(120000,5,120,extras));
});
test('ported product cards preserve full housing cost, cash and optional principal separately',()=>{
 const loan={...defaultState().loan,flood:1200,hoa:125,extra:200,deposit:5000};
 const r=computeLoanProduct(toMilitaryLoan(loan));
 near(r.totalMonthly,r.basePmt+r.miMonthly+loan.tax/12+loan.insurance/12+100+125);
 near(r.plannedMonthly,r.totalMonthly+200);near(r.sched.schedule[0].extra,200);
 assert.equal(r.cashToClose,40000);near(r.sched.schedule.reduce((s,r)=>s+r.principal,0),r.totalLoan);
 assert.equal(comparisonPeriod(r,30).balance,0);
});
test('VA fee use, exemption and cash financing survive the UI adapter round trip',()=>{
 const x={...defaultState().loan,type:'va',downPct:0,vaUse:'subsequent',vaExempt:'no',financeFee:'yes'};
 assert.deepEqual(fromMilitaryLoan(toMilitaryLoan(x)),x);
 const financed=computeLoanProduct(toMilitaryLoan(x)),cash=computeLoanProduct(toMilitaryLoan({...x,financeFee:'no'}));
 assert.equal(financed.feePercent,3.3);near(financed.totalLoan-cash.totalLoan,11550);near(cash.cashToClose-financed.cashToClose,11550);
 assert.equal(computeLoanProduct(toMilitaryLoan({...x,vaExempt:'yes'})).upfrontFee,0);
});
test('FHA premium duration and original-schedule PMI remain correct with comparison extras',()=>{
 const base=defaultState().loan;
 const fha=computeLoanProduct(toMilitaryLoan({...base,type:'fha',downPct:10}));
 assert.equal(fha.pmiMonths,132);assert.equal(fha.sched.schedule[132].mi,0);
 const slow=computeLoanProduct(toMilitaryLoan(base)),fast=computeLoanProduct(toMilitaryLoan({...base,extra:100}));
 assert.equal(slow.pmiStopMonth,fast.pmiStopMonth);assert.equal(slow.pmiMonths,fast.pmiMonths);
});
test('partial final loan year keeps its exact payoff month in annual graph and table data',()=>{
 const s=runAmortSchedule({P:120000,mRate:0,N:120,extras:{freq:'weekly'}});
 assert.equal(s.byYear.at(-1).endMonth,111);assert.equal(s.byYear.at(-1).year,10);near(s.byYear.at(-1).balance,0);
 near(s.byYear.reduce((sum,y)=>sum+y.principal,0),120000);
});
test('previous saved lump sum migrates without loss or double payment',()=>{
 const old=defaultState();old.extra={monthly:100,annual:1000,lump:5000,lumpMonth:7};delete old.loan.label;delete old.loan.extra;
 const saved={version:'2026-09-09.1',state:old},copy=structuredClone(saved),restored=restoreSavedEstimate(saved);
 assert.deepEqual(saved,copy);assert.equal(restored.loan.label,'Loan A');assert.equal(restored.extra.customAmt,5000);assert.equal(restored.extra.customStart,7);assert.equal(restored.extra.lump,0);
 assert.deepEqual(amortize(120000,5,360,old.extra),amortize(120000,5,360,restored.extra));
 assert.deepEqual(restoreSavedEstimate({version:MODEL_VERSION,state:defaultState()}),defaultState());
 assert.throws(()=>restoreSavedEstimate({version:'unknown',state:old}));
});
test('all three actual components are server-rendered with unique controls and the five-tool ribbon',async()=>{
 const panels=await renderPortedCalculatorPanels(),html=renderCalculatorSuite(panels);
 for(const name of ['LoanCalculator','LoanComparison','AmortizationAnalyzer'])assert.ok(html.includes(`data-component="${name}"`));
 assert.equal((html.match(/id="cal-react-/g)||[]).length,3);assert.equal((html.match(/role="tabpanel"/g)||[]).length,5);
 assert.equal((panels.payment.match(/class="gc-payment-part"/g)||[]).length,6);
 assert.ok(panels.payment.includes('$2,690.18'));assert.ok(panels.compare.includes('Compare Two Loans Head-to-Head'));
 assert.ok(panels.payoff.includes('Every Quarter'));assert.ok(panels.payoff.includes('Inspect payoff month'));
 assert.ok(!/NaN|Infinity|\u2014|\u2013/.test(Object.values(panels).join('')));
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size);
});
