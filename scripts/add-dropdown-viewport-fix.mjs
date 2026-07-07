// Mobile dropdown viewport clamp for the static-page banner nav.
// The desktop-mimic tab bar wraps on phones, but its absolutely-positioned
// dropdown menus anchored left:0 to their button bled past the right edge of
// a 375px viewport (4 of 5 menus partially unreachable). Fix: at <=900px the
// banner becomes the positioning context and every open menu renders as a
// viewport-wide panel just below the banner. Desktop behavior unchanged.
// Idempotent (keyed on ddfix-css). Run after adding new pages from templates
// that predate this fix.
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const CSS = `<style id="ddfix-css">@media(max-width:900px){
.main-banner{position:relative}
.main-banner .dropdown{position:static}
.main-banner .dropdown-menu{left:12px;right:12px;top:100%;min-width:0!important;max-height:55vh!important;overflow-y:auto}
}</style>
`;

function walk(dir) {
  const out = [];
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (n.endsWith(".html")) out.push(p);
  }
  return out;
}

let added = 0, skipped = 0, missed = 0;
for (const f of walk("public")) {
  let s = readFileSync(f, "utf8");
  if (!s.includes('<nav class="main-banner"')) { missed++; continue; }
  if (s.includes("ddfix-css")) { skipped++; continue; }
  s = s.replace("</head>", CSS + "</head>");
  writeFileSync(f, s);
  added++;
}
console.log(`dropdown viewport fix: added ${added}, already-had ${skipped}, no-banner ${missed}`);
