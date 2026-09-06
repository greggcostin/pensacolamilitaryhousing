// Schools section generator for greggcostin.com — builds /schools (hub) and
// /schools/<slug> (one page per school) from the official FLDOE dataset in
// content/schools/school-grades-2026.json. Data-driven by design: every grade
// shown is the school's official Florida DOE accountability grade with source
// and year. The shared page builder adds sourced school guides and transparent
// comparisons; it never turns neighborhood or demographic data into school rankings.
// Usage: node scripts/schools-factory.mjs
import { readFileSync, mkdirSync } from "node:fs";
import { SITE_DIR, SITE, esc, buildPage, breadcrumbs, webPage, makeOgCard, gate } from "./civilian-page-lib.mjs";
import { fileURLToPath } from "node:url";
import { schoolDescription } from "./school-description.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url)).replace(/\\/g, "/");
const DATA = JSON.parse(readFileSync(ROOT + "content/schools/school-grades-2026.json", "utf8"));
const TODAY = "2026-08-24";
mkdirSync(`${SITE_DIR}/schools`, { recursive: true });

const TYPE_LABEL = { "01": "Elementary", "02": "Middle", "03": "High", "04": "Combination / K-8" };
const DISTRICT = { "17": "Escambia County", "57": "Santa Rosa County" };
const DISTRICT_SITE = { "17": "https://www.escambiaschools.org", "57": "https://www.santarosaschools.org" };
const GRADE_COLOR = { A: "#3d9a50", B: "#7CB342", C: "#e0a12b", D: "#EF6C00", F: "#C62828", I: "#8f8e83", "": "#8f8e83" };

