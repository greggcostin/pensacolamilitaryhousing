import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {schoolAudience} from './school-audience-lib.mjs';
const root='docs/geo-execution-2026-09-10/guidance-sources';mkdirSync(root,{recursive:true});
const nav=JSON.parse(readFileSync('content/communities/navarre-cost-evidence.json','utf8'));
const urls=[...new Set([...schoolAudience.schools.flatMap(s=>s.sources.map(r=>r.url)),nav.water.source,nav.lease.source,nav.tax.source])];
urls.push(...['21656 Coastal Gateway Boulevard Gulf Shores AL 36542','600 East 15th Ave Gulf Shores AL 36542'].map(a=>'https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?address='+encodeURIComponent(a)+'&benchmark=Public_AR_Current&format=json'));
const results=[];
for(let i=0;i<urls.length;i+=4)await Promise.all(urls.slice(i,i+4).map(async url=>{
 const id=createHash('sha256').update(url).digest('hex').slice(0,16);try{
  const r=await fetch(url,{signal:AbortSignal.timeout(25000)}),body=Buffer.from(await r.arrayBuffer()),path=root+'/'+id+(r.headers.get('content-type')?.includes('pdf')?'.pdf':url.includes('geocoding.geo.census.gov')?'.json':'.html');
  writeFileSync(path,body);results.push({url,finalUrl:r.url,status:r.status,path,bytes:body.length,sha256:createHash('sha256').update(body).digest('hex')});
 }catch(e){results.push({url,error:e.message});}
}));
writeFileSync(root+'/capture.json',JSON.stringify({checkedAt:new Date().toISOString(),results},null,2)+'\n');
console.log(JSON.stringify(results.map(r=>({url:r.url,status:r.status,error:r.error,...(r.url.includes('geocoding.geo.census.gov')&&r.status===200?{matches:JSON.parse(readFileSync(r.path,'utf8')).result.addressMatches}: {})})),null,2));
