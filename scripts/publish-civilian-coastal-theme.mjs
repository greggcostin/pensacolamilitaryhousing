// Requires Gregg's explicit production-deployment approval after preview review.
// Publish the sealed civilian theme only; refuse a changed candidate or baseline.
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {fingerprint,sha} from './isolated-release-lib.mjs';
const dir=resolve('docs/coastal-theme-2026-09-10');
const read=name=>JSON.parse(readFileSync(join(dir,name),'utf8'));
const manifest=read('candidate-manifest.json'),baseline=read('production/production-gc.json'),military=read('production/production-pmh.json');
const review=read('browser-review.json'),preservation=read('preservation.json');
const root=resolve(manifest.candidate),receiptPath=join(dir,'publication.json');
const cli='C:/Users/gregg/AppData/Local/npm-cache/_npx/d77349f55c2be1c0/node_modules/wrangler/bin/wrangler.js';
if(!process.argv.includes('--publish')||!existsSync(cli))throw Error('Use --publish with the verified installed Wrangler CLI available.');
if(existsSync(receiptPath))throw Error('Publication receipt already exists. Inspect it and current production before retrying.');
if(!review.passed||!preservation.ok||resolve(review.candidate)!==root||resolve(preservation.root)!==root)throw Error('Missing candidate review or preservation proof.');
for(const e of manifest.evidence)if(sha(join(dir,e.path))!==e.sha256)throw Error('Review evidence changed since sealing: '+e.path);
for(const s of manifest.sourceFiles)if(sha(s.path)!==s.sha256)throw Error('Theme source changed since sealing: '+s.path);
if(fingerprint(root)!==manifest.candidateSha256)throw Error('Candidate changed since sealing.');
const audit=spawnSync(process.execPath,['scripts/audit-civilian.mjs','--root',root],{encoding:'utf8'});
process.stdout.write(audit.stdout||'');process.stderr.write(audit.stderr||'');if(audit.error||audit.status)throw Error('Civilian quality gate failed.');
const token=process.env.CLOUDFLARE_API_TOKEN||process.env.CF_API_TOKEN;if(!token)throw Error('Existing Cloudflare token unavailable.');
const cache=JSON.parse(readFileSync('node_modules/.cache/wrangler/pages.json','utf8'));
const base=`https://api.cloudflare.com/client/v4/accounts/${cache.account_id}/pages/projects`;
async function api(path){const r=await fetch(base+path,{headers:{Authorization:'Bearer '+token},signal:AbortSignal.timeout(25000)});const j=await r.json();if(!r.ok||!j.success)throw Error('Cloudflare verification failed HTTP '+r.status);return j.result;}
const project=await api('/greggcostin');
if(!project.domains.includes('greggcostin.com')||project.canonical_deployment.id!==baseline.deploymentId)throw Error('Production changed since review. Reconcile before publication.');
const before=await api('/greggcostin/deployments/'+baseline.deploymentId);
const sorted=o=>JSON.stringify(Object.entries(o||{}).sort(([a],[b])=>a.localeCompare(b)));
if(sorted(before.files)!==sorted(baseline.files))throw Error('Production asset manifest changed since review.');
const expected=Object.fromEntries(manifest.assets.filter(a=>a.providerHash).map(a=>['/'+a.path,a.providerHash]));
const receipt={startedAt:new Date().toISOString(),status:'publishing',project:'greggcostin',candidate:root,candidateSha256:manifest.candidateSha256,manifestSha256:sha(join(dir,'candidate-manifest.json')),priorDeploymentId:baseline.deploymentId,priorDeploymentUrl:baseline.url};
const save=()=>writeFileSync(receiptPath,JSON.stringify(receipt,null,2)+'\n');save();
const result=spawnSync(process.execPath,[cli,'pages','deploy',root,'--project-name','greggcostin','--branch','main','--commit-dirty=true','--commit-message','Consistent airy coastal design across every civilian page'],{env:{...process.env,CLOUDFLARE_API_TOKEN:token,CLOUDFLARE_ACCOUNT_ID:cache.account_id,WRANGLER_SEND_METRICS:'false'},encoding:'utf8',timeout:240000});
const log=(result.stdout||'')+'\n'+(result.stderr||'');writeFileSync(join(dir,'deployment-output.txt'),log);process.stdout.write(log);
receipt.cliExitCode=result.status;receipt.cliCompletedAt=new Date().toISOString();
if(result.error||result.status){receipt.status='needs_deployment_review';save();throw Error('Publish did not return reliable success. Inspect Cloudflare before retrying.');}
try{
 const [gc,pmh]=await Promise.all([api('/greggcostin'),api('/pensacolamilitaryhousing')]);
 const [deployed,pmhDeployed]=await Promise.all([api('/greggcostin/deployments/'+gc.canonical_deployment.id),api('/pensacolamilitaryhousing/deployments/'+pmh.canonical_deployment.id)]);
 receipt.deploymentId=deployed.id;receipt.deploymentUrl=deployed.url;receipt.deploymentStage=deployed.latest_stage?.status;
 receipt.expectedPublicAssetCount=Object.keys(expected).length;receipt.publicAssetCount=Object.keys(deployed.files||{}).length;
 receipt.mismatches=[...new Set([...Object.keys(expected),...Object.keys(deployed.files||{})])].filter(p=>expected[p]!==deployed.files?.[p]);
 receipt.militaryDeploymentId=pmhDeployed.id;receipt.militaryDeploymentUnchanged=pmhDeployed.id===military.deploymentId&&sorted(pmhDeployed.files)===sorted(military.files);
 receipt.verifiedAt=new Date().toISOString();receipt.status=deployed.id!==baseline.deploymentId&&receipt.deploymentStage==='success'&&!receipt.mismatches.length&&receipt.militaryDeploymentUnchanged?'published_and_manifest_verified':'needs_deployment_review';
 writeFileSync(join(dir,'published-assets.json'),JSON.stringify({deploymentId:deployed.id,files:deployed.files},null,2)+'\n');save();
}catch(e){receipt.status='needs_deployment_review';receipt.error=e.message;save();throw e;}
console.log(JSON.stringify(receipt,null,2));if(receipt.status!=='published_and_manifest_verified')process.exitCode=1;
