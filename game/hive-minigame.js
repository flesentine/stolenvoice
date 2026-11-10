// Native-grid close-up: watch the changing swarm, then reach through a visible opening.
let hiveOpen=false,hiveTimer=0,hiveFrame=0,hiveReach=-1,hiveCaught=false,hiveHelp=true,hiveWon=false,hiveFocused=true,hiveStings=0;
let hiveFlight=makeHiveFlight(1);
const hiveHand=[
   '......ss.......',
   '...ss.sss......',
   '...ss.sss.ss...',
   'ss.ssssss.sss..',
   'sssssssss.sss..',
   '.ssssssss.sss..',
   '.ssssssssssss..',
   '.ssssssssssss..',
   '..sssssssssss..',
   '..sssssssssss..',
   '..ssssssssss...',
   '..ssssssssss.ss',
   '...ssssssss.sss',
   '...sssssssssss.',
   '...ssssssssss..',
   '....ssssssss...',
   '....sssssss....',
   '.....ssssss....',
   '.....ssssss....',
   '.....ssssss....',
   '....wwwwwwww...',
   '....wwwwwwww...',
   '....cccccccc...',
   '...cccccccccd..',
   '...cccccccccd..',
   '...cccccccccd..',
   '...cccccccccd..',
   '..ccccccccccdd.',
   '..ccccccccccdd.',
   '..ccccccccccdd.',
   '..ccccccccccdd.',
   '..ccccccccccdd.'
  ];
let hiveMissed=false;
function hiveHandY(reach){return Math.round(156-Math.min(1,reach/5,(13-reach)/7)*44)}
// Rendering and contact use these same native-grid bee pixels.
const hiveBeePixels=[[-1,-2,15],[0,-2,15],[1,-1,7],[2,-1,7],
 [-2,0,0],[-1,0,14],[0,0,0],[1,0,14],[2,0,0],
 [-2,1,0],[-1,1,14],[0,1,0],[1,1,14],[2,1,0]];
