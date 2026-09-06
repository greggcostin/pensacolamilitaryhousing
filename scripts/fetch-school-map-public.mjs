// Official NCES school locations plus exact CCD state identifiers.
// Run normally to refresh the four-county source subset; --cached rebuilds offline.
// Only directory/operational fields are retained. No demographic fields are used.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createHash } from 'node:crypto';
import XLSX from 'xlsx';

const output = 'content/schools/map-public-source.json';
const evidenceDir = 'docs/school-map-2026-09-06';
const cacheFile = join(evidenceDir, 'public-nces-source-subset.json');
const sourceYear = '2024-25';
const adminLayer = 'https://nces.ed.gov/opengis/rest/services/K12_School_Locations/EDGE_ADMINDATA_PUBLICSCH_2425/MapServer/1';
const directoryUrl = 'https://nces.ed.gov/ccd/Data/zip/ccd_sch_029_2425_w_1a_073025.zip';
const characteristicsUrl = 'https://nces.ed.gov/ccd/Data/zip/ccd_sch_129_2425_w_1a_073025.zip';
const fileCatalogUrl = 'https://nces.ed.gov/ccd/datatables/api/File/2/7/39/0/0/0';
const counties = { '12033': 'Escambia', '12113': 'Santa Rosa', '12091': 'Okaloosa', '01003': 'Baldwin' };
const adminFields = ['NCESSCH','SURVYEAR','LEAID','ST_LEAID','LEA_NAME','SCH_NAME','LSTREET1','LSTREET2','LCITY','LSTATE','LZIP','PHONE','CHARTER_TEXT','VIRTUAL','GSLO','GSHI','SCHOOL_LEVEL','STATUS','SCHOOL_TYPE_TEXT','SY_STATUS_TEXT','NMCNTY','CNTY','LATCOD','LONCOD'];
const gradeFields = ['G_PK_OFFERED','G_KG_OFFERED',...Array.from({length:13},(_,i)=>`G_${i+1}_OFFERED`),'G_UG_OFFERED','G_AE_OFFERED'];
const directoryFields = ['SCHOOL_YEAR','ST','SCH_NAME','LEA_NAME','ST_LEAID','LEAID','ST_SCHID','NCESSCH','SCHID','LSTREET1','LSTREET2','LSTREET3','LCITY','LSTATE','LZIP','PHONE','WEBSITE','SY_STATUS','SY_STATUS_TEXT','UPDATED_STATUS','UPDATED_STATUS_TEXT','EFFECTIVE_DATE','SCH_TYPE_TEXT','SCH_TYPE','CHARTER_TEXT','GSLO','GSHI','LEVEL',...gradeFields];
const characteristicsFields = ['SCHOOL_YEAR','NCESSCH','ST_LEAID','ST_SCHID','VIRTUAL','VIRTUAL_TEXT'];
const clean = value => value == null ? '' : String(value).trim();

async function fetchBuffer(url) {
  const response = await fetch(url, {signal:AbortSignal.timeout(90000)});
  if (!response.ok) throw new Error(`Source returned HTTP ${response.status}: ${url}`);
  return Buffer.from(await response.arrayBuffer());
}

function* csvRows(text) {
  let row=[], cell='', quoted=false;
  for(let i=0;i<text.length;i++) {
    const c=text[i];
    if(quoted) {
      if(c==='"' && text[i+1]==='"') { cell+='"'; i++; }
      else if(c==='"') quoted=false;
      else cell+=c;
    } else if(c==='"' && cell==='') quoted=true;
    else if(c===',') { row.push(cell); cell=''; }
    else if(c==='\n') { row.push(cell.replace(/\r$/,'')); yield row; row=[]; cell=''; }
    else cell+=c;
  }
  if(cell!=='' || row.length) { row.push(cell.replace(/\r$/,'')); yield row; }
}

function selectedArchiveRows(buffer, wantedIds, retainedFields) {
  const archive = XLSX.CFB.read(buffer, {type:'buffer'});
  const index = archive.FullPaths.findIndex(path=>/\.csv$/i.test(path));
  if(index<0) throw new Error('NCES archive has no CSV file');
  const text = Buffer.from(archive.FileIndex[index].content).toString('utf8').replace(/^\uFEFF/,'');
  const rows = csvRows(text);
  const header = rows.next().value;
  const idIndex = header.indexOf('NCESSCH');
  if(idIndex<0) throw new Error('NCES directory is missing NCESSCH');
  const indices = retainedFields.map(field=>[field,header.indexOf(field)]);
  const selected=[];
  for(const row of rows) if(wantedIds.has(row[idIndex])) {
    selected.push(Object.fromEntries(indices.filter(([,i])=>i>=0).map(([field,i])=>[field,clean(row[i])])));
  }
  return selected;
}

async function archiveBytes(url, name) {
  const target=join(tmpdir(),name);
  if(existsSync(target) && !process.argv.includes('--refresh')) return readFileSync(target);
  const bytes=await fetchBuffer(url);
  writeFileSync(target,bytes);
  return bytes;
}

