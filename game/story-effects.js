// Short, interruptible native-grid payoffs. Progress is committed before playback.
// ENTER advances; a new action settles the effect before applying that action.
let storyAction=null,storyActionTimer=0,storyEffectsFocused=true;
const storyJarCache={};
function resetStoryEffect(){if(storyAction?.sound&&effectSource===storyAction.sound)stopGameSound();if(storyActionTimer)clearInterval(storyActionTimer);storyActionTimer=0;storyAction=null}
function finishStoryEffect(showMessage=true){
 if(!storyAction)return;
 if(storyAction.kind==='hiveKick'){finishHiveDisaster();return}
 if(storyAction.kind==='barrelPrank'&&(showMessage||storyAction.frame>=130))settleBarrelPrank();
 if(storyAction.kind==='chairRest'&&storyAction.stage==='sit'&&showMessage){showChairRestMessage();return}
 const message=storyAction.message,mustAsk=storyAction.kind==='voiceOffered';if(storyAction.kind==='voiceFollow'){if(room===1)flags.voiceDepartureSeen=true;else if(room===8)flags.voiceCourtyardSeen=true;else if(room===0){flags.voiceArrivalSeen=true;flags.voiceDepartureSeen=true;flags.voiceCourtyardSeen=true}}else if(storyAction.kind==='voiceReturned')flags.voiceArrivalSeen=true;resetStoryEffect();draw();if((showMessage||mustAsk)&&message)say(message);
}
function startStoryEffect(kind,message,details={}){
 resetStoryEffect();stopWalking();
 if(kind==='pickup'||kind==='bellTaken'){
  if(kind==='bellTaken')details={pickup:'silver bell',pickupLevel:'bench',pickupTarget:'bell'};
  const target=hotspots[room][details.pickupTarget];player.facing=target&&target[0]<player.x?'left':'right';player.step=0;
  const contact=pickupNativeContacts[details.pickupTarget];if(details.pickupLevel==='bench'&&contact){details.pickupDirection=player.facing==='left'?-1:1;details.stage='approach';details.pickupStand={x:Math.round((contact[0]-details.pickupDirection*6)*2),y:pickupStandingDepth(details.pickupTarget,target)}}
 }else if(kind==='thornsCut'){player.facing='right';player.step=0;details={stage:'approach'};}else if(kind==='echoCaught'){player.facing='right'}else if(['voiceOffered','voiceReturned'].includes(kind)){player.facing='back'}
 storyAction={kind,frame:0,room,message,...details,total:kind==='royalRaspberry'?32:kind==='barrelPrank'?135:kind==='hiveKick'?64:kind==='applePrank'?appleReachFrames+(details.appleTaste?32:44):kind==='beeSting'?18:kind==='windowJump'?44:kind==='chairRest'?12:kind==='courtDance'?(room===2?224:48):kind==='merrinKiss'?44:['mirrorBow','mirrorCurtsy'].includes(kind)?24:kind==='voiceFollow'?(room===0?36:52):kind==='thornsCut'?22:kind==='pickup'?10:kind==='poolRiddleSolved'?28:kind==='voiceReturned'?116:kind==='voiceOffered'?118:kind==='echoCaught'?32:kind==='voiceArrival'?17:14};
 if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){if(kind==='chairRest'){const text=storyAction.message;playChairCreak();resetStoryEffect();say(text+' You get up carefully, one hand on your back.');return}finishStoryEffect();if(kind==='courtDance')playGameSound(room===2?'workshopDance':'courtDance');return}
 if(kind==='courtDance')resumeStoryScore();
 storyActionTimer=setInterval(tickStoryEffect,90);draw();
}
function storyScoreName(){
 if(storyAction?.kind==='royalRaspberry'&&storyAction.frame>=5&&storyAction.frame<17)return 'royalRaspberry';
 if(storyAction?.kind==='barrelPrank'&&storyAction.frame>=20&&storyAction.frame<45)return 'barrelTumble';
 if(storyAction?.kind==='merrinKiss'&&storyAction.frame>=16)return 'kissJig';
 if(storyAction?.kind==='courtDance')return storyAction.room===2?'workshopDance':'courtDance';
 return storyAction?.kind==='chairRest'&&storyAction.stage==='pace'?'chairPace':'';
}
function resumeStoryScore(){
 const score=storyScoreName();if(!score||document.hidden||!storyEffectsFocused||popupOpen||menuOpen)return;
 playGameSound(score,false,(storyAction.frame-(storyAction.kind==='merrinKiss'?16:storyAction.kind==='barrelPrank'?20:storyAction.kind==='royalRaspberry'?5:0))*.09);storyAction.sound=effectSource;storyAction.soundPaused=!soundEnabled;
}
function tickStoryEffect(){
 if(!storyAction)return;
 if(popupOpen||menuOpen||document.hidden||!storyEffectsFocused){
  if(storyScoreName()){if(storyAction.sound&&effectSource===storyAction.sound)stopGameSound();storyAction.soundPaused=true}
  return;
 }
 if(storyScoreName()&&!soundEnabled)storyAction.soundPaused=true;
 if(storyScoreName()&&storyAction.soundPaused&&soundEnabled)resumeStoryScore();
 if(room!==storyAction.room||!playing){resetStoryEffect();return}
 if(storyAction.kind==='chairRest'){tickChairRest();return}
 if(approachHiveKick()||approachBlackthorn()||approachPickup())return;
 storyAction.frame++;
 if(storyAction.kind==='royalRaspberry'&&storyAction.frame===5)resumeStoryScore();
 if(storyAction.kind==='barrelPrank'){if(storyAction.frame===20)resumeStoryScore();if([68,72,76].includes(storyAction.frame))playGameSound('appleSpit',false,0,.35)}
 if(storyAction.kind==='merrinKiss'&&storyAction.frame===16)resumeStoryScore();
 if(storyAction.kind==='hiveKick'){if(storyAction.frame===14)playGameSound('appleDrop');if([23,35,47].includes(storyAction.frame))playGameSound('hiveFury');if(storyAction.frame===61)playGameSound('hiveDoom')}
 if(storyAction.kind==='beeSting'&&[3,7,11,15].includes(storyAction.frame))playGameSound('beeOw',false,0,.65);
 if(storyAction.kind==='windowJump'&&storyAction.frame===4)playGameSound('windowLeap',false,0,.5);
 if(storyAction.kind==='windowJump'&&storyAction.frame===23)playGameSound('windowGust',false,0,.5);
 if(storyAction.kind==='applePrank'){
  const frame=storyAction.frame-appleReachFrames;
  if(!storyAction.appleTaste&&frame===27)playGameSound('appleDrop');
  if(storyAction.appleTaste){
   if([10,14,18].includes(frame))playGameSound('appleChew',false,0,.55);
   if(frame===26)playGameSound('appleSpit',false,0,.65);
  }
 }
 if(storyAction.kind==='thornsCut'&&thornSnipFrames.includes(storyAction.frame))playGameSound('thornSnip');
 if(storyAction.kind==='voiceFollow'&&room===0&&storyAction.frame===27)playGameSound('voiceArrival');
 if(storyAction.kind==='voiceOffered'&&storyAction.frame===18)playGameSound('mirrorRemembers');
 if(storyAction.kind==='echoCaught'&&storyAction.frame===22)playGameSound('jarLeak');
 if(storyAction.kind==='voiceReturned'&&storyAction.frame===39)playGameSound('voiceFlight');
 if((storyAction.kind==='voiceArrival'&&storyAction.frame===11)||(storyAction.kind==='voiceReturned'&&storyAction.frame===99))playGameSound('voiceArrival');
 if(storyAction.frame>=storyAction.total){finishStoryEffect();return}draw();
}
const voiceReleaseText='"Merrin!" you call. The mirror whispers, "Then let his voice be his again." A warm reply rises from the glass: "About time!"';
function startVoiceFollow(){
 const message=room===0?'The golden voice slips into Merrin. He touches his throat, clears it, and laughs. "Ah! That sounds more like me!"':'';
 startStoryEffect('voiceFollow',message);playGameSound('voiceFlight');
}
function maybeVoiceArrival(){
 if(!flags.voiceReturned||flags.voiceArrivalSeen||flags.complete)return;
 if((room===1&&!flags.voiceDepartureSeen)||(room===8&&!flags.voiceCourtyardSeen)||room===0)startVoiceFollow();
}
function drawWaitingVoice(){
 // Once it crosses the threshold it is outside this room. The next leg
 // begins only when Rosella enters the courtyard or garden herself.
}
function followVoicePoint(frame,view=room){
 if(view===1)return storyArc({x:73,y:77},{x:80,y:184},Math.min(1,frame/48),8);
 if(view===8)return storyArc({x:126,y:110},{x:80,y:184},Math.min(1,frame/48),10);
 if(view===0&&frame<27)return storyArc({x:80,y:111},{x:31,y:112},Math.min(1,frame/26),14);
 return null;
}
function drawFollowVoice(frame){
 const point=followVoicePoint(frame);
 if(point){
  drawVoiceWisp(point.x,point.y,'#ffff55',frame);
  if(frame%3&&point.x+3>=0&&point.x+3<160&&point.y+2>=0&&point.y+2<168){x.fillStyle='#55ffff';x.fillRect(point.x+3,point.y+2,1,1)}
 }else if(room===0)storyGlints(31,112,frame,'#ffff55');
}
function storyJarPixels(name){
 if(!storyJarCache[name]){const bytes=Uint8Array.from(atob(inventoryPictures[name]),c=>c.charCodeAt(0)),pixels=[];for(let i=0;i<bytes.length;i+=2)for(let n=0;n<bytes[i];n++)pixels.push(bytes[i+1]);storyJarCache[name]=pixels}
 return storyJarCache[name];
}
function drawStoryJar(name,left,top,width=12,height=16,clip=null){
 const pixels=storyJarPixels(name);
 for(let yy=0;yy<height;yy++)for(let xx=0;xx<width;xx++){
  const color=pixels[Math.floor(yy*28/height)*32+Math.floor(xx*32/width)];
  if(color===15||color===undefined||(clip&&!insidePolygon(left+xx,top+yy,clip)))continue;
  x.fillStyle=rosellaColors[color];x.fillRect(left+xx,top+yy,1,1);
 }
 return{x:left+6,y:top+2};
}
function mirrorJarPose(reflected=false){
 const frame=storyAction?.frame||0,lift=storyAction?.kind==='voiceOffered'?Math.min(2,Math.floor(frame/4)):2;
 if(reflected){const pose=mirrorReflectionPose();if(!pose)return null;return{left:pose.left+pose.width,top:pose.top+Math.round(pose.height*.44)-lift,width:6,height:10}}
 return{left:pictureX(player.x)+5,top:pictureY(player.y)-25-lift,width:8,height:12};
}
function heldStoryJar(){return storyAction&&['voiceOffered','voiceReturned'].includes(storyAction.kind)?mirrorJarPose():{left:pictureX(player.x)+1,top:pictureY(player.y)-27}}
function storyHeldJarName(){
 const kind=storyAction.kind,frame=storyAction.frame;
 if(kind==='echoCaught')return frame<9?'glass jar':'echo jar';
 if(kind==='voiceReturned')return frame<4?'voice jar':'glass jar';
 return 'voice jar';
}
function drawStoryHero(px,py){
 if(storyAction?.kind==='barrelPrank')return true;
 if(drawHiveKickHero())return true;
 if(drawApplePrankHero(px,py))return true;
 if(drawBeeStingHero(px,py))return true;
 if(drawWindowJumpHero())return true;
 if(drawChairRestHero(px,py))return true;
 if(drawPlayfulHero(px,py))return true;
 if(drawPickupHero(px,py)||drawThornCutHero(px,py))return true;
 if(!storyAction||!['echoCaught','voiceOffered','voiceReturned'].includes(storyAction.kind))return drawCarriedEchoHero(px,py);
 const rows=rosellaWalkSprites[player.facing][player.step%4],left=pictureX(px)-4,top=pictureY(py)-39;
 ellipse(px,py+1,7,1,'#000000');
 for(let row=0;row<40;row++)for(let col=0;col<8;col++){
  const ink=rows[row][col];if(ink==='.')continue;
  if(row>=15&&row<=23&&col>=6&&['c','f'].includes(ink))continue;
  x.fillStyle=rosellaColors[parseInt(ink,16)];x.fillRect(left+col,top+row,1,1);
 }
 const jar=heldStoryJar(),mirror=['voiceOffered','voiceReturned'].includes(storyAction.kind);
 if(mirror){
  galleryInk([[left+6,top+15],[left+7,jar.top+6],[jar.left+1,jar.top+6]],'#ff5555');
  x.fillStyle='#ffffff';x.fillRect(left+6,top+14,2,2);
  drawMirrorHandJar(jar,storyHeldJarName()==='glass jar',false);
 }else{
  galleryInk([[left+6,top+15],[left+7,top+19],[left+10,top+19]],'#ff5555');
  x.fillStyle='#ffffff';x.fillRect(left+6,top+14,2,2);
  drawStoryJar(storyHeldJarName(),jar.left,jar.top);
 }
 return true;
}
const mirrorGlassClip=[[63,48],[72,38],[82,48],[82,101],[63,101]];
function mirrorJarInk(points,color){
 x.fillStyle=color;
 for(let i=1;i<points.length;i++){
  let[px,py]=points[i-1];const[tx,ty]=points[i],dx=Math.abs(tx-px),dy=-Math.abs(ty-py),sx=px<tx?1:-1,sy=py<ty?1:-1;let error=dx+dy;
  for(;;){if(insidePolygon(px,py,mirrorGlassClip))x.fillRect(px,py,1,1);if(px===tx&&py===ty)break;const twice=error*2;if(twice>=dy){error+=dy;px+=sx}if(twice<=dx){error+=dx;py+=sy}}
 }
}
function drawMirrorHandJar(pose,empty,reflected){
 const {left,top,width,height}=pose,frame=storyAction?.frame??echoMistFrame;
 const gold=reflected?'#aaaaaa':'#ffff55',edge=reflected?'#555555':'#aa5500';
 const dot=(a,b,color)=>{const px=left+Math.round(a*(width-1)/7),py=top+Math.round(b*(height-1)/11);if(reflected&&!insidePolygon(px,py,mirrorGlassClip))return;x.fillStyle=color;x.fillRect(px,py,1,1)};
 // Purpose-drawn small cel: a narrow neck, round shoulders and a flat base.
 for(let row=2;row<=10;row++)for(let col=0;col<8;col++){
  if((row===2||row===10)&&[0,7].includes(col))continue;
  const boundary=col===0||col===7||row===10;
  dot(col,row,boundary?edge:empty?'#555555':'#0000aa');
 }
 for(let col=1;col<=6;col++)dot(col,1,empty?'#aaaaaa':'#aa0000');
 for(let row=3;row<=8;row++)dot(1,row,reflected?'#55ffff':'#ffffff');
 for(let col=2;col<=5;col++)dot(col,10,gold);
 if(!empty){
  const hue=['#55ffff','#ffff55','#ffffff'][Math.floor(frame/6)%3];
  for(let row=4;row<=8;row++)dot(3+Math.round(Math.sin(row+frame*.27)),row,hue);
  dot(5,3,reflected?'#00aaaa':'#ff55ff');
 }
}
function drawStoryMirrorJar(){
 if(!storyAction||!['voiceOffered','voiceReturned'].includes(storyAction.kind))return;
 const jar=mirrorJarPose(true);if(!jar)return;
 const pose=mirrorReflectionPose();mirrorJarInk([[pose.left+pose.width-1,pose.top+Math.round(pose.height*.43)],[jar.left,jar.top+5]],'#ff5555');
 drawMirrorHandJar(jar,storyHeldJarName()==='glass jar',true);
}
function drawMirrorJarExchange(frame){
 const actual=mirrorJarPose(),reflection=mirrorJarPose(true);if(!reflection)return;
 const source={x:actual.left+4,y:actual.top},dest={x:reflection.left+3,y:reflection.top+1};
 // Successive motes travel along a single curved connection, rather than
 // floating as an unrelated musical symbol over Rosella's reflection.
 if(frame>=8&&frame<39){
  for(let i=0;i<7;i++){
   const t=((frame-8+i*4)%28)/27,p=storyArc(source,dest,t,9);
   x.fillStyle=i%3?'#ffff55':'#ffffff';x.fillRect(p.x,p.y,1,1);
   if(i%3===0){x.fillStyle='#55ffff';x.fillRect(p.x-1,p.y,1,1)}
  }
 }
 if(frame>=18){
  const radius=2+Math.floor((frame-18)/4)%5;
  const center={x:73,y:76};
  const points=[];for(let i=0;i<=16;i++){const a=i*Math.PI/8;points.push([center.x+Math.round(Math.cos(a)*radius),center.y+Math.round(Math.sin(a)*radius*.7)])}
  mirrorJarInk(points,frame<38?'#55ffff':'#aaaaaa');
 }
 if(frame>=38){
  const phase=(frame-38)*.22;
  mirrorJarInk([[72,70],[74,72],[71,75],[74,78],[72,81]],'#ffff55');
  for(let i=0;i<3;i++){const xx=Math.round(73+Math.cos(phase+i*2.1)*6),yy=Math.round(76+Math.sin(phase+i*2.1)*8);mirrorJarInk([[xx,yy],[xx,yy]],'#ffffff')}
 }
}

