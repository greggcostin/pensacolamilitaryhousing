"""Update the project register from the saved, scoped release evidence."""
import csv, json
from datetime import datetime, timezone
from pathlib import Path

root = Path('docs/seo-geo-2026-09-06')
coordination_path=root/'release-coordination.json'
if coordination_path.exists():
 coordination=json.loads(coordination_path.read_text(encoding='utf-8'))
 expected={'military':'3b032ef3-214e-4934-833f-2db42abcb788','civilian':'571a1c5a-77f7-41fe-a6ce-16abfd71f59d'}
 if coordination.get('latestObserved')!=expected:
  raise RuntimeError('A newer deployment is recorded. This historical release writer must not restore its older baseline over the current coordination record.')
detail = 'projects/03-accuracy/zip-and-claims'
measurement = 'projects/08-measurement/2026-09-08'
benchmark = json.loads((root / measurement / 'ai-observations.json').read_text(encoding='utf-8-sig'))
indexing = json.loads((root / measurement / 'indexing-summary.json').read_text(encoding='utf-8-sig'))
current = indexing['latestRecordedSummary']
pdf_review = json.loads((root / detail / 'pdf-review/civilian-financial-review.json').read_text(encoding='utf-8'))
successor = 'projects/03-accuracy/ai-cited-claims'
live = json.loads((root / successor / 'live/production-baseline.json').read_text(encoding='utf-8-sig'))
if not live['ok'] or sum(s['counts']['exact'] for s in live['sites']) != 4083:
 raise ValueError('Expected verified complete successor inventory')
