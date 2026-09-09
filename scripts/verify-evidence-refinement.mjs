// Release acceptance, not a ranking test. All checks are read-only.
import {readFileSync,writeFileSync,readdirSync,existsSync} from 'node:fs';
import {join,relative} from 'node:path';import {createHash} from 'node:crypto';import {spawnSync} from 'node:child_process';
import {withReceiptConversions} from './inquiry-browser-lib.mjs';import {auditFinancial} from './financial-audit-lib.mjs';
import {studyPage,median} from './build-bah-zip-study.mjs';import {monthlyOwnership,DEFAULT_COSTS} from '../public/tools/ownership-model.js';
const dir='docs/seo-geo-2026-09-06/projects/03-accuracy/zip-and-claims',m=JSON.parse(readFileSync(join(dir,'candidate-manifest.json'))),checks=[];
const check=(name,ok,detail)=>checks.push({name,pass:Boolean(ok),detail});
const hash=b=>createHash('sha256').update(b).digest('hex');
const walk=d=>readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(d,e.name)):[join(d,e.name)]);
const plain=h=>h.replace(/<[^>]+>/g,' ').replaceAll('&amp;','&').replaceAll('&#39;',"'").replaceAll('&quot;','"').replaceAll('&nbsp;',' ').replace(/\s+/g,' ').trim();
let htmlCount=0,preserved=0,faqPairs=0;const findings=[];
for(const s of m.production){const root=join(m.candidate,s.site),owned=new Set(m.substantivePages[s.site].map(p=>p+'.html'));
 for(const f of walk(s.localBaseline)){const p=relative(s.localBaseline,f),to=join(root,p);if(!existsSync(to))findings.push('Missing baseline asset '+s.site+'/'+p);}
 for(const file of walk(root).filter(p=>p.endsWith('.html'))){htmlCount++;const p=relative(root,file).replaceAll('\\','/'),h=readFileSync(file,'utf8'),before=readFileSync(join(s.localBaseline,p),'utf8');
  if(!h.includes('src="/assets/costin-conversions.js"'))findings.push(p+': missing receipt script');
  if(/if\s*\(res\.ok\s*&&\s*res\.j\s*&&\s*res\.j\.success\s*\)/.test(h))findings.push(p+': legacy success-only acceptance');
  if(!owned.has(p)){const expected=withReceiptConversions(s.site==='pmh'?before.replaceAll(m.spa.oldAsset,m.spa.newAsset):before);if(h!==expected)findings.push(s.site+'/'+p+': unexpected non-content-page change');else preserved++;}
  else {const main=h.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1]||'',visible=plain(main);const visit=n=>{if(!n||typeof n!=='object')return;if(n['@type']==='FAQPage')for(const q of n.mainEntity||[]){faqPairs++;if(!visible.includes(plain(q.name))||!visible.includes(plain(q.acceptedAnswer.text)))findings.push(p+': FAQ not visible '+q.name);}Object.values(n).forEach(visit);};for(const match of h.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g))visit(JSON.parse(match[1]));
   if(/FL023|130.{0,20}150|99% no.brainer|12 months.{0,30}rent it out|typical.*approved for/i.test(main))findings.push(p+': retired financial claim');
   for(const a of main.matchAll(/href="(\/[^"#?]*)/g)){const path=a[1];if(![path,path+'.html',path+'/index.html'].some(x=>existsSync(join(root,x))))findings.push(p+': missing internal link '+path);}
  }
 }
}
check('Complete inventory, page preservation, local links and visible FAQ mirrors',!findings.length,{htmlCount,preserved,faqPairs,findings});
check('Every registered asset matches its candidate hash',m.changes.every(c=>hash(readFileSync(join(m.candidate,c.site,c.path)))===c.sha256),{changes:m.changes.length,removed:m.removed});
const study=JSON.parse(readFileSync(join(m.candidate,'pmh/data/bah-ownership-study-2026.json'))),recalculated=study.rows.map(r=>monthlyOwnership(r.zhvi,DEFAULT_COSTS));
check('26 unique ZIP rows reproduce the shared ownership model',study.rows.length===26&&new Set(study.rows.map(r=>r.zip)).size===26&&recalculated.every((r,i)=>r.monthly===study.rows[i].monthlyIllustration.monthly)&&Math.round(median(recalculated.map(r=>r.monthly))*100)/100===study.medianMonthly,{median:study.medianMonthly,valueDate:study.valueDate,crossCounty:study.rows.filter(r=>r.zctaCounties.length>1).map(r=>r.zip)});
check('CSV exposes 26 rows and date/illustration labels',readFileSync(join(m.candidate,'pmh/data/bah-ownership-study-2026.csv'),'utf8').trim().split('\n').length===27,{});
const finance=auditFinancial(join(m.candidate,'pmh'));check('Previous core financial and community coverage retained',finance.ok,finance);
const bundle=readFileSync(join(m.candidate,'pmh',m.spa.newAsset),'utf8');check('Both React handlers use accepted receipts',(bundle.match(/window\.costinConversions\?\.accept\(m.ok,v,/g)||[]).length===2&&!/Zn\("inquiry_submit"/.test(bundle),{branches:2});
check('Requested #1 positioning remains in HTML and React bundle',plain(readFileSync(join(m.candidate,'pmh/index.html'),'utf8')).includes('#1 military')&&bundle.includes('#1')&&bundle.includes('military relocation REALTOR'),{});
const browser=JSON.parse(readFileSync(join(dir,'browser/verification.json')));check('All isolated browser checks pass with no external requests allowed',browser.checks.every(c=>c.pass)&&browser.externalRequestsAllowed===0,browser);
for(const [name,args]of [['Military SEO',['scripts/audit-military.mjs','--root',join(m.candidate,'pmh'),'--json']],['Civilian SEO',['scripts/audit-civilian.mjs','--root',join(m.candidate,'gc')]],['Shared entity',['scripts/audit-entity.mjs','--pmh-root',join(m.candidate,'pmh'),'--gc-root',join(m.candidate,'gc')]],['Receipt contract tests',['--test','scripts/inquiry-browser.test.mjs']]]){const r=spawnSync(process.execPath,args,{encoding:'utf8'});check(name,r.status===0,{exit:r.status,output:r.stdout,error:r.stderr});}
const fingerprint=createHash('sha256');for(const p of walk(m.candidate).sort())fingerprint.update(relative(m.candidate,p).replaceAll('\\','/')+'\0'+hash(readFileSync(p))+'\n');
const report={checkedAt:new Date().toISOString(),candidate:m.candidate,candidateFingerprint:fingerprint.digest('hex'),manifestSha256:hash(readFileSync(join(dir,'candidate-manifest.json'))),ok:checks.every(c=>c.pass),checks};writeFileSync(join(dir,'candidate-verification.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({ok:report.ok,checks:checks.map(({name,pass,detail})=>({name,pass,...(!pass?{detail}:{})}))},null,2));if(!report.ok)process.exitCode=1;
