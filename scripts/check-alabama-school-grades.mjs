// Read-only Alabama accountability/source and both-site presentation regression checks.
// node scripts/check-alabama-school-grades.mjs [--source-only]
// Python 3 stdlib independently reads XLSX ZIP/XML; no third-party packages/network.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import vm from 'node:vm';
import * as core from '../civilian-site/assets/school-finder-core.js';
import * as address from '../civilian-site/assets/school-address-search.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const read = file => readFileSync(resolve(ROOT, file), 'utf8');
const json = file => JSON.parse(read(file));
const bytes = file => readFileSync(resolve(ROOT, file));
const sha = value => createHash('sha256').update(value).digest('hex');
const text = html => String(html).replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&[^;]+;/g, ' ').replace(/\s+/g, ' ').trim();
const normalize = name => String(name).toLowerCase().replace(/[^a-z0-9]/g, '');
const identity = row => `${Number(row.districtId)}:${Number(row.schoolId)}`;
const sourceIdentity = row => `${Number(row.values[0])}:${Number(row.values[2])}`;
const sorted = values => [...values].sort();
const sourceOnly = process.argv.includes('--source-only');
const assetFolder = site => site === 'public' ? 'school-assets' : 'assets';
const results = [];
async function check(name, test) {
  try { await test(); results.push({ name, passed: true }); console.log('PASS ' + name); }
  catch (error) { results.push({ name, passed: false }); console.error('FAIL ' + name + ': ' + error.message); }
}

const snapshot = json('content/schools/alabama-grades-2025.json');
const rawDirectory = json('content/schools/map-public-source.json').schools;
const alDirectory = rawDirectory.filter(s => s.state === 'AL' && s.sector === 'public');
const rowsByIdentity = new Map(snapshot.schools.map(s => [identity(s), s]));
const districts = new Map([[2, 'Baldwin County'], [152, 'Gulf Shores City'], [174, 'Orange Beach City']]);
const sourceContracts = {
  letters: {
    path: 'content/schools/sources/alabama-2025/letter-grades.xlsx',
    hash: '083721bbf9887bd82250ef0fdfcaae19793b9c9e7a2f1f4c01c9023e0772272f',
    url: 'https://www.alabamaachieves.org/wp-content/uploads/2025/11/RD_SP_20251113_2024-2025StateAccountabilityLetterGrades_v1.xlsx',
    header: ['System Code', 'System Name', 'School Code', 'School Name', 'Total Points Earned', 'Letter Grade'],
  },
  indicators: {
    path: 'content/schools/sources/alabama-2025/indicator-scores.xlsx',
    hash: 'c8cc3d884387a97f0f2ce9d91f83cb7d29f9aa13d06bbe9287545eb206fc52df',
    url: 'https://www.alabamaachieves.org/wp-content/uploads/2025/11/RD_SP_20251113_2024-2025StateAccountabilityIndicatorScores_v1.xlsx',
    header: ['System Code', 'System Name', 'School Code', 'School Name', 'Subpopulation', 'Indicator', 'Indicator Score'],
  },
};

