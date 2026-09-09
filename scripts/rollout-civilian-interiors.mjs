import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
import {withInteriorDesign} from './civilian-interior-design.mjs';
const files=[];
function walk(dir){for(const e of readdirSync(dir,{withFileTypes:true})){const p=join(dir,e.name);if(e.isDirectory())walk(p);else if(p.endsWith('.html'))files.push(p);}}
walk('civilian-site');
let changed=0;
for(const file of files){if(file.endsWith('404.html'))continue;const old=readFileSync(file,'utf8');const html=withInteriorDesign(old);if(html!==old){writeFileSync(file,html);changed++;}}
console.log(`Interior presentation: ${changed} updated pages. Original content, links, forms, metadata and schema retained.`);
