// Gregg's requested Palafox night photograph, with its verified source and credit.
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {resolve,join,dirname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {renderCredits} from './photo-credits-lib.mjs';
export const contactPhotoDataFile='content/design/contact-palafox-night-2026-09-10.json';
export const contactPhotoData=JSON.parse(readFileSync(new URL('../'+contactPhotoDataFile,import.meta.url),'utf8'));
const creditTags=html=>html.replace(/data-photo-credits-page="([^"]*)"/g,(_,value)=>`data-photo-credits-page="${[...new Set([...value.split(/\s+/).filter(Boolean),'palafox-night'])].join(' ')}"`);
export function withContactNightPhoto(html){
 const figures=[...html.matchAll(/<figure\b[^>]*>[\s\S]*?<\/figure>/g)].filter(m=>/src="(?:https:\/\/(?:pensacolamilitaryhousing|greggcostin)\.com)?\/images\/(?:saenger|palafox-night)\.jpg"/.test(m[0]));
 if(figures.length!==1)throw Error('Expected exactly one downtown contact photograph');
 return creditTags(html.replace(figures[0][0],contactPhotoData.figureHtml));
}
export function withContactNightCredits(html){
 const list=/<ul class="gc-credit-list"[^>]*>[\s\S]*?<\/ul>/;
 if(!list.test(html))throw Error('Photography credit catalog is missing');
 const entry=renderCredits({site:'gc',domain:'greggcostin.com',entries:[contactPhotoData.credit]}).match(/<li\b[^>]*>[\s\S]*?<\/li>/)[0];
 html=html.replace(list,whole=>whole.includes('id="photo-palafox-night"')?whole.replace(/<li\b[^>]*id="photo-palafox-night"[^>]*>[\s\S]*?<\/li>/,entry):whole.replace('</ul>','\n'+entry+'</ul>'));
 return creditTags(html);
}
export function withContactNightCreditCatalog(json){
 const catalog=JSON.parse(json),existing=catalog.entries.findIndex(e=>e.id===contactPhotoData.credit.id);
 if(existing<0)catalog.entries.push(contactPhotoData.credit);else catalog.entries[existing]=contactPhotoData.credit;
 return JSON.stringify(catalog,null,2)+'\n';
}
export function installContactNightAssets(root){
 const base=resolve(root);let added=0;
 for(const asset of contactPhotoData.assets){
  const target=resolve(base,asset.path);if(!target.startsWith(base+sep))throw Error('Photo asset path leaves candidate');
  const bytes=readFileSync(existsSync(target)?target:join('civilian-site',asset.path));
  if(createHash('sha256').update(bytes).digest('hex')!==asset.sha256)throw Error('Contact photograph changed since selection: '+asset.path);
  if(!existsSync(target)){mkdirSync(dirname(target),{recursive:true});writeFileSync(target,bytes);added++;}
 }
 return added;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const i=process.argv.indexOf('--root');if(i<0)throw Error('Provide --root with the civilian candidate');
 const root=resolve(process.argv[i+1]);if(!existsSync(join(root,'contact.html')))throw Error('Civilian contact page is missing');
 const assets=installContactNightAssets(root),changed=[];
 for(const [name,transform] of [['contact.html',withContactNightPhoto],['photo-credits.html',withContactNightCredits],['data/photography-credits.json',withContactNightCreditCatalog]]){
  const file=join(root,name),before=readFileSync(file,'utf8'),after=transform(before);
  if(before!==after){writeFileSync(file,after);changed.push(name);}
 }
 console.log(JSON.stringify({root,assets,changed,source:contactPhotoData.credit.sourceUrl}));
}
