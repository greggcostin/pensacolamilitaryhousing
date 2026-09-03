// Generate the /buy and /sell pillar pages from the copied assumable-VA scaffold.
// Patches only page-specific blocks; the shared banner/footer/search/Person/Agent
// schema + design-system styles stay byte-identical to the rest of the site.
// Rebranded from bemoregroup.net/buy + /sell into Gregg Costin's military niche;
// testimonials use Gregg's REAL reviews (not the source site's other agents').
import { readFileSync, writeFileSync } from "node:fs";
import { IDS, publisherRef } from "./entity-lib.mjs";

const CAL = "https://calendly.com/greggcostin";
const VAL = "https://levinrinkerealty.findbuyers.com/greggc@levinrinkerealty.com";
const TEL = "tel:+18502665005";

// ---- shared CSS for hero CTAs, value/service cards, testimonials ----
const CSS = `
/* BUY-SELL_CSS */
.hero-ctas{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin:24px auto 4px}
.btn{display:inline-block;padding:14px 28px;border-radius:6px;font-weight:600;text-decoration:none;font-family:var(--sans);font-size:13px;letter-spacing:1.2px;text-transform:uppercase;transition:all .2s;cursor:pointer}
.btn-primary{background:var(--gold);color:var(--ink)!important}
.btn-primary:hover{background:var(--gold-soft);color:var(--ink)!important}
.btn-secondary{background:transparent;color:var(--gold)!important;border:1px solid var(--gold-line)}
.btn-secondary:hover{border-color:var(--gold);color:var(--gold-soft)!important}
.grid3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;margin:2rem 0}
.svc-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;margin:1.5rem 0 2rem}
.card{background:var(--panel);border:1px solid var(--hair);border-radius:10px;padding:1.5rem;min-width:0}
.card h3{color:var(--gold);font-size:1.02rem;margin:0 0 .5rem;font-family:var(--serif);text-transform:none;letter-spacing:0}
.card p{color:var(--text);font-size:.93rem;line-height:1.7;margin:0;font-weight:300}
.card .btn{margin-top:14px}
.tgrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;margin:1.5rem 0 2.5rem}
.tcard{background:var(--panel);border:1px solid var(--hair);border-radius:10px;padding:1.5rem;display:flex;flex-direction:column}
.tcard .stars{color:var(--gold);letter-spacing:2px;margin-bottom:10px}
.tcard blockquote{color:var(--text);font-style:italic;font-size:.92rem;line-height:1.7;margin:0 0 14px;font-weight:300;flex:1}
.tcard .who{color:#fff;font-weight:600;font-size:.9rem}
.tcard .src{color:var(--mutedD);font-size:.78rem;margin-top:2px}
@media(max-width:720px){.grid3,.svc-grid,.tgrid{grid-template-columns:1fr}}
`;

const card = (h, p) => `<div class="card"><h3>${h}</h3><p>${p}</p></div>`;
const valuationCard = `<div class="card"><h3>Free Home Valuation</h3><p>Understanding your home's value is the first step in a successful sale. I provide a personalized market evaluation based on recent sales, local trends, your home's condition, location, and buyer demand across the Emerald Coast.<br><a class="btn btn-primary" style="margin-top:14px" href="${VAL}" target="_blank" rel="noopener">Request a Home Valuation</a></p></div>`;
const tcard = (q, who, src) => `<div class="tcard"><div class="stars">★★★★★</div><blockquote>"${q}"</blockquote><div class="who">${who}</div><div class="src">${src}</div></div>`;
const finalCta = (buttons) => `<div class="cta"><p><strong>Ready to navigate your next move?</strong></p><p style="margin-top:6px">From military relocations to long-term investments, you get trusted local guidance built to help you move forward with confidence.</p><div class="hero-ctas">${buttons}</div></div>`;

