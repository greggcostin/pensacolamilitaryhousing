import {readFileSync,writeFileSync,existsSync,statSync,readdirSync} from 'node:fs';
import {resolve,join,extname,relative} from 'node:path';
import {createHash} from 'node:crypto';
import {refreshEntityHtml} from './entity-sync-lib.mjs';
import {linkBusinessRecord} from './identity-page-lib.mjs';
const manifest=JSON.parse(readFileSync('docs/seo-geo-2026-09-06/candidate-manifest.json','utf8'));
const sites={pmh:'https://pensacolamilitaryhousing.com',gc:'https://greggcostin.com'};
const roots=Object.fromEntries(Object.keys(sites).map(id=>[id,join(manifest.candidate,id)]));
const sha=f=>createHash('sha256').update(readFileSync(f)).digest('hex');
const walk=d=>readdirSync(d,{withFileTypes:true}).flatMap(x=>x.isDirectory()?walk(join(d,x.name)):x.isFile()?[join(d,x.name)]:[]);
const find=(root,p)=>{const rel=decodeURIComponent(p).replace(/^\//,'')||'index.html';return [rel,extname(rel)?rel:rel+'.html',join(rel,'index.html')].map(x=>resolve(root,x)).find(f=>f.startsWith(root+'\\')&&existsSync(f)&&statSync(f).isFile());};
const findings=[];let links=0,schemaBlocks=0,schools=0,baselineFiles=0;
const changes=manifest.changes.filter(x=>x.path.endsWith('.html'));
for(const change of changes){const root=roots[change.site],file=join(root,change.path),h=readFileSync(file,'utf8'),url=sites[change.site]+(change.path==='index.html'?'/':'/'+change.path.replace(/\.html$/,''));
 if((h.match(/<h1\b/gi)||[]).length!==1)findings.push({file,issue:'H1 count'});
 if(/<meta\b(?=[^>]*name=["']robots["'])(?=[^>]*content=["'][^"']*noindex)[^>]*>/i.test(h))findings.push({file,issue:'Noindex in changed public page'});
 for(const m of h.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)){schemaBlocks++;try{JSON.parse(m[1]);}catch(e){findings.push({file,issue:'Invalid JSON-LD',detail:e.message});}}
 for(const m of h.matchAll(/\b(?:href|src|poster)=["']([^"']+)["']/gi)){let target;try{target=new URL(m[1].replaceAll('&amp;','&'),url);}catch{continue;}const id=Object.keys(sites).find(id=>sites[id]===target.origin);if(!id||/^\/cdn-cgi\//.test(target.pathname))continue;links++;const hit=find(roots[id],target.pathname);if(!hit){findings.push({file,issue:'Missing internal file',url:target.href});continue;}if(target.hash&&hit.endsWith('.html')&&target.hash!=='#'&&!target.hash.startsWith('#:~:text=')){const targetHtml=readFileSync(hit,'utf8'),fragment=decodeURIComponent(target.hash.slice(1));if(!targetHtml.includes('id="'+fragment+'"')&&!targetHtml.includes("id='"+fragment+"'")&&!targetHtml.includes('name="'+fragment+'"'))findings.push({file,issue:'Fragment absent from static target; verify rendered target',url:target.href});}}
}
for(const [id,base] of Object.entries(manifest.sources)){for(const f of walk(base).filter(f=>f.includes('\\schools\\')&&f.endsWith('.html'))){schools++;const target=join(roots[id],relative(base,f));const expected=linkBusinessRecord(refreshEntityHtml(readFileSync(f,'utf8'),{site:id}));if(!existsSync(target)||readFileSync(target,'utf8')!==expected)findings.push({file:target,issue:'School content or dates changed beyond the authorized identity transform'});}}
for(const [id,base] of Object.entries(manifest.sources)){
 const intended=new Set(manifest.changes.filter(x=>x.site===id).map(x=>x.path).concat('sitemap.xml'));
 for(const file of walk(base)){baselineFiles++;const path=relative(base,file).replaceAll('\\','/'),target=join(roots[id],path);
  if(!existsSync(target))findings.push({file:target,issue:'Baseline file removed'});
  else if(!intended.has(path)&&!(id==='pmh'&&path.startsWith('pagefind/'))&&sha(file)!==sha(target))findings.push({file:target,issue:'Unexpected baseline change'});
 }
}
for(const row of manifest.changes){const target=join(roots[row.site],row.path);if(!existsSync(target)||sha(target)!==row.sha256)findings.push({file:target,issue:'Candidate differs from recorded overlay hash'});}
const search=JSON.parse(readFileSync(join(roots.pmh,'pagefind/pagefind-entry.json'),'utf8'));
const sitemapPaths=[...readFileSync(join(roots.pmh,'sitemap.xml'),'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>new URL(m[1]).pathname);
const expectedPages=new Set(sitemapPaths.map(p=>find(roots.pmh,p)).filter(f=>f?.endsWith('.html'))).size;
if(Object.keys(search.languages).join(',')!=='en'||search.languages.en?.page_count!==expectedPages)findings.push({issue:'Search must include the full English sitemap in one language',expectedPages,languages:search.languages});
const result={checkedAt:new Date().toISOString(),candidate:manifest.candidate,changedHtmlPages:changes.length,internalReferencesChecked:links,jsonLdBlocksParsed:schemaBlocks,schoolHtmlFilesWithContentAndDatesPreserved:schools,baselineFilesVerified:baselineFiles,searchLanguages:Object.keys(search.languages),searchPageCount:search.languages.en?.page_count,findings,limitations:'Checks all changed HTML references, JSON parsing, expected overlay hashes, retained baseline files, school content and dates outside the exact shared-identity transform, and one complete English search index. Rendering, live contacts, financial source review, indexing and production publication remain separate.'};
writeFileSync('docs/seo-geo-2026-09-06/candidate-verification.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({...result,findings:findings.slice(0,15)},null,2));if(findings.length)process.exitCode=1;
