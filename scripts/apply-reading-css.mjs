// One-off (Aug 2026): port the blog's long-form reading typography to every
// static page. Same rationale as the blog fix: font-weight 300 shimmers on the
// dark scheme, 15.5px is small for long reads, and full-width paragraphs run
// ~110 characters per line. Regular weight, 17px, ~72ch text column; figures,
// tables, and callout panels keep the full content width.
// Idempotent via the READING_CSS marker.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";

const CSS = `
/*READING_CSS*/
main p,main ul,main ol,main h2,main h3,main details,main blockquote{max-width:760px;margin-left:auto;margin-right:auto}
main p{font-size:17px;line-height:1.75;font-weight:400}
main ul,main ol{font-size:16.5px;line-height:1.7;font-weight:400}
main li{margin:.4rem 0}
main details p{font-size:16px}
@media(max-width:640px){main p{font-size:16.5px}main ul,main ol{font-size:16px}}
`;

const files = [];
for (const dir of ["public", "public/bases", "public/communities"]) {
  for (const f of readdirSync(dir)) {
    if (f.endsWith(".html")) files.push(`${dir}/${f}`);
  }
}

let done = 0, skipped = 0;
for (const f of files) {
  let html = readFileSync(f, "utf8");
  if (html.includes("/*READING_CSS*/") || html.includes("/*POST_READING_CSS")) { skipped++; continue; }
  if (!html.includes("main p{")) { skipped++; continue; } // not a content-page template
  html = html.replace("</style>", CSS + "</style>");
  writeFileSync(f, html);
  done++;
}
console.log(`READING_CSS injected: ${done} pages (${skipped} skipped: already styled or non-content)`);
