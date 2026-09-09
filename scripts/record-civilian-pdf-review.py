"""Record the manually completed financial review against unchanged PDF hashes.

This records review decisions; it is not an automated semantic certification.
"""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json

out = Path('docs/seo-geo-2026-09-06/projects/03-accuracy/zip-and-claims/pdf-review')
baseline = Path('.coast-release/2026-09-08-ai-cited-claims/gc')
inventory = json.loads((out / 'edition-review.json').read_text(encoding='utf-8'))
sources = {
 'alabama_classification': {'url': 'https://baldwincountyal.gov/government/revenue-commission/divisions/assessments/exemptions', 'review': 'Official search result confirmed Class III owner-occupied residential 10 percent versus Class II 20 percent. Full-page fetch timed out; current property classification remains property-specific.'},
 'florida_tax': {'url': 'https://floridarevenue.com/property/Documents/pt112.pdf', 'review': 'Official guide read for reassessment, Save Our Homes and portability; not a property tax quote.'},
 'nfip_wait': {'url': 'https://www.floodsmart.gov/get-insured/buy-a-policy', 'review': 'Official 30-day default and exceptions reviewed; individual effective date requires insurer confirmation.'},
 'flood_requirement': {'url': 'https://www.floodsmart.gov/get-insured/eligibility', 'review': 'Lender requirements can apply outside a Special Flood Hazard Area.'},
 'hurricane_deductible': {'url': 'https://www.myfloridacfo.com/division/consumers/consumerprotections/floridashurricanedeductible', 'review': 'Percentage deductible basis and policy-specific terms reviewed.'},
 'trid': {'url': 'https://www.consumerfinance.gov/compliance/compliance-resources/mortgage-resources/tila-respa-integrated-disclosures/tila-respa-integrated-disclosure-faqs/', 'review': 'Official six-item application, Loan Estimate timing, Closing Disclosure timing and material-change waiting-period rules checked.'},
 'closing_disclosure': {'url': 'https://www.consumerfinance.gov/owning-a-home/closing-disclosure/', 'review': 'Official Closing Disclosure explanation reviewed; actual transaction and coverage matter.'},
 'condo': {'url': 'https://condos.myfloridalicense.com/inspections/', 'review': 'Milestone inspection and Structural Integrity Reserve Study are distinct Florida requirements with applicability and exceptions; the PDF does not assert a universal deadline.'},
 'lease_documents': {'url': 'https://www.sria-fla.com/administration/page/administration-leasing-documents-forms', 'review': 'Current full-page retrieval returned 403. No lease fee, renewal right, transfer approval or specific lease interpretation certified. The PDF directs the reader to the executed lease and authority.'},
 'va_purchase': {'url': 'https://www.va.gov/housing-assistance/home-loans/loan-types/purchase-loan/', 'review': 'Eligibility, underwriting and occupancy distinguished; conditional loan approval is not a closing guarantee.'},
 'va_fees': {'url': 'https://www.va.gov/housing-assistance/home-loans/funding-fee-and-closing-costs/', 'review': 'VA fees and exemptions reviewed separately from negotiated transaction costs.'}
}

