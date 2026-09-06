// Official Alabama 2024-2025 school accountability, independently matched by state IDs.
// node scripts/import-alabama-school-grades.mjs [--download] [--check]
// Default/check are offline and use the committed original ALSDE workbooks.
// Built-in ZIP/XML support avoids an XLSX runtime dependency in production builds.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {inflateRawSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const ROOT=fileURLToPath(new URL('..',import.meta.url));
const sourceFolder=resolve(ROOT,'content/schools/sources/alabama-2025');
const output=resolve(ROOT,'content/schools/alabama-grades-2025.json');
const sourcePage='https://www.alabamaachieves.org/reports-data/school-performance/';
const technicalGuide='https://www.alabamaachieves.org/wp-content/uploads/2025/10/RD_SP_20251021_Fall2025StateTechnicalGuide_v1.pdf';
const sources={
  letters:{file:'letter-grades.xlsx',url:'https://www.alabamaachieves.org/wp-content/uploads/2025/11/RD_SP_20251113_2024-2025StateAccountabilityLetterGrades_v1.xlsx',sheet:'State Letter Grades'},
  indicators:{file:'indicator-scores.xlsx',url:'https://www.alabamaachieves.org/wp-content/uploads/2025/11/RD_SP_20251113_2024-2025StateAccountabilityIndicatorScores_v1.xlsx',sheet:'State Indicators Scores'}
};
const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
const decode=value=>String(value).replace(/&#x([0-9a-f]+);/gi,(_,n)=>String.fromCodePoint(parseInt(n,16))).replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n))).replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&amp;/g,'&');
const xmlText=xml=>[...xml.matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g)].map(m=>decode(m[1])).join('');
function zipText(archive,wanted){
  let eocd=-1;for(let i=archive.length-22;i>=Math.max(0,archive.length-65557);i--)if(archive.readUInt32LE(i)===0x06054b50){eocd=i;break;}
  assert(eocd>=0,'XLSX ZIP directory missing');assert.equal(archive.readUInt16LE(eocd+4),0,'Multi-disk ZIP unsupported');
  let offset=archive.readUInt32LE(eocd+16);const count=archive.readUInt16LE(eocd+10);
  for(let i=0;i<count;i++){
    assert.equal(archive.readUInt32LE(offset),0x02014b50,'Invalid ZIP directory');
    const flags=archive.readUInt16LE(offset+8),method=archive.readUInt16LE(offset+10),compressed=archive.readUInt32LE(offset+20),expanded=archive.readUInt32LE(offset+24),nameLength=archive.readUInt16LE(offset+28),extraLength=archive.readUInt16LE(offset+30),commentLength=archive.readUInt16LE(offset+32),localOffset=archive.readUInt32LE(offset+42);
    const name=archive.subarray(offset+46,offset+46+nameLength).toString('utf8');
    if(name===wanted){
      assert(!(flags&1)&&[0,8].includes(method)&&expanded<32*1024*1024,'Unsupported or oversized XLSX entry');
      assert.equal(archive.readUInt32LE(localOffset),0x04034b50,'Invalid ZIP local entry');
      const start=localOffset+30+archive.readUInt16LE(localOffset+26)+archive.readUInt16LE(localOffset+28);assert(start+compressed<=archive.length,'Truncated XLSX');
      const data=archive.subarray(start,start+compressed),bytes=method===0?data:inflateRawSync(data,{maxOutputLength:32*1024*1024});assert.equal(bytes.length,expanded);return bytes.toString('utf8');
    }
    offset+=46+nameLength+extraLength+commentLength;
  }
  throw Error('XLSX entry missing: '+wanted);
}
function workbook(bytes,expectedSheet){
  const book=zipText(bytes,'xl/workbook.xml');assert(book.includes('name="'+expectedSheet+'"'),'Unexpected workbook sheet');assert.equal((book.match(/<sheet\s/g)||[]).length,1,'Unexpected multiple sheets');
  const strings=[...zipText(bytes,'xl/sharedStrings.xml').matchAll(/<si(?:\s[^>]*)?>([\s\S]*?)<\/si>/g)].map(m=>xmlText(m[1]));
  const rows=[];
  for(const row of zipText(bytes,'xl/worksheets/sheet1.xml').matchAll(/<row\b[^>]*\br="(\d+)"[^>]*>([\s\S]*?)<\/row>/g)){
    const values=[];
    for(const cell of row[2].matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)){
      const ref=cell[1].match(/\br="([A-Z]+)\d+"/)?.[1];assert(ref,'Cell coordinate missing');let column=0;for(const c of ref)column=column*26+c.charCodeAt(0)-64;
      const body=cell[2]||'';assert(!/<f\b/.test(body),'Unexpected formula; use published values');
      const type=cell[1].match(/\bt="([^"]+)"/)?.[1],raw=body.match(/<v>([\s\S]*?)<\/v>/)?.[1];
      let value=null;if(type==='s'){assert(Number(raw)<strings.length);value=strings[Number(raw)];}else if(type==='inlineStr')value=xmlText(body);else if(raw!==undefined){value=Number(raw);assert(Number.isFinite(value),'Invalid numeric source value');}
      values[column-1]=value;
    }
    rows.push({row:Number(row[1]),values});
  }
  assert(rows[0].values[0].includes('2024-2025'),'Wrong source school year');return rows;
}
for(const source of Object.values(sources)){
  const file=resolve(sourceFolder,source.file);
  if(process.argv.includes('--download')){const response=await fetch(source.url,{signal:AbortSignal.timeout(45000)});assert(response.ok,'ALSDE HTTP '+response.status);const bytes=Buffer.from(await response.arrayBuffer());assert(bytes.length<8*1024*1024,'Unexpectedly large source');mkdirSync(dirname(file),{recursive:true});writeFileSync(file,bytes);}
  assert(existsSync(file),'Missing cached source; use --download');const bytes=readFileSync(file);source.sha256=sha256(bytes);source.bytes=bytes.length;source.rows=workbook(bytes,source.sheet);
}
const letters=sources.letters.rows,indicators=sources.indicators.rows;
assert.deepEqual(letters.find(r=>r.values[0]==='System Code')?.values.slice(0,6),['System Code','System Name','School Code','School Name','Total Points Earned','Letter Grade']);
assert.deepEqual(indicators.find(r=>r.values[0]==='System Code')?.values.slice(0,7),['System Code','System Name','School Code','School Name','Subpopulation','Indicator','Indicator Score']);
const districts=new Map([[2,'Baldwin County'],[152,'Gulf Shores City'],[174,'Orange Beach City']]);
const key=(district,school)=>Number(district)+':'+Number(school);
const nameKey=name=>String(name).toLowerCase().replace(/[^a-z0-9]/g,'');
const published=letters.filter(r=>districts.has(r.values[0])&&Number.isInteger(r.values[2])&&r.values[2]>0);
const schoolRows=new Map(published.map(r=>[key(r.values[0],r.values[2]),r]));assert.equal(schoolRows.size,published.length,'Duplicate school-level result');
const directory=JSON.parse(readFileSync(resolve(ROOT,'civilian-site/assets/school-finder-data.json'),'utf8'));
const all=directory.schools.filter(s=>s.state==='AL'&&s.sector==='public');
const used=new Set();
const schools=all.map(s=>{
  assert(districts.has(Number(s.districtId)),'Unexpected Alabama district '+s.districtId);assert(Number(s.schoolId)>0,'District summary cannot be a school');
  const identity=key(s.districtId,s.schoolId),row=schoolRows.get(identity);
  const record={id:s.id,ncesId:s.ncesId,reportUrl:s.reportUrl,name:s.name,state:'AL',districtId:s.districtId,schoolId:s.schoolId,districtName:districts.get(Number(s.districtId)),schoolYear:'2024-2025',grade:null,score:null,gradeStatus:'not-published',officialGrade:null,officialName:null,matchMethod:null,sourceRow:null,sourceUrl:sources.letters.url,indicators:[]};
  if(!row){record.reason='No school-level record with this district and school code appears in the official 2024-2025 letter-grade workbook. No district result has been substituted.';return record;}
  const v=row.values;assert.equal(v[1],record.districtName,'District name/code conflict');assert.equal(nameKey(v[3]),nameKey(s.name),'School name/code conflict: '+s.name+' vs '+v[3]);used.add(identity);
  Object.assign(record,{officialName:v[3].trim(),officialGrade:v[5],matchMethod:'exact-district-and-school-code-with-normalized-name-check',sourceRow:row.row});
  if(/^[ABCDF]$/.test(v[5])){assert(Number.isInteger(v[4])&&v[4]>=0&&v[4]<=100,'Invalid total score');Object.assign(record,{grade:v[5],score:v[4],gradeStatus:'graded'});}
  else{assert(['AW','ID'].includes(v[5]),'Unknown official grade status');assert.equal(v[4],v[5],'Unexpected ungraded total points');record.gradeStatus=v[5]==='AW'?'approved-waiver':'insufficient-data';record.reason=v[5]==='AW'?'ALSDE reports AW (Approved Waiver) for both total points and letter grade. No numeric score or letter grade is assigned.':'ALSDE reports ID (Insufficient Data); no numeric score or letter grade is assigned.';}
  const componentRows=indicators.filter(r=>key(r.values[0],r.values[2])===identity&&r.values[4]==='All Students');
  const seen=new Set();
  record.indicators=componentRows.map(r=>{const v=r.values;assert.equal(v[1],record.districtName);assert.equal(nameKey(v[3]),nameKey(record.officialName));assert(!seen.has(v[5]),'Duplicate indicator');seen.add(v[5]);assert(typeof v[6]==='number'&&Number.isFinite(v[6]),'Unknown indicator value');return{name:v[5],value:v[6],subpopulation:'All Students',sourceRow:r.row,sourceUrl:sources.indicators.url};}).sort((a,b)=>a.name.localeCompare(b.name));
  if(record.gradeStatus==='graded')assert(record.indicators.length>=3,'Graded school lacks indicator rows');
  return record;
});
const missingFromDirectory=published.filter(r=>!used.has(key(r.values[0],r.values[2]))).map(r=>({districtId:r.values[0],schoolId:r.values[2],name:r.values[3],sourceRow:r.row}));
assert.equal(missingFromDirectory.length,0,'Official covered-district schools absent from directory');
const counts={directoryPublicSchools:schools.length,matchedSchoolRows:used.size,graded:schools.filter(s=>s.gradeStatus==='graded').length,approvedWaiver:schools.filter(s=>s.gradeStatus==='approved-waiver').length,insufficientData:schools.filter(s=>s.gradeStatus==='insufficient-data').length,notPublished:schools.filter(s=>s.gradeStatus==='not-published').length};
const result={schemaVersion:1,state:'AL',authority:'Alabama State Department of Education',system:'Alabama State Accountability',schoolYear:'2024-2025',releaseYear:2025,checkedAt:'2026-09-06',sourcePage,technicalGuide,sources:Object.fromEntries(Object.entries(sources).map(([k,{rows,...s}])=>[k,{...s,localPath:'content/schools/sources/alabama-2025/'+s.file}])),methodology:{matching:'Only exact Alabama system and school codes are matched, with a normalized name agreement check. System/state summary rows and private schools are excluded.',scores:'Total points and letter grades are copied from the official school row. AW and ID remain ungraded. Indicator values are copied only for the All Students group.',comparison:'Alabama and Florida use different accountability calculations. These grades and indicator scores must not be represented as a single interstate school ranking.',indicatorMeaning:'Indicator scores are not all proficiency percentages. Graduation and college/career indicators use 2023-2024 cohort data in this 2024-2025 report; see the state technical guide.'},counts,missingFromDirectory,schools};
const serialized=JSON.stringify(result,null,2)+'\n';
if(process.argv.includes('--check'))assert.equal(readFileSync(output,'utf8').replaceAll('\r\n','\n'),serialized,'Alabama grades snapshot is stale');else writeFileSync(output,serialized);
console.log(JSON.stringify({output,schoolYear:result.schoolYear,counts,unmatched:schools.filter(s=>s.gradeStatus==='not-published').map(s=>({name:s.name,districtId:s.districtId,schoolId:s.schoolId,reason:s.reason})),sourceHashes:Object.fromEntries(Object.entries(sources).map(([k,s])=>[k,s.sha256]))},null,2));
