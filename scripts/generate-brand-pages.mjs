// Generates /about.html and /contact.html as real static pages so crawlers see
// specific content instead of the SPA shell via fallback. The SPA can still
// route internally at these paths on the client — Cloudflare Pages will serve
// the static file to non-JS crawlers but React takes over on first user click.

import { writeFileSync } from "node:fs";
import { renderPage } from "./content-page-template.mjs";

const ABOUT_BODY = `
<p>I am Gregg Costin — retired United States Air Force Captain, former enlisted Staff Sergeant, E-3 AWACS Combat Systems Officer, and now a licensed Florida and Alabama Realtor based in Pensacola. This is not a career pivot. It is the logical continuation of a 20-year career spent getting military families from point A to point B with everything they own, their spouses intact, and their kids enrolled in school by Monday morning.</p>

<h2>The Short Version</h2>
<ul>
<li><strong>20 years in the USAF</strong> — started as an E-3 enlistee, commissioned mid-career, retired as a Captain.</li>
<li><strong>E-3 AWACS Combat Systems Officer</strong> — the officer in the back of the airplane running the radar picture, the mission, and the lives of 15+ crew members.</li>
<li><strong>11 personal PCS moves</strong> — I have lived the paperwork and the weather and the new-school enrollments. I know what breaks during a PCS and how to protect against it.</li>
<li><strong>Licensed Realtor in Florida and Alabama</strong> — serving the Florida Panhandle, primary market Pensacola through Destin.</li>
<li><strong>Credentials:</strong> MRP (Military Relocation Professional), ABR (Accredited Buyer's Representative), SRS (Seller Representative Specialist), RENE (Real Estate Negotiation Expert), Florida Military Specialist. Pursuing GRI.</li>
<li><strong>Brokerage:</strong> <a href="https://greggc.levinrinkerealty.com" target="_blank" rel="noopener">Levin Rinke Realty</a> — 220 W. Garden Street, Pensacola, FL.</li>
</ul>

<h2>Why I Specialize in Military</h2>
<p>Because I have been you. I bought my first home as an E-5 and got burned — clueless agent, commission-chasing lender, $18,000 out the door two years later when PCS orders hit. Every mistake I made then is now baked into how I guide the families I work with.</p>
<p>Military real estate is not harder than civilian real estate. It is just different — different timelines (PCS-driven), different financing (VA loans, BAH, funding fee waivers), different stakes (a wrong house in a 3-year posting is a lot of money and a lot of weekends). Most Realtors in the Panhandle are good at residential real estate generally. A much smaller number are good at military relocation specifically. I am in the second group because I cannot be anything else.</p>

<h2>How I Work</h2>
<ul>
<li><strong>I answer my phone.</strong> 7 days a week, 8am-8pm CT. If you call at 7pm and I miss it, I call back by 8am the next morning.</li>
<li><strong>I do video tours for deployed and TDY clients.</strong> Half my clients in the last 18 months bought sight-unseen from me. Standard procedure, not a favor.</li>
<li><strong>I am VA-loan literate.</strong> I know the Pamphlet 26-7, the funding fee tables, the Tier 1 limits, the 4% seller concession cap, the IRRRL math. I have written dozens of pages on this site to prove it (see the <a href="/va-loan-guide">VA Loan Guide</a>).</li>
<li><strong>I say no when the numbers do not work.</strong> Several times a year I tell buyers "the house you want is priced wrong for this market" or "at this BAH you should wait 8 months and save." My job is not to sell you a house. My job is to put you in the right one.</li>
<li><strong>I know the Panhandle at the street level.</strong> I can tell you which streets in Gulf Breeze flood during tropical storms, which Niceville elementary schools have the best IB feeder, and why the house on Live Oak Drive has sat on the market for 60 days.</li>
</ul>

<h2>What Clients Have Said</h2>
<p>I have <a href="/reviews.html">published reviews</a> from military and veteran families. A sample of themes I hear:</p>
<ul>
<li>"Gregg understood our PCS timeline without us having to explain it."</li>
<li>"He walked us through VA funding fee and seller concessions — our previous agent just said 'use seller credits' with no numbers."</li>
<li>"He found us a 2.75% assumable VA loan in Gulf Breeze that saved us $900/month."</li>
<li>"We closed in 28 days because he knew which local lender understood reservist income calculations."</li>
</ul>

<h2>My Service Area</h2>
<p>I serve the full Florida Panhandle with a focus on:</p>
<ul>
<li><strong>Naval bases:</strong> <a href="/bases/nas-pensacola">NAS Pensacola</a>, <a href="/bases/corry-station">Corry Station</a>, <a href="/bases/whiting-field">NAS Whiting Field</a>, <a href="/bases/saufley-field">Saufley Field</a></li>
<li><strong>Air Force bases:</strong> <a href="/bases/eglin-afb">Eglin AFB</a>, <a href="/bases/hurlburt-field">Hurlburt Field</a>, <a href="/bases/duke-field">Duke Field</a></li>
<li><strong>Communities:</strong> <a href="/communities/gulf-breeze">Gulf Breeze</a>, <a href="/communities/navarre">Navarre</a>, <a href="/communities/pace">Pace</a>, <a href="/communities/milton">Milton</a>, <a href="/communities/niceville">Niceville</a>, <a href="/communities/fort-walton-beach">Fort Walton Beach</a>, <a href="/communities/destin">Destin</a>, <a href="/communities/crestview">Crestview</a>, <a href="/communities/perdido-key">Perdido Key</a>, and all 16 communities I cover in depth.</li>
</ul>

<h2>Ready to Talk?</h2>
<p>Call or text <a href="tel:+18502665005">(850) 266-5005</a>, email <a href="mailto:gregg.costin@gmail.com">gregg.costin@gmail.com</a>, or see the <a href="/contact.html">Contact page</a> for video-call scheduling. Initial consultations are free and do not require a signed agreement. I will answer your questions even if you decide to work with someone else.</p>
`;

