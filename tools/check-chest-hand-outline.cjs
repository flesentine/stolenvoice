const fs=require('fs'),assert=require('assert/strict'),vm=require('vm'),A=require('../editor/agi-picture.js'),render=require('./render-merrin-actor.cjs');
const blank={type:'polygon',points:[[0,0],[160,0],[160,168],[0,168]],color:3,outline:null};
for(const reflected of [false,true]){
 let hand=require('./trace-merrin-prologue-body.cjs')(3,3).find(c=>c.name==='Hand resting over chest');
 if(reflected)hand={...hand,points:hand.points.map(([x,y])=>[Math.round(152-x*.78),Math.round(18+y*.78)])};
 const border=A.render([blank,{...hand,color:3,outline:0}]),outside=new Set(),queue=[];
 const add=i=>{if(!outside.has(i)&&border[i]!==0){outside.add(i);queue.push(i)}};
 for(let x=0;x<160;x++){add(x);add(167*160+x)}for(let y=0;y<168;y++){add(y*160);add(y*160+159)}
 for(let n=0;n<queue.length;n++){const i=queue[n],x=i%160,y=Math.floor(i/160);if(x)add(i-1);if(x<159)add(i+1);if(y)add(i-160);if(y<167)add(i+160)}
 const pixels=render([hand]);let skin=0;
 for(let i=0;i<pixels.length;i++){if(pixels[i]===12){skin++;assert(!outside.has(i),'hand fill outside contour '+reflected+' at '+i%160+','+Math.floor(i/160))}if(border[i]===0)assert.equal(pixels[i],0,'black contour preserved')}
 assert(skin>30,'hand interior remains filled');
}
const cels=vm.runInNewContext(fs.readFileSync(require('path').join(__dirname,'../game/prologue-closeup-picture.js'),'utf8')+';prologueCloseupPictures');
for(const stage of cels)for(const encoded of stage){
 const bytes=Buffer.from(encoded,'base64'),pixels=[];
 for(let i=0;i<bytes.length;i+=2)for(let n=0;n<bytes[i];n++)pixels.push(bytes[i+1]);
 assert.equal(pixels.length,160*168);
 assert.notEqual(pixels[96*160+54],3,'contour repairs restore the scene, never cyan transparency');
}
console.log('PASS chest-hand fill stays inside foreground/reflected contours; all 40 built cels restore the background.');
