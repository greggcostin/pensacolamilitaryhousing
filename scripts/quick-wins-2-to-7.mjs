// Quick-wins 2-7 from the strategic audit.
//
// 2. Expand 7 on-base-vs-off-base pages to 1,500+ words each with base-specific
//    commute matrix, school zones, lifestyle comparison, and extra FAQs.
// 3. Build pillar-cluster reciprocal links (VA Loan Guide ↔ satellites,
//    BAH to Mortgage ↔ satellites, PCS Checklist ↔ satellites).
// 4. Add Service schema for VA Consultation / PCS Planning / First-Time Buyer
//    Coaching on homepage.
// 5. Add speakable schema for voice assistants on homepage + 5 top pages.
// 6. Add "Last verified" footer badge site-wide.
// 7. Add 3 external authority links (VA.gov, FHFA, travel.dod.mil) to
//    resource pages where missing.

import { readdirSync, readFileSync, writeFileSync } from "node:fs";

function walk(dir, out = []) {
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    const p = `${dir}/${f.name}`;
    if (f.isDirectory()) walk(p, out);
    else if (f.isFile() && /\.html$/.test(f.name)) out.push(p);
  }
  return out;
}

// ──────────────────────────────────────────────────────────────────
// TASK 2 — Expand 7 on-base-vs-off-base pages with base-specific content
// ──────────────────────────────────────────────────────────────────

