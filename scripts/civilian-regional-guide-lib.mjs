// Reviewed civilian editions, preserving existing identity, inquiry and consent contracts.
import {readFileSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import {quickAnswerHtml} from './quick-answer-lib.mjs';
import {REVIEWED} from '../content/communities/civilian-regional-guides.mjs';
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const link=(href,label)=>`<a href="${esc(href)}">${esc(label)}</a>`;
const section=(id,kicker,title,body)=>`<section class="cg-section" id="${id}" aria-labelledby="${id}-title"><p class="cg-eyebrow">${esc(kicker)}</p><h2 id="${id}-title">${esc(title)}</h2>${body}</section>`;
const question=label=>`<button class="cg-button cg-button-secondary" type="button" data-inquiry-open data-inquiry-type="General Question">${esc(label)}</button>`;
export function renderRegionalGuide(html,g,root){
  const oldMain=html.match(/<main\b[^>]*>[\s\S]*?<\/main>/)?.[0];
  if(!oldMain||/<script\b/.test(oldMain))throw Error('Expected static main: '+g.path);
  const retained=oldMain.match(/<section class="geo-guide"[\s\S]*?<\/section>/)?.[0]||'';
  const faqs=g.faqs.map(([q,a])=>({q,a}));
  for(const m of html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)){
    const n=JSON.parse(m[1]);
    if(n['@type']==='FAQPage'&&retained){
      const f=n.mainEntity.find(x=>x.name==='How should I compare Pensacola-area homes for a military move?');
      if(f)faqs.push({q:f.name,a:f.acceptedAnswer.text});
    }
  }
  const ledger=JSON.parse(readFileSync('content/blog/image-credits.json','utf8')).images;
  const credit=ledger['civilian-site'+g.image];
  if(!credit)throw Error('Missing image provenance '+g.image);
  const creditText=credit.creditRequired?`<figcaption>Photo: ${link(credit.pageUrl,credit.credit)}, ${esc(credit.license)}.${g.alt.startsWith('Archival')||credit.dateTaken?' Archival photograph.':''}</figcaption>`:'';
  const header=`<header class="cg-hero"><div class="cg-hero-inner"><div class="cg-hero-copy"><p class="cg-eyebrow">${esc(g.county)}</p><h1>${esc(g.name)}</h1><span class="cg-hero-line">${esc(g.line)}</span><p class="lead">${esc(g.lead)}</p><div class="cg-buttons"><a class="cg-button" href="/search">Explore homes ↗</a>${question('Plan my search')}</div><p class="cg-byline">By ${link('/team','Gregg Costin')} · Levin Rinke Realty<br>Florida &amp; Alabama licensed · Guide reviewed September 8, 2026</p></div><figure class="cg-hero-media"><picture><img src="${esc(g.image)}" alt="${esc(g.alt)}" fetchpriority="high" loading="eager"></picture>${creditText}</figure></div></header>`;
  const records=JSON.parse(readFileSync(join(root,'assets/school-finder-data.json'),'utf8')).schools;
  const schoolCards=g.schools.map(slug=>{
    const s=records.find(x=>x.reportUrl===`/schools/${slug}`);
    if(!s||!existsSync(join(root,'schools',slug+'.html')))throw Error('Missing school '+slug);
    return `<a class="cg-school" href="${s.reportUrl}"><span class="cg-grade${s.grade==='C'?' cg-grade-c':''}" aria-label="${s.grade?'Official accountability grade '+esc(s.grade):'School guide'}">${esc(s.grade||'i')}</span><span><strong>${esc(s.name)}</strong><small>${s.grade?esc(s.gradeYear.replace(/[–—]/g,'-'))+' Florida accountability grade':'School programs and source information'}<br>Open the school guide ↗</small></span></a>`;
  }).join('');
  const body=`<main id="main-content" class="cg-guide" data-regional-guide="${g.path.slice(1)}" data-pagefind-body>
  ${quickAnswerHtml({text:g.answer,date:'September 8, 2026',by:'The Costin Team · Original sources and property research steps below.'})}
  <nav class="cg-jumps" aria-label="Explore this local guide">${[['local-context','The area'],['compare-homes','Compare homes'],['local-places','Local places'],['ownership-costs','Costs'],['schools','Schools'],['questions','Questions']].map(([id,label])=>link('#'+id,label)).join('')}</nav>
  ${section('local-context','YOUR PART OF THE COAST',g.opening,`<p>${esc(g.context)}</p>`)}
  ${section('compare-homes','A SEARCH WITH A CLEARER PURPOSE','Compare the place and the property.',`<div role="region" aria-label="Home comparisons, scroll horizontally on smaller screens" tabindex="0" class="cg-table-wrap table-wrap"><table><caption>Use the same ownership and travel assumptions for each home on your shortlist.</caption><thead><tr><th scope="col">Your search</th><th scope="col">What to compare</th><th scope="col">What to verify</th></tr></thead><tbody>${g.comparisons.map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div><div class="cg-perspective"><p class="cg-eyebrow">THE COSTIN TEAM PERSPECTIVE</p><p>${esc(g.perspective)}</p></div>`)}
  ${section('local-places','THE PLACES BETWEEN HOME AND EVERYDAY LIFE','Put the area into context.',`<div class="cg-place-grid">${g.places.map(([title,text])=>`<article class="cg-place"><h3>${esc(title)}</h3><p>${esc(text)}</p></article>`).join('')}</div><h3>Plan the actual trip.</h3><p>${esc(g.route)}</p><div class="cg-link-row">${link('/schools#school-finder','Compare school proximity and driving routes')}</div>`)}
  ${section('ownership-costs','THE COMPLETE OWNERSHIP PICTURE','Compare more than the asking price.',`<div class="cg-cost-grid"><article><h3>The home</h3><p>Compare current listings and recent closed sales for similar properties. Add the inspection findings, repair priorities and your intended use to the decision.</p></article><article><h3>The monthly budget</h3><p>Use a lender estimate and property-specific tax and insurance information. Add utilities, dues, maintenance and any known assessment obligations.</p></article><article><h3>The documents</h3><p>Confirm access rights, association restrictions and shared repair responsibilities. A view, marketing label or nearby amenity does not establish a legal right to use it.</p></article></div><div class="cg-link-row">${link('/resources/coastal-ownership-costs','Compare two ownership budgets')}${link('/resources/condo-due-diligence','Review the condo checklist')}${link('/resources/home-buying-guide','Plan the purchase')}</div>`)}
  ${section('schools','CONNECT THE SCHOOL RESEARCH','Start with the school. Confirm the home.',`<p>${esc(g.schoolNote)}</p>${schoolCards?`<div class="cg-school-grid">${schoolCards}</div><p class="cg-fine">Official grades retain the reporting period shown. These are research links, not confirmed attendance assignments or a prediction for a student.</p>`:''}<div class="cg-link-row">${link('/schools#school-finder','Search schools by address')}${link('/schools#private-schools','Explore private schools')}${link('/schools#christian-schools','Explore Christian schools')}</div>`)}
  ${section('nearby-options','KEEP THE COMPARISON USEFUL','Another place to put on your shortlist.',`<div class="cg-place-grid">${g.alternatives.map(([name,path,why])=>`<article class="cg-place"><h3>${link(path,name)}</h3><p>${esc(why)}</p></article>`).join('')}</div>`)}
  ${section('questions','CLEAR ANSWERS BEFORE THE NEXT STEP',g.name+' questions, answered.',`<div class="cg-faq">${g.faqs.map(([q,a])=>`<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>`)}
  ${retained}
  <section class="cg-cta" id="plan-your-move" aria-labelledby="plan-your-move-title"><div><picture><img src="https://pensacolamilitaryhousing.com/images/gregg-portrait.jpg" alt="Gregg Costin, Realtor licensed in Florida and Alabama" loading="lazy"></picture></div><div><p class="cg-eyebrow">GREGG COSTIN · THE COSTIN TEAM</p><h2 id="plan-your-move-title">Turn the research into a personal search.</h2><p>Tell me the places you are considering, the budget you want to work within and the timing that matters. We can build a shortlist around the details that make a home work for you.</p><div class="cg-buttons">${question('Talk through my search')}<a class="cg-button" href="tel:+18502665005">Call (850) 266-5005</a></div><p class="cg-fine">${link('https://pensacolamilitaryhousing.com'+g.pmh,'Moving with military orders? Explore the PCS companion guide.')}</p></div></section>
  <section class="cg-sources" aria-labelledby="sources-title"><h2 id="sources-title">Sources and how to use this guide</h2><p class="cg-fine">Local research reviewed September 8, 2026. Programs, access arrangements and property conditions can change. These comparison questions are editorial planning guidance; use the original source and the actual property's records for your decision.</p><ul>${g.sources.map(s=>`<li>${link(s.url,s.label)}<span>${esc(s.note)}</span></li>`).join('')}</ul></section>
  </main>`;
  let out=html.replace(/<header\b[^>]*>[\s\S]*?<\/header>/,header).replace(oldMain,body.replaceAll('/resources/home-buying-guide','/resources/first-time-home-buyer'));
  out=out.replace(/<body([^>]*)>/,(_,attrs)=>attrs.includes('class="')?`<body${attrs.replace(/class="([^"]*)"/,(_,c)=>`class="${[...new Set((c+' coast-guide-page').split(/\s+/))].join(' ')}"`)}>`:`<body${attrs} class="coast-guide-page">`);
  out=out.replace(/<title>[\s\S]*?<\/title>/,`<title>${esc(g.title)}</title>`);
  for(const [key,val] of Object.entries({description:g.description,'og:title':g.title,'og:description':g.description,'twitter:title':g.title,'twitter:description':g.description,'article:modified_time':REVIEWED}))out=out.replace(new RegExp(`(<meta\\b[^>]*(?:name|property)="${key}"[^>]*content=")[^"]*(")`,'g'),(_,a,b)=>a+esc(val)+b);
  out=out.replace(/<script\b[^>]*type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/g,block=>{
    const raw=block.match(/>([\s\S]*?)<\/script>/)[1],n=JSON.parse(raw);
    if(n['@graph'])return block;
    if(n['@type']==='FAQPage')n.mainEntity=faqs.map(f=>({'@type':'Question',name:f.q,acceptedAnswer:{'@type':'Answer',text:f.a}}));
    if(['Article','WebPage'].includes(n['@type'])){if(n.headline)n.headline=g.title;if(n.name)n.name=g.title;n.description=g.description;n.dateModified=REVIEWED;n.citation=g.sources.map(s=>s.url);if(n.image)n.image='https://greggcostin.com'+g.image;}
    if(n['@type']==='Place')n.description=g.description;
    return block.replace(raw,'\n'+JSON.stringify(n,null,2)+'\n');
  });
  if(!out.includes('href="/assets/coast-community-guide.css"'))out=out.replace('</head>','<link rel="stylesheet" href="/assets/coast-community-guide.css">\n</head>');
  if(!out.includes('data-regional-guide-style'))out=out.replace('</head>','<style data-regional-guide-style>.coast-guide-page header.cg-hero>.cg-hero-inner{margin-left:auto;margin-right:auto}</style>\n</head>');
  return out;
}
