// Generate OG images (1200×630 PNG) for the 5 SPA shell routes, using the same
// SVG template/brand look as generate-og-images.mjs (which only walks public/*.html
// and so never covered the SPA routes). Driven by src/routeMeta.js so the image
// headline always matches the route's H1.
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import sharp from "sharp";
import { ROUTE_META } from "../src/routeMeta.js";

const OG_DIR = "public/og";
const W = 1200, H = 630;
if (!existsSync(OG_DIR)) mkdirSync(OG_DIR, { recursive: true });

const CATEGORY = {
  "pcs-guide": "PCS Planning",
  "communities": "Community Guide",
  "mortgage-calculators": "BAH & Affordability",
  "about": "Meet Your Realtor",
  "contact": "Get In Touch",
};

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

function wrap(text, maxChars, maxLines) {
  const words = text.split(/\s+/);
  const lines = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? cur + " " + w : w;
    if (next.length <= maxChars) { cur = next; continue; }
    if (cur) lines.push(cur);
    cur = w;
    if (lines.length === maxLines) break;
  }
  if (cur && lines.length < maxLines) lines.push(cur);
  return lines.slice(0, maxLines);
}

function buildSvg({ category, title }) {
  const lines = wrap(title, 32, 3);
  const lineHeight = 78;
  const startY = 290 - ((lines.length - 1) * lineHeight) / 2;
  const titleTspans = lines.map((ln, i) => `<tspan x="80" y="${startY + i * lineHeight}">${esc(ln)}</tspan>`).join("");
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0A0F1A"/><stop offset="100%" stop-color="#1A2332"/>
    </linearGradient>
    <linearGradient id="goldFade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#C9A84C"/><stop offset="100%" stop-color="#D4B768"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect x="0" y="0" width="${W}" height="6" fill="url(#goldFade)"/>
  <g>
    <rect x="80" y="100" width="48" height="2" fill="#C9A84C"/>
    <text x="148" y="108" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700" fill="#C9A84C" letter-spacing="3">${esc(category.toUpperCase())}</text>
  </g>
  <text font-family="Georgia, 'Times New Roman', serif" font-size="64" font-weight="500" fill="#FFFFFF" letter-spacing="-1">
    ${titleTspans}
  </text>
  <rect x="0" y="${H - 90}" width="${W}" height="90" fill="rgba(201,168,76,0.10)"/>
  <rect x="0" y="${H - 90}" width="${W}" height="1" fill="rgba(201,168,76,0.35)"/>
  <text x="80" y="${H - 36}" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="700" fill="#C9A84C" letter-spacing="1">PensacolaMilitaryHousing.com</text>
</svg>`;
}

for (const r of ROUTE_META.filter((e) => e.shell)) {
  const svg = buildSvg({ category: CATEGORY[r.file] || "Pensacola Military Housing", title: r.heading });
  const out = `${OG_DIR}/${r.file}.png`;
  await sharp(Buffer.from(svg)).png().toFile(out);
  console.log(`wrote ${out}  ("${r.heading}")`);
}
console.log("done — 5 SPA-route OG images generated");
