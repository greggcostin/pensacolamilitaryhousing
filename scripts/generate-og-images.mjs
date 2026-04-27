// Generate per-page OG images (1200×630 PNG) so each page gets a unique
// social-share preview instead of all 60+ pages sharing one generic image.
// Uses Sharp's SVG renderer — no browser, no external service.
//
// For each page:
//   1. Read its HTML, extract <h1> (or <title> as fallback)
//   2. Pick a category label (Base / Community / Guide / etc.) from the URL
//   3. Render an SVG with the category eyebrow + title + brand bar
//   4. Convert SVG → 1200×630 PNG, save to public/og/<slug>.png
//   5. Update the HTML's og:image / twitter:image meta tags

import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import sharp from "sharp";

const SITE = "https://pensacolamilitaryhousing.com";
const OG_DIR = "public/og";
const W = 1200, H = 630;

if (!existsSync(OG_DIR)) mkdirSync(OG_DIR, { recursive: true });

// ─── Helpers ───────────────────────────────────────────────────────────────

function escapeXml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

// Heuristic line-wrapping: break a string into N lines that each fit within
// `maxChars` characters. Splits on word boundaries.
function wrap(text, maxChars, maxLines) {
  const words = text.split(/\s+/);
  const lines = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? cur + " " + w : w;
    if (next.length <= maxChars) { cur = next; continue; }
    if (cur) lines.push(cur);
    cur = w;
    if (lines.length === maxLines - 1) {
      // Last line — pack what fits, ellipsize if needed
      while (cur.length + 1 + (words[words.indexOf(w) + 1] || "").length <= maxChars) {
        const nw = words[words.indexOf(w) + 1];
        if (!nw) break;
        cur += " " + nw;
      }
      break;
    }
  }
  if (cur && lines.length < maxLines) lines.push(cur);
  return lines.slice(0, maxLines);
}

// Categorize a page based on its URL path.
function categorize(filePath) {
  const p = filePath.replace(/\\/g, "/").replace(/^public\//, "/");
  if (p === "/index.html" || p === "/") return "Pensacola Military Real Estate";
  if (p.startsWith("/bases/")) return "Military Base Guide";
  if (p.startsWith("/communities/")) return "Community Profile";
  if (p.startsWith("/homes-for-sale-")) return "Homes for Sale";
  if (p.startsWith("/on-base-vs-off-base-")) return "On vs Off-Base Housing";
  if (/\bbah\b/i.test(p)) return "BAH & Affordability";
  if (/va-(loan|irrrl|funding|disability)/i.test(p) || /assumable-va/i.test(p) || /zero-down/i.test(p)) return "VA Loan & Financing";
  if (/(homestead|tax)/i.test(p)) return "Tax & Benefits";
  if (/(pcs|school)/i.test(p)) return "PCS Planning";
  if (/(divorce|dual-military|rental|first-time)/i.test(p)) return "Buyer Profile";
  if (/(vs-|comparison)/i.test(p)) return "Comparison Guide";
  if (/(faq|reviews|blog)/i.test(p)) return "Resource";
  return "Pensacola Military Housing";
}

// Strip HTML and extract page H1 (preferred) or <title>.
function extractTitle(html) {
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) {
    return h1[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  }
  const t = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (t) {
    return t[1].split("|")[0].trim();
  }
  return "Pensacola Military Housing";
}

// ─── SVG template ─────────────────────────────────────────────────────────
// Uses Georgia (built-in serif) + Arial (built-in sans) so it renders
// without bundling fonts. Gold/dark theme matches the site.

function buildSvg({ category, title }) {
  const lines = wrap(title, 32, 3);
  const lineHeight = 78;
  const startY = 290 - ((lines.length - 1) * lineHeight) / 2;
  const titleTspans = lines
    .map((ln, i) => `<tspan x="80" y="${startY + i * lineHeight}">${escapeXml(ln)}</tspan>`)
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0A0F1A"/>
      <stop offset="100%" stop-color="#1A2332"/>
    </linearGradient>
    <linearGradient id="goldFade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#C9A84C"/>
      <stop offset="100%" stop-color="#D4B768"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="${W}" height="${H}" fill="url(#bg)"/>

  <!-- Top gold accent bar -->
  <rect x="0" y="0" width="${W}" height="6" fill="url(#goldFade)"/>

  <!-- Eyebrow line + category -->
  <g>
    <rect x="80" y="100" width="48" height="2" fill="#C9A84C"/>
    <text x="148" y="108" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700" fill="#C9A84C" letter-spacing="3">${escapeXml(category.toUpperCase())}</text>
  </g>

  <!-- Title -->
  <text font-family="Georgia, 'Times New Roman', serif" font-size="64" font-weight="500" fill="#FFFFFF" letter-spacing="-1">
    ${titleTspans}
  </text>

  <!-- Bottom brand bar -->
  <rect x="0" y="${H - 90}" width="${W}" height="90" fill="rgba(201,168,76,0.10)"/>
  <rect x="0" y="${H - 90}" width="${W}" height="1" fill="rgba(201,168,76,0.35)"/>

  <!-- Bottom: site URL -->
  <text x="80" y="${H - 36}" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="700" fill="#C9A84C" letter-spacing="1">PensacolaMilitaryHousing.com</text>

  <!-- Bottom right: agent + phone -->
  <text x="${W - 80}" y="${H - 50}" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="600" fill="#E8E6DF" letter-spacing="0.5">Gregg Costin, Realtor® · Levin Rinke Realty</text>
  <text x="${W - 80}" y="${H - 24}" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="700" fill="#C9A84C" letter-spacing="0.5">(850) 266-5005</text>
</svg>`;
}

// ─── Walk public/ ─────────────────────────────────────────────────────────

function walk(dir, out = []) {
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    const p = `${dir}/${f.name}`;
    if (f.isDirectory()) walk(p, out);
    else if (f.isFile() && /\.html$/.test(f.name)) out.push(p);
  }
  return out;
}

// Convert public/foo/bar.html → og/foo-bar.png (slug-style, flat dir).
function ogPath(htmlPath) {
  const rel = htmlPath.replace(/\\/g, "/").replace(/^public\//, "").replace(/\.html$/, "");
  const slug = rel.replace(/\//g, "-");
  return `${OG_DIR}/${slug}.png`;
}

const pages = walk("public");
let generated = 0, updated = 0;

for (const path of pages) {
  const html = readFileSync(path, "utf8");
  const title = extractTitle(html);
  const category = categorize(path);
  const outPath = ogPath(path);

  // 1) Render SVG → PNG
  const svg = buildSvg({ category, title });
  await sharp(Buffer.from(svg)).png({ quality: 90, compressionLevel: 9 }).toFile(outPath);
  generated++;

  // 2) Update HTML's og:image and twitter:image meta tags
  const ogUrl = `${SITE}/${outPath.replace(/^public\//, "")}`;
  let updatedHtml = html;
  updatedHtml = updatedHtml.replace(
    /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:image" content="${ogUrl}" />`
  );
  updatedHtml = updatedHtml.replace(
    /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:image" content="${ogUrl}">`
  );
  if (updatedHtml !== html) {
    writeFileSync(path, updatedHtml, "utf8");
    updated++;
  }
}

console.log(`Generated ${generated} OG images in ${OG_DIR}/`);
console.log(`Updated og:image / twitter:image meta tags on ${updated} HTML files.`);