updates = {
 'R01': ('published_verified', 'Preserved the complete Perdido baseline and published the ownership, claims, receipt and Navarre refinements.', '693 indexable pages retained; 4025 exact production asset hashes match; 26 public readbacks pass; no baseline assets removed.', f'{detail}/README.md; {detail}/live/production-baseline.json'),
 'R02': ('local_complete', 'Seal the complete candidate inventory and reject unregistered body/asset changes. Retain shared identity, reviewed financial content and canonical discovery checks.', 'Current complete-site military, civilian and entity gates pass with zero findings for their defined scope. All 677 non-substantive HTML changes match the receipt transformation.', f'{detail}/candidate-verification.json; scripts/verify-evidence-refinement.mjs'),
 'R03': ('published_verified', 'Published only the reconciled candidate, then independently read back both provider inventories and selected public assets.', 'PMH 5b38edde-4064-4fcd-a66b-56a0ad0175af; GC 571a1c5a-77f7-41fe-a6ce-16abfd71f59d. All 4025 hashes match. Do not redeploy an older partial checkout.', f'{detail}/deployment.json; {detail}/live-public-verification.json'),
 'R04': ('in_progress', 'Refreshed the existing 26-ZIP study using the shared ownership model. Reviewed seven remaining military financial guides, civilian first-time buyer and seven older base-page bodies; three additional AI-cited pages received follow-up corrections. Corrected the old PDF checklist and recorded scoped review of all 23 PDF editions.', '26 dated ZIP rows and 110 visible/schema answers pass across 21 revised pages. 414 BAH values match the archive across nine PDFs. The ten civilian editions received targeted financial/process review and 20 arithmetic checks. Individual property/lease terms, historical performance and unrelated legacy claims remain open.', f'{detail}/README.md; {detail}/pdf-review/edition-review.json; {detail}/pdf-review/civilian-financial-review.json'),
 'R06': ('in_progress', 'Published strict accepted-receipt browser success/conversion handling across static forms, blog journeys and both React submission paths. Used isolated fixtures only.', 'Four receipt unit checks and 24 browser checks pass. No real test lead or unsolicited email sent. Historical CRM source/stage evidence does not establish the current receipt, notification and browser-event chain.', f'{detail}/browser/verification.json; {measurement}/authentic-inquiry-readback.json'),
 'R07': ('authenticated_inspections_complete_followup_open', 'Completed 20 authenticated Google inspections and 20 Bing GetUrlInfo readbacks per domain. Resubmitted the existing civilian sitemap and requested a crawl of the refreshed Navarre page.', f'Initial Google sample: military 19/20 indexed; civilian 0/20. Latest recorded civilian sample: {current["gc"]["indexed"]}/20 indexed after homepage reinspection. Preserve both observations without a causal claim. Bing crawl metadata and submission receipts are not indexed verdicts.', f'{measurement}/indexing-summary.json; {measurement}/priority-indexing.csv; {measurement}/google-civilian-navarre-index-request.json'),
 'R17': ('in_progress', 'Execute the unchanged 16-core-question, seven-surface, three-repeat benchmark in fresh conversations. Save exact responses, visible citations and session context.', f'{benchmark["completed"]}/{benchmark["target"]} responses saved; {benchmark["unrun"]} unrun remain null. Recommendation, visible source, citation, referral and qualified-consultation outcomes are separate. No population ranking or causal uplift claimed.', f'ai-benchmark.json; {measurement}/ai-observations.json'),
 'R18': ('in_progress', 'Published receipt-based browser conversions and Navarre self-reported task/export events. Retained separate hostname and referral classifications.', 'Client-identifying data is excluded from browser analytics. Actual accepted-inquiry totals, qualified consultations, agreements and closings remain unknown without a joined outcome export.', f'{detail}/README.md; content/measure/inquiry-outcomes.json'),
 'R22': ('published_targeted_review_remaining_scope_open', 'Replaced the older financial/planning bodies of all seven installation pages while preserving the reviewed official housing/contact sections.', 'No rank-to-price promises or invented route times in reviewed bodies. Current gate instructions, all older operational assertions and complete PDF operational review remain separate tasks.', f'{detail}/candidate-verification.json; scripts/review-base-financial-claims.mjs'),
 'R23': ('method_published_field_evidence_open', 'Published a route method with origin, authorized reporting gate, departure window, provider, capture date and repeat observations in the Perdido/Navarre pilots.', 'No estimated drive time is represented as measured. Actual documented route observations remain outstanding.', 'content/communities/navarre-cost-evidence.json; scripts/build-navarre-guides.mjs'),
 'R24': ('published_model_actual_quotes_open', 'Reused the existing 26-ZIP ownership-study URL and reconciled its calculations to the shared model, with ZHVI observation dates and Census geography.', 'Visible table and CSV/JSON agree. July 31 ZHVI is a modeled value index; tax, insurance and financing are illustrative inputs. Property-specific quotes and bills remain absent.', f'{detail}/sources/capture.json; content/data/bah-ownership-study-2026.json'),
 'R29': ('published_evidence_field_documents_open', 'Published distinct military and civilian Navarre guides with county utility/lease evidence, property-document decisions and route methods.', 'Dated official utility schedule supports reproducible 3000/5000-gallon examples. These are computed scenarios, not bills; mainland/provider and lease applicability are explicit. Self-reported checklist completion is separate from qualification.', 'content/communities/navarre-cost-evidence.json; scripts/build-navarre-guides.mjs'),
 'R32': ('published_model_actual_quotes_open', 'Retained canonical professional JSON across both domains and added the dated ZIP-study export and mirrored Navarre evidence JSON.', 'Public study rows reproduce the model; Navarre copies agree. Structured data exposes source dates and missing property observations without inventing market medians or quotes.', f'{detail}/live-public-verification.json; content/data/bah-ownership-study-2026.json'),
 'R33': ('published_instrumentation_outcomes_open', 'Retained complete ownership tools and added explicit Navarre checklist completion and CSV export events.', 'Local browser verification passes; task completion is self-reported and distinct from accepted inquiry, qualified consultation and financial outcomes. Real visitor aggregates remain unverified.', f'{detail}/browser/verification.json; public/assets/costin-region-tasks.js'),
}
updates['R01']=('published_verified','Preserved the complete two-site inventory through the ownership/claims release and three-page AI-citation follow-up.','693 indexable pages retained; 4083 exact production asset hashes match. No baseline assets removed.',f'{successor}/README.md; {successor}/live/production-baseline.json')
updates['R03']=('published_verified','Published reconciled candidates and verified provider inventories and public assets. The last successor changes only three military pages.','Current military 3b032ef3-214e-4934-833f-2db42abcb788; civilian 571a1c5a-77f7-41fe-a6ce-16abfd71f59d. All 4083 assets match. No ordinary partial checkout was deployed.',f'{successor}/deployment.json; {successor}/live-public-verification.json')
updates['R07']=('authenticated_inspections_complete_followup_open','Completed 20 authenticated Google inspections and 20 Bing metadata readbacks per domain. Resubmitted the existing civilian sitemap; requested indexing once each for civilian Navarre and the military study.',f'Initial Google: military 19/20, civilian 0/20 indexed. Later homepage verdict brings recorded civilian sample to {current["gc"]["indexed"]}/20. Study is discovered, currently not indexed. Accepted crawl requests and Bing metadata are not indexed verdicts.',f'{measurement}/indexing-summary.json; {measurement}/google-civilian-navarre-index-request.json; {measurement}/google-military-study-index-request.json')
if benchmark['completed']==benchmark['target']:
 updates['R17']=('benchmark_collected_reviewed' if benchmark['status']=='complete' else 'benchmark_collected_review_pending',updates['R17'][1],updates['R17'][2],updates['R17'][3])
