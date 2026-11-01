// Optional experiments are rewards for curiosity, never new quest requirements.
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
let h=fs.readFileSync('tools/check-expanded-adventure.cjs','utf8').split("check('Eight rooms")[0];
h=h.replace('globalThis.game={command,','globalThis.game={get playfulAction(){return storyAction&&{...storyAction}},playfulBowAmount,playfulBowOffset,mirrorReflectionPose,merrinKissPose,drawMerrinKissDance,face(value){player.facing=value},setReduced(){window.matchMedia=()=>({matches:true})},startStoryEffect,finishStoryEffect,tickStoryEffect,drawPlayfulHero,drawPlayfulMirror,drawMirrorReflection,insidePolygon,setFrame(n){if(storyAction)storyAction.frame=n},setFixture(atRoom,next,point){room=atRoom;flags={...flagDefaults,...next};player={x:point[0],y:point[1],step:1,facing:"front"};syncInventory()},command,');
const s={require,console,Buffer,__dirname};vm.createContext(s);vm.runInContext(h+';globalThis.qa={boot};',s);const {boot}=s.qa;
function at(room=1,flags={},point=[144,190],reduced=false){const a=boot();a.start();while(a.game.state.popupOpen)a.game.closeMessage();a.game.setFixture(room,flags,point);if(reduced)a.game.setReduced();return a}
function drain(a){let out='',n=0;while(a.game.state.popupOpen&&n++<30){out+=' '+a.message;a.game.closeMessage()}assert(n<30);return out}
let checks=0;
function run(a,text,pattern){drain(a);const before=a.game.state;a.game.command(text);let out=drain(a);for(let n=0;a.game.playfulAction&&n<60;n++){a.game.tickStoryEffect();out+=drain(a)}out=out.replace(/\s+/g,' ');assert.doesNotMatch(out,/did not understand|nothing happens/,text);if(pattern)assert.match(out,pattern,text);for(const key of ['flags','inv','score','scored','player'])assert.deepEqual(a.game.state[key],before[key],text+' preserves '+key);checks++;return out}
for(const text of ['bow','bow to mirror','bow before the mirror'])run(at(),text,/reflection waits.*grand bow/);
for(const text of ['curtsy','curtsey','curtsy to mirror','curtsey to the mirror'])run(at(),text,/curtsy.*reflection waits.*practising/);
for(const text of ['sing','sing to mirror','sing for the mirror'])run(at(1,{mirrorAwake:true}),text,/ambitious interpretation/i);
run(at(),'sing to mirror',/glass keeps its own counsel/);
for(const text of ['polish mirror','buff the mirror','clean mirror','wipe mirror with my sleeve'])run(at(1,{mirrorAwake:true}),text,/good side/);
for(const text of ['flatter mirror','compliment the mirror','praise mirror'])run(at(1,{mirrorAwake:true}),text,/accurate reflection/);
for(const text of ['make a face at mirror','pull faces at the mirror','make faces'])run(at(1,{mirrorAwake:true}),text,/family resemblance/);
for(const text of ['bow to merrin','bow to gardener','curtsy to the man'])run(at(0,{},[85,185]),text,/nearly drops.*ding/);
for(const text of ['dance','dance for merrin','dance with the gardener'])run(at(0,{},[85,185]),text,/startled.*ding/);
for(const text of ['kiss man','kiss Merrin','kiss the gardener','kiss old man','kiss Merrin on the cheek'])run(at(0,{},[85,185]),text,/ding-ding.*doorbell/);
run(at(0,{voiceArrivalSeen:true},[85,185]),'kiss man',/never wash.*until supper/);
run(at(),'kiss man',/royal garden/);run(at(0,{},[290,225]),'kiss man',/too far away/);
for(const text of ['shake tree','shake the apple tree','rattle branches'])run(at(3,{},[180,215]),text,/single leaf.*stern reply/);
run(at(0,{},[85,185]),'sing to merrin',/conducts with one finger/);
run(at(1,{voiceReturned:true,voiceArrivalSeen:true}),'bow to mirror',/bows with you this time/);
run(at(1,{voiceReturned:true,voiceArrivalSeen:true,mirrorAwake:true}),'flatter mirror',/mirror remains quiet/);
run(at(),'bow to merrin',/royal garden/);run(at(0,{},[85,185]),'polish mirror',/do not see a mirror/);
run(at(1,{},[290,225]),'bow to mirror',/too far away/);run(at(),'shake tree',/no apple tree/);
const bow=at();bow.game.command('bow to mirror');assert.equal(bow.game.playfulAction.kind,'mirrorBow');assert(bow.game.playfulBowAmount(6)>0);assert.equal(bow.game.playfulBowAmount(6,true),0);assert.equal(bow.game.playfulBowAmount(14),0);assert(bow.game.playfulBowAmount(14,true)>0);assert.equal(bow.game.playfulAction.total,24);
// All delayed reflection and polish pixels remain inside the authored glass.
for(const action of ['bow to mirror','curtsy to mirror','polish mirror']){
 const a=at();a.game.command(action);const ctx=a.get('canvas').getContext('2d'),old=ctx.fillRect,painted=[];
 ctx.fillRect=function(x,y,w,h){painted.push([x,y,w,h]);};
 for(let frame=0;frame<24;frame++){a.game.setFrame(frame);if(action==='polish mirror')a.game.drawPlayfulMirror();else a.game.drawMirrorReflection()}
 ctx.fillRect=old;assert(painted.length>0,action+' visibly paints');for(const [x,y,w,h]of painted){assert(Number.isInteger(x)&&Number.isInteger(y));assert.equal(w,1);assert.equal(h,1);assert(a.game.insidePolygon(x,y,[[63,48],[72,38],[82,48],[82,101],[63,101]]),'effect stays in mirror');}
}
const reduced=at(1,{},[144,190],true);run(reduced,'bow to mirror',/grand bow/);assert(!reduced.game.playfulAction,'reduced-motion delivers text without animation');
run(at(1,{},[144,190],true),'curtsy to mirror',/curtsy.*practising/);
run(at(1,{voiceReturned:true,voiceArrivalSeen:true}),'curtsy to mirror',/curtsy.*follows perfectly/);
const repeat=at();const first=run(repeat,'polish mirror',/bright glint/);assert.equal(run(repeat,'polish mirror'),first,'repeat remains optional and deterministic');repeat.game.saveGame();const raw=repeat.storage.get(repeat.game.key);run(repeat,'bow to mirror');assert.equal(repeat.storage.get(repeat.game.key),raw,'experiment does not overwrite save');
const ritual=at(1,{voiceOffered:true});ritual.game.startStoryEffect('voiceOffered','Whose voice was it?');ritual.game.command('bow to mirror');assert(!ritual.game.playfulAction,'normal command handling settles ritual first');assert.match(ritual.message,/Whose voice was it/,'the pending ritual question takes priority over an optional joke');
console.log('PASS '+checks+' playful parser experiments/aliases, awake/restored responses, no quest or inventory changes, delayed bow, clipped native effects, reduced motion, repeat/save safety and protected voice ritual.');

