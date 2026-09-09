// Guard a proposed release against deleting successful URLs captured in a live crawl.
// node scripts/check-release-coverage.mjs --site pmh --dir dist --baseline docs/seo-geo-2026-09-06/live-crawl.json
// This does not deploy. A passing result proves path/canonical/sitemap preservation only.
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, join, relative, sep, dirname, isAbsolute } from 'node:path';
const args=process.argv.slice(2);
const arg=(key,fallback)=>args.includes(key)?args[args.indexOf(key)+1]:fallback;
const site=arg('--site'),dir=arg('--dir'),baseline=arg('--baseline','docs/seo-geo-2026-09-06/live-crawl.json');
if(!['pmh','gc'].includes(site)||!dir)throw new Error('Use --site pmh|gc --dir <exact release directory> [--baseline <live-crawl.json>].');
const root=resolve(dir),origin=site==='pmh'?'https://pensacolamilitaryhousing.com':'https://greggcostin.com';
const snapshot=JSON.parse(readFileSync(baseline,'utf8'));
const pages=snapshot.pages.filter(p=>p.tag===site&&p.status===200&&p.title);
if(!pages.length)throw new Error('No successful HTML baseline: cannot certify release coverage.');
const sitemap=existsSync(join(root,'sitemap.xml'))?readFileSync(join(root,'sitemap.xml'),'utf8'):'';
const findings=[];
for(const p of pages){
  const url=new URL(p.finalUrl);if(url.origin!==origin)throw new Error('Unexpected baseline origin.');
  const path=decodeURIComponent(url.pathname),rel=path.replace(/^\//,'');
  const candidates=path==='/'?['index.html']:[rel+'.html',join(rel,'index.html'),rel];
  const allowed=candidates.map(f=>resolve(root,f)).filter(f=>{const r=relative(root,f);return r&&!r.startsWith('..'+sep)&&r!=='..'&&!isAbsolute(r);});
  const file=allowed.find(f=>existsSync(f)&&/\.html$/i.test(f));
  if(!file){findings.push({url:p.finalUrl,issue:'Live page missing from proposed release'});continue;}
  const html=readFileSync(file,'utf8');
  const links=[...html.matchAll(/<link\b[^>]*>/gi)].map(m=>m[0]);
  const canonical=links.find(t=>/rel=["']canonical["']/i.test(t))?.match(/href=["']([^"']+)["']/i)?.[1];
  if(canonical!==p.finalUrl)findings.push({url:p.finalUrl,issue:'Canonical differs from preserved live URL',canonical:canonical||null});
  if(/<meta\b(?=[^>]*name=["']robots["'])(?=[^>]*content=["'][^"']*noindex)[^>]*>/i.test(html))findings.push({url:p.finalUrl,issue:'Previously indexable URL has a noindex directive'});
  if(!sitemap.includes('<loc>'+p.finalUrl+'</loc>'))findings.push({url:p.finalUrl,issue:'Live URL absent from proposed sitemap'});
}
const report={checkedAt:new Date().toISOString(),site,releaseDirectory:root,baseline:resolve(baseline),baselineCollectedAt:snapshot.collectedAt,baselineUrls:pages.length,ok:findings.length===0,limitations:'Read-only path, canonical, robots-meta and sitemap check; does not verify every asset, redirect, factual claim, indexed URL or form. Refresh the live baseline before a later release.',findings};
const output=arg('--output',`docs/seo-geo-2026-09-06/release-coverage-${site}.json`);
mkdirSync(dirname(output),{recursive:true});writeFileSync(output,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({site,baselineUrls:pages.length,ok:report.ok,findings:findings.length,examples:findings.slice(0,5),output},null,2));
if(!report.ok)process.exitCode=1;
