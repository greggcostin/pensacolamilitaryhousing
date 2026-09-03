// Blog factory: builds /blog/<slug> static post pages from content/blog/*.fragment.html,
// regenerates the /blog index (cards + head schema), appends sitemap entries, and
// maintains content/blog/ledger.json (the blog engine's memory).
//
// Fragment format (content/blog/<slug>.fragment.html):
//   <!--PAGE
//   { "slug", "title", "description", "keywords", "category", "datePublished",
//     "dateModified", "readTime", "h1", "lead", "excerpt",
//     "targetKeywords": [..], "faq": [{q,a}]?, "related": [{href,label}]? }
//   PAGE-->
//   ...post body HTML (site CSS classes: h2/h3/p/ul/.facts/.bah-wrap tables/.cta/.inq-cta)...
//
// Usage:
//   node scripts/blog-factory.mjs                  # build ALL fragments + index
//   node scripts/blog-factory.mjs <slug> [...]     # build specific slugs + index

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { placeQuickAnswer } from "./quick-answer-lib.mjs"; import { IDS } from "./entity-lib.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url)).replace(/\\/g, "/");
const TEMPLATE_PATH = ROOT + "public/first-time-military-homebuyer.html";
const CONTENT_DIR = ROOT + "content/blog/";
const OUT_DIR = ROOT + "public/blog/";
const INDEX_PATH = ROOT + "public/blog.html";
const LEDGER_PATH = ROOT + "content/blog/ledger.json";
const SITE = "https://pensacolamilitaryhousing.com";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const jesc = (s) => JSON.stringify(String(s));

// License + attribution ledger written by scripts/fetch-stock-image.mjs.
// CC-BY / CC-BY-SA images MUST show their credit in the visible figcaption;
// the factory appends it automatically so compliance can't be forgotten.
const CREDITS_PATH = ROOT + "content/blog/image-credits.json";
const IMAGE_CREDITS = existsSync(CREDITS_PATH) ? JSON.parse(readFileSync(CREDITS_PATH, "utf8")).images : {};

function creditLine(src) {
  const e = IMAGE_CREDITS[src];
  if (!e) return "";
  const isCC = /^cc\b/i.test(e.license) && !/cc0/i.test(e.license);
  if (isCC) return ` Photo: <a href="${e.pageUrl}" rel="noopener nofollow" target="_blank">${esc(e.credit)}</a>, ${esc(e.license)}.`;
  return ` Photo: ${esc(e.credit)}.`;
}

// Canonical figure markup: AVIF/WebP <picture>, hero eager / inline lazy,
// credit auto-appended from the ledger when the caption doesn't already carry one.
function figureHTML(fig, { hero = false } = {}) {
  const src = fig.src;
  if (!existsSync(ROOT + "public" + src)) throw new Error(`figure image missing on disk: public${src}`);
  const avif = src.replace(/\.(jpe?g|png)$/i, ".avif");
  const webp = src.replace(/\.(jpe?g|png)$/i, ".webp");
  const load = hero ? `fetchpriority="high"` : `loading="lazy"`;
  const posStyle = fig.pos ? ` style="object-position:${fig.pos}"` : "";
  let caption = (fig.caption || "").trim();
  const cl = creditLine(src);
  if (cl && !/Photo:/.test(caption)) caption += cl;
  return `<figure class="figure-band"><picture><source srcset="${avif}" type="image/avif"><source srcset="${webp}" type="image/webp"><img src="${src}" width="1600" height="900" alt="${esc(fig.alt)}" ${load} decoding="async"${posStyle}></picture><figcaption>${caption.trim()}</figcaption></figure>`;
}

