// Per-route prerender shells for the SPA (audit item 2.15).
//
// Cloudflare Pages serves a matching dist/<slug>.html before the "/* /index.html 200"
// SPA fallback. Previously this script copied dist/index.html VERBATIM to about.html
// and contact.html, so those routes (and every other SPA route via the fallback)
// shipped the HOMEPAGE title, description, canonical=/, and og tags to crawlers —
// duplicate titles + wrong canonicals across several substantial URLs.
//
// Now: for each shell route in src/routeMeta.js we transform dist/index.html into a
// route-correct shell — unique <title>, meta description, self-referential canonical,
// og/twitter/hreflang, and a route-specific #root fallback (so no-JS crawlers see the
// route's own content, not the homepage body). The SAME routeMeta.js drives the
// runtime document.title/canonical sync in App.jsx, so shell and client head can't drift.
//
// Anti-drift: every replacement asserts its anchor exists; a future index.html head
// edit that breaks an anchor FAILS the build loudly instead of silently emitting
// homepage metadata. JSON-LD blocks are left byte-for-byte unchanged (their @id-keyed
// entities are meant to repeat across URLs).

import { readFileSync, writeFileSync } from "node:fs";
import { ROUTE_META, SITE, HOME_TITLE, HOME_DESC } from "../src/routeMeta.js";
import { BAH_DATA } from "../src/bahData.js";
import { INSTALLATIONS_HEADERS, INSTALLATIONS, NEIGHBORHOOD_HEADERS, NEIGHBORHOOD_ROWS, PCS_CHECKLIST, FL_BENEFITS, PCS_FAQS } from "../src/pcsGuideData.js";

// ── /pcs-guide shell content (audit 2026-09-02, geo-01 / idx-04) ──
// The hydrated page renders ~1,300 words of tables, checklist and FAQs; the old shell gave
// non-JS crawlers (every AI engine except Google) 164 words. Render the same data here.
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const TD = 'style="padding:8px 10px;border-top:1px solid rgba(255,255,255,0.08);vertical-align:top"';
const TH = 'style="padding:8px 10px;text-align:left;color:#C4A75A;font-size:12px;letter-spacing:1px;text-transform:uppercase"';
const table = (headers, rows) => `<div style="overflow-x:auto;margin:0 0 24px"><table style="border-collapse:collapse;width:100%;font-size:14px;line-height:1.5"><thead><tr>${headers.map((h) => `<th ${TH}>${esc(h)}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td ${TD}>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
const bahRows = (rows) => rows.map(([g, w, wo]) => [g, `$${Number(w).toLocaleString("en-US")}`, `$${Number(wo).toLocaleString("en-US")}`]);
const h2 = (t) => `<h2 style="color:#C4A75A;font-size:22px;margin:32px 0 12px;font-weight:500">${esc(t)}</h2>`;
const h3 = (t) => `<h3 style="color:#fff;font-size:17px;margin:20px 0 8px;font-weight:600">${esc(t)}</h3>`;
const p = (t) => `<p style="font-size:15px;line-height:1.7;color:#B8BAC0;margin:0 0 14px;max-width:760px">${t}</p>`;
function pcsGuideBody() {
  const fl = BAH_DATA.FL064;
  const enlisted = [["E-1 through E-4", fl.enlisted[0][1], fl.enlisted[0][2]], ...fl.enlisted.filter(([g]) => !["E-1", "E-2", "E-3", "E-4"].includes(g))];
  return [
    h2("Military Installations in the Pensacola Area"),
    p("The greater Pensacola area is home to several major military installations, each serving different branches and mission sets. Knowing which base you are reporting to is the first step in narrowing your housing search."),
    table(INSTALLATIONS_HEADERS, INSTALLATIONS),
    h2("Neighborhood Comparison Guide"),
    table(NEIGHBORHOOD_HEADERS, NEIGHBORHOOD_ROWS),
    h2("Your PCS Timeline Checklist"),
    ...PCS_CHECKLIST.map((c) => `${h3(c.label)}<ul style="font-size:15px;line-height:1.8;color:#B8BAC0;padding-left:20px;margin:0 0 12px">${c.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`),
    h2(`2026 BAH Rates for Pensacola (MHA ${fl.mhaCode})`),
    p(`Monthly Basic Allowance for Housing for service members assigned to ${esc(fl.installations)} (Military Housing Area ${fl.mhaCode}, ${esc(fl.mhaName)}). Columns: grade, with dependents, without dependents. Source: DoD 2026 BAH tables.`),
    h3("Enlisted (E-1 through E-9)"), table(["Grade", "With Dependents", "Without Dependents"], bahRows(enlisted)),
    h3("Warrant Officer (W-1 through W-5)"), table(["Grade", "With Dependents", "Without Dependents"], bahRows(fl.warrant)),
    h3("Officer (O-1 through O-6, including prior-enlisted O-1E, O-2E, O-3E)"), table(["Grade", "With Dependents", "Without Dependents"], bahRows(fl.officer.filter(([g]) => g !== "O-7"))),
    p(`Fort Walton Beach (Eglin AFB, Hurlburt Field, Duke Field) falls under MHA ${BAH_DATA.FL023.mhaCode}; see the <a href="/bah-rates" style="color:#C4A75A">2026 BAH rates page</a> for both tables and the <a href="/mortgage-calculators" style="color:#C4A75A">BAH-to-mortgage calculators</a>.`),
    h2("Florida Benefits for Military Families"),
    `<ul style="font-size:15px;line-height:1.8;color:#B8BAC0;padding-left:20px;margin:0 0 12px">${FL_BENEFITS.map((b) => `<li><strong style="color:#fff">${esc(b.title)}</strong> ${esc(b.text)}</li>`).join("")}</ul>`,
    h2("Frequently Asked Questions"),
    ...PCS_FAQS.map((f) => `<details style="margin:0 0 10px;border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:12px 16px"><summary style="cursor:pointer;color:#fff;font-weight:600;font-size:16px">${esc(f.q)}</summary><p style="font-size:15px;line-height:1.7;color:#B8BAC0;margin:10px 0 0">${esc(f.a)}</p></details>`),
  ].join("\n");
}
const pcsGuideFaqJsonLd = () => JSON.stringify({
  "@context": "https://schema.org", "@type": "FAQPage",
  mainEntity: PCS_FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
});

