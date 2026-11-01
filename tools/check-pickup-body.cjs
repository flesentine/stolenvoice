const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),A=require('../editor/agi-picture.js');let pixels=new Set();
const s={player:{facing:'right'},storyAction:null,rosellaWalkSprites:JSON.parse(fs.readFileSync('assets/rosella-walk-stable-face-v2.json')).views,rosellaColors:A.palette,pictureX:x=>x,pictureY:y=>y,ellipse(){},drawStoryJar(){},x:{fillStyle:'',fillRect(x,y,w,h){assert([x,y,w,h].every(Number.isInteger));for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)pixels.add(xx+','+yy)}}};vm.createContext(s);const effects=fs.readFileSync('game/story-effects.js','utf8');vm.runInContext(fs.readFileSync('game/gallery-room.js','utf8')+effects.slice(effects.indexOf('function storyArc('),effects.indexOf('function storyGlints('))+fs.readFileSync('game/pickup-animation.js','utf8')+';globalThis.qa={pickupPose,drawPickupHero};',s);
let frames=0;for(const facing of ['left','right'])for(const level of ['ground','bench']){
 s.player.facing=facing;let firstFoot=null,stepped=false;
 for(let frame=0;frame<10;frame++){
  s.storyAction={kind:'pickup',frame,total:10,pickupLevel:level,pickup:'rose'};pixels=new Set();s.qa.drawPickupHero(30,60);frames++;
  const queue=[pixels.values().next().value],seen=new Set(queue);for(let n=0;n<queue.length;n++){const[x,y]=queue[n].split(',').map(Number);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const key=(x+dx)+','+(y+dy);if(pixels.has(key)&&!seen.has(key)){seen.add(key);queue.push(key)}}}
  assert.equal(seen.size,pixels.size,'connected silhouette '+facing+' '+level+' '+frame);
  const p=s.qa.pickupPose(30,60),foot=p.pixel(facing==='right'?6:1,39);assert.equal(foot.y,60);if(firstFoot===null)firstFoot=foot.x;else if(foot.x!==firstFoot)stepped=true;
  const a=p.pixel(4,12),b=p.pixel(4,24);assert(Math.abs(Math.hypot(a.x-b.x,a.y-b.y)-12)<1.1,'torso is not stretched');
 }
 assert(stepped,'front foot shifts with the reach');
}
console.log('PASS '+frames+' connected pickup silhouettes, constant torso length, grounded forward step, left/right and ground/bench poses.');