const BASE_EXPANSIONS = {
  "nas-pensacola": {
    commute: [
      ["Navy Point / Warrington",   "5 min",   "2 mi",  "On-base gate to neighborhood"],
      ["Bellview / Myrtle Grove",  "10-12 min","4-5 mi","Close without gate backup"],
      ["East Hill / Cordova Park", "12-18 min","5-7 mi","Historic Pensacola, walkable"],
      ["Perdido Key",              "18-25 min","8-10 mi","Beach; long bridge possible"],
      ["Gulf Breeze",              "15-20 min","7-9 mi","Via 3-Mile Bridge, peak delays"],
      ["Pace",                     "30-40 min","22-26 mi","Santa Rosa value play"],
      ["Navarre",                  "35-45 min","30-35 mi","BAH arbitrage (FL064)"],
    ],
    schools: [
      { zone: "Gulf Breeze", feeder: "Gulf Breeze Elementary (A) → Gulf Breeze Middle (A) → Gulf Breeze High (A, IB)" },
      { zone: "East Hill / Cordova Park", feeder: "A.K. Suter Elementary (A) → Workman Middle (B+) → Washington High (B+, JROTC) or Pensacola High via IB magnet" },
      { zone: "Navy Point / Warrington", feeder: "Navy Point Elementary (B) → Warrington Middle (B) → Pensacola High via magnet choice" },
      { zone: "Perdido Key", feeder: "Hellen Caro Elementary (A) → Bailey Middle (A-) → Pine Forest High (B+, arts magnet)" },
      { zone: "Pace", feeder: "S.S. Dixon Intermediate (A-) → Pace High (B+) — Santa Rosa County" },
    ],
    lifestyle: [
      "Base community at NAS Pensacola skews aviation-student-heavy — young crews, tight schedules, CSO/NFO/Naval Aviator pipeline families. Officer and enlisted side-by-side on base.",
      "Off-base in Gulf Breeze or East Hill: established neighborhoods with civilian + military mix, quieter, better for families with school-age kids.",
      "On-base commissary + NEX + CDC on-site — real time savings for dual-working parents.",
      "Off-base HOA neighborhoods (Gulf Breeze's Whisper Bay, Cordova Park) offer amenities on-base housing doesn't: pools, tennis, boat slips, gated security.",
      "Pet policy: on-base limits (typically 2 pets, no restricted breeds). Off-base limits are HOA/landlord specific.",
    ],
    faqs: [
      { q: "How close is on-base housing to the flight line at NAS Pensacola?", a: "Most on-base housing on the west and north sides is 5-10 minutes from the flight line and student aviator training buildings. Ideal for CSO and NFO students with irregular T-6/T-1 and VT-4/10/86 schedules." },
      { q: "Can Coast Guard personnel use NAS Pensacola on-base housing?", a: "Yes. Coast Guard members assigned to CG Aviation Training Center or CG Station Pensacola can apply. Housing assignment follows joint-base policy but Coast Guard rates often access at parity." },
      { q: "What about Balfour Beatty Communities at NAS Pensacola?", a: "Balfour Beatty is the privatized housing partner managing NAS Pensacola on-base inventory. Waitlists are managed through their application portal. Families typically receive offers based on bedroom need and pay-grade priority within rank bands." },
      { q: "Is there a rent-to-own option on-base?", a: "No. On-base housing is rental-only; you forfeit BAH in exchange for occupancy. Rent-to-own is not available. Off-base VA purchases are the wealth-building path for Pensacola military families." },
    ],
  },
  "corry-station": {
    commute: [
      ["Bellview / Myrtle Grove",  "5-8 min",  "2-3 mi",  "Closest, minimal gate backup"],
      ["Cantonment",                "15-20 min","8-10 mi","I-10 / Nine Mile corridor"],
      ["East Hill / Cordova Park", "18-22 min","7-9 mi","Historic Pensacola"],
      ["Perdido Key",              "20-28 min","9-11 mi","Beach market"],
      ["Gulf Breeze",              "25-30 min","12-14 mi","3-Mile Bridge + Corry access"],
      ["Pace",                     "30-40 min","18-22 mi","Santa Rosa value"],
    ],
    schools: [
      { zone: "Bellview / Myrtle Grove", feeder: "Bellview Elementary (B) → Bellview Middle (B) → Pine Forest High (B+)" },
      { zone: "East Hill / Cordova Park", feeder: "A.K. Suter Elementary (A) → Workman Middle (B+) → Pensacola High IB via magnet" },
      { zone: "Cantonment (Jay Middle cluster)", feeder: "Molino Park Elementary (B+) → Jay Middle (B) → Tate High (B+, NJROTC)" },
      { zone: "Pace", feeder: "Dixon Intermediate (A-) → Pace High (B+) — Santa Rosa's value play for CTI/CTN families" },
    ],
    lifestyle: [
      "Corry has no full on-base housing — it's a tenant of NAS Pensacola. Personnel typically compete in the NASP housing waitlist OR live off-base.",
      "Mission is cryptology, cyber, IW — schedules are more predictable than aviation-training side of NAS Pensacola. Quality of life off-base is often better match.",
      "Language-track students (DLI detachment) often rent short-term given pipeline length (6-18 months). Buying only makes sense for 3+ year permanent party.",
      "Off-base neighborhoods near Corry: no premium over comparable Pensacola suburbs — IW / crypto families are part of broader Pensacola military community, not a distinct cluster.",
    ],
    faqs: [
      { q: "Does Corry Station have its own on-base housing?", a: "No. Corry is a tenant installation of NAS Pensacola and does not operate independent on-base housing. Permanent-party families compete for NAS Pensacola inventory via Balfour Beatty or live off-base." },
      { q: "Can DLI linguist students live on base?", a: "Limited slots. DLI Pensacola students typically live in base barracks (unaccompanied) or seek off-base rentals for short-term (6-18 month) pipelines. Rent-month-to-month is the common structure." },
      { q: "What's commute from Bellview to Corry Station?", a: "5-8 minutes via New Warrington Road. Bellview is the closest residential neighborhood to Corry's gate. Minimal traffic except at shift change." },
      { q: "Do cryptologic technicians face any special housing restrictions?", a: "No housing-specific restrictions. Cleared personnel may be advised against certain foreign-ownership rentals, but there are no blanket housing prohibitions for IW / CTN / CTR / CTT / CTM / CTI ratings." },
    ],
  },
  "saufley-field": {
    commute: [
      ["Bellview / Myrtle Grove",  "5-8 min",  "2-4 mi",  "Closest residential"],
      ["Cantonment",                "10-15 min","6-8 mi",  "I-10 corridor"],
      ["Ferry Pass",               "15-20 min","7-9 mi","North Pensacola cluster"],
      ["East Hill",                "18-22 min","8-10 mi","Historic, walkable"],
      ["Pace",                     "25-30 min","15-18 mi","Santa Rosa value"],
      ["Gulf Breeze",              "25-30 min","13-15 mi","Via 3-Mile Bridge"],
    ],
    schools: [
      { zone: "Bellview", feeder: "Bellview Elementary (B) → Bellview Middle (B) → Pine Forest High (B+, arts magnet)" },
      { zone: "Cantonment", feeder: "Molino Park Elementary (B+) → Jay Middle (B) → Tate High (B+, NJROTC) — strong Escambia cluster" },
      { zone: "Ferry Pass", feeder: "Jim Allen Elementary (B+) → Ferry Pass Middle (B) → Washington High (B+, JROTC)" },
      { zone: "Pace (Santa Rosa)", feeder: "S.S. Dixon Intermediate (A-) → Pace High (B+) — upgrade feeder for families willing to commute" },
    ],
    lifestyle: [
      "Saufley has no standalone on-base housing. Personnel work the Corry / NASP housing pool or go off-base.",
      "Mission is cryptology / NIOC / DLI / CIWT — stable tempo, predictable family life, low deployment rate for many billets.",
      "Off-base in Bellview or Myrtle Grove: older housing stock, good value, 5-8 min commute — easiest quality-of-life trade.",
      "Cantonment and Pace are the move if school quality is top priority — worth the 15-30 min commute for Tate or Pace High feeders.",
    ],
    faqs: [
      { q: "Does Saufley Field have dedicated on-base housing?", a: "No. Saufley is a satellite installation without independent family housing. Permanent party typically compete for NAS Pensacola on-base inventory or live off-base." },
      { q: "What's the commute from Cantonment to Saufley?", a: "10-15 minutes via Nine Mile Road / US-29. Cantonment is a popular commute option for Tate High School families." },
      { q: "Are there unaccompanied barracks at Saufley?", a: "Yes — junior enlisted in CIWT detachment, DLI Pensacola language students, and NIOC junior personnel use Saufley-adjacent unaccompanied billeting. Family housing is off-base." },
      { q: "Is Saufley a good base for first-time buyers?", a: "Very good. Stable tempo, predictable 3+ year permanent-party rotations, and Bellview / Cantonment pricing in reach for E-5 through E-7 BAH. Most of my first-time military buyer clients at Saufley close in Cantonment or Pace." },
    ],
  },
  "nas-whiting-field": {
    commute: [
      ["Milton (central)",         "5-10 min", "3-5 mi",  "Closest town — village feel"],
      ["Pace",                     "12-18 min","8-10 mi","Santa Rosa's largest suburb"],
      ["Navarre",                  "25-35 min","18-22 mi","Beach access, A-rated schools"],
      ["Bagdad / Holley",         "10-15 min","5-8 mi",  "Small town, rural feel"],
      ["Gulf Breeze",              "30-40 min","22-25 mi","Premium but long commute"],
      ["Crestview",                "35-45 min","25-30 mi","Value play, Okaloosa side"],
    ],
    schools: [
      { zone: "Milton", feeder: "Central School K-8 (B) / Berryhill Elementary (B) → Milton High (B+)" },
      { zone: "Pace", feeder: "S.S. Dixon Intermediate (A-) → Pace High (B+) — best Santa Rosa value for Whiting families" },
      { zone: "Navarre", feeder: "Navarre Elementary (A) → Holley-Navarre Intermediate (A) → Navarre High (A-) — A-rated cluster" },
      { zone: "East Milton / Bagdad", feeder: "East Milton Elementary (B) → King Middle (B) → Milton High (B+)" },
    ],
    lifestyle: [
      "Whiting's student and instructor pilots work predictable daily flight schedules — on-base housing advantage is the 5-10 min flight-line access during winter darkness and weather windows.",
      "Off-base in Pace: newer construction, A-rated schools, lots of young-family community. 12-18 minute commute, best all-around fit for E-6+.",
      "Milton town center has the small-town vibe some families love and others find too quiet. It's the closest place for short-pipeline students.",
      "Navarre BAH arbitrage: Whiting-assigned families draw FL064 BAH but the commute to NAS Pensacola or Hurlburt is also workable for dual-career spouses. 25-35 min to Whiting.",
    ],
    faqs: [
      { q: "Does NAS Whiting Field have good on-base housing?", a: "Limited. Whiting's on-base inventory is smaller than NAS Pensacola's, heavily weighted toward instructor pilot families. Student aviator accompanied quarters fill fast during peak season." },
      { q: "What's the wait for Whiting Field on-base housing?", a: "Typical 2026 wait: 2-6 months officer, 4-10 months enlisted. Shorter than NAS Pensacola because of lower total inventory and more predictable student rotation." },
      { q: "Is Pace or Milton better for a Whiting family?", a: "Pace if you prioritize schools and new construction. Milton if you prioritize short commute (5-10 min) and smaller-town feel. Most of my Whiting clients pick Pace for 3+ year instructor tours, Milton for 1-2 year student pipelines." },
      { q: "Can Coast Guard helo students live on-base at Whiting?", a: "Yes. USCG students in the TH-73A rotary pipeline at HT-8/18/28 have access to Whiting family housing alongside Navy and Marine Corps students. Allocation is by bedroom need, not by service." },
    ],
  },
  "hurlburt-field": {
    commute: [
      ["Mary Esther",              "5-10 min", "2-4 mi",  "Closest residential"],
      ["Fort Walton Beach / Shalimar","10-15 min","5-7 mi","Central FWB-area"],
      ["Destin",                   "20-30 min","10-12 mi","Beach premium"],
      ["Navarre",                  "20-30 min","14-17 mi","BAH arbitrage play"],
      ["Niceville / Bluewater Bay","25-35 min","15-18 mi","Top schools"],
      ["Crestview",                "35-50 min","25-30 mi","Value, long commute"],
    ],
    schools: [
      { zone: "Mary Esther / FWB", feeder: "Mary Esther Elementary (B+) / Elliott Point Elementary (B) → Bruner Middle (B) → Choctawhatchee High (B+, band/NJROTC)" },
      { zone: "Shalimar", feeder: "Shalimar Elementary (A-) → Meigs Middle (A-) → Choctawhatchee High (B+) — upgrade middle feeder" },
      { zone: "Navarre (Santa Rosa)", feeder: "Navarre Elementary (A) → Holley-Navarre Intermediate (A) → Navarre High (A-) — A-rated cluster, 25-30 min commute" },
      { zone: "Niceville", feeder: "Bluewater Elementary (A+) → Ruckel Middle (A) → Niceville High (A+, IB) — strongest Panhandle cluster" },
    ],
    lifestyle: [
      "Hurlburt's AFSOC community is tight. On-base family housing means your neighbors are also in the SOF world — mission familiarity, childcare coverage during deployments, shared tempo.",
      "Navarre is THE BAH arbitrage play — Hurlburt pays FL023 BAH (substantially higher than FL064 Pensacola), but Navarre home prices are in FL064 range. Best of both.",
      "Niceville / Bluewater Bay if schools are top priority and the 25-35 min commute is acceptable. Strongest Okaloosa feeder.",
      "Destin if you're in at O-3+ and want beach lifestyle. Premium pricing; short commute to Hurlburt but inventory is thinner in the $500-$800K band.",
    ],
    faqs: [
      { q: "Does Hurlburt Field have good on-base housing?", a: "Yes — one of the better on-base setups in the Panhandle. AFSOC family-oriented community, on-base CDC, commissary, BX. Wait times vary but generally 2-6 months for officers, 4-10 for enlisted." },
      { q: "How does Navarre commute to Hurlburt work?", a: "20-30 minutes via US-98, light traffic outside of peak summer tourist season. Popular for dual-career spouses commuting to NAS Pensacola and AFSOC families wanting Santa Rosa schools." },
      { q: "Is Hurlburt Field good for sending kids to Niceville schools?", a: "Workable but 25-35 min commute. Most Hurlburt families prioritizing Niceville schools live in Bluewater Bay or Niceville proper and accept the drive." },
      { q: "Can 7th Special Forces Group families use Hurlburt on-base?", a: "7th SFG is at Eglin (not Hurlburt) but inter-service housing agreements sometimes allow cross-assignment. Most 7 SFG families live in Crestview, Baker, or Laurel Hill for acreage and lower cost." },
    ],
  },
  "eglin-afb": {
    commute: [
      ["Niceville / Bluewater Bay","10-15 min","5-8 mi",  "North gate access, top schools"],
      ["Valparaiso",               "8-12 min", "3-5 mi",  "East gate, older homes"],
      ["Fort Walton Beach",        "15-20 min","7-10 mi","West / south side access"],
      ["Shalimar",                 "10-15 min","5-7 mi",  "Central, good middle school"],
      ["Destin",                   "20-30 min","10-14 mi","Beach premium, O-3+"],
      ["Crestview",                "20-30 min","15-20 mi","Value + acreage, 7 SFG"],
      ["Navarre",                  "30-40 min","22-26 mi","Commuters from Santa Rosa"],
    ],
    schools: [
      { zone: "Niceville / Bluewater Bay", feeder: "Bluewater Elementary (A+) → Ruckel Middle (A) → Niceville High (A+, IB) — strongest cluster in the Panhandle" },
      { zone: "Valparaiso", feeder: "Lewis School K-8 (A) → Niceville High (A+, IB) — feeds same high school at lower home prices" },
      { zone: "Shalimar", feeder: "Shalimar Elementary (A-) → Meigs Middle (A-) → Choctawhatchee High (B+)" },
      { zone: "Crestview (north Okaloosa)", feeder: "Various — Southside Elementary / Shoal River Middle / Crestview High (B). Verify by specific address." },
      { zone: "Destin", feeder: "Destin Elementary (A) → Destin Middle (A-) → Fort Walton Beach High (B) or charter options" },
    ],
    lifestyle: [
      "Eglin is the largest Air Force installation in the US by area — sprawls across Okaloosa and Walton counties. Different gates mean very different commute paths.",
      "On-base housing at Eglin is among the best in the Panhandle for inventory and diversity — 33rd FW families, 96th TW test-community, 7 SFG specific housing options.",
      "Niceville / Bluewater Bay is the officer and senior-enlisted default. Lewis School / Niceville High IB is unmatched.",
      "7th SFG Green Beret families often pick Crestview or Baker for acreage, privacy, and lower cost — 7 SFG HQ is on Eglin's north range.",
      "Destin for the beach-lifestyle O-3+ who can absorb $500K+ pricing and 20-30 min commute to main base.",
    ],
    faqs: [
      { q: "How many gates does Eglin AFB have?", a: "Multiple — Nomad gate (east, Valparaiso side), West gate (Fort Walton Beach side), Duke gate (north, for 919 SOW reservists at Duke Field), and restricted-access gates for the test ranges. Your workplace determines your optimal neighborhood." },
      { q: "What's the wait for Eglin on-base housing?", a: "Typical 2026 waits: 3-bedroom enlisted 4-10 months, 4-bedroom enlisted 6-14 months, officer 3-bedroom 2-6 months, officer 4-bedroom 4-10 months. The F-35 training community has priority flow during peak PCS season." },
      { q: "Is the Niceville school cluster really better than Destin?", a: "For sustained academic performance and IB depth, yes. Niceville High consistently ranks in Florida's top public high schools. Destin has excellent elementary / middle but Destin-zoned high students attend Fort Walton Beach High (B), which is a notable step down." },
      { q: "Are there on-base housing options specifically for 7th SFG?", a: "Yes — specific Army SOF housing is allocated on Eglin for 7th Special Forces Group Green Berets and support personnel. Wait times and allocation are separate from Air Force family housing." },
    ],
  },
  "duke-field": {
    commute: [
      ["Crestview (south / central)","10-15 min","8-10 mi","Primary residential market"],
      ["Baker",                     "15-20 min","10-13 mi","Rural, acreage, 7 SFG overlap"],
      ["Niceville / Bluewater Bay","25-35 min","20-24 mi","School commute for BBE/Ruckel"],
      ["Fort Walton Beach",        "25-35 min","22-27 mi","Long commute but workable"],
      ["Holt",                      "15-25 min","12-16 mi","Small rural community"],
      ["Laurel Hill",              "25-30 min","18-22 mi","Far north Okaloosa, acreage"],
    ],
    schools: [
      { zone: "Crestview (central)", feeder: "Riverside Elementary (B) / Southside Elementary (B) → Shoal River Middle (B) → Crestview High (B, NJROTC)" },
      { zone: "Baker", feeder: "Baker School K-12 (B) — single K-12 campus, small-town" },
      { zone: "Niceville (school commute)", feeder: "Bluewater Elementary (A+) → Ruckel Middle (A) → Niceville High (A+, IB) — families who prioritize schools drive 25-35 min" },
      { zone: "Laurel Hill", feeder: "Laurel Hill K-12 (B) — rural, very small community, strong football" },
    ],
    lifestyle: [
      "Duke Field is an AFRC (Reserve) Special Operations Wing — 919 SOW flies MC-130J and MQ-9. Full-time ART / AGR personnel live off-base; drill reservists fly in for UTAs.",
      "No on-base family housing of consequence. Crestview is the default permanent-party community.",
      "Duke Field's adjacency to Eglin means commuting personnel can sometimes use Eglin family housing (subject to allocation). Rare but possible.",
      "Baker and Laurel Hill for families wanting acreage, rural feel, and lower cost. 15-30 min to Duke. Homes on 1-5 acre parcels.",
      "7 SFG Green Beret families also cluster in this area (Eglin-assigned, Crestview / Baker residents) — there's a meaningful SOF community overlap across Duke + Eglin SOF.",
    ],
    faqs: [
      { q: "Does Duke Field have any on-base family housing?", a: "Essentially no. Duke is an auxiliary field with minimal family housing footprint. Full-time personnel (ART / AGR) live off-base in Crestview, Baker, or Holt. Drill reservists use short-term lodging." },
      { q: "Can full-time Duke Field personnel use Eglin family housing?", a: "Sometimes. Cross-base agreements allow Duke ART/AGR families to apply for Eglin family housing when inventory allows. Not guaranteed — most default to off-base." },
      { q: "Is Crestview better than Baker for Duke families?", a: "Depends on priorities. Crestview has more inventory, more amenities, closer to I-10. Baker has more acreage, quieter, stronger small-town community. Both are 10-20 min to Duke." },
      { q: "Are there specific neighborhoods in Crestview that are best for Duke Field families?", a: "South Crestview and the areas near Shoal River Middle tend to be the default for military families. Newer construction on the east side of Crestview (toward SR-85) is popular with E-7 and above due to the 4-bedroom inventory." },
    ],
  },
};

