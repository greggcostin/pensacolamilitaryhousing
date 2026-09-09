// Read-only release gate: preserve the published school system, page ownership,
// forms and analytics while checking the explicitly reviewed design overlay.
import {readFileSync,writeFileSync,existsSync,readdirSync,statSync} from 'node:fs';
import {resolve,join,relative,extname,sep} from 'node:path';
import {createHash} from 'node:crypto';
import {resourceGroups} from './civilian-resource-library.mjs';
const evidence=resolve('docs/worldclass-roadmap-2026-09-08');
const manifest=JSON.parse(readFileSync(join(evidence,'candidate-manifest.json'),'utf8'));
const roots={gc:join(manifest.candidate,'gc'),pmh:join(manifest.candidate,'pmh')};
const origins={gc:'https://greggcostin.com',pmh:'https://pensacolamilitaryhousing.com'};
const walk=d=>readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(d,e.name)):e.isFile()?[join(d,e.name)]:[]);
const sha=f=>createHash('sha256').update(readFileSync(f)).digest('hex');
const read=f=>readFileSync(f,'utf8');
const findings=[];const fail=(issue,file,detail)=>findings.push({issue,file,detail});
const counts={baselineFiles:0,schoolPagesPreserved:0,schoolAssetsPreserved:0,otherPageBodiesPreserved:0,changedHtmlPages:0,jsonLdBlocks:0,localReferences:0,formBlocksPreserved:0,inlineBehaviorBlocksPreserved:0};
const body=h=>h.match(/<body\b[^>]*>[\s\S]*?<\/body>/)?.[0];
const scripts=h=>[...h.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].filter(m=>!m[1].includes('application/ld+json')).map(m=>m[0]);
const forms=h=>[...h.matchAll(/<form\b[^>]*>[\s\S]*?<\/form>/gi)].map(m=>m[0]);
const canon=h=>h.match(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1];
const withoutFonts=h=>h.replace(/<link\b[^>]*href="https:\/\/fonts\.(?:googleapis|gstatic)\.com[^>]*>\s*/g,'').replace(/@import\s+url\(['"]?https:\/\/fonts\.googleapis\.com[^;]+;\s*/g,'').replace(/<link\b[^>]*href="\/(?:fonts\/[^"/]+\.woff2|assets\/costin-fonts\.css)"[^>]*>\s*/g,'').replace(/\s+/g,' ').trim();
for(const site of ['gc','pmh']){
 const intended=new Map(manifest.changes.filter(c=>c.site===site).map(c=>[c.path,c]));
 for(const source of walk(manifest.sources[site])){
  counts.baselineFiles++;const path=relative(manifest.sources[site],source).replaceAll('\\','/');const target=join(roots[site],path);
  if(!existsSync(target)){fail('Published file removed',path,site);continue;}
  const different=sha(source)!==sha(target);
  if(different&&(site==='pmh'||!intended.has(path)))fail('Unexpected published-file change',path,site);
  if(path.startsWith('schools/')&&path.endsWith('.html')){
   counts.schoolPagesPreserved++;
   if(withoutFonts(read(source))!==withoutFonts(read(target)))fail('School page changed beyond font loading',path,site);
  }
  if(/(?:school|education)/i.test(path)&&/\.(?:json|js|css)$/.test(path)){
   counts.schoolAssetsPreserved++;if(different)fail('School data or behavior changed',path,site);
  }
  if(site==='gc'&&path.endsWith('.html')&&!['index.html','resources.html'].includes(path)){
   counts.otherPageBodiesPreserved++;
   if(body(read(source))!==body(read(target)))fail('Unrelated page body changed',path);
   if(withoutFonts(read(source))!==withoutFonts(read(target)))fail('Unrelated page changed beyond font loading',path);
  }
 }
 for(const f of walk(roots[site])){
  const path=relative(roots[site],f).replaceAll('\\','/'),source=join(manifest.sources[site],path),change=intended.get(path);
  if(change&&sha(f)!==change.sha256)fail('Candidate differs from recorded hash',path,site);
  if(!existsSync(source)&&!change)fail('Unrecorded new file',path,site);
 }
}
for(const path of ['index.html','resources.html']){
 const source=read(join(manifest.sources.gc,path)),target=read(join(roots.gc,path));
 if(canon(source)!==canon(target))fail('Canonical ownership changed',path);
 if(JSON.stringify(forms(source))!==JSON.stringify(forms(target)))fail('Inquiry form changed',path);
 else counts.formBlocksPreserved+=forms(source).length;
 if(JSON.stringify(scripts(source))!==JSON.stringify(scripts(target)))fail('Tracking or inline behavior changed',path);
 else counts.inlineBehaviorBlocksPreserved+=scripts(source).length;
}
const find=(root,path)=>{const p=decodeURIComponent(path).replace(/^\//,'')||'index.html';return[p,extname(p)?p:p+'.html',join(p,'index.html')].map(x=>resolve(root,x)).find(f=>f.startsWith(root+sep)&&existsSync(f)&&statSync(f).isFile());};
for(const change of manifest.changes.filter(c=>c.path.endsWith('.html'))){
 counts.changedHtmlPages++;const h=read(join(roots[change.site],change.path));const url=origins[change.site]+(change.path==='index.html'?'/':'/'+change.path.replace(/\.html$/,''));
 if((h.match(/<h1\b/g)||[]).length!==1)fail('Expected one visible H1',change.path);
 if(/<meta\b(?=[^>]*name=["']robots["'])(?=[^>]*content=["'][^"']*noindex)[^>]*>/i.test(h))fail('Public page is noindex',change.path);
 for(const m of h.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)){
  counts.jsonLdBlocks++;try{JSON.parse(m[1]);}catch(e){fail('Invalid JSON-LD',change.path,e.message);}
 }
 const refs=[...[...h.matchAll(/\b(?:href|src|poster)=["']([^"']+)["']/g)].map(m=>m[1]),...[...h.matchAll(/\b(?:srcset|imagesrcset)="([^"]+)"/g)].flatMap(m=>m[1].split(',').map(v=>v.trim().split(/\s/)[0]))];
 for(const ref of refs){let target;try{target=new URL(ref.replaceAll('&amp;','&'),url);}catch{continue;}const site=Object.keys(origins).find(k=>origins[k]===target.origin);if(!site||target.pathname.startsWith('/cdn-cgi/'))continue;
  counts.localReferences++;const hit=find(roots[site],target.pathname);
  if(!hit){fail('Missing internal link or asset',change.path,target.href);continue;}
  // Check edited navigation fragments only. Other pages keep their existing
  // script-generated anchors and unchanged content from the verified baseline.
  if(['index.html','resources.html','photo-credits.html'].includes(change.path)&&target.hash&&hit.endsWith('.html')&&!target.hash.startsWith('#:~:text=')){
   const fragment=decodeURIComponent(target.hash.slice(1)),html=read(hit);
   if(fragment&&!html.includes('id="'+fragment+'"')&&!html.includes("id='"+fragment+"'")&&!html.includes('name="'+fragment+'"'))fail('Edited link has no static target anchor',change.path,target.href);
  }
 }
}
const home=read(join(roots.gc,'index.html')),resources=read(join(roots.gc,'resources.html'));
if((home.match(/class="gc-region-card(?:\s|"|$)/g)||[]).length!==6)fail('Expected six featured coastal regions','index.html');
if((home.match(/class="area-card"/g)||[]).length!==16||/<details[^>]*class="gc-all-areas/.test(home))fail('Expected sixteen openly visible area guide cards','index.html');
if(home.includes('gc-hero-coordinates')||home.includes('<p class="gc-hero-credit">'))fail('Hero overlay or credit bar returned','index.html');
for(const portrait of ['gregg-courthouse','gregg-navy-no-tie'])if(!home.includes('/images/'+portrait+'.jpg'))fail('Expected authentic portrait missing','index.html',portrait);
const data=JSON.parse(read(join(roots.gc,'assets/school-finder-data.json')));
const records=data.schools.length,mapped=data.schools.filter(s=>Number.isFinite(s.lat)&&Number.isFinite(s.lng)).length;
if(!resources.includes(`${records} school records · ${mapped} mapped`))fail('Resource school counts do not match retained data','resources.html');
const schemas=[...resources.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
const collection=schemas.find(s=>s['@type']==='CollectionPage');
const expected=[...new Set(resourceGroups.flatMap(g=>g.links).map(l=>new URL(l[1],origins.gc).href))];
if(JSON.stringify(collection?.mainEntity?.itemListElement?.map(i=>i.item.url))!==JSON.stringify(expected))fail('Resource ItemList does not match visible directory','resources.html');
for(const group of resourceGroups)if(!resources.includes('id="'+group.id+'"'))fail('Decision section missing','resources.html',group.id);
const result={checkedAt:new Date().toISOString(),candidate:manifest.candidate,...counts,schoolRecords:records,mappedSchools:mapped,directoryLinks:expected.length,findings,ok:findings.length===0,limits:'Static preservation and release integrity checks. Browser behavior, production publication, indexing and actual inquiry delivery are separately verified.'};
writeFileSync(join(evidence,'candidate-verification.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));if(!result.ok)process.exitCode=1;
