const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');let h=fs.readFileSync('tools/check-expanded-adventure.cjs','utf8').split("check('Eight rooms")[0];h=h.replace('globalThis.game={command,','const heard=[];playGameSound=(...args)=>heard.push(args);globalThis.game={get heard(){return heard},get disaster(){return hiveDisaster},get action(){return storyAction},get hiveArt(){return hiveKickArtwork},tickStoryEffect,finishStoryEffect,drawHiveKickObject,drawHiveKickHero,drawHiveAttack,scoutPixels:orchardScoutPixels,setFrame(f){storyAction.frame=f},reduced(){window.matchMedia=()=>({matches:true})},place(r=3,x=190,y=212){room=r;player={x,y,step:1,facing:"front"}},command,');const s={require,console,Buffer,__dirname};vm.createContext(s);vm.runInContext(h+';globalThis.qa={boot};',s);
function fresh(r=3,x=190,y=212){const a=s.qa.boot();a.start();while(a.game.state.popupOpen)a.game.closeMessage();a.game.place(r,x,y);return a}
function walkIn(a){let ticks=0;while(a.game.disaster?.walking&&ticks++<100)a.game.tickStoryEffect();assert(ticks<100,'walk reaches kick position')}
function drain(a){let text='',n=0;while(a.game.state.popupOpen&&n++<20){text+=' '+a.message;a.key('Enter')}assert(n<20);return text.replace(/\s+/g,' ')}
for(const text of ['kick hive','kick the hive over','kick over beehive','topple straw hive','knock over the bee hive']){
 const a=fresh(),before=a.game.state;a.game.saveGame();drain(a);const raw=a.storage.get(a.game.key);a.game.command(text);assert.equal(a.game.action.kind,'hiveKick');a.doc.hidden=true;a.game.tickStoryEffect();assert.equal(a.game.action.frame,0);a.doc.hidden=false;
 a.game.movePlayer(5,0);assert.equal(a.game.action.frame,0,'movement cannot evade committed kick');a.game.saveGame();assert.equal(a.storage.get(a.game.key),raw,'kick cannot overwrite save');
 walkIn(a);for(let n=0;n<64;n++)a.game.tickStoryEffect();assert(a.game.disaster.dead);assert(!a.game.state.playing);assert(a.game.state.popupOpen);assert.equal(a.game.state.score,before.score);assert.deepEqual(a.game.state.flags,before.flags);assert(a.game.heard.some(c=>c[0]==='hiveFury'));assert(a.game.heard.some(c=>c[0]==='hiveDoom'));
 const message=drain(a);assert.match(message,/kicked the bucket/);assert(!a.game.disaster);assert(a.game.state.playing);assert.equal(a.game.state.room,3);assert.deepEqual(a.game.state.player,before.player);assert.equal(a.storage.get(a.game.key),raw);
}
for(const [r,x,y]of [[0,190,212],[3,30,210]]){const a=fresh(r,x,y);a.game.command('kick hive');assert(!a.game.disaster);assert.match(a.message,/no hive|too far/i)}
const reduced=fresh();reduced.game.reduced();reduced.game.command('kick hive');assert(reduced.game.disaster.dead);drain(reduced);assert(reduced.game.state.playing);
const restored=fresh();restored.game.saveGame();drain(restored);restored.game.command('kick hive');restored.game.finishStoryEffect();restored.key('F7');assert(!restored.game.disaster);assert(restored.game.state.playing);drain(restored);
const art=fresh();art.game.command('kick hive');walkIn(art);const ctx=art.get('canvas').getContext('2d'),frames=[];for(let f=0;f<64;f++){art.game.setFrame(f);const dots=[];ctx.fillRect=function(x,y,w,h){assert([x,y,w,h].every(Number.isInteger));assert(x>=0&&x<160&&y>=0&&y<168,'native bounds');dots.push([x,y,w,h,this.fillStyle])};assert(art.game.drawHiveKickObject());assert(art.game.drawHiveKickHero());art.game.drawHiveAttack();frames.push(dots)}assert.notDeepEqual(frames[14],frames[28],'hive tips');assert.notDeepEqual(frames[30],frames[60],'swarm/collapse change');fs.writeFileSync('assets/reviews/hive-disaster-frames.json',JSON.stringify(frames));
// Check physical proportions on the AGI display's wide native pixels.
function hiveExtent(frame){
 art.game.setFrame(frame);const dots=[];ctx.fillRect=function(x,y,w,h){dots.push([x,y,this.fillStyle])};art.game.drawHiveKickObject();
 const straw=dots.slice(art.game.hiveArt.underlay.length),xs=straw.map(d=>d[0]),ys=straw.map(d=>d[1]);
 return{width:Math.max(...xs)-Math.min(...xs)+1,height:Math.max(...ys)-Math.min(...ys)+1,count:straw.length};
}
const upright=hiveExtent(14),fallen=hiveExtent(28);
assert(Math.abs(fallen.width-upright.height*.6)<=1.5,'fallen width preserves the upright physical height');
assert(Math.abs(fallen.height*.6-upright.width)<=1.5,'fallen height preserves the upright physical width');
for(let f=14;f<=28;f++)assert(Math.abs(hiveExtent(f).count/upright.count-1)<.1,'rotating skep stays full, with no clipped/squashed silhouette');
// Exercise approach, attack, collapse AND the held death frame. The browser
// ignores invalid fillStyle assignments, so check colors explicitly here.
const palette=new Set(['#000000','#0000aa','#00aa00','#00aaaa','#aa0000','#aa00aa','#aa5500','#aaaaaa','#555555','#5555ff','#55ff55','#55ffff','#ff5555','#ff55ff','#ffff55','#ffffff']);
let held;
for(let f=0;f<=64;f++){
 art.game.setFrame(f);const hero=[];
 ctx.fillRect=function(x,y,w,h){assert(palette.has(this.fillStyle),'every sprite ink resolves to a real EGA color');hero.push([x,y,w,h,this.fillStyle])};
 ctx.fillStyle='#aa5500';art.game.drawHiveKickHero();
 assert(hero.filter(dot=>dot[4]==='#ffff55').length>=8,'blonde hair remains visible in every hero frame');
 if(f>=48){const xs=hero.map(d=>d[0]),ys=hero.map(d=>d[1]);assert(Math.max(...xs)-Math.min(...xs)<=9,'collapse never rotates into a wide stretched body');assert(Math.max(...ys)<=140,'folded knees/shoes stay on the floor')}
 if(f===60)held=JSON.stringify(hero);if(f>=60)assert.equal(JSON.stringify(hero),held,'final slumped pose stays still');
 const bees=[];ctx.fillRect=function(x,y,w,h){bees.push([x,y,this.fillStyle])};art.game.drawHiveAttack();
 if(f<22){assert.equal(bees.length,0);continue}
 assert.equal(bees.length,80,'sixteen normal five-pixel scouts');
 for(let i=0;i<16;i++){
  const sample=bees.slice(i*5,i*5+5),expected=art.game.scoutPixels(Math.floor(f/2),i),bx=sample[0][0],by=sample[0][1];
  for(let j=0;j<5;j++){assert.equal(sample[j][0]-bx,expected[j][0]);assert.equal(sample[j][1]-by,expected[j][1]);assert.equal(sample[j][2],expected[j][2],'attack uses the exact normal orchard bee ink and wing phase')}
 }
}
console.log('PASS hive kick aliases/reach, shape-preserving AGI-aspect tip, 64-frame swarm/knee slump, blonde palette in all65 poses, normal scout-sized bees, death/retry/F7 restore, reduced motion, pause, save protection, unchanged quest and native painter bounds.');