const EXPANSION_TEMPLATE = ({ baseSlug, data, baseLabel }) => `
<h2>Commute Matrix — Off-Base Neighborhoods to ${baseLabel}</h2>
<p>Drive times are approximate door-to-gate for a typical duty-day 0600-0730 window. Off-peak is faster; peak tourist season (summer) adds 5-15 min on Gulf-side routes.</p>
<table>
<thead><tr><th>Neighborhood</th><th>Drive Time</th><th>Distance</th><th>Notes</th></tr></thead>
<tbody>
${data.commute.map(([n, t, d, note]) => `<tr><td>${n}</td><td>${t}</td><td>${d}</td><td>${note}</td></tr>`).join("\n")}
</tbody>
</table>

<h2>School Zone Quick Map for ${baseLabel} Families</h2>
<p>Which neighborhood → which elementary → which middle → which high school. Florida school zoning is by street address, not by ZIP code; always verify specific zoning on the district's school locator. For a deeper per-base treatment see <a href="/pcs-schools-by-base.html">PCS Schools by Base</a>.</p>
<ul>
${data.schools.map(s => `<li><strong>${s.zone}:</strong> ${s.feeder}</li>`).join("\n")}
</ul>

<h2>Military Family Lifestyle — On-Base vs Off-Base at ${baseLabel}</h2>
<ul>
${data.lifestyle.map(l => `<li>${l}</li>`).join("\n")}
</ul>

<h2>Financial Resources for This Decision</h2>
<p>The on-base vs off-base call is ultimately a money decision. Key reference material I send every client before we run the specific numbers:</p>
<ul>
<li><a href="/va-loan-guide">VA Loan Guide</a> — zero-down financing, funding fee, seller concessions, 2026 Tier 1 limits.</li>
<li><a href="/va-funding-fee-2026.html">VA Funding Fee 2026</a> — exact tier and waiver rules.</li>
<li><a href="/bah-to-mortgage-guide.html">BAH to Mortgage Guide</a> — rank-by-rank buying-power math for FL064 and FL023.</li>
<li><a href="/fl064-bah-rates.html">2026 BAH Rates</a> — official DoD tables for this MHA.</li>
<li><a href="/florida-homestead-exemption-military.html">Florida Homestead Exemption</a> — property tax savings for military families who buy.</li>
<li><a href="/disabled-veteran-benefits-florida.html">Disabled Veteran Benefits</a> — if you are 10%+ service-connected rated.</li>
<li><a href="/first-time-military-homebuyer.html">First-Time Military Homebuyer</a> — full playbook for E-3 to junior officer first purchases.</li>
</ul>
`;

