const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
let h=fs.readFileSync('tools/check-expanded-adventure.cjs','utf8').split("check('Eight rooms")[0];
h=h.replace('globalThis.game={command,','const hiveHeard=[];let hiveStops=0;stopGameSound=()=>hiveStops++;playGameSound=(...args)=>hiveHeard.push(args);globalThis.game={tickStoryEffect,get stingAction(){return storyAction},setHiveSeed(n){hiveFlight=makeHiveFlight(n)},paintHive,get hiveStops(){return hiveStops},get hiveVictory(){return tandyCues.hiveWax},get hiveHeard(){return hiveHeard},get hiveDance(){return tandyCues.hiveDance},get hiveOpen(){return hiveOpen},get hiveHelp(){return hiveHelp},get hiveWon(){return hiveWon},get hiveFrame(){return hiveFrame},get hiveReach(){return hiveReach},hiveGap,hiveClear,hiveBees,hiveContact,resetHiveFlakes(){flags.hiveWaxOne=false;flags.hiveWaxTwo=false;hiveStings=0},setHiveFrame(n){hiveFrame=n},get hivePieces(){return hivePieces()},hiveHelpLines,tickHive,hivePixels,setHiveReach(n){hiveReach=n},command,');
const scope={require,console,Buffer,__dirname};vm.createContext(scope);vm.runInContext(h+';globalThis.qa={boot};',scope);const {boot}=scope.qa;
const base=boot();base.start();base.game.saveGame();const save=JSON.parse(base.storage.get(base.game.key));save.room=3;save.player={x:190,y:210,step:0,facing:'front'};
const a=boot(new Map([[base.game.key,JSON.stringify(save)]]));a.start();a.game.restoreGame();for(let i=0;a.game.state.popupOpen&&i<20;i++)a.game.closeMessage();
a.game.command('take wax');assert(a.game.hiveOpen);a.key('Escape');assert(!a.game.hiveOpen,'escape returns without reward');assert(!a.game.state.flags.waxTaken);
const score=a.game.state.score;a.game.command('take beeswax');assert(a.game.hiveOpen);assert(a.game.hiveHelp);a.game.tickHive();assert.equal(a.game.hiveFrame,0);a.key('Enter');assert(!a.game.hiveHelp);assert(a.game.hiveHeard.some(c=>c[0]==='hiveDance'),'bee melody starts with play');for(const voice of a.game.hiveDance)assert(Math.abs(voice.reduce((n,p)=>n+p[1],0)-7.2)<1e-8,'three voices fit the independent music loop');a.key('F2');a.key('F2');assert.equal(a.game.hiveHeard.at(-1)[0],'hiveDance');
while(!Array.from({length:12},(_,i)=>a.game.hiveContact(a.game.hiveFrame+i+1,i+1)).some(Boolean))a.game.tickHive();
for(const fn of a.get('#agi-message').listeners.click||[])fn({preventDefault(){},stopPropagation(){}});for(let i=0;i<13;i++)a.game.tickHive();assert(!a.game.state.flags.waxTaken,'bad timing leaves wax');assert(!a.game.hiveWon);assert.equal(a.game.hiveHeard.filter(c=>c[0]==='hiveMiss').length,1,'one warning buzz at failed contact');assert.equal(a.game.hiveHeard.at(-1)[0],'hiveDance','bee melody resumes after recoil');
const frame=a.game.hiveFrame;a.doc.hidden=true;a.game.tickHive();assert.equal(a.game.hiveFrame,frame);a.doc.hidden=false;
for(let round=1;round<=3;round++){
 let guard=0;while(Array.from({length:12},(_,i)=>a.game.hiveContact(a.game.hiveFrame+i+1,i+1)).some(Boolean)&&guard++<300)a.game.tickHive();assert(guard<300,'reachable opening every circuit');
 a.key(' ');for(let i=0;i<4;i++)a.game.tickHive();assert(!a.game.state.flags.waxTaken,'full award waits for third retrieval');for(let i=0;i<9;i++)a.game.tickHive();
 assert.equal(a.game.hivePieces,round);assert.equal(a.game.hiveWon,round===3);
 if(round<3){assert.equal(a.game.state.score,score);assert(!a.game.state.inv.includes('beeswax'));
  while(!Array.from({length:12},(_,i)=>a.game.hiveContact(a.game.hiveFrame+i+1,i+1)).some(Boolean))a.game.tickHive();
  a.key(' ');for(let i=0;i<13;i++)a.game.tickHive();assert.equal(a.game.hivePieces,a.game.hiveOpen?round:0,'first two misses retain wax; third-sting retreat drops it');
  if(!a.game.hiveOpen){
   assert.equal(a.game.stingAction.kind,'beeSting','third miss returns to orchard');for(let n=0;n<18;n++)a.game.tickStoryEffect();while(a.game.state.popupOpen)a.game.closeMessage();
   a.game.command('take wax');a.game.setHiveSeed(1);a.key('Enter');assert.equal(a.game.hivePieces,0,'retry starts empty after three-sting retreat');round=0;
  }
 }
}
assert.equal(a.game.hiveHeard.at(-1)[0],'hiveWax');assert(a.game.state.flags.waxTaken);assert.equal(a.game.state.score,score+2);assert(a.game.state.inv.includes('beeswax'));assert.equal(a.game.hivePixels().length,160*168);assert(a.game.hivePixels().every(v=>v<16));
// Victory is a painted modal matching the other puzzle reward windows.
const popupRects=[],popupContext=a.get('#agi-message-picture').getContext('2d'),oldFill=popupContext.fillRect;
popupContext.fillRect=function(...rect){popupRects.push([...rect,this.fillStyle]);return oldFill.apply(this,rect)};
a.game.paintHive();popupContext.fillRect=oldFill;
assert(popupRects.some(r=>JSON.stringify(r)===JSON.stringify([20,62,280,80,'#ffffff'])),'white reward popup');
assert(popupRects.some(r=>JSON.stringify(r)===JSON.stringify([22,64,276,76,'#aa0000'])),'red inset matches other minigames');
assert.match(a.message,/Enough wax!.*Enter, Escape or click to continue/);
assert.doesNotMatch(a.message,/Space or click to reach/,'victory no longer advertises reaching');
for(const voice of a.game.hiveVictory)assert(Math.abs(voice.reduce((n,p)=>n+p[1],0)-3)<1e-8,'three-second ending on all PSG voices');
assert.deepEqual(Array.from(a.game.hiveVictory[0].slice(0,4),n=>Array.from(n)),Array.from(a.game.hiveDance[0].slice(0,4),n=>Array.from(n)),'ending reprises bee-song call');
assert.deepEqual(Array.from(a.game.hiveVictory,v=>v.filter(([note])=>note).at(-1)[0]),[81,73,45],'held A-major tonic resolution');
const stopsBeforeReturn=a.game.hiveStops;
a.key('Enter');assert(!a.game.hiveOpen);assert.equal(a.game.hiveStops,stopsBeforeReturn,'continuing lets the victory cadence finish');a.game.command('take wax');assert(!a.game.hiveOpen);assert.equal(a.game.state.score,score+2);a.game.saveGame();assert(JSON.parse(a.storage.get(base.game.key)).flags.waxTaken);
if(process.argv.includes('--preview')){const A=require('../editor/agi-picture.js'),sharp=require('sharp');sharp(Buffer.from(A.rgba(a.game.hivePixels())),{raw:{width:160,height:168,channels:4}}).resize(640,504,{kernel:'nearest',fit:'fill'}).png().toFile('/tmp/hive-art.png')}
console.log('PASS three-round hive: instructions, keyboard reach, missed attempt, safe retrieval, reward once, hidden pause, EGA native art and save.');

