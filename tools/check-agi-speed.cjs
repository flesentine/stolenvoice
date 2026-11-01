const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
let h=fs.readFileSync('tools/check-expanded-adventure.cjs','utf8').split("check('Eight rooms")[0];
h=h.replace('setInterval(fn){const id','setInterval(fn,delay){fn.delay=delay;const id');
h=h.replace('globalThis.game={command,','globalThis.game={get speed(){return gameSpeed},get menus(){return menus},get timing(){return speedTiming()},command,');
const s={require,console,Buffer,__dirname};vm.createContext(s);vm.runInContext(h+';globalThis.bootQA=boot;',s);
const a=s.bootQA();a.start();const drain=()=>{while(a.game.state.popupOpen)a.game.closeMessage()};drain();assert.equal(a.game.speed,'normal');const before=a.game.state;
for(const [name,walk,ambient] of [['slow',220,720],['normal',110,360],['fast',55,180],['fastest',30,98]]){
 a.game.command('speed '+name);assert.equal(a.game.speed,name);assert.match(a.message,new RegExp(name,'i'));drain();
 assert.equal(a.game.timing.walk,walk);assert([...a.intervals.values()].some(fn=>fn.delay===ambient));
 a.key('ArrowRight');const timer=[...a.intervals.values()].find(fn=>fn.name==='walkTick');assert(timer);assert.equal(timer.delay,walk);a.key('ArrowRight');
 const menu=a.game.menus.find(m=>m.name==='Speed');assert(menu.items.some(([label])=>label==='* '+name[0].toUpperCase()+name.slice(1)));
}
a.key('Escape');a.key('ArrowRight');a.key('ArrowRight');a.key('ArrowDown');a.key('Enter');assert.equal(a.game.speed,'normal','keyboard menu selects Normal');
a.game.command('fast');drain();assert.equal(a.game.speed,'fast');assert.equal(a.game.state.score,before.score);assert.deepEqual(a.game.state.flags,before.flags);
const b=s.bootQA(a.storage);b.start();assert.equal(b.game.speed,'fast','speed persists separately from adventure save');
for(const menu of a.game.menus){const width=Math.max(...menu.items.map(i=>i[0].length))*8+16;assert(menu.x-4+width<=320,'menu fits native screen')}
console.log('PASS four speeds: parser and keyboard menu, real walk/background timer delays, selection marks, persisted preference and unchanged puzzle progress.');
