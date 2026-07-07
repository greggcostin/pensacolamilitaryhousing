// Generate the lead-magnet PDF: "Pensacola PCS Checklist + 2026 BAH Cheat Sheet".
// Print-friendly (white bg, navy/gold). BAH figures mirror BAH_DATA in src/App.jsx
// (FL064 Pensacola + FL023 Fort Walton Beach, 2026). Regenerate after the annual
// BAH update. Output: public/downloads/pensacola-pcs-checklist.pdf
import PDFDocument from "pdfkit";
import { createWriteStream, mkdirSync, existsSync } from "node:fs";

const NAVY = "#0A0F1A", GOLD = "#B7902F", INK = "#222222", MUTE = "#666666", RULE = "#DDD6C4";
const OUT = "public/downloads/pensacola-pcs-checklist.pdf";
if (!existsSync("public/downloads")) mkdirSync("public/downloads", { recursive: true });

const doc = new PDFDocument({ size: "LETTER", margins: { top: 54, bottom: 22, left: 54, right: 54 }, info: {
  Title: "Pensacola PCS Checklist + 2026 BAH Cheat Sheet",
  Author: "Gregg Costin, Realtor — Levin Rinke Realty",
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
    .fillColor(GOLD).text("(850) 266-5005   ·   pensacolamilitaryhousing.com", L, y + 20, { width: W, align: "center" });
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
let y = heading("Your PCS-to-Pensacola Checklist", "A retired USAF officer's 90/60/30/7-day timeline for a smooth move to the Emerald Coast.");
y = sectionTitle("90–60 Days Out — Set the Foundation", y);
y = items([
  "Connect with a military-savvy Realtor and get VA loan pre-approval (request your Certificate of Eligibility).",
  "Decide buy vs. rent and set a budget aligned to your BAH (see the cheat sheet on page 2).",
  "Research base commute, school zones, and neighborhoods for your duty station.",
  "Start a virtual home search; line up video tours if you are buying sight-unseen.",
], y);
y = sectionTitle("30 Days Out — Lock It In", y);
y = items([
  "Finalize financing; gather your LES, orders, W-2s, and bank statements.",
  "Schedule your HHG or DITY/PPM move and get moving estimates.",
  "Submit offers and negotiate; open escrow once under contract.",
  "Schedule your home inspection and VA appraisal.",
  "Arrange utilities and file your change of address.",
], y);
y = sectionTitle("Move Week — Cross the Finish Line", y);
y = items([
  "Confirm your closing date and exact funds-to-close — verify wire instructions by phone (wire-fraud check).",
  "Do the final walkthrough before signing.",
  "Transfer utilities and register your kids for school.",
  "Get your keys — welcome to the Gulf Coast.",
], y);
y = sectionTitle("First 30 Days in Florida", y);
y = items([
  "File your Florida homestead exemption with the county property appraiser (deadline: March 1).",
  "Get your Florida driver's license and vehicle registration.",
  "Update DEERS and confirm your TRICARE region.",
  "Explore your base's newcomer / relocation resources.",
], y);
footer();

// ─────────── PAGE 2: BAH CHEAT SHEET ───────────
doc.addPage();
y = heading("2026 BAH Cheat Sheet", "Monthly Basic Allowance for Housing by pay grade. Your rate follows your DUTY STATION, not your home address.");

const FL064 = { name: "Pensacola MHA (FL064)", inst: "NAS Pensacola · Corry Station · NAS Whiting Field", rows: [
  ["E-4", "1,794", "1,521"], ["E-5", "1,863", "1,644"], ["E-6", "2,235", "1,722"], ["E-7", "2,256", "1,791"],
  ["O-1", "1,914", "1,719"], ["O-2", "2,232", "1,842"], ["O-3", "2,271", "2,097"], ["O-4", "2,457", "2,232"],
] };
const FL023 = { name: "Fort Walton Beach MHA (FL023)", inst: "Eglin AFB · Hurlburt Field", rows: [
  ["E-4", "2,340", "2,007"], ["E-5", "2,433", "2,157"], ["E-6", "2,526", "2,250"], ["E-7", "2,841", "2,340"],
  ["O-1", "2,451", "2,244"], ["O-2", "2,523", "2,406"], ["O-3", "3,399", "2,592"], ["O-4", "3,528", "2,865"],
] };

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
const end2 = bahTable(FL023, L + 262, tableTop);
y = Math.max(end1, end2) + 16;

y = sectionTitle("How to Use These Numbers", y);
doc.font("Helvetica").fontSize(10.5).fillColor(INK);
doc.text("A common rule of thumb: your BAH comfortably supports a monthly mortgage payment (PITI) in roughly the same range, which on a VA loan with zero down often means a home priced around 130–150 times your monthly BAH — but your real number depends on rate, taxes, insurance, and debts. Notice the spread: an E-5 at Hurlburt Field (FL023) draws $2,433 with dependents versus $1,863 at NAS Pensacola (FL064). Same rank, very different budget — because BAH follows your duty station.", L, doc.y, { width: W, lineGap: 2 });
y = doc.y + 16;

doc.rect(L, y, W, 66).lineWidth(1.5).strokeColor(GOLD).stroke();
doc.font("Helvetica-Bold").fontSize(13).fillColor(NAVY).text("Want your exact numbers?", L + 16, y + 12, { width: W - 32 });
doc.font("Helvetica").fontSize(10.5).fillColor(INK).text("Text me your rank, duty station, and timeline and I will run your real affordability and send homes that fit — no pressure. — Gregg", L + 16, doc.y + 2, { width: W - 32 });
doc.font("Helvetica-Bold").fontSize(11).fillColor(GOLD).text("Call or text (850) 266-5005", L + 16, doc.y + 4, { width: W - 32 });

doc.font("Helvetica-Oblique").fontSize(7.5).fillColor(MUTE).text("2026 BAH rates published by the Department of Defense; figures are for the Pensacola (FL064) and Fort Walton Beach (FL023) military housing areas and are informational only. Confirm your rate at the official DoD BAH calculator. This is not lending, tax, or financial advice.", L, 700, { width: W });
footer();

doc.end();
console.log("wrote", OUT);
