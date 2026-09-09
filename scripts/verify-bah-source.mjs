// Verify the saved official archive and every rate used by the React/build source.
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {BAH_DATA} from '../src/bahData.js';
const data=JSON.parse(readFileSync('content/client-guides/bah-2026.json','utf8'));
const zip=readFileSync('content/client-guides/research/BAH-ASCII-2026.zip');
const sha=createHash('sha256').update(zip).digest('hex');
if(sha!==data.sourceSha256)throw Error('Official archive hash differs from source provenance');
const dir='docs/seo-geo-2026-09-06/projects/03-accuracy';mkdirSync(dir,{recursive:true});
const order=[...Array.from({length:9},(_,i)=>`E-${i+1}`),...Array.from({length:5},(_,i)=>`W-${i+1}`),'O-1E','O-2E','O-3E',...Array.from({length:10},(_,i)=>`O-${i+1}`)];
const official={};
for(const [key,file] of [['withDependents','bahw26.txt'],['withoutDependents','bahwo26.txt']])for(const line of readFileSync('content/data/sources/bah-2026/'+file,'utf8').split(/\r?\n/)){
 const [mha,...values]=line.split(',');if(!BAH_DATA[mha])continue;if(values.length!==order.length)throw Error('Unexpected official rate columns');
 official[mha]||={};for(const [i,grade] of order.entries()){official[mha][grade]||={};official[mha][grade][key]=Number(values[i]);}
}
const names=Object.fromEntries(readFileSync('content/data/sources/bah-2026/mhanames26.txt','utf8').split(/\r?\n/).filter(Boolean).map(x=>x.split(';')));
const findings=[];let checks=0;
for(const [mha,area] of Object.entries(BAH_DATA))for(const [grade,w,wo] of [...area.enlisted,...area.warrant,...area.officer])for(const [key,actual] of [['withDependents',w],['withoutDependents',wo]]){checks++;if(actual!==official[mha]?.[grade]?.[key]||actual!==data.areas[mha]?.rates[grade]?.[key])findings.push({mha,grade,key,actual,official:official[mha]?.[grade]?.[key]});}
const result={checkedAt:new Date().toISOString(),ok:!findings.length,rateValuesChecked:checks,source:data.source,archiveRetrieved:data.retrieved,sha256:sha,areaNames:Object.fromEntries(Object.keys(BAH_DATA).map(k=>[k,names[k]])),freshDownload:'2026-09-08 public archive request returned HTTP 403. Existing September 6 official archive verified against its stored hash and parsed directly.',currentAreaVerification:'https://www.travel.dod.mil/Portals/119/Documents/BAH/PDF_BAH-Rate-Component-Breakdown/2026-BAH-Rate-Component-Breakdown.pdf',findings};
writeFileSync(dir+'/bah-source-verification.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));if(findings.length)process.exitCode=1;
