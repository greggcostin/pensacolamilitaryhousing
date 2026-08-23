// Sitewide heading scale (Aug 2026): port the SPA /pcs-guide H2 look — fluid
// Playfair serif with a gold underline — to every static page, standardize the
// h2/h3 ratio against 17px body text, and tune each viewport tier:
//   mobile ≤640: h2 25px (overrides the legacy 19px/22px crushers), body 16.5px
//   tablet/laptop 641-1024: 760px reading column enforced (!important beats the
//     legacy `main > * { max-width:100% }` tablet rule), fluid h2 26-38px
//   desktop ≥1025: h2 up to 38px over the 760px column
// Idempotent via the HEADING_CSS marker.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";

const CSS = `
/*HEADING_CSS*/
main h2{font-family:var(--serif);font-weight:500;font-size:clamp(26px,3vw,38px);line-height:1.18;color:#fff;margin:48px auto 16px;padding-bottom:12px;border-bottom:2px solid var(--gold-line);letter-spacing:-0.01em}
main h3{font-size:clamp(17px,1.6vw,20px);margin:34px auto 12px}
@media(min-width:641px){main p,main ul,main ol,main details,main blockquote,main h2,main h3,main .facts,main .related{max-width:760px!important;margin-left:auto!important;margin-right:auto!important}main h2{font-size:clamp(26px,3.2vw,38px)!important}main h3{font-size:clamp(17px,1.6vw,20px)!important}}
@media(max-width:640px){main h2{font-size:25px!important;margin:38px auto 14px;padding-bottom:10px}main h3{font-size:17px!important}main h2,main h3{overflow-wrap:anywhere}}
`;

const files = [];
for (const dir of ["public", "public/bases", "public/communities", "public/blog"]) {
  for (const f of readdirSync(dir)) {
    if (f.endsWith(".html")) files.push(`${dir}/${f}`);
  }
}

let done = 0, skipped = 0;
for (const f of files) {
  let html = readFileSync(f, "utf8");
  if (html.includes("/*HEADING_CSS*/")) { skipped++; continue; }
  if (!html.includes("main p{") && !html.includes("/*READING_CSS*/") && !html.includes("/*BLOG_CSS*/")) { skipped++; continue; }
  html = html.replace("</style>", CSS + "</style>");
  writeFileSync(f, html);
  done++;
}
console.log(`HEADING_CSS injected: ${done} pages (${skipped} skipped)`);
