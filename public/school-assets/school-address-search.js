// Explicit-submit Census JSONP lookup. Addresses stay out of page history,
// storage, analytics and inquiry payloads; only the provider request contains them.
export const CENSUS_GEOCODER = 'https://geocoding.geo.census.gov/geocoder/geographies/onelineaddress';
const COUNTY_STATES = { '12033': 'FL', '12113': 'FL', '12091': 'FL', '01003': 'AL' };

export function validateHomeAddress(value) {
  if (typeof value !== 'string' || !value.trim()) return 'Enter a street address, city and state or ZIP code.';
  if (value.trim().length < 8 || value.length > 220 || /[\u0000-\u001f<>]/.test(value)) return 'Use a complete street address, city and state or ZIP code, up to 220 characters.';
  if (!/\d/.test(value) || !/[a-z]/i.test(value)) return 'Include the street number and street name, plus a city and state or ZIP code.';
  return '';
}

export function readCensusAddressMatches(payload) {
  const rows = payload?.result?.addressMatches;
  if (!Array.isArray(rows) || rows.length > 50) throw Error('The address service returned an unexpected response. Please try again.');
  const seen = new Set(), matches = [];
  let outsideCoverage = false;
  for (const row of rows) {
    const label = row?.matchedAddress, lat = row?.coordinates?.y, lng = row?.coordinates?.x;
    const counties = row?.geographies?.Counties;
    if (typeof label !== 'string' || !label.trim() || label.length > 250 || /[\u0000-\u001f]/.test(label) || !Number.isFinite(lat) || !Number.isFinite(lng) || !Array.isArray(counties) || !counties.length) throw Error('The address service did not provide a usable location. Please try a more complete address.');
    const county = counties.find(item => Object.hasOwn(COUNTY_STATES, item?.GEOID));
    if (!county) { outsideCoverage = true; continue; }
    const state = row.addressComponents?.state;
    if (state !== COUNTY_STATES[county.GEOID] || lat < 29 || lat > 32 || lng < -89 || lng > -85) throw Error('The address service returned an inconsistent location. Please try again.');
    const zip = /^\d{5}$/.test(row.addressComponents?.zip || '') ? row.addressComponents.zip : '';
    const key = `${label}|${lat}|${lng}`;
    if (seen.has(key)) continue;
    seen.add(key);
    matches.push({ label: label.trim(), lat, lng, countyFips: county.GEOID, state, zip });
  }
  return { matches, outsideCoverage };
}

export function lookupHomeAddress(address, { signal, timeoutMs = 18000, documentObject = document, windowObject = window } = {}) {
  const invalid = validateHomeAddress(address);
  if (invalid) return Promise.reject(Error(invalid));
  return new Promise((resolve, reject) => {
    let completed = false, timer;
    const callback = '__costinSchoolAddress_' + globalThis.crypto.randomUUID().replaceAll('-', '');
    const script = documentObject.createElement('script');
    const abortError = () => new DOMException('Address lookup canceled.', 'AbortError');
    const cleanup = () => {
      clearTimeout(timer); script.remove(); delete windowObject[callback];
      signal?.removeEventListener('abort', canceled);
    };
    const finish = (error, result) => {
      if (completed) return;
      completed = true; cleanup();
      if (error) reject(error); else resolve(result);
    };
    const canceled = () => finish(abortError());
    if (signal?.aborted) { reject(abortError()); return; }
    const endpoint = new URL(CENSUS_GEOCODER);
    endpoint.search = new URLSearchParams({ address: address.trim(), benchmark: 'Public_AR_Current', vintage: 'Current_Current', layers: 'Counties', format: 'jsonp', callback });
    Object.defineProperty(windowObject, callback, { configurable: true, value: payload => {
      try { finish(null, readCensusAddressMatches(payload)); } catch (error) { finish(error); }
    } });
    script.async = true; script.referrerPolicy = 'no-referrer'; script.src = endpoint.href;
    script.onerror = () => finish(Error('The address service is unavailable. Try again or search by ZIP code.'));
    script.onload = () => { if (!completed) finish(Error('The address service returned an unexpected response. Please try again.')); };
    signal?.addEventListener('abort', canceled, { once: true });
    timer = setTimeout(() => finish(Error('The address lookup timed out. Try again or search by ZIP code.')), timeoutMs);
    documentObject.head.append(script);
  });
}
