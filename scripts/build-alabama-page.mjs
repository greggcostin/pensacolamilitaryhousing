// Alabama integration for greggcostin.com (owner request 2026-09-02): a dedicated Gulf Shores and
// Orange Beach page, and the Alabama license, Baldwin County and top-producer positioning
// woven through the homepage, team page, FAQ, buy page and neighborhoods hub. Idempotent.
//
//   node scripts/build-alabama-page.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { buildPage, breadcrumbs, webPage, faqPage, gate, makeOgCard, SITE_DIR, SITE } from "./civilian-page-lib.mjs";

const DATE_ISO = "2026-09-02";
const PATH = "/gulf-shores-orange-beach";
const E = JSON.parse(readFileSync("content/entity/entity.json", "utf8"));

const faqs = [
  { q: "Can a Pensacola agent really represent me in Gulf Shores or Orange Beach?", a: "Yes. Gregg holds an Alabama real estate license as well as his Florida license, is a member of Baldwin REALTORS, and closes on the Alabama side of the line regularly. Coastal Alabama is not a referral for us; it is part of the daily market, and Gregg is a top-producing agent in Baldwin County for Gulf Shores and Orange Beach." },
  { q: "What is different about buying in Alabama versus Florida?", a: "The customs differ more than the homes do. Alabama closings are typically run through an attorney or title company under Alabama law, property taxes in Baldwin County are generally lower than in Escambia County, Alabama's homestead rules and deadlines are different from Florida's, and condo and short-term-rental rules vary by city. We walk every buyer through the state-specific checklist before the first showing." },
  { q: "Do you handle Gulf-front condos and short-term rental properties?", a: "Yes. Gulf Shores and Orange Beach are condo-heavy markets with strong rental demand. We underwrite the rental income, association reserves, insurance, and city rental rules on every unit so the numbers hold up after closing, not just in the listing remarks." },
  { q: "I own in Perdido Key and want to sell and buy across the line. Is that one transaction or two?", a: "Two transactions, two states, one agent. Because Gregg is licensed in both, the sale in Florida and the purchase in Alabama are coordinated by the same person, including timing the closings so you are never carrying two homes longer than you choose to." },
];

const main = `
<p>The state line at Perdido Key is a formality for our clients. Gregg Costin is licensed in Alabama as well as Florida, a member of Baldwin REALTORS, and a top-producing agent in Baldwin County for Gulf Shores and Orange Beach. If you are buying a Gulf-front condo, a back-bay canal home, or a primary residence in Foley or Gulf Shores, you get the same team, the same data-driven pricing, and the same negotiator that Pensacola clients get.</p>

<h2>Why a dual-licensed agent matters on this coast</h2>
<p>Most Pensacola agents stop at the Florida line and hand you to a stranger. Most Alabama agents have never worked a Perdido Key or Pensacola comparable. Buyers and sellers who live on or near the line lose in both directions: the referral fee comes out of the service you receive, and nobody is pricing your home against the full set of homes it actually competes with.</p>
<p>Gregg works the whole stretch from Pensacola Beach to Gulf Shores as one market, because that is how buyers shop it. A condo shopper comparing Perdido Key to Orange Beach gets one agent, one search, and one set of honest trade-offs.</p>

<h2>Gulf Shores</h2>
<p>Gulf Shores is the family beach town: the public beach at the end of Highway 59, Gulf State Park, the Hangout, and a growing set of neighborhoods north of the Intracoastal in Gulf Shores and Foley where full-time residents live at prices well under the beach. The condo market runs from older Gulf-front towers to newer buildings with resort amenities, and the single-family market ranges from canal homes on Little Lagoon to new construction inland.</p>
<p>What we check before you offer: rental history and city short-term-rental rules if you plan to rent, association reserves and the age of the building envelope on condos, flood zone and elevation on anything near the water, and wind-mitigation features that move the insurance number.</p>

<h2>Orange Beach</h2>
<p>Orange Beach is Alabama's boating capital: marinas on Terry Cove and Cotton Bayou, back-bay canal homes with lifts, the Wharf, Perdido Pass, and Gulf-front towers along Perdido Beach Boulevard. It sits directly against Perdido Key, so an Orange Beach search and a Perdido Key search are usually the same search with two sets of state rules.</p>
<p>Waterfront due diligence here is specific: bulkhead and dock condition, water depth at the slip, bridge clearance to the Gulf, and the insurance profile of an older Gulf-front building all change what a home is worth. We put those on the table before the emotion of the view does.</p>

<h2>What changes when you cross the line</h2>
<ul>
<li><strong>Closing customs.</strong> Alabama closings are typically handled by an attorney or a title company under Alabama law; timelines and document sets differ from a Florida closing.</li>
<li><strong>Property tax.</strong> Baldwin County property taxes are generally lower than Escambia County's for a comparable home. We show you the actual bill on any property you are considering.</li>
<li><strong>Homestead.</strong> Alabama's homestead exemption and its filing rules are different from Florida's Save Our Homes system. Sellers leaving Florida lose their Florida cap; buyers should not assume Florida rules apply.</li>
<li><strong>Rental rules.</strong> Gulf Shores and Orange Beach regulate short-term rentals by zone and by city. We confirm the rules for the exact address before you underwrite rental income.</li>
<li><strong>Insurance.</strong> Wind and flood coverage on the Alabama coast is priced by a different market than Florida's. We get real quotes during the inspection period, not after.</li>
</ul>

<h2>Sellers on the Alabama coast</h2>
<p>If you own in Gulf Shores or Orange Beach, your buyer pool includes Pensacola, Mobile, Birmingham, Atlanta, Nashville, and military families cycling through NAS Pensacola and Eglin. A listing marketed only inside Baldwin County misses a large share of them. Gregg lists Alabama properties with the same professional photography, drone and video marketing, and pricing analysis as his Florida listings, and he brings the Pensacola-side buyer network with him.</p>

<h2>Start here</h2>
<p>Tell us where you are looking, whether you are selling on either side of the line, and your timeline. You will get a plain-language plan within one business day, including the Alabama-specific items that catch first-time Baldwin County buyers off guard.</p>
<div class="btn-row"><a class="btn-p" href="https://greggcostin.realscout.com/onboarding">Search Gulf Shores and Orange Beach Listings</a><a class="btn-g" href="/contact">Send a Message</a></div>
`;

