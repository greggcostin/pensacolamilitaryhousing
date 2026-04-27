// Submit the canonical sitemap URLs to IndexNow so Bing, Yandex, DuckDuckGo,
// Naver, and Seznam re-crawl quickly. IndexNow is a free, open protocol —
// one POST hits all participating engines at once.
//
// Run after deploys: `node scripts/submit-indexnow.mjs`
// Or wire into your build/CI to fire automatically on every push to main.

import { readFileSync } from "node:fs";

const HOST = "pensacolamilitaryhousing.com";
const KEY = "a1a4a0be0196a455ad3c188805e7d969";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const ENDPOINT = "https://api.indexnow.org/IndexNow";

const sitemap = readFileSync("public/sitemap.xml", "utf8");
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map(m => m[1])
  .filter(u => u.startsWith(`https://${HOST}`));

console.log(`Submitting ${urlList.length} URLs to IndexNow...`);

const body = {
  host: HOST,
  key: KEY,
  keyLocation: KEY_LOCATION,
  urlList,
};

const r = await fetch(ENDPOINT, {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify(body),
});

// IndexNow returns 200 (success) or 202 (received, processing) — both fine.
// 4xx means the key file isn't reachable yet; deploy first, then re-run.
if (r.status === 200 || r.status === 202) {
  console.log(`✓ IndexNow accepted: HTTP ${r.status}`);
} else {
  const text = await r.text().catch(() => "");
  console.error(`✗ IndexNow returned HTTP ${r.status}: ${text.slice(0, 200)}`);
  console.error(`  If this is your first run, the key file at ${KEY_LOCATION} may not be deployed yet.`);
  process.exit(1);
}
