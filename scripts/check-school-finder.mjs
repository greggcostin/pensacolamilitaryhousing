// Local, read-only checks for search rules and source-to-finder data integrity.
// node scripts/check-school-finder.mjs
// Does not regenerate pages, fetch tiles, geocode visitors, or submit forms.
import assert from 'node:assert/strict';
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { milesBetween, hasCampus, searchText, validateLocation, findSchools } from '../civilian-site/assets/school-finder-core.js';
import { withSchoolFinder } from './school-finder-lib.mjs';

const read = file => JSON.parse(readFileSync(file, 'utf8'));
const dataset = read('civilian-site/assets/school-finder-data.json');
const publicSource = read('content/schools/map-public-source.json');
const privateSource = read('content/schools/map-private-source.json');
const programsSource = read('content/schools/map-programs-source.json');
const gradeSource = read('content/schools/school-grades-2026.json');
const zipSource = read('content/schools/map-zip-centers.json');
const affiliationSource = read('content/schools/map-private-affiliations.json');
const resourceSources = ['content/schools/map-private-resources-west.json', 'content/schools/map-private-resources-east.json'].map(read);
const resourceRows = resourceSources.flatMap(s => s.schools || Object.values(s.byNcesId || {}));
const resourceById = new Map(resourceRows.map(s => [s.ncesId || s.id, s]));
const supplemental = resourceSources.flatMap(s => s.supplementalSchools || []);
const supplementalIds = ['official-lighthouse-gulf-breeze', 'official-lighthouse-pensacola', 'official-pensacola-christian-academy'];
const locationRows = existsSync('content/schools/map-private-location-updates.json') ? read('content/schools/map-private-location-updates.json').schools : [];
const locationsById = new Map(locationRows.map(s => [s.ncesId || s.id, s]));
const publicUpdates = read('content/schools/map-public-location-updates.json');
const publicLocationsById = new Map(publicUpdates.schools.map(s => [s.ncesId, s]));
const publicNotesById = new Map([...publicUpdates.schools, ...publicUpdates.notes].map(s => [s.ncesId, s]));
// Independently re-read from the six Census geocoder URLs on 2026-09-06.
// Full returned address matches are preserved in private-geocode-verification.json.
const verifiedCampusPoints = {
  'official-pensacola-christian-academy': [30.466842260457, -87.242165115525],
  'official-lighthouse-pensacola': [30.437612393504, -87.231349058845],
  'official-lighthouse-gulf-breeze': [30.392074144729, -87.018839598384],
  'A1990009': [30.603731117303, -87.843128102298],
  'BB200582': [30.446078120908, -86.577942632794],
  'A1901340': [30.475384409539, -87.306886579114]
};
const affiliationById = new Map(affiliationSource.schools.map(s => [s.ncesId, s]));
const baseline = read('docs/school-map-2026-09-06/baseline-source.json');
const schools = dataset.schools;
const reports = [...new Set(schools.map(s => s.reportUrl).filter(Boolean))].sort();
const raw = [...publicSource.schools, ...privateSource.schools, ...supplemental];
const programs = programsSource.programs;
const identity = row => `${row.sector}|${row.ncesId || row.sourceId || row.id}`;
const stateKey = (district, school) => `${String(district).padStart(2, '0')}-${String(school).padStart(4, '0')}`;
const gradesById = new Map(gradeSource.schools.map(s => [stateKey(s.district, s.num), s]));
const outById = new Map(schools.map(s => [identity(s), s]));
const sourceById = new Map(raw.map(s => [identity(s), s]));
const ids = rows => rows.map(s => s.id).sort();
const url = value => value ? new URL(value).href : null;
const normalize = value => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const resourceFor = source => source.sector === 'private' ? resourceById.get(source.ncesId || source.id) || source : null;
function expectedLocation(source) {
  const resource = resourceFor(source);
  const update = source.sector === 'public' ? publicLocationsById.get(source.ncesId) : resource?.locationOverride || locationsById.get(source.ncesId || source.id);
  const virtual = resource?.virtual === true || source.virtual === true;
  const unresolved = ((resource?.locationUnconfirmed === true || !!resource?.officialAddress) && !update) || (source.sector === 'public' && !!update && (!Number.isFinite(update.lat) || !Number.isFinite(update.lng)));
  const address = (virtual ? resource?.officialMailingAddress : null) || update || (unresolved ? resource.currentAddress || resource.officialAddress : null) || source;
  return {
    virtual: virtual ? true : source.virtual,
    address: address.address || '', city: address.city, zip: String(address.zip).slice(0, 5),
    lat: virtual || unresolved ? null : update ? update.lat : source.lat ?? null,
    lng: virtual || unresolved ? null : update ? update.lng : source.lng ?? null,
    update, unresolved
  };
}
const results = [];
function check(name, fn) {
  try { fn(); results.push({ name, passed: true }); console.log('PASS ' + name); }
  catch (error) { results.push({ name, passed: false, error: error.message }); console.error('FAIL ' + name + ': ' + error.message); }
}
const approx = (value, expected, tolerance) => assert(Math.abs(value - expected) <= tolerance, `${value} differs from ${expected} by more than ${tolerance}`);
const fixture = (id, values = {}) => ({ id, name: id, county: 'Escambia', countyKey: 'FL|Escambia', city: 'Pensacola', state: 'FL', zip: '32503', lat: 0, lng: 0, levels: ['elementary'], sector: 'public', charter: false, magnet: null, virtual: false, grade: null, ...values });
const synthetic = [
  fixture('Alpha Academy', { lat: 0.01, grade: 'A', charter: true, magnet: true, levels: ['elementary', 'middle', 'combined'] }),
  fixture('Beta Academy', { lat: 0.02, grade: 'B', magnet: true }),
  fixture('Cross ZIP', { lat: 0.03, zip: '32504', grade: 'A' }),
  fixture('Far Campus', { lat: 0.2, grade: 'A' }),
  fixture('Private School', { lat: 0.015, sector: 'private', levels: ['elementary', 'middle', 'high', 'combined'] }),
  fixture('Other County', { lat: 0.04, county: 'Santa Rosa', countyKey: 'FL|Santa Rosa', city: 'Gulf Breeze', grade: 'A' }),
  fixture('Virtual School', { lat: 0, lng: 0, virtual: true, levels: ['high'] }),
  fixture('Unknown Point', { lat: null, lng: null, levels: [] }),
  fixture('Leading Zero ZIP', { zip: '01001', lat: null, lng: null })
];
const centers = { '32503': { lat: 0, lng: 0 } };

