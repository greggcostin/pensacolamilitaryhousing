// Overlay the reviewed identity change on the complete verified deployment snapshots.
import {readFileSync,writeFileSync,copyFileSync,mkdirSync} from 'node:fs';
import {join,resolve,dirname} from 'node:path';
import {spawnSync} from 'node:child_process';
import {stageBaseline,json,save,walk,inventory} from './isolated-release-lib.mjs';
import {refreshEntityHtml} from './entity-sync-lib.mjs';
const dir=resolve('docs/geo-execution-2026-09-10/identity-release');
const proof=json('docs/geo-execution-2026-09-10/production/production-baseline.json');
const candidate=resolve('.coast-release/geo-20260910/identity');
stageBaseline(proof,candidate);
const run=args=>{const r=spawnSync(process.execPath,args,{stdio:'inherit',windowsHide:true});if(r.status!==0)throw Error('Failed: '+args.join(' '));};
const gc=join(candidate,'gc'),pmh=join(candidate,'pmh');
run(['scripts/prepare-civilian-delivery.mjs','--root',gc,'--restore']);
run(['scripts/build-professional-profile.mjs','--root',gc]);
for(const [site,root] of [['gc',gc],['pmh',pmh]]){
 for(const file of walk(root).filter(p=>p.endsWith('.html')&&!p.endsWith('404.html'))){const h=readFileSync(file,'utf8'),n=refreshEntityHtml(h,{site});if(n!==h)writeFileSync(file,n);}
 copyFileSync('public/data/gregg-costin.json',join(root,'data/gregg-costin.json'));
}
const assetPattern=/<script type="module" crossorigin src="(\/assets\/index-[^"]+\.js)"><\/script>/;
const baselineHome=readFileSync(join(pmh,'index.html'),'utf8'),builtHome=readFileSync('dist/index.html','utf8');
const before=baselineHome.match(assetPattern),after=builtHome.match(assetPattern);
if(!before||!after||before[1]===after[1])throw Error('Expected a changed compiled application');
const baselineBuild=readFileSync('.coast-release/geo-20260910/source-baseline/build/index.html','utf8').match(assetPattern);
if(!baselineBuild||baselineBuild[1]!==before[1])throw Error('Remote source does not reproduce the current production bundle');
copyFileSync('dist'+after[1],pmh+after[1]);
for(const name of ['index','about','contact','pcs-guide','communities','mortgage-calculators']){
 const file=join(pmh,name+'.html');let html=readFileSync(file,'utf8');if(!html.includes(before[0]))throw Error('Missing existing application link '+name);html=html.replace(before[0],after[0]);
 if(name==='about'){
  const rootPattern=/<div id="root">[\s\S]*?<\/div>\s*<\/div>(?=\s*<!-- Site search modal)/;
  const body=readFileSync('dist/about.html','utf8').match(rootPattern)?.[0];
  if(!body||!rootPattern.test(html))throw Error('Missing initial About HTML');html=html.replace(rootPattern,body);
 }
 writeFileSync(file,html);
}
run(['scripts/prepare-civilian-delivery.mjs','--root',gc]);
// Build complete search indexes from the candidates, excluding unpublished source pages.
for(const site of ['gc','pmh'])run(['scripts/build-blog-search.mjs',site,'--root',join(candidate,site),'--gc-root',gc,'--report',join(dir,'search-'+site+'.json')]);
const record=inventory(proof,candidate);
if(record.removed.length)throw Error('No existing production assets may be removed');
save(join(dir,'candidate.json'),{...record,releaseMessage:'Add confirmed biography credentials and military initial HTML parity',sourceBundle:{baseline:before[1],candidate:after[1],remoteBaselineReproduced:true}});
console.log(JSON.stringify({candidate,changed:record.changes.length,preserved:record.preserved,removed:record.removed.length}));
