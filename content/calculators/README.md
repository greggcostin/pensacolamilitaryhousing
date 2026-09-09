# Native civilian calculators

The native page is `/mortgage-calculators` on GreggCostin.com. It contains mortgage payments, fixed-rate loan comparisons, extra principal and amortization, purchase cash and household budgeting, and long-term/mid-term/vacation rental analysis. The civilian header points here. The military calculator retains its own route and audience.

`scripts/mortgage-math.mjs` is the calculation engine shared by all five native tools. `scripts/civilian-calculator-ui.mjs` renders the initial HTML and supplies browser interactions. `scripts/civilian-calculators.css` contains scoped presentation. `scripts/build-civilian-calculators.mjs` installs the page, assets, share card, header links, contextual links and discovery entries.

Edit the source modules, not the minified asset. Maintain `sources.json` when reviewing loan rules; only change the review date after substantive review. All financial starting values are explicitly illustrative. Do not describe them as current mortgage offers, local insurance/tax averages or rental forecasts.

Run from the isolated source checkout:

```powershell
node --test scripts/tests/mortgage-math.test.mjs
node scripts/build-civilian-calculators.mjs --root civilian-site
node scripts/build-blog-search.mjs gc --root civilian-site
```

Build the same code against a complete, provider-verified production candidate using `--root <candidate-gc-root>`. Run the civilian and entity audits; rebuild Pagefind with `build-blog-search.mjs gc --root <candidate-gc-root>` so the existing mix of main-content markers cannot omit pages; check the real UI and the OG card. Publish through the existing sealed-candidate workflow, preserving the current deployment baseline. Commit explicitly owned source/generated files only. A Git push is distinct from deployment.

The page includes WebPage, WebApplication and BreadcrumbList schema linked to canonical entity IDs. The explanation and worked example are ordinary HTML. The interactive inputs/results are excluded from Pagefind to keep incidental example numbers out of site search. No extra AI schema or FAQ rich-result promise is made.

Only tool names are sent by the calculator's optional analytics event. Financial amounts are never included in that event, URLs or contact links. The entire calculator region is marked for Clarity masking. Saving requires an explicit button press and stays in localStorage; loading, clearing, CSV export and print are user actions. Do not add automatic financial-data collection or lead gating.

The engine supports ordinary new fixed-rate purchase scenarios only. Its explicit limitations, mortgage-insurance rules, reserve treatment and rental-income assumptions are documented visibly and in `sources.json`. Tests include independent fixed-payment values, HUD's historical premium-calculation example, fee and cash accounting, original-schedule PMI termination, FHA table boundaries, and rental break-even identities.
