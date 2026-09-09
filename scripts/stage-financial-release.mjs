// Apply reviewed facts within the current full production design, never deploy a partial checkout.
import {readFileSync,writeFileSync,mkdirSync,cpSync,existsSync,readdirSync} from 'node:fs';
import {join,relative,dirname} from 'node:path';import {createHash} from 'node:crypto';
import {e,mapSchema,COAST,rebuildCoreGuide,enhanceInstallation,refreshCoreDiscovery} from './geo-core-lib.mjs';
import {FINANCIAL_GUIDES} from '../content/geo/financial-guide-data.mjs';
import {financialBody,rebuildFinancialGuide} from './financial-guide-lib.mjs';
import {COMMUNITY_BUDGETS,enhanceCommunityFinance,enhanceCivilianCosts} from './community-finance-lib.mjs';
const arg=k=>process.argv.includes(k)?process.argv[process.argv.indexOf(k)+1]:null;
const baseline=arg('--baseline')||'.coast-release/2026-09-08-school-seo',candidate=arg('--candidate')||'.coast-release/2026-09-08-financial',evidence='docs/seo-geo-2026-09-06/projects/03-accuracy/financial';
const walk=d=>readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(d,e.name)):e.isFile()?[join(d,e.name)]:[]),hash=b=>createHash('sha256').update(b).digest('hex');
const before=JSON.parse(readFileSync(evidence+'/baseline/production-baseline.json','utf8'));
if(!before.ok||before.sites.some(s=>s.localBaseline.replaceAll('\\','/')!==baseline+'/'+s.site))throw Error('Current complete baseline has not been verified.');
for(const site of ['pmh','gc']){mkdirSync(join(candidate,site),{recursive:true});cpSync(join(baseline,site),join(candidate,site),{recursive:true});}
const changes=[],communityChanges=[];const write=(site,path,out,reason)=>{const old=existsSync(join(baseline,site,path))?readFileSync(join(baseline,site,path)):null;mkdirSync(dirname(join(candidate,site,path)),{recursive:true});writeFileSync(join(candidate,site,path),out);if(!old||hash(old)!==hash(out))changes.push({site,path,reasons:[reason],oldSha256:old?hash(old):null,sha256:hash(out)});};
function discovery(text){text=refreshCoreDiscovery(text);text=text.replace(/^(### [^\n]*https:\/\/pensacolamilitaryhousing\.com\/([^\s]+)[^\n]*)\r?\n[\s\S]*?(?=^#{1,6} |(?![\s\S]))/gm,(full,heading,slug)=>FINANCIAL_GUIDES[slug]?`${heading}\n${FINANCIAL_GUIDES[slug].quickAnswer} Reviewed September 8, 2026. Use the linked page for assumptions, sources and the current visible answers.\n\n`:full);return text.replace(/^### Interactive BAH Calculator\r?\n[\s\S]*?(?=^#{1,6} |(?![\s\S]))/gm,`### Interactive BAH and property cost calculator\nhttps://pensacolamilitaryhousing.com/bah-rates#calculator\nVerified published BAH plus a property-specific monthly cost comparison. Enter the rate, down payment, tax, insurance, association charges, maintenance and utilities. Rank alone does not determine an approval.\n\n`);}
function transform(site,path,text,log=false){let h=text;
 if(site==='pmh'){
  h=h.replaceAll('FL023','FL056');const slug=path.replace(/\.html$/,'');
  if(['va-loan-guide','bah-to-mortgage-guide'].includes(slug))h=rebuildCoreGuide(h,slug);
  if(FINANCIAL_GUIDES[slug])h=rebuildFinancialGuide(h,slug);
  const base=COAST.bases.find(b=>path===`bases/${b.slug}.html`);if(base)h=enhanceInstallation(h,base);
  const community=path.match(/^communities\/([^/]+)\.html$/)?.[1];
  if(COMMUNITY_BUDGETS[community]){const result=enhanceCommunityFinance(h,community);h=result.html;if(log)communityChanges.push({slug:community,...result,html:undefined});}
  if(/llms(?:-full)?\.txt$/.test(path))h=discovery(h);
  if(path==='mortgage-calculators.html')h=h.replace(/The BAH tool uses the same affordability model[\s\S]*?(?=<\/p>)/,()=>`Compare your actual duty-station BAH with the complete costs of a property. The <a href="/bah-rates#calculator">ownership-cost worksheet</a> uses entered taxes, insurance, dues, maintenance and utilities; the <a href="/bah-to-mortgage-guide#budget-tool">income worksheet</a> uses actual LES pay. Neither assigns a purchase approval to a rank.`).replace('The BAH-to-mortgage guide explains the assumptions behind its separate rank-by-rank planning tables.','The BAH-to-mortgage guide compares actual-income scenarios, and the BAH rates page includes a property-cost worksheet.');
 }
 if(site==='gc'&&path==='resources/coastal-ownership-costs.html')h=enhanceCivilianCosts(h);
 return h;
}
for(const site of ['pmh','gc'])for(const file of walk(join(baseline,site)).filter(f=>f.endsWith('.html')||/llms(?:-full)?\.txt$/.test(f))){
 const path=relative(join(baseline,site),file).replaceAll('\\','/'),text=readFileSync(file,'utf8'),out=transform(site,path,text,true);
 if(out!==text)write(site,path,out,'Reviewed financial content or restoration of previously published VA/BAH corrections');
 const source=join(site==='pmh'?'public':'civilian-site',path);if(existsSync(source)){const s=readFileSync(source,'utf8');if(s.includes('data-community-guide=')&&path.startsWith('communities/'))continue;const t=transform(site,path,s);if(s!==t)writeFileSync(source,t);}
}
for(const p of ['tools/bah-budget.js','tools/bah-budget-model.js','tools/ownership-model.js','tools/ownership-budget.js'])write('pmh',p,readFileSync('public/'+p),'Reviewed browser-only financial model');
write('gc','assets/costin-guide-tools.mjs',readFileSync('civilian-site/assets/costin-guide-tools.mjs'),'Include mortgage insurance and recurring assessments in two-property budget');
// Give corrected executable assets a new URL. Retain original immutable URLs for cached clients.
for(const file of walk(join(baseline,'pmh')).filter(f=>f.endsWith('.js')&&!f.includes('pagefind'))){const old=readFileSync(file,'utf8');if(!old.includes('FL023'))continue;const path=relative(join(baseline,'pmh'),file).replaceAll('\\','/');const htmlFiles=walk(join(candidate,'pmh')).filter(f=>f.endsWith('.html')&&readFileSync(f,'utf8').includes('/'+path));if(!htmlFiles.length)continue;
 const out=old.replaceAll('FL023','FL056'),next=path.replace(/\.js$/,'.geo-'+hash(out).slice(0,10)+'.js');write('pmh',next,out,'Correct active Eglin code without mutating the old hashed asset');
 for(const htmlFile of htmlFiles){const p=relative(join(candidate,'pmh'),htmlFile).replaceAll('\\','/'),h=readFileSync(htmlFile,'utf8').replaceAll('/'+path,'/'+next);write('pmh',p,h,'Reference corrected active script');}
}
// Keep the source blog metadata and bodies from reintroducing an obsolete title or claim.
for(const [slug,spec] of Object.entries(FINANCIAL_GUIDES).filter(([s])=>s.startsWith('blog/'))){const file='content/'+slug+'.fragment.html',old=readFileSync(file,'utf8'),match=old.match(/<!--PAGE\s*([\s\S]*?)\s*PAGE-->/),meta=JSON.parse(match[1]);Object.assign(meta,{title:spec.title,description:spec.description,h1:spec.h1,lead:spec.lead,excerpt:spec.quickAnswer,quickAnswer:spec.quickAnswer,faq:spec.faq,dateModified:'2026-09-08',readTime:'6 min'});writeFileSync(file,'<!--PAGE\n'+JSON.stringify(meta,null,2)+'\nPAGE-->\n'+financialBody(slug));}
for(const site of ['pmh','gc']){
 const paths=new Set(site==='pmh'?[...Object.keys(FINANCIAL_GUIDES),'va-loan-guide','bah-to-mortgage-guide']:['resources/coastal-ownership-costs']);
 const update=text=>text.replace(/<url>[\s\S]*?<\/url>/g,block=>paths.has(block.match(/<loc>https:\/\/[^/]+\/([^<]+)<\/loc>/)?.[1])?block.replace(/<lastmod>[^<]+<\/lastmod>/,'<lastmod>2026-09-08</lastmod>'):block);
 const sitemap=readFileSync(join(baseline,site,'sitemap.xml'),'utf8'),next=update(sitemap);if(next!==sitemap)write(site,'sitemap.xml',next,'Substantive content review dates');
 const source=join(site==='pmh'?'public':'civilian-site','sitemap.xml'),s=readFileSync(source,'utf8');if(update(s)!==s)writeFileSync(source,update(s));
}
// Keep blog cards, discovery metadata and the public blog feed aligned with the two reviewed posts.
for(const path of ['blog.html','blog/index.json']) {
 const update=text=>{
  if(path.endsWith('.json')){const rows=JSON.parse(text);for(const row of rows){const spec=FINANCIAL_GUIDES['blog/'+row.slug];if(spec)Object.assign(row,{title:spec.title,excerpt:spec.quickAnswer,dateModified:'2026-09-08',readTime:'6 min'});}return JSON.stringify(rows,null,2)+'\n';}
  let h=mapSchema(text,node=>{const url=node.url||node.mainEntityOfPage||'',slug=typeof url==='string'?url.replace('https://pensacolamilitaryhousing.com/',''):'',spec=FINANCIAL_GUIDES[slug];if(spec){node.headline=spec.h1;node.description=spec.description;node.dateModified='2026-09-08';}});
  for(const [slug,spec] of Object.entries(FINANCIAL_GUIDES).filter(([s])=>s.startsWith('blog/'))){const id=slug.slice(5);h=h.replace(new RegExp('<article class="blog-card" id="'+id+'">[\\s\\S]*?<\\/article>'),card=>card.replace(/(<h2[^>]*><a[^>]*>)[\s\S]*?(<\/a><\/h2>)/,(_,a,z)=>a+e(spec.title)+z).replace(/(<p class="excerpt">)[\s\S]*?(<\/p>)/,(_,a,z)=>a+e(spec.quickAnswer)+z).replace(/\d+ min read/, '6 min read').replace(/Updated [A-Za-z]+ \d+, \d{4}/,'Updated September 8, 2026'));}return h;
 };
 const old=readFileSync(join(baseline,'pmh',path),'utf8'),next=update(old);if(next!==old)write('pmh',path,next,'Align blog cards and feed with reviewed post content');
 const source='public/'+path,oldSource=readFileSync(source,'utf8'),nextSource=update(oldSource);if(nextSource!==oldSource)writeFileSync(source,nextSource);
}
const unique=[...new Map(changes.map(c=>[c.site+':'+c.path,c])).values()];
for(const c of unique){const f=join(candidate,c.site,c.path);c.sha256=hash(readFileSync(f));}
const record={preparedAt:new Date().toISOString(),baseline,candidate,productionBefore:before.sites.map(({site,deploymentId})=>({site,deploymentId})),changes:unique,limits:'ZIP study, other financial guides and performance outcomes remain separate review items. No loan approval, authenticated inquiry result or search ranking is implied.'};
writeFileSync(evidence+'/candidate-manifest.json',JSON.stringify(record,null,2)+'\n');writeFileSync(evidence+'/community-changes.json',JSON.stringify(communityChanges,null,2)+'\n');console.log(JSON.stringify({candidate,changes:unique.length,html:unique.filter(c=>c.path.endsWith('.html')).length,communities:communityChanges.length},null,2));
