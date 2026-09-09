// Read-only evidence for the civilian site's search/indexing and edge-access audit.
// Credentials remain in .env.local and are never included in the report.
import { mkdirSync, writeFileSync } from 'node:fs';
import { loadEnv, strip } from './blog-lib.mjs';
loadEnv();
const root = 'https://greggcostin.com';
const out = 'docs/search-growth-2026-09-06';
mkdirSync(out, { recursive: true });
const paths = ['/', '/buy', '/sell', '/neighborhoods', '/gulf-shores-orange-beach', '/resources/first-time-home-buyer', '/resources/florida-home-insurance', '/resources/florida-homestead-exemption'];
const report = { collectedAt: new Date().toISOString(), public: [], bing: {}, cloudflare: {} };
async function safe(fn) { try { return { available: true, data: await fn() }; } catch(e) { return { available: false, error: String(e.message).replace(/(apikey|key|token)=[^&\s]+/gi, '$1=[redacted]') }; } }
async function bing(method, params = {}) {
  const u = new URL('https://ssl.bing.com/webmaster/api.svc/json/' + method);
  for (const [k,v] of Object.entries({ siteUrl: root + '/', ...params, apikey: process.env.BING_WEBMASTER_API_KEY })) u.searchParams.set(k,v);
  const r = await fetch(u, { signal: AbortSignal.timeout(30000) });
  if (!r.ok) throw new Error(method + ': HTTP ' + r.status);
  return (await r.json()).d;
}
async function cf(path, body) {
  const r = await fetch('https://api.cloudflare.com/client/v4/' + path, { method: body ? 'POST' : 'GET', headers: { Authorization: `Bearer ${process.env.CF_API_TOKEN}`, 'Content-Type': 'application/json' }, ...(body ? {body:JSON.stringify(body)} : {}), signal: AbortSignal.timeout(30000) });
  const j = await r.json();
  if (!r.ok || j.success === false || j.errors?.length) throw new Error('Cloudflare HTTP ' + r.status + ': ' + JSON.stringify(j.errors));
  return j.result ?? j.data;
}
report.public = await Promise.all(paths.map(async p => ({ url: root+p, ...await safe(async () => {
  const r=await fetch(root+p, {signal:AbortSignal.timeout(30000)}), h=await r.text();
  return {status:r.status,finalUrl:r.url,canonical:h.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i)?.[1],robots:h.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)/i)?.[1],xRobots:r.headers.get('x-robots-tag'),title:h.match(/<title>([^<]+)/i)?.[1],mainWords:strip(h.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1]??'').split(/\s+/).length,server:r.headers.get('server')};
}) })));
for (const method of ['GetFeeds','GetCrawlStats','GetCrawlIssues']) report.bing[method]=await safe(()=>bing(method));
report.bing.urls=await Promise.all(paths.map(async p=>({url:root+p,...await safe(()=>bing('GetUrlInfo',{url:root+p}))})));
const zones=await safe(()=>cf('zones?name=greggcostin.com'));
if(zones.available && zones.data.length){
  const zone=zones.data[0], z=zone.id;
  report.cloudflare.zone={name:zone.name,status:zone.status,plan:zone.plan?.name};
  const reads=[['settings',`zones/${z}/settings`],['bots',`zones/${z}/bot_management`],['rulesets',`zones/${z}/rulesets`],['firewallRules',`zones/${z}/firewall/rules`],['dns',`zones/${z}/dns_records?per_page=100`]];
  await Promise.all(reads.map(async([name,path])=>{ report.cloudflare[name]=await safe(()=>cf(path)); }));
  if(report.cloudflare.settings.available) report.cloudflare.settings.data=report.cloudflare.settings.data.filter(x=>/bot|security|browser_check|challenge|ssl/.test(x.id));
  if(report.cloudflare.dns.available) report.cloudflare.dns.data=report.cloudflare.dns.data.filter(x=>['A','AAAA','CNAME'].includes(x.type)).map(x=>({name:x.name,type:x.type,content:x.content,proxied:x.proxied}));
  if(report.cloudflare.rulesets.available) for(const ruleset of report.cloudflare.rulesets.data.filter(x=>/firewall|bot/.test(x.phase))) ruleset.detail=await safe(()=>cf(`zones/${z}/rulesets/${ruleset.id}`));
  const end=new Date(), start=new Date(end-23*60*60*1000);
  report.cloudflare.trafficWindow={start:start.toISOString(),end:end.toISOString(),identityEvidence:'User agents are self-asserted; verified bot status is required to prove identity.'};
  const query=`{viewer{zones(filter:{zoneTag:"${z}"}){httpRequestsAdaptiveGroups(limit:100,orderBy:[count_DESC],filter:{datetime_geq:"${start.toISOString()}",datetime_leq:"${end.toISOString()}",requestSource:"eyeball",OR:[{userAgent_like:"%Googlebot%"},{userAgent_like:"%bingbot%"},{userAgent_like:"%OAI-SearchBot%"}]}){count dimensions{userAgent clientRequestHTTPHost clientRequestPath edgeResponseStatus}}}}}`;
  report.cloudflare.crawlerTraffic=await safe(()=>cf('graphql',{query}));
}
else report.cloudflare.access=zones;
writeFileSync(out+'/live-search-health.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
