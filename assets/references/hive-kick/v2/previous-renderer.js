// A deliberate classic disaster, kept out of persistent puzzle state.
let hiveDisaster=null;
function handleHiveDisaster(text){
 if(!/^(?:kick(?: over)?|boot|topple|knock over) (?:the )?(?:hive|beehive|bee hive|straw hive)(?: over)?$/.test(text))return false;
 if(room!==3){say('There is no hive here to kick.');return true}
 if(!nearObject('wax'))return true;
 const origin={...player},direction=player.x<206?1:-1;
 const target={x:direction>0?176:246,y:200};
 const stand=canStand(target.x,target.y,3)&&clearGroundStep(player.x,player.y,target.x,target.y)?target:{x:player.x,y:player.y};
 hiveDisaster={origin,stand,direction,dead:false};
 startStoryEffect('hiveKick','');return true;
}
function hiveDisasterFrame(){return hiveDisaster?.dead?64:storyAction?.kind==='hiveKick'?storyAction.frame:0}
function finishHiveDisaster(){
 if(!hiveDisaster)return;
 resetStoryEffect();hiveDisaster.dead=true;stopWalking();playing=false;draw();
 say('The bees unanimously reject your royal footwork.\n\nElara has kicked the bucket. The hive was merely the first step.\n\nENTER: retry before the kick.\nF7: restore.  R: restart.');
}
function retryHiveDisaster(){
 const origin=hiveDisaster?.origin;if(!origin)return;
 hiveDisaster=null;resetStoryEffect();stopWalking();popupOpen=false;textPopup.hidden=true;agiMessagePages=[];popupFocus=null;playing=true;room=3;player={...origin};input.value='';document.querySelector('.hud').inert=false;document.querySelector('.footer').inert=false;c.focus();draw();
}
function resetHiveDisaster(){hiveDisaster=null}
function hiveKickActorPoint(){
 const f=hiveDisasterFrame(),t=Math.min(1,f/10),{origin,stand}=hiveDisaster;
 return{x:Math.round(origin.x+(stand.x-origin.x)*t),y:Math.round(origin.y+(stand.y-origin.y)*t)};
}
function drawHiveKickObject(){
 if(!hiveDisaster||room!==3)return false;
 const f=hiveDisasterFrame(),angle=Math.max(0,Math.min(1,(f-14)/14))*Math.PI/2,drop=Math.sin(angle)*12;
 const art=hiveKickArtwork,co=Math.cos(angle),si=Math.sin(angle);
 for(const [xx,yy,color]of art.underlay){x.fillStyle=elaraColors[color];x.fillRect(xx,yy,1,1)}
 // Inverse sampling keeps the tilted woven straw solid at native resolution.
 for(let yy=101;yy<=138;yy++)for(let xx=92;xx<=136;xx++){
  const dx=xx-111,dy=yy-124-drop,sx=Math.round(111+dx*co+dy*si),sy=Math.round(124-dx*si+dy*co);
  if(sx<art.left||sx>=art.left+art.width||sy<art.top||sy>=art.top+art.height)continue;
  const ink=art.pixels[(sy-art.top)*art.width+sx-art.left];if(ink===16)continue;x.fillStyle=elaraColors[ink];x.fillRect(xx,yy,1,1);
 }
 return true;
}
function drawHiveKickHero(){
 if(!hiveDisaster||room!==3)return false;
 const f=hiveDisasterFrame(),p=hiveKickActorPoint(),direction=hiveDisaster.direction;
 // Body silhouettes follow the approved kick sheet; the face and hair are
 // the original profile stencil, at its original scale. No limb stretching.
 if(f>=7&&f<30){
  const keys=[7,9,10,12,13,14,16,19,22,25,27,29];
  let cel=0;for(let i=1;i<keys.length;i++)if(f>=keys[i])cel=i;
  const cx=pictureX(p.x),feet=pictureY(p.y);
  const paint=(dx,dy,ink)=>{const xx=cx+direction*dx,yy=feet+dy;if(xx<0||xx>=160||yy<0||yy>=168)return;x.fillStyle=elaraColors[ink];x.fillRect(xx,yy,1,1)};
  for(const [dx,dy,ink]of hiveKickCels[cel])paint(dx,dy,ink);
  const head=elaraWalkSprites.right[1];
  for(let yy=0;yy<13;yy++)for(let xx=0;xx<8;xx++){const ink=head[yy][xx];if(ink!=='.')paint(xx-4,yy-39,parseInt(ink,16))}
  return true;
 }
 const facing=f<30?(direction>0?'right':'left'):'front',rows=elaraWalkSprites[facing][Math.floor(f/3)%4];
 const collapse=Math.max(0,Math.min(1,(f-48)/13)),angle=collapse*Math.PI/2,co=Math.cos(angle),si=Math.sin(angle),cx=pictureX(p.x),feet=pictureY(p.y);
 for(let yy=0;yy<40;yy++)for(let xx=0;xx<8;xx++){
  const ink=rows[yy][xx];if(ink==='.')continue;
  let dx=xx-4,dy=yy-23;
  const jitter=f>=28&&f<48?Math.round(Math.sin(f*2)*2):0;
  const px=Math.round(cx+dx*co-dy*si)+jitter,py=Math.round(feet-16+dx*si+dy*co+collapse*17);
  if(px<0||px>=160||py<0||py>=168)continue;x.fillStyle=elaraColors[ink];x.fillRect(px,py,1,1);
 }
 return true;
}
function drawHiveAttack(){
 if(!hiveDisaster||room!==3)return;
 const f=hiveDisasterFrame();if(f<22)return;
 const p=hiveKickActorPoint(),t=Math.min(1,(f-22)/12),cx=pictureX(p.x),cy=pictureY(p.y)-(f>=48?3:28);
 for(let i=0;i<16;i++){
  const angle=f*.6+i*2.4,radius=5+(i%4)*2;
  const bx=Math.round(105+(cx-105)*t+Math.cos(angle)*radius),by=Math.round(119+(cy-119)*t+Math.sin(angle)*radius*.7);
  for(const [dx,dy,ink]of hiveBeePixels){const xx=bx+dx,yy=by+dy;if(xx<0||xx>=160||yy<0||yy>=168)continue;x.fillStyle=elaraColors[ink];x.fillRect(xx,yy,1,1)}
 }
}
