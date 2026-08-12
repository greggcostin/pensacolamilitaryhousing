# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Vite dev server
- `npm run build` — production build to `dist/`
- `npm run preview` — serve the built `dist/` locally

No test, lint, typecheck, or format scripts exist. This is plain JavaScript (ESM, `"type": "module"`), no TypeScript, no ESLint config.

## Architecture

### Single-file React SPA
The entire application lives in `src/App.jsx` (~1200 lines). Every page and component — `Nav`, `Hero`, `AboutPage`, `PCSPage`, `VALoanPage`, `HomesteadPage`, `BaseGuide`, `NeighborhoodsPage`, `BlogPage`, `ReviewsPage`, `ContactPage`, `Footer`, plus shared primitives (`H2`, `H3`, `Body`, `BtnP`, `BtnG`, `Section`, `FAQ`, `InfoBox`, `PageWrapper`, `PageHero`, `Content`) — is defined in this one file. Do not split components into separate files without a reason; the single-file layout is intentional.

### URL routing (custom pushState router — no react-router)
`App` holds `const [page, setPage] = useState(() => resolvePageFromPath(window.location.pathname))` and navigates via `go(id)`, which calls `history.pushState` and updates state; a `popstate` listener syncs `page` back from the URL. A route map near the bottom of `App.jsx` (`const PAGE_TO_SLUG = { home: "/", about: "/about", calculator: "/mortgage-calculators", ... }`, with its inverse `SLUG_TO_PAGE`) plus `resolvePageFromPath` is the single source of truth for page↔path. There is also a hash handler mapping `#calculator`/`#bah-calculator` to the calculator page. Rendering is still conditional (`{page === "calculator" && <LoanCalculator />}`).

Consequence: deep links DO work (e.g., `/mortgage-calculators`, `/about` resolve to the right SPA page). `scripts/postbuild-spa-routes.mjs` runs after `vite build` to emit a prerendered HTML shell per route so crawlers and direct hits get real HTML. When adding an SPA page, add it to `ROUTE_MAP` (and the postbuild route list) — do not assume a bare path is a 404 just because there's no matching `public/*.html` file. The prerendered `public/*.html` pages below are a *separate* SEO surface, not the SPA's routing mechanism.

### Two parallel content surfaces (updated Aug 2026)
1. **The React SPA** (`index.html` → `src/App.jsx`, now ~2,850 lines) — serves only these routes: `/`, `/about`, `/contact`, `/pcs-guide`, `/blog`, `/mortgage-calculators`, `/communities` (see `PAGE_TO_SLUG`). Per-route meta lives in `src/routeMeta.js`.
2. **Static HTML pages in `public/` are the PRIMARY SEO surface** — ~78 hand-maintained pages: all `public/bases/*.html` and `public/communities/*.html` plus every guide/tool page at the top level. Cloudflare Pages serves them at clean URLs (auto pretty-URLs, e.g. `public/bah-rates.html` → `/bah-rates`); `public/_redirects` 301s the legacy `.html` forms and provides the `/* → /index.html` SPA fallback. Each static page is self-contained: full head (meta/OG/JSON-LD ×6), nav, inquiry modal (POSTs to the contact worker), sticky mobile CTA, Pagefind search, GA4 + Clarity + FollowUpBoss trackers, footer. They are not generated from `App.jsx` and must be edited directly. When you change SPA content (addresses, phone, rates, base info), check whether the same content appears in a `public/*.html` page and update both.

**Creating a new static page:** use `scripts/page-factory.mjs` — it clones the proven template (`public/first-time-military-homebuyer.html`), swaps head/meta/JSON-LD/H1/content from a fragment file, and appends the sitemap entry. Then run `npm run og-images` and add the page to `public/llms.txt`.

**Contact worker contract** (`costin-contact` Cloudflare worker, source not in repo): requires `name`, `email`, AND `message` (400 without all three); honeypot field must be named `_gotcha`; `inquiryType` must exactly match the worker's stage map strings (e.g. `"PCS / Relocation — Buying"` — WITH the slash) or the FUB lead files as "Prospect" instead of "Lead".

### Styling
Inline styles only, driven by a design tokens object `C` at the top of `App.jsx` (`C.gold`, `C.ink`, `C.panel`, etc.) plus legacy aliases (`GOLD`, `BLACK`, `DARK`, `CHARCOAL`, `CREAM`, `WARM_GRAY`, `LIGHT`). Two font families (`SF` = Playfair Display serif, `SS` = Inter sans) are imported via a `<style>@import url(...)</style>` block inside `App`. `src/index.css` only holds a handful of global resets. No Tailwind, no CSS modules, no styled-components.

### External services (Cloudflare Workers)
- **Blog API** — `https://costin-blog.gregg-costin.workers.dev` (constant `BLOG_API`). `BlogPage` fetches `/api/posts` on mount and merges remote posts in front of the hardcoded `STARTER_POSTS`. If the fetch fails, it silently falls back to `STARTER_POSTS` — this is intentional.
- **Contact webhook** — `https://costin-contact.gregg-costin.workers.dev` (constant `WEBHOOK_URL` inside `ContactPage`). Form POSTs JSON including a honeypot field named `website`.

Neither worker's source lives in this repo.

### BAH data
`BAH_DATA` in `App.jsx` is a hardcoded map of MHA codes (`FL064` = Pensacola, `FL023` = Fort Walton Beach) to 2026 monthly BAH rates by pay grade. `BaseGuide` passes `bahMha` / `bahLabel` / `bahZip` per base to `BAHGrid`. Updating rates annually means editing this object; there is no data source or build-time fetch.

### Assets not in the repo
`App.jsx` references `/images/*.jpg|png` (hero, portraits, military photos, logos) through the `IMG` object. There is no `public/images/` directory in git. These assets are supplied at deploy time on the host. A missing local image is not a bug — don't chase it. `index.html` also references `/images/favicon.png` and `/images/og-image.jpg`.

### SEO / agent-discoverability layer
`index.html` carries extensive meta tags, Open Graph, Twitter cards, and JSON-LD (`RealEstateAgent` schema). `public/robots.txt`, `public/sitemap.xml`, and `public/llms.txt` are maintained by hand. When adding or renaming pages, update `sitemap.xml` and, if relevant, `llms.txt`. Google Analytics is wired in `index.html` as `G-W29GHBK38M`.

## Deployment notes
Hosting is **Cloudflare Pages** (see the `_redirects` comments and the `.pages.dev` canonical-redirect snippet in every static page head). Build: `npm run build` = bump-dates → vite build → postbuild SPA shells → Pagefind index, output to `dist/`. The site serves at `https://pensacolamilitaryhousing.com/`.
