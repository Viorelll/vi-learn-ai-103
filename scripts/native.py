from pypdf import PdfReader
import json
r=PdfReader(r'C:/Users/Lenovo/Downloads/AI-103_135_Questions_Answers_OpenAI_Reviewed_2026-09-15.pdf')
qs=json.load(open('tmp/pdfs/extracted.json',encoding='utf-8'))
for q in qs:
 if q['images']:
  p=r.pages[q['page']-1]
  for i,img in enumerate(p.images):
   img.image.save('public'+q['images'][i])
print('Native images extracted')
