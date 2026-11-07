// Optional three-beat gag: sit, read the complaint, then nurse a royal back.
// The cinematic moves only painted pixels; walking can interrupt it safely.
function startChairRest(){
 if(storyAction?.kind==='voiceFollow')finishStoryEffect(false);
 startStoryEffect('chairRest',flags.voiceReturned?'You settle into the purple chair. The silence is peaceful. The cushion is apparently carved from the same stone as the castle.':'You try the purple chair. The cushion has all the softness of a paving stone. Royal posture, it seems, is mostly suffering.',{stage:'sit'});
}
function showChairRestMessage(){
 if(storyAction?.kind!=='chairRest')return;
 playChairCreak();
 storyAction.stage='message';storyAction.frame=12;draw();say(storyAction.message);
}
function playChairCreak(){
 if(storyAction?.kind!=='chairRest'||storyAction.chairCreakPlayed)return;
 storyAction.chairCreakPlayed=true;playGameSound('chairCreak',false,0,.55);
}
function advanceChairRestMessage(){
 if(storyAction?.kind==='chairRest'&&storyAction.stage==='message'&&!agiMessagePages.length){storyAction.stage='pace';storyAction.frame=0;storyAction.message='';storyAction.soundPaused=true;resumeStoryScore()}
}
function tickChairRest(){
 storyAction.frame++;
 if(storyAction.stage==='sit'&&storyAction.frame===8)playChairCreak();
 if(storyAction.stage==='sit'&&storyAction.frame>=12){showChairRestMessage();return}
 if(storyAction.stage==='pace'&&storyAction.frame>=48){finishStoryEffect(false);say('"Ow! My royal back!" Elara mutters. "Next time I shall sit on the floor. It has more padding."');return}
 draw();
}
function chairPaceOffset(frame){
 if(frame<8)return 0;
 const wanted=Math.round(Math.sin((frame-8)*Math.PI/10)*10),direction=Math.sign(wanted);let offset=0;
 for(let n=1;n<=Math.abs(wanted);n++){if(!clearGroundStep(player.x,player.y,player.x+direction*n,player.y))break;offset=direction*n}
 return offset;
}
function drawChairRestHero(px,py){
 if(storyAction?.kind!=='chairRest')return false;
 const {stage,frame}=storyAction;
 if(stage!=='pace'||frame<8){
  const sit=stage==='pace'?1-frame/8:Math.min(1,frame/8),rows=elaraWalkSprites.front[1];
  const left=Math.round((pictureX(px)-4)*(1-sit)+107*sit),top=Math.round((pictureY(py)-39)*(1-sit)+78*sit);
  for(let row=0;row<40;row++)for(let col=0;col<8;col++){
   const ink=rows[row][col];if(ink==='.')continue;
   const knee=row>=25?Math.round(Math.sin((row-25)/14*Math.PI)*sit*2)*(col<4?-1:1):0;
   const y=top+(row<25?row:25+Math.round((row-25)*(1-.4*sit)));
   x.fillStyle=elaraColors[parseInt(ink,16)];x.fillRect(left+col+knee,y,1,1);
  }
  return true;
 }
 const offset=chairPaceOffset(frame),previous=chairPaceOffset(frame-1),direction=offset===previous?(frame%20<10?1:-1):Math.sign(offset-previous);
 const facing=direction>0?'right':'left',rows=elaraWalkSprites[facing][Math.floor(frame/3)%4],left=pictureX(px+offset)-4,top=pictureY(py)-39;
 ellipse(px+offset,py+1,7,1,'#000000');
 // Repaint the cloth underneath the resting arm before moving it to her back.
 const torso=facing==='left'?3:2;
 for(let row=14;row<=24;row++)for(let col=torso;col<torso+3;col++){x.fillStyle=elaraColors[row<16?15:row<20?1:9];x.fillRect(left+col+direction,top+row+1,1,1)}
 for(let row=0;row<40;row++)for(let col=0;col<8;col++){
  const ink=rows[row][col];if(ink==='.'||(row>=14&&row<=24&&ink==='c'))continue;
  x.fillStyle=elaraColors[parseInt(ink,16)];x.fillRect(left+col+(row<25?direction:0),top+row+(row<25?1:0),1,1);
 }
 const shoulder=[left+(direction>0?4:3)+direction,top+15],elbow=[shoulder[0]-direction*3,top+21],hand=[left+(direction>0?1:6),top+23];
 galleryInk([shoulder,elbow],'#ffffff');galleryInk([elbow,hand],'#ff5555');x.fillStyle='#ff5555';x.fillRect(hand[0],hand[1],2,2);
 if(frame%12<3){galleryInk([[hand[0]-direction*3,hand[1]-2],[hand[0]-direction*4,hand[1]-3]],'#ff5555')}
 return true;
}
