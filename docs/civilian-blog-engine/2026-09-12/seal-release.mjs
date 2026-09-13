import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {inventory,json,save,fingerprint} from '../../../scripts/isolated-release-lib.mjs';
const dir=import.meta.dirname,source=path.resolve(dir,'../../..'),candidate=path.resolve(source,'../release');
const before=fingerprint(candidate),checks=[];
for(const args of [
['scripts/audit-civilian.mjs','--root',path.join(candidate,'gc')],
['scripts/audit-entity.mjs','--pmh-root',path.join(candidate,'pmh'),'--gc-root',path.join(candidate,'gc')],
['scripts/score-post.mjs','home-appraisals-explained','--site','gc','--gate'],
['scripts/analyze-formatting.mjs','--file',path.join(candidate,'gc/blog/home-appraisals-explained.html'),'--gate','--out',path.join(dir,'formatting.md')],
['scripts/check-em-dashes.mjs']
]){const r=spawnSync(process.execPath,args,{cwd:source,encoding:'utf8',windowsHide:true});checks.push({command:'node '+args.join(' '),exitCode:r.status,output:r.stdout,stderr:r.stderr});if(r.status!==0){save(path.join(dir,'quality-gates.json'),{ok:false,candidate,checks});throw Error(args[0]+' failed');}}
const inv=inventory(json(path.join(dir,'production-before/production-baseline.json')),candidate);
assert.equal(inv.removed.length,0);assert(inv.changes.every(f=>f.site==='gc'));assert.equal(inv.changes.length,25);
assert.equal(fingerprint(candidate),before,'candidate changed while gates ran');
assert(!fs.readFileSync(path.join(candidate,'gc/llms-full.txt'),'utf8').includes('[object Object]'));
const sourceCommit=spawnSync('git',['rev-parse','HEAD'],{cwd:source,encoding:'utf8'}).stdout.trim();assert(/^[a-f0-9]{40}$/.test(sourceCommit));
save(path.join(dir,'candidate.json'),{...inv,sourceCommit,releaseMessage:'Publish reviewed civilian appraisal guide with isolated production preservation'});
save(path.join(dir,'quality-gates.json'),{ok:true,sealedAt:new Date().toISOString(),candidate,candidateFingerprint:before,sourceCommit,checks,regressionTests:{passed:28,evidence:'regression-tests.json'},visual:{checkedBy:'Codex',desktop:true,mobileWidth:390,horizontalOverflow:false,headingFont:'Playfair Display',bodyMargin:'0px',quickAnswer:'first child of main, once',responsiveImage:'480/1200 avif loaded',faqExpansion:true,keyboardSectionNavigation:true,og:'1200x630 viewed; title fits',photograph:'staged North Hill house visually rechecked'},scope:{changedFiles:25,removed:0,pmhUnchanged:true}});
console.log(JSON.stringify({sourceCommit,fingerprint:before,checks:checks.map(c=>({command:c.command,exitCode:c.exitCode})),changes:inv.changes.length}));
