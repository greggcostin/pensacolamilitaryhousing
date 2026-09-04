# Hero copy options, September 2026

Audit rows 36 (cro-02, cro-04). Three headline and subhead pairs per site, each a different angle.
Gregg picks or edits one per site; nothing ships until he does. Decision 8 in
`docs/AUDIT-DECISIONS-2026-09.md` keeps the current "#1" claim unqualified, so option A on the
military site is the "keep it" path and B and C are the alternatives.

Constraints every option meets: headline under 60 characters, one-sentence subhead, no em
dashes, no "dream home", "journey", "let me help you" or "trusted advisor", nothing that
characterizes an area or its residents.

## pensacolamilitaryhousing.com

**Today:** eyebrow "Retired USAF Combat Systems Officer, E-3 AWACS", headline built around
"Pensacola's #1 military relocation Realtor", CTA "Start Your PCS Search".

**What the audit found:** the headline is a credential claim, not a promise to the reader. A
service member with orders is asking one question on arrival: rent or buy, and what can I afford
on BAH. The hero does not answer it, and the first screen on a phone gives no number.

| | Headline | Subhead | Job it does |
|---|---|---|---|
| A | Pensacola's #1 military relocation Realtor | Eleven PCS moves of my own, a VA-loan practice built on BAH math, and a straight answer on rent versus buy before you sign anything. | Keeps the claim you chose to keep, and gives it a reader-facing reason underneath it. |
| B | Orders to Pensacola. Here is what your BAH buys. | Your pay grade, your base gate and the 2026 rates, turned into a real price range and the neighborhoods that reach it, by a retired USAF CSO who has done this move eleven times. | Answer-first. Leads with the number the reader came for and makes the affordability model the front door. |
| C | Rent or buy on this tour? Run the math first. | A three-year tour, zero-down VA financing and Escambia taxes change the answer; I will show you both columns before you commit to either. | Speaks to the undecided majority rather than the buyer who has already decided, and positions the site as the place you check before you choose. |

Recommendation: B. It is the only one that puts a number on the first screen, which is what the
BAH-to-mortgage guide, the rank-by-rank post and the rates page all now lead with. A is the safe
choice if the headline claim matters to you more than the question it answers.

## greggcostin.com

**Today:** H1 "Pensacola real estate, done with precision." Subhead is 64 words covering buying,
selling, 5.0-star service, certified negotiation, the Panhandle, Gulf Shores, Orange Beach and the
Baldwin County claim.

**What the audit found:** the H1 describes a manner, not an outcome, and the subhead carries the
whole site's positioning in one sentence a phone shows three lines of.

| | H1 | Subhead | Job it does |
|---|---|---|---|
| A | Buy or sell in Pensacola with a team that shows its work. | Neighborhood guides with real prices, 82 school reports on official grades, and a home search that returns what actually fits, from Perdido Key to Gulf Shores. | Points at the site's real depth, the guides and school pages, which is what separates it from the brokerage template sites. |
| B | The Pensacola market, explained before you decide. | Price bands by neighborhood, the official 2026 school grades, flood and insurance by street, and a 5.0-rated team that answers in plain language. | Positions the site as the reference a buyer or seller reads first, and makes the review score a supporting fact rather than the lead. |
| C | Pensacola to Gulf Shores, one team, licensed in both states. | The Costin Team at Levin Rinke Realty buys and sells across Escambia, Santa Rosa, Okaloosa and Baldwin counties, with the guides, school data and search tools to back every recommendation. | Leads with the two-state coverage nobody else in the market can claim, and names the counties so the geography is unambiguous. |

Recommendation: B. It is the civilian twin of the military option B, so the two homepages say the
same thing to two audiences, which is the standing rule for the two domains. C is the choice if
the Alabama license is the thing you most want a first-time visitor to know.

## What happens after you pick

The military headline lives in `src/App.jsx` (the homepage `Hero`), and its prerendered shell in
`src/routeSections.js`; the civilian H1 and subhead live in `civilian-site/index.html`. Both
homepage OG cards and the quick-answer copy reference the headline, so the change is one edit plus
`npm run og-images` on the military side and the OG generator on the civilian side, then the two
audit gates.
