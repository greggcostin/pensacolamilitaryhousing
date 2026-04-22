// Unify topnav, Explore grid, and sitemap cross-linking across all public/*.html pages.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PUB = "public";

// ── New unified banner-tabs block (applied to all 49 pages) ─────────────────────
const NEW_TABS = `<div class="banner-tabs">
<a href="/">Home</a>
<a href="/about">About Me</a>
<a href="/pcs-guide">PCS Guide</a>
<div class="dropdown"><button type="button">Bases ▾</button><div class="dropdown-menu"><a href="/nas-pensacola.html">NAS Pensacola</a><a href="/corry-station.html">Corry Station</a><a href="/saufley-field.html">Saufley Field</a><a href="/nas-whiting-field.html">NAS Whiting Field</a><a href="/hurlburt-field.html">Hurlburt Field</a><a href="/eglin-afb.html">Eglin AFB</a><a href="/duke-field.html">Duke Field</a></div></div>
<div class="dropdown"><button type="button">Communities ▾</button><div class="dropdown-menu"><a href="/gulf-breeze.html">Gulf Breeze</a><a href="/navarre.html">Navarre</a><a href="/pace.html">Pace</a><a href="/milton.html">Milton</a><a href="/cantonment.html">Cantonment</a><a href="/perdido-key.html">Perdido Key</a><a href="/east-pensacola-heights.html">East Pensacola Heights</a><a href="/east-hill.html">East Hill</a><a href="/cordova-park.html">Cordova Park</a><a href="/ferry-pass.html">Ferry Pass</a><a href="/bellview-myrtle-grove.html">Bellview/Myrtle Grove</a><a href="/navy-point-warrington.html">Navy Point/Warrington</a><a href="/niceville-valparaiso-bluewater-bay.html">Niceville/Valparaiso/Bluewater Bay</a><a href="/fort-walton-beach-shalimar.html">Fort Walton Beach/Shalimar</a><a href="/destin.html">Destin</a><a href="/crestview.html">Crestview</a></div></div>
<div class="dropdown homes-dropdown" aria-hidden="true"><button type="button" tabindex="-1">Homes ▾</button><div class="dropdown-menu"><a href="/homes-for-sale-nas-pensacola.html">Homes — NAS Pensacola</a><a href="/homes-for-sale-nas-whiting-field.html">Homes — Whiting Field</a><a href="/homes-for-sale-corry-station.html">Homes — Corry Station</a><a href="/homes-for-sale-saufley-field.html">Homes — Saufley Field</a><a href="/homes-for-sale-hurlburt-field.html">Homes — Hurlburt Field</a><a href="/homes-for-sale-eglin-afb.html">Homes — Eglin AFB</a><a href="/homes-for-sale-duke-field.html">Homes — Duke Field</a></div></div>
<div class="dropdown"><button type="button">Resources ▾</button><div class="dropdown-menu"><a href="/pcs-checklist.html">PCS Checklist</a><a href="/fl064-bah-rates.html">2026 BAH Rates</a><a href="/va-loan-pensacola.html">VA Loan Guide</a><a href="/assumable-va-loans-pensacola.html">Assumable VA Loans</a><a href="/va-disability-property-tax-florida.html">VA Disability Tax (FL)</a><a href="/school-zones-military-families.html">Military School Zones</a><a href="/homestead">Florida Homestead</a><a href="/nas-pensacola-vs-hurlburt-field.html">NAS Pensacola vs Hurlburt</a><a href="/gulf-breeze-vs-navarre.html">Gulf Breeze vs Navarre</a><a href="/niceville-vs-crestview.html">Niceville vs Crestview</a><a href="/faq.html">FAQ</a></div></div>
<a href="/mortgage-calculators">Calculators</a>
<a href="/contact">Contact</a>
</div>`;

// ── New unified Explore grid block ─────────────────────────────────────────────
const NEW_EXPLORE = `<h2>Explore Other Bases &amp; Areas</h2>
<div class="explore">
<div class="explore-col">
<h3 class="explore-title">Bases</h3>
<div class="related">
<a href="/nas-pensacola.html">NAS Pensacola</a>
<a href="/corry-station.html">Corry Station</a>
<a href="/saufley-field.html">Saufley Field</a>
<a href="/nas-whiting-field.html">NAS Whiting Field</a>
<a href="/hurlburt-field.html">Hurlburt Field</a>
<a href="/eglin-afb.html">Eglin AFB</a>
<a href="/duke-field.html">Duke Field</a>
</div>
</div>
<div class="explore-col">
<h3 class="explore-title">Communities</h3>
<div class="related">
<a href="/gulf-breeze.html">Gulf Breeze</a>
<a href="/navarre.html">Navarre</a>
<a href="/pace.html">Pace</a>
<a href="/milton.html">Milton</a>
<a href="/cantonment.html">Cantonment</a>
<a href="/perdido-key.html">Perdido Key</a>
<a href="/east-pensacola-heights.html">East Pensacola Heights</a>
<a href="/east-hill.html">East Hill</a>
<a href="/cordova-park.html">Cordova Park</a>
<a href="/ferry-pass.html">Ferry Pass</a>
<a href="/bellview-myrtle-grove.html">Bellview/Myrtle Grove</a>
<a href="/navy-point-warrington.html">Navy Point/Warrington</a>
<a href="/niceville-valparaiso-bluewater-bay.html">Niceville/Valparaiso/Bluewater Bay</a>
<a href="/fort-walton-beach-shalimar.html">Fort Walton Beach/Shalimar</a>
<a href="/destin.html">Destin</a>
<a href="/crestview.html">Crestview</a>
</div>
</div>
<div class="explore-col">
<h3 class="explore-title">Resources</h3>
<div class="related">
<a href="/va-loan-pensacola.html">VA Loan Guide</a>
<a href="/assumable-va-loans-pensacola.html">Assumable VA Loans</a>
<a href="/pcs-checklist.html">PCS Checklist</a>
<a href="/fl064-bah-rates.html">2026 BAH Rates</a>
<a href="/va-disability-property-tax-florida.html">VA Disability Tax (FL)</a>
<a href="/school-zones-military-families.html">Military School Zones</a>
<a href="/nas-pensacola-vs-hurlburt-field.html">NAS Pensacola vs Hurlburt</a>
<a href="/gulf-breeze-vs-navarre.html">Gulf Breeze vs Navarre</a>
<a href="/niceville-vs-crestview.html">Niceville vs Crestview</a>
<a href="/faq.html">PCS FAQ</a>
<a href="/reviews.html">Reviews</a>
<a href="/">Home</a>
</div>
</div>
</div>`;

