// Actual school-finder client integration with controlled DOM, Leaflet and provider
// boundaries. No scripts, map tiles, address requests or routing requests leave Node.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { findSchools, hasCampus, validateLocation } from '../civilian-site/assets/school-finder-core.js';
import { validateHomeAddress } from '../civilian-site/assets/school-address-search.js';

const results = [];
async function check(name, run) {
  try { await run(); results.push({ name, passed: true }); console.log('PASS ' + name); }
  catch (error) { results.push({ name, passed: false, error: error.stack }); console.error('FAIL ' + name + ': ' + error.stack); }
}
const settle = async () => { for (let i = 0; i < 5; i++) await new Promise(resolve => setImmediate(resolve)); };
const school = (id, extra = {}) => ({ id, name: id, address: '100 College Road', city: 'Pensacola', state: 'FL', zip: '32503', countyKey: 'FL|Escambia',
  lat: 30.441, lng: -87.22, sector: 'public', levels: ['elementary'], virtual: false, grade: 'A', gradeYear: '2025–26', gradeSpan: 'KG–05',
  reportUrl: '/schools/' + id.toLowerCase().replaceAll(' ', '-'), website: 'https://school.example.edu/', sourceUrl: 'https://nces.ed.gov/', sourceYear: '2024-25', ...extra });
const rows = [school('Z Nearest', {insight:{kind:'editorial',title:'A school-specific perspective',text:'An interpretation of sourced school information.',detailUrl:'/schools/z-nearest#school-perspective',sourceUrl:'https://school.example.edu/'}}), school('A Farther', { lat: 30.46, zip: '32504' }), school('Private Campus', { lat: 30.45, sector: 'private', christian: true, grade: null,insight:{kind:'directory',title:'A starting point for a school visit',text:'Confirm current grade spans and admissions directly.',sourceUrl:'https://nces.ed.gov/'} }),
  school('Virtual School', { virtual: true }), school('Unknown Campus', { lat: null, lng: null }), school('Beyond Radius', { lat: 30.9 })];
const homes = {
  first: { label: '10 TEST STREET, PENSACOLA, FL, 32503', lat: 30.44, lng: -87.22, state: 'FL', zip: '32503' },
  second: { label: '20 TEST STREET, PENSACOLA, FL, 32503', lat: 30.43, lng: -87.225, state: 'FL', zip: '32503' }
};
const route = (extra = {}) => ({ miles: 4.2, seconds: 480, shape: [[30.44, -87.22], [30.442, -87.215], [30.441, -87.22]],
  hasToll: false, hasFerry: false, shortestLimited: false, routeOptionsAdjusted: false, warnings: [], snappedPoints: [], ...extra });

