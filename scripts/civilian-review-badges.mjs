import {readFileSync,writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
export function withReviewPlatformLabels(html){
 return html.replace(/(<a\b[^>]*class="gc-review-profile"[^>]*data-review-platform="(google|zillow)"[^>]*>)([\s\S]*?)(<\/a>)/g,(whole,open,platform,body,close)=>{
  if(body.includes('class="gc-review-platform-label"'))return whole;
  const label=platform==='google'?'Google Reviews':'Zillow Reviews';
  return open+`\n<strong class="gc-review-platform-label">${label}</strong>`+body+close;
 });
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const i=process.argv.indexOf('--root');if(i<0)throw Error('Provide --root with the complete civilian candidate');
 const file=join(resolve(process.argv[i+1]),'reviews.html'),old=readFileSync(file,'utf8'),html=withReviewPlatformLabels(old);
 if(html!==old)writeFileSync(file,html);
 console.log(JSON.stringify({file,changed:html!==old,labels:(html.match(/class="gc-review-platform-label"/g)||[]).length}));
}
