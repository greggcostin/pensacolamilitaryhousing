// Durable execution register for the first project; preserves the original research and AI runs.
import {readFileSync,writeFileSync,copyFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root='docs/seo-geo-2026-09-06',dir=root+'/projects/01-foundation';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const live=read(dir+'/live-verification.json'),production=read(dir+'/published/production-baseline.json');
if(!live.ok||!production.ok)throw Error('Do not record a successful release without successful production evidence.');
for(const name of ['program.json','implementation-register.csv','RELEASE.md','ai-benchmark.json'])if(!existsSync(dir+'/before/'+name))copyFileSync(root+'/'+name,dir+'/before/'+name);
const projects=[
 {id:'P01',title:'Published foundation and shared professional identity',priority:'P0',status:'published_verified',tasks:['R01','R02','R03','R11','R12','R13','R14','R15','R16','R19','R20'],next:'Keep the identity engine in place; finish independent awards, ranking and external-profile evidence under R19/R20.'},
 {id:'P02',title:'Reliable inquiries and qualified-lead measurement',priority:'P0',status:'next',tasks:['R06','R18'],next:'Confirm the deployed contact-worker version, fix downstream acceptance/error handling, test duplicate and failure behavior, then verify a controlled inquiry without contacting real prospects.'},
 {id:'P03',title:'Financial accuracy and military installation facts',priority:'P0',status:'planned',tasks:['R04','R05','R22','R23'],next:'Reconcile the 64 flagged live Eglin pages by context, then verify affordability assumptions, installation resources and commute methodology.'},
 {id:'P04',title:'Indexing and the fixed AI discovery baseline',priority:'P0',status:'planned',tasks:['R07','R17','R35'],next:'Inspect 20 priority URLs per domain in authenticated search tools; run the 16 core prompts across seven surfaces with three repeats and saved evidence.'},
 {id:'P05',title:'Mobile speed and page experience',priority:'P1',status:'planned',tasks:['R08','R09','R10'],next:'Obtain fresh field/lab evidence, diagnose the CRM widget and images, and test attribution before changing script scheduling.'},
 {id:'P06',title:'Documented proof, video and useful local distribution',priority:'P1',status:'planned',tasks:['R21','R25','R26','R34'],next:'Complete three consented transaction stories and the four prepared videos; turn real expertise into useful citations and approved partner outreach.'},
 {id:'P07',title:'Regional and installation depth',priority:'P2',status:'planned',tasks:['R27','R28','R29','R30','R31'],next:'Improve the existing Destin, Alabama, Navarre, Eglin/Hurlburt and extension pages with distinct local evidence before adding new URLs.'},
 {id:'P08',title:'Original ownership-cost data and useful comparison tools',priority:'P2',status:'planned',tasks:['R24','R32','R33'],next:'Build a sourced ownership-cost study and justified public data exports. The shared professional JSON record is the first completed R32 subtask.'},
 {id:'P09',title:'Thirty-, sixty- and ninety-day outcome review',priority:'P2',status:'planned',tasks:['R36'],next:'Measure qualified appointments and signed/closed business alongside citations and recommendations; scale the work supported by observed results.'},
];
const all=projects.flatMap(p=>p.tasks);if(all.length!==36||new Set(all).size!==36)throw Error('Every audit finding must have exactly one primary project.');
const taskUpdates={};
for(const id of ['R01','R03','R11','R12','R13','R14','R15','R16'])taskUpdates[id]={status:'published_verified',evidence:'projects/01-foundation/live-verification.json; RELEASE.md'};
Object.assign(taskUpdates,{
 R01:{...taskUpdates.R01,action:'Published complete, pinned baseline plus reviewed overlays; all original URLs and 3340 baseline files retained.',acceptance:'374 military and 319 civilian pages pass public readback; 542 school bodies and dates preserved outside the exact shared-identity transform.'},
 R03:{...taskUpdates.R03,action:'Foundation published with exact asset-hash and full sitemap readback. R06 inquiry acceptance remains independently open.',acceptance:'Production receipts, immutable prior deployments, asset hashes, canonical/schema checks and two real 404 probes per domain recorded.'},
 R04:{status:'in_progress',action:'Removed two stale calculator-summary price ranges; clarified civilian brokerage relationship and conditional preapproval against official sources. Full financial review remains open.',evidence:'src/routeSections.js; civilian-site/buy.html; PROJECTS.md'},
 R06:{status:'next',action:'Offline failure injection reproduced HTTP 200/success:true when all downstream services fail in the available local worker source. Confirm deployed code and repair delivery semantics.',evidence:'projects/01-foundation/contact-worker-local-probe.json',acceptance:'Server success requires a durable accepted inquiry; UI failures and retries behave correctly; stage/source and one conversion verified end to end.'},
 R07:{status:'in_progress',action:'IndexNow and Bing accepted 19 changed/new URLs after publication. Authenticated selected-canonical and indexing inspection of 20 URLs per domain is still pending.',evidence:'projects/01-foundation/indexing-receipts.json'},
 R19:{status:'in_progress',action:'Master record now regenerates existing schema, React data and public records. Florida/Alabama licenses verified in official registries; award/ranking evidence remains owner-supplied pending independent support.',evidence:'content/entity/entity.json; content/entity/evidence.json; scripts/entity-sync.test.mjs'},
 R20:{status:'in_progress',action:'Verified brokerage contact details, added Suite 125 and official license/profile links, and recorded owner-confirmed hours. External directory edits and routing review remain pending.',evidence:'content/entity/evidence.json; projects/01-foundation/README.md'},
 R32:{status:'in_progress',action:'Identical professional JSON records are published on both sites with dated source checks. Market datasets and original study exports are separate future work.',evidence:'https://greggcostin.com/data/gregg-costin.json'},
});
const progress={updatedAt:new Date().toISOString(),status:'Project 01 foundation is published and verified on both domains. The 36-finding program continues through nine ordered projects. Inquiry delivery, complete financial reconciliation, external-profile updates and measured AI recommendation performance remain open.',metrics:{liveMilitaryUrls:374,liveCivilianUrls:319,publishedAssetsVerified:3620},projects,taskUpdates};
writeFileSync(root+'/progress.json',JSON.stringify(progress,null,2)+'\n');
const documents=['AUDIT.md','implementation-register.csv','CONTENT-AND-DISTRIBUTION.md','ai-benchmark.json','RELEASE.md'];
const coverage={reviewedAt:new Date().toISOString(),purpose:'All five requested documents are retained as evidence and mapped into the execution program. Source paths identify the original snapshots where a current register or release record has since been updated. Reading and mapping a recommendation does not mark it implemented.',documents:documents.map(file=>{const sourceFile=existsSync(dir+'/before/'+file)?'projects/01-foundation/before/'+file:file;const body=readFileSync(root+'/'+sourceFile,'utf8');return {file,sourceFile,sha256:createHash('sha256').update(body).digest('hex'),headings:file.endsWith('.md')?body.split(/\r?\n/).filter(l=>/^#{1,4} /.test(l)):undefined,role:file==='ai-benchmark.json'?'96 prepared prompts, 16 core, seven surfaces, three repeats; no observations fabricated':file==='implementation-register.csv'?'Original 36 findings, each assigned once in the current register':file==='RELEASE.md'?'Historical release plan superseded by the dated published record':'Research and content sources for the mapped projects'};}),projects};
writeFileSync(dir+'/document-coverage.json',JSON.stringify(coverage,null,2)+'\n');
const benchmark=read(root+'/ai-benchmark.json');
const browser={checkedOn:'2026-09-07',method:'CUA browser DOM snapshots, real navigation and temporary viewport overrides; no form submitted.',candidate:'http://127.0.0.1:9041 and http://127.0.0.1:9042',layoutChecks:15,widths:[390,768,1280],pages:['PMH /','PMH /about','GC /buy','GC /sell','GC /team'],documentWidths:[375,753,1265],horizontalOverflow:false,homeAnswers:5,buyerCards:3,sellerCards:3,militaryCommunities:19,spaRoutes:['/','/about','/contact','/pcs-guide','/communities','/mortgage-calculators'],routeFindings:[],pcsFaqCount:6,faqCountAfterReturningHome:0,search:{query:'Bellview Middle School',results:25,firstResult:'Bellview Middle School',opened:'/schools/bellview-middle-school.html'},liveProfileChecks:['https://greggcostin.com/team','https://pensacolamilitaryhousing.com/about'],contactHours:'6 a.m. to midnight Central, daily',googleBusinessProfilePolicy:'Keep 24-hour availability; no external profile edit performed',limitations:'DOM geometry and browser navigation checks; not a field-performance or lead-delivery test.'};
writeFileSync(dir+'/browser-verification.json',JSON.stringify(browser,null,2)+'\n');
const lines=projects.map(p=>`| ${p.id} | ${p.priority} | ${p.title} | ${p.tasks.join(', ')} | ${p.status.replaceAll('_',' ')} |`).join('\n');
writeFileSync(root+'/PROJECTS.md',`# Project-by-project GEO implementation

Updated September 7, 2026. The first foundation project is published on both domains. The original research remains the September 6 baseline; published changes and open work are recorded separately.

## What is live now

- Five military homepage answers connect the installation, budget, remote purchase, temporary lodging and rent/buy/sell decisions to useful next steps. The #1 statement remains in HTML and React.
- Civilian buying and selling each have three practical decision sections leading to ownership costs, documents, planning and net proceeds. Their nine previously unpublished guide destinations are included in the complete release.
- All 19 military community summaries share one data source between HTML and React.
- All six military SPA routes participate in the complete 374-page English search index. The school search returns Bellview Middle School first and opens its report.
- The responsive footer remains within its columns at phone, tablet and desktop widths. Builds preserve existing review dates.
- The shared identity generator now refreshes existing entity blocks. Previously a generated marker caused the routine to skip updated master facts.
- Both domains publish identical professional JSON records; 693 pages reference the same canonical Gregg, team and brokerage identities. Full records and compact references agree.
- The military About page and civilian team page show the same professional details and official license links.
- Client-side SPA navigation now updates structured data, canonical URLs and language links together. Interior routes no longer inherit the homepage WebPage and Service descriptions; PCS FAQ markup is removed when leaving that route.

## Verified identity and owner preferences

Florida license SL3630964 was Current, Active in the official DBPR record on September 7, 2026. Alabama license 000171694-0 was Active in the official AREC record. The brokerage profile corroborated the business phone, email and 220 W Garden St, Suite 125, Pensacola, FL 32502 office.

The owner confirmed personal contact hours of 6 a.m. to midnight Central, daily, and instructed that Google Business Profile keep its 24-hour setting. Those are separate fields in the master record. This work did not change any external business profile.

The proof register distinguishes official registry facts, brokerage corroboration and owner-supplied military biography, awards and ranking statements. It preserves the requested #1 positioning. It does not manufacture independent ranking evidence. Florida's registry currently lists an expiration of September 30, 2026; the register flags that date for recheck.

Public professional records: [GreggCostin.com](https://greggcostin.com/data/gregg-costin.json) and [PensacolaMilitaryHousing.com](https://pensacolamilitaryhousing.com/data/gregg-costin.json). These support consistent reuse; they do not automatically edit third-party directories or guarantee AI recommendations.

## Ordered project register

| Project | Priority | Work | Audit findings | Status |
|---|---|---|---|---|
${lines}

Every one of the 36 original findings has one primary project. R19 and R20 remain open for their supporting evidence and external-profile portions even though the shared identity engine is live. R32's professional-record export is complete; market datasets remain future work.

## The next consequential fixes

${projects.slice(1).map(p=>`### ${p.id}: ${p.title}\n\n${p.next}\n`).join('\n')}

## Evidence and acceptance

[Release and verification](RELEASE.html) records both deployment IDs, the preserved rollback baseline, all 693 successful live pages, exact asset hashes and accepted indexing receipts. [Document coverage](projects/01-foundation/document-coverage.json) maps the complete audit, implementation register, content/distribution briefs, AI benchmark and release record into this program.

The available contact-worker source returned HTTP 200 and success:true in an offline simulation where all four attempted downstream requests returned 503. The test made zero network calls and sent no messages. The deployed worker version has not yet been matched to that source, so this is a confirmed source-code defect and a high-priority verification task, not a claim that specific real leads were lost.

The ${benchmark.promptCount}-question AI bank is still prepared, with ${benchmark.corePromptCount} core questions and ${benchmark.observations.length} recorded benchmark observations. Technical improvements, publication receipts and indexing submissions do not establish a measured AI recommendation rate.

The buyer-page wording corrections use [Florida's brokerage-relationship statute](https://www.leg.state.fl.us/Statutes/index.cfm?App_mode=Display_Statute&URL=0400-0499/0475/Sections/0475.278.html) and [CFPB preapproval guidance](https://www.consumerfinance.gov/owning-a-home/explore/get-a-preapproval-letter/). The broader financial-content audit remains P03.
`);
if(!existsSync(root+'/RELEASE-2026-09-06.md'))copyFileSync(dir+'/before/RELEASE.md',root+'/RELEASE-2026-09-06.md');
const deployments=production.sites.map(s=>`| ${s.site==='pmh'?'Military':'Civilian'} | ${s.deploymentId} | ${s.assetCount} | ${s.createdOn} |`).join('\n');
writeFileSync(root+'/RELEASE.md',`# Foundation release and production verification

Published September 7, 2026. Both domains passed public readback. This is the current release record; the [September 6 preparation record](RELEASE-2026-09-06.md) is retained as history.

## Release identity

| Site | Production deployment ID | Exact verified assets | Created UTC |
|---|---|---|---|
${deployments}

The reviewed release is stored at .coast-release/2026-09-07-foundation. Its manifest records every overlay and shared-identity transformation. Cloudflare's production file manifests match every one of the 3,620 public asset hashes. The _headers and _redirects configuration was uploaded from the preserved release baseline. No Git commit or push was performed by this implementation run; deployment Git metadata reflects the working checkout and is not the content manifest.

## What was verified

- 374 military and 319 civilian sitemap pages returned HTTP 200. Every original baseline URL remains present; nine civilian guide pages were added for the decision paths.
- All 693 page canonicals, indexing directives, JSON-LD blocks and shared-record references match the reviewed candidate. Both public professional JSON files match the generated record exactly.
- Candidate checks covered 64,489 internal references and 2,811 JSON-LD blocks with no findings.
- All 3,340 baseline files remain present. The 542 existing school pages preserve their content and review dates outside the exact shared-identity transformation. They are not described as byte-identical because their identity blocks and record links were intentionally refreshed.
- The military Pagefind index contains one English language and all 374 pages. A browser search found Bellview Middle School first and opened the retained guide.
- Fifteen browser layout checks covered five pages at 390, 768 and 1280 pixels. The footer phone and professional detail blocks stayed within their containers.
- All six SPA routes were exercised. Canonicals, language links, page schema and PCS-only FAQ markup followed navigation correctly. Both live professional profiles were inspected in the browser.
- Six identity regressions, three route-schema regressions, five indexing-validator tests and eight release/content checks passed. Military, civilian, entity and internal-link source gates passed.
- Two intentionally nonexistent paths per domain returned real HTTP 404 responses.
- IndexNow and Bing accepted six military and thirteen civilian changed/new URLs. Receipt is not evidence of indexing, citation or ranking.

## Release decision and limits

This release publishes the homepage, decision paths, profile and discovery foundation. The contact worker was not deployed or changed. Its end-to-end delivery has not been counted as passing. The offline source-code failure documented in P02 remains the next priority; no real client was contacted and no test lead was created.

The broader BAH/financial, external-profile, field-performance and AI benchmark work remains open. Existing award/ranking statements are not newly certified by the license checks. The successful checks above establish the released site behavior and preservation, not a #1 search result or guaranteed AI recommendation.

## Preserved rollback and baseline

The prior military deployment is 97a7b996-44be-4982-9c2f-75c8e544582f. The prior civilian deployment is 2e267a2f-6730-46d2-a3fb-477ed87aff65. Both were verified immediately before publication. Their complete asset sets are stored at .coast-release/2026-09-07-baseline.

The old .school-release/checkout military directory was not an exact production baseline: 60 assets were absent and 12 differed. A fresh baseline was reconstructed from the pinned deployment manifest and verified. All 2,436 military and 900 civilian public assets then matched exactly. Existing line-ending differences were normalized only when that produced the expected production hash.

## Evidence files

- [Live page checks](projects/01-foundation/live-verification.json)
- [Production deployment and asset verification](projects/01-foundation/published/production-baseline.json)
- [Baseline reconstruction](projects/01-foundation/baseline-restoration.json)
- [Complete candidate verification](candidate-verification.json)
- [Browser verification](projects/01-foundation/browser-verification.json)
- [Indexing receipts](projects/01-foundation/indexing-receipts.json)
- [Offline contact-worker probe](projects/01-foundation/contact-worker-local-probe.json)
- [Full project register](PROJECTS.html)

Future releases must begin from the current production manifests, preserve all successful URLs and assets, isolate the intended change set, and keep delivery and indexing outcomes separate from successful upload receipts.
`);
writeFileSync(dir+'/README.md',readFileSync(root+'/PROJECTS.md','utf8'));
const manifest=read(root+'/candidate-manifest.json');
manifest.publication={publishedOn:'2026-09-07',verified:true,deployments:production.sites.map(({site,deploymentId,url,createdOn,assetCount})=>({site,deploymentId,url,createdOn,assetCount})),evidence:'projects/01-foundation/live-verification.json'};
manifest.mode='published_verified_foundation';manifest.remaining=['Confirm deployed contact worker and complete R06 delivery semantics and end-to-end verification.','Complete financial and live Eglin context reconciliation.','Run authenticated indexing inspection and the fixed AI benchmark.','Finish external-profile and independent ranking/award evidence.'];
for(const file of [root+'/candidate-manifest.json',manifest.candidate+'/manifest.json'])writeFileSync(file,JSON.stringify(manifest,null,2)+'\n');
console.log('Recorded published foundation, 36 findings across 9 projects, preserved benchmark observations and detailed release evidence.');
