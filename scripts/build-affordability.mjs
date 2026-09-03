// ONE BAH-to-purchase-price model for the whole military site (audit 2026-09-02, mil-03: the same
// E-5 BAH was turned into ceilings that differed by $115,000 across pages). The model is the one
// documented in public/blog/bah-2026-pensacola-what-can-you-afford.html and reproduces its table:
//   VA loan, zero down, first-use 2.15% funding fee financed, Freddie Mac PMMS 30-year rate,
//   Escambia County unincorporated millage with the two-tier Florida homestead exemption
//   (Fla. Stat. 196.031(1)(b)), hazard insurance about 1% of price, floor $2,400, cap $3,600.
// Output: content/affordability-2026.json (every grade, both MHAs, with and without dependents:
// full-PITI ceiling at 100% of BAH and the buy-below target at 90%), then the JSON is rendered into
// the pages that state a BAH-to-price number so they can never disagree again. Idempotent.
//
//   node scripts/build-affordability.mjs            # write JSON + patch pages
//   node scripts/build-affordability.mjs --check    # exit 1 if any page still carries a stale band
import { readFileSync, writeFileSync } from "node:fs";
import { BAH_DATA } from "../src/bahData.js";

// Monthly base pay at a typical time in service for the grade. E-4 through O-5 are the figures
// already published in the Base Pay column of public/bah-to-mortgage-guide.html. E-9 and O-6 were
// added 2026-09-03 to complete the rank table and are approximations consistent with that
// progression: CONFIRM BOTH against the DFAS 2026 pay table before treating them as sourced. The
// W-1 through W-5 figures now drive a published lender range in the guide's warrant sentence, so
// confirm those against DFAS as well.
const BASE_PAY = { "E-1": 2850, "E-2": 2850, "E-3": 2850, "E-4": 2850, "E-5": 3150, "E-6": 3530, "E-7": 4900, "E-8": 5550, "E-9": 6700, "O-1": 3700, "O-2": 4400, "O-3": 5900, "O-4": 7500, "O-5": 8900, "O-6": 11000, "W-1": 3900, "W-2": 4600, "W-3": 5400, "W-4": 6400, "W-5": 7600 };

// What a lender will actually approve, which is the number a buyer shops with. BAH is tax free, so
// underwriters gross it up; the VA has no hard DTI cap but most lenders hold at 41% of total gross
// with residual income on top. The BAH-neutral figures below answer a different question (does the
// whole payment fit inside the allowance) and stay published beside this as the conservative anchor.
const LENDER = { grossUp: 1.25, dti: 0.41, otherDebts: 500, spouseIncome: 3000, lowShare: 0.9 };

const MODEL = {
  year: 2026,
  rate: 6.66, rateSource: "Freddie Mac PMMS 30-year fixed average, week ending August 27, 2026", rateUrl: "https://www.freddiemac.com/pmms",
  termYears: 30, downPayment: 0, fundingFeePct: 2.15, fundingFeeFinanced: true,
  millage: { nonSchool: 8.0445, school: 5.359, note: "Escambia County unincorporated, 2025 tax year (latest certified), per the Escambia County Tax Collector: total 13.4035 mills" },
  homestead: { first: 25000, additional: 26411, additionalYear: 2026, note: "Fla. Stat. 196.031(1)(b): first $25,000 off every levy; the additional exemption applies only to assessed value above $50,000 and not to school levies, and is CPI-indexed annually. 2026 tax year value $26,411 (Florida DOR, Additional Homestead Exemption Adjustment, rev. Jan 2026); 2025 was $25,722." },
  insurance: { pctOfPrice: 0.98, floor: 2400, cap: 3600, note: "inland Zone X, newer roof; coastal or old-roof quotes can double this line" },
  buyBelowShare: 0.9,
  roundTo: 5000,
};
const r = MODEL.rate / 100 / 12, n = MODEL.termYears * 12;
const piFactor = r / (1 - Math.pow(1 + r, -n));
export function monthlyPITI(price) {
  const loan = price * (1 - MODEL.downPayment) * (1 + (MODEL.fundingFeeFinanced ? MODEL.fundingFeePct / 100 : 0));
  const pi = loan * piFactor;
  const nonSchoolExempt = MODEL.homestead.first + MODEL.homestead.additional;
  const tax = (MODEL.millage.nonSchool * Math.max(0, price - nonSchoolExempt) + MODEL.millage.school * Math.max(0, price - MODEL.homestead.first)) / 1000 / 12;
  const ins = Math.min(MODEL.insurance.cap, Math.max(MODEL.insurance.floor, price * MODEL.insurance.pctOfPrice / 100)) / 12;
  return pi + tax + ins;
}
export function priceForPayment(target) { // bisection: PITI is monotonic in price
  let lo = 50000, hi = 2000000;
  for (let i = 0; i < 60; i++) { const mid = (lo + hi) / 2; if (monthlyPITI(mid) > target) hi = mid; else lo = mid; }
  return Math.round(lo / MODEL.roundTo) * MODEL.roundTo;
}
const usd = (v) => "$" + v.toLocaleString("en-US");
const usdK = (v) => "$" + Math.round(v / 1000) + "K";
export const band = (g) => `${usd(g.buyBelow)}-${usd(g.full)}`;
export const bandK = (g) => `${usdK(g.buyBelow)}-${usdK(g.full)}`;
// lender-first bands (owner decision 2026-09-03): the approval leads, BAH-neutral is the anchor.
export const lenderBand = (g) => `${usd(g.lenderLow)}-${usd(g.lenderHigh)}`;
export const dualBand = (g) => `${usd(g.dualLow)}-${usd(g.dualHigh)}`;
const spanTxt = (lo, hi) => (lo === hi ? usd(hi) : `${usd(Math.min(lo, hi))} to ${usd(Math.max(lo, hi))}`);
const spread = (lo, hi) => (lo === hi ? `+${usd(hi)}` : `+${usd(Math.min(lo, hi))} to +${usd(Math.max(lo, hi))}`);
// scen() takes the "available for PITI" figure the guide's own scenario bullets publish, so the price
// and the arithmetic above it always agree. Update these payments with those bullets at the next BAH change.
const scen = (pmt) => `${usd(priceForPayment(pmt * LENDER.lowShare))}-${usd(priceForPayment(pmt))}`;

