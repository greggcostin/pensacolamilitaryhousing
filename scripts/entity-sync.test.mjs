import test from 'node:test';
import assert from 'node:assert/strict';
import {refreshEntityHtml} from './entity-sync-lib.mjs';
import {IDS,SERVICES,personFull,teamFull,brokerageFull,personCompact,teamCompact,brokerageCompact,publisherRef} from './entity-lib.mjs';
const builders={personFull,teamFull,brokerageFull,personCompact,teamCompact,brokerageCompact,publisherRef};
const block=(data,kind='home')=>`<script type="application/ld+json" data-entity="entity-graph:${kind}">${JSON.stringify(data)}</script>`;
const parse=html=>JSON.parse(html.match(/<script[^>]*>([\s\S]*?)<\/script>/)[1]);
test('existing marked homepage receives corrected credentials and office facts',()=>{
 const old=block({'@context':'https://schema.org','@graph':[
  {...personFull(),hasCredential:[],sameAs:['https://old.example']},
  {...teamFull(),telephone:'old',address:{streetAddress:'old'}},brokerageFull()
 ]});
 const nodes=parse(refreshEntityHtml(old))['@graph'];
 assert.deepEqual(nodes,[personFull(),teamFull(),brokerageFull()]);
});
test('compact pages refresh after a source change and retain only one canonical record',()=>{
 const updated={...builders,personCompact:()=>({...personCompact(),name:'Changed fixture name'})};
 const old=block({'@context':'https://schema.org','@graph':[personCompact(),teamCompact(),brokerageCompact()]},'compact');
 const next=parse(refreshEntityHtml(old,{builders:updated}));
 assert.equal(next['@graph'][0].name,'Changed fixture name');
 assert.equal(next['@graph'].length,3);
});
test('an article keeps its author reference, review date and article-specific facts',()=>{
 const article={'@context':'https://schema.org','@type':'Article',headline:'Existing source-backed guide',dateModified:'2025-04-03',author:{'@id':IDS.person},publisher:{'@id':IDS.team,name:'Old publisher'},citation:['https://example.org/source']};
 const result=parse(refreshEntityHtml(block(article,'other')));
 assert.deepEqual(result,{...article,publisher:publisherRef()});
});
test('refresh is idempotent and leaves the #1 statement and page body unchanged',()=>{
 const original='<h1>Pensacola\'s #1 military relocation REALTOR®</h1>'+block({'@context':'https://schema.org','@graph':[personFull(),teamFull(),brokerageFull()]});
 assert.equal(refreshEntityHtml(original),original);
 assert.equal(refreshEntityHtml(refreshEntityHtml(original)),original);
});
test('invalid JSON-LD cannot be silently overwritten',()=>{
 assert.throws(()=>refreshEntityHtml('<script type="application/ld+json">{bad}</script>'),/Invalid JSON-LD/);
});
test('civilian services gain every county from the common service area, including Okaloosa',()=>{
 const html=block({'@context':'https://schema.org','@graph':[{'@type':'Service','@id':`https://greggcostin.com/#${SERVICES.gc[0].id}`,areaServed:[{'@type':'AdministrativeArea',name:'Wrong county'}]}]});
 const actual=parse(refreshEntityHtml(html,{site:'gc'}))['@graph'][0].areaServed;
 assert.ok(actual.some(a=>a.name==='Okaloosa County, FL'));
 assert.equal(actual.length,4);
 assert.ok(!actual.some(a=>a.name==='Wrong county'));
});
