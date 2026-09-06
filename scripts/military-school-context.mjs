/**
 * Additive, crawler-visible PCS guidance for the PMH school mirror.
 * Source links checked 2026-09-06 against the installation/district publishers.
 * No address-to-zone inference: county/city select useful reference links only.
 * No school-specific program, admission, Compact eligibility or commute promises.
 * This renderer is pure and does not change the shared school facts or schema.
 */

const CHECKED_AT = '2026-09-06';
const CHECKED_LABEL = 'September 6, 2026';

const SOURCES = Object.freeze({
  pensacola: {
    label: 'NAS Pensacola School Liaison',
    url: 'https://www.navymwrpensacola.com/programs/ddab9fec-1223-46aa-9705-d8e175ed0915',
  },
  whiting: {
    label: 'NAS Whiting Field School Liaison',
    url: 'https://www.navymwrwhitingfield.com/child-youth/school-liaison',
  },
  eglin: {
    label: 'Eglin School Liaison Office',
    url: 'https://eglin96fss.com/slo/',
  },
  hurlburt: {
    label: 'Hurlburt Field School Liaison',
    url: 'https://myhurlburt.com/school-liaison/',
  },
  escambia: {
    label: 'Escambia military-family enrollment guidance',
    url: 'https://www.escambiaschools.org/families/military-families/military-families',
  },
  santaRosa: {
    label: 'Santa Rosa student registration',
    url: 'https://www.santarosaschools.org/page/student-registration',
  },
  santaRosaMilitary: {
    label: 'Santa Rosa military-family resources',
    url: 'https://www.santarosaschools.org/o/srcds/page/military-school-liaisons',
  },
  okaloosa: {
    label: 'Okaloosa registration and school locator',
    url: 'https://www2.okaloosaschools.com/page/registration',
  },
  okaloosaMilitary: {
    label: 'Okaloosa military-family resources',
    url: 'https://www.okaloosaschools.com/page/military-families',
  },
  baldwin: {
    label: 'Baldwin County Public Schools registration',
    url: 'https://www.bcbe.org/departments/communications/registration/registration-new-returning',
  },
  gulfShores: {
    label: 'Gulf Shores City Schools enrollment',
    url: 'https://www.gsboe.org/login/enrollment-registration',
  },
  orangeBeach: {
    label: 'Orange Beach City Schools registration',
    url: 'https://www.orangebeachboe.org/families/registration',
  },
  records: {
    label: 'Military OneSource school-transition guide',
    url: 'https://www.militaryonesource.mil/resources/millife-guides/changing-schools/',
  },
  liaison: {
    label: 'Military OneSource liaison services',
    url: 'https://www.militaryonesource.mil/benefits/school-liaison-program/',
  },
});

const BASES = Object.freeze({
  pensacola: { label: 'NAS Pensacola base guide', url: '/bases/nas-pensacola' },
  corry: { label: 'Corry Station base guide', url: '/bases/corry-station' },
  whiting: { label: 'Whiting Field base guide', url: '/bases/whiting-field' },
  eglin: { label: 'Eglin AFB base guide', url: '/bases/eglin-afb' },
  hurlburt: { label: 'Hurlburt Field base guide', url: '/bases/hurlburt-field' },
});

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[character]));
const key = value => String(value ?? '').trim().toLowerCase();
const link = source => `<a href="${escapeHtml(source.url)}">${escapeHtml(source.label)}</a>`;
const links = sources => sources.map(link).join(' and ');
const card = (title, body) => `<div class="pmh-school-card"><h3>${title}</h3>${body}</div>`;

