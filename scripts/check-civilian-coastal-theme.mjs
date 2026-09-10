// Exact preservation against this task's immutable production baseline.
// Theme presentation plus Gregg's requested city cards, credits and review labels.
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {join,relative,resolve} from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {walk} from './isolated-release-lib.mjs';
import {COASTAL_THEME,coastalVersion,withoutCoastalThemeLink,withCivilianCoastalTheme} from './civilian-coastal-theme.mjs';
import {withSearchCityCards,withSearchCityCredits,searchCityData} from './civilian-search-city-cards.mjs';
import {withReviewPlatformLabels} from './civilian-review-badges.mjs';
import {withContactNightPhoto,withContactNightCredits,withContactNightCreditCatalog,contactPhotoData} from './civilian-contact-photo.mjs';
const root=resolve('.coast-release/coastal-theme-20260910/gc');
const baseline=resolve('.coast-release/coastal-theme-20260910/baseline/gc');
const out='docs/coastal-theme-2026-09-10/preservation.json';
const hash=b=>createHash('sha256').update(b).digest('hex');
function originalMarkup(html){
 return withoutCoastalThemeLink(html).replace(/<body\b([^>]*)>/i,(_,attrs)=>{
  attrs=attrs.replace(/\sdata-gc-(?:theme|coastal-family)="[^"]*"/g,'');
  attrs=attrs.replace(/\sclass="([^"]*)"/,(_,c)=>{const classes=c.split(/\s+/).filter(s=>s&&!['gc-coastal','gc-coastal--error'].includes(s));return classes.length?` class="${classes.join(' ')}"`:'';});
  return '<body'+attrs+'>';
 }).replace(/\s*<\/head>/,'</head>');
}
// Confirm this gate detects losses independently of the real candidate.
const fixture='<html><head><title>Original</title><script type="application/ld+json">{"@type":"WebPage"}</script></head><body class="gc-page"><main><h1>Original heading</h1><p>Evidence remains available.</p><form><input required name="email"></form></main></body></html>';
assert.equal(originalMarkup(withCivilianCoastalTheme(fixture)),originalMarkup(fixture));
for(const [a,b] of [['Original heading','Changed heading'],['required','disabled'],['WebPage','Thing'],['Evidence remains available.','']])assert.notEqual(originalMarkup(withCivilianCoastalTheme(fixture.replace(a,b))),originalMarkup(fixture));
const findings=[],families={},counts={pages:0,jsonLdBlocks:0,unchangedAssets:0,restoredConfigurationFiles:0,forms:0,images:0};
for(const path of walk(baseline)){
 const name=relative(baseline,path),after=join(root,name);
 if(!existsSync(after)){findings.push({path:name,issue:'Missing original file'});continue;}
 if(name==='_headers'){
  const source=resolve('.coast-release/civilian-header-label-20260909/gc/_headers');
  if(hash(readFileSync(source))!==hash(readFileSync(after)))findings.push({path:name,issue:'Published school-data header configuration was not retained'});
  else counts.restoredConfigurationFiles++;
  continue;
 }
 if(name.replaceAll('\\','/')==='data/photography-credits.json'){
  if(withContactNightCreditCatalog(readFileSync(path,'utf8'))!==readFileSync(after,'utf8'))findings.push({path:name,issue:'Photography catalog changed beyond the new Palafox credit'});
  continue;
 }
 if(!path.endsWith('.html')){if(hash(readFileSync(path))!==hash(readFileSync(after)))findings.push({path:name,issue:'Original asset changed'});else counts.unchangedAssets++;continue;}
 counts.pages++;const a=readFileSync(path,'utf8'),b=readFileSync(after,'utf8');
 const expected=name==='search.html'?withSearchCityCards(a):name==='photo-credits.html'?withContactNightCredits(withSearchCityCredits(a)):name==='reviews.html'?withReviewPlatformLabels(a):name==='contact.html'?withContactNightPhoto(a):a;
 if(originalMarkup(expected)!==originalMarkup(b))findings.push({path:name,issue:'Protected HTML changed outside the requested design refinements'});
 if((b.match(/data-gc-coastal-theme/g)||[]).length!==1) findings.push({path:name,issue:'Expected exactly one stylesheet'});
 if(!b.includes(`/assets/civilian-coastal-theme.css?v=${coastalVersion()}`)||!b.includes(`data-gc-theme="${COASTAL_THEME}"`))findings.push({path:name,issue:'Missing current theme'});
 if(withCivilianCoastalTheme(b)!==b)findings.push({path:name,issue:'Theme not idempotent'});
 const family=b.match(/data-gc-coastal-family="([^"]+)"/)?.[1];families[family]=(families[family]||0)+1;
 for(const m of b.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)){try{JSON.parse(m[1]);counts.jsonLdBlocks++;}catch(e){findings.push({path:name,issue:'Invalid JSON-LD: '+e.message});}}
 counts.forms+=(b.match(/<form\b/g)||[]).length;counts.images+=(b.match(/<img\b/g)||[]).length;
}
const newFiles=walk(root).map(p=>relative(root,p)).filter(p=>!existsSync(join(baseline,p)));
const expectedNewFiles=['assets/civilian-coastal-theme.css',...[...searchCityData.assets,...contactPhotoData.assets].filter(a=>!existsSync(join(baseline,a.path))).map(a=>a.path)].sort();
if(JSON.stringify(newFiles.map(p=>p.replaceAll('\\','/')).sort())!==JSON.stringify(expectedNewFiles))findings.push({issue:'Unexpected added assets',newFiles});
for(const asset of searchCityData.assets)if(!existsSync(join(root,asset.path))||hash(readFileSync(join(root,asset.path)))!==asset.sha256)findings.push({path:asset.path,issue:'City image differs from reviewed responsive asset'});
for(const asset of contactPhotoData.assets)if(!existsSync(join(root,asset.path))||hash(readFileSync(join(root,asset.path)))!==asset.sha256)findings.push({path:asset.path,issue:'Palafox photo differs from reviewed responsive asset'});
const report={checkedAt:new Date().toISOString(),root,baseline,counts,families,newFiles,scope:'Original HTML, metadata, JSON-LD, scripts, links and forms preserved except the five requested city links promoted to matching photo cards, explicit Google Reviews and Zillow Reviews badge labels, the replacement contact-page Palafox night photograph and caption, and their photography credits. Original public non-HTML assets remain byte-for-byte unchanged except the photography catalog receives the new Palafox attribution entry.',requestedRefinement:{cities:searchCityData.cards.map(c=>c.name),pages:['search.html','photo-credits.html','reviews.html','contact.html','data/photography-credits.json'],reviewLabels:['Google Reviews','Zillow Reviews'],neighborhoodNames:'Bold serif card headings through the shared theme stylesheet',contactPhoto:{path:contactPhotoData.credit.path,source:contactPhotoData.credit.sourceUrl,author:contactPhotoData.credit.credit,license:contactPhotoData.credit.license}},configurationRestoration:{file:'_headers',source:'.coast-release/civilian-header-label-20260909/gc/_headers',reason:'The initial source-derived configuration lacked the school-data no-cache rules. Restored the prior release configuration after verifying the current live school JSON response uses these headers.',liveEvidence:'prepublication-state.json'},selfTest:'Detected changed heading, form contract, schema and missing text',findings,ok:!findings.length};
writeFileSync(out,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));if(findings.length)process.exitCode=1;
