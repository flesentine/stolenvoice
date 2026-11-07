// The page is a game surface: suppress browser editing/long-press chrome.
for(const type of ['copy','cut','paste','contextmenu','selectstart','dragstart']){
 document.addEventListener(type,event=>{if(!playtestDialog)event.preventDefault()},true);
}
document.addEventListener('beforeinput',event=>{
 if(playtestDialog)return;
 if(['insertFromPaste','insertFromDrop','deleteByCut'].includes(event.inputType))event.preventDefault();
},true);
document.addEventListener('keydown',event=>{
 if(playtestDialog)return;
 if((event.ctrlKey||event.metaKey)&&!event.altKey&&!event.shiftKey&&['a','c','v','x'].includes(event.key.toLowerCase()))event.preventDefault();
},true);
// In the mobile hive close-up, any free screen/letterbox tap is a reach,
// including the help/victory tap. Controls and typing remain separate.
document.addEventListener('click',event=>{
 if(!mobilePuzzleUI()||!hiveOpen||event.defaultPrevented||event.button>0)return;
 if(event.target?.closest?.('.mobile-controls,.mobile-keyboard,button,input,textarea,select,a'))return;
 event.preventDefault();event.stopImmediatePropagation();reachHive();
},true);
// The black letterboxing surrounding the game also acts as a popup backdrop.
// Keep controls and captured game gestures on their existing input paths.
document.addEventListener('click',event=>{
 if(!popupOpen||event.defaultPrevented||event.button>0)return;
 if(event.target?.closest?.('.screen,.mobile-controls,.mobile-keyboard,.hud,button,input,textarea,select,a'))return;
 const rect=c.getBoundingClientRect();
 if(event.clientX>=rect.left&&event.clientX<=rect.right&&event.clientY>=rect.top&&event.clientY<=rect.bottom)return;
 event.preventDefault();closeMessage();
});
