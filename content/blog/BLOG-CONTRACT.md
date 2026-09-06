> Evidence policy v2: read docs/blog-engine-evidence-policy.md and content/blog/weekly-plan.json before commissioning a draft. New substantive work carries editorial.version=2, readerTask, originalValue, conversionGoal and evidenceFile. Both factories validate the sourced pack. Model and image standing orders remain in force. A passing score is not proof of accuracy or search performance.

# Blog fragment contract — content/blog/<slug>.fragment.html

Every post is a fragment file here; `node scripts/blog-factory.mjs` builds it into
`public/blog/<slug>.html`, rebuilds the /blog index, appends the sitemap entry, and
registers it in `ledger.json`. Run `npm run og-images` after building new posts.

## File shape

```
<!--PAGE
{
  "slug": "kebab-slug",
  "title": "SEO title ≤62 chars, keyword front-loaded",
  "description": "150-160 char meta description",
  "keywords": "comma, separated",
  "category": "PCS | VA Loans | Neighborhoods | Market | Buying | Selling | Living Here",
  "datePublished": "YYYY-MM-DD",
  "dateModified": "YYYY-MM-DD",   // == datePublished for new posts; bump ONLY on substantive updates
  "readTime": "8 min",
  "h1": "On-page headline (entities ok)",
  "lead": "1-2 sentence standfirst",
  "excerpt": "Card text for the /blog index (1-2 sentences)",
  "targetKeywords": ["primary query", "secondary query"],   // the engine measures these
  "faq": [{"q": "...", "a": "2-4 sentences, may contain one <a> link"}],
  "related": [{"href": "/...", "label": "..."}],             // 5-7 existing pages
  "quickAnswer": "2-4 dated declarative sentences that restate a figure already in the post, with its source. REQUIRED on every post modified on or after 2026-09-04 (GEO standing rule); the factory renders it as the first block after the lead so AI engines quote it.",
  "shareHook": "optional: one sentence a reader would paste when sharing this, and who it is for (press, base FB groups, a client). Surfaces in the run report.",
  "figure": {                                    // REQUIRED — factory refuses to build without it
    "src": "/images/blog/....jpg",               // must exist on disk (fetch-stock-image.mjs or reuse /images/topics|blog|bases|communities)
    "alt": "literal description of what the photo shows",
    "caption": "one line tying the image to the post",
    "pos": "center 30%"                          // optional object-position for the 16:9 crop
  }
}
PAGE-->
...body HTML...
```

## Images (standing rule, Aug 2026)

- **Every post ships a hero photo** (`figure` above) that is genuinely relevant — the real
  place, the real aircraft, the real subject. No generic decoration.
- **Sourcing (standing order, Aug 22 2026): FETCH NEW imagery for every new post** —
  `node scripts/fetch-stock-image.mjs "<query>" <slug>-hero --candidates 3
  --dir public/images/blog` (commercial-safe licenses only; attribution recorded in
  `content/blog/image-credits.json`). VIEW candidates with the Read tool before picking —
  file titles lie. Finalize with `--finalize`, then `npm run modern-images`. Library
  reuse (`/images/topics|blog|bases|communities/`) is the fallback only when 2-3 query
  variants yield nothing that passes the eye test; log the substitution.
- **Credits:** the factory auto-appends the license credit to the figcaption from the
  ledger. CC-BY / CC-BY-SA images MUST keep that visible linked credit; public-domain DoD
  imagery carries a courtesy "U.S. Navy photo" style line.
- **Inline figures** for 2,500+ word posts: 1-2 of
  `<figure class="figure-band"><img src="..." alt="..." loading="lazy"><figcaption>...</figcaption></figure>`
  at natural section breaks. The factory rewrites them to `<picture>` (AVIF/WebP) + credit
  form automatically — authors write the plain `<img>`.
- Captions are prose: the no-em-dash rule applies.

## Writing spec (house standards; search performance is measured separately)

1. **Question-shaped H2s, each followed immediately by a 40–80 word direct answer**, then
   supporting detail. AI systems retrieve passages, not pages.
2. **Every statistic carries a named source and a data vintage**: "median sale price in
   32571 was $348K in July 2026 (Pensacola MLS)". Never invent numbers.
3. **An original, useful contribution on every post**: a sourced checklist, documented
   local observation, reproducible calculation or comparison. Personal experience requires
   a real record. Label hypothetical scenarios. Never invent a commute, client, result
   or quotation to satisfy a style score.
