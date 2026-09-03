// Owner preference (Sep 2026): on phones the nav tabs stay VISIBLE as wrapped rows, the way they
// were before the hamburger drawer. The drawer markup stays in the page (harmless) but the toggle
// is hidden and the drawer container is demoted to a normal static block, so every top-level
// destination is one tap away instead of two. Text is bumped from the old 9px to 10.5px for
// legibility and each chip gets a 30px minimum height.
//
// Rewrites the block between the MOBILE_DRAWER markers, so it is idempotent and reversible.
//   node scripts/mobile-header-tabs.mjs --only public/first-time-military-homebuyer.html
//   node scripts/mobile-header-tabs.mjs [--dry]
import { readdirSync, readFileSync, writeFileSync } from "node:fs";

const START = "/* MOBILE_DRAWER_START */";
const END = "/* MOBILE_DRAWER_END */";
const DRY = process.argv.includes("--dry");
const onlyIdx = process.argv.indexOf("--only");
const ONLY = onlyIdx > -1 ? process.argv[onlyIdx + 1].split("\\").join("/") : null;

const TABS_CSS = `${START}
/* The drawer markup stays in the page but is never shown; the toggle must be hidden at EVERY width. */
.nav-toggle{display:none!important}
.main-banner{position:sticky;top:0}
/* Phones: keep every top-level tab visible (owner preference). */
@media (max-width: 900px){
  .nav-toggle{display:none!important}
  .site-drawer{display:block!important;position:static!important;top:auto!important;left:auto!important;right:auto!important;bottom:auto!important;background:none!important;padding:0!important;overflow:visible!important;z-index:auto!important}
  .banner-row{grid-template-columns:auto 1fr auto!important;padding:6px 12px 0!important;gap:10px!important;min-height:0!important;align-items:center}
  .banner-lrr{display:block!important;justify-self:start}
  .banner-logo{justify-self:center}
  .banner-lrr img,.banner-logo img{height:38px!important}
  .banner-tabs{display:flex!important;flex-direction:row!important;flex-wrap:wrap!important;align-items:center!important;justify-content:center!important;gap:2px!important;padding:4px 6px 8px!important}
  .main-banner .banner-tabs>a,.main-banner .banner-tabs .dropdown>button,.main-banner .banner-tabs .banner-search{display:inline-flex!important;align-items:center;justify-content:center;width:auto!important;min-height:30px;margin:0!important;padding:5px 8px!important;font-size:11px!important;letter-spacing:.3px!important;line-height:1.1;text-align:center!important;text-transform:uppercase!important;border-bottom:none!important;border-radius:6px!important}
  .banner-tabs>a.mil-link{border:1px solid var(--gold-line);margin:0!important}
  .banner-tabs .dropdown{padding:0;position:relative}
  body.drawer-open{overflow:auto!important}
}
@media (max-width: 360px){
  /* the sticky bottom bar already carries Email; the header copy overflows below 360px */
  .main-banner .banner-email{display:none!important}
}
@media (max-width: 480px){
  .banner-lrr img,.banner-logo img{height:32px!important}
  .banner-tabs{gap:1px!important;padding:3px 4px 7px!important}
  .main-banner .banner-tabs>a,.main-banner .banner-tabs .dropdown>button,.main-banner .banner-tabs .banner-search{padding:5px 6px!important;font-size:10.5px!important;letter-spacing:.2px!important}
}
${END}
`;

function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (["og", "images", "pagefind", "node_modules"].includes(e.name)) continue;
    const p = `${dir}/${e.name}`;
    if (e.isDirectory()) walk(p, out); else if (e.name.endsWith(".html")) out.push(p);
  }
  return out;
}

const files = ONLY ? [ONLY] : ["index.html", ...walk("public"), ...walk("civilian-site")];
let changed = 0, missing = 0;
for (const f of files) {
  const src = readFileSync(f, "utf8");
  const a = src.indexOf(START), b = src.indexOf(END);
  if (a < 0 || b < 0) { missing++; continue; }
  const out = src.slice(0, a) + TABS_CSS.trim() + src.slice(b + END.length);
  if (out !== src) { changed++; if (!DRY) writeFileSync(f, out, "utf8"); }
}
console.log(`${DRY ? "[dry] " : ""}mobile tabs: ${changed} pages rewritten, ${missing} without the drawer markers`);
