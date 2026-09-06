import { guardAnalytics } from "./analytics-host-guard.mjs";
import { applyMilitaryMeta } from "./military-meta-lib.mjs";
// Page factory: assemble a new public/<slug>.html from the site's proven template
// (nav, modal, sticky CTA, search, footer, analytics all inherited verbatim) plus a
// per-page fragment file.
//
// Fragment format (<slug>.fragment.html):
//   <!--PAGE
//   { ...head fields json... }
//   PAGE-->
//   ...main content HTML (site CSS classes)...
//
// JSON fields: slug, title, description, keywords, breadcrumbName, h1, lead,
//   articleHeadline, figure {src,alt,caption}|null, faq [{q,a}], related [{href,label}]
//
// Usage: node scripts/page-factory.mjs <fragment-file> [more fragments...]

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { placeQuickAnswer } from "./quick-answer-lib.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url)).replace(/\\/g, "/");
const TEMPLATE_PATH = ROOT + "public/first-time-military-homebuyer.html";
const TODAY_ISO = "2026-09-02";
const TODAY_LONG = "September 2, 2026";
const MONTH_YEAR = "September 2026";

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const jesc = (s) => JSON.stringify(s);

// The template page has no data tables, so its head CSS lacks the .bah-wrap /
// .bah-table rules — including the overflow-x:auto that stops wide tables from
// causing sideways scroll on phones. Injected into every built page.
const BAH_TABLE_CSS = `
/*BAH_TABLE_CSS*/
.bah-title{margin:1.25rem 0 .5rem;color:var(--gold);font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:600}
.bah-wrap{border:1px solid var(--hair);border-radius:10px;overflow:hidden;overflow-x:auto;margin:1rem 0}
.bah-wrap>table{margin:0;border:none;border-radius:0}
.bah-table{width:100%;border-collapse:collapse;min-width:500px;font-size:14px}
.bah-table thead th{background:var(--panel);color:var(--gold);font-weight:600;letter-spacing:1px;text-transform:uppercase;font-size:11px;padding:12px 16px;text-align:left;border-bottom:1px solid var(--hair)}
.bah-table tbody tr:nth-child(even){background:rgba(255,255,255,.02)}
.bah-table tbody td{padding:10px 16px;border-bottom:1px solid var(--hair);color:var(--text)}
.bah-table tbody td:first-child{font-weight:500;color:#fff}
.bah-table tbody td:nth-child(2){color:var(--gold);font-weight:600}
@media(max-width:900px){.bah-wrap{border-radius:8px}.bah-table{font-size:13px}.bah-table thead th,.bah-table tbody td{padding:9px 10px}}
@media(max-width:480px){.bah-table{font-size:12px;min-width:320px}.bah-table thead th{font-size:10px;padding:8px 8px}.bah-table tbody td{padding:8px 8px}}
/*PHONE_BANNER_CSS — small-phone banner shrink the template page was missing (nowrap email forced 38px sideways scroll under 480px)*/
@media(max-width:480px){
main{padding:24px 14px 14px!important}
header{padding:32px 14px 22px!important}
h1{font-size:clamp(22px,7vw,30px)!important}
h2{font-size:19px!important}
.main-banner .banner-lrr img,.main-banner .banner-logo img{height:44px!important}
.main-banner .banner-phone{font-size:13px!important}
.main-banner .banner-email{font-size:9px!important}
.main-banner .banner-tabs>a,.main-banner .banner-tabs .dropdown>button{padding:4px 6px!important;font-size:9px!important;letter-spacing:.3px!important}
}
/*READING_CSS — sitewide long-form legibility (Aug 2026): regular weight (300
shimmers on the dark scheme), 17px, ~72ch text column; media/tables full width.*/
main p,main ul,main ol,main h2,main h3,main details,main blockquote{max-width:760px;margin-left:auto;margin-right:auto}
main p{font-size:17px;line-height:1.75;font-weight:400}
main ul,main ol{font-size:16.5px;line-height:1.7;font-weight:400}
main li{margin:.4rem 0}
main details p{font-size:16px}
@media(max-width:640px){main p{font-size:16.5px}main ul,main ol{font-size:16px}}
`;

