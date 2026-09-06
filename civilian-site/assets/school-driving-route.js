// Low-volume, explicit per-school route lookup. No address text, browser storage,
// analytics, retries or batch routing. Replace this trusted deployment constant
// with a managed/self-hosted compatible service before a high-traffic launch.
export const SCHOOL_DRIVING_ROUTE_ENDPOINT = 'https://valhalla1.openstreetmap.de/route';
const MIN_INTERVAL_MS = 1200, CACHE_TTL_MS = 5 * 60 * 1000, CACHE_LIMIT = 32;
const MAX_SHAPE_POINTS = 20000, MAX_RESPONSE_CHARS = 1000000;
const messages = {
  INVALID_POINT: 'Choose a valid local home point and a school with a confirmed campus.',
  SAME_POINT: 'The two comparison points are identical. A separate driving route is unavailable.',
  NO_ROUTE: 'No usable driving route was returned for these points. Confirm the campus entrance or use driving directions.',
  RATE_LIMITED: 'The routing service is busy. Please wait before requesting another route.',
  UNAVAILABLE: 'The driving-route service is unavailable. Your straight-line school results still work.',
  TIMEOUT: 'The driving-route lookup timed out. You can try again or use driving directions.',
  INVALID_RESPONSE: 'The routing service returned an unusable result. No driving estimate is shown.'
};
const routeError = code => Object.assign(new Error(messages[code]), { name: 'DrivingRouteError', code });
const abortError = () => new DOMException('Driving-route lookup canceled.', 'AbortError');
const finite = value => typeof value === 'number' && Number.isFinite(value);
const validCoordinate = (lat, lng) => finite(lat) && finite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;

export function isDrivingRoutePoint(point) {
  return !!point && point.virtual !== true && point.locationUnconfirmed !== true &&
    finite(point.lat) && finite(point.lng) && point.lat >= 29 && point.lat <= 32 && point.lng >= -89 && point.lng <= -85;
}
export function drivingRouteCacheKey(origin, school) {
  if (!isDrivingRoutePoint(origin) || !isDrivingRoutePoint(school)) throw routeError('INVALID_POINT');
  // Do not round: neighboring homes and opposite travel directions are distinct.
  return `${origin.lat},${origin.lng}>${school.lat},${school.lng}`;
}
export function drivingRoutePayload(origin, school) {
  drivingRouteCacheKey(origin, school);
  return {
    locations: [origin, school].map(p => ({ lat: p.lat, lon: p.lng, type: 'break', search_cutoff: 1000 })),
    costing: 'auto', costing_options: { auto: { shortest: true, disable_hierarchy_pruning: true } },
    units: 'miles', directions_type: 'none'
  };
}

