// Physically relocate the base and community HTML files into /bases/ and
// /communities/ subdirectories so Cloudflare Pages serves them natively at
// those paths (no rewrites needed — rewrites fight with CF's auto-pretty-URL).

import { existsSync, mkdirSync, renameSync, readdirSync } from "node:fs";
import { join } from "node:path";

const PUB = "public";

// old filename (at public root)  -> new filename (under the target folder)
const BASES = {
  "nas-pensacola.html":      "nas-pensacola.html",
  "corry-station.html":      "corry-station.html",
  "saufley-field.html":      "saufley-field.html",
  "nas-whiting-field.html":  "whiting-field.html",
  "hurlburt-field.html":     "hurlburt-field.html",
  "eglin-afb.html":           "eglin-afb.html",
  "duke-field.html":          "duke-field.html",
};

const COMMUNITIES = {
  "gulf-breeze.html":                           "gulf-breeze.html",
  "navarre.html":                               "navarre.html",
  "pace.html":                                  "pace.html",
  "milton.html":                                "milton.html",
  "cantonment.html":                            "cantonment.html",
  "perdido-key.html":                           "perdido-key.html",
  "east-pensacola-heights.html":                "east-pensacola-heights.html",
  "east-hill.html":                             "east-hill.html",
  "cordova-park.html":                          "cordova-park.html",
  "ferry-pass.html":                            "ferry-pass.html",
  "bellview-myrtle-grove.html":                 "bellview-myrtle-grove.html",
  "navy-point-warrington.html":                 "navy-point-warrington.html",
  "niceville-valparaiso-bluewater-bay.html":    "niceville.html",
  "fort-walton-beach-shalimar.html":            "fort-walton-beach.html",
  "destin.html":                                "destin.html",
  "crestview.html":                             "crestview.html",
};

mkdirSync(join(PUB, "bases"), { recursive: true });
mkdirSync(join(PUB, "communities"), { recursive: true });

let moved = 0;
for (const [oldName, newName] of Object.entries(BASES)) {
  const oldPath = join(PUB, oldName);
  const newPath = join(PUB, "bases", newName);
  if (existsSync(oldPath)) {
    renameSync(oldPath, newPath);
    console.log(`bases/: ${oldName} -> ${newName}`);
    moved++;
  }
}
for (const [oldName, newName] of Object.entries(COMMUNITIES)) {
  const oldPath = join(PUB, oldName);
  const newPath = join(PUB, "communities", newName);
  if (existsSync(oldPath)) {
    renameSync(oldPath, newPath);
    console.log(`communities/: ${oldName} -> ${newName}`);
    moved++;
  }
}

console.log(`\nMoved ${moved} files.`);
