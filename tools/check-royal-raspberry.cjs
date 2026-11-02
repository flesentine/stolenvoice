const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
let h=fs.readFileSync('tools/check-expanded-adventure.cjs','utf8').split("check('Eight rooms")[0];
h=h.replace('globalThis.game={command,','const heard=[];playGameSound=(...args)=>{if(!soundEnabled)return;heard.push(args);stopGameSound();effectSource={stop(){this.stopped=true},disconnect(){}}};globalThis.game={get heard(){return heard},get audio(){return effectSource},bellSwingFrame,get action(){return storyAction},tickStoryEffect,drawRoyalRaspberry,drawMirrorReflection,mirrorReflectionPose,royalRaspberryPixels,insidePolygon,orchardRaspberryBeePoint,orchardScoutBees,setMerrinVoice(returned,arrived){flags.voiceReturned=returned;flags.voiceArrivalSeen=arrived},paintHive(){sceneProps=[];orchardHive();sceneProps.sort((a,b)=>a.depth-b.depth).forEach(p=>p.paint());drawRoyalRaspberry(player.x,player.y)},setFrame(f){storyAction.frame=f},place(r=2,face="right",px=160){room=r;player={x:px,y:212,step:1,facing:face};soundEnabled=true},reduced(){window.matchMedia=()=>({matches:true})},command,');
const s={require,console,Buffer,__dirname};vm.createContext(s);vm.runInContext(h+';globalThis.qa={boot};',s);
function at(r=2,face='right',px=160){const a=s.qa.boot();a.start();while(a.game.state.popupOpen)a.game.closeMessage();a.game.place(r,face,px);return a}
for(let r=0;r<9;r++){
 const a=at(r),before=a.game.state;a.game.command('fart');assert.equal(a.game.action.kind,'royalRaspberry');assert.equal(a.game.action.total,r===6?50:32);
 for(let f=0;f<(r===6?50:32);f++)a.game.tickStoryEffect();assert(!a.game.action);assert.match(a.message.replace(/\s+/g,' '),/Wrong end/);
 for(const key of ['player','flags','inv','score'])assert.deepEqual(a.game.state[key],before[key],'optional gag preserves '+key);
 assert(a.game.heard.some(c=>c[0]==='royalRaspberry'));
}
const paintings=[];
for(const [face,px]of [['right',160],['left',160],['right',2],['left',317]]){
 const a=at(2,face,px);a.game.command('fart');const ctx=a.get('canvas').getContext('2d'),frames=[];
 for(let f=0;f<32;f++){
  a.game.setFrame(f);const dots=[];ctx.fillRect=function(x,y,w,h){assert([x,y,w,h].every(Number.isInteger));assert(x>=0&&x<160&&y>=0&&y<168);assert.equal(w,1);assert.equal(h,1);dots.push([x,y,w,h,this.fillStyle])};assert(a.game.drawRoyalRaspberry(a.game.state.player.x,212));frames.push(dots);
  const vapor=dots.filter(d=>['#aaaaaa','#55ff55'].includes(d[4]));if(f<5||f>24)assert.equal(vapor.length,0);
  if(px===160&&f>=5&&f<=15){assert(vapor.length>0);assert(vapor.every(d=>face==='left'?d[0]>80:d[0]<80),'vapor emits behind her, mirrored with facing')}
  if(f>=18)assert(dots.some(([x,y,w,h,c])=>x===Math.round(px/2)&&y===Math.round(212*.7)-31&&c==='#ff5555'),'hand covers mouth in reaction');
 }
 paintings.push(frames);
}
fs.writeFileSync('assets/reviews/royal-raspberry-paint.json',JSON.stringify(paintings));
const pause=at();pause.game.command('fart');for(let n=0;n<9;n++)pause.game.tickStoryEffect();const audio=pause.game.audio;pause.doc.hidden=true;pause.game.tickStoryEffect();assert.equal(pause.game.action.frame,9);assert(audio.stopped);pause.doc.hidden=false;pause.game.tickStoryEffect();assert(Math.abs(pause.game.heard.at(-1)[2]-.36)<1e-9);const resumed=pause.game.audio;pause.game.movePlayer(5,0);assert(!pause.game.action);assert(resumed.stopped);
const reduced=at();reduced.game.reduced();reduced.game.command('fart');assert(!reduced.game.action);assert(reduced.game.state.popupOpen);
console.log('PASS FART in all nine rooms, 32 native frames (50 for cave echoes), rear-facing vapor/bounds, hand-to-mouth, comic popup, score/inventory/state preservation, pause/resume/interruption and reduced motion.');

