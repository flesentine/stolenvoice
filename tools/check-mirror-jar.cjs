// Native prop-only rendering; no game screenshot or room raster.
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),A=require('../editor/agi-picture.js');
const stable=JSON.parse(fs.readFileSync('assets/rosella-walk-stable-face-v2.json')).views;
const short=fs.readFileSync('stolen-voice-short.html','utf8'),colors=JSON.parse(short.match(/const rosellaColors=(\[[^\n]+\]);/)[1]);
let dots=[];const s={window:{addEventListener(){}},player:{x:144,y:190,step:0,facing:'back'},rosellaWalkSprites:stable,rosellaColors:colors,pictureX:x=>Math.round(x/2),pictureY:y=>Math.round(y*.7),x:{fillStyle:'',fillRect(x,y,w,h){assert([x,y,w,h].every(Number.isInteger));assert(A.palette.includes(this.fillStyle));for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++){assert(xx>=0&&xx<160&&yy>=0&&yy<168);dots.push([xx,yy,this.fillStyle])}}}};
const world=fs.readFileSync('game/expanded-world.js','utf8');vm.createContext(s);vm.runInContext(world.slice(world.indexOf('function insidePolygon('),world.indexOf('function canStand('))+fs.readFileSync('game/gallery-room.js','utf8')+fs.readFileSync('game/story-effects.js','utf8')+';globalThis.qa={set(frame){storyAction={kind:"voiceOffered",frame}},mirrorJarPose,drawMirrorHandJar,drawStoryMirrorJar,drawMirrorJarExchange,insidePolygon,glass:mirrorGlassClip};',s);
const q=s.qa;let previous=null;const cels=[];
for(let frame=0;frame<50;frame++){
 q.set(frame);const pose=q.mirrorJarPose();assert.equal(pose.width,8);assert.equal(pose.height,12);if(previous){assert.equal(pose.left,previous.left);assert(Math.abs(pose.top-previous.top)<=1)}previous=pose;
 dots=[];q.drawStoryMirrorJar();assert(dots.length>20);for(const[x,y]of dots)assert(q.insidePolygon(x,y,q.glass),'reflected jar and hand clipped');
 dots=[];q.drawMirrorHandJar(pose,false,false);assert(dots.length>40);for(const[x,y]of dots)assert(x>=pose.left&&x<pose.left+8&&y>=pose.top&&y<pose.top+12);q.drawStoryMirrorJar();q.drawMirrorJarExchange(frame);cels.push(dots.slice());
}
assert.notDeepEqual(cels[12],cels[13],'light travels');assert.notDeepEqual(cels[2],cels[20],'ritual develops');
if(process.argv.includes('--preview')){const sharp=require('sharp'),palette=A.palette,imgs=[];(async()=>{for(const f of [0,12,24,40]){const rgb=Buffer.alloc(40*70*3);for(const[x,y,ink]of cels[f]){const xx=x-54,yy=y-52;if(xx<0||xx>=40||yy<0||yy>=70)continue;for(let k=0;k<3;k++)rgb[(yy*40+xx)*3+k]=parseInt(ink.slice(1+k*2,3+k*2),16)}imgs.push(await sharp(rgb,{raw:{width:40,height:70,channels:3}}).resize(160,210,{kernel:'nearest',fit:'fill'}).png().toBuffer())}await sharp({create:{width:640,height:210,channels:3,background:'#000'}}).composite(imgs.map((input,i)=>({input,left:i*160,top:0}))).png().toFile('assets/reviews/mirror-jar-prop-proof.png')})()}
console.log('PASS 50 native EGA mirror-exchange cels, small 8x12 held jar, matched 6x10 reflection, intact clipping, gentle lift and traveling light.');