check('Haversine: zero, known equatorial/long-distance values, symmetry and antipodes', () => {
  assert.equal(milesBetween({ lat: 0, lng: 0 }, { lat: 0, lng: 0 }), 0);
  approx(milesBetween({ lat: 0, lng: 0 }, { lat: 0, lng: 1 }), 69.09342, 0.001);
  const london = { lat: 51.5074, lng: -0.1278 }, nyc = { lat: 40.7128, lng: -74.006 };
  approx(milesBetween(london, nyc), 3461.18, 0.1);
  approx(milesBetween(london, nyc), milesBetween(nyc, london), 1e-10);
  approx(milesBetween({ lat: 0, lng: 0 }, { lat: 0, lng: 180 }), 12436.815, 0.01);
});
check('Exact ZIP keeps matching unmapped/virtual records and requires no ZIP center', () => {
  const exact = findSchools(synthetic, { zip: '32503', radius: 'exact' }, {});
  assert.deepEqual(ids(exact), ids(synthetic.filter(s => s.zip === '32503')));
  assert(exact.every(s => s.distance === null));
  assert.deepEqual(ids(findSchools(synthetic, { zip: '01001', radius: 'exact' }, {})), ['Leading Zero ZIP']);
  assert.equal(validateLocation('01001', 'exact', {}), '');
});
check('Radius search uses distance across ZIP boundaries and sorts nearest first', () => {
  const near = findSchools(synthetic, { zip: '32503', radius: '5' }, centers);
  assert.deepEqual(near.map(s => s.id), ['Alpha Academy', 'Private School', 'Beta Academy', 'Cross ZIP', 'Other County']);
  assert(near.every((s, i) => s.distance <= 5 && (!i || s.distance >= near[i - 1].distance)));
  const boundary = milesBetween(centers['32503'], synthetic[0]);
  assert.deepEqual(ids(findSchools(synthetic, { zip: '32503', radius: String(boundary) }, centers)), ['Alpha Academy']);
});
check('Invalid and unknown ZIPs cannot silently run an unsupported radius search', () => {
  for (const zip of ['3250', '325030', '325O3', 'abcde', '32-03', ' 32503']) assert(validateLocation(zip, '10', centers));
  assert.equal(validateLocation('', '10', centers), '');
  assert.equal(validateLocation('32503', '10', centers), '');
  assert(validateLocation('99999', '10', centers));
  assert.equal(validateLocation('99999', 'exact', centers), '');
  assert.deepEqual(findSchools(synthetic, { zip: '99999', radius: '10' }, centers), []);
});
check('Text, area, ZIP/radius, level, type, program and grade combine with AND', () => {
  const all = { q: 'academy pensacola', area: 'county:FL|Escambia', zip: '32503', radius: '5', level: 'middle', type: 'charter', program: 'magnet', grade: 'A' };
  assert.deepEqual(ids(findSchools(synthetic, all, centers)), ['Alpha Academy']);
  for (const [key, value] of [['q', 'not found'], ['area', 'county:FL|Santa Rosa'], ['level', 'high'], ['type', 'private'], ['program', 'virtual'], ['grade', 'B']]) assert.deepEqual(findSchools(synthetic, { ...all, [key]: value }, centers), [], key);
  assert.deepEqual(ids(findSchools(synthetic, { area: 'city:FL|Gulf Breeze' })), ['Other County']);
});
check('Multilevel schools match each reported level; unknown spans stay in Other', () => {
  for (const level of ['elementary', 'middle', 'combined']) assert(ids(findSchools(synthetic, { level })).includes('Alpha Academy'));
  assert(!ids(findSchools(synthetic, { level: 'high' })).includes('Alpha Academy'));
  for (const level of ['elementary', 'middle', 'high', 'combined']) assert(ids(findSchools(synthetic, { level })).includes('Private School'));
  assert.deepEqual(ids(findSchools(synthetic, { level: 'other' })), ['Unknown Point']);
});
check('Charter/magnet flags require confirmed true; private/public are distinct', () => {
  assert.deepEqual(ids(findSchools(synthetic, { type: 'charter' })), ['Alpha Academy']);
  assert.deepEqual(ids(findSchools(synthetic, { type: 'private' })), ['Private School']);
  assert.deepEqual(ids(findSchools(synthetic, { program: 'magnet' })), ['Alpha Academy', 'Beta Academy']);
  assert(findSchools(synthetic, { type: 'public' }).every(s => s.sector === 'public'));
  assert.deepEqual(findSchools(synthetic, { type: 'private', grade: 'A' }), []);
});
check('Christian and nonreligious filters require explicit sourced categories, never names', () => {
  const choices = [
    fixture('Christian in name only', { sector: 'private', christian: null, religiousCategory: 'unknown' }),
    fixture('Confirmed faith school', { sector: 'private', christian: true, religiousCategory: 'christian', religiousOrientation: 'Roman Catholic' }),
    fixture('Confirmed nonsectarian', { sector: 'private', christian: false, religiousCategory: 'nonreligious', religiousOrientation: 'Nonsectarian' }),
    fixture('Unknown Christian status', { sector: 'private', christian: false, religiousCategory: 'unknown' }),
    fixture('Public Faith Label', { sector: 'public', christian: true, religiousCategory: 'nonreligious' })
  ];
  assert.deepEqual(ids(findSchools(choices, { type: 'christian' })), ['Confirmed faith school']);
  assert.deepEqual(ids(findSchools(choices, { type: 'nonreligious' })), ['Confirmed nonsectarian']);
  assert.deepEqual(ids(findSchools(choices, { type: 'christian', q: 'catholic', level: 'elementary' })), ['Confirmed faith school']);
  assert.deepEqual(findSchools(choices, { type: 'christian', grade: 'A' }), []);
  assert.deepEqual(findSchools(choices, { type: 'nonreligious', q: 'unknown' }), []);
});
check('Virtual and missing/non-numeric coordinates stay list-only', () => {
  for (const values of [{ lat: null }, { lng: null }, { lat: NaN }, { lng: '0' }, { virtual: true }]) assert.equal(hasCampus(fixture('Missing', values)), false);
  const mapped = findSchools(synthetic, { program: 'campus' });
  assert(!mapped.some(s => ['Virtual School', 'Unknown Point', 'Leading Zero ZIP'].includes(s.id)));
  assert.deepEqual(ids(findSchools(synthetic, { program: 'virtual' })), ['Virtual School']);
  assert(findSchools(synthetic).some(s => s.id === 'Unknown Point'));
});
check('Map bounds are inclusive and intersect existing filters', () => {
  const bounds = { south: 0.01, north: 0.02, west: 0, east: 0 };
  assert.deepEqual(ids(findSchools(synthetic, { bounds })), ['Alpha Academy', 'Beta Academy', 'Private School']);
  assert.deepEqual(ids(findSchools(synthetic, { bounds, grade: 'A', zip: '32503', radius: '5' }, centers)), ['Alpha Academy']);
});
check('Search normalizes accents/punctuation, respects every term, and does not mutate input', () => {
  assert.equal(searchText('École, Gulf-Breeze!'), 'ecole gulf breeze');
  const original = JSON.stringify(synthetic);
  assert.deepEqual(ids(findSchools(synthetic, { q: 'ALPHA, ACADEMY' })), ['Alpha Academy']);
  assert.deepEqual(findSchools(synthetic, { q: 'alpha nonexistent' }), []);
  findSchools(synthetic, { zip: '32503', radius: '50' }, centers);
  assert.equal(JSON.stringify(synthetic), original);
  assert.deepEqual(findSchools(synthetic).map(s => s.name), synthetic.map(s => s.name).sort((a, b) => a.localeCompare(b)));
});

