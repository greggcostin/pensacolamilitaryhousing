import {monthlyOwnership,priceForBudget} from './ownership-model.js';
const form=document.querySelector('[data-ownership-budget]');
if(form){
 const rates=JSON.parse(document.getElementById('ownership-bah-rates').textContent),money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(n);
 const controls=form.elements,outputs=[...form.querySelectorAll('[data-cost-result]')];
 function calculate(){
  try{
   if(!form.checkValidity())throw Error('Complete each field with a valid number before using the estimate.');
   const read=k=>controls.namedItem(k).value;
   const costs=Object.fromEntries(['rate','termYears','downPaymentPct','annualTax','annualInsurance','annualFlood','mortgageInsurance','hoa','assessments','maintenance','utilities','feeType'].map(k=>[k,read(k)]));costs.feeFinanced=read('feeFinanced')==='true';
   const result=monthlyOwnership(read('price'),costs),budget=Number(read('budget')),bah=Number(read('bah'));
   const price=costs.downPaymentPct==100?null:priceForBudget(budget,costs);
   const values={...result,bah,gap:result.monthly-bah,remaining:budget-result.monthly,priceAtBudget:price?.feasible?price.price:0};
   for(const out of outputs)out.textContent=out.dataset.costResult==='priceAtBudget'&&!price?'Cash-price decision':money(values[out.dataset.costResult]);
   form.querySelector('[data-price-note]').textContent=!price?'A cash purchase needs a separate decision about the cash price.':!price.feasible?'The entered budget does not support a positive modeled loan price with these recurring costs.':price.limited?'The result reaches the model limit. It is not a lending limit.':'Rounded down to $1,000 using the entered fixed costs. Recheck taxes, insurance and fees for each actual property.';
   form.querySelector('[data-cost-error]').textContent='';
  }catch(error){outputs.forEach(out=>out.textContent='Unavailable');form.querySelector('[data-price-note]').textContent='';form.querySelector('[data-cost-error]').textContent=error.message;}
 }
 function updateBah(){controls.bah.value=rates[controls.mha.value][controls.grade.value][controls.dependents.value];calculate();}
 for(const key of ['mha','grade','dependents'])controls[key].addEventListener('change',updateBah);
 form.addEventListener('input',calculate);form.addEventListener('change',calculate);form.addEventListener('submit',event=>event.preventDefault());calculate();
}
