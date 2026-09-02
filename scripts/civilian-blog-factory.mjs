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
import { SITE_DIR, SITE, esc, buildPage, figureBand, breadcrumbs, faqPage, makeOgCard, gate } from "./civilian-page-lib.mjs";
import { publisherRef } from "./entity-lib.mjs";
import { placeQuickAnswer } from "./quick-answer-lib.mjs";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url)).replace(/\\/g, "/");
const CONTENT_DIR = ROOT + "content/civilian-blog/";
const OUT_DIR = SITE_DIR + "/blog/";
mkdirSync(OUT_DIR, { recursive: true });
mkdirSync(SITE_DIR + "/og", { recursive: true });

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const longDate = (iso) => { const [y, m, d] = iso.split("-").map(Number); return `${MONTHS[m - 1]} ${d}, ${y}`; };

function loadFragment(path) {
  const raw = readFileSync(path, "utf8");
  const m = raw.match(/<!--PAGE\s*([\s\S]*?)\s*PAGE-->/);
  if (!m) throw new Error(`${path}: no PAGE header`);
  const spec = JSON.parse(m[1]);
  spec.body = raw.slice(raw.indexOf("PAGE-->") + 7).trim();
  return spec;
}

function articleSchema(spec) {
  return {
    "@context": "https://schema.org", "@type": "Article",
    headline: spec.h1, description: spec.description,
    author: { "@id": `${SITE}/#gregg` },
    publisher: publisherRef(),
    datePublished: spec.datePublished, dateModified: spec.dateModified || spec.datePublished,
    image: SITE + spec.figure.src,
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE}/blog/${spec.slug}` },
    inLanguage: "en-US", keywords: spec.keywords,
  };
}

function buildPost(spec) {
  // ---- hard gates on the fragment ----
  const errs = [];
  if (!spec.figure || !spec.figure.src) errs.push("figure required");
  else if (!existsSync(SITE_DIR + spec.figure.src)) errs.push(`figure file missing: ${spec.figure.src}`);
  if ((spec.faqs || []).length < 4) errs.push("needs 4+ FAQs");
  const links = (spec.body.match(/<a /g) || []).length;
  if (links < 4) errs.push(`needs 4+ links, has ${links}`);
  const words = (spec.body.replace(/<[^>]+>/g, " ").match(/\S+/g) || []).length;
  if (words < 1100) errs.push(`body ${words} words < 1100`);
  if (errs.length) throw new Error(`${spec.slug}: GATE FAIL\n  - ` + errs.join("\n  - "));

  const faqsHtml = spec.faqs.map((f, i) => `<details${i === 0 ? " open" : ""}><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("\n");
  const main = `
<div style="max-width:760px;margin:0 auto 6px;color:var(--muted);font-size:13px;letter-spacing:.5px;text-transform:uppercase">${longDate(spec.datePublished)} &middot; The Costin Team Blog</div>
${figureBand({ ...spec.figure })}
${spec.body}

<h2>Frequently asked questions</h2>
${faqsHtml}

<!-- inq-cta --><div class="inq-cta">
<div style="color:var(--gold);font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:12px">&#9733;&#9733;&#9733;&#9733;&#9733; &nbsp;5.0 on Google and Zillow &middot; <a href="/reviews" style="color:var(--gold)">Verified Reviews</a></div>
<p class="ih">Questions about your own move?</p>
<p class="is">Call or text (850) 266-5005, set up a live home search, or get a free valuation. No pressure, and a response within 2 hours during business hours.</p>
<div class="ir">
<a class="ip" href="https://greggcostin.realscout.com/onboarding">Start Your Home Search &rarr;</a>
<a class="il" href="https://greggcostin.realscout.com/whats-my-home-worth">Get My Home Value</a>
</div>
</div>
<p style="max-width:760px;margin:1.5rem auto;text-align:center"><a href="/blog">&larr; Back to all posts</a></p>`;

  const pageSpec = {
    file: `blog/${spec.slug}.html`, path: `/blog/${spec.slug}`,
    title: spec.title, desc: spec.description, keywords: spec.keywords,
    ogSlug: `blog-${spec.slug}`, ogType: "article",
    h1: spec.h1, lead: spec.lead, main, dateISO: spec.datePublished, minWords: 1100,
    schemaBlocks: [articleSchema(spec), breadcrumbs([{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }, { name: spec.h1, path: `/blog/${spec.slug}` }]), faqPage(spec.faqs)],
  };
  // geo-03: optional dated quick-answer block after the lead (fragment field "quickAnswer", 2-4 sentences with the post's key figure)
  const html = spec.quickAnswer ? placeQuickAnswer(buildPage(pageSpec), { text: spec.quickAnswer, by: "Gregg Costin, Realtor, The Costin Team at Levin Rinke Realty" }) : buildPage(pageSpec);
  const gateErrs = gate({ title: spec.title, desc: spec.description, minWords: 1100 }, html);
  if (gateErrs.length) throw new Error(`${spec.slug}: POST-BUILD GATE FAIL\n  - ` + gateErrs.join("\n  - "));
  return pageSpec;
}

