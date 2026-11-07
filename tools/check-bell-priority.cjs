const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),A=require('../editor/agi-picture.js');
const art=vm.runInNewContext(fs.readFileSync('game/bell-pictures.js','utf8')+';({pictures:bellSwingPictures,masks:bellForegroundMasks})'),views=require('../assets/elara-walk-stable-face-v2.json').views;
function decode(encoded){const bytes=Buffer.from(encoded,'base64'),out=[];for(let i=0;i<bytes.length;i+=2)for(let n=0;n<bytes[i];n++)out.push(bytes[i+1]);return out}
const palette=new Map(A.palette.map((c,i)=>[c.toLowerCase(),i]));
function scene(frame,y=182,jump=0,overlay=true){
 const base=decode(art.pictures[frame]),pixels=base.slice(),props=[],actor=new Map(),rows=views.back[1],top=Math.round(y*.7)-39-jump;
 const canvas=encoded=>{const colors=decode(encoded),image={data:new Uint8ClampedArray(A.rgba(colors))};return{image,getContext(){return{getImageData:()=>image,putImageData(value){this.image=value}}}}};
 const s={roomPropCache:{},bellSwingPictures:art.pictures,bellForegroundMasks:art.masks,decodePicture:canvas,window:{addEventListener(){},matchMedia:()=>({matches:false})},prop:(depth,paint)=>props.push({depth,paint}),x:{drawImage(sprite){const p=sprite.image.data;for(let i=0;i<base.length;i++)if(p[i*4+3])pixels[i]=palette.get('#'+Array.from(p.slice(i*4,i*4+3),n=>n.toString(16).padStart(2,'0')).join(''))}}};
 vm.createContext(s);vm.runInContext(fs.readFileSync('game/bell-pull.js','utf8')+`;bellSwingFrame=()=>${frame};queueBelfryBell()`,s);
 if(!overlay)props.length=0;
 props.push({depth:y,paint(){for(let row=0;row<40;row++)for(let col=0;col<8;col++)if(rows[row][col]!=='.'){const i=(top+row)*160+84+col;pixels[i]=parseInt(rows[row][col],16);actor.set(i,pixels[i])}}});
 props.sort((a,b)=>a.depth-b.depth).forEach(p=>p.paint());return{base,pixels,actor};
}
let overlaps=0;
for(let frame=0;frame<7;frame++)for(const jump of [0,8]){
 const {base,pixels,actor}=scene(frame,182,jump),mask=new Set();for(const [x,y,n]of art.masks[frame])for(let dx=0;dx<n;dx++)mask.add(y*160+x+dx);
 for(const [i,c]of actor){if(mask.has(i)){assert.equal(pixels[i],base[i],'head is behind current bell/clapper cel');overlaps++}else assert.equal(pixels[i],c,'outside silhouette remains visible')}
 const front=scene(frame,230,40);for(const [i,c]of front.actor)assert.equal(front.pixels[i],c,'front-floor actor is in front of bell plane');
}
assert(overlaps>0);assert.notEqual(JSON.stringify(art.masks[0]),JSON.stringify(art.masks[6]),'mask follows swing');
fs.writeFileSync('assets/reviews/bell-priority.json',JSON.stringify({before:scene(3,182,0,false).pixels,after:scene(3).pixels}));
console.log('PASS native bell compositing: rear head/jump behind all seven swinging bell/clapper masks, foreground depth and no rectangular clipping.');
