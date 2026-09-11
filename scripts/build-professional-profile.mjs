// Visible profile content uses the exact same renderer as the React and prerendered About page.
import {readFileSync,writeFileSync} from 'node:fs';
import {professionalProfileHtml} from '../src/professionalProfile.js';
import {civilianBiographyHtml} from '../src/biography.js';
const arg=process.argv.indexOf('--root');
const file=(arg<0?'civilian-site':process.argv[arg+1])+'/team.html',before=readFileSync(file,'utf8');
const marker=/<!-- PROFESSIONAL_RECORD_START -->[\s\S]*?<!-- PROFESSIONAL_RECORD_END -->/;
const block='<!-- PROFESSIONAL_RECORD_START -->\n'+professionalProfileHtml()+'\n<!-- PROFESSIONAL_RECORD_END -->';
let after;
if(marker.test(before))after=before.replace(marker,block);
else {if((before.match(/<\/main>/g)||[]).length!==1)throw Error('Expected one civilian profile main element');after=before.replace('</main>',block+'\n</main>');}
const bioMarker=/<!-- BIOGRAPHY_START -->[\s\S]*?<!-- BIOGRAPHY_END -->/;
const bioBlock='<!-- BIOGRAPHY_START -->\n'+civilianBiographyHtml()+'\n<!-- BIOGRAPHY_END -->';
if(bioMarker.test(after))after=after.replace(bioMarker,bioBlock);
else {
 const anchor='<h2 id="guide-section-1">';
 if(!after.includes(anchor))throw Error('Civilian biography insertion anchor missing');
 after=after.replace(anchor,bioBlock+'\n'+anchor);
}
after=after.replace('<h1>The Costin Team</h1>','<h1>Gregg Costin and The Costin Team</h1>');
after=after.replace(/<p class="lead">[\s\S]*?<\/p>/,'<p class="lead">Buyer and seller representation across Pensacola, the Emerald Coast and coastal Alabama.</p>');
if(after!==before){if(process.argv.includes('--check'))throw Error('Civilian professional record is stale; run build-professional-profile.mjs');writeFileSync(file,after);}
console.log('Professional profile '+(after===before?'verified':'updated')+'; HTML and React share one renderer.');
