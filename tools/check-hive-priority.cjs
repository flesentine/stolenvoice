const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const html=read('stolen-voice.html');new vm.Script(html.match(/<script>([\s\S]*?)<\/script>/)[1]);
const mask=JSON.parse(html.match(/const orchardHiveMask=(\[[^;]+);/)[1]);
const Agi=require('../editor/agi-picture.js'),project=JSON.parse(read('assets/rooms/orchard-workshop-v1.json'));
const native=Agi.render(project.commands),rgba=Agi.rgba(native);let savedImage,queue=[],order=[],wax=0;
const context={getImageData(){return{data:rgba.slice()}},putImageData(image){savedImage=image}};
const sandbox={animationFrame:0,drawHiveKickObject:()=>false,pickupStillInScene:()=>!sandbox.flags.waxTaken,orchardHiveMask:mask,pictureCache:{orchard:{getContext:()=>context}},document:{createElement:()=>({getContext:()=>context})},flags:{waxTaken:false},prop:(depth,paint)=>queue.push({depth,paint}),x:{drawImage:()=>order.push('hive'),fillRect:(x,y,w,h)=>{if(y<138)return;assert(y+h<=143,'wax sits beneath stump');if(wax===0)order.push('wax');wax++}}};
vm.createContext(sandbox);vm.runInContext(read('game/room-priority.js')+'\nglobalThis.paintHive=orchardHive;',sandbox);
sandbox.paintHive();
const covered=new Set();for(const [x,y,len]of mask)for(let n=0;n<len;n++)covered.add(y*160+x+n);
assert(covered.size>200);
for(let n=0;n<native.length;n++){assert.equal(savedImage.data[n*4+3],covered.has(n)?255:0);if(covered.has(n))assert.deepEqual([...savedImage.data.slice(n*4,n*4+3)],[...rgba.slice(n*4,n*4+3)])}
function layers(feet,taken){queue=[];order=[];wax=0;sandbox.flags.waxTaken=taken;sandbox.paintHive();queue.push({depth:feet,paint:()=>order.push('actor')});queue.sort((a,b)=>a.depth-b.depth).forEach(p=>p.paint());return order.join(',')}
assert.equal(layers(178,false),'actor,hive,wax');assert.equal(wax,8);
assert.equal(layers(194,false),'hive,actor,wax');assert.equal(layers(210,false),'hive,wax,actor');assert.equal(layers(210,true),'hive,actor');assert.equal(wax,0);
const world={flags:{thornsCut:false},room:3,objectPriorityData:require('./build-object-priorities.cjs')(),pictureX:x=>Math.round(x/2),pictureY:y=>Math.round(y*.7)};vm.createContext(world);vm.runInContext(read('game/room-priority.js')+'\n'+read('game/expanded-world.js')+'\nglobalThis.stand=canStand;',world);
assert.equal(world.stand(206,178),true,'walk behind hive');assert.equal(world.stand(206,190),false,'stump footprint blocked');assert.equal(world.stand(206,200),true,'walk in front');assert.equal(world.stand(185,190),true,'walk beside');
console.log('PASS exact native hive coverage, behind/front layering, wax removal, stump collision and built-script syntax.');