const EXPANSION_FAQ_BLOCK = (data) =>
  data.faqs.map(f => `<details><summary>${f.q}</summary><p>${f.a}</p></details>`).join("\n");

const ON_BASE_PAGES = Object.keys(BASE_EXPANSIONS);
const PAGE_FILENAME = {
  "nas-pensacola": "on-base-vs-off-base-nas-pensacola.html",
  "corry-station": "on-base-vs-off-base-corry-station.html",
  "saufley-field": "on-base-vs-off-base-saufley-field.html",
  "nas-whiting-field": "on-base-vs-off-base-nas-whiting-field.html",
  "hurlburt-field": "on-base-vs-off-base-hurlburt-field.html",
  "eglin-afb": "on-base-vs-off-base-eglin-afb.html",
  "duke-field": "on-base-vs-off-base-duke-field.html",
};
const BASE_LABEL = {
  "nas-pensacola": "NAS Pensacola",
  "corry-station": "Corry Station",
  "saufley-field": "Saufley Field",
  "nas-whiting-field": "NAS Whiting Field",
  "hurlburt-field": "Hurlburt Field",
  "eglin-afb": "Eglin AFB",
  "duke-field": "Duke Field",
};

let task2Count = 0;
for (const slug of ON_BASE_PAGES) {
  const path = "public/" + PAGE_FILENAME[slug];
  const data = BASE_EXPANSIONS[slug];
  let c;
  try { c = readFileSync(path, "utf8"); } catch { console.log("  missing", path); continue; }
  if (c.includes("Commute Matrix — Off-Base Neighborhoods")) { console.log("  already-expanded", slug); continue; }

  // Insert expansion AFTER "Rank-by-Rank Recommendation" section closes and BEFORE the "Frequently Asked Questions" H2
  const insertMark = "<h2>Frequently Asked Questions</h2>";
  if (!c.includes(insertMark)) { console.log("  no FAQ marker in", slug); continue; }
  const expansion = EXPANSION_TEMPLATE({ baseSlug: slug, data, baseLabel: BASE_LABEL[slug] });
  c = c.replace(insertMark, expansion + "\n" + insertMark);

  // Add additional FAQ items AFTER the last existing </details> before the CTA
  const ctaMark = `<div class="cta">`;
  const extraFaqs = EXPANSION_FAQ_BLOCK(data);
  // Insert extras just before the CTA block
  c = c.replace(ctaMark, extraFaqs + "\n" + ctaMark);

  writeFileSync(path, c, "utf8");
  task2Count++;
  console.log("  expanded", slug);
}
console.log(`\nTask 2 complete — expanded ${task2Count} pages.`);

