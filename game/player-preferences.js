// Local presentation preferences are independent of quest saves.
const PLAYER_PREFERENCES_KEY='stolen-voice-player-preferences';
const captionDurations=[.75,1,1.5],captionDurationNames=['Short','Normal','Long'];
let masterVolume=1,captionDuration=1,masterGain=null,masterGainContext=null,preferenceNotice=null,preferenceNoticeTimer=0;
try{
 const saved=JSON.parse(localStorage.getItem(PLAYER_PREFERENCES_KEY)||'null');
 if(Number.isFinite(saved?.volume))masterVolume=Math.max(0,Math.min(1,saved.volume));
 if(captionDurations.includes(saved?.captionDuration))captionDuration=saved.captionDuration;
}catch{}
function gameAudioOutput(){
 if(!masterGain||masterGainContext!==jingleContext){
  masterGainContext=jingleContext;
  masterGain=jingleContext.createGain();masterGain.gain.value=masterVolume;
  masterGain.connect(jingleContext.destination);
 }
 return masterGain;
}
function storePlayerPreferences(){
 try{localStorage.setItem(PLAYER_PREFERENCES_KEY,JSON.stringify({volume:masterVolume,captionDuration}))}catch{}
}
function showPreferenceNotice(text){
 if(!preferenceNotice){
  preferenceNotice=document.createElement('div');preferenceNotice.className='preference-notice';
  preferenceNotice.setAttribute('role','status');preferenceNotice.setAttribute('aria-live','polite');
  preferenceNotice.style.cssText='position:fixed;bottom:12px;left:50%;transform:translateX(-50%);padding:8px 12px;background:#000;color:#fff;border:2px solid #aaa;font:14px monospace;z-index:100;pointer-events:none;max-width:90vw;text-align:center';
  document.body.append(preferenceNotice);
 }
 preferenceNotice.textContent=text;preferenceNotice.hidden=false;
 if(preferenceNoticeTimer)clearTimeout(preferenceNoticeTimer);
 preferenceNoticeTimer=setTimeout(()=>{preferenceNotice.hidden=true;preferenceNoticeTimer=0},1800);
}
function adjustMasterVolume(direction){
 masterVolume=Math.max(0,Math.min(10,Math.round(masterVolume*10)+direction))/10;
 if(masterGain)masterGain.gain.setTargetAtTime(masterVolume,jingleContext.currentTime,.015);
 storePlayerPreferences();showPreferenceNotice('Volume: '+Math.round(masterVolume*100)+'%'+(soundEnabled?'':' (muted)'));
}
function adjustCaptionDuration(direction){
 // Settle elapsed time at the previous rate before changing the current page.
 if(prologueActive)syncPrologueClock();
 captionDuration=captionDurations[Math.max(0,Math.min(2,captionDurations.indexOf(captionDuration)+direction))];
 storePlayerPreferences();showPreferenceNotice('Intro text duration: '+captionDurationNames[captionDurations.indexOf(captionDuration)]);
}
document.addEventListener('keydown',event=>{
 if(event.isComposing||event.ctrlKey||event.metaKey)return;
 if(event.altKey&&!event.shiftKey&&['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.key)){
  event.preventDefault();event.stopImmediatePropagation();
  if(event.repeat)return;
  if(event.key==='ArrowUp'||event.key==='ArrowDown')adjustMasterVolume(event.key==='ArrowUp'?1:-1);
  else adjustCaptionDuration(event.key==='ArrowRight'?1:-1);
  return;
 }
 if(event.altKey||event.shiftKey)return;
 if(['F1','F2','F3','F5','F7'].includes(event.key))event.preventDefault();
 if(document.querySelector('#intro')&&['F3','F5','F7'].includes(event.key))event.stopImmediatePropagation();
},true);
