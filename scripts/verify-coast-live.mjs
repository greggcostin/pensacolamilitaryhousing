// Read back every public sitemap page against the reviewed local candidate.
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
const args=process.argv.slice(2),arg=(name,fallback)=>args.includes(name)?args[args.indexOf(name)+1]:fallback;
const dir=arg('--out','docs/seo-geo-2026-09-06/projects/01-foundation');
const manifest=JSON.parse(readFileSync(arg('--manifest','docs/seo-geo-2026-09-06/candidate-manifest.json'),'utf8'));
const domains={pmh:'https://pensacolamilitaryhousing.com',gc:'https://greggcostin.com'};
const hash=b=>createHash('sha256').update(b).digest('hex');
const ld=html=>[...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map(m=>JSON.parse(m[1]));
const canonical=html=>html.match(/<link\b(?=[^>]*rel=["']canonical["'])[^>]*href=["']([^"']+)["']/i)?.[1];
const results=[],failures=[];
async function get(url){let last;for(let attempt=0;attempt<2;attempt++){try{const r=await fetch(url,{signal:AbortSignal.timeout(25000),headers:{'User-Agent':'CostinReleaseVerification/1.0'}});return {status:r.status,finalUrl:r.url,body:await r.text(),headers:{contentType:r.headers.get('content-type'),robots:r.headers.get('x-robots-tag')}};}catch(e){last=e;}}throw last;}
for(const [site,origin] of Object.entries(domains)){
 const map=await get(origin+'/sitemap.xml');
 const expectedMap=readFileSync(join(manifest.candidate,site,'sitemap.xml'),'utf8');
 if(map.status!==200||map.body.replaceAll('\r\n','\n')!==expectedMap.replaceAll('\r\n','\n'))failures.push({site,issue:'Published sitemap differs from release'});
 const urls=[...new Set([...expectedMap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]))].filter(url=>!new URL(url).pathname.match(/\.(txt|xml|json|pdf)$/));
 let cursor=0;
 await Promise.all(Array.from({length:6},async()=>{while(cursor<urls.length){const url=urls[cursor++],path=new URL(url).pathname,file=join(manifest.candidate,site,path==='/'?'index.html':path.replace(/^\//,'')+'.html');const findings=[];try{
  if(!existsSync(file))throw Error('Expected candidate page absent');
  const expected=readFileSync(file,'utf8'),actual=await get(url);
  if(actual.status!==200)findings.push('HTTP '+actual.status);
  if(canonical(actual.body)!==url)findings.push('Canonical mismatch');
  if(/noindex/i.test(actual.headers.robots||'')||/<meta\b(?=[^>]*name=["']robots["'])(?=[^>]*content=["'][^"']*noindex)[^>]*>/i.test(actual.body))findings.push('Public noindex');
  if(JSON.stringify(ld(actual.body))!==JSON.stringify(ld(expected)))findings.push('Structured data differs from candidate');
  // Cloudflare injects its email decoder before the first body script. Remove only
  // that known platform tag when comparing the otherwise exact answer sections.
  const geoSections=h=>[...h.replaceAll('\r\n','\n').replace(/<script data-cfasync="false" src="\/cdn-cgi\/scripts\/[a-f0-9]+\/cloudflare-static\/email-decode\.min\.js"><\/script>/g,'').matchAll(/<section\b[^>]*data-(?:geo-(?:guide|installation|region)|financial-guide|community-budget|financial-connection)=["'][^"']+["'][^>]*>[\s\S]*?<\/section>/g)].map(m=>m[0]);
  if(JSON.stringify(geoSections(actual.body))!==JSON.stringify(geoSections(expected)))findings.push('Reviewed GEO answer section differs from candidate');
  if(!actual.body.includes('data-business-record'))findings.push('Shared record link absent');
  if(site==='pmh'&&path==='/'&&!actual.body.includes("Pensacola&#39;s #1")&&!actual.body.includes("Pensacola's #1"))findings.push('#1 statement absent');
  results.push({site,url,status:actual.status,canonical:canonical(actual.body),schemaBlocks:ld(actual.body).length,findings});
 }catch(e){findings.push(e.message);results.push({site,url,status:null,findings});}}}));
 for(const suffix of ['/foundation-check-nonexistent-20260907','/missing-foundation-page-20260907']){const r=await get(origin+suffix);if(r.status!==404)failures.push({site,issue:'Missing URL must return 404',url:origin+suffix,status:r.status});}
 const record=await get(origin+'/data/gregg-costin.json'),expectedRecord=readFileSync(join(manifest.candidate,site,'data/gregg-costin.json'),'utf8');
 if(record.status!==200||hash(record.body)!==hash(expectedRecord))failures.push({site,issue:'Public professional record differs'});
}
const search=await get(domains.pmh+'/pagefind/pagefind-entry.json');const index=JSON.parse(search.body);
if(search.status!==200||Object.keys(index.languages).join(',')!=='en'||index.languages.en.page_count!==374)failures.push({issue:'Public English search index differs',languages:index.languages});
const report={checkedAt:new Date().toISOString(),candidate:manifest.candidate,method:'Public HTTP readback of complete sitemap; compare canonical, robots, JSON-LD and shared record against reviewed candidate. Cloudflare upload hashes are checked separately.',pagesChecked:results.length,sites:Object.keys(domains).map(site=>({site,pages:results.filter(r=>r.site===site).length,successful:results.filter(r=>r.site===site&&r.status===200).length})),pageFindings:results.filter(r=>r.findings.length),otherFindings:failures,searchLanguages:Object.keys(index.languages),searchPages:index.languages.en?.page_count,ok:!failures.length&&results.every(r=>!r.findings.length),pages:results};
writeFileSync(join(dir,'live-verification.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({...report,pages:undefined},null,2));if(!report.ok)process.exitCode=1;
