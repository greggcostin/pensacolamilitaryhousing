// The drawer rollout left a late <style id="ddfix-css"> block that forces the mobile header to
// position:relative, so it scrolls away instead of staying at the top. With the tab bar visible
// again the header should stay pinned. Keep the dropdown rules, which are still what we want on
// a phone: the menu spans the viewport under the header instead of hanging off one tab.
// Idempotent, EOL-preserving.
//   node scripts/fix-sticky-header.mjs [--dry]
import { readdirSync, readFileSync, writeFileSync } from "node:fs";

const DRY = process.argv.includes("--dry");
const FIND = ".main-banner{position:relative}";
const REPL = ".main-banner{position:sticky;top:0;z-index:1000}";

function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (["og", "images", "pagefind", "node_modules"].includes(e.name)) continue;
    const p = `${dir}/${e.name}`;
    if (e.isDirectory()) walk(p, out); else if (e.name.endsWith(".html")) out.push(p);
  }
  return out;
}

let changed = 0, already = 0;
for (const f of ["index.html", ...walk("public"), ...walk("civilian-site")]) {
  const src = readFileSync(f, "utf8");
  if (!src.includes(FIND)) { if (src.includes(REPL)) already++; continue; }
  if (!DRY) writeFileSync(f, src.split(FIND).join(REPL), "utf8");
  changed++;
}
console.log(`${DRY ? "[dry] " : ""}sticky header: ${changed} pages fixed, ${already} already sticky`);
