# Marketing Ops Kit — PensacolaMilitaryHousing.com

Companion to the August 2026 build-out (P0/P1/P2). Everything in this file is
off-site work that code can't do — links to update, settings to flip, outreach to send.

---

## 1. UTM link pack — replace your profile/signature links with these

71% of your Clarity sessions arrive with no attribution ("Other/null referrer").
Until every link you control is tagged, you cannot know which channel produces leads.
Copy-paste these exactly:

| Where the link lives | Use this URL |
|---|---|
| Zillow profile website field | `https://pensacolamilitaryhousing.com/?utm_source=zillow&utm_medium=profile` |
| Google Business Profile website | `https://pensacolamilitaryhousing.com/?utm_source=gbp&utm_medium=profile` |
| GBP appointment link | `https://pensacolamilitaryhousing.com/book-pcs-call?utm_source=gbp&utm_medium=appointment` |
| Facebook page + posts | `https://pensacolamilitaryhousing.com/?utm_source=facebook&utm_medium=social` |
| Instagram bio | `https://pensacolamilitaryhousing.com/?utm_source=instagram&utm_medium=bio` |
| YouTube descriptions | `https://pensacolamilitaryhousing.com/?utm_source=youtube&utm_medium=video` |
| Linktree | `https://pensacolamilitaryhousing.com/?utm_source=linktree&utm_medium=bio` |
| Email signature | `https://pensacolamilitaryhousing.com/?utm_source=email&utm_medium=signature` |
| FUB drip/blast emails | `https://pensacolamilitaryhousing.com/?utm_source=fub&utm_medium=email&utm_campaign=<name>` |
| SMS you send to leads | `https://pensacolamilitaryhousing.com/pcs-home-search?utm_source=sms&utm_medium=text` |
| VeteranPCS profile | `https://pensacolamilitaryhousing.com/?utm_source=veteranpcs&utm_medium=partner` |
| M.O.R.E. Network profile | `https://pensacolamilitaryhousing.com/?utm_source=more&utm_medium=partner` |

Rule of thumb for anything new: `?utm_source=<where>&utm_medium=<type>&utm_campaign=<optional>`.

## 2. Stop polluting your own analytics (10 minutes)

Your own visits are inflating the "Other" bucket and skewing scroll/session data.

**Microsoft Clarity** (clarity.microsoft.com → your project → Settings → IP blocking):
add your home IP and your phone's IP on home Wi-Fi. Check "Block my current IP".

**GA4** (Admin → Data streams → your stream → Configure tag settings → Define internal
traffic): create rule `internal`, IP equals your home IP. Then Admin → Data settings →
Data filters → activate the "Internal Traffic" filter (it ships in "Testing" mode —
switch it to Active).

Find your IP: google "what is my IP" from home; repeat on your phone off Wi-Fi if you
browse the site over cellular a lot.

## 3. Backlink targets — from authority 7 to 15+

Priority order (each is a real, checked opportunity as of Aug 2026):

1. **Post Housing agent directory** — pensacolanavalhousing.com / whitingfieldhousing.com /
   hurlburthousing.com sell "List Your Business" placements and their directory currently
   shows placeholder content — no local agent has bought in. They outrank you at #1 on the
   BAH keywords today. Being the only agent listed on all three is cheap positioning +
   three relevant backlinks. (posthousing.com network)
