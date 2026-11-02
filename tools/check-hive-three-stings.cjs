const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
let h=fs.readFileSync('tools/check-expanded-adventure.cjs','utf8').split("check('Eight rooms")[0];
h=h.replace('globalThis.game={command,','const heard=[];playGameSound=(...args)=>heard.push(args);globalThis.game={get heard(){return heard},get hiveOpen(){return hiveOpen},get stings(){return hiveStings},get hiveTimer(){return hiveTimer},get hiveFrame(){return hiveFrame},get action(){return storyAction&&{...storyAction}},hivePieces,hiveContact,tickHive,tickStoryEffect,seed(){hiveFlight=makeHiveFlight(1)},setFrame(n){hiveFrame=n},reduced(){window.matchMedia=()=>({matches:true})},command,');
const s={require,console,Buffer,__dirname};vm.createContext(s);vm.runInContext(h+';globalThis.bootQA=boot;',s);const boot=s.bootQA;
const base=boot();base.start();base.game.saveGame();const original=JSON.parse(base.storage.get(base.game.key));
function fresh(y=212){const data={...original,room:3,player:{x:206,y,step:1,facing:'front'}};const a=boot(new Map([[base.game.key,JSON.stringify(data)]]));a.start();a.game.restoreGame();drain(a);return a}
function drain(a){while(a.game.state.popupOpen&&!a.game.hiveOpen)a.game.closeMessage()}
function open(a){a.game.command('take wax');assert(a.game.hiveOpen);a.game.seed();a.key('Enter')}
function reach(a,miss,stopOnContact=false){
 let frame=a.game.hiveFrame,tries=0;
 while(Array.from({length:12},(_,i)=>a.game.hiveContact(frame+i+1,i+1)).some(Boolean)!==miss&&tries++<1000)frame++;
 assert(tries<1000);a.game.setFrame(frame);const count=a.game.stings;a.key(' ');
 for(let n=0;n<13;n++){a.game.tickHive();if(a.game.hiveOpen)assert(a.game.stings<=count+1,'one sting per reach, not per contact frame');if(stopOnContact&&a.game.stings===count+1)return}
}
const a=fresh();open(a);reach(a,false);assert.equal(a.game.hivePieces(),1);
reach(a,true);assert.equal(a.game.stings,1);assert(a.game.hiveOpen&&!a.game.action);
reach(a,false);assert.equal(a.game.hivePieces(),2);assert.equal(a.game.stings,1,'success does not erase earlier stings in this visit');
reach(a,true);assert.equal(a.game.stings,2);assert(a.game.hiveOpen&&!a.game.action);
const before=a.game.state;reach(a,true);assert(!a.game.hiveOpen);assert.equal(a.game.hiveTimer,0);assert.equal(a.game.action.kind,'beeSting');assert(!a.game.state.popupOpen,'orchard animation is visible before the popup');assert.equal(a.game.state.room,3);assert.equal(a.game.hivePieces(),0,'retreat drops partial wax');assert.equal(a.game.stings,0);assert.equal(a.game.heard.filter(c=>c[0]==='beeSting').length,1);
assert.deepEqual({...a.game.state.flags},{...before.flags,hiveWaxOne:false,hiveWaxTwo:false});for(const key of ['score','inv'])assert.deepEqual(a.game.state[key],before[key]);
for(let n=0;n<18;n++)a.game.tickStoryEffect();assert(!a.game.action);assert.match(a.message.replace(/\s+/g,' '),/Three stings.*drop your gathered wax flakes.*gather them again/);drain(a);
a.game.saveGame();drain(a);const restored=boot(a.storage);restored.start();restored.game.restoreGame();drain(restored);open(restored);assert.equal(restored.game.hivePieces(),0,'save/restore cannot recover dropped flakes');assert.equal(restored.game.stings,0);for(let n=0;n<3;n++)reach(restored,false);assert(restored.game.state.flags.waxTaken);assert.equal(restored.game.state.score,before.score+2);assert(!restored.game.action,'victory does not trigger another sting dance');
const escaped=fresh();open(escaped);reach(escaped,true);escaped.key('Escape');open(escaped);assert.equal(escaped.game.stings,0,'Escape starts a fresh visit');
const early=fresh();open(early);reach(early,false);reach(early,true);reach(early,true);reach(early,true,true);assert.equal(early.game.stings,3);early.key('Escape');assert(!early.game.hiveOpen&&early.game.action.kind==='beeSting','Escape after third contact still shows retreat');assert.equal(early.game.hivePieces(),0,'Escape after third contact also drops wax');
const below=fresh(226);open(below);for(let n=0;n<3;n++)reach(below,true);assert(below.game.state.player.y>=226,'retreat does not teleport an already safe player toward the hive');
const reduced=fresh();open(reduced);reach(reduced,true);reach(reduced,true);reduced.game.reduced();reach(reduced,true);assert(!reduced.game.hiveOpen&&reduced.game.action);for(let n=0;n<18;n++)reduced.game.tickStoryEffect();assert(!reduced.game.action);assert(reduced.game.state.popupOpen);
console.log('PASS three actual missed reaches per visit: one count per reach, success preserves count, orchard scramble after third withdrawal, modal/timer cleanup, dropped flakes/preserved score, empty retry/save/restore and full recollection/victory, Escape reset and reduced motion.');
