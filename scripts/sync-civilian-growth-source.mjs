// Reconcile only this task's published guides, loading hints and Meta implementation.
// Other changed source content is preserved. This never builds or deploys a website.
import {readFileSync,writeFileSync,existsSync,copyFileSync,mkdirSync} from 'node:fs';
import {join,dirname,relative,resolve} from 'node:path';
import {REGIONAL_GUIDES} from '../content/communities/civilian-regional-guides.mjs';
import {improveCivilianLoading} from './civilian-loading-lib.mjs';
import {json,save,walk,sha} from './isolated-release-lib.mjs';
const config=json('content/reviews/automation.json'),proof=json(join(config.lastRunDirectory,'live/production-baseline.json'));
if(!proof.ok||proof.sites.some(s=>resolve(s.localBaseline)!==resolve(config.baselineRoot,s.site)))throw Error('Verified current complete release required');
const out='docs/growth-execution-2026-09-08/source-sync';
if(existsSync(join(out,'result.json')))throw Error('Source sync already recorded; inspect that receipt rather than overwriting it');
const changes=[];
function update(file,text,reason){
 const old=existsSync(file)?readFileSync(file,'utf8'):null;if(old===text)return;
 const backup=join(out,'before',file);mkdirSync(dirname(backup),{recursive:true});
 if(old!==null&&!existsSync(backup))copyFileSync(file,backup);
 const before=existsSync(backup)?sha(backup):null;mkdirSync(dirname(file),{recursive:true});writeFileSync(file,text);changes.push({file,reason,before,after:sha(file),backup:old===null?null:backup});
}
for(const guide of REGIONAL_GUIDES){const file='civilian-site'+guide.path+'.html';update(file,readFileSync(join(config.baselineRoot,'gc',guide.path+'.html'),'utf8'),'Verified published regional guide, including newer article cross-links');}
for(const [site,directory] of [['gc','civilian-site'],['pmh','public']]){
 for(const file of ['costin-meta-config.js','costin-meta.js'])update(join(directory,'assets',file),readFileSync(join(config.baselineRoot,site,'assets',file),'utf8'),'Exact published production and consent guards');
}
const liveHome=readFileSync(join(config.baselineRoot,'gc/index.html'),'utf8');
const domainTag=liveHome.match(/<meta name="facebook-domain-verification"[^>]*>/)?.[0];
if(domainTag){const file='civilian-site/index.html',html=readFileSync(file,'utf8');if(!html.includes(domainTag))update(file,html.replace(/<meta name="facebook-domain-verification"[^>]*>\s*/g,'').replace('</head>',domainTag+'\n</head>'),'Preserve the published Meta domain token; account verification remains separate');}
for(const file of walk('civilian-site').filter(p=>p.endsWith('.html'))){const html=readFileSync(file,'utf8');update(file,improveCivilianLoading(html),'Only conversion defer and existing hero image preload');}
// A missing military source file interrupted the initial run after six guide copies.
// Retain those original backups and include their already-applied copies in this receipt.
if(existsSync(join(out,'before')))for(const backup of walk(join(out,'before'))){
 const file=relative(join(out,'before'),backup);if(changes.some(c=>resolve(c.file)===resolve(file)))continue;
 if(existsSync(file)&&sha(file)!==sha(backup))changes.push({file,reason:'Recovered already-applied published source from the interrupted first pass',before:sha(backup),after:sha(file),backup});
}
save(join(out,'result.json'),{checkedAt:new Date().toISOString(),baseline:config.baselineRoot,changes});
console.log(JSON.stringify({updated:changes.length,guides:changes.filter(c=>c.reason.startsWith('Verified')).length,meta:changes.filter(c=>c.reason.startsWith('Exact')).length,loading:changes.filter(c=>c.reason.startsWith('Only')).length},null,2));
