from pathlib import Path
import json,re
from pypdf import PdfReader
import pypdfium2 as pdfium
from PIL import Image,ImageDraw
root=Path('artifacts/client-library');out=root/'qa';out.mkdir(exist_ok=True)
report=json.loads((root/'build-report.json').read_text());issues=[];covers=[]
for g in report['guides']:
 path=root/g['pdf'];reader=PdfReader(path);pdf=pdfium.PdfDocument(str(path));thumbs=[]
 if len(reader.pages)!=g['pages']:issues.append([g['slug'],'page count mismatch'])
 if not reader.trailer['/Root'].get('/StructTreeRoot'):issues.append([g['slug'],'missing tagged structure'])
 text='\n'.join(p.extract_text() or '' for p in reader.pages)
 if re.search(r'\b(NaN|undefined|TODO|TBD)\b|\u2014|\u2013',text):issues.append([g['slug'],'placeholder or prohibited dash'])
 if re.search(r'Behind the photographs|Photography and contact|CC BY|Pexels|Unsplash|Photo credits|Original/source record',text,re.I):issues.append([g['slug'],'visible photo-credit text remains'])
 if not all((p.extract_text() or '').strip() for p in reader.pages):issues.append([g['slug'],'blank page'])
 last=reader.pages[-1];last_text=last.extract_text() or ''
 for value in ['Gregg Costin','2025 Rookie of the Year','ABR','SRS','RENE','HFR','MRP','FMS','MCA','FAA','GreggCostin.com','PensacolaMilitaryHousing.com']:
  if value not in last_text:issues.append([g['slug'],'missing final-page detail '+value])
 uris={str(a.get_object().get('/A',{}).get('/URI','')) for a in last.get('/Annots',[])}
 for url in ['https://greggcostin.com/','https://pensacolamilitaryhousing.com/','https://www.instagram.com/greggcostinrealtor/','https://www.facebook.com/greggcostinrealtor','https://www.youtube.com/@PensacolaMilitaryRealtor','https://www.linkedin.com/in/greggcostin/']:
  if url not in uris:issues.append([g['slug'],'missing clickable PDF profile link '+url])
 for i in range(len(pdf)):
  im=pdf[i].render(scale=.42).to_pil().convert('RGB');tile=Image.new('RGB',(285,397),'#dfdfda');tile.paste(im,(14,12));ImageDraw.Draw(tile).text((12,378),f'{g["slug"]} | {i+1}',fill='black');thumbs.append(tile)
  if i==0:covers.append(tile.copy())
 sheet=Image.new('RGB',(285*4,397*((len(thumbs)+3)//4)),'#dfdfda')
 for i,im in enumerate(thumbs):sheet.paste(im,((i%4)*285,(i//4)*397))
 sheet.save(out/(g['slug']+'.jpg'),quality=90)
 (out/(g['slug']+'.txt')).write_text(text,encoding='utf-8')
board=Image.new('RGB',(285*5,397*((len(covers)+4)//5)),'#dfdfda')
for i,im in enumerate(covers):board.paste(im,((i%5)*285,(i//5)*397))
board.save(out/'all-covers.jpg',quality=90)
result={'guides':len(report['guides']),'pages':sum(g['pages'] for g in report['guides']),'issues':issues,'tagged':True,'textExtractable':True}
(out/'audit.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result));raise SystemExit(bool(issues))
