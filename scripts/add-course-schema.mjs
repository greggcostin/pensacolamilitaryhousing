// Add Course JSON-LD to the 4 educational guide pages.
// Course schema enables AI engines (Perplexity, ChatGPT, Google AI Overviews)
// to cite the page as a "teach me X" answer source. Includes all fields
// Google requires for Course rich results: provider, instructor,
// hasCourseInstance, offers.

import { readFileSync, writeFileSync } from "node:fs";

const PERSON_ID = "https://pensacolamilitaryhousing.com/#person-gregg";
const AGENT_ID = "https://pensacolamilitaryhousing.com/#agent";
const DOMAIN = "https://pensacolamilitaryhousing.com";

const COURSES = {
  "public/va-loan-guide.html": {
    name: "VA Home Loan Guide for Florida Panhandle Military Families",
    description: "Self-paced guide to using a VA loan to buy a home near NAS Pensacola, Whiting Field, Eglin AFB, or Hurlburt Field. Covers eligibility, Certificate of Eligibility (COE), funding fee tiers, zero-down structure, no-PMI benefit, seller concessions per VA Pamphlet 26-7, VA appraisal and Notice of Value, and lender selection.",
    audienceType: "Active-duty military, veterans, and surviving spouses considering a VA-financed home purchase",
    workload: "PT45M",
    url: `${DOMAIN}/va-loan-guide`,
  },
  "public/va-irrrl-guide.html": {
    name: "VA IRRRL Streamline Refinance Guide",
    description: "Self-paced walkthrough of the VA Interest Rate Reduction Refinance Loan: eligibility (prior VA loan, current on payments, net tangible benefit), the 0.5% rule, no appraisal and no income re-verification, 10-14 day close, 0.50% funding fee (waived at 10%+ disability), break-even math, and the rental-property qualification path.",
    audienceType: "Veterans and active-duty service members with an existing VA mortgage considering a rate reduction",
    workload: "PT30M",
    url: `${DOMAIN}/va-irrrl-guide`,
  },
  "public/bah-to-mortgage-guide.html": {
    name: "BAH to Mortgage Conversion Guide for Pensacola and Fort Walton Beach MHAs",
    description: "How to translate 2026 BAH for Pensacola (MHA FL064) and Fort Walton Beach (FL023) into a real mortgage budget: 125% tax-free gross-up, VA debt-to-income ceiling, residual income minimums by region and family size, and rank-by-rank max purchase-price estimates from E-5 to O-5 with target neighborhoods.",
    audienceType: "Military service members at any pay grade modeling home affordability against BAH",
    workload: "PT30M",
    url: `${DOMAIN}/bah-to-mortgage-guide`,
  },
  "public/first-time-military-homebuyer.html": {
    name: "First-Time Military Homebuyer Coaching for the Pensacola MHA",
    description: "Seven-step playbook for E-3 through E-6 enlisted and junior officers purchasing their first home. Covers credit preparation, VA-specialist lender selection, VA vs USDA vs FHA vs conventional decision matrix, neighborhood targeting, writing a winning VA offer (including the Pamphlet 26-7 seller-concession trick), surviving the VA appraisal and underwriting, and post-close Florida homestead and IRRRL setup.",
    audienceType: "First-time military homebuyers, primarily E-3 through E-6 enlisted and junior officers",
    workload: "PT60M",
    url: `${DOMAIN}/first-time-military-homebuyer`,
  },
};

const INSERT_BEFORE = '<script async src="https://www.googletagmanager.com/gtag/js?id=G-W29GHBK38M"></script>';

let count = 0;
for (const [path, c] of Object.entries(COURSES)) {
  const html = readFileSync(path, "utf8");
  if (html.includes('"@type":"Course"')) {
    console.log(`  ${path} — already has Course schema, skipping`);
    continue;
  }
  const courseJson = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Course",
    name: c.name,
    description: c.description,
    url: c.url,
    inLanguage: "en-US",
    isAccessibleForFree: true,
    educationalLevel: "Beginner",
    provider: { "@id": AGENT_ID },
    instructor: { "@id": PERSON_ID },
    audience: { "@type": "EducationalAudience", audienceType: c.audienceType },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      courseWorkload: c.workload,
      instructor: { "@id": PERSON_ID },
    },
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD", category: "Free" },
  });
  const block = `<script type="application/ld+json">\n${courseJson}\n</script>\n`;
  const out = html.replace(INSERT_BEFORE, block + INSERT_BEFORE);
  if (out === html) {
    console.log(`  ${path} — insertion anchor not found, skipped`);
    continue;
  }
  writeFileSync(path, out, "utf8");
  count++;
  console.log(`  ${path} — Course schema added`);
}
console.log(`\n${count} files updated.`);
