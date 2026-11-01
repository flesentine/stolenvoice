// Authored native-pixel swing, with the leaf behind the player.
let workshopDoorMotion=null,workshopDoorTimer=0,workshopDoorFocused=true;
function resetWorkshopDoor(){
 if(workshopDoorTimer)clearInterval(workshopDoorTimer);
 workshopDoorTimer=0;workshopDoorMotion=null;
}
function animateWorkshopDoor(open,message){
 resetWorkshopDoor();stopWalking();exitLatch=false;
 flags.workshopOpen=open;
 workshopDoorMotion={frame:open?0:8,open,message};
 if(open)playGameSound('workshopDoorOpen');
 const finish=()=>{if(!open)playGameSound('workshopDoorClose');resetWorkshopDoor();draw();say(message)};
 if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){finish();return}
 workshopDoorTimer=setInterval(()=>{
  if(room!==8||!playing){resetWorkshopDoor();return}
  if(document.hidden||!workshopDoorFocused||popupOpen||menuOpen)return;
  workshopDoorMotion.frame+=open?1:-1;
  if(workshopDoorMotion.frame===(open?8:0)){finish();return}
  draw();
 },100);draw();
}
window.addEventListener('blur',()=>{workshopDoorFocused=false});
window.addEventListener('focus',()=>{workshopDoorFocused=true});
function hasWorkshopKey(){return flags.workshopKey||flags.roseGiven}
function workshopDoorDescription(){return flags.workshopOpen?'The oak workshop door stands open on its iron hinges. A shadowed shelf and wooden floorboards are visible inside.':flags.workshopUnlocked?'The oak workshop door is closed, but its iron lock is undone.':'The workshop has a stout oak door with an iron lock beneath its ring handle. It is firmly shut.'}
function nearWorkshopDoor(){if(Math.hypot(player.x-64,player.y-152)>48){say('Walk closer to the workshop door first.');return false}return true}
function handleWorkshopIntent(text){
 if(room===0&&/^(?:(?:ask|beg) (?:the )?(?:man|gardener|merrin) (?:for|about) (?:the )?(?:workshop |shed |brass )?key|(?:take|get|steal) (?:the )?(?:workshop |shed |brass )?key)$/.test(text)){
  if(!nearObject('man'))return true;
  say(hasWorkshopKey()?'Merrin pats his empty belt and points to the key he has already given you.':'Merrin closes his hand over the key. He glances at his carefully tended flowers, then back at you. His expression is wary.');return true;
 }

 const door='(?:(?:the )?(?:workshop|potting shed|shed|left)(?: door)?|(?:the )?(?:oak |wooden )?door|(?:the )?lock)';
 const key='(?:(?:the |my )?(?:workshop |shed |brass |small )?key)';
 const action=text.match(new RegExp('^(open|unlock|close|shut|lock) '+door+'(?: (?:with|using) '+key+')?$'));
 const use=new RegExp('^(?:use|insert|put|turn) '+key+'(?: (?:in|into|on|to unlock) '+door+')?$').test(text);
 if(!action&&!use)return false;
 // Other doors retain their own local parser responses.
 if(room!==8)return false;
 if(!nearWorkshopDoor())return true;
 const verb=use?'use':action[1];
 if(['close','shut'].includes(verb)){
  if(!flags.workshopOpen){say('The workshop door is already closed.');return true}
  animateWorkshopDoor(false,'You pull the oak door shut. The lock remains undone.');return true;
 }
 if(verb==='lock'){
  if(flags.workshopOpen){say('The door must be closed before you can turn its lock.');return true}
  if(!hasWorkshopKey()){say('You have no key that fits the workshop lock.');return true}
  flags.workshopUnlocked=false;draw();say('You turn the key and lock the workshop door.');return true;
 }
 if(!flags.workshopUnlocked){
  if(!hasWorkshopKey()){say('The iron lock holds the door fast. The brass escutcheon is polished smooth by years of use.');return true}
  if(verb==='open'){say('The door is locked. Merrin\'s brass key looks as though it would fit.');return true}
  flags.workshopUnlocked=true;playGameSound('sluiceTurn');syncInventory();
 }
 if(verb==='unlock'){draw();say('Merrin\'s key turns with a firm click. The workshop door is unlocked.');return true}
 if(flags.workshopOpen){say('The workshop door is already open.');return true}
 animateWorkshopDoor(true,use?'You turn Merrin\'s key and push the oak door open.':'The oak door swings open, revealing Merrin\'s potting shed.');return true;
}
