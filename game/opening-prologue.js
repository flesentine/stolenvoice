// A separate irregular flicker runs on the existing intro clock. Repaints do
// not advance it, and reduced motion keeps a small steady flame.
const prologueFlameCels=['..6ee','.66ee','.6eee','..6ee','.666e','666ee'];
let prologueCandleState={phase:0,last:-1,next:0};
function paintPrologueCandle(ctx,frame,reduced=false){
 for(let n=0;n<prologueCandlePatch.length;n++){ctx.fillStyle=elaraColors[prologueCandlePatch[n]];ctx.fillRect((5+n%4)*2,8+25+Math.floor(n/4),2,1)}
 if(!reduced&&frame!==prologueCandleState.last){
  if(frame<prologueCandleState.last)prologueCandleState={phase:0,last:-1,next:0};
  if(frame>=prologueCandleState.next){prologueCandleState.phase=(prologueCandleState.phase+1+Math.floor(Math.random()*5))%6;prologueCandleState.next=frame+2+Math.floor(Math.random()*3)}
  prologueCandleState.last=frame;
 }
 const cel=prologueFlameCels[reduced?0:prologueCandleState.phase];
 [...cel].forEach((ink,y)=>{if(ink!=='.'){ctx.fillStyle=elaraColors[parseInt(ink,16)];ctx.fillRect(12,8+30+y,2,1)}});
}
// Six short, native-pixel scenes establish the mirror's motive before play.
let prologueActive=false,prologueFrame=0,prologueTimer=0,prologueAnchor=0,prologuePosition=0,prologueMusicStarted=0,prologueMusicSource=null;
const prologueArrival={x:102,y:206,step:1,facing:'left'};
const prologueCaptions=[
 ['Each morning, Merrin polished the glass','and sang the old songs of Alderwick.'],
 ['For years the mirror had heard no song.','Now it listened to every note.'],
 ['"Stay," whispered the lonely glass.','"A little song, to keep me company."'],
 ['It drew the song into its silver depths.','Then the singer fell silent.'],
 ['Merrin tried to call for help.','A tiny bell chimed instead of words.'],
 ['Outside, Elara found him waiting,','with a song in his heart, but no voice.']
];
function prologueBeat(){return Math.min(5,Math.floor(prologueFrame/prologueScore.sceneFrames))}
function finishPrologue(){
 if(prologueTimer)clearInterval(prologueTimer);prologueTimer=0;prologueActive=false;
 stopGameSound();prologueMusicSource=null;
 stopWalking();player={...prologueArrival};
 // Paint the arrival before revealing the game canvas beneath the messages.
 // Ambient animation is paused while those messages are open.
 draw();
 document.querySelector('#intro')?.remove();introSequence=true;
 introPages=[
  'Merrin touches his throat. A tiny bell chimes where his greeting should be. He points anxiously toward the castle.',
  'Use the arrow keys to walk. Press the same arrow to stop. Type what you want Elara to do, then press ENTER.',
  'F1: instructions. TAB: inventory. F2: sound. F5: save. F7: restore. ESC: menus and speed.'
 ];say(introPages.shift());
}
function prologueMusicDuration(){return prologueScore.sceneFrames*6*prologueScore.frameSeconds}
function resumePrologueScore(){
 if(!prologueActive||!soundEnabled)return;
 if(prologueMusicSource&&effectSource===prologueMusicSource){
  if(jingleContext?.state==='suspended')jingleContext.resume().catch(()=>{});
  return;
 }
 const offset=((Date.now()-prologueMusicStarted)/1000)%prologueMusicDuration();
 playGameSound('prologueStory',false,Math.max(0,offset));prologueMusicSource=effectSource;
}
function prologueSound(){resumePrologueScore()}
function syncPrologueClock(now=Date.now()){
 if(!prologueActive)return;
 prologuePosition+=Math.max(0,now-prologueAnchor)/(1000*prologueScore.frameSeconds*captionDuration);
 prologueAnchor=now;prologueFrame=Math.floor(prologuePosition+1e-7);
 if(prologueFrame>=prologueScore.sceneFrames*6){finishPrologue();return}
 paintPrologue();
}
function advancePrologue(){
 syncPrologueClock();if(!prologueActive)return;
 if(prologueBeat()===5){finishPrologue();return}
 prologuePosition=prologueFrame=(prologueBeat()+1)*prologueScore.sceneFrames;
 prologueAnchor=Date.now();paintPrologue();
}
function startPrologue(){
 if(titleTimer)clearInterval(titleTimer);titleTimer=0;stopOpeningJingle();
 prologueActive=true;prologuePosition=prologueFrame=0;prologueAnchor=prologueMusicStarted=Date.now();
 prologueMusicSource=null;prologueCandleState={phase:0,last:-1,next:0};prologueSound();paintPrologue();
 prologueTimer=setInterval(syncPrologueClock,prologueScore.frameSeconds*1000);
}
const prologueCloseupCache=new Map();
function paintDedicatedPrologue(ctx,stage,phase,reduced){
 // Story actions finish once; they must not rewind halfway through a caption.
 const cel=reduced?7:Math.min(7,Math.floor(phase*8/prologueScore.sceneFrames)),key=stage+':'+cel;
 if(!prologueCloseupCache.has(key))prologueCloseupCache.set(key,decodePicture(prologueCloseupPictures[stage][cel]));
 ctx.fillStyle='#000000';ctx.fillRect(0,0,320,200);
 ctx.drawImage(prologueCloseupCache.get(key),0,8,320,168);
 paintPrologueCandle(ctx,prologueFrame,reduced);
 blitText(ctx,'EARLIER THAT MORNING',84,0,'#ffff55');
 ctx.fillStyle='#000000';ctx.fillRect(0,168,320,32);
 prologueCaptions[stage].forEach((line,i)=>blitText(ctx,line,(320-line.length*8)/2,169+i*8,'#ffffff'));
 blitText(ctx,'ENTER: next   F2: sound   ESC: skip',28,192,'#aaaaaa');
 document.querySelector('#start').setAttribute('aria-label',prologueCaptions[stage].join(' ')+'. Enter: next. Escape: skip.');
}
function paintPrologue(){
 const bitmap=document.querySelector('#intro-picture');if(!bitmap)return;
 bitmap.width=320;bitmap.height=200;const ctx=bitmap.getContext('2d');ctx.imageSmoothingEnabled=false;
 const stage=prologueBeat(),reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const phase=reduced?0:prologueFrame%prologueScore.sceneFrames;
 if(stage!==5){paintDedicatedPrologue(ctx,stage,phase,reduced);return}
 const scene=document.createElement('canvas');scene.width=160;scene.height=168;const ink=scene.getContext('2d');
 const savedProps=sceneProps,savedAnimationFrame=animationFrame;sceneProps=[];
 // The prologue has its own clock while the playable room is paused.
 animationFrame=reduced?0:Math.floor(prologueFrame/2)%6;
 try{
  garden();
  // The garden queues its actors and props separately from the background.
  sceneProps.sort((a,b)=>a.depth-b.depth).forEach(item=>item.paint());
  ink.drawImage(sceneCanvas,0,0);
 }finally{sceneProps=savedProps;animationFrame=savedAnimationFrame}
 const step=reduced?16:Math.min(16,Math.floor(phase/2)),cels=elaraWalkSprites[prologueArrival.facing];
 const cel=cels[step<16?Math.floor(phase/3)%cels.length:prologueArrival.step];
 const left=pictureX(prologueArrival.x)-4+16-step,top=pictureY(prologueArrival.y)-39;
 for(let y=0;y<cel.length;y++)for(let xx=0;xx<cel[y].length;xx++){
  if(cel[y][xx]==='.')continue;ink.fillStyle=elaraColors[parseInt(cel[y][xx],16)];ink.fillRect(left+xx,top+y,1,1);
 }
 ctx.fillStyle='#000000';ctx.fillRect(0,0,320,200);ctx.drawImage(scene,0,8,320,168);
 blitText(ctx,'EARLIER THAT MORNING',84,0,'#ffff55');
 ctx.fillStyle='#000000';ctx.fillRect(0,168,320,32);
 prologueCaptions[stage].forEach((line,i)=>blitText(ctx,line,(320-line.length*8)/2,169+i*8,'#ffffff'));
 blitText(ctx,'ENTER: next   F2: sound   ESC: skip',28,192,'#aaaaaa');
 document.querySelector('#start').setAttribute('aria-label',prologueCaptions[stage].join(' ')+'. Enter: next. Escape: skip.');
}
// Keep the score running in the background; recover a browser-suspended context
// on return or a trusted input without creating a second source.
function recoverIntro(){
 if(prologueActive){syncPrologueClock();resumePrologueScore()}
 else if(document.querySelector('#intro')&&soundEnabled&&jingleSource&&jingleContext?.state==='suspended')jingleContext.resume().catch(()=>{});
}
window.addEventListener('focus',recoverIntro);
document.addEventListener('visibilitychange',recoverIntro);
document.addEventListener('pointerdown',recoverIntro);
document.addEventListener('keydown',recoverIntro,true);
