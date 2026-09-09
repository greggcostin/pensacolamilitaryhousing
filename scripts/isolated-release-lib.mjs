import {readFileSync,writeFileSync,readdirSync,existsSync,cpSync,mkdirSync} from 'node:fs';
import {join,relative,resolve} from 'node:path';
import {createHash} from 'node:crypto';
export const walk=p=>readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(p,e.name)):[join(p,e.name)]);
export const sha=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
export const json=p=>JSON.parse(readFileSync(p,'utf8'));
export function save(p,data){mkdirSync(resolve(p,'..'),{recursive:true});writeFileSync(p,JSON.stringify(data,null,2)+'\n');}
export function fingerprint(root){const h=createHash('sha256');for(const p of walk(root).sort())h.update(relative(root,p).replaceAll('\\','/')+'\0'+sha(p)+'\n');return h.digest('hex');}
export function stageBaseline(proof,candidate){
  if(!proof.ok)throw Error('Verified complete production baseline required');
  if(existsSync(candidate)){
    if(JSON.stringify(json(join(candidate,'baseline.json')))!==JSON.stringify(proof))throw Error('Candidate belongs to another baseline');
  }else{
    mkdirSync(candidate,{recursive:true});for(const s of proof.sites)cpSync(s.localBaseline,join(candidate,s.site),{recursive:true,errorOnExist:true,force:false});
    save(join(candidate,'baseline.json'),proof);
  }
}
export function inventory(proof,candidate){
  const changes=[],removed=[],preserved={};
  for(const s of proof.sites){
    const root=join(candidate,s.site);preserved[s.site]=0;
    for(const f of walk(root)){const path=relative(root,f).replaceAll('\\','/'),before=join(s.localBaseline,path),a=sha(f),b=existsSync(before)?sha(before):null;if(a===b)preserved[s.site]++;else changes.push({site:s.site,path,before:b,sha256:a});}
    for(const f of walk(s.localBaseline)){const path=relative(s.localBaseline,f);if(!existsSync(join(root,path)))removed.push({site:s.site,path});}
  }
  return {builtAt:new Date().toISOString(),candidate:resolve(candidate),production:proof.sites,changes,preserved,removed};
}
