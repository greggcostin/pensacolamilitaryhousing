// Civilian neighborhood pages for greggcostin.com (audit 2026-09-02, gc-content-01: the civilian site
// owned zero neighborhood URLs; every hub card deep-linked to a military-framed page). Every figure
// here is taken from the military site's canon-verified community pages, the neighborhoods-by-rank
// post (Zillow Research typical values as of August 1, 2026) and the FLDOE 2026 school grades in
// content/schools/school-grades-2026.json. Fair-housing design: housing stock, prices, commute,
// official school grades, flood and insurance only. No "safe", no demographic language.
// Built by scripts/civilian-neighborhood-factory.mjs. No em dashes anywhere in this file.

export const NEIGHBORHOODS = [
  {
    slug: "east-hill-downtown", name: "East Hill and Downtown Pensacola", short: "East Hill & Downtown",
    title: "East Hill & Downtown Pensacola Homes | The Costin Team",
    desc: "East Hill and downtown Pensacola real estate: Craftsman bungalows, walkable Palafox blocks, 2026 prices, schools and what to inspect. Guide by The Costin Team.",
    keywords: "East Hill Pensacola homes for sale, downtown Pensacola real estate, East Hill bungalows, living in East Hill Pensacola",
    h1: "East Hill and Downtown Pensacola",
    lead: "Craftsman bungalows under live oaks, Bayview Park on the bayou, and the Palafox Street restaurant scene a few minutes away. East Hill is Pensacola's most established historic neighborhood, and the trade for that character is character-home maintenance and blocks that are never cheap.",
    fit: "Walkability, character homes, in-town dining",
    image: "/images/palafox-street.jpg", alt: "Tree-lined brick walkway along Palafox Street in downtown Pensacola",
    pmh: "/communities/east-hill", zip: "32503",
    sections: [
      { h2: "Where it is", p: [
        "East Hill sits immediately north of downtown, roughly bounded by Cervantes Street to the north and Wright Street to the south, with 12th Avenue as its spine. Bayview Park and Bayou Texar mark the eastern edge, and Palafox Street's shops and restaurants are a short bike ride or a five-minute drive to the southwest.",
        "Downtown itself has a growing stock of condos, lofts and townhomes for buyers who want to walk to work and dinner, while East Hill supplies the single-family houses with porches and yards.",
      ] },
      { h2: "Homes and prices", p: [
        "The housing stock is early 20th-century Craftsman bungalows, Victorian cottages and four-squares, with a layer of mid-century ranch homes on the north end. Renovated inventory trades from about $325,000 to $600,000 and beyond depending on renovation status and how close you are to the water and 12th Avenue.",
        "For context, the 32503 ZIP code that includes East Hill carried a Zillow Research typical home value of $299,979 as of August 1, 2026, up 1.5% year over year. That ZIP also takes in plenty of non-East-Hill inventory, so the neighborhood's best blocks sit well above the ZIP average.",
      ] },
      { h2: "Getting around", p: [
        "Downtown is minutes away, Pensacola International Airport is roughly 15 minutes north, and NAS Pensacola is a 10 to 15 minute drive southwest. Most errands can happen on 12th Avenue or Cervantes Street without touching the interstate.",
      ] },
      { h2: "What to inspect on a century-old house", p: [
        "Older East Hill homes reward a careful inspection: roof age and wind mitigation features drive the insurance quote, and knob-and-tube wiring, cast-iron drains and pier foundations show up often enough that we plan the inspection checklist around them. A 4-point inspection is required by most Florida carriers on homes 25 years or older, so budget for it before you write the offer.",
      ] },
    ],
    schools: ["a-k-suter-elementary-school", "o-j-semmes-elementary-school", "j-h-workman-middle-school", "pensacola-high-school"],
    schoolsNote: "Zone assignments in East Hill typically include A.K. Suter Elementary or O.J. Semmes Elementary, J.H. Workman Middle and Pensacola High School, which runs a nationally recognized IB program.",
    flood: "Most of East Hill sits on high ground in Zone X, but the blocks nearest Bayou Texar can fall in Zone AE. The City of Pensacola participates in the NFIP Community Rating System at Class 7, which discounts most flood policies by 15%. Pull the flood determination before you offer, not after.",
    faqs: [
      { q: "What kind of homes are in East Hill?", a: "Early 20th-century Craftsman bungalows, Victorian cottages and four-square homes, plus mid-century ranch houses on the north end. Renovated homes trade from roughly $325,000 to $600,000 and up, depending on condition and proximity to the water and 12th Avenue." },
      { q: "What schools serve East Hill?", a: "Escambia County Public Schools. Zones typically include A.K. Suter Elementary or O.J. Semmes Elementary, J.H. Workman Middle and Pensacola High School. Official 2026 FLDOE grades for each campus are on our school pages; confirm the zoned school for a specific address with the district." },
      { q: "How far is East Hill from downtown and the airport?", a: "Palafox Street is a few minutes away, the airport is about 15 minutes north, and NAS Pensacola is a 10 to 15 minute drive." },
      { q: "Is East Hill expensive?", a: "For Pensacola, yes. The best renovated blocks trade well above the 32503 ZIP average of $299,979 (Zillow Research, August 1, 2026), and inventory is limited because the neighborhood is small and owners tend to stay." },
    ],
  },
  {
    slug: "gulf-breeze", name: "Gulf Breeze and Tiger Point", short: "Gulf Breeze & Tiger Point",
    title: "Gulf Breeze & Tiger Point Homes | The Costin Team",
    desc: "Gulf Breeze and Tiger Point real estate: A-rated Santa Rosa schools, 2026 home values by ZIP, commute across the bridge, flood and insurance. The Costin Team.",
    keywords: "Gulf Breeze homes for sale, Tiger Point real estate, living in Gulf Breeze FL, Gulf Breeze schools",
    h1: "Gulf Breeze and Tiger Point",
    lead: "The school-district move. Gulf Breeze proper is one bridge from downtown Pensacola and one from the beach, with three campuses that all carry Florida A grades. Expect premium pricing in the proper and better value out toward Midway and Tiger Point.",
    fit: "Schools, peninsula living, beach access",
    image: "/images/bay-bridge.jpg", alt: "Pensacola Bay Bridge crossing toward Gulf Breeze",
    pmh: "/communities/gulf-breeze", zip: "32561",
    sections: [
      { h2: "Where it is", p: [
        "Gulf Breeze occupies the Fairpoint Peninsula between Pensacola Bay and Santa Rosa Sound. Gulf Breeze proper (ZIP 32561) is the incorporated city at the foot of the Pensacola Bay Bridge; Midway and Tiger Point (ZIP 32563) run east along US-98 toward Navarre. Pensacola Beach is across the Bob Sikes Bridge on Santa Rosa Island.",
      ] },
      { h2: "Homes and prices", p: [
        "Gulf Breeze proper carried a Zillow Research typical home value of $691,087 as of August 1, 2026, down 1.3% year over year, with 78 median days on market and 17.6% of listings taking a price cut. The Midway and Tiger Point side (32563) sat at $407,122, which is where most families find a four-bedroom under $500,000.",
        "The housing stock ranges from 1960s and 1970s ranch homes on the proper's older streets to golf-course subdivisions at Tiger Point and newer construction along the sound.",
      ] },
      { h2: "Getting around", p: [
        "Downtown Pensacola is 10 to 15 minutes across the Pensacola Bay Bridge outside rush hour. NAS Pensacola runs 20 to 30 minutes via the bridge and US-98, and 30 to 40 minutes in the 0630 to 0730 and 1630 to 1730 windows. The Garcon Point Bridge ($2.30 with SunPass, $2.75 toll-by-plate) is the alternate route north to I-10.",
      ] },
      { h2: "Insurance is the second budget line", p: [
        "Flood zone decides more of the monthly payment than most buyers expect. Homes in Zone X typically run $400 to $700 a year for flood coverage, Zone AE runs $1,500 to $3,500, and coastal Zone VE can exceed $5,000. We pull the flood quote before the offer on every peninsula showing.",
      ] },
    ],
    schools: ["gulf-breeze-elementary-school", "gulf-breeze-middle-school", "gulf-breeze-high-school", "oriole-beach-elementary-school", "woodlawn-beach-middle-school"],
    schoolsNote: "Gulf Breeze Elementary, Gulf Breeze Middle and Gulf Breeze High all hold Florida A grades for 2026, and the Santa Rosa County district honors the Interstate Compact for military-connected students. Oriole Beach Elementary and Woodlawn Beach Middle serve parts of the peninsula east of the proper.",
    flood: "The peninsula mixes Zone X high ground with AE and VE waterfront. Santa Rosa County's CRS participation discounts NFIP policies, but the zone letter on the specific parcel is what sets the premium.",
    faqs: [
      { q: "What are homes worth in Gulf Breeze in 2026?", a: "Zillow Research put the typical Gulf Breeze proper (32561) home at $691,087 as of August 1, 2026, down 1.3% year over year. The Midway and Tiger Point side (32563) was $407,122." },
      { q: "How long is the commute from Gulf Breeze to downtown Pensacola?", a: "About 10 to 15 minutes across the Pensacola Bay Bridge outside of rush hour, and 20 to 30 minutes on to NAS Pensacola." },
      { q: "Are Gulf Breeze schools A-rated?", a: "Yes. Gulf Breeze Elementary, Gulf Breeze Middle and Gulf Breeze High all earned Florida A grades on the 2026 FLDOE report. Confirm the zoned school for a specific address with Santa Rosa County Schools." },
      { q: "How much is flood insurance in Gulf Breeze?", a: "It depends on the zone: roughly $400 to $700 a year in Zone X, $1,500 to $3,500 in Zone AE, and $5,000 or more in coastal Zone VE. We pull the quote before you write an offer." },
    ],
  },
  {
    slug: "pensacola-beach", name: "Pensacola Beach", short: "Pensacola Beach",
    title: "Pensacola Beach Condos & Homes | The Costin Team",
    desc: "Pensacola Beach real estate on Santa Rosa Island: Gulf-front condos, sound-side homes, leasehold land, flood and wind insurance, rental demand. The Costin Team.",
    keywords: "Pensacola Beach condos for sale, Pensacola Beach homes, Santa Rosa Island real estate, Pensacola Beach investment property",
    h1: "Pensacola Beach",
    lead: "Sugar-white sand, a real year-round community behind the tourism, and steady rental demand for investors. Go in clear-eyed on insurance, flood zones and the leasehold land structure; we underwrite those on every beach showing.",
    fit: "Gulf front, vacation energy, rental income",
    image: "/images/pensacola-beach.jpg", alt: "Vintage neon Pensacola Beach sign with a sailfish",
    pmh: "/communities/gulf-breeze", zip: null,
    sections: [
      { h2: "Where it is", p: [
        "Pensacola Beach is the Escambia County section of Santa Rosa Island, reached from Gulf Breeze over the Bob Sikes Bridge. Gulf-front high-rise condos line the south side, sound-side single-family homes and low-rise condos face Santa Rosa Sound, and the core village around the boardwalk and Casino Beach carries the restaurants and events.",
      ] },
      { h2: "Homes and the leasehold", p: [
        "Nearly all property on Pensacola Beach sits on land leased through the Santa Rosa Island Authority rather than owned outright. Lenders and title companies here handle those leases every week, but the lease terms, transfer fees and lease-fee schedule belong in your due diligence, and we review them with you before you write.",
        "Inventory runs from one-bedroom Gulf-view condos to sound-front homes with docks. Condo buyers should read the association budget, reserve study and master insurance policy with the same care as the unit inspection.",
      ] },
      { h2: "Insurance and flood", p: [
        "Beach property carries both wind and flood coverage. On Gulf-front condos the master policy's wind premium flows through as association dues, and on houses the roof age, opening protection and elevation certificate set the quote. Pensacola Beach's floodplain management under the Santa Rosa Island Authority earns NFIP Community Rating System Class 5, which has discounted most NFIP policies by 25% since October 1, 2024.",
      ] },
      { h2: "Rental demand", p: [
        "Short-term rental demand is the reason many buyers look here, and the reason to run the numbers conservatively: association rules, county registration, seasonal occupancy and the insurance line decide whether a unit pencils. We build the pro forma with actual comparable rental history, not the listing brochure.",
      ] },
    ],
    schools: ["gulf-breeze-elementary-school", "gulf-breeze-middle-school", "gulf-breeze-high-school"],
    schoolsNote: "Pensacola Beach families are served by the Santa Rosa County district's Gulf Breeze campuses, all three of which hold Florida A grades for 2026.",
    flood: "Essentially the whole island is in a Special Flood Hazard Area (AE or VE). Flood insurance is mandatory on any federally backed mortgage here, and the elevation certificate is part of every offer package we write.",
    faqs: [
      { q: "Do you own the land under a Pensacola Beach home?", a: "Generally no. Property on Pensacola Beach sits on long-term leases administered by the Santa Rosa Island Authority. The lease terms and fees are part of every purchase review, and local lenders and title companies handle them routinely." },
      { q: "Is flood insurance required on Pensacola Beach?", a: "Yes on any government-backed mortgage, because the island sits in Special Flood Hazard Areas. The Santa Rosa Island Authority's CRS Class 5 rating discounts most NFIP policies by 25%." },
      { q: "Are Pensacola Beach condos good rental investments?", a: "They can be, when the association allows short-term rentals and the insurance and dues are underwritten honestly. We model each unit on actual comparable rental history rather than projections." },
      { q: "What schools serve Pensacola Beach?", a: "Santa Rosa County's Gulf Breeze Elementary, Gulf Breeze Middle and Gulf Breeze High, all A-rated on the 2026 FLDOE report." },
    ],
  },
  {
    slug: "perdido-key", name: "Perdido Key", short: "Perdido Key",
    title: "Perdido Key Condos & Homes | The Costin Team",
    desc: "Perdido Key real estate on the Florida-Alabama line: Gulf-front condos, Old River canal homes, 2026 prices, schools, flood and insurance. The Costin Team.",
    keywords: "Perdido Key condos for sale, Perdido Key homes, Perdido Key real estate, Lost Key homes",
    h1: "Perdido Key",
    lead: "The quieter coast on the Alabama line: condos on the Gulf, canal homes along Old River, and state-park beaches locals guard jealously. Gregg's Alabama license covers the Orange Beach side of the line too.",
    fit: "Waterfront, quiet coast, two-state reach",
    image: "/images/perdido-key.jpg", alt: "White sand dunes and sea oats at a Perdido Key beach access",
    pmh: "/communities/perdido-key", zip: "32507",
    sections: [
      { h2: "Where it is", p: [
        "Perdido Key is a 16-mile barrier island on the Florida-Alabama line west of Pensacola, with Gulf Islands National Seashore and Perdido Key State Park holding long stretches of undeveloped beach. Commutes head east: NAS Pensacola and Corry Station are roughly 20 to 25 minutes via Sorrento Road and Gulf Beach Highway outside rush hour, and downtown Pensacola is about 30 minutes.",
      ] },
      { h2: "Homes and prices", p: [
        "Condos dominate the Gulf-front inventory, with entry-level Gulf-view units trading in the $275,000 to $375,000 range. Single-family homes run along the sound and Old River and in inland communities such as Perdido Key Estates and Lost Key, and they start well above the condo tier.",
        "The 32507 ZIP that includes Perdido Key showed a Zillow Research typical home value of $375,726 as of August 1, 2026, a number that blends beachfront with the mainland Warrington neighborhoods on the same ZIP, so use it as context rather than a price guide.",
      ] },
      { h2: "Insurance, flood and condo dues", p: [
        "Most of the island sits in flood zones AE or VE. Gulf-front condos carry master-policy wind premiums that flow through as association fees of $500 to $1,200 a month, while sound-side and inland single-family homes quote lower. Read the association's budget and reserve study before you fall for the view.",
      ] },
      { h2: "The Alabama side", p: [
        "Orange Beach and Gulf Shores begin a few minutes west, and Gregg is licensed in Alabama and a Baldwin REALTORS member, so a search that starts on Perdido Key can cross the state line without changing agents. See the Gulf Shores and Orange Beach page for that market.",
      ] },
    ],
    schools: ["hellen-caro-elementary-school", "jim-c-bailey-middle-school", "escambia-high-school"],
    schoolsNote: "Perdido Key addresses are typically zoned for Hellen Caro Elementary, Jim C. Bailey Middle and Escambia High School in Escambia County Public Schools.",
    flood: "Barrier-island flood zones AE and VE cover most parcels, so flood insurance is mandatory on federally backed loans and the elevation certificate matters as much as the inspection.",
    faqs: [
      { q: "How much are condos on Perdido Key?", a: "Entry-level Gulf-view condos trade in roughly the $275,000 to $375,000 range, with Gulf-front and larger units above that. Single-family homes on the sound and Old River start well above the condo tier." },
      { q: "How far is Perdido Key from Pensacola?", a: "About 20 to 25 minutes to NAS Pensacola and Corry Station via Sorrento Road and Gulf Beach Highway, and roughly 30 minutes to downtown Pensacola." },
      { q: "What are the flood and insurance costs on Perdido Key?", a: "Most of the island is in flood zones AE or VE. Gulf-front condo wind coverage flows through as association dues of about $500 to $1,200 a month; sound-side and inland homes quote lower. We pull both quotes before you offer." },
      { q: "Can The Costin Team help across the line in Orange Beach?", a: "Yes. Gregg is licensed in Alabama as well as Florida and is a Baldwin REALTORS member, so the same team represents you on either side of the state line." },
    ],
  },
  {
    slug: "midtown-east-pensacola-heights", name: "Midtown and East Pensacola Heights", short: "Midtown & East Pensacola Heights",
    title: "Midtown & East Pensacola Heights Homes | The Costin Team",
    desc: "Midtown and East Pensacola Heights real estate: 1920s bungalows near Bayou Texar, prices below East Hill, schools, commute and inspections. The Costin Team.",
    keywords: "East Pensacola Heights homes for sale, Midtown Pensacola real estate, Bayou Texar homes, Pensacola bungalows",
    h1: "Midtown and East Pensacola Heights",
    lead: "Between downtown and the bayous, anchored by the ever-repainted Graffiti Bridge. Smaller lots and older housing stock, but walkable pockets, water access and prices that East Hill left behind.",
    fit: "Bayou access, 1920s to 1950s bungalows, smaller lots",
    image: "/images/graffiti-bridge.jpg", alt: "Pensacola's Graffiti Bridge at night with light trails",
    pmh: "/communities/east-pensacola-heights", zip: null,
    sections: [
      { h2: "Where it is", p: [
        "East Pensacola Heights is the peninsula east of Bayou Texar, five minutes from downtown across the Cervantes Street bridge. Midtown fills the grid between East Hill and the airport corridor, and the 17th Avenue railroad trestle known as the Graffiti Bridge is the unofficial gateway.",
      ] },
      { h2: "Homes and prices", p: [
        "The stock is mostly 1920s to 1950s bungalows and cottages, with some mid-century ranch homes and a growing number of custom rebuilds. Lots are smaller than suburban subdivisions, but many front the water or walk to Bayou Texar. Entry-level character bungalows trade in roughly the $285,000 to $325,000 band, with waterfront and fully renovated homes well above that.",
      ] },
      { h2: "Getting around", p: [
        "Downtown is a five-minute drive, the airport about ten minutes north, and NAS Pensacola roughly 20 to 25 minutes west via Navy Boulevard, or 25 to 35 minutes at rush hour.",
      ] },
      { h2: "Older-home due diligence", p: [
        "Plan the inspection around the age of the house: roof and wind-mitigation features for the insurance quote, electrical and plumbing for the 4-point report most carriers require past 25 years, and drainage on the bayou-side lots. The right inspector and the right insurance agent are the two calls we make before the offer.",
      ] },
    ],
    schools: ["a-k-suter-elementary-school", "j-h-workman-middle-school", "pensacola-high-school"],
    schoolsNote: "Zone assignments vary by street but typically include A.K. Suter Elementary, J.H. Workman Middle and Pensacola High School.",
    flood: "Streets along Bayou Texar can sit in Zone AE while the interior blocks are Zone X; the City of Pensacola's CRS Class 7 rating discounts most flood policies by 15%.",
    faqs: [
      { q: "What do homes cost in East Pensacola Heights?", a: "Entry-level character bungalows trade in roughly the $285,000 to $325,000 band; waterfront and fully renovated homes run well above that." },
      { q: "How close is East Pensacola Heights to downtown?", a: "About five minutes across the Cervantes Street bridge. The airport is roughly ten minutes and NAS Pensacola 20 to 25 minutes via Navy Boulevard." },
      { q: "What schools serve Midtown and East Pensacola Heights?", a: "Escambia County Public Schools, typically A.K. Suter Elementary, J.H. Workman Middle and Pensacola High School. Confirm the zoned school for a specific address with the district." },
      { q: "What should I inspect on a 1920s bungalow?", a: "Roof age and wind mitigation, electrical and plumbing for the 4-point inspection most carriers require on homes over 25 years old, foundation piers and drainage. We build the inspection list around the age of the house." },
    ],
  },
  {
    slug: "pace-milton", name: "Pace and Milton", short: "Pace & Milton",
    title: "Pace & Milton Homes for Sale Guide | The Costin Team",
    desc: "Pace and Milton real estate in Santa Rosa County: new construction, larger lots, A-rated schools, 2026 values, commute and flood notes. The Costin Team.",
    keywords: "Pace FL homes for sale, Milton FL real estate, Santa Rosa County new construction, living in Pace Florida",
    h1: "Pace and Milton",
    lead: "Santa Rosa County's growth engine: new construction, larger lots and the area's best square footage per dollar. The trade is commute time into Pensacola and infrastructure still catching up to the growth.",
    fit: "Space per dollar, new construction, Santa Rosa schools",
    image: "/images/pace-milton.jpg", alt: "Boardwalk through the pines at Blackwater River State Park near Milton",
    pmh: "/communities/pace", zip: "32570",
    sections: [
      { h2: "Two towns, one school district", p: [
        "Pace is the newer, denser residential community along US-90 with master-planned subdivisions such as Stonebrook and Woodbine. Milton, eight to ten minutes east, is the Santa Rosa County seat with a historic downtown on the Blackwater River and a more rural feel. Both share the Santa Rosa County School District.",
      ] },
      { h2: "Homes and prices", p: [
        "Entry-level Pace homes trade in roughly the $250,000 to $290,000 range, with Stonebrook and Woodbine at $310,000 to $360,000 and larger new builds above that. Milton's ZIP 32570 carried a Zillow Research typical home value of $279,289 as of August 1, 2026, and its historic core mixes 1900s cottages with new subdivisions on the edges.",
      ] },
      { h2: "Getting around", p: [
        "Pace is about 15 minutes from NAS Whiting Field and Milton 10 to 15 minutes via SR-87. Milton to NAS Pensacola runs 30 to 40 minutes depending on route and traffic, and both towns reach I-10 quickly for trips east or into Pensacola.",
      ] },
      { h2: "New construction notes", p: [
        "Builder contracts, incentive-tied lenders and post-close warranty claims are where new-construction buyers need representation most. We read the builder contract before you sign, order an independent inspection at pre-drywall and final, and negotiate the closing-cost incentives against the real rate rather than the advertised one.",
      ] },
    ],
    schools: ["pace-high-school", "thomas-l-sims-middle-school", "s-s-dixon-intermediate-school", "milton-high-school", "hobbs-middle-school"],
    schoolsNote: "Pace High and Thomas L. Sims Middle hold Florida A grades for 2026 and S.S. Dixon Intermediate a B; Milton High holds a B. Santa Rosa County is one of the strongest districts on the Gulf Coast, and zoning depends on the specific address.",
    flood: "Most subdivisions sit on Zone X high ground; parcels along the Blackwater and Escambia rivers and their creeks can be Zone AE. Pull the determination on any lot near water.",
    faqs: [
      { q: "Is Pace or Milton closer to Pensacola?", a: "Pace, by about eight to ten minutes. Milton to NAS Pensacola is 30 to 40 minutes; Pace sits closer to the Escambia County line and to I-10." },
      { q: "What do homes cost in Pace?", a: "Entry-level homes trade around $250,000 to $290,000; Stonebrook and Woodbine run $310,000 to $360,000, with larger new builds above that." },
      { q: "Are Pace schools A-rated?", a: "Pace High and Thomas L. Sims Middle earned Florida A grades on the 2026 FLDOE report; S.S. Dixon Intermediate earned a B. Confirm zoning for a specific address with Santa Rosa County Schools." },
      { q: "What is different about buying new construction?", a: "The builder writes the contract and often ties incentives to its lender. We review the contract, schedule independent inspections at pre-drywall and final, and price the incentives against the real interest rate." },
    ],
  },
  {
    slug: "navarre", name: "Navarre", short: "Navarre",
    title: "Navarre FL Homes for Sale Guide | The Costin Team",
    desc: "Navarre real estate: beach-town living, newer subdivisions north of the sound, A-rated Navarre schools, 2026 prices, insurance and commute. The Costin Team.",
    keywords: "Navarre FL homes for sale, Navarre real estate, living in Navarre Florida, Holley by the Sea homes",
    h1: "Navarre",
    lead: "Florida's worst-kept beach secret: a long white-sand shoreline, a slower pace than Destin, and newer subdivisions north of the sound. Groceries and big-box shopping mean a drive, and locals like it that way.",
    fit: "Beach town, small-town feel, newer subdivisions",
    image: "/images/navarre.jpg", alt: "Sugar-white sand and sea oats on Santa Rosa Island, the barrier island",
    pmh: "/communities/navarre", zip: null,
    sections: [
      { h2: "Where it is", p: [
        "Navarre sits on Santa Rosa Sound between Gulf Breeze and Fort Walton Beach, with Navarre Beach across the bridge on Santa Rosa Island. Hurlburt Field is about 25 minutes east, NAS Pensacola roughly 35 minutes west, and Pensacola or Destin are each a 40 to 50 minute drive for a night out.",
      ] },
      { h2: "Homes and prices", p: [
        "Navarre runs roughly 15 to 25% cheaper per square foot than Gulf Breeze for comparable homes. Entry-level single-family homes start in the mid-to-high $200,000s, Holley by the Sea and the newer subdivisions north of US-98 carry the bulk of the four-bedroom inventory, and sound-front and Navarre Beach properties sit at the top of the market.",
      ] },
      { h2: "Insurance north and south of US-98", p: [
        "North of US-98 insurance is generally manageable: about $400 to $800 a year for flood and $1,800 to $2,500 for wind on a typical home. South of US-98 and on Navarre Beach both lines climb, so we pull the quotes before the offer on every waterfront showing.",
      ] },
      { h2: "Daily life", p: [
        "Navarre is a bedroom community by design: a Publix and a Walmart, a strong youth-sports scene, a county park on the sound, and one of the longest fishing piers on the Gulf. Big-box shopping and most medical specialists mean a drive to Fort Walton Beach or Gulf Breeze.",
      ] },
    ],
    schools: ["navarre-high-school", "west-navarre-intermediate-school", "holley-navarre-middle-school", "holley-navarre-intermediate"],
    schoolsNote: "Navarre High and West Navarre Intermediate hold Florida A grades for 2026; Holley-Navarre Middle and Holley-Navarre Intermediate hold B grades. All are Santa Rosa County schools.",
    flood: "North of US-98 most parcels are Zone X; the sound side and Navarre Beach are AE and VE. The zone letter on the parcel sets the flood premium.",
    faqs: [
      { q: "How much cheaper is Navarre than Gulf Breeze?", a: "Roughly 15 to 25% less per square foot for comparable homes, with entry-level single-family homes starting in the mid-to-high $200,000s." },
      { q: "How far is Navarre from Pensacola and Hurlburt Field?", a: "About 35 minutes to NAS Pensacola and 25 minutes to Hurlburt Field. Downtown Pensacola and Destin are each a 40 to 50 minute drive." },
      { q: "What are Navarre schools rated?", a: "Navarre High and West Navarre Intermediate earned Florida A grades for 2026; Holley-Navarre Middle and Holley-Navarre Intermediate earned B grades. Confirm zoning with Santa Rosa County Schools." },
      { q: "What does insurance cost in Navarre?", a: "North of US-98, roughly $400 to $800 a year for flood and $1,800 to $2,500 for wind on a typical home. South of US-98 and on Navarre Beach, both lines climb significantly." },
    ],
  },
  {
    slug: "cordova-park-northeast", name: "Cordova Park and Northeast Pensacola", short: "Cordova Park & Northeast",
    title: "Cordova Park & Northeast Pensacola Homes | The Costin Team",
    desc: "Cordova Park and Northeast Pensacola homes: mid-century brick houses on large lots, 2026 prices, schools, ten minutes to airport and hospitals. The Costin Team.",
    keywords: "Cordova Park homes for sale, Northeast Pensacola real estate, Cordova Park Pensacola, mid-century homes Pensacola",
    h1: "Cordova Park and Northeast Pensacola",
    lead: "Pensacola's established mid-century neighborhoods: mature trees, larger single-story homes, and ten minutes to everything, including the airport and both hospitals. Inventory is tight because nobody wants to leave.",
    fit: "Established, convenient, mid-century character",
    image: "/images/cordova-park.jpg", alt: "Live oaks draped in Spanish moss arching over a quiet Cordova Park street",
    pmh: "/communities/cordova-park", zip: null,
    sections: [
      { h2: "Where it is", p: [
        "Cordova Park is bounded roughly by 9th Avenue to the west, I-110 to the east, Airport Boulevard to the north and Bayou Boulevard to the south, with Cordova Mall anchoring the south end. The Northeast neighborhoods continue north past the airport toward Scenic Highway and Olive Road.",
      ] },
      { h2: "Homes and prices", p: [
        "The stock is predominantly 1950s and 1960s ranch and brick homes on lots larger than the historic downtown neighborhoods, and updated or renovated inventory is common. Prices typically run $325,000 to $550,000, with some higher-end renovations and bayou-front homes above that.",
      ] },
      { h2: "Getting around", p: [
        "Pensacola International Airport, Baptist Hospital and Ascension Sacred Heart are each about ten minutes away, Cordova Mall and the 9th Avenue corridor handle daily errands, and downtown is 10 to 15 minutes south. I-110 gets you to I-10 in a few minutes.",
      ] },
      { h2: "Why inventory stays tight", p: [
        "Cordova Park homes come up rarely and sell fast because the combination of lot size, single-story layouts and an in-neighborhood elementary school is hard to find elsewhere in the city. Buyers here benefit from a pre-approval in hand and an agent who watches the coming-soon pipeline.",
      ] },
    ],
    schools: ["cordova-park-elementary-school", "j-h-workman-middle-school", "washington-senior-high-school", "scenic-heights-elementary-school"],
    schoolsNote: "Zones commonly include Cordova Park Elementary, J.H. Workman Middle and Washington High School; Scenic Heights Elementary (an A for 2026) serves parts of the Northeast side.",
    flood: "Most of Cordova Park is Zone X. Lots along Bayou Texar and the creeks feeding it can be Zone AE, and the city's CRS Class 7 rating discounts those flood policies by 15%.",
    faqs: [
      { q: "What kind of homes are in Cordova Park?", a: "Mid-century ranch and brick homes from the 1950s and 1960s on larger lots, many renovated. Prices typically run $325,000 to $550,000." },
      { q: "How close is Cordova Park to the airport and hospitals?", a: "About ten minutes to Pensacola International Airport, Baptist Hospital and Ascension Sacred Heart, and 10 to 15 minutes to downtown." },
      { q: "What schools serve Cordova Park?", a: "Escambia County Public Schools, commonly Cordova Park Elementary, J.H. Workman Middle and Washington High School. Confirm zoning for a specific address with the district." },
      { q: "Why is inventory so limited in Cordova Park?", a: "Owners stay. Large lots, single-story layouts and an in-neighborhood elementary school keep turnover low, so homes often sell within days of listing." },
    ],
  },
  {
    slug: "beulah", name: "Beulah", short: "Beulah",
    title: "Beulah FL Homes for Sale Guide | The Costin Team",
    desc: "Beulah real estate, northwest Escambia County: 2010 to 2024 construction, Beulah Middle A grade, Navy Federal minutes away, 2026 prices. The Costin Team.",
    keywords: "Beulah FL homes for sale, Beulah Pensacola real estate, Nature Trail Pensacola, homes near Navy Federal Pensacola",
    h1: "Beulah",
    lead: "West Escambia's growth corridor: newer subdivisions with elbow room, quick I-10 access toward downtown or the Alabama line, and prices the coast cannot touch. The trade: you drive for almost everything, and the growth is still outrunning the roads.",
    fit: "Acreage feel, new construction, I-10 access",
    image: "/images/beulah.jpg", alt: "Longleaf pine flatwoods with a sandy road in northwest Escambia County",
    pmh: "/communities/beulah", zip: null,
    sections: [
      { h2: "Where it is", p: [
        "Beulah is the unincorporated community in northwest Escambia County around Nine Mile Road and Beulah Road, just south of I-10. Navy Federal Credit Union's Pensacola Operations Campus on Nine Mile Road, the largest single employer in northwest Pensacola, is a five to ten minute drive from most Beulah subdivisions.",
      ] },
      { h2: "Homes and prices", p: [
        "Most homes were built between 2010 and 2024 in sidewalk subdivisions such as Nature Trail and Bentley Oaks. Entry-level Beulah homes trade in roughly the $290,000 to $340,000 range, and the newer construction runs $325,000 to $450,000. Larger lots and a few acreage parcels remain on the edges.",
      ] },
      { h2: "Getting around", p: [
        "NAS Pensacola and Corry Station are 18 to 22 minutes south. I-10 is minutes away for downtown, the airport or the Alabama line, and the Nine Mile Road corridor carries the grocery, pharmacy and restaurant errands. Almost everything else is a drive, which is the price of the elbow room.",
      ] },
      { h2: "New subdivision due diligence", p: [
        "Beulah's growth means HOA documents, builder warranties and drainage plans matter. We read the covenants, check the county's road and school capacity plans, and order independent inspections on new builds rather than relying on the builder's walkthrough.",
      ] },
    ],
    schools: ["beulah-elementary-school", "beulah-middle-school", "beulah-academy-of-science", "j-m-tate-senior-high-school"],
    schoolsNote: "Beulah Elementary holds a B for 2026, Beulah Middle School (opened 2018) earned an A after a B in 2025, and Beulah Academy of Science, a charter option, holds an A. High school zoning typically runs to J.M. Tate, an A.",
    flood: "Mostly Zone X high ground; parcels along Elevenmile Creek and its tributaries can fall in Zone AE.",
    faqs: [
      { q: "What do homes cost in Beulah?", a: "Entry-level homes trade around $290,000 to $340,000; newer construction in Nature Trail and Bentley Oaks runs roughly $325,000 to $450,000." },
      { q: "How far is Beulah from Navy Federal and downtown?", a: "Five to ten minutes to Navy Federal's Nine Mile Road campus, 18 to 22 minutes to NAS Pensacola and Corry Station, and about 20 minutes to downtown via I-10 and I-110." },
      { q: "What are Beulah schools rated?", a: "On the 2026 FLDOE report Beulah Elementary earned a B, Beulah Middle an A, and Beulah Academy of Science an A. J.M. Tate High, the typical high school zone, earned an A." },
      { q: "Is Beulah new construction or resale?", a: "Mostly newer: the bulk of the housing stock was built between 2010 and 2024, with active new-build phases and a smaller set of older homes and acreage parcels on the edges." },
    ],
  },
  {
    slug: "cantonment", name: "Cantonment", short: "Cantonment",
    title: "Cantonment FL Homes for Sale Guide | The Costin Team",
    desc: "Cantonment real estate on the north corridor: new builds and established neighborhoods on Highway 29, Tate High School, 2026 values, commute. The Costin Team.",
    keywords: "Cantonment FL homes for sale, Cantonment real estate, living in Cantonment Florida, Tate High School homes",
    h1: "Cantonment",
    lead: "The north-corridor standby: established neighborhoods and new builds along Highway 29, the Tate High School draw, and a straightforward run down to downtown Pensacola. Working-roots heritage, family prices.",
    fit: "Established, Tate schools, north corridor",
    image: "/images/cantonment.jpg", alt: "Two-story teal Florida home with palm trees on a residential street",
    pmh: "/communities/cantonment", zip: "32533",
    sections: [
      { h2: "Where it is", p: [
        "Cantonment runs along US-29 north of Pensacola between the Beulah corridor and the Escambia River, with Molino to the north. It is unincorporated Escambia County, so services and zoning are county-run, and the growth story is the newer subdivisions filling in between established 1970s and 1980s neighborhoods.",
      ] },
      { h2: "Homes and prices", p: [
        "Entry-level Cantonment homes trade in roughly the $230,000 to $270,000 range, and the newer construction inventory runs $275,000 to $340,000 in subdivisions such as Nature Trail and Jacks Branch. The 32533 ZIP carried a Zillow Research typical home value of $328,644 as of August 1, 2026.",
      ] },
      { h2: "Getting around", p: [
        "Downtown Pensacola is 20 to 25 minutes south via US-29 and I-110, NAS Pensacola about the same, and I-10 sits at the south end of the corridor. The Nine Mile Road and US-29 intersection carries most of the shopping.",
      ] },
      { h2: "Buying on the north corridor", p: [
        "Cantonment mixes lot sizes, septic and sewer, and school zones street by street, so the parcel record matters more here than in a master-planned subdivision. We verify utilities, the zoned schools and any flood determination before the offer, and we walk new-build phases with an independent inspector.",
      ] },
    ],
    schools: ["ransom-middle-school", "kingsfield-elementary-school", "j-m-tate-senior-high-school", "jim-allen-elementary-school"],
    schoolsNote: "Ransom Middle holds a Florida A grade for 2026 and J.M. Tate High an A; Kingsfield Elementary and Jim Allen Elementary hold B grades. Zoning varies street by street across Cantonment.",
    flood: "The corridor is largely Zone X, with Zone AE along the Escambia River bottoms and the creeks that drain to it.",
    faqs: [
      { q: "What do homes cost in Cantonment?", a: "Entry-level homes trade around $230,000 to $270,000 and newer construction $275,000 to $340,000. Zillow Research put the 32533 typical home value at $328,644 as of August 1, 2026." },
      { q: "How far is Cantonment from downtown Pensacola?", a: "About 20 to 25 minutes via US-29 and I-110, and a similar drive to NAS Pensacola. I-10 sits at the south end of the corridor." },
      { q: "What schools serve Cantonment?", a: "Escambia County Public Schools. Ransom Middle and J.M. Tate High earned A grades for 2026; Kingsfield and Jim Allen Elementary earned B grades. Zoning varies by street, so confirm the assigned school for any specific address." },
      { q: "Cantonment or Beulah?", a: "Beulah if newer construction and a slightly shorter NAS Pensacola commute matter and the extra $40,000 to $60,000 fits. Cantonment if budget leads or you prefer established neighborhoods with larger lots." },
    ],
  },
  {
    slug: "fort-walton-beach", name: "Fort Walton Beach", short: "Fort Walton Beach",
    title: "Fort Walton Beach Homes for Sale Guide | The Costin Team",
    desc: "Fort Walton Beach real estate: neighborhoods on Santa Rosa Sound and Choctawhatchee Bay, Okaloosa Island beaches, schools, 2026 prices. The Costin Team.",
    keywords: "Fort Walton Beach homes for sale, Fort Walton Beach real estate, Okaloosa Island condos, living in Fort Walton Beach",
    h1: "Fort Walton Beach",
    lead: "Okaloosa's hub between Santa Rosa Sound and Choctawhatchee Bay: established neighborhoods with waterfront pockets, one bridge from Okaloosa Island's beaches, and steadier prices than glitzier Destin next door.",
    fit: "Sound and bay, established, Okaloosa hub",
    image: "/images/fort-walton.jpg", alt: "The Brooks Bridge crossing Santa Rosa Sound at Fort Walton Beach",
    pmh: "/communities/fort-walton-beach", zip: null,
    sections: [
      { h2: "Where it is", p: [
        "Fort Walton Beach is the largest city in Okaloosa County, sitting on Santa Rosa Sound with Choctawhatchee Bay to the east and Okaloosa Island's Gulf beaches across the Brooks Bridge. Shalimar, on the bayou to the north, functions as part of the same market. Eglin AFB's West Gate is 5 to 15 minutes and Hurlburt Field 10 to 15 minutes via US-98.",
      ] },
      { h2: "Homes and prices", p: [
        "Fort Walton Beach offers a genuine mix of price points, from three-bedroom inventory in the mid-$200,000s to established waterfront homes over $800,000, which makes it one of the most flexible markets on the Emerald Coast. Okaloosa Island adds Gulf-front and sound-front condos for second-home and rental buyers.",
      ] },
      { h2: "Getting around", p: [
        "Downtown Fort Walton Beach, the hospital and the big-box corridor on Beal Parkway are all inside the city, Destin is 15 to 20 minutes east, and Destin-Fort Walton Beach Airport sits on the Eglin reservation about 20 minutes north.",
      ] },
      { h2: "Insurance and flood", p: [
        "Waterfront pockets along the sound and Cinco Bayou carry Zone AE and VE premiums, while the interior neighborhoods sit in Zone X. As everywhere on this coast, roof age and wind mitigation drive the homeowners quote, so we pull both quotes before you write.",
      ] },
    ],
    schools: [],
    schoolsNote: "Okaloosa County Schools serve Fort Walton Beach and Shalimar. Fort Walton Beach High School and Choctawhatchee High School are the comprehensive high schools, and Choctawhatchee carries strong IB and AP pathways. Our school report pages currently cover Escambia and Santa Rosa counties; see the Okaloosa district site for grades.",
    flood: "Sound-front, bay-front and bayou lots are Zone AE or VE; most interior neighborhoods are Zone X. Flood insurance is mandatory on federally backed loans inside the Special Flood Hazard Area.",
    faqs: [
      { q: "What do homes cost in Fort Walton Beach?", a: "From three-bedroom inventory in the mid-$200,000s to established waterfront homes over $800,000, with Okaloosa Island condos for second-home and rental buyers." },
      { q: "How close is Fort Walton Beach to Eglin and Hurlburt?", a: "The Eglin West Gate is 5 to 15 minutes from most neighborhoods via Eglin Boulevard and SR-189, and Hurlburt Field is 10 to 15 minutes via US-98." },
      { q: "What schools serve Fort Walton Beach?", a: "Okaloosa County Schools. Fort Walton Beach High and Choctawhatchee High (in Shalimar) are the comprehensive high schools; Choctawhatchee offers IB and AP pathways. Check the district for grades and zoning." },
      { q: "Fort Walton Beach or Destin?", a: "Fort Walton Beach wins on price stability, established neighborhoods and the commute to Eglin and Hurlburt. Destin wins on Gulf-front resort inventory and rental demand, at higher prices and higher insurance." },
    ],
  },
];
