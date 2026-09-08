import { evidenceGate } from "./article-evidence.mjs";
import { journeyHtml, wireJourney } from "./blog-journey.mjs";
// Blog factory for greggcostin.com — builds civilian-site/blog/<slug>.html from
// content/civilian-blog/*.fragment.html, rebuilds the /blog index, keeps the
// sitemap + llms.txt in sync, and generates a branded OG card per post.
// Same hard gates as the military blog-factory: no em dashes (worker string is the
// sole exception), title <=65, desc 120-165, 1100+ words, 4+ FAQs, 4+ links,
// figure required with existing file + credit, div balance, valid JSON-LD.
//
// Fragment contract: content/civilian-blog/<slug>.fragment.html
//   <!--PAGE {"title":..,"description":..,"slug":..,"h1":..,"lead":..,"keywords":..,
//             "datePublished":"YYYY-MM-DD","figure":{"src":"/images/x.jpg","webp":"/images/x.webp",
//             "alt":..,"caption":..,"width":N,"height":N},"faqs":[{"q":..,"a":..}]} PAGE-->
//   ...body html (h2/h3/p/ul/ol/strong/a)...
//
// Usage: node scripts/civilian-blog-factory.mjs [slug]   (no arg = build all)
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "node:fs";
import { SITE_DIR, SITE, esc, buildPage, figureBand, breadcrumbs, faqPage, gate } from "./civilian-page-lib.mjs";
import { publisherRef } from "./entity-lib.mjs";
import { placeQuickAnswer } from "./quick-answer-lib.mjs";
import { fileURLToPath } from "node:url";
import { readResearch, isModern, validateEditorial, voiceFindings, sectionLinks, updateBlogSitemap, sentenceCount, finalizeArticleHtml, plainBlogActions, updateBlogListing } from './civilian-editorial-lib.mjs';
import { scorePost } from './score-post.mjs';
import { blogOg } from './civilian-blog-og.mjs';

const ROOT = fileURLToPath(new URL("..", import.meta.url)).replace(/\\/g, "/");
const CONTENT_DIR = ROOT + "content/civilian-blog/";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const longDate = (iso) => { const [y, m, d] = iso.split("-").map(Number); return `${MONTHS[m - 1]} ${d}, ${y}`; };
const monthYear = (iso) => { const [y, m] = iso.split("-").map(Number); return `${MONTHS[m - 1]} ${y}`; };

function loadFragment(path) {
  const raw = readFileSync(path, "utf8");
  const m = raw.match(/<!--PAGE\s*([\s\S]*?)\s*PAGE-->/);
  if (!m) throw new Error(`${path}: no PAGE header`);
  const spec = JSON.parse(m[1]);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(spec.slug || '')) throw new Error(`${path}: invalid slug`);
  spec.body = raw.slice(raw.indexOf("PAGE-->") + 7).trim();
  return spec;
}

