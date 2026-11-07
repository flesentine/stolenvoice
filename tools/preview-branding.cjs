// Render the actual title painter to a PNG using a small software canvas.
const fs=require('fs'),vm=require('vm'),zlib=require('zlib'),A=require('../editor/agi-picture.js');
class Canvas{
 constructor(){this.width=320;this.height=200;this.data=new Uint8Array(320*200);this.style={};const c=this;this.ctx={fillStyle:'#000000',fillRect(x,y,w,h){const ink=A.palette.indexOf(this.fillStyle.toLowerCase());for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)if(xx>=0&&xx<c.width&&yy>=0&&yy<c.height)c.data[yy*c.width+xx]=Math.max(0,ink)},drawImage(s,x,y,w=s.width,h=s.height){for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++)c.data[(y+yy)*c.width+x+xx]=s.data[Math.floor(yy*s.height/h)*s.width+Math.floor(xx*s.width/w)]}}}
 getContext(){return this.ctx}
}
const canvas=new Canvas(),font=fs.readFileSync('assets/fonts/alder-pixel-8x8.bin'),button={style:{},setAttribute(){}};
const s={window:{matchMedia:()=>({matches:true})},document:{querySelector:id=>id==='#intro-picture'?canvas:button},decodePicture(data){const c=new Canvas();c.width=160;c.height=168;c.data=new Uint8Array(160*168);const bytes=Buffer.from(data,'base64');let at=0;for(let i=0;i<bytes.length;i+=2){c.data.fill(bytes[i+1],at,at+bytes[i]);at+=bytes[i]}return c},blitText(ctx,t,x,y,color){ctx.fillStyle=color;for(let n=0;n<t.length;n++)for(let yy=0;yy<8;yy++)for(let xx=0;xx<8;xx++)if(font[t.charCodeAt(n)*8+yy]&(128>>xx))ctx.fillRect(x+n*8+xx,y+yy,1,1)}};
vm.createContext(s);vm.runInContext(fs.readFileSync('game/opening-picture.js','utf8')+fs.readFileSync('game/opening-screen.js','utf8')+';paintOpening()',s);
function crc(b){let n=0xffffffff;for(const v of b){n^=v;for(let i=0;i<8;i++)n=(n>>>1)^((n&1)?0xedb88320:0)}return(n^0xffffffff)>>>0}
function chunk(tag,b){const type=Buffer.from(tag),size=Buffer.alloc(4),sum=Buffer.alloc(4);size.writeUInt32BE(b.length);sum.writeUInt32BE(crc(Buffer.concat([type,b])));return Buffer.concat([size,type,b,sum])}
const scale=3,w=320*scale,h=200*scale,raw=Buffer.alloc(h*(1+w*3));for(let y=0;y<h;y++)for(let x=0;x<w;x++){const rgb=A.palette[canvas.data[Math.floor(y/scale)*320+Math.floor(x/scale)]].slice(1);for(let k=0;k<3;k++)raw[y*(1+w*3)+1+x*3+k]=parseInt(rgb.slice(k*2,k*2+2),16)}
const header=Buffer.alloc(13);header.writeUInt32BE(w);header.writeUInt32BE(h,4);header[8]=8;header[9]=2;fs.writeFileSync('assets/reviews/branding-title.png',Buffer.concat([Buffer.from('89504e470d0a1a0a','hex'),chunk('IHDR',header),chunk('IDAT',zlib.deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]));
console.log('Rendered actual title painter to assets/reviews/branding-title.png');