function localResources(school) {
  const county = key(school.county).replace(/\s+county$/, '');
  const city = key(school.city);
  const state = key(school.state);
  if ((state === 'fl' || state === 'florida') && county === 'escambia') {
    return {
      county: 'Escambia County', district: SOURCES.escambia,
      liaisons: [SOURCES.pensacola], bases: [BASES.pensacola, BASES.corry],
      enrollment: `Use ${link(SOURCES.escambia)} to check the attendance zone and ask about registration before arrival with orders. Confirm the route into this particular school: a neighborhood assignment, choice application, charter process or referral may involve different steps.`,
      support: 'For a Pensacola-area assignment, the Navy liaison connects families with schools and transition resources across service branches.',
    };
  }
  if ((state === 'fl' || state === 'florida') && county === 'santa rosa') {
    const south = city === 'navarre' || city === 'navarre beach';
    const gulfBreeze = city === 'gulf breeze';
    return {
      county: 'Santa Rosa County', district: SOURCES.santaRosa,
      liaisons: south ? [SOURCES.hurlburt, SOURCES.whiting]
        : gulfBreeze ? [SOURCES.pensacola, SOURCES.whiting] : [SOURCES.whiting],
      bases: south ? [BASES.hurlburt, BASES.whiting]
        : gulfBreeze ? [BASES.pensacola, BASES.whiting] : [BASES.whiting],
      enrollment: `Start with ${link(SOURCES.santaRosa)}. Verify your address through the district locator, then ask separately about any school-choice request. Whiting's liaison notes that grade-level capacity can affect options, so confirm the receiving school before making housing decisions.`,
      support: `The ${link(SOURCES.santaRosaMilitary)} connect families with several installations. Choose the liaison for your duty assignment; a Santa Rosa school address does not determine that assignment.`,
    };
  }
  if ((state === 'fl' || state === 'florida') && county === 'okaloosa') {
    const western = city === 'mary esther' || city === 'fort walton beach';
    return {
      county: 'Okaloosa County', district: SOURCES.okaloosa,
      liaisons: western ? [SOURCES.hurlburt, SOURCES.eglin] : [SOURCES.eglin, SOURCES.hurlburt],
      bases: western ? [BASES.hurlburt, BASES.eglin] : [BASES.eglin, BASES.hurlburt],
      enrollment: `The ${link(SOURCES.okaloosa)} distinguish address-based assignment from controlled open enrollment. Check which applies here, including any program application. Bring your projected arrival date to the registrar rather than assuming an available map result means an available seat.`,
      support: `The ${link(SOURCES.okaloosaMilitary)} identify Eglin's liaison for Eglin, Duke Field and 7th Special Forces Group families. Hurlburt has its own liaison; use the contact matching your assignment.`,
    };
  }
  if ((state === 'al' || state === 'alabama') && county === 'baldwin') {
    // These are reference selections, not a determination of district boundaries.
    const district = city === 'gulf shores' ? SOURCES.gulfShores
      : city === 'orange beach' ? SOURCES.orangeBeach : SOURCES.baldwin;
    return {
      county: 'Baldwin County', district,
      liaisons: [SOURCES.pensacola], bases: [BASES.pensacola],
      enrollment: `Consult ${link(district)}. Baldwin County Public Schools, Gulf Shores City Schools and Orange Beach City Schools have separate enrollment systems. Have the registrar confirm the district serving your exact residence and any transfer process; a mailing city or nearby map pin is not enrollment approval.`,
      support: 'If your orders are for NAS Pensacola while you are considering Alabama housing, ask its liaison to help coordinate the interstate school transition. Otherwise, begin with your assigned installation.',
    };
  }
  return {
    county: school.county ? `${escapeHtml(String(school.county).replace(/\s+county$/i, ''))} County` : 'the local area',
    district: null, liaisons: [SOURCES.liaison], bases: [],
    enrollment: 'Ask the school registrar which education agency handles enrollment and how your exact residential address or program application is evaluated. Confirm whether a transfer, selection process or placement referral is needed before relying on a school listing when choosing housing.',
    support: 'Start with the school liaison at your assigned installation for help coordinating the move with the receiving school.',
  };
}

function gradeQuestions(school, name) {
  const levels = new Set((Array.isArray(school.levels) ? school.levels : []).map(key));
  const elementary = levels.has('elementary');
  const middle = levels.has('middle');
  const high = levels.has('high');
  if (high && (middle || elementary)) {
    return `For a family entering different grades at ${name}, request a separate placement conversation for each child. A teen needs a review of transferred credits, graduation requirements and course sequencing; a younger sibling needs a classroom transition plan. Confirm which grades share a campus, schedules and arrival procedures instead of assuming one arrangement serves every student.`;
  }
  if (high) {
    return `Before setting a start date at ${name}, ask the counselor to compare completed credits, current courses and graduation requirements. Bring course descriptions as well as grades. Ask about unfinished semester work, prerequisites and activity eligibility, then request a written course plan. This is especially useful when a move crosses state lines or interrupts the senior year.`;
  }
  if (middle && elementary) {
    return `At ${name}, ask how placement works at the transition between elementary and middle grades. For younger students, discuss reading and math routines; for middle-grade students, bring the current schedule and ask about course sequence and any high-school-credit classes. Confirm which ages share arrival times, activities and after-school arrangements before planning a sibling school run.`;
  }
  if (middle) {
    return `Ask ${name} to review the student's current math sequence, electives and any high-school-credit coursework before the first day. Find out how a new student learns the schedule, meets teachers and joins activities after the year has started. A short counselor conversation can clarify whether the proposed timetable continues the work already underway at the previous school.`;
  }
  if (elementary) {
    return `For ${name}, prioritize a teacher handoff about reading, math and daily routines. Ask how the school introduces a child arriving midyear and how parents receive progress updates. If your move involves kindergarten or first grade, have the registrar review age and prior-enrollment documentation. Confirm care availability and pickup authorization separately from school admission.`;
  }
  return `Confirm the current grade range and delivery format with ${name} before discussing placement. Ask which prior records staff use, who reviews completed coursework and what the first week would look like for your child. If siblings need different grades, verify each opening individually; this directory does not establish that every age group has an available place.`;
}

/**
 * @param {{name:string,city?:string,county?:string,state?:string,gradeSpan?:string,
 * sector?:string,christian?:boolean,levels?:string[],lat?:number,lng?:number,
 * reportUrl?:string}} school Shared finder record; no URL or coordinate is trusted as a zone.
 * @returns {string} A complete section, intended once per school detail page.
 */