// Nearby audiences respond; distance and voice-restoration state matter.
for(const [returned,arrived,expected]of [[false,false,/ding-ding/],[true,false,/ding-ding/],[true,true,/fertilizer/]]){
 const a=at(0,'right',64);a.game.setMerrinVoice(returned,arrived);const before=a.game.state;a.game.command('fart');assert.equal(a.game.action.raspberryAudience,'merrin');for(let f=0;f<32;f++)a.game.tickStoryEffect();assert.match(a.message.replace(/\s+/g,' '),expected);for(const key of ['player','flags','inv','score'])assert.deepEqual(a.game.state[key],before[key]);
}
const distant=at(0,'right',260);distant.game.command('fart');assert.equal(distant.game.action.raspberryAudience,'');assert.match(distant.game.action.message,/dignity/);
const cave=at(6);cave.game.command('fart');assert.equal(cave.game.action.raspberryAudience,'cave');assert.match(cave.game.action.message,/grotto.*booming.*again/);
const wider=at(3,'right',87);wider.game.command('fart');assert.equal(wider.game.action.raspberryAudience,'bees','bees react out to120 world pixels');
const outside=at(3,'right',86);outside.game.command('fart');assert.equal(outside.game.action.raspberryAudience,'','beyond expanded radius stays ordinary');
const farBees=at(3,'right',30);farBees.game.command('fart');assert.equal(farBees.game.action.raspberryAudience,'');
const frenzy=at(3,'right',181),before=frenzy.game.state;frenzy.game.command('fart');assert.equal(frenzy.game.action.raspberryAudience,'bees');assert.equal(frenzy.game.action.beeFrenzy.length,8);
const normal=JSON.stringify(frenzy.game.orchardScoutBees()),point={x:104,y:119},poses=[],paint=[],ctx=frenzy.get('canvas').getContext('2d');
for(let f=0;f<32;f++){
 frenzy.game.setFrame(f);const positions=Array.from({length:8},(_,i)=>frenzy.game.orchardRaspberryBeePoint(i,point));assert.equal(JSON.stringify(positions),JSON.stringify(Array.from({length:8},(_,i)=>frenzy.game.orchardRaspberryBeePoint(i,point))),'repaint does not rerandomize panic');poses.push(positions);
 const dots=[];ctx.fillRect=function(x,y,w,h){assert([x,y,w,h].every(Number.isInteger));assert(x>=0&&x<160&&y>=0&&y<168);dots.push([x,y,w,h,this.fillStyle])};frenzy.game.paintHive();paint.push(dots);
}
assert.equal(JSON.stringify(frenzy.game.orchardScoutBees()),normal,'frenzy offsets do not mutate ordinary flight');
assert(poses.slice(9,26).some(ps=>Math.max(...ps.map(p=>p.x))-Math.min(...ps.map(p=>p.x))>30),'eight bees scatter widely');
assert(poses.slice(10,25).some((ps,n)=>ps.some((p,i)=>Math.hypot(p.x-poses[n+9][i].x,p.y-poses[n+9][i].y)>4)),'frenzy is visibly quicker than usual scouting');
fs.writeFileSync('assets/reviews/raspberry-bee-frenzy-paint.json',JSON.stringify(paint));
ctx.fillRect=()=>{};frenzy.game.tickStoryEffect();assert(!frenzy.game.action);assert.equal(frenzy.game.orchardRaspberryBeePoint(0,point),point,'bees immediately return to normal rendering');assert.match(frenzy.message.replace(/\s+/g,' '),/scatter.*new flower/);for(const key of ['player','flags','inv','score'])assert.deepEqual(frenzy.game.state[key],before[key]);
console.log('PASS nearby silent/restored Merrin replies, distant refusal to react, cave echo joke, eight fast scattered bees, pure/stable redraw and normal-flight cleanup.');

