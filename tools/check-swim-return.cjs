const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');let h=read('tools/check-expanded-adventure.cjs');h=h.slice(0,h.indexOf("check('Eight rooms"));h="const testClock={now:1000};\n"+h.replace('const sandbox={document:','const sandbox={Date:{now:()=>testClock.now},document:').replace('globalThis.game={command,','globalThis.game={riverBankSide,anySwimmingShore,woodBlocksSwimming,legacySwimSpace(px,py){return px>=6&&px<=314&&py>=115&&py<=238&&!woodBlocksSwimming(px,py)&&!objectBlocksActor(px,py,4)&&(isBridgeWater(px,py)||isBridgeWater(px-7,py)||isBridgeWater(px+7,py)||isBridgeWater(px,py-2)||isBridgeWater(px,py+2)||anySwimmingShore(px,py))},isBridgeWater,isBridgeDeck,get swim(){return JSON.parse(JSON.stringify(swimState))},tickSwimming,command,');
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

const cases=[[141,173,3,0],[142,173,3,0],[141,174,3,0],[142,174,3,0],[137,176,0,3],[135,177,0,3],[136,177,0,3],[138,178,0,3],[140,169,5,0],[180,169,-5,0]];
for(const [x,y,dx,dy]of cases)for(const action of ['get out','swim back','swim back to shore','arrow']){
 clock.now=1000;const data={...save,room:4,player:{x,y,step:0,facing:'front'}};const a=boot(new Map([[key,JSON.stringify(data)]]));a.start();a.game.restoreGame();while(a.game.state.popupOpen)a.game.closeMessage();assert(a.game.canStand(x,y,4));for(let i=0;i<8&&!a.game.swim.active;i++)a.game.movePlayer(dx,dy);assert(a.game.swim.active,JSON.stringify([x,y,action]));const side=a.game.swim.bankSide;
 if(action==='arrow'){for(let i=0;i<12&&a.game.swim.active&&!a.game.swim.route?.length;i++)a.game.movePlayer(side==='west'?-3:3,0);assert(a.game.swim.route?.length||!a.game.swim.active,'homeward input finds route')}
 else a.game.command(action);
 let ticks=0;while(a.game.swim.active&&ticks++<45)tick(a,100);
 assert(!a.game.swim.active&&!a.game.swim.dead,JSON.stringify([x,y,action]));assert.equal(a.game.riverBankSide(a.game.state.player.x,a.game.state.player.y),side);assert(!a.game.state.flags.bridgePlank);assert(ticks<45);
}
console.log('PASS 40 rescues from eight former timber pockets plus both bridge edges, GET OUT/SWIM BACK aliases and homeward input, all on original bank within five seconds.');
