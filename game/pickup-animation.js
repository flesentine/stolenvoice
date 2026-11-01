const pickupNativeContacts={oil:[79,103],twine:[92,104],shears:[66,106],jar:[123,100],bell:[148,131]};
// Actor depth comes from the object's floor position, independently of the
// elevated artwork contact. The little bell hangs above the garden grass.
function pickupStandingDepth(id,groundPoint){return id==='bell'?216:groundPoint[1]}
function approachPickup(){
 if(!storyAction||!['pickup','bellTaken'].includes(storyAction.kind)||storyAction.stage!=='approach')return false;
 const target=storyAction.pickupStand,dx=Math.sign(target.x-player.x)*Math.min(2,Math.abs(target.x-player.x)),dy=Math.sign(target.y-player.y)*Math.min(2,Math.abs(target.y-player.y));
 if(!dx&&!dy){storyAction.stage='reach';player.facing=storyAction.pickupDirection>0?'right':'left';player.step=0;return false}
 if(clearGroundStep(player.x,player.y,player.x+dx,player.y+dy)){player.x+=dx;player.y+=dy}
 else if(dx&&clearGroundStep(player.x,player.y,player.x+dx,player.y))player.x+=dx;
 else if(dy&&clearGroundStep(player.x,player.y,player.x,player.y+dy))player.y+=dy;
 else{storyAction.stage='reach';player.facing=storyAction.pickupDirection>0?'right':'left';player.step=0;return false}
 player.step++;player.facing=dx<0?'left':dx>0?'right':dy<0?'back':'front';draw();return true;
}
// Repose Rosella's original pixels: head/hair retain their exact colors and shape.
// Ground items use a brief crouch; bench/shelf items use a smaller forward reach.
const pickupObjects={
 rose:{pickup:'rose',pickupLevel:'ground',pickupTarget:'rose'},
 oilTaken:{pickup:'oil flask',pickupLevel:'bench',pickupTarget:'oil'},
 twineTaken:{pickup:'twine',pickupLevel:'bench',pickupTarget:'twine'},
 plankTaken:{pickup:'wooden plank',pickupLevel:'ground',pickupTarget:'plank'},
 shearsTaken:{pickup:'rusty shears',pickupLevel:'bench',pickupTarget:'shears'},
 waxTaken:{pickup:'beeswax',pickupLevel:'ground',pickupTarget:'wax'},
 jarTaken:{pickup:'glass jar',pickupLevel:'bench',pickupTarget:'jar'}
};
// Story flags commit immediately for reliable scoring/saves, while scenery
// stays visible until the reaching hand makes contact on frame four.
function pickupContactFrame(action=storyAction){return Math.ceil((action.total-1)*.4)}
function pickupStillInScene(flag){
 if(!flags[flag])return true;
 if(!storyAction||storyAction.room!==room)return false;
 const matching=storyAction.kind==='bellTaken'?flag==='bell':storyAction.kind==='pickup'&&pickupObjects[flag]?.pickup===storyAction.pickup;
 return matching&&storyAction.frame<pickupContactFrame();
}
function pickupPose(px,py){
 const phase=Math.round(storyAction.frame/(storyAction.total-1)*9),amount=[0,.25,.65,1,1,.85,.55,.25,0,0][phase];
 const ground=storyAction.pickupLevel==='ground',direction=player.facing==='left'?-1:1;
 const left=pictureX(px)-4,top=pictureY(py)-39;
 // A hip hinge moves the upper body as a connected piece. The head stays
 // upright; only the knees fold. No row-dependent stretching of the torso.
 const angle=(ground?.12:.045)*amount,drop=Math.round((ground?3:1)*amount),weightShift=direction*Math.round(amount);
 const forwardFoot=col=>direction>0?col>=4:col<=3;
 const joint=(col,row)=>({x:left+4+weightShift+Math.round((col-4)*Math.cos(angle)-direction*(row-25)*Math.sin(angle)),y:top+25+drop+Math.round(direction*(col-4)*Math.sin(angle)+(row-25)*Math.cos(angle))});
 const neck=joint(4,12),headX=neck.x-(left+4),headY=neck.y-(top+12);
 const pixel=(col,row)=>{
  if(row<12)return{x:left+col+headX,y:top+row+headY};
  if(row<=24)return joint(col,row);
  if(row>=38)return{x:left+col+(forwardFoot(col)?weightShift:0),y:top+row};
  const knee=Math.max(0,1-Math.abs(row-32)/7),settle=(38-row)/13;
  const hipShift=Math.round(weightShift*settle),ankleShift=forwardFoot(col)?Math.round(weightShift*Math.max(0,(row-32)/6)):0;
  return{x:left+col+hipShift+ankleShift-direction*Math.round((ground?1.5:.5)*amount*knee),y:top+row+Math.round(drop*settle)};
 };
 const shoulder=joint(direction>0?6:1,15);
 const contact=!ground?pickupNativeContacts[storyAction.pickupTarget]:null;
 const rest={x:shoulder.x+direction*2,y:shoulder.y+6};
 const hand=contact?{x:Math.round(rest.x+(contact[0]-rest.x)*amount),y:Math.round(rest.y+(contact[1]-rest.y)*amount)}:{x:shoulder.x+direction*Math.round(2+2*amount),y:shoulder.y+Math.round(6+3*amount)};
 return{amount,ground,direction,left,top,drop,shoulder,hand,pixel};
}
function drawPickupHero(px,py){
 if(!storyAction||!['pickup','bellTaken'].includes(storyAction.kind)||storyAction.stage==='approach')return false;
 const pose=pickupPose(px,py),{amount,ground,direction,left,top,shoulder}=pose;
 const rows=rosellaWalkSprites[player.facing][0];
 ellipse(px,py+1,7,1,'#000000');
 for(let row=0;row<40;row++)for(let col=0;col<8;col++){
  const ink=rows[row][col];if(ink==='.')continue;
  // Remove only the outside arm. Interior skin pixels form her waist
  // and must remain: deleting every skin pixel cut the body in two.
  if(amount>0&&row>=15&&row<=24&&ink==='c'&&(direction>0?col>=5:col<=2))continue;
  const p=pose.pixel(col,row);
  x.fillStyle=rosellaColors[parseInt(ink,16)];x.fillRect(p.x,p.y,1,1);
 }
 if(amount>0){
  galleryInk([[shoulder.x,shoulder.y],[shoulder.x+direction*2,Math.round((shoulder.y+pose.hand.y)/2)],[pose.hand.x,pose.hand.y]],'#ff5555');
  x.fillStyle='#ffffff';x.fillRect(shoulder.x,shoulder.y-1,1,2);
 }
 // Show the collected object briefly in her hand, then tuck it at her waist.
 const phase=storyAction.frame/(storyAction.total-1);
 if(storyAction.frame>=pickupContactFrame()&&phase<.84){
  const tuck=Math.max(0,(phase-.5)/.34),end={x:left+3,y:top+23},p=storyArc(pose.hand,end,Math.min(1,tuck),2);
  const plank=storyAction.pickup==='wooden plank';
  drawStoryJar(storyAction.pickup,p.x-(plank?2:3),p.y-(plank?10:5),plank?5:7,plank?14:8);
 }
 return true;
}
