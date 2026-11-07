// Isolated original-sprite pose proof; not a browser/game screenshot.
const fs=require('fs'),vm=require('vm'),sharp=require('sharp'),A=require('../editor/agi-picture.js');
const html=fs.readFileSync('stolen-voice-short.html','utf8'),walk=JSON.parse(fs.readFileSync('assets/elara-walk-stable-face-v2.json','utf8')).views;let canvas;
const width=150,height=96,raw=Buffer.alloc(width*height*3,85);
const s={player:{facing:'right',step:0},elaraWalkSprites:walk,elaraColors:A.palette,pictureX:x=>x,pictureY:y=>y,window:{addEventListener(){}},document:{addEventListener(){}},inventoryPictures:vm.runInNewContext(fs.readFileSync('game/inventory-pictures.js','utf8')+';inventoryPictures'),atob:v=>Buffer.from(v,'base64').toString('binary'),x:{fillStyle:'',fillRect(x,y,w,h){for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)if(xx>=0&&xx<30&&yy>=0&&yy<48)canvas[yy*30+xx]=A.palette.indexOf(this.fillStyle)}},ellipse(){},insidePolygon(){return true},galleryInk(points,color){this;for(let i=1;i<points.length;i++){let[a,b]=points[i-1];const[c,d]=points[i],dx=Math.abs(c-a),dy=-Math.abs(d-b),sx=a<c?1:-1,sy=b<d?1:-1;let err=dx+dy;for(;;){s.x.fillStyle=color;s.x.fillRect(a,b,1,1);if(a===c&&b===d)break;const e=err*2;if(e>=dy){err+=dy;a+=sx}if(e<=dx){err+=dx;b+=sy}}}}};
vm.createContext(s);vm.runInContext(fs.readFileSync('game/pickup-animation.js','utf8')+fs.readFileSync('game/story-effects.js','utf8')+';globalThis.poseProof={set(frame,level){storyAction={kind:"pickup",frame,total:10,pickupLevel:level,pickup:level==="ground"?"rose":"oil flask"}},paint:drawPickupHero};',s);
for(let row=0;row<2;row++)for(const [col,frame]of [0,2,4,6,9].entries()){
 canvas=new Array(30*48).fill(8);s.poseProof.set(frame,row===0?'ground':'bench');s.poseProof.paint(12,44);
 for(let y=0;y<48;y++)for(let x=0;x<30;x++){const hex=A.palette[canvas[y*30+x]];for(let k=0;k<3;k++)raw[((row*48+y)*width+col*30+x)*3+k]=parseInt(hex.slice(1+k*2,3+k*2),16)}
}
sharp(raw,{raw:{width,height,channels:3}}).resize(width*5,height*4,{fit:'fill',kernel:'nearest'}).png().toFile('assets/reviews/pickup-pose-proof.png');
