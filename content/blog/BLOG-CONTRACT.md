# Military blog fragment contract, version 2

Effective September 8, 2026 for every new article and substantive refresh. Read `EDITORIAL-PLAYBOOK.md` and `editorial-policy.json` with this contract. Existing unchanged articles retain their dates and legacy build checks; they are not certified against this standard until refreshed.

## Fragment and research file

Write `content/blog/<slug>.fragment.html` with a `<!--PAGE ... PAGE-->` JSON block followed by body HTML. Military fragments use `faq` (the civilian spelling `faqs` remains separate). Keep the metadata and final research review consistent.

Required PAGE fields:

- `slug`, `title` (maximum 65 characters), `description` (120-165 characters), `h1`, `lead`, `excerpt`, `category`, `readTime`.
- `datePublished` and `dateModified` as real ISO dates. Preserve original publication dates. Advance modification dates only for substantive changes, never for a rebuild, source visit, title-only test or metadata adjustment.
- `editorialVersion: 2`, `targetKeywords` with 2-5 natural queries, `takeaways` with 3-5 useful points, and a natural one-sentence `shareHook`.
- `quickAnswer`: 2-4 dated sentences under 85 words, restating a supported figure and the condition that matters. A number already used elsewhere in the article does not become verified merely by repetition.
- `faq`: at least six distinct question/answer objects `{q,a}`. Give each answer 40-95 useful words. The factory mirrors the visible answer in FAQPage markup; no Google FAQ rich-result claim is made.
- `related`: 5-7 relevant existing guide links `{href,label}`. Use descriptive labels. At least six unique internal guide links belong in the body, with at least eight unique useful guide/source links overall.
- `perishables`: for each dated perishable fact, `{claimId,claim,expires,source}` matching its research claim, review deadline and supporting URL.
- `figure`: `{src,alt,caption}` with a real image path under `/images/`, literal descriptive alt text, correct license/credit and an optional `pos` crop. A commercially reusable image is mandatory.
- `editorial`: `{version:2,evidenceFile,readerTask,originalValue,conversionGoal,pillar}`. `evidenceFile` must point to the single matching research JSON inside `content/blog/`.
- Optional `journey`: `{goal,prompt,tool,toolLabel,bridge,bridgeLabel}`. Both destinations must be existing clean first-party URLs. The normal inquiry path remains unchanged.

The single `content/blog/research/<slug>.json` carries the shared evidence schema and editorial fields:

- `schemaVersion:2`, `version:2`, `slug`, `article:{slug,site:"pmh"}`, `sessionDate`, actual `models:{research,write}`, `uncertainFacts`, `readerTask`, `originalValue`, `reader`, `decision`, `pillar`, `changeReason`.
- `sources`: `{id,publisher,title,url,primary,checkedAt,evidenceNote}`. Use HTTPS URLs and source reads from this session. Notes identify the relevant source section and limitations. Search snippets are not source verification.
- `claims`: one record per load-bearing fact/calculation, with both `text` (the exact visible passage) and `claim` (the source claim), a unique `id`, `kind`, `status`, `sourceIds`, `sourceUrl`, `scope`, `asOf`, `accessed`, `locator`, `loadBearing`, `verification` and `independentCheck:{reviewer,date,finding}`. Link load-bearing body passages with `data-claim="id"`. Claims marked uncertain/omitted must not appear as established facts.
- Facts use `kind:"fact"`; perishable facts also use `perishable:true` and `expires`. Keep source publication date, effective date, geography and population distinct. Refreshes re-verify retained facts.
- Calculations use `kind:"calculation"`, explicit `assumptions`, a `method` and `calculation:{operation,inputs,result,units,inputSources,tolerance}`. Supported numeric operations are sum, product, difference, quotient and amortization. Tolerance cannot exceed 0.01. Do not put executable formulas in the record. Label illustrative scenarios rather than describing them as actual transactions.
- `searchLandscape`: actual reviewed results, question wording with provenance and the specific information gap this article fills. Label editorial suggestions honestly; do not fabricate People Also Ask results or demand.
- `localApplications`: two objects `{place,decision,passage}` describing an actual local implication in the final article. Location-name repetition does not qualify.
- `military`: `{audience,readerSituation,dutyLocations,topics,limitations}` using the policy's audience and topic identifiers. Explain what the reader's orders, dependency/student status, property or household would change.
- Military benefit facts additionally have `appliesTo` and `limitations`. Use official DoD/DFAS sources for BAH, official VA sources for VA benefits, and current official moving guidance for PCS entitlements.
- A numeric BAH claim has `bahRate:{year,mha,grade,dependency,monthly}`. Dependency is `withDependents` or `withoutDependents`; the source-reviewed MHA mapping is FL064 for Pensacola and FL056 for Eglin/Hurlburt/Duke. Annual JSON/archive must be available and match provenance. Run `verify-bah-source.mjs` and independently read the official source. Never use assumed pay by rank.
- `quickAnswerClaimIds`: the IDs of claims restated verbatim in the quick answer.
- `answerPassages`: at least two `{question,answer,claimIds,scope,caveat}` objects. The answer must be the exact opening paragraph under that H2 or the exact FAQ answer. Keep the material caveat in that answer and its supporting claim text in the same passage.
- `review`: after the final source and voice review, record `provider`, actual `model`, `checkedAt`, `notes`, `checks:{facts,calculations,voice,scope,sources,counterarguments}` and hashes from `contentHash(spec,body)` and `evidenceHash(research)` in `scripts/blog-editorial-lib.mjs`. Any content or evidence edit requires another review. Hashes prove what was reviewed, not whether the source is true or a specialist approved it.

