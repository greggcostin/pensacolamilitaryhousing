// Public planning math; no network, storage, loan approval or client identifiers.
export const DEFAULTS = Object.freeze({basePay:4000,bah:1863,grossUp:1.25,ratio:41,debts:500,additionalIncome:3000,housingCost:2400});
export function compareBudget(input) {
  for (const key of Object.keys(DEFAULTS)) if (!['string','number'].includes(typeof input[key]) || String(input[key]).trim() === '') throw new RangeError('Enter a value for '+key+'.');
  const values = Object.fromEntries(Object.keys(DEFAULTS).map(key => [key,Number(input[key])]));
  for (const [key,value] of Object.entries(values)) if (!Number.isFinite(value) || value < 0) throw new RangeError('Enter a valid, non-negative '+key+' amount.');
  if (values.grossUp < 1 || values.grossUp > 1.25 || values.ratio <= 0 || values.ratio > 100) throw new RangeError('Use a BAH factor from 1 to 1.25 and a debt ratio above 0 and up to 100.');
  const memberIncome = values.basePay + values.bah * values.grossUp;
  const cents = value => Math.round((value + Number.EPSILON) * 100) / 100;
  return {member:cents(Math.max(0,memberIncome*values.ratio/100-values.debts)), household:cents(Math.max(0,(memberIncome+values.additionalIncome)*values.ratio/100-values.debts)), bah:cents(values.bah), gap:cents(values.housingCost-values.bah)};
}
