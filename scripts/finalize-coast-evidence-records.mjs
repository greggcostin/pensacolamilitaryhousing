// Reconcile documentation with saved results, preserving earlier release records.
import {readFileSync,writeFileSync} from 'node:fs';
const root='docs/seo-geo-2026-09-06', measurement=`${root}/projects/08-measurement/2026-09-08`;
const read=path=>JSON.parse(readFileSync(path,'utf8'));
const a=read(`${measurement}/ai-summary.json`);
function note(file,key,body){
 let text=readFileSync(file,'utf8'),start=`<!-- ${key}_START -->`,end=`<!-- ${key}_END -->`;
 if(text.includes(start))text=text.slice(0,text.indexOf(start))+text.slice(text.indexOf(end)+end.length).replace(/^\s+/,'');
 writeFileSync(file,`${start}\n${body.trim()}\n${end}\n\n${text}`);
}
note(`${root}/PROJECTS.md`,'SEPT8_FIVE_STEP_CONTINUATION',`
## Current five-step continuation

The ownership/claims release and its AI-citation follow-up are published: **21 distinct pages**, receipt-based browser conversions and distinct Navarre guides. The last verified complete baseline is .coast-release/2026-09-08-ai-cited-claims, matching 4,083 assets. The 26-ZIP study keeps its existing URL and now shares the ownership model, with actual data dates/geography and explicitly illustrative costs. All 23 PDF editions have scoped review records; the ten civilian editions add 20 arithmetic checks.

Authenticated indexing inspections are complete for 20 priority URLs per domain. Latest recorded Google results are 19/20 military and 1/20 civilian indexed; request receipts are not indexed verdicts. The AI benchmark has ${a.responses}/${a.target} saved responses with no semantic reviews pending. Its ${a.unrun} missing runs remain unmeasured after the authenticated Chrome session became unavailable. Real referral and accepted-inquiry/qualified-consultation joins remain unverified; no real test lead or unsolicited email was sent.

[Current release record](RELEASE.md), [indexing/benchmark/outcome evidence](projects/08-measurement/2026-09-08/README.md), [PDF review](projects/03-accuracy/zip-and-claims/pdf-review/edition-review.json). The older release narrative below is retained as history; the progress JSON and implementation register contain the current next actions.
`);
note(`${root}/projects/03-accuracy/README.md`,'SEPT8_ACCURACY_CONTINUATION',`
Current continuation: the [ownership/claims release](zip-and-claims/README.md) and [three actual AI-cited pages](ai-cited-claims/README.md) supersede the initial release below. Twenty-one distinct pages received substantive revisions. The 23-edition PDF record now includes targeted financial review of all ten civilian editions, 20 recalculated examples and exact source/edition limits. [PDF scope](zip-and-claims/pdf-review/edition-review.json).
`);
note(`${root}/projects/03-accuracy/financial/README.md`,'SEPT8_FINANCIAL_CONTINUATION',`
September 8 continuation: the six core/financial guides described below remain a scoped earlier release. The [26-ZIP study and remaining financial claims](../zip-and-claims/README.md), [three AI-cited legacy pages](../ai-cited-claims/README.md), and [23-edition PDF register](../zip-and-claims/pdf-review/edition-review.json) extend coverage. No check implies certification of every financial assertion on both sites. Actual property quotes, leases, route observations and unrelated historical claims remain open.
`);
note(`${root}/projects/02-inquiries/README.md`,'SEPT8_BROWSER_CONTINUATION',`
September 8 continuation: accepted-receipt browser success and conversion handling is now [published across both websites](../03-accuracy/zip-and-claims/README.md), with four unit checks and 24 isolated browser checks. This completes the browser implementation portion of item 2 below. One authentic accepted receipt joined to CRM and notification remains unverified; historical source/stage records and retained validation events do not satisfy that requirement. [Current readback and limits](../08-measurement/2026-09-08/README.md). No real test lead or unsolicited email was sent.
`);
note(`${root}/CONTENT-AND-DISTRIBUTION.md`,'SEPT8_CONTENT_CONTINUATION',`
September 8 execution update: the distinct Navarre guides now extend the Perdido pilot, with official county utility evidence, applicable lease/document checks, a reproducible route method and separate task-completion/export events. The [published work and sources](projects/03-accuracy/zip-and-claims/README.md) record which examples are calculated and which property observations remain absent.

The [fixed AI benchmark](projects/08-measurement/2026-09-08/README.md) has ${a.responses}/${a.target} saved responses: ${a.military.recommended}/${a.military.completed} completed military recommendation queries include Gregg, while ${a.civilian.recommended}/${a.civilian.completed} completed civilian city queries do. These are uneven, partial repeat counts, not a market-share or ranking estimate. ${a.ownedCitationAnswers} saved answers visibly cite an owned page. Actual referrals, accepted inquiries and qualified consultations remain unmeasured. The authenticated browser became unavailable; ${a.unrun} exact remaining runs are queued in the [resume record](projects/08-measurement/2026-09-08/ai-resume-queue.json).

Prioritize documented eastern-market and Alabama experience and distinct property decisions in future regional releases. Collect real parcel tax/assessment records, current insurance quotations, association or lease statements and timestamped route observations before publishing those quantities as observed. A source-linked county tariff supports a calculation; it does not become a household bill. The distribution briefs below remain drafts; no outreach, social post or unsolicited message was sent by this workstream.
`);
const historical=read(`${measurement}/authentic-inquiry-readback.json`);
historical.followup={recordedAt:new Date().toISOString(),evidence:['authentic-inquiry-worker-logs.json','authentic-inquiry-worker-ui.json'],status:'no_authentic_accepted_receipt_join_established',scope:'Telemetry API returned 403; authenticated dashboard showed retained GET and earlier validation events. These do not prove absence of genuine inquiries. Receipt, CRM, notification and browser joins remain null.'};
writeFileSync(`${measurement}/authentic-inquiry-readback.json`,JSON.stringify(historical,null,2)+'\n');
note(`${root}/COORDINATION.md`,'SEPT8_CLOSEOUT',`
Updated from the evidence closeout at ${new Date().toISOString()}. The release inventory below remains the last verified production baseline for this task; later civilian releases must record their own successor IDs and inventory comparison.

The requested cached Wrangler CLI path is C:/Users/gregg/AppData/Local/npm-cache/_npx/d77349f55c2be1c0/node_modules/wrangler/bin/wrangler.js. The deployment wrapper is scripts/publish-evidence-refinement.mjs; it accepts --evidence-dir, checks the candidate and skips a domain without changes. Read its contract before reusing it for a different candidate.

The PDF extension is complete for its specified financial/process scope. The benchmark has ${a.responses} saved and reviewed responses; ${a.unrun} runs remain unrun after the original Chrome session disappeared following an internet-disconnection error. Current measurement files, the resume queue, implementation register and release record have been reconciled. No further civilian deployment or review-count/Meta change was made by this task. The parallel civilian growth candidate and review-count/Meta work described in the coordination message remain owned by that task.
`);
console.log('Reconciled continuation notes, inquiry evidence and shared coordination.');
