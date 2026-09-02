// RETIRED 2026-09-02: Wikidata deleted Q140446886 on 2026-07-07 (notability). Do not run. See scripts/remove-wikidata-entity.mjs.
// Wire Gregg's Wikidata Q-ID (Q140446886) into the entity graph sitewide
// (WIKIDATA_PLAYBOOK.md step "once Wikidata is live"). Idempotent.
//   - Every Person (#person-gregg) JSON-LD block: add identifier PropertyValue
//     + Wikidata URL in sameAs.
//   - Every standalone #agent block that already has a sameAs array: append the
//     Wikidata URL (entity corroboration).
// index.html is handled by hand (pretty-printed JSON) — this script covers the
// compact single-line blocks in public/**.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";

const QID = "Q140446886";
const WD_URL = `https://www.wikidata.org/wiki/${QID}`;
const IDENTIFIER = { "@type": "PropertyValue", propertyID: "Wikidata", value: QID };

function walk(dir, out = []) {
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    if (f.name === "node_modules" || f.name === ".git" || f.name === "dist") continue;
    const p = `${dir}/${f.name}`;
    if (f.isDirectory()) walk(p, out);
    else if (f.name.endsWith(".html")) out.push(p);
  }
  return out;
}

let personTouched = 0, agentTouched = 0, filesChanged = 0;
for (const file of walk("public")) {
  const src = readFileSync(file, "utf8");
  let changed = false;
  const out = src.replace(/(<script[^>]*type="application\/ld\+json"[^>]*>)([\s\S]*?)(<\/script>)/gi, (whole, open, body, close) => {
    let j;
    try { j = JSON.parse(body); } catch { return whole; }
    const id = j["@id"] || "";
    if (j["@type"] === "Person" && id.endsWith("#person-gregg")) {
      const hasId = Array.isArray(j.identifier) && j.identifier.some((x) => x && x.value === QID);
      const sameAs = Array.isArray(j.sameAs) ? j.sameAs : [];
      if (hasId && sameAs.includes(WD_URL)) return whole;
      if (!hasId) j.identifier = [...(Array.isArray(j.identifier) ? j.identifier : []), IDENTIFIER];
      if (!sameAs.includes(WD_URL)) j.sameAs = [WD_URL, ...sameAs];
      personTouched++; changed = true;
      return open + JSON.stringify(j) + close;
    }
    if (id.endsWith("#agent") && Array.isArray(j.sameAs) && !j.sameAs.includes(WD_URL)) {
      j.sameAs = [...j.sameAs, WD_URL];
      agentTouched++; changed = true;
      return open + JSON.stringify(j) + close;
    }
    return whole;
  });
  if (changed) { writeFileSync(file, out); filesChanged++; }
}
console.log(`wikidata: Person blocks updated ${personTouched}, #agent sameAs updated ${agentTouched}, files changed ${filesChanged}`);
