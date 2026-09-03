// Builds civilian-site/neighborhoods/<slug>.html for every entry in civilian-neighborhoods-data.mjs
// (audit 2026-09-02, gc-content-01), then points the neighborhoods hub cards and the homepage
// "Where we work" chips at the new pages (each page keeps a link to its military-orders twin on
// pensacolamilitaryhousing.com). Registers sitemap + llms entries and renders an OG card.
// Idempotent. Afterwards run: node scripts/apply-responsive-images.mjs && node scripts/build-entity-graph.mjs
//   node scripts/civilian-neighborhood-factory.mjs
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import sharp from "sharp";
import { buildPage, breadcrumbs, webPage, faqPage, gate, makeOgCard, figureBand, esc, SITE_DIR, SITE } from "./civilian-page-lib.mjs";
import { NEIGHBORHOODS } from "./civilian-neighborhoods-data.mjs";

const DATE_ISO = "2026-09-02";
const PMH = "https://pensacolamilitaryhousing.com";
const COUNTY = { "east-hill-downtown": "Escambia County", "pensacola-beach": "Escambia County", "perdido-key": "Escambia County", "midtown-east-pensacola-heights": "Escambia County", "cordova-park-northeast": "Escambia County", "beulah": "Escambia County", "cantonment": "Escambia County", "gulf-breeze": "Santa Rosa County", "pace-milton": "Santa Rosa County", "navarre": "Santa Rosa County", "fort-walton-beach": "Okaloosa County" };

// school grades + names from the FLDOE data, keyed by the civilian school-page slug
const schoolsJson = JSON.parse(readFileSync("content/schools/school-grades-2026.json", "utf8"));
const schoolRows = Array.isArray(schoolsJson) ? schoolsJson : (schoolsJson.schools || Object.values(schoolsJson));
const slugOf = (n) => n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const titleCase = (n) => n.toLowerCase().replace(/\b([a-z])/g, (c) => c.toUpperCase()).replace(/\bJ H\b/, "J.H.").replace(/\bA K\b/, "A.K.").replace(/\bO J\b/, "O.J.").replace(/\bS S\b/, "S.S.").replace(/\bJ M\b/, "J.M.").replace(/\bJim C\b/, "Jim C.").replace(/\bThomas L\b/, "Thomas L.");
const SCHOOLS = Object.fromEntries(schoolRows.map((s) => [slugOf(s.name), { name: titleCase(s.name), grade: s.g2026 }]));

