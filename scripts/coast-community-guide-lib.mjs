// A source-backed pilot renderer. It preserves the host page's nav, identity graph,
// consent, forms and tracking. Content is ordinary HTML on each site's own URL.
import {readFileSync, writeFileSync, mkdirSync, cpSync, existsSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {quickAnswerHtml} from './quick-answer-lib.mjs';
import {communityBudgetAnswer,communityFaqAnswer} from './community-finance-lib.mjs';

export const guide = JSON.parse(readFileSync('content/communities/perdido-key.json', 'utf8'));
const esc = s => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const source = id => guide.sources.find(s => s.id === id);
const link = (href, label) => `<a href="${esc(href)}">${esc(label)}</a>`;
const cite = id => { const s=source(id); return link(s.url,s.label); };
const section = (id, eyebrow, title, body) => `<section class="cg-section" id="${id}" aria-labelledby="${id}-title"><p class="cg-eyebrow">${esc(eyebrow)}</p><h2 id="${id}-title">${esc(title)}</h2>${body}</section>`;
const image = (src,alt,priority=false) => `<picture><img src="${esc(src)}" alt="${esc(alt)}" ${priority?'fetchpriority="high"':'loading="lazy"'}></picture>`;
const inquiry = (site,label) => `<button type="button" class="cg-button cg-button-secondary" data-inquiry-open data-inquiry-type="${site==='pmh'?'PCS / Relocation — Buying':'General Question'}">${esc(label)}</button>`;

function schools(root) {
  const data=existsSync(join(root,'assets/school-finder-data.json'))?'assets/school-finder-data.json':'school-assets/school-finder-data.json';
  const records=JSON.parse(readFileSync(join(root,data),'utf8')).schools;
  return guide.schools.map(slug => {
    const s=records.find(x=>x.reportUrl===`/schools/${slug}`);
    if(!s?.grade) throw Error(`Missing school grade for ${slug}`);
    return `<a class="cg-school" href="${s.reportUrl}"><span class="cg-grade${s.grade==='C'?' cg-grade-c':''}" aria-label="Official grade ${esc(s.grade)}">${esc(s.grade)}</span><span><strong>${esc(s.name)}</strong><small>${esc(s.gradeYear.replace(/[–—]/g,'-'))} Florida accountability grade<br>Open the school guide ↗</small></span></a>`;
  }).join('\n');
}

function compare(site) {
  const rows=site==='gc' ? [
    ['Gulf-facing condo','A view, beach-oriented living and shared building maintenance.','Recorded beach access; association budget and reserves; inspection reports, assessments and rental rules.','Loan payment + taxes + unit coverage + dues + assessment obligations.'],
    ['Detached home','Space and control over more of the property, with individual maintenance responsibilities.','Roof and systems; flood determination; elevation information where available; any association obligations.','Loan payment + taxes + insurance + maintenance + any dues.'],
    ['Waterfront property','Direct proximity to a canal, lagoon or other waterway. The water connection matters as much as the view.','Survey, seawall or dock condition; recorded access or slip rights; navigable route and any applicable permits.','Home costs + applicable dock, seawall, slip and waterfront maintenance.']
  ] : [
    ['Condo','Review the project before relying on a VA loan. Shared maintenance comes with association costs and rules.','Project eligibility, insurance, reserves and assessments, plus access and storage arrangements.','What do the documents allow, and what expenses continue during a vacancy?'],
    ['Detached home','Build maintenance into the payment comparison and your time away from home.','Inspection findings, roof, systems, insurance quotes and any association requirements.','Who could maintain or manage the home, and what would that cost?'],
    ['Waterfront home','A water view does not establish usable boat access or the condition of waterfront improvements.','Dock or slip rights, survey, seawall condition and the actual route to the water you use.','Can you carry the property without assumed rental income while deciding whether to sell?']
  ];
  const headings=site==='gc'?['Property choice','What draws buyers','What to check','Build the full budget']:['Property choice','PCS planning lens','Review before an offer','Consider the next move'];
  return `<p>${site==='gc'?'Use this as a showing checklist. Compare like-for-like homes and recent closed sales when assessing price; an area-wide average can combine very different properties.':'Compare the responsibilities attached to each home alongside the monthly payment. The most attractive listing can still be the wrong fit for your timing or financing.'}</p><div role="region" aria-label="Property comparison, scroll horizontally on a small screen" tabindex="0" class="cg-table-wrap table-wrap"><table><caption>Property-specific research checklist. On a small screen, swipe or scroll to compare every column.</caption><thead><tr>${headings.map(h=>`<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

function costSection(site) {
  return section('ownership-costs','THE COMPLETE OWNERSHIP PICTURE',site==='gc'?'What does it cost beyond the asking price?':'Compare the complete payment with your actual income.',`
  <div class="cg-cost-grid">
    <article><h3>${site==='gc'?'Start with the property.':'Start with your LES.'}</h3><ul>
      <li>${site==='gc'?'Compare current listings with recent closed sales for the same property type, building and location.':'Use actual household income and recurring expenses. A pay grade or BAH amount alone cannot establish a purchase-price approval.'}</li>
      <li>Have your lender estimate principal, interest and closing costs for the actual financing scenario.</li>
      <li>Ask how taxes would be assessed for your ownership; the seller's current bill may not reflect your future bill.</li>
    </ul></article>
    <article><h3>Price the exposure.</h3><ul>
      <li>Obtain property-specific homeowners or condo-unit coverage and flood quotes as applicable.</li>
      <li>Read the coverage, exclusions and deductibles, including what the association's master policy leaves to the unit owner.</li>
      <li>Allow for utilities, maintenance and a reserve for repairs.</li>
    </ul></article>
    <article><h3>Read the shared obligations.</h3><ul>
      <li>Request the association's budget, reserve information, current dues and known or proposed assessments.</li>
      <li>Ask for the inspection and reserve-study reports applicable to that building.</li>
      <li>Confirm use restrictions and the lender's project requirements before relying on a financing plan.</li>
    </ul></article>
  </div><p class="cg-fine">Source notes: standard homeowners policies generally do not cover flooding (${cite('flood')}). Building and reserve-study questions should be checked against the association's actual records and ${cite('condo')}.</p>
  <div class="cg-link-row">${site==='gc'?[link('/resources/coastal-ownership-costs','Compare coastal ownership costs'),link('/resources/condo-due-diligence','Condo document checklist'),link('/resources/florida-home-insurance','Insurance guide')].join(''):[link('/bah-to-mortgage-guide','Build a budget from actual income'),link('/bah-rates','Check official BAH and eligibility'),link('/va-loan-guide','Understand VA purchase rules')].join('')}</div>`);
}

function routeSection() {
  return section('reporting-route','REPORTING LOCATION BEFORE MILEAGE','NAS Pensacola and Corry are different trips.',`
    <div class="cg-route-grid"><article class="cg-route"><h3>NAS Pensacola</h3><p>Ask your sponsor or unit for the building and entrance you should use. Compare each home's route to that destination, including the Sorrento Road and Gulf Beach Highway approaches where relevant. Visitor instructions are not a substitute for your unit's reporting directions.</p>${link('/bases/nas-pensacola','Open the NAS Pensacola guide')}</article>
    <article class="cg-route"><h3>Corry Station</h3><p>Use your actual Corry reporting destination rather than a NAS Pensacola pin. Compare the route to Corry alongside any training, shopping or school stops that will be part of your regular day.</p>${link('/bases/corry-station','Open the Corry Station guide')}</article></div>
    <p class="cg-note">Do a second route check if your destination is Whiting Field, Eglin or Hurlburt Field. Being in the broader Pensacola area does not establish a convenient commute to a different installation. ${link('/communities','Compare all military community guides')}.</p>
    <p class="cg-fine">Current access reference: ${cite('navy')}. Travel times are not estimated in this guide.</p>`);
}

export function renderCommunityGuide(html,site,root,{schoolRoot=root}={}) {
  if(!['gc','pmh'].includes(site))throw Error('Unknown site');
  const e=guide.editions[site],other=guide.editions[site==='gc'?'pmh':'gc'];
  const oldMain=html.match(/<main\b[^>]*>[\s\S]*?<\/main>/)?.[0];
  if(!oldMain||/<script\b/.test(oldMain))throw Error('Expected one static main without inline scripts');
  const retainedGeo=site==='gc'?(oldMain.match(/<section class="geo-guide"[\s\S]*?<\/section>/)?.[0]||''):'';
  const retainedLinks=site==='pmh'?(oldMain.match(/<!-- EXPLORE_V2 -->[\s\S]*?<!-- \/EXPLORE_V2 -->/)?.[0]||'').replaceAll('FL023','FL056'):'';
  // The reviewed financial canon owns allowance examples and affordability answers.
  const faqs=e.faqs.map(f=>site==='pmh'&&/BAH|afford|pay grade/i.test(f.q)?{q:f.q,a:communityFaqAnswer(guide.slug,f.q)}:{...f});
  if(retainedGeo){
    const originalFAQ=[...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(x=>JSON.parse(x[1])).find(x=>x['@type']==='FAQPage');
    const q=originalFAQ?.mainEntity.find(x=>x.name==='How should I compare Pensacola-area homes for a military move?');
    if(q)faqs.push({q:q.name,a:q.acceptedAnswer.text});
  }
  const heroImage=site==='gc'?'/images/perdido-key.jpg':'/images/communities/perdido-key.jpg';
  const photoCredit=site==='gc'?'Perdido Key beach access. Photo: Breault, public domain.':'Perdido Key area, archival aerial photograph (2010). Photo: Curtis Palmer, CC BY 2.0.';
  const header=`<header class="cg-hero"><div class="cg-hero-inner"><div class="cg-hero-copy"><p class="cg-eyebrow">${esc(e.eyebrow)}</p><h1>${esc(e.h1)}</h1><span class="cg-hero-line">${esc(e.heroLine)}</span><p class="lead">${esc(e.lead)}</p><div class="cg-buttons">${link(e.primaryHref,e.primaryLabel).replace('<a ','<a class="cg-button" ')}${inquiry(site,e.secondaryLabel)}</div><p class="cg-byline">By ${link(site==='gc'?'/team':'/about','Gregg Costin')} · Levin Rinke Realty<br>Florida &amp; Alabama licensed · Guide reviewed ${guide.reviewLabel}</p></div><figure class="cg-hero-media">${image(heroImage,site==='gc'?'White sand, sea oats and boardwalk at a Perdido Key beach access':'Archival aerial view of Perdido Key, waterways and surrounding coast',true)}<figcaption>${esc(photoCredit)} ${site==='pmh'?link('https://commons.wikimedia.org/wiki/File:Perdido_Key,_Florida_by_C._Palmer_(2010_aerial_view).jpg','Original photograph')+' · '+link('https://creativecommons.org/licenses/by/2.0/','License'):''}</figcaption></figure></div></header>`;
  const schoolCards=schools(schoolRoot);
  const places=`<div class="cg-place-grid">${guide.places.map(p=>`<article class="cg-place"><p class="cg-eyebrow">${esc(p.label)}</p><h3>${esc(p.name)}</h3><p>${esc(p.text)}</p>${cite(p.source)}<p class="cg-question"><strong>Bring this question:</strong> ${esc(p.question)}</p></article>`).join('')}</div>`;
  const intro=section('know-perdido',site==='gc'?'FIND YOUR PART OF THE COAST':'A MOVE THAT WORKS BEYOND MOVE-IN DAY',e.openingTitle,`
    <p>${esc(e.openingText)}</p><div class="cg-facts"><div><strong>Gulf beach access</strong><p>Research Johnson Beach and the state park, plus any access rights attached to a listing.</p></div><div><strong>More than one waterfront</strong><p>Distinguish open-Gulf views from lagoon, canal or other waterfront settings and access.</p></div><div><strong>Florida + Alabama</strong><p>Gregg is licensed in both states, so your comparison can include the Orange Beach and Gulf Shores side of the coast.</p></div></div>
    <p class="cg-fine">For public access details, use the ${cite('johnson-beach')} and ${cite('state-park')}. Property access rights require the property's own records.</p>`);
  const schoolSection=section('schools','SCHOOL RESEARCH, CONNECTED TO YOUR SEARCH','Explore the schools. Then check the address.',`
    <p>Hellen Caro Elementary, Jim C. Bailey Middle and Escambia High are starting points for research in the directory. Open each guide for its grade history, available program information and questions to ask the school.</p>
    <div class="cg-school-grid">${schoolCards}</div>
    <p class="cg-fine">Grades above are the official <strong>2025-26 Florida accountability grades</strong> in our shared school dataset. They are not a new September rating or a prediction for an individual student. Nearby schools are not confirmed assignments. ${cite('school-address')}.</p>
    <p>The map accepts a home address and can compare straight-line proximity with an optional driving route. Private and Christian schools have their own guides and admissions requirements; use their directories as well as the public-school results.</p>
    <div class="cg-link-row">${link('/schools#school-finder','Open the interactive School Finder')}${link('/schools#private-schools','Explore private schools')}${link('/schools#christian-schools','Explore Christian schools')}</div>`);
  const alternatives=section('nearby-options','WIDEN THE COMPARISON','Keep another location on your shortlist.',site==='gc'?`
    <p>Compare Perdido's property choices with ${link('/gulf-shores-orange-beach','Orange Beach and Gulf Shores')} if you are open to Alabama, or with ${link('/neighborhoods/pensacola-beach','Pensacola Beach')} if beach access is the priority. For a different everyday setting, explore ${link('/neighborhoods/east-hill-downtown','downtown Pensacola and East Hill')}.</p><p>Compare current property documents, costs and the routes you would actually use. Crossing the state line or changing waterfront locations calls for a fresh property-specific review.</p>`:`
    <p>For a NAS or Corry assignment, compare your Perdido shortlist with ${link('/communities/navy-point-warrington','Navy Point and Warrington')}, then explore ${link('/communities/bellview-myrtle-grove','Bellview and Myrtle Grove')} if you want another mainland comparison. Use the same budget and route assumptions for every option.</p><p>If a beach-oriented location remains your priority, compare ${link('/communities/gulf-breeze','Gulf Breeze')} using the actual route to duty. An area name or a school letter grade alone should not decide the move.</p>`);
  const va=site==='pmh'?section('va-and-orders','FINANCING AND THE NEXT SET OF ORDERS','Check the condo project before you commit.',`
    <p>A VA-financed condo must be in a VA-approved project. Borrower qualification, lender requirements and occupancy also matter. Have your lender check the actual project before you rely on a VA offer. ${cite('va')}.</p>
    <p>For a possible future rental, ask about recorded restrictions, local requirements, management costs, vacancy, insurance and your loan terms. Evaluate selling and holding as separate scenarios rather than assuming a coastal location will pay for itself.</p><div class="cg-link-row">${link('/va-approved-condos-pensacola','VA condo research guide')}${link('/rent-or-sell-pcs-pensacola','Compare renting and selling at PCS')}${link('/military-lodging-pensacola','Plan temporary lodging')}</div>`):'';
  const main=`<main id="main-content" class="cg-guide" data-community-guide="perdido-key" data-pagefind-body>
    ${quickAnswerHtml({text:e.answer,date:guide.reviewLabel,by:'The Costin Team · Local planning guide; original sources linked below.'})}
    <nav class="cg-jumps" aria-label="Explore this Perdido Key guide">${[['know-perdido','The area'],['compare-homes','Compare homes'],['local-places','Local places'],['ownership-costs','Costs'],['schools','Schools'],['questions','Questions']].map(([id,label])=>link('#'+id,label)).join('')}</nav>
    ${intro}${site==='pmh'?routeSection():''}
    ${section('compare-homes','THE PROPERTY, NOT JUST THE VIEW','Compare the ways to own on the coast.',compare(site)+`<div class="cg-perspective"><p class="cg-eyebrow">THE COSTIN TEAM PERSPECTIVE</p><p>${esc(e.perspective)}</p></div>`)}
    ${section('local-places','GET TO KNOW THE EVERYDAY PLACES',site==='gc'?'Put a few real places on your map.':'Explore the coast between the practical decisions.',places)}
    ${costSection(site)}${site==='pmh'?`<section class="geo-guide" data-community-budget="perdido-key"><h2>Build your Perdido Key housing budget</h2><p>${esc(communityBudgetAnswer(guide.slug))}</p><p>${link('/bah-rates#calculator','Compare mortgage and ownership costs')} · ${link('/bah-to-mortgage-guide#budget-tool','Compare your actual income scenarios')} · ${link('https://greggcostin.com/resources/coastal-ownership-costs','Compare two properties')}</p><p class="geo-review">Budget guidance reviewed September 8, 2026. ${link('https://www.travel.dod.mil/Allowances/Basic-Allowance-for-Housing/BAH-Rate-Lookup/','Official BAH lookup')} · ${link('https://www.consumerfinance.gov/owning-a-home/prepare/figure-out-how-much-you-want-to-spend/','CFPB ownership-budget guidance')}.</p></section>`:''}${schoolSection}${va}${alternatives}
    ${section('questions','CLEAR ANSWERS BEFORE THE NEXT STEP','Perdido Key questions, answered.',`<div class="cg-faq">${faqs.slice(0,e.faqs.length).map(f=>`<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('')}</div>`)}
    ${retainedGeo}
    <section class="cg-cta" id="plan-your-move" aria-labelledby="plan-your-move-title"><div>${image('https://pensacolamilitaryhousing.com/images/gregg-portrait.jpg','Gregg Costin, Realtor')}</div><div><p class="cg-eyebrow">GREGG COSTIN · THE COSTIN TEAM</p><h2 id="plan-your-move-title">${esc(e.ctaTitle)}</h2><p>${esc(e.ctaText)}</p><div class="cg-buttons">${inquiry(site,e.secondaryLabel)}<a class="cg-button" href="tel:+18502665005">Call (850) 266-5005</a></div><p class="cg-fine">${link((site==='gc'?'https://pensacolamilitaryhousing.com':'https://greggcostin.com')+other.path,site==='gc'?'Read the Perdido Key military and PCS companion guide':'Read the Perdido Key coastal buying companion guide')}</p></div></section>
    <section class="cg-sources" aria-labelledby="sources-title"><h2 id="sources-title">Sources and how to use this guide</h2><p class="cg-fine">Guide research reviewed ${guide.reviewLabel}. School accountability grades retain their own 2025-26 reporting period. Park arrangements, access instructions, inventory and property expenses can change; use the linked source and the exact property's records when making a decision. Our comparison questions are editorial guidance, not an inspection, appraisal or school assignment.</p><ul>${guide.sources.filter(s=>site==='pmh'||!['navy','va'].includes(s.id)).map(s=>`<li>${link(s.url,s.label)}<span>${esc(s.supports)}</span></li>`).join('')}</ul></section>
    ${retainedLinks?`<div class="cg-retained-links">${retainedLinks}</div>`:''}
  </main>`;
  let out=html.replace(/<header\b[^>]*>[\s\S]*?<\/header>/,header).replace(oldMain,main);
  out=out.replace(/<body([^>]*)>/,(_,attrs)=>attrs.includes('class="')?`<body${attrs.replace(/class="([^"]*)"/,(_,c)=>`class="${[...new Set((c+' coast-guide-page').split(/\s+/))].join(' ')}"`)}>`:`<body${attrs} class="coast-guide-page">`);
  out=out.replace(/<title>[\s\S]*?<\/title>/,`<title>${esc(e.title)}</title>`);
  out=out.replace(/Last updated: [^<\n]+(?=<)/g,`Last updated: ${guide.reviewLabel}`)
    .replace(/Content last verified: [^<\n]+(?=<)/g,`Guide reviewed: ${guide.reviewLabel}. School grades retain the 2025-26 reporting period.`)
    .replace('Bases, communities, BAH rates, VA loan guides, FAQ. All 60+ pages.','Search bases, communities, school reports, BAH resources and VA guides.');
  for(const [key,val] of Object.entries({description:e.description,'og:title':e.title,'og:description':e.description,'twitter:title':e.title,'twitter:description':e.description,'article:modified_time':guide.reviewed})){
    out=out.replace(new RegExp(`(<meta\\b[^>]*(?:name|property)="${key}"[^>]*content=")[^"]*(")`,'g'),(_,a,b)=>a+esc(val)+b);
  }
  out=out.replace(/<script\b[^>]*type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/g,block=>{
    const raw=block.match(/>([\s\S]*?)<\/script>/)[1],node=JSON.parse(raw);
    if(node['@graph'])return block;
    if(node['@type']==='FAQPage')node.mainEntity=faqs.map(f=>({'@type':'Question',name:f.q,acceptedAnswer:{'@type':'Answer',text:f.a}}));
    if(['Article','WebPage'].includes(node['@type'])){
      if(node.headline)node.headline=e.title;if(node.name)node.name=e.title;
      node.description=e.description;node.dateModified=guide.reviewed;
      node.citation=guide.sources.filter(s=>site==='pmh'||!['navy','va'].includes(s.id)).map(s=>s.url);
      if(node.image)node.image='https://pensacolamilitaryhousing.com'+heroImage;
    }
    if(node['@type']==='Place')node.description=e.description;
    if(site==='pmh'&&node['@type']==='BreadcrumbList')node.itemListElement[1].item='https://pensacolamilitaryhousing.com/communities';
    return block.replace(raw,'\n'+JSON.stringify(node,null,2)+'\n');
  });
  // Keep font and presentation requests local; do not add another UI framework or runtime.
  out=out.replace(/<noscript>\s*<link[^>]*fonts\.googleapis\.com[^>]*>\s*<\/noscript>/g,'')
    .replace(/<link\b[^>]*(?:fonts\.googleapis\.com|fonts\.gstatic\.com)[^>]*>/g,'');
  const seen=new Set();
  out=out.replace(/<link\b[^>]*(?:\/fonts\/|\/assets\/costin-fonts\.css|\/assets\/coast-community-guide\.css)[^>]*>/g,tag=>{
    const href=tag.match(/href="([^"]+)"/)?.[1];if(seen.has(href))return '';seen.add(href);return tag;
  });
  const fonts=readFileSync('civilian-site/assets/costin-fonts.css','utf8');
  if(!seen.has('/assets/costin-fonts.css'))out=out.replace('</head>','<link rel="stylesheet" href="/assets/costin-fonts.css">\n</head>');
  for(const name of ['inter-latin-variable.woff2','playfair-latin-variable.woff2'])if(!seen.has('/fonts/'+name))out=out.replace('</head>',`<link rel="preload" href="/fonts/${name}" as="font" type="font/woff2" crossorigin>\n</head>`);
  if(!seen.has('/assets/coast-community-guide.css'))out=out.replace('</head>','<link rel="stylesheet" href="/assets/coast-community-guide.css">\n</head>');
  mkdirSync(join(root,'assets'),{recursive:true});
  writeFileSync(join(root,'assets/costin-fonts.css'),fonts);
  if(resolve('public/assets/coast-community-guide.css')!==resolve(root,'assets/coast-community-guide.css'))cpSync('public/assets/coast-community-guide.css',join(root,'assets/coast-community-guide.css'));
  if(!existsSync(join(root,'fonts')))cpSync('civilian-site/fonts',join(root,'fonts'),{recursive:true});
  return out;
}
