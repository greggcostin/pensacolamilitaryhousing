// Keep the reviewed biography changes; preserve unrelated current production bytes.
// Generic source generators can include newer photography than a published snapshot.
import {readFileSync,writeFileSync,copyFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {json,save,stageBaseline,inventory} from './isolated-release-lib.mjs';
import {refreshEntityHtml} from './entity-sync-lib.mjs';
const dir=resolve('docs/geo-execution-2026-09-10/identity-release');
const prepared=json(join(dir,'candidate.json'));
const proof=json('docs/geo-execution-2026-09-10/production/production-baseline.json');
const candidate=resolve('.coast-release/geo-20260910/identity-scoped');
if(prepared.candidate===candidate)throw Error('Scoped candidate already exists; inspect before restaging');
stageBaseline(proof,candidate);
const run=args=>{const p=spawnSync(process.execPath,args,{stdio:'inherit',windowsHide:true});if(p.status!==0)throw Error('Failed: '+args.join(' '));};
// Reapply the pure body renderer to current delivered HTML. Editable styles were
// restored/reprepared in the prepared candidate; this release changes no CSS.
run(['scripts/build-professional-profile.mjs','--root',join(candidate,'gc')]);
for(const name of ['index','team']){
 const file=join(candidate,'gc',name+'.html');writeFileSync(file,refreshEntityHtml(readFileSync(file,'utf8'),{site:'gc'}));
}
for(const name of ['index','about','contact','pcs-guide','communities','mortgage-calculators'])copyFileSync(join(prepared.candidate,'pmh',name+'.html'),join(candidate,'pmh',name+'.html'));
copyFileSync(prepared.candidate+'/pmh'+prepared.sourceBundle.candidate,candidate+'/pmh'+prepared.sourceBundle.candidate);
for(const site of ['gc','pmh']){
 copyFileSync('public/data/gregg-costin.json',join(candidate,site,'data/gregg-costin.json'));
 run(['scripts/build-blog-search.mjs',site,'--root',join(candidate,site),'--preserve-photography','--report',join(dir,'search-'+site+'.json')]);
}
const record=inventory(proof,candidate);
const allowed={gc:new Set(['index.html','team.html','data/gregg-costin.json']),pmh:new Set(['index.html','about.html','contact.html','pcs-guide.html','communities.html','mortgage-calculators.html','data/gregg-costin.json',prepared.sourceBundle.candidate.slice(1)])};
const unexpected=record.changes.filter(c=>!c.path.startsWith('pagefind/')&&!allowed[c.site].has(c.path));
if(record.removed.length||unexpected.length)throw Error('Unexpected release scope: '+JSON.stringify({removed:record.removed,unexpected}));
save(join(dir,'prepared-candidate.json'),prepared);
save(join(dir,'candidate.json'),{...record,releaseMessage:prepared.releaseMessage,sourceBundle:prepared.sourceBundle,scope:'Identity and biography only; all existing photography, styles, school pages, maps, forms and tracking files preserved byte-for-byte. Search rebuilt from published pages only.'});
console.log(JSON.stringify({candidate,changed:record.changes.length,preserved:record.preserved,contentChanges:record.changes.filter(c=>!c.path.startsWith('pagefind/')).map(c=>c.site+'/'+c.path),removed:0}));
