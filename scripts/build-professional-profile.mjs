// Visible profile content uses the exact same renderer as the React and prerendered About page.
import {readFileSync,writeFileSync} from 'node:fs';
import {professionalProfileHtml} from '../src/professionalProfile.js';
const file='civilian-site/team.html',before=readFileSync(file,'utf8');
const marker=/<!-- PROFESSIONAL_RECORD_START -->[\s\S]*?<!-- PROFESSIONAL_RECORD_END -->/;
const block='<!-- PROFESSIONAL_RECORD_START -->\n'+professionalProfileHtml()+'\n<!-- PROFESSIONAL_RECORD_END -->';
let after;
if(marker.test(before))after=before.replace(marker,block);
else {if((before.match(/<\/main>/g)||[]).length!==1)throw Error('Expected one civilian profile main element');after=before.replace('</main>',block+'\n</main>');}
if(after!==before){if(process.argv.includes('--check'))throw Error('Civilian professional record is stale; run build-professional-profile.mjs');writeFileSync(file,after);}
console.log('Professional profile '+(after===before?'verified':'updated')+'; HTML and React share one renderer.');
