const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');let h=read('tools/check-expanded-adventure.cjs');h=h.slice(0,h.indexOf("check('Eight rooms"));h="const testClock={now:1000};\n"+h.replace('const sandbox={document:','const sandbox={Date:{now:()=>testClock.now},document:').replace('globalThis.game={command,','globalThis.game={woodBlocksSwimming,swimmingSpace,swimmingShore,placeSwimmer(x,y){resetSwimming();room=4;player={x,y,step:0,facing:"front"};swimState.active=true;swimState.lastTick=Date.now();playing=true},isBridgeWater,isBridgeDeck,get swim(){return JSON.parse(JSON.stringify(swimState))},tickSwimming,command,');
const s={require,console,Buffer,__dirname};vm.createContext(s);vm.runInContext(h+'\nglobalThis.swimQA={boot,clock:testClock};',s);const {boot,clock}=s.swimQA,base=boot();base.start();base.game.saveGame();const key=base.game.key,save=JSON.parse(base.storage.get(key));
function at(flags={}){clock.now=1000;const data={...save,room:4,flags:{...save.flags,...flags},player:{x:140,y:169,step:1,facing:'right'}};const a=boot(new Map([[key,JSON.stringify(data)]]));a.start();a.game.restoreGame();while(a.game.state.popupOpen)a.game.closeMessage();assert(a.game.canStand(140,169));return a}
function fall(a){a.game.movePlayer(5,0);assert(a.game.swim.active,'step from bridge into current');assert.equal(a.game.swim.remaining,5000);for(const offset of [-5,0,5]){assert(a.game.isBridgeWater(a.game.state.player.x+offset,a.game.state.player.y));assert(!a.game.isBridgeDeck(a.game.state.player.x+offset,a.game.state.player.y),'fall lands off the deck')}}
function tick(a,ms){clock.now+=ms;a.game.tickSwimming()}

const data=require('./build-object-priorities.cjs')(),a=at(),wood=data[4].filter(o=>(o.id==='bridge-decking'||o.id.startsWith('bridge-supports-')));
let contacts=0;
for(const object of wood)for(const side of ['left','right']){
 const mask=new Set();for(const [left,top,length]of object.mask)for(let n=left;n<left+length;n++)if((side==='left')===(n<80))mask.add(top*160+n);
 if(!mask.size)continue;
 const overlaps=(x,y)=>[-7,-3,0,3,7].some(offset=>mask.has(Math.round(y*.7)*160+Math.round((x+offset)/2)));
 const hits=new Map();
 for(let y=145;y<210;y++)for(let x=90;x<230;x++){
  if(!a.game.swimmingSpace(x,y)||a.game.swimmingShore(x,y)||a.game.woodBlocksSwimming(x,y))continue;
  for(const [dx,dy]of [[3,0],[-3,0],[0,3],[0,-3]]){
   if(!overlaps(x+dx,y+dy)||hits.has(dx+','+dy))continue;
   a.game.placeSwimmer(x,y);const before=a.game.state;a.game.movePlayer(dx,dy);
   assert.equal(a.game.state.player.x,x,object.id+' '+side+' blocks x');assert.equal(a.game.state.player.y,y,object.id+' '+side+' blocks y');assert(a.game.swim.active);assert.deepEqual(a.game.state.flags,before.flags);assert.equal(a.game.state.score,before.score);hits.set(dx+','+dy,true);contacts++;
  }
 }
 assert(hits.size>=2,object.id+' '+side+' has multiple tested approaches');
}
for(const dx of [-100,100]){a.game.placeSwimmer(160,169);a.game.movePlayer(dx,0);assert.equal(a.game.state.player.x,160,'cannot sweep through either deck to a distant bank')}
// The repaired center is also solid to a swimmer, yet supports walking above.
const repaired=at({plankTaken:true,bridgePlank:true});repaired.game.placeSwimmer(160,152);assert(repaired.game.swimmingSpace(160,152));repaired.game.movePlayer(0,8);assert.equal(repaired.game.state.player.y,152,'repair plank blocks from upstream');
repaired.game.placeSwimmer(160,184);assert(repaired.game.swimmingSpace(160,184));repaired.game.movePlayer(0,-10);assert.equal(repaired.game.state.player.y,184,'repair plank blocks from downstream');
for(const side of [-1,1]){
 const escape=at();escape.game.placeSwimmer(side<0?157:163,169);escape.game.command('get out');
 for(let i=0;i<45&&escape.game.swim.active;i++)tick(escape,100);
 assert(!escape.game.swim.active&&!escape.game.swim.dead,'escape around '+(side<0?'left':'right')+' bridge edge');assert(!escape.game.isBridgeDeck(escape.game.state.player.x,escape.game.state.player.y));
}
console.log('PASS '+contacts+' deck/support contacts on both halves, swept swim barriers, repaired plank both directions and bank routes within five seconds.');
