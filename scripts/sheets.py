import json
from PIL import Image,ImageOps,ImageDraw
qs=json.load(open('tmp/pdfs/extracted.json',encoding='utf-8'))
imgs=[q for q in qs if q['images']]
for k in range(0,len(imgs),6):
 out=Image.new('RGB',(1800,1800),'#ddd'); draw=ImageDraw.Draw(out)
 for j,q in enumerate(imgs[k:k+6]):
  im=Image.open('public'+q['images'][0]); im.thumbnail((890,550)); x=(j%2)*900;y=(j//2)*600;out.paste(im,(x,y+35));draw.text((x+10,y+5),str(q['id']),fill='black',font_size=25)
 out.save(f'tmp/pdfs/sheet-{k//6}.png')
