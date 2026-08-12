// Page factory: assemble a new public/<slug>.html from the site's proven template
// (nav, modal, sticky CTA, search, footer, analytics all inherited verbatim) plus a
// per-page fragment file.
//
// Fragment format (scratchpad/pages/<slug>.fragment.html):
//   <!--PAGE
//   { ...head fields json... }
//   PAGE-->
//   ...main content HTML (site CSS classes)...
//
// JSON fields: slug, title, description, keywords, breadcrumbName, h1, lead,
//   articleHeadline, figure {src,alt,caption}|null, faq [{q,a}], related [{href,label}]
//
// Usage: node scripts/page-factory.mjs <fragment-file> [more fragments...]
// Fragment examples from the Aug 2026 build: see git history of docs/ or ask Claude.

import { readFileSync, writeFileSync } from "node:fs";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^/(w:)/, "$1") + "/";
const TEMPLATE_PATH = ROOT + "public/first-time-military-homebuyer.html";
const TODAY_ISO = "2026-08-12";
const TODAY_LONG = "August 12, 2026";
const MONTH_YEAR = "August 2026";

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const jesc = (s) => JSON.stringify(s); // JSON-safe string with quotes

function buildPage(fragmentPath) {
  const frag = readFileSync(fragmentPath, "utf8");
  const m = /<!--PAGE\s*([\s\S]*?)\s*PAGE-->/m.exec(frag);
  if (!m) throw new Error("No PAGE json block in " + fragmentPath);
  const spec = JSON.parse(m[1]);
  const mainHTML = frag.slice(m.index + m[0].length).trim();

  let html = readFileSync(TEMPLATE_PATH, "utf8");

  // sanity: template markers
  for (const marker of ['<main data-pagefind-body>', "</main>", "<!-- EXPLORE_V2 -->", "inquiry-modal", "sticky-mobile-cta"]) {
    if (!html.includes(marker)) throw new Error("Template missing marker: " + marker);
  }

  const OLD_URL = "https://pensacolamilitaryhousing.com/first-time-military-homebuyer";
  const NEW_URL = "https://pensacolamilitaryhousing.com/" + spec.slug;

  // ---- head ----
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(spec.title)}</title>`);
  html = html.replace(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${esc(spec.description)}" />`);
  html = html.replace(/<meta name="keywords" content="[^"]*">/, `<meta name="keywords" content="${esc(spec.keywords)}">`);
  html = html.split(OLD_URL).join(NEW_URL);
  html = html.replace(/\/og\/first-time-military-homebuyer\.png/g, `/og/${spec.slug}.png`);
  html = html.replace(/<meta property="og:title" content="[^"]*"\s*\/>/, `<meta property="og:title" content="${esc(spec.title)}" />`);
  html = html.replace(/<meta property="og:description" content="[^"]*"\s*\/>/, `<meta property="og:description" content="${esc(spec.description)}" />`);

  // Article JSON-LD: headline, description, dates (function replacements — content may contain "$n")
  html = html.replace(/("@type":"Article","headline":")[^"]*(")/, (_, a, b) => a + spec.articleHeadline.replace(/"/g, '\\"') + b);
  html = html.replace(/("@type":"Article","headline":"[^"]*","description":")[^"]*(")/, (_, a, b) => a + spec.description.replace(/"/g, '\\"') + b);
  html = html.replace(/"datePublished":"[^"]*"/, `"datePublished":"${TODAY_ISO}"`);
  html = html.replace(/"dateModified":"[^"]*"/, `"dateModified":"${TODAY_ISO}"`);
  html = html.replace(/<meta property="article:published_time" content="[^"]*"\s*\/>/, `<meta property="article:published_time" content="${TODAY_ISO}T00:00:00Z" />`);
  html = html.replace(/<meta property="article:modified_time" content="[^"]*"\s*\/>/, `<meta property="article:modified_time" content="${TODAY_ISO}T00:00:00Z" />`);

  // Breadcrumb: position-3 name
  html = html.replace(/("@type":"ListItem","position":3,"name":")[^"]*(")/, `$1${spec.breadcrumbName.replace(/"/g, '\\"')}$2`);

  // FAQPage JSON-LD: replace existing block (or drop if no faq)
  const faqLd = spec.faq && spec.faq.length
    ? `{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[${spec.faq.map(f => `{"@type":"Question","name":${jesc(f.q)},"acceptedAnswer":{"@type":"Answer","text":${jesc(f.a.replace(/<[^>]+>/g, ""))}}}`).join(",")}]}`
    : null;
  html = html.replace(/<script type="application\/ld\+json">\s*\{"@context":"https:\/\/schema\.org","@type":"FAQPage"[\s\S]*?<\/script>/, faqLd ? `<script type="application/ld+json">\n${faqLd}\n</script>` : "");

  // header h1 + lead
  html = html.replace(/<h1>[\s\S]*?<\/h1>/, `<h1>${spec.h1}</h1>`);
  html = html.replace(/<p class="lead">[\s\S]*?<\/p>/, `<p class="lead">${spec.lead}</p>`);

  // ---- main ----
  const mainStart = html.indexOf("<main data-pagefind-body>");
  const mainEnd = html.indexOf("</main>");
  const oldMain = html.slice(mainStart + "<main data-pagefind-body>".length, mainEnd);

  // reuse template author-card with refreshed date — take the WHOLE line (the lazy
  // </div></div> regex used previously stopped one close-tag short and unbalanced the page)
  const acLine = oldMain.split("\n").find((l) => l.includes('class="author-card"'));
  if (!acLine) throw new Error("No author-card in template main");
  const openDivs = (acLine.match(/<div\b/g) || []).length;
  const closeDivs = (acLine.match(/<\/div>/g) || []).length;
  if (openDivs !== closeDivs) throw new Error(`author-card line unbalanced: ${openDivs} open vs ${closeDivs} close`);
  const authorCard = acLine.trim().replace(/Reviewed &amp; updated &middot; [A-Za-z]+ \d{4}/, `Reviewed &amp; updated &middot; ${MONTH_YEAR}`);

  // reuse template Explore grid verbatim — minus the template's own Related Guides block
  const exMatch = /<!-- EXPLORE_V2 -->[\s\S]*?<!-- \/EXPLORE_V2 -->/.exec(oldMain);
  if (!exMatch) throw new Error("No explore grid in template main");
  const explore = exMatch[0].replace(/<!-- RELATED_GUIDES_START -->[\s\S]*?<!-- RELATED_GUIDES_END -->\s*/, "");

  const figure = spec.figure
    ? `<figure class="figure-band"><picture><source srcset="${spec.figure.src.replace(/\.(jpe?g|png)$/, ".avif")}" type="image/avif"><source srcset="${spec.figure.src.replace(/\.(jpe?g|png)$/, ".webp")}" type="image/webp"><img src="${spec.figure.src}" width="1600" height="900" alt="${esc(spec.figure.alt)}" fetchpriority="high" decoding="async"></picture><figcaption>${spec.figure.caption}</figcaption></figure>\n`
    : "";

  const faqVisible = spec.faq && spec.faq.length
    ? `\n<h2>Frequently Asked Questions</h2>\n` + spec.faq.map((f, i) => `<details${i === 0 ? " open" : ""}><summary>${f.q}</summary><p>${f.a}</p></details>`).join("\n")
    : "";

  const related = spec.related && spec.related.length
    ? `\n<!-- RELATED_GUIDES_START -->\n<h2>Related Guides for This Page</h2>\n<div class="related">\n${spec.related.map(r => `<a href="${r.href}">${r.label}</a>`).join("\n")}\n</div>\n<!-- RELATED_GUIDES_END -->`
    : "";

  const newMain = `\n${authorCard}\n${figure}${mainHTML}${faqVisible}${related}\n${explore}\n`;
  html = html.slice(0, mainStart + "<main data-pagefind-body>".length) + newMain + html.slice(mainEnd);

  // footer stamps
  html = html.replace(/Last updated: [A-Za-z]+ \d{1,2}, \d{4}/, `Last updated: ${TODAY_LONG}`);
  html = html.replace(/Content last verified: [A-Za-z]+ \d{4}/, `Content last verified: ${MONTH_YEAR}`);

  const outPath = ROOT + "public/" + spec.slug + ".html";
  writeFileSync(outPath, html);

  // sitemap entry
  const smPath = ROOT + "public/sitemap.xml";
  let sm = readFileSync(smPath, "utf8");
  if (!sm.includes(NEW_URL + "<")) {
    sm = sm.replace("</urlset>", `  <url>\n    <loc>${NEW_URL}</loc>\n    <lastmod>${TODAY_ISO}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n</urlset>`);
    writeFileSync(smPath, sm);
  }
  console.log("BUILT:", spec.slug, `(${Math.round(html.length / 1024)}KB)`);
}

for (const f of process.argv.slice(2)) buildPage(f);
