// Hide the "Homes ▾" banner dropdown from human visitors while keeping
// the dropdown HTML (and all 7 homes-for-sale links) fully present for
// crawlers. SEO/AI bots still see the links; users don't see the tab.

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PUB = "public";

// 1. Tag the Homes ▾ dropdown with class="dropdown homes-dropdown" so CSS
//    can target it. Handle both the post-unify and post-wire states.
const OLD_PATTERNS = [
  '<div class="dropdown"><button type="button">Homes ▾</button>',
  '<div class="dropdown" ><button type="button">Homes ▾</button>',
];
const NEW_PATTERN = '<div class="dropdown homes-dropdown" aria-hidden="true"><button type="button" tabindex="-1">Homes ▾</button>';

// 2. Hide CSS rule — injected once inside the existing <style> block.
const HIDE_RULE = ".homes-dropdown{display:none!important}";

const files = readdirSync(PUB).filter(f => f.endsWith(".html"));
let count = 0;

for (const f of files) {
  const path = join(PUB, f);
  let html = readFileSync(path, "utf8");
  const before = html;

  // Replace any of the old patterns with the new tagged pattern
  for (const pat of OLD_PATTERNS) {
    html = html.split(pat).join(NEW_PATTERN);
  }

  // Inject the hide rule inside the first <style> block (just before </style>)
  if (html.includes("homes-dropdown") && !html.includes(HIDE_RULE)) {
    html = html.replace(/(\n)(\}\s*\n\<\/style\>)/, `$1${HIDE_RULE}$2`);
    // Fallback in case the closing pattern doesn't match
    if (!html.includes(HIDE_RULE)) {
      html = html.replace(/<\/style>/, `\n${HIDE_RULE}\n</style>`);
    }
  }

  if (html !== before) {
    writeFileSync(path, html, "utf8");
    count++;
    console.log(`hid Homes tab: ${f}`);
  }
}

console.log(`\nTotal updated: ${count} pages`);