// photo credits exactly as the hub prints them
const hub = readFileSync(`${SITE_DIR}/neighborhoods.html`, "utf8");
const credits = {};
for (const m of hub.matchAll(/class="nb-card"[\s\S]*?(?=class="nb-card"|<\/section>)/g)) {
  const img = (m[0].match(/<img[^>]*src="([^"]+)"/) || [])[1];
  const cr = (m[0].match(/class="nb-credit"[^>]*>([\s\S]*?)<\/(?:div|p|span)>/) || [])[1];
  if (img && cr) credits[img] = cr.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

const details = (faqs) => faqs.map((f, i) => `<details${i === 0 ? " open" : ""}><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("\n");

async function build(n) {
  const path = `/neighborhoods/${n.slug}`;
  const meta = await sharp(`${SITE_DIR}${n.image}`).metadata();
  const credit = credits[n.image] || "Photo: The Costin Team";
  const figure = figureBand({ src: n.image, webp: n.image.replace(/\.jpg$/, ".webp"), alt: n.alt, caption: `${n.short}. ${credit}`, width: meta.width, height: meta.height });
  const schoolItems = n.schools.filter((s) => SCHOOLS[s] && existsSync(`${SITE_DIR}/schools/${s}.html`)).map((s) => `<li><a href="/schools/${s}">${esc(SCHOOLS[s].name)}</a> <span class="grade">2026 grade: ${esc(SCHOOLS[s].grade)}</span></li>`);
  const main = `
<style>.nb-fit{color:var(--gold);font-size:14px;letter-spacing:.4px;margin:0 auto 1rem;max-width:760px}.school-list{list-style:none;padding:0;margin:0 auto 1rem;max-width:760px}.school-list li{padding:8px 0;border-bottom:1px solid var(--hair)}.school-list .grade{color:var(--muted);font-size:13px;margin-left:8px}.fine{font-size:13.5px;color:var(--muted)}</style>
<p class="nb-fit"><strong>Best fit:</strong> ${esc(n.fit)}.</p>
${figure}
${n.sections.map((s) => `<h2>${esc(s.h2)}</h2>\n${s.p.map((p) => `<p>${esc(p)}</p>`).join("\n")}`).join("\n")}

<h2>Schools</h2>
<p>${esc(n.schoolsNote)}</p>
${schoolItems.length ? `<ul class="school-list">\n${schoolItems.join("\n")}\n</ul>` : ""}
<p class="fine">School letter grades are the official 2026 Florida Department of Education grades. Zoning is set by the district and can change; confirm the assigned schools for any specific address with the county school district before you buy. See all <a href="/schools">Escambia and Santa Rosa school reports</a>.</p>

<h2>Flood and insurance</h2>
<p>${esc(n.flood)}</p>
<p>Florida homeowners insurance is priced on roof age, wind mitigation and the flood zone, so we pull both quotes during the inspection period, never after closing. Read our <a href="/resources/florida-home-insurance">Florida home insurance guide</a> for the details.</p>

<h2>Moving here on military orders?</h2>
<p>${esc(n.short)} has a second guide written for PCS families, with BAH price bands by pay grade, commute times to each gate and the VA loan specifics: <a href="${PMH}${n.pmh}">${esc(n.short)} for military families</a> on PensacolaMilitaryHousing.com, the military division of the same team.</p>

<h2>Start your search</h2>
<p>Tell us what you are looking for in ${esc(n.short)} and your timeline, and you will have a plain-language plan within one business day: current inventory, the streets that fit, what to inspect, and the insurance picture before you write an offer.</p>
<div class="btn-row"><a class="btn-p" href="https://greggcostin.realscout.com/onboarding">Search ${esc(n.short)} Listings</a><a class="btn-g" href="/contact">Send a Message</a><a class="btn-g" href="/buy">How buying with us works</a></div>

<h2>Frequently asked questions</h2>
${details(n.faqs)}
<p class="fine">Back to the <a href="/neighborhoods">Pensacola neighborhoods guide</a>.</p>
`;
  const spec = {
    file: `neighborhoods/${n.slug}.html`, path, ogSlug: `neighborhoods-${n.slug}`,
    title: n.title, desc: n.desc, keywords: n.keywords, h1: n.h1, lead: n.lead, main, dateISO: DATE_ISO, minWords: 900,
  };
  spec.schemaBlocks = [
    webPage("WebPage", spec),
    { "@context": "https://schema.org", "@type": "Place", "@id": `${SITE}${path}#place`, name: n.name, description: n.desc, url: `${SITE}${path}`, containedInPlace: { "@type": "AdministrativeArea", name: `${COUNTY[n.slug]}, Florida` }, image: `${SITE}${n.image}` },
    breadcrumbs([{ name: "Home", path: "/" }, { name: "Neighborhoods", path: "/neighborhoods" }, { name: n.short, path }]),
    faqPage(n.faqs),
  ];
  mkdirSync(`${SITE_DIR}/neighborhoods`, { recursive: true });
  const html = buildPage(spec);
  const errs = gate({ title: spec.title, desc: spec.desc, minWords: 900 }, html);
  if (errs.length) throw new Error(`${n.slug}: GATE FAIL\n  - ${errs.join("\n  - ")}`);
  await makeOgCard(spec.ogSlug, n.short.split(" & ").length > 1 ? [n.short.split(" & ")[0] + " &", n.short.split(" & ")[1]] : [n.short], `${n.fit}. The Costin Team, Pensacola.`);
  return { path, n, words: (html.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " ").match(/\S+/g) || []).length };
}

