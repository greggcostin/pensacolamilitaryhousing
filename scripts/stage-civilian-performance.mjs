import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {join,resolve,relative} from 'node:path';
import {spawnSync} from 'node:child_process';
import {stageBaseline,inventory,walk,json,save} from './isolated-release-lib.mjs';
import {bundleCivilianStyles} from './civilian-style-bundle.mjs';
const dir='docs/performance-2026-09-09',candidate=resolve('.coast-release/2026-09-09-civilian-performance');
if(existsSync(join(dir,'deployment.json')))throw Error('Published candidate is immutable');
const proof=json(join(dir,'baseline/production-baseline.json'));stageBaseline(proof,candidate);
const root=join(candidate,'gc'),results=[];
const base=proof.sites.find(s=>s.site==='gc').localBaseline;
for(const f of walk(base).filter(f=>f.endsWith('.html')))writeFileSync(join(root,relative(base,f)),readFileSync(f));
const run=args=>{const r=spawnSync(process.execPath,args,{encoding:'utf8',maxBuffer:4e6});if(r.status!==0)throw Error(r.stderr||r.stdout);return r.stdout.trim();};
const logos=JSON.parse(run(['scripts/generate-responsive-images.mjs','--gc-root',root,'--logos-only']));
console.log('Created six responsive header marks');
console.log(run(['scripts/apply-responsive-images.mjs','--civilian','--gc-root',root,'--logos-only']));
for(const f of walk(root).filter(f=>f.endsWith('.html'))){
  let html=readFileSync(f,'utf8');
  if(relative(root,f)==='index.html')html=html.replace(/(<div class="gc-hero-image">[\s\S]*?<img\b[^>]*)(>)/,(_,tag,end)=>tag.replace(/\sfetchpriority="[^"]*"/g,'')+' fetchpriority="high"'+end);
  // The measured buying page renders sooner with its existing stylesheet order.
  // Keep that order and apply the smaller header marks there.
  const result=relative(root,f)==='buy.html'?{html,changed:false,delivery:'existing-styles'}:await bundleCivilianStyles(html,root,{inline:['index.html','neighborhoods.html','schools.html'].includes(relative(root,f))});writeFileSync(f,result.html);
  const {html:unused,...detail}=result;results.push({path:relative(root,f).replaceAll('\\','/'),...detail});
}
const record=inventory(proof,candidate);record.releaseMessage='Faster civilian styles and responsive branding; content and tracking preserved';
save(join(dir,'candidate.json'),record);save(join(dir,'delivery-changes.json'),{builtAt:new Date().toISOString(),logos,pages:results});
console.log(JSON.stringify({candidate,changes:record.changes.length,preserved:record.preserved,removed:record.removed,pages:results.length,uniqueBundles:new Set(results.map(r=>r.id)).size},null,2));
