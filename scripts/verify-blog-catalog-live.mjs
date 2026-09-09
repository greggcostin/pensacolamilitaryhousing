// Read-only public delivery checks after the provider's full manifest verification.
import {readFileSync,writeFileSync} from 'node:fs';import {createHash} from 'node:crypto';
import {ROOT,SITES,listFragments,parseFragment} from './blog-lib.mjs';import {assertBlogRendered} from './blog-render-gate.mjs';
const release=(process.argv[2]||ROOT+'../release/').replace(/[/\\]?$/,'/'),record=JSON.parse(readFileSync(release+'deployment.json','utf8')),candidate=JSON.parse(readFileSync(release+'candidate.json','utf8')).candidate;
if(record.status!=='provider-success'||!record.manifestVerification)throw Error('Both deployments and provider file verification must succeed first');
const results=[],sha=b=>createHash('sha256').update(b).digest('hex');
async function get(url){const response=await fetch(url,{redirect:'manual',headers:{'User-Agent':'Costin-Catalog-Verification/1.0'},signal:AbortSignal.timeout(25000)});if(response.status!==200)throw Error(url+' HTTP '+response.status);if(/noindex/i.test(response.headers.get('x-robots-tag')||''))throw Error('Noindex response: '+url);return {response,bytes:Buffer.from(await response.arrayBuffer())};}
for(const site of ['gc','pmh']){
 for(const f of listFragments(site)){
  const {spec}=parseFragment(f.path),url=SITES[site].origin+'/blog/'+f.slug;
  try{const {bytes}=await get(url),html=bytes.toString('utf8');assertBlogRendered(spec,html);if(!html.includes('rel="canonical" href="'+url+'"'))throw Error('Canonical differs');
   const nodes=[...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1])),article=nodes.find(n=>['BlogPosting','Article'].includes(n['@type']));if(article?.dateModified?.slice(0,10)!==spec.dateModified)throw Error('Stale article date');
   const og=new URL(html.match(/<meta property="og:image" content="([^"]+)"/)?.[1]);
   for(const path of [spec.figure.src,og.pathname+og.search]){const remote=await get(SITES[site].origin+path),local=readFileSync(candidate+'/'+site+path.split('?')[0]);if(sha(remote.bytes)!==sha(local))throw Error('Live image differs: '+path);}
   results.push({site,slug:f.slug,url,pass:true,dateModified:article.dateModified});console.log('LIVE '+site+' '+f.slug);
  }catch(e){results.push({site,slug:f.slug,url,pass:false,error:e.message});console.log('FAIL '+url+': '+e.message);}
 }
 for(const path of ['/blog','/sitemap.xml','/llms.txt','/llms-full.txt','/robots.txt','/pagefind/pagefind.js']){try{await get(SITES[site].origin+path);results.push({site,path,pass:true});}catch(e){results.push({site,path,pass:false,error:e.message});}}
}
const out={checkedAt:new Date().toISOString(),readOnly:true,ok:results.every(r=>r.pass),results};writeFileSync(release+'live-verification.json',JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify({ok:out.ok,checked:results.length,failed:results.filter(r=>!r.pass)},null,2));if(!out.ok)process.exitCode=1;
