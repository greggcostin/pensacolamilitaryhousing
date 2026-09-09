// Match explicit platform phrases, including older counts missed by previous syncs.
export const REVIEW_COUNT_PATTERNS = {
  google: ['{n} five-star Google reviews', '{n} Google reviews', 'Read All {n} Reviews on Google', 'Google Business Profile 5.0 stars from {n} reviews', '5.0 stars across {n} Google and', '5.0-star Google rating from {n} verified reviews', '{n} verified Google reviews', 'Google Business Profile ({n} reviews)'],
  zillow: ['{n} Zillow team reviews', '{n} Zillow reviews', 'Read All {n} Reviews on Zillow', 'Zillow agent profile ({n} reviews)', 'Agent 5.0 stars from {n} reviews'],
  combined: ['{n} five-star reviews across Google and Zillow', '5.0 stars across {n} reviews', '{n} Google and Zillow reviews', '{n} Google/Zillow reviews'],
};
const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export function validateCount(value) {
  if (!Number.isSafeInteger(value) || value < 0) throw new Error('Review counts must be nonnegative whole numbers.');
  return value;
}
export function syncReviewText(text, counts) {
  validateCount(counts.google); validateCount(counts.zillow);
  const totals = {...counts, combined: counts.google + counts.zillow};
  for (const [platform, patterns] of Object.entries(REVIEW_COUNT_PATTERNS)) {
    for (const pattern of patterns) {
      const [before,after] = pattern.split('{n}');
      const match = new RegExp('(' + escapeRegex(before) + ')\\d+(?=' + escapeRegex(after) + ')', 'gi');
      text = text.replace(match, (_,prefix) => prefix + totals[platform]);
    }
  }
  return text.replace(/(data-review-count="(google|zillow|combined)"[^>]*>)\d+(?=<)/g, (_,open,platform) => open + totals[platform]);
}
