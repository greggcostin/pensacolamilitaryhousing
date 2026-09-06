// A separate, sourced affiliation supplement. Never infer belief from a school name.
import { readFileSync, writeFileSync } from 'node:fs';

const inputPath = 'content/schools/map-private-source.json';
const outputPath = 'content/schools/map-private-affiliations.json';
const input = JSON.parse(readFileSync(inputPath, 'utf8'));
if (!Array.isArray(input.schools) || !input.schools.length) throw new Error('Missing private-school directory.');
const ids = new Set();
for (const school of input.schools) {
  if (!school.ncesId || ids.has(school.ncesId)) throw new Error('Missing or repeated private NCES ID.');
  ids.add(school.ncesId);
}

// Explicit published categories only. Any unrecognized or broad religious category remains unknown.
const christianCategories = new Set([
  'Christian (no specific denomination)', 'Roman Catholic', 'Baptist', 'Episcopal',
  'Church of Christ', 'Mennonite', 'Methodist', 'Presbyterian', 'Pentecostal',
  'Assembly of God', 'Assemblies of God', 'Seventh-Day Adventist', 'Seventh-day Adventist',
  'Lutheran Church - Missouri Synod', 'Lutheran Church-Missouri Synod',
  'Evangelical Lutheran Church in America', 'Lutheran Church - Wisconsin Synod',
  'Other Lutheran', 'Other Lutheran Church'
]);
const explicitNonChristianCategories = new Set(['Nonsectarian', 'Jewish', 'Islamic', 'Buddhist', 'Hindu']);
const profileUrl = id => 'https://nces.ed.gov/surveys/pss/privateschoolsearch/school_detail.asp?' + new URLSearchParams({ Search:'1', ID:id });
const plain = html => html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
  .replace(/<!--[\s\S]*?-->/g, ' ').replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;|&#160;/gi, ' ').replace(/&amp;/gi, '&').replace(/&quot;/gi, '"')
  .replace(/&#0?39;|&apos;/gi, "'").replace(/&#(\d+);/g, (_,n) => String.fromCodePoint(Number(n)))
  .replace(/\s+/g, ' ').trim();

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

const schools = new Array(input.schools.length);
const warnings = [];
let next=0;
async function worker() {
  while (next < input.schools.length) {
    const index=next++, school=input.schools[index], sourceUrl=profileUrl(school.ncesId);
    let religiousOrientation=null, sourceYear=null, profileStatus='unavailable', sourceNote=null;
    try {
      const text=plain(await fetchText(sourceUrl));
      if (!text.includes('NCES School ID: '+school.ncesId)) throw new Error('NCES profile did not identify the requested school.');
      religiousOrientation=text.match(/\bAffiliation:\s*(.*?)\s*Associations:/i)?.[1]?.trim() || null;
      sourceYear=text.match(/Source:\s*PSS Private School Universe Survey data for the (\d{4}-\d{2,4}) school year/i)?.[1] || null;
      if (!religiousOrientation || /^(N\/A|Not reported|Unknown)$/i.test(religiousOrientation)) {
        religiousOrientation=null;
        sourceNote='NCES profile did not report an affiliation in the expected field; affiliation and Christian classification remain unknown.';
      }
      if (!sourceYear) throw new Error('NCES profile did not identify its survey year.');
      profileStatus='available';
    } catch (error) {
      religiousOrientation=null;
      sourceYear=null;
      sourceNote=error.message;
    }
    const christian=christianCategories.has(religiousOrientation) ? true : explicitNonChristianCategories.has(religiousOrientation) ? false : null;
    if (religiousOrientation && christian===null) sourceNote='Published affiliation is retained verbatim. It is too broad or is not included in the documented explicit Christian-category mapping; Christian classification remains unknown.';
    if (sourceNote) warnings.push({ncesId:school.ncesId,reason:sourceNote});
    schools[index]={ncesId:school.ncesId,name:school.name,state:school.state,county:school.county,
      religiousOrientation,christian,sourceField:'Affiliation',sourceUrl,sourceYear,profileStatus,
      ...(sourceNote ? {sourceNote} : {})};
    if ((index+1)%10===0) console.log(`Private affiliation profile ${index+1}/${input.schools.length}`);
  }
}
await Promise.all([worker(),worker(),worker(),worker()]);
const available=schools.filter(s=>s.profileStatus==='available').length;
if (available < input.schools.length * 0.9) throw new Error('More than 10% of NCES profiles unavailable; previous affiliation snapshot retained.');
const categoryCounts={};
for (const school of schools) categoryCounts[school.religiousOrientation || 'Unknown']=(categoryCounts[school.religiousOrientation || 'Unknown'] || 0)+1;
const countByCounty={};
for (const school of schools) {
  const key=`${school.county}, ${school.state}`;
  const counts=countByCounty[key] ||= {total:0,christian:0,explicitNonChristian:0,unknown:0};
  counts.total++;
  counts[school.christian===true ? 'christian' : school.christian===false ? 'explicitNonChristian' : 'unknown']++;
}
const output={retrieved:new Date().toISOString(),directorySourceYear:input.sourceYear,
  sources:[{name:'NCES Private School Search / PSS school profiles',url:'https://nces.ed.gov/surveys/pss/privateschoolsearch/aboutdata.asp',field:'Affiliation',sourceYears:[...new Set(schools.map(s=>s.sourceYear).filter(Boolean))]}],
  classification:{field:'christian',type:'boolean or null',
    trueWhen:'NCES Affiliation exactly matches an explicitly Christian denomination or the generic Christian category listed below.',
    falseWhen:'NCES explicitly reports Nonsectarian or a documented non-Christian religion listed below. This does not classify individual students or staff.',
    nullWhen:'Affiliation is unavailable, unrecognized, or too broad to establish Christian affiliation. School names never determine this value.',
    christianCategories:[...christianCategories].sort(),explicitNonChristianCategories:[...explicitNonChristianCategories].sort()},
  coverage:{count:schools.length,withReportedAffiliation:schools.filter(s=>s.religiousOrientation).length,christian:schools.filter(s=>s.christian===true).length,
    explicitNonChristian:schools.filter(s=>s.christian===false).length,unknownChristianStatus:schools.filter(s=>s.christian===null).length,categoryCounts,countByCounty},
  limitations:[
    'Affiliations are survey-reported institutional categories from the source year, not a live determination of beliefs, membership, admissions policy, curriculum, accreditation, or quality.',
    'Generic Other religious or unspecified affiliation is not automatically Christian, secular, or non-Christian.',
    'The Christian filter includes explicitly Christian NCES denominations, including Roman Catholic and Protestant categories, while retaining the precise published affiliation.',
    'This supplement joins by NCES ID and does not change school identities, addresses, coordinates, grade spans, or public accountability status.',
    'Distinct NCES records sharing an address are preserved; counts are directory records and may not equal distinct current campuses.'
  ],warnings,schools};
writeFileSync(outputPath,JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify({outputPath,...output.coverage},null,2));
