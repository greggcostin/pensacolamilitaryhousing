// Quality gate for the MILITARY site (pensacolamilitaryhousing.com), the twin of audit-civilian.mjs
// (audit 2026-09-02, og-02: 101 hand-maintained PMH pages had no gate, so a skipped og-images step or
// a head edit could ship a 404ing share card or drop a canonical unseen). Walks index.html + every
// public/**/*.html (404.html excluded) and exits 1 on any finding. Runs in `npm run build` (prebuild)
// and in the blog-engine STEP 5.
//   node scripts/audit-military.mjs
import { readdirSync, readFileSync, existsSync } from "node:fs";
import sharp from "sharp";
import { ROUTE_META } from "../src/routeMeta.js";
import { analyticsGuardFindings } from "./analytics-host-guard.mjs";

const SITE = "https://pensacolamilitaryhousing.com";
const findings = [];
const f = (page, msg) => findings.push(`${page}: ${msg}`);

function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = `${dir}/${e.name}`;
    if (e.isDirectory()) { if (!["og", "images", "pagefind"].includes(e.name)) walk(p, out); }
    else if (e.name.endsWith(".html") && e.name !== "404.html") out.push(p);
  }
  return out;
}
const files = ["index.html", ...walk("public")];
const slugOf = (file) => file === "index.html" ? "/" : "/" + file.replace(/^public\//, "").replace(/\.html$/, "");
const decode = (s) => s == null ? s : s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
function metas(html, key) {
  const out = [];
  for (const m of html.matchAll(/<meta\b[^>]*>/gi)) {
    const k = m[0].match(/\b(?:property|name)\s*=\s*"([^"]+)"/i);
    if (!k || k[1].toLowerCase() !== key.toLowerCase()) continue;
    const c = m[0].match(/\bcontent\s*=\s*"([^"]*)"/i);
    out.push(c ? c[1] : "");
  }
  return out;
}
function links(html, rel) {
  const out = [];
  for (const m of html.matchAll(/<link\b[^>]*>/gi)) {
    const r = m[0].match(/\brel\s*=\s*"([^"]+)"/i);
    if (!r || r[1].toLowerCase() !== rel) continue;
    out.push({ href: (m[0].match(/\bhref\s*=\s*"([^"]*)"/i) || [])[1], hreflang: (m[0].match(/\bhreflang\s*=\s*"([^"]*)"/i) || [])[1] });
  }
  return out;
}
const visibleText = (html) => html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
// 10b (mil-02-waitclaim): no unsourced on-base waiting-time duration. No housing partner (Balfour Beatty, Corvias, Lendlease)
// publishes wait times, so a sentence pairing wait-list wording with a concrete week/month/year figure is fabricated.
// Pipeline/course/tour lengths ("students are here 6-18 months") carry no wait noun and are not flagged.
const WAIT_NOUN = /\b(?:wait ?lists?|waiting lists?|wait ?times?|waits|the wait)\b/i, WAIT_DUR = /\b\d+\s*(?:\+|\s*(?:to|-|–)\s*\d+)?\s*(?:week|month|year)s?\b/i, WAIT_CTX = /\b(?:on-base|on base|housing|Balfour|Lendlease|Corvias|bedroom|pay grade|ranks?|quarters|barracks)\b/i;
const ldStrings = (html) => { const out = []; const walkV = (v) => { if (typeof v === "string") out.push(v); else if (Array.isArray(v)) v.forEach(walkV); else if (v && typeof v === "object") Object.values(v).forEach(walkV); }; for (const m of html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) { try { walkV(JSON.parse(m[1])); } catch {} } return out; };

// ---- sitemap + og inventory ----
const sitemap = readFileSync("public/sitemap.xml", "utf8");
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const locSet = new Set(locs);
const shellSlugs = new Set(ROUTE_META.filter((r) => r.shell).map((r) => SITE + r.slug));
const ogFiles = readdirSync("public/og").filter((x) => x.endsWith(".png"));
const referencedOg = new Set();
const seenTitles = new Map(), seenDescs = new Map();
const REQUIRED_META = ["og:title", "og:description", "og:image", "og:image:width", "og:image:height", "og:type", "og:url", "og:site_name", "og:locale", "twitter:card", "twitter:image", "twitter:title", "twitter:description", "description", "robots"];

