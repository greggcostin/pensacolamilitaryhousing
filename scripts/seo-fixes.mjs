import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PUB = "public";
const files = readdirSync(PUB).filter(f => f.endsWith(".html"));

const SAME_AS = [
  "https://www.google.com/maps/place/Gregg+Costin+Pensacola+Realtor+-+Levin+Rinke+Realty/@30.4129639,-87.2188735,17z/data=!4m6!3m5!1s0x8890c1a04a17d29b:0xaaa3b223c50fa5fc!8m2!3d30.4129639!4d-87.2188735!16s%2Fg%2F11mdg2zjxd",
  "https://www.zillow.com/profile/GreggCostin",
  "https://www.instagram.com/greggcostinrealtor/",
  "https://www.facebook.com/greggcostin/",
  "https://www.youtube.com/@PensacolaMilitaryRealtor",
  "https://linktr.ee/Greggcostin",
  "https://greggc.levinrinkerealty.com",
];
const sameAsJson = JSON.stringify(SAME_AS);

const summary = { files: 0, ogFixed: 0, lazyAdded: 0, sameAsAdded: 0, manifestLinked: 0 };

for (const f of files) {
  const path = join(PUB, f);
  let html = readFileSync(path, "utf8");
  const before = html;

  // 1. Replace broken /og.jpg reference with canonical portrait
  const ogMatches = html.match(/https:\/\/pensacolamilitaryhousing\.com\/og\.jpg/g);
  if (ogMatches) {
    html = html.replace(/https:\/\/pensacolamilitaryhousing\.com\/og\.jpg/g, "https://pensacolamilitaryhousing.com/images/gregg-portrait.jpg");
    summary.ogFixed += ogMatches.length;
  }

  // 2. Add loading="lazy" to every <img that lacks it
  html = html.replace(/<img\b(?![^>]*\bloading=)([^>]*)>/gi, (m, rest) => {
    summary.lazyAdded++;
    return `<img loading="lazy"${rest}>`;
  });

  // 3. Inject sameAs into each <script type=application/ld+json> containing RealEstateAgent (but not Person) if missing
  html = html.replace(
    /<script type="application\/ld\+json">([^<]+)<\/script>/g,
    (full, json) => {
      if (!json.includes('"@type":"RealEstateAgent"')) return full;
      if (json.includes('"sameAs"')) return full;
      // Inject sameAs before the final closing brace of the root object
      const idx = json.lastIndexOf("}");
      if (idx === -1) return full;
      const updated = json.slice(0, idx) + `,"sameAs":${sameAsJson}` + json.slice(idx);
      summary.sameAsAdded++;
      return `<script type="application/ld+json">${updated}</script>`;
    }
  );

  // 4. Ensure web manifest link is present in <head>
  if (!html.includes('rel="manifest"') && html.includes("</title>")) {
    html = html.replace("</title>", `</title>\n    <link rel="manifest" href="/site.webmanifest" />`);
    summary.manifestLinked++;
  }

  if (html !== before) {
    writeFileSync(path, html, "utf8");
    summary.files++;
    console.log(`edited: ${f}`);
  }
}

console.log("\nSummary:", summary);
