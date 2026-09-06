// Static category cards complement the interactive map and stay usable without JavaScript.
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const e = escapeHtml;

export function uniqueSchoolGuides(schools) {
  const pages = new Map();
  // Keep the first source identity, as the published guide generator does. Later
  // duplicate records can omit the primary record's grade span and affiliation.
  for (const school of schools) if (school.reportUrl && !pages.has(school.reportUrl)) pages.set(school.reportUrl, school);
  return [...pages.values()];
}

function schoolCard(school) {
  const privateSchool = school.sector === 'private';
  const christian = privateSchool && school.christian === true;
  const alabama = !privateSchool && school.state === 'AL' ? school.alabamaAccountability : null;
  const publishedGrade = school.state === 'AL' ? alabama?.grade : school.grade;
  const grade = !privateSchool && /^[ABCDF]$/.test(publishedGrade || '') ? publishedGrade : null;
  const state = school.state === 'AL' ? 'Alabama' : 'Florida';
  const year = String(alabama?.schoolYear || school.gradeYear || '').replace(/^(\d{4})-(\d{4})$/, (_, start, end) => start+'–'+end.slice(-2));
  const stateYear = state + (year ? ' '+year : '');
  const waived = alabama?.gradeStatus === 'approved-waiver' || alabama?.officialGrade === 'AW';
  const academic = grade ? `${stateYear}: official grade ${grade}${alabama && Number.isFinite(alabama.score) ? ' · Overall score '+alabama.score+'/100' : ''}` : waived ? `${stateYear}: approved waiver (AW); letter grade unavailable` : `${stateYear}: official grade unavailable`;
  const badge = christian ? 'CP' : privateSchool ? 'P' : grade || (school.magnet === true ? 'M' : '•');
  const badgeLabel = christian ? 'Christian private school; CP identifies school type, not an accountability grade' : privateSchool ? 'Private school; P identifies school type, not an accountability grade' : grade ? academic : school.magnet === true ? 'Magnet school type, not an accountability grade. '+academic : academic;
  const badgeClass = christian ? 'school-browse-badge--christian' : privateSchool ? 'school-browse-badge--private' : grade ? 'school-browse-badge--'+grade : 'school-browse-badge--type';
  const affiliation = privateSchool ? school.religiousOrientation || 'Affiliation not reported' : school.magnet === true ? school.programName || 'Public magnet school / program' : school.charter === true ? 'Public charter school' : school.virtual === true ? 'Public virtual / online school' : 'Public school';
  return `<a class="school-browse-card" href="${e(school.reportUrl)}"><span class="school-browse-badge ${badgeClass}" aria-label="${e(badgeLabel)}" title="${e(badgeLabel)}">${badge}</span><span class="school-browse-details"><span class="school-browse-name">${e(school.name)}</span><span class="school-browse-location">${e(school.city)}, ${e(school.state)} · ${e(school.county)} County</span><span class="school-browse-facts">${school.gradeSpan ? 'Directory grades '+e(school.gradeSpan) : 'Grade levels not reported'} · ${e(affiliation)}</span>${privateSchool ? '' : `<span class="school-browse-facts">${e(academic)}</span>`}</span><span class="school-browse-link">${privateSchool ? 'Guide' : 'Report'} <span aria-hidden="true">→</span></span></a>`;
}

