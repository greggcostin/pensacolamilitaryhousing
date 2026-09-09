// Generate the lead-magnet PDF: "Pensacola PCS Checklist + 2026 BAH Cheat Sheet".
// Print-friendly (white bg, navy/gold). BAH figures import the shared source.
// (FL064 Pensacola + FL056 Fort Walton Beach, 2026). Regenerate after the annual
// BAH update. Output: public/downloads/pensacola-pcs-checklist.pdf
import PDFDocument from "pdfkit";
import { createWriteStream, mkdirSync, existsSync } from "node:fs";
import {BAH_DATA} from '../src/bahData.js';

const NAVY = "#0A0F1A", GOLD = "#B7902F", INK = "#222222", MUTE = "#666666", RULE = "#DDD6C4";
const OUT = "public/downloads/pensacola-pcs-checklist.pdf";
if (!existsSync("public/downloads")) mkdirSync("public/downloads", { recursive: true });

const doc = new PDFDocument({ size: "LETTER", margins: { top: 54, bottom: 22, left: 54, right: 54 }, info: {
  Title: "Pensacola PCS Checklist + 2026 BAH Cheat Sheet",
  Author: "Gregg Costin, Realtor, Levin Rinke Realty",
  Subject: "Military PCS relocation checklist and 2026 BAH rates for Pensacola and Fort Walton Beach",
  Keywords: "PCS, Pensacola, BAH 2026, VA loan, military relocation",
} });
doc.pipe(createWriteStream(OUT));
const L = 54, R = 558, W = R - L;

function footer() {
  const y = 720;
  doc.moveTo(L, y).lineTo(R, y).lineWidth(0.5).strokeColor(RULE).stroke();
  doc.font("Helvetica").fontSize(8).fillColor(MUTE)
    .text("Gregg Costin, Realtor®  ·  Retired USAF Combat Systems Officer  ·  Levin Rinke Realty  ·  Licensed FL & AL", L, y + 8, { width: W, align: "center" })
    .fillColor(GOLD).text("(850) 266-5005 · 6 a.m. to midnight Central daily · pensacolamilitaryhousing.com", L, y + 20, { width: W, align: "center" });
}
function heading(txt, sub) {
  doc.rect(L, 54, W, 4).fill(GOLD);
  doc.font("Helvetica-Bold").fontSize(11).fillColor(GOLD).text("PENSACOLA MILITARY HOUSING", L, 70, { characterSpacing: 2 });
  doc.font("Helvetica-Bold").fontSize(23).fillColor(NAVY).text(txt, L, 90, { width: W });
  if (sub) doc.font("Helvetica").fontSize(11).fillColor(MUTE).text(sub, L, doc.y + 3, { width: W });
  return doc.y + 14;
}
function sectionTitle(txt, y) {
  doc.font("Helvetica-Bold").fontSize(13).fillColor(NAVY).text(txt.toUpperCase(), L, y, { characterSpacing: 0.5 });
  doc.moveTo(L, doc.y + 3).lineTo(L + 40, doc.y + 3).lineWidth(2).strokeColor(GOLD).stroke();
  return doc.y + 12;
}
function items(list, y) {
  doc.font("Helvetica").fontSize(10.5).fillColor(INK);
  for (const it of list) {
    doc.rect(L, y + 1.5, 9, 9).lineWidth(1).strokeColor(GOLD).stroke();
    doc.text(it, L + 18, y, { width: W - 18 });
    y = doc.y + 7;
  }
  return y + 6;
}

// ─────────── PAGE 1: CHECKLIST ───────────
let y = heading("Your PCS-to-Pensacola Checklist", "Planning sequence, not a promised closing schedule. Reviewed September 8, 2026.");
y = sectionTitle("Before the Search", y);
y = items([
  "Connect with a military-savvy Realtor and get VA loan pre-approval (request your Certificate of Eligibility).",
  "Compare rent and full ownership costs using actual income, cash to close and reserves.",
  "Confirm your reporting location, housing instructions, route and school assignment.",
  "Start a virtual home search; line up video tours if you are buying sight-unseen.",
], y);
y = sectionTitle("Contract and Move Planning", y);
y = items([
  "Finalize financing; gather your LES, orders, W-2s, and bank statements.",
  "Coordinate HHG or a personally procured move with your transportation office.",
  "Submit offers and negotiate; open escrow once under contract.",
  "Coordinate inspection and lender appraisal; obtain property insurance and tax estimates.",
  "Arrange utilities and file your change of address.",
], y);
y = sectionTitle("Before Closing and Possession", y);
y = items([
  "Review the Closing Disclosure and verify wire instructions through a known phone number.",
  "Do the final walkthrough before signing.",
  "Transfer utilities and register your kids for school.",
  "Confirm possession, insurance coverage and temporary lodging until the home is ready.",
], y);
y = sectionTitle("After Arrival", y);
y = items([
  "Ask the property appraiser about homestead eligibility and filing dates for your facts.",
  "Confirm military residency, license and registration rules before changing state records.",
  "Update DEERS and confirm your TRICARE region.",
  "Explore your base's newcomer / relocation resources.",
], y);
footer();

