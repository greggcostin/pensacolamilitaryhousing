// Verify count repair without changing the site's real review snapshot.
import assert from 'node:assert/strict';
import { REVIEW_COUNT_PATTERNS, syncReviewText, validateCount } from './review-counts-lib.mjs';
const counts = {google:57,zillow:27}, totals = {...counts,combined:84};
for (const [platform,patterns] of Object.entries(REVIEW_COUNT_PATTERNS)) {
  for (const pattern of patterns) {
    const stale = pattern.replace('{n}','19');
    assert.equal(syncReviewText(stale,counts),pattern.replace('{n}',String(totals[platform])));
  }
}
const mixed = '<strong data-review-count="combined">90</strong> 54 Google Reviews; 25 Zillow reviews. BAH $2,700. 90+ guides. 57 homes. 5.0 stars.';
assert.equal(syncReviewText(mixed,counts),'<strong data-review-count="combined">84</strong> 57 Google Reviews; 27 Zillow reviews. BAH $2,700. 90+ guides. 57 homes. 5.0 stars.');
assert.equal(syncReviewText(syncReviewText(mixed,counts),counts),syncReviewText(mixed,counts));
assert.equal(syncReviewText('0 Google reviews; 0 Zillow reviews',{google:0,zillow:0}),'0 Google reviews; 0 Zillow reviews');
for (const bad of [NaN,Infinity,-1,2.5,'57']) assert.throws(()=>validateCount(bad));
console.log('PASS: platform totals, stale-reference repair, unrelated numbers, idempotence, zero, and invalid inputs.');
