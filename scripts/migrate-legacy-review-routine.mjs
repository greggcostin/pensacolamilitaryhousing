// Replace the old weekly publisher with a read-only health check for the new owner-authorized heartbeat.
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {save,json} from './isolated-release-lib.mjs';
const file='C:/Users/gregg/.claude/scheduled-tasks/review-count-sync/SKILL.md',dir='docs/growth-execution-2026-09-08/reviews';
const original=readFileSync(file,'utf8'),backup=dir+'/legacy-weekly-before.md',staged=dir+'/legacy-weekly-after.md';
const next=`---
name: review-count-sync
description: Weekly health check of the shared six-hour Google and Zillow review updater. Read-only; does not publish.
---

Gregg authorized the new two-site review update workflow on September 8, 2026. The active Codex heartbeat is verify-and-sync-costin-review-counts. The old independent weekly publisher has been replaced so two schedulers cannot write the website at the same time.

Read C:/Users/gregg/pensacolamilitaryhousing/content/reviews/automation.json and its linked runbook. Read the newest result.json and public readback under the configured lastRunDirectory, if present. Inspect the configured Codex automation status read-only. Report a new inactive scheduler, unresolved deployment, or repeated fresh-source failure to Gregg; remain quiet if unchanged or already reported.

Do not change counts, stage, commit, push or deploy website files in this weekly routine. Do not launch another updater or schedule, access Gmail, reply to reviews or send client messages. The six-hour heartbeat owns source verification, isolated publication and both-site readback. Preserve the existing counts on unavailable data.

No legacy claim or publication workflow is required: this replacement is a bounded read-only health check. Save its result as a separate dated health-check artifact in docs/review-monitor without modifying the shared snapshot or heartbeat run result.
`;
if(!existsSync(backup))writeFileSync(backup,original);
writeFileSync(staged,next);
if(process.argv.includes('--apply')){
 const config=json('content/reviews/automation.json');if(config.automationId!=='verify-and-sync-costin-review-counts')throw Error('New heartbeat not registered');
 const baseline=readFileSync(backup,'utf8');if(original!==baseline&&original!==next)throw Error('Legacy routine changed since staging; review again');
 writeFileSync(file,next);if(readFileSync(file,'utf8')!==next)throw Error('Migration readback failed');
 config.legacyWeeklyMode='read-only-health-check';save('content/reviews/automation.json',config);
 save(dir+'/legacy-migration.json',{completedAt:new Date().toISOString(),file,backup,afterSha256:createHash('sha256').update(next).digest('hex'),verified:true});
}
console.log(JSON.stringify({file,backup,staged,applied:process.argv.includes('--apply')}));