async function browser() {
  class Node {
    constructor(tag = 'div') {
      this.tagName = tag.toUpperCase(); this.children = []; this.attributes = {}; this.dataset = {}; this.listeners = {};
      this.className = ''; this.value = ''; this.hidden = false; this.disabled = false; this._text = ''; this.parent = null;
      this.classList = { add: name => { this.className += ' ' + name; } };
    }
    set textContent(value) { this._text = String(value); this.children = []; }
    get textContent() { return this._text + this.children.map(n => n.textContent ?? String(n)).join(''); }
    append(...nodes) {
      for (const node of nodes) {
        if (node?.tagName === '#FRAGMENT') this.append(...node.children);
        else { this.children.push(node); node.parent = this; }
        if (node?.tagName === 'SCRIPT') queueMicrotask(() => node.onload());
      }
    }
    replaceChildren(...nodes) { this.children = []; this._text = ''; this.append(...nodes); }
    setAttribute(name, value) { this.attributes[name] = String(value); }
    addEventListener(name, callback) { this.listeners[name] = callback; }
    matches(selector) {
      if (selector === 'input' || selector === 'select' || selector === 'button' || selector === 'a') return this.tagName === selector.toUpperCase();
      if (selector.startsWith('.')) return this.className.split(/\s+/).includes(selector.slice(1));
      const attr = selector.match(/^\[([^=\]]+)(?:="([^"]*)")?\]$/);
      if (attr) {
        const [_, name, expected] = attr;
        const value = name.startsWith('data-') ? this.dataset[name.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase())] : this[name] ?? this.attributes[name];
        return value !== undefined && (expected === undefined || String(value) === expected);
      }
      return false;
    }
    querySelectorAll(selector) {
      const found = [];
      const walk = node => { for (const child of node.children) { if (child.matches(selector)) found.push(child); walk(child); } };
      walk(this); return found;
    }
    querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
    remove() { this.removed = true; if (this.parent) this.parent.children = this.parent.children.filter(n => n !== this); }
    focus() { this.focused = true; }
    scrollIntoView() {}
  }
  const registry = new Map(), root = new Node(), get = selector => {
    if (!registry.has(selector)) { const node = new Node(); node.id = selector.startsWith('#') ? selector.slice(1) : ''; registry.set(selector, node); root.append(node); }
    return registry.get(selector);
  };
  root.querySelector = get;
  const filterNames = { q: 'query', area: 'area', zip: 'zip', radius: 'radius', level: 'level', type: 'type', program: 'program', grade: 'grade', sort: 'sort' };
  const defaults = { q: '', area: 'all', zip: '', radius: 'exact', level: 'all', type: 'all', program: 'all', grade: 'all', sort: 'name' };
  for (const [name, suffix] of Object.entries(filterNames)) { const node = get('#sf-' + suffix); node.value = defaults[name]; node.tagName = ['q', 'zip'].includes(name) ? 'INPUT' : 'SELECT'; }
  get('#sf-home-address').tagName = 'INPUT';
  const exact = new Node('option'); exact.value = 'exact'; get('#sf-radius').append(exact);
  const form = get('#sf-filters');
  form.reset = () => { for (const [name, suffix] of Object.entries(filterNames)) get('#sf-' + suffix).value = defaults[name]; form.listeners.reset?.(); };
  const shortcuts = ['all', 'private', 'christian'].map(value => { const button = new Node('button'); button.dataset.sfTypeChoice = value; root.append(button); return button; });
  const head = new Node('head');
  const document = { querySelector: selector => selector === '#school-finder' ? root : null, querySelectorAll: () => [],
    createElement: tag => new Node(tag), createTextNode: text => { const node = new Node('#text'); node.textContent = text; return node; },
    createDocumentFragment: () => new Node('#fragment'), head };
  const markerRecords = [], drawn = [], opened = [], warnings = [], requests = [], addressCalls = [], polylineCalls = [];
  let cacheClears = 0, nextHome = homes.first;
  const map = { setView() { return this; }, addLayer() {}, fitBounds(points) { this.lastFit = points; }, invalidateSize() {}, remove() {} };
  const clusters = { clearLayers() { markerRecords.length = 0; }, addLayer(marker) { markerRecords.push(marker); }, zoomToShowLayer(marker, callback) { callback(); } };
  const shapeLayer = (shape, options) => ({ shape, options, removed: false, addTo() { drawn.push(this); return this; }, remove() { this.removed = true; }, getBounds() { return shape; } });
  const L = { map: () => map, tileLayer: () => ({ addTo() { return this; }, on() {} }), markerClusterGroup: () => clusters,
    control: { scale: () => ({ addTo() {} }) }, divIcon: options => options, latLngBounds: points => points,
    polyline: (shape, options) => { polylineCalls.push({ shape, options }); return { ...shapeLayer(shape, options), kind: 'route' }; }, circle: shapeLayer,
    marker: (location, options) => ({ location, options, addTo() { return this; }, remove() {}, on() { return this; }, getLatLng() { return location; },
      bindPopup(content) { this.popup = content; return this; }, openPopup() { this.node = typeof this.popup === 'function' ? this.popup() : this.popup; root.append(this.node); return this.node; } }) };
  const context = { document, window: { L, open: (...args) => opened.push(args) }, findSchools, hasCampus, validateLocation, validateHomeAddress,
    lookupHomeAddress: async (address, options) => { addressCalls.push({ address, options }); return { matches: [nextHome] }; },
    lookupDrivingRoute: (origin, destination, options) => new Promise((resolve, reject) => requests.push({ origin: { ...origin }, destination, signal: options.signal, resolve, reject })),
    clearDrivingRouteCache: () => { cacheClears++; },
    URL, Map, Set, Number, String, Object, Array, Math, JSON, Promise, AbortController,
    fetch: async url => { assert.equal(url, '/assets/school-finder-data.json', 'Only the local dataset may be fetched'); return { ok: true, json: async () => ({ schools: rows, zipCenters: { '32503': { lat: 30.44, lng: -87.22 } }, counties: [], sources: [], coverageNote: 'Test data' }) }; },
    FormData: class { constructor() { return Object.entries(filterNames).map(([name, suffix]) => [name, get('#sf-' + suffix).value]); } },
    matchMedia: () => ({ matches: true }), requestAnimationFrame: callback => queueMicrotask(callback), ResizeObserver: class { observe() {} },
    setTimeout, clearTimeout, console: { warn: (...args) => warnings.push(args.join(' ')) } };
  let source = readFileSync('civilian-site/assets/school-finder.js', 'utf8').replace(/^import[^\n]*\n/gm, '');
  // Expose the real guard only to test calls which the UI deliberately does not offer.
  // All normal flows below run through actual DOM event handlers.
  assert(source.includes('  apply();\n  openMap();'));
  source = source.replace('  apply();\n  openMap();', '  globalThis.guardCalculateDrive = calculateDrive;\n  apply();\n  openMap();');
  vm.runInNewContext(source, context, { filename: 'school-finder.js', timeout: 1000 });
  await settle();
  assert.deepEqual(warnings, [], 'The actual client must start cleanly');
  assert.equal(get('#sf-map').hidden, false, 'Automatic map startup still works');
  const cards = () => get('#sf-results').querySelectorAll('[data-school-id]');
  const card = id => { const result = cards().find(n => n.dataset.schoolId === id); assert(result, 'Missing card ' + id); return result; };
  const button = (parent, label) => { const found = parent.querySelectorAll('button').find(n => n.textContent.includes(label)); assert(found, 'Missing button ' + label); return found; };
  return { get, root, form, cards, card, button, requests, addressCalls, polylineCalls, drawn, opened, markerRecords, warnings,
    cacheClears: () => cacheClears,
    click: (parent, label) => { const node = button(parent, label); assert.equal(node.disabled, false, label + ' must be enabled'); return node.listeners.click(); },
    async setHome(which = 'first') { nextHome = homes[which]; get('#sf-home-address').value = nextHome.label; await get('#sf-address-form').listeners.submit({ preventDefault() {} }); await settle(); },
    editAddress() { get('#sf-home-address').value = 'A new address'; get('#sf-home-address').listeners.input(); },
    clearHome() { get('[data-sf-clear-home]').listeners.click(); },
    filter(name, value) { get('#sf-' + filterNames[name]).value = value; form.listeners.change({ target: get('#sf-' + filterNames[name]) }); },
    popup(id) { const marker = markerRecords.find(n => n.options.alt === id); assert(marker, 'Missing marker ' + id); return marker.openPopup(); },
    guard: context.guardCalculateDrive
  };
}