// ===================== BUY =====================
const BUY = {
  slug: "buy",
  title: "Buy a Home on the Emerald Coast | Military &amp; VA Buyer Guidance | Gregg Costin",
  desc: "Buy with confidence on the Emerald Coast. PCS-aware home search, VA loan strategy, base-commute and school guidance, and offer-to-closing support from Gregg Costin, retired USAF Captain and Realtor.",
  keywords: "buy a home Pensacola, military home buyer Emerald Coast, VA loan buyer Pensacola, PCS home buying NAS Pensacola, first-time military homebuyer Florida, Gregg Costin buyer agent",
  ogImage: "https://pensacolamilitaryhousing.com/images/og-image.jpg",
  knowsAbout: ["Military Home Buying","VA Loans","PCS Relocation","BAH","Emerald Coast Communities","First-Time Homebuyers"],
  articleHeadline: "Buy a Home on the Emerald Coast with Confidence",
  articleDesc: "PCS-aware home search, VA loan strategy, base-commute and school guidance, and offer-to-closing support for military buyers across the Florida Panhandle.",
  breadcrumb: "Buy a Home",
  faq: [
    ["Can I buy a home in Pensacola before my PCS orders are final?","Yes, and starting early is an advantage. You can get pre-approved, narrow neighborhoods, and watch the market in the orders-pending window, then move fast once orders cut. You cannot close a VA purchase without orders or a verifiable report date, but everything up to that point can be ready to go."],
    ["How much do I need for a down payment as a military buyer?","If you are VA-eligible, the VA loan allows zero down with no private mortgage insurance, so many buyers purchase with little out of pocket beyond inspection and appraisal costs. Seller-paid closing costs and concessions, structured correctly under VA Pamphlet 26-7, can bring cash-to-close close to zero."],
    ["Which Emerald Coast communities are best for military buyers?","It depends on your base, commute tolerance, schools, and budget. Gulf Breeze, Navarre, Pace, Milton, Cantonment, Perdido Key, and Niceville each trade off differently on price, drive time to base, and school ratings. I match homes to your exact priorities rather than pushing one area."],
    ["Can you help me buy a home sight-unseen while I'm stationed elsewhere?","Yes. I run live video walk-throughs of any listing, including the drive from the home to your gate, handle inspections and appraisal remotely, and can close with a VA-compliant power of attorney. A large share of my military clients buy their Pensacola-area home without seeing it in person first."],
    ["Do I need flood insurance to buy near the coast?","It depends on the home's FEMA flood zone, not the city. Homes in high-risk zones (A or V series) require flood insurance with a federally backed loan; zone X is lower risk and optional. I verify the zone on every home before you offer and factor insurance into the full monthly cost."],
  ],
  related: `<a href="/first-time-military-homebuyer">First-Time Military Homebuyer</a>
<a href="/va-loan-guide">VA Loan Guide</a>
<a href="/bah-to-mortgage-guide">BAH to Mortgage Guide</a>
<a href="/assumable-va-loans-pensacola">Assumable VA Loans</a>
<a href="/florida-home-insurance-military">FL Home Insurance &amp; Flood</a>
<a href="/on-base-vs-off-base-nas-pensacola">On-Base vs Off-Base</a>`,
  header: `<h1>Buy a Home on the Emerald Coast — With a Realtor Who Has Done It 11 Times</h1>
<p class="meta">Whether you are PCSing to NAS Pensacola, buying your first home on a VA loan, or investing along the Gulf Coast, you get trusted, military-aware guidance from <strong>Gregg Costin</strong> — a retired USAF Captain and Combat Systems Officer who has personally navigated 11 military moves and is a Realtor with <a href="https://greggc.levinrinkerealty.com" target="_blank" rel="noopener">Levin Rinke Realty</a>. Call or text <a href="${TEL}"><strong>(850) 266-5005</strong></a>.</p>
<div class="hero-ctas"><a class="btn btn-primary" href="${CAL}" target="_blank" rel="noopener">Schedule a Consultation</a><a class="btn btn-secondary" href="${TEL}">Call (850) 266-5005</a></div>`,
  main: `<p>Buying on the Emerald Coast should not feel overwhelming, even on a compressed PCS timeline. From pricing trends and base-commute math to school zones, VA loan strategy, and the realities of coastal insurance, you get clear guidance at every step — so you make confident decisions and never overpay.</p>
<div class="grid3">
${card("Personalized Home Search","From pricing trends and community insights to school zones and PCS-timeline needs, I help you make informed decisions with confidence.")}
${card("Local Market Guidance","From showings and negotiations to inspections and closing, you get clear communication and personalized guidance at every stage of the buy.")}
${card("Support From Search to Closing","One point of contact who understands orders timelines, VA loans, and BAH — from the first showing through the keys in your hand.")}
</div>
<h2>Guidance Designed Around Your Goals</h2>
<p>Every buyer has different goals, timelines, and priorities. Here is how I help military families and Gulf Coast buyers run a focused, confident search.</p>
<div class="svc-grid">
${card("Personalized Home Search","I narrow properties by lifestyle, budget, base commute, PCS timeline, and long-term goals — so you spend your limited house-hunting window on homes that actually fit.")}
${card("Community &amp; Base-Commute Guidance","Compare Gulf Breeze, Navarre, Pace, Milton, Cantonment, Perdido Key, and Niceville on price, schools, waterfront access, and real drive times to NAS Pensacola, Corry Station, Whiting Field, Hurlburt, and Eglin.")}
${card("VA Loan &amp; Pre-Approval Support","I connect you with VA-literate lenders and walk you through your Certificate of Eligibility, entitlement, BAH-to-payment math, and zero-down strategy before you ever write an offer.")}
${card("Offer &amp; Negotiation Strategy","From competitive offers to inspections, contingencies, and seller concessions structured correctly under VA Pamphlet 26-7, I help you win the home without overpaying.")}
${card("Coastal Insurance &amp; Flood Reality","Flood zones, wind mitigation, and roof age move your real monthly cost more than the price does on the Gulf Coast. I pull the flood zone and get real insurance quotes during your inspection window — not after closing.")}
${card("Contract-to-Closing Coordination","I coordinate timelines, paperwork, inspections, and closing — including remote closing by power of attorney — all aligned with your report-no-later-than date.")}
</div>
<h2>How I Help You Buy with Confidence</h2>
<p>From community guidance to negotiations and closing, you get personalized support built to help you make informed decisions — backed by a full USAF career and 11 personal PCS moves.</p>
<div class="cta"><p><strong>Let's build your home-search game plan.</strong></p><div class="hero-ctas"><a class="btn btn-primary" href="${CAL}" target="_blank" rel="noopener">Schedule a Consultation</a><a class="btn btn-secondary" href="${TEL}">Call (850) 266-5005</a></div></div>
<h2>What Buyers Say</h2>
<div class="tgrid">
${tcard("We were PCSing to Pensacola from overseas and Gregg was incredible from day one. He set us up on a video call, walked us through the Perdido Key and Gulf Breeze markets, and helped us put in an offer sight-unseen. He caught an issue on the inspection we would have missed and negotiated a $6,000 credit.","Active Duty Navy Family","PCS from Overseas")}
${tcard("Gregg's negotiation skills saved us thousands on our Gulf Breeze home. He knew the local market cold and made sure we didn't overpay in a competitive situation. His response time was incredible — texts answered within minutes, not hours.","Gulf Breeze Buyer","Verified Google Review")}
${tcard("First-time homebuyers using a VA loan, we had zero clue where to start. Gregg walked us through every step, explained the VA requirements, and connected us with a VA-savvy lender. Closed on our Pace home in 28 days.","First-Time VA Buyer","Verified Google Review")}
</div>
${finalCta(`<a class="btn btn-primary" href="${CAL}" target="_blank" rel="noopener">Schedule a Consultation</a><a class="btn btn-secondary" href="${TEL}">Call (850) 266-5005</a>`)}
`,
};

