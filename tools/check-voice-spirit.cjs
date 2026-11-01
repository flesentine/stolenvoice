// Isolated native sprite cels, independent of room rendering.
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),A=require('../editor/agi-picture.js');
let pixels;const frames=[];
const c={window:{addEventListener(){}},x:{fillStyle:'',fillRect(x,y,w,h){assert([x,y,w,h].every(Number.isInteger));const ink=A.palette.indexOf(this.fillStyle);assert(ink>=0);for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++){assert(xx>=0&&xx<160&&yy>=0&&yy<168);pixels[yy*160+xx]=ink}}}};
vm.createContext(c);vm.runInContext(fs.readFileSync('game/story-effects.js','utf8')+';globalThis.paint=drawVoiceWisp;',c);
for(let cel=0;cel<8;cel++){pixels=new Uint8Array(160*168).fill(5);c.paint(80,150,'#ffff55',cel*3);assert.equal(pixels[150*160+80],15,'steady white breath core');assert.equal(pixels[145*160+81],5,'no musical stem');assert(pixels.every(p=>p<16));frames.push(pixels)}
assert(new Set(frames.map(p=>Buffer.from(p).toString('base64'))).size>=6,'tail changes shape');
if(process.argv.includes('--preview')){const sharp=require('sharp');(async()=>{const tiles=[];for(const frame of frames){const rgb=Buffer.alloc(32*24*4);for(let yy=0;yy<24;yy++)for(let xx=0;xx<32;xx++){const color=A.palette[frame[(yy+141)*160+xx+64]];for(let k=0;k<3;k++)rgb[(yy*32+xx)*4+k]=parseInt(color.slice(1+k*2,3+k*2),16);rgb[(yy*32+xx)*4+3]=255}tiles.push(await sharp(rgb,{raw:{width:32,height:24,channels:4}}).resize(192,144,{kernel:'nearest'}).png().toBuffer())}await sharp({create:{width:1536,height:144,channels:4,background:'#000'}}).composite(tiles.map((input,i)=>({input,left:i*192,top:0}))).png().toFile('assets/reviews/voice-spirit-cels.png')})()}
console.log('PASS eight native EGA voice cels: steady breath core, streaming filaments and outward pulses and no bottom-edge clipping.');
