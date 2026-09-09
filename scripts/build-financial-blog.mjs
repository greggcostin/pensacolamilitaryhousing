import {assertBlogRendered} from './blog-render-gate.mjs';
// Financial-owned blog pages keep their reviewed canonical body and the blog gates.
// Both copies must agree before rendering so an old fragment cannot restore retired math.
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';import {pathToFileURL} from 'node:url';
import {ROOT} from './blog-lib.mjs';
import {FINANCIAL_GUIDES} from '../content/geo/financial-guide-data.mjs';
import {loadFragment,renderMilitaryPost} from './blog-factory.mjs';
import {preserveBlogShell} from './blog-shell-lib.mjs';
import {finishBlogDiscovery} from './finish-blog-discovery.mjs';
export function renderFinancialBlog(html,slug){
 if(!slug.startsWith('blog/')||!Object.hasOwn(FINANCIAL_GUIDES,slug))throw Error('Not a financial-owned blog: '+slug);
 const name=slug.slice(5),canonical=readFileSync(ROOT+'content/geo/'+name+'.fragment.html','utf8').trim();
 const spec=loadFragment(ROOT+'content/blog/'+name+'.fragment.html');
 if(spec.body.trim()!==canonical)throw Error(name+': financial canonical body and reviewed blog fragment differ; reconcile and review both before building');
 const date=new Date(spec.dateModified+'T12:00:00Z').toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric',timeZone:'UTC'});
 return preserveBlogShell(html,renderMilitaryPost({...spec,body:`<section data-financial-guide="${slug}">${canonical}</section>`},html)).replace(/Content last verified: [A-Za-z]+ \d{1,2}, \d{4}/g,'Content last verified: '+date);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const wanted=process.argv.slice(2),names=Object.keys(FINANCIAL_GUIDES).filter(s=>s.startsWith('blog/'));
 for(const name of wanted)if(!names.includes('blog/'+name))throw Error('Unknown financial blog '+name);
 for(const slug of names.filter(s=>!wanted.length||wanted.includes(s.slice(5)))){
  const file=ROOT+'public/'+slug+'.html',html=renderFinancialBlog(readFileSync(file,'utf8'),slug);
  assertBlogRendered(loadFragment(ROOT+'content/blog/'+slug.slice(5)+'.fragment.html'),html);
  writeFileSync(file,html);console.log('FINANCIAL BLOG: '+slug);
 }
 finishBlogDiscovery('pmh');
}
