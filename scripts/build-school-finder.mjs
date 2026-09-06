import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { withSchoolFinder } from './school-finder-lib.mjs';
import { loadSchoolInsights, schoolDirectoryInsight } from './school-insight-lib.mjs';
import {readSchoolRegistry} from './school-page-registry.mjs';
import {loadPrivatePerspectives} from './school-profile-lib.mjs';
const pageRegistry=readSchoolRegistry();

const read = file => JSON.parse(readFileSync(file,'utf8'));
const publicData=read('content/schools/map-public-source.json');
const privateData=read('content/schools/map-private-source.json');
const affiliations=read('content/schools/map-private-affiliations.json');
const resourceFiles=['content/schools/map-private-resources-west.json','content/schools/map-private-resources-east.json'];
const resourceSources=resourceFiles.filter(existsSync).map(read);
const resourceRows=resourceSources.flatMap(s=>s.schools||Object.entries(s.byNcesId||{}).map(([ncesId,row])=>({ncesId,...row}))).map(s=>({...s,checkedAt:s.checkedAt||s.checked,campusNote:s.campusNote||s.locationNote,locationUnconfirmed:s.locationUnconfirmed||!!s.officialAddress}));
const resourceMap=new Map(resourceRows.map(s=>[s.ncesId||s.id,s]));
if(resourceMap.size!==resourceRows.length)throw Error('Duplicate private resource identity');
const affiliationMap=new Map(affiliations.schools.map(s=>[s.ncesId,s]));
const locationUpdates=existsSync('content/schools/map-private-location-updates.json')?read('content/schools/map-private-location-updates.json').schools:[];
const locationMap=new Map(locationUpdates.map(s=>[s.ncesId||s.id,s]));
const publicUpdates=existsSync('content/schools/map-public-location-updates.json')?read('content/schools/map-public-location-updates.json'):{schools:[],notes:[]};
const publicLocationMap=new Map(publicUpdates.schools.map(s=>[s.ncesId,s]));
const publicNoteRows=[...publicUpdates.schools,...publicUpdates.notes];
const publicNoteMap=new Map(publicNoteRows.map(s=>[s.ncesId,s]));
if(publicLocationMap.size!==publicUpdates.schools.length||publicNoteMap.size!==publicNoteRows.length)throw Error('Duplicate public campus supplement identity');
const supplemental=resourceSources.flatMap(s=>s.supplementalSchools||[]).map(s=>({...s,sector:'private',sourceKind:'official-school',religiousOrientation:s.religiousOrientation||s.religiousAffiliation,checkedAt:s.checkedAt||s.checked}));
const programs=existsSync('content/schools/map-programs-source.json')?read('content/schools/map-programs-source.json'):null;
const zipRows=read('content/schools/map-zip-centers.json');
const grades=read('content/schools/school-grades-2026.json');
const gradeKey=s=>`${String(s.district).padStart(2,'0')}-${String(s.num).padStart(4,'0')}`;
const gradeMap=new Map(grades.schools.map(s=>[gradeKey(s),s]));
const rawRows=[...publicData.schools,...privateData.schools,...supplemental];
const programRows=Array.isArray(programs)?programs:programs?.schools||programs?.programs||programs?.records||[];
const programMap=new Map(programRows.map(s=>[`${String(s.districtId).padStart(2,'0')}-${String(s.schoolId).padStart(4,'0')}`,s]));
const titleCase = value => String(value||'').replace(/\b\w+/g,word=>word.charAt(0).toUpperCase()+word.slice(1).toLowerCase()).replace(/\b(Kg|Pk|Eglin Afb|Hurlburt Fld|Usa)\b/g,s=>({Kg:'KG',Pk:'PK','Eglin Afb':'Eglin AFB','Hurlburt Fld':'Hurlburt Field',Usa:'USA'}[s]));
const slug = name => name.toLowerCase().replace(/[.,']/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').replace(/-inc$/,'');
const safeUrl = value => {try{const url=new URL(value);return ['http:','https:'].includes(url.protocol)?url.href:null;}catch{return null;}};
for(const update of publicNoteRows){
  if(!publicData.schools.some(s=>s.ncesId===update.ncesId)||!safeUrl(update.sourceUrl)||!/^\d{4}-\d{2}-\d{2}$/.test(update.checkedAt||'')||!update.reason||!update.evidence||!update.campusNote)throw Error('Unsourced public campus supplement '+update.ncesId);
}
for(const update of publicUpdates.schools){
  const hasPoint=Number.isFinite(update.lat)&&Number.isFinite(update.lng);
  if(!update.address||!update.city||!/^\d{5}$/.test(update.zip)||!update.state||(hasPoint&&!safeUrl(update.geocoderUrl)))throw Error('Incomplete public campus location '+update.ncesId);
  if(!hasPoint&&(update.lat!==null||update.lng!==null))throw Error('Unverified public campus point must explicitly remain null '+update.ncesId);
}
const countyNames={'12033':'Escambia','12113':'Santa Rosa','12091':'Okaloosa','01003':'Baldwin'};
const reportPaths=new Set();
const seen=new Set();
const schools=rawRows.map(record=>{
  const resource=record.sector==='private'?resourceMap.get(record.ncesId||record.id)||record:null;
  const affiliation=record.sector==='private'?(resource?.affiliationOverride||affiliationMap.get(record.ncesId)||record):null;
  const publicLocation=record.sector==='public'?publicLocationMap.get(record.ncesId):null;
  const publicNote=record.sector==='public'?publicNoteMap.get(record.ncesId):null;
  const location=record.sector==='public'?publicLocation:resource?.locationOverride||locationMap.get(record.ncesId||record.id);
  const virtual=resource?.virtual===true?true:record.virtual;
  const addressData=virtual&&resource?.officialMailingAddress?resource.officialMailingAddress:location||(resource?.locationUnconfirmed?(resource.currentAddress||resource.officialAddress):null)||record;
  if(location&&(!safeUrl(location.sourceUrl)||!location.address))throw Error('Unsourced school location update '+record.name);
  const grade=record.state==='FL'?gradeMap.get(`${String(record.districtId).padStart(2,'0')}-${String(record.schoolId).padStart(4,'0')}`):null;
  const program=record.state==='FL'?programMap.get(`${String(record.districtId).padStart(2,'0')}-${String(record.schoolId).padStart(4,'0')}`):null;
  const id=`${record.sector}-${record.id||record.ncesId}`;
  if(seen.has(id))throw Error('Duplicate school identifier '+id);seen.add(id);
  const countyRaw=String(record.county||countyNames[record.countyFips]||'').replace(/ County.*$/i,'').replace(/,.*$/,'');
  const county=titleCase(countyRaw);
  if(!['Escambia','Santa Rosa','Okaloosa','Baldwin'].includes(county))throw Error('Unrecognized school county '+county+' for '+record.name);
  const url=grade?`/schools/${slug(grade.name)}`:null;
  const reportUrl=pageRegistry?.records[id]||(url&&existsSync('civilian-site'+url+'.html')?url:null);
  if(reportUrl)reportPaths.add(reportUrl);
  const sourceUrl=safeUrl(record.sourceUrl);
  if(!sourceUrl)throw Error('Missing official source '+record.name);
  const locationUnconfirmed=(resource?.locationUnconfirmed===true&&!location)||(!!publicLocation&&(!Number.isFinite(publicLocation.lat)||!Number.isFinite(publicLocation.lng)));
  const lat=virtual===true||locationUnconfirmed?null:location?.lat??record.lat, lng=virtual===true||locationUnconfirmed?null:location?.lng??record.lng;
  if(lat!==null&&lat!==undefined&&(!Number.isFinite(lat)||lat<29||lat>32||!Number.isFinite(lng)||lng< -89||lng> -85))throw Error('Unexpected school coordinate '+record.name);
  return {
    id,ncesId:record.ncesId||null,sourceId:record.id,sourceKind:record.sourceKind||'nces',name:resource?.currentName|| (grade?titleCase(grade.name):titleCase(record.name)),aliases:resource?.aliases||[],
    state:record.state,county,countyKey:`${record.state}|${county}`,
    districtId:record.districtId||null,schoolId:record.schoolId||null,
    address:addressData.address||'',city:titleCase(addressData.city),zip:String(addressData.zip||'').slice(0,5),
    lat:Number.isFinite(lat)?lat:null,lng:Number.isFinite(lng)?lng:null,
    levels:record.levels||[],gradeSpan:record.lowGrade&&record.highGrade?`${record.lowGrade}–${record.highGrade}`:'',
    sector:record.sector,charter:grade?grade.charter==='YES':record.charter,magnet:program?.magnet===true?true:record.magnet,
    virtual,grade:grade&&/^[ABCDF]$/.test(grade.g2026)?grade.g2026:null,gradeStatus:grade?.g2026||null,gradeYear:grade?'2025–26':null,
    reportUrl,website:safeUrl(resource?.website||record.website),admissionsUrl:safeUrl(resource?.admissionsUrl),sourceUrl,sourceYear:record.sourceYear|| (record.sector==='private'?privateData.sourceYear:publicData.sourceYear),
    christian:affiliation?.christian===true?true:affiliation?.christian===false?false:null,
    religiousOrientation:affiliation?.religiousOrientation||null,
    religiousCategory:affiliation?.christian===true?'christian':/^Nonsectarian$/i.test(affiliation?.religiousOrientation||'')?'nonreligious':'unknown',
    affiliationSourceUrl:safeUrl(affiliation?.affiliationSourceUrl||affiliation?.sourceUrl),affiliationSourceYear:affiliation?.sourceYear||null,
    resourceSourceUrl:safeUrl(publicNote?.sourceUrl||resource?.sourceUrl),resourcesCheckedAt:publicNote?.checkedAt||resource?.checkedAt||null,
    campusNote:publicNote?.campusNote||(virtual&&resource?.campusNote?resource.campusNote:location&&record.sourceKind!=='official-school'?'Current school-published address, with an approximate Census address point. Confirm the campus entrance with the school.':resource?.campusNote||location?.locationNote||null),locationSourceUrl:safeUrl(location?.geocoderUrl||location?.sourceUrl||record.locationSourceUrl),
    virtualSourceUrl:safeUrl(resource?.virtualSourceUrl),addressSourceUrl:safeUrl(virtual?resource?.virtualSourceUrl:location?.sourceUrl||record.sourceUrl),
    programSourceUrl:program?safeUrl(program.sourceUrl):null,programSourceYear:program?.sourceYear||null,
    magnetType:program?.magnetType||null,programName:program?.programName||null
  };
}).sort((a,b)=>a.name.localeCompare(b.name));
const schoolInsights=loadSchoolInsights({required:true});
const privateInsights=loadPrivatePerspectives();
for(const school of schools)school.insight=schoolDirectoryInsight(school,schoolInsights[school.reportUrl]||privateInsights[school.id]);
if(schools.filter(s=>s.grade).length!==grades.schools.filter(s=>/^[ABCDF]$/.test(s.g2026)).length)throw Error('Not every existing Florida grade joined exactly once.');
const sources=[
  {name:'NCES public school locations and CCD directory',url:'https://nces.ed.gov/ccd/files.asp',year:'2024–25'},
  {name:'NCES private school locations and PSS directory',url:'https://nces.ed.gov/surveys/pss/privateschoolsearch/',year:'2023–24'},
  {name:'Florida DOE school accountability grades',url:grades.url,year:'2025–26'},
  {name:'U.S. Census ZIP Code Tabulation Area reference points',url:'https://www.census.gov/geographies/reference-files/time-series/geo/gazetteer-files.html',year:'2025'}
];
if(programRows.length)sources.push({name:'Florida DOE magnet school and program directory',url:'https://web09.fldoe.org/MagnetSchools/',year:'retrieved September 2026'});
sources.push({name:'NCES private-school reported religious affiliations',url:'https://nces.ed.gov/surveys/pss/privateschoolsearch/',year:'2023–24'});
if(supplemental.length)sources.push({name:'School-published additions and campus resources',url:'/schools#private-school-resources',year:'verified September 2026; individual sources linked below'});
const result={version:1,builtAt:new Date().toISOString(),schools,zipCenters:Object.fromEntries(zipRows.map(s=>[s.zip,{lat:s.lat,lng:s.lng}])),counties:[{key:'FL|Escambia',label:'Escambia County, FL'},{key:'FL|Santa Rosa',label:'Santa Rosa County, FL'},{key:'FL|Okaloosa',label:'Okaloosa County, FL'},{key:'AL|Baldwin',label:'Baldwin County, AL'}],sources,choiceResources:(programs?.choiceResources||[]).map(s=>({label:s.label,url:safeUrl(s.url)})).filter(s=>s.url),
  coverageNote:`Coverage: ${schools.length} public and private school records in Escambia, Santa Rosa and Okaloosa counties in Florida, and Baldwin County in Alabama. ${supplemental.length} school-published campus additions supplement the dated federal directory. ${schools.filter(s=>s.grade).length} Florida grades are linked by state district and school identifiers. Existing detailed school reports remain below. Federal directory years and state accountability years differ.`};
mkdirSync('civilian-site/assets',{recursive:true});
const output='civilian-site/assets/school-finder-data.json';
const old=existsSync(output)?read(output):null;
if(old){old.builtAt=result.builtAt;if(JSON.stringify(old)===JSON.stringify(result))result.builtAt=read(output).builtAt;}
writeFileSync(output,JSON.stringify(result)+'\n');
const hub='civilian-site/schools.html';writeFileSync(hub,withSchoolFinder(readFileSync(hub,'utf8'),'/schools',result));
console.log(JSON.stringify({records:schools.length,mapped:schools.filter(s=>s.lat!==null&&s.virtual!==true).length,flGrades:schools.filter(s=>s.grade).length,private:schools.filter(s=>s.sector==='private').length,charter:schools.filter(s=>s.charter===true).length,magnet:schools.filter(s=>s.magnet===true).length,reportLinks:reportPaths.size,zipCenters:zipRows.length},null,2));
