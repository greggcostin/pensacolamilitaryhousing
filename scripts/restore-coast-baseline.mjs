// Reconstruct the exact pinned public asset set in a new directory. Never modifies production.
import {readFileSync,writeFileSync,mkdirSync,existsSync,copyFileSync} from 'node:fs';
import {resolve,join,dirname,extname,sep} from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const blake3=require('C:/Users/gregg/AppData/Local/npm-cache/_npx/d77349f55c2be1c0/node_modules/blake3-wasm');
const hash=(b,p)=>blake3.hash(b.toString('base64')+extname(p).slice(1)).toString('hex').slice(0,32);
const evidence='docs/seo-geo-2026-09-06/projects/01-foundation';
const root=resolve('.coast-release/2026-09-07-baseline');
if(existsSync(root))throw Error('Baseline already exists; never overwrite pinned evidence.');
mkdirSync(root,{recursive:true});
const result=[];
for(const site of ['pmh','gc']){
 const record=JSON.parse(readFileSync(join(evidence,`production-${site}.json`),'utf8'));
 const dest=join(root,site);mkdirSync(dest,{recursive:true});
 const counts={copied:0,normalized:0,retrieved:0}, failures=[];
 const entries=Object.entries(record.files);let cursor=0;
 await Promise.all(Array.from({length:4},async()=>{while(cursor<entries.length){
  const [p,expected]=entries[cursor++],target=resolve(dest,'.'+p),source=resolve(record.localBaseline,'.'+p);
  if(!target.startsWith(dest+sep)||!source.startsWith(resolve(record.localBaseline)+sep))throw Error('Unsafe manifest path');
  let bytes=existsSync(source)?readFileSync(source):null;
  if(bytes&&hash(bytes,p)===expected)counts.copied++;
  else {
   const lf=bytes?.toString('utf8').replaceAll('\r\n','\n');
   const normalized=lf===undefined?null:[Buffer.from(lf),Buffer.from(lf.replaceAll('\n','\r\n'))].find(b=>hash(b,p)===expected);
   if(normalized){bytes=normalized;counts.normalized++;}
   else {
    // Asset paths come from Cloudflare's immutable deployment manifest, never a guessed URL.
    const response=await fetch(record.url+p,{signal:AbortSignal.timeout(30000)});
    bytes=Buffer.from(await response.arrayBuffer());
    if(!response.ok||hash(bytes,p)!==expected){failures.push({path:p,status:response.status,hashMatch:hash(bytes,p)===expected});continue;}
    counts.retrieved++;
   }
  }
  mkdirSync(dirname(target),{recursive:true});writeFileSync(target,bytes);
 }}));
 // Pages configuration is excluded from the public asset manifest. Retain the versioned source.
 const config=[];for(const p of ['_headers','_redirects']){const f=join(record.localBaseline,p);if(existsSync(f)){copyFileSync(f,join(dest,p));config.push(p);}}
 result.push({site,deploymentId:record.deploymentId,directory:dest,assetCount:entries.length,counts,configRetainedFromBaseline:config,failures});
}
const report={createdAt:new Date().toISOString(),mode:'read_only_production',root,sites:result,ok:result.every(r=>!r.failures.length)};
writeFileSync(join(evidence,'baseline-restoration.json'),JSON.stringify(report,null,2)+'\n');
writeFileSync(join(root,'baseline.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));if(!report.ok)process.exitCode=1;
