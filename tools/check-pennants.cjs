const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path'),root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
let pixels=new Map();const x={fillStyle:'',fillRect(left,top,w,h){assert([left,top,w,h].every(Number.isInteger));for(let y=top;y<top+h;y++)for(let a=left;a<left+w;a++)pixels.set(a+','+y,this.fillStyle)}};
const s={x,pictureX:x=>Math.round(x/2),pictureY:y=>Math.round(y*.7),animationFrame:0};vm.createContext(s);vm.runInContext(read('game/castle-pennants.js')+';globalThis.paint=drawCastlePennant;',s);
const frames=[];for(let frame=0;frame<6;frame++){s.animationFrame=frame;pixels=new Map();s.paint(119,29);assert.equal(pixels.get('60,20'),'#000000');assert.equal(pixels.get('61,20'),'#ffffff');assert.equal(pixels.get('61,22'),'#ffff55');assert([...pixels.values()].every(c=>['#000000','#ffff55','#ffffff'].includes(c)));frames.push(JSON.stringify([...pixels]));}assert.equal(new Set(frames).size,6,'six distinct native cloth cels');
vm.runInContext('globalThis.courtyardPaint=drawCourtyardPennant;',s);
const courtyardFrames=[];
for(let frame=0;frame<6;frame++){s.animationFrame=frame;pixels=new Map();s.courtyardPaint();assert.equal(pixels.get('73,0'),'#ffffff');for(const [key,color]of pixels){const [px,py]=key.split(',').map(Number);assert(px>=73&&px<=81&&py>=0&&py<=5);assert(['#ffffff','#ffff55'].includes(color))}courtyardFrames.push(JSON.stringify([...pixels]))}
assert.equal(new Set(courtyardFrames).size,6,'six distinct courtyard flutter frames');
assert(read('game/expanded-world.js').includes('if(room===8)drawCourtyardPennant()'));
assert(!JSON.parse(read('assets/rooms/courtyard-workshop-v1.json')).commands.some(c=>c.name==='Gold pennant'),'static cloth removed so frames leave no trails');
// Exercise the actual embedded scene and its background timer.
let h=read('tools/check-expanded-adventure.cjs');h=h.slice(0,h.indexOf("check('Eight rooms"));h=h.replace('globalThis.game={command,','globalThis.game={get frame(){return animationFrame},command,');const test={require,console,Buffer,__dirname};vm.createContext(test);vm.runInContext(h+';globalThis.qa={boot};',test);const a=test.qa.boot();a.start();const first=a.game.frame;for(const fn of [...a.intervals.values()])fn();assert.notEqual(a.game.frame,first);a.game.command('look');const frozen=a.game.frame;for(const fn of [...a.intervals.values()])fn();assert.equal(a.game.frame,frozen,'message pauses waving');assert(read('stolen-voice.html').includes('const flag=drawCastlePennant;'));
console.log('PASS six distinct EGA cels each for garden and courtyard pennants, fixed hoists/poles, integer pixels, shared scene timer and popup pause.');
vm.runInContext('globalThis.orchardPaint=drawOrchardPennants;',s);
const orchardFrames=[];
for(let f=0;f<6;f++){
 s.animationFrame=f;pixels=new Map();s.orchardPaint();
 for(const [key,color]of pixels){
  const [px,py]=key.split(',').map(Number);
  assert([[11,4]].some(([cx,top])=>px>cx&&px<=cx+7&&py>=Math.max(0,top-1)&&py<Math.max(0,top-1)+6),'cloth stays above roofs and off poles');
  assert(['#5555ff','#ffff55'].includes(color));
 }
 orchardFrames.push(JSON.stringify([...pixels]));
}
assert.equal(new Set(orchardFrames).size,6);
assert(read('game/expanded-world.js').includes('if(room===3)drawOrchardPennants()'));
assert(read('stolen-voice.html').includes('function drawOrchardPennants()'));
console.log('PASS left-edge orchard tower pennant: six distinct cels, cleared prior cloth and fixed scenery.');