// Separate implementation from the production importer: stdlib ZIP central-directory
// reader and XML parser, rather than that importer's hand-written Node ZIP/XML regexes.
const INDEPENDENT_XLSX = String.raw`
import json, sys, zipfile, xml.etree.ElementTree as ET
ns={'s':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
out=[]
for path in sys.argv[1:]:
    with zipfile.ZipFile(path) as archive:
        shared=ET.fromstring(archive.read('xl/sharedStrings.xml'))
        strings=[''.join(t.text or '' for t in item.findall('.//s:t',ns)) for item in shared]
        sheet=ET.fromstring(archive.read('xl/worksheets/sheet1.xml'))
        rows=[]
        for row in sheet.findall('s:sheetData/s:row',ns):
            values=[None]*7
            for cell in row.findall('s:c',ns):
                ref=cell.get('r'); letters=''.join(c for c in ref if c.isalpha())
                column=0
                for letter in letters: column=column*26+ord(letter)-64
                if column>7: continue
                assert cell.find('s:f',ns) is None, 'Unexpected formula'
                v=cell.find('s:v',ns); kind=cell.get('t')
                if kind=='inlineStr': value=''.join(t.text or '' for t in cell.findall('.//s:t',ns))
                elif v is None: value=None
                elif kind=='s': value=strings[int(v.text)]
                else: value=float(v.text)
                values[column-1]=value
            rows.append({'row':int(row.get('r')),'values':values})
        out.append({'firstRow':rows[0], 'header':next(r for r in rows if r['values'][0]=='System Code'),
            'rowCount':len(rows), 'rows':[r for r in rows if r['values'][0] in [2,152,174]]})
print(json.dumps(out))
`;
let originals;
await check('Official workbooks match reviewed hashes and have reproducible independent XLSX reads', () => {
  for (const [key, contract] of Object.entries(sourceContracts)) {
    const b = bytes(contract.path), meta = snapshot.sources[key];
    assert.equal(sha(b), contract.hash, key + ' source changed; review the new release before updating this test');
    assert.equal(meta.sha256, contract.hash); assert.equal(meta.bytes, b.length);
    assert.equal(meta.localPath, contract.path); assert.equal(meta.url, contract.url);
  }
  const child = spawnSync(process.env.PYTHON || 'python', ['-c', INDEPENDENT_XLSX, ...Object.values(sourceContracts).map(c => resolve(ROOT, c.path))], { cwd: ROOT, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024, timeout: 30000, windowsHide: true });
  assert.ifError(child.error);
  assert.equal(child.status, 0, 'Independent Python 3 stdlib reader failed: ' + child.stderr);
  originals = Object.fromEntries(['letters', 'indicators'].map((key, i) => [key, JSON.parse(child.stdout)[i]]));
  for (const [key, source] of Object.entries(originals)) {
    assert.match(source.firstRow.values[0], /2024-2025/);
    assert.deepEqual(source.header.values.slice(0, sourceContracts[key].header.length), sourceContracts[key].header);
  }
});

await check('Offline importer reproduces the committed snapshot without rewriting files', () => {
  const before = sha(bytes('content/schools/alabama-grades-2025.json'));
  const child = spawnSync(process.execPath, ['scripts/import-alabama-school-grades.mjs', '--check'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 2 * 1024 * 1024, timeout: 30000, windowsHide: true });
  assert.ifError(child.error); assert.equal(child.status, 0, child.stderr || child.stdout);
  assert.equal(sha(bytes('content/schools/alabama-grades-2025.json')), before);
});

await check('All 50 Alabama public identities match NCES state IDs exactly; private and system rows are excluded', () => {
  assert.equal(snapshot.schemaVersion, 1); assert.equal(snapshot.state, 'AL');
  assert.equal(snapshot.schoolYear, '2024-2025'); assert.equal(snapshot.releaseYear, 2025);
  assert.equal(snapshot.authority, 'Alabama State Department of Education');
  assert.equal(alDirectory.length, 50); assert.equal(snapshot.schools.length, 50); assert.equal(rowsByIdentity.size, 50);
  assert.deepEqual(sorted(snapshot.schools.map(s => s.ncesId)), sorted(alDirectory.map(s => s.ncesId)));
  assert.deepEqual(snapshot.missingFromDirectory, []);
  for (const original of alDirectory) {
    const row = rowsByIdentity.get(identity(original)); assert(row, original.name);
    assert.equal(row.id, 'public-' + original.id); assert.equal(row.ncesId, original.ncesId);
    assert.equal(row.districtId, original.districtId); assert.equal(row.schoolId, original.schoolId);
    assert.equal(original.rawIdentifiers.ST_SCHID, `AL-${row.districtId}-${row.schoolId}`);
    assert(Number(row.schoolId) > 0); assert.equal(row.districtName, districts.get(Number(row.districtId)));
    assert.equal(normalize(row.name), normalize(original.name)); assert.equal(row.state, 'AL');
    assert.equal(row.schoolYear, '2024-2025'); assert.match(row.reportUrl, /^\/schools\/[a-z0-9-]+$/);
  }
  assert.deepEqual(Object.fromEntries([...districts].map(([id]) => [id, snapshot.schools.filter(s => Number(s.districtId) === id).length])), { 2: 45, 152: 3, 174: 2 });
});

