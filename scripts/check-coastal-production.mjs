import {readFileSync,writeFileSync} from 'node:fs';
const dir='docs/coastal-theme-2026-09-10';
const token=process.env.CLOUDFLARE_API_TOKEN||process.env.CF_API_TOKEN;
const cache=JSON.parse(readFileSync('node_modules/.cache/wrangler/pages.json','utf8'));
const baseline=JSON.parse(readFileSync(dir+'/production/production-gc.json','utf8'));
async function api(project){const r=await fetch(`https://api.cloudflare.com/client/v4/accounts/${cache.account_id}/pages/projects/${project}`,{headers:{Authorization:'Bearer '+token},signal:AbortSignal.timeout(25000)});const j=await r.json();if(!r.ok||!j.success)throw Error('Cloudflare read failed: '+r.status);return j.result;}
const [gc,pmh,data]=await Promise.all([api('greggcostin'),api('pensacolamilitaryhousing'),fetch('https://greggcostin.com/data/school-finder.json',{method:'HEAD',signal:AbortSignal.timeout(25000)})]);
const result={checkedAt:new Date().toISOString(),civilianDeploymentId:gc.canonical_deployment.id,militaryDeploymentId:pmh.canonical_deployment.id,civilianBaselineUnchanged:gc.canonical_deployment.id===baseline.deploymentId,schoolData:{status:data.status,contentType:data.headers.get('content-type'),cacheControl:data.headers.get('cache-control')}};
writeFileSync(dir+'/prepublication-state.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));if(!result.civilianBaselineUnchanged)process.exitCode=1;
