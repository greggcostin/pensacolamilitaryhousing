// Record a peer release readback; never deploy or choose an unverified replacement baseline.
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root='docs/seo-geo-2026-09-06';
const source='docs/growth-execution-2026-09-08/reviews/moved-production/production-baseline.json';
const record=JSON.parse(readFileSync(source,'utf8'));
if(existsSync(`${root}/release-coordination.json`)){
 const current=JSON.parse(readFileSync(`${root}/release-coordination.json`,'utf8'));
 if(current.observedAt>record.checkedAt)throw Error('A newer coordination record already exists; do not restore this historical warning.');
}
const civilian=record.sites.find(s=>s.site==='gc'),military=record.sites.find(s=>s.site==='pmh');
if(civilian.deploymentId!=='ec4e5d5e-97f3-4af9-a546-994921d4c850'||military.deploymentId!=='3b032ef3-214e-4934-833f-2db42abcb788')throw Error('Unexpected readback; review the new evidence before changing coordination.');
const state={
 recordedAt:new Date().toISOString(),observedAt:record.checkedAt,
 status:'newer_civilian_production_requires_reconciliation',
 sourceEvidence:source,sourceSha256:createHash('sha256').update(readFileSync(source)).digest('hex'),
 lastPublicationByThisTask:{military:'3b032ef3-214e-4934-833f-2db42abcb788',civilian:'571a1c5a-77f7-41fe-a6ce-16abfd71f59d'},
 laterCivilianGrowthRelease:'19ac3e4f-fec4-4ab6-aabf-7a812fec9836',
 latestObserved:{military:military.deploymentId,civilian:civilian.deploymentId},
 lastVerifiedCompleteBaseline:'.coast-release/2026-09-08-civilian-growth',
 currentVerifiedCompleteBaseline:null,
 comparison:{militaryExact:military.counts.exact,civilianExact:civilian.counts.exact,civilianChanged:civilian.counts.different,civilianMissingLocally:civilian.counts.missing},
 interpretation:'The later civilian production includes a mortgage-rate article/share/discovery update and added image variants. This task did not publish it. The peer release guard stopped an older review update. The authorizing task and complete local candidate for that intervening publication were not established here.',
 next:'Capture and reconcile the latest civilian inventory before deploying again, preserving the six regional guides/loading changes, receipt handling and all earlier financial/ownership work. Coordinate with the active civilian growth task. Do not deploy the older ai-cited-claims or civilian-growth directory unchanged.'
};
writeFileSync(`${root}/release-coordination.json`,JSON.stringify(state,null,2)+'\n');
function prepend(file){
 let text=readFileSync(file,'utf8');const start='<!-- EXTERNAL_CIVILIAN_SUCCESSOR_START -->',end='<!-- EXTERNAL_CIVILIAN_SUCCESSOR_END -->';
 if(text.includes(start))text=text.slice(0,text.indexOf(start))+text.slice(text.indexOf(end)+end.length).trimStart();
 const note=`${start}\n**Production coordination update, ${record.checkedAt}:** the civilian growth release was followed by civilian deployment ${civilian.deploymentId}. Military remains ${military.deploymentId}. This task did not publish the newer civilian version. The saved comparison has ${civilian.counts.different} changed files and ${civilian.counts.missing} added files relative to the civilian-growth directory. Its review-only preflight stopped before upload. **No currently verified complete local baseline has been established for this intervening release.** Reconcile the latest inventory before another deployment; the release directories described below are historical until that comparison passes. Details are in release-coordination.json and ../growth-execution-2026-09-08/reviews/moved-production/production-baseline.json.\n${end}\n\n`;
 writeFileSync(file,note+text);
}
prepend(`${root}/COORDINATION.md`);prepend(`${root}/RELEASE.md`);
for(const name of ['program','progress']){
 const path=`${root}/${name}.json`,d=JSON.parse(readFileSync(path,'utf8'));
 d.releaseCoordination=state;d.metrics.lastVerifiedCompleteBaseline=state.lastVerifiedCompleteBaseline;
 d.metrics.currentBaseline=null;d.metrics.currentBaselineStatus=state.status;
 d.status=d.status.replace(/ Production coordination update:[\s\S]*$/,'')+' Production coordination update: a newer civilian deployment was observed after the reviewed releases; capture and reconcile it before any further publication. The current complete local baseline is unverified.';
 if(d.projects)for(const p of d.projects)if(p.id==='P01')p.next=state.next;
 writeFileSync(path,JSON.stringify(d,null,2)+'\n');
}
console.log(JSON.stringify({latestObserved:state.latestObserved,comparison:state.comparison,currentVerifiedCompleteBaseline:null,publicationPerformed:false},null,2));
