from pathlib import Path
import json,struct,zlib
w,h=1200,630
pixels=bytearray(bytes((12,21,38))*w*h)
def rect(x,y,ww,hh,c):
 for yy in range(max(0,y),min(h,y+hh)):
  left=max(0,x);right=min(w,x+ww)
  if right>left:pixels[(yy*w+left)*3:(yy*w+right)*3]=bytes(c)*(right-left)
def text(s,y,scale,c):
 glyph=json.loads(Path('assets/fonts/alder-pixel-glyphs.json').read_text());x=(w-len(s)*8*scale)//2
 for ch in s.upper():
  for yy,row in enumerate(glyph.get(ch,glyph[' '])):
   for xx,v in enumerate(row):
    if v=='1':rect(x+xx*scale,y+yy*scale,scale,scale,c)
  x+=8*scale
rect(40,35,1120,4,(167,132,70));rect(40,590,1120,4,(167,132,70))
text('ELARA',68,7,(244,209,112));text('AND THE STOLEN VOICE',145,5,(230,239,222))
# An original geometric castle silhouette, framed by a mirror and heroine.
rect(190,390,510,150,(60,80,77));rect(230,300,90,240,(98,120,110));rect(560,280,90,260,(98,120,110));rect(330,360,210,180,(125,139,113))
for x in [230,260,290,560,590,620]:rect(x,265 if x>500 else 285,18,30,(98,120,110))
for x,y in [(260,335),(590,315),(365,395),(480,395)]:rect(x,y,18,40,(244,209,112))
rect(408,449,58,91,(12,21,38));rect(110,540,980,10,(39,97,72))
rect(800,275,142,240,(167,132,70));rect(812,287,118,216,(87,135,145));rect(826,300,12,170,(177,219,212));rect(845,517,55,12,(167,132,70))
for x,y in [(985,330),(1020,390),(1000,455)]:rect(x,y,8,35,(244,209,112));rect(x-14,y+27,20,12,(244,209,112));rect(x,y,28,6,(244,209,112))
# Stylized auburn-haired heroine in a blue dress.
rect(720,405,24,38,(151,81,44));rect(727,411,12,24,(235,161,125));rect(714,443,36,20,(235,235,213));rect(717,464,30,55,(65,85,221));rect(711,500,42,25,(65,85,221));rect(719,525,10,15,(151,81,44));rect(736,525,10,15,(151,81,44))
def chunk(k,v):return struct.pack('>I',len(v))+k+v+struct.pack('>I',zlib.crc32(k+v)&0xffffffff)
raw=b''.join(b'\0'+pixels[y*w*3:(y+1)*w*3] for y in range(h))
Path('assets/social/share-card-v2.png').write_bytes(b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>IIBBBBB',w,h,8,2,0,0,0))+chunk(b'IDAT',zlib.compress(raw,9))+chunk(b'IEND',b''))
