// Inject a fixed-position mobile call CTA into every prerendered HTML page.
// Hidden on desktop (>=801px), pinned bottom-right on mobile. 44px+ tap
// target meeting WCAG AA. Idempotent — re-running is a no-op.

import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";

const MARKER = "<!-- sticky-mobile-cta -->";

// CSS goes inside the existing <style>...</style> block so we don't add
// another network request. Mobile-only via media query. Two-button Call + Text
// bar — this is a text-first military audience, so SMS is a first-class action.
const CSS = `
/* Sticky mobile Call/Text CTA — hidden on desktop, floating bar on phone */
.sticky-mobile-cta{display:none}
@media (max-width:800px){
  .sticky-mobile-cta{
    display:flex;gap:10px;position:fixed;left:12px;right:12px;bottom:12px;z-index:9999;
  }
  .sticky-mobile-cta a{
    flex:1;display:inline-flex;align-items:center;justify-content:center;gap:7px;
    min-height:48px;padding:12px 14px;border-radius:12px;text-decoration:none;
    font-weight:700;font-size:15px;letter-spacing:.2px;
    font-family:var(--sans,'Inter',system-ui,sans-serif);
    box-shadow:0 6px 20px rgba(0,0,0,.45);
  }
  .sticky-mobile-cta .smc-call{background:#C9A84C;color:#0A0F1A}
  .sticky-mobile-cta .smc-text{background:#1A2332;color:#fff;border:1px solid #C9A84C}
  .sticky-mobile-cta a:focus-visible{outline:2px solid #fff;outline-offset:2px}
}`.trim();

// HTML goes right before </body>. tel: fires the existing phone_call_click
// handler; sms: is tracked via the sms clause added to the shared click handler.
const SMS_BODY = "Hi%20Gregg%2C%20I%20have%20a%20question%20about%20PCSing%20to%20Pensacola.";
const HTML = `${MARKER}
<div class="sticky-mobile-cta" role="group" aria-label="Contact Gregg Costin">
<a class="smc-call" href="tel:+18502665005" aria-label="Call Gregg Costin at 850-266-5005" data-cta="sticky-call">📞 Call</a>
<a class="smc-text" href="sms:+18502665005?&body=${SMS_BODY}" aria-label="Text Gregg Costin at 850-266-5005" data-cta="sticky-text">💬 Text</a>
</div>
`;

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