export function withSchoolBrowse(html, dataset) {
  if (!dataset) return html;
  const privateSchools = uniqueSchoolGuides(dataset.schools.filter(s => s.sector === 'private'));
  const christianSchools = uniqueSchoolGuides(dataset.schools.filter(s => s.sector === 'private' && s.christian === true));
  const magnetSchools = uniqueSchoolGuides(dataset.schools.filter(s => s.sector === 'public' && s.magnet === true));
  const alabamaSchools = uniqueSchoolGuides(dataset.schools.filter(s => s.sector === 'public' && s.state === 'AL'));
  const groups = [
    {id:'alabama-public-schools', label:'Alabama Public', title:'Alabama Public Schools', rows:alabamaSchools, note:'Explore public schools across Baldwin County, including Gulf Shores and Orange Beach. Available Alabama letter grades and overall scores come from the 2024–25 state report cards. Florida grades elsewhere on this page use 2025–26; the states use different accountability systems and school years. An approved waiver or missing result is shown explicitly, so every school remains available to explore.'},
    {id:'private-schools', label:'Private', title:'Private Schools', rows:privateSchools, note:'Independent, Christian and other religious schools across all four covered counties. CP identifies a documented Christian private school; P identifies other private schools, including those with an unknown affiliation. Both identify school types, not academic grades. Open a guide for its educational approach, local considerations, admissions and dated sources.'},
    {id:'christian-schools', label:'Christian', title:'Christian Schools', rows:christianSchools, note:'Catholic, Protestant and other Christian schools with a documented affiliation. CP identifies a Christian private school, not an academic grade. These schools also appear in the Private category. Compare the reported grade levels and educational approach, then confirm current admissions directly.'},
    {id:'magnet-schools', label:'Magnet', title:'Magnet Schools & Programs', rows:magnetSchools, note:'Schools with a published magnet designation, including programs within a larger public school. A letter badge is the school’s official 2025–26 Florida grade, not a separate rating of its magnet program. Check program eligibility and application windows with the school.'}
  ];
  const nav = `<!-- SCHOOL_BROWSE_NAV_START -->${groups.map(g=>`<a class="btn-g" href="#${g.id}">${g.label} (${g.rows.length})</a>`).join('\n')}<!-- SCHOOL_BROWSE_NAV_END -->`;
  html = html.replace(/<!-- SCHOOL_BROWSE_NAV_START -->[\s\S]*?<!-- SCHOOL_BROWSE_NAV_END -->/g, '');
  html = html.replace(/(<a\b[^>]*href="#charter-schools"[^>]*>[\s\S]*?<\/a>)/, '$1'+nav);
  html = html.replace(/(<div)(\s+style="[^"]*display:flex[^"]*"[^>]*>\s*<a class="btn-g" href="#elementary")/, '$1 data-school-browse-nav$2');
  html = html.replace(/<!-- SCHOOL_BROWSE_INTRO_START -->[\s\S]*?<!-- SCHOOL_BROWSE_INTRO_END -->/g, '');
  html = html.replace(/(?=<div data-school-browse-nav)/, '<!-- SCHOOL_BROWSE_INTRO_START --><p class="school-browse-intro">Also explore Alabama public schools, private and Christian schools across all four counties, and documented public magnet programs. Alabama report cards use 2024–25; Florida grades use 2025–26. Christian schools also appear in Private, so category counts overlap.</p><!-- SCHOOL_BROWSE_INTRO_END -->');
  const cards = `<!-- SCHOOL_BROWSE_START -->${groups.map(g=>`<section class="gc-story-section school-browse-section" aria-labelledby="${g.id}"><h2 id="${g.id}">${g.title}</h2><p class="school-browse-note">${g.note}</p><div class="school-browse-grid">${g.rows.sort((a,b)=>a.name.localeCompare(b.name)).map(schoolCard).join('\n')}</div></section>`).join('\n')}<!-- SCHOOL_BROWSE_END -->`;
  html = html.replace(/<!-- SCHOOL_BROWSE_START -->[\s\S]*?<!-- SCHOOL_BROWSE_END -->/g, '');
  // Work with both the redesigned hub and a fresh factory render.
  const choiceSection = /(?=<section\b[^>]*>\s*<h2(?:\s[^>]*)?>(?:Private, magnet, and choice programs|Enrollment &amp; school-choice resources)<\/h2>)/;
  if (choiceSection.test(html)) html = html.replace(choiceSection, cards);
  else html = html.replace(/(?=<h2>(?:Private, magnet, and choice programs|Enrollment &amp; school-choice resources)<\/h2>)/, cards);
  html = html.replace('<h2>Private, magnet, and choice programs</h2>', '<h2>Enrollment &amp; school-choice resources</h2>')
    .replace('Private schools have their own guides and resources above.', 'Browse private and Christian school guides in the cards above, with school websites and admissions resources below.')
    .replace('We show three years on every school page for exactly this reason.', 'Florida public-school reports show up to three years of available grade history for this reason.');
  // The short cards come immediately after the map; long reference directories
  // follow the full card browser, outside the interior content column.
  const directories = [];
  for (const name of ['PRIVATE_SCHOOL_RESOURCES', 'ALL_SCHOOL_PAGES']) {
    html = html.replace(new RegExp(`<!-- ${name}_START -->[\\s\\S]*?<!-- ${name}_END -->\\s*`, 'g'), block => { directories.push(block.trimEnd()); return ''; });
  }
  return html.replace('</main>', directories.join('\n')+'</main>');
}