// A page names a price floor; the model decides which grade reaches it. Nothing below can claim a
// reach the same page prices out of range, because the grade is looked up from the floor, not typed.
const GRADES_ALL = ["E-4", "E-5", "E-6", "E-7", "E-8", "E-9", "O-1", "O-2", "O-3", "O-4", "O-5", "O-6"];
const lowestClearing = (mha, floorK) => {
  const f = floorK * 1000;
  const c = GRADES_ALL.map((g) => ({ g, o: OUT.mha[mha][g] })).filter((x) => x.o && x.o.lenderLow !== null && x.o.lenderLow >= f);
  if (!c.length) return null;
  c.sort((a, b) => a.o.lenderLow - b.o.lenderLow);
  return c[0];
};
// same question for the BAH-neutral anchor, which is the stricter of the two tests
const lowestAnchor = (mha, floorK) => {
  const c = GRADES_ALL.map((g) => ({ g, o: OUT.mha[mha][g] })).filter((x) => x.o && x.o.full >= floorK * 1000);
  if (!c.length) return null;
  c.sort((a, b) => a.o.full - b.o.full);
  return c[0];
};
const reachNote = (mha, floorK) => {
  const c = lowestClearing(mha, floorK);
  const a = lowestAnchor(mha, floorK);
  const anchorTxt = a ? ` The cheapest allowance that covers the whole payment inside BAH is ${a.g}'s.` : ` No grade on the model covers it inside BAH alone.`;
  if (!c) return `No single-income approval on the sitewide model reaches ${usdK(floorK * 1000)}, so that floor takes a second income.${anchorTxt}`;
  return `The lowest grade whose single-income approval clears ${usdK(floorK * 1000)} is ${c.g}, at about ${lenderBand(c.o)}.${anchorTxt}`;
};
// Rules that match their own output, so a rate or BAH change still reaches these sentences after
// the original copy has been replaced once. The floor is read back out of the published text.
const reachRules = (mha) => [
  [/The lowest grade whose single-income approval clears \$(\d+)K is [^.<]*\.[^.<]*\./, (m, k) => reachNote(mha, Number(k))],
  [/No single-income approval on the sitewide model reaches \$(\d+)K, so that floor takes a second income\.[^.<]*\./, (m, k) => reachNote(mha, Number(k))],
];

// Every floor below is the low end of the price band this post publishes in its own body copy,
// so the "reaches" column can never name an area the same page prices above the grade's number.
// Gulf Breeze uses the two ZIP typical values the post cites rather than a band.
const FL064_AREAS = [
  { name: "Navy Point and Warrington", floor: 165 },
  { name: "Bellview and Myrtle Grove", floor: 185 },
  { name: "Ferry Pass", floor: 235 },
  { name: "Cantonment", floor: 250 },
  { name: "Milton", floor: 260 },
  { name: "East Pensacola Heights", floor: 285 },
  { name: "Pace", floor: 310 },
  { name: "Beulah", floor: 310 },
  { name: "Perdido Key", floor: 325 },
  { name: "East Hill", floor: 340 },
  { name: "Cordova Park", floor: 340 },
  { name: "Gulf Breeze at Midway and Tiger Point", floor: 407 },
  { name: "Gulf Breeze proper", floor: 691 },
];
// "entry" means the number clears the floor by less than 10%, which is the bottom of the range only.
const fit = (price, n = 4) => {
  const reach = FL064_AREAS.filter((a) => a.floor * 1000 <= price);
  if (!reach.length) return "below the entry price of every area on this page";
  return reach.slice(-n).reverse().map((a) => (price < a.floor * 1100 ? "entry " : "") + a.name).join(", ");
};
// clearing the assumed car/card payment is the biggest single lever a junior buyer controls,
// so publish it from the same model rather than as a remembered rule of thumb.
const debtLever = (mha, grade) => { const o = G(mha, grade); const cap = (o.basePay + o.bah * LENDER.grossUp) * LENDER.dti;
  return { free: priceForPayment(cap), gain: Math.round((priceForPayment(cap) - priceForPayment(cap - LENDER.otherDebts)) / 5000) * 5000 }; };
// where the lender range first clears the BAH-neutral anchor, which differs by MHA because FL023
// pays a much higher allowance: publish the real crossover instead of asserting one.
const ORDER = ["E-4", "E-5", "E-6", "E-7", "E-8", "O-1", "O-2", "O-3", "O-4", "O-5"];
const crossover = (mha) => ORDER.find((g) => { const o = G(mha, g); return o.lenderLow !== null && o.lenderLow > o.full; }) || "O-5";
const EXAMPLE_E7 = () => { const o = G("FL064", "E-7"); const gross = Math.round(o.bah * LENDER.grossUp); const total = o.basePay + gross; const cap = Math.round(total * LENDER.dti); const avail = cap - LENDER.otherDebts;
  return `<p><strong>Example:</strong> E-7 with dependents at NAS Pensacola. BAH ${usd(o.bah)} grossed up to ${usd(gross)}. Base pay about ${usd(o.basePay)}. Total gross about ${usd(total)}. ${Math.round(LENDER.dti * 100)}% of that is ${usd(cap)} of total monthly debt. Assume ${usd(LENDER.otherDebts)} a month of car and card payments, which leaves ${usd(avail)} for the housing payment. At ${MODEL.rate}% over ${MODEL.termYears} years with real Escambia taxes and insurance that approves roughly <strong>${lenderBand(o)}</strong>, zero down. The lower figure is the same payment at ${Math.round(LENDER.lowShare * 100)}%, which is the number to shop against.</p>`; };
const EXAMPLE_O3 = () => { const a = G("FL064", "O-3"), b = G("FL023", "O-3"); const gross = Math.round(b.bah * LENDER.grossUp); const total = b.basePay + gross; const cap = Math.round(total * LENDER.dti); const avail = cap - LENDER.otherDebts;
  return `<p><strong>Example:</strong> O-3 with dependents at Hurlburt Field. BAH ${usd(b.bah)} grossed up to ${usd(gross)}. Base pay about ${usd(b.basePay)}. Total gross about ${usd(total)}. ${Math.round(LENDER.dti * 100)}% of that is ${usd(cap)}, less ${usd(LENDER.otherDebts)} a month of car and card payments, leaving ${usd(avail)} for the housing payment. That approves roughly <strong>${lenderBand(b)}</strong>, zero down, or ${spanTxt(b.lenderLow - a.lenderLow, b.lenderHigh - a.lenderHigh)} more than the same O-3 at NAS Pensacola.</p>`; };

