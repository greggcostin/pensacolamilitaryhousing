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

### State-based routing (no URLs, no router)
`App` holds `const [page, setPage] = useState("home")` and passes `go = (id) => { setPage(id); window.scrollTo(0, 0); }` down. Navigation is conditional rendering: `{page === "about" && <AboutPage go={go} />}`. There is no `react-router`, no hash routing, no `history.pushState`. The URL is always `/` while using the SPA. `public/_redirects` documents this: "No redirect rules needed — SPA uses state-based routing."

Consequence: deep links into SPA pages (e.g., `/about`) do not exist. If a feature needs to be linkable, it must live as a standalone HTML page in `public/` (see below), not as a new SPA route.

### Two parallel content surfaces
1. **The React SPA** (`index.html` → `src/App.jsx`) — the interactive marketing site.
2. **Prerendered static HTML pages in `public/`** — `faq.html`, `nas-pensacola.html`, `nas-whiting-field.html`, `corry-station.html`, `cantonment.html`, `gulf-breeze.html`, `hurlburt-field.html`, `navarre.html`, `pace.html`, `reviews.html`. These are independent SEO landing pages served by the host alongside the SPA. They are not generated from `App.jsx` and must be edited directly. When you change SPA content (addresses, phone, rates, base info), check whether the same content appears in a `public/*.html` page and update both.

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
The `public/_redirects` file and the `outDir: 'dist'` Vite config suggest Netlify-style hosting. The site serves at `https://pensacolamilitaryhousing.com/`.
