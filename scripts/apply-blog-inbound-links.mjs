// Reapply reviewed contextual links after a hub or blog generator runs.
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';import {pathToFileURL} from 'node:url';
import {ROOT,SITES} from './blog-lib.mjs';
export function applyBlogInboundLinks(site,root=ROOT){
 const config=JSON.parse(readFileSync(root+'content/blog/contextual-links.json','utf8'));
 const groups=new Map();
 for(const row of config.links.filter(r=>r.site===site)){
  if(!/^[a-z0-9/-]+$/.test(row.hub)||!/^\/blog\/[a-z0-9-]+$/.test(row.post)||!row.sentence.includes('{link}'))throw Error('Invalid contextual blog link');
  for(const path of [row.hub,row.post.slice(1)])if(!existsSync(root+SITES[site].siteDir+'/'+path+'.html'))throw Error('Missing contextual link page: '+path);
  if(!groups.has(row.hub))groups.set(row.hub,[]);groups.get(row.hub).push(row);
 }
 const escape=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const changed=[];
 for(const [hub,rows] of groups){
  const file=root+SITES[site].siteDir+'/'+hub+'.html',before=readFileSync(file,'utf8');
  const block='<section data-blog-reading="contextual-v1" aria-labelledby="blog-reading-title"><h2 id="blog-reading-title">Work through the next decision</h2>'+rows.map(r=>'<p>'+escape(r.sentence).replace('{link}',`<a href="${r.post}">${escape(r.label)}</a>` )+'</p>').join('')+'</section>';
  const re=/<section data-blog-reading="contextual-v1"[\s\S]*?<\/section>/;
  if(!/<\/main>/.test(before))throw Error('Missing hub main: '+hub);
  const after=re.test(before)?before.replace(re,()=>block):before.replace('</main>',()=>block+'\n</main>');
  if(after!==before){writeFileSync(file,after);changed.push(file);}
 }
 return {site,hubs:groups.size,links:[...groups.values()].flat().length,changed};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)for(const site of ['gc','pmh'])console.log(JSON.stringify(applyBlogInboundLinks(site)));
