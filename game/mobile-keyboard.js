// A readonly mobile parser keeps the OS keyboard (and its viewport pan) closed.
// Real keyboard events still edit the same command field and submit the same form.
function installMobileKeyboard(field,form,shell,canType,onSubmit){
 let symbols=false;
 const vocabulary=mobileKeyboardVocabulary(mobileActionWords,objectAliases,sceneryAliases);
 let touchKey=null,suppressTouchClick=false,backspaceHold=null,repeatDelay=0,repeatTimer=0;
 const stopBackspace=()=>{clearTimeout(repeatDelay);clearInterval(repeatTimer);repeatDelay=repeatTimer=0;if(backspaceHold)suppressTouchClick=true;backspaceHold=null};
 const panel=document.createElement('div');panel.id='mobile-keyboard';panel.className='mobile-keyboard';
 panel.setAttribute('role','group');panel.setAttribute('aria-label','Game command keyboard');
 field.readOnly=true;field.inputMode='none';field.tabIndex=-1;field.setAttribute('aria-controls',panel.id);
 const completion=document.createElement('button');completion.type='button';completion.className='mobile-action-completion';completion.hidden=true;
 completion.setAttribute('aria-label','Complete action');completion.addEventListener('pointerdown',event=>event.preventDefault());
 completion.addEventListener('click',()=>edit(' '));shell.querySelector('.screen').append(completion);
 const refresh=()=>{
  if(!canType())stopBackspace();
  const next=canType()?mobileActionCompletion(field.value,field.selectionStart??field.value.length,field.selectionEnd??field.value.length):null;
  if(completion.hidden!==!next)completion.hidden=!next;
  const label=next?'Space: '+next.word:'';if(completion.textContent!==label)completion.textContent=label;
  completion.setAttribute('aria-label',next?'Complete action '+next.word:'Complete action');
 };
 // Keep keyboard and game geometry constant; tapping the display never focuses
 // a native text field, which can pan Safari even when the field is readonly.
 const release=()=>{stopBackspace();field.blur()};
 field.addEventListener('pointerdown',event=>{event.preventDefault();release()});field.addEventListener('focus',release);
 const edit=(value)=>{
  if(!canType())return;
  let start=field.selectionStart??field.value.length,end=field.selectionEnd??start;
  if(value===' '){const next=mobileActionCompletion(field.value,start,end);if(next){start=next.start;end=next.end;value=next.word+' '}}
  if(value==='Backspace'){if(start===end)start=Math.max(0,start-1);value=''}
  const next=(field.value.slice(0,start)+value+field.value.slice(end)).slice(0,field.maxLength);
  field.value=next;const caret=Math.min(start+value.length,next.length);field.setSelectionRange(caret,caret);
  field.dispatchEvent(new Event('input',{bubbles:true}));
 };
 const key=(row,label,action,wide=false,letter='')=>{
  const button=document.createElement('button');button.type='button';button.textContent=label;
  if(letter)button.dataset.keyboardLetter=letter;
  if(wide)button.className='wide-key';
  button.setAttribute('aria-label',label==='<-'?'Backspace':label);
  // Keep the command caret when tapping a key; never summon the OS keyboard.
  button.addEventListener('pointerdown',event=>event.preventDefault());button.addEventListener('click',action);row.append(button);
 };
 const paint=()=>{
  stopBackspace();panel.replaceChildren();
  const rows=symbols?['1234567890',"-/:;()&@'",'.,?!"']:['qwertyuiop','asdfghjkl','zxcvbnm'];
  rows.forEach((letters,index)=>{const row=document.createElement('div');row.className='keyboard-row';
   for(const letter of letters)key(row,letter.toUpperCase(),()=>edit(letter),false,/^[a-z]$/.test(letter)?letter:'');
   if(index===2)key(row,'<-',()=>edit('Backspace'),true);panel.append(row);
  });
  const row=document.createElement('div');row.className='keyboard-row';
  key(row,symbols?'ABC':'123',()=>{symbols=!symbols;paint()});key(row,'Space',()=>edit(' '),true);
  key(row,'Enter',submit,true);key(row,'Clear',()=>{if(canType()){field.setSelectionRange(0,field.value.length);edit('')}});panel.append(row);
 };
 const submit=()=>{release();if(canType())form.requestSubmit();else document.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));onSubmit()};
 paint();shell.append(panel);
 // Resolve genuine finger taps centrally so a likely letter can also accept
 // the nearby key-well gap or the edge of an unlikely neighboring letter.
 panel.addEventListener('pointerdown',event=>{
  suppressTouchClick=false;
  if(event.pointerType!=='touch'||event.isPrimary===false||!canType())return;
  const native=event.target.closest('button');
  if(native?.getAttribute('aria-label')==='Backspace'){
   event.preventDefault();event.stopImmediatePropagation();stopBackspace();
   backspaceHold={id:event.pointerId,button:native};panel.setPointerCapture(event.pointerId);edit('Backspace');
   repeatDelay=setTimeout(()=>{repeatTimer=setInterval(()=>{if(!canType()||!backspaceHold){stopBackspace();return}edit('Backspace')},70)},360);
   return;
  }
  if(symbols||native&&!native.dataset.keyboardLetter)return;
  const buttons=[...panel.querySelectorAll('button')],keys=buttons.map((button,id)=>{
   const r=button.getBoundingClientRect();return{id,letter:button.dataset.keyboardLetter||'',left:r.left,right:r.right,top:r.top,bottom:r.bottom};
  });
  const likely=mobileNextLetters(field.value,vocabulary,field.selectionStart??field.value.length,field.selectionEnd??field.value.length,mobileActionWords);
  if(!Object.keys(likely).length)return; // Preserve the browser's ordinary tap behavior for unknown words.
  const selected=mobileLetterAtPoint(event.clientX,event.clientY,keys,likely);
  if(selected===null||!keys[selected].letter)return;
  event.preventDefault();event.stopImmediatePropagation();panel.setPointerCapture(event.pointerId);
  touchKey={id:event.pointerId,x:event.clientX,y:event.clientY,keys,likely};
 },true);
 panel.addEventListener('pointermove',event=>{
  if(event.pointerId!==backspaceHold?.id)return;
  const r=backspaceHold.button.getBoundingClientRect();
  if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)stopBackspace();
 },true);
 panel.addEventListener('pointerup',event=>{
  if(backspaceHold&&event.pointerId===backspaceHold.id){event.preventDefault();event.stopImmediatePropagation();stopBackspace();if(panel.hasPointerCapture(event.pointerId))panel.releasePointerCapture(event.pointerId);return}
  if(event.pointerId!==touchKey?.id)return;
  event.preventDefault();event.stopImmediatePropagation();const tap=touchKey;touchKey=null;suppressTouchClick=true;
  const selected=mobileLetterAtPoint(event.clientX,event.clientY,tap.keys,tap.likely);
  if(Math.hypot(event.clientX-tap.x,event.clientY-tap.y)<=14&&selected!==null&&tap.keys[selected].letter)edit(tap.keys[selected].letter);
  if(panel.hasPointerCapture(event.pointerId))panel.releasePointerCapture(event.pointerId);
 },true);
 panel.addEventListener('pointercancel',()=>{stopBackspace();touchKey=null;suppressTouchClick=true},true);
 panel.addEventListener('lostpointercapture',()=>{stopBackspace();if(touchKey)suppressTouchClick=true;touchKey=null},true);
 window.addEventListener('resize',()=>{stopBackspace();touchKey=null;suppressTouchClick=true});
 panel.addEventListener('click',event=>{
  if(suppressTouchClick&&event.detail>0){suppressTouchClick=false;event.preventDefault();event.stopImmediatePropagation()}
 },true);
 window.addEventListener('blur',stopBackspace);document.addEventListener('visibilitychange',()=>{if(document.hidden)stopBackspace()});
 document.addEventListener('keydown',event=>{
  if(!canType()||event.ctrlKey||event.metaKey||event.altKey||event.isComposing)return;
  if(event.key.length===1||['Backspace','Enter'].includes(event.key)){
   event.preventDefault();event.stopImmediatePropagation();
   if(event.key==='Enter')submit();else edit(event.key);
  }
 },true);
 field.addEventListener('input',refresh);form.addEventListener('submit',()=>{release();refresh()});refresh();
 return{release,refresh};
}