elif benchmark.get('collectionInterruption'):
 updates['R17']=('partial_browser_session_unavailable',updates['R17'][1],updates['R17'][2]+' The interrupted authenticated Chrome session is no longer exposed. The exact remaining keys are saved in the resume queue.',updates['R17'][3]+f'; {measurement}/collection-interruption.json; {measurement}/ai-resume-queue.json')
with (root / 'implementation-register.csv').open(encoding='utf-8-sig', newline='') as f:
 reader=csv.DictReader(f); fields=reader.fieldnames; rows=list(reader)
for row in rows:
 if row['id'] in updates:
  row['status'],row['action'],row['acceptance'],row['evidence']=updates[row['id']]
with (root / 'implementation-register.csv').open('w',encoding='utf-8',newline='') as f:
 writer=csv.DictWriter(f,fieldnames=fields,quoting=csv.QUOTE_ALL);writer.writeheader();writer.writerows(rows)

release=root/'RELEASE.md'
text=release.read_text(encoding='utf-8-sig')
start='<!-- EVIDENCE_REFINEMENT_START -->'; end='<!-- EVIDENCE_REFINEMENT_END -->'
section=f'''{start}
# Current release: ownership, claims, receipt conversions and Navarre

**Latest successor:** the three AI-cited military pages were corrected at 20:55 UTC. The complete baseline is now `.coast-release/2026-09-08-ai-cited-claims`, with **4,083 exact assets** (3,004 military and 1,079 civilian). Military deployment is `3b032ef3-214e-4934-833f-2db42abcb788`; the civilian deployment below is unchanged. The original 18 substantive revisions and three follow-up pages total 21 distinct pages. [Follow-up scope and checks]({successor}/README.md).

The preceding main release was published September 8, 2026. Its verification matched **4,025 exact assets**, **693 indexable pages retained**, **18 substantively edited pages**, and **26 passing public page/asset readbacks**. The other 677 HTML files retained their content and review dates outside the exact receipt transformation and SPA bundle reference. The #1 statement and approved hours remain intact. The following table records that preceding release; the successor above is the current complete baseline.

| Site | Production deployment | Exact assets |
|---|---|---:|
| Military | `5b38edde-4064-4fcd-a66b-56a0ad0175af` | 2,946 |
| Civilian | `571a1c5a-77f7-41fe-a6ce-16abfd71f59d` | 1,079 |

The existing 26-ZIP study now uses the shared ownership model, July 31 Zillow observations, dated Census geography and explicit illustrative cost inputs. Seven military financial guides, the civilian first-time-buyer guide and seven base-page bodies were reviewed. The PDF register covers 23 PDFs/292 pages with exact scope; 414 displayed BAH values match the source archive, and the obsolete two-page checklist was corrected. The subsequent review of ten civilian editions covers 96 pages and 20 recalculated financial examples; it does not certify individual lease terms or all legal/operational claims. Both distinct Navarre guides now have primary county utility evidence, property-document decisions and route methods.

Receipt-gated browser conversions are published and pass four unit checks and 24 isolated browser checks. No real test lead or unsolicited email was sent. An authentic current receipt-to-CRM-to-notification/browser match is still unverified. Task completion, accepted inquiries and qualified consultations remain separate measures.

Forty authenticated Google inspections and 40 Bing metadata readbacks are saved. The initial Google sample was 19/20 military and 0/20 civilian indexed; later homepage reinspection reports it indexed, bringing the latest recorded civilian sample to {current['gc']['indexed']}/20. The live homepage fetch succeeded. The existing sitemap was resubmitted and Navarre added to Google's priority crawl queue. These receipts do not certify indexing of other URLs or causality. The AI benchmark has {benchmark['completed']}/336 saved responses with {benchmark['pendingSemanticReviews']} semantic reviews pending. The browser collection was interrupted and its authenticated Chrome surface is no longer exposed; the {benchmark['unrun']} unrun keys are retained in an exact resume queue. Missing observations and real referral/consultation outcomes remain unknown.

The refreshed study also has one accepted request for Google's priority crawl queue. Read-only worker observability exposed 11 retained events, including the earlier non-lead health/validation run; no authentic accepted receipt was established. The API log query returned an authentication error, so the available log readback came from the authenticated dashboard. Neither missing joined evidence nor limited retained logs establishes zero real inquiries.

**Use `.coast-release/2026-09-08-ai-cited-claims` as the current complete baseline.** Older sections below describe historical releases, not a directory to deploy over this successor. No Git commit or push was performed.

[Main release and source evidence]({detail}/README.md), [current successor production hashes]({successor}/live/production-baseline.json), [current successor public verification]({successor}/live-public-verification.json), [PDF financial review]({detail}/pdf-review/civilian-financial-review.json), [measurement records]({measurement}/README.md).
{end}
'''
if start in text:text=text[:text.index(start)]+text[text.index(end)+len(end):].lstrip('\n')
release.write_text(section+'\n'+text,encoding='utf-8')
outcomes=Path('content/measure/inquiry-outcomes.json')
record=json.loads(outcomes.read_text(encoding='utf-8-sig'))
record['availability']='partial_browser_verified_aggregate_outcomes_unavailable'
record['note']='Receipt-gated browser conversions were published on both domains September 8, 2026 and passed isolated local browser checks with all external requests blocked. No real test lead or unsolicited email was sent. A historical website-origin CRM contact was observed, but its age predates the receipt change and it has no joined current receipt/notification/browser proof. Accepted-inquiry counts, qualified consultations, agreements and closings remain unknown, not zero. Earlier civilian GA4 hostname activity is not proof of a generate_lead event or Sessions total. Aggregate windows require hostname, period, attribution, receipt deduplication and verified outcome provenance; include no client-identifying information.'
record['verificationEvidence']=[f'docs/seo-geo-2026-09-06/{detail}/browser/verification.json',f'docs/seo-geo-2026-09-06/{measurement}/authentic-inquiry-readback.json']
record['verificationEvidence'].append(f'docs/seo-geo-2026-09-06/{measurement}/authentic-inquiry-worker-ui.json')
outcomes.write_text(json.dumps(record,indent=2)+'\n',encoding='utf-8')
program_path=root/'program.json'
program=json.loads(program_path.read_text(encoding='utf-8-sig'))
program['status']='Ownership study, remaining scoped financial claims, receipt-based browser conversions and distinct Navarre guides are published. Three actually AI-cited military pages were subsequently corrected. Forty authenticated Google inspections and 40 Bing metadata readbacks are recorded. Authentic current inquiry joins, actual property-cost documents and wider legacy financial/operational review remain open. The benchmark execution counts below refer only to saved answers.'
program['metrics'].update(publishedAssetsVerified=4083,lastReleaseChangedHtmlPages=3,currentBaseline='.coast-release/2026-09-08-ai-cited-claims',latestProductionVerifiedAt=live['checkedAt'],currentTaskSubstantivePages=21,googlePriorityInspections=40,bingMetadataReadbacks=40,googlePriorityIndexedMilitary=current['pmh']['indexed'],googlePriorityIndexedCivilian=current['gc']['indexed'],aiBenchmarkResponses=benchmark['completed'],aiBenchmarkTarget=benchmark['target'],pdfEditionsScoped=23,pdfDisplayedBahValuesVerified=414)
program['metrics'].update(pdfCivilianTargetedReviewPages=pdf_review['pages'],pdfCivilianArithmeticChecks=pdf_review['arithmeticChecks'],aiBenchmarkRemaining=benchmark['unrun'],aiSemanticReviewsPending=benchmark['pendingSemanticReviews'])
for task in program.get('tasks',[]):
 if task['id'] in updates: task['status'],task['action'],task['acceptance'],task['evidence']=updates[task['id']]
