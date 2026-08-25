# Civilian Blog Contract (greggcostin.com/blog)

Every post is a `content/civilian-blog/<slug>.fragment.html` file: a `<!--PAGE {json} PAGE-->`
header followed by body HTML. `node scripts/civilian-blog-factory.mjs [slug]` builds it into
`civilian-site/blog/<slug>.html`, rebuilds the index, syncs sitemap + llms.txt, and generates
the OG card. Deploy with `npx wrangler pages deploy civilian-site --project-name greggcostin --branch main --commit-dirty=true`.

## PAGE header fields (all required unless noted)
- `title` (SEO title, 65 chars max), `description` (120-165 chars), `slug`, `h1`, `lead`, `keywords`
- `datePublished` "YYYY-MM-DD" (immutable once published); `dateModified` optional
- `figure`: `{src, webp, alt, caption, width, height}` — src under `/images/`, file must exist in
  `civilian-site/images/`, fetched via `scripts/fetch-stock-image.mjs --dir civilian-site/images`,
  VIEWED (eye test) before use, credit recorded in the ledger (factory appends required credits)
- `faqs`: 4+ `{q, a}` — answers 40-90 words plain text, mirrored into FAQPage schema
- `ogTitleLines` optional: 1-2 short lines for the OG card (default: h1 split)

## Hard gates (factory throws; never bypass)
- NO em dashes anywhere (worker inquiryType strings are not present on blog pages, so zero tolerance)
- 1100+ body words; 4+ links (internal civilian paths and/or the two sites); 4+ FAQs
- figure file exists; div balance; valid JSON-LD; title/desc lengths

## Editorial rules
- Audience: civilian FL + coastal AL buyers, sellers, owners. No BAH/PCS/VA framing
  (one cross-link to a pensacolamilitaryhousing.com guide is welcome where genuinely relevant).
- Topics: rates, economy, finance, Florida market and insurance, taxes, local Gulf Coast angles,
  and current events that touch real estate. For current-events posts, research first (WebSearch)
  and cite named sources in-text; NEVER state a perishable number (today's rate, this month's
  median price) without a source found during that session. When in doubt, write mechanics, not
  numbers. No invented statistics, people, or testimonials.
- Scannability from birth: h2 sections, short paragraphs (under ~80 words), lists for enumerations.
- Voice: plain-English expert, first-person-plural team voice.

## Cadence
Two posts weekly: Monday and Thursday, 6:04am (scheduled task `civilian-blog-engine`).
Draft-first: the engine writes the fragment + builds it locally and reports; publish = deploy
after Gregg's approval, unless config in `content/civilian-blog/engine-config.json` sets
`"autoPublish": true`.
