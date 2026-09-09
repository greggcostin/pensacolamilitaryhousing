// Build from public main content in an isolated copy so a mix of Pagefind markers
// cannot silently omit the civilian catalog. Published HTML is left intact.
import {readFileSync,writeFileSync,readdirSync,mkdirSync,mkdtempSync} from 'node:fs';
import {join,relative,resolve} from 'node:path';import {spawnSync} from 'node:child_process';import {fileURLToPath} from 'node:url';
import {ROOT,SITES} from './blog-lib.mjs';
const walk=d=>readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(d,e.name)):[join(d,e.name)]);
const selected=process.argv[2]?[process.argv[2]]:['gc','pmh'];
const arg=k=>process.argv.includes(k)?process.argv[process.argv.indexOf(k)+1]:null;
for(const key of selected){const site=SITES[key];if(!site)throw Error('Unknown site '+key);
 const root=resolve(arg('--root')||join(ROOT,site.siteDir)),stagingParent=join(ROOT,'artifacts/search-input');mkdirSync(stagingParent,{recursive:true});const staging=mkdtempSync(join(stagingParent,key+'-'));let count=0;
 // Finalize photography before indexing so new posts cannot restore credit clutter.
 const attribution=spawnSync(process.execPath,[join(ROOT,'scripts/build-photography-credits.mjs'),'--site',key,'--root',root,'--gc-root',arg('--gc-root')||join(ROOT,'civilian-site')],{encoding:'utf8',cwd:ROOT});
 if(attribution.status)throw Error(attribution.stderr||attribution.stdout);
 for(const file of walk(root).filter(f=>f.endsWith('.html')&&!f.endsWith('404.html'))){let html=readFileSync(file,'utf8');if(/<meta\b[^>]*name="robots"[^>]*content="[^"]*noindex/i.test(html))continue;
  if(/<main\b/.test(html))html=html.replace(/data-pagefind-body/g,'data-original-pagefind-body').replace(/<main\b/, '<main data-pagefind-body');
  else if(!html.includes('data-pagefind-body'))throw Error('Search page lacks a main content marker: '+file);
  const dest=join(staging,relative(root,file));mkdirSync(resolve(dest,'..'),{recursive:true});writeFileSync(dest,html);count++;
 }
 // Resolve the installed package; no package download or external API.
 const entry=fileURLToPath(new URL('./runner/bin.cjs',import.meta.resolve('pagefind')));
 const result=spawnSync(process.execPath,[entry,'--site',staging,'--output-path',join(root,'pagefind'),'--force-language','en'],{encoding:'utf8'});
 console.log(result.stdout);if(result.status)throw Error(result.stderr||'Pagefind failed');
 if(!result.stdout.includes('Indexed '+count+' pages'))throw Error('Search index does not cover all '+count+' public pages');
 const report=arg('--report')||join(ROOT,'artifacts/catalog-qa/search-'+key+'.json');mkdirSync(resolve(report,'..'),{recursive:true});writeFileSync(report,JSON.stringify({site:key,pages:count,source:'published main content',builtAt:new Date().toISOString()},null,2)+'\n');
}
