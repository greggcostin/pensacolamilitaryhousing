// Image provenance is internal. Credit-free client editions must never silently
// omit attribution from an image whose license requires it.
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {images,brandLogos} from '../content/client-guides/art-direction.mjs';
export function clientGuideMedia(){
 const ledger=JSON.parse(readFileSync('content/blog/image-credits.json','utf8')).images;
 const photos=Object.fromEntries(Object.entries(images).map(([key,im])=>{
  const evidence=im.ledger?ledger[im.ledger]:im;
  if(!evidence)throw new Error(`Missing photo license evidence: ${key}`);
  if(evidence.creditRequired!==false||!/^(Public domain|CC0|Owner photography|Pexels License|Unsplash License)$/i.test(evidence.license))throw new Error(`Photo ${key} needs attribution or a verified replacement.`);
  if(!existsSync(im.path))throw new Error(`Missing photograph: ${im.path}`);
  const sha256=createHash('sha256').update(readFileSync(im.path)).digest('hex');
  if(evidence.sha256&&evidence.sha256!==sha256)throw new Error(`Photo changed since its license/visual review: ${key}`);
  const sourceUrl=evidence.pageUrl||evidence.url;
  const pexelsId=sourceUrl?.match(/pexels\.com\/photo\/[^/]*?-(\d+)\/?$/)?.[1];
  const sourceIdentity=im.subjectId||(pexelsId?'pexels-'+pexelsId:sourceUrl||sha256);
  return [key,{...im,sourceIdentity,credit:evidence.credit,license:evidence.license,creditRequired:false,url:sourceUrl,licenseUrl:evidence.licenseUrl,sha256,asset:`photo-${key}.jpg`}];
 }));
 const logos=Object.fromEntries(Object.entries(brandLogos).map(([key,logo])=>{
  if(!existsSync(logo.path))throw new Error(`Missing original brand logo: ${logo.path}`);
  return [key,{...logo,sha256:createHash('sha256').update(readFileSync(logo.path)).digest('hex')}];
 }));
 return {photos,logos};
}

export function validateGuideCovers(guides,photos,artFor){
 const hashes=new Set(),subjects=new Set();
 for(const g of guides){
  const key=artFor(g).cover,im=photos[key];
  if(!im?.coverOnly||!im.subjectId)throw new Error(`Unreviewed cover assignment: ${g.slug}`);
  if(im.theme!==(g.audience==='military'?'military':'coastal-home'))throw new Error(`Wrong cover subject for ${g.slug}`);
  if(g.audience==='military'&&!im.location)throw new Error(`Military cover lacks verified local context: ${g.slug}`);
  if(hashes.has(im.sha256)||subjects.has(im.subjectId))throw new Error(`Repeated cover photograph or property: ${g.slug}`);
  hashes.add(im.sha256);subjects.add(im.subjectId);
 }
 return {guides:guides.length,uniqueCovers:hashes.size,uniqueSubjects:subjects.size};
}
