// Adopt an independently recorded peer successor after verifying its local bytes.
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {resolve,extname,join} from 'node:path';
import {createHash} from 'node:crypto';
import {blake3} from '@noble/hashes/blake3';
const root='docs/seo-geo-2026-09-06',dir='docs/growth-execution-2026-09-08/reviews/rebased';
const read=f=>JSON.parse(readFileSync(f,'utf8'));
const result=read(`${dir}/result.json`),live=read(`${dir}/live/production-baseline.json`),candidate=read(`${dir}/candidate.json`),publicResult=read(`${dir}/public-readback.json`);
const baseline='.coast-release/reviews-2026-09-09T04-40-06-759Z';
if(result.status!=='published-and-verified'||!live.ok||!publicResult.ok||resolve(candidate.candidate)!==resolve(baseline))throw Error('Peer verification incomplete or baseline mismatch.');
let exact=0;const sites=[];
for(const s of live.sites){
 const manifest=read(`${dir}/live/production-${s.site}.json`),local=resolve(baseline,s.site);
 if(manifest.deploymentId!==result.sites.find(r=>r.site===s.site)?.deploymentId)throw Error('Deployment mismatch.');
 for(const [p,expected] of Object.entries(manifest.files)){
  const file=resolve(local,'.'+p);if(!file.startsWith(local+'\\')||!existsSync(file))throw Error('Missing or invalid local file '+p);
  const actual=Buffer.from(blake3(readFileSync(file).toString('base64')+extname(p).slice(1))).toString('hex').slice(0,32);
  if(actual!==expected)throw Error('Local/provider hash mismatch '+s.site+p);exact++;
 }
 sites.push({site:s.site,deploymentId:s.deploymentId,assets:s.assetCount});
}
if(exact!==4098)throw Error('Unexpected inventory total.');
const earlier='.coast-release/2026-09-08-ai-cited-claims';
const protectedFiles=[['pmh','assets/costin-conversions.js'],['gc','assets/costin-conversions.js'],['pmh','assets/costin-region-tasks.js'],['gc','assets/costin-region-tasks.js'],['pmh','tools/ownership-model.js'],['pmh','bah-vs-cost-of-owning-pensacola.html'],['pmh','data/bah-ownership-study-2026.json'],['pmh','data/bah-ownership-study-2026.csv']];
for(const [site,p] of protectedFiles)if(!readFileSync(join(earlier,site,p)).equals(readFileSync(join(baseline,site,p))))throw Error('Protected implementation changed '+site+'/'+p);
if(!readFileSync(join(baseline,'pmh/index.html'),'utf8').includes("Pensacola's #1"))throw Error('Requested positioning missing.');
const state={recordedAt:new Date().toISOString(),observedAt:live.checkedAt,status:'reconciled_successor_verified',sourceEvidence:`${dir}/live/production-baseline.json`,sourceSha256:createHash('sha256').update(readFileSync(`${dir}/live/production-baseline.json`)).digest('hex'),latestObserved:Object.fromEntries(sites.map(s=>[s.site==='pmh'?'military':'civilian',s.deploymentId])),sites,currentVerifiedCompleteBaseline:baseline,lastVerifiedCompleteBaseline:baseline,assetsVerified:exact,protectedFilesCompared:protectedFiles.length,publicReadbackEvidence:`${dir}/public-readback.json`,publicationPerformedByThisTask:false,note:'Peer review-count successor adopts the reconciled civilian growth and newer mortgage-rate article. Local bytes were independently compared here with all saved provider file hashes. This resolves the previous baseline gap; refresh provider identity before a future deployment.'};
writeFileSync(`${root}/release-coordination.json`,JSON.stringify(state,null,2)+'\n');
for(const name of ['COORDINATION','RELEASE']){
 const file=`${root}/${name}.md`;let text=readFileSync(file,'utf8');const start='<!-- EXTERNAL_CIVILIAN_SUCCESSOR_START -->',end='<!-- EXTERNAL_CIVILIAN_SUCCESSOR_END -->';
 if(text.includes(start))text=text.slice(0,text.indexOf(start))+text.slice(text.indexOf(end)+end.length).trimStart();
 const note=`${start}\n**Reconciliation resolved. Current complete baseline:** ${baseline}/{pmh,gc}. The peer review-count release preserves the six civilian regional guides, loading changes, newer mortgage-rate article and earlier ownership/financial/receipt work. All **${exact} local assets** independently match the provider manifest captured at ${live.checkedAt}: military ${state.latestObserved.military} (${sites.find(s=>s.site==='pmh').assets} assets), civilian ${state.latestObserved.civilian} (${sites.find(s=>s.site==='gc').assets} assets). Eight protected study/model/conversion assets remain byte-identical to this task's earlier release, and the #1 statement remains present. The previous baseline warning is resolved. Refresh production identity before another release. [Reconciled peer release result](../growth-execution-2026-09-08/reviews/rebased/result.json). The narrative below records earlier releases.\n${end}\n\n`;
 writeFileSync(file,note+text);
}
for(const name of ['program','progress']){
 const file=`${root}/${name}.json`,d=read(file);d.releaseCoordination=state;d.updatedAt=state.recordedAt;
 Object.assign(d.metrics,{currentBaseline:baseline,currentBaselineStatus:state.status,lastVerifiedCompleteBaseline:baseline,publishedAssetsVerified:exact,latestProductionVerifiedAt:live.checkedAt,lastReleaseChangedHtmlPages:candidate.changes.filter(c=>c.path.endsWith('.html')).length});
 d.status=d.status.replace(/ Production coordination update:[\s\S]*$/,'')+' Production coordination update: the peer review-count successor is reconciled and verified against all 4098 provider asset hashes. It retains the earlier release, civilian growth guides and newer article.';
 for(const p of d.projects||[])if(p.id==='P01')p.next='Use '+baseline+' as the complete verified baseline; capture current provider identity before publication and preserve the reviewed content, shared identity, receipt handling and search assets.';
 const change={R01:{status:'published_verified',action:'Preserve the complete reconciled two-site review-count successor, including the earlier financial, regional and inquiry work.',acceptance:'4098 local asset hashes independently match the saved provider inventory; 693 indexable pages retained. Fresh preflight required before another deployment.',evidence:'release-coordination.json; ../growth-execution-2026-09-08/reviews/rebased/live/production-baseline.json'},R03:{status:'published_verified',action:'Use the reconciled peer successor as the baseline for future publications. Earlier release IDs remain historical evidence.',acceptance:'Military '+state.latestObserved.military+'; civilian '+state.latestObserved.civilian+'. Both provider inventories and scoped public readbacks pass.',evidence:'release-coordination.json; ../growth-execution-2026-09-08/reviews/rebased/public-readback.json'}};
 if(name==='progress')for(const [id,values] of Object.entries(change))Object.assign(d.taskUpdates[id],values);
 else for(const task of d.tasks||[])if(change[task.id])Object.assign(task,change[task.id]);
 writeFileSync(file,JSON.stringify(d,null,2)+'\n');
}
console.log(JSON.stringify({status:state.status,exact,protectedFiles:protectedFiles.length,sites,baseline,publicationPerformed:false},null,2));
