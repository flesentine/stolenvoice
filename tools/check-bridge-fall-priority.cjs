// Composite native bridge masks with the actual fall/swim actor painters.
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),A=require('../editor/agi-picture.js');
const data=require('./build-object-priorities.cjs')(),timber=data[4].filter(o=>o.id==='bridge-decking'||o.id.startsWith('bridge-supports-')||o.id.startsWith('Bridge post '));
const source=fs.readFileSync('game/swimming.js','utf8'),world=fs.readFileSync('game/expanded-world.js','utf8');
const geometry=source.slice(source.indexOf('const bridgeRepairDeck'),source.indexOf('let bridgeFall'));
const fallPainter=source.slice(source.indexOf('function drawBridgeFallHero'),source.indexOf('\nfunction ',source.indexOf('function drawBridgeFallHero')+1));
const swimPainter=source.slice(source.indexOf('function drawSwimming'),source.indexOf("window.addEventListener('blur'"));
const base=A.render(require('../assets/rooms/bridge-workshop-v1.json').commands),rgba=A.rgba(base),views=require('../assets/rosella-walk-stable-face-v2.json').views;
const palette=new Map(A.palette.map((color,i)=>[color.toLowerCase(),i]));
function scene(frame,side,slipped,swimY=null,old=false,fixed=false,dead=false){
 const pixels=base.slice(),props=[],actor=new Map(),player={x:swimY===194?160:side==='west'?140:180,y:swimY??169,facing:side==='west'?'right':'left'},fall=swimY===null?{frame,bank:player,landing:{x:160,y:194}}:null;let paintingActor=false;
 function canvas(){return{image:null,getContext(){const self=this;return{getImageData(){return{data:new Uint8ClampedArray(rgba)}},putImageData(image){self.image=image}}}}}
 const overlay=commands=>{const p=A.render(commands);for(let i=0;i<p.length;i++)if(p[i]!==15)pixels[i]=p[i]};
 const s={room:4,flags:{bridgePlank:true,bridgeFixed:fixed,bridgePlankSlipped:slipped},player,bridgeFall:fall,swimState:{active:swimY!==null,dead,frame:0},rosellaWalkSprites:views,rosellaColors:A.palette,objectPriorityData:{4:timber},pictureCache:{bridge:canvas()},document:{createElement:canvas},pictureX:n=>Math.round(n/2),pictureY:n=>Math.round(n*.7),prop:(depth,paint)=>props.push({depth,paint}),insidePolygon:()=>false,isBridgeWater:()=>true,isBridgeDeck:()=>false,bridgeWoodAt:()=>false,objectFootprintAt:()=>false,
 poly(points,c){overlay([{type:'polygon',points:points.map(([x,y])=>[Math.round(x/2),Math.round(y*.7)]),color:palette.get(c),outline:null}])},line(x,y,xx,yy,c){overlay([{type:'line',points:[[Math.round(x/2),Math.round(y*.7)],[Math.round(xx/2),Math.round(yy*.7)]],color:palette.get(c)}])},
 x:{fillStyle:'#000000',fillRect(x,y,w,h){for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)if(xx>=0&&xx<160&&yy>=0&&yy<168){const i=yy*160+xx,c=palette.get(this.fillStyle.toLowerCase());pixels[i]=c;if(paintingActor)actor.set(i,c)}},drawImage(image){const p=image.image.data;for(let i=0;i<base.length;i++)if(p[i*4+3])pixels[i]=palette.get('#'+Array.from(p.slice(i*4,i*4+3),n=>n.toString(16).padStart(2,'0')).join(''))}}};
 vm.createContext(s);vm.runInContext(geometry+'\n'+fallPainter+'\n'+swimPainter+'\n'+world.slice(world.indexOf('function drawBridgeRepair'),world.indexOf('const pictureCache={}'))+'\n'+fs.readFileSync('game/room-priority.js','utf8'),s);
 vm.runInContext('drawBridgeRepair();queueRoomObjects()',s);
 if(old)for(const p of props)if(p.depth<=player.y)p.depth=1000;
 props.push({depth:player.y,paint(){paintingActor=true;vm.runInContext(fall?'drawBridgeFallHero()':'drawSwimming(player.x,player.y)',s);paintingActor=false}});
 props.sort((a,b)=>a.depth-b.depth).forEach(p=>p.paint());return{pixels,actor};
}
let overlaps=0;
for(const slipped of [false,true])for(const side of ['west','east'])for(let frame=0;frame<24;frame++){
 const result=scene(frame,side,slipped);
 for(const [i,color]of result.actor){assert.equal(result.pixels[i],color,`bridge clips ${slipped?'slipped':'first'} fall ${side}, frame ${frame}, pixel ${i%160},${Math.floor(i/160)}`);if(timber.some(o=>o.mask.some(([x,y,n])=>y===Math.floor(i/160)&&i%160>=x&&i%160<x+n)))overlaps++}
}
assert(overlaps>0,'fall actor overlaps actual bridge masks');
for(const side of ['west','east']){
 const result=scene(0,side,true,194);for(const [i,color]of result.actor)assert.equal(result.pixels[i],color,'near-side swimmer stays in front');
 const far=scene(0,side,true,174);let hidden=0;
 for(const [i,color]of far.actor)if(far.pixels[i]!==color)hidden++;
 assert(hidden>0,'upstream/under-deck swimmer is still occluded by bridge timber');
}
const wraps=A.render([
 {type:'line',points:[[73,110],[74,116]],color:14},{type:'line',points:[[74,111],[75,116]],color:6},
 {type:'line',points:[[87,110],[88,116]],color:14},{type:'line',points:[[88,111],[89,116]],color:6}
]);
for(const y of [148,210])for(const dead of [false,true]){
 const result=scene(0,'west',false,y,false,true,dead);
 for(let i=0;i<wraps.length;i++)if(wraps[i]===14)assert.equal(result.pixels[i],14,'twine stays visible over timber while '+(dead?'submerged':'swimming')+' at '+i%160+','+Math.floor(i/160));
}
const secured=scene(0,'west',false,210,false,true).pixels;
fs.writeFileSync('assets/reviews/bridge-twine-swimming.json',JSON.stringify({secured:Array.from(secured)}));
fs.writeFileSync('assets/reviews/bridge-fall-priority.json',JSON.stringify({before:Array.from(scene(10,'west',true,null,true).pixels),after:Array.from(scene(10,'west',true).pixels)}));
console.log('PASS native fall compositing: all 24 frames, both banks, first/slipped plank, near-side swimmer and under-deck occlusion.');
