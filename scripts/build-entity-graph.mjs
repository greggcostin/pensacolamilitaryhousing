// Entity consolidation for BOTH sites (audit 2026-09-02: schema-02, schema-03, schema-05,
// schema-06, synergy-02, synergy-07). One Person, one RealEstateAgent, one brokerage
// Organization, defined in full from content/entity/entity.json on the two homepages and the
// civilian team page, and referenced everywhere else by compact nodes that carry the SAME
// @ids. The old pensacolamilitaryhousing.com/#agent, /#person-gregg and /#localbusiness ids
// (187 conflicting definitions, 31 different coordinates) are rewritten to the shared ids.
// Idempotent. Verify with: node scripts/audit-entity.mjs
//
//   node scripts/build-entity-graph.mjs
import { readdirSync, readFileSync, writeFileSync } from "node:fs";

import { E, IDS as ids, PMH, GC, imageObject, logoInline, personFull, teamFull, brokerageFull, serviceNode, personCompact, teamCompact, brokerageCompact, publisherRef, SERVICES as services } from "./entity-lib.mjs";
const { nap, images, person, team, brokerage } = E;
const OLD_PERSON = `${PMH}/#person-gregg`;
const OLD_AGENT = `${PMH}/#agent`;
const OLD_LOCAL = `${PMH}/#localbusiness`;
const OLD_BROKERAGE = `${PMH}/#brokerage`;
const COMPACT_MARK = "entity-graph:compact";
const compactBlock = () => `<script type="application/ld+json" data-entity="${COMPACT_MARK}">${JSON.stringify({ "@context": "https://schema.org", "@graph": [personCompact(), teamCompact(), brokerageCompact()] })}</script>`;

// ---------- helpers ----------
const LD_RE = /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g;
function walk(dir, out = []) {
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    const p = `${dir}/${f.name}`;
    if (f.isDirectory()) walk(p, out); else if (f.name.endsWith(".html") && f.name !== "404.html") out.push(p);
  }
  return out;
}
// rewrite any reference to the old ids inside a JSON tree; inline publisher objects become a canonical subset
function rewriteRefs(node) {
  if (Array.isArray(node)) return node.map(rewriteRefs);
  if (!node || typeof node !== "object") return node;
  const id = node["@id"];
  if (id === OLD_PERSON) return { "@id": ids.person };
  if (id === OLD_AGENT || id === OLD_LOCAL) {
    // keep name+logo so Article.publisher stays rich-result friendly, as an exact subset of the canonical node
    return Object.keys(node).length > 1 ? publisherRef() : { "@id": ids.team };
  }
  if (id === OLD_BROKERAGE) return { "@id": ids.brokerage };
  // non-canonical inline definitions of the shared ids (generator drift): normalise to the canonical shapes
  if (id === ids.team && Object.keys(node).length > 1) { const j = JSON.stringify(node); if (j !== JSON.stringify(teamCompact()) && j !== JSON.stringify(teamFull()) && j !== JSON.stringify(publisherRef())) return publisherRef(); }
  if (id === ids.person && Object.keys(node).length > 1) { const j = JSON.stringify(node); if (j !== JSON.stringify(personCompact()) && j !== JSON.stringify(personFull())) return { "@id": ids.person }; }
  if (id === ids.brokerage && Object.keys(node).length > 1) { const j = JSON.stringify(node); if (j !== JSON.stringify(brokerageCompact()) && j !== JSON.stringify(brokerageFull())) return { "@id": ids.brokerage }; }
  const out = {};
  for (const k of Object.keys(node)) out[k] = rewriteRefs(node[k]);
  return out;
}
const isStandaloneEntity = (j) => {
  const t = j["@type"], id = j["@id"] || "";
  if (t === "Person" && (id === OLD_PERSON || id === ids.person)) return true;
  if (t === "RealEstateAgent" && (id === OLD_AGENT || id === ids.team)) return true;
  if (t === "LocalBusiness" && id === OLD_LOCAL) return true;
  if (t === "Organization" && (id === OLD_BROKERAGE || id === ids.brokerage)) return true;
  return false;
};

let stats = { pmhPages: 0, gcPages: 0, dropped: 0, refsRewritten: 0 };