await check('Initial map, home search, radius filtering, school popups and map selection never auto-route', async () => {
  const ui = await browser(); assert.equal(ui.requests.length, 0);
  assert(!ui.get('#sf-results').textContent.includes('By road from your searched address'));
  await ui.setHome(); assert.equal(ui.addressCalls.length, 1); assert.equal(ui.requests.length, 0);
  ui.filter('radius', 'all'); ui.popup('Z Nearest'); await ui.click(ui.card('Z Nearest'), 'Show on map');
  ui.filter('type', 'private'); ui.filter('type', 'all');
  assert.equal(ui.requests.length, 0, 'Rendering and navigation must never bulk-request routes');
  assert.equal(ui.polylineCalls.length, 0);
  assert(!ui.get('#sf-results').textContent.includes('about 8 min'));
});

await check('Only Calculate drive calls the provider; actual road figures populate cards and popups without changing straight-line distances', async () => {
  const ui = await browser(); await ui.setHome();
  const originalOrder = ui.cards().map(n => n.dataset.schoolId);
  const originalDistance = ui.card('Z Nearest').querySelector('.sf-result-distance').textContent;
  assert.deepEqual(originalOrder, ['Z Nearest', 'Private Campus', 'A Farther']);
  assert.match(originalDistance, /< 0\.1 miles straight-line/);
  const popup = ui.popup('Z Nearest');
  const pending = ui.click(ui.card('Z Nearest'), 'Calculate drive');
  assert.equal(ui.requests.length, 1); assert(ui.button(ui.card('Z Nearest'), 'Calculating drive').disabled);
  assert(ui.button(popup, 'Calculating drive').disabled);
  assert.deepEqual(ui.requests[0].origin, { lat: homes.first.lat, lng: homes.first.lng });
  assert.equal(ui.requests[0].destination.id, 'Z Nearest');
  const returned = route({ miles: 47.3, seconds: 4440, hasToll: true, hasFerry: true, snappedPoints: [{ offsetMiles: .25 }] });
  ui.requests[0].resolve(returned); await pending; await settle();
  for (const node of [ui.card('Z Nearest'), popup]) {
    assert.match(node.textContent, /47\.3 mi · about 74 min/);
    assert.match(node.textContent, /Shortest-distance driving estimate · no live traffic/);
    assert.match(node.textContent, /Includes toll roads/); assert.match(node.textContent, /Includes a ferry/);
    assert.match(node.textContent, /Road access is offset/);
  }
  assert.deepEqual(ui.cards().map(n => n.dataset.schoolId), originalOrder, '47.3 road miles must not alter the 10-mile straight-line radius or order');
  assert.equal(ui.card('Z Nearest').querySelector('.sf-result-distance').textContent, originalDistance);
  assert.equal(ui.polylineCalls.length, 2, 'One route with outline and foreground');
  for (const call of ui.polylineCalls) assert.deepEqual(call.shape, returned.shape);
  assert.match(ui.get('[data-sf-driving-map-status]').textContent, /Google Maps may choose a different route/);
  assert(!ui.card('A Farther').textContent.includes('47.3 mi'));
});

