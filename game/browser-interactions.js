// The page is a game surface: suppress browser editing/long-press chrome.
for(const type of ['copy','cut','paste','contextmenu','selectstart','dragstart']){
 document.addEventListener(type,event=>event.preventDefault(),true);
}
document.addEventListener('beforeinput',event=>{
 if(['insertFromPaste','insertFromDrop','deleteByCut'].includes(event.inputType))event.preventDefault();
},true);
document.addEventListener('keydown',event=>{
 if((event.ctrlKey||event.metaKey)&&!event.altKey&&!event.shiftKey&&['a','c','v','x'].includes(event.key.toLowerCase()))event.preventDefault();
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
