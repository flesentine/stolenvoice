// Portable files contain game data only. The checksum detects accidental edits;
// it is not a signature, authentication mechanism or anti-cheat protection.
const SAVE_FILE_FORMAT='elara-and-the-stolen-voice-save',MAX_SAVE_FILE_BYTES=262144;
let saveFileDialog=null,saveFileBusy=false,saveFileRequest=0,saveFileInput=null,saveFileCancelButton=null;
function saveFileChecksum(text){let hash=2166136261;for(let n=0;n<text.length;n++)hash=Math.imul(hash^text.charCodeAt(n),16777619);return(hash>>>0).toString(16).padStart(8,'0')}
function decodeSaveFile(raw){
 if(typeof raw!=='string'||!raw.trim()||raw.length>MAX_SAVE_FILE_BYTES)throw Error('invalid save size');
 const data=JSON.parse(raw);
 if(data?.format===SAVE_FILE_FORMAT){
  if(data.formatVersion!==1||!data.payload||typeof data.checksum!=='string'||saveFileChecksum(JSON.stringify(data.payload))!==data.checksum)throw Error('invalid save file');
  return data.payload;
 }
 return data;
}
function portableSaveText(raw){
 validateAdventureSave(raw);
 const payload=decodeSaveFile(raw);
 return JSON.stringify({format:SAVE_FILE_FORMAT,formatVersion:1,createdAt:new Date().toISOString(),payload,checksum:saveFileChecksum(JSON.stringify(payload))},null,2)+'\n';
}
function readStoredSave(key){try{return localStorage.getItem(key)||''}catch{return''}}
function writeAdventureSave(raw){
 const stored=readStoredSave(SAVE_KEY),previous=memorySave&&memorySave!==raw?memorySave:stored;
 if(previous&&previous!==raw&&validAdventureSave(previous))memoryBackup=previous;
 memorySave=raw;
 try{
  // Preserve a valid previous checkpoint before replacing the primary slot.
  // If backup writing fails, leave the existing primary untouched.
  const backup=stored&&stored!==raw&&validAdventureSave(stored)?stored:memoryBackup;
  if(backup&&backup!==raw&&validAdventureSave(backup))localStorage.setItem(SAVE_BACKUP_KEY,backup);
  localStorage.setItem(SAVE_KEY,raw);return true;
 }catch{return false}
}
function downloadGameSave(){
 const raw=saveGame();if(!raw)return false;
 let url='',link;
 try{
  const file=portableSaveText(raw),blob=new Blob([file],{type:'application/json'});
  url=URL.createObjectURL(blob);link=document.createElement('a');link.href=url;
  link.download='elara-save-'+new Date().toISOString().replace(/[:.]/g,'-')+'.json';link.hidden=true;document.body.append(link);link.click();
  say('Your save file is ready to download. Keep it to restore your adventure after moving or updating the game.');return true;
 }catch{say('The download could not start. Your current quest is unchanged. Try Download save again.');return false}
 finally{if(link)link.remove();if(url)setTimeout(()=>URL.revokeObjectURL(url),30000)}
}
function importGameSave(raw){
 if(beeStingInProgress())return false;
 return applyAdventureSave(raw,'file');
}
function finishSaveFileRead(){
 saveFileBusy=false;if(saveFileInput)saveFileInput.remove();saveFileInput=null;
 if(saveFileCancelButton)saveFileCancelButton.remove();saveFileCancelButton=null;
}
function cancelSaveFile(){
 saveFileRequest++;finishSaveFileRead();
 say('No save file was opened. Your current quest is unchanged.');
}
function chooseGameSave(){
 finishSaveFileRead();const request=++saveFileRequest;saveFileBusy=true;
 const picker=document.createElement('input');saveFileInput=picker;picker.type='file';picker.accept='.json,.elara-save,application/json';picker.hidden=true;picker.setAttribute('aria-label','Open an Elara save file');document.body.append(picker);
 say('Choose an Elara save file. Your adventure is paused.');
 const cancel=document.createElement('button');saveFileCancelButton=cancel;cancel.type='button';cancel.className='save-file-cancel';cancel.textContent='Cancel file';cancel.addEventListener('click',cancelSaveFile);document.body.append(cancel);cancel.focus();
 picker.addEventListener('cancel',()=>{if(request===saveFileRequest)cancelSaveFile()},{once:true});
 picker.addEventListener('change',async()=>{
  if(request!==saveFileRequest)return;
  const file=picker.files?.[0];picker.remove();saveFileInput=null;
  if(!file){cancelSaveFile();return}
  try{
   if(file.size>MAX_SAVE_FILE_BYTES)throw Error('save file too large');
   const raw=await file.text();if(request!==saveFileRequest)return;
   finishSaveFileRead();importGameSave(raw);
  }catch{if(request===saveFileRequest){finishSaveFileRead();say('That save file could not be read. Your current quest and stored saves are unchanged.')}}
 },{once:true});
 try{picker.click()}catch{cancelSaveFile()}
}
function closeSaveFiles(){
 const dialog=saveFileDialog;if(!dialog)return;
 saveFileDialog=null;dialog.close();dialog.remove();closeMessage(false);c.focus();
}
function showSaveFiles(){
 if(!playing||popupOpen||menuOpen||beeStingInProgress()||hiveDisaster||bridgeFall||bellAction||swimState.active||millSluiceReleaseFrame>=0)return;
 stopWalking();say('Save adventure');
 const dialog=document.createElement('dialog');saveFileDialog=dialog;dialog.className='save-file-dialog';dialog.setAttribute('aria-labelledby','save-file-title');
 const title=document.createElement('h2');title.id='save-file-title';title.textContent='Save adventure';dialog.append(title);
 const help=document.createElement('p');help.textContent='Download a save file to keep your progress when moving or updating the game. F5 and F7 still quick-save and restore here.';dialog.append(help);
 let first;
 for(const [label,action]of [['Quick save',()=>saveGame()],['Download save',()=>downloadGameSave()],['Open save file',()=>chooseGameSave()],['Previous quick save',()=>restoreBackupGame()],['Cancel',()=>{}]]){
  const button=document.createElement('button');button.type='button';button.textContent=label;button.addEventListener('click',()=>{closeSaveFiles();action()});dialog.append(button);if(!first)first=button;
 }
 dialog.addEventListener('cancel',event=>{event.preventDefault();closeSaveFiles()});document.body.append(dialog);
 try{dialog.showModal();first.focus()}catch{closeSaveFiles();say('Type EXPORT SAVE to download a file, IMPORT SAVE to open one, or RECOVER SAVE to restore your previous quick save.')}
}
// Registered before the game's modal key handlers. Native dialog Tab/Enter
// behavior remains available without sending keys to the game underneath.
document.addEventListener('keydown',event=>{
 if(!saveFileDialog&&!saveFileBusy)return;
 event.stopImmediatePropagation();
 if(event.key==='Escape'){event.preventDefault();if(saveFileDialog)closeSaveFiles();else cancelSaveFile()}
 else if(saveFileBusy&&event.target!==saveFileCancelButton)event.preventDefault();
},true);
// Reading a file is asynchronous. Keep pointer input from dismissing the
// pause message or starting movement before the read finishes or is cancelled.
for(const type of ['pointerdown','click'])document.addEventListener(type,event=>{
 if(saveFileBusy&&event.target!==saveFileInput&&event.target!==saveFileCancelButton){event.preventDefault();event.stopImmediatePropagation()}
},true);
