// Check maintained draft/evidence contracts before a full site build. These
// checks do not substitute for reading sources or performing editorial review.
import {listFragments} from './blog-lib.mjs';
import {isModern,readResearch,validateEditorial} from './blog-editorial-lib.mjs';
import {validateMilitaryEditorial} from './military-editorial-lib.mjs';

const selected=process.argv[2]?[process.argv[2]]:['gc','pmh'];
let checked=0;const findings=[];
for(const site of selected){
 if(!['gc','pmh'].includes(site))throw Error('Choose gc or pmh');
 for(const {spec,body} of listFragments(site)){
  if(!isModern(spec))continue;
  const research=readResearch(spec.slug,site);
  const result=site==='pmh'?validateMilitaryEditorial(spec,body,research):validateEditorial(spec,body,research);
  checked++;
  for(const error of result.errors)findings.push({site,slug:spec.slug,error});
 }
}
console.log(JSON.stringify({ok:!findings.length,reviewedDraftsChecked:checked,findings},null,2));
if(findings.length)process.exitCode=1;
