// Check the complete candidate, its exact change scope and existing contact/identity contracts.
import {readFileSync,writeFileSync,readdirSync,existsSync} from 'node:fs';
import {join,relative} from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {guide} from './coast-community-guide-lib.mjs';
const directory='docs/worldclass-roadmap-2026-09-08/perdido';
const c=JSON.parse(readFileSync(join(directory,'candidate.json'),'utf8'));
const walk=p=>readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(p,e.name)):[join(p,e.name)]);
const sha=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const digest=root=>{const h=createHash('sha256');for(const p of walk(root).sort())h.update(relative(root,p).replaceAll('\\','/')+'\0'+sha(p)+'\n');return h.digest('hex');};
const before=digest(c.candidate),issues=[],checks=[];
const scripts=h=>[...h.matchAll(/<script\b[^>]*>[\s\S]*?<\/script>/g)].map(m=>m[0]).filter(s=>!s.includes('application/ld+json'));
const blocks=(h,tag)=>[...h.matchAll(new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}>`,'g'))].map(m=>m[0]);
let schoolFiles=0,schoolPages=0;
for(const s of c.production){
  const root=join(c.candidate,s.site),e=guide.editions[s.site],page=e.path.slice(1)+'.html';
  const allowed=new Set([page,'assets/coast-community-guide.css','sitemap.xml','llms.txt','llms-full.txt',`og/${s.site==='gc'?'neighborhoods':'communities'}-perdido-key.png`]);
  for(const f of walk(s.localBaseline)){
    const path=relative(s.localBaseline,f).replaceAll('\\','/'),target=join(root,path);
    if(!existsSync(target)){issues.push('Baseline asset removed: '+s.site+'/'+path);continue;}
    if(!allowed.has(path)&&!(s.site==='pmh'&&path.startsWith('pagefind/'))&&sha(f)!==sha(target))issues.push('Unexpected modification: '+s.site+'/'+path);
    if(/^(schools(?:\/|\.html)|assets\/school|school-assets\/|data\/school)/.test(path)){
      schoolFiles++;if(path.startsWith('schools/')&&path.endsWith('.html'))schoolPages++;
      if(sha(f)!==sha(target))issues.push('School resource changed: '+s.site+'/'+path);
    }
  }
  for(const f of walk(root)){
    const path=relative(root,f).replaceAll('\\','/');
    if(!existsSync(join(s.localBaseline,path))&&!allowed.has(path)&&!(s.site==='pmh'&&path.startsWith('pagefind/')))issues.push('Unexpected addition: '+s.site+'/'+path);
  }
  const old=readFileSync(join(s.localBaseline,page),'utf8'),h=readFileSync(join(root,page),'utf8');
  if(JSON.stringify(scripts(old))!==JSON.stringify(scripts(h)))issues.push(s.site+': existing executable scripts changed');
  if(JSON.stringify(blocks(old,'form'))!==JSON.stringify(blocks(h,'form')))issues.push(s.site+': inquiry form changed');
  const entity=h=>[...h.matchAll(/<script\b[^>]*data-entity="entity-graph:compact"[^>]*>[\s\S]*?<\/script>/g)].map(x=>x[0]);
  if(JSON.stringify(entity(old))!==JSON.stringify(entity(h)))issues.push(s.site+': shared identity block changed');
  if((h.match(/<h1\b/g)||[]).length!==1)issues.push(s.site+': H1 count');
  if(!h.includes(`href="https://${s.domain}${e.path}"`))issues.push(s.site+': canonical missing');
  if(!/<main[^>]*>\s*<div class="quick-answer"/.test(h))issues.push(s.site+': direct answer is not first in main');
  if(/FL023|20-25 Minutes|20 to 25 minutes|\$275,000|\$500 to \$1,200|lowest grade whose|strongest plays|Gulf Breeze wins/i.test(h))issues.push(s.site+': legacy claim remains');
  const main=h.match(/<main\b[\s\S]*?<\/main>/)[0];
  if(/[—–]/.test(main.replaceAll('PCS / Relocation — Buying','')))issues.push(s.site+': dash in new visible copy');
  const data=[...h.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(x=>JSON.parse(x[1]));
  const faq=data.find(n=>n['@type']==='FAQPage');
  const encode=x=>x.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
  for(const q of faq.mainEntity)if(!main.includes(encode(q.name))||!main.includes(encode(q.acceptedAnswer.text)))issues.push(s.site+': FAQ does not mirror visible content: '+q.name);
  for(const a of [...main.matchAll(/href="(\/[^"]*)"/g)]){
    const url=new URL(a[1],'https://'+s.domain),path=url.pathname==='/'?'index.html':url.pathname.slice(1)+(url.pathname.match(/\.[a-z]+$/)?'':'.html');
    const file=join(root,path);
    if(!existsSync(file))issues.push(s.site+': internal destination missing '+a[1]);
    else if(url.hash&&!readFileSync(file,'utf8').includes(`id="${decodeURIComponent(url.hash.slice(1))}"`))issues.push(s.site+': anchor missing '+a[1]);
  }
  const img=[...h.matchAll(/<img\b[^>]*>/g)].filter(m=>m[0].includes('Perdido')||m[0].includes('perdido-key'));
  if(!img.every(m=>m[0].includes('srcset=')&&m[0].includes('width=')&&m[0].includes('height=')))issues.push(s.site+': responsive hero missing');
  checks.push({site:s.site,faqCount:faq.mainEntity.length,scriptsPreserved:scripts(old).length,formsPreserved:blocks(old,'form').length,mainWords:main.replace(/<[^>]+>/g,' ').split(/\s+/).length});
}
const searchBefore=JSON.parse(readFileSync(join(c.production.find(s=>s.site==='pmh').localBaseline,'pagefind/pagefind-entry.json'),'utf8'));
const searchAfter=JSON.parse(readFileSync(join(c.candidate,'pmh/pagefind/pagefind-entry.json'),'utf8'));
if(searchBefore.languages.en.page_count!==searchAfter.languages.en.page_count)issues.push('Site-search coverage changed');
const jobs=[
  ['civilian',['scripts/audit-civilian.mjs','--root',join(c.candidate,'gc'),'--json']],
  ['military',['scripts/audit-military.mjs','--root',join(c.candidate,'pmh'),'--json']],
  ['shared-entity',['scripts/audit-entity.mjs','--gc-root',join(c.candidate,'gc'),'--pmh-root',join(c.candidate,'pmh')]],
];
const results=jobs.map(([gate,args])=>{const r=spawnSync(process.execPath,args,{encoding:'utf8',maxBuffer:8*1024*1024});let result;try{result=JSON.parse(r.stdout);}catch{result=r.stdout.trim();}return{gate,exitCode:r.status,result,stderr:r.stderr?.trim()};});
const after=digest(c.candidate);
const record={checkedAt:new Date().toISOString(),candidate:c.candidate,candidateFingerprint:after,unchangedDuringChecks:before===after,issues,checks,schoolFilesPreserved:schoolFiles,schoolPagesPreserved:schoolPages,siteSearchPages:searchAfter.languages.en.page_count,results,ok:before===after&&!issues.length&&results.every(r=>r.exitCode===0)};
writeFileSync(join(directory,'quality-gates.json'),JSON.stringify(record,null,2)+'\n');
console.log(JSON.stringify({ok:record.ok,issues,checks,schoolFiles,schoolPages,siteSearchPages:record.siteSearchPages,gates:results.map(r=>({gate:r.gate,exitCode:r.exitCode,result:r.result}))},null,2));
if(!record.ok)process.exitCode=1;