Use `research/TEMPLATE.json` for field shape only. It is explicitly nonpublishable. Do not mark checks verified or seal a review before doing them.

## Writing and utility

Answer the question first. Favor question-shaped H2s drawn from the actual research; their first paragraph answers the question before elaborating. Use 1,100+ body words without padding, one useful table, one actionable checklist and one worked example. Aim for no paragraphs over 85 words; paragraphs over 110 fail the factory. Length, FAQ and score thresholds are house standards, not Google ranking factors.

Write for the selected military reader. Explain general finance through that reader's real decision and link to the civilian site's fuller general explanation when appropriate. Never invent first-person service, local observations, client anecdotes, outcomes, school claims, prices, rates, eligibility or legal interpretations. Separate verified facts, hypothetical calculations and judgment. State the downside and what could reverse the conclusion.

No em dashes, en dashes, emojis, encoded substitutes, canned transitions or keyword padding in reader-facing prose, metadata, captions, FAQs or link labels. Preserve the exact technical `data-inquiry-type` string required by the contact worker; that attribute alone is exempt from the dash rule.

Use existing site classes: `.facts`, `.bah-wrap > table.bah-table`, `.table-wrap`, `.figure-band`, `.cta` and `.inq-cta`. Finish with a Sources and References section linking the actual primary sources. A table should have a caption and column headings; keep wide tables inside a scrollable wrapper.

## Imagery, build and release

Fetch new imagery using `scripts/fetch-stock-image.mjs` into `public/images/blog`. View every candidate, reject misleading/low-quality imagery and record the license and credit. Reuse is a documented fallback after 2-3 unsuccessful searches. Finalize, generate modern/responsive variants, then apply responsive markup. Longer guides should use additional relevant imagery at natural breaks. Do not invent a srcset file that does not exist.

Run `node scripts/blog-factory.mjs <slug> --out artifacts/military-preview` while editing. Pass `node scripts/score-post.mjs <slug> --site pmh --gate` at 80+ and `node scripts/analyze-formatting.mjs --file <rendered-page> --gate` at 90+. The builder also applies the shared evidence gate and military editorial gate. No score can compensate for a failed mandatory evidence check.

After final review, build the selected slug normally, generate its OG card and inspect it, and run the military, entity, link and dash audits plus the relevant source checks. Use `npm run build` for the staged military release. Do not run a broad legacy affordability generator over the source-reviewed core guides. Their source data lives in `content/geo/` and `src/bahData.js`.

Honor `content/blog/ledger.json` configuration. With `autoPublish:false`, commit only owned files on a review branch, push that branch and report the preview, score, shareHook and evidence gaps. Publication needs Gregg's authorization. Add two or three planned contextual inbound links to the staged release, preserve the civilian entries in shared retro files, and record actual deployment and later outcomes separately.

The builder also checks `content/geo/financial-guide-data.mjs` when present. An article owned by that reviewed financial-guide source must use `scripts/financial-guide-lib.mjs` and its checks, rather than a legacy blog fragment. A mixed legacy checkout is not permission to overwrite a reviewed financial page.
