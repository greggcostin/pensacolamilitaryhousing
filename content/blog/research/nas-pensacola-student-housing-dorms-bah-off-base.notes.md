# Research notes: nas-pensacola-student-housing-dorms-bah-off-base

Session 2026-09-15. Research subagent (claude / opus-5). Pack: `content/blog/research/nas-pensacola-student-housing-dorms-bah-off-base.json` (28 claims, 16 sources, validatePack clean with no body, no em or en dashes).

## Sources opened (status)

| # | Source | Fetch route | Status |
|---|--------|-------------|--------|
| 1 | DoD FMR Vol 7A Ch 26 Housing Allowances (May 2025) | comptroller.defense.gov 403 to curl and WebFetch; browser redirect to comptroller.war.gov, curl there 200, pdftotext | Read 2.0, 5.0, 5.5, 8.1, 10.1, 10.2.1, 10.10.3, Tables 26-19 and 26-20 |
| 2 | DTMO BAH overview | WebFetch 403; browser pane | Read rate protection, BAH-Diff, entitlement routing |
| 3 | DTMO BAH FAQ | browser pane | Rendered the same content as the overview; no separate Q and A list; used only as corroboration |
| 4 | 2026 BAH FL064 (repo archive) | `node scripts/verify-bah-source.mjs` | ok: true, 96 values, sha256 5446fed8...; E-4 $1,794 / $1,521, E-5 $1,863 / $1,644, O-1 $1,914 / $1,719 |
| 5 | JTR 09/01/2026 (media.defense.gov) | travel.dod.mil and media.defense.gov 403 to curl; browser in-page fetch plus stream inflate | Read Table 1-6, par. 032201, section 0506 / par. 050601, Table 5-13, Table 5-8 |
| 6 | CNIC M-11103.2 CH-1 UH Operations Manual (12 Dec 2024) | ffr.cnic.navy.mil 403 to curl; browser in-page fetch plus inflate; some CID-font passages unreadable | Read ch. 2 par. 3.a to 3.d, section 4 Students, ch. 5 par. 2.b |
| 7 | Navy Housing NAS Pensacola page | browser pane | Read Contact, Unaccompanied Housing and Housing Services tabs |
| 8 | Navy Housing NAS Whiting Field page | browser pane | Read Contact and UH tabs |
| 9 | IWTC Corry Station reporting page and home page; CIWT home | browser pane | Read |
| 10 | AFI 32-6000 (18 Mar 2020) with DAFGM 2026-01 reissued 30 Apr 2026 | e-publishing 403 to curl; browser in-page fetch plus inflate; GM overlay unreadable | Read 1.2.27.16, 1.2.27.36, 1.2.36.8, 7.2.1, 7.3.2, 7.6, 7.7.1.1, 7.7.2.1 |
| 11 | AETC 479 FTG unit page | browser pane (12ftw.af.mil does not resolve in DNS) | Read |
| 12 | 479 FTG UCT Welcome Guide (CAO 27 August 2026) | browser in-page fetch plus inflate | Read Pre-Arrival Instructions and UOQ and Housing Information / UOQ FAQ |
| 13 | CNATRA TW-5 and TW-6 pages | WebFetch | Read |
| 14 | 50 U.S.C. 3955 (LII) | WebFetch | Read (b), (c), (d)(1), (e) |
| 15 | OPNAVINST 11103.1C | secnav.navy.mil DONI | UNAVAILABLE: URL redirects to the SECNAV front page; folder 11-100 Structures and Facilities Support lists no 11103 series document; probes for .1B/.1C/.1D return HTML |
| 16 | DAFMAN 32-6003 / DAFI 32-6000 | e-publishing | 404 (not found); AFI 32-6000 is the live document |
| 17 | DFAS pay tables index (for a partial BAH table) | browser pane | No partial BAH table listed |
| 18 | Military OneSource | not opened | Optional; not needed |

## Five load-bearing claims (status unverified, for the orchestrator)

