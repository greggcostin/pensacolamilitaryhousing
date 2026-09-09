import {validateCount} from './review-counts-lib.mjs';
export function assessReviewObservation(observation,snapshot,{now=Date.now(),confirmDecrease=false}={}){
  const reasons=[],counts={};
  for(const p of ['google','zillow']){
    const o=observation[p],previous=snapshot[p];
    if(!o||o.status!=='verified-public-browser'){reasons.push(p+': public profile not verified');continue;}
    if(o.url!==previous.url)reasons.push(p+': unexpected profile');
    if(!Number.isFinite(Date.parse(o.checkedAt))||Date.parse(o.checkedAt)>now||now-Date.parse(o.checkedAt)>86400000)reasons.push(p+': evidence older than 24 hours or future-dated');
    try{counts[p]=validateCount(o.count);}catch{reasons.push(p+': invalid count');continue;}
    if(o.rating!==5||o.fiveStarCount!==o.count)reasons.push(p+': review rating or five-star coverage needs editorial review');
    if(Math.abs(o.count-previous.count)>30)reasons.push(p+': unusually large change needs review');
    if(o.count<previous.count&&!confirmDecrease)reasons.push(p+': decrease requires a confirmed second public read');
    if(typeof o.evidence!=='string'||o.evidence.length<20)reasons.push(p+': missing source evidence');
  }
  return {ok:reasons.length===0,reasons,counts,changed:Object.keys(counts).some(p=>counts[p]!==snapshot[p].count)};
}
