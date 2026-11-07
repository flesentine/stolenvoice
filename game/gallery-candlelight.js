// Single native-pixel columns, each with its own irregular, unhurried flicker.
const candleFlameCels=['..6ee','.66ee','.6eee','..6ee','.666e','666ee'];
const galleryCandleState=[];let galleryCandleLastFrame=-1;
function galleryRaspberryResponse(wick,origin){
 // Compare distances in display space: native pixels are twice as wide and
 // 1.2 times as high. Measure from the first puff, rather than her feet.
 const distance=Math.hypot((wick[0]-origin.x)*2,(wick[1]-origin.y)*1.2);
 const strength=Math.max(0,1-distance/260);
 return{distance,start:7+Math.min(10,Math.floor(distance/20)),peak:Math.round(5+19*strength**1.35),duration:8+Math.round(8*strength)};
}
function galleryRaspberryFlare(frame,wick,origin){
 if(!origin||frame<5)return 0;
 const response=galleryRaspberryResponse(wick,origin),age=frame-response.start;
 if(age<0||age>=response.duration)return 0;
 const envelope=Math.min(1,(age+1)/2,(response.duration-age)/4);
 return Math.round(5+(response.peak-5)*envelope);
}
function paintGalleryFlare(wick,height,index,frame){
 for(let row=0;row<height;row++){
  const sway=row<height/3?((Math.floor(frame/2)+index)%3)-1:0;
  const half=row>height*.25&&row<height*.8?1:0;
  for(let dx=-half;dx<=half;dx++){
   const xx=wick[0]+sway+dx,yy=wick[1]-height+row;if(xx<0||xx>=160||yy<0||yy>=168)continue;
   // Orange rim, bright yellow body and a tiny white-hot core at the base.
   x.fillStyle=elaraColors[row>height-4&&dx===0?15:Math.abs(dx)===half&&half||row<2?6:14];x.fillRect(xx,yy,1,1);
  }
 }
}
function galleryCandleLight(){
 const action=typeof storyAction!=='undefined'&&storyAction?.kind==='royalRaspberry'?storyAction:null,fartFrame=action?.frame??-1;
 const tick=animationFrame!==galleryCandleLastFrame;galleryCandleLastFrame=animationFrame;
 for(const {left,top,width,pixels}of galleryCandlePatches){
  for(let n=0;n<pixels.length;n++){const c=EGA[pixels[n]];x.fillStyle='rgb('+c.join(',')+')';x.fillRect(left+n%width,top+Math.floor(n/width),1,1)}
 }
 for(let i=0;i<galleryCandlePatches.length;i++){
  let state=galleryCandleState[i];
  if(!state)state=galleryCandleState[i]={phase:Math.floor(Math.random()*6),hold:2+Math.floor(Math.random()*3)};
  else if(tick&&--state.hold<=0){state.phase=Math.floor(Math.random()*6);state.hold=2+Math.floor(Math.random()*3)}
  const {wick}=galleryCandlePatches[i];
  const flare=galleryRaspberryFlare(fartFrame,wick,action?.raspberryOrigin);
  if(flare){paintGalleryFlare(wick,flare,i,fartFrame);continue;}
  [...candleFlameCels[state.phase]].forEach((ink,yy)=>{if(ink==='.')return;x.fillStyle=elaraColors[parseInt(ink,16)];x.fillRect(wick[0],wick[1]+yy-5,1,1)});
 }
}
