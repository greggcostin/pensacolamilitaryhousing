# School browsing layout update

The school hub now presents the existing public-grade card browser immediately after the interactive finder. The two long reference directories follow all of the card sections.

- Added category jumps and matching cards for 63 canonical private schools, 46 documented Christian schools, and five documented public magnet schools/programs.
- Christian schools also appear in Private; the visible introduction explains overlapping category counts.
- Private P badges identify school type, never an invented grade. Magnet cards use the matched official school grade and distinguish it from a program rating.
- Cards provide names, locality, reported grade levels, affiliations/programs, and existing canonical guide links.
- Static private resources now deduplicate the three known duplicate source identities and retain the primary record's information. All 271 guide links remain in the complete directory.
- `withSchoolFinder` integrates the repeatable transformation for both current HTML and future factory rebuilds.
- The school stylesheet URL includes its content hash so returning browsers receive updated card styles; the file-link audit checks the actual path before any cache-version query string.

Validation: seven new source-derived browsing checks; 29 finder check groups; civilian audit 310 pages with zero findings; entity audit 407 pages clean; analytics guard 409 HTML files with zero failures. Independent baseline comparison preserved all 15 script blocks, finder HTML, and all 87 existing grade-card links (82 schools plus five charter repeats).

Browser verification: desktop two-column cards; 375px mobile viewport with one-column 316px cards and no horizontal overflow; category jump and school-guide navigation work. Source data and individual school pages are unchanged.

Previous production release: `dc0d160d32eb16e3425b8ed172720e3c971c298a`, Cloudflare deployment `6c5df225-048f-43f5-9307-58f24fb5bc64`. Original blue-and-gold and complete school-release backup archives remain outside the deploy directory.
