// Verify the delivered directory against its source data and the pre-edit collection.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';
import {homedir} from 'node:os';
import {baseDirectories,directorySources,contactStrings,telephoneHref,DIRECTORY_REVIEWED} from '../content/client-guides/base-directories.mjs';
const req=createRequire(import.meta.url);
const {chromium}=req(join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const root=resolve('artifacts/client-library');
const baseline=JSON.parse(readFileSync(join(root,'qa/base-directory-baseline.json'),'utf8'));
const catalog=JSON.parse(readFileSync(join(root,'build-report.json'),'utf8'));
const {guides:sourceGuides}=await import('../content/client-guides/collection.mjs');
const norm=s=>String(s).replace(/\s+/g,' ').trim();
const withoutFolio=s=>norm(s).replace(/\s+\d+\s*\/\s*\d+$/,'');
assert.equal(Object.keys(baseDirectories).length,9);
assert.throws(()=>telephoneHref('850-452-27'),/Unsupported/);
assert.equal(telephoneHref('850-452-9460 ext. 3005'),'tel:+18504529460;ext=3005');
assert.equal(telephoneHref('850-884-4110 option 1'),'tel:+18508844110');
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
const checks=[],preservation=[];
try{for(const g of catalog.guides){
 const pg=await browser.newPage({viewport:{width:1100,height:1200}});
 await pg.goto(pathToFileURL(join(root,g.html)).href);await pg.evaluate(()=>document.fonts.ready);
 const original=baseline.find(b=>b.slug===g.slug);if(!original){assert.equal(g.slug,'investment-property-roadmap');await pg.close();continue;}
 const now=await pg.evaluate(()=>({profile:document.querySelector('.agent-feature').innerText.replace(/\s+/g,' ').trim(),blocks:[...document.querySelectorAll('[data-content-id]')].map(e=>e.innerText.replace(/\s+/g,' ').trim()),photoKeys:[...document.querySelectorAll('[data-photo]')].map(e=>e.dataset.photo)}));
 assert.equal(withoutFolio(now.profile),withoutFolio(original.profile),g.slug+' changed approved closing page');
 assert.equal(now.photoKeys[0],original.photoKeys[0],g.slug+' changed approved cover');
 assert.equal(now.photoKeys.at(-1),original.photoKeys.at(-1),g.slug+' changed approved final portrait');
 const remaining=[...now.blocks];for(const old of original.blocks){const i=remaining.indexOf(old);assert.ok(i>=0,g.slug+' changed original content block');remaining.splice(i,1);}
 preservation.push({slug:g.slug,originalBlocksPreserved:original.blocks.length,approvedClosingTextPreserved:true,approvedCoverAndPortraitPreserved:true,interiorPhotosReselectedForChronology:true});
 const expected=sourceGuides.find(s=>s.slug===g.slug).pages.reduce((n,p)=>n+p.blocks.length,0);
 assert.equal(now.blocks.length,expected,g.slug+' content coverage mismatch');
 if(!g.slug.startsWith('pcs-')){await pg.close();continue;}
 const pages=baseDirectories[g.slug.slice(4)],cards=pages.flatMap(p=>p.blocks);
 assert.ok(remaining.length>=cards.length,g.slug+' contact additions missing');
 assert.equal(await pg.locator('[data-contact-id]').count(),cards.length);
 const expectedUris=new Set(),numbers=[],emails=[],sourceUrls=new Set();
 for(const b of cards){
  const loc=pg.locator(`[data-contact-id="${b.contactId}"]`);assert.equal(await loc.count(),1);
  const text=norm(await loc.innerText());for(const s of contactStrings(b))assert.ok(text.includes(norm(s)),g.slug+' missing '+s);
  assert.equal(b.reviewed,DIRECTORY_REVIEWED);
  for(const p of b.phones){const href=telephoneHref(p.number);assert.equal(await loc.locator(`a[href="${href}"]`).count(),1);expectedUris.add(href);numbers.push(p.number);}
  if(b.email){assert.equal(await loc.locator(`a[href="mailto:${b.email}"]`).count(),1);expectedUris.add('mailto:'+b.email);emails.push(b.email);}
  for(const id of b.sourceIds){const s=directorySources[id];assert.ok(s&&/^https:\/\//.test(s.url));assert.equal(await loc.locator(`a[data-source="${id}"]`).getAttribute('href'),s.url);sourceUrls.add(s.url);expectedUris.add(s.url);}
 }
 await pg.emulateMedia({media:'print'});
 const directorySheets=pg.locator('.directory-page');
 const printChecks=await directorySheets.evaluateAll(es=>es.map(e=>{const foot=e.querySelector('.foot').getBoundingClientRect();const cards=[...e.querySelectorAll('.contact-card')];return {title:e.querySelector('h2').innerText,contacts:cards.length,footerClear:Math.max(...[...e.children].filter(n=>!n.classList.contains('foot')).map(n=>n.getBoundingClientRect().bottom))<foot.top-10,cardsContained:cards.every(c=>{const box=c.getBoundingClientRect();return [...c.querySelectorAll('*')].every(n=>{const r=n.getBoundingClientRect();return r.right<=box.right+1&&r.bottom<=box.bottom+1;});})};}));
 assert.ok(printChecks.every(p=>p.footerClear&&p.cardsContained),g.slug+' directory overflow');
 for(let i=0;i<await directorySheets.count();i++)await directorySheets.nth(i).screenshot({path:join(root,'qa',`${g.slug}-directory-${i+1}.png`)});
 await pg.emulateMedia({media:'screen'});await pg.setViewportSize({width:375,height:812});
 const mobile=await pg.evaluate(()=>({width:document.documentElement.scrollWidth,viewport:innerWidth,cardOverflows:[...document.querySelectorAll('.contact-card')].filter(e=>e.scrollWidth>e.clientWidth+1).length}));
 assert.ok(mobile.width<=376&&mobile.cardOverflows===0,g.slug+' mobile directory overflow');
 // The longest published inbox exercises wrapping and touch targets.
 const longest=cards.filter(b=>b.email).sort((a,b)=>b.email.length-a.email.length)[0];
 if(longest)await pg.locator(`[data-contact-id="${longest.contactId}"]`).screenshot({path:join(root,'qa',`${g.slug}-directory-mobile.png`)});
 checks.push({slug:g.slug,directoryPages:printChecks.length,contacts:cards.length,publishedPhones:numbers,publishedEmails:emails,sourceUrls:[...sourceUrls],expectedPdfUris:[...expectedUris],printChecks,mobile});
 await pg.close();
}}finally{await browser.close();}
const result={checkedAt:new Date().toISOString(),reviewed:DIRECTORY_REVIEWED,guides:checks.length,directoryPages:checks.reduce((n,g)=>n+g.directoryPages,0),contactPlacements:checks.reduce((n,g)=>n+g.contacts,0),preservation,checks,findings:[]};
writeFileSync(join(root,'qa/directory-checks.json'),JSON.stringify(result,null,2)+'\n');
console.log(`${result.guides} base guides: ${result.contactPlacements} contact cards on ${result.directoryPages} directory pages. Original content, closing pages, links and 375px layout verified.`);
