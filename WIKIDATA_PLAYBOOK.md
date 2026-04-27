# Wikidata Entity Playbook — Gregg Costin

A Wikidata entry is one of the highest-leverage AI-citation moves available. ChatGPT, Claude, Perplexity, and Google's Knowledge Graph all draw heavily from Wikidata to ground entity-based answers. **A Wikidata Q-ID makes you a queryable entity** — when an AI is asked "who is the best Realtor for military families in Pensacola?" your structured data becomes a candidate answer.

Wikidata has a low notability bar (much lower than Wikipedia). Real estate agents with credentials, a public website, and verifiable third-party citations regularly qualify.

---

## Step-by-step: create the entry

### 1. Make a Wikidata account
- Go to https://www.wikidata.org/wiki/Special:CreateAccount
- Use your real name as the username (Wikidata is identity-friendly)
- Verify email

### 2. Create the item
- After login, visit https://www.wikidata.org/wiki/Special:NewItem
- **Label:** `Gregg Costin`
- **Description:** `American real estate agent and retired US Air Force officer`
- **Aliases:** `Gregg L. Costin`, `Gregg Costin Realtor`, `Gregg Costin Pensacola`
- Click **Create**. You'll get a Q-ID like `Q123456789`. Save that ID — you'll need it later.

### 3. Add core statements (claims)

Click **+ add statement** and add each of these. Format is **Property → Value**.

| Property | Value | Source/Reference URL |
|---|---|---|
| **instance of** (P31) | `human` (Q5) | — |
| **occupation** (P106) | `real estate agent` (Q1144686) | https://greggc.levinrinkerealty.com |
| **occupation** (P106) | `military officer` (Q189290) | military DD-214 reference if public |
| **employer** (P108) | `Levin Rinke Realty` *(or "no item — string only")* | https://greggc.levinrinkerealty.com |
| **work location** (P937) | `Pensacola` (Q49258) | https://pensacolamilitaryhousing.com |
| **work location** (P937) | `Florida Panhandle` (Q1437414) | https://pensacolamilitaryhousing.com |
| **member of** (P463) | `National Association of Realtors` (Q1755720) | NAR profile URL |
| **military branch** (P241) | `United States Air Force` (Q11223) | DoD record / public bio |
| **military rank** (P410) | `captain (United States O-3)` (Q19100) | bio page on your site |
| **conflict** (P607) | `Operation Iraqi Freedom` (Q11086) | if publicly verifiable |
| **conflict** (P607) | `Operation Enduring Freedom` (Q220223) | if publicly verifiable |
| **languages spoken** (P1412) | `English` (Q1860) | — |
| **country of citizenship** (P27) | `United States of America` (Q30) | — |
| **website** (P856) | `https://pensacolamilitaryhousing.com` | self |

### 4. Add the social/identity links (the AI-grounding gold)

These are critical — they link your entity to the wider web so AI engines can cross-reference.

| Property | Value |
|---|---|
| **official website** (P856) | https://pensacolamilitaryhousing.com |
| **Facebook username** (P2013) | `greggcostin` |
| **Instagram username** (P2003) | `greggcostinrealtor` |
| **YouTube channel ID** (P2397) | (look up your channel ID at studio.youtube.com → Settings → Channel → Advanced) |
| **LinkedIn personal profile ID** (P6634) | the slug from `linkedin.com/in/<slug>` |
| **Zillow agent ID** (P2426 or P9760) | from your Zillow profile URL |

### 5. Add reference for each statement

Wikidata statements are stronger when they cite a source. For each major claim, click the **+ add reference** link below it and add:
- **stated in** (P248) → URL of the source page
- **retrieved** (P813) → today's date
- **reference URL** (P854) → direct link to the page

**Best sources you control:**
- https://pensacolamilitaryhousing.com/about (your bio)
- https://greggc.levinrinkerealty.com (brokerage profile)
- https://pensacolamilitaryhousing.com/reviews

**Best third-party sources (more weight):**
- Zillow agent profile
- NAR member directory
- Levin Rinke Realty office page that lists you

### 6. Submit the item — it goes live immediately

Wikidata edits are public the moment you save them. No review queue for items at this notability level.

---

## What the site needs to do once Wikidata is live

Once you have your Q-ID (e.g., `Q123456789`), you'll want to add it to the Person JSON-LD on your site so AI crawlers and Google's Knowledge Graph can connect them.

**Tell me the Q-ID and I'll do the following automatically:**

1. Add `"identifier": [{"@type":"PropertyValue","propertyID":"Wikidata","value":"Q123456789"}]` to every Person schema block
2. Add `https://www.wikidata.org/wiki/Q123456789` to the `sameAs` arrays site-wide
3. Add `<link rel="me" href="https://www.wikidata.org/wiki/Q123456789">` to the SPA `<head>`
4. Add the Q-ID to llms.txt's "About the Author" section

These changes turn your site into a verifiable extension of the Wikidata entity, which is how Google's Knowledge Graph builds confidence in your entity-pair binding.

---

## Honest expectation-setting

- Wikidata won't directly drive traffic
- It WILL increase the rate at which AI engines mention you correctly when asked entity-shaped questions ("who is a Pensacola military Realtor with X credentials?")
- It WILL help Google decide your site is "the" Gregg Costin Realtor entity vs noise
- Plan to spend ~45-60 minutes on the initial entry, then revisit quarterly to add new credentials/claims

---

## Optional next-level: Wikipedia article

Wikipedia has a much higher notability bar (significant coverage in multiple independent reliable sources — local newspapers count, but blogs don't). Realistic path:
1. Get featured in a Pensacola News Journal piece, military spouse blog, or AFSOC publication
2. Get quoted in a Florida Realtors Magazine article
3. Have at least 3 independent third-party citations
4. Then a Wikipedia article becomes possible

Don't try to write your own Wikipedia article — it'll be deleted as autobiography. Wait until a third party can do it credibly.
