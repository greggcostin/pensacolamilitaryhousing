// Independent checks for source-backed private/Christian school data and client behavior.
// No regeneration, network requests, live forms, or external map tiles.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import { findSchools, hasCampus, validateLocation } from '../civilian-site/assets/school-finder-core.js';
import { validateHomeAddress } from '../civilian-site/assets/school-address-search.js';

const read = path => JSON.parse(readFileSync(path, 'utf8'));
const dataPath = 'civilian-site/assets/school-finder-data.json';
const dataset = read(dataPath);
const raw = read('content/schools/map-private-source.json').schools;
const affiliations = read('content/schools/map-private-affiliations.json');
const schools = dataset.schools;
const privateSchools = schools.filter(s => s.sector === 'private');
const baseIds = new Set(raw.map(s => s.ncesId));
const byNces = new Map(privateSchools.filter(s => s.ncesId).map(s => [s.ncesId, s]));
const sourceFiles = readdirSync('content/schools').filter(s => /^map-private-.*\.json$/.test(s) && !['map-private-source.json', 'map-private-affiliations.json'].includes(s));
const sourceRecords = [];
function collectRecords(value, file) {
  if (!value || typeof value !== 'object') return;
  if (!Array.isArray(value) && (value.ncesId || value.id || value.sourceId)) sourceRecords.push({ ...value, _file: file });
  for (const child of Object.values(value)) if (child && typeof child === 'object') collectRecords(child, file);
}
for (const file of sourceFiles) {
  const source=read('content/schools/' + file);
  collectRecords(source,file);
  for(const [ncesId,row] of Object.entries(source.byNcesId||{}))sourceRecords.push({...row,ncesId,_file:file});
}
const evidenceFor = school => sourceRecords.filter(row => school.ncesId ? row.ncesId === school.ncesId : [row.id, row.sourceId].some(id => id && String(school.id).endsWith(id)));
const ids = rows => rows.map(s => s.id).sort();
const canonical = url => new URL(url).href;
const results = [];
async function check(name, fn) {
  try { await fn(); results.push({ name, passed: true }); console.log('PASS ' + name); }
  catch (error) { results.push({ name, passed: false, error: error.message }); console.error('FAIL ' + name + ': ' + error.message); }
}
const fixture = (id, extra = {}) => ({ id, name:id, city:'Pensacola', state:'FL', county:'Escambia', countyKey:'FL|Escambia', zip:'32503', lat:30.44, lng:-87.22,
  sector:'private', levels:['elementary'], charter:false, magnet:null, virtual:false, grade:null, gradeYear:null, reportUrl:null,
  christian:null, religiousCategory:'unknown', religiousOrientation:null, sourceUrl:'https://nces.ed.gov/', sourceYear:'2023-24', ...extra });
const fixtures = [
  fixture('Catholic elementary', { christian:true, religiousCategory:'christian', religiousOrientation:'Roman Catholic' }),
  fixture('Baptist high', { christian:true, religiousCategory:'christian', religiousOrientation:'Baptist', levels:['high'], zip:'32504', lat:30.45 }),
  fixture('Unspecified Christian combined', { christian:true, religiousCategory:'christian', religiousOrientation:'Christian (no specific denomination)', levels:['elementary','middle','high','combined'] }),
  fixture('Explicit nonsectarian', { christian:false, religiousCategory:'nonreligious', religiousOrientation:'Nonsectarian' }),
  fixture('Christian in name but no evidence'),
  fixture('Broad other affiliation', { religiousOrientation:'Other' }),
  fixture('Explicit different religion', { christian:false, religiousCategory:'unknown', religiousOrientation:'Jewish' }),
  fixture('Public with accidental affiliation', { sector:'public', christian:true, religiousCategory:'christian', grade:'A', gradeYear:'2025-26' }),
  fixture('Christian virtual', { christian:true, religiousCategory:'christian', religiousOrientation:'Baptist', virtual:true }),
  fixture('Christian Alabama', { christian:true, religiousCategory:'christian', religiousOrientation:'Presbyterian', state:'AL', city:'Foley', county:'Baldwin', countyKey:'AL|Baldwin', zip:'36535', lat:30.406, lng:-87.683 }),
  fixture('Christian missing location', { christian:true, religiousCategory:'christian', religiousOrientation:'Methodist', lat:null, lng:null })
];

