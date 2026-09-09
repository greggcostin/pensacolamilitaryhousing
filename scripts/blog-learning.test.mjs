import test from 'node:test';
import assert from 'node:assert/strict';
import {assessExperiment} from './blog-learning.mjs';
import {topicEligibility,sourceTotals} from './topic-evidence.mjs';
const e={id:'test',site:'gc',deployedAt:'2026-08-01',minimumFollowupDays:28,minimumSessionsPerWindow:200,minimumOutcomesAcrossWindows:10,baselineWindow:{start:'2026-07-04',end:'2026-07-31'},followupWindow:{start:'2026-08-01',end:'2026-08-28'}};
const provenance={availability:'observed',source:'GA4 + qualified CRM aggregate v1',hostnameFilters:['greggcostin.com','www.greggcostin.com'],sessionDefinition:'GA4 Sessions',qualificationDefinition:'Documented two-way conversation meeting agreed buying or selling criteria',deduplication:'One qualified person per window',attribution:'First accepted website inquiry'};
const data={availability:'verified',windows:[{...provenance,site:'gc',...e.baselineWindow,sessions:300,qualifiedConversations:5},{...provenance,site:'gc',...e.followupWindow,sessions:300,qualifiedConversations:8}]};
test('prepared changes and unconnected outcomes cannot generate a lesson',()=>{assert.equal(assessExperiment({...e,deployedAt:null},data,'2026-09-06').status,'awaiting_deployment');assert.equal(assessExperiment(e,{availability:'not_connected'},'2026-09-06').status,'data_gap');});
test('short, overlapping or sparse windows remain inconclusive',()=>{assert.equal(assessExperiment(e,data,'2026-08-20').status,'collecting');assert.equal(assessExperiment(e,{...data,windows:data.windows.map(w=>({...w,sessions:30}))},'2026-09-06').status,'inconclusive');assert.equal(assessExperiment({...e,followupWindow:e.baselineWindow},data,'2026-09-06').status,'inconclusive');});
test('enough data supports human review, not a causal success label',()=>{const x=assessExperiment(e,data,'2026-09-06');assert.equal(x.status,'review_candidate');assert.equal(x.beforeRate,5/300);assert.match(x.reason,/not a causal test/);});
test('mixed sites, unknown sources and changed definitions cannot create a lesson',()=>{
 for(const change of [{hostnameFilters:['greggc.levinrinkerealty.com']},{source:null},{qualificationDefinition:'All button clicks'},{availability:'missing'}]){
  assert.equal(assessExperiment(e,{...data,windows:[data.windows[0],{...data.windows[1],...change}]},'2026-09-06').status,'inconclusive');
 }
});
test('invalid dates and baselines after deployment are rejected',()=>{
 assert.equal(assessExperiment({...e,deployedAt:'2026-02-30'},data,'2026-09-06').status,'inconclusive');
 assert.equal(assessExperiment({...e,deployedAt:'2026-07-15'},data,'2026-09-06').status,'inconclusive');
 const invalid={start:'2026-07-xx',end:'2026-07-31'};
 assert.equal(assessExperiment({...e,baselineWindow:invalid},{...data,windows:[{...data.windows[0],...invalid},data.windows[1]]},'2026-09-06').status,'inconclusive');
});
test('substring and unrelated autosuggest noise never enter the housing radar',()=>{for(const q of ['indeed pensacola','average car insurance florida','fort walton beach part time jobs']) assert.equal(topicEligibility(q,['deed','insurance','home']).eligible,false,q);assert.equal(topicEligibility('cost of title insurance in florida',['deed','insurance','home']).eligible,true);});
test('loaded insurance premises require editorial review before queueing',()=>{assert.equal(topicEligibility('why florida home insurance is cheap',['home','insurance']).requiresEditorialReview,true);});
test('query cluster totals stay separate by site',()=>{assert.deepEqual(sourceTotals([{impressionsBySource:{'wmt-pmh':10,'wmt-gc':20}},{impressionsBySource:{'wmt-gc':30}}]),{'wmt-pmh':10,'wmt-gc':50});});
