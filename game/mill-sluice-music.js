// The tray's music owns only its own source; sliding and reward cues take priority.
let sluiceMusicSource=null,sluiceMusicOffset=0,sluiceMusicStarted=0;
function sluiceMusicDuration(){return Math.max(...tandyCues.sluiceSong.map(v=>v.reduce((sum,[,d])=>sum+d,0)))}
function stopSluiceMusic(reset=true){
 if(sluiceMusicSource){sluiceMusicOffset=(sluiceMusicOffset+(Date.now()-sluiceMusicStarted)/1000)%sluiceMusicDuration();if(effectSource===sluiceMusicSource)stopGameSound();sluiceMusicSource=null}
 if(reset)sluiceMusicOffset=0;
}
function syncSluiceMusic(){
 if(!millSluiceOpen||room!==5||millSluiceReleaseFrame>=0){stopSluiceMusic();return}
 if(sluiceMusicSource&&effectSource!==sluiceMusicSource)stopSluiceMusic(false);
 if(!soundEnabled||document.hidden||!waterAnimationFocused||menuOpen){stopSluiceMusic(false);return}
 if(!sluiceMusicSource&&!effectSource){playGameSound('sluiceSong',false,sluiceMusicOffset,.22);if(effectSource){sluiceMusicSource=effectSource;sluiceMusicStarted=Date.now()}}
}
window.addEventListener('blur',()=>stopSluiceMusic(false));window.addEventListener('focus',syncSluiceMusic);
document.addEventListener('visibilitychange',syncSluiceMusic);