const cycle=at(),comments=[];for(let n=0;n<5;n++){cycle.game.command('fart');comments.push(cycle.game.action.message);for(let f=0;f<32;f++)cycle.game.tickStoryEffect();while(cycle.game.state.popupOpen)cycle.game.closeMessage()}
assert.equal(new Set(comments.slice(0,4)).size,4,'four different comments');assert.equal(comments[4],comments[0],'comments cycle predictably');
const mirror=at(1,'back',144);mirror.game.command('fart');const mctx=mirror.get('canvas').getContext('2d'),mirrorFrames=[],glass=[[63,48],[72,38],[82,48],[82,101],[63,101]];
for(let f=0;f<32;f++){
 mirror.game.setFrame(f);const dots=[];mctx.fillRect=function(x,y,w,h){assert(mirror.game.insidePolygon(x,y,glass),'reflection/vapor clipped to glass');assert.equal(w,1);assert.equal(h,1);dots.push([x,y,w,h,this.fillStyle])};mirror.game.drawMirrorReflection();assert(dots.length>50);mirrorFrames.push(dots);
 if(f===10)assert(dots.some(d=>d[4]==='#55ff55'||d[4]==='#aaaaaa'),'vapor reflected');
}
assert.notEqual(JSON.stringify(mirrorFrames[0]),JSON.stringify(mirrorFrames[24]),'reaction reflected');
const backReaction=mirror.game.royalRaspberryPixels(24,true);assert(backReaction.some(([x,y,c])=>x===4&&y===9&&c===12),'reflection raises hand beside the back of her head');assert(!backReaction.some(([x,y,c])=>x===0&&y===8&&c===12),'no mouth painted through rear-facing hair');
fs.writeFileSync('assets/reviews/raspberry-mirror-paint.json',JSON.stringify(mirrorFrames));
console.log('PASS four cycling comments, shared reflected puff/hand reaction and complete glass clipping.');

const belfry=at(7),bellBefore=belfry.game.state;belfry.game.command('fart');
assert.equal(belfry.game.action.raspberryAudience,'belfry');
const swings=[];for(let f=0;f<32;f++){belfry.game.setFrame(f);const cel=belfry.game.bellSwingFrame();swings.push(cel);assert.equal(belfry.game.bellSwingFrame(),cel,'redraw does not advance bell');if(f<5||f>=20)assert.equal(cel,null)}
assert(new Set(swings.filter(f=>f!==null)).size>=5,'gust swings bell through existing native cels');
belfry.game.setFrame(31);belfry.game.tickStoryEffect();assert.equal(belfry.game.bellSwingFrame(),null);assert.match(belfry.message,/blame the wind/);
for(const key of ['player','flags','inv','score'])assert.deepEqual(belfry.game.state[key],bellBefore[key]);
const reducedBell=at(7);reducedBell.game.command('fart');reducedBell.game.setFrame(9);reducedBell.game.reduced();assert.equal(reducedBell.game.bellSwingFrame(),null);
const interruptedBell=at(7);interruptedBell.game.command('fart');interruptedBell.game.setFrame(9);interruptedBell.game.movePlayer(3,0);assert.equal(interruptedBell.game.bellSwingFrame(),null);
console.log('PASS belfry gust swings existing bell cels from puff5, settles, preserves puzzles/state, reduced motion and interruption.');

const echoes=at(6);echoes.game.command('fart');const calls=[];
for(let f=1;f<=50;f++){const before=echoes.game.heard.length;echoes.game.tickStoryEffect();if(echoes.game.heard.length>before)calls.push([f,...echoes.game.heard.at(-1)])}
assert.deepEqual(JSON.parse(JSON.stringify(calls)),[[5,'royalRaspberry',false,0,1],[20,'royalRaspberry',false,0,.6],[35,'royalRaspberry',false,0,.35]],'three total playbacks, with space between and descending volume');
assert(!echoes.game.action);assert(echoes.game.state.popupOpen);
const pausedEcho=at(6);pausedEcho.game.command('fart');for(let f=0;f<23;f++)pausedEcho.game.tickStoryEffect();pausedEcho.doc.hidden=true;pausedEcho.game.tickStoryEffect();assert(pausedEcho.game.audio===null||pausedEcho.game.audio.stopped);const held=pausedEcho.game.action.frame;pausedEcho.game.tickStoryEffect();assert.equal(pausedEcho.game.action.frame,held);pausedEcho.doc.hidden=false;pausedEcho.game.tickStoryEffect();assert.deepEqual(JSON.parse(JSON.stringify(pausedEcho.game.heard.at(-1))),['royalRaspberry',false,.27,.6],'resume within the quieter second playback');
pausedEcho.game.movePlayer(3,0);assert(!pausedEcho.game.action);const stoppedCount=pausedEcho.game.heard.length;pausedEcho.game.tickStoryEffect();assert.equal(pausedEcho.game.heard.length,stoppedCount,'interruption cancels remaining echo');
console.log('PASS cave original plus two quieter echoes, exact starts/gains, pause/resume within echo, completion and interruption.');
