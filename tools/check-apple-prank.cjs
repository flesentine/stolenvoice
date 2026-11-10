const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
let h=fs.readFileSync('tools/check-expanded-adventure.cjs','utf8').split("check('Eight rooms")[0];
h=h.replace('globalThis.game={command,','const heard=[];playGameSound=(...args)=>heard.push(args);globalThis.game={get heard(){return heard},reachFrames:appleReachFrames,tickStoryEffect,drawApplePrankHero,applePrankPose,applePrankPixels,walkSprites:elaraWalkSprites,get action(){return storyAction&&{...storyAction}},setFrame(n){storyAction.frame=n},place(r,x,y){room=r;player={x,y,step:1,facing:"front"}},reduced(){window.matchMedia=()=>({matches:true})},command,');
const s={require,console,Buffer,__dirname};vm.createContext(s);vm.runInContext(h+';globalThis.bootQA=boot;',s);
function at(r=3,x=118,y=205){const a=s.bootQA();a.start();while(a.game.state.popupOpen)a.game.closeMessage();a.game.place(r,x,y);return a}
for(const text of ['eat apple','bite into an apple','taste fruit','try apple']){
 const a=at(3,text.includes('fruit')?150:118),before=a.game.state;a.game.command(text);assert.equal(a.game.action.kind,'applePrank',text);assert.equal(a.game.action.appleTaste,true,'explicit eating verbs use eating sequence');
 a.doc.hidden=true;a.game.tickStoryEffect();assert.equal(a.game.action.frame,0);a.doc.hidden=false;
 for(let n=0;n<26+a.game.reachFrames;n++){
  a.game.tickStoryEffect();
  assert.equal(a.game.heard.filter(c=>c[0]==='appleChew').length,[10,14,18].filter(f=>f+a.game.reachFrames<=n+1).length,'chews match visible bites');
  assert.equal(a.game.heard.filter(c=>c[0]==='appleSpit').length,n===25+a.game.reachFrames?1:0,'spit matches core release');
 }
 assert(!a.game.heard.some(c=>c[0]==='appleDrop'));a.game.tickStoryEffect();assert.equal(a.game.heard.filter(c=>c[0]==='appleDrop').length,0,'eating does not drop a whole apple');
 while(a.game.action)a.game.tickStoryEffect();assert(a.game.state.popupOpen);assert.match(a.message.replace(/\s+/g,' '),/How clever.*Merrin grows his vinegar on trees/);
 assert.equal(a.game.heard.filter(c=>c[0]==='appleSpit').length,1,'no repeated spit at end');
 for(const key of ['room','player','flags','score','inv'])assert.deepEqual(a.game.state[key],before[key],text+' preserves '+key);
}
for(const a of [at(0),at(3,310,235)]){a.game.command('eat apple');assert(!a.game.action);assert(a.game.state.popupOpen)}
const reduced=at();reduced.game.reduced();reduced.game.command('taste apple');assert(!reduced.game.action);assert(reduced.game.state.popupOpen);
for(const text of ['take apple','take apples','pick an apple','pick up fruit','pluck apple from the tree']){
 const a=at();a.game.command(text);assert(!a.game.action,text+' never eats');assert(a.game.state.flags.appleCarried);assert(a.game.state.inv.includes('apple'));assert.equal(a.game.state.score,0);
 a.game.closeMessage();a.game.command('take apple');assert.match(a.message,/already have/);assert.equal(a.game.state.inv.filter(i=>i==='apple').length,1);
 a.game.closeMessage();a.game.saveGame();assert(a.storage.has(a.game.key));a.game.closeMessage();a.game.place(0,102,206);a.game.command('eat apple');assert(!a.game.state.flags.appleCarried);assert(!a.game.state.inv.includes('apple'));assert.equal(a.game.action.frame,a.game.reachFrames,'carried apple skips plucking pose');
 while(a.game.action)a.game.tickStoryEffect();a.game.closeMessage();a.game.restoreGame();assert(a.game.state.flags.appleCarried,'save restores carried apple');
}
// Arm roots must coincide with the original profile sleeve/skin joint.
const geometry=at();geometry.game.command('eat apple');
for(const direction of [-1,1]){
 for(const taste of [false,true]){
  const reach=geometry.game.applePrankPose(118,205,7,taste,direction),lower=geometry.game.applePrankPose(118,205,14,taste,direction);
  assert(reach.hand[1]<reach.top,'hand reaches above head toward branch');
  assert(reach.elbow[1]<reach.shoulder[1],'elbow rises with shoulder-rooted arm');
  assert(reach.apple.visible&&reach.apple.bites===0,'whole fruit appears at grasp');
  assert(!geometry.game.applePrankPose(118,205,0,taste,direction).apple.visible,'fruit does not appear before reaching');
  assert(lower.hand[1]>reach.hand[1],'lowers picked fruit before eating or dropping');
 }

 const pose=geometry.game.applePrankPose(118,205,8,true,direction),col=pose.shoulder[0]-pose.left,row=pose.shoulder[1]-pose.top;
 assert(['c','f'].includes(geometry.game.walkSprites[direction>0?'right':'left'][1][row][col]),'arm attaches to sleeve, not blue stomach');
 assert.equal(row,12);assert(pose.elbow[1]<pose.top+18);assert(pose.hand[1]<pose.elbow[1],'forearm bends upward toward mouth');
 const eaten=geometry.game.applePrankPose(118,205,19+geometry.game.reachFrames,true,direction).apple;assert.equal(eaten.bites,3);assert(geometry.game.applePrankPixels(eaten.bites).every(p=>p[2]!==4&&p[2]!==12),'eaten fruit is a pale core, not a whole red apple');
 const end=geometry.game.applePrankPose(118,205,31+geometry.game.reachFrames,true,direction).apple;assert(!end.visible);assert(Math.abs(end.x-geometry.game.applePrankPose(118,205,0,true,direction).hand[0])<=8,'eating tosses core nearby instead of rolling to edge');
 const spins=new Set();for(let frame=27;frame<=30;frame++){const apple=geometry.game.applePrankPose(118,205,frame+geometry.game.reachFrames,false,direction).apple;const pixels=geometry.game.applePrankPixels(0,apple.angle,direction),ys=new Set(pixels.filter(p=>p[2]===4||p[2]===12).map(p=>p[1]));for(let y=Math.min(...ys);y<=Math.max(...ys);y++)assert(ys.has(y),'rotated fruit has no transparent stripes');spins.add(JSON.stringify(pixels))}assert.equal(spins.size,4,'rolling apple actually rotates through four native orientations');
}
const previews={};for(const taste of [false,true]){
 const a=at();a.game.command('eat apple');const context=a.get('canvas').getContext('2d');let paint=[];context.fillRect=function(x,y,w,h){paint.push([x,y,w,h,this.fillStyle])};const frames=[];
 for(let n=0;n<a.game.action.total;n++){a.game.setFrame(n);paint=[];a.game.drawApplePrankHero(118,205);assert(paint.length>0);assert(paint.every(p=>p.slice(0,4).every(Number.isInteger)));frames.push(paint.map(p=>[...p]))}previews[taste?'taste':'pick']=frames;
}fs.writeFileSync('assets/reviews/apple-prank-paint.json',JSON.stringify(previews));
console.log('PASS distinct apple picking/tasting aliases, carried inventory and save/restore, local tree reach, eating sequence, exact chew/spit timing, unchanged quest/inventory/player, pause, reduced motion, save/interruption and native animation poses.');
