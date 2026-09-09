import {readFileSync,writeFileSync} from 'node:fs';
import {dayDiff} from './search-evidence.mjs';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const today=new Date().toISOString().slice(0,10);
const validDate=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(Date.parse(s))&&new Date(s).toISOString().slice(0,10)===s;
const nonempty=s=>typeof s==='string'&&s.trim().length>0;
const hostKey=hosts=>Array.isArray(hosts)&&hosts.length&&hosts.every(nonempty)?[...new Set(hosts)].sort().join('|'):null;
const siteHosts={gc:['greggcostin.com','www.greggcostin.com'],pmh:['pensacolamilitaryhousing.com','www.pensacolamilitaryhousing.com']};
export function assessExperiment(e,data,today){
 if(!e.deployedAt)return {id:e.id,status:'awaiting_deployment',reason:'Prepared changes have no measurable live effect yet.'};
 if(!validDate(e.deployedAt)||!validDate(today)||e.deployedAt>today)return {id:e.id,status:'inconclusive',reason:'Invalid or future deployment/assessment date.'};
 if(dayDiff(e.deployedAt,today)<e.minimumFollowupDays)return {id:e.id,status:'collecting',reason:'Full observation period has not elapsed.'};
 if(data.availability!=='verified')return {id:e.id,status:'data_gap',reason:'Qualified-inquiry source is not verified; do not substitute clicks or zeros.'};
 const match=w=>(data.windows||[]).find(x=>x.site===e.site&&x.start===w?.start&&x.end===w?.end);
 const a=match(e.baselineWindow),b=match(e.followupWindow);
 if(!a||!b||![a.start,a.end,b.start,b.end].every(validDate)||a.start>a.end||b.start>b.end||a.end>=b.start||a.end>=e.deployedAt||dayDiff(a.start,a.end)!==dayDiff(b.start,b.end)||dayDiff(b.start,b.end)+1<e.minimumFollowupDays||b.end>today||b.start<e.deployedAt)return {id:e.id,status:'inconclusive',reason:'Missing or non-comparable outcome windows.'};
 const definitions=['source','sessionDefinition','qualificationDefinition','deduplication','attribution'];
 if(a.availability!=='observed'||b.availability!=='observed'||definitions.some(k=>!nonempty(a[k])||a[k]!==b[k])||!siteHosts[e.site]||hostKey(a.hostnameFilters)!==hostKey(siteHosts[e.site])||hostKey(b.hostnameFilters)!==hostKey(siteHosts[e.site]))return {id:e.id,status:'inconclusive',reason:'Outcome sources, definitions or production hostname filters are missing or inconsistent.'};
 if(![a.sessions,b.sessions,a.qualifiedConversations,b.qualifiedConversations].every(x=>Number.isFinite(x)&&x>=0)||a.sessions<e.minimumSessionsPerWindow||b.sessions<e.minimumSessionsPerWindow||a.qualifiedConversations+b.qualifiedConversations<e.minimumOutcomesAcrossWindows)return {id:e.id,status:'inconclusive',reason:'Insufficient observed sessions or qualified conversations.'};
 const before=a.qualifiedConversations/a.sessions,after=b.qualifiedConversations/b.sessions;
 return {id:e.id,status:'review_candidate',beforeRate:before,afterRate:after,reason:'Observed change only. Review attribution, seasonality and concurrent changes before adopting a lesson; this is not a causal test.'};
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/blog-learning.mjs')){
 const results=read('content/measure/experiments.json').experiments.map(e=>assessExperiment(e,read('content/measure/inquiry-outcomes.json'),today));
 const output={generated:today,results};writeFileSync('content/measure/learning-latest.json',JSON.stringify(output,null,2)+'\n');console.log(JSON.stringify(output,null,2));
}
