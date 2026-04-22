// Aggressively compress all JPEG files in public/images/ at quality 72 +
// mozjpeg. Skip PNGs (logos). Back up originals first. Restore any file
// that grew after compression.

import { readdirSync, statSync, copyFileSync, existsSync, mkdirSync } from "node:fs";
import { join, parse } from "node:path";
import sharp from "sharp";

const DIR = "public/images";
const BACKUP_DIR = "scripts/image-originals";
const JPEG_QUALITY = 72;
const THRESHOLD_KB = 60;

if (!existsSync(BACKUP_DIR)) mkdirSync(BACKUP_DIR, { recursive: true });

const files = readdirSync(DIR).filter(f => /\.jpe?g$/i.test(f));
const results = [];
let beforeTotal = 0, afterTotal = 0;

for (const f of files) {
  const path = join(DIR, f);
  const sizeBefore = statSync(path).size;
  beforeTotal += sizeBefore;
  if (sizeBefore < THRESHOLD_KB * 1024) { afterTotal += sizeBefore; continue; }

  const backup = join(BACKUP_DIR, f);
  if (!existsSync(backup)) copyFileSync(path, backup);

  const input = sharp(backup);
  await input.jpeg({ quality: JPEG_QUALITY, mozjpeg: true, progressive: true }).toFile(path);
  const sizeAfter = statSync(path).size;

  // If it grew, restore
  if (sizeAfter >= sizeBefore) {
    copyFileSync(backup, path);
    afterTotal += sizeBefore;
    results.push({ file: f, before: kb(sizeBefore), after: kb(sizeBefore), saved: "reverted" });
    continue;
  }

  afterTotal += sizeAfter;
  const saved = sizeBefore - sizeAfter;
  results.push({ file: f, before: kb(sizeBefore), after: kb(sizeAfter), saved: pct(saved, sizeBefore) });
}

function kb(b) { return (b / 1024).toFixed(0) + " KB"; }
function pct(s, total) { return ((s / total) * 100).toFixed(1) + "%"; }

console.table(results.sort((a, b) => parseFloat(b.saved) - parseFloat(a.saved)).slice(0, 20));
console.log(`\nBefore total: ${kb(beforeTotal)} · After total: ${kb(afterTotal)} · Saved: ${kb(beforeTotal - afterTotal)} (${pct(beforeTotal - afterTotal, beforeTotal)})`);
