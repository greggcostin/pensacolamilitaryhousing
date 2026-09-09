// Discovery summaries come from rendered, published HTML, never an unbuilt draft.
import {readFileSync,writeFileSync,readdirSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';import {pathToFileURL} from 'node:url';
import {ROOT,SITES,strip} from './blog-lib.mjs';
import {applyBlogInboundLinks} from './apply-blog-inbound-links.mjs';
export function finishBlogDiscovery(site){
 const s=SITES[site],dir=ROOT+s.siteDir,posts=[];
 for(const file of readdirSync(dir+'/blog').filter(f=>f.endsWith('.html'))){
  const html=readFileSync(dir+'/blog/'+file,'utf8');
  const url=html.match(/<link rel="canonical" href="([^"]+)"/)?.[1],title=strip(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1]||'');
  const answer=strip(html.match(/<p class="qa-text">([\s\S]*?)<\/p>/)?.[1]||'');
  let article;for(const m of html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)){const n=JSON.parse(m[1]);if(['BlogPosting','Article'].includes(n['@type']))article=n;}
  if(!url||!title||!answer||!article?.dateModified)throw Error('Incomplete published blog discovery: '+file);
  posts.push({slug:file.slice(0,-5),url,title,answer,date:article.dateModified.slice(0,10),sources:article.citation||[]});
 }
 const block='<!-- BLOG_ANSWERS_START -->\n## Blog answers and supporting sources\n\nThese summaries mirror the published articles. Use the linked article for its complete assumptions, exceptions and source dates.\n\n'+posts.map(p=>'### '+p.title+'\n'+p.url+'\nReviewed: '+p.date+'\n'+p.answer+'\nSources: '+p.sources.join(', ')).join('\n\n')+'\n<!-- BLOG_ANSWERS_END -->';
 const full=dir+'/llms-full.txt',old=readFileSync(full,'utf8'),re=/<!-- BLOG_ANSWERS_START -->[\s\S]*?<!-- BLOG_ANSWERS_END -->/;
 writeFileSync(full,re.test(old)?old.replace(re,()=>block):old.trimEnd()+'\n\n'+block+'\n');
 const plan=existsSync(ROOT+'content/blog/contextual-links.json')?JSON.parse(readFileSync(ROOT+'content/blog/contextual-links.json','utf8')):null;
 const dates=new Map(posts.map(p=>[p.url,p.date]));
 if(plan){applyBlogInboundLinks(site);for(const p of plan.links.filter(p=>p.site===site))dates.set(s.origin+'/'+p.hub,plan.reviewed);}
 const sm=dir+'/sitemap.xml';writeFileSync(sm,readFileSync(sm,'utf8').replace(/<url>[\s\S]*?<\/url>/g,item=>{const date=dates.get(item.match(/<loc>([^<]+)<\/loc>/)?.[1]);if(!date)return item;return /<lastmod>/.test(item)?item.replace(/<lastmod>[^<]+<\/lastmod>/,'<lastmod>'+date+'</lastmod>'):item.replace('</url>','<lastmod>'+date+'</lastmod></url>');}));
 return {site,publishedArticles:posts.length,contextualLinks:plan?.links.filter(p=>p.site===site).length||0};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)for(const s of ['gc','pmh'])console.log(JSON.stringify(finishBlogDiscovery(s)));
