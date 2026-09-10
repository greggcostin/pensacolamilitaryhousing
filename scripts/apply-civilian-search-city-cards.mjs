import {readFileSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {withSearchCityCards,withSearchCityCredits,installSearchCityAssets} from './civilian-search-city-cards.mjs';
const i=process.argv.indexOf('--root');if(i<0)throw Error('Provide --root with the complete civilian candidate');
const root=resolve(process.argv[i+1]),addedAssets=installSearchCityAssets(root);
const changed=[];
for(const [name,transform] of [['search.html',withSearchCityCards],['photo-credits.html',withSearchCityCredits]]){
 const file=join(root,name),old=readFileSync(file,'utf8'),html=transform(old);
 if(html!==old){writeFileSync(file,html);changed.push(name);}
}
console.log(JSON.stringify({root,changed,addedAssets},null,2));
