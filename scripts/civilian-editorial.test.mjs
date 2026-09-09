import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import { parseFragment } from './blog-lib.mjs';
import { contentHash, evidenceHash, isModern, readResearch, validateEditorial, voiceFindings, sectionLinks, updateBlogSitemap, finalizeArticleHtml, plainBlogActions, updateBlogListing } from './civilian-editorial-lib.mjs';
import { buildCorpus, compareTopic } from './blog-dedup-check.mjs';
import { selectWork, importDemand } from './civilian-blog-plan.mjs';
import { monthlyPrincipalInterest, simpleBreakEven } from './civilian-mortgage-math.mjs';
const original = parseFragment('content/civilian-blog/what-moves-mortgage-rates.fragment.html');
const brief = () => structuredClone(readResearch(original.spec.slug));
const check = (spec=original.spec, body=original.body, research=brief(), requireReview=false) => validateEditorial(spec, body, research, {today:original.spec.dateModified,requireReview});

test('final article evidence record has no structural findings',()=>assert.deepEqual(check().errors,[]));
test('required civilian elements cannot be traded away for a high score',()=>{
  const spec=structuredClone(original.spec);spec.shareHook='';spec.faqs[0].a='Too short.';
  const research=brief();research.localApplications=research.localApplications.slice(0,1);
  const body=original.body.replace(/<a\b[^>]*>/g,'<span>').replace(/<\/a>/g,'</span>');
  const errors=check(spec,body,research).errors;
  for (const requirement of ['links:','FAQ: each answer','shareHook:','local: document two']) assert(errors.some(e=>e.startsWith(requirement)),requirement);
});
test('refresh of old post activates the current standard',()=>assert.equal(isModern({datePublished:'2020-01-01',dateModified:'2026-09-08'}),true));
test('build-only properties do not invalidate final source review',()=>assert.equal(contentHash(original.spec,original.body),contentHash({...original.spec,body:original.body,outDir:'preview'},original.body)));
test('changing content invalidates a previously sealed review',()=>{
  const r=brief();r.review={contentHash:contentHash(original.spec,original.body),evidenceHash:evidenceHash(r),provider:'test',model:'fixture',checkedAt:original.spec.dateModified,notes:'Fixture only',checks:Object.fromEntries(['facts','calculations','voice','scope','sources','counterarguments'].map(k=>[k,true]))};
  assert(!check(original.spec,original.body,r,true).errors.length);
  assert(check(original.spec,original.body+'<p>New claim.</p>',r,true).errors.some(e=>e.startsWith('review: absent or stale')));
  r.sources[0].evidenceNote='Changed evidence';assert(check(original.spec,original.body,r,true).errors.some(e=>e.startsWith('review: evidence changed')));
});
test('source mismatch, absent passage and expired figures block',()=>{
  for (const mutate of [r=>r.claims[0].sourceIds=['missing'],r=>r.claims[0].text='An unsupported value 9.99%',r=>r.claims[0].expires='2026-09-01']) {
    const r=brief();mutate(r);assert(check(original.spec,original.body,r).errors.some(e=>e.startsWith('claim pmms-current')));
  }
});

