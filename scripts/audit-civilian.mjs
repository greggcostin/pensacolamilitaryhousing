// SEO / schema / content audit for civilian-site (greggcostin.com).
// Run before every deploy: node scripts/audit-civilian.mjs
// Exit code 1 on any finding, 0 when clean. Add checks here as standards evolve —
// this file is the quality gate for the civilian site the same way blog-factory's
// gates protect the blog.
import { readFileSync, readdirSync, existsSync } from "node:fs";

const ROOT = "civilian-site";
const SITE = "https://greggcostin.com";
const findings = [];
const f = (page, msg) => findings.push(`${page}: ${msg}`);
let LEDGER = {};
try { LEDGER = JSON.parse(readFileSync("content/blog/image-credits.json", "utf8")).images; } catch {}

const pages = readdirSync(ROOT).filter((x) => x.endsWith(".html") && x !== "404.html");
for (const sub of ["blog", "resources", "schools"]) {
  if (existsSync(`${ROOT}/${sub}`)) pages.push(...readdirSync(`${ROOT}/${sub}`).filter((x) => x.endsWith(".html")).map((x) => `${sub}/${x}`));
}
const slugOf = (file) => (file === "index.html" ? "/" : "/" + file.replace(".html", ""));
const titles = new Map(), descs = new Map();

