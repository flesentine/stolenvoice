"""Build Alder Pixel from the game's original eight-pixel glyph cells."""
from pathlib import Path
import re,struct,json,base64
root=Path(__file__).resolve().parent.parent
glyphs=json.loads((root/'assets/fonts/alder-pixel-glyphs.json').read_text())
buffer=bytearray(2048)
for char,rows in glyphs.items():
 if len(char)!=1 or ord(char)>255 or len(rows)!=8 or any(not re.fullmatch('[01]{8}',r) for r in rows): raise ValueError('Invalid 8x8 glyph: '+repr(char))
 for row,pattern in enumerate(rows): buffer[ord(char)*8+row]=int(pattern,2)
for code,char in [(24,'^'),(25,'v'),(26,'>'),(27,'<')]: buffer[code*8:code*8+8]=buffer[ord(char)*8:ord(char)*8+8]
bits=bytes(buffer)
(root/'assets/fonts/alder-pixel-8x8.bin').write_bytes(bits)
pack=struct.pack
pad=lambda b:b+b'\0'*((-len(b))%4)
glyphs=[b''];maxpoints=maxcontours=0
for ch in range(256):
 contours=[]
 for row,byte in enumerate(bits[ch*8:ch*8+8]):
  col=0
  while col<8:
   if not byte&(128>>col): col+=1;continue
   start=col
   while col<8 and byte&(128>>col): col+=1
   x,y=start*128,(6-row)*128;w=(col-start)*128
   contours.append([(x,y),(x,y+128),(x+w,y+128),(x+w,y)])
 if not contours:glyphs.append(b'');continue
 points=[p for c in contours for p in c];n=len(points)
 maxpoints=max(maxpoints,n);maxcontours=max(maxcontours,len(contours))
 xs,ys=zip(*points)
 data=pack('>hhhhh',len(contours),min(xs),min(ys),max(xs),max(ys))
 data+=pack('>'+str(len(contours))+'H',*(i*4+3 for i in range(len(contours))))+pack('>H',0)+bytes([1])*n
 for axis in (0,1):
  previous=0
  for point in points:data+=pack('>h',point[axis]-previous);previous=point[axis]
 glyphs.append(pad(data))
offsets=[0];glyf=b''
for glyph in glyphs:glyf+=glyph;offsets.append(len(glyf))
head=bytearray(54)
for offset,fmt,value in [(0,'I',0x10000),(4,'I',0x10000),(12,'I',0x5f0f3cf5),(16,'H',11),(18,'H',1024),(46,'H',8),(48,'h',2),(50,'h',1)]:struct.pack_into('>'+fmt,head,offset,value)
struct.pack_into('>hhhh',head,36,0,-128,1024,896)
hhea=bytearray(36);struct.pack_into('>IhhhHhhh',hhea,0,0x10000,896,-128,0,1024,0,0,1024);struct.pack_into('>h',hhea,18,1);struct.pack_into('>H',hhea,34,len(glyphs))
mapping={ord(bytes([n]).decode('cp437')):n+1 for n in range(32,256)}
for char,n in {'‘':39,'’':39,'“':34,'”':34,'–':45,'—':45,'…':46,'©':67,'↑':24,'↓':25,'→':26,'←':27,'\ufffd':63}.items():mapping[ord(char)]=n+1
items=sorted((u,g) for u,g in mapping.items() if u<65535)+[(65535,0)]
count=len(items);power=2**(count.bit_length()-1)
sub=pack('>7H',4,16+count*8,0,count*2,power*2,power.bit_length()-1,count*2-power*2)
sub+=pack('>'+str(count)+'H',*(u for u,g in items))+pack('>H',0)
sub+=pack('>'+str(count)+'H',*(u for u,g in items))
sub+=pack('>'+str(count)+'H',*((g-u)&65535 for u,g in items))+bytes(count*2)
cmap=pack('>HHHHI',0,1,3,1,12)+sub
names={0:'Original Alder Pixel bitmap glyphs, authored for this game.',1:'Alder Pixel',2:'Regular',3:'AlderPixel-1',4:'Alder Pixel',5:'Version 1.1',6:'AlderPixel'}
records=b'';strings=b''
for identifier,value in names.items():
 b=value.encode('utf-16-be');records+=pack('>6H',3,1,0x409,identifier,len(b),len(strings));strings+=b
name=pack('>3H',0,len(names),6+12*len(names))+records+strings
os2=bytearray(78);struct.pack_into('>HhHH',os2,0,0,1024,400,5);os2[58:62]=b'ALDR';struct.pack_into('>HHHhhhHH',os2,62,64,32,65535,896,-128,0,896,128);struct.pack_into('>I',os2,42,1)
tables={'OS/2':bytes(os2),'cmap':cmap,'glyf':glyf,'head':bytes(head),'hhea':bytes(hhea),'hmtx':pack('>Hh',1024,0)*len(glyphs),'loca':pack('>'+str(len(offsets))+'I',*offsets),'maxp':pack('>I14H',0x10000,len(glyphs),maxpoints,maxcontours,0,0,1,0,0,0,0,0,0,0,0),'name':name,'post':pack('>I',0x30000)+bytes(28)}
checksum=lambda b:sum(struct.unpack('>'+str(len(pad(b))//4)+'I',pad(b)))&0xffffffff
num=len(tables);power=2**(num.bit_length()-1)
header=pack('>I4H',0x10000,num,power*16,power.bit_length()-1,num*16-power*16)
directory=b'';payload=b'';start=12+num*16;headpos=0
for tag,data in sorted(tables.items()):
 offset=start+len(payload)
 if tag=='head':headpos=offset
 directory+=tag.encode()+pack('>3I',checksum(data),offset,len(data));payload+=pad(data)
font=bytearray(header+directory+payload);struct.pack_into('>I',font,headpos+8,(0xb1b0afba-checksum(font))&0xffffffff)
(root/'assets/fonts/alder-pixel.ttf').write_bytes(font)
(root/'assets/fonts/alder-pixel-data.json').write_text(json.dumps({'source':'Original hand-authored Alder Pixel glyphs','bytes':list(bits)}))
print('Built Alder Pixel font: 256 bitmap glyphs and local TrueType wrapper.')
