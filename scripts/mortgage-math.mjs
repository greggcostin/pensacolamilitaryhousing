// Fixed-rate planning mathematics. Dollar assumptions come from the user, never a live-rate feed.
// Sources and supported scope: content/calculators/sources.json. Reviewed 2026-09-09.
export const MODEL_VERSION = '2026-09-09.1';
export const cents = n => Math.round((n + Number.EPSILON) * 100) / 100;
const number = (n, label, min = 0, max = 1e9) => {
  if (typeof n !== 'number' || !Number.isFinite(n) || n < min || n > max) throw new Error(`${label} must be between ${min.toLocaleString('en-US')} and ${max.toLocaleString('en-US')}.`);
  return n;
};
export function monthlyPrincipalInterest(principal, annualPercent, months) {
  number(principal, 'Loan amount'); number(annualPercent, 'Interest rate', 0, 30); number(months, 'Loan months', 1, 480);
  if (!Number.isInteger(months)) throw new Error('Loan months must be a whole number.');
  const r = annualPercent / 1200;
  return r === 0 ? principal / months : principal * r / -Math.expm1(-months * Math.log1p(r));
}
export function amortize(principal, annualPercent, months, extras = {}) {
  const payment = monthlyPrincipalInterest(principal, annualPercent, months);
  const monthly = number(extras.monthly ?? 0, 'Extra monthly principal');
  const annual = number(extras.annual ?? 0, 'Extra annual principal');
  const lump = number(extras.lump ?? 0, 'One-time principal payment');
  const lumpMonth = number(extras.lumpMonth ?? 1, 'One-time payment month', 1, 480);
  if (!Number.isInteger(lumpMonth)) throw new Error('One-time payment month must be a whole number.');
  if (lump > 0 && lumpMonth > months) throw new Error('The one-time payment month is after the selected loan term. Choose an earlier month.');
  let balance = principal, totalInterest = 0, totalPrincipal = 0;
  const rows = [];
  for (let month = 1; balance > 0.000001 && month <= months; month++) {
    const opening = balance, interest = balance * annualPercent / 1200;
    const scheduledPrincipal = Math.min(balance, Math.max(0, payment - interest));
    const extra = Math.min(Math.max(0, balance - scheduledPrincipal), monthly + (month % 12 === 0 ? annual : 0) + (month === lumpMonth ? lump : 0));
    const principalPaid = scheduledPrincipal + extra;
    balance = Math.max(0, balance - principalPaid);
    if (month === months && balance < 0.01) balance = 0;
    totalInterest += interest; totalPrincipal += principalPaid;
    rows.push({month, opening, interest, principal:principalPaid, extra, payment:principalPaid + interest, balance});
  }
  return {payment, rows, months:rows.length, totalInterest, totalPrincipal, totalPaid:totalPrincipal + totalInterest};
}
export function fhaTerms(baseLoan, ltv, months) {
  number(baseLoan, 'Base loan'); number(ltv, 'Loan-to-value', 0, 1); number(months, 'Loan months', 1, 360);
  const high = baseLoan > 726200;
  const annualPercent = months > 180 ? (high ? (ltv > .95 ? .75 : .70) : (ltv > .95 ? .55 : .50)) : (high ? (ltv <= .78 ? .15 : ltv <= .90 ? .40 : .65) : (ltv <= .90 ? .15 : .40));
  return {annualPercent, duration:Math.min(months, ltv <= .90 ? 132 : months), upfrontPercent:1.75};
}
export function fhaMonthlyPremiums(principal, annualPercent, months, mipPercent, financedUpfrontFactor = 0, paymentOverride) {
  // HUD method: average original scheduled beginning balances for each loan year,
  // remove the financed upfront factor, round the annual premium, then round monthly.
  const payment = paymentOverride ?? cents(monthlyPrincipalInterest(principal, annualPercent, months));
  let balance = principal;
  const premiums = [];
  for (let start = 0; start < months; start += 12) {
    let sum = 0;
    for (let m = 0; m < 12; m++) {
      sum += Math.max(0, balance);
      const interest = cents(cents(balance * annualPercent) / 1200);
      balance = Math.max(0, cents(balance + interest - payment));
    }
    const annual = cents(cents(sum / 12 * mipPercent / 100) / (1 + financedUpfrontFactor));
    premiums.push(cents(annual / 12));
  }
  return premiums;
}
export function loanScenario(input, extras = {}) {
  const x = {tax:0,insurance:0,flood:0,hoa:0,pmi:.6,lenderFees:0,points:0,otherClosing:0,prepaid:0,escrow:0,credits:0,deposit:0,reserves:0,moving:0,vaUse:'first',vaExempt:'no',financeFee:'yes',...input};
  number(x.price, 'Home price', 1, 1e8); number(x.downPct, 'Down payment percent', 0, 100);
  number(x.rate, 'Interest rate', 0, 30); number(x.years, 'Loan years', 1, 30);
  if (!Number.isInteger(x.years)) throw new Error('Loan years must be a whole number.');
  if (!['conv', 'fha', 'va'].includes(x.type)) throw new Error('Choose a supported loan type.');
  if (x.type === 'fha' && x.downPct < 3.5) throw new Error('This FHA purchase model needs at least 3.5% down. Eligibility may require more.');
  if (x.type === 'conv' && x.downPct < 3) throw new Error('This conventional purchase model needs at least 3% down. Your program may require more.');
  for (const k of ['tax','insurance','flood','hoa','pmi','lenderFees','points','otherClosing','prepaid','escrow','credits','deposit','reserves','moving']) number(x[k] ?? 0, k);
  number(x.pmi ?? 0, 'Annual PMI rate', 0, 5); number(x.points ?? 0, 'Discount points', 0, 10);
  const months = x.years * 12, downPayment = x.price * x.downPct / 100, baseLoan = x.price - downPayment;
  const ltv = baseLoan / x.price;
  const fha = x.type === 'fha' ? fhaTerms(baseLoan, ltv, months) : null;
  const feePercent = x.type === 'fha' ? 1.75 : x.type === 'va' && x.vaExempt !== 'yes' ? (x.downPct >= 10 ? 1.25 : x.downPct >= 5 ? 1.5 : x.vaUse === 'subsequent' ? 3.3 : 2.15) : 0;
  const upfrontFee = cents(baseLoan * feePercent / 100), financedFee = x.financeFee === 'no' ? 0 : upfrontFee;
  const principal = baseLoan + financedFee;
  const scheduled = amortize(principal, x.rate, months), actual = amortize(principal, x.rate, months, extras);
  const termination = scheduled.rows.find(r => r.balance <= x.price * .78 + .000001)?.month ?? months;
  // General borrower-paid conventional PMI model, current payments assumed. Extra
  // principal does not advance automatic termination. Earlier requested cancellation is not assumed.
  const pmiStopMonth = x.type === 'conv' && ltv > .8 ? Math.min(termination, Math.floor(months / 2) + 1) : 0;
  const fhaPremiums = fha ? fhaMonthlyPremiums(principal, x.rate, months, fha.annualPercent, financedFee ? .0175 : 0) : [];
  const miAt = month => x.type === 'conv' ? (month < pmiStopMonth ? cents(baseLoan * (x.pmi ?? .6) / 1200) : 0) : fha && month <= fha.duration ? fhaPremiums[Math.floor((month - 1) / 12)] : 0;
  for (const row of actual.rows) row.mi = miAt(row.month);
  const ownershipMonthly = (x.tax + x.insurance + x.flood) / 12 + x.hoa;
  const initialMI = actual.rows[0]?.mi ?? 0, totalMonthly = scheduled.payment + initialMI + ownershipMonthly;
  const pointsCost = principal * (x.points ?? 0) / 100;
  const borrowingFees = (x.lenderFees ?? 0) + pointsCost + upfrontFee;
  const closingBeforeCredits = (x.lenderFees ?? 0) + pointsCost + (x.otherClosing ?? 0) + (x.prepaid ?? 0) + (x.escrow ?? 0) + upfrontFee - financedFee;
  if (x.credits > closingBeforeCredits + .005) throw new Error('Credits exceed the modeled closing costs. Confirm eligible credits with your lender; they cannot fund the down payment here.');
  const transactionCash = downPayment + closingBeforeCredits - (x.credits ?? 0);
  if (x.deposit > transactionCash + .005) throw new Error('Earnest money exceeds the modeled total transaction cash. Check the deposit and credit amounts.');
  return {input:x, months, baseLoan, downPayment, principal, upfrontFee, financedFee, feePercent, fha, pmiStopMonth, scheduled, actual, initialMI, ownershipMonthly, totalMonthly, pointsCost, borrowingFees, closingBeforeCredits, transactionCash, cashToClose:transactionCash - (x.deposit ?? 0), allCashNeeded:transactionCash + (x.reserves ?? 0) + (x.moving ?? 0)};
}
export function ownershipPeriod(loan, years) {
  number(years, 'Ownership years', 1, 30);
  if (!Number.isInteger(years)) throw new Error('Ownership years must be a whole number.');
  const months = Math.round(years * 12), rows = loan.actual.rows.slice(0, months);
  const interest = rows.reduce((s,r) => s + r.interest, 0), mi = rows.reduce((s,r) => s + r.mi, 0);
  const principalPaid = rows.reduce((s,r) => s + r.principal, 0), piPaid = interest + principalPaid;
  const balance = rows.length ? rows.at(-1).balance : 0;
  const closingExpense = loan.input.lenderFees + loan.pointsCost + loan.input.otherClosing + loan.upfrontFee - loan.input.credits;
  // Prepaids and initial escrow are timing/cash allocations, not an additional
  // recurring expense on top of annualized taxes/insurance in the economic comparison.
  const cost = interest + mi + closingExpense + loan.ownershipMonthly * months;
  const cashOutlay = loan.transactionCash + piPaid + mi + loan.ownershipMonthly * months;
  return {months, interest, mi, principalPaid, balance, equity:loan.input.price - balance, cost, cashOutlay, borrowingCost:interest + mi + loan.borrowingFees - loan.input.credits};
}
export function affordablePrice(input, targetMonthly) {
  number(targetMonthly, 'Target monthly payment', 1, 1e6);
  if (input.downPct === 100) return null;
  // Tax, insurance, flood, and HOA are held at the entered dollar estimates.
  const evaluate = price => loanScenario({...input, price, credits:0,deposit:0}).totalMonthly;
  if (evaluate(1) > targetMonthly) return null;
  let lo = 1, hi = 1e8;
  for (let i = 0; i < 70; i++) { const mid = (lo + hi) / 2; if (evaluate(mid) <= targetMonthly) lo = mid; else hi = mid; }
  return lo;
}
export function rentalScenario(input) {
  const x = {...input};
  for (const key of ['price','downPct','rate','years','monthlyMI','closing','setup','reserve','rent','occupancy','personalNights','averageStay','turnovers','cleaningCharged','cleaningCost','management','platform','maintenance','replacement','tax','insurance','flood','hoa','utilities','licenses','other']) number(x[key],key);
  if (!['long','mid','short'].includes(x.mode)) throw new Error('Choose a rental strategy.');
  number(x.price,'Purchase price',1,1e8); number(x.downPct,'Down payment percent',0,100);
  number(x.occupancy,'Occupancy percent',0,100); number(x.personalNights,'Personal-use nights',0,365);
  number(x.averageStay,'Average stay',1,365); number(x.years,'Loan years',1,30); number(x.rate,'Interest rate',0,30);
  if (!Number.isInteger(x.years)) throw new Error('Loan years must be a whole number.');
  for (const key of ['management','platform','maintenance','replacement']) number(x[key],key,0,100);
  const availableNights = 365 - x.personalNights;
  const grossAtFull = x.mode === 'short' ? x.rent * availableNights : x.rent * 12 * availableNights / 365;
  const rentRevenue = grossAtFull * x.occupancy / 100;
  const staysAtFull = x.mode === 'long' ? x.turnovers : availableNights / x.averageStay;
  const stays = x.mode === 'long' ? x.turnovers : staysAtFull * x.occupancy / 100;
  const cleaningRevenue = stays * x.cleaningCharged, cleaningCost = stays * x.cleaningCost;
  const collected = rentRevenue + cleaningRevenue;
  const fees = rentRevenue * x.management / 100 + collected * x.platform / 100;
  const repairs = rentRevenue * x.maintenance / 100;
  const fixed = x.tax + x.insurance + x.flood + x.hoa * 12 + x.utilities * 12 + x.licenses + x.other * 12;
  const operating = fixed + fees + repairs + cleaningCost;
  const noi = collected - operating;
  const principal = x.price * (1 - x.downPct / 100), loan = amortize(principal, x.rate, x.years * 12);
  const debt = loan.rows.slice(0,12).reduce((s,r)=>s+r.payment,0) + (principal > 0 ? x.monthlyMI * 12 : 0);
  const replacement = rentRevenue * x.replacement / 100;
  const cashFlow = noi - debt - replacement;
  const cashInvested = x.price - principal + x.closing + x.setup + x.reserve;
  const fullRentNet = grossAtFull * (1 - (x.management + x.maintenance + x.replacement) / 100 - x.platform / 100);
  const cleaningNetAtFull = staysAtFull * (x.cleaningCharged * (1 - x.platform / 100) - x.cleaningCost);
  const contribution = fullRentNet + (x.mode === 'long' ? 0 : cleaningNetAtFull);
  const fixedForBreakEven = fixed + debt - (x.mode === 'long' ? cleaningNetAtFull : 0);
  const breakEvenOccupancy = contribution > 0 ? Math.max(0, fixedForBreakEven / contribution * 100) : null;
  return {input:x, availableNights, grossAtFull, rentRevenue, stays, cleaningRevenue, cleaningCost, collected, fees, repairs, fixed, operating, noi, principal, monthlyPI:loan.payment, debt, replacement, cashFlow, cashInvested, capRate:noi / x.price * 100, cashOnCash:cashInvested > 0 ? cashFlow / cashInvested * 100 : null, dscr:debt > 0 ? noi / debt : null, breakEvenOccupancy};
}
export function rentalDownside(input) {
  return rentalScenario({...input, rent:input.rent * .9, occupancy:Math.max(0,input.occupancy - 10), tax:input.tax * 1.15, insurance:input.insurance * 1.15, flood:input.flood * 1.15, hoa:input.hoa * 1.15, utilities:input.utilities * 1.15, licenses:input.licenses * 1.15, other:input.other * 1.15});
}
