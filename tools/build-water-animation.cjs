// Transparent native river patches: the visible water itself is the clipping mask.
const fs=require('fs'),path=require('path'),vm=require('vm'),A=require('../editor/agi-picture.js'),root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8'),project=JSON.parse(read('assets/rooms/bridge-workshop-v1.json')),base=A.render(project.commands);
const river=JSON.parse(read('game/swimming.js').match(/const bridgeRiver=(\[\[[^;]+);/)[1]);
const race=project.commands.filter(c=>c.name==='Mill race'&&c.type==='polygon');
const region=A.render([{type:'polygon',points:river,color:1,outline:1},...race.map(c=>({...c,color:1,outline:1}))]);
const decode=b64=>{const bytes=Buffer.from(b64,'base64'),pixels=[];for(let i=0;i<bytes.length;i+=2)for(let n=0;n<bytes[i];n++)pixels.push(bytes[i+1]);return pixels};
const rotors=vm.runInNewContext(read('game/wheel-pictures.js')+';wheelPictures.bridge').map(decode),water=new Set([1,9,11]);
const mask=new Uint8Array(160*168);
for(let n=0;n<mask.length;n++)if(region[n]===1&&water.has(base[n])&&rotors.every(frame=>water.has(frame[n])))mask[n]=1;
const encode=p=>{const runs=[];for(let i=0;i<p.length;){let end=i+1;while(end<p.length&&p[end]===p[i]&&end-i<255)end++;runs.push(end-i,p[i]);i=end}return Buffer.from(runs).toString('base64')};
const frames=[];
const cycle=12,envelope=[0,1,2,4,6,8,8,6,4,2,1,0];
for(let frame=0;frame<cycle;frame++){
 const pixels=new Uint8Array(mask.length).fill(16);for(let n=0;n<mask.length;n++)if(mask[n])pixels[n]=1;
 const dot=(x,y,c)=>{if(x>=0&&x<160&&y>=0&&y<168&&mask[y*160+x])pixels[y*160+x]=c};
 const streak=(x,y,w,c)=>{for(let n=0;n<w;n++)dot(x+n,y,c)};
 // Staggered packets travel downstream, narrowing into the dark water
 // before wrapping. At both ends of the cycle a packet is invisible, so no
 // highlight ever jumps upstream when the frame index wraps to zero.
 for(const [i,[x,y,w]]of [[83,80,5],[79,91,7],[72,101,8],[84,106,6],[77,133,6],[89,143,7],[71,153,8],[85,161,7]].entries()){
  const life=(frame+i*5)%cycle,width=Math.round(w*envelope[life]/8),yy=y+life-4;
  if(!width)continue;
  const drift=Math.round(Math.sin(life*Math.PI/11))*(i%2?1:-1);
  streak(x+drift,yy,width,9);
  if(i%3===1&&life>=3&&life<=8)streak(x+drift+2,yy+2,Math.min(3,width),11);
 }
 // Mill-race glints use the same quiet emergence/disappearance, staggered
 // along the channel so the whole race never resets together.
 for(const [i,[x,y]]of [[12,91],[17,96],[25,100],[35,101],[43,101]].entries()){
  const life=(frame+i*3)%cycle,width=Math.round(3*envelope[life]/8);
  if(!width)continue;
  streak(x+Math.floor(life/2),y+(x<20?Math.floor(life/3):0),width,life>=3&&life<=8?11:9);
 }
 frames.push(encode(pixels));
}
fs.writeFileSync(path.join(root,'game/water-pictures.js'),'const riverWaterPictures='+JSON.stringify({width:160,height:168,frames})+';\n');
console.log('Built twelve looping river/race cels with staggered disappearing glints and fixed scenery masks.');
