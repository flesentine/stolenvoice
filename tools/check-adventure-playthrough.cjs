// Fresh-start walkthrough of the actual embedded script. Uses real walk masks
// and parser/key handlers; no inventory grants, room teleports or puzzle skips.
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
let h=fs.readFileSync('tools/check-expanded-adventure.cjs','utf8').split("check('Eight rooms")[0];
h=h.replace('globalThis.game={command,',`globalThis.game={portableSaveText,importGameSave,get busy(){return !!storyAction||!!bellAction||!!bookAnimationTimer||!!workshopDoorMotion||!!millAction||millSluiceReleaseFrame>=0},get hiveOpen(){return hiveOpen},get hiveFrame(){return hiveFrame},hiveContact,tickHive,seedHive(){hiveFlight=makeHiveFlight(1)},get slot(){return millSluiceSelected},get held(){return millSluiceHeld},get releaseFrame(){return millSluiceReleaseFrame},get sluiceOpen(){return millSluiceOpen},get harmonyOpen(){return harmonyOpen},get harmonyHelp(){return harmonyHelp},memory:savedMerrinMemory,secret:secretSnailFound,command,`);
const s={require,console,Buffer,__dirname};vm.createContext(s);vm.runInContext(h+';globalThis.qa={boot,travel,approach,walkWhere}',s);
const {boot,travel,approach,walkWhere}=s.qa;let a=boot(),commands=0,checkpointCount=0;const saveChecks=[];const visited=new Set(),transcript=[];
function drain(){let text='',n=0;while(a.game.state.popupOpen&&!a.game.hiveOpen&&!a.game.sluiceOpen&&!a.game.harmonyOpen&&n++<40){text+=' '+a.message;a.game.closeMessage()}assert(n<40);return text.replace(/\s+/g,' ')}
function settle(){let text=drain();for(let n=0;a.game.busy&&n<240;n++){for(const tick of [...a.intervals.values()])tick();if(a.game.releaseFrame>=36)a.key('Enter');text+=' '+drain()}assert(!a.game.busy,'action settles');return text;}
function cmd(text){settle();a.game.command(text);commands++;const reply=settle();transcript.push({command:text,room:a.game.state.room,reply,score:a.game.state.score});return reply;}
function near(id){settle();approach(a,id)}
function go(id){settle();travel(a,id);settle();visited.add(a.game.state.room)}
function checkpoint(){
 cmd('save');const before=a.game.state,oldMemory=JSON.stringify(a.game.memory()),portable=checkpointCount++%2===0;
 const file=portable?a.game.portableSaveText(a.storage.get(a.game.key)):null;
 const filePath=portable?'assets/reviews/playthrough-save-'+checkpointCount+'.json':null;
 if(filePath)fs.writeFileSync(filePath,file,'utf8');
 a=boot(portable?new Map():a.storage);a.start();settle();
 if(portable){assert(a.game.importGameSave(fs.readFileSync(filePath,'utf8')));settle()}else cmd('restore');
 assert.equal(a.game.state.room,before.room);assert.equal(JSON.stringify(a.game.state.flags),JSON.stringify(before.flags));assert.equal(JSON.stringify(a.game.state.inv),JSON.stringify(before.inv));assert.equal(a.game.state.score,before.score);assert.equal(JSON.stringify(a.game.memory()),oldMemory);
 saveChecks.push({method:portable?'portable-file-new-location':'browser-restart',room:before.room,score:before.score,...(filePath?{file:filePath}:{})});
}
a.start();settle();visited.add(0);assert.equal(a.game.state.score,0);assert.equal(a.game.roomLayouts.length,9);assert.equal(a.game.maxScore,105);
near('man');cmd('dance with Merrin');near('rose');cmd('take rose');near('bell');cmd('take bell');near('man');cmd('give rose to Merrin');assert(a.game.state.flags.workshopKey);
go('courtyard');walkWhere(a,(x,y)=>Math.hypot(x-64,y-145)<43);cmd('use workshop key on shed door');go('shed');
for(const id of ['oil','twine','shears','plank']){near(id);cmd('take '+id)}
near('drawer');cmd('look under bench');assert(a.game.secret());cmd('oil blades');assert(a.game.state.flags.shearsReady);checkpoint();
go('courtyard');go('garden');go('orchard');cmd('smell apples');cmd('shake tree');near('wax');cmd('take wax');assert(a.game.hiveOpen);a.game.seedHive();a.key('Enter');
for(let round=0;round<3;round++){
 let n=0;while(Array.from({length:12},(_,i)=>a.game.hiveContact(a.game.hiveFrame+i+1,i+1)).some(Boolean)&&n++<900)a.game.tickHive();assert(n<900);
 a.key(' ');for(let tick=0;tick<13;tick++)a.game.tickHive();
}
assert(a.game.state.flags.waxTaken);a.key('Enter');settle();near('thorns');cmd('cut thorns');go('bridge');
// The mill can be completed before repairing the bridge: its entrance is on
// this bank. This deliberately exercises a valid alternative puzzle order.
go('mill');near('wheel');cmd('inspect sluice');assert(a.game.sluiceOpen);
for(const move of JSON.parse(fs.readFileSync('assets/sluice-sliding-design.json')).solution){
 if(a.game.held)a.key('Enter');let guard=0;
 while(Math.floor(a.game.slot/4)!==Math.floor(move.from/4)&&guard++<12)a.key(a.game.slot<move.from?'ArrowDown':'ArrowUp');
 while(a.game.slot%4!==move.from%4&&guard++<24)a.key(a.game.slot%4<move.from%4?'ArrowRight':'ArrowLeft');
 assert.equal(a.game.slot,move.from);a.key('Enter');a.key(({1:'ArrowRight','-1':'ArrowLeft',4:'ArrowDown','-4':'ArrowUp'})[move.to-move.from]);if(a.game.sluiceOpen)a.key('Enter');
}
settle();assert(a.game.state.flags.wheelTurned);near('cabinet');cmd('open cupboard');near('jar');cmd('take jar');assert(a.game.state.flags.jarTaken);checkpoint();
go('bridge');near('bridge');cmd('lay plank across gap');cmd('wrap twine around board');assert(a.game.state.flags.bridgeFixed);go('grotto');near('pool');cmd('ring bell');cmd('answer echo');cmd('say Merrin');cmd('hold jar over pool');cmd('seal jar with wax');assert(a.game.state.flags.jarSealed);checkpoint();
go('bridge');go('orchard');go('garden');near('man');assert.match(cmd('talk Merrin'),/one proud finger/);go('courtyard');go('gallery');near('book');cmd('open book');cmd('read book');near('mirror');cmd('ring bell');go('belfry');near('rope');cmd('fix rope with twine');cmd('pull rope');assert(a.game.harmonyOpen);
if(a.game.harmonyHelp)a.key('Enter');for(let n=0;n<3;n++)a.key('ArrowUp');a.key('ArrowRight');for(let n=0;n<4;n++)a.key('ArrowDown');a.key('ArrowRight');for(let n=0;n<3;n++)a.key('ArrowUp');assert(a.game.state.flags.harmonyTuned);a.key('Enter');settle();assert(a.game.state.flags.bellRung);checkpoint();
go('gallery');near('mirror');cmd('offer jar to mirror');cmd('say Merrin');assert(a.game.state.flags.voiceReturned);go('courtyard');go('garden');settle();assert(a.game.state.flags.complete);assert.equal(a.game.state.score,105);assert(!a.game.state.playing);assert.equal(visited.size,9);assert(a.game.memory().seen.includes('snail'));
// A completed-game save must reopen the ending without duplicate points.
const completedFile=a.game.portableSaveText(a.game.saveGame());
fs.writeFileSync('assets/reviews/playthrough-save-complete.json',completedFile,'utf8');
const completed=boot(new Map());completed.start();assert(completed.game.importGameSave(fs.readFileSync('assets/reviews/playthrough-save-complete.json','utf8')));assert(completed.game.state.flags.complete);assert.equal(completed.game.state.score,105);assert(!completed.game.state.playing);
fs.writeFileSync('assets/reviews/current-playthrough.json',JSON.stringify({method:'Fresh embedded-game headless playthrough with physical navigation, actual puzzle key inputs, fresh-location portable imports and fresh-runtime browser restores.',rooms:[...visited],commands,saveChecks,final:a.game.state,transcript},null,2)+'\n');
console.log('PASS fresh 105/105 adventure: all nine rooms, '+commands+' commands, hive/sluice/harmony via real inputs, mill-before-bridge order, secret/Merrin callbacks and two fresh-location portable imports and two fresh-runtime browser restores; completed-file import also reopens the ending at 105/105.');
