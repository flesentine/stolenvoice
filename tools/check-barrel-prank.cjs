const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
let h=fs.readFileSync('tools/check-expanded-adventure.cjs','utf8').split("check('Eight rooms")[0];
const legacy=fs.readFileSync('backups/barrel-prank-before-native-trace-2026-10-31.js','utf8').replace(/rosella/g,'elara').replace(/Rosella/g,'Elara');
h=h.replace('globalThis.game={command,','const heard=[];playGameSound=(...args)=>{if(!soundEnabled)return;heard.push(args);stopGameSound();effectSource={stop(){this.stopped=true},disconnect(){}}};const legacyBarrelDraw=(()=>{'+legacy+';return drawBarrelPrank})();globalThis.game={get heard(){return heard},get audio(){return effectSource},get soundName(){return storyScoreName()},mute(value){soundEnabled=!value;if(value)stopGameSound()},legacyBarrelDraw,tickStoryEffect,beginSwimming,drawBarrelPrank,barrelPrankCel,drawBarrelEmergence,get action(){return storyAction},setFrame(f){storyAction.frame=f},reduced(){window.matchMedia=()=>({matches:true})},place(r=2,x=276,y=193){room=r;player={x,y,step:1,facing:"back"}},command,');
const s={require,console,Buffer,__dirname};vm.createContext(s);vm.runInContext(h+';globalThis.qa={boot};',s);
function drain(a){let n=0;while(a.game.state.popupOpen&&n++<30)a.game.closeMessage();assert(n<30)}
function boot(){const a=s.qa.boot();a.start();drain(a);a.game.place();return a}
const a=boot(),before=a.game.state;a.game.command('open barrel');assert(a.game.state.flags.barrelOpen);assert(!a.game.action);drain(a);
a.game.command('look in barrel more');assert.equal(a.game.action.kind,'barrelPrank');assert.equal(a.game.action.total,135);assert(a.game.state.flags.manureSoiled);
a.doc.hidden=true;a.game.tickStoryEffect();assert.equal(a.game.action.frame,0);a.doc.hidden=false;
const ctx=a.get('canvas').getContext('2d'),frames=[];let paints=[];ctx.fillRect=function(x,y,w,h){paints.push([x,y,w,h,this.fillStyle])};
for(let f=0;f<135;f++){a.game.setFrame(f);paints=[];a.game.drawBarrelPrank();assert(paints.length>30);assert(paints.every(p=>p.slice(0,4).every(Number.isInteger)&&p[2]>0&&p[3]>0));frames.push({f,paints})}
fs.writeFileSync('assets/reviews/barrel-prank-paint.json',JSON.stringify(frames));
a.game.setFrame(134);a.game.tickStoryEffect();assert(!a.game.action);drain(a);assert.equal(a.game.state.player.x,248);assert.equal(a.game.state.player.y,191);assert.equal(a.game.state.player.facing,'front');assert.equal(a.game.state.player.step,1);assert(a.game.canStand(248,191,2));assert.equal(a.game.state.score,before.score);assert.deepEqual(a.game.state.inv,before.inv);
a.game.saveGame();drain(a);a.game.restoreGame();drain(a);assert(a.game.state.flags.manureSoiled);assert(a.game.state.flags.barrelOpen);
a.game.place(4,126,204);a.game.beginSwimming(155,201);assert(!a.game.state.flags.manureSoiled);assert.match(a.message.replace(/\s+/g,' '),/rinses away.*manure/);
const b=boot();b.game.command('look in barrel');drain(b);b.game.reduced();b.game.command('look closer');assert(!b.game.action);assert(b.game.state.flags.manureSoiled);assert.equal(b.game.state.player.x,248);assert.equal(b.game.state.player.facing,'front');
const c=boot();c.game.command('open barrel');drain(c);c.game.command('close lid');assert(!c.game.state.flags.barrelOpen);
console.log('PASS barrel opening/second look, native poses, hidden pause, reduced motion, settled forward-facing player, unchanged inventory/score, save/restore and river washing callback.');

