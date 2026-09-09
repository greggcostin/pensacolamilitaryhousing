from pathlib import Path
from pypdf import PdfReader
import json,re,hashlib,datetime
out=Path('docs/seo-geo-2026-09-06/projects/03-accuracy/zip-and-claims/pdf-review')
base=Path('.coast-release/2026-09-08-evidence-refinement')
rates=json.loads(Path('content/client-guides/bah-2026.json').read_text())
records=[];issues=[];rate_values=0
supplement_file=out/'civilian-financial-review.json'
supplement=json.loads(supplement_file.read_text(encoding='utf-8')) if supplement_file.exists() else None
for site in ['pmh','gc']:
 for path in (base/site/'downloads').rglob('*.pdf'):
  pages=[p.extract_text() or '' for p in PdfReader(path).pages];text='\n'.join(pages);slug=path.stem
  record={'site':site,'path':path.relative_to(base/site).as_posix(),'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'pages':len(pages),'irrRlMentions':len(re.findall('IRRRL',text)),'rateValuesCompared':0}
  if re.search(r'FL023|130\s*(?:to|[-–])\s*150|99%\s+no.brainer',text,re.I):issues.append(slug+': retired claim found')
  if slug.startswith('pcs-'):
   areas=set(re.findall(r'\bFL0\d\d\b',text));assert len(areas)==1,(slug,areas)
   area=areas.pop();table=re.findall(r'\b([EWO]-\dE?)\s+\$([\d,]+)\s+\$([\d,]+)',text)
   if len(table)!=23:issues.append(slug+': expected 23 displayed BAH rows')
   for grade,wd,wod in table:
    expected=rates['areas'][area]['rates'][grade]
    if [int(wd.replace(',','')),int(wod.replace(',',''))]!=[expected['withDependents'],expected['withoutDependents']]:issues.append(slug+': BAH mismatch '+grade)
    record['rateValuesCompared']+=2;rate_values+=2
   for term in ['hypothetical','not local quotes','21 days','partial','maintenance','restrictions on rental use']:
    if term.lower() not in text.lower():issues.append(slug+': missing financial qualifier '+term)
   record.update(reviewStatus='targeted_financial_review',scope='Displayed BAH rates, common ownership illustration, move-cash/TLE, insurance deductible and rental-exit sections. Installation contacts and every operational statement are outside this check.',illustration='300000 loan at 6 percent for 30 years: rounded P&I 1799; tax 350, insurance 275, flood 75, HOA 50 produce 2549. Maintenance/utilities explicitly additional; not a quoted total.',editionDatePreserved='2026-09-06')
  elif slug=='pensacola-pcs-checklist':
   if 'FL056' not in text or 'September 8, 2026' not in text or 'not a purchase-price approval' not in text:issues.append('Legacy checklist correction missing')
   record.update(reviewStatus='rewritten_and_visually_reviewed',scope='Both pages; replaced BAH price shortcut, corrected Eglin MHA, conditional residency/exemption and planning sequence; contact hours; source attribution.',editionDate='2026-09-08')
  elif slug in ['va-loan-insider-guide','va-loan-assumption-guide','preapproval-first']:
   record.update(reviewStatus='targeted_financial_review',scope={'va-loan-insider-guide':'Eligibility versus underwriting; purchase funding-fee tiers and exemptions; base-loan fee math; hypothetical P&I; South residual-income table; occupancy and cash-to-close distinctions.','va-loan-assumption-guide':'Equity gap and 0.5 percent fee illustration; servicer approval; release of liability distinct from entitlement restoration; occupancy and cash requirements.','preapproval-first':'Conditional preapproval, property and final underwriting conditions; hypothetical P&I; secure documents; payment versus approval limit.'}[slug],editionDatePreserved='2026-09-06')
  else:
   extension=next((r for r in (supplement or {}).get('records',[]) if r['site']==site and r['path']==record['path']),None)
   if extension and extension['sha256']==record['sha256']:
    record.update(reviewStatus=extension['reviewStatus'],scope=extension['scope'],reviewEvidence='civilian-financial-review.json',editionDatePreserved='2026-09-06',limits=extension['note'])
   else:
    if extension:issues.append(slug+': supplemental review edition hash mismatch')
    record.update(reviewStatus='screened_not_fully_reviewed',scope='Extracted and searched targeted legacy financial phrases; full topic-specific semantic/legal review remains open. No edition refresh or blanket accuracy certification.')
  records.append(record)
report={'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'pdfs':len(records),'pages':sum(r['pages'] for r in records),'displayedBahValuesCompared':rate_values,'archivedBahSourceSha256':rates['sourceSha256'],'issues':issues,'records':records,'limits':'Targeted financial review is not legal advice or certification of all statements in these editions. No PDF contains a literal IRRRL section; the standalone web guide was reviewed separately.'}
(out/'edition-review.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
print(json.dumps({k:v for k,v in report.items() if k not in ['records','limits']},indent=2));raise SystemExit(bool(issues))
