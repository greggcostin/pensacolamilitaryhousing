// Stock image fetcher for blog posts and site pages.
// Sources: Wikimedia Commons (primary — no key, generous limits, rich in public-domain
// military/local imagery) and Openverse (fallback). Filters to commercial-safe licenses
// only (PD / CC0 / CC-BY / CC-BY-SA), downloads candidates locally so they run through
// the site's AVIF/WebP pipeline, and records license + attribution in
// content/blog/image-credits.json. CC-BY(-SA) images MUST carry the recorded credit in
// their visible figcaption.
//
// Usage:
//   node scripts/fetch-stock-image.mjs "<query>" <out-slug> [--candidates N] [--dir public/images/topics]
//   → downloads N (default 2) candidates as <out-slug>-cand1.jpg, <out-slug>-cand2.jpg
//     into the target dir and prints their metadata. A human (or the engine, which must
//     VIEW the files) picks one, renames it to <out-slug>.jpg, deletes the rest, and
//     runs `npm run modern-images`.
//
//   node scripts/fetch-stock-image.mjs --finalize <dir>/<out-slug> <keep-index>
//   → renames <out-slug>-cand<keep>.jpg to <out-slug>.jpg, deletes other candidates,
//     and promotes that candidate's credit entry.

import { writeFileSync, readFileSync, existsSync, renameSync, unlinkSync, readdirSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = fileURLToPath(new URL("..", import.meta.url)).replace(/\\/g, "/");
const CREDITS_PATH = ROOT + "content/blog/image-credits.json";
const UA = "PensacolaMilitaryHousingBot/1.0 (https://pensacolamilitaryhousing.com; gregg.costin@gmail.com) image-attribution-respected";

const OK_LICENSES = /^(pd|public domain|cc0|cc-by|cc-by-sa|cc by|cc by-sa|attribution|no restrictions)/i;

function loadCredits() {
  if (existsSync(CREDITS_PATH)) return JSON.parse(readFileSync(CREDITS_PATH, "utf8"));
  return { note: "License + attribution ledger for downloaded imagery. CC-BY/CC-BY-SA entries MUST have their credit shown in the image's visible figcaption.", images: {} };
}
function saveCredits(c) { writeFileSync(CREDITS_PATH, JSON.stringify(c, null, 2)); }

async function searchWikimedia(query, n) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrsearch=filetype:bitmap ${encodeURIComponent(query)}&gsrnamespace=6&gsrlimit=${n * 4}&prop=imageinfo&iiprop=url|size|extmetadata&iiurlwidth=1600`;
  const r = await fetch(url, { headers: { "User-Agent": UA } });
  if (!r.ok) return [];
  const j = await r.json();
  const pages = Object.values(j?.query?.pages || {});
  const out = [];
  for (const p of pages) {
    const ii = p.imageinfo?.[0];
    if (!ii) continue;
    if ((ii.width || 0) < 1200) continue;
    const em = ii.extmetadata || {};
    const licShort = (em.LicenseShortName?.value || "").replace(/<[^>]+>/g, "");
    const usageTerms = (em.UsageTerms?.value || "").replace(/<[^>]+>/g, "");
    const lic = licShort || usageTerms;
    if (!OK_LICENSES.test(lic)) continue;
    if (/non-?commercial|nc\b/i.test(lic)) continue;
    const artist = (em.Artist?.value || "").replace(/<[^>]+>/g, "").trim().slice(0, 120);
    out.push({
      source: "Wikimedia Commons",
      title: p.title.replace(/^File:/, ""),
      pageUrl: `https://commons.wikimedia.org/wiki/${encodeURIComponent(p.title)}`,
      downloadUrl: ii.thumburl || ii.url,
      width: ii.thumbwidth || ii.width,
      license: lic,
      creditRequired: /cc.?by/i.test(lic) && !/public domain|pd|cc0|no restrictions/i.test(lic),
      credit: artist || "Wikimedia Commons",
    });
    if (out.length >= n) break;
  }
  return out;
}