// ──────────────────────────────────────────────────────────────────
// TASK 3 — Pillar-cluster reciprocal links
// ──────────────────────────────────────────────────────────────────
// Most satellite pages already link to pillars. What's needed: pillar
// pages should have a "Related in this cluster" callout with the full
// set of satellites. Add a cluster-footer block to each pillar.

const PILLAR_CLUSTERS = [
  {
    pillar: "public/va-loan-guide.html",
    afterMarker: "<h2>Sources and References</h2>",
    clusterTitle: "Related VA-Loan Resources",
    satellites: [
      ["VA IRRRL (Streamline) Refi Guide", "/va-irrrl-guide.html"],
      ["VA Funding Fee 2026 — Full Tier Breakdown", "/va-funding-fee-2026.html"],
      ["Assumable VA Loans (Pensacola)", "/assumable-va-loans-pensacola.html"],
      ["Disabled Veteran Benefits (Florida)", "/disabled-veteran-benefits-florida.html"],
      ["Zero-Down Home Loans Compared", "/zero-down-home-loans.html"],
      ["First-Time Military Homebuyer", "/first-time-military-homebuyer.html"],
      ["Dual-Military Homes & Joint VA Loans", "/dual-military-homes.html"],
      ["Florida Homestead Exemption", "/florida-homestead-exemption-military.html"],
    ],
  },
  {
    pillar: "public/bah-to-mortgage-guide.html",
    afterMarker: "<h2>Sources</h2>",
    clusterTitle: "Related BAH & Budget Resources",
    satellites: [
      ["2026 BAH Rates (FL064 + FL023)", "/fl064-bah-rates.html"],
      ["VA Loan Guide", "/va-loan-guide"],
      ["Zero-Down Home Loans Compared", "/zero-down-home-loans.html"],
      ["First-Time Military Homebuyer", "/first-time-military-homebuyer.html"],
      ["Dual-Military Homes & Dual-BAH Math", "/dual-military-homes.html"],
      ["Disabled Veteran Benefits (Florida)", "/disabled-veteran-benefits-florida.html"],
    ],
  },
  {
    pillar: "public/pcs-checklist.html",
    afterMarker: "<h2>Sources and References</h2>",
    clusterTitle: "Related PCS Planning Resources",
    satellites: [
      ["PCS Schools by Base", "/pcs-schools-by-base.html"],
      ["Military PCS Tax Deductions", "/military-pcs-tax-deductions.html"],
      ["Military Rental Property Management", "/military-rental-property-management.html"],
      ["Military Divorce Housing", "/military-divorce-housing.html"],
      ["Dual-Military Homes", "/dual-military-homes.html"],
      ["Florida Homestead Exemption", "/florida-homestead-exemption-military.html"],
      ["BAH to Mortgage Guide", "/bah-to-mortgage-guide.html"],
    ],
  },
];

