// The loose-board warning and fall complete before the swimming clock begins.
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
let h=fs.readFileSync('tools/check-expanded-adventure.cjs','utf8').split("check('Eight rooms")[0];
h='const testClock={now:1000};\n'+h.replace('const sandbox={document:','const sandbox={Date:{now:()=>testClock.now},document:').replace('globalThis.game={command,',`
let landingCalls=0;const realLanding=swimmingLanding;swimmingLanding=(...args)=>{landingCalls++;return realLanding(...args)};
let routeCalls=0;const realRoute=swimmingShoreRoute;swimmingShoreRoute=(...args)=>{routeCalls++;return realRoute(...args)};
let slowPaint=null;const realDraw=draw;draw=(...args)=>{if(swimState.active&&slowPaint){const fn=slowPaint;slowPaint=null;fn()}return realDraw(...args)};
const fallSounds=[];playGameSound=(...args)=>fallSounds.push(args);
globalThis.game={get fall(){return bridgeFall&&JSON.parse(JSON.stringify(bridgeFall))},get swim(){return JSON.parse(JSON.stringify(swimState))},get sounds(){return fallSounds},get landingCalls(){return landingCalls},get routeCalls(){return routeCalls},delaySwimPaint(fn){slowPaint=fn},walkTick,tickBridgeFall,tickSwimming,say,command,`);
const s={require,console,Buffer,__dirname};vm.createContext(s);vm.runInContext(h+';globalThis.qa={boot,clock:testClock};',s);const {boot,clock}=s.qa;
const base=boot();base.start();base.game.saveGame();const save=JSON.parse(base.storage.get(base.game.key));
function at(fixed=false,side='west',slipped=false){const data={...save,room:4,player:{x:side==='west'?140:180,y:169,step:1,facing:side==='west'?'right':'left'},flags:{...save.flags,plankTaken:true,bridgePlank:true,twineTaken:true,bridgeFixed:fixed,bridgePlankSlipped:slipped}};const a=boot(new Map([[base.game.key,JSON.stringify(data)]]));a.start();a.game.restoreGame();while(a.game.state.popupOpen)a.game.closeMessage();return a}
const a=at(),before=a.game.state;a.key('ArrowRight');assert(a.game.fall);assert(!a.game.swim.active);assert.equal(a.game.routeCalls,0,'animation begins without a shore search');assert.equal(a.game.landingCalls,0,'animation begins without a landing scan');
const start=a.game.fall.frame;a.doc.hidden=true;a.game.tickBridgeFall();assert.equal(a.game.fall.frame,start);a.doc.hidden=false;
const storedBefore=a.storage.get(a.game.key);a.game.saveGame();assert.equal(a.storage.get(a.game.key),storedBefore,'saving during fall leaves previous save intact');assert.equal(a.game.fall.frame,start);assert.match(a.message,/landed\s+before saving/);while(a.game.state.popupOpen)a.game.closeMessage();
for(const {fn}of a.handlers.get('window:blur')||[])fn();a.game.tickBridgeFall();assert.equal(a.game.fall.frame,start);for(const {fn}of a.handlers.get('window:focus')||[])fn();
a.game.say('Pause the fall.');a.game.tickBridgeFall();assert.equal(a.game.fall.frame,start,'popup pauses fall');while(a.game.state.popupOpen)a.game.closeMessage();
for(let f=1;f<24;f++){clock.now+=75;a.game.tickBridgeFall();assert.equal(a.game.fall.frame,f);assert(!a.game.swim.active,'no countdown during fall');assert.equal(a.game.swim.remaining,8000);assert.equal(a.game.sounds.filter(c=>c[0]==='bridgePlank').length,1,'creak starts with first tipping frame');assert.equal(a.game.sounds.filter(c=>c[0]==='fallWater').length,f>=16?1:0,'falling cue leads into visible frame-18 splash')}
assert.equal(a.game.sounds.filter(c=>c[0]==='bridgePlank').length,1,'one creak as board tips');
a.game.delaySwimPaint(()=>{clock.now+=3000});clock.now+=75;a.game.tickBridgeFall();assert(!a.game.fall);assert(a.game.swim.active);assert.equal(a.game.swim.remaining,8000,'full swimming time after splash');assert.equal(a.game.landingCalls,0,'authored splash point avoids landing scans before and after animation');
assert.equal(a.game.sounds.filter(c=>c[0]==='fallWater').length,1,'one splash cue');assert.deepEqual({...a.game.state.flags},{...before.flags,bridgePlankSlipped:true});assert.equal(a.game.state.score,before.score);
clock.now+=1000;a.game.tickSwimming();assert.equal(a.game.swim.remaining,7000);
a.game.restoreGame();while(a.game.state.popupOpen)a.game.closeMessage();assert(!a.game.fall&&!a.game.swim.active,'restore clears fall and water state');
const safe=at(true);safe.game.movePlayer(0,-7);for(let n=0;n<10;n++)safe.game.movePlayer(5,0);assert(!safe.game.fall&&!safe.game.swim.active,'lashed bridge remains safe when player lines up with plank');
console.log('PASS actual keyboard loose-plank fall: 24 frames, background/modal pause, one creak/splash, full eight-second swim clock, preserved score/plank, restore and safe lashed crossing.');

