// Public competitor content only; this does not estimate visits, ad spend, or conversions.
import { mkdirSync, writeFileSync } from 'node:fs';
const targets = [
  ['The Leavenworth Team','https://www.bestrealtorsinpensacola.com/'],
  ['The Mark Lee Team','https://markleeteam.com/'],
  ['The BE MORE Group','https://www.bemoregroup.net/'],
  ['The Keenan Team','https://keenanteamhomes.com/'],
  ['Search The Gulf','https://www.searchthegulf.com/'],
  ['Team Turner','https://teamturner1.com/market-reports/'],
  ['Destin Sales','https://www.destinsales.com/blog/2025/10/10169/3rd-quarter-2025-real-estate-market-report-destin-miramar-beach-30a'],
  ['Panhandle PCS','https://www.panhandlepcs.com/'],
  ['Navy to Navy','https://www.navytonavy.com/'],
  ['Levin Rinke Realty (brokerage benchmark)','https://www.levinrinkerealty.com/'],
  ['CondoInvestment.com','https://www.condoinvestment.com/'],
  ['Scenic Sotheby\'s (regional benchmark)','https://www.scenicsir.com/']
];
const strip = html => html.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
let cursor = 0; const rows = [];
await Promise.all(Array.from({length:4},async () => { while (cursor < targets.length) {
  const [name,url] = targets[cursor++];
  try {
    const res = await fetch(url,{signal:AbortSignal.timeout(20000)}), html = await res.text();
    const links = [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)].map(m=>{try {return {url:new URL(m[1],res.url).href,label:strip(m[2]).slice(0,140)};}catch{return null;}}).filter(Boolean);
    rows.push({name,url,finalUrl:res.url,status:res.status,title:(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)||[])[1]||null,description:(html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)/i)||[])[1]||null,headings:[...html.matchAll(/<h([1-3])[^>]*>([\s\S]*?)<\/h[1-3]>/gi)].map(m=>({level:+m[1],text:strip(m[2]).slice(0,200)})).slice(0,60),leadTools:links.filter(l=>/worth|value|mortgage|calculator|newsletter|subscribe|schedule|book|guide|market|relocat|pcs|youtube|instagram|search|community|communities/i.test(l.label+' '+l.url)).slice(0,70),formCount:(html.match(/<form\b/gi)||[]).length,videoCount:(html.match(/<video\b/gi)||[]).length,sourceContainsMetaPixel:/fbq\(|fbevents\.js/.test(html)});
  } catch (e) { rows.push({name,url,error:e.message}); }
} }));
rows.sort((a,b)=>a.name.localeCompare(b.name));
mkdirSync('docs/site-audit-2026-09-05',{recursive:true});
writeFileSync('docs/site-audit-2026-09-05/competitor-evidence.json',JSON.stringify({at:new Date().toISOString(),method:'Direct read-only retrieval of public HTML. Traffic, channel share, spend, and conversion effectiveness are unknown. Markup detection does not establish active advertising.',rows},null,2)+'\n');
console.log(JSON.stringify(rows.map(({name,status,error,headings,formCount})=>({name,status,error,forms:formCount,headings:headings?.slice(0,7)})),null,2));
