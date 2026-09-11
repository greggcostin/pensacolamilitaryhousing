// Read current Cloudflare manifests and recover only hash-verified production assets.
// Credentials stay in the inherited environment. No deployment or source mutation.
import {readFileSync,writeFileSync,mkdirSync,existsSync,copyFileSync} from 'node:fs';
import {resolve,join,dirname,extname,sep} from 'node:path';
import {createRequire} from 'node:module';
const arg=(k,f)=>process.argv.includes(k)?process.argv[process.argv.indexOf(k)+1]:f;
const source=resolve(arg('--source-root','C:/Users/gregg/pensacolamilitaryhousing'));
const out=resolve(arg('--out','docs/geo-execution-2026-09-10/production'));
const snapshot=resolve(arg('--snapshot','.coast-release/geo-20260910/baseline'));
const require=createRequire(join(source,'package.json'));
const {blake3}=require('@noble/hashes/blake3');
const hash=(bytes,path)=>Buffer.from(blake3(bytes.toString('base64')+extname(path).slice(1))).toString('hex').slice(0,32);
const token=process.env.CLOUDFLARE_API_TOKEN||process.env.CF_API_TOKEN;
if(!token)throw Error('Existing Cloudflare credential unavailable');
const {account_id}=JSON.parse(readFileSync(join(source,'node_modules/.cache/wrangler/pages.json'),'utf8'));
const base=`https://api.cloudflare.com/client/v4/accounts/${account_id}/pages/projects`;
const save=(path,data)=>{mkdirSync(dirname(path),{recursive:true});writeFileSync(path,JSON.stringify(data,null,2)+'\n');};
async function api(path){const r=await fetch(base+path,{headers:{Authorization:`Bearer ${token}`},signal:AbortSignal.timeout(30000)});const j=await r.json();if(!r.ok||!j.success)throw Error('Cloudflare read failed HTTP '+r.status);return j.result;}
const sites=[];
for(const [site,project,domain] of [['gc','greggcostin','greggcostin.com'],['pmh','pensacolamilitaryhousing','pensacolamilitaryhousing.com']]){
 const p=await api('/'+project);if(!p.domains.includes(domain))throw Error('Unexpected project domain');
 const d=await api(`/${project}/deployments/${p.canonical_deployment.id}`);
 const root=join(snapshot,site),files=d.files||{};
 if(!Object.keys(files).length||d.latest_stage?.status!=='success')throw Error('Missing successful production manifest');
 const record={site,project,domain,localBaseline:root,deploymentId:d.id,url:d.url,createdOn:d.created_on,stage:d.latest_stage.status,commit:d.deployment_trigger?.metadata?.commit_hash,assetCount:Object.keys(files).length,files};
 save(join(out,`production-${site}.json`),record);
 const sources=[root,join(source,'.coast-release/school-map-scroll-20260910',site),join(source,'.coast-release/civilian-calculators-current-20260909',site),join(source,site==='gc'?'civilian-site':'dist')];
 let cursor=0;const entries=Object.entries(files),counts={copied:0,normalized:0,retrieved:0},failures=[];
 await Promise.all(Array.from({length:6},async()=>{while(cursor<entries.length){
  const [path,expected]=entries[cursor++],target=resolve(root,'.'+path);
  if(!target.startsWith(root+sep))throw Error('Unsafe provider path');
  let bytes,mode='copied';
  for(const dir of sources){const file=resolve(dir,'.'+path);if(!existsSync(file))continue;const b=readFileSync(file);if(hash(b,path)===expected){bytes=b;break;}
   if(/\.(html|css|js|json|txt|xml|svg|webmanifest)$/.test(path)){const lf=b.toString('utf8').replaceAll('\r\n','\n');const n=[Buffer.from(lf),Buffer.from(lf.replaceAll('\n','\r\n'))].find(x=>hash(x,path)===expected);if(n){bytes=n;mode='normalized';break;}}
  }
  if(!bytes)try{const r=await fetch(d.url+path,{signal:AbortSignal.timeout(30000)}),b=Buffer.from(await r.arrayBuffer());if(!r.ok||hash(b,path)!==expected)throw Error(`HTTP ${r.status}; provider hash mismatch`);bytes=b;mode='retrieved';}catch(e){failures.push({path,error:e.message});continue;}
  mkdirSync(dirname(target),{recursive:true});writeFileSync(target,bytes);counts[mode]++;
 }}));
 for(const name of ['_headers','_redirects']){const path=join(source,site==='gc'?'civilian-site':'public',name);if(existsSync(path))copyFileSync(path,join(root,name));}
 const after=await api('/'+project);if(after.canonical_deployment.id!==d.id)failures.push({error:'Production advanced during capture'});
 const {files:omit,...summary}=record;sites.push({...summary,counts,failures,configurationSource:'Current source _headers and _redirects; excluded from provider asset manifest'});
 console.log(`${site}: ${Object.values(counts).reduce((a,b)=>a+b,0)}/${entries.length} verified, ${failures.length} failures; ${d.id}`);
}
const report={checkedAt:new Date().toISOString(),readOnly:true,sites,ok:sites.every(s=>!s.failures.length)};
save(join(out,'production-baseline.json'),report);
if(!report.ok)process.exitCode=1;
