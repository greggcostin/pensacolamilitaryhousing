# SEO baselines

Point-in-time keyword exports used to track ranking movement over time. The blog
engine's MEASURE step compares current data against the newest file here and notes
gains/losses in the run report.

- `bing-keywords-2026-08-22.csv` — Bing Webmaster Tools keyword report, 3-month window
  ending Aug 22 2026. 334 queries, 30 clicks, 1.4K impressions, 2.19% CTR. Context at
  capture: Google (GSC) same window = 174 clicks / 24.7K impressions / avg pos 14.5;
  Bing AI Performance = 351 Copilot citations across 31 pages (leader:
  /va-disability-property-tax-florida at 119).

Naming: `<engine>-keywords-YYYY-MM-DD.csv`. Add a new export roughly monthly or when
strategy shifts; never overwrite an old baseline.
