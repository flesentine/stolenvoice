// Fill both hand poses and the rag inside their actual pixel contours. A diagonal
// scanline can otherwise leave a gap inside, or a fill pixel outside, a line.
const A=require('../editor/agi-picture.js');
module.exports=function renderActor(commands){
 const blank={type:'polygon',points:[[0,0],[160,0],[160,168],[0,168]],color:3,outline:null};
 const out=new Uint8Array(160*168).fill(3);
 for(const command of commands){
  let layer;
  if(command.type==='polygon'&&['Traced polishing hand','Traced polishing cloth','Hand resting over chest'].includes(command.name)){
   const border=A.render([blank,{...command,color:3,outline:0}]);
   const outside=new Uint8Array(border.length),queue=[];
   const add=i=>{if(!outside[i]&&border[i]!==0){outside[i]=1;queue.push(i)}};
   for(let x=0;x<160;x++){add(x);add(167*160+x)}
   for(let y=0;y<168;y++){add(y*160);add(y*160+159)}
   for(let n=0;n<queue.length;n++){
    const i=queue[n],x=i%160,y=Math.floor(i/160);
    if(x)add(i-1);if(x<159)add(i+1);if(y)add(i-160);if(y<167)add(i+160);
   }
   layer=border.map((c,i)=>c===0?0:outside[i]?3:command.color);
  }else layer=A.render([blank,command]);
  for(let i=0;i<out.length;i++)if(layer[i]!==3)out[i]=layer[i];
 }
 return out;
};
