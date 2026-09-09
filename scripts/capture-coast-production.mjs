// Read only: pin both current production deployments and compare the complete local baseline.
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {join,extname,resolve} from 'node:path';
import {blake3} from '@noble/hashes/blake3';
const output=process.argv.includes('--out')?process.argv[process.argv.indexOf('--out')+1]:'docs/seo-geo-2026-09-06/projects/01-foundation';
mkdirSync(output,{recursive:true});
const token=process.env.CLOUDFLARE_API_TOKEN||process.env.CF_API_TOKEN;
if(!token)throw Error('Existing Cloudflare token unavailable.');
const cache=JSON.parse(readFileSync('node_modules/.cache/wrangler/pages.json','utf8'));
const apiBase=`https://api.cloudflare.com/client/v4/accounts/${cache.account_id}/pages/projects`;
async function api(url){const r=await fetch(url,{headers:{Authorization:`Bearer ${token}`},signal:AbortSignal.timeout(25000)});const j=await r.json();if(!r.ok||!j.success)throw Error(`Cloudflare read failed HTTP ${r.status}`);return j.result;}
const hash=(b,p)=>Buffer.from(blake3(b.toString('base64')+extname(p).slice(1))).toString('hex').slice(0,32);
const configs=[{site:'pmh',project:'pensacolamilitaryhousing',domain:'pensacolamilitaryhousing.com',directory:'.school-release/checkout/dist'},{site:'gc',project:'greggcostin',domain:'greggcostin.com',directory:'.school-release/checkout/civilian-site'}];
const baselineFlag=process.argv.indexOf('--baseline-root');
if(baselineFlag>=0)for(const c of configs)c.directory=join(process.argv[baselineFlag+1],c.site);
const results=await Promise.all(configs.map(async c=>{
 const project=await api(`${apiBase}/${c.project}`);
 if(!project.domains.includes(c.domain))throw Error('Project domain mismatch');
 const d=await api(`${apiBase}/${c.project}/deployments/${project.canonical_deployment.id}`);
 const differences=[],counts={exact:0,lineEndingOnly:0,missing:0,different:0};
 for(const [p,expected] of Object.entries(d.files||{})){
  const file=resolve(c.directory,'.'+p);if(!file.startsWith(resolve(c.directory)+'\\'))throw Error('Unsafe manifest path');
  if(!existsSync(file)){counts.missing++;differences.push({path:p,status:'missing'});continue;}
  const b=readFileSync(file);if(hash(b,p)===expected){counts.exact++;continue;}
  if(/\.(html|css|js|json|txt|xml|svg|webmanifest)$/.test(p)){
   const lf=b.toString('utf8').replaceAll('\r\n','\n');
   if(hash(Buffer.from(lf),p)===expected||hash(Buffer.from(lf.replaceAll('\n','\r\n')),p)===expected){counts.lineEndingOnly++;continue;}
  }
  counts.different++;differences.push({path:p,status:'different'});
 }
 if(!Object.keys(d.files||{}).length)throw Error('Empty production manifest');
 const record={site:c.site,project:c.project,domain:c.domain,localBaseline:c.directory,deploymentId:d.id,url:d.url,createdOn:d.created_on,stage:d.latest_stage?.status,commit:d.deployment_trigger?.metadata?.commit_hash,assetCount:Object.keys(d.files).length,counts,differences,files:d.files};
 writeFileSync(join(output,`production-${c.site}.json`),JSON.stringify(record,null,2)+'\n');return record;
}));
const report={checkedAt:new Date().toISOString(),readOnly:true,sites:results.map(({files,...r})=>r),ok:results.every(r=>r.stage==='success'&&!r.differences.length)};
writeFileSync(join(output,'production-baseline.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({...report,sites:report.sites.map(({differences,...r})=>({...r,differences: differences.slice(0,8)}))},null,2));
if(!report.ok)process.exitCode=1;
