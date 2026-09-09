# Homepage image discovery refinement

The civilian homepage's preferred responsive hero image is now preloaded before the large inline stylesheet, with the viewport declared first. The hint is generated from the actual picture's first unconditional AVIF source, so image updates do not leave stale or duplicate-format downloads. Normal picture fallback remains intact.

`prepare-civilian-delivery.mjs` applies the helper after stylesheet preparation. `civilian-home-preload.test.mjs` covers responsive selection, viewport order, unchanged body content, stale-hint replacement, idempotence and art-direction fallback. `check-civilian-home-preload.mjs --root <complete-before-civilian-release> --output <evidence-directory>` compares complete releases locally with external traffic blocked.

The deployed change affects only one civilian HTML file. Body content, the linked five-star review proof, consolidated photography credits, images, CSS, schema, dates, forms, tracking and all school-map code remain unchanged. The owner explicitly reaffirmed that both school maps must initialize automatically on page load. That requirement is recorded in AGENTS.md.

Publication: civilian `241564a2-38a2-49fd-87c4-bb0dd9456752`; military remained `e912159d-0e14-497d-a5eb-5264623575c6`. All 4,981 provider hashes matched the complete candidate. Both SEO audits and the shared entity audit reported zero findings; five browser groups, five unit/CSS checks and five public readbacks passed.

Three cold-cache mobile comparisons showed median hero-image download completion at 2,004 ms before and 1,943 ms after, with portrait completion at 1,383 ms and 1,213 ms. Layout and selected image resources matched, with one hero request per run. Reported LCP changed more substantially, but the browser chose different LCP elements across runs; it is not treated as an equivalent visual-speed gain. A fresh public PageSpeed request timed out. No field-performance, ranking or referral improvement is claimed.

This commit contains the loading implementation and its checks. The publication used the latest complete production bundle, which also includes later photography-credit and homepage-review work maintained in a separate local source lane. Reconcile that entire source lane before deploying a complete checkout; do not equate this source commit with all deployed page bytes.

The implementation follows the [responsive-image preloading guidance](https://web.dev/articles/preload-responsive-images), including matching responsive candidates and avoiding multiple-format preloads.
