// Create a review-only candidate from the complete published release. Never deploys.
// Refuses an existing output directory; preserves every baseline file.
import {cpSync,existsSync,mkdirSync,readFileSync,writeFileSync,readdirSync,statSync} from 'node:fs';
import {resolve,join,relative,sep,isAbsolute,extname} from 'node:path';
import {createHash} from 'node:crypto';
import {refreshEntityHtml} from './entity-sync-lib.mjs';
import {linkBusinessRecord} from './identity-page-lib.mjs';
import {professionalProfileHtml} from '../src/professionalProfile.js';
import {writeText} from './write-text-retry.mjs';
const outFlag=process.argv.indexOf('--out');
const output=resolve(outFlag<0?'.coast-release/2026-09-06-review':process.argv[outFlag+1]);
const allowedRoot=resolve('.coast-release');
if(!output.startsWith(allowedRoot+sep))throw new Error('Candidate output must be a new child of .coast-release.');
if(existsSync(output))throw new Error('Candidate exists. Review it; choose a new explicit output before another assembly.');
const hash=f=>createHash('sha256').update(readFileSync(f)).digest('hex');
const walk=d=>readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(d,e.name)):e.isFile()?[join(d,e.name)]:[]);
const baselineFlag=process.argv.indexOf('--baseline');
if(baselineFlag<0)throw Error('Provide an explicitly pinned --baseline directory.');
const baselineRoot=resolve(process.argv[baselineFlag+1]);
const baselineProof=JSON.parse(readFileSync(join(baselineRoot,'baseline.json'),'utf8'));
if(!baselineProof.ok)throw Error('Production baseline restoration has unresolved failures.');
const releaseDate=new Date().toISOString().slice(0,10);
const config={pmh:{origin:'https://pensacolamilitaryhousing.com',base:join(baselineRoot,'pmh'),source:resolve('dist'),dest:join(output,'pmh')},gc:{origin:'https://greggcostin.com',base:join(baselineRoot,'gc'),source:resolve('civilian-site'),dest:join(output,'gc')}};
for(const c of Object.values(config)){if(!existsSync(join(c.base,'sitemap.xml')))throw new Error('Missing published source sitemap.');}
const baseline=Object.fromEntries(Object.entries(config).map(([id,c])=>[id,Object.fromEntries(walk(c.base).map(f=>[relative(c.base,f).replaceAll('\\','/'),hash(f)]))]));
mkdirSync(output,{recursive:true});for(const c of Object.values(config))cpSync(c.base,c.dest,{recursive:true,errorOnExist:true,force:false});
const changes=[],pending=[],unresolved=[];
function inside(root,p){const f=resolve(root,p),r=relative(root,f);if(!r||r==='..'||r.startsWith('..'+sep)||isAbsolute(r))throw new Error('Unsafe candidate path: '+p);return f;}
function copy(id,p,reason){const c=config[id],source=inside(c.source,p),dest=inside(c.dest,p);if(!existsSync(source)||!statSync(source).isFile())throw new Error('Missing source dependency: '+source);mkdirSync(resolve(dest,'..'),{recursive:true});cpSync(source,dest);changes.push({site:id,path:p,reason,source,sha256:hash(dest)});if(p.endsWith('.html'))pending.push([id,p]);}
for(const file of ['index.html','about.html','contact.html','pcs-guide.html','communities.html','mortgage-calculators.html'])copy('pmh',file,'Updated SPA shell and shared application');
for(const file of ['buy.html','sell.html'])copy('gc',file,'New buyer/seller decision paths');
copy('gc','resources/florida-homestead-exemption.html','Required buyer-tax-after-purchase anchor from earlier staged guide update');
copy('pmh','data/gregg-costin.json','Shared professional record with dated license and contact sources');
copy('gc','data/gregg-costin.json','Identical shared professional record');
function fileFor(root,urlPath){const p=decodeURIComponent(urlPath).replace(/^\//,'')||'index.html';for(const rel of [p,extname(p)?p:p+'.html',join(p,'index.html')]){const f=inside(root,rel);if(existsSync(f)&&statSync(f).isFile())return rel.replaceAll('\\','/');}return null;}
const seen=new Set();
while(pending.length){const [id,p]=pending.shift(),key=id+'/'+p;if(seen.has(key))continue;seen.add(key);const c=config[id],html=readFileSync(inside(c.dest,p),'utf8'),baseUrl=c.origin+'/'+p.replace(/index\.html$/,'').replace(/\.html$/,'');
 const refs=[...[...html.matchAll(/\b(?:href|src|poster|content)=["']([^"']+)["']/gi)].map(m=>m[1]),...[...html.matchAll(/\b(?:srcset|imagesrcset)=["']([^"']+)["']/gi)].flatMap(m=>m[1].split(',').map(s=>s.trim().split(/\s+/)[0]))];
 for(const ref of refs){if(!/^(?:https?:|\/|\.{1,2}\/)/.test(ref))continue;let u;try{u=new URL(ref.replaceAll('&amp;','&'),baseUrl);}catch{continue;}const target=Object.entries(config).find(([,c])=>c.origin===u.origin);if(!target)continue;const [sid,sc]=target;if(/^\/cdn-cgi\/|^\/pagefind\//.test(u.pathname))continue;if(fileFor(sc.dest,u.pathname))continue;const found=fileFor(sc.source,u.pathname);if(found)copy(sid,found,'Missing dependency of '+key);else unresolved.push({from:key,url:u.href});}
}
// Propagate only the shared identity and record link across the complete published inventory.
// Keep the live civilian team design and biography; add the generated professional detail block.
for(const [id,c] of Object.entries(config))for(const file of walk(c.dest).filter(f=>f.endsWith('.html')&&!f.endsWith('404.html'))){
 const path=relative(c.dest,file).replaceAll('\\','/'),before=readFileSync(file,'utf8');
 let after=linkBusinessRecord(refreshEntityHtml(before,{site:id}));
 if(id==='gc'&&path==='team.html'){
  const block='<!-- PROFESSIONAL_RECORD_START -->\n'+professionalProfileHtml()+'\n<!-- PROFESSIONAL_RECORD_END -->';
  const marker=/<!-- PROFESSIONAL_RECORD_START -->[\s\S]*?<!-- PROFESSIONAL_RECORD_END -->/;
  if(marker.test(after))after=after.replace(marker,block);
  else {if((after.match(/<\/main>/g)||[]).length!==1)throw Error('Civilian profile main missing');after=after.replace('</main>',block+'\n</main>');}
 }
 if(after===before)continue;
 await writeText(file,after);
 const existing=changes.find(x=>x.site===id&&x.path===path);
 if(existing){existing.reason+='; refreshed shared identity';existing.sha256=hash(file);}
 else changes.push({site:id,path,reason:'Shared identity and professional record; retain existing page body and review dates',source:join(c.base,path),sha256:hash(file),identityOnly:!(id==='gc'&&path==='team.html')});
}
// Update sitemap dates only for deliberate editorial changes, never for shared identity alone.
for(const [id,c] of Object.entries(config)){let sitemap=readFileSync(join(c.dest,'sitemap.xml'),'utf8');for(const p of [...new Set(changes.filter(x=>x.site===id&&x.path.endsWith('.html')&&!x.identityOnly).map(x=>x.path))]){const url=c.origin+(p==='index.html'?'/':'/'+p.replace(/\.html$/,''));let found=false;sitemap=sitemap.replace(/<url>\s*[\s\S]*?<\/url>/g,block=>{if(!block.includes('<loc>'+url+'</loc>'))return block;found=true;return /<lastmod>/.test(block)?block.replace(/<lastmod>[^<]+<\/lastmod>/,`<lastmod>${releaseDate}</lastmod>`):block.replace('</url>',`<lastmod>${releaseDate}</lastmod></url>`);});if(!found)sitemap=sitemap.replace('</urlset>',`<url><loc>${url}</loc><lastmod>${releaseDate}</lastmod></url>\n</urlset>`);}writeFileSync(join(c.dest,'sitemap.xml'),sitemap);}
const preservation=[];
for(const [id,c] of Object.entries(config)){const intended=new Set(changes.filter(x=>x.site===id).map(x=>x.path).concat('sitemap.xml'));const unexpected=[];for(const [p,sha] of Object.entries(baseline[id])){const f=inside(c.dest,p);if(!existsSync(f))unexpected.push({path:p,issue:'missing'});else if(!intended.has(p)&&hash(f)!==sha)unexpected.push({path:p,issue:'unexpected change'});}preservation.push({site:id,baselineFiles:Object.keys(baseline[id]).length,unexpected});}
const report={preparedAt:new Date().toISOString(),candidate:output,mode:'local_review_only_no_deployment',sources:Object.fromEntries(Object.entries(config).map(([id,c])=>[id,c.base])),changes,preservation,unresolved:[...new Map(unresolved.map(x=>[x.from+x.url,x])).values()],remaining:['Regenerate the complete military Pagefind index; retain the civilian site search implementation.','Run coverage guards and candidate link/asset checks.','Refresh production identity before publication.','Review earlier staged dependency guides and complete inquiry verification.','Live FL023 and financial assumption reconciliation remain a separate content release.']};
writeFileSync(join(output,'manifest.json'),JSON.stringify(report,null,2)+'\n');writeFileSync('docs/seo-geo-2026-09-06/candidate-manifest.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({candidate:output,changedAndAddedFiles:changes.length,preservation:preservation.map(x=>({site:x.site,baselineFiles:x.baselineFiles,unexpected:x.unexpected.length})),unresolved:report.unresolved.length},null,2));
if(report.unresolved.length||preservation.some(x=>x.unexpected.length))process.exitCode=1;
