const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
let harness=fs.readFileSync(path.join(__dirname,'check-expanded-adventure.cjs'),'utf8');harness=harness.slice(0,harness.indexOf("check('Eight rooms"));harness=harness.replace('get maxScore(){','get wheelCache(){return Object.keys(pictureCache).filter(key=>key.includes("-wheel-"))},get maxScore(){');
const sandbox={require,console,Buffer,__dirname};vm.createContext(sandbox);vm.runInContext(harness+'\nglobalThis.wheelHarness={boot};',sandbox);
const boot=sandbox.wheelHarness.boot,base=boot();base.start();base.game.saveGame();const key=base.game.key,save=JSON.parse(base.storage.get(key));
function at(room,running){const data={...save,room,player:{x:160,y:212,step:1,facing:'front'},flags:{...save.flags,oilTaken:running,wheelOiled:running,wheelTurned:running}};const a=boot(new Map([[key,JSON.stringify(data)]]));a.start();a.game.restoreGame();while(a.game.state.popupOpen)a.game.closeMessage();return a}
function tick(a){for(const fn of a.intervals.values())fn()}
const outsideStuck=at(4,false);for(let i=0;i<6;i++)tick(outsideStuck);assert.equal(outsideStuck.game.wheelCache.filter(k=>k.startsWith('bridge')).length,0);
const outside=at(4,true);for(let i=0;i<6;i++)tick(outside);assert.equal(outside.game.wheelCache.filter(k=>k.startsWith('bridge')).length,6);
const stuck=at(5,false);for(let i=0;i<6;i++)tick(stuck);assert.equal(stuck.game.wheelCache.filter(k=>k.startsWith('mill')).length,0);
const running=at(5,true);const before=running.game.state;for(let i=0;i<6;i++)tick(running);assert.equal(running.game.wheelCache.filter(k=>k.startsWith('mill')).length,6);assert.deepEqual(running.game.state.flags,before.flags);assert.equal(running.game.state.score,before.score);
running.game.command('look');const count=running.draws;tick(running);assert.equal(running.draws,count,'popup pauses animation');
const pictures=vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../game/wheel-pictures.js'),'utf8')+';wheelPictures');
for(const frames of Object.values(pictures)){assert.equal(new Set(frames).size,6);for(const frame of frames){const bytes=Buffer.from(frame,'base64');let pixels=0;for(let i=0;i<bytes.length;i+=2){pixels+=bytes[i];assert(bytes[i+1]<16)}assert.equal(pixels,160*168)}}
console.log('PASS six EGA cels per wheel, outside timer, inside puzzle gating, popup pause and unchanged story state.');
