import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {median,performanceContext,comparisonSchools,loadSchoolGuideContext,withSchoolGuide,schoolGuideMarkup,validResearchDate} from './school-report-guide-lib.mjs';
const checks=[];
const check=(name,fn)=>{fn();checks.push(name);};
check('Median ignores missing data while retaining valid zeros',()=>{
 assert.equal(median([null,0,20,40]),20);assert.equal(median([0,20]),10);assert.equal(median([null,undefined]),null);
});
check('Comparison excludes the subject and unrelated school categories/counties',()=>{
 const own={district:'17',num:'0001',type:'01',pctPoints:60,ela:0};
 const rows=[own,{district:'17',num:'0002',type:'01',pctPoints:20,ela:20},{district:'17',num:'0003',type:'01',pctPoints:80,ela:null},{district:'57',num:'0004',type:'01',pctPoints:100},{district:'17',num:'0005',type:'03',pctPoints:100}];
 const result=performanceContext(own,rows);
 assert.deepEqual(result.find(r=>r.field==='pctPoints'),{field:'pctPoints',label:'Overall accountability points',value:60,median:50,peerCount:2,delta:10});
 assert.equal(result.find(r=>r.field==='ela').peerCount,1);assert.equal(result.find(r=>r.field==='ela').delta,-20);
 assert.equal(performanceContext(own,[own])[0].median,null);
});
const context=loadSchoolGuideContext();
check('Every existing report has researched, source-linked unique editorial',()=>{
 assert.equal(context.reports.length,82);
 const overviews=new Set();
 for(const school of context.reports){
  const entry=context.editorial[school.reportUrl];assert(entry,`Missing research: ${school.reportUrl}`);
  assert(entry.overview.length>90,school.reportUrl);assert(!overviews.has(entry.overview),'Duplicate school overview');overviews.add(entry.overview);
  assert.match(entry.schoolWebsite,/^https:\/\//);assert(entry.highlights.length>=2);assert(entry.visitQuestions.length>=2);assert(entry.enrollment.text.length>40);
  for(const item of entry.highlights){assert(item.title&&item.text.length>30);assert.match(item.sourceUrl,/^https:\/\//);}
  assert(entry.sources.length>=1);assert(validResearchDate(entry.checkedAt),`Invalid research date: ${school.reportUrl}`);
 }
});
check('Missing or invalid research cannot acquire an invented checked date',()=>{
 const school=context.reports[0];const entry=context.editorial[school.reportUrl];
 for(const replacement of [undefined,{...entry,checkedAt:undefined},{...entry,checkedAt:'2026-02-31'},{...entry,checkedAt:'2999-01-01'}]){
  const fixture={...context,editorial:{...context.editorial,[school.reportUrl]:replacement}};
  assert.throws(()=>schoolGuideMarkup(school,fixture),/Missing dated school research/);
 }
 assert(validResearchDate('2026-09-06'));
});
check('Guide labels distinguish magnet scope, cohort dates and alternative entry grades',()=>{
 for(const school of context.reports){
  const html=readFileSync(`civilian-site${school.reportUrl}.html`,'utf8');
  if(school.magnet===true && school.magnetType==='school')assert(html.includes('Public magnet school'));
  for(const peer of comparisonSchools(school,context))assert(html.includes(`Directory grades ${peer.gradeSpan} · NCES ${peer.sourceYear}`));
  const grade=context.gradeMap.get(`${school.districtId}|${school.schoolId}`);
  if(grade.type==='04')assert(html.includes('combination category includes different grade spans'));
  if(typeof grade.collegeCareer==='number')assert(html.includes('College and career acceleration · 2024–25 cohort'));
 }
});
check('Comparable options preserve identity, category, format and geographic selection',()=>{
 for(const school of context.reports){
  const peers=comparisonSchools(school,context);assert(peers.length<=3);assert.equal(new Set(peers.map(p=>p.id)).size,peers.length);
  let distance=-1;
  for(const peer of peers){assert.notEqual(peer.id,school.id);assert.equal(peer.virtual,school.virtual);if(!school.virtual)assert.equal(peer.countyKey,school.countyKey);
   if(peer.comparisonDistance!==null){assert(peer.comparisonDistance>=distance);distance=peer.comparisonDistance;}
   assert.equal(context.gradeMap.get(`${peer.districtId}|${peer.schoolId}`).type,context.gradeMap.get(`${school.districtId}|${school.schoolId}`).type);
  }
 }
});
check('All 82 static guides retain headings, one guide block and source attribution',()=>{
 for(const school of context.reports){
  const html=readFileSync(`civilian-site${school.reportUrl}.html`,'utf8');
  assert.equal((html.match(/<!-- SCHOOL_GUIDE_START -->/g)||[]).length,1);
  for(const id of ['school-summary','school-programs','school-comparison','similar-schools','school-enrollment','school-guide-sources'])assert(html.includes(`id="${id}"`),`${school.reportUrl}: ${id}`);
  assert(html.includes('Grade history'));assert(html.includes('2025-26 achievement components'));
  assert.equal((html.match(/<h1\b/g)||[]).length,1);
  assert(!/\bNaN\b|undefined%|null%/.test(html));
  assert(html.includes('It is not weighted by enrollment'));assert(html.includes('not driving routes'));
  assert(html.includes(context.editorial[school.reportUrl].highlights[0].sourceUrl.replaceAll('&','&amp;')));
  assert.equal(withSchoolGuide(html,school.reportUrl,context),html,`Guide generation not idempotent: ${school.reportUrl}`);
 }
});
check('High and combination reports explain the changed grading thresholds',()=>{
 for(const school of context.reports){const grade=context.gradeMap.get(`${school.districtId}|${school.schoolId}`);if(['03','04'].includes(grade.type))assert(readFileSync(`civilian-site${school.reportUrl}.html`,'utf8').includes('raised the high and combination school grading thresholds'));}
});
check('No demographic characteristic is used in school guide comparisons',()=>{
 const code=readFileSync('scripts/school-report-guide-lib.mjs','utf8');assert(!/econDisadv|titleI|race|ethnicity|householdIncome/.test(code));
});
console.log(`School report guides: ${checks.length}/${checks.length} check groups passed; ${context.reports.length} sourced reports.`);