await check('Ready trips are reused on repeated clicks and filter round trips with no additional provider request', async () => {
  const ui = await browser(); await ui.setHome();
  const pending = ui.click(ui.card('Z Nearest'), 'Calculate drive'); ui.requests[0].resolve(route()); await pending;
  await ui.click(ui.card('Z Nearest'), 'Show driving route');
  assert.equal(ui.requests.length, 1); assert.equal(ui.polylineCalls.length, 4);
  ui.filter('type', 'private'); assert(ui.drawn.filter(n => n.kind === 'route').every(n => n.removed));
  ui.filter('type', 'all'); assert.match(ui.card('Z Nearest').textContent, /4\.2 mi · about 8 min/);
  await ui.click(ui.card('Z Nearest'), 'Show driving route'); assert.equal(ui.requests.length, 1);
});

await check('A later school request aborts the earlier request and ignores its late success', async () => {
  const ui = await browser(); await ui.setHome();
  const old = ui.click(ui.card('Z Nearest'), 'Calculate drive');
  const newer = ui.click(ui.card('A Farther'), 'Calculate drive');
  assert.equal(ui.requests.length, 2); assert.equal(ui.requests[0].signal.aborted, true);
  ui.requests[1].resolve(route({ miles: 6.8, seconds: 900 })); await newer;
  ui.requests[0].resolve(route({ miles: 99, seconds: 9900 })); await old;
  assert.match(ui.card('A Farther').textContent, /6\.8 mi · about 15 min/);
  assert(!ui.get('#sf-results').textContent.includes('99.0 mi'));
  assert.equal(ui.polylineCalls.length, 2, 'Only the newer request can draw');
  assert.match(ui.get('[data-sf-driving-map-status]').textContent, /A Farther/);
  assert(ui.button(ui.card('Z Nearest'), 'Calculate drive'));
});

await check('Changing a filter cancels pending routing and a late failure does not leave stale loading or errors', async () => {
  const ui = await browser(); await ui.setHome();
  const pending = ui.click(ui.card('Z Nearest'), 'Calculate drive');
  ui.filter('type', 'private'); assert.equal(ui.requests[0].signal.aborted, true);
  ui.requests[0].reject(Error('Late provider failure')); await pending;
  ui.filter('type', 'all'); assert(ui.button(ui.card('Z Nearest'), 'Calculate drive'));
  assert(!ui.get('#sf-results').textContent.includes('Driving estimate unavailable'));
  assert.equal(ui.polylineCalls.length, 0);
});

