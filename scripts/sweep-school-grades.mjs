// Sync school letter grades in PMH page copy to the official FLDOE 2026 data that already powers
// greggcostin.com/schools (audit 2026-09-02, mil-01). Only Escambia (17) and Santa Rosa (57)
// schools are in the data file; Okaloosa mentions are reported, not changed. FLDOE grades are
// A to F with no plus or minus, so "(A-)" and "(B+)" suffixes are stripped for matched schools.
//
//   node scripts/sweep-school-grades.mjs --dry      # report only
//   node scripts/sweep-school-grades.mjs            # apply
import { readdirSync, readFileSync, writeFileSync } from "node:fs";

const dry = process.argv.includes("--dry");
const data = JSON.parse(readFileSync("content/schools/school-grades-2026.json", "utf8"));

// "HELLEN CARO ELEMENTARY SCHOOL" -> ["Hellen Caro Elementary School", "Hellen Caro Elementary"]
const titleCase = (s) => s.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase()).replace(/\bK-8\b/i, "K-8");
const variants = (name) => {
  const t = titleCase(name).replace(/\s+/g, " ").trim();
  const out = new Set([t]);
  out.add(t.replace(/ Elementary School$/, " Elementary").replace(/ Middle School$/, " Middle").replace(/ High School$/, " High").replace(/ Senior High School$/, " High").replace(/ Intermediate School$/, " Intermediate"));
  out.add(t.replace(/ Senior High School$/, " High School"));
  if (/^J M Tate/i.test(t)) { out.add("J.M. Tate High"); out.add("Tate High School"); out.add("Tate High"); }
  if (/^J H Workman/i.test(t)) { out.add("J.H. Workman Middle"); out.add("Workman Middle"); }
  if (/^S S Dixon/i.test(t)) { out.add("S.S. Dixon Intermediate"); out.add("Dixon Intermediate"); }
  if (/^Thomas L Sims/i.test(t)) { out.add("Sims Middle"); out.add("Thomas L. Sims Middle"); }
  if (/^A K Suter/i.test(t)) { out.add("A.K. Suter Elementary"); out.add("Suter Elementary"); }
  if (/^Holley-Navarre Intermediate/i.test(t)) out.add("Holley-Navarre Intermediate");
  if (/^West Navarre Intermediate/i.test(t)) out.add("West Navarre Intermediate");
  return [...out].filter(Boolean);
};

const schools = data.schools.map((s) => ({ name: s.name, grade: s.g2026, prev: s.g2025, variants: variants(s.name) }));

function walk(dir, out = []) {
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    const p = `${dir}/${f.name}`;
    if (f.isDirectory()) walk(p, out); else if (f.name.endsWith(".html")) out.push(p);
  }
  return out;
}

const GRADE_RE = /\((A\+?|A-|B\+?|B-|C\+?|C-|D\+?|D-|F)\)/;
let changes = 0, files = 0;
const unknown = new Map();
for (const file of walk("public")) {
  let html = readFileSync(file, "utf8");
  const before = html;
  // 1) "<Name> (X)" forms for known schools
  for (const s of schools) {
    for (const v of s.variants) {
      const re = new RegExp(`(${v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:</strong>)?)\\s*\\((A\\+?|A-|B\\+?|B-|C\\+?|C-|D\\+?|D-|F)\\)`, "g");
      html = html.replace(re, (m, nm, g) => {
        if (g === s.grade) return m;
        changes++;
        if (dry) console.log(`  ${file}: ${nm.replace(/<[^>]+>/g, "")} (${g}) -> (${s.grade})`);
        return `${nm} (${s.grade})`;
      });
    }
  }
  // 2) report "<Name> (X)" forms for schools NOT in the data (Okaloosa etc.)
  for (const m of html.matchAll(/([A-Z][A-Za-z.'-]+(?: [A-Z][A-Za-z.'-]+){0,4} (?:Elementary|Middle|High|K-8|Intermediate|Academy|School)[A-Za-z ]*)\s*\((A\+?|A-|B\+?|B-|C\+?|C-|D|F)\)/g)) {
    const nm = m[1].trim();
    if (!schools.some((s) => s.variants.some((v) => nm.endsWith(v) || nm === v))) unknown.set(nm, (unknown.get(nm) || 0) + 1);
  }
  if (html !== before) { files++; if (!dry) writeFileSync(file, html); }
}
console.log(`${dry ? "[dry] " : ""}grade tokens corrected: ${changes} across ${files} files`);
if (unknown.size) {
  console.log("Not in the FLDOE data file (Okaloosa or unmatched), left untouched:");
  [...unknown.entries()].sort((a, b) => b[1] - a[1]).forEach(([n, c]) => console.log(`  ${c}x ${n}`));
}
