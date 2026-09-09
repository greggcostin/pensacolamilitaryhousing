// Submit only the reviewed and publicly verified HTML changes. Existing receipts deduplicate.
import {readFileSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const arg=(name,fallback)=>process.argv.includes(name)?process.argv[process.argv.indexOf(name)+1]:fallback;
const dir=arg('--out','docs/seo-geo-2026-09-06/projects/03-accuracy');
const manifest=JSON.parse(readFileSync(arg('--manifest',dir+'/candidate-manifest.json'),'utf8'));
if(!JSON.parse(readFileSync(dir+'/live-verification.json','utf8')).ok||!JSON.parse(readFileSync(dir+'/published/production-baseline.json','utf8')).ok)throw Error('Publication is not verified.');
const reports=[];
for(const site of ['pmh','gc']){
 const origin=site==='pmh'?'https://pensacolamilitaryhousing.com':'https://greggcostin.com';
 const urls=manifest.changes.filter(x=>x.site===site&&x.path.endsWith('.html')).map(x=>origin+(x.path==='index.html'?'/':'/'+x.path.replace(/\.html$/,'')));
 const r=spawnSync(process.execPath,['scripts/submit-indexnow.mjs','--site',site,'--urls',urls.join(',')],{encoding:'utf8',env:process.env});
 const result={site,urls,exitCode:r.status,output:r.stdout.trim(),error:r.stderr.trim()};reports.push(result);console.log(JSON.stringify({...result,urls:urls.length},null,2));
 if(r.status!==0)process.exitCode=1;
}
writeFileSync(dir+'/indexing-receipts.json',JSON.stringify({checkedAt:new Date().toISOString(),scope:'Changed HTML only. Acceptance is not indexing or ranking evidence.',reports},null,2)+'\n');
