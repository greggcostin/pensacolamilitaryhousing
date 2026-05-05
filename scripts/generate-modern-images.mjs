// Generate AVIF + WebP variants for every JPEG/PNG in public/images/.
// Originals are kept (so existing <img src=…> references keep working);
// new files sit alongside with .avif and .webp extensions.
//
// To use the optimized variants, wrap <img> in a <picture> element:
//   <picture>
//     <source srcset="/images/foo.avif" type="image/avif">
//     <source srcset="/images/foo.webp" type="image/webp">
//     <img src="/images/foo.jpg" alt="…" loading="lazy">
//   </picture>
// Browsers pick the smallest format they support.
//
// Idempotent: skips files where the .avif/.webp variant already exists
// AND is newer than the source. Pass --force to regenerate.

import { readdirSync, statSync, existsSync } from "node:fs";
import { join, parse } from "node:path";
import sharp from "sharp";

const SRC_DIR = "public/images";
const FORCE = process.argv.includes("--force");

// Quality targets — AVIF is more aggressive (visually equal at lower numbers).
const AVIF_QUALITY = 55;
const WEBP_QUALITY = 78;

const isImage = f => /\.(jpe?g|png)$/i.test(f);
const files = readdirSync(SRC_DIR).filter(isImage);

let totalOrigBytes = 0, totalNewBytes = 0, generated = 0, skipped = 0;

for (const file of files) {
  const srcPath = join(SRC_DIR, file);
  const { name } = parse(file);
  const srcStat = statSync(srcPath);
  totalOrigBytes += srcStat.size;

  for (const fmt of ["avif", "webp"]) {
    const outPath = join(SRC_DIR, `${name}.${fmt}`);
    if (!FORCE && existsSync(outPath) && statSync(outPath).mtimeMs >= srcStat.mtimeMs) {
      skipped++;
      totalNewBytes += statSync(outPath).size;
      continue;
    }
    const pipeline = sharp(srcPath);
    if (fmt === "avif") await pipeline.avif({ quality: AVIF_QUALITY, effort: 4 }).toFile(outPath);
    else await pipeline.webp({ quality: WEBP_QUALITY, effort: 5 }).toFile(outPath);
    generated++;
    totalNewBytes += statSync(outPath).size;
  }
}

const fmt = n => (n / 1024).toFixed(0) + " KB";
const pct = (a, b) => ((1 - b / a) * 100).toFixed(0) + "%";
console.log(`\nProcessed ${files.length} source images.`);
console.log(`Generated: ${generated} new variants. Skipped: ${skipped} (up-to-date).`);
console.log(`Original total: ${fmt(totalOrigBytes)}`);
console.log(`Variants total: ${fmt(totalNewBytes)} (avif + webp combined)`);
console.log(`AVIF-served savings vs originals: ${pct(totalOrigBytes, totalNewBytes / 2)}`);
