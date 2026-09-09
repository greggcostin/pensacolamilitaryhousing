import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {json,save} from './isolated-release-lib.mjs';
import {syncReviewText,reviewCheckDate} from './review-counts-lib.mjs';

const at=process.argv.indexOf('--directory');
if(at<0)throw Error('Provide --directory');
const dir=process.argv[at+1],candidate=json(join(dir,'candidate.json'));
const checks=[];
const digest=text=>createHash('sha256').update(text.replaceAll('\r\n','\n').trim()).digest('hex');
const decodeEmail=hex=>{const key=parseInt(hex.slice(0,2),16);return Buffer.from(hex.slice(2).match(/../g).map(pair=>parseInt(pair,16)^key)).toString('utf8');};
// Cloudflare rewrites public mailto links and adds its email decoder at the edge.
// Reverse only those observed transformations; unrelated response differences still fail.
const withoutEdgeEmailProtection=html=>html
  .replace(/href="\/cdn-cgi\/l\/email-protection#([0-9a-f]+)"/gi,(_,hex)=>`href="mailto:${decodeEmail(hex)}"`)
  .replace(/<span class="__cf_email__" data-cfemail="([0-9a-f]+)">\[email&#160;protected\]<\/span>/gi,(_,hex)=>decodeEmail(hex))
  .replace(/<script data-cfasync="false" src="\/cdn-cgi\/scripts\/[0-9a-f]+\/cloudflare-static\/email-decode\.min\.js"><\/script>/gi,'')
  .replace(/<a href="https:\/\/pensacolamilitaryhousing\.com\/cdn-cgi\/content\?id=[^"]+" aria-hidden="true" rel="nofollow noopener" style="display: none !important; visibility: hidden !important"><\/a>/g,'')
  .replace(/<script>[\s\S]*?<\/script>/g,script=>script.startsWith('<script>(function(){function c(){var b=a.contentDocument')&&script.includes('window.__CF$cv$params=')&&script.includes('/cdn-cgi/challenge-platform/scripts/jsd/main.js')?'':script);
for(const site of candidate.production){
  for(const path of ['/', '/reviews']){
    const url=`https://${site.domain}${path}`;
    const response=await fetch(url,{headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(30000)});
    const body=await response.text();
    writeFileSync(join(dir,`${site.site}-${path==='/'?'home':'reviews'}-public.html`),body);
    const local=readFileSync(join(candidate.candidate,site.site,path==='/'?'index.html':'reviews.html'),'utf8');
    const visible=body.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ');
    const phrases=[...visible.matchAll(/\b\d+ (?:five-star )?(?:Google|Zillow|five-star reviews across Google and Zillow)[^<]{0,35}/gi)].map(x=>x[0]).slice(0,12);
    const markers=[...body.matchAll(/data-review-count="(google|zillow|combined)"[^>]*>(\d+)</g)].map(x=>({platform:x[1],count:Number(x[2])}));
    const countsCorrect=syncReviewText(body,candidate.counts,reviewCheckDate(candidate.observation))===body;
    const profilesPresent=path!=='/reviews'||new RegExp(candidate.counts.google+' (?:five-star )?Google reviews','i').test(visible)&&new RegExp(candidate.counts.zillow+' Zillow (?:team )?reviews','i').test(visible);
    const rawMatchesCandidate=digest(body)===digest(local);
    const matchesCandidate=digest(withoutEdgeEmailProtection(body))===digest(local);
    checks.push({site:site.site,url,status:response.status,finalUrl:response.url,rawMatchesCandidate,edgeTransformation:rawMatchesCandidate?null:site.site==='pmh'?'Cloudflare email protection and challenge-platform additions':'Cloudflare email protection',matchesCandidate,countsCorrect,profilesPresent,phrases,markers,ok:response.ok&&matchesCandidate&&countsCorrect&&profilesPresent});
  }
}
const result={checkedAt:new Date().toISOString(),ok:checks.every(c=>c.ok),counts:candidate.counts,combined:candidate.counts.google+candidate.counts.zillow,checks};
save(join(dir,'public-readback.json'),result);
console.log(JSON.stringify(result,null,2));
if(!result.ok)process.exitCode=1;
