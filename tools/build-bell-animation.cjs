// Seven native EGA cels, redrawing authored bell polygons over real underpainting.
const fs=require('fs'),path=require('path'),A=require('../editor/agi-picture.js'),root=path.resolve(__dirname,'..');
const project=JSON.parse(fs.readFileSync(path.join(root,'assets/rooms/belfry-workshop-v1.json')));
const names=new Set(['Great bell silhouette','Bell lit bronze plane','Bell shadow return','Bell restrained highlight','Bell moulding','Bell cast inscription','Bell dark mouth','Bell mouth lip','Bell lower return','Bell clapper','Short frayed bell rope','Rope light']);
const fixed=project.commands.filter(c=>!names.has(c.name)),bell=project.commands.filter(c=>names.has(c.name));
function rotate([x,y],angle,cx=88,cy=36){return[Math.round(cx+(x-cx)*Math.cos(angle)-(y-cy)*Math.sin(angle)),Math.round(cy+(x-cx)*Math.sin(angle)+(y-cy)*Math.cos(angle))]}
function encode(pixels){const runs=[];for(let i=0;i<pixels.length;){let e=i+1;while(e<pixels.length&&pixels[e]===pixels[i]&&e-i<255)e++;runs.push(e-i,pixels[i]);i=e}return Buffer.from(runs).toString('base64')}
const foregroundMasks=[];
const frames=[-.055,-.035,-.018,0,.018,.035,.055].map(angle=>{
 const moving=bell.map(c=>({...c,points:c.points.map((point,i)=>{
  if(['Short frayed bell rope','Rope light'].includes(c.name)&&i>0)return point;
  return rotate(c.name==='Bell clapper'?rotate(point,-angle*1.5,88,89):point,angle);
 })}));
 // Only solid bronze/clapper pixels occlude an actor; the thin hanging rope
 // remains available for her hands. Follow each swing instead of ghosting
 // the stationary silhouette over the animated bell.
 const coverage=A.render(moving.filter(c=>!['Short frayed bell rope','Rope light'].includes(c.name)).map(c=>({...c,color:0,outline:c.outline==null?null:0}))),mask=[];
 for(let y=0;y<168;y++)for(let x=0;x<160;){if(coverage[y*160+x]!==0){x++;continue}const start=x;while(x<160&&coverage[y*160+x]===0)x++;mask.push([start,y,x-start])}
 foregroundMasks.push(mask);return encode(A.render([...fixed,...moving]));
});
fs.writeFileSync(path.join(root,'game/bell-pictures.js'),'const bellSwingPictures='+JSON.stringify(frames)+';\nconst bellForegroundMasks='+JSON.stringify(foregroundMasks)+';\n');
console.log('Built seven native bell swing cels with fixed axle and restored window/wall underpainting.');
