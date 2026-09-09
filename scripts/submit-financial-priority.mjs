// Retry only the highest-priority financial URLs within the observed Bing quota.
import {readFileSync,writeFileSync} from 'node:fs';import {spawnSync} from 'node:child_process';
import {FINANCIAL_GUIDES} from '../content/geo/financial-guide-data.mjs';import {COMMUNITY_BUDGETS} from './community-finance-lib.mjs';import {COAST} from './geo-core-lib.mjs';
const dir='docs/seo-geo-2026-09-06/projects/03-accuracy/financial',quota=JSON.parse(readFileSync(dir+'/bing-quota.json','utf8'));
if(!JSON.parse(readFileSync(dir+'/live-verification.json','utf8')).ok)throw Error('Verified live release required');
const slugs=[...Object.keys(FINANCIAL_GUIDES),'va-loan-guide','bah-to-mortgage-guide',...Object.keys(COMMUNITY_BUDGETS).map(s=>'communities/'+s),...COAST.bases.map(b=>'bases/'+b.slug)];
const available=quota.quotas.find(q=>q.site==='https://pensacolamilitaryhousing.com')?.result?.d?.DailyQuota;
if(!(slugs.length<=available))throw Error('Priority list exceeds observed daily quota');
if(Date.now()-Date.parse(quota.checkedAt)>10*60*1000)throw Error('Refresh quota before attempting submission');
const urls=slugs.map(s=>'https://pensacolamilitaryhousing.com/'+s),r=spawnSync(process.execPath,['scripts/submit-indexnow.mjs','--site','pmh','--urls',urls.join(',')],{encoding:'utf8',env:process.env});
const record={checkedAt:new Date().toISOString(),reason:'The whole changed-page batch returned Bing HTTP 400; observed daily quota was 39. Retry only 32 priority URLs. Existing IndexNow receipts prevent duplicate submission.',urls,exitCode:r.status,output:r.stdout.trim(),error:r.stderr.trim()};
writeFileSync(dir+'/indexing-priority-receipts.json',JSON.stringify(record,null,2)+'\n');console.log(r.stdout.trim());if(r.status!==0)process.exitCode=1;
