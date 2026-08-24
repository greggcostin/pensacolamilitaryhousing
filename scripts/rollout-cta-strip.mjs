// Roll the above-the-fold CTA strip (previewed on /bah-rates, approved 2026-08-24)
// to the top static money pages. Inserts a self-contained <style> + strip right
// after <main data-pagefind-body>. Idempotent: pages already carrying
// CTA_STRIP_START are skipped, so re-runs are safe.
//
// Usage: node scripts/rollout-cta-strip.mjs

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url)).replace(/\\/g, "/");

// file -> [hook question, promise]. Keep the promise concrete and base-correct.
const DEFAULT_PROMISE = "Text me your rank and report date and I'll send homes that fit your BAH the same day.";
const PAGES = {
  "public/communities/niceville.html": ["PCSing to Eglin or Hurlburt?", DEFAULT_PROMISE],
  "public/communities/fort-walton-beach.html": ["PCSing to Eglin or Hurlburt?", DEFAULT_PROMISE],
  "public/communities/navarre.html": ["PCSing to Hurlburt or Eglin?", DEFAULT_PROMISE],
  "public/communities/perdido-key.html": ["PCSing to NAS Pensacola or Corry?", DEFAULT_PROMISE],
  "public/bases/eglin-afb.html": ["PCSing to Eglin AFB?", DEFAULT_PROMISE],
  "public/bases/corry-station.html": ["PCSing to Corry Station?", DEFAULT_PROMISE],
  "public/bases/nas-pensacola.html": ["PCSing to NAS Pensacola?", DEFAULT_PROMISE],
  "public/pensacola-flood-zones-homebuyers.html": ["Buying in Pensacola on a PCS timeline?", "Text me your rank and report date and I'll flag flood-smart homes that fit your BAH the same day."],
  "public/assumable-va-loans-pensacola.html": ["Hunting an assumable VA loan in Pensacola?", "Text me your rank and report date and I'll flag assumable listings that fit your BAH."],
  "public/buy.html": ["PCSing to the Pensacola area?", DEFAULT_PROMISE],
  "public/va-loan-guide.html": ["Using your VA loan in Pensacola?", DEFAULT_PROMISE],
};

const strip = (hook, promise) => `<!-- CTA_STRIP_START (above-the-fold conversion strip; rolled out 2026-08-24) -->
<style>
.cta-strip{display:flex;align-items:center;justify-content:space-between;gap:18px;flex-wrap:wrap;background:var(--gold-tint);border:1px solid var(--gold-line);border-left:4px solid var(--gold);border-radius:10px;padding:16px 20px;margin:4px auto 20px;max-width:760px}
.cta-strip .cs-txt{color:var(--text);font-size:15px;line-height:1.55;flex:1 1 300px;font-family:var(--sans);margin:0}
.cta-strip .cs-txt strong{color:#fff}
.cs-actions{display:flex;gap:10px;flex-wrap:wrap}
.cs-btn{display:inline-block;background:var(--gold);color:var(--ink);font-weight:600;font-size:14px;padding:10px 16px;border-radius:8px;text-decoration:none;line-height:1.2;white-space:nowrap}
.cs-btn:hover{background:var(--gold-soft)}
.cs-btn.cs-ghost{background:transparent;border:1px solid var(--gold-line);color:var(--gold-soft)}
.cs-btn.cs-ghost:hover{border-color:var(--gold);color:var(--gold)}
@media(max-width:640px){.cta-strip{padding:14px}.cs-actions{width:100%}.cs-btn{flex:1 1 auto;text-align:center}}
</style>
<div class="cta-strip">
<p class="cs-txt"><strong>${hook}</strong> ${promise}</p>
<div class="cs-actions">
<a class="cs-btn" href="sms:+18502665005">Text (850) 266-5005</a>
<a class="cs-btn cs-ghost" href="tel:+18502665005">Call</a>
<a class="cs-btn cs-ghost" href="/pcs-checklist">Free PCS Checklist</a>
</div>
</div>
<!-- CTA_STRIP_END -->`;

const MARKER = "<main data-pagefind-body>";
let done = 0, skipped = 0;
for (const [rel, [hook, promise]] of Object.entries(PAGES)) {
  const path = ROOT + rel;
  let html = readFileSync(path, "utf8");
  if (html.includes("CTA_STRIP_START")) { console.log("SKIP (already has strip):", rel); skipped++; continue; }
  if (!html.includes(MARKER)) { console.error("NO MARKER:", rel); process.exitCode = 1; continue; }
  html = html.replace(MARKER, MARKER + "\n" + strip(hook, promise));
  writeFileSync(path, html);
  console.log("ADDED:", rel);
  done++;
}
console.log(`\n${done} added, ${skipped} skipped.`);