import { ROUTE_SECTIONS, ROUTE_LINKS, BASE_LINKS } from "../src/routeSections.js";
import { COMMUNITY_LINKS, COMMUNITY_GROUPS } from "../src/communitiesData.js";

const SRC = "dist/index.html";
const base = readFileSync(SRC, "utf8"); // utf8 => the ® in the title survives round-trip

// Replace an anchor; throw (fail the build) if it isn't present.
function swap(html, needle, repl, label, route) {
  if (!html.includes(needle)) {
    throw new Error(`postbuild 2.15: anchor "${label}" not found while building /${route.file}. ` +
      `index.html head changed — update src/routeMeta.js / this script's anchors.`);
  }
  return html.split(needle).join(repl); // replaceAll semantics (description appears 3x)
}

// Regex for the entire #root element. In the BUILT dist/index.html Vite hoists the
// module script into <head>, and #root (a comment + one wrapper div) is immediately
// followed by the "Site search modal" block. The only place two </div> are followed
// by that comment is #root's wrapper-close + #root-close, so this pins the block
// unambiguously via a lookahead (the modal markup itself is preserved).
const ROOT_RE = /<div id="root">[\s\S]*?<\/div>\s*<\/div>(?=\s*<!-- Site search modal)/;

// Optional per-route crawlable link block rendered inside the prerender shell —
// gives high-equity SPA routes real internal links to the decision-tool pages.
// src/routeSections.js (audit idx-04): every shell carries 300+ words of section copy mirroring the
// React H2s, a descriptive link block, and (communities, pcs-guide) the base + community link grid.
const SHELL_LINKS = ROUTE_LINKS;
const H2 = 'style="color:#fff;font-size:22px;font-weight:500;margin:28px 0 10px"';
const Pst = 'style="font-size:16px;line-height:1.7;color:#B8BAC0;margin:0 0 14px;max-width:760px"';
function sectionsHtml(r) {
  const secs = ROUTE_SECTIONS[r.file] || [];
  return secs.map((s) => `<section><h2 ${H2}>${esc(s.h2)}</h2>${s.text.map((p) => `<p ${Pst}>${esc(p)}</p>`).join("")}</section>`).join("\n");
}
function communityGridHtml() {
  const groups = COMMUNITY_GROUPS.map((g) => {
    const items = COMMUNITY_LINKS.filter((c) => c.base === g).map((c) => `<li style="margin:0 0 10px"><a href="${c.href}" style="color:#E8E9EB;font-weight:600">${esc(c.label)}</a><span style="color:#B8BAC0"> &middot; ${esc(c.blurb)}</span></li>`).join("");
    return `<h3 style="color:#C4A75A;font-size:17px;font-weight:500;margin:22px 0 8px">${esc(g)}</h3><ul style="list-style:none;padding:0;margin:0;font-size:15px;line-height:1.6">${items}</ul>`;
  }).join("");
  const bases = `<h3 style="color:#C4A75A;font-size:17px;font-weight:500;margin:22px 0 8px">Base guides</h3><ul style="list-style:none;padding:0;margin:0;font-size:15px;line-height:2">${BASE_LINKS.map(([l, h]) => `<li><a href="${h}" style="color:#E8E9EB">${esc(l)}</a></li>`).join("")}</ul>`;
  return `<section><h2 ${H2}>Community Guides by Base</h2>${groups}${bases}</section>`;
}

