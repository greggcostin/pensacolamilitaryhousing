// Bulk-enhance JSON-LD across all public/*.html pages:
// 1. Add Article schema to every page
// 2. Inject AggregateRating into every RealEstateAgent block that lacks it
// 3. Add geo coordinates to every Place block missing them
// 4. Patch faq.html and reviews.html with RealEstateAgent + BreadcrumbList

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PUB = "public";
const TODAY = "2026-04-22";
const FIRST_PUBLISH = "2026-04-20";

// Slug-to-coordinates map for the Place schema geo enrichment.
const COORDS = {
  "nas-pensacola": { lat: "30.3513", lng: "-87.3071" },
  "corry-station": { lat: "30.4133", lng: "-87.2797" },
  "saufley-field": { lat: "30.4688", lng: "-87.3428" },
  "nas-whiting-field": { lat: "30.7243", lng: "-87.0219" },
  "hurlburt-field": { lat: "30.4280", lng: "-86.6897" },
  "eglin-afb": { lat: "30.4640", lng: "-86.5477" },
  "duke-field": { lat: "30.6470", lng: "-86.5219" },
  "gulf-breeze": { lat: "30.3574", lng: "-87.1639" },
  "navarre": { lat: "30.4013", lng: "-86.8623" },
  "pace": { lat: "30.6007", lng: "-87.1630" },
  "milton": { lat: "30.6327", lng: "-87.0397" },
  "cantonment": { lat: "30.6088", lng: "-87.3297" },
  "perdido-key": { lat: "30.3090", lng: "-87.4608" },
  "east-pensacola-heights": { lat: "30.4152", lng: "-87.1891" },
  "east-hill": { lat: "30.4302", lng: "-87.1910" },
  "cordova-park": { lat: "30.4480", lng: "-87.2110" },
  "ferry-pass": { lat: "30.5088", lng: "-87.1875" },
  "bellview-myrtle-grove": { lat: "30.4488", lng: "-87.3394" },
  "navy-point-warrington": { lat: "30.3690", lng: "-87.2780" },
  "niceville-valparaiso-bluewater-bay": { lat: "30.5168", lng: "-86.4850" },
  "fort-walton-beach-shalimar": { lat: "30.4213", lng: "-86.6186" },
  "destin": { lat: "30.3935", lng: "-86.4958" },
  "crestview": { lat: "30.7621", lng: "-86.5703" },
  // Homes-for-sale maps to each base
  "homes-for-sale-nas-pensacola": { lat: "30.3513", lng: "-87.3071" },
  "homes-for-sale-nas-whiting-field": { lat: "30.7243", lng: "-87.0219" },
  "homes-for-sale-corry-station": { lat: "30.4133", lng: "-87.2797" },
  "homes-for-sale-saufley-field": { lat: "30.4688", lng: "-87.3428" },
  "homes-for-sale-hurlburt-field": { lat: "30.4280", lng: "-86.6897" },
  "homes-for-sale-eglin-afb": { lat: "30.4640", lng: "-86.5477" },
  "homes-for-sale-duke-field": { lat: "30.6470", lng: "-86.5219" },
  "on-base-vs-off-base-nas-pensacola": { lat: "30.3513", lng: "-87.3071" },
  "on-base-vs-off-base-nas-whiting-field": { lat: "30.7243", lng: "-87.0219" },
  "on-base-vs-off-base-corry-station": { lat: "30.4133", lng: "-87.2797" },
  "on-base-vs-off-base-saufley-field": { lat: "30.4688", lng: "-87.3428" },
  "on-base-vs-off-base-hurlburt-field": { lat: "30.4280", lng: "-86.6897" },
  "on-base-vs-off-base-eglin-afb": { lat: "30.4640", lng: "-86.5477" },
  "on-base-vs-off-base-duke-field": { lat: "30.6470", lng: "-86.5219" },
  // Resource pages — Pensacola centroid
  "va-loan-pensacola": { lat: "30.4213", lng: "-87.2169" },
  "assumable-va-loans-pensacola": { lat: "30.4213", lng: "-87.2169" },
  "pcs-checklist": { lat: "30.4213", lng: "-87.2169" },
  "fl064-bah-rates": { lat: "30.4213", lng: "-87.2169" },
  "va-disability-property-tax-florida": { lat: "30.4213", lng: "-87.2169" },
  "school-zones-military-families": { lat: "30.4213", lng: "-87.2169" },
  // Comparison pages — midpoint between the two
  "nas-pensacola-vs-hurlburt-field": { lat: "30.3897", lng: "-86.9984" },
  "gulf-breeze-vs-navarre": { lat: "30.3794", lng: "-87.0131" },
  "niceville-vs-crestview": { lat: "30.6395", lng: "-86.5286" },
  "blog": { lat: "30.4213", lng: "-87.2169" },
  "faq": { lat: "30.4213", lng: "-87.2169" },
  "reviews": { lat: "30.4213", lng: "-87.2169" },
};

