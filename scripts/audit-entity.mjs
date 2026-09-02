// Entity graph gate for BOTH sites (audit 2026-09-02, schema-02/03). Every definition of the
// three shared ids (#gregg, #team, #brokerage) anywhere on either site must be one of the exact
// shapes produced by scripts/entity-lib.mjs: the full node (only on index.html,
// civilian-site/index.html, civilian-site/team.html), the compact node, the publisher subset,
// or a bare {"@id"} reference. Also fails on retired ids and the deleted Wikidata item, and on
// any page with no reference to the shared business id. Exit 1 on findings.
//   node scripts/audit-entity.mjs
import { readdirSync, readFileSync } from "node:fs";
import { IDS, personFull, teamFull, brokerageFull, personCompact, teamCompact, brokerageCompact, publisherRef } from "./entity-lib.mjs";

const OLD = ["https://pensacolamilitaryhousing.com/#agent", "https://pensacolamilitaryhousing.com/#person-gregg", "https://pensacolamilitaryhousing.com/#localbusiness", "https://pensacolamilitaryhousing.com/#brokerage", "Q140446886"];
const FULL_PAGES = new Set(["index.html", "civilian-site/index.html", "civilian-site/team.html"]);
const S = (o) => JSON.stringify(o);
const ALLOWED = {
  [IDS.person]: { full: S(personFull()), compact: S(personCompact()) },
  [IDS.team]: { full: S(teamFull()), compact: S(teamCompact()), publisher: S(publisherRef()) },
  [IDS.brokerage]: { full: S(brokerageFull()), compact: S(brokerageCompact()) },
};
function walk(dir, out = []) {
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    const p = `${dir}/${f.name}`;
    if (f.isDirectory()) walk(p, out); else if (f.name.endsWith(".html") && f.name !== "404.html") out.push(p);
  }
  return out;
}
const collect = (node, out) => {
  if (Array.isArray(node)) { node.forEach((n) => collect(n, out)); return; }
  if (!node || typeof node !== "object") return;
  if (node["@id"] && ALLOWED[node["@id"]]) out.push(node);
  for (const k of Object.keys(node)) if (k !== "@id") collect(node[k], out);
};
const files = ["index.html", ...walk("public"), ...walk("civilian-site")];
const findings = [];
let fullSeen = { [IDS.person]: 0, [IDS.team]: 0, [IDS.brokerage]: 0 };
for (const f of files) {
  const h = readFileSync(f, "utf8");
  for (const o of OLD) if (h.includes(o)) findings.push(`${f}: retired identifier ${o}`);
  if (!h.includes(`"@id":"${IDS.team}"`) && !h.includes(`"@id": "${IDS.team}"`)) findings.push(`${f}: no reference to the shared business id`);
  const nodes = [];
  for (const m of h.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    let j; try { j = JSON.parse(m[1]); } catch { findings.push(`${f}: invalid JSON-LD`); continue; }
    collect(j, nodes);
  }
  for (const n of nodes) {
    const id = n["@id"];
    const copy = { ...n }; delete copy["@context"];
    const keys = Object.keys(copy);
    if (keys.length === 1) continue; // bare reference
    const s = S(copy);
    const a = ALLOWED[id];
    if (s === a.full) { fullSeen[id]++; if (!FULL_PAGES.has(f)) findings.push(`${f}: full ${id} definition outside the three canonical pages`); continue; }
    if (s === a.compact || (a.publisher && s === a.publisher)) continue;
    findings.push(`${f}: ${id} defined with a non-canonical shape (${keys.slice(0, 6).join(",")}...)`);
  }
}
for (const id of Object.keys(fullSeen)) if (!fullSeen[id]) findings.push(`canonical full node ${id} is not defined on any page`);
if (findings.length) { console.log(findings.slice(0, 40).join("\n")); console.log(`ENTITY AUDIT: ${findings.length} findings across ${files.length} pages`); process.exit(1); }
console.log(`ENTITY AUDIT CLEAN: ${files.length} pages; full nodes on ${Object.values(fullSeen).join("/")} pages; every other definition is the canonical compact or publisher shape`);
