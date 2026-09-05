// Roll the Microsoft Clarity tag across every greggcostin.com page (added 2026-09-04).
// The military site has carried Clarity since launch (project wm7ddbciup); the civilian site
// never had it, which is why the civilian blog engine's MEASURE step reads "Clarity unavailable".
// Idempotent: pages that already load clarity.ms are skipped. The snippet goes right after the
// GA4 config block, inside the range scripts/civilian-page-lib.mjs chrome() copies from
// index.html, so factory-built pages pick it up on their next build as well.
//
//   node scripts/rollout-clarity-civilian.mjs <clarityProjectId> [--dry]
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url)).replace(/\\/g, "/");
const [id, ...rest] = process.argv.slice(2);
const DRY = rest.includes("--dry");
if (!id || !/^[a-z0-9]{6,20}$/.test(id)) { console.error("usage: node scripts/rollout-clarity-civilian.mjs <clarityProjectId> [--dry]"); process.exit(2); }

const SNIPPET = `<script>(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "${id}");</script>`;
const dirs = ["civilian-site", "civilian-site/resources", "civilian-site/neighborhoods", "civilian-site/blog", "civilian-site/schools"];
let changed = 0, skipped = 0, noAnchor = [];
for (const d of dirs) {
  for (const f of readdirSync(ROOT + d).filter((f) => f.endsWith(".html"))) {
    const p = `${ROOT}${d}/${f}`;
    const html = readFileSync(p, "utf8");
    if (html.includes("clarity.ms/tag/")) { skipped++; continue; }
    const ga = html.indexOf("gtag('config','G-W29GHBK38M'");
    const close = ga >= 0 ? html.indexOf("</script>", ga) : -1;
    if (close < 0) { noAnchor.push(`${d}/${f}`); continue; }
    const out = html.slice(0, close + 9) + "\n" + SNIPPET + html.slice(close + 9);
    if (!DRY) writeFileSync(p, out);
    changed++;
  }
}
console.log(`${DRY ? "(dry) " : ""}clarity ${id}: ${changed} page(s) tagged, ${skipped} already tagged, ${noAnchor.length} without a GA anchor${noAnchor.length ? ": " + noAnchor.join(", ") : ""}`);
