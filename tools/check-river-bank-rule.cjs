const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');let h=read('tools/check-expanded-adventure.cjs');h=h.slice(0,h.indexOf("check('Eight rooms"));h="const testClock={now:1000};\n"+h.replace('const sandbox={document:','const sandbox={Date:{now:()=>testClock.now},document:').replace('globalThis.game={command,','globalThis.game={riverBankSide,anySwimmingShore,rockBlocksSwimming,woodBlocksSwimming,legacySwimSpace(px,py){return px>=6&&px<=314&&py>=115&&py<=238&&!woodBlocksSwimming(px,py)&&!rockBlocksSwimming(px,py)&&!objectBlocksActor(px,py,4)&&(isBridgeWater(px,py)||isBridgeWater(px-7,py)||isBridgeWater(px+7,py)||isBridgeWater(px,py-2)||isBridgeWater(px,py+2)||anySwimmingShore(px,py))},isBridgeWater,isBridgeDeck,get swim(){return JSON.parse(JSON.stringify(swimState))},tickSwimming,command,');
const s={require,console,Buffer,__dirname};vm.createContext(s);vm.runInContext(h+'\nglobalThis.swimQA={boot,clock:testClock};',s);const {boot,clock}=s.swimQA,base=boot();base.start();base.game.saveGame();const key=base.game.key,save=JSON.parse(base.storage.get(key));
function at(flags={}){clock.now=1000;const data={...save,room:4,flags:{...save.flags,...flags},player:{x:140,y:169,step:1,facing:'right'}};const a=boot(new Map([[key,JSON.stringify(data)]]));a.start();a.game.restoreGame();while(a.game.state.popupOpen)a.game.closeMessage();assert(a.game.canStand(140,169));return a}
function fall(a){a.game.movePlayer(5,0);assert(a.game.swim.active,'step from bridge into current');assert.equal(a.game.swim.remaining,5000);for(const offset of [-5,0,5]){assert(a.game.isBridgeWater(a.game.state.player.x+offset,a.game.state.player.y));assert(!a.game.isBridgeDeck(a.game.state.player.x+offset,a.game.state.player.y),'fall lands off the deck')}}
function tick(a,ms){clock.now+=ms;a.game.tickSwimming()}

function atBank(side,flags={}){clock.now=1000;const data={...save,room:4,flags:{...save.flags,...flags},player:{x:side==='west'?140:180,y:169,step:1,facing:side==='west'?'right':'left'}};const a=boot(new Map([[key,JSON.stringify(data)]]));a.start();a.game.restoreGame();while(a.game.state.popupOpen)a.game.closeMessage();assert(a.game.canStand(a.game.state.player.x,169));for(let n=0;n<8&&!a.game.swim.active;n++)a.game.movePlayer(side==='west'?3:-3,0);assert(a.game.swim.active);assert.equal(a.game.swim.bankSide,side);return a}
function oppositeRoute(a){
 const startX=Math.round(a.game.state.player.x),startY=Math.round(a.game.state.player.y),start=startY*320+startX,previous=new Int32Array(320*240).fill(-1),queue=[start],side=a.game.swim.bankSide;previous[start]=start;let end=-1;
 for(let head=0;head<queue.length;head++){
  const current=queue[head],cx=current%320,cy=Math.floor(current/320);
  if(current!==start&&a.game.anySwimmingShore(cx,cy)&&a.game.riverBankSide(cx,cy)!==side){end=current;break}
  for(const [nx,ny]of [[cx-1,cy],[cx+1,cy],[cx,cy-1],[cx,cy+1]]){if(nx<6||nx>314||ny<115||ny>238)continue;const next=ny*320+nx;if(previous[next]!==-1||!a.game.legacySwimSpace(nx,ny))continue;if(a.game.anySwimmingShore(nx,ny)&&a.game.riverBankSide(nx,ny)===side)continue;previous[next]=current;queue.push(next)}
 }
 assert(end>=0,'a route to the other bank existed under the old swimming rules');const route=[];for(let n=end;n!==start;n=previous[n])route.push([n%320,Math.floor(n/320)]);return route.reverse();
}
for(const side of ['west','east']){
 const a=atBank(side),entry=a.game.swim.waterEntry,before=a.game.state,route=oppositeRoute(a);
 for(const [nx,ny]of route){const p=a.game.state.player;a.game.movePlayer(nx-p.x,ny-p.y);if(a.game.swim.currentWarned)break}
 assert(a.game.swim.active,'cannot land across the river');assert(a.game.swim.currentWarned);assert(a.game.swim.pushback,'current schedules visible motion');
 const pushedFrom={...a.game.state.player};assert(!a.game.state.popupOpen,'message waits for visible current');assert.deepEqual(a.game.state.flags,before.flags);assert.equal(a.game.state.score,before.score);
 tick(a,100);assert(a.game.swim.active);assert.equal(a.game.swim.remaining,5000,'forced animation does not consume reaction time');assert(Math.hypot(a.game.state.player.x-pushedFrom.x,a.game.state.player.y-pushedFrom.y)<=4,'small visible steps');
 let steps=0;while(a.game.swim.active&&steps++<100){const previous=a.game.state.player;tick(a,100);const current=a.game.state.player;assert(Math.hypot(current.x-previous.x,current.y-previous.y)<=4);if(a.game.swim.active){assert(!a.game.woodBlocksSwimming(current.x,current.y));assert(!a.game.rockBlocksSwimming(current.x,current.y))}}
 assert(steps<100);assert(!a.game.swim.dead);assert.equal(a.game.riverBankSide(a.game.state.player.x,a.game.state.player.y),side);assert.match(a.message.replace(/\s+/g,' '),/current.*bank you fell from/);assert.deepEqual(a.game.state.flags,before.flags);assert.equal(a.game.state.score,before.score);
}
for(const phrase of ['swim across','swim to other side','swim to far bank','swim east bank']){const a=atBank('west');a.game.command(phrase);assert(a.game.swim.active);assert(a.game.swim.currentWarned);assert(a.game.swim.pushback);for(let n=0;n<100&&a.game.swim.active;n++)tick(a,100);assert(!a.game.swim.active&&!a.game.swim.dead);assert.match(a.message.replace(/\s+/g,' '),/current/);assert(!a.game.state.flags.bridgePlank)}
const repaired=at({plankTaken:true,bridgePlank:true,twineTaken:true,bridgeFixed:true});for(let i=0;i<15;i++)repaired.game.movePlayer(5,0);assert(!repaired.game.swim.active);assert(repaired.game.state.player.x>=195,'repaired bridge permits actual crossing');
console.log('PASS old swim-bypass routes blocked from both banks, current feedback/pushback, same-bank rescue, no timer reset or story changes, typed crossing refusals and real plank crossing.');
for(const side of ['west','east']){
 const a=atBank(side,{plankTaken:true,bridgePlank:true,twineTaken:true});
 assert.match(a.message.replace(/\s+/g,' '),/loose plank/);
 while(a.game.state.popupOpen)a.game.closeMessage();
 a.game.command('swim to shore');for(let i=0;i<45&&a.game.swim.active;i++)tick(a,100);
 assert(!a.game.swim.active&&!a.game.swim.dead,side+' can recover from loose plank');
 assert.equal(a.game.riverBankSide(a.game.state.player.x,a.game.state.player.y),side);
 assert(a.game.state.flags.bridgePlank);assert(!a.game.state.flags.bridgeFixed);
}
console.log('PASS unsecured plank drops Rosella from either bank and permits same-bank recovery without losing the repair.');
