from pathlib import Path
import json, hashlib, zipfile
root=Path('artifacts/client-library')
catalog=json.loads((root/'build-report.json').read_text())
for name in ['journey-checks.json','audit.json','design-checks.json','worksheet-checks.json','visual-review.json','directory-checks.json','directory-pdf-checks.json']:
    check=json.loads((root/'qa'/name).read_text())
    if check.get('issues') or check.get('findings'):raise SystemExit(f'Unresolved findings: {name}')
audit=json.loads((root/'qa/audit.json').read_text())
assert audit['guides']==len(catalog['guides']) and audit['pages']==sum(g['pages'] for g in catalog['guides'])
files=[root/'index.html',root/'build-report.json']
files += [root/g[k] for g in catalog['guides'] for k in ['pdf','html']]
files += [root/name for name in catalog['assets']]
files += [p for p in (root/'worksheets').iterdir() if p.is_file()]
visual=json.loads((root/'qa/visual-review.json').read_text())
assert visual['design']==catalog['design'] and visual['guides']==len(catalog['guides'])
assert visual['pdfSha256']=={g['slug']:hashlib.sha256((root/g['pdf']).read_bytes()).hexdigest() for g in catalog['guides']},'Visual review is stale; inspect the changed edition.'
directories=json.loads((root/'qa/directory-checks.json').read_text())
directory_pdfs=json.loads((root/'qa/directory-pdf-checks.json').read_text())
base_guides={g['slug']:g for g in catalog['guides'] if g['slug'].startswith('pcs-')}
assert {g['slug'] for g in directories['checks']}==set(base_guides),'Directory HTML coverage is incomplete.'
assert {g['slug'] for g in directory_pdfs['checks']}==set(base_guides),'Directory PDF coverage is incomplete.'
assert {g['slug']:g['pdfSha256'] for g in directory_pdfs['checks']}=={slug:hashlib.sha256((root/g['pdf']).read_bytes()).hexdigest() for slug,g in base_guides.items()},'Directory PDF checks are stale; rerun text and contact-link validation.'
archive=root/'Costin-Team-Client-Guides-2026-09.zip'
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
    for p in files:z.write(p,p.relative_to(root).as_posix())
with zipfile.ZipFile(archive) as z:
    assert z.testzip() is None
    assert len(z.namelist())==len(files)
receipt={'archive':archive.name,'bytes':archive.stat().st_size,'files':len(files),'guides':len(catalog['guides']),'pages':audit['pages'],'worksheets':3,'sha256':hashlib.sha256(archive.read_bytes()).hexdigest()}
(root/'package-report.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt))

# Keep the smaller PCS handout bundle synchronized with the same reviewed PDFs.
base_archive=root/'Costin-Team-Base-Guides-2026-09.zip'
base_manifest=[]
with zipfile.ZipFile(base_archive,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
    for slug,g in base_guides.items():
        path=root/g['pdf']; name=slug+'.pdf'
        z.write(path,name)
        base_manifest.append({'file':name,'pages':g['pages'],'sha256':hashlib.sha256(path.read_bytes()).hexdigest()})
    z.writestr('README.txt','The Costin Team | PCS guide collection\n\nNine installation-specific PDFs. Open the guide matching your orders.\nEach guide includes a complete relocation roadmap, housing and financing preparation,\nbase resources, a contact directory and dated official sources.\nContact details can change; use the source links and confirm reporting instructions\nwith the desk named on your orders.\n\nGreggCostin.com | PensacolaMilitaryHousing.com | (850) 266-5005\n')
    z.writestr('manifest.json',json.dumps({'design':catalog['design'],'guides':base_manifest},indent=2)+'\n')
with zipfile.ZipFile(base_archive) as z:
    assert z.testzip() is None
    for item in base_manifest:
        assert hashlib.sha256(z.read(item['file'])).hexdigest()==item['sha256']
base_receipt={'archive':base_archive.name,'bytes':base_archive.stat().st_size,'guides':len(base_manifest),'pages':sum(g['pages'] for g in base_guides.values()),'sha256':hashlib.sha256(base_archive.read_bytes()).hexdigest()}
(root/'base-package-report.json').write_text(json.dumps(base_receipt,indent=2)+'\n');print(json.dumps(base_receipt))
