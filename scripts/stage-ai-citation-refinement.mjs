import {readFileSync,writeFileSync,cpSync,mkdirSync,existsSync,readdirSync} from 'node:fs';
import {join,resolve,relative} from 'node:path';import {createHash} from 'node:crypto';import {spawnSync} from 'node:child_process';import sharp from 'sharp';
import {CITED_PAGES,refineCitedPage} from './refine-ai-cited-pages.mjs';
const out='docs/seo-geo-2026-09-06/projects/03-accuracy/ai-cited-claims';
const proof=JSON.parse(readFileSync(join(out,'prestage/production-baseline.json'),'utf8'));
if(!proof.ok||proof.sites.some(s=>s.counts.exact!==s.assetCount))throw Error('Exact complete production baseline required');
if(existsSync(join(out,'deployment.json')))throw Error('Published candidate is immutable');
const candidate=resolve('.coast-release/2026-09-08-ai-cited-claims');
if(!existsSync(candidate)){mkdirSync(candidate,{recursive:true});for(const s of proof.sites)cpSync(s.localBaseline,join(candidate,s.site),{recursive:true});writeFileSync(join(candidate,'baseline.json'),JSON.stringify(proof,null,2));}
if(JSON.stringify(JSON.parse(readFileSync(join(candidate,'baseline.json'))))!==JSON.stringify(proof))throw Error('Baseline changed');
const baseline=proof.sites.find(s=>s.site==='pmh').localBaseline,root=join(candidate,'pmh');
for(const slug of CITED_PAGES)writeFileSync(join(root,slug+'.html'),refineCitedPage(slug,readFileSync(join(baseline,slug+'.html'),'utf8')));
let sitemap=readFileSync(join(baseline,'sitemap.xml'),'utf8'),llms=readFileSync(join(baseline,'llms.txt'),'utf8'),full=readFileSync(join(baseline,'llms-full.txt'),'utf8');
const excerpts=[];
for(const slug of CITED_PAGES){const url='https://pensacolamilitaryhousing.com/'+slug,h=readFileSync(join(root,slug+'.html'),'utf8'),title=h.match(/<title>([^<]+)<\/title>/)[1],description=h.match(/<meta name="description" content="([^"]+)"/)?.[1]||'';
 sitemap=sitemap.replace(/<url>[\s\S]*?<\/url>/g,b=>b.includes(url+'</loc>')?b.replace(/<lastmod>[^<]*<\/lastmod>/,'<lastmod>2026-09-08</lastmod>'):b);
 let found=false;llms=llms.split('\n').map(line=>{if(line.includes(']('+url+')')){found=true;return `- [${title}](${url}): ${description}`;}return line;}).join('\n');if(!found)llms+=`\n- [${title}](${url}): ${description}\n`;
 full=full.replace(/^### [^\n]+\n[\s\S]*?(?=^#{1,3} |$(?![\s\S]))/gm,block=>block.split('\n')[0].includes(url)?'':block);
 const text=h.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)[1].replace(/<(?:script|style)\b[\s\S]*?<\/(?:script|style)>/g,'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();excerpts.push(`## ${title}\n${url}\nPurchase-planning claims reviewed September 8, 2026.\n${text}`);
}
full+='\n<!-- AI_CITED_CLAIMS -->\n'+excerpts.join('\n\n')+'\n';
writeFileSync(join(root,'sitemap.xml'),sitemap);writeFileSync(join(root,'llms.txt'),llms);writeFileSync(join(root,'llms-full.txt'),full);
const whiting=readFileSync(join(root,CITED_PAGES[2]+'.html'),'utf8'),og=new URL(whiting.match(/property="og:image"[^>]*content="([^"]+)"/)[1]).pathname;
await sharp(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#10213b"/><rect x="45" y="45" width="1110" height="540" fill="none" stroke="#c5a04b"/><text x="85" y="130" fill="#d9b963" font-family="Arial" font-size="24">THE COSTIN TEAM · LOCAL GUIDES</text><g fill="white" font-family="Georgia" font-size="60"><text x="85" y="245">Whiting Field</text><text x="85" y="325">Off-Base Housing</text><text x="85" y="405">Costs &amp; PCS Planning</text></g><text x="85" y="540" fill="#d9b963" font-family="Arial" font-size="26">Gregg Costin · Florida &amp; Alabama</text></svg>')).png().toFile(join(root,og));
const r=spawnSync(process.execPath,['node_modules/pagefind/lib/runner/bin.cjs','--site',root,'--output-subdir','pagefind','--force-language','en'],{encoding:'utf8'});if(r.status)throw Error(r.stderr||r.stdout);console.log(r.stdout);
const walk=d=>readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(d,e.name)):[join(d,e.name)]),hash=b=>createHash('sha256').update(b).digest('hex'),changes=[],removed=[];
for(const s of proof.sites){for(const p of walk(join(candidate,s.site))){const path=relative(join(candidate,s.site),p).replaceAll('\\','/'),prior=join(s.localBaseline,path),sha256=hash(readFileSync(p)),before=existsSync(prior)?hash(readFileSync(prior)):null;if(before!==sha256)changes.push({site:s.site,path,before,sha256});}for(const p of walk(s.localBaseline))if(!existsSync(join(candidate,s.site,relative(s.localBaseline,p))))removed.push({site:s.site,path:relative(s.localBaseline,p)});}
writeFileSync(join(out,'candidate-manifest.json'),JSON.stringify({builtAt:new Date().toISOString(),candidate,production:proof.sites,substantivePages:{pmh:CITED_PAGES,gc:[]},changes,removed},null,2)+'\n');console.log(JSON.stringify({candidate,changed:changes.length,removed}));