const grades = {};
for (const mha of Object.keys(BAH_DATA)) {
  grades[mha] = {};
  for (const group of ["enlisted", "warrant", "officer"]) for (const [grade, withDep, without] of BAH_DATA[mha][group]) {
    const basePay = BASE_PAY[grade] ?? null;
    // qualifying payment: base pay plus grossed-up BAH, capped at the lender DTI, less other debts.
    // A grade with no published base pay (O-1E, O-2E, O-3E, O-7) gets NULL rather than a figure
    // computed from a zero: publishing an $80,000 ceiling for a flag officer is worse than nothing.
    const qual = (extra) => Math.max(0, (basePay + withDep * LENDER.grossUp + extra) * LENDER.dti - LENDER.otherDebts);
    const solo = basePay === null ? null : qual(0);
    const dual = basePay === null ? null : qual(LENDER.spouseIncome);
    grades[mha][grade] = {
      bah: withDep, full: priceForPayment(withDep), buyBelow: priceForPayment(withDep * MODEL.buyBelowShare),
      bahNoDep: without, fullNoDep: priceForPayment(without), buyBelowNoDep: priceForPayment(without * MODEL.buyBelowShare),
      basePay,
      // what a lender approves on the service member's income alone
      lenderLow: solo === null ? null : priceForPayment(solo * LENDER.lowShare), lenderHigh: solo === null ? null : priceForPayment(solo),
      // the same with a working spouse at LENDER.spouseIncome a month
      dualLow: dual === null ? null : priceForPayment(dual * LENDER.lowShare), dualHigh: dual === null ? null : priceForPayment(dual),
    };
  }
}
const OUT = { model: MODEL, lender: LENDER, basePay: BASE_PAY, piFactor: Number(piFactor.toFixed(6)), multiplier: { full: Math.round(grades.FL064["E-5"].full / grades.FL064["E-5"].bah), buyBelow: Math.round(grades.FL064["E-5"].buyBelow / grades.FL064["E-5"].bah) }, generated: new Date().toISOString().slice(0, 10), mha: grades };
const G = (m, g) => grades[m][g];
const CHECK = process.argv.includes("--check");
if (!CHECK) { writeFileSync("content/affordability-2026.json", JSON.stringify(OUT, null, 2) + "\n"); console.log("content/affordability-2026.json written; E-5 FL064", band(G("FL064", "E-5")), "| O-3 FL023", band(G("FL023", "O-3"))); }

// ---------- page patches: every sentence that states a BAH-to-price number ----------
const E5 = G("FL064", "E-5"), E4 = G("FL064", "E-4"), E6 = G("FL064", "E-6"), E7 = G("FL064", "E-7"), O1 = G("FL064", "O-1"), O3 = G("FL064", "O-3"), O4 = G("FL064", "O-4"), O5 = G("FL064", "O-5"), O6 = G("FL064", "O-6");
const F = (g) => G("FL023", g);
const row = (grade, g, base) => `<tr><td>${grade}</td><td>${usd(g.bah)}</td><td>${base}</td><td><strong>${lenderBand(g)}</strong></td><td>${dualBand(g)}</td><td>${band(g)}</td></tr>`;
const BASE = { "E-4": "$2,850", "E-5": "$3,150", "E-6": "$3,530", "E-7": "$4,900", "E-8": "$5,550", "O-1": "$3,700", "O-2": "$4,400", "O-3": "$5,900", "O-4": "$7,500", "O-5": "$8,900" };
const tableRows = (mha) => ["E-4", "E-5", "E-6", "E-7", "E-8", "O-1", "O-2", "O-3", "O-4", "O-5"].map((g) => row(g === "O-1" && mha === "FL023" ? "O-1/W-1" : g, G(mha, g), BASE[g])).join("\n");
const delta = (g) => { const a = G("FL064", g), b = G("FL023", g); return `<tr><td>${g}</td><td>${usd(a.bah)}</td><td>${usd(b.bah)}</td><td>+${usd(b.bah - a.bah)}</td><td>${spread(b.lenderLow - a.lenderLow, b.lenderHigh - a.lenderHigh)}</td><td>${spread(b.buyBelow - a.buyBelow, b.full - a.full)}</td></tr>`; };
const HEAD = `<thead><tr><th>Rank (w/dep)</th><th>BAH</th><th>Base pay</th><th>Lender-qualified range</th><th>With a spouse at ${usd(LENDER.spouseIncome)}/mo</th><th>BAH-neutral anchor (${Math.round(MODEL.buyBelowShare * 100)}-100% of BAH)</th></tr></thead>`;
const DELTAHEAD = `<thead><tr><th>Rank (w/dep)</th><th>FL064 BAH</th><th>FL023 BAH</th><th>Monthly delta</th><th>Lender-qualified delta</th><th>BAH-neutral delta</th></tr></thead>`;
const DELTA_GRADES = ["E-4", "E-5", "E-7", "O-3", "O-5"];
const across = (pick) => { const v = DELTA_GRADES.flatMap((g) => pick(G("FL064", g), G("FL023", g))); return spanTxt(Math.min(...v), Math.max(...v)); };
const DELTA_LENDER = across((a, b) => [b.lenderLow - a.lenderLow, b.lenderHigh - a.lenderHigh]);
const DELTA_NEUTRAL = across((a, b) => [b.buyBelow - a.buyBelow, b.full - a.full]);
const bullet = (label, g) => `<li><strong>${label}</strong> w/ dependents (${usd(g.bah)}/mo BAH): lender-qualified <strong>${lenderBand(g)}</strong>, ${dualBand(g)} with a spouse at ${usd(LENDER.spouseIncome)}/mo, BAH-neutral anchor ${band(g)}.</li>`;
const bulletRule = (label, g) => [new RegExp(`<li>(?:<strong>)?${label}(?:<\\/strong>)? w\\/ dependents \\([\\s\\S]*?<\\/li>`), bullet(label, g)];
const RANK = { "E-1 to E-4": E4, "E-5": E5, "E-6": E6, "E-7": E7, "E-8": G("FL064", "E-8"), "E-9": G("FL064", "E-9"), "O-1": O1, "O-2": G("FL064", "O-2"), "O-3": O3, "O-4": O4, "O-5": O5, "O-6": O6 };
const NODEP = { lo: Math.floor(Math.min(...Object.values(RANK).map((g) => g.bah - g.bahNoDep)) / 5) * 5, hi: Math.ceil(Math.max(...Object.values(RANK).map((g) => g.bah - g.bahNoDep)) / 5) * 5 };
const RATEWEEK = MODEL.rateSource.replace(/^.*fixed average, /, "");