// ===================== SELL =====================
const SELL = {
  slug: "sell",
  title: "Sell Your Home on the Emerald Coast | Strategic Military-Savvy Selling | Gregg Costin",
  desc: "Sell your Emerald Coast home with confidence. Request a free home valuation, get a data-driven pricing strategy, professional marketing, and PCS-timeline selling support from Gregg Costin, retired USAF Captain and Realtor.",
  keywords: "sell my home Pensacola, home valuation Emerald Coast, sell house PCS Pensacola, Gulf Breeze home seller agent, list my home Pensacola, Gregg Costin listing agent",
  ogImage: "https://pensacolamilitaryhousing.com/images/og-image.jpg",
  knowsAbout: ["Home Selling","Home Valuation","Listing Strategy","Real Estate Marketing","PCS Home Sales","Emerald Coast Real Estate"],
  articleHeadline: "Sell Your Home on the Emerald Coast with Confidence",
  articleDesc: "Free home valuation, data-driven pricing, professional marketing, and PCS-timeline selling support for homeowners across the Florida Panhandle.",
  breadcrumb: "Sell Your Home",
  faq: [
    ["How do I find out what my Emerald Coast home is worth?","Request a free, no-obligation home valuation and I will prepare a personalized market evaluation based on recent sales, current trends, your home's condition and location, and buyer demand across the Emerald Coast — not an automated guess."],
    ["How fast can I sell my home on a PCS timeline?","With early preparation and the right price, most homes can be marketed, under contract, and closed around your report date. The keys are pricing to the current market rather than last year's, and having staging and photography done before the home hits the MLS."],
    ["What does it cost to sell a home in Florida?","Typical seller costs include the agent commission, standard closing costs, and any pre-listing prep or repairs. I give you a clear net-proceeds estimate up front so there are no surprises, and Florida's lack of a state income tax keeps more of your gain in your pocket."],
    ["Can marketing an assumable VA loan help me sell?","Often, yes. If you have a VA loan at a low locked rate, a qualified buyer may be able to assume it and inherit that rate, which is a powerful selling point worth marketing. I help you present it correctly to attract motivated, qualified buyers."],
    ["Can you handle showings and closing if I've already PCSed out?","Yes. I coordinate showings, marketing, negotiations, and closing remotely, and can work with a power of attorney so you can sell from your next duty station without flying back."],
  ],
  related: `<a href="/military-rental-property-management">Keep It as a Rental Instead?</a>
<a href="/assumable-va-loans-pensacola">Market Your Assumable VA Loan</a>
<a href="/florida-homestead-exemption-military">FL Homestead &amp; Taxes</a>
<a href="/bah-rates">2026 BAH Rates</a>
<a href="/gulf-breeze-vs-navarre">Compare Communities</a>
<a href="/reviews">Client Reviews</a>`,
  header: `<h1>Sell Your Home on the Emerald Coast — Strategic, Military-Savvy Marketing</h1>
<p class="meta">Get a free home valuation and a pricing strategy built on current Emerald Coast data, plus professional marketing and PCS-timeline support from <strong>Gregg Costin</strong> — retired USAF Captain and Realtor with <a href="https://greggc.levinrinkerealty.com" target="_blank" rel="noopener">Levin Rinke Realty</a>. Call or text <a href="${TEL}"><strong>(850) 266-5005</strong></a>.</p>
<div class="hero-ctas"><a class="btn btn-primary" href="${VAL}" target="_blank" rel="noopener">Request a Home Valuation</a><a class="btn btn-secondary" href="${CAL}" target="_blank" rel="noopener">Schedule a Consultation</a></div>`,
  main: `<p>Selling on the Gulf Coast is about positioning your home competitively with real local data, strong marketing, and a price that reflects today's market — not last year's. Whether you are PCSing out, upsizing, or selling an investment property, you get clear communication and trusted guidance from first valuation to closing.</p>
<div class="grid3">
${card("Strategic Pricing Guidance","I position your property using recent sales, neighborhood data, and buyer demand — priced to sell without leaving money on the table.")}
${card("Professional Marketing Exposure","Professional photography, digital marketing, social media, and targeted online visibility put your home in front of the right buyers across the Emerald Coast.")}
${card("Personalized Selling Support","I guide you through preparation, showings, negotiations, and closing with clear communication and trusted local expertise.")}
</div>
<h2>Strategic Guidance for Every Stage of the Sale</h2>
<p>From pricing and preparation to marketing and negotiations, here is how I help homeowners sell with confidence along the Emerald Coast.</p>
<div class="svc-grid">
${valuationCard}
${card("Strategic Marketing Plan","Every property deserves a customized approach. I combine professional photography, digital exposure, social media, and targeted online visibility to help your home reach the right buyers — including the steady stream of incoming military families.")}
${card("Professional Staging Guidance","Presentation matters. I provide guidance on staging, decluttering, and preparing your home to showcase its best features and make a strong first impression with buyers.")}
${card("Showings &amp; Buyer Experience","I coordinate showings, buyer communication, and scheduling while making sure your property is presented professionally throughout the process.")}
${card("Negotiation &amp; Offer Guidance","From reviewing offers to navigating inspections and contingencies, I provide strategic guidance throughout negotiations so you make informed decisions with clarity.")}
${card("Contract-to-Closing Support","I manage the details from contract to closing — communication, timelines, documentation, and coordination with all parties — for a smooth, organized sale.")}
</div>
<h2>How I Actually Help You Sell</h2>
<p>From pricing and preparation to marketing and negotiations, you get personalized guidance built to help you sell with confidence — and the same military-aware service whether you are across town or across the world on orders.</p>
<div class="cta"><p><strong>Start with a free home valuation.</strong></p><div class="hero-ctas"><a class="btn btn-primary" href="${VAL}" target="_blank" rel="noopener">Request a Home Valuation</a><a class="btn btn-secondary" href="${CAL}" target="_blank" rel="noopener">Schedule a Consultation</a></div></div>
<h2>What Clients Say</h2>
<div class="tgrid">
${tcard("If you are moving to the Pensacola area, you need Gregg Costin in your corner. Relocating our family all the way from Washington State to Florida felt like a massive, overwhelming task, but Gregg was an absolute lifesaver. He is truly a professional who went above and beyond for us every step of the way.","Eric Johnson","Verified Google Review")}
${tcard("Gregg is an outstanding, exceptional and professional agent and advisor that truly looks out for you and treats you like family. The buying or selling process can be intimidating, but Gregg guides you through it with calm expertise.","Shannon Williamson","Local Guide · Verified Google Review")}
${tcard("As a veteran myself, working with another veteran Realtor made all the difference. Gregg's career in the Air Force means he gets it — deployments, short-notice moves, dual-military households. He's the real deal.","Veteran Client","Verified Google Review")}
</div>
${finalCta(`<a class="btn btn-primary" href="${VAL}" target="_blank" rel="noopener">Request a Home Valuation</a><a class="btn btn-secondary" href="${CAL}" target="_blank" rel="noopener">Schedule a Consultation</a>`)}
`,
};

