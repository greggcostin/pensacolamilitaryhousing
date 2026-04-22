// Add dedicated standalone RealEstateAgent + Place (with geo) schema blocks to
// faq.html and reviews.html. Both already have Article schema (which contains a
// publisher of type RealEstateAgent) but a dedicated entity is the SEO standard.

import { readFileSync, writeFileSync } from "node:fs";

const SAME_AS = [
  "https://www.google.com/maps/place/Gregg+Costin+Pensacola+Realtor+-+Levin+Rinke+Realty/@30.4129639,-87.2188735,17z/data=!4m6!3m5!1s0x8890c1a04a17d29b:0xaaa3b223c50fa5fc!8m2!3d30.4129639!4d-87.2188735!16s%2Fg%2F11mdg2zjxd",
  "https://www.zillow.com/profile/GreggCostin",
  "https://www.instagram.com/greggcostinrealtor/",
  "https://www.facebook.com/greggcostin/",
  "https://www.youtube.com/@PensacolaMilitaryRealtor",
  "https://linktr.ee/Greggcostin",
  "https://greggc.levinrinkerealty.com",
];

function standaloneAgent(areaName) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": "https://pensacolamilitaryhousing.com/#agent",
    name: "Gregg Costin, Realtor",
    url: "https://pensacolamilitaryhousing.com",
    telephone: "+1-850-266-5005",
    email: "Gregg.Costin@gmail.com",
    image: "https://pensacolamilitaryhousing.com/images/gregg-portrait.jpg",
    areaServed: { "@type": "Place", name: areaName, geo: { "@type": "GeoCoordinates", latitude: "30.4213", longitude: "-87.2169" } },
    worksFor: {
      "@type": "RealEstateOrganization",
      name: "Levin Rinke Realty",
      address: { "@type": "PostalAddress", streetAddress: "220 W. Garden Street", addressLocality: "Pensacola", addressRegion: "FL", postalCode: "32502", addressCountry: "US" },
    },
    hasCredential: [
      { "@type": "EducationalOccupationalCredential", name: "Military Relocation Professional (MRP)", credentialCategory: "certification" },
      { "@type": "EducationalOccupationalCredential", name: "Florida Military Specialist", credentialCategory: "certification" },
      { "@type": "EducationalOccupationalCredential", name: "Accredited Buyer's Representative (ABR)", credentialCategory: "certification" },
      { "@type": "EducationalOccupationalCredential", name: "Seller Representative Specialist (SRS)", credentialCategory: "certification" },
      { "@type": "EducationalOccupationalCredential", name: "Real Estate Negotiation Expert (RENE)", credentialCategory: "certification" },
    ],
    knowsAbout: ["VA Home Loans", "BAH", "PCS Relocation", "Military Housing", "Florida Panhandle", "NAS Pensacola", "Hurlburt Field", "Eglin AFB"],
    aggregateRating: { "@type": "AggregateRating", ratingValue: "5.0", reviewCount: "34", bestRating: "5", worstRating: "1" },
    sameAs: SAME_AS,
  });
}

function breadcrumb(slug, name, section) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://pensacolamilitaryhousing.com/" },
      { "@type": "ListItem", position: 2, name: section, item: "https://pensacolamilitaryhousing.com/#resources" },
      { "@type": "ListItem", position: 3, name, item: `https://pensacolamilitaryhousing.com/${slug}.html` },
    ],
  });
}

function patch(filename, slug, pageName) {
  const path = `public/${filename}`;
  let html = readFileSync(path, "utf8");
  const before = html;

  // Check for STANDALONE RealEstateAgent block (not inside Article publisher).
  // A quick heuristic: look for a script tag whose JSON starts with "@type":"RealEstateAgent"
  const hasStandaloneAgent = /<script[^>]*>\s*\{"@context":"https:\/\/schema\.org","@type":"RealEstateAgent"/.test(html);
  const hasBreadcrumb = html.includes('"@type":"BreadcrumbList"');

  const blocks = [];
  if (!hasStandaloneAgent) {
    blocks.push(`<script type="application/ld+json">\n${standaloneAgent(pageName)}\n</script>`);
  }
  if (!hasBreadcrumb) {
    blocks.push(`<script type="application/ld+json">\n${breadcrumb(slug, pageName, "Resources")}\n</script>`);
  }

  if (blocks.length) {
    html = html.replace("</head>", `${blocks.join("\n")}\n</head>`);
  }

  if (html !== before) {
    writeFileSync(path, html, "utf8");
    console.log(`patched: ${filename} — added ${blocks.length} schema block(s)`);
  } else {
    console.log(`unchanged: ${filename}`);
  }
}

patch("faq.html", "faq", "Military PCS FAQ");
patch("reviews.html", "reviews", "Client Reviews");
