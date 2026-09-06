# Escambia school guide editorial evidence

Checked: 2026-09-06. Scope: all 53 existing school report URLs associated with countyKey `FL|Escambia` in `civilian-site/assets/school-finder-data.json` at the time of this research. The editorial JSON has 53 distinct overviews, 106 highlights, 106 visit questions, and no missing or extra report routes.

The deliverable is `content/schools/report-editorial-escambia.json`. Its `records` object is keyed by the existing reportUrl. Each record contains name, schoolWebsite, overview, highlights, enrollment, visitQuestions, and sources. Every source entry carries the date checked. The checked date records access, not the publication year of an undated school page.

## Source approach

The [official district school directory](https://www.escambiaschools.org/schools) resolved district school subdomains. The [district charter directory](https://www.escambiaschools.org/departments/alternative-education/charter-schools) and school-owned websites were used for charter schools. Enrollment instructions link to the [district enrollment office](https://www.escambiaschools.org/departments/enrollment-services) or the school's own charter/magnet/virtual process. Program descriptions are paraphrased from official school pages. Questions are original suggestions prompted by those facts, not promises of services or admission.

A direct research batch retrieved the first 11 schools, N. B. Cook's homepage and West Pensacola's homepage; subsequent school-host requests returned HTTP 429, and that batch was stopped. Official pages were then read through web browsing and official indexed page content. These sources are identified individually in the JSON. Research did not rely on third-party ratings or reputation claims. Menu-only program evidence is explicitly described as the school's published directory or list, with current course availability left for confirmation. A listed club is not represented as having an available seat or a confirmed meeting this term.

The direct Myrtle Grove homepage timed out, but official indexed homepage, library and family-engagement content was available and used. The PBES bare domain failed in the web fetch; the official `www.pbes.org` site, registration and About pages were successfully located through official indexed content. Some school links yielded empty navigation pages or a cache miss; unsupported details from those pages were not added. In particular, no current IB claim was added for Workman, whose current site instead publishes technical-learning options.

## Current-year differences and limits

- **PSC Charter Academy:** [current application page](https://charteracademy.pensacolastate.edu/application-process/) says it moved to Pensacola Campus Building 11 starting fall 2025, at 1000 College Boulevard, serving grades 9–12. This differs from the older Warrington Campus address in the federal directory. The guide uses the current school information and does not alter coordinates.
- **Escambia Virtual Academy:** its [current site](https://escambiavirtualsc.escambiaschools.org/) lists the administrative office at 2400 Longleaf Drive, Building 3. Its full-time secondary registration page lists the 2026–27 fall window as August 3–September 1, already ended on the checked date. The guide does not imply immediate enrollment or a physical classroom campus.
- **Warrington Prep:** [current homepage](https://www.warringtonprep.org/) advertises grades 6–9 and ninth-grade entry for 2026–27. Historical NCES data describes grades 6–8. Future diploma pathways are not represented as completed current offerings.
- **Longleaf:** the [current school website](https://longleafes.escambiaschools.org/) uses “Longleaf K-8”; the report keeps its historical elementary identity. Current grade configuration is a question for the school, not inferred from the old grade range.
- **Pensacola High:** the current homepage publishes separate middle-school and high-school arrival procedures. The guide focuses on the verified high-school IB pathway; it does not infer a current grade-span revision.
- **N. B. Cook:** homepage and About page have inconsistent/older application dates. The guide retains verified arts-magnet and random-selection facts but directs families to the district for the current window.
- **West Florida High:** its homepage says the 2026–27 application is closed. The guide explicitly directs inquiries to the next cycle or an approved later-entry option.
- **Warrington Elementary:** its page mixes older kindergarten registration dates and differing dismissal times. No precise current cutoff or dismissal time is repeated.
- **Cordova Park and West Pensacola:** older directory grade ranges include grade 6; the guides ask families to confirm current spans rather than declaring those older ranges current.
- **Ferry Pass Elementary, McArthur, Montclair, Scenic Heights:** source pages mix current links with prior-year schedules, reading lists, forms or event information. The text identifies historical examples where used and asks for the current year's version.
- **Washington Marine Science:** the official page has detailed research examples and some older project links. These are described as published examples, not a guarantee that every field study runs this year.
- A Semmes PTA search result contained an unrelated N. B. Cook contact, so its PTA-specific details were not used. The guide uses Semmes' own homepage family-engagement and reading resources instead.

No school population, race, religion, income composition, property desirability, unsupported safety claims, reputational rankings or admission guarantees were added. Performance comparisons and nearby alternatives remain the responsibility of the separate report generator. Existing report URLs, school identities, grades, coordinates and site files were not modified by this editorial task.

## Route and primary editorial sources

All URLs below were checked through official web content on 2026-09-06. The JSON includes the full source list for each record.

| Existing report route | School-specific editorial sources |
| --- | --- |
| `/schools/a-k-suter-elementary-school` | [Source 1](https://suteres.escambiaschools.org/our-school/history) |
| `/schools/bellview-elementary-school` | [Source 1](https://bellviewes.escambiaschools.org/) |
| `/schools/bellview-middle-school` | [Source 1](https://bellviewms.escambiaschools.org/) |
| `/schools/beulah-academy-of-science` | [Source 1](https://beulahacademycs.escambiaschools.org/); [Source 2](https://beulahacademycs.escambiaschools.org/our-school) |
| `/schools/beulah-elementary-school` | [Source 1](https://beulahes.escambiaschools.org/our-school/about-beulah); [Source 2](https://beulahes.escambiaschools.org/) |
| `/schools/beulah-middle-school` | [Source 1](https://beulahms.escambiaschools.org/); [Source 2](https://www.escambiaschools.org/departments/workforce-education/career-academies) |
| `/schools/blue-angels-elementary-school` | [Source 1](https://blueangelses.escambiaschools.org/our-school/our-school) |
| `/schools/bratt-elementary-school` | [Source 1](https://brattes.escambiaschools.org/our-school/school-history); [Source 2](https://brattes.escambiaschools.org/) |
| `/schools/brentwood-elementary-school` | [Source 1](https://brentwoodes.escambiaschools.org/student-family-resources/curriculum-instruction) |
| `/schools/brown-barge-middle-school` | [Source 1](https://brown-bargems.escambiaschools.org/our-school) |
| `/schools/byrneville-elementary-school` | [Source 1](https://byrnevillees.escambiaschools.org/) |
| `/schools/c-a-weis-elementary-school` | [Source 1](https://weises.escambiaschools.org/community/community-partnership-school/sail-academy); [Source 2](https://weises.escambiaschools.org/community/community-partnership-school) |
| `/schools/cordova-park-elementary-school` | [Source 1](https://cordovaparkes.escambiaschools.org/our-school/art) |
| `/schools/ensley-elementary-school` | [Source 1](https://ensleyes.escambiaschools.org/classrooms/special-areas); [Source 2](https://ensleyes.escambiaschools.org/student-family-resources/mfr) |
| `/schools/ernest-ward-middle-school` | [Source 1](https://ernestwardms.escambiaschools.org/site-map) |
| `/schools/escambia-high-school` | [Source 1](https://escambiahs.escambiaschools.org/career-academies); [Source 2](https://escambiahs.escambiaschools.org/our-school/mfr) |
| `/schools/escambia-virtual-academy-franchise` | [Source 1](https://escambiavirtualsc.escambiaschools.org/registration/enrollment-options/eva-full-time-grades-6-12) |
| `/schools/ferry-pass-elementary-school` | [Source 1](https://ferrypasses.escambiaschools.org/classrooms/special-areas/music) |
| `/schools/ferry-pass-middle-school` | [Source 1](https://ferrypassms.escambiaschools.org/our-school/mfr) |
| `/schools/global-learning-academy` | [Source 1](https://glaes.escambiaschools.org/); [Source 2](https://glaes.escambiaschools.org/our-school/military-families) |
| `/schools/hellen-caro-elementary-school` | [Source 1](https://hellencaroes.escambiaschools.org/our-school/mfr) |
| `/schools/j-h-workman-middle-school` | [Source 1](https://workmanms.escambiaschools.org) |
| `/schools/j-m-tate-senior-high-school` | [Source 1](https://tatehs.escambiaschools.org/career-academies/agriscience); [Source 2](https://tatehs.escambiaschools.org/career-academies) |
| `/schools/jim-allen-elementary-school` | [Source 1](https://jimallenes.escambiaschools.org/our-school/mfr) |
| `/schools/jim-c-bailey-middle-school` | [Source 1](https://baileyms.escambiaschools.org/workforce-education); [Source 2](https://baileyms.escambiaschools.org/student-family-resources/mfr) |
| `/schools/kingsfield-elementary-school` | [Source 1](https://kingsfieldes.escambiaschools.org/our-school/mission-and-vision); [Source 2](https://kingsfieldes.escambiaschools.org/our-school) |
| `/schools/l-d-mcarthur-elementary-school` | [Source 1](https://mcarthures.escambiaschools.org/library/school-library) |
| `/schools/lincoln-park-elementary-school` | [Source 1](https://lincolnparkes.escambiaschools.org) |
| `/schools/longleaf-elementary-school` | [Source 1](https://longleafes.escambiaschools.org/our-school/school-history); [Source 2](https://longleafes.escambiaschools.org/) |
| `/schools/molino-park-elementary` | [Source 1](https://molinoparkes.escambiaschools.org) |
| `/schools/montclair-elementary-school` | [Source 1](https://montclaires.escambiaschools.org/our-school/montclair-information); [Source 2](https://montclaires.escambiaschools.org/library/school-library) |
| `/schools/myrtle-grove-elementary-school` | [Source 1](https://myrtlegrovees.escambiaschools.org/library); [Source 2](https://myrtlegrovees.escambiaschools.org/our-school/our-title-i-family) |
| `/schools/n-b-cook-elementary-school` | [Source 1](https://cookes.escambiaschools.org/our-school/administration/about-nb-cook) |
| `/schools/navy-point-elementary-school` | [Source 1](https://navypointes.escambiaschools.org) |
| `/schools/northview-high-school` | [Source 1](https://northviewhs.escambiaschools.org/career-academies/agritech); [Source 2](https://northviewhs.escambiaschools.org/student-life/clubs/ffa) |
| `/schools/o-j-semmes-elementary-school` | [Source 1](https://semmeses.escambiaschools.org) |
| `/schools/oakcrest-elementary-school` | [Source 1](https://oakcrestes.escambiaschools.org) |
| `/schools/pensacola-beach-elementary-school` | [Source 1](https://www.pbes.org/); [Source 2](https://www.escambiaschools.org/departments/transportation/parent-resources/pensacola-beach) |
| `/schools/pensacola-high-school` | [Source 1](https://pensacolahs.escambiaschools.org/international-baccalaureate/about-ib/the-ib-curriculum); [Source 2](https://pensacolahs.escambiaschools.org/international-baccalaureate/about-ib/application-process) |
| `/schools/pensacola-state-college-charter-academy` | [Source 1](https://charteracademy.pensacolastate.edu/about-us/faqs/) |
| `/schools/pine-forest-high-school` | [Source 1](https://pineforesths.escambiaschools.org) |
| `/schools/pine-meadow-elementary-school` | [Source 1](https://pinemeadowes.escambiaschools.org) |
| `/schools/pleasant-grove-elementary-school` | [Source 1](https://pleasantgrovees.escambiaschools.org) |
| `/schools/r-c-lipscomb-elementary-school` | [Source 1](https://lipscombes.escambiaschools.org) |
| `/schools/ransom-middle-school` | [Source 1](https://ransomms.escambiaschools.org) |
| `/schools/reinhardt-holm-elementary-school` | [Source 1](https://holmes.escambiaschools.org) |
| `/schools/scenic-heights-elementary-school` | [Source 1](https://scenicheightses.escambiaschools.org) |
| `/schools/sherwood-elementary-school` | [Source 1](https://sherwoodes.escambiaschools.org/our-school/leader-in-me/leader-in-me-home) |
| `/schools/warrington-elementary-school` | [Source 1](https://warringtones.escambiaschools.org) |
| `/schools/warrington-preparatory-academy` | [Source 1](https://www.warringtonprep.org/apps/pages/index.jsp?pREC_ID=1065852&type=d&uREC_ID=556743); [Source 2](https://www.warringtonprep.org/) |
| `/schools/washington-senior-high-school` | [Source 1](https://washingtonhs.escambiaschools.org/career-academies/marine-science) |
| `/schools/west-florida-high-school-technical` | [Source 1](https://westfloridahs.escambiaschools.org/our-school/our-story); [Source 2](https://westfloridahs.escambiaschools.org/) |
| `/schools/west-pensacola-elementary-school` | [Source 1](https://westpensacolaes.escambiaschools.org); [Source 2](https://westpensacolaes.escambiaschools.org/our-school) |
