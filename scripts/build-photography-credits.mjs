import {readFileSync,writeFileSync,existsSync,mkdirSync,copyFileSync} from 'node:fs';
import {join,resolve,relative} from 'node:path';
import {spawnSync} from 'node:child_process';
import {collectCredits,renderCredits,saveCatalog,cleanPhotoCredits,walk,domains} from './photo-credits-lib.mjs';
import {IDS} from './entity-lib.mjs';
const arg=k=>process.argv.includes(k)?process.argv[process.argv.indexOf(k)+1]:null;
const site=arg('--site'),root=resolve(arg('--root')||'');
if(!domains[site]||(!existsSync(join(root,'index.html'))&&!(site==='pmh'&&existsSync(join(root,'first-time-military-homebuyer.html')))))throw Error('Provide --site gc|pmh --root <complete site>');
const out=arg('--report'),ledger=JSON.parse(readFileSync('content/blog/image-credits.json','utf8')).images;
// The editable SPA entry is outside public/. Include its images so source builds
// keep the same credits as a complete deployment containing the compiled shell.
const catalog=collectCredits(root,site,ledger,{extraFiles:arg('--spa-entry')?[resolve(arg('--spa-entry'))]:[]});
if(catalog.unmatched.length)throw Error('Cannot associate a caption with its photograph');
const creditsPath=join(root,'photo-credits.html');
if(!existsSync(creditsPath)){
  if(site!=='pmh')throw Error('Existing civilian credits page template required');
  const fragment=join(root,'photography.fragment.html');
  const spec={slug:'photo-credits',title:'Photography Credits | Pensacola Military Housing',description:'Photography credits, original image sources and licensing details for the Gulf Coast places, military life and local guides on Pensacola Military Housing.',keywords:'photography credits, Gulf Coast, military housing',breadcrumbName:'Photography credits',h1:'Photography credits',lead:'The people and places behind our Gulf Coast photography.',articleHeadline:'Photography credits',faq:[]};
  // The factory uses the current military nav, forms, footer, trackers and schema.
  writeFileSync(fragment,'<!--PAGE\n'+JSON.stringify(spec)+'\nPAGE-->\n'+renderCredits(catalog));
  const r=spawnSync(process.execPath,['scripts/page-factory.mjs',fragment],{env:{...process.env,COSTIN_PAGE_ROOT:root,COSTIN_PAGE_DATE:'2026-09-09'},encoding:'utf8'});
  if(r.status)throw Error(r.stderr||r.stdout);
  // Move the source fragment outside the deploy directory, never publish it.
  const {unlinkSync}=await import('node:fs');unlinkSync(fragment);
  const gcRoot=arg('--gc-root');if(!gcRoot)throw Error('Provide --gc-root for the shared photography share card');
  copyFileSync(join(gcRoot,'og/photo-credits.png'),join(root,'og/photo-credits.png'));
}
let credits=readFileSync(creditsPath,'utf8');
credits=credits.replace(/<main\b([^>]*)>[\s\S]*?<\/main>/,(_,attrs)=>{
  const h1=/<main\b[^>]*>[\s\S]*?<h1\b/.test(credits.split('</main>')[0])?'<h1>Photography credits</h1>':'';
  const body=renderCredits(catalog);
  const content=site==='gc'?`<div class="gc-interior-grid gc-interior-grid--wide"><div class="gc-interior-content"><div class="gc-page-intro">${body}</div></div></div>`:body;
  return `<main${attrs.replace(/\sdata-photography-catalog/g,'')} data-photography-catalog>${h1}${content}</main>`;
});
// Keep only page-appropriate existing entity nodes plus the dedicated page identity.
credits=credits.replace(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,(all,text)=>{
  const data=JSON.parse(text);
  if(data['@type']==='FAQPage'||data['@type']==='Article')return '';
  return all;
});
if(!credits.includes('"@type":"WebPage"'))credits=credits.replace('</head>',`<script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'WebPage','@id':`https://${domains[site]}/photo-credits#page`,url:`https://${domains[site]}/photo-credits`,name:'Photography credits',dateModified:'2026-09-09',publisher:{'@id':IDS.team}})}</script>\n</head>`);
writeFileSync(creditsPath,credits);
saveCatalog(root,catalog);
const ids=catalog.entries.map(e=>e.id.replace(/^photo-/,'')),changes=[];
const files=walk(root).filter(p=>p.endsWith('.html'));
if(arg('--spa-entry'))files.push(resolve(arg('--spa-entry')));
for(const file of files){
  const old=readFileSync(file,'utf8'),name=relative(root,file).replaceAll('\\','/');
  let result=name==='photo-credits.html'?cleanPhotoCredits(old,{footer:true,ids}):cleanPhotoCredits(old,{ids});
  if(name==='photo-credits.html'){
    // Credit text belongs on the credits page; only normalize its footer link.
    const originalMain=old.match(/<main\b[^>]*>[\s\S]*?<\/main>/)[0];
    result.html=result.html.replace(/<main\b[^>]*>[\s\S]*?<\/main>/,()=>originalMain);
  }
  if(site==='pmh'&&result.html.includes('id="root"')&&!result.html.includes('/assets/costin-photo-footer.js'))result.html=result.html.replace('</body>','<script defer src="/assets/costin-photo-footer.js"></script>\n</body>');
  if(result.html!==old)writeFileSync(file,result.html);
  changes.push({page:name,changed:result.html!==old,creditsMoved:result.changes.length,changes:result.changes});
}
if(site==='pmh'){
  mkdirSync(join(root,'assets'),{recursive:true});
  if(resolve('public/assets/costin-photo-footer.js')!==resolve(root,'assets/costin-photo-footer.js'))copyFileSync('public/assets/costin-photo-footer.js',join(root,'assets/costin-photo-footer.js'));
}
const sitemapFile=join(root,'sitemap.xml');let sitemap=readFileSync(sitemapFile,'utf8');
if(!sitemap.includes(`https://${domains[site]}/photo-credits</loc>`))sitemap=sitemap.replace('</urlset>',`<url><loc>https://${domains[site]}/photo-credits</loc><lastmod>2026-09-09</lastmod></url>\n</urlset>`);
writeFileSync(sitemapFile,sitemap);
const llmsFile=join(root,'llms.txt');let llms=readFileSync(llmsFile,'utf8');if(!llms.includes(`https://${domains[site]}/photo-credits`))writeFileSync(llmsFile,llms.trimEnd()+`\n- [Photography credits](https://${domains[site]}/photo-credits): image creators, sources and licenses.\n`);
const result={site,root,entries:catalog.entries.length,pages:changes.length,creditsMoved:changes.filter(c=>c.page!=='photo-credits.html').reduce((n,c)=>n+c.creditsMoved,0),changes};
if(out){mkdirSync(resolve(out,'..'),{recursive:true});writeFileSync(out,JSON.stringify(result,null,2)+'\n');}
console.log(JSON.stringify({site,root,entries:result.entries,pages:result.pages,creditsMoved:result.creditsMoved}));
