// Verify a loading-only change against a complete, previously verified deployment.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {join,relative} from 'node:path';
import {spawnSync} from 'node:child_process';
import {json,save,inventory,fingerprint,walk,sha} from './isolated-release-lib.mjs';
import {preparePageLoading} from './page-loading-lib.mjs';
const dir=process.argv[2];if(!dir)throw Error('Provide a release evidence directory');
if(existsSync(join(dir,'deployment.json')))throw Error('Published candidates are immutable');
const c=json(join(dir,'candidate.json')),baseline=json(join(c.candidate,'baseline.json')),record=inventory(baseline,c.candidate);
assert.ok(baseline.ok);assert.equal(record.removed.length,0,'No production asset may be removed');
const roots=Object.fromEntries(baseline.sites.map(s=>[s.site,join(c.candidate,s.site)]));
const tokens=(html,pattern)=>[...html.matchAll(pattern)].map(m=>m[0]);
const preserved={pages:0,scripts:0,images:0,styles:0};
for(const s of baseline.sites)for(const f of walk(s.localBaseline)){
 const path=relative(s.localBaseline,f),out=join(roots[s.site],path);
 if(!path.endsWith('.html')){assert.equal(sha(f),sha(out),'Non-HTML asset changed: '+s.site+'/'+path);continue;}
 const before=readFileSync(f,'utf8'),after=readFileSync(out,'utf8');
 const options={hasAsset:p=>p.startsWith('/')&&existsSync(join(roots[s.site],p.slice(1)))};
 assert.equal(after,preparePageLoading(before,options).html,'Unexpected page change '+s.site+'/'+path);
 assert.equal(preparePageLoading(after,options).html,after,'Not idempotent '+s.site+'/'+path);
 for(const [name,pattern] of [['scripts',/<script\b[\s\S]*?<\/script>/g],['images',/<(?:picture\b[\s\S]*?<\/picture|img\b[^>]*)>/g],['styles',/<style\b[\s\S]*?<\/style>/g]]){
  const a=tokens(before,pattern),b=tokens(after,pattern);
  assert.deepEqual(name==='styles'?a.toSorted():a,name==='styles'?b.toSorted():b,'Changed '+name+' '+s.site+'/'+path);preserved[name]+=a.length;
 }
 const body=h=>h.slice(h.indexOf('<body')).replace(/<style\b[\s\S]*?<\/style>/g,'').replace(/<link\b[^>]*>/g,'').replace(/\s+/g,' ').trim();
 assert.equal(body(before),body(after),'Visible content or controls changed '+s.site+'/'+path);preserved.pages++;
}
assert.ok(record.changes.every(f=>f.before&&f.path.endsWith('.html')),'Only existing HTML pages may change');
save(join(dir,'candidate.json'),{...c,...record});
const commands=[];
for(const args of [
 ['--test','scripts/page-loading.test.mjs','scripts/civilian-home-preload.test.mjs','scripts/civilian-delivery.test.mjs'],
 ['scripts/rehearse-review-release.mjs',dir],
 ['scripts/check-blog-sources.mjs','gc'],['scripts/check-blog-sources.mjs','pmh'],
 ['scripts/audit-entity.mjs','--gc-root',roots.gc,'--pmh-root',roots.pmh],
 ['scripts/audit-civilian.mjs','--root',roots.gc,'--json'],
 ['scripts/audit-military.mjs','--root',roots.pmh,'--json']
]){
 const result=spawnSync(process.execPath,args,{encoding:'utf8',windowsHide:true}),log=join(dir,'gate-'+(commands.length+1)+'.txt');
 writeFileSync(log,(result.stdout||'')+(result.stderr||''));commands.push({args,exitCode:result.status,log,sha256:sha(log)});assert.equal(result.status,0,'See '+log);
}
const integration=json(join(dir,'integrated-browser.json')),photos=json(join(dir,'photography-browser/browser.json')),meta=json(join(dir,'meta-browser.json')),loading=json(join(dir,'loading-current-after.json'));
assert.ok(integration.checks.every(c=>c.pass)&&photos.ok&&meta.passed,'Browser gates must pass');
assert.ok(loading.results.filter(r=>r.route==='/schools').every(r=>r.mapLoaded),'Both school maps must start automatically');
assert.ok(loading.results.every(r=>r.scrollWidth<=r.width&&r.sumCLS<0.1),'Loading fixtures must retain a stable layout');
const domains={'greggcostin.com':'gc','pensacolamilitaryhousing.com':'pmh'},broken=[];let checkedLinks=0;
for(const [site,root] of Object.entries(roots)){
 const redirects=readFileSync(join(root,'_redirects'),'utf8').split(/\r?\n/).filter(l=>l.trim()&&!l.trim().startsWith('#')).map(l=>l.trim().split(/\s+/)[0]);
 for(const file of walk(root).filter(f=>f.endsWith('.html')))for(const m of readFileSync(file,'utf8').matchAll(/<a\b[^>]*href=["']([^"']+)["']/gi)){
  if(!/^https?:|^\//.test(m[1])||m[1].startsWith('//'))continue;
  let u;try{u=new URL(m[1].replaceAll('&amp;','&'),`https://${site==='gc'?'greggcostin.com':'pensacolamilitaryhousing.com'}`);}catch{continue;}
  const target=domains[u.hostname];if(!target)continue;checkedLinks++;
  const path=decodeURIComponent(u.pathname),base=join(roots[target],path);
  if([base,base+'.html',join(base,'index.html')].some(existsSync)||target===site&&redirects.includes(path))continue;
  broken.push({site,file:relative(root,file),path,target});
 }
}
save(join(dir,'candidate-links.json'),{checkedLinks,broken});assert.equal(broken.length,0,'Candidate internal links');
const result={checkedAt:new Date().toISOString(),candidate:c.candidate,candidateFingerprint:fingerprint(c.candidate),ok:true,scopeLabel:'Existing search styles delivered earlier, redundant fonts removed where local fonts exist, deduplicated font hints and the existing military school hero preloaded',commands,browserChecks:{integration:integration.checks.length,photography:photos.checks.length,meta:meta.checks.length,loading:loading.results.length},checkedLinks,preservation:preserved,preservedFiles:record.preserved,changedFiles:record.changes.length,removed:0};
save(join(dir,'quality-gates.json'),result);console.log(JSON.stringify(result));
