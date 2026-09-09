import {readFileSync,writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {REMAINING_GUIDES,FINANCE_SOURCES} from '../content/geo/remaining-financial-guides.mjs';
import {FINANCIAL_BODIES} from '../content/geo/remaining-financial-bodies.mjs';
import {reviewedPage} from './reviewed-page-lib.mjs';
const i=process.argv.indexOf('--root'),root=resolve(i>=0?process.argv[i+1]:'public');
const labels={purchase:'VA purchase loans',fee:'VA funding fees and closing costs',eligibility:'VA eligibility and entitlement',limits:'VA loan limits',irrrl:'VA IRRRL overview',irrrlRules:'VA lender IRRRL guidance',estimate:'CFPB Loan Estimate',budget:'CFPB ownership budget',tax:'Florida buyer property-tax guidance',bah:'DoD BAH lookup',irs:'IRS Publication 523',landlord:'Florida residential tenancy statutes',scra:'Department of Justice SCRA guidance'};
for(const [slug,spec] of Object.entries(REMAINING_GUIDES)){
 const sources=spec.sources.map(url=>`<a href="${url}">${labels[Object.keys(FINANCE_SOURCES).find(k=>FINANCE_SOURCES[k]===url)]}</a>`);
 if(slug==='va-irrrl-guide')sources.push('<a href="https://www.benefits.va.gov/HOMELOANS/documents/circulars/26-20-25.pdf">VA Circular 26-20-25: seasoning and recoupment</a>');
 const body=FINANCIAL_BODIES[slug]+`<section class="geo-guide"><h2>Sources and review scope</h2><p>Reviewed September 8, 2026: ${sources.join(', ')}. This review covers the statements on this page. It does not certify every page, older download, lender offer or individual transaction.</p></section>`;
 const path=join(root,slug+'.html');writeFileSync(path,reviewedPage(readFileSync(path,'utf8'),spec,body));
 console.log('Reviewed '+slug);
}
