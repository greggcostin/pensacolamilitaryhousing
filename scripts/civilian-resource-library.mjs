// A decision-based directory of existing, publicly available resources.
// The same data supplies visible links and CollectionPage/ItemList markup.
export const RESOURCE_REVIEW_DATE = '2026-09-08';
export const resourceGroups = [
  {id:'choose-an-area',number:'01',label:'Choose an area',title:'Find your corner of the coast.',photo:'palafox-street',alt:'A tree-lined walkway and historic buildings along Palafox Street in downtown Pensacola',summary:'Get to know the places behind the listings. Compare housing styles, access, local surroundings and education options before narrowing your search.',links:[
    ['Explore the neighborhood guides','/neighborhoods','Place guides from Pensacola to the Emerald Coast and coastal Alabama.'],
    ['Open the school finder','/schools#school-finder','Search by area, ZIP or home address; compare public, private and Christian options.'],
    ['Explore Perdido Key','/neighborhoods/perdido-key','Coastal homes, condos and waterfront considerations near the state line.'],
    ['Explore Gulf Shores & Orange Beach','/gulf-shores-orange-beach','A local starting point for your Alabama coastal home search.']
  ]},
  {id:'compare-homes',number:'02',label:'Compare homes',title:'Look beyond the listing photos.',photo:'perdido-waterfront',alt:'Archival aerial view of Perdido Key and its surrounding waterways',summary:'Put the property, financing and documents side by side. These guides help you identify the questions to resolve while you still have choices.',links:[
    ['Search available homes','/search','Browse communities and open the property search.'],
    ['Compare two homes’ ownership costs','/resources/coastal-ownership-costs','An editable worksheet for monthly costs, initial cash and your planning horizon.'],
    ['Review the condo checklist','/resources/condo-due-diligence','Organize association, building, insurance and financing questions.'],
    ['Understand Pensacola Beach leasehold','/resources/pensacola-beach-leasehold','A document-first guide to the lease and the obligations attached to a property.']
  ]},
  {id:'understand-costs',number:'03',label:'Understand costs',title:'Know what the budget includes.',photo:'three-mile-bridge',alt:'Both spans of the Three Mile Bridge crossing Pensacola Bay',summary:'Bring the full picture into focus: financing, taxes, insurance and cash needed to close. Replace planning examples with estimates for the actual property.',links:[
    ['Start with mortgage preapproval','/resources/mortgage-preapproval','Prepare the financing questions to discuss with your lender.'],
    ['Understand Florida closing costs','/blog/closing-costs-florida-buyers','See the expenses beyond the down payment.'],
    ['Read the Florida insurance guide','/resources/florida-home-insurance','Compare coverage, property condition and the information an insurer needs.'],
    ['Explore Florida homestead','/resources/florida-homestead-exemption','Find eligibility, filing and property-tax resources.'],
    ['Open the mortgage calculators','https://pensacolamilitaryhousing.com/mortgage-calculators','Payment and affordability tools on our military division’s site.']
  ]},
  {id:'prepare-to-sell',number:'04',label:'Prepare to sell',title:'Plan around what comes next.',photo:'gregg-courthouse',alt:'Gregg Costin on the steps of the Escambia County Courthouse in Pensacola',summary:'Start with your possible proceeds and your move date. Then connect pricing, preparation and the transaction milestones to a practical selling plan.',links:[
    ['Estimate your seller proceeds','/resources/seller-net-proceeds','Compare potential sale prices with payoff, costs, concessions and preparation.'],
    ['Follow the seller timeline','/resources/seller-transaction-timeline','Keep the milestones from preparation through closing in view.'],
    ['See how we sell homes','/sell','Our approach to pricing, marketing, negotiation and your next move.'],
    ['Get the printable client guides','/resources/client-guides','Illustrated planning guides to keep beside your transaction documents.']
  ]},
  {id:'plan-a-relocation',number:'05',label:'Plan a relocation',title:'Get oriented before you arrive.',photo:'navarre',alt:'White sand dunes and sea oats on Santa Rosa Island along the Florida Gulf Coast',summary:'A move has more than one timeline. Start with the purchase process and the local questions, then use our dedicated military resources when orders are part of the plan.',links:[
    ['Follow the buyer timeline','/resources/buyer-transaction-timeline','A guide to the milestones and questions from planning through closing.'],
    ['Read the first-time buyer guide','/resources/first-time-home-buyer','A practical introduction to the purchase process.'],
    ['Explore the military PCS guide','https://pensacolamilitaryhousing.com/pcs-guide','Installation, housing and move planning from the same Costin Team.'],
    ['Compare renting or selling for PCS','https://pensacolamilitaryhousing.com/rent-or-sell-pcs-pensacola','Work through the property and move decision when orders arrive.']
  ]}
];
export const escapeHtml = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const e = escapeHtml;
export function resourceLibraryMain({picture,schoolCount,mappedCount}) {
  return `<main id="main-content">
<section class="rl-hero" aria-labelledby="resource-title">
  <div class="rl-hero-scene" aria-hidden="true">${picture('navarre','',true)}</div>
  <div class="rl-wrap rl-hero-grid"><div><span class="rl-eyebrow">The Costin Team resource library</span><h1 id="resource-title">Gulf Coast real estate<br><em>guides &amp; tools.</em></h1><p>Clear answers for your next coastal move. Explore communities, compare homes, understand ownership costs and plan your sale across Florida and coastal Alabama.</p><a class="rl-button" href="#resource-paths">Find your starting point <span aria-hidden="true">↗</span></a></div>
  <aside class="rl-hero-note" aria-label="Using this library"><span class="rl-eyebrow">A useful place to begin</span><h2>Your questions.<br>A clearer next step.</h2><p>Use the guides and worksheets at your own pace. When you are ready, bring your shortlist and questions to Gregg.</p><a href="/contact" class="rl-link">Talk through your plans <span aria-hidden="true">↗</span></a></aside></div>
</section>
<nav class="rl-path-nav rl-wrap" aria-label="Choose a real estate decision">${resourceGroups.map(g=>`<a href="#${g.id}"><span>${g.number}</span>${e(g.label)} <span aria-hidden="true">↓</span></a>`).join('')}</nav>
<section class="rl-wrap rl-featured" aria-labelledby="start-with-tools"><div class="rl-section-heading"><div><span class="rl-eyebrow">Put your options side by side</span><h2 id="start-with-tools">Start with a useful tool.</h2></div><p>Open to explore. No signup required.</p></div><div class="rl-tool-grid">
<a class="rl-tool" href="/resources/coastal-ownership-costs" data-guide-link="coastal-ownership-costs"><span class="rl-tag">Compare two homes</span><h3>The whole ownership budget.</h3><p>Compare monthly expenses, initial cash and a planning horizon using your own figures.</p><span class="rl-tool-action">Open the worksheet ↗</span></a>
<a class="rl-tool" href="/schools#school-finder" data-guide-link="school-finder"><span class="rl-tag">${schoolCount} school records · ${mappedCount} mapped</span><h3>Schools around your shortlist.</h3><p>Explore four counties, available state grades and public, private and Christian schools.</p><span class="rl-tool-action">Explore the map ↗</span></a>
<a class="rl-tool" href="/resources/seller-net-proceeds" data-guide-link="seller-net-proceeds"><span class="rl-tag">Plan your sale</span><h3>What could you keep?</h3><p>Work through possible proceeds after your loan payoff and estimated selling expenses.</p><span class="rl-tool-action">Estimate your proceeds ↗</span></a>
</div></section>
<div class="rl-wrap rl-paths" id="resource-paths">${resourceGroups.map(g=>`<section class="rl-decision" id="${g.id}" aria-labelledby="${g.id}-title"><div class="rl-decision-media">${picture(g.photo,g.alt)}<div class="rl-image-label"><span>${g.number}</span><p>${e(g.label)}</p></div></div><div class="rl-decision-copy"><span class="rl-eyebrow">${e(g.label)}</span><h2 id="${g.id}-title">${e(g.title)}</h2><p class="rl-decision-summary">${e(g.summary)}</p><ul class="rl-guide-list">${g.links.map(([label,url,description])=>`<li><a href="${e(url)}" data-guide-link="${e(new URL(url,'https://greggcostin.com').pathname.split('/').at(-1))}"><strong>${e(label)} <span aria-hidden="true">↗</span></strong><span>${e(description)}</span></a></li>`).join('')}</ul></div></section>`).join('')}</div>
<section class="rl-source-band"><div class="rl-wrap rl-source-grid"><div><span class="rl-eyebrow">Useful information, with context</span><h2>Know what you are comparing.</h2><p>School grades use the state and reporting year identified in each guide. Availability and admissions come from the school or district. Nearby schools do not establish attendance eligibility.</p><p>Cost worksheets are planning tools. Use current, property-specific estimates from your lender, insurer, association and closing professional.</p></div><div class="rl-source-links"><a href="/resources/useful-links">Official local resources ↗</a><a href="/blog">Read the latest explainers ↗</a><a href="/faq">More questions and answers ↗</a><a href="/resources/client-guides">Printable guide library ↗</a></div></div></section>
<section class="rl-wrap rl-next"><div class="rl-next-photo">${picture('gregg-navy-no-tie','Gregg Costin, Realtor licensed in Florida and Alabama')}</div><div><span class="rl-eyebrow">A local perspective</span><h2>Bring your questions.<br>We will build the next step together.</h2><p>Tell us which areas or properties you are considering, or what you need to accomplish with your sale. We will help you turn the research into a practical plan.</p><div class="rl-next-actions"><a class="rl-button" href="/contact">Plan your next move ↗</a><a class="rl-link" href="tel:+18502665005">Call (850) 266-5005</a></div></div></section>
</main>`;
}
export function enhanceHomeDiscovery(html,{schoolCount=274}={}) {
  html=html.replace(/<div class="gc-tools">[\s\S]*?<\/a>\s*<\/div>/,`<div class="gc-tools">
<a class="gc-tool" href="/resources/coastal-ownership-costs" data-guide-link="coastal-ownership-costs"><span aria-hidden="true">01</span><div><h3>Compare the whole cost ↗</h3><p>Put two homes side by side with your own monthly costs and initial cash.</p></div></a>
<a class="gc-tool" href="/resources/seller-net-proceeds" data-guide-link="seller-net-proceeds"><span aria-hidden="true">02</span><div><h3>Plan your sale proceeds ↗</h3><p>Explore what may remain after payoff, costs and preparation.</p></div></a>
<a class="gc-tool" href="/schools#school-finder" data-guide-link="school-finder"><span aria-hidden="true">03</span><div><h3>Explore schools on the map ↗</h3><p>${schoolCount} records across four counties, with public, private and Christian options.</p></div></a>
</div>`);
  html=html.replace(/<p class="gc-review-source-note">[\s\S]*?<\/p>/,'<p class="gc-review-source-note">Counts recorded September 6, 2026: Google confirmed by Gregg; Zillow from its indexed team profile. Review counts can change. Visit the profiles for the latest client feedback.</p>');
  return html;
}
export function resourceCollectionSchema(existing) {
  const items=[...new Map(resourceGroups.flatMap(g=>g.links).map(([name,url])=>[url,{name,url:new URL(url,'https://greggcostin.com').href}])).values()];
  return {...existing,name:'Gulf Coast Real Estate Guides & Tools | Gregg Costin',description:'Explore Gulf Coast real estate guides, school maps, ownership-cost worksheets and seller tools for Pensacola, the Emerald Coast and coastal Alabama.',dateModified:RESOURCE_REVIEW_DATE,mainEntity:{'@type':'ItemList',itemListElement:items.map((item,i)=>({'@type':'ListItem',position:i+1,item:{'@type':'WebPage',name:item.name,url:item.url}}))}};
}
