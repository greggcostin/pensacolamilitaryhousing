// Shared page-assembly library for greggcostin.com (civilian-site/).
// Extracts the live chrome (trackers/CSS/nav/footer/modal) from civilian-site/index.html
// at build time so generated pages always match the current design, then emits
// self-contained pages in the same convention as the hand-built ones.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export const ROOT = fileURLToPath(new URL("..", import.meta.url)).replace(/\\/g, "/");
export const SITE_DIR = ROOT + "civilian-site";
export const SITE = "https://greggcostin.com";

export const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const CREDITS_PATH = ROOT + "content/blog/image-credits.json";
export function creditFor(srcPath) {
  try {
    const c = JSON.parse(readFileSync(CREDITS_PATH, "utf8")).images;
    const e = c["civilian-site" + srcPath.replace(/^\//, "/images/").replace("/images//", "/images/")] || c["civilian-site/images/" + srcPath.split("/").pop()];
    if (!e) return null;
    return { credit: e.credit || e.artist || "", license: e.license || "", pageUrl: e.pageUrl || "", required: !!e.creditRequired };
  } catch { return null; }
}

export function chrome() {
  const idx = readFileSync(`${SITE_DIR}/index.html`, "utf8");
  const headStart = idx.indexOf('<script async src="https://www.googletagmanager.com');
  const headEnd = idx.indexOf("</head>");
  const navStart = idx.indexOf('<nav class="main-banner"');
  const navEnd = idx.indexOf("</nav>") + 6;
  const tail = idx.slice(idx.indexOf("<footer>"));
  if (headStart < 0 || navStart < 0 || tail.length < 100) throw new Error("chrome extraction failed on index.html");
  return { sharedHead: idx.slice(headStart, headEnd), nav: idx.slice(navStart, navEnd), tail };
}

export function figureBand({ src, webp, alt, caption, width, height, tall = false, ratio43 = false }) {
  const cr = creditFor(src);
  let cap = caption || "";
  if (cr && cr.required && !/Photo:/.test(cap)) {
    cap += `${cap ? " " : ""}Photo: <a href="${esc(cr.pageUrl)}" rel="noopener nofollow" target="_blank">${esc(cr.credit)}</a>, ${esc(cr.license)}`;
  }
  const cls = "figure-band" + (tall ? " figure-band--tall" : "") + (ratio43 ? " figure-band--43" : "");
  return `<figure class="${cls}"><picture>${webp ? `<source srcset="${webp}" type="image/webp">` : ""}<img src="${src}" width="${width}" height="${height}" alt="${esc(alt)}" loading="lazy" decoding="async"></picture>${cap ? `<figcaption>${cap}</figcaption>` : ""}</figure>`;
}

// Assemble and write a page. spec: {file, path, title, desc, keywords, ogSlug, h1, lead, main, schemaBlocks[], dateISO}
export function buildPage(spec) {
  const { sharedHead, nav, tail } = chrome();
  const url = SITE + spec.path;
  const og = `${SITE}/og/${spec.ogSlug}.png`;
  const html = `<!doctype html>
<html lang="en">
<head>
<script>if(location.hostname.indexOf('.pages.dev')>-1)location.replace('https://greggcostin.com'+location.pathname+location.search);</script>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(spec.title)}</title>
<meta name="description" content="${esc(spec.desc)}" />
<meta name="keywords" content="${esc(spec.keywords)}">
<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">
<meta name="author" content="Gregg Costin, Realtor">
<meta name="geo.region" content="US-FL">
<meta name="geo.placename" content="Pensacola">
<meta name="geo.position" content="30.4213;-87.2169">
<meta name="ICBM" content="30.4213, -87.2169">
<link rel="canonical" href="${url}">
<link rel="alternate" hreflang="en-US" href="${url}">
<link rel="alternate" hreflang="x-default" href="${url}">
<link rel="icon" type="image/png" href="/images/favicon.png">
<link rel="apple-touch-icon" href="/images/favicon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#0A0F1A">
<meta property="og:title" content="${esc(spec.title)}" />
<meta property="og:description" content="${esc(spec.desc)}" />
<meta property="og:url" content="${url}">
<meta property="og:image" content="${og}" />
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="en_US">
<meta property="og:type" content="${spec.ogType || "website"}">
<meta property="og:site_name" content="Gregg Costin | The Costin Team">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:url" content="${url}">
<meta name="twitter:title" content="${esc(spec.title)}" />
<meta name="twitter:description" content="${esc(spec.desc)}" />
<meta name="twitter:image" content="${og}">
${(spec.schemaBlocks || []).map((b) => `<script type="application/ld+json">${JSON.stringify(b)}</script>`).join("\n")}
${sharedHead}</head>
<body>
${nav}
<header>
<h1>${esc(spec.h1)}</h1>
<p class="lead">${spec.lead}</p>
</header>
<main>
${spec.main}
</main>
${tail}`;
  writeFileSync(`${SITE_DIR}/${spec.file}`, html);
  return html;
}

export function breadcrumbs(items) {
  return { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: SITE + it.path })) };
}
export function webPage(type, spec) {
  return { "@context": "https://schema.org", "@type": type, name: spec.title, description: spec.desc, url: SITE + spec.path, isPartOf: { "@type": "WebSite", "@id": `${SITE}/#website`, name: "Gregg Costin | The Costin Team", url: SITE }, about: { "@id": `${SITE}/#team` }, datePublished: spec.dateISO, dateModified: spec.dateISO, inLanguage: "en-US" };
}
export function faqPage(faqs) {
  return { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
}

export async function makeOgCard(slug, titleLines, sub) {
  const { default: sharp } = await import("sharp");
  const escSvg = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const titleSvg = titleLines.map((l, i) => `<text x="90" y="${300 + i * 84}" font-family="Georgia, serif" font-size="72" fill="#FFFFFF">${escSvg(l)}</text>`).join("");
  const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#0A0F1A"/><rect x="0" y="0" width="1200" height="6" fill="#C9A84C"/>
  <text x="90" y="180" font-family="Verdana, sans-serif" font-size="26" letter-spacing="6" fill="#C9A84C">THE COSTIN TEAM &#183; PENSACOLA, FL</text>
  ${titleSvg}
  <rect x="90" y="${330 + (titleLines.length - 1) * 84 + 40}" width="140" height="4" fill="#C9A84C"/>
  <text x="90" y="${330 + (titleLines.length - 1) * 84 + 96}" font-family="Verdana, sans-serif" font-size="28" fill="#A5A496">${escSvg(sub)}</text>
  <text x="90" y="566" font-family="Verdana, sans-serif" font-size="26" fill="#C9A84C">&#9733;&#9733;&#9733;&#9733;&#9733;  5.0 on Google &amp; Zillow &#183; GreggCostin.com &#183; (850) 266-5005</text>
</svg>`;
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(`${SITE_DIR}/og/${slug}.png`);
}

/* ------- hard gates (mirrors blog-factory rigor) ------- */
export function gate(spec, html) {
  const errs = [];
  if (spec.title.length > 65) errs.push(`title ${spec.title.length}>65`);
  if (spec.desc.length < 120 || spec.desc.length > 165) errs.push(`desc ${spec.desc.length} not in 120-165`);
  const stripped = html.replace(/PCS \/ Relocation — (Buying|Selling)/g, "");
  if (stripped.includes("—")) errs.push("em dash present");
  const words = (html.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " ").match(/\S+/g) || []).length;
  if (spec.minWords && words < spec.minWords) errs.push(`words ${words}<${spec.minWords}`);
  const dOpen = (html.match(/<div\b/g) || []).length, dClose = (html.match(/<\/div>/g) || []).length;
  if (dOpen !== dClose) errs.push(`div imbalance ${dOpen}/${dClose}`);
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(m[1]); } catch (e) { errs.push(`bad JSON-LD: ${e.message.slice(0, 40)}`); }
  }
  return errs;
}
