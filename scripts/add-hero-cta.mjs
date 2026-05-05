// Inject a hero-area CTA bar into every prerendered HTML page so visitors
// don't have to scroll to find a way to call/email. Goes immediately
// before </header>. Idempotent — re-running is a no-op.

import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";

const MARKER = "<!-- hero-cta -->";

// Two-button bar: primary call + secondary email. Inline styling so the
// page stays self-contained (matches the existing per-page style approach).
const HTML = `${MARKER}
<div class="hero-cta-row" style="display:flex;flex-wrap:wrap;gap:12px;margin:24px 0 4px;align-items:center">
  <a href="tel:8502665005" data-cta="hero" style="display:inline-flex;align-items:center;gap:8px;background:var(--gold,#C9A84C);color:var(--ink,#0A0F1A);font-weight:700;font-size:15px;letter-spacing:.3px;padding:12px 22px;border-radius:6px;text-decoration:none;min-height:44px;line-height:1">📞 Call (850) 266-5005</a>
  <a href="mailto:gregg.costin@gmail.com" data-cta="hero-email" style="display:inline-flex;align-items:center;gap:8px;background:transparent;color:var(--gold,#C9A84C);font-weight:600;font-size:14px;letter-spacing:.3px;padding:12px 18px;border:1px solid var(--gold-line,rgba(201,168,76,0.45));border-radius:6px;text-decoration:none;min-height:44px;line-height:1">✉ Email Gregg</a>
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

let count = 0, skipped = 0;
for (const path of files) {
  let html = readFileSync(path, "utf8");
  if (html.includes(MARKER)) { skipped++; continue; }
  if (!html.includes("</header>")) {
    console.log(`  ${path} — no </header>, skipped`);
    skipped++;
    continue;
  }
  // Inject before the FIRST </header> only
  const idx = html.indexOf("</header>");
  html = html.slice(0, idx) + HTML + html.slice(idx);
  writeFileSync(path, html, "utf8");
  count++;
}
console.log(`${count} pages updated with hero CTA. ${skipped} skipped.`);