function buildPage(fragmentPath) {
  const frag = readFileSync(fragmentPath, "utf8");
  const m = /<!--PAGE\s*([\s\S]*?)\s*PAGE-->/m.exec(frag);
  if (!m) throw new Error("No PAGE json block in " + fragmentPath);
  const spec = JSON.parse(m[1]);
  const mainHTML = frag.slice(m.index + m[0].length).trim();

  let html = readFileSync(TEMPLATE_PATH, "utf8");

  for (const marker of ["<main data-pagefind-body>", "</main>", "<!-- EXPLORE_V2 -->", "inquiry-modal", "sticky-mobile-cta"]) {
    if (!html.includes(marker)) throw new Error("Template missing marker: " + marker);
  }

  const OLD_URL = "https://pensacolamilitaryhousing.com/first-time-military-homebuyer";
  const NEW_URL = "https://pensacolamilitaryhousing.com/" + spec.slug;

  // ---- head (function replacements — content may contain "$n" patterns) ----
  html = html.replace(/<title>[\s\S]*?<\/title>/, () => `<title>${esc(spec.title)}</title>`);
  html = html.replace(/<meta name="description" content="[^"]*"\s*\/>/, () => `<meta name="description" content="${esc(spec.description)}" />`);
  html = html.replace(/<meta name="keywords" content="[^"]*">/, () => `<meta name="keywords" content="${esc(spec.keywords)}">`);
  html = html.split(OLD_URL).join(NEW_URL);
  html = html.replace(/\/og\/first-time-military-homebuyer\.png/g, `/og/${spec.slug}.png`);
  html = html.replace(/<meta property="og:title" content="[^"]*"\s*\/>/, () => `<meta property="og:title" content="${esc(spec.title)}" />`);
  html = html.replace(/<meta property="og:description" content="[^"]*"\s*\/>/, () => `<meta property="og:description" content="${esc(spec.description)}" />`);
  html = html.replace(/<meta name="twitter:title" content="[^"]*">/, () => `<meta name="twitter:title" content="${esc(spec.title)}">`); // twitter:url follows the canonical via OLD_URL -> NEW_URL
  html = html.replace(/<meta name="twitter:description" content="[^"]*">/, () => `<meta name="twitter:description" content="${esc(spec.description)}">`);

  html = html.replace(/("@type":"Article","headline":")[^"]*(")/, (_, a, b) => a + spec.articleHeadline.replace(/"/g, '\\"') + b);
  html = html.replace(/("@type":"Article","headline":"[^"]*","description":")[^"]*(")/, (_, a, b) => a + spec.description.replace(/"/g, '\\"') + b);
  html = html.replace(/"datePublished":"[^"]*"/, `"datePublished":"${TODAY_ISO}"`);
  html = html.replace(/"dateModified":"[^"]*"/, `"dateModified":"${TODAY_ISO}"`);
  html = html.replace(/<meta property="article:published_time" content="[^"]*"\s*\/>/, `<meta property="article:published_time" content="${TODAY_ISO}T00:00:00Z" />`);
  html = html.replace(/<meta property="article:modified_time" content="[^"]*"\s*\/>/, `<meta property="article:modified_time" content="${TODAY_ISO}T00:00:00Z" />`);

  html = html.replace(/("@type":"ListItem","position":3,"name":")[^"]*(")/, (_, a, b) => a + spec.breadcrumbName.replace(/"/g, '\\"') + b);

  const faqLd = spec.faq && spec.faq.length
    ? `{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[${spec.faq.map(f => `{"@type":"Question","name":${jesc(f.q)},"acceptedAnswer":{"@type":"Answer","text":${jesc(f.a.replace(/<[^>]+>/g, ""))}}}`).join(",")}]}`
    : null;
  html = html.replace(/<script type="application\/ld\+json">\s*\{"@context":"https:\/\/schema\.org","@type":"FAQPage"[\s\S]*?<\/script>/, () => faqLd ? `<script type="application/ld+json">\n${faqLd}\n</script>` : "");

  html = html.replace(/<h1>[\s\S]*?<\/h1>/, () => `<h1>${spec.h1}</h1>`);
  html = html.replace(/<p class="lead">[\s\S]*?<\/p>/, () => `<p class="lead">${spec.lead}</p>`);

  if (!html.includes("/*BAH_TABLE_CSS*/")) {
    html = html.replace("</style>", BAH_TABLE_CSS + "</style>");
  }

  // ---- main ----
  const mainStart = html.indexOf("<main data-pagefind-body>");
  const mainEnd = html.indexOf("</main>");
  const oldMain = html.slice(mainStart + "<main data-pagefind-body>".length, mainEnd);

  // Author-card: take the WHOLE line and assert tag balance (a lazy </div></div>
  // regex once stopped one close-tag short and unbalanced every generated page).
  const acLine = oldMain.split("\n").find((l) => l.includes('class="author-card"'));
  if (!acLine) throw new Error("No author-card in template main");
  const openDivs = (acLine.match(/<div\b/g) || []).length;
  const closeDivs = (acLine.match(/<\/div>/g) || []).length;
  if (openDivs !== closeDivs) throw new Error(`author-card line unbalanced: ${openDivs} open vs ${closeDivs} close`);
  const authorCard = acLine.trim().replace(/Reviewed &amp; updated &middot; [A-Za-z]+ \d{4}/, `Reviewed &amp; updated &middot; ${MONTH_YEAR}`);

  // Explore grid verbatim — minus the template's own Related Guides block
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
  // geo-03: optional dated quick-answer block right after the lead (spec.quickAnswer, 2-4 sentences with the page's key figure)
  html = html.replace(/<div class="quick-answer" data-quick-answer>[\s\S]*?<\/div>\n?/, "");
  if (spec.quickAnswer) html = placeQuickAnswer(html, { text: spec.quickAnswer });

  html = html.replace(/Last updated: [A-Za-z]+ \d{1,2}, \d{4}/, `Last updated: ${TODAY_LONG}`);
  html = html.replace(/Content last verified: [A-Za-z]+ \d{4}/, `Content last verified: ${MONTH_YEAR}`);

  // final guard: generated page must have balanced div tags
  const totalOpen = (html.match(/<div\b/g) || []).length;
  const totalClose = (html.match(/<\/div>/g) || []).length;
  if (totalOpen !== totalClose) throw new Error(`${spec.slug}: unbalanced divs (${totalOpen} open vs ${totalClose} close) — refusing to write`);

  writeFileSync(ROOT + "public/" + spec.slug + ".html", guardAnalytics(applyMilitaryMeta(html)));

  const smPath = ROOT + "public/sitemap.xml";
  let sm = readFileSync(smPath, "utf8");
  if (!sm.includes(NEW_URL + "<")) {
    sm = sm.replace("</urlset>", `  <url>\n    <loc>${NEW_URL}</loc>\n    <lastmod>${TODAY_ISO}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n</urlset>`);
    writeFileSync(smPath, sm);
  }
  console.log("BUILT:", spec.slug, `(${Math.round(html.length / 1024)}KB)`);
}

for (const f of process.argv.slice(2)) buildPage(f);