const CONTACT_BODY = `
<p>I respond to every inquiry within 2 hours during business hours (8am-8pm CT, 7 days a week). After-hours messages get a response by 8am the next morning. Urgent? Call directly.</p>

<h2>Fastest Ways to Reach Me</h2>
<table>
<thead><tr><th>Method</th><th>Best For</th><th>Response Time</th></tr></thead>
<tbody>
<tr><td><a href="tel:+18502665005">(850) 266-5005</a></td><td>Urgent questions, live discussion</td><td>Immediate during business hours</td></tr>
<tr><td>Text to (850) 266-5005</td><td>Scheduling, quick questions</td><td>Within 15 minutes</td></tr>
<tr><td><a href="mailto:gregg.costin@gmail.com">gregg.costin@gmail.com</a></td><td>Documents, detailed questions, offer strategy</td><td>Within 2 hours</td></tr>
<tr><td>Video call (Zoom / FaceTime / Teams)</td><td>Deployed, TDY, OCONUS buyers</td><td>Scheduled via email</td></tr>
</tbody>
</table>

<h2>What to Include in Your First Message</h2>
<p>None of this is required, but it helps me get you answers faster:</p>
<ul>
<li><strong>Which base are you assigned to</strong> (or expecting to be assigned to)?</li>
<li><strong>What is your report date / PCS window?</strong></li>
<li><strong>Rank + dependent status</strong> (drives BAH and budget math)</li>
<li><strong>Buying, selling, or both?</strong></li>
<li><strong>VA loan status</strong> — first-time use, subsequent use, disabled veteran, surviving spouse</li>
<li><strong>Any dealbreakers</strong> — schools, commute time, fenced yard, single-story, waterfront</li>
</ul>
<p>Even a one-line message like "O-3, PCS to Eglin September, looking $500K range, kids in 2nd and 5th grade" gives me enough to come back with useful specifics.</p>

<h2>Where I Am Physically</h2>
<address style="font-style:normal;color:var(--text);background:var(--panel);border:1px solid var(--hair);padding:1.25rem;border-radius:8px;display:inline-block">
<strong>Gregg Costin, Realtor</strong><br>
Levin Rinke Realty<br>
220 W. Garden Street<br>
Pensacola, FL 32502<br>
<br>
<strong>Phone:</strong> <a href="tel:+18502665005">(850) 266-5005</a><br>
<strong>Email:</strong> <a href="mailto:gregg.costin@gmail.com">gregg.costin@gmail.com</a>
</address>

<h2>Social and Online</h2>
<ul>
<li><strong>Google:</strong> <a href="https://www.google.com/maps/place/Gregg+Costin+Pensacola+Realtor+-+Levin+Rinke+Realty/@30.4129639,-87.2188735,17z/data=!4m6!3m5!1s0x8890c1a04a17d29b:0xaaa3b223c50fa5fc!8m2!3d30.4129639!4d-87.2188735!16s%2Fg%2F11mdg2zjxd" target="_blank" rel="noopener">Business Profile</a></li>
<li><strong>Zillow:</strong> <a href="https://www.zillow.com/profile/GreggCostin" target="_blank" rel="noopener">Zillow Profile</a></li>
<li><strong>Instagram:</strong> <a href="https://www.instagram.com/greggcostinrealtor/" target="_blank" rel="noopener">@greggcostinrealtor</a></li>
<li><strong>Facebook:</strong> <a href="https://www.facebook.com/greggcostin/" target="_blank" rel="noopener">@greggcostin</a></li>
<li><strong>YouTube:</strong> <a href="https://www.youtube.com/@PensacolaMilitaryRealtor" target="_blank" rel="noopener">@PensacolaMilitaryRealtor</a></li>
<li><strong>Linktree:</strong> <a href="https://linktr.ee/Greggcostin" target="_blank" rel="noopener">linktr.ee/Greggcostin</a></li>
<li><strong>Brokerage profile:</strong> <a href="https://greggc.levinrinkerealty.com" target="_blank" rel="noopener">greggc.levinrinkerealty.com</a></li>
</ul>

<h2>What the First Conversation Looks Like</h2>
<ol>
<li><strong>Initial intake (15-20 min):</strong> Phone or video. I ask about base, timeline, budget, family, and priorities. You ask whatever you want. No commitments.</li>
<li><strong>Follow-up with a written brief (within 24 hours):</strong> I send you a short write-up — 3-5 candidate neighborhoods, a BAH-to-mortgage range, known gotchas for your rank and base, and a suggested timeline.</li>
<li><strong>Market tour or video preview (week 1-2):</strong> Either in-person if you are in the area or video tour of 3-5 shortlisted properties.</li>
<li><strong>Buyer representation agreement</strong> once we both decide to work together. Not before.</li>
</ol>

<h2>I Say No When It Is Not a Fit</h2>
<p>A few times a year I decline to represent someone — usually because the market timing is wrong for their situation, or because another agent with a specific local niche (deep Perdido Key waterfront, specific HOA/subdivision expertise) is the better fit. I will tell you straight up and give you the referral. You do not waste your time, I do not over-promise.</p>
`;

