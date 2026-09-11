// Refresh the two sourced campus corrections and affected proximity comparisons.
// Uses existing page furniture; the school's historical NCES record is retained.
import {readFileSync,writeFileSync} from 'node:fs';import {join} from 'node:path';
import {profileContext,schoolProfileMarkup} from './school-profile-lib.mjs';
import {sectionAtId} from './school-audience-lib.mjs';
const arg=(name,fallback)=>{const i=process.argv.indexOf(name);return i<0?fallback:process.argv[i+1];};
const ctx=profileContext(),ids=new Set(['010020202473','010020202471']);
for(const [site,root] of [['gc',arg('--gc-root','civilian-site')],['pmh',arg('--pmh-root','public')]]){
 let changed=0;
 for(const school of ctx.directory.schools.filter(s=>s.county==='Baldwin')){
  const file=join(root,school.reportUrl+'.html'),before=readFileSync(file,'utf8');let after=before;
  const current=schoolProfileMarkup(school,ctx);
  if(ids.has(school.ncesId)){
   after=after.replace(sectionAtId(after,'school-summary'),()=>sectionAtId(current,'school-summary'));
   after=after.replace(/<meta name="(?:geo.position|ICBM)"[^>]*>\s*/g,'');
   if(Number.isFinite(school.lat)&&Number.isFinite(school.lng))after=after.replace('</head>',`<meta name="geo.position" content="${school.lat};${school.lng}"><meta name="ICBM" content="${school.lat}, ${school.lng}"></head>`);
   after=after.replace(/(<script\b[^>]*type="application\/ld\+json"[^>]*>)([\s\S]*?)(<\/script>)/g,(all,a,b,z)=>{
    const node=JSON.parse(b);if(node['@type']!=='School')return all;
    node.address={...node.address,streetAddress:school.address,addressLocality:school.city,addressRegion:school.state,postalCode:school.zip};
    if(node.geo){if(school.lat===null)delete node.geo;else node.geo={...node.geo,latitude:school.lat,longitude:school.lng};}
    return a+JSON.stringify(node)+z;
   });
  }
  const peers=sectionAtId(after,'similar-schools');
  if(ids.has(school.ncesId)||/Gulf Shores (?:High|Middle) School/.test(peers))after=after.replace(peers,()=>sectionAtId(current,'similar-schools'));
  if(after!==before){writeFileSync(file,after);changed++;}
 }
 console.log(site+': '+changed+' school pages updated for campus or affected proximity comparisons.');
}
