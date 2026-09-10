// Record the reviewed candidate without publishing or changing its contents.
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve,join,relative,extname} from 'node:path';
import {gzipSync,brotliCompressSync} from 'node:zlib';
import {blake3} from '@noble/hashes/blake3';
import {walk,sha,fingerprint} from './isolated-release-lib.mjs';
import {coastalVersion} from './civilian-coastal-theme.mjs';
const dir=resolve('docs/coastal-theme-2026-09-10');
const root=resolve('.coast-release/coastal-theme-20260910/gc');
const read=name=>JSON.parse(readFileSync(join(dir,name),'utf8'));
const preserved=read('preservation.json'),review=read('browser-review.json'),baseline=read('baseline-restoration.json');
if(!preserved.ok||!review.passed||!baseline.ok||resolve(preserved.root)!==root||resolve(review.candidate)!==root)throw Error('A verified, reviewed candidate is required.');
const configuration=new Set(['_headers','_redirects','_routes.json']);
const assets=walk(root).sort().map(file=>{
 const path=relative(root,file).replaceAll('\\','/'),bytes=readFileSync(file),isConfig=configuration.has(path);
 return {path,bytes:bytes.length,sha256:sha(file),...(isConfig?{configuration:true}:{providerHash:Buffer.from(blake3(bytes.toString('base64')+extname(path).slice(1))).toString('hex').slice(0,32)})};
});
const css=readFileSync(join(root,'assets/civilian-coastal-theme.css'));
const sourceFiles=['civilian-coastal-theme.css','civilian-coastal-theme.mjs','apply-civilian-coastal-theme.mjs','check-civilian-coastal-theme.mjs','stage-civilian-coastal-baseline.mjs','seal-civilian-coastal-theme.mjs','check-coastal-production.mjs','publish-civilian-coastal-theme.mjs','prepare-civilian-delivery.mjs'].map(name=>({path:'scripts/'+name,sha256:sha(join('scripts',name))}));
for(const path of ['scripts/civilian-search-city-cards.mjs','scripts/apply-civilian-search-city-cards.mjs','content/design/search-city-cards-2026-09-10.json'])sourceFiles.push({path,sha256:sha(path)});
sourceFiles.push({path:'scripts/civilian-review-badges.mjs',sha256:sha('scripts/civilian-review-badges.mjs')});
for(const path of ['scripts/civilian-contact-photo.mjs','content/design/contact-palafox-night-2026-09-10.json'])sourceFiles.push({path,sha256:sha(path)});
const manifest={sealedAt:new Date().toISOString(),status:'reviewed_local_candidate_not_published',project:'greggcostin',candidate:root,baselineDeploymentId:baseline.deploymentId,baselineEvidence:'docs/coastal-theme-2026-09-10/production/production-gc.json',candidateSha256:fingerprint(root),themeVersion:coastalVersion(),publicAssetCount:assets.filter(a=>!a.configuration).length,configurationSource:baseline.configurationSource,themeBytes:{minified:css.length,gzip:gzipSync(css).length,brotli:brotliCompressSync(css).length},sourceFiles,evidence:['preservation.json','browser-review.json','baseline-restoration.json'].map(path=>({path,sha256:sha(join(dir,path))})),assets};
writeFileSync(join(dir,'candidate-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({status:manifest.status,candidate:root,baselineDeploymentId:manifest.baselineDeploymentId,candidateSha256:manifest.candidateSha256,publicAssetCount:manifest.publicAssetCount,themeVersion:manifest.themeVersion,themeBytes:manifest.themeBytes},null,2));
