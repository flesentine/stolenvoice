// Completed puzzles leave small, persistent signs of life. No extra quest flags.
let worldLifeFrame=0,worldLifeLastSound=0;
let grottoMusicSource=null,grottoMusicOffset=0,grottoMusicStarted=0,grottoMusicNext=0;
const grottoMusicDuration=Math.max(...tandyCues.grottoSong.map(voice=>voice.reduce((sum,[,length])=>sum+length,0)));
function syncGrottoMusic(){
 const now=Date.now();
 const pause=()=>{
  if(!grottoMusicSource)return;
  grottoMusicOffset=(grottoMusicOffset+(now-grottoMusicStarted)/1000)%grottoMusicDuration;
  if(effectSource===grottoMusicSource)stopGameSound();
  grottoMusicSource=null;
 };
 if(!playing||room!==6){pause();grottoMusicOffset=0;grottoMusicNext=0;return}
 if(grottoMusicSource&&effectSource!==grottoMusicSource)pause();
 const quiet=!soundEnabled||popupOpen||menuOpen||document.hidden||!waterAnimationFocused||storyAction||bellAction||millAction||hiveOpen||harmonyOpen||millSluiceOpen||swimState.active||swimState.dead;
 if(quiet){pause();return}
 if(!grottoMusicSource&&!effectSource&&now>=grottoMusicNext){
  playGameSound('grottoSong',false,grottoMusicOffset,.28);
  if(effectSource){grottoMusicSource=effectSource;grottoMusicStarted=now}
 }
}
function worldBirdsHere(){return flags.bellRung&&[0,3,4,8].includes(room)}
function worldLifePixels(){
 const pixels=[],dot=(x,y,color)=>{if(x>=0&&x<160&&y>=0&&y<168)pixels.push({x,y,color})};
 if(worldBirdsHere()){
  const perches={0:[[15,22],[127,18]],3:[[70,18],[133,24]],4:[[69,23],[119,13]],8:[[65,13],[122,24]]};
  perches[room].forEach(([px,py],i)=>{
   const x=px+Math.round(Math.sin(worldLifeFrame*Math.PI/12+i)*3),y=py+Math.round(Math.sin(worldLifeFrame*Math.PI/6+i));
   dot(x,y,0);dot(x+1,y,15);dot(x+2,y,0);
   const wing=worldLifeFrame%4<2?-1:0;
   dot(x-1,y+wing,0);dot(x+3,y+wing,0);
  });
 }
 if(room===0&&flags.voiceArrivalSeen){
  // Merrin's garden sprite remains in place; his tune rises beside his head.
  for(let i=0;i<2;i++){
   const step=(worldLifeFrame+i*5)%12,x=37+Math.floor(step/3)+i*3,y=111-Math.floor(step/2);
   dot(x,y,14);dot(x-1,y,14);dot(x,y-1,14);dot(x,y-2,14);dot(x+1,y-2,14);
  }
 }
 return pixels;
}
function drawWorldLife(){
 for(const pixel of worldLifePixels()){x.fillStyle=rosellaColors[pixel.color];x.fillRect(pixel.x,pixel.y,1,1)}
}
function tickWorldLife(){
 syncGrottoMusic();
 if(!playing||popupOpen||menuOpen||document.hidden||!waterAnimationFocused)return;
 worldLifeFrame=(worldLifeFrame+1)%120;
 // Leave foreground music, reward cues and action sounds completely alone.
 if(!soundEnabled||effectSource||storyAction||bellAction||millAction||hiveOpen||harmonyOpen||millSluiceOpen||swimState.active||swimState.dead)return;
 const cue=room===5&&flags.wheelTurned?'millWorking':worldBirdsHere()?'birdsAnswer':null;
 const now=Date.now();if(!cue||now-worldLifeLastSound<12000)return;
 playGameSound(cue,false,0,.22);worldLifeLastSound=now;
}