for(let room=0;room<9;room++)for(const verb of ['bow','curtsy','curtsey']){
 const first=at(),spawn=Array.from(first.game.roomLayouts[room].spawn),a=at(room,{},spawn),before=a.game.state;
 a.game.command(verb);assert.equal(a.game.playfulAction?.kind,verb==='bow'?'mirrorBow':'mirrorCurtsy',verb+' animates in room '+room);assert(!a.game.state.popupOpen,'response waits for performance');
 a.doc.hidden=true;a.game.tickStoryEffect();assert.equal(a.game.playfulAction.frame,0);a.doc.hidden=false;
 const context=a.get('canvas').getContext('2d');let painted=0;context.fillRect=()=>painted++;
 a.game.setFrame(6);assert(a.game.drawPlayfulHero(spawn[0],spawn[1]));assert(painted>0,'actual hero pose paints in room '+room);
 for(let n=0;n<30&&a.game.playfulAction;n++)a.game.tickStoryEffect();assert(!a.game.playfulAction);assert(a.game.state.popupOpen);
 for(const key of ['flags','inv','score','scored','player'])assert.deepEqual(a.game.state[key],before[key],verb+' keeps '+key+' in room '+room);
}
for(const room of [0,1])for(const verb of ['bow','curtsy'])run(at(room,{},[290,225]),verb,verb==='bow'?/nobody in particular/:/proper curtsy/);
for(const verb of ['bow','curtsy'])run(at(3,{},[180,215],true),verb,verb==='bow'?/nobody in particular/:/proper curtsy/);
console.log('PASS bow/curtsy/curtsey animate in all nine rooms, far from local audiences too, with painted poses, paused timing, optional state and reduced-motion text.');

