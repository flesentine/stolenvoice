// Orchard curiosity pays off with a tiny performance, not another quest gate.
const appleReachFrames=14;
function handleAppleIntent(text){
 const match=text.match(/^(take|get|collect|pick(?: up)?|pluck|eat|bite(?: into)?|taste|try) (.+?)(?: from (?:the )?(?:apple )?tree)?$/);
 if(!match||objectId(match[2])!=='apple')return false;
 if(room!==3){say('There are no apples here to try.');return true}
 const trees=[38,118,238],tree=trees.reduce((a,b)=>Math.abs(player.x-a)<Math.abs(player.x-b)?a:b);
 if(Math.hypot(player.x-tree,player.y-180)>58){say('Walk closer to an apple tree first. Even royal arms have their limits.');return true}
 startStoryEffect('applePrank','You nibble the apple down to its core. Your lips nearly meet behind your ears. "How clever," Rosella wheezes. "Merrin grows his vinegar on trees."',{appleTaste:true,appleDirection:tree<player.x?-1:1});return true;
}
function applePrankPose(px,py,frame=storyAction.frame,taste=storyAction.appleTaste,direction=storyAction.appleDirection){
 if(frame<appleReachFrames){
  const left=pictureX(px)-4,top=pictureY(py)-39,shoulder=[left+(direction>0?3:4),top+12];
  // Lift from the shoulder to the branch, pause to twist the fruit free,
  // then bring it down before the existing eating/dropping performance.
  const reach=frame<=6?frame/6:frame<=9?1:1-(frame-9)/4;
  const elbow=[shoulder[0]+direction*Math.round(2+reach*2),Math.round(top+15-reach*10)];
  const hand=[shoulder[0]+direction*Math.round(4+reach*2),Math.round(top+18-reach*20)];
  return{left,top,shoulder,elbow,hand,pucker:0,apple:{x:hand[0],y:hand[1]-4,bites:0,angle:frame>=7&&frame<=9?direction*(frame-7)*.15:0,visible:frame>=7}};
 }
 frame-=appleReachFrames;
 const left=pictureX(px)-4,top=pictureY(py)-39,lift=Math.min(1,frame/8);
 // The native profile's shoulder is its sleeve/skin join on row 12.
 // Keep the elbow at chest height instead of running the arm to the waist.
 const shoulder=[left+(direction>0?3:4),top+12],elbow=[shoulder[0]+direction*2,top+15];
 const lower=taste&&frame>=23?Math.min(1,(frame-23)/5)*4:0;
 const hand=[shoulder[0]+direction*4,Math.round(top+18-lift*(taste?6:2)+lower)];
 const pucker=taste&&frame>=14&&frame<24?Math.round(Math.sin(frame*Math.PI/2)):0;
 const apple={x:hand[0],y:hand[1]-4,bites:taste?(frame>=18?3:frame>=14?2:frame>=10?1:0):0,angle:0,visible:true};
 if(taste){
  if(frame>=26){const t=(frame-26)/5;apple.x+=Math.round(direction*8*t);apple.y+=Math.round((pictureY(py)-1-apple.y)*t-Math.sin(t*Math.PI)*5);apple.angle=direction*t*Math.PI;apple.visible=apple.y<pictureY(py)-2}
 }else{
  if(frame>=20){const t=Math.min(1,(frame-20)/7);apple.x+=Math.round(direction*4*t);apple.y+=Math.round((pictureY(py)-3-apple.y)*t)}
  if(frame>=27){const t=Math.min(1,(frame-27)/16);apple.x=Math.round(apple.x+((direction>0?164:-4)-apple.x)*t);apple.angle=direction*(frame-27)*Math.PI/2}
 }
 return{left,top,shoulder,elbow,hand,pucker,apple};
}
function applePrankPixels(bites=0,angle=0,direction=1){
 const fruit=bites>=3?['.......','...6...','...6...','...f...','..6f6..','...f...','...f...','...6...','.......']:
  ['.......','...6...','...62..','..c44..','..c44..','..444..','..444..','...4...','.......'];
 const pixels=[],cos=Math.cos(angle),sin=Math.sin(angle);
 // Sample backwards from each destination pixel. Rotating single source
 // points forwards left striped holes when a two-wide AGI pixel turned.
 for(let y=-4;y<=4;y++)for(let xPos=-3;xPos<=3;xPos++){
  const col=Math.round((xPos*2*cos+y*sin)/2)+3,row=Math.round(-xPos*2*sin+y*cos)+4;
  const ink=fruit[row]?.[col];if(!ink||ink==='.')continue;
  if(bites>0&&bites<3&&row>=3&&row<=4&&col===(direction>0?2:4))continue;
  if(bites===2&&row>=5&&row<=6&&col===(direction>0?4:2))continue;
  pixels.push([xPos,y,parseInt(ink,16)]);
 }
 return pixels;
}
function drawApplePrankHero(px,py){
 if(storyAction?.kind!=='applePrank')return false;
 const frame=storyAction.frame,direction=storyAction.appleDirection,taste=storyAction.appleTaste,rows=rosellaWalkSprites[direction>0?'right':'left'][1];
 const {left,top,shoulder,elbow,hand,pucker,apple}=applePrankPose(px,py);
 ellipse(px,py+1,7,1,'#000000');
 const torso=direction>0?3:2;
 for(let row=13;row<=24;row++)for(let col=torso;col<torso+3;col++){x.fillStyle=rosellaColors[row<16?15:row<20?1:9];x.fillRect(left+col,top+row,1,1)}
 for(let row=0;row<40;row++)for(let col=0;col<8;col++){
  const ink=rows[row][col];if(ink==='.'||(row>=12&&row<=24&&ink==='c'))continue;
  x.fillStyle=rosellaColors[parseInt(ink,16)];x.fillRect(left+col+(row<12?pucker:0),top+row,1,1);
 }
 galleryInk([shoulder,elbow],'#ffffff');galleryInk([elbow,hand],'#ff5555');
 x.fillStyle='#ff5555';x.fillRect(hand[0]-1,hand[1],3,2);
 if(apple.visible)for(const [dx,dy,color]of applePrankPixels(apple.bites,apple.angle,direction)){
  const xx=apple.x+dx,yy=apple.y+dy;if(xx<0||xx>=160||yy<0||yy>=168)continue;
  x.fillStyle=rosellaColors[color];x.fillRect(xx,yy,1,1);
 }
 if(pucker){x.fillStyle='#ffffff';x.fillRect(left+(direction>0?10:-3),top+7,1,1);x.fillRect(left+(direction>0?11:-4),top+10,1,1)}
 return true;
}
