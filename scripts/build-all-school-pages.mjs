// Publish one canonical guide for every school, retaining duplicate source identities.
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {buildPage,breadcrumbs,webPage,makeOgCard,gate} from './civilian-page-lib.mjs';
import {profileContext,schoolProfileMarkup,schoolFormat,escapeHtml as e} from './school-profile-lib.mjs';
import {loadSchoolInsights} from './school-insight-lib.mjs';
const ctx=profileContext(),legacy=loadSchoolInsights({required:true}),date='2026-09-06';
const all=[...new Map(ctx.directory.schools.map(s=>[s.reportUrl,s])).values()];
// Use the first directory identity for the primary presentation of grouped records.
const schools=all.map(s=>ctx.directory.schools.find(p=>p.reportUrl===s.reportUrl));
const made=[];
for(const s of schools){
 if(!s.reportUrl)throw Error('School has no canonical page '+s.id);
 if(legacy[s.reportUrl])continue;
 const name=s.name.replaceAll('&','and');
 const sameName=schools.filter(p=>p.name===s.name).length>1;
 const label=sameName?`${name} (${s.city})`:name;
 const title=label.length<=49?label+' | School Guide':label.slice(0,62);
 const short=name.length>63?name.slice(0,60)+'...':name;
 let desc=`${short}: school information, ${s.sector==='private'?'admissions':'enrollment'}, local planning insight and nearby options in ${s.city}, ${s.state}. Explore the guide.`;
 if(s.alabamaAccountability?.grade)desc=`${short}: Alabama 2024–25 grade ${s.grade}, ${s.alabamaAccountability.score}/100 total points, official indicators, enrollment questions and local school-planning guidance.`;
 if(desc.length>161)desc=`${short}: school data, local planning insight, enrollment questions and nearby options. Explore this ${s.city} school guide.`;
 if(desc.length>161)desc=`${short}: school data, local planning insight, enrollment questions and nearby options for your family's school search.`;
 if(desc.length>161)desc=`${name.slice(0,48)}: a sourced guide to school data, enrollment questions and local planning considerations for your family.`;
 if(desc.length<120)desc+=' Read the sources.';
 let main=schoolProfileMarkup(s,ctx);
 // Break only long text-only paragraphs at sentence boundaries for comfortable reading.
 main=main.replace(/<p>([^<]+)<\/p>/g,(block,text)=>{if(text.split(/\s+/).length<=82)return block;const sentences=text.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g)||[text];let groups=[],part='';for(const sentence of sentences){if((part+' '+sentence).split(/\s+/).length>78&&part){groups.push(part);part='';}part+=sentence;}if(part)groups.push(part);return groups.map(g=>'<p>'+g.trim()+'</p>').join('');});
 const page=s.reportUrl,ogSlug=page.slice(1).replaceAll('/','-');
 const schema={'@context':'https://schema.org','@type':'School','@id':'https://greggcostin.com'+page+'#school',name:s.name,url:'https://greggcostin.com'+page,address:{'@type':'PostalAddress',streetAddress:s.address,addressLocality:s.city,addressRegion:s.state,postalCode:s.zip,addressCountry:'US'},identifier:ctx.directory.schools.filter(p=>p.reportUrl===page).map(p=>p.ncesId||p.id),educationalLevel:s.levels};
 if(!s.virtual&&Number.isFinite(s.lat)&&Number.isFinite(s.lng))schema.geo={'@type':'GeoCoordinates',latitude:s.lat,longitude:s.lng};
 if(s.website)schema.sameAs=s.website;
 const spec={file:page.slice(1)+'.html',path:page,title,desc,keywords:`${s.name}, ${s.city} schools, ${schoolFormat(s)}, school guide`,h1:s.name,lead:`${e(schoolFormat(s))} in ${e(s.city)}, ${e(s.state)}. A sourced guide to its identity, available data, enrollment questions and local planning considerations.`,main,ogSlug,dateISO:date,schemaBlocks:[webPage('WebPage',{title,desc,path:page,dateISO:date}),breadcrumbs([{name:'Home',path:'/'},{name:'Schools',path:'/schools'},{name:s.name,path:page}]),schema]};
  let html=buildPage(spec);
  if(s.sector==='private')html=html.replace('Check current attendance zones, enrollment, and programs with the school district. A property address is the starting point for assignment questions.','Confirm current programs, tuition, admissions and available places directly with the school. Nearby housing does not establish enrollment eligibility.');
 html=html.replace('</head>','<link rel="stylesheet" href="/assets/school-guides.css">\n</head>');
 // Page-local geography describes the school, rather than the realtor's Pensacola office.
 html=html.replace('name="geo.region" content="US-FL"',`name="geo.region" content="US-${s.state}"`).replace('name="geo.placename" content="Pensacola"',`name="geo.placename" content="${e(s.city)}"`);
 if(!s.virtual&&Number.isFinite(s.lat)&&Number.isFinite(s.lng)){html=html.replace('content="30.4213;-87.2169"',`content="${s.lat};${s.lng}"`).replace('content="30.4213, -87.2169"',`content="${s.lat}, ${s.lng}"`);}
 else html=html.replace(/<meta name="(?:geo.position|ICBM)"[^>]*>\s*/g,'');
 const errors=gate({title,desc,minWords:450},html);if(errors.length)throw Error(page+': '+errors.join('; '));
 writeFileSync('civilian-site'+page+'.html',html.replace(/[ \t]+(?=\r?$)/gm,'').replace(/(?:\r?\n)+$/,'\n'));
 if(!existsSync(`civilian-site/og/${ogSlug}.png`)){
  const words=s.name.split(/\s+/),lines=[];let line='';for(const word of words){if((line+' '+word).length>24&&line){lines.push(line);line='';}line+=(line?' ':'')+word;}if(line)lines.push(line);
  await makeOgCard(ogSlug,lines.slice(0,3),`${s.city}, ${s.state} | School guide`);
 }
 made.push(s);
}
let sitemap=readFileSync('civilian-site/sitemap.xml','utf8');
for(const s of made)if(!sitemap.includes(`<loc>https://greggcostin.com${s.reportUrl}</loc>`))sitemap=sitemap.replace('</urlset>',`  <url><loc>https://greggcostin.com${s.reportUrl}</loc><lastmod>${date}</lastmod></url>\n</urlset>`);
writeFileSync('civilian-site/sitemap.xml',sitemap);
let llms=readFileSync('civilian-site/llms.txt','utf8');
const start='<!-- ALL_SCHOOL_GUIDES_START -->',end='<!-- ALL_SCHOOL_GUIDES_END -->';
const block=`${start}\n## Complete school guides\n\n${ctx.directory.schools.length} source records map to ${schools.length} canonical school guides. Duplicate federal identities share a school page. Alabama public-school guides include 2024–25 official letter grades and total scores where published; Florida accountability results use 2025–26. The states use different systems. CP identifies a documented Christian private school; P identifies other private schools. Private-school guides describe published educational approaches and admissions without public-school accountability grades. Directory years and verified campus updates are identified per page.\n\n${schools.map(s=>`- [${s.name}](https://greggcostin.com${s.reportUrl}): ${schoolFormat(s)}, ${s.city}, ${s.state}; ${s.alabamaAccountability?.grade?`Alabama 2024–25 grade ${s.grade}, ${s.alabamaAccountability.score}/100 total points; `:''}school data, local planning context, enrollment and comparison resources.`).join('\n')}\n${end}`;
llms=llms.includes(start)?llms.replace(/<!-- ALL_SCHOOL_GUIDES_START -->[\s\S]*?<!-- ALL_SCHOOL_GUIDES_END -->/,block):llms+'\n\n'+block+'\n';writeFileSync('civilian-site/llms.txt',llms);
console.log(`School pages: ${schools.length} canonical guides, ${made.length} directory/private guides generated; ${Object.keys(legacy).length} existing editorial reports retained.`);
