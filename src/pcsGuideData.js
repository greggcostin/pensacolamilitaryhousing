// PCS Guide content data (audit 2026-09-02, geo-01 / idx-04). Plain ESM, no JSX: imported by
// src/App.jsx for the live /pcs-guide page AND by scripts/postbuild-spa-routes.mjs to render
// the same tables, checklist, benefits and FAQs into the prerendered shell that AI crawlers
// and no-JavaScript agents read. Edit here, never in two places.
// Standing rule: no em dashes anywhere in this file.

export const INSTALLATIONS_HEADERS = ["Installation", "Branch", "Primary Mission", "Nearest Neighborhoods"];
export const INSTALLATIONS = [
  [
    "NAS Pensacola",
    "Navy/Marines/Air Force",
    "Aviation training (NFO + USAF CSO schoolhouse), NATTC, Blue Angels",
    "East Pensacola Heights, Gulf Breeze, Perdido Key"
  ],
  [
    "Corry Station",
    "Navy",
    "Information Warfare, cryptology, cyber, intel, IT training (CIWT)",
    "Pensacola proper, West Pensacola, Cantonment"
  ],
  [
    "Saufley Field",
    "Navy",
    "NETPDC, Navy Advancement Center, NOSC Pensacola (tenant of NAS Pensacola)",
    "Bellview/Myrtle Grove, Cantonment, Ferry Pass"
  ],
  [
    "NAS Whiting Field",
    "Navy/Marines/Coast Guard",
    "Primary fixed-wing (T-6B) + all USN/USMC/USCG rotary-wing training (TRAWING 5)",
    "Milton, Pace, East Milton"
  ],
  [
    "Hurlburt Field",
    "Air Force",
    "AFSOC, 1st SOW (AC-130, MC-130, CV-22)",
    "Mary Esther, Navarre, FWB"
  ],
  [
    "Eglin AFB",
    "Air Force/Army",
    "33rd FW (F-35A FTU), 96th TW, 53rd Wing, AFRL, 7th SFG",
    "Niceville, Crestview, FWB, Valparaiso, Bluewater Bay"
  ],
  [
    "Duke Field",
    "Air Force Reserve",
    "919th Special Operations Wing (C-146A at Duke; AC-130J/MQ-9 at Hurlburt)",
    "Crestview, Laurel Hill, Niceville"
  ]
];

export const NEIGHBORHOOD_HEADERS = ["Neighborhood", "Median Price", "Commute to NAS", "Schools", "Lifestyle"];
export const NEIGHBORHOOD_ROWS = [
  [
    "Gulf Breeze",
    "$380-450K",
    "15-20 min",
    "A-rated (SRSD)",
    "Waterfront, family-friendly, quiet"
  ],
  [
    "Pace",
    "$280-350K",
    "30-35 min",
    "Strong (SRSD)",
    "Suburban, new construction, affordable"
  ],
  [
    "East Pensacola",
    "$240-320K",
    "10-15 min",
    "Mixed (ECSD)",
    "Close to base, older homes, value"
  ],
  [
    "Perdido Key",
    "$450-700K+",
    "20-25 min",
    "A-rated",
    "Beach, investment potential, luxury"
  ],
  [
    "Cantonment",
    "$250-330K",
    "20-25 min",
    "Good (ECSD)",
    "Rural feel, acreage available"
  ],
  [
    "Navarre",
    "$350-450K",
    "40-50 min to NAS",
    "A-rated (SRSD)",
    "Beach community, Hurlburt/Eglin close"
  ],
  [
    "Milton",
    "$260-340K",
    "25-30 min",
    "Good (SRSD)",
    "Small town, Whiting Field close"
  ],
  [
    "Pensacola Downtown",
    "$350-600K+",
    "5-10 min",
    "Varies",
    "Walkable, historic, restaurants"
  ]
];

export const PCS_CHECKLIST = [
  {
    "label": "90 Days Out",
    "items": [
      "Connect with a military relocation Realtor (call 850-266-5005)",
      "Get pre-approved with a VA-experienced lender",
      "Identify your must-haves vs nice-to-haves for housing",
      "Research school districts if you have children",
      "Start virtual home tours and neighborhood research"
    ]
  },
  {
    "label": "60 Days Out",
    "items": [
      "Narrow to 2-3 target neighborhoods",
      "Set up automated MLS alerts for new listings in your criteria",
      "Begin making offers on strong candidates (sight-unseen if necessary)",
      "Coordinate with your current base housing office on move-out timeline"
    ]
  },
  {
    "label": "30 Days Out",
    "items": [
      "Finalize under-contract property and complete inspections",
      "Order VA appraisal",
      "Coordinate closing date with your report date",
      "Arrange temporary housing if needed (I maintain a list of military-friendly short-term rentals)",
      "File for Florida homestead exemption after closing"
    ]
  }
];

export const FL_BENEFITS = [
  {
    "title": "No state income tax.",
    "text": "Your military pay and any additional income are not subject to state income tax in Florida."
  },
  {
    "title": "Homestead exemption.",
    "text": "Up to $50,000 off your assessed value for property tax purposes, plus additional military exemptions for disabled veterans."
  },
  {
    "title": "Save Our Homes portability.",
    "text": "If you PCS within Florida, you can transfer your accrued Save Our Homes benefit to a new property."
  },
  {
    "title": "Vehicle registration.",
    "text": "Active duty military stationed in Florida can register vehicles with reduced fees."
  },
  {
    "title": "In-state tuition.",
    "text": "Military families qualify for in-state tuition at Florida's public universities and colleges."
  }
];

export const PCS_FAQS = [
  {
    "q": "How far in advance should I start working with a Realtor before my PCS?",
    "a": "Ideally 90 days out, but I've helped families close in as few as 21 days when the timeline demands it. The earlier you start, the more options you have, but late starters are welcome. I'll make it work."
  },
  {
    "q": "Can I buy a home sight-unseen during a PCS?",
    "a": "Yes, and it's more common than you'd think. I provide detailed video walkthroughs, drone footage, and neighborhood context via video call. I've closed dozens of sight-unseen purchases for PCSing families. The key is having an agent you trust to be your eyes and ears."
  },
  {
    "q": "What's the average commute from Gulf Breeze to NAS Pensacola?",
    "a": "15-20 minutes via the Pensacola Bay Bridge (3-Mile Bridge). During morning rush it can push toward 25 minutes, but it's a scenic drive and the school quality in Gulf Breeze (Santa Rosa School District) makes it worth it for most families."
  },
  {
    "q": "Is BAH enough to cover a mortgage in Pensacola?",
    "a": "For most ranks E-5 and above, yes. An E-6 with dependents receives approximately $2,235/month BAH for the Pensacola area, which comfortably covers a mortgage on a $305-350K home. O-3 with dependents receives approximately $2,271/month, opening up homes in the $325-385K range. I can run exact numbers based on your rank and situation."
  },
  {
    "q": "Should I rent first or buy immediately?",
    "a": "If you know you'll be in Pensacola for 3+ years, buying typically makes more financial sense, especially with a VA loan at zero down. If your assignment is less than 2 years, renting may be smarter unless you plan to keep the property as a rental investment. I can help you model both scenarios."
  },
  {
    "q": "Do I need a Realtor if I'm looking at new construction?",
    "a": "Absolutely. Builder sales reps work for the builder, not you. Buyer-broker compensation is negotiable and put in writing before we tour a single home; on new construction the builder often offers to cover some or all of it, and where they do not, it becomes part of the offer strategy we build together. Either way you get someone advocating for your interests on inspections, upgrades, and contract terms."
  }
];
