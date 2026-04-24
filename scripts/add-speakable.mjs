// Add `speakable` schema (WebPage + SpeakableSpecification) to the 6 highest-
// priority pages for voice-assistant answer extraction.
//
// The "speakable" CSS selector marks which DOM elements voice assistants
// (Alexa, Google Assistant) should read aloud when answering queries that
// cite this page.

import { readFileSync, writeFileSync } from "node:fs";

const TARGETS = [
  { path: "public/va-loan-guide.html", url: "https://pensacolamilitaryhousing.com/va-loan-guide" },
  { path: "public/va-funding-fee-2026.html", url: "https://pensacolamilitaryhousing.com/va-funding-fee-2026.html" },
  { path: "public/va-irrrl-guide.html", url: "https://pensacolamilitaryhousing.com/va-irrrl-guide.html" },
  { path: "public/bah-to-mortgage-guide.html", url: "https://pensacolamilitaryhousing.com/bah-to-mortgage-guide.html" },
  { path: "public/fl064-bah-rates.html", url: "https://pensacolamilitaryhousing.com/fl064-bah-rates.html" },
  { path: "public/disabled-veteran-benefits-florida.html", url: "https://pensacolamilitaryhousing.com/disabled-veteran-benefits-florida.html" },
  { path: "public/pcs-checklist.html", url: "https://pensacolamilitaryhousing.com/pcs-checklist.html" },
];

function speakableBlock(url) {
  return `<script type="application/ld+json">
{"@context":"https://schema.org","@type":"WebPage","@id":"${url}#webpage","url":"${url}","speakable":{"@type":"SpeakableSpecification","cssSelector":["h1","h2","h3","summary",".lead",".facts strong"]}}
</script>`;
}

let count = 0;
for (const { path, url } of TARGETS) {
  let c;
  try { c = readFileSync(path, "utf8"); } catch { continue; }
  if (c.includes(`"@id":"${url}#webpage"`)) { console.log("  already", path); continue; }
  // Insert after the last schema block in <head>, before </head>
  const insert = speakableBlock(url);
  if (!c.includes("</head>")) continue;
  c = c.replace("</head>", insert + "\n</head>");
  writeFileSync(path, c, "utf8");
  console.log("  added speakable:", path);
  count++;
}
console.log(`\nTask 5 complete — speakable schema on ${count} pages.`);
