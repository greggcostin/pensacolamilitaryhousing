// Shared entity-node builders for both sites. Single source: content/entity/entity.json.
// Used by scripts/build-entity-graph.mjs (writes the nodes into every page) and
// scripts/audit-entity.mjs (verifies every page carries exactly these shapes).
import { readFileSync } from "node:fs";

export const E = JSON.parse(readFileSync("content/entity/entity.json", "utf8"));
const { ids, nap, images, person, team, brokerage, services } = E;
export const PMH = "https://pensacolamilitaryhousing.com";
export const GC = "https://greggcostin.com";
export const IDS = ids;

export const address = { "@type": "PostalAddress", streetAddress: nap.streetAddress, addressLocality: nap.addressLocality, addressRegion: nap.addressRegion, postalCode: nap.postalCode, addressCountry: "US" };
export const imageObject = (id, im) => ({ "@type": "ImageObject", "@id": id, url: im.url, contentUrl: im.url, width: im.width, height: im.height, caption: im.caption });
export const logoInline = { "@type": "ImageObject", url: images.logo.url, width: images.logo.width, height: images.logo.height };
const credential = (c) => ({ "@type": "EducationalOccupationalCredential", name: c.name, credentialCategory: c.category, recognizedBy: c.by });

export function personFull() {
  return {
    "@type": "Person", "@id": ids.person, name: person.name, givenName: person.givenName, familyName: person.familyName, alternateName: person.alternateName,
    honorificSuffix: person.honorificSuffix, jobTitle: person.jobTitle, description: person.description, url: person.url,
    image: [{ "@id": ids.portrait }, { "@type": "ImageObject", url: images.courthouse.url, width: images.courthouse.width, height: images.courthouse.height, caption: images.courthouse.caption }],
    email: nap.email, telephone: nap.telephone,
    worksFor: { "@id": ids.brokerage },
    memberOf: [{ "@id": ids.team }, ...person.memberOf],
    alumniOf: person.alumniOf, award: person.award, hasCredential: person.credentials.map(credential),
    knowsAbout: person.knowsAbout, knowsLanguage: "en-US", sameAs: person.sameAs,
  };
}
export function teamFull() {
  return {
    "@type": "RealEstateAgent", "@id": ids.team, name: nap.name, alternateName: nap.alternateName, description: team.description,
    url: GC, telephone: nap.telephone, email: nap.email, image: { "@id": ids.portrait }, logo: { "@id": ids.logo }, priceRange: nap.priceRange,
    address, geo: { "@type": "GeoCoordinates", latitude: nap.latitude, longitude: nap.longitude }, hasMap: nap.hasMap,
    openingHoursSpecification: [{ "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], opens: "00:00", closes: "23:59" }],
    areaServed: team.areaServed, parentOrganization: { "@id": ids.brokerage }, founder: { "@id": ids.person }, employee: [{ "@id": ids.person }],
    memberOf: person.memberOf, knowsAbout: team.knowsAbout, sameAs: team.sameAs,
  };
}
export function brokerageFull() {
  return { "@type": "Organization", "@id": ids.brokerage, name: brokerage.name, url: brokerage.url, address, subOrganization: { "@id": ids.team }, employee: { "@id": ids.person } };
}
export const serviceNode = (site, s) => ({
  "@type": "Service", "@id": `${site === "pmh" ? PMH : GC}/#${s.id}`, name: s.name, serviceType: s.serviceType, description: s.description,
  provider: { "@id": ids.team },
  areaServed: site === "pmh" ? { "@type": "AdministrativeArea", name: "Florida Panhandle" } : [{ "@type": "AdministrativeArea", name: "Escambia County, FL" }, { "@type": "AdministrativeArea", name: "Santa Rosa County, FL" }, { "@type": "AdministrativeArea", name: "Baldwin County, AL" }],
  ...(s.audience ? { audience: { "@type": "Audience", audienceType: s.audience } } : {}),
  url: s.url, offers: { "@type": "Offer", availability: "https://schema.org/InStock", url: s.offerUrl },
});

// compact reference nodes carried by every non-homepage
export const personCompact = () => ({ "@type": "Person", "@id": ids.person, name: person.name, jobTitle: person.jobTitle, honorificSuffix: person.honorificSuffix, description: person.shortDescription, url: person.url, image: images.portrait.url, worksFor: { "@id": ids.brokerage }, memberOf: { "@id": ids.team }, sameAs: [`${PMH}/about`, "https://www.zillow.com/profile/GreggCostin", "https://www.linkedin.com/in/greggcostin"] });
export const teamCompact = () => ({ "@type": "RealEstateAgent", "@id": ids.team, name: nap.name, url: GC, telephone: nap.telephone, logo: logoInline, parentOrganization: { "@id": ids.brokerage }, founder: { "@id": ids.person } });
export const brokerageCompact = () => ({ "@type": "Organization", "@id": ids.brokerage, name: brokerage.name, url: brokerage.url });
// the shape Article/BlogPosting.publisher takes (rich-result friendly subset)
export const publisherRef = () => ({ "@type": "RealEstateAgent", "@id": ids.team, name: nap.name, logo: logoInline });
export const SERVICES = { pmh: services.pmh, gc: services.gc };
