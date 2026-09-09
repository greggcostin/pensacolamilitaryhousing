// One route schema builder for direct HTML requests and client-side navigation.
import {IDENTITY} from './entityData.js';
import {ENTITY_GRAPHS} from './entityGraphs.js';
import {SITE} from './routeMeta.js';
import {PCS_FAQS} from './pcsGuideData.js';
export function routeStructuredData(meta){
 const url=SITE+meta.slug;
 return {
  page:{'@context':'https://schema.org','@type':meta.page==='about'?'ProfilePage':'WebPage','@id':`${url}#webpage`,url,name:meta.title,description:meta.description,isPartOf:{'@id':`${SITE}/#website`},about:{'@id':IDENTITY.ids.team},inLanguage:'en-US',...(meta.page==='about'?{mainEntity:{'@id':IDENTITY.ids.person}}:{})},
  ...(meta.page!=='home'?{breadcrumb:{'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Home',item:SITE+'/'},{'@type':'ListItem',position:2,name:meta.crumb,item:url}]}}:{}),
  ...(meta.page==='pcs'?{faq:{'@context':'https://schema.org','@type':'FAQPage',mainEntity:PCS_FAQS.map(f=>({'@type':'Question',name:f.q,acceptedAnswer:{'@type':'Answer',text:f.a}}))}}:{}),
 };
}
export function syncRouteSchema(meta,doc=document){
 const graph=doc.querySelector('script[data-entity]');
 if(graph){const kind=meta.page==='home'?'home':'compact';graph.setAttribute('data-entity',`entity-graph:${kind}`);graph.textContent=JSON.stringify(ENTITY_GRAPHS[kind]);}
 doc.querySelectorAll('script[data-route-schema]').forEach(el=>el.remove());
 for(const [kind,data] of Object.entries(routeStructuredData(meta))){const el=doc.createElement('script');el.type='application/ld+json';el.setAttribute('data-route-schema',kind);el.textContent=JSON.stringify(data);doc.head.appendChild(el);}
}
