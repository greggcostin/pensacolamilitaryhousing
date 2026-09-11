import fs from 'node:fs';
import path from 'node:path';
import {walk} from './isolated-release-lib.mjs';
import {preparePageLoading} from './page-loading-lib.mjs';
const i=process.argv.indexOf('--root');if(i<0)throw Error('Provide a complete source or candidate root');
const root=path.resolve(process.argv[i+1]);
const spaIndex=process.argv.indexOf('--spa-entry'),spaEntry=spaIndex<0?null:path.resolve(process.argv[spaIndex+1]);
if(!fs.existsSync(path.join(root,'index.html'))&&!(spaEntry&&fs.existsSync(spaEntry)&&fs.existsSync(path.join(root,'sitemap.xml'))))throw Error('Complete site root or military source with --spa-entry required');
const changes=[];
for(const f of [...walk(root).filter(f=>f.endsWith('.html')),...(spaEntry?[spaEntry]:[])]){
 const old=fs.readFileSync(f,'utf8'),result=preparePageLoading(old,{hasAsset:p=>p.startsWith('/')&&fs.existsSync(path.join(root,p.slice(1)))});
 if(result.html!==old){fs.writeFileSync(f,result.html);changes.push({path:path.relative(root,f).split(path.sep).join('/'),...result.details});}
}
console.log(JSON.stringify({root,changed:changes.length,searchStylesMoved:changes.filter(c=>c.searchStylesMoved).length,remoteFontsRemoved:changes.filter(c=>c.remoteFontsRemoved).length,duplicateFontHints:changes.reduce((n,c)=>n+c.duplicateFontHints,0),scenePreloads:changes.filter(c=>c.preloads.some(p=>!p.startsWith('/fonts/'))).length}));
const outIndex=process.argv.indexOf('--report');if(outIndex>=0){const out=process.argv[outIndex+1];fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(changes,null,2)+'\n');}
