// Verify the full reconciled release, including pages not present in the ordinary checkout.
import {readFileSync,writeFileSync,existsSync,statSync,readdirSync} from 'node:fs';
import {resolve,join,relative,extname,sep} from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {auditFinancial} from './financial-audit-lib.mjs';
import {COAST,installationBlock} from './geo-core-lib.mjs';
import {PCS_DECISIONS} from '../src/coastIntentData.js';
const dir='docs/seo-geo-2026-09-06/projects/03-accuracy/financial';
const manifest=JSON.parse(readFileSync(dir+'/candidate-manifest.json','utf8'));
const origins={pmh:'https://pensacolamilitaryhousing.com',gc:'https://greggcostin.com'};
const roots=Object.fromEntries(Object.keys(origins).map(id=>[id,resolve(manifest.candidate,id)]));
const baseline=Object.fromEntries(Object.keys(origins).map(id=>[id,resolve(manifest.baseline,id)]));
const walk=d=>readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(d,e.name)):e.isFile()?[join(d,e.name)]:[]);
const hash=f=>createHash('sha256').update(readFileSync(f)).digest('hex');
const find=(root,p)=>{const rel=decodeURIComponent(p).replace(/^\//,'')||'index.html';return [rel,extname(rel)?rel:rel+'.html',join(rel,'index.html')].map(x=>resolve(root,x)).find(f=>f.startsWith(root+sep)&&existsSync(f)&&statSync(f).isFile());};
const plain=h=>h.replace(/<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>|<!--[\s\S]*?-->/gi,' ').replace(/<[^>]+>/g,' ').replaceAll('&amp;','&').replaceAll('&#39;',"'").replaceAll('&quot;','"').replace(/\s+/g,' ').trim();
const schemas=h=>[...h.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map(m=>JSON.parse(m[1]));
const withoutRecord=h=>h.replace(/<link\b[^>]*data-business-record[^>]*>\r?\n?/gi,'');
const findings=[],counts={};let baselineFiles=0,schools=0,schoolHubs=0,schoolsIdentical=0,links=0,jsonLdBlocks=0,additionalFaqPairs=0;
for(const id of Object.keys(origins)){
 const intended=new Set(manifest.changes.filter(c=>c.site===id).map(c=>c.path));
 for(const file of walk(baseline[id])){
  baselineFiles++;const path=relative(baseline[id],file).replaceAll('\\','/'),next=join(roots[id],path);
  if(!existsSync(next)){findings.push({id,path,issue:'Published asset removed'});continue;}
  if(!intended.has(path)&&!(id==='pmh'&&path.startsWith('pagefind/'))&&hash(file)!==hash(next))findings.push({id,path,issue:'Unintended asset change'});
  if(path.startsWith('schools/')&&path.endsWith('.html')){schools++;if(hash(file)===hash(next))schoolsIdentical++;if(withoutRecord(readFileSync(file,'utf8'))!==withoutRecord(readFileSync(next,'utf8')))findings.push({id,path,issue:'School changed beyond the canonical identity link'});}
  if(path==='schools.html'){schoolHubs++;if(withoutRecord(readFileSync(file,'utf8'))!==withoutRecord(readFileSync(next,'utf8')))findings.push({id,path,issue:'School hub changed beyond the canonical identity link'});}
 }
 for(const file of walk(roots[id])){const path=relative(roots[id],file).replaceAll('\\','/');if(!existsSync(join(baseline[id],path))&&!intended.has(path)&&!(id==='pmh'&&path.startsWith('pagefind/')))findings.push({id,path,issue:'Unregistered new asset'});}
 const sitemap=readFileSync(join(roots[id],'sitemap.xml'),'utf8'),oldMap=readFileSync(join(baseline[id],'sitemap.xml'),'utf8');
 const urls=h=>[...h.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
 if(JSON.stringify(urls(sitemap))!==JSON.stringify(urls(oldMap)))findings.push({id,issue:'Sitemap URL inventory changed'});
 counts[id]=0;
 for(const url of urls(sitemap)){
  const file=find(roots[id],new URL(url).pathname);if(!file){findings.push({url,issue:'Missing sitemap destination'});continue;}if(!file.endsWith('.html'))continue;counts[id]++;
  const html=readFileSync(file,'utf8');
  if((html.match(/<h1\b/gi)||[]).length!==1)findings.push({url,issue:'H1 count'});
  if(html.match(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/i)?.[1]!==url)findings.push({url,issue:'Canonical mismatch'});
  if(/<meta\b(?=[^>]*name=["']robots["'])(?=[^>]*content=["'][^"']*noindex)[^>]*>/i.test(html))findings.push({url,issue:'Sitemap page noindexed'});
  try{jsonLdBlocks+=schemas(html).length;}catch{findings.push({url,issue:'Invalid JSON-LD'});}
  if(!html.includes('data-business-record'))findings.push({url,issue:'Shared professional record link absent'});
  for(const m of html.matchAll(/\b(?:href|src|poster)=["']([^"']+)["']/gi)){
   let target;try{target=new URL(m[1].replaceAll('&amp;','&'),url);}catch{continue;}const targetId=Object.keys(origins).find(k=>origins[k]===target.origin);if(!targetId||/^\/cdn-cgi\//.test(target.pathname))continue;links++;
   const hit=find(roots[targetId],target.pathname);if(!hit){findings.push({url,target:target.href,issue:'Missing internal destination'});continue;}
   if(hit.endsWith('.js')&&!target.pathname.startsWith('/pagefind/')&&readFileSync(hit,'utf8').includes('FL023'))findings.push({url,target:target.href,issue:'Retired Eglin code in active script'});
  }
 }
}
for(const c of manifest.changes)if(hash(join(roots[c.site],c.path))!==c.sha256)findings.push({c,issue:'Changed asset hash differs from manifest'});
const home=readFileSync(join(roots.pmh,'index.html'),'utf8');
if(!plain(home).includes("Pensacola's #1"))findings.push({issue:'Requested #1 statement missing'});
for(const card of PCS_DECISIONS.cards)if(!plain(home).includes(card.title)||!plain(home).includes(card.text))findings.push({issue:'Homepage answer missing',title:card.title});
for(const path of ['index.html','about.html','contact.html','pcs-guide.html','mortgage-calculators.html','communities.html'])if(!readFileSync(join(roots.pmh,path),'utf8').includes('data-pagefind-body'))findings.push({path,issue:'SPA search body marker missing'});
const checkFaq=(html,faq,path)=>{const nodes=schemas(html).filter(n=>n['@type']==='FAQPage').flatMap(n=>n.mainEntity||[]),body=plain(html);for(const {q,a} of faq){additionalFaqPairs++;if(!body.includes(plain(q))||!body.includes(plain(a))||!nodes.some(n=>n.name===q&&n.acceptedAnswer?.text===a))findings.push({path,q,issue:'FAQ does not match visible body and schema'});}};
for(const b of COAST.bases)checkFaq(readFileSync(join(roots.pmh,'bases',b.slug+'.html'),'utf8'),installationBlock(b).faq,b.slug);
for(const r of COAST.regions)for(const path of r.civilianPaths)checkFaq(readFileSync(join(roots.gc,path.slice(1)+'.html'),'utf8'),[{q:r.question,a:r.answer}],path);
const financial=auditFinancial(roots.pmh);for(const issue of financial.findings)findings.push({issue});
const search=JSON.parse(readFileSync(join(roots.pmh,'pagefind/pagefind-entry.json'),'utf8'));
if(Object.keys(search.languages).join(',')!=='en'||search.languages.en?.page_count!==counts.pmh)findings.push({issue:'Search index does not cover full English site'});
const gates=[];
for(const [name,args] of [
 ['military',['scripts/audit-military.mjs','--root',roots.pmh,'--json']],
 ['civilian',['scripts/audit-civilian.mjs','--root',roots.gc,'--json']],
 ['entity',['scripts/audit-entity.mjs','--pmh-root',roots.pmh,'--gc-root',roots.gc]]
]){const r=spawnSync(process.execPath,args,{encoding:'utf8'});writeFileSync(join(dir,name+'-candidate-audit.txt'),r.stdout+r.stderr);gates.push({name,exit:r.status});if(r.status!==0)findings.push({name,issue:'Complete-site gate failed',output:r.stdout.slice(-2000),error:r.stderr});}
const result={checkedAt:new Date().toISOString(),candidate:manifest.candidate,ok:!findings.length,pages:counts.pmh+counts.gc,counts,changedHtml:manifest.changes.filter(c=>c.path.endsWith('.html')).length,baselineFiles,schoolChildrenContentPreserved:schools,schoolChildrenByteIdentical:schoolsIdentical,schoolChildrenIdentityLinkOnly:schools-schoolsIdentical,schoolHubsContentPreserved:schoolHubs,internalReferences:links,jsonLdBlocks,financialFaqPairs:financial.faqPairs,otherMirroredFaqPairs:additionalFaqPairs,englishSearchPages:search.languages.en?.page_count,gates,findings};
writeFileSync(dir+'/candidate-verification.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({...result,findings:findings.slice(0,12)},null,2));if(findings.length)process.exitCode=1;
