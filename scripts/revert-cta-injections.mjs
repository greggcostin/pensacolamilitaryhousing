// Revert the sticky-mobile-cta and hero-cta injections done by
// add-sticky-mobile-cta.mjs and add-hero-cta.mjs. Removes both the
// HTML blocks (identified by their HTML comments) and the CSS that
// add-sticky-mobile-cta.mjs added inside the existing <style> tag.

import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";

const STICKY_HTML_RE = /<!-- sticky-mobile-cta -->[\s\S]*?<\/a>\s*\n?/g;
const STICKY_CSS_RE = /\n?\/\* Sticky mobile call CTA[\s\S]*?\}\s*\n?\}/g;
const HERO_RE = /<!-- hero-cta -->\s*\n?<div class="hero-cta-row"[\s\S]*?<\/div>\s*\n?/g;

const files = [];
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full);
    else if (name.endsWith(".html")) files.push(full);
  }
}
walk("public");

let touched = 0;
for (const path of files) {
  const before = readFileSync(path, "utf8");
  let html = before;
  html = html.replace(STICKY_HTML_RE, "");
  html = html.replace(STICKY_CSS_RE, "");
  html = html.replace(HERO_RE, "");
  if (html !== before) {
    writeFileSync(path, html, "utf8");
    touched++;
  }
}
console.log(`${touched} prerendered pages reverted (sticky CTA + hero CTA stripped).`);