export function militarySchoolContext(school = {}) {
  const data = school && typeof school === 'object' ? school : {};
  const name = escapeHtml(String(data.name || 'this school').trim());
  const city = data.city ? escapeHtml(String(data.city).trim()) : '';
  const place = city ? ` in ${city}` : '';
  const privateSchool = key(data.sector) === 'private';
  const publicSchool = key(data.sector) === 'public';
  const local = localResources(data);
  const admissions = privateSchool
    ? `Contact ${name} directly about openings, placement, total tuition and fees, and the withdrawal or refund policy if orders change. Ask what can be completed remotely before arrival. The ${link({ ...SOURCES.records, label: 'Interstate Compact' })} does not apply to private schools; admissions and transfer decisions follow the school's policies. ${local.district ? `For a public-school alternative, consult ${link(local.district)}.` : 'Ask the installation liaison about public-school alternatives.'}`
    : `${local.enrollment} ${publicSchool ? 'Ask the liaison whether your transfer qualifies for Interstate Compact provisions and how to resolve a records or placement issue.' : 'Have the registrar confirm the school sector and applicable transfer policies.'}`;
  const records = `Request a portable copy of report cards, transcripts, current coursework and relevant learning plans before you leave. If your child has an IEP, 504 plan or other support arrangement, arrange a handoff with the receiving staff and ask what support will be available at the start. Use the ${link(SOURCES.records)} to prepare for that conversation.`;
  const faith = privateSchool && data.christian === true
    ? ' Ask how faith instruction and family participation expectations fit into a new student’s week.' : '';
  const liaison = `${local.support} Local contacts: ${links(local.liaisons)}. Ask about youth introductions, deployment-related support and coordination with school staff. Availability of a particular service at ${name} should be confirmed directly.`;
  const route = Number.isFinite(data.lat) && Number.isFinite(data.lng)
    ? 'Check the school-day route to your actual duty gate, dismissal time and backup pickup plan. The map estimates travel; it does not establish a bus route, attendance boundary or guaranteed commute.'
    : 'Confirm the current campus or remote-attendance arrangement before planning travel, after-school care or a duty-day pickup. A directory address alone does not establish where a student attends.';
  const bases = local.bases.length
    ? `<p class="pmh-school-base-links">Plan the installation side: ${links(local.bases)}.</p>` : '';

  return `<section class="pmh-school-context" id="military-school-planning" aria-labelledby="military-school-planning-title">
  <p class="pmh-school-kicker">A school plan for your PCS</p>
  <h2 id="military-school-planning-title">Moving with a student: ${name}</h2>
  <p class="pmh-school-intro">Considering ${name}${place} during a military move? Pair the school's academic information with a plan for admission, records and the first week.</p>
  <div class="pmh-school-grid">
    ${card(privateSchool ? 'Confirm the admissions plan' : `Confirm enrollment in ${local.county}`, `<p>${admissions}</p>`)}
    ${card('Carry the learning history forward', `<p>${records}</p>`)}
    ${card('Match the handoff to the student', `<p>${gradeQuestions(data, name)}${faith}</p>`)}
    ${card('Connect school, home and duty station', `<p>${liaison}</p>`)}
  </div>
  <p class="pmh-school-practical">${route}</p>
  ${bases}
  <p class="pmh-school-source-note">Installation and enrollment resources checked <time datetime="${CHECKED_AT}">${CHECKED_LABEL}</time>. Confirm current requirements with the receiving school.</p>
</section>`;
}

/** Brief companion section for the school finder hub; does not repeat the whole checklist. */
export function militaryHubContext() {
  return `<section class="pmh-school-context pmh-school-hub-context" id="military-school-move" aria-labelledby="military-school-move-title">
  <p class="pmh-school-kicker">Your orders. Their next school.</p>
  <h2 id="military-school-move-title">Build the school transition into your PCS plan</h2>
  <p class="pmh-school-intro">Use the map to compare locations, then open each school guide for academic information, admission resources and military moving questions. Confirm enrollment before making a housing decision; proximity is not a school assignment.</p>
  <div class="pmh-school-grid">
    ${card('Start with your installation', `<p>${links([SOURCES.pensacola, SOURCES.whiting])}; ${links([SOURCES.eglin, SOURCES.hurlburt])}. Contact the liaison for your actual assignment to discuss records, youth introductions and school support.</p>`)}
    ${card('Use the right enrollment office', `<p>Florida resources: ${links([SOURCES.escambia, SOURCES.santaRosa])}; ${link(SOURCES.okaloosa)}. In Alabama, ${link(SOURCES.baldwin)}, ${link(SOURCES.gulfShores)} and ${link(SOURCES.orangeBeach)} are separate public systems. Each private school handles its own admissions.</p>`)}
    ${card('Prepare the handoff', `<p>Gather current school records, course information and relevant learning plans. Ask the receiving registrar what can begin with orders before arrival, and which documents still need review. The ${link(SOURCES.records)} covers transition planning; private-school enrollment is outside the Interstate Compact.</p>`)}
  </div>
  <p class="pmh-school-source-note">Official resources checked <time datetime="${CHECKED_AT}">${CHECKED_LABEL}</time>. For the wider move, use our <a href="/pcs-guide">PCS planning guide</a>.</p>
</section>`;
}
