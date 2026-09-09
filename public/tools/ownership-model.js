// Shared, deterministic educational arithmetic. The caller supplies the property costs.
// No pay-by-rank assumptions, insurance ceilings, tax exemptions or loan approvals.
export const REVIEWED = '2026-09-08';
export const RATE_REFERENCE = {rate:6.71,date:'2026-09-03',name:'Freddie Mac PMMS, conventional 30-year national average',url:'https://www.freddiemac.com/pmms'};
export const DEFAULT_COSTS = Object.freeze({rate:6.71,termYears:30,downPaymentPct:0,feeType:'first',feeFinanced:true,annualTax:3600,annualInsurance:4800,annualFlood:1200,mortgageInsurance:0,hoa:75,assessments:0,maintenance:250,utilities:225});
export const COST_KEYS = ['annualTax','annualInsurance','annualFlood','mortgageInsurance','hoa','assessments','maintenance','utilities'];
const number=(v,name,max=1e10)=>{if(v==null||typeof v==='boolean'||String(v).trim()==='')throw Error(`Enter ${name}.`);const n=Number(v);if(!Number.isFinite(n)||n<0||n>max)throw Error(`Check ${name}; use a nonnegative number.`);return n;};
const cents=n=>Math.round((n+Number.EPSILON)*100)/100;
export function validateCosts(input){
 const out=Object.fromEntries(COST_KEYS.map(k=>[k,number(input[k],k)]));
 out.rate=number(input.rate,'interest rate',100);out.termYears=number(input.termYears,'loan term',50);out.downPaymentPct=number(input.downPaymentPct,'down payment percentage',100);
 if(out.termYears<1||!Number.isInteger(out.termYears))throw Error('Use a whole-number loan term from 1 to 50 years.');
 if(!['first','subsequent','exempt','none'].includes(input.feeType))throw Error('Choose a funding-fee scenario.');
 if(typeof input.feeFinanced!=='boolean')throw Error('Choose whether the funding fee is financed.');
 out.feeType=input.feeType;out.feeFinanced=input.feeFinanced;return out;
}
export function fundingFeePct(type,downPct){
 const down=number(downPct,'down payment percentage',100);
 if(!['first','subsequent','exempt','none'].includes(type))throw Error('Choose a funding-fee scenario.');
 if(down===100||type==='exempt'||type==='none')return 0;
 return down>=10?1.25:down>=5?1.5:type==='first'?2.15:3.3;
}
function rawCosts(price,input){
 const p=number(price,'purchase price'),c=validateCosts(input),baseLoan=p*(1-c.downPaymentPct/100),feeRate=fundingFeePct(c.feeType,c.downPaymentPct),fee=baseLoan*feeRate/100;
 const loan=baseLoan+(c.feeFinanced?fee:0),r=c.rate/1200,n=c.termYears*12,factor=r===0?1/n:r/(-Math.expm1(-n*Math.log1p(r)));
 const principalInterest=loan*factor,tax=c.annualTax/12,insurance=c.annualInsurance/12,flood=c.annualFlood/12;
 const piti=principalInterest+tax+insurance+flood+c.mortgageInsurance;
 const recurring=piti+c.hoa+c.assessments,monthly=recurring+c.maintenance+c.utilities;
 return {price:p,baseLoan,loan,fee,feeRate,downPayment:p*c.downPaymentPct/100,cashFundingFee:c.feeFinanced?0:fee,principalInterest,tax,insurance,flood,mortgageInsurance:c.mortgageInsurance,piti,hoa:c.hoa,assessments:c.assessments,recurring,maintenance:c.maintenance,utilities:c.utilities,monthly};
}
export function monthlyOwnership(price,costs){return Object.fromEntries(Object.entries(rawCosts(price,costs)).map(([k,v])=>[k,k==='feeRate'?v:cents(v)]));}
export function priceForBudget(target,costs,{step=1000,maximum=10000000}={}){
 const budget=number(target,'monthly budget'),c=validateCosts(costs),round=number(step,'price increment'),max=number(maximum,'maximum modeled price');
 if(round<1||max<round)throw Error('Check the modeled price bounds.');
 if(c.downPaymentPct===100)throw Error('A cash purchase needs a separate cash-price decision.');
 const fixed=rawCosts(0,c).monthly,perDollar=rawCosts(1,c).monthly-fixed;
 if(budget<=fixed)return {price:0,monthlyAtPrice:0,unallocated:cents(budget-fixed),limited:false,feasible:false};
 const raw=(budget-fixed)/perDollar;let price=Math.floor(Math.min(raw,max)/round)*round;
 // Guard against a floating-point boundary ever returning a payment above the budget.
 while(price>0&&rawCosts(price,c).monthly>budget+1e-8)price-=round;
 const monthly=rawCosts(price,c).monthly;
 return {price,monthlyAtPrice:cents(monthly),unallocated:cents(budget-monthly),limited:raw>max,feasible:price>0};
}
