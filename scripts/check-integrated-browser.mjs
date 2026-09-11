// Isolated release integration checks. Every external request is blocked or fulfilled
// from this checkout. Synthetic receipts never reach a provider or production site.
import {createServer} from 'node:http';
import {createRequire} from 'node:module';
import {readFileSync,existsSync,statSync,mkdirSync,writeFileSync} from 'node:fs';
import {resolve,join,extname,sep} from 'node:path';
import {homedir} from 'node:os';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
let pw;try{pw=require('playwright')}catch{pw=require(join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));}
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.avif':'image/avif','.svg':'image/svg+xml','.woff2':'font/woff2'};
const arg=k=>process.argv.includes(k)?process.argv[process.argv.indexOf(k)+1]:null;
const roots={pmh:resolve(arg('--pmh-root')||'dist'),gc:resolve(arg('--gc-root')||'civilian-site')},servers=[];
function pathFor(root,url){let path=decodeURIComponent(new URL(url,'http://localhost').pathname);if(path==='/')path='/index.html';if(!extname(path))path+='.html';const full=resolve(root,'.'+path);return full.startsWith(root+sep)&&existsSync(full)&&statSync(full).isFile()?full:null;}
async function serve(root){const s=createServer((req,res)=>{const f=pathFor(root,req.url);if(!f){res.writeHead(404).end();return;}res.writeHead(200,{'Content-Type':mime[extname(f)]||'application/octet-stream'}).end(readFileSync(f));});await new Promise(r=>s.listen(0,'127.0.0.1',r));servers.push(s);return 'http://127.0.0.1:'+s.address().port;}
const origins={pmh:await serve(roots.pmh),gc:await serve(roots.gc)};
const browser=await pw.chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
const results=[],blocked=[];let fixtureSubmissions=0;
const check=async(name,fn)=>{try{await fn();results.push({name,pass:true});console.log('PASS '+name);}catch(e){results.push({name,pass:false,error:e.message});console.log('FAIL '+name+': '+e.message);}};
async function context(options={}){const c=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce',...options});await c.route('**/*',r=>{const u=new URL(r.request().url());if(u.hostname==='127.0.0.1')return r.continue();const site=u.hostname==='pensacolamilitaryhousing.com'?'pmh':u.hostname==='greggcostin.com'?'gc':null;const f=site?pathFor(roots[site],u.href):null;if(f)return r.fulfill({path:f,contentType:mime[extname(f)]});blocked.push(u.hostname);return r.abort();});await c.addInitScript(()=>{window.__receipts=[];window.__posts=[];window.__events=[];const original=window.fetch.bind(window);window.fetch=(url,opts)=>{if(String(url).includes('costin-contact.gregg-costin.workers.dev')){window.__posts.push(JSON.parse(opts.body));const reply=window.__receipts.shift()||{success:false};return Promise.resolve(new Response(JSON.stringify(reply),{status:200,headers:{'Content-Type':'application/json'}}));}return original(url,opts);};});return c;}
try{
 await check('Confirmed biography and military heading agree before and after JavaScript',async()=>{
  const required=['B.S. in Economics','B.A. in International Affairs','University of Tampa','Part 107 Certified Drone Pilot'];
  const headings=[];
  for(const javaScriptEnabled of [false,true]){
   const ctx=await context({javaScriptEnabled}),p=await ctx.newPage();
   try{
    await p.goto(origins.pmh+'/about',{waitUntil:'load'});
    if(javaScriptEnabled)await p.locator('.about-hero-right').waitFor();
    const text=await p.locator('body').innerText();
    for(const phrase of required)assert.ok(text.includes(phrase),phrase);
    assert.ok(text.includes('20 years of service and 11 personal PCS moves'));
    headings.push(await p.locator('h1').innerText());
    await p.goto(origins.gc+'/team',{waitUntil:'load'});
    const bio=await p.locator('[data-profile-biography]').innerText();
    for(const phrase of required)assert.ok(bio.includes(phrase),phrase);
    assert.ok(bio.includes('Pensacola, the Emerald Coast and coastal Alabama'));
    assert.equal(await p.locator('[data-profile-biography] a[href="/buy"]').count(),1);
    assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1));
   }finally{await ctx.close();}
  }
  assert.equal(headings[0],headings[1]);
 });
 const c=await context(),page=await c.newPage();
 const paths={pmh:['/','/about','/contact','/pcs-guide','/mortgage-calculators','/communities','/bah-vs-cost-of-owning-pensacola','/va-funding-fee-2026','/communities/navarre','/schools','/schools/pensacola-christian-academy'],gc:['/','/buy','/sell','/resources','/neighborhoods/perdido-key','/neighborhoods/navarre','/neighborhoods/gulf-breeze','/neighborhoods/east-hill-downtown','/neighborhoods/cordova-park-northeast','/neighborhoods/fort-walton-beach','/neighborhoods/destin','/gulf-shores-orange-beach','/blog/what-moves-mortgage-rates','/schools','/schools/pensacola-christian-academy']};
 for(const [site,urls]of Object.entries(paths))for(const path of urls)await check(site+path+' mobile content and layout',async()=>{await page.goto(origins[site]+path,{waitUntil:'load'});await page.evaluate(()=>document.fonts.ready);assert.equal(await page.locator('h1').count(),1);const size=await page.evaluate(()=>({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));assert.ok(size.scroll<=size.width+1,JSON.stringify(size));assert.ok(await page.locator('a[href*="'+(site==='gc'?'pensacolamilitaryhousing.com':'greggcostin.com')+'"]').count());});
 for(const site of ['pmh','gc'])await check(site+' automatic school map and category order',async()=>{await page.goto(origins[site]+'/schools',{waitUntil:'load'});await page.locator('.leaflet-container').waitFor({state:'visible'});const order=await page.evaluate(()=>{const ids=['school-finder','private-school-resources','all-school-guides'];return ids.map(id=>({id,y:document.getElementById(id)?.getBoundingClientRect().top}));});assert.ok(order[0].y<order[1].y&&order[1].y<order[2].y);assert.equal(await page.locator('a[href="/schools/pensacola-christian-academy"]').count()>0,true);});
 await check('School directory links preserve normal clicks after typing',async()=>{
  await page.goto(origins.gc+'/schools');
  await page.locator('.sf-result').first().waitFor({state:'visible'});
  await page.locator('#sf-query').fill('Carden');
  const result=page.locator('.sf-result').filter({hasText:'Carden Christian Academy'});
  await result.getByRole('button',{name:'Show on map',exact:false}).click();
  await page.locator('.leaflet-popup').waitFor({state:'visible'});
  assert.match(await page.locator('.leaflet-popup').innerText(),/Carden Christian Academy/i);
 });
 const receipt={success:true,accepted:true,duplicate:false,receiptId:'319fda5c-2ec3-4d05-a354-fd7bf05f14d5',captureStatus:'crm_accepted'};
 for(const [site,path,selector]of [['pmh','/va-funding-fee-2026','#inquiry-form'],['gc','/neighborhoods/navarre','#inquiry-form'],['gc','/contact','#inquiry-form-c'],['pmh','/contact','main form']])await check(site+path+' requires an accepted receipt; duplicates do not count',async()=>{const ctx=await context(),p=await ctx.newPage();try{await p.goto(origins[site]+path,{waitUntil:'load'});await p.evaluate(()=>{window.gtag=(...a)=>window.__events.push(a);localStorage.removeItem('costin_accepted_receipts_v1');});const f=p.locator(selector);if(!(await f.isVisible()))await p.locator('[data-inquiry-open]').first().click();await f.locator('[name=name],input[autocomplete=name],input[id$="-name"]').first().fill('Local fixture only');await f.locator('[name=email],input[type=email]').first().fill('fixture@example.invalid');const message=f.locator('[name=message],textarea');if(await message.count())await message.first().fill('Isolated local fixture.');for(const box of await f.locator('input[type=checkbox][required]').all())await box.check();await p.evaluate(()=>window.__receipts.push({success:true}));await f.evaluate(f=>f.requestSubmit());await p.waitForFunction(()=>window.__posts.length===1);assert.equal(await p.evaluate(()=>window.__events.filter(e=>e[1]==='generate_lead').length),0);await p.evaluate(r=>window.__receipts.push(r),receipt);await f.evaluate(f=>f.requestSubmit());await p.waitForFunction(()=>window.__events.some(e=>e[1]==='generate_lead'));await p.evaluate(r=>window.costinConversions.accept(true,r,'inquiry-form'),receipt);const events=await p.evaluate(()=>window.__events);assert.equal(events.filter(e=>e[1]==='generate_lead').length,1);assert.ok(!JSON.stringify(events).includes('fixture@example'));fixtureSubmissions+=await p.evaluate(()=>window.__posts.length);}finally{await ctx.close();}});
 await check('No-JavaScript ownership study retains all 26 rows',async()=>{const ctx=await context({javaScriptEnabled:false}),p=await ctx.newPage();try{await p.goto(origins.pmh+'/bah-vs-cost-of-owning-pensacola');assert.equal(await p.locator('main tbody tr').count(),26);assert.match(await p.locator('main').innerText(),/illustrative/);}finally{await ctx.close();}});
 await c.close();
}finally{await browser.close();for(const s of servers)await new Promise(r=>s.close(r));}
const out=process.env.INTEGRATION_BROWSER_OUTPUT||'artifacts/source-integration/browser.json';mkdirSync(resolve(out,'..'),{recursive:true});writeFileSync(out,JSON.stringify({checkedAt:new Date().toISOString(),externalRequestsAllowed:0,fixtureSubmissions,blockedHosts:[...new Set(blocked)],checks:results},null,2)+'\n');
if(results.some(r=>!r.pass))process.exitCode=1;
