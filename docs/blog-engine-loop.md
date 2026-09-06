# The blog engine loop, evidence policy v2

Run node scripts/blog-weekly.mjs and read content/blog/weekly-plan.json before selecting work. Use --offline for a reproducible replay; --refresh-suggestions explicitly refreshes discovery.

The [operating policy](blog-engine-evidence-policy.md) defines measurement windows, uncertainty, source packs, reader tasks, contextual links, outcome events and bounded learning. Configured models, the one-article maximum and autoPublish remain authoritative.

The [September 5 computational audit](blog-engine-audit-2026-09-05/report.md) compares the implementation with baseline a621c4c. It is not a blinded model rerun or evidence of increased traffic.

1. Load operational safeguards and eligible performance rules.
2. Measure sources with property, cohort and window metadata. Record unavailable data.
3. Choose at most one substantive task. Verify expired facts and source gaps first.
4. Research using the configured model; persist and independently review the pack.
5. Write to the reader's decision and useful original contribution.
6. Validate sources, arithmetic, structure, images, links and build output.
7. Stage or publish according to the ledger and session authorization.
8. Review comparable search and inquiry cohorts. Keep inconclusive results; do not promote unsupported correlations.

## Current boundaries

The audit's Semrush request returned insufficient API units. No callable Clarity connector was available. No live GA4/CRM outcome cohort was read. Empty outcome data remains unavailable.

The Sep 4 Google files retain counts, but exact selected date ranges and filters were not saved. Add them from the source report when available. Never call the counts monthly or treat an overlapping later export as an independent test.