async function searchOpenverse(query, n) {
  const url = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(query)}&license_type=commercial&size=large&per_page=${n * 3}`;
  const r = await fetch(url, { headers: { "User-Agent": UA } });
  if (!r.ok) return [];
  const j = await r.json();
  const out = [];
  for (const it of j?.results || []) {
    if ((it.width || 0) < 1200) continue;
    const lic = (it.license || "").toLowerCase();
    if (/nc|nd/.test(lic)) continue;
    out.push({
      source: `Openverse (${it.source || it.provider || "unknown"})`,
      title: (it.title || "untitled").slice(0, 120),
      pageUrl: it.foreign_landing_url || it.url,
      downloadUrl: it.url,
      width: it.width,
      license: it.license ? `CC ${it.license.toUpperCase()} ${it.license_version || ""}`.trim() : "unknown",
      creditRequired: /by/.test(lic),
      credit: (it.creator || "unknown").slice(0, 120),
    });
    if (out.length >= n) break;
  }
  return out;
}

async function download(url, outPath) {
  const r = await fetch(url, { headers: { "User-Agent": UA } });
  if (!r.ok) throw new Error(`download HTTP ${r.status}`);
  const buf = Buffer.from(await r.arrayBuffer());
  // normalize: max 1600w jpg, strip metadata bulk, quality 82
  await sharp(buf).rotate().resize({ width: 1600, withoutEnlargement: true }).jpeg({ quality: 82, mozjpeg: true }).toFile(outPath);
}

const args = process.argv.slice(2);

if (args[0] === "--finalize") {
  const base = args[1].replace(/\\/g, "/"); // e.g. public/images/topics/my-slug
  const keep = parseInt(args[2], 10);
  const dir = base.slice(0, base.lastIndexOf("/"));
  const slug = base.slice(base.lastIndexOf("/") + 1);
  const credits = loadCredits();
  const finalRel = `${base.replace(/^public/, "")}.jpg`;
  for (const f of readdirSync(ROOT + dir)) {
    const m = new RegExp(`^${slug}-cand(\\d+)\\.jpg$`).exec(f);
    if (!m) continue;
    const idx = parseInt(m[1], 10);
    const full = `${ROOT}${dir}/${f}`;
    if (idx === keep) {
      renameSync(full, `${ROOT}${base}.jpg`);
      const key = `${base}-cand${idx}.jpg`.replace(/^public/, "");
      if (credits.images[key]) { credits.images[finalRel] = credits.images[key]; }
    } else unlinkSync(full);
  }
  // drop candidate entries
  for (const k of Object.keys(credits.images)) if (/-cand\d+\.jpg$/.test(k)) delete credits.images[k];
  saveCredits(credits);
  console.log(`FINALIZED: ${base}.jpg (kept candidate ${keep})`);
  const entry = credits.images[finalRel];
  if (entry) console.log(`  license: ${entry.license} | creditRequired: ${entry.creditRequired} | credit: ${entry.credit}`);
  process.exit(0);
}

const query = args[0];
const outSlug = args[1];
const nIdx = args.indexOf("--candidates");
const n = nIdx > -1 ? parseInt(args[nIdx + 1], 10) : 2;
const dIdx = args.indexOf("--dir");
const dir = dIdx > -1 ? args[dIdx + 1] : "public/images/topics";
if (!query || !outSlug) { console.error("usage: fetch-stock-image.mjs \"<query>\" <out-slug> [--candidates N] [--dir <dir>]"); process.exit(1); }
if (!existsSync(ROOT + dir)) mkdirSync(ROOT + dir, { recursive: true });

let candidates = await searchWikimedia(query, n);
if (candidates.length < n) candidates = candidates.concat(await searchOpenverse(query, n - candidates.length));
if (!candidates.length) { console.error(`NO CANDIDATES for "${query}" (license/size filtered)`); process.exit(2); }

const credits = loadCredits();
let i = 0;
for (const c of candidates) {
  i++;
  const rel = `${dir.replace(/^public/, "")}/${outSlug}-cand${i}.jpg`;
  try {
    await download(c.downloadUrl, `${ROOT}${dir}/${outSlug}-cand${i}.jpg`);
    credits.images[rel] = { source: c.source, title: c.title, pageUrl: c.pageUrl, license: c.license, creditRequired: c.creditRequired, credit: c.credit, query };
    console.log(`CAND${i}: ${rel}\n  ${c.title} | ${c.license} | creditRequired=${c.creditRequired} | ${c.source}\n  ${c.pageUrl}`);
  } catch (e) {
    console.log(`CAND${i} FAILED: ${e.message}`);
  }
}
saveCredits(credits);
console.log(`\nNext: VIEW the candidates, then finalize:\n  node scripts/fetch-stock-image.mjs --finalize ${dir}/${outSlug} <keep-index>\n  npm run modern-images`);
