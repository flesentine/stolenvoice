// Real embedded keyboard/parser/save acceptance for the sliding sluice.
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),design=JSON.parse(fs.readFileSync('assets/sluice-sliding-design.json'));
let h=fs.readFileSync('tools/check-expanded-adventure.cjs','utf8');h=h.slice(0,h.indexOf("check('Eight rooms"));h=h.replace('globalThis.game={command,','globalThis.game={get releaseFrame(){return millSluiceReleaseFrame},get sluice(){return millSluiceTurns.slice()},get selected(){return millSluiceSelected},get held(){return millSluiceHeld},get sluiceOpen(){return millSluiceOpen},get pulse(){return millSluicePulse},flow:millSluiceFlow,art:millSluicePixels,command,');
const s={require,console,Buffer,__dirname};vm.createContext(s);vm.runInContext(h+';globalThis.qa={boot,approach};',s);const{boot,approach}=s.qa;
function drain(a){for(let n=0;a.game.state.popupOpen&&n<40;n++)a.game.closeMessage()}
function fixture(flags={}){const a=boot();a.start();a.game.saveGame();const save=JSON.parse(a.storage.get(a.game.key));save.room=5;save.player={x:160,y:210,step:0,facing:'back'};Object.assign(save.flags,flags);return save}
function restore(save){const a=boot(new Map([['stolen-voice-agi-save-v2',JSON.stringify(save)]]));a.start();a.game.restoreGame();drain(a);return a}
function open(a,text='inspect sluice'){drain(a);approach(a,'wheel');a.game.command(text);assert(a.game.sluiceOpen,text)}
function choose(a,target){if(a.game.held)a.key('Enter');let guard=0;while(Math.floor(a.game.selected/4)!==Math.floor(target/4)&&guard++<10)a.key(a.game.selected<target?'ArrowDown':'ArrowUp');while(a.game.selected%4!==target%4&&guard++<20)a.key(a.game.selected%4<target%4?'ArrowRight':'ArrowLeft');assert.equal(a.game.selected,target)}
function slide(a,move){choose(a,move.from);const previous=Array.from(a.game.sluice),tile=previous[move.from];assert(tile>0&&tile!==7);assert.equal(previous[move.to],0);a.key('Enter');assert(a.game.held);a.key(({1:'ArrowRight','-1':'ArrowLeft',4:'ArrowDown','-4':'ArrowUp'})[move.to-move.from]);assert.equal(a.game.sluice[move.to],tile);assert.equal(a.game.sluice[move.from],0);assert.equal(a.game.sluice[7],7);if(a.game.sluiceOpen)a.key('Enter')}
// Ordinary discovery commands enter the same puzzle, without changing progress.
for(const text of ['use tray','look tray','inspect the sluice tray','look mechanism','use mechanism','fix wheel','use wheel','operate wheel','look controls','inspect blocks','look puzzle','slide blocks','move tiles','arrange troughs']){
 const probe=restore(fixture());open(probe,text);assert(!probe.game.state.flags.wheelUnlocked);assert.equal(probe.game.state.score,0);probe.key('Escape');assert(!probe.game.sluiceOpen);
}
const a=restore(fixture({oilTaken:true}));approach(a,'wheel');a.game.command('turn wheel');assert(!a.game.sluiceOpen);assert.match(a.message,/brake/);assert.match(a.message,/finger grips/);assert.doesNotMatch(a.message,/LOOK\s+PANEL/);drain(a);a.game.command('oil wheel');drain(a);assert(!a.game.state.flags.wheelUnlocked);open(a,'look at panel');assert.deepEqual(Array.from(a.game.sluice),design.initial);
const player=a.game.state.player,input=a.get('#input').value;a.key('z');assert.deepEqual(a.game.state.player,player);assert.equal(a.get('#input').value,input);
choose(a,7);a.key('Enter');assert(!a.game.held);assert.equal(a.game.sluice[7],7);
choose(a,0);a.key('Enter');const before=Array.from(a.game.sluice);a.key('ArrowLeft');a.key('ArrowRight');assert.deepEqual(Array.from(a.game.sluice),before);a.key('Tab');assert(a.game.sluiceOpen);a.key('Escape');assert(!a.game.sluiceOpen);
open(a);slide(a,design.solution[0]);const partial=Array.from(a.game.sluice);a.key('u');assert.deepEqual(Array.from(a.game.sluice),design.initial);slide(a,design.solution[0]);a.key('r');assert.deepEqual(Array.from(a.game.sluice),design.initial);a.key('u');assert.deepEqual(Array.from(a.game.sluice),partial);
a.key('Escape');a.game.saveGame();const b=boot(a.storage);b.start();b.game.restoreGame();drain(b);assert.deepEqual(Array.from(b.game.sluice),partial);assert(!b.game.held);open(b);b.key('r');const score=b.game.state.score;
for(let i=0;i<design.solution.length;i++){slide(b,design.solution[i]);assert.equal(b.game.state.flags.wheelUnlocked,false)}
// The final slide holds on flowing water, without awarding or starting the hoist early.
assert(b.game.sluiceOpen);assert.equal(b.game.releaseFrame,0);assert.match(b.message,/Water pours/);
const dryArt=Array.from(b.game.art()),winningBoard=Array.from(b.game.sluice);
b.doc.hidden=true;for(let n=0;n<5;n++)for(const tick of [...b.intervals.values()])tick();assert.equal(b.game.releaseFrame,0,'hidden payoff pauses');b.doc.hidden=false;
for(const h of b.handlers.get('window:blur')||[])h.fn();for(let n=0;n<5;n++)for(const tick of [...b.intervals.values()])tick();assert.equal(b.game.releaseFrame,0,'unfocused payoff pauses');for(const h of b.handlers.get('window:focus')||[])h.fn();
b.key('r');b.key('u');b.key('ArrowLeft');assert.deepEqual(Array.from(b.game.sluice),winningBoard);
b.game.saveGame();assert(b.game.sluiceOpen,'saving cannot replace the payoff or serialize a half-committed win');
for(let n=0;n<12;n++)for(const tick of [...b.intervals.values()])tick();
assert.equal(b.game.releaseFrame,12);assert.match(b.message,/heavy bucket/);assert.notDeepEqual(Array.from(b.game.art()),dryArt);
assert(!b.game.state.flags.wheelUnlocked);assert.equal(b.game.state.score,score);
for(let n=0;n<12;n++)for(const tick of [...b.intervals.values()])tick();
assert(b.game.sluiceOpen,'solved close-up holds beyond the previous 4.32-second cutoff');
assert.equal(b.game.releaseFrame,24);assert(!b.game.state.flags.wheelUnlocked);
for(let n=0;n<12;n++)for(const tick of [...b.intervals.values()])tick();
assert.equal(b.game.releaseFrame,36);assert(b.game.sluiceOpen);assert.match(b.message,/wheel is free/);
for(let n=0;n<100;n++)for(const tick of [...b.intervals.values()])tick();
assert(b.game.sluiceOpen,'success popup waits indefinitely for the reader');assert.equal(b.game.releaseFrame,36);assert(!b.game.state.flags.wheelUnlocked);
b.key('Enter');
assert.equal(design.minimumMoves,12);assert.equal(design.goalCount,103);assert(!b.game.sluiceOpen);assert(b.game.flow().solved);assert(b.game.state.flags.wheelTurned);assert.equal(b.game.state.score,score+5);drain(b);b.game.saveGame();const won=boot(b.storage);won.start();won.game.restoreGame();assert(won.game.state.flags.wheelTurned);assert.equal(won.game.state.score,score+5);drain(b);b.game.command('inspect panel');assert(!b.game.sluiceOpen);assert.equal(b.game.state.score,score+5);drain(b);b.game.command('turn wheel');assert(b.game.state.flags.wheelTurned);
// Older rotating-panel saves retain completed brakes; unfinished ones get the new tray.
for(const unlocked of [false,true]){const old=fixture({wheelUnlocked:unlocked});old.sluiceRevision=2;old.sluice=unlocked?[0,0,2,1,0,3,0,0,0]:[1,0,3,2,3,2,3,2,0];const c=restore(old);assert.equal(c.game.state.room,5);assert.equal(c.game.state.flags.wheelUnlocked,unlocked);assert.equal(c.game.flow().solved,unlocked);assert.equal(c.game.state.flags.wheelTurned,unlocked);assert.equal(c.game.sluice.length,16)}
for(const corrupt of [[],design.initial.map(()=>0),design.initial.map((v,i)=>i===7?0:v),design.initial.map((v,i)=>i===0?1.5:v)]){const bad=fixture();bad.sluice=corrupt;const c=restore(bad);assert.equal(c.game.state.room,0,'invalid new save rejected')}
// Exercise the actual popup click handler at multiple CSS scales and offsets.
function click(a,index,scale=3){const rect={left:37,top:51,width:320*scale,height:200*scale};a.get('#agi-message-picture').getBoundingClientRect=()=>rect;const x=31+index%4*26,y=29+Math.floor(index/4)*28;const e={clientX:rect.left+x*2*scale,clientY:rect.top+(y+8)*scale,preventDefault(){},stopPropagation(){}};for(const fn of a.get('#agi-message').listeners.click||[])fn(e)}
const mouse=restore(fixture());open(mouse);const initial=Array.from(mouse.game.sluice);click(mouse,7);assert(mouse.game.sluiceOpen);assert.deepEqual(Array.from(mouse.game.sluice),initial);click(mouse,0);assert.deepEqual(Array.from(mouse.game.sluice),initial);assert(mouse.game.held);click(mouse,10);assert.equal(mouse.game.selected,10,'another block click changes selection');assert.deepEqual(Array.from(mouse.game.sluice),initial);
for(const scale of [1,2.5,4]){mouse.key('r');click(mouse,10,scale);assert.deepEqual(Array.from(mouse.game.sluice),initial,'first click only selects');assert(mouse.game.held);click(mouse,15,scale);assert.deepEqual(Array.from(mouse.game.sluice),initial,'non-adjacent gap cannot move selected tile');assert(mouse.game.held);click(mouse,6,scale);assert.equal(mouse.game.sluice[6],initial[10]);assert.equal(mouse.game.sluice[10],0);assert(mouse.game.sluiceOpen)}
// Clicking outside the picture must never dismiss the mechanism.
for(const fn of mouse.get('#agi-message').listeners.click||[])fn({clientX:0,clientY:0,preventDefault(){},stopPropagation(){}});assert(mouse.game.sluiceOpen);
mouse.key('r');for(const move of design.solution){click(mouse,move.from);if(mouse.game.held)click(mouse,move.to)}assert(mouse.game.flow().solved);assert(mouse.game.sluiceOpen);assert(!mouse.game.state.flags.wheelUnlocked);mouse.key('Escape');assert(mouse.game.sluiceOpen,'cannot dismiss before the water payoff finishes');for(let n=0;n<36;n++)for(const tick of [...mouse.intervals.values()])tick();click(mouse,0);assert(mouse.game.state.flags.wheelUnlocked);assert(mouse.game.state.flags.wheelTurned);assert(!mouse.game.sluiceOpen);
open(a);click(a,10);a.key('Escape');assert(!a.game.sluiceOpen);
// The hoist starts after the water payoff (or Escape), without a TURN command.
assert(mouse.intervals.size>0);for(let n=0;n<15;n++)for(const tick of [...mouse.intervals.values()])tick();assert.match(mouse.message,/hoist\s+raises/);assert(!mouse.game.state.flags.cabinetOpen);
const released=fixture({wheelUnlocked:true});released.sluice=design.solved;const resumed=restore(released);assert(resumed.game.state.flags.wheelTurned);assert.equal(resumed.game.state.score,5);
const art=b.game.art();assert.equal(art.length,160*168);assert(art.every(v=>v<16));
console.log('PASS sliding sluice: 12-slide keyboard solution, fixed orientations/stone, no illegal swaps, undo/reset, partial saves, old-save migration, oil cannot bypass, one reward and native EGA art.');

