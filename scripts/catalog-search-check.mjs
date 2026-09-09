import {createRequire} from 'node:module';import {homedir} from 'node:os';import {join,resolve,sep} from 'node:path';import {existsSync,writeFileSync,statSync} from 'node:fs';
import {ROOT,SITES,listFragments,parseFragment,strip} from './blog-lib.mjs';
const require=createRequire(import.meta.url),pw=require(join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const browser=await pw.chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'}),results=[];
try{for(const site of ['gc','pmh']){const context=await browser.newContext();await context.route('**/*',route=>{const u=new URL(route.request().url()),s=Object.values(SITES).find(s=>s.origin===u.origin);if(!s||route.request().method()!=='GET')return route.abort();const root=resolve(ROOT,s.siteDir),path=resolve(root,'.'+u.pathname);if(!path.startsWith(root+sep))return route.abort();const file=existsSync(path)&&statSync(path).isFile()?path:path+'.html';return existsSync(file)?route.fulfill({path:file}):route.abort();});const page=await context.newPage();
 await page.goto(SITES[site].origin+'/blog',{waitUntil:'domcontentloaded'});
 for(const f of listFragments(site)){const {body}=parseFragment(f.path),query=strip(body.match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/)?.[1]||'').replace(/[^\p{L}\p{N} ]/gu,'');
  const urls=await page.evaluate(async query=>{const p=await import('/pagefind/pagefind.js'),result=await p.search(query);return await Promise.all(result.results.slice(0,50).map(async r=>(await r.data()).url));},query);
  const pass=urls.some(u=>new URL(u,SITES[site].origin).pathname.replace(/\.html$/,'')==='/blog/'+f.slug);results.push({site,slug:f.slug,query,pass,urls});console.log((pass?'PASS ':'FAIL ')+site+' '+f.slug);
 }await context.close();}}finally{await browser.close();}
writeFileSync(join(ROOT,'artifacts/catalog-qa/search-browser.json'),JSON.stringify({checkedAt:new Date().toISOString(),remoteRequestsSent:0,results},null,2)+'\n');if(results.some(r=>!r.pass))process.exitCode=1;
