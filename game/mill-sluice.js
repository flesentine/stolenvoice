// Fixed-orientation troughs slide into two empty sockets; stone at slot 7 is fixed.
const millSluiceInitial=[2, 1, 1, 5, 1, 1, 0, 7, 1, 3, 4, 3, 1, 6, 5, 0];
const millSluiceSolved=[2, 5, 0, 0, 1, 1, 1, 7, 1, 1, 4, 5, 1, 3, 6, 3];
const millSluiceShapes=[[],[0,2],[1,3],[0,1],[1,2],[2,3],[0,3],[]];
let millSluiceTurns=millSluiceInitial.slice(),millSluiceOpen=false,millSluiceSelected=0,millSluiceTimer=0,millSluicePulse=0,millSluiceHeld=false,millSluiceHistory=[],millSluiceStatus='The troughs slide along fixed pins.';
let millSluiceReleaseFrame=-1;
function finishMillSluiceRelease(){
 if(millSluiceReleaseFrame<0)return;
 closeMillSluice();
 progress('wheelUnlocked','The wheel gathers speed. Gears clatter as the hoist raises the grain sack clear of the cupboard.');
}
function tickMillSluice(){
 syncSluiceMusic();
 if(!millSluiceOpen||document.hidden||!waterAnimationFocused)return;
 millSluicePulse++;
 if(millSluiceReleaseFrame>=0){
  millSluiceReleaseFrame=Math.min(36,millSluiceReleaseFrame+1);
  millSluiceStatus=millSluiceReleaseFrame<10?'Water pours into the waiting bucket.':millSluiceReleaseFrame<18?'The heavy bucket draws the brake up.':'The brake lifts clear. The cog stirs.';
 }
 paintMillSluice();
}
function validMillSluice(board){return Array.isArray(board)&&board.length===16&&board.every(v=>Number.isInteger(v)&&v>=0&&v<=7)&&board[7]===7&&board.slice().sort().join(',')===millSluiceInitial.slice().sort().join(',')}
function millSluiceFlow(board=millSluiceTurns){
 const visited=new Set(),path=[];let index=0,entry=3;
 while(!visited.has(index)){
  visited.add(index);const ports=millSluiceShapes[board[index]]||[];
  if(!ports.includes(entry))return{path,blocked:index,solved:false};
  const exit=ports.find(d=>d!==entry);path.push({index,entry,exit});
  const row=Math.floor(index/4),col=index%4,nr=row+[-1,0,1,0][exit],nc=col+[0,1,0,-1][exit];
  if(nr<0||nr>3||nc<0||nc>3)return{path,blocked:index,solved:index===15&&exit===1};
  index=nr*4+nc;entry=(exit+2)%4;
 }
 return{path,blocked:index,solved:false};
}
function resetMillSluiceControls(){millSluiceHeld=false;millSluiceHistory=[];millSluiceSelected=0;millSluiceStatus='The troughs slide along fixed pins.'}
function celebrateMillSluice(){
  millSluiceHeld=false;millSluiceReleaseFrame=0;millSluiceStatus='Water pours into the waiting bucket.';
  playGameSound('sluiceSolved');
  // Keep the mechanism visible before starting the room's separate hoist action.
  if(!millSluiceTimer)millSluiceTimer=setInterval(tickMillSluice,180);
}
function slideMillSluice(from,to){
 if(millSluiceReleaseFrame>=0)return false;
 if(from<0||from>=16||to<0||to>=16||Math.abs(Math.floor(from/4)-Math.floor(to/4))+Math.abs(from%4-to%4)!==1||!millSluiceTurns[from]||millSluiceTurns[from]===7||millSluiceTurns[to]!==0)return false;
 millSluiceHistory.push(millSluiceTurns.slice());millSluiceTurns[to]=millSluiceTurns[from];millSluiceTurns[from]=0;millSluiceSelected=to;millSluicePulse++;playGameSound('sluiceTurn');millSluiceStatus='The trough slides along its guide pins.';
 if(millSluiceFlow().solved){
  celebrateMillSluice();
 }
 return true;
}
function millSluicePixels(){
 const pixels=new Uint8Array(160*168).fill(8);
 const dot=(xx,yy,c)=>{if(xx>=0&&xx<160&&yy>=0&&yy<168)pixels[yy*160+xx]=c};
 const rect=(xx,yy,w,h,c)=>{for(let y=yy;y<yy+h;y++)for(let x=xx;x<xx+w;x++)dot(x,y,c)};
 const line=(a,b,c,w=1)=>{let[x,y]=a;const[xx,yy]=b,dx=Math.abs(xx-x),dy=-Math.abs(yy-y),sx=x<xx?1:-1,sy=y<yy?1:-1;let e=dx+dy;for(;;){rect(x,y,w,w,c);if(x===xx&&y===yy)break;const k=e*2;if(k>=dy){e+=dy;x+=sx}if(k<=dx){e+=dx;y+=sy}}};
 // Cut-stone wall, framed oak tray, and shallow carved channel blocks.
 for(let yy=6;yy<165;yy+=17){line([2,yy],[157,yy],7);for(let xx=9+(yy%2)*11;xx<157;xx+=29)line([xx,yy],[xx,yy+16],7)}
 rect(15,12,110,119,0);rect(16,13,108,117,6);line([17,13],[122,13],14);line([124,14],[124,130],0);
 const step=[[0,-14],[13,0],[0,14],[-13,0]],center=i=>[31+i%4*26,29+Math.floor(i/4)*28];
 millSluiceTurns.forEach((tile,i)=>{
  const[cx,cy]=center(i);rect(cx-12,cy-13,25,27,0);
  if(tile===0){rect(cx-11,cy-12,23,25,8);line([cx-9,cy+9],[cx+8,cy+9],0);dot(cx-7,cy-9,7);dot(cx+7,cy+7,7)}
  else if(tile===7){rect(cx-11,cy-12,23,25,7);line([cx-10,cy-11],[cx+9,cy-11],15);line([cx-9,cy+7],[cx+8,cy+7],8);for(const dx of [-8,8])for(const dy of [-8,8])rect(cx+dx,cy+dy,2,2,8)}
  else{
   rect(cx-11,cy-12,23,25,6);line([cx-10,cy-11],[cx+9,cy-11],14);line([cx+10,cy-10],[cx+10,cy+11],8);
   line([cx-7,cy+8],[cx-5,cy+9],0);line([cx+4,cy-7],[cx+7,cy-7],8);dot(cx+8,cy-6,8);line([cx-6,cy-9],[cx-3,cy-9],14);
   for(const d of millSluiceShapes[tile]){const q=[cx+step[d][0],cy+step[d][1]];line([cx-2,cy-2],[q[0]-2,q[1]-2],0,5);line([cx-1,cy-1],[q[0]-1,q[1]-1],8,3)}
   // Guide peg heads explain fixed orientations without obscuring the channels.
   dot(cx-8,cy-8,7);dot(cx+8,cy+9,7);
  }
  if(i===millSluiceSelected&&millSluiceReleaseFrame<0){const c=millSluiceHeld?14:15;for(const side of [[cx-12,cy-13,cx+12,cy-13],[cx-12,cy+13,cx+12,cy+13],[cx-12,cy-13,cx-12,cy+13],[cx+12,cy-13,cx+12,cy+13]])line(side.slice(0,2),side.slice(2),c)}
 });
 // Water is a continuous three-pixel stream. Traveling broken highlights
 // follow its direction through bends instead of changing color at each tile.
 const flow=millSluiceFlow();let distance=0;
 function stream(a,b){
  const dx=Math.sign(b[0]-a[0]),dy=Math.sign(b[1]-a[1]),length=Math.abs(b[0]-a[0])+Math.abs(b[1]-a[1]);
  line([a[0]-1,a[1]-1],[b[0]-1,b[1]-1],3,3);
  for(let n=0;n<=length;n++){
   const xx=a[0]+dx*n,yy=a[1]+dy*n,phase=((distance+n-millSluicePulse*2)%13+13)%13;
   dot(xx,yy,11);
   // Short white crests, with cyan gaps and a darker far bank.
   if(phase<3){dot(xx,yy,15);if(dx)dot(xx,yy-1,11);else dot(xx-1,yy,11)}
   else if(phase>7){dot(xx,yy,3);if(dx)dot(xx,yy+1,11);else dot(xx+1,yy,11)}
  }
  distance+=length;
 }
 // A shallow inlet lip makes the supply read as a wooden water chute.
 line([3,26],[17,26],6);line([3,32],[17,32],0);line([3,27],[17,27],14);
 stream([3,29],[18,29]);
 for(const part of flow.path){const[cx,cy]=center(part.index),a=step[part.entry],b=step[part.exit];stream([cx+a[0],cy+a[1]],[cx,cy]);stream([cx,cy],[cx+b[0],cy+b[1]])}
 if(flow.path.length&&!flow.solved){
  const last=flow.path.at(-1),[cx,cy]=center(last.index),d=step[last.exit],ex=cx+d[0],ey=cy+d[1],fall=millSluicePulse%4;
  // Water tumbles over the broken join; the foam stays at the lip.
  dot(ex-1,ey,15);dot(ex+1,ey+1,11);
  line([ex,ey+2+fall],[ex,ey+4+fall],11);dot(ex+1,ey+3+fall,3);
  dot(ex-2+(millSluicePulse%2)*4,ey+7,11);
 }
 // The filling pail sinks and pulls the brake clear through the overhead rope.
 const release=Math.max(0,millSluiceReleaseFrame),reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const fill=flow.solved?Math.min(1,release/12):0,drop=flow.solved?Math.round(Math.max(0,release-9)/9*4):0;
 const lower=reduced&&flow.solved?4:Math.min(4,drop),lift=Math.min(5,Math.round(lower*1.25));
 // A braced wall mount carries a small pulley and the brake linkage.
 rect(127,9,33,7,0);rect(128,10,32,4,6);line([129,10],[158,10],14);
 rect(156,15,4,72,8);rect(157,16,2,69,7);
 for(const yy of [20,82]){rect(156,yy,3,3,0);dot(157,yy,15)}
 // The bucket's rope runs beside the cog, never through its spokes.
 line([134,20],[134,133+lower],0,2);line([134,21],[134,132+lower],14);
 line([134,16],[154,16],6);line([135,15],[154,15],14);
 line([154,17],[154,37-lift],6);line([155,18],[155,36-lift],14);
 for(let dy=-4;dy<=4;dy++){
  const w=Math.floor(Math.sqrt(16-dy*dy));rect(134-w,20+dy,w*2+1,1,0);
 }
 for(let dy=-3;dy<=3;dy++){
  const w=Math.floor(Math.sqrt(9-dy*dy));rect(134-w,20+dy,w*2+1,1,7);
 }
 rect(133,19,3,3,8);dot(134,20,15);
 // Outlet chute and a real open stave bucket hanging beneath the pulley.
 line([122,111],[132,111],6);line([122,115],[134,115],0);line([134,113],[134,136+lower],8);
 rect(122,138+lower,23,3,7);rect(124,141+lower,19,15,6);line([124,156+lower],[142,156+lower],0);
 for(const xx of [127,132,138])line([xx,143+lower],[xx,154+lower],8);
 for(const yy of [144,153])line([124,yy+lower],[142,yy+lower],7);
 line([123,138+lower],[123,133+lower],8);line([123,133+lower],[144,133+lower],7);line([144,133+lower],[144,138+lower],8);
 rect(125,136+lower,17,3,0);
 if(flow.solved){
  const level=138+lower-Math.round(fill*2);
  rect(125,level,17,139+lower-level,3);line([125,level],[141,level],11);
  stream([122,113],[134,113]);stream([134,113],[134,level]);
  if(!reduced){dot(128+millSluicePulse%7,level-1,15);dot(135+millSluicePulse%4,level-2,11)}
 }
 // Toothed rim, inset spokes and a bolted hub distinguish the cog from
 // the narrow iron brake shoe pressing its upper edge.
 const angle=reduced?0:Math.max(0,release-18)*Math.PI/24;
 for(let i=0;i<12;i++){
  const a=angle+i*Math.PI/6;
  line([145+Math.round(Math.cos(a)*5),61+Math.round(Math.sin(a)*10)],
   [145+Math.round(Math.cos(a)*6),61+Math.round(Math.sin(a)*12)],0,2);
 }
 for(let dy=-9;dy<=9;dy++){
  const w=Math.floor(5*Math.sqrt(1-dy*dy/81));rect(145-w,61+dy,w*2+1,1,6);
 }
 for(let dy=-7;dy<=7;dy++){
  const w=Math.floor(3*Math.sqrt(1-dy*dy/49));rect(145-w,61+dy,w*2+1,1,8);
 }
 for(let i=0;i<4;i++){
  const a=angle+i*Math.PI/2;
  line([145,61],[145+Math.round(Math.cos(a)*4),61+Math.round(Math.sin(a)*8)],14);
 }
 rect(144,59,3,5,0);rect(145,60,1,3,7);dot(145,61,15);
 // Pivoted arm lifts the shoe as the water-filled bucket descends.
 line([155,39],[145,48-lift],0,3);line([155,39],[145,48-lift],6,2);
 rect(138,48-lift,14,3,0);line([139,48-lift],[150,48-lift],7);
 rect(153,37,5,5,0);rect(154,38,3,3,7);dot(155,39,15);
 return pixels;
}
function paintMillSluice(){
 const pixels=millSluicePixels(),bitmap=document.querySelector('#agi-message-picture');bitmap.width=320;bitmap.height=200;
 const ctx=bitmap.getContext('2d'),pic=document.createElement('canvas');pic.width=160;pic.height=168;const pc=pic.getContext('2d'),im=pc.createImageData(160,168);
 for(let n=0;n<pixels.length;n++){const rgb=EGA[pixels[n]];im.data[n*4]=rgb[0];im.data[n*4+1]=rgb[1];im.data[n*4+2]=rgb[2];im.data[n*4+3]=255}pc.putImageData(im,0,0);ctx.imageSmoothingEnabled=false;ctx.fillStyle='#000000';ctx.fillRect(0,0,320,200);ctx.drawImage(pic,0,8,320,168);
 blitText(ctx,"THE MILLER'S SLUICE",84,0,'#ffffff');
 // A dedicated black footer keeps the lettering off the masonry.
 ctx.fillStyle='#000000';ctx.fillRect(0,168,320,32);
 blitText(ctx,millSluiceStatus,8,168,'#55ffff');
 if(millSluiceReleaseFrame>=0){
  blitText(ctx,'The current has found its way through.',8,184,'#ffffff');
  if(millSluiceReleaseFrame>=36){
   // Keep the completed mechanism alive behind a message the player controls.
   ctx.fillStyle='#ffffff';ctx.fillRect(20,64,280,64);
   ctx.fillStyle='#aa0000';ctx.fillRect(22,66,276,60);
   ctx.fillStyle='#ffffff';ctx.fillRect(23,67,274,58);
   blitText(ctx,'The current has found its way!',40,76,'#000000');
   blitText(ctx,'The bucket fills and the brake',40,92,'#000000');
   blitText(ctx,'lifts clear. The wheel is free.',40,100,'#000000');
   blitText(ctx,mobilePuzzleUI()?'TAP to continue':'ENTER / ESC: continue',48,192,'#ffff55');
   msg.textContent='The current has found its way! The bucket fills and the brake lifts clear. The wheel is free. '+(mobilePuzzleUI()?'Tap to continue.':'Enter or Escape to continue.');
  }else msg.textContent=millSluiceStatus;
  syncMobilePuzzleControls();return;
 }
 blitText(ctx,mobilePuzzleUI()?'TAP trough, then empty socket':'ARROWS: choose a trough',8,176,'#ffffff');
 blitText(ctx,mobilePuzzleUI()?'Undo / Reset: change the tray':'ENTER: hold/drop  ARROWS: slide',8,184,'#ffffff');
 blitText(ctx,mobilePuzzleUI()?'Back: return':'U: undo     R: reset     ESC: return',8,192,'#aaaaaa');
 const panel=document.querySelector('#agi-message-window');panel.style.left='0%';panel.style.top='0%';panel.style.width='100%';panel.style.maxWidth='100%';panel.style.aspectRatio='320/240';
 msg.textContent=millSluiceStatus+' Slot '+(millSluiceSelected+1)+'. '+(millSluiceHeld?'Holding trough; arrows slide it into an adjacent empty socket. Enter releases it. Escape returns.':'Arrow keys choose a block; Enter holds it. Escape returns.')+' U undoes a slide. R resets the tray. Connect the inlet to the bucket; troughs cannot rotate, and the stone is fixed.';
 if(mobilePuzzleUI())msg.textContent=millSluiceStatus+' Tap a trough, then an adjacent empty socket to slide it. Undo reverses a slide. Reset restores the tray. Back returns. Connect the inlet to the bucket; troughs cannot rotate, and the stone is fixed.';
 syncMobilePuzzleControls();
}
function closeMillSluice(){
 stopSluiceMusic();
 if(millSluiceTimer)clearInterval(millSluiceTimer);millSluiceTimer=0;millSluiceReleaseFrame=-1;millSluiceOpen=false;millSluiceHeld=false;
 document.querySelector('#agi-message-window').style.maxWidth='';textPopup.setAttribute('aria-label','Game message');closeMessage();
}
function showMillSluice(){
 if(room!==5){say('The miller\'s balance is inside the watermill.');return}
 if(Math.hypot(player.x-hotspots[5].wheel[0],player.y-hotspots[5].wheel[1])>85&&!nearObject('mechanism'))return;
 if(flags.wheelUnlocked){say('Water runs through the connected troughs into the counterweight bucket. The lifted brake leaves the wheel free.');return}
 stopWalking();say('The miller\'s sluice.');agiMessagePages=[];millSluiceOpen=true;syncSluiceMusic();millSluiceHeld=false;millSluiceReleaseFrame=-1;textPopup.setAttribute('aria-label',"The miller's sliding sluice puzzle");paintMillSluice();
 if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches)millSluiceTimer=setInterval(tickMillSluice,180);
}
function millSluiceClick(event){
 if(millSluiceReleaseFrame>=0){if(millSluiceReleaseFrame>=36)finishMillSluiceRelease();return}
 const bounds=document.querySelector('#agi-message-picture').getBoundingClientRect();
 if(!bounds.width||!bounds.height)return;
 const x=(event.clientX-bounds.left)*160/bounds.width,y=(event.clientY-bounds.top)*200/bounds.height-8;
 const col=Math.floor((x-18)/26),row=Math.floor((y-15)/28);
 if(x<18||x>=122||y<15||y>=127||col<0||col>3||row<0||row>3)return;
 const target=row*4+col,tile=millSluiceTurns[target];
 if(tile===0){
  if(!millSluiceHeld||!slideMillSluice(millSluiceSelected,target))millSluiceStatus='Choose a trough beside that gap.';
  else millSluiceHeld=false;
 }else if(tile===7){millSluiceStatus='The stone block is bolted to the frame.';millSluiceHeld=false;millSluiceSelected=target}
 else{
  const gaps=millSluiceTurns.map((v,i)=>v===0&&Math.abs(Math.floor(i/4)-row)+Math.abs(i%4-col)===1?i:-1).filter(i=>i>=0);
  millSluiceSelected=target;millSluiceHeld=true;
  millSluiceStatus=gaps.length?(mobilePuzzleUI()?'Tap an adjacent empty socket to slide.':'Click an adjacent empty socket to slide.'):'No empty socket beside this trough.';
 }
 if(millSluiceOpen)paintMillSluice();
}
function millSluiceKey(event){
 if(event.isComposing||event.repeat)return;
 const key=event.key;
 if(millSluiceReleaseFrame>=0){if(millSluiceReleaseFrame>=36&&['Enter',' ','Escape'].includes(key))finishMillSluiceRelease();return}
 if(key==='Escape'){closeMillSluice();return}
 if(key.toLowerCase()==='u'){
  if(millSluiceHistory.length){millSluiceTurns=millSluiceHistory.pop();millSluiceHeld=false;millSluiceStatus='You slide the last trough back.';playGameSound('sluiceTurn')}else millSluiceStatus='No slides to undo.';
 }else if(key.toLowerCase()==='r'){
  if(millSluiceTurns.join()!==millSluiceInitial.join()){millSluiceHistory.push(millSluiceTurns.slice());millSluiceTurns=millSluiceInitial.slice()}
  millSluiceHeld=false;millSluiceStatus='The troughs return to their places.';
 }else if(['Enter',' '].includes(key)){
  if(millSluiceHeld)millSluiceHeld=false;
  else if(millSluiceTurns[millSluiceSelected]===7)millSluiceStatus='The stone block is bolted to the frame.';
  else if(millSluiceTurns[millSluiceSelected]===0)millSluiceStatus='An empty socket leaves room to slide.';
  else{millSluiceHeld=true;millSluiceStatus='You grip the wooden trough.'}
 }else if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(key)){
  const dr=key==='ArrowUp'?-1:key==='ArrowDown'?1:0,dc=key==='ArrowLeft'?-1:key==='ArrowRight'?1:0,r=Math.floor(millSluiceSelected/4)+dr,c=millSluiceSelected%4+dc;
  if(millSluiceHeld){if(r<0||r>3||c<0||c>3)millSluiceStatus='The frame stops the trough.';else if(!slideMillSluice(millSluiceSelected,r*4+c))millSluiceStatus='No empty socket in that direction.';if(!millSluiceOpen)return}
  else millSluiceSelected=((r+4)%4)*4+(c+4)%4;
 }else return;
 paintMillSluice();
}
function handleMillSluiceIntent(text){
 if(room===7)return false;
 if(/^(?:look(?: at)?|examine|inspect|adjust|turn|rotate|align|use|work|repair|fix|unlock|open) (?:the )?(?:tray|water tray|sluice tray|sluice|sluice panel|sluice board|panel|control panel|controls|water panel|water puzzle|puzzle|trough panel|blocks|wooden blocks|trough blocks|troughs?|water channels|channels?|balance panel|balance|counterweight|brake|wheel lock|wheel mechanism|mechanism)$/.test(text)||/^(?:unlock|repair|fix|adjust|use|operate) (?:the )?(?:wheel|mill wheel|waterwheel)$/.test(text)){showMillSluice();return true}
 if(/^(?:move|slide|arrange|rearrange|shift) (?:the )?(?:blocks|troughs|tiles|channels|wooden blocks|trough blocks)$/.test(text)){showMillSluice();return true}
 return false;
}
function drawMillSluicePanel(){
 x.fillStyle='#000000';x.fillRect(108,48,29,23);x.fillStyle='#aa5500';x.fillRect(109,49,27,21);
 for(let i=0;i<16;i++){const xx=111+i%4*6,yy=51+Math.floor(i/4)*4;x.fillStyle=i===7?'#aaaaaa':millSluiceTurns[i]===0?'#555555':flags.wheelUnlocked?'#55ffff':'#ffff55';x.fillRect(xx,yy,4,2)}
 galleryInk([[139,51],[139,68]],'#aa5500');x.fillStyle=flags.wheelUnlocked?'#55ffff':'#aaaaaa';x.fillRect(137,flags.wheelUnlocked?52:62,5,3);
}
