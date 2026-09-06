// Official NCES private-school geography and reported grade spans. No rating inference.
import { writeFileSync, mkdirSync } from 'node:fs';

const output = 'content/schools/map-private-source.json';
const service = 'https://nces.ed.gov/opengis/rest/services/K12_School_Locations/EDGE_GEOCODE_PRIVATESCH_2324/MapServer/0';
// Despite a five-character field definition, this vintage stores three-character CNTY values.
const where = "(STATE='FL' AND CNTY IN ('033','113','091')) OR (STATE='AL' AND CNTY='003')";
const queryUrl = service + '/query?' + new URLSearchParams({ where, outFields:'*', returnGeometry:'false', orderByFields:'PPIN', f:'json' });
const profileUrl = id => 'https://nces.ed.gov/surveys/pss/privateschoolsearch/school_detail.asp?' + new URLSearchParams({ Search:'1', ID:id });

async function fetchText(url) {
  let last;
  for (let attempt=0; attempt<3; attempt++) {
    try {
      const response = await fetch(url, { signal:AbortSignal.timeout(25000), headers:{ 'User-Agent':'Costin-School-Directory/1.0 (public NCES data research)' } });
      if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
      return await response.text();
    } catch (error) { last=error; }
  }
  throw last;
}

function plain(html) {
  return html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi,' ')
    .replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/gi,' ')
    .replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').replace(/&#0?39;|&apos;/gi,"'")
    .replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n))).replace(/\s+/g,' ').trim();
}

function normalizeGrade(grade) {
  if (!grade) return null;
  const value=grade.trim().toUpperCase();
  if (/^(PK|PREK|PREKINDERGARTEN)$/.test(value)) return 'PK';
  if (/^(K|KG|KINDERGARTEN)$/.test(value)) return 'KG';
  if (/^\d{1,2}$/.test(value) && Number(value)>=1 && Number(value)<=12) return String(Number(value));
  return null;
}

function levelsFor(low,high) {
  const number = g => g==='PK' ? -1 : g==='KG' ? 0 : g===null ? null : Number(g);
  const a=number(low),b=number(high);
  if (a===null || b===null || a>b) return [];
  const levels=[];
  if (a<=5 && b>=0) levels.push('elementary');
  if (a<=8 && b>=6) levels.push('middle');
  if (a<=12 && b>=9) levels.push('high');
  if (levels.length>1) levels.push('combined');
  return levels;
}

const geo=JSON.parse(await fetchText(queryUrl));
if (geo.error) throw new Error(JSON.stringify(geo.error));
if (geo.exceededTransferLimit || !Array.isArray(geo.features) || !geo.features.length) throw new Error('Incomplete or empty NCES geography response; previous snapshot retained.');
const records=geo.features.map(feature=>feature.attributes);
const duplicates=new Set();
for (const record of records) {
  if (!record.PPIN || duplicates.has(record.PPIN)) throw new Error('Missing or repeated NCES private school identifier.');
  duplicates.add(record.PPIN);
  if (!['FL033','FL113','FL091','AL003'].includes(record.STATE+record.CNTY)) throw new Error('Out-of-scope county in source.');
  if (!Number.isFinite(record.LAT) || !Number.isFinite(record.LON) || record.LAT<29 || record.LAT>32 || record.LON< -89 || record.LON> -85) throw new Error('Invalid or out-of-region coordinate: '+record.PPIN);
}

