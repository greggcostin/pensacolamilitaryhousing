import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {linkBusinessRecord} from './identity-page-lib.mjs';
import {writeText} from './write-text-retry.mjs';
const walk=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(f=>f.isDirectory()?walk(`${dir}/${f.name}`):f.name.endsWith('.html')&&f.name!=='404.html'?[`${dir}/${f.name}`]:[]);
const files=['index.html',...walk('public'),...walk('civilian-site')];let changed=0;
for(const file of files){const before=readFileSync(file,'utf8'),after=linkBusinessRecord(before);if(after!==before){if(process.argv.includes('--check'))throw Error(`Business record link stale: ${file}`);await writeText(file,after);changed++;}}
console.log(`Business record links: ${files.length} pages checked, ${changed} updated.`);
