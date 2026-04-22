import { readdirSync, statSync, copyFileSync } from "node:fs";
import { join } from "node:path";

const DIR = "public/images";
const BACKUP = "public/images/_originals";

const backups = readdirSync(BACKUP);
const restored = [];

for (const f of backups) {
  const curr = join(DIR, f);
  const bk = join(BACKUP, f);
  if (statSync(curr).size > statSync(bk).size) {
    copyFileSync(bk, curr);
    restored.push(f);
  }
}

console.log("Restored (no gain):", restored);
