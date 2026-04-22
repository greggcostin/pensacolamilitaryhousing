// Line-by-line banner CSS replacement — tolerant of CRLF/LF mismatches.
// Each rule replaced individually, so whatever line terminator or
// interleaving the file uses, the rules still get swapped.

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PUB = "public";

// Pairs of old → new rule lines. Script walks each HTML and replaces.
const PAIRS = [
  // Pattern A (old uniform banner — ~22 resource pages)
  [".main-banner{background:var(--panel);border-bottom:1px solid var(--hair)}",
   ".main-banner{background:rgba(10,15,26,0.95);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-bottom:1px solid var(--hair);position:sticky;top:0;z-index:1000;transition:all .3s ease}"],

  [".banner-row{max-width:1200px;margin:0 auto;padding:10px 16px;display:grid;grid-template-columns:auto auto 1fr;align-items:center;gap:16px}",
   ".banner-row{max-width:1320px;margin:0 auto;padding:10px 16px 0;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:16px}"],

  [".banner-lrr img,.banner-logo img{height:108px;width:auto;display:block}",
   ".banner-lrr{justify-self:start;cursor:pointer}\n.banner-logo{justify-self:center;cursor:pointer}\n.banner-lrr img,.banner-logo img{height:108px;width:auto;display:block;object-fit:contain}"],

  [".banner-contact{text-align:right;font-family:var(--sans)}",
   ".banner-contact{justify-self:end;display:flex;flex-direction:column;align-items:center;gap:4px;text-align:center}"],

  [".banner-phone{color:var(--gold)!important;font-size:22px;font-weight:700;letter-spacing:.5px;display:block}",
   ".banner-phone{color:var(--gold)!important;font-size:20px;font-weight:700;letter-spacing:.5px;text-decoration:none;font-family:var(--sans);white-space:nowrap;display:block}"],

  [".banner-email{color:var(--muted)!important;font-size:12px;letter-spacing:1px;text-transform:uppercase;display:block;margin-top:2px}",
   ".banner-email{color:var(--gold)!important;font-size:14px;font-weight:600;letter-spacing:.3px;text-decoration:none;font-family:var(--sans);white-space:nowrap;display:block;text-transform:none}"],

  [".banner-tabs{max-width:1200px;margin:0 auto;padding:4px 16px 10px;display:flex;flex-wrap:wrap;gap:2px;justify-content:center;border-top:1px solid var(--hair)}",
   ".banner-tabs{max-width:1320px;margin:0 auto;padding:6px 12px 10px;display:flex;gap:2px;align-items:center;justify-content:center;flex-wrap:wrap}"],

  [".banner-tabs>a,.banner-tabs .dropdown>button{padding:8px 14px;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted);background:transparent;border:0;cursor:pointer;font-family:var(--sans);font-weight:500}",
   ".banner-tabs>a,.banner-tabs .dropdown>button{background:transparent;border:none;color:rgba(255,255,255,0.8);padding:6px 10px;font-size:11px;font-weight:500;letter-spacing:.5px;text-transform:uppercase;cursor:pointer;font-family:var(--sans);text-decoration:none;border-radius:4px;white-space:nowrap;transition:all .2s;display:inline-block}"],

  [".banner-tabs>a:hover,.banner-tabs .dropdown>button:hover{color:var(--gold)}",
   ".banner-tabs>a:hover,.banner-tabs .dropdown>button:hover{background:rgba(201,168,76,0.15);color:var(--gold)}"],

  [".dropdown{position:relative}",
   ".dropdown{position:relative;padding-bottom:4px}"],

  [".dropdown-menu{display:none;position:absolute;top:100%;left:0;background:var(--panel);border:1px solid var(--hair);min-width:240px;z-index:1000;box-shadow:0 10px 30px rgba(0,0,0,.4)}",
   ".dropdown-menu{display:none;position:absolute;top:100%;left:0;background:var(--elev);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:8px;min-width:240px;max-height:440px;overflow-y:auto;z-index:100;box-shadow:0 12px 36px rgba(0,0,0,0.6)}"],

  [".dropdown:hover .dropdown-menu{display:block}",
   ".dropdown:hover .dropdown-menu,.dropdown:focus-within .dropdown-menu{display:block}"],

  [".dropdown-menu a{display:block;padding:10px 14px;color:var(--muted);font-size:12px;border-bottom:1px solid var(--hair)}",
   ".dropdown-menu a{display:block;padding:11px 16px;color:rgba(255,255,255,0.85);font-size:12px;border:none;border-radius:4px;text-transform:none;letter-spacing:.3px;font-weight:500;font-family:var(--sans);text-decoration:none}"],

  [".dropdown-menu a:hover{background:var(--elev);color:var(--gold)}",
   ".dropdown-menu a:hover{background:rgba(201,168,76,0.1);color:var(--gold)}"],
];

const files = readdirSync(PUB).filter(f => f.endsWith(".html"));
let filesEdited = 0;

for (const f of files) {
  const path = join(PUB, f);
  let html = readFileSync(path, "utf8");
  const before = html;
  for (const [oldR, newR] of PAIRS) {
    if (html.includes(oldR)) html = html.split(oldR).join(newR);
  }
  if (html !== before) {
    writeFileSync(path, html, "utf8");
    filesEdited++;
  }
}

console.log(`Banner CSS normalized on ${filesEdited} pages.`);
