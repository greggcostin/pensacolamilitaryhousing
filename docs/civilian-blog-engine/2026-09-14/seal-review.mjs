// Final editorial passes (facts, calculations, scope, sources, counterarguments, voice) were performed on the exact draft; this seals the hashes.
import {readFileSync,writeFileSync} from 'node:fs';
import {contentHash,evidenceHash,validateEditorial} from './source/scripts/civilian-editorial-lib.mjs';
const root=new URL('./source/',import.meta.url),slug='what-moves-mortgage-rates',date='2026-09-14';
const f=new URL('content/civilian-blog/'+slug+'.fragment.html',root),rp=new URL('content/civilian-blog/research/'+slug+'.json',root);
const text=readFileSync(f,'utf8'),m=text.match(/<!--PAGE\s+([\s\S]*?)\s+PAGE-->/),spec=JSON.parse(m[1]);let body=text.slice(m[0].length).trim().replace(/\r\n/g,'\n');
const research=JSON.parse(readFileSync(rp,'utf8'));
// Review-pass corrections found on the read-aloud and fact passes.
body=body.replace('6.76% for the week ending September 10, 2026, per Freddie Mac','6.76% as of the September 10, 2026 weekly release, per Freddie Mac');
body=body.replace('which is why a mortgage quote can move ahead of an announcement and barely react afterward.','which is why a mortgage quote can move ahead of an announcement and may not move much after it.');
body=body.replace('With a Fed meeting on the calendar this week, the useful preparation is small:','With the September 15 and 16 Fed meeting on the calendar, the useful preparation is small:');
const occ=research.claims.find(c=>c.id==='occupancy');occ.expires='2026-10-14';occ.asOf=date;
delete research.review;
writeFileSync(f,'<!--PAGE '+JSON.stringify(spec,null,2)+' PAGE-->\n\n'+body+'\n');
research.review={provider:'claude',model:'claude-opus-5[1m]',reasoningEffort:'default',checkedAt:date,selectionReason:'Scheduled Monday run; Claude primary provider available, no fallback.',checks:{facts:true,calculations:true,voice:true,scope:true,sources:true,counterarguments:true},
 notes:'Opened all eleven cited primary sources this session (Freddie Mac PMMS, July 29 FOMC statement, FOMC calendar, Fed policy explainer, Treasury daily par yield CSV, FEDS 2021-048 section III.A, four CFPB pages, Fannie Mae B2-1.1-01). Independently recomputed the three amortization payments, the points break-even and the ownership total in Node. Read-aloud pass corrected three passages: the PMMS table cell now says "as of the September 10 weekly release" rather than "week ending", the post-announcement sentence no longer asserts that quotes "barely react", and the pre-meeting paragraph names the September 15 and 16 dates instead of "this week". Scope: no forecast of the September 16 decision, no spread computed across mismatched windows, hypothetical loan inputs labeled. Counterarguments retained: waiting can fit a budget better; locks carry conditions and can exclude later lower pricing. Owner and professional approval are not represented by this agent review.',
 contentHash:contentHash(spec,body),evidenceHash:evidenceHash(research)};
writeFileSync(rp,JSON.stringify(research,null,2)+'\n');
const v=validateEditorial(spec,body,research,{today:date,site:'gc'});
console.log(JSON.stringify({errors:v.errors,sources:v.sources,claims:v.claims,local:v.localApplications,words:body.replace(/<[^>]+>/g,' ').trim().split(/\s+/).length}));
