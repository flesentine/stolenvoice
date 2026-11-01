// Optional experiments: no quest flags, inventory changes or points.
function playfulBowAmount(frame,reflected=false){
 const delay=reflected&&!flags.voiceReturned?9:1,t=(frame-delay)/10;
 return t<=0||t>=1?0:Math.round(Math.sin(t*Math.PI)*5);
}
function playfulBowOffset(facing,row,frame,reflected=false){
 const bow=playfulBowAmount(frame,reflected),bend=Math.max(0,1-row/24);
 // Forward follows her profile. Front/back bows dip centrally rather than
 // throwing the head sideways; the mirror uses its own viewed facing.
 const direction=facing==='left'?-1:facing==='right'?1:0;
 return{x:Math.round(direction*bow*bend*.4)||0,y:Math.round(bow*bend)};
}
function handlePlayfulIntent(text){
 if(text==='fart')return handleRoyalRaspberry();
 let action='',target='',m;
 if((m=text.match(/^(bow|curtsy|curtsey)(?: (?:to|at|before|for) (.+))?$/))){
  action=m[1]==='bow'?'bow':'curtsy';
  const audience=({0:'man',1:'mirror'})[room],point=audience&&hotspots[room][audience];
  target=m[2]||(point&&Math.hypot(player.x-point[0],player.y-point[1])<=58?audience:'');
 }
 else if((m=text.match(/^sing(?: (?:to|at|for) (.+))?$/))){action='sing';target=m[1]||({0:'merrin',1:'mirror'})[room]||''}
 else if((m=text.match(/^(?:polish|buff|clean|wipe) (.+?)(?: with (?:my|your|the) sleeve)?$/))){if(objectId(m[1])!=='mirror')return false;action='polish';target=m[1]}
 else if((m=text.match(/^(?:flatter|compliment|praise) (.+)$/))){action='flatter';target=m[1]}
 else if((m=text.match(/^(?:make|pull) (?:a )?faces?(?: (?:at|to|in) (.+))?$/))){action='face';target=m[1]||'mirror'}
 else if((m=text.match(/^dance(?: (?:for|with|before|in front of) (.+))?$/))){action='dance';target=m[1]||(room===0?'merrin':'')}
 else if((m=text.match(/^kiss (.+?)(?: on (?:the )?cheek)?$/))){action='kiss';target=m[1]}
 else if(/^(?:shake|rattle) (?:the )?(?:apple trees?|trees?|branches)$/.test(text)){
  if(room!==3){say('There is no apple tree within reach here.');return true}
  rememberMerrin('tree');stopWalking();say('You shake the trunk. The branches sway solemnly, then drop a single leaf onto your head. A surprisingly stern reply from a tree.');return true;
 }else return false;
 // Garden dancing is always allowed; Merrin only reacts within earshot.
 if(action==='dance'&&room===0&&objectId(target)==='man'&&Math.hypot(player.x-hotspots[0].man[0],player.y-hotspots[0].man[1])>58)target='';
 const id=objectId(target);
 if(action==='kiss'&&id!=='man')return false;
 // Let the main voice ritual finish without replacing its pending question.
 if(storyAction&&['voiceOffered','voiceReturned','voiceFollow'].includes(storyAction.kind)){
  say('The borrowed voice holds your attention for the moment. The performance can wait.');return true;
 }
 const beeTarget=/^(?:the )?(?:bees?|hive|beehive|bee hive)$/.test(target);
 if(action==='dance'&&(beeTarget||(!target&&room===3&&Math.hypot(player.x-206,player.y-194)<=60))){
  if(room!==3){say('There are no bees here to join your dance.');return true}
  if(Math.hypot(player.x-206,player.y-194)>60){say('Move closer to the hive if you want an audience.');return true}
  startStoryEffect('courtDance','Three bees copy your steps, then scatter during your twirl. "That was a dance, not directions to a flower," you explain. The bees seem unconvinced.',{beeAudience:true});return true;
 }
 if(!target){
  const message=action==='dance'&&room===0?'You dance along the garden path. The roses make a wonderfully undemanding audience.':action==='dance'&&room===2?'Three mice scurry out to join your dance. Excellent footwork. Questionable footwear. They vanish before you can ask who taught them.':action==='sing'?'Rosella hums a few notes to herself. The tune is pleasant company.':action==='dance'?'You manage two graceful steps and one less graceful recovery. Fortunately, there is no audience.':action==='curtsy'?'You lift your skirts and make a very proper curtsy. Even the floor seems impressed.':'You make a very formal bow to nobody in particular.';
  if(['dance','bow','curtsy'].includes(action))startStoryEffect(action==='dance'?'courtDance':action==='curtsy'?'mirrorCurtsy':'mirrorBow',message);else say(message);
  return true;
 }
 if(!['mirror','man'].includes(id)){
  if(['polish','flatter','face'].includes(action))return false;
  say('That is not much of an audience. Rosella saves her performance for someone who might appreciate it.');return true;
 }
 if(!objectIsHere(id)){say(id==='man'?'Merrin is in the royal garden.':'You do not see a mirror here.');return true}
 if(!nearObject(id))return true;
 stopWalking();
 if(id==='mirror'){
  if(action==='curtsy'){
   startStoryEffect('mirrorCurtsy',flags.voiceReturned?'You lift your skirts and sink into a graceful curtsy. Your reflection follows perfectly. Royal etiquette, at last.':'You lift your skirts and dip into a curtsy. Your reflection waits, then sinks even lower. Apparently, it has been practising.');return true;
  }
  if(action==='bow'){
   startStoryEffect('mirrorBow',flags.voiceReturned?'You bow. The reflection bows with you this time. It seems to have learned some manners.':'You bow politely. Your reflection waits until you have straightened, then returns an unnecessarily grand bow.');return true;
  }
  if(action==='polish'){
   startStoryEffect('mirrorPolish',flags.mirrorAwake&&!flags.voiceReturned?'You buff the glass with your sleeve. A glint skips across the silver. "Steady," the mirror murmurs. "That is my good side."':'You buff the glass with your sleeve. A bright glint skips across the silver. Your reflection examines the result with royal approval.');return true;
  }
  const awake=flags.mirrorAwake&&!flags.voiceReturned;
  if(action==='sing'){say(awake?'You sing a few notes. "An ambitious interpretation," says the mirror. "Do you know a quieter verse?"':'You sing a few notes. Your reflection mouths the tune with great conviction. The glass keeps its own counsel.');return true}
  if(action==='flatter'){say(awake?'"A most handsome mirror," you declare. "At last," it replies, "an accurate reflection."':'You compliment the silver glass. Your reflection looks rather pleased with itself. The mirror remains quiet.');return true}
  if(action==='face'){say(awake?'You pull your most ridiculous face. "A striking family resemblance," remarks the mirror. You decide not to ask to whom.':'You pull a face at your reflection. It is an excellent likeness and a poor advertisement for royal dignity.');return true}
  if(action==='dance'){startStoryEffect('courtDance','You perform a small courtly turn. In the mirror, it looks much more impressive. You elect to remember that version.');return true}
 }
 if(id==='man'){
  if(action==='kiss'){const point={x:player.x<60?44:76,y:204};const kissStand=canStand(point.x,point.y,0)&&clearGroundStep(player.x,player.y,point.x,point.y)?point:{x:player.x,y:player.y};startStoryEffect('merrinKiss',flags.voiceArrivalSeen?'You give Merrin a quick kiss on the cheek. "Your Highness! I shall never wash this cheek again!" He considers his muddy hands. "Well. Not until supper."':'You give Merrin a quick kiss on the cheek. He turns the color of his roses. A tiny "ding-ding!" escapes him. Apparently, you have found the doorbell.',{kissStand});return true}
  rememberMerrin(action==='curtsy'?'bow':action);
  const speaking=flags.voiceArrivalSeen;
  if(action==='bow'||action==='curtsy'){startStoryEffect(action==='curtsy'?'mirrorCurtsy':'mirrorBow',(speaking?'You bow to Merrin. He sweeps off his cap and bows so low that he nearly loses it. "Your Highness wins," he says.':'You bow to Merrin. He sweeps off his cap, nearly drops it, and returns the courtesy. A very dignified little "ding" escapes him.').replace('You bow',action==='curtsy'?'You curtsy':'You bow'));return true}
  if(action==='dance'){startStoryEffect('courtDance',speaking?'You offer a courtly step. Merrin attempts to follow, remembers his knees, and turns it into an elaborate bow. "A gardening injury," he insists.':'You offer a courtly step. Merrin taps the rhythm against his apron, then attempts a turn. A startled "ding!" brings the performance to a halt.');return true}
  if(action==='sing'){say(speaking?'You sing a little phrase. Merrin supplies a harmony, then pretends he had merely been clearing his throat.':'You sing a little phrase. Merrin conducts with one finger. His attempt to join in produces a tiny bell note; he gives you an apologetic smile.');return true}
  if(action==='flatter'){say('You praise Merrin\'s garden. He straightens his collar, inspects a nearby leaf and tries very hard not to look pleased.');return true}
  if(action==='face'){say('You pull a face. Merrin raises one eyebrow. Apparently the royal family has done this sort of thing before.');return true}
 }
 return false;
}
function drawPlayfulHero(px,py){
 if(drawRoyalRaspberry(px,py))return true;
 if(storyAction?.kind==='merrinKiss'){drawRosellaKiss(px,py);return true}
 if(storyAction?.kind==='courtDance'){drawRosellaDance(px,py);return true}
 if(storyAction?.kind==='mirrorCurtsy'){
  const rows=rosellaCurtsySprite(storyAction.frame),left=pictureX(px)-7,top=pictureY(py)-39;
  ellipse(px,py+1,7,1,'#000000');
  for(let row=0;row<40;row++)for(let col=0;col<14;col++)if(rows[row][col]!=='.'){x.fillStyle=rosellaColors[parseInt(rows[row][col],16)];x.fillRect(left+col,top+row,1,1)}
  return true;
 }
 if(storyAction?.kind!=='mirrorBow')return false;
 const facing=rosellaWalkSprites[player.facing]?player.facing:'front';
 const rows=rosellaWalkSprites[facing][1],left=pictureX(px)-4,top=pictureY(py)-39;
 ellipse(px,py+1,7,1,'#000000');
 for(let row=0;row<40;row++)for(let col=0;col<8;col++){
  const ink=rows[row][col];if(ink==='.')continue;
  const offset=playfulBowOffset(facing,row,storyAction.frame);
  x.fillStyle=rosellaColors[parseInt(ink,16)];x.fillRect(left+col+offset.x,top+row+offset.y,1,1);
 }
 return true;
}
function rosellaCurtsySprite(frame,reflected=false){
 const dip=playfulBowAmount(frame,reflected),facing=reflected?({front:'back',back:'front',left:'left',right:'right'}[player.facing]||'front'):player.facing;
 const rows=rosellaWalkSprites[facing]?.[1]||rosellaWalkSprites.front[1],out=Array.from({length:40},()=>Array(14).fill('.'));
 const dot=(x,y,ink)=>{if(x>=0&&x<14&&y>=0&&y<40)out[y][x]=ink};
 if(!dip){rows.forEach((row,y)=>[...row].forEach((ink,x)=>dot(x+3,y,ink)));return out.map(row=>row.join(''))}
 // The torso and head lower together; the skirt compresses over bent knees
 // while the crossed feet retain the same ground baseline.
 const body=rosellaWalkSprites[facing==='back'?'back':'front'][1];
 for(let y=0;y<24;y++)for(let x=0;x<8;x++){
  let ink=body[y][x];
  if(y>=15){if(x<2||x>5)continue;ink=y<17?'f':y<20?'1':'9'}
  if(ink!=='.')dot(x+3,y+dip,ink);
 }
 for(let y=24+dip;y<=36;y++){
  const spread=Math.min(3,Math.floor((y-24-dip)/2)),left=3-spread,right=10+spread;
  for(let x=left;x<=right;x++)dot(x,y,x>=7&&x<=8?'1':'9');
 }
 const stroke=(a,b,ink)=>{const steps=Math.max(Math.abs(b[0]-a[0]),Math.abs(b[1]-a[1]));for(let n=0;n<=steps;n++){const x=Math.round(a[0]+(b[0]-a[0])*n/steps),y=Math.round(a[1]+(b[1]-a[1])*n/steps);dot(x,y,ink);dot(x,y+1,ink)}};
 for(const side of [-1,1]){
  const root=[side<0?4:9,14+dip],elbow=[side<0?2:11,21+dip],hand=[side<0?1:12,25+Math.round(dip/2)];
  stroke(root,elbow,'f');stroke(elbow,hand,'c');
  dot(hand[0],hand[1]+2,'9');
 }
 for(const [x,y]of [[6,37],[7,37],[7,38],[8,38],[6,39],[7,39]])dot(x,y,'6');
 return out.map(row=>row.join(''));
}
function drawPlayfulMirror(){
 if(storyAction?.kind!=='mirrorPolish')return;
 const glass=[[63,48],[72,38],[82,48],[82,101],[63,101]];
 const sparkles=[[68,54],[77,80],[72,66]],frame=storyAction.frame;
 sparkles.forEach(([cx,cy],i)=>{
  const phase=frame-i*3;if(phase<0||phase>6)return;
  const size=phase<3?1:2;
  for(const [dx,dy]of [[0,0],[-size,0],[size,0],[0,-size],[0,size]]){
   const xx=cx+dx,yy=cy+dy;if(!insidePolygon(xx,yy,glass))continue;
   x.fillStyle=phase%2?'#55ffff':'#ffffff';x.fillRect(xx,yy,1,1);
  }
 });
}

