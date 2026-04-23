// Phase-2 audit fixes:
// 1. Email casing — standardize to lowercase (audit caught index.html using
//    lowercase while subpages use CamelCase; standardize on the canonical
//    gmail-inbox-matching lowercase form).
// 2. <html lang="en"> vs lang="en-US" — normalize all to "en-US" since the
//    site targets US military families specifically.
// 3. Logo images missing width/height — add explicit dimensions so the browser
//    reserves space before the image loads, eliminating CLS.

import { readdirSync, readFileSync, writeFileSync } from "node:fs";

function walk(dir, out = []) {
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    const p = `${dir}/${f.name}`;
    if (f.isDirectory()) walk(p, out);
    else if (f.isFile() && /\.html$/.test(f.name)) out.push(p);
  }
  return out;
}

// Case-sensitive replacements. Keep these literal so they match regardless of
// surrounding context (JSON, attribute, visible text).
const REPLACEMENTS = [
  // Email normalization (case-insensitive match, case-consistent write)
  { from: "Gregg.Costin@gmail.com", to: "gregg.costin@gmail.com" },
  // Lang attribute normalization
  { from: '<html lang="en">', to: '<html lang="en-US">' },
  // Logo image dimensions — add width/height to prevent CLS. 108x108 is the
  // rendered height per the existing CSS (.banner-lrr img,.banner-logo img{height:108px}).
  {
    from: '<img loading="lazy" src="/images/logo-lrr.png" alt="Levin Rinke Realty">',
    to: '<img loading="lazy" src="/images/logo-lrr.png" alt="Levin Rinke Realty" width="240" height="108">',
  },
  {
    from: '<img loading="lazy" src="/images/logo-08.png" alt="The Costin Team">',
    to: '<img loading="lazy" src="/images/logo-08.png" alt="The Costin Team" width="240" height="108">',
  },
];

const files = [...walk("public"), "index.html"];
let touched = 0, subs = 0;

for (const path of files) {
  let content;
  try { content = readFileSync(path, "utf8"); } catch { continue; }
  const before = content;
  for (const { from, to } of REPLACEMENTS) {
    while (content.includes(from)) {
      content = content.replace(from, to);
      subs++;
    }
  }
  if (content !== before) {
    writeFileSync(path, content, "utf8");
    touched++;
  }
}

console.log(`Phase-2 fixes: ${subs} replacements across ${touched} files.`);
