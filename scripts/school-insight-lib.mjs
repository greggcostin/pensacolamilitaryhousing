import { readFileSync, existsSync } from 'node:fs';

export const INSIGHT_FILES = ['escambia-a', 'escambia-b', 'santarosa'];
export function loadSchoolInsights({required = false} = {}) {
  const records = {};
  for (const area of INSIGHT_FILES) {
    const file = `content/schools/report-insights-${area}.json`;
    if (!existsSync(file)) { if (required) throw new Error(`Missing school insight file: ${file}`); continue; }
    const data = JSON.parse(readFileSync(file, 'utf8'));
    for (const [route, entry] of Object.entries(data.records || {})) {
      if (records[route]) throw new Error(`Duplicate school insight: ${route}`);
      records[route] = entry;
    }
  }
  return records;
}

const finite = value => typeof value === 'number' && Number.isFinite(value);
const fmt = value => Number.isInteger(value) ? String(value) : value.toFixed(1);
const SUBJECTS = {ela:'English language arts', math:'mathematics', sci:'science', socst:'social studies'};

// Interpret each measure against its own same-category county comparison.
// Different subjects and cohorts are never treated as interchangeable test scores.
export function schoolAcademicReading(grade, performance) {
  const paragraphs = [];
  const history = [grade.g2024, grade.g2025, grade.g2026];
  const complete = history.every(value => /^[ABCDF]$/.test(value || ''));
  if (complete && new Set(history).size === 1) {
    paragraphs.push({title:'A consistent state classification', text:`Three consecutive ${history[0]} grades give you a consistent accountability classification across the published years. That is useful context, but it does not show whether every subject, classroom or student made the same progress.`});
  } else if (complete) {
    paragraphs.push({title:'Look beyond the latest letter', text:`The sequence ${history.join(' → ')} is a reason to ask what changed between the three reporting years. A letter-grade change is not itself a measure of an individual child's learning growth.${['03','04'].includes(grade.type) ? ' High and combination schools also faced higher grading thresholds in 2025–26, so a lower letter alone is not proof of weaker instruction.' : ' Ask the school to explain the underlying achievement and learning-gains results before attributing the change to a particular program.'}`});
  } else {
    paragraphs.push({title:'A limited history to work with', text:'This dataset does not contain three complete annual letter grades for this school. Use the available results as a starting point and request the missing years or an explanation of any change in school identity. Missing data are not a poor rating.'});
  }
  const subjects = performance.filter(row => SUBJECTS[row.field] && finite(row.value) && finite(row.median) && finite(row.delta) && row.peerCount >= 3);
  const positive = subjects.filter(row => row.delta > 0).sort((a,b) => b.delta-a.delta)[0];
  const negative = subjects.filter(row => row.delta < 0).sort((a,b) => a.delta-b.delta)[0];
  if (positive) paragraphs.push({title:'A result worth noticing', text:`${SUBJECTS[positive.field][0].toUpperCase()+SUBJECTS[positive.field].slice(1)} is ${fmt(positive.value)}%, compared with a ${fmt(positive.median)}% median for ${positive.peerCount} other local schools in the same state category. That ${fmt(positive.delta)}-point difference is the largest positive peer gap among the subject measures available here. Ask which learning opportunities sit behind it and how a new student would access them.`});
  if (negative) paragraphs.push({title:'Where to look closer', text:`The ${SUBJECTS[negative.field]} result is ${fmt(negative.value)}%, ${fmt(Math.abs(negative.delta))} percentage points below its ${fmt(negative.median)}% local peer median. This is a specific area to discuss, rather than a verdict on the whole school. Ask how teachers identify a student who needs help, what support looks like during the week, and how progress is shared with families.`});
  else if (subjects.length) paragraphs.push({title:'The next question after the scores', text:`None of the ${subjects.length} subject measures with enough local comparison data falls below its own peer median. The next question is how the school supports both students who need more time and students ready for additional challenge. These school-level percentages do not measure class size, belonging or your child's likely outcome.`});
  else paragraphs.push({title:'Keep the comparison in proportion', text:'There are too few comparable local subject results here to identify a dependable relative strength or concern. Ask for the school’s current subject-level results and improvement priorities. A sparse comparison group should not be presented as a ranking.'});
  if (finite(grade.gradRate) && finite(grade.collegeCareer)) paragraphs.push({title:'Finishing school and taking the next step', text:`The published graduation rate is ${fmt(grade.gradRate)}%, while college and career acceleration is ${fmt(grade.collegeCareer)}%. Both refer to the state's 2024–25 cohort measures, but they answer different questions. Acceleration reflects specified qualifying accomplishments; it is not a college-admission rate or a count of every student taking an advanced class. Ask which pathways fit your child's goals and what the entry requirements are.`});
  return paragraphs;
}

// A brief, clearly limited orientation for every directory record. Rich review
// copy is attached only where school-specific research exists.
export function schoolDirectoryInsight(school, research) {
  if (research) return {kind:'editorial', title:research.headline, text:research.perspective[0], detailUrl:`${school.reportUrl}#school-perspective`, sourceUrl:research.sources[0]?.url, checkedAt:research.checkedAt};
  const span = school.gradeSpan ? `The ${school.sourceYear} directory lists grades ${school.gradeSpan}` : `The ${school.sourceYear} directory does not report a complete grade span`;
  let text = `${school.name} is listed here in ${school.city}. ${span}; current campus or program updates are noted separately when available. `;
  if (school.virtual === true) text += 'For an online option, compare the weekly teaching schedule, adult supervision expected at home, live teacher access and the way attendance is recorded. A mailing address does not indicate daily campus instruction.';
  else if (school.sector === 'private') text += `Start with the grades currently offered and the full admissions picture: tuition, fees, available seats, transport and support services.${school.religiousOrientation ? ` Its reported affiliation is ${school.religiousOrientation}; ask how the school's stated approach appears in classes and daily routines.` : ' A religious affiliation has not been verified in this directory.'} ${school.state==='AL' ? 'Florida accountability grades do not apply to this Alabama private school. Ask for the assessments and accreditation information the school uses to demonstrate student progress.' : 'A missing Florida accountability grade is not evidence of poor performance.'}`;
  else if (school.magnet === true) text += `${school.programName ? `The listed magnet offering is ${school.programName}. ` : 'The directory identifies a magnet offering. '}Check which grades and students can access it, whether a separate application is required, and how transport works. A magnet program may be one pathway within a wider school.`;
  else if (school.charter === true) text += 'As a public charter option, the practical questions are entry grades, available seats, the application process and transportation. Charter status alone does not describe the quality of instruction or guarantee admission.';
  else text += `Begin with the current grade span, address assignment and course or support options for the student who would enroll.${school.state==='AL' ? '' : school.grade ? ` The recorded Florida accountability grade is ${school.grade} for ${school.gradeYear}; read the components and reporting year alongside the letter.` : ' No Florida letter grade is linked in this dataset; that is a coverage limit, not a rating.'}`;
  if(school.state==='AL' && school.sector==='public')text+=' Florida school grades do not apply to this Alabama school; use Alabama’s official report card for state accountability results.';
  return {kind:'directory',title:'A starting point for your school visit',text,sourceUrl:school.programSourceUrl||school.affiliationSourceUrl||school.sourceUrl,checkedAt:null};
}
