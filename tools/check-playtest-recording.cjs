// Exercise actual standalone hooks and native modal callbacks with controlled time.
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
let h=fs.readFileSync('tools/check-expanded-adventure.cjs','utf8').split("check('Eight rooms")[0];
h=h.replace('globalThis.game={command,','globalThis.game={startPlaytest,showPlaytest,closePlaytest,playtestReport,downloadPlaytest,playtestTick,progress,changeRoom,drown,retryAfterDrowning,get recording(){return playtest},get panel(){return playtestDialog},command,');
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
