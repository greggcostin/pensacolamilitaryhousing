// Local acceptance checks. Every external request is blocked; no lead is created.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {homedir} from 'node:os';
import {join} from 'node:path';
import {readFileSync,writeFileSync,mkdirSync,readdirSync} from 'node:fs';
const require=createRequire(import.meta.url);
const {chromium}=require(join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
const out='docs/search-growth-2026-09-06';mkdirSync(out,{recursive:true});
const base=process.env.CIVILIAN_PREVIEW_URL||'http://127.0.0.1:4174';
const paths=JSON.parse(readFileSync('content/client-guides/web-manifest.json','utf8')).paths;
const findings=[],metrics=[];
const context=await browser.newContext({viewport:{width:375,height:812},reducedMotion:'reduce'});
await context.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());
await context.addInitScript(()=>{window.__shifts=[];window.__lcp=[];new PerformanceObserver(l=>l.getEntries().forEach(e=>{if(!e.hadRecentInput)window.__shifts.push(e.value)})).observe({type:'layout-shift',buffered:true});new PerformanceObserver(l=>l.getEntries().forEach(e=>window.__lcp.push(e.startTime))).observe({type:'largest-contentful-paint',buffered:true});});
const page=await context.newPage();page.on('pageerror',e=>findings.push(e.message));
for(const path of ['/', '/buy','/neighborhoods',...paths]){
 await page.goto(base+path,{waitUntil:'load'});await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(350);
 const m=await page.evaluate(()=>({path:location.pathname,cls:window.__shifts.reduce((a,b)=>a+b,0),lcpMs:window.__lcp.at(-1)||null,width:innerWidth,scrollWidth:document.documentElement.scrollWidth,invalidLinks:[...document.querySelectorAll('[href],[src]')].map(e=>e.getAttribute('href')||e.getAttribute('src')).filter(v=>v==='null'||/\/(?:schools\/)?null$/.test(v||''))}));
 metrics.push(m);assert.ok(m.scrollWidth<=m.width+1,path+' overflow');assert.equal(m.invalidLinks.length,0);
 if(path==='/resources/mortgage-preapproval')await page.screenshot({path:out+'/preapproval-mobile.png',fullPage:false});
}
await page.goto(base+'/resources/client-guides');
await page.evaluate(()=>document.addEventListener('click',e=>{if(e.target.closest('[data-guide-link]'))e.preventDefault();}));
await page.locator('[data-guide-link="preapproval-first"]').click();
const events=await page.evaluate(()=>(window.dataLayer||[]).filter(e=>e[0]==='event').map(e=>[...e]));
assert.equal(events.filter(e=>e[1]==='guide_select'&&e[2].guide==='preapproval-first'&&e[2].guide_format==='pdf').length,1);
assert.equal(events.filter(e=>e[1]==='generate_lead').length,0);
// A 200 response with success:false must not count as an accepted inquiry.
assert.ok(await page.locator('a[href="/contact"]').count());
await page.goto(base+'/contact');
let calls=0;await page.route('https://costin-contact.gregg-costin.workers.dev/**',r=>{calls++;return r.fulfill({status:200,contentType:'application/json',body:'{"success":false,"error":"Synthetic rejection"}'})});
await page.locator('#c-name').fill('Local QA');await page.locator('#c-email').fill('test@example.invalid');
await page.locator('#inquiry-form-c button[type=submit]').click();await page.locator('#inquiry-err-c').waitFor({state:'visible'});
assert.equal(calls,1);assert.equal(await page.evaluate(()=>(window.dataLayer||[]).filter(e=>e[1]==='generate_lead').length),0);
const noJs=await browser.newContext({javaScriptEnabled:false,viewport:{width:375,height:812}});await noJs.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());
for(const path of paths){const p=await noJs.newPage();await p.goto(base+path);assert.equal(await p.locator('h1').count(),1);assert.ok((await p.locator('main').innerText()).split(/\s+/).length>700);assert.ok(await p.locator('a[href$=".pdf"]').count());await p.close();}
// Inspect static source attributes across the entire civilian site for the null URLs seen by Meta.
const walk=d=>readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(d,e.name)):e.name.endsWith('.html')?[join(d,e.name)]:[]);
for(const f of walk('civilian-site'))if(/(?:href|src)=["'](?:null|\/(?:schools\/)?null)["']/.test(readFileSync(f,'utf8')))findings.push(f+': invalid null asset/link');
await browser.close();assert.deepEqual(findings,[]);
writeFileSync(out+'/local-search-qa.json',JSON.stringify({checkedAt:new Date().toISOString(),metrics,findings,guideClick:'Exactly one guide_select with pdf format; no lead event',rejected200:'No generate_lead on success:false',noJs:`All ${paths.length} new pages retain substantive HTML and PDF links`,scope:'375px local Edge, cached/local assets, external requests blocked. These timings are diagnostic, not PSI or CrUX, and do not establish field performance.'},null,2)+'\n');
console.log('Search-growth QA passed: 375px layout, static HTML, PDF event, rejected inquiry and null-link checks.');
