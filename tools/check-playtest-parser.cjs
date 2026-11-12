// Regressions from the completed November 10 human playtest. Use exact failed
// commands, without retaining the tester's report or personal feedback here.
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
let harness=fs.readFileSync('tools/check-expanded-adventure.cjs','utf8').split("check('Eight rooms")[0];
harness=harness.replace('globalThis.game={command,','globalThis.game={get sluiceOpen(){return millSluiceOpen},get harmonyOpen(){return harmonyOpen},get solvedSluice(){return millSluiceSolved.slice()},secretSnailFound,objectId,command,');
const scope={require,console,Buffer,__dirname};vm.createContext(scope);vm.runInContext(harness+';globalThis.qa={boot}',scope);
const {boot}=scope.qa,base=boot();base.start();base.game.saveGame();const save=JSON.parse(base.storage.get(base.game.key));
const echo={bell:true,wheelUnlocked:true,wheelTurned:true,jarTaken:true,poolAwake:true,poolRiddleSolved:true,echoNamed:true};
const sealed={...echo,echoCaught:true,waxTaken:true,jarSealed:true,twineTaken:true,ropeFixed:true};
function drain(a){for(let n=0;a.game.state.popupOpen&&n<30;n++)a.game.closeMessage()}
function at(room,flags={},x=160,y=212){
 const data={...save,room,player:{x,y,step:1,facing:'front'},flags:{...save.flags,...flags}};
 if(data.flags.wheelUnlocked)data.sluice=base.game.solvedSluice;
 const a=boot(new Map([[base.game.key,JSON.stringify(data)]]));a.start();a.game.restoreGame();drain(a);assert.equal(a.game.state.room,room);return a;
}
function command(a,text){a.game.command(text);return a.message.replace(/\s+/g,' ')}
for(const [room,flags,x,y,nouns,open]of [
 [5,{},244,205,['panel','trough','blocks','block','trough block','channel block','channel blocks','tray','finger grips','guide pegs','fixed stone'],'sluiceOpen'],
 [7,sealed,248,205,['instrument','weights','strings','string','psaltery','brass weights','shared bridge','oak string instrument'],'harmonyOpen']
])for(const noun of nouns)for(const verb of ['x','l','examine','look at']){
 const a=at(room,flags,x,y),before=a.game.state;
 command(a,verb+' '+noun);assert(a.game[open],verb+' '+noun+' opens the same existing puzzle');
 assert.deepEqual(a.game.state.flags,before.flags,'examination cannot solve a puzzle');assert.equal(a.game.state.score,before.score);
}
for(const verb of ['x','l','examine','look at']){
 const a=at(2,{},160,212);assert.match(command(a,verb+' spiral'),/SIR CREEP-A-LOT/);assert(a.game.secretSnailFound());assert.equal(a.game.state.score,0);
}
for(const noun of ['lower rail','low crosspiece','lower shelf'])assert.match(command(at(2), 'x '+noun),/SIR CREEP-A-LOT/);
for(const [room,nouns,match]of [[5,['bucket','grain','red bin','bin','stores'],/bucket|grain|bin|sack/i],[8,['lock','escutcheon'],/door|lock/i]])for(const noun of nouns){
 const a=at(room),before=a.game.state;assert.match(command(a,'x '+noun),match);assert.deepEqual(a.game.state.flags,before.flags);
}
for(const text of ['put glass in pool','put the glass jar into the pool','place glass in water','dip jar in pool','lower jar into water','hold glass over pool','hold glass near echo','put jar at pool','catch echo in glass','capture echo with hollow glass']){
 const a=at(6,echo,190,190),before=a.game.state.score;command(a,text);assert(a.game.state.flags.echoCaught,text);assert.equal(a.game.state.score,before+5);
 drain(a);command(a,text);assert.equal(a.game.state.score,before+5,'repeat never scores twice');
}
for(const text of ['put water in glass','fill glass with water','put pool water into jar']){
 const a=at(6,echo,190,190),before=a.game.state;assert.match(command(a,text),/comes up dry.*name hangs above.*sound/);assert.deepEqual(a.game.state.flags,before.flags);
}
for(const [flags,x,y,pattern]of [[{},190,190,/no jar/],[{wheelUnlocked:true,wheelTurned:true,jarTaken:true},190,190,/comes up dry/],[echo,43,184,/closer/],[sealed,190,190,/wax seal/]]){
 const a=at(6,flags,x,y),before=a.game.state;assert.match(command(a,'put glass in pool'),pattern);assert.deepEqual(a.game.state.flags,before.flags,'capture prerequisites remain intact');
}
const earlyInstrument=at(7,{},248,205);assert.match(command(earlyInstrument,'x psaltery'),/frayed|oak string instrument|strings/i);
const twine=at(2,{twineTaken:true});assert.match(command(twine,'x string'),/tightly wound coil/,'string outside the belfry still examines twine');
const gallery=at(1,sealed,144,190);assert.equal(gallery.game.objectId('glass'),'mirror','gallery glass still means the mirror');
const pool=at(6,echo,190,190);assert.equal(pool.game.objectId('glass'),'jar');assert.match(command(pool,'x pool'),/sound lingers above the surface/);
console.log('PASS human playtest parser regressions: X/L/examine parity for mill, psaltery and snail; described scenery nouns; natural glass/echo commands; explicit-water hint; reach/ownership/progress guards; repeat scoring and gallery glass meaning.');
