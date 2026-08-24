// Em-dash lint gate (standing rule: no em dashes in reader-facing prose).
// Scans the prose surfaces of every static page + the SPA source and fails
// the build if any em dash (— or &mdash;) survives outside the allowlist.
//
// Allowed to keep em dashes:
//   - The contact-worker contract strings "PCS / Relocation — Buying/Selling"
//     (the em dash is part of the backend API payload; see CLAUDE.md)
//   - CSS/JS comments and code (invisible to readers). For HTML we achieve
//     this by only scanning prose surfaces; for App.jsx by stripping comments.
//
// Usage: node scripts/check-em-dashes.mjs   (exit 1 on violations)

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url)).replace(/\\/g, "/");
// Contract strings appear both as the literal character and as &mdash; entities
// (e.g. data-inquiry-type attributes) — allow both forms.
const CONTRACT = /PCS \/ Relocation (?:—|&mdash;) (?:Buying|Selling)/g;

const htmlFiles = ["public", "public/bases", "public/communities", "public/blog"]
  .flatMap((d) => readdirSync(join(ROOT, d)).filter((f) => f.endsWith(".html")).map((f) => join(ROOT, d, f)));
htmlFiles.push(join(ROOT, "index.html"));

// Prose surfaces of an HTML file: <title>, meta content=, JSON-LD blocks,
// and <main>/<header>/<footer> markup with scripts/styles/comments stripped.
function htmlProse(html) {
  const parts = [];
  const push = (re) => { for (const m of html.matchAll(re)) parts.push(m[1] ?? m[0]); };
  push(/<title>([\s\S]*?)<\/title>/g);
  push(/<meta[^>]+content="([^"]*)"/g);
  push(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g);
  for (const region of ["main", "header", "footer"]) {
    for (const m of html.matchAll(new RegExp(`<${region}[^>]*>([\\s\\S]*?)<\\/${region}>`, "g"))) {
      parts.push(
        m[1]
          .replace(/<script[\s\S]*?<\/script>/g, "")
          .replace(/<style[\s\S]*?<\/style>/g, "")
          .replace(/<!--[\s\S]*?-->/g, "")
      );
    }
  }
  return parts.join("\n");
}

let violations = 0;
for (const f of htmlFiles) {
  const prose = htmlProse(readFileSync(f, "utf8")).replace(CONTRACT, "");
  const n = (prose.match(/—/g) || []).length + (prose.match(/&mdash;/g) || []).length;
  if (n > 0) {
    violations += n;
    console.error(`EM-DASH x${n}: ${f.replace(ROOT, "")}`);
  }
}

// App.jsx: strip comments, allow the contract strings, then count.
const appSrc = readFileSync(join(ROOT, "src/App.jsx"), "utf8")
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/(^|[^:])\/\/[^\n]*/g, "$1")
  .replace(CONTRACT, "");
const appCount = (appSrc.match(/—/g) || []).length + (appSrc.match(/&mdash;/g) || []).length;
if (appCount > 0) {
  violations += appCount;
  console.error(`EM-DASH x${appCount}: /src/App.jsx`);
}

if (violations > 0) {
  console.error(`\nFAIL: ${violations} em dash(es) in reader-facing prose. House rule: none, ever.`);
  process.exit(1);
}
console.log(`OK: no em dashes in prose across ${htmlFiles.length} pages + App.jsx.`);
