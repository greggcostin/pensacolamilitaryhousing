import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {schoolAudience,withSchoolAudience} from './school-audience-lib.mjs';
const arg=(name,fallback)=>{const i=process.argv.indexOf(name);return i<0?fallback:process.argv[i+1];};
for(const [site,root] of [['gc',arg('--gc-root','civilian-site')],['pmh',arg('--pmh-root','public')]]){
 for(const school of schoolAudience.schools){const route='/schools/'+school.slug,file=join(root,route+'.html'),before=readFileSync(file,'utf8');
  const after=withSchoolAudience(before,route,site);if(after!==before)writeFileSync(file,after);
 }
}
console.log('Prepared six school guides in both editions with shared academic facts and distinct planning guidance.');
