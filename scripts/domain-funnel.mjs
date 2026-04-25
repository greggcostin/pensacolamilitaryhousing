// Master domain map for the 40-domain 301 funnel into pensacolamilitaryhousing.com.
//
// All 40 owned short domains map to the most semantically-relevant canonical
// target on pensacolamilitaryhousing.com. Each redirect goes DIRECTLY to its
// final URL (no intermediate hops / chains) for clean PageRank consolidation.
//
// Used by:
//   - scripts/cloudflare-setup-redirects.mjs to configure Cloudflare Page Rules
//   - scripts/integrate-domains.mjs to update sameAs schema arrays site-wide
//   - llms.txt and llms-full.txt entity-disambiguation sections

export const CANONICAL = "https://pensacolamilitaryhousing.com";

export const DOMAIN_MAP = [
  // ── Brand / Personal — funnel to homepage (entity hub) ──
  ["costinteam.com",                       "/"],
  ["costinteamrealtors.com",               "/"],
  ["thecostinteam.com",                    "/"],
  ["thegreggcostinteam.com",               "/"],
  ["greggcostin.com",                      "/"],
  ["greggcostin.net",                      "/"],
  ["greggcostinrealtor.com",               "/"],

  // ── Topical / Pensacola broad authority — homepage funnel ──
  ["pensacolamilitary.com",                "/"],
  ["pensacolamilitaryexpert.com",          "/"],
  ["panhandlemilitary.com",                "/"],

  // ── Topical / exact-keyword → matching content page (HIGH SEO VALUE) ──
  ["pensacolabah.com",                     "/bah-rates.html"],
  ["pensacolavaloan.com",                  "/va-loan-guide"],
  ["pensacolapcsguide.com",                "/pcs-checklist.html"],
  ["pensacolapcsexpert.com",               "/pcs-checklist.html"],
  ["pensacolapcsagent.com",                "/pcs-checklist.html"],
  ["pensacolamilitaryguide.com",           "/pcs-checklist.html"],

  // ── Base-specific (10 short domains → 7 base pages) ──
  ["naspensacolamilitaryhousing.com",      "/bases/nas-pensacola"],
  ["corrystationmilitaryhousing.com",      "/bases/corry-station"],
  ["saufleyfieldmilitaryhousing.com",      "/bases/saufley-field"],
  ["whitingfieldmilitaryhousing.com",      "/bases/whiting-field"],
  ["naswhitingfieldmilitaryhousing.com",   "/bases/whiting-field"],
  ["hurlburtmilitaryhousing.com",          "/bases/hurlburt-field"],
  ["hurlburtfieldmilitaryhousing.com",     "/bases/hurlburt-field"],
  ["eglinmilitaryhousing.com",             "/bases/eglin-afb"],
  ["eglinafbmilitaryhousing.com",          "/bases/eglin-afb"],
  ["dukefieldmilitaryhousing.com",         "/bases/duke-field"],

  // ── Community-specific (13 → community pages, sub-communities folded into nearest hub) ──
  ["gulfbreezemilitaryhousing.com",        "/communities/gulf-breeze"],
  ["navarremilitaryhousing.com",           "/communities/navarre"],
  ["pacemilitaryhousing.com",              "/communities/pace"],
  ["miltonmilitaryhousing.com",            "/communities/milton"],
  ["nicevillemilitaryhousing.com",         "/communities/niceville"],
  ["valparaisomilitaryhousing.com",        "/communities/niceville"],            // Valparaiso = Niceville cluster
  ["fortwaltonbeachmilitaryhousing.com",   "/communities/fort-walton-beach"],
  ["fwbmilitaryhousing.com",               "/communities/fort-walton-beach"],
  ["maryesthermilitaryhousing.com",        "/communities/fort-walton-beach"],    // Mary Esther adjacent to FWB
  ["shalimarmilitaryhousing.com",          "/communities/fort-walton-beach"],    // Shalimar adjacent to FWB
  ["destinmilitaryhousing.com",            "/communities/destin"],
  ["crestviewmilitaryhousing.com",         "/communities/crestview"],
  ["perdidokeymilitaryhousing.com",        "/communities/perdido-key"],

  // ── Alabama Gulf Coast (no FL community page; Perdido Key is closest neighbor) ──
  ["gulfshoresmilitaryhousing.com",        "/communities/perdido-key"],
  ["orangebeachmilitaryhousing.com",       "/communities/perdido-key"],
];

export const ALL_OWNED_DOMAINS = ["pensacolamilitaryhousing.com", ...DOMAIN_MAP.map(([d]) => d)];

// Full https:// URLs for sameAs JSON-LD arrays (entity-graph SEO)
export const SAMEAS_DOMAIN_URLS = DOMAIN_MAP.map(([d]) => `https://${d}`);

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, "/")}`) {
  console.log(`Total owned domains: ${ALL_OWNED_DOMAINS.length}`);
  console.log(`Redirect rules to configure: ${DOMAIN_MAP.length}`);
  const targets = {};
  for (const [d, t] of DOMAIN_MAP) {
    targets[t] = (targets[t] || 0) + 1;
  }
  console.log("\nTarget distribution:");
  for (const [t, n] of Object.entries(targets).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${n.toString().padStart(2)}  ${t}`);
  }
}