4. **1,200–5,000 words.** Mega-guides 4,000+; decision posts 1,500-2,500; news reactions 1,200+.
5. **6–12 internal links** woven into prose — into base/community hubs, /bah-rates,
   /pcs-home-search, /whats-my-home-worth, /va-loan-guide, and sibling posts. No orphans.
6. **Audience**: military AND civilian. Military posts stay in Gregg's lane; civilian
   posts (retirees, remote workers, first-time buyers, investors) widen the AI
   recommendation surface — always with the local-expert angle, never generic national advice.
7. Site CSS classes available: h2/h3/p/ul/ol/strong, `.facts` grid, `.bah-wrap > table.bah-table`,
   `.cta`, `.inq-cta` (with `data-inquiry-open data-inquiry-type="..."` — exact worker strings only:
   "PCS / Relocation — Buying", "PCS / Relocation — Selling", "Selling My Home",
   "VA Loan Questions", "Investment Property", "General Question").
8. End with a Sources and References section (`<h2>` + `<ul>` of official links) when the
   post makes factual claims.
9. **Never fabricate**: prices, rates, school grades, laws, or client stories. Hedge or omit.
10. **NO EM DASHES: standing rule (Gregg, Aug 2026).** Never use the em dash character or
    `&mdash;` anywhere in a post's prose: not in the title, lead, excerpt, FAQ answers,
    or body. Rewrite with commas, colons, periods, or parentheses; use plain hyphens for
    ranges ("$280K-$315K"). Do not substitute double hyphens or numeric entities. The
    factory refuses to build any fragment containing one. SOLE EXCEPTION: the
    `data-inquiry-type="..."` attribute value must match the contact worker's exact
    strings, which contain an em dash (e.g. "PCS / Relocation — Buying"); write the
    literal character there, never an entity workaround.
11. **No wall paragraphs (standing rule, Sep 2026).** The factory refuses any paragraph
    over 110 words and warns over 85. Target zero over 85 and a 90+ score in
    `scripts/analyze-formatting.mjs` before staging. Split by idea, convert data-bearing
    prose to a list or `.bah-table`, add a question-shaped h3 so no section runs 250+
    words unbroken. Structure-only edits never change facts, hedges, H2s, FAQ or links.
12. **Correct errors, not brands.** When the research shows a third party publishing a
    wrong figure, state the wrong figure and the right source; do not name the site or
    company. Naming a competitor is Gregg's call in review, never the machine's.
13. **Quick answer first.** Every new or refreshed post opens with the `quickAnswer`
    block: the one number a searcher came for, dated, attributed, in plain declarative
    sentences. If the post cannot state its key figure in two sentences it is not ready.

## SEO checklist — standing rule, every post (factory enforces the starred items)

- ★ `targetKeywords` present; primary keyword appears in the title (front-loaded), in the
  H1, in the first 100 words of the body, and reads naturally in the slug.
- ★ Title ≤65 chars; meta description 120-165 chars containing the primary keyword.
- ★ 6+ internal links minimum (spec above says 6-12; mega-guides 25+).
- ★ Body 1,100+ words minimum (decision posts 1,500-2,500; mega-guides 4,000+). Depth means
  covering the full question-space a searcher has, never padding.
- ★ 4+ FAQ items minimum (6-10 for guides), phrased like People-Also-Ask questions.
- H2s are question-shaped and match real search queries; each opens with a 40-80 word
  direct answer (this is both the AI-citation format and the featured-snippet format).
- Secondary keywords appear in at least one H2 each; no keyword stuffing — natural prose.
- FAQ questions mirror People-Also-Ask phrasing for the topic.
- Excerpt is click-worthy on the /blog index and in SERPs.
- Stats carry named sources + vintage (both an E-E-A-T and an AI-citation signal).
- Related links + hub links wired so the post is never an orphan.
- After build: run `npm run og-images` so the post has its own social card.

## Evidence and reader task, version 2

The PAGE metadata includes:

    "editorial": {
      "version": 2,
      "readerTask": "The concrete decision this reader needs to make",
      "originalValue": "The reusable checklist, comparison or documented calculation",
      "conversionGoal": "purchase-budget",
      "evidenceFile": "content/blog/research/article-slug.json"
    }

Bind load-bearing prose with data-claim ids and visible source links. Record uncertain facts, population and eligibility limits, and the actual models. A source list alone does not validate claims. The validator never replaces independent reading of the original sources.

The factory supplies accessible sharing controls and a topic-specific tool, companion guide and inquiry path. Keep the useful answer available before the inquiry. Do not promise savings, rankings or client results. New articles still follow the image, formatting and one-post rules.
