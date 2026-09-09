import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {REGIONAL_GUIDES,REVIEWED} from '../content/communities/civilian-regional-guides.mjs';
import {renderRegionalGuide} from './civilian-regional-guide-lib.mjs';
import {improveCivilianLoading} from './civilian-loading-lib.mjs';
import {stageBaseline,inventory,walk,json,save} from './isolated-release-lib.mjs';
const dir='docs/growth-execution-2026-09-08',candidate=resolve('.coast-release/2026-09-08-civilian-growth');
if(existsSync(join(dir,'deployment.json')))throw Error('Published candidate is immutable. Stage a new release.');
const proof=json(join(dir,'baseline-current/production-baseline.json'));
stageBaseline(proof,candidate);
const root=join(candidate,'gc'),base=proof.sites.find(s=>s.site==='gc').localBaseline;
for(const g of REGIONAL_GUIDES){
  const f=g.path.slice(1)+'.html',html=renderRegionalGuide(readFileSync(join(base,f),'utf8'),g,root);writeFileSync(join(root,f),html);
  const r=spawnSync(process.execPath,['scripts/apply-responsive-images.mjs','--civilian','--only',join(root,f)],{encoding:'utf8'});if(r.status)throw Error(r.stderr||r.stdout);console.log(r.stdout.trim());
}
for(const f of walk(root).filter(f=>f.endsWith('.html'))){const h=readFileSync(f,'utf8'),n=improveCivilianLoading(h,root);if(n!==h)writeFileSync(f,n);}
let sitemap=readFileSync(join(root,'sitemap.xml'),'utf8');
sitemap=sitemap.replace(/<url>[\s\S]*?<\/url>/g,b=>REGIONAL_GUIDES.some(g=>b.includes('https://greggcostin.com'+g.path+'</loc>'))?b.replace(/<lastmod>[^<]*<\/lastmod>/,`<lastmod>${REVIEWED}</lastmod>`):b);writeFileSync(join(root,'sitemap.xml'),sitemap);
let llms=readFileSync(join(root,'llms.txt'),'utf8');
for(const g of REGIONAL_GUIDES){const lines=llms.split('\n');let found=false;llms=lines.map(line=>{if(line.startsWith('- [')&&line.includes('(https://greggcostin.com'+g.path+')')){found=true;return `- [${g.name}](https://greggcostin.com${g.path}): ${g.description}`;}return line;}).join('\n');if(!found)llms+=`\n- [${g.name}](https://greggcostin.com${g.path}): ${g.description}\n`;}
writeFileSync(join(root,'llms.txt'),llms);
// Keep full-text companion editions current, with stable source URLs and actual review dates.
let full=readFileSync(join(root,'llms-full.txt'),'utf8').replace(/\n<!-- CIVILIAN_REGIONAL_START -->[\s\S]*?<!-- CIVILIAN_REGIONAL_END -->\n?/g,'');
full+='\n<!-- CIVILIAN_REGIONAL_START -->\n'+REGIONAL_GUIDES.map(g=>`## ${g.title}\nhttps://greggcostin.com${g.path}\nReviewed ${REVIEWED}\n${readFileSync(join(root,g.path.slice(1)+'.html'),'utf8').match(/<main\b[\s\S]*?<\/main>/)[0].replace(/<[^>]+>/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/\s+/g,' ').trim()}`).join('\n\n')+'\n<!-- CIVILIAN_REGIONAL_END -->\n';
writeFileSync(join(root,'llms-full.txt'),full);
const record=inventory(proof,candidate);save(join(dir,'candidate.json'),record);
console.log(JSON.stringify({candidate,changes:record.changes.length,preserved:record.preserved,removed:record.removed},null,2));
