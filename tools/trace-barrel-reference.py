"""Trace the approved imagegen contours into EGA cels, with explicit masks.
Area coverage retains the reference silhouette instead of drawing joint sticks.
The reference images are authoring inputs; the game ships only indexed runs.
"""
import json, math
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter
ROOT=Path(__file__).resolve().parents[1]
REF=ROOT/'assets/references/barrel-animation'
STAGES=['stand','step','grip','lean','overbalance','tip','invert','kick','kick','sink','last-shoes','hidden','peek','shake','shake','shake','shake','push','straddle','lower','land','tug','release','wipe-face','brush-bodice','brush-skirt','clean','step-away']

def trace_cell(rgb,sy,frame):
 h,w=rgb.shape[:2];a=rgb.astype(int);r,g,b=a[:,:,0],a[:,:,1],a[:,:,2]
 gray=(abs(r-g)<12)&(abs(r-b)<12)&(r>90)&(r<215);gray[:,:170]=False;gray[:,320:]=False
 ys=np.where(gray.sum(axis=1)>40)[0];groups=[]
 for y in ys:
  if not groups or y>groups[-1][-1]+1:groups.append([int(y)])
  else:groups[-1].append(int(y))
 assert len(groups)>=2,(frame,groups)
 rim=groups[0][0]-32;last=groups[-1];cx=float(np.where(gray[last[len(last)//2]])[0].mean())
 blue=(b>110)&(b>r*1.3)&(b>g*1.1)&(r<210)
 hair=(r>165)&(g>140)&(b<180)&(r<g*1.5)
 skin=(r>150)&(r>g*1.18)&(r>b*1.2)&(b>55)&(b<200)
 white=(r>215)&(g>215)&(b>215)
 # Color alone cannot separate yellow wood highlights from blonde hair.
 yygrid,xxgrid=np.indices((h,w));by,bx=np.where(blue)
 if bx.size:
  garment=(xxgrid>=bx.min()-22)&(xxgrid<=bx.max()+22)&(yygrid>=by.min()-35)&(yygrid<=by.max()+8)
  white &= garment
  hair &= (yygrid<by.min()+16)&(xxgrid>=bx.min()-40)&(xxgrid<=bx.max()+40)
 if 25<=frame<=55:hair[:]=False
 primary=blue|hair|skin|white
 # Hoops and barrel wood are excluded, even when they touch a hand.
 brown=(r>65)&(g>20)&(r>g*1.3)&(b<g*.8)
 contact=np.array(Image.fromarray((skin*255).astype('uint8')).filter(ImageFilter.MaxFilter(9)))>0
 seen=np.zeros((h,w),bool);boots=np.zeros((h,w),bool)
 for yy,xx in zip(*np.where(brown)):
  if seen[yy,xx]:continue
  q=[(int(xx),int(yy))];seen[yy,xx]=True;component=[];touch=False
  while q:
   x,y=q.pop();component.append((x,y));touch=touch or bool(contact[y,x])
   for nx,ny in ((x-1,y),(x+1,y),(x,y-1),(x,y+1)):
    if 0<=nx<w and 0<=ny<h and brown[ny,nx] and not seen[ny,nx]:seen[ny,nx]=True;q.append((nx,ny))
  if touch and len(component)<1600:
   # Boots or dirt outside the wooden barrel envelope, never a stave.
   outside=sum(x<cx-58 or y<rim-12 for x,y in component)/len(component)
   if outside>.8:
    for x,y in component:boots[y,x]=True
 mask=primary|boots
 nearby=np.array(Image.fromarray((mask*255).astype('uint8')).filter(ImageFilter.MaxFilter(7)))>0
 outline=(r<65)&(g<65)&(b<65)&nearby
 # Skin-colored pixels inside the wooden barrel are absent in the reference;
 # its blue exterior cloth and linen remain part of the traced silhouette.
 classes=np.full((h,w),-1,int)
 classes[skin]=12;classes[hair]=14;classes[white]=15;classes[blue]=9;classes[blue&((r+g)<130)]=1;classes[boots]=6;classes[outline]=0
 sx=sy*.6;out={}
 for yy in range(65,145):
  y0=max(0,int(math.floor(rim+(yy-102)/sy)));y1=min(h,int(math.ceil(rim+(yy+1-102)/sy)))
  if y1<=y0:continue
  for xx in range(108,151):
   x0=max(0,int(math.floor(cx+(xx-138)/sx)));x1=min(w,int(math.ceil(cx+(xx+1-138)/sx)))
   if x1<=x0:continue
   region=classes[y0:y1,x0:x1];valid=region[region>=0]
   if valid.size<region.size*.28:continue
   counts=np.bincount(valid,minlength=16)
   colored=counts.copy();colored[0]=0
   color=int(colored.argmax()) if colored.sum()>=region.size*.18 else 0
   out[(xx,yy)]=color
 # Small eye marks use the reference's face direction rather than importing
 # noisy high-resolution facial outlines. All other contours come from image.
 skinpoints=[p for p,c in out.items() if c==12]
 if frame not in range(25,60) and skinpoints:
  # Find face next to yellow hair; hands/legs are not candidates.
  candidates=[p for p in skinpoints if any(out.get((p[0]+dx,p[1]+dy))==14 for dx,dy in ((-1,0),(1,0),(0,-1)))]
  if candidates:
   ty=min(p[1] for p in candidates);face=[p for p in candidates if p[1]<=ty+4]
   eye=max(face,key=lambda p:p[0]) if frame<85 else min(face,key=lambda p:p[0])
   if out.get(eye)==12:out[eye]=1
 # Standing poses after the climb use the actor's feet, not varying barrel
 # sizes in the generated sheet, as their stable floor registration.
 if frame>=100 and out:
  bottom=max(y for x,y in out);dx=round(124-np.median([x for (x,y),c in out.items() if c in (1,9)]));dy=134-bottom
  out={(x+dx,y+dy):c for (x,y),c in out.items()}
 # Discard disconnected color flecks from the prop, not actor contours.
 unseen=set(out)
 while unseen:
  first=unseen.pop();component=[first];queue=[first]
  while queue:
   x,y=queue.pop()
   for dx,dy in ((-1,-1),(0,-1),(1,-1),(-1,0),(1,0),(-1,1),(0,1),(1,1)):
    p=(x+dx,y+dy)
    if p in unseen:unseen.remove(p);queue.append(p);component.append(p)
  if len(component)<3:
   for p in component:out.pop(p,None)
 if frame<=85:out={p:c for p,c in out.items() if not(p[0]>=132 and p[1]>=114)}
 if frame in (90,95):out={p:c for p,c in out.items() if not(p[0]>=134 and p[1]>=111)}
 if frame>=100:out={p:c for p,c in out.items() if p[0]<133}
 if frame==55:out={}
 runs=[]
 for y in sorted(set(y for x,y in out)):
  xs=sorted(x for x,yy in out if yy==y);i=0
  while i<len(xs):
   start=xs[i];c=out[(start,y)];end=start+1;i+=1
   while i<len(xs) and xs[i]==end and out[(xs[i],y)]==c:end+=1;i+=1
   runs.append([start,y,end-start,c])
 points=list(out);floor=max((y for x,y in points),default=102)
 return dict(frame=frame,stage=STAGES[frame//5],runs=runs,head=None,arms=[],legs=[],inside=False,anchorX=124,floor=floor,sourceRegistration=[round(cx,2),rim,sy])

cels=[]
for name,edges,sy,start in [('fall-every-five-v1.png',[0,256,512,768,1024],.1923,0),('climb-every-five-v1.png',[0,320,650,1024],.15,80)]:
 rgb=np.array(Image.open(REF/name).convert('RGB'))
 for i in range((len(edges)-1)*4):
  f=start+i*5
  row,col=divmod(i,4);cel=trace_cell(rgb[edges[row]:edges[row+1],col*384:(col+1)*384],sy,f);cels.append(cel)
assert len(cels)==28
(ROOT/'assets/rooms/barrel-reference-cels.json').write_text(json.dumps(cels,separators=(',',':'))+'\n')
print('Traced 28 image-contour EGA cels.')
