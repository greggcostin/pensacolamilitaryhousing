// Policy for new/updated HTML pages, not deletion notifications.
import {createHash} from 'node:crypto';
export const SITES={pmh:{host:'pensacolamilitaryhousing.com',key:'a1a4a0be0196a455ad3c188805e7d969',sitemap:'public/sitemap.xml'},gc:{host:'greggcostin.com',key:'0b7ab9f744b3fe4bdf786411b9cd0866',sitemap:'civilian-site/sitemap.xml'}};
export function canonicalUrls(values,host){
 if(!values.length)throw new Error('Supply at least one changed URL.');
 return [...new Set(values.map(v=>{let u;try{u=new URL(v)}catch{throw new Error('Invalid URL in submission list.')}
  if(u.origin!==`https://${host}`||u.username||u.password||u.hash||u.search)throw new Error('Use clean HTTPS URLs on the exact selected site, without credentials, queries or fragments.');return u.href;
 }))];
}
const attrs=tag=>Object.fromEntries([...tag.matchAll(/([\w-]+)\s*=\s*["']([^"']*)["']/g)].map(m=>[m[1].toLowerCase(),m[2]]));
// Cloudflare rotates the XOR key in public email-protection attributes. Compare
// the decoded bytes so a new key is not mistaken for an editorial change.
export function contentFingerprint(html){
 const decoded=hex=>{if(hex.length<4||hex.length%2)return hex;const bytes=Buffer.from(hex,'hex'),key=bytes[0];return Buffer.from(bytes.subarray(1).map(byte=>byte^key)).toString('hex');};
 const stable=html.replace(/<script\b[\s\S]*?<\/script>/gi,'').replace(/<!--[\s\S]*?-->/g,'')
  // Ignore only the observed empty, hidden platform link, not normal content links.
  .replace(/<a\b(?=[^>]*href=["']https:\/\/(?:pensacolamilitaryhousing\.com|greggcostin\.com)\/cdn-cgi\/content\?id=[^"']*["'])(?=[^>]*aria-hidden=["']true["'])(?=[^>]*style=["'][^"']*display:\s*none\s*!important[^"']*["'])[^>]*>\s*<\/a>/gi,'')
  .replace(/data-cfemail=(["'])([0-9a-f]+)\1/gi,(_,q,hex)=>`data-cfemail=${q}${decoded(hex)}${q}`)
  .replace(/\/cdn-cgi\/l\/email-protection#([0-9a-f]+)/gi,(_,hex)=>'/cdn-cgi/l/email-protection#'+decoded(hex))
  .replace(/\s+/g,' ').trim();
 return createHash('sha256').update(stable).digest('hex');
}
export async function inspectDeployed(url,fetcher=fetch){
 const r=await fetcher(url,{redirect:'manual',signal:AbortSignal.timeout(20000),headers:{'User-Agent':'Costin-Publication-Check/1.0'}});
 if(r.status!==200)throw new Error(`Expected live HTTP 200; received ${r.status}.`);
 if(!/text\/html/i.test(r.headers.get('content-type')||''))throw new Error('Expected a deployed HTML page.');
 if(/\b(noindex|none)\b/i.test(r.headers.get('x-robots-tag')||''))throw new Error('X-Robots-Tag blocks indexing.');
 const html=await r.text();const canon=[...html.matchAll(/<link\b[^>]*>/gi)].map(m=>attrs(m[0])).find(a=>a.rel?.toLowerCase()==='canonical')?.href;
 if(canon!==url)throw new Error('Missing or mismatched live canonical.');
 const excluded=[...html.matchAll(/<meta\b[^>]*>/gi)].map(m=>attrs(m[0])).some(a=>/^(robots|googlebot|bingbot)$/i.test(a.name||'')&&/\b(noindex|none)\b/i.test(a.content||''));
 if(excluded)throw new Error('Live robots meta blocks indexing.');
 const main=html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1]||html.match(/<div\b(?=[^>]*data-pagefind-body)[^>]*>([\s\S]*?)<\/div>/i)?.[1];if(!main||main.replace(/<[^>]+>/g,' ').trim().length<100)throw new Error('Missing substantive HTML main content or prerendered search body.');
 return {url,httpStatus:r.status,canonical:canon,fingerprint:contentFingerprint(html),fingerprintVersion:2};
}
export function priorState(history,url,fingerprint,engine){
 const matches=history.flatMap(run=>(run.engines?.[engine]?.urls||[]).filter(x=>x.url===url&&x.fingerprint===fingerprint).map(x=>({...x,status:run.engines[engine].status,at:run.startedAt}))).sort((a,b)=>String(b.at).localeCompare(String(a.at)));
 const state=matches[0]?.status;return ['accepted','accepted_key_pending'].includes(state)?'already_received':['submitting','unknown'].includes(state)?'needs_receipt_review':'new_or_changed';
}
