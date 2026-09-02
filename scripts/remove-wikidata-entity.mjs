// Remove the deleted Wikidata item Q140446886 (deleted by Wikidata on 2026-07-07 for
// notability) and the dead https://g.co/kgs/gregg-costin link from every JSON-LD block
// under public/ and civilian-site/. Inverse of the retired scripts/add-wikidata-entity.mjs.
// index.html (pretty-printed JSON) is edited by hand. Idempotent.
//
//   node scripts/remove-wikidata-entity.mjs --dry                # report only
//   node scripts/remove-wikidata-entity.mjs --only public/bah-rates.html   # one-page preview
//   node scripts/remove-wikidata-entity.mjs                      # apply everywhere
import { readdirSync, readFileSync, writeFileSync } from "node:fs";

const QID = "Q140446886";
const DEAD_URLS = new Set([`https://www.wikidata.org/wiki/${QID}`, "https://g.co/kgs/gregg-costin"]);
const args = process.argv.slice(2);
const dry = args.includes("--dry");
const onlyIdx = args.indexOf("--only");
const only = onlyIdx > -1 ? args[onlyIdx + 1].replace(/\\/g, "/") : null;

function walk(dir, out = []) {
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    if (f.name === "node_modules" || f.name === ".git" || f.name === "dist") continue;
    const p = `${dir}/${f.name}`;
    if (f.isDirectory()) walk(p, out);
    else if (f.name.endsWith(".html")) out.push(p);
  }
  return out;
}

// Recursively strip the identifier entry and the dead sameAs URLs from any node.
function scrub(node, stats) {
  if (Array.isArray(node)) { node.forEach((n) => scrub(n, stats)); return; }
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node.identifier)) {
    const before = node.identifier.length;
    node.identifier = node.identifier.filter((x) => !(x && (x.value === QID || x.propertyID === "Wikidata")));
    if (node.identifier.length !== before) stats.identifiers += before - node.identifier.length;
    if (node.identifier.length === 0) delete node.identifier;
  }
  if (Array.isArray(node.sameAs)) {
    const before = node.sameAs.length;
    node.sameAs = node.sameAs.filter((u) => !DEAD_URLS.has(u));
    if (node.sameAs.length !== before) stats.sameAs += before - node.sameAs.length;
    if (node.sameAs.length === 0) delete node.sameAs;
  }
  for (const k of Object.keys(node)) scrub(node[k], stats);
}

const files = [...walk("public"), ...walk("civilian-site")].filter((f) => !only || f === only);
const stats = { identifiers: 0, sameAs: 0, files: 0, relMe: 0 };
const changedFiles = [];
for (const file of files) {
  const src = readFileSync(file, "utf8");
  let changed = false;
  let out = src.replace(/(<script[^>]*type="application\/ld\+json"[^>]*>)([\s\S]*?)(<\/script>)/gi, (whole, open, body, close) => {
    if (!body.includes(QID) && !body.includes("g.co/kgs")) return whole;
    let j;
    try { j = JSON.parse(body); } catch { return whole; }
    const before = JSON.stringify(j);
    scrub(j, stats);
    const after = JSON.stringify(j);
    if (before === after) return whole;
    changed = true;
    return open + after + close;
  });
  // <link rel="me"> pointing at the deleted item
  const relMe = /\s*<link rel="me" href="https:\/\/www\.wikidata\.org\/wiki\/Q140446886"\s*\/?>\n?/g;
  if (relMe.test(out)) { out = out.replace(relMe, "\n"); stats.relMe++; changed = true; }
  if (changed) {
    changedFiles.push(file);
    if (!dry) writeFileSync(file, out);
    stats.files++;
  }
  if (!dry && /Q140446886|g\.co\/kgs\/gregg-costin/.test(readFileSync(file, "utf8"))) {
    console.error(`WARNING: ${file} still mentions the deleted item outside JSON-LD; inspect by hand`);
  }
}
console.log(`${dry ? "[dry run] " : ""}wikidata purge: identifier entries removed ${stats.identifiers}, sameAs URLs removed ${stats.sameAs}, rel=me removed ${stats.relMe}, files ${stats.files}`);
if (dry || only) changedFiles.forEach((f) => console.log("  " + f));
