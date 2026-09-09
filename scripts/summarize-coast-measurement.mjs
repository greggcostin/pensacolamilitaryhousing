// Derive coverage from saved browser/provider evidence. Never manufacture missing runs.
import {readFileSync,writeFileSync,readdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root='docs/seo-geo-2026-09-06', dir=`${root}/projects/08-measurement/2026-09-08`;
const read=p=>JSON.parse(readFileSync(p,'utf8').replace(/^\uFEFF/,''));
const write=(p,d)=>writeFileSync(p,JSON.stringify(d,null,2)+'\n');
const benchmark=read(`${root}/ai-benchmark.json`), core=benchmark.prompts.filter(p=>p.core);
const interruption=existsSync(`${dir}/collection-interruption.json`)?read(`${dir}/collection-interruption.json`):null;
const priorities=read(`${dir}/priority-urls.json`), inspections=[];
for(const file of ['google-inspections.json','google-inspections-continuation.json'])for(const r of read(`${dir}/${file}`)){
 const s=r.snapshot||'', indexed=s.includes('URL is on Google')&&s.includes('Page is indexed');
 const status=indexed?'indexed':s.includes('Crawled - currently not indexed')?'crawled_currently_not_indexed':s.includes('URL is unknown to Google')?'unknown_to_google':'unclassified';
 inspections.push({url:r.url,site:new URL(r.url).hostname==='greggcostin.com'?'gc':'pmh',authenticated:r.authenticated,inspectedAt:r.inspectedAt||r.checkedAt,status,indexed:status==='unclassified'?null:indexed,evidence:file});
}
if(inspections.length!==40||new Set(inspections.map(r=>r.url)).size!==40)throw Error('Expected 40 distinct Google inspections');
for(const [site,paths] of Object.entries(priorities))for(const path of paths)if(!inspections.some(r=>r.site===site&&new URL(r.url).pathname===path))throw Error(`Missing priority ${site} ${path}`);
const indexing={updatedAt:new Date().toISOString(),scope:'20 fixed priority URLs per domain; authenticated Google indexed-state UI and Bing GetUrlInfo metadata',google:inspections,summary:{},bing:{records:read(`${dir}/bing-inspections.json`).results.length,indexedState:null,note:'GetUrlInfo exposes crawl/discovery metadata. HttpStatus 0 is a provider field, not evidence of an HTTP failure or an indexed verdict.'},sitemap:{site:'gc',submitted:'2026-09-08',accepted:true,lastReadAtSubmission:'2026-09-04',discoveredAtSubmission:121,currentPublishedSitemapUrls:319,evidence:'google-civilian-sitemap-submission.json',indexedAfterSubmission:null}};
for(const site of ['pmh','gc']){const rows=inspections.filter(r=>r.site===site);indexing.summary[site]={inspected:rows.length,indexed:rows.filter(r=>r.indexed===true).length,crawledCurrentlyNotIndexed:rows.filter(r=>r.status==='crawled_currently_not_indexed').length,unknownToGoogle:rows.filter(r=>r.status==='unknown_to_google').length,unclassified:rows.filter(r=>r.status==='unclassified').length};}
write(`${dir}/indexing-summary.json`,indexing);
const reinspections=[];
for(const file of ['google-civilian-homepage-reinspection.json','google-civilian-navarre-reinspection.json','google-military-study-reinspection.json'])if(existsSync(`${dir}/${file}`)){
 const r=read(`${dir}/${file}`),s=r.snapshot||'',status=s.includes('URL is on Google')&&s.includes('Page is indexed')?'indexed':s.includes('Crawled - currently not indexed')?'crawled_currently_not_indexed':s.includes('Discovered - currently not indexed')?'discovered_currently_not_indexed':s.includes('URL is unknown to Google')?'unknown_to_google':'unclassified';
 reinspections.push({url:r.url,site:new URL(r.url).hostname==='greggcostin.com'?'gc':'pmh',authenticated:r.authenticated,inspectedAt:r.checkedAt,status,indexed:status==='unclassified'?null:status==='indexed',evidence:file});
}
indexing.reinspections=reinspections;
indexing.latestRecorded=inspections.map(r=>reinspections.filter(x=>x.url===r.url).at(-1)||r);
indexing.latestRecordedSummary={};
for(const site of ['pmh','gc']){const rows=indexing.latestRecorded.filter(r=>r.site===site);indexing.latestRecordedSummary[site]={inspected:rows.length,indexed:rows.filter(r=>r.indexed===true).length,crawledCurrentlyNotIndexed:rows.filter(r=>r.status==='crawled_currently_not_indexed').length,discoveredCurrentlyNotIndexed:rows.filter(r=>r.status==='discovered_currently_not_indexed').length,unknownToGoogle:rows.filter(r=>r.status==='unknown_to_google').length};}
indexing.changeInterpretation='Preserve initial and later provider UI verdicts. A changed verdict does not establish timing of actual index ingestion or causality from this release/submission.';
write(`${dir}/indexing-summary.json`,indexing);
const quote=v=>'"'+String(v??'').replaceAll('"','""')+'"';
writeFileSync(`${dir}/priority-indexing.csv`,['site,url,authenticated,inspected_at,indexed,status,evidence',...inspections.map(r=>[r.site,r.url,r.authenticated,r.inspectedAt,r.indexed,r.status,r.evidence].map(quote).join(','))].join('\n')+'\n');
const aliases={'Gemini':'Gemini app','Claude':'Claude with web search','Google AI Overviews':'Google Search AI Overviews'};
const rawFiles=readdirSync(dir).filter(n=>/^(?:google-ai-overviews|google-ai-mode-ec-\d+-r\d+|(?:gemini|chatgpt|copilot|perplexity|claude)-benchmark(?:-continuation)?|(?:aov|aim|copilot|perplexity|gemini|claude|chatgpt)-ec-\d+-r\d+)\.json$/.test(n));
const runs=new Map(), overrides=existsSync(`${dir}/ai-observation-reviews.json`)?read(`${dir}/ai-observation-reviews.json`):{};
for(const file of rawFiles){let d=read(`${dir}/${file}`);for(const r of Array.isArray(d)?d:[d]){
 const promptId=r.promptId||r.id,p=core.find(p=>p.id===promptId);if(!p)throw Error(`Unexpected core prompt ${file} ${promptId}`);
 if(r.prompt!==p.prompt)throw Error(`Exact prompt mismatch ${file} ${promptId}`);
 const platform=aliases[r.platform]||r.platform;if(!benchmark.platforms.includes(platform))throw Error(`Unexpected platform ${platform}`);
 const repeat=r.repeat||1,key=`${platform}|${promptId}|${repeat}`,answer=r.answer||r.response||r.responseSnapshot||'',snapshot=r.responseSnapshot||'';
 const linked=[...(r.citedUrls||[]),...(r.citations||[]).map(x=>typeof x==='string'?x:x.url)].filter(Boolean);
 // Browser accessibility snapshots preserve visible link hrefs even on role=main divs.
 const snapshotUrls=[...snapshot.matchAll(/\/url: (https?:\/\/[^\n\s]+)/g)].map(m=>m[1]);
 const visibleSourceUrls=[...new Set([...linked,...snapshotUrls])].filter(u=>!/(?:support\.google\.com|support\.anthropic\.com|privacy\.anthropic\.com|chatgpt\.com\/(?:c\/|share\/)|copilot\.microsoft\.com|go\.microsoft\.com)/.test(u));
 const owned=visibleSourceUrls.filter(u=>{try{return /^(?:www\.)?(?:greggcostin\.com|pensacolamilitaryhousing\.com)$/.test(new URL(u).hostname);}catch{return false;}});
 const mention=/\bGregg\s+Costin\b|Gregg Costin Team/i.test(answer);
 const contexts=[...answer.matchAll(/.{0,170}(?:Gregg\s+Costin|Gregg Costin Team).{0,300}/gi)].map(m=>m[0]).slice(0,10);
 const record={runId:key,promptId,platform,repeat,intent:p.intent,audience:p.audience,region:p.region,completed:Boolean(answer.trim()),observedAt:r.observedAt||r.checkedAt,model:r.model??null,locale:r.locale??null,loggedIn:r.loggedIn??r.authenticated??null,session:r.session||r.personalization||(r.temporaryChat?'Temporary chat':null),answerEvidenceFile:file,answerEvidenceSha256:createHash('sha256').update(readFileSync(`${dir}/${file}`)).digest('hex'),greggMentioned:mention,greggRecommended:mention?null:false,greggPageCited:owned.length?null:false,visibleOwnedSource:owned.length>0,ownedSourceUrls:owned,visibleSourceUrls,sourceCaptureNote:'Visible citation/source links; related results and grouped sources are not proof every URL supports a particular claim. Snapshot links supplement tag-based extraction. Recommendation and citation review is separate.',recommendationReviewNeeded:mention,mentionContexts:contexts,referrals:null,qualifiedConsultations:null,...(overrides[key]||{})};
 if(r.citationErrors?.length)record.sourceCaptureErrors=r.citationErrors;
 const old=runs.get(key);if(!old||record.visibleSourceUrls.length>old.visibleSourceUrls.length)runs.set(key,record);
}}
const observations=[];for(const platform of benchmark.platforms)for(const p of core)for(let repeat=1;repeat<=benchmark.repeatsPerCorePrompt;repeat++){
 const key=`${platform}|${p.id}|${repeat}`;observations.push(runs.get(key)||{runId:key,promptId:p.id,platform,repeat,intent:p.intent,audience:p.audience,completed:false,unavailableReason:interruption?'not_run_browser_session_unavailable':'not_run',answerEvidenceFile:null,greggMentioned:null,greggRecommended:null,greggPageCited:null,referrals:null,qualifiedConsultations:null});
}
const report={updatedAt:new Date().toISOString(),status:observations.every(r=>r.completed)?'responses_collected_review_pending':'partial',target:observations.length,completed:observations.filter(r=>r.completed).length,unrun:observations.filter(r=>!r.completed).length,surfaces:benchmark.platforms.map(platform=>({platform,target:48,completed:observations.filter(r=>r.platform===platform&&r.completed).length})),interpretation:'A bounded authenticated-browser observation, not a population ranking or causal release test. No actual referral, qualified consultation or revenue data is established by these answers.',observations};
report.pendingSemanticReviews=observations.filter(r=>r.completed&&(r.greggRecommended===null||r.greggPageCited===null)).length;
if(interruption&&report.unrun)report.collectionInterruption={status:interruption.status,evidence:'collection-interruption.json',resumeQueue:'ai-resume-queue.json'};
if(report.completed===report.target&&report.pendingSemanticReviews===0)report.status='complete';
write(`${dir}/ai-observations.json`,report);
write(`${dir}/ai-resume-queue.json`,{updatedAt:report.updatedAt,target:report.target,remaining:report.unrun,rule:'Exact existing core prompts; only missing keys. Record new session, model and locale if changed. Do not overwrite saved evidence.',runs:observations.filter(r=>!r.completed).map(r=>({runId:r.runId,platform:r.platform,promptId:r.promptId,repeat:r.repeat,prompt:core.find(p=>p.id===r.promptId).prompt,unavailableReason:r.unavailableReason}))});
benchmark.status=report.status;
benchmark.execution={updatedAt:report.updatedAt,evidenceDirectory:'projects/08-measurement/2026-09-08',observationFile:'projects/08-measurement/2026-09-08/ai-observations.json',target:report.target,completed:report.completed,unrun:report.unrun,surfaces:report.surfaces,referrals:null,qualifiedConsultations:null};
if(report.collectionInterruption)benchmark.execution.collectionInterruption=report.collectionInterruption;
for(const p of benchmark.prompts){const measured=observations.filter(r=>r.promptId===p.id&&r.completed).length;p.status=!p.core?'not_run':measured===21?'responses_collected':measured?'partially_run':'not_run';}
write(`${root}/ai-benchmark.json`,benchmark);
console.log(JSON.stringify({indexing:indexing.summary,benchmark:{completed:report.completed,target:report.target,surfaces:report.surfaces},reviewNeeded:observations.filter(r=>r.completed&&(r.greggRecommended===null||r.greggPageCited===null)).map(r=>({runId:r.runId,owned:r.ownedSourceUrls,contexts:r.mentionContexts}))},null,2));
