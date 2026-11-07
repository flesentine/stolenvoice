const fs=require('fs'),assert=require('assert/strict'),make=require('./trace-barrel-prank.cjs');
const cels=make(),bodyColors=new Set([0,1,6,7,9,12,15]);assert.equal(cels.length,28);
for(const [index,cel]of cels.entries()){
 assert.equal(cel.frame,index*5);const pixels=new Map();
 for(const [x,y,w,c]of cel.runs){assert([x,y,w,c].every(Number.isInteger));assert(x>=0&&x+w<=160&&y>=0&&y<168&&w>0);assert(bodyColors.has(c));for(let n=0;n<w;n++)pixels.set((x+n)+160*y,c)}
 assert.equal(pixels.size===0,cel.frame===55,'only submerged key is empty');
 assert.equal(cel.sourceRegistration.length,3,'reference anchor and uniform scale recorded');
 if([0,100,105,110,115,120,125,130,135].includes(cel.frame)){const ys=[...pixels.keys()].map(n=>Math.floor(n/160));assert(Math.max(...ys)-Math.min(...ys)>=32&&Math.max(...ys)-Math.min(...ys)<=43,'standing body scale stays close to the normal sprite');}
 if(cel.frame>=100)assert.equal(cel.floor,134,'landed shoes share the floor baseline');
 if(cel.inside)assert([...pixels.entries()].every(([n,c])=>n%160<132||n%160>145||Math.floor(n/160)<=102||[1,9].includes(c)),'only exterior blue cloth may cover barrel front');
 if(cel.frame>=30&&cel.frame<=40)assert([...pixels.entries()].some(([n,c])=>Math.floor(n/160)>=110&&[1,9].includes(c)),'loose skirt drapes visibly over the rim');
 if(cel.frame>=25&&cel.frame<=50)assert([...pixels.values()].includes(12),'visible connected legs during inversion/sink');
 if([25,30,35,40,90,95,100,105].includes(cel.frame))assert([...pixels.values()].includes(15),'opaque linen coverage');
 if(!cel.head)continue;
 assert(cel.head[0]>=124&&cel.head[0]<=137&&cel.head[1]>=82&&cel.head[1]<=98,'normalized head anchor');
}
assert.deepEqual(cels.map(c=>c.stage).slice(17,23),['push','straddle','lower','land','tug','release']);
const html=fs.readFileSync('stolen-voice.html','utf8');assert(html.includes('const barrelPrankCels='+JSON.stringify(cels)+';'),'standalone embeds current trace');
fs.writeFileSync('assets/reviews/barrel-trace-cels.json',JSON.stringify(cels));
console.log('PASS 28 reference-contour EGA keys, five-frame mapping, registered body scale/floor, opaque linen, staged climb and built-game embedding.');
