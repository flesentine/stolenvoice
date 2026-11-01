// Cosmetic poses never move the collision footpoint into the solid barrel.
function handleBarrelPrank(t){
 const close=/^(?:close|replace|lower|shut) (?:the )?(?:barrel|cask|lid|barrel lid)$/.test(t);
 const open=/^(?:open|lift|raise|remove|take off|lift off) (?:the )?(?:barrel|cask|lid|barrel lid|lid of the barrel)$/.test(t);
 const peer=/^(?:look (?:in|inside|into|under)(?: the)? (?:barrel|cask|lid)(?: more| again| closely)?|(?:peer|peek) (?:in|inside|into)(?: the)? (?:barrel|cask)|look (?:in more|closer|deeper)|peer deeper|search (?:the )?(?:barrel|cask))$/.test(t);
 if(!close&&!open&&!peer)return false;
 if(room!==2){say('You do not see a barrel here.');return true}if(!nearObject('barrel'))return true;
 if(close){flags.barrelOpen=false;draw();say('You lower the wooden lid. A wise precaution.');return true}
 if(!flags.barrelOpen){flags.barrelOpen=true;draw();playGameSound('chairCreak',false,0,.4);say('You tip back the lid. Dark garden manure fills the barrel. Something glints beneath the straw. A little nearer, and you might make out what it is.');return true}
 if(open){say('The lid is already propped open.');return true}
 flags.manureSoiled=true;
 startStoryEffect('barrelPrank','You straighten your dress and wipe off the last clumps. The glint was a beetle. It looks considerably cleaner than you. A certain garden fragrance lingers.');return true;
}
function barrelInk(points,color){galleryInk(points,color)}
// Each stage has its own readable silhouette: bend, tip, kick, climb,
// lower the hem, then brush down. All anchors are native picture pixels.
function barrelPrankPose(frame){
 const mix=(a,b,t)=>a+(b-a)*Math.max(0,Math.min(1,t));
 if(frame<12)return {stage:'approach',t:frame/11};
 if(frame<24)return {stage:'lean',hx:125,hy:115,angle:mix(0,1.12,(frame-12)/11),hem:16};
 if(frame<34){const t=(frame-24)/9;return {stage:'tip',hx:mix(125,138,t),hy:mix(115,91,t),angle:mix(1.12,Math.PI,t),legAngle:mix(0,Math.PI,t),hem:16,kick:0,clip:true}}
 if(frame<44)return {stage:'kick',hx:138,hy:91,angle:Math.PI,hem:13,kick:Math.sin((frame-34)*1.2)*4,clip:true};
 if(frame<54)return {stage:'sink',hx:138,hy:91+(frame-44)*3,angle:Math.PI,hem:13,kick:Math.sin(frame)*2,clip:true};
 if(frame<58)return {stage:'hidden'};
 if(frame<82)return {stage:frame<66?'peek':'shake',hx:138,hy:Math.max(111,128-(frame-58)*3),angle:0,hem:16,dirty:1,clip:true,shake:frame>=66?Math.round(Math.sin(frame*1.8)*2):0};
 if(frame<100){const t=(frame-82)/17;return {stage:'climb',hx:mix(138,124,t),hy:mix(108,115,t),angle:mix(-.45,0,t),hem:5,dirty:1,bend:Math.sin(t*Math.PI)*8}}
 if(frame<114)return {stage:'hem',hx:124,hy:115,angle:0,hem:mix(5,16,(frame-100)/13),dirty:1};
 if(frame<132)return {stage:'brush',hx:124,hy:115,angle:0,hem:16,dirty:1-(frame-114)/17};
 return {stage:'return',hx:mix(124,pictureX(player.x),(frame-132)/7),hy:mix(115,pictureY(player.y)-20,(frame-132)/7),angle:0,hem:16};
}
// Native pixels double horizontally in the 320x200 frame; its 4:3 display
// stretches vertical pixels by 1.2. Their visible height/width ratio is .6.
// Rotate in display proportions, then map back to native pixels.
const barrelPixelAspect=.6;
function barrelRotate(dx,dy,angle){return [dx*Math.cos(angle)-dy*Math.sin(angle)*barrelPixelAspect,dx*Math.sin(angle)/barrelPixelAspect+dy*Math.cos(angle)]}
function barrelJointChain(start,target,upper,lower,bend=1){
 // Solve in vertical-pixel units so knees/elbows keep their apparent lengths.
 let dx=(target[0]-start[0])/barrelPixelAspect,dy=target[1]-start[1];
 const distance=Math.hypot(dx,dy),reach=Math.max(.01,Math.min(upper+lower-.05,Math.max(Math.abs(upper-lower)+.05,distance)));
 if(distance){dx*=reach/distance;dy*=reach/distance}else{dx=0;dy=reach}
 const along=(upper*upper-lower*lower+reach*reach)/(2*reach),across=Math.sqrt(Math.max(0,upper*upper-along*along))*bend;
 return [start,[start[0]+(dx*along/reach-dy*across/reach)*barrelPixelAspect,start[1]+dy*along/reach+dx*across/reach],[start[0]+dx*barrelPixelAspect,start[1]+dy]];
}
function barrelArmChains(stage,frame){
 if(!['hem','brush'].includes(stage))return [];
 const shoulders=[[-3,-6],[3,-6]];
 if(stage==='hem'){
  // Tug a fold at the upper thigh, then release it to fall to the knees.
  const tug=Math.min(1,(frame-100)/8),released=frame>=110;
  return shoulders.map(([sx,sy],i)=>{const side=i?1:-1;return barrelJointChain([sx,sy],[side*(released?4:3),released?3:1+tug*3],5,5,side)});
 }
 const beat=(frame-114)%6,part=Math.floor((frame-114)/6),hand=part===0?[0,-15+beat%3]:part===1?[1,-4+beat%3]:[1,1+beat%3];
 return [barrelJointChain(shoulders[0],hand,5,5,-1),barrelJointChain(shoulders[1],[4,3],5,5,1)];
}
function barrelActor(pose,frame){
 const {hx,hy,angle=0,hem=16,dirty=0,kick=0,bend=0}=pose;
 const cos=Math.cos(angle),sin=Math.sin(angle),points=(pts,rotation=angle)=>pts.map(([dx,dy])=>{const [xx,yy]=barrelRotate(dx,dy,rotation);return [Math.round(hx+xx),Math.round(hy+yy)]});
 const legAngle=pose.stage==='lean'?0:(pose.legAngle??angle),posingArms=['hem','brush'].includes(pose.stage),bodyHip=['peek','shake'].includes(pose.stage)?24:20;
 const skin='#ff5555',boot='#aa5500';
 // Thighs start at the hips. The short, opaque linen underlayer stays in
 // place as gravity pulls the blue skirt toward her shoulders in the fall.
 for(const side of [-1,1]){
  const leg=points(barrelJointChain([side*2,1],[side*(3+Math.abs(kick))+bend,18+(side*kick)/2],8,10,side),legAngle);
  barrelInk(leg,skin);barrelInk(leg.map(([xx,yy])=>[xx+1,yy]),skin);
  const [fx,fy]=leg[2];barrelInk([[fx-1,fy],[fx+2,fy]],boot);
 }
 // Inverse-sample the head/blouse/bodice so rotated cels have no pinholes.
 const rows=rosellaWalkSprites[angle>.2?'right':'front'][1];
 for(let yy=Math.floor(hy-27);yy<=Math.ceil(hy+27);yy++)for(let xx=Math.floor(hx-27);xx<=Math.ceil(hx+27);xx++){
  const dx=xx-hx,dy=yy-hy,c=Math.round(dx*cos+dy*sin*barrelPixelAspect)+4,r=Math.round(-dx*sin/barrelPixelAspect+dy*cos)+bodyHip;
  if(c<0||c>=8||r<0||r>=24)continue;
  let ink=rows[r][c];if(ink==='.')continue;
  if(r>=bodyHip&&!(ink==='c'&&(c<=1||c>=6)))continue;
  if(posingArms&&r>=14&&((ink==='c'&&(c<=1||c>=6))||(ink==='f'&&(c===0||c===7))))continue;
  // A few deliberate clumps, rather than a checkerboard across her face.
  if(dirty>0&&[[1,4],[5,7],[3,12],[1,19],[5,22]].slice(0,Math.ceil(dirty*5)).some(([cx,cy])=>c>=cx&&c<=cx+1&&r>=cy&&r<=cy+1))ink='6';
  const shake=r<13?(pose.shake||0):0;x.fillStyle=rosellaColors[parseInt(ink,16)];x.fillRect(xx+shake,yy,1,1);
 }
 barrelShape(points([[-4,0],[3,0],[3,5],[0,5],[0,3],[-1,3],[-1,5],[-4,5]]),'#ffffff','#aaaaaa');
 const waist=points([[-3,0],[2,0]],legAngle),falling=legAngle>Math.PI/2;
 if(falling)waist.sort((a,b)=>a[0]-b[0]);
 const center=falling?[hx,hy+hem]:[hx-Math.sin(legAngle)*hem*barrelPixelAspect,hy+Math.cos(legAngle)*hem];
 barrelShape([waist[0],waist[1],[Math.round(center[0]+5),Math.round(center[1])],[Math.round(center[0]-5),Math.round(center[1])]],'#5555ff','#0000aa');
 if(dirty>.25){x.fillStyle='#aa5500';x.fillRect(Math.round(center[0]-3),Math.round(center[1]-3),2,2)}
 for(const chain of barrelArmChains(pose.stage,frame)){
  const arm=points(chain);barrelInk(arm,skin);
  const shoulder=arm[0],elbow=arm[1];barrelInk([shoulder,[Math.round((shoulder[0]+elbow[0])/2),Math.round((shoulder[1]+elbow[1])/2)]],'#ffffff');
 }
 if(pose.stage==='brush'&&frame%3===0){const chain=barrelArmChains(pose.stage,frame)[0],hand=points([chain[2]])[0];x.fillStyle='#aa5500';x.fillRect(hand[0]+3,hand[1]+3,1,1)}
}
function drawBarrelPrank(){
 if(room!==2||!flags.barrelOpen)return;
 x.fillStyle='#555555';x.fillRect(131,97,14,8);
 barrelShape([[132,102],[135,100],[141,100],[144,102],[141,105],[134,105]],'#aa5500','#000000');
 x.fillStyle='#000000';x.fillRect(134,102,8,2);
 barrelShape([[145,102],[147,99],[148,88],[146,87],[144,98]],'#aa5500','#000000');
 barrelInk([[146,99],[147,90]],'#ffff55');
 if(storyAction?.kind!=='barrelPrank')return;
 const f=storyAction.frame,pose=barrelPrankPose(f);
 if(pose.stage==='hidden')return;
 if(pose.stage==='approach'){
  const hx=Math.round(pictureX(player.x)+(125-pictureX(player.x))*pose.t),hy=Math.round(pictureY(player.y)-20+(115-(pictureY(player.y)-20))*pose.t);
  barrelActor({hx,hy,hem:16},f);return;
 }
 // Clip the sinking/peeking actor to the opening without repainting the
 // barrel's front wall. Restore fillRect immediately after this local paint.
 const fill=x.fillRect;
 if(pose.clip)x.fillRect=function(xx,yy,w,h){if(yy<=102)fill.call(this,xx,yy,w,Math.min(h,103-yy))};
 try{barrelActor(pose,f)}finally{x.fillRect=fill}
 if(pose.stage==='shake'&&f%2===0)for(let n=0;n<3;n++){x.fillStyle='#aa5500';x.fillRect(130+n*7+(f%3),88+(n*3+f)%12,1,1)}
}

function barrelShape(points,fill,edge){
 const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);x.fillStyle=fill;
 for(let yy=Math.min(...ys);yy<=Math.max(...ys);yy++)for(let xx=Math.min(...xs);xx<=Math.max(...xs);xx++)if(insidePolygon(xx,yy,points))x.fillRect(xx,yy,1,1);
 barrelInk([...points,points[0]],edge);
}
