import {compareBudget} from './bah-budget-model.js';
const form = document.querySelector('[data-bah-budget]');
if (form) {
  const rates = JSON.parse(document.querySelector('#geo-bah-rates').textContent);
  const field = name => form.elements.namedItem(name);
  const money = value => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(value);
  function render(changeRate=false) {
    if (changeRate) field('bah').value = rates[field('mha').value][field('grade').value][field('dependents').value];
    const outputs = [...form.querySelectorAll('[data-budget-result]')];
    const error = form.querySelector('[data-budget-error]');
    try {
      if (!form.checkValidity()) throw Error('Complete the amounts using valid non-negative numbers.');
      const inputs = Object.fromEntries(['basePay','bah','grossUp','ratio','debts','additionalIncome','housingCost'].map(key => [key,field(key).value]));
      const result = compareBudget(inputs);
      outputs.forEach(el => {el.textContent = money(result[el.dataset.budgetResult]);});
      form.querySelector('[data-budget-gap-label]').textContent = result.gap < 0 ? 'Housing cost below BAH' : 'Housing cost above BAH';
      form.querySelector('[data-budget-result="gap"]').textContent = money(Math.abs(result.gap));
      error.textContent = '';
    } catch (e) { outputs.forEach(el => {el.textContent='Unavailable';}); error.textContent=e.message; }
  }
  form.addEventListener('submit',event => event.preventDefault());
  form.addEventListener('input',event => render(['mha','grade','dependents'].includes(event.target.name)));
  render(true);
}
