import {readFileSync,existsSync} from 'node:fs';
import {join,relative} from 'node:path';
import {spawnSync} from 'node:child_process';
import {json,save,sha,walk,fingerprint,inventory} from './isolated-release-lib.mjs';
import {unbundleCivilianStyles} from './civilian-style-bundle.mjs';
import {auditStyleBundle} from './civilian-style-audit.mjs';
const dir='docs/performance-2026-09-09',c=json(join(dir,'candidate.json')),proof=json(join(dir,'baseline/production-baseline.json')),issues=[];
const before=fingerprint(c.candidate),blocks=(h,tag)=>[...h.matchAll(new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}>`,'g'))].map(m=>m[0]);
const styles=h=>(h.slice(0,h.indexOf('</head>')).match(/<style\b[^>]*>[\s\S]*?<\/style>|<link\b(?=[^>]*\brel="stylesheet")[^>]*>/g)||[]);
const body=h=>h.slice(h.indexOf('<body')).replace(/<picture>\s*(?:<source\b[^>]*>\s*)*(<img\b[^>]*src="\/images\/(?:logo-lrr|logo-08-sm)\.png"[^>]*>)\s*<\/picture>/g,'$1').replace(/ fetchpriority="high"/g,'');
let pages=0,schoolPages=0;
for(const s of proof.sites){
 const root=join(c.candidate,s.site);
 for(const f of walk(s.localBaseline)){
  const path=relative(s.localBaseline,f),target=join(root,path);
  if(!existsSync(target)){issues.push('Removed '+s.site+'/'+path);continue;}
  if(s.site==='pmh'||!path.endsWith('.html')){if(sha(f)!==sha(target))issues.push('Unscoped change '+s.site+'/'+path);continue;}
  pages++;if(path.startsWith('schools'))schoolPages++;
  const old=readFileSync(f,'utf8'),next=readFileSync(target,'utf8'),expanded=unbundleCivilianStyles(next,root);
  if(JSON.stringify(styles(old))!==JSON.stringify(styles(expanded)))issues.push(path+' CSS source or cascade changed');
  if(body(old)!==body(next))issues.push(path+' body content changed');
  for(const tag of ['script','form','title'])if(JSON.stringify(blocks(old,tag))!==JSON.stringify(blocks(next,tag)))issues.push(path+' '+tag+' changed');
  const tags=h=>[...h.matchAll(/<meta\b[^>]*>|<link\b[^>]*(?:rel="canonical"|hreflang=)[^>]*>/g)].map(m=>m[0]);
  if(JSON.stringify(tags(old))!==JSON.stringify(tags(next)))issues.push(path+' metadata changed');
  for(const issue of auditStyleBundle(next,root))issues.push(path+' '+issue);
 }
}
const refreshed=inventory(proof,c.candidate);refreshed.releaseMessage=c.releaseMessage;save(join(dir,'candidate.json'),refreshed);
for(const change of refreshed.changes)if(change.site!=='gc'||(!change.path.endsWith('.html')&&!/^assets\/styles\//.test(change.path)&&!/^images\/logo-(?:lrr|08-sm)-header-(?:128|256|384)\.webp$/.test(change.path)))issues.push('Outside release scope '+change.path);
const jobs=[['civilian',['scripts/audit-civilian.mjs','--root',join(c.candidate,'gc'),'--json']],['military',['scripts/audit-military.mjs','--root',join(c.candidate,'pmh'),'--json']],['entity',['scripts/audit-entity.mjs','--gc-root',join(c.candidate,'gc'),'--pmh-root',join(c.candidate,'pmh')]],['conversion',['--test','scripts/inquiry-browser.test.mjs']],['review updater',['scripts/check-review-counts.mjs']]];
const results=jobs.map(([gate,args])=>{const r=spawnSync(process.execPath,args,{encoding:'utf8',maxBuffer:8e6});return {gate,exitCode:r.status,stdout:r.stdout.trim(),stderr:r.stderr?.trim()};});
const browser=json(join(dir,'browser/verification.json')),after=fingerprint(c.candidate);
if(!browser.ok)issues.push('Browser checks did not pass');
const ok=!issues.length&&results.every(r=>r.exitCode===0)&&before===after;
save(join(dir,'quality-gates.json'),{checkedAt:new Date().toISOString(),candidate:c.candidate,candidateFingerprint:after,ok,issues,pages,schoolPages,results,browserChecks:browser.checks.length});
console.log(JSON.stringify({ok,issues,pages,schoolPages,gates:results.map(r=>({gate:r.gate,exitCode:r.exitCode,output:r.exitCode?r.stdout:undefined}))},null,2));if(!ok)process.exitCode=1;
