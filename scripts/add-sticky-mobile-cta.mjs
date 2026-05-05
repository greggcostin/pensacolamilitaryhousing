// Inject a fixed-position mobile call CTA into every prerendered HTML page.
// Hidden on desktop (>=801px), pinned bottom-right on mobile. 44px+ tap
// target meeting WCAG AA. Idempotent — re-running is a no-op.

import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";

const MARKER = "<!-- sticky-mobile-cta -->";

// CSS goes inside the existing <style>...</style> block so we don't add
// another network request. Mobile-only via media query.
const CSS = `
/* Sticky mobile call CTA — hidden on desktop, pinned bottom-right on phone */
.sticky-mobile-cta{display:none}
@media (max-width:800px){
  .sticky-mobile-cta{
    display:inline-flex;align-items:center;gap:6px;
    position:fixed;bottom:16px;right:16px;z-index:9999;
    background:#C9A84C;color:#0A0F1A!important;
    font-weight:700;font-size:15px;letter-spacing:.2px;
    padding:12px 18px;min-height:44px;border-radius:999px;
    box-shadow:0 6px 20px rgba(0,0,0,.45);
    text-decoration:none;font-family:var(--sans,'Inter',system-ui,sans-serif);
  }
  .sticky-mobile-cta:hover,.sticky-mobile-cta:focus{background:#D4B768}
}`.trim();

// HTML goes right before </body>.
const HTML = `${MARKER}\n<a href="tel:8502665005" class="sticky-mobile-cta" aria-label="Call Gregg Costin at 850-266-5005" data-cta="sticky-mobile">📞 (850) 266-5005</a>\n`;

const files = [];
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full);
    else if (name.endsWith(".html")) files.push(full);
  }
}
walk("public");
// SPA root index.html is handled by App.jsx — skip it so React owns it
const target = files;

let count = 0;
for (const path of target) {
  let html = readFileSync(path, "utf8");
  if (html.includes(MARKER)) {
    continue; // idempotent
  }
  // 1) Inject CSS into the existing first <style> block
  if (html.includes("</style>")) {
    html = html.replace("</style>", `${CSS}\n</style>`);
  }
  // 2) Inject HTML right before </body>
  if (html.includes("</body>")) {
    html = html.replace("</body>", `${HTML}</body>`);
  } else {
    // No </body> tag — append at end (some pages end with </footer></body></html>)
    console.log(`  ${path} — no </body> tag, skipped`);
    continue;
  }
  writeFileSync(path, html, "utf8");
  count++;
}
console.log(`${count} prerendered pages updated with sticky mobile CTA.`);
