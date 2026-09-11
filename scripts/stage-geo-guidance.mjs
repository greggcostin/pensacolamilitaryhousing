// Stage reviewed guidance on the complete, freshly verified identity release.
import {readFileSync,writeFileSync,copyFileSync,mkdirSync,existsSync} from 'node:fs';
import {join,dirname,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {stageBaseline,json,save,inventory,walk} from './isolated-release-lib.mjs';
import {unbundleCivilianStyles,bundleCivilianStyles} from './civilian-style-bundle.mjs';
import {withoutCoastalThemeLink,withCivilianCoastalTheme} from './civilian-coastal-theme.mjs';
const dir='docs/geo-execution-2026-09-10/guidance-release';
if(existsSync(join(dir,'deployment.json')))throw Error('Published candidate is immutable');
const proof=json(join(dir,'baseline/production-baseline.json'));
const candidate=resolve('.coast-release/geo-20260910/guidance');
stageBaseline(proof,candidate);
const roots={gc:join(candidate,'gc'),pmh:join(candidate,'pmh')};
const run=args=>{const r=spawnSync(process.execPath,args,{stdio:'inherit',windowsHide:true});if(r.status!==0)throw Error('Failed: '+args.join(' '));};
const copy=(from,to)=>{mkdirSync(dirname(to),{recursive:true});copyFileSync(from,to);};
for(const path of ['schools.html','neighborhoods/navarre.html','neighborhoods/gulf-breeze.html']){
 const f=join(roots.gc,path);writeFileSync(f,unbundleCivilianStyles(readFileSync(f,'utf8'),roots.gc));
}
copy('civilian-site/assets/school-finder-data.json',join(roots.gc,'assets/school-finder-data.json'));
copy('public/school-assets/school-finder-data.json',join(roots.pmh,'school-assets/school-finder-data.json'));
run(['scripts/refresh-school-campuses.mjs','--gc-root',roots.gc,'--pmh-root',roots.pmh]);
run(['scripts/build-school-audience.mjs','--gc-root',roots.gc,'--pmh-root',roots.pmh]);
run(['scripts/build-school-hub-seo.mjs','--gc-root',roots.gc,'--pmh-root',roots.pmh]);
run(['scripts/build-navarre-guides.mjs','--candidate',candidate]);
run(['scripts/build-gulf-breeze-guides.mjs','--gc-root',roots.gc,'--pmh-root',roots.pmh]);
for(const path of ['schools.html','neighborhoods/navarre.html','neighborhoods/gulf-breeze.html']){
 const f=join(roots.gc,path),old=readFileSync(f,'utf8');
 const prepared=(await bundleCivilianStyles(withoutCoastalThemeLink(old),roots.gc,{inline:path==='schools.html'})).html;
 writeFileSync(f,withCivilianCoastalTheme(prepared));
}
// The existing shell-preserving blog factory has already passed both source gates.
// Transfer only its changed main, date/meta/FAQ/BlogPosting and versioned share card.
for(const slug of ['fed-rate-hike-what-it-means','what-moves-mortgage-rates']){
 const path='blog/'+slug+'.html',f=join(roots.gc,path),source=readFileSync('civilian-site/'+path,'utf8');
 let html=readFileSync(f,'utf8');
 for(const pattern of [/<main\b[^>]*>[\s\S]*?<\/main>/,/<header\b[^>]*>[\s\S]*?<\/header>/]){
  const next=source.match(pattern)?.[0];if(!next||!pattern.test(html))throw Error('Missing article layout '+slug);html=html.replace(pattern,()=>next);
 }
 html=html.replace(/<meta\b[^>]*>/g,tag=>{const key=tag.match(/(?:name|property)="([^"]+)"/)?.[1];if(!['article:modified_time','og:image','twitter:image'].includes(key))return tag;return [...source.matchAll(/<meta\b[^>]*>/g)].map(m=>m[0]).find(t=>t.includes('"'+key+'"'))||tag;});
 html=html.replace(/(<script\b[^>]*type="application\/ld\+json"[^>]*>)([\s\S]*?)(<\/script>)/g,(all,a,b,z)=>{
  const node=JSON.parse(b);if(!['BlogPosting','Article','FAQPage'].includes(node['@type']))return all;
  const next=[...source.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1])).find(n=>n['@type']===node['@type']);if(!next)throw Error('Missing article schema');return a+JSON.stringify(next)+z;
 });
 writeFileSync(f,html);
 copy('civilian-site/og/blog-'+slug+'.png',join(roots.gc,'og/blog-'+slug+'.png'));
}
// Update published summaries only; this routine reads the candidate's article HTML.
run(['scripts/finish-blog-discovery.mjs','--gc-root',roots.gc,'--pmh-root',roots.pmh]);
// Keep the live blog hub furniture, refreshing just its current dated article cards.
const hub=join(roots.gc,'blog.html');let hubHtml=readFileSync(hub,'utf8');
hubHtml=hubHtml.replace(/<a class="blog-card" href="\/blog\/(fed-rate-hike-what-it-means|what-moves-mortgage-rates)">[\s\S]*?<\/a>/g,card=>card.replace(/<span class="bc-date">[^<]+<\/span>/,'<span class="bc-date">Updated September 10, 2026</span>'));
writeFileSync(hub,hubHtml);
for(const [site,root] of Object.entries(roots)){
 const changed=new Set(['/schools','/'+(site==='gc'?'neighborhoods':'communities')+'/navarre','/'+(site==='gc'?'neighborhoods':'communities')+'/gulf-breeze',...json('content/schools/audience-guidance-2026-09.json').schools.map(s=>'/schools/'+s.slug),'/schools/gulf-shores-middle-school',...(site==='gc'?['/blog/fed-rate-hike-what-it-means','/blog/what-moves-mortgage-rates']:[])]);
 const file=join(root,'sitemap.xml');let xml=readFileSync(file,'utf8');
 xml=xml.replace(/<url>[\s\S]*?<\/url>/g,entry=>{const loc=entry.match(/<loc>([^<]+)<\/loc>/)?.[1];if(!loc||!changed.has(new URL(loc).pathname))return entry;return /<lastmod>/.test(entry)?entry.replace(/<lastmod>[^<]+<\/lastmod>/,'<lastmod>2026-09-10</lastmod>'):entry.replace('</loc>','</loc><lastmod>2026-09-10</lastmod>');});writeFileSync(file,xml);
}
const asset=/<script type="module" crossorigin src="(\/assets\/index-[^"]+\.js)"><\/script>/;
const old=readFileSync(join(proof.sites.find(s=>s.site==='pmh').localBaseline,'index.html'),'utf8').match(asset),next=readFileSync('dist/index.html','utf8').match(asset);
if(!old||!next||old[1]===next[1])throw Error('Expected updated About claims in compiled application');
copy('dist'+next[1],roots.pmh+next[1]);
for(const name of ['index','about','contact','pcs-guide','communities','mortgage-calculators']){
 const f=join(roots.pmh,name+'.html');let h=readFileSync(f,'utf8');if(!h.includes(old[0])&&!h.includes(next[0]))throw Error('Missing expected bundle '+name);h=h.replace(old[0],next[0]);writeFileSync(f,h);
}
for(const site of ['gc','pmh'])run(['scripts/build-blog-search.mjs',site,'--root',roots[site],'--preserve-photography','--report',join(dir,'search-'+site+'.json')]);
const record=inventory(proof,candidate);if(record.removed.length)throw Error('Existing assets removed');
save(join(dir,'candidate.json'),{...record,releaseMessage:'Publish distinct school guidance, sourced campus corrections, Navarre utility and Gulf Breeze guides; refresh mortgage sources',sourceBundle:{baseline:old[1],candidate:next[1]}});
console.log(JSON.stringify({candidate,changes:record.changes.length,preserved:record.preserved,contentChanges:record.changes.filter(c=>!c.path.startsWith('pagefind/')).map(c=>c.site+'/'+c.path)},null,2));
