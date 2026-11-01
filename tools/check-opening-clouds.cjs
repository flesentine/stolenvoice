// Exercise the real title cloud painter against the authored sky mask.
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const A=require('../editor/agi-picture.js');
const source=fs.readFileSync('game/opening-picture.js','utf8')+fs.readFileSync('game/opening-screen.js','utf8');
const s={Set};vm.createContext(s);vm.runInContext(source+';globalThis.qa={mask:openingCloudSky,paint:(f,c)=>{titleFrame=f;paintOpeningClouds(c)}};',s);
const picture=A.render(JSON.parse(fs.readFileSync('assets/opening/opening-workshop-v2.json')).commands),frames=[];let moonCovered=0;
for(const frame of [0,70,140,210]){
 const pixels=[];const ctx={fillStyle:'',fillRect(x,y,w,h){assert.equal(w,2);assert.equal(h,1);assert.equal(x%2,0);const i=(y-20)*160+x/2;assert(s.qa.mask.includes(i));assert([1,14].includes(picture[i]),'clouds stay in window sky or cover the moon');if(picture[i]===14)moonCovered++;assert(A.palette.includes(this.fillStyle));pixels.push([i,this.fillStyle])}};
 s.qa.paint(frame,ctx);assert(pixels.length>0);frames.push(JSON.stringify(pixels));
}
assert.equal(new Set(frames).size,4);assert(moonCovered>0,'clouds visibly occlude the moon');
console.log('PASS drifting native EGA clouds; every painted pixel is window sky, covering the moon while architecture and figures stay protected.');
