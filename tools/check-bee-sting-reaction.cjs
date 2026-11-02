const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
let h=fs.readFileSync('tools/check-expanded-adventure.cjs','utf8').split("check('Eight rooms")[0];
h=h.replace('globalThis.game={command,','const heard=[];playGameSound=(...args)=>heard.push(args);globalThis.game={tickStoryEffect,drawBeeStingHero,beeStingOffset,get heard(){return heard},get action(){return storyAction&&{...storyAction}},setFrame(n){storyAction.frame=n},place(calm=false){room=3;flags.waxTaken=calm;player={x:206,y:211,step:0,facing:"back"}},reduced(){window.matchMedia=()=>({matches:true})},command,');
const s={require,console,Buffer,__dirname};vm.createContext(s);vm.runInContext(h+';globalThis.bootQA=boot;',s);
function at(calm=false){const a=s.bootQA();a.start();while(a.game.state.popupOpen)a.game.closeMessage();a.game.place(calm);return a}
const a=at(),before=a.game.state;a.game.movePlayer(0,-5);assert.equal(a.game.action.kind,'beeSting');assert.equal(a.game.action.total,18);assert(!a.game.state.popupOpen);assert.equal(a.game.heard.filter(c=>c[0]==='beeSting').length,1);
const anchor=a.game.state.player;assert(anchor.y>=211,'existing recoil remains');
a.doc.hidden=true;a.game.tickStoryEffect();assert.equal(a.game.action.frame,0);a.doc.hidden=false;
const context=a.get('canvas').getContext('2d'),frames=[],offsets=[];let paint=[];context.fillRect=function(x,y,w,h){paint.push([x,y,w,h,this.fillStyle])};
for(let n=0;n<18;n++){
 a.game.setFrame(n);const offset=a.game.beeStingOffset(n);offsets.push(offset);assert(a.game.canStand(anchor.x+offset,anchor.y),'running pose stays on safe floor');
 paint=[];a.game.drawBeeStingHero(anchor.x,anchor.y);assert(paint.length>0);assert(paint.every(p=>p.slice(0,4).every(Number.isInteger)));frames.push(paint.map(p=>[...p]));assert.deepEqual(a.game.state.player,anchor);
}
assert(Math.min(...offsets)<0&&Math.max(...offsets)>0,'runs both ways');assert.equal(offsets[0],0);assert.equal(Math.abs(offsets[17]),0,'ends on original recoil position');
a.game.tickStoryEffect();assert(!a.game.action);assert(a.game.state.popupOpen);assert.match(a.message.replace(/\s+/g,' '),/finger.*undignified/);
for(const key of ['flags','score','inv'])assert.deepEqual(a.game.state[key],before[key]);assert.equal(a.game.heard.filter(c=>c[0]==='beeSting').length,1,'one sting only');
fs.writeFileSync('assets/reviews/bee-sting-paint.json',JSON.stringify(frames));
const reduced=at();reduced.game.reduced();reduced.game.movePlayer(0,-5);assert(reduced.game.action,'reduced motion still waits for the reaction');assert(!reduced.game.state.popupOpen);for(let n=0;n<18;n++)reduced.game.tickStoryEffect();assert(!reduced.game.action);assert(reduced.game.state.popupOpen);
const interrupted=at();interrupted.game.movePlayer(0,-5);interrupted.game.movePlayer(0,2);assert.equal(interrupted.game.action.frame,0,'movement cannot interrupt');
const frozen=interrupted.game.state.player;for(const key of ['Enter',' ','Escape','ArrowRight'])interrupted.key(key);for(const text of ['look','dance','take wax','save','restore'])interrupted.game.command(text);assert.equal(interrupted.game.action.frame,0,'keys and parser cannot skip');assert.deepEqual(interrupted.game.state.player,frozen);assert(!interrupted.game.state.popupOpen);for(let n=0;n<18;n++)interrupted.game.tickStoryEffect();assert(!interrupted.game.action);assert(interrupted.game.state.popupOpen);
const saved=at();saved.game.movePlayer(0,-5);saved.game.saveGame();assert(saved.game.action,'saving cannot skip reaction');assert(!saved.storage.has(saved.game.key));saved.game.restoreGame();assert(saved.game.action,'restore cannot skip reaction');assert(!saved.game.state.popupOpen);for(let n=0;n<18;n++)saved.game.tickStoryEffect();saved.game.closeMessage();saved.game.saveGame();assert(saved.storage.has(saved.game.key),'save works after reaction');
const calm=at(true);calm.game.movePlayer(0,-5);assert(!calm.game.action);assert(!calm.game.heard.some(c=>c[0]==='beeSting'),'no stings after collecting wax');
console.log('PASS actual orchard sting, 18-frame finger-clutch scramble both ways, safe floor/return, one buzz, no lost points, hidden pause, mandatory reduced-motion wait, blocked skip/movement/parser/save/restore and calm collected hive.');

const cries=at();cries.game.movePlayer(0,-5);
for(let frame=1;frame<=18;frame++){
 const before=cries.game.heard.filter(c=>c[0]==='beeOw').length;cries.game.tickStoryEffect();
 const after=cries.game.heard.filter(c=>c[0]==='beeOw').length;assert.equal(after-before,[3,7,11,15].includes(frame)?1:0,'ow timed to scramble beat '+frame);
}
assert.equal(cries.game.heard.filter(c=>c[0]==='beeOw').length,4);assert(cries.game.heard.filter(c=>c[0]==='beeOw').every(c=>c[3]===.65));assert(!cries.game.action);
console.log('PASS four short ow calls at scramble frames 3/7/11/15, retaining initial sting and recovery timing.');
