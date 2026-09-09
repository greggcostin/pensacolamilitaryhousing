import assert from 'node:assert/strict';
import {assessReviewObservation} from './review-monitor-lib.mjs';
const now=Date.now(),snapshot={google:{url:'https://google.example/profile',count:56},zillow:{url:'https://zillow.example/profile',count:27}};
const evidence={};for(const p of ['google','zillow'])evidence[p]={url:snapshot[p].url,count:snapshot[p].count,rating:5,fiveStarCount:snapshot[p].count,status:'verified-public-browser',checkedAt:new Date(now).toISOString(),evidence:'Exact public profile read and five-star coverage verified.'};
assert.deepEqual(assessReviewObservation(evidence,snapshot,{now}).counts,{google:56,zillow:27});
assert.equal(assessReviewObservation(evidence,snapshot,{now}).changed,false);
for(const mutate of [o=>o.google.status='blocked',o=>o.google.url+='wrong',o=>o.google.checkedAt='2020-01-01',o=>o.google.count=-1,o=>o.google.rating=4.9,o=>o.google.fiveStarCount=55,o=>{o.google.count=100;o.google.fiveStarCount=100;}]){const o=structuredClone(evidence);mutate(o);assert.equal(assessReviewObservation(o,snapshot,{now}).ok,false);}
const down=structuredClone(evidence);down.google.count=down.google.fiveStarCount=55;assert.equal(assessReviewObservation(down,snapshot,{now}).ok,false);assert.equal(assessReviewObservation(down,snapshot,{now,confirmDecrease:true}).ok,true);
const up=structuredClone(evidence);up.google.count=up.google.fiveStarCount=57;assert.equal(assessReviewObservation(up,snapshot,{now}).changed,true);
console.log('PASS: blocked sources, wrong identity, freshness, counts, ratings, anomaly and decrease guards, unchanged and increase decisions.');
