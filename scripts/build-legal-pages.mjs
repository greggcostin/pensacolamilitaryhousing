// Build /privacy and /accessibility on BOTH sites (audit 2026-09-02, eeat-01 / eeat-02).
// PMH pages go through scripts/page-factory.mjs (fragments written to content/pages/);
// greggcostin.com pages go through scripts/civilian-page-lib.mjs. Idempotent: re-running
// rebuilds the four pages from the text below.
//
//   node scripts/build-legal-pages.mjs
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { buildPage, breadcrumbs, webPage, gate, makeOgCard, SITE_DIR, SITE } from "./civilian-page-lib.mjs";

const DATE_ISO = "2026-09-02";
const DATE_LONG = "September 2, 2026";
const GC_PRIVACY_ISO = "2026-09-06";
const GC_PRIVACY_LONG = "September 6, 2026";

// ---------- shared copy ----------
function privacyMain(site) {
  const isPMH = site === "pmh";
  const brand = isPMH ? "PensacolaMilitaryHousing.com" : "GreggCostin.com";
  const sister = isPMH ? "GreggCostin.com" : "PensacolaMilitaryHousing.com";
  const analytics = isPMH
    ? "Google Analytics 4, Microsoft Clarity (session replays and heatmaps), Cloudflare Web Analytics, and the Follow Up Boss website tracker"
    : "Google Analytics 4, Microsoft Clarity (session replays and heatmaps), Cloudflare Web Analytics, and the Follow Up Boss website tracker";
  const embeds = isPMH
    ? "RealScout (home search), Calendly (appointment booking), and Pagefind (on-site search, which runs in your browser and sends nothing to a server)"
    : "RealScout (home search and home value alerts) and the Levin Rinke Realty MLS search";
  return `
<p>Effective ${GC_PRIVACY_LONG}. This policy explains what ${brand} collects, why, and the choices you have. The site is operated by Gregg Costin, a Florida and Alabama licensed real estate agent with Levin Rinke Realty, 220 W. Garden Street, Pensacola, FL 32502. Our sister site, ${sister}, publishes its own version of this policy.</p>

<h2>What we collect</h2>
<p><strong>Information you send us.</strong> When you use a contact or inquiry form, request the PCS checklist, ask for a home valuation, or book a call, we receive the details you enter: typically your name, email address, phone number, the type of help you want, and your message.</p>
<p><strong>Technical and usage data.</strong> Like most websites we log the pages you visit, the site or search engine that referred you, campaign tags in the link you followed, your approximate location, device and browser type, and an IP address. This is collected by the analytics tools listed below.</p>
<p><strong>Attribution memory.</strong> The first page you land on and any campaign tags in its address are stored in your browser (localStorage) so that, if you later send an inquiry, we know how you found us. Nothing is sent anywhere until you submit a form.</p>

<h2>How we use it</h2>
<ul>
<li>To answer your inquiry and follow up about buying, selling, or relocating. Inquiries are stored in our customer relationship system, Follow Up Boss, and forwarded to Gregg by email.</li>
<li>To understand which pages and campaigns are useful, using ${analytics}.</li>
<li>To keep the site working, secure, and fast (Cloudflare provides hosting, caching, and bot protection).</li>
</ul>
<p>We do not sell personal information, and we do not share it with third parties for their own marketing.</p>

<h2>Calls, texts, and email</h2>
<p>When you submit a form you agree that The Costin Team at Levin Rinke Realty may contact you by phone, email, and text message about your inquiry. Consent is not a condition of buying or selling with us. Message and data rates may apply, message frequency varies, and you can reply STOP to any text to opt out or HELP for help. You can unsubscribe from email with the link in any message.</p>

<h2>Cookies and analytics</h2>
<p>The analytics tools above set cookies or similar identifiers to tell repeat visits apart and to measure which pages lead to inquiries. They do not read your name or contact details from the site. You can block or clear cookies in your browser settings, install the <a href="https://tools.google.com/dlpage/gaoptout" rel="noopener" target="_blank">Google Analytics opt-out add-on</a>, and clear the attribution memory by clearing site data for this domain.</p>

<h2>Third-party services on the site</h2>
<h3>Facebook and Instagram advertising</h3>
<p>We ask for your permission before loading the Meta Pixel for Facebook and Instagram advertising measurement and remarketing. You can decline and still use our guides and inquiry forms. The Facebook &amp; Instagram ad preferences button in the footer lets you change your choice. We remember that choice for up to 180 days. A browser Global Privacy Control signal keeps Meta advertising off.</p>
<p>With permission, Meta receives page views and selected actions, such as a call-button click or a successfully submitted inquiry, to measure ads and support remarketing. We do not add your name, email address, phone number, or inquiry message to those events. Meta may receive technical information, including your IP address and browser information, through its Pixel.</p>
<p>These controls apply to Meta advertising. They do not change the separate Google Analytics, Microsoft Clarity, or Follow Up Boss settings described above.</p>
${isPMH ? '<p>With your permission, Meta measurement applies throughout PensacolaMilitaryHousing.com, including our articles, base and community guides, calculators, and inquiry pages. You can change your advertising choice using the Facebook &amp; Instagram ad preferences button in the footer of any page.</p>' : ''}
<p>Some pages embed tools from other companies: ${embeds}. When you use them, those companies collect information under their own privacy policies. Links to government, school, and industry sources open sites we do not control.</p>

<h2>How long we keep information</h2>
<p>Inquiry records stay in our customer system for as long as we have a business relationship or reasonably expect one, and as long as Florida real estate record-keeping rules require. Analytics data is kept on the retention settings of each tool, generally 14 months or less for Google Analytics.</p>

<h2>Security</h2>
<p>The site is served over HTTPS. Form submissions travel encrypted to a Cloudflare Worker that forwards them to our customer system and email. No method of transmission or storage is perfectly secure, so we cannot promise absolute security.</p>

<h2>Children</h2>
<p>This site is for adults making housing decisions. It is not directed to children under 18 and we do not knowingly collect information from them.</p>

<h2>Your choices and rights</h2>
<p>You can ask what information we hold about you, ask us to correct or delete it, or ask us to stop contacting you, by emailing <a href="mailto:gregg.costin@gmail.com">gregg.costin@gmail.com</a> or calling <a href="tel:+18502665005">(850) 266-5005</a>. Some records must be kept under brokerage and state rules; we will tell you if that applies. Residents of states with privacy laws that grant additional rights can exercise them through the same contact.</p>

<h2>Changes to this policy</h2>
<p>We will post any changes on this page and update the effective date at the top. Material changes will be noted on the homepage for 30 days.</p>

<h2>Contact</h2>
<p>Gregg Costin, Realtor, The Costin Team at Levin Rinke Realty, 220 W. Garden Street, Pensacola, FL 32502. Phone <a href="tel:+18502665005">(850) 266-5005</a>. Email <a href="mailto:gregg.costin@gmail.com">gregg.costin@gmail.com</a>. Equal Housing Opportunity.</p>
`;
}

