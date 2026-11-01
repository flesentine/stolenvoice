const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
let h=fs.readFileSync('tools/check-expanded-adventure.cjs','utf8').split("check('Eight rooms")[0];
h=h.replace('globalThis.game={command,','const heard=[];let stopped=0;playGameSound=(...args)=>{if(soundEnabled){heard.push(args);effectSource={}}};stopGameSound=()=>{stopped++;effectSource=null};globalThis.game={get stopped(){return stopped},setMuted(value){soundEnabled=!value;if(value)stopGameSound()},get heard(){return heard},tickStoryEffect,drawChairRestHero,chairPaceOffset,get action(){return storyAction&&{...storyAction}},setPose(stage,frame){storyAction.stage=stage;storyAction.frame=frame},reduced(){window.matchMedia=()=>({matches:true})},place(r,x,y,returned=false){soundEnabled=true;room=r;flags.voiceReturned=returned;player={x,y,step:1,facing:"back"}},command,');
const s={require,console,Buffer,__dirname};vm.createContext(s);vm.runInContext(h+';globalThis.bootQA=boot;',s);
function drain(a){let n=0;while(a.game.state.popupOpen&&n++<20)a.game.closeMessage();assert(n<20)}
function at(r=1,x=222,y=190){const a=s.bootQA();a.start();drain(a);a.game.place(r,x,y);return a}
for(const text of ['sit','sit down','sit in chair','sit on throne','take a seat']){
 const a=at(),before=a.game.state;a.game.command(text);assert.equal(a.game.action.stage,'sit');assert(!a.game.state.popupOpen);
 for(let n=0;n<7;n++)a.game.tickStoryEffect();assert(!a.game.heard.some(c=>c[0]==="chairCreak"),'no creak before contact');a.game.tickStoryEffect();assert.equal(a.game.heard.filter(c=>c[0]==="chairCreak").length,1);assert.equal(a.game.heard.at(-1)[3],.55);for(let n=0;n<4;n++)a.game.tickStoryEffect();assert.equal(a.game.action.stage,'message');assert(!a.game.heard.some(c=>c[0]==='chairPace'),'no tune while sitting/reading');assert(a.game.state.popupOpen);assert.match(a.message.replace(/\s+/g,' '),/paving stone/);
 const held=a.game.action.frame;for(let n=0;n<12;n++)a.game.tickStoryEffect();assert.equal(a.game.action.frame,held,'stays seated while reading');
 a.key('Enter');assert.equal(a.game.action.stage,'pace');assert(!a.game.state.popupOpen);
 const offsets=new Set();for(let n=0;n<48;n++){offsets.add(a.game.chairPaceOffset(n));assert(a.game.canStand(before.player.x+a.game.chairPaceOffset(n),before.player.y));a.game.tickStoryEffect()}
 assert.equal(a.game.heard.filter(c=>c[0]==='chairPace').length,1,'one pacing melody after dismissing popup');assert(a.game.stopped>0,'completed gag stops owned melody');
 assert(offsets.size>5&&Math.min(...offsets)<0&&Math.max(...offsets)>0,'paces both ways on clear floor');assert(!a.game.action);assert(a.game.state.popupOpen);assert.match(a.message.replace(/\s+/g,' '),/Ow! My royal back!.*more padding/);drain(a);a.game.tickStoryEffect();assert(!a.game.state.popupOpen&&!a.game.action,'last complaint closes without restarting the gag');
 assert.equal(a.game.heard.filter(c=>c[0]==="chairCreak").length,1,'one creak per sitting');
 for(const key of ['flags','inv','score','player'])assert.deepEqual(a.game.state[key],before[key],text+' preserves '+key);
}
const skipped=at();skipped.game.command('sit');skipped.key('Enter');assert.equal(skipped.game.action.stage,'message');assert.equal(skipped.game.heard.filter(c=>c[0]==="chairCreak").length,1,'skipping to seat still creaks once');drain(skipped);assert.equal(skipped.game.action.stage,'pace');skipped.game.movePlayer(1,0);assert(!skipped.game.action,'walking interrupts recovery');
const saved=at();saved.game.command('sit');saved.game.saveGame();assert(!saved.game.action);assert(saved.storage.has(saved.game.key));
const reduced=at();reduced.game.reduced();reduced.game.command('sit');assert(!reduced.game.action);assert(reduced.game.state.popupOpen);drain(reduced);assert(!reduced.game.action,'reduced motion leaves no pending recovery');
const hidden=at();hidden.game.command('sit');hidden.doc.hidden=true;hidden.game.tickStoryEffect();assert.equal(hidden.game.action.frame,0);
for(const a of [at(0),at(1,40,210)]){a.game.command('sit');assert(!a.game.action,'locality/reach enforced')}
// Capture actual native paint calls for visual review against authored chair.
const art=at();art.game.command('sit');const context=art.get('canvas').getContext('2d'),frames=[];let pixels=[];
context.fillRect=function(x,y,w,h){pixels.push([x,y,w,h,this.fillStyle])};
for(const [stage,limit]of [['sit',12],['pace',48]])for(let n=0;n<limit;n+=2){pixels=[];art.game.setPose(stage,n);art.game.drawChairRestHero(222,190);assert(pixels.length>0);assert(pixels.every(p=>p.slice(0,4).every(Number.isInteger)));frames.push(pixels)}
fs.writeFileSync('assets/reviews/chair-rest-paint.json',JSON.stringify(frames));
console.log('PASS chair aliases, sitting before popup, seated reading hold, paced recovery after Enter, safe floor, unchanged state, interruption/save, hidden pause, reduced motion and native poses.');

const pacing=at();pacing.game.command('sit');pacing.key('Enter');drain(pacing);pacing.game.tickStoryEffect();assert.equal(pacing.game.heard.at(-1)[0],'chairPace');assert.equal(pacing.game.heard.at(-1)[2],0);
pacing.doc.hidden=true;pacing.game.tickStoryEffect();const heldPace=pacing.game.action.frame,stops=pacing.game.stopped;assert(stops>0);pacing.doc.hidden=false;pacing.game.tickStoryEffect();assert.equal(pacing.game.heard.at(-1)[2],heldPace*.09,'resume melody at frozen pacing beat');
pacing.game.setMuted(true);pacing.game.tickStoryEffect();const heardMuted=pacing.game.heard.length;pacing.game.tickStoryEffect();assert.equal(pacing.game.heard.length,heardMuted);pacing.game.setMuted(false);const resumeAt=pacing.game.action.frame;pacing.game.tickStoryEffect();assert.equal(pacing.game.heard.at(-1)[2],resumeAt*.09);
const beforeStop=pacing.game.stopped;pacing.game.movePlayer(1,0);assert(!pacing.game.action);assert.equal(pacing.game.stopped,beforeStop+1,'walking stops the pacing melody');
console.log('PASS chair tune starts with recovery, follows frozen/resumed beats and mute, and stops on completion/interruption.');
