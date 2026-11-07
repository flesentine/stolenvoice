"""Trace the accepted low-nudge sheet at native resolution.
Keep the original entire upper body and standing endpoints, not a new model.
Authoring reference only: runtime embeds EGA pixel cels, no generated raster.
"""
import json, math, subprocess
from pathlib import Path
import numpy as np
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
im=Image.open(ROOT/'assets/references/hive-kick/v2/candidate-3.png').convert('RGB')
original=json.loads(subprocess.check_output(['node','-e',"process.stdout.write(JSON.stringify(require('./tools/build-elara-stable-face.cjs')().right[1]))"],cwd=ROOT))
# Exact EGA inks. Magenta is solely background and is never shipped as ink.
palette=np.array([[0,0,170],[85,85,255],[255,85,85],[170,85,0],[255,255,255],[255,255,85],[255,0,255]],dtype=int)
inks=[1,9,12,6,15,14,-1]
cels=[]
for i in range(6):
 row,col=divmod(i,3);a=np.array(im.crop((col*512,row*512,(col+1)*512,(row+1)*512))).astype(int)
 classes=np.argmin(((a[:,:,None,:]-palette[None,None,:,:])**2).sum(axis=3),axis=2)
 yy,xx=np.indices(classes.shape)
 shoe=(classes==3)&(yy>360)
 floor=int(yy[shoe].max())+1
 # The left shoe is the stationary supporting leg in the six reference keys.
 anchor=float(np.median(xx[shoe&(xx<260)&(yy>floor-18)]))
 top=int(yy[classes==5].min())
 sy=40/(floor-top);sx=sy*.6
 out={}
 for y in range(-40,0):
  y0=max(0,math.floor(floor+y/sy));y1=min(512,math.ceil(floor+(y+1)/sy))
  for x in range(-7,16):
   x0=max(0,math.floor(anchor+x/sx));x1=min(512,math.ceil(anchor+(x+1)/sx))
   area=classes[y0:y1,x0:x1]
   if not area.size:continue
   counts=np.bincount(area.ravel(),minlength=7);valid=counts[:6]
   if valid.sum()<area.size*.38:continue
   out[x,y]={14:6}.get(inks[int(valid.argmax())],inks[int(valid.argmax())])
 # Restore original identity AND torso/arms, down to the hip. Retain generated
 # contours only below the waist, avoiding a disconnected head/body composite.
 out={p:c for p,c in out.items() if p[1]>=-19}
 for y,line in enumerate(original[:20]):
  for x,c in enumerate(line):
   if c!='.':out[x-4,y-39]=int(c,16)
 # Pin every support shoe to the original sole and original simple flat shape.
 out={p:c for p,c in out.items() if not(p[1]>=-3 and p[0]<=2)}
 for y,line in enumerate(original[36:],36):
  for x,c in enumerate(line):
   if c!='.' and x<=4:out[x-4,y-39]=int(c,16)
 # Lift the active side of the cloth and connected shoe around the hip.
 # Horizontal reach and support leg stay fixed; full contact meets straw,
 # rather than the low wooden stand. Re-register after tracing, not at render.
 lift=[0,2,6,11,5,0][i]
 if lift:
  out={(x,max(-19,y-round(lift*min(x,8)/8)) if x>0 and y>=-19 else y):c for (x,y),c in out.items()}
 # Endpoints are exactly the original standing sprite, with no model-size pop.
 if i in (0,5):out={(x-4,y-39):int(c,16) for y,line in enumerate(original) for x,c in enumerate(line) if c!='.'}
 cels.append([[x,y,c] for (x,y),c in sorted(out.items(),key=lambda p:(p[0][1],p[0][0]))])
(ROOT/'assets/rooms/hive-kick-cels.json').write_text(json.dumps(cels,separators=(',',':'))+'\n')
print('Traced six low-kick cels with original upper body and standing endpoints.')