await check('46 letters, one approved waiver and three absent results remain separate', () => {
  assert.deepEqual(snapshot.counts, { directoryPublicSchools: 50, matchedSchoolRows: 47, graded: 46, approvedWaiver: 1, insufficientData: 0, notPublished: 3 });
  const tally = snapshot.schools.reduce((out, s) => (out[s.grade || s.gradeStatus] = (out[s.grade || s.gradeStatus] || 0) + 1, out), {});
  assert.deepEqual(tally, { A: 23, B: 22, C: 1, 'approved-waiver': 1, 'not-published': 3 });
  assert.deepEqual(snapshot.schools.filter(s => s.gradeStatus === 'approved-waiver').map(identity), ['2:190']);
  assert.deepEqual(sorted(snapshot.schools.filter(s => s.gradeStatus === 'not-published').map(identity)), ['2:27', '2:6000', '2:6010']);
  for (const row of snapshot.schools.filter(s => s.gradeStatus !== 'graded')) {
    assert.equal(row.grade, null); assert.equal(row.score, null); assert.deepEqual(row.indicators, []);
    assert(row.reason.length > 40);
    if (row.gradeStatus === 'approved-waiver') assert.equal(row.officialGrade, 'AW');
    else { assert.equal(row.officialGrade, null); assert.equal(row.sourceRow, null); assert.equal(row.matchMethod, null); }
  }
});

await check('Each total, letter, identity and source-row reference agrees with the original school-level workbook cell', () => {
  assert(originals, 'Independent originals unavailable');
  const schoolRows = originals.letters.rows.filter(r => Number.isInteger(r.values[2]) && r.values[2] > 0);
  assert.equal(schoolRows.length, 47); const source = new Map(schoolRows.map(r => [sourceIdentity(r), r]));
  // These summary rows have plausible letters/scores but must never fill a missing school.
  const systems = originals.letters.rows.filter(r => r.values[2] === 0);
  assert.deepEqual(systems.map(r => [r.values[0], r.values[4], r.values[5]]), [[2, 89, 'B'], [152, 96, 'A'], [174, 98, 'A']]);
  for (const row of snapshot.schools) {
    const sourceRow = source.get(identity(row)); assert.equal(row.sourceUrl, sourceContracts.letters.url);
    if (!sourceRow) { assert.equal(row.gradeStatus, 'not-published'); assert.equal(row.score, null); continue; }
    const v = sourceRow.values;
    assert.equal(row.sourceRow, sourceRow.row); assert(v[2] > 0);
    assert.equal(v[1], row.districtName); assert.equal(normalize(v[3]), normalize(row.name));
    assert.equal(row.officialName, v[3].trim()); assert.equal(row.officialGrade, v[5]);
    assert.equal(row.matchMethod, 'exact-district-and-school-code-with-normalized-name-check');
    if (/^[ABCDF]$/.test(v[5])) {
      assert.equal(row.grade, v[5]); assert.equal(row.score, v[4]);
      assert.equal(row.gradeStatus, 'graded'); assert(Number.isInteger(row.score) && row.score >= 0 && row.score <= 100);
    } else { assert.equal(v[4], 'AW'); assert.equal(row.gradeStatus, 'approved-waiver'); }
  }
});

await check('Every indicator comes from the same school and All Students group, without subgroup/system substitution', () => {
  assert(originals, 'Independent originals unavailable');
  let total = 0;
  for (const row of snapshot.schools) {
    const raw = originals.indicators.rows.filter(r => sourceIdentity(r) === identity(row) && r.values[4] === 'All Students');
    const expected = raw.map(r => ({ name: r.values[5], value: r.values[6], subpopulation: 'All Students', sourceRow: r.row, sourceUrl: sourceContracts.indicators.url })).sort((a, b) => a.name.localeCompare(b.name));
    assert.deepEqual(row.indicators, expected, row.name); assert.equal(new Set(row.indicators.map(i => i.name)).size, row.indicators.length);
    for (const r of raw) { assert(r.values[2] > 0); assert.equal(normalize(r.values[3]), normalize(row.officialName)); }
    for (const i of row.indicators) assert(Number.isFinite(i.value));
    total += row.indicators.length;
  }
  assert.equal(total, 175, 'Expected school-level component coverage for this reviewed release');
  assert.match(snapshot.methodology.indicatorMeaning, /not all proficiency percentages/);
  assert.match(snapshot.methodology.indicatorMeaning, /2023-2024 cohort/);
});

