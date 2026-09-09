// Rewrites every content <picture>/<img> on both sites to use the width variants produced by
// scripts/generate-responsive-images.mjs (audit 2026-09-02: perf-03, media-01, media-02) and
// normalises the two header logos (perf-04, perf-06, media-03: real intrinsic dimensions, no
// fetchpriority, decoding="async"). Idempotent; re-run after adding images or pages.
//
//   node scripts/apply-responsive-images.mjs            # both sites
//   node scripts/apply-responsive-images.mjs --only public/first-time-military-homebuyer.html
//   node scripts/apply-responsive-images.mjs --dry
import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from "node:fs";
import { parse, join } from "node:path";
import sharp from "sharp";
import {responsiveHeaderLogos} from './responsive-logo-lib.mjs';
import { WIDTHS, AVATAR, variantPath, modernPath } from "./generate-responsive-images.mjs";

const DRY = process.argv.includes("--dry");
const CIVILIAN = process.argv.includes("--civilian");
const SCHOOLS = process.argv.includes("--schools");
const rootArg=k=>process.argv.includes(k)?process.argv[process.argv.indexOf(k)+1]:null;
const GC_ROOT=rootArg('--gc-root')||'civilian-site',PMH_ROOT=rootArg('--pmh-root')||'public';
const onlyIdx = process.argv.indexOf("--only");
const ONLY = onlyIdx > -1 ? process.argv[onlyIdx + 1].replace(/\\/g, "/") : null;
const PMH = "https://pensacolamilitaryhousing.com";
const SKIP = /(^|\/)(favicon|apple-touch|icon|og-image)|\/og\/|\/_originals\//i;
const LOGOS = { "logo-lrr.png": { w: 834, h: 472 }, "logo-08-sm.png": { w: 480, h: 196 } };

