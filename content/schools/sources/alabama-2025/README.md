# Alabama school accountability, 2024-2025

Downloaded September 6, 2026 from the Alabama State Department of Education's [School Performance page](https://www.alabamaachieves.org/reports-data/school-performance/). These are the official fall 2025 state accountability files, labeled **2024-2025**; they are not 2025-2026 Florida grades.

- `letter-grades.xlsx`: [2024-2025 State Accountability Letter Grades](https://www.alabamaachieves.org/wp-content/uploads/2025/11/RD_SP_20251113_2024-2025StateAccountabilityLetterGrades_v1.xlsx), sheet `State Letter Grades`.
- `indicator-scores.xlsx`: [2024-2025 State Accountability Indicator Scores](https://www.alabamaachieves.org/wp-content/uploads/2025/11/RD_SP_20251113_2024-2025StateAccountabilityIndicatorScores_v1.xlsx), sheet `State Indicators Scores`.
- Interpretation: [Fall 2025 State Accountability Technical Guide](https://www.alabamaachieves.org/wp-content/uploads/2025/10/RD_SP_20251021_Fall2025StateTechnicalGuide_v1.pdf).

The original spreadsheets are retained unchanged. Their SHA-256 hashes and source-row references are recorded in `content/schools/alabama-grades-2025.json`.

## Reproduce

From the repository root:

```sh
node scripts/import-alabama-school-grades.mjs
node scripts/import-alabama-school-grades.mjs --check
```

Both commands are offline and need only Node's built-in modules. `--download` refreshes the two explicitly identified official source files before importing. The parser rejects unexpected sheet names, school years, columns, formulas, conflicting school names, district summaries and duplicate school results.

## Match and scope

Match school records by their state system and school codes, then verify normalized name agreement. Keep the three systems separate: **002 Baldwin County**, **152 Gulf Shores City**, **174 Orange Beach City**. A county is not a school system. Do not substitute district scores for missing school results.

The current directory contains 50 Alabama public-school records. The official workbook provides 47 corresponding school rows: **46 letter grades and numeric total scores**, plus **Baldwin Preparatory Academy's AW (Approved Waiver)**. Three records have no school-level row: CF Taylor Alternative School, North Baldwin Center for Technology, and South Baldwin Center for Technology. Their reasons remain explicitly unknown beyond absence from this workbook. There are no unmatched official school rows from the three covered systems.

The import includes 175 `All Students` indicator rows attached to the matched schools. It does not aggregate subgroups or import private-school grades. A separate openpyxl 3.1.5 read independently verified every imported school row and indicator value against the original workbooks.

`AW` and `ID` are non-grade statuses, not academic letters or zero scores. The source's `Total Points Earned` is copied directly, not reconstructed. Indicator values are not uniformly proficiency percentages. In particular, the technical guide says graduation and college/career readiness use 2023-2024 cohort data within this 2024-2025 report. Alabama's methodology differs from Florida's; do not rank the two states on one combined scale.
