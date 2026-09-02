// Sitewide compliance text (audit 2026-09-02, eeat-02 / eeat-03 / cro-11):
//   1. TCPA-grade consent line under every lead form, linking /privacy, at AA contrast
//   2. Privacy + Accessibility links in every footer (both static sites, SPA, 404 pages)
//   3. Equal Housing Opportunity on the SPA prerender shells and the civilian 404
// Idempotent; run after scripts/build-legal-pages.mjs.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";

const OLD_FINE = "By submitting, you agree to be contacted by The Costin Team. Your information is never sold or shared.";
const NEW_FINE = 'By submitting you agree that The Costin Team at Levin Rinke Realty may contact you by phone, email, and text message about your inquiry. Consent is not a condition of purchase; message and data rates may apply; reply STOP to opt out. See our <a href="/privacy">Privacy Policy</a>.';

function walk(dir, out = []) {
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    const p = `${dir}/${f.name}`;
    if (f.isDirectory()) walk(p, out); else if (f.name.endsWith(".html")) out.push(p);
  }
  return out;
}
let stats = { fine: 0, fineCss: 0, footer: 0, files: 0 };
for (const f of [...walk("public"), ...walk("civilian-site")]) {
  let h = readFileSync(f, "utf8"); const b = h;
  if (h.includes(OLD_FINE)) { h = h.split(OLD_FINE).join(NEW_FINE); stats.fine++; }
  // fine print contrast: #666 at 11px fails 4.5:1 on the panel; muted at 12px passes
  if (h.includes(".imodal .ifine{color:#666;font-size:11px;")) { h = h.replace(".imodal .ifine{color:#666;font-size:11px;", ".imodal .ifine{color:var(--muted);font-size:12px;line-height:1.5;"); stats.fineCss++; }
  if (/<p class="ifine">/.test(h) && !/\.imodal \.ifine a\{/.test(h)) h = h.replace("</style>", ".imodal .ifine a{color:var(--gold);text-decoration:underline}\n</style>");
  // footer links
  if (f.startsWith("public/") && !h.includes('href="/privacy"') && h.includes('<a href="/llms.txt">AI content map</a></p>')) {
    h = h.replace('<a href="/llms.txt">AI content map</a></p>', '<a href="/llms.txt">AI content map</a> &middot; <a href="/privacy">Privacy</a> &middot; <a href="/accessibility">Accessibility</a></p>'); stats.footer++;
  }
  if (f.startsWith("civilian-site/") && !h.includes('href="/privacy"') && h.includes('href="https://pensacolamilitaryhousing.com/">Military &amp; PCS Division</a></p>')) {
    h = h.replace('href="https://pensacolamilitaryhousing.com/">Military &amp; PCS Division</a></p>', 'href="https://pensacolamilitaryhousing.com/">Military &amp; PCS Division</a> &middot; <a href="/privacy">Privacy</a> &middot; <a href="/accessibility">Accessibility</a></p>'); stats.footer++;
  }
  if (h !== b) { writeFileSync(f, h); stats.files++; }
}
console.log(`static pages: fine print ${stats.fine}, fine-print css ${stats.fineCss}, footer links ${stats.footer}, files written ${stats.files}`);

// 404 pages
let p404 = readFileSync("public/404.html", "utf8");
if (!p404.includes('href="/privacy"')) { p404 = p404.replace('<a href="https://greggcostin.com">GreggCostin.com</a> for civilian buyers and sellers', '<a href="https://greggcostin.com">GreggCostin.com</a> for civilian buyers and sellers &middot; <a href="/privacy">Privacy</a> &middot; <a href="/accessibility">Accessibility</a>'); writeFileSync("public/404.html", p404); console.log("PMH 404 footer linked"); }
let g404 = readFileSync("civilian-site/404.html", "utf8");
if (!g404.includes('href="/privacy"')) {
  const foot = '<footer style="padding:18px 24px;text-align:center;color:#A5A496;font-size:12px;line-height:1.6;border-top:1px solid rgba(255,255,255,0.08)">Gregg Costin, Realtor &middot; The Costin Team at Levin Rinke Realty &middot; 220 W. Garden Street, Pensacola, FL 32502 &middot; Licensed in Florida and Alabama &middot; Equal Housing Opportunity<br><a href="/privacy" style="color:#C9A84C">Privacy</a> &middot; <a href="/accessibility" style="color:#C9A84C">Accessibility</a> &middot; <a href="https://pensacolamilitaryhousing.com/" style="color:#C9A84C">Military &amp; PCS Division</a></footer>';
  if (g404.includes("</body>")) { g404 = g404.replace("</body>", foot + "\n</body>"); writeFileSync("civilian-site/404.html", g404); console.log("GC 404 footer added"); }
}

// SPA: fine print (two forms) + footer links
let app = readFileSync("src/App.jsx", "utf8"); const appB = app;
const spaOld = `<p style={{ color: "#666", fontSize: 11, marginTop: 4, textAlign: "center" }}>By submitting, you agree to be contacted by The Costin Team. Your information is never sold or shared.</p>`;
const spaNew = `<p style={{ color: C.muted, fontSize: 12, lineHeight: 1.5, marginTop: 4, textAlign: "center" }}>By submitting you agree that The Costin Team at Levin Rinke Realty may contact you by phone, email, and text message about your inquiry. Consent is not a condition of purchase; message and data rates may apply; reply STOP to opt out. See our <a href="/privacy" style={{ color: C.gold }}>Privacy Policy</a>.</p>`;
const spaCount = app.split(spaOld).length - 1;
app = app.split(spaOld).join(spaNew);
if (!app.includes('href="/privacy" style={{ color: C.mutedD }}')) {
  app = app.replace(`<p style={{ color: C.mutedD, fontSize: 11 }}>Gregg Costin, Realtor® · MRP® · ABR® · SRS® · RENE® · FMS®</p>`,
    `<p style={{ color: C.mutedD, fontSize: 11 }}>Gregg Costin, Realtor® · MRP® · ABR® · SRS® · RENE® · FMS® · <a href="/privacy" style={{ color: C.mutedD }}>Privacy</a> · <a href="/accessibility" style={{ color: C.mutedD }}>Accessibility</a></p>`);
}
if (app !== appB) writeFileSync("src/App.jsx", app);
console.log(`SPA: fine print replaced ${spaCount}, footer links ${app.includes('href="/privacy" style={{ color: C.mutedD }}') ? "present" : "MISSING"}`);

// SPA prerender shells: EHO + legal links in the shell footer line
let pb = readFileSync("scripts/postbuild-spa-routes.mjs", "utf8"); const pbB = pb;
pb = pb.replace("Licensed in Florida &amp; Alabama</p>", 'Licensed in Florida &amp; Alabama &middot; Equal Housing Opportunity &middot; <a href="/privacy" style="color:#8A8D94">Privacy</a> &middot; <a href="/accessibility" style="color:#8A8D94">Accessibility</a></p>');
if (pb !== pbB) { writeFileSync("scripts/postbuild-spa-routes.mjs", pb); console.log("postbuild shell footer: EHO + legal links added"); } else console.log("postbuild shell footer: " + (pb.includes("Equal Housing Opportunity") ? "already present" : "ANCHOR MISSING"));