if (!sourceOnly) {
  const sites = ['civilian-site', 'public'];
  const datasets = Object.fromEntries(sites.map(site => [site, json(site + '/' + assetFolder(site) + '/school-finder-data.json')]));
  const schools = datasets['civilian-site'].schools;
  const flGrades = json('content/schools/school-grades-2026.json');
  const flById = new Map(flGrades.schools.map(g => [`${Number(g.district)}:${Number(g.num)}`, g]));

  await check('Both finder datasets contain the identical Alabama source objects and leave private schools ungraded', () => {
    for (const site of sites) {
      const all = datasets[site].schools, al = all.filter(s => s.state === 'AL' && s.sector === 'public');
      assert.equal(al.length, 50); assert.equal(al.filter(s => s.grade).length, 46);
      for (const school of al) {
        const source = rowsByIdentity.get(identity(school));
        assert.deepEqual(school.alabamaAccountability, source, site + ': ' + school.name);
        assert.equal(school.grade, source.grade); assert.equal(school.gradeStatus, source.officialGrade);
        assert.equal(school.gradeYear, '2024–25');
      }
      for (const school of all.filter(s => s.sector === 'private')) {
        assert.equal(school.grade, null); assert.equal(school.gradeStatus, null);
        assert(!school.alabamaAccountability, school.name + ' private school acquired Alabama accountability');
      }
      for (const school of all.filter(s => s.state === 'FL' && s.sector === 'public')) {
        const original = flById.get(identity(school));
        assert(!school.alabamaAccountability, school.name + ' Florida school acquired Alabama accountability');
        assert.equal(school.grade, original && /^[ABCDF]$/.test(original.g2026) ? original.g2026 : null);
        assert.equal(school.gradeStatus, original?.g2026 || null);
        assert.equal(school.gradeYear, original ? '2025–26' : null);
      }
      const source = datasets[site].sources.find(s => s.url === snapshot.sourcePage || s.url === sourceContracts.letters.url);
      assert(source, site + ' missing Alabama source attribution'); assert.equal(source.year, '2024–25');
    }
    const facts = s => ({ id: s.id, ncesId: s.ncesId, state: s.state, grade: s.grade, gradeStatus: s.gradeStatus, gradeYear: s.gradeYear, alabamaAccountability: s.alabamaAccountability, christian: s.christian, sector: s.sector });
    assert.deepEqual(datasets.public.schools.map(facts), schools.map(facts));
  });

  await check('State filter intersects grade/type/area filters, and an AW is never grade A', () => {
    const ids = rows => sorted(rows.map(s => s.id));
    for (const state of ['AL', 'FL']) {
      assert.deepEqual(ids(core.findSchools(schools, { gradeState: state })), ids(schools.filter(s => s.state === state)));
      for (const grade of ['A', 'B', 'C', 'D', 'F']) assert.deepEqual(ids(core.findSchools(schools, { gradeState: state, grade })), ids(schools.filter(s => s.state === state && s.grade === grade)));
      assert.deepEqual(ids(core.findSchools(schools, { gradeState: state, grade: 'none', type: 'public' })), ids(schools.filter(s => s.state === state && s.sector === 'public' && !s.grade)));
    }
    assert.equal(core.findSchools(schools, { gradeState: 'AL', grade: 'A' }).length, 23);
    assert.equal(core.findSchools(schools, { gradeState: 'AL', type: 'public', grade: 'none' }).length, 4);
    assert.equal(core.findSchools(schools, { gradeState: 'AL', area: 'county:FL|Escambia' }).length, 0);
    assert.equal(core.findSchools(schools, { gradeState: 'AL', type: 'private', grade: 'A' }).length, 0);
    assert.deepEqual(ids(core.findSchools(schools, { gradeState: 'all' })), ids(core.findSchools(schools)));
  });

  await check('Both school hubs expose state controls and dated Alabama no-JS cards without mixed-system ranking claims', () => {
    for (const site of sites) {
      const html = read(site + '/schools.html');
      const control = html.match(/<select\b[^>]*\bname="gradeState"[^>]*>[\s\S]*?<\/select>/)?.[0];
      assert(control, site + ' missing gradeState select');
      for (const value of ['all', 'FL', 'AL']) assert(control.includes(`value="${value}"`));
      assert.match(text(html), /different accountability/i);
      for (const school of snapshot.schools) {
        const cards = [...html.matchAll(/<a\b[^>]*class="school-browse-card"[^>]*>[\s\S]*?<\/a>/g)].map(m => m[0]);
        const card = cards.find(c => c.includes(`href="${school.reportUrl}"`)); assert(card, site + ': ' + school.name + ' static card');
        const visible = text(card); assert.match(visible, /Alabama/); assert.match(visible, /2024[–-]25/);
        if (school.grade) { assert(visible.includes('official grade ' + school.grade)); assert(visible.includes(school.score + '/100')); }
        else if (school.officialGrade === 'AW') assert.match(visible, /approved waiver.*AW/i);
        else assert.match(visible, /unavailable|not published|not reported/i);
      }
    }
  });

  await check('All 50 guides on each domain expose sourced Alabama totals/statuses and properly dated indicator tables', () => {
    const sections = new Map();
    for (const site of sites) for (const school of snapshot.schools) {
      const html = read(site + school.reportUrl + '.html');
      const academic = html.match(/<section\b[^>]*\bid="school-comparison"[^>]*>[\s\S]*?<\/section>/)?.[0];
      assert(academic, site + ': ' + school.name + ' academic section missing');
      const visible = text(academic);
      assert.match(visible, /Alabama/); assert.match(visible, /2024[–-]25|2024-2025/);
      assert(!/Florida DOE|not imported an Alabama result|FL grade not applicable/.test(visible));
      assert(academic.includes(sourceContracts.letters.url), school.name + ' missing original grade source');
      if (school.grade) {
        const summary = academic.match(/<p\b[^>]*class="sg-alabama-result"[^>]*>([\s\S]*?)<\/p>/)?.[1];
        assert(summary, school.name + ' school-result summary missing');
        assert.equal(text(summary.match(/<strong\b[^>]*>([\s\S]*?)<\/strong>/)?.[1]), school.grade, school.name + ' official letter not visible');
        assert(new RegExp(`\\b${school.score}\\s*(?:/\\s*100|out of 100)`).test(visible), school.name + ' score not visible');
        assert(academic.includes(sourceContracts.indicators.url), school.name + ' component source missing');
        const table = academic.match(/<table\b[\s\S]*?<\/table>/)?.[0]; assert(table, school.name + ' component table missing');
        assert.match(table, /<caption\b/); assert.match(table, /<th\b[^>]*scope="row"/);
        assert.equal((table.match(/<thead>[\s\S]*?<\/thead>/)?.[0].match(/<th\b/g) || []).length, 2, school.name + ' descriptive column headers');
        assert.match(academic, /tabindex="0"[^>]*aria-label="Alabama official school indicators"/);
        for (const indicator of school.indicators) {
          const tr = [...table.matchAll(/<tr\b[^>]*>[\s\S]*?<\/tr>/g)].map(m => m[0]).find(row => text(row).includes(indicator.name));
          assert(tr, school.name + ' missing ' + indicator.name);
          const cells = [...tr.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/g)].map(m => text(m[1]));
          assert(cells.some(cell => Number(cell.replace(/%/g, '')) === indicator.value), school.name + ' changed ' + indicator.name);
        }
        assert.match(visible, /not all|not every|not.*proficiency|different.*meaning/i);
        if (school.indicators.some(i => /Graduation|College and Career/.test(i.name))) assert.match(visible, /2023[–-]24|2023-2024/);
      } else {
        assert(!academic.includes('<table'), school.name + ' ungraded row has fabricated numeric table');
        if (school.officialGrade === 'AW') assert.match(visible, /approved waiver.*AW|AW.*approved waiver/i);
        else assert.match(visible, /not published|no school-level|not.*matched/i);
      }
      if (site === 'civilian-site') sections.set(school.id, academic);
      // PMH adds this existing presentation class around the identical table.
      else assert.equal(academic.replaceAll('\r\n', '\n').replace('class="table-wrap sg-table-scroll"', 'class="sg-table-scroll"'), sections.get(school.id).replaceAll('\r\n', '\n'), school.name + ' academic facts differ between domains');
    }
  });

  await check('Actual client cards and marker popups present state, year, school grade/score or precise missing status', async () => {
    const alRows = schools.filter(s => s.state === 'AL' && s.sector === 'public');
    const alPrivate = schools.find(s => s.state === 'AL' && s.sector === 'private');
    const fl = schools.find(s => s.state === 'FL' && s.grade === 'A');
    for (const site of sites) {
      const client = await clientHarness(site, [...alRows, alPrivate, fl].filter(Boolean));
      client.select('gradeState', 'AL'); client.select('type', 'public');
      const cards = client.allCards(); assert.equal(cards.length, 50);
      assert.deepEqual(sorted(cards.map(c => c.dataset.schoolId)), sorted(alRows.map(s => s.id)));
      assert.equal(client.markers.length, alRows.filter(core.hasCampus).length);
      assert.match(client.sourceText, /Alabama State Department of Education/); assert.match(client.sourceText, /2024[–-]25/);
      assert(client.sourceLinks.includes(snapshot.sourcePage), site + ' live client source panel lacks official Alabama source link');
      for (const card of cards) assertClientGrade(card.textContent, snapshot.schools.find(s => s.id === card.dataset.schoolId));
      for (const marker of client.markers) {
        const school = alRows.find(s => marker.options.title.startsWith(s.name + ':')); assert(school, 'Marker from wrong state/type');
        const expected = rowsByIdentity.get(identity(school));
        assertClientGrade(marker.popup().textContent, expected);
        const label = marker.options.title; assert.match(label, /Alabama/); assert.match(label, /2024[–-]25/);
        if (expected.grade) assert(marker.options.icon.html.includes('>' + expected.grade + '<'));
        else assert(!/sf-grade--[ABCDF]\b/.test(marker.options.icon.html));
      }
      client.select('grade', 'A'); assert.equal(client.allCards().length, 23);
      client.select('gradeState', 'FL'); assert.equal(client.allCards().length, 1);
      assert.match(client.allCards()[0].textContent, /Florida DOE/);
      client.select('gradeState', 'AL'); client.select('grade', 'none'); assert.equal(client.allCards().length, 4);
      assert.deepEqual(client.network, ['/' + assetFolder(site) + '/school-finder-data.json'], 'No geocoder, directions or network requests belong in the rendering test');
    }
  });

  await check('Shared client and search logic are the same on both deploy surfaces', () => {
    for (const file of ['school-finder.js', 'school-finder-core.js']) assert.equal(read('public/school-assets/' + file).replaceAll('\r\n', '\n').replaceAll('/school-assets/', '/assets/'), read('civilian-site/assets/' + file).replaceAll('\r\n', '\n'), file);
  });
}