// ---------- 1. PMH homepage: one @graph replaces the eight hand-written blocks ----------
{
  const F = "index.html";
  let h = readFileSync(F, "utf8");
  const start = h.indexOf("          <!-- Schema: RealEstateAgent -->");
  const personIdx = h.indexOf("<!-- Schema: Person");
  const end = h.indexOf("</script>", personIdx) + "</script>".length;
  if (start < 0 || personIdx < 0) {
    if (!h.includes('data-entity="entity-graph:home"')) throw new Error("index.html schema region not found");
    console.log("index.html: already consolidated");
  } else {
    const graph = {
      "@context": "https://schema.org",
      "@graph": [
        { "@type": "WebSite", "@id": `${PMH}/#website`, url: `${PMH}/`, name: "Pensacola Military Housing", alternateName: "Gregg Costin, Pensacola Military Realtor", description: "PCS, VA loan, and BAH guidance for military families buying and selling homes across the Florida Panhandle.", inLanguage: "en-US", publisher: { "@id": ids.team }, about: { "@id": ids.team }, speakable: { "@type": "SpeakableSpecification", cssSelector: ["h1", "h2"] } },
        { "@type": "WebPage", "@id": `${PMH}/#webpage`, url: `${PMH}/`, name: "Pensacola Military Housing | Gregg Costin, Realtor | PCS & VA Loan", isPartOf: { "@id": `${PMH}/#website` }, about: { "@id": ids.team }, primaryImageOfPage: { "@id": ids.portrait }, inLanguage: "en-US" },
        imageObject(ids.portrait, images.portrait), imageObject(ids.logo, images.logo),
        ...services.pmh.map((s) => serviceNode("pmh", s)),
        teamFull(), personFull(), brokerageFull(),
      ],
    };
    const block = `          <!-- Schema: shared entity graph (content/entity/entity.json, scripts/build-entity-graph.mjs) -->\n          <script type="application/ld+json" data-entity="entity-graph:home">\n${JSON.stringify(graph, null, 2)}\n          </script>`;
    h = h.slice(0, start) + block + h.slice(end);
    writeFileSync(F, h);
    console.log("index.html: eight blocks replaced by one @graph");
  }
}

// ---------- 2. GC homepage + team page ----------
{
  const F = "civilian-site/index.html";
  let h = readFileSync(F, "utf8");
  if (h.includes('data-entity="entity-graph:home"')) console.log("civilian index: already consolidated");
  else {
    let firstIdx = -1;
    h = h.replace(LD_RE, (whole, body, offset) => {
      let j; try { j = JSON.parse(body); } catch { return whole; }
      if (["WebSite", "RealEstateAgent", "Person", "Organization"].includes(j["@type"])) { if (firstIdx < 0) firstIdx = offset; return "__ENTITY_DROP__"; }
      return whole;
    });
    const graph = {
      "@context": "https://schema.org",
      "@graph": [
        { "@type": "WebSite", "@id": `${GC}/#website`, url: `${GC}/`, name: "Gregg Costin | The Costin Team", alternateName: ["The Costin Team", "GreggCostin.com"], description: "Pensacola, Florida real estate: buy or sell with Gregg Costin and The Costin Team at Levin Rinke Realty.", inLanguage: "en-US", publisher: { "@id": ids.team }, about: { "@id": ids.team } },
        { "@type": "WebPage", "@id": `${GC}/#webpage`, url: `${GC}/`, name: "Gregg Costin, Pensacola Realtor | The Costin Team", isPartOf: { "@id": `${GC}/#website` }, about: { "@id": ids.team }, primaryImageOfPage: { "@type": "ImageObject", url: images.courthouse.url, width: images.courthouse.width, height: images.courthouse.height, caption: images.courthouse.caption }, inLanguage: "en-US", speakable: { "@type": "SpeakableSpecification", cssSelector: ["h1", "h2"] } },
        imageObject(ids.portrait, images.portrait), imageObject(ids.logo, images.logo),
        ...services.gc.map((s) => serviceNode("gc", s)),
        teamFull(), personFull(), brokerageFull(),
      ],
    };
    const block = `<script type="application/ld+json" data-entity="entity-graph:home">${JSON.stringify(graph)}</script>`;
    let placed = false;
    h = h.replace(/__ENTITY_DROP__\n?/g, () => { if (placed) return ""; placed = true; return block + "\n"; });
    writeFileSync(F, h);
    console.log("civilian index: entity blocks replaced by one @graph");
  }
  const T = "civilian-site/team.html";
  let t = readFileSync(T, "utf8");
  if (!t.includes('data-entity="entity-graph:person"')) {
    let done = false;
    t = t.replace(LD_RE, (whole, body) => {
      let j; try { j = JSON.parse(body); } catch { return whole; }
      if (j["@type"] === "Person" && (j["@id"] === ids.person)) { done = true; return `<script type="application/ld+json" data-entity="entity-graph:person">${JSON.stringify({ "@context": "https://schema.org", "@graph": [personFull(), teamCompact(), brokerageCompact(), imageObject(ids.portrait, images.portrait)] })}</script>`; }
      return whole;
    });
    if (!done) throw new Error("team.html Person block not found");
    writeFileSync(T, t);
    console.log("civilian team: Person block replaced by the full canonical node");
  }
}

