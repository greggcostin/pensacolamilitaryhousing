import {readFileSync,readdirSync,existsSync} from 'node:fs';import {join,relative} from 'node:path';
import {GUIDES} from '../content/geo/core-guide-data.mjs';
import {FINANCIAL_GUIDES} from '../content/geo/financial-guide-data.mjs';
import {COMMUNITY_BUDGETS,communityBudgetAnswer,communityFaqAnswer} from './community-finance-lib.mjs';
import {COAST} from './geo-core-lib.mjs';
const plain=h=>h.replace(/<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>|<!--[\s\S]*?-->/gi,' ').replace(/<[^>]+>/g,' ').replaceAll('&amp;','&').replaceAll('&quot;','"').replaceAll('&#39;',"'").replaceAll('&#x27;',"'").replaceAll('&nbsp;',' ').replace(/\s+/g,' ').trim();
const walk=d=>readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(d,e.name)):e.isFile()?[join(d,e.name)]:[]);
export function auditFinancial(root){
 const findings=[];let faqPairs=0;const fail=(p,message)=>findings.push(`${p}: ${message}`);
 for(const file of walk(root).filter(f=>f.endsWith('.html'))){const h=readFileSync(file,'utf8');if(h.includes('FL023'))fail(relative(root,file),'Retired Eglin MHA code FL023');}
 const load=slug=>{const p=join(root,slug+'.html');if(!existsSync(p)){fail(slug,'Reviewed guide absent');return null;}return readFileSync(p,'utf8');};
 const faqs=html=>{const out=[];const visit=n=>{if(!n||typeof n!=='object')return;if(n['@type']==='FAQPage')out.push(...(n.mainEntity||[]));Object.values(n).forEach(visit);};for(const m of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)){try{visit(JSON.parse(m[1]));}catch{}}return out;};
 const checkFaq=(html,spec,slug)=>{const visible=plain(html),nodes=faqs(html);for(const {q,a} of spec){faqPairs++;if(!visible.includes(plain(q))||!visible.includes(plain(a))||!nodes.some(n=>n.name===q&&n.acceptedAnswer?.text===a))fail(slug,'Reviewed FAQ does not match visible text and schema: '+q);}};
 for(const [slug,spec] of Object.entries({...GUIDES,...FINANCIAL_GUIDES})){const h=load(slug);if(!h)continue;const kind=GUIDES[slug]?'geo':'financial';if(!h.includes(`data-${kind}-guide="${slug}"`))fail(slug,'Reviewed financial content marker absent');checkFaq(h,spec.faq,slug);if(/typically approved for|lender-qualified range|Tier 1 County Loan Limits|rank-by-rank max purchase/i.test(h))fail(slug,'Retired financial approval claim');if(!h.includes('Content last verified: '+new Date((spec.reviewed||'2026-09-08')+'T12:00:00Z').toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric',timeZone:'UTC'})))fail(slug,'Guide review footer differs from substantive review date');}
 for(const [slug] of Object.entries(COMMUNITY_BUDGETS)){const h=load('communities/'+slug);if(!h)continue;if(!h.includes(`data-community-budget="${slug}"`)||!plain(h).includes(communityBudgetAnswer(slug)))fail(slug,'Reviewed community budget absent');for(const q of faqs(h).filter(q=>/BAH|afford|pay grade|buy.*E-[1-9]/i.test(q.name)))checkFaq(h,[{q:q.name,a:communityFaqAnswer(slug,q.name)}],slug);}
 for(const base of COAST.bases){const h=load('bases/'+base.slug);if(h&&!h.includes(`data-geo-installation="${base.slug}"`))fail(base.slug,'Reviewed installation answer block absent');}
 for(const path of ['llms.txt','llms-full.txt']){const p=join(root,path);if(existsSync(p)&&readFileSync(p,'utf8').includes('FL023'))fail(path,'Retired Eglin code in discovery text');}
 for(const path of ['tools/ownership-model.js','tools/ownership-budget.js','tools/bah-budget-model.js','tools/bah-budget.js'])if(!existsSync(join(root,path)))fail(path,'Required financial tool asset missing');
 return {ok:findings.length===0,faqPairs,findings};
}
