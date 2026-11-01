// Isolated source-art details for wax and cabinet mechanism, not a game screenshot.
const fs=require('fs'),vm=require('vm'),sharp=require('sharp'),A=require('../editor/agi-picture.js');
const palette=['#000000','#0000aa','#00aa00','#00aaaa','#aa0000','#aa00aa','#aa5500','#aaaaaa','#555555','#5555ff','#55ff55','#55ffff','#ff5555','#ff55ff','#ffff55','#ffffff'];
let pixels;const s={window:{addEventListener(){}},flags:{wheelTurned:false,jarTaken:false},x:{fillStyle:'',fillRect(x,y,w,h){for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)if(xx>=0&&xx<160&&yy>=0&&yy<168)pixels[yy*160+xx]=palette.indexOf(this.fillStyle)}}};
vm.createContext(s);vm.runInContext(fs.readFileSync('game/mill-cabinet.js','utf8')+fs.readFileSync('game/room-priority.js','utf8')+';globalThis.art={drawMillCabinet,drawLooseHiveWax,set(phase,motion){cabinetReleasePhase=phase;cabinetMotion=motion}};',s);
const mill=A.render(JSON.parse(fs.readFileSync('assets/rooms/mill-workshop-v1.json')).commands),orchard=A.render(JSON.parse(fs.readFileSync('assets/rooms/orchard-workshop-v1.json')).commands);
const panels=[];
for(const [phase,motion]of [[0,0],[1,1],[3,1],[0,6]]){
 pixels=mill.slice();s.flags.wheelTurned=motion>0;s.art.set(phase,motion);s.art.drawMillCabinet();panels.push({pixels:pixels.slice(),x:82,y:65,w:56,h:62});
}
pixels=orchard.slice();s.art.drawLooseHiveWax();panels.push({pixels:pixels.slice(),x:94,y:129,w:24,h:19});
const width=56*5,height=62,raw=Buffer.alloc(width*height*3,0);
for(let i=0;i<panels.length;i++){const p=panels[i];for(let y=0;y<p.h;y++)for(let x=0;x<p.w;x++){const c=palette[p.pixels[(p.y+y)*160+p.x+x]];for(let k=0;k<3;k++)raw[(y*width+i*56+x)*3+k]=parseInt(c.slice(1+k*2,3+k*2),16)}}
sharp(raw,{raw:{width,height,channels:3}}).resize(width*4,height*3,{kernel:'nearest',fit:'fill'}).png().toFile('assets/reviews/prop-clues-proof.png').then(()=>console.log('Saved isolated cabinet release cels and ground wax detail.'));
