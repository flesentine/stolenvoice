const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
let h=fs.readFileSync('tools/check-expanded-adventure.cjs','utf8').split("check('Eight rooms")[0];
h='const testClock={now:1000};\n'+h.replace('const sandbox={document:','const sandbox={Date:{now:()=>testClock.now},document:').replace('globalThis.game={command,',`
globalThis.game={placeUpstream(x,y,side,remaining){resetSwimming();player={x,y,step:0,facing:'front'};swimState.active=true;swimState.remaining=remaining;swimState.lastTick=Date.now();swimState.bankSide=side;swimState.bank={x:side==='west'?140:180,y:169,step:0,facing:'front'}},get swim(){return JSON.parse(JSON.stringify(swimState))},beginSwimming,placeWalking(x,y){resetSwimming();player={x,y,step:0,facing:"front"}},tickSwimming,walkTick,swimmingSpace,moveSwimming,woodBlocksSwimming,rockBlocksSwimming,riverBankSide,command,`);
const s={require,console,Buffer,__dirname};vm.createContext(s);vm.runInContext(h+';globalThis.qa={boot,clock:testClock}',s);
const {boot,clock}=s.qa,base=boot();base.start();base.game.saveGame();const key=base.game.key,save=JSON.parse(base.storage.get(key));
function at(side,state,x,y,budget=2000){const flags={...save.flags,plankTaken:true,bridgePlank:state!=='broken',bridgeFixed:state==='lashed'};const a=boot(new Map([[key,JSON.stringify({...save,room:4,flags,player:{x:140,y:169,step:0,facing:'right'}})]]));a.start();a.game.restoreGame();while(a.game.state.popupOpen)a.game.closeMessage();a.game.placeUpstream(x,y,side,budget);return a;}
let count=0,underDeck=0;
for(const side of ['west','east'])for(const state of ['broken','loose','lashed'])for(const [x,y]of [[160,150],[190,150]])for(const command of ['swim across','swim to shore']){
 clock.now=1000;const a=at(side,state,x,y,command==='swim across'?2000:8000),before=a.game.state;
 a.game.command(command);assert(!a.game.state.popupOpen,'return begins rather than showing a no-route warning');
 if(a.game.swim.pushback?.underBridge)underDeck++;
 for(let n=0;n<65&&a.game.swim.active;n++){
  const forced=!!a.game.swim.pushback,remaining=a.game.swim.remaining;
  clock.now+=100;a.game.tickSwimming();
  if(a.game.swim.active){
   assert(!a.game.woodBlocksSwimming(a.game.state.player.x,a.game.state.player.y,true),'never crosses piers');
   assert(!a.game.rockBlocksSwimming(a.game.state.player.x,a.game.state.player.y),'never crosses rocks');
   if(forced)assert.equal(a.game.swim.remaining,remaining,'forced current preserves reaction time');
  }
 }
 assert(!a.game.swim.active&&!a.game.swim.dead,side+'/'+state+'/'+command+' returns within available swim time');
 assert.equal(a.game.riverBankSide(a.game.state.player.x,a.game.state.player.y),side,'original bank only');
 assert.deepEqual(a.game.state.flags,before.flags);assert.equal(a.game.state.score,before.score);count++;
}
assert(underDeck>0,'upstream fallback exercised');
const manual=at('west','loose',160,150);manual.game.moveSwimming(0,15);assert.equal(manual.game.state.player.y,150,'manual swimming still blocked by deck');
console.log('PASS '+count+' upstream returns: both original banks, broken/loose/lashed bridge, across/shore commands, solid piers/rocks, preserved timer and no far-bank bypass.');

let arrowCases=0;
for(const state of ['broken','loose','lashed'])for(const [side,x,y,key] of [['west',190,140,'ArrowRight'],['west',195,145,'ArrowUp'],['east',145,140,'ArrowLeft']]){
 clock.now=1000;const a=at(side,state,x,y,2000);assert(a.game.swimmingSpace(x,y),'valid upstream entry');
 a.key(key);
 for(let n=0;n<8&&!a.game.swim.pushback&&a.game.swim.active;n++){clock.now+=100;a.game.walkTick();a.game.tickSwimming()}
 assert(a.game.swim.pushback,'actual '+key+' at upstream shoreline starts current: '+side+'/'+state);
 for(let n=0;n<65&&a.game.swim.active;n++){clock.now+=100;a.game.tickSwimming()}
 assert(!a.game.swim.active&&!a.game.swim.dead,'upstream arrow approach returns safely');
 assert.equal(a.game.riverBankSide(a.game.state.player.x,a.game.state.player.y),side);arrowCases++;
}
console.log('PASS '+arrowCases+' real arrow-key shoreline approaches trigger pushback before timeout.');

// The angled gap requires sideways corrections while holding a vertical key.
for(const [x,y,key,target,down]of [[160,163,'ArrowDown',185,true],[154,175,'ArrowUp',150,false]]){
 clock.now=1000;const a=at('west','broken',x,y,8000);assert(a.game.swimmingSpace(x,y));a.key(key);
 for(let n=0;n<20&&a.game.swim.active&&(down?a.game.state.player.y<target:a.game.state.player.y>target);n++){clock.now+=100;a.game.walkTick();a.game.tickSwimming()}
 assert(!a.game.swim.dead);assert(!a.game.swim.active||(down?a.game.state.player.y>=target:a.game.state.player.y<=target),'held '+key+' follows angled gap without sticking');
 if(a.game.swim.active)assert(a.game.swimmingSpace(a.game.state.player.x,a.game.state.player.y),'steering stays in clear water');
}
for(const side of ['west','east']){
 const trapped=at(side,'broken',160,169,2000);trapped.key('ArrowDown');assert(trapped.game.swim.pushback,'invalid old landing recovers on directional input');
 for(let n=0;n<65&&trapped.game.swim.active;n++){clock.now+=100;trapped.game.tickSwimming()}
 assert(!trapped.game.swim.active&&!trapped.game.swim.dead);assert.equal(trapped.game.riverBankSide(trapped.game.state.player.x,trapped.game.state.player.y),side);
 const falling=at(side,'broken',160,150,8000);falling.game.placeWalking(side==='west'?140:180,169);falling.key('ArrowUp');
 for(let n=0;n<15&&!falling.game.swim.active;n++)falling.game.walkTick();assert(falling.game.swim.active,'actual upper-edge fall');
 assert(falling.game.swimmingSpace(falling.game.state.player.x,falling.game.state.player.y),'upper-edge fall lands in controllable water');
 falling.game.command('get out');for(let n=0;n<75&&falling.game.swim.active;n++){clock.now+=100;falling.game.tickSwimming()}
 assert(!falling.game.swim.active&&!falling.game.swim.dead,'actual top-edge rescue');
}
console.log('PASS held up/down steering through angled gap, invalid-position recovery and actual top-edge falls/rescues from both sides.');
