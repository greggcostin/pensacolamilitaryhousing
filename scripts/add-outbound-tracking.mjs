// One-shot, idempotent: add findbuyers (home valuation) + 825bayshore outbound
// conversion tracking to the shared static-page click handler. Anchors on the
// brokerage clause so it works for both handler versions (with/without the
// travel.dod.mil clause). Skips files already patched.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";

const ANCHOR = "{gtag('event','brokerage_profile_click',{event_category:'social_proof'});}";
const INSERT =
  "else if(h.indexOf('whats-my-home-worth')>-1){gtag('event','home_valuation_click',{event_category:'conversion'});}" +
  "else if(h.indexOf('825bayshore')>-1){gtag('event','property_page_click',{event_category:'conversion'});}";

function walk(dir, out = []) {
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    if (f.name === "node_modules" || f.name === ".git" || f.name === "dist") continue;
    const p = `${dir}/${f.name}`;
    if (f.isDirectory()) walk(p, out);
    else if (f.name.endsWith(".html")) out.push(p);
  }
  return out;
}

let patched = 0, skipped = 0, noHandler = 0;
for (const file of walk("public")) {
  let text = readFileSync(file, "utf8");
  if (!text.includes(ANCHOR)) { noHandler++; continue; }
  if (text.includes("home_valuation_click")) { skipped++; continue; }
  text = text.replaceAll(ANCHOR, ANCHOR + INSERT);
  writeFileSync(file, text);
  patched++;
  console.log("patched:", file);
}
console.log(`\ndone — patched ${patched}, already-had ${skipped}, no-handler ${noHandler}`);