await check('Christian includes Catholic and Protestant evidence, never a name or a public-school flag', () => {
  assert.deepEqual(ids(findSchools(fixtures, {type:'christian'})), ['Baptist high','Catholic elementary','Christian Alabama','Christian missing location','Christian virtual','Unspecified Christian combined'].sort());
  assert.deepEqual(ids(findSchools(fixtures, {type:'nonreligious'})), ['Explicit nonsectarian']);
  assert.equal(findSchools(fixtures, {type:'private'}).length, 10);
  for (const id of ['Christian in name but no evidence','Broad other affiliation','Explicit different religion']) {
    assert(!ids(findSchools(fixtures, {type:'christian'})).includes(id));
    assert(!ids(findSchools(fixtures, {type:'nonreligious'})).includes(id));
  }
});
await check('Private type, county, grade level, affiliation text, campus, ZIP and grade filters intersect', () => {
  const filters = {type:'christian', area:'county:FL|Escambia', level:'elementary', q:'catholic', program:'campus', zip:'32503', radius:'exact', grade:'none'};
  assert.deepEqual(ids(findSchools(fixtures, filters)), ['Catholic elementary']);
  for (const [field,value] of [['type','nonreligious'],['area','county:AL|Baldwin'],['level','high'],['q','baptist'],['program','virtual'],['zip','32504'],['grade','A']]) {
    assert.deepEqual(findSchools(fixtures,{...filters,[field]:value}), [], field);
  }
  const centers={'32503':{lat:30.44,lng:-87.22}};
  assert.deepEqual(ids(findSchools(fixtures,{type:'christian',area:'county:FL|Escambia',program:'campus',zip:'32503',radius:'2'},centers)), ['Baptist high','Catholic elementary','Unspecified Christian combined']);
  const before=JSON.stringify(fixtures);
  findSchools(fixtures,{type:'christian',q:'christian',zip:'32503',radius:'5'},centers);
  assert.equal(JSON.stringify(fixtures),before);
});
await check('All 63 original private NCES identities remain, with no private public-accountability letters', () => {
  assert.equal(raw.length,63);
  assert.equal(baseIds.size,63);
  assert.equal(affiliations.schools.length,63);
  assert.deepEqual(affiliations.schools.map(s=>s.ncesId).sort(), [...baseIds].sort());
  for (const id of baseIds) assert.equal(privateSchools.filter(s=>s.ncesId===id).length,1,id);
  assert.equal(new Set(schools.map(s=>s.id)).size,schools.length);
  for (const school of privateSchools) {
    assert.equal(school.grade,null,school.name);
    assert.equal(school.gradeYear,null,school.name);
    assert(school.reportUrl?.startsWith("/schools/"),school.name);
    assert([true,false,null].includes(school.christian),school.name+' tri-state Christian value');
    assert(['christian','nonreligious','unknown'].includes(school.religiousCategory),school.name+' religious category');
  }
  for (const letter of ['A','B','C','D','F']) assert.deepEqual(findSchools(schools,{type:'christian',grade:letter}),[]);
});
await check('Every affiliation matches NCES or an explicitly sourced current school override', () => {
  assert.equal(affiliations.schools.filter(s=>s.christian===true).length,44);
  assert.equal(affiliations.schools.filter(s=>s.christian===false).length,17);
  assert.equal(affiliations.schools.filter(s=>s.christian===null).length,2);
  for (const source of affiliations.schools) {
    const school=byNces.get(source.ncesId);
    assert(school,source.ncesId);
    if (school.christian===source.christian && school.religiousOrientation===source.religiousOrientation) {
      if (source.religiousOrientation) {
        assert.equal(canonical(school.affiliationSourceUrl),canonical(source.sourceUrl),school.name+' NCES affiliation URL');
        assert.equal(school.affiliationSourceYear,source.sourceYear,school.name+' NCES affiliation vintage');
      }
    } else {
      const override=evidenceFor(school).map(row=>row.affiliationOverride||row.affiliation||row).find(row=>row.christian===school.christian && [row.label,row.religiousOrientation,row.category].includes(school.religiousOrientation) && (row.affiliationSourceUrl||row.sourceUrl) && canonical(row.affiliationSourceUrl||row.sourceUrl)===canonical(school.affiliationSourceUrl));
      assert(override,school.name+' affiliation changed without matching explicit school evidence');
      assert(override.sourceYear||override.retrieved||override.verifiedAt,school.name+' undated override');
    }
    if (school.christian===true) assert.equal(school.religiousCategory,'christian',school.name);
    if (school.religiousCategory==='nonreligious') assert.equal(school.christian,false,school.name);
    if (school.christian===null) {
      assert.equal(school.religiousCategory,'unknown',school.name);
      assert(!findSchools([school],{type:'christian'}).length,school.name);
      assert(!findSchools([school],{type:'nonreligious'}).length,school.name);
    }
  }
});
await check('Pensacola Christian Academy is separately sourced, mapped and never assigned a made-up NCES ID', () => {
  const matches=privateSchools.filter(s=>String(s.id).endsWith('official-pensacola-christian-academy'));
  assert.equal(matches.length,1,'PCA supplemental source identity');
  const school=matches[0];
  assert.equal(school.ncesId,null);
  assert.equal(school.sourceKind,'official-school');
  assert.equal(school.christian,true);
  assert(school.religiousOrientation,'PCA explicit affiliation label');
  assert(hasCampus(school));
  assert.equal(school.city,'Pensacola');
  assert.equal(school.state,'FL');
  assert.equal(new URL(school.website).hostname.replace(/^www\./,''),'pensacolachristianacademy.com');
  assert(school.sourceYear&&school.affiliationSourceUrl&&school.admissionsUrl);
  assert(evidenceFor(school).length,'PCA has a source record');
  assert.equal(findSchools([school],{type:'christian',program:'campus'}).length,1);
});
await check('Hillcrest virtual evidence removes its point from campus, bounds and radius results but retains its listing', () => {
  const school=byNces.get('A2392082');
  assert(school,'Hillcrest original private ID');
  assert.equal(school.virtual,true);
  assert.equal(school.lat,null);
  assert.equal(school.lng,null);
  assert.equal(hasCampus(school),false);
  assert(school.campusNote && /online|virtual|campus/i.test(school.campusNote));
  assert.equal(findSchools([school],{type:'private',program:'virtual'}).length,1);
  assert.equal(findSchools([school],{zip:school.zip,radius:'exact'}).length,1);
  assert.equal(findSchools([school],{program:'campus'}).length,0);
  assert.equal(findSchools([school],{bounds:{south:29,north:32,west:-89,east:-85}}).length,0);
  assert.equal(findSchools([school],{zip:'32503',radius:'100'},dataset.zipCenters).length,0);
});
await check('Private campus positions come from their NCES record or a same-school documented update', () => {
  for(const school of privateSchools) {
    const source=raw.find(row=>row.ncesId===school.ncesId);
    const evidence=evidenceFor(school);
    if(school.virtual===true) {
      assert(evidence.some(row=>row.virtual===true&&row.sourceUrl),school.name+' virtual flag lacks source');
      assert.equal(hasCampus(school),false,school.name);
      continue;
    }
    if(!hasCampus(school)) {
      if(source && Number.isFinite(source.lat)&&Number.isFinite(source.lng))assert(evidence.some(row=>row.locationUnconfirmed===true&&row.sourceUrl),school.name+' removed campus lacks evidence');
      continue;
    }
    if(source&&school.lat===source.lat&&school.lng===source.lng)continue;
    const update=evidence.map(row=>row.locationOverride||row).find(row=>row.lat===school.lat&&row.lng===school.lng&&row.address===school.address&&row.sourceUrl);
    assert(update,school.name+' changed coordinates without same-school evidence');
    assert(update.geocoderUrl||update.locationNote||update.coordinateSourceUrl,school.name+' point method missing');
    assert(school.campusNote,school.name+' approximate point note missing');
    assert(school.lat>=29&&school.lat<=32&&school.lng>=-89&&school.lng<=-85,school.name+' out of coverage');
  }
});
await check('Resource and affiliation URLs are safe and occur on the same school source record', () => {
  assert(sourceFiles.length>=2,'Expected new private-school resource evidence files');
  let websites=0,admissions=0;
  function urls(value,result=new Set()) {
    if (typeof value==='string' && /^https?:\/\//.test(value)) result.add(canonical(value));
    else if (value && typeof value==='object') for (const child of Object.values(value)) urls(child,result);
    return result;
  }
  for(const source of sourceRecords.filter(row=>Object.hasOwn(row,'website')||Object.hasOwn(row,'admissionsUrl'))) {
    const school=source.ncesId?byNces.get(source.ncesId):privateSchools.find(row=>[source.id,source.sourceId].some(id=>id&&String(row.id).endsWith(id)));
    assert(school,(source.ncesId||source.id)+' resource school missing from output');
    for(const field of ['website','admissionsUrl'])if(Object.hasOwn(source,field))assert.equal(school[field],source[field]?canonical(source[field]):null,school.name+' verified '+field+' not retained');
  }
  for (const school of privateSchools) {
    const evidence=evidenceFor(school),allowed=urls(evidence);
    const base=raw.find(s=>s.ncesId===school.ncesId),affiliation=affiliations.schools.find(s=>s.ncesId===school.ncesId);
    urls(base,allowed);urls(affiliation,allowed);
    for (const field of ['website','admissionsUrl','affiliationSourceUrl']) {
      const value=school[field];if(!value)continue;
      const url=new URL(value);
      assert(['http:','https:'].includes(url.protocol),school.name+' '+field);
      assert(!url.username&&!url.password,school.name+' URL credentials');
      assert(!['localhost','example.com','127.0.0.1'].includes(url.hostname),school.name+' placeholder URL');
      assert(allowed.has(url.href),school.name+' '+field+' lacks same-school source evidence');
      if(field==='website')websites++;
      if(field==='admissionsUrl')admissions++;
    }
    if(school.christian===true)assert(school.affiliationSourceUrl,school.name+' unsourced Christian flag');
  }
  assert(websites>0&&admissions>0,'Official school and admissions links are present');
});

// Minimal isolated DOM and Leaflet boundaries: run the actual client module, observe
// its generated cards and markers, and never request scripts, tiles or live endpoints.
async function renderClient(rows) {
  class Node {
    constructor(tag='div') {this.tagName=tag.toUpperCase();this.children=[];this.attributes={};this.dataset={};this.listeners={};this.className='';this.value='';this.hidden=false;this._text='';this.classList={add:name=>{this.className+=' '+name;}};}
    set textContent(value){this._text=String(value);this.children=[];}
    get textContent(){return this._text+this.children.map(n=>typeof n==='string'?n:n.textContent).join('');}
    append(...nodes){for(const node of nodes){if(node?.tagName==='#FRAGMENT')this.children.push(...node.children);else this.children.push(node);if(node?.tagName==='SCRIPT')queueMicrotask(()=>node.onload());}}
    replaceChildren(...nodes){this.children=[];this._text='';this.append(...nodes);}
    setAttribute(name,value){this.attributes[name]=String(value);}
    addEventListener(name,callback){this.listeners[name]=callback;}
    querySelectorAll(selector){const found=[];const walk=n=>{for(const child of n.children||[]){if(typeof child==='string')continue;if(selector==='[data-school-id]'&&child.dataset.schoolId)found.push(child);walk(child);}};walk(this);return found;}
    matches(selector){return selector==='select'?this.tagName==='SELECT':selector==='input'?this.tagName==='INPUT':false;}
    remove(){} focus(){} scrollIntoView(){}
  }
  const registry=new Map(),get=selector=>{if(!registry.has(selector))registry.set(selector,new Node());return registry.get(selector);};
  const form=get('#sf-filters');
  const filterValues={q:'',area:'all',zip:'',radius:'exact',level:'all',type:'all',program:'all',grade:'all'};
  for(const [name,value] of Object.entries(filterValues)){const node=get('#sf-'+name);node.value=value;node.tagName=['q','zip'].includes(name)?'INPUT':'SELECT';}
  const shortcuts=['all','private','christian'].map(value=>{const button=new Node('button');button.dataset.sfTypeChoice=value;return button;});
  const root=new Node();root.querySelector=get;root.querySelectorAll=selector=>selector==='[data-sf-type-choice]'?shortcuts:[];
  const document={querySelector:selector=>selector==='#school-finder'?root:null,querySelectorAll:()=>[],createElement:tag=>new Node(tag),createTextNode:text=>{const n=new Node('#text');n.textContent=text;return n;},createDocumentFragment:()=>new Node('#fragment'),head:new Node('head')};
  const markerCalls=[];
  const map={setView(){return this;},addLayer(){},fitBounds(){},invalidateSize(){},remove(){}};
  const clusters={clearLayers(){markerCalls.length=0;},addLayer(marker){markerCalls.push(marker);},zoomToShowLayer(marker,callback){callback();}};
  const L={map:()=>map,tileLayer:()=>({addTo(){return this;},on(){}}),markerClusterGroup:()=>clusters,control:{scale:()=>({addTo(){}})},divIcon:options=>options,
    marker:(location,options)=>({location,options,bindPopup(content){this.popup=content;return this;},on(){return this;},getLatLng(){return location;},openPopup(){}}),latLngBounds:points=>points};
  const warnings=[];
  const context={document,window:{L},findSchools,hasCampus,validateLocation,validateHomeAddress,
    lookupHomeAddress:async()=>assert.fail('Address lookup requires a separate explicit-submit test; no live geocoder is allowed here'),
    URL,Map,Set,Number,String,Object,Array,Math,JSON,Promise,
    fetch:async url=>{assert.equal(url,'/assets/school-finder-data.json','No live fetch is allowed');return {ok:true,json:async()=>({schools:rows,zipCenters:{},counties:[],sources:[],coverageNote:'Isolated test fixture'})};},
    FormData:class {constructor(){return Object.entries(filterValues).map(([name])=>[name,get('#sf-'+name).value]);}},
    matchMedia:()=>({matches:true}),requestAnimationFrame:callback=>{queueMicrotask(callback);},ResizeObserver:class {observe(){}},
    setTimeout,clearTimeout,console:{warn:(...args)=>warnings.push(args.join(' '))}};
  const client=readFileSync('civilian-site/assets/school-finder.js','utf8').replace(/^import[^\n]*\n/gm,'');
  vm.runInNewContext(client,context,{filename:'school-finder.js',timeout:1000});
  for(let i=0;i<4;i++)await new Promise(resolve=>setImmediate(resolve));
  assert.deepEqual(warnings,[],'Client startup warnings');
  assert.equal(get('[data-sf-app]').hidden,false,'Client rendered');
  assert.equal(get('#sf-map').hidden,false,'Map auto-initialized without an open-map click');
  assert.equal(get('[data-sf-map-gate]').hidden,true,'Map loading gate dismissed');
  assert.equal(markerCalls.length,rows.filter(hasCampus).length,'Auto-loaded map contains every mappable fixture');
  return {get,shortcuts,markerCalls,warnings,async openMap(){await get('[data-sf-load-map]').listeners.click();assert.deepEqual(warnings,[]);assert.equal(get('#sf-map').hidden,false,'Map initialized');},
    selectType(value){get('#sf-type').value=value;form.listeners.change({target:get('#sf-type')});}};
}
await check('Actual client cards and map markers distinguish private P from public A-F grades', async () => {
  const client=await renderClient([fixtures[0],fixtures[3],fixtures[4],fixtures[7],fixtures[8]]);
  client.selectType('private');
  const cards=client.get('#sf-results').querySelectorAll('[data-school-id]');
  assert.equal(cards.length,4);
  for(const card of cards){const badge=card.children[0].children[0];assert.equal(badge.textContent,'P');assert(badge.className.includes('sf-grade--private'));assert.match(badge.attributes['aria-label'],/not a grade/);assert.match(card.textContent,/no state accountability grade/);}
  await client.openMap();
  assert.equal(client.markerCalls.length,3,'Virtual private excluded from markers');
  for(const marker of client.markerCalls){assert.match(marker.options.icon.html,/sf-grade--private/);assert.match(marker.options.icon.html,/>P</);assert(!/sf-grade--[ABCDF]\b/.test(marker.options.icon.html));}
  client.selectType('public');
  assert.equal(client.markerCalls.length,1);
  assert.match(client.markerCalls[0].options.icon.html,/sf-grade--A/);
  assert.match(client.markerCalls[0].options.icon.html,/>A</);
  client.selectType('christian');
  assert.equal(client.get('#sf-results').querySelectorAll('[data-school-id]').length,2,'Christian public and unverified names excluded');
  assert.equal(client.markerCalls.length,1,'Christian virtual is list-only');
});

const failures=results.filter(r=>!r.passed);
const report={checkedAt:new Date().toISOString(),datasetBuiltAt:dataset.builtAt,datasetSha256:createHash('sha256').update(readFileSync(dataPath)).digest('hex'),
  counts:{private:privateSchools.length,christian:privateSchools.filter(s=>s.christian===true).length,nonreligious:privateSchools.filter(s=>s.religiousCategory==='nonreligious').length,unknown:privateSchools.filter(s=>s.christian===null).length,originalNcesIds:baseIds.size},sourceFiles,checks:results.length,failures:failures.length,results};
mkdirSync('docs/school-map-2026-09-06',{recursive:true});
writeFileSync('docs/school-map-2026-09-06/finder-private-checks.json',JSON.stringify(report,null,2)+'\n');
console.log(`PRIVATE SCHOOL FINDER: ${results.length-failures.length}/${results.length} check groups passed.`);
if(failures.length)process.exitCode=1;
