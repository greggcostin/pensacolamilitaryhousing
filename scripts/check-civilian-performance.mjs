// Isolated comparison of the exact baseline and candidate, with no external requests.
import {readFileSync,existsSync,statSync,mkdirSync} from 'node:fs';
import {createServer} from 'node:http';
import {join,resolve,extname,sep} from 'node:path';
import {gzipSync} from 'node:zlib';
import {homedir} from 'node:os';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {json,save} from './isolated-release-lib.mjs';
const dir='docs/performance-2026-09-09',candidate=json(join(dir,'candidate.json'));
const roots={before:resolve(candidate.production.find(s=>s.site==='gc').localBaseline),after:join(candidate.candidate,'gc')};
const require=createRequire(import.meta.url);let pw;try{pw=require('playwright')}catch{pw=require(join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));}
const mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.json':'application/json','.avif':'image/avif','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png','.woff2':'font/woff2'};
const servers={};
for(const [key,root] of Object.entries(roots)){
 const server=createServer((req,res)=>{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405).end();return;}
  const url=new URL(req.url,'http://localhost'),name=url.pathname==='/'?'/index.html':url.pathname;
  let file=resolve(root,'.'+name);if(!extname(file))file+='.html';
  if(!file.startsWith(root+sep)||!existsSync(file)||!statSync(file).isFile()){res.writeHead(404).end();return;}
  const text=/\.(html|css|js|json)$/.test(file),body=readFileSync(file);
  res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream','Cache-Control':'no-store','X-Robots-Tag':'noindex',...(text?{'Content-Encoding':'gzip'}:{})});res.end(text?gzipSync(body):body);
 });await new Promise(r=>server.listen(0,'127.0.0.1',r));servers[key]={server,url:`http://127.0.0.1:${server.address().port}`};
}
mkdirSync(join(dir,'browser'),{recursive:true});
const browser=await pw.chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'}),checks=[],samples=[],comparisons=[];
const record=async(name,fn)=>{try{await fn();checks.push({name,pass:true});console.log('PASS '+name);}catch(e){checks.push({name,pass:false,error:e.message});console.log('FAIL '+name+' '+e.message);}};
async function context(options={}){
 const c=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce',...options});
 await c.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
 await c.addInitScript(()=>{
  window.__paint={lcp:0,cls:0};new PerformanceObserver(l=>{for(const e of l.getEntries())window.__paint.lcp=e.startTime;}).observe({type:'largest-contentful-paint',buffered:true});
  new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.__paint.cls+=e.value;}).observe({type:'layout-shift',buffered:true});
 });return c;
}
async function layout(p){return p.evaluate(()=>({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,items:[...document.querySelectorAll('nav.main-banner,h1,main h2,main p,main form,header,main picture img')].slice(0,65).map(e=>{const b=e.getBoundingClientRect(),s=getComputedStyle(e);return{tag:e.tagName,text:e.tagName==='IMG'?e.alt:e.textContent.trim().slice(0,120),x:Math.round(b.x),y:Math.round(b.y),width:Math.round(b.width),height:Math.round(b.height),font:s.fontFamily,size:s.fontSize,color:s.color,background:s.backgroundColor};})}));}
try{
 for(const width of [320,390,1440]){
  for(const path of ['/','/buy','/neighborhoods','/schools','/neighborhoods/gulf-breeze','/schools/bagdad-elementary-school']){
   await record(`${width} ${path}: content, layout and controls preserved`,async()=>{
    const c=await context({viewport:{width,height:940}}),layouts={};
    try{for(const key of ['before','after']){
     const p=await c.newPage();await p.goto(servers[key].url+path,{waitUntil:'load'});await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(180);
     layouts[key]=await layout(p);assert.ok(layouts[key].scroll<=width+1,'horizontal overflow');assert.equal(await p.locator('h1').count(),1);
     if(path==='/'&&key==='after'&&width!==320)await p.screenshot({path:join(dir,'browser',`home-${width}.png`)});
     if(key==='after'&&width===390&&path==='/buy'){
      // The published mobile design displays the navigation links directly.
      assert.ok(await p.locator('.main-banner a[href="/search"]').isVisible());
      assert.ok(await p.locator('.main-banner a[href="/schools"]').isVisible());
      const trigger=p.locator('[data-inquiry-open]').first();await trigger.click();assert.ok(await p.locator('#inquiry-form').isVisible());await p.keyboard.press('Escape');
     }
     if(key==='after'&&width===390&&path==='/schools'){
      await p.waitForSelector('.leaflet-container');assert.ok(await p.locator('#private-schools').count());assert.ok(await p.locator('#christian-schools').count());
     }
     await p.close();
    }assert.deepEqual(layouts.after,layouts.before);comparisons.push({width,path,elementsCompared:layouts.before.items.length});}finally{await c.close();}
   });
  }
 }
 // Three alternating cold-cache runs per release/page; controlled first-party comparison only.
 for(let run=1;run<=3;run++)for(const path of ['/','/buy','/neighborhoods','/schools'])for(const key of run%2?['before','after']:['after','before']){
  const c=await context(),p=await c.newPage(),cdp=await c.newCDPSession(p);
  try{
   await cdp.send('Network.enable');await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});
   await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:200000,uploadThroughput:93750,connectionType:'cellular4g'});await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
   await p.goto(servers[key].url+path,{waitUntil:'load',timeout:40000});await p.waitForTimeout(1200);
   const sample=await p.evaluate(()=>({paint:window.__paint,resources:performance.getEntriesByType('resource').map(e=>({url:e.name,bytes:e.encodedBodySize,end:e.responseEnd})),htmlBytes:performance.getEntriesByType('navigation')[0]?.encodedBodySize,logos:[...document.querySelectorAll('.banner-row picture img')].map(i=>({current:i.currentSrc,width:i.clientWidth,natural:i.naturalWidth}))}));
   sample.cssRequests=sample.resources.filter(r=>new URL(r.url).pathname.endsWith('.css')).length;sample.totalBytes=sample.htmlBytes+sample.resources.reduce((a,r)=>a+r.bytes,0);samples.push({run,key,path,...sample});
   console.log(`PERF ${run} ${key} ${path}: LCP ${Math.round(sample.paint.lcp)}ms CLS ${sample.paint.cls} CSS ${sample.cssRequests}`);
  }finally{await c.close();}
 }
}finally{await browser.close();for(const {server} of Object.values(servers))await new Promise(r=>server.close(r));}
const median=values=>[...values].sort((a,b)=>a-b)[Math.floor(values.length/2)];
const summary=['/','/buy','/neighborhoods','/schools'].map(path=>({path,...Object.fromEntries(['before','after'].map(key=>{const s=samples.filter(s=>s.key===key&&s.path===path);return[key,{runs:s.length,medianLcpMs:median(s.map(s=>s.paint.lcp)),maximumCls:Math.max(...s.map(s=>s.paint.cls)),medianBytes:median(s.map(s=>s.totalBytes)),cssRequests:s[0]?.cssRequests}]}))}));
save(join(dir,'browser/verification.json'),{checkedAt:new Date().toISOString(),ok:checks.every(c=>c.pass),checks,comparisons,summary,samples,externalRequestsAllowed:0,realInquiriesSent:0,limitation:'Controlled first-party test. Provider scripts and map tiles blocked equally in both versions. Not a live-user or production PageSpeed result.'});
console.log(JSON.stringify(summary,null,2));if(checks.some(c=>!c.pass))process.exitCode=1;
