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
  "related": [{"href": "/...", "label": "..."}]              // 5-7 existing pages
}
PAGE-->
...body HTML...
```

## Writing spec (non-negotiable — this is what makes posts rank AND get cited by AI)

1. **Question-shaped H2s, each followed immediately by a 40–80 word direct answer**, then
   supporting detail. AI systems retrieve passages, not pages.
2. **Every statistic carries a named source and a data vintage**: "median sale price in
   32571 was $348K in July 2026 (Pensacola MLS)". Never invent numbers.
3. **Something only Gregg can say on every post**: a commute he's driven, client scenario
   with real math, gate/neighborhood detail, original observation. "Information gain" is
   what 2025-26 core updates reward.
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
