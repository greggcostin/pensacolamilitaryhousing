// Exercise actual production HTML with local files and mocked Meta/CRM requests only.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync,existsSync,writeFileSync} from 'node:fs';
import {resolve,extname,sep,join} from 'node:path';
import {homedir} from 'node:os';
const require=createRequire(import.meta.url);
let pw;try{pw=require('playwright');}catch{pw=require(join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));}
const browser=await pw.chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
const origin='https://pensacolamilitaryhousing.com',root=resolve('public'),checks=[];
let activeContexts=[];
async function fixture({status=200,body={success:true},networkFailure=false,consent=false,gpc=false}={}){
 const context=await browser.newContext({viewport:{width:390,height:844}});activeContexts.push(context);
 const requests=[],sdk=[];
 await context.route('**/*',async route=>{
  const url=new URL(route.request().url());
  if(url.hostname==='costin-contact.gregg-costin.workers.dev'){
   if(route.request().method()==='OPTIONS')return route.fulfill({status:204,headers:{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'content-type'}});
   requests.push(route.request().postDataJSON());
   return networkFailure?route.abort():route.fulfill({status,headers:{'Access-Control-Allow-Origin':'*'},contentType:'application/json',body:JSON.stringify(body)});
  }
  if(url.hostname==='connect.facebook.net'){
   sdk.push(url.href);return route.fulfill({contentType:'application/javascript',body:'window.__meta=window.fbq.queue.map(x=>Array.from(x));window.fbq.callMethod=function(){window.__meta.push(Array.from(arguments));};'});
  }
  if(url.hostname==='pensacolamilitaryhousing.com'){
   let path=decodeURIComponent(url.pathname);if(path.endsWith('/'))path+='index.html';else if(!extname(path))path+='.html';
   const file=resolve(root,'.'+path);if(!file.startsWith(root+sep)||!existsSync(file))return route.fulfill({status:404,body:''});
   return route.fulfill({contentType:{'.html':'text/html','.js':'text/javascript','.css':'text/css','.woff2':'font/woff2','.jpg':'image/jpeg','.webp':'image/webp','.avif':'image/avif','.png':'image/png'}[extname(file)]||'application/octet-stream',body:readFileSync(file)});
  }
  return route.abort();
 });
 await context.addInitScript(({consent,gpc})=>{
  if(consent)localStorage.setItem('costin_meta_consent_v1',JSON.stringify({choice:'granted',at:Date.now()}));
  if(gpc)Object.defineProperty(navigator,'globalPrivacyControl',{value:true});
  document.addEventListener('DOMContentLoaded',()=>{window.__ga=[];window.gtag=(...args)=>window.__ga.push(args);});
 },{consent,gpc});
 const page=await context.newPage();
 const meta=()=>page.evaluate(()=>window.__meta||[]);
 return {page,context,requests,sdk,meta};
}
async function check(name,fn){try{await fn();checks.push({name,pass:true});console.log('PASS '+name);}catch(e){checks.push({name,pass:false,error:e.message});console.log('FAIL '+name+': '+e.message);}finally{await Promise.all(activeContexts.map(c=>c.close()));activeContexts=[];}}
try{
 await check('Both military campaign pages require affirmative Meta consent',async()=>{
  for(const path of ['/pcs-checklist','/book-pcs-call']){
   const f=await fixture();await f.page.goto(origin+path);assert.equal(f.sdk.length,0);
   await f.page.locator('[data-meta-decline]').click();assert.equal(f.sdk.length,0);
   await f.page.locator('[data-meta-settings]').click();await f.page.locator('[data-meta-accept]').click();
   await f.page.waitForFunction(()=>window.__meta?.some(e=>e[2]==='PageView'));
   assert.equal((await f.meta()).filter(e=>e[2]==='PageView').length,1);
   assert.ok((await f.meta()).some(e=>e[0]==='init'&&e[1]==='960230270427179'));
   assert.ok(await f.page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  }
 });
 for(const failure of [{status:400,body:{success:true}},{status:200,body:{success:false}},{status:503,body:{error:'Unavailable'}},{networkFailure:true}]){
  await check('Checklist failure gives the PDF but no lead: '+JSON.stringify(failure),async()=>{
   const f=await fixture({...failure,consent:true});await f.page.goto(origin+'/pcs-checklist');
   await f.page.locator('#lm-name').fill('Campaign Test');await f.page.locator('#lm-email').fill('campaign@example.invalid');await f.page.locator('#lm-form button').click();
   await f.page.locator('#lm-ok').waitFor({state:'visible'});assert.match(await f.page.locator('#lm-ok').innerText(),/could not be delivered/);
   assert.equal((await f.meta()).filter(e=>e[2]==='Lead').length,0);
   assert.equal(await f.page.evaluate(()=>localStorage.getItem('pmh-inquiry-submitted')),null);
   assert.equal((await f.page.evaluate(()=>window.__ga)).filter(e=>e[1]==='generate_lead').length,0);
  });
 }
 await check('Only accepted checklist submission produces one lead, retains campaign source, and uses the worker contract',async()=>{
  const f=await fixture({consent:true});await f.page.goto(origin+'/pcs-checklist?utm_source=facebook&utm_medium=paid_social&utm_campaign=pcs_planning');
  await f.page.locator('#lm-name').fill('Campaign Test');await f.page.locator('#lm-email').fill('campaign@example.invalid');await f.page.locator('#lm-form button').click();
  await f.page.locator('#lm-ok').waitFor({state:'visible'});assert.equal(f.requests.length,1);
  assert.equal(f.requests[0]._gotcha,'');assert.equal(f.requests[0].inquiryType,'General Question');assert.equal(f.requests[0].utm_campaign,'pcs_planning');
  assert.equal((await f.meta()).filter(e=>e[2]==='Lead').length,1);
  assert.doesNotMatch(JSON.stringify(await f.meta()),/Campaign Test|campaign@example|message|phone/);
  assert.equal((await f.page.evaluate(()=>window.__ga)).filter(e=>e[1]==='generate_lead').length,1);
 });
 await check('Invalid emails and honeypots never send a checklist request',async()=>{
  const f=await fixture();await f.page.goto(origin+'/pcs-checklist');await f.page.locator('[data-meta-decline]').click();
  await f.page.locator('#lm-name').fill('Campaign Test');await f.page.locator('#lm-email').fill('invalid');await f.page.locator('#lm-form button').click();assert.equal(f.requests.length,0);
  await f.page.locator('#lm-email').fill('campaign@example.invalid');await f.page.locator('#lm-form [name=website]').evaluate(el=>el.value='spam');await f.page.locator('#lm-form button').click();assert.equal(f.requests.length,0);
 });
 await check('Accepted call request sends one Lead, not a booked-appointment event',async()=>{
  const f=await fixture({consent:true});await f.page.goto(origin+'/book-pcs-call');await f.page.locator('#book-form [name=name]').fill('Campaign Test');await f.page.locator('#book-form [name=email]').fill('campaign@example.invalid');await f.page.locator('#book-form button').click();
  await f.page.locator('#book-body .vf-ok').waitFor({state:'visible'});assert.equal((await f.meta()).filter(e=>e[2]==='Lead').length,1);
  assert.equal((await f.meta()).filter(e=>e[2]==='Schedule').length,0);
 });
 await check('GPC, unknown query data and the privacy page do not send Meta events',async()=>{
  for(const item of [{path:'/pcs-checklist',gpc:true},{path:'/pcs-checklist?email=private@example.invalid'},{path:'/privacy'}]){
   const f=await fixture({consent:true,gpc:item.gpc});await f.page.goto(origin+item.path);assert.equal(f.sdk.length,0);
  }
 });
 await check('A visit from a benefits article does not leak its referrer through the campaign Pixel',async()=>{
  const f=await fixture({consent:true});await f.page.goto(origin+'/disabled-veteran-benefits-florida');assert.equal(f.sdk.length,0);
  await f.page.locator('.explore-col a[href="/pcs-checklist"]').click();await f.page.waitForURL('**/pcs-checklist');assert.equal(f.sdk.length,0);
 });
}finally{await browser.close();}
writeFileSync('docs/site-growth-2026-09-06/military-campaign-checks.json',JSON.stringify({at:new Date().toISOString(),checks,delivery:'CRM and Meta SDK mocked; no live lead or analytics sent.'},null,2)+'\n');
if(checks.some(c=>!c.pass))process.exitCode=1;
