import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join, sep } from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { ROOT, parseFragment, strip } from './blog-lib.mjs';
import { readResearch, contentHash, evidenceHash, voiceFindings, updateBlogSitemap } from './blog-editorial-lib.mjs';
import { validateMilitaryEditorial, bahRateFindings } from './military-editorial-lib.mjs';
import { selectWork, importDemand, applyTopicPolicy } from './blog-plan-lib.mjs';
import { journeyFor, journeyHtml } from './blog-journey.mjs';
import { scorePost } from './score-post.mjs';
import { assertFragmentOwnership } from './military-blog-ownership.mjs';
const today = '2026-09-08';
const sha = value => createHash('sha256').update(value).digest('hex');
const clean = value => strip(value).replace(/\s+/g,' ').trim();
function fixture() {
  // Test-only adaptation of an existing source pack, never a publishable draft.
  const {spec, body} = structuredClone(parseFragment('content/civilian-blog/what-moves-mortgage-rates.fragment.html'));
  const research = structuredClone(readResearch(spec.slug));
  spec.faq = spec.faqs; delete spec.faqs;
  research.article.site = 'pmh';
  research.military = {audience:'veteran',readerSituation:'Test purchase decision',dutyLocations:['Pensacola'],topics:['local-market'],limitations:['Individual quote differs']};
  spec.quickAnswer = `Freddie Mac reported a ${research.claims[0].text}. Your quote depends on your property, borrower profile and loan terms.`;
  research.quickAnswerClaimIds = [research.claims[0].id];
  research.answerPassages = [...body.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>\s*<p\b[^>]*>([\s\S]*?)<\/p>/gi)].map(m => {
    const answer = clean(m[2]);
    return {question:clean(m[1]),answer,claimIds:research.claims.filter(c=>answer.includes(clean(c.text))).map(c=>c.id),scope:'Test fixture',caveat:answer};
  }).filter(a=>a.claimIds.length).slice(0,2);
  assert.equal(research.answerPassages.length,2);
  return {spec,body,research};
}
const check = f => validateMilitaryEditorial(f.spec,f.body,f.research,{today,requireReview:false});
const temp = () => mkdtempSync(join(tmpdir(),'costin-military-test-'));
function removeTemp(dir) {
  const path = resolve(dir);
  assert(path.startsWith(resolve(tmpdir())+sep) && path.includes('costin-military-test-'));
  rmSync(path,{recursive:true,force:true});
}

