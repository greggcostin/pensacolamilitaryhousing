// Publish only the verified civilian overlay. Refuses a changed production base
// or a candidate that differs from the inspected manifest. Never touches PMH.
import {readFileSync,writeFileSync,existsSync,readdirSync} from 'node:fs';
import {resolve,join,relative,extname} from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {blake3} from '@noble/hashes/blake3';
const dir=resolve('docs/worldclass-roadmap-2026-09-08');
const manifest=JSON.parse(readFileSync(join(dir,'candidate-manifest.json'),'utf8'));
const check=JSON.parse(readFileSync(join(dir,'candidate-verification.json'),'utf8'));
const review=JSON.parse(readFileSync(join(dir,'browser-review.json'),'utf8'));
const baseline=JSON.parse(readFileSync(join(manifest.baselineEvidence,'production-gc.json'),'utf8'));
const receiptFile=join(dir,'publication.json');
const cliFlag=process.argv.indexOf('--wrangler');
const cli=cliFlag>=0?resolve(process.argv[cliFlag+1]):null;
if(!process.argv.includes('--publish')||!cli||!existsSync(cli))throw Error('Use --publish --wrangler PATH to the verified installed Wrangler CLI.');
if(existsSync(receiptFile))throw Error('A publication receipt already exists. Inspect its actual deployment before any retry.');
if(!check.ok||!review.passed||check.candidate!==manifest.candidate||resolve(review.candidate)!==join(manifest.candidate,'gc'))throw Error('Candidate verification or browser review missing.');
if(manifest.changes.some(c=>c.site!=='gc'))throw Error('This publisher is restricted to the civilian site.');
const sha=f=>createHash('sha256').update(readFileSync(f)).digest('hex');
for(const c of manifest.changes)if(sha(join(manifest.candidate,c.site,c.path))!==c.sha256)throw Error('Candidate changed since verification: '+c.path);
for(const args of [['scripts/verify-worldclass-foundation.mjs'],['scripts/audit-civilian.mjs','--root',join(manifest.candidate,'gc')],['scripts/audit-entity.mjs','--pmh-root',join(manifest.candidate,'pmh'),'--gc-root',join(manifest.candidate,'gc')]]){
 const result=spawnSync(process.execPath,args,{encoding:'utf8'});process.stdout.write(result.stdout||'');process.stderr.write(result.stderr||'');if(result.error||result.status)throw Error('Required release gate failed.');
}
const token=process.env.CLOUDFLARE_API_TOKEN||process.env.CF_API_TOKEN;if(!token)throw Error('Cloudflare token unavailable.');
const cache=JSON.parse(readFileSync('node_modules/.cache/wrangler/pages.json','utf8'));
const base=`https://api.cloudflare.com/client/v4/accounts/${cache.account_id}/pages/projects/greggcostin`;
async function api(url){const r=await fetch(url,{headers:{Authorization:'Bearer '+token},signal:AbortSignal.timeout(25000)});const j=await r.json();if(!r.ok||!j.success)throw Error('Cloudflare verification failed HTTP '+r.status);return j.result;}
const project=await api(base);
if(!project.domains.includes('greggcostin.com')||project.canonical_deployment.id!==baseline.deploymentId)throw Error('Current production differs from the pinned reviewed baseline. Reconcile before publishing.');
const current=await api(base+'/deployments/'+baseline.deploymentId);
const currentFiles=Object.entries(current.files).sort(),baseFiles=Object.entries(baseline.files).sort();
if(JSON.stringify(currentFiles)!==JSON.stringify(baseFiles))throw Error('Production inventory differs from the reviewed baseline.');
const receipt={startedAt:new Date().toISOString(),status:'publishing',project:'greggcostin',candidate:manifest.candidate,manifestSha256:sha(join(dir,'candidate-manifest.json')),priorDeploymentId:baseline.deploymentId,priorDeploymentUrl:baseline.url,militaryDeploymentChangedByThisRelease:false};
const save=()=>writeFileSync(receiptFile,JSON.stringify(receipt,null,2)+'\n');save();
const result=spawnSync(process.execPath,[cli,'pages','deploy',join(manifest.candidate,'gc'),'--project-name','greggcostin','--branch','main','--commit-dirty=true','--commit-message','Civilian homepage and resource library: design release 2026-09-08'],{env:{...process.env,CLOUDFLARE_API_TOKEN:token,CLOUDFLARE_ACCOUNT_ID:cache.account_id,WRANGLER_SEND_METRICS:'false'},encoding:'utf8',timeout:240000});
const log=(result.stdout||'')+'\n'+(result.stderr||'');writeFileSync(join(dir,'deployment-output.txt'),log);process.stdout.write(log);
receipt.cliExitCode=result.status;receipt.cliCompletedAt=new Date().toISOString();
if(result.error||result.status){receipt.status='needs_deployment_review';save();throw Error('Publish did not return a reliable success. Inspect Cloudflare before retrying.');}
const deployedProject=await api(base),deployment=await api(base+'/deployments/'+deployedProject.canonical_deployment.id);
receipt.deploymentId=deployment.id;receipt.deploymentUrl=deployment.url;receipt.deploymentStage=deployment.latest_stage?.status;
const root=join(manifest.candidate,'gc');const walk=d=>readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(d,e.name)):e.isFile()?[join(d,e.name)]:[]);
const expected=Object.fromEntries(walk(root).filter(f=>!['_headers','_redirects','_routes.json'].includes(relative(root,f))).map(f=>{const path='/'+relative(root,f).replaceAll('\\','/');return[path,Buffer.from(blake3(readFileSync(f).toString('base64')+extname(path).slice(1))).toString('hex').slice(0,32)];}));
receipt.publicAssetCount=Object.keys(deployment.files||{}).length;
receipt.expectedPublicAssetCount=Object.keys(expected).length;
receipt.mismatches=[...new Set([...Object.keys(expected),...Object.keys(deployment.files||{})])].filter(p=>expected[p]!==deployment.files?.[p]);
receipt.verifiedAt=new Date().toISOString();receipt.status=deployment.id!==baseline.deploymentId&&receipt.deploymentStage==='success'&&!receipt.mismatches.length?'published_and_manifest_verified':'needs_deployment_review';save();
console.log(JSON.stringify(receipt,null,2));if(receipt.status!=='published_and_manifest_verified')process.exitCode=1;
