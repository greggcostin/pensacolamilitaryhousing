// Stage reviewed download files without changing site HTML or deploying.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,copyFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root='artifacts/client-library';
const read=name=>JSON.parse(readFileSync(root+'/'+name,'utf8'));
const catalog=read('build-report.json'),visual=read('qa/visual-review.json');
for(const name of ['audit.json','design-checks.json','journey-checks.json','directory-checks.json','directory-pdf-checks.json']){
 const r=read('qa/'+name);assert.ok(!r.issues?.length&&!r.findings?.length,'Unresolved guide check: '+name);
}
assert.equal(visual.design,catalog.design);assert.equal(visual.guides,catalog.guides.length);
const hash=path=>createHash('sha256').update(readFileSync(path)).digest('hex');
const files=[];
for(const g of catalog.guides){
 const from=root+'/'+g.pdf,digest=hash(from);assert.equal(digest,visual.pdfSha256[g.slug],g.slug+' needs current visual review');
 const folder=(g.audience==='military'?'public':'civilian-site')+'/downloads/guides';mkdirSync(folder,{recursive:true});
 const to=folder+'/'+g.slug+'.pdf';copyFileSync(from,to);assert.equal(hash(to),digest);
 files.push({slug:g.slug,path:to,sha256:digest});
}
writeFileSync(root+'/pdf-staging-report.json',JSON.stringify({stagedAt:new Date().toISOString(),deployed:false,files},null,2)+'\n');
console.log(`${files.length} reviewed PDFs staged and verified. Site HTML and deployment were not changed.`);
