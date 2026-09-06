// Pure search rules shared by the browser and the school-finder checks.
// Coordinates describe campuses or ZIP representative points, never attendance zones.
export const milesBetween = (a, b) => {
  const radians = value => value * Math.PI / 180;
  const dLat = radians(b.lat - a.lat), dLng = radians(b.lng - a.lng);
  const n = Math.sin(dLat / 2) ** 2 + Math.cos(radians(a.lat)) * Math.cos(radians(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 3958.7613 * 2 * Math.atan2(Math.sqrt(n), Math.sqrt(Math.max(0, 1 - n)));
};
export const hasCampus = school => school.virtual !== true && Number.isFinite(school.lat) && Number.isFinite(school.lng);
export const validOrigin = point => point && Number.isFinite(point.lat) && Number.isFinite(point.lng) && point.lat >= 29 && point.lat <= 32 && point.lng >= -89 && point.lng <= -85;
export const searchText = value => String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
export function validateLocation(zip, radius, zipCenters) {
  if (!zip) return '';
  if (!/^\d{5}$/.test(zip)) return 'Enter a five-digit ZIP code, or clear the ZIP field.';
  if (radius !== 'exact' && !zipCenters[zip]) return 'Distance search is unavailable for this ZIP. Choose “Exact ZIP” or try a nearby ZIP code.';
  return '';
}
export function findSchools(schools, filters = {}, zipCenters = {}) {
  if (filters.origin && !validOrigin(filters.origin)) return [];
  const terms = searchText(filters.q).split(' ').filter(Boolean);
  const home = validOrigin(filters.origin) ? filters.origin : null;
  const center = home || (filters.zip && filters.radius !== 'exact' ? zipCenters[filters.zip] : null);
  return schools.flatMap(school => {
    if (terms.length && !terms.every(term => searchText([school.name, ...(school.aliases||[]), school.city, school.county, school.zip, school.religiousOrientation].join(' ')).includes(term))) return [];
    if (filters.area?.startsWith('county:') && school.countyKey !== filters.area.slice(7)) return [];
    if (filters.area?.startsWith('city:') && `${school.state}|${school.city}` !== filters.area.slice(5)) return [];
    if (filters.level==='other' && school.levels.length) return [];
    if (filters.level && !['all','other'].includes(filters.level) && !school.levels.includes(filters.level)) return [];
    if (filters.type === 'private' && school.sector !== 'private') return [];
    if (filters.type === 'christian' && (school.sector !== 'private' || school.christian !== true)) return [];
    if (filters.type === 'nonreligious' && (school.sector !== 'private' || school.religiousCategory !== 'nonreligious')) return [];
    if (filters.type === 'public' && school.sector !== 'public') return [];
    if (filters.type === 'charter' && school.charter !== true) return [];
    if (filters.program === 'magnet' && school.magnet !== true) return [];
    if (filters.program === 'virtual' && school.virtual !== true) return [];
    if (filters.program === 'campus' && !hasCampus(school)) return [];
    if (filters.gradeState && filters.gradeState !== 'all' && school.state !== filters.gradeState) return [];
    if (filters.grade === 'none' && school.grade) return [];
    if (filters.grade && !['all','none'].includes(filters.grade) && school.grade !== filters.grade) return [];
    let distance = null;
    if (home) {
      if (hasCampus(school)) distance = milesBetween(home, school);
      if (filters.radius !== 'all' && (distance === null || !Number.isFinite(Number(filters.radius)) || distance > Number(filters.radius))) return [];
    } else if (filters.zip) {
      if (filters.radius === 'exact') { if (school.zip !== filters.zip) return []; }
      else {
        if (!center || !hasCampus(school)) return [];
        distance = milesBetween(center, school);
        if (filters.radius !== 'all' && distance > Number(filters.radius)) return [];
      }
    }
    if (filters.bounds) {
      if (!hasCampus(school) || school.lat < filters.bounds.south || school.lat > filters.bounds.north || school.lng < filters.bounds.west || school.lng > filters.bounds.east) return [];
    }
    return [{ ...school, distance }];
  }).sort((a,b) => center && filters.sort !== 'name' && a.distance !== b.distance ? (a.distance ?? Infinity)-(b.distance ?? Infinity) : a.name.localeCompare(b.name));
}
