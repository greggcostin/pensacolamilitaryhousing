// Test built pages on simulated production/local origins. All external requests are mocked.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync,writeFileSync,readdirSync,existsSync} from 'node:fs';
import {resolve,extname,sep,join,relative} from 'node:path';
import {homedir} from 'node:os';
const require=createRequire(import.meta.url);
let pw;try{pw=require('playwright');}catch{pw=require(join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));}
const browser=await pw.chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
const origin='https://pensacolamilitaryhousing.com',root=resolve('dist'),checks=[],coverage=[];
const walk=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(dir,e.name)):e.name.endsWith('.html')?[join(dir,e.name)]:[]);
let contexts=[];
async function fixture({consent=false,gpc=false,status=200,body={success:true},host='pensacolamilitaryhousing.com'}={}){
 const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});contexts.push(context);
 const sdk=[],requests=[],errors=[],outbound=[];
 await context.route('**/*',async route=>{
  const url=new URL(route.request().url());
  if(url.hostname==='costin-contact.gregg-costin.workers.dev'){
   const headers={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'content-type'};
   if(route.request().method()==='OPTIONS')return route.fulfill({status:204,headers});
   requests.push(route.request().postDataJSON());return route.fulfill({status,headers,contentType:'application/json',body:JSON.stringify(body)});
  }
  if(url.hostname==='connect.facebook.net'){
   sdk.push(url.href);return route.fulfill({contentType:'text/javascript',body:'window.__meta=window.fbq.queue.map(x=>({args:Array.from(x),path:location.pathname,title:document.title}));window.fbq.callMethod=function(){window.__meta.push({args:Array.from(arguments),path:location.pathname,title:document.title});};'});
  }
  if(url.hostname===host){
   let path=decodeURIComponent(url.pathname);if(path.endsWith('/'))path+='index.html';else if(!extname(path))path+='.html';
   const file=resolve(root,'.'+path);
   if(!file.startsWith(root+sep)||!existsSync(file))return route.fulfill({status:404,body:''});
   return route.fulfill({contentType:{'.html':'text/html','.js':'text/javascript','.css':'text/css','.woff2':'font/woff2','.jpg':'image/jpeg','.webp':'image/webp','.avif':'image/avif','.png':'image/png','.wasm':'application/wasm'}[extname(file)]||'application/octet-stream',body:readFileSync(file)});
  }
  outbound.push(url.href);return route.abort();
 });
 await context.addInitScript(({consent,gpc})=>{
  if(consent&&!localStorage.getItem('costin_meta_consent_v1'))localStorage.setItem('costin_meta_consent_v1',JSON.stringify({choice:'granted',at:Date.now()}));
  if(gpc)Object.defineProperty(navigator,'globalPrivacyControl',{value:true});
 },{consent,gpc});
 const page=await context.newPage();page.setDefaultTimeout(6000);page.on('pageerror',e=>errors.push(e.message));
 const events=async type=>(await page.evaluate(()=>window.__meta||[])).filter(e=>e.args[0]==='trackSingle'&&e.args[2]===type);
 return {page,context,sdk,requests,errors,outbound,events};
}
async function check(name,fn){try{await fn();checks.push({name,pass:true});console.log('PASS '+name);}catch(e){checks.push({name,pass:false,error:e.message});console.log('FAIL '+name+': '+e.message);}finally{await Promise.all(contexts.map(c=>c.close()));contexts=[];}}
try{
 await check('All built military pages load the shared Pixel once after consent',async()=>{
  const f=await fixture({consent:true});
  for(const file of walk(root)){
   const path='/'+relative(root,file).replaceAll('\\','/').replace(/index\.html$/,'').replace(/\.html$/,'');
   const before=f.sdk.length;await f.page.goto(origin+path);await f.page.waitForFunction(()=>window.__meta?.some(e=>e.args[2]==='PageView'));
   assert.equal(f.sdk.length-before,1,path+' SDK');assert.equal((await f.events('PageView')).length,1,path+' PageView');
   assert.equal(await f.page.locator('[data-meta-settings]').count(),1,path+' preferences');
   assert.equal(await f.page.locator('[data-meta-settings]').isVisible(),true,path+' visible preferences');
   assert.equal(await f.page.evaluate(()=>window.fbq.disablePushState),true,path+' explicit navigation');
   coverage.push({path,pageViews:1,settings:true});
  }
  assert.equal(coverage.length,103);assert.deepEqual(f.errors,[]);
 });
 await check('SPA consent and preferences survive React rendering; navigation and history count exactly once',async()=>{
  const f=await fixture();await f.page.goto(origin+'/');await f.page.locator('footer [data-meta-settings]').waitFor();
  assert.equal(f.sdk.length,0);await f.page.screenshot({path:'docs/site-growth-2026-09-06/military-meta-consent-mobile.png'});
  await f.page.locator('[data-meta-decline]').click();
  await f.page.locator('footer').getByRole('button',{name:'Contact',exact:true}).click();await f.page.waitForURL('**/contact');assert.equal(f.sdk.length,0);
  await f.page.locator('footer [data-meta-settings]').click();await f.page.locator('[data-meta-accept]').click();
  await f.page.waitForFunction(()=>window.__meta?.some(e=>e.args[2]==='PageView'));
  assert.deepEqual((await f.events('PageView')).map(e=>e.path),['/contact']);
  await f.page.goBack();await f.page.waitForFunction(()=>window.__meta?.filter(e=>e.args[2]==='PageView').length===2);
  await f.page.goForward();await f.page.waitForFunction(()=>window.__meta?.filter(e=>e.args[2]==='PageView').length===3);
  await f.page.locator('footer').getByRole('button',{name:'Contact',exact:true}).click();
  assert.deepEqual((await f.events('PageView')).map(e=>e.path),['/contact','/','/contact']);assert.equal(f.sdk.length,1);
  assert.match((await f.events('PageView'))[2].title,/Contact Gregg/);
  await f.page.locator('footer [data-meta-settings]').click();await f.page.locator('[data-meta-decline]').click();await f.page.goBack();
  assert.equal(await f.page.evaluate(()=>window.costinMeta.track('Lead')),false);assert.equal((await f.events('PageView')).length,3);
  assert.deepEqual(f.errors,[]);
 });
 await check('Local previews, GPC and unsafe URL/referrer data send no Meta events',async()=>{
  for(const item of [{url:'http://127.0.0.1:4183/'},{url:'http://localhost:5173/bah-rates'},{url:'https://preview.pensacolamilitaryhousing.pages.dev/'},{url:origin+'/bah-rates',gpc:true},{url:origin+'/bah-rates?email=private@example.invalid'},{url:origin+'/bah-rates',referer:origin+'/contact?email=private@example.invalid'}]){
   // Block canonical redirects from previews into production; inspect the preview document itself.
   const f=await fixture({consent:true,gpc:item.gpc,host:new URL(item.url).hostname});await f.page.goto(item.url,{referer:item.referer});
   assert.equal(f.sdk.length,0,item.url);assert.equal((await f.events('PageView')).length,0,item.url);
   if(!item.url.startsWith(origin))assert.equal(f.outbound.filter(u=>/googletagmanager|clarity\.ms|widgetbe\.com|facebook/.test(u)).length,0,item.url+' all analytics');
  }
 });
 for(const path of ['/pcs-guide','/contact'])for(const result of [{status:200,body:{success:true},leads:1},{status:200,body:{success:'false'},leads:0},{status:503,body:{success:true},leads:0}]){
  await check('SPA inquiry '+path+' '+JSON.stringify(result),async()=>{
   const f=await fixture({consent:true,...result});await f.page.goto(origin+path);
   const form=f.page.locator('form').first();await form.getByLabel('Full Name *',{exact:true}).fill('Pixel Test');await form.getByLabel('Email Address *',{exact:true}).fill('pixel@example.invalid');
   await form.locator('button[type=submit]').click();await f.page.waitForFunction(()=>!document.querySelector('form button[type=submit]:disabled'));
   assert.equal(f.requests.length,1);assert.equal((await f.events('Lead')).length,result.leads);
   assert.doesNotMatch(JSON.stringify(await f.events('Lead')),/Pixel Test|pixel@example|phone|message/);assert.deepEqual(f.errors,[]);
  });
 }
 await check('Static guide modal counts only accepted inquiries and rejects invalid input',async()=>{
  for(const success of [false,true]){
   const f=await fixture({consent:true,body:{success}});await f.page.goto(origin+'/bah-rates');
   await f.page.locator('[data-inquiry-open]').first().click();const form=f.page.locator('#inquiry-form');
   await form.locator('[name=name]').fill('Pixel Test');await form.locator('[name=email]').fill('invalid');await form.locator('button[type=submit]').click();assert.equal(f.requests.length,0);
   await form.locator('[name=email]').fill('pixel@example.invalid');await form.locator('button[type=submit]').click();await f.page.waitForFunction(()=>!document.querySelector('#inquiry-form button:disabled'));
   assert.equal(f.requests.length,1);assert.equal((await f.events('Lead')).length,success?1:0);assert.deepEqual(f.errors,[]);
  }
 });
 await check('Home valuation request counts one accepted Lead with no form-field parameters',async()=>{
  const f=await fixture({consent:true});await f.page.goto(origin+'/whats-my-home-worth');const form=f.page.locator('#val-form');
  await form.locator('[name=name]').fill('Pixel Test');await form.locator('[name=email]').fill('pixel@example.invalid');await form.locator('[name=vaddress]').fill('123 Test Street');
  await form.locator('button[type=submit]').click();await f.page.locator('#val-body .vf-ok').waitFor();assert.equal(f.requests.length,1);assert.equal((await f.events('Lead')).length,1);
  assert.doesNotMatch(JSON.stringify(await f.events('Lead')),/Pixel Test|pixel@example|123 Test Street/);assert.deepEqual(f.errors,[]);
 });
}finally{await browser.close();}
writeFileSync('docs/site-growth-2026-09-06/military-meta-checks.json',JSON.stringify({at:new Date().toISOString(),checks,coverage,delivery:'All external requests mocked or blocked; no real Meta event or CRM contact created.'},null,2)+'\n');
if(checks.some(c=>!c.pass))process.exitCode=1;
