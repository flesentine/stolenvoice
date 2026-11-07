// Native editor project supplies the room; enchantments remain live game layers.
function galleryInk(points,color){
 x.fillStyle=color;
 for(let i=1;i<points.length;i++){
  let [a,b]=points[i-1];const [c,d]=points[i],dx=Math.abs(c-a),dy=-Math.abs(d-b),sx=a<c?1:-1,sy=b<d?1:-1;let error=dx+dy;
  for(;;){x.fillRect(a,b,1,1);if(a===c&&b===d)break;const twice=error*2;if(twice>=dy){error+=dy;a+=sx}if(twice<=dx){error+=dx;b+=sy}}
 }
}
// Reflection uses the same walking cels as Elara, viewed from the other side.
function mirrorReflectionPose(){
 const distance=pictureY(player.y)-116;
 if(Math.abs(player.x-144)>94||distance< -6)return null;
 const facing={front:'back',back:'front',left:'left',right:'right'}[player.facing]||'front';
 const height=Math.max(28,Math.min(40,40-Math.round(Math.max(0,distance)*0.3))),width=Math.max(6,Math.round(height/5));
 const center=72+Math.round((pictureX(player.x)-72)*0.6),feet=99-Math.round(Math.max(0,distance)*0.45);
 return{facing,rows:elaraWalkSprites[facing][player.step%4],left:center-Math.floor(width/2),top:feet-height,width,height};
}
function drawMirrorReflection(){
 const pose=mirrorReflectionPose();if(!pose)return;
 const glass=[[63,48],[72,38],[82,48],[82,101],[63,101]];
 if(storyAction?.kind==='royalRaspberry'){drawRoyalRaspberryMirror(pose,glass);return;}
 if(['courtDance','mirrorCurtsy'].includes(storyAction?.kind)){
  const rows=storyAction.kind==='mirrorCurtsy'?elaraCurtsySprite(storyAction.frame,true):elaraDanceSprite(storyAction.frame,true),width=Math.ceil(pose.width*14/8),left=pose.left-Math.round(pose.width*3/8);
  for(let row=0;row<pose.height;row++)for(let col=0;col<width;col++){
   const ink=rows[Math.floor(row*40/pose.height)][Math.floor(col*8/pose.width)];
   const px=left+col,py=pose.top+row;if(!ink||ink==='.'||!insidePolygon(px,py,glass))continue;
   const color=parseInt(ink,16);x.fillStyle=elaraColors[color===15?7:color===9?1:color];x.fillRect(px,py,1,1);
  }
  return;
 }
 for(let row=0;row<pose.height;row++)for(let col=0;col<pose.width;col++){
  const sourceRow=Math.floor(row*40/pose.height),sourceCol=Math.floor(col*8/pose.width),ink=pose.rows[sourceRow][sourceCol];if(ink==='.')continue;
  const offset=storyAction?.kind==='mirrorBow'?playfulBowOffset(pose.facing,sourceRow,storyAction.frame,true):{x:0,y:0};
  const px=pose.left+col+Math.round(offset.x*pose.width/8),py=pose.top+row+Math.round(offset.y*pose.height/40);
  if(!insidePolygon(px,py,glass))continue;
  if(storyAction&&['voiceOffered','voiceReturned'].includes(storyAction.kind)&&sourceRow>=15&&sourceRow<=23&&sourceCol>=6&&['c','f'].includes(ink))continue;
  // Silver dulls the white blouse and deepens the blue, using only EGA colors.
  const color=parseInt(ink,16);x.fillStyle=elaraColors[color===15?7:color===9?1:color];x.fillRect(px,py,1,1);
 }
}
function gallery(){
 if(!pictureCache.gallery)pictureCache.gallery=decodePicture(galleryBookBackground);
 x.drawImage(pictureCache.gallery,0,0);
 galleryCandleLight();
 drawMirrorReflection();
 drawStoryMirrorJar();
 // All effects stay within the new arched mirror glass. Redrawing the base
 // clears old effects naturally; no rectangular mask can cover its carving.
 if(storyAction&&['voiceOffered','voiceReturned'].includes(storyAction.kind)){
  galleryInk([[65,59],[68,54]],'#ffffff');
 }else if(flags.voiceReturned){
  galleryInk([[65,67],[77,48]],'#ffffff');galleryInk([[66,87],[78,70]],'#55ffff');
 }else if(flags.mirrorAwake){
  galleryInk([[65,59],[68,54]],'#ffffff');galleryInk([[74,90],[78,84]],'#aaaaaa');
  galleryInk([[70,77],[72,75],[74,77],[72,79],[70,77]],'#ffff55');
  galleryInk([[74,77],[74,63],[78,65]],'#ffff55');
  if(flags.voiceOffered){galleryInk([[65,68],[67,71]],'#55ffff');galleryInk([[77,83],[79,80]],'#55ffff')}
 }else{
  galleryInk([[65,60],[68,55]],'#ffffff');galleryInk([[74,89],[78,83]],'#aaaaaa');
  galleryInk([[70,68],[72,71],[70,74],[73,77]],'#00aaaa');
 }
 drawPlayfulMirror();
 // Furniture is queued by exact authored masks in the shared priority pass.
 line(130,237,192,237,'#aa5500');
}
