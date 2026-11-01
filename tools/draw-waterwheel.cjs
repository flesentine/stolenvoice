// Shared static and animated wheel drawing, in native AGI coordinates.
module.exports=function wheel({fill,stroke},phase=0){
 const cx=19,cy=78;
 const ellipse=(rx,ry)=>Array.from({length:24},(_,i)=>{const a=i*Math.PI/12;return[Math.round(cx+Math.cos(a)*rx),Math.round(cy+Math.sin(a)*ry)]});
 fill(ellipse(8,16),6,6);fill(ellipse(6,13),0,0);
 for(let i=0;i<6;i++){
  const a=phase+i*Math.PI/3;
  stroke([[cx,cy],[Math.round(cx+Math.cos(a)*7),Math.round(cy+Math.sin(a)*14)]],6);
  const x=Math.round(cx+Math.cos(a)*8),y=Math.round(cy+Math.sin(a)*16);
  stroke([[x-Math.round(Math.sin(a)),y+Math.round(Math.cos(a)*2)],[x+Math.round(Math.sin(a)),y-Math.round(Math.cos(a)*2)]],6);
 }
 stroke([[14,66],[16,63],[20,62]],14);stroke([[24,88],[22,92],[19,94]],8);
 fill([[18,76],[20,76],[21,78],[20,80],[18,80],[17,78]],6,6);
 stroke([[19,77],[19,79]],7);
};