const PATCHES = [
  ["public/bah-to-mortgage-guide.html", [
    [/FL023 BAH runs \$570-\$1,128 per month higher than FL064 for the same rank, which [\s\S]*?\./,
      `FL023 BAH runs $570-$1,128 per month higher than FL064 for the same rank, which is worth ${DELTA_LENDER} more of lender-qualified purchase price and ${DELTA_NEUTRAL} more on the BAH-neutral anchor.`],
    [/<p><strong>The short answer:<\/strong>[\s\S]*?<\/p>/,
      `<p><strong>The short answer:</strong> Lenders count base pay and grossed-up BAH together, so a 2026 E-5 with dependents at NAS Pensacola (FL064, ${usd(E5.bah)}/mo BAH) is typically approved for <strong>${lenderBand(E5)}</strong> with zero down, and an O-3 with dependents in the Fort Walton Beach MHA (FL023, ${usd(F("O-3").bah)}/mo BAH) for <strong>${lenderBand(F("O-3"))}</strong>. Add a spouse earning ${usd(LENDER.spouseIncome)} a month and those become ${dualBand(E5)} and ${dualBand(F("O-3"))}. The conservative anchor answers a narrower question: holding the entire payment inside BAH alone is ${band(E5)} for that E-5 and ${band(F("O-3"))} for that O-3. An approval is a ceiling, not a target, and the tables below carry all three numbers for every pay grade.</p>`],
    // the two rank tables: header + rows, matched from the FL064 heading and the FL023 heading respectively
    // function replacements: the row text contains "$1,863", which String.replace would read as a backreference
    [/(Rank-by-Rank 2026 Reality \(Pensacola MHA FL064\)[\s\S]*?<table>\r?\n)<thead>[\s\S]*?<\/thead>\r?\n<tbody>\r?\n[\s\S]*?(\r?\n<\/tbody>)/,
      (m, p1, p2) => `${p1}${HEAD}\n<tbody>\n${tableRows("FL064")}${p2}`],
    [/(Rank-by-Rank 2026 Reality \(Fort Walton Beach MHA FL023\)[\s\S]*?<table>\r?\n)<thead>[\s\S]*?<\/thead>\r?\n<tbody>\r?\n[\s\S]*?(\r?\n<\/tbody>)/,
      (m, p1, p2) => `${p1}${HEAD}\n<tbody>\n${tableRows("FL023")}${p2}`],
    [/<p>Full BAH tables: <a href="\/bah-rates">2026 BAH Rates: FL064 \+ FL023<\/a>\.[\s\S]*?<\/p>/,
      `<p>Full BAH tables: <a href="/bah-rates">2026 BAH Rates: FL064 + FL023</a>. Read the table left to right: the lender-qualified range is what underwriting is likely to approve on the member's income alone, the spouse column adds ${usd(LENDER.spouseIncome)} a month of civilian income, and the BAH-neutral anchor is the price at which the whole payment fits inside the allowance, from the buy-below target at ${Math.round(MODEL.buyBelowShare * 100)}% of BAH to the full-PITI ceiling at 100%.</p>`],
    [/<p><strong>Model \(the same one on every page of this site\):<\/strong>[\s\S]*?(?=<h2>Rank-by-Rank 2026 Reality \(Fort Walton Beach MHA FL023\)<\/h2>)/,
      `<p><strong>Model (the same one on every page of this site):</strong> The lender-qualified range assumes what a VA lender actually does with the file: base pay plus BAH grossed up ${LENDER.grossUp} times because BAH is tax free, total monthly debts capped at ${Math.round(LENDER.dti * 100)}% of that gross, ${usd(LENDER.otherDebts)} a month of existing car, card and student loan payments, and VA residual income still met. The high end of the range uses all of that qualifying payment and the low end uses ${Math.round(LENDER.lowShare * 100)}% of it. The spouse column adds ${usd(LENDER.spouseIncome)} a month of civilian income and changes nothing else. The BAH-neutral anchor ignores base pay entirely and answers a different question: at what price does the whole payment fit inside the allowance, so that none of it comes out of base pay.</p>\n<p><strong>Cost side:</strong> VA loan, zero down, first-use ${MODEL.fundingFeePct}% funding fee financed, ${MODEL.rate}% 30-year rate (${MODEL.rateSource}), Escambia County unincorporated millage with the homestead exemption, and inland Zone X insurance of ${usd(MODEL.insurance.floor)}-${usd(MODEL.insurance.cap)} a year by price band. A disability funding-fee waiver, a lower rate, or fewer monthly debts move every column up; a coastal insurance quote, an HOA, or debts above ${usd(LENDER.otherDebts)} a month move them down. None of this is a pre-approval, and an approval is not a budget. In the junior enlisted grades the lender number usually lands under the BAH-neutral anchor, because base pay is small and existing debts eat into the ${Math.round(LENDER.dti * 100)}%; from E-7 and the mid officer grades up it runs well past the anchor, which is where deciding to buy below your approval matters most.</p>\n\n`],
    [/<p>Warrant Officer rates apply primarily to <strong>7th Special Forces Group<\/strong> personnel at Eglin AFB\.[\s\S]*?<\/p>/,
      `<p>Warrant Officer rates apply primarily to <strong>7th Special Forces Group</strong> personnel at Eglin AFB. W-2 with dependents draws ${usd(F("W-2").bah)} and W-4 draws ${usd(F("W-4").bah)}, which qualifies at roughly ${lenderBand(F("W-2"))} and ${lenderBand(F("W-4"))} on the same assumptions, against BAH-neutral anchors of ${band(F("W-2"))} and ${band(F("W-4"))}.</p>`],
    [/(<h2>FL064 vs FL023: Same Rank, Different Buying Power<\/h2>[\s\S]*?<table>\r?\n)<thead>[\s\S]*?<\/thead>\r?\n<tbody>\r?\n[\s\S]*?(\r?\n<\/tbody>)/,
      (m, p1, p2) => `${p1}${DELTAHEAD}\n<tbody>\n${DELTA_GRADES.map(delta).join("\n")}${p2}`],
    [/<p><strong>Practical implication:<\/strong>[\s\S]*?<\/p>/,
      `<p><strong>Practical implication:</strong> If you have any negotiability on follow-on orders between an FL064 and an FL023 base, or you are weighing a base-of-preference list, the BAH delta is real money. An O-3 at the same time in service draws nearly <strong>${usd(Math.round((F("O-3").bah - O3.bah) * 12 / 100) * 100)} more per year tax free</strong> at Hurlburt than at NAS Pensacola, which is worth ${spanTxt(F("O-3").lenderLow - O3.lenderLow, F("O-3").lenderHigh - O3.lenderHigh)} of extra lender-qualified purchase price, and ${spanTxt(F("O-3").buyBelow - O3.buyBelow, F("O-3").full - O3.full)} on the BAH-neutral anchor. BAH is only part of the income a lender counts, so the qualified delta is smaller than the BAH delta by itself suggests.</p>`],
    // the six scenario outcomes: same lender math, correct arithmetic (they were built on the retired 150x rule)
    [/<strong>Realistic: \$[\d,]+-\$[\d,]+<\/strong>\. (?:Needs to be in Milton|That is under most move-in-ready)[^<]*\./,
      `<strong>Realistic: ${scen(1371)}</strong>. That is under most move-in-ready inventory here, so paying down the car loan buys more house than any rate shopping will.`],
    [/<strong>Realistic: \$[\d,]+-\$[\d,]+<\/strong>\. Pace, Milton, or [^<]*\./,
      `<strong>Realistic: ${scen(2246)}</strong>. Pace, Milton, or the entry end of Navarre.`],
    [/<strong>Realistic: \$[\d,]+-\$[\d,]+<\/strong>\. (?:Access to nearly|That is what two incomes support on paper, which)[^<]*\./,
      `<strong>Realistic: ${scen(4489)}</strong>. That is what two incomes support on paper, which is nearly any Panhandle market except Destin waterfront.`],
    [/<strong>Realistic: \$[\d,]+-\$[\d,]+<\/strong>\. (?:Crestview new construction|That is under Crestview)[^<]*\.[^<]*\./,
      `<strong>Realistic: ${scen(1663)}</strong>. That is under Crestview new construction and most Fort Walton Beach resale pricing. Clearing the car and card payments moves this number more than anything else on the list.`],
    [/<strong>Realistic: \$[\d,]+-\$[\d,]+<\/strong>\. Crestview, mid-tier[^<]*\./,
      `<strong>Realistic: ${scen(2538)}</strong>. Crestview, mid-tier Fort Walton Beach, or entry Niceville.`],
    [/<strong>Realistic: \$[\d,]+-\$[\d,]+<\/strong>\. (?:Full access to|That is what two incomes support on paper: Niceville)[^<]*\./,
      `<strong>Realistic: ${scen(5077)}</strong>. That is what two incomes support on paper: Niceville, Bluewater Bay, established Fort Walton Beach, and most of Destin except Gulf-front.`],
    // the two worked examples published their own ranges, which disagreed with the table above them
    [/<p><strong>Example:<\/strong> E-7 with dependents at NAS Pensacola\.[\s\S]*?<\/p>/, () => EXAMPLE_E7()],
    [/<p><strong>Example:<\/strong> O-3 with dependents at Hurlburt Field\.[\s\S]*?<\/p>/, () => EXAMPLE_O3()],
    // the crossover is not the same in both MHAs, so compute it rather than assert it
    [/In the junior enlisted grades the lender number usually lands under the BAH-neutral anchor[^<]*\./,
      `Through the junior enlisted grades the lender number lands under the BAH-neutral anchor, because base pay is small and existing debts eat into the ${Math.round(LENDER.dti * 100)}%. Where it crosses depends on the allowance: at NAS Pensacola the approval passes the anchor at ${crossover("FL064")}, while in the higher-allowance Fort Walton Beach MHA it does not until ${crossover("FL023")}. Below the crossover the approval is the binding limit, and clearing a car payment moves it more than anything else you can do. Above it, buying back toward the anchor is what keeps the allowance covering the whole payment.`],
    // "Realistic" was the label on six approval ceilings, two sections below "an approval is a ceiling, not a target"
    [/<strong>Realistic: (\$[\d,]+-\$[\d,]+)<\/strong>/g, (m, v) => `<strong>Approved range: ${v}</strong>`],
    // the annual BAH delta was rounded to the wrong side of the real figure
    [/An O-3 at the same time in service draws [\s\S]*?, which is worth/,
      () => { const a = G("FL064", "O-3"), b = G("FL023", "O-3"); return `An O-3 at the same time in service draws <strong>${usd((b.bah - a.bah) * 12)} more per year tax free</strong> at Hurlburt than at NAS Pensacola, which is worth`; }],
    // the opening range collided with the computed BAH-delta range further down the page;
    // replace it with the lever the reader actually controls, computed from the same model
    [/When we get through them, the number is usually [^.]*\. Either way, no one should be guessing\./,
      () => { const d = debtLever("FL064", "E-5"); return `The answer moves in both directions, and it moves most on the one number a buyer controls. An E-5 with dependents at NAS Pensacola carrying ${usd(LENDER.otherDebts)} a month of car and card payments approves around ${usd(G("FL064", "E-5").lenderHigh)}. Clear that payment before you apply and the same E-5 approves around ${usd(d.free)}, a swing of about ${usd(d.gain)}. No one should be guessing at either figure.`; }],
    // no FAQ entry stated a lender-qualified range, which is the headline number on the page now
    [/"Yes\. Lenders gross up BAH because it is tax-free[^"]*"/,
      () => { const e5 = G("FL064", "E-5"), o3 = G("FL023", "O-3"); const gu = Math.round(1800 * LENDER.grossUp);
        return `"Yes. Lenders gross up BAH because it is tax-free, typically treating $1,800 of BAH as $${gu.toLocaleString("en-US")} of pre-tax income, then cap total debts at ${Math.round(LENDER.dti * 100)}% of the combined figure. Counting base pay alongside the grossed-up allowance and subtracting about ${usd(LENDER.otherDebts)} a month of other debts, an E-5 with dependents at NAS Pensacola qualifies for roughly ${lenderBand(e5)} and an O-3 at Hurlburt Field for roughly ${lenderBand(o3)}, zero down on a VA loan. An approval is a ceiling, not a target."`; }],
  ]],
  ["public/blog/bah-2026-pensacola-what-can-you-afford.html", [
    [/purchase price of roughly 1\d\d times your monthly BAH/, `purchase price of roughly ${OUT.multiplier.full} times your monthly BAH`],
    [/by roughly 1\d\d for your full-PITI ceiling at 6\.66%, or by roughly 1\d\d for the 90% buy-below target/, `by roughly ${OUT.multiplier.full} for your full-PITI ceiling at ${MODEL.rate}%, or by roughly ${OUT.multiplier.buyBelow} for the 90% buy-below target`],
    // afford-post row rebuild: one rule owns the whole row, so no cell can drift on its own again
    [/<tr><td>(E-[4-7]|O-[3-5]) \((FL064|FL023)\)<\/td>[\s\S]*?<\/tr>/,
      (m, g, mha) => { const r = G(mha, g);
        const lender = r.lenderHigh === null ? "n/a" : lenderBand(r);
        const dual = r.dualHigh === null ? "n/a" : dualBand(r);
        return `<tr><td>${g} (${mha})</td><td>${usd(r.bah)}</td><td>~${usd(r.buyBelow)}</td><td>~${usd(r.full)}</td><td><strong>${lender}</strong></td><td>${dual}</td></tr>`; }],
    [/<th>Buy-below target \(~90% of BAH\)<\/th><th>Full-PITI ceiling \(~100% of BAH\)<\/th>(?!<th>)/,
      `<th>Buy-below target (~90% of BAH)</th><th>Full-PITI ceiling (~100% of BAH)</th><th>Lender-qualified, one income</th><th>With a spouse at ${usd(LENDER.spouseIncome)}/mo</th>`],
  ]],
  ["public/bah-rates.html", [
    [/<p>As a quick planning shortcut:[\s\S]*?(?=<ul>)/,
      `<p>As a quick planning shortcut: what a lender approves starts with base pay, not with BAH alone. Add your monthly base pay to your BAH multiplied by ${LENDER.grossUp} (lenders gross up BAH because it is tax free), take ${Math.round(LENDER.dti * 100)}% of that total, subtract your existing car, card and student loan payments, and multiply what is left by about ${OUT.multiplier.full}. That is the purchase price the payment supports at ${MODEL.rate}% on a 30-year VA loan with zero down, with Escambia County taxes and Florida insurance inside the payment instead of stacked on top of it.</p>\n<p>Running the same ${OUT.multiplier.full} against BAH by itself answers a narrower question: at roughly ${OUT.multiplier.full} times your monthly BAH the entire payment fits inside the allowance, and at about ${OUT.multiplier.buyBelow} times you are at the buy-below target that leaves a ${Math.round((1 - MODEL.buyBelowShare) * 100)}% cushion. That is the conservative anchor, not the ceiling. The old "multiply by 150-170" rule counted principal and interest only and left Florida taxes and insurance on top of BAH; the full model, and the assumptions behind the ranges below, are on the <a href="/bah-to-mortgage-guide">BAH-to-mortgage guide</a>.</p>\n`],
    bulletRule("FL064 E-5", E5),
    bulletRule("FL064 E-7", E7),
    bulletRule("FL023 E-7", F("E-7")),
    bulletRule("FL023 O-3", F("O-3")),
    bulletRule("FL023 O-5", F("O-5")),
    [/<p>(?:These are conservative|Read those three numbers left to right)\.[\s\S]*?<\/p>/,
      `<p>Read those three numbers left to right. The first is what a lender is likely to approve on the member's income alone, assuming ${usd(LENDER.otherDebts)} a month of existing car, card and student loan payments; the second adds a spouse earning ${usd(LENDER.spouseIncome)} a month; the third is the conservative anchor, the price at which the entire payment still fits inside BAH. An approval is a ceiling, not a target, and none of this is a pre-approval. A disability funding-fee waiver, the homestead exemption in your first full tax year, and a non-flood-zone insurance quote push all three up; a coastal quote, an HOA, or heavier monthly debts pull them down. I run the precise number with a VA-experienced lender before we write an offer. Use the <a href="https://www.travel.dod.mil/Allowances/Basic-Allowance-for-Housing/BAH-Rate-Lookup/" target="_blank" rel="noopener">official DoD BAH calculator</a> to verify your exact rate.</p>`],
  ]],
  ["public/communities/milton.html", [
    [/Yes, comfortably\. E-5 BAH with dependents \(\$1,863\/mo in FL064 for 2026\) supports \$[\d,]+K-\$[\d,]+K in Milton, which covers most 3BR move-in-ready inventory\./g,
      `Yes, with a careful budget. E-5 BAH with dependents (${usd(E5.bah)}/mo in FL064 for 2026) keeps full PITI inside BAH at about ${bandK(E5)} on the sitewide model, which covers the entry end of Milton's 3BR inventory; E-6 (${usd(E6.bah)}) reaches ${bandK(E6)}.`],
    // Milton's own band on this page starts at $260K, which no FL064 E-4 or E-5 number reaches
    [/Milton is one of the few Pensacola MHA communities where E-4 and E-5 BAH comfortably supports a move-in-ready 3BR home\./g,
      () => `Milton is one of the few Pensacola MHA communities where junior enlisted pay reaches move-in-ready 3BR inventory at all. ${reachNote("FL064", 260)}`],
    [/E-6 BAH clears nearly the entire Milton market\./g,
      () => `An E-6 approval of about ${lenderBand(E6)} reaches the entry end of the Milton market, not the whole of it.`],
    // "junior enlisted" was the part that did not survive the model
    [/Milton is one of the few Pensacola MHA communities where junior enlisted pay reaches move-in-ready 3BR inventory at all\./g,
      `Milton is one of the better price-to-BAH trades in the Pensacola MHA, though its 3BR inventory still starts above the junior enlisted approval.`],
    ...reachRules("FL064"),
  ]],
  ["public/communities/navarre.html", [
    [/E-5 BAH supports entry-level Navarre homes in the \$[\d,]+K-\$[\d,]+K range\./g, `E-5 BAH (${usd(F("E-5").bah)} in FL023) keeps full PITI inside BAH at about ${bandK(F("E-5"))}, which reaches entry-level Navarre homes; FL064 E-5s drawing ${usd(E5.bah)} are limited to about ${bandK(E5)}.`],
    [/E-5 BAH \(~\$1,800–\$1,950\) comfortably supports \$275K–\$310K in Navarre, which opens up Villa Sabine and parts of Navarre proper\./,
      `E-5 BAH (${usd(F("E-5").bah)} in FL023, ${usd(E5.bah)} in FL064) keeps full PITI inside BAH at about ${bandK(F("E-5"))} for Hurlburt and Eglin families and ${bandK(E5)} for NAS Pensacola families, which reaches Villa Sabine and the entry end of Navarre proper.`],
    // Holley By The Sea is priced $375K-$550K on this page; only the grades that clear $375K may be named
    [/E-6 to E-7 BAH supports \$310K.\$370K: Holley By The Sea entry-level and Biscayne Pointe become accessible\./g,
      () => `An FL023 E-7 is approved for about ${lenderBand(F("E-7"))} on one income, which reaches Villa Sabine and Navarre proper. ${reachNote("FL023", 375)}`],
    [/O-1E to O-3 BAH unlocks the full Holley By The Sea and Estuary inventory\./g,
      () => `An FL023 O-3 approval of about ${lenderBand(F("O-3"))} reaches the entry end of Holley By The Sea and Estuary, not the full inventory.`],
    [/E-6 and above opens up Holley By The Sea and the broader market\. O-3 and above has the full range\./g,
      () => `${reachNote("FL023", 375)} An O-3 at about ${lenderBand(F("O-3"))} reaches the entry end of that range.`],
    ...reachRules("FL023"),
    // duplicate of the figure the generated sentence already carries
    [/ An O-3 at about \$[\d,]+-\$[\d,]+ reaches the entry end of that range\./g, ``],
  ]],
  ["public/communities/perdido-key.html", [
    [/E-5 BAH with dependents \(\$1,863\/mo in 2026\) supports entry-level condos up to about \$[\d,]+K, tight but workable on select Sandy Key and Villa Sabine listings\./,
      `E-5 BAH with dependents (${usd(E5.bah)}/mo in 2026) keeps full PITI inside BAH only up to about ${usdK(E5.full)}, and condo dues come out of that, so Perdido Key is a stretch below E-6 (${usd(E6.bah)}, about ${bandK(E6)}).`],
    // the $275K condo floor is not supported anywhere on this page; its named condo sections start at $375K
    [/Entry-level Gulf-view condos trade in the \$275K-\$375K range, which fits E-5 to E-6 BAH \(\$1,863-\$2,235 with dependents in FL064 for 2026\)\./g,
      () => `The named Gulf-view condo buildings on this page start at $375K. ${reachNote("FL064", 375)} Condo dues come out of the same payment, so budget them before the price.`],
    ...reachRules("FL064"),
    // $450K single-family was assigned to grades whose approvals stop far short
    [/Single-family homes in Perdido Key typically start at \$450K and up, which is a better fit for E-7\+ or O-3\+\./g,
      () => `Single-family homes in Perdido Key typically start at $450K. ${reachNote("FL064", 450)}`],
    // the body and the FAQ named two different floors for the same inland market
    [/the \$425K and up inland single-family market/g, `the $450K and up inland single-family market`],
  ]],
  ["public/communities/beulah.html", [
    [/E-5 and above opens up the bulk of newer construction at \$325K-\$450K, including Nature Trail and Bentley Oaks\./g,
      `Beulah's newer construction at $325K-$450K (Nature Trail, Bentley Oaks) sits above the single-income BAH-neutral band for most enlisted grades (E-5 about ${bandK(E5)}, E-6 and E-7 about ${bandK(E6)} on the sitewide model), so it usually takes a second income, dual BAH, or a disability funding-fee waiver.`],
    [/E-5 and E-6 BAH opens up the bulk of newer construction at \$325K-\$450K, including Nature Trail and most of Ashford Park\/Saddle Creek\./,
      `Newer construction at $325K-$450K (Nature Trail, most of Ashford Park/Saddle Creek) sits above the single-income BAH-neutral band for E-5 (about ${bandK(E5)}) and E-6 (about ${bandK(E6)}), so budget for a second income or a buy-below resale.`],
    // entry Beulah is $290K on this page; an FL064 E-4 is approved for $165K-$185K
    [/E-4 BAH \(~\$1,650-\$1,800\) puts you in entry-level Beulah homes at \$290K-\$340K: Heritage at Beulah, Beulah Pointe, or older Ashford Park inventory\./g,
      () => `Entry-level Beulah at $290K-$340K covers Heritage at Beulah, Beulah Pointe and older Ashford Park inventory. ${reachNote("FL064", 290)}`],
    [/O-1E through O-3 BAH lines up cleanly with Bentley Oaks and rural acreage in the \$425K-\$550K range\./g,
      () => `Bentley Oaks and rural acreage run $425K-$550K. ${reachNote("FL064", 425)}`],
    ...reachRules("FL064"),
  ]],
  ["public/communities/pace.html", [
    [/E-5 and E-6 BAH puts Stonebrook and Woodbine firmly in play at \$310K-\$360K\./g,
      `Stonebrook and Woodbine at $310K-$360K sit above the single-income BAH-neutral band (E-5 about ${bandK(E5)}, E-6 about ${bandK(E6)}), so they are O-4-and-up or dual-income territory; Pace resales in the ${bandK(E6)} range are the E-6 play.`],
  ]],
  ["public/communities/crestview.html", [
    [/E-5 comfortably covers new-construction 3-4BR homes in the \$350K-\$400K band\./,
      `E-5 BAH in FL023 (${usd(F("E-5").bah)}) keeps full PITI inside BAH at about ${bandK(F("E-5"))}, which covers Crestview resales and the entry end of new construction; the $350K-$400K new-build band is E-7 (${bandK(F("E-7"))}) and officer money on the sitewide model.`],
    // "$360K+ on E-5 BAH" predates the model by a wide margin
    [/2026 E-5 BAH \(\$2,433\/mo with dependents\) supports \$360K\+ in Crestview, well above what you could buy in Niceville or Destin\./g,
      () => `A 2026 FL023 E-5 draws ${usd(F("E-5").bah)} a month with dependents, which keeps the whole payment inside BAH at about ${bandK(F("E-5"))} and approves at about ${lenderBand(F("E-5"))} on one income. The same figures buy meaningfully more house in Crestview than in Niceville or Destin.`],
    ...reachRules("FL023"),
  ]],
  ["public/communities/fort-walton-beach.html", [
    [/from E-4\/E-5-friendly inventory in the \$275K-\$375K range/, `from E-4/E-5-friendly inventory in the ${bandK(F("E-4"))} to ${usdK(F("E-5").full)} range`],
    // both FWB reach claims sit far above the FL023 numbers for those grades
    [/E-4 BAH \(\$2,340\) supports \$350K-\$370K, a meaningful slice of the FWB starter-home market\./g,
      () => `E-4 BAH (${usd(F("E-4").bah)}) covers the whole payment up to about ${usdK(F("E-4").full)} and approves at about ${lenderBand(F("E-4"))} on one income.`],
    [/FL023 E-5 BAH \(\$2,433\) supports \$360K\+ in FWB, which covers most 3BR inventory\. E-6 opens up the full family-home market including newer construction\./g,
      () => `FL023 E-5 BAH (${usd(F("E-5").bah)}) covers the whole payment up to about ${usdK(F("E-5").full)} and approves at about ${lenderBand(F("E-5"))} on one income. ${reachNote("FL023", 275)}`],
    // an E-5 approval of about $220K-$245K against a $275K market floor is not the strongest pairing
    [/This is one of the strongest BAH-to-home-price pairings in the FL023 MHA for junior enlisted families\./g,
      () => `FL023 pays one of the higher allowances in the Southeast, which is why the BAH-neutral figure here beats most of Florida; the approval on one junior enlisted income still lands under the local market floor.`],
    ...reachRules("FL023"),
    // "comfortably" contradicts the approval figure in the same answer
    [/Yes, comfortably\. FL023 E-5 BAH/g, `Yes on the allowance, with a stretch on one income. FL023 E-5 BAH`],
  ]],
  ["public/blog/best-pensacola-neighborhoods-by-rank-bah.html", [
    [/Multiply your monthly BAH by roughly 120 to 125\./, `Multiply your monthly BAH by roughly ${OUT.multiplier.buyBelow} to ${OUT.multiplier.full}.`],
    // whole-row rebuild: BAH, the BAH-neutral anchor, the lender-qualified approval, and the
    // areas that approval actually reaches, all from one model. Rerunning reproduces the row.
    [/<tr><td>(E-1 to E-4|E-[5-9]|O-[1-6])<\/td>[\s\S]*?<\/tr>/,
      (m, g) => { const r = RANK[g]; const lender = r.lenderHigh === null ? "n/a" : lenderBand(r);
        const reaches = r.lenderHigh === null ? fit(r.full) : fit(r.lenderHigh);
        return `<tr><td>${g}</td><td>${usd(r.bah)}</td><td>~${bandK(r)}</td><td><strong>${lender}</strong></td><td>${reaches}</td></tr>`; }],
    [/<th>BAH-neutral price<\/th>/, `<th>BAH-neutral price (90-100% of BAH)</th>`],
    [/Without dependents, subtract roughly \$[\d,]+ to \$[\d,]+ a month depending on grade/, `Without dependents, subtract roughly ${usd(NODEP.lo)} to ${usd(NODEP.hi)} a month depending on grade`],
    [/6\.69%, week of August 6, 2026/, `${MODEL.rate}%, ${RATEWEEK}`],
    [/the 6\.69% thirty-year average for the week of August 6, 2026/, `the ${MODEL.rate}% thirty-year average for the ${RATEWEEK}`],
    [/which supports roughly \$215,000 to \$225,000 at full PITI/, `which supports roughly ${usd(E4.buyBelow)} to ${usd(E4.full)} (buy-below target to full-PITI ceiling)`],
    [/An E-5 at \$1,863 clears about \$225,000 to \$235,000, which is only \$69 a month and roughly \$10,000 of price above an E-4\./, `An E-5 at $1,863 clears about ${usd(E5.buyBelow)} to ${usd(E5.full)}, which is only $69 a month and roughly ${usd(E5.full - E4.full)} of price above an E-4.`],
    [/An E-6 at \$2,235 clears about \$270,000 to \$280,000, which changes everything\./, `An E-6 at $2,235 clears about ${usd(E6.buyBelow)} to ${usd(E6.full)}, which changes everything.`],
    [/At \$270,000 an E-6 reaches/, `At ${usd(E6.full)} an E-6 reaches`],
    [/All three land near \$270,000 to \$290,000 BAH-neutral/, `All three land near ${usd(E7.buyBelow)} to ${usd(G("FL064", "E-9").full)} BAH-neutral`],
    [/roughly \$230,000 to \$240,000, meaning/, `roughly ${usd(O1.buyBelow)} to ${usd(O1.full)}, meaning`],
    [/about \$268,000 to \$284,000\. That reaches/, `about ${usd(G("FL064", "O-2").buyBelow)} to ${usd(O3.full)}. That reaches`],
    [/BAH-neutral prices at roughly \$295,000 to \$330,000\./, `BAH-neutral prices at roughly ${usd(O4.buyBelow)} to ${usd(O6.full)}.`],
    [/keeps full PITI inside BAH at roughly \$225,000 to \$235,000 with zero down\./g, `keeps full PITI inside BAH at roughly ${usd(E5.buyBelow)} to ${usd(E5.full)} with zero down (buy-below target to full ceiling).`],
    [/which covers full PITI on roughly a \$215,000 to \$225,000 home with zero down on a VA loan\./, `which covers full PITI on roughly a ${usd(E4.buyBelow)} to ${usd(E4.full)} home with zero down on a VA loan.`],
    // the header gained two columns with the row rebuild above
    [/<th>BAH-neutral price \(90-100% of BAH\)<\/th><th>Neighborhoods that fit at BAH-neutral<\/th>/,
      `<th>BAH-neutral price (90-100% of BAH)</th><th>Lender-qualified, one income</th><th>Neighborhoods that approval reaches</th>`],
    // the E-7 approval figure predated the model and assumed no other debts without saying so
    [/so an E-7 who is approved for \$[\d,]+ to \$[\d,]+ on my BAH-to-mortgage worksheet can absolutely buy that house\./,
      () => { const e7 = G("FL064", "E-7"); const d = debtLever("FL064", "E-7");
        return `so an E-7 carrying ${usd(LENDER.otherDebts)} a month of car and card payments is approved for about ${lenderBand(e7)}, and the same E-7 with no car payment is approved for about ${usd(d.free)}. Either one can absolutely buy that house.`; }],
    // the deck promised a BAH-only map; the table now leads with the approval
    [/Your pay grade sets your housing allowance, and your housing allowance sets your map\. Here is which Pensacola neighborhood each 2026 FL064 BAH tier actually reaches, with current prices, real drive times, and the trade-off nobody mentions at check-in\./g,
      `Your pay grade sets your housing allowance, and a lender counts it alongside your base pay. Here is what each 2026 FL064 grade is approved for, which Pensacola neighborhoods that reaches, and the trade-off nobody mentions at check-in.`],
    // the approval column is driven by base pay, so a long-serving senior enlisted member can
    // out-qualify a junior officer. Say so under the table rather than leave it looking like an error.
    [/(?:<p>The approval column counts base pay[\s\S]*?<\/p>\s*)?<p>Without dependents, subtract roughly/,
      () => `<p>The approval column counts base pay at a typical time in grade, so a senior enlisted member with twenty years can out-qualify a newly promoted officer. Your own figure moves with time in service and with what you already owe: clearing ${usd(LENDER.otherDebts)} a month of car and card payments is worth about ${usd(debtLever("FL064", "E-7").gain)} of purchase price at every grade on this table.</p>
<p>Without dependents, subtract roughly`],
  ]],
];

