// Reconstruct the pinned production assets without including unfinished checkout changes.
import {readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync} from 'node:fs';
import {resolve, join, dirname, extname, sep} from 'node:path';
import {blake3} from '@noble/hashes/blake3';
const evidence='docs/school-seo-2026-09-08/before';
const output=resolve('.coast-release/2026-09-08-school-seo-baseline');
const digest=(bytes,path)=>Buffer.from(blake3(bytes.toString('base64')+extname(path).slice(1))).toString('hex').slice(0,32);
const summary=[];
for(const site of ['gc','pmh']){
  const record=JSON.parse(readFileSync(join(evidence,`production-${site}.json`),'utf8'));
  const candidates=site==='gc'?['.coast-release/2026-09-08-design-02/gc']:['artifacts/civilian-blog-engine/2026-09-08/release-checkout/dist','.coast-release/2026-09-08-design-02/pmh','.school-release/checkout/dist'];
  const root=join(output,site);mkdirSync(root,{recursive:true});
  const counts={existing:0,copied:0,retrieved:0},failures=[];
  const entries=Object.entries(record.files);let cursor=0;
  await Promise.all(Array.from({length:4},async()=>{while(cursor<entries.length){
    const [path,hash]=entries[cursor++],target=resolve(root,'.'+path);
    if(!target.startsWith(root+sep))throw Error('Unsafe manifest path');
    if(existsSync(target)&&digest(readFileSync(target),path)===hash){counts.existing++;continue;}
    let bytes;
    for(const candidate of candidates){
      const source=resolve(candidate,'.'+path);if(!existsSync(source))continue;
      const raw=readFileSync(source),variants=[raw];
      if(/\.(html|css|js|json|txt|xml|svg|webmanifest)$/.test(path)){const lf=raw.toString('utf8').replaceAll('\r\n','\n');variants.push(Buffer.from(lf),Buffer.from(lf.replaceAll('\n','\r\n')));}
      bytes=variants.find(b=>digest(b,path)===hash);if(bytes){counts.copied++;break;}
    }
    if(!bytes){
      const response=await fetch(record.url+path,{signal:AbortSignal.timeout(25000)});
      bytes=Buffer.from(await response.arrayBuffer());
      if(!response.ok||digest(bytes,path)!==hash){failures.push({path,status:response.status,hashMatch:digest(bytes,path)===hash});continue;}
      counts.retrieved++;
    }
    mkdirSync(dirname(target),{recursive:true});writeFileSync(target,bytes);
  }}));
  // These deployment configuration files are not public manifest entries.
  const configurationSource=site==='gc'?candidates[0]:'artifacts/civilian-blog-engine/2026-09-08/release-checkout/public';
  for(const file of ['_headers','_redirects']){
    const source=join(configurationSource,file);if(!existsSync(source))throw Error('Missing baseline configuration '+source);
    copyFileSync(source,join(root,file));
  }
  summary.push({site,deploymentId:record.deploymentId,url:record.url,assets:entries.length,counts,failures,configurationSource});
}
const receipt={checkedAt:new Date().toISOString(),root:output,ok:summary.every(x=>!x.failures.length),sites:summary};
writeFileSync(join(output,'baseline.json'),JSON.stringify(receipt,null,2)+'\n');
console.log(JSON.stringify(receipt,null,2));if(!receipt.ok)process.exitCode=1;
