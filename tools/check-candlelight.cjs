const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path'),Agi=require('../editor/agi-picture.js');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8'),html=read('stolen-voice.html');
const patches=JSON.parse(html.match(/const galleryCandlePatches=(\[[^;]+);/)[1]);assert.equal(patches.length,6);
const original=Agi.render(JSON.parse(read('assets/rooms/gallery-workshop-v1.json')).commands),pixels=original.slice();
const EGA=Agi.palette.map(c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16)));
const ink={fillStyle:'',fillRect(x,y,w,h){let c;if(this.fillStyle.startsWith('#'))c=Agi.palette.indexOf(this.fillStyle);else{const rgb=this.fillStyle.match(/\d+/g).map(Number);c=EGA.findIndex(p=>p.every((v,i)=>v===rgb[i]))}assert(c>=0);assert.equal(w,1);assert.equal(h,1);pixels[y*160+x]=c}};
let seed=12345;const randomMath=Object.create(Math);randomMath.random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
const sandbox={Math:randomMath,galleryCandlePatches:patches,EGA,rosellaColors:Agi.palette,x:ink,animationFrame:0};vm.createContext(sandbox);vm.runInContext(read('game/gallery-candlelight.js')+'\nglobalThis.paint=galleryCandleLight;',sandbox);
const frames=[];for(let phase=0;phase<180;phase++){sandbox.animationFrame=phase%6;sandbox.paint();frames.push(Buffer.from(pixels));const snapshot=Buffer.from(pixels);sandbox.paint();assert.deepEqual(Buffer.from(pixels),snapshot,'redraw does not advance random flicker')}
for(const p of patches){const signature=f=>Array.from({length:5},(_,y)=>f[(p.wick[1]-5+y)*160+p.wick[0]]).join(',');const changes=frames.slice(1).filter((f,i)=>signature(f)!==signature(frames[i])).length;assert(changes>5&&changes<=90,'each independent candle holds at least two ticks');}
for(const frame of frames){
 for(const p of patches){const colors=new Set();for(let yy=p.wick[1]-5;yy<p.wick[1];yy++)colors.add(frame[yy*160+p.wick[0]]);for(const color of [6,14])assert(colors.has(color),'each flame keeps orange/yellow');assert(!colors.has(4),'no dark red flame tip')}
 for(let n=0;n<frame.length;n++)if(frame[n]!==original[n])assert(patches.some(p=>n%160>=p.left&&n%160<p.left+p.width&&Math.floor(n/160)>=p.top&&Math.floor(n/160)<p.top+6),'effects remain within flame patches');
}
fs.writeFileSync('assets/reviews/warm-candle-frames.json',JSON.stringify(frames.slice(0,30).map(f=>Array.from(f))));
// Exercise the actual built gallery and its shared timer with the DOM stand-in.
let harness=read('tools/check-expanded-adventure.cjs');harness=harness.slice(0,harness.indexOf("check('Eight rooms"));const s={require,console,Buffer,__dirname};vm.createContext(s);vm.runInContext(harness+'\nglobalThis.candles={boot};',s);const a=s.candles.boot();a.start();a.game.saveGame();const key=a.game.key,save=JSON.parse(a.storage.get(key));save.room=1;delete save.player;const b=s.candles.boot(new Map([[key,JSON.stringify(save)]]));b.start();b.game.restoreGame();while(b.game.state.popupOpen)b.game.closeMessage();const before=b.game.state;for(let i=0;i<6;i++)for(const fn of b.intervals.values())fn();assert.deepEqual(b.game.state,before);b.game.command('look');const count=b.draws;for(const fn of b.intervals.values())fn();assert.equal(b.draws,count);
console.log('PASS single-column warm flames, independent random slow holds, redraw stability, exact underpainting, native bounds and popup pause.');

// Replay the same clock as FART: puff at tick5, ignition two beats later at7, then
// a large flare and a fade before the reaction ends. Each draw starts with
// the real gallery underpainting, as gallery() does when clearing the scene.
const flareFrames=[];let activePaint=0;
for(let frame=0;frame<32;frame++){
 pixels.set(original);sandbox.storyAction={kind:'royalRaspberry',frame};sandbox.paint();const snapshot=Buffer.from(pixels);sandbox.paint();assert.deepEqual(Buffer.from(pixels),snapshot,'flare redraw is stable');flareFrames.push(Array.from(pixels));
 let outside=0;for(let n=0;n<pixels.length;n++)if(pixels[n]!==original[n]&&!patches.some(p=>n%160>=p.left&&n%160<p.left+p.width&&Math.floor(n/160)>=p.top&&Math.floor(n/160)<p.top+6))outside++;
 if(frame<7||frame>=24)assert.equal(outside,0,'normal small flames before delayed flare and after its fade');
 if(frame===7)assert(outside>20,'all candles ignite two beats after the first puff');
 if(frame===12){assert(outside>100,'huge flames rise far beyond normal flame patches');activePaint=outside;for(const {wick}of patches)assert([-1,0,1].some(dx=>pixels[(wick[1]-16)*160+wick[0]+dx]!==original[(wick[1]-16)*160+wick[0]+dx]),'each candle flares high')}
}
assert(activePaint>0);pixels.set(original);sandbox.storyAction=null;sandbox.paint();for(let n=0;n<pixels.length;n++)if(pixels[n]!==original[n])assert(patches.some(p=>n%160>=p.left&&n%160<p.left+p.width&&Math.floor(n/160)>=p.top&&Math.floor(n/160)<p.top+6),'interruption restores ordinary candle bounds');
fs.writeFileSync('assets/reviews/raspberry-candle-flare-frames.json',JSON.stringify(flareFrames));
console.log('PASS six candle flares delayed two ticks after puff5, ignition7, huge EGA peaks, stable redraw, fade24 and interruption cleanup.');
