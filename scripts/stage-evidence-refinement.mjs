// Deterministic overlay over the complete, freshly verified production inventory.
import {readFileSync,writeFileSync,cpSync,mkdirSync,existsSync,readdirSync} from 'node:fs';import {join,resolve,relative} from 'node:path';import {createHash} from 'node:crypto';import {spawnSync} from 'node:child_process';import sharp from 'sharp';
import {studyPage,slug as studySlug} from './build-bah-zip-study.mjs';import {reviewedPage} from './reviewed-page-lib.mjs';
const out='docs/seo-geo-2026-09-06/projects/03-accuracy/zip-and-claims';
const proof=JSON.parse(readFileSync(join(out,'prestage/production-baseline.json'),'utf8'));if(!proof.ok)throw Error('Verified complete baseline required');
const candidate=resolve('.coast-release/2026-09-08-evidence-refinement');
if(!existsSync(candidate)){mkdirSync(candidate,{recursive:true});for(const s of proof.sites)cpSync(s.localBaseline,join(candidate,s.site),{recursive:true,errorOnExist:true,force:false});writeFileSync(join(candidate,'baseline.json'),JSON.stringify(proof,null,2));}
else if(JSON.stringify(JSON.parse(readFileSync(join(candidate,'baseline.json'))))!==JSON.stringify(proof))throw Error('Pinned baseline changed');
const run=args=>{const r=spawnSync(process.execPath,args,{encoding:'utf8',maxBuffer:4e6});if(r.status)throw Error(r.stderr||r.stdout);console.log(r.stdout.trim());};
// Restore only the documents this renderer owns, so reruns are reproducible.
const pages={pmh:['bah-vs-cost-of-owning-pensacola','first-time-military-homebuyer','va-funding-fee-2026','va-irrrl-guide','rent-vs-buy-military-pensacola','renting-on-bah-pensacola','rent-or-sell-pcs-pensacola','military-rental-property-management',...['nas-pensacola','corry-station','saufley-field','whiting-field','eglin-afb','hurlburt-field','duke-field'].map(s=>'bases/'+s),'communities/navarre'],gc:['resources/first-time-home-buyer','neighborhoods/navarre']};
for(const s of proof.sites)for(const p of pages[s.site])cpSync(join(s.localBaseline,p+'.html'),join(candidate,s.site,p+'.html'));
run(['scripts/build-remaining-financial-guides.mjs','--root',join(candidate,'pmh')]);run(['scripts/review-base-financial-claims.mjs','--root',join(candidate,'pmh')]);run(['scripts/review-civilian-first-buyer.mjs','--root',join(candidate,'gc')]);run(['scripts/build-navarre-guides.mjs','--candidate',candidate]);
const study=JSON.parse(readFileSync('content/data/bah-ownership-study-2026.json','utf8')),{spec,body}=studyPage(study),studyFile=join(candidate,'pmh',studySlug+'.html');writeFileSync(studyFile,reviewedPage(readFileSync(studyFile,'utf8'),spec,body,{marker:'zip-study'}));
for(const p of ['data/bah-ownership-study-2026.json','data/bah-ownership-study-2026.csv','downloads/pensacola-pcs-checklist.pdf'])cpSync(join('public',p),join(candidate,'pmh',p));
// Patch only the two accepted-inquiry branches in the current immutable SPA bundle.
// Source App.jsx has the same contract; unrelated working-tree features are excluded.
const pmhBaseline=proof.sites.find(s=>s.site==='pmh').localBaseline,home=readFileSync(join(pmhBaseline,'index.html'),'utf8');
const oldAsset=home.match(/src="(\/assets\/index-[^"]+\.js)"/)[1];let bundle=readFileSync(join(pmhBaseline,oldAsset),'utf8'),count=0;
bundle=bundle.replace(/m\.ok&&v\.success\?\(r\("success"\),(Ph\(\),)?Zn\("inquiry_submit",\{inquiry_type:e\.inquiryType,cta_location:"(spa-inquiry-form|spa-contact-page)",page_path:window\.location\.pathname\}\),/g,(_,mark,form)=>{count++;return `window.costinConversions?.accept(m.ok,v,"${form}")?(r("success"),${mark||''}`;});
if(count!==2)throw Error('Baseline SPA handler shape changed; inspect before patching');
const hash=bytes=>createHash('sha256').update(bytes).digest('hex'),newAsset='/assets/index-receipts-'+hash(bundle).slice(0,12)+'.js';writeFileSync(join(candidate,'pmh',newAsset),bundle);
for(const p of ['index','about','contact','pcs-guide','mortgage-calculators','communities']){const h=readFileSync(join(pmhBaseline,p+'.html'),'utf8');writeFileSync(join(candidate,'pmh',p+'.html'),h.replaceAll(oldAsset,newAsset));}
for(const s of proof.sites){
 const root=join(candidate,s.site);run(['scripts/rollout-receipt-conversions.mjs','--root',root]);
 let sm=readFileSync(join(root,'sitemap.xml'),'utf8');for(const p of pages[s.site])sm=sm.replace(/<url>[\s\S]*?<\/url>/g,b=>b.includes(`https://${s.domain}/${p}</loc>`)?b.replace(/<lastmod>[^<]*<\/lastmod>/,'<lastmod>2026-09-08</lastmod>'):b);writeFileSync(join(root,'sitemap.xml'),sm);
 for(const p of pages[s.site]){
  const html=readFileSync(join(root,p+'.html'),'utf8'),title=html.match(/<title>([^<]+)<\/title>/)[1],og=html.match(/<meta\b[^>]*property="og:image"[^>]*content="([^"]+)"/)?.[1];
  if(!og)throw Error('OG image absent: '+p);const path=new URL(og,'https://'+s.domain).pathname;
  const lines=[];for(const word of title.replaceAll('&amp;','&').split(' ')){if(!lines.length||lines.at(-1).length+word.length>32)lines.push(word);else lines[lines.length-1]+=' '+word;}
  const escape=t=>t.replaceAll('&','&amp;').replaceAll('<','&lt;');
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#10213b"/><rect x="45" y="45" width="1110" height="540" fill="none" stroke="#c5a04b"/><text x="85" y="130" fill="#d9b963" font-family="Arial" font-size="20" letter-spacing="3">THE COSTIN TEAM · LOCAL GUIDES</text>${lines.slice(0,4).map((t,i)=>`<text x="85" y="${235+i*72}" fill="white" font-family="Georgia" font-size="53">${escape(t)}</text>`).join('')}<text x="85" y="535" fill="#d9b963" font-family="Arial" font-size="25">Gregg Costin · Florida &amp; Alabama</text><text x="85" y="572" fill="#b7c6d8" font-family="Arial" font-size="20">${s.domain}</text></svg>`;await sharp(Buffer.from(svg)).png().toFile(join(root,path));
 }
 // Replace the entry for each changed URL; preserve every other discovery entry.
 let llms=readFileSync(join(root,'llms.txt'),'utf8');const marker='EVIDENCE_REFINEMENT';let full=readFileSync(join(root,'llms-full.txt'),'utf8').replace(new RegExp(`\n<!-- ${marker}_START -->[\\s\\S]*?<!-- ${marker}_END -->\n?`,'g'),'');
 if(s.site==='pmh')full=full.replace(/^## Per-Base Comprehensive Data[\s\S]*?(?=^## )/m,'## Per-Base Comprehensive Data\nThe seven installation guides below were reviewed September 8, 2026. Use their actual reporting-location, budget and housing-office checks.\n\n').replace(/^### Navarre, FL[\s\S]*?(?=^#{2,3} )/m,'');
 const excerpts=[];for(const p of pages[s.site]){const h=readFileSync(join(root,p+'.html'),'utf8'),title=h.match(/<title>([^<]+)<\/title>/)[1],desc=h.match(/<meta name="description" content="([^"]+)"/)?.[1]||'',url=`https://${s.domain}/${p}`;const replacement=`- [${title}](${url}): ${desc}`;let found=false;llms=llms.split('\n').map(line=>{if(line.includes(']('+url+')')){found=true;return replacement;}return line;}).join('\n');if(!found)llms+='\n'+replacement+'\n';
 full=full.replace(/^### [^\n]+\n[\s\S]*?(?=^#{1,3} |$(?![\s\S]))/gm,block=>block.split('\n')[0].includes(url)?'':block);
 const text=h.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)[1].replace(/<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>/g,'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();excerpts.push(`## ${title}\n${url}\nReviewed September 8, 2026.\n${text}`);}
 full+=`\n<!-- ${marker}_START -->\n${excerpts.join('\n\n')}\n<!-- ${marker}_END -->\n`;writeFileSync(join(root,'llms.txt'),llms);writeFileSync(join(root,'llms-full.txt'),full);
}
run(['node_modules/pagefind/lib/runner/bin.cjs','--site',join(candidate,'pmh'),'--output-subdir','pagefind','--force-language','en']);
const walk=d=>readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(d,e.name)):[join(d,e.name)]),changes=[],removed=[];
for(const s of proof.sites){const root=join(candidate,s.site);for(const p of walk(root)){const path=relative(root,p).replaceAll('\\','/'),from=join(s.localBaseline,path),sha256=hash(readFileSync(p)),before=existsSync(from)?hash(readFileSync(from)):null;if(before!==sha256)changes.push({site:s.site,path,before,sha256});}for(const p of walk(s.localBaseline))if(!existsSync(join(root,relative(s.localBaseline,p))))removed.push({site:s.site,path:relative(s.localBaseline,p)});}
const manifest={builtAt:new Date().toISOString(),candidate,production:proof.sites,substantivePages:pages,spa:{oldAsset,newAsset,receiptBranches:count},changes,removed};writeFileSync(join(out,'candidate-manifest.json'),JSON.stringify(manifest,null,2)+'\n');console.log(JSON.stringify({candidate,changed:changes.length,substantivePages:pages,removed}));