function articleSchema(spec) {
  return {
    "@context": "https://schema.org", "@type": "BlogPosting",
    "@id": `${SITE}/blog/${spec.slug}#article`,
    headline: spec.h1, description: spec.description,
    author: { "@id": `${SITE}/#gregg` },
    publisher: publisherRef(),
    datePublished: spec.datePublished, dateModified: spec.dateModified || spec.datePublished,
    image: SITE + spec.figure.src,
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE}/blog/${spec.slug}` },
    inLanguage: "en-US", keywords: spec.keywords,
    wordCount: spec.body.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length,
    ...(spec.category ? { articleSection: spec.category } : {}),
    citation: (readResearch(spec.slug)?.sources || []).map(s => ({ '@type': 'CreativeWork', name: s.title, url: s.url })),
  };
}

function buildPost(spec) {
  // ---- hard gates on the fragment ----
  const errs = [...evidenceGate(spec, spec.body, "gc", ROOT, new Date().toISOString().slice(0,10)).errors];
  errs.push(...voiceFindings(spec, spec.body));
  if (isModern(spec)) {
    errs.push(...validateEditorial(spec, spec.body, readResearch(spec.slug)).errors);
    const quality = scorePost(spec, spec.body, 'gc');
    if (quality.score < 80) errs.push(`editorial score ${quality.score}<80`);
  }
  if (!spec.figure || !spec.figure.src) errs.push("figure required");
  else if (!existsSync(SITE_DIR + spec.figure.src)) errs.push(`figure file missing: ${spec.figure.src}`);
  if ((spec.faqs || []).length < 4) errs.push("needs 4+ FAQs");
  const links = (spec.body.match(/<a /g) || []).length;
  if (links < 4) errs.push(`needs 4+ links, has ${links}`);
  const words = (spec.body.replace(/<[^>]+>/g, " ").match(/\S+/g) || []).length;
  if (words < 1100) errs.push(`body ${words} words < 1100`);
  // Parity with the military factory (Sep 2026): scannability, measurability and GEO gates.
  // Posts dated on or after PARITY_SINCE carry targetKeywords, a quickAnswer and takeaways;
  // older posts warn until their next refresh so a rebuild never breaks a live page.
  const PARITY_SINCE = "2026-09-07";
  const isNew = (spec.dateModified || spec.datePublished) >= PARITY_SINCE;
  const paraWords = [...spec.body.matchAll(/<p(?=[\s>])[^>]*>([\s\S]*?)<\/p>/g)].map((m) => m[1].replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length);
  const hardWalls = paraWords.filter((w) => w > 110), walls = paraWords.filter((w) => w > 85);
  if (hardWalls.length) errs.push(`${hardWalls.length} paragraph(s) over 110 words (longest ${Math.max(...hardWalls)}); split walls into shorter paragraphs, lists or a table`);
  const qaSentences = sentenceCount(spec.quickAnswer || '');
  const qaWords = spec.quickAnswer ? spec.quickAnswer.split(/\s+/).length : 0;
  if (isNew) {
    if (!spec.targetKeywords || !spec.targetKeywords.length) errs.push("targetKeywords required (the engine measures posts by them)");
    if (!spec.quickAnswer || !/\d/.test(spec.quickAnswer)) errs.push("quickAnswer required: 2-4 dated declarative sentences restating a figure already in the post");
    else if (qaSentences < 2 || qaSentences > 4 || qaWords >= 85) errs.push(`quickAnswer must be 2-4 sentences and under 85 words (found ${qaSentences} sentences, ${qaWords} words)`);
    if (!spec.takeaways || spec.takeaways.length < 3) errs.push("takeaways required: 3-5 one-line bullets (rendered as Key takeaways)");
  } else {
    if (!spec.targetKeywords || !spec.targetKeywords.length) console.warn(`  WARN ${spec.slug}: no targetKeywords (required on posts dated ${PARITY_SINCE}+; add on next refresh)`);
    if (!spec.quickAnswer) console.warn(`  WARN ${spec.slug}: no quickAnswer (required on posts dated ${PARITY_SINCE}+; add on next refresh)`);
  }
  const h2s = [...spec.body.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].map((m) => m[1].replace(/<[^>]+>/g, "").trim()).filter((t) => !/^(sources|frequently|related|key takeaways)/i.test(t));
  const qH2 = h2s.filter((t) => /^(what|why|how|is|are|do|does|can|should|when|where|which|who|will)\b/i.test(t) || t.endsWith("?")).length;
  if (h2s.length && qH2 / h2s.length < 0.6) console.warn(`  WARN ${spec.slug}: ${qH2}/${h2s.length} H2s are question-shaped (target 60%+; scripts/score-post.mjs gates new posts at 80)`);
  if (walls.length) console.warn(`  WARN ${spec.slug}: ${walls.length} paragraph(s) over 85 words (longest ${Math.max(...walls)}w); audit-civilian flags 80+`);
  if (errs.length) throw new Error(`${spec.slug}: GATE FAIL\n  - ` + errs.join("\n  - "));

  const faqsHtml = spec.faqs.map((f, i) => `<details${i === 0 ? " open" : ""}><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("\n");
  const sections = sectionLinks(spec.body);
  const toc = `<nav class="blog-toc" aria-label="In this article"><p><strong>In this article</strong></p><ul>${sections.links.map(l => `<li><a href="#${esc(l.id)}">${esc(l.title)}</a></li>`).join('')}</ul></nav>`;
  // Visible byline + freshness line (E-E-A-T and the "Updated [Month Year]" signal non-Google AI
  // crawlers read from HTML, not JSON-LD), and the optional Key takeaways block after the hero.
  const takeawaysHtml = spec.takeaways && spec.takeaways.length
    ? `<style>.takeaways{max-width:760px;margin:0 auto 22px;padding:16px 20px;border:1px solid var(--gold-line);border-left:4px solid var(--gold);border-radius:10px;background:var(--panel)}.takeaways .tk-label{margin:0 0 6px;font-size:11.5px;letter-spacing:2px;text-transform:uppercase;color:var(--gold);font-weight:600}.takeaways ul{margin:0;padding-left:1.1rem}.takeaways li{margin:.3rem 0;font-size:15.5px}</style>
<div class="takeaways"><p class="tk-label">Key takeaways</p><ul>${spec.takeaways.map((t) => `<li>${esc(t)}</li>`).join("")}</ul></div>`
    : "";
  const main = `
<div class="blog-byline" style="max-width:760px;margin:0 auto 16px;color:var(--muted);font-size:14px">By <a href="/team">Gregg Costin, Realtor</a> &middot; Published <time datetime="${spec.datePublished}">${longDate(spec.datePublished)}</time>${spec.dateModified ? ` &middot; Updated <time datetime="${spec.dateModified}">${longDate(spec.dateModified)}</time>` : ''} &middot; ${Math.ceil(words / 220)} minute read</div>
<style>.blog-toc{max-width:760px;margin:20px auto;padding:18px 22px;background:var(--panel);border:1px solid var(--hair);border-radius:12px}.blog-toc ul{columns:2;column-gap:28px;margin:8px 0}.blog-toc li{break-inside:avoid;margin:8px 0}body main h2[id]{scroll-margin-top:var(--article-anchor-gap,110px)}main .blog-table-scroll{max-width:760px;overflow-x:auto;margin:24px auto}main .blog-table-scroll:focus-visible{outline:2px solid var(--gold)}main table caption{text-align:left;padding:12px 0;font-weight:600}main table th{text-align:left}@media(max-width:650px){.blog-toc ul{columns:1}.blog-byline{line-height:1.7}}</style>
${figureBand({ ...spec.figure })}
${takeawaysHtml}
${toc}
${sections.html}

<h2>Frequently asked questions</h2>
${faqsHtml}

${journeyHtml(spec, "gc", ROOT)}
<p style="max-width:760px;margin:1.5rem auto;text-align:center"><a href="/blog">&larr; Back to all posts</a></p>`;

  const pageSpec = {
    outDir: spec.outDir,
    file: `blog/${spec.slug}.html`, path: `/blog/${spec.slug}`,
    title: spec.title, desc: spec.description, keywords: spec.keywords,
    ogSlug: `blog-${spec.slug}`, ogType: "article",
    h1: spec.h1, lead: spec.lead, main, dateISO: spec.datePublished, minWords: 1100,
    schemaBlocks: [articleSchema(spec), breadcrumbs([{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }, { name: spec.h1, path: `/blog/${spec.slug}` }]), faqPage(spec.faqs)],
  };
  // geo-03: optional dated quick-answer block after the lead (fragment field "quickAnswer", 2-4 sentences with the post's key figure).
  // buildPage writes the page; the quick-answer pass rewrites that file (fixed 2026-09-04: the block used to be discarded).
  let html = buildPage(pageSpec);
  if (spec.quickAnswer) {
    html = placeQuickAnswer(html, { text: spec.quickAnswer, date: monthYear(spec.dateModified || spec.datePublished), by: "Gregg Costin, Realtor, The Costin Team at Levin Rinke Realty" });
  }
  html = wireJourney(html, spec, "gc");
  html = plainBlogActions(finalizeArticleHtml(html));
  writeFileSync(`${spec.outDir || SITE_DIR}/${pageSpec.file}`, html);
  const gateErrs = gate({ title: spec.title, desc: spec.description, minWords: 1100 }, html);
  if (gateErrs.length) throw new Error(`${spec.slug}: POST-BUILD GATE FAIL\n  - ` + gateErrs.join("\n  - "));
  return pageSpec;
}

