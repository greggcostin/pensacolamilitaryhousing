// The 19 community guide links with one-line blurbs and their base group. Plain ESM data:
// imported by src/App.jsx (NeighborhoodsPage, base pages) AND scripts/postbuild-spa-routes.mjs,
// so the crawler-visible /communities shell lists exactly what React renders (audit idx-04).
// Add a community here when scripts/page-factory.mjs creates its public/communities/<slug>.html.
export const COMMUNITY_GROUPS = ["NAS Pensacola, Corry Station & Saufley Field","NAS Whiting Field","Eglin AFB, Hurlburt Field & Duke Field"];
export const COMMUNITY_LINKS = [
  { label: "Gulf Breeze", href: "/communities/gulf-breeze", base: "NAS Pensacola, Corry Station & Saufley Field", blurb: "The #1 family choice for NAS Pensacola. A-rated Santa Rosa schools, 15-min commute, premium pricing." },
  { label: "Navarre", href: "/communities/navarre", base: "Eglin AFB, Hurlburt Field & Duke Field", blurb: "Santa Rosa County beach community between Hurlburt Field and NAS Pensacola. 15-25% cheaper per square foot than Gulf Breeze." },
  { label: "Pace", href: "/communities/pace", base: "NAS Whiting Field", blurb: "New construction, A-rated schools, best BAH-per-square-foot value in the Pensacola MHA." },
  { label: "Milton", href: "/communities/milton", base: "NAS Whiting Field", blurb: "Santa Rosa County seat. Historic downtown, 10 minutes to NAS Whiting Field, lowest BAH-supported entry point." },
  { label: "Cantonment", href: "/communities/cantonment", base: "NAS Pensacola, Corry Station & Saufley Field", blurb: "North Escambia County. Larger lots, new construction, 20-25 minutes to NAS Pensacola." },
  { label: "Beulah", href: "/communities/beulah", base: "NAS Pensacola, Corry Station & Saufley Field", blurb: "Northwest Escambia. A-rated Beulah schools, 18-22 min to NAS Pensacola, Navy Federal HQ adjacent. Newer construction at $310K-$425K." },
  { label: "Perdido Key", href: "/communities/perdido-key", base: "NAS Pensacola, Corry Station & Saufley Field", blurb: "Gulf-front barrier island. About 20-25 minutes to NAS Pensacola, beach lifestyle, strong rental investment play." },
  { label: "East Pensacola Heights", href: "/communities/east-pensacola-heights", base: "NAS Pensacola, Corry Station & Saufley Field", blurb: "Historic walkable peninsula minutes from downtown, about 20-25 to NAS Pensacola. Character bungalows on Bayou Texar." },
  { label: "East Hill", href: "/communities/east-hill", base: "NAS Pensacola, Corry Station & Saufley Field", blurb: "Historic Craftsman neighborhood, walkable 12th Avenue dining, 10-15 min to NAS Pensacola." },
  { label: "Cordova Park", href: "/communities/cordova-park", base: "NAS Pensacola, Corry Station & Saufley Field", blurb: "Established mid-century neighborhood near Cordova Mall. Solid Escambia schools, central Pensacola." },
  { label: "Ferry Pass", href: "/communities/ferry-pass", base: "NAS Pensacola, Corry Station & Saufley Field", blurb: "North Pensacola suburban neighborhoods. Mid-century and 1990s-2000s homes, 20-30 min commute, E-4 friendly pricing." },
  { label: "Bellview/Myrtle Grove", href: "/communities/bellview-myrtle-grove", base: "NAS Pensacola, Corry Station & Saufley Field", blurb: "West Pensacola neighborhoods in unincorporated Escambia County. 10-15 min to NAS Pensacola. Strongest E-3 to E-5 starter-home market." },
  { label: "Navy Point/Warrington", href: "/communities/navy-point-warrington", base: "NAS Pensacola, Corry Station & Saufley Field", blurb: "5 minutes from the NAS Pensacola main gate. Closest off-base housing in the MHA. Historic ties, most affordable entry." },
  { label: "Niceville/Valparaiso/Bluewater Bay", href: "/communities/niceville", base: "Eglin AFB, Hurlburt Field & Duke Field", blurb: "Eglin AFB East Gate housing. A-rated Niceville High zone, master-planned Bluewater Bay, 10-minute commute for 33rd FW and 96th TW families." },
  { label: "Fort Walton Beach", href: "/communities/fort-walton-beach", base: "Eglin AFB, Hurlburt Field & Duke Field", blurb: "Adjacent to the Eglin AFB West Gate. 5-15 minute commute, Okaloosa schools, broad mix of price points for E-4 to O-5 families." },
  { label: "Mary Esther", href: "/communities/mary-esther", base: "Eglin AFB, Hurlburt Field & Duke Field", blurb: "Hurlburt Field's front-door town on Santa Rosa Sound. About 10 minutes to the main gate, higher FL023 BAH, medians in the mid-$300Ks." },
  { label: "Shalimar", href: "/communities/shalimar", base: "Eglin AFB, Hurlburt Field & Duke Field", blurb: "Small bayou-front town platted for Eglin officers in the 1940s. About 2 miles from Eglin's West Gate, Choctawhatchee High zone." },
  { label: "Destin", href: "/communities/destin", base: "Eglin AFB, Hurlburt Field & Duke Field", blurb: "Gulf-front Okaloosa resort city. Premium beach and condo market, 20 min to Eglin, about 25 min to Hurlburt. Strong military investment-rental play." },
  { label: "Crestview", href: "/communities/crestview", base: "Eglin AFB, Hurlburt Field & Duke Field", blurb: "Okaloosa County budget play for Eglin AFB and Duke Field. New construction, strongest FL023 BAH-to-price ratio." },
];
