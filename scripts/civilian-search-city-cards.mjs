// Approved Search Homes refinement, using the site's existing responsive cards.
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {resolve,join,dirname,sep} from 'node:path';
import {createHash} from 'node:crypto';
export const searchCityDataFile='content/design/search-city-cards-2026-09-10.json';
export const searchCityData=JSON.parse(readFileSync(new URL('../'+searchCityDataFile,import.meta.url),'utf8'));
const creditTags=(html,slugs)=>html.replace(/data-photo-credits-page="([^"]*)"/g,(_,value)=>`data-photo-credits-page="${[...new Set([...value.split(/\s+/).filter(Boolean),...slugs])].join(' ')}"`);
export function withSearchCityCards(html){
 const grid=/<div class="city-grid">([\s\S]*?)<\/div>/;
 if(!grid.test(html))throw Error('Search Homes city grid is missing');
 html=html.replace(grid,(whole,body)=>{
  const missing=searchCityData.cards.filter(c=>!body.includes(`<span class="cc-name">${c.name}</span>`));
  return missing.length?whole.replace('</div>',missing.map(c=>c.html).join('\n')+'\n</div>'):whole;
 });
 html=html.replace(/<p[^>]*>More cities:[\s\S]*?<\/p>/,'');
 return creditTags(html,['milton','destin','niceville','crestview','mary-esther']);
}
export function withSearchCityCredits(html){
 const list=/<ul class="gc-credit-list"[^>]*>[\s\S]*?<\/ul>/;
 if(!list.test(html))throw Error('Photography credit catalog is missing');
 html=html.replace(list,whole=>{
  const missing=searchCityData.credits.filter(c=>!whole.includes(`id="photo-${c.slug}"`));
  return missing.length?whole.replace('</ul>','\n'+missing.map(c=>c.html).join('\n')+'</ul>'):whole;
 });
 return creditTags(html,['milton','mary-esther']);
}
export function installSearchCityAssets(root){
 const base=resolve(root);let added=0;
 for(const asset of searchCityData.assets){
  const target=resolve(base,asset.path);if(!target.startsWith(base+sep))throw Error('Asset path leaves candidate');
  const file=existsSync(target)?target:join('civilian-site',asset.path),bytes=readFileSync(file);
  if(createHash('sha256').update(bytes).digest('hex')!==asset.sha256)throw Error('City image changed since review: '+asset.path);
  if(!existsSync(target)){mkdirSync(dirname(target),{recursive:true});writeFileSync(target,bytes);added++;}
 }
 return added;
}