// Exercise the actual native Merrin painter, not just action names.
const kiss=at(0,{roseGiven:true},[85,185]),kissBefore=kiss.game.state;
kiss.game.command('kiss man');assert.equal(kiss.game.playfulAction.kind,'merrinKiss');assert.equal(kiss.game.playfulAction.total,44);assert(!kiss.game.state.popupOpen);
kiss.doc.hidden=true;kiss.game.tickStoryEffect();assert.equal(kiss.game.playfulAction.frame,0);kiss.doc.hidden=false;
const kissContext=kiss.get('canvas').getContext('2d'),oldKissFill=kissContext.fillRect,kissFrames=[];
for(let frame=0;frame<44;frame++){
 kiss.game.setFrame(frame);const dots=[];
 kissContext.fillRect=function(x,y,w,h){assert(Number.isInteger(x)&&Number.isInteger(y),'native integer pixels');dots.push([x,y,w,h,this.fillStyle])};
 assert(kiss.game.drawMerrinKissDance(60,204));kissFrames.push(dots);
}
kissContext.fillRect=oldKissFill;
assert.deepEqual(kissFrames[0],kissFrames[43],'ends exactly on original ground pose');assert.notDeepEqual(kissFrames[21],kissFrames[31],'alternating heel kicks');assert(new Set(kissFrames.map(JSON.stringify)).size>=6,'visible dance variation');
fs.writeFileSync('assets/reviews/merrin-kiss-dance.json',JSON.stringify(kissFrames));
kiss.game.tickStoryEffect();assert(!kiss.game.playfulAction);assert.match(drain(kiss).replace(/\s+/g,' '),/ding-ding.*doorbell/);
for(const key of ['flags','inv','score','scored','player'])assert.deepEqual(kiss.game.state[key],kissBefore[key],'kiss keeps '+key);
run(at(0,{},[85,185],true),'kiss man',/ding-ding.*doorbell/);
console.log('PASS Merrin kiss dance paints alternating hops/heel kicks, carries rose, pauses, settles, respects reduced motion and preserves quest state.');

const directionBow=at();directionBow.game.command('bow');
for(const facing of ['front','back','left','right']){
 directionBow.game.face(facing);const reflectedFacing={front:'back',back:'front',left:'left',right:'right'}[facing];assert.equal(directionBow.game.mirrorReflectionPose().facing,reflectedFacing);
 for(const [view,frame,reflected]of [[facing,6,false],[reflectedFacing,14,true]]){
  const offset=directionBow.game.playfulBowOffset(view,0,frame,reflected);assert(offset.y>0,'head dips');
  assert.equal(Math.sign(offset.x),view==='left'?-1:view==='right'?1:0,'head moves forward for '+view);
  const feet=directionBow.game.playfulBowOffset(view,39,frame,reflected);assert.equal(feet.x,0);assert.equal(feet.y,0);
 }
}
console.log('PASS facing-aware bow: profiles bend forward, front/back dip centrally, reflected facing/delay preserved and feet stay grounded.');
const bowPreview=at();bowPreview.game.command('bow');const bowContext=bowPreview.get('canvas').getContext('2d'),bowFrames=[];
for(const facing of ['front','back','left','right']){
 bowPreview.game.face(facing);
 for(const frame of [0,6,14,23]){
  bowPreview.game.setFrame(frame);const dots=[];bowContext.fillRect=function(x,y,w,h){dots.push([x,y,w,h,this.fillStyle])};
  bowPreview.game.drawMirrorReflection();bowPreview.game.drawPlayfulHero(144,190);bowFrames.push({facing,frame,dots});
 }
}
fs.writeFileSync('assets/reviews/mirror-bow-directions.json',JSON.stringify(bowFrames));