// ── Contextual inline links (only apply to existing base/community/faq/reviews/blog pages) ───
// Regex-based but guarded: only match in body text, skip anchor/href/src/value contexts.
// Keep it conservative: only convert phrase if NOT already inside an <a> tag.
const INLINE_LINKS = [
  { phrase: /\b2026 BAH rates?\b/g, url: "/fl064-bah-rates.html", label: "2026 BAH rates" },
  { phrase: /\bBAH MHA FL064\b/g, url: "/fl064-bah-rates.html", label: "BAH MHA FL064" },
  { phrase: /\bBAH MHA FL023\b/g, url: "/fl064-bah-rates.html", label: "BAH MHA FL023" },
  { phrase: /\bPCS checklist\b/gi, url: "/pcs-checklist.html", label: "PCS checklist" },
  { phrase: /\bVA Pamphlet 26-7\b/g, url: "/va-loan-pensacola.html", label: "VA Pamphlet 26-7" },
  { phrase: /\bassumable VA loans?\b/gi, url: "/assumable-va-loans-pensacola.html", label: "assumable VA loan" },
  { phrase: /\bFlorida Homestead Exemption\b/g, url: "/va-disability-property-tax-florida.html", label: "Florida Homestead Exemption" },
  { phrase: /\bInterstate Compact for Military Children\b/gi, url: "/school-zones-military-families.html", label: "Interstate Compact for Military Children" },
];

function applyInlineLinks(html, excludeSlugs) {
  // Only run on body between <main> and </main>
  const mainMatch = html.match(/<main>([\s\S]*?)<\/main>/);
  if (!mainMatch) return html;
  let main = mainMatch[1];

  for (const { phrase, url, label } of INLINE_LINKS) {
    // Skip if this page IS the target of the link (avoid self-links)
    if (excludeSlugs.some(s => url.includes(s))) continue;

    // Only replace first occurrence per phrase per page to avoid over-linking
    let replaced = false;
    main = main.replace(phrase, (match, offset) => {
      if (replaced) return match;
      // Context check: look at surrounding 120 chars to skip anchor/attribute contexts
      const before = main.slice(Math.max(0, offset - 120), offset);
      const openA = (before.match(/<a\b[^>]*>/g) || []).length;
      const closeA = (before.match(/<\/a>/g) || []).length;
      if (openA > closeA) return match; // inside an <a>
      if (/href="[^"]*$/.test(before)) return match; // inside href attribute
      if (/alt="[^"]*$/.test(before) || /title="[^"]*$/.test(before)) return match;
      replaced = true;
      return `<a href="${url}">${match}</a>`;
    });
  }

  return html.replace(mainMatch[0], `<main>${main}</main>`);
}

// ── Main loop ─────────────────────────────────────────────────────────────────
const files = readdirSync(PUB).filter(f => f.endsWith(".html"));
const summary = { files: 0, tabsReplaced: 0, exploreReplaced: 0, inlinedFiles: 0 };

for (const f of files) {
  const path = join(PUB, f);
  let html = readFileSync(path, "utf8");
  const before = html;

  // 1. Replace banner-tabs block
  html = html.replace(/<div class="banner-tabs">[\s\S]*?<\/div>\s*<\/nav>/, `${NEW_TABS}\n</nav>`);
  if (html.includes("Homes ▾") && !before.includes("Homes ▾")) summary.tabsReplaced++;

  // 2. Replace Explore grid (match from "Explore Other Bases" h2 to the closing </div></div></div></div>)
  html = html.replace(
    /<h2>Explore Other Bases[\s\S]*?<div class="explore">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/,
    NEW_EXPLORE
  );
  if (html.includes("Niceville vs Crestview") && !before.includes("Niceville vs Crestview")) summary.exploreReplaced++;

  // 3. Inline contextual links (skip resource pages themselves)
  const slug = f.replace(".html", "");
  const resourceSlugs = ["va-loan-pensacola", "assumable-va-loans-pensacola", "pcs-checklist", "fl064-bah-rates", "va-disability-property-tax-florida", "school-zones-military-families"];
  // Only apply inline links if this page is NOT itself one of the resource pages
  // AND only exclude self-link if page slug matches a resource URL target
  const selfSlugs = [slug];
  const htmlAfterInline = applyInlineLinks(html, selfSlugs);
  if (htmlAfterInline !== html) summary.inlinedFiles++;
  html = htmlAfterInline;

  if (html !== before) {
    writeFileSync(path, html, "utf8");
    summary.files++;
    console.log(`updated: ${f}`);
  }
}

console.log("\nSummary:", summary);
