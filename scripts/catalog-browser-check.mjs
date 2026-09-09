// Read-only browser QA against local release files. No remote request or form submit.
import {createRequire} from 'node:module';import {homedir} from 'node:os';import {join,resolve,sep} from 'node:path';
import {readFileSync,existsSync,mkdirSync,writeFileSync} from 'node:fs';import assert from 'node:assert/strict';
import {listFragments,parseFragment,SITES,ROOT} from './blog-lib.mjs';
const require=createRequire(import.meta.url),pw=require(join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const out=join(ROOT,'artifacts/catalog-qa');mkdirSync(out,{recursive:true});
const browser=await pw.chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'}),results=[];
try{for(const width of [390,1280]){
 const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});context.setDefaultTimeout(5000);
 await context.route('**/*',route=>{const req=route.request(),u=new URL(req.url()),site=Object.values(SITES).find(s=>s.origin===u.origin);if(req.method()!=='GET'||!site)return route.abort();const dir=resolve(ROOT,site.siteDir),path=resolve(dir,'.'+decodeURIComponent(u.pathname));if(!path.startsWith(dir+sep))return route.abort();const file=existsSync(path)&&!u.pathname.endsWith('/')?path:path+(u.pathname==='/'?'index.html':'.html');return existsSync(file)?route.fulfill({path:file}):route.abort();});
 for(const site of ['gc','pmh'])for(const f of listFragments(site)){
  if(process.argv.length>2&&!process.argv.slice(2).includes(f.slug))continue;
  const {spec}=parseFragment(f.path),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  try{
   await page.goto(SITES[site].origin+'/blog/'+f.slug,{waitUntil:'networkidle'});
   const decline=page.getByRole('button',{name:'No thanks',exact:true});if(await decline.isVisible())await decline.click();
   assert.equal(await page.locator('h1').count(),1);assert.equal(await page.locator('[data-quick-answer]').count(),1);
   assert.equal((await page.locator('.qa-text').innerText()).replace(/\s+/g,' ').trim(),spec.quickAnswer.replace(/\s+/g,' ').trim());
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);assert(overflow<=2,'Page overflow '+overflow);
   const hero=page.locator('main figure img').first();await hero.scrollIntoViewIfNeeded();await hero.evaluate(img=>img.decode());assert(await hero.evaluate(img=>img.naturalWidth>0));
   assert((await hero.getAttribute('srcset'))?.includes('480w'),'Hero responsive widths');
   const table=page.locator('main table').first();await table.scrollIntoViewIfNeeded();assert(await table.isVisible());assert((await table.locator('caption').innerText()).trim().length>0);
   const details=page.locator('main details');assert(await details.count()>=6);await details.last().locator('summary').click();assert(await details.last().getAttribute('open')!==null);
   await page.locator('[data-blog-copy]').scrollIntoViewIfNeeded();assert(await page.locator('[data-blog-copy]').isVisible());
   assert.equal(errors.length,0,errors.join('; '));
   await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:join(out,site+'-'+f.slug+'-'+width+'.png')});
   if(['what-moves-mortgage-rates','best-neighborhoods-eglin-afb-families'].includes(f.slug)){await table.scrollIntoViewIfNeeded();await page.screenshot({path:join(out,site+'-'+f.slug+'-table-'+width+'.png')});}
   results.push({site,slug:f.slug,width,pass:true});console.log('PASS '+site+' '+f.slug+' '+width);
  }catch(e){results.push({site,slug:f.slug,width,pass:false,error:e.message});console.log('FAIL '+f.slug+' '+width+': '+e.message);await page.screenshot({path:join(out,'failure-'+site+'-'+f.slug+'-'+width+'.png')});}finally{await page.close();}
 }
 await context.close();
}}finally{await browser.close();}
writeFileSync(join(out,'browser.json'),JSON.stringify({checkedAt:new Date().toISOString(),remoteRequestsSent:0,formSubmissions:0,results},null,2)+'\n');
console.log(JSON.stringify({checked:results.length,passed:results.filter(r=>r.pass).length,failed:results.filter(r=>!r.pass)},null,2));if(results.some(r=>!r.pass))process.exitCode=1;
