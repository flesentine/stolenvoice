const merrinEndingLyrics=[
 'Cold silver stole my song away,',
 'Rosella brought it home today.',
 'Now let the bells of Daventry ring,',
 'And every waking robin sing.',
 'Sing hey! The thorn gives way to rose,',
 'And home the wandering music goes.',
 'Good friends, lift up a merry cheer,',
 'For song and spring are welcome here.'
];
let merrinPortraitCache=null;
function merrinPortraitPixels(){if(!merrinPortraitCache){const bytes=Uint8Array.from(atob(merrinEndingPicture),c=>c.charCodeAt(0));merrinPortraitCache=[];for(let i=0;i<bytes.length;i+=2)for(let n=0;n<bytes[i];n++)merrinPortraitCache.push(bytes[i+1])}return merrinPortraitCache}
function merrinSongDuration(){return Math.max(...tandyCues.merrinSong.map(v=>v.reduce((sum,n)=>sum+n[1],0)))}
// A native 160x168 portrait, hand drawn in flat EGA fills.
let merrinEndingTotal=198,merrinEndingReward=false;
let merrinEndingTimer=0,merrinEndingFrame=0,merrinEndingFocused=true,merrinEndingCanvas=null;
function drawMerrinPortrait(ctx,frame,finished=false){
 const colors=rosellaColors;
 const box=(a,b,w,h,c)=>{const right=Math.min(160,a+w),bottom=Math.min(168,b+h);a=Math.max(0,a);b=Math.max(0,b);if(right<=a||bottom<=b)return;ctx.fillStyle=colors[c];ctx.fillRect(a,b,right-a,bottom-b)};
 const line=(points,c)=>{for(let i=1;i<points.length;i++){let[a,b]=points[i-1];const[d,e]=points[i],dx=Math.abs(d-a),dy=-Math.abs(e-b),sx=a<d?1:-1,sy=b<e?1:-1;let err=dx+dy;for(;;){box(a,b,1,1,c);if(a===d&&b===e)break;const k=err*2;if(k>=dy){err+=dy;a+=sx}if(k<=dx){err+=dx;b+=sy}}}};
 const poly=(pts,c)=>{for(let y=Math.max(0,Math.min(...pts.map(p=>p[1])));y<=Math.min(167,Math.max(...pts.map(p=>p[1])));y++){const spans=[];for(let i=0,j=pts.length-1;i<pts.length;j=i++){const a=pts[j],b=pts[i];if((a[1]>y+.5)!==(b[1]>y+.5))spans.push(a[0]+(y+.5-a[1])*(b[0]-a[0])/(b[1]-a[1]))}spans.sort((a,b)=>a-b);for(let n=0;n+1<spans.length;n+=2)box(Math.ceil(spans[n]),y,Math.floor(spans[n+1])-Math.ceil(spans[n])+1,1,c)}};
 const pixels=merrinPortraitPixels(),bob=0;
 for(let y=0;y<168;y++)for(let a=0;a<160;){const color=pixels[y*160+a];let end=a+1;while(end<160&&pixels[y*160+end]===color)end++;box(a,y+(y<139?bob:0),end-a,1,color);a=end}
 const shape=(pts,c)=>poly(pts.map(([a,b])=>[Math.round(73+(a-73)*.68),b+bob]),c);
 const faceLine=(pts,c)=>line(pts.map(([a,b])=>[Math.round(73+(a-73)*.68),b]),c);
 // Short vowel cels follow a varied phrase; the jaw and skull stay fixed.
 const syllables=[0,1,1,2,1,3,0,0,1,2,2,1,0,3,1,0];
 const vowel=finished?0:syllables[Math.floor(frame/2)%syllables.length];
 shape([[75,53],[85,51],[90,53],[90,61],[86,65],[79,64],[74,59]],12);
 if(vowel===0){
  faceLine([[77,57],[81,60],[85,59],[88,56]],4);
  faceLine([[79,57],[84,56]],15);
 }else if(vowel===3){
  shape([[80,55],[84,54],[87,56],[86,61],[83,63],[80,60]],0);
  faceLine([[81,55],[84,55]],15);
 }else{
  shape([[77,56],[82,54],[87,55],[88,58],[85,61+(vowel===2?1:0)],[80,62],[77,59]],0);
  faceLine([[79,55],[85,55]],15);
  if(vowel===2)shape([[81,60],[85,59],[86,61],[82,62]],4);
 }
 // Blinks close over the existing eye locations without changing head shape.
 if(!finished&&frame%53===48){
  shape([[61,36],[70,36],[70,42],[61,42]],12);
  shape([[79,33],[86,33],[86,39],[79,39]],12);
  faceLine([[63,40],[68,39]],8);faceLine([[80,37],[84,36]],8);
 }
 if(!finished)for(const [i,nx]of [13,116].entries()){
  const phase=(frame+i*13)%40;if(phase>=22)continue;
  const ny=48-Math.floor(phase/2);
  line([[nx,ny+7],[nx,ny],[nx+3,ny+1]],14);box(nx-1,ny+7,2,2,14);
 }
 if(finished){
  box(12,137,136,29,1);
  const letters={T:['11111','00100','00100','00100','00100','00100','00100'],H:['10001','10001','10001','11111','10001','10001','10001'],E:['11111','10000','10000','11110','10000','10000','11111'],N:['10001','11001','11001','10101','10011','10011','10001'],D:['11110','10001','10001','10001','10001','10001','11110']};
  let left=20;for(const ch of 'THE END'){if(ch===' '){left+=12;continue}letters[ch].forEach((row,y)=>[...row].forEach((bit,x)=>{if(bit==='1'){box(left+x*3+1,141+y*3+1,3,3,6);box(left+x*3,141+y*3,3,3,14)}}));left+=18}
 }
}
function paintMerrinEnding(){
 if(!merrinEndingCanvas)return;
 const portrait=document.createElement('canvas');portrait.width=160;portrait.height=168;
 const finished=merrinEndingFrame>=merrinEndingTotal;drawMerrinPortrait(portrait.getContext('2d'),merrinEndingFrame,finished);
 const ctx=merrinEndingCanvas.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.fillStyle='#000000';ctx.fillRect(0,0,320,200);ctx.drawImage(portrait,0,8,320,168);
 blitText(ctx,'MERRIN FINDS HIS SONG',80,0,'#ffff55');
 const verse=Math.min(7,Math.floor(Math.max(0,merrinEndingFrame*.16-(merrinEndingReward?.385:0))/3.96));
 const lyric=merrinEndingLyrics[verse];
 if(!finished)blitText(ctx,lyric,Math.max(0,Math.floor((40-lyric.length)/2)*8),184,'#ffffff');
 else{blitText(ctx,'SCORE '+score+' OF '+MAX_SCORE,96,180,'#ffffff');blitText(ctx,'ENTER: play again',96,192,'#ffffff')}
}
function startMerrinEnding(canvas,reward=false){
 merrinEndingReward=reward;
 const prefix=reward?Math.max(...tandyCues.point.map(v=>v.reduce((n,p)=>n+p[1],0)))+.025:0;
 merrinEndingTotal=Math.ceil((merrinSongDuration()+prefix)/.16);
 merrinEndingCanvas=canvas;canvas.width=320;canvas.height=200;merrinEndingFrame=0;
 playGameSound('merrinSong',reward);paintMerrinEnding();
 if(merrinEndingTimer)clearInterval(merrinEndingTimer);
 merrinEndingTimer=setInterval(()=>{if(document.hidden||!merrinEndingFocused)return;merrinEndingFrame++;paintMerrinEnding();if(merrinEndingFrame>=merrinEndingTotal){clearInterval(merrinEndingTimer);merrinEndingTimer=0}},160);
}
window.addEventListener('blur',()=>{merrinEndingFocused=false});window.addEventListener('focus',()=>{merrinEndingFocused=true;resumeMerrinSong()});
function resumeMerrinSong(){if(merrinEndingTimer&&!document.hidden&&merrinEndingFocused)playGameSound('merrinSong',merrinEndingReward,merrinEndingFrame*.16)}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)resumeMerrinSong()});

function advanceMerrinEnding(){
 if(merrinEndingTimer){clearInterval(merrinEndingTimer);merrinEndingTimer=0;merrinEndingFrame=merrinEndingTotal;stopGameSound();paintMerrinEnding();return}
 location.reload();
}
