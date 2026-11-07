// Exercise actual standalone hooks and native modal callbacks with controlled time.
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
let h=fs.readFileSync('tools/check-expanded-adventure.cjs','utf8').split("check('Eight rooms")[0];
h=h.replace('globalThis.game={command,','globalThis.game={startPlaytest,showPlaytest,closePlaytest,playtestReport,downloadPlaytest,playtestTick,progress,changeRoom,drown,retryAfterDrowning,advanceMerrinEnding,get endingFrame(){return merrinEndingFrame},get endingTotal(){return merrinEndingTotal},get recording(){return playtest},get panel(){return playtestDialog},command,');
h=h.replace('  getContext(){return context}',`  click(){for(const f of this.listeners.click||[])f({target:this})} showModal(){this.open=true} close(){this.open=false} getContext(){return context}`);
h=h.replace('append(child){child.parent=this;', 'append(child){(this.children??=[]).push(child);child.parent=this;');
h=h.replace('const sandbox={document:doc,window,localStorage:',`let now=0;class Clock extends Date{constructor(...args){super(...(args.length?args:[now]))}static now(){return now}};const downloads=[];const sandbox={Date:Clock,Blob:class{constructor(parts){this.text=parts.join('')}},URL:{createObjectURL(blob){downloads.push(blob.text);return 'blob:test'},revokeObjectURL(){}},setTimeout(fn){fn()},document:doc,window,localStorage:`);
h=h.replace('return{game,storage,doc,get,handlers,intervals,verbs,dpad,start,run,key,event,','return{game,storage,doc,get,handlers,intervals,verbs,dpad,start,run,key,event,downloads,advance(ms){now+=ms;game.playtestTick()},');
const scope={require,console,Buffer,__dirname};vm.createContext(scope);vm.runInContext(h+';globalThis.qa={boot};',scope);const boot=scope.qa.boot;
const a=boot();a.start();const g=a.game;
const drain=()=>{let i=0;while(g.state.popupOpen&&i++<60)g.closeMessage()};drain();
a.run('look');drain();assert(!a.storage.has('elara-playtest-v1'),'no draft before opt-in');
g.startPlaytest();a.advance(60000);assert.equal(g.recording.activeMs,60000);
a.run('look');a.advance(1000);a.advance(120000);const paused=g.recording.activeMs;a.advance(120000);assert.equal(g.recording.activeMs,paused,'response-reading pauses active timer');drain();g.playtestTick();
for(let i=0;i<3;i++){a.run('blorple');drain()}
assert(g.recording.events.some(e=>e.type==='possible_trouble'));
g.progress('rose');drain();g.changeRoom(8);drain();a.run('save');drain();a.run('restore');drain();
assert(g.recording.events.some(e=>e.type==='milestone'&&e.flag==='rose'));assert(g.recording.events.some(e=>e.type==='room_change'));assert(g.recording.events.some(e=>e.type==='restore_result'&&e.success));
g.showPlaytest();const panel=g.panel;assert(panel.open);assert(g.state.popupOpen,'native notes panel pauses game simulation');const note=panel.children.find(e=>e.name==='label').children[0];note.value='Confused by the door';const before=g.state.player;a.key('ArrowRight');assert.deepEqual(g.state.player,before);a.advance(60000);panel.children.find(e=>e.textContent==='Save note and return').click();assert(!g.panel);assert(g.recording.events.some(e=>e.type==='note'&&e.text===note.value));
g.playtestTick();a.advance(600000);assert(g.recording.events.some(e=>e.type==='possible_trouble'&&/10 active/.test(e.reason)));
for(const handler of a.handlers.get('window:error')||[])handler.fn({message:'test bug',lineno:42});assert(g.recording.events.some(e=>e.type==='javascript_error'));
g.showPlaytest('finish');const finish=g.panel;finish.children.find(e=>e.name==='label').children[0].value='Enjoyed the art';finish.children.find(e=>e.textContent==='Finish and download report').click();assert(g.recording.endedAt);assert(![...a.intervals.values()].some(fn=>String(fn).includes('playtestTick')),'finishing stops recorder timer');assert.equal(a.downloads.length,1);const report=JSON.parse(a.downloads[0]);assert.equal(report.feedback.review,'Enjoyed the art');assert.match(report.build,/^[a-f0-9]{16}$/);assert(report.events.some(e=>e.type==='command'&&e.text==='blorple'));assert(report.events.some(e=>e.type==='response'));const count=g.recording.events.length;a.run('look');assert.equal(g.recording.events.length,count);
const b=boot(a.storage);b.start();b.game.showPlaytest();b.game.panel.children.find(e=>e.textContent==='Recover previous report').click();assert(b.game.recording.endedAt);assert.equal(b.game.recording.events.length,count);assert.equal(JSON.parse(b.game.playtestReport()).summary.score,report.summary.score,'recovered report retains recorded score');
class Blocked extends Map{set(){throw Error('blocked')}}const c=boot(new Blocked());c.start();c.game.startPlaytest();assert.equal(c.game.recording.storageAvailable,false);assert(c.game.downloadPlaytest());
console.log('PASS playtest opt-in, clock/pause/stall, real parser/responses/progress/rooms/save/restore, notes/modal input, errors, finish/download, stopped recording, recovery, blocked storage.');

