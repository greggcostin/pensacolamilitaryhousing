// Read-only proof that the reviewed collection, not an older file, is public.
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {inspectDeployed} from './indexnow-lib.mjs';
const manifest=JSON.parse(readFileSync('content/client-guides/web-manifest.json','utf8'));
const catalog=JSON.parse(readFileSync('artifacts/client-library/build-report.json','utf8'));
const sha=x=>createHash('sha256').update(x).digest('hex');
const rows=[];
for(const path of [...manifest.paths,'/resources/florida-homestead-exemption']){
 const url='https://greggcostin.com'+path;
 try{const inspection=await inspectDeployed(url);const html=await (await fetch(url,{signal:AbortSignal.timeout(20000)})).text();const marker=path==='/resources/florida-homestead-exemption'?'BUYER_TAX_GUIDE_START':path==='/resources/client-guides'?'data-guide-link=':'guide-rich';
  rows.push({type:'html',url,live:html.includes(marker),httpStatus:inspection.httpStatus,reason:html.includes(marker)?'Reviewed guide content marker present.':'Live page lacks reviewed guide content.'});
 }catch(e){rows.push({type:'html',url,live:false,reason:e.message});}
}
for(const g of catalog.guides){
 const url=`https://${g.audience==='military'?'pensacolamilitaryhousing.com':'greggcostin.com'}/downloads/guides/${g.slug}.pdf`;
 try{const r=await fetch(url,{redirect:'manual',signal:AbortSignal.timeout(20000)});if(r.status!==200)throw new Error('HTTP '+r.status);const bytes=Buffer.from(await r.arrayBuffer());if(bytes.subarray(0,5).toString()!=='%PDF-')throw new Error('Response is not a PDF.');const match=sha(bytes)===sha(readFileSync('artifacts/client-library/'+g.pdf));rows.push({type:'pdf',url,live:match,httpStatus:r.status,reason:match?'Matches reviewed local PDF.':'Live PDF differs from reviewed edition.'});}
 catch(e){rows.push({type:'pdf',url,live:false,reason:e.message});}
}
const report={checkedAt:new Date().toISOString(),edition:catalog.edition,design:catalog.design,ready:rows.every(x=>x.live),rows};mkdirSync('docs/search-growth-2026-09-06',{recursive:true});writeFileSync('docs/search-growth-2026-09-06/publication-verification.json',JSON.stringify(report,null,2)+'\n');
console.log(`${rows.filter(x=>x.live).length}/${rows.length} reviewed destinations verified live. No submissions or publication performed.`);if(!report.ready)process.exitCode=1;