2. **VeteranPCS** — you're already a preferred agent; ask for a dofollow link on your
   profile + offer them a guest article ("What 11 PCS moves taught me about buying at
   NAS Pensacola").
3. **M.O.R.E. Network + Tier 1 PCS** — same ask: partner page link to the site, not just
   your phone number.
4. **Lender partners** — every VA lender you close with has an "agent partners" page or
   blog. Trade testimonials-for-links.
5. **PCSgrades + MilitaryTownAdvisor** — claim/complete agent profiles; both rank on
   "moving to Pensacola" queries you want.
6. **Greater Pensacola Chamber + Navarre/Crestview chambers** — member directory links.
7. **Local press** — pitch PNJ / WEAR / InWeekly the story angle: "Retired AWACS officer
   who made 11 PCS moves now guides military families here; Warrington CRA + prison-camp
   redevelopment = west-side opportunity." Your /nas-pensacola-gates and /bah-rates pages
   are citable resources reporters can link.
8. **Levin Rinke Realty** — get the brokerage site's agent bio to link
   pensacolamilitaryhousing.com (it currently links your subdomain profile).
9. **Base-adjacent orgs** — USO Northwest Florida, Navy League Pensacola Council,
   Fleet & Family readiness pages that list off-base housing resources; offer the
   PCS guide/BAH calculator as a linked resource.

Outreach template (short works):
> Subject: Resource for [audience] PCSing to Pensacola
> I'm Gregg Costin — retired USAF Combat Systems Officer (11 PCS moves) and an
> MRP-certified Realtor at Levin Rinke. I maintain free, no-gate guides military
> families use for Pensacola-area moves: 2026 BAH calculator, base-by-base housing
> guides, gate/lodging info. If useful to your [members/readers/clients], here's the
> link: pensacolamilitaryhousing.com. Happy to write something original for your
> audience too.

## 4. Google Business Profile cadence

- You're at 49 Google reviews (5.0); Be More Group claims "50+". Do not lose this race:
  keep the post-closing review cadence running, and reply to every review within 48h.
- Weekly GBP post: rotate BAH tip / neighborhood spotlight / new guide page. Every post
  links a site page with `?utm_source=gbp&utm_medium=post`.
- Seed GBP Q&A yourself: "Do you work with VA loans?" "Do you help with PCS from
  overseas?" — post the question from any account, answer from the business.
- Add services: Military Relocation, VA Loans, PCS Assistance, Home Valuation.
- Set the appointment URL to /book-pcs-call (tagged, see §1).

## 5. Publishing cadence — the striking-distance hit list

Target: 4-8 posts/month (Be More Group ships 6-7; panhandlepcs ~30). Each post targets
one keyword below, links to its money page, and gets one social share + one GBP post.

| Keyword | Vol/mo | Your position | Support page |
|---|---|---|---|
| pensacola bah (cluster) | 590+480+480 | 11-12 → calculator now live | /bah-rates |
| duke field fl / duke airfield | 880-1,900 | 21-29 | /bases/duke-field (refreshed) |
| naval aviation schools command | 720 | 13 | /bases/nas-pensacola (NIFE added) |
| navy lodge pensacola | 2,900 | — | /military-lodging-pensacola (new) |
| nas pensacola gates cluster | 720+590+260 | — | /nas-pensacola-gates (new) |
| hurlburt field housing | 260 | 30-42 | /military-realtor-hurlburt-field (new) |
| nas whiting field housing | 40-170 | 34 | /nas-whiting-field-off-base-housing (new) |
| saufley field | 590 | 12 | /bases/saufley-field (corrected) |
| eglin afb base housing | 590 | 34 | /on-base-vs-off-base-eglin-afb |
| navarre fl homes for sale | 320 | — | /communities/navarre |

## 6. RealScout & Calendly wiring (done Aug 12, 2026)

- **/pcs-home-search** leads with RealScout onboarding
  (`https://greggcostin.realscout.com/onboarding`) as the primary funnel — FUB-tracked,
  fires a `realscout_signup_click` GA event. Levin Rinke IDX links remain as the
  no-registration browse path.
- **/whats-my-home-worth** features the RealScout home-value tracker first, your 24-hour
  CMA form second. **ONE TODO:** the button currently uses the onboarding link. Grab your
  exact "What's My Home Worth?" share link (RealScout dashboard → Home Value Alerts →
  Capture Leads → copy link) and swap it at the marked comment in
  `public/whats-my-home-worth.html` (search for "Swap this href").
- **/book-pcs-call** embeds your Calendly (`calendly.com/Greggcostin`) inline, branded to
  the site colors, with the request form as a fallback for networks that block embeds.
  A completed booking fires a `strategy_call_booked` GA conversion event.
- **Contact-worker confirmation email FIXED AND DEPLOYED** (version afa4d395): resource
  links now point to RealScout onboarding, /whats-my-home-worth, and /reviews (the old
  greggcostin.com/listings and /home-valuation links were dead). Vars and secrets preserved.

## 7. Other housekeeping flags

- **FUB staging**: forms were sending inquiry types that didn't match the worker's stage
  map, so every lead filed as "Prospect". Fixed in code (values now match); spot-check the
  next few leads land as "Lead" with the 2-hour follow-up task.
- **Worker honeypot**: forms sent `honeypot:` but the worker checks `_gotcha` — fixed in
  code; if form spam drops sharply, that's why.
- Consider adding the site to **Bing Webmaster Tools** + verify **Google Search Console**
  sitemap submission after this deploy (sitemap grew by 9 URLs).