// Completing the actual adventure must offer the recorder's finish/download flow.
for(const skip of [false,true]){
 const ending=boot();ending.start();while(ending.game.state.popupOpen)ending.game.closeMessage();ending.game.startPlaytest();ending.run('look');while(ending.game.state.popupOpen)ending.game.closeMessage();ending.game.showPlaytest();let panel=ending.game.panel;panel.children.find(e=>e.name==='label').children[0].value='Keep this ending note';panel.children.find(e=>e.textContent==='Save note and return').click();
 ending.game.finishGame();assert(ending.game.recording.events.some(e=>e.type==='completion'));
 if(skip)ending.game.advanceMerrinEnding();else for(let n=0;n<ending.game.endingTotal;n++)for(const fn of [...ending.intervals.values()])fn();
 assert(ending.game.panel,'natural and skipped final cards prompt to download');assert(ending.game.panel.children.some(e=>/Adventure complete/.test(e.textContent||'')));
 ending.game.closePlaytest();ending.game.advanceMerrinEnding();assert(ending.game.panel,'replay cannot bypass report prompt');
 panel=ending.game.panel;panel.children.find(e=>e.name==='label').children[0].value='Finished!';panel.children.find(e=>e.textContent==='Finish and download report').click();
 const final=JSON.parse(ending.downloads.at(-1));assert(final.summary.completed);assert(final.events.some(e=>e.type==='note'&&e.text==='Keep this ending note'));assert(final.events.some(e=>e.type==='command'&&e.text==='look'));assert.equal(final.feedback.review,'Finished!');assert(ending.game.panel.children.some(e=>e.textContent==='Play again'),'download retains report with explicit replay option');
 const reloaded=boot(ending.storage);reloaded.start();reloaded.game.showPlaytest();reloaded.game.panel.children.find(e=>e.textContent==='Recover previous report').click();assert.equal(reloaded.game.recording.events.length,final.events.length,'completed report survives a reload');
 reloaded.advance(1000);reloaded.game.closePlaytest();reloaded.game.startPlaytest();const backup=JSON.parse(reloaded.storage.get('elara-playtest-previous-v1'));assert.equal(backup.events.length,final.events.length,'new recording preserves previous report');assert.equal(backup.feedback.review,'Finished!');const earlier=boot(reloaded.storage);earlier.start();earlier.game.showPlaytest();earlier.game.panel.children.find(e=>e.textContent==='Recover earlier report').click();assert.equal(earlier.game.recording.feedback.review,'Finished!');assert.equal(earlier.game.recording.events.length,final.events.length,'earlier draft remains recoverable after starting a new recording');
}
console.log('PASS real completion and ending skip prompt, replay guard, final feedback/download with preserved notes/commands, reload recovery and previous-draft backup.');
