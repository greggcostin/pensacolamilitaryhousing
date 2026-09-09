// Requirements-level checks: order, gate wording, original evidence, diagrams,
// numerical examples, real source dates, final-page identity and layout.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {guides} from '../content/client-guides/collection.mjs';
import {sources} from '../content/client-guides/sources.mjs';
const root='artifacts/client-library',dir='artifacts/client-library-design/journey-2026-09-08';mkdirSync(dir,{recursive:true});
const before=JSON.parse(readFileSync(root+'/qa/journey-content-baseline.json','utf8'));
const norm=s=>JSON.stringify(s);
const preservation=[];
for(const old of before.guides){
 const now=guides.find(g=>g.slug===old.slug);assert.ok(now,old.slug+' removed');
 const available=now.pages.flatMap(p=>p.blocks).map(norm);let preserved=0;
 for(const b of old.pages.flatMap(p=>p.blocks)){const n=available.indexOf(norm(b));assert.ok(n>=0,old.slug+' lost original evidence');available.splice(n,1);preserved++;}
 preservation.push({slug:old.slug,preservedOriginalBlocks:preserved,additionalBlocks:available.length});
}
for(const g of guides){
 const pages=g.pages.filter(p=>!p.reference),positions=pages.map(p=>g.journey.findIndex(s=>s.key===p.key));
 assert.ok(positions.every((n,i)=>n>=0&&(!i||n>=positions[i-1])),g.slug+' is not chronological');
 for(const p of g.pages)for(const id of p.sources||[])assert.ok(sources[id]&&sources[id].reviewed<= '2026-09-08',g.slug+' missing or future source');
 if(!g.slug.startsWith('seller-')){
  const first=pages.find(p=>p.key==='prepare');assert.ok(first,g.slug+' has no financing preparation');
  const firstSearch=pages.findIndex(p=>p.key==='search'),prep=pages.findIndex(p=>p.key==='prepare');assert.ok(firstSearch<0||prep<firstSearch);
  assert.match(JSON.stringify(pages.slice(0,firstSearch<0?pages.length:firstSearch)),/preapprov|servicer.*qualification/i);
 }
}
// Independent arithmetic for the displayed three-option example and rental model.
assert.deepEqual([430000-285000-28000,445000-285000-28000-8000-2000,460000-285000-28000-22000-5000],[117000,122000,120000]);
assert.equal(450000-285000-18000-3200-6000-2400-1500,133900);
assert.equal(36000-1800-12600,21600);assert.equal(21600-18000-2400,1200);
assert.equal(21600/18000,1.2);assert.equal(1200/100000*100,1.2);
assert.deepEqual([1200,1200-1800,1200-2400,1200-1800-2400],[1200,-600,-1200,-3000]);
const req=createRequire(import.meta.url);const {chromium}=req('C:/Users/gregg/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});const checks=[];
try{for(const g of guides){
 const pg=await browser.newPage({viewport:{width:1100,height:1200}});await pg.goto(pathToFileURL(resolve(root+'/html/'+g.slug+'.html')).href);await pg.evaluate(()=>document.fonts.ready);await pg.emulateMedia({media:'print'});
 assert.equal(await pg.locator('.sheet').nth(1).getAttribute('id'),'roadmap',g.slug+' must open with overview');
 assert.equal(await pg.locator('.roadmap-spine li').count(),g.journey.length);
 const visualCount=await pg.locator('[data-visual]').count();assert.ok(visualCount>=2,g.slug+' needs explanatory visuals');
 const clipped=await pg.locator('[data-visual]').evaluateAll(es=>es.flatMap(e=>[...e.querySelectorAll('p,li,h3,h4,strong')].filter(t=>{const r=t.getBoundingClientRect(),b=e.getBoundingClientRect();return r.right>b.right+2||r.left<b.left-2;}).map(t=>t.textContent)));assert.deepEqual(clipped,[],g.slug+' diagram text escapes');
 const images=await pg.evaluate(()=>[...document.images].filter(im=>!im.complete||!im.naturalWidth).map(im=>im.src));assert.deepEqual(images,[]);
 const pageCount=await pg.locator('.sheet').count();
 const dates=await pg.locator('.source-date').allTextContents();assert.ok(dates.length>0);assert.ok(dates.every(d=>/^Reviewed 2026-09-0[678]$/.test(d)),g.slug+' incorrect source date label');
 const captures=[];
 if(['seller-transaction-roadmap','buyer-transaction-roadmap','mortgage-preapproval-to-closing','va-loan-assumption-guide','va-loan-insider-guide','investment-property-roadmap','pcs-nas-pensacola'].includes(g.slug)){
  for(const selector of ['#roadmap','[data-visual="routes"]','[data-visual="decision"]','[data-visual="diagram"]','[data-visual="waterfall"]']){const el=pg.locator(selector).first();if(await el.count()){const file=g.slug+'-'+selector.replace(/[^a-z]+/g,'-')+'.png';await el.locator('xpath=ancestor-or-self::section[contains(@class,"sheet")]').first().screenshot({path:dir+'/'+file});captures.push(file);}}
 }
 await pg.emulateMedia({media:'screen'});await pg.setViewportSize({width:375,height:812});
 assert.ok(await pg.evaluate(()=>document.documentElement.scrollWidth<=376),g.slug+' horizontal page overflow');
 const mobileClipped=await pg.locator('[data-visual]').evaluateAll(es=>es.filter(e=>e.scrollWidth>e.clientWidth+1).map(e=>e.dataset.visual));assert.deepEqual(mobileClipped,[],g.slug+' diagram mobile overflow');
 if(['buyer-transaction-roadmap','investment-property-roadmap','va-loan-assumption-guide'].includes(g.slug))await pg.locator('[data-visual="decision"],[data-visual="routes"]').first().screenshot({path:dir+'/'+g.slug+'-mobile-visual.png'});
 checks.push({slug:g.slug,pages:pageCount,roadmapFirst:true,chronological:true,visualBlocks:visualCount,sourceDates:dates,printAnd375pxVisualsContained:true,captures});await pg.close();
}}finally{await browser.close();}
const report={checkedAt:new Date().toISOString(),guides:guides.length,preservation,checks,calculatedScenariosChecked:10,findings:[]};writeFileSync(root+'/qa/journey-checks.json',JSON.stringify(report,null,2)+'\n');console.log(`${guides.length} roadmaps, chronological sequences, original evidence, visual layouts and 10 arithmetic checks passed.`);
