// Public HTTP verification of the already published coastal release; never deploys or submits a form.
import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
const dir='docs/coastal-theme-2026-09-10';
const manifest=JSON.parse(readFileSync(join(dir,'candidate-manifest.json'),'utf8'));
const receipt=JSON.parse(readFileSync(join(dir,'publication.json'),'utf8'));
if(receipt.status!=='published_and_manifest_verified')throw Error('A verified publication receipt is required');
const origin='https://greggcostin.com',hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const decodeEmail=hex=>{const bytes=Buffer.from(hex,'hex'),key=bytes[0];return Buffer.from([...bytes.subarray(1)].map(b=>b^key)).toString('utf8');};
// Reverse the observed edge email-protection rewrite, while comparing all other HTML exactly.
const withoutEdgeEmailProtection=html=>html
 .replace(/href="\/cdn-cgi\/l\/email-protection#([a-f0-9]+)"/gi,(_,hex)=>`href="mailto:${decodeEmail(hex)}"`)
 .replace(/<span class="__cf_email__" data-cfemail="([a-f0-9]+)">\[email&#160;protected\]<\/span>/gi,(_,hex)=>decodeEmail(hex))
 .replace(/<script data-cfasync="false" src="\/cdn-cgi\/scripts\/[a-f0-9]+\/cloudflare-static\/email-decode\.min\.js"><\/script>/gi,'');
const html=manifest.assets.filter(a=>a.path.endsWith('.html')&&a.path!=='404.html');
const queue=html.map(a=>({asset:a,path:a.path==='index.html'?'/':'/'+a.path.replace(/\.html$/,'')}));
for(const path of ['assets/civilian-coastal-theme.css','images/palafox-night-480.avif','images/palafox-night-1200.avif','images/milton-480.avif','images/mary-esther-480.avif','data/photography-credits.json','robots.txt','sitemap.xml','llms.txt'])queue.push({asset:manifest.assets.find(a=>a.path===path),path:'/'+path});
const rows=[],failures=[];let next=0;
await Promise.all(Array.from({length:8},async()=>{
 while(next<queue.length){
  const item=queue[next++];
  try{
   const response=await fetch(origin+item.path,{headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(25000)}),bytes=Buffer.from(await response.arrayBuffer());
   const row={path:item.path,status:response.status,contentType:response.headers.get('content-type'),rawHashMatches:hash(bytes)===item.asset.sha256};
   row.hashMatches=row.rawHashMatches;
   if(item.asset.path.endsWith('.html')){
    const text=bytes.toString('utf8');row.theme=text.includes(`/assets/civilian-coastal-theme.css?v=${manifest.themeVersion}`)&&text.includes('data-gc-theme="coastal-2026-09"');
    row.hashMatches=hash(withoutEdgeEmailProtection(text))===item.asset.sha256;
    row.edgeTransformation=row.rawHashMatches?null:'Cloudflare email protection';
    row.canonical=text.match(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1];
    row.schemaBlocks=[...text.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].length;
    for(const match of text.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g))JSON.parse(match[1]);
    if(!row.theme||row.canonical!==origin+item.path)failures.push({path:item.path,issue:'Theme or canonical mismatch'});
   }
   if(response.status!==200||!row.hashMatches)failures.push({path:item.path,issue:'HTTP status or published bytes mismatch',...row});
   rows.push(row);
  }catch(error){failures.push({path:item.path,issue:error.message});}
 }
}));
const missing=await fetch(origin+'/coastal-release-check-not-a-real-page',{signal:AbortSignal.timeout(25000)});
if(missing.status!==404)failures.push({path:'/coastal-release-check-not-a-real-page',issue:'Expected real 404',status:missing.status});
const result={checkedAt:new Date().toISOString(),deploymentId:receipt.deploymentId,origin,themeVersion:manifest.themeVersion,htmlPages:html.length,requests:rows.length,notFoundStatus:missing.status,rows:rows.sort((a,b)=>a.path.localeCompare(b.path)),failures,ok:!failures.length};
writeFileSync(join(dir,'public-http-verification.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({checkedAt:result.checkedAt,deploymentId:result.deploymentId,htmlPages:result.htmlPages,requests:result.requests,notFoundStatus:missing.status,failureCount:failures.length,failures:failures.slice(0,6),ok:result.ok},null,2));if(failures.length)process.exitCode=1;
