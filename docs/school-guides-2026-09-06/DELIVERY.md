# School map and report-guide delivery

Checked locally on September 6, 2026. The work is in the local civilian-site preview; no production deploy, commit or push was performed for this change.

## Delivered behavior

- The interactive map starts automatically when its directory loads. School results remain usable during loading and a retry is available if map loading fails.
- Visitors can explicitly submit a street address to the U.S. Census geocoder. A successful covered-area match becomes a red home flag and the origin for straight-line distances, radius filtering and nearest-school sorting. Ambiguous responses offer a selection instead of silently choosing a location.
- School type, level, area, academic-grade, program and Christian/private filters continue to combine with the selected location. Clearing or replacing the address removes the previous origin; an invalid input does not send a lookup.
- All 82 existing detailed reports now have a unique sourced overview, two school-specific highlights, enrollment information, visit questions, a state-result comparison, comparable report links, and dated sources. Coverage is 53 Escambia and 29 Santa Rosa reports.
- The broader directory remains 274 records, 264 mapped locations, 66 private records and 82 report links. Virtual and unconfirmed locations remain list-only. Private records do not receive invented Florida accountability grades.
- PSC Charter Academy's point now uses its official College Boulevard campus address. Current Warrington Prep and Santa Rosa Online program information is distinguished from the older federal directory spans.

## Comparison method

State-result tables use the same county and Florida DOE school category, exclude the subject school, retain valid zeros, ignore missing values, and report an unweighted school-level median and sample count. The closest comparable report pages use the same school category and in-person/virtual format. The guides describe program fit and individual published measures rather than assigning an overall editorial rank. Each comparison card displays its dated directory grade span, and combination-school guides explain that the same accountability category can include different entry grades. An independent review checked 395 metric calculations and all 80 physical-campus reports' nearest-three selections.

Report text is rendered into static HTML. Existing report URLs, titles, canonicals, structured data, state-grade history, crawler files and contact forms remain protected by the preservation check. The two new school-search forms are narrowly allowed through exact reviewed form contracts. Search analytics account data was not changed or independently queried in this implementation.

## Verification

- School finder: 29/29 check groups passed, including immutable source identities, current campus overrides, historical data vintages, filters and preserved report links.
- Address search: 14/14 check groups passed, including provider validation, cancellation, late responses, map loading/retry, stale popup suppression and address privacy contracts.
- Private school client: 9/9 check groups passed, including the actual automatic map initialization and private marker behavior.
- School report guides: 9/9 check groups passed, including source coverage, correct comparison arithmetic, route/category parity, dated grade spans, magnet scope, rejection of missing research dates and idempotent generation.
- Civilian audit: 130 pages, zero findings at the final integration check. Other authorized work is also present in this shared workspace; this is the whole current civilian surface, not a claim that this change created 130 pages.
- Preservation audit: 123 baseline HTML pages and 10 crawler/configuration files, zero findings. All 17 destructive-mutation self-tests were detected.
- Shared entity audit: 227 pages, zero findings.
- Scoped Git whitespace check: no errors.

## Actual browser checks

The in-app preview was reloaded without clicking an open-map control. Leaflet and map tiles loaded successfully. A real Census lookup for the public school address 501 Pickens Avenue, Pensacola, FL 32503 returned a covered-area match and displayed one red home flag. A. K. Suter Elementary appeared first at less than 0.1 straight-line miles; its popup agreed with its result card. St. Paul Catholic School appeared at 0.9 miles.

With that origin still active, the Christian-school filter returned 25 mapped records within 10 straight-line miles. Clearing the address removed the red flag and home-origin distances. Submitting only 'Pensacola' produced the street-address validation message. No lead form was submitted. No browser console errors appeared in this exercise.

At a 375-pixel viewport, the map remained usable and the page did not overflow horizontally. The guide's comparison table scrolled inside its own region (315-pixel region, 510-pixel table), and program highlights stacked into one column. The normal viewport was restored afterward.

## Limits and maintenance

Census points are approximate street-address points; coverage, new addresses and provider availability can vary. These distances are not driving distances, travel times or attendance-zone determinations. Submitted addresses are sent to Census for the requested lookup, held only in the active page, masked for Clarity, and kept out of page history, browser storage, analytics events and inquiry payloads.

School programs and application windows can change. The editorial source registers record retrieval limits and historical/current differences. Update the two editorial JSON files from current official school evidence, run `node scripts/build-school-report-guides.mjs`, and run its checker plus the civilian and preservation audits. Update map sources with `node scripts/build-school-finder.mjs` before generating guides when location data changes. Existing page factories and the experience rollout also apply the guide layer.

The saved original blue-and-gold backup remains in `backups/greggcostin/2026-09-06-recovery/`; it was not overwritten. The earlier current-redesign archive predates this address-search and guide expansion. These new changes are saved in the working files, not claimed to be inside that older archive.