await check('Editing the home address aborts the old route; new-home results cannot be replaced by old-home completion', async () => {
  const ui = await browser(); await ui.setHome();
  const old = ui.click(ui.card('Z Nearest'), 'Calculate drive'), previousClears = ui.cacheClears();
  ui.editAddress(); assert(ui.requests[0].signal.aborted); assert.equal(ui.cacheClears(), previousClears + 1);
  assert(!ui.get('#sf-results').textContent.includes('By road from your searched address'));
  await ui.setHome('second'); const newer = ui.click(ui.card('Z Nearest'), 'Calculate drive');
  assert.equal(ui.requests.length, 2); assert.deepEqual(ui.requests[1].origin, { lat: homes.second.lat, lng: homes.second.lng });
  ui.requests[1].resolve(route({ miles: 2.7, seconds: 360 })); await newer;
  ui.requests[0].resolve(route({ miles: 88, seconds: 8800 })); await old;
  assert.match(ui.card('Z Nearest').textContent, /2\.7 mi · about 6 min/);
  assert(!ui.card('Z Nearest').textContent.includes('88.0 mi')); assert.equal(ui.polylineCalls.length, 2);
});

await check('Clearing a home removes the route, clears ready-trip data and cache, and forces recalculation even for the same address', async () => {
  const ui = await browser(); await ui.setHome();
  const pending = ui.click(ui.card('Z Nearest'), 'Calculate drive'); ui.requests[0].resolve(route()); await pending;
  const clears = ui.cacheClears(); ui.clearHome();
  assert.equal(ui.cacheClears(), clears + 1); assert(ui.drawn.every(n => n.removed));
  assert.equal(ui.get('[data-sf-driving-map-status]').textContent, ''); assert.equal(ui.get('#sf-home-address').value, '');
  assert(!ui.get('#sf-results').textContent.includes('4.2 mi')); assert(!ui.get('#sf-results').textContent.includes('Calculate drive'));
  await ui.setHome(); assert(ui.button(ui.card('Z Nearest'), 'Calculate drive'));
  const again = ui.click(ui.card('Z Nearest'), 'Calculate drive'); assert.equal(ui.requests.length, 2);
  ui.requests[1].resolve(route()); await again;
});

await check('Provider errors display an honest retry action without guessed miles or time', async () => {
  const ui = await browser(); await ui.setHome();
  const pending = ui.click(ui.card('Z Nearest'), 'Calculate drive'); ui.requests[0].reject(Error('Provider offline, private details')); await pending;
  const card = ui.card('Z Nearest'); assert.match(card.textContent, /Driving estimate unavailable/);
  assert(!card.textContent.includes('private details')); assert(!card.querySelector('.sf-drive-figures')); assert.equal(ui.polylineCalls.length, 0);
  const retry = ui.click(card, 'Try driving estimate again'); assert.equal(ui.requests.length, 2);
  ui.requests[1].resolve(route({ miles: .05, seconds: 25 })); await retry;
  assert.match(ui.card('Z Nearest').textContent, /< 0\.1 mi · about < 1 min/);
});

await check('Provider limitation and access flags qualify the estimate in both cards and popups', async () => {
  const ui = await browser(); await ui.setHome(); const popup = ui.popup('Z Nearest');
  const pending = ui.click(ui.card('Z Nearest'), 'Calculate drive');
  ui.requests[0].resolve(route({ shortestLimited: true, routeOptionsAdjusted: true, hasTimeRestrictions: true, warnings: ['Shortest route search limited by service'] }));
  await pending;
  for (const node of [ui.card('Z Nearest'), popup]) {
    assert.match(node.textContent, /Distance-prioritized driving estimate · no live traffic/);
    assert(!node.textContent.includes('Shortest-distance driving estimate'));
    assert.match(node.textContent, /service limit prevented a full shortest-route search/);
    assert.match(node.textContent, /time-based restrictions/);
    const panel = node.querySelector('[data-sf-drive-id]');
    assert.equal(panel.attributes['data-clarity-mask'], 'true'); assert.equal(panel.dataset.private, 'true');
  }
});