const old=boot();old.game.saveGame();drain(old);const raw=JSON.parse(old.storage.get(old.game.key));delete raw.flags.barrelOpen;delete raw.flags.manureSoiled;old.storage.set(old.game.key,JSON.stringify(raw));old.game.restoreGame();drain(old);assert.equal(old.game.state.flags.manureSoiled,false);assert.equal(old.game.state.flags.barrelOpen,false);
const interrupted=boot();interrupted.game.command('open barrel');drain(interrupted);interrupted.game.command('peer deeper');interrupted.game.movePlayer(-1,0);assert(!interrupted.game.action);assert(interrupted.game.state.flags.manureSoiled);

assert.equal(a.game.barrelPrankCel(35).stage,'kick');assert.equal(a.game.barrelPrankCel(90).stage,'straddle');assert.equal(a.game.barrelPrankCel(95).stage,'lower');assert.equal(a.game.barrelPrankCel(105).stage,'tug');assert.equal(a.game.barrelPrankCel(110).stage,'release');

function paintedPixels(fn){const out=new Map();ctx.fillRect=function(x,y,w,h){for(let dy=0;dy<h;dy++)for(let dx=0;dx<w;dx++)out.set((x+dx)+160*(y+dy),this.fillStyle)};fn();return [...out.entries()].sort((a,b)=>a[0]-b[0])}
a.game.place();a.game.command('open barrel');drain(a);a.game.command('look closer');
for(let f=58;f<82;f++){a.game.setFrame(f);assert.deepEqual(paintedPixels(()=>a.game.drawBarrelPrank()),paintedPixels(()=>a.game.legacyBarrelDraw()),'approved head rise/shake pixels preserved at '+f)}

// Last cleanup cels stay registered; completion commits that same floor spot.
const ending=boot();ending.game.command('open barrel');drain(ending);ending.game.command('look closer');
const ectx=ending.get('canvas').getContext('2d');let draws=[];ectx.fillRect=function(...args){draws.push([...args,this.fillStyle])};
let held;
for(let f=130;f<135;f++){ending.game.setFrame(f);draws=[];ending.game.drawBarrelPrank();if(held)assert.deepEqual(draws,held,'no return slide during final cleanup hold');held=draws}
ending.game.tickStoryEffect();drain(ending);const settled=ending.game.state.player;ending.game.movePlayer(-1,0);assert.equal(ending.game.state.player.x,settled.x-1,'walking continues from cleanup spot');

// The fall tune starts with overbalance, survives the old impact tick, and
// resumes at the animation-relative offset instead of restarting its melody.
const music=boot();music.game.mute(false);music.game.command('open barrel');drain(music);music.game.command('look closer');
for(let f=0;f<19;f++)music.game.tickStoryEffect();assert(!music.game.heard.some(c=>c[0]==='barrelTumble'));
music.game.tickStoryEffect();assert.equal(music.game.action.frame,20);assert.equal(music.game.heard.at(-1)[0],'barrelTumble');assert.equal(music.game.heard.at(-1)[2],0);
for(let f=20;f<27;f++)music.game.tickStoryEffect();
const paused=music.game.audio;music.doc.hidden=true;music.game.tickStoryEffect();assert(paused.stopped);assert.equal(music.game.action.frame,27);
music.doc.hidden=false;music.game.tickStoryEffect();assert(Math.abs(music.game.heard.at(-1)[2]-.63)<1e-9,'resume follows fall score offset');
music.game.mute(true);const n=music.game.heard.length;music.game.tickStoryEffect();assert.equal(music.game.heard.length,n,'muted fall stays silent');music.game.mute(false);music.game.tickStoryEffect();assert.equal(music.game.heard.at(-1)[0],'barrelTumble');assert(Math.abs(music.game.heard.at(-1)[2]-.81)<1e-9);
while(music.game.action.frame<44)music.game.tickStoryEffect();assert.equal(music.game.soundName,'barrelTumble');assert(!music.game.heard.some(c=>c[0]==='appleDrop'),'old impact cue cannot cut the tune off');
music.game.tickStoryEffect();assert.equal(music.game.soundName,'');const active=music.game.audio;music.game.movePlayer(5,0);assert(!music.game.action);assert(active.stopped,'interrupting the gag stops its music');
console.log('PASS barrel tumble cue at20, uninterrupted plop at34, timed ending, pause/resume offsets, mute and interruption.');
