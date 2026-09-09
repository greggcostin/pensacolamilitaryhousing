// Read-only checks of the actual public URLs after the pinned release succeeds.
import {readFileSync,writeFileSync} from 'node:fs';
import {resourceGroups} from './civilian-resource-library.mjs';
const dir='docs/worldclass-roadmap-2026-09-08';
const receipt=JSON.parse(readFileSync(dir+'/publication.json','utf8'));
if(receipt.status!=='published_and_manifest_verified')throw Error('Publication not verified.');
const urls=[...new Set(['https://greggcostin.com/','https://greggcostin.com/resources','https://greggcostin.com/photo-credits','https://greggcostin.com/schools','https://greggcostin.com/schools/bagdad-elementary-school','https://pensacolamilitaryhousing.com/schools',...resourceGroups.flatMap(g=>g.links).map(([,url])=>new URL(url,'https://greggcostin.com').href.split('#')[0])])];
const pages=[],findings=[];
async function check(url){
 try{
  const r=await fetch(url,{signal:AbortSignal.timeout(25000)}),h=await r.text();
  const canonical=h.match(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1];
  const entry={url,status:r.status,finalUrl:r.url,title:h.match(/<title>([^<]*)<\/title>/)?.[1],canonical,noindex:/noindex/i.test(r.headers.get('x-robots-tag')||'')||/<meta\b(?=[^>]*name="robots")(?=[^>]*content="[^"]*noindex)/i.test(h)};
  if(r.status!==200||entry.noindex)findings.push({url,issue:'Status or indexing permission',status:r.status,noindex:entry.noindex});
  if(canonical?.replace(/\/$/,'')!==url.replace(/\/$/,''))findings.push({url,issue:'Canonical mismatch',canonical});
  if(url==='https://greggcostin.com/'){
   entry.featuredRegions=(h.match(/class="gc-region-card(?:\s|")/g)||[]).length;entry.visibleAreaCards=(h.match(/class="area-card"/g)||[]).length;
   if(entry.featuredRegions!==6||entry.visibleAreaCards!==16||!h.includes('/assets/costin-resource-library.css'))findings.push({url,issue:'New homepage not served'});
  }
  if(url==='https://greggcostin.com/resources'){
   entry.decisionGroups=resourceGroups.filter(g=>h.includes('id="'+g.id+'"')).length;
   if(entry.decisionGroups!==5||!h.includes('274 school records · 264 mapped'))findings.push({url,issue:'New resource library not served'});
  }
  return entry;
 }catch(e){findings.push({url,issue:e.message});return{url,error:e.message};}
}
for(let i=0;i<urls.length;i+=5)pages.push(...await Promise.all(urls.slice(i,i+5).map(check)));
const missingUrl='https://greggcostin.com/__worldclass-not-a-page-20260908';
const missing=await fetch(missingUrl,{signal:AbortSignal.timeout(20000)});if(missing.status!==404)findings.push({url:missingUrl,issue:'Unknown URL did not return 404',status:missing.status});
const result={checkedAt:new Date().toISOString(),deploymentId:receipt.deploymentId,pages,unknownPathStatus:missing.status,findings,ok:findings.length===0,limits:'HTTP status, deployed content and canonical/indexing permissions. This does not establish indexing, rankings, analytics delivery or lead conversion.'};
writeFileSync(dir+'/live-verification.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({checkedAt:result.checkedAt,pages:pages.length,unknownPathStatus:missing.status,findings,ok:result.ok},null,2));if(!result.ok)process.exitCode=1;
