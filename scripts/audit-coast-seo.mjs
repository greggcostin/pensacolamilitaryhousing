// Read-only SEO evidence collection. Run from the repository root.
// node scripts/audit-coast-seo.mjs [--live] [--out docs/seo-geo-2026-09-06]
// HTML inspection is not proof of indexing, rankings, verified bot access or rendered layout.
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const args = process.argv.slice(2);
const out = args.includes('--out') ? args[args.indexOf('--out') + 1] : 'docs/seo-geo-2026-09-06';
mkdirSync(out, { recursive: true });
const hash = text => createHash('sha256').update(text).digest('hex');
const decode = s => s.replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#0?39;|&apos;/g,"'").replace(/&nbsp;/g,' ').replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(+n));
const strip = s => decode(s.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>|<style\b[^>]*>[\s\S]*?<\/style\s*>|<!--[\s\S]*?-->/gi,' ').replace(/<[^>]+>/g,' ')).replace(/\s+/g,' ').trim();
function attr(tag,name) { return decode(tag.match(new RegExp('\\b'+name+'\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\'|([^\\s>]+))','i'))?.slice(1).find(x=>x!==undefined) || ''); }
function inspect(html,url) {
  const metas = [...html.matchAll(/<meta\b[^>]*>/gi)].map(m=>m[0]);
  const meta = name => metas.filter(t=>[attr(t,'name'),attr(t,'property')].some(x=>x.toLowerCase()===name)).map(t=>attr(t,'content'));
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)].filter(m=>attr(m[1],'type').toLowerCase()==='application/ld+json');
  const schemas=[], errors=[]; for(const [i,m] of scripts.entries()) {try{ schemas.push(JSON.parse(m[2])); }catch(e){ errors.push({block:i+1,error:e.message.slice(0,180)});}}
  const nodes=[]; function walk(x){if(!x||typeof x!=='object')return; if(x['@type'])nodes.push(x); for(const v of Object.values(x))if(v&&typeof v==='object')Array.isArray(v)?v.forEach(walk):walk(v);} schemas.forEach(walk);
  const links=[...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a\s*>/gi)].map(m=>{try{return {url:new URL(attr(m[1],'href'),url).href,label:strip(m[2]).slice(0,140)};}catch{return null;}}).filter(Boolean);
  const body=html.match(/<body\b[^>]*>([\s\S]*)<\/body>/i)?.[1] || html;
  const main=html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] || body;
  const text=strip(main);
  const headings=[...html.matchAll(/<h([1-3])\b[^>]*>([\s\S]*?)<\/h\1>/gi)].map(m=>({level:+m[1],text:strip(m[2])}));
  const canonicals=[...html.matchAll(/<link\b[^>]*>/gi)].map(m=>m[0]).filter(t=>attr(t,'rel').toLowerCase()==='canonical').map(t=>attr(t,'href'));
  const images=[...html.matchAll(/<img\b[^>]*>/gi)].map(m=>({src:attr(m[0],'src'),alt:attr(m[0],'alt'),hasAlt:/\balt\s*=/i.test(m[0]),width:attr(m[0],'width'),height:attr(m[0],'height'),loading:attr(m[0],'loading')}));
  return {url,sha256:hash(html),bytes:Buffer.byteLength(html),title:strip(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]||''),description:meta('description'),canonicals,robots:meta('robots'),h1:headings.filter(x=>x.level===1).map(x=>x.text),headings,mainWords:text?text.split(/\s+/).length:0,opening:text.slice(0,550),schemaTypes:[...new Set(nodes.flatMap(n=>n['@type']))],schemaErrors:errors,schemaIds:[...new Set(nodes.map(n=>n['@id']).filter(Boolean))],dateModified:[...new Set(nodes.map(n=>n.dateModified).filter(Boolean))],ogTitle:meta('og:title'),ogImage:meta('og:image'),links,images,formCount:(html.match(/<form\b/gi)||[]).length,videoCount:(html.match(/<video\b/gi)||[]).length,flags:{quickAnswer:/quick-answer/i.test(html),hasHoneypot:/_gotcha/.test(html),hasLeadEvent:/generate_lead/.test(html),oldEglinCode:/FL023/.test(html),lodgingWindow:/(?:TLA|TLF|TLE)[\s\S]{0,180}(?:10.to.14|14.day|10.day)/i.test(text),numberOne:/#1|number.one/i.test(text),crossSite:links.some(l=>l.url.startsWith(url.includes('pensacolamilitaryhousing.com')?'https://greggcostin.com':'https://pensacolamilitaryhousing.com'))}};
}
function walkFiles(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walkFiles(join(dir,e.name)):e.name.endsWith('.html')?[join(dir,e.name)]:[]);}
function canonicalPath(file,dir){let p=file.replaceAll('\\','/').slice(dir.length).replace(/\.html$/,''); if(p==='/index')p='/'; return p;}
const sites=[{id:'pmh',origin:'https://pensacolamilitaryhousing.com',dir:'public'},{id:'gc',origin:'https://greggcostin.com',dir:'civilian-site'}];
const local=[];
for(const s of sites){
  const files=walkFiles(s.dir).filter(f=>!/[\\/](pagefind|downloads|assets)[\\/]/.test(f));
  if(s.id==='pmh')files.push('index.html');
  for(const file of files){const url=s.origin+(file==='index.html'?'/':canonicalPath(file,s.dir)); local.push({site:s.id,file,...inspect(readFileSync(file,'utf8'),url)});}
}
const at=new Date().toISOString();
writeFileSync(join(out,'local-inventory.json'),JSON.stringify({collectedAt:at,method:'Current source HTML, including unpublished edits; React deep-route shells are checked in production build separately.',pages:local},null,2)+'\n');
const summary={collectedAt:at,local:sites.map(s=>{const p=local.filter(p=>p.site===s.id);return {site:s.id,html:p.length,missingTitle:p.filter(p=>!p.title).map(p=>p.file),schemaErrors:p.filter(p=>p.schemaErrors.length).map(p=>({file:p.file,errors:p.schemaErrors})),oldEglinCode:p.filter(p=>p.flags.oldEglinCode).map(p=>p.file),numberOneClaims:p.filter(p=>p.flags.numberOne).map(p=>p.file)};})};
if(args.includes('--live')){
  const remote=[];
  async function fetchPage(url,tag){const started=Date.now(); try{const r=await fetch(url,{signal:AbortSignal.timeout(20000),headers:{'User-Agent':'CostinSiteAudit/1.0'}}); const h=await r.text(); const page={tag,requestedUrl:url,status:r.status,finalUrl:r.url,observedAt:new Date().toISOString(),elapsedMs:Date.now()-started,contentType:r.headers.get('content-type'),xRobots:r.headers.get('x-robots-tag'),...(/text\/html/i.test(r.headers.get('content-type')||'')?inspect(h,r.url):{text:h})}; remote.push(page);return page;}catch(e){const page={tag,requestedUrl:url,observedAt:new Date().toISOString(),status:null,error:e.cause?.code||e.message};remote.push(page);return page;}}
  async function batch(list,fn,n=4){let i=0;await Promise.all(Array.from({length:n},async()=>{while(i<list.length)await fn(list[i++]);}));}
  for(const s of sites){const [map]=await Promise.all([fetchPage(s.origin+'/sitemap.xml',s.id+'-sitemap'),fetchPage(s.origin+'/robots.txt',s.id+'-robots')]);const urls=[...new Set([s.origin+'/',...[...(map.text||'').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>decode(m[1]))])].filter(u=>new URL(u).origin===s.origin && !/\.(pdf|txt|xml|json)$/i.test(u));await batch(urls,url=>fetchPage(url,s.id));await fetchPage(s.origin+'/audit-nonexistent-20260906',s.id+'-404');}
  const competitors=[['Be More Group','https://www.bemoregroup.net/'],['Christina Leavenworth Team','https://www.bestrealtorsinpensacola.com/'],['Panhandle PCS','https://www.panhandlepcs.com/'],['Navarre Real Estate Source','https://navarrerealestatesource.com/'],['Mark Lee Team','https://markleeteam.com/'],['Keenan Team','https://keenanteamhomes.com/'],['Newman-Dailey','https://www.destinsales.com/'],['Scenic Sothebys','https://www.scenicsir.com/'],['Search The Gulf','https://www.searchthegulf.com/'],['CondoInvestment','https://www.condoinvestment.com/'],['Big Beach AL','https://bigbeachal.com/'],['Leigh McPherson Team','https://luxuryorangebeach.com/']];
  await batch(competitors,async([name,url])=>{const home=await fetchPage(url,name);if(home.status!==200||!home.links)return; const selected=[];for(const rx of [/military|pcs|relocat/i,/market|report|insight|buy/i,/about|team|sell|community|communities/i]){const link=home.links.find(l=>{try{return new URL(l.url).origin===new URL(home.finalUrl).origin && l.url!==home.finalUrl && !selected.includes(l.url) && rx.test(l.label+' '+l.url) && !/\.(jpg|png|pdf)|\/login|register/i.test(l.url);}catch{return false;}});if(link)selected.push(link.url);}await batch(selected,u=>fetchPage(u,name),2);},3);
  writeFileSync(join(out,'live-crawl.json'),JSON.stringify({collectedAt:at,completedAt:new Date().toISOString(),method:'Direct public HTTP HTML. Own sitemap coverage; competitor home plus up to three discovered topic pages. No rank or traffic inference. Responses can differ from a browser or verified crawler.',pages:remote},null,2)+'\n');
  summary.live=sites.map(s=>{const p=remote.filter(p=>p.tag===s.id);return {site:s.id,checked:p.length,statuses:p.reduce((a,p)=>(a[p.status??'unavailable']=(a[p.status??'unavailable']||0)+1,a),{}),non200:p.filter(p=>p.status!==200).map(p=>p.requestedUrl),schemaErrors:p.filter(p=>p.schemaErrors?.length).map(p=>p.requestedUrl),oldEglinCode:p.filter(p=>p.flags?.oldEglinCode).map(p=>p.requestedUrl)};});
  summary.competitors=competitors.map(([name])=>({name,pages:remote.filter(p=>p.tag===name).map(p=>({url:p.requestedUrl,status:p.status,title:p.title,error:p.error,schemaTypes:p.schemaTypes}))}));
}
writeFileSync(join(out,'crawl-summary.json'),JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify(summary,null,2));
