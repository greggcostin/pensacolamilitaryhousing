// Refresh the two working-source pilot pages without replacing their surrounding
// nav, forms, identity or other in-progress source changes. Publishing uses stage-perdido-guides.mjs.
import {readFileSync,writeFileSync,existsSync,mkdirSync,cpSync} from 'node:fs';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {guide,renderCommunityGuide} from './coast-community-guide-lib.mjs';
const backup='docs/worldclass-roadmap-2026-09-08/perdido/source-before';
mkdirSync(backup,{recursive:true});
for(const [site,root] of [['gc','civilian-site'],['pmh','public']]){
  const e=guide.editions[site],file=join(root,e.path+'.html'),saved=join(backup,site+'-perdido-key.html');
  if(!existsSync(saved))cpSync(file,saved);
  // PMH's deployment copies the shared school assets later; use the canonical
  // civilian source dataset when refreshing the hand-maintained public source.
  writeFileSync(file,renderCommunityGuide(readFileSync(file,'utf8'),site,root,{schoolRoot:'civilian-site'}));
  const r=spawnSync(process.execPath,['scripts/apply-responsive-images.mjs',...(site==='gc'?['--civilian']:[]),'--only',file],{encoding:'utf8'});
  if(r.status)throw Error(r.stderr||r.stdout);
  let sm=readFileSync(join(root,'sitemap.xml'),'utf8');
  sm=sm.replace(/<url>[\s\S]*?<\/url>/g,b=>b.includes(e.path+'</loc>')?b.replace(/<lastmod>[^<]*<\/lastmod>/,`<lastmod>${guide.reviewed}</lastmod>`):b);
  writeFileSync(join(root,'sitemap.xml'),sm);
  let llms=readFileSync(join(root,'llms.txt'),'utf8');
  llms=site==='gc'?llms.replace(/^- \[Perdido Key\]\([^\n]+/m,`- [Perdido Key](https://greggcostin.com${e.path}): ${e.description}`):llms.replace(/(### Perdido Key[^\n]*\n)[^\n]+/,'$1'+e.description);
  writeFileSync(join(root,'llms.txt'),llms);
  let full=readFileSync(join(root,'llms-full.txt'),'utf8').replace(/\n<!-- PERDIDO_GUIDE_START -->[\s\S]*?<!-- PERDIDO_GUIDE_END -->\n?/g,'');
  if(site==='pmh')full=full.replace('Perdido Key — 15-minute commute, waterfront, higher flood insurance','Perdido Key: compare the exact reporting route, waterfront access and property-specific insurance')
    .replace(/^[ \t]*O-3 \$2,373 BAH[^\n]*Perdido Key[^\n]*/m,'  Gulf Breeze, Navarre and Perdido Key: compare complete payments using actual LES income and property-specific costs. BAH does not establish a purchase-price approval.');
  const main=readFileSync(file,'utf8').match(/<main\b[^>]*>[\s\S]*?<\/main>/)[0];
  const text=main.replace(/<style\b[\s\S]*?<\/style>/g,'').replace(/<[^>]+>/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/\s+/g,' ').trim();
  full+=`\n<!-- PERDIDO_GUIDE_START -->\n## ${e.title}\nhttps://${site==='gc'?'greggcostin.com':'pensacolamilitaryhousing.com'}${e.path}\nGuide reviewed ${guide.reviewed}.\n\n${text}\n<!-- PERDIDO_GUIDE_END -->\n`;
  writeFileSync(join(root,'llms-full.txt'),full);
  console.log('Updated working guide: '+file);
}
