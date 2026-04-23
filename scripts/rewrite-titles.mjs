// Tighten weak titles uncovered by the audit:
// - 7 homes-for-sale pages: drop generic "Military-Friendly Listings" for
//   "VA Loan Expert", which matches actual search intent of military buyers.
// - school-zones: 86 chars -> drop redundant phrase, keep keyword-led.
// - blog: lead with keywords not with "Blog |".
// Also updates matching og:title and twitter:title where present.

import { readdirSync, readFileSync, writeFileSync } from "node:fs";

// {oldTitle -> newTitle} — applied literally, so no collision with partial matches.
const REWRITES = {
  "Homes for Sale Near Corry Station | Military-Friendly Listings | Gregg Costin":
    "Homes for Sale Near Corry Station | VA Loan Expert | Gregg Costin",
  "Homes for Sale Near Duke Field | Military-Friendly Listings | Gregg Costin":
    "Homes for Sale Near Duke Field | VA Loan Expert | Gregg Costin",
  "Homes for Sale Near Eglin AFB | Military-Friendly Listings | Gregg Costin":
    "Homes for Sale Near Eglin AFB | VA Loan Expert | Gregg Costin",
  "Homes for Sale Near Hurlburt Field | Military-Friendly Listings | Gregg Costin":
    "Homes for Sale Near Hurlburt Field | VA Loan Expert | Gregg Costin",
  "Homes for Sale Near NAS Pensacola | Military-Friendly Listings | Gregg Costin":
    "Homes for Sale Near NAS Pensacola | VA Loan Expert | Gregg Costin",
  "Homes for Sale Near NAS Whiting Field | Military-Friendly Listings | Gregg Costin":
    "Homes for Sale Near Whiting Field | VA Loan Expert | Gregg Costin",
  "Homes for Sale Near Saufley Field | Military-Friendly Listings | Gregg Costin":
    "Homes for Sale Near Saufley Field | VA Loan Expert | Gregg Costin",
  "School Zones for Military Families | Santa Rosa vs Escambia vs Okaloosa | Gregg Costin":
    "Military Family School Zones | Escambia vs Santa Rosa vs Okaloosa",
  "Blog | Gregg Costin Pensacola Military Realtor | PCS, VA Loans, BAH":
    "Military Real Estate Blog | PCS, VA Loans, BAH | Gregg Costin",
};

function walk(dir, out = []) {
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    const p = `${dir}/${f.name}`;
    if (f.isDirectory()) walk(p, out);
    else if (f.isFile() && /\.html$/.test(f.name)) out.push(p);
  }
  return out;
}

let touched = 0, subs = 0;
for (const path of walk("public")) {
  let c;
  try { c = readFileSync(path, "utf8"); } catch { continue; }
  const before = c;
  for (const [oldT, newT] of Object.entries(REWRITES)) {
    if (c.includes(oldT)) {
      const n = c.split(oldT).length - 1;
      c = c.split(oldT).join(newT);
      subs += n;
    }
  }
  if (c !== before) { writeFileSync(path, c, "utf8"); touched++; }
}
console.log(`Rewrote ${subs} title strings across ${touched} files.`);
