// Read-only checks of the actual custom domains, not just a successful upload receipt.
import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {SCHOOL_ORIGINS} from './school-hub-seo-lib.mjs';
const directory='docs/school-seo-2026-09-08';
const candidate=JSON.parse(readFileSync(join(directory,'candidate.json'),'utf8'));
const checks=[];
const check=(name,ok,detail)=>checks.push({name,ok:!!ok,...(detail===undefined?{}:{detail})});
const hash=b=>createHash('sha256').update(b).digest('hex');
const get=async url=>{
  const response=await fetch(url,{redirect:'manual',headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(30000)});
  const bytes=Buffer.from(await response.arrayBuffer());
  return {status:response.status,contentType:response.headers.get('content-type'),robots:response.headers.get('x-robots-tag'),location:response.headers.get('location'),bytes,text:bytes.toString('utf8')};
};
for(const [site,origin] of Object.entries(SCHOOL_ORIGINS)){
  const root=join(candidate.candidate,site);
  const [hub,json,csv,card,map,robots,home]=await Promise.all([
    '/schools','/data/school-finder.json','/data/school-finder.csv','/og/schools.png',
    site==='gc'?'/assets/school-finder-data.json':'/school-assets/school-finder-data.json','/robots.txt','/',
  ].map(path=>get(origin+path)));
  check(site+' hub responds with crawlable HTML',hub.status===200&&/text\/html/.test(hub.contentType)&&!hub.robots?.includes('noindex'));
  const local=readFileSync(join(root,'schools.html'),'utf8');
  const title=h=>h.match(/<title>([^<]+)<\/title>/)?.[1];
  check(site+' published title matches candidate',title(hub.text)===title(local),title(hub.text));
  check(site+' published canonical',hub.text.includes('rel="canonical" href="'+origin+'/schools"'));
  const schema=[...hub.text.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].flatMap(m=>{const n=JSON.parse(m[1]);return n['@graph']||[n];});
  check(site+' live structured data types',['CollectionPage','Dataset','WebApplication','FAQPage','BreadcrumbList','ItemList'].every(t=>schema.some(n=>n['@type']===t)));
  const collection=schema.find(n=>n['@type']==='CollectionPage'),dataset=schema.find(n=>n['@type']==='Dataset');
  check(site+' current review and actual source dates',collection?.dateModified==='2026-09-08'&&dataset?.dateModified==='2026-09-06');
  const links=new Set([...hub.text.matchAll(/href="(\/schools\/[^"#?]+)"/g)].map(m=>m[1]));
  check(site+' all school guides are present in server HTML',links.size===271,{guides:links.size});
  check(site+' published source and FAQ sections',['school-data-methodology','school-dataset','school-finder-faq','school-data-sources'].every(id=>hub.text.includes('id="'+id+'"')));
  for(const [format,result] of [['json',json],['csv',csv]]){
    check(site+' '+format+' download bytes and MIME',result.status===200&&result.contentType?.startsWith(format==='json'?'application/json':'text/csv')&&hash(result.bytes)===hash(readFileSync(join(root,'data/school-finder.'+format))),{httpStatus:result.status,contentType:result.contentType,sha256:hash(result.bytes)});
  }
  const exported=JSON.parse(json.text);
  check(site+' live export counts',exported.records.length===274&&exported.coverage.guides===271);
  check(site+' share card deployed exactly',card.status===200&&hash(card.bytes)===hash(readFileSync(join(root,'og/schools.png'))));
  check(site+' original map data deployed exactly',map.status===200&&hash(map.bytes)===hash(readFileSync(join(root,site==='gc'?'assets/school-finder-data.json':'school-assets/school-finder-data.json'))));
  check(site+' robots allows school resource',robots.status===200&&!/^Disallow:\s*\/(?:schools|data\/school-finder|\s*$)/im.test(robots.text));
  if(site==='gc')check('Civilian homepage header has School Finder',home.status===200&&/<a\b[^>]*href="\/schools"[^>]*>School Finder<\/a>/.test(home.text));
}
const report={checkedAt:new Date().toISOString(),readOnly:true,checks,ok:checks.every(c=>c.ok)};
writeFileSync(join(directory,'live-verification.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({ok:report.ok,checks:checks.length,findings:checks.filter(c=>!c.ok)},null,2));if(!report.ok)process.exitCode=1;
