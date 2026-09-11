// Read-only live and internal-discovery observations for a small named URL cohort.
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {join,relative,resolve} from 'node:path';
import {walk} from './isolated-release-lib.mjs';
const arg=(k,f)=>process.argv.includes(k)?process.argv[process.argv.indexOf(k)+1]:f;
const cohort=JSON.parse(readFileSync('content/geo/civilian-discovery-cohort.json'));
const root=resolve(arg('--root','.coast-release/geo-20260910/baseline/gc'));
const output=resolve(arg('--out','docs/geo-execution-2026-09-10/discovery-before.json'));
const sitemap=readFileSync(join(root,'sitemap.xml'),'utf8');
const html=walk(root).filter(p=>p.endsWith('.html')&&!p.endsWith('404.html')).map(file=>({path:'/'+relative(root,file).replaceAll('\\','/').replace(/index\.html$/,'').replace(/\.html$/,''),html:readFileSync(file,'utf8')}));
const norm=p=>p.replace(/\.html$/,'').replace(/\/$/,'')||'/';
const canonical=h=>h.match(/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*\bhref=["']([^"']+)/i)?.[1];
const records=[];
for(const path of cohort.paths){
 const url=cohort.domain+path,links=[];
 for(const page of html){
  if(norm(page.path)===norm(path))continue;
  const main=page.html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1]||'';
  let found=false,inMain=false;
  for(const [body,isMain]of [[page.html,false],[main,true]])for(const m of body.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi))try{const u=new URL(m[1],cohort.domain);if(u.origin===cohort.domain&&norm(u.pathname)===path){found=true;if(isMain)inMain=true;}}catch{}
  if(found)links.push({path:page.path,main:inMain});
 }
 const record={url,observedAt:new Date().toISOString(),sitemapIncluded:sitemap.includes(`<loc>${url}</loc>`),inboundPages:links.length,mainContentInboundPages:links.filter(l=>l.main).map(l=>l.path),google:{status:'requires-signed-in-URL-inspection',selectedCanonical:null},links};
 try{const r=await fetch(url,{redirect:'follow',signal:AbortSignal.timeout(30000)}),body=await r.text();Object.assign(record,{httpStatus:r.status,finalUrl:r.url,canonical:canonical(body),noindex:/<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(body)||/noindex/i.test(r.headers.get('x-robots-tag')||''),h1Count:(body.match(/<h1\b/gi)||[]).length});record.technicallyEligible=r.ok&&r.url===url&&record.canonical===url&&!record.noindex&&record.h1Count===1&&record.sitemapIncluded&&record.inboundPages>0;}catch(e){record.error=e.message;record.technicallyEligible=false;}
 if(process.env.BING_WEBMASTER_API_KEY){try{const endpoint=new URL('https://ssl.bing.com/webmaster/api.svc/json/GetUrlInfo');for(const[k,v]of Object.entries({siteUrl:cohort.domain+'/',url,apikey:process.env.BING_WEBMASTER_API_KEY}))endpoint.searchParams.set(k,v);const r=await fetch(endpoint,{signal:AbortSignal.timeout(25000)});record.bing={observedAt:new Date().toISOString(),httpStatus:r.status,response:await r.json()};}catch(e){record.bing={error:e.message.replace(/apikey=[^&\s]+/gi,'apikey=[redacted]')};}}
 records.push(record);console.log(`${path}: HTTP ${record.httpStatus}; self canonical ${record.canonical===url}; ${links.length} inbound pages (${links.filter(l=>l.main).length} in main content)`);
}
let sitemapLive;try{const r=await fetch(cohort.domain+'/sitemap.xml',{signal:AbortSignal.timeout(30000)});const body=await r.text();sitemapLive={httpStatus:r.status,allCohortUrlsPresent:cohort.paths.every(p=>body.includes(`<loc>${cohort.domain+p}</loc>`))};}catch(e){sitemapLive={error:e.message};}
mkdirSync(resolve(output,'..'),{recursive:true});writeFileSync(output,JSON.stringify({checkedAt:new Date().toISOString(),root,readOnly:true,sitemapLive,records},null,2)+'\n');
if(records.some(r=>!r.technicallyEligible)||!sitemapLive.allCohortUrlsPresent)process.exitCode=1;
