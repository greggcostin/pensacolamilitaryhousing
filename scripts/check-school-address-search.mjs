// Deterministic privacy/transport/distance regression tests. No network or form submission.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { validateHomeAddress, readCensusAddressMatches, lookupHomeAddress, CENSUS_GEOCODER } from '../civilian-site/assets/school-address-search.js';
import { findSchools, milesBetween } from '../civilian-site/assets/school-finder-core.js';
const results=[];
async function check(name,run){try{await run();results.push({name,passed:true});console.log('PASS '+name);}catch(error){results.push({name,passed:false,error:error.message});console.error('FAIL '+name+': '+error.message);}}
const row=(overrides={})=>({matchedAddress:'10 BRENT LN, PENSACOLA, FL, 32503',coordinates:{x:-87.242165115525,y:30.466842260457},addressComponents:{state:'FL',zip:'32503'},geographies:{Counties:[{GEOID:'12033'}]},...overrides});
const payload=(rows=[row()])=>({result:{addressMatches:rows}});
function fakeBrowser(){
  const scripts=[],windowObject={};
  const documentObject={createElement:tag=>{assert.equal(tag,'script');return {removed:false,remove(){this.removed=true;}};},head:{append(script){scripts.push(script);}}};
  return {scripts,windowObject,documentObject,options:{windowObject,documentObject,timeoutMs:1000},callback(index=0){return new URL(scripts[index].src).searchParams.get('callback');}};
}
await check('Address validation rejects incomplete, oversized and control-character input without requesting a provider',()=>{
  for(const value of ['', '   ', '32503', 'Pensacola', '1 A', 'a'.repeat(221), '10 Brent\nPensacola', '<script>10 Brent</script>'])assert(validateHomeAddress(value),value);
  assert.equal(validateHomeAddress('10 Brent Lane, Pensacola, FL 32503'),'');
});
await check('Census parsing accepts only finite points in the four covered counties and matching states',()=>{
  const accepted=readCensusAddressMatches(payload());
  assert.deepEqual(accepted.matches,[{label:'10 BRENT LN, PENSACOLA, FL, 32503',lat:30.466842260457,lng:-87.242165115525,countyFips:'12033',state:'FL',zip:'32503'}]);
  for(const [county,state] of [['12113','FL'],['12091','FL'],['01003','AL']])assert.equal(readCensusAddressMatches(payload([row({addressComponents:{state,zip:'36526'},geographies:{Counties:[{GEOID:county}]}})])).matches.length,1);
  for(const bad of [row({coordinates:{x:-87,y:'30.4'}}),row({coordinates:{x:30.4,y:-87}}),row({coordinates:{x:Infinity,y:30.4}}),row({geographies:{}}),row({addressComponents:{state:'AL'}})])assert.throws(()=>readCensusAddressMatches(payload([bad])));
});
await check('Ambiguous matches remain selectable, duplicates collapse and out-of-coverage matches cannot become origins',()=>{
  const other=row({matchedAddress:'20 BRENT LN, PENSACOLA, FL, 32503',coordinates:{x:-87.24,y:30.467}});
  assert.equal(readCensusAddressMatches(payload([row(),row(),other])).matches.length,2);
  assert.deepEqual(readCensusAddressMatches(payload([])),{matches:[],outsideCoverage:false});
  const outside=row({geographies:{Counties:[{GEOID:'12086'}]},coordinates:{x:-80.19,y:25.76}});
  assert.deepEqual(readCensusAddressMatches(payload([outside])),{matches:[],outsideCoverage:true});
  assert.throws(()=>readCensusAddressMatches({result:{addressMatches:'wrong'}}));
  assert.throws(()=>readCensusAddressMatches(payload(Array(51).fill(row()))));
});
await check('JSONP uses only the fixed HTTPS Census endpoint, explicit address and generated callback; success cleans up',async()=>{
  const env=fakeBrowser();const pending=lookupHomeAddress('10 Brent Lane, Pensacola, FL 32503',env.options);
  assert.equal(env.scripts.length,1);const script=env.scripts[0],endpoint=new URL(script.src);
  assert.equal(endpoint.origin+endpoint.pathname,CENSUS_GEOCODER);
  assert.equal(endpoint.searchParams.get('address'),'10 Brent Lane, Pensacola, FL 32503');
  assert.equal(endpoint.searchParams.get('layers'),'Counties');assert.equal(endpoint.searchParams.get('format'),'jsonp');
  assert.match(env.callback(),/^__costinSchoolAddress_[a-f0-9]{32}$/);
  assert.equal(script.referrerPolicy,'no-referrer');
  env.windowObject[env.callback()](payload());
  assert.equal((await pending).matches.length,1);assert(script.removed);assert.equal(Object.keys(env.windowObject).length,0);
});
await check('Invalid input and a pre-aborted request create no outgoing lookup',async()=>{
  const env=fakeBrowser();await assert.rejects(lookupHomeAddress('32503',env.options));
  const controller=new AbortController();controller.abort();
  await assert.rejects(lookupHomeAddress('10 Brent Lane Pensacola FL 32503',{...env.options,signal:controller.signal}),{name:'AbortError'});
  assert.equal(env.scripts.length,0);assert.equal(Object.keys(env.windowObject).length,0);
});
await check('Canceling a pending lookup removes script/callback and ignores a late captured callback',async()=>{
  const env=fakeBrowser(),controller=new AbortController();
  const pending=lookupHomeAddress('10 Brent Lane Pensacola FL 32503',{...env.options,signal:controller.signal});
  const callback=env.windowObject[env.callback()];controller.abort();
  await assert.rejects(pending,{name:'AbortError'});assert(env.scripts[0].removed);assert.equal(Object.keys(env.windowObject).length,0);
  callback(payload());assert.equal(Object.keys(env.windowObject).length,0);
});
await check('Timeout, load error, malformed response and missing callback reject cleanly without raw-address error text',async()=>{
  for(const failure of ['timeout','error','malformed','missing']){
    const env=fakeBrowser(),pending=lookupHomeAddress('10 Brent Lane Pensacola FL 32503',{...env.options,timeoutMs:failure==='timeout'?10:1000});
    if(failure==='error')env.scripts[0].onerror();
    if(failure==='malformed')env.windowObject[env.callback()]({});
    if(failure==='missing')env.scripts[0].onload();
    await assert.rejects(pending,error=>!error.message.includes('10 Brent')&&/service|lookup|response/i.test(error.message));
    assert(env.scripts[0].removed);assert.equal(Object.keys(env.windowObject).length,0);
  }
});
await check('Replacement lookups have isolated callbacks; canceling the first cannot settle the next request',async()=>{
  const env=fakeBrowser(),controller=new AbortController();
  const first=lookupHomeAddress('10 Brent Lane Pensacola FL 32503',{...env.options,signal:controller.signal});
  const second=lookupHomeAddress('20 Brent Lane Pensacola FL 32503',env.options);
  assert.notEqual(env.callback(0),env.callback(1));controller.abort();await assert.rejects(first,{name:'AbortError'});
  env.windowObject[env.callback(1)](payload([row({matchedAddress:'20 BRENT LN, PENSACOLA, FL, 32503'})]));
  assert.equal((await second).matches[0].label,'20 BRENT LN, PENSACOLA, FL, 32503');assert.equal(Object.keys(env.windowObject).length,0);
});
const school=(id,overrides={})=>({id,name:id,lat:30.401,lng:-87.2,sector:'public',countyKey:'FL|Escambia',city:'Pensacola',state:'FL',zip:'32503',levels:['elementary'],virtual:false,grade:'A',...overrides});
const sample=[school('Z Near'),school('A Far',{lat:30.5}),school('Cross ZIP',{lat:30.402,zip:'32504'}),school('Online',{virtual:true}),school('No Point',{lat:null,lng:null}),school('Private',{lat:30.403,sector:'private',christian:true,grade:null})];
const origin={lat:30.4,lng:-87.2};
await check('Address origin controls exact point distances across ZIPs, radius, AND filters and nearest sorting',()=>{
  const found=findSchools(sample,{origin,zip:'99999',radius:'1'});
  assert.deepEqual(found.map(s=>s.id),['Z Near','Cross ZIP','Private']);
  for(const s of found)assert.equal(s.distance,milesBetween(origin,s));
  assert.deepEqual(findSchools(sample,{origin,radius:'1',type:'christian'}).map(s=>s.id),['Private']);
  assert.deepEqual(findSchools(sample,{origin,radius:'1',type:'christian',grade:'A'}),[]);
  assert.deepEqual(findSchools(sample,{origin,radius:'1',bounds:{south:30.402,north:30.402,west:-87.2,east:-87.2}}).map(s=>s.id),['Cross ZIP']);
  assert.deepEqual(findSchools(sample,{origin,radius:'1',sort:'name'}).map(s=>s.id),['Cross ZIP','Private','Z Near']);
});
await check('Any-distance retains list-only records without inventing their distance; nearest sorts them last',()=>{
  const found=findSchools(sample,{origin,radius:'all'});
  assert.equal(found.length,sample.length);assert.deepEqual(found.slice(-2).map(s=>s.id),['No Point','Online']);
  assert(found.slice(-2).every(s=>s.distance===null));
  assert.equal(findSchools(sample,{origin,radius:String(milesBetween(origin,sample[0]))}).length,1);
  for(const invalid of [{lat:'30.4',lng:-87.2},{lat:0,lng:0},{lat:30.4,lng:NaN}])assert.deepEqual(findSchools(sample,{origin:invalid,radius:'all'}),[]);
});
await check('Clearing the origin restores ZIP behavior and removes home distances without mutating data',()=>{
  const before=JSON.stringify(sample);
  findSchools(sample,{origin,radius:'10'});
  const cleared=findSchools(sample,{origin:null,zip:'32503',radius:'exact'});
  assert(cleared.every(s=>s.zip==='32503'&&s.distance===null));assert(cleared.some(s=>s.virtual));
  assert.equal(JSON.stringify(sample),before);
});
await check('Automatic map initialization and Show on map share one pending load and retry after failure',async()=>{
  // Exercise the real UI loader function in isolation with controlled async work.
  const ui=readFileSync('civilian-site/assets/school-finder.js','utf8');
  const declaration=ui.match(/  function openMap\(\) \{[\s\S]*?\n  \}/)?.[0];assert(declaration);
  let starts=0,settle;
  const scope={Promise,initializeMap:()=>{starts++;return new Promise(resolve=>{settle=resolve;});}};
  runInNewContext('let map=null,mapOpening=null;'+declaration+';globalThis.call=openMap;globalThis.ready=()=>{map={};};',scope);
  const automatic=scope.call(),selection=scope.call();assert.equal(automatic,selection);assert.equal(starts,1);
  settle(false);assert.equal(await automatic,false);const retry=scope.call();assert.equal(starts,2);
  settle(true);assert.equal(await retry,true);scope.ready();assert.equal(await scope.call(),true);assert.equal(starts,2);
});
await check('A later school selection or changed filters suppress a delayed map/cluster popup',async()=>{
  const ui=readFileSync('civilian-site/assets/school-finder.js','utf8');
  const declaration=ui.match(/  async function showSchool\(school\) \{[\s\S]*?\n  \}/)?.[0];assert(declaration);
  let ready;const pending=new Promise(resolve=>{ready=resolve;}),callbacks=[],opened=[],highlighted=[];
  const markers=new Map(['first','second'].map(id=>[id,{id,openPopup:()=>opened.push(id)}]));
  const scope={openMap:()=>pending,markers,get:()=>({scrollIntoView(){}}),clusters:{zoomToShowLayer:(marker,callback)=>callbacks.push({id:marker.id,callback})},highlight:school=>highlighted.push(school.id)};
  runInNewContext('let schoolSelectionSequence=0;'+declaration+';globalThis.show=showSchool;globalThis.changeFilters=()=>{schoolSelectionSequence++;};',scope);
  const first=scope.show({id:'first'}),second=scope.show({id:'second'});ready(true);await Promise.all([first,second]);
  assert.deepEqual(callbacks.map(c=>c.id),['second']);scope.changeFilters();callbacks[0].callback();assert.deepEqual(opened,[]);assert.deepEqual(highlighted,[]);
  await scope.show({id:'first'});callbacks[1].callback();assert.deepEqual(opened,['first']);assert.deepEqual(highlighted,['first']);
});
await check('UI privacy contracts mask address displays and keep home lookup out of URL/history/storage/inquiry payloads',()=>{
  const ui=readFileSync('civilian-site/assets/school-finder.js','utf8');
  const markup=readFileSync('scripts/school-finder-lib.mjs','utf8');
  const transport=readFileSync('civilian-site/assets/school-address-search.js','utf8');
  assert(!/localStorage|sessionStorage|history\.(pushState|replaceState)|location\.(search|hash)\s*=/.test(ui+transport));
  const input=markup.match(/<input id="sf-home-address"[^>]*>/)?.[0];assert(input&&input.includes('data-clarity-mask="true"')&&!/\bname=/.test(input));
  assert(markup.includes('data-sf-address-matches hidden data-private="true" data-clarity-mask="true"'));
  assert(markup.includes('data-sf-home-active hidden data-private="true" data-clarity-mask="true"'));
  assert(ui.includes("popup.setAttribute('data-clarity-mask','true')"));
  assert(!/track|gtag|dataLayer|fbq/.test(transport));
  assert(ui.includes("get('#sf-address-form').addEventListener('submit'"));
  assert(ui.includes('apply();\n  openMap();'));
});
const failures=results.filter(r=>!r.passed);writeFileSync('docs/school-map-2026-09-06/address-search-checks.json',JSON.stringify({checkedAt:new Date().toISOString(),checks:results.length,failures:failures.length,results},null,2)+'\n');
console.log(`ADDRESS SEARCH: ${results.length-failures.length}/${results.length} groups passed.`);if(failures.length)process.exitCode=1;
