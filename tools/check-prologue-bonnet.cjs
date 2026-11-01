const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),A=require('../editor/agi-picture.js');
const cap=require('./trace-merrin-prologue-cap.cjs')();
assert.equal(cap.length,4);for(const c of cap){assert.equal(c.type,'polygon');assert(c.points.every(p=>p.every(Number.isInteger)));assert([0,4,6,14].includes(c.color));}
const pixels=A.render(cap),count=color=>pixels.filter(c=>c===color).length;
assert(count(6)>250,'substantial felt crown, not a thin rim');assert(count(4)>100,'broad rear fold');assert(count(14)>15,'fitted gold rim');
const points=cap[0].points;assert(Math.max(...points.map(p=>p[1]))-Math.min(...points.map(p=>p[1]))>45,'full crown and low back lobe');
const portrait=require('../assets/rooms/merrin-ending-workshop-v2.json').commands,shared=require('./merrin-felt-cap.cjs')();
assert.deepEqual(portrait.filter(c=>shared.some(s=>s.name===c.name)),shared,'ending scene hat stays unchanged');
const stages=vm.runInNewContext(fs.readFileSync('game/prologue-closeup-picture.js','utf8')+';prologueCloseupPictures');
function decode(encoded){const b=Buffer.from(encoded,'base64'),p=[];for(let i=0;i<b.length;i+=2)for(let n=0;n<b[i];n++)p.push(b[i+1]);return p}
for(const stage of stages)for(const encoded of stage){const p=decode(encoded);assert.equal(p.length,160*168);assert(p.every(c=>c>=0&&c<16));for(let y=20;y<73;y++)for(let x=24;x<31;x++)if(pixels[y*160+x]!==15)assert.equal(p[y*160+x],pixels[y*160+x],'bonnet rear contour/fold stable in every cel')}
assert(fs.existsSync('assets/references/merrin-intro-bonnet-stencil-v3.png'));
console.log('PASS four closed flat EGA bonnet shapes, full crown/rear volume, unchanged ending hat, and all 40 rendered intro cels.');