const spec = {
  file: "gulf-shores-orange-beach.html", path: PATH, ogSlug: "gulf-shores-orange-beach",
  title: "Gulf Shores & Orange Beach, AL Realtor | The Costin Team",
  desc: "Alabama-licensed representation in Gulf Shores and Orange Beach from a top-producing Baldwin County agent who also serves Pensacola and Perdido Key.",
  keywords: "Gulf Shores realtor, Orange Beach realtor, Baldwin County real estate agent, Gulf Shores condos for sale, Orange Beach waterfront homes, Alabama licensed Pensacola realtor",
  h1: "Gulf Shores and Orange Beach, Alabama",
  lead: "Licensed in Alabama and Florida. A top-producing Baldwin County agent for Gulf Shores and Orange Beach, with the Pensacola and Perdido Key market in the same hands.",
  main: main + `\n<h2>Frequently asked questions</h2>\n` + faqs.map((f, i) => `<details${i === 0 ? " open" : ""}><summary>${f.q}</summary><p>${f.a}</p></details>`).join("\n"),
  dateISO: DATE_ISO, minWords: 700,
};
spec.schemaBlocks = [
  webPage("WebPage", spec),
  breadcrumbs([{ name: "Home", path: "/" }, { name: "Neighborhoods", path: "/neighborhoods" }, { name: "Gulf Shores and Orange Beach, AL", path: PATH }]),
  faqPage(faqs),
  { "@context": "https://schema.org", "@type": "Service", "@id": `${SITE}/#service-alabama`, name: "Gulf Shores and Orange Beach, Alabama Representation", serviceType: "Real estate buyer and seller representation", description: E.services.gc.find((s) => s.id === "service-alabama").description, provider: { "@id": E.ids.team }, areaServed: [{ "@type": "City", name: "Gulf Shores" }, { "@type": "City", name: "Orange Beach" }, { "@type": "City", name: "Foley" }, { "@type": "AdministrativeArea", name: "Baldwin County, AL" }], url: SITE + PATH, offers: { "@type": "Offer", availability: "https://schema.org/InStock", url: `${SITE}/contact` } },
];
const html = buildPage(spec);
const errs = gate(spec, html);
if (errs.length) throw new Error(errs.join("; "));
await makeOgCard(spec.ogSlug, ["Gulf Shores &", "Orange Beach, AL"], "Licensed in Alabama and Florida. Top-producing Baldwin County agent.");
let sm = readFileSync(`${SITE_DIR}/sitemap.xml`, "utf8");
if (!sm.includes(`${SITE}${PATH}<`)) { sm = sm.replace("</urlset>", `  <url>\n    <loc>${SITE}${PATH}</loc>\n    <lastmod>${DATE_ISO}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n</urlset>`); writeFileSync(`${SITE_DIR}/sitemap.xml`, sm); }
let llms = readFileSync(`${SITE_DIR}/llms.txt`, "utf8");
if (!llms.includes(`${SITE}${PATH})`)) { llms = llms.replace(/(- \[Neighborhoods\]\([^)]*\): [^\n]*)/, `$1\n- [Gulf Shores and Orange Beach, AL](${SITE}${PATH}): Alabama-licensed buying and selling in Gulf Shores, Orange Beach and Baldwin County from a top-producing Baldwin County agent`); writeFileSync(`${SITE_DIR}/llms.txt`, llms); }
console.log("built", PATH);