function buildIndex(specs, outDir) {
  const cards = specs
    .sort((a, b) => (a.datePublished < b.datePublished ? 1 : -1))
    .map((s) => `<a class="blog-card" href="/blog/${s.slug}">
${figureBand({...s.figure}).replace('class="figure-band"','class="gc-blog-card-media"').replace(/<a\b[^>]*>([\s\S]*?)<\/a>/g,'$1')}
<span class="bc-date">${s.dateModified ? `Updated ${longDate(s.dateModified)}` : longDate(s.datePublished)}</span>
<span class="bc-title">${esc(s.h1)}</span>
<span class="bc-desc">${esc(s.description)}</span>
<span class="bc-more">Read the post &rarr;</span></a>`).join("\n");
  const main = `
<style>
.blog-grid{display:grid;grid-template-columns:1fr;gap:18px;max-width:760px;margin:1rem auto}
.blog-card{display:flex;flex-direction:column;gap:8px;background:var(--panel);border:1px solid var(--hair);border-radius:14px;padding:26px;text-decoration:none}
.blog-card:hover{border-color:var(--gold-line)}
.blog-card .gc-blog-card-media{margin:0 0 10px}.blog-card .gc-blog-card-media img{width:100%;height:auto;aspect-ratio:16/10;object-fit:cover}.blog-card figcaption{font-size:11px;line-height:1.4;color:var(--muted)}
.bc-date{color:var(--gold);font-size:12px;letter-spacing:1.5px;text-transform:uppercase;font-weight:600}
.bc-title{color:#fff;font-family:var(--serif);font-size:24px;line-height:1.25}
.bc-desc{color:var(--muted);font-size:15px;line-height:1.65}
.bc-more{color:var(--gold);font-weight:700;font-size:14px}
</style>
<p>Practical answers for buyers, sellers and rental owners across the Florida Panhandle and coastal Alabama. We cover financing, local market conditions, ownership costs and the decisions behind a purchase or sale.</p>
<div class="blog-grid">
${cards}
</div>
<div class="mil-band">
<h3>Military or PCSing?</h3>
<p>Our military division covers PCS moves, BAH and VA financing for service members and their families.</p>
<a class="btn-p" href="https://pensacolamilitaryhousing.com/blog">Visit the Military Blog</a>
</div>`;
  const DESC = "Practical Gulf Coast real estate guides for buyers, sellers and rental owners: local markets, financing, insurance, taxes and vacation-rental decisions.";
  const blogSchema = { "@context": "https://schema.org", "@type": "Blog", name: "The Costin Team Blog", url: `${SITE}/blog`, description: DESC, publisher: { "@id": `${SITE}/#team` }, inLanguage: "en-US" };
  const spec = {
    outDir,
    file: "blog.html", path: "/blog",
    title: "Real Estate Blog | The Costin Team, Pensacola",
    desc: DESC,
    keywords: "Pensacola real estate blog, Florida housing market, mortgage rates explained, home buying tips Florida",
    ogSlug: "blog", h1: "The Costin Team blog", lead: "Local markets, financing and property decisions for buyers, sellers and rental owners across the Florida Panhandle and coastal Alabama.",
    main, dateISO: new Date().toISOString().slice(0, 10),
    schemaBlocks: [blogSchema, breadcrumbs([{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }])],
  };
  const html = plainBlogActions(buildPage(spec));
  writeFileSync(`${outDir || SITE_DIR}/blog.html`, html);
}