for (const file of pages) {
  const h = readFileSync(`${ROOT}/${file}`, "utf8");
  const slug = slugOf(file);
  const url = SITE + (slug === "/" ? "/" : slug);

  /* ---------- head ---------- */
  const title = (h.match(/<title>([^<]*)<\/title>/) || [])[1];
  if (!title) f(file, "missing <title>");
  else {
    if (title.length > 65) f(file, `title ${title.length} chars (>65)`);
    if (titles.has(title)) f(file, `duplicate title with ${titles.get(title)}`);
    titles.set(title, file);
  }
  const desc = (h.match(/<meta name="description" content="([^"]*)"/) || [])[1];
  if (!desc) f(file, "missing meta description");
  else {
    if (desc.length < 120 || desc.length > 165) f(file, `description ${desc.length} chars (want 120-165)`);
    if (descs.has(desc)) f(file, `duplicate description with ${descs.get(desc)}`);
    descs.set(desc, file);
  }
  const canon = (h.match(/<link rel="canonical" href="([^"]*)">/) || [])[1];
  if (canon !== url) f(file, `canonical "${canon}" != expected "${url}"`);
  if (!h.includes(`hreflang="en-US" href="${canon}"`)) f(file, "missing en-US hreflang");
  if (!h.includes('hreflang="x-default"')) f(file, "missing x-default hreflang");
  for (const tag of ['property="og:title"', 'property="og:description"', 'property="og:image"', 'property="og:url"', 'property="og:locale"', 'property="og:site_name"', 'name="twitter:card"', 'name="twitter:image"']) {
    if (!h.includes(tag)) f(file, `missing ${tag}`);
  }
  const ogUrl = (h.match(/<meta property="og:url" content="([^"]*)">/) || [])[1];
  if (ogUrl !== canon) f(file, `og:url "${ogUrl}" != canonical`);
  const ogImg = (h.match(/<meta property="og:image" content="([^"]*)"/) || [])[1] || "";
  if (!ogImg.startsWith(SITE + "/og/")) f(file, `og:image not a branded per-page card: ${ogImg}`);
  else if (!existsSync(`${ROOT}/og/${ogImg.split("/og/")[1]}`)) f(file, `og image file missing: ${ogImg}`);
  if (!h.includes('rel="icon"')) f(file, "missing favicon");
  for (const tag of ['name="twitter:title"', 'name="twitter:description"', 'name="twitter:url"', 'rel="apple-touch-icon"', 'rel="manifest"', 'name="theme-color"', 'name="ICBM"']) {
    if (!h.includes(tag)) f(file, `missing ${tag}`);
  }
  if (!h.includes("max-video-preview:-1")) f(file, "robots meta missing max-video-preview:-1");
  if (["buy.html", "sell.html"].includes(file) && !h.includes('"@type":"Service"')) f(file, "service page missing Service schema");
  if (!h.includes('name="robots" content="index,follow')) f(file, "missing robots meta");
  if (!h.includes(".pages.dev'")) f(file, "missing pages.dev canonical-redirect snippet");

  /* ---------- schema ---------- */
  const blocks = [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  const parsed = [];
  for (const b of blocks) {
    try { parsed.push(JSON.parse(b)); } catch (e) { f(file, `invalid JSON-LD: ${e.message.slice(0, 60)}`); }
  }
  const types = parsed.map((p) => p["@type"]);
  if (file === "index.html") {
    for (const t of ["WebSite", "RealEstateAgent", "Person", "FAQPage"]) if (!types.includes(t)) f(file, `index missing ${t} schema`);
  } else {
    if (!types.includes("BreadcrumbList")) f(file, "missing BreadcrumbList");
    if (!parsed.some((p) => JSON.stringify(p).includes('"@id":"https://greggcostin.com/#team"'))) f(file, "schema not wired to #team entity");
    const wp = parsed.find((p) => ["WebPage", "AboutPage", "ContactPage", "CollectionPage", "Blog", "Article"].includes(p["@type"]));
    if (!wp) f(file, "missing WebPage-type schema");
    else if (!wp.dateModified && !wp.datePublished && wp["@type"] !== "Blog") f(file, "WebPage schema missing dateModified");
  }
  if (file === "team.html" && !types.includes("Person")) f(file, "team page missing Person schema");
  // FAQPage answers must mirror visible <details> text
  const faq = parsed.find((p) => p["@type"] === "FAQPage");
  if (faq) {
    for (const q of faq.mainEntity) {
      const qEsc = q.name.replace(/&/g, "&amp;").replace(/'/g, "'");
      if (!h.includes(q.name) && !h.includes(qEsc)) f(file, `FAQ question not in visible HTML: "${q.name.slice(0, 40)}..."`);
    }
  }

  /* ---------- content ---------- */
  const h1s = (h.match(/<h1[\s>]/g) || []).length;
  if (h1s !== 1) f(file, `${h1s} h1 elements (want exactly 1)`);
  const body = h.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<style[\s\S]*?<\/style>/g, "");
  const words = (body.replace(/<[^>]+>/g, " ").match(/\S+/g) || []).length;
  if (words < 250) f(file, `thin content: ${words} words`);
  for (const m of body.matchAll(/<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/g)) {
    if (/class="[^"]*testimony/.test(m[0])) continue; // quoted personal statements run long by design (Gregg, Aug 2026)
    const w = (m[1].replace(/<[^>]+>/g, " ").match(/\S+/g) || []).length;
    if (w > 85) f(file, `wall of text: ${w}-word paragraph ("${m[1].replace(/<[^>]+>/g, "").trim().slice(0, 40)}...")`);
  }
  const stripped = h.replace(/PCS \/ Relocation — (Buying|Selling)/g, "");
  if (stripped.includes("—")) f(file, "em dash outside worker inquiryType string");
  const dOpen = (h.match(/<div\b/g) || []).length, dClose = (h.match(/<\/div>/g) || []).length;
  if (dOpen !== dClose) f(file, `div imbalance ${dOpen}/${dClose}`);

  /* ---------- links + images ---------- */
  for (const m of h.matchAll(/href="(\/[^"#]*)"/g)) {
    const p = m[1];
    if (p.startsWith("/images/") || p.startsWith("/og/")) { if (!existsSync(ROOT + p)) f(file, `broken asset link ${p}`); continue; }
    if ([".xml", ".txt", ".webmanifest", ".json", ".png"].some((e) => p.endsWith(e))) { if (!existsSync(ROOT + p)) f(file, `broken file link ${p}`); continue; }
    const target = p === "/" ? "index.html" : p.slice(1) + ".html";
    if (p === "/about") continue; // _redirects alias
    if (!existsSync(`${ROOT}/${target}`)) f(file, `broken internal link ${p}`);
  }
  for (const m of h.matchAll(/<img([^>]*)>/g)) {
    const attrs = m[1];
    if (!/alt="[^"]+"/.test(attrs)) f(file, `img missing alt: ${attrs.slice(0, 60)}`);
    if (!/width=/.test(attrs) || !/height=/.test(attrs)) f(file, `img missing width/height: ${(attrs.match(/src="([^"]*)"/) || [])[1]}`);
    const src = (attrs.match(/src="([^"]*)"/) || [])[1] || "";
    if (src.startsWith("/") && !existsSync(ROOT + src)) f(file, `img file missing: ${src}`);
  }
  // Credit-required images must carry a visible credit. Exempt: OWNED images
  // (team portraits, our own photography) and ledger entries with creditRequired=false (PD/CC0).
  const OWNED_IMAGES = ["nichole-sims", "rachel-ley", "cordova-park"];
  for (const m of h.matchAll(/<img[^>]*src="\/images\/([^"]+)\.jpg"[^>]*>/g)) {
    if (OWNED_IMAGES.includes(m[1])) continue;
    const entry = LEDGER[`civilian-site/images/${m[1]}.jpg`];
    if (entry && entry.creditRequired === false) continue;
    // A page-level consolidated credits block (data-photo-credits="name1 name2 ...") satisfies attribution
    if (new RegExp(`data-photo-credits="[^"]*\\b${m[1]}\\b`).test(h)) continue;
    const consolidated = new RegExp(`data-photo-credits="[^"]*${m[1]}`).test(h);
    const fig = h.slice(h.indexOf(m[0]), h.indexOf(m[0]) + 1200);
    if (!consolidated && !/Photo:/.test(fig)) f(file, `credit-required image without figcaption credit: ${m[1]}`);
  }

  /* ---------- form contract ---------- */
  if (h.includes("inquiryType")) {
    for (const opt of ["First-Time Home Buyer", "Selling My Home", "Investment Property", "General Question"]) {
      if (!h.includes(`<option`) || !h.includes(opt)) f(file, `form missing worker-contract option "${opt}"`);
    }
    if (!h.includes("PCS / Relocation — Buying")) f(file, "form missing exact PCS inquiryType string (em dash required)");
    if (!h.includes('name="website"')) f(file, "form missing honeypot field");
    if (!h.includes("costin-contact.gregg-costin.workers.dev")) f(file, "form not posting to contact worker");
  }
}

