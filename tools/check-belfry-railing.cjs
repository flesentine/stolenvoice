const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),A=require('../editor/agi-picture.js');
const data=require('./build-object-priorities.cjs')(),objects=data[7]||[];
assert.equal(objects.filter(o=>o.id.startsWith('belfry-stair-')).length,3,'belfry stair posts and handrail need independent priorities');
const project=require('../assets/rooms/belfry-workshop-v1.json'),base=A.render(project.commands),rgba=A.rgba(base),views=require('../assets/elara-walk-stable-face-v2.json').views;
const palette=new Map(A.palette.map((color,i)=>[color.toLowerCase(),i]));
function scene(y,priority=true){
 const pixels=base.slice(),props=[],actor=[];let depth=0;
 const rows=views.back[1],left=12,top=Math.round(y*.7)-39;
 for(let row=0;row<40;row++)for(let col=0;col<8;col++)if(rows[row][col]!=='.')actor.push([(top+row)*160+left+col,parseInt(rows[row][col],16)]);
 function canvas(){return{image:null,getContext(){const self=this;return{getImageData(){return{data:new Uint8ClampedArray(rgba)}},putImageData(image){self.image=image}}}}}
 const sandbox={queueBelfryBell(){},room:7,flags:{},swimState:{},bridgeFall:null,objectPriorityData:data,pictureCache:{belfry:canvas()},document:{createElement:canvas},prop:(value,paint)=>props.push({depth:value,paint}),x:{drawImage(image){const p=image.image.data;for(let i=0;i<base.length;i++)if(p[i*4+3]){const color='#'+Array.from(p.slice(i*4,i*4+3),n=>n.toString(16).padStart(2,'0')).join('');pixels[i]=palette.get(color)}}}};
 if(priority)vm.runInNewContext(fs.readFileSync('game/room-priority.js','utf8')+';queueRoomObjects()',sandbox);
 props.push({depth:y,paint(){for(const [i,color]of actor)pixels[i]=color}});props.sort((a,b)=>a.depth-b.depth).forEach(p=>{depth=p.depth;p.paint()});return{pixels,actor};
}
for(const y of [185,203,220]){
 const {pixels,actor}=scene(y);let overlap=0;
 for(const [i,color]of actor){
  const xx=i%160,yy=Math.floor(i/160),front=objects.some(o=>o.depth>=y&&o.mask.some(([x,sy,n])=>sy===yy&&xx>=x&&xx<x+n));
  if(front){assert.equal(pixels[i],base[i],'foreground timber covers actor at '+xx+','+yy);overlap++}else assert.equal(pixels[i],color,'actor in front remains visible');
 }
 if(y<206)assert(overlap>0,'actual stair overlap exercised');
}
const posts=objects.filter(o=>o.id.includes('post'));assert(posts.every(o=>o.footprint.length===4));assert.equal(objects.find(o=>o.id==='belfry-stair-handrail').footprint.length,4,'narrow floor projection makes handrail solid');
fs.writeFileSync('assets/reviews/belfry-railing-priority.json',JSON.stringify({before:Array.from(scene(185,false).pixels),after:Array.from(scene(185).pixels)}));
console.log('PASS actual belfry queue compositing: behind/between/in front of stair posts, opaque timber-only masks, narrow post feet and preserved stair approach.');
let h=fs.readFileSync('tools/check-expanded-adventure.cjs','utf8').split("check('Eight rooms")[0];
h=h.replace('globalThis.game={command,','globalThis.game={place(x,y){room=7;player={x,y,step:0,facing:"front"}},command,');
const runtime={require,console,Buffer,__dirname};vm.createContext(runtime);vm.runInContext(h+';globalThis.qa={boot}',runtime);
for(const [startY,dy]of [[192,3],[220,-3]]){
 const a=runtime.qa.boot();a.start();a.game.place(20,startY);assert(a.game.canStand(20,startY));
 for(let n=0;n<15;n++)a.game.movePlayer(0,dy);
 assert.equal(a.game.state.room,7);assert(dy>0?a.game.state.player.y<207:a.game.state.player.y>201,'cannot walk through either side of rail');
}
const stairs=runtime.qa.boot();stairs.start();stairs.game.place(56,190);
for(let n=0;n<10;n++)stairs.game.movePlayer(0,3);
assert.equal(stairs.game.state.player.y,220,'open end remains passable');
for(let n=0;n<18&&stairs.game.state.room===7;n++)stairs.game.movePlayer(-3,0);
assert.equal(stairs.game.state.room,1,'walk around railing to gallery stair exit');
console.log('PASS real movement blocks both sides of railing and preserves open-end route to gallery stairs.');
