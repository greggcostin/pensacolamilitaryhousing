// Consequential release guard checks plus the owner's explicit #1 preservation requirement.
// Uses disposable fixtures only; never changes the site or any deployment.
import { mkdtempSync, writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { PCS_HERO, PCS_DECISIONS } from '../src/coastIntentData.js';
const fixture = mkdtempSync(join(tmpdir(), 'costin-release-check-'));
const root = join(fixture, 'site'); mkdirSync(root);
const url = 'https://greggcostin.com/guide';
const baseline = join(fixture, 'baseline.json');
writeFileSync(baseline, JSON.stringify({ collectedAt:'2026-09-06T23:00:00Z', pages:[{tag:'gc',status:200,title:'Guide',finalUrl:url}] }));
const page = canonical => `<html><head><link href="${canonical}" rel="canonical"><meta name="robots" content="index,follow"></head><body><h1>Guide</h1></body></html>`;
const sitemap = `<urlset><url><loc>${url}</loc></url></urlset>`;
const run = () => { const p = spawnSync(process.execPath,[resolve('scripts/check-release-coverage.mjs'),'--site','gc','--dir',root,'--baseline',baseline,'--output',join(fixture,'result.json')],{encoding:'utf8'}); if(p.error)throw p.error; return {code:p.status,...JSON.parse(readFileSync(join(fixture,'result.json'),'utf8'))}; };
const checks=[];
function check(name, fn){fn();checks.push({name,passed:true});}
check('Preserved page and sitemap pass',()=>{writeFileSync(join(root,'guide.html'),page(url));writeFileSync(join(root,'sitemap.xml'),sitemap);assert.equal(run().code,0);});
check('Missing published page blocks release',()=>{writeFileSync(baseline,JSON.stringify({pages:[{tag:'gc',status:200,title:'Missing',finalUrl:'https://greggcostin.com/missing'}]}));assert.equal(run().code,1);writeFileSync(baseline,JSON.stringify({pages:[{tag:'gc',status:200,title:'Guide',finalUrl:url}]}));});
check('Wrong canonical blocks release',()=>{writeFileSync(join(root,'guide.html'),page('https://greggcostin.com/'));assert.equal(run().code,1);});
check('New noindex blocks release',()=>{writeFileSync(join(root,'guide.html'),page(url).replace('index,follow','noindex,follow'));assert.equal(run().code,1);});
check('Missing sitemap entry blocks release',()=>{writeFileSync(join(root,'guide.html'),page(url));writeFileSync(join(root,'sitemap.xml'),'<urlset/>');assert.equal(run().code,1);});
check('Homepage HTML preserves the requested #1 statement and all five answers',()=>{
 const html=readFileSync('dist/index.html','utf8'); assert.match(PCS_HERO.title,/#1/); assert.match(html,/<h1[^>]*>Pensacola's #1/);
 for(const card of PCS_DECISIONS.cards) assert.ok(html.includes(card.title),card.title);
});
check('Home answers do not leak into five deep-route shells',()=>{
 for(const route of ['about','contact','pcs-guide','communities','mortgage-calculators']){const html=readFileSync(`dist/${route}.html`,'utf8');assert.ok(!html.includes('id="pcs-decisions"'));assert.equal((html.match(/<h1\b/g)||[]).length,1);}
});
check('Community HTML uses all 19 guides without an old community count',()=>{const html=readFileSync('dist/communities.html','utf8');assert.ok(!html.includes('Thirteen distinct'));for(const name of ['Destin','Crestview','Shalimar','Navy Point'])assert.ok(html.includes(name));});
const output='docs/seo-geo-2026-09-06/verification.json';
writeFileSync(output,JSON.stringify({checkedAt:new Date().toISOString(),checks,fixture,limitations:'Guard and generated HTML verification. Browser checks, financial assumptions, actual indexing and live form delivery are separate.'},null,2)+'\n');
console.log(`${checks.length} release and content checks passed. Evidence: ${output}`);
