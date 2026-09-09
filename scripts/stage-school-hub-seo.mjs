import {readFileSync,writeFileSync,existsSync,mkdirSync,cpSync,readdirSync} from 'node:fs';
import {join,relative,resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
const baseline=resolve('.coast-release/2026-09-08-school-seo-baseline'),candidate=resolve('.coast-release/2026-09-08-school-seo');
const proof=JSON.parse(readFileSync(join(baseline,'baseline.json'),'utf8'));if(!proof.ok)throw Error('Pinned baseline is incomplete');
if(!existsSync(candidate)){mkdirSync(candidate);for(const site of ['gc','pmh'])cpSync(join(baseline,site),join(candidate,site),{recursive:true,errorOnExist:true,force:false});}
const result=spawnSync(process.execPath,['scripts/build-school-hub-seo.mjs','--gc-root',join(candidate,'gc'),'--pmh-root',join(candidate,'pmh')],{encoding:'utf8'});
process.stdout.write(result.stdout);process.stderr.write(result.stderr);if(result.status)process.exit(result.status);
const walk=p=>readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(p,e.name)):[join(p,e.name)]);
const hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const changes=[],preserved={};
for(const site of ['gc','pmh']){
  preserved[site]=0;
  for(const file of walk(join(candidate,site))){const path=relative(join(candidate,site),file).replaceAll('\\','/'),source=join(baseline,site,path),after=hash(file),before=existsSync(source)?hash(source):null;
    if(before===after)preserved[site]++;else changes.push({site,path,before,sha256:after});}
}
const receipt={builtAt:new Date().toISOString(),baseline,candidate,production:proof.sites,changes,preserved};
mkdirSync('docs/school-seo-2026-09-08',{recursive:true});writeFileSync('docs/school-seo-2026-09-08/candidate.json',JSON.stringify(receipt,null,2)+'\n');
console.log(JSON.stringify({changes:changes.length,hubAndDataChanges:changes.filter(x=>!x.path.startsWith('pagefind/')&&(!x.path.endsWith('.html')||x.path==='schools.html')).map(({site,path})=>({site,path})),preserved},null,2));
