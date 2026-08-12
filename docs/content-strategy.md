# Content & Search Strategy — PensacolaMilitaryHousing.com

Written Aug 12, 2026 from a three-track research sweep: (1) Semrush-verified teardowns of
the winning real-estate content programs, (2) AI-search citation research (evidence-tiered),
(3) the 2025–2026 Google algorithm record. Companion to marketing-ops.md.

---

## 0. The one broken thing that gates everything else

**Blog posts have no URLs.** Opening a post swaps React state (no pushState), the body
arrives by JS fetch, the API worker was deleted (404s → hardcoded fallback), and the static
/blog page crams all six posts into ONE URL with one title tag. AI crawlers (GPTBot,
ClaudeBot, PerplexityBot) do not execute JavaScript at all — server-log studies across 500M+
fetches show zero JS execution — so the client-rendered blog is invisible to every AI system
except Google's. **No content program matters until posts are individual static pages.**

Fix (extends the existing page factory): `/blog/<slug>` static pages with BlogPosting +
Person schema, byline → author page, sitemap + llms.txt append, IndexNow ping on deploy.
Migrate the 6 starter posts first — they're already written.

## 1. What the winners actually do (verified Aug 2026, Semrush)

| Program | Model | Organic/mo |
|---|---|---|
| MilitaryByOwner | Base hub pages + BAH calculator (their #2 asset: 14.1K/mo) + 12-16 staff posts/mo | 128K |
| Raleigh Realty (Ryan Fitzgerald) | ~82 "Moving to [City]" mega-guides, ~4 posts/mo, MOSTLY REFRESHES; $200M closed from organic (self-reported) | 73K |
| VeteranPCS | One template ("What Military Bases Are in [State]?") × 25 states = 80% of traffic | 16K |
| Max Real Estate Exposure | 2015-era national-evergreen agent blog | **collapsed 138K→2.7K** (HCU 2023) |
| panhandlepcs.com | ~1 templated post/DAY on Carrot | **430/mo** |
| bemoregroup.net | 6-7 Wix posts/mo | **~0** (2 keywords) |

**The lesson: volume doesn't rank in 2026.** Daily templated posting earns 430 visits/mo;
national evergreen advice on an agent domain was annihilated by the Helpful Content system.
What survives and compounds: **deep local assets welded to entities and tools, refreshed on
a discipline.** Both local "high-velocity" competitors are harvesting approximately nothing —
the market's mega-guide slot is open.

## 2. The five post archetypes that win (in priority order for this site)

1. **"Moving to / Living in [Place]" mega-guide** — 4,500-5,000 words, 15-20 question-shaped
   H2 chapters, cited stats, 30+ internal links into base/community/money pages, embedded
   search + valuation CTAs, refreshed annually. This is Raleigh Realty's entire engine.
   *Site gap: doesn't exist yet. Highest priority.*
2. **Local decision posts** — "Best neighborhoods for [audience]," "[Place] vs [Place],"
   "Pros and cons of living in [Place]." Bottom-funnel judgment content portals can't fake.
   *Site has 3 vs-pages; needs the audience-specific and pros/cons layers.*
3. **Entity-set completeness pages** — one strong page per base/community, 100% coverage of
   the finite list. *Site already strong here (7 bases, 19 communities, gates, lodging).*
4. **Living tool/stats pages** — calculator, rates, annual forecast. *BAH calculator live;
   add a quarterly "Pensacola military housing market" stats page.*
5. **Citable local data study** — the only content that earns links while you sleep.
   E.g., **"BAH vs. actual cost of owning, by Pensacola-area ZIP, 2026"** — pre-crunched
   numbers PNJ/WEAR/military pubs can cite. One per quarter maximum.

**The failed archetype (do not build):** generic national evergreen advice ("how to
forward mail when you move"). That's what collapsed 98% post-2023.

## 3. Cadence — the honest answer

**4–8 substantive content units per month, where refreshes count.** Specifically:

- **2 net-new deep posts/month** (archetypes 1–2), 1,200–4,500 words each
- **2–3 substantive refreshes/month** of the existing 78 pages (update stats, add an FAQ,
  new photos, re-verify facts — then and only then bump dateModified). Raptive's May-2026
  core-update winners averaged 7+ content updates/month and content age under 24 months.
- **1 data study or stats-page overhaul per quarter**
- **Annual scheduled refreshes**: BAH pages (January, when rates drop), funding-fee page,
  every "2026"-titled page rolls to 2027.

Refreshed URLs move in days-to-weeks (existing crawl/trust signals); new URLs take months.
With 78 pages already indexed, **the refresh program is the fastest lever on the site.**
This cadence is also squarely inside Google's scaled-content-abuse safe zone: the violation
is templated volume without value, not AI-assisted drafting with real editorial review and
local specificity.

## 4. Writing spec — every post, so Google AND the AI engines can use it

- **Question-shaped H2s with a 40–80-word direct answer immediately below each** (RAG
  systems retrieve passages, not pages; the Princeton GEO study: quotations + statistics +
  named sources = 30–40% generative visibility lift).
- **Stats carry a named source and a data vintage**: "2026 BAH for FL064, E-5 with
  dependents: $1,863 (DoD DTMO)."
- **Something only Gregg can say, on every page**: commute test, gate detail, client
  scenario with numbers, original photo, BAH math. "Information gain" is what the March
  and May 2026 core updates paid.
- **Byline → author page** with FL license number (verifiable at myfloridalicense.com),
  USAF record, transaction history, Person schema with sameAs to Zillow/LinkedIn/GBP.
  Real-author content demonstrably beat brand-anonymous content through every 2025-26 update.
- **6–12 internal links wired into the hubs** (base pages ↔ posts ↔ money pages). Orphan
  posts are the documented failure mode; the site is already hub-shaped — use it.
- **FAQ section** (rich-result display was retired May 2026, but FAQ content matches AI
  retrieval shapes; keep the markup, expect nothing from the SERP feature).
- **Visible "Updated [Month Year]" in the HTML** — non-Google AI crawlers can't read JS or
  JSON-LD reliably; ~50% of AI citations go to content under 13 weeks old.

## 5. AI-search layer — what's evidence-backed vs hype

**Do (evidence-backed):**
- Static HTML for everything that matters (done — the 78 pages ARE the AI surface).
- Allow OAI-SearchBot, Claude-SearchBot, PerplexityBot in robots.txt (verify — blocking
  the search bots removes you from ChatGPT/Claude/Perplexity answers).
- **Bing Webmaster Tools** — Copilot is fully Bing-grounded and it's the only Bing
  indexation check. Free, one hour.
- **Mentions over backlinks**: brand mentions correlate 0.664 with LLM visibility vs 0.218
  for backlinks (Seer, 300K keywords). Get listed on **Three Best Rated and Expertise.com**
  — BrightLocal's 800-query ChatGPT study found those two = 42% of directory citations
  while Yelp/Facebook/Maps appeared ZERO times. Local press via the data study. Contributor
  bylines where possible.
- **Reviews**: ChatGPT's local picks average ~4.3 stars and businesses under ~150 reviews
  rarely get named. 49 Google + 23 Zillow today → the review engine (already automated)
  should push toward 150+.
- **Measurement**: GA4's native "AI Assistant" channel (shipped May 2026) + a custom channel
  group regex adding Perplexity (`chatgpt\.com|perplexity\.ai|claude\.ai|gemini\.google\.com|copilot\.microsoft\.com`);
  GSC's new "Generative AI" performance report (June 2026); a monthly manual prompt panel —
  ask ChatGPT/Perplexity/AI Mode the ten money prompts ("best realtor for military moving
  to NAS Pensacola," "VA loan Pensacola," "BAH E-6 Pensacola what can I afford") and log
  who gets cited. AI referrals are few but hot (~10-16% signup CVR in benchmarks) and
  35-70% arrive referrer-less, so measured AI traffic is a floor.

**Skip (hype):** llms.txt as a visibility play (97% of files get zero traffic; Google
ignores it — keep ours, expect nothing); adding schema types expecting citation lift
(Ahrefs causal test: zero uplift; keep schema for entity disambiguation only); Wikidata
expansion for a solo agent (no evidence at this scale); buying backlinks for LLM visibility;
faking dateModified (treated as a trust-negative).

## 6. Video (when ready, not before)

Relocation queries ("moving to Pensacola") trigger video carousels ABOVE blue links — a
YouTube video + the mega-guide = two slots on the same SERP. Format that works: "Moving to
[Place]" guides, neighborhood deep-dives, monthly market updates, pros/cons. Benchmark:
top-3 YouTube for "moving to [suburb]" in 3-6 months of consistent publishing. Embed each
video on its matching page with VideoObject schema. Be More Group's channel is the only
local military real-estate video presence — still uncontested.

## 7. First 90 days (concrete)

**Month 1 — fix the pipe + first assets**
1. Blog pipeline: static /blog/<slug> pages via factory; migrate the 6 existing posts;
   author-page upgrade (license #, service record, Person schema).
2. Bing Webmaster Tools + GA4 AI channel group + robots.txt AI-bot audit.
3. Publish: **"Moving to Pensacola: The Military Family's 2026 Guide"** (the cornerstone
   mega-guide) + refresh 2 existing pages.

**Month 2 — the decision layer**
4. Publish: "Best Pensacola-Area Neighborhoods by Rank & BAH (E-1 to O-6)" + "Living in
   Navarre: Pros & Cons from a Military Realtor." Refresh 3 pages.
5. Three Best Rated + Expertise.com listings; review-velocity push continues.

**Month 3 — the citable asset**
6. Publish the data study: "BAH vs. the Real Cost of Owning, by Pensacola ZIP (2026)" —
   pitch to PNJ, WEAR, InWeekly, military pubs. Start the quarterly market stats page.
7. First monthly AI prompt-panel log; review GSC Generative AI report.

Then repeat the monthly rhythm (§3) and complete the "Moving to [X]" set: Gulf Breeze,
Navarre, Pace, Milton, Crestview, Fort Walton Beach, Niceville — one per month, each
refreshed annually thereafter.
