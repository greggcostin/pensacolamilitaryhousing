// Keep licensing information public while leaving editorial captions in place.
import {readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync} from 'node:fs';
import {join, relative, dirname} from 'node:path';

export const domains = {gc:'greggcostin.com',pmh:'pensacolamilitaryhousing.com'};
export const esc = value => String(value ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export const plain = html => html.replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/&middot;|&#183;/g,'·').replace(/\s+/g,' ').trim();
export const walk = root => readdirSync(root,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(root,e.name)):[join(root,e.name)]);
export const photoId = path => 'photo-'+path.replace(/^\/images\//,'').replace(/\.[^.]+$/,'').replaceAll('/','-');
export const baseImage = path => path.replace(/[?#].*$/,'').replace(/-(480|768|1200)(?=\.[^.]+$)/,'').replace(/\.(?:avif|webp|jpeg|png)$/i,'.jpg');
export function licenseUrl(label='') {
  const m=label.match(/CC[ -](BY-SA|BY)[ -]([\d.]+)/i);
  if(m)return `https://creativecommons.org/licenses/${m[1].toLowerCase()}/${m[2].replace(/\.$/,'')}/`;
  if(label==='CC0')return 'https://creativecommons.org/publicdomain/zero/1.0/';
  if(label==='Unsplash License')return 'https://unsplash.com/license';
  if(label==='Pexels License')return 'https://www.pexels.com/license/';
  return '';
}
export function imageRefs(html,site) {
  return [...html.matchAll(/(?:https?:\/\/(?:www\.)?(?:greggcostin\.com|pensacolamilitaryhousing\.com))?\/images\/[^\s"'<>(),?]+\.(?:jpg|jpeg|png|webp|avif)/gi)].map(m=>{
    const u=new URL(m[0],`https://${domains[site]}`);
    return {site:u.hostname.replace('www.','')===domains.gc?'gc':'pmh',path:u.pathname,url:u.href};
  });
}
export function splitCaption(body) {
  const marker=/\b(?:Photo(?:graph)?s?|Image)\s*(?:credit(?:s)?)?\s*:/i.exec(body);
  if(!marker)return {caption:body,credit:''};
  let caption=body.slice(0,marker.index).trim();
  const credit=body.slice(marker.index).trim();
  // These notes describe the photograph, not its license, and remain with it.
  const archival=plain(credit).match(/\bArchival photograph\.?$/i);
  if(archival)caption+=(caption?' ':'')+'Archival photograph.';
  return {caption,credit};
}
export function creditFragments(html) {
  const result=[];
  for(const m of html.matchAll(/<figure\b[^>]*>[\s\S]*?<\/figure>/gi)) {
    const caption=/<figcaption\b[^>]*>([\s\S]*?)<\/figcaption>/i.exec(m[0]);
    if(!caption)continue;
    const {credit}=splitCaption(caption[1]);
    if(!credit)continue;
    const image=/<img\b[^>]*src="([^"]+)"[^>]*>/i.exec(m[0]);
    result.push({image:image?.[1],alt:plain(/\balt="([^"]*)"/.exec(image?.[0]||'')?.[1]||''),credit,caption:caption[1]});
  }
  return result;
}
export function cleanPhotoCredits(input,{footer=true,ids=[]}={}) {
  const protectedBlocks=[];
  let html=input.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi,m=>`<!--PHOTO-PROTECTED-${protectedBlocks.push(m)-1}-->`);
  const changes=[];
  html=html.replace(/<(div|p|small)\b[^>]*class="[^"]*\b(?:nb-credit|gc-hero-credit|gc-region-credits|gc-photo-credits|gc-interior-credit)\b[^"]*"[^>]*>([\s\S]*?)<\/\1>/gi,(all,tag,body)=>{
    if(/<\/?(?:div|p|figure|section)\b/i.test(body))throw Error('Photo-credit block unexpectedly contains layout content');
    changes.push({kind:'credit-block',credit:body,kept:''});return '';
  });
  html=html.replace(/<figcaption\b([^>]*)>([\s\S]*?)<\/figcaption>/gi,(all,attrs,body)=>{
    const {caption,credit}=splitCaption(body);
    if(!credit)return all;
    changes.push({kind:'caption',credit,kept:caption});
    return caption?`<figcaption${attrs}>${caption}</figcaption>`:'';
  });
  html=html.replace(/<(p|div|small)\b([^>]*)>([^]*?)<\/\1>/gi,(all,tag,attrs,body)=>{
    if(/<\/?(?:div|p|figure|section)\b/i.test(body))return all;
    if(/data-photo-credits=/.test(attrs)||/\b(?:gc-hero-credit|gc-region-credits|gc-photo-credits|gc-interior-credit)\b/.test(attrs)||/^City photos:/i.test(plain(body))) {
      changes.push({kind:'credit-block',credit:body,kept:''});return '';
    }
    return all;
  });
  html=html.replace(/<p\b[^>]*class="[^"]*gc-photo-credit-link[^"]*"[^>]*>[\s\S]*?<\/p>\s*/g,'');
  if(footer){
    const link=`<p class="gc-photo-credit-link" data-pagefind-ignore style="font-size:12px;line-height:1.6;text-align:center;margin:18px auto 0"><a href="/photo-credits" data-photography-credits data-photo-credits-page="${esc(ids.join(' '))}" style="color:inherit;text-decoration:underline;text-underline-offset:3px">Photography credits</a></p>`;
    if(/<\/footer>/i.test(html))html=html.replace(/<\/footer>/i,link+'\n</footer>');
    else if(html.includes('id="root"')) {
      // The prerendered SPA shell has no footer; this remains useful without JS.
      html=html.replace('</body>',`<footer data-photo-fallback style="background:#0A0F1A;color:#C3C8D1;padding:0 20px 24px">${link}</footer>\n</body>`);
    }else throw Error('No footer found for photography link');
  }
  html=html.replace(/<!--PHOTO-PROTECTED-(\d+)-->/g,(_,i)=>protectedBlocks[Number(i)]);
  return {html,changes};
}

export function collectCredits(root,site,ledger,{extraFiles=[]}={}) {
  const entries=new Map(),usage=new Map(),fragments=[],unmatched=[];
  const add=(ref,page)=>{const key=ref.site+baseImage(ref.path);if(!usage.has(key))usage.set(key,new Set());usage.get(key).add(page);};
  const files=[...walk(root).filter(f=>/\.(html|css|js)$/.test(f)&&!/[\\/]pagefind[\\/]/.test(f)&&!f.endsWith('photo-credits.html')),...extraFiles];
  for(const file of new Set(files)) {
    const html=readFileSync(file,'utf8'),page=relative(root,file).replaceAll('\\','/');
    for(const ref of imageRefs(html,site))add(ref,page);
    if(file.endsWith('.html'))for(const frag of creditFragments(html))fragments.push({...frag,page});
  }
  // Retain credits migrated from legacy captions when regenerating clean pages.
  const previous=join(root,'data/photography-credits.json');
  const supplements=['content/photography/legacy-credits.json',previous];
  for(const supplement of supplements)if(existsSync(supplement))for(const entry of JSON.parse(readFileSync(supplement,'utf8')).entries){
    const key=entry.sourceSite+baseImage(entry.path);
    if(usage.has(key))entries.set(key,{...entry,uses:[...usage.get(key)].sort()});
  }
  for(const [key,e] of Object.entries(ledger)){
    const sourceSite=key.startsWith('civilian-site/')?'gc':'pmh';
    const path=key.replace(/^(?:civilian-site|public)/,'');
    const refs=usage.get(sourceSite+baseImage(path));if(!refs)continue;
    entries.set(sourceSite+baseImage(path),{id:photoId(path),image:`https://${domains[sourceSite]}${path}`,path,sourceSite,title:e.title||path.split('/').pop(),credit:e.credit||e.artist||e.source,license:e.license,licenseUrl:licenseUrl(e.license),sourceUrl:e.pageUrl||'',creditRequired:!!e.creditRequired,uses:[...refs].sort(),provenanceNote:e.provenanceNote||''});
  }
  for(const f of fragments){
    if(!f.image){unmatched.push(f);continue;}
    const ref=imageRefs(f.image,site)[0];if(!ref){unmatched.push(f);continue;}
    const key=ref.site+baseImage(ref.path);
    if(entries.has(key))continue;
    const text=plain(f.credit),label=text.match(/CC[ -]BY(?:-SA)? [\d.]+|CC0|public domain|Pexels|Unsplash/i)?.[0]?.replace(/\.$/,'')||'';
    const license=/^Pexels$/i.test(label)?'Pexels License':/^Unsplash$/i.test(label)?'Unsplash License':label;
    const sourceUrl=/href="([^"]+)"/.exec(f.credit)?.[1]?.replaceAll('&amp;','&')||'';
    entries.set(key,{id:photoId(ref.path),image:ref.url,path:ref.path,sourceSite:ref.site,title:f.alt||ref.path.split('/').pop(),credit:text.replace(/^Photo:\s*/i,''),suppliedCreditHtml:f.credit,license,licenseUrl:licenseUrl(license),sourceUrl,creditRequired:/CC[ -]BY/i.test(license),uses:[...usage.get(key)||[]].sort()});
  }
  const ids=new Set();for(const e of entries.values()){if(ids.has(e.id))e.id=e.id+'-'+e.sourceSite;ids.add(e.id);}
  return {site,domain:domains[site],entries:[...entries.values()].sort((a,b)=>a.title.localeCompare(b.title)),unmatched,fragments};
}
export function renderCredits(catalog){
  return `<p>Our photography brings together Gulf Coast places, military life and portraits from The Costin Team. The credits below identify the photographs used across ${esc(catalog.domain)}, including background images, area guides and articles. Each entry links to the website image so you can match the photograph to its credit.</p>
<p>Source links lead to the original descriptions and available licensing details. Photographs may be resized, compressed, cropped or displayed with color overlays to suit the page layout. Some photographs are archival or illustrative and do not show a current property listing. Photo credits do not imply endorsement by a photographer or source organization.</p>
<ul class="gc-credit-list" style="list-style:none;padding:0">${catalog.entries.map(e=>`<li id="${esc(e.id)}" data-image-credit="${esc(e.path)}" class="gc-credit-item" style="padding:24px 0;border-bottom:1px solid var(--hair,rgba(201,168,76,.3));overflow-wrap:anywhere;scroll-margin-top:160px"><h2>${esc(e.title)}</h2><p>${e.suppliedCreditHtml||`Photo: ${esc(e.credit)}. ${esc(e.license)}.`}</p><p><a href="${esc(e.image)}">View the website image</a>${e.sourceUrl?` &middot; <a href="${esc(e.sourceUrl)}" target="_blank" rel="noopener">Original source</a>`:''}${e.licenseUrl?` &middot; <a href="${esc(e.licenseUrl)}" target="_blank" rel="noopener">${esc(e.license)}</a>`:''}</p></li>`).join('\n')}</ul>
<p>For questions about a photograph or its attribution, <a href="/contact">contact The Costin Team</a>. Explore our <a href="/">homepage</a> or our ${catalog.site==='gc'?'<a href="https://pensacolamilitaryhousing.com/photo-credits">military website photography credits</a>':'<a href="https://greggcostin.com/photo-credits">civilian website photography credits</a>'}.</p>`;
}
export function saveCatalog(root,catalog){mkdirSync(join(root,'data'),{recursive:true});const {fragments,unmatched,...data}=catalog;writeFileSync(join(root,'data/photography-credits.json'),JSON.stringify(data,null,2)+'\n');}