const ABOUT = {
  slug: "about",
  title: "About Gregg Costin | Retired USAF Captain + Pensacola Military Realtor",
  description: "Gregg Costin — retired USAF Captain, E-3 AWACS Combat Systems Officer, licensed FL/AL Realtor. 20 years military, 11 PCS moves, MRP/ABR/SRS/RENE/FMS credentials, Pensacola-based.",
  keywords: "Gregg Costin, Pensacola military realtor, USAF veteran realtor, MRP realtor Pensacola, military relocation Pensacola, about Gregg Costin",
  h1: "About Gregg Costin — Retired USAF Captain, Pensacola Military Realtor",
  breadcrumbName: "About",
  areaServed: "Pensacola",
  knowsAbout: ["Military Relocation", "PCS Relocation", "VA Home Loans", "Combat Systems Officer", "USAF Retirement", "Pensacola Real Estate"],
  lead: "Retired USAF Captain. E-3 AWACS Combat Systems Officer. 11 personal PCS moves. Now a licensed Florida and Alabama Realtor helping military families land soft in the Panhandle.",
  faqs: [
    { q: "What did Gregg do in the Air Force?", a: "20-year USAF career, starting as an E-3 enlistee and commissioning mid-career to retire as a Captain. Served as an E-3 AWACS Combat Systems Officer — the officer in the back of the airplane running the radar picture, the mission execution, and the crew. Prior enlisted time as Staff Sergeant." },
    { q: "How many PCS moves has Gregg personally done?", a: "11 personal PCS moves over a 20-year career — enough to know every way a military move can go sideways and to build a playbook for each one. This is the foundation of his real-estate practice." },
    { q: "What credentials does Gregg hold as a Realtor?", a: "Military Relocation Professional (MRP), Accredited Buyer's Representative (ABR), Seller Representative Specialist (SRS), Real Estate Negotiation Expert (RENE), and Florida Military Specialist (FMS). Currently pursuing GRI. Licensed in both Florida and Alabama." },
    { q: "What brokerage is Gregg with?", a: "Levin Rinke Realty, 220 W. Garden Street, Pensacola, FL 32502 — a Pensacola-headquartered brokerage with deep Panhandle roots. Levin Rinke handles the transaction infrastructure; Gregg runs his own military-specialist practice within it." },
  ],
  body: ABOUT_BODY,
};