const AGGREGATE_RATING = `,"aggregateRating":{"@type":"AggregateRating","ratingValue":"5.0","reviewCount":"34","bestRating":"5","worstRating":"1"}`;

const SAME_AS = [
  "https://www.google.com/maps/place/Gregg+Costin+Pensacola+Realtor+-+Levin+Rinke+Realty/@30.4129639,-87.2188735,17z/data=!4m6!3m5!1s0x8890c1a04a17d29b:0xaaa3b223c50fa5fc!8m2!3d30.4129639!4d-87.2188735!16s%2Fg%2F11mdg2zjxd",
  "https://www.zillow.com/profile/GreggCostin",
  "https://www.instagram.com/greggcostinrealtor/",
  "https://www.facebook.com/greggcostin/",
  "https://www.youtube.com/@PensacolaMilitaryRealtor",
  "https://linktr.ee/Greggcostin",
  "https://greggc.levinrinkerealty.com",
];

function extractMeta(html) {
  const title = (html.match(/<title>([^<]+)<\/title>/) || [])[1] || "";
  const desc = (html.match(/<meta\s+name="description"\s+content="([^"]+)"/) || [])[1] || "";
  const canonical = (html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/) || [])[1] || "";
  const h1 = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1] || title;
  return { title: title.trim(), desc: desc.trim(), canonical: canonical.trim(), h1: h1.replace(/<[^>]+>/g, "").trim() };
}

function articleSchemaJson(meta, slug) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: meta.h1 || meta.title.split("|")[0].trim(),
    description: meta.desc,
    author: { "@id": "https://pensacolamilitaryhousing.com/#person-gregg" },
    publisher: {
      "@type": "RealEstateAgent",
      name: "Gregg Costin, Realtor — The Costin Team",
      url: "https://pensacolamilitaryhousing.com",
      telephone: "+1-850-266-5005",
      logo: { "@type": "ImageObject", url: "https://pensacolamilitaryhousing.com/images/logo-08.png" },
    },
    datePublished: FIRST_PUBLISH,
    dateModified: TODAY,
    image: "https://pensacolamilitaryhousing.com/images/gregg-portrait.jpg",
    mainEntityOfPage: { "@type": "WebPage", "@id": meta.canonical || `https://pensacolamilitaryhousing.com/${slug}.html` },
    inLanguage: "en-US",
    keywords: "military relocation, PCS, VA loan, BAH, Pensacola, Florida Panhandle, Gregg Costin",
  };
}

function breadcrumbJson(slug, name) {
  // For resource pages, section = Resources; for homes-for-sale = Homes; else Bases
  let section = "Bases";
  let sectionHref = "https://pensacolamilitaryhousing.com/#bases";
  if (["va-loan-pensacola","assumable-va-loans-pensacola","pcs-checklist","fl064-bah-rates","va-disability-property-tax-florida","school-zones-military-families","nas-pensacola-vs-hurlburt-field","gulf-breeze-vs-navarre","niceville-vs-crestview"].includes(slug) || slug === "faq" || slug === "reviews") {
    section = "Resources";
    sectionHref = "https://pensacolamilitaryhousing.com/#resources";
  } else if (slug.startsWith("homes-for-sale-")) {
    section = "Homes for Sale";
    sectionHref = "https://pensacolamilitaryhousing.com/#homes";
  }
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://pensacolamilitaryhousing.com/" },
      { "@type": "ListItem", position: 2, name: section, item: sectionHref },
      { "@type": "ListItem", position: 3, name, item: `https://pensacolamilitaryhousing.com/${slug}.html` },
    ],
  };
}

