// Ledger + queue record for this run. Pass --published <deployment.json> after deployment to update the same entry.
import fs from 'node:fs';import path from 'node:path';
const root=path.join(import.meta.dirname,'source'),slug='what-moves-mortgage-rates',runId='civilian-blog-engine-2026-09-14',date='2026-09-14';
const json=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8')),save=(p,x,indent=1)=>fs.writeFileSync(path.join(root,p),JSON.stringify(x,null,indent)+'\n');
const arg=k=>process.argv.includes(k)?process.argv[process.argv.indexOf(k)+1]:null;const dep=arg('--published')?JSON.parse(fs.readFileSync(arg('--published'),'utf8')):null;
const ledger=json('content/civilian-blog/ledger.json');
let run=ledger.runs.find(r=>r.id===runId);
if(!run){run={id:runId,date,provider:'claude',model:'claude-opus-5[1m]',effort:'default',selectionReason:'Scheduled Monday run; Claude primary provider available (no fallback)',fallbackReason:null,leaseId:'cf6086b3-7c13-4bd1-bf64-4090bf116b24',posts:[slug],kind:'owner-requested-refresh',score:100,formatting:100,autoPublish:true,report:'docs/civilian-blog-engine/2026-09-14/README.md',
 decision:'Owner request (queue requestedOrder 2, notBefore 2026-09-14) selected by the planner. Current-events check found no override: no Gulf tropical threat, Fed decision scheduled September 16 (after this run), no new Florida insurance action. Refresh queue empty; radar 9 days old. Dedup: the refreshed URL is the intent owner (INTENT-REVIEW hits were this article, the Fed article and the blog hub).',
 sources:['Freddie Mac PMMS September 10, 2026 (6.76%, prior 6.71%)','Federal Reserve FOMC statement July 29, 2026 (3.50%-3.75% maintained)','FOMC calendar (September 15-16, 2026)','Federal Reserve policy explainer (overnight rate definition, expectations channel)','U.S. Treasury daily par yield curve (10-year 4.96% on September 11, 2026)','FEDS 2021-048 section III.A','CFPB credit, points, rate-lock and Loan Estimate pages','Fannie Mae B2-1.1-01'],
 image:'/images/mortgage-benchmarks-20260914.jpg (Wikimedia Commons, Infrogmation of New Orleans, CC BY-SA 3.0); 3 candidates viewed, 2 HABS scans rejected',
 words:2194,
 measurement:{bing:'2 page rows, 6 query rows, 19 traffic days through 2026-09-12, site 43 imp / 2 clicks; no blog rows (unknown). GetUrlInfo HTTP 400. URL Inspection (browser): article Discovered but not crawled, discovered 2026-08-26, not indexed.',clarity:'Project ydd39cyp64 via signed-in browser, 2026-09-07 to 2026-09-13 UTC: 145 sessions (40 bots excluded), 89 users; no blog URL in top 12; CSV retained.',gsc:'Retained 2026-09-12 workbook; no new export; article unknown.',qualifiedInquiries:'unavailable'},
 hypothesis:{change:'Dated federal-funds versus mortgage-rate section with a three-benchmark table and a pre-meeting quote-comparison step',outcome:'Readers arriving on rate questions reach the buyer or contact path better informed; measured as accepted inquiries from this URL',deploymentStatus:'prepared',deploymentDate:null,reviewWindow:'At least 28 complete days after deployment, same property/host filters, comparable cohorts; inconclusive if samples are inadequate.'},
 performanceChange:'not measured',deployed:false,status:'sealed-candidate-awaiting-deployment'};ledger.runs.push(run);}
if(dep){run.deployed=dep.status==='provider-success';run.deployedAt=dep.finishedAt;run.deploymentId=dep.sites[0].after;run.status=run.deployed?'published-and-live-verified':'deployment-needs-attention';run.hypothesis.deploymentStatus=run.deployed?'published':'not deployed';run.hypothesis.deploymentDate=dep.finishedAt;}
const post=ledger.posts.find(p=>p.slug===slug);
post.dateModified=date;post.image='/images/mortgage-benchmarks-20260914.jpg';post.refreshHistory=post.refreshHistory||[];
let rh=post.refreshHistory.find(r=>r.runId===runId);
if(!rh){rh={runId,date,kind:'owner-requested substantive refresh',models:{research:'claude-opus-5[1m]',write:'claude-opus-5[1m]'},evidenceFile:'content/civilian-blog/research/'+slug+'.json',datePublished:post.datePublished,dateModified:date,scoreAfter:100,formatting:100,publication:'sealed candidate',performanceChange:'not measured',summary:'New federal-funds section (policy target, overnight-rate definition, expectations channel, September 15-16 meeting), a dated three-benchmark table, a pre-meeting comparison step linking the Fed guide, new licensed image, all sources reopened.'};post.refreshHistory.push(rh);}
if(dep){rh.publication=run.deployed?'published '+dep.finishedAt+' deployment '+dep.sites[0].after:'deployment needs attention';}
post.metrics=post.metrics||[];if(!post.metrics.some(m=>m.runId===runId))post.metrics.push({date,runId,bingPage:'No API page row (unknown); URL Inspection: Discovered but not crawled since 2026-08-26',clarity:'Site cohort 2026-09-07..13 via browser CSV; per-post not queried',google:'Retained 2026-09-12 workbook; article absent (unknown)',qualifiedInquiries:'unavailable'});
save('content/civilian-blog/ledger.json',ledger,1);
const q=json('content/civilian-blog/topic-queue.json');const item=q.queue.find(x=>x.slug===slug);
if(item&&dep&&run.deployed){item.status='completed';item.completedAt=date;item.completedRun=runId;item.publishedDeployment=dep.sites[0].after;}
else if(item&&!dep){item.status='in-progress';item.executionRun=runId;}
q.updated=date;save('content/civilian-blog/topic-queue.json',q,1);
console.log(JSON.stringify({run:run.status,queueItem:item&&item.status}));