function drawVoiceWisp(nx,ny,color,phase=0){
 const cel=Math.floor(phase/3)%8,angle=cel*Math.PI/4;
 const dot=(dx,dy,c)=>{const xx=Math.round(nx+dx),yy=Math.round(ny+dy);if(xx>=0&&xx<160&&yy>=0&&yy<168){x.fillStyle=c;x.fillRect(xx,yy,1,1)}};
 // A little breath, carried on three flowing filaments. No musical stem,
 // face, or dark border: the center holds while the whisper curls around it.
 for(let j=0;j<12;j++){
  const xx=-13+j,fade=j<4?'#00aaaa':'#55ffff';
  const yy=Math.round(Math.sin(j*.48-angle)*2*(1-j/15));
  dot(xx,yy,fade);
  if(j>3)dot(xx,yy-2-Math.round(Math.sin(angle+j*.25)),j>8?'#ffffff':'#55ffff');
  if(j>5)dot(xx,yy+2,j>9?'#ffffff':'#00aaaa');
 }
 const swell=[0,0,1,1,1,0,0,0][cel];
 // Rounded, uneven wisps suggest escaping speech instead of a solid orb.
 for(const [dx,dy]of [[-3,-1],[-2,-2],[0,-3],[2,-2],[3,-1],[4,0],[3,1],[1,2],[-1,2],[-3,1]])dot(dx+(dx>0?swell:0),dy,'#55ffff');
 for(const [dx,dy]of [[-2,-1],[-1,-1],[0,-1],[1,-1],[-2,0],[-1,0],[0,0],[1,0],[2,0],[-1,1],[0,1]])dot(dx,dy,'#ffffff');
 // Two broken wave fronts expand outward and dissolve into the next breath.
 for(let ring=0;ring<2;ring++){
  const r=4+(cel+ring*4)%8;
  for(const t of [-.8,-.4,0,.4,.8]){
   if((cel+ring)%3===0&&Math.abs(t)>.5)continue;
   dot(2+Math.cos(t)*r,Math.sin(t)*r*.55,ring?'#00aaaa':'#55ffff');
  }
 }
 dot(-8, -4-Math.round(Math.sin(angle)), '#55ffff');
 if(cel===2||cel===3)dot(-5,-5,'#ffffff');
}
function storyArc(from,to,t,height=5){return{x:Math.round(from.x+(to.x-from.x)*t),y:Math.round(from.y+(to.y-from.y)*t-Math.sin(t*Math.PI)*height)}}
function storyGlints(cx,cy,frame,color){
 const d=3+frame%3;x.fillStyle=color;
 for(const [xx,yy]of [[cx-d,cy],[cx+d,cy-1],[cx,cy-d],[cx+1,cy+d]])x.fillRect(xx,yy,1,1);
}
function drawBellJar(){
 if(room!==7||!bellAction||!flags.jarTaken||bellAction.stage!=='jump')return;
 const frame=bellAction.frame,left=pictureX(player.x)+7,feet=pictureY(player.y),top=feet-14;
 x.fillStyle='#000000';x.fillRect(left+3,feet,7,1);
 drawStoryJar(flags.bellRung?'voice jar':flags.jarSealed?'sealed echo':'glass jar',left,top);
 if(['voice','repeat'].includes(bellAction.outcome)&&frame>=5&&frame<=15){
  const color=frame<7?'#55ffff':'#ffff55';storyGlints(left+6,top+7,frame,color);
  if(frame>=9){galleryInk([[left+7,top-5],[left+7,top-10],[left+10,top-9]],color);x.fillStyle=color;x.fillRect(left+5,top-5,3,2);}
 }
}
function drawMerrinRecovery(px,py){
 if(!storyAction||!((storyAction.kind==='voiceArrival'&&storyAction.frame>=10)||(storyAction.kind==='voiceReturned'&&storyAction.frame>=97)||(storyAction.kind==='voiceFollow'&&room===0&&storyAction.frame>=27)))return;
 const left=pictureX(px)-4,top=pictureY(py)-37,frame=storyAction.frame;
 galleryInk([[left+6,top+15],[left+8,top+12],[left+7,top+10]],'#ff5555');
 x.fillStyle=frame%2?'#000000':'#ffffff';x.fillRect(left+5,top+7,2,1);
}
function drawStoryEffects(){
 drawHiveAttack();drawWorkshopMice();drawBellJar();drawLeakingJar();drawWaitingVoice();if(drawJarCloseup())return;if(!storyAction)return;
 const {kind,frame,total}=storyAction,t=frame/(total-1),jar=heldStoryJar(),mouth={x:jar.left+6,y:jar.top+2};
 if(kind==='thornsCut'){drawCutThornDebris();
 }else if(kind==='bellTaken'||kind==='pickup'){
  // Item and reaching hands share Rosella's normal scene priority.
 }else if(kind==='poolRiddleSolved'){
  // The answer's water and sparks render with the pool, before actors.

 }else if(kind==='echoCaught'){
  if(frame<10){const p=storyArc({x:95,y:84},mouth,Math.min(1,frame/9),6);drawVoiceWisp(p.x,p.y,'#55ffff',frame)}
  else storyGlints(mouth.x,mouth.y+5,frame,'#55ffff');
 }else if(kind==='voiceOffered'){
  if(frame>=18)paintMirrorCloseup(frame-18);else drawMirrorJarExchange(frame);
 }else if(kind==='voiceFollow'){
  drawFollowVoice(frame);
 }else if(kind==='voiceReturned'){
  drawVoiceJourney(frame);
 }else if(kind==='voiceArrival'){
  if(frame<=11){const p=storyArc({x:79,y:111},{x:32,y:112},Math.min(1,frame/11),14);drawVoiceWisp(p.x,p.y,'#ffff55',frame)}
  else storyGlints(31,112,frame,'#ffff55');
 }
}
window.addEventListener('blur',()=>{storyEffectsFocused=false});window.addEventListener('focus',()=>{storyEffectsFocused=true;resumeStoryScore()});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)resumeStoryScore()});
// Compact native lettering, suspended over the pool rather than a UI label.
let echoMistFrame=0;
function drawFloatingName(frame){
 const letters={M:['10001','11011','10101','10001','10001','10001','10001'],E:['11111','10000','10000','11110','10000','10000','11111'],R:['11110','10001','10001','11110','10100','10010','10001'],I:['111','010','010','010','010','010','111'],N:['10001','11001','11001','10101','10011','10011','10001']};
 const phase=echoMistFrame%24,reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
 const gathered=reduced?1:phase<4?0:phase<9?(phase-3)/5:phase<17?1:phase<23?1-(phase-16)/6:0;
 const points=[];let left=85;
 for(const letter of 'MERRIN'){const rows=letters[letter];rows.forEach((row,y)=>[...row].forEach((on,col)=>{if(on==='1')points.push([left+col,86+y])}));left+=rows[0].length+1}
 points.forEach(([tx,ty],i)=>{
  // Each letter pixel comes from a stable strand, so it gathers and loosens
  // instead of flashing into an unrelated replacement picture.
  if(gathered<.4&&i%3!==0)return;
  const u=(i%25)/24,lane=Math.floor(i/25)%3;
  const mx=80+Math.round(u*46),my=85+lane*3+Math.round(Math.sin(u*Math.PI*2+lane+phase*Math.PI/12)*2);
  const px=Math.round(mx+(tx-mx)*gathered),py=Math.round(my+(ty-my)*gathered);
  if(gathered>.7){x.fillStyle='#00aaaa';x.fillRect(px,py+1,1,1)}
  x.fillStyle=gathered>.7?'#ffffff':i%11===0?'#ffffff':i%2?'#55ffff':'#00aaaa';x.fillRect(px,py,1,1);
 });
 if(gathered<.5){const drift=Math.round(Math.sin(phase*Math.PI/12));x.fillStyle='#55ffff';x.fillRect(78,88+drift,2,1);x.fillRect(128,87-drift,1,1)}
}
function carryingOpenEcho(){return playing&&!swimState.active&&!swimState.dead&&!bridgeFall&&flags.echoCaught&&!flags.jarSealed&&!flags.voiceReturned&&!storyAction&&!bellAction}
function heldEchoPose(px=player.x,py=player.y){const direction=player.facing==='left'?-1:1;return{left:pictureX(px)+(direction>0?5:-11),top:pictureY(py)-24,width:7,height:10,direction}}
function drawCarriedEchoHero(px,py){
 if(!carryingOpenEcho())return false;
 const pose=heldEchoPose(px,py),rows=rosellaWalkSprites[player.facing][player.step%4],left=pictureX(px)-4,top=pictureY(py)-39;
 ellipse(px,py+1,7,1,'#000000');
 for(let row=0;row<40;row++)for(let col=0;col<8;col++){const ink=rows[row][col];if(ink==='.')continue;if(row>=15&&row<=23&&['c','f'].includes(ink)&&(pose.direction>0?col>=6:col<=1))continue;x.fillStyle=rosellaColors[parseInt(ink,16)];x.fillRect(left+col,top+row,1,1)}
 const sx=left+(pose.direction>0?6:1),handX=pose.left+(pose.direction>0?1:5),handY=pose.top+6;
 galleryInk([[sx,top+15],[sx+pose.direction*2,top+20],[handX,handY]],'#ff5555');
 x.fillStyle='#ffffff';x.fillRect(sx,top+14,1,2);
 drawMirrorHandJar(pose,false,false);
 x.fillStyle='#aaaaaa';x.fillRect(pose.left+1,pose.top,5,1);x.fillStyle='#0000aa';x.fillRect(pose.left+2,pose.top,3,1);
 return true;
}
function drawLeakingJar(){
 if(!carryingOpenEcho())return;
 const jar=heldEchoPose(),phase=Math.floor(echoMistFrame/3)%8;
 for(let strand=0;strand<2;strand++){
  const points=[];for(let i=0;i<7;i++){const yy=jar.top-i*2,xx=jar.left+3+Math.round(Math.sin(i*.85+phase*.65+strand*2)*(.5+i*.25));points.push([xx,yy])}
  galleryInk(points,strand?'#00aaaa':'#55ffff');
 }
 const rise=phase*2;x.fillStyle='#ffffff';x.fillRect(jar.left+3+Math.round(Math.sin(phase)),jar.top-rise,1,1);
}
// Before the riddle is answered, silver marks gather on the actual surface.
// They suggest listening/writing without spelling out the answer or a name.
function drawAwakenedPool(frame){
 const still=window.matchMedia('(prefers-reduced-motion: reduce)').matches,phase=still?8:frame%24;
 const ink=(px,py,color)=>{if(insidePolygon(px,py,poolRippleSurface)){x.fillStyle=color;x.fillRect(px,py,1,1)}};
 const radius=4+Math.floor(phase/2);
 for(let i=0;i<40;i++){
  if((i+phase)%7===0)continue;
  const angle=i*Math.PI/20;
  ink(Math.round(poolRippleCenter.x+Math.cos(angle)*radius),Math.round(poolRippleCenter.y+Math.sin(angle)*radius*.23),'#ffffff');
 }
 // Three small silver clusters flicker like half-formed writing.
 for(const [left,top,length] of [[90,101,3],[98,103,4],[105,101,3]]){
  for(let n=0;n<length;n++)ink(left+n,top,((phase+n+left)%12<3)?'#ffffff':'#aaaaaa');
 }
 const glint=phase<12?92:107,gy=phase<12?100:104;
 ink(glint,gy,'#ffffff');
 if(phase%12<4){ink(glint-1,gy,'#55ffff');ink(glint+1,gy,'#55ffff');ink(glint,gy-1,'#ffffff')}
}
function drawEnchantedPool(frame){
 const phase=frame%24;
 for(let wave=0;wave<3;wave++){
  const r=3+(phase+wave*8)%24;
  for(let i=0;i<40;i++){const a=i*Math.PI/20,px=Math.round(poolRippleCenter.x+Math.cos(a)*r),py=Math.round(poolRippleCenter.y+Math.sin(a)*r*.20);if(insidePolygon(px,py,poolRippleSurface)){x.fillStyle=wave===0?'#ffffff':wave===1?'#00aaaa':'#5555ff';x.fillRect(px,py,1,1)}}
 }
}
// ImageGen storyboard redrawn with integer PIC shapes and the 16 EGA inks.
// Four distinct beats: echo, arriving bell note, illumination, settled voice.
function drawJarCloseup(){
 if(!bellAction||bellAction.stage!=='jar')return false;
 paintJarTransformation(bellAction.frame);return true;
}
function jarTransformationColors(frame){
 // Hold each hue long enough to read as enchanted glass, rather than flashing.
 const phase=Math.min(4,Math.floor(frame/16));
 return[
  {glass:'#00aaaa',rim:'#55ffff',field:'#55ffff',mist:'#0000aa',light:'#5555ff'},
  {glass:'#0000aa',rim:'#5555ff',field:'#5555ff',mist:'#55ffff',light:'#ffffff'},
  {glass:'#aa00aa',rim:'#ff55ff',field:'#0000aa',mist:'#ff55ff',light:'#ffffff'},
  {glass:'#00aaaa',rim:'#55ffff',field:'#0000aa',mist:'#55ffff',light:'#ffff55'},
  {glass:'#aa5500',rim:'#ffff55',field:'#0000aa',mist:'#ffff55',light:'#ffffff'}
 ][phase];
}
const jarTransformationFrameCount=120;
function paintJarTransformation(frame){
 const cinematicFrame=frame;
 frame=Math.min(79,Math.floor(frame*80/105));
 const colors=jarTransformationColors(frame);
 // A slim gilt inset frames the cinematic, echoing the belfry's oak and brass.
 x.fillStyle='#aa5500';x.fillRect(22,19,116,130);
 x.fillStyle='#000000';x.fillRect(24,22,112,124);
 drawJarAura(cinematicFrame);
 // The close-up shares the belfry's wooden floor. Plank joints recede beneath
 // the glass, and a fixed contact shadow keeps the jar planted throughout.
 x.fillStyle='#aa5500';x.fillRect(25,120,110,22);
 galleryInk([[25,120],[135,120]],'#ffff55');
 for(const joint of [[[43,121],[34,141]],[[72,121],[68,141]],[[101,121],[112,141]]])galleryInk(joint,'#000000');
 galleryInk([[26,133],[134,133]],'#000000');
 galleryInk([[29,128],[38,128]],'#ffff55');galleryInk([[118,137],[129,137]],'#ffff55');
 x.fillStyle='#000000';x.fillRect(61,120,38,3);x.fillRect(66,123,28,1);
 drawJarFloorResonance(cinematicFrame);
 const shape=[[65,65],[65,58],[95,58],[95,65],[100,70],[100,115],[96,120],[64,120],[60,115],[60,70],[65,65]];
 for(let yy=58;yy<=120;yy++)for(let xx=60;xx<=100;xx++)if(insidePolygon(xx+.5,yy+.5,shape)){x.fillStyle=colors.glass;x.fillRect(xx,yy,1,1)}
 galleryInk(shape,colors.rim);
 // The luminous contents fill a curved inner vessel, never a rectangular label.
 const innerGlass=[[68,64],[92,64],[92,67],[97,73],[97,112],[95,115],[92,117],[68,117],[65,115],[63,112],[63,73],[68,67]];
 for(let yy=64;yy<=117;yy++)for(let xx=63;xx<=97;xx++)if(insidePolygon(xx+.5,yy+.5,innerGlass)){x.fillStyle=colors.field;x.fillRect(xx,yy,1,1)}
 // Three drifting ribbons coil around one another inside the glass. Their
 // widths and orbit tighten as the echo becomes a distinct, living voice.
 const settle=Math.max(0,Math.min(1,(frame-58)/20));
 const dot=(px,py,ink)=>{px=Math.round(px);py=Math.round(py);if(px>=68&&px<=93&&py>=75&&py<=111){x.fillStyle=ink;x.fillRect(px,py,1,1)}};
 for(let strand=0;strand<(cinematicFrame>=94?1:3);strand++){
  for(let step=0;step<39;step++){
   const yy=75+step*.92,angle=yy*.19+(cinematicFrame>=94?10.2+Math.sin(cinematicFrame*.12)*.15:frame*.13)+strand*2.1;
   const radius=(7+Math.sin(yy*.14+frame*.07)*3)*(1-settle*.38);
   const xx=80+Math.sin(angle)*radius;
   if((step+strand+Math.floor(frame/4))%7!==0)dot(xx,yy,strand===0?colors.light:colors.mist);
   if(strand===0&&step%3===0)dot(xx+1,yy,colors.rim);
  }
 }
 for(let i=0;i<(cinematicFrame>=94?3:9);i++){
  const phase=frame*.075+i*2.4,px=80+Math.sin(phase)*(5+i%3*3),py=111-((frame*.65+i*4)%35);
  dot(px,py,i%3===0?'#ffffff':colors.mist);
 }
 // For a moment the tangled sound suggests a singing face, then dissolves
 // into the single voice ribbon. It never becomes a second solid character.
 if(cinematicFrame>=57&&cinematicFrame<88){
  const reveal=Math.min(1,(cinematicFrame-57)/9,(88-cinematicFrame)/8);
  const face=[[73,85],[74,81],[78,79],[83,79],[87,82],[88,89],[86,96],[82,99],[77,98],[73,93],[73,85]];
  for(let i=1;i<face.length;i++)if((i+Math.floor(cinematicFrame/3))%4!==0&&i/face.length<=reveal+.25)galleryInk(face.slice(i-1,i+1),colors.mist);
  if(reveal>.65){dot(77,86,'#ffffff');dot(84,86,'#ffffff');galleryInk([[78,92],[80,94],[83,92]],colors.light)}
 }
 // Glints remain attached to the glass; the wax is never opened by this spell.
 galleryInk([[68,68],[65,73],[65,86]],'#ffffff');
 galleryInk([[65,91],[65,105]],colors.rim);
 galleryInk([[66,112],[69,116],[90,116],[94,113]],'#ffffff');
 x.fillStyle='#aa0000';x.fillRect(63,55,34,8);x.fillRect(69,62,5,4);
 x.fillStyle='#ff5555';x.fillRect(65,55,30,2);x.fillRect(68,58,3,4);
 // Forked electrical filaments jump from the rim, growing out then drawing
 // back into the jar. Only the narrow arcs change brightness, never the scene.
 if(frame>=18&&frame<62){
  const reach=Math.min(1,(frame-17)/9,(62-frame)/10),cel=Math.floor(frame/3)%4;
  for(const side of [-1,1]){
   const root=side<0?64:96,points=[[root,57]];
   for(let j=1;j<=6;j++)points.push([Math.round(root+side*(j*4+(j%2?2:-2))*reach),Math.round(57-(j*3+(j%2?cel:3-cel))*reach)]);
   galleryInk(points,cel===1?'#55ffff':'#ffffff');
   const fork=points[3];galleryInk([fork,[fork[0]+side*5,fork[1]-1],[fork[0]+side*3,fork[1]-7]],colors.rim);
  }
 }
 if(frame>=48){
  const turn=(frame-48)*.12;
  for(let i=0;i<5;i++){
   const angle=turn+i*Math.PI*2/5,cx=Math.round(80+Math.cos(angle)*27),cy=Math.round(88+Math.sin(angle)*34);
   x.fillStyle=i%2?'#55ffff':'#ffff55';x.fillRect(cx,cy,1,1);
   if((i+Math.floor(frame/5))%3===0){galleryInk([[cx-1,cy],[cx+1,cy]],'#ffffff');galleryInk([[cx,cy-1],[cx,cy+1]],'#ffffff')}
  }
 }
 drawArrivingBellNote(cinematicFrame);
 if(cinematicFrame>=92){
  // Two small glints breathe around the settled voice, never flash the screen.
  const phase=Math.floor(cinematicFrame/6)%4;
  for(const [gx,gy]of [[72,82],[89,104]]){
   x.fillStyle=phase<2?'#ffff55':'#ffffff';x.fillRect(gx,gy,1,1);
   if(phase===1)galleryInk([[gx-1,gy],[gx+1,gy]],'#ffff55');
  }
 }
 // Orbiting sparks remain above the resting surface, never erase its weight.
 x.fillStyle='#000000';x.fillRect(61,121,38,2);x.fillRect(66,123,28,1);
 // One native-pixel gold rule, with restrained white corner glints.
 galleryInk([[23,20],[136,20],[136,147],[23,147],[23,20]],'#ffff55');
 for(const [cx,cy]of [[23,20],[136,20],[23,147],[136,147]]){x.fillStyle='#ffffff';x.fillRect(cx,cy,1,1)}
}

