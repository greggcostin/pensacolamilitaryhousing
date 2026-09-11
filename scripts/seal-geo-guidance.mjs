// Seal reviewed guidance on the complete verified production baseline.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {join,relative} from 'node:path';
import {spawnSync} from 'node:child_process';
import {json,save,inventory,fingerprint,walk,sha} from './isolated-release-lib.mjs';
const dir='docs/geo-execution-2026-09-10/guidance-release',c=json(join(dir,'candidate.json'));
if(existsSync(join(dir,'deployment.json')))throw Error('Published candidates are immutable');
const baseline=json(join(c.candidate,'baseline.json')),record=inventory(baseline,c.candidate);
assert.equal(record.removed.length,0,'No production asset removed');
const roots={gc:join(c.candidate,'gc'),pmh:join(c.candidate,'pmh')};
const pilot=json('content/schools/audience-guidance-2026-09.json').schools.map(s=>s.slug);
const campus=['gulf-shores-high-school','gulf-shores-middle-school','foley-high-school','orange-beach-elementary-school','orange-beach-middlehigh-school','swift-elementary-school'];
const html={gc:new Set(['index.html','schools.html','blog.html','neighborhoods/navarre.html','neighborhoods/gulf-breeze.html','blog/fed-rate-hike-what-it-means.html','blog/what-moves-mortgage-rates.html',...[...new Set([...pilot,...campus])].map(s=>'schools/'+s+'.html')]),pmh:new Set(['index.html','about.html','contact.html','pcs-guide.html','communities.html','mortgage-calculators.html','schools.html','communities/navarre.html','communities/gulf-breeze.html',...[...new Set([...pilot,...campus])].map(s=>'schools/'+s+'.html')])};
for(const change of record.changes){
 const p=change.path;
 assert.ok(p.endsWith('.html')?html[change.site].has(p):/^(?:pagefind\/|assets\/navarre-utility(?:-core)?\.js$|assets\/index-[\w-]+\.js$|assets\/school-finder-data\.json$|school-assets\/school-finder-data\.json$|assets\/styles\/|data\/(?:school-finder\.(?:json|csv)|navarre-cost-evidence\.json)$|og\/blog-(?:fed-rate-hike-what-it-means|what-moves-mortgage-rates)\.png$|llms(?:-full)?\.txt$|sitemap\.xml$|_headers$)/.test(p),'Unexpected scope '+change.site+'/'+p);
}
// Exact preservation of photos, reviews, maps, conversion code and every other page.
for(const s of baseline.sites){
 for(const path of ['assets/costin-region-tasks.js','reviews.html','photo-credits.html','data/photography-credits.json'])if(existsSync(join(s.localBaseline,path)))assert.equal(sha(join(s.localBaseline,path)),sha(join(roots[s.site],path)),s.site+'/'+path);
 for(const path of [s.site==='gc'?'neighborhoods/navarre.html':'communities/navarre.html',s.site==='gc'?'neighborhoods/gulf-breeze.html':'communities/gulf-breeze.html']){
  const a=readFileSync(join(s.localBaseline,path),'utf8'),b=readFileSync(join(roots[s.site],path),'utf8');
  for(const img of a.matchAll(/<picture\b[\s\S]*?<\/picture>/g))assert.ok(b.includes(img[0]),'Preserve approved picture '+s.site+'/'+path);
 }
}
save(join(dir,'candidate.json'),{...c,...record});
const commands=[];
for(const args of [
 ['--test','scripts/biography.test.mjs','scripts/entity-sync.test.mjs','scripts/navarre-utility.test.mjs'],
 ['scripts/review-monitor.test.mjs'],['scripts/rehearse-review-release.mjs',dir],
 ['scripts/check-blog-sources.mjs','gc'],['scripts/check-blog-sources.mjs','pmh'],
 ['scripts/check-school-hub-seo.mjs','--source'],['scripts/check-military-schools.mjs'],
 ['scripts/audit-entity.mjs','--gc-root',roots.gc,'--pmh-root',roots.pmh],
 ['scripts/audit-civilian.mjs','--root',roots.gc,'--json'],['scripts/audit-military.mjs','--root',roots.pmh,'--json']
]){const r=spawnSync(process.execPath,args,{encoding:'utf8',windowsHide:true}),log=join(dir,'gate-'+(commands.length+1)+'.txt');writeFileSync(log,(r.stdout||'')+(r.stderr||''));commands.push({args,exitCode:r.status,log,sha256:sha(log)});assert.equal(r.status,0,'See '+log);}
const integration=json(join(dir,'integrated-browser.json')),photos=json(join(dir,'photography-browser/browser.json')),meta=json(join(dir,'meta-browser.json'));
assert.ok(integration.checks.every(x=>x.pass)&&photos.ok&&meta.passed,'Browser evidence must pass');
const domains={'greggcostin.com':'gc','pensacolamilitaryhousing.com':'pmh'},broken=[];let checkedLinks=0;
for(const [site,root] of Object.entries(roots)){
 const redirects=readFileSync(join(root,'_redirects'),'utf8').split(/\r?\n/).filter(l=>l.trim()&&!l.trim().startsWith('#')).map(l=>l.trim().split(/\s+/)[0]);
 for(const f of walk(root).filter(f=>f.endsWith('.html')))for(const m of readFileSync(f,'utf8').matchAll(/<a\b[^>]*href=["']([^"']+)["']/gi)){
  if(!/^https?:|^\//.test(m[1])||m[1].startsWith('//'))continue;
  let u;try{u=new URL(m[1].replaceAll('&amp;','&'),`https://${site==='gc'?'greggcostin.com':'pensacolamilitaryhousing.com'}`);}catch{continue;}
  const target=domains[u.hostname];if(!target)continue;checkedLinks++;
  const path=decodeURIComponent(u.pathname),base=join(roots[target],path);
  if([base,base+'.html',join(base,'index.html')].some(existsSync)||target===site&&redirects.includes(path))continue;
  broken.push({site,file:relative(root,f),path,target});
 }
}
save(join(dir,'candidate-links.json'),{checkedLinks,broken});assert.equal(broken.length,0,'Candidate internal links');
save(join(dir,'quality-gates.json'),{checkedAt:new Date().toISOString(),candidate:c.candidate,candidateFingerprint:fingerprint(c.candidate),ok:true,scopeLabel:'Reviewed school pilots and campuses, school hubs, ownership guidance, mortgage sources and scoped About claims',commands,browserChecks:{integration:integration.checks.length,photography:photos.checks.length,meta:meta.checks?.length||20},checkedLinks,preserved:record.preserved,changedFiles:record.changes.length,removed:0});
console.log(JSON.stringify({ok:true,changes:record.changes.length,preserved:record.preserved,checkedLinks}));