function makeFallback(r) {
  const grid = r.file === "communities" || r.file === "pcs-guide" ? communityGridHtml() : "";
  const body = (r.file === "pcs-guide" ? `<section style="margin:8px 0 32px">${pcsGuideBody()}</section>` : "") + sectionsHtml(r) + grid;
  const tools = SHELL_LINKS[r.file]
    ? `<section style="margin:0 0 24px"><h2 style="color:#C4A75A;font-size:18px;margin:0 0 10px;font-weight:500">PCS Decision Tools</h2><ul style="list-style:none;padding:0;margin:0;font-size:15px;line-height:2">${SHELL_LINKS[r.file].map(([label, href]) => `<li><a href="${href}" style="color:#E8E9EB">${label}</a></li>`).join("")}</ul></section>`
    : "";
  return `            <div style="background:#0A0F1A;color:#E8E9EB;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;min-height:100vh;padding:40px 24px;max-width:1100px;margin:0 auto">
              <header style="margin-bottom:32px">
                <p style="color:#C4A75A;font-size:11px;letter-spacing:2.5px;text-transform:uppercase;margin:0 0 8px">Pensacola Military Housing</p>
                <h1 style="font-size:clamp(28px,4vw,44px);line-height:1.15;margin:0 0 16px;color:#fff;font-weight:500">${r.heading}</h1>
                <p style="font-size:16px;line-height:1.7;color:#B8BAC0;margin:0 0 20px;max-width:720px">${r.intro}</p>
                ${tools}
                <p style="font-size:15px;margin:0 0 8px"><strong>Call or text:</strong> <a href="tel:8502665005" style="color:#C4A75A;text-decoration:none">(850) 266-5005</a> &nbsp;&middot;&nbsp; <strong>Email:</strong> <a href="mailto:gregg.costin@gmail.com" style="color:#C4A75A;text-decoration:none">gregg.costin@gmail.com</a></p>
                <p style="font-size:14px;color:#8A8D94;margin:0">Gregg Costin, Realtor&reg; &middot; Levin Rinke Realty &middot; 220 W. Garden Street, Pensacola, FL 32502 &middot; Licensed in Florida &amp; Alabama &middot; Equal Housing Opportunity &middot; <a href="/privacy" style="color:#8A8D94">Privacy</a> &middot; <a href="/accessibility" style="color:#8A8D94">Accessibility</a></p>
              </header>
              ${body}
              <nav style="font-size:14px;color:#B8BAC0;line-height:1.9"><a href="/" style="color:#E8E9EB">Home</a> &middot; <a href="/about" style="color:#E8E9EB">About</a> &middot; <a href="/pcs-guide" style="color:#E8E9EB">PCS Guide</a> &middot; <a href="/communities" style="color:#E8E9EB">Communities</a> &middot; <a href="/mortgage-calculators" style="color:#E8E9EB">Calculators</a> &middot; <a href="/va-loan-guide" style="color:#E8E9EB">VA Loan Guide</a> &middot; <a href="/reviews" style="color:#E8E9EB">Reviews</a> &middot; <a href="/contact" style="color:#E8E9EB">Contact</a></nav>
              <noscript><p style="margin-top:32px;padding:16px;background:#1a1f2a;border-left:3px solid #C4A75A;color:#B8BAC0;font-size:13px">Enable JavaScript for the full interactive experience, including the 2026 BAH and mortgage calculators.</p></noscript>
            </div>`;
}

