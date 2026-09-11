// Recheck exact scope and seal the candidate only after source and browser gates pass.
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
import {join,resolve,extname} from 'node:path';
import {spawnSync} from 'node:child_process';
import {json,save,inventory,fingerprint,walk,sha} from './isolated-release-lib.mjs';
const dir='docs/geo-execution-2026-09-10/identity-release';
const c=json(join(dir,'candidate.json')),baseline=json(join(c.candidate,'baseline.json'));
const live=inventory(baseline,c.candidate);
if(JSON.stringify(live.changes)!==JSON.stringify(c.changes)||live.removed.length)throw Error('Candidate changed since scope review');
const sourceCommands=[['--test','scripts/biography.test.mjs','scripts/entity-sync.test.mjs'],['scripts/build-identity-record.mjs','--check'],['scripts/build-professional-profile.mjs','--check'],['scripts/check-blog-sources.mjs','pmh'],['scripts/check-school-hub-seo.mjs','--source'],['scripts/audit-links.mjs'],['scripts/check-em-dashes.mjs'],['scripts/audit-entity.mjs','--pmh-root',join(c.candidate,'pmh'),'--gc-root',join(c.candidate,'gc')]];
const commands=[];
for(const args of sourceCommands){const r=spawnSync(process.execPath,args,{encoding:'utf8',windowsHide:true});const log=join(dir,`check-${commands.length+1}.txt`);writeFileSync(log,(r.stdout||'')+(r.stderr||''));commands.push({command:'node '+args.join(' '),exitCode:r.status,log,sha256:sha(log)});if(r.status!==0)throw Error('Release gate failed; see '+log);}
for(const name of ['civilian','military']){const a=json(join(dir,'audit-'+name+'.json'));if(a.findings.length)throw Error(name+' audit failed');}
const integration=json(join(dir,'integrated-browser.json')),photos=json(join(dir,'photography-browser/browser.json'));
if(integration.checks.some(c=>!c.pass)||!photos.ok)throw Error('Browser checks incomplete');
// A source-library health result is separate from this strictly scoped release.
// Retain its failure, and allow only the known deadline findings on unchanged pages.
const libraryRun=spawnSync(process.execPath,['scripts/check-blog-sources.mjs','gc'],{encoding:'utf8',windowsHide:true});
const library=JSON.parse(libraryRun.stdout||'null');
if(!library)throw Error('Missing civilian library health result');
for(const finding of library.findings){
 if(!['fed-rate-hike-what-it-means','what-moves-mortgage-rates'].includes(finding.slug)||!/perishable is expired or has no review deadline$/.test(finding.error))throw Error('Unexpected civilian library finding');
 const base=baseline.sites.find(s=>s.site==='gc').localBaseline,path='blog/'+finding.slug+'.html';
 if(sha(join(base,path))!==sha(join(c.candidate,'gc',path)))throw Error('A changed article cannot inherit an expired review');
}
save(join(dir,'civilian-library-health.json'),{...library,exitCode:libraryRun.status,scope:'Source library, distinct from identity release',affectedPublishedArticlesUnchanged:true,nextAction:'GEO-06: substantively review current PMMS sources; do not reseal for the build.'});
const roots={gc:join(c.candidate,'gc'),pmh:join(c.candidate,'pmh')},domains={'greggcostin.com':'gc','pensacolamilitaryhousing.com':'pmh'};
const broken=[];let checkedLinks=0;
for(const [site,root] of Object.entries(roots)){
 const redirects=readFileSync(join(root,'_redirects'),'utf8').split(/\r?\n/).filter(l=>l.trim()&&!l.trim().startsWith('#')).map(l=>l.trim().split(/\s+/)[0]);
 for(const file of walk(root).filter(f=>f.endsWith('.html')))for(const m of readFileSync(file,'utf8').matchAll(/<a\b[^>]*href=["']([^"']+)["']/gi)){
  if(!/^https?:|^\//.test(m[1])||m[1].startsWith('//'))continue;
  let u;try{u=new URL(m[1].replaceAll('&amp;','&'),`https://${site==='gc'?'greggcostin.com':'pensacolamilitaryhousing.com'}`);}catch{continue;}
  const target=domains[u.hostname];if(!target)continue;
  checkedLinks++;const path=decodeURIComponent(u.pathname),base=join(roots[target],path);
  if([base,base+'.html',join(base,'index.html')].some(existsSync)||target===site&&redirects.includes(path))continue;
  broken.push({file,path,target});
 }
}
save(join(dir,'candidate-links.json'),{checkedLinks,broken});if(broken.length)throw Error('Candidate link findings: '+JSON.stringify(broken.slice(0,5)));
const scope={schoolGuidePagesPreserved:542,schoolPagesDataMapsStylesFormsTracking:'All outside-scope existing assets retained byte-for-byte',sourceBundle:c.sourceBundle};
save(join(dir,'quality-gates.json'),{checkedAt:new Date().toISOString(),candidate:c.candidate,candidateFingerprint:fingerprint(c.candidate),ok:true,scopeLabel:'Identity release only; not an all-content freshness certification',inheritedContentFindings:library.findings,commands,siteAudits:{gc:320,pmh:375,findings:0},browserChecks:{integration:integration.checks.length,photography:photos.checks.length},scope,checkedLinks});
console.log(JSON.stringify({ok:true,candidate:c.candidate,sourceCommands:commands.length,browserChecks:integration.checks.length+photos.checks.length,checkedLinks}));