// Native Valhalla JSON supplies a six-decimal encoded polyline. GeoJSON output
// is documented for OSRM format, which does not retain the native summary flags.
export function decodeRoutePolyline6(encoded) {
  if (typeof encoded !== 'string' || !encoded.length || encoded.length > MAX_RESPONSE_CHARS) throw routeError('INVALID_RESPONSE');
  let offset = 0, lat = 0, lng = 0;
  const shape = [];
  const component = () => {
    let value = 0, shift = 0, byte;
    do {
      if (offset >= encoded.length || shift > 30) throw routeError('INVALID_RESPONSE');
      byte = encoded.charCodeAt(offset++) - 63;
      if (byte < 0 || byte > 63) throw routeError('INVALID_RESPONSE');
      value += (byte & 31) * 2 ** shift; shift += 5;
    } while (byte >= 32);
    return value % 2 ? -(value + 1) / 2 : value / 2;
  };
  while (offset < encoded.length) {
    lat += component(); lng += component();
    const point = [lat / 1e6, lng / 1e6];
    if (!validCoordinate(...point) || shape.length >= MAX_SHAPE_POINTS) throw routeError('INVALID_RESPONSE');
    shape.push(point);
  }
  if (shape.length < 2) throw routeError('INVALID_RESPONSE');
  return shape;
}
function offsetMiles(point, requested) {
  const radians = x => x * Math.PI / 180;
  const a = Math.sin(radians(point[0] - requested.lat) / 2) ** 2 +
    Math.cos(radians(point[0])) * Math.cos(radians(requested.lat)) * Math.sin(radians(point[1] - requested.lng) / 2) ** 2;
  return 3958.7613 * 2 * Math.asin(Math.sqrt(Math.min(1, a)));
}
export function readDrivingRoute(payload, origin, school) {
  drivingRouteCacheKey(origin, school);
  const trip = payload?.trip, summary = trip?.summary;
  if (!trip || trip.status !== 0) throw routeError('NO_ROUTE');
  if (trip.units !== 'miles' || !summary || !finite(summary.length) || !finite(summary.time) ||
      summary.length < 0 || summary.time < 0 || summary.length > 1000 || summary.time > 172800) throw routeError('INVALID_RESPONSE');
  if (summary.length === 0 || summary.time === 0) throw routeError('NO_ROUTE');
  if (!Array.isArray(trip.legs) || trip.legs.length !== 1) throw routeError('INVALID_RESPONSE');
  const shape = decodeRoutePolyline6(trip.legs[0].shape);
  // Endpoints describe where this returned route meets the road network, not
  // guaranteed driveways, school entrances or the original geocoder points.
  const snappedPoints = [shape[0], shape.at(-1)].map((p, i) => ({ lat: p[0], lng: p[1], offsetMiles: offsetMiles(p, i ? school : origin) }));
  if (snappedPoints.some(p => p.offsetMiles > 1)) throw routeError('INVALID_RESPONSE');
  if (!Array.isArray(trip.warnings || []) || !Array.isArray(payload.warnings || [])) throw routeError('INVALID_RESPONSE');
  const rawWarnings = [...(trip.warnings || []), ...(payload.warnings || [])];
  if (rawWarnings.length > 32) throw routeError('INVALID_RESPONSE');
  const warningCodes = [...new Set(rawWarnings.map(w => w?.code).filter(code => Number.isSafeInteger(code) && code >= 0 && code <= 9999))];
  const shortestLimited = warningCodes.includes(205);
  const routeOptionsAdjusted = rawWarnings.length > 0;
  const warnings = [];
  if (routeOptionsAdjusted) warnings.push('The routing service adjusted one or more requested options. This distance is an estimate, not a guaranteed shortest route.');
  if (snappedPoints.some(p => p.offsetMiles > 0.1)) warnings.push('A route endpoint is more than 0.1 mile from the requested point. Confirm the road access and campus entrance.');
  const flag = value => typeof value === 'boolean' ? value : null;
  return { miles: summary.length, seconds: summary.time, shape, snappedPoints,
    hasToll: flag(summary.has_toll), hasFerry: flag(summary.has_ferry), hasTimeRestrictions: flag(summary.has_time_restrictions),
    warnings, warningCodes, shortestLimited, routeOptionsAdjusted, shortestDistanceRequested: true, shortestDistanceGuaranteed: false,
    provider: 'Valhalla / FOSSGIS', endpointBasis: 'Returned route geometry endpoints' };
}

function abortable(promise, signal) {
  if (!signal) return promise;
  if (signal.aborted) return Promise.reject(abortError());
  return new Promise((resolve, reject) => {
    const canceled = () => { signal.removeEventListener('abort', canceled); reject(abortError()); };
    signal.addEventListener('abort', canceled, { once: true });
    promise.then(value => { signal.removeEventListener('abort', canceled); resolve(value); }, error => { signal.removeEventListener('abort', canceled); reject(error); });
  });
}

