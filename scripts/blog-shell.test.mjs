import test from 'node:test';
import assert from 'node:assert/strict';
import {preserveBlogShell} from './blog-shell-lib.mjs';
import {journeyHtml} from './blog-journey.mjs';
import {ROOT,parseFragment} from './blog-lib.mjs';
import {validateEditorial,readResearch} from './blog-editorial-lib.mjs';
const page=(text)=>'<html><head><link rel="canonical" href="https://greggcostin.com/blog/x"><title>'+text+'</title><meta name="description" content="'+text+'"><script type="application/ld+json">{"@type":"BlogPosting","headline":"'+text+'"}</script></head><body><h1>'+text+'</h1><main>'+text+'</main></body></html>';
test('article refresh preserves shared chrome, entity graph, privacy and receipt code',()=>{
 const shared='<script src="/assets/costin-privacy.js"></script><script src="/assets/costin-conversions.js" defer></script><script type="application/ld+json" data-entity="entity-graph:compact">{"@graph":[{"@type":"Person","name":"Gregg"}]}</script>';
 const existing=page('old').replace('</head>',shared+'</head>').replace('<main>','<nav>Current navigation</nav><main>').replace('</body>','<footer>Current contact hours</footer></body>');
 const result=preserveBlogShell(existing,page('new'),{articleCss:'.blog-table{width:100%}'});
 assert(result.includes(shared));assert(result.includes('<nav>Current navigation</nav>'));assert(result.includes('<footer>Current contact hours</footer>'));
 assert(result.includes('<main>new</main>'));assert(!result.includes('"headline":"old"'));assert.equal((result.match(/"@type":"BlogPosting"/g)||[]).length,1);
 assert.equal(preserveBlogShell(result,page('new'),{articleCss:'.blog-table{width:100%}'}),result);
 assert.throws(()=>preserveBlogShell(existing,page('new').replace('/blog/x','/blog/y')),/canonical mismatch/);
});
test('only real first-party section anchors are accepted as article next steps',()=>{
 const spec={slug:'fixture',journey:{goal:'property-budget',prompt:'Compare costs.',tool:'/bah-rates#calculator',toolLabel:'Budget',bridge:'/bah-to-mortgage-guide#budget-tool',bridgeLabel:'Income'}};
 assert(journeyHtml(spec,'pmh',ROOT).includes('/bah-rates#calculator'));
 for(const tool of ['/bah-rates#absent-fixture-anchor','/bah-rates?email=private','https://example.com/'])assert.throws(()=>journeyHtml({...spec,journey:{...spec.journey,tool}},'pmh',ROOT));
});
test('quick answer outside the template main survives and replaces the old answer',()=>{
 const qa=text=>'<div class="quick-answer" data-quick-answer><p class="qa-text">'+text+'</p></div>';
 const old=page('old').replace('<main>',qa('stale answer')+'<main>'),fresh=page('new').replace('<main>',qa('reviewed answer')+'<main>');
 const result=preserveBlogShell(old,fresh);
 assert(result.includes('<main>\n'+qa('reviewed answer')));assert(!result.includes('stale answer'));assert.equal((result.match(/data-quick-answer/g)||[]).length,1);
 assert.equal(preserveBlogShell(result,fresh),result);
});
test('source URLs must be clickable citations and encoded query delimiters remain valid',()=>{
 const {spec,body}=parseFragment('content/civilian-blog/what-moves-mortgage-rates.fragment.html'),r=structuredClone(readResearch(spec.slug));
 const s=r.sources[0],old=s.url;s.url='https://example.org/report?a=1&b=2';
 const replacement=body.replaceAll(old,s.url.replaceAll('&','&amp;'));
 const check=h=>validateEditorial(spec,h,r,{today:spec.dateModified,requireReview:false}).errors.filter(e=>e.includes('no supporting source link'));
 assert.deepEqual(check(replacement),[]);
 const hidden=replacement.replaceAll('href="'+s.url.replaceAll('&','&amp;')+'"','data-source="'+s.url+'"');
 assert(check(hidden).length>0);
});
