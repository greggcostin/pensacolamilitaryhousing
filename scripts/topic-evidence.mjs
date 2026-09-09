// Editorial relevance is separate from demand. Never turn autocomplete into facts.
export function topicEligibility(query, domainTerms) {
  const q = query.toLowerCase();
  const escape = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (!domainTerms.some(term => new RegExp(`\\b${escape(term)}\\b`, 'i').test(q))) return {eligible:false,reason:'outside_homeownership'};
  if (/\b(indeed|jobs?|careers?|salary|salaries|employment|part time|full time|car insurance|auto insurance|life insurance|health insurance|hotel|resort|vacation package|sterilizing|sterilising|customer service|appraisal license|appraiser license)\b/.test(q) || /how many people live/.test(q)) return {eligible:false,reason:'unrelated_search_intent'};
  const review = [];
  if (/\b(why|how)\b.*\b(cheap|safe|best|worst|guaranteed)\b/.test(q)) review.push('Verify the premise; reframe neutrally if unsupported.');
  if (/\b(safest|safe|best|worst|good)\b.*\b(neighborhood|communit|famil|senior|retire)/.test(q) || /\b(best|good)\b.*\bfor (families|seniors|retirees)\b/.test(q)) review.push('Use objective property and program criteria; do not rank residents or steer by protected characteristics.');
  return {eligible:true,requiresEditorialReview:review.length>0,review};
}

export function sourceTotals(members) {
  const totals = {};
  for (const m of members) for (const [source,n] of Object.entries(m.impressionsBySource || {})) {
    if (Number.isFinite(n) && n >= 0) totals[source] = (totals[source] || 0) + n;
  }
  return totals;
}