// ─────────── PAGE 2: BAH CHEAT SHEET ───────────
doc.addPage();
y = heading("2026 BAH Cheat Sheet", "Monthly Basic Allowance for Housing by pay grade. Your rate follows your DUTY STATION, not your home address.");

const grades=['E-4','E-5','E-6','E-7','O-1','O-2','O-3','O-4'];
const rows=code=>[...BAH_DATA[code].enlisted,...BAH_DATA[code].officer].filter(r=>grades.includes(r[0])).map(([g,a,b])=>[g,a.toLocaleString('en-US'),b.toLocaleString('en-US')]);
const FL064 = { name: "Pensacola MHA (FL064)", inst: "NAS Pensacola · Corry · Saufley · NAS Whiting", rows:rows('FL064') };
const FL056 = { name: "Eglin AFB MHA (FL056)", inst: "Eglin AFB · Hurlburt Field · Duke Field", rows:rows('FL056') };

function bahTable(t, x, top) {
  const colW = 232;
  doc.font("Helvetica-Bold").fontSize(12).fillColor(NAVY).text(t.name, x, top, { width: colW });
  doc.font("Helvetica").fontSize(8).fillColor(MUTE).text(t.inst, x, doc.y + 1, { width: colW });
  let ry = doc.y + 8;
  doc.font("Helvetica-Bold").fontSize(9).fillColor(GOLD);
  doc.text("GRADE", x, ry, { width: 60 });
  doc.text("W/ DEP", x + 78, ry, { width: 70, align: "right" });
  doc.text("W/O DEP", x + 152, ry, { width: 78, align: "right" });
  ry += 14;
  doc.moveTo(x, ry - 3).lineTo(x + colW, ry - 3).lineWidth(0.75).strokeColor(RULE).stroke();
  for (const [g, wd, wo] of t.rows) {
    doc.font("Helvetica-Bold").fontSize(10).fillColor(INK).text(g, x, ry, { width: 60 });
    doc.font("Helvetica").fontSize(10).fillColor(INK).text("$" + wd, x + 78, ry, { width: 70, align: "right" });
    doc.fillColor(MUTE).text("$" + wo, x + 152, ry, { width: 78, align: "right" });
    ry += 17;
  }
  return ry;
}
const tableTop = y;
const end1 = bahTable(FL064, L, tableTop);
const end2 = bahTable(FL056, L + 262, tableTop);
y = Math.max(end1, end2) + 16;

y = sectionTitle("How to Use These Numbers", y);
doc.font("Helvetica").fontSize(10.5).fillColor(INK);
doc.text("BAH is an income input, not a purchase-price approval. Use actual LES income, debts, cash needs and a property-specific total: loan payment, buyer-based taxes, homeowners and wind insurance, flood coverage where applicable, dues, assessments, upkeep and utilities. The E-5 with-dependents reference is $2,433 in FL056 and $1,863 in FL064. Ask finance to confirm your individual eligibility, duty-station ZIP and rate protection. A future rent or sale price is uncertain.", L, y, { width: W, lineGap: 2 });
y = doc.y + 16;

doc.rect(L, y, W, 66).lineWidth(1.5).strokeColor(GOLD).stroke();
doc.font("Helvetica-Bold").fontSize(13).fillColor(NAVY).text("Build a documented home-search plan", L + 16, y + 10, { width: W - 32 });
doc.font("Helvetica").fontSize(10).fillColor(INK).text("Share your area, move date and housing goals. Use secure lender channels for LES, orders and financial records.", L + 16, doc.y + 2, { width: W - 32 });
doc.font("Helvetica-Bold").fontSize(11).fillColor(GOLD).text("Call or text (850) 266-5005", L + 16, doc.y + 4, { width: W - 32 });

doc.font("Helvetica").fontSize(8).fillColor(MUTE).text("Rates effective January 1, 2026; content reviewed September 8, 2026. Source: DoD BAH lookup (travel.dod.mil). Full tables: pensacolamilitaryhousing.com/bah-rates. Property comparison: greggcostin.com/resources/coastal-ownership-costs. This worksheet does not approve financing or establish tax or legal eligibility.", L, 661, { width: W, link:'https://www.travel.dod.mil/Allowances/Basic-Allowance-for-Housing/BAH-Rate-Lookup/' });
footer();

doc.end();
console.log("wrote", OUT);