function buildIndex(specs) {
  const cards = specs
    .sort((a, b) => (a.datePublished < b.datePublished ? 1 : -1))
    .map((s) => `<a class="blog-card" href="/blog/${s.slug}">
<span class="bc-date">${longDate(s.datePublished)}</span>
<span class="bc-title">${esc(s.h1)}</span>
<span class="bc-desc">${esc(s.description)}</span>
<span class="bc-more">Read the post &rarr;</span></a>`).join("\n");
  const main = `
<style>
.blog-grid{display:grid;grid-template-columns:1fr;gap:18px;max-width:760px;margin:1rem auto}
.blog-card{display:flex;flex-direction:column;gap:8px;background:var(--panel);border:1px solid var(--hair);border-radius:14px;padding:26px;text-decoration:none}
.blog-card:hover{border-color:var(--gold-line)}
.bc-date{color:var(--gold);font-size:12px;letter-spacing:1.5px;text-transform:uppercase;font-weight:600}
.bc-title{color:#fff;font-family:var(--serif);font-size:24px;line-height:1.25}
.bc-desc{color:var(--muted);font-size:15px;line-height:1.65}
.bc-more{color:var(--gold);font-weight:700;font-size:14px}
</style>
<p>Market mechanics, Florida homeownership, rates and the economy, and the practical money questions behind buying and selling on the Gulf Coast. New posts every Monday and Thursday.</p>
<div class="blog-grid">
${cards}
</div>
<div class="mil-band">
<h3>Military or PCSing?</h3>
<p>Our military division publishes the deepest PCS, BAH, and VA loan library on the Emerald Coast.</p>
<a class="btn-p" href="https://pensacolamilitaryhousing.com/blog">Visit the Military Blog</a>
</div>`;
  const DESC = "Plain-English posts on Pensacola real estate, mortgage rates, the Florida market, insurance, taxes, and the money decisions behind buying and selling a home.";
  const blogSchema = { "@context": "https://schema.org", "@type": "Blog", name: "The Costin Team Blog", url: `${SITE}/blog`, description: DESC, publisher: { "@id": `${SITE}/#team` }, inLanguage: "en-US" };
  const spec = {
    file: "blog.html", path: "/blog",
    title: "Real Estate Blog | The Costin Team, Pensacola",
    desc: DESC,
    keywords: "Pensacola real estate blog, Florida housing market, mortgage rates explained, home buying tips Florida",
    ogSlug: "blog", h1: "The Costin Team blog", lead: "Rates, the market, and Florida homeownership, explained in plain English twice a week.",
    main, dateISO: new Date().toISOString().slice(0, 10),
    schemaBlocks: [blogSchema, breadcrumbs([{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }])],
  };
  buildPage(spec);
}

function syncSitemapAndLlms(specs) {
  const smPath = `${SITE_DIR}/sitemap.xml`;
  let sm = readFileSync(smPath, "utf8");
  const today = new Date().toISOString().slice(0, 10);
  const need = [`${SITE}/blog`, ...specs.map((s) => `${SITE}/blog/${s.slug}`)];
  for (const u of need) {
    if (!sm.includes(`<loc>${u}</loc>`)) sm = sm.replace("</urlset>", `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>\n</urlset>`);
  }
  writeFileSync(smPath, sm);
  const llmsPath = `${SITE_DIR}/llms.txt`;
  let llms = readFileSync(llmsPath, "utf8");
  const START = "## Blog Posts (auto-maintained)";
  const list = specs.sort((a, b) => (a.datePublished < b.datePublished ? 1 : -1)).map((s) => `- [${s.h1}](${SITE}/blog/${s.slug}): ${s.description}`).join("\n");
  const block = `${START}\n\n- [Blog index](${SITE}/blog): all posts\n${list}\n`;
  // START contains parentheses, so it must be escaped before use as a regex source.
  const startRe = START.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (llms.includes(START)) llms = llms.replace(new RegExp(startRe + "[\\s\\S]*?(?=\\n## |$)"), () => block);
  else llms = llms.trimEnd() + "\n\n" + block;
  writeFileSync(llmsPath, llms);
}

/* ---- run ---- */
const only = process.argv[2];
const frags = readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".fragment.html")).map((f) => loadFragment(CONTENT_DIR + f));
const targets = only ? frags.filter((f) => f.slug === only) : frags;
const built = [];
for (const spec of targets) {
  buildPost(spec);
  const titleLines = spec.ogTitleLines || [spec.h1.length > 26 ? spec.h1.slice(0, spec.h1.lastIndexOf(" ", 26)) : spec.h1, spec.h1.length > 26 ? spec.h1.slice(spec.h1.lastIndexOf(" ", 26) + 1, 52) : ""].filter(Boolean);
  await makeOgCard(`blog-${spec.slug}`, titleLines, longDate(spec.datePublished) + " on the Costin Team blog");
  built.push(spec.slug);
  console.log(`BUILT /blog/${spec.slug}`);
}
buildIndex(frags);
await makeOgCard("blog", ["The Costin Team", "Blog"], "Rates, the market, and Florida homeownership");
syncSitemapAndLlms(frags);
console.log(`INDEX rebuilt with ${frags.length} post(s); sitemap + llms synced`);
