// Hypothetical comparisons only. Inputs are explicit; no live rate defaults.
export function monthlyPrincipalInterest(principal, annualPercent, months) {
  if (!Number.isFinite(principal) || principal < 0 || !Number.isFinite(annualPercent) || annualPercent < 0 || !Number.isInteger(months) || months <= 0) throw new Error('Invalid amortization inputs');
  const rate = annualPercent / 1200;
  return rate === 0 ? principal / months : principal * rate / (1 - (1 + rate) ** -months);
}
export function simpleBreakEven(upfrontCost, monthlySaving) {
  if (!Number.isFinite(upfrontCost) || upfrontCost < 0 || !Number.isFinite(monthlySaving) || monthlySaving <= 0) throw new Error('Break-even requires nonnegative cost and positive saving');
  return upfrontCost / monthlySaving;
}