async function collect() {
  const query = new URL(adminLayer+'/query');
  query.search=new URLSearchParams({f:'json',where:`CNTY IN (${Object.keys(counties).map(c=>`'${c}'`).join(',')})`,outFields:adminFields.join(','),returnGeometry:'false',resultRecordCount:'2000',orderByFields:'NCESSCH'});
  const result=JSON.parse((await fetchBuffer(query)).toString('utf8'));
  if(result.error || !result.features?.length || result.exceededTransferLimit) throw new Error('Incomplete NCES GIS response: '+JSON.stringify(result.error||{}));
  const admin=result.features.map(f=>f.attributes);
  const ids=new Set(admin.map(row=>clean(row.NCESSCH)));
  const responses=await Promise.all([
    archiveBytes(directoryUrl,'costin-ccd-public-directory-2425.zip'),
    archiveBytes(characteristicsUrl,'costin-ccd-public-characteristics-2425.zip')
  ]);
  const data={
    retrieved:new Date().toISOString(),sourceYear,
    sources:{admin:adminLayer,adminQuery:query.toString(),directory:directoryUrl,characteristics:characteristicsUrl,fileCatalog:fileCatalogUrl},
    archiveSha256:{directory:createHash('sha256').update(responses[0]).digest('hex'),characteristics:createHash('sha256').update(responses[1]).digest('hex')},
    admin,
    directory:selectedArchiveRows(responses[0],ids,directoryFields),
    characteristics:selectedArchiveRows(responses[1],ids,characteristicsFields)
  };
  mkdirSync(evidenceDir,{recursive:true});
  writeFileSync(cacheFile,JSON.stringify(data,null,2)+'\n');
  return data;
}

function booleanValue(value) {
  const text=clean(value).toLowerCase();
  return text==='yes'?true:text==='no'?false:null;
}