// Rewrite every figure-band in body HTML to the canonical form above, so
// fragment authors (and the engine) can write a bare <img> and still ship
// modern formats + license credits.
function upgradeBodyFigures(body) {
  return body.replace(/<figure class="figure-band"[^>]*>\s*(?:<picture>[\s\S]*?<\/picture>|<img\b[^>]*>)\s*(?:<figcaption>[\s\S]*?<\/figcaption>)?\s*<\/figure>/g, (m) => {
    const img = (/<img\b[^>]*>/.exec(m) || [])[0] || "";
    const src = (/src="([^"]+)"/.exec(img) || [])[1];
    if (!src) return m;
    const alt = (/alt="([^"]*)"/.exec(img) || [])[1] || "";
    const caption = (/<figcaption>([\s\S]*?)<\/figcaption>/.exec(m) || [])[1] || "";
    const pos = (/object-position:\s*([^";]+)/.exec(m) || [])[1];
    return figureHTML({ src, alt, caption, pos }, { hero: false });
  });
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const longDate = (iso) => { const [y, m, d] = iso.split("-").map(Number); return `${MONTHS[m - 1]} ${d}, ${y}`; };
const monthYear = (iso) => { const [y, m] = iso.split("-").map(Number); return `${MONTHS[m - 1]} ${y}`; };

// same small-phone + table CSS contract as page-factory
const EXTRA_CSS = `
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
/*PHONE_BANNER_CSS*/
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
/*BLOG_CSS*/
.post-topmeta{display:flex;gap:12px;align-items:center;flex-wrap:wrap;justify-content:center;margin:0 0 14px}
.post-topmeta .cat{background:var(--gold-tint);border:1px solid var(--gold-line);color:var(--gold);font-size:11px;font-weight:600;padding:4px 12px;border-radius:4px;letter-spacing:1px;text-transform:uppercase}
.post-topmeta span{color:var(--muted);font-size:13px}
.backlink{display:inline-block;color:var(--gold);font-size:13px;letter-spacing:1px;margin-bottom:6px;text-decoration:none}
/*FACTS_CSS — quick-facts callout box (same look as the guide pages); the blog
template lacked these rules so .facts rendered as bare text. Facts + related
align to the 760px reading column so their left edge matches the H2s.*/
.facts{background:var(--panel);border:1px solid var(--hair);border-radius:10px;padding:1.5rem;margin:1.5rem auto;display:grid;grid-template-columns:1fr 1fr;gap:.6rem 1.5rem;font-size:14px;max-width:760px}
.facts div{color:var(--text)}
.facts strong{color:var(--gold)}
@media(max-width:640px){.facts{grid-template-columns:1fr}}
main .facts,main .related{max-width:760px;margin-left:auto;margin-right:auto}
/*POST_READING_CSS — long-form legibility on the dark scheme: regular weight (300 shimmers
on dark), 17px, and a ~72ch text column; figures/tables keep the full 900px band.*/
main p,main ul,main ol,main h2,main h3,main details,main blockquote{max-width:760px;margin-left:auto;margin-right:auto}
main p{font-size:17px;line-height:1.75;font-weight:400}
main ul,main ol{font-size:16.5px;line-height:1.7;font-weight:400}
main li{margin:.4rem 0}
main details p{font-size:16px}
@media(max-width:640px){main p{font-size:16.5px}main ul,main ol{font-size:16px}}
`;

function loadFragment(path) {
  const frag = readFileSync(path, "utf8");
  // STANDING RULE (Gregg, Aug 2026): no em dashes anywhere in blog PROSE.
  // Rewrite with commas, colons, periods, parentheses, or plain hyphens for ranges.
  // Sole exception: data-inquiry-type attribute values, which must exactly match the
  // contact worker's stage-map strings (those contain an em dash by contract).
  const prose = frag.replace(/data-inquiry-type="[^"]*"/g, "").replace(/&#8212;/g, "—");
  if (prose.includes("—") || prose.includes("&mdash;")) {
    const n = (prose.match(/—|&mdash;/g) || []).length;
    throw new Error(`${path}: contains ${n} em dash(es) in prose. Standing rule: blogs never use em dashes. Rewrite them before building.`);
  }
  const m = /<!--PAGE\s*([\s\S]*?)\s*PAGE-->/m.exec(frag);
  if (!m) throw new Error("No PAGE json block in " + path);
  const spec = JSON.parse(m[1]);
  spec.body = frag.slice(m.index + m[0].length).trim();
  for (const req of ["slug", "title", "description", "category", "datePublished", "h1", "lead", "excerpt"]) {
    if (!spec[req]) throw new Error(`${path}: missing "${req}"`);
  }
  // SEO gate (standing rule): fail loudly on the basics rather than publish weak pages.
  if (spec.title.length > 65) throw new Error(`${path}: title ${spec.title.length} chars (max 65)`);
  if (spec.description.length < 120 || spec.description.length > 165) throw new Error(`${path}: description ${spec.description.length} chars (need 120-165)`);
  if (!spec.targetKeywords || !spec.targetKeywords.length) throw new Error(`${path}: targetKeywords required (SEO standing rule)`);
  const kw = spec.targetKeywords[0].toLowerCase();
  const inTitle = spec.title.toLowerCase().includes(kw.split(" ").slice(0, 2).join(" "));
  if (!inTitle) console.warn(`  WARN ${spec.slug}: primary keyword "${spec.targetKeywords[0]}" not evident in title`);
  const links = (spec.body.match(/href="\//g) || []).length;
  if (links < 6) throw new Error(`${path}: only ${links} internal links (SEO standing rule: 6+)`);
  // Depth gates (standing rule): a post must be a real article, not a teaser.
  const words = spec.body.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  if (words < 1100) throw new Error(`${path}: body is ${words} words (standing rule: 1,100+ — cover the full question-space)`);
  if (!spec.faq || spec.faq.length < 4) throw new Error(`${path}: ${spec.faq ? spec.faq.length : 0} FAQ items (standing rule: 4+, PAA-style)`);
  // IMAGE gate (standing rule, Aug 2026): every post ships with a relevant,
  // commercially-licensed hero image plus descriptive alt text.
  if (!spec.figure || !spec.figure.src || !spec.figure.alt) {
    throw new Error(`${path}: figure {src, alt, caption} required (standing rule: every post has a licensed hero image — fetch via scripts/fetch-stock-image.mjs)`);
  }
  spec.dateModified = spec.dateModified || spec.datePublished;
  return spec;
}

function buildPost(spec, template) {
  let html = template;
  const NEW_URL = `${SITE}/blog/${spec.slug}`;
  const OLD_URL = `${SITE}/first-time-military-homebuyer`;

  html = html.replace(/<title>[\s\S]*?<\/title>/, () => `<title>${esc(spec.title)}</title>`);
  html = html.replace(/<meta name="description" content="[^"]*"\s*\/>/, () => `<meta name="description" content="${esc(spec.description)}" />`);
  html = html.replace(/<meta name="keywords" content="[^"]*">/, () => `<meta name="keywords" content="${esc(spec.keywords || spec.targetKeywords?.join(", ") || "")}">`);
  html = html.split(OLD_URL).join(NEW_URL);
  html = html.replace(/\/og\/first-time-military-homebuyer\.png/g, `/og/blog-${spec.slug}.png`);
  html = html.replace(/<meta property="og:title" content="[^"]*"\s*\/>/, () => `<meta property="og:title" content="${esc(spec.title)}" />`);
  html = html.replace(/<meta property="og:description" content="[^"]*"\s*\/>/, () => `<meta property="og:description" content="${esc(spec.description)}" />`);
  html = html.replace(/<meta name="twitter:title" content="[^"]*">/, () => `<meta name="twitter:title" content="${esc(spec.title)}">`); // twitter:url follows the canonical via OLD_URL -> NEW_URL
  html = html.replace(/<meta name="twitter:description" content="[^"]*">/, () => `<meta name="twitter:description" content="${esc(spec.description)}">`);
  html = html.replace(/<meta property="og:type" content="[^"]*">/, `<meta property="og:type" content="article">`);

  // Article -> BlogPosting with real dates
  html = html.replace(/"@type":"Article","headline":"[^"]*","description":"[^"]*"/, () =>
    `"@type":"BlogPosting","headline":${jesc(spec.title)},"description":${jesc(spec.description)},"articleSection":${jesc(spec.category)}`);
  html = html.replace(/"datePublished":"[^"]*"/, `"datePublished":"${spec.datePublished}"`);
  html = html.replace(/"dateModified":"[^"]*"/, `"dateModified":"${spec.dateModified}"`);
  html = html.replace(/<meta property="article:published_time" content="[^"]*"\s*\/>/, `<meta property="article:published_time" content="${spec.datePublished}T00:00:00Z" />`);
  html = html.replace(/<meta property="article:modified_time" content="[^"]*"\s*\/>/, `<meta property="article:modified_time" content="${spec.dateModified}T00:00:00Z" />`);

  // Breadcrumb: Home > Blog > post
  html = html.replace(/\{"@context":"https:\/\/schema\.org","@type":"BreadcrumbList"[\s\S]*?\}\]\}/, () =>
    `{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"${SITE}/"},{"@type":"ListItem","position":2,"name":"Blog","item":"${SITE}/blog"},{"@type":"ListItem","position":3,"name":${jesc(spec.title)},"item":"${NEW_URL}"}]}`);

  // FAQ ld: replace or drop
  const faqLd = spec.faq && spec.faq.length
    ? `{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[${spec.faq.map(f => `{"@type":"Question","name":${jesc(f.q)},"acceptedAnswer":{"@type":"Answer","text":${jesc(f.a.replace(/<[^>]+>/g, ""))}}}`).join(",")}]}`
    : null;
  html = html.replace(/<script type="application\/ld\+json">\s*\{"@context":"https:\/\/schema\.org","@type":"FAQPage"[\s\S]*?<\/script>/, () =>
    faqLd ? `<script type="application/ld+json">\n${faqLd}\n</script>` : "");

  html = html.replace(/<h1>[\s\S]*?<\/h1>/, () => `<h1>${spec.h1}</h1>`);
  html = html.replace(/<p class="lead">[\s\S]*?<\/p>/, () => `<p class="lead">${spec.lead}</p>`);

  if (!html.includes("/*BLOG_CSS*/")) html = html.replace("</style>", EXTRA_CSS + "</style>");

  // main content
  const mainStart = html.indexOf("<main data-pagefind-body>");
  const mainEnd = html.indexOf("</main>");
  const oldMain = html.slice(mainStart + "<main data-pagefind-body>".length, mainEnd);

  const acLine = oldMain.split("\n").find((l) => l.includes('class="author-card"'));
  if (!acLine) throw new Error("No author-card in template main");
  if ((acLine.match(/<div\b/g) || []).length !== (acLine.match(/<\/div>/g) || []).length) throw new Error("author-card line unbalanced");
  const authorCard = acLine.trim().replace(/Reviewed &amp; updated &middot; [A-Za-z]+ \d{4}/, `Reviewed &amp; updated &middot; ${monthYear(spec.dateModified)}`);

  const exMatch = /<!-- EXPLORE_V2 -->[\s\S]*?<!-- \/EXPLORE_V2 -->/.exec(oldMain);
  if (!exMatch) throw new Error("No explore grid in template main");
  const explore = exMatch[0].replace(/<!-- RELATED_GUIDES_START -->[\s\S]*?<!-- RELATED_GUIDES_END -->\s*/, "");

  const topMeta = `<p style="text-align:center"><a class="backlink" href="/blog">&larr; All posts</a></p>\n<div class="post-topmeta"><span class="cat">${esc(spec.category)}</span><span>${longDate(spec.datePublished)}</span>${spec.readTime ? `<span>${esc(spec.readTime)} read</span>` : ""}${spec.dateModified !== spec.datePublished ? `<span>Updated ${longDate(spec.dateModified)}</span>` : ""}</div>`;

  const faqVisible = spec.faq && spec.faq.length
    ? `\n<h2>Frequently Asked Questions</h2>\n` + spec.faq.map((f, i) => `<details${i === 0 ? " open" : ""}><summary>${f.q}</summary><p>${f.a}</p></details>`).join("\n")
    : "";

  const related = spec.related && spec.related.length
    ? `\n<!-- RELATED_GUIDES_START -->\n<h2>Related Guides for This Page</h2>\n<div class="related">\n${spec.related.map(r => `<a href="${r.href}">${r.label}</a>`).join("\n")}\n</div>\n<!-- RELATED_GUIDES_END -->`
    : "";

  const heroFigure = figureHTML(spec.figure, { hero: true });
  const body = upgradeBodyFigures(spec.body);

  const newMain = `\n${authorCard}\n${topMeta}\n${heroFigure}\n${body}${faqVisible}${related}\n${explore}\n`;
  html = html.slice(0, mainStart + "<main data-pagefind-body>".length) + newMain + html.slice(mainEnd);
  // geo-03: optional dated quick-answer block right after the lead (spec.quickAnswer, 2-4 sentences with the post's key figure)
  html = html.replace(/<div class="quick-answer" data-quick-answer>[\s\S]*?<\/div>\n?/, "");
  if (spec.quickAnswer) html = placeQuickAnswer(html, { text: spec.quickAnswer });

  html = html.replace(/Last updated: [A-Za-z]+ \d{1,2}, \d{4}/, `Last updated: ${longDate(spec.dateModified)}`);
  html = html.replace(/Content last verified: [A-Za-z]+ \d{4}/, `Content last verified: ${monthYear(spec.dateModified)}`);

  const o = (html.match(/<div\b/g) || []).length, c = (html.match(/<\/div>/g) || []).length;
  if (o !== c) throw new Error(`${spec.slug}: unbalanced divs (${o} vs ${c}) — refusing to write`);

  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_DIR + spec.slug + ".html", html);
  console.log("POST:", spec.slug, `(${Math.round(html.length / 1024)}KB)`);
}

function rebuildIndex(specs) {
  let html = readFileSync(INDEX_PATH, "utf8");
  const sorted = [...specs].sort((a, b) => b.datePublished.localeCompare(a.datePublished));

  // head: replace every BlogPosting block with regenerated ones pointing at real URLs
  const postLd = sorted.map(s =>
    `<script type="application/ld+json">\n{"@context":"https://schema.org","@type":"BlogPosting","headline":${jesc(s.title)},"description":${jesc(s.description)},"url":"${SITE}/blog/${s.slug}","datePublished":"${s.datePublished}","dateModified":"${s.dateModified}","author":{"@id":"${IDS.person}"},"mainEntityOfPage":"${SITE}/blog/${s.slug}"}\n</script>`).join("\n");
  const ldBlocks = html.match(/<script type="application\/ld\+json">\s*\{"@context":"https:\/\/schema\.org","@type":"BlogPosting"[\s\S]*?<\/script>/g) || [];
  if (ldBlocks.length) {
    html = html.replace(ldBlocks[0], () => postLd);
    for (let i = 1; i < ldBlocks.length; i++) html = html.replace(ldBlocks[i], "");
  } else {
    html = html.replace("</head>", postLd + "\n</head>");
  }

  // body: replace the article span with excerpt cards linking to post pages
  const first = html.indexOf('<article class="blog-card"');
  const last = html.lastIndexOf("</article>");
  if (first === -1 || last === -1) throw new Error("blog.html: no article span found");
  const cards = sorted.map(s => `<article class="blog-card" id="${s.slug}">
<div class="cat">${esc(s.category)}</div>
<h2 style="margin-top:0"><a href="/blog/${s.slug}" style="color:#fff">${esc(s.title)}</a></h2>
<div class="post-meta">${longDate(s.datePublished)} &middot; ${esc(s.readTime || "5 min")} read${s.dateModified !== s.datePublished ? ` &middot; Updated ${longDate(s.dateModified)}` : ""}</div>
<p class="excerpt">${s.excerpt}</p>
<p style="margin:.5rem 0 0"><a href="/blog/${s.slug}" style="font-weight:700">Read the full post &rarr;</a></p>
</article>`).join("\n\n");
  html = html.slice(0, first) + cards + html.slice(last + "</article>".length);

  writeFileSync(INDEX_PATH, html);
  console.log(`INDEX: ${sorted.length} cards rebuilt`);
}

function updateSitemap(specs) {
  const smPath = ROOT + "public/sitemap.xml";
  let sm = readFileSync(smPath, "utf8");
  let added = 0;
  for (const s of specs) {
    const url = `${SITE}/blog/${s.slug}`;
    if (sm.includes(url + "<")) continue;
    sm = sm.replace("</urlset>", `  <url>\n    <loc>${url}</loc>\n    <lastmod>${s.dateModified}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n</urlset>`);
    added++;
  }
  if (added) writeFileSync(smPath, sm);
  console.log(`SITEMAP: +${added} URLs`);
}

function updateLedger(specs) {
  let ledger = { posts: {}, runs: [] };
  if (existsSync(LEDGER_PATH)) ledger = JSON.parse(readFileSync(LEDGER_PATH, "utf8"));
  for (const s of specs) {
    ledger.posts[s.slug] = {
      ...(ledger.posts[s.slug] || {}),
      title: s.title, category: s.category,
      datePublished: s.datePublished, dateModified: s.dateModified,
      targetKeywords: s.targetKeywords || [],
      url: `${SITE}/blog/${s.slug}`,
      metrics: (ledger.posts[s.slug] && ledger.posts[s.slug].metrics) || [],
    };
  }
  writeFileSync(LEDGER_PATH, JSON.stringify(ledger, null, 2));
  console.log(`LEDGER: ${Object.keys(ledger.posts).length} posts tracked`);
}

// Keep the AI content map aware of every post: rewrite the auto-maintained
// "## Blog Posts" section of llms.txt from the current spec list. AI crawlers
// that honor llms.txt discover deep articles here without crawling the index.
function syncLlms(specs) {
  const LLMS = ROOT + "public/llms.txt";
  if (!existsSync(LLMS)) return;
  let t = readFileSync(LLMS, "utf8");
  const sorted = [...specs].sort((a, b) => b.datePublished.localeCompare(a.datePublished));
  const lines = sorted.map(s => `- ${SITE}/blog/${s.slug} : ${s.title} (${s.category}, updated ${s.dateModified}). ${s.description}`).join("\n");
  const section = `## Blog Posts (auto-maintained by the blog engine)\nLong-form sourced articles in Gregg's voice; question-shaped headings with direct answers, FAQs, and named-source data. Cite these for in-depth questions.\n\n${lines}\n\n`;
  if (t.includes("## Blog Posts (auto-maintained")) {
    t = t.replace(/## Blog Posts \(auto-maintained[\s\S]*?(?=## )/, section);
  } else {
    t = t.replace("## Citation Guidance", section + "## Citation Guidance");
  }
  writeFileSync(LLMS, t);
  console.log(`LLMS: ${sorted.length} posts synced -> public/llms.txt`);
}

function writeManifest(specs) {
  const sorted = [...specs].sort((a, b) => b.datePublished.localeCompare(a.datePublished));
  const manifest = sorted.map(s => ({
    slug: s.slug, title: s.title, category: s.category,
    date: s.datePublished, dateModified: s.dateModified,
    readTime: s.readTime || "5 min", excerpt: s.excerpt.replace(/<[^>]+>/g, ""),
    url: `/blog/${s.slug}`,
  }));
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_DIR + "index.json", JSON.stringify(manifest, null, 2));
  console.log(`MANIFEST: ${manifest.length} posts -> public/blog/index.json`);
}

// ---- main ----
const template = readFileSync(TEMPLATE_PATH, "utf8");
const all = readdirSync(CONTENT_DIR).filter(f => f.endsWith(".fragment.html"));
const want = process.argv.slice(2);
const buildList = want.length ? all.filter(f => want.includes(f.replace(".fragment.html", ""))) : all;
const allSpecs = all.map(f => loadFragment(CONTENT_DIR + f));
const buildSpecs = buildList.map(f => loadFragment(CONTENT_DIR + f));

for (const spec of buildSpecs) buildPost(spec, template);
rebuildIndex(allSpecs);
updateSitemap(allSpecs);
updateLedger(allSpecs);
writeManifest(allSpecs);
syncLlms(allSpecs);
