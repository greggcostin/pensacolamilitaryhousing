// Full published-site preservation plus semantic checks for the scoped VA/PCS release.
import {readFileSync,writeFileSync,existsSync,statSync,readdirSync} from 'node:fs';
import {resolve,join,relative,extname,sep} from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {COAST,installationBlock} from './geo-core-lib.mjs';
import {GUIDES} from '../content/geo/core-guide-data.mjs';
const dir='docs/seo-geo-2026-09-06/projects/03-accuracy';
const manifest=JSON.parse(readFileSync(dir+'/candidate-manifest.json','utf8'));
const origins={pmh:'https://pensacolamilitaryhousing.com',gc:'https://greggcostin.com'};
const roots=Object.fromEntries(Object.keys(origins).map(id=>[id,resolve(manifest.candidate,id)]));
const bases=Object.fromEntries(Object.keys(origins).map(id=>[id,resolve(manifest.baseline,id)]));
const walk=d=>readdirSync(d,{withFileTypes:true}).flatMap(x=>x.isDirectory()?walk(join(d,x.name)):x.isFile()?[join(d,x.name)]:[]);
const hash=f=>createHash('sha256').update(readFileSync(f)).digest('hex');
const text=h=>h.replace(/<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>|<!--[\s\S]*?-->/gi,' ').replace(/<[^>]+>/g,' ').replace(/&amp;/g,'&').replace(/&#39;|&apos;/g,"'").replace(/&quot;/g,'"').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
const find=(root,p)=>{const rel=decodeURIComponent(p).replace(/^\//,'')||'index.html';return [rel,extname(rel)?rel:rel+'.html',join(rel,'index.html')].map(x=>resolve(root,x)).find(f=>f.startsWith(root+sep)&&existsSync(f)&&statSync(f).isFile());};
let links=0,schemas=0,schools=0,pages=0,baselineFiles=0,faqPairs=0;
const findings=[],counts={};
for(const id of Object.keys(origins)){
 const intended=new Set(manifest.changes.filter(x=>x.site===id).map(x=>x.path));
 for(const file of walk(bases[id])){
  baselineFiles++;const path=relative(bases[id],file).replaceAll('\\','/'),target=join(roots[id],path);
  if(!existsSync(target)){findings.push({id,path,issue:'Published asset removed'});continue;}
  if(!intended.has(path)&&!(id==='pmh'&&path.startsWith('pagefind/'))&&hash(target)!==hash(file))findings.push({id,path,issue:'Unintended change outside release'});
  if(path.startsWith('schools/')&&path.endsWith('.html')){schools++;if(hash(file)!==hash(target))findings.push({id,path,issue:'School content or dates changed'});}
 }
 const sitemap=readFileSync(join(roots[id],'sitemap.xml'),'utf8');
 const urls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(x=>x[1]);counts[id]=0;
 for(const url of urls){
  const file=find(roots[id],new URL(url).pathname);if(!file){findings.push({url,issue:'Sitemap page missing'});continue;}
  if(!file.endsWith('.html'))continue;counts[id]++;
  const html=readFileSync(file,'utf8');pages++;
  if(id==='pmh'&&html.includes('FL023'))findings.push({url,issue:'Retired MHA in indexable HTML'});
  if((html.match(/<h1\b/gi)||[]).length!==1)findings.push({url,issue:'H1 count'});
  const canon=html.match(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/i)?.[1];if(canon!==url)findings.push({url,issue:'Canonical does not match sitemap',canon});
  if(/<meta\b(?=[^>]*name=["']robots["'])(?=[^>]*content=["'][^"']*noindex)[^>]*>/i.test(html))findings.push({url,issue:'Indexed page noindexed'});
  for(const m of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)){schemas++;try{JSON.parse(m[1]);}catch{findings.push({url,issue:'Invalid JSON-LD'});}}
  for(const m of html.matchAll(/\b(?:href|src|poster)=["']([^"']+)["']/gi)){
   let target;try{target=new URL(m[1].replaceAll('&amp;','&'),url);}catch{continue;}
   const targetId=Object.keys(origins).find(k=>origins[k]===target.origin);if(!targetId||/^\/cdn-cgi\//.test(target.pathname))continue;links++;
   const hit=find(roots[targetId],target.pathname);
   if(!hit){findings.push({url,target:target.href,issue:'Missing internal destination'});continue;}
   if(hit.endsWith('.js')&&!target.pathname.startsWith('/pagefind/')&&readFileSync(hit,'utf8').includes('FL023'))findings.push({url,target:target.href,issue:'Active script uses retired MHA'});
  }
 }
 if(hash(join(bases[id],'index.html'))!==hash(join(roots[id],'index.html')))findings.push({id,issue:'Homepage changed beyond this release; #1 and current foundation must stay intact'});
}
for(const row of manifest.changes)if(hash(join(roots[row.site],row.path))!==row.sha256)findings.push({row,issue:'Release hash changed'});
function verifyFaq(html,faq,file){const body=text(html);const blocks=[...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map(m=>JSON.parse(m[1]));const faqs=blocks.filter(x=>x['@type']==='FAQPage').flatMap(x=>x.mainEntity||[]);for(const {q,a} of faq){faqPairs++;if(!body.includes(text(q))||!body.includes(text(a))||!faqs.some(x=>x.name===q&&x.acceptedAnswer?.text===a))findings.push({file,q,issue:'New FAQ does not mirror body and schema'});}}
for(const [slug,spec] of Object.entries(GUIDES)){
 const file=join(roots.pmh,slug+'.html'),html=readFileSync(file,'utf8');verifyFaq(html,spec.faq,file);
 if(!html.includes('Last updated: September 8, 2026')||!html.includes('"dateModified":"2026-09-08"'))findings.push({file,issue:'Core review dates disagree'});
 if(/typically approved for|Max Purchase Price \(Zero Down\)|Tier 1 county loan limit/.test(html))findings.push({file,issue:'Retired unsupported core-guide claim'});
}
for(const b of COAST.bases)verifyFaq(readFileSync(join(roots.pmh,'bases',b.slug+'.html'),'utf8'),installationBlock(b).faq,b.slug);
for(const r of COAST.regions)for(const path of r.civilianPaths)verifyFaq(readFileSync(join(roots.gc,path.slice(1)+'.html'),'utf8'),[{q:r.question,a:r.answer}],path);
for(const path of ['llms.txt','llms-full.txt'])if(readFileSync(join(roots.pmh,path),'utf8').includes('FL023'))findings.push({path,issue:'Retired MHA in discovery file'});
const search=JSON.parse(readFileSync(join(roots.pmh,'pagefind/pagefind-entry.json'),'utf8'));
if(Object.keys(search.languages).join(',')!=='en'||search.languages.en?.page_count!==counts.pmh)findings.push({issue:'Incomplete or split English search index',languages:search.languages});
// The current source gate includes a separate, not-yet-published font rollout.
// Keep its existing production findings visible and fail on any introduced findings.
const audit=root=>{const result=spawnSync(process.execPath,['scripts/audit-civilian.mjs','--root',root,'--json'],{encoding:'utf8'});if(![0,1].includes(result.status))throw Error(result.stderr);return JSON.parse(result.stdout);};
const baselineAudit=audit(bases.gc),candidateAudit=audit(roots.gc),introduced=candidateAudit.findings.filter(x=>!baselineAudit.findings.includes(x));
for(const issue of introduced)findings.push({site:'gc',issue});
writeFileSync(dir+'/civilian-production-audit.json',JSON.stringify({baseline:baselineAudit,candidate:candidateAudit,introduced,disposition:'Existing production findings are retained in the register; this release does not deploy the separate source font rollout or invent coordinates for virtual schools.'},null,2)+'\n');
const result={checkedAt:new Date().toISOString(),candidate:manifest.candidate,ok:findings.length===0,pages,counts,changedHtml:manifest.changes.filter(x=>x.path.endsWith('.html')).length,baselineFiles,schoolsPreservedByteForByte:schools,internalReferences:links,jsonLdBlocks:schemas,newMirroredFaqPairs:faqPairs,englishSearchPages:search.languages.en?.page_count,baselineCivilianFindings:baselineAudit.findings.length,introducedCivilianFindings:introduced.length,findings};
writeFileSync(dir+'/candidate-verification.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({...result,findings:findings.slice(0,20)},null,2));if(findings.length)process.exitCode=1;
