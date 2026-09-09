// Notify participating engines only after new/updated pages are deployed.
// node --env-file=.env.local scripts/submit-indexnow.mjs --site gc --urls https://greggcostin.com/blog/slug,https://greggcostin.com/blog
// --dry-run checks live URLs and prior receipts without submitting. Whole-site use requires explicit --sitemap.
// Receipt means received, not indexed. Protocol: https://www.indexnow.org/documentation
import {readFileSync,writeFileSync,mkdirSync,readdirSync,existsSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
import {canonicalUrls,inspectDeployed,priorState,SITES} from './indexnow-lib.mjs';
const args=process.argv.slice(2),arg=k=>args[args.indexOf(k)+1];
const siteKey=args.includes('--site')?arg('--site'):'pmh',site=SITES[siteKey];
if(!site)throw new Error('Unknown site; use gc or pmh.');
if(args.includes('--urls')===args.includes('--sitemap'))throw new Error('Choose explicit --urls URL1,URL2 or --sitemap. No implicit whole-site submission.');
if(args.includes('--urls')&&(!arg('--urls')||arg('--urls').startsWith('--')))throw new Error('Missing --urls list.');
const candidates=args.includes('--urls')?arg('--urls').split(',').map(x=>x.trim()).filter(Boolean):[...readFileSync(site.sitemap,'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
const urls=canonicalUrls(candidates,site.host);if(urls.length>10000)throw new Error('Split the changed URLs into batches of at most 10,000.');
const dryRun=args.includes('--dry-run'),dir='content/measure/submissions';mkdirSync(dir,{recursive:true});
const history=readdirSync(dir).filter(f=>f.endsWith('.json')).map(f=>JSON.parse(readFileSync(dir+'/'+f,'utf8')));
const record={id:randomUUID(),site:siteKey,startedAt:new Date().toISOString(),mode:dryRun?'dry_run':'submit',checks:[],engines:{}};
const path=`${dir}/${record.startedAt.replace(/[:.]/g,'-')}-${siteKey}-${record.id.slice(0,8)}.json`;const save=()=>writeFileSync(path,JSON.stringify(record,null,2)+'\n');
for(const url of urls){try{record.checks.push({...await inspectDeployed(url),status:'ready'});}catch(e){record.checks.push({url,status:'blocked',reason:e.message});}}
save();if(record.checks.some(x=>x.status==='blocked')){console.error('No URLs submitted: deployment preflight failed. See '+path);process.exitCode=1;}else{
 const keyLocation=`https://${site.host}/${site.key}.txt`;
 for(const engine of ['indexnow','bing']){
  const checks=record.checks.map(x=>({...x,priorState:priorState(history,x.url,x.fingerprint,engine)}));
  const pending=checks.filter(x=>x.priorState==='new_or_changed');
  record.engines[engine]={status:'planned',urls:pending.map(({url,fingerprint})=>({url,fingerprint})),skipped:checks.filter(x=>x.priorState!=='new_or_changed').map(({url,priorState})=>({url,reason:priorState}))};
  const entry=record.engines[engine];
  if(checks.some(x=>x.priorState==='needs_receipt_review')){entry.status='receipt_review_required';process.exitCode=1;save();continue;}
  if(!pending.length){entry.status='no_changes';save();continue;}
  if(engine==='bing'&&!process.env.BING_WEBMASTER_API_KEY){entry.status='not_configured';save();continue;}
  if(dryRun){entry.status='dry_run';save();continue;}
  if(engine==='indexnow'){
   try{const r=await fetch(keyLocation,{redirect:'manual',signal:AbortSignal.timeout(15000)});if(r.status!==200||(await r.text()).trim()!==site.key)throw new Error('Public ownership key is not deployed correctly.');}catch(e){entry.status='blocked';entry.reason=e.message;process.exitCode=1;save();continue;}
  }
  entry.status='submitting';save();
  try{
   const endpoint=engine==='indexnow'?'https://api.indexnow.org/IndexNow':`https://ssl.bing.com/webmaster/api.svc/json/SubmitUrlBatch?apikey=${encodeURIComponent(process.env.BING_WEBMASTER_API_KEY)}`;
   const list=pending.map(x=>x.url),body=engine==='indexnow'?{host:site.host,key:site.key,keyLocation,urlList:list}:{siteUrl:`https://${site.host}`,urlList:list};
   const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json; charset=utf-8'},body:JSON.stringify(body),signal:AbortSignal.timeout(30000)});entry.httpStatus=r.status;
   if(engine==='indexnow')entry.status=r.status===200?'accepted':r.status===202?'accepted_key_pending':'failed';
   else{const data=await r.json().catch(()=>null);entry.status=r.ok&&data?.d===null?'accepted':'failed';if(entry.status==='failed')entry.response=data;}
   if(!entry.status.startsWith('accepted'))process.exitCode=1;
  }catch{entry.status='unknown';entry.reason='No reliable receipt. Review the engine dashboard before retrying this content.';process.exitCode=1;}
  save();
 }
 console.log(JSON.stringify({record:path,mode:record.mode,engines:Object.fromEntries(Object.entries(record.engines).map(([k,v])=>[k,{status:v.status,urls:v.urls.length,skipped:v.skipped.length}]))},null,2));
}
