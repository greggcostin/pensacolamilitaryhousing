// Deepen internal linking site-wide by wrapping the FIRST natural in-body
// mention of each relevant target on each page with a contextual anchor.
//
// Why: every base/community page already mentions related places dozens
// of times in body text but only links via the bulk EXPLORE_V2 footer.
// One contextual in-body link per target is the SEO sweet spot (more
// would over-link; zero leaves authority on the table).
//
// Approach: for each (sourcePath → targetSlugs) pair, search the body
// region (between <main> and <!-- EXPLORE_V2 -->) for natural-prose
// occurrences of the target name, skipping anything already inside an
// <a> tag. Wrap the first hit. Idempotent: skips targets already linked
// in body.
//
// Usage:
//   node scripts/deepen-internal-links.mjs              # apply to all pages
//   node scripts/deepen-internal-links.mjs --preview <slug>   # only this one page
//   node scripts/deepen-internal-links.mjs --dry        # no writes, just report

import { readFileSync, writeFileSync } from "node:fs";

// ─── Source → targets map ────────────────────────────────────────────────
// Each base page links the most-relevant 4-7 communities; each community
// page links its closest base(s). Exact slugs match URL paths.

const COMMUNITY_NAMES = {
  "gulf-breeze": "Gulf Breeze",
  "navarre": "Navarre",
  "pace": "Pace",
  "milton": "Milton",
  "cantonment": "Cantonment",
  "perdido-key": "Perdido Key",
  "east-pensacola-heights": "East Pensacola Heights",
  "east-hill": "East Hill",
  "cordova-park": "Cordova Park",
  "ferry-pass": "Ferry Pass",
  "bellview-myrtle-grove": "Bellview",
  "navy-point-warrington": "Navy Point",
  "niceville": "Niceville",
  "fort-walton-beach": "Fort Walton Beach",
  "destin": "Destin",
  "crestview": "Crestview",
};

const BASE_NAMES = {
  "nas-pensacola": "NAS Pensacola",
  "whiting-field": "Whiting Field",
  "corry-station": "Corry Station",
  "saufley-field": "Saufley Field",
  "hurlburt-field": "Hurlburt Field",
  "eglin-afb": "Eglin AFB",
  "duke-field": "Duke Field",
};

const BASE_LINKS_OUT = {
  "bases/nas-pensacola":   ["gulf-breeze", "pace", "navarre", "cantonment", "perdido-key", "east-hill", "cordova-park", "ferry-pass"],
  "bases/whiting-field":   ["pace", "milton", "navarre", "gulf-breeze"],
  "bases/corry-station":   ["cantonment", "ferry-pass", "bellview-myrtle-grove", "gulf-breeze"],
  "bases/saufley-field":   ["bellview-myrtle-grove", "cantonment", "ferry-pass"],
  "bases/hurlburt-field":  ["navarre", "fort-walton-beach", "niceville", "destin"],
  "bases/eglin-afb":       ["niceville", "fort-walton-beach", "destin", "navarre", "crestview"],
  "bases/duke-field":      ["crestview", "niceville"],
};

const COMMUNITY_LINKS_OUT = {
  "communities/gulf-breeze":            ["nas-pensacola", "corry-station"],
  "communities/navarre":                ["hurlburt-field", "nas-pensacola"],
  "communities/pace":                   ["nas-pensacola", "whiting-field"],
  "communities/milton":                 ["whiting-field"],
  "communities/cantonment":             ["corry-station", "saufley-field", "nas-pensacola"],
  "communities/perdido-key":            ["nas-pensacola"],
  "communities/east-pensacola-heights": ["nas-pensacola"],
  "communities/east-hill":              ["nas-pensacola"],
  "communities/cordova-park":           ["nas-pensacola"],
  "communities/ferry-pass":             ["corry-station", "saufley-field"],
  "communities/bellview-myrtle-grove":  ["saufley-field", "corry-station"],
  "communities/navy-point-warrington":  ["nas-pensacola"],
  "communities/niceville":              ["eglin-afb", "hurlburt-field", "duke-field"],
  "communities/fort-walton-beach":      ["eglin-afb", "hurlburt-field"],
  "communities/destin":                 ["eglin-afb", "hurlburt-field"],
  "communities/crestview":              ["duke-field", "eglin-afb"],
};

