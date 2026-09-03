// Responsive width variants for every CONTENT image referenced by a page on either site
// (audit 2026-09-02: perf-03, media-01, media-02, media-08). Extends generate-modern-images.mjs:
// for each referenced jpg/png (not logos/icons/OG cards) it writes <name>-480.{avif,webp,jpg},
// -768.* and -1200.* next to the original, never upscaling, plus 120/180 px variants for the
// author avatar. The original stays the largest candidate (its full-size .avif/.webp are
// generated here too when missing, which is how civilian-site/images gets AVIF at all).
// Any avif/webp variant that is not at least 5% smaller than the jpg at the same width is deleted
// (the restore-grown-images.mjs rule), so <picture> never offers a "modern" file that is bigger.
// Idempotent: skips variants that exist and are newer than the source. --force regenerates.
// Markup is rewritten separately by scripts/apply-responsive-images.mjs.
//
//   node scripts/generate-responsive-images.mjs [--force] [--dry]
import { readdirSync, readFileSync, statSync, existsSync, unlinkSync, writeFileSync } from "node:fs";
import { join, parse } from "node:path";
import sharp from "sharp";
import { COMMUNITY_LINKS } from "../src/communitiesData.js";

const FORCE = process.argv.includes("--force");
const DRY = process.argv.includes("--dry");
export const WIDTHS = [480, 768, 1200];
// Images the SPA renders from JSX (src/App.jsx). The img scan below only reads .html files,
// so without this the hero would silently lose its width variants on the next --force run.
export const SPA_ONLY = ["public/images/hero-window.jpg"];
export const AVATAR = { file: "public/images/gregg-portrait.jpg", widths: [120, 180] };
const ENC = {
  avif: { quality: 50, effort: 6 },
  webp: { quality: 74, effort: 6 },
  jpeg: { quality: 78, mozjpeg: true, progressive: true },
};
const SKIP = /(^|\/)(logo|favicon|apple-touch|icon|og-image)|\/og\/|\/_originals\//i;

function walkHtml(dir, out = []) {
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, f.name).replace(/\\/g, "/");
    if (f.isDirectory()) walkHtml(p, out); else if (f.name.endsWith(".html")) out.push(p);
  }
  return out;
}
// Images the React SPA renders that no HTML page links, so the walkHtml() pass below never
// sees them (audit perf-03 / media-01): the IMG entries src/App.jsx actually uses, plus the
// community card photos, whose path is built from a template literal at runtime. jpg only:
// every png the app draws is a logo or a partner mark rendered at 200px or less, and the width
// ladder is encoded as JPEG, which would flatten the transparency.
export function appImages() {
  const app = readFileSync("src/App.jsx", "utf8");
  const block = app.match(/const IMG = \{([\s\S]*?)\r?\n\};/);
  const byKey = {};
  if (block) for (const m of block[1].matchAll(/(\w+):\s*"(\/images\/[^"]+)"/g)) byKey[m[1]] = m[2];
  const out = new Set();
  for (const m of app.matchAll(/\bIMG\.(\w+)\b/g)) if (byKey[m[1]]) out.add("public" + byKey[m[1]]);
  for (const c of COMMUNITY_LINKS) out.add("public/images/communities/" + c.href.split("/").pop() + ".jpg");
  return [...out].filter((p) => /\.jpe?g$/i.test(p) && !SKIP.test(p) && existsSync(p)).sort();
}
// every image a page actually renders, resolved to its local path
export function referencedImages() {
  const set = new Set();
  const pages = [["pmh", ["index.html", ...walkHtml("public")]], ["gc", walkHtml("civilian-site")]];
  for (const [site, files] of pages) {
    for (const f of files) {
      const h = readFileSync(f, "utf8");
      for (const m of h.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/g)) {
        const s = m[1];
        if (!/\.(jpe?g|png)$/i.test(s) || SKIP.test(s)) continue;
        const local = s.startsWith("https://pensacolamilitaryhousing.com/") ? "public" + s.slice("https://pensacolamilitaryhousing.com".length)
          : s.startsWith("/") ? (site === "gc" ? "civilian-site" : "public") + s : null;
        if (local && existsSync(local)) set.add(local);
      }
    }
  }
  for (const local of appImages()) set.add(local);
  for (const extra of SPA_ONLY) if (existsSync(extra)) set.add(extra);
  return [...set].sort();
}
export const variantPath = (src, w, fmt) => { const { dir, name } = parse(src); return join(dir, `${name}-${w}.${fmt === "jpeg" ? "jpg" : fmt}`).replace(/\\/g, "/"); };
export const modernPath = (src, fmt) => { const { dir, name } = parse(src); return join(dir, `${name}.${fmt}`).replace(/\\/g, "/"); };