// Two bashful heel-kicks, then both feet return to their original spot.
function merrinKissPose(frame){
 frame-=16;
 if(frame<3||frame>=24)return{side:0,hop:0,kick:0};
 const beat=(frame-3)%10,side=frame<13?-1:1;
 return{side:side*[0,1,2,2,1,0,0,1,1,0][beat],hop:[0,1,2,2,1,0,0,1,1,0][beat],kick:beat>=2&&beat<=4?side:0};
}
function drawMerrinKissDance(px,py){
 if(storyAction?.kind!=='merrinKiss')return false;
 const pose=merrinKissPose(storyAction.frame),left=pictureX(px)-4+pose.side,top=pictureY(py)-37-pose.hop;
 ellipse(px,py+1,8,1,'#000000');
 for(let row=0;row<38;row++)for(let col=0;col<8;col++){
  const ink=merrinSprite[row][col];if(ink==='.')continue;
  const heel=row>=29&&(pose.kick<0?col<4:col>=4)?pose.kick:0;
  x.fillStyle=rosellaColors[parseInt(ink,16)];x.fillRect(left+col+heel,top+row-(heel?Math.floor((row-28)/3):0),1,1);
 }
 drawMerrinRose(px+pose.side*2,py-pose.hop*240/168);
 return true;
}