function syncSitemapAndLlms(specs, outDir = SITE_DIR, changedSpecs = specs) {
  const smPath = `${outDir}/sitemap.xml`;
  const sm = updateBlogSitemap(readFileSync(`${SITE_DIR}/sitemap.xml`, 'utf8'), changedSpecs, SITE);
  writeFileSync(smPath, sm);
  const llmsPath = `${outDir}/llms.txt`;
  let llms = readFileSync(`${SITE_DIR}/llms.txt`, "utf8");
  const START = "## Blog Posts (auto-maintained)";
  const list = specs.sort((a, b) => (a.datePublished < b.datePublished ? 1 : -1)).map((s) => `- [${s.h1}](${SITE}/blog/${s.slug}): ${s.description}`).join("\n");
  const block = `${START}\n\n- [Blog index](${SITE}/blog): all posts\n${list}\n`;
  // START contains parentheses, so it must be escaped before use as a regex source.
  llms = updateBlogListing(llms, block);
  writeFileSync(llmsPath, llms);
}

/* ---- run ----
   node scripts/civilian-blog-factory.mjs [slug]            build into civilian-site (index, sitemap, llms, OG cards)
   node scripts/civilian-blog-factory.mjs <slug> --out DIR  preview build of one post into DIR/blog/<slug>.html only
                                                            (no index/sitemap/llms/OG side effects; for gate checks
                                                            and eye tests while another session works the site tree) */
const argv = process.argv.slice(2);
const OUT = argv.includes("--out") ? argv[argv.indexOf("--out") + 1].replace(/\\/g, "/").replace(/\/$/, "") : null;
const BUNDLE = argv.includes('--bundle');
const only = argv.find((a) => !a.startsWith("--") && a !== OUT);
const frags = readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".fragment.html")).map((f) => loadFragment(CONTENT_DIR + f));
const targets = only ? frags.filter((f) => f.slug === only) : frags;
if (only && !targets.length) throw new Error(`no fragment with slug "${only}"`);
const built = [];
for (const spec of targets) {
  if (OUT) spec.outDir = OUT;
  buildPost(spec);
  const titleLines = spec.ogTitleLines || [spec.h1.length > 26 ? spec.h1.slice(0, spec.h1.lastIndexOf(" ", 26)) : spec.h1, spec.h1.length > 26 ? spec.h1.slice(spec.h1.lastIndexOf(" ", 26) + 1, 52) : ""].filter(Boolean);
  await blogOg(OUT || SITE_DIR, `blog-${spec.slug}`, titleLines, `Updated ${longDate(spec.dateModified || spec.datePublished)}`);
  built.push(spec.slug);
  console.log(`${OUT ? 'PREVIEW' : 'BUILT'} ${OUT || SITE_DIR}/blog/${spec.slug}.html`);
}
if (!OUT || BUNDLE) {
  buildIndex(frags, OUT);
  await blogOg(OUT || SITE_DIR, "blog", ["Real estate decisions", "on the Gulf Coast"], "Buyers, sellers and rental owners");
  syncSitemapAndLlms(frags, OUT || SITE_DIR, targets);
  console.log(`INDEX rebuilt with ${frags.length} post(s); sitemap + llms synced`);
}
