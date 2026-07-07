// Single source of truth for per-route SEO metadata (audit item 2.15).
// Imported by BOTH scripts/postbuild-spa-routes.mjs (build-time shell generation)
// and src/App.jsx (runtime document.title / canonical / og sync), so crawler-visible
// shell metadata and the client-rendered head can never drift.
//
// Plain ESM data only — no JSX, no node/browser globals — so it imports cleanly in
// both the Node build script and the Vite bundle.
//
// `page` keys match the SPA router's PAGE_TO_SLUG ids in App.jsx.
// `shell: true` routes get a prerendered dist/<file>.html with unique metadata.
// The 301'd routes (va-loans, homestead) and static-twin routes (reviews, blog)
// are shell:false — they still appear here so client-side SPA nav sets a sane title,
// but crawlers never reach them as SPA shells.

export const SITE = "https://pensacolamilitaryhousing.com";

export const HOME_TITLE = "Pensacola Military Housing | Gregg Costin, Realtor® | PCS & VA Loan";
export const HOME_DESC = "PCS-to-Pensacola Realtor specializing in VA loans and military relocation across NAS Pensacola, Corry, Whiting, Eglin, Hurlburt, and Duke Field.";

export const ROUTE_META = [
  {
    page: "home", file: "index", slug: "/", shell: false,
    title: HOME_TITLE,
    description: HOME_DESC,
  },
  {
    page: "about", file: "about", slug: "/about", shell: true, crumb: "About",
    title: "About Gregg Costin | Pensacola Military Realtor",
    description: "Retired USAF Captain and E-3 AWACS officer, now a dual-licensed Florida and Alabama Realtor guiding military families through PCS moves and VA loans.",
    heading: "About Gregg Costin",
    intro: "Retired USAF Captain, E-3 AWACS Combat Systems Officer, and prior-enlisted Staff Sergeant with 11 personal PCS moves — now a Florida- and Alabama-licensed Realtor serving military families across the Emerald Coast.",
  },
  {
    page: "contact", file: "contact", slug: "/contact", shell: true, crumb: "Contact",
    title: "Contact Gregg Costin | Pensacola Military Realtor",
    description: "Reach Pensacola military relocation Realtor Gregg Costin. Call or text (850) 266-5005 for PCS, VA loan, and Emerald Coast home guidance.",
    heading: "Contact Gregg Costin",
    intro: "Call or text (850) 266-5005, or send a message about your PCS timeline, VA loan questions, or Gulf Coast home search. Retired USAF Captain and dual-licensed Realtor with Levin Rinke Realty.",
  },
  {
    page: "pcs", file: "pcs-guide", slug: "/pcs-guide", shell: true, crumb: "PCS Guide",
    title: "Moving to Pensacola: Military PCS Guide",
    description: "Moving to Pensacola on military orders? A retired USAF officer's PCS guide — BAH by base, on- and off-base housing, VA loans, schools, and moving timelines.",
    heading: "PCS to Pensacola & the Emerald Coast",
    intro: "Everything a military family needs to plan a PCS to NAS Pensacola, Whiting Field, Corry Station, Hurlburt Field, Eglin AFB, or Duke Field — BAH, on- vs off-base housing, VA loans, schools, and a 60/30/7-day timeline.",
  },
  {
    page: "neighborhoods", file: "communities", slug: "/communities", shell: true, crumb: "Communities",
    title: "Pensacola Military Community Guide by Base",
    description: "Compare Emerald Coast communities for military families by base, commute, BAH fit, and schools: Gulf Breeze, Navarre, Pace, Perdido Key, Niceville and more.",
    heading: "Emerald Coast Communities for Military Families",
    intro: "Neighborhood-by-neighborhood guidance for PCSing families — commute to base, BAH fit, schools, and lifestyle across Escambia, Santa Rosa, and Okaloosa counties.",
  },
  {
    page: "calculator", file: "mortgage-calculators", slug: "/mortgage-calculators", shell: true, crumb: "Calculators",
    title: "Military Mortgage & BAH Calculators | Pensacola",
    description: "Free VA, FHA, and conventional mortgage calculators plus a 2026 BAH tool for Pensacola-area military buyers. Compare payments, funding fees, and terms.",
    heading: "Military Mortgage & BAH Calculators",
    intro: "Estimate your VA, FHA, or conventional payment, compare loan types, model the VA funding fee, and align a home price to your 2026 BAH for the Pensacola (FL064) and Fort Walton Beach (FL023) MHAs.",
  },
  // shell:false — 301'd to static twins; kept only for runtime SPA title on client nav.
  { page: "va-loan", slug: "/va-loans", shell: false, title: "VA Loans for Military Buyers | Pensacola", description: "VA loan guidance for Pensacola-area military buyers: zero down, funding fee, entitlement, and seller concessions." },
  { page: "homestead", slug: "/homestead", shell: false, title: "Florida Homestead for Military Families", description: "How Florida homestead, Save Our Homes, and portability work for active-duty and veteran homeowners." },
  // shell:false — real static twins served at these URLs; kept for runtime SPA title.
  { page: "reviews", slug: "/reviews", shell: false, title: "Client Reviews | Gregg Costin, Pensacola Realtor", description: "Five-star reviews from military families across the Florida Panhandle for Realtor Gregg Costin." },
  { page: "blog", slug: "/blog", shell: false, title: "Military Real Estate Blog | Pensacola", description: "VA loan guidance, BAH breakdowns, and Emerald Coast neighborhood deep dives for military families." },
];

export const META_BY_PAGE = Object.fromEntries(ROUTE_META.map((e) => [e.page, e]));
