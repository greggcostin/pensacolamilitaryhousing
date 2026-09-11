// Preserve this verified release in the operational checkout and advance its review baseline.
// Root source is dirty: only the two unchanged canonical entity files may be reconciled.
import {readFileSync,writeFileSync,cpSync,existsSync,mkdirSync} from 'node:fs';
import {join,resolve,sep} from 'node:path';
import {execFileSync} from 'node:child_process';
import {json,save,fingerprint} from './isolated-release-lib.mjs';
const root=resolve('C:/Users/gregg/pensacolamilitaryhousing');
const evidence='docs/geo-execution-2026-09-10/identity-release';
const c=json(join(evidence,'candidate.json')),live=json(join(evidence,'live/production-baseline.json'));
if(!live.ok||live.sites.some(s=>!s.ok))throw Error('Verified publication required');
const destination=resolve(root,'.coast-release/geo-identity-20260910');
if(!destination.startsWith(root+sep+'.coast-release'+sep))throw Error('Unsafe release destination');
const originals={};
for(const p of ['content/entity/entity.json','content/entity/evidence.json']){
 const original=execFileSync('git',['show','bbf3d4a9635e3b27692f76c81fa2c87f51f3fe54:'+p],{encoding:'utf8'}),actual=readFileSync(join(root,p),'utf8'),updated=readFileSync(p,'utf8');
 if(actual.replaceAll('\r\n','\n')!==original.replaceAll('\r\n','\n')&&actual!==updated)throw Error('Canonical root data changed independently: '+p);
 originals[p]=actual;
}
const configPath=join(root,'content/reviews/automation.json'),configBefore=readFileSync(configPath,'utf8'),config=JSON.parse(configBefore);
if(!existsSync(destination))cpSync(c.candidate,destination,{recursive:true,errorOnExist:true,force:false});
if(fingerprint(destination)!==fingerprint(c.candidate))throw Error('Durable release copy does not match tested candidate');
const rootEvidence=join(root,evidence);mkdirSync(rootEvidence,{recursive:true});
for(const name of ['candidate.json','quality-gates.json','deployment.json','civilian-library-health.json','google-cohort-before.json'])if(existsSync(join(evidence,name)))cpSync(join(evidence,name),join(rootEvidence,name),{errorOnExist:true,force:false});
const proof={...live,sites:live.sites.map(s=>({...s,localBaseline:join(destination,s.site)}))};
save(join(rootEvidence,'production-baseline.json'),proof);
save(join(rootEvidence,'canonical-source-before.json'),originals);
save(join(rootEvidence,'automation-before.json'),config);
for(const [p,before] of Object.entries(originals)){
 if(readFileSync(join(root,p),'utf8')!==before)throw Error('Canonical source changed during reconciliation');
 writeFileSync(join(root,p),readFileSync(p));
}
Object.assign(config,{baselineRoot:destination,lastSiteReleaseAt:live.checkedAt,lastProductionVerifiedAt:live.checkedAt,lastSiteReleaseEvidence:evidence+'/production-baseline.json',currentDeployments:Object.fromEntries(live.sites.map(s=>[s.site,s.deploymentId]))});
if(readFileSync(configPath,'utf8')!==configBefore)throw Error('Review configuration changed during release recording');
save(configPath,config);
const result={recordedAt:new Date().toISOString(),baselineRoot:destination,productionEvidence:join(rootEvidence,'production-baseline.json'),canonicalFilesReconciled:Object.keys(originals),reviewObservationDatesPreserved:true,automationId:config.automationId,currentDeployments:config.currentDeployments,ok:fingerprint(destination)===fingerprint(c.candidate)&&json(configPath).baselineRoot===destination};
save(join(evidence,'operational-readback.json'),result);console.log(JSON.stringify(result,null,2));
