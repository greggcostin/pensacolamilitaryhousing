// Read existing costin-contact observability only. Never invokes the contact worker.
import {readFileSync,writeFileSync} from 'node:fs';
const token=process.env.CLOUDFLARE_API_TOKEN||process.env.CF_API_TOKEN;
if(!token)throw Error('Cloudflare credential unavailable');
const account=JSON.parse(readFileSync('node_modules/.cache/wrangler/pages.json','utf8')).account_id;
const timeframe={from:Date.parse('2026-09-07T00:00:00Z'),to:Date.now()};
const body={queryId:'coast-authentic-inquiry-readback-20260908',timeframe,dry:true,view:'events',limit:100,parameters:{filters:[{key:'$metadata.service',operation:'eq',type:'string',value:'costin-contact'}],filterCombination:'and'}};
const r=await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/workers/observability/telemetry/query`,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(30000)});
const data=await r.json();
const report={checkedAt:new Date().toISOString(),readOnly:true,workerInvoked:false,realLeadCreated:false,emailSent:false,timeframe,httpStatus:r.status,success:data.success===true,errors:data.errors||[],queryParameters:body,events:[],providerRunStatus:data.result?.run?.status??null,statistics:data.result?.statistics??null,note:'Read-only temporary query of existing logs. No stored query or production code change. Missing or sampled logs cannot establish zero inquiries.'};
// Only persist receipt state telemetry emitted by the reviewed source, never request payloads.
const rows=data.result?.events?.events||data.result?.events||[];
report.returnedEventCount=Array.isArray(rows)?rows.length:null;
for(const e of Array.isArray(rows)?rows:[]){let source=e.source;try{if(typeof source==='string')source=JSON.parse(source);}catch{source=null;}
 if(!source?.receiptId)continue;
 const allowed=['event','receiptId','site','channel','platform','crm','notification','confirmation','task','retryCount'];
 report.events.push({timestamp:e.timestamp,...Object.fromEntries(allowed.filter(k=>source[k]!==undefined).map(k=>[k,source[k]]))});
}
report.resultShape=data.result?Object.fromEntries(Object.entries(data.result).map(([k,v])=>[k,Array.isArray(v)?`array:${v.length}`:v&&typeof v==='object'?Object.keys(v):typeof v])):null;
writeFileSync('docs/seo-geo-2026-09-06/projects/08-measurement/2026-09-08/authentic-inquiry-worker-logs.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({httpStatus:report.httpStatus,success:report.success,errors:report.errors,returnedEventCount:report.returnedEventCount,receiptStateRows:report.events.length,resultShape:report.resultShape},null,2));
