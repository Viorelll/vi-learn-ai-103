import pdfplumber,re,json
from pathlib import Path
from PIL import Image,ImageOps,ImageDraw
pdf=pdfplumber.open(r'C:/Users/Lenovo/Downloads/AI-103_135_Questions_Answers_OpenAI_Reviewed_2026-09-15.pdf')
qs=[]
for p in pdf.pages:
 t=p.extract_text() or ''
 m=re.search(r'EXAM AI-103 TOPIC (\d+) QUESTION (\d+) DISCUSSION',t)
 if m: qs.append(dict(id=int(m[2]),topic=int(m[1]),page=p.page_number,text='',images=[]))
 if not qs: continue
 q=qs[-1]; q['text']+='\n'+re.sub(r'Microsoft AI-103 - OpenAI-reviewed study edition Page \d+','',t)
 for i,img in enumerate(p.images):
  path=f'public/questions/{q["id"]}-{p.page_number}-{i}.png'
  p.crop((img['x0'],img['top'],img['x1'],img['bottom'])).to_image(resolution=150).save(path)
  q['images'].append('/'+path.removeprefix('public/'))
Path('tmp/pdfs/extracted.json').write_text(json.dumps(qs,indent=2),encoding='utf-8')
print('Questions',len(qs),'with images',[(q['id'],len(q['images'])) for q in qs if q['images']])
for q in qs:
 s=q['text'].split('ANSWER -')[0]
 a=q['text'].split('ANSWER -')[1].split('Comments')[0] if 'ANSWER -' in q['text'] else ''
 print(f'Q{q["id"]}: '+s[-180:].replace('\n',' ')+' KEY: '+a[:160].replace('\n',' '))