function hiveContact(frame,reach){
 const top=hiveHandY(reach)-8;
 return hiveBees(frame).some(([x,y])=>hiveBeePixels.some(([dx,dy])=>
  hiveHand[y+dy-top]?.[x+dx-72]==='s'));
}
function hivePieces(){return flags.waxTaken?3:flags.hiveWaxTwo?2:flags.hiveWaxOne?1:0}
function hiveClear(frame){
 return !hiveContact(frame,5);
}
function hiveWrap(text,columns=34){
 return text.split('\n').flatMap(paragraph=>{
  if(!paragraph)return [''];const lines=[];let line='';
  for(const word of paragraph.split(/\s+/)){if(line&&(line+' '+word).length>columns){lines.push(line);line=word}else line+=(line?' ':'')+word}if(line)lines.push(line);return lines;
 });
}
const hiveHelpText="Look at the wax below the entrance and reach when the bees clear the flight path. If you get stung 3 times you'll drop all the wax!";
const hiveHelpLines=hiveWrap(hiveHelpText+'\n\nSPACE: reach   ESC: back\nENTER: begin watching.');
let hiveStatus='Watch their flight before reaching.';
function hiveGap(){
  return hiveClear(hiveFrame);
}
function hiveMusic(){if(hiveOpen&&!hiveHelp&&!hiveWon&&!document.hidden&&hiveFocused)playGameSound('hiveDance',false,(hiveFrame%90)*.08)}
function resetHive(keepVictory=false){if(hiveOpen&&!keepVictory)stopGameSound();if(hiveTimer)clearInterval(hiveTimer);hiveTimer=0;hiveOpen=false;hiveReach=-1;hiveStings=0}
function closeHive(){resetHive(hiveWon);document.querySelector('#agi-message-window').style.maxWidth='';closeMessage()}
function retreatFromHiveStings(){
 const dropped=hivePieces()>0;flags.hiveWaxOne=false;flags.hiveWaxTwo=false;
 closeHive();startBeeStingReaction('Three stings! '+(dropped?'You drop your gathered wax flakes as you flee. ':'')+'Elara performs the traditional dance of the offended finger.'+(dropped?' You will need to gather them again.':''));
}
function showHive(){
 if(room!==3||!nearObject('wax'))return;
 if(flags.waxTaken){say('The bees circle their hive. You have enough loose wax already.');return}
 hiveFlight=makeHiveFlight(Math.floor(Math.random()*4294967296));
 stopWalking();say('The living hive.');agiMessagePages=[];hiveOpen=true;hiveFrame=0;hiveMissed=false;hiveReach=-1;hiveWon=false;hiveHelp=true;hiveStings=0;hiveStatus='Watch their flight before reaching.';paintHive();
 hiveTimer=setInterval(tickHive,80);
}
function reachHive(){if(hiveHelp){hiveHelp=false;hiveMusic();paintHive();return}if(hiveWon){closeHive();return}if(hiveReach>=0)return;hiveReach=0;hiveCaught=false;hiveMissed=false;hiveStatus='Elara reaches toward the loose wax.';paintHive()}
function tickHive(){
 if(!hiveOpen||hiveHelp||document.hidden||!hiveFocused)return;
 hiveFrame++;if(hiveFrame%90===0&&!hiveWon)hiveMusic();
 if(hiveReach>=0){
  hiveReach++;
  if(hiveReach<13&&!hiveMissed&&hiveContact(hiveFrame,hiveReach)){
   hiveMissed=true;hiveCaught=false;hiveStings++;hiveStatus='Sting '+hiveStings+'/3! Elara draws back.';playGameSound('hiveMiss');
  }
  if(hiveReach===5&&!hiveMissed){hiveCaught=true;hiveStatus='Her fingers close around the wax.';}
  if(hiveReach>=13){
   hiveReach=-1;
   if(hiveCaught){
    const pieces=hivePieces()+1;
    if(pieces===1)flags.hiveWaxOne=true;
    if(pieces===2)flags.hiveWaxTwo=true;
    if(pieces===3){hiveWon=true;if(!flags.waxTaken){flags.waxTaken=true;award('waxTaken',eventPoints.waxTaken);syncInventory();}hiveStatus='Enough wax! The bees are unharmed.';playGameSound('hiveWax')}
    else hiveStatus=pieces+'/3 flakes. Wait for another opening.';
   }else if(hiveStings>=3){retreatFromHiveStings();return}
   else {hiveStatus='A close call. Watch for the next gap.';hiveMusic();}
  }
 }
 paintHive();
}
function hivePixels(){
 const out=new Uint8Array(160*168).fill(2),rect=(a,b,w,h,c)=>{for(let y=Math.round(b);y<Math.round(b+h);y++)for(let x=Math.round(a);x<Math.round(a+w);x++)if(x>=0&&x<160&&y>=0&&y<168)out[y*160+x]=c};
 const oval=(cx,cy,rx,ry,c)=>{for(let y=-ry;y<=ry;y++){const w=Math.floor(rx*Math.sqrt(1-y*y/(ry*ry)));rect(cx-w,cy+y,w*2+1,1,c)}};
 // Enlarge the orchard skep's rounded profile and coiled straw construction.
 const line=(points,c)=>{for(let i=1;i<points.length;i++){let [x,y]=points[i-1];const [ex,ey]=points[i],dx=Math.abs(ex-x),dy=-Math.abs(ey-y),sx=x<ex?1:-1,sy=y<ey?1:-1;let e=dx+dy;for(;;){rect(x,y,1,1,c);if(x===ex&&y===ey)break;const e2=e*2;if(e2>=dy){e+=dy;x+=sx}if(e2<=dx){e+=dx;y+=sy}}}};
 // Orchard depth: open sky behind the swarm, distant hedge, and framing apple boughs.
 rect(0,0,160,168,9);
 for(const [x,y,rx,ry] of [[7,88,25,22],[37,92,27,18],[73,93,26,17],[111,90,28,20],[151,87,27,23]])oval(x,y,rx,ry,3);
 rect(0,104,160,64,10);
 // Framing trees have tapered forks rather than isolated diagonal twigs.
 // Keep their silhouettes outside the hive's working space.
 for(let y=44;y<=120;y++){
  const width=6+Math.floor((y-44)/26);
  rect(0,y,width,1,6);rect(160-width,y,width,1,6);
 }
 const bough=points=>{
  for(let i=1;i<points.length;i++){
   const [ax,ay]=points[i-1],[bx,by]=points[i],steps=Math.max(Math.abs(bx-ax),Math.abs(by-ay));
   for(let n=0;n<=steps;n++){
    const t=n/steps,r=Math.max(0,2-Math.floor((i-1+t)*.85));
    rect(Math.round(ax+(bx-ax)*t)-r,Math.round(ay+(by-ay)*t)-r,r*2+1,r*2+1,6);
   }
  }
 };
 bough([[4,70],[10,56],[20,43]]);bough([[156,68],[148,52],[137,39]]);
 bough([[3,58],[1,44],[7,32]]);bough([[156,53],[159,40],[151,29]]);
 // Short bark fissures, small knots and roots break up the flat posts.
 for(const [x,y] of [[1,69],[4,86],[2,101],[155,65],[157,89],[154,108]]){
  line([[x,y],[x+1,y+4],[x,y+9]],0);
  line([[x+2,y+1],[x+2,y+4]],14);
 }
 line([[3,116],[8,120],[13,122]],6);line([[156,116],[151,121],[146,123]],6);
 oval(4,91,2,3,0);oval(4,91,1,2,6);rect(5,89,1,2,14);
 oval(157,78,2,3,0);oval(157,78,1,2,6);
 // Overlapping leaf masses break the old smooth, balloon-like crowns.
 // A thin dark lower edge gives each bough weight without extra EGA colors.
 const crowns=[[1,10,23,15],[20,8,21,12],[9,27,21,16],[4,41,18,13],[20,34,16,13],
  [153,9,25,16],[145,24,18,15],[158,36,22,17],[148,43,16,12]];
 for(const [cx,cy,rx,ry]of crowns)oval(cx,cy+1,rx,ry,0);
 for(const [cx,cy,rx,ry]of crowns)oval(cx,cy,rx-1,ry-1,2);
 // Irregular light catches the tops of leaf fans; green notches keep these
 // from reading as repeated little arrows or identical horizontal stripes.
 for(const [cx,cy,rx,ry]of [[4,4,7,3],[20,3,7,2],[29,12,5,3],[9,20,6,3],[2,33,5,2],[17,36,7,3],[5,45,5,2],
  [149,4,8,3],[138,14,5,2],[155,21,7,3],[144,32,6,3],[157,43,7,3],[144,47,4,2]]){
  oval(cx,cy,rx,ry,10);
  line([[cx-rx,cy+1],[cx-2,cy+2],[cx+rx,cy+1]],2);
  rect(cx+1,cy-ry,2,1,2);rect(cx-rx,cy,2,1,2);
 }
 // Recessed seams separate the overlapping boughs, with tiny leaf tips
 // along the silhouette instead of a continuous scalloped oval.
 for(const points of [[[0,16],[5,18],[12,17]],[[17,24],[22,26],[28,24]],[[2,39],[8,41],[12,40]],
  [[135,29],[141,31],[146,30]],[[149,13],[154,15],[159,14]],[[146,48],[152,50],[159,49]]])line(points,0);
 for(const [cx,cy]of [[33,17],[28,28],[25,43],[14,51],[131,17],[130,35],[136,51]]){
  if(cx>=0&&cx<160&&cy>=0&&cy<168&&out[cy*160+cx]===2){rect(cx,cy,2,1,10);rect(cx+1,cy+1,1,1,2)}
 }
 // Small apples identify the boughs without cluttering the flight paths.
 for(const [x,y] of [[14,27],[29,16],[144,29]]){rect(x,y-2,1,2,6);rect(x-2,y,4,4,4);rect(x-2,y,2,2,12)}
 // A worn patch grounds the stump; grass and flowers frame the foreground.
 oval(81,142,38,7,2);
 for(const [x,y] of [[12,130],[29,150],[135,128],[148,154],[18,112],[127,148]])line([[x-2,y],[x-1,y+2],[x,y-1],[x+1,y+2],[x+3,y]],2);
 for(const [x,y] of [[10,146],[143,137]]){rect(x,y,1,5,2);rect(x-1,y-1,3,2,13);rect(x,y-1,1,1,14)}
 // A rooted stump, with the same forked base as the orchard view.
 for(let y=102;y<=143;y++){
  const half=y<132?25:25+Math.floor((y-132)/2);
  rect(80-half,y,half*2+1,1,6);
 }
 rect(54,105,52,2,0);rect(59,111,3,20,0);rect(99,110,3,22,14);
 line([[72,112],[70,127],[75,135]],0);line([[85,133],[82,143],[77,145]],0);
 line([[53,143],[62,140],[67,136]],0);line([[97,137],[103,141],[110,143]],0);
 rect(71,143,7,3,2);rect(88,141,8,5,2);
 const widths=[12,18,23,27,30,32,33,34,35,35,36,36,36,36,36,36,36,36,36,36,36,36,35,35,34,33];
 for(let row=0;row<widths.length;row++){
  const y=24+row*3,half=widths[row];
  rect(80-half,y,half*2+1,3,6);
  if(half>3)rect(81-half,y,half*2-3,3,14);
  if(half>20)rect(80+half-6,y,5,3,6);
 }
 // Curved coils, with sparse stitches rather than projecting horizontal lips.
 for(const [y,half]of [[32,22],[41,31],[51,34],[61,35],[72,35],[83,35],[94,33]])
  line([[80-half,y],[85-half,y+2],[75+half,y+2],[80+half,y]],6);
 for(const [x,y]of [[68,35],[60,46],[53,58],[49,70]])rect(x,y,5,1,15);
 for(const [x,y]of [[84,43],[68,56],[89,67],[58,79],[86,90]])line([[x,y],[x+2,y+2]],6);
 // Small bottom entrance and landing edge match the room-scale skep.
 rect(78,85,4,4,0);rect(75,89,10,12,0);rect(73,94,14,7,0);
 rect(66,101,29,3,6);rect(69,102,23,1,14);
 const flakes=[[77,105,9,3],[74,109,7,3],[84,110,6,2]];
 flakes.slice(hivePieces()+(hiveCaught&&hiveReach>=5?1:0)).forEach(([a,b,w,h])=>rect(a,b,w,h,14));
 // Staggered figure-eights leave brief local openings at the wax.
 // Bees elsewhere stay in motion, including beside and below the hive.
 for(const bee of hiveBees()){
  const [bx,by]=bee;
  hiveBeePixels.forEach(([dx,dy,color])=>rect(bx+dx,by+dy,1,1,color));
 }
 {
  const y=hiveReach>=0?hiveHandY(hiveReach):144;
  // Draw a complete hand cel: staggered rounded fingertips, a cupped palm,
  // an opposing thumb and a narrow wrist inside Elara's white cuff.
  // Each character is one native picture pixel; no stretched body parts.

  // The close-up is Elara's viewpoint: her sleeve enters from below the
  // picture, never as a detached cuff floating in front of the stump.
  // Continue the last hand-cel row to the picture edge at every reach height.
  const sleeveTop=y+24;
  for(let sy=sleeveTop;sy<168;sy++){
   const depth=sy-sleeveTop,left=74-Math.min(8,Math.floor(depth/9)),right=85+Math.min(5,Math.floor(depth/14));
   rect(left,sy,right-left+1,1,9);
   rect(right-1,sy,2,1,1);
  }
  const colors={s:12,w:15,c:9,d:1};
  hiveHand.forEach((row,dy)=>Array.from(row).forEach((pixel,dx)=>{if(pixel!=='.')rect(72+dx,y-8+dy,1,1,colors[pixel])}));
  line([[81,y+4],[80,y+7],[78,y+9]],4);
  if(hiveCaught&&hiveReach>=5){
   // Wax rests against the curling fingers as the hand draws back.
   rect(75,y-4,7,3,6);rect(75,y-4,6,2,14);
  }
 }
 return out;
}
function paintHive(){
 const bitmap=document.querySelector('#agi-message-picture');bitmap.width=320;bitmap.height=200;
 const ctx=bitmap.getContext('2d'),pic=document.createElement('canvas');pic.width=160;pic.height=168;const pc=pic.getContext('2d'),im=pc.createImageData(160,168),pixels=hivePixels();
 for(let n=0;n<pixels.length;n++){const rgb=EGA[pixels[n]];for(let k=0;k<3;k++)im.data[n*4+k]=rgb[k];im.data[n*4+3]=255}pc.putImageData(im,0,0);
 ctx.imageSmoothingEnabled=false;ctx.fillStyle='#000000';ctx.fillRect(0,0,320,200);ctx.drawImage(pic,0,8,320,168);blitText(ctx,'THE LIVING HIVE',104,0,'#ffff55');ctx.fillStyle='#000000';ctx.fillRect(0,168,320,32);
 blitText(ctx,hivePieces()+'/3',288,0,'#ffff55');
 if(!hiveWon)blitText(ctx,'STINGS '+hiveStings+'/3',8,0,'#ff5555');
 if(hiveWon){
  // The same white reward window/red inset used by the other minigames.
  ctx.fillStyle='#ffffff';ctx.fillRect(20,62,280,80);
  ctx.fillStyle='#aa0000';ctx.fillRect(22,64,276,76);
  ctx.fillStyle='#ffffff';ctx.fillRect(23,65,274,74);
  blitText(ctx,'Enough wax!',116,76,'#000000');
  blitText(ctx,'The bees are unharmed.',76,96,'#000000');
  blitText(ctx,'You tuck the flakes away.',64,112,'#000000');
  blitText(ctx,mobilePuzzleUI()?'TAP anywhere: continue':'ENTER / ESC: continue',48,187,'#ffff55');
 }else{
  blitText(ctx,hiveStatus,4,169,'#ffffff');
  blitText(ctx,mobilePuzzleUI()?'TAP anywhere: reach   Back: leave':'SPACE: reach  F2: sound  ESC: back',24,187,'#ffff55');
 }
 if(hiveHelp){ctx.fillStyle='#ffffff';ctx.fillRect(8,42,304,104);ctx.fillStyle='#aa0000';ctx.fillRect(10,44,300,100);ctx.fillStyle='#ffffff';ctx.fillRect(11,45,298,98);(mobilePuzzleUI()?hiveHelpLines.map(line=>line.includes('SPACE:')?'TAP anywhere: reach.':line.includes('ENTER:')?'TAP to begin. Back: return.':line):hiveHelpLines).forEach((line,i)=>blitText(ctx,line,20,51+i*10,'#000000'))}
 const panel=document.querySelector('#agi-message-window');panel.style.left='0%';panel.style.top='0%';panel.style.width='100%';panel.style.maxWidth='100%';panel.style.aspectRatio='320/240';
 msg.textContent=hiveWon?'Enough wax! The bees are unharmed. You tuck the flakes away. Enter or Escape to continue.':hiveHelp?hiveHelpText+' Enter to begin. Escape returns.':hiveStatus+(hiveGap()?' The reaching path is briefly clear.':' The bees sweep past the entrance.')+' Space to reach. Escape returns.';
 if(mobilePuzzleUI())msg.textContent=hiveWon?'Enough wax! The bees are unharmed. You tuck the flakes away. Tap anywhere to continue.':hiveHelp?'Watch the bees. Reach for loose wax when the path clears. Tap anywhere to begin, then tap to reach. Three stings send you back and drop your gathered flakes. Back returns.':hiveStatus+' Tap anywhere to reach. Back returns.';
 syncMobilePuzzleControls();
}
function hiveKey(event){if(event.repeat||event.isComposing)return;if(event.key==='F2'){soundEnabled=!soundEnabled;if(soundEnabled)hiveMusic();else stopGameSound();paintHive();return}if(event.key==='Escape'){if(hiveStings>=3)retreatFromHiveStings();else closeHive();return}if(['Enter',' '].includes(event.key))reachHive()}
window.addEventListener('blur',()=>{hiveFocused=false});window.addEventListener('focus',()=>{hiveFocused=true;hiveMusic()});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)hiveMusic()});