test('incorrect recorded calculations cannot pass a sealed-looking evidence record',()=>{
  const r=brief();r.claims.find(c=>c.id==='payment').calculation.result=1234;
  assert(check(original.spec,original.body,r).errors.some(e=>e.includes('arithmetic check failed')));
});
test('encoded dashes and emojis cannot evade the voice check',()=>{
  for(const text of ['hello &mdash; there','hello &#8211; there','hello &#x1f600;','hello \u{1f1fa}\u{1f1f8}']) assert(voiceFindings({},'<p>'+text+'</p>').length);
  assert.equal(voiceFindings({},'<p>A 30-year term costs $2,500.</p>').length,0);
});
test('85-word quick answer and future modification date block',()=>{
  assert(check({...original.spec,quickAnswer:'In 2026 '+('word '.repeat(82))+'. Another sentence.'}).errors.some(e=>e.startsWith('quickAnswer')));
  assert(check({...original.spec,dateModified:'2099-01-01'}).errors.some(e=>e.startsWith('date:')));
});
test('local name repetition does not pass as local application',()=>{
  const r=brief();r.localApplications=[{place:'Pensacola',decision:'name stuffing',passage:'not in the actual article'}];
  assert(check(original.spec,original.body,r).errors.some(e=>e.startsWith('local:')));
});
test('section anchors are stable and unique',()=>{
  const a=sectionLinks('<h2>Rate locks?</h2><h2>Rate locks?</h2><h2 id="custom">Next</h2>');
  assert.deepEqual(a.links.map(l=>l.id),['rate-locks','rate-locks-2','custom']);assert.equal(sectionLinks(a.html).html,a.html);
});
test('sitemap refresh changes the target date and preserves unrelated entries',()=>{
  const xml='<urlset><url><loc>https://greggcostin.com/blog/test</loc><lastmod>2020-01-01</lastmod><changefreq>monthly</changefreq></url><url><loc>https://greggcostin.com/sell</loc><lastmod>2026-01-01</lastmod></url></urlset>';
  const out=updateBlogSitemap(xml,[{slug:'test',datePublished:'2020-01-01',dateModified:'2026-09-08'}],'https://greggcostin.com');
  assert(out.includes('<lastmod>2026-09-08</lastmod>'));assert(out.includes('<changefreq>monthly</changefreq>'));assert(out.includes('<loc>https://greggcostin.com/sell</loc><lastmod>2026-01-01</lastmod>'));
  assert.equal(updateBlogSitemap(out,[{slug:'test',dateModified:'2026-09-08'}],'https://greggcostin.com'),out);
});
test('dedup finds both civilian pages and unpublished military fragments',()=>{
  const root=mkdtempSync(join(tmpdir(),'costin-blog-test-'));
  try {
    mkdirSync(join(root,'civilian-site/blog'),{recursive:true});mkdirSync(join(root,'content/blog'),{recursive:true});
    writeFileSync(join(root,'civilian-site/blog/test.html'),'<title>Gulf Coast Rental Reserves</title><h1>Gulf Coast rental reserves</h1>');
    writeFileSync(join(root,'content/blog/unpublished.fragment.html'),'<!--PAGE {"slug":"unpublished","title":"Mortgage locks","targetKeywords":["mortgage lock rules"]} PAGE--><h2>How do mortgage locks work?</h2>');
    const corpus=buildCorpus(root);
    assert(compareTopic({targetKeywords:['gulf coast rental reserves']},corpus).hits.some(h=>h.site==='gc'&&h.verdict==='INTENT-REVIEW'));
    assert(compareTopic({targetKeywords:['mortgage lock rules']},corpus).hits.some(h=>h.hasFragment&&h.verdict==='INTENT-REVIEW'));
  } finally {
    const full=resolve(root);assert(full.startsWith(resolve(tmpdir())+sep)&&full.includes('costin-blog-test-'));rmSync(full,{recursive:true,force:true});
  }
});
test('observed demand requires source, site and dates; headlines cannot trigger news override',()=>{
  const args={today:'2026-09-08',corpus:[],recentPillars:[],refreshes:[],queue:[{slug:'plain',pillar:'selling'},{slug:'fake',pillar:'selling',evidence:'Bing demand 1000'}],events:[{status:'verified',date:'2026-09-08',materialImpact:'a headline'}]};
  assert.equal(selectWork(args).selected.item.slug,'plain');
  args.queue[1].demandEvidence={availability:'observed',source:'dated-export.csv',site:'gc',engine:'bing',count:20,windowStart:'2026-08-01',windowEnd:'2026-09-01'};
  assert.equal(selectWork(args).selected.item.slug,'fake');args.queue[1].demandEvidence.site='pmh';assert.equal(selectWork(args).selected.item.slug,'plain');
});
test('payment math amortizes to zero and handles zero interest',()=>{
  const payment=monthlyPrincipalInterest(400000,6.75,360);assert.equal(payment.toFixed(2),'2594.39');
  let balance=400000;for(let i=0;i<360;i++)balance=balance*(1+6.75/1200)-payment;assert(Math.abs(balance)<0.0001);
  assert.equal(monthlyPrincipalInterest(1200,0,12),100);assert.equal(Math.ceil(simpleBreakEven(4000,65)),62);assert.throws(()=>simpleBreakEven(4000,0));
});

