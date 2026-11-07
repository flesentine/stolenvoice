// Opt-in, local-only event recording. Never observes keyboard text or media.
const PLAYTEST_KEY='elara-playtest-v1',PLAYTEST_BACKUP_KEY='elara-playtest-previous-v1',PLAYTEST_LIMIT=10000;
let playtestTimer=0,playtest=null,playtestDialog=null,playtestPopupBefore=false,playtestLast=Date.now(),playtestFocused=true,playtestWasActive=false,playtestLastMilestone=0,playtestStall=false,playtestLastCommand='',playtestRepeats=0;
function playtestActive(){return playing&&!popupOpen&&!menuOpen&&!playtestDialog&&!document.hidden&&playtestFocused}
function playtestTick(){
 const now=Date.now(),active=playtestActive();
 if(playtest&&!playtest.endedAt){
  // Only count time whose preceding interval was active; blur/visibility handlers
  // settle it immediately so a background tab never accumulates active time.
  if(playtestWasActive)playtest.activeMs+=Math.max(0,now-playtestLast);
  if(active!==playtestWasActive)playtestRecord(active?'resume':'pause');
  if(!playtestStall&&playtest.activeMs-playtestLastMilestone>=600000){playtestStall=true;playtestRecord('possible_trouble',{reason:'10 active minutes without a milestone; interpretation requires review'})}
 }
 playtestWasActive=active;playtestLast=now;
}
function playtestPersist(){if(!playtest)return;try{localStorage.setItem(PLAYTEST_KEY,JSON.stringify(playtest));playtest.storageAvailable=true}catch{playtest.storageAvailable=false}}
function playtestRecord(type,data={}){
 if(!playtest||playtest.endedAt)return;
 playtest.lastState={room,score,completed:flags.complete};
 if(playtest.events.length>=PLAYTEST_LIMIT){playtest.truncated=true;playtestPersist();return}
 playtest.events.push({sequence:playtest.events.length+1,at:new Date().toISOString(),activeMs:Math.round(playtest.activeMs),room,roomName:rooms[room],type,...data});
 playtestPersist();
}
function storedPlaytest(key=PLAYTEST_KEY){
 try{const report=JSON.parse(localStorage.getItem(key));return report?.format==='elara-playtest'&&report.formatVersion===1&&Array.isArray(report.events)&&report.events.length<=PLAYTEST_LIMIT?report:null}catch{return null}
}
function offerCompletedPlaytest(){
 if(!playtest||(!playtest.lastState?.completed&&(!flags.complete||playtest.endedAt)))return false;
 playtestTick();playtestPersist();showPlaytest('complete');return true;
}
function startPlaytest(){
 // Keep the previous draft before a new recording can replace the active slot.
 const previous=playtest||storedPlaytest();
 if(previous){try{localStorage.setItem(PLAYTEST_BACKUP_KEY,JSON.stringify(previous))}catch{playtest=previous;showPlaytest();return false}}
 playtest={format:'elara-playtest',formatVersion:1,build:PLAYTEST_BUILD,startedAt:new Date().toISOString(),activeMs:0,events:[],feedback:{},truncated:false};
 playtestLast=Date.now();playtestWasActive=playtestActive();playtestLastMilestone=0;playtestStall=false;playtestRepeats=0;playtestLastCommand='';
 if(playtestTimer)clearInterval(playtestTimer);playtestTimer=setInterval(()=>{playtestTick();playtestPersist()},1000);
 playtestRecord('start',{score,flags:{...flags},inventory:[...inv]});updatePlaytestControls();
}
function playtestReport(){playtestTick();return JSON.stringify({...playtest,exportedAt:new Date().toISOString(),summary:{...(playtest.endedAt?playtest.lastState||{}:{room,score,completed:flags.complete}),eventCount:playtest.events.length,activeMinutes:Math.round(playtest.activeMs/600)/100},privacy:'Submitted commands, responses, events, notes and feedback only. No video, audio, keystrokes, account details or page URL.'},null,2)}
function downloadPlaytest(){
 if(!playtest)return false;
 let url;
 try{const report=playtestReport();url=URL.createObjectURL(new Blob([report],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='elara-playtest-'+playtest.startedAt.replace(/[:.]/g,'-')+'.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);return true}
 catch{if(url)URL.revokeObjectURL(url);return false}
}
function updatePlaytestControls(){if(!playtestControls)return;playtestControls.textContent=playtest&&!playtest.endedAt?'Playtest recording • Notes / Finish':'Playtest / Reports'}
function closePlaytest(){if(!playtestDialog)return;playtestTick();const d=playtestDialog;playtestDialog=null;popupOpen=playtestPopupBefore;d.close();d.remove();playtestTick();c.focus()}
function showPlaytest(mode='panel'){
 const finishing=mode==='finish'||mode==='complete';
 if(playtestDialog)return;
 stopWalking();playtestTick();
 const d=document.createElement('dialog');playtestPopupBefore=popupOpen;popupOpen=true;playtestDialog=d;d.className='save-file-dialog playtest-dialog';d.setAttribute('aria-labelledby','playtest-title');
 const heading=document.createElement('h2');heading.id='playtest-title';heading.textContent=mode==='complete'?'Adventure complete — save your report':'Playtest recording';d.append(heading);
 const p=document.createElement('p');p.textContent=mode==='complete'?'Your adventure is complete. Finish your report and download it before playing again. Your commands, responses and notes are still here. A copy stays in this browser when storage is available.':'Optional: record submitted commands, game responses, room changes, progress, active time, saves, retries and errors. Notes and feedback are included. No video, microphone or keystroke recording. Nothing is uploaded. Download the report and send it to the organizer. A local draft is kept in this browser when storage is available; it is separate from your game save.';d.append(p);
 const button=(label,fn)=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',fn);d.append(b);return b};
 let first;
 if(!playtest){
  first=button('Start recording',()=>{closePlaytest();startPlaytest()});
  const previous=storedPlaytest();
  if(previous)button('Recover previous report',()=>{playtest=previous;if(!playtest.endedAt)playtest.endedAt=new Date().toISOString();closePlaytest();playtestPersist();updatePlaytestControls();showPlaytest()});
 }else{
  const status=document.createElement('p');status.textContent=(playtest.endedAt?'Recording stopped. ':'Recording is on. ')+(playtest.storageAvailable===false?'Browser storage is unavailable: download before closing. ':'A draft is saved locally. ')+(playtest.truncated?'Event limit reached; later events were omitted. ':'');d.append(status);
  if(!playtest.endedAt){
   const label=document.createElement('label');label.textContent=finishing?'What was confusing? Where did you get stuck? What worked well? (optional)':'Add a note about this moment (optional)';
   const note=document.createElement('textarea');note.rows=5;note.maxLength=4000;note.setAttribute('aria-label',label.textContent);label.append(note);d.append(label);
   first=button(finishing?'Finish and download report':'Save note and return',()=>{
    if(finishing){
     playtest.feedback={review:note.value.trim()};playtestRecord('finish',{score,completed:flags.complete});playtest.endedAt=new Date().toISOString();clearInterval(playtestTimer);playtestTimer=0;playtestPersist();
     if(!downloadPlaytest()){status.textContent='Download failed. Your report is retained; try Download report again.';updatePlaytestControls();return}
    }else if(note.value.trim())playtestRecord('note',{text:note.value.trim()});
    closePlaytest();updatePlaytestControls();if(mode==='complete')showPlaytest('complete');
   });
   if(!finishing)button('Finish playtest…',()=>{if(note.value.trim())playtestRecord('note',{text:note.value.trim()});closePlaytest();showPlaytest('finish')});
  }
  button('Download report',()=>{if(!downloadPlaytest())status.textContent='Download failed. Please try again; the report is still available.'});
  if(playtest.endedAt)button(mode==='complete'?'Play again':'Start a new recording',()=>{closePlaytest();if(mode==='complete')location.reload();else startPlaytest()});
  if(mode!=='complete')button('Delete local report',()=>{clearInterval(playtestTimer);playtestTimer=0;playtest=null;try{localStorage.removeItem(PLAYTEST_KEY)}catch{}closePlaytest();updatePlaytestControls()});
 }
 const backup=storedPlaytest(PLAYTEST_BACKUP_KEY);
 if(backup&&(!playtest||playtest.endedAt)&&backup.startedAt!==playtest?.startedAt)button('Recover earlier report',()=>{closePlaytest();playtest=backup;if(!playtest.endedAt)playtest.endedAt=new Date().toISOString();updatePlaytestControls();showPlaytest()});
 button(mode==='complete'?'Return to ending':'Return to game',closePlaytest);d.addEventListener('cancel',event=>{event.preventDefault();closePlaytest()});document.body.append(d);
 try{d.showModal();(first||d).focus();playtestTick()}catch{closePlaytest()}
}
const playtestControls=document.createElement('button');playtestControls.type='button';playtestControls.className='playtest-controls';playtestControls.addEventListener('click',()=>showPlaytest());(window.matchMedia('(hover: none) and (pointer: coarse)').matches?document.querySelector('.mobile-controls')||document.body:document.body).append(playtestControls);updatePlaytestControls();
// Hook central game functions, including actions invoked by menus and hotkeys.
const playtestSay=say;say=function(text){playtestRecord('response',{text:String(text)});return playtestSay(text)};
const playtestCommand=command;command=function(raw){
 if(!playtestDialog&&playing&&!popupOpen&&!menuOpen&&String(raw).trim()){
  playtestTick();playtestRecord('command',{text:String(raw).slice(0,4000)});
  const normalized=norm(raw);playtestRepeats=normalized===playtestLastCommand?playtestRepeats+1:1;playtestLastCommand=normalized;
  if(playtestRepeats===3)playtestRecord('possible_trouble',{reason:'Same command submitted three times consecutively; may be intentional',command:normalized});
 }
 if(playtestDialog)return;return playtestCommand(raw);
};
const playtestProgress=progress;progress=function(flag,text){const fresh=!flags[flag];const result=playtestProgress(flag,text);if(fresh){playtestLastMilestone=playtest?.activeMs||0;playtestStall=false;playtestRecord('milestone',{flag,score});if(flag==='complete')playtestRecord('completion',{score})}return result};
const playtestChangeRoom=changeRoom;changeRoom=function(...args){const before=room,result=playtestChangeRoom(...args);if(before!==room)playtestRecord('room_change',{from:before,to:room});return result};
const playtestSave=saveGame;saveGame=function(...args){playtestRecord('save_requested');return playtestSave(...args)};
const playtestRestore=applyAdventureSave;applyAdventureSave=function(...args){playtestRecord('restore_requested');const result=playtestRestore(...args);playtestRecord('restore_result',{success:result===true,score,flags:{...flags}});return result};
const playtestHiveRetry=retryHiveDisaster;retryHiveDisaster=function(...args){playtestRecord('retry',{cause:'hive'});return playtestHiveRetry(...args)};
const playtestDrownRetry=retryAfterDrowning;retryAfterDrowning=function(...args){playtestRecord('retry',{cause:'drowning'});return playtestDrownRetry(...args)};
window.addEventListener('error',event=>playtestRecord('javascript_error',{message:String(event.message||'Resource error').slice(0,2000),line:event.lineno,column:event.colno}));
window.addEventListener('unhandledrejection',event=>playtestRecord('javascript_error',{message:String(event.reason?.message||event.reason).slice(0,2000)}));
window.addEventListener('blur',()=>{playtestTick();playtestFocused=false;playtestTick();playtestPersist()});
window.addEventListener('focus',()=>{playtestTick();playtestFocused=true;playtestTick()});
document.addEventListener('visibilitychange',()=>{playtestTick();playtestPersist()});
window.addEventListener('pagehide',()=>{playtestTick();playtestRecord('page_exit');playtestPersist()});
const playtestDrown=drown;drown=function(...args){playtestRecord('death',{cause:'drowning'});return playtestDrown(...args)};
const playtestHiveDeath=finishHiveDisaster;finishHiveDisaster=function(...args){if(hiveDisaster)playtestRecord('death',{cause:'hive'});return playtestHiveDeath(...args)};

// Keep existing messages intact and pause close-up puzzles as well as walking.
const playtestCloseMessage=closeMessage;closeMessage=function(...args){if(playtestDialog)return;return playtestCloseMessage(...args)};
const playtestTickHive=tickHive;tickHive=function(...args){if(!playtestDialog)return playtestTickHive(...args)};
const playtestTickMill=tickMillSluice;tickMillSluice=function(...args){if(!playtestDialog)return playtestTickMill(...args)};
const playtestTickFall=tickBridgeFall;tickBridgeFall=function(...args){if(!playtestDialog)return playtestTickFall(...args)};