for (const file of files) {
  const html = readFileSync(file, "utf8");
  for (const issue of analyticsGuardFindings(html)) f(file, issue);
  const slug = slugOf(file);
  const canonExpected = SITE + slug;
  const page = file;

  // 1. title + description
  const title = decode((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1]?.trim());
  if (!title) f(page, "missing <title>"); else {
    if (title.length > 70) f(page, `title ${title.length} chars (max 70)`);
    if (seenTitles.has(title)) f(page, `duplicate title (also ${seenTitles.get(title)})`); else seenTitles.set(title, page);
  }
  const desc = decode(metas(html, "description")[0]);
  if (!desc) f(page, "missing meta description"); else {
    if (desc.length < 50 || desc.length > 165) f(page, `description ${desc.length} chars (50-165)`);
    if (seenDescs.has(desc)) f(page, `duplicate description (also ${seenDescs.get(desc)})`); else seenDescs.set(desc, page);
  }
  // 2. canonical + hreflang
  const canon = links(html, "canonical");
  if (canon.length !== 1) f(page, `${canon.length} canonical links`);
  const c0 = canon[0]?.href;
  if (c0 && c0 !== canonExpected) f(page, `canonical ${c0} is not ${canonExpected}`);
  const alts = links(html, "alternate").filter((a) => a.hreflang);
  for (const need of ["en-US", "x-default"]) if (!alts.some((a) => a.hreflang === need)) f(page, `missing hreflang ${need}`);
  for (const a of alts) if (c0 && a.href !== c0) f(page, `hreflang ${a.hreflang} points at ${a.href}, not the canonical`);
  // 3. required meta, single copy each
  for (const k of REQUIRED_META) {
    const all = metas(html, k);
    if (all.length === 0) f(page, `missing ${k}`);
    else if (all.length > 1 && k !== "og:image") f(page, `${k} appears ${all.length} times`);
  }
  const robots = metas(html, "robots")[0] || "";
  if (/noindex/i.test(robots)) f(page, `robots noindex (${robots})`);
  const ogUrl = metas(html, "og:url")[0];
  if (ogUrl && c0 && ogUrl !== c0) f(page, `og:url ${ogUrl} differs from canonical`);
  const ogType = metas(html, "og:type")[0];
  if (!["website", "article"].includes(ogType || "")) f(page, `og:type "${ogType}"`);
  const pub = metas(html, "article:published_time")[0], mod = metas(html, "article:modified_time")[0];
  if (ogType === "article" && (!pub || !mod)) f(page, "article without published/modified times");
  if (pub && mod && mod < pub) f(page, `modified_time ${mod} before published_time ${pub}`);
  if (metas(html, "og:image:width")[0] !== "1200" || metas(html, "og:image:height")[0] !== "630") f(page, "og:image dimensions meta is not 1200x630");
  if (metas(html, "twitter:card")[0] !== "summary_large_image") f(page, "twitter:card is not summary_large_image");
  // 4. share card: absolute, exists, 1200x630, page-specific; twitter:image = og:image
  const ogImage = metas(html, "og:image")[0], twImage = metas(html, "twitter:image")[0];
  if (twImage && ogImage && twImage !== ogImage) f(page, "twitter:image differs from og:image");
  if (ogImage) {
    if (!ogImage.startsWith(SITE + "/")) f(page, `og:image not on ${SITE}: ${ogImage}`);
    else {
      const rel = ogImage.slice(SITE.length), local = "public" + rel;
      if (!existsSync(local)) f(page, `og:image file missing: ${rel}`);
      else {
        const m = await sharp(local).metadata();
        if (m.width !== 1200 || m.height !== 630) f(page, `og:image ${rel} is ${m.width}x${m.height}, not 1200x630`);
        if (rel.startsWith("/og/")) referencedOg.add(rel.slice(4));
      }
      const expected = file === "index.html" ? "home.png" : slug.slice(1).replace(/\//g, "-") + ".png";
      if (!ogImage.endsWith("/og/" + expected)) f(page, `og:image is not the page-specific card /og/${expected}`);
    }
  }
  // 5. sitemap membership
  if (!locSet.has(canonExpected)) f(page, "not in sitemap.xml");
  // 6. body structure
  const h1s = (html.match(/<h1\b/gi) || []).length;
  if (h1s !== 1) f(page, `${h1s} <h1> elements`);
  const words = (visibleText(html).match(/\S+/g) || []).length;
  if (words < 400) f(page, `only ${words} words`);
  // 7. JSON-LD parses; shared entity present; retired ids absent; Wikidata purge
  let blocks = 0;
  for (const m of html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    blocks++;
    try {
      const node = JSON.parse(m[1]);
      if (file.startsWith('public/blog/') && node['@type'] === 'BlogPosting') {
        if (node.keywords !== decode(metas(html, 'keywords')[0])) f(page, 'BlogPosting keywords differ from article metadata');
        const fragmentPath = file.replace('public/blog/', 'content/blog/').replace(/\.html$/, '.fragment.html');
        const fragment = readFileSync(fragmentPath, 'utf8').match(/<!--PAGE\s*([\s\S]*?)\s*PAGE-->/);
        const figure = fragment && JSON.parse(fragment[1]).figure;
        if (!figure?.src || node.image !== new URL(figure.src, SITE).href) f(page, 'BlogPosting image differs from the article figure');
      }
    } catch (e) { f(page, `invalid schema or article metadata: ${e.message.slice(0, 100)}`); }
  }
  if (!blocks) f(page, "no JSON-LD");
  if (!html.includes("https://greggcostin.com/#team")) f(page, "no reference to the shared business entity");
  for (const old of ["pensacolamilitaryhousing.com/#agent\"", "/#person-gregg", "/#localbusiness", "Q140446886", "RealEstateOrganization"]) if (html.includes(old)) f(page, `retired identifier ${old}`);
  // 8. sitewide furniture that every static page must carry
  if (file !== "index.html") {
    if (!html.includes("data-costin-sites")) f(page, "missing the cross-site family line (data-costin-sites)");
    if (!/class="nav-toggle"|id="site-drawer"/.test(html)) f(page, "missing the mobile drawer");
    if (!/href="\/privacy"/.test(html)) f(page, "footer lacks /privacy link");
    if (/<form\b/.test(html) && !/_gotcha|name="honeypot"/.test(html)) f(page, "inquiry form lacks the honeypot field");
    if (!/pages\.dev/.test(html)) f(page, "missing the pages.dev canonical-redirect snippet");
  }
  // 9. responsive images: no content <img> without width/height; no <source> without type
  for (const m of html.matchAll(/<img\b[^>]*>/g)) if (!/width="/.test(m[0]) || !/height="/.test(m[0])) { f(page, `img without width/height: ${(m[0].match(/src="([^"]+)"/) || [])[1]}`); break; }
  // 9b. mob-03: every table sits in a horizontally scrolling wrapper (bare tables clip at 320px)
  for (const m of html.matchAll(/<table\b/g)) {
    const prefix = html.slice(Math.max(0, m.index - 140), m.index);
    if (!/class="(?:bah-wrap|tbl-scroll|table-wrap|calc-table-wrap|rate-table-wrap)[^"]*"[^<]*$|overflow(?:-x)?:\s*auto[^<]*$/.test(prefix)) { f(page, "bare <table> without a scrolling wrapper (run scripts/wrap-tables.mjs)"); break; }
  }
  // 10. unresolved template placeholders / merge junk
  for (const junk of ["{{", "__ENTITY_DROP__", "<<<<<<<", "TODO:", "lorem ipsum"]) if (html.includes(junk)) f(page, `contains "${junk}"`);
  waitscan: for (const t of [visibleText(html), ...metas(html, "description"), ...metas(html, "og:description"), ...metas(html, "twitter:description"), ...ldStrings(html)]) for (const s of t.split(/(?<=[.!?;])\s+/)) if (WAIT_NOUN.test(s) && WAIT_DUR.test(s) && WAIT_CTX.test(s)) { f(page, `unsourced on-base wait duration (no housing partner publishes wait times): "${s.trim().slice(0, 110)}"`); break waitscan; }
}

// ---- cross-page checks ----
for (const loc of locs) {
  if (/\.(txt|xml|pdf)$/.test(loc)) continue;
  const rel = loc.replace(SITE, "");
  const file = rel === "/" ? "index.html" : `public${rel}.html`;
  if (!existsSync(file) && !shellSlugs.has(loc)) f("sitemap.xml", `<loc> ${loc} has no page file and no SPA shell`);
}
for (const s of shellSlugs) if (!locSet.has(s)) f("sitemap.xml", `SPA shell ${s} missing from sitemap`);
for (const og of ogFiles) if (!referencedOg.has(og) && !["home.png", "404.png"].includes(og) && !ROUTE_META.some((r) => r.file && `${r.file}.png` === og)) f("public/og", `${og} is referenced by no page`);
for (const r of ROUTE_META.filter((x) => x.shell)) if (!existsSync(`public/og/${r.file}.png`)) f("public/og", `SPA shell card ${r.file}.png missing`);

if (findings.length) {
  const cap = process.env.AUDIT_FULL ? findings.length : 80;
  console.log(findings.slice(0, cap).join("\n"));
  if (findings.length > cap) console.log(`... +${findings.length - cap} more (AUDIT_FULL=1 prints all)`);
  console.log(`MILITARY AUDIT: ${findings.length} findings across ${files.length} pages`);
  process.exit(1);
}
console.log(`MILITARY AUDIT CLEAN: ${files.length} pages, ${locs.length} sitemap URLs, ${ogFiles.length} share cards, 0 findings`);
