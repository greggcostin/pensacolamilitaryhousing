// Additive, source-backed school guides. Existing report data, URLs and schema stay intact.
import { existsSync, readFileSync } from 'node:fs';
import { milesBetween, hasCampus } from '../civilian-site/assets/school-finder-core.js';
import { loadSchoolInsights, schoolAcademicReading } from './school-insight-lib.mjs';

const esc = value => String(value ?? '').replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
const json = path => JSON.parse(readFileSync(path, 'utf8'));
const sourceLink = (label, url) => {
  if (!/^https:\/\//.test(url || '')) return esc(label);
  return `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(label)} ↗</a>`;
};
const TYPE = {'01':'elementary','02':'middle','03':'high','04':'combination'};
const METRICS = [
  ['pctPoints','Overall accountability points'], ['ela','English language arts achievement'],
  ['math','Mathematics achievement'], ['sci','Science achievement'], ['socst','Social studies achievement'],
  ['gradRate','Graduation rate · 2024–25 cohort'], ['collegeCareer','College and career acceleration · 2024–25 cohort'],
];
export const numeric = value => typeof value === 'number' && Number.isFinite(value) ? value : null;
export function validResearchDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false;
  const timestamp=Date.parse(value);
  return Number.isFinite(timestamp) && timestamp<=Date.now() && new Date(timestamp).toISOString().slice(0,10)===value;
}
export function median(values) {
  const sorted = values.map(numeric).filter(v => v !== null).sort((a,b)=>a-b);
  if (!sorted.length) return null;
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle-1] + sorted[middle]) / 2;
}
const fmt = value => Number.isInteger(value) ? String(value) : value.toFixed(1);
const key = record => `${record.district || record.districtId}|${record.num || record.schoolId}`;
let cached;
export function loadSchoolGuideContext() {
  if (cached) return cached;
  const grades = json('content/schools/school-grades-2026.json');
  const directory = json('civilian-site/assets/school-finder-data.json');
  const editorial = {};
  for (const county of ['escambia','santarosa']) {
    const path = `content/schools/report-editorial-${county}.json`;
    if (existsSync(path)) { const source=json(path); Object.assign(editorial, source.records || source); }
  }
  cached = { grades, directory, editorial, insights:loadSchoolInsights({required:true}), gradeMap:new Map(grades.schools.map(s=>[key(s),s])), reports:directory.schools.filter(s=>s.reportUrl&&editorial[s.reportUrl]) };
  return cached;
}
export function performanceContext(school, grades) {
  // Exclude the subject school; do not weight by enrollment or use demographic criteria.
  const peers = grades.filter(s=>s.district===school.district && s.type===school.type && key(s)!==key(school));
  return METRICS.filter(([field])=>numeric(school[field])!==null).map(([field,label])=>{
    const values = peers.map(s=>numeric(s[field])).filter(v=>v!==null);
    const midpoint = median(values);
    return {field,label,value:school[field],median:midpoint,peerCount:values.length,delta:midpoint===null?null:school[field]-midpoint};
  });
}
export function comparisonSchools(school, context) {
  const ownGrade = context.gradeMap.get(key(school));
  if (!ownGrade) return [];
  let candidates = context.reports.filter(s=>s.id!==school.id && context.gradeMap.get(key(s))?.type===ownGrade.type && s.virtual===school.virtual && s.countyKey===school.countyKey);
  if (!candidates.length && school.virtual) candidates=context.reports.filter(s=>s.id!==school.id && s.virtual===true && context.gradeMap.get(key(s))?.type===ownGrade.type);
  return candidates.map(s=>({...s,comparisonDistance:hasCampus(school)&&hasCampus(s)?milesBetween(school,s):null}))
    .sort((a,b)=>(a.comparisonDistance??Infinity)-(b.comparisonDistance??Infinity)||a.name.localeCompare(b.name)).slice(0,3);
}
function peerConsideration(school, peer, context) {
  const s=context.gradeMap.get(key(school)), p=context.gradeMap.get(key(peer));
  const differences=METRICS.filter(([field])=>['ela','math','sci','socst','collegeCareer'].includes(field)&&numeric(s[field])!==null&&numeric(p[field])!==null)
    .map(([field,label])=>({label,own:s[field],other:p[field],difference:p[field]-s[field]})).sort((a,b)=>b.difference-a.difference);
  const higher=differences.find(item=>item.difference>0);
  let text=higher?`${peer.name} reports ${fmt(higher.other)}% in ${higher.label.toLowerCase()}, compared with ${fmt(higher.own)}% here. If this is a priority, ask how its instruction and support would serve your child.`
    :`Compare ${peer.name}'s course options, student support and daily schedule with this school. A different program or learning format may matter more to your child than the overall grade.`;
  const insight=context.insights?.[peer.reportUrl];
  if (insight?.fit) text += ` ${insight.fit}`;
  return text;
}
export function schoolPerspectiveMarkup(school, insight) {
  if (!insight || !validResearchDate(insight.checkedAt) || !insight.headline || !Array.isArray(insight.perspective) || insight.perspective.length<2 || !['fit','tradeoff','localNote','visitPrompt'].every(field=>typeof insight[field]==='string' && insight[field].trim().length>25) || !insight.sources?.length || !insight.sources.every(s=>/^https:\/\//.test(s.url||''))) throw new Error(`Missing complete sourced school perspective: ${school.reportUrl}`);
  return `<section class="sg-perspective" id="school-perspective" aria-labelledby="school-perspective-title"><div class="sg-perspective-top"><span class="sg-eyebrow">The school in perspective</span><span class="sg-perspective-date">Editorial guide · ${esc(insight.checkedAt)}</span></div><h2 id="school-perspective-title">${esc(insight.headline)}</h2><p class="sg-perspective-disclosure">Our interpretation of published school information, not a campus inspection or an additional official rating.</p><div class="sg-perspective-body">${insight.perspective.map(p=>`<p>${esc(p)}</p>`).join('')}</div><div class="sg-fit-grid"><div><h3>Why it may fit</h3><p>${esc(insight.fit)}</p></div><div><h3>What to weigh</h3><p>${esc(insight.tradeoff)}</p></div></div><div class="sg-local-detail"><span class="sg-eyebrow">A useful local detail</span><p>${esc(insight.localNote)}</p></div><div class="sg-visit-prompt"><span>One question worth asking</span><p>${esc(insight.visitPrompt)}</p></div><p class="sg-perspective-sources">Based on ${insight.sources.map(s=>sourceLink(s.label||'School-published information',s.url)).join(' · ')}. Confirm current programs and availability with the school.</p></section>`;
}
export function schoolGuideMarkup(school, context) {
  const grade=context.gradeMap.get(key(school));
  if (!grade) throw new Error(`No grade source for ${school.reportUrl}`);
  const editorial=context.editorial[school.reportUrl];
  const insight=context.insights?.[school.reportUrl];
  if (!editorial?.overview || !validResearchDate(editorial.checkedAt)) throw new Error(`Missing dated school research for ${school.reportUrl}`);
  const summary=`The 2025–26 Florida DOE report classifies ${school.name} in the ${TYPE[grade.type]||'school'} category, as a ${school.charter?'public charter':'district public'} school in ${school.county} County. Its accountability grade is ${grade.g2026}; it earned ${grade.pctPoints}% of possible accountability points. The published grade sequence is ${grade.g2024 || 'not reported'} in 2023–24, ${grade.g2025 || 'not reported'} in 2024–25, and ${grade.g2026} in 2025–26.`;
  const performance=performanceContext(grade,context.grades.schools);
  const overall=performance.find(p=>p.field==='pctPoints');
  const comparison=overall?.median===null||!overall ? 'The available data do not support a same-category local median for this measure.' : `Its ${fmt(overall.value)}% overall points result is ${overall.delta===0?'at':`${fmt(Math.abs(overall.delta))} percentage points ${overall.delta>0?'above':'below'}`} the ${fmt(overall.median)}% median among ${overall.peerCount} other ${TYPE[grade.type]} schools in ${school.county} County with reported data.`;
  const metricRows=performance.map(p=>`<tr><th scope="row">${esc(p.label)}</th><td>${fmt(p.value)}%</td><td>${p.median===null?'Unavailable':`${fmt(p.median)}% <small>(${p.peerCount} schools)</small>`}</td><td>${p.delta===null?'Not comparable':p.delta===0?'Same':`${p.delta>0?'+':'−'}${fmt(Math.abs(p.delta))} pp`}</td></tr>`).join('');
  const alternatives=comparisonSchools(school,context);
  const official=editorial?.schoolWebsite || school.website;
  const questions=editorial?.visitQuestions?.length?editorial.visitQuestions:[
    `What would a typical week look like for a student entering ${school.name}, including enrichment and additional academic support?`,
    `Which parts of the published ${grade.g2026} accountability result are priorities in the school's current improvement plan?`,
    school.charter?'How are applications, available seats and any lottery handled for the grade my child needs?':'Which attendance and transfer rules apply to my address and intended enrollment year?',
  ];
  const guideSources=[...(editorial?.sources||[]).map(s=>typeof s==='string'?{label:'Official school source',url:s}:{label:s.label||s.title||s.name||'Official school source',url:s.url||s.sourceUrl}),...(insight?.sources||[]),
    {label:`NCES school directory · ${school.sourceYear}`,url:school.sourceUrl},
    {label:'Florida DOE school grades · 2026 release',url:context.grades.url},
    {label:'Florida DOE grading methodology · 2025–26',url:'https://www.fldoe.org/file/18534/SchoolGradesCalcGuide26.pdf'}];
  const uniqueSources=[...new Map(guideSources.filter(s=>s.url).map(s=>[s.url,s])).values()];
  const highlights=editorial?.highlights||[];
  const reading=schoolAcademicReading(grade,performance);
  return `<!-- SCHOOL_GUIDE_START -->
<article class="sg-guide" aria-label="${esc(school.name)} family guide">
<section class="sg-summary" id="school-summary"><span class="sg-eyebrow">Get to know this school</span><h2>A closer look at ${esc(school.name)}.</h2><p class="sg-summary-lead">${esc(editorial?.overview||summary)}</p>${editorial?`<p>${esc(summary)}</p>`:''}
<div class="sg-facts"><div><span>Recorded location</span><strong>${esc(school.city)}, FL ${esc(school.zip)}</strong><small>${esc(school.virtual?'Online school; no campus pin':school.address)}</small></div><div><span>Directory grade span</span><strong>${esc(school.gradeSpan)}</strong><small>NCES ${esc(school.sourceYear)}; confirm current grades</small></div><div><span>School format</span><strong>${school.virtual?'Virtual / online':school.charter?'Public charter':school.magnet===true?(school.magnetType==='school'?'Public magnet school':'Public · magnet program'):'District public'}</strong><small>${esc(school.county)} County</small></div></div>
<div class="sg-actions">${sourceLink('Visit the official school website',official)}<a href="/schools#school-finder">Find schools near your home ↗</a></div></section>
${schoolPerspectiveMarkup(school,insight)}
${highlights.length?`<section class="sg-section" id="school-programs"><span class="sg-eyebrow">Programs, identity and school life</span><h2>What makes this school distinctive.</h2><div class="sg-highlights">${highlights.map(item=>`<div><h3>${esc(item.title)}</h3><p>${esc(item.text)}</p>${sourceLink('School source',item.sourceUrl)}</div>`).join('')}</div></section>`:''}
<section class="sg-section" id="school-comparison"><span class="sg-eyebrow">Understand the results</span><h2>How the official results compare.</h2><p>${esc(comparison)}</p><div class="sg-academic-reading" id="school-results-reading"><h3>What the results suggest.</h3>${reading.map(item=>`<div><h4>${esc(item.title)}</h4><p>${esc(item.text)}</p></div>`).join('')}<p class="sg-method">Calculated from the dated state results below. Peer gaps compare each subject with the same subject at other schools, not one subject with another. Measures can cover different student groups. They do not establish why a result occurred or the quality of a particular teacher.</p></div><div class="sg-table-scroll" role="region" aria-label="School performance comparison" tabindex="0"><table class="sg-comparison"><caption>2025–26 reported components and other local ${esc(TYPE[grade.type])} schools</caption><thead><tr><th scope="col">Measure</th><th scope="col">This school</th><th scope="col">Peer median</th><th scope="col">Difference</th></tr></thead><tbody>${metricRows}</tbody></table></div>
<p class="sg-table-hint">Swipe across the table to compare all columns.</p><p class="sg-method">Calculated from the linked Florida DOE release. The peer median is the middle school-level result, excludes this school, uses the same county and DOE school category, and ignores missing values. It is not weighted by enrollment. “pp” means percentage points. Graduation and acceleration measures use the cohorts specified by the state. Different measures describe different groups of students.</p>
<p class="sg-note">Use the results to identify questions, not to predict your child's experience. ${['03','04'].includes(grade.type)?'Florida raised the high and combination school grading thresholds for 2025–26, so a changed letter grade alone does not prove performance declined. ':''}Programs, support, admissions and a campus visit can change which option fits your priorities. ${sourceLink('Read the state methodology','https://www.fldoe.org/file/18534/SchoolGradesCalcGuide26.pdf')}</p></section>
<section class="sg-section" id="similar-schools"><span class="sg-eyebrow">Build a thoughtful shortlist</span><h2>Other schools to consider.</h2><p>${school.virtual?'These are other available virtual reports in the same state school category.':'These are the nearest other report pages in the same county and Florida DOE school category, using recorded campus locations.'} Their placement is based on location and school format, not a recommendation or enrollment entitlement.${grade.type==='04'?' The combination category includes different grade spans, such as K–8 and middle/high schools. Check that an option serves the grade your child needs.':''}</p><div class="sg-alternatives">${alternatives.map(peer=>`<article><div class="sg-alternative-top"><span>Florida DOE ${esc(peer.gradeYear)} · ${esc(peer.grade||peer.gradeStatus||'not graded')}</span><small>${peer.comparisonDistance===null?'Online / location not comparable':`${peer.comparisonDistance.toFixed(1)} miles between campuses`}</small></div><h3><a href="${esc(peer.reportUrl)}">${esc(peer.name)} ↗</a></h3><p class="sg-peer-span">Directory grades ${esc(peer.gradeSpan)} · NCES ${esc(peer.sourceYear)}. Confirm current entry grades.</p><p>${esc(peerConsideration(school,peer,context))}</p><small>${peer.charter?'Public charter: confirm applications, lottery and seats.':peer.virtual?'Virtual format: confirm enrollment and attendance requirements.':'District school: confirm zoning, transfers and availability.'}</small></article>`).join('')||'<p>No directly comparable report is available in this directory. Use the school finder to explore other formats and official resources.</p>'}</div><p class="sg-method">Campus-to-campus distances are straight-line estimates, not driving routes or distances from your home. Use the address search on the school map for a comparison from your own location. An alternative may be a better fit when its verified program, support or learning format aligns with your child's needs; a higher score in one measure does not settle that decision.</p></section>
<section class="sg-section" id="school-enrollment"><span class="sg-eyebrow">Before you make a decision</span><h2>Enrollment and a useful school visit.</h2><p>${esc(editorial?.enrollment?.text||(school.charter?'Ask this charter school about its application process, entry grades, seat availability and transportation before planning around enrollment.':'Confirm the address-based assignment and any transfer or choice application directly with the district for the year you plan to enroll.'))} ${sourceLink('Enrollment resource',editorial?.enrollment?.sourceUrl||official)}</p><ul class="sg-questions">${questions.map(q=>`<li>${esc(q)}</li>`).join('')}</ul></section>
<section class="sg-sources" id="school-guide-sources"><h3>Sources for this guide</h3><p>School-specific research checked ${esc(editorial.checkedAt)}. Accountability data: 2025–26, retrieved ${esc(context.grades.retrieved)}. Directory information is dated separately above.</p><ul>${uniqueSources.map(s=>`<li>${sourceLink(s.label,s.url)}</li>`).join('')}</ul></section>
</article>
<!-- SCHOOL_GUIDE_END -->`;
}
export function withSchoolGuide(html, route, context) {
  route ||= html.match(/rel="canonical" href="https:\/\/greggcostin.com([^"?]*)"/)?.[1];
  if (!route?.startsWith('/schools/')) return html;
  context ||= loadSchoolGuideContext();
  const school=context.reports.find(s=>s.reportUrl===route);
  if (!school) return html;
  const block=schoolGuideMarkup(school,context);
  if (html.includes('<!-- SCHOOL_GUIDE_START -->')) html=html.replace(/<!-- SCHOOL_GUIDE_START -->[\s\S]*?<!-- SCHOOL_GUIDE_END -->/,block);
  else if (html.includes('<div class="gc-interior-content">')) html=html.replace('<div class="gc-interior-content">',`<div class="gc-interior-content">${block}`);
  else html=html.replace(/<main\b[^>]*>/,`$&${block}`);
  if (!html.includes('href="/assets/school-guides.css"')) html=html.replace('</head>','<link rel="stylesheet" href="/assets/school-guides.css">\n</head>');
  return html;
}
