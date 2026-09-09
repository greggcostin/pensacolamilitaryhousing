// Restore previously published identity connections and missing downloads without replacing page content.
import {readFileSync,writeFileSync,readdirSync,existsSync,mkdirSync} from 'node:fs';
import {join,relative,dirname,extname} from 'node:path';import {createHash} from 'node:crypto';import {blake3} from '@noble/hashes/blake3';
import {linkBusinessRecord} from './identity-page-lib.mjs';
const dir='docs/seo-geo-2026-09-06/projects/03-accuracy/financial',path=dir+'/candidate-manifest.json';
const manifest=JSON.parse(readFileSync(path,'utf8')),changes=new Map(manifest.changes.map(c=>[c.site+':'+c.path,c]));
const hash=b=>createHash('sha256').update(b).digest('hex');
const walk=d=>readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(d,e.name)):e.isFile()?[join(d,e.name)]:[]);
const add=(site,p,bytes,reason)=>{const oldPath=join(manifest.baseline,site,p),old=existsSync(oldPath)?readFileSync(oldPath):null;mkdirSync(dirname(join(manifest.candidate,site,p)),{recursive:true});writeFileSync(join(manifest.candidate,site,p),bytes);const prior=changes.get(site+':'+p);changes.set(site+':'+p,{site,path:p,reasons:[...new Set([...(prior?.reasons||[]),reason])],oldSha256:old?hash(old):null,sha256:hash(bytes)});};
let identityLinks=manifest.foundationRestored?.identityLinks||0;
for(const site of ['pmh','gc'])for(const file of walk(join(manifest.candidate,site)).filter(f=>f.endsWith('.html')&&!f.endsWith('404.html'))){const h=readFileSync(file,'utf8'),next=linkBusinessRecord(h);if(h!==next){identityLinks++;add(site,relative(join(manifest.candidate,site),file).replaceAll('\\','/'),next,'Restore the canonical professional-record link; preserve prose and review dates');}}
const prior=JSON.parse(readFileSync('docs/seo-geo-2026-09-06/projects/03-accuracy/published/production-pmh.json','utf8'));
const priorRoot='.coast-release/2026-09-08-pcs-va/pmh',restoredDownloads=[...(manifest.foundationRestored?.restoredDownloads||[])];
const library=readFileSync(join(manifest.candidate,'gc/resources/client-guides.html'),'utf8');
for(const match of library.matchAll(/href="https:\/\/pensacolamilitaryhousing\.com\/(downloads\/guides\/[^"/]+\.pdf)"/g)){
 const p=match[1];if(existsSync(join(manifest.candidate,'pmh',p)))continue;const bytes=readFileSync(join(priorRoot,p));
 const deployedHash=Buffer.from(blake3(bytes.toString('base64')+extname(p).slice(1))).toString('hex').slice(0,32);
 if(prior.files['/'+p]!==deployedHash)throw Error('Previously published PDF does not match its verified deployment: '+p);
 add('pmh',p,bytes,'Restore missing previously published PDF referenced by the civilian guide library');restoredDownloads.push({path:p,sourceDeployment:prior.deploymentId,sha256:hash(bytes),contentReview:'Prior published edition restored unchanged; no new PDF content review claimed.'});
}
const canonicalRecord=readFileSync(join(manifest.candidate,'gc/data/gregg-costin.json'));
if(!canonicalRecord.equals(readFileSync('public/data/gregg-costin.json')))throw Error('Canonical public identity differs from the verified source record');
for(const site of ['pmh','gc']){const p=join(manifest.candidate,site,'data/gregg-costin.json');if(!existsSync(p)||!readFileSync(p).equals(canonicalRecord))add(site,'data/gregg-costin.json',canonicalRecord,'Restore the identical public professional-record mirror');}
manifest.changes=[...changes.values()];manifest.foundationRestored={checkedAt:new Date().toISOString(),identityLinks,restoredDownloads,publicRecordMirrors:2};
writeFileSync(path,JSON.stringify(manifest,null,2)+'\n');console.log(JSON.stringify(manifest.foundationRestored,null,2));
