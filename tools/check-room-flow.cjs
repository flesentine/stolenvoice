// Regression cases from the simulated newcomer transcript, against the built game.
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path'),read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');let h=read('tools/check-expanded-adventure.cjs');h=h.slice(0,h.indexOf("check('Eight rooms"));h=h.replace('globalThis.game={command,','globalThis.game={changeRoom,goToExit,get swim(){return swimState},command,');const s={require,console,Buffer,__dirname};vm.createContext(s);vm.runInContext(h+';globalThis.qa={boot,approach,travel,walkWhere};',s);const {boot}=s.qa,base=boot();base.start();base.game.saveGame();const key=base.game.key,save=JSON.parse(base.storage.get(key));let count=0;
const equipped={rose:true,bell:true,oilTaken:true,twineTaken:true,plankTaken:true,shearsTaken:true,shearsReady:true,waxTaken:true};
const echo={...equipped,wheelOiled:true,wheelTurned:true,jarTaken:true,poolAwake:true,echoNamed:true};
const captured={...echo,echoCaught:true},sealed={...captured,jarSealed:true},voice={...sealed,ropeFixed:true,bellRung:true},offered={...voice,mirrorAwake:true,voiceOffered:true},returned={...offered,voiceReturned:true};
function at(room,flags={},x,y){const data={...save,room,flags:{...save.flags,...flags}};if(x!==undefined)data.player={x,y,step:1,facing:'front'};else delete data.player;const a=boot(new Map([[key,JSON.stringify(data)]]));a.start();a.game.restoreGame();drain(a);assert.equal(a.game.state.room,room,'valid fixture');return a}
function drain(a){const messages=[];let n=0;while(a.game.state.popupOpen&&n++<30){messages.push(a.message);a.game.closeMessage()}assert(n<30);return messages}
function run(a,text){drain(a);a.get('#message').textContent='';a.game.command(text);const messages=drain(a);for(let n=0;n<35;n++)for(const fn of [...a.intervals.values()])fn();messages.push(...drain(a));count++;return messages.join(' ').replace(/\s+/g,' ')}
function unchanged(a,text,match){const before=a.game.state,msg=run(a,text);assert.doesNotMatch(msg,/I did not understand|You try it, but nothing happens/,text);if(match)assert.match(msg,match,text);assert.deepEqual(a.game.state.flags,before.flags,text);assert.equal(a.game.state.score,before.score,text);return msg}

const ready={...equipped,workshopUnlocked:true,workshopOpen:true,bridgePlank:true,bridgeFixed:true,thornsCut:true};
let routes=0;
for(let room=0;room<9;room++){
 const layout=base.game.roomLayouts[room];
 const entries=[['default',layout.spawn]];
 for(let from=0;from<9;from++)for(const exit of base.game.roomLayouts[from].exits)if(exit.to===room)entries.push([from+' -> '+room,exit.spawn]);
 for(const [entry,spawn]of entries){
  const initial=at(room,ready,...spawn);
  assert.equal(initial.game.state.player.x,spawn[0],entry+' x');assert.equal(initial.game.state.player.y,spawn[1],entry+' y');
  assert(initial.game.canStand(...spawn,room),entry+' is safe');
  assert(!layout.exits.some(e=>spawn[0]>=e.zone[0]&&spawn[0]<=e.zone[2]&&spawn[1]>=e.zone[1]&&spawn[1]<=e.zone[3]),entry+' avoids immediate return');
  for(const exit of layout.exits){
   const a=at(room,ready,...spawn);s.qa.travel(a,exit.id);assert(a.game.canStand(a.game.state.player.x,a.game.state.player.y),entry+' -> '+exit.id+' safe landing');routes++;
  }
 }
}
// Locked path feedback occurs at the actual barrier, without moving into it.
for(const y of [180,200,217]){
 const a=at(3,{},287,y),before=a.game.state;
 a.game.movePlayer(3,0);assert.equal(a.game.state.room,3);assert.equal(a.game.state.player.x,287);
 assert(a.game.state.popupOpen);assert.match(a.message.replace(/\s+/g,' '),/blackthorn snags/);
 assert.deepEqual(a.game.state.flags,before.flags);assert.equal(a.game.state.score,before.score);
 drain(a);a.game.movePlayer(-3,0);assert.equal(a.game.state.player.x,284,'can retreat after refusal');
}
const clear=at(3,{...equipped,thornsCut:true},287,200);clear.game.movePlayer(3,0);assert.equal(clear.game.state.player.x,290);assert(!clear.game.state.popupOpen);
// Approaching from outside the blocked corridor must not create a thorn popup.
const low=at(3,{},287,224);low.game.movePlayer(3,0);assert.equal(low.game.state.player.x,290);assert(!low.game.state.popupOpen);

let doorwayChecks=0;
for(const [room,x,y,commands,to]of [
 [0,153,185,['go through castle gate','walk across drawbridge'],8],
 [1,160,213,['walk through door','go into doorway'],8],
 [1,284,201,['enter arch','walk through archway','go to stair opening'],7],
 [2,160,212,['enter door','walk through doorway'],8],
 [4,85,176,['enter mill door','go through mill doorway'],5],
 [4,290,166,['enter cave entrance','walk to grotto entrance'],6],
 [5,28,181,['go through arch','walk through entrance'],4],
 [6,43,184,['go through passage','walk through cave entrance'],4],
 [7,35,207,['go to stair opening','enter staircase'],1],
 [8,64,158,['walk through shed door'],2],
 [8,251,158,['walk through gallery arch','enter gallery door'],1]
])for(const text of commands){
 const a=at(room,ready,x,y);run(a,text);assert.equal(a.game.state.room,to,text);assert(a.game.canStand(a.game.state.player.x,a.game.state.player.y),text+' safe landing');doorwayChecks++;
}
const ambiguous=at(8);unchanged(ambiguous,'enter door',/two entrances/);assert.equal(ambiguous.game.state.room,8);
const far=at(8,{},160,211);unchanged(far,'walk through gallery arch',/closer/);assert.equal(far.game.state.room,8);
const blocked=at(4,{},290,166);unchanged(blocked,'enter cave entrance',/across the stream/);assert.equal(blocked.game.state.room,4);
console.log('PASS '+routes+' entrance-to-exit physical routes, safe landing positions and no immediate return triggers; '+doorwayChecks+' doorway aliases; thorn contact feedback, retreat and cleared passage.');

