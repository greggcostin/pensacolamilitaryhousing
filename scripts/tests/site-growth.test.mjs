import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';
import { analyticsGuardFindings, guardAnalytics, isProductionLocation } from '../analytics-host-guard.mjs';
import { applyMilitaryMeta } from '../military-meta-lib.mjs';
const read = file => readFileSync(file, 'utf8');
const walk = dir => readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(dir+'/'+e.name):e.name.endsWith('.html')?[dir+'/'+e.name]:[]);
const productionPages=['index.html',...walk('public'),...walk('civilian-site')];
const fragment = file => JSON.parse(read(file).match(/<!--PAGE\s*([\s\S]*?)\s*PAGE-->/)[1]);
const scripts = html => [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].filter(m=>/data-costin-host-guard|data-costin-tracker/.test(m[1])).map(m=>m[2]);
function runTrackers(html,url){
 const requests=[],idle=[],load=[];
 const script =()=>({src:'',setAttribute(){},parentNode:{insertBefore(s){requests.push(s.src);}}});
 const context={location:new URL(url),document:{readyState:'loading',addEventListener(){},createElement:script,getElementsByTagName:()=>[script()],head:{appendChild(s){requests.push(s.src);}}},addEventListener(type,fn){if(type==='load')load.push(fn);},requestIdleCallback(fn){idle.push(fn);},setTimeout(fn){idle.push(fn);},console};
 context.window=context;
 vm.createContext(context);for(const code of scripts(html))vm.runInContext(code,context);
 return {context,requests,loaded(){load.forEach(f=>f());idle.forEach(f=>f());}};
}
test('Only exact HTTPS production hosts on default ports can track',()=>{
 for(const host of ['pensacolamilitaryhousing.com','www.pensacolamilitaryhousing.com','greggcostin.com','www.greggcostin.com'])assert.equal(isProductionLocation(new URL('https://'+host+'/')),true);
 for(const url of ['http://127.0.0.1:4183/','https://127.0.0.1/','http://localhost/','https://localhost/','http://[::1]:4184/','https://192.168.1.10/','https://greggcostin.pages.dev/','https://branch.greggcostin.pages.dev/','http://greggcostin.com/','https://greggcostin.com:444/','https://greggcostin.com.example.org/'])assert.equal(isProductionLocation(new URL(url)),false,url);
});
test('Every deployed HTML source has guarded, idempotent analytics',()=>{
 assert.ok(productionPages.length>=220);
 for(const file of productionPages){const html=read(file);assert.deepEqual(analyticsGuardFindings(html),[],file);assert.equal(guardAnalytics(html),html,file+' guard must be idempotent');}
});
test('Raw source HTML sends no analytics on local and preview origins',()=>{
 for(const file of productionPages)for(const url of ['http://127.0.0.1:4184/','http://localhost:5173/','https://preview.greggcostin.pages.dev/']){
  const r=runTrackers(read(file),url);r.loaded();r.context.gtag('event','generate_lead');
  assert.deepEqual(r.requests,[],file+' '+url);assert.equal(r.context.dataLayer,undefined);assert.equal(r.context.clarity,undefined);assert.equal(r.context.widgetTracker,undefined);
 }
});
test('Production GA and Clarity start, while the CRM loader waits for page load',()=>{
 for(const [file,host] of [['index.html','pensacolamilitaryhousing.com'],['civilian-site/index.html','greggcostin.com']]){
  const r=runTrackers(read(file),'https://'+host+'/');
  assert.ok(r.requests.some(u=>u.includes('googletagmanager.com')));assert.ok(r.requests.some(u=>u.includes('clarity.ms/tag/')));
  assert.equal(r.requests.some(u=>u.includes('widgetbe.com')),false);
  r.loaded();assert.equal(r.requests.filter(u=>u.includes('widgetbe.com')).length,1);
  r.context.gtag('event','generate_lead');assert.equal(r.context.dataLayer.filter(e=>e[1]==='generate_lead').length,1);
 }
});
test('All 82 school descriptions are complete and agree with social metadata',()=>{
 const files=walk('civilian-site/schools');assert.equal(files.length,82);
 const descriptions=new Set();
 for(const file of files){const h=read(file),d=h.match(/<meta name="description" content="([^"]+)"/)[1];
  assert.ok(d.length>=120&&d.length<=165,file+' length');assert.match(d,/\.$/,file+' complete sentence');assert.doesNotMatch(d,/undefined|how to eva\.$/i);assert.ok(!descriptions.has(d),file+' unique description');descriptions.add(d);
  assert.equal(h.match(/<meta property="og:description" content="([^"]+)"/)[1],d,file+' OG description');
 }
});
test('All 12 military posts use the article photo in BlogPosting.image',()=>{
 const files=readdirSync('content/blog').filter(f=>f.endsWith('.fragment.html'));assert.equal(files.length,12);
 for(const file of files){const spec=fragment('content/blog/'+file),html=read('public/blog/'+spec.slug+'.html');
  const nodes=[...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
  const post=nodes.find(n=>n['@type']==='BlogPosting');assert.ok(post,spec.slug);assert.equal(post.image,new URL(spec.figure.src,'https://pensacolamilitaryhousing.com').href,spec.slug);assert.ok(post.author,spec.slug+' author retained');
 }
});
test('All six built SPA shells expose a main landmark and civilian link before JavaScript',()=>{
 for(const path of ['index.html','about.html','contact.html','pcs-guide.html','mortgage-calculators.html','communities.html']){
  const h=read('dist/'+path),body=h.split('<body')[1];assert.equal([...body.matchAll(/<main\b/g)].length,1,path);assert.match(body,/<a\b[^>]*href="https:\/\/greggcostin\.com\/?"/,path);
 }
});
test('Meta cannot activate on a preview even with real enabled configuration and stored consent',()=>{
 for(const url of ['http://127.0.0.1/','https://greggcostin.pages.dev/']){
  const ctx={window:{costinProduction:false},location:new URL(url)};
  vm.runInNewContext(read('civilian-site/assets/costin-meta-config.js'),ctx);
  assert.equal(ctx.window.COSTIN_META.enabled,true);
  vm.runInNewContext(read('civilian-site/assets/costin-meta.js'),ctx);
  assert.equal(ctx.window.fbq,undefined);assert.equal(ctx.window.costinMeta,undefined);
 }
});

test('Every military source and built page has one shared Pixel loader and an ad-preferences control',()=>{
 for(const file of ['index.html',...walk('public'),...walk('dist')]){
  const html=read(file);
  for(const asset of ['costin-meta.js','costin-meta-config.js','costin-meta.css'])assert.equal(html.split('/assets/'+asset+'"').length-1,1,file+' '+asset);
  assert.equal((html.match(/<button\b[^>]*data-meta-settings/g)||[]).length,1,file+' preferences');
 }
 const ctx={window:{}};vm.runInNewContext(read('public/assets/costin-meta-config.js'),ctx);
 assert.equal(ctx.window.COSTIN_META.pixelId,'960230270427179');
 assert.equal(ctx.window.COSTIN_META.allowedPaths,undefined);
 for(const id of ['lm-form','book-form','val-form','inquiry-form','spa-inquiry-form','spa-contact-page'])assert.ok(ctx.window.COSTIN_META.acceptedLeadForms.includes(id),id);
});

test('Military rollout is idempotent with LF and CRLF sources',()=>{
 for(const file of ['index.html',...walk('public')]){
  for(const newline of ['\n','\r\n']){
   const html=read(file).replace(/\r?\n/g,newline);assert.equal(applyMilitaryMeta(html),html,file+' '+JSON.stringify(newline));
  }
 }
});
