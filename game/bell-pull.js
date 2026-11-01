// Rosella's original cel, with raised arms and discrete jump offsets.
let bellAction=null,bellActionTimer=0,bellActionFocused=true;
const bellSwingSequence=[3,3,3,2,1,0,1,3,6,5,3,1,2,3,5,4,3,3];
function bellSwingFrame(){if(!bellAction||bellAction.stage!=='jump'||bellAction.outcome==='dull'||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return null;return bellSwingSequence[Math.min(bellAction.frame,bellSwingSequence.length-1)]}
function queueBelfryBell(){
 const frame=bellSwingFrame()??3,key='bell-foreground-'+frame;
 if(!roomPropCache[key]){
  const sprite=decodePicture(bellSwingPictures[frame]),context=sprite.getContext('2d'),image=context.getImageData(0,0,160,168),coverage=new Uint8Array(160*168);
  for(const [left,top,length]of bellForegroundMasks[frame])coverage.fill(1,top*160+left,top*160+left+length);
  for(let n=0;n<coverage.length;n++)if(!coverage[n])image.data[n*4+3]=0;
  context.putImageData(image,0,0);roomPropCache[key]=sprite;
 }
 // Suspended above the rear floor: an approaching head passes behind the
 // mouth and clapper; actors on the foreground floor remain in front.
 prop(220,()=>x.drawImage(roomPropCache[key],0,0));
}
// Let the bell melody decay in the belfry before opening the tuning puzzle.
const bellHarmonyListenFrames=36; // 3.24 extra seconds at the 90 ms animation tick.
const bellJump=[0,2,5,8,8,6,3,0,0];
function resetBellPull(){if(bellActionTimer)clearInterval(bellActionTimer);bellActionTimer=0;bellAction=null}
function startBellPull(outcome,message){
 if(bellAction)return;
 stopWalking();bellAction={stage:'approach',frame:0,outcome,message};
 bellActionTimer=setInterval(tickBellPull,90);draw();
}
function tickBellPull(){
 if(!bellAction||popupOpen||menuOpen||document.hidden||!bellActionFocused)return;
 if(room!==7||!playing){resetBellPull();return}
 const action=bellAction;
 if(action.stage==='approach'){
  const dx=Math.sign(177-player.x)*Math.min(3,Math.abs(177-player.x)),dy=Math.sign(221-player.y)*Math.min(3,Math.abs(221-player.y));
  if(dx||dy){
   if(clearGroundStep(player.x,player.y,player.x+dx,player.y+dy)){player.x+=dx;player.y+=dy;player.step++;player.facing=dx<0?'left':dx>0?'right':dy<0?'back':'front';draw();return}
   resetBellPull();say('Rosella needs a clear place to stand beneath the rope.');return;
  }
  action.stage='jump';player.facing='front';player.step=0;
 }
 else action.frame++;
 if(action.stage==='jar'){if(action.frame===16)playGameSound('jarIllumination');if(action.frame>=jarTransformationFrameCount){const message=action.message;resetBellPull();stopWalking();draw();say(message);return}draw();return}
 if(action.frame===5){
  if(action.outcome==='voice')progress('bellRung');
  else if(action.outcome!=='dull')playGameSound('bellRung');
 }
 if(action.frame>=(action.outcome==='dull'?bellJump.length:bellSwingSequence.length)){if(action.outcome==='harmony'){if(action.frame<bellSwingSequence.length+bellHarmonyListenFrames){draw();return}resetBellPull();draw();showHarmony();return}if(['voice','repeat'].includes(action.outcome)&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){action.stage='jar';action.frame=0;draw();return}const message=action.message;resetBellPull();stopWalking();draw();say(message);return}
 draw();
}
function drawBellPullHero(px,py){
 if(!bellAction||bellAction.stage==='approach')return false;
 const frame=bellAction.frame,jump=bellJump[frame]||0,rows=rosellaWalkSprites.front[0],left=pictureX(px)-4,top=pictureY(py)-39-jump;
 // The shadow stays on the floor while the body rises.
 ellipse(px,py+1,frame>1&&frame<7?4:7,1,'#000000');
 for(let row=0;row<40;row++)for(let col=0;col<8;col++){
  const ink=rows[row][col];if(ink==='.')continue;
  if(frame>0&&frame<7&&row>=14&&row<=23&&[0,1,6,7].includes(col)&&['c','f'].includes(ink))continue;
  x.fillStyle=rosellaColors[parseInt(ink,16)];x.fillRect(left+col,top+row,1,1);
 }
 if(frame>0&&frame<7){
  galleryInk([[left+1,top+14],[left-1,top+10],[left-1,top+2],[left+1,top-3],[left+3,top-3]],'#ff5555');
  galleryInk([[left+6,top+14],[left+8,top+10],[left+8,top+2],[left+5,top-3],[left+3,top-3]],'#ff5555');
  x.fillStyle='#ffffff';x.fillRect(left,top+13,2,2);x.fillRect(left+6,top+13,2,2);
  // Hands remain attached to the fixed vertical rope as she takes its weight.
  x.fillStyle='#ffff55';x.fillRect(pictureX(176),top-3,1,2);
 }
 return true;
}
window.addEventListener('blur',()=>{bellActionFocused=false});window.addEventListener('focus',()=>{bellActionFocused=true});
