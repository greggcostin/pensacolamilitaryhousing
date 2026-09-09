// Review dates are facts, never automatically advanced by this report.
import {writeFileSync} from 'node:fs';
import {sources} from '../content/client-guides/sources.mjs';
const today=new Date().toISOString().slice(0,10),queue=[];
for(const [id,s] of Object.entries(sources)){
 const annual=/BAH.*2026|2026.*BAH/i.test(s.name);
 const interval=s.reviewIntervalDays??90;
 const due=annual?'2027-01-01':new Date(Date.parse(s.reviewed)+interval*86400000).toISOString().slice(0,10);
 queue.push({id,name:s.name,url:s.url,lastReviewed:s.reviewed,reviewDue:due,reviewIntervalDays:annual?null:interval,sourceStatus:s.status??'published',status:due<=today?'review_due':'within_review_window'});
}
queue.sort((a,b)=>a.reviewDue.localeCompare(b.reviewDue));
const report={generated:today,note:'A review schedule is not verification. Reopen authoritative sources before changing a claim or review date. Review immediately when an official rule changes, regardless of due date.',queue};
writeFileSync('content/client-guides/source-review-queue.json',JSON.stringify(report,null,2)+'\n');console.log(`${queue.length} guide sources; ${queue.filter(s=>s.status==='review_due').length} scheduled reviews due. No source dates changed.`);
