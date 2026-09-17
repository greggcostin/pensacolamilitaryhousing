// Build the complete production-based candidate: verified baseline + only the owned article/hub/credit/discovery changes.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';
import {unbundleCivilianStyles,bundleCivilianStyles} from './source/scripts/civilian-style-bundle.mjs';
import {withCivilianHeaderTools} from './source/scripts/civilian-header-tools.mjs';
import {responsiveHeaderLogos} from './source/scripts/responsive-logo-lib.mjs';
import {withCivilianCoastalTheme,withoutCoastalThemeLink} from './source/scripts/civilian-coastal-theme.mjs';
import {preparePageLoading} from './source/scripts/page-loading-lib.mjs';
import {finishBlogDiscovery} from './source/scripts/finish-blog-discovery.mjs';
import {walk,sha} from './source/scripts/isolated-release-lib.mjs';
const slug='fed-rate-hike-what-it-means',photo='fed-hike-20260917';
const root=path.join(import.meta.dirname,'preview'),base=path.resolve(import.meta.dirname,'../2026-09-14/release/gc'),source=path.join(import.meta.dirname,'source'),report=path.join(source,'docs/civilian-blog-engine/2026-09-17');
const before=JSON.parse(fs.readFileSync(path.join(report,'production-before.json'),'utf8'));assert(before.ok,'Baseline not verified');
assert(!fs.existsSync(root),'preview exists; inspect before reuse');
fs.cpSync(base,root,{recursive:true});
for(const n of fs.readdirSync(path.join(source,'civilian-site/images')).filter(f=>f.startsWith(photo)))fs.copyFileSync(path.join(source,'civilian-site/images',n),path.join(root,'images',n));
const run=args=>{const r=spawnSync(process.execPath,args,{cwd:source,encoding:'utf8'});if(r.status!==0)throw Error(r.stdout+r.stderr);return r.stdout.trim();};
console.log(run(['scripts/civilian-blog-factory.mjs',slug,'--out',root,'--bundle']));
const own=new Set(['blog/'+slug+'.html','blog.html','og/blog-'+slug+'.png','og/blog.png','sitemap.xml','llms.txt','llms-full.txt','photo-credits.html','data/photography-credits.json','assets/photo-credits.json']);
console.log(run(['scripts/build-photography-credits.mjs','--site','gc','--root',root,'--report',path.join(report,'photography-build.json')]));
// The credits generator rewrites other pictures; keep only the owned article/hub/credit pages.
let restored=0;for(const file of walk(base)){const rel=path.relative(base,file).replaceAll('\\','/');if(!own.has(rel)&&sha(file)!==sha(path.join(root,rel))){fs.copyFileSync(file,path.join(root,rel));restored++;}}
for(const rel of ['blog/'+slug+'.html','blog.html'])console.log(run(['scripts/apply-responsive-images.mjs','--civilian','--gc-root',root.replaceAll('\\','/'),'--only',path.join(root,rel).replaceAll('\\','/')]));
const theme=fs.readFileSync(path.join(base,'sell.html'),'utf8').match(/<link\b[^>]*data-gc-coastal-theme[^>]*>/)?.[0];assert(theme,'coastal theme link missing in baseline');
for(const rel of ['blog/'+slug+'.html','blog.html','photo-credits.html']){
 const file=path.join(root,rel);let html=fs.readFileSync(file,'utf8');
 html=withoutCoastalThemeLink(unbundleCivilianStyles(html,root));html=responsiveHeaderLogos(withCivilianHeaderTools(html,root),root);
 html=(await bundleCivilianStyles(html,root)).html;
 html=withCivilianCoastalTheme(html).replace(/<link\b[^>]*data-gc-coastal-theme[^>]*>/,theme);
 html=preparePageLoading(html,{hasAsset:p=>p.startsWith('/')&&fs.existsSync(path.join(root,p.slice(1)))}).html;
 fs.writeFileSync(file,html);
}
finishBlogDiscovery('gc',{root});
// Discovery may touch other pages; restore anything outside the owned set again.
for(const file of walk(base)){const rel=path.relative(base,file).replaceAll('\\','/');if(!own.has(rel)&&sha(file)!==sha(path.join(root,rel))){fs.copyFileSync(file,path.join(root,rel));restored++;}}
const manifestPath=path.join(root,'assets/styles/manifest.json'),manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8')),baseManifest=JSON.parse(fs.readFileSync(path.join(base,'assets/styles/manifest.json'),'utf8'));
const used=new Set(walk(root).filter(f=>f.endsWith('.html')).flatMap(f=>[...fs.readFileSync(f,'utf8').matchAll(/data-costin-style-bundle="([a-f0-9]+)"/g)].map(m=>m[1])));
for(const id of Object.keys(manifest.bundles))if(!baseManifest.bundles[id]&&!used.has(id)){const file=path.resolve(root,manifest.bundles[id].path);assert(file.startsWith(path.resolve(root)+path.sep));fs.unlinkSync(file);delete manifest.bundles[id];}
fs.writeFileSync(manifestPath,JSON.stringify(manifest)+'\n');
console.log(run(['scripts/build-blog-search.mjs','gc','--root',root,'--preserve-photography','--report',path.join(report,'search.json')]));
const changes=[],removed=[];
for(const file of walk(root)){const rel=path.relative(root,file).replaceAll('\\','/'),old=path.join(base,rel);if(!fs.existsSync(old)||sha(file)!==sha(old))changes.push({path:rel,kind:fs.existsSync(old)?'modified':'added',sha256:sha(file)});}
for(const file of walk(base)){const rel=path.relative(base,file).replaceAll('\\','/');if(!fs.existsSync(path.join(root,rel)))removed.push(rel);}
const allow=rel=>rel.startsWith('pagefind/')||rel.startsWith('images/'+photo)||rel.startsWith('assets/styles/')||own.has(rel);
const unexpected=changes.filter(c=>!allow(c.path));
const inbound=['buy','sell','resources/mortgage-preapproval','blog/what-moves-mortgage-rates'].map(rel=>({hub:rel,url:'https://greggcostin.com/'+rel,exists:fs.readFileSync(path.join(root,rel+'.html'),'utf8').includes('href="/blog/'+slug+'"'),unchanged:sha(path.join(root,rel+'.html'))===sha(path.join(base,rel+'.html'))}));
fs.writeFileSync(path.join(report,'candidate-inventory.json'),JSON.stringify({base,baseDeploymentId:before.sites[0].deploymentId,candidate:root,changes,removed,unexpected,inbound,restored,preparation:'Verified baseline copied; factory --out --bundle wrote the article, hub, OG cards, sitemap and llms; photography credits, responsive markup, style bundle, header tools, coastal theme, page loading, blog discovery and the Pagefind index were applied; every unowned page was restored byte-for-byte from the baseline.'},null,2)+'\n');
console.log(JSON.stringify({restored,changes:changes.filter(c=>!c.path.startsWith('pagefind/')).map(x=>x.path),pagefindChanges:changes.filter(c=>c.path.startsWith('pagefind/')).length,removed,unexpected,inbound},null,2));
assert(!unexpected.length,'unexpected candidate changes');assert(!removed.length,'candidate removed baseline files');
