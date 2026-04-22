// Migrate all internal references from /<slug>.html to /bases/<slug> or /communities/<slug>.
// Updates canonicals, og:url, schema URLs, sitemap, internal hrefs, App.jsx links,
// and llms.txt / llms-full.txt.

import { readdirSync, readFileSync, writeFileSync } from "node:fs";

const BASES = {
  "nas-pensacola": "nas-pensacola",
  "corry-station": "corry-station",
  "saufley-field": "saufley-field",
  "nas-whiting-field": "whiting-field",
  "hurlburt-field": "hurlburt-field",
  "eglin-afb": "eglin-afb",
  "duke-field": "duke-field",
};

const COMMUNITIES = {
  "gulf-breeze": "gulf-breeze",
  "navarre": "navarre",
  "pace": "pace",
  "milton": "milton",
  "cantonment": "cantonment",
  "perdido-key": "perdido-key",
  "east-pensacola-heights": "east-pensacola-heights",
  "east-hill": "east-hill",
  "cordova-park": "cordova-park",
  "ferry-pass": "ferry-pass",
  "bellview-myrtle-grove": "bellview-myrtle-grove",
  "navy-point-warrington": "navy-point-warrington",
  "niceville-valparaiso-bluewater-bay": "niceville",
  "fort-walton-beach-shalimar": "fort-walton-beach",
  "destin": "destin",
  "crestview": "crestview",
};

// Build array of search→replace pairs. Sort by longest source first so
// longer slugs (niceville-valparaiso-bluewater-bay) match before possibly-
// overlapping shorter ones.
const PAIRS = [];
const DOMAIN = "https://pensacolamilitaryhousing.com";

for (const [oldSlug, newSlug] of Object.entries(BASES)) {
  // Absolute URLs: e.g., https://...nas-pensacola.html → https://.../bases/nas-pensacola
  PAIRS.push([`${DOMAIN}/${oldSlug}.html`, `${DOMAIN}/bases/${newSlug}`]);
  // Relative hrefs
  PAIRS.push([`"/${oldSlug}.html"`, `"/bases/${newSlug}"`]);
  PAIRS.push([`'/${oldSlug}.html'`, `'/bases/${newSlug}'`]);
}
for (const [oldSlug, newSlug] of Object.entries(COMMUNITIES)) {
  PAIRS.push([`${DOMAIN}/${oldSlug}.html`, `${DOMAIN}/communities/${newSlug}`]);
  PAIRS.push([`"/${oldSlug}.html"`, `"/communities/${newSlug}"`]);
  PAIRS.push([`'/${oldSlug}.html'`, `'/communities/${newSlug}'`]);
}
PAIRS.sort((a, b) => b[0].length - a[0].length);

const FILES = [
  ...readdirSync("public").filter(f => f.endsWith(".html")).map(f => `public/${f}`),
  "public/sitemap.xml",
  "public/llms.txt",
  "public/llms-full.txt",
  "src/App.jsx",
];

let filesChanged = 0, totalReplacements = 0;

for (const path of FILES) {
  let content;
  try { content = readFileSync(path, "utf8"); } catch { continue; }
  const before = content;
  let localSubs = 0;

  for (const [from, to] of PAIRS) {
    if (content.includes(from)) {
      // Count occurrences before replacing
      const count = content.split(from).length - 1;
      content = content.split(from).join(to);
      localSubs += count;
    }
  }

  if (content !== before) {
    writeFileSync(path, content, "utf8");
    filesChanged++;
    totalReplacements += localSubs;
  }
}

console.log(`Migrated ${totalReplacements} URL references across ${filesChanged} files.`);