const partial=JSON.parse(JSON.stringify(save));partial.flags.hiveWaxOne=true;partial.flags.hiveWaxTwo=false;
const r=boot(new Map([[base.game.key,JSON.stringify(partial)]]));r.start();r.game.restoreGame();for(let i=0;r.game.state.popupOpen&&i<20;i++)r.game.closeMessage();r.game.command('take wax');assert.equal(r.game.hivePieces,1,'partial flakes survive restore');r.key('Escape');r.game.command('take wax');assert.equal(r.game.hivePieces,1,'partial flakes survive leaving close-up');
const bees=r.game.hiveBees();assert.equal(bees.length,12);assert(new Set(bees.map(b=>b[1])).size>5,'bees occupy separate flight heights');
r.key('Enter');const flightSamples=new Set();for(let i=0;i<540;i++){r.game.tickHive();flightSamples.add(JSON.stringify(r.game.hiveBees()));for(const [x,y]of r.game.hiveBees()){assert(x>=3&&x<=156);assert(y>=3&&y<=118)}}
assert(flightSamples.size>=85,'separate bee paths keep moving through each circuit');
console.log('PASS partial collection restore/reopen and dispersed in-bounds bee paths.');
const stingSave=JSON.parse(JSON.stringify(save));stingSave.player={x:206,y:211,step:0,facing:'back'};
const sting=boot(new Map([[base.game.key,JSON.stringify(stingSave)]]));sting.start();sting.game.restoreGame();for(let i=0;sting.game.state.popupOpen&&i<20;i++)sting.game.closeMessage();
const beforeSting=sting.game.state.score;sting.game.movePlayer(0,-5);assert.equal(sting.game.stingAction.kind,'beeSting','crowding entrance triggers scramble');assert(!sting.game.state.popupOpen);for(let n=0;n<18;n++)sting.game.tickStoryEffect();assert(sting.game.state.popupOpen,'sting warning follows scramble');assert(sting.game.hiveHeard.some(c=>c[0]==='beeSting'),'sting buzz');assert(sting.game.state.player.y>=211,'recoils away from entrance');assert.equal(sting.game.state.score,beforeSting);sting.game.closeMessage();sting.game.command('take wax');assert(sting.game.hiveOpen,'wax minigame remains accessible after sting');
console.log('PASS orchard entrance sting, recoil, no lost points and safe wax access.');

