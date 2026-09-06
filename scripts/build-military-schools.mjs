// One school repository, two owned editions. Run after the civilian school factories.
import {readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, copyFileSync} from 'node:fs';
import {dirname} from 'node:path';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
import {renderMilitaryPage} from './page-factory.mjs';
import {militarySchoolContext, militaryHubContext} from './military-school-context.mjs';
import {uniqueSchoolGuides} from './school-browse-lib.mjs';

const PMH='https://pensacolamilitaryhousing.com', GC='https://greggcostin.com';
const data=JSON.parse(readFileSync('civilian-site/assets/school-finder-data.json','utf8'));
const guides=uniqueSchoolGuides(data.schools);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const write=(path,value)=>{mkdirSync(dirname(path),{recursive:true});if(!existsSync(path)||!readFileSync(path).equals(Buffer.isBuffer(value)?value:Buffer.from(value)))writeFileSync(path,value);};
const read=path=>readFileSync(path,'utf8');
const stripEdition=html=>html.replace(/<!-- SCHOOL_EDITION_START -->[\s\S]*?<!-- SCHOOL_EDITION_END -->/g,'');
const edition=(route,military)=>`<!-- SCHOOL_EDITION_START --><a class="gc-interior-action" data-school-edition="${military?'civilian':'military'}" href="${military?GC:PMH}${route}">${military?'View the local real estate guide':'Moving with military orders? View the PCS guide'} <span aria-hidden="true">↗</span></a><!-- SCHOOL_EDITION_END -->`;
const withEdition=(html,route,military)=>stripEdition(html).replace(/(<div class="gc-interior-hero-actions">)([\s\S]*?)(<\/div>)/,(_,a,b,c)=>a+b+edition(route,military)+c);
const mappedLinks={'/neighborhoods':'/communities','/search':'/pcs-home-search','/team':'/about','/resources/useful-links':'/pcs-guide','/resources':'/pcs-guide'};
function localLinks(html){
  return html.replace(/href="(\/[^"]*)"/g,(tag,href)=>{
    const [path,hash]=href.split('#');
    if(path.startsWith('/schools')||path.startsWith('/images/')||path.startsWith('/assets/'))return tag;
    const target=mappedLinks[path];
    if(target)return `href="${target}${hash?'#'+hash:''}"`;
    if(path==='/'||existsSync('public'+path+'.html')||existsSync('public'+path)||['/about','/contact','/communities','/pcs-guide','/mortgage-calculators'].includes(path))return tag;
    return `href="${GC}${href}"`;
  }).replace(/data-inquiry-type="[^"]*"/g,'data-inquiry-type="PCS / Relocation — Buying"').replace(/class="sg-table-scroll"/g,'class="table-wrap sg-table-scroll"');
}
function ownSchema(node,title,description,route){
  if(Array.isArray(node))return node.map(n=>ownSchema(n,title,description,route));
  if(typeof node==='string')return node.startsWith(GC+'/schools')?node.replace(GC,PMH):node;
  if(!node||typeof node!=='object')return node;
  const n=Object.fromEntries(Object.entries(node).map(([k,v])=>[k,ownSchema(v,title,description,route)]));
  if(n['@type']==='WebSite'){n['@id']=PMH+'/#website';n.url=PMH+'/';n.name='Pensacola Military Housing';}
  if(n['@type']==='ListItem'&&n.position===1&&n.item===GC+'/')n.item=PMH+'/';
  if(['WebPage','Article','CollectionPage'].includes(n['@type'])){n.name=title;if(n.headline)n.headline=title;n.description=description;n.datePublished='2026-09-06';n.dateModified='2026-09-06';n.url=PMH+route;}
  return n;
}
const assets=['costin-experience.css','costin-interior.css','school-guides.css','school-finder.css','school-finder.js','school-finder-core.js','school-address-search.js','school-driving-route.js','school-finder-data.json'];
for(const name of assets){let content=read('civilian-site/assets/'+name);if(name.endsWith('.js'))content=content.replaceAll('/assets/','/school-assets/');write('public/school-assets/'+name,content);}
function copyTree(source,target){for(const e of readdirSync(source,{withFileTypes:true})){const from=source+'/'+e.name,to=target+'/'+e.name;if(e.isDirectory())copyTree(from,to);else write(to,readFileSync(from));}}
copyTree('civilian-site/assets/vendor/leaflet','public/school-assets/vendor/leaflet');
// Git uses LF on Cloudflare and may check out CRLF on Windows. Version the
// normalized text so cache keys and the prebuild gate agree on either host.
const version=name=>createHash('sha256').update(read('public/school-assets/'+name).replace(/\r\n/g,'\n')).digest('hex').slice(0,12);
function schoolStyles(source,hub){
  const inline=[...source.matchAll(/<style\b[^>]*>[\s\S]*?<\/style>/g)].map(m=>m[0]).join('\n');
  return inline+'\n'+['costin-experience.css','costin-interior.css',hub?'school-finder.css':'school-guides.css','military-schools.css'].map(name=>`<link rel="stylesheet" href="/school-assets/${name}?v=${version(name)}">`).join('\n');
}
async function ogCard(slug,name,subtitle){
  const path='public/og/'+slug.replaceAll('/','-')+'.png';
  if(existsSync(path))return;
  const words=name.split(' '),lines=[];let line='';for(const word of words){if((line+' '+word).length>33&&line){lines.push(line);line=word;}else line+=(line?' ':'')+word;}if(line)lines.push(line);
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#101b30"/><path d="M0 570Q400 420 1200 580V630H0Z" fill="#18334a"/><rect x="50" y="48" width="1100" height="534" rx="2" fill="none" stroke="#c9a84c" stroke-width="2"/><text x="90" y="110" fill="#e0c27b" font-size="22" font-family="Arial" letter-spacing="3">PENSACOLA MILITARY HOUSING</text><text x="90" y="177" fill="#c7d2e3" font-size="24" font-family="Arial">SCHOOLS • LOCAL FACTS • PCS PLANNING</text>${lines.map((l,i)=>`<text x="90" y="${267+i*64}" fill="#ffffff" font-family="Georgia" font-size="50">${esc(l)}</text>`).join('')}<text x="90" y="520" fill="#e0c27b" font-family="Arial" font-size="24">${esc(subtitle)}</text></svg>`;
  write(path,await sharp(Buffer.from(svg)).png().toBuffer());
}
for(const school of [null,...guides]){
  const route=school?.reportUrl||'/schools',slug=route.slice(1),sourcePath='civilian-site/'+slug+'.html';
  const source=stripEdition(read(sourcePath));
  const name=school?.name||'School Finder & PCS Family Guides';
  const title=school?(name.length<=46?name+' | PCS School Guide':name.length<=65?name:name.slice(0,62)+'...'):'School Finder & PCS Family Guides | Pensacola Military Housing';
  const briefName=school?(name.length>56?name.slice(0,53)+'...':name):'';
  const description=school?`${briefName}: school facts, enrollment resources and PCS planning in ${school.city}. Explore local options and prepare for your military move.`:'Find public, private and Christian schools near Pensacola and Gulf Coast military bases. Compare mapped campuses, school guides and PCS enrollment resources.';
  const desc=description.length>165?`${briefName}: school facts, enrollment resources and PCS guidance. Compare options and prepare for your military move.`:description;
  let html=renderMilitaryPage({slug,title,description:desc,keywords:'PCS school guide, '+name+', military relocation schools',breadcrumbName:name,h1:esc(name),lead:desc,articleHeadline:title},'<p>School guide.</p>');
  html=html.replace(/Last updated: [A-Za-z]+ \d{1,2}, \d{4}/,'Last updated: September 6, 2026');
  html=html.replace(/(<meta property="article:(?:published|modified)_time" content=")[^"]*/g,'$12026-09-06T00:00:00Z');
  html=html.replace(/<meta name="(?:geo\.(?:region|placename|position)|ICBM)"[^>]*>\s*/g,'');
  if(school){const mapped=!school.virtual&&Number.isFinite(school.lat)&&Number.isFinite(school.lng);html=html.replace('</head>',`<meta name="geo.region" content="US-${esc(school.state)}">\n<meta name="geo.placename" content="${esc(school.city)}">\n${mapped?`<meta name="geo.position" content="${school.lat};${school.lng}">\n<meta name="ICBM" content="${school.lat}, ${school.lng}">\n`:''}</head>`);}
  let header=source.match(/<header\b[\s\S]*?<\/header>/)?.[0];
  let main=source.match(/<main\b[^>]*>[\s\S]*?<\/main>/)?.[0];
  if(!header||!main)throw Error('School structure missing: '+route);
  header=header.replace(/(<span class="gc-interior-kicker">)[\s\S]*?<\/span>/,'$1Your school research, with a PCS plan</span>');
  if(!school)header=header.replace(/<h1>[\s\S]*?<\/h1>/,'<h1>Your next duty station.<br>Your family’s school plan.</h1>').replace(/<p class="lead">[\s\S]*?<\/p>/,'<p class="lead">Explore public, private and Christian schools across Pensacola, the Emerald Coast and coastal Alabama. Compare the same local school facts with enrollment resources and military transition guidance for your PCS.</p>');
  else header=header.replace(/(<p class="lead">)([\s\S]*?)(<\/p>)/,'$1$2 Use the PCS planning section below to prepare for a school transition.$3');
  header=withEdition(localLinks(header),route,true);
  if(school)header=header.replace('<div class="gc-interior-hero-actions">','<div class="gc-interior-hero-actions"><a class="gc-interior-action" href="#military-school-planning">Plan a PCS school transition <span aria-hidden="true">↗</span></a>');
  if(school)main=main.replace(/(<div class="gc-interior-content">)/,'$1'+militarySchoolContext(school));
  else main=main.replace('<!-- PRIVATE_SCHOOL_RESOURCES_START -->',militaryHubContext()+'<!-- PRIVATE_SCHOOL_RESOURCES_START -->');
  main=localLinks(main).replace('<main id="main-content">','<main id="main-content" data-pagefind-body>');
  html=html.replace(/<header\b[\s\S]*?<\/header>/,()=>header).replace(/<main\b[^>]*>[\s\S]*?<\/main>/,()=>main);
  const attrs=source.match(/<body([^>]*)>/)[1].replace('class="','class="pmh-school-page ');
  html=html.replace(/<body[^>]*>/,'<body'+attrs+'>');
  html=html.replace(/<script type="application\/ld\+json"(?![^>]*data-entity)[^>]*>[\s\S]*?<\/script>/g,'');
  const schemas=[...source.matchAll(/<script type="application\/ld\+json"([^>]*)>([\s\S]*?)<\/script>/g)].filter(m=>!m[1].includes('data-entity')).map(m=>`<script type="application/ld+json">${JSON.stringify(ownSchema(JSON.parse(m[2]),title,desc,route))}</script>`).join('\n');
  html=html.replace('</head>',schemas+'\n'+schoolStyles(source,!school)+(school?'':`\n<script type="module" src="/school-assets/school-finder.js?v=${version('school-finder.js')}"></script>` )+'\n</head>');
  html=html.replaceAll('/og/'+slug+'.png','/og/'+slug.replaceAll('/','-')+'.png');
  // Source images retain their attribution; PMH serves a local copy where needed.
  for(const m of html.matchAll(/(?:["'(,\s])(\/images\/[^\s"'),<>]+)/g)){const path=m[1];if(!existsSync('public'+path)&&existsSync('civilian-site'+path)){mkdirSync(dirname('public'+path),{recursive:true});copyFileSync('civilian-site'+path,'public'+path);}}
  write('public/'+slug+'.html',html);
  write(sourcePath,withEdition(source,route,false));
  await ogCard(slug,name,school?`${school.city}, ${school.state} • School & relocation guide`:'Explore schools. Prepare for your next move.');
}
let sitemap=read('public/sitemap.xml');for(const route of ['/schools',...guides.map(s=>s.reportUrl)]){const url=PMH+route;if(!sitemap.includes('<loc>'+url+'</loc>'))sitemap=sitemap.replace('</urlset>',`  <url><loc>${url}</loc><lastmod>2026-09-06</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>\n</urlset>`);}write('public/sitemap.xml',sitemap);
let llms=read('public/llms.txt').replace(/\n<!-- MILITARY_SCHOOL_GUIDES_START -->[\s\S]*?<!-- MILITARY_SCHOOL_GUIDES_END -->\n?/,'\n').trimEnd();llms+='\n\n<!-- MILITARY_SCHOOL_GUIDES_START -->\n## School finder and individual PCS school guides\nShared official school facts with school-specific PCS enrollment context. School locations are not attendance boundaries.\n- [Interactive school finder]('+PMH+'/schools): Public, private, Christian and charter schools, ZIP and address search, map, official grades and school guides.\n'+guides.map(s=>`- [${s.name}](${PMH}${s.reportUrl}): ${s.city}, ${s.state}; ${s.sector}${s.christian?', Christian':''}; school facts and PCS planning.`).join('\n')+'\n<!-- MILITARY_SCHOOL_GUIDES_END -->\n';write('public/llms.txt',llms);
let headers=read('public/_headers');if(!headers.includes('/school-assets/*'))headers+='\n# Shared school data and map modules use stable filenames. Revalidate after updates.\n/school-assets/*\n  Cache-Control: public, max-age=0, must-revalidate\n';write('public/_headers',headers);
console.log(`Built PMH school hub + ${guides.length} school guides, corresponding edition links, local assets, OG cards and discovery entries.`);
