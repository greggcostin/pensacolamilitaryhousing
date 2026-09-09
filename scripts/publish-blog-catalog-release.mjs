// Publish only a sealed, explicitly scoped candidate. No git add/build or blind retries.
import {readFileSync,existsSync,openSync,closeSync,unlinkSync} from 'node:fs';
import {join} from 'node:path';
import {spawn,spawnSync} from 'node:child_process';
import {json,save,fingerprint} from './isolated-release-lib.mjs';
const arg=k=>process.argv.includes(k)?process.argv[process.argv.indexOf(k)+1]:null;
const dir=arg('--directory'),wrangler=arg('--wrangler');
if(!dir||!wrangler||!existsSync(wrangler))throw Error('Provide --directory and a verified existing --wrangler CLI path');
const c=json(join(dir,'candidate.json')),g=json(join(dir,'quality-gates.json')),receiptPath=join(dir,'deployment.json');
if(existsSync(receiptPath))throw Error('Receipt exists. Inspect provider and receipt before retrying; never overwrite.');
if(!g.ok||g.candidate!==c.candidate||fingerprint(c.candidate)!==g.candidateFingerprint)throw Error('Candidate is not the sealed, passing release');
const token=process.env.CLOUDFLARE_API_TOKEN||process.env.CF_API_TOKEN;
if(!token)throw Error('Existing Cloudflare credential unavailable');
const {account_id:account}=json('node_modules/.cache/wrangler/pages.json');
const project=async name=>{const r=await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/pages/projects/${name}`,{headers:{Authorization:`Bearer ${token}`},signal:AbortSignal.timeout(25000)});const j=await r.json();if(!r.ok||!j.success)throw Error('Cloudflare project read failed: '+r.status);return j.result;};
const sites=c.production.filter(s=>c.changes.some(f=>f.site===s.site));
if(!sites.length)throw Error('No changed site to publish');
const preflight=async s=>{const p=await project(s.project);if(p.production_branch!=='main'||!p.domains.includes(s.domain)||p.canonical_deployment?.id!==s.deploymentId)throw Error(s.site+' production moved or domain differs. Rebase and verify first.');};
const lock='.coast-release/publication.lock.json';let handle;
try{handle=openSync(lock,'wx');}catch{throw Error('Another release holds the publication lock. Inspect it and wait.');}
const receipt={startedAt:new Date().toISOString(),directory:dir,candidate:c.candidate,candidateFingerprint:g.candidateFingerprint,sites:[],status:'preflight'};
try{
  for(const s of sites)await preflight(s);
  save(lock,{...receipt,pid:process.pid});save(receiptPath,receipt);
  for(const s of sites){
    await preflight(s);
    const entry={site:s.site,project:s.project,before:s.deploymentId,status:'deploying'};receipt.sites.push(entry);save(receiptPath,receipt);
    const exit=await new Promise((resolve,reject)=>{const child=spawn(process.execPath,[wrangler,'pages','deploy',join(c.candidate,s.site),'--project-name',s.project,'--branch','main','--commit-dirty=true','--commit-message',c.releaseMessage||'Source-verified Costin website refinement'],{env:{...process.env,CLOUDFLARE_API_TOKEN:token,CLOUDFLARE_ACCOUNT_ID:account,CI:'true'},stdio:'inherit',windowsHide:true});child.on('error',reject);child.on('exit',resolve);});
    const p=await project(s.project),d=p.canonical_deployment;
    Object.assign(entry,{exitCode:exit,after:d?.id,url:d?.url,providerStage:d?.latest_stage?.status,checkedAt:new Date().toISOString()});
    entry.status=exit===0&&d?.id!==s.deploymentId&&d?.latest_stage?.status==='success'?'provider-success':'needs-verification';save(receiptPath,receipt);
    if(entry.status!=='provider-success')throw Error(s.site+' uncertain deployment; inspect before retry');
  }
  const verify=spawnSync(process.execPath,['--env-file-if-exists=.env.local','scripts/capture-coast-production.mjs','--baseline-root',c.candidate,'--out',join(dir,'production-verified')],{encoding:'utf8',windowsHide:true});
  console.log(verify.stdout);if(verify.status!==0)throw Error('Full provider file verification failed; inspect production-verified before any retry');
  receipt.manifestVerification='all provider file hashes match the sealed candidate';
  receipt.status='provider-success';receipt.finishedAt=new Date().toISOString();save(receiptPath,receipt);console.log(JSON.stringify(receipt,null,2));
}catch(error){receipt.status='needs-attention';receipt.error=error.message;save(receiptPath,receipt);throw error;}
finally{closeSync(handle);unlinkSync(lock);}