program['updatedAt']=datetime.now(timezone.utc).isoformat()
progress_path=root/'progress.json'
progress=json.loads(progress_path.read_text(encoding='utf-8-sig'))
progress['updatedAt']=program['updatedAt']
progress['status']=program['status']
progress['metrics'].update(program['metrics'])
for identifier,values in updates.items():
 progress.setdefault('taskUpdates',{}).setdefault(identifier,{}).update(dict(zip(['status','action','acceptance','evidence'],values)))
next_steps={
 'P01':('published_verified','Use the complete ai-cited-claims successor as the verified baseline and reconcile later production changes. Preserve identity, search coverage, receipt scripts and unchanged review dates.'),
 'P02':('in_progress','Accepted-receipt browser conversions are published and pass isolated checks. Join one authentic accepted receipt to CRM and notification evidence without creating a test lead; real outcome totals remain unknown.'),
 'P03':('in_progress','The existing 26-ZIP study and remaining named financial guides are reviewed, with 23 scoped PDF editions. Continue other legacy financial/operational claims and property-specific evidence. Individual lease terms and historical transaction percentages still need their own support.'),
 'P04':('partial_browser_session_unavailable',f'Forty authenticated Google inspections and forty Bing metadata reads are complete. Latest recorded indexing is 19/20 military and 1/20 civilian. Resume only the {benchmark["unrun"]} missing fixed AI runs after the authenticated browser is available; retain {benchmark["completed"]} saved answers and separate recommendation, citation and referral outcomes.'),
 'P07':('in_progress','The distinct Perdido and Navarre pilots are published. The parallel civilian growth task owns its next regional/design release. Continue local property-document and actual route evidence, preserving reviewed financial content and service-area distinctions.'),
 'P08':('in_progress','The study uses the shared ownership model and dated geography/Zillow inputs, with illustrative tax/insurance. Obtain actual property-cost documents and route observations. Measure self-reported tool completion separately from authentic inquiries and qualified consultations.')
}
for project in progress.get('projects',[]):
 if project['id'] in next_steps:project['status'],project['next']=next_steps[project['id']]
