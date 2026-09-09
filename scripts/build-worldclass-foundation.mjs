// Reconcile an explicitly pinned, verified production snapshot with the approved
// homepage and resource directory. Copies to a new release; never deploys.
import {readFileSync,writeFileSync,existsSync,mkdirSync,cpSync,readdirSync,statSync} from 'node:fs';
import {resolve,join,dirname,relative,sep,extname} from 'node:path';
import {createHash} from 'node:crypto';
import {enhanceHomeDiscovery,resourceLibraryMain,resourceCollectionSchema,RESOURCE_REVIEW_DATE} from './civilian-resource-library.mjs';
const evidence=resolve('docs/worldclass-roadmap-2026-09-08');
const output=resolve('.coast-release/2026-09-08-design-02');
const baselineEvidence=join(evidence,'prepublish');
const baseline=JSON.parse(readFileSync(join(baselineEvidence,'production-baseline.json'),'utf8'));
if(!baseline.ok)throw Error('Production inventory has not been verified.');
const walk=d=>readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(d,e.name)):e.isFile()?[join(d,e.name)]:[]);
const sha=file=>createHash('sha256').update(readFileSync(file)).digest('hex');
const siteRoots=Object.fromEntries(baseline.sites.map(s=>[s.site,resolve(s.localBaseline)]));
const sources=resolve('civilian-site');
const main=h=>{const matches=[...h.matchAll(/<main\b[^>]*>[\s\S]*?<\/main>/g)];if(matches.length!==1)throw Error('Expected exactly one main element');return matches[0][0];};
const before=Object.fromEntries(Object.entries(siteRoots).map(([site,root])=>[site,Object.fromEntries(walk(root).map(f=>[relative(root,f).replaceAll('\\','/'),sha(f)]))]));
if(!existsSync(output)){
 if(!output.startsWith(resolve('.coast-release')+sep))throw Error('Unsafe release target.');
 mkdirSync(output,{recursive:true});
 for(const [site,root] of Object.entries(siteRoots))cpSync(root,join(output,site),{recursive:true,errorOnExist:true,force:false});
 writeFileSync(join(output,'baseline.json'),JSON.stringify(baseline,null,2)+'\n');
}else{
 const original=JSON.parse(readFileSync(join(output,'baseline.json'),'utf8'));
 if(JSON.stringify(original)!==JSON.stringify(baseline))throw Error('Existing release has a different pinned baseline.');
}
const gc=join(output,'gc');
const homeSource=readFileSync(join(sources,'index.html'),'utf8');
const schoolData=JSON.parse(readFileSync(join(gc,'assets/school-finder-data.json'),'utf8'));
const schools=schoolData.schools;
const schoolCount=schools.length;
const mappedCount=schools.filter(s=>Number.isFinite(s.lat)&&Number.isFinite(s.lng)).length;
if(schoolCount<200||mappedCount<200)throw Error('School coverage unexpectedly low; inspect the data shape.');
const copied=new Set();
function copy(path){
 const from=resolve(sources,path),to=resolve(gc,path);
 if(!from.startsWith(sources+sep)||!to.startsWith(gc+sep))throw Error('Unsafe dependency path');
 if(!existsSync(from))throw Error('Missing reviewed source dependency: '+path);
 mkdirSync(dirname(to),{recursive:true});cpSync(from,to);copied.add(path.replaceAll('\\','/'));
}
for(const p of ['assets/costin-experience.css','assets/costin-experience.js','assets/costin-resource-library.css'])copy(p);
function addLibraryCss(h){return h.includes('/assets/costin-resource-library.css')?h:h.replace('</head>','<link rel="stylesheet" href="/assets/costin-resource-library.css">\n</head>');}
function updateMetadata(h,title,description){
 h=h.replace(/<title>[^<]*<\/title>/,`<title>${title.replaceAll('&','&amp;')}</title>`);
 for(const name of ['name="description"','property="og:description"','name="twitter:description"'])h=h.replace(new RegExp('(<meta '+name+' content=")[^"]*'),'$1'+description);
 for(const name of ['property="og:title"','name="twitter:title"'])h=h.replace(new RegExp('(<meta '+name+' content=")[^"]*'),'$1'+title.replaceAll('&','&amp;'));
 return h;
}
function updatePageSchema(h,transform){return h.replace(/(<script[^>]*type="application\/ld\+json"[^>]*>)([\s\S]*?)(<\/script>)/g,(_,open,json,close)=>open+JSON.stringify(transform(JSON.parse(json)))+close);}
function credits(h,names){
 h=h.replace(/\s*<p class="gc-photo-credit-link">[\s\S]*?<\/p>/g,'');
 return h.replace('</footer>',`<p class="gc-photo-credit-link"><a href="/photo-credits" data-photo-credits-page="${names.join(' ')}">Photography credits</a></p>\n</footer>`);
}
let home=readFileSync(join(siteRoots.gc,'index.html'),'utf8').replace(/<main\b[^>]*>[\s\S]*?<\/main>/,enhanceHomeDiscovery(main(homeSource),{schoolCount}));
const photoNames=[...new Set([...main(home).matchAll(/<img[^>]*src="\/images\/([^"/]+)\.jpg"/g)].map(m=>m[1]))];
home=credits(addLibraryCss(home),photoNames);
home=updatePageSchema(home,data=>{
 for(const node of [data,...(data['@graph']||[])])if(node['@type']==='WebPage'&&(node.url==='https://greggcostin.com/'||node['@id']==='https://greggcostin.com/#webpage'))node.dateModified=RESOURCE_REVIEW_DATE;
 return data;
});
writeFileSync(join(gc,'index.html'),home);
function picture(name,alt,eager=false){
 let block=[...homeSource.matchAll(/<picture>[\s\S]*?<\/picture>/g)].map(m=>m[0]).find(p=>p.includes('src="/images/'+name+'.jpg"'));
 if(!block)throw Error('No normalized source picture for '+name);
 block=block.replace(/alt="[^"]*"/,`alt="${alt.replaceAll('&','&amp;').replaceAll('"','&quot;')}"`).replace(/ role="presentation"/g,'').replace(/ fetchpriority="high"/g,'');
 if(!alt)block=block.replace('<img ','<img role="presentation" ');
 block=block.replace(/ loading="(?:lazy|eager)"/g,'').replace('<img ',`<img loading="${eager?'eager':'lazy'}" `);
 return block.replace(/sizes="[^"]*"/g,`sizes="${eager?'100vw':'(max-width: 760px) calc(100vw - 48px), 420px'}"`);
}
let resources=readFileSync(join(siteRoots.gc,'resources.html'),'utf8');
resources=resources.replace(/<header\b[^>]*>[\s\S]*?<\/header>/,'').replace(/<main\b[^>]*>[\s\S]*?<\/main>/,resourceLibraryMain({picture,schoolCount,mappedCount}));
resources=resources.replace(/<body[^>]*>/,'<body class="gc-page gc-resource-library">');
const title='Gulf Coast Real Estate Guides & Tools | Gregg Costin';
const description='Explore Gulf Coast real estate guides, school maps, ownership-cost worksheets and seller tools for Pensacola, the Emerald Coast and coastal Alabama.';
resources=updateMetadata(resources,title,description);
resources=updatePageSchema(resources,data=>data['@type']==='CollectionPage'?resourceCollectionSchema(data):data);
resources=credits(addLibraryCss(resources),['navarre','palafox-street','perdido-waterfront','three-mile-bridge','gregg-courthouse','gregg-navy-no-tie']);
writeFileSync(join(gc,'resources.html'),resources);
// The existing credit page contains the reviewed image provenance. Keep the current
// shared identity record from the published snapshot rather than reverting it.
copy('photo-credits.html');copy('og/photo-credits.png');copy('og/resources.png');
let creditHtml=readFileSync(join(gc,'photo-credits.html'),'utf8');
const compact=readFileSync(join(siteRoots.gc,'resources.html'),'utf8').match(/<script[^>]*data-entity="entity-graph:compact"[^>]*>[\s\S]*?<\/script>/)?.[0];
if(!compact)throw Error('Published compact identity missing');
creditHtml=creditHtml.replace(/<script[^>]*data-entity="entity-graph:compact"[^>]*>[\s\S]*?<\/script>/,compact);
const recordLink=readFileSync(join(siteRoots.gc,'resources.html'),'utf8').match(/<p[^>]*>[^<]*<a[^>]*href="\/data\/gregg-costin\.json"[\s\S]*?<\/p>/)?.[0];
if(recordLink&&!creditHtml.includes('/data/gregg-costin.json'))creditHtml=creditHtml.replace('</footer>',recordLink+'\n</footer>');
writeFileSync(join(gc,'photo-credits.html'),creditHtml);
// Resolve every local dependency referenced by the changed pages. Existing files
// are kept; missing image variants and credit-page assets come from reviewed source.
for(const file of ['index.html','resources.html','photo-credits.html']){
 const h=readFileSync(join(gc,file),'utf8');
 const refs=[...[...h.matchAll(/\b(?:src|href|poster)="(\/[^"#?]*)/g)].map(m=>m[1]),...[...h.matchAll(/\b(?:srcset|imagesrcset)="([^"]*)"/g)].flatMap(m=>m[1].split(',').map(v=>v.trim().split(/\s/)[0]))];
 for(const ref of refs){if(!ref.startsWith('/')||!extname(ref)||ref.startsWith('/cdn-cgi/'))continue;const path=ref.slice(1);if(!existsSync(join(gc,path)))copy(path);}
}
// Keep the directory's sharing card descriptive and independent of an old title.
// Its image is generated separately before verification and publication.
let sitemap=readFileSync(join(siteRoots.gc,'sitemap.xml'),'utf8');
for(const path of ['/','/resources']){
 const escaped=('https://greggcostin.com'+path).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 sitemap=sitemap.replace(new RegExp('(<url>\\s*<loc>'+escaped+'<\\/loc>\\s*<lastmod>)[^<]+'),'$1'+RESOURCE_REVIEW_DATE);
}
if(!sitemap.includes('<loc>https://greggcostin.com/photo-credits</loc>'))sitemap=sitemap.replace('</urlset>',`  <url><loc>https://greggcostin.com/photo-credits</loc><lastmod>${RESOURCE_REVIEW_DATE}</lastmod></url>\n</urlset>`);
writeFileSync(join(gc,'sitemap.xml'),sitemap);
let llms=readFileSync(join(siteRoots.gc,'llms.txt'),'utf8');
llms=llms.replace(/^.*\[.*\]\(https:\/\/greggcostin.com\/resources\):.*$/m,'- [Gulf Coast guides and tools](https://greggcostin.com/resources): community guides, school maps, ownership-cost worksheets, seller proceeds and relocation planning.');
if(!llms.includes('https://greggcostin.com/photo-credits'))llms+='\n- [Photography credits](https://greggcostin.com/photo-credits): image sources and licenses.\n';
writeFileSync(join(gc,'llms.txt'),llms);
const plain=h=>h.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,' ').replace(/<[^>]*>/g,' ').replace(/&amp;/g,'&').replace(/&(?:nbsp|middot);/g,' ').replace(/&rsquo;/g,'’').replace(/\s+/g,' ').trim();
let full=readFileSync(join(siteRoots.gc,'llms-full.txt'),'utf8');
for(const [path,h,label] of [['/',home,'Pensacola & Gulf Coast Realtor | Gregg Costin, FL & AL'],['/resources',resources,title]]){
 const escaped=('https://greggcostin.com'+path).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 const re=new RegExp('## [^\\r\\n]+\\r?\\nURL: '+escaped+'\\r?\\n\\r?\\n[\\s\\S]*?(?=\\r?\\n\\r?\\n## |$)');
 const entry='## '+label+'\nURL: https://greggcostin.com'+path+'\n\n'+plain(main(h));
 full=re.test(full)?full.replace(re,entry):full.trimEnd()+'\n\n'+entry+'\n';
}
writeFileSync(join(gc,'llms-full.txt'),full);
// Complete the existing local-font rollout. School bodies, scripts, structured
// data and dates remain identical; only the font-loading head markup changes.
copy('assets/costin-fonts.css');
for(const file of readdirSync(join(sources,'fonts')))if(statSync(join(sources,'fonts',file)).isFile())copy('fonts/'+file);
const fontHead='<link rel="preload" href="/fonts/inter-latin-variable.woff2" as="font" type="font/woff2" crossorigin>\n<link rel="preload" href="/fonts/playfair-latin-variable.woff2" as="font" type="font/woff2" crossorigin>\n<link rel="stylesheet" href="/assets/costin-fonts.css">';
let fontPages=0;
for(const file of walk(gc).filter(f=>f.endsWith('.html')&&!f.endsWith('404.html'))){
 let h=readFileSync(file,'utf8');if(h.includes('/assets/costin-fonts.css'))continue;
 h=h.replace(/<link\b[^>]*href="https:\/\/fonts\.(?:googleapis|gstatic)\.com[^>]*>\s*/g,'');
 h=h.replace(/@import\s+url\(['"]?https:\/\/fonts\.googleapis\.com[^;]+;\s*/g,'');
 h=h.replace('</head>',fontHead+'\n</head>');writeFileSync(file,h);fontPages++;
}
const changes=[];
for(const site of ['gc','pmh'])for(const f of walk(join(output,site))){const path=relative(join(output,site),f).replaceAll('\\','/'),hash=sha(f);if(hash!==before[site][path])changes.push({site,path,sha256:hash,priorSha256:before[site][path]||null});}
const manifest={createdAt:new Date().toISOString(),status:'candidate',candidate:output,baselineEvidence,sources:siteRoots,baselineDeployments:baseline.sites.map(({site,deploymentId})=>({site,deploymentId})),schoolCount,mappedCount,fontPages,changes,limits:'No deployment, real inquiry, current ranking or analytics performance claimed.'};
writeFileSync(join(output,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
writeFileSync(join(evidence,'candidate-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({candidate:output,schoolCount,mappedCount,changes:changes.length,changedHtmlCount:changes.filter(c=>c.path.endsWith('.html')).length,militaryFilesChanged:changes.filter(c=>c.site==='pmh').length},null,2));
