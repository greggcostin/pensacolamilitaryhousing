// Recover the exact current civilian release into a new task-owned directory.
// Public assets must match the provider manifest before any presentation edits.
import {readFileSync,writeFileSync,mkdirSync,existsSync,readdirSync,copyFileSync} from 'node:fs';
import {join,resolve,dirname,extname,sep} from 'node:path';
import {blake3} from '@noble/hashes/blake3';
const evidence='docs/coastal-theme-2026-09-10';
const record=JSON.parse(readFileSync(join(evidence,'production/production-gc.json'),'utf8'));
const root=resolve('.coast-release/coastal-theme-20260910/baseline/gc');
if(existsSync(root))throw Error('Pinned baseline already exists; never overwrite it.');
const hash=(b,p)=>Buffer.from(blake3(b.toString('base64')+extname(p).slice(1))).toString('hex').slice(0,32);
const sources=['civilian-site',...readdirSync('.coast-release',{withFileTypes:true}).filter(e=>e.isDirectory()&&e.name!=='coastal-theme-20260910').map(e=>join('.coast-release',e.name,'gc')).filter(p=>existsSync(p))];
const counts={copied:0,normalized:0,retrieved:0},failures=[];
const entries=Object.entries(record.files);let cursor=0;
await Promise.all(Array.from({length:6},async()=>{while(cursor<entries.length){
 const [path,expected]=entries[cursor++],target=resolve(root,'.'+path);
 if(!target.startsWith(root+sep))throw Error('Unsafe manifest path');
 let bytes,normalized=false;
 for(const source of sources){const file=resolve(source,'.'+path);if(!existsSync(file))continue;const b=readFileSync(file);
  if(hash(b,path)===expected){bytes=b;break;}
  if(/\.(html|css|js|json|txt|xml|svg|webmanifest)$/.test(path)){const lf=b.toString('utf8').replaceAll('\r\n','\n');const n=[Buffer.from(lf),Buffer.from(lf.replaceAll('\n','\r\n'))].find(x=>hash(x,path)===expected);if(n){bytes=n;normalized=true;break;}}
 }
 if(bytes)counts[normalized?'normalized':'copied']++;
 else try{const r=await fetch(record.url+path,{signal:AbortSignal.timeout(30000)});const b=Buffer.from(await r.arrayBuffer());if(!r.ok||hash(b,path)!==expected)throw Error(`HTTP ${r.status}; provider hash match: ${hash(b,path)===expected}`);bytes=b;counts.retrieved++;}catch(e){failures.push({path,error:e.message});continue;}
 mkdirSync(dirname(target),{recursive:true});writeFileSync(target,bytes);
 if((counts.copied+counts.normalized+counts.retrieved)%300===0)console.log(`Verified ${counts.copied+counts.normalized+counts.retrieved}/${entries.length} public assets`);
}}));
// These Cloudflare configuration files are not public assets. Retain existing
// source configuration separately; do not claim it has a provider asset hash.
for(const file of ['_headers','_redirects'])copyFileSync(join('civilian-site',file),join(root,file));
const result={createdAt:new Date().toISOString(),root,deploymentId:record.deploymentId,assetCount:entries.length,html:entries.filter(([p])=>p.endsWith('.html')).length,counts,configurationSource:'civilian-site; provider manifest excludes _headers and _redirects',failures,ok:failures.length===0};
writeFileSync(join(evidence,'baseline-restoration.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));if(failures.length)process.exitCode=1;
