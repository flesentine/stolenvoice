// Reference-derived native geometry and the actual embedded cels.
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),A=require('../editor/agi-picture.js'),trace=require('./trace-merrin-prologue-head.cjs');
const s={};vm.createContext(s);vm.runInContext(fs.readFileSync('game/prologue-closeup-picture.js','utf8')+';globalThis.frames=prologueCloseupPictures;',s);
for(let stage=0;stage<5;stage++)for(let cel=0;cel<8;cel++){
 const commands=trace(stage,cel);A.project({format:'agi-picture-workshop',version:1,width:160,height:168,palette:A.palette,commands});
 const head=A.render([{type:'polygon',points:[[0,0],[160,0],[160,168],[0,168]],color:5,outline:null},...commands]);
 // A single connected head/collar silhouette, including its black contours.
 const seen=new Set(),ink=[];for(let i=0;i<head.length;i++)if(head[i]!==5)ink.push(i);
 const queue=[ink[0]];seen.add(ink[0]);for(let n=0;n<queue.length;n++){const i=queue[n],x=i%160,y=Math.floor(i/160);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const xx=x+dx,yy=y+dy,j=yy*160+xx;if(xx>=0&&xx<160&&yy>=0&&yy<168&&head[j]!==5&&!seen.has(j)){seen.add(j);queue.push(j)}}}
 assert.equal(seen.size,ink.length,'head and collar connect at '+stage+'/'+cel);
 const bytes=Buffer.from(s.frames[stage][cel],'base64'),pixels=[];for(let i=0;i<bytes.length;i+=2)for(let n=0;n<bytes[i];n++)pixels.push(bytes[i+1]);
 assert.equal(pixels.length,160*168);assert(pixels.every(c=>c>=0&&c<16));
 const blink=(stage<2&&cel===5)||(stage===4&&cel===1),singing=(stage<2||(stage===3&&cel<3)||(stage===4&&cel<3))&&cel%4!==3;
 let white=0,mouth=0;for(let y=48;y<=54;y++)for(let x=48;x<=52;x++)if(pixels[y*160+x]===15)white++;
 for(let y=69;y<=73;y++)for(let x=50;x<=52;x++)if(pixels[y*160+x]===0)mouth++;
 assert.equal(white>0,!blink,'eye state '+stage+'/'+cel);assert.equal(mouth>0,singing,'mouth state '+stage+'/'+cel);
 for(let y=149;y<=157;y++)assert.equal(pixels[y*160+118],6,'reflected torso reaches the sill');
}
const built=fs.readFileSync('stolen-voice.html','utf8');assert(built.includes(fs.readFileSync('game/prologue-closeup-picture.js','utf8')),'actual game embeds traced cels');
console.log('PASS all 40 reference-traced native heads: closed valid geometry, connected head/collar, exact EGA, correct blink/mouth states, full reflected torso and built-game embedding.');
