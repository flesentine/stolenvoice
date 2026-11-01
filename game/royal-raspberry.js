let royalRaspberryComment=0;
const royalRaspberryComments=['"Wrong end," she whispers.','"That was meant to be a curtsy."','"A royal fanfare. In the wrong key."','"A passing dragon. Very far away."'];
// Optional parser joke; no inventory, puzzle flags, score or movement changes.
function handleRoyalRaspberry(){
 if(swimState.active){say('A few suspicious bubbles rise to the surface. Rosella looks innocent.');return true}
 const nearby=(id,range=60)=>{const p=hotspots[room][id];return p&&Math.hypot(player.x-p[0],player.y-p[1])<=range};
 const audience=room===0&&nearby('man')?'merrin':room===3&&nearby('wax',120)?'bees':room===6?'cave':'';
 const replies={
  merrin:flags.voiceArrivalSeen?'Merrin pinches his nose. "Your Highness! The roses prefer their fertilizer applied to the soil."':'Merrin pinches his nose. A tiny, indignant "ding-ding!" escapes him. You decide not to ask for a translation.',
  bees:'The bees scatter in eight different directions. Apparently, that is not how one announces a new flower.',
  cave:'The grotto sends it booming back. Then again. And again. For once, you wish the cave were less musical.'
 };
 const comment=royalRaspberryComments[royalRaspberryComment];royalRaspberryComment=(royalRaspberryComment+1)%royalRaspberryComments.length;
 const message='Rosella claps a hand over her mouth.\n\n'+comment+'\n\n'+(replies[audience]||'Royal dignity drifts away on the breeze.');
 const frenzy=audience==='bees'?Array.from({length:8},()=>({phase:Math.random()*Math.PI*2,speed:.55+Math.random()*.6,wide:19+Math.random()*13,high:10+Math.random()*9})):null;
 startStoryEffect('royalRaspberry',message,{raspberryAudience:audience,beeFrenzy:frenzy});return true;
}
// Shared native pixels keep her reflection in sync, including the puff.
function royalRaspberryPixels(frame,reflected=false){
 const f=frame,direction=player.facing==='left'?-1:1,out=[];
 const dot=(dx,y,ink)=>out.push([dx,y,ink]);
 for(let n=0;n<3;n++){
  const age=f-5-n*3;if(age<0||age>13)continue;
  const radius=1+Math.floor(age/5),cx=-direction*(5+Math.floor(age*.6)),cy=21-Math.floor(age*.25)+n%2;
  for(let dy=-radius;dy<=radius;dy++)for(let dx=-radius;dx<=radius;dx++){
   const r=dx*dx+dy*dy;if(r<radius*radius-1||r>radius*radius+1||(age>8&&(dx+dy+n)%2===0))continue;
   dot(cx+dx,cy+dy,(dx+dy+n)%3===0?10:7);
  }
 }
 const reaction=f>=18,rows=rosellaWalkSprites[reaction?(reflected?'back':'front'):direction>0?'right':'left'][1];
 for(let yy=0;yy<40;yy++)for(let xx=0;xx<8;xx++){
  const ink=rows[yy][xx];if(ink==='.'||reaction&&yy>=14&&yy<=23&&xx>=6&&ink==='c')continue;
  dot(xx-4,yy,parseInt(ink,16));
 }
 if(reaction){
  const arm=reflected?[[2,15],[3,14],[4,13],[4,12],[4,11],[4,10],[4,9]]:[[2,15],[3,14],[4,13],[4,12],[3,11],[2,10],[1,9],[0,8],[1,8]];
  for(const [dx,dy]of arm)dot(dx,dy,12);
 }
 return out;
}
function drawRoyalRaspberry(px,py){
 if(storyAction?.kind!=='royalRaspberry')return false;
 const cx=pictureX(px),top=pictureY(py)-39;
 for(const [dx,y,ink]of royalRaspberryPixels(storyAction.frame)){
  const xx=cx+dx,yy=top+y;if(xx<0||xx>=160||yy<0||yy>=168)continue;
  x.fillStyle=rosellaColors[ink];x.fillRect(xx,yy,1,1);
 }
 return true;
}
function drawRoyalRaspberryMirror(pose,glass){
 const pixels=new Map(royalRaspberryPixels(storyAction.frame,true).map(([dx,y,c])=>[dx+','+y,c]));
 const scale=pose.width/8,left=pose.left-Math.ceil(20*scale),right=pose.left+Math.ceil(12*scale);
 for(let yy=pose.top;yy<pose.top+pose.height;yy++)for(let xx=left;xx<right;xx++){
  if(!insidePolygon(xx,yy,glass))continue;
  const sx=Math.floor((xx-pose.left)/scale)-4,sy=Math.floor((yy-pose.top)*40/pose.height),ink=pixels.get(sx+','+sy);
  if(ink===undefined)continue;x.fillStyle=rosellaColors[ink===15?7:ink===9?1:ink];x.fillRect(xx,yy,1,1);
 }
}

// Pure temporary render offsets: normal scout flight and wax timing survive.
function orchardRaspberryBeePoint(index,point){
 if(storyAction?.kind!=='royalRaspberry'||storyAction.raspberryAudience!=='bees')return point;
 const f=storyAction.frame,bee=storyAction.beeFrenzy[index];if(!bee||f<5)return point;
 const t=f-5,blend=Math.max(0,Math.min(1,t/4,(32-f)/6));
 const angle=bee.phase+t*bee.speed;
 const tx=105+Math.sin(angle)*bee.wide+Math.sin(angle*1.9)*4,ty=119+Math.cos(angle*1.3)*bee.high;
 return{x:point.x+(tx-point.x)*blend,y:point.y+(ty-point.y)*blend};
}
