const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const legacy=fs.readFileSync(path.join(__dirname,'check-expanded-adventure.cjs'),'utf8');const sandbox={require,console,Buffer,__dirname};vm.createContext(sandbox);vm.runInContext(legacy.slice(0,legacy.indexOf("check('Eight rooms"))+'\nglobalThis.benchHarness={boot};',sandbox);
const boot=sandbox.benchHarness.boot,base=boot();base.start();base.game.saveGame();const key=base.game.key,save=JSON.parse(base.storage.get(key));let count=0;
for(let bits=0;bits<16;bits++){
 const flags={...save.flags,oilTaken:!!(bits&1),twineTaken:!!(bits&2),shearsTaken:!!(bits&4),plankTaken:!!(bits&8)};
 const data={...save,room:2,flags,player:{x:160,y:212,step:1,facing:'back'}};
 const a=boot(new Map([[key,JSON.stringify(data)]]));a.start();a.game.restoreGame();while(a.game.state.popupOpen)a.game.closeMessage();
 const before=a.game.state;
 for(const command of ['look','look at table','look at bench','examine workbench']){
  a.game.command(command);const text=a.message.replace(/\s+/g,' ');
  for(const [word,flag]of [['oil','oilTaken'],['twine','twineTaken'],['shears','shearsTaken']])assert.equal(new RegExp('\\b'+word+'\\b').test(text),!flags[flag],command+' / '+bits+' / '+word);
  assert.equal(/empty/.test(text),(bits&7)===7);assert.equal(/Sound planks/.test(text),!flags.plankTaken);assert.equal(/split spare boards/.test(text),flags.plankTaken);
  assert.equal(a.game.state.score,before.score);assert.deepEqual(a.game.state.flags,before.flags);assert.deepEqual(a.game.state.inv,before.inv);while(a.game.state.popupOpen)a.game.closeMessage();count++;
 }
}
console.log('PASS '+count+' built-game bench descriptions across every pickup combination; restored flags, inventory and score preserved.');