// ---------- 3. every other page on both sites: compact nodes + reference rewrite ----------
const FULL_PAGES = new Set(["index.html", "civilian-site/index.html", "civilian-site/team.html"]);
for (const file of [...walk("public"), ...walk("civilian-site")]) {
  if (FULL_PAGES.has(file)) continue;
  let h = readFileSync(file, "utf8");
  const before = h;
  let firstDrop = -1, dropped = 0;
  h = h.replace(LD_RE, (whole, body, offset) => {
    if (whole.includes(`data-entity="${COMPACT_MARK}"`)) return whole;
    let j; try { j = JSON.parse(body); } catch { return whole; }
    if (isStandaloneEntity(j)) { if (firstDrop < 0) firstDrop = offset; dropped++; return "__ENTITY_DROP__"; }
    const rewritten = rewriteRefs(j);
    const s2 = JSON.stringify(rewritten);
    if (s2 !== JSON.stringify(j)) { stats.refsRewritten++; return `<script type="application/ld+json">${s2}</script>`; }
    return whole;
  });
  stats.dropped += dropped;
  if (!h.includes(`data-entity="${COMPACT_MARK}"`)) {
    if (dropped) { let placed = false; h = h.replace(/__ENTITY_DROP__\n?/g, () => { if (placed) return ""; placed = true; return compactBlock() + "\n"; }); }
    else { const last = h.lastIndexOf("</script>", h.indexOf("</head>")); h = h.slice(0, last + 9) + "\n" + compactBlock() + h.slice(last + 9); }
  } else h = h.replace(/__ENTITY_DROP__\n?/g, "");
  // leftover plain-text references (e.g. WebPage about strings)
  h = h.split(`"${OLD_PERSON}"`).join(`"${ids.person}"`).split(`"${OLD_AGENT}"`).join(`"${ids.team}"`).split(`"${OLD_LOCAL}"`).join(`"${ids.team}"`).split(`"${OLD_BROKERAGE}"`).join(`"${ids.brokerage}"`);
  if (h !== before) { writeFileSync(file, h); if (file.startsWith("public/")) stats.pmhPages++; else stats.gcPages++; }
}
console.log(`pages rewritten: PMH ${stats.pmhPages}, GC ${stats.gcPages}; standalone entity blocks removed ${stats.dropped}; blocks with references rewritten ${stats.refsRewritten}`);

// ---------- 4. generators: point future pages at the shared ids ----------
for (const f of ["scripts/blog-factory.mjs", "scripts/page-template.mjs", "scripts/content-page-template.mjs", "scripts/build-buy-sell.mjs", "scripts/patch-faq-reviews.mjs"]) {
  let s; try { s = readFileSync(f, "utf8"); } catch { continue; }
  const b = s;
  s = s.split(OLD_PERSON).join(ids.person).split(OLD_AGENT).join(ids.team).split(OLD_LOCAL).join(ids.team).split(OLD_BROKERAGE).join(ids.brokerage);
  if (f === "scripts/blog-factory.mjs") s = s.replace(/("@id":"https:\/\/greggcostin\.com\/#team","name":"Gregg Costin - The Costin Team","url":")https:\/\/pensacolamilitaryhousing\.com(")/, `$1${GC}$2`);
  if (s !== b) { writeFileSync(f, s); console.log("generator updated:", f); }
}
console.log("entity graph: done. Run node scripts/audit-entity.mjs");
