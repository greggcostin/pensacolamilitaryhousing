import {createRequire} from 'node:module';
import {join} from 'node:path';
import {homedir} from 'node:os';
import {existsSync} from 'node:fs';
import assert from 'node:assert/strict';
import {REGIONAL_GUIDES} from '../content/communities/civilian-regional-guides.mjs';
import {save} from './isolated-release-lib.mjs';
const require=createRequire(import.meta.url);let pw;try{pw=require('playwright')}catch{pw=require(join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));}
const browser=await pw.chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
const dir='docs/growth-execution-2026-09-08/browser',checks=[];
const record=async(name,fn)=>{try{await fn();checks.push({name,pass:true});console.log('PASS '+name);}catch(e){checks.push({name,pass:false,error:e.message});console.log('FAIL '+name+' '+e.message);}};
try{
 for(const width of [320,390,1440]){
  const c=await browser.newContext({viewport:{width,height:940},reducedMotion:'reduce'});
  await c.route('**/*',r=>{const u=new URL(r.request().url());if(u.hostname==='127.0.0.1')return r.continue();const path=join('.coast-release/2026-09-08-civilian-growth/pmh',u.pathname);return u.hostname==='pensacolamilitaryhousing.com'&&/\.(?:jpg|png|webp|avif|woff2)$/.test(u.pathname)&&existsSync(path)?r.fulfill({path}):r.abort();});
  const p=await c.newPage();
  for(const g of REGIONAL_GUIDES)await record(width+' '+g.path,async()=>{
   await p.goto('http://127.0.0.1:4196'+g.path,{waitUntil:'load'});await p.evaluate(()=>document.fonts.ready);
   if(width!==320&&g.slug==='gulf-breeze')await p.screenshot({path:join(dir,`gulf-breeze-initial-${width}.png`)});
   assert.equal(await p.locator('h1').count(),1);
   const box=await p.evaluate(()=>({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));assert.ok(box.scroll<=box.width+1,JSON.stringify(box));
   assert.ok(await p.locator('.cg-hero-media img').evaluate(i=>i.complete&&i.naturalWidth>0));
   assert.ok(await p.locator('.cg-guide .quick-answer').isVisible());
   const faq=p.locator('.cg-faq details').first();await faq.locator('summary').click();assert.equal(await faq.getAttribute('open'),'');
   await p.locator('.cg-hero [data-inquiry-open]').click();assert.ok(await p.locator('#inquiry-form').isVisible());
   if(width!==320&&g.slug==='gulf-breeze'){await p.keyboard.press('Escape');await p.screenshot({path:join(dir,`gulf-breeze-${width}.png`)});}
  });
  await c.close();
 }
 const c=await browser.newContext({viewport:{width:390,height:844}}),p=await c.newPage();
 await c.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
 await record('Deferred conversion script retains validated receipt and duplicate protection',async()=>{
  await p.goto('http://127.0.0.1:4196/neighborhoods/gulf-breeze');
  const result=await p.evaluate(()=>{
   const ev=[];window.gtag=(...args)=>ev.push(args);localStorage.removeItem('costin_accepted_receipts_v1');
   const bad=window.costinConversions.accept(true,{success:true},'inquiry-form');
   const receipt={success:true,accepted:true,duplicate:false,receiptId:'10258327-64ef-4d3f-966d-556cb2122121',captureStatus:'crm_accepted'};
   window.costinConversions.accept(true,receipt,'inquiry-form');window.costinConversions.accept(true,receipt,'inquiry-form');
   return {bad,events:ev};
  });assert.equal(result.bad,false);assert.equal(result.events.filter(e=>e[1]==='generate_lead').length,1);
 });
 await record('School map starts automatically and school data is available',async()=>{await p.goto('http://127.0.0.1:4196/schools');await p.waitForSelector('.leaflet-container',{timeout:15000});assert.ok(await p.locator('#school-finder').count());assert.ok(await p.locator('#private-schools').count());assert.ok(await p.locator('#christian-schools').count());});
 await c.close();
}finally{await browser.close();}
save(join(dir,'verification.json'),{checkedAt:new Date().toISOString(),passed:checks.every(c=>c.pass),checks,externalRequestsAllowed:0,realInquiriesSent:0});if(checks.some(c=>!c.pass))process.exitCode=1;
