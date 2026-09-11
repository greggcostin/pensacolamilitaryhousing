// Exercise count-only changes against a complete candidate entirely in memory.
import {readFileSync} from 'node:fs';
import {join,relative} from 'node:path';
import {json,save,walk,fingerprint} from './isolated-release-lib.mjs';
import {syncReviewText,reviewCheckDate} from './review-counts-lib.mjs';
const dir=process.argv[2];if(!dir)throw Error('Provide the release evidence directory');
const c=json(join(dir,'candidate.json')),beforeFingerprint=fingerprint(c.candidate);
const ratings=json('content/reviews/ratings.json'),current={google:ratings.google.count,zillow:ratings.zillow.count};
const simulated={google:current.google+1,zillow:current.zillow+1},verifiedAt=reviewCheckDate(ratings),changed=[],findings=[];
for(const site of ['gc','pmh'])for(const file of walk(join(c.candidate,site)).filter(f=>/\.(html|txt)$/.test(f))){
 const before=readFileSync(file,'utf8'),after=syncReviewText(before,simulated,verifiedAt),restored=syncReviewText(after,current,verifiedAt);
 const path=relative(join(c.candidate,site),file).replaceAll('\\','/');
 if(before!==restored)findings.push({site,path});
 if(before!==after)changed.push({site,path});
}
const result={checkedAt:new Date().toISOString(),scope:'Synthetic counts used only in memory. No public observations, ratings, dates, candidate files or provider state written.',candidateFingerprint:beforeFingerprint,simulated,affectedFiles:changed,roundTripFindings:findings,candidateUnchanged:beforeFingerprint===fingerprint(c.candidate)};
result.ok=!findings.length&&result.candidateUnchanged&&changed.length>0;
save(join(dir,'review-rehearsal.json'),result);console.log(JSON.stringify(result));if(!result.ok)process.exitCode=1;