// sizes presets keyed by the rendering context (the nearest class on the picture's ancestors)
const SIZES = {
  "cg-hero-media": "(max-width: 680px) calc(100vw - 68px), (max-width: 1240px) 43vw, 535px",
  "gc-interior-hero-media": "(max-width: 640px) calc(100vw - 44px), (max-width: 1100px) 42vw, 510px",
  "gc-support-person": "52px",
  "gc-story-portrait": "(max-width: 640px) 260px, 230px",
  "gc-blog-card-media": "(max-width: 640px) calc(100vw - 44px), (max-width: 1100px) 46vw, 370px",
  "gc-blog-card-media-featured": "(max-width: 640px) calc(100vw - 44px), (max-width: 1100px) calc(100vw - 56px), 740px",
  "gc-hero-image": "100vw",
  "gc-resource-image": "100vw",
  "gc-hero-portrait": "(max-width: 360px) 173px, (max-width: 640px) 203px, (max-width: 1100px) 34vw, 390px",
  "gc-region-card": "(max-width: 640px) calc(100vw - 44px), (max-width: 1100px) 46vw, 520px",
  "gc-person-image": "(max-width: 640px) 88vw, 480px",
  avatar: "60px",
  "hero-portrait": "(max-width: 640px) 90vw, 380px",
  "nb-photo": "(max-width: 640px) 94vw, (max-width: 1100px) 46vw, 340px",
  "cc-photo": "(max-width: 520px) 94vw, (max-width: 900px) 46vw, 290px",
  "figure-band-gc": "(max-width: 800px) 92vw, 760px",
  "figure-band-pmh": "(max-width: 940px) 92vw, 900px",
  "hero-band": "(max-width: 940px) 92vw, 900px",
  default: "(max-width: 940px) 92vw, 900px",
};
function contextFor(html, idx, site, src) {
  if (src.endsWith("gregg-portrait.jpg")) return "avatar";
  const before = html.slice(Math.max(0, idx - 600), idx);
  const classes = [...before.matchAll(/class="([^"]+)"/g)].map((m) => m[1]).reverse().join(" ");
  if (classes.split(/\s+/).includes('cg-hero-media')) return 'cg-hero-media';
  if (classes.split(/\s+/).includes('gc-blog-card-media')) {
    const priorCards=[...html.slice(0,idx).matchAll(/<a\b[^>]*class="blog-card"[^>]*>/g)].length;
    return priorCards===1 ? 'gc-blog-card-media-featured' : 'gc-blog-card-media';
  }
  for (const k of ["gc-blog-card-media", "gc-support-person", "gc-story-portrait", "gc-interior-hero-media", "gc-hero-portrait", "gc-hero-image", "gc-resource-image", "gc-region-card", "gc-person-image", "hero-portrait", "nb-photo", "cc-photo", "hero-band"]) if (classes.split(/\s+/).includes(k)) return k;
  if (/\bfigure-band\b/.test(classes)) return site === "gc" ? "figure-band-gc" : "figure-band-pmh";
  return "default";
}
function walkHtml(dir, out = []) {
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, f.name).replace(/\\/g, "/");
    if (f.isDirectory()) walkHtml(p, out); else if (f.name.endsWith(".html") && f.name !== "404.html") out.push(p);
  }
  return out;
}
const attrs = (tag) => { const o = {}; for (const m of tag.matchAll(/([a-zA-Z-]+)="([^"]*)"/g)) o[m[1]] = m[2]; return o; };
const localFor = (src, site) => src.startsWith(`${PMH}/`) ? PMH_ROOT + src.slice(PMH.length) : src.startsWith("/") ? (site === "gc" ? GC_ROOT : PMH_ROOT) + src : null;
const urlFor = (local, src) => { // keep the page's own URL style (absolute for GC images hosted on PMH)
  const normalized=local.replaceAll('\\','/');
  const matched=[GC_ROOT,PMH_ROOT].map(p=>p.replaceAll('\\','/')).find(p=>normalized.startsWith(p+'/'));
  if(!matched)throw Error('Image outside configured roots: '+local);
  const rel = normalized.slice(matched.length);
  return src.startsWith(`${PMH}/`) ? PMH + rel : rel;
};
const metaCache = new Map();
async function meta(local) { if (!metaCache.has(local)) metaCache.set(local, await sharp(local).metadata()); return metaCache.get(local); }

function candidates(local, src, fmt, origWidth) {
  const out = [];
  const widths = local === AVATAR.file ? AVATAR.widths : WIDTHS;
  for (const w of widths) { const p = variantPath(local, w, fmt); if (existsSync(p)) out.push(`${urlFor(p, src)} ${w}w`); }
  const full = fmt === "jpeg" ? local : modernPath(local, fmt);
  if (existsSync(full) && local !== AVATAR.file) out.push(`${urlFor(full, src)} ${origWidth}w`);
  return out;
}
function buildImg(a, src, m, ctx, srcsetJpg) {
  const isAvatar = ctx === "avatar";
  if (ctx.startsWith('figure-band')) {
    const style = (a.style || '').replace(/(?:^|;)\s*--image-aspect\s*:[^;]*/g,'').replace(/^;|;$/g,'');
    a.style = (style ? style + ';' : '') + `--image-aspect:${m.width}/${m.height}`;
  }
  const keep = ["alt", "role", "aria-hidden", "loading", "fetchpriority", "class", "style", "id", "title", "data-credit"];
  const parts = [`src="${src}"`];
  if (srcsetJpg.length) parts.push(`srcset="${srcsetJpg.join(", ")}"`, `sizes="${SIZES[ctx]}"`);
  parts.push(`width="${isAvatar ? 60 : m.width}"`, `height="${isAvatar ? 60 : m.height}"`);
  for (const k of keep) if (a[k] !== undefined) parts.push(`${k}="${a[k]}"`);
  parts.push(`decoding="async"`);
  return `<img ${parts.join(" ")}>`;
}

const files = ONLY ? [ONLY] : CIVILIAN ? walkHtml(GC_ROOT).filter(f=>process.argv.includes("--logos-only")||f!==GC_ROOT+"/index.html") : SCHOOLS ? [GC_ROOT+"/schools.html", ...walkHtml(GC_ROOT+"/schools")] : ["index.html", ...walkHtml(PMH_ROOT), ...walkHtml(GC_ROOT)];
let pages = 0, pictures = 0, bare = 0, logos = 0, missing = new Set();
for (const f of files) {
  const site = CIVILIAN || f.startsWith("civilian-site") ? "gc" : "pmh";
  let h = readFileSync(f, "utf8");
  const before = h;
  if(process.argv.includes('--logos-only')){
    const next=responsiveHeaderLogos(h,GC_ROOT);
    if(next!==h){pages++;if(!DRY)writeFileSync(f,next);}
    continue;
  }
  // 1. header logos
  h = h.replace(/<img\b[^>]*\bsrc="([^"]*\/images\/(logo-lrr\.png|logo-08-sm\.png))"[^>]*>/g, (tag, src, name) => {
    const a = attrs(tag); const L = LOGOS[name];
    const next = `<img src="${src}" alt="${a.alt || ""}" width="${L.w}" height="${L.h}" decoding="async">`;
    if (next !== tag) logos++;
    return next;
  });
  if(site==='gc')h=responsiveHeaderLogos(h,GC_ROOT);
  // 2. content pictures
  const jobs = [];
  const pictureHtml = h;
  pictureHtml.replace(/<picture>\s*((?:<source\b[^>]*>\s*)*)(<img\b[^>]*>)\s*<\/picture>/g, (whole, _sources, img, idx) => { jobs.push({ whole, img, idx }); return whole; });
  for (const j of jobs) {
    const a = attrs(j.img); const src = a.src || "";
    if (!/\.(jpe?g|png)$/i.test(src) || SKIP.test(src) || /logo/.test(src)) continue;
    const local = localFor(src, site);
    if (!local || !existsSync(local)) { missing.add(src); continue; }
    const m = await meta(local);
    // Offsets belong to the captured HTML; earlier replacements can change its length.
    const ctx = contextFor(pictureHtml, j.idx, site, src);
    const avif = candidates(local, src, "avif", m.width), webp = candidates(local, src, "webp", m.width), jpg = candidates(local, src, "jpeg", m.width);
    const sources = [];
    // A modern-format source with a single candidate is worse than no source at all: the browser
    // picks that source and downloads the one width it offers, whatever the viewport. That is how a
    // 340px card ended up serving a 566 KB full-size file. Emit a source only with a real ladder.
    if (avif.length > 1) sources.push(`<source type="image/avif" srcset="${avif.join(", ")}" sizes="${SIZES[ctx]}">`);
    if (webp.length > 1) sources.push(`<source type="image/webp" srcset="${webp.join(", ")}" sizes="${SIZES[ctx]}">`);
    const next = `<picture>${sources.join("")}${buildImg(a, src, m, ctx, jpg)}</picture>`;
    if (next !== j.whole) { h = h.split(j.whole).join(next); pictures++; }
  }
  // 3. bare content <img> (no <picture>): srcset + dimensions only
  const bareTags = [...h.matchAll(/<img\b[^>]*>/g)].filter((x) => !/logo/.test(x[0]) && !h.slice(Math.max(0, x.index - 12), x.index).includes("<picture>") && !/<\/picture>/.test(h.slice(x.index + x[0].length, x.index + x[0].length + 12)));
  for (const x of bareTags) {
    const a = attrs(x[0]); const src = a.src || "";
    if (!/\.(jpe?g|png)$/i.test(src) || SKIP.test(src)) continue;
    if (/srcset=/.test(x[0]) && /width=/.test(x[0])) continue;
    const local = localFor(src, site);
    if (!local || !existsSync(local)) { missing.add(src); continue; }
    const m = await meta(local);
    const ctx = contextFor(h, x.index, site, src);
    const next = buildImg(a, src, m, ctx, candidates(local, src, "jpeg", m.width));
    if (next !== x[0]) { h = h.split(x[0]).join(next); bare++; }
  }
  if (h !== before) { pages++; if (!DRY) writeFileSync(f, h); }
}
console.log(`responsive markup${DRY ? " (dry)" : ""}: ${pages} pages changed, ${pictures} pictures rewritten, ${bare} bare imgs, ${logos} logo tags normalised${missing.size ? `; MISSING files for: ${[...missing].join(", ")}` : ""}`);
