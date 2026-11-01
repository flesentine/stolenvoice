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
