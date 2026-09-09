// Builds the civilian homepage from existing guides and its existing review/FAQ copy.
// Run before rollout-civilian-experience.mjs and apply-responsive-images.mjs.
import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { enhanceHomeDiscovery } from './civilian-resource-library.mjs';
import {reviewSourceNote,reviewCheckDate} from './review-counts-lib.mjs';
const file = 'civilian-site/index.html';
const old = readFileSync(file, 'utf8');
// Change when the editorial content changes, not each time this builder runs.
const modified = '2026-09-09';
const esc = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const ledger = JSON.parse(readFileSync('content/blog/image-credits.json', 'utf8')).images;
const ratings = JSON.parse(readFileSync('content/reviews/ratings.json','utf8'));
const combinedReviews = ratings.google.count + ratings.zillow.count;
const img = (name, alt, width, height, priority = false) => `<picture><img src="/images/${name}.jpg" width="${width}" height="${height}" alt="${esc(alt)}"${alt ? '' : ' role="presentation"'} ${priority ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"></picture>`;
const blocks = [...old.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));
const faqs = blocks.find(b => b['@type'] === 'FAQPage')?.mainEntity;
const reviewStart = old.indexOf('<div class="review-grid">');
const reviewEnd = old.indexOf('<div class="btn-row">', reviewStart);
if (!faqs || reviewStart < 0 || reviewEnd < 0) throw new Error('Existing FAQ/review content must be present.');
const reviews = old.slice(reviewStart, reviewEnd).trim();
const areas = [
  ['east-hill-downtown','East Hill & Downtown','palafox-street','Character homes, parks, and Palafox Street',1600,1200],
  ['gulf-breeze','Gulf Breeze & Tiger Point','three-mile-bridge','Peninsula homes and access to Pensacola Bay',1600,1200],
  ['pensacola-beach','Pensacola Beach','pensacola-beach','Gulf-front homes and barrier-island condos',1400,1868],
  ['perdido-key','Perdido Key','perdido-waterfront','Coastal condos, beach access, and the state line',1600,900],
  ['midtown-east-pensacola-heights','Midtown & East Pensacola Heights','graffiti-bridge','Bungalows, bayou access, and established streets',1600,1278],
  ['pace-milton','Pace & Milton','pace-milton','New construction, acreage, and Blackwater access',1600,1200],
  ['navarre','Navarre','navarre','Mainland neighborhoods and a barrier-island beach',1600,1067],
  ['cordova-park-northeast','Cordova & Scenic Heights','cordova-park','Established homes and mature tree canopies',1200,675],
  ['beulah','Beulah','beulah','Newer construction in northwest Escambia County',1200,900],
  ['cantonment','Cantonment','cantonment','North-county homes, larger lots, and subdivisions',1200,900],
  ['fort-walton-beach','Fort Walton Beach','fort-walton','Sound-side homes and the Okaloosa corridor',1600,1061],
  ['destin','Destin','destin','Harbor living, coastal homes, and condos',1600,836],
  ['niceville','Niceville & Bluewater Bay','niceville','Bayou neighborhoods and Choctawhatchee Bay',1600,900],
  ['crestview','Crestview','crestview','Inland Okaloosa homes and new construction',1600,1067],
  ['foley','Foley, Alabama','gulf-shores','Inland Baldwin County, north of Gulf Shores',1600,1067],
  [null,'Gulf Shores & Orange Beach','gulf-shores-hangout','Alabama coastal homes, condos, and boating',1024,1024,'The Hangout surfboard sculpture in Gulf Shores, Alabama']
];
const areaCards = areas.map(([slug,name,photo,fit,w,h,alt]) => `<a class="area-card" href="${slug ? '/neighborhoods/' + slug : '/gulf-shores-orange-beach'}" data-guide-link="${slug || 'alabama-coast'}"><div class="nb-photo">${img(photo,alt || name,w,h)}</div><div class="area-body"><span class="area-name">${esc(name)}</span><span class="area-fit">${esc(fit)}</span></div></a>`).join('\n');
const regions = [
  {id:'perdido', photo:'perdido-waterfront', width:1600, height:900, alt:'Archival aerial view of Perdido Key and its surrounding waterfront, photographed by Curtis Palmer in 2010', eyebrow:'Perdido Key, Florida', title:'A coast all its own.', description:'Gulf-front condos, beach homes and life along the state line.', links:[['Explore Perdido Key','/neighborhoods/perdido-key']]},
  {id:'pensacola', photo:'palafox-street', width:1600, height:1200, alt:'Palafox Street and a tree-lined park in downtown Pensacola', eyebrow:'Downtown Pensacola & East Hill', title:'City character.<br>Coastal soul.', description:'Historic streets, distinctive homes and the heart of Pensacola.', links:[['Explore Downtown & East Hill','/neighborhoods/east-hill-downtown']]},
  {id:'northeast-pensacola', photo:'cordova-park', width:1200, height:675, alt:'A residential street beneath mature trees in Cordova Park, Pensacola', eyebrow:'Cordova & Scenic Heights', title:'Rooted in Pensacola.', description:'Established neighborhoods, tree-lined streets and everyday connections.', links:[['Explore northeast Pensacola','/neighborhoods/cordova-park-northeast']]},
  {id:'gulf-breeze', photo:'three-mile-bridge', width:1600, height:1200, alt:'Looking north over both spans of the Three Mile Bridge across Pensacola Bay', eyebrow:'Gulf Breeze & Tiger Point', title:'Across the bay.', description:'Peninsula neighborhoods, waterfront homes and access to Pensacola Bay.', links:[['Explore Gulf Breeze & Tiger Point','/neighborhoods/gulf-breeze']]},
  {id:'emerald-coast', photo:'destin', width:1600, height:836, alt:'Boats and the shoreline at Destin Harbor on the Emerald Coast', eyebrow:'Navarre · Fort Walton Beach · Destin', title:'The Emerald Coast.', description:'From Navarre to the Destin harbor, explore three distinct places to call home.', links:[['Navarre','/neighborhoods/navarre'],['Fort Walton Beach','/neighborhoods/fort-walton-beach'],['Destin','/neighborhoods/destin']]},
  {id:'alabama-coast', photo:'orange-beach-wharf', width:1080, height:600, alt:'The illuminated Ferris wheel and palm-lined Main Street at The Wharf in Orange Beach, Alabama', eyebrow:'Gulf Shores & Orange Beach', title:'The coast continues.', description:'From the beaches to evenings at The Wharf, explore life on the Alabama coast.', links:[['Explore the Alabama coast','/gulf-shores-orange-beach']]}
];
const regionCards = regions.map(r => `<article class="gc-region-card" data-region="${r.id}">${img(r.photo,r.alt,r.width,r.height)}<div><small>${esc(r.eyebrow)}</small><h3>${r.title}</h3><p>${esc(r.description)}</p><nav class="gc-region-links" aria-label="${esc(r.eyebrow)} guides">${r.links.map(([name,url])=>`<a href="${url}" data-guide-link="${url.split('/').at(-1)}">${esc(name)} <span aria-hidden="true">↗</span></a>`).join('')}</nav></div></article>`).join('\n');
const searchPhotos = [...readFileSync('civilian-site/search.html','utf8').matchAll(/<img[^>]*src="\/images\/([^"/]+)\.jpg"/g)].map(match=>match[1]);
const photoNames = [...new Set(['navarre','gregg-courthouse','gregg-navy-no-tie',...regions.map(r=>r.photo),...areas.map(a=>a[2]),...searchPhotos])];
const study = JSON.parse(readFileSync('content/data/bah-ownership-study-2026.json','utf8'));
const publishedStudy = JSON.parse(readFileSync('public/data/bah-ownership-study-2026.json','utf8'));
if (JSON.stringify(study)!==JSON.stringify(publishedStudy)) throw new Error('Publish the current ownership-study data before rebuilding the homepage.');
const snapshots = [
  { area: 'Milton area', zip: '32570', path: '/neighborhoods/pace-milton' },
  { area: 'Central Pensacola', zip: '32503', path: '/neighborhoods/east-hill-downtown' },
  { area: 'Midway / Tiger Point', zip: '32563', path: '/neighborhoods/gulf-breeze' }
].map(row=>{
  const record=study.rows.find(r=>r.zip===row.zip);
  if(!record||!Number.isFinite(record.zhvi)||record.zhvi<=0||record.valueDate!==study.valueDate)throw new Error('Missing or undated ZIP snapshot: '+row.zip);
  return {...row,value:Math.round(record.zhvi),date:new Date(record.valueDate+'T12:00:00Z').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'})};
});
// The Florida study does not cover Alabama. Retain the separately dated Foley
// guide quotation and fail if its source page no longer supports it.
const foley={area:'Foley, Alabama',zip:'36535',value:306621,path:'/neighborhoods/foley',date:'Jul 31, 2026'};
const foleySource=readFileSync('civilian-site'+foley.path+'.html','utf8');
if(!foleySource.includes(foley.value.toLocaleString('en-US'))||!foleySource.includes('July 31, 2026'))throw new Error('Foley snapshot no longer matches its separately dated source guide.');
snapshots.push(foley);
const body = `
<main id="main-content">
<section class="gc-coast-hero" aria-labelledby="home-title">
  <div class="gc-hero-image">${img('navarre','White sand and sea oats on Santa Rosa Island along the Florida Gulf Coast',1600,1067).replace('loading="lazy"','loading="eager"')}</div>
  <div class="gc-wrap gc-hero-content">
    <div class="gc-hero-copy">
    <span class="gc-eyebrow">Pensacola &middot; Emerald Coast &middot; Coastal Alabama</span>
    <h1 id="home-title">Find your place<br><em>on the Gulf Coast.</em></h1>
    <p>I&rsquo;m Gregg Costin, your Realtor in Florida and Alabama. From Pensacola to the Emerald Coast and coastal Alabama, I&rsquo;ll help you make your next move with clear answers and a personal plan.</p>
    <div class="gc-actions"><a class="gc-button" href="/search" data-guide-link="hero-home-search">Explore homes <span aria-hidden="true">↗</span></a><a class="gc-button gc-button--line" href="/sell">Let&rsquo;s talk about selling <span aria-hidden="true">↗</span></a></div>
    </div>
    <figure class="gc-hero-portrait">${img('gregg-courthouse','Gregg Costin seated on the steps of the Escambia County Court House in downtown Pensacola',928,1152,true)}<figcaption><span>YOUR GULF COAST REALTOR</span><strong>Gregg Costin</strong><small>Florida &amp; Alabama<br>Levin Rinke Realty</small></figcaption></figure>
  </div>
</section>
<section class="gc-proof" aria-label="Your local real estate team"><div class="gc-wrap gc-proof-grid">
  <div><strong>Florida + Alabama</strong><span>One team across the state line</span></div>
  <div><strong><b style="font:inherit">ABR<sup style="font-size:.48em;vertical-align:super;line-height:0">&reg;</sup> &middot; SRS<sup style="font-size:.48em;vertical-align:super;line-height:0">&reg;</sup> &middot; RENE<sup style="font-size:.48em;vertical-align:super;line-height:0">&reg;</sup></b></strong><span>Buyer, seller &amp; negotiation national credentials</span></div>
  <div><strong>USAF Captain, retired</strong><span>Service that shapes our approach</span></div>
  <div><a class="gc-proof-reviews" href="/reviews" style="display:grid;grid-template-rows:1fr auto;justify-items:center;width:100%;height:100%;color:inherit"><strong style="flex-direction:column;gap:5px"><i aria-hidden="true" style="font:500 16px/1 var(--sans);letter-spacing:.1em">★★★★★</i><b style="font:inherit"><b data-review-count="combined" style="font:inherit">${combinedReviews}</b> 5-Star<br>Reviews</b></strong><span>Real Clients. <span style="white-space:nowrap">Their Words. <i aria-hidden="true" style="font-style:normal">↗</i></span></span></a></div>
</div></section>
<section class="gc-section gc-plans"><div class="gc-wrap">
  <div class="gc-section-intro gc-section-intro--balanced"><div><span class="gc-eyebrow">A good move starts with a good plan</span><h2>What does your next<br>chapter look like?</h2></div><div class="gc-intro-note"><p>A first home. More room. A new view. Start with what matters to you.</p></div></div>
  <div class="gc-planner">
    <nav class="gc-plan-choices" aria-label="Choose your real estate goal"><a href="/buy" data-plan="buy" aria-current="true"><span>01</span> Buy a home</a><a href="/sell" data-plan="sell" aria-current="false"><span>02</span> Sell a home</a><a href="/neighborhoods" data-plan="relocate" aria-current="false"><span>03</span> Relocate</a><a href="/gulf-shores-orange-beach" data-plan="invest" aria-current="false"><span>04</span> Invest</a></nav>
    <div class="gc-plan-result" data-plan-result aria-live="polite" aria-atomic="true"><h3>Find the home. Understand the whole picture.</h3><p>Compare neighborhoods, explore homes, and account for insurance, taxes, and closing costs before you make an offer.</p><div class="gc-plan-links"><a class="gc-link" href="/search" data-plan-link>Explore homes ↗</a><a class="gc-link" href="/buy" data-plan-link>Read the buyer guide ↗</a><button class="gc-ad-settings" type="button" data-inquiry-open data-inquiry-type="General Question" data-inquiry-message="I would like help buying a home on the Gulf Coast.">Build my plan ↗</button></div></div>
  </div>
</div></section>
<section class="gc-section"><div class="gc-wrap">
  <div class="gc-section-intro gc-section-intro--balanced"><div><span class="gc-eyebrow">Find your corner of the coast</span><h2>One coastline.<br>So many ways to call it home.</h2></div><div class="gc-intro-note"><p>Get to know the homes, everyday costs, and practical tradeoffs before you fall in love with the view.</p></div></div>
  <div class="gc-region-grid">${regionCards}</div>
  <div class="gc-all-areas" aria-labelledby="all-area-guides"><div class="gc-directory-heading"><h3 id="all-area-guides">Explore all 16 area guides</h3><p>Pensacola, the Emerald Coast and coastal Alabama.</p></div>
  <!-- AREA_CARDS_START -->
  <div class="area-grid">${areaCards}</div>
  <!-- AREA_CARDS_END -->
  </div>
</div></section>
<section class="gc-section gc-data"><div class="gc-wrap">
  <div class="gc-data-grid"><div><span class="gc-eyebrow">Local insight, with the numbers behind it</span><h2>Before the offer,<br>know the whole picture.</h2><p>The purchase price is the starting point. Insurance, property taxes, association costs, and financing all shape what a home costs to own.</p><p>Use our published area snapshots to get oriented. Then ask us for recent comparable sales and a closer look at the homes on your shortlist.</p><button class="gc-button" type="button" data-inquiry-open data-inquiry-type="General Question" data-inquiry-message="Please help me compare recent sales and ownership costs in the areas I am considering.">Get a local comparison <span aria-hidden="true">↗</span></button></div>
  <div><table><caption>Published ZIP value snapshots</caption><thead><tr><th scope="col">Area / source guide</th><th scope="col">Typical home value</th></tr></thead><tbody>${snapshots.map(row => `<tr><td><a href="${row.path}">${row.area}</a><small>ZIP ${row.zip} &middot; ${row.date}</small></td><td>$${row.value.toLocaleString('en-US')}</td></tr>`).join('')}</tbody></table><p class="gc-data-note">The three Florida figures come from our <a href="https://pensacolamilitaryhousing.com/bah-vs-cost-of-owning-pensacola">sourced 26-ZIP study</a>; Foley comes from its separately dated neighborhood guide. These are Zillow Research typical home values (ZHVI). Each figure covers the whole ZIP, including different neighborhoods and housing types. These are historical area snapshots, not current asking prices or appraisals. <a href="https://www.zillow.com/research/data/" target="_blank" rel="noopener">About the source ↗</a></p></div></div>
  <div class="gc-tools">
    <a class="gc-tool" href="https://pensacolamilitaryhousing.com/mortgage-calculators" data-guide-link="mortgage-calculators"><span aria-hidden="true">01</span><div><h3>Work through the payment ↗</h3><p>Explore the mortgage tools on our military housing site.</p></div></a>
    <a class="gc-tool" href="/resources/florida-home-insurance" data-guide-link="home-insurance"><span aria-hidden="true">02</span><div><h3>Understand the insurance ↗</h3><p>Read what to check before committing to a Florida home.</p></div></a>
    <a class="gc-tool" href="/schools" data-guide-link="school-data"><span aria-hidden="true">03</span><div><h3>Research local schools ↗</h3><p>Explore official grades and verify attendance boundaries.</p></div></a>
  </div>
</div></section>
<section class="gc-section"><div class="gc-wrap gc-person-grid">
  <figure class="gc-person-image">${img('gregg-navy-no-tie','Gregg Costin in a navy jacket and white shirt',1600,2182)}<figcaption>Gregg Costin &middot; Your Gulf Coast Realtor</figcaption></figure>
  <div class="gc-person-copy"><span class="gc-eyebrow">Meet the person in your corner</span><h2>Local perspective.<br>A lifetime of showing up.</h2><p>I&rsquo;m Gregg Costin, a retired Air Force captain and a Realtor licensed in Florida and Alabama. Buying or selling a home should come with clear answers, thoughtful preparation, and someone who follows through.</p><p>Our team at Levin Rinke Realty helps you understand your options, weigh the tradeoffs, and move forward with a plan. From Pensacola and Gulf Breeze to the Emerald Coast and coastal Alabama, we bring the same care to every move.</p><div class="gc-signature">Gregg Costin</div><p class="gc-credentials">ABR &middot; SRS &middot; RENE &middot; MRP &middot; FMS</p><a class="gc-link" href="/team">Meet The Costin Team <span aria-hidden="true">↗</span></a></div>
</div></section>
<section class="gc-section gc-reviews"><div class="gc-wrap"><div class="gc-section-intro"><div><span class="gc-eyebrow">The experience, in their words</span><h2>The best part of this work?<br>The people.</h2></div><a class="gc-link" href="/reviews">Read our client reviews ↗</a></div>
<div class="gc-ratings" aria-label="Client ratings"><div class="gc-rating-total"><strong data-review-count="combined">${combinedReviews}</strong><span>Client reviews</span><p>Across Google and Zillow</p></div>${['google','zillow'].map(platform=>{const r=ratings[platform];return `<a class="gc-rating-platform" href="${esc(r.url)}" target="_blank" rel="noopener" data-guide-link="${platform}-reviews"><span class="gc-rating-name">${esc(r.name)}</span><div><strong>${r.rating.toFixed(1)}</strong><span class="gc-rating-stars" aria-label="5 out of 5 stars">★★★★★</span></div><span class="gc-rating-count">${r.count} ${esc(r.name)} ${platform==='zillow'?'team ':''}reviews <span aria-hidden="true">↗</span></span></a>`;}).join('')}</div>
<p class="gc-review-source-note">${['google','zillow'].every(p=>ratings[p].countStatus==='verified-public-browser')?reviewSourceNote(reviewCheckDate(ratings)):'Review counts can change. Visit the profiles to read the latest client feedback.'}</p>
${reviews}
<div class="btn-row"><a class="gc-link" href="/reviews">More stories from our clients ↗</a></div>
</div></section>
<section class="gc-section gc-resource-coast"><div class="gc-resource-image" aria-hidden="true">${img('navarre','',1600,1067)}</div><div class="gc-wrap"><div class="gc-section-intro"><div><span class="gc-eyebrow">Good questions deserve useful answers</span><h2>A little local knowledge<br>goes a long way.</h2></div><a class="gc-link" href="/resources">Visit the resource library ↗</a></div>
<div class="gc-reading-grid">
  <article class="gc-reading-card"><small>Planning your purchase</small><h3>The costs beyond<br>the down payment.</h3><p>Understand the pieces of a Florida closing so you can ask better questions and plan ahead.</p><a class="gc-link" href="/blog/closing-costs-florida-buyers" data-guide-link="closing-costs">Read the guide ↗</a></article>
  <article class="gc-reading-card"><small>Protecting your home</small><h3>Make sense of<br>Florida homestead.</h3><p>Explore the exemption, filing requirements, and official resources for your county.</p><a class="gc-link" href="/resources/florida-homestead-exemption" data-guide-link="homestead">Read the guide ↗</a></article>
  <article class="gc-reading-card"><small>Military &amp; PCS</small><h3>Your orders.<br>A plan for the move.</h3><p>Our dedicated military housing site brings together base guides, BAH information, VA loan resources, and PCS checklists.</p><a class="gc-link" href="https://pensacolamilitaryhousing.com/pcs-guide" data-guide-link="pcs-guide">Explore military resources ↗</a></article>
</div>
<div class="gc-faq"><div><span class="gc-eyebrow">Let&rsquo;s clear things up</span><h2>A few things<br>you may be wondering.</h2><a class="gc-link" href="/faq">More answers ↗</a></div><div>${faqs.map(q => `<details><summary>${esc(q.name)}</summary><p>${esc(q.acceptedAnswer.text)}</p></details>`).join('\n')}</div></div>
</div></section>
<section class="gc-section gc-last-word"><div class="gc-wrap gc-last-grid"><div><span class="gc-eyebrow">Your coast. Your next chapter.</span><h2>Let&rsquo;s make a plan<br>for what comes next.</h2><p>Tell us what you have in mind. We&rsquo;ll help you work through the options, the questions, and the next step.</p></div><div class="gc-actions"><button class="gc-button" type="button" data-inquiry-open data-inquiry-type="General Question">Start a conversation <span aria-hidden="true">↗</span></button><a class="gc-link" href="tel:+18502665005">Or call (850) 266-5005</a></div></div></section>
</main>
`;
const navEnd = old.indexOf('</nav>') + 6;
const footerStart = old.indexOf('<footer>');
if (navEnd < 6 || footerStart < 0) throw new Error('Missing shared site chrome.');
let output = old.slice(0,navEnd) + '\n' + body + '\n' + old.slice(footerStart);
output = output.replace(/\s*<p class="gc-photo-credit-link">[\s\S]*?<\/p>/g,'');
output = output.replace('</footer>', `<p class="gc-photo-credit-link"><a href="/photo-credits" data-photo-credits-page="${photoNames.join(' ')}">Photography credits</a></p>\n</footer>`);
output = output.replace(/<body[^>]*>/, '<body class="gc-home">');
const title = 'Pensacola & Gulf Coast Realtor | Gregg Costin, FL & AL';
const description = 'Find your place on the Gulf Coast with Gregg Costin. Explore Pensacola, Emerald Coast and coastal Alabama homes, local guides, and buyer and seller expertise.';
output = output.replace(/<title>[^<]*<\/title>/, `<title>${title.replaceAll('&','&amp;')}</title>`);
for (const attribute of ['name="description"','property="og:description"','name="twitter:description"']) output = output.replace(new RegExp(`(<meta ${attribute} content=")[^"]*`), '$1' + description);
for (const attribute of ['property="og:title"','name="twitter:title"']) output = output.replace(new RegExp(`(<meta ${attribute} content=")[^"]*`), '$1' + title.replaceAll('&','&amp;'));
// Update page metadata inside the existing graph; shared entity definitions come from entity-lib.
output = output.replace(/(<script type="application\/ld\+json" data-entity="entity-graph:home">)([\s\S]*?)(<\/script>)/, (_, start, json, end) => {
  const graph = JSON.parse(json);
  for (const node of graph['@graph'] || []) if (node['@type'] === 'WebPage') { node.name = title; node.description = description; node.dateModified = modified; }
  return start + JSON.stringify(graph) + end;
});
output = enhanceHomeDiscovery(output);
if (!output.includes('/assets/costin-resource-library.css')) output = output.replace('</head>', '<link rel="stylesheet" href="/assets/costin-resource-library.css">\n</head>');
writeFileSync(file, output);
// Keep the existing AI-readable homepage excerpt aligned with the visible page.
const llmsFullFile = 'civilian-site/llms-full.txt';
const entities = {amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' ',middot:'·',rsquo:'’',lsquo:'‘',rdquo:'”',ldquo:'“',hellip:'…',copy:'©',reg:'®',ndash:'-',mdash:'-'};
const plainHome = body.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,' ').replace(/<[^>]*>/g,' ').replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi,(match,key)=>key.startsWith('#') ? String.fromCodePoint(key[1].toLowerCase()==='x' ? parseInt(key.slice(2),16) : Number(key.slice(1))) : entities[key] ?? match).replace(/\s+/g,' ').trim();
const fullText = readFileSync(llmsFullFile,'utf8').replace(/## [^\r\n]+\r?\nURL: https:\/\/greggcostin\.com\/\r?\n\r?\n[\s\S]*?(?=\r?\n\r?\n## )/,'## ' + title + '\nURL: https://greggcostin.com/\n\n' + plainHome).replace(/^# Last updated: .+$/m,'# Last updated: ' + modified);
writeFileSync(llmsFullFile,fullText);
const sitemapFile = 'civilian-site/sitemap.xml';
const sitemap = readFileSync(sitemapFile,'utf8').replace(/(<loc>https:\/\/greggcostin\.com\/<\/loc>\s*<lastmod>)[^<]+/, '$1' + modified);
writeFileSync(sitemapFile, sitemap);
// Finalize the complete shared catalog without changing its review dates or share card.
const attribution=spawnSync(process.execPath,['scripts/build-photography-credits.mjs','--site','gc','--root','civilian-site'],{encoding:'utf8'});
if(attribution.status)throw Error(attribution.stderr||attribution.stdout);
console.log(`Homepage built: ${areas.length} area guides, ${snapshots.length} sourced ZIP snapshots, ${faqs.length} mirrored FAQs.`);
