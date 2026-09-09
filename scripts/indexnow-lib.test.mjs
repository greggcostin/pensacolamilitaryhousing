import {test} from 'node:test';import assert from 'node:assert/strict';
import {canonicalUrls,inspectDeployed,priorState,contentFingerprint} from './indexnow-lib.mjs';
import {readFileSync} from 'node:fs';
const url='https://greggcostin.com/buy';const html=`<html><head><link href="${url}" rel="canonical"></head><body><main>${'Useful buying information. '.repeat(12)}</main></body></html>`;
const response=(body=html,status=200,headers={})=>async()=>new Response(body,{status,headers:{'content-type':'text/html',...headers}});
test('rejects sibling domains, credentials, query variations and fragments',()=>{for(const u of ['https://greggcostin.com.evil.test/buy','https://greggcostin.com@evil.test/buy','http://greggcostin.com/buy',url+'?x=1',url+'#offer'])assert.throws(()=>canonicalUrls([u],'greggcostin.com'));assert.deepEqual(canonicalUrls([url,url],'greggcostin.com'),[url]);});
test('only live canonical substantive indexable HTML passes',async()=>{assert.equal((await inspectDeployed(url,response())).canonical,url);for(const r of [response('Not found',404),response(html,301),response(html.replace(url,'https://greggcostin.com/')),response(html,200,{'x-robots-tag':'noindex'}),response(html.replace('</head>','<meta name="robots" content="none"></head>')),response('<main>empty</main>')])await assert.rejects(()=>inspectDeployed(url,r));});
test('same-content acceptance deduplicates per engine; unknown needs review',()=>{const history=[{startedAt:'2026-09-06',engines:{indexnow:{status:'accepted',urls:[{url,fingerprint:'a'}]},bing:{status:'unknown',urls:[{url,fingerprint:'a'}]}}}];assert.equal(priorState(history,url,'a','indexnow'),'already_received');assert.equal(priorState(history,url,'a','bing'),'needs_receipt_review');assert.equal(priorState(history,url,'b','indexnow'),'new_or_changed');});
test('all six real prerendered SPA pages qualify for submission without a main-tag false negative',async()=>{
 for(const slug of ['', 'about', 'contact', 'pcs-guide', 'communities', 'mortgage-calculators']){
  const address='https://pensacolamilitaryhousing.com/'+slug,body=readFileSync(`dist/${slug||'index'}.html`,'utf8');
  assert.equal((await inspectDeployed(address,response(body))).canonical,address);
 }
});
test('a Pagefind marker does not make an empty JavaScript-only shell eligible',async()=>{
 await assert.rejects(()=>inspectDeployed(url,response(`<html><head><link rel="canonical" href="${url}"></head><body><div data-pagefind-body></div></body></html>`)),/substantive/);
});
const protectedEmail=(email,key)=>{const encoded=Buffer.from([key,...Buffer.from(email)].map((b,i)=>i?b^key:b)).toString('hex');return `<a href="/cdn-cgi/l/email-protection#${encoded}"><span data-cfemail="${encoded}">[email protected]</span></a>`;};
test('rotating email-protection keys do not trigger duplicate submission',()=>{
 const a=html.replace('</main>',protectedEmail('example@example.com',19)+'</main>'),b=html.replace('</main>',protectedEmail('example@example.com',231)+'</main>');
 assert.equal(contentFingerprint(a),contentFingerprint(b));
});
test('real email and body changes still alter the submission fingerprint',()=>{
 const a=html+protectedEmail('first@example.com',19),b=html+protectedEmail('second@example.com',231);
 assert.notEqual(contentFingerprint(a),contentFingerprint(b));assert.notEqual(contentFingerprint(a),contentFingerprint(a.replace('Useful buying','Updated buying')));
});
test('request-specific empty Cloudflare links are ignored while real links remain significant',()=>{
 const link=id=>`<a href="https://greggcostin.com/cdn-cgi/content?id=${id}" aria-hidden="true" rel="nofollow noopener" style="display: none !important; visibility: hidden !important"></a>`;
 assert.equal(contentFingerprint(html+link('first-token')),contentFingerprint(html+link('second-token')));
 assert.notEqual(contentFingerprint(html+link('first-token').replace('</a>','Read this</a>')),contentFingerprint(html+link('second-token').replace('</a>','Read this</a>')));
});
