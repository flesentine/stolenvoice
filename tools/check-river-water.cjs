const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path'),A=require('../editor/agi-picture.js'),root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const data=vm.runInNewContext(read('game/water-pictures.js')+';riverWaterPictures'),decode=b64=>{const b=Buffer.from(b64,'base64'),p=[];for(let i=0;i<b.length;i+=2)for(let n=0;n<b[i];n++)p.push(b[i+1]);return p},frames=data.frames.map(decode),base=A.render(JSON.parse(read('assets/rooms/bridge-workshop-v1.json')).commands),rotors=vm.runInNewContext(read('game/wheel-pictures.js')+';wheelPictures.bridge').map(decode);
assert.equal(new Set(data.frames).size,12);let covered=0;
for(let n=0;n<160*168;n++){
 const mask=frames[0][n]!==16;if(mask)covered++;
 for(const frame of frames){assert.equal(frame.length,160*168);assert([1,9,11,16].includes(frame[n]));assert.equal(frame[n]!==16,mask,'steady clipping footprint');if(mask){assert([1,9,11].includes(base[n]),'only visible source water');for(const rotor of rotors)assert([1,9,11].includes(rotor[n]),'never paints rotating paddles')}}
}
assert(covered>1000);assert(frames.every(frame=>frame.some((v,n)=>v===11&&n%160<50)),'animated mill race');
let h=read('tools/check-expanded-adventure.cjs');h=h.slice(0,h.indexOf("check('Eight rooms"));h=h.replace('globalThis.game={command,','globalThis.game={get waterUI(){return{frame:riverWaterFrame,cached:riverWaterCache.filter(Boolean).length}},command,');const s={require,console,Buffer,__dirname};vm.createContext(s);vm.runInContext(h+';globalThis.qa={boot};',s);const {boot}=s.qa,first=boot();first.start();first.game.saveGame();const save=JSON.parse(first.storage.get(first.game.key));
function at(running){const a=boot(new Map([[first.game.key,JSON.stringify({...save,sluice:undefined,room:4,flags:{...save.flags,oilTaken:running,wheelOiled:running,wheelUnlocked:running,wheelTurned:running}})]]));a.start();a.game.restoreGame();while(a.game.state.popupOpen)a.game.closeMessage();return a}
const pulse=a=>{for(const fn of [...a.intervals.values()])fn()};
for(const running of [false,true]){
 const a=at(running),before=a.game.state;for(let i=0;i<12;i++)pulse(a);assert.equal(a.game.waterUI.cached,12,'water flows whether or not wheel turns');assert.deepEqual(a.game.state.flags,before.flags);assert.equal(a.game.state.score,before.score);
 a.game.command('look');const frame=a.game.waterUI.frame;pulse(a);assert.equal(a.game.waterUI.frame,frame,'popup pauses river');a.game.closeMessage();
 a.doc.hidden=true;pulse(a);assert.equal(a.game.waterUI.frame,frame,'hidden tab pauses river');a.doc.hidden=false;
 for(const h of a.handlers.get('window:blur')||[])h.fn();pulse(a);assert.equal(a.game.waterUI.frame,frame,'unfocused window pauses river');
 for(const h of a.handlers.get('window:focus')||[])h.fn();pulse(a);assert.notEqual(a.game.waterUI.frame,frame,'focus resumes river');
}
console.log('PASS twelve looping native river/race cels, '+covered+' clipped water pixels, rotor/rock/deck protection, independent wheel gating and popup/hidden/focus pauses.');

const deltas=frames.map((f,i)=>f.reduce((sum,v,n)=>sum+(v!==frames[(i+1)%frames.length][n]),0));const seam=deltas.at(-1),average=deltas.reduce((a,b)=>a+b,0)/deltas.length;assert(seam<=average*1.35,'loop seam is no larger than ordinary flow steps');console.log('PASS loop seam: '+seam+' changing pixels vs '+average.toFixed(1)+' average; no collective reset.');
