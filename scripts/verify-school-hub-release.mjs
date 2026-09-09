// Run the release gates against the complete production-based candidate and seal its bytes.
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {join,relative} from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
const directory='docs/school-seo-2026-09-08';
const candidate=JSON.parse(readFileSync(join(directory,'candidate.json'),'utf8'));
const walk=p=>readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(p,e.name)):[join(p,e.name)]);
const digest=root=>{
  const h=createHash('sha256');
  for(const p of walk(root).sort())h.update(relative(root,p).replaceAll('\\','/')+'\0'+createHash('sha256').update(readFileSync(p)).digest('hex')+'\n');
  return h.digest('hex');
};
const before=digest(candidate.candidate);
const jobs=[
  ['school-consistency',['scripts/check-school-hub-seo.mjs']],
  ['civilian',['scripts/audit-civilian.mjs','--root',join(candidate.candidate,'gc'),'--json']],
  ['military',['scripts/audit-military.mjs','--root',join(candidate.candidate,'pmh'),'--json']],
  ['shared-entity',['scripts/audit-entity.mjs','--gc-root',join(candidate.candidate,'gc'),'--pmh-root',join(candidate.candidate,'pmh')]],
];
const results=jobs.map(([gate,args])=>{
  const r=spawnSync(process.execPath,args,{encoding:'utf8',maxBuffer:8*1024*1024});
  let result;try{result=JSON.parse(r.stdout);}catch{result=r.stdout.trim();}
  console.log(`${gate}: ${r.status===0?'PASS':'FAIL'}`);
  return {gate,command:[process.execPath,...args],exitCode:r.status,result,stderr:r.stderr?.trim(),error:r.error?.message};
});
const after=digest(candidate.candidate);
const record={checkedAt:new Date().toISOString(),candidate:candidate.candidate,candidateFingerprint:after,unchangedDuringChecks:before===after,results,ok:before===after&&results.every(r=>r.exitCode===0)};
writeFileSync(join(directory,'quality-gates.json'),JSON.stringify(record,null,2)+'\n');
console.log(JSON.stringify({ok:record.ok,candidateFingerprint:after,gates:results.length},null,2));
if(!record.ok)process.exitCode=1;
