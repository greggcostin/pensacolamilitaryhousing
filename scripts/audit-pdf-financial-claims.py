from pathlib import Path
from pypdf import PdfReader
import json, re, hashlib
out=Path('docs/seo-geo-2026-09-06/projects/03-accuracy/zip-and-claims/pdf-review');out.mkdir(parents=True,exist_ok=True)
records=[]
for site in ['pmh','gc']:
 root=Path('.coast-release/2026-09-08-perdido-guide-03')/site
 for path in (root/'downloads').rglob('*.pdf'):
  reader=PdfReader(path);pages=[p.extract_text() or '' for p in reader.pages]
  matches=[]
  for number,text in enumerate(pages,1):
   for line in text.splitlines():
    if re.search(r'IRRRL|funding.fee|\boccup|entitlement|tax|insurance|\brent|210|TLE|TLA|BAH|\$\d|\d\s*%',line,re.I):matches.append({'page':number,'text':line})
  stem=site+'-'+path.stem
  (out/(stem+'.txt')).write_text('\n\n'.join(f'PAGE {i}\n{t}' for i,t in enumerate(pages,1)),encoding='utf-8')
  records.append({'site':site,'path':path.relative_to(root).as_posix(),'pages':len(pages),'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'matches':matches,'reviewStatus':'extracted_pending_semantic_review'})
(out/'inventory.json').write_text(json.dumps(records,indent=2),encoding='utf-8')
print(json.dumps({'pdfs':len(records),'pages':sum(r['pages'] for r in records),'matchingLines':sum(len(r['matches']) for r in records)}))
