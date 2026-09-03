// eeat-10 (audit 2026-09-02): a licensed agent may not characterize a neighborhood or its
// residents on safety, crime or class. This removes every such characterization from both sites
// and replaces it with either a pointer to the primary record (FDLE, the municipal police annual
// report, the county sheriff) or a fact about the housing stock. It also fixes the source blog
// fragments, so the next factory rebuild cannot reintroduce any of it.
//
// Nothing is written unless every occurrence count matches exactly. Idempotent: a second run
// reports the edits as already in place.
//   node scripts/fix-fair-housing-copy.mjs --dry
//   node scripts/fix-fair-housing-copy.mjs
import { readFileSync, writeFileSync } from "node:fs";

const DRY = process.argv.includes("--dry");
const E = [
  // --- Gulf Breeze blog post: AreaVibes crime grade and "safest" claims (page + source fragment)
  ["public/blog/living-in-gulf-breeze-pros-cons.html", "Is Gulf Breeze safe?", "Where do I check crime statistics for Gulf Breeze?", 2],
  ["public/blog/living-in-gulf-breeze-pros-cons.html", "By every regional measure, yes. Aggregators consistently place it among the safest communities in the area, and AreaVibes grades its crime an A+. Published rates differ by an order of magnitude depending on methodology, so I will not quote a per-capita figure, but low crime is one of the few claims about Gulf Breeze that every source agrees on.", "Go to the agencies, not to an aggregator. The Gulf Breeze Police Department publishes an annual report for the city, the Santa Rosa County Sheriff's Office is the reporting agency for Oriole Beach and Tiger Point, and the Florida Department of Law Enforcement posts the Uniform Crime Report data behind both. Third-party rates for the same year disagree by an order of magnitude depending on methodology, so read the agency numbers yourself. I do not rate or rank neighborhoods.", 2],
  ["public/blog/living-in-gulf-breeze-pros-cons.html", "very low crime for the region, water on three sides", "water on three sides", 2],
  ["public/blog/living-in-gulf-breeze-pros-cons.html", "very low crime, water on three sides", "water on three sides", 1],
  ["public/blog/living-in-gulf-breeze-pros-cons.html", "Published crime rates disagree by an order of magnitude; the consensus: among the region's safest, A+ from AreaVibes.", "Crime statistics belong to the agencies: the Gulf Breeze Police Department publishes an annual report and the Florida Department of Law Enforcement posts the Uniform Crime Report data behind it.", 1],
  ["content/blog/living-in-gulf-breeze-pros-cons.fragment.html", "Is Gulf Breeze safe?", "Where do I check crime statistics for Gulf Breeze?", null],
  ["content/blog/living-in-gulf-breeze-pros-cons.fragment.html", "By every regional measure, yes. Aggregators consistently place it among the safest communities in the area, and AreaVibes grades its crime an A+. Published rates differ by an order of magnitude depending on methodology, so I will not quote a per-capita figure, but low crime is one of the few claims about Gulf Breeze that every source agrees on.", "Go to the agencies, not to an aggregator. The Gulf Breeze Police Department publishes an annual report for the city, the Santa Rosa County Sheriff's Office is the reporting agency for Oriole Beach and Tiger Point, and the Florida Department of Law Enforcement posts the Uniform Crime Report data behind both. Third-party rates for the same year disagree by an order of magnitude depending on methodology, so read the agency numbers yourself. I do not rate or rank neighborhoods.", null],
  ["content/blog/living-in-gulf-breeze-pros-cons.fragment.html", "very low crime for the region, water on three sides", "water on three sides", null],
  ["content/blog/living-in-gulf-breeze-pros-cons.fragment.html", "very low crime, water on three sides", "water on three sides", null],
  ["content/blog/living-in-gulf-breeze-pros-cons.fragment.html", "Published crime rates disagree by an order of magnitude; the consensus: among the region's safest, A+ from AreaVibes.", "Crime statistics belong to the agencies: the Gulf Breeze Police Department publishes an annual report and the Florida Department of Law Enforcement posts the Uniform Crime Report data behind it.", null],
  // --- Cantonment: "is it safe" answer plus a promise to pull crime data per showing
  ["public/communities/cantonment.html", "Is Cantonment safe for military families?", "Where do I check crime statistics for Cantonment?", 2],
  ["public/communities/cantonment.html", "Yes, for the established and newer subdivisions (Beulah Pointe, Nature Trail, Jacks Branch). As with any area, crime stats vary by specific zone. I pull neighborhood-level crime data for every showing. The Beulah corridor is particularly strong.", "Go to the primary records rather than to an agent or an aggregator. Cantonment is unincorporated, so the Escambia County Sheriff's Office is the reporting agency, and the Florida Department of Law Enforcement posts the Uniform Crime Report data for it. I do not rate or rank neighborhoods, but I will point you at those records and the permit and parcel history for any address on your list.", 2],
  // --- "safest default", "safer neighborhood"
  ["public/bases/hurlburt-field.html", "Navarre (Santa Rosa County): the safest default for families.", "Navarre (Santa Rosa County): the strongest default on school grades.", 1],
  ["public/va-loan-guide.html", "a better school district, safer neighborhood, or closer to base", "a better-graded school zone, newer construction, or a shorter drive to base", 1],
  ["src/App.jsx", "a better school district, safer neighborhood, or closer to base", "a better-graded school zone, newer construction, or a shorter drive to base", 1],
  ["src/App.jsx", "top schools, safe neighborhoods, and a 10-minute commute", "top schools, newer inventory, and a 10-minute commute", 1],
  // --- class characterization
  ["public/communities/bellview-myrtle-grove.html", "adjacent working-class neighborhoods in west Pensacola, 10-15 minutes to NAS Pensacola", "adjacent unincorporated Escambia County neighborhoods in west Pensacola, 10-15 minutes to NAS Pensacola", 1],
  ["public/communities/bellview-myrtle-grove.html", "Adjacent working-class neighborhoods 10-15 minutes from the NAS Pensacola West Gate", "Adjacent unincorporated Escambia County neighborhoods 10-15 minutes from the NAS Pensacola West Gate", 1],
  ["public/communities/bellview-myrtle-grove.html", "1970s-80s ranch homes, some newer infill, working-class character.", "1970s-80s ranch homes and some newer infill, at the lowest median list prices in the metro inside a 15-minute base commute.", 1],
  ["src/communitiesData.js", "West Pensacola working-class neighborhoods. 10-15 min to NAS Pensacola.", "West Pensacola neighborhoods in unincorporated Escambia County. 10-15 min to NAS Pensacola.", 1],
  // --- "steer", the statutory term
  ["public/communities/beulah.html", "This is the cluster I steer families to when Escambia schools are a concern.", "This is the cluster most buyers shortlist when Escambia school grades are the deciding factor.", 2],
  ["public/bases/whiting-field.html", "This is the single biggest reason I steer most Whiting families to Pace over Milton.", "This is the single biggest reason most Whiting buyers compare Pace against Milton before they compare price.", 1],
  ["public/blog/best-neighborhoods-eglin-afb-families.html", "I steer Eglin main-base families away from it unless one spouse works toward Hurlburt", "I flag that drive for Eglin main-base buyers unless one spouse works toward Hurlburt", 1],
  ["content/blog/best-neighborhoods-eglin-afb-families.fragment.html", "I steer Eglin main-base families away from it unless one spouse works toward Hurlburt", "I flag that drive for Eglin main-base buyers unless one spouse works toward Hurlburt", 1],
  ["public/blog/best-pensacola-neighborhoods-by-rank-bah.html", "the three neighborhoods where it works, and the ones I would steer you away from", "the three neighborhoods where it works, and the ones where the math does not", 1],
  ["content/blog/best-pensacola-neighborhoods-by-rank-bah.fragment.html", "the three neighborhoods where it works, and the ones I would steer you away from", "the three neighborhoods where it works, and the ones where the math does not", 1],
  ["public/blog/bah-2026-pensacola-what-can-you-afford.html", "the inland Zone X newer-roof profile I steer BAH buyers toward", "the inland Zone X newer-roof profile most BAH buyers end up in", 1],
  ["content/blog/bah-2026-pensacola-what-can-you-afford.fragment.html", "the inland Zone X newer-roof profile I steer BAH buyers toward", "the inland Zone X newer-roof profile most BAH buyers end up in", 1],
  // --- "up-and-coming", a coded term on brokerage banned-word lists
  ["civilian-site/neighborhoods/midtown-east-pensacola-heights.html", '<p class="nb-fit"><strong>Best fit:</strong> Up-and-coming blocks, bayou access, older homes.</p>', '<p class="nb-fit"><strong>Best fit:</strong> Bayou access, 1920s to 1950s bungalows, smaller lots.</p>', 1],
  ["civilian-site/neighborhoods.html", '<div class="nb-for">Up-and-Coming &middot; Bayou Access</div>', '<div class="nb-for">Bayou Access &middot; Older Homes</div>', 1],
  ["scripts/civilian-neighborhoods-data.mjs", 'fit: "Up-and-coming blocks, bayou access, older homes"', 'fit: "Bayou access, 1920s to 1950s bungalows, smaller lots"', 1],
];

const byFile = new Map();
let applied = 0, already = 0, problems = [];
for (const [file, find, repl, expect] of E) {
  if (!byFile.has(file)) byFile.set(file, readFileSync(file, "utf8"));
  const src = byFile.get(file);
  const n = src.split(find).length - 1;
  if (n === 0) {
    if (src.includes(repl)) { already++; continue; }
    problems.push(`${file}: find not present and replacement absent -> ${JSON.stringify(find.slice(0, 60))}`);
    continue;
  }
  if (expect !== null && n !== expect) { problems.push(`${file}: expected ${expect} occurrence(s), found ${n} -> ${JSON.stringify(find.slice(0, 60))}`); continue; }
  byFile.set(file, src.split(find).join(repl));
  applied += n;
}
if (problems.length) { console.log(problems.join("\n")); throw new Error(`${problems.length} occurrence mismatch(es); nothing written`); }
if (!DRY) for (const [file, out] of byFile) writeFileSync(file, out, "utf8");
console.log(`${DRY ? "[dry] " : ""}fair-housing copy: ${applied} replacement(s), ${already} already in place, ${byFile.size} file(s) touched`);