// the built page is regenerated from this fragment by the blog factory, so it takes the same rules
PATCHES.push(["content/blog/bah-2026-pensacola-what-can-you-afford.fragment.html", PATCHES.find((p) => p[0].endsWith("what-can-you-afford.html"))[1]]);
PATCHES.push(["content/blog/best-pensacola-neighborhoods-by-rank-bah.fragment.html", PATCHES.find((p) => p[0].endsWith("by-rank-bah.html"))[1]]);
let changed = 0, stale = [];
for (const [file, rules] of PATCHES) {
  let h = readFileSync(file, "utf8"); const before = h;
  for (const [re, rep] of rules) {
    if (h.search(re) < 0) continue; // already rewritten (idempotent); the stale scan below catches real drift
    // global so schema + visible copies both change; string replacements go through a function so "$" stays literal
    h = h.replace(new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g"), typeof rep === "function" ? rep : () => rep);
  }
  if (h !== before) { changed++; if (!CHECK) writeFileSync(file, h); }
  // stale scan: any of the retired bands still present
  for (const s of ["$250,000-$285,000", "$250,000 - $285,000", "$330,000 - $385,000", "+$80,000-$100,000", "$280,000-$315,000", "$275K-$320K", "$275K-$310K", "$275K–$310K", "150-170 for a rough", "$225,000 to $235,000", "$215,000 to $225,000", "$270,000 to $280,000", "$510,000-$575,000</strong>. The rank", "roughly 120 times", "by roughly 120 for", "6.5% 30-year rate, modest", "~$215K-$225K", "~$225K-$235K", "~$270K-$280K", "~$270K-$282K", "~$272K-$283K", "~$277K-$288K", "~$230K-$240K", "~$268K-$279K", "~$273K-$284K", "~$295K-$307K", "~$313K-$326K", "~$316K-$329K", "6.69%, week of August 6, 2026", "6.69% thirty-year average", "$175 to $390 a month", "<th>BAH-neutral price</th>", "Target PITI @ 100% BAH", "BAH-neutral price (90% to 100% of BAH)", "<th>Buying-Power Delta</th>", "$80,000-$170,000 more buying power", "almost $170K more in qualifying mortgage capacity", "The low end of each band is the buy-below target", "These are BAH-neutral prices, not lender approvals", "which is $320,000-$355,000 and $370,000-$415,000 on the same model", "keeps full PITI inside BAH on a <strong>$200,000-$220,000</strong>", "Realistic: $190,000-$220,000", "Realistic: $300,000-$335,000", "Realistic: $580,000-$625,000", "Realistic: $230,000-$265,000", "Realistic: $345,000-$385,000", "Realistic: $660,000-$725,000", " home</li>", "These are conservative.", "inside BAH works out to roughly"]) if (h.includes(s)) stale.push(`${file}: ${s}`);
}
if (stale.length) { console.log(stale.join("\n")); console.log(`AFFORDABILITY: ${stale.length} stale bands`); process.exit(1); }
console.log(`affordability: ${changed} pages ${CHECK ? "would change" : "patched"}; no stale bands remain`);
