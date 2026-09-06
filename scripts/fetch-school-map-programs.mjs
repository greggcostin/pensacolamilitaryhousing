// Reads public FDOE search results and district evidence. Does not submit enrollment forms.
import { readFileSync, writeFileSync } from 'node:fs';

const directory='https://web09.fldoe.org/MagnetSchools/';
const transport='https://brown-bargems.escambiaschools.org/student-family-resources/transportation';
const publicSchools=JSON.parse(readFileSync('content/schools/map-public-source.json','utf8')).schools;
const gradeSchools=JSON.parse(readFileSync('content/schools/school-grades-2026.json','utf8')).schools;
const normalize=value=>value.toUpperCase().replace(/[^A-Z0-9]/g,'');
const text=html=>html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi,' ').replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/gi,' ').replace(/&amp;/gi,'&').replace(/&#39;|&apos;/gi,"'").replace(/\s+/g,' ').trim();

async function request(url,options={}) {
  const response=await fetch(url,{...options,signal:AbortSignal.timeout(25000)});
  if (!response.ok) throw new Error(`HTTP ${response.status} for public directory ${url}`);
  return response;
}

function identifiers(name,districtId) {
  const gradeMatches=gradeSchools.filter(s=>String(s.district)===String(districtId)&&normalize(s.name)===normalize(name));
  if (gradeMatches.length!==1) throw new Error(`No unique official state school ID for ${districtId}: ${name}`);
  const schoolId=String(gradeMatches[0].num).padStart(4,'0');
  const publicMatches=publicSchools.filter(s=>s.state==='FL'&&String(s.districtId)===String(districtId)&&s.schoolId===schoolId);
  if (publicMatches.length!==1) throw new Error(`No unique NCES public-school match for ${districtId}/${schoolId}`);
  return {districtId:String(districtId),schoolId,ncesId:publicMatches[0].ncesId};
}

const programs=[],queries=[];
for (const districtId of [17,46,57]) {
  // The public search uses a normal anti-CSRF token and anonymous session cookie.
  // Neither token nor cookie is persisted or printed.
  const landing=await request(directory),html=await landing.text();
  const token=html.match(/name="__RequestVerificationToken"[^>]*value="([^"]+)"/)?.[1];
  const cookie=landing.headers.getSetCookie().map(value=>value.split(';')[0]).join('; ');
  if (!token || !cookie) throw new Error('FDOE public search session format changed; previous output retained.');
  const result=await request(directory,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded',Cookie:cookie},body:new URLSearchParams({DistrictId:String(districtId),SchoolName:'',City:'',ZIP:'',__RequestVerificationToken:token})});
  const response=await result.text();
  const body=response.match(/<tbody>([\s\S]*?)<\/tbody>/i)?.[1];
  if (body===undefined) throw new Error('FDOE results table missing; previous output retained.');
  const rows=[...body.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map(row=>[...row[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map(cell=>cell[1])).filter(cells=>cells.length===7);
  if (!rows.length && !/No data found for your search criteria/i.test(body)) throw new Error('Unexpected empty public directory response.');
  queries.push({districtId:String(districtId),rowCount:rows.length,sourceUrl:directory,sourceYear:null});
  for (const cells of rows) {
    const name=text(cells[0].match(/<strong>([\s\S]*?)<\/strong>/i)?.[1] || '');
    const classification=text(cells[5]);
    if (!/^Magnet (School|Program)$/i.test(classification)) throw new Error('Unrecognized magnet classification: '+classification);
    programs.push({...identifiers(name,districtId),state:'FL',name,magnet:true,magnetType:/program/i.test(classification)?'program':'school',programName:null,specialty:text(cells[6]),reportedGrades:text(cells[3]),reportedAddress:text(cells[2]),sourceUrl:directory,sourceYear:null,sourceNote:'Current FDOE magnet directory retrieved below; directory does not state a school-year vintage.'});
  }
}

const districtText=text(await (await request(transport)).text());
if (!/magnet school students/i.test(districtText) || !/Pensacola High I\.B\. students/i.test(districtText)) throw new Error('District source no longer explicitly identifies the Pensacola High IB magnet program; review required.');
const transportYear=districtText.match(/for the (20\d{2}-\d{2}) school year/i)?.[1] || null;
programs.push({...identifiers('PENSACOLA HIGH SCHOOL',17),state:'FL',name:'Pensacola High School',magnet:true,magnetType:'program',programName:'International Baccalaureate',specialty:'International Baccalaureate',sourceUrl:transport,sourceYear:transportYear,sourceNote:'District transportation page explicitly lists Pensacola High I.B. students among magnet students. This flag applies to a program, not every student at the school.'});

const checkedIds=new Set();
for(const program of programs){if(checkedIds.has(program.ncesId))throw new Error('Duplicate program school ID');checkedIds.add(program.ncesId);}
const dataset={
  retrieved:new Date().toISOString(),
  sources:[{name:'Florida Department of Education Magnet Schools directory',url:directory,sourceYear:null},{name:'Escambia County Public Schools 2026-27 magnet transportation instructions',url:transport,sourceYear:transportYear}],
  coverage:{confirmedMagnetSchoolsOrPrograms:programs.length,floridaDirectoryQueries:queries,scope:['Escambia FL','Santa Rosa FL','Okaloosa FL','Baldwin AL'],unmatchedIdentifiers:[]},
  limitations:[
    'This is a positive-evidence supplement, not a complete inventory of every current choice option. Schools not listed remain magnet:null, never magnet:false.',
    'FDOE search results do not identify a source school year. Their retrieval date is reported without assigning a year from the page copyright.',
    'Magnet programs can operate within otherwise zoned schools. The magnetType/programName fields must accompany the flag so a program is not presented as a whole-school classification.',
    'The Santa Rosa FDOE search returned no rows. That does not prove there are no district choice or specialized programs.',
    'No unambiguous official magnet classification was established for a Baldwin County school in this pass. Baldwin Preparatory Academy describes itself as much like a magnet school; this analogy is not converted to magnet:true.',
    'A school/program appearing here does not establish enrollment eligibility, transportation entitlement, current available seats, or admission to a program.'
  ],
  choiceResources:[
    {state:'FL',county:'Escambia',url:'https://www.escambiaschools.org/departments/enrollment-services/controlled-open-enrollment',label:'Escambia controlled open enrollment'},
    {state:'FL',county:'Santa Rosa',url:'https://www.santarosaschools.org/documents/resources-%26-services/employees/documents-and-forms/p-s/s/16241306',label:'Santa Rosa school choice plan and transfer forms'},
    {state:'FL',county:'Okaloosa',url:'https://www.okaloosaschools.com/page/controlled-open-enrollment',label:'Okaloosa controlled open enrollment'},
    {state:'AL',county:'Baldwin',url:'https://www.baldwinprep.com/about-us',label:'Baldwin Preparatory Academy overview',classification:'specialized career-technical school; official site uses a magnet analogy, not a definitive classification'},
    {state:'AL',county:'Baldwin',url:'https://www.bcbe.org/departments/academics/secondary-education/international-baccalaureate-programme',label:'Baldwin County IB program admissions and feeder patterns'}
  ],
  programs
};
writeFileSync('content/schools/map-programs-source.json',JSON.stringify(dataset,null,2)+'\n');
console.log(JSON.stringify({count:programs.length,queries,programs:programs.map(({districtId,schoolId,ncesId,name,magnetType,sourceYear})=>({districtId,schoolId,ncesId,name,magnetType,sourceYear}))},null,2));
