// Six small integer-pixel cloth cels. The hoist and pole never move.
const pennantWave=[0,0,1,1,0,-1];
function drawCastlePennant(cx,top){
 const left=pictureX(cx),y=pictureY(top),phase=(animationFrame+Math.floor(cx/13))%6;
 x.fillStyle='#000000';x.fillRect(left,y,1,pictureY(top+13)-y+1);
 for(let column=1;column<=8;column++){
  const wave=column<=2?0:pennantWave[(phase+column-3)%6];
  const drop=column<=2?0:column<=5?1:2;
  const row=y+drop+wave,height=column<=3?3:column<=6?2:1;
  x.fillStyle='#ffff55';x.fillRect(left+column,row,1,height);
  if(column===1){x.fillStyle='#ffffff';x.fillRect(left+column,row,1,1)}
 }
}

// Courtyard turret cloth uses native coordinates; its existing pole stays put.
function drawCourtyardPennant(){
 const phase=animationFrame%6;
 for(let column=1;column<=9;column++){
  const wave=column<=2?0:pennantWave[(phase+column-3)%6];
  const drop=column<=3?0:column<=6?1:2;
  const top=Math.max(0,drop+wave),height=column<=3?4:column<=6?3:1;
  x.fillStyle='#ffff55';x.fillRect(72+column,top,1,height);
  if(column===1){x.fillStyle='#ffffff';x.fillRect(73,0,1,1)}
 }
}

// The orchard's distant castle is a baked picture, so replace just its cloth.
// Each clear patch is sky only, above the roof; poles remain in the base PIC.
function drawOrchardPennants(){
 for(const [cx,top,offset]of [[11,4,0]]){
  const phase=(animationFrame+offset)%6;
  x.fillStyle='#5555ff';x.fillRect(cx+1,Math.max(0,top-1),7,6);
  for(let column=1;column<=6;column++){
   const wave=column<3?0:pennantWave[(phase+column-3)%6];
   const y=Math.max(0,top+(column>3?1:0)+wave);
   const height=column<=2?3:column<=4?2:1;
   x.fillStyle='#ffff55';x.fillRect(cx+column,y,1,height);
  }
 }
}
