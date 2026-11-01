const fs=require('fs'),vm=require('vm'),A=require('../editor/agi-picture.js'),assert=require('assert/strict');
const decode=encoded=>{const bytes=Buffer.from(encoded,'base64'),out=[];for(let i=0;i<bytes.length;i+=2)for(let n=0;n<bytes[i];n++)out.push(bytes[i+1]);return out};
const frames=vm.runInNewContext(fs.readFileSync('game/bell-pictures.js','utf8')+';bellSwingPictures').map(decode),base=Array.from(A.render(JSON.parse(fs.readFileSync('assets/rooms/belfry-workshop-v1.json')).commands));
assert.equal(base[95*160+91],6,'clapper notch contains bronze, not wall');
assert.equal(frames.length,7);assert.equal(new Set(frames.map(f=>JSON.stringify(f))).size,7);assert.deepEqual(frames[3],base,'neutral cel matches idle drawing exactly');
for(const frame of frames){assert.equal(frame.length,160*168);assert(frame.every(c=>c>=0&&c<16));for(let y=0;y<168;y++)for(let x=0;x<160;x++)if(x<61||x>117||y<34||y>121)assert.equal(frame[y*160+x],base[y*160+x],`fixed background ${x},${y}`)}
const s={window:{matchMedia:()=>({matches:false}),addEventListener(){}},document:{addEventListener(){}}};vm.createContext(s);vm.runInContext(fs.readFileSync('game/bell-pull.js','utf8')+';globalThis.test={set(frame,outcome="voice"){bellAction={stage:"jump",frame,outcome}},frame:bellSwingFrame,resetBellPull,sequence:bellSwingSequence};',s);
s.test.set(5);assert.equal(s.test.frame(),0);s.test.set(8);assert.equal(s.test.frame(),6);s.test.set(17);assert.equal(s.test.frame(),3);s.test.set(5,'dull');assert.equal(s.test.frame(),null);s.test.set(5);s.window.matchMedia=()=>({matches:true});assert.equal(s.test.frame(),null);
console.log('PASS seven native EGA swing cels, exact idle restoration, protected axle/background, pull/return timing and reduced motion.');
