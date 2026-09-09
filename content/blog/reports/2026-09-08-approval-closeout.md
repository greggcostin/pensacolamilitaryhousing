# Approved civilian and military blog generator release

Publication update: the article is now live under explicit approval. See [the verified publication closeout](2026-09-09-publication-closeout.md). The remainder of this document records the earlier prepublication state.

Gregg approved pushing both blog upgrades on September 8, 2026. The civilian upgrade at `2ecb6e99` and military upgrade at `9e689504` are on GitHub main. The military review branch was also pushed. The approved military/shared generator files and their two absent committed dependencies were installed into the active workspace with backups and concurrent-change hash checks. Existing civilian article source and evidence already matched the approved version.

Final mobile checks extended the fixed-header spacing logic to civilian articles, raised the article heading rule above the existing site stylesheet, and made the article runtime refresh on a rebuild. Existing privacy and confirmed-inquiry behavior remain covered by regression checks. The combined release suite passed 60 tests; the active workspace's civilian and military suite passed 37 tests.

## Publication state

The mortgage article remains staged. A complete civilian release was assembled against the current production deployment, preserving its current navigation, professional record, entity graph, forms, assets and unrelated content. It changes 18 files and preserves 1,070 existing files byte for byte, with no removed files. The content matches the approved article. Plain contact-button labels and the existing quick-answer styling are included.

The candidate passes the civilian audit on 319 pages, the paired entity audit on 693 pages, the 100-point editorial gate and the 100-point formatting gate. Desktop and 390-pixel mobile verification found no broken images or horizontal overflow. Section headings remain visible below the fixed header, the FAQ expands and no console errors were observed.

Automatic approval review rejected deployment because the instruction to push and approve both blog changes did not explicitly authorize publishing the mortgage article to the live civilian domain. No civilian deployment or IndexNow submission was executed. The exact remaining approval is to publish the prepared mortgage article to greggcostin.com. Its dated benchmark still requires rechecking on or after September 10.

## Hosting issue found and corrected

The military GitHub main push automatically triggered a Cloudflare production deployment from the Git checkout. That checkout lacked newer directly published site changes. The prior verified military deployment was restored, and Cloudflare confirmed the restoration. Automatic production deployments on Git pushes were then disabled to enforce the existing draft-first policy. All other source/preview settings were preserved and verified.

Future release work must inspect hosting triggers before pushing main and compare the complete candidate against the actual current production manifest. A current Git branch alone does not prove that separately published site changes are present. Deploy only an approved, validated candidate; preserve the owning financial-guide pipelines and concurrent work.

## Work still outstanding

- Explicit publication authorization for the staged civilian mortgage article, followed by live verification and one scoped indexing submission.
- Source-reviewed refreshes of older articles. The new rules do not retroactively certify existing facts or benefits claims.
- Current-site intent review for military student housing and PCS sell-or-rent coverage, plus the planned civilian seller-concession and rental-ownership topics. Newer direct releases can contain guides absent from an older checkout; verify the existing canonical owner before writing.
- Verified Bing URL-indexing evidence, access to the existing civilian Clarity project, current comparable GSC reporting windows, and qualified-inquiry outcomes. Ranking and AI-citation improvements remain unmeasured.

No new article was created for the military site. No client messages, new schedules or paid API fallbacks were used.
