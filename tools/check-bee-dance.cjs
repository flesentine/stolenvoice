const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
let h=fs.readFileSync('tools/check-expanded-adventure.cjs','utf8').split("check('Eight rooms")[0];
h=h.replace('globalThis.game={command,','globalThis.game={tickStoryEffect,orchardHive,orchardDanceBeePoint,paintAudience(){sceneProps=[];orchardHive();sceneProps.sort((a,b)=>a.depth-b.depth).forEach(p=>p.paint());drawElaraDance(player.x,player.y)},advanceScouts(){orchardBeeFrame++;moveOrchardScouts()},get action(){return storyAction},setFrame(f){storyAction.frame=f},place(r,x,y){room=r;player={x,y,step:1,facing:"front"}},command,');
const s={require,console,Buffer,__dirname};vm.createContext(s);vm.runInContext(h+';globalThis.qa={boot};',s);
function drain(a){while(a.game.state.popupOpen)a.game.closeMessage()}
function at(r=3,x=181,y=202){const a=s.qa.boot();a.start();drain(a);a.game.place(r,x,y);return a}
for(const text of ['dance','dance for bees','dance with the bees','dance before hive','dance in front of the bees']){
 const a=at(),before=a.game.state;a.game.command(text);assert(a.game.action.beeAudience);assert.equal(a.game.action.total,48);
 const positions=[];for(let f=0;f<48;f++){a.game.setFrame(f);positions.push([0,1,2].map(i=>a.game.orchardDanceBeePoint(i,{x:100+i*2,y:120})));assert.deepEqual(a.game.orchardDanceBeePoint(4,{x:110,y:120}),{x:110,y:120},'other five bees stay independent')}
 assert.notDeepEqual(positions[16],positions[20],'copy her waggle');assert.notDeepEqual(positions[28],positions[39],'twirl breaks formation');assert(positions[39][0].x<90&&positions[39][2].x>120,'scatter in different directions');
 a.doc.hidden=true;a.game.tickStoryEffect();assert.equal(a.game.action.frame,47);a.doc.hidden=false;a.game.tickStoryEffect();assert(!a.game.action);assert.match(a.message.replace(/\s+/g,' '),/Three bees.*directions to a flower/);
 for(const field of ['player','flags','inv','score'])assert.deepEqual(a.game.state[field],before[field],'optional bee dance preserves '+field);
}
const far=at(3,30,205);far.game.command('dance');assert(!far.game.action.beeAudience,'ordinary distant dance');
const explicit=at(3,30,205);explicit.game.command('dance with bees');assert(!explicit.game.action);assert.match(explicit.message,/closer/);
const elsewhere=at(2,160,212);elsewhere.game.command('dance with bees');assert(!elsewhere.game.action);assert.match(elsewhere.message,/no bees/);
const interrupted=at();interrupted.game.command('dance');interrupted.game.movePlayer(-1,0);assert(!interrupted.game.action);
console.log('PASS local bee-dance aliases, waggle/failed twirl/scatter, ordinary distant dance, pause/interruption and unchanged quest state.');

const art=at(),ctx=art.get('canvas').getContext('2d');art.game.command('dance');const frames=[];let dots=[];ctx.fillRect=function(x,y,w,h){dots.push([x,y,w,h,this.fillStyle])};
for(let f=0;f<48;f++){art.game.setFrame(f);dots=[];art.game.paintAudience();assert(dots.every(p=>p.slice(0,4).every(Number.isInteger)));frames.push(dots);art.game.advanceScouts()}
fs.writeFileSync('assets/reviews/bee-dance-paint.json',JSON.stringify(frames));
