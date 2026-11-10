// Exercise the generated standalone, including its capture handlers and audio graph.
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
let h=fs.readFileSync('tools/check-expanded-adventure.cjs','utf8').split("check('Eight rooms")[0];
h=h.replace('const window={addEventListener',`let qaNow=0;const audio=[];
 class FakeAudio{
  constructor(){this.destination={};this.currentTime=0;this.state='running';this.resumes=0;this.gains=[]}
  createGain(){const node={connect(){},gain:{value:1,setTargetAtTime(value){this.value=value}}};this.gains.push(node);return node}
  createBuffer(c,n,rate){return{getChannelData:()=>new Float32Array(n),duration:n/rate}}
  createBufferSource(){const source={connect(output){this.output=output},start(time,offset=0){this.offset=offset},stop(){this.stopped=true},disconnect(){}};audio.push(source);return source}
  resume(){this.state='running';this.resumes++;return Promise.resolve()}
 }
 const window={AudioContext:FakeAudio,addEventListener`);
h=h.replace('const sandbox={',"const QaDate=class extends Date{static now(){return qaNow}};const sandbox={qaAudio:audio,qaAdvance:ms=>{qaNow+=ms},Date:QaDate,setTimeout:()=>1,clearTimeout(){},");
h=h.replace('globalThis.game={command,',`globalThis.game={get help(){return instructions},get audio(){return qaAudio},get context(){return jingleContext},get volume(){return masterVolume},get duration(){return captionDuration},get prologue(){return {active:prologueActive,frame:prologueFrame}},jump(ms){qaAdvance(ms);syncPrologueClock()},validateAdventureSave,describeRoom,hivePixels,hiveContact,closeHive,setWax(){flags.waxTaken=true},get wax(){return flags.waxTaken},place(r,x,y){room=r;player={x,y,step:1,facing:'front'}},command,`);
const s={require,console,Buffer,__dirname};vm.createContext(s);vm.runInContext(h+';globalThis.qa={boot,travel,approach};',s);
const {boot}=s.qa;
function hotkey(a,key,extra={}){const e=Object.assign(a.event(key),extra);for(const h of [...a.handlers.get('keydown')].sort((a,b)=>Number(b.capture)-Number(a.capture))){h.fn(e);if(e.stopped)break}return e}
function emit(a,name){for(const h of a.handlers.get(name)||[])h.fn()}
const a=boot();assert.match(a.game.help,/F3: repeat your last command/);assert.match(a.game.help,/ALT\+UP\/DOWN: volume/);assert.match(a.game.help,/ALT\+LEFT\/RIGHT: intro text duration/);
for(const key of ['F1','F2','F3','F5','F7'])assert(hotkey(a,key).defaultPrevented,key+' suppresses browser action on title');
assert(!a.storage.has(a.game.key),'intro F5 does not save');
// F2 above muted the title; restore it before the user gesture starts music.
hotkey(a,'F2');a.get('#start').onclick();const title=a.game.audio.at(-1);
hotkey(a,'ArrowDown',{altKey:true});assert.equal(a.game.volume,.9);assert.equal(title.output.gain.value,.9,'live title source shares master gain');
emit(a,'window:blur');a.doc.hidden=true;emit(a,'visibilitychange');assert(!title.stopped,'title score keeps playing on focus loss');a.doc.hidden=false;
a.get('#start').onclick();const story=a.game.audio.at(-1);assert(story.loop);assert(title.stopped);assert.equal(story.output,title.output,'synthesized score shares title master gain');
const sources=a.game.audio.length;emit(a,'window:blur');a.doc.hidden=true;emit(a,'visibilitychange');assert(!story.stopped);
a.game.jump(7000);assert.equal(a.game.prologue.frame,50,'wall time advances while hidden');a.doc.hidden=false;emit(a,'visibilitychange');emit(a,'window:focus');assert.equal(a.game.audio.length,sources,'focus return does not duplicate score');
a.game.context.state='suspended';emit(a,'window:focus');assert.equal(a.game.context.state,'running');assert.equal(a.game.audio.length,sources);
for(let i=0;i<20;i++)hotkey(a,'ArrowDown',{altKey:true});assert.equal(a.game.volume,0);assert.equal(story.output.gain.value,0);
for(let i=0;i<20;i++)hotkey(a,'ArrowUp',{altKey:true});assert.equal(a.game.volume,1);
hotkey(a,'F2');assert(story.stopped);hotkey(a,'ArrowDown',{altKey:true});const mutedSources=a.game.audio.length;assert.equal(a.game.audio.length,mutedSources,'volume change does not unmute');hotkey(a,'F2');assert.equal(a.game.audio.length,mutedSources+1);assert.equal(a.game.audio.at(-1).output.gain.value,.9);
const frame=a.game.prologue.frame;hotkey(a,'ArrowRight',{altKey:true});assert.equal(a.game.duration,1.5);assert.equal(a.game.prologue.frame,frame,'rate change keeps current progress');a.game.jump(2100);assert.equal(a.game.prologue.frame,frame+10);
hotkey(a,'ArrowLeft',{altKey:true});hotkey(a,'ArrowLeft',{altKey:true});assert.equal(a.game.duration,.75);const fastFrame=a.game.prologue.frame;a.game.jump(1050);assert.equal(a.game.prologue.frame,fastFrame+10);
const restored=boot(a.storage);assert.equal(restored.game.volume,.9);assert.equal(restored.game.duration,.75);
a.game.jump(100000);assert(!a.game.prologue.active);const arrivals=a.game.state.player;emit(a,'window:focus');assert.deepEqual(a.game.state.player,arrivals);
while(a.game.state.popupOpen)a.game.closeMessage();hotkey(a,'F5');assert(a.storage.has(a.game.key),'F5 saves after intro');
const save=JSON.parse(a.storage.get(a.game.key));delete save.flags.appleCarried;assert.equal(a.game.validateAdventureSave(JSON.stringify(save)).nextFlags.appleCarried,false,'old saves migrate absent apple');save.flags.appleCarried='yes';assert.throws(()=>a.game.validateAdventureSave(JSON.stringify(save)));
a.game.place(3,118,205);a.run('take apple');a.game.closeMessage();a.run('look apple');assert.match(a.message,/firm red apple/,'parser examines the carried apple');a.game.closeMessage();a.game.place(0,102,206);assert.match(a.game.describeRoom(),/red rose grows/);a.game.place(0,273,211);a.run('take rose');assert.match(a.game.describeRoom(),/rose you picked is in your satchel/);
for(const [x,y]of [[18,178],[20,189],[25,201],[300,218],[311,223],[296,180]])assert(!a.game.canStand(x,y,0),'solid garden ground '+x+','+y);
for(const [x,y]of [[42,210],[273,211],[286,201],[308,200]])assert(a.game.canStand(x,y,0),'reachable garden ground '+x+','+y);
for(const [x,y]of [[106,174],[130,174],[226,175],[250,175]])assert(!a.game.canStand(x,y,3),'tree root ground '+x+','+y);
for(const [x,y]of [[118,205],[27,202],[206,212],[286,201]])assert(a.game.canStand(x,y,3),'reachable orchard ground '+x+','+y);
// Cardinal and diagonal attempts must never put the feet inside a solid.
for(const [r,x,y,dx,dy]of [[0,42,190,-3,0],[0,42,190,-3,3],[0,286,220,3,0],[0,286,220,3,3],[3,118,205,0,-3],[3,137,205,-3,-3]]){
 while(a.game.state.popupOpen)a.game.closeMessage();a.game.place(r,x,y);
 for(let n=0;n<8;n++){a.game.movePlayer(dx,dy);const p=a.game.state.player;assert(a.game.canStand(p.x,p.y,a.game.state.room),'movement stays on legal ground')}
}
while(a.game.state.popupOpen)a.game.closeMessage();a.game.place(3,206,212);a.game.command('take wax');
const contacts=Array.from({length:100},(_,i)=>a.game.hiveContact(i,1));const pixels=a.game.hivePixels();assert(pixels.slice(136*160).some((color,i)=>i%160>=72&&i%160<=87&&color===12),'resting hand is visible before reaching');
assert.deepEqual(Array.from({length:100},(_,i)=>a.game.hiveContact(i,1)),contacts,'idle drawing does not change reach collisions');
console.log('PASS first playtest: title/prologue function keys, shared live master gain and limits, independent mute, background clock/audio ownership/recovery, caption rates and persistence, apple migration, rose states, collision samples and idle hive hand.');
