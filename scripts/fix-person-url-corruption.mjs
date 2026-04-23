// A prior script (extend-sameas.mjs) accidentally appended 23 short-domain URLs
// into the `worksFor.url` value of every Person schema block, producing invalid
// JSON like `"url":"https://a.com","https://b.com",...`. Google silently drops
// invalid JSON-LD, so Person entities (and the credentials + knowsAbout they
// carry) have been invisible to crawlers. This script restores the single
// canonical brokerage URL and leaves the short domains in the Person sameAs
// array where they belong.

import { readdirSync, readFileSync, writeFileSync } from "node:fs";

const BROKEN = '"url":"https://greggc.levinrinkerealty.com","https://naspensacolamilitaryhousing.com","https://corrystationmilitaryhousing.com","https://whitingfieldmilitaryhousing.com","https://naswhitingfieldmilitaryhousing.com","https://hurlburtmilitaryhousing.com","https://hurlburtfieldmilitaryhousing.com","https://eglinmilitaryhousing.com","https://eglinafbmilitaryhousing.com","https://dukefieldmilitaryhousing.com","https://saufleyfieldmilitaryhousing.com","https://navarremilitaryhousing.com","https://gulfbreezemilitaryhousing.com","https://nicevillemilitaryhousing.com","https://fortwaltonbeachmilitaryhousing.com","https://fwbmilitaryhousing.com","https://destinmilitaryhousing.com","https://crestviewmilitaryhousing.com","https://miltonmilitaryhousing.com","https://pacemilitaryhousing.com","https://maryesthermilitaryhousing.com","https://valparaisomilitaryhousing.com","https://shalimarmilitaryhousing.com","https://perdidokeymilitaryhousing.com"';
const FIXED = '"url":"https://greggc.levinrinkerealty.com"';

function walk(dir, out = []) {
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    const p = `${dir}/${f.name}`;
    if (f.isDirectory()) walk(p, out);
    else if (f.isFile() && /\.html$/.test(f.name)) out.push(p);
  }
  return out;
}

const files = [...walk("public"), "index.html"];
let touched = 0, subs = 0;

for (const path of files) {
  let content;
  try { content = readFileSync(path, "utf8"); } catch { continue; }
  const before = content;
  while (content.includes(BROKEN)) {
    content = content.replace(BROKEN, FIXED);
    subs++;
  }
  if (content !== before) {
    writeFileSync(path, content, "utf8");
    touched++;
  }
}

console.log(`Fixed ${subs} corrupted worksFor.url strings across ${touched} files.`);