for(const side of ['west','east'])for(const action of ['keyboard','swim back','get out']){
 const rescue=at(false,side);rescue.key(side==='west'?'ArrowRight':'ArrowLeft');for(let n=0;n<8&&!rescue.game.fall;n++)rescue.game.walkTick();assert(rescue.game.fall);
 for(let f=0;f<24;f++){clock.now+=75;rescue.game.tickBridgeFall()}
 assert(rescue.game.swim.active);clock.now+=2000;rescue.game.tickSwimming();assert.equal(rescue.game.swim.remaining,6000);
 const before=rescue.game.state.player;if(action==='keyboard'){rescue.key(side==='west'?'ArrowLeft':'ArrowRight');rescue.game.walkTick()}else rescue.game.command(action);
 assert(rescue.game.swim.route?.length||rescue.game.state.player.x!==before.x||!rescue.game.swim.active,'homeward input works immediately');
 for(let n=0;n<55&&rescue.game.swim.active;n++){clock.now+=100;rescue.game.walkTick();rescue.game.tickSwimming()}
 assert(!rescue.game.swim.active&&!rescue.game.swim.dead,action+' rescue after reaction delay on '+side);
}
console.log('PASS slow first paint costs no swim time; immediate homeward controls plus keyboard/SWIM BACK/GET OUT rescues from both banks after two-second reaction delay.');

const timeout=at();timeout.key('ArrowRight');for(let f=0;f<24;f++){clock.now+=75;timeout.game.tickBridgeFall()}
clock.now+=7999;timeout.game.tickSwimming();assert(timeout.game.swim.active);clock.now++;timeout.game.tickSwimming();assert(timeout.game.swim.dead,'eight full active seconds before drowning');timeout.key('Enter');assert(!timeout.game.swim.active&&!timeout.game.swim.dead,'retry returns to bank');
console.log('PASS exact eight-second hazard and retry from bank.');

const hanging=at(false,'west',true);hanging.game.saveGame();hanging.game.restoreGame();while(hanging.game.state.popupOpen)hanging.game.closeMessage();assert(hanging.game.state.flags.bridgePlankSlipped,'crooked board survives save/restore');
const repeat=at(false,'west',true);repeat.key('ArrowRight');assert(repeat.game.fall,'repeat crossing still falls into the gap');
for(let f=0;f<24;f++){clock.now+=75;repeat.game.tickBridgeFall()}
assert(repeat.game.swim.active);assert.equal(repeat.game.swim.remaining,8000);assert(repeat.game.state.flags.bridgePlankSlipped);assert.equal(repeat.game.sounds.filter(c=>c[0]==='bridgePlank').length,0,'slipped plank does not tip or creak again');assert.equal(repeat.game.sounds.filter(c=>c[0]==='fallWater').length,1,'repeat fall still splashes once');
const score=hanging.game.state.score;hanging.game.command('secure wood with twine');assert(hanging.game.state.flags.bridgeFixed&&!hanging.game.state.flags.bridgePlankSlipped,'lashing reseats and secures same board');assert.equal(hanging.game.state.score,score+5);
const reseat=at(false,'west',true),oldScore=reseat.game.state.score;reseat.game.command('put wood on bridge');assert(!reseat.game.state.flags.bridgePlankSlipped&&!reseat.game.state.flags.bridgeFixed);assert.equal(reseat.game.state.score,oldScore,'reseating awards no duplicate placement points');
console.log('PASS dislodged board persists, can be reseated without extra points, and is restored by lashing.');
