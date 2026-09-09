// Refresh article-owned content without rolling back the live site's shared shell.
import {QA_CSS} from './quick-answer-lib.mjs';
import {plainBlogActions} from './blog-editorial-lib.mjs';
const mainPattern=/<main\b[^>]*>[\s\S]*?<\/main>/i;
const schemaPattern=/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
const articleTypes=new Set(['Article','BlogPosting','FAQPage','BreadcrumbList','Blog','ItemList']);
const ownedSchema=json=>{const n=JSON.parse(json);return articleTypes.has(n['@type']);};
export function preserveBlogShell(existing,generated,{articleCss=''}={}){
 if(!existing)return generated;
 const canonical=s=>s.match(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1];
 if(!canonical(existing)||canonical(existing)!==canonical(generated))throw Error('Blog shell canonical mismatch');
 const main=generated.match(mainPattern)?.[0];
 if(!main||!mainPattern.test(existing))throw Error('Blog shell requires an existing and generated main');
 let html=existing.replace(mainPattern,()=>main);
 for(const re of [/<title>[\s\S]*?<\/title>/i,/<h1\b[^>]*>[\s\S]*?<\/h1>/i,/<p class="lead">[\s\S]*?<\/p>/i]){
  const replacement=generated.match(re)?.[0];if(replacement)html=html.replace(re,()=>replacement);
 }
 const metas=new Map([...generated.matchAll(/<meta\b[^>]*>/gi)].map(m=>[m[0].match(/(?:name|property)="([^"]+)"/)?.[1],m[0]]));
 html=html.replace(/<meta\b[^>]*>/gi,tag=>{const k=tag.match(/(?:name|property)="([^"]+)"/)?.[1];return /^(?:description|keywords|og:|twitter:|article:)/.test(k||'')&&metas.has(k)?metas.get(k):tag;});
 const blocks=[...generated.matchAll(schemaPattern)].filter(m=>ownedSchema(m[1])).map(m=>m[0]);
 let schemaIndex=0;
 html=html.replace(schemaPattern,(tag,json)=>ownedSchema(json)?(blocks[schemaIndex++]||''):tag);
 if(schemaIndex<blocks.length)html=html.replace('</head>',()=>blocks.slice(schemaIndex).join('\n')+'\n</head>');
 const qaPattern=/<div class="quick-answer" data-quick-answer>[\s\S]*?<\/div>/g;
 const answer=generated.match(qaPattern)?.[0];
 if(answer){
  html=html.replace(qaPattern,'').replace(/(<main\b[^>]*>)\s*/,(_,tag)=>tag+'\n'+answer+'\n');
  const css='<style id="blog-quick-answer-style">'+QA_CSS+'</style>';
  html=/<style id="blog-quick-answer-style">[\s\S]*?<\/style>/.test(html)?html.replace(/<style id="blog-quick-answer-style">[\s\S]*?<\/style>/,()=>css):html.replace('</head>',css+'\n</head>');
 }
 const article=blocks.map(s=>JSON.parse(s.match(schemaPattern)?.[0]?.replace(/^<script[^>]*>|<\/script>$/g,'')||'{}')).find(n=>['Article','BlogPosting'].includes(n['@type']));
 if(article?.dateModified){
  const date=new Date(article.dateModified.slice(0,10)+'T12:00:00Z').toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric',timeZone:'UTC'});
  html=html.replace(/Content last verified: [A-Za-z]+ (?:\d{1,2}, )?\d{4}/g,'Content last verified: '+date);
 }
 for(const [tag,id] of [['style','article-journey-style'],['script','costin-article-runtime']]){
  const re=new RegExp('<'+tag+'\\b[^>]*id="'+id+'"[^>]*>[\\s\\S]*?<\\/'+tag+'>');
  const block=generated.match(re)?.[0];if(!block)continue;
  html=re.test(html)?html.replace(re,()=>block):html.replace(tag==='style'?'</head>':'</body>',end=>block+'\n'+end);
 }
 if(articleCss){
  const block='<style id="blog-content-style">'+articleCss+'</style>',re=/<style id="blog-content-style">[\s\S]*?<\/style>/;
  html=re.test(html)?html.replace(re,()=>block):html.replace('</head>',block+'\n</head>');
 }
 return plainBlogActions(html);
}
