import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {loadSchoolInsights,schoolAcademicReading,schoolDirectoryInsight} from './school-insight-lib.mjs';
import {loadSchoolGuideContext,schoolPerspectiveMarkup,performanceContext,validResearchDate,withSchoolGuide} from './school-report-guide-lib.mjs';
const passed=[];
const check=(name,fn)=>{fn();passed.push(name);console.log('PASS '+name);};
const fixture={type:'01',g2024:'B',g2025:'B',g2026:'B'};
const render=rows=>rows.map(row=>row.title+' '+row.text).join('\n');
check('Academic reading uses within-subject peer gaps and retains zero results',()=>{
 const grade={...fixture,ela:0,math:65,sci:90};
 const rows=[{field:'ela',value:0,median:50,delta:-50,peerCount:7},{field:'math',value:65,median:40,delta:25,peerCount:7},{field:'sci',value:90,median:89,delta:1,peerCount:7}];
 const reading=schoolAcademicReading(grade,rows), text=render(reading);
 assert(text.includes('Mathematics is 65%'));assert(text.includes('English language arts')||text.includes('English language arts'.toLowerCase()));assert(text.includes('result is 0%'));assert(text.includes('50 percentage points below'));assert(!text.includes('Science is 90%'));
});
check('Sparse and missing comparisons do not invent strengths or ratings',()=>{
 const reading=render(schoolAcademicReading({...fixture,g2024:null},[{field:'math',value:90,median:5,delta:85,peerCount:2}]));
 assert(reading.includes('does not contain three complete'));assert(reading.includes('too few comparable'));assert(!reading.includes('result worth noticing'));
});
check('Changing letters and high-school thresholds are distinguished from learning growth',()=>{
 const text=render(schoolAcademicReading({type:'03',g2024:'A',g2025:'A',g2026:'B'},[]));
 assert(text.includes('A → A → B'));assert(text.includes('higher grading thresholds'));assert(text.includes('not proof of weaker instruction'));
});
check('Graduation and acceleration keep their cohort and meaning',()=>{
 const text=render(schoolAcademicReading({...fixture,gradRate:92,collegeCareer:60},[]));
 assert(text.includes('graduation rate is 92%'));assert(text.includes('acceleration is 60%'));assert(text.includes('2024–25'));assert(text.includes('not a college-admission rate'));
 assert(!render(schoolAcademicReading({...fixture,gradRate:92,collegeCareer:null},[])).includes('Finishing school'));
});
const context=loadSchoolGuideContext(), insights=loadSchoolInsights({required:true});
const {loadPrivatePerspectives}=await import("./school-profile-lib.mjs"); const privateInsights=loadPrivatePerspectives({required:true});
check('All 82 report perspectives are distinct, complete, dated and source-linked',()=>{
 assert.equal(Object.keys(insights).length,82);
 const headlines=new Set(),openings=new Set();
 for(const school of context.reports){
  const entry=insights[school.reportUrl];assert(entry,school.reportUrl);assert(validResearchDate(entry.checkedAt));
  assert(entry.perspective.length>=2);assert(entry.perspective.every(p=>typeof p==='string'&&p.length>55));
  assert(!headlines.has(entry.headline),`Repeated headline ${school.reportUrl}`);headlines.add(entry.headline);
  assert(!openings.has(entry.perspective[0]),`Repeated review ${school.reportUrl}`);openings.add(entry.perspective[0]);
  for(const field of ['fit','tradeoff','localNote','visitPrompt'])assert(entry[field]?.length>25,`${school.reportUrl}: ${field}`);
  const wordCount=[...entry.perspective,entry.fit,entry.tradeoff,entry.localNote,entry.visitPrompt].join(' ').split(/\s+/).length;
  assert(wordCount>=130,`Too little editorial context ${school.reportUrl}: ${wordCount}`);
  assert(entry.sources.length>=1);for(const source of entry.sources){assert(source.label);assert.equal(new URL(source.url).protocol,'https:');}
  const text=JSON.stringify(entry);assert(!/\bwe visited\b|\bour campus visit\b|\bparents universally\b|\bguaranteed admission\b|\bguaranteed success\b/i.test(text),`Unsupported voice ${school.reportUrl}`);
 }
});
check('Incomplete research fails closed and school copy is escaped',()=>{
 const school=context.reports[0],entry=insights[school.reportUrl];
 for(const bad of [undefined,{...entry,checkedAt:'2999-01-01'},{...entry,sources:[]},{...entry,fit:''}])assert.throws(()=>schoolPerspectiveMarkup(school,bad),/Missing complete sourced/);
 const html=schoolPerspectiveMarkup(school,{...entry,headline:'<script>alert(1)</script>',perspective:['<img src=x onerror=alert(1)>','A useful second paragraph.']});
 assert(!html.includes('<script>'));assert(!html.includes('<img src=x'));assert(html.includes('&lt;script&gt;'));
});
check('Every built report contains crawlable review and reproducible academic interpretation',()=>{
 for(const school of context.reports){
  const html=readFileSync(`civilian-site${school.reportUrl}.html`,'utf8');
  assert.equal((html.match(/id="school-perspective"/g)||[]).length,1,school.reportUrl);
  assert.equal((html.match(/id="school-results-reading"/g)||[]).length,1);
  assert(html.includes('not a campus inspection'));assert(html.includes('Why it may fit'));assert(html.includes('What to weigh'));assert(html.includes('A useful local detail'));
  const grade=context.gradeMap.get(`${school.districtId}|${school.schoolId}`);
  for(const row of schoolAcademicReading(grade,performanceContext(grade,context.grades.schools)))assert(html.includes(row.title));
  assert(!/NaN|undefined%|null%/.test(html));assert.equal(withSchoolGuide(html,school.reportUrl,context),html);
 }
});
check('All database entries offer honest orientation; private and virtual records are not graded by inference',()=>{
 for(const school of context.directory.schools){
  const expected=schoolDirectoryInsight(school,insights[school.reportUrl]||privateInsights[school.id]);assert.deepEqual(school.insight,expected,school.name);
  assert(expected.text.includes(school.name)||expected.kind==='editorial');
  assert.equal(expected.kind,(insights[school.reportUrl]||privateInsights[school.id])?'editorial':'directory');
  if(school.sector==='private'&&!school.virtual&&expected.kind==='directory')assert(expected.text.includes(school.state==='AL'?'do not apply to this Alabama private school':'not evidence of poor performance'));
  if(school.virtual&&expected.kind==='directory')assert(expected.text.includes('mailing address'));
  if(school.state==='AL'&&school.sector==='public')assert(expected.text.includes('Florida school grades do not apply'));
 }
 const unknown=schoolDirectoryInsight({name:'Example',city:'Pensacola',state:'FL',sourceYear:'2023–24',sector:'private',gradeSpan:'',religiousOrientation:null,sourceUrl:'https://example.org'});
 assert(unknown.text.includes('has not been verified'));assert(!unknown.text.includes('Christian'));
 const renamed=schoolDirectoryInsight({name:'Updated School Name',city:'Updated City',state:'FL',sourceYear:'2023–24',sector:'private',gradeSpan:'2–11',sourceUrl:'https://example.org'});
 assert(renamed.text.startsWith('Updated School Name is listed here in Updated City. The 2023–24 directory lists grades 2–11;'));
 assert(!renamed.text.includes('2023–24 directory lists grades 2–11 for Updated School Name'));
});
console.log(`School insights: ${passed.length}/${passed.length} groups passed; ${context.reports.length} editorial reports; ${context.directory.schools.length} directory orientations.`);