topics = {
 'alabama-florida-ownership-costs': {
  'scope': 'Assessment-ratio illustration, full ownership-cost comparison, provider/property-specific insurance and tax inputs; owner occupancy and classification are not inferred from mailing address.',
  'sources': ['alabama_classification', 'florida_tax'],
  'calculations': [(400000*.10*.040,1600),(400000*.20*.040,3200),((3920-3790)*36,4680)],
  'note': 'All figures are explicitly hypothetical. Millage and classification require the actual property.'},
 'florida-property-tax-after-purchase': {
  'scope': 'Following-January reassessment with exceptions, SOH assessment cap versus tax bill, portability measured from abandonment rather than closing, homestead application timing, and indexed exemption distinction.',
  'sources': ['florida_tax'], 'calculations': [(6450/12,537.5),(3450/12,287.5)],
  'note': 'Illustrations do not transfer a seller exemption or establish the buyer tax bill.'},
 'coastal-insurance-and-flood': {
  'scope': 'Quote versus binder/policy, dwelling-based hurricane deductible illustration, NFIP default waiting period with exceptions, lender requirements, and map limitations.',
  'sources': ['nfip_wait','flood_requirement','hurricane_deductible'],
  'calculations': [(400000*.02,8000),(400000*.05,20000),(20000-8000,12000)],
  'note': 'No premium range is certified as a property quote; actual contract terms govern.'},
 'mortgage-preapproval-to-closing': {
  'scope': 'Conditional approval; six-item TRID application; three-business-day LE and CD rules for covered transactions; changed APR/product/prepayment waiting triggers; signing, funding and possession distinguished.',
  'sources': ['trid','closing_disclosure','va_purchase'], 'calculations': [],
  'note': 'The 30-to-45-day timeline is illustrative rather than a lender promise.'},
 'gulf-coast-condo-due-diligence': {
  'scope': 'Separate milestone/SIRS processes, Florida versus Alabama applicability, association assessment illustration, master versus unit coverage, reserves, lender/project approval and actual allocation documents.',
  'sources': ['condo','flood_requirement','va_purchase'],
  'calculations': [(2400000/80,30000),(30000/24,1250),(1250+650,1900)],
  'note': 'Equal allocation is an illustration, not a rule; current statutory deadlines and any particular association are not certified.'},
 'pensacola-beach-leasehold-due-diligence': {
  'scope': 'Ownership-cost arithmetic and the need for executed lease, amendments, current statements, renewal/transfer provisions and lender acceptance. No automatic renewal or universal charge is promised.',
  'sources': ['lease_documents'],
  'calculations': [(2500+550+400+125+1800/12+425,4150)],
  'note': 'Targeted arithmetic/process review only. SRIA source retrieval was blocked; specific lease/legal assertions remain unverified.'},
 'seller-net-proceeds': {
  'scope': 'Payoff and all stated deductions, credit and lien sensitivity, side-by-side offers, negotiated compensation and closing proceeds distinct from after-tax proceeds.',
  'sources': ['closing_disclosure'],
  'calculations': [(450000-285000-18000-3200-6000-2400-1500,133900),(133900+5000,138900),(133900-4000,129900),(133900-10000,123900),(450000-10000-310100,129900),(445000-2000-310100,132900)],
  'note': 'The 18000 compensation input is hypothetical and negotiated; no standard commission or tax-free outcome is asserted.'},
 'inspection-to-repair-decision': {
  'scope': 'Repair/contingency arithmetic, lender limits on usable credits, inspections distinct from appraisals and insurance, actual contract deadlines, and required agreement for holdbacks.',
  'sources': ['va_purchase','closing_disclosure'],
  'calculations': [(7500+1500,9000),(9000-5000,4000)],
  'note': 'A credit is not assumed to be unrestricted cash or an automatic contract remedy.'},
 'buyer-transaction-roadmap': {
  'scope': 'Conditional financing, full costs, actual deposit/contract deadlines, appraisal versus inspection, covered-mortgage CD timing, possession, and nonautomatic tax-exemption transfer.',
  'sources': ['trid','closing_disclosure','va_purchase','florida_tax'], 'calculations': [],
  'note': 'No deposit refund, loan approval or possession is inferred without the governing documents.'},
 'seller-transaction-roadmap': {
  'scope': 'Actual comparable evidence rather than asking prices/AVMs, conditional buyer financing and assumption distinctions, repair costs versus promised ROI, payoff versus balance, taxes and post-closing occupancy.',
  'sources': ['va_fees','closing_disclosure'], 'calculations': [],
  'note': 'No universal Florida/Alabama disclosure rule, automatic assumption release or tax-free proceeds are certified.'}
}

records=[]
for slug, topic in topics.items():
 prior=next(r for r in inventory['records'] if r['site']=='gc' and Path(r['path']).stem==slug)
 path=baseline/prior['path']; digest=hashlib.sha256(path.read_bytes()).hexdigest()
 assert digest==prior['sha256'],f'Edition drift: {slug}'
 extraction=out/f'gc-{slug}.txt'; assert extraction.is_file()
 checks=[]
 for actual,expected in topic.pop('calculations'):
  assert abs(actual-expected)<0.000001,(slug,actual,expected)
  checks.append({'calculated':round(actual,6),'expected':expected,'matches':True})
 records.append({**prior,**topic,'reviewStatus':'targeted_financial_review','reviewMethod':'Manual reading of extracted substantive PDF financial/transaction sections, official-source checks and independent illustration arithmetic. This script records those decisions and verifies edition identity.','textEvidence':extraction.name,'textSha256':hashlib.sha256(extraction.read_bytes()).hexdigest(),'arithmeticChecks':checks,'editionDatePreserved':'2026-09-06','pdfBytesChanged':False})

record={'reviewedAt':datetime.now(timezone.utc).isoformat(),'status':'targeted_review_complete_with_explicit_source_limits','pdfs':len(records),'pages':sum(r['pages'] for r in records),'arithmeticChecks':sum(len(r['arithmeticChecks']) for r in records),'sources':sources,'records':records,'limits':'This is targeted financial and transaction-process review, not full legal, operational, biographical or property-specific certification. Owner-provided performance statements and credentials were not independently reverified. The ten unchanged PDFs retain their original edition dates. Lease-source access failed and individual contract interpretation remains open.'}
(out/'civilian-financial-review.json').write_text(json.dumps(record,indent=2)+'\n',encoding='utf-8')
print(json.dumps({k:v for k,v in record.items() if k not in ['sources','records','limits']},indent=2))
