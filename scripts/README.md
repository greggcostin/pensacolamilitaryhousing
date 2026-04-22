# Build Scripts

## Active scripts (run these for regular maintenance)

| Script | Purpose |
|---|---|
| `page-template.mjs` | HTML template used to render new static pages. Exports `renderPage(p)`. Shared by generate-pages.mjs. Update here to change markup/CSS for all future generated pages. |
| `page-data.mjs` | Data for every new static page (VA Loan guide, PCS Checklist, homes-for-sale-*, on-base-vs-*, comparisons). Add a new page by pushing to the `pages` array. |
| `generate-pages.mjs` | Runs `renderPage()` on each entry in page-data.mjs and writes `public/*.html`. Re-run after any data change. |
| `wire-crosslinks.mjs` | Bulk-edits banner tabs, Explore grid, and inline contextual links across all 49 static pages. Idempotent. |
| `update-sitemap.mjs` | Appends new URLs from page-data.mjs to `public/sitemap.xml`. Run after adding new pages. |

## archive/

One-off migration scripts, preserved for reference but not intended for re-running. Each was used once to bring the codebase to its current state:

- `add-citations.mjs` — injected citation-ready intros to base pages
- `add-dropdown-aria.mjs` — added ARIA + keyboard nav to dropdown menus
- `bump-dates.mjs` — bumped last-updated stamps across base pages
- `compress-images-aggressive.mjs` — quality-72 sharp compression pass
- `enhance-schemas.mjs` — added Article / AggregateRating / geo schemas
- `extract-css.mjs` — extracted inline CSS into public/site.css
- `fix-banner.mjs` — early banner email case fix
- `hide-homes-tab.mjs` — added .homes-dropdown CSS-hide class
- `match-spa-banner.mjs` — matched static pages to SPA banner exactly
- `optimize-images.mjs` — early quality-82 sharp pass
- `patch-faq-reviews.mjs` — added RealEstateAgent + BreadcrumbList to faq/reviews
- `restore-grown-images.mjs` — reverted files that grew after compression
- `restore-reviews-tab.mjs` — restored Reviews tab after accidental removal
- `seo-fixes.mjs` — bulk og.jpg fix + lazy-load + sameAs arrays
- `unify-styles.mjs` — unified 49 page CSS to SPA aesthetic

## image-originals/ (gitignored)

Backup of original images prior to any sharp compression pass. Not tracked in git; restored locally if needed.
