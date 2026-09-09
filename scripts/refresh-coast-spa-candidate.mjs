// Refresh only the six reviewed SPA documents and their bundled assets in a local candidate.
import {readFileSync,writeFileSync,existsSync,mkdirSync,copyFileSync} from 'node:fs';
import {resolve,join,dirname,sep} from 'node:path';
import {createHash} from 'node:crypto';
import {refreshEntityHtml} from './entity-sync-lib.mjs';
import {linkBusinessRecord} from './identity-page-lib.mjs';
const manifestFile='docs/seo-geo-2026-09-06/candidate-manifest.json';
const manifest=JSON.parse(readFileSync(manifestFile,'utf8')),root=resolve(manifest.candidate);
if(!root.startsWith(resolve('.coast-release')+sep)||manifest.mode!=='local_review_only_no_deployment')throw Error('Refuse a non-local candidate');
const files=new Set(['index.html','about.html','contact.html','pcs-guide.html','communities.html','mortgage-calculators.html']);
for(const path of [...files]){const html=readFileSync(join('dist',path),'utf8');for(const m of html.matchAll(/(?:src|href)="(\/assets\/[^"?#]+)"/g))files.add(m[1].slice(1));}
for(const path of files){const source=resolve('dist',path),target=join(root,'pmh',path);if(!source.startsWith(resolve('dist')+sep)||!existsSync(source))throw Error('Source asset absent or unsafe');mkdirSync(dirname(target),{recursive:true});if(path.endsWith('.html'))writeFileSync(target,linkBusinessRecord(refreshEntityHtml(readFileSync(source,'utf8'))));else copyFileSync(source,target);const row={site:'pmh',path,reason:'Reviewed SPA content, responsive footer and route-aware identity metadata',source,sha256:createHash('sha256').update(readFileSync(target)).digest('hex')};const index=manifest.changes.findIndex(r=>r.site==='pmh'&&r.path===path);if(index<0)manifest.changes.push(row);else manifest.changes[index]=row;}
manifest.revisions=[...(manifest.revisions||[]),{at:new Date().toISOString(),reason:'Fix structured data and hreflang during SPA navigation',files:[...files]}];
for(const file of [manifestFile,join(root,'manifest.json')])writeFileSync(file,JSON.stringify(manifest,null,2)+'\n');
console.log(`Refreshed ${files.size} files in the local candidate. Rebuild its full Pagefind index and rerun verification.`);