function drawJarFloorResonance(frame){
 if(frame<23||frame>108)return;
 const fade=Math.min(1,(frame-23)/12,(109-frame)/13);
 // Staggered expanding ellipses carry each bell pulse across the floor.
 for(let wave=0;wave<3;wave++){
  const age=(frame-23+wave*13)%39,radius=5+age*.95;
  for(let step=0;step<48;step++){
   if((step+wave)%5===0)continue;
   const angle=step*Math.PI/24,px=Math.round(80+Math.cos(angle)*radius),py=Math.round(122+Math.sin(angle)*radius*.22);
   if(px<26||px>134||py<124||py>141||age>33*fade)continue;
   x.fillStyle=wave===1?'#ffff55':'#ff5555';x.fillRect(px,py,1,1);
  }
 }
}

// Separate native-pixel beats keep the transformation legible at PIC resolution.
function drawArrivingBellNote(frame){
 if(frame>24)return;
 const t=Math.min(1,frame/24),px=Math.round(32+48*t),py=Math.round(40+37*t-13*Math.sin(Math.PI*t));
 for(let trail=1;trail<=4;trail++){
  const q=t-trail*.055;if(q<0)continue;
  const xx=Math.round(32+48*q),yy=Math.round(40+37*q-13*Math.sin(Math.PI*q));
  x.fillStyle=trail%2?'#aa5500':'#ffff55';x.fillRect(xx,yy,1,1);
 }
 x.fillStyle='#ffff55';x.fillRect(px-2,py,3,2);
 galleryInk([[px,py],[px,py-7],[px+3,py-5]],'#ffffff');
}
function drawJarAura(frame){
 if(frame<24||frame>103)return;
 const power=Math.min(1,(frame-24)/15,(104-frame)/16);
 for(let ring=0;ring<2;ring++){
  const radius=26+ring*9;
  for(let i=0;i<50;i++){
   if((i+Math.floor(frame/3)+ring*5)%9>3)continue;
   const angle=i*Math.PI/25+frame*.035*(ring?-1:1);
   const px=Math.round(80+Math.cos(angle)*radius*power),py=Math.round(88+Math.sin(angle)*(radius+9)*power);
   // The jar itself is painted afterward: the orbit naturally passes behind it.
   x.fillStyle=ring?'#00aaaa':'#5555ff';x.fillRect(px,py,1,1);
  }
 }
 // Bright particles spiral inward as the scattered echo gathers into a voice.
 for(let i=0;i<6;i++){
  const t=((frame-24+i*11)%66)/66,angle=t*5+i*Math.PI/3;
  const radius=(34-22*t)*power,px=Math.round(80+Math.cos(angle)*radius),py=Math.round(89+Math.sin(angle)*radius*1.2);
  x.fillStyle=i%2?'#ffff55':'#55ffff';x.fillRect(px,py,1,1);
 }
}

