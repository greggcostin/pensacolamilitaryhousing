// Static review-count sync for both websites and their source fragments.
// This does not fetch reviews, change ratings, publish sites, or schedule a task.
// --current: print snapshot; --check: detect drift; --sync: repair from snapshot.
// --set-google N --set-zillow N: apply source-verified counts, then repair references.
// --force allows a decrease after a second public read confirms the lower count.
// The count alone does not establish why it changed.
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { syncReviewText, validateCount, reviewCheckDate } from './review-counts-lib.mjs';
const snapshotFile = 'content/reviews/ratings.json';
const snapshot = existsSync(snapshotFile) ? JSON.parse(readFileSync(snapshotFile,'utf8')) : null;
function currentCounts() {
  if (snapshot) return {google:validateCount(snapshot.google.count), zillow:validateCount(snapshot.zillow.count)};
  const html = readFileSync('public/reviews.html','utf8');
  const google = html.match(/(\d+) Google Reviews/i), zillow = html.match(/(\d+) Zillow Reviews/i);
  if (!google || !zillow) throw new Error('Cannot read existing Google and Zillow counts.');
  return {google:Number(google[1]), zillow:Number(zillow[1])};
}
function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir,{withFileTypes:true}).flatMap(entry => {
    const path = dir + '/' + entry.name;
    if (['node_modules','.git','dist'].includes(entry.name)) return [];
    return entry.isDirectory() ? walk(path) : /\.(html|txt|md|jsx)$/.test(entry.name) ? [path] : [];
  });
}
const args = process.argv.slice(2);
try {
  const current = currentCounts();
  if (args.includes('--current')) { console.log(JSON.stringify({...current,combined:current.google+current.zillow})); process.exit(0); }
  const counts = {...current}, supplied = [];
  for (const platform of ['google','zillow']) {
    const at = args.indexOf('--set-' + platform);
    if (at < 0) continue;
    if (!/^\d+$/.test(args[at+1] || '')) throw new Error('--set-' + platform + ' requires a nonnegative whole number.');
    counts[platform] = validateCount(Number(args[at+1]));
    supplied.push(platform);
    if (counts[platform] < current[platform] && !args.includes('--force')) throw new Error(platform + ' count decreased. Verify the source, then use --force if the decrease is correct.');
  }
  const check = args.includes('--check');
  if (!check && !args.includes('--sync') && !supplied.length) throw new Error('Use --current, --check, --sync, or --set-google N / --set-zillow N.');
  if (check && supplied.length) throw new Error('--check uses the saved snapshot; do not combine it with --set flags.');
  const files = [...walk('public'),...walk('civilian-site'),...walk('content/pages'),
    'index.html','MARKETING_KIT.md','AGGREGATOR_PROFILES.md','src/App.jsx'].filter(existsSync);
  const changes = [];
  const verifiedAt=['google','zillow'].every(p=>snapshot?.[p]?.countStatus==='verified-public-browser')?reviewCheckDate(snapshot):undefined;
  for (const file of files) {
    const before = readFileSync(file,'utf8'), after = syncReviewText(before,counts,verifiedAt);
    if (before !== after) changes.push({file,after});
  }
  if (check) {
    console.log(JSON.stringify({counts,combined:counts.google+counts.zillow,findings:changes.map(change=>change.file)},null,2));
    process.exit(changes.length ? 1 : 0);
  }
  for (const {file,after} of changes) writeFileSync(file,after);
  if (snapshot && supplied.length) {
    for (const platform of supplied) {
      snapshot[platform].count = counts[platform];
      snapshot[platform].countStatus = 'operator-synced';
      snapshot[platform].checkedAt = new Date().toISOString().slice(0,10);
      snapshot[platform].evidence = 'Count supplied to review-counts.mjs after source verification by the operator. Preserve detailed verification evidence in the review monitor log.';
    }
    writeFileSync(snapshotFile,JSON.stringify(snapshot,null,2)+'\n');
  }
  console.log(JSON.stringify({counts,combined:counts.google+counts.zillow,changed:changes.map(change=>change.file)},null,2));
} catch (error) { console.error(error.message); process.exitCode = 1; }