function website(value) {
  const text=clean(value);
  if(!text || /^(?:-|n\/?a|null|not reported)$/i.test(text)) return null;
  try {
    const parsed=new URL(/^https?:\/\//i.test(text)?text:'https://'+text);
    return ['http:','https:'].includes(parsed.protocol) && parsed.hostname.includes('.') ? parsed.href : null;
  } catch { return null; }
}

function levelList(level, offeredGrades) {
  const named={Elementary:'elementary',Middle:'middle',High:'high'}[level];
  const list=[];
  const numeric=offeredGrades.map(g=>g==='KG'?0:/^\d+$/.test(g)?Number(g):null).filter(v=>v!==null);
  // Combined-school filters follow documented offered grades, not the name.
  if(numeric.some(g=>g>=0 && g<=5)) list.push('elementary');
  if(numeric.some(g=>g>=6 && g<=8)) list.push('middle');
  if(numeric.some(g=>g>=9 && g<=12)) list.push('high');
  if(named && !list.includes(named)) list.push(named);
  if(level==='Other'||level==='Combined') list.push('combined');
  return list;
}

const snapshot=process.argv.includes('--cached')?JSON.parse(readFileSync(cacheFile,'utf8')):await collect();
const directory=new Map(snapshot.directory.map(row=>[row.NCESSCH,row]));
const characteristics=new Map(snapshot.characteristics.map(row=>[row.NCESSCH,row]));
const excluded=[];
const schools=[];
for(const a of snapshot.admin) {
  const ncesId=clean(a.NCESSCH), d=directory.get(ncesId), c=characteristics.get(ncesId);
  if(!d) throw new Error('No exact CCD directory match for '+ncesId);
  const status=clean(d.UPDATED_STATUS||d.SY_STATUS||a.STATUS);
  if(['2','6','7'].includes(status)) {
    excluded.push({ncesId,name:clean(d.SCH_NAME),status,statusText:clean(d.UPDATED_STATUS_TEXT||d.SY_STATUS_TEXT)});
    continue;
  }
  const state=clean(d.ST||a.LSTATE), stateDistrictId=clean(d.ST_LEAID), stateSchoolId=clean(d.ST_SCHID);
  const stateIds=stateSchoolId.match(/^([A-Z]{2})-([^-]+)-(.+)$/);
  const districtId=stateDistrictId.replace(new RegExp('^'+state+'-'),'');
  const schoolId=stateIds?.[1]===state && stateIds[2]===districtId ? stateIds[3] : null;
  if(!schoolId) throw new Error('Unrecognized state school ID: '+stateSchoolId);
  const virtualCode=clean(c?.VIRTUAL).toUpperCase();
  const virtual=virtualCode==='NOTVIRTUAL'?false:['FULLVIRTUAL','FACEVIRTUAL','SUPPVIRTUAL'].includes(virtualCode)?true:null;
  const lowGrade=clean(d.GSLO||a.GSLO), highGrade=clean(d.GSHI||a.GSHI);
  const offeredGrades=gradeFields.filter(field=>booleanValue(d[field])===true).map(field=>field.replace(/^G_|_OFFERED$/g,'')).map(g=>/^\d+$/.test(g)?g.padStart(2,'0'):g);
  const schoolLevel=clean(d.LEVEL||a.SCHOOL_LEVEL);
  const lat=Number(a.LATCOD),lng=Number(a.LONCOD);
  const coordinatesValid=Number.isFinite(lat)&&Number.isFinite(lng)&&lat>=29&&lat<=32&&lng>=-89&&lng<=-85;
  if(!coordinatesValid) throw new Error('Out-of-region coordinates for '+ncesId);
  const record={
    id:'nces-'+ncesId,ncesId,state,districtId,schoolId,
    name:clean(d.SCH_NAME||a.SCH_NAME),
    address:[d.LSTREET1,d.LSTREET2,d.LSTREET3].map(clean).filter(Boolean).join(', '),
    city:clean(d.LCITY||a.LCITY),zip:clean(d.LZIP||a.LZIP),
    county:counties[clean(a.CNTY)],countyFips:clean(a.CNTY),
    lat:virtual===true?null:lat,lng:virtual===true?null:lng,
    levels:levelList(schoolLevel,offeredGrades),lowGrade,highGrade,offeredGrades,
    sector:'public',charter:booleanValue(d.CHARTER_TEXT),magnet:null,virtual,
    website:website(d.WEBSITE),phone:clean(d.PHONE||a.PHONE)||null,
    sourceUrl:`https://nces.ed.gov/ccd/schoolsearch/school_detail.asp?ID=${ncesId}`,
    sourceYear,
    locationStatus:virtual===true?'virtual-program-administrative-location':'reported-campus-location',
    rawIdentifiers:{NCESSCH:ncesId,LEAID:clean(a.LEAID),ST_LEAID:stateDistrictId,ST_SCHID:stateSchoolId,SCHID:clean(d.SCHID)},
    sourceCoordinates:{lat,lng},
    sourceFields:{schoolLevel,schoolType:clean(d.SCH_TYPE_TEXT||a.SCHOOL_TYPE_TEXT),status,statusText:clean(d.UPDATED_STATUS_TEXT||d.SY_STATUS_TEXT),effectiveDate:clean(d.EFFECTIVE_DATE),virtualCode,virtualText:clean(c?.VIRTUAL_TEXT||a.VIRTUAL),charterText:clean(d.CHARTER_TEXT),districtName:clean(d.LEA_NAME||a.LEA_NAME)}
  };
  schools.push(record);
}
schools.sort((a,b)=>a.state.localeCompare(b.state)||a.county.localeCompare(b.county)||a.name.localeCompare(b.name));
const gradeSource=JSON.parse(readFileSync('content/schools/school-grades-2026.json','utf8'));
const gradeKeys=new Set(gradeSource.schools.map(s=>`${s.district}:${s.num}`));
const matched=schools.filter(s=>s.state==='FL' && gradeKeys.has(`${s.districtId}:${s.schoolId}`));
const matchedKeys=new Set(matched.map(s=>`${s.districtId}:${s.schoolId}`));
const missingGrades=gradeSource.schools.filter(s=>!matchedKeys.has(`${s.district}:${s.num}`)).map(s=>({districtId:s.district,schoolId:s.num,name:s.name}));
const result={
  source:'NCES EDGE 2024–25 public school administrative locations, joined by NCESSCH to the official 2024–25 CCD Directory and School Characteristics files.',
  sourceYear,retrieved:snapshot.retrieved,sources:snapshot.sources,
  coverage:{countyFips:Object.keys(counties),records:schools.length,mappable:schools.filter(s=>s.lat!==null).length,byCounty:Object.fromEntries(Object.values(counties).map(county=>[county,schools.filter(s=>s.county===county).length])),gradeJoin:{method:'Exact FL districtId + schoolId from ST_SCHID',availableGradeRecords:gradeSource.schools.length,matched:matched.length,unmatched:missingGrades}},
  limitations:[
    'Location and directory snapshot is school year 2024–25; new schools, relocations, closures, and program changes after that collection may not be reflected.',
    'School points identify reported locations, not attendance boundaries or enrollment eligibility.',
    'Virtual, supplemental virtual, and primarily virtual programs are list-only; their reported administrative coordinates are retained only in sourceCoordinates.',
    'Magnet status is not present in the current NCES source fields and remains null, not false.',
    'Level filters follow documented grades offered: KG–05 elementary, 06–08 middle, 09–12 high. The NCES school-level classification is retained separately; combined marks the NCES Other/Combined classification. Pre-K-only or unreported grade spans do not receive an invented K–12 level.',
    'Florida 2026 grades are separate from the 2024–25 location snapshot; exact ID match coverage is reported without copying demographic fields.',
    'County selection uses the physical county FIPS from NCES and includes separate city districts and charter agencies in those counties.'
  ],
  excluded,schools
};
mkdirSync('content/schools',{recursive:true});
writeFileSync(output,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({file:output,...result.coverage,excluded:excluded.length,virtual:schools.filter(s=>s.virtual).length,magnetKnown:schools.filter(s=>s.magnet!==null).length},null,2));