let count = 0;
for (const r of ROUTE_META.filter((e) => e.shell)) {
  const canon = SITE + r.slug; // e.g. https://pensacolamilitaryhousing.com/about
  let html = base;

  // ── head metadata ──
  html = swap(html, `<title>${HOME_TITLE}</title>`, `<title>${r.title}</title>`, "title", r);
  html = swap(html, `content="${HOME_DESC}"`, `content="${r.description}"`, "description(x3)", r); // name + og + twitter
  html = swap(html, `<link rel="canonical" href="${SITE}/" />`, `<link rel="canonical" href="${canon}" />`, "canonical", r);
  html = swap(html, `hreflang="en-US" href="${SITE}/">`, `hreflang="en-US" href="${canon}">`, "hreflang-en", r);
  html = swap(html, `hreflang="x-default" href="${SITE}/">`, `hreflang="x-default" href="${canon}">`, "hreflang-x", r);
  html = swap(html, `property="og:url" content="${SITE}/"`, `property="og:url" content="${canon}"`, "og:url", r);
  html = swap(html, `name="twitter:url" content="${SITE}/"`, `name="twitter:url" content="${canon}"`, "twitter:url", r);
  html = swap(html, `property="og:title" content="${HOME_TITLE}"`, `property="og:title" content="${r.title}"`, "og:title", r);
  html = swap(html, `name="twitter:title" content="${HOME_TITLE}"`, `name="twitter:title" content="${r.title}"`, "twitter:title", r);
  // per-route OG image (generated by scripts/generate-spa-og-images.mjs)
  html = swap(html, `property="og:image" content="${SITE}/og/home.png"`, `property="og:image" content="${SITE}/og/${r.file}.png"`, "og:image", r);
  html = swap(html, `name="twitter:image" content="${SITE}/og/home.png"`, `name="twitter:image" content="${SITE}/og/${r.file}.png"`, "twitter:image", r);
  // The homepage hero preload competes with each route's own LCP on shells that
  // never render the hero — strip it (audit 2.21). Kept on / (index.html itself).
  html = swap(html, `<link rel="preload" as="image" href="/images/hero-window.avif" type="image/avif" fetchpriority="high" />`, ``, "hero-preload-strip", r);

  // ── per-page structured data: WebPage + BreadcrumbList (entity blocks untouched) ──
  const webPage = JSON.stringify({
    "@context": "https://schema.org", "@type": "WebPage", "@id": `${canon}#webpage`,
    url: canon, name: r.title, description: r.description,
    isPartOf: { "@id": `${SITE}/#website` }, about: { "@id": "https://greggcostin.com/#team" }, inLanguage: "en-US",
  });
  const crumbs = JSON.stringify({
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: r.crumb, item: canon },
    ],
  });
  const faqLd = r.file === "pcs-guide" ? `<script type="application/ld+json">${pcsGuideFaqJsonLd()}</script>\n` : "";
  html = swap(html, `</head>`,
    `<script type="application/ld+json">${webPage}</script>\n<script type="application/ld+json">${crumbs}</script>\n${faqLd}</head>`,
    "head-close", r);

  // ── #root fallback (route-specific, replaces the homepage SEO block) ──
  if (!ROOT_RE.test(html)) {
    throw new Error(`postbuild 2.15: #root block anchor not found for /${r.file}.`);
  }
  html = html.replace(ROOT_RE, `<div id="root">\n${makeFallback(r)}\n          </div>`);

  // ── anti-drift assertions ──
  if (!html.includes(`<link rel="canonical" href="${canon}" />`)) throw new Error(`2.15: canonical not applied for /${r.file}`);
  if (html.includes(`<link rel="canonical" href="${SITE}/" />`)) throw new Error(`2.15: homepage canonical still present in /${r.file}`);
  if (html.includes(`<title>${HOME_TITLE}</title>`)) throw new Error(`2.15: homepage title still present in /${r.file}`);
  if (html.includes(`Pensacola's #1 <em`)) throw new Error(`2.15: homepage #root H1 still present in /${r.file}`);
  // Crawler-visible content floor (audit 2026-09-02, geo-01): the PCS guide shell must carry its data.
  if (r.file === "pcs-guide") {
    const rootText = (html.match(ROOT_RE) || [""])[0].replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<[^>]+>/g, " ");
    const words = (rootText.match(/\S+/g) || []).length;
    if (words < 800) throw new Error(`geo-01: /pcs-guide shell has only ${words} words (floor 800)`);
    console.log(`postbuild geo-01: /pcs-guide shell carries ${words} words + FAQPage JSON-LD`);
  }

  writeFileSync(`dist/${r.file}.html`, html, "utf8");
  count++;
  console.log(`postbuild 2.15: wrote dist/${r.file}.html  title="${r.title}"  canonical=${canon}`);
}
console.log(`postbuild 2.15: ${count} route shells written (about, contact, pcs-guide, communities, mortgage-calculators)`);
