// Publish only the sealed school release, and only if neither production baseline moved.
// node --env-file-if-exists=.env.local scripts/publish-school-hub-seo.mjs --wrangler <existing-cli-path>
import {readFileSync,writeFileSync,readdirSync,existsSync} from 'node:fs';
import {join,relative} from 'node:path';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
const directory='docs/school-seo-2026-09-08';
const candidate=JSON.parse(readFileSync(join(directory,'candidate.json'),'utf8'));
const gates=JSON.parse(readFileSync(join(directory,'quality-gates.json'),'utf8'));
const receiptPath=join(directory,'deployment.json');
if(existsSync(receiptPath))throw Error('Deployment receipt already exists. Inspect it before any retry.');
const wrangler=process.argv[process.argv.indexOf('--wrangler')+1];
if(!process.argv.includes('--wrangler')||!existsSync(wrangler))throw Error('Provide the verified existing Wrangler CLI path');
if(!gates.ok||gates.candidate!==candidate.candidate)throw Error('Release gates are not clean for this candidate');
const walk=p=>readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(p,e.name)):[join(p,e.name)]);
const h=createHash('sha256');
for(const p of walk(candidate.candidate).sort())h.update(relative(candidate.candidate,p).replaceAll('\\','/')+'\0'+createHash('sha256').update(readFileSync(p)).digest('hex')+'\n');
if(h.digest('hex')!==gates.candidateFingerprint)throw Error('Candidate changed after quality gates');
const token=process.env.CLOUDFLARE_API_TOKEN||process.env.CF_API_TOKEN;
if(!token)throw Error('Existing Cloudflare token unavailable');
const {account_id:account}=JSON.parse(readFileSync('node_modules/.cache/wrangler/pages.json','utf8'));
const apiBase=`https://api.cloudflare.com/client/v4/accounts/${account}/pages/projects`;
async function project(name){
  const r=await fetch(`${apiBase}/${name}`,{headers:{Authorization:`Bearer ${token}`},signal:AbortSignal.timeout(25000)});
  const j=await r.json();if(!r.ok||!j.success)throw Error(`Project read failed HTTP ${r.status}`);return j.result;
}
const configs=[{site:'gc',name:'greggcostin',domain:'greggcostin.com'},{site:'pmh',name:'pensacolamilitaryhousing',domain:'pensacolamilitaryhousing.com'}];
async function preflight(c){
  const p=await project(c.name),baseline=candidate.production.find(s=>s.site===c.site);
  if(!p.domains.includes(c.domain)||p.production_branch!=='main')throw Error(`Unexpected domain or production branch for ${c.name}`);
  if(p.canonical_deployment?.id!==baseline.deploymentId)throw Error(`${c.name} production moved. Rebase the release before publishing.`);
  return baseline;
}
for(const c of configs)await preflight(c);
const receipt={startedAt:new Date().toISOString(),candidateFingerprint:gates.candidateFingerprint,sites:[],status:'running'};
const save=()=>writeFileSync(receiptPath,JSON.stringify(receipt,null,2)+'\n');
save();
try{
  for(const c of configs){
    const baseline=await preflight(c);
    const entry={site:c.site,project:c.name,before:baseline.deploymentId,status:'deploying'};receipt.sites.push(entry);save();
    const exit=await new Promise((resolve,reject)=>{
      const child=spawn(process.execPath,[wrangler,'pages','deploy',join(candidate.candidate,c.site),'--project-name',c.name,'--branch','main','--commit-dirty=true','--commit-message','Source-backed School Finder SEO and data-resource update'],{
        env:{...process.env,CLOUDFLARE_API_TOKEN:token,CLOUDFLARE_ACCOUNT_ID:account,CI:'true'},stdio:'inherit',windowsHide:true,
      });child.on('error',reject);child.on('exit',resolve);
    });
    entry.exitCode=exit;save();
    // Always inspect provider state, including after an uncertain CLI result. Never blindly retry.
    const current=await project(c.name),d=current.canonical_deployment;
    entry.after=d?.id;entry.url=d?.url;entry.providerStage=d?.latest_stage?.status;entry.checkedAt=new Date().toISOString();
    if(exit!==0||!d?.id||d.id===baseline.deploymentId||d.latest_stage?.status!=='success'){
      entry.status='needs-verification';save();throw Error(`${c.name} deployment needs inspection; no automatic retry`);
    }
    entry.status='provider-success';save();
  }
  receipt.status='provider-success';receipt.finishedAt=new Date().toISOString();save();
  console.log(JSON.stringify(receipt,null,2));
}catch(error){receipt.status='needs-attention';receipt.error=error.message;save();throw error;}
