const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
let h=fs.readFileSync('tools/check-expanded-adventure.cjs','utf8').split("check('Eight rooms")[0];
h=h.replace('globalThis.game={command,','const heard=[];playGameSound=(...args)=>heard.push(args);globalThis.game={get heard(){return heard},tickStoryEffect,drawWindowJumpHero,windowJumpSprite,windowJumpPose,insidePolygon,insideSolidFootprint,belfryJumpBell,get action(){return storyAction&&{...storyAction}},setFrame(n){storyAction.frame=n},reduced(){window.matchMedia=()=>({matches:true})},place(r,x,y){room=r;player={x,y,step:1,facing:"back"}},command,');
const s={require,console,Buffer,__dirname};vm.createContext(s);vm.runInContext(h+';globalThis.bootQA=boot;',s);
function at(r=7,x=142,y=190){const a=s.bootQA();a.start();while(a.game.state.popupOpen)a.game.closeMessage();a.game.place(r,x,y);return a}
for(const [x,command]of [[32,'jump out the left window'],[142,'jump out of the window'],[300,'leap through right window'],[142,'dive from middle window'],[142,'jump window']]){
 const a=at(7,x),before=a.game.state;a.game.command(command);assert.equal(a.game.action.kind,'windowJump',command);assert.equal(a.game.action.total,44);
 const context=a.get('canvas').getContext('2d');let paint=[];context.fillRect=function(x,y,w,h){paint.push([x,y,w,h,this.fillStyle])};
 let vanished=false;const frames=[];
 for(let n=0;n<44;n++){
  a.game.setFrame(n);paint=[];const pose=a.game.windowJumpPose(n);a.game.drawWindowJumpHero();
  assert(paint.every(p=>p.slice(0,4).every(Number.isInteger)));
  if(pose.outside)for(const [xx,yy]of paint){assert(a.game.insidePolygon(xx,yy,pose.glass),'outside paint stays in chosen opening');assert(!a.game.insideSolidFootprint(xx,yy,a.game.belfryJumpBell),'flight stays behind bell')}
  if(n===22){assert.equal(paint.length,0,'drops out of sight before the gust');vanished=true}
  frames.push(paint.map(pixel=>[...pixel]));
 }
 assert(vanished);a.game.setFrame(43);a.game.tickStoryEffect();assert(!a.game.action);assert(a.game.state.popupOpen);assert.match(a.message.replace(/\s+/g,' '),/return policy/);
 for(const key of ['room','player','flags','score','inv'])assert.deepEqual(a.game.state[key],before[key],command+' preserves '+key);
 if(x===142)fs.writeFileSync('assets/reviews/window-jump-paint.json',JSON.stringify(frames));
}
for(const a of [at(0),at(1),at(7,210,235)]){a.game.command('jump out window');assert(!a.game.action);assert(a.game.state.popupOpen)}
const wrongWindow=at(7,32);wrongWindow.game.command('jump out right window');assert(!wrongWindow.game.action,'named window must be within reach');
const sound=at();sound.game.command('jump out window');for(let frame=1;frame<=44;frame++){sound.game.tickStoryEffect();assert.equal(sound.game.heard.filter(c=>c[0]==="windowLeap").length,frame>=4?1:0);assert.equal(sound.game.heard.filter(c=>c[0]==="windowGust").length,frame>=23?1:0)}assert(sound.game.heard.filter(c=>/^window/.test(c[0])).every(c=>c[3]===.5),'both cues stay quiet');
const flutter=at();
const lifted=flutter.game.windowJumpSprite(21),settled=flutter.game.windowJumpSprite(43);
assert(lifted[27].includes('c')&&lifted[36].includes('c'),'higher gust exposes knees and lower legs');
assert(!lifted[26].includes('c'),'lifted skirt still covers the upper legs');
assert(flutter.game.windowJumpSprite(32)[27].includes('c'),'return gust lifts hem while she is visible in the window');
assert(!settled[31].includes('c')&&!settled[35].includes('c'),'dress settles over legs before landing');
assert(lifted[39].includes('6'),'shoes remain attached below legs');
fs.writeFileSync('assets/reviews/window-jump-flutter.json',JSON.stringify(Array.from({length:44},(_,n)=>flutter.game.windowJumpSprite(n))));
const paused=at();paused.game.command('jump out window');paused.doc.hidden=true;paused.game.tickStoryEffect();assert.equal(paused.game.action.frame,0);
const reduced=at();reduced.game.reduced();reduced.game.command('jump out window');assert(!reduced.game.action);assert.match(reduced.message.replace(/\s+/g,' '),/return policy/);
const save=at();save.game.command('jump out window');save.game.saveGame();assert(!save.game.action);assert(save.storage.has(save.game.key));
const interrupt=at();interrupt.game.command('jump out window');interrupt.game.movePlayer(1,0);assert(!interrupt.game.action);
console.log('PASS five leap aliases, all three windows, clipped flight/gust, disappearance and return, no shortcuts/state changes, reach/locality, pause, reduced motion, save and interruption.');
