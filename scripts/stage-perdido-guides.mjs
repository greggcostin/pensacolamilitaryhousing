// Stage just the reviewed pilot over both complete, verified production inventories.
// No build, deploy or unrelated content generation occurs here.
import {readFileSync,writeFileSync,cpSync,mkdirSync,existsSync,readdirSync} from 'node:fs';
import {resolve,join,relative} from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import sharp from 'sharp';
import {guide,renderCommunityGuide} from './coast-community-guide-lib.mjs';
const directory='docs/worldclass-roadmap-2026-09-08/perdido';
const proof=JSON.parse(readFileSync(join(directory,'baseline/production-baseline.json'),'utf8'));
if(!proof.ok)throw Error('Production baseline must be complete');
const candidateFlag=process.argv.indexOf('--candidate');
const candidate=resolve(candidateFlag>=0?process.argv[candidateFlag+1]:'.coast-release/2026-09-08-perdido-guide');
if(!existsSync(candidate)){
  mkdirSync(candidate,{recursive:true});
  for(const s of proof.sites)cpSync(s.localBaseline,join(candidate,s.site),{recursive:true,errorOnExist:true,force:false});
  writeFileSync(join(candidate,'baseline.json'),JSON.stringify(proof,null,2)+'\n');
}else if(JSON.stringify(JSON.parse(readFileSync(join(candidate,'baseline.json'),'utf8')))!==JSON.stringify(proof))throw Error('Candidate has a different pinned baseline');
const run=args=>{const r=spawnSync(process.execPath,args,{encoding:'utf8',maxBuffer:8*1024*1024});if(r.status)throw Error(r.stderr||r.stdout);console.log(r.stdout.trim());};
for(const s of proof.sites){
  const root=join(candidate,s.site),e=guide.editions[s.site],file=e.path.slice(1)+'.html';
  const html=renderCommunityGuide(readFileSync(join(s.localBaseline,file),'utf8'),s.site,root);
  writeFileSync(join(root,file),html);
  run(['scripts/apply-responsive-images.mjs',...(s.site==='gc'?['--civilian']:[]),'--only',join(root,file)]);
  let sitemap=readFileSync(join(root,'sitemap.xml'),'utf8'),matches=0;
  sitemap=sitemap.replace(/<url>[\s\S]*?<\/url>/g,b=>{if(!b.includes(`https://${s.domain}${e.path}</loc>`))return b;matches++;return b.replace(/<lastmod>[^<]*<\/lastmod>/,`<lastmod>${guide.reviewed}</lastmod>`);});
  if(matches!==1)throw Error('Expected exactly one sitemap entry');
  writeFileSync(join(root,'sitemap.xml'),sitemap);
  let llms=readFileSync(join(root,'llms.txt'),'utf8');
  if(s.site==='gc')llms=llms.replace(/^- \[Perdido Key\]\([^\n]+/m,`- [Perdido Key](https://${s.domain}${e.path}): ${e.description}`);
  else llms=llms.replace(/(### Perdido Key[^\n]*\n)[^\n]+/,'$1'+e.description);
  writeFileSync(join(root,'llms.txt'),llms);
  let full=readFileSync(join(root,'llms-full.txt'),'utf8').replace(/\n<!-- PERDIDO_GUIDE_START -->[\s\S]*?<!-- PERDIDO_GUIDE_END -->\n?/g,'');
  if(s.site==='pmh')full=full.replace('Perdido Key — 15-minute commute, waterfront, higher flood insurance','Perdido Key: compare the exact reporting route, waterfront access and property-specific insurance')
    .replace(/^[ \t]*O-3 \$2,373 BAH[^\n]*Perdido Key[^\n]*/m,'  Gulf Breeze, Navarre and Perdido Key: compare complete payments using actual LES income and property-specific costs. BAH does not establish a purchase-price approval.');
  const published=readFileSync(join(root,file),'utf8');
  const main=published.match(/<main\b[^>]*>[\s\S]*?<\/main>/)[0];
  const text=main.replace(/<style\b[\s\S]*?<\/style>/g,'').replace(/<[^>]+>/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/\s+/g,' ').trim();
  full+=`\n<!-- PERDIDO_GUIDE_START -->\n## ${e.title}\nhttps://${s.domain}${e.path}\nGuide reviewed ${guide.reviewed}.\n\n${text}\n<!-- PERDIDO_GUIDE_END -->\n`;
  writeFileSync(join(root,'llms-full.txt'),full);
  const subtitle=s.site==='gc'?'Homes, condos & the local ownership picture':'Military housing & your PCS planning guide';
  const escape=t=>t.replaceAll('&','&amp;');
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#10213b"/><rect x="45" y="45" width="1110" height="540" fill="none" stroke="#c5a04b"/><path d="M45 455 H1155" stroke="#465367"/><text x="90" y="143" fill="#d9b963" font-family="Arial" font-size="18" letter-spacing="4">THE COSTIN TEAM · LOCAL GUIDES</text><text x="85" y="284" fill="#ffffff" font-family="Georgia" font-size="93">Perdido Key</text><text x="90" y="361" fill="#d9b963" font-family="Arial" font-size="29">${escape(subtitle)}</text><text x="90" y="516" fill="#dbe3ed" font-family="Arial" font-size="24">Gregg Costin · Florida &amp; Alabama</text><text x="90" y="553" fill="#b7c6d8" font-family="Arial" font-size="18">${s.domain}</text></svg>`;
  const og=`og/${s.site==='gc'?'neighborhoods':'communities'}-perdido-key.png`;
  await sharp(Buffer.from(svg)).png().toFile(join(root,og));
}
// Rebuild the searchable index against the complete staged military site.
run(['node_modules/pagefind/lib/runner/bin.cjs','--site',join(candidate,'pmh'),'--output-subdir','pagefind','--force-language','en']);
const walk=d=>readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(d,e.name)):[join(d,e.name)]);
const hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const changes=[],preserved={},removed=[];
for(const s of proof.sites){
  const root=join(candidate,s.site);preserved[s.site]=0;
  for(const p of walk(root)){
    const path=relative(root,p).replaceAll('\\','/'),from=join(s.localBaseline,path),after=hash(p),before=existsSync(from)?hash(from):null;
    if(before===after)preserved[s.site]++;else changes.push({site:s.site,path,before,sha256:after});
  }
  for(const p of walk(s.localBaseline)){const path=relative(s.localBaseline,p);if(!existsSync(join(root,path)))removed.push({site:s.site,path});}
}
const record={builtAt:new Date().toISOString(),candidate,production:proof.sites,changes,preserved,removed};
writeFileSync(join(directory,'candidate.json'),JSON.stringify(record,null,2)+'\n');
console.log(JSON.stringify({preserved,removed,changes:changes.filter(c=>!c.path.startsWith('pagefind/')).map(({site,path})=>({site,path})),indexChanges:changes.filter(c=>c.path.startsWith('pagefind/')).length},null,2));
