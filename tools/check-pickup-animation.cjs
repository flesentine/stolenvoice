// Regression cases from the simulated newcomer transcript, against the built game.
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path'),read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');let h=read('tools/check-expanded-adventure.cjs');h=h.slice(0,h.indexOf("check('Eight rooms"));h=h.replace('globalThis.game={command,','globalThis.game={pickupPose,pickupStillInScene,tickStoryEffect,get effect(){return storyAction?{...storyAction}:null},reducedMotion(){window.matchMedia=()=>({matches:true})},get swim(){return swimState},command,');const s={require,console,Buffer,__dirname};vm.createContext(s);vm.runInContext(h+';globalThis.qa={boot,approach};',s);const {boot}=s.qa,base=boot();base.start();base.game.saveGame();const key=base.game.key,save=JSON.parse(base.storage.get(key));let count=0;
const equipped={rose:true,bell:true,oilTaken:true,twineTaken:true,plankTaken:true,shearsTaken:true,shearsReady:true,waxTaken:true};
const echo={...equipped,wheelOiled:true,wheelTurned:true,jarTaken:true,poolAwake:true,poolRiddleSolved:true,echoNamed:true};
const captured={...echo,echoCaught:true},sealed={...captured,jarSealed:true},voice={...sealed,ropeFixed:true,bellRung:true},offered={...voice,mirrorAwake:true,voiceOffered:true},returned={...offered,voiceReturned:true};
function at(room,flags={},x,y){const data={...save,room,flags:{...save.flags,...flags}};data.flags.wheelUnlocked=!!flags.wheelTurned;data.sluice=undefined;if(x!==undefined)data.player={x,y,step:1,facing:'front'};else delete data.player;const a=boot(new Map([[key,JSON.stringify(data)]]));a.start();a.game.restoreGame();drain(a);assert.equal(a.game.state.room,room,'valid fixture');return a}
function drain(a){const messages=[];let n=0;while(a.game.state.popupOpen&&n++<30){messages.push(a.message);a.game.closeMessage()}assert(n<30);return messages}
function run(a,text){drain(a);a.get('#message').textContent='';a.game.command(text);const messages=drain(a);for(let n=0;n<35;n++)for(const fn of [...a.intervals.values()])fn();messages.push(...drain(a));count++;return messages.join(' ').replace(/\s+/g,' ')}
function unchanged(a,text,match){const before=a.game.state,msg=run(a,text);assert.doesNotMatch(msg,/I did not understand|You try it, but nothing happens/,text);if(match)assert.match(msg,match,text);assert.deepEqual(a.game.state.flags,before.flags,text);assert.equal(a.game.state.score,before.score,text);return msg}


const cases=[
 [0,{},273,201,'take rose','rose','rose','ground'],
 [2,{},158,212,'take oil','oilTaken','oil flask','bench'],
 [2,{},183,212,'take twine','twineTaken','twine','bench'],
 [2,{},80,201,'take plank','plankTaken','wooden plank','ground'],
 [2,{},132,212,'take shears','shearsTaken','rusty shears','bench'],
 // Wax is collected through the hive minigame, verified by its own suites.
 [5,{oilTaken:true,wheelOiled:true,wheelTurned:true,cabinetOpen:true},245,190,'take jar','jarTaken','glass jar','bench']
];
for(const [room,flags,x,y,command,flag,item,level]of cases){
 const a=at(room,flags,x,y),score=a.game.state.score;a.game.command(command);assert(a.game.state.flags[flag],command);assert.equal(a.game.effect?.kind,'pickup',command);assert.equal(a.game.effect.pickupLevel,level);assert(a.game.state.inv.includes(item));assert(!a.game.state.popupOpen,'result text waits for pickup');
 assert(a.game.pickupStillInScene(flag),'scenery item remains before contact');
 const initial=a.game.effect.frame;a.doc.hidden=true;a.game.tickStoryEffect();assert.equal(a.game.effect.frame,initial);a.doc.hidden=false;for(const {fn}of a.handlers.get('window:blur')||[])fn();a.game.tickStoryEffect();assert.equal(a.game.effect.frame,initial);for(const {fn}of a.handlers.get('window:focus')||[])fn();a.game.tickStoryEffect();for(let n=0;a.game.effect?.stage==='approach'&&n<80;n++)a.game.tickStoryEffect();assert(a.game.effect.frame>=initial+1);
 while(a.game.effect.frame<3)a.game.tickStoryEffect();assert(a.game.pickupStillInScene(flag),'still on surface while reaching');a.game.tickStoryEffect();assert(!a.game.pickupStillInScene(flag),'removed at hand contact');
 for(let n=0;n<15&&a.game.effect;n++)a.game.tickStoryEffect();assert(!a.game.effect);assert(a.game.state.popupOpen);assert.equal(a.game.state.player.step,0);const earned=a.game.state.score;assert(earned>score);drain(a);a.game.command(command);assert(!a.game.effect);assert.equal(a.game.state.score,earned);drain(a);
}
const skipped=at(0,{},273,201);skipped.game.command('take rose');skipped.key('Enter');assert(!skipped.game.effect);assert(skipped.game.state.popupOpen);assert(skipped.game.state.flags.rose);
const saved=at(2,{},158,212);saved.game.command('take oil');saved.game.tickStoryEffect();saved.game.saveGame();assert(!saved.game.effect);drain(saved);saved.game.restoreGame();drain(saved);assert(saved.game.state.flags.oilTaken);assert(saved.game.state.inv.includes('oil flask'));assert(!saved.game.effect);
const reduced=at(0,{},273,201);reduced.game.reducedMotion();reduced.game.command('take rose');assert(reduced.game.state.flags.rose);assert(!reduced.game.effect);assert(reduced.game.state.popupOpen);
const interrupted=at(0,{},273,201);interrupted.game.command('take rose');interrupted.game.command('look rose');assert(!interrupted.game.effect);assert(interrupted.game.state.inv.includes('rose'));
console.log('PASS six direct pickup types, crouch/reach levels, deferred text, focus pauses, stable idle, single scoring, Enter skip, mid-pickup save/restore, reduced motion and interruption.');

// The calling bell uses its gatepost's floor depth and elevated handle contact.
for(const startX of [276,308]){
 const bell=at(0,{},startX,205);bell.game.command('take bell');assert.equal(bell.game.effect.kind,'bellTaken');assert.equal(bell.game.effect.pickupStand.y,216);
 for(let n=0;n<30&&bell.game.effect.stage==='approach';n++)bell.game.tickStoryEffect();
 assert.equal(bell.game.state.player.y,216,'stand beside the orchard gatepost');
 while(bell.game.effect.frame<6)bell.game.tickStoryEffect();
 const pose=bell.game.pickupPose(bell.game.state.player.x,bell.game.state.player.y);
 assert(Math.hypot(pose.hand.x-pose.shoulder.x,pose.hand.y-pose.shoulder.y)<13,'reach has normal arm length');
 assert(!bell.game.pickupStillInScene('bell'),'bell leaves the post after hand contact');
 for(let n=0;n<20&&bell.game.effect;n++)bell.game.tickStoryEffect();assert(bell.game.state.flags.bell);assert.equal(bell.game.state.player.y,216);
}
console.log('PASS bell pickup from both sides: floor-depth staging, bounded reach, deferred disappearance and grounded finish.');
