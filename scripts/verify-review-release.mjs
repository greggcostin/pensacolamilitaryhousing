import {readFileSync,existsSync} from 'node:fs';
import {join,relative} from 'node:path';
import {spawnSync} from 'node:child_process';
import {json,save,walk,sha,fingerprint} from './isolated-release-lib.mjs';
import {syncReviewText} from './review-counts-lib.mjs';
import {assessReviewObservation} from './review-monitor-lib.mjs';
const at=process.argv.indexOf('--directory');if(at<0)throw Error('Provide --directory');const dir=process.argv[at+1],c=json(join(dir,'candidate.json')),issues=[];
if(c.releaseKind!=='verified-review-counts')throw Error('Not a review-only release');
const a=assessReviewObservation(c.observation,c.previousSnapshot,{confirmDecrease:c.confirmedDecrease});if(!a.ok)issues.push(...a.reasons);
const before=fingerprint(c.candidate);
for(const s of c.production){const root=join(c.candidate,s.site);
 for(const f of walk(s.localBaseline)){const path=relative(s.localBaseline,f).replaceAll('\\','/'),target=join(root,path);if(!existsSync(target)){if(s.site==='pmh'&&path.startsWith('pagefind/'))continue;issues.push('Removed '+s.site+'/'+path);continue;}
  if(s.site==='pmh'&&path.startsWith('pagefind/'))continue;
  if(/\.(?:html|txt|js|json)$/.test(path)){const old=readFileSync(f,'utf8'),next=readFileSync(target,'utf8');if(next!==syncReviewText(old,c.counts))issues.push('Non-review change '+s.site+'/'+path);if(syncReviewText(next,c.counts)!==next)issues.push('Stale count '+s.site+'/'+path);}
  else if(sha(f)!==sha(target))issues.push('Non-text asset changed '+s.site+'/'+path);
 }
 for(const f of walk(root)){const path=relative(root,f).replaceAll('\\','/');if(!existsSync(join(s.localBaseline,path))&&!(s.site==='pmh'&&path.startsWith('pagefind/')))issues.push('Unexpected addition '+s.site+'/'+path);}
}
const jobs=[['civilian',['scripts/audit-civilian.mjs','--root',join(c.candidate,'gc'),'--json']],['military',['scripts/audit-military.mjs','--root',join(c.candidate,'pmh'),'--json']],['entity',['scripts/audit-entity.mjs','--gc-root',join(c.candidate,'gc'),'--pmh-root',join(c.candidate,'pmh')]],['count-transform',['scripts/check-review-counts.mjs']]];
const results=jobs.map(([gate,args])=>{const r=spawnSync(process.execPath,args,{encoding:'utf8',maxBuffer:8*1024*1024});return{gate,exitCode:r.status,stdout:r.stdout.trim(),stderr:r.stderr?.trim()};});
const after=fingerprint(c.candidate),ok=!issues.length&&before===after&&results.every(r=>r.exitCode===0);
save(join(dir,'quality-gates.json'),{checkedAt:new Date().toISOString(),candidate:c.candidate,candidateFingerprint:after,ok,issues,results});console.log(JSON.stringify({ok,issues,gates:results.map(r=>({gate:r.gate,exitCode:r.exitCode,output:r.exitCode?r.stdout:undefined}))},null,2));if(!ok)process.exitCode=1;
