"""Read PDF text and annotations independently of the HTML renderer."""
from pathlib import Path
from pypdf import PdfReader
import json,re,hashlib
root=Path('artifacts/client-library')
expected=json.loads((root/'qa/directory-checks.json').read_text(encoding='utf-8'))
results=[]
for g in expected['checks']:
    path=root/'pdf'/f'{g["slug"]}.pdf'
    reader=PdfReader(path)
    text=' '.join(' '.join((p.extract_text() or '').split()) for p in reader.pages)
    uris={str(a.get_object().get('/A',{}).get('/URI','')) for p in reader.pages for a in p.get('/Annots',[])}
    missing=[x for x in g['expectedPdfUris'] if x not in uris]
    assert not missing,(g['slug'],'PDF link loss',missing)
    for number in g['publishedPhones']:
        assert number in text,(g['slug'],'phone missing from PDF text',number)
    compact=re.sub(r'\s+','',text)
    for email in g['publishedEmails']:
        assert email in compact,(g['slug'],'email missing from PDF text',email)
    assert reader.trailer['/Root'].get('/StructTreeRoot'),g['slug']+' missing PDF tags'
    assert 'September 7, 2026' in text,g['slug']+' missing contact review date'
    results.append({'slug':g['slug'],'pdfSha256':hashlib.sha256(path.read_bytes()).hexdigest(),'phoneOccurrencesChecked':len(g['publishedPhones']),'emailOccurrencesChecked':len(g['publishedEmails']),'workingLinkAnnotations':len(g['expectedPdfUris'])})
out={'checkedGuides':len(results),'checks':results,'findings':[]}
(root/'qa/directory-pdf-checks.json').write_text(json.dumps(out,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'checkedGuides':len(results),'phoneOccurrences':sum(g['phoneOccurrencesChecked'] for g in results),'clickableDestinations':sum(g['workingLinkAnnotations'] for g in results),'findings':[]}))
