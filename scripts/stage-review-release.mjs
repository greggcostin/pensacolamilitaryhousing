// Review text only; no application build and no source-working-tree deployment.
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {json,save,stageBaseline,inventory,walk} from './isolated-release-lib.mjs';
import {syncReviewText,reviewCheckDate} from './review-counts-lib.mjs';
import {assessReviewObservation} from './review-monitor-lib.mjs';
const arg=k=>process.argv.includes(k)?process.argv[process.argv.indexOf(k)+1]:null;
const dir=arg('--directory'),proofFile=arg('--baseline'),observationFile=arg('--observation');
if(!dir||!proofFile||!observationFile)throw Error('Provide --directory, --baseline and --observation');
if(existsSync(join(dir,'deployment.json')))throw Error('Published release is immutable');
const snapshot=json('content/reviews/ratings.json'),observation=json(observationFile),assessment=assessReviewObservation(observation,snapshot,{confirmDecrease:process.argv.includes('--confirm-decrease')});
save(join(dir,'assessment.json'),assessment);if(!assessment.ok)throw Error(assessment.reasons.join('; '));
if(!assessment.changed&&!process.argv.includes('--repair-references')){save(join(dir,'result.json'),{checkedAt:new Date().toISOString(),status:'unchanged',counts:assessment.counts});console.log('Counts unchanged; no publication needed.');process.exit(0);}
const proof=json(proofFile),candidate=resolve('.coast-release/reviews-'+new Date().toISOString().replace(/[:.]/g,'-'));
stageBaseline(proof,candidate);
const verifiedAt=reviewCheckDate(observation);
for(const s of proof.sites)for(const f of walk(join(candidate,s.site)).filter(f=>/\.(?:html|txt|js|json)$/.test(f)&&!f.replaceAll('\\','/').includes('/pagefind/'))){const old=readFileSync(f,'utf8'),next=syncReviewText(old,assessment.counts,verifiedAt);if(old!==next)writeFileSync(f,next);}
// Pagefind contains review excerpts; regenerate it from the complete staged military inventory.
const run=spawnSync(process.execPath,['node_modules/pagefind/lib/runner/bin.cjs','--site',join(candidate,'pmh'),'--output-subdir','pagefind','--force-language','en'],{encoding:'utf8',maxBuffer:8*1024*1024});if(run.status)throw Error(run.stderr||run.stdout);
const record={...inventory(proof,candidate),releaseKind:'verified-review-counts',releaseMessage:`Verified review totals: Google ${assessment.counts.google}, Zillow ${assessment.counts.zillow}`,counts:assessment.counts,previousSnapshot:snapshot,observation,confirmedDecrease:process.argv.includes('--confirm-decrease')};save(join(dir,'candidate.json'),record);
console.log(JSON.stringify({candidate,counts:record.counts,combined:record.counts.google+record.counts.zillow,changes:record.changes.length,preserved:record.preserved,removed:record.removed},null,2));