function accessibilityMain(site) {
  const isPMH = site === "pmh";
  const brand = isPMH ? "PensacolaMilitaryHousing.com" : "GreggCostin.com";
  const embeds = isPMH ? "the RealScout home search, the Calendly booking calendar, and the Follow Up Boss chat widget" : "the RealScout home search and the Levin Rinke Realty MLS search";
  return `
<p>Updated ${DATE_LONG}. ${brand} is meant to work for everyone, including service members and veterans who use screen readers, keyboard navigation, voice control, magnification, or captions. Our target is WCAG 2.1 Level AA, the standard referenced by the Americans with Disabilities Act guidance for websites.</p>

<h2>What we have done</h2>
<ul>
<li>Semantic HTML with one main heading per page, a logical heading order, and a skip-to-content link on interactive pages.</li>
<li>Every image carries descriptive alt text; decorative logos are labeled with their brand name.</li>
<li>Visible keyboard focus on every link, button, and form field, and a focus trap inside the inquiry dialog with Escape to close.</li>
<li>Form fields are labeled, required fields are marked, and error messages are written in plain language.</li>
<li>Body text and gold accents meet the AA contrast ratio on the dark background.</li>
<li>Pages work without JavaScript for reading; the tools that need it (calculators, search) say so.</li>
</ul>

<h2>Known limitations</h2>
<p>Some content comes from other companies and is outside our control: ${embeds}. PDF downloads such as the PCS checklist are text-based but have not been fully tagged for screen readers. Data tables scroll sideways on small phones. We are working through these in the order that affects the most visitors.</p>

<h2>Tell us what is not working</h2>
<p>If any part of this site is hard to use, email <a href="mailto:gregg.costin@gmail.com">gregg.costin@gmail.com</a> or call or text <a href="tel:+18502665005">(850) 266-5005</a> and describe the page and what happened. We aim to reply within two business days and to fix genuine barriers quickly. If you need any information from this site in another format, ask and we will provide it.</p>

<h2>Formal complaints</h2>
<p>Gregg Costin is a licensed real estate agent with Levin Rinke Realty, 220 W. Garden Street, Pensacola, FL 32502. Equal Housing Opportunity. This statement was last reviewed on ${DATE_LONG}.</p>
`;
}

