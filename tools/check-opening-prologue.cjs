const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
let h=fs.readFileSync('tools/check-expanded-adventure.cjs','utf8').split("check('Eight rooms")[0];h=h.replace('const sandbox={','let qaNow=0;const QaDate=class extends Date{static now(){return qaNow}};const sandbox={Date:QaDate,').replace('setInterval(fn){','setInterval(fn,delay){const callback=fn;if(fn.name===\'syncPrologueClock\')fn=()=>{qaNow+=delay;callback()};');h=h.replace('globalThis.game={command,','globalThis.game={paintPrologueCandle,get candleState(){return {...prologueCandleState}},spyCandle(){const calls=[];const paint=paintPrologueCandle;paintPrologueCandle=(...args)=>{calls.push(args.slice(1));return paint(...args)};return calls},spyPennants(){const phases=[];const paint=drawCastlePennant;drawCastlePennant=(...args)=>{phases.push(animationFrame);return paint(...args)};return phases},spyGardenActor(){const calls=[];const paint=gardener;gardener=(...args)=>{calls.push(args);return paint(...args)};return calls},spyHeroPaint(){const calls=[];const paint=hero;hero=(...args)=>{calls.push(args);return paint(...args)};return calls},get closeupKeys(){return [...prologueCloseupCache.keys()]},get prologue(){return {active:prologueActive,frame:prologueFrame,beat:prologueBeat()}},get captions(){return prologueCaptions},forceSound(){soundEnabled=true},spyAudio(){const calls=[];playGameSound=(...args)=>{calls.push(args);effectSource={}};return calls},command,');const s={require,console,Buffer,__dirname};vm.createContext(s);vm.runInContext(h+';globalThis.bootQA=boot',s);
const a=s.bootQA();a.get('#start').onclick();a.get('#start').onclick();assert(a.game.prologue.active);assert(!a.game.state.playing);assert(!a.game.state.popupOpen);
const tick=()=>{for(const fn of [...a.intervals.values()])fn()};
a.doc.hidden=true;for(let i=0;i<10;i++)tick();assert.equal(a.game.prologue.frame,10);a.doc.hidden=false;
const snapshots=[];for(let i=0;i<288;i++){snapshots.push(a.game.prologue.beat);tick()}
assert.equal(new Set(snapshots).size,6);assert(!a.game.prologue.active);assert(!a.get('#intro').isConnected);assert(a.game.state.popupOpen);assert.equal(a.game.state.score,0);assert(!a.game.state.flags.voiceReturned);
while(a.game.state.popupOpen)a.game.closeMessage();assert(a.game.state.playing);assert.equal(a.game.state.room,0);
for(const lines of a.game.captions)for(const line of lines)assert(line.length<=40,line);
const b=s.bootQA();b.get('#start').onclick();b.get('#start').onclick();b.key('Escape');assert(!b.game.prologue.active);assert(b.game.state.popupOpen);
const c=s.bootQA();c.get('#start').onclick();c.get('#start').onclick();for(let beat=0;beat<6;beat++)c.get('#start').onclick();assert(!c.game.prologue.active);assert(!c.get('#intro').isConnected);
console.log('PASS six-scene timed prologue, background progression, Enter advance, Escape skip, caption bounds and clean unearned garden state.');

const music=s.bootQA(),calls=music.game.spyAudio();music.get('#start').onclick();music.game.forceSound();music.get('#start').onclick();assert.equal(calls.length,1);assert.equal(calls[0][0],'prologueStory');
for(let n=0;n<55;n++)for(const fn of [...music.intervals.values()])fn();assert.equal(calls.length,1,'score does not restart at a scene boundary');
music.get('#start').onclick();assert.equal(calls.length,1,'Enter changes captions without restarting music');
music.game.forceSound();music.key('F2');assert.equal(calls.length,1,'mute does not restart audio');music.key('F2');assert.equal(calls.length,2,'unmute resumes audio');assert(Math.abs(calls.at(-1)[2]-7.7)<1e-8);
console.log('PASS continuous score across scenes, independent caption advance and F2 mute/resume.');

const paused=s.bootQA();paused.get('#start').onclick();paused.get('#start').onclick();
for(const handler of paused.handlers.get('window:blur')||[])handler.fn();const frozen=paused.game.prologue.frame;
for(let i=0;i<12;i++)for(const fn of [...paused.intervals.values()])fn();assert.equal(paused.game.prologue.frame,frozen+12);
for(const handler of paused.handlers.get('window:focus')||[])handler.fn();for(const fn of [...paused.intervals.values()])fn();assert.equal(paused.game.prologue.frame,frozen+13);
console.log('PASS focus loss continues animation and focus return preserves progress.');

for(const run of [a,b,c]){assert.deepEqual(JSON.parse(JSON.stringify(run.game.state.player)),{x:102,y:206,step:1,facing:'left'});assert(run.game.canStand(102,206,0),'arrival is on clear garden ground')}
console.log('PASS timed, advanced and skipped intros hand off at the final Elara position, facing and cel.');

