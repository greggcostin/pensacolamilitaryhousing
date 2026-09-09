import test from 'node:test';
import assert from 'node:assert/strict';
import {routeStructuredData} from '../src/routeSchema.js';
import {ROUTE_META,SITE} from '../src/routeMeta.js';
import {IDS} from './entity-lib.mjs';
import {readFileSync} from 'node:fs';
test('all five direct interior shells describe their own page without a homepage WebPage or services',()=>{
 for(const meta of ROUTE_META.filter(m=>m.shell)){
  const html=readFileSync(`dist/${meta.file}.html`,'utf8');
  const nodes=[...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].flatMap(m=>{const j=JSON.parse(m[1]);return j['@graph']||[j]});
  const pages=nodes.filter(n=>['WebPage','ProfilePage'].includes(n['@type']));
  assert.equal(pages.length,1,meta.slug);assert.equal(pages[0].url,SITE+meta.slug);
  assert.ok(!nodes.some(n=>n['@type']==='Service'),meta.slug);
  assert.deepEqual(pages[0],routeStructuredData(meta).page);
 }
});
test('the About page identifies the same Gregg entity used by both domains',()=>{
 const data=routeStructuredData(ROUTE_META.find(m=>m.page==='about'));
 assert.equal(data.page['@type'],'ProfilePage');assert.equal(data.page.mainEntity['@id'],IDS.person);
});
test('FAQ markup follows the PCS route and is absent on other SPA routes',()=>{
 for(const meta of ROUTE_META.filter(m=>m.shell||m.page==='home'))assert.equal(Boolean(routeStructuredData(meta).faq),meta.page==='pcs',meta.slug);
});
