import {amortize,loanScenario,ownershipPeriod} from './mortgage-math.mjs';

export function annualSchedule(schedule) {
 const byYear=[];
 for(const r of schedule){const year=Math.ceil(r.month/12);let y=byYear.at(-1);if(!y||y.year!==year){y={year,principal:0,interest:0,extra:0,balance:0,endMonth:r.month};byYear.push(y);}y.principal+=r.principal;y.interest+=r.interest;y.extra+=r.extra;y.balance=r.balance;y.endMonth=r.month;}
 return byYear;
}
export function runAmortSchedule({P,mRate,N,extras}) {
 const result=amortize(Number(P),Number(mRate)*1200,Number(N),Object.fromEntries(Object.entries(extras).map(([k,v])=>['freq','customFreq'].includes(k)?[k,v]:[k,Number(v)])));
 return {schedule:result.rows,byYear:annualSchedule(result.rows),totalInterest:result.totalInterest,totalMonths:result.months,basePmt:result.payment};
}
export const toMilitaryLoan = x=>({...x,label:x.label||'Loan',extra:x.extra??0,firstUse:x.vaUse!=='subsequent',vaExempt:x.vaExempt==='yes'});
export const fromMilitaryLoan = x=>{const {firstUse,vaExempt,...rest}=x;return {...rest,vaUse:firstUse?'first':'subsequent',vaExempt:vaExempt?'yes':'no'};};
export function computeLoanProduct(view) {
 const input=fromMilitaryLoan(view);
 for(const k of ['price','downPct','rate','years','pmi','tax','insurance','flood','hoa','lenderFees','points','otherClosing','prepaid','escrow','credits','deposit','reserves','moving'])if(k in input)input[k]=input[k]===''?NaN:Number(input[k]);
 const l=loanScenario(input,{monthly:Number(view.extra??0)}),s=l.actual;
 const totalMI=s.rows.reduce((sum,r)=>sum+r.mi,0),pmiMonths=s.rows.filter(r=>r.mi>0).length;
 return {...l,loan:l,sched:{schedule:s.rows,byYear:annualSchedule(s.rows),totalInterest:s.totalInterest,totalMonths:s.months,basePmt:s.payment},basePmt:l.scheduled.payment,miMonthly:l.initialMI,miLabel:input.type==='fha'?`FHA annual MIP ${l.fha.annualPercent.toFixed(2)}%`:'Conventional PMI',upfrontLabel:input.type==='fha'?'FHA upfront MIP':`VA funding fee ${l.feePercent}%`,totalLoan:l.principal,ltv:l.principal/input.price*100,totalMI,pmiMonths,plannedMonthly:l.totalMonthly+Number(view.extra??0),cashToClose:l.cashToClose,totalBorrowingCost:s.totalInterest+totalMI+l.borrowingFees};
}
export function comparisonPeriod(result,horizon){return ownershipPeriod(result.loan,Number(horizon));}
