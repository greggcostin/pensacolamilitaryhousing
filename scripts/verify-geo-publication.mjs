// Independent provider readback plus live HTTP checks. A CLI success is not verification.
import {readFileSync} from 'node:fs';
import {join,relative,extname} from 'node:path';
import {createRequire} from 'node:module';
import {json,save,walk,fingerprint} from './isolated-release-lib.mjs';
const arg=k=>process.argv.includes(k)?process.argv[process.argv.indexOf(k)+1]:null;
const dir=arg('--directory')||'docs/geo-execution-2026-09-10/identity-release';
const c=json(join(dir,'candidate.json')),g=json(join(dir,'quality-gates.json')),receipt=json(join(dir,'deployment.json'));
if(receipt.status!=='provider-success'||fingerprint(c.candidate)!==g.candidateFingerprint)throw Error('Missing reliable publication receipt or changed candidate');
const require=createRequire('C:/Users/gregg/pensacolamilitaryhousing/package.json'),{blake3}=require('@noble/hashes/blake3');
const hash=(b,p)=>Buffer.from(blake3(b.toString('base64')+extname(p).slice(1))).toString('hex').slice(0,32);
const token=process.env.CLOUDFLARE_API_TOKEN||process.env.CF_API_TOKEN;if(!token)throw Error('Cloudflare credential unavailable');
const {account_id}=json('node_modules/.cache/wrangler/pages.json');
const api=async path=>{const r=await fetch(`https://api.cloudflare.com/client/v4/accounts/${account_id}/pages/projects/${path}`,{headers:{Authorization:`Bearer ${token}`},signal:AbortSignal.timeout(30000)});const j=await r.json();if(!r.ok||!j.success)throw Error('Cloudflare read failed HTTP '+r.status);return j.result;};
const sites=[];
for(const s of c.production){
 const root=join(c.candidate,s.site),p=await api(s.project),d=await api(s.project+'/deployments/'+p.canonical_deployment.id);
 const expected=Object.fromEntries(walk(root).filter(f=>!['_headers','_redirects'].includes(relative(root,f))).map(f=>{const path='/'+relative(root,f).replaceAll('\\','/');return[path,hash(readFileSync(f),path)];}));
 const keys=new Set([...Object.keys(expected),...Object.keys(d.files||{})]),mismatches=[...keys].filter(k=>expected[k]!==d.files?.[k]);
 const expectedId=receipt.sites.find(r=>r.site===s.site)?.after;
 const checks=[];
 const defaultPaths=s.site==='gc'?['/','/team','/data/gregg-costin.json','/schools']:['/','/about','/data/gregg-costin.json','/schools'];
 for(const path of c.livePaths?.[s.site]||defaultPaths){
  const url='https://'+s.domain+path,r=await fetch(url,{signal:AbortSignal.timeout(30000)}),body=await r.text();
  const qualifications=path==='/team'||path==='/about'||path==='/data/gregg-costin.json';
  const phrases=qualifications?['B.S. in Economics','B.A. in International Affairs','Part 107 Certified Drone Pilot']:[];
  const ownCanonical=path.endsWith('.json')?true:body.includes(`rel="canonical" href="${url}"`);
  checks.push({url,status:r.status,finalUrl:r.url,ownCanonical,qualifications:phrases.length?phrases.every(t=>body.includes(t)):null,ok:r.status===200&&r.url===url&&ownCanonical&&phrases.every(t=>body.includes(t))});
 }
 const counts={exact:[...keys].filter(k=>expected[k]&&expected[k]===d.files?.[k]).length,lineEndingOnly:0,missing:[...keys].filter(k=>!expected[k]).length,different:mismatches.length};
 const record={...s,localBaseline:root,deploymentId:d.id,url:d.url,createdOn:d.created_on,stage:d.latest_stage?.status,commit:d.deployment_trigger?.metadata?.commit_hash,assetCount:Object.keys(d.files||{}).length,counts,differences:mismatches,mismatches,liveChecks:checks,ok:d.id===expectedId&&d.latest_stage?.status==='success'&&!mismatches.length&&checks.every(c=>c.ok)};
 save(join(dir,'live','production-'+s.site+'.json'),{...record,files:d.files});sites.push(record);
}
const result={checkedAt:new Date().toISOString(),ok:sites.every(s=>s.ok),sites,scope:'Complete immutable deployment asset manifests plus selected live apex URLs. Browser behavior verified separately.'};
save(join(dir,'live','production-baseline.json'),result);
console.log(JSON.stringify(result,null,2));if(!result.ok)process.exitCode=1;
