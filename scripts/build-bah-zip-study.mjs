// Quarterly refresh pipeline for the "BAH vs. Cost of Owning by ZIP" data study
// (/bah-vs-cost-of-owning-pensacola). Downloads Zillow's public ZHVI-by-ZIP CSV,
// filters to the 26 covered ZIPs, runs each through the SAME cost model as the
// bah-rates calculator (VA zero-down, 2.15% first-use fee financed, 6.5%/30yr,
// 1.0% tax, $3,000/yr insurance), compares against BAH_DATA in src/App.jsx, and
// prints the finished <tr> rows plus the headline stats for pasting into
// content/pages/bah-vs-cost-of-owning-pensacola.fragment.html (then rebuild via
// page-factory and update the data-vintage month in the page's prose/FAQ).
//
// Usage: node scripts/build-bah-zip-study.mjs
// Refresh cadence: quarterly; re-baseline each January when new BAH rates drop
// (update RATE/TAX/INS here only if the calculator's defaults change too).

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline";
import { createReadStream } from "node:fs";

const ROOT = fileURLToPath(new URL("..", import.meta.url)).replace(/\\/g, "/");
const ZHVI_URL = "https://files.zillowstatic.com/research/public_csvs/zhvi/Zip_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv";
const CSV = ROOT + "zhvi_zip_tmp.csv"; // ~120MB; delete after running

const RATE = 0.065, TAX = 0.01, INS_YR = 3000, FEE = 0.0215;

const NAMES = { "32501": ["Pensacola: downtown", "Escambia"], "32502": ["Pensacola: downtown / Palafox", "Escambia"], "32503": ["Pensacola: East Hill / Cordova", "Escambia"], "32504": ["Pensacola: northeast", "Escambia"], "32505": ["Pensacola: west side", "Escambia"], "32506": ["Pensacola: southwest, near NASP", "Escambia"], "32507": ["Pensacola: Navy Point / Perdido side", "Escambia"], "32514": ["Ferry Pass", "Escambia"], "32526": ["Bellview / Beulah side", "Escambia"], "32533": ["Cantonment", "Escambia"], "32534": ["Pensacola: north", "Escambia"], "32536": ["Crestview (west)", "Okaloosa"], "32539": ["Crestview (east)", "Okaloosa"], "32541": ["Destin", "Okaloosa"], "32547": ["Fort Walton Beach (north)", "Okaloosa"], "32548": ["Fort Walton Beach (south)", "Okaloosa"], "32561": ["Gulf Breeze proper", "Santa Rosa"], "32563": ["Gulf Breeze (Midway/Tiger Point)", "Santa Rosa"], "32566": ["Navarre", "Santa Rosa"], "32569": ["Mary Esther", "Okaloosa"], "32570": ["Milton", "Santa Rosa"], "32571": ["Pace", "Santa Rosa"], "32578": ["Niceville / Bluewater Bay", "Okaloosa"], "32579": ["Shalimar", "Okaloosa"], "32580": ["Valparaiso", "Okaloosa"], "32583": ["Milton (east)", "Santa Rosa"] };

if (!existsSync(CSV)) {
  console.log("Downloading ZHVI (~120MB)...");
  const res = await fetch(ZHVI_URL);
  writeFileSync(CSV, Buffer.from(await res.arrayBuffer()));
}

const appSrc = readFileSync(ROOT + "src/App.jsx", "utf8");
const bah = eval("(" + appSrc.match(/const BAH_DATA = ({[\s\S]*?});/)[1] + ")");
const grades = (mha) => [...bah[mha].enlisted, ...bah[mha].warrant, ...bah[mha].officer]
  .filter(([g]) => /^E-|^O-[1-6]$/.test(g)).map(([g, w]) => [g, w]);
const FL064 = grades("FL064"), FL023 = grades("FL023");

const rl = createInterface({ input: createReadStream(CSV) });
let header = null; const rows = [];
for await (const l of rl) {
  if (!header) { header = l.split(","); continue; }
  const cols = l.split(",");
  const zip = cols[2].replace(/"/g, "");
  if (!NAMES[zip]) continue;
  let val = null, month = null;
  for (let i = cols.length - 1; i > 8; i--) if (cols[i] !== "") { val = parseFloat(cols[i]); month = header[Math.min(i, header.length - 1)]; break; }
  rows.push({ zip, v: Math.round(val), month });
}

const per1 = (RATE / 12) / (1 - Math.pow(1 + RATE / 12, -360));
const cost = (p) => Math.round(p * (1 + FEE) * per1 + p * TAX / 12 + INS_YR / 12);
const cover = (c, tbl) => {
  const e = tbl.find(([g, w]) => g.startsWith("E") && w >= c);
  const o = tbl.find(([g, w]) => g.startsWith("O") && w >= c);
  if (!e && !o) return "No grade";
  return [e ? (e[0] === "E-1" ? "E-1+" : e[0] + "+") : null, o ? o[0] + "+" : null].filter(Boolean).join(" / ");
};

rows.forEach(r => r.c = cost(r.v));
rows.sort((a, b) => a.c - b.c);

console.log("Data month:", rows[0].month, "\n");
for (const r of rows)
  console.log(`<tr><td>${r.zip}</td><td>${NAMES[r.zip][0]}</td><td>${NAMES[r.zip][1]}</td><td>$${r.v.toLocaleString()}</td><td><strong>$${r.c.toLocaleString()}</strong></td><td>${cover(r.c, FL064)}</td><td>${cover(r.c, FL023)}</td></tr>`);

const e5_64 = FL064.find(([g]) => g === "E-5")[1], e5_23 = FL023.find(([g]) => g === "E-5")[1];
const max64 = Math.max(...FL064.map(([, w]) => w)), max23 = Math.max(...FL023.map(([, w]) => w));
console.log(`\nStats: E-5 FL064 ($${e5_64}) covers ${rows.filter(r => r.c <= e5_64).length}/${rows.length} ZIPs; E-5 FL023 ($${e5_23}) covers ${rows.filter(r => r.c <= e5_23).length}/${rows.length}`);
console.log(`No FL064 grade: ${rows.filter(r => r.c > max64).length}/${rows.length}; no FL023 grade: ${rows.filter(r => r.c > max23).length}/${rows.length}`);
console.log(`Median monthly cost: $${rows[Math.floor(rows.length / 2)].c.toLocaleString()}`);
console.log("\nRemember: update the data-vintage month in the fragment prose/FAQ, rebuild with page-factory, delete zhvi_zip_tmp.csv.");
