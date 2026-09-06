// Offline regression checks. The transport is always injected; no routes, tiles,
// personal addresses, credentials or contact forms are sent by this test.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SCHOOL_DRIVING_ROUTE_ENDPOINT, createDrivingRouteClient, drivingRoutePayload, drivingRouteCacheKey, isDrivingRoutePoint, decodeRoutePolyline6, readDrivingRoute } from '../civilian-site/assets/school-driving-route.js';
const origin = { lat:30.425716, lng:-87.182746, label:'Private fixture text must never leave the client' };
const school = { lat:30.438993, lng:-87.179599, name:'School fixture text must never leave the client', virtual:false };
const points = [[30.425716,-87.182746],[30.43,-87.182],[30.438993,-87.179599]];
// Fixture encoder uses signed-integer zigzag and radix-32 digits, independent
// from the production decoder's arithmetic accumulation/coordinate validation.
function encode(shape) {
  let last = [0,0], out = '';
  for (const point of shape) for (let i=0;i<2;i++) {
    const current=Math.round(point[i]*1e6),delta=current-last[i];last[i]=current;
    let value=delta<0?(-delta*2-1):delta*2;
    while(value>=32){out+=String.fromCharCode((value%32)+95);value=Math.floor(value/32);}
    out+=String.fromCharCode(value+63);
  }
  return out;
}
const fixture = () => ({trip:{status:0,units:'miles',summary:{length:1.0713,time:165.675,has_toll:false,has_ferry:false,has_time_restrictions:false},legs:[{shape:encode(points)}]}});
const response = (payload=fixture(),status=200) => new Response(JSON.stringify(payload),{status,headers:{'Content-Type':'application/json'}});
const flush = () => new Promise(resolve=>setImmediate(resolve));
class Clock {
  time=0;next=1;timers=new Map();
  now=()=>this.time;
  setTimer=(fn,ms)=>{const id=this.next++;this.timers.set(id,{fn,at:this.time+ms});return id;};
  clearTimer=id=>this.timers.delete(id);
  async tick(ms){const target=this.time+ms;while(true){const next=[...this.timers.entries()].filter(([,t])=>t.at<=target).sort((a,b)=>a[1].at-b[1].at)[0];if(!next)break;this.time=next[1].at;this.timers.delete(next[0]);next[1].fn();await flush();}this.time=target;await flush();}
}
const harness = (transport=async()=>response()) => {
  const clock=new Clock(),calls=[];
  const client=createDrivingRouteClient({now:clock.now,setTimer:clock.setTimer,clearTimer:clock.clearTimer,
    fetchImpl:async(url,options)=>{calls.push({url,options,at:clock.time});return transport(url,options,calls.length);}});
  return {...client,clock,calls};
};
let passed=0;
async function check(name,fn){await fn();passed++;console.log('PASS '+name);}