const gardenShot=s.bootQA(),actorCalls=gardenShot.game.spyGardenActor();
gardenShot.get('#start').onclick();gardenShot.get('#start').onclick();
for(let beat=0;beat<5;beat++)gardenShot.get('#start').onclick();
assert.equal(gardenShot.game.prologue.beat,5);
assert(actorCalls.some(([x,y])=>x===60&&y===204),'final garden intro paints Merrin at his gameplay position');
assert.equal(gardenShot.game.state.score,0);
console.log('PASS final garden intro renders queued Merrin actor at (60, 204).');

const sequence=s.bootQA();sequence.get('#start').onclick();sequence.get('#start').onclick();
for(let i=0;i<48;i++)for(const fn of [...sequence.intervals.values()])fn();
assert.deepEqual(Array.from(sequence.game.closeupKeys).filter(k=>k.startsWith('0:')),Array.from({length:8},(_,i)=>'0:'+i));
console.log('PASS close-up actions advance through all eight cels once without rewinding.');

for(const mode of ['skip','advance','timed']){
 const arrival=s.bootQA(),paints=arrival.game.spyHeroPaint();
 arrival.get('#start').onclick();arrival.get('#start').onclick();
 if(mode==='skip')arrival.key('Escape');
 else if(mode==='advance')for(let i=0;i<6;i++)arrival.get('#start').onclick();
 else for(let i=0;i<288;i++)for(const fn of [...arrival.intervals.values()])fn();
 assert(arrival.game.state.popupOpen);
 assert.deepEqual(Array.from(paints.at(-1)).slice(0,2),[102,206],mode+' paints arrival before the first popup');
 const before=JSON.stringify(arrival.game.state.player);
 while(arrival.game.state.popupOpen)arrival.game.closeMessage();
 arrival.game.draw();
 assert.equal(JSON.stringify(arrival.game.state.player),before,mode+' holds position through message dismissal');
 assert.deepEqual(Array.from(paints.at(-1)).slice(0,2),[102,206]);
}
console.log('PASS timed, skipped and advanced intros paint the arrival beneath the first popup and keep it after dismissal.');

const waving=s.bootQA(),phases=waving.game.spyPennants();waving.get('#start').onclick();waving.get('#start').onclick();for(let i=0;i<5;i++)waving.get('#start').onclick();phases.length=0;for(let i=0;i<16;i++)for(const fn of [...waving.intervals.values()])fn();assert(new Set(phases).size>=5,'castle pennants wave on the prologue clock');console.log('PASS waving castle flags during the garden intro.');

const candle=s.bootQA(),candleCalls=candle.game.spyCandle();candle.get('#start').onclick();candle.get('#start').onclick();assert(candleCalls.length>0,'intro paints animated candle overlay');
const tickCandle=()=>{for(const fn of [...candle.intervals.values()])fn()};
for(let n=0;n<15;n++)tickCandle();assert(candleCalls.length>10);candle.doc.hidden=true;const pausedCalls=candleCalls.length;for(let n=0;n<8;n++)tickCandle();assert(candleCalls.length>pausedCalls,'hidden intro continues candle');candle.doc.hidden=false;
for(let n=0;n<5;n++)candle.get('#start').onclick();const outdoorCalls=candleCalls.length;tickCandle();assert.equal(candleCalls.length,outdoorCalls,'outdoor final scene has no candle overlay');
const flames=s.bootQA(),paintings=[],flamePhases=new Set();let dots=[];
const flameContext={fillStyle:'',fillRect(x,y,w,h){assert([x,y,w,h].every(Number.isInteger));assert.equal(w,2);assert.equal(h,1);dots.push([x,y,w,h,this.fillStyle])}};
for(let f=0;f<100;f++){
 dots=[];flames.game.paintPrologueCandle(flameContext,f);const once=JSON.stringify(dots),state=JSON.stringify(flames.game.candleState);dots=[];flames.game.paintPrologueCandle(flameContext,f);assert.equal(JSON.stringify(dots),once,'repaint does not reroll flicker');assert.equal(JSON.stringify(flames.game.candleState),state);
 const fire=dots.slice(44);assert(fire.length>=3&&fire.length<=5);assert(fire.every(([x,y,w,h,c])=>x===12&&y>=38&&y<=42&&['#aa5500','#ffff55'].includes(c)),'one slim orange/yellow flame, no darkest-red blob');
 flamePhases.add(flames.game.candleState.phase);paintings.push(dots);
 const hold=flames.game.candleState.next-f;if(hold>0)assert(hold<=4,'unhurried two-to-four tick holds');
}
assert(flamePhases.size>1);dots=[];flames.game.paintPrologueCandle(flameContext,3,true);const steady=JSON.stringify(dots);dots=[];flames.game.paintPrologueCandle(flameContext,83,true);assert.equal(JSON.stringify(dots),steady,'reduced motion stays steady');
fs.writeFileSync('assets/reviews/intro-candle-paint.json',JSON.stringify(paintings));
console.log('PASS intro candle narrow EGA flame, irregular held flicker, stable repaint, background continuation, reduced motion and close-up-only overlay.');
