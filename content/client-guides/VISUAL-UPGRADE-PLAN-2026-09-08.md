# Make the guides easier to understand and use

Status: six working sample pages, September 8, 2026. These are local design prototypes. The approved 22-guide collection, source text, covers, courthouse closing page and website downloads have not been replaced.

Open `artifacts/client-library-design/visual-storytelling-2026-09-08/index.html` for the responsive samples, or the PDF in that directory for the print edition. Rebuild with `node scripts/build-client-guide-visual-samples.mjs`. Research URLs and the sample-specific review date are recorded in `source-review.json`; layout and interaction checks are in `qa/checks.json`.

## What the current collection needs

The material is substantial, but the interior pages repeat a narrow set of arrangements: photograph strip, small table or cards, two text columns and a caution box. Those patterns give equally prominent treatment to information with different purposes. Several photographs establish atmosphere without explaining the decision on the page.

The renderer in `scripts/client-guide-layout.mjs` chooses several visual formats from table dimensions and whether the final column is numeric. This is why the three-column buyer sequence remains a table, while the assumption purchase price, assumed balance, cash gap and closing costs become independent bars. Those numbers need a parts-of-the-price diagram followed by a cash calculation. A generic numeric-chart rule cannot make that editorial decision reliably.

The largest opportunity is to reveal the process the client cannot see: simultaneous work, responsible professionals, required evidence, decision points, unresolved conditions and the actual next action. Better copy editing is part of the improvement. Shorten repetitive framing, define unfamiliar terms beside their first use and preserve exceptions near the decisions they qualify.

## Sample pages built

1. **Buyer:** milestone sequence, three parallel teams, responsibility labels and spaces for the actual contractual dates.
2. **VA assumption:** purchase-price composition, explicit cash arithmetic, seller liability/entitlement questions and an interactive hypothetical balance comparison.
3. **NAS Pensacola:** assignment-based routing with separate Air Force CSO, Navy flight training, technical training, Corry, Marine and permanent-party contacts. The HTML can focus on one route.
4. **Mortgage:** a branching review flowchart with a return loop for missing evidence, a path for unmet requirements, and the distinction between approval and completing the transfer. A readable vertical diagram appears on phones.
5. **Seller:** the sale sequence beside a comparison of two hypothetical offers after buyer credits, followed by a decision about conditions and dates.
6. **VA purchase:** benefit eligibility, borrower qualification and property review shown as distinct checkpoints that come together for lender approval.

No client case, market statistic, loan quote or firsthand Gregg anecdote was invented. Numerical examples are explicitly hypothetical. Fresh sources were checked for the sample claims; original guide review dates remain unchanged. Public phone numbers were checked against published pages, not tested by calling.

## Apply the right visual to each guide

| Guide | Priority visual | What the client should be able to explain |
| --- | --- | --- |
| Preapproval first | Approval stages and a labeled document folder | What the letter means, what was reviewed and what remains conditional |
| Buyer transaction | Parallel teams plus contract milestones | What happens next and who is waiting on whom |
| Mortgage process | Underwriting decision loop and document handoffs | Why another document request can happen and who resolves it |
| Seller transaction | Sale sequence and offer decision tree | How price, credits, conditions and timing affect the choice |
| Seller proceeds | Waterfall from price to proceeds | Where the money goes, with negotiated assumptions visible |
| Florida property taxes | Seller bill versus buyer reassessment illustration | Why the old bill can be a poor budget assumption |
| Alabama / Florida costs | Comparable ownership-cost stacks | Which assumptions explain a difference between two actual properties |
| Pensacola Beach leasehold | Ownership and document relationship diagram | Which interests and documents need review before an offer |
| Condo due diligence | Building, association and unit responsibility diagram | Which records answer insurance, reserve and assessment questions |
| Coastal insurance / flood | Labeled house illustration and coverage comparison | Why the cause of damage and actual policy terms matter |
| Inspection decisions | Finding → specialist → estimate → contract decision | How a report turns into a decision before the deadline |
| VA insider guide | Eligibility / borrower / property checkpoints | Why the benefit does not by itself approve a loan |
| VA assumption | Price composition, cash bridge and seller-protection branches | Cash needed, approval requirements and entitlement consequences |
| All nine PCS guides | Before departure / arrival / first month timeline and command routing | Which office applies to the specific assignment and what to do next |

Additional formats for later researched guides: buy-and-sell dependency diagrams, new-construction milestones, refinance comparisons, and landlord cash-flow diagrams. These are proposals, not newly verified transaction advice.

## Editorial and production rules for the next edition

- Start each spread with one real client question. The graphic should answer that question; the explanation supplies the qualifications and next action.
- Give each step an owner, a required input, a visible result and a reason it may pause. Explain when activities happen concurrently. Use contractual dates or clearly labeled examples instead of invented universal durations.
- Choose visuals explicitly by purpose: sequence, decision, money movement, parts of a whole, comparison or physical explanation. Keep reference tables where an exact lookup is the task, including full BAH schedules and contact directories.
- Keep meaningful text selectable and available in HTML. Use text alternatives and responsive layouts for diagrams. Print and mobile versions may use different arrangements while explaining the same facts.
- Use generated illustrations for concepts such as a house cutaway, roof components or an abstract transaction scene. Keep factual labels and calculations as editable text. Actual base layouts, property boundaries, buildings and local conditions require verified source material; an illustrative image must not imply it documents a real location.
- Add Gregg's firsthand observations only from real examples he supplies or records we are authorized to use. A hypothetical teaching example must never acquire an invented client name or testimonial.
- Preserve the approved branding and closing feature. Give chapters varied visual pacing; avoid repeating the same photo-and-card arrangement on every page.
- The existing sentence-preservation gate remains in force for the approved collection. A substantive copy-edited edition needs a reviewed claim-and-exception comparison before replacing that gate; a shorter page is not evidence that nothing important was lost.
- Check arithmetic independently, including fee exemptions, part-to-whole totals and slider boundaries. Check PDF text, link annotations, page boundaries, diagram reading order, mobile widths, long labels and keyboard controls. Then inspect rendered pages.

## Learn from readers

Before calling a new design more effective, have readers unfamiliar with the process find the next action, identify the responsible professional, explain a condition that can pause the file, interpret a worked example and locate a useful contact. Record the errors and unclear language, not just aesthetic preferences. Compare the same tasks between editions. Add reported client questions and corrections to the existing editorial feedback process without personal financial details.

Success means fewer wrong assumptions and easier decisions. No comprehension improvement, inquiry increase or search ranking benefit has yet been measured for these prototypes.
