// The title uses the original Alder Pixel font over a native 160x168 PIC.
let titleMusicStarted=false;
let titleFrame=0,titleTimer=0,titleArt=null;
const openingBreathPath=[[39,86],[48,83],[58,79],[68,80],[78,84],[88,85],[98,82],[108,80]];
function openingBreathPoint(t){
 const at=Math.max(0,Math.min(.9999,t))*(openingBreathPath.length-1),i=Math.floor(at),f=at-i,a=openingBreathPath[i],b=openingBreathPath[i+1];
 return [Math.round(a[0]+(b[0]-a[0])*f),Math.round(a[1]+(b[1]-a[1])*f)];
}
function paintOpeningVoice(ctx){
 const dot=(x,y,c)=>{ctx.fillStyle=c;ctx.fillRect(x*2,20+y,2,1)};
 // Four staggered syllables travel mouth-to-glass; none resets the entire trail.
 for(let mote=0;mote<4;mote++){
  const t=((titleFrame+mote*12)%48)/48,[x,y]=openingBreathPoint(t);
  dot(x,y,mote%2?'#55ffff':'#ffffff');dot(x-2,y+1,'#00aaaa');
  if(mote%2===0)dot(x,y-1,'#ffffff');
 }
 // Wisps remain inside the silver glass. Their eight cels breathe in place.
 const cel=titleFrame%8;
 for(let strand=0;strand<2;strand++)for(let row=0;row<15;row++){
  const x=108+Math.round(Math.sin((row+cel+strand*4)*Math.PI/8)*4),y=66+row+strand*15;
  dot(x,y,row%5===0?'#55ffff':'#00aaaa');
 }
 const glints=[[94,58],[102,49],[119,115]];const [x,y]=glints[Math.floor(titleFrame/4)%glints.length];dot(x,y,'#ffffff');
}
// Clouds cross the window sky and moon, behind the stonework and figures.
const openingCloudMask=new Set(openingCloudSky);
function paintOpeningClouds(ctx){
 const drift=Math.floor(titleFrame/7);
 for(const [offset,top,width]of [[0,17,17],[29,28,13]]){
  const left=34+(drift+offset)%66;
  for(let dx=0;dx<width;dx++){
   const h=dx<3||dx>width-4?1:dx<6||dx>width-7?2:3;
   for(let dy=0;dy<h;dy++){
    const xx=left+dx,yy=top-dy;
    if(openingCloudMask.has(yy*160+xx)){
     ctx.fillStyle=dy===0?'#aaaaaa':'#5555ff';
     ctx.fillRect(xx*2,20+yy,2,1);
    }
   }
  }
 }
}
function paintOpening(){
 const bitmap=document.querySelector('#intro-picture');if(!document.querySelector('#intro')||!bitmap)return;
 bitmap.width=320;bitmap.height=200;const ctx=bitmap.getContext('2d');ctx.imageSmoothingEnabled=false;
 ctx.fillStyle='#000000';ctx.fillRect(0,0,320,200);
 if(!titleArt)titleArt=decodePicture(openingPicture);ctx.drawImage(titleArt,0,20,320,168);
 paintOpeningClouds(ctx);
 blitText(ctx,'ELARA',(320-5*8)/2,1,'#ffff55');blitText(ctx,'AND THE STOLEN VOICE',(320-20*8)/2,10,'#ffffff');
 if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches)paintOpeningVoice(ctx);
 const prompt=titleMusicStarted?'PRESS ENTER TO BEGIN':'PRESS ENTER FOR MUSIC';
 blitText(ctx,prompt,(320-prompt.length*8)/2,192,'#ffffff');
 const button=document.querySelector('#start');button.setAttribute('aria-label',titleMusicStarted?'Begin Elara and the Stolen Voice':'Play opening music');button.style.width='100%';button.style.maxWidth='100%';bitmap.style.width='100%';bitmap.style.height='100%';button.style.height='100%';
}
function startOpening(){paintOpening();if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches)titleTimer=setInterval(()=>{if(!document.querySelector('#intro')){clearInterval(titleTimer);titleTimer=0;return}if(!document.hidden){titleFrame++;paintOpening()}},1000*60/72/3)}
