// One-shot, idempotent: repoint the home-valuation CTA + its analytics match from
// the old findbuyers URL to the RealScout "what's my home worth" tool.
//   link:    https://levinrinkerealty.findbuyers.com/... -> https://greggcostin.realscout.com/whats-my-home-worth
//   analytics: home_valuation_click now fires on the valuation path 'whats-my-home-worth'
//              (precise: won't mis-tag other realscout buyer-side links)
import { readdirSync, readFileSync, writeFileSync } from "node:fs";

const OLD_HREF = "https://levinrinkerealty.findbuyers.com/greggc@levinrinkerealty.com";
const NEW_HREF = "https://greggcostin.realscout.com/whats-my-home-worth";
const OLD_MATCH = ".indexOf('findbuyers')";
const NEW_MATCH = ".indexOf('whats-my-home-worth')";

function walk(dir, out = []) {
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    if (f.name === "node_modules" || f.name === ".git" || f.name === "dist") continue;
    const p = `${dir}/${f.name}`;
    if (f.isDirectory()) walk(p, out);
    else if (f.name.endsWith(".html")) out.push(p);
  }
  return out;
}

const files = [...walk("public"), "index.html"];
let hrefFiles = 0, matchFiles = 0;
for (const file of files) {
  let text = readFileSync(file, "utf8");
  let changed = false;
  if (text.includes(OLD_HREF)) { text = text.split(OLD_HREF).join(NEW_HREF); hrefFiles++; changed = true; }
  if (text.includes(OLD_MATCH)) { text = text.split(OLD_MATCH).join(NEW_MATCH); matchFiles++; changed = true; }
  if (changed) writeFileSync(file, text);
}
console.log(`repoint-home-valuation: rewrote CTA href in ${hrefFiles} file(s), analytics match in ${matchFiles} file(s).`);
