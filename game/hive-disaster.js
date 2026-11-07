// A deliberate classic disaster, kept out of persistent puzzle state.
let hiveDisaster=null;
function handleHiveDisaster(text){
 if(!/^(?:kick(?: over)?|boot|topple|knock over) (?:the )?(?:hive|beehive|bee hive|straw hive)(?: over)?$/.test(text))return false;
 if(room!==3){say('There is no hive here to kick.');return true}
 if(!nearObject('wax'))return true;
 const origin={...player},direction=player.x<206?1:-1;
 const target={x:direction>0?186:234,y:200};
 const stand=canStand(target.x,target.y,3)&&clearGroundStep(player.x,player.y,target.x,target.y)?target:{x:player.x,y:player.y};
 hiveDisaster={origin,stand,direction,dead:false,walking:true,walkElapsed:0};
 startStoryEffect('hiveKick','');return true;
}
function hiveDisasterFrame(){return hiveDisaster?.dead?64:storyAction?.kind==='hiveKick'?storyAction.frame:0}
function finishHiveDisaster(){
 if(!hiveDisaster)return;
 resetStoryEffect();hiveDisaster.walking=false;hiveDisaster.dead=true;stopWalking();playing=false;draw();
 say('The bees unanimously reject your royal footwork.\n\nElara has kicked the bucket. The hive was merely the first step.\n\nENTER: retry before the kick.\nF7: restore.  R: restart.');
}
function retryHiveDisaster(){
 const origin=hiveDisaster?.origin;if(!origin)return;
 hiveDisaster=null;resetStoryEffect();stopWalking();popupOpen=false;textPopup.hidden=true;agiMessagePages=[];popupFocus=null;playing=true;room=3;player={...origin};input.value='';document.querySelector('.hud').inert=false;document.querySelector('.footer').inert=false;c.focus();draw();
}
function resetHiveDisaster(){hiveDisaster=null}
function hiveKickActorPoint(){return{x:player.x,y:player.y}}
function approachHiveKick(){
 if(storyAction?.kind!=='hiveKick'||!hiveDisaster?.walking)return false;
 const target=hiveDisaster.stand;
 if(player.x===target.x&&player.y===target.y){hiveDisaster.walking=false;player.facing=hiveDisaster.direction>0?'right':'left';player.step=1;return false}
 // Same stride, facing and four walk cels as manual walking, paced at110ms.
 hiveDisaster.walkElapsed+=90;if(hiveDisaster.walkElapsed<110)return true;hiveDisaster.walkElapsed-=110;
 const gapX=target.x-player.x,gapY=target.y-player.y;
 const direction=gapX&&gapY?(gapY<0?'n':'s')+(gapX<0?'w':'e'):gapX?(gapX<0?'left':'right'):(gapY<0?'up':'down');
 const stride=moveSteps[direction],dx=Math.sign(gapX)*Math.min(Math.abs(gapX),Math.abs(stride[0])),dy=Math.sign(gapY)*Math.min(Math.abs(gapY),Math.abs(stride[1]));
 let mx=dx,my=dy;
 if(!clearGroundStep(player.x,player.y,player.x+dx,player.y+dy)){
  if(dx&&clearGroundStep(player.x,player.y,player.x+dx,player.y))my=0;
  else if(dy&&clearGroundStep(player.x,player.y,player.x,player.y+dy))mx=0;
  else{hiveDisaster.walking=false;return false}
 }
 player.x+=mx;player.y+=my;player.step++;player.facing=mx<0?'left':mx>0?'right':my<0?'back':'front';draw();return true;
}
function drawHiveKickObject(){
 if(!hiveDisaster||room!==3)return false;
 const f=hiveDisasterFrame(),angle=Math.max(0,Math.min(1,(f-14)/14))*Math.PI/2,drop=Math.sin(angle)*12;
 const art=hiveKickArtwork,co=Math.cos(angle),si=Math.sin(angle);
 for(const [xx,yy,color]of art.underlay){x.fillStyle=elaraColors[color];x.fillRect(xx,yy,1,1)}
 // Rotate in display space: native AGI pixels are wider than they are tall.
 // A square-grid rotation squashes the fallen hive on the rendered screen.
 const aspect=.6,corners=[];
 for(const sx of [art.left,art.left+art.width-1])for(const sy of [art.top,art.top+art.height-1]){
  const dx=sx-111,dy=sy-124;
  corners.push([111+dx*co-dy*aspect*si,124+drop+dx*si/aspect+dy*co]);
 }
 const left=Math.max(0,Math.floor(Math.min(...corners.map(p=>p[0])))-1),right=Math.min(159,Math.ceil(Math.max(...corners.map(p=>p[0])))+1);
 const top=Math.max(0,Math.floor(Math.min(...corners.map(p=>p[1])))-1),bottom=Math.min(167,Math.ceil(Math.max(...corners.map(p=>p[1])))+1);
 // Inverse sampling fills the complete rotated silhouette without clipping.
 for(let yy=top;yy<=bottom;yy++)for(let xx=left;xx<=right;xx++){
  const dx=xx-111,dy=yy-124-drop,sx=Math.round(111+dx*co+dy*aspect*si),sy=Math.round(124-dx*si/aspect+dy*co);
  if(sx<art.left||sx>=art.left+art.width||sy<art.top||sy>=art.top+art.height)continue;
  const ink=art.pixels[(sy-art.top)*art.width+sx-art.left];if(ink===16)continue;x.fillStyle=elaraColors[ink];x.fillRect(xx,yy,1,1);
 }
 return true;
}
function drawHiveKickHero(){
 if(!hiveDisaster||room!==3)return false;
 const f=hiveDisasterFrame(),p=hiveKickActorPoint(),direction=hiveDisaster.direction;
 // Raised kick contours follow the accepted six-key sheet. The entire
 // original head, torso and arms remain fixed; only cloth below the hip moves.
 if(!hiveDisaster.walking&&f>=7&&f<30){
  const keys=[7,10,12,14,18,23];
  let cel=0;for(let i=1;i<keys.length;i++)if(f>=keys[i])cel=i;
  const cx=pictureX(p.x),feet=pictureY(p.y);
  const paint=(dx,dy,ink)=>{const xx=cx+direction*dx,yy=feet+dy;if(xx<0||xx>=160||yy<0||yy>=168)return;x.fillStyle=elaraColors[ink];x.fillRect(xx,yy,1,1)};
  for(const [dx,dy,ink]of hiveKickCels[cel])paint(dx,dy,ink);
  return true;
 }
 const cx=pictureX(p.x),feet=pictureY(p.y);
 const paint=(xx,yy,ink)=>{if(xx<0||xx>=160||yy<0||yy>=168)return;x.fillStyle=elaraColors[typeof ink==='string'?parseInt(ink,16):ink];x.fillRect(xx,yy,1,1)};
 const rows=elaraWalkSprites[hiveDisaster.walking?player.facing:f<30?(direction>0?'right':'left'):'front'][hiveDisaster.walking?player.step%4:1];
 if(f<48){
  const stagger=f>=30?Math.round(Math.sin(f*1.4)):0;
  for(let yy=0;yy<40;yy++)for(let xx=0;xx<8;xx++){const ink=rows[yy][xx];if(ink!=='.')paint(cx+xx-4+stagger,feet+yy-39,ink)}
 }else{
  // Knees buckle in four held poses. The head and torso keep their native
  // shape; only the hanging cloth folds, with no rotating/scaling of anatomy.
  const stage=Math.min(3,Math.floor((f-48)/4)),drop=[3,8,12,15][stage];
  const top=feet-39+drop;
  for(let yy=0;yy<20;yy++)for(let xx=0;xx<8;xx++){
   let ink=rows[yy][xx];if(stage===3&&yy===5&&(xx===3||xx===5))ink='c';
   if(ink!=='.')paint(cx+xx-4,top+yy,ink);
  }
  const clothTop=top+20;
  for(let yy=clothTop;yy<feet;yy++){
   const spread=yy>=feet-4?1:0;
   for(let dx=-3-spread;dx<=3+spread;dx++)paint(cx+dx,yy,dx===0||yy===feet-2&&dx<0?1:9);
  }
  for(let dx=1;dx<=4;dx++)paint(cx+dx,feet,6);
 }
 return true;
}

function drawHiveAttack(){
 if(!hiveDisaster||room!==3)return;
 const f=hiveDisasterFrame();if(f<22)return;
 const p=hiveKickActorPoint(),t=Math.min(1,(f-22)/12),cx=pictureX(p.x),cy=pictureY(p.y)-(f>=48?28-[3,8,12,15][Math.min(3,Math.floor((f-48)/4))]:28);
 for(let i=0;i<16;i++){
  const angle=f*.6+i*2.4,radius=5+(i%4)*2;
  const bx=Math.round(105+(cx-105)*t+Math.cos(angle)*radius),by=Math.round(119+(cy-119)*t+Math.sin(angle)*radius*.7);
  for(const [dx,dy,color]of orchardScoutPixels(Math.floor(f/2),i)){const xx=bx+dx,yy=by+dy;if(xx<0||xx>=160||yy<0||yy>=168)continue;x.fillStyle=color;x.fillRect(xx,yy,1,1)}
 }
}