function drawRosellaKiss(px,py){
 const f=storyAction.frame,stand=storyAction.kissStand||{x:px,y:py},t=f<7?f/6:f<10?1:f<16?(15-f)/5:0;
 const cx=px+(stand.x-px)*t,cy=py+(stand.y-py)*t,facing=f<16?(px<60?'right':'left'):player.facing;
 const rows=rosellaWalkSprites[facing][f<6?Math.floor(f/2)%4:1],left=pictureX(cx)-4,top=pictureY(cy)-39;
 ellipse(cx,cy+1,7,1,'#000000');
 for(let y=0;y<40;y++)for(let col=0;col<8;col++){const ink=rows[y][col];if(ink==='.')continue;const lean=f>=5&&f<=10?Math.sin((f-4)/7*Math.PI)*3:0,shift=Math.round(lean*Math.max(0,1-y/28))*(facing==='left'?-1:1);x.fillStyle=rosellaColors[parseInt(ink,16)];x.fillRect(left+col+shift,top+y,1,1)}
 if(f>=7&&f<=10){const hx=pictureX(60)+(px<60?-3:4),hy=103-(f-7);for(const [dx,dy]of [[0,0],[2,0],[0,1],[1,1],[2,1],[1,2]]){x.fillStyle='#ff5555';x.fillRect(hx+dx,hy+dy,1,1)}}
}
