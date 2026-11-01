const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
let h=fs.readFileSync('tools/check-expanded-adventure.cjs','utf8').split("check('Eight rooms")[0];
h=h.replace('globalThis.game={command,',`globalThis.game={memory:savedMerrinMemory,finalMemory:merrinFinalMemory,get endingMemory(){return merrinEndingMemory},get endingFrame(){return merrinEndingFrame},advanceMerrinEnding,place(r,x=85,y=185){room=r;player={x,y,step:0,facing:'front'}},enterWater(){beginSwimming(160,194,{x:160,y:194})},tickSwimming,setVoice(){flags.voiceReturned=true;flags.voiceArrivalSeen=true},command,`);
const s={require,console,Buffer,__dirname};vm.createContext(s);vm.runInContext(h+';globalThis.qa={boot}',s);const {boot}=s.qa;
function fresh(){const a=boot();a.start();drain(a);a.game.place(0);return a}
function drain(a){let text='',guard=0;while(a.game.state.popupOpen&&guard++<30){text+=' '+a.message;a.game.closeMessage()}assert(guard<30);return text.replace(/\s+/g,' ')}
function run(a,text){drain(a);a.game.command(text);return drain(a)}
const cases=[['dance',0,'dance with Merrin',/knee clicks/,/knees forget/],['bow',0,'bow to Merrin',/one hand firmly/,/cap on/],['sing',0,'sing to Merrin',/tune you sang/,/tune alive/],['tree',3,'shake tree',/apple leaf from your hair/,/ask the tree politely/]];
for(const [kind,room,command,gesture,spoken]of cases){
 const a=fresh();a.game.place(room);const before=a.game.state;run(a,command);
 assert(a.game.memory().seen.includes(kind));for(const key of ['flags','inv','score','scored'])assert.deepEqual(a.game.state[key],before[key]);
 a.game.place(0);const reply=run(a,'talk to Merrin');assert.match(reply,gesture);assert.match(reply,/M-e-r-r-i-n/,'quest clue remains');
 assert.doesNotMatch(run(a,'talk to Merrin'),gesture,'callback is not repeated');run(a,command);assert.doesNotMatch(run(a,'talk to Merrin'),gesture,'repeating an antic does not reset callback');
 assert.match(a.game.finalMemory(),spoken);assert.equal(a.game.state.score,before.score);
}
const wet=fresh();wet.game.place(4,140,169);wet.game.enterWater();assert(wet.game.memory().seen.includes('river')); // Only actual entry records a fall.
const dry=fresh();run(dry,'look Merrin');assert.equal(dry.game.memory().seen.length,0);assert.equal(dry.game.finalMemory(),'');
const far=fresh();far.game.place(0,290,220);run(far,'dance with Merrin');assert.equal(far.game.memory().seen.length,0,'failed reach is not remembered');
const saved=fresh();run(saved,'dance');run(saved,'talk to Merrin');run(saved,'save');const data=JSON.parse(saved.storage.get(saved.game.key));
const restored=boot(new Map([[saved.game.key,JSON.stringify(data)]]));restored.start();restored.game.restoreGame();drain(restored);assert(restored.game.memory().seen.includes('dance'));assert.doesNotMatch(run(restored,'talk Merrin'),/knee clicks/,'save preserves already-mentioned callbacks');
delete data.merrinMemory;const legacy=boot(new Map([[saved.game.key,JSON.stringify(data)]]));legacy.start();legacy.game.restoreGame();drain(legacy);assert.equal(legacy.game.memory().seen.length,0,'older saves have no invented memories');
const ending=fresh();run(ending,'dance');ending.game.setVoice();run(ending,'talk Merrin');assert(!ending.game.state.playing,'one talk still starts ending');assert(ending.game.endingMemory.length>0);assert(ending.game.endingMemory.every(line=>line.length<=34));assert(ending.game.endingMemory.length<=5,'callback fits ending box');ending.game.advanceMerrinEnding();assert(ending.game.endingFrame>0,'callback renders after song/skip');
console.log('PASS remembered antics/wet entry, mute gestures, one-time callbacks, preserved quest clues/score, reach guards, save/legacy restore and spoken ending callback bounds.');
