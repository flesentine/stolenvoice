// A brief, optional scramble on the clear ground she recoiled onto.
function startBeeStingReaction(message='Ouch! A bee stings your finger. You perform a short, entirely undignified dance. The bees guard their doorway fiercely; the loose wax lies below their flight.'){
 stopWalking();
 const escapes=[[player.x,Math.max(player.y,212)],[181,player.y],[232,player.y]];
 for(const [a,b]of escapes)if(canStand(a,b,3)&&clearGroundStep(player.x,player.y,a,b)){player.x=a;player.y=b;break}
 player.facing='front';player.step=1;playGameSound('beeSting');startStoryEffect('beeSting',message);
}
function beeStingOffset(frame){
 const wanted=Math.round(Math.sin(frame*Math.PI/4)*12*Math.sin(Math.PI*frame/17)),direction=Math.sign(wanted);let offset=0;
 for(let n=1;n<=Math.abs(wanted);n++){if(!clearGroundStep(player.x,player.y,player.x+direction*n,player.y))break;offset=direction*n}
 return offset;
}
function drawBeeStingHero(px,py){
 if(storyAction?.kind!=='beeSting')return false;
 const frame=storyAction.frame,offset=beeStingOffset(frame),previous=beeStingOffset(Math.max(0,frame-1)),direction=offset>=previous?1:-1;
 const facing=direction>0?'right':'left',rows=rosellaWalkSprites[facing][frame%4],left=pictureX(px+offset)-4,top=pictureY(py)-39;
 ellipse(px+offset,py+1,7,1,'#000000');
 // Moving the old arm must reveal her clothes, never a hole in her side.
 const torso=direction>0?2:3;
 for(let row=14;row<=24;row++)for(let col=torso;col<torso+3;col++){x.fillStyle=rosellaColors[row<16?15:row<20?1:9];x.fillRect(left+col,top+row,1,1)}
 for(let row=0;row<40;row++)for(let col=0;col<8;col++){
  const ink=rows[row][col];if(ink==='.'||(row>=14&&row<=24&&ink==='c'))continue;
  x.fillStyle=rosellaColors[parseInt(ink,16)];x.fillRect(left+col,top+row,1,1);
 }
 // One hand supports the other wrist; the unfortunate finger stays upright.
 const shoulder=[left+(direction>0?4:3),top+14],elbow=[shoulder[0]+direction*2,top+20],wrist=[shoulder[0]+direction*4,top+16];
 galleryInk([shoulder,elbow],'#ffffff');galleryInk([elbow,wrist],'#ff5555');
 galleryInk([[shoulder[0],top+16],[wrist[0]-direction,top+17],wrist],'#ff5555');
 x.fillStyle='#ff5555';x.fillRect(wrist[0],top+13,1,4);x.fillRect(wrist[0]-1,top+16,3,2);
 if(frame%6<2){x.fillStyle='#ffffff';x.fillRect(wrist[0]+direction*2,top+11,1,1);x.fillRect(wrist[0]+direction*3,top+13,1,1)}
 return true;
}
