// Assemble: blog fragment file -> factory build; resource pages via lib; sitemap/llms for new pages.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { SITE_DIR, SITE, buildPage, figureBand, breadcrumbs, webPage, faqPage, makeOgCard, gate, esc } from "./civilian-page-lib.mjs";

const S = "C:/Users/gregg/AppData/Local/Temp/claude/C--Users-gregg-pensacolamilitaryhousing/bf2cf72f-42c9-40c1-9210-8ceda962524c/scratchpad";
const TODAY = "2026-08-24";
const log = [];

/* ---- 1) blog fragment file ---- */
const blog = JSON.parse(readFileSync(`${S}/frag-what-moves-mortgage-rates.json`, "utf8"));
mkdirSync("content/civilian-blog", { recursive: true });
const pageHeader = {
  title: blog.title, description: blog.description, slug: blog.slug, h1: blog.h1, lead: blog.lead,
  keywords: blog.keywords, datePublished: TODAY,
  figure: { src: "/images/fed-building.jpg", webp: "/images/fed-building.webp", alt: "The Marriner S. Eccles Federal Reserve Board building in Washington under a blue sky", caption: "The Fed gets the headlines, but the bond market sets your rate.", width: 1400, height: 777 },
  ogTitleLines: ["What Actually Moves", "Mortgage Rates"],
  faqs: blog.faqs,
};
writeFileSync(`content/civilian-blog/${blog.slug}.fragment.html`, `<!--PAGE ${JSON.stringify(pageHeader, null, 1)} PAGE-->\n${blog.bodyHtml}\n`);
log.push(`fragment written: ${blog.slug}`);

/* ---- 2) resource pages via lib ---- */
const RESOURCES = [
  { file: "resources/florida-homestead-exemption.html", path: "/resources/florida-homestead-exemption", frag: "frag-florida-homestead-exemption.json",
    figure: { src: "/images/florida-sign.jpg", webp: "/images/florida-sign.webp", alt: "Welcome to Florida sign surrounded by palm trees at the state line", caption: "New to Florida? The homestead exemption is the first paperwork win of homeownership.", width: 1400, height: 1050, ratio43: true }, ogSlug: "res-homestead", ogLines: ["Florida Homestead", "Exemption Guide"] },
  { file: "resources/florida-home-insurance.html", path: "/resources/florida-home-insurance", frag: "frag-florida-home-insurance.json",
    figure: { src: "/images/storm-shutters.jpg", webp: "/images/storm-shutters.webp", alt: "Florida home fitted with roll-down hurricane shutters", caption: "Wind mitigation features like these shutters directly lower Florida premiums.", width: 1400, height: 934 }, ogSlug: "res-insurance", ogLines: ["Florida Home", "Insurance Guide"] },
];
for (const r of RESOURCES) {
  const f = JSON.parse(readFileSync(`${S}/${r.frag}`, "utf8"));
  const faqsHtml = f.faqs.map((q, i) => `<details${i === 0 ? " open" : ""}><summary>${esc(q.q)}</summary><p>${esc(q.a)}</p></details>`).join("\n");
  const main = `
${figureBand(r.figure)}
${f.bodyHtml}

<h2>Frequently asked questions</h2>
${faqsHtml}

<p style="max-width:760px;margin:1.5rem auto"><a href="/resources">&larr; All Florida homeowner resources</a></p>

<!-- inq-cta --><div class="inq-cta">
<div style="color:var(--gold);font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:12px">&#9733;&#9733;&#9733;&#9733;&#9733; &nbsp;5.0 on Google and Zillow &middot; <a href="/reviews" style="color:var(--gold)">Verified Reviews</a></div>
<p class="ih">Want this handled, not just explained?</p>
<p class="is">We walk clients through this at closing as a matter of course. Call or text (850) 266-5005 with any question, no obligation.</p>
<div class="ir">
<button type="button" class="ip" data-inquiry-open data-inquiry-type="General Question">Ask Us Directly &rarr;</button>
<a class="il" href="tel:+18502665005">Call or Text (850) 266-5005</a>
</div>
</div>`;
  const spec = {
    file: r.file, path: r.path, title: f.title, desc: f.description, keywords: f.keywords,
    ogSlug: r.ogSlug, h1: f.h1, lead: f.lead, main, dateISO: TODAY, minWords: 1100,
    schemaBlocks: [webPage("WebPage", { title: f.title, desc: f.description, path: r.path, dateISO: TODAY }),
      breadcrumbs([{ name: "Home", path: "/" }, { name: "Resources", path: "/resources" }, { name: f.h1, path: r.path }]),
      faqPage(f.faqs)],
  };
  const html = buildPage(spec);
  const errs = gate({ title: f.title, desc: f.description, minWords: 1100 }, html);
  if (errs.length) throw new Error(`${r.path} GATE FAIL: ` + errs.join("; "));
  await makeOgCard(r.ogSlug, r.ogLines, "A Costin Team Florida homeowner guide");
  log.push(`built ${r.path}`);
}

/* ---- 3) sitemap + llms entries for new static pages ---- */
{
  let sm = readFileSync(`${SITE_DIR}/sitemap.xml`, "utf8");
  for (const u of ["/search", "/resources", "/resources/florida-homestead-exemption", "/resources/florida-home-insurance"]) {
    if (!sm.includes(`<loc>${SITE}${u}</loc>`)) sm = sm.replace("</urlset>", `  <url><loc>${SITE}${u}</loc><lastmod>${TODAY}</lastmod></url>\n</urlset>`);
  }
  writeFileSync(`${SITE_DIR}/sitemap.xml`, sm);
  let llms = readFileSync(`${SITE_DIR}/llms.txt`, "utf8");
  const ADD = `- [Search Homes](${SITE}/search): live MLS search with instant alerts, browse by city
- [Resources](${SITE}/resources): Florida homeowner guides hub
- [Florida Homestead Exemption](${SITE}/resources/florida-homestead-exemption): savings, deadlines, Save Our Homes, portability
- [Florida Home Insurance](${SITE}/resources/florida-home-insurance): cost drivers, inspections, wind mitigation, flood`;
  if (!llms.includes("/resources/florida-homestead-exemption")) {
    llms = llms.replace(/(- \[Contact\]\([^)]*\): [^\n]*)/, `$1\n${ADD}`);
    writeFileSync(`${SITE_DIR}/llms.txt`, llms);
  }
  log.push("sitemap + llms updated");
}
console.log(log.join("\n"));