await check('Point validation rejects missing, swapped, virtual and out-of-region inputs before transport',async()=>{
 const env=harness();
 for(const p of [null,{lat:null,lng:-87},{lat:'30.4',lng:-87},{lat:NaN,lng:-87},{lat:-87,lng:30.4},{lat:35,lng:-87},{...school,virtual:true},{...school,locationUnconfirmed:true}]){
  assert.equal(isDrivingRoutePoint(p),false);await assert.rejects(env.lookupDrivingRoute(origin,p),{code:'INVALID_POINT'});
 }
 await assert.rejects(env.lookupDrivingRoute(origin,origin),{code:'SAME_POINT'});assert.equal(env.calls.length,0);
});
await check('Payload contains only point coordinates and fixed shortest auto options, never labels or addresses',()=>{
 assert.deepEqual(drivingRoutePayload(origin,school),{locations:[{lat:origin.lat,lon:origin.lng,type:'break',search_cutoff:1000},{lat:school.lat,lon:school.lng,type:'break',search_cutoff:1000}],costing:'auto',costing_options:{auto:{shortest:true,disable_hierarchy_pruning:true}},units:'miles',directions_type:'none'});
 const text=JSON.stringify(drivingRoutePayload(origin,school));assert(!/fixture|label|name|address|date_time|ignore_|fixed_speed|flow_mask/.test(text));
 assert.notEqual(drivingRouteCacheKey(origin,school),drivingRouteCacheKey(school,origin));
 assert.notEqual(drivingRouteCacheKey(origin,school),drivingRouteCacheKey({...origin,lat:origin.lat+1e-8},school));
});
await check('Polyline6 preserves order, precision, negative coordinates and rejects corrupt or oversized shapes',()=>{
 assert.deepEqual(decodeRoutePolyline6(encode(points)),points);
 // Google's published polyline5 example is deliberately decoded at precision 6.
 assert.deepEqual(decodeRoutePolyline6('_p~iF~ps|U_ulLnnqC_mqNvxq`@'),[[3.85,-12.02],[4.07,-12.095],[4.3252,-12.6453]]);
 for(const value of ['',null,'?','~~~~~~~','\u0000?',encode([[100,0],[100,1]]),encode(Array(20001).fill(points[0]))])assert.throws(()=>decodeRoutePolyline6(value),{code:'INVALID_RESPONSE'});
});
await check('One returned route supplies miles, seconds, geometry and optional flags without inferred driving values',()=>{
 const f=fixture(),r=readDrivingRoute(f,origin,school);assert.equal(r.miles,1.0713);assert.equal(r.seconds,165.675);assert.deepEqual(r.shape,points);
 assert.equal(r.hasToll,false);assert.equal(r.hasFerry,false);assert.equal(r.shortestDistanceGuaranteed,false);assert.equal(r.shortestLimited,false);
 assert(r.snappedPoints.every(p=>p.offsetMiles===0));
 delete f.trip.summary.has_toll;delete f.trip.summary.has_ferry;assert.equal(readDrivingRoute(f,origin,school).hasToll,null);assert.equal(readDrivingRoute(f,origin,school).hasFerry,null);
 f.trip.summary.has_toll=true;f.trip.summary.has_ferry=true;f.trip.summary.has_time_restrictions=true;
 assert.equal(readDrivingRoute(f,origin,school).hasToll,true);assert.equal(readDrivingRoute(f,origin,school).hasFerry,true);assert.equal(readDrivingRoute(f,origin,school).hasTimeRestrictions,true);
});
await check('Hierarchy warning 205 is explicit and raw provider messages never reach the UI',()=>{
 const f=fixture();f.trip.warnings=[{code:205,description:'RAW SERVICE DETAIL <script> private fixture'}];
 const r=readDrivingRoute(f,origin,school);assert.equal(r.shortestLimited,true);assert.deepEqual(r.warningCodes,[205]);assert.equal(r.routeOptionsAdjusted,true);assert(r.warnings.length);
 assert(!JSON.stringify(r).includes('RAW SERVICE'));assert(!JSON.stringify(r).includes('<script>'));
});
await check('Road endpoints disclose point offsets and mismatched distant geometry fails closed',()=>{
 const f=fixture();f.trip.legs[0].shape=encode([[origin.lat+.003,origin.lng],points[1],points[2]]);
 const r=readDrivingRoute(f,origin,school);assert(r.snappedPoints[0].offsetMiles>.1);assert.match(r.warnings.join(' '),/endpoint/);assert.equal(r.miles,f.trip.summary.length);
 f.trip.legs[0].shape=encode([[origin.lat+.03,origin.lng],points[1],points[2]]);assert.throws(()=>readDrivingRoute(f,origin,school),{code:'INVALID_RESPONSE'});
});
await check('Wrong units, zero routes, nonfinite values, multiple legs and malformed warning structures are rejected',()=>{
 const mutate=[f=>f.trip.units='kilometers',f=>f.trip.summary.length='1',f=>f.trip.summary.length=NaN,f=>f.trip.summary.length=-1,f=>f.trip.summary.length=1001,f=>f.trip.summary.time=Infinity,f=>f.trip.summary.time=172801,f=>f.trip.legs=[],f=>f.trip.legs.push(f.trip.legs[0]),f=>f.trip.warnings={},f=>f.trip.warnings=Array(33).fill({})];
 for(const change of mutate){const f=fixture();change(f);assert.throws(()=>readDrivingRoute(f,origin,school),{code:'INVALID_RESPONSE'});}
 for(const change of [f=>f.trip.status=442,f=>f.trip.summary.length=0,f=>f.trip.summary.time=0]){const f=fixture();change(f);assert.throws(()=>readDrivingRoute(f,origin,school),{code:'NO_ROUTE'});}
});
await check('Transport is fixed HTTPS POST, credential-free, coordinate-only and carries the client identifier',async()=>{
 const env=harness();await env.lookupDrivingRoute(origin,school);const call=env.calls[0];
 assert.equal(call.url,SCHOOL_DRIVING_ROUTE_ENDPOINT);assert.equal(new URL(call.url).search,'');assert.equal(call.options.method,'POST');assert.equal(call.options.credentials,'omit');assert.equal(call.options.cache,'no-store');assert.equal(call.options.redirect,'error');assert.equal(call.options.referrerPolicy,'strict-origin');
 assert.equal(call.options.headers['X-Client-Id'],'greggcostin.com');assert.equal(call.options.headers['Content-Type'],'application/json');assert.deepEqual(JSON.parse(call.options.body),drivingRoutePayload(origin,school));assert.equal(env.clock.timers.size,0);
});
await check('Requests are serial and begin at least 1200 ms apart; queued duplicates use the completed cache',async()=>{
 let finish;const env=harness(async()=>new Promise(resolve=>{finish=resolve;}));
 const first=env.lookupDrivingRoute(origin,school);await flush();
 const second=env.lookupDrivingRoute({...origin,lat:origin.lat+.0001},school);
 const duplicate=env.lookupDrivingRoute(origin,school);await env.clock.tick(2000);assert.equal(env.calls.length,1,'No overlapping transport');
 finish(response());await first;await flush();assert.equal(env.calls.length,2);assert(env.calls[1].at-env.calls[0].at>=1200);
 finish(response());await second;await duplicate;assert.equal(env.calls.length,2);
 const third=env.lookupDrivingRoute({...origin,lat:origin.lat+.0002},school);await flush();await env.clock.tick(1199);assert.equal(env.calls.length,2);await env.clock.tick(1);assert.equal(env.calls.length,3);finish(response());await third;
});
await check('Queued cancellation settles promptly and never sends a canceled destination',async()=>{
 let finish;const env=harness(async()=>new Promise(resolve=>{finish=resolve;}));
 const first=env.lookupDrivingRoute(origin,school);await flush();
 const controller=new AbortController(),second=env.lookupDrivingRoute({...origin,lat:origin.lat+.0001},school,{signal:controller.signal});controller.abort();
 await assert.rejects(second,{name:'AbortError'});assert.equal(env.calls.length,1);finish(response());await first;await env.clock.tick(1200);assert.equal(env.calls.length,1);
 const pre=new AbortController();pre.abort();await assert.rejects(env.lookupDrivingRoute(origin,school,{signal:pre.signal}),{name:'AbortError'});
});
await check('Active cancellation aborts fetch, ignores late success and cannot populate the cache',async()=>{
 let finish;const env=harness(async()=>new Promise(resolve=>{finish=resolve;})),controller=new AbortController();
 const first=env.lookupDrivingRoute(origin,school,{signal:controller.signal});await flush();controller.abort();await assert.rejects(first,{name:'AbortError'});assert.equal(env.calls[0].options.signal.aborted,true);
 finish(response());await flush();await env.clock.tick(1200);
 const next=env.lookupDrivingRoute(origin,school);await flush();assert.equal(env.calls.length,2);finish(response());await next;
});
await check('Timeout covers a hanging transport or body, clears timers, and makes no automatic retry',async()=>{
 for(const bodyHang of [false,true]){
  const env=harness(async()=>bodyHang?{ok:true,headers:new Headers(),text:()=>new Promise(()=>{})}:new Promise(()=>{}));
  const pending=env.lookupDrivingRoute(origin,school);const rejected=assert.rejects(pending,{code:'TIMEOUT'});await flush();await env.clock.tick(17999);assert.equal(env.calls[0].options.signal.aborted,false);await env.clock.tick(1);await rejected;
  assert.equal(env.calls[0].options.signal.aborted,true);await env.clock.tick(60000);assert.equal(env.calls.length,1);assert.equal(env.clock.timers.size,0);
 }
});
await check('Rate-limit, unreachable, HTTP, network, malformed JSON and oversized body errors are safe and never retried',async()=>{
 const cases=[{fn:async()=>response({error:'PRIVATE RAW ERROR'},429),code:'RATE_LIMITED'},{fn:async()=>response({},400),code:'NO_ROUTE'},{fn:async()=>response({},503),code:'UNAVAILABLE'},{fn:async()=>{throw Error('PRIVATE RAW ERROR');},code:'UNAVAILABLE'},{fn:async()=>new Response('not json'),code:'INVALID_RESPONSE'},{fn:async()=>new Response('x'.repeat(1000001)),code:'INVALID_RESPONSE'}];
 for(const {fn,code} of cases){const env=harness(fn);await assert.rejects(env.lookupDrivingRoute(origin,school),error=>error.code===code&&!error.message.includes('PRIVATE'));await env.clock.tick(60000);assert.equal(env.calls.length,1);}
});
await check('Cache is short-lived, exact-origin-specific, defensively copied and clearable',async()=>{
 const env=harness();const first=await env.lookupDrivingRoute(origin,school);first.shape[0][0]=0;first.warnings.push('mutated');
 const cached=await env.lookupDrivingRoute(origin,school);assert.equal(env.calls.length,1);assert.equal(cached.shape[0][0],points[0][0]);assert(!cached.warnings.includes('mutated'));
 await env.clock.tick(1200);await env.lookupDrivingRoute({...origin,lat:origin.lat+1e-8},school);assert.equal(env.calls.length,2);
 await env.clock.tick(300000);await env.lookupDrivingRoute(origin,school);assert.equal(env.calls.length,3);
 env.clearDrivingRouteCache();const pending=env.lookupDrivingRoute(origin,school);await env.clock.tick(1200);await pending;assert.equal(env.calls.length,4);
});
await check('Clearing cache during an in-flight route prevents the completed old result from being retained',async()=>{
 let finish;const env=harness(async()=>new Promise(resolve=>{finish=resolve;}));
 const first=env.lookupDrivingRoute(origin,school);await flush();env.clearDrivingRouteCache();finish(response());await first;
 const second=env.lookupDrivingRoute(origin,school);await env.clock.tick(1200);assert.equal(env.calls.length,2);finish(response());await second;
});
await check('The module has no persistence, URL history writes, telemetry, raw address transport or access-rule overrides',()=>{
 const code=readFileSync('civilian-site/assets/school-driving-route.js','utf8');
 assert(!/localStorage|sessionStorage|indexedDB|history\.|gtag\(|clarity\(|sendBeacon|ignore_access|ignore_restrictions|ignore_oneways|ignore_closures/.test(code));
 assert.equal((code.match(/https:\/\/valhalla1\.openstreetmap\.de\/route/g)||[]).length,1);
});
console.log(`School driving route: ${passed}/${passed} offline check groups passed.`);
