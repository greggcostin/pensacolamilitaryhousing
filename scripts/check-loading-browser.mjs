// Isolated loading trace. Site assets and cached font fixtures are local; no external requests escape.
import fs from 'node:fs';
import path from 'node:path';
import {createServer} from 'node:http';
import {createRequire} from 'node:module';
import {homedir} from 'node:os';
const require=createRequire(import.meta.url);
const {chromium}=require(path.join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const arg=k=>process.argv.includes(k)?process.argv[process.argv.indexOf(k)+1]:null;
const proof=JSON.parse(fs.readFileSync(arg('--proof'),'utf8'));
const out=arg('--output');fs.mkdirSync(path.dirname(out),{recursive:true});
const candidate=arg('--candidate');
const roots=Object.fromEntries(proof.sites.map(s=>[s.site,candidate?path.resolve(candidate,s.site):s.localBaseline]));
const fontFixture=arg('--font-fixture')?JSON.parse(fs.readFileSync(arg('--font-fixture'),'utf8')):{};
const mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.json':'application/json','.woff2':'font/woff2','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.avif':'image/avif','.svg':'image/svg+xml'};
function locate(root,p){p=new URL(p,'http://local').pathname;if(p==='/')p='/index.html';if(!path.extname(p))p+='.html';const f=path.resolve(root,'.'+p);return f.startsWith(path.resolve(root)+path.sep)&&fs.existsSync(f)&&fs.statSync(f).isFile()?f:null;}
const servers=[],origins={};
for(const [site,root] of Object.entries(roots)){const server=createServer((req,res)=>{const f=locate(root,req.url);if(!f){res.writeHead(404).end();return;}res.writeHead(200,{'Content-Type':mime[path.extname(f)]||'application/octet-stream'}).end(fs.readFileSync(f));});await new Promise(r=>server.listen(0,'127.0.0.1',r));servers.push(server);origins[site]='http://127.0.0.1:'+server.address().port;}
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'}),results=[];
try{
 for(const [site,route] of [['pmh','/schools'],['gc','/schools'],['gc','/team']]){
  const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true,reducedMotion:'reduce'}),page=await context.newPage(),blocked=[],requests=[];
  await context.route('**/*',async r=>{const u=new URL(r.request().url());requests.push(u.href);if(u.hostname==='127.0.0.1')return r.continue();const site=u.hostname==='pensacolamilitaryhousing.com'?'pmh':u.hostname==='greggcostin.com'?'gc':null;const f=site?locate(roots[site],u.href):null;if(f)return r.fulfill({path:f,contentType:mime[path.extname(f)]});if(fontFixture[u.href]){await new Promise(resolve=>setTimeout(resolve,u.hostname==='fonts.googleapis.com'?1200:350));return r.fulfill({path:fontFixture[u.href],contentType:u.hostname==='fonts.googleapis.com'?'text/css':'font/woff2'});}blocked.push(u.hostname);return r.abort();});
  await context.addInitScript(()=>{
   window.__loading={shifts:[],lcp:[]};
   new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)window.__loading.shifts.push({time:e.startTime,value:e.value,sources:e.sources.map(s=>({node:s.node?.tagName+'.'+s.node?.className,previous:s.previousRect.toJSON(),current:s.currentRect.toJSON()}))});}).observe({type:'layout-shift',buffered:true});
   new PerformanceObserver(list=>{for(const e of list.getEntries())window.__loading.lcp.push({time:e.startTime,url:e.url,size:e.size,element:e.element?.tagName+'.'+e.element?.className});}).observe({type:'largest-contentful-paint',buffered:true});
  });
  const cdp=await context.newCDPSession(page);await cdp.send('Network.enable');await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:200000,uploadThroughput:90000});await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
  await page.goto(origins[site]+route,{waitUntil:'load'});if(route==='/schools')await page.locator('.leaflet-container').waitFor({state:'visible',timeout:30000});await page.waitForTimeout(1200);await page.evaluate(()=>document.fonts.ready);
  const data=await page.evaluate(()=>({...window.__loading,mapLoaded:!!document.querySelector('.leaflet-container'),width:innerWidth,scrollWidth:document.documentElement.scrollWidth,heading:document.querySelector('h1')?.textContent,hero:document.querySelector('header.gc-interior-hero,body>header')?.getBoundingClientRect().toJSON(),resources:performance.getEntriesByType('resource').filter(r=>/font|navarre|coastal|css/.test(r.name)).map(r=>({name:r.name,start:r.startTime,end:r.responseEnd,size:r.transferSize}))}));
  let cls=0,windowStart=0,lastShift=0,windowScore=0;
  for(const shift of data.shifts){if(!windowScore||shift.time-lastShift>=1000||shift.time-windowStart>=5000){windowStart=shift.time;windowScore=0;}windowScore+=shift.value;lastShift=shift.time;cls=Math.max(cls,windowScore);}
  const record={site,route,...data,blockedHosts:[...new Set(blocked)],externalRequestsAllowed:0,requests:requests.filter(u=>!/127\.0\.0\.1/.test(u)),cls,sumCLS:data.shifts.reduce((n,s)=>n+s.value,0)};results.push(record);await page.screenshot({path:out.replace(/\.json$/,`-${site}-${route.slice(1)}.png`)});console.log(JSON.stringify({site,route,CLS:record.cls,LCP:data.lcp.at(-1),shifts:data.shifts,mapLoaded:data.mapLoaded}));await context.close();
 }
}finally{await browser.close();for(const s of servers)await new Promise(r=>s.close(r));}
fs.writeFileSync(out,JSON.stringify({checkedAt:new Date().toISOString(),fixture:'390px, 150ms latency, 1.6Mbps download, 4x CPU slowdown, external services blocked, optional cached font responses delayed',roots,results},null,2)+'\n');