// ---------- copy integration on existing pages ----------
const edits = [
  ["civilian-site/index.html", "straight answers to every transaction across Pensacola and the Gulf Coast.", "straight answers to every transaction across Pensacola, the Florida Panhandle, and Alabama's Gulf Shores and Orange Beach, where Gregg is a top-producing Baldwin County agent."],
  ["civilian-site/index.html", '<span class="tb-mid">FL &amp; AL</span>\n<span class="tb-label">Licensed in Florida &amp; Alabama</span>', '<span class="tb-mid">FL &amp; AL</span>\n<span class="tb-label">Licensed in both states<br>Top-producing Baldwin County agent</span>'],
  ["civilian-site/index.html", "The Costin Team serves all of Escambia and Santa Rosa County plus the Fort Walton Beach and Destin corridor.", "The Costin Team serves all of Escambia and Santa Rosa County plus the Fort Walton Beach and Destin corridor, and across the state line in Baldwin County, Alabama, where Gregg is a top-producing agent for Gulf Shores and Orange Beach."],
  ["civilian-site/index.html", '<a href="https://pensacolamilitaryhousing.com/communities/niceville">Niceville</a>\n</div>', '<a href="https://pensacolamilitaryhousing.com/communities/niceville">Niceville</a>\n<a href="/gulf-shores-orange-beach">Gulf Shores, AL</a>\n<a href="/gulf-shores-orange-beach">Orange Beach, AL</a>\n</div>'],
  ["civilian-site/index.html", "Gregg is licensed in both Florida and Alabama.", "Gregg is licensed in both Florida and Alabama and is a top-producing Baldwin County agent for Gulf Shores and Orange Beach, so the Alabama coast is part of the same market, not a referral."],
  ["civilian-site/faq.html", "Gregg is licensed in both Florida and Alabama.", "Gregg is licensed in both Florida and Alabama and is a top-producing Baldwin County agent for Gulf Shores and Orange Beach, so the Alabama coast is part of the same market, not a referral."],
  ["civilian-site/team.html", "<li><strong>Licensed in Florida and Alabama</strong>: full coverage from Perdido Key to Destin and up into coastal Alabama.", "<li><strong>Licensed in Florida and Alabama</strong>: full coverage from Destin to Perdido Key and across the state line into Baldwin County, where Gregg is a top-producing agent for <a href=\"/gulf-shores-orange-beach\">Gulf Shores and Orange Beach</a> and a member of Baldwin REALTORS."],
  ["civilian-site/neighborhoods.html", '<h3>Orange Beach, AL</h3>', '<h3>Orange Beach, AL</h3>'],
];
for (const [f, a, b] of edits) {
  let h = readFileSync(f, "utf8"); const crlf = h.includes("\r\n"); h = h.replace(/\r\n/g, "\n");
  if (!h.includes(a)) { console.log("anchor missing in", f, ":", a.slice(0, 60)); continue; }
  if (a === b) continue;
  const c = h.split(a).length - 1;
  h = h.split(a).join(b);
  writeFileSync(f, crlf ? h.replace(/\n/g, "\r\n") : h);
  console.log(`${f}: replaced ${c}`);
}
// neighborhoods hub: the two Alabama cards link to the new page instead of /contact
{
  const f = "civilian-site/neighborhoods.html";
  let h = readFileSync(f, "utf8"); const b = h;
  h = h.replace(/(<h3>Orange Beach, AL<\/h3>[\s\S]*?)<a class="nb-link" href="\/contact">([^<]*)<\/a>/, `$1<a class="nb-link" href="${PATH}">Gulf Shores and Orange Beach guide &rarr;</a>`);
  h = h.replace(/(<h3>Gulf Shores, AL<\/h3>[\s\S]*?)<a class="nb-link" href="\/contact">([^<]*)<\/a>/, `$1<a class="nb-link" href="${PATH}">Gulf Shores and Orange Beach guide &rarr;</a>`);
  if (h !== b) { writeFileSync(f, h); console.log("neighborhoods hub: Alabama cards now link to the new page"); } else console.log("neighborhoods hub: Alabama card links unchanged (check card markup)");
}
console.log("alabama integration: done");
