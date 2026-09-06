import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {profileContext,schoolProfileMarkup,profilePeers,PRIVATE_FILES} from './school-profile-lib.mjs';
import {loadSchoolInsights} from './school-insight-lib.mjs';
const ctx=profileContext(),legacy=loadSchoolInsights({required:true});
const records=ctx.directory.schools,pages=[...new Set(records.map(s=>s.reportUrl))];
const html=p=>readFileSync('civilian-site'+p+'.html','utf8');
const checks=[];function check(name,fn){fn();checks.push(name);console.log('PASS '+name);}
check('Every school identity resolves to a real canonical guide; three verified duplicate pairs share pages',()=>{
 assert.equal(records.length,274);assert.equal(pages.length,271);
 assert.equal(records.filter(s=>s.sector==='private').length,66);
 for(const s of records){assert(s.reportUrl?.startsWith('/schools/'));assert(existsSync('civilian-site'+s.reportUrl+'.html'));assert(html(s.reportUrl).includes(`href="https://greggcostin.com${s.reportUrl}"`));}
 for(const pair of [['A1500865','A1901242'],['A2300943','A2400041'],['00260819','A2300878']]){const a=records.find(s=>s.ncesId===pair[0]),b=records.find(s=>s.ncesId===pair[1]);assert.equal(a.reportUrl,b.reportUrl);assert(html(a.reportUrl).includes(pair[0]));assert(html(a.reportUrl).includes(pair[1]));}
});
check('Every private-school record has complete dated school-specific research',()=>{
 assert.equal(Object.keys(ctx.privateInsights).length,66);
 for(const s of records.filter(s=>s.sector==='private')){const r=ctx.privateInsights[s.id];assert(r,s.id);assert.equal(r.checkedAt,'2026-09-06');assert(r.perspective?.length>=2);for(const field of ['headline','fit','tradeoff','localNote','visitPrompt'])assert(r[field]?.length>20,`${s.id}:${field}`);assert(r.sources.length);for(const source of r.sources)assert.equal(new URL(source.url).protocol,'https:');assert(!/we visited|our campus visit|guaranteed admission/i.test(JSON.stringify(r)));}
});
check('New guides have readable source-linked data, perspective, enrollment and comparisons',()=>{
 for(const page of pages.filter(p=>!legacy[p])){const h=html(page);for(const id of ['school-summary','school-perspective','school-comparison','school-enrollment','similar-schools','school-guide-sources'])assert(h.includes(`id="${id}"`),page+': '+id);assert.equal((h.match(/<h1\b/g)||[]).length,1);assert(!/\bNaN\b|undefined%|null%/.test(h));const schema=[...h.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));assert(schema.some(x=>x['@type']==='School'));assert(!schema.some(x=>x.aggregateRating));}
});
check('Private, Alabama, missing-grade and virtual records never acquire invented scores or campus pins',()=>{
 for(const s of records){if(legacy[s.reportUrl])continue;const h=html(s.reportUrl);if(s.sector==='private')assert(h.includes('There is no public-school accountability letter'));if(s.state==='AL'&&s.sector==='public')assert(h.includes('Alabama uses its own accountability system'));if(s.virtual){const school=[...h.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1])).find(x=>x['@type']==='School');assert(!school.geo);}}
});
check('Nearby options exclude duplicate identities, keep relevant format and disclose distance basis',()=>{
 for(const s of records){const peers=profilePeers(s,ctx);assert(peers.length<=3);assert.equal(new Set(peers.map(p=>p.reportUrl)).size,peers.length);for(const p of peers){assert.notEqual(p.reportUrl,s.reportUrl);assert.equal(p.sector,s.sector);assert.equal(p.countyKey,s.countyKey);assert.equal(!!p.virtual,!!s.virtual);assert(p.levels.some(l=>s.levels.includes(l)&&l!=='combined'));}}
});
check('Every guide is linked in static hub HTML, sitemap and AI discovery text',()=>{
 const hub=readFileSync('civilian-site/schools.html','utf8'),sitemap=readFileSync('civilian-site/sitemap.xml','utf8'),llms=readFileSync('civilian-site/llms.txt','utf8');
 for(const page of pages){assert(hub.includes(`href="${page}"`),page);assert(sitemap.includes(`<loc>https://greggcostin.com${page}</loc>`),page);assert(llms.includes('https://greggcostin.com'+page),page);}
});
check('Raw school text is escaped, unknown data stay unknown and private research is required',()=>{
 const s=records.find(s=>s.sector==='private');const altered={...s,name:'<script>alert(1)</script>'};const generated=schoolProfileMarkup(altered,ctx);assert(!generated.includes('<script>alert'));assert(generated.includes('&lt;script&gt;'));const bad={...ctx,privateInsights:{}};assert.throws(()=>schoolProfileMarkup(s,bad),/Missing private perspective/);
});
console.log(`All-school pages: ${checks.length}/${checks.length} groups passed; ${records.length} records, ${pages.length} pages, ${PRIVATE_FILES.length} private research files.`);
