// Stepping off a secured plank must not relocate her across the bridge.
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
let h=fs.readFileSync('tools/check-expanded-adventure.cjs','utf8').split("check('Eight rooms")[0];
h='const clock={now:1000};\n'+h.replace('const sandbox={document:','const sandbox={Date:{now:()=>clock.now},document:').replace('globalThis.game={command,','globalThis.game={tickSwimming,walkTick,pictureY,swimmingShoreRoute,woodBlocksSwimming,rockBlocksSwimming,get swim(){return {...swimState}},command,');
const s={require,console,Buffer,__dirname};vm.createContext(s);vm.runInContext(h+';globalThis.bootQA=boot;globalThis.testClock=clock;',s);
const base=s.bootQA();base.start();base.game.saveGame();const save=JSON.parse(base.storage.get(base.game.key));
for(const x of [158,166])for(const direction of ['down','up']){
 const data={...save,room:4,player:{x,y:162,step:1,facing:'front'},flags:{...save.flags,plankTaken:true,bridgePlank:true,twineTaken:true,bridgeFixed:true}};
 const a=s.bootQA(new Map([[base.game.key,JSON.stringify(data)]]));a.start();a.game.restoreGame();while(a.game.state.popupOpen)a.game.closeMessage();
 const before=a.game.state;a.key(direction==='down'?'ArrowDown':'ArrowUp');
 for(let n=0;n<12&&!a.game.swim.active;n++)a.game.walkTick();assert(a.game.swim.active,'actual arrow steps off plank');
 const p=a.game.state.player,waterline=a.game.pictureY(p.y);
 if(direction==='down')assert(waterline-14>127,'downward fall places whole swimmer below bridge: '+JSON.stringify(p));
 else assert(waterline+3<110,'upward fall stays above bridge: '+JSON.stringify(p));
 assert(!a.game.woodBlocksSwimming(p.x,p.y)&&!a.game.rockBlocksSwimming(p.x,p.y),'lands in clear water');
 assert(a.game.swimmingShoreRoute().length>0||a.game.swimmingShoreRoute(p.x,p.y,a.game.swim.bankSide,true).length>0,'home bank remains reachable');assert.equal(a.game.swim.remaining,8000);assert.deepEqual(a.game.state.flags,before.flags);assert.equal(a.game.state.score,before.score);
 a.game.command('swim back');for(let n=0;n<70&&a.game.swim.active;n++){s.testClock.now+=100;a.game.tickSwimming()}assert(!a.game.swim.active&&!a.game.swim.dead,'swim back reaches home bank after '+direction+' fall');
}
console.log('PASS real up/down plank exits from both sides: matching water side, clear landing, reachable home bank, full swim time and preserved progress.');
