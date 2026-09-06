# School guides on both Costin sites

The school finder and 271 individual guides are maintained from one school repository. GreggCostin.com serves the local real estate edition. PensacolaMilitaryHousing.com serves an additional PCS edition with installation liaison, enrollment, records and school-transition resources. The school facts, source dates, private/Christian classifications and map coordinates are shared.

## Update workflow

Edit the maintained inputs in `content/schools` and the school source/profile libraries, then run:

```sh
npm run build:schools
npm run build
```

`build:schools` refreshes the shared finder data, civilian school guides and responsive markup, generates the military editions, installs reciprocal links, updates PMH school navigation, and audits both sites. It does not fetch fresh school facts unless the relevant source import was run separately. The PMH production prebuild also checks edition parity; it fails if a school fact or map module changes on only one site.

`scripts/build-military-schools.mjs` uses the proven PMH page template for navigation, forms, privacy controls, footer and tracking. The civilian school content and layout are read as generated inputs, not maintained as a separate hand-edited copy. `scripts/military-school-context.mjs` and its dated source ledger add military context without changing academic facts. The generated school files should not be hand-edited.

The two sites retain separate page URLs, canonical tags, share cards, page schema and sitemaps. Each corresponding page has one normal link to the other edition. The shared Gregg Costin, team and brokerage entity identifiers remain consistent. Google chooses which documents it indexes and shows; self-canonical tags and reciprocal links do not guarantee separate rankings for similar content.

PMH school assets live under `/school-assets/` with revalidation headers. This avoids the immutable caching used for PMH Vite bundles. The map data remain an exact copy of the shared repository; relative school report links stay on the current domain.

## Release and rollback

Both editions must be reviewed and audited before release. Main-branch pushes automatically build and deploy PensacolaMilitaryHousing.com through its existing Cloudflare Pages Git integration. GreggCostin.com is deployed separately from `civilian-site` to its `greggcostin` Pages project. Do not deploy a dirty development checkout over the production baseline.

Immediately before this school expansion, the PMH production deployment was `8cc80c0e-04a9-41ca-bca7-e2f6ce68807b`, built from `e7ea38a2c4941ef1c894a24024ca5c47e5a47489`. The corresponding GC production deployment was `740490ea-3d1b-49c4-a5f9-b61d62d54b87`. These deployment IDs and Git history preserve the previous production versions.

The earlier original blue-and-gold recovery archives remain in the project backup directory. This release adds school content and navigation to PMH; it does not replace the PMH homepage or other existing page content.
