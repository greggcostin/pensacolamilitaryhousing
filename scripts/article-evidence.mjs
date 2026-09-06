// Evidence validation checks traceability and arithmetic, not whether a source is true.
import { existsSync, readFileSync } from "node:fs";
import { resolve, relative } from "node:path";
import { isoDay } from "./search-evidence.mjs";

const OWN = new Set(["pensacolamilitaryhousing.com", "www.pensacolamilitaryhousing.com", "greggcostin.com", "www.greggcostin.com"]);
export function externalSources(html) {
  const sources = new Set();
  for (const m of String(html).matchAll(/<a\b[^>]*href=["']([^"']+)["']/gi)) {
    try {
      const u = new URL(m[1].replace(/&amp;/g, "&"));
      if (u.protocol === "https:" && !OWN.has(u.hostname)) sources.add(u.href);
    } catch { /* relative and non-web destinations are not external evidence */ }
  }
  return [...sources];
}

export function calculate(c) {
  const a = c?.inputs;
  if (!Array.isArray(a) || !a.length || a.some((x) => typeof x !== "number" || !Number.isFinite(x))) throw new Error("finite numeric calculation inputs required");
  if (c.operation === "sum") return a.reduce((x, y) => x + y, 0);
  if (c.operation === "product") return a.reduce((x, y) => x * y, 1);
  if (c.operation === "difference" && a.length === 2) return a[0] - a[1];
  if (c.operation === "quotient" && a.length === 2 && a[1] !== 0) return a[0] / a[1];
  throw new Error("unsupported calculation; use a separately tested model and document its path");
}

export function validatePack(pack, { slug, site, today, body = "", strict = true } = {}) {
  const errors = [], warnings = [];
  if (!pack || pack.schemaVersion !== 2) return { errors: ["research pack schemaVersion 2 required"], warnings };
  if (pack.templateOnly === true) errors.push("A research-pack template is not publishable evidence");
  if (pack.article?.slug !== slug || pack.article?.site !== site) errors.push("research pack belongs to a different article or site");
  if (!pack.models?.research || !pack.models?.write) errors.push("record the research and writing models actually used");
  if (!Array.isArray(pack.uncertainFacts)) errors.push("uncertainFacts must be an array, including when empty");
  if (!pack.readerTask || !pack.originalValue) errors.push("readerTask and originalValue required");
  const ids = new Set(), published = new Set([...body.matchAll(/data-claim=["']([^"']+)["']/g)].flatMap((m) => m[1].split(/\s+/)));
  const citations = new Set(externalSources(body));
  if (!Array.isArray(pack.claims) || !pack.claims.length) errors.push("at least one traceable claim required");
  for (const c of pack.claims || []) {
    if (!c.id || ids.has(c.id)) errors.push("claim ids must be present and unique");
    ids.add(c.id);
    if (!c.claim || !["fact", "calculation", "illustration"].includes(c.kind)) errors.push(c.id + ": claim text and valid kind required");
    if (c.status !== "verified" && published.has(c.id)) errors.push(c.id + ": uncertain or omitted claim appears in publishable prose");
    if (c.status !== "verified") continue;
    if (!isoDay(c.accessed) || c.accessed > today || !c.asOf || !c.locator) errors.push(c.id + ": source access date, data vintage and precise locator required");
    let url;
    try { url = new URL(c.sourceUrl); } catch {}
    if (!url || url.protocol !== "https:") errors.push(c.id + ": HTTPS source URL required");
    if (published.has(c.id) && url && !citations.has(url.href)) errors.push(c.id + ": published claim needs its source link in the article");
    if (c.loadBearing && (!c.independentCheck?.reviewer || !isoDay(c.independentCheck.date) || c.independentCheck.date > today || !c.independentCheck.finding)) errors.push(c.id + ": load-bearing claim requires a recorded independent check");
    if (c.kind === "calculation") {
      try {
        const actual = calculate(c.calculation);
        const tolerance = c.calculation.tolerance ?? 0.005;
        if (!Number.isFinite(c.calculation.result) || !Number.isFinite(tolerance) || tolerance < 0 || tolerance > 0.01 || Math.abs(actual - c.calculation.result) > tolerance) errors.push(c.id + ": arithmetic result does not match recorded inputs");
        if (!c.calculation.units || !c.calculation.inputSources?.length) errors.push(c.id + ": calculation units and input sources required");
      } catch (e) { errors.push(c.id + ": " + e.message); }
    }
  }
  for (const id of published) if (!ids.has(id)) errors.push(id + ": prose references an unknown claim");
  if (strict && !published.size) errors.push("link load-bearing prose to the pack using data-claim ids");
  warnings.push("A valid pack establishes traceability. A reviewer must still verify source meaning, eligibility, population, geography and vintage.");
  return { errors, warnings };
}

export function evidenceGate(spec, body, site, root, today) {
  const optedIn = spec.editorial?.version === 2;
  // Grandfather old pages on rebuild. All new substantive work uses v2 after this audit.
  const required = optedIn || (spec.dateModified || spec.datePublished) >= "2026-09-06";
  if (!required) return { errors: [], warnings: ["Legacy article: add a research pack and reader task on its next substantive refresh."] };
  const f = spec.editorial?.evidenceFile;
  if (!f || typeof f !== "string") return { errors: ["editorial.evidenceFile required for new or refreshed articles"], warnings: [] };
  const dir = resolve(root, site === "gc" ? "content/civilian-blog" : "content/blog"), file = resolve(root, f), rel = relative(dir, file);
  if (rel.startsWith("..") || /^[A-Za-z]:/.test(rel) || !file.endsWith(".json") || !existsSync(file)) return { errors: ["evidenceFile must be an existing JSON file inside this site's content directory"], warnings: [] };
  const result = validatePack(JSON.parse(readFileSync(file, "utf8")), { slug: spec.slug, site, today, body });
  if (!spec.editorial.readerTask || !spec.editorial.originalValue || !spec.editorial.conversionGoal) result.errors.push("editorial readerTask, originalValue and conversionGoal required");
  return result;
}