// The factory permits an isolated transport/clock in offline tests. The endpoint,
// privacy options, 1.2-second rate limit and caching bounds remain fixed.
export function createDrivingRouteClient({ fetchImpl = (...args) => fetch(...args), now = () => Date.now(), setTimer = setTimeout, clearTimer = clearTimeout } = {}) {
  const cache = new Map();
  let tail = Promise.resolve(), nextStartAt = 0, generation = 0;
  const clone = value => structuredClone(value);
  function clearCache() { generation++; cache.clear(); }
  function cached(key) {
    const entry = cache.get(key);
    if (!entry) return null;
    if (now() - entry.at >= CACHE_TTL_MS) { cache.delete(key); return null; }
    return clone(entry.result);
  }
  function delay(ms, signal) {
    return new Promise((resolve, reject) => {
      if (signal?.aborted) { reject(abortError()); return; }
      const finish = () => { signal?.removeEventListener('abort', cancel); resolve(); };
      const timer = setTimer(finish, ms);
      const cancel = () => { clearTimer(timer); signal.removeEventListener('abort', cancel); reject(abortError()); };
      signal?.addEventListener('abort', cancel, { once: true });
    });
  }
  async function request(origin, school, signal, timeoutMs, transport) {
    const controller = new AbortController();
    let timedOut = false;
    const abort = () => controller.abort();
    signal?.addEventListener('abort', abort, { once: true });
    if (signal?.aborted) controller.abort();
    const timer = setTimer(() => { timedOut = true; controller.abort(); }, timeoutMs);
    try {
      return await abortable((async () => {
        const response = await transport(SCHOOL_DRIVING_ROUTE_ENDPOINT, { method: 'POST', mode: 'cors', credentials: 'omit', cache: 'no-store', redirect: 'error', referrerPolicy: 'strict-origin',
          headers: { 'Content-Type': 'application/json', 'X-Client-Id': 'greggcostin.com' }, body: JSON.stringify(drivingRoutePayload(origin, school)), signal: controller.signal });
        if (!response?.ok) throw routeError(response?.status === 429 ? 'RATE_LIMITED' : [400,404,422].includes(response?.status) ? 'NO_ROUTE' : 'UNAVAILABLE');
        if (Number(response.headers?.get('content-length')) > MAX_RESPONSE_CHARS) throw routeError('INVALID_RESPONSE');
        const text = await response.text();
        if (text.length > MAX_RESPONSE_CHARS) throw routeError('INVALID_RESPONSE');
        let payload; try { payload = JSON.parse(text); } catch { throw routeError('INVALID_RESPONSE'); }
        return readDrivingRoute(payload, origin, school);
      })(), controller.signal);
    } catch (error) {
      if (signal?.aborted) throw abortError();
      if (timedOut) throw routeError('TIMEOUT');
      if (error?.name === 'DrivingRouteError') throw error;
      throw routeError('UNAVAILABLE');
    } finally { clearTimer(timer); signal?.removeEventListener('abort', abort); }
  }
  async function lookup(origin, school, { signal, timeoutMs = 18000, fetchImpl: transport = fetchImpl } = {}) {
    const key = drivingRouteCacheKey(origin, school);
    if (origin.lat === school.lat && origin.lng === school.lng) throw routeError('SAME_POINT');
    if (signal?.aborted) throw abortError();
    const hit = cached(key); if (hit) return hit;
    const from = { lat: origin.lat, lng: origin.lng }, to = { lat: school.lat, lng: school.lng }, version = generation;
    const job = tail.then(async () => {
      if (signal?.aborted) throw abortError();
      const hit = cached(key); if (hit) return hit;
      // Recheck elapsed time after timers: an early/rounded timer cannot exceed policy.
      while (nextStartAt > now()) await delay(nextStartAt - now(), signal);
      if (signal?.aborted) throw abortError();
      nextStartAt = now() + MIN_INTERVAL_MS;
      const result = await request(from, to, signal, Math.max(1, Math.min(18000, Number(timeoutMs) || 18000)), transport);
      if (signal?.aborted) throw abortError();
      if (version === generation) {
        for (const [id, entry] of cache) if (now() - entry.at >= CACHE_TTL_MS) cache.delete(id);
        if (cache.size >= CACHE_LIMIT) cache.delete(cache.keys().next().value);
        cache.set(key, { at: now(), result: clone(result) });
      }
      return result;
    });
    tail = job.catch(() => {});
    return abortable(job, signal);
  }
  return { lookupDrivingRoute: lookup, clearDrivingRouteCache: clearCache };
}
const defaultClient = createDrivingRouteClient();
export const lookupDrivingRoute = (...args) => defaultClient.lookupDrivingRoute(...args);
export const clearDrivingRouteCache = () => defaultClient.clearDrivingRouteCache();