check('The original 208 public and 63 private NCES source records remain immutable', () => {
  for (const [file, hash] of [
    ['content/schools/map-public-source.json', '295426f59280b40f8e46becc69118ab9eb47cd5fc47d640f06036be41cd78e93'],
    ['content/schools/map-private-source.json', '4c7aefb37696bf6ba9ac813d56d776f5ecd7d46a290d55c87016ec5e29bc7df3']
  ]) assert.equal(createHash('sha256').update(readFileSync(file)).digest('hex'), hash, file + ': update the documented source revision explicitly, never silently alter directory records');
});
check('Exactly three verified supplemental campus IDs extend the 271 directory records', () => {
  assert.deepEqual(supplemental.map(s => s.id).sort(), supplementalIds);
  assert.deepEqual(schools.filter(s => s.sourceKind === 'official-school').map(s => s.sourceId).sort(), supplementalIds);
  assert.equal(schools.filter(s => s.sourceKind === 'nces').length, 271);
  for (const source of supplemental) {
    const school = outById.get(identity(source));
    assert.equal(source.ncesId, null, source.name);
    assert.equal(school.ncesId, null, source.name);
    assert.equal(school.sourceId, source.id, source.name);
    assert.equal(school.sourceKind, 'official-school', source.name);
    assert.equal(source.sourceYear, '2026', source.name);
    assert.equal(source.sector, 'private', source.name);
    assert(source.evidence && source.gradeSourceUrl && source.affiliationSourceUrl && source.addressSourceUrl, source.name);
    assert(['www.pensacolachristianacademy.com', 'lighthousepca.com'].includes(new URL(source.sourceUrl).hostname), source.name);
    assert.equal(school.grade, null, source.name);
    assert.equal(school.gradeYear, null, source.name);
    assert(school.reportUrl?.startsWith("/schools/"),source.name);
  }
});
check('Published counts match raw plus documented supplemental records without duplicate or omitted identities', () => {
  assert.equal(publicSource.schools.length, 208);
  assert.equal(privateSource.schools.length, 63);
  assert.equal(schools.length, 274);
  assert.equal(schools.filter(s => s.sector === 'public').length, 208);
  assert.equal(schools.filter(s => s.sector === 'private').length, 66);
  assert.equal(sourceById.size, raw.length);
  assert.equal(outById.size, schools.length);
  assert.equal(new Set(schools.map(s => s.id)).size, schools.length);
  assert.deepEqual([...outById.keys()].sort(), [...sourceById.keys()].sort());
  const counts = Object.fromEntries(dataset.counties.map(c => [c.key, schools.filter(s => s.countyKey === c.key).length]));
  assert.deepEqual(counts, { 'FL|Escambia': 106, 'FL|Santa Rosa': 46, 'FL|Okaloosa': 62, 'AL|Baldwin': 60 });
  const expected = raw.map(expectedLocation);
  assert.equal(schools.filter(hasCampus).length, expected.filter(s => s.virtual !== true && Number.isFinite(s.lat) && Number.isFinite(s.lng)).length);
  assert.equal(schools.filter(s => s.virtual === true).length, 10);
  assert(dataset.coverageNote.includes('274') && dataset.coverageNote.includes('119'));
});
check('School locations, identities, reported levels and source URLs survive the build', () => {
  const fips = { '12033': 'FL|Escambia', '12113': 'FL|Santa Rosa', '12091': 'FL|Okaloosa', '01003': 'AL|Baldwin' };
  for (const school of schools) {
    const source = sourceById.get(identity(school));
    const label = school.name;
    const expected = expectedLocation(source);
    assert.equal(school.state, source.state, label);
    assert.equal(school.countyKey, fips[source.countyFips], label);
    assert.equal(school.districtId, source.districtId || null, label);
    assert.equal(school.schoolId, source.schoolId || null, label);
    assert.equal(school.sourceId, source.id, label);
    assert.equal(school.sourceKind, source.ncesId ? 'nces' : 'official-school', label);
    assert.equal(school.zip, expected.zip, label);
    assert.equal(school.address, expected.address, label);
    assert.equal(normalize(school.city), normalize(expected.city), label);
    assert.deepEqual(school.levels, source.levels, label);
    assert.equal(school.gradeSpan, source.lowGrade && source.highGrade ? `${source.lowGrade}–${source.highGrade}` : '', label + ': preserve the reported NCES span');
    assert.equal(school.virtual, expected.virtual, label);
    assert.equal(school.lat, expected.lat, label);
    assert.equal(school.lng, expected.lng, label);
    assert.equal(school.sourceUrl, new URL(source.sourceUrl).href, label);
    assert.equal(school.sourceYear, source.sourceYear || (source.sector === 'private' ? privateSource.sourceYear : publicSource.sourceYear), label);
    if (source.ncesId) assert.equal(new URL(school.sourceUrl).hostname, 'nces.ed.gov', label);
    assert((school.lat === null && school.lng === null) || (Number.isFinite(school.lat) && Number.isFinite(school.lng)), label);
    if (hasCampus(school)) assert(school.lat >= 29 && school.lat <= 32 && school.lng >= -89 && school.lng <= -85, label);
    for (const link of [school.website, school.admissionsUrl, school.reportUrl, school.programSourceUrl, school.resourceSourceUrl, school.affiliationSourceUrl, school.locationSourceUrl].filter(Boolean)) assert(link.startsWith('/') || /^https?:\/\//.test(link), label);
  }
});
check('Campus updates require documented official addresses and finite, sourced coordinates', () => {
  assert.equal(locationsById.size, locationRows.length);
  assert.deepEqual([...locationsById.keys()].sort(), Object.keys(verifiedCampusPoints).sort());
  for (const location of locationRows) {
    const key = location.ncesId || location.id;
    assert.deepEqual([location.lat, location.lng], verifiedCampusPoints[key], key + ': coordinates differ from the independently checked Census match');
    const source = raw.find(s => (s.ncesId || s.id) === key);
    assert(source && source.sector === 'private', 'Unmatched location update ' + key);
    const resource = resourceFor(source);
    const documented = resource.currentAddress || resource.officialAddress || (supplementalIds.includes(key) ? source : null);
    assert(documented, 'A campus update needs a verified resource address: ' + key);
    assert.equal(normalize(location.city), normalize(documented.city), key);
    assert.equal(location.state, documented.state, key);
    assert.equal(location.zip, documented.zip, key);
    assert.equal(location.address.match(/^\d+/)?.[0], documented.address.match(/^\d+/)?.[0], key + ': street number');
    assert(Number.isFinite(location.lat) && Number.isFinite(location.lng), key);
    assert(location.lat >= 29 && location.lat <= 32 && location.lng >= -89 && location.lng <= -85, key);
    const official = new URL(location.sourceUrl);
    assert([resource.sourceUrl, resource.website, resource.addressSourceUrl, ...(resource.additionalSourceUrls || [])].filter(Boolean).some(u => new URL(u).hostname === official.hostname), key + ': unrelated official address source');
    if (location.geocoderUrl) {
      const geocoder = new URL(location.geocoderUrl);
      assert.equal(geocoder.hostname, 'geocoding.geo.census.gov', key);
      assert.equal(geocoder.pathname, '/geocoder/locations/onelineaddress', key);
      assert.equal(geocoder.searchParams.get('benchmark'), 'Public_AR_Current', key);
      assert(geocoder.searchParams.get('address')?.includes(location.zip), key);
      assert(location.matchedAddress && location.tigerLine?.tigerLineId && location.benchmark?.benchmarkName === 'Public_AR_Current', key + ': missing Census match evidence');
    } else assert(location.evidence, key + ': exact official coordinates require evidence');
    const school = outById.get(identity(source));
    assert.equal(school.locationSourceUrl, url(location.geocoderUrl || location.sourceUrl), key);
  }
  for (const key of ['A1990009', 'BB200582']) {
    const resource = resourceById.get(key);
    assert(resource?.locationUnconfirmed && resource.currentAddress, key);
    const school = outById.get('private|' + key);
    if (!locationsById.has(key) && !resource.locationOverride) {
      assert.equal(hasCampus(school), false, key + ': old directory pin must not represent a confirmed new address');
      assert.equal(school.address, resource.currentAddress.address, key);
      assert.equal(normalize(school.city), normalize(resource.currentAddress.city), key);
    }
  }
});
check('PSC current campus override retains its NCES identity and the verified Census address match', () => {
  assert.deepEqual([...publicLocationsById.keys()], ['120051010638']);
  assert.equal(publicUpdates.checkedAt, '2026-09-06');
  const update = publicLocationsById.get('120051010638');
  const source = publicSource.schools.find(s => s.ncesId === update.ncesId);
  const school = outById.get('public|' + update.ncesId);
  assert.equal(source.address, '5555 W HIGHWAY 98');
  assert.deepEqual([source.lat, source.lng], [30.396574, -87.285216]);
  assert.equal(update.sourceUrl, 'https://charteracademy.pensacolastate.edu/application-process/');
  assert.equal(update.address, '1000 College Boulevard, Building 11');
  assert.equal(update.city, 'Pensacola');
  assert.equal(update.state, 'FL');
  assert.equal(update.zip, '32504');
  assert.equal(update.checkedAt, '2026-09-06');
  assert.equal(update.geocoderCheckedAt, '2026-09-06');
  assert.deepEqual([update.lat, update.lng], [30.480091553217, -87.203352723374]);
  assert.deepEqual([school.lat, school.lng], [30.480091553217, -87.203352723374]);
  assert.equal(school.address, update.address);
  assert.equal(school.zip, update.zip);
  const geocoder = new URL(update.geocoderUrl);
  assert.equal(geocoder.hostname, 'geocoding.geo.census.gov');
  assert.equal(geocoder.pathname, '/geocoder/locations/onelineaddress');
  assert.equal(geocoder.searchParams.get('address'), '1000 College Boulevard Pensacola FL 32504');
  assert.equal(geocoder.searchParams.get('benchmark'), 'Public_AR_Current');
  assert.equal(update.matchedAddress, '1000 COLLEGE BLVD, PENSACOLA, FL, 32504');
  assert.equal(update.tigerLine.tigerLineId, '93269253');
  assert.equal(update.benchmark.benchmarkName, 'Public_AR_Current');
  assert.equal(update.addressComponents.zip, update.zip);
  assert.equal(school.addressSourceUrl, url(update.sourceUrl));
  assert.equal(school.locationSourceUrl, url(update.geocoderUrl));
  for (const field of ['ncesId', 'sourceYear', 'districtId', 'schoolId', 'virtual']) assert.equal(school[field], source[field], field);
  assert.equal(school.sourceId, source.id);
  assert.equal(school.sourceUrl, source.sourceUrl);
  assert.equal(school.website, url(source.website));
  assert.equal(school.gradeSpan, '09–12');
  assert.deepEqual(school.levels, ['high']);
  assert(/approximate Census street-address point/.test(school.campusNote));
  assert(milesBetween(source, school) > 5, 'Moved campus must not retain the former point');
  const unknown = expectedLocation(source);
  const saved = publicLocationsById.get(source.ncesId);
  try {
    publicLocationsById.set(source.ncesId, { ...saved, lat: null, lng: null });
    const unresolved = expectedLocation(source);
    assert.equal(unresolved.lat, null);
    assert.equal(unresolved.lng, null);
    assert.equal(unresolved.address, saved.address);
  } finally { publicLocationsById.set(source.ncesId, saved); }
  assert.equal(unknown.lat, school.lat);
});
check('Current public program notes are sourced while historical spans and virtual mapping stay intact', () => {
  assert.deepEqual([...publicNotesById.keys()].sort(), ['120051000815', '120051010638', '120165007684']);
  for (const [ncesId, note] of publicNotesById) {
    const school = outById.get('public|' + ncesId);
    assert(school && note.reason && note.evidence && note.campusNote);
    assert.equal(note.checkedAt, '2026-09-06');
    assert.equal(school.campusNote, note.campusNote);
    assert.equal(school.resourceSourceUrl, url(note.sourceUrl));
    assert.equal(school.resourcesCheckedAt, note.checkedAt);
  }
  const warrington = outById.get('public|120051000815');
  assert.equal(warrington.gradeSpan, '06–08');
  assert.deepEqual(warrington.levels, ['middle']);
  assert(warrington.campusNote.includes('grades 6 through 9'));
  assert.equal(warrington.resourceSourceUrl, 'https://www.warringtonprep.org/');
  const santaRosaOnline = outById.get('public|120165007684');
  assert.equal(santaRosaOnline.gradeSpan, 'KG–12');
  assert(santaRosaOnline.campusNote.includes('grades 3 through 12'));
  assert.equal(santaRosaOnline.resourceSourceUrl, 'https://www.santarosaschools.org/live_feeds/12620247');
  assert.equal(santaRosaOnline.virtual, true);
  assert.equal(santaRosaOnline.lat, null);
  assert.equal(santaRosaOnline.lng, null);
  assert.equal(hasCampus(santaRosaOnline), false);
  for (const school of [warrington, santaRosaOnline]) {
    const source = publicSource.schools.find(s => s.ncesId === school.ncesId);
    assert.equal(school.address, source.address);
    assert.equal(school.sourceYear, source.sourceYear);
    assert.equal(school.sourceUrl, source.sourceUrl);
    const grade = gradesById.get(stateKey(source.districtId, source.schoolId));
    assert.equal(school.gradeStatus, grade?.g2026 || null);
  }
});
check('Official current school names retain NCES identities and searchable historical aliases', () => {
  const renamed = resourceRows.filter(r => r.currentName);
  assert.deepEqual(renamed.map(r => r.ncesId), ['00266264']);
  for (const resource of renamed) {
    const source = privateSource.schools.find(s => s.ncesId === resource.ncesId);
    const school = outById.get('private|' + resource.ncesId);
    assert.equal(school.name, resource.currentName);
    assert.deepEqual(school.aliases, resource.aliases);
    assert(resource.aliases.some(name => normalize(name) === normalize(source.name)));
    assert(findSchools(schools, { q: source.name }).some(s => s.ncesId === source.ncesId));
    assert(findSchools(schools, { q: resource.currentName }).some(s => s.ncesId === source.ncesId));
    assert.equal(school.sourceId, source.id);
  }
});
check('Hillcrest official virtual status overrides its dated directory mailing point only', () => {
  const source = privateSource.schools.find(s => s.ncesId === 'A2392082');
  const resource = resourceById.get('A2392082');
  const school = outById.get('private|A2392082');
  assert(source && resource?.virtual === true && resource.virtualSourceUrl && resource.evidence);
  assert.equal(school.virtual, true);
  assert.equal(school.lat, null);
  assert.equal(school.lng, null);
  assert.equal(hasCampus(school), false);
  assert(school.campusNote && /virtual|mail|administration/i.test(school.campusNote));
  assert(!findSchools(schools, { program: 'campus' }).some(s => s.ncesId === source.ncesId));
  assert(!findSchools(schools, { zip: '32504', radius: '50' }, dataset.zipCenters).some(s => s.ncesId === source.ncesId));
  assert(findSchools(schools, { type: 'private', program: 'virtual' }).some(s => s.ncesId === source.ncesId));
});
check('All private affiliation flags match exact NCES or explicit official-school evidence', () => {
  assert.equal(affiliationSource.schools.length, 63);
  assert.equal(affiliationById.size, 63);
  assert.deepEqual([...affiliationById.keys()].sort(), privateSource.schools.map(s => s.ncesId).sort());
  assert.equal(affiliationSource.schools.filter(s => s.christian === true).length, 44);
  assert.equal(affiliationSource.schools.filter(s => s.christian === false).length, 17);
  assert.equal(affiliationSource.schools.filter(s => s.christian === null).length, 2);
  for (const school of schools) {
    if (school.sector !== 'private') { assert.equal(school.christian, null, school.name); continue; }
    const source = sourceById.get(identity(school));
    const resource = resourceFor(source);
    const affiliation = resource.affiliationOverride || affiliationById.get(source.ncesId) || source;
    const orientation = affiliation.religiousOrientation || affiliation.religiousAffiliation || null;
    assert.equal(school.christian, affiliation.christian, school.name);
    assert.equal(school.religiousOrientation, orientation, school.name);
    assert.equal(school.religiousCategory, affiliation.christian === true ? 'christian' : orientation === 'Nonsectarian' ? 'nonreligious' : 'unknown', school.name);
    assert.equal(school.affiliationSourceUrl, url(affiliation.affiliationSourceUrl || affiliation.sourceUrl), school.name);
    assert.equal(school.affiliationSourceYear, affiliation.sourceYear || null, school.name);
    if (source.ncesId && !resource.affiliationOverride) {
      assert.equal(new URL(affiliation.sourceUrl).hostname, 'nces.ed.gov', school.name);
      assert.equal(affiliation.sourceField, 'Affiliation', school.name);
    }
  }
  assert(findSchools(schools, { type: 'christian' }).every(s => s.sector === 'private' && s.christian === true));
  assert(findSchools(schools, { type: 'nonreligious' }).every(s => s.sector === 'private' && s.christian === false && s.religiousOrientation === 'Nonsectarian'));
});
check('Verified admissions, website and campus notes retain resource provenance without invented fallbacks', () => {
  assert.equal(resourceById.size, 63);
  assert.deepEqual([...resourceById.keys()].sort(), privateSource.schools.map(s => s.ncesId).sort());
  for (const school of schools.filter(s => s.sector === 'private')) {
    const source = sourceById.get(identity(school));
    const resource = resourceFor(source);
    const location = expectedLocation(source).update;
    assert(resource.evidence && (resource.checkedAt || resource.checked), school.name);
    assert.equal(school.website, url(resource.website), school.name);
    assert.equal(school.admissionsUrl, url(resource.admissionsUrl), school.name);
    assert.equal(school.resourceSourceUrl, url(resource.sourceUrl), school.name);
    assert.equal(school.resourcesCheckedAt, resource.checkedAt || resource.checked, school.name);
    if (location && source.ncesId && resource.virtual !== true) {
      assert(school.campusNote && /current school-published address/i.test(school.campusNote) && /approximate Census address point/i.test(school.campusNote), school.name);
      assert(/confirm.*campus/i.test(school.campusNote), school.name);
      assert(!/obtain a verified geocode before mapping|dated directory lists/i.test(school.campusNote), school.name + ': resolved geocode should not carry a stale warning');
    } else assert.equal(school.campusNote, resource.campusNote || resource.locationNote || location?.locationNote || null, school.name);
  }
  assert.equal(outById.get('private|A0102236').website, null, 'Retired Good Shepherd domain must not be reused');
  assert.equal(outById.get('private|A2192006').website, null, 'Unknown UPHC official URL stays null');
  assert.equal(outById.get('private|A2192006').admissionsUrl, null);
  assert.equal(outById.get('private|A1901142').admissionsUrl, null, 'Historical handbook is not current admissions');
});
check('All 120 Florida district/school IDs join exactly once; 119 letters are source-exact', () => {
  assert.equal(gradesById.size, 120);
  let letters = 0;
  for (const [key, grade] of gradesById) {
    const matches = schools.filter(s => s.state === 'FL' && s.sector === 'public' && stateKey(s.districtId, s.schoolId) === key);
    assert.equal(matches.length, 1, key + ' ' + grade.name);
    const expected = /^[ABCDF]$/.test(grade.g2026) ? grade.g2026 : null;
    assert.equal(matches[0].grade, expected, grade.name);
    assert.equal(matches[0].gradeYear, '2025–26', grade.name);
    assert.equal(matches[0].charter, grade.charter === 'YES', grade.name);
    if (expected) letters++;
  }
  assert.equal(letters, 119);
  assert.equal(schools.filter(s => s.state === 'FL' && s.grade !== null).length, letters);
});
check('No private or unmatched school receives an invented grade; state filters stay distinct', () => {
  for (const school of schools) {
    const grade = school.state === 'FL' && school.sector === 'public' ? gradesById.get(stateKey(school.districtId, school.schoolId)) : null;
    if (school.state === 'AL' && school.sector === 'public') { assert.deepEqual(school.alabamaAccountability, read('content/schools/alabama-grades-2025.json').schools.find(s => s.ncesId === school.ncesId)); assert.equal(school.grade, school.alabamaAccountability.grade); assert.equal(school.gradeYear, '2024–25'); }
    else if (!grade) { assert.equal(school.grade, null, school.name); assert.equal(school.gradeYear, null, school.name); assert(school.reportUrl?.startsWith("/schools/"),school.name); }
    assert(school.grade === null || /^[ABCDF]$/.test(school.grade), school.name);
  }
  for (const grade of ['A', 'B', 'C', 'D', 'F']) assert(findSchools(schools, { grade, gradeState:'FL' }).every(s => s.state === 'FL' && s.sector === 'public' && s.grade === grade));
  assert.equal(findSchools(schools, { grade: 'none' }).length, 109);
  assert.deepEqual(findSchools(schools, { type: 'private', grade: 'A' }), []);
  assert.equal(findSchools(schools, { area: 'county:AL|Baldwin', grade: 'A' }).length, 23);
  assert.deepEqual(findSchools(schools, { area: 'county:AL|Baldwin', gradeState:'FL' }), []);
});
check('Five magnet matches retain exact official IDs, program scope and source provenance', () => {
  assert.equal(programs.length, 5);
  const programById = new Map(programs.map(s => [stateKey(s.districtId, s.schoolId), s]));
  assert.equal(programById.size, programs.length);
  assert.equal(schools.filter(s => s.magnet === true).length, 5);
  for (const school of schools) {
    const source = sourceById.get(identity(school));
    const program = school.state === 'FL' ? programById.get(stateKey(school.districtId, school.schoolId)) : null;
    assert.equal(school.magnet, program?.magnet === true ? true : source.magnet, school.name);
    if (!program) continue;
    assert.equal(school.ncesId, program.ncesId, school.name);
    assert.equal(school.programSourceUrl, new URL(program.sourceUrl).href, school.name);
    assert.equal(school.programSourceYear, program.sourceYear || null, school.name);
    assert.equal(school.magnetType, program.magnetType, school.name);
    assert.equal(school.programName, program.programName || null, school.name);
  }
  assert.equal(schools.filter(s => s.charter === true).length, 13);
});
check('All 82 original school-report destinations remain in HTML and finder results', () => {
  const before = baseline.files['civilian-site/schools.html'];
  const original = [...new Set([...before.matchAll(/href="(\/schools\/[^"#?]+)"/g)].map(m => m[1]))].sort();
  const hub = readFileSync('civilian-site/schools.html', 'utf8');
  assert.equal(original.length, 82);
  assert(original.every(url=>reports.includes(url))); assert.equal(reports.length,271);
  for (const url of original) { assert(hub.includes(`href="${url}"`), url); assert(existsSync(`civilian-site${url}.html`), url); }
});
check('All 64 ZIP centers exactly match dated Census source records', () => {
  assert.equal(zipSource.length, 64);
  assert.equal(new Set(zipSource.map(s => s.zip)).size, 64);
  assert.deepEqual(Object.keys(dataset.zipCenters).sort(), zipSource.map(s => s.zip).sort());
  for (const zip of zipSource) {
    assert(/^\d{5}$/.test(zip.zip));
    assert.equal(Number(zip.sourceYear), 2025);
    assert.equal(new URL(zip.sourceUrl).hostname, 'www2.census.gov');
    assert.deepEqual(dataset.zipCenters[zip.zip], { lat: zip.lat, lng: zip.lng });
    assert(Number.isFinite(zip.lat) && Number.isFinite(zip.lng));
  }
});
check('Dataset provenance identifies official sources and distinct directory/grade vintages', () => {
  assert.equal(dataset.version, 1);
  assert(Number.isFinite(Date.parse(dataset.builtAt)));
  assert.equal(dataset.sources.length, 8);
  const externalSources = dataset.sources.filter(s => /^https?:/.test(s.url));
  assert.equal(externalSources.length, 7);
  const domains = new Set(externalSources.map(s => new URL(s.url).hostname));
  for (const domain of ['nces.ed.gov', 'www.fldoe.org', 'www.census.gov', 'web09.fldoe.org']) assert(domains.has(domain), domain);
  for (const year of ['2024–25', '2023–24', '2025–26', '2025']) assert(dataset.sources.some(s => s.year === year), year);
  assert(dataset.sources.some(s => s.year === 'retrieved September 2026'));
  assert(dataset.sources.some(s => s.url === '/schools#private-school-resources' && /verified September 2026/.test(s.year)));
  assert(dataset.sources.some(s => /religious affiliations/i.test(s.name) && s.year === '2023–24'));
  assert(dataset.coverageNote.includes('Federal directory years and state accountability years differ.'));
});
check('School-finder integration is idempotent and scoped to the hub', () => {
  const hub = readFileSync('civilian-site/schools.html', 'utf8');
  const applied = withSchoolFinder(hub, '/schools');
  assert.equal(withSchoolFinder(applied, '/schools'), applied);
  assert.equal((applied.match(/id="school-finder"/g) || []).length, 1);
  assert.equal((applied.match(/src="\/assets\/school-finder.js\?v=[a-f0-9]+"/g) || []).length, 1);
  assert.equal(withSchoolFinder('<html>Unrelated school report</html>', '/schools/a-k-suter-elementary-school'), '<html>Unrelated school report</html>');
  assert(applied.includes('A nearby school does not establish attendance eligibility.'));
  assert(applied.includes('Markers show recorded locations, not attendance boundaries.'));
  assert(applied.includes('<noscript>') && applied.includes('NCES public school directory'));
});

const failures = results.filter(r => !r.passed);
const report = { checkedAt: new Date().toISOString(), datasetBuiltAt: dataset.builtAt, datasetSha256: createHash('sha256').update(readFileSync('civilian-site/assets/school-finder-data.json')).digest('hex'), counts: { total: schools.length, public: schools.filter(s => s.sector === 'public').length, private: schools.filter(s => s.sector === 'private').length, ncesPrivate: privateSource.schools.length, officialSupplemental: supplemental.length, mapped: schools.filter(hasCampus).length, virtual: schools.filter(s => s.virtual === true).length, christian: schools.filter(s => s.christian === true).length, privateLocationUpdates: locationRows.length, floridaIds: gradesById.size, letterGrades: schools.filter(s => s.grade).length, reports: reports.length, zipCenters: zipSource.length }, checks: results.length, failures: failures.length, results };
mkdirSync('docs/school-map-2026-09-06', { recursive: true });
writeFileSync('docs/school-map-2026-09-06/finder-checks.json', JSON.stringify(report, null, 2) + '\n');
console.log(`SCHOOL FINDER: ${results.length - failures.length}/${results.length} check groups passed; ${schools.length} records, ${reports.length} preserved reports.`);
if (failures.length) process.exitCode = 1;
