import {readFileSync,writeFileSync} from 'node:fs';
const root='docs/seo-geo-2026-09-06',dir=root+'/projects/08-measurement/2026-09-08';
const a=JSON.parse(readFileSync(dir+'/ai-observations.json','utf8')),g=JSON.parse(readFileSync(dir+'/indexing-summary.json','utf8')),protocol=JSON.parse(readFileSync(root+'/ai-benchmark.json','utf8'));
const completed=a.observations.filter(r=>r.completed),military=completed.filter(r=>/^EC-0(?:61|65|69|73|77|81|85)$/.test(r.promptId)),civilian=completed.filter(r=>/^EC-0(?:01|06|11|31|46|51|56)$/.test(r.promptId));
const count=(rows,key)=>rows.filter(r=>r[key]===true).length;
const table=a.surfaces.map(s=>{const m=military.filter(r=>r.platform===s.platform),c=civilian.filter(r=>r.platform===s.platform),all=completed.filter(r=>r.platform===s.platform);return `| ${s.platform} | ${s.completed}/48 | ${count(m,'greggRecommended')}/${m.length} | ${count(c,'greggRecommended')}/${c.length} | ${count(all,'greggPageCited')} |`;}).join('\n');
const regions=protocol.prompts.filter(p=>p.core&&p.id!=='EC-089'&&p.id!=='EC-090').map(p=>{const rows=completed.filter(r=>r.promptId===p.id);return `| ${p.id}: ${p.region} | ${rows.length}/21 | ${count(rows,'greggRecommended')} | ${count(rows,'greggPageCited')} |`;}).join('\n');
const citations=new Map();for(const r of completed.filter(r=>r.greggPageCited))for(const raw of new Set(r.ownedSourceUrls||[])){const u=new URL(raw);u.search='';u.hash='';const key=u.href;citations.set(key,(citations.get(key)||new Set()).add(r.runId));}
const sourceTable=[...citations].sort((a,b)=>b[1].size-a[1].size).slice(0,12).map(([url,runs])=>`| [${new URL(url).pathname}](${url}) | ${new URL(url).hostname} | ${runs.size} |`).join('\n');
const report=`# September 8 indexing, AI discovery and inquiry evidence

Updated ${a.updatedAt}. This is an observed baseline from authenticated consumer interfaces and saved provider records. It is not a claim of market-wide ranking, a controlled before/after experiment or proof that a release caused an AI answer.

## Authenticated indexing inspections

Twenty fixed priority URLs per domain were inspected in Google Search Console and read through Bing GetUrlInfo: **40 Google inspections and 40 Bing metadata records**. All 40 distinct Google URLs match the saved priority list.

| Domain | Initial indexed | Latest recorded indexed | Other latest verdicts |
|---|---:|---:|---|
| pensacolamilitaryhousing.com | 19/20 | ${g.latestRecordedSummary.pmh.indexed}/20 | The ownership study is discovered, currently not indexed. |
| greggcostin.com | 0/20 | ${g.latestRecordedSummary.gc.indexed}/20 | Five crawled, currently not indexed; fourteen unknown to Google. |

The civilian homepage changed from an initial crawled/not-indexed verdict to an indexed verdict on a later inspection, with a September 7 last-crawl time. Both captures are retained. This does not establish when actual index ingestion occurred or prove the sitemap resubmission or current release caused the changed verdict. A separate live homepage test succeeds and says the page can be indexed; a live-test result alone is not an indexed verdict.

The existing civilian sitemap was resubmitted once. At submission the interface showed a September 4 last-read date and 121 discovered pages, compared with 319 URLs in the current published sitemap. Civilian Navarre and the military ownership study each received one accepted request for Google's priority crawl queue. The request receipts are separate from indexing outcomes; no repeated requests were used to manufacture a success state.

Bing GetUrlInfo exposes discovery and crawl fields, not a Google-equivalent indexed verdict. Its HttpStatus 0 value is a provider field, not an observed HTTP failure. Bing indexed state is therefore unknown in this record.

- [Initial forty inspections as CSV](priority-indexing.csv), [priority URL list](priority-urls.json), [derived initial and later verdicts](indexing-summary.json).
- [Original Google captures](google-inspections.json), [remaining ten military captures](google-inspections-continuation.json), [Bing metadata](bing-inspections.json).
- [Civilian homepage reinspection](google-civilian-homepage-reinspection.json), [homepage live test](google-civilian-homepage-live-test.json), [study reinspection](google-military-study-reinspection.json).
- [Sitemap receipt](google-civilian-sitemap-submission.json), [Navarre indexing request](google-civilian-navarre-index-request.json), [study indexing request](google-military-study-index-request.json).

## Fixed AI benchmark

**${a.completed}/${a.target} responses saved; ${a.unrun} unrun; ${a.pendingSemanticReviews} semantic reviews pending.** The unchanged core panel is 16 questions, seven surfaces and three repeats, for 336 planned observations. The larger 96-question bank is retained, but its 80 non-core questions were not executed. Every captured core prompt is checked against the exact saved wording. Raw answer snapshots, visible citation URLs, timestamps and session context are saved; the normalized record includes a hash of each underlying evidence file.

Fresh conversations were used. The later ChatGPT and Claude repeat groups ran in separate owned browser tabs so provider response time did not force a change in prompt or model. Google AI Overviews/AI Mode used a Miramar Beach, Florida IP-derived location; location was not spoofed per query. Gemini used Flash-Lite, Claude used Opus 4.6 Max, Copilot displayed Smart, ChatGPT displayed High, and Perplexity used its default Search mode. Exact model versions were not exposed on every surface. ChatGPT Temporary Chat explicitly displayed Unpersonalized; Gemini Temporary and Claude Incognito were used. This does not prove that every provider ignored all account settings. Locale and model/session limitations remain attached to the raw observations.

These captures overlap the September 8 content releases. Retrieval may use older cached pages; repeats are not statistically independent users. The protocol is fixed, but this is not a frozen-content causal trial or a geographically representative ranking survey.

${a.collectionInterruption ? `Collection was interrupted by an internet-disconnection error. The subsequent browser inventory exposed only an empty in-app browser; the original authenticated Chrome surface was no longer available. All ${a.completed} saved responses are retained. The remaining ${a.unrun} keys stay unrun, not negative results. [Interruption evidence](collection-interruption.json) and [exact remaining prompts](ai-resume-queue.json) allow continuation without repeating or overwriting completed runs. No automatic resume was scheduled.` : ''}

| Surface | Responses saved | Military shortlist recommendations / completed military queries | Civilian shortlist recommendations / completed civilian queries | Answers with an owned-page citation |
|---|---:|---:|---:|---:|
${table}

A recommendation means the answer explicitly proposes Gregg as an agent to consider or interview, including a qualified shortlist entry. It does not mean first position, an exclusive endorsement or a verified superiority claim. A citation means an owned-domain link is visible in the answer or its cited-source presentation. Retrieved candidate sources and grouped related results are kept as source observations, and no link is assumed to prove every adjacent claim. False means not observed in the saved capture; null means unrun or unresolved. Unreviewed potential positives are not silently counted as confirmed results.

| Fixed query region | Completed / target | Gregg recommended | Owned page cited |
|---|---:|---:|---:|
${regions}

These two outcomes can diverge. The observed Perplexity Duke Field answer cited the military base guide while recommending other agents. A Claude Navarre answer cited the regional content without recommending Gregg. Some answers recommended Gregg through third-party profile evidence without an owned-domain citation. **Actual referral visits, accepted inquiries and qualified consultations are all unknown from these answer captures.**

Frequently visible owned pages in reviewed citations:

| Page | Domain | Distinct saved answers linking it |
|---|---|---:|
${sourceTable}

The observed military coverage is concentrated on the western installations. Several eastern-market answers characterize Gregg as Pensacola-centered and qualify their recommendation on that basis. Civilian city-query recommendations are materially weaker in this panel. These findings prioritize actual regional experience evidence, dated property-cost work and independently visible profiles; they do not justify repeating generic service-area text across interchangeable pages.

Citation accuracy needs its own review. A saved Claude Hurlburt answer used the retired FL023 code while citing the owned base page; the current verified model and page use FL056. A Navarre answer supplied generic flood/insurance ranges that the current source does not publish. Some Whiting answers supplied a 40% remote-closing share without independently verified transaction evidence. These are recorded as attribution errors or unresolved claims, not adopted as website facts. The study, buyer page, military-realtor page and Whiting housing revisions address actual source quality; they do not certify future model answers.

- [Normalized 336-row matrix with raw-file hashes](ai-observations.json).
- [Explicit semantic review decisions](ai-observation-reviews.json).
- [Fixed protocol and full question bank](../../../ai-benchmark.json).
- Individual files named by surface, EC question ID and repeat preserve the exact saved response. The earlier aggregate capture files are retained and deduplicated by surface/question/repeat.

## Authentic inquiry and conversion verification

Receipt-based browser success and conversion handling is published on both domains. Four unit checks and 24 isolated browser checks passed for the main release; the follow-up preserved those bytes and passed six more page/layout checks. A valid accepted receipt is required before success/conversion handling, duplicate receipts do not create a second measured lead in the tested client session, and browser analytics exclude receipt UUIDs and submitted identity fields. Local receipt storage is best-effort client deduplication, not a guarantee of exactly-once analytics delivery.

No real test lead, form submission to the production contact worker, unsolicited email or client message was sent for verification. The live CRM readback found a historical website-source record with an appointment stage, but it predates the receipt release. It cannot prove that a new accepted receipt, CRM note/stage and notification belong to the same inquiry, or that the appointment was a newly qualified consultation.

The existing token could not query worker telemetry through the API (403 authentication error). The authenticated Cloudflare dashboard did allow read-only inspection. Its three-day view showed eleven successful retained events: three unrelated GET requests and an eight-event group matching the September 7 health/CORS/invalid-payload/honeypot verification record. Those POST rows do not establish accepted real leads. The available view, sampling and retention are not evidence of zero real-world inquiries. No accepted receipt UUID joined to CRM and notification was observed.

**Still unverified:** one authentic accepted receipt joined to the corresponding CRM record and notification, plus browser-event evidence when available. The next valid evidence is a normal real inquiry or an existing accepted receipt record, read without creating a test lead. Follow the same receipt, timestamps, source and provider acceptance fields across systems; do not infer acceptance from HTTP 200 or a generic success screen.

- [Historical CRM readback and explicit missing joins](authentic-inquiry-readback.json).
- [Telemetry API failure](authentic-inquiry-worker-logs.json), [authenticated worker dashboard readback](authentic-inquiry-worker-ui.json).
- [Receipt/browser verification](../../03-accuracy/zip-and-claims/browser/verification.json), [scoped release](../../03-accuracy/zip-and-claims/README.md).

## Regional tasks and outcome definitions

Distinct Navarre guides extend the Perdido pilot. Dated county utility schedules support computed scenarios, not observed household bills. Property-specific tax, homeowners/wind/flood insurance, association/lease documents and actual route observations remain uncollected. The source record leaves those fields null. Publishing a polished guide is not a substitute for collecting this evidence.

Navarre checklist completion is a self-reported task event; CSV export is a tool-use event. Neither is an accepted inquiry. A qualified consultation requires a genuine conversation and verified intent, service-area/property fit, timing and a recorded next step. No new qualified consultation, agreement, closing or attributable revenue is established here. Aggregate reporting needs a dated hostname/source window and joined deduplicated outcomes; avoid placing client-identifying information in analytics or public evidence.
`;
writeFileSync(dir+'/README.md',report);
writeFileSync(dir+'/ai-summary.json',JSON.stringify({updatedAt:a.updatedAt,status:a.status,responses:a.completed,target:a.target,unrun:a.unrun,pendingSemanticReviews:a.pendingSemanticReviews,military:{completed:military.length,recommended:count(military,'greggRecommended')},civilian:{completed:civilian.length,recommended:count(civilian,'greggRecommended')},ownedCitationAnswers:count(completed,'greggPageCited'),referralVisits:null,acceptedInquiries:null,qualifiedConsultations:null},null,2)+'\n');
console.log('Wrote measurement report from saved observations.');