function minimalAgent(areaServed) {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: "Gregg Costin, Realtor",
    url: "https://pensacolamilitaryhousing.com",
    telephone: "+1-850-266-5005",
    email: "Gregg.Costin@gmail.com",
    image: "https://pensacolamilitaryhousing.com/images/gregg-portrait.jpg",
    areaServed: { "@type": "Place", name: areaServed },
    worksFor: {
      "@type": "RealEstateOrganization",
      name: "Levin Rinke Realty",
      address: { "@type": "PostalAddress", streetAddress: "220 W. Garden Street", addressLocality: "Pensacola", addressRegion: "FL", postalCode: "32502", addressCountry: "US" },
    },
    knowsAbout: ["VA Home Loans", "BAH", "PCS Relocation", "Military Housing", "Florida Panhandle"],
    aggregateRating: { "@type": "AggregateRating", ratingValue: "5.0", reviewCount: "34", bestRating: "5", worstRating: "1" },
    sameAs: SAME_AS,
  };
}

const files = readdirSync(PUB).filter(f => f.endsWith(".html"));
const summary = { files: 0, articlesAdded: 0, ratingsAdded: 0, geoAdded: 0, agentsAdded: 0, breadsAdded: 0 };

for (const f of files) {
  const path = join(PUB, f);
  const slug = f.replace(".html", "");
  let html = readFileSync(path, "utf8");
  const before = html;

  const meta = extractMeta(html);

  // ── 1. Add Article schema (if missing) ─────────────────────────────────
  if (!html.includes('"@type":"Article"')) {
    const articleJson = JSON.stringify(articleSchemaJson(meta, slug));
    const articleBlock = `<script type="application/ld+json">\n${articleJson}\n</script>`;
    // Inject after the <link rel="canonical"> line (always exists) or before </head>
    if (html.includes('<link rel="canonical"')) {
      html = html.replace(/(<link\s+rel="canonical"[^>]*>)/, `$1\n${articleBlock}`);
    } else {
      html = html.replace("</head>", `${articleBlock}\n</head>`);
    }
    summary.articlesAdded++;
  }

  // ── 2. Inject AggregateRating into RealEstateAgent blocks that lack it ──
  html = html.replace(
    /(<script type="application\/ld\+json">\s*)(\{[^<]*?"@type":"RealEstateAgent"[^<]*?\})(\s*<\/script>)/g,
    (match, open, json, close) => {
      if (json.includes('"aggregateRating"')) return match;
      // Inject before the last } of the root object — robust to nested braces: find the last brace in the string
      const idx = json.lastIndexOf("}");
      if (idx === -1) return match;
      const patched = json.slice(0, idx) + AGGREGATE_RATING + json.slice(idx);
      summary.ratingsAdded++;
      return `${open}${patched}${close}`;
    }
  );

  // ── 3. Inject geo into Place schemas that lack it ──────────────────────
  const coords = COORDS[slug];
  if (coords) {
    html = html.replace(
      /(<script type="application\/ld\+json">\s*)(\{[^<]*?"@type":"Place"[^<]*?\})(\s*<\/script>)/g,
      (match, open, json, close) => {
        if (json.includes('"geo"')) return match;
        // Inject before the final } but not inside nested objects — use lastIndexOf of root-level close
        const geoSnippet = `,"geo":{"@type":"GeoCoordinates","latitude":"${coords.lat}","longitude":"${coords.lng}"}`;
        const idx = json.lastIndexOf("}");
        if (idx === -1) return match;
        const patched = json.slice(0, idx) + geoSnippet + json.slice(idx);
        summary.geoAdded++;
        return `${open}${patched}${close}`;
      }
    );
  }

  // ── 4. Add missing RealEstateAgent + BreadcrumbList to faq.html & reviews.html ─
  if ((slug === "faq" || slug === "reviews") && !html.includes('"@type":"RealEstateAgent"')) {
    const areaName = slug === "faq" ? "Florida Panhandle — Military Relocation FAQ" : "Florida Panhandle — Client Reviews";
    const agentJson = JSON.stringify(minimalAgent(areaName));
    const block = `<script type="application/ld+json">\n${agentJson}\n</script>`;
    html = html.replace("</head>", `${block}\n</head>`);
    summary.agentsAdded++;
  }
  if ((slug === "faq" || slug === "reviews") && !html.includes('"@type":"BreadcrumbList"')) {
    const name = slug === "faq" ? "Military PCS FAQ" : "Client Reviews";
    const breadJson = JSON.stringify(breadcrumbJson(slug, name));
    const block = `<script type="application/ld+json">\n${breadJson}\n</script>`;
    html = html.replace("</head>", `${block}\n</head>`);
    summary.breadsAdded++;
  }

  if (html !== before) {
    writeFileSync(path, html, "utf8");
    summary.files++;
    console.log(`updated: ${f}`);
  }
}

console.log("\nSummary:", summary);
