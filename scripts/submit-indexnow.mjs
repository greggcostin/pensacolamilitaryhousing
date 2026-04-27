// Submit canonical sitemap URLs to two re-crawl APIs:
//   1. IndexNow  — free open protocol; pings Bing, Yandex, DuckDuckGo, Naver, Seznam in one POST
//   2. Bing Webmaster URL Submission API (when BING_WEBMASTER_API_KEY is set in .env.local)
//
// Run after deploys: `node --env-file=.env.local scripts/submit-indexnow.mjs`
// Or just `npm run indexnow` (package.json wires the env-file flag).

import { readFileSync } from "node:fs";

const HOST = "pensacolamilitaryhousing.com";
const KEY = "a1a4a0be0196a455ad3c188805e7d969";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const INDEXNOW = "https://api.indexnow.org/IndexNow";
const BING_API = "https://ssl.bing.com/webmaster/api.svc/json/SubmitUrlBatch";
const BING_KEY = process.env.BING_WEBMASTER_API_KEY;

const sitemap = readFileSync("public/sitemap.xml", "utf8");
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map(m => m[1])
  .filter(u => u.startsWith(`https://${HOST}`));

console.log(`Loaded ${urlList.length} URLs from sitemap.\n`);

// ─── 1. IndexNow ─────────────────────────────────────────────────────────
{
  console.log("→ IndexNow (Bing + Yandex + DuckDuckGo + Naver + Seznam)");
  const r = await fetch(INDEXNOW, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList }),
  });
  if (r.status === 200 || r.status === 202) {
    console.log(`  ✓ accepted (HTTP ${r.status})\n`);
  } else {
    const text = await r.text().catch(() => "");
    console.error(`  ✗ HTTP ${r.status}: ${text.slice(0, 200)}`);
    console.error(`  If first run, the key file at ${KEY_LOCATION} may not be deployed yet.\n`);
  }
}

// ─── 2. Bing direct (only if key available) ───────────────────────────────
if (BING_KEY) {
  console.log("→ Bing Webmaster URL Submission API (direct)");
  // Bing's quota is 10,000 URLs/day for verified sites — plenty for our ~64.
  const r = await fetch(`${BING_API}?apikey=${BING_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ siteUrl: `https://${HOST}`, urlList }),
  });
  const data = await r.json().catch(() => ({}));
  if (r.ok && data?.d === null) {
    console.log(`  ✓ accepted (HTTP ${r.status})\n`);
  } else {
    console.error(`  ✗ HTTP ${r.status}: ${JSON.stringify(data).slice(0, 300)}\n`);
  }
} else {
  console.log("→ Bing Webmaster API skipped (BING_WEBMASTER_API_KEY not set)\n");
}

console.log("Done.");