// Reported east-exit concern: aliases obey the same thorn gate and safe spawns.
for(const text of ['east','e','go east']){
 const garden=at(0,{},286,201);run(garden,text);assert.equal(garden.game.state.room,3,text+' garden to orchard');
 const blockedEast=at(3,{},287,200);unchanged(blockedEast,text,/blackthorn/);assert.equal(blockedEast.game.state.room,3);
 const openEast=at(3,{...equipped,thornsCut:true},287,200);run(openEast,text);assert.equal(openEast.game.state.room,4,text+' orchard to bridge');
 assert(openEast.game.canStand(openEast.game.state.player.x,openEast.game.state.player.y),'safe east landing');
}
console.log('PASS east/e/go east: garden route, thorn refusal and cleared orchard route.');

// The visible lower garden path must work after the actual rose gift,
// including a saved position already against the right boundary.
const gift=at(0,{rose:true},85,185);run(gift,'give rose to merrin');
assert(gift.game.state.flags.roseGiven,'gift fixture follows the real parser action');
for(const y of [195,198,201])for(const stride of [1,3])for(const x of [280,308]){
 const a=at(0,gift.game.state.flags,x,y);
 assert(a.game.canStand(x,y),'right-edge fixture is walkable');
 for(let step=0;step<40&&a.game.state.room===0;step++)a.game.movePlayer(stride,0);
 assert.equal(a.game.state.room,3,'post-gift right-edge crossing at x='+x+', y='+y+', stride='+stride);
 assert(a.game.canStand(a.game.state.player.x,a.game.state.player.y),'safe orchard landing');
 assert(a.game.state.flags.roseGiven&&a.game.state.flags.workshopKey,'gift and key persist across crossing');
}
console.log('PASS post-gift lower/right boundary along the clear path at three heights, two strides, normal approaches/restored edge positions, safe landings and retained key.');

// ArrowRight actually takes five-unit steps. A phase ending at x304 used
// to stop before the exit when its next endpoint (x309) left the floor.
const sequence=at(0,{},273,184);run(sequence,'take rose');run(sequence,'take bell');
assert(sequence.game.state.flags.rose&&sequence.game.state.flags.bell,'rose and bell collected');
s.qa.approach(sequence,'man');run(sequence,'give rose to merrin');
assert(sequence.game.state.flags.roseGiven,'full reported sequence reaches gift');
for(const y of [195,198,201])for(const x of [279,280,281,282,283,304,308]){
 const a=at(0,sequence.game.state.flags,x,y);
 a.key('ArrowRight');
 for(let tick=0;tick<20&&a.game.state.room===0;tick++)for(const fn of [...a.intervals.values()])fn();
 assert.equal(a.game.state.room,3,'real ArrowRight from x='+x+', y='+y);
 assert(a.game.state.flags.workshopKey&&a.game.state.flags.bell,'key and bell survive');
}
console.log('PASS actual ArrowRight/timer input after rose, bell and gift, along the clear path at three heights, all five step phases and stranded edge positions.');

const courtyardEntry=boot();courtyardEntry.start();drain(courtyardEntry);s.qa.travel(courtyardEntry,'courtyard');
assert.equal(courtyardEntry.game.state.room,8);assert.equal(courtyardEntry.game.state.player.y,232,'garden arrival is just inside bottom courtyard gate');assert.equal(courtyardEntry.game.state.player.facing,'back');
courtyardEntry.game.movePlayer(0,-3);assert.equal(courtyardEntry.game.state.room,8,'first inward step cannot bounce back');assert.equal(courtyardEntry.game.state.player.y,229);
courtyardEntry.game.movePlayer(0,3);assert.equal(courtyardEntry.game.state.room,8,'entry point stays outside return trigger');courtyardEntry.game.movePlayer(0,3);assert.equal(courtyardEntry.game.state.room,0,'deliberate outward step returns through gate');
console.log('PASS courtyard arrival near bottom edge, inward movement, no entry bounce and intentional return to garden.');

// The broad courtyard floor follows the lawn/wall seam, with separate
// approach corridors preserving the workshop and gallery thresholds.
const wall=at(8,ready,150,160);
assert.equal(wall.game.canStand(150,145,8),false,'reported central wall position is blocked');
assert.equal(wall.game.canStand(150,154,8),true,'lawn below the central wall remains open');
assert.equal(wall.game.canStand(224,150,8),false,'gallery wing wall is solid');
for(let n=0;n<12;n++)wall.game.movePlayer(0,-3);
assert(wall.game.state.player.y>=153,'northward walking stops at central wall seam');assert(wall.game.state.player.y<=157,'can approach the lawn edge');
for(const [point,delta]of [[[145,155],[-3,-3]],[[195,155],[3,-3]]]){
 const a=at(8,ready,...point);for(let n=0;n<8;n++)a.game.movePlayer(...delta);const p=a.game.state.player;assert(a.game.canStand(p.x,p.y,8));assert(p.y>=153,'diagonal approach cannot enter central wall');
}
console.log('PASS courtyard central/gallery walls block high and diagonal movement; all doorway routes remain reachable.');