for(const text of ['look mechanism','look at mechanism','inspect mechanism']){
 const save=fixture();save.player={x:244,y:195,step:0,facing:'back'};const front=restore(save);
 assert(front.game.canStand(244,195,5));front.game.command(text);assert(front.game.sluiceOpen,text+' works directly in front of the panel');
 assert.equal(front.game.state.score,0);
}
const distantSave=fixture();distantSave.player={x:308,y:235,step:0,facing:'back'};const distant=restore(distantSave);distant.game.command('look mechanism');assert(!distant.game.sluiceOpen);assert.match(distant.message,/closer/);
console.log('PASS mechanism aliases from the panel approach, plus distant refusal.');

// Exact wording is available deliberately; default discovery stays observational.
for(const text of ['look','help','hint','turn wheel']){
 const a=restore(fixture());approach(a,'wheel');const before=a.game.state;
 a.game.command(text);assert.doesNotMatch(a.message,/LOOK\s+PANEL/,text+' stays gentle');
 assert(!a.game.sluiceOpen);assert.deepEqual(a.game.state.flags,before.flags);assert.equal(a.game.state.score,before.score);
 drain(a);a.game.command('hint command');assert.match(a.message,/LOOK\s+PANEL/,'explicit wording request');
 drain(a);a.game.command('look panel');assert(a.game.sluiceOpen,'advertised command opens actual puzzle');a.key('Escape');
}
console.log('PASS gentle mill discovery and opt-in HINT COMMAND wording, which opens the real puzzle.');