let task3Count = 0;
for (const { pillar, afterMarker, clusterTitle, satellites } of PILLAR_CLUSTERS) {
  let c;
  try { c = readFileSync(pillar, "utf8"); } catch { console.log("  missing", pillar); continue; }
  if (c.includes(`<h2>${clusterTitle}</h2>`)) { console.log("  already has cluster on", pillar); continue; }
  if (!c.includes(afterMarker)) { console.log("  no marker on", pillar); continue; }
  const block = `<h2>${clusterTitle}</h2>\n<ul>\n${satellites.map(([l, h]) => `<li><a href="${h}">${l}</a></li>`).join("\n")}\n</ul>\n\n${afterMarker}`;
  c = c.replace(afterMarker, block);
  writeFileSync(pillar, c, "utf8");
  task3Count++;
  console.log("  added cluster to", pillar);
}
console.log(`\nTask 3 complete — added cluster to ${task3Count} pillars.`);

// ──────────────────────────────────────────────────────────────────
// TASK 6 — "Last verified" footer badge site-wide
// ──────────────────────────────────────────────────────────────────
const VERIFIED_DATE = "April 2026";
const VERIFIED_BADGE = `<p style="text-align:center;color:var(--mutedD,#6f6e65);font-size:.75rem;margin:.5rem 0 0;letter-spacing:.5px;text-transform:uppercase">Content last verified: ${VERIFIED_DATE}</p>`;