export function hasLinkedPhotoCredit(html,root,imagePath){
  if(!/<footer\b[\s\S]*?href="\/photo-credits"[\s\S]*?<\/footer>/.test(html))return false;
  const manifest=join(root,'data/photography-credits.json'),page=join(root,'photo-credits.html');
  if(!existsSync(manifest)||!existsSync(page))return false;
  const entries=JSON.parse(readFileSync(manifest,'utf8')).entries;
  const entry=entries.find(e=>baseImage(e.path)===baseImage(imagePath));
  if(!entry)return false;
  const credits=readFileSync(page,'utf8');
  return credits.includes(`id="${entry.id}"`)&&credits.includes(esc(entry.image))&&
    (!entry.license||credits.includes(esc(entry.license)))&&
    (!entry.sourceUrl||credits.includes(esc(entry.sourceUrl)))&&
    (!entry.licenseUrl||credits.includes(esc(entry.licenseUrl)));
}

export function photographyFindings(root){
  if(!existsSync(join(root,'data/photography-credits.json')))return [];
  const findings=[];
  for(const file of walk(root).filter(f=>f.endsWith('.html'))){
    const name=relative(root,file),html=readFileSync(file,'utf8');
    if(!/<footer\b[\s\S]*?href="\/photo-credits"[\s\S]*?<\/footer>/.test(html))findings.push(name+': missing visible photography footer link');
    if(name==='photo-credits.html')continue;
    const text=plain(html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi,''));
    if(/\bPhoto(?:graph)?s?\s*(?:credits?)?\s*:|\bCity photos:|\bCC[ -]BY(?:-SA)?\b/i.test(text))findings.push(name+': photo credits returned to page content; run build-photography-credits');
  }
  const catalog=JSON.parse(readFileSync(join(root,'data/photography-credits.json'),'utf8'));
  const sample=readFileSync(join(root,'photo-credits.html'),'utf8');
  for(const e of catalog.entries)if(!hasLinkedPhotoCredit(sample,root,e.path))findings.push('photo-credits.html: incomplete attribution for '+e.path);
  return findings;
}