1. `bah-basis`: FMR Vol 7A Ch 26 (May 2025) par. 2.0 (page 26-5) and par. 5.0 (page 26-23). Allowance based on grade, location, dependents; generally not authorized when assigned appropriate and adequate Government quarters.
2. `accession-pipeline`: FMR par. 10.10.3, 10.10.3.1, 10.10.3.3.1 (pages 26-64 to 26-65). Member without dependents in the accession pipeline gets no BAH except BAH-Partial at a training location; a training location of 20 or more weeks is a PDS for BAH authorization; new accession with a dependent is paid for the dependent's US location.
3. `jtr-140-day`: JTR 09/01/2026 par. 032201-A.1 (page 3B-1 to 3B-2) and Table 1-6 rule 2 (page 1-7). 139 or fewer days TDY; 140 or more days (20 weeks) PCS with the course location as the PDS.
4. `navy-uh-required`: Navy Housing NAS Pensacola page, Unaccompanied Housing tab, Barracks and Dorms paragraph (identical on the Whiting Field page): "Most personnel, E1-E3 and E4 < 4, are required to live in UH; E4s may be required to live on-base, space permitting."
5. `af-uoq-unaccompanied`: 479 FTG Welcome Guide CAO 27 August 2026, Pre-Arrival Instructions items 2 to 4 (page 5) and UOQ FAQ (pages 16 to 17): unaccompanied CSO students assigned to the UOQ on arrival regardless of rank or time in service; accompanied students may live on or off base and must contact Housing before a lease.

Also unverified: `calc-room-share-margin` (hypothetical, difference(1521, 700) = 821) so the orchestrator records the independent recomputation.

## Uncertain facts

- 2026 E-4 BAH-Partial dollar amount: not in the FMR chapter (par. 5.5.2 points to the 1997 partial BAQ rate); not on the DFAS pay tables index. Do not print an amount.
- OPNAVINST 11103.1C unavailable; the CNIC M-11103.2 CH-1 manual is the Navy UH policy cited.
- NAS Pensacola / Corry Station local student thresholds: only the Navy-wide E1-E3 and E4 under 4 years rule and "space permitting" language found; no installation instruction with occupancy figures.
- CNIC manual section 4 (Students) opening sentences unreadable (CID font); only the readable sentences are quoted.
- AFI 32-6000 DAFGM 2026-01 overlay unreadable; base paragraphs cited; the GM may modify them.
- Corry vs Goodfellow dorm comparison (Bing query): no official comparison; Navy student standard is 90 NSF shared bedroom, up to four per bathroom; AFI 7.3.2 gives no dimensions.
- $290 per day TLE cap on the flight-school page: not in the JTR text read; JTR says TLE is reimbursed at the locality per diem rate. Do not repeat the cap here.
- Navy Gateway Inn phone: IWTC page says 850-452-2755; 479 guide says 850-564-7473.

## Proposed H2 outline (question-shaped)

1. Will I live in the dorms or draw BAH as a student at NAS Pensacola or Corry Station? (bah-basis, navy-uh-required, partial-bah)
2. Is my course a PCS or a TDY, and why does that decide my housing? (jtr-140-day, tdy-rule, accession-pipeline)
3. Which grades must live in unaccompanied housing, Navy versus Air Force? (navy-uh-required, navy-student-standard, af-dorm-rule)
4. What is a Certificate of Non-Availability and when does Corry Station issue one? (navy-cna-95, jtr-non-availability, quarters-commander, nasp-uh-capacity)
5. Do Air Force CSO students at the 479th Flying Training Group live in the dorms? (af-uoq-unaccompanied, 479-mission)
6. What if I have dependents but arrive alone? (with-dependents-rule, calc-dependency-gap, bah-e4-with)
7. What is the 2026 FL064 BAH for a student at NAS Pensacola, Corry Station or Whiting Field? (bah-e4-without, bah-e4-with, bah-e5-without, bah-o1-without, rate-protection)
8. Once I hold a CNA, should I rent, share or buy? (calc-room-share-margin, scra-termination, jtr-tle-21)
9. Where do I check in for housing at each installation? (nasp-hsc-contact, whiting-hsc, iwtc-reporting, training-air-wings)

## Proposed table: dorm versus off base by status

