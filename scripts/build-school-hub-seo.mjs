// Patch the two hub pages in a complete site pair; leave map modules and school facts intact.
// node scripts/build-school-hub-seo.mjs --gc-root <gc> --pmh-root <pmh>
import {readFileSync,writeFileSync,mkdirSync,existsSync,readdirSync} from 'node:fs';
import {join,dirname} from 'node:path';
import sharp from 'sharp';
import {refreshEntityHtml} from './entity-sync-lib.mjs';
import {enhanceSchoolHub,schoolCoverage,schoolExport,schoolDiscovery,schoolHeaderLabel,SCHOOL_REVIEW_DATE,SCHOOL_ORIGINS} from './school-hub-seo-lib.mjs';
const arg=k=>process.argv.includes(k)?process.argv[process.argv.indexOf(k)+1]:null;
const roots={gc:arg('--gc-root'),pmh:arg('--pmh-root')};
if(!roots.gc||!roots.pmh)throw Error('Provide complete --gc-root and --pmh-root site directories');
const data=JSON.parse(readFileSync(join(roots.gc,'assets/school-finder-data.json'),'utf8'));
if(JSON.stringify(data)!==JSON.stringify(JSON.parse(readFileSync(join(roots.pmh,'school-assets/school-finder-data.json'),'utf8'))))throw Error('School data differ between editions');
const output=schoolExport(data),coverage=schoolCoverage(data);
const write=(p,text)=>{mkdirSync(dirname(p),{recursive:true});if(!existsSync(p)||!readFileSync(p).equals(Buffer.from(text)))writeFileSync(p,text);};
const walk=root=>readdirSync(root,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(root,e.name)):[join(root,e.name)]);
let sharedIdentityUpdates=0,headerLabelUpdates=0;
for(const [site,root] of Object.entries(roots))for(const path of walk(root).filter(p=>p.endsWith('.html')&&!p.endsWith('404.html'))){
  const before=readFileSync(path,'utf8');
  // The older PMH about shell incorrectly used the homepage full-node marker.
  // Keep its other graph nodes and use compact shared identities outside canonical pages.
  const marked=path===join(root,'index.html')?before:before.replace('data-entity="entity-graph:home"','data-entity="entity-graph:references"');
  const identity=refreshEntityHtml(marked,{site});if(identity!==before)sharedIdentityUpdates++;
  const after=site==='gc'?schoolHeaderLabel(identity):identity;if(after!==identity)headerLabelUpdates++;
  if(after!==before)write(path,after);
}
for(const [site,root] of Object.entries(roots)){
  const page=join(root,'schools.html'),old=readFileSync(page,'utf8');
  write(page,enhanceSchoolHub(refreshEntityHtml(old,{site}),data,site));
  write(join(root,'data/school-finder.json'),output.json);write(join(root,'data/school-finder.csv'),output.csv);
  for(const name of ['llms.txt','llms-full.txt']){
    const path=join(root,name);let text=readFileSync(path,'utf8');
    text=text.replace(/<!-- SCHOOL_RESOURCE_START -->[\s\S]*?<!-- SCHOOL_RESOURCE_END -->\s*/g,'');
    // Replace the stale hub description only; preserve every individual guide and other topic.
    text=text.replace(/^- \[([^\]]+)\]\(https:\/\/(?:greggcostin\.com|pensacolamilitaryhousing\.com)\/schools\)(?::[^\r\n]*)?\r?\n/gm,'');
    const block=schoolDiscovery(data,site)+'\n\n';
    const insertion=text.indexOf('\n## ');
    text=insertion>=0?text.slice(0,insertion)+'\n\n'+block+text.slice(insertion+1):text.trimEnd()+'\n\n'+block;
    write(path,text);
  }
  const sitemap=join(root,'sitemap.xml'),url=SCHOOL_ORIGINS[site]+'/schools';
  let xml=readFileSync(sitemap,'utf8'),found=false;
  xml=xml.replace(/<url>[\s\S]*?<\/url>/g,entry=>{
    if(!entry.includes('<loc>'+url+'</loc>'))return entry;found=true;
    return /<lastmod>/.test(entry)?entry.replace(/<lastmod>[^<]*<\/lastmod>/,'<lastmod>'+SCHOOL_REVIEW_DATE+'</lastmod>'):entry.replace('</loc>','</loc><lastmod>'+SCHOOL_REVIEW_DATE+'</lastmod>');
  });if(!found)throw Error('School hub missing from sitemap');write(sitemap,xml);
  const headers=join(root,'_headers');let config=readFileSync(headers,'utf8').replace(/# SCHOOL_DATA_HEADERS_START[\s\S]*?# SCHOOL_DATA_HEADERS_END\s*/g,'');
  config=config.trimEnd()+`\n\n# SCHOOL_DATA_HEADERS_START\n/data/school-finder.json\n  Content-Type: application/json; charset=utf-8\n  Cache-Control: public, max-age=0, must-revalidate\n/data/school-finder.csv\n  Content-Type: text/csv; charset=utf-8\n  Cache-Control: public, max-age=0, must-revalidate\n# SCHOOL_DATA_HEADERS_END\n`;write(headers,config);
  const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;');
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#0a1525"/><rect x="44" y="44" width="1112" height="542" rx="16" fill="none" stroke="#c9a84c" stroke-width="2"/><text x="85" y="114" fill="#c9a84c" font-family="Arial" font-size="21" letter-spacing="3">${site==='gc'?'THE COSTIN TEAM':'PENSACOLA MILITARY HOUSING'}</text><text x="85" y="230" fill="#fff" font-family="Georgia" font-size="64">${site==='gc'?'School Finder':'PCS School Finder'}</text><text x="85" y="292" fill="#d8e0e8" font-family="Arial" font-size="27">Pensacola · Emerald Coast · Coastal Alabama</text><text x="85" y="385" fill="#e2c572" font-family="Arial" font-size="40" font-weight="bold">${coverage.guides} school guides. Four counties.</text><text x="85" y="443" fill="#d8e0e8" font-family="Arial" font-size="26">Public · Private · Christian · Official state grades</text><text x="85" y="519" fill="#c9a84c" font-family="Arial" font-size="24">${esc(SCHOOL_ORIGINS[site].replace('https://',''))}/schools</text></svg>`;
  write(join(root,'og/schools.png'),await sharp(Buffer.from(svg)).png().toBuffer());
}
const {guideRows,...counts}=coverage;console.log(JSON.stringify({ok:true,roots,counts,sharedIdentityUpdates,headerLabelUpdates,sourceSnapshot:data.builtAt,pageReviewed:SCHOOL_REVIEW_DATE,dataVersion:output.version},null,2));