function assertClientGrade(visible, school) {
  assert(school); assert.match(visible, /Alabama/); assert.match(visible, /2024[–-]25/);
  assert(!/Florida DOE|FL grade not applicable/.test(visible));
  if (school.grade) { assert(new RegExp(`\\b${school.grade}\\b`).test(visible)); assert(visible.includes(school.score + '/100'), school.name + ' client score missing'); }
  else if (school.officialGrade === 'AW') assert.match(visible, /approved waiver.*AW|AW.*approved waiver/i);
  else assert.match(visible, /not published|unavailable|no.*result/i);
}

// Execute the real client with isolated DOM/Leaflet boundaries; all network is stubbed.
async function clientHarness(site, fixtureRows) {
  class Node {
    constructor(tag = 'div') { this.tagName = tag.toUpperCase(); this.children = []; this.attributes = {}; this.dataset = {}; this.listeners = {}; this.className = ''; this.value = ''; this.hidden = false; this.disabled = false; this._text = ''; this.classList = { add: name => { this.className += ' ' + name; } }; }
    set textContent(value) { this._text = String(value); this.children = []; }
    get textContent() { return this._text + this.children.map(n => typeof n === 'string' ? n : n.textContent).join(' '); }
    append(...nodes) { for (const node of nodes) { if (node?.tagName === '#FRAGMENT') this.children.push(...node.children); else this.children.push(node); if (node?.tagName === 'SCRIPT') queueMicrotask(() => node.onload()); } }
    replaceChildren(...nodes) { this.children = []; this._text = ''; this.append(...nodes); }
    setAttribute(name, value) { this.attributes[name] = String(value); }
    addEventListener(name, callback) { this.listeners[name] = callback; }
    querySelectorAll(selector) { const found = []; const walk = n => { for (const child of n.children || []) { if (typeof child === 'string') continue; if (selector === '[data-school-id]' && child.dataset.schoolId) found.push(child); walk(child); } }; walk(this); return found; }
    querySelector() { return new Node('option'); }
    matches(selector) { return selector === 'select' ? this.tagName === 'SELECT' : selector === 'input' ? this.tagName === 'INPUT' : false; }
    remove() {} focus() {} scrollIntoView() {}
  }
  const nodes = new Map(), get = selector => { if (!nodes.has(selector)) nodes.set(selector, new Node()); return nodes.get(selector); };
  const values = { q: '', area: 'all', zip: '', radius: 'exact', level: 'all', type: 'all', program: 'all', grade: 'all', gradeState: 'all', sort: 'name' };
  const fields = Object.fromEntries(Object.keys(values).map(name => [name, '#sf-' + name.replace(/[A-Z]/g, c => '-' + c.toLowerCase())]));
  fields.q = '#sf-query';
  for (const [name, value] of Object.entries(values)) { const node = get(fields[name]); node.value = value; node.tagName = ['q', 'zip'].includes(name) ? 'INPUT' : 'SELECT'; }
  const shortcuts = ['all', 'private', 'christian'].map(value => { const node = new Node('button'); node.dataset.sfTypeChoice = value; return node; });
  const root = new Node(); root.querySelector = get; root.querySelectorAll = selector => selector === '[data-sf-type-choice]' ? shortcuts : [];
  const document = { querySelector: selector => selector === '#school-finder' ? root : null, querySelectorAll: () => [], createElement: tag => new Node(tag), createTextNode: value => { const node = new Node('#text'); node.textContent = value; return node; }, createDocumentFragment: () => new Node('#fragment'), head: new Node('head') };
  const markers = [], network = [], warnings = [];
  const productionData = json(site + '/' + assetFolder(site) + '/school-finder-data.json');
  const map = { setView() { return this; }, addLayer() {}, fitBounds() {}, invalidateSize() {}, remove() {} };
  const clusters = { clearLayers() { markers.length = 0; }, addLayer(marker) { markers.push(marker); }, zoomToShowLayer(marker, callback) { callback(); } };
  const L = { map: () => map, tileLayer: () => ({ addTo() { return this; }, on() {} }), markerClusterGroup: () => clusters, control: { scale: () => ({ addTo() {} }) }, divIcon: options => ({ ...options, createIcon: () => new Node() }), marker: (location, options) => ({ location, options, bindPopup(content) { this.popup = content; return this; }, on() { return this; }, getLatLng() { return location; }, openPopup() {} }), latLngBounds: points => points };
  const context = { ...core, ...address, document, window: { L }, URL, Map, Set, Number, String, Object, Array, Math, JSON, Promise,
    lookupHomeAddress: async () => assert.fail('No address lookup during rendering tests'), lookupDrivingRoute: async () => assert.fail('No route lookup during rendering tests'), clearDrivingRouteCache() {},
    fetch: async url => { network.push(url); assert.equal(url, '/' + assetFolder(site) + '/school-finder-data.json'); return { ok: true, json: async () => ({ schools: fixtureRows, zipCenters: {}, counties: [], sources: productionData.sources, coverageNote: productionData.coverageNote }) }; },
    FormData: class { constructor() { return Object.keys(values).map(name => [name, get(fields[name]).value]); } },
    matchMedia: () => ({ matches: true }), requestAnimationFrame: callback => queueMicrotask(callback), ResizeObserver: class { observe() {} }, setTimeout, clearTimeout, console: { warn: (...args) => warnings.push(args.join(' ')) },
  };
  const code = read(site + '/' + assetFolder(site) + '/school-finder.js').replace(/^import[^\n]*\n/gm, '');
  vm.runInNewContext(code, context, { filename: site + '/school-finder.js', timeout: 1000 });
  for (let i = 0; i < 5; i++) await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(warnings, []); assert.equal(get('[data-sf-app]').hidden, false); assert.equal(get('#sf-map').hidden, false);
  const sourceLinks = [], visit = node => { if (node.href) sourceLinks.push(node.href); for (const child of node.children || []) if (typeof child !== 'string') visit(child); };
  visit(get('[data-sf-sources]'));
  return { markers, network, sourceLinks, sourceText: get('[data-sf-sources]').textContent,
    select(name, value) { get(fields[name]).value = value; get('#sf-filters').listeners.change({ target: get(fields[name]) }); },
    allCards() {
      while (!get('[data-sf-prev]').disabled) get('[data-sf-prev]').listeners.click();
      const cards = [];
      for (let page = 0; page < 20; page++) { cards.push(...get('#sf-results').querySelectorAll('[data-school-id]')); if (get('[data-sf-next]').disabled) return cards; get('[data-sf-next]').listeners.click(); }
      assert.fail('Client pagination did not terminate');
    },
  };
}

const failures = results.filter(r => !r.passed);
console.log(`ALABAMA SCHOOL GRADES: ${results.length - failures.length}/${results.length} check groups passed${sourceOnly ? ' (source-only)' : '; both deploy surfaces'}.`);
if (failures.length) process.exitCode = 1;
