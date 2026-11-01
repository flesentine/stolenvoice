// Room-aware, opt-in detail: test real parser messages and alternate task orders.
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
let h=fs.readFileSync('tools/check-expanded-adventure.cjs','utf8').split("check('Eight rooms")[0];
h=h.replace('globalThis.game={command,','globalThis.game={setHintFixture(atRoom,next,point){room=atRoom;flags={...flagDefaults,...next};const p=point||roomLayouts[room].spawn;player={x:p[0],y:p[1],step:1,facing:"front"};syncInventory()},command,');
const s={require,console,Buffer,__dirname};vm.createContext(s);vm.runInContext(h+';globalThis.qa={boot};',s);const {boot}=s.qa;
function at(room,flags={},point){const a=boot();a.start();while(a.game.state.popupOpen)a.game.closeMessage();a.game.setHintFixture(room,flags,point);return a}
function drain(a){let text='',guard=0;while(a.game.state.popupOpen&&guard++<30){text+=' '+a.message;a.game.closeMessage()}assert(guard<30);return text.trim()}
let checks=0;
function hint(a,text='hint'){
 drain(a);const before=a.game.state;a.game.command(text);assert(a.game.state.popupOpen,text+' opens a message');const out=drain(a),after=a.game.state;
 for(const key of ['flags','inv','score','scored','player'])assert.deepEqual(after[key],before[key],text+' leaves '+key+' unchanged');
 checks++;return out.replace(/\s+/g,' ');
}
const main=t=>t.split('HINT MORE')[0].split('Ask again')[0];
for(let room=0;room<9;room++){
 const text=hint(at(room));assert(text.length>15,'useful room hint');assert.doesNotMatch(main(text),/TAKE BELL|OPEN BOOK|LOOK PANEL|ANSWER ECHO|SAY MERRIN|CUT THORNS|FIX ROPE/,'gentle hint avoids solution commands');
}
const garden=at(0);const kindness=hint(garden);assert.match(kindness,/kindness/);assert.match(hint(garden,'hint more'),/rose/);assert.match(hint(garden,'hint command'),/TAKE ROSE/);assert.match(hint(garden),/bell.*portable/);assert.match(hint(garden),/kindness/);
for(let i=0;i<12;i++)assert.doesNotMatch(main(hint(garden)),/GIVE ROSE|TAKE BELL/,'repetition cycles without escalating');
assert.doesNotMatch(main(hint(at(0,{rose:true,roseGiven:true,workshopKey:true,bell:true}))),/portable|kindness/,'completed garden errands disappear');
const gallery=at(1,{readBook:true});assert.match(hint(gallery),/stairs.*belfry/);assert.doesNotMatch(hint(gallery),/rose|key/,'reading book early does not send player back to first quest flag');
const mill=at(5,{},[244,181]);assert.match(hint(mill,'help'),/bucket.*empty/);assert.match(hint(mill,'hint more'),/troughs.*slide/);assert.match(hint(mill,'hint command'),/LOOK PANEL/);mill.game.command('look panel');assert(mill.game.state.popupOpen);mill.key('Escape');
const bridge=at(4,{},[85,176]);assert.match(hint(bridge),/missing boards/);assert.match(hint(bridge),/mill.*before repairing/);assert.match(hint(bridge,'hint command'),/ENTER MILL/);bridge.game.command('enter mill');assert.equal(bridge.game.state.room,5,'advertised alternate mill trip does not need repaired bridge');
const tower=at(7,{twineTaken:true},[176,190]);assert.match(hint(tower),/frayed/);assert.match(hint(tower,'hint command'),/FIX ROPE WITH TWINE/);tower.game.command('fix rope with twine');assert(tower.game.state.flags.ropeFixed,'rope repair works before echo or garden errands');drain(tower);assert.doesNotMatch(main(hint(tower)),/frayed/,'repaired rope no longer suggested');
const riddle=at(6,{poolAwake:true,bell:true},[190,190]);for(let i=0;i<5;i++)assert.doesNotMatch(main(hint(riddle)),/ANSWER ECHO/);assert.match(hint(riddle,'hint more'),/returns your own words/);assert.match(hint(riddle,'hint command'),/ANSWER ECHO/);
const carrying=at(3,{oilTaken:true,shearsTaken:true,thornsCut:true,waxTaken:true});assert.match(hint(carrying),/eastern path/);assert.match(hint(carrying),/shears.*satchel/);assert.match(hint(carrying,'hint command'),/OIL SHEARS/);
const supplies={oilTaken:true,shearsTaken:true,shearsReady:true,twineTaken:true,plankTaken:true};assert.match(hint(at(2,supplies)),/gathered the useful supplies/);
const sealed={echoCaught:true,jarTaken:true,jarSealed:true};assert.doesNotMatch(main(hint(at(2,{...supplies,...sealed}))),/escaping|SEAL JAR/,'sealed jar does not repeat seal hint');
const openJar=at(2,{...supplies,echoCaught:true,jarTaken:true});assert.match(hint(openJar),/whisper.*escaping/);assert.match(hint(openJar,'hint more'),/hive.*wax/);
const door=at(8,{rose:true,roseGiven:true,workshopKey:true},[64,158]);assert.match(hint(door,'hint command'),/UNLOCK WORKSHOP DOOR WITH KEY/);door.game.command('unlock workshop door with key');assert(door.game.state.flags.workshopUnlocked,'door wording is accepted');
const more=at(5);assert.match(hint(more,'help more'),/troughs/);assert.match(hint(more,'help command'),/LOOK PANEL/);
console.log('PASS '+checks+' room-aware hint messages: nine rooms, alternate order, cycling without spoilers, explicit detail, current inventory, completed tasks, executable wording and unchanged game state.');
