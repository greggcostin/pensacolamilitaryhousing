// Preserve the complete published sites and apply only this reviewed content release.
import {readFileSync,writeFileSync,mkdirSync,cpSync,existsSync,readdirSync} from 'node:fs';
import {join,relative} from 'node:path';
import {createHash} from 'node:crypto';
import {COAST,rebuildCoreGuide,enhanceInstallation,enhanceRegion,refreshCoreDiscovery} from './geo-core-lib.mjs';
const baseline='.coast-release/2026-09-07-foundation',candidate='.coast-release/2026-09-08-pcs-va',evidence='docs/seo-geo-2026-09-06/projects/03-accuracy';
const walk=d=>readdirSync(d,{withFileTypes:true}).flatMap(x=>x.isDirectory()?walk(join(d,x.name)):x.isFile()?[join(d,x.name)]:[]);
const hash=b=>createHash('sha256').update(b).digest('hex');
const before=JSON.parse(readFileSync(evidence+'/before/production-baseline.json','utf8'));
if(!before.ok||before.sites.some(s=>s.localBaseline.replaceAll('\\','/')!==baseline+'/'+s.site))throw Error('Complete pinned baseline has not been verified.');
mkdirSync(candidate,{recursive:true});
for(const site of ['pmh','gc'])if(!existsSync(join(candidate,site)))cpSync(join(baseline,site),join(candidate,site),{recursive:true});
const changes=[],core=['va-loan-guide','bah-to-mortgage-guide'];
for(const site of ['pmh','gc'])for(const file of walk(join(baseline,site)).filter(x=>x.endsWith('.html')||/llms(?:-full)?\.txt$/.test(x))){
 const path=relative(join(baseline,site),file).replaceAll('\\','/'),original=readFileSync(file,'utf8');let html=original;const reasons=[];
 if(site==='pmh'&&html.includes('FL023')){html=html.replaceAll('FL023','FL056');reasons.push('Correct Eglin BAH area code in visible text, metadata, schema and inline lookup');}
 const slug=path.replace(/\.html$/,'');
 if(site==='pmh'&&core.includes(slug)){html=rebuildCoreGuide(html,slug);reasons.push('Rebuild sourced core VA/BAH guide, matching FAQ and metadata');}
 const base=site==='pmh'&&COAST.bases.find(b=>path===`bases/${b.slug}.html`);
 if(base){html=enhanceInstallation(html,base);reasons.push('Add current housing-office and assignment-specific planning answers');}
 const region=site==='gc'&&COAST.regions.find(r=>r.civilianPaths.includes('/'+slug));
 if(region){html=enhanceRegion(html,region);reasons.push('Connect local buyer and seller decisions to VA/PCS planning');}
 // Update the discovery summaries of the two rewritten guides, retaining every other entry.
 if(site==='pmh'&&/llms(?:-full)?\.txt$/.test(path)){
  html=refreshCoreDiscovery(html);reasons.push('Align core guide discovery summaries with the reviewed visible content');
 }
 if(html!==original){writeFileSync(join(candidate,site,path),html);changes.push({site,path,reasons,oldSha256:hash(original),sha256:hash(html)});}
 // Apply the same scoped transformation to the maintained source, retaining unrelated source work.
 const source=join(site==='pmh'?'public':'civilian-site',path);
 if(existsSync(source)){
  let h=readFileSync(source,'utf8'),out=h;
  if(site==='pmh')out=out.replaceAll('FL023','FL056');
  if(site==='pmh'&&core.includes(slug))out=rebuildCoreGuide(out,slug);
  if(base)out=enhanceInstallation(out,base);
  if(region)out=enhanceRegion(out,region);
  if(site==='pmh'&&/llms(?:-full)?\.txt$/.test(path))out=refreshCoreDiscovery(out);
  if(out!==h)writeFileSync(source,out);
 }
}
for(const path of ['tools/bah-budget.js','tools/bah-budget-model.js']){
 const content=readFileSync(join('public',path));mkdirSync(join(candidate,'pmh','tools'),{recursive:true});writeFileSync(join(candidate,'pmh',path),content);changes.push({site:'pmh',path,reasons:['Browser-only monthly budget comparison'],sha256:hash(content)});
}
// Only substantively rewritten guides get a new whole-page sitemap date. New resource blocks have their own review dates.
let sitemap=readFileSync(join(baseline,'pmh','sitemap.xml'),'utf8');
sitemap=sitemap.replace(/<url>[\s\S]*?<\/url>/g,block=>core.some(s=>block.includes('https://pensacolamilitaryhousing.com/'+s+'</loc>'))?block.replace(/<lastmod>[^<]+<\/lastmod>/,'<lastmod>2026-09-08</lastmod>'):block);
writeFileSync(join(candidate,'pmh','sitemap.xml'),sitemap);
const sourceSitemap=readFileSync('public/sitemap.xml','utf8');
writeFileSync('public/sitemap.xml',sourceSitemap.replace(/<url>[\s\S]*?<\/url>/g,block=>core.some(s=>block.includes('https://pensacolamilitaryhousing.com/'+s+'</loc>'))?block.replace(/<lastmod>[^<]+<\/lastmod>/,'<lastmod>2026-09-08</lastmod>'):block));
const path='sitemap.xml',old=readFileSync(join(baseline,'pmh',path));if(hash(old)!==hash(sitemap))changes.push({site:'pmh',path,reasons:['Substantive core-guide review date'],oldSha256:hash(old),sha256:hash(sitemap)});
const ignoredHistoricalAssets=walk(join(baseline,'pmh','assets')).filter(f=>f.endsWith('.js')&&readFileSync(f,'utf8').includes('FL023')).map(f=>relative(join(baseline,'pmh'),f).replaceAll('\\','/'));
const record={preparedAt:new Date().toISOString(),baseline,candidate,productionBefore:before.sites.map(({site,deploymentId})=>({site,deploymentId})),changes,ignoredHistoricalAssets,limits:'Legacy assets are retained for cached clients. Referenced current scripts must use the correct code. No ranking or real inquiry result is implied.'};
writeFileSync(evidence+'/candidate-manifest.json',JSON.stringify(record,null,2)+'\n');
console.log(JSON.stringify({candidate,changedHtml:changes.filter(x=>x.path.endsWith('.html')).length,changedFiles:changes.length,ignoredHistoricalAssets},null,2));
