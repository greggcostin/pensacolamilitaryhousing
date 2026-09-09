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
export function reviewCheckDate(observation){
  const dates=['google','zillow'].map(p=>Date.parse(observation?.[p]?.checkedAt));
  if(dates.some(d=>!Number.isFinite(d)))throw Error('Both review sources need a recorded verification date');
  return new Date(Math.min(...dates)).toISOString();
}
export function reviewSourceNote(verifiedAt){
  if(!Number.isFinite(Date.parse(verifiedAt)))throw Error('A recorded review verification date is required');
  const date=new Intl.DateTimeFormat('en-US',{year:'numeric',month:'long',day:'numeric',timeZone:'America/Chicago'}).format(new Date(verifiedAt));
  return `Google and Zillow counts checked against their public profiles on ${date} (Central Time). Review counts can change. Visit the profiles for the latest client feedback.`;
}
export function syncReviewText(text, counts, verifiedAt) {
  validateCount(counts.google); validateCount(counts.zillow);
  const totals = {...counts, combined: counts.google + counts.zillow};
  for (const [platform, patterns] of Object.entries(REVIEW_COUNT_PATTERNS)) {
    for (const pattern of patterns) {
      const [before,after] = pattern.split('{n}');
      const match = new RegExp('(' + escapeRegex(before) + ')\\d+(?=' + escapeRegex(after) + ')', 'gi');
      text = text.replace(match, (_,prefix) => prefix + totals[platform]);
    }
  }
  text=text.replace(/(data-review-count="(google|zillow|combined)"[^>]*>)\d+(?=<)/g, (_,open,platform) => open + totals[platform]);
  if(verifiedAt)text=text.replace(/(<p\b[^>]*class="gc-review-source-note"[^>]*>)[\s\S]*?(<\/p>)/g,(_,open,close)=>open+reviewSourceNote(verifiedAt)+close);
  return text;
}
