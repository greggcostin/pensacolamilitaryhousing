// Shared, idempotent header tools for every civilian page and future factory output.
import {readFileSync,writeFileSync,mkdirSync,readdirSync} from 'node:fs';
import {join,resolve} from 'node:path';import {fileURLToPath,pathToFileURL} from 'node:url';import {createHash} from 'node:crypto';
const assetName='civilian-header-search';
export function installCivilianHeaderAssets(root){
 mkdirSync(join(root,'assets'),{recursive:true});
 for(const ext of ['css','js'])writeFileSync(join(root,'assets',assetName+'.'+ext),readFileSync(new URL('./'+assetName+'.'+ext,import.meta.url)));
}
export function withCivilianHeaderTools(html,root){
 if(!/<nav class="main-banner"/.test(html))return html;
 html=html.replace(/<nav class="main-banner"[\s\S]*?<\/nav>/,nav=>{
  if(!nav.includes('https://pensacolamilitaryhousing.com/mortgage-calculators'))nav=nav.replace('<a href="/blog"','<a class="gc-calculator" href="https://pensacolamilitaryhousing.com/mortgage-calculators">Calculator</a>\n<a href="/blog"');
  if(!nav.includes('data-gc-site-search'))nav=nav.replace('<a class="mil-link"','<a class="banner-search" href="/resources" data-gc-site-search aria-label="Search the site" aria-haspopup="dialog" aria-controls="gc-site-search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg><span>Search</span></a>\n<a class="mil-link"');
  if(!nav.includes('data-gc-site-search')||!nav.includes('class="gc-calculator"'))throw Error('Civilian header insertion point missing');
  return nav;
 });
 const version=ext=>createHash('sha256').update(readFileSync(join(root,'assets',assetName+'.'+ext))).digest('hex').slice(0,12);
 const css='<link rel="stylesheet" href="/assets/'+assetName+'.css?v='+version('css')+'" data-gc-header-tools>';
 const js='<script src="/assets/'+assetName+'.js?v='+version('js')+'" defer data-gc-header-tools></script>';
 const cssPattern=/<link\b[^>]*data-gc-header-tools[^>]*>/;
 html=cssPattern.test(html)?html.replace(cssPattern,()=>css):html.replace('</head>',css+'\n</head>');
 if(!html.includes('id="gc-site-search"'))html=html.replace('</body>','<dialog class="gc-search-dialog" id="gc-site-search" aria-labelledby="gc-search-title"><button type="button" class="gc-search-close" aria-label="Close search" data-gc-search-close>&times;</button><h2 id="gc-search-title">Find what you need</h2><p>Search our guides, neighborhoods, schools and real estate articles.</p><p role="status">Loading search...</p><div id="gc-search-results"></div><p><a href="/resources">Browse the resource library</a> or <a href="/search">search homes for sale</a>.</p></dialog>\n</body>');
 const scriptPattern=/<script\b[^>]*data-gc-header-tools[^>]*>[\s\S]*?<\/script>/;
 return scriptPattern.test(html)?html.replace(scriptPattern,()=>js):html.replace('</body>',js+'\n</body>');
}
const walk=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(dir,e.name)):[join(dir,e.name)]);
export function updateCivilianHeaders(root){
 installCivilianHeaderAssets(root);let changed=0,pages=0;
 for(const p of walk(root).filter(p=>p.endsWith('.html'))){const before=readFileSync(p,'utf8'),after=withCivilianHeaderTools(before,root);if(before.includes('<nav class="main-banner"'))pages++;if(after!==before){writeFileSync(p,after);changed++;}}
 return {pages,changed};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){const i=process.argv.indexOf('--root');if(i<0)throw Error('Provide --root');console.log(JSON.stringify(updateCivilianHeaders(resolve(process.argv[i+1]))));}