let next=0;
const schools=new Array(records.length);
const warnings=[];
async function worker() {
  while(next<records.length) {
    const index=next++,row=records[index];
    const detailUrl=profileUrl(row.PPIN);
    let profile=null,profileError=null;
    try {
      const text=plain(await fetchText(detailUrl));
      if (!text.includes('NCES School ID: '+row.PPIN)) throw new Error('NCES profile did not identify the requested school.');
      const span=text.match(/Grade Span:\s*\(Grades?\s+([A-Za-z0-9]+)\s*-\s*([A-Za-z0-9]+)\s*\)/i);
      const single=text.match(/Grade Span:\s*\(Grades?\s+([A-Za-z0-9]+)\s*\)/i);
      const lowGrade=normalizeGrade(span?.[1] || single?.[1]);
      const highGrade=normalizeGrade(span?.[2] || single?.[1]);
      const year=text.match(/Source:\s*PSS Private School Universe Survey data for the (\d{4}-\d{2,4}) school year/i)?.[1] || null;
      profile={name:text.match(/School Name:\s*(.*?)\s*NCES School ID:/)?.[1] || row.NAME,lowGrade,highGrade,sourceYear:year};
      if (!lowGrade || !highGrade || !year) warnings.push({id:row.PPIN,reason:'Grade range or source year not exposed in expected NCES profile format; unknown fields remain null.'});
    } catch(error) { profileError=error.message; warnings.push({id:row.PPIN,reason:profileError}); }
    schools[index]={
      id:'private-'+row.PPIN,ncesId:row.PPIN,state:row.STATE,name:profile?.name || row.NAME,
      address:row.STREET,city:row.CITY,zip:row.ZIP,county:row.NMCNTY,countyFips:row.STFIP+row.CNTY,
      lat:row.LAT,lng:row.LON,lowGrade:profile?.lowGrade || null,highGrade:profile?.highGrade || null,
      levels:levelsFor(profile?.lowGrade || null,profile?.highGrade || null),sector:'private',charter:false,
      magnet:null,virtual:null,website:null,sourceUrl:profile ? detailUrl : service,sourceYear:'2023-24',
      locationSourceUrl:queryUrl,gradesSourceYear:profile?.sourceYear || null,
      gradeSourceUrl:profile ? detailUrl : null,profileStatus:profile ? 'available' : 'unavailable',
      ...(profileError ? {sourceNote:profileError} : {})
    };
    if ((index+1)%10===0) console.log(`Private-school profile ${index+1}/${records.length}`);
  }
}
await Promise.all([worker(),worker(),worker(),worker()]);
schools.sort((a,b)=>a.state.localeCompare(b.state)||a.county.localeCompare(b.county)||a.name.localeCompare(b.name));
const countByCounty={};
for (const school of schools) countByCounty[`${school.county}, ${school.state}`]=(countByCounty[`${school.county}, ${school.state}`]||0)+1;
const sameAddressGroups=Object.values(Object.groupBy(schools,s=>[s.state,s.city,s.address].join('|'))).filter(group=>group.length>1).map(group=>group.map(s=>({id:s.ncesId,name:s.name,address:s.address})));
const dataset={
  retrieved:new Date().toISOString(),sourceYear:'2023-24',
  sources:[
    {name:'NCES EDGE Private School Locations 2023-24',url:service,queryUrl,sourceYear:'2023-24',license:'Public domain',fields:['ncesId','name','address','city','state','zip','county','lat','lng']},
    {name:'NCES Private School Search / PSS 2023-24 school profiles',url:'https://nces.ed.gov/surveys/pss/privateschoolsearch/aboutdata.asp',sourceYear:'2023-24',fields:['lowGrade','highGrade']}
  ],
  coverage:{count:schools.length,countByCounty,countyFips:['12033','12113','12091','01003'],scope:'NCES 2023-24 private-school directory records in Escambia FL, Santa Rosa FL, Okaloosa FL and Baldwin AL.',withReportedGradeRange:schools.filter(s=>s.lowGrade&&s.highGrade).length,sameAddressGroups},
  limitations:[
    'This is a dated federal directory, not a live list of every currently operating private school. NCES profiles are based on participating PSS respondents; openings, closures, campus changes, and nonresponding schools can be absent or outdated.',
    'Coordinates identify reported school locations; they do not establish attendance zones, admissions eligibility, available places, accreditation, quality, or endorsement.',
    'Private schools are not assigned Florida or Alabama public-school accountability letter grades in this dataset.',
    'Elementary means reported grades KG-5, middle means 6-8, and high means 9-12. Combined is added when a reported range spans multiple groups. Missing grade ranges remain unknown rather than inferred from the school name.',
    'NCES location and profile sources do not expose a school website or virtual/magnet status for these records. Those fields remain null, not false; charter is false because these are private PSS schools.',
    'Distinct NCES identifiers are preserved, including schools sharing an address. Shared coordinates may represent separate programs, survey duplicates, or historical records; this dataset does not silently merge them.'
  ],
  warnings,schools
};
mkdirSync('content/schools',{recursive:true});
writeFileSync(output,JSON.stringify(dataset,null,2)+'\n');
console.log(JSON.stringify({output,count:schools.length,countByCounty,gradeRanges:dataset.coverage.withReportedGradeRange,warnings:warnings.length,sameAddressGroups},null,2));
