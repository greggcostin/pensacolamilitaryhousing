# Audit decisions, September 2026

Owner decisions on the dual-site forensic audit (`docs/DUAL-SITE-AUDIT-2026-09.md`, 185 findings
across 63 roadmap rows). Decided by Gregg Costin on 2026-09-03 after every row was re-verified
against the repo and both live sites.

**A decision recorded here is closed.** A later audit pass that re-raises one of these findings
should cite this file and move on, unless the underlying facts have changed.

| Row | Finding ids | Decision |
|---|---|---|
| 7 | eeat-03 | Remove every AreaVibes citation and re-source the commute and cost figures |
| 8 | eeat-06 | The Zillow standing is **top 0.8%**; the 5% instances go. The `#1 military relocation Realtor` H1 stays **unqualified**, with no basis sentence |
| 32 | url-05 | **Accept the two redirect hops** on legacy `.html` URLs over http/www. Not worth a manual Redirect Rule edit in two Cloudflare zones |
| 33 | perf-08 | Re-encode the existing Pace/Milton image from its 1600px original rather than wait for a drone replacement |
| 34 | mob-01 | **Declined permanently.** The 56px mobile header target is refused: every nav tab stays visible and the header stays sticky. Gregg built the drawer, used it, and reversed it |
| 39 | schema-08 | Pull the real Okaloosa County FLDOE 2026 grades from the same release used for districts 17 and 57 |
| 44 | gc-content-06, synergy-04, kw-02 | **Build** the Destin and Niceville civilian neighborhood pages rather than demote their cards |
| 47 | geo-05 | **Google Business Profile website field stays where it is.** No change |
| 53 | gc-content-07 | **Build** civilian pages for all four unbacked areaServed cities: Niceville, Crestview, Destin, Foley |
| 55 | cro-12 | Gate the PCS lead-magnet PDF with a **signed-URL Cloudflare Function** in this repo, not a token from the contact worker |
| 56 | media-03 | Gregg **is** Part 107 certified, but wants no Part 107 line on either site. Do not add one |
| 60 | gc-content-09 | **Keep** the `top-producing Baldwin County agent` claim as written. Affirmed after being told it carries no source in the repo |
| 63 | ux-06 | **Skip** the cream reading-band A/B on `/va-loan-guide`. Items (a) through (c) of that row still ship |
| 5, 26 | list-01, list-02, list-05 | **Revised 2026-09-04.** 825 Bayshore **stays at its own URL**, `825bayshore.greggcostin.com`, served by the existing `bayshore-825` Pages project. Its source is now in the repo at `sites/825bayshore/` and under the em-dash gate, and deploys with `npx wrangler pages deploy sites/825bayshore --project-name bayshore-825`. The form contract is fixed. Do not move it to `greggcostin.com/listings/` |
| 15 | eeat-08 | Identify the military and PCS reviews from the live review text rather than from a list Gregg maintains. He approves the six before they ship |
| 36 | cro-02, cro-04 | Draft three headline and subhead pairs per site for Gregg to pick from |
| 40 | data-02 | Commute matrix convention: **Google Maps, typical traffic, 07:00 on a Tuesday, measured to the specific base gate**, stamped with a verification date |
| 45, 57, 61, 13 | multiple | All four remaining cornerstone builds are wanted: GC `/market` on PAR statistics, GC `/waterfront` and `/new-construction`, the GC `/sold` gallery plus featured listings, and the PMH assumable-VA-loan list. Each is gated on data or assets from Gregg |

## Still with Gregg

These have no decision to make; they need a value, a click or an asset. Kept here so the list has
one home.

**To paste back**

- What the Zillow top 0.8% is measured on (reviews, sales volume, metro) and the date pulled
- Forbes Global Properties profile URL, for the `sameAs` set
- Bing Webmaster Tools `msvalidate.01` token for greggcostin.com
- Microsoft Clarity project id for greggcostin.com (PMH's is `wm7ddbciup`)
- Florida DBPR license number and Alabama AREC license number, both from the official lookups
- 825 Bayshore MLS list date and sold price and days on market
- Partner profile URLs: VeteranPCS, TIER 1 PCS, M.O.R.E. Network, Levin Rinke Realty, Forbes

**Dashboard work**

- GA4 (`G-W29GHBK38M`): turn off Enhanced Measurement `Page changes based on browser history
  events`, add both domains to unwanted referrals, create the Internal Traffic rule, register
  `cta_location` / `inquiry_type` / `link_domain` / `to_site` as custom dimensions, and confirm
  whether the `GT-WVGM66XS` container is still used by Google Ads
- Cloudflare: Email Address Obfuscation **off** in both zones, review Bot Fight Mode on
  pensacolamilitaryhousing.com, Speed Brain **on** for greggcostin.com
- Cloudflare Email Address Obfuscation is what still mangles the 825 Bayshore email address on
  serve; the repo source is already correct, so that toggle is the only thing left on it
- Bing Webmaster Tools keyword exports, for the position baselines on the BAH and
  homes-for-sale clusters
- Website field set to greggcostin.com on Zillow, Homes.com, LinkedIn, Realtor.com, Facebook,
  Instagram and Linktree

**Assets and data for the four cornerstone builds**

- Pensacola Association of Realtors monthly statistics with source URLs
- Drone imagery for the waterfront page, and the list of builders and communities actually sold in
- Closed-sale addresses, photos and permission for the sold gallery, plus featured inventory detail
- The weekly VA-assumable listing feed: address, list price, assumed rate
