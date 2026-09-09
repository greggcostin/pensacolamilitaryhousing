// Release gate for the shared school hub facts, rendered answers, exports and preservation.
import {readFileSync,writeFileSync,readdirSync,existsSync,mkdirSync} from 'node:fs';
import {join,relative,extname,dirname} from 'node:path';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import sharp from 'sharp';
import {unbundleCivilianStyles} from './civilian-style-bundle.mjs';
import {refreshEntityHtml} from './entity-sync-lib.mjs';
import {enhanceSchoolHub,schoolCoverage,schoolExport,schoolHubFaq,schoolHeaderLabel,SCHOOL_ORIGINS,SCHOOL_REVIEW_DATE} from './school-hub-seo-lib.mjs';
// --source validates a clean checkout without private deployment receipts. The
// default release mode additionally compares every asset with its saved baseline.
const sourceMode=process.argv.includes('--source');
const release=sourceMode?null:JSON.parse(readFileSync('docs/school-seo-2026-09-08/candidate.json','utf8'));
// Build first so the military edition includes its real SPA shells and assets.
const roots=sourceMode?{gc:'civilian-site',pmh:'dist'}:{gc:join(release.candidate,'gc'),pmh:join(release.candidate,'pmh')};
const data=JSON.parse(readFileSync(join(roots.gc,'assets/school-finder-data.json'),'utf8'));
const coverage=schoolCoverage(data),checks=[],findings=[];
const read=p=>readFileSync(p,'utf8');
const hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const walk=p=>readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(p,e.name)):[join(p,e.name)]);
const decode=s=>s.replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&nbsp;/g,' ');
const visible=s=>decode(s.replace(/<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>/g,'').replace(/<[^>]+>/g,' ')).replace(/\s+/g,' ').trim();
const check=(name,ok,detail)=>{checks.push({name,ok:!!ok,...(detail===undefined?{}:{detail})});if(!ok)findings.push({name,detail});};
const mutable=new Set(['schools.html','data/school-finder.json','data/school-finder.csv','og/schools.png','sitemap.xml','llms.txt','llms-full.txt','_headers']);
const report={checkedAt:new Date().toISOString(),mode:sourceMode?'source-consistency':'release-preservation',checks,findings,sites:{},measuredSearchOutcome:'Not measured; this gate proves technical and content consistency only.'};
for(const site of ['gc','pmh']){
  const root=roots[site],base=sourceMode?null:join(release.baseline,site),path=join(root,'schools.html'),html=read(path),before=sourceMode?null:read(join(base,'schools.html'));
  const url=SCHOOL_ORIGINS[site]+'/schools';
  const schema=[...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].flatMap(m=>{try{const n=JSON.parse(m[1]);return n['@graph']||[n];}catch{findings.push({name:site+' invalid JSON-LD'});return [];}});
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  const title=decode(html.match(/<title>([^<]+)<\/title>/)?.[1]||''),description=decode(html.match(/<meta name="description" content="([^"]+)"/)?.[1]||'');
  check(site+' one page heading and unique DOM IDs',(html.match(/<h1\b/g)||[]).length===1&&new Set(ids).size===ids.length);
  check(site+' title and description length',title.length>=35&&title.length<=65&&description.length>=100&&description.length<=165,{title:title.length,description:description.length});
  check(site+' self canonical and crawlable',html.includes('rel="canonical" href="'+url+'"')&&!/name="robots"[^>]*noindex/.test(html));
  check(site+' crawlable school directory',coverage.guideRows.every(s=>html.includes('href="'+s.reportUrl+'"')&&existsSync(join(root,s.reportUrl.slice(1)+'.html'))));
  check(site+' county anchors',coverage.counties.every(c=>ids.includes(c.anchor)));
  check(site+' graph types',['CollectionPage','Dataset','WebApplication','ItemList','FAQPage','BreadcrumbList'].every(t=>schema.some(n=>n['@type']===t)));
  const page=schema.find(n=>n['@type']==='CollectionPage'),dataset=schema.find(n=>n['@type']==='Dataset'),faqs=schema.find(n=>n['@type']==='FAQPage');
  check(site+' page identity and truthful dates',page?.url===url&&page?.dateModified===SCHOOL_REVIEW_DATE&&dataset?.dateModified===data.builtAt.slice(0,10));
  check(site+' shared dataset identity',page?.mainEntity?.['@id']===SCHOOL_ORIGINS.gc+'/schools#school-dataset'&&dataset?.['@id']===page?.mainEntity?.['@id']);
  const detailBlocks=[...html.matchAll(/<details\b[^>]*>([\s\S]*?)<\/details>/g)];
  check(site+' all FAQ questions and answers mirror HTML',schoolHubFaq(data,site).every(q=>{
    const element=detailBlocks.find(m=>visible(m[1].match(/<summary[^>]*>([\s\S]*?)<\/summary>/)?.[1]||'')===q.q);
    return element&&visible(element[1].replace(/<summary[^>]*>[\s\S]*?<\/summary>/,''))===q.a&&faqs?.mainEntity.some(n=>n.name===q.q&&n.acceptedAnswer?.text===q.a);
  }));
  const exported=JSON.parse(read(join(root,'data/school-finder.json')));
  check(site+' exported records retain original facts',exported.records.length===data.schools.length&&exported.records.every((r,i)=>Object.entries(r).every(([key,value])=>value===(data.schools[i][key]??null))));
  check(site+' record/guide counts distinguish duplicates',exported.coverage.records===274&&exported.coverage.guides===271&&coverage.counties.reduce((n,c)=>n+c.guides,0)===coverage.guides&&new Set(exported.records.map(s=>s.id)).size===274);
  if(!sourceMode){
  const preserved=walk(base).filter(p=>!mutable.has(relative(base,p).replaceAll('\\','/'))&&!relative(base,p).replaceAll('\\','/').startsWith('pagefind/'));
  const identityOnly=(original,updated)=>{
    if(!original.endsWith('.html')||original.endsWith('404.html'))return false;
    const source=read(original),marked=original===join(base,'index.html')?source:source.replace('data-entity="entity-graph:home"','data-entity="entity-graph:references"');
    const identity=refreshEntityHtml(marked,{site});
    return (site==='gc'?schoolHeaderLabel(identity):identity)===read(updated);
  };
  check(site+' published assets preserved or scoped identity/header edits only',preserved.every(p=>{const target=join(root,relative(base,p));return existsSync(target)&&(hash(p)===hash(target)||identityOnly(p,target));}),{assets:preserved.length});
  check(site+' no unexpected additions or edits',walk(root).every(p=>{const rel=relative(root,p).replaceAll('\\','/'),old=join(base,rel);return mutable.has(rel)||rel.startsWith('pagefind/')||(existsSync(old)&&(hash(p)===hash(old)||identityOnly(old,p)));}));
  const executable=h=>[...h.matchAll(/<script\b(?![^>]*application\/ld\+json)[^>]*>[\s\S]*?<\/script>/g)].map(m=>m[0]);
  check(site+' original map and tracking scripts unchanged',JSON.stringify(executable(html))===JSON.stringify(executable(before)));
  }
  const newBody=[...html.matchAll(/<!-- SCHOOL_SEO_(SUMMARY|DETAILS|FAQ)_START -->([\s\S]*?)<!-- SCHOOL_SEO_\1_END -->/g)].map(m=>m[2]).join('');
  check(site+' no unsupported exclusivity or em/en dashes',!/[\u2013\u2014]|only (?:school )?map|best school|number one|#1/i.test(visible(newBody)));
  const bundled=html.includes('data-costin-style-bundle=');
  const editable=bundled?unbundleCivilianStyles(html,root):html;
  const rendered=enhanceSchoolHub(editable,data,site);
  check(site+' stable repeated rendering after editable-style restoration',enhanceSchoolHub(rendered,data,site).replace(/\r\n/g,'\n')===rendered.replace(/\r\n/g,'\n')&&(bundled||rendered.replace(/\r\n/g,'\n')===html.replace(/\r\n/g,'\n')));
  if(site==='gc')check('Civilian header label is School Finder throughout',walk(root).filter(p=>p.endsWith('.html')&&!p.endsWith('404.html')).every(p=>schoolHeaderLabel(read(p))===read(p)));
  const localLinks=[...newBody.matchAll(/href="([^"]+)"/g)].map(m=>decode(m[1]));
  check(site+' all new same-site links resolve',localLinks.every(href=>{const u=new URL(href,url);if(u.origin!==SCHOOL_ORIGINS[site])return true;if(u.pathname==='/schools'&&u.hash)return ids.includes(u.hash.slice(1));const p=u.pathname==='/'?'index.html':u.pathname.slice(1)+(extname(u.pathname)?'':'.html');return existsSync(join(root,p));}));
  check(site+' AI discovery documents include current resource',['llms.txt','llms-full.txt'].every(p=>read(join(root,p)).includes(url+'#school-data-methodology')&&read(join(root,p)).includes('274 source records, 271 school guides')));
  const image=await sharp(join(root,'og/schools.png')).metadata();check(site+' 1200x630 school share card',image.width===1200&&image.height===630);
  report.sites[site]={title,description,htmlBytes:Buffer.byteLength(html),htmlGzipBytes:gzipSync(html).length,addedGzipBytes:sourceMode?null:gzipSync(html).length-gzipSync(before).length,guides:coverage.guides,faqPairs:schoolHubFaq(data,site).length,schoolDataHash:hash(join(root,site==='gc'?'assets/school-finder-data.json':'school-assets/school-finder-data.json'))};
}
check('Both original map datasets identical across platform line endings',read(join(roots.gc,'assets/school-finder-data.json')).replace(/\r\n/g,'\n')===read(join(roots.pmh,'school-assets/school-finder-data.json')).replace(/\r\n/g,'\n'));
for(const name of ['json','csv'])check('Both '+name+' exports identical',hash(join(roots.gc,'data/school-finder.'+name))===hash(join(roots.pmh,'data/school-finder.'+name)));
const csv=schoolExport(data).csv;check('CSV retains numeric negative coordinates without spreadsheet text prefix',csv.includes(',"'+data.schools.find(s=>s.lng!==null).lng+'",')&&!/,"\'-87\./.test(csv));
const output=sourceMode?'artifacts/school-source-verification.json':'docs/school-seo-2026-09-08/verification.json';
report.ok=!findings.length;mkdirSync(dirname(output),{recursive:true});writeFileSync(output,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({ok:report.ok,mode:report.mode,checks:checks.length,findings,sites:report.sites},null,2));if(!report.ok)process.exitCode=1;