const titleCase = (s) => s.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase()).replace(/\bK-8\b/i, "K-8").replace(/\bInc\b\.?/i, "Inc.").replace(/\bIi\b/g, "II");
const slugOf = (s) => s.name.toLowerCase().replace(/[.,']/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").replace(/-inc$/, "");

function badge(grade, size = 44) {
  const g = String(grade || "").trim().toUpperCase() || "–";
  const c = GRADE_COLOR[g] || "#8f8e83";
  return `<span style="display:inline-flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;border-radius:10px;background:${c};color:#fff;font-weight:800;font-size:${Math.round(size * 0.5)}px;font-family:var(--sans)" aria-label="Florida DOE grade ${esc(g)}">${esc(g)}</span>`;
}
function bar(label, val) {
  if (val === null || val === undefined || val === "") return "";
  const v = Math.max(0, Math.min(100, Number(val)));
  return `<div style="margin:8px 0"><div style="display:flex;justify-content:space-between;font-size:13px;color:var(--muted)"><span>${esc(label)}</span><span style="color:var(--text);font-weight:600">${v}%</span></div><div style="background:var(--elev);border-radius:99px;height:8px;overflow:hidden"><div style="width:${v}%;height:8px;background:var(--gold);border-radius:99px"></div></div></div>`;
}

const DISCLAIMER = `<p style="max-width:760px;margin:1.5rem auto;color:var(--mutedD);font-size:13px;line-height:1.6;border-left:2px solid var(--gold-line);padding-left:14px">The Costin Team does not rate, rank, or recommend schools. Grades shown are the official accountability grades published by the Florida Department of Education, provided as public information. The right school is a personal decision: visit campuses, meet teachers, and confirm current attendance zones directly with the district before making housing decisions based on schools.</p>`;

const FRAMEWORK = `
<h2>What should actually matter to parents</h2>
<p>A letter grade is one data point, not a verdict. When families ask us how to evaluate a school, we point them to the same checklist every time:</p>
<ul>
<li><strong>Visit in person.</strong> Ten minutes in the front office and hallways tells you more about culture than any statistic.</li>
<li><strong>Match the school to YOUR child.</strong> A school that is right for a self-directed kid may be wrong for one who needs structure, and the reverse. Programs (arts, STEM, athletics, IB/AP, ESE services) matter more than a one-letter summary.</li>
<li><strong>Look at the trend, not one year.</strong> A school moving from C to B to A is a different story than one drifting the other way. We show three years on every school page for exactly this reason.</li>
<li><strong>Read the components.</strong> Two schools with the same letter can have very different achievement profiles. The subject-area percentages show where a school is strong.</li>
<li><strong>Confirm zoning before you buy.</strong> Attendance zones change. Verify the address you are considering with the district's current zoning tools, not a listing's claim.</li>
<li><strong>Context matters.</strong> Research consistently shows family engagement outweighs most school-level differences. The percentages here measure the school; they do not predict your child.</li>
</ul>`;

/* ---------- per-school pages ---------- */
// The shared dataset also covers Okaloosa for military guides. This civilian section
// currently publishes the two districts defined above; do not emit "undefined" counties.
const schools = DATA.schools.filter((s) => DISTRICT[s.district]).map((s) => ({ ...s, display: titleCase(s.name), slug: slugOf(s) }));
let built = 0;
for (const s of schools) {
  const level = TYPE_LABEL[s.type] || "School";
  const county = DISTRICT[s.district];
  const title = (`${s.display} | FL DOE Grade`.length <= 65 ? `${s.display} | FL DOE Grade` : `${s.display}`).slice(0, 65);
  const desc = schoolDescription(s, county);
  const componentBars = [
    bar("English Language Arts achievement", s.ela),
    bar("Mathematics achievement", s.math),
    bar("Science achievement", s.sci),
    bar("Social Studies achievement", s.socst),
    bar("Graduation rate (2024-25)", s.gradRate),
    bar("College & career acceleration", s.collegeCareer),
  ].filter(Boolean).join("\n");

  const main = `
<div style="max-width:760px;margin:0 auto;display:flex;gap:18px;align-items:center;flex-wrap:wrap">
<div style="display:flex;gap:10px;align-items:center">${badge(s.g2026, 72)}<div><div style="color:var(--muted);font-size:12px;letter-spacing:1.5px;text-transform:uppercase">2025-26 Florida DOE Grade</div><div style="color:#fff;font-family:var(--serif);font-size:22px">${esc(s.display)}</div></div></div>
</div>

<div style="max-width:760px;margin:1.5rem auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px">
<div style="background:var(--panel);border:1px solid var(--hair);border-radius:10px;padding:16px"><div style="color:var(--muted);font-size:12px;text-transform:uppercase;letter-spacing:1px">Level</div><div style="color:#fff;font-size:16px;margin-top:4px">${esc(level)}</div></div>
<div style="background:var(--panel);border:1px solid var(--hair);border-radius:10px;padding:16px"><div style="color:var(--muted);font-size:12px;text-transform:uppercase;letter-spacing:1px">District</div><div style="color:#fff;font-size:16px;margin-top:4px">${esc(county)}</div></div>
<div style="background:var(--panel);border:1px solid var(--hair);border-radius:10px;padding:16px"><div style="color:var(--muted);font-size:12px;text-transform:uppercase;letter-spacing:1px">Type</div><div style="color:#fff;font-size:16px;margin-top:4px">${s.charter === "YES" ? "Public charter" : "District public"}</div></div>
<div style="background:var(--panel);border:1px solid var(--hair);border-radius:10px;padding:16px"><div style="color:var(--muted);font-size:12px;text-transform:uppercase;letter-spacing:1px">Title I</div><div style="color:#fff;font-size:16px;margin-top:4px">${s.titleI === "YES" ? "Yes" : "No"}</div></div>
</div>

<h2>Grade history</h2>
<div style="max-width:760px;margin:1rem auto;display:flex;gap:22px;flex-wrap:wrap">
<div style="text-align:center">${badge(s.g2026, 56)}<div style="color:var(--muted);font-size:12px;margin-top:6px">2025-26</div></div>
<div style="text-align:center">${badge(s.g2025, 56)}<div style="color:var(--muted);font-size:12px;margin-top:6px">2024-25</div></div>
<div style="text-align:center">${badge(s.g2024, 56)}<div style="color:var(--muted);font-size:12px;margin-top:6px">2023-24</div></div>
</div>
<p>Grades are the official school accountability grades published by the <a href="https://www.fldoe.org/accountability/accountability-reporting/school-grades/" rel="noopener" target="_blank">Florida Department of Education</a> (retrieved ${DATA.retrieved}). A grade reflects points earned across achievement, learning gains, and other state-defined components.</p>

<h2>2025-26 achievement components</h2>
<p>Percent of possible points earned overall: <strong>${s.pctPoints ?? "n/a"}%</strong>. Share of students classified economically disadvantaged: <strong>${s.econDisadv ?? "n/a"}%</strong>.</p>
<div style="max-width:760px;margin:1rem auto">
${componentBars}
</div>

${FRAMEWORK}

<h2>Verify and dig deeper</h2>
<ul>
<li><a href="${DISTRICT_SITE[s.district]}" rel="noopener" target="_blank">${esc(county)} School District</a>: enrollment, attendance zoning, school choice programs, and school contact pages.</li>
<li><a href="https://edudata.fldoe.org/" rel="noopener" target="_blank">Florida EduData portal</a>: the state's full report card for every public school (search by school name).</li>
<li><a href="/schools">All Pensacola-area school reports</a> on this site, and the <a href="/neighborhoods">neighborhood guide</a> for where each community sits.</li>
</ul>
${DISCLAIMER}

<!-- inq-cta --><div class="inq-cta">
<p class="ih">Shopping for a home near ${esc(s.display.replace(/ (Elementary|Middle|High|Senior High)( School)?.*/i, ""))}?</p>
<p class="is">Tell us the schools that matter to your family and we will build the home search around current attendance zones, verified with the district.</p>
<div class="ir">
<button type="button" class="ip" data-inquiry-open data-inquiry-type="First-Time Home Buyer">Plan My Search Around Schools &rarr;</button>
<a class="il" href="tel:+18502665005">Call or Text (850) 266-5005</a>
</div>
</div>`;

  const spec = {
    file: `schools/${s.slug}.html`, path: `/schools/${s.slug}`,
    title, desc,
    keywords: `${s.display}, ${county} schools, Florida school grades, ${level.toLowerCase()} school Pensacola area, school report`,
    ogSlug: "schools", // shared card (per-school cards would be 82 PNGs; hub card is fine)
    h1: s.display,
    lead: `${esc(level)} school in ${esc(county)}. Official Florida DOE accountability data, three-year grade history, and how to put it in context for your family.`,
    main, dateISO: TODAY,
    schemaBlocks: [
      webPage("WebPage", { title, desc, path: `/schools/${s.slug}`, dateISO: TODAY }),
      breadcrumbs([{ name: "Home", path: "/" }, { name: "Schools", path: "/schools" }, { name: s.display, path: `/schools/${s.slug}` }]),
      { "@context": "https://schema.org", "@type": "School", name: s.display, address: { "@type": "PostalAddress", addressRegion: "FL", addressCountry: "US" }, isPartOf: { "@type": "Organization", name: `${county} School District`, url: DISTRICT_SITE[s.district] } },
    ],
  };
  const html = buildPage(spec);
  const errs = gate({ title, desc, minWords: 0 }, html);
  if (errs.length) throw new Error(`${s.slug}: ` + errs.join("; "));
  built++;
}

/* ---------- hub ---------- */
function hubSection(label, list) {
  if (!list.length) return "";
  const rows = list
    .sort((a, b) => (a.district === b.district ? a.display.localeCompare(b.display) : a.district.localeCompare(b.district)))
    .map((s) => `<a href="/schools/${s.slug}" style="display:flex;align-items:center;gap:14px;background:var(--panel);border:1px solid var(--hair);border-radius:12px;padding:14px 18px;text-decoration:none">${badge(s.g2026, 40)}<span style="flex:1;min-width:0"><span style="display:block;color:#fff;font-size:15.5px;font-weight:500">${esc(s.display)}${s.charter === "YES" ? ' <span style="color:var(--gold);font-size:11px;letter-spacing:1px;text-transform:uppercase">&middot; Charter</span>' : ""}</span><span style="display:block;color:var(--muted);font-size:12.5px">${esc(DISTRICT[s.district])}</span></span><span style="color:var(--gold);font-weight:700;font-size:13px;white-space:nowrap">Report &rarr;</span></a>`)
    .join("\n");
  return `<h2 id="${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}">${esc(label)}</h2>\n<div style="max-width:760px;margin:1rem auto;display:grid;gap:10px">${rows}</div>`;
}

const elem = schools.filter((s) => s.type === "01");
const mid = schools.filter((s) => s.type === "02");
const high = schools.filter((s) => s.type === "03");
const combo = schools.filter((s) => s.type === "04");
const charters = schools.filter((s) => s.charter === "YES");
const aCount = schools.filter((s) => String(s.g2026).trim() === "A").length;

const hubMain = `
<p>Every graded public and charter school in Escambia and Santa Rosa County, with its official Florida DOE accountability grade, three-year history, and achievement data on its own report page. ${schools.length} schools, ${aCount} rated A for 2025-26, updated from the state's ${DATA.retrieved.slice(0, 4)} release.</p>

<div style="max-width:760px;margin:1rem auto;display:flex;gap:10px;flex-wrap:wrap">
<a class="btn-g" href="#elementary">Elementary (${elem.length})</a>
<a class="btn-g" href="#middle">Middle (${mid.length})</a>
<a class="btn-g" href="#high">High (${high.length})</a>
<a class="btn-g" href="#combination-k-8">K-8 & Combination (${combo.length})</a>
<a class="btn-g" href="#charter-schools">Charters (${charters.length})</a>
</div>

${DISCLAIMER}

${hubSection("Elementary", elem)}
${hubSection("Middle", mid)}
${hubSection("High", high)}
${hubSection("Combination / K-8", combo)}
${hubSection("Charter Schools", charters)}

<h2>Private, magnet, and choice programs</h2>
<p>Florida does not issue accountability grades to private schools, so they are not listed above. The state maintains an official <a href="https://www.floridaschoolchoice.org/information/privateschooldirectory/" rel="noopener" target="_blank">private school directory</a>, and Step Up For Students administers Florida's <a href="https://www.stepupforstudents.org/" rel="noopener" target="_blank">school choice scholarships</a>. Both districts also operate magnet and school-choice programs inside the public system: see <a href="https://www.escambiaschools.org" rel="noopener" target="_blank">Escambia's district site</a> and <a href="https://www.santarosaschools.org" rel="noopener" target="_blank">Santa Rosa's district site</a> for current programs and application windows.</p>

${FRAMEWORK}

<div class="mil-band">
<h3>PCSing with school-age kids?</h3>
<p>Our military division breaks down schools base-by-base for PCS families, including timing a move around enrollment windows.</p>
<a class="btn-p" href="https://pensacolamilitaryhousing.com/pcs-schools-by-base">PCS Schools by Base</a>
</div>

<!-- inq-cta --><div class="inq-cta">
<p class="ih">House-hunting around a school list?</p>
<p class="is">Send us your shortlist and price range. We will map the current attendance zones, verify them with the district, and hand-pick homes that actually qualify.</p>
<div class="ir">
<button type="button" class="ip" data-inquiry-open data-inquiry-type="First-Time Home Buyer">Build My School-First Search &rarr;</button>
<a class="il" href="tel:+18502665005">Call or Text (850) 266-5005</a>
</div>
</div>`;

const hubSpec = {
  file: "schools.html", path: "/schools",
  title: "Pensacola Area School Grades & Reports | The Costin Team",
  desc: `Official Florida DOE grades for all ${schools.length} graded public and charter schools in Escambia and Santa Rosa County, with a data report page for every school.`,
  keywords: "Pensacola school grades, Escambia County schools, Santa Rosa County schools, Florida school grades 2026, Pensacola schools by grade, Gulf Breeze schools, Pace schools, Navarre schools",
  ogSlug: "schools", h1: "Pensacola-area schools, graded",
  lead: "Every graded public and charter school in Escambia and Santa Rosa County, with official state grades, trends, and the data behind them.",
  main: hubMain, dateISO: TODAY,
  schemaBlocks: [
    webPage("CollectionPage", { title: "Pensacola Area School Grades & Reports", desc: `Official Florida DOE grades for all ${schools.length} graded public and charter schools in Escambia and Santa Rosa County.`, path: "/schools", dateISO: TODAY }),
    breadcrumbs([{ name: "Home", path: "/" }, { name: "Schools", path: "/schools" }]),
  ],
};
buildPage(hubSpec);
await makeOgCard("schools", ["Pensacola-Area", "Schools, Graded"], `${schools.length} official FL DOE school reports`);

console.log(`SCHOOLS: hub + ${built} school pages built (${elem.length}E/${mid.length}M/${high.length}H/${combo.length}K8, ${charters.length} charters)`);

/* ---------- sitemap + llms ---------- */
import { writeFileSync } from "node:fs";
{
  let sm = readFileSync(`${SITE_DIR}/sitemap.xml`, "utf8");
  const urls = [`${SITE}/schools`, ...schools.map((s) => `${SITE}/schools/${s.slug}`)];
  for (const u of urls) if (!sm.includes(`<loc>${u}</loc>`)) sm = sm.replace("</urlset>", `  <url><loc>${u}</loc><lastmod>${TODAY}</lastmod></url>\n</urlset>`);
  writeFileSync(`${SITE_DIR}/sitemap.xml`, sm);
  let llms = readFileSync(`${SITE_DIR}/llms.txt`, "utf8");
  if (!llms.includes(`${SITE}/schools`)) {
    llms = llms.replace(/(- \[Florida Home Insurance\]\([^)]*\): [^\n]*)/, `$1\n- [Schools](${SITE}/schools): official FL DOE grades and data reports for all ${schools.length} graded Escambia + Santa Rosa schools`);
    writeFileSync(`${SITE_DIR}/llms.txt`, llms);
  }
  console.log("sitemap + llms synced (+" + (schools.length + 1) + " URLs)");
}
