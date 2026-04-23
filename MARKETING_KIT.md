# Marketing Kit — 23 Short Domains

All 23 domains 301 to a specific canonical page on pensacolamilitaryhousing.com. Use them as memorable, base-specific or community-specific entry points on offline and social materials.

## The 23 domains by base / community

### Bases (10 domains → 7 pages)

| Short domain | Lands on | Use for |
|---|---|---|
| NASPensacolaMilitaryHousing.com | /bases/nas-pensacola | Naval aviation + Blue Angels + CSO/NFO pipeline clients |
| CorryStationMilitaryHousing.com | /bases/corry-station | Information warfare / cryptologic technician clients |
| WhitingFieldMilitaryHousing.com | /bases/whiting-field | Navy/Marine/Coast Guard helo pipeline clients |
| NASWhitingFieldMilitaryHousing.com | /bases/whiting-field | Same — alternate spelling |
| HurlburtMilitaryHousing.com | /bases/hurlburt-field | AFSOC families |
| HurlburtFieldMilitaryHousing.com | /bases/hurlburt-field | Same — alternate |
| EglinMilitaryHousing.com | /bases/eglin-afb | Eglin F-35 / 96TW / 7th SFG / 350 SWW |
| EglinAFBMilitaryHousing.com | /bases/eglin-afb | Same — alternate |
| DukeFieldMilitaryHousing.com | /bases/duke-field | 919 SOW reservists + ART / AGR |
| SaufleyFieldMilitaryHousing.com | /bases/saufley-field | NIOC Pensacola / CIWT det / DLI linguists |

### Communities (13 domains → 4 community pages)

| Short domain | Lands on | Use for |
|---|---|---|
| NavarreMilitaryHousing.com | /communities/navarre | Hurlburt BAH-arbitrage play |
| GulfBreezeMilitaryHousing.com | /communities/gulf-breeze | NAS Pensacola officer / senior enlisted |
| NicevilleMilitaryHousing.com | /communities/niceville | Eglin officer / school-priority |
| FortWaltonBeachMilitaryHousing.com | /communities/fort-walton-beach | Eglin / Hurlburt mid-tier |
| FWBMilitaryHousing.com | /communities/fort-walton-beach | Same — alternate |
| DestinMilitaryHousing.com | /communities/destin | O-3+ beach market |
| CrestviewMilitaryHousing.com | /communities/crestview | Duke Field / budget Eglin / 7 SFG acreage |
| MiltonMilitaryHousing.com | /communities/milton | Whiting Field value play |
| PaceMilitaryHousing.com | /communities/pace | Whiting Field / NAS Pensacola school play |
| MaryEstherMilitaryHousing.com | /communities/fort-walton-beach | Hurlburt-adjacent, AFSOC spouse community |
| ValparaisoMilitaryHousing.com | /communities/niceville | Eglin east-gate |
| ShalimarMilitaryHousing.com | /communities/fort-walton-beach | Eglin west-gate |
| PerdidoKeyMilitaryHousing.com | /communities/perdido-key | Waterfront / retirement market |

---

## Physical marketing use cases

### Yard signs at listings

Design: large main domain + base-specific short domain at bottom, swap the short domain per listing based on proximity to the nearest base.

### Business cards (two-sided)

**Front:** name, credentials, phone, email, main domain.
**Back:** single short domain matching the client's base (rotate printing or use blank-back stock with custom stickers per client).

### Email signature (auto-rotate by client base)

Keep 7 base-specific signature templates pre-saved. Pick the one matching the client's orders when replying.

### Instagram / Facebook / Linktree bio

Rotate monthly or tie to current listing focus — e.g. "Hurlburt PCS? HurlburtMilitaryHousing.com" one month, "NAS Pensacola orders? NASPensacolaMilitaryHousing.com" the next.

### Print ads

Target military base newspapers and local real-estate magazines. Each ad uses the short domain matching that paper's primary reader base. Publications to consider: The Flagship (NAS Pensacola), Beacon (Eglin/Hurlburt), Emerald Coast Magazine, Panhandle Parent.

### QR codes

Generate one QR code per short domain (any free generator). Put on open-house flyers, PCS inbound briefing packets, closing-gift welcome cards, and commissary spouse-club tables. Track scans via Cloudflare Analytics on each zone.

### Press release / introduction letter

Name 3-5 short domains in the body to reinforce topical authority across bases and communities.

---

## Digital / social use

### Linktree

Add all 23 short domains as separate links in Linktree, each titled by its base or community. Military visitors pick the one matching their orders and land on the right dedicated page.

### Zillow / Realtor.com profile

Both allow a "personal website" field. Rotate or A/B test the main domain vs a base-specific short domain to measure CTR delta.

### Google Business Profile

Add 2-3 short domains to Products / Services descriptions ("Hurlburt Field AFSOC housing: HurlburtMilitaryHousing.com") to strengthen base-specific keyword relevance.

### Reddit / Quora / military forums

When answering a question about a specific base, link the short domain (not the canonical). Matches thread topic, reads cleanly, passes on-topic anchor link equity.

---

## Tracking what works

**Cloudflare Analytics (free tier)** — each zone has its own request-volume dashboard:

1. Cloudflare dashboard → each short domain → Analytics → total requests over 30 days
2. Correlate top-hit domains with the marketing channels they appear on
3. Double down on whichever physical or digital placement is driving traffic

Optional upgrade: add a Cloudflare Worker per zone that logs the `Referer` header before 301'ing. That gives referrer-level attribution (e.g. "Instagram drove 12 clicks to NavarreMilitaryHousing.com this week").

---

## What NOT to do

- Don't build content pages on the short domains — duplicate-content penalty risk
- Don't try to SEO-rank the short domains independently — 301s don't rank
- Don't use short domains for email (`@navarremilitaryhousing.com`) — keep @gmail or brokerage email
- Don't change the 301 targets frequently — confuses Google's consolidation
- Don't add short domains to robots.txt as "Disallow" — that'd block crawlers following the 301s that pass link equity

---

## The two things that actually drive traffic from these domains

1. **People typing the URL from memory** after seeing it on a yard sign, card, or print ad
2. **People clicking the URL from a social/Reddit/Quora link** where the short domain is on-topic

Both are offline-to-online plays. The domains themselves produce nothing without your marketing action — they're the funnel, not the generator.