/* ---------- site-level ---------- */
const sm = readFileSync(`${ROOT}/sitemap.xml`, "utf8");
const smUrls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
for (const file of pages) {
  const expect = SITE + slugOf(file);
  if (!smUrls.includes(expect)) f("sitemap.xml", `missing ${expect}`);
}
for (const u of smUrls) {
  const file = u === SITE + "/" ? "index.html" : u.replace(SITE + "/", "") + ".html";
  if (!existsSync(`${ROOT}/${file}`)) f("sitemap.xml", `lists nonexistent page ${u}`);
}
const robots = readFileSync(`${ROOT}/robots.txt`, "utf8");
if (!robots.includes("Sitemap: " + SITE + "/sitemap.xml")) f("robots.txt", "missing sitemap reference");
for (const bot of ["GPTBot", "ClaudeBot", "PerplexityBot", "Bingbot", "Google-Extended"]) {
  if (!robots.includes(bot)) f("robots.txt", `missing explicit ${bot} welcome`);
}
if (!existsSync(`${ROOT}/_headers`)) f("_headers", "missing security headers file");
else if (!readFileSync(`${ROOT}/_headers`, "utf8").includes("Strict-Transport-Security")) f("_headers", "missing HSTS");
if (!existsSync(`${ROOT}/site.webmanifest`)) f("site.webmanifest", "missing");
for (const bot of ["Applebot", "Amazonbot", "Meta-ExternalAgent", "Claude-SearchBot", "Perplexity-User"]) {
  if (!robots.includes(`User-agent: ${bot}`)) f("robots.txt", `missing explicit ${bot} welcome`);
}
if (!readFileSync(`${ROOT}/llms.txt`, "utf8").includes("Q140446886")) f("llms.txt", "missing Wikidata entity line");
if (!existsSync(`${ROOT}/llms.txt`)) f("llms.txt", "missing");
if (!existsSync(`${ROOT}/llms-full.txt`)) f("llms-full.txt", "missing");
if (!existsSync(`${ROOT}/404.html`)) f("404.html", "missing");
else if (!readFileSync(`${ROOT}/404.html`, "utf8").includes('name="robots" content="noindex"')) f("404.html", "not noindexed");
const keyFiles = readdirSync(ROOT).filter((x) => /^[0-9a-f]{32}\.txt$/.test(x));
if (keyFiles.length !== 1) f("indexnow", `expected exactly 1 IndexNow key file, found ${keyFiles.length}`);

/* ---------- report ---------- */
if (findings.length) {
  console.log(`AUDIT: ${findings.length} finding(s)\n` + findings.map((x) => "  - " + x).join("\n"));
  process.exit(1);
} else {
  console.log(`AUDIT CLEAN: ${pages.length} pages, 0 findings`);
}
