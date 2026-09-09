// Public, read-only source capture. Retain the complete selected rows and source hashes.
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createInterface} from 'node:readline';
import {Readable,Transform} from 'node:stream';
const out='content/data/sources/bah-ownership-2026';mkdirSync(out,{recursive:true});
const zips=new Set(['32501','32502','32503','32504','32505','32506','32507','32514','32526','32533','32534','32536','32539','32541','32547','32548','32561','32563','32566','32569','32570','32571','32578','32579','32580','32583']);
export function csvRow(line,sep=','){const out=[];let v='',quoted=false;for(let i=0;i<line.length;i++){const c=line[i];if(c==='"'){if(quoted&&line[i+1]==='"'){v+='"';i++;}else quoted=!quoted;}else if(c===sep&&!quoted){out.push(v);v='';}else v+=c;}out.push(v);return out;}
const sources=[
 {id:'zhvi',url:'https://files.zillowstatic.com/research/public_csvs/zhvi/Zip_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv',sep:',',key:'RegionName'},
 {id:'zcta-counties',url:'https://www2.census.gov/geo/docs/maps-data/data/rel2020/zcta520/tab20_zcta520_county20_natl.txt',sep:'|',key:'GEOID_ZCTA5_20'}
];
const records=[];
for(const s of sources){const record={id:s.id,url:s.url,retrievedAt:new Date().toISOString()};try{
 const r=await fetch(s.url,{signal:AbortSignal.timeout(90000)});record.httpStatus=r.status;record.lastModified=r.headers.get('last-modified');if(!r.ok)throw Error(`HTTP ${r.status}`);
 const hash=createHash('sha256');let bytes=0;const stream=Readable.fromWeb(r.body).pipe(new Transform({transform(chunk,enc,cb){hash.update(chunk);bytes+=chunk.length;cb(null,chunk);}}));
 let header,index,lines=[],rows=[];for await(const line of createInterface({input:stream,crlfDelay:Infinity})){if(!line)continue;const c=csvRow(line,s.sep);if(!header){header=c;index=c.indexOf(s.key);if(index<0)throw Error('Source schema changed');lines.push(line);continue;}if(zips.has(c[index])){lines.push(line);rows.push(Object.fromEntries(header.map((k,i)=>[k,c[i]])));}}
 record.sourceSha256=hash.digest('hex');record.sourceBytes=bytes;record.selectedRows=rows.length;record.header=header;record.status='captured';writeFileSync(`${out}/${s.id}-selected.txt`,lines.join('\n')+'\n');writeFileSync(`${out}/${s.id}-selected.json`,JSON.stringify(rows,null,2)+'\n');record.selectedSha256=createHash('sha256').update(readFileSync(`${out}/${s.id}-selected.txt`)).digest('hex');
 }catch(e){record.status='unavailable';record.error=e.message;}records.push(record);}
writeFileSync(`${out}/capture.json`,JSON.stringify(records,null,2)+'\n');console.log(JSON.stringify(records.map(({header,...r})=>r),null,2));
