import {e,addCss,mapSchema,appendFaq,faqHtml} from './geo-core-lib.mjs';
import {placeQuickAnswer} from './quick-answer-lib.mjs';
// Refresh an existing page while preserving its URL, image, navigation and identity.
export function reviewedPage(html,spec,body,{marker='accuracy-review'}={}){
 const main=html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1];if(!main)throw Error('Main absent');
 const author=main.match(/<div class="author-card">[\s\S]*?<div class="ac-updated">[\s\S]*?<\/div><\/div><\/div>/)?.[0]||'';
 const explore=main.match(/<!-- EXPLORE_V2 -->[\s\S]*?<!-- \/EXPLORE_V2 -->/)?.[0]||'';
 const content=`<section data-${marker}="${e(spec.slug)}">${body}${faqHtml(spec.faq)}<section class="geo-guide"><h2>Work through your property decision with Gregg</h2><p>Bring the property or area you are considering, your timeline and the documents you have. Gregg can help organize the local questions for your home search or sale.</p><div class="geo-links"><a href="/contact" data-inquiry-open>Discuss my next step</a><a href="https://greggcostin.com/resources/coastal-ownership-costs">Compare complete ownership costs</a><a href="https://pensacolamilitaryhousing.com/va-loan-guide">VA purchase guide</a><a href="https://greggcostin.com/resources/seller-net-proceeds">Seller proceeds worksheet</a></div><p>Contact hours: 6 a.m. to midnight Central, daily.</p></section></section>`;
 html=html.replace(/(<main\b[^>]*>)[\s\S]*?(<\/main>)/,(_,a,z)=>a+author.replace(/<div class="ac-updated">[\s\S]*?<\/div>/,`<div class="ac-updated">Content reviewed ${spec.reviewLabel}</div>`)+content+explore+z);
 html=html.replace(/<title>[\s\S]*?<\/title>/,()=>`<title>${e(spec.title)}</title>`).replace(/<h1\b[^>]*>[\s\S]*?<\/h1>/,()=>`<h1>${e(spec.h1)}</h1>`).replace(/<p class="lead">[\s\S]*?<\/p>/,()=>`<p class="lead">${e(spec.lead)}</p>`);
 html=html.replace(/<meta\b[^>]*>/gi,tag=>{const k=tag.match(/(?:name|property)=["']([^"']+)["']/i)?.[1],v=['description','og:description','twitter:description'].includes(k)?spec.description:['og:title','twitter:title'].includes(k)?spec.title:k==='article:modified_time'?spec.reviewed:null;return v?tag.replace(/content=["'][^"']*["']/i,()=>`content="${e(v)}"`):tag;});
 html=mapSchema(html,n=>{if(['Article','BlogPosting'].includes(n['@type'])){n.headline=spec.h1;n.description=spec.description;n.dateModified=spec.reviewed;n.citation=spec.sources||[];}if(n['@type']==='FAQPage')n.mainEntity=[];});
 html=appendFaq(html,spec.faq).replace(/(<p\b[^>]*data-last-updated="true"[^>]*>)[\s\S]*?(<\/p>)/,(_,a,z)=>a+`Last updated: ${spec.reviewLabel}`+z).replace(/Content last verified: [^<]+/g,`Content last verified: ${spec.reviewLabel}`);
 return addCss(placeQuickAnswer(html,{text:spec.quickAnswer,date:spec.reviewLabel}));
}
