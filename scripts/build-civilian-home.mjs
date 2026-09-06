// Builds the civilian homepage from existing guides and its existing review/FAQ copy.
// Run before rollout-civilian-experience.mjs and apply-responsive-images.mjs.
import { readFileSync, writeFileSync } from 'node:fs';
const file = 'civilian-site/index.html';
const old = readFileSync(file, 'utf8');
// Change when the editorial content changes, not each time this builder runs.
const modified = '2026-09-06';
const esc = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const ledger = JSON.parse(readFileSync('content/blog/image-credits.json', 'utf8')).images;
const credit = name => {
  const entry = ledger['civilian-site/images/' + name + '.jpg'];
  return entry ? `Photo: <a href="${esc(entry.pageUrl)}" target="_blank" rel="noopener nofollow">${esc(entry.credit || entry.artist || entry.source)}</a>, ${esc(entry.license)}` : 'Photo: The Costin Team';
};
const img = (name, alt, width, height, priority = false) => `<picture><img src="/images/${name}.jpg" width="${width}" height="${height}" alt="${esc(alt)}" ${priority ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"></picture>`;
const blocks = [...old.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));
const faqs = blocks.find(b => b['@type'] === 'FAQPage')?.mainEntity;
const reviewStart = old.indexOf('<div class="review-grid">');
const reviewEnd = old.indexOf('<div class="btn-row">', reviewStart);
if (!faqs || reviewStart < 0 || reviewEnd < 0) throw new Error('Existing FAQ/review content must be present.');
const reviews = old.slice(reviewStart, reviewEnd).trim();
const areas = [
  ['east-hill-downtown','East Hill & Downtown','palafox-street','Character homes, parks, and Palafox Street',1600,1200],
  ['gulf-breeze','Gulf Breeze & Tiger Point','bay-bridge','Peninsula homes and access to Pensacola Bay',1600,559],
  ['pensacola-beach','Pensacola Beach','pensacola-beach','Gulf-front homes and barrier-island condos',1400,1868],
  ['perdido-key','Perdido Key','perdido-key','Coastal condos, beach access, and the state line',1600,1200],
  ['midtown-east-pensacola-heights','Midtown & East Pensacola Heights','graffiti-bridge','Bungalows, bayou access, and established streets',1600,1278],
  ['pace-milton','Pace & Milton','pace-milton','New construction, acreage, and Blackwater access',1600,1200],
  ['navarre','Navarre','navarre','Mainland neighborhoods and a barrier-island beach',1600,1067],
  ['cordova-park-northeast','Cordova Park & Northeast','cordova-park','Established homes and mature tree canopies',1200,675],
  ['beulah','Beulah','beulah','Newer construction in northwest Escambia County',1200,900],
  ['cantonment','Cantonment','cantonment','North-county homes, larger lots, and subdivisions',1200,900],
  ['fort-walton-beach','Fort Walton Beach','fort-walton','Sound-side homes and the Okaloosa corridor',1600,1061],
  ['destin','Destin','destin','Harbor living, coastal homes, and condos',1600,836],
  ['niceville','Niceville & Bluewater Bay','niceville','Bayou neighborhoods and Choctawhatchee Bay',1600,900],
  ['crestview','Crestview','crestview','Inland Okaloosa homes and new construction',1600,1067],
  ['foley','Foley, Alabama','gulf-shores','Inland Baldwin County, north of Gulf Shores',1600,1067],
  [null,'Gulf Shores & Orange Beach','orange-beach','Alabama coastal homes, condos, and boating',1600,1061]
];
const areaCards = areas.map(([slug,name,photo,fit,w,h]) => `<a class="area-card" href="${slug ? '/neighborhoods/' + slug : '/gulf-shores-orange-beach'}" data-guide-link="${slug || 'alabama-coast'}"><div class="nb-photo">${img(photo,name,w,h)}</div><div class="area-body"><span class="area-name">${esc(name)}</span><span class="area-fit">${esc(fit)}</span></div></a>`).join('\n');
const snapshots = [
  { area: 'Milton area', zip: '32570', value: 279289, path: '/neighborhoods/pace-milton', date: 'Aug 1, 2026' },
  { area: 'Central Pensacola', zip: '32503', value: 299979, path: '/neighborhoods/east-hill-downtown', date: 'Aug 1, 2026' },
  { area: 'Midway / Tiger Point', zip: '32563', value: 407122, path: '/neighborhoods/gulf-breeze', date: 'Aug 1, 2026' },
  { area: 'Foley, Alabama', zip: '36535', value: 306621, path: '/neighborhoods/foley', date: 'Jul 31, 2026' }
];
for (const row of snapshots) if (!readFileSync('civilian-site' + row.path + '.html','utf8').includes(row.value.toLocaleString('en-US'))) throw new Error(`Snapshot no longer matches guide: ${row.path}. Refresh the homepage data and its date.`);
const body = `
<main id="main-content">
<section class="gc-coast-hero" aria-labelledby="home-title">
  <div class="gc-hero-image">${img('navarre','White sand and sea oats on Santa Rosa Island along the Florida Gulf Coast',1600,1067,true)}</div>
  <div class="gc-wrap gc-hero-content">
    <div class="gc-hero-copy">
    <span class="gc-eyebrow">Pensacola &middot; Emerald Coast &middot; Coastal Alabama</span>
    <h1 id="home-title">Find your place<br><em>on the Gulf Coast.</em></h1>
    <p>I&rsquo;m Gregg Costin, your Realtor in Florida and Alabama. From Pensacola to the Emerald Coast and coastal Alabama, I&rsquo;ll help you make your next move with clear answers and a personal plan.</p>
    <div class="gc-actions"><a class="gc-button" href="/search" data-guide-link="hero-home-search">Explore homes <span aria-hidden="true">↗</span></a><a class="gc-button gc-button--line" href="/sell">Let&rsquo;s talk about selling <span aria-hidden="true">↗</span></a></div>
    <a class="gc-hero-bottom" href="/reviews"><span class="gc-stars" aria-label="Five stars">★★★★★</span><span>Real clients. Their words. <span aria-hidden="true">↗</span></span></a>
    </div>
    <figure class="gc-hero-portrait">${img('gregg-courthouse','Gregg Costin seated on the steps of the Escambia County Court House in downtown Pensacola',928,1152,true)}<figcaption><span>YOUR GULF COAST REALTOR</span><strong>Gregg Costin</strong><small>Florida &amp; Alabama<br>Levin Rinke Realty</small></figcaption></figure>
  </div>
  <span class="gc-hero-location">30.4&deg; N / 87.2&deg; W &nbsp; &middot; &nbsp; The Gulf Coast</span>
</section>
<p class="gc-hero-credit">Santa Rosa Island, Florida. ${credit('navarre')}</p>
<section class="gc-proof" aria-label="Your local real estate team"><div class="gc-wrap gc-proof-grid">
  <div><strong>Florida + Alabama</strong><span>One team across the state line</span></div>
  <div><strong>ABR &middot; SRS &middot; RENE</strong><span>Buyer, seller &amp; negotiation credentials</span></div>
  <div><strong>USAF Captain, retired</strong><span>Service that shapes our approach</span></div>
  <div><strong>Levin Rinke Realty</strong><span>Local knowledge. Personal representation.</span></div>
</div></section>
<section class="gc-section gc-plans"><div class="gc-wrap">
  <div class="gc-section-intro"><div><span class="gc-eyebrow">A good move starts with a good plan</span><h2>What does your next<br>chapter look like?</h2></div><p>A first home. More room. A new view. Start with what matters to you.</p></div>
  <div class="gc-planner">
    <nav class="gc-plan-choices" aria-label="Choose your real estate goal"><a href="/buy" data-plan="buy" aria-current="true"><span>01</span> Buy a home</a><a href="/sell" data-plan="sell" aria-current="false"><span>02</span> Sell a home</a><a href="/neighborhoods" data-plan="relocate" aria-current="false"><span>03</span> Relocate</a><a href="/gulf-shores-orange-beach" data-plan="invest" aria-current="false"><span>04</span> Invest</a></nav>
    <div class="gc-plan-result" data-plan-result aria-live="polite" aria-atomic="true"><h3>Find the home. Understand the whole picture.</h3><p>Compare neighborhoods, explore homes, and account for insurance, taxes, and closing costs before you make an offer.</p><div class="gc-plan-links"><a class="gc-link" href="/search" data-plan-link>Explore homes ↗</a><a class="gc-link" href="/buy" data-plan-link>Read the buyer guide ↗</a><button class="gc-ad-settings" type="button" data-inquiry-open data-inquiry-type="General Question" data-inquiry-message="I would like help buying a home on the Gulf Coast.">Build my plan ↗</button></div></div>
  </div>
</div></section>
<section class="gc-section"><div class="gc-wrap">
  <div class="gc-section-intro"><div><span class="gc-eyebrow">Find your corner of the coast</span><h2>One coastline.<br>So many ways to call it home.</h2></div><p>Get to know the homes, everyday costs, and practical tradeoffs before you fall in love with the view.</p></div>
  <div class="gc-region-grid">
    <a class="gc-region-card" href="/neighborhoods/east-hill-downtown" data-guide-link="pensacola">${img('palafox-street','Brick walkway under trees along Palafox Street in downtown Pensacola',1600,1200)}<span class="gc-arrow" aria-hidden="true">↗</span><div><small>Pensacola, Florida</small><h3>City character.<br>Coastal soul.</h3><p>Explore East Hill &amp; Downtown</p></div></a>
    <a class="gc-region-card" href="/neighborhoods/gulf-breeze" data-guide-link="gulf-breeze">${img('bay-bridge','The Pensacola Bay Bridge crossing toward Gulf Breeze',1600,559)}<span class="gc-arrow" aria-hidden="true">↗</span><div><small>Santa Rosa County</small><h3>Across the bay.</h3><p>Explore Gulf Breeze &amp; Tiger Point</p></div></a>
    <a class="gc-region-card" href="/neighborhoods/destin" data-guide-link="destin">${img('destin','Boats and the HarborWalk along Destin Harbor',1600,836)}<span class="gc-arrow" aria-hidden="true">↗</span><div><small>The Emerald Coast</small><h3>A different<br>point of view.</h3><p>Explore Destin</p></div></a>
    <a class="gc-region-card" href="/gulf-shores-orange-beach" data-guide-link="alabama-coast">${img('orange-beach','Boats and coastal condominiums at Orange Beach, Alabama',1600,1061)}<span class="gc-arrow" aria-hidden="true">↗</span><div><small>Coastal Alabama &middot; Alabama-licensed representation</small><h3>The coast continues.</h3><p>Explore Gulf Shores &amp; Orange Beach</p></div></a>
  </div>
  <p class="area-credits" data-photo-credits="palafox-street bay-bridge destin orange-beach">${['palafox-street','bay-bridge','destin','orange-beach'].map(credit).join(' &middot; ')}</p>
  <details class="gc-all-areas"><summary>Explore all 16 area guides: Pensacola to coastal Alabama</summary>
  <!-- AREA_CARDS_START -->
  <div class="area-grid">${areaCards}</div>
  <p class="area-credits" data-photo-credits="${areas.map(a => a[2]).join(' ')}">${[...new Set(areas.map(a => a[2]))].filter(name => ledger['civilian-site/images/' + name + '.jpg']?.creditRequired).map(credit).join(' &middot; ')}</p>
  <!-- AREA_CARDS_END -->
  </details>
</div></section>
<section class="gc-section gc-data"><div class="gc-wrap">
  <div class="gc-data-grid"><div><span class="gc-eyebrow">Local insight, with the numbers behind it</span><h2>Before the offer,<br>know the whole picture.</h2><p>The purchase price is the starting point. Insurance, property taxes, association costs, and financing all shape what a home costs to own.</p><p>Use our published area snapshots to get oriented. Then ask us for recent comparable sales and a closer look at the homes on your shortlist.</p><button class="gc-button" type="button" data-inquiry-open data-inquiry-type="General Question" data-inquiry-message="Please help me compare recent sales and ownership costs in the areas I am considering.">Get a local comparison <span aria-hidden="true">↗</span></button></div>
  <div><table><caption>Published ZIP value snapshots</caption><thead><tr><th scope="col">Area / source guide</th><th scope="col">Typical home value</th></tr></thead><tbody>${snapshots.map(row => `<tr><td><a href="${row.path}">${row.area}</a><small>ZIP ${row.zip} &middot; ${row.date}</small></td><td>$${row.value.toLocaleString('en-US')}</td></tr>`).join('')}</tbody></table><p class="gc-data-note">Figures reproduced from our dated neighborhood guides, using Zillow Research typical home values (ZHVI). Each figure covers the whole ZIP, including different neighborhoods and housing types. These are historical area snapshots, not current asking prices or appraisals. <a href="https://www.zillow.com/research/data/" target="_blank" rel="noopener">About the source ↗</a></p></div></div>
  <div class="gc-tools">
    <a class="gc-tool" href="https://pensacolamilitaryhousing.com/mortgage-calculators" data-guide-link="mortgage-calculators"><span aria-hidden="true">01</span><div><h3>Work through the payment ↗</h3><p>Explore the mortgage tools on our military housing site.</p></div></a>
    <a class="gc-tool" href="/resources/florida-home-insurance" data-guide-link="home-insurance"><span aria-hidden="true">02</span><div><h3>Understand the insurance ↗</h3><p>Read what to check before committing to a Florida home.</p></div></a>
    <a class="gc-tool" href="/schools" data-guide-link="school-data"><span aria-hidden="true">03</span><div><h3>Research local schools ↗</h3><p>Explore official grades and verify attendance boundaries.</p></div></a>
  </div>
</div></section>
<section class="gc-section"><div class="gc-wrap gc-person-grid">
  <div><span class="gc-eyebrow">Meet the person in your corner</span><h2>Local perspective.<br>A lifetime of showing up.</h2><div class="gc-signature">Gregg Costin</div><p class="gc-credentials">ABR &middot; SRS &middot; RENE &middot; MRP &middot; FMS</p></div>
  <div class="gc-person-copy"><p>I&rsquo;m Gregg Costin, a retired Air Force captain and a Realtor licensed in Florida and Alabama. Buying or selling a home should come with clear answers, thoughtful preparation, and someone who follows through.</p><p>Our team at Levin Rinke Realty helps you understand your options, weigh the tradeoffs, and move forward with a plan. From Pensacola and Gulf Breeze to the Emerald Coast and coastal Alabama, we bring the same care to every move.</p><a class="gc-link" href="/team">Meet The Costin Team <span aria-hidden="true">↗</span></a></div>
</div></section>
<section class="gc-section gc-reviews"><div class="gc-wrap"><div class="gc-section-intro"><div><span class="gc-eyebrow">The experience, in their words</span><h2>The best part of this work?<br>The people.</h2></div><a class="gc-link" href="/reviews">Read our client reviews ↗</a></div>
${reviews}
<div class="btn-row"><a class="gc-link" href="/reviews">More stories from our clients ↗</a></div>
</div></section>
<section class="gc-section"><div class="gc-wrap"><div class="gc-section-intro"><div><span class="gc-eyebrow">Good questions deserve useful answers</span><h2>A little local knowledge<br>goes a long way.</h2></div><a class="gc-link" href="/resources">Visit the resource library ↗</a></div>
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
writeFileSync(file, output);
const sitemapFile = 'civilian-site/sitemap.xml';
const sitemap = readFileSync(sitemapFile,'utf8').replace(/(<loc>https:\/\/greggcostin\.com\/<\/loc>\s*<lastmod>)[^<]+/, '$1' + modified);
writeFileSync(sitemapFile, sitemap);
console.log(`Homepage built: ${areas.length} area guides, ${snapshots.length} sourced ZIP snapshots, ${faqs.length} mirrored FAQs.`);