assert(a.game.hiveHelpLines.every(line=>20+line.length*8<=300),'help text fits inside right border');
assert(51+(a.game.hiveHelpLines.length-1)*10+8<=143,'help text fits inside bottom border');
console.log('PASS hive instruction text stays within all popup borders.');

// Fully raised, withdrawing and idle-low reach cels all remain attached to
// the offscreen arm; this catches the former floating cuff at peak reach.
for(let cel=0;cel<=12;cel++){
 a.game.setHiveReach(cel);
 const pixels=a.game.hivePixels();
 const advance=Math.min(1,cel/5,(13-cel)/7),y=Math.round(156-advance*44);
 for(let sy=Math.max(0,y+16);sy<168;sy++)assert([9,15].includes(pixels[sy*160+80]),'connected blue sleeve/white cuff at cel '+cel+' row '+sy);
}
console.log('PASS all thirteen reach cels connect cuff and sleeve to the bottom picture edge.');

// Independent oracle reads the rendered skin mask and the visible bee footprint.
// Test every starting beat, including contact on approach and withdrawal.
const oracle=boot(new Map([[base.game.key,JSON.stringify(save)]]));oracle.start();oracle.game.restoreGame();
for(let i=0;oracle.game.state.popupOpen&&i<20;i++)oracle.game.closeMessage();
oracle.game.command('take wax');oracle.key('Enter');oracle.game.setHiveSeed(1);
let safeStarts=0,missStarts=0,early=0,late=0;const safeBeats=[];
for(let start=0;start<90;start++){
 let collision=false;
 for(let reach=1;reach<13;reach++){
  oracle.game.setHiveFrame(start+reach);oracle.game.setHiveReach(reach);
  const pixels=oracle.game.hivePixels();
  const visibleHit=oracle.game.hiveBees().some(([x,y])=>
   [[-1,-2],[0,-2],[1,-1],[2,-1],[-2,0],[-1,0],[0,0],[1,0],[2,0],[-2,1],[-1,1],[0,1],[1,1],[2,1]].some(([dx,dy])=>pixels[(y+dy)*160+x+dx]===12));
  assert.equal(oracle.game.hiveContact(start+reach,reach),visibleHit,'visible contact at '+start+'/'+reach);
  if(visibleHit){collision=true;if(reach<5)early++;if(reach>5)late++;}
 }
 oracle.game.setHiveReach(-1);oracle.game.setHiveFrame(start);
 // Each oracle sample is an independent visit, with no flakes or prior stings.
 oracle.game.resetHiveFlakes();
 const before=oracle.game.hiveHeard.filter(c=>c[0]==='hiveMiss').length;
 oracle.key(' ');for(let i=0;i<13;i++)oracle.game.tickHive();
 assert.equal(oracle.game.hivePieces,collision?0:1,'retrieval matches visible contact for start '+start);
 assert.equal(oracle.game.hiveHeard.filter(c=>c[0]==='hiveMiss').length-before,collision?1:0,'one buzz per collision attempt');
 safeBeats.push(!collision);
 if(collision)missStarts++;else safeStarts++;
}
assert(safeStarts>0&&missStarts>0,'seeded sample contains both openings and guarded starts; long-run balance is checked separately');
let longestSafeRun=0,currentSafeRun=0;
for(const safe of safeBeats){currentSafeRun=safe?currentSafeRun+1:0;longestSafeRun=Math.max(longestSafeRun,currentSafeRun)}
assert(longestSafeRun>=4&&longestSafeRun<=20,'visible openings remain usable with independent bee speeds');assert(missStarts>0&&late>0,'withdrawal contacts are covered');assert(early>0,'lower patrol also covers visible contact during the approach');
console.log('PASS all 90 starting beats against rendered skin/bee contact: '+safeStarts+' safe, '+missStarts+' missed; approach, withdrawal and one buzz.');

const calmSave=JSON.parse(JSON.stringify(stingSave));calmSave.flags.waxTaken=true;
const calm=boot(new Map([[base.game.key,JSON.stringify(calmSave)]]));calm.start();calm.game.restoreGame();
for(let i=0;calm.game.state.popupOpen&&i<20;i++)calm.game.closeMessage();
calm.game.movePlayer(0,-5);
assert(!calm.game.state.popupOpen,'walking near hive after wax collection has no sting popup');
assert(!calm.game.hiveHeard.some(c=>c[0]==='beeSting'),'no walk-by sting sound after collection');
console.log('PASS collected beeswax prevents further walk-by stings, including restored games.');
