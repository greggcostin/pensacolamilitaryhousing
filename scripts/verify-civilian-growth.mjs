import {readFileSync,existsSync} from 'node:fs';
import {join,relative} from 'node:path';
import {spawnSync} from 'node:child_process';
import {json,save,walk,sha,fingerprint} from './isolated-release-lib.mjs';
import {improveCivilianLoading} from './civilian-loading-lib.mjs';
import {REGIONAL_GUIDES} from '../content/communities/civilian-regional-guides.mjs';
const dir='docs/growth-execution-2026-09-08',c=json(join(dir,'candidate.json')),issues=[],checks=[];
const before=fingerprint(c.candidate),pages=new Set(REGIONAL_GUIDES.map(g=>g.path.slice(1)+'.html'));
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const blocks=(h,tag)=>[...h.matchAll(new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}>`,'g'))].map(m=>m[0]);
let schools=0,preloads=0,deferred=0;
for(const s of c.production){
 const root=join(c.candidate,s.site);
 for(const file of walk(s.localBaseline)){
  const path=relative(s.localBaseline,file).replaceAll('\\','/'),target=join(root,path);
  if(!existsSync(target)){issues.push('Removed '+s.site+'/'+path);continue;}
  if(s.site==='pmh'){if(sha(file)!==sha(target))issues.push('Military asset changed '+path);continue;}
  if(['sitemap.xml','llms.txt','llms-full.txt'].includes(path))continue;
  const html=path.endsWith('.html');
  if(!html){if(sha(file)!==sha(target))issues.push('Asset changed '+path);continue;}
  const old=readFileSync(file,'utf8'),next=readFileSync(target,'utf8');
  if(!pages.has(path)&&next!==improveCivilianLoading(old,root))issues.push('Unrelated content modified '+path);
  if(path.startsWith('schools/'))schools++;
  if(next.includes('data-costin-hero-preload'))preloads++;
  if(next.includes('src="/assets/costin-conversions.js" defer'))deferred++;
 }
}
const root=join(c.candidate,'gc'),base=c.production.find(s=>s.site==='gc').localBaseline;
for(const g of REGIONAL_GUIDES){
 const path=g.path.slice(1)+'.html',old=readFileSync(join(base,path),'utf8'),h=readFileSync(join(root,path),'utf8'),main=h.match(/<main\b[\s\S]*?<\/main>/)[0];
 const scripts=t=>blocks(t,'script').filter(s=>!s.includes('application/ld+json')).map(s=>s.replace('src="/assets/costin-conversions.js" defer','src="/assets/costin-conversions.js"'));
 if(JSON.stringify(scripts(old))!==JSON.stringify(scripts(h)))issues.push(path+' executable code differs');
 if(JSON.stringify(blocks(old,'form'))!==JSON.stringify(blocks(h,'form')))issues.push(path+' form differs');
 const entity=t=>blocks(t,'script').filter(s=>s.includes('data-entity='));if(JSON.stringify(entity(old))!==JSON.stringify(entity(h)))issues.push(path+' identity differs');
 if((h.match(/<h1\b/g)||[]).length!==1)issues.push(path+' H1 count');
 if(!/<main[^>]*>\s*<div class="quick-answer"/.test(h))issues.push(path+' missing opening answer');
 const faq=blocks(h,'script').filter(s=>s.includes('application/ld+json')).map(s=>JSON.parse(s.match(/>([\s\S]*?)<\/script>/)[1])).find(n=>n['@type']==='FAQPage');
 if(!faq)issues.push(path+' FAQ missing');
 for(const q of faq?.mainEntity||[])if(!main.includes(esc(q.name))||!main.includes(esc(q.acceptedAnswer.text)))issues.push(path+' FAQ mirror '+q.name);
 for(const m of main.matchAll(/href="(\/[^"]*)"/g)){
  const u=new URL(m[1],'https://greggcostin.com'),p=u.pathname==='/'?'index.html':u.pathname.slice(1)+(u.pathname.match(/\.[a-z]+$/)?'':'.html'),f=join(root,p);
  if(!existsSync(f))issues.push(path+' destination '+m[1]);
  else if(u.hash&&!readFileSync(f,'utf8').includes(`id="${u.hash.slice(1)}"`))issues.push(path+' anchor '+m[1]);
 }
 if(!h.includes('sizes="(max-width: 680px)'))issues.push(path+' responsive hero missing');
 if(/[—–]/.test(main))issues.push(path+' dash in new copy');
 checks.push({path,faqCount:faq?.mainEntity.length,words:main.replace(/<[^>]+>/g,' ').trim().split(/\s+/).length});
}
const jobs=[['civilian',['scripts/audit-civilian.mjs','--root',root,'--json']],['military',['scripts/audit-military.mjs','--root',join(c.candidate,'pmh'),'--json']],['entity',['scripts/audit-entity.mjs','--gc-root',root,'--pmh-root',join(c.candidate,'pmh')]],['conversion-contract',['--test','scripts/inquiry-browser.test.mjs']]];
const results=jobs.map(([gate,args])=>{const r=spawnSync(process.execPath,args,{encoding:'utf8',maxBuffer:8*1024*1024});return {gate,exitCode:r.status,stdout:r.stdout.trim(),stderr:r.stderr?.trim()};});
const after=fingerprint(c.candidate),ok=!issues.length&&before===after&&results.every(r=>r.exitCode===0);
save(join(dir,'quality-gates.json'),{checkedAt:new Date().toISOString(),candidate:c.candidate,candidateFingerprint:after,ok,issues,checks,schoolPagesPreserved:schools,preloads,conversionScriptsDeferred:deferred,results});
console.log(JSON.stringify({ok,issues,checks,schools,preloads,deferred,gates:results.map(r=>({gate:r.gate,exitCode:r.exitCode,output:r.exitCode?r.stdout:undefined}))},null,2));if(!ok)process.exitCode=1;
