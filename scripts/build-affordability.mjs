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

const MODEL = {
  year: 2026,
  rate: 6.66, rateSource: "Freddie Mac PMMS 30-year fixed average, week ending August 27, 2026", rateUrl: "https://www.freddiemac.com/pmms",
  termYears: 30, downPayment: 0, fundingFeePct: 2.15, fundingFeeFinanced: true,
  millage: { nonSchool: 8.041, school: 5.359, note: "Escambia County unincorporated, 2025 tax year; homestead: first $25,000 off every levy, additional $25,000 off non-school levies only" },
  insurance: { pctOfPrice: 0.98, floor: 2400, cap: 3600, note: "inland Zone X, newer roof; coastal or old-roof quotes can double this line" },
  buyBelowShare: 0.9,
  roundTo: 5000,
};
const r = MODEL.rate / 100 / 12, n = MODEL.termYears * 12;
const piFactor = r / (1 - Math.pow(1 + r, -n));
export function monthlyPITI(price) {
  const loan = price * (1 - MODEL.downPayment) * (1 + (MODEL.fundingFeeFinanced ? MODEL.fundingFeePct / 100 : 0));
  const pi = loan * piFactor;
  const tax = (MODEL.millage.nonSchool * Math.max(0, price - 50000) + MODEL.millage.school * Math.max(0, price - 25000)) / 1000 / 12;
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

const grades = {};
for (const mha of Object.keys(BAH_DATA)) {
  grades[mha] = {};
  for (const group of ["enlisted", "warrant", "officer"]) for (const [grade, withDep, without] of BAH_DATA[mha][group]) {
    grades[mha][grade] = {
      bah: withDep, full: priceForPayment(withDep), buyBelow: priceForPayment(withDep * MODEL.buyBelowShare),
      bahNoDep: without, fullNoDep: priceForPayment(without), buyBelowNoDep: priceForPayment(without * MODEL.buyBelowShare),
    };
  }
}
const OUT = { model: MODEL, piFactor: Number(piFactor.toFixed(6)), multiplier: { full: Math.round(grades.FL064["E-5"].full / grades.FL064["E-5"].bah), buyBelow: Math.round(grades.FL064["E-5"].buyBelow / grades.FL064["E-5"].bah) }, generated: new Date().toISOString().slice(0, 10), mha: grades };
const G = (m, g) => grades[m][g];
const CHECK = process.argv.includes("--check");
if (!CHECK) { writeFileSync("content/affordability-2026.json", JSON.stringify(OUT, null, 2) + "\n"); console.log("content/affordability-2026.json written; E-5 FL064", band(G("FL064", "E-5")), "| O-3 FL023", band(G("FL023", "O-3"))); }

// ---------- page patches: every sentence that states a BAH-to-price number ----------
const E5 = G("FL064", "E-5"), E4 = G("FL064", "E-4"), E6 = G("FL064", "E-6"), E7 = G("FL064", "E-7"), O1 = G("FL064", "O-1"), O3 = G("FL064", "O-3"), O4 = G("FL064", "O-4"), O5 = G("FL064", "O-5"), O6 = G("FL064", "O-6");
const F = (g) => G("FL023", g);
const row = (grade, g, base) => `<tr><td>${grade}</td><td>${usd(g.bah)}</td><td>${base}</td><td>${usd(g.bah)}</td><td>${band(g)}</td></tr>`;
const BASE = { "E-4": "$2,850", "E-5": "$3,150", "E-6": "$3,530", "E-7": "$4,900", "E-8": "$5,550", "O-1": "$3,700", "O-2": "$4,400", "O-3": "$5,900", "O-4": "$7,500", "O-5": "$8,900" };
const tableRows = (mha) => ["E-4", "E-5", "E-6", "E-7", "E-8", "O-1", "O-2", "O-3", "O-4", "O-5"].map((g) => row(g === "O-1" && mha === "FL023" ? "O-1/W-1" : g, G(mha, g), BASE[g])).join("\n");
const delta = (g) => { const a = G("FL064", g), b = G("FL023", g); const lo = b.buyBelow - a.buyBelow, hi = b.full - a.full; return `<tr><td>${g}</td><td>${usd(a.bah)}</td><td>${usd(b.bah)}</td><td>+${usd(b.bah - a.bah)}</td><td>${lo === hi ? `+${usd(hi)}` : `+${usd(Math.min(lo, hi))} to +${usd(Math.max(lo, hi))}`}</td></tr>`; };
const HEAD = `<thead><tr><th>Rank (w/dep)</th><th>BAH</th><th>Base Pay</th><th>Target PITI @ 100% BAH</th><th>BAH-neutral price (90% to 100% of BAH)</th></tr></thead>`;
const RANK = { "E-1 to E-4": E4, "E-5": E5, "E-6": E6, "E-7": E7, "E-8": G("FL064", "E-8"), "E-9": G("FL064", "E-9"), "O-1": O1, "O-2": G("FL064", "O-2"), "O-3": O3, "O-4": O4, "O-5": O5, "O-6": O6 };
const NODEP = { lo: Math.floor(Math.min(...Object.values(RANK).map((g) => g.bah - g.bahNoDep)) / 5) * 5, hi: Math.ceil(Math.max(...Object.values(RANK).map((g) => g.bah - g.bahNoDep)) / 5) * 5 };
const RATEWEEK = MODEL.rateSource.replace(/^.*fixed average, /, "");

const PATCHES = [
  ["public/bah-to-mortgage-guide.html", [
    [/realistically supports a <strong>\$[\d,]+-\$[\d,]+<\/strong> VA purchase with zero down, while an O-3 with dependents in the Fort Walton Beach MHA \(FL023, \$3,399\/mo BAH\) supports roughly <strong>\$[\d,]+-\$[\d,]+<\/strong>/,
      `keeps full PITI inside BAH on a <strong>${band(E5)}</strong> VA purchase with zero down, while an O-3 with dependents in the Fort Walton Beach MHA (FL023, $3,399/mo BAH) covers roughly <strong>${band(F("O-3"))}</strong>`],
    // the two rank tables: header + rows, matched from the FL064 heading and the FL023 heading respectively
    // function replacements: the row text contains "$1,863", which String.replace would read as a backreference
    [/(Rank-by-Rank 2026 Reality \(Pensacola MHA FL064\)[\s\S]*?<table>\r?\n)<thead>[\s\S]*?<\/thead>\r?\n<tbody>\r?\n[\s\S]*?(\r?\n<\/tbody>)/,
      (m, p1, p2) => `${p1}${HEAD}\n<tbody>\n${tableRows("FL064")}${p2}`],
    [/(Rank-by-Rank 2026 Reality \(Fort Walton Beach MHA FL023\)[\s\S]*?<table>\r?\n)<thead>[\s\S]*?<\/thead>\r?\n<tbody>\r?\n[\s\S]*?(\r?\n<\/tbody>)/,
      (m, p1, p2) => `${p1}${HEAD}\n<tbody>\n${tableRows("FL023")}${p2}`],
    [/Note E-6\/E-7 have wider ranges because pay scales widely with time-in-service; the lower end assumes new to rank, the upper end assumes time-in-service\./,
      `The low end of each band is the buy-below target (full PITI at 90% of BAH); the high end is the full-PITI ceiling (100% of BAH).`],
    [/<p><strong>Caveat:<\/strong> "Realistic purchase price" assumes zero down, 6\.5% 30-year rate, modest other debts\. With 5% down, 100% disability waiver, or an IRRRL-refinanceable rate, numbers flex up 5-15%\.<\/p>/,
      `<p><strong>Model (the same one on every page of this site):</strong> VA loan, zero down, first-use ${MODEL.fundingFeePct}% funding fee financed, ${MODEL.rate}% 30-year rate (${MODEL.rateSource}), Escambia County unincorporated millage with the homestead exemption, and inland Zone X insurance of $2,400-$3,600 a year by price band. These are BAH-neutral prices, not lender approvals: underwriters count base pay too, so you can be approved for more. A disability funding-fee waiver, a lower rate, or a second income moves the band up; a coastal insurance quote moves it down.</p>`],
    [/W-2 with dependents draws \$[\d,]+; W-4 draws \$[\d,]+, supporting roughly \$[\d,]+-\$[\d,]+ and \$[\d,]+-\$[\d,]+ respectively at the same rate and DTI assumptions above\./,
      `W-2 with dependents draws ${usd(F("W-2").bah)}; W-4 draws ${usd(F("W-4").bah)}, which is ${band(F("W-2"))} and ${band(F("W-4"))} on the same model.`],
    [/(<th>Buying-Power Delta<\/th><\/tr><\/thead>\r?\n<tbody>\r?\n)[\s\S]*?(\r?\n<\/tbody>)/, (m, p1, p2) => `${p1}${["E-4", "E-5", "E-7", "O-3", "O-5"].map(delta).join("\n")}${p2}`],
  ]],
  ["public/blog/bah-2026-pensacola-what-can-you-afford.html", [
    [/purchase price of roughly 1\d\d times your monthly BAH/, `purchase price of roughly ${OUT.multiplier.full} times your monthly BAH`],
    [/by roughly 1\d\d for your full-PITI ceiling at 6\.66%, or by roughly 1\d\d for the 90% buy-below target/, `by roughly ${OUT.multiplier.full} for your full-PITI ceiling at ${MODEL.rate}%, or by roughly ${OUT.multiplier.buyBelow} for the 90% buy-below target`],
  ]],
  ["public/bah-rates.html", [
    [/<p>As a quick planning shortcut: monthly BAH covers approximately 0\.6-0\.7% of a home's purchase price in principal \+ interest at 6\.5% on a 30-year VA loan \(zero down\), plus taxes and insurance\. Multiply your BAH by 150-170 for a rough purchase-price ceiling that stays inside BAH\.<\/p>/,
      `<p>As a quick planning shortcut: at ${MODEL.rate}% on a 30-year VA loan with zero down, keeping the entire PITI payment (principal, interest, taxes, and insurance) inside BAH works out to roughly ${OUT.multiplier.full} times your monthly BAH. Multiply by about ${OUT.multiplier.buyBelow} for the buy-below target that leaves a 10% cushion. The old "multiply by 150-170" rule counted principal and interest only and left Florida taxes and insurance on top of BAH; the full model is on the <a href="/bah-to-mortgage-guide">BAH-to-mortgage guide</a>.</p>`],
    [/<li>FL064 E-5 w\/ dependents \(\$1,863\) → ~\$[\d,]+-\$[\d,]+ home<\/li>/, `<li>FL064 E-5 w/ dependents (${usd(E5.bah)}) → ${band(E5)} home (buy-below target to full-PITI ceiling)</li>`],
    [/<li>FL064 E-7 w\/ dependents \(\$2,256\) → ~\$[\d,]+-\$[\d,]+ home<\/li>/, `<li>FL064 E-7 w/ dependents (${usd(E7.bah)}) → ${band(E7)} home</li>`],
    [/<li>FL023 E-7 w\/ dependents \(\$2,841\) → ~\$[\d,]+-\$[\d,]+ home<\/li>/, `<li>FL023 E-7 w/ dependents (${usd(F("E-7").bah)}) → ${band(F("E-7"))} home</li>`],
  ]],
  ["public/communities/milton.html", [
    [/Yes, comfortably\. E-5 BAH with dependents \(\$1,863\/mo in FL064 for 2026\) supports \$[\d,]+K-\$[\d,]+K in Milton, which covers most 3BR move-in-ready inventory\./g,
      `Yes, with a careful budget. E-5 BAH with dependents (${usd(E5.bah)}/mo in FL064 for 2026) keeps full PITI inside BAH at about ${bandK(E5)} on the sitewide model, which covers the entry end of Milton's 3BR inventory; E-6 (${usd(E6.bah)}) reaches ${bandK(E6)}.`],
  ]],
  ["public/communities/navarre.html", [
    [/E-5 BAH supports entry-level Navarre homes in the \$[\d,]+K-\$[\d,]+K range\./g, `E-5 BAH (${usd(F("E-5").bah)} in FL023) keeps full PITI inside BAH at about ${bandK(F("E-5"))}, which reaches entry-level Navarre homes; FL064 E-5s drawing ${usd(E5.bah)} are limited to about ${bandK(E5)}.`],
    [/E-5 BAH \(~\$1,800–\$1,950\) comfortably supports \$275K–\$310K in Navarre, which opens up Villa Sabine and parts of Navarre proper\./,
      `E-5 BAH (${usd(F("E-5").bah)} in FL023, ${usd(E5.bah)} in FL064) keeps full PITI inside BAH at about ${bandK(F("E-5"))} for Hurlburt and Eglin families and ${bandK(E5)} for NAS Pensacola families, which reaches Villa Sabine and the entry end of Navarre proper.`],
  ]],
  ["public/communities/perdido-key.html", [
    [/E-5 BAH with dependents \(\$1,863\/mo in 2026\) supports entry-level condos up to about \$[\d,]+K, tight but workable on select Sandy Key and Villa Sabine listings\./,
      `E-5 BAH with dependents (${usd(E5.bah)}/mo in 2026) keeps full PITI inside BAH only up to about ${usdK(E5.full)}, and condo dues come out of that, so Perdido Key is a stretch below E-6 (${usd(E6.bah)}, about ${bandK(E6)}).`],
  ]],
  ["public/communities/beulah.html", [
    [/E-5 and above opens up the bulk of newer construction at \$325K-\$450K, including Nature Trail and Bentley Oaks\./g,
      `Beulah's newer construction at $325K-$450K (Nature Trail, Bentley Oaks) sits above the single-income BAH-neutral band for most enlisted grades (E-5 about ${bandK(E5)}, E-6 and E-7 about ${bandK(E6)} on the sitewide model), so it usually takes a second income, dual BAH, or a disability funding-fee waiver.`],
    [/E-5 and E-6 BAH opens up the bulk of newer construction at \$325K-\$450K, including Nature Trail and most of Ashford Park\/Saddle Creek\./,
      `Newer construction at $325K-$450K (Nature Trail, most of Ashford Park/Saddle Creek) sits above the single-income BAH-neutral band for E-5 (about ${bandK(E5)}) and E-6 (about ${bandK(E6)}), so budget for a second income or a buy-below resale.`],
  ]],
  ["public/communities/pace.html", [
    [/E-5 and E-6 BAH puts Stonebrook and Woodbine firmly in play at \$310K-\$360K\./g,
      `Stonebrook and Woodbine at $310K-$360K sit above the single-income BAH-neutral band (E-5 about ${bandK(E5)}, E-6 about ${bandK(E6)}), so they are O-4-and-up or dual-income territory; Pace resales in the ${bandK(E6)} range are the E-6 play.`],
  ]],
  ["public/communities/crestview.html", [
    [/E-5 comfortably covers new-construction 3-4BR homes in the \$350K-\$400K band\./,
      `E-5 BAH in FL023 (${usd(F("E-5").bah)}) keeps full PITI inside BAH at about ${bandK(F("E-5"))}, which covers Crestview resales and the entry end of new construction; the $350K-$400K new-build band is E-7 (${bandK(F("E-7"))}) and officer money on the sitewide model.`],
  ]],
  ["public/communities/fort-walton-beach.html", [
    [/from E-4\/E-5-friendly inventory in the \$275K-\$375K range/, `from E-4/E-5-friendly inventory in the ${bandK(F("E-4"))} to ${usdK(F("E-5").full)} range`],
  ]],
  ["public/blog/best-pensacola-neighborhoods-by-rank-bah.html", [
    [/Multiply your monthly BAH by roughly 120 to 125\./, `Multiply your monthly BAH by roughly ${OUT.multiplier.buyBelow} to ${OUT.multiplier.full}.`],
    [/(<tr><td>(E-1 to E-4|E-[5-9]|O-[1-6])<\/td><td>)\$[\d,]+(<\/td><td>)~?\$[\d,]+K?-\$[\d,]+K?(<\/td>)/,
      (m, p1, g, p3, p4) => `${p1}${usd(RANK[g].bah)}${p3}~${bandK(RANK[g])}${p4}`],
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
  ]],
];

// the built page is regenerated from this fragment by the blog factory, so it takes the same rules
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
  for (const s of ["$250,000-$285,000", "$250,000 - $285,000", "$330,000 - $385,000", "+$80,000-$100,000", "$280,000-$315,000", "$275K-$320K", "$275K-$310K", "$275K–$310K", "150-170 for a rough", "$225,000 to $235,000", "$215,000 to $225,000", "$270,000 to $280,000", "$510,000-$575,000</strong>. The rank", "roughly 120 times", "by roughly 120 for", "6.5% 30-year rate, modest", "~$215K-$225K", "~$225K-$235K", "~$270K-$280K", "~$270K-$282K", "~$272K-$283K", "~$277K-$288K", "~$230K-$240K", "~$268K-$279K", "~$273K-$284K", "~$295K-$307K", "~$313K-$326K", "~$316K-$329K", "6.69%, week of August 6, 2026", "6.69% thirty-year average", "$175 to $390 a month", "<th>BAH-neutral price</th>"]) if (h.includes(s)) stale.push(`${file}: ${s}`);
}
if (stale.length) { console.log(stale.join("\n")); console.log(`AFFORDABILITY: ${stale.length} stale bands`); process.exit(1); }
console.log(`affordability: ${changed} pages ${CHECK ? "would change" : "patched"}; no stale bands remain`);
