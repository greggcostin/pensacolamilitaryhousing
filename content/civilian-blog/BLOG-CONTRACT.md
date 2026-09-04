# Civilian Blog Contract (greggcostin.com/blog)

Every post is a `content/civilian-blog/<slug>.fragment.html` file: a `<!--PAGE {json} PAGE-->`
header followed by body HTML. `node scripts/civilian-blog-factory.mjs [slug]` builds it into
`civilian-site/blog/<slug>.html`, rebuilds the index, syncs sitemap + llms.txt, and generates
the OG card. Deploy with `npx wrangler pages deploy civilian-site --project-name greggcostin --branch main --commit-dirty=true`.

This contract has parity with the military one (`content/blog/BLOG-CONTRACT.md`) as of
Sep 2026: the same scannability, measurability and GEO gates, one shared lessons file
(`content/blog/learnings.json`), one scorer (`scripts/score-post.mjs`), one retro
(`scripts/blog-retro.mjs`). Only the audience and the link targets differ.

## PAGE header fields
Required on every post:
- `title` (SEO title, 65 chars max, primary keyword front-loaded), `description` (120-165 chars,
  contains the primary keyword), `slug`, `h1`, `lead`, `keywords`
- `datePublished` "YYYY-MM-DD" (immutable once published); `dateModified` on real change only
- `figure`: `{src, webp, alt, caption, width, height}`: src under `/images/`, file must exist in
  `civilian-site/images/`, fetched via `scripts/fetch-stock-image.mjs --dir civilian-site/images`,
  VIEWED (eye test) before use, credit recorded in the ledger
- `faqs`: 4+ `{q, a}` (6+ preferred): questions phrased as People-Also-Ask, answers 40-90 words
  plain text, mirrored into FAQPage schema

Required on posts dated 2026-09-07 or later (factory refuses without them):
- `targetKeywords`: 2-5 real queries, primary first. The engine measures the post by these
  (Bing Webmaster API page + query stats via `scripts/blog-measure.mjs`), so a post without
  them is invisible to the loop.
- `quickAnswer`: 2-4 dated declarative sentences, under 85 words, restating a figure already
  in the post with its source. Rendered as the first block after the lead so AI engines quote
  it (geo-03). If the post cannot state its key figure in two sentences it is not ready.
- `takeaways`: 3-5 one-line bullets, rendered as a Key takeaways box after the hero image.

Optional, strongly encouraged (the scorer rewards them):
- `shareHook`: one sentence a reader would paste when sharing, and who it is for.
- `perishables`: `[{claim, expires, source}]` for every dated figure that goes stale (a rate, a
  deadline, a median, a premium). `scripts/blog-retro.mjs` flags the post for refresh the day
  one expires. Declare the NFIP-style deadlines here, not just in prose.
- `ogTitleLines`: 1-2 short lines for the OG card (default: h1 split).

## Hard gates (factory throws; never bypass)
- NO em dashes anywhere (no worker inquiryType strings appear on blog pages, so zero tolerance)
- 1100+ body words; 4+ links (internal civilian paths and/or the two sites); 4+ FAQs
- no paragraph over 110 words (warns over 85; `audit-civilian` flags 80+)
- figure file exists; div balance; valid JSON-LD; title/desc lengths
- posts dated 2026-09-07+: targetKeywords, quickAnswer (2-4 sentences, figure, under 85 words), takeaways (3+)

## Quality gate (engine enforces before staging; the factory only warns)
`node scripts/score-post.mjs <slug> --site gc --gate` must report **80+**. It scores six things
and prints the fix list:
1. **Structure** (25): 60%+ of H2s are the question a searcher types, each followed by a
   15-90 word direct answer; zero walls; a list, table, figure or FAQ every ~250 words.
2. **Evidence** (20): 60%+ of numeric sentences name their source in the sentence, 50%+ carry
   a vintage (month/year); 4+ distinct named sources; a Sources line.
3. **Local specificity** (10): 8+ Gulf Coast place, county, base or ZIP mentions per 1,000
   words. A civilian post about rates still lands on Pensacola, Gulf Breeze, Baldwin County.
4. **SEO** (20): primary keyword in title, H1, first 100 words, slug and description; 8+ links;
   6+ PAA-shaped FAQs with 40-95 word answers.
5. **GEO** (15): quickAnswer, takeaways, 3+ quotable sentences (figure + source + date in under
   35 words), shareHook, perishables declared when the post states perishable figures.
6. **Shareability** (10): at least one table, a checklist (ordered steps or bold-led bullets),
   3+ imperative action items, a worked example with real numbers, and something only this
   team can say (a client scenario, a commute, what we would do).
Then `node scripts/analyze-formatting.mjs` and confirm the post's row reads 90+ (lesson L004).

## Editorial rules
- Audience: civilian FL + coastal AL buyers, sellers, owners. No BAH/PCS/VA framing
  (one cross-link to a pensacolamilitaryhousing.com guide is welcome where genuinely relevant).
- Topics: rates, economy, finance, Florida market and insurance, taxes, local Gulf Coast angles,
  and current events that touch real estate. For current-events posts, research first (WebSearch)
  and cite named sources in-text; NEVER state a perishable number (today's rate, this month's
  median price) without a source found during that session. When in doubt, write mechanics, not
  numbers. No invented statistics, people, or testimonials.
- Every post ships one reusable asset a reader would screenshot or forward: a comparison table,
  a numbers table, a checklist, a decision matrix, or a worked example. Text alone is not a post.
- H2s are the questions people type (docs/topic-radar.md and the run's search landscape supply
  them); the first sentence under each H2 answers it. FAQ questions mirror People-Also-Ask.
- Scannability from birth: short paragraphs (under ~80 words), lists for enumerations, a table
  for anything with three or more numbers.
- Voice: plain-English expert, first-person-plural team voice. Correct a third party's error
  without naming the third party (L005).
- Every post links into the civilian money pages (/buy, /sell, /search, /contact, /resources/*,
  the neighborhood pages) and at least one sibling post; the engine adds inbound links from the
  matching hub page so no post is an orphan (`content/blog/inbound-link-plan.json`).

## The loop this post lives in
1. LEARN: `content/blog/learnings.json` (shared with the military engine) is read first; active
   lessons are binding.
2. MEASURE: `node scripts/blog-measure.mjs --site gc` pulls Bing Webmaster page + query data for
   every post (greggcostin.com is verified in the same Bing account) and writes
   `content/measure/opportunities-gc.json`.
3. DECIDE: `content/blog/refresh-queue.json` (from `scripts/blog-retro.mjs`) outranks the topic
   queue; `docs/topic-radar.md` (from `scripts/topic-miner.mjs`) outranks guessed topics;
   a current-events override still wins the week it happens.
4. WRITE to this contract, score 80+, format 90+, build, audit-civilian clean.
5. RETRO: `node scripts/blog-retro.mjs --site gc` after every run; new lessons with evidence go
   into learnings.json.

## Cadence
Two posts weekly: Monday and Thursday, 6:04am (scheduled task `civilian-blog-engine`).
Draft-first: the engine writes the fragment + builds it locally and reports; publish = deploy
after Gregg's approval, unless config in `content/civilian-blog/engine-config.json` sets
`"autoPublish": true`.
