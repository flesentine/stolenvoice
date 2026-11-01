const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),A=require('../editor/agi-picture.js');
const make=require('./build-workshop-door.cjs'),decode=s=>{const b=Buffer.from(s,'base64'),p=[];for(let i=0;i<b.length;i+=2)for(let n=0;n<b[i];n++)p.push(b[i+1]);return p},frames=Array.from({length:9},(_,i)=>decode(make(i)));
for(const p of frames){assert.equal(p.length,160*168);assert(p.every(v=>v>=0&&v<16))}
for(let f=1;f<9;f++)for(let y=0;y<168;y++)for(let x=0;x<160;x++)if(x<26||x>50||y<58||y>99)assert.equal(frames[f][y*160+x],frames[0][y*160+x],'swing never alters scenery outside door');
assert.equal(new Set(frames.map(p=>Buffer.from(p).toString('base64'))).size,9);
assert.equal(frames[0][80*160+35],6,'closed oak leaf hides the interior');
assert.equal(frames[8][80*160+35],8,'open door reveals a dim back wall');
assert.equal(frames[8][71*160+35],6,'shelf is visible inside');
assert.equal(frames[8][90*160+35],6,'floorboards meet the sill');
const embedded='const workshopDoorPictures='+JSON.stringify(Array.from({length:9},(_,i)=>make(i)))+';';
assert(fs.readFileSync('stolen-voice.html','utf8').includes(embedded),'rebuilt game embeds all updated door frames');

let sounds=[],tick,spoken=[],moving=false,drawn=0,reduced=false;
const s={playGameSound:name=>sounds.push(name),window:{addEventListener(){},matchMedia(){return{matches:reduced}}},document:{hidden:false},flags:{workshopOpen:false},room:8,playing:true,popupOpen:false,menuOpen:false,stopWalking(){moving=false},draw(){drawn++},say(t){spoken.push(t)},setInterval(fn){tick=fn;return 1},clearInterval(){tick=null}};
vm.createContext(s);vm.runInContext(fs.readFileSync('game/workshop-door.js','utf8')+';globalThis.qa={start:animateWorkshopDoor,reset:resetWorkshopDoor,get motion(){return workshopDoorMotion}}',s);
s.qa.start(true,'opened');assert.equal(s.qa.motion.frame,0);assert.equal(spoken.length,0);
s.document.hidden=true;tick();assert.equal(s.qa.motion.frame,0);s.document.hidden=false;
for(let i=0;i<8;i++)tick();assert(!s.qa.motion);assert(s.flags.workshopOpen);assert.deepEqual(spoken,['opened']);
s.qa.start(false,'closed');assert.equal(s.qa.motion.frame,8);for(let i=0;i<7;i++)tick();assert.equal(sounds.filter(n=>n==='workshopDoorClose').length,0,'no thud before the leaf shuts');tick();assert.equal(sounds.filter(n=>n==='workshopDoorClose').length,1);assert(!s.flags.workshopOpen);assert.equal(spoken.at(-1),'closed');
reduced=true;s.qa.start(true,'instant');assert(!s.qa.motion);assert.equal(spoken.at(-1),'instant');assert.deepEqual(sounds,['workshopDoorOpen','workshopDoorClose','workshopDoorOpen'],'one creak per opening, including reduced motion');
s.qa.start(false,'instant close');assert.equal(sounds.at(-1),'workshopDoorClose');assert(!s.qa.motion);
if(process.argv.includes('--preview')){const sharp=require('sharp'),width=75*9,height=58,data=Buffer.alloc(width*height*4);for(let f=0;f<9;f++){const rgba=A.rgba(Uint8Array.from(frames[f]));for(let y=0;y<height;y++)for(let x=0;x<75;x++){const si=((y+49)*160+x+12)*4,di=(y*width+f*75+x)*4;for(let c=0;c<4;c++)data[di+c]=rgba[si+c]}}sharp(data,{raw:{width,height,channels:4}}).resize(width*2,height*3,{kernel:'nearest'}).png().toFile('assets/reviews/workshop-door-swing.png')}
console.log('PASS nine native EGA door cels, fixed scenery, opening/closing, deferred popup, hidden-tab pause and reduced motion.');