for folder,release_id,changed in [('zip-and-claims','2026-09-08-evidence-refinement',18),('ai-cited-claims','2026-09-08-ai-cited-claims',3)]:
 receipt=json.loads((root/'projects/03-accuracy'/folder/'deployment.json').read_text())
 entry={'id':release_id,'project':'P03','publishedAt':receipt['finishedAt'],'sites':[{'site':s['site'],'deploymentId':s['after']} for s in receipt['sites']],'changedHtml':changed,'evidence':f'projects/03-accuracy/{folder}/README.md'}
 progress['releases']=[r for r in progress.get('releases',[]) if r['id']!=release_id]+[entry]
navarre={'id':'navarre-2026-09-08','status':'published_documented_methods_field_evidence_open','date':'2026-09-08','urls':['https://greggcostin.com/neighborhoods/navarre','https://pensacolamilitaryhousing.com/communities/navarre'],'evidence':'projects/03-accuracy/zip-and-claims/README.md','observedPropertyBills':0,'observedRoutes':0,'note':'Official county tariff examples are calculated, not household bills. Actual tax/insurance/association/lease documents remain uncollected.'}
progress['regionalGuidePilots']=[p for p in progress.get('regionalGuidePilots',[]) if p['id']!=navarre['id']]+[navarre]
program['projects']=progress['projects'];program['regionalGuidePilots']=progress['regionalGuidePilots']
progress_path.write_text(json.dumps(progress,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
program_path.write_text(json.dumps(program,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
print(f'Updated {len(updates)} register rows, release record and aggregate outcome status. AI coverage {benchmark["completed"]}/{benchmark["target"]}.')
