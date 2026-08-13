// One-off (Aug 2026): give every content page that lacked imagery a relevant
// hero-band figure. Two modes:
//   reuse:     copy the existing hero <figure> (alt + caption verbatim, accurate
//              by construction) from a page that already carries the same subject
//   construct: build the figure from an image + hand-written alt/caption
//              (credits per content/blog/image-credits.json)
// Skipped on purpose: faq, reviews, book-pcs-call (Calendly above the fold),
// blog index (card grid), military-divorce-housing (tone).
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url)).replace(/\\/g, "/");
const P = (f) => ROOT + "public/" + f;

const pic = (src, alt, caption) => {
  const avif = src.replace(/\.(jpe?g|png)$/i, ".avif");
  const webp = src.replace(/\.(jpe?g|png)$/i, ".webp");
  return `<figure class="hero-band"><picture><source srcset="${avif}" type="image/avif"><source srcset="${webp}" type="image/webp"><img src="${src}" width="1600" height="900" alt="${alt}" loading="eager" fetchpriority="high" decoding="async"></picture><figcaption>${caption}</figcaption></figure>`;
};

// pages that copy an existing page's hero figure verbatim
const REUSE = {
  "on-base-vs-off-base-nas-pensacola.html": "bases/nas-pensacola.html",
  "on-base-vs-off-base-hurlburt-field.html": "bases/hurlburt-field.html",
  "on-base-vs-off-base-eglin-afb.html": "bases/eglin-afb.html",
  "on-base-vs-off-base-nas-whiting-field.html": "bases/whiting-field.html",
  "on-base-vs-off-base-corry-station.html": "bases/corry-station.html",
  "on-base-vs-off-base-duke-field.html": "bases/duke-field.html",
  "on-base-vs-off-base-saufley-field.html": "bases/saufley-field.html",
  "veteran-realtor-destin.html": "communities/destin.html",
  "cash-offer-pensacola.html": "sell.html",
  "military-rental-property-management.html": "rent-or-sell-pcs-pensacola.html",
  "new-construction-pensacola.html": "buy.html",
};

// pages that get a purpose-built figure
const CONSTRUCT = {
  "military-realtor-hurlburt-field.html": pic(
    "/images/blog/hurlburt-mv22-coast.jpg",
    "MV-22 Osprey flying over Santa Rosa Sound and the barrier island near Hurlburt Field",
    "An MV-22 Osprey over Santa Rosa Sound near Hurlburt Field. U.S. Air Force photo."),
  "nas-whiting-field-off-base-housing.html": pic(
    "/images/blog/whiting-t6-texan.jpg",
    "T-6B Texan II training aircraft taxiing at NAS Whiting Field",
    "The T-6B Texan II, the primary trainer that fills the pattern over Milton every weekday. U.S. Navy photo."),
  "crestview-military-relocation.html": pic(
    "/images/blog/crestview-7sfg-training.jpg",
    "Soldier from the 7th Special Forces Group descending a rappel tower during training",
    "7th Special Forces Group (Airborne) training on the Eglin range complex, minutes from Crestview. U.S. Army photo."),
  "niceville-vs-crestview.html": pic(
    "/images/blog/eglin-f35.jpg",
    "F-35 Lightning II flying over the Eglin Air Force Base range in Florida",
    "An F-35 Lightning II over Eglin Air Force Base, the workplace both towns orbit. U.S. Air Force photo."),
  "gulf-breeze-vs-navarre.html": pic(
    "/images/blog/gulf-breeze-bridge.jpg",
    "Pensacola Bay Bridge stretching north across the water from Gulf Breeze, Florida",
    "The Pensacola Bay Bridge from Gulf Breeze: three miles to downtown, and the commute that separates these two towns."),
  "military-lodging-pensacola.html": pic(
    "/images/blog/navy-lodge-suitcase.jpg",
    "Suitcase waiting outside a hotel entrance during a military travel stay",
    `Checking in: TLE rules decide how much of your hotel stay the government reimburses. Photo: <a href="https://commons.wikimedia.org/w/index.php?curid=187311890" rel="noopener nofollow" target="_blank">Shixart1985</a>, CC BY 2.0.`),
  "nas-pensacola-gates.html": pic(
    "/images/blog/blue-angels-diamond.jpg",
    "U.S. Navy Blue Angels flying in tight diamond formation",
    "The Blue Angels in diamond formation over their home station. U.S. Navy photo."),
  "military-pcs-tax-deductions.html": pic(
    "/images/topics/pcs-checklist.jpg",
    "Moving boxes staged during a military PCS move",
    "Active-duty PCS moves are one of the last moving-expense deductions left in the tax code."),
  "va-loan-closing-costs-florida.html": pic(
    "/images/topics/va-loan-guide.jpg",
    "Two-story craftsman style home with an American flag on the front porch",
    "Closing costs on a VA purchase are negotiable line items, not fixed fees."),
};

const MAIN = "<main data-pagefind-body>";
let done = 0;

function inject(file, figure) {
  const path = P(file);
  let html = readFileSync(path, "utf8");
  if (html.includes('<figure class="hero-band"') || html.includes('<figure class="figure-band"')) {
    console.log(`SKIP ${file}: already has a figure`);
    return;
  }
  if (!html.includes(MAIN)) throw new Error(`${file}: no ${MAIN}`);
  if (!/\.hero-band\{|\.hero-band,\.figure-band\{/.test(html.replace(/\s/g, ""))) {
    throw new Error(`${file}: hero-band CSS missing — refusing to inject unstyled figure`);
  }
  html = html.replace(MAIN, MAIN + "\n" + figure);
  const o = (html.match(/<div\b/g) || []).length, c = (html.match(/<\/div>/g) || []).length;
  if (o !== c) throw new Error(`${file}: div balance broken (${o} vs ${c})`);
  writeFileSync(path, html);
  done++;
  console.log(`HERO ${file}`);
}

for (const [target, source] of Object.entries(REUSE)) {
  const src = readFileSync(P(source), "utf8");
  const m = /<figure class="(?:hero|figure)-band">[\s\S]*?<\/figure>/.exec(src);
  if (!m) throw new Error(`${source}: no figure to reuse`);
  let fig = m[0].replace('class="figure-band"', 'class="hero-band"');
  fig = fig.replace(/loading="lazy"/, 'loading="eager" fetchpriority="high"');
  inject(target, fig);
}
for (const [target, figure] of Object.entries(CONSTRUCT)) inject(target, figure);

console.log(`\n${done} pages received hero figures`);