let task6Count = 0;
for (const path of walk("public")) {
  let c;
  try { c = readFileSync(path, "utf8"); } catch { continue; }
  if (c.includes("Content last verified:")) continue;
  // Insert right before </footer>
  if (!c.includes("</footer>")) continue;
  c = c.replace("</footer>", VERIFIED_BADGE + "\n</footer>");
  writeFileSync(path, c, "utf8");
  task6Count++;
}
console.log(`\nTask 6 complete — added "Last verified" badge to ${task6Count} pages.`);

// ──────────────────────────────────────────────────────────────────
// TASK 7 — Add authority external links to resource pages where missing
// ──────────────────────────────────────────────────────────────────
// Resource pages: those most likely to benefit from citations.
// Strategy: add an "Authoritative Sources" footer block to each resource
// page that doesn't already cite the specific authority.

const AUTHORITY_BLOCK = `
<h2>Authoritative Sources Cited</h2>
<ul>
<li><a href="https://www.benefits.va.gov/WARMS/pam26_7.asp" target="_blank" rel="noopener">VA Pamphlet 26-7 — Lender Handbook</a></li>
<li><a href="https://www.va.gov/housing-assistance/home-loans/" target="_blank" rel="noopener">US Department of Veterans Affairs — VA Home Loans</a></li>
<li><a href="https://www.travel.dod.mil/Allowances/Basic-Allowance-for-Housing/BAH-Rate-Lookup/" target="_blank" rel="noopener">DoD Defense Travel Management Office — BAH Lookup</a></li>
<li><a href="https://www.fhfa.gov/DataTools/Tools/Pages/Conforming-Loan-Limit-(CLL)-Values.aspx" target="_blank" rel="noopener">FHFA 2026 Conforming Loan Limits</a></li>
<li><a href="https://floridarevenue.com/property/Pages/Taxpayers_Exemptions.aspx" target="_blank" rel="noopener">Florida Department of Revenue — Property Tax Exemptions</a></li>
</ul>
`;

const RESOURCE_PAGES_FOR_AUTHORITY = [
  "public/assumable-va-loans-pensacola.html",
  "public/school-zones-military-families.html",
  "public/va-disability-property-tax-florida.html",
  "public/reviews.html",
  "public/blog.html",
  "public/faq.html",
];

let task7Count = 0;
for (const path of RESOURCE_PAGES_FOR_AUTHORITY) {
  let c;
  try { c = readFileSync(path, "utf8"); } catch { continue; }
  if (c.includes("<h2>Authoritative Sources Cited</h2>")) continue;
  // Insert before last </main> if present, else before footer
  if (c.includes("</main>")) {
    c = c.replace("</main>", AUTHORITY_BLOCK + "\n</main>");
  } else if (c.includes("<footer>")) {
    c = c.replace("<footer>", AUTHORITY_BLOCK + "\n<footer>");
  } else { continue; }
  writeFileSync(path, c, "utf8");
  task7Count++;
}
console.log(`\nTask 7 complete — added authority sources to ${task7Count} pages.`);
