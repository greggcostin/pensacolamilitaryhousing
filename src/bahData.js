// 2026 DoD BAH tables for the two Florida Panhandle MHAs. Plain ESM data: imported by
// src/App.jsx (calculators, PCS guide, base pages) AND scripts/postbuild-spa-routes.mjs
// (prerendered /pcs-guide shell), so the SPA and the crawler-visible HTML can never drift.
// Update every December from https://www.travel.dod.mil/Allowances/Basic-Allowance-for-Housing/
// (see docs/ANNUAL-UPDATE.md). Rows are [grade, withDependents, withoutDependents].
export const BAH_DATA = {
  FL064: {
    mhaCode: "FL064", mhaName: "Pensacola, FL", yoyChange: "+0.5% from 2025",
    installations: "NAS Pensacola • NTTC Corry Station • NAS Whiting Field",
    enlisted: [
      ["E-1",1794,1521],["E-2",1794,1521],["E-3",1794,1521],["E-4",1794,1521],
      ["E-5",1863,1644],["E-6",2235,1722],["E-7",2256,1791],["E-8",2265,1941],["E-9",2304,2046],
    ],
    warrant: [
      ["W-1",2253,1782],["W-2",2262,1938],["W-3",2274,2061],["W-4",2325,2229],["W-5",2427,2241],
    ],
    officer: [
      ["O-1E",2259,1860],["O-2E",2268,2022],["O-3E",2340,2226],
      ["O-1",1914,1719],["O-2",2232,1842],["O-3",2271,2097],
      ["O-4",2457,2232],["O-5",2610,2244],["O-6",2631,2247],["O-7",2646,2259],
    ],
  },
  FL023: {
    mhaCode: "FL023", mhaName: "Fort Walton Beach, FL", yoyChange: "+0.4% from 2025",
    installations: "Eglin AFB • Hurlburt Field",
    enlisted: [
      ["E-1",2340,2007],["E-2",2340,2007],["E-3",2340,2007],["E-4",2340,2007],
      ["E-5",2433,2157],["E-6",2526,2250],["E-7",2841,2340],["E-8",3189,2457],["E-9",3447,2586],
    ],
    warrant: [
      ["W-1",2544,2322],["W-2",2985,2454],["W-3",3414,2589],["W-4",3456,2604],["W-5",3516,2922],
    ],
    officer: [
      ["O-1E",2910,2430],["O-2E",3351,2514],["O-3E",3468,2601],
      ["O-1",2451,2244],["O-2",2523,2406],["O-3",3399,2592],
      ["O-4",3528,2865],["O-5",3612,3066],["O-6",3642,3393],["O-7",3669,3453],
    ],
  },
};
