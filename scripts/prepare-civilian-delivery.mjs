// Last build step after content/design generators, before civilian audit and publication.
// --restore rehydrates the editable styles before editing a captured production checkout.
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {resolve,join,relative} from 'node:path';
import {spawnSync} from 'node:child_process';
import {walk} from './isolated-release-lib.mjs';
import {bundleCivilianStyles,unbundleCivilianStyles} from './civilian-style-bundle.mjs';
import {responsiveHeaderLogos} from './responsive-logo-lib.mjs';
import {preloadCivilianHomeHero} from './civilian-home-preload.mjs';
const i=process.argv.indexOf('--root');if(i<0)throw Error('Provide --root with a complete civilian candidate');
const root=resolve(process.argv[i+1]);if(!existsSync(join(root,'index.html')))throw Error('Missing civilian homepage');
const restore=process.argv.includes('--restore');
if(!restore){const r=spawnSync(process.execPath,['scripts/build-photography-credits.mjs','--site','gc','--root',root],{encoding:'utf8'});if(r.status)throw Error(r.stderr||r.stdout);}
if(!restore){const r=spawnSync(process.execPath,['scripts/generate-responsive-images.mjs','--gc-root',root,'--logos-only'],{encoding:'utf8'});if(r.status)throw Error(r.stderr||r.stdout);}
let changed=0;
for(const file of walk(root).filter(f=>f.endsWith('.html'))){
 const name=relative(root,file),old=readFileSync(file,'utf8');let html=unbundleCivilianStyles(old,root);
 if(!restore){
  html=responsiveHeaderLogos(html,root);
  if(name==='index.html')html=html.replace(/(<div class="gc-hero-image">[\s\S]*?<img\b[^>]*)(>)/,(_,tag,end)=>tag.replace(/\sfetchpriority="[^"]*"/g,'')+' fetchpriority="high"'+end);
  if(name!=='buy.html')html=(await bundleCivilianStyles(html,root,{inline:['index.html','neighborhoods.html','schools.html'].includes(name)})).html;
  if(name==='index.html')html=preloadCivilianHomeHero(html);
 }
 if(html!==old){writeFileSync(file,html);changed++;}
}
console.log(`${restore?'Restored editable styles in':'Prepared delivery for'} ${changed} pages. Run audit-civilian before publication.`);
