// A/B check against one complete release. All external requests are blocked.
// No requests, events, inquiries or tile traffic reach production providers.
import {readFileSync,writeFileSync,mkdirSync,existsSync,statSync} from 'node:fs';
import {createServer} from 'node:http';
import {resolve,join,extname,sep} from 'node:path';
import {gzipSync} from 'node:zlib';
import {createRequire} from 'node:module';
import {homedir} from 'node:os';
import assert from 'node:assert/strict';
import {preloadCivilianHomeHero} from './civilian-home-preload.mjs';
const arg=k=>process.argv[process.argv.indexOf(k)+1];
if(!process.argv.includes('--root')||!process.argv.includes('--output'))throw Error('Provide --root and --output');
const root=resolve(arg('--root')),output=resolve(arg('--output'));
const before=readFileSync(join(root,'index.html'),'utf8'),after=preloadCivilianHomeHero(before);
assert.notEqual(before,after,'Baseline already contains the tested change');
assert.equal(before.slice(before.indexOf('</head>')),after.slice(after.indexOf('</head>')),'Body or scripts changed');
const require=createRequire(import.meta.url);let pw;
try{pw=require('playwright')}catch{pw=require(join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));}
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.avif':'image/avif','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2','.svg':'image/svg+xml'};
let variant='before';
const server=createServer((req,res)=>{
 if(req.method!=='GET'){res.writeHead(405).end();return;}
 let p=new URL(req.url,'http://localhost').pathname;if(p==='/')p='/index.html';if(!extname(p))p+='.html';
 const file=resolve(root,'.'+p);if(!file.startsWith(root+sep)||!existsSync(file)||!statSync(file).isFile()){res.writeHead(404).end();return;}
 let body=p==='/index.html'?Buffer.from(variant==='after'?after:before):readFileSync(file);
 const text=/\.(?:html|css|js|json)$/.test(file);
 res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream','Cache-Control':'no-store','X-Robots-Tag':'noindex',...(text?{'Content-Encoding':'gzip'}:{})}).end(text?gzipSync(body):body);
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
mkdirSync(output,{recursive:true});
const browser=await pw.chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
const checks=[],samples=[],layouts=[];
async function check(name,fn){try{await fn();checks.push({name,pass:true});console.log('PASS '+name);}catch(e){checks.push({name,pass:false,error:e.message});console.log('FAIL '+name+': '+e.message);}}
async function context(width=390,mobile=width<768){
 const c=await browser.newContext({viewport:{width,height:844},deviceScaleFactor:mobile?2:1,isMobile:mobile,hasTouch:mobile,reducedMotion:'reduce',serviceWorkers:'block'});
 await c.route('**/*',r=>new URL(r.request().url()).origin===origin&&r.request().method()==='GET'?r.continue():r.abort());
 await c.addInitScript(()=>{
  window.__paint={lcp:[],cls:0};new PerformanceObserver(l=>l.getEntries().forEach(e=>window.__paint.lcp.push({time:e.startTime,url:e.url,element:e.element?.tagName}))).observe({type:'largest-contentful-paint',buffered:true});
  new PerformanceObserver(l=>l.getEntries().forEach(e=>{if(!e.hadRecentInput)window.__paint.cls+=e.value})).observe({type:'layout-shift',buffered:true});
 });return c;
}
try{
 for(const width of [320,390,768,1440])await check(`${width}px: identical content, layout, image choice and working inquiry dialog`,async()=>{
  const pair={};
  for(const key of ['before','after']){
   variant=key;const c=await context(width),p=await c.newPage();
   try{
    await p.goto(origin,{waitUntil:'load'});await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(150);
    pair[key]=await p.evaluate(()=>({text:document.body.innerText,width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,nodes:[...document.querySelectorAll('.main-banner,.gc-coast-hero h1,.gc-coast-hero p,.gc-proof-grid,.gc-hero-image img,.gc-hero-portrait img')].map(e=>({tag:e.tagName,box:e.getBoundingClientRect().toJSON(),font:getComputedStyle(e).fontFamily,source:e.currentSrc||null,complete:e.complete??null,naturalWidth:e.naturalWidth??null}))}));
    assert.ok(pair[key].scroll<=pair[key].width+1,'Horizontal overflow');
    assert.ok(pair[key].nodes.filter(n=>n.tag==='IMG').every(n=>n.complete&&n.naturalWidth),'Missing hero image');
    if(width===390||width===1440)await p.screenshot({path:join(output,`${key}-${width}.png`)});
    if(key==='after'){
     assert.ok(await p.locator('a[href="/reviews"]').filter({hasText:/\d+ client reviews/}).count());
     assert.ok(await p.locator('a[href="/photo-credits"]').count());
     await p.locator('[data-inquiry-open]').first().click();await p.locator('#inquiry-form').waitFor({state:'visible'});await p.keyboard.press('Escape');
     assert.equal(await p.locator('#inquiry-form').isVisible(),false);
    }
   }finally{await c.close();}
  }
  assert.deepEqual(pair.after,pair.before);layouts.push({width,elements:pair.before.nodes.length});
 });
 for(let run=1;run<=3;run++)for(const key of run%2?['before','after']:['after','before']){
  variant=key;const c=await context(),p=await c.newPage(),cdp=await c.newCDPSession(p);
  try{
   await cdp.send('Network.enable');await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});
   await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:200000,uploadThroughput:93750,connectionType:'cellular4g'});await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
   await p.goto(origin,{waitUntil:'load',timeout:45000});await p.waitForTimeout(1800);
   const sample=await p.evaluate(()=>{
    const hero=document.querySelector('.gc-hero-image img'),portrait=document.querySelector('.gc-hero-portrait img');
    const resources=performance.getEntriesByType('resource');
    return {...window.__paint,hero:{complete:hero.complete,naturalWidth:hero.naturalWidth,source:hero.currentSrc,requests:resources.filter(r=>r.name===hero.currentSrc).map(r=>({start:r.startTime,end:r.responseEnd,bytes:r.encodedBodySize}))},portrait:{source:portrait.currentSrc,end:resources.find(r=>r.name===portrait.currentSrc)?.responseEnd},resources:resources.map(r=>({path:new URL(r.name).pathname,bytes:r.encodedBodySize})),viewport:innerWidth};
   });
   assert.equal(sample.hero.requests.length,1,'Duplicate hero fetch');assert.ok(sample.hero.complete&&sample.hero.naturalWidth);
   samples.push({run,key,...sample});console.log(`${run} ${key}: LCP ${Math.round(sample.lcp.at(-1)?.time)}ms, hero complete ${Math.round(sample.hero.requests[0].end)}ms, portrait ${Math.round(sample.portrait.end)}ms`);
  }finally{await c.close();}
 }
 await check('Automatic school map still opens without a click',async()=>{
  const c=await context(),p=await c.newPage();try{await p.goto(origin+'/schools');await p.locator('.leaflet-container').waitFor({state:'visible'});assert.ok(await p.locator('#private-schools').count());assert.ok(await p.locator('#christian-schools').count());}finally{await c.close();}
 });
}finally{await browser.close();await new Promise(r=>server.close(r));}
const median=v=>[...v].sort((a,b)=>a-b)[Math.floor(v.length/2)];
const summary=Object.fromEntries(['before','after'].map(key=>{const s=samples.filter(x=>x.key===key);return[key,{runs:s.length,lcpMedianMs:median(s.map(x=>x.lcp.at(-1)?.time)),heroCompletionMedianMs:median(s.map(x=>x.hero.requests[0].end)),portraitCompletionMedianMs:median(s.map(x=>x.portrait.end)),maxCls:Math.max(...s.map(x=>x.cls))}]}));
const report={checkedAt:new Date().toISOString(),ok:checks.every(x=>x.pass),baseline:root,checks,layouts,summary,samples,externalRequestsAllowed:0,realInquiriesSent:0,limitation:'Local mobile emulation, 4x CPU, 1.6Mbps and 150ms latency. Providers blocked equally. LCP candidate can change; use image completion and preserved layout as separate evidence. Not a production PageSpeed or field-user result.'};
writeFileSync(join(output,'verification.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(summary,null,2));if(!report.ok)process.exitCode=1;
