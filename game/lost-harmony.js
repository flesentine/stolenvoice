// Three sliding brass weights share strings: each changes more than one note.
const harmonyInitial=[1,5,2],harmonySolution=[4,1,5],harmonyNotes=[57,59,60,62,64,65,67];
let harmonyWeights=harmonyInitial.slice(),harmonyOpen=false,harmonySelected=0,harmonyTimer=0,harmonyPulse=0,harmonyPlaying='',harmonyBeat=0,harmonyFocused=true;
let harmonyHelp=false,harmonySolved=false;
const harmonyHelpLines=[
 'A bell-tower psaltery: three strings.',
 'The jar holds the tune to match.',
 '',
 'LEFT/RIGHT: choose a brass weight.',
 'UP/DOWN: raise or lower it.',
 'One weight changes several notes.',
 "WHITE frames mark the jar's notes.",
 "Solid COLOR tabs show your notes.",
 '',
 'L: hear JAR. ENTER: hear YOUR notes.',
 'Bring each tab into its WHITE frame.',
 '',
 'ENTER: begin. H: help.'
];
let harmonyStatus='The three strings share their tension.';
function harmonyPitches(weights=harmonyWeights){return[(weights[0]+weights[1])%7,(weights[0]+weights[1]+weights[2])%7,(weights[1]+weights[2])%7]}
function validHarmony(weights){return Array.isArray(weights)&&weights.length===3&&weights.every(v=>Number.isInteger(v)&&v>=0&&v<=6)}
function harmonyMatches(){return harmonyPitches().every((p,i)=>p===harmonyPitches(harmonySolution)[i])}
function resetHarmony(){if(harmonyTimer)clearInterval(harmonyTimer);harmonyTimer=0;harmonyOpen=false;harmonyHelp=false;harmonySolved=false;harmonyPlaying='';harmonyBeat=0}
function closeHarmony(){resetHarmony();document.querySelector('#agi-message-window').style.maxWidth='';textPopup.setAttribute('aria-label','Game message');closeMessage()}
function hearHarmony(target=false){
 const pitches=harmonyPitches(target?harmonySolution:harmonyWeights),melody=[];
 for(const pitch of pitches)melody.push([harmonyNotes[pitch]+12,.36],[0,.12]);
 tandyCues.harmonyListen=[melody,[[45,1.44]],[[0,1.44]]];
 playGameSound('harmonyListen');harmonyPlaying=target?'jar':'strings';harmonyBeat=0;
 harmonyStatus=target?'The jar answers: left, middle, right.':'The strings answer: left, middle, right.';
 if(harmonyOpen)paintHarmony();
}
function adjustHarmony(index,step){
 const value=Math.max(0,Math.min(6,harmonyWeights[index]+step));
 if(value===harmonyWeights[index]){harmonyStatus='The weight has reached its brass stop.';paintHarmony();return}
 harmonyWeights[index]=value;harmonyPlaying='';harmonyStatus='Linked strings change their notes.';playGameSound('sluiceTurn');
 if(harmonyMatches()){
  celebrateHarmony();return;
 }
 paintHarmony();
}
function celebrateHarmony(){
 flags.harmonyTuned=true;harmonySolved=true;harmonyPulse=0;
  harmonyPlaying='strings';harmonyBeat=0;harmonyStatus='The lost harmony is restored!';
  playGameSound('sluiceSolved');paintHarmony();return;
}
function continueHarmonySuccess(){
 if(!harmonySolved)return;
 closeHarmony();
 startBellPull('voice','The three notes weave into one clear harmony. Elara pulls the rope. The great bell answers, and the light in the jar becomes Merrin\'s living voice!');
}
function showHarmony(){
 if(room!==7){say('The bell-keeper\'s string instrument is in the belfry.');return}
 if(Math.hypot(player.x-hotspots[7].bell[0],player.y-hotspots[7].bell[1])>58&&!nearObject('mechanism'))return;
 if(flags.bellRung||flags.harmonyTuned){say('The three strings sing together. Their brass weights rest in harmony.');return}
 if(!flags.ropeFixed){say('The frayed pull-rope cannot bear the strain of testing the bell.');return}
 if(!flags.jarSealed){say('An oak string instrument hangs beside the bell. Three brass weights draw its strings over a shared bridge. A stone cradle beside it is just large enough for a jar, but the strings have no tune to answer.');return}
 stopWalking();say('The Lost Harmony.');agiMessagePages=[];harmonyOpen=true;harmonyHelp=true;harmonySelected=0;harmonyPulse=0;
 textPopup.setAttribute('aria-label','The Lost Harmony: three linked resonators');
 harmonyStatus='The jar sings; the strings answer.';hearHarmony(true);
 harmonyTimer=setInterval(()=>{if(!harmonyOpen||harmonyHelp||document.hidden||!harmonyFocused)return;harmonyPulse++;if(harmonyPlaying&&++harmonyBeat>=12)harmonyPlaying='';paintHarmony()},120);
}
function harmonyPixels(){
 const pixels=new Uint8Array(160*168).fill(7);
 const dot=(a,b,c)=>{a=Math.round(a);b=Math.round(b);if(a>=0&&a<160&&b>=0&&b<168)pixels[b*160+a]=c};
 const rect=(a,b,w,h,c)=>{for(let y=b;y<b+h;y++)for(let xx=a;xx<a+w;xx++)dot(xx,y,c)};
 const line=(a,b,c)=>{let[xx,y]=a;const[tx,ty]=b,dx=Math.abs(tx-xx),dy=-Math.abs(ty-y),sx=xx<tx?1:-1,sy=y<ty?1:-1;let err=dx+dy;for(;;){dot(xx,y,c);if(xx===tx&&y===ty)break;const q=err*2;if(q>=dy){err+=dy;xx+=sx}if(q<=dx){err+=dx;y+=sy}}};
 const oval=(cx,cy,rx,ry,c)=>{for(let y=-ry;y<=ry;y++){const span=Math.floor(rx*Math.sqrt(1-y*y/(ry*ry)));line([cx-span,cy+y],[cx+span,cy+y],c)}};
 // The belfry wall and a real oak psaltery, suspended from iron hooks.
 for(let y=12;y<165;y+=23){line([0,y],[159,y],8);for(let xx=(y%2?8:24);xx<160;xx+=37)line([xx,y],[xx,y+22],8)}
 rect(27,14,115,144,0);rect(28,15,113,141,6);
 for(const xx of [31,48,65,82,99,116,136])line([xx,21],[xx,150],8);
 for(const [xx,yy]of [[30,26],[138,26],[30,147],[138,147]]){rect(xx-1,yy-1,3,3,8);dot(xx,yy,7)}
 for(const [xx,yy]of [[51,119],[89,132],[131,116]]){line([xx,yy],[xx+2,yy-1],4);line([xx+2,yy-1],[xx+4,yy],4)}
 // Dark recessed soundboard, polished frame, and iron wall brackets.
 rect(33,29,100,73,0);rect(35,31,96,69,6);
 for(const xx of [39,57,75,93,111,127])line([xx,33],[xx,98],8);
 rect(25,15,119,8,0);rect(26,16,117,5,6);line([27,16],[142,16],14);
 for(const cx of [43,117]){rect(cx-2,9,5,7,8);rect(cx-1,10,3,4,0);dot(cx,10,7)}
 rect(25,152,119,6,0);rect(26,152,117,4,6);line([27,152],[142,152],14);
 // The sealed echo jar rests in its own stone cradle beside the strings.
 rect(3,94,24,3,8);line([4,94],[25,94],15);rect(7,97,15,4,8);
 rect(9,68,11,3,0);rect(10,69,9,2,4);line([11,69],[18,69],12);
 rect(10,71,9,5,3);rect(7,75,15,19,0);rect(8,76,13,17,3);
 rect(10,78,9,12,1);line([9,77],[9,90],11);line([10,91],[19,91],11);
 const flicker=Math.floor(harmonyPulse/2)%3;
 line([13,81],[16,80+flicker],11);line([16,80+flicker],[14,86],15);dot(15,88,11);
 // A few broken wisps connect the jar to the resonating wooden body.
 for(let n=0;n<4;n++)dot(23+n*2,76-((n+flicker)%3),n%2?15:11);
 const target=harmonyPitches(harmonySolution),current=harmonyPitches();
 const active=harmonyPlaying?Math.min(2,Math.floor(harmonyBeat/4)):-1;
 for(let i=0;i<3;i++){
  const cx=43+i*37,ink=[13,11,14][i];
  // Open sound holes and long brass strings make this a physical instrument.
  oval(cx,85,7,11,0);oval(cx,85,4,8,4);
  rect(cx-3,25,7,4,0);rect(cx-2,25,5,3,6);line([cx-2,25],[cx+2,25],14);
  const vibrating=harmonySolved||(active===i&&harmonyPlaying==='strings');
  line([cx,29],[cx,99],14);
  if(vibrating)for(let y=35;y<96;y+=2)dot(cx+(Math.floor((y+harmonyPulse)/4)%2?1:-1),y,15);
  // Ivory target brackets stay fixed; solid colored tabs show the live pitch.
  for(let pitch=0;pitch<7;pitch++){const yy=90-pitch*7;line([cx-3,yy],[cx-2,yy],7);line([cx+2,yy],[cx+3,yy],7)}
  const ty=90-target[i]*7,yy=90-current[i]*7;
  // A dark backing separates each white level mark from the wood grain.
  rect(cx-10,ty-4,21,9,0);rect(cx-8,ty-2,17,5,6);
  line([cx-9,ty-3],[cx+9,ty-3],15);line([cx-9,ty+3],[cx+9,ty+3],15);
  line([cx-9,ty-3],[cx-9,ty+3],15);line([cx+9,ty-3],[cx+9,ty+3],15);
  // Restore the continuous string through the open target socket.
  line([cx,ty-2],[cx,ty+2],14);
  // A filled, clipped-corner tab cannot disappear into a one-pixel vibration.
  rect(cx-6,yy-3,13,7,0);rect(cx-5,yy-2,11,5,ink);
  rect(cx-6,yy-1,13,3,ink);line([cx-3,yy-1],[cx+3,yy-1],15);
  if(current[i]===target[i]){dot(cx-9,ty,14);dot(cx+9,ty,14)}
  if(active===i){for(const sign of [-1,1]){dot(cx+sign*12,yy,15);dot(cx+sign*11,yy-2,ink)}}
  // A pulley and a hanging brass weight, attached to a shared tension bridge.
  oval(cx,105,4,4,0);oval(cx,105,3,3,6);
  const phase=harmonySolved?Math.floor(harmonyPulse/2)%4:0;
  const spoke=[[2,0],[1,2],[0,2],[-1,2]][phase];
  line([cx-spoke[0],105-spoke[1]],[cx+spoke[0],105+spoke[1]],14);dot(cx,105,7);
  line([cx,109],[cx,143],0);line([cx+1,109],[cx+1,143],14);
  for(let notch=0;notch<7;notch++)line([cx+3,111+notch*5],[cx+5,111+notch*5],8);
  const wy=141-harmonyWeights[i]*5;
  rect(cx-4,wy-3,9,7,0);rect(cx-3,wy-2,7,5,6);line([cx-3,wy-2],[cx+3,wy-2],14);line([cx-2,wy-1],[cx-2,wy+1],14);
  dot(cx,wy,8);line([cx-4,145],[cx+4,145],8);
  if(i===harmonySelected){line([cx-8,wy],[cx-6,wy],15);line([cx+6,wy],[cx+8,wy],15)}
 }
 // One continuous bridge explains why a weight changes several strings.
 rect(36,98,89,5,0);rect(37,99,87,3,6);
 line([38,99],[122,99],14);
 for(const cx of [43,80,117]){rect(cx-2,97,5,2,0);line([cx,97],[cx,100],14)}
 line([43,104],[80,108],0);line([80,108],[117,104],0);
 line([44,104],[80,107],14);line([80,107],[116,104],14);
 if(harmonySolved){
  // The shared bridge carries the answering note from one string to the next.
  const lead=(harmonyPulse*3)%87;
  for(let n=0;n<7;n++)dot(37+(lead+n)%87,100,n<3?15:11);
  for(let i=0;i<3;i++){
   const cx=43+i*37,yy=32+(harmonyPulse*3+i*21)%67;
   line([cx,yy],[cx,Math.min(99,yy+4)],15);
   const radius=8+(harmonyPulse+i*3)%6;
   for(const sign of [-1,1]){dot(cx+sign*radius,85,14);dot(cx+sign*(radius-1),82,11)}
  }
 }
 return pixels;
}
function paintHarmony(){
 const bitmap=document.querySelector('#agi-message-picture');bitmap.width=320;bitmap.height=200;
 const ctx=bitmap.getContext('2d'),pic=document.createElement('canvas');pic.width=160;pic.height=168;
 const pc=pic.getContext('2d'),im=pc.createImageData(160,168),pixels=harmonyPixels();
 for(let n=0;n<pixels.length;n++){const rgb=EGA[pixels[n]];for(let k=0;k<3;k++)im.data[n*4+k]=rgb[k];im.data[n*4+3]=255}pc.putImageData(im,0,0);
 ctx.imageSmoothingEnabled=false;ctx.fillStyle='#000';ctx.fillRect(0,0,320,200);ctx.drawImage(pic,0,8,320,168);
 blitText(ctx,'THE LOST HARMONY',96,0,'#ffff55');

 ctx.fillStyle='#000000';ctx.fillRect(0,168,320,32);
 blitText(ctx,harmonyStatus.slice(0,39),4,168,'#55ffff');
 if(harmonySolved){
  ctx.fillStyle='#ffffff';ctx.fillRect(28,18,264,24);
  ctx.fillStyle='#aa0000';ctx.strokeStyle='#aa0000';
  ctx.fillRect(30,20,260,1);ctx.fillRect(30,39,260,1);ctx.fillRect(30,20,1,20);ctx.fillRect(289,20,1,20);
  blitText(ctx,'Three voices sing as one!',64,26,'#000000');
  blitText(ctx,'The bridge hums; the pulleys turn.',24,176,'#ffffff');
  blitText(ctx,mobilePuzzleUI()?'TAP to continue':'ENTER / ESC: continue',48,188,'#ffff55');
 }else{
  blitText(ctx,mobilePuzzleUI()?'TAP rail: slide a brass weight':'ARROWS:adjust L:jar ENTER:hear',16,176,'#ffffff');
  blitText(ctx,mobilePuzzleUI()?'Jar / Notes: hear   Back: return':'H: help   R: reset   ESC: back',16,188,'#ffff55');
 }
 if(harmonyHelp){
  ctx.fillStyle='#ffffff';ctx.fillRect(8,30,304,136);
  ctx.fillStyle='#aa0000';ctx.fillRect(10,32,300,132);
  ctx.fillStyle='#ffffff';ctx.fillRect(11,33,298,130);
  (mobilePuzzleUI()?harmonyHelpLines.map(text=>text.startsWith('LEFT/RIGHT:')?'TAP a rail to place its weight.':text.startsWith('UP/DOWN:')?'Tap higher or lower along the rail.':text.startsWith('L: hear')?'Jar: hear JAR. Notes: hear YOURS.':text.startsWith('ENTER: begin.')?'TAP to begin. Help: these rules.':text):harmonyHelpLines).forEach((text,i)=>blitText(ctx,text,20,38+i*8,'#000000'));
 }
 const panel=document.querySelector('#agi-message-window');panel.style.left='0%';panel.style.top='0%';panel.style.width='100%';panel.style.maxWidth='100%';panel.style.aspectRatio='320/240';
 msg.textContent=harmonySolved?'The lost harmony is restored. Three voices sing as one. The shared bridge hums and the pulleys turn. Enter or Escape to continue.':harmonyHelp?harmonyHelpLines.join(' '):'The Lost Harmony. '+harmonyStatus+' The echo jar rests beside an oak psaltery. White frames mark the jar\'s notes beside the brass strings. Solid colored tabs show each answering string. Bring each tab inside its white frame. Left and right choose a weight; up and down slide it. Strings share tension, so one weight changes several notes. L repeats the jar; Enter plays your strings. Click a rail to move its weight. R resets. Escape returns.';
 if(mobilePuzzleUI())msg.textContent=harmonySolved?'The lost harmony is restored. Three voices sing as one. Tap to continue.':harmonyHelp?'The jar holds the tune to match. Tap a rail to slide its weight. One weight changes several notes. Bring each colored tab into its white frame. Jar repeats the jar; Notes plays your strings. Tap to begin.':harmonyStatus+' Tap a rail to move its weight, or a string to hear your notes. Jar repeats the jar. Notes plays your strings. Help shows the rules. Reset starts again. Back returns.';
 syncMobilePuzzleControls();
}
function harmonyKey(event){
 if(event.repeat||event.isComposing)return;
 const key=event.key;
 if(harmonySolved){if(['Enter',' ','Escape'].includes(key))continueHarmonySuccess();return}
 if(harmonyHelp){if(['Enter',' ','Escape'].includes(key)){harmonyHelp=false;hearHarmony(true)}return}
 if(key.toLowerCase()==='h'){harmonyHelp=true;paintHarmony();return}
 if(key==='Escape'){closeHarmony();return}
 if(key==='ArrowLeft'||key==='ArrowRight')harmonySelected=(harmonySelected+(key==='ArrowLeft'?2:1))%3;
 else if(key==='ArrowUp'||key==='ArrowDown'){adjustHarmony(harmonySelected,key==='ArrowUp'?1:-1);return}
 else if(key.toLowerCase()==='l'){hearHarmony(true);return}
 else if(key==='Enter'||key===' '){hearHarmony();return}
 else if(key.toLowerCase()==='r'){harmonyWeights=harmonyInitial.slice();harmonyStatus='The weights return to their first stops.';harmonyPlaying=''}
 else return;
 paintHarmony();
}
function harmonyClick(event){
 if(harmonySolved){continueHarmonySuccess();return}
 if(harmonyHelp){harmonyHelp=false;hearHarmony(true);return}
 const b=document.querySelector('#agi-message-picture').getBoundingClientRect();if(!b.width||!b.height)return;
 const px=(event.clientX-b.left)*160/b.width,py=(event.clientY-b.top)*200/b.height-8;
 const i=Math.round((px-43)/37);if(i<0||i>2||Math.abs(px-(43+i*37))>13)return;
 harmonySelected=i;
 if(py>=106&&py<=146){const next=Math.max(0,Math.min(6,Math.round((141-py)/5)));adjustHarmony(i,next-harmonyWeights[i])}
 else if(py>=38&&py<=99)hearHarmony();
 else paintHarmony();
}
function handleHarmonyIntent(text){
 if(room!==7)return false;
 if(/^(?:look(?: at)?|examine|inspect|listen(?: to)?|tune|adjust|use|play|touch|open) (?:the )?(?:resonators?|brass resonators?|strings?|brass strings?|weights?|brass weights?|shared bridge|wooden bridge|bridge|harmony|mechanism|bell mechanism|tuning mechanism|tuning weights?|bell strings?|psaltery|oak psaltery|instrument|oak string instrument|string instrument|bell instrument)$/.test(text)){showHarmony();return true}
 return false;
}
function drawHarmonyResonators(){
 // The same oak soundboard and three hanging weights as the close-up.
 const box=(a,b,w,h,c)=>{x.fillStyle=c;x.fillRect(a,b,w,h)};
 box(114,73,21,32,'#000000');box(115,74,19,30,'#aa5500');
 box(116,78,17,15,'#555555');box(117,78,15,14,'#aa5500');
 galleryInk([[115,74],[133,74]],'#ffff55');
 for(let i=0;i<3;i++){
  const left=118+i*6;
  box(left-1,85,3,5,'#000000');box(left,77,1,23,'#ffff55');
  box(left-1,95-Math.round(harmonyWeights[i]/2),3,3,'#000000');
  box(left,95-Math.round(harmonyWeights[i]/2),2,2,'#aaaaaa');
 }
 galleryInk([[117,91],[131,91]],'#ffff55');
}
window.addEventListener('blur',()=>{harmonyFocused=false});window.addEventListener('focus',()=>{harmonyFocused=true});