// The visible cyan surface is smaller and higher than the outer stone rim.
const poolRippleCenter={x:99,y:102};
const poolRippleSurface=[[69,102],[78,98],[96,97],[118,99],[129,102],[130,105],[121,108],[102,110],[83,106],[73,104]];
function drawPoolAnswerSparks(frame){
 if(frame>=4&&frame<22)for(let i=0;i<3;i++){const px=90+i*9+Math.round(Math.sin(frame*.35+i)*2),py=98-Math.floor((frame-4)/2)+i%2;x.fillStyle=i===1?'#ff55ff':'#ffff55';x.fillRect(px,py,1,1)}
}
function drawPoolAnswerRipple(frame){
 const radius=3+Math.min(15,frame);

 for(let i=0;i<64;i++){
  const angle=i*Math.PI/32,px=Math.round(poolRippleCenter.x+Math.cos(angle)*radius),py=Math.round(poolRippleCenter.y+Math.sin(angle)*radius*.22);
  if(insidePolygon(px,py,poolRippleSurface)){x.fillStyle=['#ffffff','#ffff55','#ff55ff','#55ffff'][Math.floor(frame/3)%4];x.fillRect(px,py,1,1)}
 }
}

// Cutaways render the real rooms without moving Rosella or invoking exits.
// Only the camera follows the voice; restore render state before returning.
function drawVoiceCutaway(view){
 const originalRoom=room,originalProps=sceneProps;
 try{
  room=view;sceneProps=[];
  if(view===0)garden();else drawExpandedRoom();
  queueRoomObjects();sceneProps.sort((a,b)=>a.depth-b.depth).forEach(item=>item.paint());
 }finally{room=originalRoom;sceneProps=originalProps}
}
function voiceJourneyPoint(frame){
 if(frame<39)return storyArc({x:73,y:77},{x:80,y:163},Math.max(0,Math.min(1,(frame-10)/28)),9);
 if(frame<69)return storyArc({x:128,y:91},{x:80,y:163},(frame-39)/29,10);
 if(frame<98)return storyArc({x:80,y:111},{x:31,y:112},(frame-69)/28,14);
 return null;
}
function drawVoiceJourney(frame){
 if(frame>=69)drawVoiceCutaway(0);else if(frame>=39)drawVoiceCutaway(8);
 const p=voiceJourneyPoint(frame);
 if(p){
  drawVoiceWisp(p.x,p.y,'#ffff55',frame);
  if(frame%3!==0){x.fillStyle='#ffffff';x.fillRect(p.x+4,p.y-2,1,1)}
 }else storyGlints(31,112,frame,'#ffff55');
}