// ─── Helpers ─────────────────────────────────────────────────────────────

// Patterns that bracket a natural-prose occurrence of <name>.
function patternsFor(name) {
  return [
    ` ${name},`, ` ${name}.`, ` ${name} `, ` ${name};`, ` ${name}:`, ` ${name})`, ` ${name}?`,
    `(${name},`, `(${name})`,
    `>${name},`, `>${name}.`, `>${name} `, `>${name};`,
  ];
}

// Heuristic: are we inside an <a>...</a> right now? Walk back ~300 chars
// from offset and compare positions of <a and </a>.
function insideAnchor(html, offset) {
  const lookback = html.slice(Math.max(0, offset - 300), offset);
  const lastOpen = lookback.lastIndexOf("<a ");
  const lastClose = lookback.lastIndexOf("</a>");
  return lastOpen > lastClose;
}

// Body region = between first <main and the EXPLORE_V2 footer marker.
function bodyBounds(html) {
  const start = html.indexOf("<main");
  const end = html.indexOf("<!-- EXPLORE_V2");
  if (start < 0 || end < 0 || end <= start) return null;
  return { start, end };
}

function wrapFirstMention(html, name, href) {
  const bounds = bodyBounds(html);
  if (!bounds) return { html, hit: false };
  const { start, end } = bounds;
  for (const pat of patternsFor(name)) {
    let searchFrom = start;
    while (searchFrom < end) {
      const idx = html.indexOf(pat, searchFrom);
      if (idx < 0 || idx >= end) break;
      if (insideAnchor(html, idx + 1)) {
        searchFrom = idx + 1;
        continue;
      }
      // Build replacement: keep the prefix char + wrap name + keep suffix
      const prefix = pat[0];
      const suffix = pat.slice(1 + name.length);
      const replacement = `${prefix}<a href="${href}">${name}</a>${suffix}`;
      return {
        html: html.slice(0, idx) + replacement + html.slice(idx + pat.length),
        hit: true,
      };
    }
  }
  return { html, hit: false };
}

// ─── Main ────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const preview = args.includes("--preview");
const previewSlug = preview ? args[args.indexOf("--preview") + 1] : null;
const dry = args.includes("--dry");

function processFile(sourceKey, targets, kindForTarget) {
  const path = `public/${sourceKey}.html`;
  let html;
  try { html = readFileSync(path, "utf8"); }
  catch { console.log(`  ${path} — not found, skipped`); return; }
  let hits = 0;
  const targetHrefs = targets.map(slug => {
    const isBase = !!BASE_NAMES[slug];
    return {
      slug,
      name: isBase ? BASE_NAMES[slug] : COMMUNITY_NAMES[slug],
      href: isBase ? `/bases/${slug}` : `/communities/${slug}`,
    };
  });
  for (const t of targetHrefs) {
    // Skip if this target href already appears inside the body region —
    // means we already deep-linked it on a prior run.
    const bounds = bodyBounds(html);
    if (bounds && html.slice(bounds.start, bounds.end).includes(`href="${t.href}"`)) continue;
    const result = wrapFirstMention(html, t.name, t.href);
    if (result.hit) { html = result.html; hits++; }
  }
  if (hits > 0 && !dry) writeFileSync(path, html, "utf8");
  console.log(`  ${path} — ${hits} contextual link(s) added`);
}

console.log(preview ? `=== PREVIEW MODE: ${previewSlug} only ===` : "=== Site-wide ===");
console.log(dry ? "(dry run — no writes)\n" : "");

const allMappings = { ...BASE_LINKS_OUT, ...COMMUNITY_LINKS_OUT };
for (const [src, targets] of Object.entries(allMappings)) {
  if (preview && !src.endsWith(previewSlug)) continue;
  processFile(src, targets);
}
