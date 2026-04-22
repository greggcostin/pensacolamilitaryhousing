import { readdirSync, statSync, copyFileSync, existsSync, mkdirSync } from "node:fs";
import { join, parse } from "node:path";
import sharp from "sharp";

const DIR = "public/images";
const THRESHOLD_KB = 200; // optimize anything over 200 KB
const JPEG_QUALITY = 82;
const PNG_COMPRESSION = 9;
const BACKUP_DIR = "public/images/_originals";

if (!existsSync(BACKUP_DIR)) mkdirSync(BACKUP_DIR, { recursive: true });

const files = readdirSync(DIR).filter(f => /\.(jpe?g|png)$/i.test(f));
const results = [];

for (const f of files) {
  const path = join(DIR, f);
  const sizeBefore = statSync(path).size;
  if (sizeBefore < THRESHOLD_KB * 1024) continue;

  const { name, ext } = parse(f);
  const backup = join(BACKUP_DIR, f);
  if (!existsSync(backup)) copyFileSync(path, backup);

  const input = sharp(backup);
  let output;
  if (/jpe?g/i.test(ext)) {
    output = input.jpeg({ quality: JPEG_QUALITY, mozjpeg: true, progressive: true });
  } else {
    output = input.png({ compressionLevel: PNG_COMPRESSION, palette: true });
  }

  await output.toFile(path);
  const sizeAfter = statSync(path).size;
  const saved = sizeBefore - sizeAfter;
  const pct = ((saved / sizeBefore) * 100).toFixed(1);

  results.push({ file: f, before: (sizeBefore / 1024).toFixed(0) + " KB", after: (sizeAfter / 1024).toFixed(0) + " KB", saved: pct + "%" });
}

console.table(results);
const total = results.reduce((s, r) => s + (parseFloat(r.before) - parseFloat(r.after)), 0);
console.log(`Total saved: ${total.toFixed(0)} KB across ${results.length} files`);
