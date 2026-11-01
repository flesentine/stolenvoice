"""Trace approved kick body contours; retain the game's original head at runtime.
Reference is an authoring input only. Cels use native EGA pixels, not a raster.
"""
import json, math
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw
ROOT=Path(__file__).resolve().parents[1]
im=Image.open(ROOT/'assets/references/hive-kick/hive-kick-poses-v1.png').convert('RGB')
# Body-only contour envelopes traced in each 384x341 reference cell. They
# exclude the head and adjacent straw/wood, including the contact shoe overlap.
configs=[
(303,108,[(79,105),(145,104),(161,205),(157,305),(65,305),(64,260)]),
(303,108,[(104,107),(154,108),(163,199),(164,305),(52,309),(53,263)]),
(303,109,[(88,105),(160,106),(170,139),(189,154),(190,183),(160,213),(145,273),(146,305),(91,305),(67,271)]),
(303,108,[(106,103),(176,105),(177,144),(196,144),(196,185),(178,217),(189,236),(169,242),(145,218),(161,183),(148,274),(150,305),(96,305),(91,271)]),
(282,92,[(70,91),(140,88),(168,92),(173,112),(151,135),(185,137),(194,156),(222,165),(237,177),(220,195),(198,194),(182,180),(160,177),(151,234),(135,262),(135,283),(84,283),(71,253)]),
(282,92,[(66,90),(134,88),(162,92),(170,113),(150,136),(184,138),(195,155),(216,162),(234,160),(236,179),(222,197),(201,193),(180,180),(153,179),(146,236),(134,263),(135,283),(84,283),(68,254)]),
(282,92,[(64,90),(133,88),(158,94),(162,114),(151,139),(177,143),(188,156),(211,158),(227,144),(235,150),(231,172),(223,190),(201,186),(181,181),(153,178),(144,236),(132,263),(135,283),(82,283),(63,252)]),
(282,92,[(99,89),(166,87),(173,111),(159,128),(195,126),(201,148),(192,172),(169,188),(185,207),(177,216),(160,206),(145,182),(157,157),(143,252),(141,283),(90,283),(86,247)]),
(271,77,[(72,76),(142,77),(161,167),(161,231),(179,258),(177,274),(128,274),(117,246),(114,269),(67,272),(55,245)]),
(271,77,[(61,75),(135,77),(153,171),(150,257),(143,273),(70,273),(50,246)]),
(271,77,[(65,76),(145,76),(177,135),(177,151),(157,153),(147,144),(158,249),(150,273),(79,273),(51,246),(67,152),(38,147),(40,132)]),
(271,77,[(82,71),(164,71),(168,124),(149,149),(173,246),(164,274),(89,274),(66,246),(84,143),(77,123)])]
cels=[]
for i,(floor,neck,poly) in enumerate(configs):
 row,col=divmod(i,4);a=np.array(im.crop((col*384,row*341,(col+1)*384,min(1024,(row+1)*341)))).astype(int)
 h,w=a.shape[:2];mask=Image.new('1',(w,h));ImageDraw.Draw(mask).polygon(poly,fill=1);mask=np.array(mask)
 r,g,b=a[:,:,0],a[:,:,1],a[:,:,2]
 blue=(b>100)&(b>r*1.3)&(b>g*1.1)&(r<200)
 skin=(r>140)&(r>g*1.2)&(r>b*1.15)&(b<190)&(b>45)&(g>35)
 white=(r>210)&(g>210)&(b>210)
 brown=(r>65)&(g>25)&(r>g*1.25)&(b<g*.85)
 black=(r<75)&(g<75)&(b<75)
 classes=np.full((h,w),-1,int);classes[blue]=9;classes[blue&((r+g)<130)]=1;classes[skin]=12;classes[white]=15;classes[brown&~skin]=6;classes[skin&(np.indices((h,w))[0]>floor-17)]=6;classes[black]=0;classes[~mask]=-1
 # Source sole is the fixed anchor; normalize costume to the original 27 rows.
 sy=27/(floor-neck);sx=sy*.6
 boot_y,boot_x=np.where(brown&mask&(np.indices((h,w))[0]>floor-17)&(np.indices((h,w))[1]<155))
 anchor=float(np.median(boot_x)) if boot_x.size else 108
 dots=[]
 for y in range(-27,1):
  y0=max(0,math.floor(floor+y/sy));y1=min(h,math.ceil(floor+(y+1)/sy))
  for x in range(-9,19):
   x0=max(0,math.floor(anchor+x/sx));x1=min(w,math.ceil(anchor+(x+1)/sx))
   area=classes[y0:y1,x0:x1];valid=area[area>=0]
   if not area.size or valid.size<area.size*.3:continue
   counts=np.bincount(valid,minlength=16);colored=counts.copy();colored[0]=0
   ink=int(colored.argmax()) if colored.sum()>area.size*.22 else 0
   dots.append([x,y,ink])
 cels.append(dots)
(ROOT/'assets/rooms/hive-kick-cels.json').write_text(json.dumps(cels,separators=(',',':'))+'\n')
# Authoring review at the real display pixel aspect, original head added by JS.
print('Traced 12 body cels into',sum(map(len,cels)),'native EGA pixels')