// Seed once on entry. Rendering and collision queries never consume randomness.
function makeHiveFlight(seed){
 let state=seed>>>0;
 const random=()=>{state=(state+0x6D2B79F5)>>>0;let n=state;n=Math.imul(n^(n>>>15),n|1);n^=n+Math.imul(n^(n>>>7),n|61);return ((n^(n>>>14))>>>0)/4294967296};
 return Array.from({length:12},(_,i)=>{
  const low=i%2===0;
  return {phase:random()*Math.PI*2,vertical:random()*Math.PI*2,
   period:low?54+random()*22:62+random()*30,direction:random()<.5?-1:1,
   radius:low?24+random()*6:47+random()*6,
   height:low?110:64,sway:low?8:34+random()*8,
   drift:random()*Math.PI*2};
 });
}
function hiveBees(frame=hiveFrame){
 return hiveFlight.map(bee=>{
  // Different speeds, directions and gentle course changes prevent a shared
  // repeating beat. Positions remain continuous and visible throughout a grab.
  const a=frame*Math.PI*2/bee.period*bee.direction+bee.phase+Math.sin(frame*.055+bee.drift)*.3;
  return [Math.round(80+Math.sin(a)*bee.radius),
   Math.round(bee.height+Math.sin(a*1.73+bee.vertical)*bee.sway)];
 });
}
