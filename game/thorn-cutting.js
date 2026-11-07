// Existing Elara cel, working hands, opening/closing steel shears and falling twigs.
const thornSnipFrames=[4,10,16];
function thornCutStage(){
 if(!storyAction||storyAction.kind!=='thornsCut')return null;
 if(storyAction.stage==='approach')return 0;
 return storyAction.frame<4?0:storyAction.frame<10?1:storyAction.frame<16?2:3;
}
function approachBlackthorn(){
 const a=storyAction;if(a?.kind!=='thornsCut'||a.stage!=='approach')return false;
 const dx=Math.sign(283-player.x)*Math.min(3,Math.abs(283-player.x)),dy=Math.sign(207-player.y)*Math.min(3,Math.abs(207-player.y));
 if(!dx&&!dy){a.stage='cut';player.facing='right';player.step=0;draw();return true}
 // Keep the original thicket boundary solid while she finds her footing.
 const cut=flags.thornsCut;flags.thornsCut=false;
 let moved=false;
 for(const [sx,sy]of [[dx,dy],[dx,0],[0,dy]])if((sx||sy)&&clearGroundStep(player.x,player.y,player.x+sx,player.y+sy)){player.x+=sx;player.y+=sy;player.facing=sx<0?'left':sx>0?'right':sy<0?'back':'front';player.step++;moved=true;break}
 flags.thornsCut=cut;
 if(!moved){finishStoryEffect();return true}draw();return true;
}
function thornInk(points,color){
 galleryInk(points.map(([px,py])=>[Math.max(0,Math.min(159,Math.round(px))),Math.max(0,Math.min(167,Math.round(py)))]),color);
}
function drawThornCutHero(px,py){
 if(!storyAction||storyAction.kind!=='thornsCut'||storyAction.stage==='approach')return false;
 const frame=storyAction.frame,working=frame>=1&&frame<=20,amount=working?Math.min(1,frame/3,(21-frame)/4):0;
 const left=pictureX(px)-4,top=pictureY(py)-39,rows=elaraWalkSprites.right[0];
 ellipse(px,py+1,7,1,'#000000');
 for(let row=0;row<40;row++)for(let col=0;col<8;col++){
  const ink=rows[row][col];if(ink==='.')continue;
  if(working&&row>=15&&row<=24&&ink==='c'&&col>=5)continue;
  const shift=Math.round(amount),lower=row>=27?Math.round(shift*(38-row)/11):shift;
  const foot=row>=38?(col>=4?shift:0):lower;
  const drop=row<27?Math.round(amount):row<38?Math.round(amount*(38-row)/11):0;
  x.fillStyle=elaraColors[parseInt(ink,16)];x.fillRect(left+col+(row>=38?foot:lower),top+row+drop,1,1);
 }
 if(!working)return true;
 // Compact fixed-length elbow/forearm pose; only the blades cycle.
 // She has walked up to the branches, so her hands never telescope outward.
 const shift=Math.round(amount),drop=Math.round(amount);
 const pivot={x:left+12+shift,y:top+22+drop},gap=[2,2,1,1,0,1][frame%6];
 thornInk([[left+6+shift,top+16+drop],[left+7+shift,top+20+drop],[pivot.x-2,pivot.y+1]],'#ff5555');
 thornInk([[left+5+shift,top+17+drop],[left+6+shift,top+22+drop],[pivot.x-3,pivot.y+3]],'#ff5555');
 x.fillStyle='#ffffff';x.fillRect(left+6+shift,top+15+drop,1,2);
 // Red grips and two short steel blades hinge at a single pivot.
 thornInk([[pivot.x-1,pivot.y],[pivot.x-4,pivot.y-2],[pivot.x-4,pivot.y],[pivot.x-1,pivot.y]],'#aa0000');
 thornInk([[pivot.x-1,pivot.y+1],[pivot.x-4,pivot.y+3],[pivot.x-3,pivot.y+4],[pivot.x,pivot.y+1]],'#aa0000');
 thornInk([[pivot.x,pivot.y],[pivot.x+4,pivot.y-gap]],'#aaaaaa');
 thornInk([[pivot.x,pivot.y+1],[pivot.x+4,pivot.y+gap]],'#ffffff');
 x.fillStyle='#555555';x.fillRect(pivot.x,pivot.y,1,2);
 return true;
}
function drawCutThornDebris(){
 if(!storyAction||storyAction.kind!=='thornsCut'||storyAction.stage==='approach')return;
 for(const [i,start]of thornSnipFrames.entries()){
  const elapsed=storyAction.frame-start;if(elapsed<0||elapsed>5)continue;
  const cx=146+i*5+Math.round(Math.sin(elapsed)*1),cy=Math.min(148,133+i*2+elapsed*2);
  thornInk([[cx-3,cy-1],[cx,cy+1],[cx+3,cy]],'#aa5500');
  thornInk([[cx,cy+1],[cx+1,cy-2]],'#000000');
  x.fillStyle='#00aa00';x.fillRect(Math.min(158,cx-2),cy-2,2,1);
 }
}