| Status on arrival | Must live in UH? | Allowance | Partial BAH? | What opens the off-base door |
|---|---|---|---|---|
| Navy E-1 to E-3, or E-4 under 4 years, unaccompanied, PCS to school | Yes (Navy Housing page; CNIC Priority 2 Cat. IV and V) | None at the locality rate while assigned | Yes, BAH-Partial (FMR 5.5.1) | Written request to installation CO; CNA only at 95 percent occupancy (CNIC 3.d) |
| Navy new accession from boot camp (A school), no dependents | Yes (accession pipeline, FMR 10.10.3.1) | None except BAH-Partial | Yes | Same as above; realistically the dorm |
| Navy E-4 over 4 years, E-5 and up, unaccompanied, PCS | Eligible, space required or space available by priority | FL064 without-dependents rate once authorized (E-5 $1,644) | Only if assigned quarters | UH office assignment decision; CNA if no space |
| Any service, TDY course under 140 days, no dependents | Schoolhouse commander decides lodging (JTR 032201-B.2) | Keeps prior PDS allowance if authorized there; none if quarters assigned at PDS and below E-7 (FMR 10.1.1.2) | n/a | Statement of non-availability for lodging, not a CNA |
| Student with dependents, PCS, family not in quarters | May be housed in the dorm alone | With-dependents rate (FMR 10.2.1); E-4 $1,794 at FL064 | No | Dependents' location rules; finance office |
| Air Force UCT student, unaccompanied | Yes, UOQ regardless of rank or time in service (479 FTG guide) | None at the locality rate | Per FMR if single-type quarters | Guide grants no exception; accompanied orders change the answer |
| Air Force UCT student, accompanied | No; on or off base | With-dependents rate after finance in-processing (O-1 $1,914 at FL064 if applicable) | No | Contact Housing office before any lease |
| Air Force enlisted E-1 to E-3, E-4 under 3 years (general AFI rule) | Yes (AFI 1.2.27.16) | None while assigned | Yes | Relocation with allowances when utilization exceeds 95 percent (AFI 1.2.27.36) |

## Proposed checklist (before signing anything)

1. Read the orders: PCS or TDY, course length, dependents listed, reporting command (IWTC Corry Station, 479 STUS, TW-5, TW-6).
2. Report to the quarterdeck or STUCON first; housing instructions come from the command, not from a listing.
3. Ask the UH office in writing whether you are space-required and what the current occupancy is; a CNA is issued in eMH only at 95 percent or greater.
4. Check the BAH line on your LES after in-processing with finance; a published FL064 rate is not your entitlement.
5. If accompanied or CNA in hand, check in at the Housing Service Center (1581 Duncan Road Bldg 735 for NAS Pensacola and Corry; 570 Merrill Drive Milton for Whiting) for lease review and referrals.
6. Test the drive to the actual gate (Corry's gate, not the NAS Pensacola front gate; Whiting from Milton) at class report time.
7. Put the SCRA reference and a military clause in the lease; note that finishing a course without new PCS orders is not a statutory trigger.
8. Budget the room-share margin honestly: $1,521 minus rent, then utilities, insurance, deposit and fuel; a CNA can be temporary.
9. Only after the above, and only with a PCS-length stay and a lender, consider a purchase; BAH is not a price limit.

## Inconsistencies found in existing site pages versus primary sources

- `public/on-base-vs-off-base-nas-pensacola.html`: "E-1 to E-4, short tour: on-base preferred (simplifies low BAH...)" presents junior enlisted housing as a preference. The Navy Housing page says E1-E3 and E4 under 4 years are required to live in UH, and the FMR withholds the allowance while assigned. The page's "you forfeit your full BAH for on-base housing" is family PPV shorthand; FMR par. 2.1.4 treats privatized housing as not Government quarters (BAH is paid, rent goes to the partner). Not edited.
- `public/flight-school-housing-pensacola.html`: 21-day CONUS TLE matches JTR 09/01/2026 Table 5-13 (the task prompt's 14-day assumption is outdated). The page's $290 per day cap is attributed to Military.com; the JTR text read says TLE is reimbursed at the locality per diem rate. Flag only; not edited.
- `public/bases/corry-station.html`: consistent (Corry is a separate reporting destination; course title does not establish BAH eligibility). Adds nothing on UH or CNAs, which this article will supply.
- `public/bases/whiting-field.html` and `public/bases/nas-pensacola.html`: no UH or student allowance content; no conflicts found.
- The task prompt named OPNAVINST 11103.1C and DAFMAN 32-6003 as sources; neither is reachable on the official sites. The current documents are CNIC M-11103.2 CH-1 (12 Dec 2024) and AFI 32-6000 with DAFGM 2026-01.