test('demand import preserves actual windows and requires verified records',()=>{
  const queue=[{slug:'rate',targetKeywords:['rate lock costs']}];
  const latest={site:'gc',engine:'bing',source:'bing-api',windowStart:'2026-08-10',windowEnd:'2026-09-06',endpointStatus:{queries:{status:'observed'}},queries:[{key:'Rate lock costs',seen28:2,imp28:15,imp90:99},{key:'Rental vacancy',seen28:1,imp28:7},{key:'Absent',seen28:0,imp28:500}]};
  const out=importDemand(queue,latest,{questions:[{site:'gc',question:'rate lock costs',count:100,verified:false}]},'2026-09-08');
  assert.equal(out.queue[0].demandEvidence.count,15);
  assert.equal(out.queue[0].demandEvidence.windowStart,'2026-08-10');
  assert.equal(out.demandReview.length,1);
  assert.equal(out.demandReview[0].query,'Rental vacancy');
  assert.equal(importDemand(queue,{...latest,site:'pmh'},{},'2026-09-08').queue[0].demandEvidence,undefined);
  assert.equal(importDemand(queue,{...latest,windowEnd:'2026-10-01'},{},'2026-09-08').queue[0].demandEvidence,undefined);
});

test('committed Bing aggregates preserve positive demand without inventing completeness',()=>{
  const queue=[{slug:'rate',targetKeywords:['rate lock costs']}];
  const latest={site:'gc',generated:'2026-09-08',asOf:'2026-09-06',queries:[{key:'rate lock costs',imp28:7,last:'2026-09-05'}]};
  const result=importDemand(queue,latest,{},'2026-09-08');
  assert.equal(result.queue[0].demandEvidence.count,7);
  assert.equal(result.queue[0].demandEvidence.windowStart,'2026-08-10');
  assert.match(result.queue[0].demandEvidence.coverage,/completeness unavailable/);
  for (const invalid of [{...latest,generated:'2026-09-07'},{...latest,asOf:'2026-99-99'},{...latest,endpointStatus:{queries:{status:'unavailable'}}},{...latest,queries:[{key:'rate lock costs',imp28:0,last:'2026-09-05'}]}]) {
    assert.equal(importDemand(queue,invalid,{},'2026-09-08').queue[0].demandEvidence,undefined);
  }
});

test('article finishing removes duplicate template navigation without removing content',()=>{
  const html='<nav class="blog-toc">Editorial contents</nav><!-- COSTIN_TOC_START --><details>Duplicate</details><!-- COSTIN_TOC_END --><div class="gc-interior-hero-actions"><a>Extra</a></div><div class="gc-interior-grid"><p>Actual article.</p></div><aside class="gc-interior-aside" aria-label="Local help and next steps"><div>Extra</div></aside><div class="inq-cta">Contextual action.</div>';
  const result=finalizeArticleHtml(html);
  assert(result.includes('Actual article.'));assert(result.includes('Contextual action.'));assert(!result.includes('Duplicate'));assert(!result.includes('Extra'));
  assert.equal(finalizeArticleHtml(result),result);
  assert.equal(plainBlogActions('<a class="smc-call" href="tel:+18502665005">\u{1f4de} Call</a>'),'<a class="smc-call" href="tel:+18502665005">Call</a>');
});

test('blog discovery updates preserve other generators markers',()=>{
  const text='## Blog Posts (auto-maintained)\nold\n\n<!-- ALL_SCHOOL_GUIDES_START -->\n## Complete school guides\nunchanged';
  const updated=updateBlogListing(text,'## Blog Posts (auto-maintained)\nnew\n');
  assert(updated.endsWith('<!-- ALL_SCHOOL_GUIDES_START -->\n## Complete school guides\nunchanged'));
  assert(!updated.includes('\nold\n'));
});
