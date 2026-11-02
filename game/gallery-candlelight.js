// Single native-pixel columns, each with its own irregular, unhurried flicker.
const candleFlameCels=['..6ee','.66ee','.6eee','..6ee','.666e','666ee'];
const galleryCandleState=[];let galleryCandleLastFrame=-1;
function galleryRaspberryFlare(frame){
 frame-=2; // Let the puff lead the candle reaction by two story ticks.
 if(frame<5||frame>=22)return 0;
 return Math.round(4+14*Math.min(1,(frame-4)/2,(22-frame)/6));
}
function paintGalleryFlare(wick,height,index,frame){
 for(let row=0;row<height;row++){
  const sway=row<height/3?((Math.floor(frame/2)+index)%3)-1:0;
  const half=row>height*.25&&row<height*.8?1:0;
  for(let dx=-half;dx<=half;dx++){
   const xx=wick[0]+sway+dx,yy=wick[1]-height+row;if(xx<0||xx>=160||yy<0||yy>=168)continue;
   // Orange rim, bright yellow body and a tiny white-hot core at the base.
   x.fillStyle=rosellaColors[row>height-4&&dx===0?15:Math.abs(dx)===half&&half||row<2?6:14];x.fillRect(xx,yy,1,1);
  }
 }
}
function galleryCandleLight(){
 const fartFrame=typeof storyAction!=='undefined'&&storyAction?.kind==='royalRaspberry'?storyAction.frame:-1,flare=galleryRaspberryFlare(fartFrame);
 const tick=animationFrame!==galleryCandleLastFrame;galleryCandleLastFrame=animationFrame;
 for(const {left,top,width,pixels}of galleryCandlePatches){
  for(let n=0;n<pixels.length;n++){const c=EGA[pixels[n]];x.fillStyle='rgb('+c.join(',')+')';x.fillRect(left+n%width,top+Math.floor(n/width),1,1)}
 }
 for(let i=0;i<galleryCandlePatches.length;i++){
  let state=galleryCandleState[i];
  if(!state)state=galleryCandleState[i]={phase:Math.floor(Math.random()*6),hold:2+Math.floor(Math.random()*3)};
  else if(tick&&--state.hold<=0){state.phase=Math.floor(Math.random()*6);state.hold=2+Math.floor(Math.random()*3)}
  const {wick}=galleryCandlePatches[i];
  if(flare){paintGalleryFlare(wick,flare,i,fartFrame);continue;}
  [...candleFlameCels[state.phase]].forEach((ink,yy)=>{if(ink==='.')return;x.fillStyle=rosellaColors[parseInt(ink,16)];x.fillRect(wick[0],wick[1]+yy-5,1,1)});
 }
}