const CONTACT = {
  slug: "contact",
  title: "Contact Gregg Costin | Pensacola Military Realtor | (850) 266-5005",
  description: "Call (850) 266-5005 or email Gregg Costin, retired USAF Captain + Pensacola military Realtor. 2-hour response during business hours. Video calls for deployed/TDY buyers.",
  keywords: "contact Gregg Costin, Pensacola military realtor contact, Gregg Costin phone, military realtor Pensacola, (850) 266-5005",
  h1: "Contact Gregg Costin",
  breadcrumbName: "Contact",
  areaServed: "Pensacola",
  knowsAbout: ["Military Relocation", "Pensacola Real Estate", "VA Home Loans"],
  lead: "Call, text, email, or schedule a video call. I respond within 2 hours during business hours (8am-8pm CT, 7 days a week).",
  faqs: [
    { q: "What is Gregg's phone number?", a: "(850) 266-5005 — call or text. Business hours 8am-8pm CT, 7 days a week. Urgent after-hours calls get answered when possible; otherwise responses go out by 8am the next morning." },
    { q: "What is Gregg's email?", a: "gregg.costin@gmail.com. Expect a response within 2 hours during business hours. This is the preferred channel for documents, detailed questions, and offer-strategy discussions." },
    { q: "Does Gregg do video calls?", a: "Yes — Zoom, FaceTime, Google Meet, or Teams. Video calls are standard for deployed, TDY, and OCONUS buyers. Roughly half of his clients in the last 18 months bought sight-unseen from video tours." },
    { q: "Where is Gregg located?", a: "Levin Rinke Realty, 220 W. Garden Street, Pensacola, FL 32502. Downtown Pensacola, near Palafox. In-person meetings welcome but not required — most of the process runs digitally." },
    { q: "Is the first consultation free?", a: "Yes. Initial consultations (15-20 minutes) are free and do not require a signed agreement. Gregg will answer your questions even if you decide to work with someone else." },
  ],
  body: CONTACT_BODY,
};

writeFileSync("public/about.html", renderPage(ABOUT), "utf8");
writeFileSync("public/contact.html", renderPage(CONTACT), "utf8");
console.log("wrote public/about.html and public/contact.html");
