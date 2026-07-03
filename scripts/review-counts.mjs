// Review-count sync tool. The site's Google/Zillow review counts are static
// text; nothing updates them automatically. This script is the deterministic
// half of the weekly "review-count-sync" scheduled task: the agent reads the
// LIVE counts from Google Maps and the Zillow profile (via the browser —
// both platforms bot-wall curl), then calls this to apply them everywhere.
//
// Usage:
//   node scripts/review-counts.mjs --current
//     -> prints {"google":42,"zillow":20} parsed from public/reviews.html
//   node scripts/review-counts.mjs --set-google 43 --set-zillow 21
//     -> rewrites every count reference repo-wide, prints a change report
//   Add --force to allow DECREASING a count (normally refused: a drop means
//   a review was removed and Gregg should confirm before the site changes).
//
// Exit codes: 0 ok/no-op, 1 bad usage, 2 decrease refused, 3 parse failure.

import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";

const REVIEWS = "public/reviews.html";

function currentCounts() {
  const h = readFileSync(REVIEWS, "utf8");
  const g = h.match(/"reviewCount":\s*"(\d+)"/);
  const g2 = h.match(/(\d+) Google Reviews/i);
  const z = h.match(/(\d+) Zillow Reviews/i);
  if (!g || !z) { console.error("PARSE FAILURE: count patterns not found in " + REVIEWS); process.exit(3); }
  if (g2 && g2[1] !== g[1]) console.error(`WARNING: schema reviewCount ${g[1]} != visible "${g2[1]} Google Reviews" — fix manually`);
  return { google: Number(g[1]), zillow: Number(z[1]) };
}

function walk(dir, out = []) {
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    if (f.name === "node_modules" || f.name === ".git" || f.name === "dist") continue;
    const p = `${dir}/${f.name}`;
    if (f.isDirectory()) walk(p, out);
    else if (/\.(html|txt|md|jsx)$/.test(f.name)) out.push(p);
  }
  return out;
}

const args = process.argv.slice(2);
const flag = (n) => { const i = args.indexOf(n); return i > -1 ? args[i + 1] : null; };

if (args.includes("--current")) {
  console.log(JSON.stringify(currentCounts()));
  process.exit(0);
}

const newG = flag("--set-google") ? Number(flag("--set-google")) : null;
const newZ = flag("--set-zillow") ? Number(flag("--set-zillow")) : null;
if (newG === null && newZ === null) {
  console.error("usage: --current | --set-google N --set-zillow N [--force]");
  process.exit(1);
}

const cur = currentCounts();
const jobs = [];
if (newG !== null && newG !== cur.google) jobs.push({ platform: "Google", from: cur.google, to: newG });
if (newZ !== null && newZ !== cur.zillow) jobs.push({ platform: "Zillow", from: cur.zillow, to: newZ });

if (!jobs.length) { console.log("IN SYNC — no changes needed", JSON.stringify(cur)); process.exit(0); }

for (const j of jobs) {
  if (j.to < j.from && !args.includes("--force")) {
    console.error(`REFUSED: ${j.platform} would DECREASE ${j.from} -> ${j.to}. A drop usually means a review was removed — confirm with Gregg, then re-run with --force.`);
    process.exit(2);
  }
}

// Count phrases as they appear across the repo. {n} is the current number.
const PATTERNS = {
  Google: [
    "{n} five-star Google reviews",
    "{n} Google reviews",
    "{n} Google Reviews",
    "Read All {n} Reviews on Google",
    '"reviewCount": "{n}"',
    '"reviewCount":"{n}"',
    "5.0 stars from {n} reviews",
    "5.0-star Google rating from {n} verified reviews",
    "{n} verified Google reviews",
  ],
  Zillow: [
    "{n} Zillow reviews",
    "{n} Zillow Reviews",
    "Read All {n} Reviews on Zillow",
    "& {n} Zillow",
  ],
};

const files = [...walk("public"), "index.html", "MARKETING_KIT.md", "AGGREGATOR_PROFILES.md", "src/App.jsx"].filter(existsSync);
let totalSubs = 0;
const report = [];

for (const file of files) {
  let text = readFileSync(file, "utf8");
  let fileSubs = 0;
  for (const j of jobs) {
    for (const pat of PATTERNS[j.platform]) {
      const from = pat.replaceAll("{n}", String(j.from));
      const to = pat.replaceAll("{n}", String(j.to));
      const n = text.split(from).length - 1;
      if (n > 0) { text = text.replaceAll(from, to); fileSubs += n; }
    }
  }
  if (fileSubs) { writeFileSync(file, text); totalSubs += fileSubs; report.push(`${file}: ${fileSubs}`); }
}

for (const j of jobs) console.log(`${j.platform}: ${j.from} -> ${j.to}`);
console.log(`substitutions: ${totalSubs}`);
report.forEach((r) => console.log("  " + r));
console.log("verify:", JSON.stringify(currentCounts()));
