const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
let h=fs.readFileSync('tools/check-expanded-adventure.cjs','utf8').split("check('Eight rooms")[0];
h=h.replace('globalThis.game={command,','globalThis.game={walkTick,stopWalking,isBridgeDeck,get swim(){return {active:swimState.active,fall:!!bridgeFall}},onRepair(x,y){return insidePolygon(x,y,bridgeRepairDeck)},command,');
const s={require,console,Buffer,__dirname};vm.createContext(s);vm.runInContext(h+';globalThis.qa={boot}',s);
const {boot}=s.qa,base=boot();base.start();base.game.saveGame();const key=base.game.key,save=JSON.parse(base.storage.get(key));
function at(x,y){const a=boot(new Map([[key,JSON.stringify({...save,room:4,player:{x,y,step:0,facing:'right'},flags:{...save.flags,plankTaken:true,twineTaken:true,bridgePlank:true,bridgeFixed:true}})]]));a.start();a.game.restoreGame();while(a.game.state.popupOpen)a.game.closeMessage();return a;}
for(const side of ['west','east']){
 const a=at(side==='west'?130:190,169),sign=side==='west'?1:-1;let onBoard=0;
 // The player deliberately lines up before issuing horizontal movement.
 a.key('ArrowUp');a.game.walkTick();a.game.stopWalking();
 assert(a.game.state.player.y>=158&&a.game.state.player.y<=165,'manual up input aligns with visible board');
 const alignedY=a.game.state.player.y;
 a.key(sign>0?'ArrowRight':'ArrowLeft');
 for(let n=0;n<40;n++){
  const p=a.game.state.player;
  assert(!a.game.swim.active&&!a.game.swim.fall,'secured crossing stays dry');
  assert.equal(p.y,alignedY,'horizontal crossing never changes vertical alignment');
  if(p.x>=150&&p.x<=172){assert(a.game.onRepair(p.x,p.y),'feet stay on visible plank at '+JSON.stringify(p));onBoard++;}
  if(sign>0?p.x>=190:p.x<=130)break;
  a.game.walkTick();
 }
 assert(onBoard>=4,'actual crossing exercised');assert(sign>0?a.game.state.player.x>=190:a.game.state.player.x<=130,'reaches opposite bank');
}
for(const side of ['west','east'])for(const y of [169,175]){
 const a=at(side==='west'?130:190,y),sign=side==='west'?1:-1;
 assert.equal(a.game.state.player.y,y,'fixture begins on original bridge deck');
 a.key(sign>0?'ArrowRight':'ArrowLeft');
 for(let n=0;n<30&&!a.game.swim.active;n++){
  assert.equal(a.game.state.player.y,y,'no automatic vertical steering toward plank');
  a.game.walkTick();
 }
 assert(a.game.swim.active,'missing secured plank enters water from '+side+' at '+y);
 assert(!a.game.swim.fall,'secured plank is not tipped by missing it');
}
const center=at(160,175);assert.equal(center.game.state.player.y,162,'older floating save aligns onto plank');
assert(!center.game.canStand(160,170),'no invisible platform below plank');assert(!center.game.canStand(160,155),'no invisible platform above plank');
center.key('ArrowDown');assert(center.game.swim.active,'walking off the side enters water');
console.log('PASS manual keyboard alignment from both banks, dry on-plank crossings, missed-plank falls without auto-steering, no floating platform, old-save compatibility and stepping off.');