// ---------- patch one page ----------
function build(cfg) {
  const path = `public/${cfg.slug}.html`;
  let h = readFileSync(path, "utf8");
  const O = "assumable-va-loans-pensacola";
  const base = "https://pensacolamilitaryhousing.com";

  // title / meta / canonical / og / twitter / dates
  h = h.replace("<title>Assumable VA Loans Pensacola | 2.75% Rates Still Available | Gregg Costin</title>", `<title>${cfg.title}</title>`);
  h = h.replace('content="How to find and assume a VA loan in Pensacola at the seller\'s original low rate. Substitution of entitlement, qualification, buyer-side strategy." />', `content="${cfg.desc}" />`);
  h = h.replace(/<meta name="keywords" content="[^"]*">/, `<meta name="keywords" content="${cfg.keywords}">`);
  h = h.split(`${base}/${O}`).join(`${base}/${cfg.slug}`);
  h = h.replace(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${cfg.title}" />`);
  h = h.replace(/<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${cfg.desc}" />`);
  h = h.replace(/<meta property="og:image" content="[^"]*" \/>/, `<meta property="og:image" content="${cfg.ogImage}" />`);
  h = h.replace('content="2026-04-20T00:00:00Z" />', 'content="2026-06-14T00:00:00Z" />');
  h = h.replace('content="2026-04-22T00:00:00Z" />', 'content="2026-06-14T00:00:00Z" />');

  // Article JSON-LD
  h = h.replace(/<script type="application\/ld\+json">\s*\{"@context":"https:\/\/schema.org","@type":"Article"[\s\S]*?<\/script>/,
    `<script type="application/ld+json">\n{"@context":"https://schema.org","@type":"Article","headline":"${cfg.articleHeadline}","description":"${cfg.articleDesc}","author":{"@id":"${IDS.person}"},"publisher":${JSON.stringify(publisherRef())},"datePublished":"2026-06-14","dateModified":"2026-06-14","image":"${cfg.ogImage}","mainEntityOfPage":{"@type":"WebPage","@id":"${base}/${cfg.slug}"},"inLanguage":"en-US","keywords":"${cfg.keywords}"}\n</script>`);

  // FAQPage JSON-LD
  const faqJson = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: cfg.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) };
  h = h.replace(/<script type="application\/ld\+json">\s*\{"@context":"https:\/\/schema.org","@type":"FAQPage"[\s\S]*?<\/script>/,
    `<script type="application/ld+json">\n${JSON.stringify(faqJson)}\n</script>`);

  // Breadcrumb JSON-LD
  h = h.replace(/<script type="application\/ld\+json">\s*\{"@context":"https:\/\/schema.org","@type":"BreadcrumbList"[\s\S]*?<\/script>/,
    `<script type="application/ld+json">\n{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"${base}/"},{"@type":"ListItem","position":2,"name":"${cfg.breadcrumb}","item":"${base}/${cfg.slug}"}]}\n</script>`);

  // remove the assumable-only HowTo block
  h = h.replace(/<script type="application\/ld\+json">\s*\{"@context":"https:\/\/schema.org","@type":"HowTo"[\s\S]*?<\/script>\n?/, "");

  // RealEstateAgent knowsAbout
  h = h.replace('"knowsAbout":["Assumable VA Loans","VA Loan Assumption","Substitution of Entitlement","VA Pamphlet 26-7","Pensacola VA Loans"]',
    `"knowsAbout":${JSON.stringify(cfg.knowsAbout)}`);

  // inject CSS before first </style>
  if (!h.includes("BUY-SELL_CSS")) h = h.replace("</style>", CSS + "</style>");

  // header
  h = h.replace(/<header>[\s\S]*?<\/header>/, `<header>\n${cfg.header}\n</header>`);

  // main content (between <main ...> and EXPLORE_V2 marker)
  const a = h.indexOf("<main data-pagefind-body>");
  const aEnd = h.indexOf(">", a) + 1;
  const b = h.indexOf("<!-- EXPLORE_V2 -->");
  h = h.slice(0, aEnd) + "\n" + cfg.main + "\n" + h.slice(b);

  // related guides block
  h = h.replace(/<!-- RELATED_GUIDES_START -->[\s\S]*?<!-- RELATED_GUIDES_END -->/,
    `<!-- RELATED_GUIDES_START -->\n<h2>Related Guides for This Page</h2>\n<div class="related">\n${cfg.related}\n</div>\n<!-- RELATED_GUIDES_END -->`);

  // last-updated stamp
  h = h.replace("Last updated: April 22, 2026", "Last updated: June 14, 2026");
  h = h.replace("Content last verified: April 2026", "Content last verified: June 2026");

  writeFileSync(path, h);
  console.log(`built /${cfg.slug}  (HowTo removed: ${!h.includes('"@type":"HowTo"')}, CSS: ${h.includes("BUY-SELL_CSS")})`);
}

build(BUY);
build(SELL);