const built = [];
for (const n of NEIGHBORHOODS) built.push(await build(n));
console.log(built.map((b) => `${b.path} (${b.words} words)`).join("\n"));

// ---- hub cards + homepage chips -> internal pages ----
// Retarget by CARD, not by regex across the whole file. The earlier version also tried a
// "link before image" pattern, which matched the PREVIOUS card's anchor and silently pointed
// Midtown at Pace, Navarre at Cordova Park and Cordova Park at Beulah. Slice each card and
// rewrite only the anchor inside it, then assert every card links to its own slug.
let h = hub, hubChanged = 0;
const bySlug = Object.fromEntries(NEIGHBORHOODS.map((n) => [n.image, n]));
h = h.replace(/class="nb-card"[\s\S]*?(?=class="nb-card"|<\/section>)/g, (card) => {
  const img = (card.match(/<img[^>]*src="([^"]+)"/) || [])[1];
  const n = bySlug[img];
  if (!n) return card; // e.g. the Orange Beach card, which points at /gulf-shores-orange-beach
  return card.replace(/(class="nb-link"[^>]*href=")[^"]+(")/, (m, a, b) => { hubChanged++; return `${a}/neighborhoods/${n.slug}${b}`; });
});
for (const m of h.matchAll(/class="nb-card"[\s\S]*?(?=class="nb-card"|<\/section>)/g)) {
  const img = (m[0].match(/<img[^>]*src="([^"]+)"/) || [])[1];
  const link = (m[0].match(/class="nb-link"[^>]*href="([^"]+)"/) || [])[1];
  const n = bySlug[img];
  if (n && link !== `/neighborhoods/${n.slug}`) throw new Error(`hub card for ${n.slug} links to ${link}`);
}
writeFileSync(`${SITE_DIR}/neighborhoods.html`, h);
let idx = readFileSync(`${SITE_DIR}/index.html`, "utf8"), chips = 0;
for (const n of NEIGHBORHOODS) {
  const before = idx;
  const twins = n.slug === "pace-milton" ? ["/communities/pace", "/communities/milton"] : n.slug === "gulf-breeze" ? ["/communities/gulf-breeze"] : [n.pmh];
  for (const t of twins) idx = idx.split(`href="${PMH}${t}"`).join(`href="/neighborhoods/${n.slug}"`);
  if (idx !== before) chips++;
}
writeFileSync(`${SITE_DIR}/index.html`, idx);
console.log(`hub cards retargeted: ${hubChanged}; homepage chips retargeted: ${chips}`);

// ---- sitemap + llms ----
let sm = readFileSync(`${SITE_DIR}/sitemap.xml`, "utf8"), added = 0;
for (const b of built) if (!sm.includes(`${SITE}${b.path}<`)) { sm = sm.replace("</urlset>", `  <url>\n    <loc>${SITE}${b.path}</loc>\n    <lastmod>${DATE_ISO}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n</urlset>`); added++; }
writeFileSync(`${SITE_DIR}/sitemap.xml`, sm);
let llms = readFileSync(`${SITE_DIR}/llms.txt`, "utf8"), llAdded = 0;
for (const b of built) if (!llms.includes(`${SITE}${b.path})`)) { llms = llms.replace(/(- \[Neighborhoods\]\([^)]*\): [^\n]*)/, (m) => `${m}\n- [${b.n.name}](${SITE}${b.path}): ${b.n.desc}`); llAdded++; }
writeFileSync(`${SITE_DIR}/llms.txt`, llms);
console.log(`sitemap +${added}, llms +${llAdded}. Next: node scripts/apply-responsive-images.mjs && node scripts/build-entity-graph.mjs && node scripts/audit-civilian.mjs`);
