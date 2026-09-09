// Run the exact published scripts in an isolated browser. Every request is intercepted;
// no provider SDK, CRM request or analytics event leaves this test process.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {join} from 'node:path';
import {homedir} from 'node:os';
import {json,save,sha} from './isolated-release-lib.mjs';
const require=createRequire(import.meta.url);let pw;
try{pw=require('playwright');}catch{pw=require(join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));}
const baseline=json('content/reviews/automation.json').baselineRoot;
const out='docs/growth-execution-2026-09-08/meta/browser-verification.json';
const browser=await pw.chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
const checks=[];
const receipt={success:true,accepted:true,duplicate:false,receiptId:'ac8c31f1-4e18-4603-a6fc-114b36c11538',captureStatus:'crm_accepted'};
const countEvent=(queue,name)=>queue.filter(args=>args[0]==='trackSingle'&&args[2]===name).length;
const events=p=>p.evaluate(()=>({meta:(window.fbq?.queue||[]).map(x=>Array.from(x)),ga:window.__ga||[]}));
const record=async(name,fn)=>{try{await fn();checks.push({name,pass:true});}catch(e){checks.push({name,pass:false,error:e.message});}console.log((checks.at(-1).pass?'PASS ':'FAIL ')+name);};
try{
 for(const site of ['gc','pmh']){
  const root=join(baseline,site),domain=site==='gc'?'greggcostin.com':'pensacolamilitaryhousing.com';
  const source=readFileSync(join(root,site==='pmh'?'reviews.html':'index.html'),'utf8');
  const guard=source.match(/<script data-costin-host-guard>[\s\S]*?<\/script>/)?.[0];
  assert.ok(guard,'Published production guard missing');
  const scripts=['costin-meta-config.js','costin-meta.js','costin-conversions.js'];
  const fixture=`<!doctype html><html><head>${guard}<script>window.__ga=[];window.gtag=(...a)=>window.__ga.push(a);</script></head><body><button data-meta-settings hidden>Ad preferences</button><a href="tel:+18502665005">Call Gregg</a>${scripts.map(f=>`<script src="/assets/${f}"></script>`).join('')}</body></html>`;
  async function open(options={}){
   const c=await browser.newContext(),requested=[];
   await c.addInitScript(({choice,gpc,dnt,age})=>{
    if(choice)localStorage.setItem('costin_meta_consent_v1',JSON.stringify({choice,at:Date.now()-(age||0)}));
    Object.defineProperty(navigator,'globalPrivacyControl',{get:()=>!!gpc});
    Object.defineProperty(navigator,'doNotTrack',{get:()=>dnt?'1':null});
   },options);
   await c.route('**/*',r=>{
    const u=new URL(r.request().url());requested.push(u.href);
    if(scripts.some(f=>u.pathname==='/assets/'+f))return r.fulfill({contentType:'application/javascript',body:readFileSync(join(root,u.pathname),'utf8')});
    if(r.request().isNavigationRequest())return r.fulfill({contentType:'text/html',body:fixture});
    // Even the Meta SDK request receives only an empty local fixture.
    return r.fulfill({contentType:'application/javascript',body:''});
   });
   const p=await c.newPage();
   await p.goto(options.url||`https://${domain}/buy`,{referer:options.referer,waitUntil:'load'});
   return{c,p,requested};
  }
  const sdk=t=>t.requested.filter(url=>url.includes('connect.facebook.net')).length;
  await record(`${site}: no Meta SDK or event before consent; decline remains off`,async()=>{
   const t=await open();try{assert.equal(sdk(t),0);assert.equal((await events(t.p)).meta.length,0);await t.p.getByRole('button',{name:'No thanks',exact:true}).click();assert.equal(await t.p.evaluate(()=>window.costinMeta.track('Contact')),false);assert.equal(sdk(t),0);}finally{await t.c.close();}
  });
  await record(`${site}: consent sends one PageView; invalid or duplicate receipts never add Leads; payload excludes personal data`,async()=>{
   const t=await open();try{
    await t.p.getByRole('button',{name:'Allow Meta cookies',exact:true}).click();
    await t.p.waitForFunction(()=>window.fbq?.queue?.length>0);
    const result=await t.p.evaluate(data=>{
     const bad=[window.costinConversions.accept(true,{success:true},'inquiry-form'),window.costinConversions.accept(false,data,'inquiry-form'),window.costinConversions.accept(true,{...data,accepted:false},'inquiry-form')];
     document.dispatchEvent(new CustomEvent('costin:lead-success',{detail:{receipt_verified:true}}));
     const supplied={...data,name:'Synthetic Person',email:'fixture@example.invalid',phone:'555-0100',message:'Private sample'};
     const first=window.costinConversions.accept(true,supplied,'inquiry-form');
     const repeated=window.costinConversions.accept(true,supplied,'inquiry-form');
     const duplicate=window.costinConversions.accept(true,{...supplied,duplicate:true,receiptId:'8321283c-29dd-4d9e-801d-1d19c096ab86'},'inquiry-form');
     return{bad,first,repeated,duplicate};
    },receipt);
    assert.deepEqual(result.bad,[false,false,false]);assert.equal(result.first,true);
    const e=await events(t.p);assert.equal(countEvent(e.meta,'PageView'),1);assert.equal(countEvent(e.meta,'Lead'),1);assert.equal(e.ga.filter(a=>a[1]==='generate_lead').length,1);
    assert.ok(!/Synthetic|fixture@example|555-0100|Private sample|ac8c31f1/.test(JSON.stringify(e)));
    assert.equal(sdk(t),1);
   }finally{await t.c.close();}
  });
  await record(`${site}: withdrawal revokes consent, clears accessible cookies and stops Contact/Lead`,async()=>{
   const t=await open({choice:'granted'});try{
    await t.c.addCookies([{name:'_fbp',value:'test-only',domain,path:'/'}]);
    await t.p.getByRole('button',{name:'Ad preferences'}).click();await t.p.getByRole('button',{name:'No thanks',exact:true}).click();
    await t.p.evaluate(data=>{window.costinMeta.track('Contact');window.costinConversions.accept(true,data,'inquiry-form');},receipt);
    const e=await events(t.p);assert.equal(countEvent(e.meta,'Lead'),0);assert.equal(countEvent(e.meta,'Contact'),0);assert.ok(e.meta.some(a=>a[0]==='consent'&&a[1]==='revoke'));assert.ok(!(await t.c.cookies()).some(c=>c.name==='_fbp'));
   }finally{await t.c.close();}
  });
  await record(`${site}: GPC overrides saved permission and suppresses conversion telemetry`,async()=>{
   const t=await open({choice:'granted',gpc:true});try{await t.p.evaluate(data=>window.costinConversions.accept(true,data,'inquiry-form'),receipt);assert.equal(sdk(t),0);const e=await events(t.p);assert.equal(e.meta.length,0);assert.equal(e.ga.length,0);}finally{await t.c.close();}
  });
  for(const [label,options] of [
   ['address query',{url:`https://${domain}/schools?address=123%20Sample%20Street`}],
   ['fragment',{url:`https://${domain}/schools#school-finder`}],
   ['sensitive same-site referrer',{referer:`https://${domain}/schools?address=123%20Sample%20Street`}],
   ['preview host',{url:'http://127.0.0.1:4199/buy'}],
   ['expired consent',{age:181*86400000}],
  ])await record(`${site}: ${label} keeps Meta off`,async()=>{
   const t=await open({choice:'granted',...options});try{assert.equal(sdk(t),0);assert.equal((await events(t.p)).meta.length,0);}finally{await t.c.close();}
  });
  await record(`${site}: route updates produce one PageView per path and cross-tab withdrawal stops tracking`,async()=>{
   const t=await open({choice:'granted'});try{
    await t.p.evaluate(()=>{document.dispatchEvent(new CustomEvent('costin:page-view'));history.pushState({},'','/sell');document.dispatchEvent(new CustomEvent('costin:page-view'));document.dispatchEvent(new CustomEvent('costin:page-view'));});
    assert.equal(countEvent((await events(t.p)).meta,'PageView'),2);
    await t.p.evaluate(()=>{window.dispatchEvent(new StorageEvent('storage',{key:'costin_meta_consent_v1',newValue:JSON.stringify({choice:'denied',at:Date.now()})}));window.costinMeta.track('Contact');});
    assert.equal(countEvent((await events(t.p)).meta,'Contact'),0);
   }finally{await t.c.close();}
  });
 }
}finally{await browser.close();}
const files=['gc','pmh'].flatMap(site=>['costin-meta-config.js','costin-meta.js','costin-conversions.js'].map(file=>({site,file,sha256:sha(join(baseline,site,'assets',file))})));
save(out,{checkedAt:new Date().toISOString(),baseline,passed:checks.every(c=>c.pass),checks,files,networkRequestsForwarded:0,realInquiriesSent:0,limitation:'Intercepted SDK and receipt fixtures validate browser behavior, not provider receipt of a real Lead or a qualified CRM outcome.'});
if(checks.some(c=>!c.pass))process.exitCode=1;
