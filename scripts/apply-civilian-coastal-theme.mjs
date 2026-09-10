import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {walk} from './isolated-release-lib.mjs';
import {installCivilianCoastalTheme,withCivilianCoastalTheme} from './civilian-coastal-theme.mjs';
const i=process.argv.indexOf('--root');if(i<0)throw Error('Provide --root with a complete civilian candidate');
const root=resolve(process.argv[i+1]);
const asset=await installCivilianCoastalTheme(root);let changed=0;
const files=walk(root).filter(p=>p.endsWith('.html'));
for(const path of files){const before=readFileSync(path,'utf8'),after=withCivilianCoastalTheme(before);if(after!==before){writeFileSync(path,after);changed++;}}
console.log(JSON.stringify({root,pages:files.length,changed,asset},null,2));
