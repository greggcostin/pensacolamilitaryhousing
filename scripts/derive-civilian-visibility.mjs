// Read-only derivation from the saved benchmark. Source-list appearances are not traffic.
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {save} from './isolated-release-lib.mjs';
const file='docs/seo-geo-2026-09-06/projects/08-measurement/2026-09-08/ai-observations.json';
const text=readFileSync(file,'utf8'),data=JSON.parse(text),rows=data.observations.filter(o=>o.completed&&o.audience==='civilian'&&o.intent==='agent_selection');
const hosts=new Map();
for(const row of rows){
 const perAnswer=new Map();
 for(const url of row.visibleSourceUrls||[])try{const host=new URL(url).hostname.replace(/^www\./,'');if(!perAnswer.has(host))perAnswer.set(host,url);}catch{}
 for(const [host,url] of perAnswer){if(!hosts.has(host))hosts.set(host,{host,answers:0,sampleUrl:url,regions:new Set()});const entry=hosts.get(host);entry.answers++;entry.regions.add(row.region);}
}
save('docs/growth-execution-2026-09-08/civilian-source-visibility.json',{
 derivedAt:new Date().toISOString(),source:file,sourceSha256:createHash('sha256').update(text).digest('hex'),sourceUpdatedAt:data.updatedAt,
 completedCivilianQueries:rows.length,civilianRecommendations:rows.filter(o=>o.greggRecommended===true).length,
 method:'One source hostname appearance per completed civilian agent-selection answer, using visibleSourceUrls. Cross-state factual queries are excluded. Related/grouped sources are included. These are not verified recommendations, search rankings, traffic estimates, independent users or causal drivers.',
 coverage:'Partial fixed 16-question, seven-surface, three-repeat benchmark; 191 of 336 total responses saved. Repeated queries and session/location effects apply.',
 hosts:[...hosts.values()].map(h=>({...h,regions:[...h.regions].sort()})).sort((a,b)=>b.answers-a.answers||a.host.localeCompare(b.host))
});
console.log(JSON.stringify({queries:rows.length,recommendations:rows.filter(o=>o.greggRecommended===true).length,sourceHostnames:hosts.size}));
