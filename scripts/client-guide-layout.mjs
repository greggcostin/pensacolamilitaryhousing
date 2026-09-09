// Editorial print/HTML renderer. Presentation changes never rewrite source claims.
import {readFileSync,writeFileSync,mkdirSync,existsSync,copyFileSync} from 'node:fs';
import {resolve,join,basename} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';
import {homedir} from 'node:os';
import {guides as collection} from '../content/client-guides/collection.mjs';
import {visualStrings} from '../content/client-guides/journey-blocks.mjs';
import {renderVisualBlock,roadmap,stageBadge} from './client-guide-journey-visuals.mjs';
import {EDITION} from '../content/client-guides/schema.mjs';
import {telephoneHref,contactStrings} from '../content/client-guides/base-directories.mjs';
import {sources} from '../content/client-guides/sources.mjs';
import {DESIGN_VERSION,artFor,chapterPhoto} from '../content/client-guides/art-direction.mjs';
import {clientGuideMedia,validateGuideCovers} from './client-guide-media.mjs';
import {profilePage} from './client-guide-profile.mjs';
const out=resolve('artifacts/client-library');
for(const dir of ['html','pdf','assets','previews'])mkdirSync(join(out,dir),{recursive:true});
let guides=[...collection];
const allGuides=guides;const only=process.argv.indexOf('--only');if(only>=0)guides=guides.filter(g=>g.slug===process.argv[only+1]);
if(!guides.length)throw new Error('No guide matched the requested slug.');
const esc=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const {photos:images,logos}=clientGuideMedia();
validateGuideCovers(allGuides,images,artFor);
for(const im of [...Object.values(images),...Object.values(logos)])copyFileSync(im.path,join(out,'assets',im.asset));
mkdirSync(join(out,'qa'),{recursive:true});
writeFileSync(join(out,'qa/media-manifest.json'),JSON.stringify({design:DESIGN_VERSION,checkedAt:new Date().toISOString(),photos:images,logos},null,2)+'\n');
for(const name of ['inter-latin-variable.woff2','playfair-latin-variable.woff2'])copyFileSync('civilian-site/fonts/'+name,join(out,'assets',name));
const css=readFileSync('scripts/client-guide-design.css','utf8')+'\n'+readFileSync('scripts/client-guide-journeys.css','utf8');
function photo(key,cls='chapter-image'){const im=images[key];return `<figure class="${cls}" data-photo="${key}"><img src="../assets/${im.asset}" alt="${esc(im.caption)}"></figure>`;}
const brandMarks=(prefix='../assets/')=>`<img class="team-logo" data-brand="team" src="${prefix}${logos.team.asset}" alt="${logos.team.alt}"><img class="brokerage-logo" data-brand="brokerage" src="${prefix}${logos.brokerage.asset}" alt="${logos.brokerage.alt}">`;
function paragraphs(text){const sentences=text.match(/[^.!?]+(?:[.!?]+[”’"']?|$)/g)||[text];if(text.split(/\s+/).length<55||sentences.length<3)return `<p>${esc(text)}</p>`;const split=Math.ceil(sentences.length/2);return `<p>${esc(sentences.slice(0,split).join('').trim())}</p><p>${esc(sentences.slice(split).join('').trim())}</p>`;}
const numerical=s=>/^\$?[\d,]+(?:\.\d+)?%?$/.test(s.trim());
function block(b,{pairedLists=false,flow=false,id}){
 const attrs=`data-content-id="${id}"`;
 const visual=renderVisualBlock(b,id);if(visual)return visual;
 if(b.type==='contact')return `<section class="block contact-card" ${attrs} data-contact-id="${esc(b.contactId)}"><div class="contact-scope">${esc(b.scope)}</div><h3>${esc(b.title)}</h3><p class="contact-purpose">${esc(b.purpose)}</p><p class="contact-location">${esc(b.location)}</p><div class="contact-phones">${b.phones.map(p=>`<div><span>${esc(p.label)}</span><a href="${telephoneHref(p.number)}">${esc(p.number)}</a></div>`).join('')}</div>${b.email?`<a class="contact-email" href="mailto:${esc(b.email)}">${esc(b.email)}</a>`:''}${b.caveat?`<p class="contact-caveat">${esc(b.caveat)}</p>`:''}<div class="contact-sources">${b.sourceIds.map(id=>`<a href="${esc(sources[id].url)}" data-source="${id}">${esc(sources[id].name)}</a>`).join(' · ')}</div></section>`;
 if(b.type==='paragraph')return `<div class="block text-block" ${attrs}>${paragraphs(b.text)}</div>`;
 if(b.type==='note')return `<aside class="block note" ${attrs}><span class="label">Keep in mind</span><h3>${esc(b.title)}</h3><p>${esc(b.text)}</p></aside>`;
 if(b.type==='list')return `<section class="block list-block ${pairedLists?'paired-list':'full'}" ${attrs}><h3>${esc(b.title)}</h3><ul>${b.items.map(t=>`<li>${esc(t)}</li>`).join('')}</ul></section>`;
 if(b.type==='worksheet')return `<section class="block worksheet full" ${attrs}><div class="worksheet-label">YOUR WORKING NOTES · CONFIRM WITH THE RESPONSIBLE PROFESSIONAL</div><h3>${esc(b.title)}</h3><div class="fields">${b.fields.map(f=>`<div class="field">${esc(f)}</div>`).join('')}</div></section>`;
 if(b.type!=='table')throw new Error('Unknown content block '+b.type);
 if(b.rows.some(row=>row.length!==b.columns.length))throw new Error('Table header/row mismatch: '+b.title);
 const caption=b.caption?`<p class="caption">${esc(b.caption)}</p>`:'';
 if(flow&&b.columns.length===2&&b.rows.length<=9)return `<section class="block table-block full" ${attrs}><h3>${esc(b.title)}</h3><p class="cards-heading">${b.columns.map(esc).join(' / ')}</p><div class="step-cards">${b.rows.map((r,i)=>`<div class="step-card"><div class="step-number">${String(i+1).padStart(2,'0')}</div><strong>${esc(r[0])}</strong><p>${esc(r[1])}</p></div>`).join('')}</div>${caption}</section>`;
 if(b.columns.length===2&&b.rows.length<=6&&b.rows.every(r=>numerical(r[1]))){
 const values=b.rows.map(r=>Number(r[1].replace(/[$,%]/g,''))),max=Math.max(...values);
 return `<section class="block table-block full" ${attrs}><h3>${esc(b.title)}</h3><p class="cards-heading">${b.columns.map(esc).join(' / ')}</p><div class="bar-chart" role="group" aria-label="${esc(b.title)}">${b.rows.map((r,i)=>`<div class="bar-row"><strong>${esc(r[0])}</strong><div class="bar-track"><span class="bar-value" style="width:${max?values[i]/max*100:0}%"></span></div><b>${esc(r[1])}</b></div>`).join('')}</div><p class="chart-note">Bars start at zero. Values are the stated example inputs.</p>${caption}</section>`;
 }
 if(b.columns.length===2&&b.rows.length<=6&&!b.rows.some(r=>/\$|\d%/.test(r[1])))return `<section class="block table-block full" ${attrs}><h3>${esc(b.title)}</h3><p class="cards-heading">${b.columns.map(esc).join(' / ')}</p><div class="fact-cards">${b.rows.map(r=>`<div class="fact-card"><strong>${esc(r[0])}</strong><p>${esc(r[1])}</p></div>`).join('')}</div>${caption}</section>`;
 return `<section class="block table-block full" ${attrs}><h3>${esc(b.title)}</h3><div class="table-wrap"><table class="cols-${b.columns.length} ${b.rows.length>=10?'dense-table':''}"><thead><tr>${b.columns.map(c=>`<th scope="col">${esc(c)}</th>`).join('')}</tr></thead><tbody>${b.rows.map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>${caption}</section>`;
}
const footer=brand=>`<footer class="foot"><span>THE COSTIN TEAM · ${brand}</span><span class="folio"></span></footer>`;
const running=(left,right)=>`<div class="running"><strong>${esc(left)}</strong><span>${esc(right)}</span></div>`;
const references=ids=>ids.map(id=>{if(!sources[id])throw new Error('Missing source '+id);return `<a href="${esc(sources[id].url)}">${esc(sources[id].name)}</a>`;}).join(' · ');
function render(g,index){
 const art=artFor(g),brand=g.audience==='military'?'PensacolaMilitaryHousing.com':'GreggCostin.com',palette=`palette-${art.palette}`;
 const allIds=[...new Set(g.pages.flatMap(p=>p.sources||[]))];
 // Directory sources are directly beside each office; do not duplicate them in the bibliography.
 const bibliographyIds=[...new Set(g.pages.filter(p=>p.kind!=='directory').flatMap(p=>p.sources||[]))],sourceGroups=Array.from({length:Math.max(1,Math.ceil(bibliographyIds.length/6))},(_,i)=>bibliographyIds.slice(i*6,(i+1)*6));
 const seen=new Set([art.cover,'portrait','alys']);
 const coverSources=new Set(Object.values(images).filter(im=>im.coverOnly).map(im=>im.sourceIdentity));
 const pool=g.audience==='military'?['nas','whiting','eglin','osprey','bridge','panama','oaks','waves','keys','shutters','house']:['oaks','bridge','waves','keys','shutters','house','panama'];
 const takePhoto=preferred=>{const key=[preferred,...pool].find(k=>k&&!seen.has(k)&&images[k]&&!images[k].coverOnly&&!coverSources.has(images[k].sourceIdentity));if(key)seen.add(key);return key||null;};
 let originalChapter=-1;
 const chapterKeys=g.pages.map(p=>{if(p.kind==='directory'||p.kind==='journey')return null;const preferred=chapterPhoto(g,p,++originalChapter);return preferred?takePhoto(preferred):null;});
 const sourceKeys=sourceGroups.map(group=>group.length<=4?takePhoto('house'):null);
 const usedPhotos=[...seen];
 const cover=`<section class="sheet cover ${palette}" id="cover"><div class="cover-mast brand-lockup">${brandMarks()}</div><div class="cover-scene clean-cover" data-theme="${images[art.cover].theme}" data-photo="${art.cover}"><img style="object-position:${images[art.cover].position}" src="../assets/${images[art.cover].asset}" alt="${esc(images[art.cover].caption)}"><div class="cover-shade"></div><div class="cover-title"><div class="eyebrow">${esc(g.category)} · ${g.slug.startsWith('pcs-')?'YOUR RELOCATION REFERENCE':'FLORIDA PANHANDLE + COASTAL ALABAMA'}</div><h1 class="${art.title.length>48?'long':''}">${esc(art.title).replaceAll('\n','<br>')}</h1></div></div><div class="cover-bottom"><p class="cover-deck">${esc(art.deck)}</p><p class="cover-edition">THE CLIENT COLLECTION · SEPTEMBER 2026</p><div class="cover-author"><div><strong>Gregg Costin</strong><p>Practical guidance for your next real estate decision.<br>(850) 266-5005 · ${brand}</p></div><span class="issue">${String(index+1).padStart(2,'0')}</span></div></div>${footer(brand)}</section>`;
 const overview=roadmap(g,{palette,running,footer:footer(brand)});
 const contents=`<section class="sheet journey-toc ${palette}" id="contents">${running(g.shortTitle,'YOUR CHAPTER DIRECTORY')}<div class="contents-title"><div class="eyebrow">FOLLOW THE STEPS. KEEP THE REFERENCE.</div><h2 style="margin-top:12px">The details behind<br>each decision.</h2><p class="answer">${esc(g.answer)}</p></div><nav class="toc" aria-label="Guide contents"><h3>Inside this guide</h3><a href="#roadmap"><span>The complete transaction roadmap</span><span></span></a>${g.pages.map((p,i)=>`<a href="#chapter-${i+1}"><span>${esc(p.title)}</span><span></span></a>`).join('')}<a href="#sources"><span>Sources and scope</span><span></span></a><a href="#your-next-step"><span>Your next step</span><span></span></a></nav><div class="takeaways">${art.takeaways.map(t=>`<div class="takeaway"><h3>${esc(t[0])}</h3><p>${esc(t[1])}</p></div>`).join('')}</div><div class="reading-note"><strong>Use this with your team</strong><p>Examples are hypothetical. Your signed contract, lender, insurer, closing professional and applicable orders govern the actual work. Keep sensitive records in verified secure channels. Page-level references link the authorities; source dates are listed individually at the back.</p></div>${footer(brand)}</section>`;
 let originalLayoutChapter=-1;
 const chapters=g.pages.map((p,i)=>{
  const layoutIndex=p.kind==='directory'?null:++originalLayoutChapter;
  const key=chapterKeys[i],isWorksheet=!key&&p.blocks.some(b=>b.type==='worksheet'),flow=/complete transaction|mortgage path|workable PCS calendar|timeline around/.test(p.title);
  const pairedLists=p.blocks.filter(b=>b.type==='list').length===2;
  const head=`<header class="chapter-head"><span class="chapter-no">${String(i+1).padStart(2,'0')}</span><div><h2>${esc(p.title)}</h2><p class="deck">${esc(p.deck)}</p></div></header>`;
  const intro=key&&layoutIndex%3===2?`<div class="intro-spread">${head}${photo(key)}</div>`:head+(key?photo(key):'');
  const pageRefs=p.kind==='directory'?`<strong>Contact desk · ${esc(p.reviewed)}</strong> ${esc(p.directoryNote)} <strong>Emergency: <a href="tel:911">911</a>.</strong>`:`<strong>Reference desk:</strong> ${references(p.sources||[])||'The Costin Team planning framework; numerical examples are hypothetical.'}`;
  return `<section class="sheet chapter ${palette}${p.kind==='journey'?' journey-chapter':''}${isWorksheet?' worksheet-page':''}${!key?' number-page':''}${p.kind==='directory'?' directory-page':''}" id="chapter-${i+1}" data-chapter="${i+1}">${running(g.shortTitle,p.kind==='directory'?'THE NEWCOMER CONTACT DESK':'YOUR '+(g.audience==='military'?'MILITARY':'REAL ESTATE')+' REFERENCE')}${stageBadge(g,p)}${intro}<div class="body">${p.blocks.map((b,j)=>block(b,{pairedLists,flow,id:`${i+1}-${j+1}`})).join('')}</div><div class="refs">${pageRefs}</div>${footer(brand)}</section>`;
 }).join('');
 const bibliography=sourceGroups.map((group,i)=>`<section class="sheet source-page ${palette}" id="sources${i||''}">${running(g.shortTitle,'SOURCE DESK')}<div class="source-heading"><div class="eyebrow">FOLLOW THE EVIDENCE</div><h2 style="margin-top:10px">The original guidance.</h2><p>Consult the source before relying on a changing amount, deadline, policy or contact. Individual source review dates appear below.</p></div><div class="source-list">${group.map((id,j)=>`<div class="source-item"><span class="source-index">${String(i*6+j+1).padStart(2,'0')}</span><strong>${esc(sources[id].name)}</strong><a href="${esc(sources[id].url)}">${esc(sources[id].url)}</a><p class="source-date">Reviewed ${esc(sources[id].reviewed)}</p></div>`).join('')}</div><div class="source-scope"><h3>Apply the rule to your situation</h3><p>This is an educational resource. Your lender, closing professional, insurer, property appraiser and installation offices confirm matters within their roles. No government agency, military installation or lender sponsors or endorses this publication. Source review dates change only after actual verification.</p>${g.audience==='military'?'<p>The appearance of U.S. Department of War (DoW) visual information does not imply or constitute DoW endorsement.</p>':''}</div>${sourceKeys[i]?photo(sourceKeys[i]):''}${footer(brand)}</section>`).join('');
 const contactPage=profilePage({portrait:images.portrait,brandMarks,footer:footer(brand),palette});
 return {html:`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(g.title)} | The Costin Team</title><meta name="description" content="${esc(g.answer)}"><meta name="author" content="Gregg Costin, The Costin Team"><style>${css}</style></head><body><div class="screen-tools"><a href="../index.html">All client guides</a><a href="../pdf/${g.slug}.pdf">Download PDF</a></div><main>${cover+overview+contents+chapters+bibliography+contactPage}</main></body></html>`,allIds,usedPhotos};
}
const req=createRequire(import.meta.url);let pw;try{pw=req('playwright')}catch{pw=req(join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'))}
const browser=await pw.chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
const reports=[];
try{for(const g of guides){
 const spec=render(g,allGuides.indexOf(g)),hp=join(out,'html',g.slug+'.html');writeFileSync(hp,spec.html);
 const pg=await browser.newPage({viewport:{width:1100,height:1200}});await pg.goto(pathToFileURL(hp).href);await pg.evaluate(()=>document.fonts.ready);await pg.emulateMedia({media:'print'});
 await pg.evaluate(()=>{
  const over=el=>{const foot=el.querySelector('.foot').getBoundingClientRect();const children=[...el.children].filter(e=>!e.classList.contains('foot'));return Math.max(...children.map(c=>c.getBoundingClientRect().bottom))>foot.top-14;};
  const pending=[...document.querySelectorAll('.chapter')];
  for(let si=0;si<pending.length;si++){const sheet=pending[si];
   if(!over(sheet))continue;sheet.classList.add('compact');if(!over(sheet))continue;
   sheet.classList.add('tight');if(!over(sheet))continue;
   // Dense reference chapters prioritize the table or worksheet. Photographs
   // remain on the cover and the less dense chapters; never shrink body type.
   if(sheet.querySelector('.chapter-image')){sheet.querySelector('.chapter-image').remove();sheet.classList.add('no-photo');if(!over(sheet))continue;}
   const body=sheet.querySelector('.body');const next=sheet.cloneNode(true);next.removeAttribute('id');next.classList.add('continuation');next.classList.remove('worksheet-page');next.querySelector('.chapter-image')?.remove();next.querySelector('.intro-spread')?.classList.add('continuation-intro');next.querySelector('.deck')?.remove();next.querySelector('h2').insertAdjacentHTML('beforeend','<span class="continued">Continued</span>');const nb=next.querySelector('.body');nb.innerHTML='';
   while(over(sheet)&&body.children.length>1)nb.prepend(body.lastElementChild);
   while(nb.children.length&&nb.textContent.split(/\s+/).length<85&&body.children.length>1)nb.prepend(body.lastElementChild);
   if(nb.children.length){sheet.after(next);pending.splice(si+1,0,next);}
  }
  const sheets=[...document.querySelectorAll('.sheet')];for(const [i,s] of sheets.entries())s.querySelector('.folio').textContent=String(i+1).padStart(2,'0')+' / '+sheets.length;
  for(const a of document.querySelectorAll('.toc a')){const t=document.querySelector(a.getAttribute('href'));a.lastElementChild.textContent=sheets.indexOf(t)+1;}
 });
 const qa=await pg.evaluate(()=>{
  const overflow=[...document.querySelectorAll('.sheet')].map((el,i)=>{const foot=el.querySelector('.foot').getBoundingClientRect(),children=[...el.children].filter(e=>!e.classList.contains('foot'));return {page:i+1,bottom:Math.round(Math.max(...children.map(c=>c.getBoundingClientRect().bottom))),footerTop:Math.round(foot.top),overflow:Math.max(...children.map(c=>c.getBoundingClientRect().bottom))>foot.top-10};}).filter(x=>x.overflow);
  return {overflow,pages:document.querySelectorAll('.sheet').length,contentIds:[...document.querySelectorAll('[data-content-id]')].map(e=>e.dataset.contentId),photographs:document.querySelectorAll('[data-photo]').length,photoKeys:[...document.querySelectorAll('[data-photo]')].map(e=>e.dataset.photo),brokenImages:[...document.images].filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.src),words:document.body.innerText.split(/\s+/).filter(Boolean).length};
 });
 if(new Set(qa.photoKeys).size!==qa.photoKeys.length)throw new Error('Repeated photograph within '+g.slug);
 const expected=g.pages.reduce((n,p)=>n+p.blocks.length,0);if(qa.contentIds.length!==expected||new Set(qa.contentIds).size!==expected)throw new Error('Content block loss/duplication in '+g.slug);
 // Count alone cannot catch a dropped table column. Check every source string.
 const normalized=s=>String(s).replace(/\s+/g,' ').trim();
 const renderedBlocks=await pg.locator('[data-content-id]').evaluateAll(es=>Object.fromEntries(es.map(e=>[e.dataset.contentId,e.innerText.replace(/\s+/g,' ').trim()])));
 g.pages.forEach((p,i)=>p.blocks.forEach((b,j)=>{for(const value of (b.type==='contact'?contactStrings(b):[...visualStrings(b),b.title,b.text,b.caption,...(b.items||[]),...(b.fields||[]),...(b.columns||[]),...(b.rows||[]).flat()]).filter(v=>v!==undefined&&v!==''))if(!renderedBlocks[`${i+1}-${j+1}`]?.includes(normalized(value)))throw new Error(`Source text lost in ${g.slug}, block ${i+1}-${j+1}`);}));
 if(qa.overflow.length||qa.brokenImages.length){await pg.screenshot({path:join(out,'previews',g.slug+'-overflow.png'),fullPage:true});reports.push({slug:g.slug,...qa});console.error('LAYOUT FAILED',g.slug,JSON.stringify(qa.overflow));await pg.close();continue;}
 writeFileSync(hp,'<!doctype html>'+await pg.evaluate(()=>document.documentElement.outerHTML));
 await pg.pdf({path:join(out,'pdf',g.slug+'.pdf'),format:'Letter',printBackground:true,preferCSSPageSize:true,tagged:true,outline:true});
 for(const [i,label] of [[0,'cover'],[2,'inside'],[3,'detail']])await pg.locator('.sheet').nth(i).screenshot({path:join(out,'previews',`${g.slug}-${label}.png`)});
 reports.push({slug:g.slug,title:g.title,audience:g.audience,pages:qa.pages,words:qa.words,sources:spec.allIds.length,photographs:qa.photographs,uniquePhotos:new Set(qa.photoKeys).size,cover:artFor(g).cover,contentBlocks:expected,design:DESIGN_VERSION,pdf:`pdf/${g.slug}.pdf`,html:`html/${g.slug}.html`,overflow:[]});console.log(`${g.slug}: ${qa.pages} pages, ${qa.photographs} photo placements, ${expected} content blocks preserved`);await pg.close();
}}finally{await browser.close();}
// Partial previews must not erase the full catalog or claim a finished collection.
const reportPath=join(out,only>=0?'preview-build-report.json':'build-report.json');const assetFiles=[...Object.values(images),...Object.values(logos)].map(im=>'assets/'+im.asset).concat(['assets/inter-latin-variable.woff2','assets/playfair-latin-variable.woff2']);writeFileSync(reportPath,JSON.stringify({edition:EDITION,design:DESIGN_VERSION,assets:assetFiles,guides:reports},null,2)+'\n');
if(only<0){
 const libraryCss=css.replaceAll('../assets/','assets/')+`body{background:#f6f5ee}.library-mast{padding:27px 5vw;background:#122f39;color:white;display:flex;justify-content:space-between;align-items:center}.library-mast a{color:white}.library-cover{height:440px;max-width:1240px;margin:0 auto;overflow:hidden}.library-cover img{width:100%;height:100%;object-fit:cover;object-position:center 48%}.library{max-width:1240px;margin:auto;padding:55px 35px}.library h1{font-size:58px;max-width:830px}.library>.deck{font-size:18px;color:var(--muted);max-width:650px;margin:19px 0 30px}.library-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(285px,1fr));gap:30px}.book-card{background:white;border:1px solid #dce3dd;display:flex;flex-direction:column}.book-card>img{width:100%;height:205px;object-fit:cover}.book-copy{padding:23px;display:flex;flex-direction:column;flex:1}.book-card h2{font-size:28px;line-height:1.15;margin:10px 0 14px}.book-card p{font-size:13px;line-height:1.5}.book-meta{color:var(--muted);font-size:11px!important;margin:17px 0}.book-links{margin-top:auto;display:flex;gap:19px;padding-top:17px;border-top:1px solid var(--line);font-weight:600;font-size:13px}.library-footer{margin:35px 0 0;padding-top:25px;border-top:1px solid var(--line)}@media(max-width:600px){.library{padding:35px 22px}.library h1{font-size:39px}.library-mast{font-size:12px}.library-grid{grid-template-columns:1fr}}`;
 writeFileSync(join(out,'index.html'),`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>The Costin Team | Illustrated Client Guides</title><style>${libraryCss}</style></head><body><header class="library-mast brand-lockup">${brandMarks('assets/')}</header><div class="library-cover"><img src="assets/${images.house.asset}" alt="${esc(images.house.caption)}"></div><main class="library"><p class="eyebrow">THE CLIENT COLLECTION · SEPTEMBER 2026</p><h1 style="margin-top:14px">Good decisions<br>start with useful information.</h1><p class="deck">Illustrated guides to buying, selling, financing and moving along the Gulf Coast. Read a chapter, compare the numbers, or bring a worksheet to your next conversation.</p><div class="library-grid">${reports.filter(r=>r.pdf).map(r=>{const g=allGuides.find(g=>g.slug===r.slug),art=artFor(g);return `<article class="book-card"><img src="assets/${images[art.cover].asset}" alt="${esc(images[art.cover].caption)}"><div class="book-copy"><p class="eyebrow">${esc(g.category)}</p><h2>${esc(art.title).replaceAll('\n',' ')}</h2><p>${esc(art.deck)}</p><p class="book-meta">${r.pages} pages · ${r.sources} primary references · Printable worksheets</p><div class="book-links"><a href="${r.html}">Read the guide</a><a href="${r.pdf}">Download PDF</a></div></div></article>`;}).join('')}</div><p class="library-footer">Gregg Costin · (850) 266-5005 · <a href="https://greggcostin.com/contact">Plan your next step</a><br><small>Primary references are linked in each guide. Illustrative photographs are not current property listings.</small></p></main></body></html>`);
}
if(reports.some(r=>r.overflow.length||r.brokenImages?.length))process.exitCode=1;
