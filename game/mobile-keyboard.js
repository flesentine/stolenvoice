// A readonly mobile parser keeps the OS keyboard (and its viewport pan) closed.
// Real keyboard events still edit the same command field and submit the same form.
function installMobileKeyboard(field,form,shell,canType,onSubmit){
 let symbols=false;
 const panel=document.createElement('div');panel.id='mobile-keyboard';panel.className='mobile-keyboard';
 panel.setAttribute('role','group');panel.setAttribute('aria-label','Game command keyboard');
 field.readOnly=true;field.inputMode='none';field.tabIndex=-1;field.setAttribute('aria-controls',panel.id);
 const completion=document.createElement('button');completion.type='button';completion.className='mobile-action-completion';completion.hidden=true;
 completion.setAttribute('aria-label','Complete action');completion.addEventListener('pointerdown',event=>event.preventDefault());
 completion.addEventListener('click',()=>edit(' '));shell.querySelector('.screen').append(completion);
 const refresh=()=>{
  const next=canType()?mobileActionCompletion(field.value,field.selectionStart??field.value.length,field.selectionEnd??field.value.length):null;
  if(completion.hidden!==!next)completion.hidden=!next;
  const label=next?'Space: '+next.word:'';if(completion.textContent!==label)completion.textContent=label;
  completion.setAttribute('aria-label',next?'Complete action '+next.word:'Complete action');
 };
 // Keep keyboard and game geometry constant; tapping the display never focuses
 // a native text field, which can pan Safari even when the field is readonly.
 const release=()=>field.blur();
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
 const key=(row,label,action,wide=false)=>{
  const button=document.createElement('button');button.type='button';button.textContent=label;
  if(wide)button.className='wide-key';
  button.setAttribute('aria-label',label==='<-'?'Backspace':label);
  // Keep the command caret when tapping a key; never summon the OS keyboard.
  button.addEventListener('pointerdown',event=>event.preventDefault());button.addEventListener('click',action);row.append(button);
 };
 const paint=()=>{
  panel.replaceChildren();
  const rows=symbols?['1234567890',"-/:;()&@'",'.,?!"']:['qwertyuiop','asdfghjkl','zxcvbnm'];
  rows.forEach((letters,index)=>{const row=document.createElement('div');row.className='keyboard-row';
   for(const letter of letters)key(row,letter.toUpperCase(),()=>edit(letter));
   if(index===2)key(row,'<-',()=>edit('Backspace'),true);panel.append(row);
  });
  const row=document.createElement('div');row.className='keyboard-row';
  key(row,symbols?'ABC':'123',()=>{symbols=!symbols;paint()});key(row,'Space',()=>edit(' '),true);
  key(row,'Enter',submit,true);key(row,'Clear',()=>{if(canType()){field.setSelectionRange(0,field.value.length);edit('')}});panel.append(row);
 };
 const submit=()=>{release();if(canType())form.requestSubmit();else document.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));onSubmit()};
 paint();shell.append(panel);
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