test('military FAQ field receives the full shared evidence checks',()=>assert.deepEqual(check(fixture()).errors,[]));
test('emojis and dashes in military FAQ, excerpt and link labels are blocked',()=>{
  for (const spec of [{faq:[{q:'Why?',a:'No \u2014'}]},{excerpt:'\u{1F600}'},{related:[{label:'Read &#8211; this'}]}]) assert(voiceFindings(spec,'').length);
  assert.deepEqual(voiceFindings({},'<a data-inquiry-type="PCS / Relocation \u2014 Buying">Plan my move</a>'),[]);
});
test('military source records cannot use civilian identity or a missing audience',()=>{
  const f=fixture();f.research.article.site='gc';delete f.research.military;
  const errors=check(f).errors;
  assert(errors.some(e=>e.includes('different site')));assert(errors.some(e=>e.startsWith('military: define')));
});
test('a quick answer cannot claim unrelated source support',()=>{
  const f=fixture();f.research.quickAnswerClaimIds=['payment'];
  assert(check(f).errors.some(e=>e.startsWith('answers: quickAnswer')));
});
test('quoted answers must belong to their question and preserve the caveat',()=>{
  const f=fixture();f.research.answerPassages[0].question='A different question?';
  f.research.answerPassages[1].caveat='A missing qualification.';
  const errors=check(f).errors;
  assert(errors.some(e=>e.includes('opening answer paragraph')));assert(errors.some(e=>e.includes('important caveat')));
});
test('a VA benefit claim needs VA evidence and eligibility context',()=>{
  const f=fixture();const c={id:'va-fixture',kind:'fact',text:'A VA loan requires eligibility.',scope:'United States',asOf:today,sourceIds:[f.research.sources[0].id]};
  f.body+='<p>'+c.text+'</p>';f.research.claims.push(c);
  const errors=check(f).errors;
  assert(errors.some(e=>e.includes('official VA source')));assert(errors.some(e=>e.includes('who qualifies')));
});
test('obsolete MHA and unsupported BAH shortcut are rejected',()=>{
  const f=fixture();f.research.military.topics=['bah'];f.body+='<p>FL023</p>';
  const errors=check(f).errors;
  for (const text of ['FL023','actual LES','not loan approval']) assert(errors.some(e=>e.includes(text)),text);
});
test('student and rental scenarios retain their own practical constraints',()=>{
  const f=fixture();f.research.military.audience='student';f.research.military.topics=['sell-or-rent'];
  f.body='<p>Use a conservative ownership budget.</p>';
  f.spec.faq=[];f.spec.lead='';f.spec.quickAnswer='';
  const errors=check(f).errors;
  assert(errors.some(e=>e.includes('actual orders')));assert(errors.some(e=>e.includes('vacancy')));
});
test('BAH comparisons reject wrong rate, wrong dimensions, unavailable and modified archives',()=>{
  const dir=temp();
  try {
    const rate={year:2026,mha:'FL064',grade:'E-5',dependency:'withDependents',monthly:100};
    assert(bahRateFindings(rate,dir).some(e=>e.includes('unavailable')));
    assert(bahRateFindings({...rate,mha:'FL023'},dir).length);
    mkdirSync(join(dir,'content/client-guides/research'),{recursive:true});
    const archive=Buffer.from('TEST FIXTURE, NOT A DOD ARCHIVE');
    const data={year:2026,source:'https://www.travel.dod.mil/example.zip',sourceSha256:sha(archive),areas:{FL064:{rates:{'E-5':{withDependents:100}}}}};
    writeFileSync(join(dir,'content/client-guides/bah-2026.json'),JSON.stringify(data));
    writeFileSync(join(dir,'content/client-guides/research/BAH-ASCII-2026.zip'),archive);
    assert.deepEqual(bahRateFindings(rate,dir),[]);
    assert(bahRateFindings({...rate,monthly:101},dir).some(e=>e.includes('differs')));
    writeFileSync(join(dir,'content/client-guides/research/BAH-ASCII-2026.zip'),'changed');
    assert(bahRateFindings(rate,dir).some(e=>e.includes('provenance')));
  } finally {removeTemp(dir);}
});
test('editing reviewed military content invalidates the sealed review',()=>{
  const f=fixture();f.research.review={contentHash:contentHash(f.spec,f.body),evidenceHash:evidenceHash(f.research),provider:'fixture',model:'fixture',checkedAt:today,notes:'Test only',checks:Object.fromEntries(['facts','calculations','voice','scope','sources','counterarguments'].map(k=>[k,true]))};
  assert.deepEqual(validateMilitaryEditorial(f.spec,f.body,f.research,{today}).errors,[]);
  f.body+='<p>A changed conclusion.</p>';
  assert(validateMilitaryEditorial(f.spec,f.body,f.research,{today}).errors.some(e=>e.includes('absent or stale')));
});
test('military scorer cannot mistake the same civilian slug for a military evidence record',()=>{
  const f=fixture();const scored=scorePost(f.spec,f.body,'pmh');
  assert.equal(scored.version,2);assert(scored.hardFails.some(e=>e.includes('missing matching')));
});
test('military demand never borrows civilian counts or invents demand from queue prose',()=>{
  const queue=[{slug:'test',targetKeywords:['PCS rent or sell']}];
  const latest={site:'pmh',generated:today,asOf:'2026-09-06',queries:[{key:'PCS rent or sell',imp28:7,last:'2026-09-05'}]};
  assert.equal(importDemand(queue,latest,{},today,'pmh').queue[0].demandEvidence.count,7);
  assert.equal(importDemand(queue,{...latest,site:'gc'},{},today,'pmh').queue[0].demandEvidence,undefined);
  const plan=selectWork({site:'pmh',today,corpus:[],refreshes:[],queue:[{slug:'test',evidence:'Bing had 500 impressions',audience:'military'}]});
  assert.equal(plan.selected.kind,'editorial-queue');
});
test('military planner preserves refresh priority and holds bad historical source assumptions',()=>{
  const plan=selectWork({site:'pmh',today,corpus:[],queue:[{slug:'pca',evidence:'FL023 is Eglin',audience:'military'},{slug:'buyer',audience:'civilian'},{slug:'future',notBefore:'2027-01-01'}],refreshes:[{site:'gc',priority:100,slug:'civilian'},{site:'pmh',priority:60,slug:'military'}]});
  assert.equal(plan.selected.item.slug,'military');assert(plan.ranked.every(i=>!i.runnable));
});
test('quarter reports wait for quarter-end and future BAH needs the actual official release',()=>{
  const policy=JSON.parse(readFileSync(join(ROOT,'content/blog/editorial-policy.json'),'utf8'));
  const queue=applyTopicPolicy([{slug:'pensacola-housing-market-q3-2026'},{slug:'2027-bah-pensacola-what-changed'}],policy,'pmh');
  const plan=selectWork({queue,site:'pmh',today,corpus:[],refreshes:[]});
  assert.equal(plan.selected,null);assert(plan.ranked[0].reasons.some(e=>e.includes('2026-10-01')));
  const bah=queue[1];bah.gateEvidence={status:'verified',checkedAt:'2026-12-20',year:2027,primarySource:'https://example.com/forecast',finding:'Not an official release'};
  assert.equal(selectWork({queue:[bah],site:'pmh',today:'2026-12-21',corpus:[],refreshes:[]}).selected,null);
  bah.gateEvidence.primarySource='https://www.travel.dod.mil/official-test-fixture';
  assert(selectWork({queue:[bah],site:'pmh',today:'2026-12-21',corpus:[],refreshes:[]}).selected);
});
test('custom military journeys use existing first-party destinations',()=>{
  const spec={slug:'example',category:'PCS',journey:{goal:'pcs-plan',prompt:'Prepare your move.',tool:'/pcs-guide',toolLabel:'Plan the move',bridge:'/va-loan-guide',bridgeLabel:'Review VA questions'}};
  assert.equal(journeyFor(spec,'pmh').goal,'pcs-plan');assert(journeyHtml(spec,'pmh',ROOT).includes('Prepare your move.'));
  spec.journey.tool='https://example.com';assert.throws(()=>journeyHtml(spec,'pmh',ROOT),/first-party/);
});
test('military refresh updates only target and hub sitemap dates',()=>{
  const origin='https://pensacolamilitaryhousing.com';
  const xml=`<urlset><url><loc>${origin}/bah-rates</loc><lastmod>2026-01-01</lastmod></url><url><loc>${origin}/blog/example</loc><lastmod>2026-02-01</lastmod></url></urlset>`;
  const result=updateBlogSitemap(xml,[{slug:'example',dateModified:today}],origin);
  assert(result.includes('/bah-rates</loc><lastmod>2026-01-01'));assert(result.includes('/blog/example</loc><lastmod>'+today));
});
test('a concurrent reviewed financial guide cannot be overwritten by the legacy blog generator',async()=>{
  const dir=temp();
  try {
    await assertFragmentOwnership(['test'],dir);
    mkdirSync(join(dir,'content/geo'),{recursive:true});
    writeFileSync(join(dir,'content/geo/financial-guide-data.mjs'),"export const FINANCIAL_GUIDES = {'blog/bah-reviewed':{}};");
    await assertFragmentOwnership(['ordinary-article'],dir);
    await assert.rejects(assertFragmentOwnership(['bah-reviewed'],dir),/Source-reviewed financial guide ownership/);
  } finally {removeTemp(dir);}
});
test('scoped military CLI builds real HTML without changing canonical artifacts',()=>{
  const dir=temp();const slug='personal-property-activity-pcs-2026';
  const watched=['content/blog/ledger.json','public/sitemap.xml','public/llms.txt','public/first-time-military-homebuyer.html','public/va-loan-guide.html','public/bah-rates.html','public/blog/'+slug+'.html'];
  const before=watched.map(p=>sha(readFileSync(join(ROOT,p))));
  try {
    const result=spawnSync(process.execPath,['scripts/blog-factory.mjs',slug,'--out',dir],{cwd:ROOT,encoding:'utf8'});
    assert.equal(result.status,0,result.stderr);
    assert.deepEqual(watched.map(p=>sha(readFileSync(join(ROOT,p)))),before);
    const html=readFileSync(join(dir,'blog',slug+'.html'),'utf8');
    assert.equal((html.match(/class="blog-toc"/g)||[]).length,1);
    const nodes=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
    const article=nodes.find(n=>n['@type']==='BlogPosting');
    assert.equal(article.url,'https://pensacolamilitaryhousing.com/blog/'+slug);
    assert(article.wordCount>1100);assert.equal(article.datePublished,parseFragment('content/blog/'+slug+'.fragment.html').spec.datePublished);
    assert.equal(article.headline,parseFragment('content/blog/'+slug+'.fragment.html').spec.h1);
    assert.equal((html.match(/<summary>/g)||[]).length,nodes.find(n=>n['@type']==='FAQPage').mainEntity.length);
    const ids=new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]));
    for(const m of html.matchAll(/href="#([^"]+)"/g)) assert(ids.has(m[1]),'missing anchor '+m[1]);
    assert(!existsSync(join(dir,'sitemap.xml')));
    const invalid=spawnSync(process.execPath,['scripts/blog-factory.mjs','not-an-existing-blog','--out',dir],{cwd:ROOT,encoding:'utf8'});
    assert.notEqual(invalid.status,0);assert.match(invalid.stderr,/No fragment/);
  } finally {removeTemp(dir);}
});
