import {readFileSync} from 'node:fs';
import {e,RATES,mapSchema,appendFaq,addCss} from './geo-core-lib.mjs';
import {guideTool} from './client-guide-tools.mjs';
export const COMMUNITY_BUDGETS=JSON.parse(readFileSync(new URL('../content/geo/community-budget-notes.json',import.meta.url),'utf8'));
const plain=h=>h.replace(/<[^>]+>/g,' ').replaceAll('&amp;','&').replaceAll('&#39;',"'").replaceAll('&quot;','"').replace(/\s+/g,' ').trim();
export function communityBudgetAnswer(slug){const d=COMMUNITY_BUDGETS[slug],rate=RATES[d.mha]['E-5'];return `There is no single BAH amount or pay grade that establishes approval for a home in ${d.name}. Use your actual income, debts and property-specific expenses. The published 2026 ${d.mha} E-5 with-dependent example is $${rate.withDependents.toLocaleString('en-US')} per month; your allowance follows your duty-station eligibility, not the home address. ${d.note}`;}
export function communityFaqAnswer(slug,question){
 const d=COMMUNITY_BUDGETS[slug],grades=[...new Set(question.match(/(?:E|O|W)-[1-9]/g)||['E-5'])];
 const rates=grades.filter(g=>RATES[d.mha][g]).map(g=>`${g}: $${RATES[d.mha][g].withDependents.toLocaleString('en-US')} with dependents or $${RATES[d.mha][g].withoutDependents.toLocaleString('en-US')} without dependents`).join('; ');
 if(/(?:Which|What) BAH rate applies/i.test(question))return `Your allowance follows your eligible duty station, not the home address. Eglin and Hurlburt assignments use the FL056 examples on this site. Published 2026 monthly ${rates}. Confirm the actual duty-station ZIP, eligibility and rate protection with finance.`;
 if(/or rent/i.test(question))return `Compare available homes with actual rental options over your expected holding period. Include purchase and sale costs, repairs, cash reserves and monthly expenses. A lower purchase price alone does not make buying the better choice. ${d.note}`;
 if(/Cantonment or Pace/i.test(question))return `Compare specific Cantonment and Pace homes using the same lender terms, buyer-based taxes, quoted insurance and recurring costs. Published 2026 FL064 monthly ${rates}. Your actual income, debts and lender review determine financing, and the route to your assignment may change which property works better.`;
 if(/strong BAH value/i.test(question))return `Whether Crestview offers better value depends on the available homes, their condition and full costs, and your actual duty route. Published 2026 FL056 monthly ${rates}. That allowance is not a home-price approval. ${d.note}`;
 return `A personal budget and property review are needed to answer that for ${d.name}. Published 2026 ${d.mha} monthly ${rates}; confirm your own duty-station entitlement with finance. Compare documented income, debts and the complete property costs with your lender. ${d.note}`;
}
export function enhanceCommunityFinance(html,slug){
 const d=COMMUNITY_BUDGETS[slug];if(!d)throw Error('Unknown community budget');let h=html.replaceAll('FL023','FL056'),replaced=0;const removed=[];
 const block=`<section class="geo-guide" data-community-budget="${slug}"><h2>Build your ${e(d.name)} housing budget</h2><p>${e(communityBudgetAnswer(slug))}</p><p><a href="/bah-rates#calculator">Compare the mortgage and ownership costs</a> · <a href="/bah-to-mortgage-guide#budget-tool">Compare your actual income scenarios</a> · <a href="https://greggcostin.com/resources/coastal-ownership-costs">Compare two properties</a></p><p class="geo-review">Budget guidance reviewed September 8, 2026. <a href="https://www.travel.dod.mil/Allowances/Basic-Allowance-for-Housing/BAH-Rate-Lookup/">Official BAH lookup</a> · <a href="https://www.consumerfinance.gov/owning-a-home/prepare/figure-out-how-much-you-want-to-spend/">CFPB ownership-budget guidance</a>.</p></section>`;
 const existing=new RegExp(`<section class="geo-guide" data-community-budget="${slug}">[\\s\\S]*?<\\/section>`);
 if(existing.test(h)){h=h.replace(existing,()=>block);replaced=1;}
 else h=h.replace(/<h2\b[^>]*>([\s\S]*?)<\/h2>([\s\S]*?)(?=<h2\b|<!-- EXPLORE_V2|<\/main>)/g,(full,heading)=>{
  if(!/BAH|purchase price|buying power/i.test(plain(heading)))return full;removed.push(plain(full));replaced++;return replaced===1?block+'\n':'';
 });
 if(!replaced)throw Error(`Expected BAH section missing: ${slug}`);
 // Remove approval promises outside the main BAH section as well, including old lead paragraphs.
 h=h.replace(/<(p|li)\b[^>]*>[\s\S]*?<\/\1>/g,(full,tag)=>{
  const t=plain(full);if(!/BAH/.test(t)||!/(?:E-[1-9]|O-[1-9]|W-[1-5])/.test(t)||!/(?:supports|clears|opens|unlocks|comfortably|approved for|approves at|BAH-neutral|officer money|full (?:run|range|market)|reaches into)/i.test(t))return full;
  removed.push(t);return `<${tag}>${e(d.note)} Compare your own income and the full property costs using the <a href="/bah-rates#calculator">ownership-cost calculator</a>.</${tag}>`;
 });
 const answers=[];
 h=mapSchema(h,node=>{if(node['@type']!=='FAQPage')return;for(const q of node.mainEntity||[]){if(!/BAH|afford|pay grade|buy.*E-[1-9]/i.test(q.name))continue;q.acceptedAnswer.text=communityFaqAnswer(slug,q.name);answers.push({q:q.name,a:q.acceptedAnswer.text});}});
 for(const answer of answers){let found=false;h=h.replace(/<details\b[^>]*>\s*<summary\b[^>]*>([\s\S]*?)<\/summary>[\s\S]*?<\/details>/g,(full,q)=>{if(plain(q)!==plain(answer.q))return full;found=true;return `<details><summary>${e(answer.q)}</summary><p>${e(answer.a)}</p></details>`;});if(!found)throw Error(`Visible community FAQ not found: ${slug}: ${answer.q}`);}
 return {html:addCss(h),removed,faq:answers};
}
export const CIVILIAN_COST_FAQ=[
 {q:'How can I estimate principal and interest before comparing two homes?',a:'Use the mortgage and ownership calculator on Gregg\'s military site with your lender\'s rate, down payment and applicable funding-fee choice. Then enter the principal-and-interest result into this two-home worksheet and add each property\'s own costs once.'},
 {q:'Do these worksheets use the same tax or insurance estimate for every coastal area?',a:'No. Enter each property\'s buyer-based tax estimate and quoted coverage. Florida and Alabama have different property-tax rules, and the worksheet does not determine an exemption, insurance availability or a mortgage approval.'},
 {q:'How should military buyers compare these costs with BAH?',a:'Compare the total monthly costs with actual income and debts as well as the verified allowance. Use Gregg\'s BAH and income worksheet to explore those scenarios. A rank or BAH amount alone does not establish a purchase-price approval.'}
];
export function enhanceCivilianCosts(html){
 const tool=/<section\b[^>]*data-guide-tool="ownership-cost"[^>]*>[\s\S]*?<\/section>/;
 if (!tool.test(html)) throw Error('Existing two-home worksheet not found');
 html=html.replace(tool,previous=>guideTool('ownership-cost').replace('<h2>',()=>previous.match(/<h2\b[^>]*>/)?.[0]||'<h2>'));
 const block=`<section class="geo-guide" data-financial-connection="ownership"><h2>Connect the mortgage, property costs and your move</h2><p>Start with a <a href="https://pensacolamilitaryhousing.com/bah-rates#calculator">mortgage and ownership-cost calculation</a> for the actual property, then use the two-home comparison here. Transfer only the principal-and-interest amount into that field and add each tax, insurance and monthly charge once. Use the dedicated monthly mortgage-insurance and recurring-assessment fields when those costs apply.</p><p>For military buyers, use the <a href="https://pensacolamilitaryhousing.com/bah-to-mortgage-guide#budget-tool">actual-income and BAH comparison</a> before deciding on a budget. Sellers can connect expected cash from the <a href="/resources/seller-net-proceeds">net-proceeds worksheet</a> with their next-purchase plan.</p>${CIVILIAN_COST_FAQ.map(({q,a})=>`<h3>${e(q)}</h3><p>${e(a)}</p>`).join('')}<p class="geo-review">Financial guidance reviewed September 8, 2026. <a href="https://www.consumerfinance.gov/owning-a-home/prepare/figure-out-how-much-you-want-to-spend/">CFPB ownership-budget guidance</a> · <a href="https://www.va.gov/housing-assistance/home-loans/funding-fee-and-closing-costs/">VA purchase fee rules</a>.</p></section>`;
 const re=/<section class="geo-guide" data-financial-connection="ownership">[\s\S]*?<\/section>/;
 return addCss(appendFaq(re.test(html)?html.replace(re,()=>block):html.replace(/(<main\b[^>]*>)/,(_,a)=>a+block),CIVILIAN_COST_FAQ));
}
