"""Render a bitmap-font proof without browser or image-library dependencies."""
from pathlib import Path
import struct,zlib
root=Path(__file__).resolve().parent.parent
font=(root/'assets/fonts/alder-pixel-8x8.bin').read_bytes()
scale=3;w=320*scale;h=154*scale;pixels=bytearray(bytes((0,0,0))*w*h)
def text(s,y,color=(255,255,255)):
 for n,c in enumerate(s):
  for yy in range(8):
   for xx in range(8):
    if font[ord(c)*8+yy]&(128>>xx):
     x=(8+n*8+xx)*scale;top=(y+yy)*scale
     for dy in range(scale):
      for dx in range(scale):
       p=((top+dy)*w+x+dx)*3;pixels[p:p+3]=bytes(color)
text('ALDER PIXEL 1.1',8,(255,255,85))
for s,y in [('ABCDEFGHIJKLMNOPQRSTUVWXYZ',25),('abcdefghijklmnopqrstuvwxyz',37),('0123456789  !?.,:; \'" () []',49),('Elara and the Stolen Voice',70),('You are Princess Elara of Alderwick.',84),('The quick brown fox jumps over',98),('the lazy dog. Merrin sings again.',110),('> look at the enchanted mirror',132)]:text(s,y)
def chunk(k,b):return struct.pack('>I',len(b))+k+b+struct.pack('>I',zlib.crc32(k+b)&0xffffffff)
raw=b''.join(b'\0'+pixels[y*w*3:(y+1)*w*3] for y in range(h))
out=root/'assets/reviews/alder-font-v1-1.png'
out.write_bytes(b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>IIBBBBB',w,h,8,2,0,0,0))+chunk(b'IDAT',zlib.compress(raw,9))+chunk(b'IEND',b''))
print(out)
