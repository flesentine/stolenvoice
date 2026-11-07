// Review authored art only, using the exact native portrait painter embedded in the game.
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),sharp=require('sharp'),A=require('../editor/agi-picture.js');
const draw=require('./draw-merrin-portrait.cjs');
function painter(picture,source){let pixels;const ctx={fillStyle:'',fillRect(x,y,w,h){assert([x,y,w,h].every(Number.isInteger));assert(x>=0&&y>=0&&x+w<=160&&y+h<=168);const c=A.palette.indexOf(this.fillStyle);assert(c>=0);for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)pixels[yy*160+xx]=c}};const s={atob:v=>Buffer.from(v,'base64').toString('binary'),merrinEndingPicture:picture,elaraColors:A.palette,window:{addEventListener(){}},document:{addEventListener(){}}};vm.createContext(s);vm.runInContext(source+';globalThis.paint=drawMerrinPortrait',s);return(f,end=false)=>{pixels=new Uint8Array(160*168);s.paint(ctx,f,end);return pixels}}
function unpack(encoded){const bytes=Buffer.from(encoded,'base64'),p=[];for(let i=0;i<bytes.length;i+=2)for(let n=0;n<bytes[i];n++)p.push(bytes[i+1]);return Uint8Array.from(p)}
function image(p,w=640,h=336){return sharp(Buffer.from(A.rgba(p)),{raw:{width:160,height:168,channels:4}}).resize(w,h,{fit:'fill',kernel:'nearest'}).png().toBuffer()}
(async()=>{
 const encoded=draw(),paint=painter(encoded,fs.readFileSync('game/merrin-ending.js','utf8')),baseline=paint(0);
 const feature=(x,y)=>(x>=76&&x<=88&&y>=64&&y<=81)||(x>=69&&x<=78&&y>=41&&y<=54)||(x>=80&&x<=87&&y>=33&&y<=44);
 for(let f=0;f<202;f++){
  const p=paint(f);assert.equal(p.length,160*168);assert(p.every(n=>n<16));
  for(let y=0;y<139;y++)for(let x=35;x<=132;x++)if(!feature(x,y)&&!(x>=115&&x<=120&&y>=30&&y<=60))assert.equal(p[y*160+x],baseline[y*160+x],`head, cap, torso and hand contours stay fixed at frame ${f}, pixel ${x},${y}`);
  if(f%67!==61){assert.equal(p[46*160+74],0,'near pupil remains visible between deliberate blinks');assert.equal(p[39*160+84],0,'far pupil remains visible between deliberate blinks')}
  for(let y=139;y<168;y++)assert.equal(p[y*160+159],0,'no unpainted white strip along the portrait edge');
 }
 const source=JSON.parse(fs.readFileSync('assets/rooms/merrin-ending-workshop-v2.json'));A.project(source);assert.deepEqual(unpack(encoded),A.render(source.commands),'runtime portrait equals editable AGI source');
 const frames=[0,2,6,61,62,201],tiles=await Promise.all(frames.map(f=>image(paint(f))));
 await sharp({create:{width:1280,height:1008,channels:4,background:'#000000'}}).composite(tiles.map((input,i)=>({input,left:i%2*640,top:Math.floor(i/2)*336}))).png().toFile('assets/reviews/merrin-native-cels.png');
 // Compare against the previous version at the same real game aspect ratio.
 const old=A.render(JSON.parse(fs.readFileSync('backups/merrin-rebuild-2026-10-27/merrin-ending-workshop-v2.json')).commands),oldRuns=[];for(let i=0;i<old.length;){let j=i+1;while(j<old.length&&old[j]===old[i]&&j-i<255)j++;oldRuns.push(j-i,old[i]);i=j}
 const oldPaint=painter(Buffer.from(oldRuns).toString('base64'),fs.readFileSync('backups/merrin-rebuild-2026-10-27/merrin-ending.js','utf8'));
 await sharp({create:{width:1280,height:336,channels:4,background:'#000000'}}).composite([{input:await image(oldPaint(8)),left:0,top:0},{input:await image(paint(2)),left:640,top:0}]).png().toFile('assets/reviews/merrin-before-after.png');
 // The generated reference stays intact; fit it in the proof beside the authored picture.
 const ref=await sharp('assets/references/merrin-singing-reference-v4.png').resize(640,480,{fit:'contain',background:'#000000'}).png().toBuffer();
 await sharp({create:{width:1280,height:480,channels:4,background:'#000000'}}).composite([{input:ref,left:0,top:0},{input:await image(paint(2)),left:640,top:72}]).png().toFile('assets/reviews/merrin-reference-comparison.png');
 // Animated source-art proof, not a browser capture.
 const gifFrames=[];for(let f=0;f<75;f++){const pixels=paint(f);gifFrames.push(Buffer.from(A.rgba(pixels)))}
 const {execFileSync}=require('child_process');
 execFileSync('/opt/homebrew/bin/ffmpeg',['-v','error','-f','rawvideo','-pixel_format','rgba','-video_size','160x168','-framerate','25/4','-i','pipe:0','-filter_complex','[0:v]scale=640:336:flags=neighbor,split[a][b];[a]palettegen=reserve_transparent=0[p];[b][p]paletteuse=dither=none','-loop','0','-y','assets/reviews/merrin-singing-loop.gif'],{input:Buffer.concat(gifFrames),maxBuffer:4*1024*1024});
 const meta=await sharp('assets/reviews/merrin-singing-loop.gif',{animated:true}).metadata();assert.equal(meta.pages,75);assert.equal(meta.pageHeight,336);
 console.log('PASS 202 native singing cels: fixed anatomy, stable visible pupils, deliberate blinks, EGA16, clean picture edges and exact editable-source/runtime parity.');
})();
