import assert from 'node:assert/strict';
import {readFileSync,existsSync,statSync,mkdirSync} from 'node:fs';
import {createServer} from 'node:http';
import {join,resolve,extname,sep} from 'node:path';
import {createRequire} from 'node:module';
import {homedir} from 'node:os';
import {save} from './isolated-release-lib.mjs';
const arg=k=>process.argv.includes(k)?process.argv[process.argv.indexOf(k)+1]:null;
const dir=arg('--out')||'artifacts/source-reconciliation/photography-browser';
const require=createRequire(import.meta.url),pw=require(join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const roots={gc:resolve(arg('--gc-root')||'civilian-site'),pmh:resolve(arg('--pmh-root')||'dist')};
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.jpg':'image/jpeg','.webp':'image/webp','.avif':'image/avif','.png':'image/png','.woff2':'font/woff2'};
const servers={};
for(const [site,root] of Object.entries(roots)){
 const server=createServer((req,res)=>{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405).end();return;}
  let path=new URL(req.url,'http://localhost').pathname;if(path==='/')path='/index.html';
  if(!extname(path))path+='.html';const file=resolve(root,'.'+path);
  if(!file.startsWith(root+sep)||!existsSync(file)||!statSync(file).isFile()){res.writeHead(404).end();return;}
  res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream','Cache-Control':'no-store'}).end(readFileSync(file));
 });await new Promise(r=>server.listen(0,'127.0.0.1',r));servers[site]={server,url:'http://127.0.0.1:'+server.address().port};
}
const browser=await pw.chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'}),checks=[];
mkdirSync(join(dir,'browser'),{recursive:true});
try{
 for(const width of [390,1366])for(const [site,path] of [['gc','/'],['gc','/photo-credits'],['gc','/neighborhoods'],['gc','/search'],['gc','/blog/closing-costs-florida-buyers'],['gc','/schools'],['pmh','/'],['pmh','/photo-credits'],['pmh','/communities/pace'],['pmh','/blog/va-loan-assumption-buyers-guide']]){
  const c=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
  await c.route('**/*',async route=>{const u=new URL(route.request().url());if(u.hostname==='127.0.0.1')return route.continue();const target=u.hostname==='greggcostin.com'?'gc':u.hostname==='pensacolamilitaryhousing.com'?'pmh':null;if(target&&u.pathname.startsWith('/images/')){const f=join(roots[target],u.pathname);if(existsSync(f))return route.fulfill({body:readFileSync(f),contentType:mime[extname(f)]||'application/octet-stream'});}return route.abort();});
  const page=await c.newPage();await page.goto(servers[site].url+path,{waitUntil:'networkidle'});
  const links=page.locator('footer a[href="/photo-credits"]:visible');assert.equal(await links.count(),1,site+path+' exactly one visible footer link');
  const result=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+2,h1:document.querySelectorAll('h1').length,credits:[...document.querySelectorAll('[data-image-credit]')].length,body:document.body.innerText}));
  assert.ok(!result.overflow,site+path+' mobile/desktop overflow');assert.equal(result.h1,1,site+path+' H1');
  if(path!=='/photo-credits')assert.doesNotMatch(result.body,/\bPhoto:\s|\bCC BY(?:-SA)?\b/);
  else assert.ok(result.credits>30,site+' complete credit entries');
  if(width===1366&&['/photo-credits','/neighborhoods','/communities/pace'].includes(path))await page.screenshot({path:join(dir,'browser',site+'-'+path.replaceAll('/','_')+'.png')});
  await links.scrollIntoViewIfNeeded();assert.ok(await links.isVisible());
  if(site==='pmh'&&path==='/'){
    assert.equal(await page.locator('#root footer a[href="/photo-credits"]').count(),1,'React footer link retained');
  }
  checks.push({site,path,width,ok:true});console.log('PASS '+site+' '+path+' '+width);await c.close();
 }
 for(const width of [360,390,820,1366]){
  const c=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
  await c.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
  const page=await c.newPage();await page.goto(servers.gc.url+'/',{waitUntil:'networkidle'});
  const ratings=JSON.parse(readFileSync('content/reviews/ratings.json','utf8'));
  const proof=page.locator('.gc-proof');
  assert.equal(await proof.locator('sup').count(),3,'Credential symbols retained');
  assert.equal(await proof.locator('a[href="/reviews"] [data-review-count="combined"]').innerText(),String(ratings.google.count+ratings.zillow.count));
  const layout=await proof.evaluate(el=>[...el.querySelectorAll('.gc-proof-grid>div')].map(col=>({box:col.getBoundingClientRect().toJSON(),content:[...col.querySelectorAll('strong,span')].map(t=>t.getBoundingClientRect().toJSON())})));
  for(const {box,content} of layout)for(const rect of content)assert.ok(rect.left>=box.left-1&&rect.right<=box.right+1,'Proof text remains inside its column at '+width);
  const hint=page.locator('link[data-costin-home-hero-preload]');assert.equal(await hint.count(),1);
  assert.equal(await hint.getAttribute('imagesrcset'),await page.locator('.gc-hero-image picture source').first().getAttribute('srcset'));
  await proof.screenshot({path:join(dir,'browser','homepage-proof-'+width+'.png')});
  checks.push({site:'gc',path:'/',width,proofCountAndCredentials:true,responsivePreload:true,ok:true});
  await page.goto(servers.gc.url+'/reviews',{waitUntil:'networkidle'});
  for(const platform of ['google','zillow']){
   const link=page.locator('a.gc-review-profile[data-review-platform="'+platform+'"]');
   assert.equal(await link.getAttribute('href'),ratings[platform].url);
   assert.equal(await link.locator('[data-review-count="'+platform+'"]').innerText(),String(ratings[platform].count));
   assert.equal(await link.getAttribute('target'),'_blank');
   assert.ok((await link.getAttribute('rel')).includes('noopener'));
  }
  checks.push({site:'gc',path:'/reviews',width,profileLinks:true,ok:true});await c.close();
 }
 const c=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:900}});
 await c.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
 const p=await c.newPage();await p.goto(servers.pmh.url+'/');assert.equal(await p.locator('footer a[href="/photo-credits"]:visible').count(),1);checks.push({site:'pmh',path:'/',javascript:false,ok:true});await c.close();
 save(join(dir,'browser.json'),{ok:true,checks});
}finally{await browser.close();for(const {server} of Object.values(servers))server.close();}
