import {readFileSync,writeFileSync,readdirSync,existsSync,mkdirSync,copyFileSync} from 'node:fs';import {join} from 'node:path';
import {withReceiptConversions} from './inquiry-browser-lib.mjs';
export function patchLegacyTracking(js){return js.replace(/  document\.addEventListener\('costin:lead-success', event => \{[\s\S]*?\n  \}\);/g,'  // Accepted lead events are emitted once by costin-conversions.js.');}
const at=process.argv.indexOf('--root'),roots=at>=0?[process.argv[at+1]]:['public','civilian-site'];
const walk=d=>readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(d,e.name)):[join(d,e.name)]);
let changed=0;
for(const root of roots){
 mkdirSync(join(root,'assets'),{recursive:true});
 const asset=join(root,'assets/costin-conversions.js');if(asset.replaceAll('\\','/')!=='public/assets/costin-conversions.js')copyFileSync('public/assets/costin-conversions.js',asset);
 for(const file of walk(root).filter(f=>f.endsWith('.html'))){const h=readFileSync(file,'utf8'),next=withReceiptConversions(h);if(h!==next){writeFileSync(file,next);changed++;}}
 for(const name of ['costin-experience.js','costin-meta.js']){const p=join(root,'assets',name);if(existsSync(p)){const h=readFileSync(p,'utf8'),n=patchLegacyTracking(h);if(n!==h){writeFileSync(p,n);changed++;}}}
}
if(at<0){let h=readFileSync('index.html','utf8');writeFileSync('index.html',withReceiptConversions(h));}
console.log(JSON.stringify({roots,changed,dates:'preserved'}));
