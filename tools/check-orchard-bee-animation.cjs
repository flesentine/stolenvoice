const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),Agi=require('../editor/agi-picture.js');
const base=Array.from(Agi.render(JSON.parse(fs.readFileSync('assets/rooms/orchard-workshop-v1.json')).commands));
let queued=[],paint=[],draws=0;
const ctx={getImageData:()=>({data:new Uint8ClampedArray(160*168*4)}),putImageData:()=>{}};
let seed=731;const randomMath=Object.create(Math);randomMath.random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
const s={Math:randomMath,room:3,playing:true,popupOpen:false,menuOpen:false,document:{hidden:false,createElement:()=>({getContext:()=>ctx})},waterAnimationFocused:true,storyAction:null,draw:()=>draws++,orchardHiveMask:[],pictureCache:{orchard:{getContext:()=>ctx}},drawHiveKickObject:()=>false,pickupStillInScene:()=>false,prop:(d,f)=>queued.push(f),x:{drawImage:()=>{},fillRect:(x,y,w,h)=>paint.push([x,y,w,h,s.x.fillStyle])}};
vm.createContext(s);vm.runInContext(fs.readFileSync('game/room-priority.js','utf8')+';globalThis.bees={tickOrchardBees,orchardHive,orchardScoutPixels,orchardScoutBees,get frame(){return orchardBeeFrame}}',s);
const frames=[],shapes=new Set();for(let n=0;n<240;n++){
 queued=[];paint=[];s.bees.orchardHive();queued.forEach(f=>f());assert.equal(paint.length,40);assert(paint.every(p=>p[0]>=83&&p[0]<=128&&p[1]>=104&&p[1]<=135));shapes.add(JSON.stringify(s.bees.orchardScoutPixels(n,0)));frames.push(paint);queued=[];const previous=paint.slice();paint=[];s.bees.orchardHive();queued.forEach(f=>f());assert.deepEqual(paint,previous,'redraw never advances the bees');s.bees.tickOrchardBees();
}
assert.equal(shapes.size,4);assert.equal(s.bees.frame,240);assert.equal(draws,240);assert.equal(s.bees.orchardScoutBees().length,8);assert(new Set(s.bees.orchardScoutBees().map(b=>b.speed)).size>5);for(let n=0;n<216;n++)assert.notDeepEqual(frames[n],frames[n+24],'no short synchronized orbit repeats');
for(const [obj,key,value] of [[s,'popupOpen',true],[s,'menuOpen',true],[s.document,'hidden',true],[s,'waterAnimationFocused',false],[s,'playing',false],[s,'room',2],[s,'storyAction',{kind:'hiveKick'}]]){const old=obj[key];obj[key]=value;s.bees.tickOrchardBees();assert.equal(s.bees.frame,240);obj[key]=old}
fs.writeFileSync('assets/reviews/orchard-bee-animation.json',JSON.stringify({base,frames}));
assert.match(fs.readFileSync('stolen-voice.html','utf8'),/if\(!orchardBeeTimer&&!reduceMotion\)orchardBeeTimer=setInterval\(tickOrchardBees,90\)/);
console.log('PASS eight independently steering bees, 240 native frames, varied speed/targets, no short repeating orbit, stable redraw, bounds, pause and reduced-motion startup.');
