// Client-side educational worksheets. No input values, addresses or financial
// details are transmitted. Analytics records the tool name and action only.
const value=(v,name,signed=false)=>{if(v===''||v==null)throw new Error(`Enter ${name}.`);const n=Number(v);if(!Number.isFinite(n)||(!signed&&n<0)||Math.abs(n)>1e10)throw new Error(`Check ${name}; enter a valid ${signed?'':'nonnegative '}number.`);return n;};
const cents=n=>Math.round((n+Number.EPSILON)*100)/100;
const costs=['principalInterest','tax','insurance','flood','mortgageInsurance','association','assessments','maintenance','utilities'];
export function sellerNet(inputs){
 const fields=['price','payoff','compensation','closing','buyerCredit','repairs','otherLiens','prorations','moving','nextPurchase','reserve'];
 const n=Object.fromEntries(fields.map(k=>[k,value(inputs[k],k,k==='prorations')]));
 const deductions=cents(n.payoff+n.compensation+n.closing+n.buyerCredit+n.repairs+n.otherLiens+n.prorations);
 const proceeds=cents(n.price-deductions);return {deductions,proceeds,afterNextMove:cents(proceeds-n.moving-n.nextPurchase-n.reserve)};
}
export function ownershipComparison({a,b,months}){
 const horizon=value(months,'ownership horizon');if(!Number.isInteger(horizon)||horizon<1||horizon>600)throw new Error('Use a whole-number ownership horizon from 1 to 600 months.');
 const calc=(x,label)=>{const monthly=cents(costs.reduce((s,k)=>s+value(x[k],`${label} ${k}`),0)),initial=value(x.initialCash,`${label} initial cash`);return {monthly,initialCash:initial,budgetedOutlay:cents(initial+monthly*horizon)};};
 const A=calc(a,'Home A'),B=calc(b,'Home B');return {a:A,b:B,monthlyDifference:cents(B.monthly-A.monthly),horizonDifference:cents(B.budgetedOutlay-A.budgetedOutlay),months:horizon};
}
export function floridaTaxEstimate(inputs){
 const n=Object.fromEntries(['schoolTaxable','schoolMills','otherTaxable','otherMills','nonAdValorem','sellerTax'].map(k=>[k,value(inputs[k],k)]));
 if(n.schoolMills>1000||n.otherMills>1000)throw new Error('Check the millage units. One mill equals $1 per $1,000 of taxable value.');
 const school=cents(n.schoolTaxable*n.schoolMills/1000),other=cents(n.otherTaxable*n.otherMills/1000),annual=cents(school+other+n.nonAdValorem);
 return {school,other,annual,monthly:cents(annual/12),changeFromSeller:cents((annual-n.sellerTax)/12)};
}
const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',minimumFractionDigits:2,maximumFractionDigits:2}).format(n);
function initializeTools(){
 for(const root of document.querySelectorAll('[data-guide-tool]')){
  const kind=root.dataset.guideTool,inputs=[...root.querySelectorAll('input[data-value]')],result=root.querySelector('[data-tool-result]'),error=root.querySelector('[data-tool-error]');
  const original=inputs.map(i=>i.value);let csvRows=[];
  const track=action=>{if(typeof window.gtag==='function')window.gtag('event','guide_tool_use',{tool:kind,action});};
  const read=()=>{const o={};for(const i of inputs){i.removeAttribute('aria-invalid');if(i.value===''||!i.validity.valid){i.setAttribute('aria-invalid','true');throw new Error(`Check ${root.querySelector(`label[for="${i.id}"]`)?.textContent||i.dataset.value}.`);}o[i.dataset.value]=i.value;}return o;};
  const tile=(label,n)=>`<div class="gt-result"><span>${label}</span><strong${n<0?' class="gt-negative"':''}>${money(n)}</strong></div>`;
  function calculate(report=false){
   try{const x=read();let summary;
    if(kind==='seller-net'){
     const r=sellerNet(x);result.innerHTML=tile('Estimated proceeds at closing',r.proceeds)+tile('After your next-move plan and reserve',r.afterNextMove)+`<p class="gt-explanation">${money(Number(x.price))} sale price minus ${money(r.deductions)} in entered seller obligations. Moving costs, next-purchase cash and reserves are then deducted separately. A negative result means additional funds would be needed under these assumptions.</p>`;
     summary=[['Estimated closing proceeds',r.proceeds],['After next-move plan and reserve',r.afterNextMove]];
    }else if(kind==='ownership-cost'){
     const group=letter=>Object.fromEntries(Object.entries(x).filter(([k])=>k.startsWith(letter+'.')).map(([k,v])=>[k.slice(2),v]));const r=ownershipComparison({a:group('a'),b:group('b'),months:x.months});
     result.innerHTML=tile('Home A monthly planning budget',r.a.monthly)+tile('Home B monthly planning budget',r.b.monthly)+`<p class="gt-explanation">Home B is ${money(Math.abs(r.monthlyDifference))} ${r.monthlyDifference>=0?'higher':'lower'} per month with these inputs. Over ${r.months} months, the budgeted cash outlay including initial cash is ${money(r.a.budgetedOutlay)} for A and ${money(r.b.budgetedOutlay)} for B. This measures cash outlay, not investment return, appreciation, tax benefits or net economic cost; principal repayment can build equity.</p>`;
     summary=[['Home A monthly',r.a.monthly],['Home B monthly',r.b.monthly],['Home A budgeted cash outlay',r.a.budgetedOutlay],['Home B budgeted cash outlay',r.b.budgetedOutlay]];
    }else{
     const r=floridaTaxEstimate(x);result.innerHTML=tile('Illustrative annual property tax',r.annual)+tile('Monthly planning reserve',r.monthly)+`<p class="gt-explanation">School tax ${money(r.school)} + other tax ${money(r.other)} + entered non-ad valorem charges. Compared with the seller’s entered annual bill, this is ${money(Math.abs(r.changeFromSeller))} ${r.changeFromSeller>=0?'more':'less'} per month. The property appraiser determines value and exemptions; this arithmetic does not determine eligibility or your actual bill.</p>`;
     summary=[['Annual tax',r.annual],['Monthly reserve',r.monthly],['Monthly difference from seller history',r.changeFromSeller]];
    }
    csvRows=[['Costin Team educational worksheet',kind],['Prepared locally',new Date().toISOString().slice(0,10)],['Inputs are user scenarios, not verified quotes',''],...inputs.map(i=>[root.querySelector(`label[for="${i.id}"]`)?.textContent.trim()||i.dataset.value,i.value]),...summary];
    error.textContent='';error.hidden=true;root.querySelector('[data-tool-export]').disabled=false;if(report)track('calculate');return true;
   }catch(e){error.hidden=false;error.textContent=e.message;result.innerHTML='<p>Complete the highlighted input before using an estimate.</p>';root.querySelector('[data-tool-export]').disabled=true;csvRows=[];return false;}
  }
  root.querySelector('[data-tool-calculate]').addEventListener('click',()=>calculate(true));
  root.querySelector('[data-tool-reset]').addEventListener('click',()=>{inputs.forEach((i,j)=>i.value=original[j]);calculate();});
  inputs.forEach(i=>i.addEventListener('input',()=>{result.innerHTML='<p>Inputs changed. Select Calculate to update the estimate.</p>';root.querySelector('[data-tool-export]').disabled=true;}));
  root.querySelector('[data-tool-export]').addEventListener('click',()=>{if(!calculate())return;const q=s=>'"'+String(s).replaceAll('"','""')+'"';const blob=new Blob(['\uFEFF'+csvRows.map(row=>row.map(q).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`costin-${kind}-worksheet.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);track('download_worksheet');});
  calculate();
 }
}
if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initializeTools);else initializeTools();}
