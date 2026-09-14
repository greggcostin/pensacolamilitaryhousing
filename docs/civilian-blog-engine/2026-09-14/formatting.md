# Sitewide formatting / scannability audit

Generated 2026-09-14 by scripts/analyze-formatting.mjs.
Score 100 = highly scannable. Penalties: wall-of-text paragraphs (>85 words),
sparse headings (>220 words/section), sparse scan aids (>280 words per
list/table/facts box/figure/FAQ). Rows are sorted worst score first, so the
blog engine's DECIDE step should treat the top of this table as refresh
candidates: break up walls, add questions-as-headings, insert lists/tables
where data hides in prose.

| Page | Score | Words | Wall paragraphs | Headings | Scan aids |
|---|---|---|---|---|---|
| C:\Users\gregg\pensacolamilitaryhousing\artifacts\civilian-blog-engine\2026-09-14\release\gc\blog\what-moves-mortgage-rates | 100 | 2934 | 0 (max 79w) | 13 (226w/ea) | 20 (147w/ea) |

## Reading the numbers
- **Wall paragraphs**: paragraphs over 85 words; "max" is the single longest.
- **Headings**: h2+h3 count and average words per section. Over ~250 means
  readers scroll without a signpost.
- **Scan aids**: lists + tables + facts boxes + FAQ items + figures, and the
  average words between them.