// ---------- PMH via page-factory ----------
const pmhPages = [
  {
    slug: "privacy", title: "Privacy Policy | Pensacola Military Housing",
    description: "How PensacolaMilitaryHousing.com collects and uses information: contact forms, analytics tools, calls and texts, cookies, retention, and how to reach us.",
    keywords: "privacy policy, Pensacola Military Housing privacy, Gregg Costin privacy, contact form data, analytics cookies",
    breadcrumbName: "Privacy Policy", h1: "Privacy Policy",
    lead: "What this site collects, why, who it is shared with, and the choices you have. Plain language, no surprises.",
    articleHeadline: "Privacy Policy for PensacolaMilitaryHousing.com", main: privacyMain("pmh"),
    related: [{ href: "/accessibility", label: "Accessibility statement" }, { href: "/contact", label: "Contact Gregg Costin" }],
  },
  {
    slug: "accessibility", title: "Accessibility Statement | Pensacola Military Housing",
    description: "Our accessibility commitment for PensacolaMilitaryHousing.com: WCAG 2.1 AA target, what is in place, known limitations, and how to report a barrier.",
    keywords: "accessibility statement, WCAG 2.1 AA, screen reader, Pensacola Military Housing accessibility",
    breadcrumbName: "Accessibility", h1: "Accessibility Statement",
    lead: "Built to be used by everyone, including readers who rely on screen readers, keyboards, or magnification. Here is where we stand and how to reach us if something is in the way.",
    articleHeadline: "Accessibility Statement for PensacolaMilitaryHousing.com", main: accessibilityMain("pmh"),
    related: [{ href: "/privacy", label: "Privacy policy" }, { href: "/contact", label: "Contact Gregg Costin" }],
  },
];
for (const p of pmhPages) {
  const spec = { slug: p.slug, title: p.title, description: p.description, keywords: p.keywords, breadcrumbName: p.breadcrumbName, h1: p.h1, lead: p.lead, articleHeadline: p.articleHeadline, figure: null, faq: [], related: p.related };
  const frag = `<!--PAGE\n${JSON.stringify(spec, null, 2)}\nPAGE-->\n${p.main.trim()}\n`;
  writeFileSync(`content/pages/${p.slug}.fragment.html`, frag);
  execSync(`node scripts/page-factory.mjs content/pages/${p.slug}.fragment.html`, { stdio: "inherit" });
  // the factory stamps its own constants; sync to today's date on these two pages
  let html = readFileSync(`public/${p.slug}.html`, "utf8");
  html = html.replace(/"datePublished":"[^"]*"/, `"datePublished":"${DATE_ISO}"`).replace(/"dateModified":"[^"]*"/, `"dateModified":"${DATE_ISO}"`)
    .replace(/article:published_time" content="[^"]*"/, `article:published_time" content="${DATE_ISO}T00:00:00Z"`).replace(/article:modified_time" content="[^"]*"/, `article:modified_time" content="${DATE_ISO}T00:00:00Z"`)
    .replace(/Last updated: [A-Za-z]+ \d{1,2}, \d{4}/, `Last updated: ${DATE_LONG}`).replace(/Reviewed &amp; updated &middot; [A-Za-z]+ \d{4}/, "Reviewed &amp; updated &middot; September 2026").replace(/Content last verified: [A-Za-z]+ \d{4}/, "Content last verified: September 2026");
  // utility pages are not articles for sharing purposes
  html = html.replace(/<meta property="og:type" content="article">/, '<meta property="og:type" content="website">');
  if (p.slug === 'privacy') html = html.replace(/"dateModified":"[^"]*"/, `"dateModified":"${GC_PRIVACY_ISO}"`).replace(/article:modified_time" content="[^"]*"/, `article:modified_time" content="${GC_PRIVACY_ISO}T00:00:00Z"`).replace(`Last updated: ${DATE_LONG}`, `Last updated: ${GC_PRIVACY_LONG}`);
  writeFileSync(`public/${p.slug}.html`, html);
  console.log(`PMH /${p.slug} built`);
}
execSync("node scripts/generate-og-images.mjs privacy", { stdio: "inherit" });
execSync("node scripts/generate-og-images.mjs accessibility", { stdio: "inherit" });

// ---------- GC via civilian-page-lib ----------
const gcPages = [
  { file: "privacy.html", path: "/privacy", ogSlug: "privacy", title: "Privacy Policy | The Costin Team",
    desc: "How GreggCostin.com collects and uses information: contact forms, analytics tools, calls and texts, cookies, retention, and how to reach The Costin Team.",
    keywords: "privacy policy, Gregg Costin privacy, The Costin Team privacy, contact form data, analytics cookies",
    h1: "Privacy Policy", lead: "What this site collects, why, who it is shared with, and the choices you have. Plain language, no surprises.", main: privacyMain("gc"), crumb: "Privacy Policy", ogLines: ["Privacy Policy"], ogSub: "How GreggCostin.com handles your information" },
  { file: "accessibility.html", path: "/accessibility", ogSlug: "accessibility", title: "Accessibility Statement | The Costin Team",
    desc: "Our accessibility commitment for GreggCostin.com: WCAG 2.1 AA target, what is in place today, known limitations, and how to report a barrier to us.",
    keywords: "accessibility statement, WCAG 2.1 AA, screen reader, GreggCostin.com accessibility",
    h1: "Accessibility Statement", lead: "Built to be used by everyone, including readers who rely on screen readers, keyboards, or magnification. Here is where we stand and how to reach us if something is in the way.", main: accessibilityMain("gc"), crumb: "Accessibility", ogLines: ["Accessibility", "Statement"], ogSub: "WCAG 2.1 AA target, known limits, how to report a barrier" },
];
for (const p of gcPages) {
  const spec = { ...p, dateISO: DATE_ISO, schemaBlocks: [] };
  spec.schemaBlocks = [webPage("WebPage", spec), breadcrumbs([{ name: "Home", path: "/" }, { name: p.crumb, path: p.path }])];
  if (p.path === '/privacy') spec.schemaBlocks[0].dateModified = GC_PRIVACY_ISO;
  const html = buildPage(spec);
  const errs = gate(spec, html);
  if (errs.length) throw new Error(`${p.path}: ${errs.join("; ")}`);
  await makeOgCard(p.ogSlug, p.ogLines, p.ogSub);
  let sm = readFileSync(`${SITE_DIR}/sitemap.xml`, "utf8");
  if (!sm.includes(`${SITE}${p.path}<`)) {
    sm = sm.replace("</urlset>", `  <url>\n    <loc>${SITE}${p.path}</loc>\n    <lastmod>${DATE_ISO}</lastmod>\n    <changefreq>yearly</changefreq>\n    <priority>0.3</priority>\n  </url>\n</urlset>`);
    writeFileSync(`${SITE_DIR}/sitemap.xml`, sm);
  }
  let llms = readFileSync(`${SITE_DIR}/llms.txt`, "utf8");
  if (!llms.includes(`${SITE}${p.path})`)) {
    llms = llms.replace(/(- \[Contact\]\([^)]*\): [^\n]*)/, `$1\n- [${p.crumb}](${SITE}${p.path}): ${p.crumb === "Privacy Policy" ? "what the site collects and how it is used" : "WCAG 2.1 AA commitment and how to report a barrier"}`);
    writeFileSync(`${SITE_DIR}/llms.txt`, llms);
  }
  console.log(`GC ${p.path} built (${html.length} chars)`);
}
execSync("node scripts/military-meta.mjs", { stdio: "inherit" });
console.log("legal pages: done");
