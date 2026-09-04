// Submit canonical sitemap URLs (or a given list) to two re-crawl APIs, for EITHER site:
//   1. IndexNow  — free open protocol; pings Bing, Yandex, DuckDuckGo, Naver, Seznam in one POST
//   2. Bing Webmaster URL Submission API (when BING_WEBMASTER_API_KEY is set in .env.local)
//
//   node --env-file=.env.local scripts/submit-indexnow.mjs                 # military site, whole sitemap
//   node --env-file=.env.local scripts/submit-indexnow.mjs --site gc       # greggcostin.com, whole sitemap
//   node --env-file=.env.local scripts/submit-indexnow.mjs --site gc --urls https://greggcostin.com/blog/x,https://greggcostin.com/blog
//   Or `npm run indexnow` (package.json wires the env-file flag; append -- --site gc).
//
// greggcostin.com had zero pages in Bing Webmaster on 2026-09-04 while the military site had
// 53, so the civilian engine runs this after every publish until Bing shows the domain.
import { readFileSync } from "node:fs";

const SITES = {
  pmh: { host: "pensacolamilitaryhousing.com", key: "a1a4a0be0196a455ad3c188805e7d969", sitemap: "public/sitemap.xml" },
  gc: { host: "greggcostin.com", key: "0b7ab9f744b3fe4bdf786411b9cd0866", sitemap: "civilian-site/sitemap.xml" },
};
const args = process.argv.slice(2);
const siteKey = args.includes("--site") ? args[args.indexOf("--site") + 1] : "pmh";
const site = SITES[siteKey];
if (!site) { console.error(`unknown --site "${siteKey}" (pmh|gc)`); process.exit(2); }
const HOST = site.host;
const KEY = site.key;
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const INDEXNOW = "https://api.indexnow.org/IndexNow";
const BING_API = "https://ssl.bing.com/webmaster/api.svc/json/SubmitUrlBatch";
const BING_KEY = process.env.BING_WEBMASTER_API_KEY;

let urlList;
if (args.includes("--urls")) {
  urlList = args[args.indexOf("--urls") + 1].split(",").map((u) => u.trim()).filter((u) => u.startsWith(`https://${HOST}`));
  console.log(`Submitting ${urlList.length} given URL(s) for ${HOST}.\n`);
} else {
  const sitemap = readFileSync(site.sitemap, "utf8");
  urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).filter((u) => u.startsWith(`https://${HOST}`));
  console.log(`Loaded ${urlList.length} URLs from ${site.sitemap} for ${HOST}.\n`);
}
if (!urlList.length) { console.error("nothing to submit"); process.exit(1); }

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
  // Established sites get 10,000 URLs/day; a newly verified site (greggcostin.com, Sep 2026) gets
  // 100. Submit money pages first (blog, resources, core pages; templated school pages last) and,
  // when Bing answers with its remaining quota, resubmit exactly that many.
  const rank = (u) => (/\/schools\//.test(u) ? 3 : /\/(privacy|accessibility|404)/.test(u) ? 2 : /\/(blog|resources|neighborhoods)\//.test(u) ? 0 : 1);
  const ordered = [...urlList].sort((a, b) => rank(a) - rank(b));
  const submit = async (list) => {
    const r = await fetch(`${BING_API}?apikey=${BING_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ siteUrl: `https://${HOST}`, urlList: list }),
    });
    const data = await r.json().catch(() => ({}));
    return { ok: r.ok && data?.d === null, status: r.status, data };
  };
  let res = await submit(ordered);
  if (!res.ok) {
    const m = /Quota remaining for today:\s*(\d+)/i.exec(JSON.stringify(res.data));
    if (m && +m[1] > 0 && +m[1] < ordered.length) {
      console.log(`  quota ${m[1]}/day: resubmitting the ${m[1]} highest-priority URLs`);
      res = await submit(ordered.slice(0, +m[1]));
    }
  }
  if (res.ok) console.log(`  ✓ accepted (HTTP ${res.status})\n`);
  else console.error(`  ✗ HTTP ${res.status}: ${JSON.stringify(res.data).slice(0, 300)}\n`);
} else {
  console.log("→ Bing Webmaster API skipped (BING_WEBMASTER_API_KEY not set)\n");
}

console.log("Done.");
