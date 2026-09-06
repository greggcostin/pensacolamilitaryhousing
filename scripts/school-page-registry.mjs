import {readFileSync,writeFileSync,existsSync} from 'node:fs';
export const REGISTRY_PATH='content/schools/page-registry.json';
const slug=value=>value.toLowerCase().replace(/[.,']/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
export function createSchoolRegistry(schools){
 const records={}, used=new Set();
 for(const s of schools.filter(s=>s.reportUrl)){records[s.id]=s.reportUrl;used.add(s.reportUrl);}
 for(const s of schools.filter(s=>!s.reportUrl)){
  let route='/schools/'+slug(s.name);
  if(used.has(route))route+='-'+slug(s.city)+'-'+slug(s.ncesId||s.id);
  used.add(route);records[s.id]=route;
 }
 // These are duplicate federal directory identities for the same verified school.
 // Both records and source vintages stay visible on one canonical school page.
 for(const [alias,primary] of [['private-private-A1901242','private-private-A1500865'],['private-private-A2400041','private-private-A2300943'],['private-private-A2300878','private-private-00260819']]){
  if(records[alias]&&records[primary])records[alias]=records[primary];
 }
 return {version:1,createdAt:'2026-09-06',records};
}
export function readSchoolRegistry(){return existsSync(REGISTRY_PATH)?JSON.parse(readFileSync(REGISTRY_PATH,'utf8')):null;}
if(process.argv.includes('--create')){
 if(existsSync(REGISTRY_PATH))throw Error('Registry already exists. Preserve published URLs and make explicit identity changes.');
 const data=JSON.parse(readFileSync('civilian-site/assets/school-finder-data.json','utf8'));
 const registry=createSchoolRegistry(data.schools);writeFileSync(REGISTRY_PATH,JSON.stringify(registry,null,2)+'\n');
 console.log(`${Object.keys(registry.records).length} school identities; ${new Set(Object.values(registry.records)).size} canonical pages.`);
}
