# Reconciled source published to both domains

The photography, homepage and school/blog/GEO reconciliation in source commit `ffdbce7e891f3c32dcd5ab18ea363835c0270b71` was published to both production domains on September 9, 2026, following the owner's explicit instruction to push and publish the completed changes in this task.

| Site | Production deployment | Created, UTC | Verified provider assets |
| --- | --- | --- | --- |
| pensacolamilitaryhousing.com | `464a452f-3344-4006-b49b-8737b897b105` | 16:35:30 | 3,438 |
| greggcostin.com | `55ecb664-f4f3-46fb-9fd6-a5a929e6b57f` | 16:35:42 | 1,708 |

Both deployments report success and carry the reconciled source commit. All 5,146 provider file hashes exactly match the sealed candidate. The previous complete release was checked before staging and again immediately before each deployment. Every existing published file was retained; complete source builds were overlaid so older hashed application/search assets remain available to cached documents.

## Published changes

The military homepage and six SPA route shells, shared community descriptions, navigation/discovery improvements, photography attribution, accepted-receipt analytics safeguards and maintained blog/GEO source are now in the published build. The civilian release retains approved homepage proof and review links, credential symbols, the responsive hero preload, the full photography catalog, and Search/Calculator header controls. The homepage Florida ZIP snapshots now agree with the archived ownership-study dataset. The original review observations and all other page-level review dates remain unchanged.

The #1 positioning and automatically loaded school maps are preserved. All 542 school article bodies, all 17 blog article bodies, and image markup across 696 HTML files were preserved against the complete approved baseline. This release does not count those articles as newly written or newly reviewed.

## Verification

- Both complete source builds passed: 375 military and 319 civilian English search pages.
- Military, civilian, shared-entity, school, blog-source, affordability, ownership-study and archived BAH-source checks passed.
- The exact candidate passed 32 photography/homepage/header browser checks. The matching source build passed 34 integration browser checks, including automatic maps and synthetic accepted-receipt fixtures isolated from all external providers.
- Public readback verified all 694 sitemap HTML pages, 10 discovery/index files and two real 404 responses. HTML matched the candidate after reversing only observed Cloudflare email-protection/security additions and normalizing line endings and surrounding whitespace.
- Eight live browser checks passed. Both homepages rendered at phone and desktop widths; the civilian homepage showed the corrected ZIP values and review proof; site search returned a school guide and blog article; profile links matched the verified review records.
- Both live school maps loaded map tiles with zero activation clicks. The browser allowed only read requests, blocked analytics destinations and blocked all POST requests. No real inquiry or test lead was submitted.

The preceding reconciliation record contains the [generator fixes, article-review hash provenance and repeat-build results](2026-09-09-photography-homepage-source.md). Those engineering corrections remain in maintained source for future builds.

## Release state and continuing work

This record establishes source publication, provider inventory integrity, public content readback and the stated browser behavior. It does not establish Google indexing changes, AI recommendations, referrals, qualified consultations or authentic CRM/notification delivery. Those outcome records remain separate.

Future releases must refresh both production identities, retain a complete verified baseline and use the sealed publication guard. Military automatic Git deployment stays disabled; civilian deployment stays separate. Do not publish from the older dirty shared checkout. The private release evidence and exact rollback baseline are recorded in `docs/source-publication-2026-09-09/` in the operator workspace.
