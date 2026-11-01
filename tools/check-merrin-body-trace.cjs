const assert=require('assert/strict'),fs=require('fs'),vm=require('vm');
const A=require('../editor/agi-picture.js'),body=require('./trace-merrin-prologue-body.cjs'),head=require('./trace-merrin-prologue-head.cjs');
function frames(path){const s={};vm.createContext(s);vm.runInContext(fs.readFileSync(path,'utf8')+';globalThis.frames=prologueCloseupPictures;',s);return s.frames;}
function decode(frame){const b=Buffer.from(frame,'base64'),p=[];for(let i=0;i<b.length;i+=2)for(let n=0;n<b[i];n++)p.push(b[i+1]);return p;}
const actual=frames('game/prologue-closeup-picture.js');
let previous=null;if(fs.existsSync('/tmp/kq1-body-trace-before.js'))previous=frames('/tmp/kq1-body-trace-before.js');
for(let stage=0;stage<5;stage++)for(let cel=0;cel<8;cel++){
 const commands=[...body(stage,cel,'base'),...head(stage,cel).filter(c=>!['Traced left linen collar','Traced right linen collar'].includes(c.name)),...body(stage,cel,'front')];
 A.project({format:'agi-picture-workshop',version:1,width:160,height:168,palette:A.palette,commands});
 const pixels=A.render([{type:'polygon',points:[[0,0],[160,0],[160,168],[0,168]],color:5,outline:null},...commands]);
 const ink=[];for(let i=0;i<pixels.length;i++)if(pixels[i]!==5)ink.push(i);
 const seen=new Set([ink[0]]),queue=[ink[0]];
 for(let n=0;n<queue.length;n++){const i=queue[n],x=i%160,y=Math.floor(i/160);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const xx=x+dx,yy=y+dy,j=yy*160+xx;if(xx>=0&&xx<160&&yy>=0&&yy<168&&pixels[j]!==5&&!seen.has(j)){seen.add(j);queue.push(j);}}}
 assert.equal(seen.size,ink.length,'joined head, sleeve, hand and cloth '+stage+'/'+cel);
 if(stage<3){
  assert(!commands.some(c=>c.name==='Traced plain sleeve edge'),'no duplicate cuff outline');
  for(const c of commands.filter(c=>['Traced polishing hand','Traced polishing cloth'].includes(c.name)))for(const reflected of [false,true]){
   const shape=reflected?{...c,points:c.points.map(([x,y])=>[Math.round(152-x*.78),Math.round(18+y*.78)])}:c;
   const filled=require('./render-merrin-actor.cjs')([shape]);let count=0;
   for(let y=1;y<167;y++)for(let x=1;x<159;x++){
    const i=y*160+x;if(filled[i]!==c.color)continue;count++;
    assert([i-1,i+1,i-160,i+160].every(j=>filled[j]!==3),'closed fill without leaks or interior holes: '+c.name+' '+stage+'/'+cel);
   }
   assert(count>0,'shape retains a filled interior');
  }
 }
 if(stage>=3){
  const hand=commands.find(c=>c.name==='Hand resting over chest');
  assert(hand,'reference-traced chest hand is present');
  assert(hand.points.every(([x,y])=>y>=95&&y<=119),'hand rests below neckline');
  assert(!commands.some(c=>c.name==='Traced polishing cloth'),'chest pose has no cloth');
 }
 const p=decode(actual[stage][cel]);assert.equal(p.length,160*168);assert(p.every(c=>c>=0&&c<16));
 if(previous){const old=decode(previous[stage][cel]);for(let y=0;y<78;y++)for(let x=0;x<60;x++)assert(p[y*160+x]===old[y*160+x]||(p[y*160+x]===0&&[4,12].includes(old[y*160+x])),'accepted head preserved except skin contour repair '+stage+'/'+cel);}
 for(let y=149;y<158;y++)assert.equal(p[y*160+118],6,'reflected apron continues to sill');
}
const hand=cel=>body(0,cel).find(c=>c.name==='Traced polishing hand').points;
assert.notDeepEqual(hand(0),hand(2),'polishing motion remains animated');
assert.deepEqual(body(0,0),body(0,7),'polishing cycle closes without a jump');
assert(fs.readFileSync('stolen-voice.html','utf8').includes(fs.readFileSync('game/prologue-closeup-picture.js','utf8')));
console.log('PASS all 40 native body cels: connected silhouette, preserved accepted head, EGA palette, looping wipe, reflected apron continuity and game embedding.');