await check('A route waiting for map initialization cannot draw after its selection or home is cleared', async () => {
  const source = readFileSync('civilian-site/assets/school-finder.js', 'utf8');
  const declaration = source.match(/  async function showDrivingRoute\(school,route,sequence\) \{[\s\S]*?\n  \}/)?.[0];
  assert(declaration, 'Exercise the actual asynchronous map-display function');
  for (const cancel of ['changeSelection', 'clearHome']) {
    let ready;
    const pending = new Promise(resolve => { ready = resolve; });
    const context = { openMap: () => pending, removeDrivingLayers: () => assert.fail('Stale route must not alter the map'),
      window: { L: { polyline: () => assert.fail('Stale route must not draw') } } };
    vm.runInNewContext('let drivingSequence=1,home={lat:30.44,lng:-87.22};' + declaration +
      ';globalThis.show=showDrivingRoute;globalThis.changeSelection=()=>{drivingSequence++;};globalThis.clearHome=()=>{home=null;};', context);
    const showing = context.show(rows[0], route(), 1); context[cancel](); ready(true); await showing;
  }
});

await check('Virtual and unknown campuses never offer driving estimates or call the provider, including the real function guard', async () => {
  const ui = await browser();
  await ui.guard(rows[0]); assert.equal(ui.requests.length, 0, 'An origin is required');
  await ui.setHome(); ui.filter('radius', 'all');
  for (const id of ['Virtual School', 'Unknown Campus']) {
    const card = ui.card(id); assert(!card.textContent.includes('Calculate drive')); assert(!card.textContent.includes('Driving directions'));
    await ui.guard(rows.find(s => s.id === id));
  }
  assert.equal(ui.requests.length, 0); assert.equal(ui.polylineCalls.length, 0);
});

await check('Google Maps directions remain explicit and usable with or without an address and after provider failure', async () => {
  const ui = await browser();
  await ui.click(ui.card('Z Nearest'), 'Driving directions');
  let url = new URL(ui.opened[0][0]); assert.equal(url.origin + url.pathname, 'https://www.google.com/maps/dir/');
  assert.equal(url.searchParams.get('api'), '1'); assert.equal(url.searchParams.get('travelmode'), 'driving'); assert.equal(url.searchParams.has('origin'), false);
  await ui.setHome(); const pending = ui.click(ui.card('Z Nearest'), 'Calculate drive'); ui.requests[0].reject(Error('offline')); await pending;
  const popup = ui.popup('Z Nearest'); await ui.click(popup, 'Driving directions'); url = new URL(ui.opened[1][0]);
  assert.equal(url.searchParams.get('origin'), `${homes.first.lat},${homes.first.lng}`);
  assert.match(url.searchParams.get('destination'), /^Z Nearest, 100 College Road/);
  assert.deepEqual(ui.opened[1].slice(1), ['_blank', 'noopener,noreferrer']); assert.equal(ui.requests.length, 1);
});

await check('Editorial excerpts and limited private-school notes remain distinct without triggering routing', async () => {
  const ui=await browser();
  const editorial=ui.card('Z Nearest').querySelector('.sf-school-insight');
  assert(editorial);assert(editorial.textContent.includes('School perspective'));
  assert(editorial.querySelectorAll('a').some(a=>a.href==='/schools/z-nearest#school-perspective'));
  const limited=ui.card('Private Campus').querySelector('.sf-school-insight');
  assert(limited.textContent.includes('School planning notes'));assert(limited.textContent.includes('not a campus review'));
  assert(!limited.textContent.includes('Read the full school perspective'));
  assert.equal(ui.requests.length,0);
  await ui.setHome();assert(ui.card('Z Nearest').querySelector('.sf-school-insight'));
  ui.filter('type','private');assert(ui.card('Private Campus').querySelector('.sf-school-insight'));
  assert.equal(ui.requests.length,0);
});

const failed = results.filter(r => !r.passed);
console.log(`DRIVING UI: ${results.length - failed.length}/${results.length} groups passed; actual client, no network.`);
if (failed.length) process.exitCode = 1;
