import test from 'node:test';import assert from 'node:assert/strict';
import {DEFAULT_COSTS as D,monthlyOwnership,priceForBudget,fundingFeePct} from '../public/tools/ownership-model.js';
test('a zero-interest example accounts for every monthly cost and the financed fee',()=>{
 const r=monthlyOwnership(120000,{...D,rate:0,termYears:10,annualTax:1200,annualInsurance:2400,annualFlood:600,mortgageInsurance:0,hoa:50,assessments:25,maintenance:100,utilities:125});
 assert.equal(r.loan,122580);assert.equal(r.principalInterest,1021.5);assert.equal(r.piti,1371.5);assert.equal(r.monthly,1671.5);
});
test('funding fee follows purchase down-payment bands and remaining loan amount',()=>{
 assert.equal(fundingFeePct('first',4.99),2.15);assert.equal(fundingFeePct('subsequent',4.99),3.3);assert.equal(fundingFeePct('subsequent',5),1.5);assert.equal(fundingFeePct('first',10),1.25);assert.equal(fundingFeePct('exempt',0),0);
 const r=monthlyOwnership(200000,{...D,downPaymentPct:5});assert.equal(r.baseLoan,190000);assert.equal(r.fee,2850);
 assert.equal(monthlyOwnership(200000,{...D,feeFinanced:false}).loan,200000);
});
test('empty, non-finite and negative inputs cannot silently turn into estimates',()=>{
 for(const value of ['', ' ', null, undefined, true, -1, Infinity,NaN,'abc'])assert.throws(()=>monthlyOwnership(300000,{...D,annualInsurance:value}));
 assert.throws(()=>monthlyOwnership(-1,D));assert.throws(()=>monthlyOwnership(300000,{...D,termYears:1.5}));assert.throws(()=>priceForBudget('',D));
});
test('insurance has no price-based cap and each $1200 annual cost adds $100 monthly',()=>{
 const a=monthlyOwnership(300000,D),b=monthlyOwnership(300000,{...D,annualInsurance:16800});assert.equal(b.monthly-a.monthly,1000);
});
test('zero or insufficient budgets return no feasible price, not a $50000 home',()=>{
 for(const target of [0,200,500,1000]){const r=priceForBudget(target,D);assert.equal(r.price,0);assert.equal(r.feasible,false);}
});
test('inverse price always rounds down and fits the entered total monthly budget',()=>{
 for(const rate of [0,2.5,6.71,15])for(const budget of [1500,1863,2433,3000,5500]){
  const costs={...D,rate};const r=priceForBudget(budget,costs);if(!r.feasible)continue;
  assert.ok(monthlyOwnership(r.price,costs).monthly<=budget+.01);assert.ok(monthlyOwnership(r.price+1000,costs).monthly>budget-.01);assert.equal(r.price%1000,0);
 }
});
test('limit and cash-purchase cases cannot masquerade as unconstrained prices',()=>{
 assert.equal(priceForBudget(100000,D,{maximum:100000}).limited,true);assert.throws(()=>priceForBudget(3000,{...D,downPaymentPct:100}));
});
