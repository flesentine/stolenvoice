// Native foreground coverage is built from the same line/fill commands as the PIC.
const roomPropCache={};
let orchardBeeFrame=0,orchardBeeTimer=0,orchardScoutFlight=null;
function orchardScoutBees(){
 if(!orchardScoutFlight)orchardScoutFlight=Array.from({length:8},(_,i)=>{
  const angle=i*Math.PI/4;
  return{x:104+Math.cos(angle)*(12+Math.random()*6),y:120+Math.sin(angle)*(8+Math.random()*4),vx:0,vy:0,targetX:104,targetY:120,turn:1+i*3,speed:.7+Math.random()*1.5,steer:.12+Math.random()*.16,phase:Math.floor(Math.random()*24),bob:.17+Math.random()*.2};
 });
 return orchardScoutFlight;
}
function moveOrchardScouts(){
 for(const bee of orchardScoutBees()){
  if(--bee.turn<=0||Math.hypot(bee.targetX-bee.x,bee.targetY-bee.y)<2){bee.targetX=85+Math.random()*39;bee.targetY=108+Math.random()*25;bee.turn=18+Math.floor(Math.random()*42)}
  const dx=bee.targetX-bee.x,dy=bee.targetY-bee.y,length=Math.max(.01,Math.hypot(dx,dy));
  bee.vx+=(dx/length*bee.speed-bee.vx)*bee.steer;
  bee.vy+=(dy/length*bee.speed-bee.vy)*bee.steer;
  bee.x=Math.max(84,Math.min(125,bee.x+bee.vx));bee.y=Math.max(107,Math.min(134,bee.y+bee.vy));
 }
}
function tickOrchardBees(){
 if(room!==3||!playing||popupOpen||menuOpen||document.hidden||!waterAnimationFocused||storyAction?.kind==='hiveKick')return;
 orchardBeeFrame++;moveOrchardScouts();draw();
}
function orchardScoutPixels(frame,index){
 const wings=[[[0,-2],[1,-2]],[[0,-1],[1,-2]],[[0,-1],[1,-1]],[[0,-2],[1,-1]]][(frame+index)%4];
 return [[0,0,'#000000'],[1,0,'#ffff55'],[2,0,'#000000'],...wings.map(([x,y])=>[x,y,'#ffffff'])];
}
// Three spectators misunderstand the courtly turn as a bee's flower map.
function orchardDanceBeePoint(index,point){
 if(typeof storyAction==='undefined'||!storyAction?.beeAudience||storyAction.kind!=='courtDance'||index>=3)return point;
 const f=storyAction.frame;if(f<8)return point;
 let tx=96+index*8+Math.sin(f*Math.PI/4+index)*2,ty=98+Math.sin(f*Math.PI/4)*2;
 if(f>=24){const angle=(Math.min(f,31)-24)*Math.PI/4+index*Math.PI*2/3;tx=104+Math.cos(angle)*9;ty=98+Math.sin(angle)*4}
 if(f>=32){const t=Math.min(1,(f-32)/7);tx+=([86,104,124][index]-tx)*t;ty+=([97,91,103][index]-ty)*t}
 const blend=Math.max(0,Math.min(1,(f-8)/6,(48-f)/6));
 return{x:point.x+(tx-point.x)*blend,y:point.y+(ty-point.y)*blend};
}
function orchardHive(){
 if(!roomPropCache.hive){
  const sprite=document.createElement('canvas');sprite.width=160;sprite.height=168;
  const context=sprite.getContext('2d');
  const image=pictureCache.orchard.getContext('2d').getImageData(0,0,160,168);
  const coverage=new Uint8Array(160*168);
  for(const [left,top,length] of orchardHiveMask)coverage.fill(1,top*160+left,top*160+left+length);
  for(let n=0;n<coverage.length;n++)if(!coverage[n])image.data[n*4+3]=0;
  context.putImageData(image,0,0);roomPropCache.hive=sprite;
 }
 // The stump meets the ground at native y136, in the movement grid at y194.
 // The actor is queued later, so equal baselines put her in front.
 prop(194,()=>{
  x.drawImage(roomPropCache.hive,0,0);
  if(drawHiveKickObject())return;
  // Small moving scouts make the living hive visible before its close-up.
  for(const [i,bee]of orchardScoutBees().entries()){
   const ordinary=orchardDanceBeePoint(i,{x:bee.x,y:bee.y+Math.sin(orchardBeeFrame*bee.bob+bee.phase)*.7});
   const point=typeof orchardRaspberryBeePoint==='function'?orchardRaspberryBeePoint(i,ordinary):ordinary,bx=Math.round(point.x),by=Math.round(point.y);
   const flap=typeof storyAction!=='undefined'&&storyAction?.raspberryAudience==='bees'?storyAction.frame*3:Math.floor(orchardBeeFrame/2);
   for(const [dx,dy,color]of orchardScoutPixels(flap+bee.phase,i)){x.fillStyle=color;x.fillRect(bx+dx,by+dy,1,1)}
  }
 });
 // Loose chips rest on the grass below the stump, with their own ground depth.
 if(pickupStillInScene('waxTaken'))prop(203,drawLooseHiveWax);
}
function drawLooseHiveWax(){
 const chip=(a,b,w,h,c)=>{x.fillStyle=c;x.fillRect(a,b,w,h)};
 chip(98,140,4,1,'#aa5500');chip(98,138,3,2,'#ffff55');chip(99,138,2,1,'#ffffff');
 chip(104,142,4,1,'#aa5500');chip(104,140,4,2,'#ffff55');chip(104,140,2,1,'#ffffff');
 chip(110,139,2,1,'#aa5500');chip(109,138,3,1,'#ffff55');
}
function insideSolidFootprint(x,y,polygon){
 if(insidePolygon(x,y,polygon))return true;
 // Native boundary pixels belong to the solid object, including its front row.
 for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
  const [ax,ay]=polygon[j],[bx,by]=polygon[i];
  if((x-ax)*(by-ay)===(y-ay)*(bx-ax)&&x>=Math.min(ax,bx)&&x<=Math.max(ax,bx)&&y>=Math.min(ay,by)&&y<=Math.max(ay,by))return true;
 }
 return false;
}
function objectFootprintAt(px,py,atRoom=room){
 const nx=pictureX(px),ny=pictureY(py);
 if(atRoom===5&&!flags.wheelTurned&&insideSolidFootprint(nx,ny,[[114,123],[132,123],[130,127],[116,127]]))return true;
 return(objectPriorityData[atRoom]||[]).some(object=>insideSolidFootprint(nx,ny,object.footprint));
}
function objectBlocksActor(px,py,atRoom=room){return[-3,0,3].some(offset=>objectFootprintAt(px+offset,py,atRoom))}
function queueRoomObjects(){
 let bridgeDeckDepth=0;
 for(const object of objectPriorityData[room]||[]){
  if(room===4&&object.id==='bridge-decking')bridgeDeckDepth=object.depth;
  const key=room+'-'+object.id;
  if(!roomPropCache[key]){
   const sprite=document.createElement('canvas');sprite.width=160;sprite.height=168;
   const context=sprite.getContext('2d'),image=pictureCache[object.art].getContext('2d').getImageData(0,0,160,168),coverage=new Uint8Array(160*168);
   for(const [left,top,length]of object.mask)coverage.fill(1,top*160+left,top*160+left+length);
   for(let n=0;n<coverage.length;n++)if(!coverage[n])image.data[n*4+3]=0;
   if(object.ink)for(const [n,color]of object.ink){const rgb=elaraColors[color].slice(1);image.data[n*4]=parseInt(rgb.slice(0,2),16);image.data[n*4+1]=parseInt(rgb.slice(2,4),16);image.data[n*4+2]=parseInt(rgb.slice(4,6),16);image.data[n*4+3]=255}
   context.putImageData(image,0,0);roomPropCache[key]=sprite;
  }
  // The loose-plank fall goes off the near edge: timber must not erase her
  // feet while she is standing on it, or her body as she drops in front.
  // Swimmers use their waterline depth, so upstream timber still hides them
  // while a swimmer on the near side appears in front of the decking.
  const bridgeTimber=object.id==='bridge-decking'||object.id.startsWith('bridge-supports-')||object.id.startsWith('Bridge post ');
  const depth=room===4&&bridgeFall&&bridgeTimber?Math.min(object.depth,player.y):object.depth;
  prop(depth,()=>{if((object.id==='bridge-decking'||object.id.startsWith('bridge-supports-'))&&!(swimState.active||swimState.dead||bridgeFall))return;x.drawImage(roomPropCache[key],0,0);if(room===2&&object.id==='storage-barrel')drawBarrelPrank();if(room===2&&object.id==='potting-bench')drawShedTools();if(room===1&&object.id==='book-table')drawGalleryBook()});
 }
 // Redraw the repair after the deck at its depth: the raw timber layer must
 // not erase either the board ends or the twine, even while she is in water.
 if(room===4&&flags.bridgePlank&&(swimState.active||swimState.dead))prop(Math.max(bridgeDeckDepth,flags.bridgePlankSlipped&&!flags.bridgeFixed?178:165),drawBridgeRepair);
 if(room===7)queueBelfryBell();
}
