// Refresh previously generated identity nodes without replacing page-specific schema or copy.
import {IDS,PMH,GC,personFull,teamFull,brokerageFull,personCompact,teamCompact,brokerageCompact,publisherRef,SERVICES,serviceNode} from './entity-lib.mjs';
const retired={
 [`${PMH}/#person-gregg`]:IDS.person,[`${PMH}/#agent`]:IDS.team,
 [`${PMH}/#localbusiness`]:IDS.team,[`${PMH}/#brokerage`]:IDS.brokerage,
};
export function refreshEntityHtml(html,{site='pmh',builders={personFull,teamFull,brokerageFull,personCompact,teamCompact,brokerageCompact,publisherRef}}={}) {
 const full={[IDS.person]:builders.personFull,[IDS.team]:builders.teamFull,[IDS.brokerage]:builders.brokerageFull};
 const compact={[IDS.person]:builders.personCompact,[IDS.team]:builders.teamCompact,[IDS.brokerage]:builders.brokerageCompact};
 const services=new Map(SERVICES[site].map(s=>{const n=serviceNode(site,s);return [n['@id'],n];}));
 return html.replace(/(<script\b[^>]*type=["']application\/ld\+json["'][^>]*>)([\s\S]*?)(<\/script>)/gi,(whole,open,body,close)=>{
  let data;try{data=JSON.parse(body);}catch{throw Error('Invalid JSON-LD; refusing to overwrite the page.');}
  const home=/data-entity=["']entity-graph:home["']/.test(open);
  const profile=/data-entity=["']entity-graph:person["']/.test(open);
  const markedCompact=/data-entity=["']entity-graph:compact["']/.test(open);
  function rewrite(node,key=''){
   if(Array.isArray(node))return node.map(n=>rewrite(n,key));
   if(!node||typeof node!=='object')return node;
   const id=retired[node['@id']]||node['@id'];
   if(full[id]){
    if(Object.keys(node).length===1)return {'@id':id};
    let replacement=key==='publisher'&&id===IDS.team?builders.publisherRef():
      home||profile&&id===IDS.person?full[id]():compact[id]();
    return node['@context']?{'@context':node['@context'],...replacement}:replacement;
   }
   if(home&&services.has(id))return services.get(id);
   return Object.fromEntries(Object.entries(node).map(([k,v])=>[k,rewrite(v,k)]));
  }
  const next=markedCompact?{'@context':'https://schema.org','@graph':[builders.personCompact(),builders.teamCompact(),builders.brokerageCompact()]}:rewrite(data);
  return JSON.stringify(next)===JSON.stringify(data)?whole:open+JSON.stringify(next)+close;
 });
}