async function encode(src, w, fmt, out) {
  if (DRY) return;
  const p = sharp(src).rotate();
  if (w) p.resize({ width: w, withoutEnlargement: true });
  await p.toFormat(fmt, ENC[fmt]).toFile(out);
}
const fresh = (out, srcStat) => !FORCE && existsSync(out) && statSync(out).mtimeMs >= srcStat.mtimeMs;

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, "/")}` || process.argv[1].endsWith("generate-responsive-images.mjs")) {
  const files = referencedImages();
  let made = 0, skipped = 0, dropped = 0, bytes = 0;
  for (const src of files) {
    const st = statSync(src);
    const meta = await sharp(src).metadata();
    const widths = src === AVATAR.file ? AVATAR.widths : WIDTHS.filter((w) => w < meta.width);
    // full-size modern formats for the original (the 1600w candidate)
    for (const fmt of ["avif", "webp"]) {
      const out = modernPath(src, fmt);
      if (fresh(out, st)) { skipped++; continue; }
      await encode(src, null, fmt, out); made++;
    }
    for (const w of widths) {
      const jpg = variantPath(src, w, "jpeg");
      if (!fresh(jpg, st)) { await encode(src, w, "jpeg", jpg); made++; } else skipped++;
      const jpgSize = DRY ? 0 : statSync(jpg).size;
      for (const fmt of ["avif", "webp"]) {
        const out = variantPath(src, w, fmt);
        if (fresh(out, st)) { skipped++; continue; }
        await encode(src, w, fmt, out); made++;
        if (!DRY && statSync(out).size >= jpgSize * 0.95) { unlinkSync(out); dropped++; }
      }
    }
    if (!DRY) for (const w of widths) for (const fmt of ["jpeg", "avif", "webp"]) { const p = variantPath(src, w, fmt); if (existsSync(p)) bytes += statSync(p).size; }
    // media-08: a full-size webp/avif that is not smaller than its source is worse than useless
    for (const fmt of ["avif", "webp"]) {
      const out = modernPath(src, fmt);
      if (!DRY && existsSync(out) && statSync(out).size >= st.size * 0.95) { unlinkSync(out); dropped++; console.log("dropped oversized", out); }
    }
  }
  // src/imageVariants.js: the SPA's <Pic> cannot stat the disk, so it reads the variant
  // inventory from here. Same candidate rule as candidates() in apply-responsive-images.mjs:
  // a width is listed for a format only when that exact file survived on disk.
  const manifest = {};
  for (const src of appImages()) {
    const mm = await sharp(src).metadata();
    const entry = { w: mm.width, h: mm.height };
    for (const [fmt, key] of [["avif", "avif"], ["webp", "webp"], ["jpeg", "jpg"]]) {
      const list = WIDTHS.filter((w) => w < mm.width && existsSync(variantPath(src, w, fmt)));
      const full = fmt === "jpeg" ? src : modernPath(src, fmt);
      if (existsSync(full)) list.push(mm.width);
      if (list.length) entry[key] = list;
    }
    manifest[src.slice("public".length)] = entry;
  }
  const rows = Object.keys(manifest).sort().map((k) => `  ${JSON.stringify(k)}: ${JSON.stringify(manifest[k])},`).join("\n");
  if (!DRY) writeFileSync("src/imageVariants.js", `// GENERATED by scripts/generate-responsive-images.mjs. Do not edit by hand.\n// Width variants that exist on disk for every image the React SPA renders, per format.\n// w/h are the original's intrinsic size; the widest width in each list is the original file.\nexport const IMAGE_VARIANTS = {\n${rows}\n};\n`);
  console.log(`image variant manifest: ${Object.keys(manifest).length} SPA images -> src/imageVariants.js`);
  console.log(`responsive images: ${files.length} source images, ${made} variants written, ${skipped} fresh, ${dropped} oversized modern files removed, variant set ${(bytes / 1048576).toFixed(1)} MB`);
}
