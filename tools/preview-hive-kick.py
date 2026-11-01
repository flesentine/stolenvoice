from PIL import Image,ImageDraw
import json, os
from pathlib import Path
os.chdir(Path(__file__).resolve().parents[1])
frames=json.load(open('assets/reviews/hive-disaster-frames.json'));base=Image.open('assets/rooms/orchard-agi-v1.png').convert('RGB')
assert base.size==(160,168)
imgs=[];sheet=Image.new('RGB',(4*256,3*270))
for i,f in enumerate([7,10,12,13,14,16,19,22,25,29,38,60]):
 im=base.copy();d=ImageDraw.Draw(im)
 for x,y,w,h,c in frames[f]:d.rectangle((x,y,x+w-1,y+h-1),fill=c)
 im=im.crop((79,98,143,166)).resize((256,261),Image.Resampling.NEAREST);sheet.paste(im,((i%4)*256,(i//4)*270));ImageDraw.Draw(sheet).text(((i%4)*256+3,(i//4)*270+3),str(f),fill='white')
sheet.save('assets/reviews/hive-kick-scene-poses-v5.png')
walk=json.load(open('assets/reviews/hive-kick-walk-paint.json'))[0]
for frame in walk+frames:
 im=base.copy();d=ImageDraw.Draw(im)
 for x,y,w,h,c in frame:d.rectangle((x,y,x+w-1,y+h-1),fill=c)
 imgs.append(im.crop((74,90,145,168)).resize((426,281),Image.Resampling.NEAREST))
imgs[0].save('assets/reviews/hive-kick-shape-v5.gif',save_all=True,append_images=imgs[1:],duration=90,loop=0)