// Mirror recognition close-up: hand-authored native PIC shapes and clipped mist.
const mirrorCloseGlass=[[42,138],[42,46],[51,35],[65,27],[80,20],[95,27],[109,35],[118,46],[118,138]];
function paintMirrorCloseup(frame){
 const rect=(a,b,w,h,c)=>{x.fillStyle=c;x.fillRect(a,b,w,h)};
 const shape=(points,c)=>{
  const minX=Math.min(...points.map(p=>p[0])),maxX=Math.max(...points.map(p=>p[0])),minY=Math.min(...points.map(p=>p[1])),maxY=Math.max(...points.map(p=>p[1]));
  for(let yy=minY;yy<=maxY;yy++)for(let xx=minX;xx<=maxX;xx++)if(insidePolygon(xx+.5,yy+.5,points))rect(xx,yy,1,1,c);
 };
 const glassDot=(a,b,c)=>{a=Math.round(a);b=Math.round(b);if(insidePolygon(a+.5,b+.5,mirrorCloseGlass))rect(a,b,1,1,c)};
 rect(19,3,122,162,'#000000');
 // Bilaterally matched carving: narrow lit edges, blue jewel and a firm base.
 shape([[30,144],[30,44],[25,40],[32,33],[41,33],[47,24],[62,16],[71,11],[80,5],[89,11],[98,16],[113,24],[119,33],[128,33],[135,40],[130,44],[130,144],[135,148],[135,153],[25,153],[25,148]],'#aa5500');
 for(const side of [-1,1]){
  const points=[[80,12],[80+side*17,23],[80+side*30,31],[80+side*39,43],[80+side*39,139]];
  galleryInk(points,'#ffff55');
  galleryInk([[80+side*45,44],[80+side*45,139]],'#ffff55');
  galleryInk([[80+side*48,35],[80+side*48,29]],'#ffff55');
  for(const y of [57,98,134])rect(side<0?29:120,y,11,2,'#000000');
 }
 shape(mirrorCloseGlass,'#555555');
 shape([[80,22],[96,29],[116,46],[116,136],[92,136],[103,112],[95,90],[105,63]],'#000000');
 galleryInk([[46,55],[65,36]],'#aaaaaa');galleryInk([[47,60],[63,44]],'#ffffff');
 galleryInk([[104,127],[114,117]],'#aaaaaa');
 shape([[74,16],[80,11],[86,16],[83,21],[77,21]],'#0000aa');
 galleryInk([[74,16],[80,11],[86,16]],'#55ffff');
 rect(34,142,92,5,'#aa5500');galleryInk([[35,142],[125,142]],'#ffff55');galleryInk([[28,151],[132,151]],'#ffff55');
 // The silver surface opens like a jeweled rose window, rather than water.
 if(frame>=8){
  const wake=Math.min(1,(frame-8)/18),settle=Math.max(0,(frame-72)/27);
  const line=(points,color)=>{for(let n=1;n<points.length;n++){const a=points[n-1],b=points[n],steps=Math.max(Math.abs(b[0]-a[0]),Math.abs(b[1]-a[1]));for(let j=0;j<=steps;j++){const t=steps?j/steps:0;glassDot(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,color)}}};
  // A rising veil turns the glass into deep blue velvet, a calm dark field
  // for luminous petals. Every ray is clipped to the original glass outline.
  for(let yy=23;yy<138;yy++)for(let xx=43;xx<118;xx++){
   if(yy<138-wake*119)continue;
   glassDot(xx,yy,Math.abs(xx-80)<27?'#0000aa':'#000000');
  }
  const bloom=Math.min(1,Math.max(0,(frame-16)/28)),cy=77;
  const jewels=['#aa00aa','#5555ff','#00aaaa','#aa00aa','#5555ff','#00aaaa','#aa00aa','#5555ff'];
  for(let petal=0;petal<8;petal++){
   const angle=-Math.PI/2+petal*Math.PI/4+Math.sin(frame*.035)*.045;
   const tip=44*bloom,waist=23*bloom,half=10*bloom;
   const point=(along,across)=>[Math.round(80+Math.cos(angle)*along+Math.sin(angle)*across),Math.round(cy+Math.sin(angle)*along-Math.cos(angle)*across)];
   const petalShape=[point(5,0),point(waist,-half),point(tip,0),point(waist,half),point(5,0)];
   if(bloom>.08)for(let yy=30;yy<124;yy++)for(let xx=43;xx<118;xx++)if(insidePolygon(xx+.5,yy+.5,petalShape))glassDot(xx,yy,jewels[petal]);
   line(petalShape,settle>.7?'#00aaaa':'#ffff55');
   if(bloom>.4)line([point(9,0),point(tip-3,0)],petal%2?'#ff55ff':'#55ffff');
   // Light climbs each petal, then rests as a star at its point.
   const travel=((frame+petal*7)%31)/30,pos=point(8+travel*Math.max(0,tip-8),0);
   glassDot(pos[0],pos[1],'#ffffff');
   if(frame>=43){const p=point(tip,0);line([[p[0]-2,p[1]],[p[0]+2,p[1]]],'#ffffff');line([[p[0],p[1]-2],[p[0],p[1]+2]],'#ffff55')}
  }
  // Two flowing silk-like curtains frame the listening face. Their movement
  // slows toward the final pose, keeping the eyes and question easy to read.
  for(const side of [-1,1])for(let ribbon=0;ribbon<3;ribbon++){
   const points=[];for(let yy=39;yy<=130;yy+=2){const t=(yy-39)/91;points.push([80+side*(21+ribbon*4+Math.sin(t*6+frame*.055)*(3-settle*2)),yy])}
   line(points,['#ff55ff','#55ffff','#ffff55'][ribbon]);
  }
  if(frame>=54){
   // The center clears in a symmetric pointed oval as a presence forms.
   const opening=Math.min(1,(frame-54)/20);
   for(let yy=48;yy<109;yy++)for(let xx=55;xx<106;xx++)if(Math.abs(xx-80)/(23*opening)+Math.abs(yy-78)/(36*opening)<1)glassDot(xx,yy,'#0000aa');
  }
 }
 mirrorCloseJar(94,106,13,25,frame,true,shape,rect);
 if(frame>=57){
  // A quiet silver-and-gold face resolves in the heart of the rose window.
  const reveal=Math.min(1,(frame-57)/18);
  for(const side of [-1,1]){
   for(let i=0;i<Math.round(9*reveal);i++){
    glassDot(80+side*(5+i),65-Math.floor(i/4),'#ffff55');
    glassDot(80+side*(6+i),70+Math.floor(i/5),'#55ffff');
   }
   glassDot(80+side*10,70,'#ffffff');
  }
  for(let i=0;i<Math.round(12*reveal);i++)glassDot(80+Math.round(Math.sin(i*.23)*2),73+i,'#55ffff');
  const breath=Math.floor(frame/5)%3;
  for(let i=-6;i<=6;i++)glassDot(80+i,92+Math.round(i*i/15)+breath%2,i%3?'#aaaaaa':'#ffffff');
 }
 // A real foreground hand supports the jar below the reflective surface.
 shape([[26,163],[27,151],[49,146],[55,148],[67,146],[72,150],[67,158],[48,160],[45,164]],'#ff5555');
 shape([[24,152],[31,151],[34,163],[24,164]],'#ffffff');
 mirrorCloseJar(54,122,22,34,frame,false,shape,rect);
 // Glass-to-glass motes bridge the two jars without crossing the frame.
 if(frame>=5&&frame<72)for(let i=0;i<5;i++){
  const t=((frame-5+i*9)%48)/47,p=storyArc({x:66,y:125},{x:100,y:108},t,14);
  glassDot(p.x,p.y,i%2?'#ffff55':'#ffffff');
 }
}
function mirrorCloseJar(left,top,width,height,frame,reflected,shape,rect){
 const q=(a,b)=>[Math.round(left+a*width),Math.round(top+b*height)];
 const points=[[.15,0],[.85,0],[.85,.16],[1,.25],[1,.89],[.85,1],[.15,1],[0,.89],[0,.25],[.15,.16]].map(([a,b])=>q(a,b));
 shape(points,reflected?'#00aaaa':'#aa5500');
 const inner=[[.25,.12],[.75,.12],[.75,.2],[.9,.3],[.9,.84],[.78,.94],[.22,.94],[.1,.84],[.1,.3],[.25,.2]].map(([a,b])=>q(a,b));
 shape(inner,reflected?'#0000aa':'#5555ff');
 galleryInk([q(.05,.27),q(.05,.85)],'#ffffff');galleryInk([q(.2,.94),q(.8,.94)],'#ffff55');
 rect(left,top-1,width,3,'#aa0000');galleryInk([q(.08,0),q(.9,0)],'#ff5555');
 for(let j=0;j<15;j++){
  const yy=top+Math.round(height*(.34+j*.033)),xx=left+Math.round(width*.5+Math.sin(j*.35+frame*.07)*width*.18);
  rect(xx,yy,1,1,reflected?'#55ffff':'#ffff55');
 }
}
