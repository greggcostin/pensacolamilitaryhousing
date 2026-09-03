// Owner request (Sep 2026): the "Where we work" list on greggcostin.com was a row of pill chips.
// Replace it with compact picture cards (image, name, one-line fit) that are easier to tap and
// scan, smaller than the /neighborhoods hub cards. Generated from scripts/civilian-neighborhoods-data.mjs
// and the hub's own photo credits, so the homepage can never drift from the hub.
// Idempotent: rewrites the block between the AREA_CARDS markers, or replaces the old .chips block once.
//   node scripts/build-area-cards.mjs [--dry]
import { readFileSync, writeFileSync } from "node:fs";
import { NEIGHBORHOODS } from "./civilian-neighborhoods-data.mjs";

const DRY = process.argv.includes("--dry");
const SITE_DIR = "civilian-site";
const F = `${SITE_DIR}/index.html`;
const START = "<!-- AREA_CARDS_START -->";
const END = "<!-- AREA_CARDS_END -->";
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// photo credits, read straight out of the hub so both surfaces always agree
const hub = readFileSync(`${SITE_DIR}/neighborhoods.html`, "utf8");
const credits = {};
for (const m of hub.matchAll(/class="nb-card"[\s\S]*?(?=class="nb-card"|<\/section>)/g)) {
  const img = (m[0].match(/<img[^>]*src="([^"]+)"/) || [])[1];
  const cr = (m[0].match(/class="nb-credit"[^>]*>([\s\S]*?)<\/(?:div|p|span)>/) || [])[1];
  if (img && cr) credits[img.split("/").pop()] = cr.replace(/<[^>]+>/g, "").replace(/^\s*Photo:\s*/, "").replace(/\s+/g, " ").trim();
}

const CARDS = [
  ...NEIGHBORHOODS.map((n) => ({ href: `/neighborhoods/${n.slug}`, name: n.short, img: n.image, alt: n.alt, blurb: n.fit })),
  { href: "/gulf-shores-orange-beach", name: "Gulf Shores & Orange Beach, AL", img: "/images/orange-beach.jpg", alt: "Boat heading out past the piers and condo towers of Orange Beach, Alabama", blurb: "Alabama licensed, boating and Gulf-front condos" },
];

const CSS = `<style>
.area-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(210px,100%),1fr));gap:14px;max-width:1060px;margin:1.25rem auto 1rem}
.area-card{display:flex;flex-direction:column;background:var(--panel);border:1px solid var(--hair);border-radius:12px;overflow:hidden;text-decoration:none;transition:border-color .2s}
.area-card:hover{border-color:var(--gold-line)}
.area-card .nb-photo{aspect-ratio:16/10;overflow:hidden;line-height:0;background:var(--elev)}
.area-card .nb-photo img{width:100%;height:100%;object-fit:cover;display:block}
.area-card .area-body{padding:11px 13px 13px;display:flex;flex-direction:column;gap:3px;flex:1}
.area-card .area-name{color:#fff;font-family:var(--serif);font-size:16.5px;line-height:1.25}
.area-card .area-fit{color:var(--muted);font-size:12.5px;line-height:1.45}
.area-credits{max-width:1060px;margin:0 auto 2rem;font-size:11.5px;color:var(--mutedD);font-style:italic;text-align:center}
@media(max-width:520px){.area-grid{grid-template-columns:repeat(2,1fr);gap:10px}.area-card .area-name{font-size:14.5px}.area-card .area-fit{font-size:11.5px}}
</style>`;

const cardHtml = (c) => `<a class="area-card" href="${c.href}"><div class="nb-photo"><img src="${c.img}" alt="${esc(c.alt)}" loading="lazy" decoding="async"></div><div class="area-body"><span class="area-name">${esc(c.name)}</span><span class="area-fit">${esc(c.blurb)}</span></div></a>`;

const used = [...new Set(CARDS.map((c) => c.img.split("/").pop()))];
const creditLine = used.map((f) => credits[f]).filter((v, i, a) => v && a.indexOf(v) === i).join(" &middot; ");
const creditAttr = used.map((f) => f.replace(/\.[a-z]+$/, "")).join(" ");

const BLOCK = [
  START,
  CSS,
  `<div class="area-grid">`,
  ...CARDS.map(cardHtml),
  `</div>`,
  `<p class="area-credits" data-photo-credits="${creditAttr}">Photos: ${creditLine}</p>`,
  `<p class="area-more">Also serving <a href="https://pensacolamilitaryhousing.com/communities/destin">Destin</a> and <a href="https://pensacolamilitaryhousing.com/communities/niceville">Niceville</a> on the Okaloosa side.</p>`,
  END,
].join("\n");

let html = readFileSync(F, "utf8");
const a = html.indexOf(START), b = html.indexOf(END);
if (a > -1 && b > -1) {
  html = html.slice(0, a) + BLOCK + html.slice(b + END.length);
} else {
  const ca = html.indexOf('<div class="chips">');
  if (ca < 0) throw new Error("neither the AREA_CARDS markers nor the .chips block was found");
  const cb = html.indexOf("</div>", html.indexOf("Orange Beach, AL")) + "</div>".length;
  html = html.slice(0, ca) + BLOCK + html.slice(cb);
}
if (!DRY) writeFileSync(F, html, "utf8");
console.log(`${DRY ? "[dry] " : ""}area cards: ${CARDS.length} cards, ${used.length} images, credits for ${used.filter((f) => credits[f]).length}`);
